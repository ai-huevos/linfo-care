import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  Eye,
  X,
  RotateCcw,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import BodyStage from '../../components/bodymap/BodyStage';

/* ──────────────────────────────────────────────────────────────────────────
   DATA
   Coordinates are percentages over the body stage (0–100).
   `side` is which face ('front' | 'back') the marker belongs to.
   `organ` triggers the glass-organ highlight when selected.
   ────────────────────────────────────────────────────────────────────────── */
// Positions are % of the body frame (which matches the SVG's 200×520 viewBox).
// x_pct = x_viewBox / 2   ·   y_pct = y_viewBox / 5.2
//
// Findings reconciled against:
//   • PET/CT 18F-FDG del 07/04/2026 (Research/1304 CO80232782 PET SCAN INFORME.pdf)
//   • Mielograma del 14/04/2026, informe 17/04/2026 (Research/Patologia Mielograma.pdf)
//   • Biopsia duodenal 08/04/2026 (Research/Patologia Estomago.pdf)
//   • Radiografías de tórax 15–16/04/2026
// Anatomy convention: figure FACES the viewer. Patient's LEFT = viewer's RIGHT.
// So "Izquierda" markers sit at x > 50%, "Derecha" markers at x < 50%.
// Landmarks: shoulder y=122 (23%), ribs y=134-222 (26-43%), waist y=264 (51%),
// hip y=320 (62%), crotch y=354 (68%), mid-thigh y=400 (77%).
const BODY_REGIONS = [
  // CRITICAL — compromiso neoplásico documentado por PET o biopsia
  { id: 'chest-l',  side: 'front', x: 62,   y: 33,   severity: 'critical', organ: 'lung-left',
    label: 'Pulmón/Pleura Izquierda',
    notes: 'Derrame pleural izquierdo persistente (RX 16/04). Nódulo LSI apicoposterior SUVmax 12.2, 16 mm (PET 07/04). Vigilar disnea y saturación.' },
  { id: 'chest-r',  side: 'front', x: 38,   y: 33,   severity: 'critical', organ: 'lung-right',
    label: 'Pulmón Derecho',
    notes: 'Nódulo LSD anterior SUVmax 14.6 de 22 mm; LSD apical SUVmax 13.5 de 17 mm. Tubo de toracostomía en base pulmonar derecha. Enfisema subcutáneo pared derecha.' },
  { id: 'spleen',   side: 'front', x: 63,   y: 43,   severity: 'critical', organ: 'spleen',
    label: 'Bazo',
    notes: 'Bazo 11.2 cm con aumento difuso del metabolismo. Lesión hipermetabólica polo superior SUVmax 25.6 de 42×46 mm — sospecha de infiltración neoplásica.' },
  { id: 'pelvis',   side: 'front', x: 50,   y: 64,   severity: 'critical', organ: 'pelvis',
    label: 'Médula Ósea · Pelvis',
    notes: 'Mielograma (17/04): infiltración masiva por linfoma B difuso de células grandes — 70% de celularidad tumoral. Lesiones líticas en ilíacos SUVmax 7.7, sacro y fémures. Riesgo de fractura patológica.' },
  // ALERT — adenopatías activas, compromiso óseo localizado, riesgo inminente
  { id: 'neck',     side: 'front', x: 50,   y: 19,   severity: 'alert',
    label: 'Ganglios Cervicales',
    notes: 'Adenopatías supraclaviculares bilaterales, predominio izquierdo. SUVmax 10.3, 11×18 mm. Foco en cartílago tiroides derecho SUVmax 4.2. Tiroides sin lesiones.' },
  { id: 'mediastinum', side: 'front', x: 50, y: 34,  severity: 'alert',
    label: 'Ganglios Mediastinales',
    notes: 'Adenopatías prevasculares, paratraqueales, subaórticas, subcarinales e hiliares bilaterales. Dominantes: subcarinal SUVmax 11.9 (21 mm); hiliar derecho SUVmax 11.1 (27 mm).' },
  { id: 'ribs-r',   side: 'front', x: 35,   y: 40,   severity: 'alert',
    label: 'Costillas Derechas',
    notes: 'Fractura del 11º arco costal posterior derecho. Lesión de tejidos blandos en 3er arco costal. 2ª unión costovertebral SUVmax 9.3. Manejo activo del dolor.' },
  { id: 'abdomen-ln', side: 'front', x: 50, y: 55,   severity: 'alert',
    label: 'Ganglios Abdominales',
    notes: 'Conglomerados en hilio hepático, retrocrural, periesplénico SUVmax 26.7 (23 mm), peripancreático SUVmax 20.7, mesentérico SUVmax 13.7 (28×39 mm).' },
  { id: 'stomach',  side: 'front', x: 54,   y: 47,   severity: 'alert',
    label: 'Duodeno / Estómago',
    notes: 'Biopsia duodenal (12/04): linfoma B difuso fenotipo activado (Hans). Gastritis crónica con atrofia severa antral (OLGA 4). H. pylori negativo.' },
  // MONITOR — sin compromiso documentado o profiláctico
  { id: 'head',     side: 'front', x: 50,   y: 9,    severity: 'monitor',
    label: 'Cabeza',
    notes: 'Parénquima cerebral normal en PET. TAC cráneo (12/04): ateromatosis carotídea intracraneana. Vigilar orientación y delirio nocturno.' },
  { id: 'mouth',    side: 'front', x: 50,   y: 14,   severity: 'monitor',
    label: 'Boca',
    notes: 'Profilaxis mucositis: enjuague con bicarbonato 4–6 veces/día. Revisar placas blancas (candidiasis).' },
  { id: 'heart',    side: 'front', x: 55,   y: 37,   severity: 'monitor', organ: 'heart',
    label: 'Corazón',
    notes: 'Riesgo de cardiotoxicidad por doxorrubicina (R-CHOP). Ecocardiograma basal obligatorio antes de cada ciclo.' },
  { id: 'liver',    side: 'front', x: 38,   y: 44,   severity: 'monitor', organ: 'liver',
    label: 'Hígado',
    notes: 'Hígado 16 cm sin lesiones hipermetabólicas en PET. Función hepática a verificar antes de cada ciclo.' },
  { id: 'legs',     side: 'front', x: 42,   y: 77,   severity: 'alert',
    label: 'Fémures',
    notes: 'Lesiones hipermetabólicas en tercio proximal de ambos fémures y tercio medio del fémur derecho (SUVmax 7.9). Riesgo de fractura patológica — movilizar con precaución.' },
  // BACK VIEW
  { id: 'spine',    side: 'back',  x: 50,   y: 44,   severity: 'critical', organ: 'spine',
    label: 'Columna',
    notes: 'Múltiples cuerpos vertebrales comprometidos. C1 derecho SUVmax 6.5, apófisis espinosa C2. Sacro con hipermetabolismo. Monitorear dolor radicular y déficit neurológico.' },
  { id: 'kidneys',  side: 'back',  x: 50,   y: 53,   severity: 'monitor', organ: 'kidneys',
    label: 'Riñones',
    notes: 'Creatinina 0.94 mg/dL (18/04) — función renal preservada. Hidratación agresiva para prevenir síndrome de lisis tumoral.' },
  { id: 'skin',     side: 'back',  x: 50,   y: 65,   severity: 'monitor',
    label: 'Piel',
    notes: 'Inmovilidad prolongada: revisar úlceras por presión cada turno. Cambio posicional cada 2 h. Plaquetas 118×10³/μL (15/04) — evitar trauma.' },
];

const SEVERITY = {
  critical: { color: '#ff4d6e', glow: 'rgba(255,77,110,0.70)', soft: 'rgba(255,77,110,0.15)', label: 'Crítico'   },
  alert:    { color: '#fbbf24', glow: 'rgba(251,191,36,0.60)', soft: 'rgba(251,191,36,0.15)', label: 'Alerta'    },
  monitor:  { color: '#38bdf8', glow: 'rgba(56,189,248,0.60)', soft: 'rgba(56,189,248,0.15)', label: 'Monitoreo' },
};

const FILTERS = [
  { key: 'all',      label: 'Todos',     icon: Eye },
  { key: 'critical', label: 'Crítico',   icon: AlertTriangle },
  { key: 'alert',    label: 'Alerta',    icon: Activity },
  { key: 'monitor',  label: 'Monitoreo', icon: Activity },
];

export default function BodyMapEnhanced() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('front'); // 'front' | 'back'
  const [mounted, setMounted] = useState(false);
  const [panelOpenMobile, setPanelOpenMobile] = useState(false);

  // Drag state
  const stageRef = useRef(null);
  const dragRef = useRef({ startX: 0, startView: 'front', active: false });
  const [dragDelta, setDragDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const regionsForView = BODY_REGIONS.filter((r) => r.side === view);
  const filtered =
    filter === 'all'
      ? regionsForView
      : regionsForView.filter((r) => r.severity === filter);
  const counts = {
    all: BODY_REGIONS.length,
    critical: BODY_REGIONS.filter((r) => r.severity === 'critical').length,
    alert: BODY_REGIONS.filter((r) => r.severity === 'alert').length,
    monitor: BODY_REGIONS.filter((r) => r.severity === 'monitor').length,
  };

  function handleSelect(region) {
    setSelected(region);
    if (region.side !== view) setView(region.side);
    setPanelOpenMobile(true);
  }

  function flipView() {
    setView((v) => (v === 'front' ? 'back' : 'front'));
  }

  /* Pointer drag → rotate between views on release */
  function onPointerDown(e) {
    if (e.target.closest('.lc-marker')) return; // don't start drag from a marker
    dragRef.current = { startX: e.clientX, startView: view, active: true };
    setIsDragging(true);
    stageRef.current?.setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e) {
    if (!dragRef.current.active) return;
    setDragDelta(e.clientX - dragRef.current.startX);
  }
  function onPointerUp(e) {
    if (!dragRef.current.active) return;
    const delta = e.clientX - dragRef.current.startX;
    dragRef.current.active = false;
    setIsDragging(false);
    setDragDelta(0);
    if (Math.abs(delta) > 70) flipView();
    stageRef.current?.releasePointerCapture?.(e.pointerId);
  }

  const baseAngle = view === 'back' ? 180 : 0;
  const liveAngle = baseAngle + dragDelta * 0.4;

  const selColors = selected ? SEVERITY[selected.severity] : null;

  return (
    <div className="lc-scene">
      {/* HEADER */}
      <header className="mb-5 relative z-10">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
              boxShadow: '0 0 20px rgba(56,189,248,0.4)',
            }}
          >
            <Activity className="w-4 h-4 text-slate-900" />
          </div>
          <h1
            className="text-2xl font-normal tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#f1f5f9' }}
          >
            Mapa corporal
          </h1>
        </div>
        <p className="text-sm max-w-2xl leading-relaxed" style={{ color: '#94a3b8' }}>
          Vista holográfica del estado clínico de Roro. Toca un punto para ver detalles.
          Arrastra horizontalmente para rotar entre vista frontal y posterior.
        </p>
      </header>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 mb-6 relative z-10">
        {FILTERS.map((f) => {
          const Icon = f.icon;
          const count = counts[f.key];
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`lc-filter-btn ${active ? 'lc-active' : ''}`}
            >
              <Icon className="w-3 h-3" />
              <span>{f.label}</span>
              <span style={{ opacity: 0.7 }}>· {count}</span>
            </button>
          );
        })}
        <button type="button" onClick={flipView} className="lc-filter-btn" title="Rotar">
          <RotateCcw className="w-3 h-3" />
          <span>{view === 'front' ? 'Frente' : 'Espalda'}</span>
        </button>
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr] relative z-10">
        <BodyStage
          view={view}
          selected={selected}
          regions={BODY_REGIONS}
          filter={filter}
          severityMap={SEVERITY}
          onSelect={handleSelect}
          mounted={mounted}
          isDragging={isDragging}
          liveAngle={liveAngle}
          stageRef={stageRef}
          dragHandlers={{
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onPointerCancel: onPointerUp,
          }}
        />

        {/* SIDE PANEL (desktop) / SHEET (mobile) */}
        <aside
          className={`space-y-4 ${panelOpenMobile ? 'block' : 'hidden'} lg:block`}
        >
          {/* Selected detail */}
          {selected ? (
            <div
              className={`lc-glass lc-glass-${selected.severity}`}
              style={{ padding: 18, animation: 'lc-organ-in 420ms cubic-bezier(0.34,1.56,0.64,1)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: selColors.color, boxShadow: `0 0 12px ${selColors.glow}` }}
                  />
                  <h3 className="text-base font-medium" style={{ color: '#f1f5f9' }}>
                    {selected.label}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelected(null); setPanelOpenMobile(false); }}
                  className="p-1 rounded-lg transition-colors"
                  style={{ color: '#64748b' }}
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <span
                className="lc-chip mb-3"
                style={{
                  background: selColors.soft,
                  color: selColors.color,
                  border: `1px solid ${selColors.soft}`,
                }}
              >
                {selColors.label}
              </span>
              <p
                className="text-sm leading-relaxed mt-3"
                style={{ color: '#cbd5e1' }}
              >
                {selected.notes}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
                <Eye className="w-3 h-3" />
                <span>Vista: {selected.side === 'front' ? 'Frontal' : 'Posterior'}</span>
              </div>
            </div>
          ) : (
            <div
              className="lc-glass"
              style={{ padding: 24, textAlign: 'center', color: '#64748b' }}
            >
              <Activity className="w-5 h-5 mx-auto mb-2" style={{ opacity: 0.5 }} />
              <p className="text-sm">Toca un punto del mapa para ver detalles clínicos.</p>
            </div>
          )}

          {/* Zone list */}
          <div className="lc-glass" style={{ padding: 14 }}>
            <div
              className="px-2 py-1 mb-1 text-xs font-semibold tracking-wider uppercase"
              style={{ color: '#94a3b8' }}
            >
              Zonas · {filtered.length}
            </div>
            <div className="space-y-0.5 max-h-[340px] overflow-y-auto">
              {filtered.length === 0 && (
                <div className="px-3 py-4 text-xs" style={{ color: '#64748b' }}>
                  Sin zonas para este filtro en la vista {view === 'front' ? 'frontal' : 'posterior'}.
                </div>
              )}
              {filtered.map((r) => {
                const sev = SEVERITY[r.severity];
                const isSel = selected?.id === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelect(r)}
                    className={`lc-zone-row ${isSel ? 'lc-active' : ''}`}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-none"
                      style={{ background: sev.color, boxShadow: `0 0 8px ${sev.glow}` }}
                    />
                    <span className="text-sm flex-1" style={{ color: '#e2e8f0' }}>
                      {r.label}
                    </span>
                    <span
                      className="lc-chip"
                      style={{
                        background: sev.soft,
                        color: sev.color,
                      }}
                    >
                      {sev.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="lc-glass" style={{ padding: 14 }}>
            <div
              className="px-2 py-1 mb-2 text-xs font-semibold tracking-wider uppercase"
              style={{ color: '#94a3b8' }}
            >
              Leyenda
            </div>
            <div className="grid grid-cols-1 gap-2 px-2 pb-1">
              {Object.entries(SEVERITY).map(([key, sev]) => (
                <div key={key} className="flex items-center gap-2.5 text-xs" style={{ color: '#cbd5e1' }}>
                  <span
                    className="w-2 h-2 rounded-full flex-none"
                    style={{ background: sev.color, boxShadow: `0 0 8px ${sev.glow}` }}
                  />
                  <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{sev.label}</span>
                  <span style={{ color: '#64748b' }}>
                    {key === 'critical' && '— acción inmediata'}
                    {key === 'alert' && '— vigilancia activa'}
                    {key === 'monitor' && '— revisión periódica'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile: "ver detalles" toggle when panel hidden */}
        {!panelOpenMobile && selected && (
          <button
            type="button"
            onClick={() => setPanelOpenMobile(true)}
            className="lg:hidden lc-filter-btn lc-active"
            style={{ justifySelf: 'center' }}
          >
            <Maximize2 className="w-3 h-3" /> Ver detalles
          </button>
        )}
        {panelOpenMobile && (
          <button
            type="button"
            onClick={() => setPanelOpenMobile(false)}
            className="lg:hidden lc-filter-btn"
            style={{ justifySelf: 'center' }}
          >
            <Minimize2 className="w-3 h-3" /> Ocultar panel
          </button>
        )}
      </div>
    </div>
  );
}
