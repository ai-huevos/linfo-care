// Approximate organ centroids in the 200×520 viewBox. Used by:
//  - OrganGlassOverlay (positioning + radial gradient origin)
//  - BodyMarkers (anchor-line endpoint when a region with `organ` is selected)
export const ORGAN_CENTERS = {
  'lung-left':  [116, 178],
  'lung-right': [84,  178],
  heart:        [104, 190],
  liver:        [86,  236],
  stomach:      [120, 238],
  spleen:       [126, 222],
  pelvis:       [100, 330],
  kidneys:      [100, 268],
  spine:        [100, 220],
};
