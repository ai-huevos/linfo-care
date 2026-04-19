import React, { useState, useEffect, useCallback } from 'react';
import { Pill as PillIcon, Plus, Clock, AlertTriangle, CheckCircle2, Loader2, Wifi, Trash2, Edit2, Save, X, ChevronDown } from 'lucide-react';
import { SectionTitle, Card, Pill } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { getPatientId } from '../../lib/useSupabase';

// Confirmed medications — only drugs authorized by Clínica del Country (Administradora Country SAS)
// Data extracted from EPS Sanitas authorization documents dated 16-17/04/2026
const defaultMeds = [
  { name: 'Vincristina', dose: 'Por confirmar (solución inyectable)', frequency: 'Según indicación médica', category: 'quimio', status: 'active', notes: 'Agente antineoplásico autorizado. Impide la división celular tumoral. Es la "O" (Oncovin) del esquema R-CHOP — su autorización puede indicar que el equipo se mueve hacia ese protocolo.', sideEffects: 'Neuropatía periférica (hormigueo manos/pies), estreñimiento severo, dolor mandibular. Avisar si aparece cualquiera.' },
  { name: 'Dexametasona Fosfato', dose: '8mg/2mL (0.4%) Sol Iny', frequency: 'Según indicación médica', category: 'quimio', status: 'active', notes: 'Corticosteroide autorizado el 17/04 (Vitalis S.A.). Se usa como pre-medicación antes de quimioterapia, antiinflamatorio y para reducir edema cerebral/tumoral. Solicitud #342869477, vigencia hasta 16/05/2026.', sideEffects: 'Elevación de glucosa, aumento de apetito, insomnio, irritabilidad. Vigilar azúcar en sangre.' },
  { name: 'Ondansetrón', dose: 'Por confirmar', frequency: 'Según indicación médica', category: 'soporte', status: 'active', notes: 'Anti-emético (previene náusea y vómito). Se usa para contrarrestar los efectos gastrointestinales de la quimioterapia y otros medicamentos.', sideEffects: 'Estreñimiento, dolor de cabeza leve. Asegurar hidratación.' },
  { name: 'Piperacilina', dose: 'Por confirmar (IV)', frequency: 'Según indicación médica', category: 'soporte', status: 'active', notes: 'Antibiótico de amplio espectro IV (probablemente Piperacilina/Tazobactam). Cobertura antibiótica para riesgo de infección en contexto de UCI e inmunosupresión por la enfermedad.', sideEffects: 'Diarrea, reacción alérgica (rash, fiebre). Avisar si aparece rash o dificultad respiratoria.' },
  { name: 'Rosuvastatina', dose: 'Por confirmar', frequency: 'Según indicación médica', category: 'otro', status: 'active', notes: 'Estatina para control de lípidos y efecto antiinflamatorio. Medicamento que Roro probablemente tomaba antes del ingreso y se mantiene durante la hospitalización.', sideEffects: 'Dolor muscular (mialgia), elevación de enzimas hepáticas. Generalmente bien tolerado.' },
];

const categoryConfig = {
  quimio: { label: 'Quimioterapia', color: 'bg-violet-100 text-violet-800 border-violet-200' },
  soporte: { label: 'Soporte', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  dolor: { label: 'Dolor', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  otro: { label: 'Otro', color: 'bg-stone-100 text-stone-600 border-stone-200' },
};

const statusConfig = {
  active: { label: 'Activo', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  pending: { label: 'Pendiente', color: 'bg-sky-100 text-sky-800', icon: Clock },
  paused: { label: 'Pausado', color: 'bg-amber-100 text-amber-800', icon: AlertTriangle },
  stopped: { label: 'Suspendido', color: 'bg-rose-100 text-rose-800', icon: X },
};

export default function Medications() {
  const { user, isAdmin } = useAuth();
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({ name: '', dose: '', frequency: '', category: 'soporte', status: 'active', notes: '', sideEffects: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pid = await getPatientId();
      if (!pid || cancelled) { setLoading(false); return; }

      const { data } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', pid)
        .order('created_at', { ascending: true });

      if (!cancelled) {
        if (data && data.length > 0) {
          setMeds(data);
        } else {
          // Seed defaults
          const inserts = defaultMeds.map(m => ({
            patient_id: pid,
            name: m.name,
            dose: m.dose,
            frequency: m.frequency,
            category: m.category,
            status: m.status,
            notes: m.notes,
            side_effects: m.sideEffects,
            updated_by: user?.id,
          }));
          const { data: seeded } = await supabase.from('medications').insert(inserts).select();
          if (seeded) setMeds(seeded);
        }
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const addMed = async () => {
    if (!form.name.trim()) return;
    const pid = await getPatientId();
    const { data } = await supabase.from('medications').insert({
      patient_id: pid,
      name: form.name.trim(),
      dose: form.dose.trim(),
      frequency: form.frequency.trim(),
      category: form.category,
      status: form.status,
      notes: form.notes.trim(),
      side_effects: form.sideEffects.trim(),
      updated_by: user?.id,
    }).select().single();
    if (data) {
      setMeds(prev => [...prev, data]);
      setForm({ name: '', dose: '', frequency: '', category: 'soporte', status: 'active', notes: '', sideEffects: '' });
      setShowAdd(false);
    }
  };

  const updateStatus = async (med, newStatus) => {
    await supabase.from('medications').update({ status: newStatus, updated_by: user?.id }).eq('id', med.id);
    setMeds(prev => prev.map(m => m.id === med.id ? { ...m, status: newStatus } : m));
  };

  const deleteMed = async (med) => {
    if (!confirm(`¿Eliminar ${med.name}?`)) return;
    await supabase.from('medications').delete().eq('id', med.id);
    setMeds(prev => prev.filter(m => m.id !== med.id));
  };

  const filtered = filter === 'all' ? meds : meds.filter(m => m.category === filter || m.status === filter);
  const activeCount = meds.filter(m => m.status === 'active').length;
  const pendingCount = meds.filter(m => m.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-stone-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Cargando medicamentos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionTitle subtitle="Todos los medicamentos de Roro: qué son, para qué sirven, cuándo tomarlos, y qué efectos vigilar. Actualiza el estado cuando algo cambie.">
        Medicamentos
      </SectionTitle>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-600">
          <Wifi className="w-3 h-3" />
          <span>Sincronizado — cambios visibles para toda la familia</span>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:from-sky-700 hover:to-indigo-700 shadow-md shadow-sky-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Agregar medicamento
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-700">{activeCount}</p>
          <p className="text-xs text-emerald-600">Activos</p>
        </div>
        <div className="border border-sky-200 bg-sky-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-sky-700">{pendingCount}</p>
          <p className="text-xs text-sky-600">Pendientes</p>
        </div>
        <div className="border border-stone-200 bg-stone-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-stone-700">{meds.length}</p>
          <p className="text-xs text-stone-600">Total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 flex-wrap">
        {[
          { key: 'all', label: 'Todos' },
          { key: 'active', label: '✅ Activos' },
          { key: 'pending', label: '⏳ Pendientes' },
          { key: 'quimio', label: '💉 Quimio' },
          { key: 'soporte', label: '🛡️ Soporte' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f.key ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <Card className="animate-fade-in">
          <h3 className="text-sm font-semibold text-stone-900 mb-3">Nuevo medicamento</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-500 block mb-1">Nombre *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Metoclopramida" className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-200" />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Dosis</label>
              <input value={form.dose} onChange={e => setForm({ ...form, dose: e.target.value })} placeholder="Ej: 10 mg c/8h" className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-200" />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Frecuencia</label>
              <input value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} placeholder="Ej: 3 veces al día con comida" className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-200" />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Categoría</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-200">
                {Object.entries(categoryConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Notas</label>
              <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Para qué sirve, cuándo tomarlo..." className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-200" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Efectos secundarios a vigilar</label>
              <input value={form.sideEffects} onChange={e => setForm({ ...form, sideEffects: e.target.value })} placeholder="Qué efectos puede tener..." className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-200" />
            </div>
          </div>
          <button onClick={addMed} disabled={!form.name.trim()} className="mt-3 inline-flex items-center gap-2 bg-stone-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-800 transition-all disabled:opacity-40">
            Guardar
          </button>
        </Card>
      )}

      {/* Medication cards */}
      <div className="space-y-3">
        {filtered.map(med => {
          const cat = categoryConfig[med.category] || categoryConfig.otro;
          const st = statusConfig[med.status] || statusConfig.active;
          const StIcon = st.icon;
          const isExpanded = expandedId === med.id;

          return (
            <Card key={med.id} className={`${med.status === 'stopped' ? 'opacity-50' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center flex-none">
                  <PillIcon className="w-4 h-4 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h4 className="text-sm font-semibold text-stone-900">{med.name}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${cat.color}`}>{cat.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${st.color}`}>
                      <StIcon className="w-2.5 h-2.5" /> {st.label}
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 font-medium">{med.dose}</p>
                  <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {med.frequency}
                  </p>

                  {isExpanded && (
                    <div className="mt-3 space-y-2 animate-fade-in">
                      {med.notes && (
                        <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5">
                          <p className="text-[10px] font-semibold text-stone-500 uppercase mb-0.5">Para qué sirve</p>
                          <p className="text-xs text-stone-700 leading-relaxed">{med.notes}</p>
                        </div>
                      )}
                      {med.side_effects && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                          <p className="text-[10px] font-semibold text-amber-700 uppercase mb-0.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Efectos a vigilar</p>
                          <p className="text-xs text-amber-800 leading-relaxed">{med.side_effects}</p>
                        </div>
                      )}
                      {isAdmin && (
                      <div className="flex gap-1.5 pt-1">
                        {['active', 'pending', 'paused', 'stopped'].map(s => (
                          <button
                            key={s}
                            onClick={() => updateStatus(med, s)}
                            className={`text-[10px] px-2 py-1 rounded-md transition-all ${med.status === s ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                          >
                            {statusConfig[s].label}
                          </button>
                        ))}
                        <button onClick={() => deleteMed(med)} className="text-[10px] px-2 py-1 rounded-md text-rose-600 hover:bg-rose-50 transition-colors ml-auto">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      )}
                    </div>
                  )}
                </div>
                <button onClick={() => setExpandedId(isExpanded ? null : med.id)} className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Warning */}
      <Card tone="critical">
        <p className="text-xs text-rose-900 leading-relaxed">
          <span className="font-semibold">⚠️ Importante:</span> No cambien dosis sin consultar al equipo médico. 
          Si Roro tiene fiebre ≥38°C, NO le den Ibuprofeno — puede empeorar el sangrado con plaquetas bajas. 
          Solo Acetaminofén y llamar a oncología.
        </p>
      </Card>
    </div>
  );
}
