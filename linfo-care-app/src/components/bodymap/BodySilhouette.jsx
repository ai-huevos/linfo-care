import React from 'react';

/* ──────────────────────────────────────────────────────────────────────────
   BODY SILHOUETTE — pure SVG, 200×520 viewBox.
   Renders the translucent skin silhouette + per-view skeleton hints.
   Markers (HTML overlay) and organs (separate SVG layer) live above this.

   Coordinate system: x ∈ [0,200], y ∈ [0,520]. 8-head proportional figure.
   Landmarks the BODY_REGIONS markers depend on:
     head:        eye-line y≈44 (8.5%)
     mouth:       y≈70-74 (14%)
     neck:        y≈98-102 (19%)
     shoulders:   y≈122 (23%)
     ribcage:     y≈134-222 (26-43%)
     waist:       y≈264 (51%)
     iliac:       y≈308-320 (59-62%)
     crotch:      y≈354 (68%)
     mid-thigh:   y≈400 (77%)
     knee:        y≈436 (84%)
     ankle:       y≈500 (96%)
   ────────────────────────────────────────────────────────────────────────── */

const HEAD = { cx: 100, cy: 44, rx: 22, ry: 30 };

const NECK_FILL = 'M 88 72 L 86 102 Q 100 108 114 102 L 112 72 Q 100 78 88 72 Z';

const TORSO_FILL =
  'M 86 98 ' +
  'Q 70 102 58 116 ' +
  'Q 48 126 52 152 ' +
  'Q 60 156 70 156 ' +
  'Q 72 186 70 216 ' +
  'Q 76 248 80 264 ' +
  'Q 68 292 62 320 ' +
  'Q 66 344 80 354 ' +
  'L 120 354 ' +
  'Q 134 344 138 320 ' +
  'Q 132 292 120 264 ' +
  'Q 124 248 130 216 ' +
  'Q 128 186 130 156 ' +
  'Q 140 156 148 152 ' +
  'Q 152 126 142 116 ' +
  'Q 130 102 114 98 ' +
  'Z';

const LEFT_ARM_FILL =
  'M 56 122 ' +
  'Q 42 154 40 200 ' +
  'Q 38 248 38 294 ' +
  'Q 38 336 42 358 ' +
  'Q 46 372 52 368 ' +
  'Q 56 358 54 338 ' +
  'Q 54 294 56 248 ' +
  'Q 58 204 62 176 ' +
  'Q 64 152 72 132 ' +
  'Z';

const RIGHT_ARM_FILL =
  'M 144 122 ' +
  'Q 158 154 160 200 ' +
  'Q 162 248 162 294 ' +
  'Q 162 336 158 358 ' +
  'Q 154 372 148 368 ' +
  'Q 144 358 146 338 ' +
  'Q 146 294 144 248 ' +
  'Q 142 204 138 176 ' +
  'Q 136 152 128 132 ' +
  'Z';

const LEFT_LEG_FILL =
  'M 68 354 ' +
  'Q 60 402 66 442 ' +
  'Q 62 472 76 500 ' +
  'L 94 500 ' +
  'Q 96 472 96 442 ' +
  'Q 98 402 96 354 ' +
  'Z';

const RIGHT_LEG_FILL =
  'M 132 354 ' +
  'Q 140 402 134 442 ' +
  'Q 138 472 124 500 ' +
  'L 106 500 ' +
  'Q 104 472 104 442 ' +
  'Q 102 402 104 354 ' +
  'Z';

const BODY_OUTLINE =
  'M 100 14 ' +
  'Q 122 14 122 44 ' +
  'Q 122 66 114 72 ' +
  'L 112 78 ' +
  'Q 126 90 140 108 ' +
  'Q 152 122 148 146 ' +
  'Q 162 178 162 218 ' +
  'Q 164 264 162 306 ' +
  'Q 162 340 158 360 ' +
  'Q 154 372 148 368 ' +
  'Q 144 358 146 340 ' +
  'Q 144 302 142 260 ' +
  'Q 142 220 138 188 ' +
  'Q 134 162 130 148 ' +
  'Q 128 186 130 216 ' +
  'Q 124 248 120 264 ' +
  'Q 132 292 138 320 ' +
  'Q 134 344 130 354 ' +
  'Q 140 402 134 442 ' +
  'Q 138 472 124 500 ' +
  'L 104 500 ' +
  'Q 104 472 104 442 ' +
  'Q 102 402 104 354 ' +
  'L 96 354 ' +
  'Q 98 402 96 442 ' +
  'Q 96 472 96 500 ' +
  'L 76 500 ' +
  'Q 62 472 66 442 ' +
  'Q 60 402 70 354 ' +
  'Q 66 344 62 320 ' +
  'Q 68 292 80 264 ' +
  'Q 76 248 70 216 ' +
  'Q 72 186 70 148 ' +
  'Q 66 162 62 188 ' +
  'Q 58 220 58 260 ' +
  'Q 56 302 54 340 ' +
  'Q 56 358 52 368 ' +
  'Q 46 372 42 360 ' +
  'Q 38 340 38 306 ' +
  'Q 38 264 38 218 ' +
  'Q 38 178 52 146 ' +
  'Q 48 122 60 108 ' +
  'Q 74 90 88 78 ' +
  'L 86 72 ' +
  'Q 78 66 78 44 ' +
  'Q 78 14 100 14 ' +
  'Z';

const BONE = 'rgba(245,233,208,0.55)';
const BONE_SOFT = 'rgba(245,233,208,0.32)';
const BONE_STRONG = 'rgba(245,233,208,0.78)';

function SkinAndOutline({ skinId, edgeId }) {
  const fill = `url(#${skinId})`;
  const edge = `url(#${edgeId})`;
  return (
    <g>
      <g fill={fill} stroke="none">
        <ellipse cx={HEAD.cx} cy={HEAD.cy} rx={HEAD.rx} ry={HEAD.ry} />
        <path d={NECK_FILL} />
        <path d={LEFT_ARM_FILL} />
        <path d={RIGHT_ARM_FILL} />
        <path d={TORSO_FILL} />
        <path d={LEFT_LEG_FILL} />
        <path d={RIGHT_LEG_FILL} />
      </g>
      <path d={BODY_OUTLINE} fill="none" stroke={edge} strokeWidth="1.2"
            strokeOpacity="0.85" strokeLinejoin="round" strokeLinecap="round" />
      <ellipse cx={HEAD.cx} cy={HEAD.cy} rx={HEAD.rx} ry={HEAD.ry}
               fill="none" stroke={edge} strokeWidth="1.2" strokeOpacity="0.85" />
    </g>
  );
}

function FrontSkeleton() {
  return (
    <g>
      {/* Skull midline + brow + cheek hints */}
      <g fill="none" stroke={BONE_SOFT} strokeWidth="0.7" strokeLinecap="round">
        <line x1="100" y1="22" x2="100" y2="68" strokeDasharray="2 3" />
        <path d="M 84 42 Q 100 46 116 42" />
        <path d="M 94 54 Q 100 58 106 54" />
      </g>

      {/* Cervical spine through neck */}
      <line x1="100" y1="76" x2="100" y2="112" stroke={BONE} strokeWidth="1" strokeDasharray="3 2" />

      {/* Clavicles */}
      <g stroke={BONE_STRONG} strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path d="M 100 112 Q 84 118 58 124" />
        <path d="M 100 112 Q 116 118 142 124" />
      </g>

      {/* Ribcage — 8 pairs + sternum */}
      <g fill="none" stroke={BONE} strokeWidth="1" strokeLinecap="round">
        {Array.from({ length: 8 }).map((_, i) => {
          const y = 134 + i * 11;
          const bulge = i < 4 ? 30 + i * 1.8 : 36 - (i - 4) * 2;
          const endY = y + 10;
          return (
            <g key={i}>
              <path d={`M 100 ${y - 2} Q ${100 - bulge} ${y + 4} ${100 - bulge * 0.5} ${endY}`} />
              <path d={`M 100 ${y - 2} Q ${100 + bulge} ${y + 4} ${100 + bulge * 0.5} ${endY}`} />
            </g>
          );
        })}
        <line x1="100" y1="122" x2="100" y2="228" stroke={BONE_STRONG} strokeWidth="1.4" />
      </g>

      {/* Pelvis bowl + iliac crests + pubic symphysis */}
      <g fill="none" stroke={BONE_STRONG} strokeWidth="1.2" strokeLinecap="round">
        <path d="M 64 308 Q 70 330 86 340" />
        <path d="M 136 308 Q 130 330 114 340" />
        <path d="M 86 340 Q 100 348 114 340" />
        <path d="M 94 332 L 94 352" />
        <path d="M 106 332 L 106 352" />
      </g>

      {/* Femurs */}
      <g stroke={BONE} strokeWidth="1.1" fill="none" strokeLinecap="round">
        <path d="M 84 356 L 84 422" strokeDasharray="4 3" />
        <path d="M 116 356 L 116 422" strokeDasharray="4 3" />
      </g>

      {/* Patellae */}
      <g fill={BONE_SOFT} stroke={BONE_STRONG} strokeWidth="0.9">
        <ellipse cx="84" cy="436" rx="6" ry="5" />
        <ellipse cx="116" cy="436" rx="6" ry="5" />
      </g>

      {/* Tibia/fibula */}
      <g stroke={BONE} strokeWidth="1.1" fill="none" strokeLinecap="round">
        <path d="M 86 446 L 88 492" strokeDasharray="4 3" />
        <path d="M 114 446 L 112 492" strokeDasharray="4 3" />
      </g>

      {/* Breathing halo over the heart/chest (kept here so it pulses with the body) */}
      <circle cx="100" cy="184" r="34" fill="url(#lc-chest-pulse)" opacity="0.45">
        <animate attributeName="r" values="30;40;30" dur="4.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.25;0.5;0.25" dur="4.2s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

function BackSkeleton() {
  return (
    <g>
      {/* Skull seam */}
      <g fill="none" stroke={BONE_SOFT} strokeWidth="0.7" strokeLinecap="round">
        <line x1="100" y1="22" x2="100" y2="68" strokeDasharray="2 3" />
        <path d="M 82 34 Q 100 38 118 34" />
      </g>

      {/* Spine column dashed */}
      <g stroke={BONE} strokeWidth="1.2" fill="none" strokeLinecap="round">
        <path d="M 100 76 L 100 348" strokeDasharray="3 2" />
      </g>

      {/* Vertebrae stack */}
      <g stroke={BONE_STRONG} fill="rgba(245,233,208,0.10)" strokeWidth="0.9">
        {Array.from({ length: 22 }).map((_, i) => {
          const y = 86 + i * 12;
          const isLumbar = i > 14;
          const w = isLumbar ? 8 + (i - 14) * 0.4 : 6;
          return <ellipse key={i} cx="100" cy={y} rx={w} ry="3" />;
        })}
      </g>

      {/* Scapulae */}
      <g stroke={BONE} strokeWidth="1.1" fill="rgba(245,233,208,0.06)" strokeLinecap="round">
        <path d="M 66 128 Q 60 160 82 186 Q 94 176 92 150 Q 86 132 74 126 Z" />
        <path d="M 134 128 Q 140 160 118 186 Q 106 176 108 150 Q 114 132 126 126 Z" />
      </g>

      {/* Back ribs (6 pairs visible behind scapulae lower edge) */}
      <g fill="none" stroke={BONE_SOFT} strokeWidth="0.9" strokeLinecap="round">
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

      {/* Pelvis from back: sacrum + ilium wings */}
      <g fill="none" stroke={BONE_STRONG} strokeWidth="1.2" strokeLinecap="round">
        <path d="M 64 310 Q 68 334 84 346" />
        <path d="M 136 310 Q 132 334 116 346" />
        <path d="M 94 340 L 94 360" />
        <path d="M 106 340 L 106 360" />
      </g>

      {/* Femur (back of thigh) */}
      <g stroke={BONE} strokeWidth="1.1" fill="none" strokeLinecap="round">
        <path d="M 84 360 L 84 422" strokeDasharray="4 3" />
        <path d="M 116 360 L 116 422" strokeDasharray="4 3" />
      </g>

      {/* Popliteal hint */}
      <g fill="none" stroke={BONE} strokeWidth="0.9" strokeLinecap="round">
        <path d="M 78 434 Q 84 438 90 434" />
        <path d="M 110 434 Q 116 438 122 434" />
      </g>

      {/* Calf bones */}
      <g stroke={BONE} strokeWidth="1.1" fill="none" strokeLinecap="round">
        <path d="M 86 446 L 88 492" strokeDasharray="4 3" />
        <path d="M 114 446 L 112 492" strokeDasharray="4 3" />
      </g>
    </g>
  );
}

export default function BodySilhouette({ view = 'front' }) {
  const isFront = view === 'front';
  const skinId = isFront ? 'lc-skin' : 'lc-skin-b';
  const edgeId = isFront ? 'lc-edge' : 'lc-edge-b';

  return (
    <svg
      className="lc-body-svg lc-body-entry"
      viewBox="0 0 200 520"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        {isFront ? (
          <>
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
          </>
        ) : (
          <>
            <linearGradient id="lc-skin-b" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%"   stopColor="rgba(129,140,248,0.28)" />
              <stop offset="50%"  stopColor="rgba(56,189,248,0.22)" />
              <stop offset="100%" stopColor="rgba(125,211,252,0.18)" />
            </linearGradient>
            <linearGradient id="lc-edge-b" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#818cf8" />
              <stop offset="100%" stopColor="#7dd3fc" />
            </linearGradient>
          </>
        )}
      </defs>

      <SkinAndOutline skinId={skinId} edgeId={edgeId} />
      {isFront ? <FrontSkeleton /> : <BackSkeleton />}
    </svg>
  );
}
