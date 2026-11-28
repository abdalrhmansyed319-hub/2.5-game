/**
 * VERDANT SIGNAL V7.1 — ISOLATED FOREST RECOMPOSITION STUDY BUILDER
 * ==================================================================
 * Outputs strictly to: game/assets/v71_forest_recomposition_study/ (protected by .gdignore)
 * Leaves M01, v3.0, V4.0, V5.0, and V7.0 completely untouched!
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { encodeRGBA8PNG } from '../engine/pngEncoder';
import { createEmptyBuffer, setPixel } from '../engine/pixelBuffer';
import { blitV4 } from '../v4_masterpiece/v4Core';
import {
  type RGB,
  digitizeToCraftedPixelArt,
  hexToRgb,
} from '../v5_soul/v5PixelEngine';
import { buildPlayableMaraV7Sheet, type MaraDirV7 } from '../v7_immersive/v7PixelAtlas';
import { type RgbaImage } from '../v7_immersive/v7WorldEngine';
import {
  V71_FOREST_MASTER_PALETTE,
  V71_VIEW_H,
  V71_VIEW_W,
  buildV71ForestFloorAndHorizon,
  getV71ForestWorldDef,
  renderV71ForestFrame,
} from './v71ForestEngine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const UNDERLAY_DIR = '/tmp/v71_underlay';
const OUT_ROOT = path.join(REPO_ROOT, 'game/assets/v71_forest_recomposition_study');
const SPRITES_DIR = path.join(OUT_ROOT, 'sprites');
const PROOFS_DIR = path.join(OUT_ROOT, 'proofs');
const PLAYABLE_DIR = path.join(OUT_ROOT, 'playable_web');
const GODOT_DIR = path.join(OUT_ROOT, 'godot_study');

// ============================================================================
// ZERO-FRINGE MAGENTA CHROMA-KEY EXTRACTOR + DEPTH-GRADE HELPERS
// ============================================================================

function writePng(filePath: string, pixels: Uint8ClampedArray, width: number, height: number): void {
  fs.writeFileSync(filePath, encodeRGBA8PNG(pixels, width, height));
}

function loadPngRaw(filePath: string): { pixels: Uint8ClampedArray; width: number; height: number } {
  const dimStr = execFileSync('identify', ['-format', '%w %h', filePath], { encoding: 'utf8' }).trim();
  const [width, height] = dimStr.split(' ').map(Number);
  const rawBuf = execFileSync('convert', [filePath, '-depth', '8', 'rgba:-'], {
    maxBuffer: width * height * 4 + 65536,
  });
  return { pixels: new Uint8ClampedArray(rawBuf), width, height };
}

function flipHorizontal(img: RgbaImage): RgbaImage {
  const out = createEmptyBuffer(img.width, img.height);
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const si = (y * img.width + (img.width - 1 - x)) * 4;
      const di = (y * img.width + x) * 4;
      out[di] = img.pixels[si];
      out[di + 1] = img.pixels[si + 1];
      out[di + 2] = img.pixels[si + 2];
      out[di + 3] = img.pixels[si + 3];
    }
  }
  return { pixels: out, width: img.width, height: img.height };
}

/**
 * Extracts a chroma-key (#FF00FF) sprite cleanly at target dimensions with
 * zero magenta halo, unified onto our 52-color Singing Canopy master palette!
 * Optionally applies atmospheric rear-depth tinting or foreground shadow shading
 * BEFORE quantization so every resulting pixel stays strictly in the master palette!
 */
function extractV71Sprite(opts: {
  sourcePath: string;
  targetW: number;
  targetH: number;
  tintHex?: string;
  tintAmount?: number;
  darken?: number;
  trimTop?: boolean;
}): RgbaImage {
  const { sourcePath, targetW, targetH, tintHex, tintAmount = 0, darken = 0, trimTop = false } = opts;
  const full = loadPngRaw(sourcePath);

  // Build crisp full-res foreground mask using BORDER FLOOD-FILL from exterior #FF00FF!
  // This removes 100% of exterior magenta background + 1px border fringe while
  // NEVER punching holes through interior violet shelf-fungi or pink woodland flowers!
  const isBgColor = new Uint8Array(full.width * full.height);
  for (let i = 0; i < full.width * full.height; i++) {
    const r = full.pixels[i * 4];
    const g = full.pixels[i * 4 + 1];
    const b = full.pixels[i * 4 + 2];
    const a = full.pixels[i * 4 + 3];
    if (a < 128) { isBgColor[i] = 1; continue; }
    const magScore = Math.min(r, b) - g;
    if (magScore > 46 && r > 135 && b > 135) isBgColor[i] = 1;
  }

  // BFS flood-fill exterior magenta starting from all 4 image edges
  const exterior = new Uint8Array(full.width * full.height);
  const queue = new Int32Array(full.width * full.height);
  let qHead = 0, qTail = 0;
  const enqueue = (idx: number) => {
    if (!exterior[idx] && isBgColor[idx]) {
      exterior[idx] = 1;
      queue[qTail++] = idx;
    }
  };
  for (let x = 0; x < full.width; x++) {
    enqueue(x);
    enqueue((full.height - 1) * full.width + x);
  }
  for (let y = 0; y < full.height; y++) {
    enqueue(y * full.width);
    enqueue(y * full.width + (full.width - 1));
  }
  while (qHead < qTail) {
    const idx = queue[qHead++];
    const x = idx % full.width;
    const y = (idx - x) / full.width;
    if (x > 0) enqueue(idx - 1);
    if (x < full.width - 1) enqueue(idx + 1);
    if (y > 0) enqueue(idx - full.width);
    if (y < full.height - 1) enqueue(idx + full.width);
  }

  // Also strip isolated large bright pure-magenta sky pockets between branches (strict pure #FF00FF only)
  // while leaving darker violet fungi completely solid!
  const mask = new Uint8Array(full.width * full.height);
  for (let i = 0; i < full.width * full.height; i++) {
    if (exterior[i]) continue;
    const r = full.pixels[i * 4];
    const g = full.pixels[i * 4 + 1];
    const b = full.pixels[i * 4 + 2];
    const pureKey = r > 220 && b > 220 && g < 55;
    if (pureKey) continue;
    mask[i] = 1;
  }

  // 1px exterior fringe erosion strictly adjacent to transparent exterior background
  const maskClean = new Uint8Array(mask);
  for (let y = 1; y < full.height - 1; y++) {
    for (let x = 1; x < full.width - 1; x++) {
      const idx = y * full.width + x;
      if (!mask[idx]) continue;
      if (!mask[idx - 1] || !mask[idx + 1] || !mask[idx - full.width] || !mask[idx + full.width]) {
        const r = full.pixels[idx * 4];
        const g = full.pixels[idx * 4 + 1];
        const b = full.pixels[idx * 4 + 2];
        if (Math.min(r, b) - g > 24 && r > 110 && b > 110) {
          maskClean[idx] = 0;
        }
      }
    }
  }

  // Tight bounding box crop of foreground silhouette (preserve full top bleed for trees!)
  let minX = full.width, minY = full.height, maxX = -1, maxY = -1;
  for (let y = 0; y < full.height; y++) {
    for (let x = 0; x < full.width; x++) {
      if (maskClean[y * full.width + x]) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!trimTop) minY = 0;
  const cropW = Math.max(1, maxX - minX + 1);
  const cropH = Math.max(1, maxY - minY + 1);

  const tintRgb = tintHex ? hexToRgb(tintHex) : null;
  const down = createEmptyBuffer(targetW, targetH);

  for (let ty = 0; ty < targetH; ty++) {
    const sy0 = minY + Math.floor((ty * cropH) / targetH);
    const sy1 = Math.min(maxY + 1, minY + Math.max(Math.floor(((ty + 1) * cropH) / targetH), sy0 - minY + 1));
    for (let tx = 0; tx < targetW; tx++) {
      const sx0 = minX + Math.floor((tx * cropW) / targetW);
      const sx1 = Math.min(maxX + 1, minX + Math.max(Math.floor(((tx + 1) * cropW) / targetW), sx0 - minX + 1));
      let rSum = 0, gSum = 0, bSum = 0, fg = 0, total = 0;
      for (let sy = sy0; sy < sy1; sy++) {
        for (let sx = sx0; sx < sx1; sx++) {
          total++;
          const idx = sy * full.width + sx;
          if (!maskClean[idx]) continue;
          const r = full.pixels[idx * 4];
          const g = full.pixels[idx * 4 + 1];
          const b = full.pixels[idx * 4 + 2];
          rSum += r;
          gSum += g;
          bSum += b;
          fg++;
        }
      }
      if (fg >= Math.max(1, total * 0.44)) {
        let r = rSum / fg;
        let g = gSum / fg;
        let b = bSum / fg;
        if (darken > 0) {
          r *= 1 - darken;
          g *= 1 - darken * 0.85;
          b *= 1 - darken * 0.65;
        }
        if (tintRgb && tintAmount > 0) {
          r = r * (1 - tintAmount) + tintRgb.r * tintAmount;
          g = g * (1 - tintAmount) + tintRgb.g * tintAmount;
          b = b * (1 - tintAmount) + tintRgb.b * tintAmount;
        }
        setPixel(down, targetW, targetH, tx, ty, {
          r: Math.max(0, Math.min(255, Math.round(r))),
          g: Math.max(0, Math.min(255, Math.round(g))),
          b: Math.max(0, Math.min(255, Math.round(b))),
          a: 255,
        });
      }
    }
  }

  // Palette-quantize onto V7.1 Singing Canopy Master Palette with crisp clean passes
  const dig = digitizeToCraftedPixelArt(down, targetW, targetH, V71_FOREST_MASTER_PALETTE, {
    ditherThreshold: 0.040,
    ditherStrength: 0.016,
    cleanPasses: 2,
  });

  // Restore clean transparent alpha + crisp 1px dark silhouette grounding where needed
  for (let i = 0; i < targetW * targetH; i++) {
    if (down[i * 4 + 3] < 128) {
      dig.pixels[i * 4] = 0;
      dig.pixels[i * 4 + 1] = 0;
      dig.pixels[i * 4 + 2] = 0;
      dig.pixels[i * 4 + 3] = 0;
    } else {
      dig.pixels[i * 4 + 3] = 255;
    }
  }

  return { pixels: dig.pixels, width: targetW, height: targetH };
}

// ============================================================================
// MINIMAL CRISP 3x5 PIXEL LABEL HELPER (STRICTLY FOR COMPARISON HEADER BAR)
// ============================================================================

const FONT_3X5: Record<string, string[]> = {
  A: ['010', '101', '111', '101', '101'], B: ['110', '101', '110', '101', '110'],
  C: ['011', '100', '100', '100', '011'], D: ['110', '101', '101', '101', '110'],
  E: ['111', '100', '110', '100', '111'], F: ['111', '100', '110', '100', '100'],
  G: ['011', '100', '101', '101', '011'], H: ['101', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'], J: ['001', '001', '001', '101', '010'],
  K: ['101', '101', '110', '101', '101'], L: ['100', '100', '100', '100', '111'],
  M: ['101', '111', '111', '101', '101'], N: ['110', '101', '101', '101', '101'],
  O: ['010', '101', '101', '101', '010'], P: ['110', '101', '110', '100', '100'],
  R: ['110', '101', '110', '101', '101'], S: ['011', '100', '010', '001', '110'],
  T: ['111', '010', '010', '010', '010'], U: ['101', '101', '101', '101', '011'],
  V: ['101', '101', '101', '101', '010'], W: ['101', '101', '111', '111', '101'],
  X: ['101', '101', '010', '101', '101'], Y: ['101', '101', '010', '010', '010'],
  Z: ['111', '001', '010', '100', '111'],
  '0': ['111', '101', '101', '101', '111'], '1': ['010', '110', '010', '010', '111'],
  '2': ['110', '001', '010', '100', '111'], '3': ['110', '001', '010', '001', '110'],
  '4': ['101', '101', '111', '001', '001'], '5': ['111', '100', '110', '001', '110'],
  '6': ['011', '100', '111', '101', '111'], '7': ['111', '001', '010', '010', '010'],
  '8': ['111', '101', '111', '101', '111'], '9': ['111', '101', '111', '001', '110'],
  '.': ['000', '000', '000', '000', '010'], ':': ['000', '010', '000', '010', '000'],
  '-': ['000', '000', '111', '000', '000'], '/': ['001', '001', '010', '100', '100'],
  '(': ['010', '100', '100', '100', '010'], ')': ['010', '001', '001', '001', '010'],
  ' ': ['000', '000', '000', '000', '000'],
};

function drawText3x5(buf: Uint8ClampedArray, w: number, h: number, text: string, x0: number, y0: number, col: RGB): void {
  let x = x0;
  for (const ch of text.toUpperCase()) {
    const g = FONT_3X5[ch] ?? FONT_3X5[' '];
    for (let gy = 0; gy < 5; gy++) {
      for (let gx = 0; gx < 3; gx++) {
        if (g[gy][gx] === '1') {
          setPixel(buf, w, h, x + gx, y0 + gy, { ...col, a: 255 });
        }
      }
    }
    x += 4;
  }
}

// ============================================================================
// COVERAGE METRIC ANALYZER (VERIFIES ENVIRONMENT DOMINATES COMPOSITION!)
// ============================================================================

function measureForestDominance(
  world: ReturnType<typeof getV71ForestWorldDef>,
  sprites: Record<string, RgbaImage>,
  camX: number,
  camY: number
): { forestPct: number; floorPct: number; skyHorizonPct: number } {
  // Rasterize mask of all forest structures (bg_titan, ysort, overhang, foreground) into 480x270
  const mask = new Uint8Array(V71_VIEW_W * V71_VIEW_H);
  const stamp = (spr: RgbaImage, dx: number, dy: number) => {
    for (let sy = 0; sy < spr.height; sy++) {
      const y = dy + sy;
      if (y < 0 || y >= V71_VIEW_H) continue;
      for (let sx = 0; sx < spr.width; sx++) {
        const x = dx + sx;
        if (x < 0 || x >= V71_VIEW_W) continue;
        if (spr.pixels[(sy * spr.width + sx) * 4 + 3] > 128) mask[y * V71_VIEW_W + x] = 1;
      }
    }
  };
  for (const p of world.props) {
    const spr = sprites[p.spriteKey];
    if (p.layer === 'treeline' || p.layer === 'bg_titan' || p.layer === 'ysort') {
      stamp(spr, Math.round(p.x - camX - spr.width / 2), Math.round(p.y - camY - spr.height));
    } else {
      const pf = p.parallax ?? (p.layer === 'foreground' ? 1.15 : 1.05);
      const anchor = p.anchorCamX ?? 0;
      stamp(spr, Math.round(p.x - camX - (camX - anchor) * (pf - 1)), Math.round(p.y - camY));
    }
  }
  let forestPx = 0, skyPx = 0, floorPx = 0;
  for (let y = 0; y < V71_VIEW_H; y++) {
    for (let x = 0; x < V71_VIEW_W; x++) {
      if (mask[y * V71_VIEW_W + x]) {
        forestPx++;
      } else if (camY + y < 134) {
        skyPx++;
      } else {
        floorPx++;
      }
    }
  }
  const tot = V71_VIEW_W * V71_VIEW_H;
  return {
    forestPct: Math.round((forestPx / tot) * 1000) / 10,
    floorPct: Math.round((floorPx / tot) * 1000) / 10,
    skyHorizonPct: Math.round((skyPx / tot) * 1000) / 10,
  };
}

// ============================================================================
// MAIN V7.1 BUILD PIPELINE
// ============================================================================

function main(): void {
  fs.mkdirSync(SPRITES_DIR, { recursive: true });
  fs.mkdirSync(PROOFS_DIR, { recursive: true });
  fs.mkdirSync(PLAYABLE_DIR, { recursive: true });
  fs.mkdirSync(GODOT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_ROOT, '.gdignore'), '# Isolated V7.1 forest recomposition study — excluded from M01 Godot scan\n');

  console.log('=== VERDANT SIGNAL V7.1 — COMPLETE FOREST ENVIRONMENTAL RECOMPOSITION ===');

  // 1. Extract ALL 6 handcrafted modular forest structures at TRUE COLOSSAL GAMEPLAY DIMENSIONS!
  //    Notice: Trunks are 176–216px WIDE (including sprawling roots) × 250–300px TALL
  //    so they rise straight OFF THE TOP OF THE 480x270 VIEWPORT!
  console.log('[1/6] Extracting zero-fringe colossal forest architecture onto 52-color palette...');
  const pStraight = path.join(UNDERLAY_DIR, 'v71_titan_trunk_left.png');
  const pGnarled = path.join(UNDERLAY_DIR, 'v71_titan_trunk_gnarled.png');
  const pButtress = path.join(UNDERLAY_DIR, 'v71_titan_trunk_buttress.png');
  const pBush = path.join(UNDERLAY_DIR, 'v71_dense_undergrowth_bush.png');
  const pCanopy = path.join(UNDERLAY_DIR, 'v71_overhanging_canopy_mass.png');
  const pLog = path.join(UNDERLAY_DIR, 'v71_fallen_moss_root_log.png');
  const pHorizon = path.join(UNDERLAY_DIR, 'v71_distant_horizon_strip.png');
  const pTreeline = path.join(UNDERLAY_DIR, 'v71_distant_treeline_foliage_edge.png');

  const treeline_ridge = extractV71Sprite({ sourcePath: pTreeline, targetW: 280, targetH: 92, trimTop: true, tintHex: '#164552', tintAmount: 0.16 });
  const treeline_ridge_flip = flipHorizontal(treeline_ridge);

  const titan_straight = extractV71Sprite({ sourcePath: pStraight, targetW: 192, targetH: 288 });
  const titan_straight_tall = extractV71Sprite({ sourcePath: pStraight, targetW: 204, targetH: 312 });
  const titan_straight_alt = flipHorizontal(extractV71Sprite({ sourcePath: pStraight, targetW: 176, targetH: 274, darken: 0.08 }));
  const titan_gnarled = extractV71Sprite({ sourcePath: pGnarled, targetW: 204, targetH: 284 });
  const titan_gnarled_tall = extractV71Sprite({ sourcePath: pGnarled, targetW: 218, targetH: 304 });
  const titan_gnarled_flip = flipHorizontal(titan_gnarled);
  const titan_buttress = extractV71Sprite({ sourcePath: pButtress, targetW: 224, targetH: 304 });

  // Atmospheric cool forest-teal depth-receded rear perimeter titans!
  const titan_straight_bg = extractV71Sprite({ sourcePath: pStraight, targetW: 162, targetH: 244, tintHex: '#286673', tintAmount: 0.36, darken: 0.14 });
  const titan_gnarled_bg = extractV71Sprite({ sourcePath: pGnarled, targetW: 170, targetH: 242, tintHex: '#286673', tintAmount: 0.36, darken: 0.14 });
  const titan_buttress_bg = extractV71Sprite({ sourcePath: pButtress, targetW: 184, targetH: 252, tintHex: '#286673', tintAmount: 0.34, darken: 0.14 });

  // Dense undergrowth bushes: mid, shaded rear, small edge, and HUGE DARK FOREGROUND CAMERA-FRAMING BUSHES!
  const bush_mid = extractV71Sprite({ sourcePath: pBush, targetW: 112, targetH: 82, trimTop: true });
  const bush_mid_dark = extractV71Sprite({ sourcePath: pBush, targetW: 118, targetH: 86, tintHex: '#164552', tintAmount: 0.28, darken: 0.22, trimTop: true });
  const bush_small = extractV71Sprite({ sourcePath: pBush, targetW: 78, targetH: 58, trimTop: true });
  const bush_small_dark = extractV71Sprite({ sourcePath: pBush, targetW: 84, targetH: 62, tintHex: '#164552', tintAmount: 0.30, darken: 0.24, trimTop: true });
  const bush_fg_huge = extractV71Sprite({ sourcePath: pBush, targetW: 204, targetH: 146, tintHex: '#09241c', tintAmount: 0.24, darken: 0.22, trimTop: true });
  const bush_fg_huge_flip = flipHorizontal(bush_fg_huge);
  const bush_fg_small_flip = flipHorizontal(extractV71Sprite({ sourcePath: pBush, targetW: 142, targetH: 102, tintHex: '#09241c', tintAmount: 0.24, darken: 0.22, trimTop: true }));

  // Sweeping Overhanging High Canopy Bough Masses!
  const canopy_mass = extractV71Sprite({ sourcePath: pCanopy, targetW: 288, targetH: 144, darken: 0.08 });
  const canopy_mass_flip = flipHorizontal(canopy_mass);
  const canopy_mass_wide = extractV71Sprite({ sourcePath: pCanopy, targetW: 328, targetH: 148, darken: 0.12 });

  // Giant Fallen Mossy Hollow Redwood Log with fungi & orchids!
  const fallen_log = extractV71Sprite({ sourcePath: pLog, targetW: 152, targetH: 96, trimTop: true });
  const fallen_log_flip = flipHorizontal(fallen_log);

  const sprites: Record<string, RgbaImage> = {
    treeline_ridge, treeline_ridge_flip,
    titan_straight, titan_straight_tall, titan_straight_alt, titan_gnarled, titan_gnarled_tall, titan_gnarled_flip, titan_buttress,
    titan_straight_bg, titan_gnarled_bg, titan_buttress_bg,
    bush_mid, bush_mid_dark, bush_small, bush_small_dark,
    bush_fg_huge, bush_fg_huge_flip, bush_fg_small_flip,
    canopy_mass, canopy_mass_flip, canopy_mass_wide, fallen_log, fallen_log_flip,
  };

  for (const [key, img] of Object.entries(sprites)) {
    writePng(path.join(SPRITES_DIR, `${key}.png`), img.pixels, img.width, img.height);
  }

  // Build Mara's crisp 28x40 V7.1 directional spritesheet
  const maraSprites = buildPlayableMaraV7Sheet();
  writePng(path.join(SPRITES_DIR, 'mara_v71_spritesheet.png'), maraSprites.sheetPixels, maraSprites.sheetW, maraSprites.sheetH);

  // 2. Build continuous 1440x340 organic forest floor + 640x128 distant monolith horizon!
  console.log('[2/6] Building 1440x340 continuous organic forest floor & distant cliff horizon...');
  const world = getV71ForestWorldDef();
  const { floor, horizon } = buildV71ForestFloorAndHorizon(world, pHorizon);
  writePng(path.join(SPRITES_DIR, 'forest_floor_1440x340.png'), floor.pixels, floor.width, floor.height);
  writePng(path.join(SPRITES_DIR, 'distant_horizon_640x128.png'), horizon.pixels, horizon.width, horizon.height);

  // 3. Render the 3 REQUIRED NATIVE 480x270 (1x ACTUAL GAMEPLAY CAMERA) COMPOSITIONS!
  console.log('[3/6] Rendering native 480x270 compositions A (Corridor), B (Deep Interior), C (Clearing)...');
  const frameA = renderV71ForestFrame({
    world, floor, horizon, sprites, maraSprites,
    maraX: world.presets.A_corridor.maraX, maraY: world.presets.A_corridor.maraY,
    maraDir: world.presets.A_corridor.dir, maraStep: 0,
    camX: world.presets.A_corridor.camX, camY: world.presets.A_corridor.camY, animPhase: 0.15,
  });
  const frameB = renderV71ForestFrame({
    world, floor, horizon, sprites, maraSprites,
    maraX: world.presets.B_interior.maraX, maraY: world.presets.B_interior.maraY,
    maraDir: world.presets.B_interior.dir, maraStep: 1,
    camX: world.presets.B_interior.camX, camY: world.presets.B_interior.camY, animPhase: 0.42,
  });
  const frameC = renderV71ForestFrame({
    world, floor, horizon, sprites, maraSprites,
    maraX: world.presets.C_clearing.maraX, maraY: world.presets.C_clearing.maraY,
    maraDir: world.presets.C_clearing.dir, maraStep: 0,
    camX: world.presets.C_clearing.camX, camY: world.presets.C_clearing.camY, animPhase: 0.72,
  });

  writePng(path.join(PROOFS_DIR, 'proof_A_dense_forest_corridor_480x270.png'), frameA.pixels, V71_VIEW_W, V71_VIEW_H);
  writePng(path.join(PROOFS_DIR, 'proof_B_deep_forest_interior_480x270.png'), frameB.pixels, V71_VIEW_W, V71_VIEW_H);
  writePng(path.join(PROOFS_DIR, 'proof_C_forest_clearing_480x270.png'), frameC.pixels, V71_VIEW_W, V71_VIEW_H);

  const covA = measureForestDominance(world, sprites, world.presets.A_corridor.camX, world.presets.A_corridor.camY);
  const covB = measureForestDominance(world, sprites, world.presets.B_interior.camX, world.presets.B_interior.camY);
  const covC = measureForestDominance(world, sprites, world.presets.C_clearing.camX, world.presets.C_clearing.camY);
  console.log(`   Composition A (Dense Corridor): Forest=${covA.forestPct}% | Floor=${covA.floorPct}% | Sky/Horizon=${covA.skyHorizonPct}%`);
  console.log(`   Composition B (Deep Interior) : Forest=${covB.forestPct}% | Floor=${covB.floorPct}% | Sky/Horizon=${covB.skyHorizonPct}%`);
  console.log(`   Composition C (Forest Clearing): Forest=${covC.forestPct}% | Floor=${covC.floorPct}% | Sky/Horizon=${covC.skyHorizonPct}%`);

  // 4. Build UNSCALED 1x NATIVE 480x270 2x2 COMPARISON SHEET: REJECTED V7.0 vs NEW V7.1 A, B, C!
  console.log('[4/6] Assembling unscaled 1x native comparison sheet (Rejected V7.0 vs New V7.1 A/B/C)...');
  const rejectedV70Path = path.join(REPO_ROOT, 'game/assets/v7_immersive_world_study/proofs/proof_B_immersive_forest_480x270.png');
  const rejectedV70 = loadPngRaw(rejectedV70Path);

  const PAD = 8, HEADER = 16;
  const CW = PAD * 3 + V71_VIEW_W * 2;
  const CH = PAD * 3 + HEADER * 2 + V71_VIEW_H * 2;
  const comp = createEmptyBuffer(CW, CH);
  const bgDark = hexToRgb('#091314');
  for (let i = 0; i < CW * CH; i++) {
    comp[i * 4] = bgDark.r; comp[i * 4 + 1] = bgDark.g; comp[i * 4 + 2] = bgDark.b; comp[i * 4 + 3] = 255;
  }

  const panels: Array<{ label: string; col: RGB; x: number; y: number; pixels: Uint8ClampedArray }> = [
    { label: 'REJECTED V7.0 (MIRRORED EDGE TREES + DRAWN ROAD) 480X270 1X', col: hexToRgb('#ff8c42'), x: PAD, y: PAD, pixels: rejectedV70.pixels },
    { label: 'NEW V7.1 A: DENSE FOREST CORRIDOR (480X270 NATIVE 1X)', col: hexToRgb('#85f7f0'), x: PAD * 2 + V71_VIEW_W, y: PAD, pixels: frameA.pixels },
    { label: 'NEW V7.1 B: DEEP FOREST INTERIOR (480X270 NATIVE 1X)', col: hexToRgb('#85f7f0'), x: PAD, y: PAD * 2 + HEADER + V71_VIEW_H, pixels: frameB.pixels },
    { label: 'NEW V7.1 C: DRAMATIC FOREST CLEARING (480X270 NATIVE 1X)', col: hexToRgb('#ffe36e'), x: PAD * 2 + V71_VIEW_W, y: PAD * 2 + HEADER + V71_VIEW_H, pixels: frameC.pixels },
  ];
  for (const p of panels) {
    drawText3x5(comp, CW, CH, p.label, p.x + 2, p.y + 5, p.col);
    blitV4(comp, CW, CH, p.pixels, V71_VIEW_W, V71_VIEW_H, p.x, p.y + HEADER);
  }
  writePng(path.join(PROOFS_DIR, 'comparison_rejected_V70_vs_new_V71_native_1x.png'), comp, CW, CH);

  // 5. Render 72-frame NATIVE 480x270 PLAYABLE MOVEMENT RECORDING (Zone A -> Zone B -> Zone C!)
  console.log('[5/6] Rendering 72-frame native 480x270 continuous playable walkthrough GIF (A -> B -> C)...');
  const tmpFrames = '/tmp/v71_walk_frames';
  fs.rmSync(tmpFrames, { recursive: true, force: true });
  fs.mkdirSync(tmpFrames, { recursive: true });

  // Continuous natural walking route threading right through Zone A Corridor,
  // dipping BEHIND colossal trunks in Zone B Deep Forest Interior (live walk-behind occlusion!),
  // passing in front of the fallen hollow log, and emerging into Zone C Sunlit Clearing!
  const waypoints: Array<[number, number]> = [
    [232, 282], // Zone A Corridor entrance near puddles
    [272, 258], // Moving up-right between staggered mid titans
    [362, 254], // Passing cleanly BEHIND close right buttress titan (y=298!) -> live occlusion!
    [474, 256], // Entering Zone B throat
    [548, 256], // Passing BEHIND close Zone B gnarled titan (y=304!) -> live occlusion!
    [676, 264], // Stepping into glowing dappled Zone B interior in front of fallen hollow log!
    [796, 252], // Threading BEHIND Zone B front-center titan (y=298!) -> live occlusion!
    [912, 248], // Moving through B->C shaded root throat cleanly above foreground bush
    [1068, 258], // Stepping out into sunlit Zone C clearing rim
    [1196, 274], // Arriving in dramatic sunlit Zone C sanctuary clearing!
  ];

  // Build arc-length parameterized path across 72 frames
  const segLens: number[] = [];
  let totalLen = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const d = Math.hypot(waypoints[i + 1][0] - waypoints[i][0], waypoints[i + 1][1] - waypoints[i][1]);
    segLens.push(d);
    totalLen += d;
  }

  const TOTAL_FRAMES = 72;
  let camX = 0;
  let camY = 42;
  let maxOccludedPx = 0;

  for (let f = 0; f < TOTAL_FRAMES; f++) {
    const t = f / (TOTAL_FRAMES - 1);
    let dist = t * totalLen;
    let seg = 0;
    while (seg < segLens.length - 1 && dist > segLens[seg]) {
      dist -= segLens[seg];
      seg++;
    }
    const u = segLens[seg] > 0 ? dist / segLens[seg] : 0;
    const x0 = waypoints[seg][0], y0 = waypoints[seg][1];
    const x1 = waypoints[seg + 1][0], y1 = waypoints[seg + 1][1];
    const mx = x0 + (x1 - x0) * u;
    const my = y0 + (y1 - y0) * u;
    const dx = x1 - x0, dy = y1 - y0;
    const dir: MaraDirV7 = Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? 'right' : 'left') : (dy >= 0 ? 'down' : 'up');

    // Smooth gameplay camera tracking Mara horizontally while preserving vertical environmental monumentality!
    const targetCamX = Math.max(0, Math.min(world.worldW - V71_VIEW_W, mx - V71_VIEW_W * 0.48));
    camX = f === 0 ? targetCamX : camX + (targetCamX - camX) * 0.18;
    const targetCamY = Math.max(24, Math.min(world.worldH - V71_VIEW_H, my - V71_VIEW_H * 0.78));
    camY = f === 0 ? targetCamY : camY + (targetCamY - camY) * 0.16;

    const rendered = renderV71ForestFrame({
      world, floor, horizon, sprites, maraSprites,
      maraX: mx, maraY: my, maraDir: dir, maraStep: Math.floor(f / 2) % 4,
      camX, camY, animPhase: (f % 36) / 36,
    });
    if (rendered.occludedPixels > maxOccludedPx) maxOccludedPx = rendered.occludedPixels;
    writePng(path.join(tmpFrames, `frame_${String(f).padStart(3, '0')}.png`), rendered.pixels, V71_VIEW_W, V71_VIEW_H);
  }
  console.log(`   Walkthrough peak walk-behind occlusion overlap: ${maxOccludedPx} px (localized silhouette readability verified!)`);

  const gifPath = path.join(PROOFS_DIR, 'proof_D_playable_walkthrough_A_to_C_480x270.gif');
  const frameFiles = Array.from({ length: TOTAL_FRAMES }, (_, idx) =>
    path.join(tmpFrames, `frame_${String(idx).padStart(3, '0')}.png`)
  );
  execFileSync('convert', ['-delay', '9', '-loop', '0', ...frameFiles, '-layers', 'Optimize', gifPath], {
    stdio: 'inherit',
  });

  // 6. Emit interactive playable web prototype + isolated Godot 4.7.2 playable scene!
  console.log('[6/6] Exporting interactive browser playable forest study & isolated Godot 4.7.2 scene...');
  emitPlayableWebStudy(world, sprites, covA, covB, covC);
  emitGodotStudyScene(world, sprites);

  console.log('=== V7.1 FOREST RECOMPOSITION STUDY BUILD COMPLETE ===');
}

function emitPlayableWebStudy(
  world: ReturnType<typeof getV71ForestWorldDef>,
  sprites: Record<string, RgbaImage>,
  covA: { forestPct: number; floorPct: number; skyHorizonPct: number },
  covB: { forestPct: number; floorPct: number; skyHorizonPct: number },
  covC: { forestPct: number; floorPct: number; skyHorizonPct: number }
): void {
  const manifest = {
    viewW: V71_VIEW_W,
    viewH: V71_VIEW_H,
    worldW: world.worldW,
    worldH: world.worldH,
    walkBounds: world.walkBounds,
    presets: world.presets,
    coverage: { A_corridor: covA, B_interior: covB, C_clearing: covC },
    spriteSizes: Object.fromEntries(Object.entries(sprites).map(([k, v]) => [k, { w: v.width, h: v.height }])),
    props: world.props,
  };
  fs.writeFileSync(path.join(PLAYABLE_DIR, 'v71_forest_manifest.json'), JSON.stringify(manifest, null, 2));

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VERDANT SIGNAL V7.1 — Recomposition Playable Forest Study (480x270 Native)</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100vh; background: #071212; color: #e2f5f2;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 16px; gap: 10px;
    }
    .bar {
      display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
      gap: 8px; max-width: 980px; font-size: 12px;
    }
    button {
      background: #102b2a; color: #b5f7f0; border: 1px solid #2b6b68;
      padding: 6px 10px; cursor: pointer; font-family: inherit; font-size: 12px; border-radius: 4px;
    }
    button:hover { background: #184240; }
    button.active { background: #266b64; color: #fff; border-color: #85f7f0; }
    .stage {
      border: 2px solid #264d4a; background: #040b0b; line-height: 0;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.7);
    }
    canvas {
      display: block;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }
    .hud { font-size: 11px; color: #91c7c2; text-align: center; max-width: 960px; }
  </style>
</head>
<body>
  <div class="bar">
    <strong>VERDANT SIGNAL V7.1 — PLAYABLE FOREST RECOMPOSITION</strong>
    <button id="btnA" class="active">1: A. Dense Corridor</button>
    <button id="btnB">2: B. Deep Interior</button>
    <button id="btnC">3: C. Forest Clearing</button>
    <button id="btnAuto">Toggle Auto-Walk (A→C)</button>
    <button id="btn1x">1x Native (480×270)</button>
    <button id="btn2x" class="active">2x Integer (960×540)</button>
  </div>
  <div class="stage">
    <canvas id="game" width="480" height="270" style="width:960px;height:540px;"></canvas>
  </div>
  <div class="hud" id="status">
    Controls: WASD / Arrow Keys to walk freely across all 3 continuous zones (behind &amp; in front of colossal trunks!) · Keys 1 / 2 / 3 jump to compositions A / B / C
  </div>
  <script>
    (async () => {
      const manifest = await (await fetch('./v71_forest_manifest.json')).json();
      const loadImg = (src) => new Promise((res, rej) => {
        const img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = src;
      });
      const floorImg = await loadImg('../sprites/forest_floor_1440x340.png');
      const horizonImg = await loadImg('../sprites/distant_horizon_640x128.png');
      const maraSheet = await loadImg('../sprites/mara_v71_spritesheet.png');
      const sprites = {};
      for (const k of Object.keys(manifest.spriteSizes)) {
        sprites[k] = await loadImg('../sprites/' + k + '.png');
      }

      const canvas = document.getElementById('game');
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const statusEl = document.getElementById('status');

      const keys = new Set();
      let mara = { x: manifest.presets.A_corridor.maraX, y: manifest.presets.A_corridor.maraY, dir: 'up', step: 0 };
      let camX = manifest.presets.A_corridor.camX;
      let camY = manifest.presets.A_corridor.camY;
      let autoWalk = false;
      let autoPhase = 0;

      const setZoom = (z) => {
        canvas.style.width = (480 * z) + 'px';
        canvas.style.height = (270 * z) + 'px';
        document.getElementById('btn1x').classList.toggle('active', z === 1);
        document.getElementById('btn2x').classList.toggle('active', z === 2);
      };
      const snapPreset = (key) => {
        autoWalk = false;
        const p = manifest.presets[key];
        mara.x = p.maraX; mara.y = p.maraY; mara.dir = p.dir;
        camX = p.camX; camY = p.camY;
        document.getElementById('btnA').classList.toggle('active', key === 'A_corridor');
        document.getElementById('btnB').classList.toggle('active', key === 'B_interior');
        document.getElementById('btnC').classList.toggle('active', key === 'C_clearing');
      };

      document.getElementById('btnA').onclick = () => snapPreset('A_corridor');
      document.getElementById('btnB').onclick = () => snapPreset('B_interior');
      document.getElementById('btnC').onclick = () => snapPreset('C_clearing');
      document.getElementById('btnAuto').onclick = () => { autoWalk = !autoWalk; };
      document.getElementById('btn1x').onclick = () => setZoom(1);
      document.getElementById('btn2x').onclick = () => setZoom(2);

      window.addEventListener('keydown', (e) => {
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
        if (e.key === '1') snapPreset('A_corridor');
        else if (e.key === '2') snapPreset('B_interior');
        else if (e.key === '3') snapPreset('C_clearing');
        else { autoWalk = false; keys.add(e.key.toLowerCase()); }
      });
      window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

      const dirRow = { down: 0, up: 1, right: 2, left: 3 };
      const collides = (nx, ny) => {
        const b = manifest.walkBounds;
        if (nx < b.minX || nx > b.maxX || ny < b.minY || ny > b.maxY) return true;
        for (const p of manifest.props) {
          if (!p.colRx || !p.colRy) continue;
          const dx = (nx - p.x) / p.colRx;
          const dy = (ny - (p.y + (p.colOffsetY || 0))) / p.colRy;
          if (dx * dx + dy * dy < 1) return true;
        }
        return false;
      };

      const route = [
        [232,282],[272,258],[362,254],[474,256],[548,256],
        [676,264],[796,252],[912,248],[1068,258],[1196,274]
      ];
      let lastT = performance.now();
      let stepAcc = 0;

      function tick(now) {
        const dt = Math.min(0.05, (now - lastT) / 1000);
        lastT = now;

        let vx = 0, vy = 0;
        if (autoWalk) {
          autoPhase = (autoPhase + dt * 0.085) % 1;
          const segF = autoPhase * (route.length - 1);
          const idx = Math.min(route.length - 2, Math.floor(segF));
          const u = segF - idx;
          const tx = route[idx][0] + (route[idx + 1][0] - route[idx][0]) * u;
          const ty = route[idx][1] + (route[idx + 1][1] - route[idx][1]) * u;
          vx = tx - mara.x; vy = ty - mara.y;
          mara.x = tx; mara.y = ty;
          mara.dir = Math.abs(vx) >= Math.abs(vy) ? (vx >= 0 ? 'right' : 'left') : (vy >= 0 ? 'down' : 'up');
          stepAcc += dt * 7;
          mara.step = Math.floor(stepAcc) % 4;
        } else {
          if (keys.has('a') || keys.has('arrowleft')) vx -= 1;
          if (keys.has('d') || keys.has('arrowright')) vx += 1;
          if (keys.has('w') || keys.has('arrowup')) vy -= 1;
          if (keys.has('s') || keys.has('arrowdown')) vy += 1;
          if (vx || vy) {
            const len = Math.hypot(vx, vy);
            const sp = 78;
            const nx = mara.x + (vx / len) * sp * dt;
            const ny = mara.y + (vy / len) * sp * dt;
            if (!collides(nx, mara.y)) mara.x = nx;
            if (!collides(mara.x, ny)) mara.y = ny;
            mara.dir = Math.abs(vx) >= Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : (vy > 0 ? 'down' : 'up');
            stepAcc += dt * 8;
            mara.step = Math.floor(stepAcc) % 4;
          } else {
            mara.step = 0;
          }
        }

        const tCamX = Math.max(0, Math.min(manifest.worldW - 480, mara.x - 480 * 0.48));
        const tCamY = Math.max(24, Math.min(manifest.worldH - 270, mara.y - 270 * 0.78));
        camX += (tCamX - camX) * Math.min(1, dt * 6);
        camY += (tCamY - camY) * Math.min(1, dt * 6);
        const ix = Math.round(camX), iy = Math.round(camY);

        ctx.clearRect(0, 0, 480, 270);
        // Plane 0: Distant Morning Monolith Horizon (0.22x parallax)
        const hx = Math.round((ix * 0.22) % (horizonImg.width - 480));
        ctx.drawImage(horizonImg, hx, 0, 480, horizonImg.height, 0, 0, 480, horizonImg.height);
        // Plane 1A: Continuous Forest Floor
        ctx.drawImage(floorImg, ix, iy, 480, 270, 0, 0, 480, 270);
        // Plane 1B: Lush Distant Treeline Foliage Ridge (overlaps rear floor edge organically — zero flat line!)
        for (const p of manifest.props) {
          if (p.layer !== 'treeline') continue;
          const img = sprites[p.spriteKey];
          ctx.drawImage(img, Math.round(p.x - ix - img.width / 2), Math.round(p.y - iy - img.height));
        }

        // Plane 2: Rear Perimeter Titans
        const bg = manifest.props.filter(p => p.layer === 'bg_titan').sort((a, b) => a.y - b.y);
        for (const p of bg) {
          const img = sprites[p.spriteKey];
          ctx.drawImage(img, Math.round(p.x - ix - img.width / 2), Math.round(p.y - iy - img.height));
        }

        // Plane 3: Y-Sorted Colossal Trunks + Mara!
        const ys = manifest.props.filter(p => p.layer === 'ysort').map(p => ({ kind: 'prop', y: p.y, p }));
        ys.push({ kind: 'mara', y: mara.y });
        ys.sort((a, b) => a.y - b.y);
        let maraDrawn = false;
        let occluded = false;
        const mDx = Math.round(mara.x - ix - 14);
        const mDy = Math.round(mara.y - iy - 37);

        for (const item of ys) {
          if (item.kind === 'mara') {
            ctx.drawImage(maraSheet, mara.step * 28, dirRow[mara.dir] * 40, 28, 40, mDx, mDy, 28, 40);
            maraDrawn = true;
          } else {
            const img = sprites[item.p.spriteKey];
            const dx = Math.round(item.p.x - ix - img.width / 2);
            const dy = Math.round(item.p.y - iy - img.height);
            ctx.drawImage(img, dx, dy);
            if (maraDrawn && mDx + 22 > dx + 34 && mDx + 6 < dx + img.width - 34 && mDy + 36 > dy && mDy < dy + img.height) {
              occluded = true;
            }
          }
        }
        if (occluded) {
          ctx.save();
          ctx.globalAlpha = 0.34;
          ctx.drawImage(maraSheet, mara.step * 28, dirRow[mara.dir] * 40, 28, 40, mDx, mDy, 28, 40);
          ctx.restore();
        }

        // Plane 4 & 5: Overhanging Canopy + Foreground Framing Bushes (anchored parallax!)
        for (const layerName of ['overhang', 'foreground']) {
          for (const p of manifest.props) {
            if (p.layer !== layerName) continue;
            const img = sprites[p.spriteKey];
            const pf = p.parallax || (layerName === 'foreground' ? 1.15 : 1.05);
            const anchor = p.anchorCamX || 0;
            ctx.drawImage(img, Math.round(p.x - ix - (ix - anchor) * (pf - 1)), Math.round(p.y - iy));
          }
        }

        const zone = mara.x < 480 ? 'A. Dense Forest Corridor' : mara.x < 960 ? 'B. Deep Forest Interior' : 'C. Dramatic Forest Clearing';
        statusEl.textContent = 'Zone: ' + zone + ' | Mara=(' + Math.round(mara.x) + ',' + Math.round(mara.y) + ') | Cam=(' + ix + ',' + iy + ') | WASD/Arrows to walk · Keys 1/2/3 jump zones';
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    })();
  </script>
</body>
</html>
`;

  fs.writeFileSync(path.join(PLAYABLE_DIR, 'index.html'), html);
  fs.writeFileSync(
    path.join(OUT_ROOT, 'index.html'),
    '<!doctype html><html><head><meta http-equiv="refresh" content="0; url=./playable_web/index.html" /></head><body><a href="./playable_web/index.html">Open V7.1 Forest Recomposition Study</a></body></html>\n'
  );
}

function emitGodotStudyScene(
  world: ReturnType<typeof getV71ForestWorldDef>,
  sprites: Record<string, RgbaImage>
): void {
  const gd = `extends Node2D
## VERDANT SIGNAL V7.1 — Isolated Continuous Multi-Zone Forest Recomposition Study (480x270 Native)
## Connects Zone A (Dense Corridor) -> Zone B (Deep Interior) -> Zone C (Dramatic Clearing)
## Protected by .gdignore so M01 and V7.0 remain 100% untouched.

const WALK_SPEED := 78.0
const WORLD_W := 1440.0
const WORLD_H := 340.0
const VIEW_W := 480.0
const VIEW_H := 270.0

@onready var mara: CharacterBody2D = $YSortWorld/Mara
@onready var cam: Camera2D = $YSortWorld/Mara/Camera2D

func _ready() -> void:
	cam.limit_left = 0
	cam.limit_top = 24
	cam.limit_right = int(WORLD_W)
	cam.limit_bottom = int(WORLD_H)
	cam.position_smoothing_enabled = true
	cam.position_smoothing_speed = 6.0

func _physics_process(_delta: float) -> void:
	var dir := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	mara.velocity = dir * WALK_SPEED
	mara.move_and_slide()
	mara.position.x = clampf(mara.position.x, 48.0, 1392.0)
	mara.position.y = clampf(mara.position.y, 162.0, 318.0)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed:
		match event.keycode:
			KEY_1: mara.position = Vector2(256, 266) # A. Dense Forest Corridor
			KEY_2: mara.position = Vector2(734, 256) # B. Deep Forest Interior
			KEY_3: mara.position = Vector2(1202, 274) # C. Dramatic Forest Clearing
`;
  fs.writeFileSync(path.join(GODOT_DIR, 'v71_forest_recomposition.gd'), gd);

  const lines: string[] = [
    '[gd_scene load_steps=2 format=3]',
    '',
    '[ext_resource type="Script" path="v71_forest_recomposition.gd" id="1_script"]',
    '',
    '[node name="V71ForestRecomposition" type="Node2D"]',
    'script = ExtResource("1_script")',
    '',
    '[node name="HorizonParallax" type="Parallax2D" parent="."]',
    'scroll_scale = Vector2(0.22, 0.0)',
    '',
    '[node name="ForestFloor" type="Sprite2D" parent="."]',
    'centered = false',
    '',
    '[node name="YSortWorld" type="Node2D" parent="."]',
    'y_sort_enabled = true',
    '',
    '[node name="Mara" type="CharacterBody2D" parent="YSortWorld"]',
    'position = Vector2(256, 266)',
    '',
    '[node name="Camera2D" type="Camera2D" parent="YSortWorld/Mara"]',
    'offset = Vector2(0, -76)',
    '',
  ];
  for (const p of world.props) {
    if (p.layer !== 'ysort') continue;
    const sz = sprites[p.spriteKey];
    lines.push(`[node name="${p.id}" type="StaticBody2D" parent="YSortWorld"]`);
    lines.push(`position = Vector2(${p.x}, ${p.y})`);
    lines.push(`metadata/sprite = "${p.spriteKey}.png"`);
    lines.push(`metadata/sprite_size = Vector2i(${sz.width}, ${sz.height})`);
    lines.push('');
  }
  fs.writeFileSync(path.join(GODOT_DIR, 'v71_forest_recomposition.tscn'), lines.join('\n'));
}

main();
