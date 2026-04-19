import React, { useState, useEffect, useMemo } from 'react';
import { Activity, TrendingDown, TrendingUp, Minus, Plus, Calendar, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SectionTitle, Card, Pill } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { getPatientId } from '../../lib/useSupabase';

// Mini sparkline chart component (pure SVG, no dependencies)
function Sparkline({ points, normalMin, normalMax, color = '#0ea5e9', width = 200, height = 48 }) {
  if (!points.length) return null;
  const padding = 4;
  const w = width - padding * 2;
  const h = height - padding * 2;

  // Supabase returns NUMERIC as strings; coerce and drop NaN without dropping 0.
  const num = (v) => (v == null ? null : Number(v));
  const valid = (v) => v != null && Number.isFinite(v);
  const normMin = num(normalMin);
  const normMax = num(normalMax);
  const values = points.map((p) => num(p.value)).filter(valid);
  if (!values.length) return null;

  const allVals = [...values, normMin, normMax].filter(valid);
  const min = Math.min(...allVals) * 0.9;
  const max = Math.max(...allVals) * 1.1;
  const range = max - min || 1;

  const toX = (i) => padding + (i / Math.max(points.length - 1, 1)) * w;
  const toY = (v) => padding + h - ((num(v) - min) / range) * h;

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(p.value)}`).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Normal range band */}
      {valid(normMin) && valid(normMax) && (
        <rect
          x={padding} y={toY(normMax)}
          width={w} height={Math.abs(toY(normMin) - toY(normMax))}
          fill="#10b981" opacity={0.08} rx={3}
        />
      )}
      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {/* Points */}
      {points.map((p, i) => {
        const pv = num(p.value);
        const isAbnormal = (valid(normMin) && pv < normMin) || (valid(normMax) && pv > normMax);
        return (
          <circle
            key={i}
            cx={toX(i)} cy={toY(p.value)}
            r={3.5}
            fill={isAbnormal ? '#ef4444' : '#10b981'}
            stroke="white" strokeWidth={1.5}
          />
        );
      })}
    </svg>
  );
}

function TrendIcon({ trend }) {
  if (trend > 0) return <TrendingUp className="w-4 h-4 text-rose-500" />;
  if (trend < 0) return <TrendingDown className="w-4 h-4 text-emerald-500" />;
  return <Minus className="w-4 h-4 text-stone-400" />;
}

export default function LabResults() {
  const { user, isAdmin } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ lab_name: '', value: '', unit: '', result_date: new Date().toISOString().slice(0, 10), notes: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pid = await getPatientId();
      if (!pid || cancelled) { setLoading(false); return; }
      const { data } = await supabase.from('lab_results').select('*').eq('patient_id', pid).order('result_date', { ascending: true });
      if (!cancelled) { setResults(data || []); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  // Group by lab name
  const grouped = useMemo(() => {
    const map = {};
    results.forEach(r => {
      if (!map[r.lab_name]) map[r.lab_name] = [];
      map[r.lab_name].push(r);
    });
    // Sort each group by date
    Object.values(map).forEach(arr => arr.sort((a, b) => a.result_date.localeCompare(b.result_date)));
    return map;
  }, [results]);

  const labNames = Object.keys(grouped).sort();

  const addResult = async () => {
    const pid = await getPatientId();
    const knownLab = results.find(r => r.lab_name === form.lab_name);
    const { data } = await supabase.from('lab_results').insert({
      patient_id: pid,
      entered_by: user?.id,
      lab_name: form.lab_name,
      value: parseFloat(form.value),
      unit: form.unit || knownLab?.unit || '',
      normal_min: knownLab?.normal_min,
      normal_max: knownLab?.normal_max,
      result_date: form.result_date,
      notes: form.notes,
    }).select().single();
    if (data) {
      setResults(prev => [...prev, data]);
      setForm({ lab_name: '', value: '', unit: '', result_date: new Date().toISOString().slice(0, 10), notes: '' });
      setShowAddForm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-stone-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Cargando laboratorios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionTitle subtitle="Seguimiento de resultados de laboratorio con tendencias. Los valores fuera de rango se resaltan en rojo.">
        Laboratorios
      </SectionTitle>

      {/* Add result */}
      {isAdmin && (
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:from-sky-700 hover:to-indigo-700 shadow-md shadow-sky-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Agregar resultado
        </button>
      </div>
      )}

      {showAddForm && (
        <Card>
          <h3 className="text-sm font-semibold text-stone-900 mb-3">Nuevo resultado de laboratorio</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-500 block mb-1">Nombre del examen</label>
              <input
                list="lab-names"
                value={form.lab_name}
                onChange={e => setForm({ ...form, lab_name: e.target.value })}
                placeholder="Ej: LDH, Hemoglobina, Plaquetas..."
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
              <datalist id="lab-names">
                {labNames.map(n => <option key={n} value={n} />)}
              </datalist>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-500 block mb-1">Valor</label>
                <input type="number" step="any" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-200" />
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Unidad</label>
                <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="U/L, g/dL..." className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-200" />
              </div>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Fecha</label>
              <input type="date" value={form.result_date} onChange={e => setForm({ ...form, result_date: e.target.value })} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-200" />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Notas</label>
              <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Opcional" className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-200" />
            </div>
          </div>
          <button
            onClick={addResult}
            disabled={!form.lab_name || !form.value}
            className="mt-3 inline-flex items-center gap-2 bg-stone-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-800 transition-all disabled:opacity-40"
          >
            Guardar resultado
          </button>
        </Card>
      )}

      {/* Lab cards */}
      {labNames.length === 0 ? (
        <Card tone="muted">
          <p className="text-sm text-stone-500 text-center py-6">
            Sin resultados todavía. Agrega los primeros laboratorios de Roro.
          </p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {labNames.map(name => {
            const points = grouped[name];
            const latest = points[points.length - 1];
            const prev = points.length > 1 ? points[points.length - 2] : null;
            const isAbove = latest.normal_max != null && latest.value > latest.normal_max;
            const isBelow = latest.normal_min != null && latest.value < latest.normal_min;
            const isAbnormal = isAbove || isBelow;
            const trend = prev ? latest.value - prev.value : 0;
            const trendPct = prev ? ((trend / prev.value) * 100).toFixed(1) : null;

            return (
              <Card key={name} className={isAbnormal ? 'border-rose-200 bg-rose-50/30' : ''}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                      {isAbnormal ? (
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                      {name}
                    </h3>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      Rango: {latest.normal_min}–{latest.normal_max} {latest.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${isAbnormal ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {Number(latest.value).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-stone-500">{latest.unit}</p>
                  </div>
                </div>

                {/* Sparkline */}
                <div className="my-2">
                  <Sparkline
                    points={points.map(p => ({ value: Number(p.value) }))}
                    normalMin={Number(latest.normal_min)}
                    normalMax={Number(latest.normal_max)}
                    color={isAbnormal ? '#ef4444' : '#10b981'}
                    width={280}
                    height={48}
                  />
                </div>

                {/* Trend and date */}
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1.5">
                    <TrendIcon trend={isAbove ? trend : -trend} />
                    {trendPct && (
                      <span className={`text-xs font-medium ${Math.abs(trend) < 0.01 ? 'text-stone-400' : trend > 0 ? (isAbove ? 'text-rose-600' : 'text-emerald-600') : (isBelow ? 'text-rose-600' : 'text-emerald-600')}`}>
                        {trend > 0 ? '+' : ''}{trendPct}%
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(latest.result_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                  </span>
                </div>

                {/* Notes */}
                {latest.notes && (
                  <p className="text-[10px] text-stone-500 mt-2 italic">📝 {latest.notes}</p>
                )}

                {/* History */}
                <details className="mt-2">
                  <summary className="text-[10px] text-sky-600 cursor-pointer hover:text-sky-700">
                    Ver historial ({points.length} resultados)
                  </summary>
                  <div className="mt-2 space-y-1">
                    {[...points].reverse().map(p => (
                      <div key={p.id} className="flex items-center justify-between text-[10px] text-stone-500 py-0.5">
                        <span>{new Date(p.result_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>
                        <span className={`font-medium ${
                          (p.normal_max && p.value > p.normal_max) || (p.normal_min && p.value < p.normal_min) ? 'text-rose-600' : 'text-emerald-700'
                        }`}>
                          {Number(p.value).toLocaleString()} {p.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
