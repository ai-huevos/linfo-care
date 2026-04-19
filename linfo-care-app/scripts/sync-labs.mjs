/**
 * Sync consolidated lab rows into Supabase `lab_results`.
 *
 * Strategy:
 *   1. Try SUPABASE_SERVICE_ROLE_KEY (bypasses RLS) — preferred.
 *   2. Else try VITE_SUPABASE_ANON_KEY (works only if RLS allows anon writes
 *      — unlikely for this schema, but we probe).
 *   3. On any auth failure, write `Research/sync-labs.sql` — a ready-to-paste
 *      UPSERT that the user can run in the Supabase SQL editor.
 *
 * Matching: (patient_id, lab_name, result_date). We do NOT delete existing
 * rows — insert missing ones, update values/unit/range/notes on matches.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as dotenvConfig } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');
const APP_ROOT = resolve(__dirname, '..');
const RESEARCH_DIR = join(REPO_ROOT, 'Research');

dotenvConfig({ path: join(APP_ROOT, '.env.local') });
dotenvConfig({ path: join(APP_ROOT, '.env') });

const URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

function log(...a) { console.log('[sync]', ...a); }

function sqlString(s) {
  if (s === null || s === undefined) return 'NULL';
  return "'" + String(s).replace(/'/g, "''") + "'";
}
function sqlNum(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return 'NULL';
  return String(n);
}

async function writeSqlFile(rows) {
  const outPath = join(RESEARCH_DIR, 'sync-labs.sql');
  const lines = [];
  lines.push('-- Auto-generated lab_results sync (merge/upsert).');
  lines.push('-- Paste into Supabase SQL editor for project uzizsrlpxrzkvcjjclro.');
  lines.push('-- Matches on (patient_id, lab_name, result_date): updates value/unit/range/notes on conflict.');
  lines.push('');
  lines.push("DO $$");
  lines.push("DECLARE pid uuid;");
  lines.push("BEGIN");
  lines.push("  SELECT id INTO pid FROM patients WHERE full_name ILIKE '%Rodrigo%' OR nickname ILIKE '%roro%' LIMIT 1;");
  lines.push("  IF pid IS NULL THEN RAISE EXCEPTION 'Roro patient row not found'; END IF;");
  lines.push('');
  for (const r of rows) {
    lines.push(
      `  INSERT INTO lab_results (patient_id, lab_name, value, unit, normal_min, normal_max, result_date, notes) ` +
      `VALUES (pid, ${sqlString(r.lab_name)}, ${sqlNum(r.value)}, ${sqlString(r.unit)}, ${sqlNum(r.normal_min)}, ${sqlNum(r.normal_max)}, ${sqlString(r.result_date)}, ${sqlString(r.notes)})` +
      ` ON CONFLICT ON CONSTRAINT lab_results_patient_lab_date_uk DO UPDATE SET ` +
      `value = EXCLUDED.value, unit = EXCLUDED.unit, normal_min = EXCLUDED.normal_min, normal_max = EXCLUDED.normal_max, notes = EXCLUDED.notes;`
    );
  }
  lines.push('');
  lines.push("END $$;");

  // Also emit an ALTER TABLE that adds the unique constraint if missing,
  // at the top. Idempotent.
  const unique = [
    "-- Ensure the (patient_id, lab_name, result_date) unique constraint exists",
    "DO $$ BEGIN",
    "  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lab_results_patient_lab_date_uk') THEN",
    "    ALTER TABLE lab_results ADD CONSTRAINT lab_results_patient_lab_date_uk UNIQUE (patient_id, lab_name, result_date);",
    "  END IF;",
    "END $$;",
    "",
  ];

  const final = [unique.join('\n'), lines.join('\n')].join('\n');
  await writeFile(outPath, final);
  return outPath;
}

async function ensureUniqueConstraint(sb) {
  // Use RPC if possible. Simpler: try an upsert; if it fails we'll fall back.
  // We can probe with a SELECT on pg_constraint via rpc, but not everywhere
  // has rpc set up. Skip — we'll rely on manual insert with server-side
  // conflict handling done row-by-row.
  return true;
}

async function findPatient(sb) {
  const { data, error } = await sb.from('patients').select('id, full_name, nickname').limit(50);
  if (error) throw new Error(`patients select: ${error.message}`);
  const match = (data || []).find((p) =>
    /rodrigo/i.test(p.full_name || '') || /roro/i.test(p.nickname || ''),
  ) || (data || [])[0];
  if (!match) throw new Error('no patient row found');
  return match;
}

async function supabaseSync(rows) {
  if (!URL) throw new Error('missing VITE_SUPABASE_URL');
  const key = SERVICE_KEY || ANON_KEY;
  if (!key) throw new Error('missing Supabase key');

  const sb = createClient(URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const patient = await findPatient(sb);
  log(`patient: ${patient.full_name} (${patient.id})`);

  // Read existing lab_results for this patient so we can decide insert vs update
  const { data: existing, error: selErr } = await sb
    .from('lab_results')
    .select('id, lab_name, result_date, value, unit, normal_min, normal_max, notes')
    .eq('patient_id', patient.id);
  if (selErr) throw new Error(`select existing: ${selErr.message}`);
  log(`existing rows: ${existing.length}`);

  const keyOf = (r) => `${String(r.lab_name).toLowerCase().trim()}|${r.result_date}`;
  const existingMap = new Map();
  for (const r of existing) existingMap.set(keyOf(r), r);

  let inserted = 0, updated = 0, skipped = 0, errors = 0;

  for (const r of rows) {
    const k = keyOf(r);
    const existingRow = existingMap.get(k);
    const payload = {
      patient_id: patient.id,
      lab_name: r.lab_name,
      value: r.value,
      unit: r.unit,
      normal_min: r.normal_min,
      normal_max: r.normal_max,
      result_date: r.result_date,
      notes: r.notes,
    };

    if (!existingRow) {
      const { error } = await sb.from('lab_results').insert(payload);
      if (error) { errors++; console.error('  insert err', r.lab_name, r.result_date, '→', error.message); }
      else inserted++;
      continue;
    }

    // Decide whether to update
    const differs =
      Number(existingRow.value) !== Number(r.value) ||
      (existingRow.unit || '') !== (r.unit || '') ||
      (existingRow.normal_min ?? null) !== (r.normal_min ?? null) ||
      (existingRow.normal_max ?? null) !== (r.normal_max ?? null);

    if (!differs) { skipped++; continue; }
    const { error } = await sb.from('lab_results').update(payload).eq('id', existingRow.id);
    if (error) { errors++; console.error('  update err', r.lab_name, r.result_date, '→', error.message); }
    else updated++;
  }

  return { inserted, updated, skipped, errors };
}

async function main() {
  const input = JSON.parse(await readFile(join(RESEARCH_DIR, 'consolidated-labs.json'), 'utf8'));
  const rows = input.rows;
  log(`${rows.length} rows to sync`);

  // Always generate the SQL file so it's available as a manual fallback.
  const sqlPath = await writeSqlFile(rows);
  log(`wrote ${sqlPath} (fallback for manual SQL-editor run)`);

  if (!SERVICE_KEY) {
    log('SUPABASE_SERVICE_ROLE_KEY not set — trying anon key (RLS may block it).');
  }

  try {
    const stats = await supabaseSync(rows);
    log(`\n✓ sync complete`);
    log(`  inserted: ${stats.inserted}`);
    log(`  updated:  ${stats.updated}`);
    log(`  skipped:  ${stats.skipped}`);
    log(`  errors:   ${stats.errors}`);
  } catch (e) {
    console.error('sync failed:', e.message);
    log('Falling back to SQL file.');
    const path = await writeSqlFile(rows);
    log(`✓ wrote ${path}`);
    process.exit(1);
  }
}

main().catch((e) => { console.error('fatal:', e); process.exit(1); });
