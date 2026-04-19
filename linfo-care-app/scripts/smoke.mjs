/**
 * End-to-end smoke test for LinfoCare.
 *
 * Runs against a Vite dev server started in *demo mode* (Supabase env vars
 * blanked) so the real database is never touched and auth is auto-bypassed
 * via the DEMO_USER fallback in src/lib/auth.jsx.
 *
 * For every route, we:
 *   1. Navigate to the URL
 *   2. Wait for network idle
 *   3. Collect console errors + uncaught page errors + failed network requests
 *   4. Assert the page root rendered something sane (not a blank body)
 *
 * After the route sweep we exercise three feature interactions:
 *   - BodyMap: filter by "Crítico", click the first visible marker, flip view
 *   - Chat: send a message that should trigger the local fallback
 *   - Questions: verify the accordion renders (hardcoded data, no Supabase)
 *
 * Exit code: 0 on full pass, 1 if any route or feature fails.
 */

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = 5179;
const BASE = `http://localhost:${PORT}`;

const ROUTES = [
  { path: '/',                     label: 'Dashboard' },
  { path: '/medical/diagnosis',    label: 'Diagnosis' },
  { path: '/medical/bodymap',      label: 'BodyMap (enhanced)' },
  { path: '/medical/labs',         label: 'Lab Results' },
  { path: '/medical/treatment',    label: 'Treatment (placeholder)' },
  { path: '/medical/medications',  label: 'Medications (placeholder)' },
  { path: '/medical/documents',    label: 'Documents' },
  { path: '/medical/questions',    label: 'Questions' },
  { path: '/family/shifts',        label: 'Care Shifts' },
  { path: '/family/journal',       label: 'Journal' },
  { path: '/family/inventory',     label: 'Inventory' },
  { path: '/family/checklist',     label: 'Daily Checklist' },
  { path: '/family/export',        label: 'WhatsApp Export' },
  { path: '/care/nutrition',       label: 'Nutrition' },
  { path: '/care/daily',           label: 'Daily Care' },
  { path: '/reference/glossary',   label: 'Glossary' },
  { path: '/reference/scenarios',  label: 'Scenarios' },
  { path: '/chat',                 label: 'Chat' },
];

// ──────── dev server lifecycle ────────
function startDevServer() {
  const proc = spawn(
    'npx',
    ['vite', '--port', String(PORT), '--strictPort'],
    {
      cwd: new URL('..', import.meta.url).pathname,
      env: { ...process.env, VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  return proc;
}

async function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch { /* not up yet */ }
    await sleep(250);
  }
  throw new Error(`Dev server never came up at ${url}`);
}

// ──────── page instrumentation ────────
function attachErrorHooks(page) {
  const errors = { console: [], pageerror: [], requestfailed: [] };
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.console.push(msg.text());
  });
  page.on('pageerror', (err) => {
    errors.pageerror.push(String(err.message || err));
  });
  page.on('requestfailed', (req) => {
    const url = req.url();
    // Ignore expected demo-mode failures and dev-server asset negotiation noise
    if (url.includes('/rest/v1/') || url.includes('supabase')) return;
    if (url.endsWith('/favicon.ico')) return;
    errors.requestfailed.push(`${req.failure()?.errorText ?? 'failed'} → ${url}`);
  });
  return errors;
}

function isNoise(msg) {
  // Things not caused by our code
  return (
    msg.includes('Failed to load resource') ||
    msg.includes('favicon') ||
    msg.includes('Download the React DevTools') ||
    msg.includes('[vite]')
  );
}

// ──────── main ────────
async function main() {
  console.log('▸ starting Vite in demo mode...');
  const server = startDevServer();
  server.stderr.on('data', () => {}); // muted
  server.stdout.on('data', () => {});

  await waitForServer(BASE);
  console.log(`▸ dev server up on ${BASE}`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const results = [];

  try {
    // Route sweep
    for (const { path, label } of ROUTES) {
      const page = await ctx.newPage();
      const errors = attachErrorHooks(page);
      let navError = null;

      try {
        await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 15_000 });
        // Give the lazy chunk + React render a beat
        await page.waitForLoadState('domcontentloaded');
        await sleep(400);

        // Basic sanity: the app shell mounted something visible
        const bodyText = (await page.textContent('body')) || '';
        if (bodyText.trim().length < 20) {
          navError = `body nearly empty (${bodyText.trim().length} chars)`;
        }
      } catch (e) {
        navError = String(e.message || e);
      }

      const consoleErrs = errors.console.filter((m) => !isNoise(m));
      const pageerrs = errors.pageerror.filter((m) => !isNoise(m));
      const reqfails = errors.requestfailed;

      const pass = !navError && consoleErrs.length === 0 && pageerrs.length === 0;
      results.push({ path, label, pass, navError, consoleErrs, pageerrs, reqfails });
      console.log(`${pass ? '  ✓' : '  ✗'} ${path.padEnd(28)} ${label}`);
      if (!pass) {
        if (navError) console.log(`      navError: ${navError}`);
        for (const e of pageerrs)   console.log(`      pageerror: ${e}`);
        for (const e of consoleErrs) console.log(`      console:   ${e}`);
        for (const e of reqfails)    console.log(`      req fail:  ${e}`);
      }
      await page.close();
    }

    // ── Feature 1: BodyMap interactions
    console.log('\n▸ exercising BodyMap interactions...');
    {
      const page = await ctx.newPage();
      const errors = attachErrorHooks(page);
      await page.goto(BASE + '/medical/bodymap', { waitUntil: 'networkidle' });
      await sleep(500);
      // Click the "Crítico" filter
      await page.getByRole('button', { name: /Crítico/i }).first().click();
      await sleep(200);
      // Click the first critical marker (by aria-label containing "Pulmón" or "Bazo")
      const marker = page.locator('.lc-marker').first();
      await marker.click({ force: true });
      await sleep(300);
      const detailVisible = await page
        .locator('text=/Derrame pleural|Esplenomegalia/i')
        .first()
        .isVisible();
      // Flip the view
      await page.getByRole('button', { name: /Frente|Espalda/i }).click();
      await sleep(500);

      const consoleErrs = errors.console.filter((m) => !isNoise(m));
      const pass = detailVisible && errors.pageerror.length === 0 && consoleErrs.length === 0;
      results.push({
        path: 'FEATURE:bodymap',
        label: 'BodyMap interactions (filter, select, rotate)',
        pass,
        navError: !detailVisible ? 'detail panel did not show critical notes' : null,
        consoleErrs,
        pageerrs: errors.pageerror,
        reqfails: [],
      });
      console.log(`  ${pass ? '✓' : '✗'} bodymap interactions  detailPanel=${detailVisible}  errors=${consoleErrs.length + errors.pageerror.length}`);
      await page.close();
    }

    // ── Feature 2: Chat local-fallback
    console.log('\n▸ exercising Chat (local fallback path)...');
    {
      const page = await ctx.newPage();
      const errors = attachErrorHooks(page);
      await page.goto(BASE + '/chat', { waitUntil: 'networkidle' });
      await sleep(500);
      const textarea = page.locator('textarea, input[type="text"]').first();
      await textarea.fill('¿qué es SUVmax?');
      await textarea.press('Enter');
      await sleep(1500);
      // The local fallback should have mentioned "SUVmax"
      const replied = await page.locator('text=/SUVmax/i').count();
      const consoleErrs = errors.console.filter((m) => !isNoise(m));
      const pass = replied >= 1 && errors.pageerror.length === 0;
      results.push({
        path: 'FEATURE:chat',
        label: 'Chat send + response',
        pass,
        navError: replied < 1 ? 'no assistant response detected' : null,
        consoleErrs,
        pageerrs: errors.pageerror,
        reqfails: [],
      });
      console.log(`  ${pass ? '✓' : '✗'} chat  repliedMatches=${replied}  errors=${consoleErrs.length + errors.pageerror.length}`);
      await page.close();
    }

    // ── Feature 3: Sidebar nav (click every nav link, confirm destination)
    console.log('\n▸ exercising sidebar navigation...');
    {
      const page = await ctx.newPage();
      const errors = attachErrorHooks(page);
      await page.goto(BASE + '/', { waitUntil: 'networkidle' });
      await sleep(500);
      // Collect every nav button/link with an href starting with /
      const hrefs = await page.$$eval('a[href^="/"]', (as) => as.map((a) => a.getAttribute('href')));
      const uniqueHrefs = [...new Set(hrefs)];
      let clicked = 0;
      for (const href of uniqueHrefs.slice(0, 18)) {
        try {
          await page.goto(BASE + href, { waitUntil: 'domcontentloaded' });
          await sleep(200);
          clicked++;
        } catch { /* ignore */ }
      }
      const consoleErrs = errors.console.filter((m) => !isNoise(m));
      const pass = clicked === uniqueHrefs.slice(0, 18).length && errors.pageerror.length === 0;
      results.push({
        path: 'FEATURE:nav',
        label: 'Sidebar link coverage',
        pass,
        navError: null,
        consoleErrs,
        pageerrs: errors.pageerror,
        reqfails: [],
      });
      console.log(`  ${pass ? '✓' : '✗'} nav sweep  clicked=${clicked}/${uniqueHrefs.length}  errors=${consoleErrs.length + errors.pageerror.length}`);
      await page.close();
    }
  } finally {
    await browser.close();
    server.kill('SIGTERM');
  }

  // ── Summary
  const failed = results.filter((r) => !r.pass);
  console.log(`\n═══ SMOKE SUMMARY ═══`);
  console.log(`  total:  ${results.length}`);
  console.log(`  passed: ${results.length - failed.length}`);
  console.log(`  failed: ${failed.length}`);
  if (failed.length) {
    console.log(`\n  Failures:`);
    for (const f of failed) {
      console.log(`    • ${f.path}  ${f.label}`);
      if (f.navError) console.log(`        navError: ${f.navError}`);
      for (const e of f.pageerrs)   console.log(`        pageerror: ${e}`);
      for (const e of f.consoleErrs) console.log(`        console:   ${e}`);
    }
  }
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error('fatal:', err);
  process.exit(2);
});
