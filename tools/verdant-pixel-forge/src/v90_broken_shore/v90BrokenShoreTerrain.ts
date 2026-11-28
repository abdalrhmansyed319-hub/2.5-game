import { type RGB, type SpriteBitmap, hexToRgb, loadPngRgba } from './v90PaletteAndExtractor';
import {
  type V90LivingCoastalTuft,
  type V90PropPlacement,
  V90_SHORE_H,
  V90_SHORE_ORIGIN_Y,
  V90_TIDEPOOLS,
  V90_WORLD_W,
  getBrokenShoreWaterlineY,
  getCoastalVegBeltY,
} from './v90BrokenShoreWorldDef';

function hash2(x: number, y: number, s = 0): number {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041);
  n = (n ^ (n >>> 13)) >>> 0;
  n = Math.imul(n, 1274126177) >>> 0;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function vnoise(x: number, y: number, scale: number, seed: number): number {
  const fx = x / scale;
  const fy = y / scale;
  const ix = Math.floor(fx);
  const iy = Math.floor(fy);
  const ux = fx - ix;
  const uy = fy - iy;
  const sx = ux * ux * (3 - 2 * ux);
  const sy = uy * uy * (3 - 2 * uy);
  const a = hash2(ix, iy, seed);
  const b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed);
  const d = hash2(ix + 1, iy + 1, seed);
  return (a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy;
}

function setRgb(rgba: Uint8Array, w: number, h: number, x: number, y: number, c: RGB): void {
  const ix = Math.round(x);
  const iy = Math.round(y);
  if (ix < 0 || ix >= w || iy < 0 || iy >= h) return;
  const o = (iy * w + ix) * 4;
  rgba[o] = c.r;
  rgba[o + 1] = c.g;
  rgba[o + 2] = c.b;
  rgba[o + 3] = 255;
}

function blendRgb(rgba: Uint8Array, w: number, h: number, x: number, y: number, c: RGB, a: number): void {
  const ix = Math.round(x);
  const iy = Math.round(y);
  if (ix < 0 || ix >= w || iy < 0 || iy >= h) return;
  const o = (iy * w + ix) * 4;
  const ia = 1 - a;
  rgba[o] = Math.round(rgba[o] * ia + c.r * a);
  rgba[o + 1] = Math.round(rgba[o + 1] * ia + c.g * a);
  rgba[o + 2] = Math.round(rgba[o + 2] * ia + c.b * a);
  rgba[o + 3] = 255;
}

function drawLineRgb(
  rgba: Uint8Array,
  w: number,
  h: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  c: RGB
): void {
  const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    setRgb(rgba, w, h, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, c);
  }
}

/**
 * Handcrafted multi-blade pixel-art turf cushion matching V8.0's woven emerald craft
 * (overlapping scalloped leaf pillows + arching blade tips — zero grid bands, zero speckles!).
 */
function stampArtisanalTurfCluster(
  rgba: Uint8Array,
  w: number,
  h: number,
  cx: number,
  cy: number,
  variant: number,
  cDeep: RGB,
  cMid: RGB,
  cLit: RGB,
  cHi: RGB
): void {
  if (variant === 0) {
    // Broad lush scalloped grass pillow (9x5 px)
    for (let dx = -4; dx <= 4; dx++) setRgb(rgba, w, h, cx + dx, cy + 2, cDeep);
    for (let dx = -4; dx <= 4; dx++) setRgb(rgba, w, h, cx + dx, cy + 1, Math.abs(dx) === 4 ? cDeep : cMid);
    for (let dx = -3; dx <= 3; dx++) setRgb(rgba, w, h, cx + dx, cy, Math.abs(dx) === 3 ? cMid : cLit);
    setRgb(rgba, w, h, cx - 2, cy - 1, cLit);
    setRgb(rgba, w, h, cx - 1, cy - 1, cHi);
    setRgb(rgba, w, h, cx + 1, cy - 1, cHi);
    setRgb(rgba, w, h, cx + 2, cy - 1, cLit);
    setRgb(rgba, w, h, cx, cy - 2, cHi);
  } else if (variant === 1) {
    // Wind-swept arching 4-blade coastal grass fan
    for (let dx = -3; dx <= 2; dx++) setRgb(rgba, w, h, cx + dx, cy + 1, cDeep);
    setRgb(rgba, w, h, cx - 3, cy, cMid);
    setRgb(rgba, w, h, cx - 2, cy, cLit);
    setRgb(rgba, w, h, cx, cy, cMid);
    setRgb(rgba, w, h, cx + 1, cy, cLit);
    setRgb(rgba, w, h, cx + 2, cy, cMid);
    setRgb(rgba, w, h, cx - 2, cy - 1, cLit);
    setRgb(rgba, w, h, cx - 1, cy - 1, cHi);
    setRgb(rgba, w, h, cx + 1, cy - 1, cHi);
    setRgb(rgba, w, h, cx + 3, cy - 1, cLit);
    setRgb(rgba, w, h, cx + 2, cy - 2, cHi);
  } else if (variant === 2) {
    // Layered mossy clover rosette
    for (let dx = -2; dx <= 2; dx++) setRgb(rgba, w, h, cx + dx, cy + 1, cDeep);
    setRgb(rgba, w, h, cx - 3, cy, cMid);
    setRgb(rgba, w, h, cx - 2, cy, cLit);
    setRgb(rgba, w, h, cx - 1, cy, cHi);
    setRgb(rgba, w, h, cx, cy, cMid);
    setRgb(rgba, w, h, cx + 1, cy, cLit);
    setRgb(rgba, w, h, cx + 2, cy, cHi);
    setRgb(rgba, w, h, cx - 1, cy - 1, cHi);
    setRgb(rgba, w, h, cx + 1, cy - 1, cLit);
  } else {
    // Soft low ground-cover weave filling between taller tufts
    for (let dx = -3; dx <= 3; dx++) setRgb(rgba, w, h, cx + dx, cy + 1, cDeep);
    for (let dx = -2; dx <= 2; dx++) setRgb(rgba, w, h, cx + dx, cy, dx % 2 === 0 ? cMid : cLit);
    setRgb(rgba, w, h, cx - 1, cy - 1, cLit);
    setRgb(rgba, w, h, cx + 1, cy - 1, cHi);
  }
}

function drawFlatStone(
  rgba: Uint8Array,
  w: number,
  h: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  cDark: RGB,
  cMid: RGB,
  cHi: RGB,
  seed = 0,
  mossCol?: RGB
): void {
  for (let dy = -ry - 1; dy <= ry + 1; dy++) {
    for (let dx = -rx - 1; dx <= rx + 1; dx++) {
      const ang = Math.atan2(dy, dx);
      const irreg = seed ? 1 + 0.16 * Math.sin(ang * 3 + seed) + 0.09 * Math.cos(ang * 5 - seed) : 1;
      const d = Math.hypot(dx / (rx * irreg + 0.3), dy / (ry * irreg + 0.3));
      if (d > 1.0) continue;
      let c = dy >= ry - 1 || d > 0.78 ? cDark : dy < 0 && dx <= rx * 0.3 ? cHi : cMid;
      if (mossCol && dy < 0 && dx > 0 && d > 0.48 && hash2(cx + dx, cy + dy, seed + 7) > 0.56) {
        c = mossCol;
      }
      setRgb(rgba, w, h, cx + dx, cy + dy, c);
    }
  }
}

/**
 * Evaluates an irregular organic 3-lobe compound tidepool basin distance (NEVER a geometric oval!).
 * Returns < 1.0 inside water, 1.0..1.24 on wet rocky rim!
 */
function evalOrganicTidepoolField(
  x: number,
  gy: number,
  tp: { id: string; x: number; y: number; rx: number; ry: number },
  idx: number,
  nMed: number,
  nFine: number
): number {
  const dx = x - tp.x;
  const dy = gy - tp.y;
  const ang = Math.atan2(dy, dx);
  const wobble =
    0.16 * Math.sin(ang * 3 + idx * 1.9 + 0.4) +
    0.11 * Math.cos(ang * 5 - idx * 2.3) +
    (nMed - 0.5) * 0.24 +
    (nFine - 0.5) * 0.08;
  const mainD = Math.hypot(dx / (tp.rx * (1 + wobble)), dy / (tp.ry * (1 + wobble * 0.85)));

  // Secondary organic rock-pocket alcove lobe fused to each tidepool for handcrafted coastal geology!
  const lOffX = (idx % 2 === 0 ? 0.48 : -0.44) * tp.rx;
  const lOffY = (idx % 3 === 0 ? -0.34 : 0.30) * tp.ry;
  const lobeD = Math.hypot((dx - lOffX) / (tp.rx * 0.52), (dy - lOffY) / (tp.ry * 0.56)) + (nMed - 0.5) * 0.14;

  // Smooth union of main basin & alcove pocket
  return Math.min(mainD, lobeD * 1.06);
}

/**
 * Continuous coastal-to-forest trail centerline (matches V10.0 polished V8.0 southern spur at y=1344..1536!).
 */
function getGatewayTrailCenterX(gy: number): number {
  if (gy <= 1536) {
    // Seamlessly matches v100ForestFloorPolish southern spur at y=1344..1536 (ending at x=1142)!
    const t = Math.max(0, Math.min(1, (gy - 1078) / (1536 - 1078)));
    return 1158 - t * 16 + Math.sin(t * Math.PI * 2.1) * 26;
  }
  return 1142 + Math.sin((gy - 1536) * 0.0075) * 72 + (gy > 1780 ? (gy - 1780) * 0.30 : 0);
}

/**
 * VERDANT SIGNAL V10.0 — Artisanal 2304x1536 Living Broken Shore Terrain & Ocean Masterwork.
 *   - Seamless zero-seam V8.0-to-V9.0 emerald-to-sage-to-dune ecotone with ~68k layered turf clusters
 *   - Sand -> warm dirt -> mossy humus -> weathered stepping flagstone trail unifying Shore & Forest
 *   - Tactile wind-sculpted dry beach ripples, high-tide kelp/shell wrack line & feathered swash
 *   - 5 organic multi-lobed basalt-rimmed tidepools + rocky tidal surge channel to the sea
 *   - Rich crash storytelling (twin plow trenches, telemetry cables, scorched shards, creeping flora)
 *   - Smart biome-aware prop embedding (mossy humus on meadows, wind-piled sand berms on beach!)
 */
export function buildV90BrokenShoreTerrain(
  v80ForestFloorPath: string,
  props: V90PropPlacement[]
): {
  floor: SpriteBitmap;
  tufts: V90LivingCoastalTuft[];
  stats: { botanicalStamps: number; embeddedProps: number; livingTufts: number };
} {
  const W = V90_WORLD_W;
  const H = V90_SHORE_H;
  const rgba = new Uint8Array(W * H * 4);

  // Ocean & Tidepool Swatches
  const oAbyss = hexToRgb('#101d32');
  const oDeep = hexToRgb('#172c48');
  const oSapph = hexToRgb('#1e4260');
  const oCobalt = hexToRgb('#255c78');
  const oTurq = hexToRgb('#2d768c');
  const oBright = hexToRgb('#3c949c');
  const oJade = hexToRgb('#56b2a6');
  const oShallow = hexToRgb('#7ec7ad');
  const oSandJade = hexToRgb('#a7d9bc');
  const oFoamSoft = hexToRgb('#cfece2');
  const oFoamHi = hexToRgb('#eff2e5');

  // Foreshore, Wet Sand & Sunlit Dune Swatches
  const sWetReflect = hexToRgb('#7d969c');
  const sWetDark = hexToRgb('#5f737a');
  const sDampDeep = hexToRgb('#6b533c');
  const sDamp = hexToRgb('#846648');
  const sDryDark = hexToRgb('#9e7c55');
  const sDryMid = hexToRgb('#ba9666');
  const sDryWarm = hexToRgb('#d0af7b');
  const sDryHi = hexToRgb('#e0c592');
  const sDryCream = hexToRgb('#eed9ad');

  // Crash Site & Soil Swatches
  const charDark = hexToRgb('#1e0c1c');
  const charPlum = hexToRgb('#2a1b31');
  const charBrown = hexToRgb('#46202a');
  const charSoil = hexToRgb('#534438');
  const humus0 = hexToRgb('#2b1e16');
  const humus1 = hexToRgb('#443020');
  const humus2 = hexToRgb('#64472e');
  const hullRust = hexToRgb('#a44522');
  const evaOrange = hexToRgb('#d86820');

  // Basalt & Flagstone Swatches
  const rockDark = hexToRgb('#242a38');
  const rockSlate = hexToRgb('#353f4f');
  const rockMid = hexToRgb('#4d5c6c');
  const rockLit = hexToRgb('#6d7c89');
  const rockHi = hexToRgb('#8798a2');
  const rockTop = hexToRgb('#b2bec0');

  // Unified Forest-to-Coast Emerald & Sage Foliage Swatches (bridging V8.0 seamlessly!)
  const fDeep = hexToRgb('#0c3024');
  const fShade = hexToRgb('#12442c');
  const fMid0 = hexToRgb('#1b5e35');
  const fMid1 = hexToRgb('#25783b');
  const fLit0 = hexToRgb('#3b9843');
  const fLit1 = hexToRgb('#5eba4a');
  const fSun = hexToRgb('#8ed852');

  const g0 = hexToRgb('#162922');
  const g1 = hexToRgb('#234232');
  const g2 = hexToRgb('#335c3e');
  const g3 = hexToRgb('#497b49');
  const g4 = hexToRgb('#679c52');
  const g5 = hexToRgb('#8db95e');
  const sage0 = hexToRgb('#2f5350');
  const sage1 = hexToRgb('#4c7b72');
  const sage2 = hexToRgb('#74a592');

  // Fallen Leaves & Wildflower Accents
  const leafRust = hexToRgb('#9e4825');
  const leafAmber = hexToRgb('#d17b36');
  const leafGold = hexToRgb('#e8ae52');
  const flLav = hexToRgb('#bea4eb');
  const tealGlow = hexToRgb('#8cf2ea');
  const amberGlow = hexToRgb('#f2b25f');

  const shoreYs = new Int32Array(W);
  const vegYs = new Int32Array(W);
  for (let x = 0; x < W; x++) {
    shoreYs[x] = getBrokenShoreWaterlineY(x);
    vegYs[x] = getCoastalVegBeltY(x);
  }

  const v80Floor = loadPngRgba(v80ForestFloorPath);

  // =========================================================================
  // PASS 1: 8-ZONE ALIEN OCEAN, FEATHERED FORESHORE, SCULPTED SAND & TIDEPOOLS
  // =========================================================================
  for (let ly = 0; ly < H; ly++) {
    const gy = V90_SHORE_ORIGIN_Y + ly;
    for (let x = 0; x < W; x++) {
      const sy = shoreYs[x];
      const vy = vegYs[x];
      const depth = gy - sy; // >0 = Ocean, <=0 = Land
      const nBroad = vnoise(x, gy, 76, 11);
      const nMed = vnoise(x, gy, 28, 29);
      const nFine = vnoise(x, gy, 10, 53);

      let col: RGB;

      // Natural rocky tidal surge channel linking tp_east_outer (1906, 2244) cleanly into ocean surf!
      const inChannelX = Math.abs(x - (1914 + Math.sin(gy * 0.06) * 7)) < 15 + (nFine - 0.5) * 6;
      const inTidalChannel = inChannelX && gy >= 2254 && gy <= sy + 8;

      if (depth > 0) {
        const swellUndul = Math.sin(x * 0.015 + gy * 0.012 + nBroad * 3.2) * 11 + (nMed - 0.5) * 15;
        const dEff = depth + swellUndul * Math.min(1, depth / 34);
        const sandbar = vnoise(x * 0.42, gy * 1.5, 28, 77);
        const reefShadow = vnoise(x * 0.52, gy * 1.35, 24, 91);

        if (dEff > 325) {
          col = oAbyss;
        } else if (dEff > 242) {
          col = reefShadow > 0.78 ? oAbyss : oDeep;
        } else if (dEff > 164) {
          col = reefShadow > 0.74 ? oDeep : oSapph;
        } else if (dEff > 104) {
          col = reefShadow > 0.72 ? oSapph : oCobalt;
        } else if (dEff > 56) {
          col = reefShadow > 0.70 ? oCobalt : sandbar > 0.68 ? oBright : oTurq;
        } else if (dEff > 26) {
          if (reefShadow > 0.74) col = oTurq;
          else if (sandbar > 0.58) col = oJade;
          else col = oBright;
        } else if (dEff > 11) {
          if (sandbar > 0.52) col = oSandJade;
          else if (nMed > 0.50) col = oShallow;
          else col = oJade;
        } else if (dEff > 4) {
          col = nFine > 0.52 ? oFoamSoft : oSandJade;
        } else {
          col = nFine > 0.36 ? oFoamHi : oFoamSoft;
        }
      } else {
        const hShore = -depth;
        const vegDist = vy - gy;

        // Evaluate all 5 multi-lobed organic tidepools!
        let bestPoolD = 99;
        for (let pi = 0; pi < V90_TIDEPOOLS.length; pi++) {
          const pd = evalOrganicTidepoolField(x, gy, V90_TIDEPOOLS[pi], pi, nMed, nFine);
          if (pd < bestPoolD) bestPoolD = pd;
        }

        if (bestPoolD < 0.96 || inTidalChannel) {
          // Clear multi-depth alien tidepool showing mottled seabed pebbles & subtle sunlit caustics!
          const caustic = Math.sin(x * 0.22 + gy * 0.34 + nMed * 5.0);
          const bedMottle = vnoise(x, gy, 11, 163);
          if (inTidalChannel && bestPoolD >= 0.96) {
            col = nFine > 0.62 ? oShallow : oJade;
          } else if (bestPoolD < 0.46) {
            col = caustic > 0.76 ? oShallow : bedMottle > 0.62 ? oTurq : oBright;
          } else if (bestPoolD < 0.74) {
            col = caustic > 0.70 ? oSandJade : bedMottle > 0.54 ? oShallow : oJade;
          } else {
            col = nFine > 0.56 ? oFoamSoft : oSandJade;
          }
        } else if (bestPoolD < 1.18) {
          // Irregular wet dark basalt & capillary-damp tidepool rock lip!
          col = bestPoolD < 1.07 ? (nFine > 0.48 ? rockDark : sWetDark) : sDampDeep;
        } else if (hShore < 18 + (nMed - 0.5) * 10 + Math.sin(x * 0.05) * 3) {
          // Receding glistening sky-reflecting wet foreshore with horizontal wave-wash film!
          const washStreak = Math.sin(gy * 0.55 + nMed * 3.6);
          if (hShore < 6 && nFine > 0.45) col = oFoamSoft;
          else if (washStreak > 0.38 || hShore < 9) col = sWetReflect;
          else col = sWetDark;
        } else if (hShore < 44 + (nBroad - 0.5) * 18 + (nFine - 0.5) * 7) {
          // Feathered damp beach capillary zone (smooth multi-step fade, zero cliff edge!)
          const dampT = (hShore - 18) / 28 + (nFine - 0.5) * 0.25;
          if (dampT < 0.34) col = sDampDeep;
          else if (dampT < 0.68) col = sDamp;
          else col = sDryDark;
        } else if (vegDist < 0) {
          // TACTILE CALM GOLDEN BEACH EXPANSE (broad wind-sculpted dune swells — zero zebra stripes!)
          const dune = nBroad * 0.72 + nMed * 0.28;
          const gentleCurve = Math.sin(gy * 0.075 - x * 0.016 + nBroad * 4.4);
          if (hShore < 54 + (nFine - 0.5) * 9) {
            col = nFine > 0.52 ? sDryMid : sDryDark;
          } else if (dune > 0.65 && gentleCurve > 0.48) {
            col = sDryCream;
          } else if (dune > 0.48 || (dune > 0.36 && gentleCurve > 0.58)) {
            col = sDryHi;
          } else if (dune > 0.27) {
            col = sDryWarm;
          } else {
            col = sDryMid;
          }
        } else {
          // ZONE E COASTAL VEGETATION BELT -> ZONE F INLAND GATEWAY (100% ZERO-SEAM ORGANIC ECOTONE!)
          const trailCenter = getGatewayTrailCenterX(gy);
          const trailDist = Math.abs(x - trailCenter) + (nMed - 0.5) * 16 + (nFine - 0.5) * 6;
          const trailWidth = gy < 1560 ? 29 : 36 + Math.min(18, Math.max(0, (gy - 1780) * 0.14));

          // Smooth noise-perturbed transition factors so ZERO horizontal cutoff lines ever appear!
          const organicWarp = (nBroad - 0.5) * 0.46 + (nMed - 0.5) * 0.24 + (nFine - 0.5) * 0.10;

          if (trailDist < trailWidth) {
            const forestFactor = (1880 - gy) / 420 + organicWarp;
            if (forestFactor > 0.72) {
              col = trailDist < trailWidth * 0.54 ? (nMed > 0.50 ? humus2 : humus1) : humus0;
            } else if (forestFactor > 0.44) {
              col =
                trailDist < trailWidth * 0.56
                  ? nFine > 0.48
                    ? humus2
                    : sDamp
                  : humus1;
            } else if (forestFactor > 0.18) {
              col =
                trailDist < trailWidth * 0.58
                  ? nMed > 0.52
                    ? sDryMid
                    : sDryDark
                  : sDamp;
            } else {
              col = trailDist < trailWidth * 0.58 ? (nMed > 0.52 ? sDryHi : sDryWarm) : sDryMid;
            }
          } else if (vegDist < 48 + (nBroad - 0.5) * 26) {
            if (vegDist < 18 + (nFine - 0.5) * 12) {
              col = nFine > 0.54 ? sage1 : sDryMid;
            } else {
              col = nMed > 0.58 ? g2 : nMed > 0.34 ? sage0 : g1;
            }
          } else {
            // Smoothly noise-perturbed emerald-to-sage ecotone gradient (ZERO horizontal band!)
            const northT = (1920 - gy) / 460 + organicWarp;
            const canopyDapple = vnoise(x, gy, 46, 223);
            if (northT > 0.62) {
              if (canopyDapple > 0.68) col = fMid1;
              else if (canopyDapple > 0.42) col = fMid0;
              else if (canopyDapple > 0.22) col = fShade;
              else col = fDeep;
            } else if (northT > 0.28) {
              if (canopyDapple > 0.66) col = g3;
              else if (canopyDapple > 0.42) col = fMid0;
              else if (canopyDapple > 0.20) col = g1;
              else col = fShade;
            } else {
              if (canopyDapple > 0.64) col = g3;
              else if (canopyDapple > 0.38) col = g2;
              else col = g1;
            }
          }
        }
      }

      const o = (ly * W + x) * 4;
      rgba[o] = col.r;
      rgba[o + 1] = col.g;
      rgba[o + 2] = col.b;
      rgba[o + 3] = 255;
    }
  }

  // =========================================================================
  // PASS 1B: ARTISANAL ROCK-RIMMED TIDEPOOL STONES & ORGANIC OCEAN WAVE CRESTS
  // =========================================================================
  for (let pi = 0; pi < V90_TIDEPOOLS.length; pi++) {
    const tp = V90_TIDEPOOLS[pi];
    const count = 16 + (pi === 0 ? 6 : 0);
    for (let k = 0; k < count; k++) {
      const ang = (k / count) * Math.PI * 2 + hash2(pi, k, 441) * 0.28;
      // Leave tidal channel south gap open on tp_east_outer!
      if (tp.id === 'tp_east_outer' && ang > 1.15 && ang < 2.0) continue;
      const wobble = 1 + 0.16 * Math.sin(ang * 3 + pi * 1.9 + 0.4) + 0.11 * Math.cos(ang * 5 - pi * 2.3);
      const sx = Math.round(tp.x + Math.cos(ang) * tp.rx * wobble * 1.01);
      const sy = Math.round(tp.y + Math.sin(ang) * tp.ry * wobble * 1.01) - V90_SHORE_ORIGIN_Y;
      const rx = 3 + Math.floor(hash2(pi, k, 443) * 5);
      const ry = 2 + Math.floor(hash2(pi, k, 449) * 3);
      drawFlatStone(rgba, W, H, sx, sy, rx, ry, rockDark, rockSlate, rockLit, pi * 31 + k, k % 3 === 0 ? sage1 : undefined);
    }
    // Mottled submerged pebbles inside tidepool bed (subtle translucent underwater depth!)
    for (let s = 0; s < 14; s++) {
      const px2 = tp.x + (hash2(pi, s, 457) - 0.5) * tp.rx * 1.25;
      const py2 = tp.y + (hash2(pi, s, 461) - 0.5) * tp.ry * 1.15 - V90_SHORE_ORIGIN_Y;
      blendRgb(rgba, W, H, px2, py2, oTurq, 0.45);
      blendRgb(rgba, W, H, px2 + 1, py2, oCobalt, 0.40);
      blendRgb(rgba, W, H, px2, py2 - 1, oSandJade, 0.35);
    }
  }
  // Flanking wet basalt stones framing the tp_east_outer rocky tidal surge channel cleanly!
  for (const [cx, gy2, rx, ry] of [
    [1895, 2274, 5, 3], [1931, 2276, 5, 3], [1897, 2292, 4, 2], [1930, 2294, 4, 2],
  ]) {
    drawFlatStone(rgba, W, H, cx, gy2 - V90_SHORE_ORIGIN_Y, rx, ry, rockDark, rockSlate, rockLit, cx, sage1);
  }

  // Organic coast-wide sunlit horizontal pixel-art wave crests (NO concentrated vertical dash column!)
  for (let ly = 0; ly < H; ly += 6) {
    const gy = V90_SHORE_ORIGIN_Y + ly;
    const rowStagger = Math.imul(ly, 53) % 42;
    for (let x = 14 + rowStagger; x < W - 28; x += 42) {
      const depth = gy - shoreYs[Math.min(W - 1, x)];
      if (depth < 24) continue;
      const h = hash2(x, gy, 404);
      const jx = x + Math.round((hash2(x, gy, 407) - 0.5) * 32);
      const jy = ly + Math.round((hash2(x, gy, 405) - 0.5) * 5);
      // Broad soft morning sun-glint zone (wide 440px spread, gentle probability boost)
      const sunCol = Math.exp(-Math.pow((jx - 880) / 440, 2));

      if (h < 0.24 || (sunCol > 0.45 && h < 0.34)) {
        const len = 7 + Math.floor(hash2(x, gy, 406) * (depth > 150 ? 11 : 9));
        let crestCol: RGB;
        if (sunCol > 0.55 && h < 0.16) {
          crestCol = depth > 170 ? oFoamSoft : oFoamHi;
        } else if (depth > 225) {
          crestCol = oSapph;
        } else if (depth > 130) {
          crestCol = oTurq;
        } else if (depth > 62) {
          crestCol = oJade;
        } else {
          crestCol = oShallow;
        }
        for (let dx = 0; dx < len; dx++) {
          const lift = dx > 1 && dx < len - 2 ? 0 : 1;
          setRgb(rgba, W, H, jx + dx, jy + lift, crestCol);
        }
        if (depth > 95 && len >= 9) {
          const troughCol = depth > 210 ? oAbyss : oDeep;
          for (let dx = 2; dx < len - 2; dx++) {
            setRgb(rgba, W, H, jx + dx, jy + 2, troughCol);
          }
        }
      }
    }
  }

  // =========================================================================
  // PASS 1C: ORGANIC HIGH-TIDE WRACK LINE (Tangled Kelp, Shells & Wet Pebbles!)
  // =========================================================================
  for (let x = 40; x < W - 40; x += 11) {
    const sy = shoreYs[x];
    const h = hash2(x, sy, 521);
    const wrackY = sy - 44 + Math.round(Math.sin(x * 0.032) * 5 + (h - 0.5) * 12) - V90_SHORE_ORIGIN_Y;
    if (wrackY < 10 || wrackY >= H - 10) continue;
    // Skip right across tidepool basins
    let skip = false;
    for (const tp of V90_TIDEPOOLS) {
      if (Math.hypot((x - tp.x) / (tp.rx + 18), (sy - 44 - tp.y) / (tp.ry + 18)) < 1.0) skip = true;
    }
    if (skip) continue;

    if (h < 0.28) {
      // Tangled dark sea-kelp ribbon along high-tide line
      const len = 5 + Math.floor(hash2(x, 1, 523) * 9);
      for (let k = 0; k < len; k++) {
        const ky = wrackY + Math.round(Math.sin(k * 0.7 + x) * 1.3);
        setRgb(rgba, W, H, x + k, ky, k % 3 === 0 ? sage0 : charBrown);
        setRgb(rgba, W, H, x + k, ky + 1, sDampDeep);
      }
    } else if (h < 0.44) {
      // Tiny bleached seashell & sea-worn pebble pair
      setRgb(rgba, W, H, x, wrackY, oFoamHi);
      setRgb(rgba, W, H, x + 1, wrackY, sDryCream);
      setRgb(rgba, W, H, x, wrackY + 1, sDamp);
    } else if (h < 0.58) {
      drawFlatStone(rgba, W, H, x, wrackY, 2, 1, rockDark, rockMid, rockHi);
    }
  }

  // =========================================================================
  // PASS 2: ZERO-SEAM ORGANIC V8.0 LIVING FOREST ECOTONE BLEND (y=1344..1536)
  // Smooth organic feathering directly onto polished V8.0 emerald floor!
  // =========================================================================
  for (let ly = 0; ly < 192; ly++) {
    const gy = V90_SHORE_ORIGIN_Y + ly;
    for (let x = 0; x < W; x++) {
      const nContour = vnoise(x, gy, 42, 199) * 0.65 + vnoise(x, gy, 14, 211) * 0.35;
      const t = (ly - 36) / 140; // 0 at top -> 1 at bottom of overlap band
      const fo = (gy * v80Floor.w + x) * 4;
      const so = (ly * W + x) * 4;
      if (t <= 0.0) {
        rgba[so] = v80Floor.rgba[fo];
        rgba[so + 1] = v80Floor.rgba[fo + 1];
        rgba[so + 2] = v80Floor.rgba[fo + 2];
      } else if (t < 1.0) {
        // Organic botanical cluster edge + subtle cross-tint so ZERO horizontal band ever shows!
        const blendAmt = Math.max(0, Math.min(1, (nContour - t) * 2.4 + 0.5));
        if (blendAmt > 0.62) {
          rgba[so] = v80Floor.rgba[fo];
          rgba[so + 1] = v80Floor.rgba[fo + 1];
          rgba[so + 2] = v80Floor.rgba[fo + 2];
        } else if (blendAmt > 0.32) {
          const a = (blendAmt - 0.32) / 0.30;
          rgba[so] = Math.round(rgba[so] * (1 - a) + v80Floor.rgba[fo] * a);
          rgba[so + 1] = Math.round(rgba[so + 1] * (1 - a) + v80Floor.rgba[fo + 1] * a);
          rgba[so + 2] = Math.round(rgba[so + 2] * (1 - a) + v80Floor.rgba[fo + 2] * a);
        }
      }
    }
  }

  // =========================================================================
  // PASS 3: SCULPTED CRASH IMPACT FURROW, TELEMETRY CABLES & DEBRIS FIELD!
  // =========================================================================
  {
    const xStart = 972;
    const yStart = 2324;
    const xEnd = 1330;
    const yEnd = 2182;
    const vx = xEnd - xStart;
    const vy = yEnd - yStart;
    const lenSq = vx * vx + vy * vy;
    const len = Math.sqrt(lenSq);
    const nx = -vy / len;
    const ny = vx / len;

    for (let ly = 720; ly < 1070; ly++) {
      const gy = V90_SHORE_ORIGIN_Y + ly;
      for (let x = 910; x < 1480; x++) {
        if (gy >= shoreYs[x] - 24) continue;
        const dx = x - xStart;
        const dy = gy - yStart;
        const proj = (dx * vx + dy * vy) / lenSq;
        if (proj < -0.02 || proj > 1.16) continue;

        const entryTaper = proj < 0.16 ? Math.sin((Math.max(0, proj + 0.02) / 0.18) * (Math.PI * 0.5)) : 1.0;
        const exitTaper = proj > 0.84 ? Math.cos((Math.min(0.32, proj - 0.84) / 0.32) * (Math.PI * 0.5)) : 1.0;
        const capScale = Math.max(0.01, entryTaper * exitTaper);

        const perpRaw = dx * nx + dy * ny - Math.sin(Math.max(0, Math.min(1, proj)) * Math.PI) * 9;
        const edgeJitter = (vnoise(x, gy, 16, 601) - 0.5) * 10;
        const halfW = (15 + Math.max(0, Math.min(1, proj)) * 35) * capScale;
        if (halfW < 2.5) continue;
        const u = Math.abs(perpRaw + edgeJitter) / halfW;
        if (u > 1.36) continue;

        const groove = Math.cos((perpRaw / Math.max(12, halfW)) * Math.PI * 2.5);
        const scorchPatch = vnoise(x * 0.6, gy * 1.1, 15, 619);

        if (u < 0.52) {
          let c: RGB;
          if (proj > 0.34 && proj < 0.94 && groove > 0.35 && scorchPatch > 0.55) c = charDark;
          else if (proj > 0.28 && proj < 0.96 && groove > 0.18 && scorchPatch > 0.38) c = charPlum;
          else if (groove > 0.02 && scorchPatch > 0.32) c = charBrown;
          else if (groove > -0.35) c = charSoil;
          else c = sDampDeep;
          setRgb(rgba, W, H, x, ly, c);
        } else if (u < 0.88) {
          const c = perpRaw < 0 ? sDampDeep : sDamp;
          setRgb(rgba, W, H, x, ly, c);
        } else if (u < 1.28) {
          // Piled sunlit sand berm pushed out along both flanks of the skid trench!
          const ridge = perpRaw > 0 ? sDryCream : sDryHi;
          const base = perpRaw > 0 ? sDryHi : sDryMid;
          setRgb(rgba, W, H, x, ly, u < 1.08 ? ridge : base);
        }
      }
    }

    // Continuous grounded insulated EVA telemetry cables partially buried under sunlit sand drifts!
    const drawCableArc = (ax: number, ay: number, bx: number, by: number, sag: number, col: RGB): void => {
      const dist = Math.hypot(bx - ax, by - ay);
      const steps = Math.max(40, Math.ceil(dist * 2.4));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        // Let sand naturally drift over short middle segments so cable feels truly half-buried!
        if (t > 0.34 && t < 0.44) continue;
        if (t > 0.68 && t < 0.75) continue;
        const cx = ax + (bx - ax) * t;
        const cy = ay + (by - ay) * t + Math.sin(t * Math.PI) * sag - V90_SHORE_ORIGIN_Y;
        setRgb(rgba, W, H, cx, cy + 1, sDampDeep);
        setRgb(rgba, W, H, cx, cy, col);
        if (i % 10 < 3) setRgb(rgba, W, H, cx, cy - 1, evaOrange);
      }
    };
    // Cable from Meridian bow toward Field Relay (1098, 2144)
    drawCableArc(1206, 2178, 1114, 2146, 14, hullRust);
    // Snapped tether from Meridian cowling toward Rescue Beacon (946, 2258)
    drawCableArc(1038, 2240, 958, 2258, 10, charPlum);
    // Spilled conduit from breached aft bay toward Specimen Pod (1466, 2236)
    drawCableArc(1408, 2218, 1454, 2236, 8, hullRust);

    // Ceramic heat-tile splinters, rivets & scorched hull debris scattered along skid corridor
    for (let i = 0; i < 56; i++) {
      const t = 0.06 + hash2(i, 1, 709) * 1.02;
      const side = (hash2(i, 2, 709) - 0.5) * 165;
      const rx = Math.round(xStart + vx * t + nx * side);
      const ry = Math.round(yStart + vy * t + ny * side);
      if (rx < 40 || rx >= W - 40 || ry >= shoreYs[rx] - 24) continue;
      const ly = ry - V90_SHORE_ORIGIN_Y;
      const topCol = i % 5 === 0 ? evaOrange : i % 3 === 0 ? hullRust : i % 2 === 0 ? rockHi : charSoil;
      setRgb(rgba, W, H, rx, ly, topCol);
      setRgb(rgba, W, H, rx + 1, ly, topCol);
      setRgb(rgba, W, H, rx + 2, ly, charPlum);
      setRgb(rgba, W, H, rx, ly + 1, charDark);
      setRgb(rgba, W, H, rx + 1, ly + 1, charDark);
    }
  }

  // =========================================================================
  // PASS 4: ~68,000 WOVEN ARTISANAL BOTANICAL TURF CLUSTERS, STEPPING STONES,
  // FALLEN REDWOOD LEAVES, WILDFLOWERS & TACTILE BEACH PEBBLES/SHELLS!
  // =========================================================================
  // Hand-placed weathered mossy stepping flagstones nestled organically into trail soil/sand!
  for (let i = 0; i < 14; i++) {
    const gy = 1496 + i * 27 + Math.round((hash2(i, 1, 761) - 0.5) * 10);
    const gx = Math.round(getGatewayTrailCenterX(gy) + (hash2(i, 2, 761) - 0.5) * 18);
    const ly = gy - V90_SHORE_ORIGIN_Y;
    const rx = 5 + Math.floor(hash2(i, 3, 761) * 5);
    const ry = 3 + Math.floor(hash2(i, 4, 761) * 2);
    const isSandy = gy > 1720;
    drawFlatStone(
      rgba,
      W,
      H,
      gx,
      ly,
      rx,
      ry,
      isSandy ? sDampDeep : humus0,
      isSandy ? charSoil : rockMid,
      isSandy ? sDryDark : rockLit,
      i * 19 + 5,
      gy < 1720 ? fMid1 : undefined
    );
  }

  let botanicalStamps = 0;
  for (let i = 0; i < 68000; i++) {
    const x = Math.floor(hash2(i, 1, 821) * (W - 44)) + 22;
    const ly = Math.floor(hash2(i, 2, 821) * (H - 180)) + 16;
    const gy = V90_SHORE_ORIGIN_Y + ly;
    const sy = shoreYs[x];
    const vy = vegYs[x];
    if (gy > sy - 18) continue;

    // Keep top V8.0 forest floor blend clean where V8.0 already painted its lush carpet
    if (ly < 136 && vnoise(x, gy, 42, 199) > (ly - 36) / 140) continue;

    if (gy < vy + 22) {
      const trailCenter = getGatewayTrailCenterX(gy);
      const trailWidth = gy < 1560 ? 27 : 34;
      const distTrail = Math.abs(x - trailCenter);
      if (distTrail < trailWidth) {
        const r = hash2(i, 3, 821);
        if (r > 0.985) {
          drawFlatStone(rgba, W, H, x, ly, 2, 1, sDampDeep, rockMid, rockHi);
          botanicalStamps++;
        } else if (gy < 1720 && r < 0.018) {
          setRgb(rgba, W, H, x, ly, r < 0.009 ? leafAmber : leafRust);
          setRgb(rgba, W, H, x + 1, ly, leafGold);
          botanicalStamps++;
        }
        continue;
      }

      const coastalEdge = gy > vy - 38;
      if (coastalEdge && hash2(i, 4, 821) > 0.44) continue;

      const organicWarp = (vnoise(x, gy, 76, 11) - 0.5) * 0.46 + (vnoise(x, gy, 28, 29) - 0.5) * 0.24;
      const northT = (1920 - gy) / 460 + organicWarp;
      const variant = Math.floor(hash2(i, 5, 821) * 4);
      const sunlitPocket = vnoise(x, gy, 52, 887) > 0.64;

      if (northT > 0.48 && !coastalEdge) {
        // Velvety V8.0-harmonized layered emerald turf cushions (tight neighboring-value harmony!)
        const cDeep = sunlitPocket ? fShade : fDeep;
        const cMid = sunlitPocket ? fMid0 : fShade;
        const cLit = sunlitPocket ? fMid1 : fMid0;
        const cHi = sunlitPocket ? fLit1 : fLit0;
        stampArtisanalTurfCluster(rgba, W, H, x, ly, variant, cDeep, cMid, cLit, cHi);
      } else if (coastalEdge) {
        const cDeep = g0;
        const cMid = variant === 1 ? sage0 : g1;
        const cLit = variant === 1 ? sage1 : g2;
        const cHi = variant === 0 ? g3 : variant === 1 ? sage2 : sDryWarm;
        stampArtisanalTurfCluster(rgba, W, H, x, ly, variant, cDeep, cMid, cLit, cHi);
      } else {
        const cDeep = sunlitPocket ? g1 : fShade;
        const cMid = sunlitPocket ? g2 : g1;
        const cLit = sunlitPocket ? g3 : g2;
        const cHi = sunlitPocket ? g4 : g3;
        stampArtisanalTurfCluster(rgba, W, H, x, ly, variant, cDeep, cMid, cLit, cHi);
      }
      botanicalStamps++;

      // Fallen autumn redwood leaves drifting southward from the canopy edge (y=1360..1760)
      const fl = hash2(i, 7, 821);
      if (gy < 1760 && fl < 0.016) {
        const lc = fl < 0.008 ? leafAmber : leafRust;
        setRgb(rgba, W, H, x, ly, lc);
        setRgb(rgba, W, H, x + 1, ly, leafGold);
        setRgb(rgba, W, H, x, ly + 1, humus0);
      } else if (fl > 0.991) {
        // Bioluminescent cyan blossoms & warm coastal buttercup / lavender wildflowers!
        const kind = hash2(i, 11, 821);
        if (kind < 0.34) {
          setRgb(rgba, W, H, x, ly - 1, tealGlow);
          setRgb(rgba, W, H, x + 1, ly - 1, oFoamHi);
        } else if (kind < 0.68) {
          setRgb(rgba, W, H, x, ly - 1, amberGlow);
          setRgb(rgba, W, H, x - 1, ly - 1, sDryCream);
        } else {
          setRgb(rgba, W, H, x, ly - 1, flLav);
          setRgb(rgba, W, H, x + 1, ly - 1, oFoamHi);
        }
      }
    } else if (gy < sy - 50 && hash2(i, 8, 821) < 0.016) {
      // Tactile dry beach pebbles, crushed shell bits & wind-blown dune tufts!
      const kind = hash2(i, 9, 821);
      if (kind > 0.56) {
        drawFlatStone(rgba, W, H, x, ly, 2, 1, sDamp, rockMid, rockHi);
      } else if (kind > 0.22) {
        setRgb(rgba, W, H, x, ly, oFoamHi);
        setRgb(rgba, W, H, x + 1, ly, sDryCream);
        setRgb(rgba, W, H, x, ly + 1, sDryDark);
      } else {
        // Subtle 5px sunlit wind-sand micro-facet
        for (let dx = -2; dx <= 2; dx++) {
          setRgb(rgba, W, H, x + dx, ly, Math.abs(dx) < 2 ? sDryCream : sDryHi);
          setRgb(rgba, W, H, x + dx, ly + 1, sDryMid);
        }
      }
      botanicalStamps++;
    }
  }

  // =========================================================================
  // PASS 5: SMART BIOME-AWARE OBJECT-TO-GROUND INTEGRATION & ~950 LIVING TUFTS!
  // Zero floating sand rings on grass! Zero geometric sea-stack O-rings!
  // =========================================================================
  const tufts: V90LivingCoastalTuft[] = [];
  let embeddedProps = 0;

  for (const p of props) {
    if (p.embedKind === 'none') continue;
    const lx = Math.round(p.x);
    const ly = Math.round(p.y - V90_SHORE_ORIGIN_Y);
    const isMeadow = p.y < vegYs[Math.max(0, Math.min(W - 1, lx))] + 16;
    embeddedProps++;

    if (p.embedKind === 'wreck_trench') {
      // Deep grounded diagonal hull contact shadow + churned sunlit bow sand berm!
      for (let dy = -38; dy <= 32; dy++) {
        for (let dx = -172; dx <= 162; dx++) {
          const skewY = dy + dx * 0.14;
          const d = Math.hypot(dx / 158, skewY / 30);
          if (d > 1.22) continue;
          const n = vnoise(lx + dx, ly + dy, 14, 921);
          if (d < 0.88) {
            blendRgb(rgba, W, H, lx + dx, ly + dy, charPlum, (1 - d / 0.88) * 0.44);
          } else if (dy > -4 && n > 0.40) {
            setRgb(rgba, W, H, lx + dx, ly + dy, dy > 7 ? sDryCream : sDryHi);
          }
        }
      }
      const hullTufts = [
        [-144, 16, 0], [-108, 22, 1], [-64, 18, 2], [-20, 18, 0], [32, 24, 1],
        [154, -22, 0], [-118, -58, 2], [94, -68, 2], [-158, -4, 1],
      ];
      for (const [dx, dy, row] of hullTufts) {
        tufts.push({ x: p.x + dx, y: p.y + dy, row, phase: hash2(p.x + dx, p.y + dy, 4) * 6.28, sens: 1.05 });
      }
    } else if (p.embedKind === 'cliff_base') {
      // Grounded cliff cast shadow + layered basalt scree slabs + moss/fern collar on meadow cliffs!
      for (let dy = -26; dy <= 22; dy++) {
        for (let dx = -76; dx <= 80; dx++) {
          const d = Math.hypot(dx / 74, dy / 22);
          if (d < 0.94) {
            blendRgb(rgba, W, H, lx + dx, ly + dy, isMeadow ? fDeep : rockDark, (1 - d / 0.94) * 0.44);
          }
        }
      }
      const slabs: Array<[number, number, number, number]> = [
        [-64, 10, 6, 3], [-42, 16, 5, 2], [-14, 18, 7, 3], [22, 17, 6, 3], [54, 12, 5, 2], [68, 4, 4, 2],
      ];
      for (const [sx, sy2, rx, ry] of slabs) {
        drawFlatStone(
          rgba, W, H, lx + sx, ly + sy2, rx, ry, rockDark, rockMid, rockHi, sx + sy2,
          isMeadow ? fLit0 : undefined
        );
      }
      for (const [dx, dy, row] of [[-58, 12, isMeadow ? 7 : 6], [-24, 16, 4], [28, 14, isMeadow ? 7 : 6], [62, 8, 1]]) {
        if (p.y + dy < shoreYs[Math.max(0, Math.min(W - 1, Math.round(p.x + dx)))] - 12) {
          tufts.push({ x: p.x + dx, y: p.y + dy, row, phase: hash2(p.x + dx, p.y + dy, 5) * 6.28, sens: 0.9 });
        }
      }
    } else if (p.embedKind === 'wet_rock') {
      if (p.layer === 'ocean_prop') {
        // ARTISANAL ASYMMETRIC BREAKING-WAVE FOAM PLUME (replaces flat geometric white O-rings!)
        const rx = 48;
        const ry = 16;
        for (let dy = -ry - 6; dy <= ry + 10; dy++) {
          for (let dx = -rx - 8; dx <= rx + 8; dx++) {
            const n = (vnoise(lx + dx, ly + dy, 10, 944) - 0.5) * 0.34;
            const d = Math.hypot(dx / rx, (dy - 2) / ry) + n;
            if (d < 0.78) {
              // Deep wet basalt reflection shadow directly under offshore sea stack
              blendRgb(rgba, W, H, lx + dx, ly + dy, oAbyss, 0.44);
            } else if (dy > -3 && d >= 0.78 && d <= 1.18) {
              // Frothy curling breaking-wave crest focused on the seaward (south) face!
              const froth = vnoise(lx + dx, ly + dy, 6, 953);
              if (d < 0.98 && froth > 0.36) setRgb(rgba, W, H, lx + dx, ly + dy, oFoamHi);
              else if (froth > 0.28) setRgb(rgba, W, H, lx + dx, ly + dy, oFoamSoft);
              else setRgb(rgba, W, H, lx + dx, ly + dy, oSandJade);
            } else if (dy <= -3 && d >= 0.80 && d <= 1.24) {
              // Soft feathered turquoise leeward eddy wake trailing north!
              if (vnoise(lx + dx, ly + dy, 8, 967) > 0.48) {
                blendRgb(rgba, W, H, lx + dx, ly + dy, oShallow, 0.52);
              }
            }
          }
        }
      } else {
        // Beach wet boulder: smooth damp reflection halo + clustered shoreline pebbles
        for (let dy = -14; dy <= 16; dy++) {
          for (let dx = -42; dx <= 42; dx++) {
            const d = Math.hypot(dx / 38, dy / 13);
            if (d < 0.92) blendRgb(rgba, W, H, lx + dx, ly + dy, sWetDark, (1 - d / 0.92) * 0.42);
          }
        }
        drawFlatStone(rgba, W, H, lx - 30, ly + 8, 4, 2, rockDark, rockMid, rockHi);
        drawFlatStone(rgba, W, H, lx + 28, ly + 7, 3, 2, rockDark, rockMid, rockHi);
      }
    } else if (p.embedKind === 'sand_berm') {
      if (isMeadow) {
        // Safety fallback: if a prop sits on grass/meadow, embed in mossy humus (NEVER paint cream sand on grass!)
        for (let dy = -14; dy <= 14; dy++) {
          for (let dx = -42; dx <= 42; dx++) {
            const d = Math.hypot(dx / 38, dy / 12);
            if (d < 0.92) blendRgb(rgba, W, H, lx + dx, ly + dy, humus0, (1 - d / 0.92) * 0.46);
          }
        }
        tufts.push({ x: p.x - 24, y: p.y + 8, row: 7, phase: hash2(p.x, p.y, 7) * 6.28, sens: 1.0 });
        tufts.push({ x: p.x + 26, y: p.y + 6, row: 2, phase: hash2(p.x, p.y, 8) * 6.28, sens: 1.0 });
      } else {
        // Grounded beach sand depression + wind-piled sunlit sand berm & pebbles!
        for (let dy = -13; dy <= 15; dy++) {
          for (let dx = -44; dx <= 46; dx++) {
            const d = Math.hypot(dx / 41, dy / 13);
            if (d < 0.84) {
              blendRgb(rgba, W, H, lx + dx, ly + dy, sDampDeep, (1 - d / 0.84) * 0.34);
            } else if (d < 1.08 && dy > 2) {
              const n = vnoise(lx + dx, ly + dy, 9, 977);
              if (n > 0.32) setRgb(rgba, W, H, lx + dx, ly + dy, dy > 6 ? sDryCream : sDryHi);
            }
          }
        }
        drawFlatStone(rgba, W, H, lx - 28, ly + 10, 3, 1, sDampDeep, rockMid, rockHi);
        tufts.push({ x: p.x - 24, y: p.y + 8, row: 0, phase: hash2(p.x, p.y, 7) * 6.28, sens: 1.0 });
        tufts.push({ x: p.x + 26, y: p.y + 6, row: 1, phase: hash2(p.x, p.y, 8) * 6.28, sens: 1.0 });
      }
    } else if (p.embedKind === 'dune_plant') {
      const isTree = p.spriteKey.includes('tree');
      const isLog = p.spriteKey.includes('driftwood');
      const rx = isTree ? 52 : isLog ? 48 : 30;
      const ry = isTree ? 20 : isLog ? 14 : 11;
      // Rich canopy shadow & dark mossy humus cradle!
      for (let dy = -ry; dy <= ry; dy++) {
        for (let dx = -rx; dx <= rx; dx++) {
          const d = Math.hypot(dx / rx, dy / ry);
          if (d < 0.92) {
            blendRgb(rgba, W, H, lx + dx, ly + dy, isMeadow ? fDeep : g0, (1 - d / 0.92) * (isTree ? 0.52 : 0.40));
          }
        }
      }
      // Radiating surface feeder roots for coastal edge redwood & rock trees!
      if (isTree) {
        const rootDirs = [[-44, 8], [-28, 15], [26, 14], [46, 7], [-34, -8], [36, -6]];
        for (const [rdx, rdy] of rootDirs) {
          drawLineRgb(rgba, W, H, lx, ly, lx + rdx, ly + rdy, humus0);
          drawLineRgb(rgba, W, H, lx, ly - 1, lx + rdx * 0.85, ly + rdy - 1, humus2);
        }
      }
      // Fallen leaves & mossy stones cradling meadow driftwood & boulders
      if (isLog && isMeadow) {
        drawFlatStone(rgba, W, H, lx - 38, ly + 8, 4, 2, rockDark, rockMid, rockHi, 12, fLit0);
        drawFlatStone(rgba, W, H, lx + 34, ly + 9, 3, 2, rockDark, rockMid, rockHi, 23, fLit0);
      }
      const isInland = p.y < 1720;
      for (const [dx, dy] of [[-24, 7], [2, 10], [26, 6]]) {
        tufts.push({
          x: p.x + dx,
          y: p.y + dy,
          row: isInland ? 7 : 2,
          phase: hash2(p.x + dx, p.y + dy, 9) * 6.28,
          sens: 1.05,
        });
      }
    }
  }

  // Organic multi-tuft meadow, ecotone & coastal dune drifts across Zones A–F!
  for (let gy = 1384; gy <= 2324; gy += 42) {
    for (let gx = 300; gx <= 2000; gx += 52) {
      const sy = shoreYs[gx];
      const vy = vegYs[gx];
      if (gy > sy - 54) continue;
      if (gx > 1030 && gx < 1460 && gy > 2115 && gy < 2305) continue;
      const trailCenter = getGatewayTrailCenterX(gy);
      if (Math.abs(gx - trailCenter) < 34) continue;

      const r = hash2(gx, gy, 1021);
      const isBeach = gy > vy + 24;
      if (isBeach && r > 0.25) continue;
      if (!isBeach && r > 0.66) continue;

      const driftCount = isBeach ? 1 + (r < 0.11 ? 1 : 0) : 2 + (r < 0.28 ? 1 : 0);
      for (let d = 0; d < driftCount; d++) {
        const tx = gx + (hash2(gx + d, gy, 1022) - 0.5) * 34;
        const ty = gy + (hash2(gx, gy + d, 1023) - 0.5) * 20;
        let row = 0;
        if (gy < 1580) {
          row = hash2(gx, gy, d + 20) > 0.26 ? 7 : 3;
        } else if (gy < vy) {
          const pick = hash2(gx, gy, d + 30);
          row = pick < 0.34 ? 2 : pick < 0.58 ? 1 : pick < 0.76 ? 0 : pick < 0.90 ? 3 : 4;
        } else {
          row = hash2(gx, gy, d + 40) > 0.42 ? 0 : 1;
        }
        tufts.push({
          x: Math.round(tx),
          y: Math.round(ty),
          row,
          phase: hash2(gx + d, gy, 1024) * Math.PI * 2,
          sens: row === 4 ? 0.6 : 0.95 + hash2(gx, gy + d, 1025) * 0.35,
        });
      }
    }
  }

  // Swaying Amber Tide-Kelp Ribbon Tufts (Row 5) inside all 5 Organic Tidepool Basins!
  for (const tp of V90_TIDEPOOLS) {
    for (let k = 0; k < 6; k++) {
      const ang = (k / 6) * Math.PI * 2 + 0.3;
      tufts.push({
        x: Math.round(tp.x + Math.cos(ang) * tp.rx * 0.52),
        y: Math.round(tp.y + Math.sin(ang) * tp.ry * 0.48),
        row: 5,
        phase: k * 1.1,
        sens: 1.25,
      });
    }
  }

  return {
    floor: { w: W, h: H, rgba },
    tufts,
    stats: {
      botanicalStamps,
      embeddedProps,
      livingTufts: tufts.length,
    },
  };
}
