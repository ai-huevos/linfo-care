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

/* ──────────────────────────────────────────────────────────────────────────
   DATA
   Coordinates are percentages over the body stage (0–100).
   `side` is which face ('front' | 'back') the marker belongs to.
   `organ` triggers a holographic anatomical overlay when selected.
   ────────────────────────────────────────────────────────────────────────── */
// Positions are % of the body frame (which matches the SVG's 200×520 viewBox).
// x_pct = x_viewBox / 2   ·   y_pct = y_viewBox / 5.2
//
// Findings reconciled against:
//   • PET/CT 18F-FDG del 07/04/2026 (Research/1304 CO80232782 PET SCAN INFORME.pdf)
//   • Mielograma del 14/04/2026, informe 17/04/2026 (Research/Patologia Mielograma.pdf)
//   • Biopsia duodenal 08/04/2026 (Research/Patologia Estomago.pdf)
//   • Radiografías de tórax 15–16/04/2026
// Coordinates derive from the new 200×520 silhouette. Conversion:
//   x_pct = x_viewBox / 2      ·      y_pct = y_viewBox / 5.2
// Anatomy convention: figure FACES the viewer. Patient's LEFT = viewer's RIGHT.
// So "Izquierda" markers sit at x > 50%, "Derecha" markers at x < 50%.
const BODY_REGIONS = [
  // CRITICAL — compromiso neoplásico documentado por PET o biopsia
  { id: 'chest-l',  side: 'front', x: 61,   y: 29,   severity: 'critical', organ: 'lung-left',
    label: 'Pulmón/Pleura Izquierda',
    notes: 'Derrame pleural izquierdo persistente (RX 16/04). Nódulo LSI apicoposterior SUVmax 12.2, 16 mm (PET 07/04). Vigilar disnea y saturación.' },
  { id: 'chest-r',  side: 'front', x: 39,   y: 29,   severity: 'critical', organ: 'lung-right',
    label: 'Pulmón Derecho',
    notes: 'Nódulo LSD anterior SUVmax 14.6 de 22 mm; LSD apical SUVmax 13.5 de 17 mm. Tubo de toracostomía en base pulmonar derecha. Enfisema subcutáneo pared derecha.' },
  { id: 'spleen',   side: 'front', x: 60,   y: 40,   severity: 'critical', organ: 'spleen',
    label: 'Bazo',
    notes: 'Bazo 11.2 cm con aumento difuso del metabolismo. Lesión hipermetabólica polo superior SUVmax 25.6 de 42×46 mm — sospecha de infiltración neoplásica.' },
  { id: 'pelvis',   side: 'front', x: 50,   y: 59,   severity: 'critical', organ: 'pelvis',
    label: 'Médula Ósea · Pelvis',
    notes: 'Mielograma (17/04): infiltración masiva por linfoma B difuso de células grandes — 70% de celularidad tumoral. Lesiones líticas en ilíacos SUVmax 7.7, sacro y fémures. Riesgo de fractura patológica.' },
  // ALERT — adenopatías activas, compromiso óseo localizado, riesgo inminente
  { id: 'neck',     side: 'front', x: 50,   y: 16,   severity: 'alert',
    label: 'Ganglios Cervicales',
    notes: 'Adenopatías supraclaviculares bilaterales, predominio izquierdo. SUVmax 10.3, 11×18 mm. Foco en cartílago tiroides derecho SUVmax 4.2. Tiroides sin lesiones.' },
  { id: 'mediastinum', side: 'front', x: 50, y: 32,  severity: 'alert',
    label: 'Ganglios Mediastinales',
    notes: 'Adenopatías prevasculares, paratraqueales, subaórticas, subcarinales e hiliares bilaterales. Dominantes: subcarinal SUVmax 11.9 (21 mm); hiliar derecho SUVmax 11.1 (27 mm).' },
  { id: 'ribs-r',   side: 'front', x: 34,   y: 36,   severity: 'alert',
    label: 'Costillas Derechas',
    notes: 'Fractura del 11º arco costal posterior derecho. Lesión de tejidos blandos en 3er arco costal. 2ª unión costovertebral SUVmax 9.3. Manejo activo del dolor.' },
  { id: 'abdomen-ln', side: 'front', x: 50, y: 51,   severity: 'alert',
    label: 'Ganglios Abdominales',
    notes: 'Conglomerados en hilio hepático, retrocrural, periesplénico SUVmax 26.7 (23 mm), peripancreático SUVmax 20.7, mesentérico SUVmax 13.7 (28×39 mm).' },
  { id: 'stomach',  side: 'front', x: 52,   y: 44,   severity: 'alert',
    label: 'Duodeno / Estómago',
    notes: 'Biopsia duodenal (12/04): linfoma B difuso fenotipo activado (Hans). Gastritis crónica con atrofia severa antral (OLGA 4). H. pylori negativo.' },
  // MONITOR — sin compromiso documentado o profiláctico
  { id: 'head',     side: 'front', x: 50,   y: 8,    severity: 'monitor',
    label: 'Cabeza',
    notes: 'Parénquima cerebral normal en PET. TAC cráneo (12/04): ateromatosis carotídea intracraneana. Vigilar orientación y delirio nocturno.' },
  { id: 'mouth',    side: 'front', x: 50,   y: 11,   severity: 'monitor',
    label: 'Boca',
    notes: 'Profilaxis mucositis: enjuague con bicarbonato 4–6 veces/día. Revisar placas blancas (candidiasis).' },
  { id: 'heart',    side: 'front', x: 54,   y: 30,   severity: 'monitor', organ: 'heart',
    label: 'Corazón',
    notes: 'Riesgo de cardiotoxicidad por doxorrubicina (R-CHOP). Ecocardiograma basal obligatorio antes de cada ciclo.' },
  { id: 'liver',    side: 'front', x: 40,   y: 40,   severity: 'monitor', organ: 'liver',
    label: 'Hígado',
    notes: 'Hígado 16 cm sin lesiones hipermetabólicas en PET. Función hepática a verificar antes de cada ciclo.' },
  { id: 'legs',     side: 'front', x: 42,   y: 77,   severity: 'alert',
    label: 'Fémures',
    notes: 'Lesiones hipermetabólicas en tercio proximal de ambos fémures y tercio medio del fémur derecho (SUVmax 7.9). Riesgo de fractura patológica — movilizar con precaución.' },
  // BACK VIEW
  { id: 'spine',    side: 'back',  x: 50,   y: 42,   severity: 'critical', organ: 'spine',
    label: 'Columna',
    notes: 'Múltiples cuerpos vertebrales comprometidos. C1 derecho SUVmax 6.5, apófisis espinosa C2. Sacro con hipermetabolismo. Monitorear dolor radicular y déficit neurológico.' },
  { id: 'kidneys',  side: 'back',  x: 50,   y: 50,   severity: 'monitor', organ: 'kidneys',
    label: 'Riñones',
    notes: 'Creatinina 0.94 mg/dL (18/04) — función renal preservada. Hidratación agresiva para prevenir síndrome de lisis tumoral.' },
  { id: 'skin',     side: 'back',  x: 50,   y: 62,   severity: 'monitor',
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

/* ──────────────────────────────────────────────────────────────────────────
   STYLESHEET (scoped via a unique class prefix so it doesn't leak globally)
   ────────────────────────────────────────────────────────────────────────── */
const SCENE_CSS = `
.lc-scene {
  position: relative;
  min-height: 100vh;
  margin: -1.5rem;
  padding: 1.5rem;
  background:
    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(56,189,248,0.12), transparent 60%),
    radial-gradient(ellipse 60% 60% at 50% 120%, rgba(139,92,246,0.10), transparent 60%),
    linear-gradient(180deg, #0b1120 0%, #0f172a 50%, #020617 100%);
  color: #e2e8f0;
  overflow: hidden;
  font-family: 'Inter', system-ui, sans-serif;
}

/* Drifting particles */
.lc-particle {
  position: absolute;
  width: 2px; height: 2px;
  border-radius: 50%;
  background: #7dd3fc;
  box-shadow: 0 0 6px rgba(125,211,252,0.8);
  pointer-events: none;
  opacity: 0;
  animation: lc-float 12s linear infinite;
}
@keyframes lc-float {
  0%   { transform: translate(0,0) scale(0.6); opacity: 0; }
  10%  { opacity: 0.8; }
  90%  { opacity: 0.6; }
  100% { transform: translate(var(--dx, 20px), -160px) scale(1.2); opacity: 0; }
}

/* Stage + 3D rotor */
.lc-stage {
  position: relative;
  perspective: 1400px;
  touch-action: none;
  user-select: none;
  min-height: 560px;
}
.lc-rotor {
  position: relative;
  width: 100%;
  height: 560px;
  transform-style: preserve-3d;
  transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}
.lc-rotor.lc-dragging { transition: none; }
.lc-rotor.lc-entering { opacity: 0; transform: rotateY(-15deg) scale(0.98); }
.lc-rotor.lc-mounted  { opacity: 1; transition: opacity 900ms ease-out, transform 900ms cubic-bezier(0.22, 1, 0.36, 1); }

.lc-face {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.lc-face-back { transform: rotateY(180deg); }

/* Body frame — a sized box that matches the SVG aspect (200:520),
   so marker percentages align with the body's actual pixel space. */
.lc-body-frame {
  position: relative;
  height: 100%;
  aspect-ratio: 200 / 520;
  max-height: 560px;
}

/* Body SVG glow */
.lc-body-svg {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  filter:
    drop-shadow(0 0 12px rgba(56,189,248,0.35))
    drop-shadow(0 0 40px rgba(56,189,248,0.15));
  animation: lc-breathe 4.2s ease-in-out infinite;
}
@keyframes lc-breathe {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.012); }
}

.lc-body-entry path,
.lc-body-entry ellipse,
.lc-body-entry circle {
  stroke-dasharray: 1400;
  stroke-dashoffset: 1400;
  animation: lc-draw 2.2s ease-out forwards;
}
@keyframes lc-draw { to { stroke-dashoffset: 0; } }

/* Markers */
.lc-markers { position: absolute; inset: 0; pointer-events: none; }
.lc-marker {
  position: absolute;
  width: 18px; height: 18px;
  margin-left: -9px; margin-top: -9px;
  pointer-events: auto;
  cursor: pointer;
  transition: transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.lc-marker:hover { transform: scale(1.3); }
.lc-marker.lc-selected { transform: scale(1.55); }

.lc-marker-core {
  position: absolute; inset: 4px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #fff 0%, var(--dot) 50%, var(--dot) 100%);
  box-shadow:
    0 0 0 2px rgba(255,255,255,0.22),
    0 0 10px var(--glow),
    0 0 22px var(--glow);
}
.lc-marker-ring {
  position: absolute; inset: 0;
  border-radius: 50%;
  border: 2px solid var(--dot);
  opacity: 0;
  animation: lc-pulse 2.2s ease-out infinite;
}
.lc-marker-ring.lc-r2 { animation-delay: 0.55s; }
.lc-marker-ring.lc-r3 { animation-delay: 1.10s; }
@keyframes lc-pulse {
  0%   { transform: scale(0.7); opacity: 0.85; }
  70%  { opacity: 0; }
  100% { transform: scale(3.0); opacity: 0; }
}

/* Marker label tooltip (hover / selected) */
.lc-marker-label {
  position: absolute;
  top: 110%; left: 50%;
  transform: translateX(-50%) translateY(4px);
  background: rgba(2,6,23,0.85);
  border: 1px solid rgba(148,163,184,0.25);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 3px 7px;
  border-radius: 6px;
  font-size: 10px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #e2e8f0;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms ease, transform 200ms ease;
}
.lc-marker:hover .lc-marker-label,
.lc-marker.lc-selected .lc-marker-label {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* Organ overlay — holographic glass */
.lc-organ {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
  animation: lc-organ-in 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes lc-organ-in {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}

/* Detail panel (dark glass) — readable frosted edge against the scene gradient */
.lc-glass {
  background:
    linear-gradient(135deg, rgba(71,85,105,0.28) 0%, rgba(15,23,42,0.55) 100%),
    linear-gradient(180deg, rgba(30,41,59,0.78) 0%, rgba(15,23,42,0.70) 100%);
  border: 1px solid rgba(148,163,184,0.32);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-radius: 20px;
  box-shadow:
    0 0 0 1px rgba(148,163,184,0.08),          /* subtle outer ring */
    0 24px 48px -12px rgba(2,6,23,0.55),       /* ambient drop */
    inset 0 1px 0 rgba(255,255,255,0.06),      /* top highlight */
    inset 0 -1px 0 rgba(0,0,0,0.35);           /* bottom anchor */
}
.lc-glass-critical { border-color: rgba(255,77,110,0.45); box-shadow: 0 0 0 1px rgba(255,77,110,0.25), 0 24px 48px -12px rgba(2,6,23,0.6), inset 0 1px 0 rgba(255,255,255,0.06); }
.lc-glass-alert    { border-color: rgba(251,191,36,0.45); }
.lc-glass-monitor  { border-color: rgba(56,189,248,0.45); }

.lc-filter-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(148,163,184,0.22);
  background: rgba(15,23,42,0.55);
  color: #cbd5e1;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 500;
  transition: all 220ms ease;
  cursor: pointer;
}
.lc-filter-btn:hover { background: rgba(30,41,59,0.8); color: #f1f5f9; }
.lc-filter-btn.lc-active {
  background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
  color: #0b1120;
  border-color: transparent;
  box-shadow: 0 0 20px rgba(56,189,248,0.35);
}

.lc-zone-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 180ms ease;
  background: transparent;
  text-align: left;
  width: 100%;
  border: none;
  color: inherit;
}
.lc-zone-row:hover { background: rgba(51,65,85,0.4); }
.lc-zone-row.lc-active { background: rgba(56,189,248,0.12); }

.lc-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 10px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-weight: 600;
}

.lc-rotate-hint {
  position: absolute;
  bottom: 14px; left: 50%;
  transform: translateX(-50%);
  display: inline-flex; align-items: center; gap: 6px;
  color: #64748b;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  pointer-events: none;
  animation: lc-hint-fade 4s ease-in-out infinite;
}
@keyframes lc-hint-fade { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.9; } }

/* Grid overlay (sci-fi reticle) */
.lc-reticle {
  position: absolute; inset: 24px;
  border: 1px solid rgba(56,189,248,0.08);
  border-radius: 12px;
  pointer-events: none;
}
.lc-reticle::before, .lc-reticle::after {
  content: ''; position: absolute;
  background: rgba(56,189,248,0.15);
}
.lc-reticle::before { left: 50%; top: 0; bottom: 0; width: 1px; }
.lc-reticle::after  { top: 50%; left: 0; right: 0; height: 1px; }

/* Mobile tweaks */
@media (max-width: 768px) {
  .lc-rotor { height: 460px; }
  .lc-body-svg { max-height: 460px; }
  .lc-scene { margin: -1rem; padding: 1rem; min-height: auto; }
}
`;

/* ──────────────────────────────────────────────────────────────────────────
   SVG: BODY SILHOUETTE
   Shared anatomical silhouette in a 200×520 viewBox, built on the 8-heads
   proportional rule with elderly-cachectic adjustments (narrow shoulders-
   to-waist-to-hip curvature, thin arms/legs). Front and back views share
   the exact same silhouette so the 3D rotor preserves shape — they only
   differ in the internal structural hints (ribs/clavicles vs spine/scapulae).
   ────────────────────────────────────────────────────────────────────────── */

// 8-heads proportions on a 200×520 canvas
// head: width 40, height 52 (cy 42, so crown y=16, chin y=68)
// shoulder width: 2.2× head ≈ 88 (x=56 to x=144 at deltoid peak y=108)
// waist: 1.3× head ≈ 52 (x=74 to x=126 at y=236)
// hip: 1.65× head ≈ 66 (x=67 to x=133 at y=292)
// crotch y=328 · knee y=446 · ankle y=498
const SILHOUETTE = {
  head: { cx: 100, cy: 42, rx: 20, ry: 26 },
  neck:
    'M 89 66 L 87 90 Q 100 94 113 90 L 111 66 Q 100 70 89 66 Z',
  // Torso: trap→shoulder peak→armpit→ribcage→waist (narrowest)→hip flare→inner thigh
  torso:
    'M 87 90 ' +
    'Q 74 94 64 106 ' +         // trapezius slope to shoulder
    'Q 58 118 66 134 ' +        // deltoid cap down to armpit
    'Q 70 160 70 184 ' +        // upper ribcage side
    'Q 74 212 76 236 ' +        // ribcage narrowing to waist
    'Q 70 266 68 292 ' +        // hip flare
    'Q 72 316 82 328 ' +        // hip down to thigh top
    'L 118 328 ' +              // crotch line
    'Q 128 316 132 292 ' +      // right hip
    'Q 130 266 124 236 ' +      // right waist
    'Q 126 212 130 184 ' +      // right ribcage
    'Q 130 160 134 134 ' +      // right armpit
    'Q 142 118 136 106 ' +      // right deltoid peak
    'Q 126 94 113 90 Z',        // back to trap base
  // Left arm hangs from deltoid, tapering through forearm to a small hand.
  // Arm length ≈ 245 units (47% of body height) — fingertips end mid-thigh.
  armL:
    'M 58 108 ' +
    'Q 44 140 40 184 ' +        // outer upper arm (bicep bulge)
    'Q 36 232 36 278 ' +        // elbow
    'Q 34 318 40 346 ' +        // forearm to wrist
    'Q 44 354 50 348 ' +        // hand (closed fist)
    'L 54 318 ' +               // inner hand
    'Q 54 278 52 232 ' +        // inner forearm
    'Q 56 184 62 138 ' +        // inner upper arm (tricep)
    'Q 64 120 68 110 Z',        // return to shoulder/armpit
  armR:
    'M 142 108 ' +
    'Q 156 140 160 184 ' +
    'Q 164 232 164 278 ' +
    'Q 166 318 160 346 ' +
    'Q 156 354 150 348 ' +
    'L 146 318 ' +
    'Q 146 278 148 232 ' +
    'Q 144 184 138 138 ' +
    'Q 136 120 132 110 Z',
  // Legs — small gap at crotch, inner/outer asymmetry for natural stance
  legL:
    'M 70 332 ' +
    'Q 64 392 72 446 ' +
    'Q 70 476 78 500 ' +
    'L 94 500 ' +
    'Q 96 476 96 446 ' +
    'Q 98 392 98 332 Z',
  legR:
    'M 130 332 ' +
    'Q 136 392 128 446 ' +
    'Q 130 476 122 500 ' +
    'L 106 500 ' +
    'Q 104 476 104 446 ' +
    'Q 102 392 102 332 Z',
};

function Silhouette({ skinId, edgeId }) {
  const fill = `url(#${skinId})`;
  const edge = `url(#${edgeId})`;
  return (
    <g>
      {/* Arms drawn first so they sit BEHIND the torso at the shoulder */}
      <path d={SILHOUETTE.armL} fill={fill} stroke={edge} strokeWidth="1" strokeOpacity="0.65" />
      <path d={SILHOUETTE.armR} fill={fill} stroke={edge} strokeWidth="1" strokeOpacity="0.65" />
      {/* Legs */}
      <path d={SILHOUETTE.legL} fill={fill} stroke={edge} strokeWidth="1" strokeOpacity="0.65" />
      <path d={SILHOUETTE.legR} fill={fill} stroke={edge} strokeWidth="1" strokeOpacity="0.65" />
      {/* Torso covers arm attachment points cleanly */}
      <path d={SILHOUETTE.torso} fill={fill} stroke={edge} strokeWidth="1.2" strokeOpacity="0.82" />
      {/* Neck & head on top */}
      <path d={SILHOUETTE.neck} fill={fill} stroke={edge} strokeWidth="1" strokeOpacity="0.7" />
      <ellipse
        cx={SILHOUETTE.head.cx} cy={SILHOUETTE.head.cy}
        rx={SILHOUETTE.head.rx} ry={SILHOUETTE.head.ry}
        fill={fill} stroke={edge} strokeWidth="1.2" strokeOpacity="0.78"
      />
    </g>
  );
}

function BodyFrontSVG() {
  return (
    <svg className="lc-body-svg lc-body-entry" viewBox="0 0 200 520" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lc-skin" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"   stopColor="rgba(125,211,252,0.35)" />
          <stop offset="40%"  stopColor="rgba(56,189,248,0.22)" />
          <stop offset="100%" stopColor="rgba(129,140,248,0.18)" />
        </linearGradient>
        <linearGradient id="lc-edge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <radialGradient id="lc-chest-pulse" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(125,211,252,0.35)" />
          <stop offset="100%" stopColor="rgba(125,211,252,0)" />
        </radialGradient>
      </defs>

      <Silhouette skinId="lc-skin" edgeId="lc-edge" />

      {/* Front-specific: clavicles, sternum, ribs, pelvic brim */}
      <g stroke="rgba(255,255,255,0.16)" strokeWidth="0.8" fill="none">
        {/* Clavicles — from sternal notch out to acromion */}
        <path d="M 100 98 Q 82 104 64 108" />
        <path d="M 100 98 Q 118 104 136 108" />
        {/* Sternum */}
        <line x1="100" y1="104" x2="100" y2="196" />
        {/* Ribs — 5 arcs at decreasing curvature */}
        <path d="M 72 128 Q 100 118 128 128" />
        <path d="M 68 148 Q 100 138 132 148" />
        <path d="M 68 170 Q 100 160 132 170" />
        <path d="M 72 192 Q 100 184 128 192" />
        <path d="M 76 212 Q 100 204 124 212" />
        {/* Iliac crests / pelvic brim */}
        <path d="M 70 290 Q 100 310 130 290" />
      </g>

      {/* Breathing halo over the heart/chest */}
      <circle cx="100" cy="156" r="34" fill="url(#lc-chest-pulse)" opacity="0.55">
        <animate attributeName="r" values="30;40;30" dur="4.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function BodyBackSVG() {
  return (
    <svg className="lc-body-svg lc-body-entry" viewBox="0 0 200 520" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lc-skin-b" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"   stopColor="rgba(129,140,248,0.28)" />
          <stop offset="50%"  stopColor="rgba(56,189,248,0.22)" />
          <stop offset="100%" stopColor="rgba(125,211,252,0.18)" />
        </linearGradient>
        <linearGradient id="lc-edge-b" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#818cf8" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
      </defs>

      <Silhouette skinId="lc-skin-b" edgeId="lc-edge-b" />

      {/* Back-specific: spine, scapulae, kidneys */}
      <g stroke="rgba(255,255,255,0.32)" strokeWidth="1.1" fill="none">
        <path d="M 100 92 L 100 322" strokeDasharray="4 3" />
        {Array.from({ length: 16 }).map((_, i) => {
          const y = 100 + i * 14;
          const w = 6 + (i > 8 ? (i - 8) * 0.4 : 0); // widen slightly toward lumbar
          return <line key={i} x1={100 - w} y1={y} x2={100 + w} y2={y} strokeWidth="0.9" />;
        })}
      </g>

      {/* Scapulae */}
      <g stroke="rgba(255,255,255,0.18)" strokeWidth="0.9" fill="none">
        <path d="M 72 120 Q 80 148 92 160" />
        <path d="M 128 120 Q 120 148 108 160" />
      </g>

      {/* Kidneys — retroperitoneal, roughly T12-L3, right slightly lower */}
      <g fill="rgba(251,191,36,0.10)" stroke="rgba(251,191,36,0.38)" strokeWidth="0.9">
        <path d="M 80 232 Q 74 252 82 278 Q 92 286 94 268 Q 96 248 88 234 Z" />
        <path d="M 120 238 Q 126 256 118 282 Q 108 290 106 272 Q 104 252 112 236 Z" />
      </g>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   ORGAN OVERLAY — shows when a zone with an organ is selected.
   Anatomical shapes in a glass container; positioned to float over the body.
   ────────────────────────────────────────────────────────────────────────── */
function OrganOverlay({ organ, color }) {
  if (!organ) return null;

  const shapes = {
    'lung-right': (
      <path d="M40 20 Q20 40 24 110 Q30 160 70 170 Q80 120 78 70 Q76 34 60 22 Q50 16 40 20 Z" />
    ),
    'lung-left': (
      <path d="M160 20 Q180 40 176 110 Q170 160 130 170 Q120 120 122 70 Q124 34 140 22 Q150 16 160 20 Z" />
    ),
    spleen: (
      <path d="M140 80 Q120 100 126 150 Q140 170 170 158 Q182 140 178 110 Q170 82 150 76 Q144 76 140 80 Z" />
    ),
    liver: (
      <path d="M40 60 Q20 90 30 140 Q70 170 130 160 Q150 120 130 80 Q100 60 70 62 Q50 60 40 60 Z" />
    ),
    heart: (
      <path d="M100 60 Q70 40 60 80 Q60 120 100 160 Q140 120 140 80 Q130 40 100 60 Z" />
    ),
    kidneys: (
      <g>
        <path d="M60 60 Q40 90 50 140 Q80 160 90 130 Q96 100 80 70 Q70 56 60 60 Z" />
        <path d="M140 60 Q160 90 150 140 Q120 160 110 130 Q104 100 120 70 Q130 56 140 60 Z" />
      </g>
    ),
    spine: (
      <g>
        <rect x="90" y="20" width="20" height="160" rx="4" />
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse key={i} cx="100" cy={30 + i * 20} rx="14" ry="6" fillOpacity="0.4" />
        ))}
      </g>
    ),
    pelvis: (
      <path d="M30 60 Q40 140 100 170 Q160 140 170 60 Q150 80 120 90 Q100 94 80 90 Q50 80 30 60 Z" />
    ),
  };

  const shape = shapes[organ];
  if (!shape) return null;

  return (
    <div className="lc-organ" aria-hidden>
      <svg viewBox="0 0 200 200" style={{ width: '55%', height: '55%', opacity: 0.85 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={`lc-organ-g-${organ}`} cx="50%" cy="40%" r="70%">
            <stop offset="0%"   stopColor={color} stopOpacity="0.55" />
            <stop offset="60%"  stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </radialGradient>
          <filter id={`lc-organ-blur-${organ}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>
        <g fill={`url(#lc-organ-g-${organ})`} stroke={color} strokeWidth="1.2" strokeOpacity="0.85" filter={`url(#lc-organ-blur-${organ})`}>
          {shape}
        </g>
      </svg>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PARTICLES — ~24 drifting dots, seeded once at module load.
   Randomness lives outside React's render pipeline to satisfy react-hooks/purity.
   ────────────────────────────────────────────────────────────────────────── */
const PARTICLE_DATA = Array.from({ length: 24 }).map((_, i) => ({
  key: i,
  left: Math.random() * 100,
  top: 70 + Math.random() * 30,
  dx: (Math.random() - 0.5) * 80,
  delay: Math.random() * 10,
  duration: 8 + Math.random() * 8,
  size: 1 + Math.random() * 2.5,
}));

function Particles() {
  return (
    <>
      {PARTICLE_DATA.map((d) => (
        <span
          key={d.key}
          className="lc-particle"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            animationDelay: `-${d.delay}s`,
            animationDuration: `${d.duration}s`,
            '--dx': `${d.dx}px`,
          }}
        />
      ))}
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
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
      <style>{SCENE_CSS}</style>
      <Particles />

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
        {/* STAGE */}
        <div
          ref={stageRef}
          className="lc-stage lc-glass"
          style={{ padding: 16 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="lc-reticle" />
          <div
            className={`lc-rotor ${mounted ? 'lc-mounted' : 'lc-entering'} ${isDragging ? 'lc-dragging' : ''}`}
            style={{ transform: `rotateY(${liveAngle}deg)` }}
          >
            {/* FRONT FACE */}
            <div className="lc-face">
              <div className="lc-body-frame">
              <BodyFrontSVG />
              {selected?.side === 'front' && selected.organ && (
                <OrganOverlay
                  organ={selected.organ}
                  color={SEVERITY[selected.severity].color}
                />
              )}
              <div className="lc-markers">
                {BODY_REGIONS.filter((r) => r.side === 'front' && (filter === 'all' || r.severity === filter)).map((r) => {
                  const sev = SEVERITY[r.severity];
                  const isSel = selected?.id === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleSelect(r); }}
                      className={`lc-marker ${isSel ? 'lc-selected' : ''}`}
                      style={{
                        left: `${r.x}%`,
                        top: `${r.y}%`,
                        '--dot': sev.color,
                        '--glow': sev.glow,
                      }}
                      aria-label={r.label}
                    >
                      {(r.severity === 'critical' || isSel) && (
                        <>
                          <span className="lc-marker-ring" />
                          <span className="lc-marker-ring lc-r2" />
                          <span className="lc-marker-ring lc-r3" />
                        </>
                      )}
                      <span className="lc-marker-core" />
                      <span className="lc-marker-label">{r.label}</span>
                    </button>
                  );
                })}
              </div>
              </div>
            </div>

            {/* BACK FACE */}
            <div className="lc-face lc-face-back">
              <div className="lc-body-frame">
              <BodyBackSVG />
              {selected?.side === 'back' && selected.organ && (
                <OrganOverlay
                  organ={selected.organ}
                  color={SEVERITY[selected.severity].color}
                />
              )}
              <div className="lc-markers">
                {BODY_REGIONS.filter((r) => r.side === 'back' && (filter === 'all' || r.severity === filter)).map((r) => {
                  const sev = SEVERITY[r.severity];
                  const isSel = selected?.id === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleSelect(r); }}
                      className={`lc-marker ${isSel ? 'lc-selected' : ''}`}
                      style={{
                        left: `${r.x}%`,
                        top: `${r.y}%`,
                        '--dot': sev.color,
                        '--glow': sev.glow,
                      }}
                      aria-label={r.label}
                    >
                      {(r.severity === 'critical' || isSel) && (
                        <>
                          <span className="lc-marker-ring" />
                          <span className="lc-marker-ring lc-r2" />
                          <span className="lc-marker-ring lc-r3" />
                        </>
                      )}
                      <span className="lc-marker-core" />
                      <span className="lc-marker-label">{r.label}</span>
                    </button>
                  );
                })}
              </div>
              </div>
            </div>
          </div>
          <span className="lc-rotate-hint">
            <RotateCcw className="w-3 h-3" /> arrastra para rotar
          </span>
        </div>

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
