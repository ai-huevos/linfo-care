import React from 'react';
import { ORGAN_CENTERS } from './organCenters';

/* ──────────────────────────────────────────────────────────────────────────
   BODY MARKERS — HTML overlay positioned by percentage over the body frame.
   Stays HTML (not SVG) so <button> semantics, focus ring, ARIA labels, and
   touch targets survive intact. Includes an optional SVG anchor line that
   connects the selected marker to its matching organ centroid.
   ────────────────────────────────────────────────────────────────────────── */

export default function BodyMarkers({
  regions = [],
  selected = null,
  severityMap,
  onSelect,
}) {
  // Anchor line is shown only when:
  //  - a marker is currently selected,
  //  - the selected region has an `organ`,
  //  - that organ id is known to ORGAN_CENTERS,
  //  - and the selected region is on this face (i.e., present in `regions`).
  const showAnchor =
    !!selected &&
    !!selected.organ &&
    ORGAN_CENTERS[selected.organ] &&
    regions.some((r) => r.id === selected.id);

  return (
    <>
      {showAnchor && (
        <svg
          className="lc-anchor-svg"
          viewBox="0 0 200 520"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          {(() => {
            const sev = severityMap[selected.severity];
            const [ox, oy] = ORGAN_CENTERS[selected.organ];
            const mx = selected.x * 2;
            const my = selected.y * 5.2;
            return (
              <line
                x1={mx}
                y1={my}
                x2={ox}
                y2={oy}
                stroke={sev.color}
                strokeOpacity="0.55"
                strokeWidth="0.9"
                strokeDasharray="3 3"
                strokeLinecap="round"
              />
            );
          })()}
        </svg>
      )}

      <div className="lc-markers">
        {regions.map((r) => {
          const sev = severityMap[r.severity];
          const isSel = selected?.id === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={(e) => { e.stopPropagation(); onSelect(r); }}
              className={`lc-marker ${isSel ? 'lc-selected' : ''}`}
              style={{
                left: `${r.x}%`,
                top: `${r.y}%`,
                '--dot': sev.color,
                '--glow': sev.glow,
              }}
              aria-label={r.label}
            >
              <span className="lc-marker-halo" />
              {(r.severity === 'critical' || isSel) && (
                <>
                  <span className="lc-marker-ring" />
                  <span className="lc-marker-ring lc-r2" />
                  <span className="lc-marker-ring lc-r3" />
                </>
              )}
              <span className="lc-marker-capsule" />
              <span className="lc-marker-core" />
              <span className="lc-marker-label">{r.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
