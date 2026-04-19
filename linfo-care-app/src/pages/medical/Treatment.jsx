import React, { useState } from 'react';
import { Shield, Calendar, AlertTriangle, CheckCircle2, Clock, ChevronDown, Activity, Droplets, Thermometer, AlertCircle, Info } from 'lucide-react';
import { SectionTitle, Card, Pill, TimelineStep } from '../../components/ui';

const confirmedMeds = [
  { name: 'Vincristina', type: 'Solución inyectable', notes: 'Agente antineoplásico — impide la división celular. Parte del esquema autorizado. Vigilar hormigueo en manos/pies (neuropatía periférica).', category: 'quimio' },
  { name: 'Ondansetrón', type: 'Anti-emético', notes: 'Previene náusea y vómito asociados a quimioterapia. Puede causar estreñimiento — asegurar hidratación y movicol si es necesario.', category: 'soporte' },
  { name: 'Piperacilina', type: 'Antibiótico IV', notes: 'Antibiótico de amplio espectro (probablemente Piperacilina/Tazobactam). Indica cobertura para riesgo de infección en contexto de UCI.', category: 'soporte' },
  { name: 'Rosuvastatina', type: 'Estatina', notes: 'Control de lípidos y efecto antiinflamatorio. Medicamento crónico que Roro probablemente tomaba antes del ingreso.', category: 'soporte' },
];

const phases = [
  {
    id: 'uci',
    name: 'UCI Hemato-Oncología',
    status: 'active',
    dateRange: 'Abril 18, 2026 – presente',
    goal: 'Estabilización clínica y monitoreo estrecho. Roro fue trasladado a la UCI de hemato-oncología para manejo especializado mientras el equipo define el protocolo de tratamiento.',
    meds: confirmedMeds,
    labsToWatch: ['Hemograma completo', 'LDH', 'Función renal (creatinina, BUN)', 'Electrolitos', 'Función hepática', 'PCR / Procalcitonina'],
    redFlags: [
      'Fiebre ≥ 38°C → puede ser neutropenia febril → avisar INMEDIATO al equipo',
      'Dificultad respiratoria que empeora → puede ser progresión del derrame pleural',
      'Confusión nueva / desorientación → riesgo de delirium → avisar enfermería',
      'Sangrado activo o moretones nuevos → plaquetas pueden estar muy bajas',
      'Dolor abdominal severo → riesgo de complicación de la masa duodenal',
    ],
  },
  {
    id: 'protocolo',
    name: 'Definición del protocolo',
    status: 'upcoming',
    dateRange: 'Pendiente — equipo de hemato-oncología',
    goal: 'El equipo de hemato-oncología evaluará el estado clínico actual de Roro para definir el régimen quimioterapéutico. Las opciones incluyen R-CHOP, R-mini-CHOP, u otros esquemas según tolerancia y condición.',
    meds: [],
    labsToWatch: ['Ecocardiograma (función cardíaca pre-quimio)', 'Biopsia de médula ósea (si no se ha hecho)', 'Perfil viral (VIH, Hepatitis B/C)'],
    redFlags: [
      'Si la función cardíaca es baja → puede limitar uso de doxorrubicina',
      'Si hay infección activa → debe resolverse antes de iniciar quimioterapia',
    ],
  },
  {
    id: 'quimio',
    name: 'Inicio de quimioterapia',
    status: 'planned',
    dateRange: 'Por definir',
    goal: 'Una vez confirmado el protocolo, se inicia el primer ciclo de quimioterapia. El equipo definirá dosis, frecuencia y esquema de monitoreo específico.',
    meds: [],
    labsToWatch: ['Se definirán según el protocolo elegido'],
    redFlags: [
      'Fiebre durante nadir (día 7-14 post-quimio) = EMERGENCIA',
      'Los protocolos específicos de vigilancia se definirán con el equipo',
    ],
  },
];

const statusColors = {
  active: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', label: 'Activa', dot: 'bg-emerald-500' },
  upcoming: { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200', label: 'Próxima', dot: 'bg-sky-500' },
  planned: { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200', label: 'Planeada', dot: 'bg-stone-400' },
  completed: { bg: 'bg-stone-50', text: 'text-stone-500', border: 'border-stone-200', label: 'Completada', dot: 'bg-stone-300' },
};

const catColors = {
  quimio: 'border-l-violet-500 bg-violet-50/30',
  soporte: 'border-l-emerald-500 bg-emerald-50/30',
};

export default function Treatment() {
  const [openPhase, setOpenPhase] = useState('uci');
  const [showReference, setShowReference] = useState(false);

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionTitle subtitle="El estado actual del tratamiento de Roro. Solo se muestra información confirmada por el equipo médico.">
        Plan de tratamiento
      </SectionTitle>

      {/* Protocol status banner */}
      <Card tone="warn" className="!border-amber-300">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-none mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-900 mb-1">Protocolo de tratamiento: PENDIENTE DE CONFIRMACIÓN</h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              El equipo de hemato-oncología aún no ha definido el régimen completo de quimioterapia. 
              Roro fue admitido a la <strong>UCI de Hemato-Oncología</strong> el 18 de abril. 
              Actualmente recibe <strong>4 medicamentos autorizados</strong> (ver abajo).
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Pill tone="warn">Protocolo por confirmar</Pill>
              <Pill tone="info">UCI Hemato-Oncología</Pill>
              <Pill tone="default">4 medicamentos activos</Pill>
            </div>
          </div>
        </div>
      </Card>

      {/* Confirmed medications summary */}
      <Card>
        <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Medicamentos autorizados (confirmados)
        </h3>
        <div className="space-y-2">
          {confirmedMeds.map(med => (
            <div key={med.name} className={`border-l-2 ${catColors[med.category]} rounded-r-lg p-3`}>
              <div className="flex items-baseline justify-between gap-2 mb-0.5">
                <p className="text-sm font-semibold text-stone-900">{med.name}</p>
                <p className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">{med.type}</p>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">{med.notes}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Phase timeline */}
      <div className="space-y-4">
        {phases.map(phase => {
          const sc = statusColors[phase.status];
          const isOpen = openPhase === phase.id;

          return (
            <Card key={phase.id} className={isOpen ? `!border-l-4 !border-l-sky-500` : ''}>
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

              {isOpen && (
                <div className="mt-4 space-y-4 animate-fade-in">
                  <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-stone-500 uppercase mb-1">Objetivo</p>
                    <p className="text-sm text-stone-700 leading-relaxed">{phase.goal}</p>
                  </div>

                  {phase.meds.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-stone-500 uppercase mb-2 flex items-center gap-1.5">
                        <Droplets className="w-3 h-3" /> Medicamentos
                      </p>
                      <div className="space-y-2">
                        {phase.meds.map(med => (
                          <div key={med.name} className="border border-stone-200 rounded-lg p-3">
                            <div className="flex items-baseline justify-between gap-2 mb-1">
                              <p className="text-sm font-semibold text-stone-900">{med.name}</p>
                              <p className="text-xs text-sky-700 font-medium bg-sky-50 px-2 py-0.5 rounded">{med.type}</p>
                            </div>
                            <p className="text-xs text-stone-600 leading-relaxed">{med.notes}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
          Línea de tiempo real
        </h3>
        <div className="space-y-1">
          <TimelineStep num={1} title="Ingreso UCI" detail="Roro ingresó por cuadro clínico severo. Estabilización inicial." days="Abril 6" />
          <TimelineStep num={2} title="Diagnóstico confirmado" detail="DLBCL Estadio IV — confirmado por biopsia, PET-CT, mielograma." days="Abril 7-13" />
          <TimelineStep num={3} title="Piso Oncología" detail="Traslado de UCI a piso para continuar manejo." days="Abril 14" />
          <TimelineStep num={4} title="UCI Hemato-Oncología" detail="Admitido a UCI especializada de hemato-oncología." days="Abril 18" />
          <TimelineStep num={5} title="Definición de protocolo" detail="El equipo decide el esquema de quimioterapia." days="Pendiente" />
          <TimelineStep num={6} title="Inicio quimioterapia" detail="Primer ciclo del régimen definido." days="Por confirmar" last />
        </div>
      </Card>

      {/* R-CHOP Reference (collapsed) */}
      <Card tone="muted">
        <button
          onClick={() => setShowReference(!showReference)}
          className="w-full flex items-center gap-2 text-left"
        >
          <Info className="w-4 h-4 text-stone-400 flex-none" />
          <span className="text-sm font-medium text-stone-600 flex-1">Material de referencia: Protocolo R-CHOP (NO confirmado)</span>
          <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${showReference ? 'rotate-180' : ''}`} />
        </button>
        {showReference && (
          <div className="mt-3 space-y-3 animate-fade-in border-t border-stone-200 pt-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                <strong>⚠️ IMPORTANTE:</strong> La siguiente información es material de referencia sobre el protocolo R-CHOP. 
                NO ha sido confirmado como el tratamiento de Roro. Solo se incluye como contexto educativo.
              </p>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              <strong>R-CHOP</strong> es el régimen estándar para DLBCL. Son 5 medicamentos: Rituximab (R), 
              Ciclofosfamida (C), Doxorrubicina (H), Vincristina (O), Prednisona (P). 
              En pacientes mayores de 75 años se puede usar <strong>R-mini-CHOP</strong> con dosis reducidas.
            </p>
            <p className="text-xs text-stone-500">
              Nota: Vincristina (ya autorizada para Roro) es la "O" del esquema R-CHOP. 
              Esto podría indicar que el equipo se está moviendo hacia alguna variante de este protocolo, 
              pero no se puede confirmar hasta que oncología lo comunique.
            </p>
          </div>
        )}
      </Card>

      {/* Family tip */}
      <Card tone="info">
        <p className="text-sm text-sky-900 leading-relaxed">
          <span className="font-medium">💡 Para la familia:</span> Mientras Roro está en la UCI de hemato-oncología, 
          lo más importante es: <strong>(1)</strong> mantener registro de todo lo que dice el equipo médico, 
          <strong>(2)</strong> preguntar cuándo se define el protocolo de quimioterapia, y 
          <strong>(3)</strong> vigilar las señales de alarma listadas arriba. 
          Cualquier fiebre ≥38°C es emergencia.
        </p>
      </Card>
    </div>
  );
}
