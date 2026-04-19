/**
 * Extract lab + imaging data from every PDF in Research/.
 *
 * Produces:
 *   Research/pdf-export.json      → structured lab rows
 *   Research/imaging-export.json  → PET/escanografía/mielograma/radiografías findings
 *   Research/pdf-raw-text.json    → raw text per PDF (for debugging + LLM passes)
 *
 * Strategy:
 *   - `1804 Historico Laboratorio.pdf` uses the Clínica del Country "histórico"
 *     layout: section header, then for each test: TEST_NAME, then a stream of
 *     `value / yyyy/mm/dd` pairs, then optional range, then "Ver gráfica".
 *     We parse that with a dedicated state machine — it's the canonical source.
 *   - Individual laboratorio PDFs use a simpler one-per-date layout. Those we
 *     parse with a line regex that captures `<name> <value> <unit> <range>`.
 *   - Imaging PDFs (PET SCAN, radiografías, mielograma, patología, escanografía)
 *     are stored as `findings_text` blobs; we don't try to parse radiology prose.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFParse } from 'pdf-parse';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');
const RESEARCH_DIR = join(REPO_ROOT, 'Research');

function log(...a) { console.log('[pdf]', ...a); }

// ───────────── helpers ─────────────

const SECTION_NAMES = new Set([
  'HEMATOLOGIA', 'HEMATOLOGÍA',
  'COAGULACION', 'COAGULACIÓN',
  'QUIMICA', 'QUÍMICA', 'QUIMICA SANGUINEA', 'QUÍMICA SANGUÍNEA',
  'ESPECIALES',
  'URINARIO', 'ORINA', 'UROANALISIS', 'UROANÁLISIS',
  'MICROBIOLOGIA', 'MICROBIOLOGÍA',
  'INMUNOLOGIA', 'INMUNOLOGÍA',
  'SEROLOGIA', 'SEROLOGÍA',
  'ENDOCRINOLOGIA', 'ENDOCRINOLOGÍA',
  'HORMONAS',
  'GASES', 'GASES ARTERIALES',
  'ELECTROLITOS',
  'HEMOSTASIA',
  'OTROS',
]);

function isDate(s) {
  return /^\d{4}[\/\-]\d{2}[\/\-]\d{2}\.?$/.test(s.trim());
}
function parseDate(s) {
  const m = s.match(/(\d{4})[\/\-](\d{2})[\/\-](\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}
function isNumeric(s) {
  return /^[<>]?-?\d+[\.,]?\d*$/.test(s.trim());
}
function toNumber(s) {
  const cleaned = s.replace(/^[<>]/, '').replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
function isRangeLine(s) {
  // e.g. "23.9 - 33.2 Seg 23.9 - 33.2 Seg ..." or "200 - 400 mg/dL Ver gráfica"
  return /\d+[\.,]?\d*\s*[-–]\s*\d+[\.,]?\d*\s*[a-zA-Zµ%\/\^]/.test(s);
}
function parseRange(s) {
  const m = s.match(/(-?\d+[\.,]?\d*)\s*[-–]\s*(-?\d+[\.,]?\d*)\s*([a-zA-Zµ%\/\^\.\d ]{1,30})/);
  if (!m) return { min: null, max: null, unit: null };
  return {
    min: Number(m[1].replace(',', '.')),
    max: Number(m[2].replace(',', '.')),
    unit: m[3].trim().replace(/\s+/g, ' ').split(' ')[0] || null,
  };
}
function isPageMarker(s) {
  return /^--\s*\d+\s+of\s+\d+\s*--$/i.test(s.trim());
}

function isSectionHeader(s) {
  const t = s.trim();
  if (!t) return false;
  if (SECTION_NAMES.has(t.toUpperCase())) return true;
  return false;
}

// ───────────── 1804 Histórico parser ─────────────

/**
 * Parse a "Histórico Laboratorio" PDF text into lab rows.
 * Block structure:
 *   [section header]
 *   TEST_NAME (mixed case, first line of block)
 *   VALUE
 *   DATE
 *   VALUE
 *   DATE
 *   ...
 *   [RANGE line(s)]   ← optional
 *   Ver gráfica       ← optional (absent for qualitative tests)
 */
function parseHistoricoText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !isPageMarker(l));

  const rows = [];
  let section = null;
  let testName = null;
  let pendingValue = null;
  let blockRows = [];

  function flushBlock(rangeLine) {
    if (!testName || blockRows.length === 0) {
      testName = null;
      pendingValue = null;
      blockRows = [];
      return;
    }
    let unit = null, min = null, max = null;
    if (rangeLine) {
      const r = parseRange(rangeLine);
      unit = r.unit; min = r.min; max = r.max;
    }
    for (const r of blockRows) {
      rows.push({
        section,
        lab_name: testName,
        value: r.value,
        value_text: r.value_text,
        unit: unit || null,
        normal_min: min,
        normal_max: max,
        result_date: r.date,
        source_line: r.source_line,
      });
    }
    testName = null;
    pendingValue = null;
    blockRows = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isSectionHeader(line)) {
      flushBlock(null);
      section = line.trim();
      continue;
    }

    if (/^Ver\s+gr[áa]fica/i.test(line)) {
      // Some lines contain "<range> Ver gráfica"; extract range
      const rangePart = line.replace(/\s*Ver\s+gr[áa]fica.*/i, '');
      flushBlock(rangePart.trim() || null);
      continue;
    }

    if (isRangeLine(line) && pendingValue === null) {
      // Pure range line (no leading value pending) — attach to current block
      flushBlock(line);
      continue;
    }

    if (isDate(line)) {
      const d = parseDate(line);
      if (d && pendingValue !== null) {
        blockRows.push({
          value: pendingValue.num,
          value_text: pendingValue.text,
          date: d,
          source_line: `${pendingValue.text} @ ${d}`,
        });
        pendingValue = null;
      }
      continue;
    }

    if (isNumeric(line)) {
      pendingValue = { num: toNumber(line), text: line };
      continue;
    }

    // Qualitative value: any non-empty short line that's followed by a date
    const next = lines[i + 1];
    if (next && isDate(next) && line.length < 40 && pendingValue === null && testName !== null) {
      pendingValue = { num: null, text: line };
      continue;
    }

    // Otherwise: treat as a new test name. Flush previous, start new.
    flushBlock(null);
    testName = line;
  }
  flushBlock(null);

  // Drop obvious garbage: empty names, "Ver gráfica" leftovers, single words like dates
  return rows.filter((r) => {
    if (!r.lab_name) return false;
    if (/^\d+$/.test(r.lab_name)) return false;
    if (/^Ver\s+gr/i.test(r.lab_name)) return false;
    if (r.lab_name.length < 3) return false;
    if (r.value === null && !r.value_text) return false;
    if (!r.result_date) return false;
    return true;
  });
}

// ───────────── Per-date laboratorio PDF parser ─────────────

function filenameDate(name) {
  const m = name.match(/^(\d{2})(\d{2})/);
  return m ? `2026-${m[2]}-${m[1]}` : null;
}

function parseValueLine(line) {
  const s = line.replace(/\s+/g, ' ').trim();
  if (s.length < 6 || !/\d/.test(s)) return null;
  if (/^(resultado|valor|unidad|rango|referencia|paciente|edad|fecha|orden|solicit|página|informe|resumen|teléfono|dirección|autoriza|firma|pag\.)/i.test(s)) return null;

  const rangePat = /(-?\d+[\.,]?\d*)\s*[-–a]{1,2}\s*(-?\d+[\.,]?\d*)/;
  const rangeMatch = s.match(rangePat);
  let min = null, max = null, afterRangeIdx = s.length;
  if (rangeMatch) {
    min = Number(rangeMatch[1].replace(',', '.'));
    max = Number(rangeMatch[2].replace(',', '.'));
    afterRangeIdx = rangeMatch.index;
  }
  const before = s.slice(0, afterRangeIdx).trim();

  const valUnitPat = /(-?\d+[\.,]?\d*)\s*([a-zA-Zµ%\/\.\-\^]{0,15})\s*$/;
  const vm = before.match(valUnitPat);
  if (!vm) return null;
  const value = Number(vm[1].replace(',', '.'));
  if (!Number.isFinite(value)) return null;
  const unit = (vm[2] || '').trim() || null;
  const name = before.slice(0, vm.index).trim();
  if (!name || name.length < 3) return null;
  if (/^\d+$/.test(name)) return null;
  if (/\b(teléfono|celular|fecha|nacimiento|orden|solicit|pag\.)\b/i.test(name)) return null;

  return {
    lab_name: name.replace(/[:;]+$/, '').trim(),
    value,
    unit,
    normal_min: Number.isFinite(min) ? min : null,
    normal_max: Number.isFinite(max) ? max : null,
  };
}

function parsePerDateLab(rawText, defaultDate) {
  const lines = rawText.split(/\r?\n/);
  const rows = [];
  let currentDate = defaultDate;
  for (const line of lines) {
    const dHit = line.match(/fecha[^:]*:\s*(.+)/i) || line.match(/\b(\d{4}-\d{2}-\d{2})\b/);
    if (dHit) {
      const parsed = dHit[1] ? parseDate(dHit[1]) || dHit[1] : null;
      if (parsed && /^\d{4}-\d{2}-\d{2}$/.test(parsed)) currentDate = parsed;
    }
    const parsed = parseValueLine(line);
    if (parsed) rows.push({ ...parsed, result_date: currentDate, source_line: line.trim() });
  }
  return rows;
}

// ───────────── main ─────────────

async function main() {
  const files = (await readdir(RESEARCH_DIR))
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .sort();

  log(`${files.length} PDFs in ${RESEARCH_DIR}`);

  const labRows = [];
  const imaging = [];
  const rawTexts = {};

  for (const f of files) {
    const full = join(RESEARCH_DIR, f);
    let buf;
    try { buf = await readFile(full); }
    catch (e) { console.error('skip', f, e.message); continue; }

    let text = '';
    let parser;
    try {
      parser = new PDFParse({ data: new Uint8Array(buf) });
      const result = await parser.getText();
      text = result.text || (result.pages || []).map((p) => p.text).join('\n');
    } catch (e) { console.error('parse-fail', f, e.message); continue; }
    finally { try { await parser?.destroy(); } catch {} }

    rawTexts[f] = text;

    const isImaging =
      /PET SCAN|ESCANOGRAFIA|RADIOGRAFIA|MIELOGRAMA|PATOLOGIA/i.test(f) ||
      /PATOLOG[ÍI]A|IMAGENOLOG[ÍI]A|PET\/CT/i.test(text.slice(0, 1000));

    if (isImaging) {
      imaging.push({
        file: f,
        date: filenameDate(f),
        findings_text: text.trim(),
      });
      log(`  imaging: ${f} (${text.length} chars)`);
      continue;
    }

    const isHistorico = /Histor/i.test(f) || /Ver gr[áa]fica/i.test(text);
    let rows = [];
    if (isHistorico) {
      rows = parseHistoricoText(text).map((r) => ({ ...r, source_pdf: f }));
      log(`  histórico: ${f} → ${rows.length} rows`);
    } else {
      rows = parsePerDateLab(text, filenameDate(f)).map((r) => ({ ...r, source_pdf: f }));
      log(`  labs:     ${f} → ${rows.length} rows`);
    }

    for (const r of rows) labRows.push(r);
  }

  await writeFile(join(RESEARCH_DIR, 'pdf-export.json'), JSON.stringify({
    extracted_at: new Date().toISOString(),
    total_rows: labRows.length,
    rows: labRows,
  }, null, 2));

  await writeFile(join(RESEARCH_DIR, 'imaging-export.json'), JSON.stringify({
    extracted_at: new Date().toISOString(),
    reports: imaging,
  }, null, 2));

  await writeFile(join(RESEARCH_DIR, 'pdf-raw-text.json'), JSON.stringify(rawTexts, null, 2));

  log(`\n✓ pdf-export.json: ${labRows.length} rows`);
  log(`✓ imaging-export.json: ${imaging.length} reports`);
}

main().catch((e) => { console.error('fatal:', e); process.exit(1); });
