import React from 'react';
import { RotateCcw } from 'lucide-react';
import BodySilhouette from './BodySilhouette';
import OrganGlassOverlay from './OrganGlassOverlay';
import BodyMarkers from './BodyMarkers';

/* ──────────────────────────────────────────────────────────────────────────
   STAGE — owns scoped CSS, particles, reticle, 3D rotor, and composes the
   silhouette + organs + markers per face. Stateless: parent owns selection,
   filter, view, drag state.
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

.lc-body-frame {
  position: relative;
  height: 100%;
  aspect-ratio: 200 / 520;
  max-height: 560px;
}

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
  background: transparent;
  border: 0;
  padding: 0;
  transition: transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.lc-marker:hover { transform: scale(1.35); }
.lc-marker.lc-selected { transform: scale(1.6); }
.lc-marker:focus-visible {
  outline: 2px solid var(--dot);
  outline-offset: 4px;
  border-radius: 50%;
}

.lc-marker-halo {
  position: absolute;
  left: 50%; top: 50%;
  width: 28px; height: 28px;
  margin-left: -14px; margin-top: -14px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--glow) 0%, transparent 65%);
  opacity: 0.55;
  pointer-events: none;
}

.lc-marker-capsule {
  position: absolute;
  left: 50%; top: 50%;
  width: 4px; height: 14px;
  transform: translate(-50%, -50%);
  border-radius: 2px;
  background: linear-gradient(180deg, var(--dot) 0%, var(--glow) 100%);
  box-shadow: 0 0 6px var(--glow), 0 0 14px var(--glow);
  pointer-events: none;
}

.lc-marker-core {
  position: absolute;
  left: 50%; top: 50%;
  width: 4px; height: 4px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 1px var(--dot);
  pointer-events: none;
}

.lc-marker-ring {
  position: absolute; inset: 0;
  border-radius: 50%;
  border: 2px solid var(--dot);
  opacity: 0;
  animation: lc-pulse 2.2s ease-out infinite;
  pointer-events: none;
}
.lc-marker-ring.lc-r2 { animation-delay: 0.55s; }
.lc-marker-ring.lc-r3 { animation-delay: 1.10s; }
@keyframes lc-pulse {
  0%   { transform: scale(0.7); opacity: 0.85; }
  70%  { opacity: 0; }
  100% { transform: scale(2.2); opacity: 0; }
}

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

/* Organ-in keyframe still used by the page's selected detail card animation */
@keyframes lc-organ-in {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}

/* Detail panel (dark glass) */
.lc-glass {
  background:
    linear-gradient(135deg, rgba(71,85,105,0.28) 0%, rgba(15,23,42,0.55) 100%),
    linear-gradient(180deg, rgba(30,41,59,0.78) 0%, rgba(15,23,42,0.70) 100%);
  border: 1px solid rgba(148,163,184,0.32);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-radius: 20px;
  box-shadow:
    0 0 0 1px rgba(148,163,184,0.08),
    0 24px 48px -12px rgba(2,6,23,0.55),
    inset 0 1px 0 rgba(255,255,255,0.06),
    inset 0 -1px 0 rgba(0,0,0,0.35);
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

@media (max-width: 768px) {
  .lc-rotor { height: 460px; }
  .lc-body-svg { max-height: 460px; }
  .lc-scene { margin: -1rem; padding: 1rem; min-height: auto; }
}
`;

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

export default function BodyStage({
  selected = null,
  regions = [],
  filter = 'all',
  severityMap,
  onSelect,
  mounted = true,
  isDragging = false,
  liveAngle = 0,
  dragHandlers = {},
  stageRef = null,
}) {
  const visible = (face) =>
    regions.filter((r) => r.side === face && (filter === 'all' || r.severity === filter));
  const frontVisible = visible('front');
  const backVisible = visible('back');
  const highlightColor = selected ? severityMap[selected.severity].color : null;

  return (
    <>
      <style>{SCENE_CSS}</style>
      <Particles />

      <div
        ref={stageRef}
        className="lc-stage lc-glass"
        style={{ padding: 16 }}
        {...dragHandlers}
      >
        <div className="lc-reticle" />
        <div
          className={`lc-rotor ${mounted ? 'lc-mounted' : 'lc-entering'} ${isDragging ? 'lc-dragging' : ''}`}
          style={{ transform: `rotateY(${liveAngle}deg)` }}
        >
          {/* FRONT FACE */}
          <div className="lc-face">
            <div className="lc-body-frame">
              <BodySilhouette view="front" />
              <OrganGlassOverlay
                view="front"
                selected={selected?.side === 'front' ? selected : null}
                highlightColor={selected?.side === 'front' ? highlightColor : null}
              />
              <BodyMarkers
                regions={frontVisible}
                selected={selected?.side === 'front' ? selected : null}
                severityMap={severityMap}
                onSelect={onSelect}
              />
            </div>
          </div>

          {/* BACK FACE */}
          <div className="lc-face lc-face-back">
            <div className="lc-body-frame">
              <BodySilhouette view="back" />
              <OrganGlassOverlay
                view="back"
                selected={selected?.side === 'back' ? selected : null}
                highlightColor={selected?.side === 'back' ? highlightColor : null}
              />
              <BodyMarkers
                regions={backVisible}
                selected={selected?.side === 'back' ? selected : null}
                severityMap={severityMap}
                onSelect={onSelect}
              />
            </div>
          </div>
        </div>
        <span className="lc-rotate-hint">
          <RotateCcw className="w-3 h-3" /> arrastra para rotar
        </span>
      </div>
    </>
  );
}
