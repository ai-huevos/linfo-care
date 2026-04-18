import React, { useState } from 'react';
import { MapPin, AlertCircle, Info, Plus, X } from 'lucide-react';
import { SectionTitle, Card, Pill } from '../../components/ui';

// Body regions with coordinates relative to a 200x400 viewbox
const bodyRegions = [
  { id: 'head', label: 'Cabeza', x: 100, y: 30, status: 'monitor', notes: 'Delirio: vigilar orientación, confusión nocturna' },
  { id: 'mouth', label: 'Boca', x: 100, y: 55, status: 'alert', notes: 'Mucositis potencial — enjuague bicarbonato 4-6x/día. Revisar placas blancas' },
  { id: 'neck', label: 'Cuello/Ganglios', x: 100, y: 75, status: 'alert', notes: 'Masas palpables cervicales bilaterales. Verificar evolución semanal' },
  { id: 'chest-r', label: 'Pulmón/Pleura Derecha', x: 65, y: 120, status: 'critical', notes: 'Derrame pleural con drenaje. Tubo de tórax activo. Vigilar disnea y drenaje' },
  { id: 'chest-l', label: 'Pulmón Izquierdo', x: 135, y: 120, status: 'monitor', notes: 'Sin hallazgos significativos en PET' },
  { id: 'heart', label: 'Corazón', x: 115, y: 130, status: 'monitor', notes: 'Riesgo cardiotoxicidad por doxorrubicina en R-CHOP. Ecocardiograma basal pendiente' },
  { id: 'ribs', label: 'Costillas', x: 60, y: 145, status: 'alert', notes: 'Fractura costal derecha por lesión lítica. Manejo del dolor' },
  { id: 'liver', label: 'Hígado', x: 75, y: 170, status: 'monitor', notes: 'Verificar función hepática antes de cada ciclo de quimio' },
  { id: 'spleen', label: 'Bazo', x: 135, y: 175, status: 'alert', notes: 'Esplenomegalia marcada 18cm. Masa esplénica SUVmax 26.7' },
  { id: 'kidney', label: 'Riñones', x: 100, y: 195, status: 'monitor', notes: 'Creatinina 1.2 (mejorada). Hidratación agresiva para prevenir lisis tumoral' },
  { id: 'pelvis', label: 'Pelvis/Huesos', x: 100, y: 235, status: 'alert', notes: 'Infiltración ósea múltiple. Lesiones líticas en PET. Riesgo de fracturas' },
  { id: 'skin', label: 'Piel (general)', x: 165, y: 235, status: 'monitor', notes: 'Revisar úlceras por presión cada turno. Cambio posicional cada 2h' },
  { id: 'legs', label: 'Extremidades', x: 100, y: 320, status: 'monitor', notes: 'Riesgo TVP por inmovilidad. Medias de compresión si plaquetas >50k' },
];

const statusColors = {
  critical: { bg: 'bg-rose-500', ring: 'ring-rose-300', label: 'Crítico', pill: 'bg-rose-100 text-rose-800 border-rose-200', pulse: true },
  alert: { bg: 'bg-amber-500', ring: 'ring-amber-300', label: 'Alerta', pill: 'bg-amber-100 text-amber-800 border-amber-200', pulse: false },
  monitor: { bg: 'bg-sky-500', ring: 'ring-sky-300', label: 'Monitoreo', pill: 'bg-sky-100 text-sky-800 border-sky-200', pulse: false },
  ok: { bg: 'bg-emerald-500', ring: 'ring-emerald-300', label: 'Normal', pill: 'bg-emerald-100 text-emerald-800 border-emerald-200', pulse: false },
};

export default function BodyMap() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? bodyRegions : bodyRegions.filter(r => r.status === filter);
  const criticalCount = bodyRegions.filter(r => r.status === 'critical').length;
  const alertCount = bodyRegions.filter(r => r.status === 'alert').length;

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionTitle subtitle="Vista general del estado de cada zona del cuerpo de Roro. Haz clic en un punto para ver detalles y notas clínicas.">
        Mapa corporal
      </SectionTitle>

      {/* Stats row */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'Todos', count: bodyRegions.length },
          { key: 'critical', label: '🔴 Crítico', count: criticalCount },
          { key: 'alert', label: '🟡 Alerta', count: alertCount },
          { key: 'monitor', label: '🔵 Monitoreo', count: bodyRegions.filter(r => r.status === 'monitor').length },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filter === f.key
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Body SVG */}
        <Card className="flex items-center justify-center p-6">
          <svg viewBox="0 0 200 400" className="w-full max-w-[240px]" style={{ height: 'auto' }}>
            {/* Simple body silhouette */}
            <defs>
              <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e7e5e4" />
                <stop offset="100%" stopColor="#d6d3d1" />
              </linearGradient>
            </defs>
            {/* Head */}
            <circle cx="100" cy="35" r="25" fill="url(#bodyGrad)" stroke="#a8a29e" strokeWidth="1" />
            {/* Neck */}
            <rect x="90" y="60" width="20" height="15" rx="3" fill="url(#bodyGrad)" stroke="#a8a29e" strokeWidth="1" />
            {/* Torso */}
            <path d="M60 75 Q55 85 55 120 L55 200 Q55 220 70 230 L130 230 Q145 220 145 200 L145 120 Q145 85 140 75 Z" fill="url(#bodyGrad)" stroke="#a8a29e" strokeWidth="1" />
            {/* Arms */}
            <path d="M55 85 Q30 95 20 150 Q18 160 25 165 Q32 160 35 150 Q42 115 55 105" fill="url(#bodyGrad)" stroke="#a8a29e" strokeWidth="1" />
            <path d="M145 85 Q170 95 180 150 Q182 160 175 165 Q168 160 165 150 Q158 115 145 105" fill="url(#bodyGrad)" stroke="#a8a29e" strokeWidth="1" />
            {/* Legs */}
            <path d="M70 230 L65 330 Q63 345 70 350 L85 350 Q90 345 88 330 L95 240" fill="url(#bodyGrad)" stroke="#a8a29e" strokeWidth="1" />
            <path d="M130 230 L135 330 Q137 345 130 350 L115 350 Q110 345 112 330 L105 240" fill="url(#bodyGrad)" stroke="#a8a29e" strokeWidth="1" />

            {/* Region markers */}
            {filtered.map(region => {
              const status = statusColors[region.status];
              const isSelected = selected?.id === region.id;
              return (
                <g key={region.id} onClick={() => setSelected(region)} className="cursor-pointer">
                  {status.pulse && (
                    <circle cx={region.x} cy={region.y} r={10} className={`${status.bg} opacity-30`}>
                      <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={region.x} cy={region.y} r={isSelected ? 8 : 6}
                    className={`${status.bg} transition-all duration-200`}
                    stroke="white" strokeWidth={2}
                    opacity={0.9}
                  />
                  {isSelected && (
                    <circle cx={region.x} cy={region.y} r={12} fill="none" stroke="currentColor" strokeWidth={1.5} className="text-stone-900 animate-pulse" />
                  )}
                </g>
              );
            })}
          </svg>
        </Card>

        {/* Details panel */}
        <div className="space-y-3">
          {selected ? (
            <Card className="animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusColors[selected.status].bg}`} />
                  <h3 className="text-base font-semibold text-stone-900">{selected.label}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[selected.status].pill}`}>
                    {statusColors[selected.status].label}
                  </span>
                  <button onClick={() => setSelected(null)} className="p-1 text-stone-400 hover:text-stone-600 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
                <p className="text-sm text-stone-700 leading-relaxed">{selected.notes}</p>
              </div>
            </Card>
          ) : (
            <Card tone="muted">
              <div className="flex items-center gap-2 text-stone-400 py-4 justify-center">
                <MapPin className="w-4 h-4" />
                <p className="text-sm">Toca un punto en el mapa para ver detalles</p>
              </div>
            </Card>
          )}

          {/* Quick list */}
          <Card>
            <h3 className="text-sm font-semibold text-stone-900 mb-3">Resumen por zona</h3>
            <div className="space-y-2">
              {filtered.map(region => {
                const status = statusColors[region.status];
                return (
                  <button
                    key={region.id}
                    onClick={() => setSelected(region)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all hover:bg-stone-50 ${
                      selected?.id === region.id ? 'bg-stone-50 ring-1 ring-stone-200' : ''
                    }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${status.bg} flex-none`} />
                    <span className="text-sm text-stone-800 flex-1">{region.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${status.pill}`}>
                      {status.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Legend */}
          <Card tone="info">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-stone-700"><strong>Crítico</strong> — acción inmediata</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-stone-700"><strong>Alerta</strong> — vigilancia activa</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span className="text-stone-700"><strong>Monitoreo</strong> — revisión periódica</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-stone-700"><strong>Normal</strong> — sin novedad</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
