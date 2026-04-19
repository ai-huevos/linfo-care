import React, { useState } from 'react';
import { Shield, Calendar, AlertTriangle, CheckCircle2, Clock, ChevronDown, Activity, Droplets, Thermometer } from 'lucide-react';
import { SectionTitle, Card, Pill, TimelineStep } from '../../components/ui';

const phases = [
  {
    id: 'prefase',
    name: 'Pre-fase',
    status: 'active',
    dateRange: 'Abril 19 – 25, 2026',
    goal: 'Reducir suavemente la carga tumoral antes de la quimioterapia completa. Proteger riñones del síndrome de lisis tumoral.',
    meds: [
      { name: 'Prednisona', dose: '100 mg/día × 5-7 días', notes: 'Esteroide. Da hambre y energía. Puede subir el azúcar. Tomar con comida.' },
      { name: 'Alopurinol', dose: '300 mg/día', notes: 'Protege riñones del ácido úrico que suelta el tumor al destruirse.' },
      { name: 'Hidratación IV', dose: '2-3 L/día', notes: 'Suero para mantener los riñones lavando. Vigilar que orine bien.' },
    ],
    labsToWatch: ['Ácido úrico', 'Potasio', 'Fósforo', 'Calcio', 'Creatinina', 'LDH'],
    redFlags: [
      'Potasio > 6.0 → riesgo arritmia cardíaca → URGENTE',
      'Ácido úrico > 8.0 → agregar rasburicasa',
      'Oliguria (no orina) → alertar nefrología',
    ],
  },
  {
    id: 'ciclo1',
    name: 'Ciclo 1 — R-CHOP / R-mini-CHOP',
    status: 'upcoming',
    dateRange: 'Aprox. Abril 26 – Mayo 16, 2026',
    goal: 'Primera ronda de quimioterapia combinada. Se decide si dosis completa o reducida según tolerancia de pre-fase.',
    meds: [
      { name: 'Rituximab (R)', dose: '375 mg/m²', notes: 'Infusión lenta (4-6h primera vez). Puede causar fiebre/escalofríos. Pre-medicar con acetaminofén + anti-histamínico.' },
      { name: 'Ciclofosfamida (C)', dose: '750 mg/m² (o 400 para mini)', notes: 'Hidratación obligatoria. Puede causar náusea.' },
      { name: 'Doxorrubicina (H)', dose: '50 mg/m² (o 25 para mini)', notes: 'La infusión es ROJA — no es sangre, es el color del medicamento. Puede afectar corazón.' },
      { name: 'Vincristina (O)', dose: '1.4 mg/m² (max 2mg)', notes: 'Puede causar hormigueo en manos/pies (neuropatía). Avisar si aparece.' },
      { name: 'Prednisona (P)', dose: '100 mg/día × 5 días', notes: 'Pastillas los días 1-5. Da energía temporal.' },
    ],
    labsToWatch: ['Hemograma día 7 y 14', 'Función renal', 'Función hepática'],
    redFlags: [
      'Fiebre ≥ 38°C durante nadir (día 7-14) = NEUTROPENIA FEBRIL → urgencias INMEDIATO',
      'Sangrado activo inexplicado → plaquetas urgentes',
      'Dificultad para respirar → puede ser cardiotoxicidad o infección pulmonar',
      'No orinar > 6 horas → puede ser lisis tumoral → alertar',
    ],
  },
  {
    id: 'ciclo2_6',
    name: 'Ciclos 2 – 6',
    status: 'planned',
    dateRange: 'Mayo – Septiembre 2026',
    goal: 'Se repite cada 21 días si labs lo permiten. PET-CT intermedio después del ciclo 2 o 4 para evaluar respuesta.',
    meds: [{ name: 'Mismo esquema R-CHOP', dose: 'Ajustado según tolerancia', notes: 'Rituximab más rápido a partir del ciclo 2. Se ajustan dosis si hay toxicidad.' }],
    labsToWatch: ['Hemograma pre-ciclo', 'Ecocardiograma cada 2-3 ciclos', 'PET-CT intermedio'],
    redFlags: [
      'Si neutrófilos < 1000 → diferir ciclo hasta recuperación',
      'Fracción de eyección < 50% → suspender doxorrubicina',
      'Neuropatía severa → reducir/suspender vincristina',
    ],
  },
];

const statusColors = {
  active: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', label: 'Activa', dot: 'bg-emerald-500' },
  upcoming: { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200', label: 'Próxima', dot: 'bg-sky-500' },
  planned: { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200', label: 'Planeada', dot: 'bg-stone-400' },
  completed: { bg: 'bg-stone-50', text: 'text-stone-500', border: 'border-stone-200', label: 'Completada', dot: 'bg-stone-300' },
};

export default function Treatment() {
  const [openPhase, setOpenPhase] = useState('prefase');

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionTitle subtitle="El plan de tratamiento de Roro paso a paso. Cada fase tiene sus medicamentos, labs a vigilar, y señales de alarma.">
        Plan de tratamiento
      </SectionTitle>

      {/* Overview */}
      <Card className="!bg-gradient-to-br !from-sky-50/60 !to-indigo-50/40 !border-sky-200">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-sky-600 flex-none mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-stone-900 mb-1">Protocolo: R-CHOP o R-mini-CHOP</h3>
            <p className="text-sm text-stone-700 leading-relaxed">
              6 ciclos de 21 días cada uno. Duración total estimada: <strong>4-5 meses</strong>. 
              Se evalúa respuesta con PET-CT intermedio. Tasa de remisión completa en DLBCL: <strong>60-70%</strong> (incluso a los 78 años con mini-CHOP).
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Pill tone="safe">Potencialmente curable</Pill>
              <Pill tone="info">6 ciclos / 21 días</Pill>
              <Pill tone="warn">Requiere monitoreo estrecho</Pill>
            </div>
          </div>
        </div>
      </Card>

      {/* Phase timeline */}
      <div className="space-y-4">
        {phases.map(phase => {
          const sc = statusColors[phase.status];
          const isOpen = openPhase === phase.id;

          return (
            <Card key={phase.id} className={isOpen ? `!border-l-4 !border-l-sky-500` : ''}>
              {/* Header */}
              <button
                onClick={() => setOpenPhase(isOpen ? null : phase.id)}
                className="w-full flex items-center gap-3 text-left"
              >
                <div className={`w-3 h-3 rounded-full ${sc.dot} flex-none ${phase.status === 'active' ? 'animate-pulse' : ''}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-stone-900 truncate">{phase.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${sc.bg} ${sc.text} ${sc.border}`}>
                      {sc.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {phase.dateRange}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="mt-4 space-y-4 animate-fade-in">
                  {/* Goal */}
                  <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-stone-500 uppercase mb-1">Objetivo</p>
                    <p className="text-sm text-stone-700 leading-relaxed">{phase.goal}</p>
                  </div>

                  {/* Medications */}
                  <div>
                    <p className="text-xs font-semibold text-stone-500 uppercase mb-2 flex items-center gap-1.5">
                      <Droplets className="w-3 h-3" /> Medicamentos
                    </p>
                    <div className="space-y-2">
                      {phase.meds.map(med => (
                        <div key={med.name} className="border border-stone-200 rounded-lg p-3">
                          <div className="flex items-baseline justify-between gap-2 mb-1">
                            <p className="text-sm font-semibold text-stone-900">{med.name}</p>
                            <p className="text-xs text-sky-700 font-medium bg-sky-50 px-2 py-0.5 rounded">{med.dose}</p>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">{med.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Labs to watch */}
                  <div>
                    <p className="text-xs font-semibold text-stone-500 uppercase mb-2 flex items-center gap-1.5">
                      <Activity className="w-3 h-3" /> Labs a vigilar
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {phase.labsToWatch.map(lab => (
                        <span key={lab} className="text-xs px-2.5 py-1 rounded-full border border-stone-200 text-stone-600 bg-white">{lab}</span>
                      ))}
                    </div>
                  </div>

                  {/* Red flags */}
                  <Card tone="critical">
                    <p className="text-xs font-semibold text-rose-800 uppercase mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3" /> Señales de alarma
                    </p>
                    <div className="space-y-1.5">
                      {phase.redFlags.map((flag, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-rose-500 flex-none mt-0.5">⚠️</span>
                          <p className="text-xs text-rose-900 leading-relaxed">{flag}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Key dates */}
      <Card>
        <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-600" />
          Fechas clave
        </h3>
        <div className="space-y-1">
          <TimelineStep num={1} title="Pre-fase con prednisona" detail="Iniciar preparación renal y reducción tumoral suave." days="Abril 19" />
          <TimelineStep num={2} title="Ecocardiograma basal" detail="Medir función cardíaca antes de doxorrubicina." days="Abril 21-23" />
          <TimelineStep num={3} title="Día 1 — Ciclo 1 R-CHOP" detail="Primera infusión completa. Monitoreo 24-48h mínimo." days="Abril 26 (est.)" />
          <TimelineStep num={4} title="Nadir (punto más bajo de defensas)" detail="Mayor riesgo de infección. Fiebre = urgencias." days="Mayo 3-10" />
          <TimelineStep num={5} title="Labs pre-Ciclo 2" detail="Hemograma, función renal, hepática." days="Mayo 16" />
          <TimelineStep num={6} title="PET-CT intermedio" detail="Evaluar si el tumor está respondiendo. Decisión crítica." days="~Junio" last />
        </div>
      </Card>

      {/* Family tip */}
      <Card tone="info">
        <p className="text-sm text-sky-900 leading-relaxed">
          <span className="font-medium">💡 Para la familia:</span> Cada ciclo tiene un patrón predecible. 
          Los días 1-5 son de tratamiento activo, los días 7-14 son de mayor riesgo (nadir), 
          y los días 15-21 son de recuperación. Organicen los turnos para tener más cobertura durante el nadir.
        </p>
      </Card>
    </div>
  );
}
