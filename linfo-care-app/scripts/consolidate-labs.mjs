/**
 * Consolidate lab rows from portal-export.json + pdf-export.json into a single
 * authoritative file for the Supabase sync step.
 *
 * Precedence: portal > 1804 Histórico PDF > per-date lab PDFs.
 * Dedup key: (normalized_lab_name, result_date).
 *
 * Output: Research/consolidated-labs.json with rows matching the Supabase
 * lab_results schema: { lab_name, value, unit, normal_min, normal_max,
 * result_date, notes, source }.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');
const RESEARCH_DIR = join(REPO_ROOT, 'Research');

function log(...a) { console.log('[consolidate]', ...a); }

// ───────────── name normalization ─────────────

/**
 * Canonicalize a lab name so "Hemoglobina.", "HEMOGLOBINA", and "Hemoglobina "
 * all collapse to the same key.
 */
function normalizeKey(name) {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[\.\,\;\:]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Human-readable canonical form. Pick the cleanest variant across synonyms —
 * here we just title-case the input, preserving parenthetical acronyms.
 */
function prettyName(name) {
  const s = (name || '').trim().replace(/\s+/g, ' ').replace(/\.+$/, '');
  // If mostly lowercase → Title Case; keep fully-uppercase acronyms like LDH, VSG, PTT
  const isMostlyLower = /[a-z]/.test(s) && !/^[A-Z0-9 \(\)\-\./]+$/.test(s);
  if (!isMostlyLower) return s;
  return s.replace(/\w\S*/g, (w) => {
    if (/^(y|de|del|la|el|en|al|por|para|con|para)$/i.test(w)) return w.toLowerCase();
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  });
}

// ───────────── load ─────────────

async function loadJson(path, defaultValue) {
  try { return JSON.parse(await readFile(path, 'utf8')); }
  catch { return defaultValue; }
}

async function main() {
  const pdfData = await loadJson(join(RESEARCH_DIR, 'pdf-export.json'), { rows: [] });
  const portalData = await loadJson(join(RESEARCH_DIR, 'portal-export.json'), { historico: [], solicitudes: [] });

  const pdfRows = pdfData.rows || [];
  log(`pdf rows: ${pdfRows.length}`);
  log(`portal historico: ${(portalData.historico || []).length}, solicitudes: ${(portalData.solicitudes || []).length}`);

  // Precedence: source weight — higher wins
  function weight(row) {
    if (row._source === 'portal') return 100;
    if (row._source === 'pdf_historico') return 50;
    return 10; // per-date pdf
  }

  const byKey = new Map();
  const conflicts = [];

  function upsert(row) {
    // Drop rows with no numeric value — Supabase schema requires value NOT NULL
    if (row.value === null || row.value === undefined || !Number.isFinite(Number(row.value))) return;
    if (!row.result_date) return;
    if (!row.lab_name) return;

    const key = `${normalizeKey(row.lab_name)}|${row.result_date}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, row);
      return;
    }
    if (weight(row) > weight(existing)) {
      if (Math.abs(Number(existing.value) - Number(row.value)) > 0.01) {
        conflicts.push({ key, existing_value: existing.value, new_value: row.value, source_new: row._source, source_existing: existing._source });
      }
      byKey.set(key, row);
    } else if (weight(row) === weight(existing) && Math.abs(Number(existing.value) - Number(row.value)) > 0.01) {
      // Same weight, different values → log conflict, keep existing
      conflicts.push({ key, existing_value: existing.value, new_value: row.value, source_new: row._source, source_existing: existing._source });
    }
  }

  // 1. PDF rows — we only trust the 1804 Histórico output. The per-date lab
  // PDFs use a freeform layout that our regex can't parse reliably and they
  // produce noisy names like "Hemoglobina * 12.0 G/dl 12.3". The Histórico
  // already covers all 9 draws (Apr 6–18) so nothing is lost.
  for (const r of pdfRows) {
    const isHistorico = (r.source_pdf || '').startsWith('1804');
    if (!isHistorico) continue;
    upsert({
      lab_name: prettyName(r.lab_name),
      value: Number(r.value),
      unit: r.unit || null,
      normal_min: r.normal_min ?? null,
      normal_max: r.normal_max ?? null,
      result_date: r.result_date,
      notes: `[SYNC 2026-04-19] 1804 Histórico`,
      section: r.section || null,
      _source: 'pdf_historico',
    });
  }

  // 2. Portal historico rows (if any)
  for (const r of (portalData.historico || [])) {
    // Portal historico is raw cell arrays — try to extract name/value/unit
    const cells = r.cells || [];
    if (cells.length < 2) continue;
    const name = cells[0];
    const valueCell = cells.find((c) => /^-?\d+[\.,]?\d*$/.test(String(c).trim()));
    if (!name || !valueCell) continue;
    const value = Number(String(valueCell).replace(',', '.'));
    if (!Number.isFinite(value)) continue;
    upsert({
      lab_name: prettyName(name),
      value,
      unit: null,
      normal_min: null,
      normal_max: null,
      result_date: null, // unknown from raw cells alone — will drop
      notes: '[SYNC 2026-04-19] portal historico',
      _source: 'portal',
    });
  }

  const rows = [...byKey.values()].map((r) => ({
    lab_name: r.lab_name,
    value: r.value,
    unit: r.unit,
    normal_min: r.normal_min,
    normal_max: r.normal_max,
    result_date: r.result_date,
    notes: r.notes,
    section: r.section,
    source: r._source,
  }));

  rows.sort((a, b) => {
    if (a.lab_name !== b.lab_name) return a.lab_name.localeCompare(b.lab_name);
    return a.result_date.localeCompare(b.result_date);
  });

  // Some stats
  const byName = new Map();
  for (const r of rows) byName.set(r.lab_name, (byName.get(r.lab_name) || 0) + 1);
  const dates = [...new Set(rows.map((r) => r.result_date))].sort();

  log(`\n✓ consolidated ${rows.length} rows`);
  log(`  unique labs: ${byName.size}`);
  log(`  date range:  ${dates[0]} → ${dates[dates.length - 1]}`);
  log(`  conflicts:   ${conflicts.length}`);

  await writeFile(join(RESEARCH_DIR, 'consolidated-labs.json'), JSON.stringify({
    consolidated_at: new Date().toISOString(),
    total_rows: rows.length,
    unique_labs: byName.size,
    dates,
    conflicts,
    rows,
  }, null, 2));
  log(`\nwrote Research/consolidated-labs.json`);
}

main().catch((e) => { console.error('fatal:', e); process.exit(1); });
