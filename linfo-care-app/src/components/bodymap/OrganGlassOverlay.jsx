import React from 'react';

/* ──────────────────────────────────────────────────────────────────────────
   ORGAN GLASS OVERLAY — pure SVG, 200×520 viewBox, sits ABOVE BodySilhouette.
   Organs are always visible at low opacity (the "glassform" baseline). When
   `selected.organ` matches an organ id, that organ lights up + others dim.
   ────────────────────────────────────────────────────────────────────────── */

// Severity colors echoed locally so OrganGlassOverlay doesn't need to import
// from the page. Caller passes `highlightColor` for the active organ stroke.
const FRONT_ORGANS = [
  {
    id: 'lung-right',  // viewer's LEFT side = patient's right lung
    fill: 'rgba(125,211,252,0.18)',
    stroke: 'rgba(125,211,252,0.55)',
    d: 'M 94 130 Q 80 140 72 172 Q 70 210 78 226 Q 92 228 96 218 Q 98 172 96 140 Z',
  },
  {
    id: 'lung-left',   // viewer's RIGHT side = patient's left lung
    fill: 'rgba(125,211,252,0.18)',
    stroke: 'rgba(125,211,252,0.55)',
    d: 'M 106 130 Q 120 140 128 172 Q 130 210 122 226 Q 108 228 104 218 Q 102 172 104 140 Z',
  },
  {
    id: 'liver',       // viewer's left = patient's right upper abdomen
    fill: 'rgba(180,83,9,0.20)',
    stroke: 'rgba(217,119,6,0.65)',
    d: 'M 68 220 Q 64 240 74 252 Q 98 256 104 242 Q 102 226 92 218 Q 80 216 68 220 Z',
  },
  {
    id: 'stomach',     // viewer's right
    fill: 'rgba(251,191,36,0.18)',
    stroke: 'rgba(251,191,36,0.60)',
    d: 'M 108 226 Q 106 244 116 250 Q 128 248 130 234 Q 128 224 118 222 Q 112 222 108 226 Z',
  },
  {
    id: 'spleen',      // patient's left, behind stomach
    fill: 'rgba(239,68,68,0.20)',
    stroke: 'rgba(239,68,68,0.65)',
    d: 'M 120 212 Q 116 222 122 232 Q 132 232 132 220 Q 132 210 124 208 Q 121 208 120 212 Z',
  },
  {
    id: 'heart',       // slightly viewer-right of midline
    fill: 'rgba(244,114,182,0.18)',
    stroke: 'rgba(244,114,182,0.65)',
    d: 'M 100 166 Q 92 170 92 186 Q 96 206 110 212 Q 120 200 116 184 Q 110 166 100 166 Z',
  },
  {
    id: 'pelvis',      // pelvic basin glass
    fill: 'rgba(167,139,250,0.16)',
    stroke: 'rgba(167,139,250,0.55)',
    d: 'M 64 308 Q 70 336 100 348 Q 130 336 136 308 Q 124 320 100 322 Q 76 320 64 308 Z',
  },
];

// Decorative-only (always opacity 0.55, never highlightable — no marker uses these organ ids)
const FRONT_DECOR = [
  // intestine coil (3 lines)
  {
    id: 'intestines',
    stroke: 'rgba(248,113,113,0.30)',
    fill: 'none',
    paths: [
      'M 80 264 Q 90 272 100 268 Q 110 272 120 264',
      'M 78 276 Q 90 284 100 280 Q 110 284 122 276',
      'M 80 288 Q 92 294 100 290 Q 108 294 120 288',
    ],
  },
];

const BACK_ORGANS = [
  {
    id: 'kidneys',
    fill: 'rgba(251,191,36,0.20)',
    stroke: 'rgba(251,191,36,0.65)',
    // Two paths grouped — render both as part of the same highlightable id
    paths: [
      'M 78 240 Q 68 262 80 294 Q 94 302 98 280 Q 100 256 90 242 Z',
      'M 122 248 Q 132 268 120 298 Q 106 306 102 284 Q 100 260 110 246 Z',
    ],
  },
];

function applyState(organId, selectedOrganId, highlightColor) {
  const isActive = !!selectedOrganId && selectedOrganId === organId;
  const isDimmed = !!selectedOrganId && selectedOrganId !== organId;
  const opacity = isActive ? 1 : isDimmed ? 0.32 : 0.62;
  const strokeOverride = isActive && highlightColor ? highlightColor : null;
  return { isActive, opacity, strokeOverride };
}

export default function OrganGlassOverlay({ view = 'front', selected = null, highlightColor = null }) {
  const selectedOrganId = selected?.organ ?? null;
  const items = view === 'front' ? FRONT_ORGANS : BACK_ORGANS;

  return (
    <svg
      className="lc-organ-svg"
      viewBox="0 0 200 520"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <defs>
        {items.map((o) => (
          <radialGradient key={`g-${o.id}`} id={`lc-organg-${view}-${o.id}`} cx="50%" cy="40%" r="65%">
            <stop offset="0%"   stopColor={o.stroke} stopOpacity="0.55" />
            <stop offset="60%"  stopColor={o.stroke} stopOpacity="0.20" />
            <stop offset="100%" stopColor={o.stroke} stopOpacity="0.04" />
          </radialGradient>
        ))}
        <filter id={`lc-organ-blur-${view}`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.7" />
        </filter>
      </defs>

      {/* Decorative organs first (back-most) */}
      {view === 'front' && FRONT_DECOR.map((d) => (
        <g
          key={d.id}
          fill={d.fill}
          stroke={d.stroke}
          strokeWidth="0.6"
          strokeLinecap="round"
          opacity={selectedOrganId ? 0.25 : 0.5}
          style={{ transition: 'opacity 320ms ease' }}
        >
          {d.paths.map((p, i) => <path key={i} d={p} />)}
        </g>
      ))}

      {/* Highlightable organs */}
      {items.map((o) => {
        const { isActive, opacity, strokeOverride } = applyState(o.id, selectedOrganId, highlightColor);
        const stroke = strokeOverride ?? o.stroke;
        const strokeWidth = isActive ? 1.4 : 0.9;
        const fill = `url(#lc-organg-${view}-${o.id})`;
        const filter = `url(#lc-organ-blur-${view})`;

        const content = o.paths
          ? o.paths.map((p, i) => <path key={i} d={p} />)
          : <path d={o.d} />;

        return (
          <g
            key={o.id}
            data-organ={o.id}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
            filter={filter}
            opacity={opacity}
            style={{ transition: 'opacity 320ms ease, stroke-width 320ms ease' }}
          >
            {content}
            {isActive && (
              <animate
                attributeName="opacity"
                values="0.7;1;0.7"
                dur="2.2s"
                repeatCount="indefinite"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
