/**
 * VERDANT SIGNAL — V8.0 PASS 2 MASTERPIECE GROUND ART, ROOT INTEGRATION & LIVING FLORA
 * ====================================================================================
 * Crafted in true 16/32-bit artisanal pixel-art cluster language (Sea of Stars / Eastward
 * caliber — ZERO checkerboard Bayer noise on grass, ZERO thin vertical "comb" sticks,
 * ZERO flat green surfaces, ZERO generic dark oval shadow blobs!):
 *
 *   1. Woven Layered Sculpted Turf Cushions & Curved Multi-Blade Grass Clusters (~55k)
 *   2. Organic Botanical Colonies (wildflower bouquets, clover pillows, woodland/biolum
 *      mushrooms, fallen autumn leaf drifts, stepping flagstones & grassy trail fringes)
 *   3. Full Physical Object-to-Ground Embedding (root-contour humus, damp soil compression,
 *      radiating surface feeder roots, bark litter & multi-point foreground grass/fern wraps
 *      growing BETWEEN AND OVER exposed roots, boulders, logs, arches & landmarks)
 *   4. Hand-Sculpted 6-Frame Living Grass & Flower Fan Atlas (lush asymmetric arching blades
 *      with soft grounded bases + true wind-wave bend & player footstep parting/compression)
 */

import { createEmptyBuffer, setPixel } from '../engine/pixelBuffer';
import { type RGB, hexToRgb } from '../v5_soul/v5PixelEngine';
import { type RgbaImage } from '../v7_immersive/v7WorldEngine';
import { type V73OpenWorldDef } from '../v73_open_world/v73OpenWorldEngine';

export const V80_TUFT_CELL = 24;
export const V80_TUFT_FRAMES = 6; // 0:rest, 1:breezeR, 2:gustR, 3:recoilL, 4:stepL, 5:stepR

export type V80TuftSpecies =
  | 'meadow_lush'
  | 'meadow_tall'
  | 'sunlit_golden'
  | 'shade_sedge'
  | 'flower_buttercup'
  | 'flower_lavender'
  | 'biolum_blossom'
  | 'root_fernlet';

export const V80_TUFT_SPECIES_LIST: V80TuftSpecies[] = [
  'meadow_lush',
  'meadow_tall',
  'sunlit_golden',
  'shade_sedge',
  'flower_buttercup',
  'flower_lavender',
  'biolum_blossom',
  'root_fernlet',
];

export interface V80LivingAtlas {
  tuftSheet: RgbaImage; // 144x192
  tuftFrames: Record<V80TuftSpecies, RgbaImage[]>;
  critterSheet: RgbaImage; // 48x36
  critterFrames: RgbaImage[][];
}

const COL = {
  // Deep cool canopy shadow -> lush emerald -> sunlit chartreuse-gold blade tips
  gDeep0: hexToRgb('#071d18'),
  gDeep1: hexToRgb('#0c3024'),
  gShade0: hexToRgb('#12442c'),
  gShade1: hexToRgb('#1b5e35'),
  gMid0: hexToRgb('#25783b'),
  gMid1: hexToRgb('#3b9843'),
  gLit0: hexToRgb('#5eba4a'),
  gLit1: hexToRgb('#8ed852'),
  gSun0: hexToRgb('#c2ec62'),
  gSun1: hexToRgb('#e9f887'),
  // Dry golden-olive meadow straw in sunlit glade pockets
  dry0: hexToRgb('#6e7532'),
  dry1: hexToRgb('#a6a345'),
  dry2: hexToRgb('#d9cf6a'),
  dry3: hexToRgb('#f2eb9c'),
  // Deep pine-teal woodland sedge in cool forest shade
  sedge0: hexToRgb('#0c3333'),
  sedge1: hexToRgb('#18554d'),
  sedge2: hexToRgb('#2c7d65'),
  sedge3: hexToRgb('#56ab82'),
  // Rich forest soil, damp humus & weathered woodland trail earth
  peat0: hexToRgb('#15100f'),
  peat1: hexToRgb('#241a15'),
  soil0: hexToRgb('#39271b'),
  soil1: hexToRgb('#523824'),
  soil2: hexToRgb('#704d31'),
  soilWarm: hexToRgb('#946b45'),
  soilSand: hexToRgb('#b0895c'),
  // Surface feeder roots & mossy bark
  rootDark: hexToRgb('#2e1612'),
  rootMid: hexToRgb('#5e2e1d'),
  rootLit: hexToRgb('#96522c'),
  rootMoss: hexToRgb('#4e9941'),
  // Fallen autumn leaves
  leafPlum: hexToRgb('#6b312b'),
  leafRust: hexToRgb('#a34e29'),
  leafAmber: hexToRgb('#d17b36'),
  leafGold: hexToRgb('#e8ae52'),
  // Stepping flagstones & mossy pebbles
  stoneDark: hexToRgb('#354a50'),
  stoneMid: hexToRgb('#5a757c'),
  stoneLit: hexToRgb('#91adb2'),
  stoneHi: hexToRgb('#bfd4d4'),
  // Organic wildflowers (buttercup gold, lavender bell, forest white daisy, soft coral poppy)
  flGold0: hexToRgb('#d49326'),
  flGold1: hexToRgb('#ffe268'),
  flGold2: hexToRgb('#fff9cc'),
  flLav0: hexToRgb('#7c5da6'),
  flLav1: hexToRgb('#bea4eb'),
  flLav2: hexToRgb('#ece2ff'),
  flWhite0: hexToRgb('#b3cdc6'),
  flWhite1: hexToRgb('#f4fcf8'),
  flCoral0: hexToRgb('#c95b49'),
  flCoral1: hexToRgb('#f29479'),
  // Delicate localized alien bioluminescence
  bioStem: hexToRgb('#1b5f5c'),
  bio0: hexToRgb('#36b8b2'),
  bio1: hexToRgb('#80f2e6'),
  bio2: hexToRgb('#dcfffa'),
  // Woodland & glowing spore-cap mushrooms
  mushStem: hexToRgb('#ddd0b4'),
  mushCap0: hexToRgb('#9e442c'),
  mushCap1: hexToRgb('#de7f47'),
  mushBio0: hexToRgb('#2e9ca8'),
  mushBio1: hexToRgb('#82f2eb'),
  // Mirror-like sky-reflecting pools
  mudRim0: hexToRgb('#17231c'),
  mudRim1: hexToRgb('#253728'),
  waterShadow: hexToRgb('#113547'),
  waterDeep: hexToRgb('#1c536b'),
  waterMid: hexToRgb('#30839e'),
  waterSky: hexToRgb('#6ec4db'),
  waterSun: hexToRgb('#c2f0fa'),
};

function hash2d(ix: number, iy: number): number {
  let n = Math.imul(ix, 374761393) + Math.imul(iy, 668265263);
  n = (n ^ (n >>> 13)) * 1274126177;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function smoothNoise(x: number, y: number, cell: number): number {
  const fx = x / cell;
  const fy = y / cell;
  const ix = Math.floor(fx);
  const iy = Math.floor(fy);
  const tx = fx - ix;
  const ty = fy - iy;
  const ux = tx * tx * (3 - 2 * tx);
  const uy = ty * ty * (3 - 2 * ty);
  const a = hash2d(ix, iy);
  const b = hash2d(ix + 1, iy);
  const c = hash2d(ix, iy + 1);
  const d = hash2d(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x: number, y: number): number {
  return (
    smoothNoise(x, y, 168) * 0.44 +
    smoothNoise(x + 313, y - 197, 72) * 0.30 +
    smoothNoise(x - 127, y + 419, 28) * 0.17 +
    smoothNoise(x + 71, y + 83, 11) * 0.09
  );
}

function distPointToSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const l2 = dx * dx + dy * dy;
  if (l2 < 1e-6) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function pxPlot(buf: Uint8ClampedArray, w: number, h: number, x: number, y: number, c: RGB, alpha = 255): void {
  const ix = Math.round(x);
  const iy = Math.round(y);
  if (ix < 0 || ix >= w || iy < 0 || iy >= h) return;
  if (alpha >= 250) {
    setPixel(buf, w, h, ix, iy, { ...c, a: 255 });
  } else {
    const oi = (iy * w + ix) * 4;
    const a = alpha / 255;
    buf[oi] = Math.round(buf[oi] * (1 - a) + c.r * a);
    buf[oi + 1] = Math.round(buf[oi + 1] * (1 - a) + c.g * a);
    buf[oi + 2] = Math.round(buf[oi + 2] * (1 - a) + c.b * a);
    buf[oi + 3] = 255;
  }
}

/**
 * Draws a sculpted, painterly pixel-art arching grass blade (thick 2px shaded root tapering
 * cleanly to a 1px curving sunlit tip — NEVER a thin wire stick!).
 */
function drawSculptedBlade(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  baseX: number,
  baseY: number,
  height: number,
  archX: number,
  cRoot: RGB,
  cMid: RGB,
  cTip: RGB,
  broad = true
): { tipX: number; tipY: number } {
  const steps = Math.max(2, Math.round(height));
  let tipX = baseX;
  let tipY = baseY - height;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Graceful botanical arch: bends smoothly outward from mid-stem to tip
    const x = Math.round(baseX + archX * Math.pow(t, 1.55));
    const y = Math.round(baseY - height * t + Math.abs(archX) * 0.22 * t * t);
    const col = t < 0.30 ? cRoot : t < 0.72 ? cMid : cTip;
    pxPlot(buf, w, h, x, y, col);
    if (broad && t < 0.48) {
      const side = archX >= 0 ? -1 : 1;
      pxPlot(buf, w, h, x + side, y, t < 0.22 ? cRoot : cMid);
    }
    if (i === steps) {
      tipX = x;
      tipY = y;
    }
  }
  return { tipX, tipY };
}

// ============================================================================
// PASS C: LUSH HAND-SCULPTED 6-FRAME LIVING GRASS & FLOWER FAN ATLAS
// (Asymmetric sweeping leaf fans — ZERO vertical "comb" bars!)
// ============================================================================

function renderTuftFrame(species: V80TuftSpecies, frameIdx: number): RgbaImage {
  const S = V80_TUFT_CELL; // 24x24, ground anchor at (12, 21)
  const buf = createEmptyBuffer(S, S);
  const bx = 12;
  const by = 21;

  // 0:rest, 1:breezeR, 2:gustR, 3:recoilL, 4:stepBendLeft, 5:stepBendRight
  const wind = [0, 2.4, 5.0, -1.9, -5.6, 5.6][frameIdx];
  const squash = [1.0, 0.95, 0.80, 0.96, 0.56, 0.56][frameIdx];

  // Soft blended mossy base cluster (NO harsh dark horizontal line!)
  const baseGreen =
    species === 'shade_sedge' || species === 'biolum_blossom'
      ? COL.sedge0
      : species === 'sunlit_golden'
        ? COL.gShade1
        : COL.gShade0;
  for (let dx = -4; dx <= 4; dx++) {
    pxPlot(buf, S, S, bx + dx, by, baseGreen);
  }
  pxPlot(buf, S, S, bx - 2, by + 1, COL.gDeep1);
  pxPlot(buf, S, S, bx + 1, by + 1, COL.gDeep1);

  if (species === 'meadow_lush') {
    // Wide lush asymmetrical leafy clump fanning outward gracefully
    const blades = [
      { ox: -4, h: 5, arch: -5.8, broad: true },
      { ox: -2, h: 8, arch: -3.6, broad: true },
      { ox: 0, h: 9, arch: 1.4, broad: true },
      { ox: 2, h: 7, arch: 4.5, broad: true },
      { ox: 4, h: 5, arch: 6.2, broad: false },
    ];
    for (const b of blades) {
      drawSculptedBlade(buf, S, S, bx + b.ox, by, b.h * squash, b.arch + wind * 0.9, COL.gShade0, COL.gMid1, COL.gLit1, b.broad);
    }
  } else if (species === 'meadow_tall') {
    // Sweeping tall sunlit woodland grass fan
    const blades = [
      { ox: -4, h: 7, arch: -6.2, broad: true },
      { ox: -2, h: 11, arch: -3.2, broad: true },
      { ox: 0, h: 12, arch: 1.8, broad: true },
      { ox: 2, h: 10, arch: 4.8, broad: true },
      { ox: 4, h: 6, arch: 6.6, broad: false },
    ];
    for (const b of blades) {
      drawSculptedBlade(buf, S, S, bx + b.ox, by, b.h * squash, b.arch + wind * 1.1, COL.gShade1, COL.gLit0, COL.gSun0, b.broad);
    }
  } else if (species === 'sunlit_golden') {
    // Graceful arching sunlit honey-gold clearing grass with delicate seed-head tips
    const blades = [
      { ox: -4, h: 7, arch: -5.6, broad: true },
      { ox: -1, h: 11, arch: -2.0, broad: true },
      { ox: 1, h: 12, arch: 3.4, broad: true },
      { ox: 3, h: 8, arch: 6.0, broad: false },
    ];
    for (const b of blades) {
      const tip = drawSculptedBlade(buf, S, S, bx + b.ox, by, b.h * squash, b.arch + wind * 1.05, COL.dry0, COL.dry1, COL.dry2, b.broad);
      if (b.h >= 11 && frameIdx <= 3) {
        pxPlot(buf, S, S, tip.tipX, tip.tipY - 1, COL.dry3);
      }
    }
  } else if (species === 'shade_sedge') {
    // Broad sweeping deep-forest sedge rosette (stays low & lush in shade)
    const blades = [
      { ox: -4, h: 6, arch: -6.4, broad: true },
      { ox: -2, h: 9, arch: -3.5, broad: true },
      { ox: 1, h: 10, arch: 2.8, broad: true },
      { ox: 4, h: 6, arch: 6.2, broad: true },
    ];
    for (const b of blades) {
      drawSculptedBlade(buf, S, S, bx + b.ox, by, b.h * squash, b.arch + wind * 0.9, COL.sedge0, COL.sedge1, COL.sedge3, b.broad);
    }
  } else if (species === 'flower_buttercup' || species === 'flower_lavender') {
    const f0 = species === 'flower_buttercup' ? COL.flGold0 : COL.flLav0;
    const f1 = species === 'flower_buttercup' ? COL.flGold1 : COL.flLav1;
    const f2 = species === 'flower_buttercup' ? COL.flGold2 : COL.flLav2;
    // Lush leafy rosette base
    drawSculptedBlade(buf, S, S, bx - 4, by, 6 * squash, -5.2 + wind * 0.6, COL.gShade0, COL.gMid0, COL.gLit0, true);
    drawSculptedBlade(buf, S, S, bx + 4, by, 6 * squash, 5.2 + wind * 0.6, COL.gShade0, COL.gMid0, COL.gLit0, true);
    drawSculptedBlade(buf, S, S, bx, by, 7 * squash, 0.8 + wind * 0.7, COL.gShade1, COL.gMid1, COL.gLit1, true);
    // Bouquet of 3 graceful flowering stems at staggered heights!
    const stalks = [
      { ox: -3, h: 10, arch: -3.4 },
      { ox: 0, h: 12, arch: 0.6 },
      { ox: 3, h: 9, arch: 4.0 },
    ];
    for (const st of stalks) {
      const tip = drawSculptedBlade(buf, S, S, bx + st.ox, by, st.h * squash, st.arch + wind * 1.1, COL.gShade1, COL.gMid1, COL.gLit0, false);
      pxPlot(buf, S, S, tip.tipX, tip.tipY - 1, f1);
      pxPlot(buf, S, S, tip.tipX - 1, tip.tipY, f1);
      pxPlot(buf, S, S, tip.tipX + 1, tip.tipY, f1);
      pxPlot(buf, S, S, tip.tipX, tip.tipY + 1, f0);
      pxPlot(buf, S, S, tip.tipX, tip.tipY, f2);
    }
  } else if (species === 'biolum_blossom') {
    // Graceful alien glowing teal bell-blossom cluster nestled near roots & monoliths!
    drawSculptedBlade(buf, S, S, bx - 4, by, 6 * squash, -5.0 + wind * 0.6, COL.sedge0, COL.sedge1, COL.sedge2, true);
    drawSculptedBlade(buf, S, S, bx + 4, by, 6 * squash, 5.0 + wind * 0.6, COL.sedge0, COL.sedge1, COL.sedge2, true);
    const stalks = [
      { ox: -2, h: 12, arch: -2.6 },
      { ox: 2, h: 9, arch: 3.2 },
    ];
    for (const st of stalks) {
      const tip = drawSculptedBlade(buf, S, S, bx + st.ox, by, st.h * squash, st.arch + wind * 0.95, COL.sedge0, COL.bioStem, COL.bio0, false);
      pxPlot(buf, S, S, tip.tipX, tip.tipY - 1, COL.bio1);
      pxPlot(buf, S, S, tip.tipX - 1, tip.tipY, COL.bio0);
      pxPlot(buf, S, S, tip.tipX + 1, tip.tipY, COL.bio0);
      pxPlot(buf, S, S, tip.tipX, tip.tipY + 1, COL.bio1);
      pxPlot(buf, S, S, tip.tipX, tip.tipY, COL.bio2);
    }
  } else if (species === 'root_fernlet') {
    // Lush baby woodland fern fanning cleanly across roots & boulders!
    const fronds = [
      { ox: -3, h: 7, arch: -6.8 },
      { ox: -1, h: 10, arch: -3.2 },
      { ox: 1, h: 10, arch: 3.4 },
      { ox: 3, h: 7, arch: 6.8 },
    ];
    for (const fr of fronds) {
      const tip = drawSculptedBlade(buf, S, S, bx + fr.ox, by, fr.h * squash, fr.arch + wind * 0.72, COL.gDeep1, COL.gMid0, COL.gLit1, true);
      const mx = Math.round((bx + fr.ox + tip.tipX) / 2);
      const my = Math.round((by + tip.tipY) / 2);
      pxPlot(buf, S, S, mx - 1, my - 1, COL.gLit0);
      pxPlot(buf, S, S, mx + 1, my - 1, COL.gMid1);
      pxPlot(buf, S, S, mx, my + 1, COL.gShade1);
    }
  }

  return { pixels: buf, width: S, height: S };
}

function renderCritterFrame(kind: number, frameIdx: number): RgbaImage {
  const S = 12;
  const buf = createEmptyBuffer(S, S);
  const cx = 6, cy = 6;
  const wingSpread = [3, 2, 1, 2][frameIdx];
  const wingY = [-1, 0, -2, 0][frameIdx];
  const primary = kind === 0 ? COL.flGold1 : kind === 1 ? COL.bio1 : COL.flLav1;
  const hi = kind === 0 ? COL.flGold2 : kind === 1 ? COL.bio2 : COL.flLav2;
  const edge = kind === 0 ? COL.flGold0 : kind === 1 ? COL.bio0 : COL.flLav0;
  pxPlot(buf, S, S, cx, cy, COL.peat1);
  pxPlot(buf, S, S, cx, cy + 1, COL.peat1);
  for (let dx = 1; dx <= wingSpread; dx++) {
    pxPlot(buf, S, S, cx - dx, cy + wingY, dx === wingSpread ? edge : primary);
    pxPlot(buf, S, S, cx + dx, cy + wingY, dx === wingSpread ? edge : primary);
    if (dx <= Math.max(1, wingSpread - 1)) {
      pxPlot(buf, S, S, cx - dx, cy + wingY - 1, hi);
      pxPlot(buf, S, S, cx + dx, cy + wingY - 1, hi);
      pxPlot(buf, S, S, cx - dx, cy + 1, edge);
      pxPlot(buf, S, S, cx + dx, cy + 1, edge);
    }
  }
  return { pixels: buf, width: S, height: S };
}

export function buildV80LivingAtlas(): V80LivingAtlas {
  const sheetW = V80_TUFT_CELL * V80_TUFT_FRAMES;
  const sheetH = V80_TUFT_CELL * V80_TUFT_SPECIES_LIST.length;
  const tuftSheet = createEmptyBuffer(sheetW, sheetH);
  const tuftFrames = {} as Record<V80TuftSpecies, RgbaImage[]>;

  V80_TUFT_SPECIES_LIST.forEach((sp, rowIdx) => {
    tuftFrames[sp] = [];
    for (let f = 0; f < V80_TUFT_FRAMES; f++) {
      const img = renderTuftFrame(sp, f);
      tuftFrames[sp].push(img);
      const ox = f * V80_TUFT_CELL;
      const oy = rowIdx * V80_TUFT_CELL;
      for (let y = 0; y < V80_TUFT_CELL; y++) {
        tuftSheet.set(img.pixels.subarray(y * V80_TUFT_CELL * 4, (y + 1) * V80_TUFT_CELL * 4), ((oy + y) * sheetW + ox) * 4);
      }
    }
  });

  const cW = 48, cH = 36;
  const critterSheet = createEmptyBuffer(cW, cH);
  const critterFrames: RgbaImage[][] = [];
  for (let k = 0; k < 3; k++) {
    const arr: RgbaImage[] = [];
    for (let f = 0; f < 4; f++) {
      const img = renderCritterFrame(k, f);
      arr.push(img);
      const ox = f * 12, oy = k * 12;
      for (let y = 0; y < 12; y++) {
        critterSheet.set(img.pixels.subarray(y * 12 * 4, (y + 1) * 12 * 4), ((oy + y) * cW + ox) * 4);
      }
    }
    critterFrames.push(arr);
  }

  return {
    tuftSheet: { pixels: tuftSheet, width: sheetW, height: sheetH },
    tuftFrames,
    critterSheet: { pixels: critterSheet, width: cW, height: cH },
    critterFrames,
  };
}

// ============================================================================
// PASS A + B: WOVEN PAINTERLY PIXEL-ART GRASS ECOSYSTEM & FULL ROOT EMBEDDING
// ============================================================================

const WOODLAND_TRAIL_SEGS: Array<[number, number, number, number]> = [
  [1024, 836, 1118, 634],
  [1118, 634, 1118, 456],
  [1118, 456, 1420, 444],
  [1420, 444, 1666, 514],
  [1666, 514, 1624, 774],
  [1046, 846, 1344, 822],
  [1344, 822, 1606, 818],
  [1046, 846, 1138, 1018],
  [1138, 1018, 868, 1094],
  [868, 1094, 646, 1018],
  [646, 1018, 628, 766],
  [628, 766, 984, 818],
];

/**
 * Stamps a rich painterly sculpted turf cushion (overlapping curved leaf cluster — the exact
 * secret of Sea of Stars / Chrono Trigger grass that eliminates ALL flat green & checker noise!).
 */
function stampPainterlyTurfCluster(
  buf: Uint8ClampedArray,
  W: number,
  H: number,
  x: number,
  y: number,
  light: number,
  seed: number,
  isDry: boolean,
  isSedge: boolean
): void {
  let cSh: RGB, cMid: RGB, cLit: RGB, cTip: RGB;
  if (isDry) {
    cSh = COL.gShade1; cMid = COL.dry0; cLit = COL.dry1; cTip = light > 0.68 ? COL.dry3 : COL.dry2;
  } else if (isSedge) {
    cSh = COL.gDeep0; cMid = COL.sedge0; cLit = COL.sedge1; cTip = COL.sedge2;
  } else if (light < 0.27) {
    cSh = COL.gDeep0; cMid = COL.gDeep1; cLit = COL.gShade0; cTip = COL.gShade1;
  } else if (light < 0.45) {
    cSh = COL.gDeep1; cMid = COL.gShade0; cLit = COL.gShade1; cTip = COL.gMid1;
  } else if (light < 0.64) {
    cSh = COL.gShade0; cMid = COL.gMid0; cLit = COL.gMid1; cTip = COL.gLit1;
  } else if (light < 0.80) {
    cSh = COL.gShade1; cMid = COL.gMid1; cLit = COL.gLit0; cTip = COL.gSun0;
  } else {
    cSh = COL.gMid0; cMid = COL.gLit0; cLit = COL.gLit1; cTip = COL.gSun1;
  }

  const style = Math.floor(seed * 3);
  if (style === 0) {
    // Sculpted scalloped 3-blade leafy cushion (7x5px cluster!)
    for (let dx = -3; dx <= 3; dx++) pxPlot(buf, W, H, x + dx, y + 1, cSh);
    for (let dx = -3; dx <= 3; dx++) pxPlot(buf, W, H, x + dx, y, cMid);
    pxPlot(buf, W, H, x - 3, y - 1, cLit);
    pxPlot(buf, W, H, x - 2, y - 1, cLit);
    pxPlot(buf, W, H, x, y - 1, cLit);
    pxPlot(buf, W, H, x + 2, y - 1, cLit);
    pxPlot(buf, W, H, x + 3, y - 1, cMid);
    // Crisp curved blade tips fanning outward
    pxPlot(buf, W, H, x - 4, y - 2, cTip);
    pxPlot(buf, W, H, x - 1, y - 2, cTip);
    pxPlot(buf, W, H, x, y - 3, cTip);
    pxPlot(buf, W, H, x + 2, y - 2, cTip);
    pxPlot(buf, W, H, x + 3, y - 3, cTip);
  } else if (style === 1) {
    // Lush sweeping 4-blade meadow tuft (9x6px cluster!)
    for (let dx = -3; dx <= 3; dx++) pxPlot(buf, W, H, x + dx, y + 1, cSh);
    drawSculptedBlade(buf, W, H, x - 3, y, 4, -2.8, cMid, cLit, cTip, true);
    drawSculptedBlade(buf, W, H, x - 1, y, 5, -0.8, cMid, cLit, cTip, true);
    drawSculptedBlade(buf, W, H, x + 1, y, 5, 1.5, cMid, cLit, cTip, true);
    drawSculptedBlade(buf, W, H, x + 3, y, 4, 3.0, cMid, cLit, cTip, false);
  } else {
    // Plush mossy clover cushion (6x4px pillow!)
    for (let dx = -2; dx <= 3; dx++) pxPlot(buf, W, H, x + dx, y + 1, cSh);
    for (let dx = -3; dx <= 3; dx++) pxPlot(buf, W, H, x + dx, y, cMid);
    pxPlot(buf, W, H, x - 2, y - 1, cLit);
    pxPlot(buf, W, H, x - 1, y - 1, cTip);
    pxPlot(buf, W, H, x + 1, y - 1, cLit);
    pxPlot(buf, W, H, x + 2, y - 1, cTip);
    pxPlot(buf, W, H, x, y - 2, cLit);
  }
}

function stampWildflowerBouquet(buf: Uint8ClampedArray, W: number, H: number, x: number, y: number, variant: number): void {
  const f0 = variant === 0 ? COL.flGold0 : variant === 1 ? COL.flLav0 : variant === 2 ? COL.flWhite0 : COL.flCoral0;
  const f1 = variant === 0 ? COL.flGold1 : variant === 1 ? COL.flLav1 : variant === 2 ? COL.flWhite1 : COL.flCoral1;
  const f2 = variant === 0 ? COL.flGold2 : variant === 1 ? COL.flLav2 : variant === 2 ? COL.flGold1 : COL.flGold2;
  // Cluster of 3-4 lush blossoms with leafy cradle (NEVER a stray isolated pixel!)
  const blooms = [
    [-4, 1], [0, -2], [4, 0], [-1, 2],
  ];
  for (let i = 0; i < blooms.length; i++) {
    const bx = x + blooms[i][0];
    const by = y + blooms[i][1];
    pxPlot(buf, W, H, bx, by + 2, COL.gShade0);
    pxPlot(buf, W, H, bx - 1, by + 1, COL.gMid0);
    pxPlot(buf, W, H, bx + 1, by + 1, COL.gMid1);
    pxPlot(buf, W, H, bx, by + 1, f0);
    pxPlot(buf, W, H, bx - 1, by, f1);
    pxPlot(buf, W, H, bx + 1, by, f1);
    pxPlot(buf, W, H, bx, by - 1, f1);
    pxPlot(buf, W, H, bx, by, f2);
  }
}

function stampTinyMushroomCluster(buf: Uint8ClampedArray, W: number, H: number, x: number, y: number, bio: boolean): void {
  const c0 = bio ? COL.mushBio0 : COL.mushCap0;
  const c1 = bio ? COL.mushBio1 : COL.mushCap1;
  const spots = [[0, 0, 1], [-4, 1, 0], [4, 1, 0], [2, 2, 0]];
  for (const [ox, oy, tall] of spots) {
    const mx = x + ox;
    const my = y + oy;
    pxPlot(buf, W, H, mx, my + 1, COL.peat1, 175);
    pxPlot(buf, W, H, mx, my, COL.mushStem);
    if (tall) pxPlot(buf, W, H, mx, my - 1, COL.mushStem);
    const cy = my - (tall ? 2 : 1);
    pxPlot(buf, W, H, mx - 1, cy, c0);
    pxPlot(buf, W, H, mx + 1, cy, c0);
    pxPlot(buf, W, H, mx, cy, c1);
    pxPlot(buf, W, H, mx, cy - 1, c1);
  }
}

function stampFallenLeaf(buf: Uint8ClampedArray, W: number, H: number, x: number, y: number, seed: number): void {
  const c = seed > 0.72 ? COL.leafGold : seed > 0.4 ? COL.leafAmber : seed > 0.16 ? COL.leafRust : COL.leafPlum;
  const flip = seed > 0.5 ? 1 : -1;
  pxPlot(buf, W, H, x, y + 1, COL.peat1, 140);
  pxPlot(buf, W, H, x, y, c);
  pxPlot(buf, W, H, x + flip, y, c);
  pxPlot(buf, W, H, x + flip, y - 1, seed > 0.5 ? COL.leafGold : COL.leafAmber);
}

function stampSteppingCobble(buf: Uint8ClampedArray, W: number, H: number, x: number, y: number, big: boolean): void {
  const rx = big ? 4 : 2;
  const ry = big ? 2 : 1;
  for (let dy = -ry; dy <= ry; dy++) {
    for (let dx = -rx; dx <= rx; dx++) {
      if ((dx * dx) / (rx * rx + 0.5) + (dy * dy) / (ry * ry + 0.5) > 1.0) continue;
      const col = dy === ry ? COL.peat1 : dy < 0 ? (dx < 0 ? COL.stoneHi : COL.stoneLit) : COL.stoneMid;
      pxPlot(buf, W, H, x + dx, y + dy, col);
    }
  }
  if (big) {
    // Tiny sprig of emerald moss hugging the cobble corner!
    pxPlot(buf, W, H, x + rx - 1, y - 1, COL.gMid1);
    pxPlot(buf, W, H, x + rx, y, COL.gShade1);
  }
}

function drawSurfaceFeederRoot(
  buf: Uint8ClampedArray,
  W: number,
  H: number,
  x0: number,
  y0: number,
  angle: number,
  len: number,
  seed: number
): void {
  const steps = Math.round(len);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const wiggle = Math.sin(t * Math.PI * 2 + seed * 6.28) * 3.4 * t;
    const rx = Math.round(x0 + Math.cos(angle) * i - Math.sin(angle) * wiggle);
    const ry = Math.round(y0 + Math.sin(angle) * i * 0.45 + Math.cos(angle) * wiggle * 0.45);
    const thick = t < 0.38 ? 2 : t < 0.74 ? 1 : 0;
    pxPlot(buf, W, H, rx, ry + 2, COL.peat1, 150);
    pxPlot(buf, W, H, rx, ry + 1, COL.rootDark);
    pxPlot(buf, W, H, rx, ry, t < 0.62 ? COL.rootMid : COL.rootDark);
    if (thick >= 1) {
      pxPlot(buf, W, H, rx, ry - 1, (i + Math.round(seed * 10)) % 4 === 0 ? COL.rootMoss : COL.rootLit);
    }
    if (thick >= 2) pxPlot(buf, W, H, rx + 1, ry, COL.rootMid);
  }
}

export interface V80GroundBuildResult {
  floor: RgbaImage;
  lightMap: Float32Array;
  grassDensityMap: Float32Array;
  trailMask: Uint8Array;
  waterMask: Uint8Array;
  embeddedPropsCount: number;
  bakedBotanicalStamps: number;
}

export function buildV80LivingForestFloor(world: V73OpenWorldDef): V80GroundBuildResult {
  const W = world.worldW;
  const H = world.worldH;
  const pixels = createEmptyBuffer(W, H);
  const lightMap = new Float32Array(W * H);
  const grassDensityMap = new Float32Array(W * H);
  const trailMask = new Uint8Array(W * H);
  const waterMask = new Uint8Array(W * H);

  const turfBand = [
    hexToRgb('#071d18'),
    hexToRgb('#0d3225'),
    hexToRgb('#144a2f'),
    hexToRgb('#1f6938'),
    hexToRgb('#31873f'),
    hexToRgb('#51a746'),
    hexToRgb('#7fc650'),
    hexToRgb('#aed95d'),
  ];

  // STEP 1: Smooth Multi-Material Biome Earth & Moss Underpainting (ZERO ugly Bayer grid on turf!)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const n = fbm(x, y);
      const patch = smoothNoise(x + 91, y - 53, 46);
      const micro = smoothNoise(x, y, 9);

      let light = 0.25 + n * 0.24;
      const dNW = Math.hypot((x - 560) / 380, (y - 540) / 300);
      if (dNW < 1.15) light -= (1.15 - dNW) * 0.17;

      for (const cl of world.clearings) {
        const wn = (n - 0.5) * 0.34;
        const d = Math.hypot((x - cl.x) / cl.rx, (y - cl.y) / cl.ry) + wn;
        if (d < 1.2) {
          const s = Math.max(0, 1 - d / 1.2);
          light += s * s * 0.58 * cl.intensity;
        }
      }
      const edgeDist = Math.min(x, W - 1 - x, y, H - 1 - y);
      if (edgeDist < 290) light -= (1 - edgeDist / 290) * 0.24;
      light = Math.max(0.04, Math.min(0.99, light));
      const idxPix = y * W + x;
      lightMap[idxPix] = light;

      let gDens = Math.max(0, Math.min(1, 0.30 + patch * 0.62 + (light - 0.3) * 0.24));

      let trailDist = 999;
      for (let s = 0; s < WOODLAND_TRAIL_SEGS.length; s++) {
        const seg = WOODLAND_TRAIL_SEGS[s];
        const d = distPointToSeg(x, y, seg[0], seg[1], seg[2], seg[3]);
        if (d < trailDist) trailDist = d;
      }
      const warpedTrail = trailDist + (n - 0.5) * 34 + (micro - 0.5) * 12;

      // Smooth organic quantized color band (soft organic noise boundary instead of checkerboard!)
      const bandPos = light * (turfBand.length - 1) + (micro - 0.5) * 0.65;
      let col: RGB = turfBand[Math.max(0, Math.min(turfBand.length - 1, Math.round(bandPos)))];

      // Weathered mossy woodland footpath (mottled earth tones + organic broken grassy edges!)
      if (warpedTrail < 23 && light > 0.16) {
        const tW = Math.max(0, 1 - warpedTrail / 23);
        if (tW + (micro - 0.5) * 0.55 > 0.54) {
          trailMask[idxPix] = 1;
          gDens *= 0.10;
          const pebbleN = smoothNoise(x * 1.3, y * 1.3, 6);
          col = tW > 0.72 ? (pebbleN > 0.56 ? COL.soilWarm : COL.soil2) : pebbleN > 0.45 ? COL.soil1 : COL.soil0;
          if (light > 0.62 && pebbleN > 0.74) col = COL.soilSand;
        }
      }

      // Mirror-like rainwater pools with damp darkened shoreline & canopy shade reflection
      for (const p of world.pools) {
        const pd = Math.hypot((x - p.x) / p.rx, (y - p.y) / p.ry) + (micro - 0.5) * 0.22;
        if (pd < 1.26) {
          gDens = pd < 1.05 ? 0 : gDens * 0.5;
          if (pd > 1.04) {
            col = pd > 1.15 ? COL.mudRim1 : COL.mudRim0;
          } else if (pd > 0.92) {
            col = COL.peat1;
            waterMask[idxPix] = 1;
          } else {
            waterMask[idxPix] = 1;
            const northShade = (y - p.y) / p.ry;
            const refl = smoothNoise(x * 0.75, y * 1.4, 18);
            if (pd > 0.78 || northShade < -0.45) {
              col = refl > 0.54 ? COL.waterDeep : COL.waterShadow;
            } else {
              col = refl > 0.74 ? COL.waterSun : refl > 0.44 ? COL.waterSky : COL.waterMid;
            }
          }
          break;
        }
      }

      grassDensityMap[idxPix] = gDens;
      setPixel(pixels, W, H, x, y, { ...col, a: 255 });
    }
  }

  // STEP 2 (PASS A): DENSE WOVEN SCULPTED TURF & MULTI-BLADE PIXEL-ART GRASS CARPET!
  // Spacing 6x5 -> EVERY SINGLE SQUARE OF GROUND IS WOVEN FROM READABLE SCULPTED LEAFY CLUSTERS!
  let bakedBotanicalStamps = 0;
  for (let gy = 6; gy < H - 6; gy += 5) {
    for (let gx = 6; gx < W - 6; gx += 6) {
      const jx = gx + Math.floor((hash2d(gx, gy) - 0.5) * 6);
      const jy = gy + Math.floor((hash2d(gx + 37, gy + 91) - 0.5) * 5);
      if (jx < 5 || jx >= W - 5 || jy < 5 || jy >= H - 5) continue;
      const idx = jy * W + jx;
      if (waterMask[idx]) continue;

      const light = lightMap[idx];
      const dens = grassDensityMap[idx];
      const r1 = hash2d(jx * 3, jy * 5);
      const r2 = hash2d(jx * 7 + 11, jy * 13 + 3);
      const spN = smoothNoise(jx + 211, jy - 89, 74);

      if (trailMask[idx]) {
        // Stepping flagstones & warm fallen leaves embedded organically along the trail!
        if (r1 > 0.945) {
          stampSteppingCobble(pixels, W, H, jx, jy, r2 > 0.52);
          bakedBotanicalStamps++;
        } else if (r1 < 0.032) {
          stampFallenLeaf(pixels, W, H, jx, jy, r2);
          bakedBotanicalStamps++;
        }
        continue;
      }

      // Check if sitting right on the trail border -> paint lush grass overhanging path edge!
      const nearTrail =
        (jx > 6 && trailMask[idx - 5]) ||
        (jx < W - 6 && trailMask[idx + 5]) ||
        (jy > 6 && trailMask[idx - 5 * W]) ||
        (jy < H - 6 && trailMask[idx + 5 * W]);

      if (nearTrail || r1 < 0.58 + dens * 0.38) {
        const isDry = light > 0.67 && spN > 0.60;
        const isSedge = light < 0.34 && spN < 0.44;
        stampPainterlyTurfCluster(pixels, W, H, jx, jy, light, r2, isDry, isSedge);
        bakedBotanicalStamps++;
      }

      // Natural Wildflower Bouquets (blooming in sunlit meadows & near arches/paths — organic colonies!)
      const flColony = smoothNoise(jx - 317, jy + 173, 56);
      if (flColony > 0.72 && light > 0.40 && r1 > 0.945) {
        const v = light > 0.68 ? (r2 > 0.25 ? 0 : 3) : spN > 0.5 ? 1 : 2;
        stampWildflowerBouquet(pixels, W, H, jx, jy, v);
        bakedBotanicalStamps++;
      }

      // Scattered warm autumn leaves nestled in deeper shaded pockets
      if (light < 0.48 && r1 > 0.968 && r2 > 0.5) {
        stampFallenLeaf(pixels, W, H, jx, jy, r2);
        bakedBotanicalStamps++;
      }
    }
  }

  // STEP 3 (PASS B): FULL PHYSICAL OBJECT-TO-GROUND EMBEDDING (ROOT-CONTOUR HUMUS,
  //         SURFACE FEEDER ROOTS, MOSS APRONS, MUSHROOM COLONIES & FALLEN LEAF DRIFTS!)
  let embeddedPropsCount = 0;
  for (const p of world.props) {
    if (p.layer === 'canopy' || p.layer === 'perimeter_canopy') continue;
    if (!p.groundShadowRx || !p.groundShadowRy) continue;
    embeddedPropsCount++;

    const rx = p.groundShadowRx;
    const ry = p.groundShadowRy;
    const cy = p.y - 6;
    const isTree = p.isColossalTrunk || p.spriteKey.startsWith('full_tree');
    const isRock = p.spriteKey.includes('boulder') || p.spriteKey.includes('waystone') || p.spriteKey.includes('chime');
    const isLog = p.spriteKey.includes('fallen_hollow_log');

    const x0 = Math.max(0, Math.floor(p.x - rx * 1.65));
    const x1 = Math.min(W - 1, Math.ceil(p.x + rx * 1.65));
    const y0 = Math.max(0, Math.floor(cy - ry * 1.7));
    const y1 = Math.min(H - 1, Math.ceil(cy + ry * 1.7));

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (waterMask[y * W + x]) continue;
        const ang = Math.atan2((y - cy) * 2.2, x - p.x);
        const lobe = Math.sin(ang * (isTree ? 5 : 4) + p.x * 0.07) * 0.18 + (smoothNoise(x, y, 16) - 0.5) * 0.25;
        const d = Math.hypot((x - p.x) / rx, (y - cy) / ry) + lobe;
        if (d < 0.96) {
          const occ = (1 - d * d) * 0.56;
          const oi = (y * W + x) * 4;
          const soilC = d < 0.52 ? COL.peat0 : isTree || isLog ? COL.peat1 : COL.gDeep0;
          pixels[oi] = Math.round(pixels[oi] * (1 - occ) + soilC.r * occ);
          pixels[oi + 1] = Math.round(pixels[oi + 1] * (1 - occ) + soilC.g * occ);
          pixels[oi + 2] = Math.round(pixels[oi + 2] * (1 - occ) + soilC.b * occ);
        }
      }
    }

    if (isTree) {
      const rootCount = p.isColossalTrunk ? 7 : 5;
      for (let r = 0; r < rootCount; r++) {
        const a = (r / rootCount) * Math.PI * 2 + hash2d(p.x + r, p.y) * 0.55;
        const startX = p.x + Math.cos(a) * (rx * 0.42);
        const startY = cy + Math.sin(a) * (ry * 0.42);
        const rLen = (p.isColossalTrunk ? 28 : 18) + hash2d(p.x, p.y + r * 11) * 18;
        drawSurfaceFeederRoot(pixels, W, H, startX, startY, a, rLen, hash2d(r, p.x));
      }
    }

    // Lush mossy turf collar, fallen leaf drifts & tiny woodland/biolum mushrooms tucked right around the base!
    const collarCount = p.isColossalTrunk ? 24 : isLog ? 20 : isRock ? 12 : 6;
    for (let k = 0; k < collarCount; k++) {
      const a = (k / collarCount) * Math.PI * 2 + hash2d(p.x + k, p.y) * 0.4;
      const rad = 0.78 + hash2d(p.x + k * 9, p.y) * 0.62;
      const lx = Math.round(p.x + Math.cos(a) * rx * rad);
      const ly = Math.round(cy + Math.sin(a) * ry * rad);
      if (lx < 6 || lx >= W - 6 || ly < 6 || ly >= H - 6 || waterMask[ly * W + lx]) continue;
      if ((isTree || isLog || isRock) && k < 3) {
        const bio = p.spriteKey.includes('moss') || p.spriteKey.includes('split') || isLog || p.spriteKey.includes('waystone');
        stampTinyMushroomCluster(pixels, W, H, lx, ly, bio && k === 0);
      } else if (k % 3 === 0) {
        stampPainterlyTurfCluster(pixels, W, H, lx, ly, Math.min(0.6, lightMap[ly * W + lx]), hash2d(lx, ly), false, false);
      } else {
        stampFallenLeaf(pixels, W, H, lx, ly, hash2d(lx, ly));
      }
    }
  }

  return {
    floor: { pixels, width: W, height: H },
    lightMap,
    grassDensityMap,
    trailMask,
    waterMask,
    embeddedPropsCount,
    bakedBotanicalStamps,
  };
}

// ============================================================================
// PASS B + C: NATURAL DRIFT LIVING GRASS CLUSTERS & FULL ROOT-CRADLE WRAPS
// ============================================================================

export interface V80LivingTuft {
  id: string;
  species: V80TuftSpecies;
  x: number;
  y: number;
  phase: number;
  windSensitivity: number;
  isRootWrap: boolean;
}

export interface V80CritterSpec {
  id: string;
  kind: 0 | 1 | 2;
  homeX: number;
  homeY: number;
  radiusX: number;
  radiusY: number;
  speed: number;
  phase: number;
}

export function generateV80LivingEcosystemPlacements(
  world: V73OpenWorldDef,
  ground: V80GroundBuildResult
): {
  tufts: V80LivingTuft[];
  critters: V80CritterSpec[];
} {
  const tufts: V80LivingTuft[] = [];
  const W = world.worldW;
  const H = world.worldH;
  let tid = 0;

  const pushTuft = (x: number, y: number, species: V80TuftSpecies, isRootWrap: boolean) => {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 200 || ix > W - 200 || iy < 200 || iy > H - 200) return;
    if (ground.waterMask[iy * W + ix]) return;
    tufts.push({
      id: `${isRootWrap ? 'wrap' : 'tuft'}_${tid++}`,
      species,
      x: ix,
      y: iy,
      phase: hash2d(ix, iy) * Math.PI * 2,
      windSensitivity: species === 'root_fernlet' ? 0.72 : species === 'meadow_tall' || species === 'sunlit_golden' ? 1.18 : 0.95,
      isRootWrap,
    });
  };

  // 1) COMPREHENSIVE FOREGROUND ROOT, ROCK, LOG, ARCH & LANDMARK WRAPS (living blades overlapping roots!)
  for (const p of world.props) {
    if (p.layer === 'canopy' || p.layer === 'perimeter_canopy') continue;
    const isTree = p.isColossalTrunk || p.spriteKey.startsWith('full_tree');
    const isRock = p.spriteKey.includes('boulder');
    const isLog = p.spriteKey.includes('fallen_hollow_log');
    const isArch = p.spriteKey.includes('root_arch');
    const isLandmark = p.spriteKey.includes('waystone') || p.spriteKey.includes('chime');
    if (!isTree && !isRock && !isLog && !isArch && !isLandmark) continue;
    if (p.x < 220 || p.x > W - 220 || p.y < 230 || p.y > H - 180) continue;

    if (p.isColossalTrunk) {
      pushTuft(p.x - 62, p.y + 1, 'root_fernlet', true);
      pushTuft(p.x - 36, p.y + 6, 'meadow_tall', true);
      pushTuft(p.x - 14, p.y + 8, 'biolum_blossom', true);
      pushTuft(p.x + 18, p.y + 7, 'root_fernlet', true);
      pushTuft(p.x + 48, p.y + 4, 'meadow_lush', true);
      pushTuft(p.x + 68, p.y - 1, 'shade_sedge', true);
    } else if (isTree) {
      pushTuft(p.x - 46, p.y + 1, 'root_fernlet', true);
      pushTuft(p.x - 18, p.y + 6, 'meadow_lush', true);
      pushTuft(p.x + 14, p.y + 7, 'flower_lavender', true);
      pushTuft(p.x + 44, p.y + 2, 'root_fernlet', true);
    } else if (isArch) {
      pushTuft(p.x - 84, p.y + 3, 'root_fernlet', true);
      pushTuft(p.x - 60, p.y + 6, 'flower_lavender', true);
      pushTuft(p.x + 62, p.y + 6, 'root_fernlet', true);
      pushTuft(p.x + 86, p.y + 3, 'meadow_tall', true);
    } else if (isLog) {
      pushTuft(p.x - 94, p.y + 4, 'root_fernlet', true);
      pushTuft(p.x - 52, p.y + 8, 'biolum_blossom', true);
      pushTuft(p.x - 12, p.y + 9, 'meadow_tall', true);
      pushTuft(p.x + 32, p.y + 7, 'flower_buttercup', true);
      pushTuft(p.x + 62, p.y + 4, 'root_fernlet', true);
    } else if (isLandmark) {
      pushTuft(p.x - 36, p.y + 4, 'biolum_blossom', true);
      pushTuft(p.x - 12, p.y + 7, 'flower_buttercup', true);
      pushTuft(p.x + 20, p.y + 8, 'root_fernlet', true);
      pushTuft(p.x + 38, p.y + 4, 'biolum_blossom', true);
    } else if (isRock) {
      const small = p.spriteKey.includes('small');
      pushTuft(p.x - (small ? 30 : 48), p.y + 3, 'root_fernlet', true);
      pushTuft(p.x - (small ? 8 : 16), p.y + 7, 'meadow_lush', true);
      pushTuft(p.x + (small ? 26 : 46), p.y + 4, 'root_fernlet', true);
      if (!small) pushTuft(p.x + 14, p.y + 8, 'flower_lavender', true);
    }
  }

  // 2) NATURAL ORGANIC DRIFTS (clusters of 2-3 overlapping living tufts instead of solitary dots!)
  for (let gy = 264; gy < H - 220; gy += 64) {
    for (let gx = 284; gx < W - 284; gx += 68) {
      const cx = gx + Math.round((hash2d(gx, gy) - 0.5) * 44);
      const cy = gy + Math.round((hash2d(gx + 19, gy + 67) - 0.5) * 40);
      const idx = cy * W + cx;
      if (ground.waterMask[idx] || ground.trailMask[idx]) continue;

      const dens = ground.grassDensityMap[idx];
      const light = ground.lightMap[idx];
      const pick = hash2d(cx * 5, cy * 3);
      if (pick > dens * 0.74) continue;

      const spNoise = smoothNoise(cx + 101, cy - 47, 88);
      let mainSp: V80TuftSpecies;
      let accentSp: V80TuftSpecies;
      if (light > 0.68 && spNoise > 0.54) {
        mainSp = 'sunlit_golden';
        accentSp = 'flower_buttercup';
      } else if (light > 0.52) {
        mainSp = 'meadow_tall';
        accentSp = pick < 0.35 ? 'flower_buttercup' : 'flower_lavender';
      } else if (light < 0.30) {
        mainSp = 'shade_sedge';
        accentSp = pick < 0.25 ? 'biolum_blossom' : 'root_fernlet';
      } else {
        mainSp = 'meadow_lush';
        accentSp = pick < 0.28 ? 'flower_lavender' : 'meadow_tall';
      }

      // Place a natural 2-3 tuft botanical drift rather than one lonely sprig!
      pushTuft(cx, cy, mainSp, false);
      pushTuft(cx + (pick > 0.5 ? 14 : -14), cy + 5, accentSp, false);
      if (dens > 0.65) {
        pushTuft(cx + (pick > 0.5 ? -10 : 12), cy + 9, mainSp, false);
      }
    }
  }

  // 3) Shoreline reeds & water-loving wildflowers framing every reflective pool!
  for (const pool of world.pools) {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      const tx = pool.x + Math.cos(a) * (pool.rx + 9);
      const ty = pool.y + Math.sin(a) * (pool.ry + 7);
      pushTuft(tx, ty, i % 3 === 0 ? 'flower_buttercup' : i % 2 === 0 ? 'shade_sedge' : 'meadow_tall', true);
    }
  }

  const critters: V80CritterSpec[] = [
    { id: 'bf_clear_1', kind: 0, homeX: 1638, homeY: 794, radiusX: 78, radiusY: 42, speed: 0.52, phase: 0.4 },
    { id: 'bf_clear_2', kind: 0, homeX: 1712, homeY: 856, radiusX: 62, radiusY: 34, speed: 0.64, phase: 2.8 },
    { id: 'moth_waystone', kind: 1, homeX: 1692, homeY: 454, radiusX: 54, radiusY: 32, speed: 0.45, phase: 1.3 },
    { id: 'moth_hub', kind: 2, homeX: 1038, homeY: 808, radiusX: 84, radiusY: 44, speed: 0.48, phase: 3.9 },
    { id: 'moth_arch', kind: 1, homeX: 1118, homeY: 448, radiusX: 68, radiusY: 34, speed: 0.42, phase: 5.1 },
    { id: 'bf_log', kind: 0, homeX: 646, homeY: 924, radiusX: 64, radiusY: 38, speed: 0.56, phase: 2.1 },
    { id: 'moth_pools', kind: 1, homeX: 1172, homeY: 1032, radiusX: 74, radiusY: 32, speed: 0.50, phase: 0.9 },
  ];

  return { tufts, critters };
}
