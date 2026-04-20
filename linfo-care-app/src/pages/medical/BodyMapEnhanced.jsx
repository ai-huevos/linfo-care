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
// Coordinates derive from the anatomical silhouette. Conversion:
//   x_pct = x_viewBox / 2      ·      y_pct = y_viewBox / 5.2
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
  width: 14px; height: 14px;
  margin-left: -7px; margin-top: -7px;
  pointer-events: auto;
  cursor: pointer;
  transition: transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.lc-marker:hover { transform: scale(1.35); }
.lc-marker.lc-selected { transform: scale(1.6); }

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
  100% { transform: scale(2.2); opacity: 0; }
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

// Lean 7.5-heads proportions on a 200×520 canvas.
// The body is rendered as:  FILL layer (all parts, same gradient, no stroke) +
//                           OUTLINE layer (single stroke-only path tracing
//                                          the outer silhouette) +
//                           SKELETON + ORGANS layers on top.
// This yields a clean translucent "hologram" that reveals internal anatomy,
// like the reference.

const HEAD = { cx: 100, cy: 44, rx: 22, ry: 30 };

const NECK_FILL = 'M 88 72 L 86 102 Q 100 108 114 102 L 112 72 Q 100 78 88 72 Z';

// Torso fill — shoulders + ribcage + waist + hips as ONE piece
const TORSO_FILL =
  'M 86 98 ' +
  'Q 70 102 58 116 ' +          // trap slope to shoulder peak
  'Q 48 126 52 152 ' +           // deltoid cap
  'Q 60 156 70 156 ' +           // blend at armpit (rounded)
  'Q 72 186 70 216 ' +           // ribcage taper
  'Q 76 248 80 264 ' +           // to waist (narrowest)
  'Q 68 292 62 320 ' +           // hip flare
  'Q 66 344 80 354 ' +           // hip to inner thigh top
  'L 120 354 ' +                 // crotch line
  'Q 134 344 138 320 ' +         // right hip
  'Q 132 292 120 264 ' +         // right waist
  'Q 124 248 130 216 ' +         // right ribcage
  'Q 128 186 130 156 ' +         // right armpit
  'Q 140 156 148 152 ' +
  'Q 152 126 142 116 ' +
  'Q 130 102 114 98 ' +
  'Z';

// Arms — each fills into the torso silhouette at the shoulder, so the
// overlap is generous enough that no seam is visible.
const LEFT_ARM_FILL =
  'M 56 122 ' +
  'Q 40 152 36 198 ' +           // upper arm (bicep bulge at y≈200)
  'Q 32 248 32 294 ' +           // elbow through forearm
  'Q 32 336 38 358 ' +           // wrist
  'Q 42 372 50 368 ' +           // hand/fingertips
  'Q 56 358 54 338 ' +           // inner hand
  'Q 54 294 56 248 ' +           // inner forearm
  'Q 58 204 62 176 ' +           // inner upper arm
  'Q 64 152 72 132 ' +           // inner shoulder curve (overlaps torso)
  'Z';

const RIGHT_ARM_FILL =
  'M 144 122 ' +
  'Q 160 152 164 198 ' +
  'Q 168 248 168 294 ' +
  'Q 168 336 162 358 ' +
  'Q 158 372 150 368 ' +
  'Q 144 358 146 338 ' +
  'Q 146 294 144 248 ' +
  'Q 142 204 138 176 ' +
  'Q 136 152 128 132 ' +
  'Z';

// Legs — clear thigh→knee→calf→ankle taper
const LEFT_LEG_FILL =
  'M 68 354 ' +
  'Q 60 402 66 442 ' +           // outer thigh bulge to knee
  'Q 62 472 76 500 ' +           // calf bulge to ankle
  'L 94 500 ' +
  'Q 96 472 96 442 ' +           // inner calf
  'Q 98 402 96 354 ' +           // inner thigh
  'Z';

const RIGHT_LEG_FILL =
  'M 132 354 ' +
  'Q 140 402 134 442 ' +
  'Q 138 472 124 500 ' +
  'L 106 500 ' +
  'Q 104 472 104 442 ' +
  'Q 102 402 104 354 ' +
  'Z';

// Outer silhouette outline — ONE continuous path tracing the body edge.
// Fill="none", stroke only. This hides all internal part seams.
const BODY_OUTLINE =
  // Start at crown
  'M 100 14 ' +
  // Right side of head
  'Q 122 14 122 44 ' +
  'Q 122 66 114 72 ' +
  'L 112 78 ' +
  // Right neck
  'Q 126 90 140 108 ' +
  // Right shoulder/deltoid
  'Q 152 122 148 146 ' +
  // Right upper arm outer → forearm → wrist
  'Q 164 176 164 216 ' +
  'Q 168 264 168 306 ' +
  'Q 168 340 162 360 ' +
  // Right hand
  'Q 158 372 150 368 ' +
  'Q 144 358 146 340 ' +
  // Inner arm back up to armpit (traces the inner arm curve)
  'Q 144 302 142 260 ' +
  'Q 142 220 138 188 ' +
  'Q 134 162 130 148 ' +
  // Right side of torso going DOWN from armpit
  'Q 128 186 130 216 ' +
  'Q 124 248 120 264 ' +
  // Waist → hip
  'Q 132 292 138 320 ' +
  // Outer right thigh → knee → ankle
  'Q 134 344 130 354 ' +
  'Q 140 402 134 442 ' +
  'Q 138 472 124 500 ' +
  // Foot right (across)
  'L 104 500 ' +
  // Inner right leg back up to crotch
  'Q 104 472 104 442 ' +
  'Q 102 402 104 354 ' +
  'L 96 354 ' +
  // Inner left leg down
  'Q 98 402 96 442 ' +
  'Q 96 472 96 500 ' +
  'L 76 500 ' +
  // Outer left leg back up
  'Q 62 472 66 442 ' +
  'Q 60 402 70 354 ' +
  // Left hip → waist → ribcage (up)
  'Q 66 344 62 320 ' +
  'Q 68 292 80 264 ' +
  'Q 76 248 70 216 ' +
  'Q 72 186 70 148 ' +
  // Inner left arm DOWN to hand
  'Q 66 162 62 188 ' +
  'Q 58 220 58 260 ' +
  'Q 56 302 54 340 ' +
  'Q 56 358 50 368 ' +
  // Left hand and outer arm up
  'Q 42 372 38 360 ' +
  'Q 32 340 32 306 ' +
  'Q 32 264 36 216 ' +
  'Q 36 176 52 146 ' +
  // Left shoulder → trap → neck
  'Q 48 122 60 108 ' +
  'Q 74 90 88 78 ' +
  'L 86 72 ' +
  'Q 78 66 78 44 ' +
  'Q 78 14 100 14 ' +
  'Z';

function Silhouette({ skinId, edgeId }) {
  const fill = `url(#${skinId})`;
  const edge = `url(#${edgeId})`;
  return (
    <g>
      {/* FILL LAYER — all body parts rendered with same gradient, no strokes */}
      <g fill={fill} stroke="none">
        <ellipse cx={HEAD.cx} cy={HEAD.cy} rx={HEAD.rx} ry={HEAD.ry} />
        <path d={NECK_FILL} />
        <path d={LEFT_ARM_FILL} />
        <path d={RIGHT_ARM_FILL} />
        <path d={TORSO_FILL} />
        <path d={LEFT_LEG_FILL} />
        <path d={RIGHT_LEG_FILL} />
      </g>

      {/* OUTLINE LAYER — single stroke-only path tracing the full body edge */}
      <path d={BODY_OUTLINE} fill="none" stroke={edge} strokeWidth="1.2"
            strokeOpacity="0.85" strokeLinejoin="round" strokeLinecap="round" />

      {/* Head outline (ellipse handles its own smooth edge) */}
      <ellipse cx={HEAD.cx} cy={HEAD.cy} rx={HEAD.rx} ry={HEAD.ry}
               fill="none" stroke={edge} strokeWidth="1.2" strokeOpacity="0.85" />
    </g>
  );
}

function BodyFrontSVG() {
  return (
    <svg className="lc-body-svg lc-body-entry" viewBox="0 0 200 520" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lc-skin" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"   stopColor="rgba(125,211,252,0.32)" />
          <stop offset="40%"  stopColor="rgba(56,189,248,0.18)" />
          <stop offset="100%" stopColor="rgba(129,140,248,0.14)" />
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

      {/* ═══ INTERNAL ANATOMY (always visible through translucent skin) ═══ */}

      {/* Skull midline + brow */}
      <g fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="0.7" strokeLinecap="round">
        <line x1="100" y1="22" x2="100" y2="68" strokeDasharray="2 3" />
        <path d="M 84 42 Q 100 46 116 42" />
        <path d="M 94 54 Q 100 58 106 54" />
      </g>

      {/* Cervical spine through neck */}
      <line x1="100" y1="76" x2="100" y2="112" stroke="rgba(255,255,255,0.42)" strokeWidth="1" strokeDasharray="3 2" />

      {/* Clavicles */}
      <g stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path d="M 100 112 Q 84 118 58 124" />
        <path d="M 100 112 Q 116 118 142 124" />
      </g>

      {/* Ribcage — 8 pairs of ribs + sternum */}
      <g fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="1" strokeLinecap="round">
        {Array.from({ length: 8 }).map((_, i) => {
          const y = 134 + i * 11;
          // Ribs widen then narrow toward the waist (elliptical ribcage)
          const bulge = i < 4 ? 30 + i * 1.8 : 36 - (i - 4) * 2;
          const endY = y + 10;
          return (
            <g key={i}>
              <path d={`M 100 ${y - 2} Q ${100 - bulge} ${y + 4} ${100 - bulge * 0.5} ${endY}`} />
              <path d={`M 100 ${y - 2} Q ${100 + bulge} ${y + 4} ${100 + bulge * 0.5} ${endY}`} />
            </g>
          );
        })}
        <line x1="100" y1="122" x2="100" y2="228" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" />
      </g>

      {/* Lungs — bilateral, inside ribcage (low opacity for translucency) */}
      <g fill="rgba(125,211,252,0.08)" stroke="rgba(125,211,252,0.35)" strokeWidth="0.7">
        <path d="M 94 130 Q 80 140 72 172 Q 70 210 78 226 Q 92 228 96 218 Q 98 172 96 140 Z" />
        <path d="M 106 130 Q 120 140 128 172 Q 130 210 122 226 Q 108 228 104 218 Q 102 172 104 140 Z" />
      </g>

      {/* Heart — slightly left of midline, upper chest */}
      <g fill="rgba(244,114,182,0.14)" stroke="rgba(244,114,182,0.48)" strokeWidth="0.9">
        <path d="M 100 166 Q 92 170 92 186 Q 96 206 110 212 Q 120 200 116 184 Q 110 166 100 166 Z" />
      </g>

      {/* Liver — right upper abdomen (patient's right = viewer's left) */}
      <g fill="rgba(180,83,9,0.14)" stroke="rgba(180,83,9,0.46)" strokeWidth="0.8">
        <path d="M 68 220 Q 64 240 74 252 Q 98 256 104 242 Q 102 226 92 218 Q 80 216 68 220 Z" />
      </g>

      {/* Stomach — left upper abdomen */}
      <g fill="rgba(251,191,36,0.12)" stroke="rgba(251,191,36,0.42)" strokeWidth="0.8">
        <path d="M 108 226 Q 106 244 116 250 Q 128 248 130 234 Q 128 224 118 222 Q 112 222 108 226 Z" />
      </g>

      {/* Spleen — behind stomach, patient's left, mid-back but silhouetted here */}
      <g fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.38)" strokeWidth="0.7">
        <ellipse cx="126" cy="222" rx="6" ry="10" />
      </g>

      {/* Small intestine coil (central lower abdomen) */}
      <g fill="rgba(248,113,113,0.08)" stroke="rgba(248,113,113,0.30)" strokeWidth="0.6" strokeLinecap="round">
        <path d="M 80 264 Q 90 272 100 268 Q 110 272 120 264" />
        <path d="M 78 276 Q 90 284 100 280 Q 110 284 122 276" />
        <path d="M 80 288 Q 92 294 100 290 Q 108 294 120 288" />
      </g>

      {/* Pelvis bowl + iliac crests + pubic symphysis */}
      <g fill="none" stroke="rgba(255,255,255,0.46)" strokeWidth="1.2" strokeLinecap="round">
        <path d="M 64 308 Q 70 330 86 340" />
        <path d="M 136 308 Q 130 330 114 340" />
        <path d="M 86 340 Q 100 348 114 340" />
        <path d="M 94 332 L 94 352" />
        <path d="M 106 332 L 106 352" />
      </g>

      {/* Femur hints (thigh bones) */}
      <g stroke="rgba(255,255,255,0.28)" strokeWidth="1.1" fill="none" strokeLinecap="round">
        <path d="M 84 356 L 84 422" strokeDasharray="4 3" />
        <path d="M 116 356 L 116 422" strokeDasharray="4 3" />
      </g>

      {/* Patella (knee caps) */}
      <g fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.52)" strokeWidth="0.9">
        <ellipse cx="84" cy="436" rx="6" ry="5" />
        <ellipse cx="116" cy="436" rx="6" ry="5" />
      </g>

      {/* Tibia/fibula (lower leg bones) */}
      <g stroke="rgba(255,255,255,0.28)" strokeWidth="1.1" fill="none" strokeLinecap="round">
        <path d="M 86 446 L 88 492" strokeDasharray="4 3" />
        <path d="M 114 446 L 112 492" strokeDasharray="4 3" />
      </g>

      {/* Breathing halo over the heart/chest */}
      <circle cx="100" cy="184" r="34" fill="url(#lc-chest-pulse)" opacity="0.45">
        <animate attributeName="r" values="30;40;30" dur="4.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.25;0.5;0.25" dur="4.2s" repeatCount="indefinite" />
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

      {/* Back of skull seam */}
      <g fill="none" stroke="rgba(255,255,255,0.26)" strokeWidth="0.7" strokeLinecap="round">
        <line x1="100" y1="22" x2="100" y2="68" strokeDasharray="2 3" />
        <path d="M 82 34 Q 100 38 118 34" />
      </g>

      {/* Full spine — cervical + thoracic + lumbar + sacrum */}
      <g stroke="rgba(255,255,255,0.42)" strokeWidth="1.2" fill="none" strokeLinecap="round">
        <path d="M 100 76 L 100 348" strokeDasharray="3 2" />
      </g>
      <g stroke="rgba(255,255,255,0.58)" fill="rgba(255,255,255,0.08)" strokeWidth="0.9">
        {Array.from({ length: 22 }).map((_, i) => {
          const y = 86 + i * 12;
          const isLumbar = i > 14;
          const w = isLumbar ? 8 + (i - 14) * 0.4 : 6;
          return <ellipse key={i} cx="100" cy={y} rx={w} ry="3" />;
        })}
      </g>

      {/* Scapulae */}
      <g stroke="rgba(255,255,255,0.35)" strokeWidth="1.1" fill="rgba(255,255,255,0.04)" strokeLinecap="round">
        <path d="M 66 128 Q 60 160 82 186 Q 94 176 92 150 Q 86 132 74 126 Z" />
        <path d="M 134 128 Q 140 160 118 186 Q 106 176 108 150 Q 114 132 126 126 Z" />
      </g>

      {/* Back ribs (curving around from the sides) */}
      <g fill="none" stroke="rgba(255,255,255,0.24)" strokeWidth="0.9" strokeLinecap="round">
        {Array.from({ length: 6 }).map((_, i) => {
          const y = 148 + i * 12;
          const bulge = 28 + i * 1.5;
          return (
            <g key={i}>
              <path d={`M 100 ${y - 2} Q ${100 - bulge} ${y + 3} ${100 - bulge * 0.4} ${y + 10}`} />
              <path d={`M 100 ${y - 2} Q ${100 + bulge} ${y + 3} ${100 + bulge * 0.4} ${y + 10}`} />
            </g>
          );
        })}
      </g>

      {/* Kidneys — retroperitoneal, T12-L3, right slightly lower than left */}
      <g fill="rgba(251,191,36,0.14)" stroke="rgba(251,191,36,0.50)" strokeWidth="1">
        <path d="M 78 240 Q 68 262 80 294 Q 94 302 98 280 Q 100 256 90 242 Z" />
        <path d="M 122 248 Q 132 268 120 298 Q 106 306 102 284 Q 100 260 110 246 Z" />
      </g>

      {/* Pelvis (back view) — sacrum + ilium wings */}
      <g fill="none" stroke="rgba(255,255,255,0.46)" strokeWidth="1.2" strokeLinecap="round">
        <path d="M 64 310 Q 68 334 84 346" />
        <path d="M 136 310 Q 132 334 116 346" />
        <path d="M 94 340 L 94 360" />
        <path d="M 106 340 L 106 360" />
      </g>

      {/* Femur hints (back of thigh) */}
      <g stroke="rgba(255,255,255,0.26)" strokeWidth="1.1" fill="none" strokeLinecap="round">
        <path d="M 84 360 L 84 422" strokeDasharray="4 3" />
        <path d="M 116 360 L 116 422" strokeDasharray="4 3" />
      </g>

      {/* Popliteal (back of knee) */}
      <g fill="none" stroke="rgba(255,255,255,0.34)" strokeWidth="0.9" strokeLinecap="round">
        <path d="M 78 434 Q 84 438 90 434" />
        <path d="M 110 434 Q 116 438 122 434" />
      </g>

      {/* Calf bones from behind */}
      <g stroke="rgba(255,255,255,0.26)" strokeWidth="1.1" fill="none" strokeLinecap="round">
        <path d="M 86 446 L 88 492" strokeDasharray="4 3" />
        <path d="M 114 446 L 112 492" strokeDasharray="4 3" />
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
