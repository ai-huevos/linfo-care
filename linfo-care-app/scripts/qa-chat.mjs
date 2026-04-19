/**
 * QA harness for the Doctora Lío chatbot.
 *
 * Runs a battery of realistic Spanish medical queries through the exact
 * Vercel AI Gateway call the production handler (api/chat.js) uses.
 * Loads VERCEL_OIDC_TOKEN from the repo-root .env.local so calls are
 * authenticated just like they are in production.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { streamText } from 'ai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

// Load .env.local into process.env
const envPath = path.join(repoRoot, '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)="?([^"]*)"?$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
if (!process.env.VERCEL_OIDC_TOKEN) {
  console.error('VERCEL_OIDC_TOKEN missing from .env.local — run `vercel env pull` at repo root');
  process.exit(2);
}

const SYSTEM_PROMPT = `You are "Doctora Lío", a medical document translator, clinical summarizer, and family-care navigator for a Spanish-speaking family caring for an older adult (Rodrigo "Roro" Cardona, 78 years old) with diffuse large B-cell lymphoma (DLBCL). ALWAYS respond in Spanish. You are warm, compassionate, precise, and practical. Never invent facts. Do not give definitive medical advice. Patient context: DLBCL Stage IV, SUVmax 26.7, LDH 2010→1680, pleural effusion, chest tube, R-CHOP pending.`;

const QUERIES = [
  // Category A — Medical term explanation
  { id: 'A1', category: 'Clinical term', q: '¿Qué es SUVmax y por qué 26.7 es alto?',
    expect: /SUV|activ|tumor|linfoma/i, mustBeSpanish: true },
  { id: 'A2', category: 'Clinical term', q: 'Explícame qué es R-CHOP y por qué podrían usar R-mini-CHOP para Roro',
    expect: /R-?CHOP|doxo|rituximab|edad/i, mustBeSpanish: true },
  { id: 'A3', category: 'Clinical term', q: '¿Qué significa Estadio IV en linfoma?',
    expect: /estadio|etapa|\bIV\b|4|órgano/i, mustBeSpanish: true },

  // Category B — Lab interpretation
  { id: 'B1', category: 'Lab interpretation', q: 'La LDH de Roro bajó de 2010 a 1680 ¿es buena señal?',
    expect: /LDH|baj|respond|mejor|señal/i, mustBeSpanish: true },
  { id: 'B2', category: 'Lab interpretation', q: '¿Qué riesgos hay si las plaquetas bajan de 50 mil?',
    expect: /plaqueta|sangr|hemorra|transfusi/i, mustBeSpanish: true },

  // Category C — Family care instructions
  { id: 'C1', category: 'Care instruction', q: '¿Cómo preparo el enjuague bucal con bicarbonato y cada cuánto?',
    expect: /bicarbonato|agua|enjuagu|veces|día/i, mustBeSpanish: true },
  { id: 'C2', category: 'Care instruction', q: 'Roro no tiene apetito, ¿qué comida blanda le puedo ofrecer?',
    expect: /blan|sopa|pure|alimentaci|apetito/i, mustBeSpanish: true },

  // Category D — Red flags / safety
  { id: 'D1', category: 'Safety', q: 'Roro tiene fiebre de 38.5°C esta noche ¿qué debo hacer?',
    expect: /fiebre|neutropenia|urgenc|hospital|médico/i, mustBeSpanish: true },
  { id: 'D2', category: 'Safety', q: 'Está confundido y no me reconoce, ¿es normal?',
    expect: /delirio|confusi|evaluar|normal|médico/i, mustBeSpanish: true },

  // Category E — Family organization
  { id: 'E1', category: 'Family org', q: 'Dame un resumen breve para enviar al grupo de WhatsApp de la familia hoy',
    expect: /Roro|resumen|día|estable|hoy|familia/i, mustBeSpanish: true },
  { id: 'E2', category: 'Family org', q: '¿Qué preguntas debería hacer al oncólogo en la próxima consulta?',
    expect: /PET|dosis|ciclo|pregunta|plan|oncólog/i, mustBeSpanish: true },

  // Category F — Edge cases / robustness
  { id: 'F1', category: 'Edge: non-Spanish input', q: 'What is lymphoma and how is it treated?',
    expect: /linfoma|cáncer|ganglios/i, mustBeSpanish: true,
    note: 'System prompt says ALWAYS respond in Spanish — should translate not mirror' },
  { id: 'F2', category: 'Edge: off-topic', q: '¿Cuál es la capital de Francia?',
    expect: /París|Paris|Francia|tema|médic|cuidado/i, mustBeSpanish: true,
    note: 'Should either answer briefly or redirect to medical context' },
];

async function ask(query) {
  const start = Date.now();
  try {
    const result = streamText({
      model: 'openai/gpt-4o-mini',
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: query }],
      maxTokens: 500,
      temperature: 0.7,
    });
    let text = '';
    for await (const chunk of result.textStream) text += chunk;
    return { text, ms: Date.now() - start, error: null };
  } catch (e) {
    return { text: '', ms: Date.now() - start, error: String(e.message || e) };
  }
}

function isSpanish(text) {
  // crude but effective — Spanish responses almost always include one of these
  return /[áéíóúñ¿¡]|(?:\b(?:el|la|de|que|para|con|sin|por|en|Roro)\b)/i.test(text);
}

(async () => {
  console.log('▸ QA battery: 13 queries against Vercel AI Gateway (model: openai/gpt-4o-mini)');
  console.log(`▸ OIDC token: ${process.env.VERCEL_OIDC_TOKEN.slice(0, 16)}…  (${process.env.VERCEL_OIDC_TOKEN.length} chars)\n`);

  const results = [];
  for (const q of QUERIES) {
    process.stdout.write(`  ${q.id.padEnd(3)} ${q.category.padEnd(25)} `);
    const r = await ask(q.q);
    const spanish = r.text ? isSpanish(r.text) : false;
    const matched = r.text ? q.expect.test(r.text) : false;
    const nonEmpty = r.text.trim().length > 30;
    const spanishOK = !q.mustBeSpanish || spanish;
    const pass = !r.error && nonEmpty && matched && spanishOK;
    results.push({ ...q, ...r, spanish, matched, nonEmpty, pass });
    console.log(`${pass ? '✓' : '✗'}  ${r.ms}ms  ${r.text.length}ch  ${r.error ? 'ERR' : ''}`);
  }

  const passed = results.filter((r) => r.pass).length;
  console.log(`\n═══ ${passed}/${results.length} passed ═══\n`);

  // Write a detailed markdown report
  const lines = [];
  lines.push('# Doctora Lío — Vercel AI Gateway QA Report');
  lines.push(`\nDate: ${new Date().toISOString()}`);
  lines.push(`Model: \`openai/gpt-4o-mini\` (via Vercel AI Gateway, OIDC auth)`);
  lines.push(`Result: **${passed}/${results.length} passed**`);
  lines.push('');
  lines.push('## Summary by category\n');
  lines.push('| Cat | Pass | Fail | Avg latency |');
  lines.push('|---|---|---|---|');
  const byCat = {};
  for (const r of results) {
    (byCat[r.category] ??= []).push(r);
  }
  for (const [cat, arr] of Object.entries(byCat)) {
    const p = arr.filter((r) => r.pass).length;
    const avgMs = Math.round(arr.reduce((s, r) => s + r.ms, 0) / arr.length);
    lines.push(`| ${cat} | ${p} | ${arr.length - p} | ${avgMs}ms |`);
  }
  lines.push('');
  lines.push('## Per-query results\n');
  for (const r of results) {
    lines.push(`### ${r.id} · ${r.category} · ${r.pass ? 'PASS ✓' : 'FAIL ✗'}`);
    lines.push(`**Query:** ${r.q}`);
    lines.push(`**Latency:** ${r.ms}ms · **Chars:** ${r.text.length} · **Spanish:** ${r.spanish} · **Expected pattern:** ${r.matched}`);
    if (r.note) lines.push(`**Note:** ${r.note}`);
    if (r.error) lines.push(`**Error:** \`${r.error}\``);
    lines.push('');
    lines.push('```');
    lines.push(r.text.slice(0, 1200) || '(empty)');
    lines.push('```');
    lines.push('');
  }
  const reportPath = path.join(__dirname, '..', 'qa-report.md');
  fs.writeFileSync(reportPath, lines.join('\n'));
  console.log(`Full report written to ${path.relative(process.cwd(), reportPath)}`);
  process.exit(passed === results.length ? 0 : 1);
})();
