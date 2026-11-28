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

/**
 * Handcrafted organic botanical leaf-cluster stamp matching V8.0's lush meadow craft
 * (variable silhouettes, zero grid bands, zero Bayer dither!).
 */
function stampOrganicMeadowSprig(
  rgba: Uint8Array,
  w: number,
  h: number,
  cx: number,
  cy: number,
  variant: number,
  cDark: RGB,
  cMid: RGB,
  cHi: RGB
): void {
  if (variant === 0) {
    // Broad 7x4 scalloped clover-grass patch
    for (let dx = -3; dx <= 3; dx++) setRgb(rgba, w, h, cx + dx, cy + 1, cDark);
    for (let dx = -3; dx <= 3; dx++) setRgb(rgba, w, h, cx + dx, cy, Math.abs(dx) === 3 ? cDark : cMid);
    setRgb(rgba, w, h, cx - 2, cy - 1, cMid);
    setRgb(rgba, w, h, cx - 1, cy - 1, cHi);
    setRgb(rgba, w, h, cx + 1, cy - 1, cHi);
    setRgb(rgba, w, h, cx + 2, cy - 1, cMid);
    setRgb(rgba, w, h, cx, cy - 2, cHi);
  } else if (variant === 1) {
    // Wind-swept 3-blade coastal grass sprig
    setRgb(rgba, w, h, cx - 2, cy + 1, cDark);
    setRgb(rgba, w, h, cx - 1, cy + 1, cDark);
    setRgb(rgba, w, h, cx, cy + 1, cDark);
    setRgb(rgba, w, h, cx + 1, cy + 1, cDark);
    setRgb(rgba, w, h, cx - 2, cy, cMid);
    setRgb(rgba, w, h, cx, cy, cMid);
    setRgb(rgba, w, h, cx + 2, cy, cMid);
    setRgb(rgba, w, h, cx - 1, cy - 1, cHi);
    setRgb(rgba, w, h, cx + 1, cy - 1, cHi);
    setRgb(rgba, w, h, cx + 2, cy - 2, cHi);
  } else {
    // Compact mossy leaf rosette
    setRgb(rgba, w, h, cx - 1, cy + 1, cDark);
    setRgb(rgba, w, h, cx, cy + 1, cDark);
    setRgb(rgba, w, h, cx + 1, cy + 1, cDark);
    setRgb(rgba, w, h, cx - 2, cy, cMid);
    setRgb(rgba, w, h, cx - 1, cy, cHi);
    setRgb(rgba, w, h, cx, cy, cMid);
    setRgb(rgba, w, h, cx + 1, cy, cHi);
    setRgb(rgba, w, h, cx, cy - 1, cHi);
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
  cHi: RGB
): void {
  for (let dy = -ry; dy <= ry; dy++) {
    for (let dx = -rx; dx <= rx; dx++) {
      const d = (dx * dx) / (rx * rx + 0.5) + (dy * dy) / (ry * ry + 0.5);
      if (d > 1.0) continue;
      const c = dy === ry || d > 0.72 ? cDark : dy < 0 && dx <= 0 ? cHi : cMid;
      setRgb(rgba, w, h, cx + dx, cy + dy, c);
    }
  }
}

/**
 * Hand-sculpts the 2304x1536 Broken Shore terrain & 8-zone Vast Alien Ocean
 * strictly within V90_MASTER_PALETTE — zero per-pixel noise, crisp pixel-art
 * horizontal ocean wave glints, calm golden-ochre beach expanses, sculpted crash
 * impact grooves, translucent turquoise tidepools, flat coastal stones & seamless
 * organic V8.0 Living Forest ecotone transition!
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

  // Curated V9.0 Master Palette Swatches
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

  const sWetReflect = hexToRgb('#829aa0');
  const sWetDark = hexToRgb('#62767e');
  const sDampDeep = hexToRgb('#6b533c');
  const sDamp = hexToRgb('#826446');
  const sDryDark = hexToRgb('#9e7c55');
  const sDryMid = hexToRgb('#ba9666');
  const sDryWarm = hexToRgb('#d0af7b');
  const sDryHi = hexToRgb('#e0c592');
  const sDryCream = hexToRgb('#eed9ad');

  const charDark = hexToRgb('#1e0c1c');
  const charPlum = hexToRgb('#2a1b31');
  const charBrown = hexToRgb('#46202a');
  const charSoil = hexToRgb('#534438');
  const hullRust = hexToRgb('#a44522');

  const rockDark = hexToRgb('#242a38');
  const rockMid = hexToRgb('#4d5c6c');
  const rockHi = hexToRgb('#8798a2');

  const g0 = hexToRgb('#162922');
  const g1 = hexToRgb('#234232');
  const g2 = hexToRgb('#335c3e');
  const g3 = hexToRgb('#497b49');
  const g4 = hexToRgb('#679c52');
  const g5 = hexToRgb('#8db95e');
  const sage = hexToRgb('#4c7b72');
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
  // PASS 1: 8-ZONE ALIEN OCEAN, CALM HANDCRAFTED GOLDEN BEACH & TIDEPOOLS
  // =========================================================================
  for (let ly = 0; ly < H; ly++) {
    const gy = V90_SHORE_ORIGIN_Y + ly;
    for (let x = 0; x < W; x++) {
      const sy = shoreYs[x];
      const vy = vegYs[x];
      const depth = gy - sy; // >0 = Ocean, <=0 = Beach/Land
      const nBroad = vnoise(x, gy, 76, 11);
      const nMed = vnoise(x, gy, 30, 29);
      const nFine = vnoise(x, gy, 11, 53);

      let col: RGB;

      if (depth > 0) {
        // Horizontal coastal swell contour (organic undulating water depth bands!)
        const swellUndul = Math.sin(x * 0.015 + gy * 0.012 + nBroad * 3.0) * 10 + (nMed - 0.5) * 14;
        const dEff = depth + swellUndul * Math.min(1, depth / 36);

        // Submerged horizontal sandbars & coastal reef shelves visible through translucent shallows
        const sandbar = vnoise(x * 0.45, gy * 1.6, 26, 77);
        const reefShadow = vnoise(x * 0.55, gy * 1.4, 22, 91);

        if (dEff > 320) {
          col = oAbyss;
        } else if (dEff > 240) {
          col = oDeep;
        } else if (dEff > 165) {
          col = oSapph;
        } else if (dEff > 105) {
          col = oCobalt;
        } else if (dEff > 58) {
          col = reefShadow > 0.72 ? oCobalt : oTurq;
        } else if (dEff > 28) {
          if (reefShadow > 0.74) col = oTurq;
          else if (sandbar > 0.62) col = oJade;
          else col = oBright;
        } else if (dEff > 12) {
          // Translucent turquoise-jade shallows showing submerged sunlit sand shelves
          if (sandbar > 0.54) col = oSandJade;
          else if (nMed > 0.52) col = oShallow;
          else col = oJade;
        } else if (dEff > 4) {
          col = nFine > 0.56 ? oFoamSoft : oSandJade;
        } else {
          // Delicate scalloped 4px shoreline surf lip
          col = nFine > 0.40 ? oFoamHi : oFoamSoft;
        }
      } else {
        // ORGANIC MULTI-ZONE SHORELINE & COASTAL MEADOW
        const hShore = -depth;
        const vegDist = vy - gy;

        // Check if inside one of our 5 iconic Tidepool Basins!
        let inPool = 0;
        for (const tp of V90_TIDEPOOLS) {
          const dx = (x - tp.x) / (tp.rx + (nMed - 0.5) * 18);
          const dy = (gy - tp.y) / (tp.ry + (nMed - 0.5) * 9);
          const d = Math.hypot(dx, dy);
          if (d < 1.18) inPool = Math.max(inPool, 1.18 - d);
        }

        if (inPool > 0.30) {
          if (inPool > 0.68) col = oBright;
          else if (inPool > 0.48) col = nMed > 0.55 ? oShallow : oJade;
          else col = nFine > 0.60 ? oFoamSoft : oSandJade;
        } else if (inPool > 0.0) {
          col = inPool > 0.14 ? sWetDark : sDamp;
        } else if (hShore < 20 + (nMed - 0.5) * 9) {
          // Mirror-wet glistening tidal sand reflecting pale morning sky!
          const skyBand = vnoise(x * 0.4, gy * 1.6, 18, 131);
          col = hShore < 8 || skyBand > 0.54 ? sWetReflect : sWetDark;
        } else if (hShore < 52 + (nBroad - 0.5) * 18) {
          // Capillary damp darker ochre beach band
          col = hShore < 32 + (nMed - 0.5) * 8 ? sDampDeep : nMed > 0.45 ? sDamp : sDryDark;
        } else if (vegDist < 0) {
          // CALM BROAD HANDCRAFTED GOLDEN-OCHRE BEACH EXPANSE (zero zebra stripes!)
          // Gentle broad sunlit dune contours + subtle broken wind-swept highlights
          const dune = nBroad * 0.72 + nMed * 0.28;
          const subtleWave = Math.sin(gy * 0.085 + x * 0.014 + nBroad * 4.2);
          if (dune > 0.64 && subtleWave > 0.52) col = sDryCream;
          else if (dune > 0.48 || subtleWave > 0.42) col = sDryHi;
          else if (dune > 0.30) col = sDryWarm;
          else col = sDryMid;
        } else {
          // Coastal Vegetation Belt (Zone E) -> Inland Gateway (Zone F)
          const trailCenter =
            1142 + Math.sin((gy - 1344) * 0.0065) * 86 + (gy > 1760 ? (gy - 1760) * 0.32 : 0);
          const trailDist = Math.abs(x - trailCenter) + (nMed - 0.5) * 20;
          // Taper coastal sand trail smoothly into mossy-forest clearing around y = 1380..1460!
          const trailWidth = gy < 1460 ? Math.max(0, ((gy - 1378) / 82) * 38) : 40;
          if (trailDist < trailWidth) {
            col = trailDist < trailWidth * 0.56 ? (nMed > 0.52 ? sDryHi : sDryWarm) : sDryMid;
          } else if (vegDist < 42 + (nBroad - 0.5) * 24) {
            // Soft organic coastal dune grass transition
            col = nMed > 0.56 ? g2 : nMed > 0.34 ? sage : sDryMid;
          } else {
            // Rich coastal meadow turf matching V8.0's deep forest emerald tones
            col = nBroad > 0.58 ? g3 : nMed > 0.38 ? g2 : g1;
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
  // PASS 1B: CRISP HORIZONTAL PIXEL-ART OCEAN WAVE CRESTS & SUNLIGHT SHIMMER!
  // Row-staggered organic horizontal sunlit wave-crest strokes (zero columns!)
  // =========================================================================
  for (let ly = 0; ly < H; ly += 5) {
    const gy = V90_SHORE_ORIGIN_Y + ly;
    const rowStagger = (Math.imul(ly, 37) % 34);
    for (let x = 12 + rowStagger; x < W - 28; x += 34) {
      const depth = gy - shoreYs[Math.min(W - 1, x)];
      if (depth < 24) continue;
      const h = hash2(x, gy, 404);
      const jx = x + Math.round((hash2(x, gy, 407) - 0.5) * 28);
      const jy = ly + Math.round((hash2(x, gy, 405) - 0.5) * 4);
      const sunCol = Math.exp(-Math.pow((jx - 840) / 215, 2));

      if (h < 0.28 || (sunCol > 0.26 && h < 0.60)) {
        const len = 7 + Math.floor(hash2(x, gy, 406) * (depth > 150 ? 12 : 9));
        let crestCol: RGB;
        if (sunCol > 0.30 && h < 0.38) {
          crestCol = depth > 180 ? oFoamSoft : oFoamHi;
        } else if (depth > 220) {
          crestCol = oSapph;
        } else if (depth > 130) {
          crestCol = oTurq;
        } else if (depth > 64) {
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
  // PASS 2: SEAMLESS ORGANIC V8.0 LIVING FOREST ECOTONE BLEND (ZERO NOISE!)
  // Uses smooth low-frequency organic contour patches so there is ZERO scatter!
  // =========================================================================
  for (let ly = 0; ly < 192; ly++) {
    const gy = V90_SHORE_ORIGIN_Y + ly;
    for (let x = 0; x < W; x++) {
      const nContour = vnoise(x, gy, 34, 199) * 0.7 + vnoise(x, gy, 13, 211) * 0.3;
      const t = (ly - 22) / 132; // 0 at top -> 1 at bottom
      const useV80 = t < 0.0 || (t < 1.0 && nContour > t);
      if (useV80) {
        const fo = (gy * v80Floor.w + x) * 4;
        const so = (ly * W + x) * 4;
        rgba[so] = v80Floor.rgba[fo];
        rgba[so + 1] = v80Floor.rgba[fo + 1];
        rgba[so + 2] = v80Floor.rgba[fo + 2];
      }
    }
  }

  // =========================================================================
  // PASS 3: SCULPTED HANDCRAFTED CRASH IMPACT FURROW (ZERO PIXEL STATIC!)
  // Smooth continuous longitudinal skid grooves, dark scorch streaks & sunlit berms!
  // =========================================================================
  {
    const xStart = 976;
    const yStart = 2322;
    const xEnd = 1324;
    const yEnd = 2184;
    const vx = xEnd - xStart;
    const vy = yEnd - yStart;
    const lenSq = vx * vx + vy * vy;
    const len = Math.sqrt(lenSq);
    const nx = -vy / len;
    const ny = vx / len;

    for (let ly = 720; ly < 1060; ly++) {
      const gy = V90_SHORE_ORIGIN_Y + ly;
      for (let x = 920; x < 1460; x++) {
        if (gy >= shoreYs[x] - 24) continue;
        const dx = x - xStart;
        const dy = gy - yStart;
        const proj = (dx * vx + dy * vy) / lenSq; // 0 at west impact entry -> 1 at hull resting bed
        if (proj < -0.02 || proj > 1.14) continue;

        // Smooth natural capsule taper at BOTH western entry wedge and eastern resting crater (ZERO flat cutoffs!)
        const entryTaper = proj < 0.16 ? Math.sin((Math.max(0, proj + 0.02) / 0.18) * (Math.PI * 0.5)) : 1.0;
        const exitTaper = proj > 0.84 ? Math.cos((Math.min(0.30, proj - 0.84) / 0.30) * (Math.PI * 0.5)) : 1.0;
        const capScale = Math.max(0.01, entryTaper * exitTaper);

        // Gentle natural skid curve
        const perpRaw = dx * nx + dy * ny - Math.sin(Math.max(0, Math.min(1, proj)) * Math.PI) * 9;
        const edgeJitter = (vnoise(x, gy, 18, 601) - 0.5) * 9;
        const halfW = (14 + Math.max(0, Math.min(1, proj)) * 34) * capScale;
        if (halfW < 2.5) continue;
        const u = Math.abs(perpRaw + edgeJitter) / halfW;
        if (u > 1.32) continue;

        // Sculpted longitudinal drag grooves (twin landing-strut plow channels!)
        const groove = Math.cos((perpRaw / Math.max(12, halfW)) * Math.PI * 2.5);
        const scorchPatch = vnoise(x * 0.6, gy * 1.1, 16, 619);

        if (u < 0.52) {
          let c: RGB;
          if (proj > 0.30 && proj < 0.96 && groove > 0.25 && scorchPatch > 0.42) c = charPlum;
          else if (groove > 0.05 && scorchPatch > 0.34) c = charBrown;
          else if (groove > -0.35) c = charSoil;
          else c = sDampDeep;
          setRgb(rgba, W, H, x, ly, c);
        } else if (u < 0.86) {
          const c = perpRaw < 0 ? sDampDeep : sDamp;
          setRgb(rgba, W, H, x, ly, c);
        } else if (u < 1.24) {
          const ridge = perpRaw > 0 ? sDryCream : sDryHi;
          const base = perpRaw > 0 ? sDryHi : sDryMid;
          setRgb(rgba, W, H, x, ly, u < 1.06 ? ridge : base);
        }
      }
    }

    // Crisp 3x2 / 4x2 ceramic heat-tile debris splinters along the crash impact field (deliberate clusters!)
    for (let i = 0; i < 42; i++) {
      const t = 0.08 + hash2(i, 1, 709) * 0.96;
      const side = (hash2(i, 2, 709) - 0.5) * 140;
      const rx = Math.round(xStart + vx * t + nx * side);
      const ry = Math.round(yStart + vy * t + ny * side);
      if (rx < 40 || rx >= W - 40 || ry >= shoreYs[rx] - 20) continue;
      const ly = ry - V90_SHORE_ORIGIN_Y;
      const topCol = i % 4 === 0 ? hullRust : i % 2 === 0 ? rockMid : charSoil;
      setRgb(rgba, W, H, rx, ly, topCol);
      setRgb(rgba, W, H, rx + 1, ly, topCol);
      setRgb(rgba, W, H, rx + 2, ly, charPlum);
      setRgb(rgba, W, H, rx, ly + 1, charDark);
      setRgb(rgba, W, H, rx + 1, ly + 1, charDark);
    }
  }

  // =========================================================================
  // PASS 4: LUSH MULTI-LAYER COASTAL MEADOW BOTANICAL CARPET & BEACH PEBBLES
  // Matches V8.0's dense handcrafted emerald foliage density seamlessly!
  // =========================================================================
  let botanicalStamps = 0;
  for (let i = 0; i < 48000; i++) {
    const x = Math.floor(hash2(i, 1, 821) * (W - 48)) + 24;
    const ly = Math.floor(hash2(i, 2, 821) * (H - 220)) + 16;
    const gy = V90_SHORE_ORIGIN_Y + ly;
    const sy = shoreYs[x];
    const vy = vegYs[x];
    if (gy > sy - 18) continue;

    // Keep Zone F V8.0 top overlap clean where V8.0 already painted its own meadow
    if (ly < 118 && vnoise(x, gy, 34, 199) > (ly - 22) / 132) continue;

    if (gy < vy + 18) {
      const trailCenter =
        1142 + Math.sin((gy - 1344) * 0.0065) * 86 + (gy > 1760 ? (gy - 1760) * 0.32 : 0);
      const trailWidth = gy < 1460 ? Math.max(0, ((gy - 1378) / 82) * 34) : 34;
      if (Math.abs(x - trailCenter) < trailWidth) {
        if (hash2(i, 3, 821) > 0.98) {
          drawFlatStone(rgba, W, H, x, ly, 2, 1, sDampDeep, rockMid, rockHi);
          botanicalStamps++;
        }
        continue;
      }
      const coastalEdge = gy > vy - 36;
      if (coastalEdge && hash2(i, 4, 821) > 0.38) continue;
      const variant = Math.floor(hash2(i, 5, 821) * 3);
      const forestClose = gy < 1660;
      const cDark = forestClose ? g0 : g1;
      const cMid = coastalEdge ? (variant === 1 ? sage : g2) : forestClose ? (hash2(i, 10, 821) > 0.5 ? g1 : g2) : g2;
      const cHi = coastalEdge ? (variant === 0 ? g4 : sDryHi) : hash2(i, 6, 821) > 0.62 ? g4 : g3;
      stampOrganicMeadowSprig(rgba, W, H, x, ly, variant, cDark, cMid, cHi);
      botanicalStamps++;
      const fl = hash2(i, 7, 821);
      if (fl < 0.011) {
        setRgb(rgba, W, H, x, ly - 1, tealGlow);
        setRgb(rgba, W, H, x + 1, ly - 1, oFoamHi);
      } else if (fl > 0.992) {
        setRgb(rgba, W, H, x, ly - 1, amberGlow);
        setRgb(rgba, W, H, x - 1, ly - 1, sDryCream);
      }
    } else if (gy < sy - 46 && hash2(i, 8, 821) < 0.011) {
      if (hash2(i, 9, 821) > 0.5) {
        drawFlatStone(rgba, W, H, x, ly, 2, 1, sDamp, rockMid, rockHi);
      } else {
        setRgb(rgba, W, H, x, ly, oFoamHi);
        setRgb(rgba, W, H, x + 1, ly, sDryCream);
        setRgb(rgba, W, H, x, ly + 1, sDryDark);
      }
      botanicalStamps++;
    }
  }

  // =========================================================================
  // PASS 5: HANDCRAFTED OBJECT-TO-GROUND INTEGRATION & 780+ LIVING TUFTS!
  // Zero procedural oval shadows or static speckle rings!
  // =========================================================================
  const tufts: V90LivingCoastalTuft[] = [];
  let embeddedProps = 0;

  for (const p of props) {
    if (p.embedKind === 'none') continue;
    const lx = Math.round(p.x);
    const ly = Math.round(p.y - V90_SHORE_ORIGIN_Y);
    embeddedProps++;

    if (p.embedKind === 'wreck_trench') {
      // Hand-fitted diagonal hull-silhouette cast shadow & sunlit sand berms piled against struts!
      for (let dy = -34; dy <= 28; dy++) {
        for (let dx = -168; dx <= 156; dx++) {
          // Skew diagonally along the ICV Meridian's fuselage angle!
          const skewY = dy + dx * 0.14;
          const d = Math.hypot(dx / 154, skewY / 28);
          if (d > 1.18) continue;
          const n = vnoise(lx + dx, ly + dy, 14, 921);
          if (d < 0.86) {
            blendRgb(rgba, W, H, lx + dx, ly + dy, charPlum, (1 - d / 0.86) * 0.34);
          } else if (dy > -4 && n > 0.44) {
            setRgb(rgba, W, H, lx + dx, ly + dy, dy > 6 ? sDryCream : sDryHi);
          }
        }
      }
      const hullTufts = [
        [-144, 16, 0], [-96, 22, 1], [-22, 18, 0], [32, 24, 1], [154, -22, 0], [-118, -58, 2], [94, -68, 2],
      ];
      for (const [dx, dy, row] of hullTufts) {
        tufts.push({ x: p.x + dx, y: p.y + dy, row, phase: hash2(p.x + dx, p.y + dy, 4) * 6.28, sens: 1.05 });
      }
    } else if (p.embedKind === 'cliff_base') {
      // Soft directional grounding shadow + hand-sculpted flat coastal basalt stepping slabs (ZERO dot speckle!)
      for (let dy = -22; dy <= 18; dy++) {
        for (let dx = -72; dx <= 76; dx++) {
          const d = Math.hypot(dx / 70, dy / 19);
          if (d < 0.92) {
            blendRgb(rgba, W, H, lx + dx, ly + dy, rockDark, (1 - d / 0.92) * 0.38);
          }
        }
      }
      const slabs: Array<[number, number, number, number]> = [
        [-64, 10, 6, 3], [-42, 16, 5, 2], [-14, 18, 7, 3], [22, 17, 6, 3], [54, 12, 5, 2], [68, 4, 4, 2],
      ];
      for (const [sx, sy2, rx, ry] of slabs) {
        drawFlatStone(rgba, W, H, lx + sx, ly + sy2, rx, ry, rockDark, rockMid, rockHi);
      }
      for (const [dx, dy, row] of [[-58, 12, 6], [-24, 16, 4], [28, 14, 6], [62, 8, 1]]) {
        if (p.y + dy < shoreYs[Math.max(0, Math.min(W - 1, Math.round(p.x + dx)))] - 12) {
          tufts.push({ x: p.x + dx, y: p.y + dy, row, phase: hash2(p.x + dx, p.y + dy, 5) * 6.28, sens: 0.9 });
        }
      }
    } else if (p.embedKind === 'wet_rock') {
      // Clean solid 2-tone seafoam crescent collar around offshore rocks & smooth wet rim on beach boulders!
      const rx = p.layer === 'ocean_prop' ? 46 : 38;
      const ry = p.layer === 'ocean_prop' ? 14 : 13;
      for (let dy = -ry - 4; dy <= ry + 5; dy++) {
        for (let dx = -rx - 4; dx <= rx + 4; dx++) {
          const n = (vnoise(lx + dx, ly + dy, 9, 944) - 0.5) * 0.16;
          const d = Math.hypot(dx / rx, dy / ry) + n;
          if (d < 0.86) {
            blendRgb(rgba, W, H, lx + dx, ly + dy, p.layer === 'ocean_prop' ? oDeep : sWetDark, 0.36);
          } else if (p.layer === 'ocean_prop' && d >= 0.88 && d <= 1.12) {
            // Solid crisp handcrafted seafoam crescent (zero speckled confetti!)
            setRgb(rgba, W, H, lx + dx, ly + dy, dy > 0 && d < 1.03 ? oFoamHi : oFoamSoft);
          }
        }
      }
    } else if (p.embedKind === 'sand_berm') {
      // Subtle grounded sand-berm depression + sunlit piled sand lip hugging base!
      for (let dy = -12; dy <= 14; dy++) {
        for (let dx = -42; dx <= 44; dx++) {
          const d = Math.hypot(dx / 40, dy / 12);
          if (d < 0.82) {
            blendRgb(rgba, W, H, lx + dx, ly + dy, sDampDeep, (1 - d / 0.82) * 0.28);
          } else if (d < 1.06 && dy > 2) {
            setRgb(rgba, W, H, lx + dx, ly + dy, dy > 6 ? sDryCream : sDryHi);
          }
        }
      }
      tufts.push({ x: p.x - 24, y: p.y + 8, row: 0, phase: hash2(p.x, p.y, 7) * 6.28, sens: 1.0 });
      tufts.push({ x: p.x + 26, y: p.y + 6, row: 1, phase: hash2(p.x, p.y, 8) * 6.28, sens: 1.0 });
    } else if (p.embedKind === 'dune_plant') {
      for (let dy = -10; dy <= 10; dy++) {
        for (let dx = -28; dx <= 28; dx++) {
          const d = Math.hypot(dx / 26, dy / 10);
          if (d < 0.88) blendRgb(rgba, W, H, lx + dx, ly + dy, g0, (1 - d / 0.88) * 0.36);
        }
      }
      const isInland = p.y < 1660;
      for (const [dx, dy] of [[-22, 7], [2, 10], [24, 6]]) {
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

  // Organic multi-tuft meadow & coastal dune drifts across Zones A–F!
  for (let gy = 1384; gy <= 2320; gy += 46) {
    for (let gx = 320; gx <= 1980; gx += 58) {
      const sy = shoreYs[gx];
      const vy = vegYs[gx];
      if (gy > sy - 58) continue;
      if (gx > 1020 && gx < 1465 && gy > 2110 && gy < 2310) continue;
      const trailCenter =
        1142 + Math.sin((gy - 1344) * 0.0065) * 86 + (gy > 1760 ? (gy - 1760) * 0.32 : 0);
      if (Math.abs(gx - trailCenter) < 36) continue;

      const r = hash2(gx, gy, 1021);
      const isBeach = gy > vy + 24;
      if (isBeach && r > 0.24) continue;
      if (!isBeach && r > 0.62) continue;

      const driftCount = isBeach ? 1 + (r < 0.1 ? 1 : 0) : 2 + (r < 0.26 ? 1 : 0);
      for (let d = 0; d < driftCount; d++) {
        const tx = gx + (hash2(gx + d, gy, 1022) - 0.5) * 34;
        const ty = gy + (hash2(gx, gy + d, 1023) - 0.5) * 20;
        let row = 0;
        if (gy < 1560) {
          row = hash2(gx, gy, d + 20) > 0.28 ? 7 : 3;
        } else if (gy < vy) {
          const pick = hash2(gx, gy, d + 30);
          row = pick < 0.36 ? 2 : pick < 0.62 ? 1 : pick < 0.80 ? 0 : pick < 0.92 ? 3 : 4;
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

  // Swaying Amber Tide-Kelp Ribbon Tufts (Row 5) inside all 5 Tidepool Basins!
  for (const tp of V90_TIDEPOOLS) {
    for (let k = 0; k < 6; k++) {
      const ang = (k / 6) * Math.PI * 2 + 0.3;
      tufts.push({
        x: Math.round(tp.x + Math.cos(ang) * tp.rx * 0.55),
        y: Math.round(tp.y + Math.sin(ang) * tp.ry * 0.52),
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
