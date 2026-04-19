/**
 * Portal scraper for Clínica del Country / Clínica La Colina.
 *
 * Reuses the user's already-logged-in Chrome session via CDP (user launched
 * Chrome with `--remote-debugging-port=9222`). No password handling, no 2FA.
 *
 * What it collects:
 *   1. The three Solicitudes Kanban columns (queued / verifying / ready).
 *      For each order card it records order number, date, status, and — when
 *      available — the inline "Ver Resumen" summary (test codes + names).
 *   2. Every row in "Histórico Laboratorio" (the big historical table).
 *      For each row we save: order number, date, test code, test name,
 *      specimen/notes, and when a PDF report is linked we download it into
 *      Research/portal-pdfs/<orderNumber>.pdf.
 *
 * Output: Research/portal-export.json with a flat list of { order_number,
 * result_date, status, lab_name, lab_code, summary, pdf_path } rows.
 *
 * Run:
 *   1. Launch Chrome with:
 *        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
 *          --remote-debugging-port=9222
 *      Log into the portal in that Chrome session.
 *   2. node linfo-care-app/scripts/scrape-portal.mjs
 */

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');
const RESEARCH_DIR = join(REPO_ROOT, 'Research');
const PDF_DIR = join(RESEARCH_DIR, 'portal-pdfs');
const OUT_JSON = join(RESEARCH_DIR, 'portal-export.json');

const CDP_URL = 'http://localhost:9222';
const PORTAL_HOST = 'resultadosclinicadelcountry.atheneasoluciones.com';

function log(...args) {
  console.log('[scrape]', ...args);
}

async function findPortalPage(browser) {
  const contexts = browser.contexts();
  if (contexts.length === 0) throw new Error('No Chrome contexts found over CDP');
  for (const ctx of contexts) {
    for (const page of ctx.pages()) {
      if (page.url().includes(PORTAL_HOST)) return { ctx, page };
    }
  }
  // No tab on portal — open a new one in the default context and let the user navigate.
  const ctx = contexts[0];
  const page = await ctx.newPage();
  await page.goto(`https://${PORTAL_HOST}/Resultados/ConsultaPaciente`);
  log('Opened a new tab on the portal. If a login page appears, complete it, then re-run.');
  return { ctx, page };
}

/** Kanban columns on /Resultados/ConsultaPaciente (the Solicitudes page). */
async function scrapeSolicitudes(page) {
  log('scraping Solicitudes kanban...');
  await page.waitForSelector('h3, h4, h5', { timeout: 10_000 }).catch(() => {});

  const rows = await page.evaluate(() => {
    function textOf(el) { return (el?.innerText || '').trim(); }
    // Each solicitud card has "SOLICITUD DE LABORATORIO" header, a date, a number, and optional Ver Resumen body.
    const cards = Array.from(document.querySelectorAll('*')).filter((el) => {
      const t = el.innerText || '';
      return t.startsWith('SOLICITUD DE LABORATORIO') && el.children.length < 20 && t.length < 4000;
    });
    const out = [];
    for (const card of cards) {
      const cardText = textOf(card);
      // Find column parent: walk up until we find a sibling with "Estamos trabajando|Verificando calidad|Estan listos"
      let status = 'unknown';
      let walker = card.parentElement;
      for (let i = 0; i < 10 && walker; i++, walker = walker.parentElement) {
        const headText = walker.innerText || '';
        if (/Estamos trabajando en esto/i.test(headText)) { status = 'in_progress'; break; }
        if (/Verificando calidad de estos resultados/i.test(headText)) { status = 'verifying'; break; }
        if (/Estan listos estos resultados/i.test(headText)) { status = 'ready'; break; }
      }
      const dateMatch = cardText.match(/(lun|mar|mié|jue|vie|sáb|dom)\.?\s*\d{1,2}\s*(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\.?\s*\d{4}(?:\s*\d{1,2}:\d{2}\s*(?:a\.?\s*m\.?|p\.?\s*m\.?))?/i);
      const numMatch = cardText.match(/Numero:\s*(\d+)/i);
      const summaryBlock = cardText.split('Ver Resumen').slice(1).join('\n');
      out.push({
        status,
        raw_date: dateMatch ? dateMatch[0] : null,
        order_number: numMatch ? numMatch[1] : null,
        summary_raw: summaryBlock.trim() || null,
      });
    }
    // Dedup by order_number
    const seen = new Set();
    return out.filter((r) => {
      if (!r.order_number) return false;
      if (seen.has(r.order_number)) return false;
      seen.add(r.order_number);
      return true;
    });
  });

  log(`  ${rows.length} solicitudes cards`);
  return rows;
}

/** Expand every "Ver Resumen" toggle on the current page so summaries become readable. */
async function expandAllSummaries(page) {
  const toggles = await page.locator('text=/Ver Resumen/i').all();
  let n = 0;
  for (const t of toggles) {
    try { await t.click({ timeout: 1500 }); n++; } catch { /* already open or not clickable */ }
  }
  if (n) await page.waitForTimeout(400);
  return n;
}

/** Scrape the Histórico Laboratorio table. */
async function scrapeHistorico(page) {
  log('navigating to Histórico Laboratorio...');
  const link = page.locator('a:has-text("Historico"), a:has-text("Histórico")').first();
  if (await link.count()) {
    await link.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);
  } else {
    // Try direct URL
    await page.goto(`https://${PORTAL_HOST}/Resultados/HistoricoLaboratorio`).catch(() => {});
    await page.waitForTimeout(1200);
  }

  // Expand any summaries, scroll to bottom to trigger lazy loads
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 2500);
    await page.waitForTimeout(300);
  }
  await expandAllSummaries(page);
  await page.waitForTimeout(500);

  const rows = await page.evaluate(() => {
    function textOf(el) { return (el?.innerText || '').trim(); }

    // Heuristic: find the first large table on the page
    const tables = Array.from(document.querySelectorAll('table'));
    const all = [];
    for (const t of tables) {
      const trs = Array.from(t.querySelectorAll('tbody tr'));
      for (const tr of trs) {
        const tds = Array.from(tr.querySelectorAll('td'));
        if (tds.length < 2) continue;
        const cells = tds.map(textOf);
        all.push({
          cells,
          raw_html: tr.outerHTML.slice(0, 2000),
        });
      }
    }
    return all;
  });

  log(`  ${rows.length} historico rows captured`);
  return rows;
}

/** Attempt to download every "Ver Informe" PDF link visible on the page. */
async function downloadInformePdfs(page, ctx) {
  log('looking for "Ver Informe" links...');
  const links = await page.locator('a:has-text("Ver Informe"), button:has-text("Ver Informe")').all();
  log(`  ${links.length} informe buttons found`);
  const downloaded = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    // Try intercepting the pdf as a new-tab navigation or direct download
    try {
      const [popup] = await Promise.all([
        ctx.waitForEvent('page', { timeout: 5000 }).catch(() => null),
        link.click({ timeout: 2000 }),
      ]);
      if (popup) {
        // Wait for the URL to stabilize
        await popup.waitForLoadState('domcontentloaded').catch(() => {});
        const url = popup.url();
        if (url && /\.pdf|Informe|Report/i.test(url)) {
          const resp = await ctx.request.get(url);
          if (resp.ok()) {
            const body = await resp.body();
            const name = `informe-${i + 1}.pdf`;
            const dest = join(PDF_DIR, name);
            await writeFile(dest, body);
            downloaded.push({ url, path: dest });
          }
        }
        await popup.close().catch(() => {});
      }
    } catch (e) {
      // ignore and move on
    }
  }
  log(`  ${downloaded.length} PDFs saved to ${PDF_DIR}`);
  return downloaded;
}

async function main() {
  await mkdir(RESEARCH_DIR, { recursive: true });
  await mkdir(PDF_DIR, { recursive: true });

  log(`connecting to Chrome over CDP at ${CDP_URL}...`);
  let browser;
  try {
    browser = await chromium.connectOverCDP(CDP_URL);
  } catch (e) {
    console.error('\nFailed to connect to Chrome DevTools Protocol.');
    console.error('Please launch Chrome with:');
    console.error('  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9222');
    console.error('Log into the portal, then re-run this script.');
    process.exit(2);
  }

  const { ctx, page } = await findPortalPage(browser);
  log(`using page: ${page.url()}`);

  // Bring it to front so UI interactions work
  await page.bringToFront();

  // If we landed on the login page, the user's CDP-connected Chrome doesn't
  // have an active portal session. Give them 90s to log in manually.
  if (/\/Account\/Login/i.test(page.url())) {
    log('⚠ the portal requires login in this Chrome instance.');
    log('  please log in to the portal in the now-visible tab; waiting up to 90s...');
    try {
      await page.waitForURL((u) => !/\/Account\/Login/i.test(String(u)), { timeout: 90_000 });
      log('✓ logged in');
      await page.waitForTimeout(1200);
    } catch {
      log('✗ still not logged in — writing empty export, PDFs will be used as fallback.');
      await writeFile(OUT_JSON, JSON.stringify({
        scraped_at: new Date().toISOString(),
        portal: PORTAL_HOST,
        error: 'not logged in',
        solicitudes: [], historico: [], pdfs: [],
      }, null, 2));
      process.exit(0);
    }
  }

  let solicitudes = [];
  try { solicitudes = await scrapeSolicitudes(page); }
  catch (e) { console.error('solicitudes scrape failed:', e.message); }

  let historico = [];
  try { historico = await scrapeHistorico(page); }
  catch (e) { console.error('historico scrape failed:', e.message); }

  let pdfs = [];
  try { pdfs = await downloadInformePdfs(page, ctx); }
  catch (e) { console.error('pdf download failed:', e.message); }

  const output = {
    scraped_at: new Date().toISOString(),
    portal: PORTAL_HOST,
    patient: 'Rodrigo Cardona Moreno (CC 8277965)',
    solicitudes,
    historico,
    pdfs,
  };

  await writeFile(OUT_JSON, JSON.stringify(output, null, 2));
  log(`\n✓ wrote ${OUT_JSON}`);
  log(`  solicitudes: ${solicitudes.length}`);
  log(`  historico rows: ${historico.length}`);
  log(`  pdfs: ${pdfs.length}`);

  // Don't close the browser — it's the user's Chrome session.
}

main().catch((err) => {
  console.error('fatal:', err);
  process.exit(1);
});
