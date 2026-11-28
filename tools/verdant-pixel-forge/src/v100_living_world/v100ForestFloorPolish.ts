import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  type RGB,
  type SpriteBitmap,
  hexToRgb,
  loadPngRgba,
  savePngRgba,
} from '../v90_broken_shore/v90PaletteAndExtractor';

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

function setRgb(bmp: SpriteBitmap, x: number, y: number, c: RGB): void {
  const ix = Math.round(x);
  const iy = Math.round(y);
  if (ix < 0 || ix >= bmp.w || iy < 0 || iy >= bmp.h) return;
  const o = (iy * bmp.w + ix) * 4;
  bmp.rgba[o] = c.r;
  bmp.rgba[o + 1] = c.g;
  bmp.rgba[o + 2] = c.b;
  bmp.rgba[o + 3] = 255;
}

function blendRgb(bmp: SpriteBitmap, x: number, y: number, c: RGB, a: number): void {
  const ix = Math.round(x);
  const iy = Math.round(y);
  if (ix < 0 || ix >= bmp.w || iy < 0 || iy >= bmp.h) return;
  const o = (iy * bmp.w + ix) * 4;
  const ia = 1 - a;
  bmp.rgba[o] = Math.round(bmp.rgba[o] * ia + c.r * a);
  bmp.rgba[o + 1] = Math.round(bmp.rgba[o + 1] * ia + c.g * a);
  bmp.rgba[o + 2] = Math.round(bmp.rgba[o + 2] * ia + c.b * a);
  bmp.rgba[o + 3] = 255;
}

function getPixelRgb(bmp: SpriteBitmap, x: number, y: number): RGB {
  const ix = Math.max(0, Math.min(bmp.w - 1, Math.round(x)));
  const iy = Math.max(0, Math.min(bmp.h - 1, Math.round(y)));
  const o = (iy * bmp.w + ix) * 4;
  return { r: bmp.rgba[o], g: bmp.rgba[o + 1], b: bmp.rgba[o + 2] };
}

function drawMossyFlagstone(
  bmp: SpriteBitmap,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
  sDark: RGB,
  sMid: RGB,
  sLit: RGB,
  sHi: RGB,
  mMid: RGB,
  mHi: RGB
): void {
  for (let dy = -ry - 1; dy <= ry + 1; dy++) {
    for (let dx = -rx - 1; dx <= rx + 1; dx++) {
      const ang = Math.atan2(dy, dx);
      const irreg = 1 + 0.16 * Math.sin(ang * 3 + seed) + 0.10 * Math.cos(ang * 5 - seed);
      const d = Math.hypot(dx / (rx * irreg), dy / (ry * irreg));
      if (d > 1.0) continue;
      if (d > 0.82 || dy > ry * 0.55) {
        setRgb(bmp, cx + dx, cy + dy, sDark);
      } else if (dy < -ry * 0.25 && dx < rx * 0.3) {
        setRgb(bmp, cx + dx, cy + dy, d < 0.45 ? sHi : sLit);
      } else {
        setRgb(bmp, cx + dx, cy + dy, sMid);
      }
      // Subtle moss creep hugging north-east edge of stone
      if (d > 0.52 && dy < 0 && dx > 0 && hash2(cx + dx, cy + dy, seed) > 0.58) {
        setRgb(bmp, cx + dx, cy + dy, dy < -ry * 0.4 ? mHi : mMid);
      }
    }
  }
}

function stampArchingForestTuft(
  bmp: SpriteBitmap,
  cx: number,
  cy: number,
  c0: RGB,
  c1: RGB,
  c2: RGB,
  c3: RGB
): void {
  setRgb(bmp, cx - 2, cy + 1, c0);
  setRgb(bmp, cx - 1, cy + 1, c0);
  setRgb(bmp, cx, cy + 1, c0);
  setRgb(bmp, cx + 1, cy + 1, c0);
  setRgb(bmp, cx + 2, cy + 1, c0);
  setRgb(bmp, cx - 3, cy, c1);
  setRgb(bmp, cx - 2, cy, c1);
  setRgb(bmp, cx - 1, cy, c2);
  setRgb(bmp, cx, cy, c1);
  setRgb(bmp, cx + 1, cy, c2);
  setRgb(bmp, cx + 2, cy, c1);
  setRgb(bmp, cx - 2, cy - 1, c2);
  setRgb(bmp, cx - 1, cy - 1, c3);
  setRgb(bmp, cx + 1, cy - 1, c3);
  setRgb(bmp, cx + 2, cy - 1, c2);
  setRgb(bmp, cx, cy - 2, c3);
}

/**
 * Deterministically refines the committed V8.0 Living Forest floor (`v80_living_floor_2304x1536.png`)
 * ALWAYS starting from the exact immutable V9.0 baseline commit (`7499163`) so repeated runs
 * are 100% idempotent with zero generational drift:
 *   1. Connects a natural mossy-earth & stepping-flagstone southern trail spur (y=1080..1536, x~1142)
 *      straight into the Zone F Inland Gateway so the full 2304x2880 world path is one unbroken journey!
 *   2. Enriches all 6 reflective forest pools with mossy creek stones, layered depth reflections,
 *      overhanging sedge cushions, and delicate bioluminescent petal/lichen specks!
 *   3. Softens straight dirt-trail borders with encroaching turf blades, fallen autumn leaves & roots!
 */
export function buildRefinedV100ForestFloor(repoRoot: string): SpriteBitmap {
  const relPath = 'game/assets/world/living_forest/sprites/v80_living_floor_2304x1536.png';
  const absPath = path.join(repoRoot, relPath);
  const baseTmp = '/tmp/v100_v80_floor_base_7499163.png';

  // Extract untouched V8.0 floor from committed baseline 7499163 for 100% idempotent generation!
  if (!fs.existsSync(baseTmp)) {
    const rawBuf = execFileSync('git', ['show', `7499163:${relPath}`], {
      cwd: repoRoot,
      maxBuffer: 16 * 1024 * 1024,
    });
    fs.writeFileSync(baseTmp, rawBuf);
  }
  const bmp = loadPngRgba(baseTmp);

  const soilDark = hexToRgb('#2a1d15');
  const soil0 = hexToRgb('#3d2a1c');
  const soil1 = hexToRgb('#593d27');
  const soil2 = hexToRgb('#785537');
  const soilWarm = hexToRgb('#987049');
  const soilSand = hexToRgb('#b68f60');

  const gDeep = hexToRgb('#0c3024');
  const gShade = hexToRgb('#12442c');
  const gMid0 = hexToRgb('#1b5e35');
  const gMid1 = hexToRgb('#25783b');
  const gLit0 = hexToRgb('#3b9843');
  const gLit1 = hexToRgb('#5eba4a');
  const gSun = hexToRgb('#8ed852');

  const stDark = hexToRgb('#2a3b42');
  const stMid = hexToRgb('#4f6870');
  const stLit = hexToRgb('#7f9aa0');
  const stHi = hexToRgb('#b3cacb');

  const leafRust = hexToRgb('#a34e29');
  const leafAmber = hexToRgb('#d17b36');
  const leafGold = hexToRgb('#e8ae52');
  const flGold = hexToRgb('#ffe268');
  const flLav = hexToRgb('#bea4eb');
  const flWhite = hexToRgb('#f4fcf8');
  const bioCyan = hexToRgb('#80f2e6');
  const bioHi = hexToRgb('#dcfffa');

  const wEdge = hexToRgb('#143a4d');
  const wDeep = hexToRgb('#1c536b');
  const wMid = hexToRgb('#30839e');
  const wSky = hexToRgb('#6ec4db');
  const wGlint = hexToRgb('#c8f3fc');

  // =========================================================================
  // 1. CONTINUOUS SOUTHERN GATEWAY TRAIL SPUR (y = 1075..1536, linking to Zone F x=1142!)
  // =========================================================================
  for (let y = 1068; y < bmp.h; y++) {
    const t = Math.max(0, Math.min(1, (y - 1078) / (bmp.h - 1078)));
    // Gently meanders from the V8.0 southern clearing pond/trail (x=1158) straight into Zone F (x=1142)!
    const cx = 1158 - t * 16 + Math.sin(t * Math.PI * 2.1) * 26;
    const baseHalfW = 19 + t * 11;
    for (let x = Math.floor(cx - baseHalfW - 18); x <= Math.ceil(cx + baseHalfW + 18); x++) {
      if (x < 0 || x >= bmp.w) continue;
      // Don't paint over existing blue water pixels of the southern forest pool!
      const cur = getPixelRgb(bmp, x, y);
      if (cur.b > cur.g + 12 && cur.b > cur.r + 32) continue;

      const edgeN = (vnoise(x, y, 18, 301) - 0.5) * 14 + (vnoise(x, y, 7, 307) - 0.5) * 6;
      const d = Math.abs(x - cx) + edgeN;
      if (d > baseHalfW + 6) continue;

      const grain = vnoise(x, y, 12, 313);
      const fine = vnoise(x, y, 5, 317);
      if (d < baseHalfW * 0.48) {
        // Center trail warms organically from woodland humus into sandy coastal trail near y=1536!
        let c = grain > 0.55 ? soil2 : soil1;
        if (t > 0.58 && grain > 0.44) c = t > 0.80 && fine > 0.52 ? soilSand : soilWarm;
        else if (fine < 0.25) c = soil0;
        setRgb(bmp, x, y, c);
      } else if (d < baseHalfW * 0.86) {
        const c = grain > 0.52 ? soil1 : soil0;
        blendRgb(bmp, x, y, c, 0.82);
      } else {
        // Damp mossy humus border transitioning into forest grass
        blendRgb(bmp, x, y, grain > 0.5 ? soilDark : gDeep, 0.58);
      }
    }
  }

  // Hand-placed weathered mossy stepping flagstones & grass/leaf fringes along the southern gateway spur!
  for (let i = 0; i < 19; i++) {
    const t = i / 18;
    const y = Math.round(1092 + t * 424);
    const cx = Math.round(1158 - t * 16 + Math.sin(t * Math.PI * 2.1) * 26 + (hash2(i, 1, 331) - 0.5) * 18);
    const rx = 5 + Math.floor(hash2(i, 2, 331) * 5);
    const ry = 3 + Math.floor(hash2(i, 3, 331) * 3);
    drawMossyFlagstone(bmp, cx, y, rx, ry, i * 17 + 3, stDark, stMid, stLit, stHi, gMid1, gLit1);
  }
  // Encroaching grass tufts, clover & fallen redwood leaves hugging the spur borders!
  for (let y = 1084; y < bmp.h - 6; y += 7) {
    const t = (y - 1078) / (bmp.h - 1078);
    const cx = 1158 - t * 16 + Math.sin(t * Math.PI * 2.1) * 26;
    const hw = 19 + t * 11;
    for (const side of [-1, 1]) {
      const gx = Math.round(cx + side * (hw + (hash2(y, side, 349) - 0.35) * 10));
      const gy = y + Math.round((hash2(y, side, 353) - 0.5) * 5);
      stampArchingForestTuft(bmp, gx, gy, gDeep, gMid0, gLit0, gLit1);
      if (hash2(y, side, 359) < 0.34) {
        const lx = gx - side * (4 + Math.floor(hash2(y, side, 367) * 8));
        const lc = hash2(y, side, 373) > 0.5 ? leafAmber : leafRust;
        setRgb(bmp, lx, gy, lc);
        setRgb(bmp, lx + 1, gy, leafGold);
        setRgb(bmp, lx, gy + 1, soilDark);
      }
      if (hash2(y, side, 379) < 0.16) {
        setRgb(bmp, gx + side * 4, gy - 1, hash2(y, side, 383) > 0.5 ? flGold : flWhite);
      }
    }
  }

  // =========================================================================
  // 2. ARTISANAL SPRING-POOL ENHANCEMENT (All 6 V8.0 Forest Pools!)
  // Adds depth-graded water reflections, mossy creek stones, sedge tufts & floating petals
  // while KEEPING the blue water signature intact so puddle_ripples.gdshader still activates!
  // =========================================================================
  const pools: Array<{ x: number; y: number; r: number }> = [
    { x: 1584, y: 866, r: 58 },
    { x: 1732, y: 896, r: 44 },
    { x: 1144, y: 1038, r: 62 },
    { x: 1272, y: 1084, r: 42 },
    { x: 1004, y: 764, r: 46 },
    { x: 966, y: 492, r: 48 },
  ];

  for (let pi = 0; pi < pools.length; pi++) {
    const p = pools[pi];
    const rimPoints: Array<[number, number]> = [];
    for (let dy = -p.r; dy <= p.r; dy++) {
      for (let dx = -p.r; dx <= p.r; dx++) {
        const x = p.x + dx;
        const y = p.y + dy;
        const c = getPixelRgb(bmp, x, y);
        const isWater = c.b > c.g + 12 && c.b > c.r + 32;
        if (!isWater) continue;

        // Check if on perimeter of water body
        const nW = getPixelRgb(bmp, x, y - 2);
        const sW = getPixelRgb(bmp, x, y + 2);
        const wW = getPixelRgb(bmp, x - 2, y);
        const eW = getPixelRgb(bmp, x + 2, y);
        const isEdge =
          !(nW.b > nW.g + 12 && nW.b > nW.r + 32) ||
          !(sW.b > sW.g + 12 && sW.b > sW.r + 32) ||
          !(wW.b > wW.g + 12 && wW.b > wW.r + 32) ||
          !(eW.b > eW.g + 12 && eW.b > eW.r + 32);

        if (isEdge) {
          rimPoints.push([x, y]);
          // Deep sheltered bank shadow keeping blue dominance for ripple shader
          setRgb(bmp, x, y, wEdge);
        } else {
          // Serene glassy forest pool reflecting canopy edge & sunlit sky-cloud sheen!
          const band = vnoise(x * 0.42, y * 1.15, 18, 419 + pi * 11);
          if (dy < -4 && dx < 10 && band > 0.66) {
            setRgb(bmp, x, y, wGlint);
          } else if (dy < 6 && band > 0.44) {
            setRgb(bmp, x, y, wSky);
          } else if (band > 0.28) {
            setRgb(bmp, x, y, wMid);
          } else {
            setRgb(bmp, x, y, wDeep);
          }
        }
      }
    }

    // Place organic mossy creek pebbles, overhanging sedge tufts & tiny glowing blossoms along bank!
    for (let i = 0; i < rimPoints.length; i += 19) {
      const [rx, ry] = rimPoints[i];
      const h = hash2(rx, ry, 503 + pi);
      if (h < 0.38) {
        drawMossyFlagstone(
          bmp,
          rx,
          ry - (ry < p.y ? 2 : -2),
          3 + Math.floor(h * 7),
          2 + Math.floor(h * 3),
          i + pi * 29,
          stDark,
          stMid,
          stLit,
          stHi,
          gMid1,
          gLit1
        );
      } else if (h < 0.78) {
        stampArchingForestTuft(bmp, rx, ry - (ry < p.y ? 2 : 0), gDeep, gShade, gLit0, gSun);
        if (h > 0.68) {
          setRgb(bmp, rx, ry - 2, pi % 2 === 0 ? bioCyan : flLav);
          setRgb(bmp, rx + 1, ry - 2, bioHi);
        }
      }
    }
    // Delicate floating lily-leaf & bioluminescent water petal in pool interior
    setRgb(bmp, p.x - 6, p.y + 1, gMid1);
    setRgb(bmp, p.x - 5, p.y + 1, gLit1);
    setRgb(bmp, p.x - 6, p.y + 2, gMid0);
    setRgb(bmp, p.x + 8, p.y - 3, gLit0);
    setRgb(bmp, p.x + 9, p.y - 3, bioHi);
  }

  // =========================================================================
  // 3. SOFTEN STRAIGHT V8.0 TRAIL EDGES WITH ENCROACHING TURF & FALLEN LEAVES
  // =========================================================================
  for (let y = 320; y < 1260; y += 5) {
    for (let x = 440; x < 1860; x += 5) {
      const c = getPixelRgb(bmp, x, y);
      // Detect warm brown dirt trail pixel next to emerald forest turf
      const isDirt = c.r > 88 && c.r > c.g + 14 && c.g > c.b + 10 && c.r < 175;
      if (!isDirt) continue;
      const adj = getPixelRgb(bmp, x + 5, y);
      const adj2 = getPixelRgb(bmp, x - 5, y);
      const adj3 = getPixelRgb(bmp, x, y + 5);
      const nearGrass =
        (adj.g > adj.r + 16) || (adj2.g > adj2.r + 16) || (adj3.g > adj3.r + 16);
      if (!nearGrass) continue;
      const h = hash2(x, y, 641);
      if (h < 0.24) {
        stampArchingForestTuft(bmp, x, y, gDeep, gMid0, gLit0, gLit1);
      } else if (h < 0.38) {
        setRgb(bmp, x, y, h > 0.31 ? leafAmber : leafRust);
        setRgb(bmp, x + 1, y, leafGold);
      }
    }
  }

  savePngRgba(absPath, bmp);
  return bmp;
}
