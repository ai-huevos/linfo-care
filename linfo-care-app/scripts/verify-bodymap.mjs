/**
 * Drive the body-map page headless and capture a screenshot so we can
 * confirm the glass container + updated zones render correctly.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const PORT = process.env.PORT || 5180;
const BASE = `http://localhost:${PORT}`;

await mkdir('/tmp/linfo-shots', { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 960 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e.message)));

await page.goto(`${BASE}/medical/bodymap`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Full page + just the stage area for glass-container evidence
await page.screenshot({ path: '/tmp/linfo-shots/bodymap-full.png', fullPage: true });
const stage = await page.locator('.lc-stage').first();
if (await stage.count()) {
  await stage.screenshot({ path: '/tmp/linfo-shots/bodymap-stage.png' });
}

// Click a critical marker and capture the detail panel
const critical = page.locator('.lc-filter-btn').filter({ hasText: /Crítico/i });
if (await critical.count()) {
  await critical.first().click();
  await page.waitForTimeout(400);
}
const firstMarker = page.locator('.lc-marker').first();
if (await firstMarker.count()) {
  await firstMarker.click({ force: true });
  await page.waitForTimeout(400);
  await page.screenshot({ path: '/tmp/linfo-shots/bodymap-critical-selected.png', fullPage: true });
}

// Count zones in list
const zoneRows = await page.locator('.lc-zone-row').count();
const zonesLabel = await page.locator('text=/Zonas · \\d+/i').first().innerText().catch(() => '');

// Check labs trend
await page.goto(`${BASE}/medical/labs`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: '/tmp/linfo-shots/labs.png', fullPage: true });
const labCards = await page.locator('svg').count();  // sparklines are SVGs

console.log(JSON.stringify({
  url_bodymap: `${BASE}/medical/bodymap`,
  url_labs: `${BASE}/medical/labs`,
  zones_listed: zoneRows,
  zones_label: zonesLabel,
  lab_svg_count: labCards,
  screenshots: [
    '/tmp/linfo-shots/bodymap-full.png',
    '/tmp/linfo-shots/bodymap-stage.png',
    '/tmp/linfo-shots/bodymap-critical-selected.png',
    '/tmp/linfo-shots/labs.png',
  ],
  errors,
}, null, 2));

await browser.close();
