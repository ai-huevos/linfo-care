/**
 * Inspect the portal DOM structure — one-shot diagnostic to see what we're
 * actually working with before writing real scraping selectors.
 */
import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';

const CDP = 'http://localhost:9222';
const HOST = 'resultadosclinicadelcountry.atheneasoluciones.com';

const browser = await chromium.connectOverCDP(CDP);
let page = null;
for (const ctx of browser.contexts()) {
  for (const p of ctx.pages()) {
    if (p.url().includes(HOST)) { page = p; break; }
  }
  if (page) break;
}
if (!page) { console.error('no portal tab'); process.exit(2); }

console.log('URL:', page.url());
await page.bringToFront();

// Count tables, rows, kanban cards
const snapshot = await page.evaluate(() => {
  function textOf(el) { return (el.innerText || '').slice(0, 300); }
  return {
    title: document.title,
    url: location.href,
    tables: document.querySelectorAll('table').length,
    tbodyRows: document.querySelectorAll('table tbody tr').length,
    solicitudHeaders: [...document.querySelectorAll('*')].filter(el => /SOLICITUD DE LABORATORIO/.test(el.innerText || '')).length,
    verResumen: [...document.querySelectorAll('*')].filter(el => /Ver Resumen/.test(el.innerText || '') && el.children.length < 3).length,
    verInforme: [...document.querySelectorAll('a, button')].filter(el => /Ver Informe/.test(el.innerText || '')).length,
    bodySnippet: document.body.innerText.slice(0, 4000),
    firstTableHtml: document.querySelector('table')?.outerHTML?.slice(0, 4000),
    formsCount: document.querySelectorAll('form').length,
    links: [...document.querySelectorAll('a[href]')].map(a => ({ text: a.innerText.trim().slice(0,60), href: a.href })).slice(0, 50),
  };
});

console.log('\n=== snapshot ===');
console.log('tables:', snapshot.tables, 'rows:', snapshot.tbodyRows);
console.log('SOLICITUD headers:', snapshot.solicitudHeaders);
console.log('Ver Resumen:', snapshot.verResumen, 'Ver Informe:', snapshot.verInforme);
console.log('forms:', snapshot.formsCount);

await writeFile('/tmp/portal-snapshot.json', JSON.stringify(snapshot, null, 2));
console.log('\nfull snapshot → /tmp/portal-snapshot.json');
console.log('\nbody snippet (first 2000 chars):');
console.log(snapshot.bodySnippet.slice(0, 2000));

// Keep browser open — it's the user's Chrome.
