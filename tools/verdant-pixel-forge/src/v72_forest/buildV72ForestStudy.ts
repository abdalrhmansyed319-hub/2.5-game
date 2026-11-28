/**
 * VERDANT SIGNAL V7.2 — ISOLATED VISUAL REFINEMENT & REAL GODOT PROJECT BUILDER
 * ==============================================================================
 * Outputs strictly to: game/assets/v72_forest_refinement_study/ (protected by .gdignore)
 * Preserves Milestone 01, v3.0, V4.0, V5.0, V7.0, and V7.1 100% untouched!
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { encodeRGBA8PNG } from '../engine/pngEncoder';
import { createEmptyBuffer, setPixel } from '../engine/pixelBuffer';
import { blitV4 } from '../v4_masterpiece/v4Core';
import { type RGB, digitizeToCraftedPixelArt, hexToRgb } from '../v5_soul/v5PixelEngine';
import { buildPlayableMaraV7Sheet, type MaraDirV7 } from '../v7_immersive/v7PixelAtlas';
import { type RgbaImage } from '../v7_immersive/v7WorldEngine';
import {
  V72_FOREST_MASTER_PALETTE,
  V72_VIEW_H,
  V72_VIEW_W,
  buildV72ForestFloorAndHorizon,
  getV72ForestWorldDef,
  renderV72ForestFrame,
} from './v72ForestEngine';
import { exportV72StandaloneGodotProject } from './v72GodotProjectExporter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const U71 = '/tmp/v71_underlay';
const U72 = '/tmp/v72_underlay';
const OUT_ROOT = path.join(REPO_ROOT, 'game/assets/v72_forest_refinement_study');
const SPRITES_DIR = path.join(OUT_ROOT, 'sprites');
const PROOFS_DIR = path.join(OUT_ROOT, 'proofs');
const PLAYABLE_DIR = path.join(OUT_ROOT, 'playable_web');
const GODOT_PROJ_DIR = path.join(OUT_ROOT, 'godot_project');

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
 * Border flood-fill zero-fringe magenta chroma-key extractor unified onto our
 * 60-color V7.2 Singing Canopy Master Palette. Preserves interior violet fungi,
 * golden orchids & cyan chime-reeds 100% solid while removing all exterior #FF00FF!
 */
function extractV72Sprite(opts: {
  sourcePath: string;
  targetW: number;
  targetH: number;
  tintHex?: string;
  tintAmount?: number;
  darken?: number;
  trimTop?: boolean;
  trimLeft?: boolean;
  trimRight?: boolean;
}): RgbaImage {
  const {
    sourcePath, targetW, targetH,
    tintHex, tintAmount = 0, darken = 0,
    trimTop = false, trimLeft = true, trimRight = true,
  } = opts;
  const full = loadPngRaw(sourcePath);

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

  const mask = new Uint8Array(full.width * full.height);
  for (let i = 0; i < full.width * full.height; i++) {
    if (exterior[i]) continue;
    const r = full.pixels[i * 4];
    const g = full.pixels[i * 4 + 1];
    const b = full.pixels[i * 4 + 2];
    // Strip pure #FF00FF enclosed sky holes between branches/roots while keeping violet shelf-fungi solid!
    if (r > 220 && b > 220 && g < 55) continue;
    mask[i] = 1;
  }

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
  if (!trimLeft) minX = 0;
  if (!trimRight) maxX = full.width - 1;
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
          rSum += full.pixels[idx * 4];
          gSum += full.pixels[idx * 4 + 1];
          bSum += full.pixels[idx * 4 + 2];
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

  const dig = digitizeToCraftedPixelArt(down, targetW, targetH, V72_FOREST_MASTER_PALETTE, {
    ditherThreshold: 0.038,
    ditherStrength: 0.015,
    cleanPasses: 2,
  });

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

const FONT_3X5: Record<string, string[]> = {
  A: ['010', '101', '111', '101', '101'], B: ['110', '101', '110', '101', '110'],
  C: ['011', '100', '100', '100', '011'], D: ['110', '101', '101', '101', '110'],
  E: ['111', '100', '110', '100', '111'], F: ['111', '100', '110', '100', '100'],
  G: ['011', '100', '101', '101', '011'], H: ['101', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'], K: ['101', '101', '110', '101', '101'],
  L: ['100', '100', '100', '100', '111'], M: ['101', '111', '111', '101', '101'],
  N: ['110', '101', '101', '101', '101'], O: ['010', '101', '101', '101', '010'],
  P: ['110', '101', '110', '100', '100'], R: ['110', '101', '110', '101', '101'],
  S: ['011', '100', '010', '001', '110'], T: ['111', '010', '010', '010', '010'],
  U: ['101', '101', '101', '101', '011'], V: ['101', '101', '101', '101', '010'],
  W: ['101', '101', '111', '111', '101'], X: ['101', '101', '010', '101', '101'],
  Y: ['101', '101', '010', '010', '010'], Z: ['111', '001', '010', '100', '111'],
  '0': ['111', '101', '101', '101', '111'], '1': ['010', '110', '010', '010', '111'],
  '2': ['110', '001', '010', '100', '111'], '3': ['110', '001', '010', '001', '110'],
  '4': ['101', '101', '111', '001', '001'], '5': ['111', '100', '110', '001', '110'],
  '6': ['011', '100', '111', '101', '111'], '7': ['111', '001', '010', '010', '010'],
  '8': ['111', '101', '111', '101', '111'], '9': ['111', '101', '111', '001', '110'],
  '.': ['000', '000', '000', '000', '010'], ':': ['000', '010', '000', '010', '000'],
  '-': ['000', '000', '111', '000', '000'], '/': ['001', '001', '010', '100', '100'],
  '(': ['010', '100', '100', '100', '010'], ')': ['010', '001', '001', '001', '010'],
  '+': ['000', '010', '111', '010', '000'], ' ': ['000', '000', '000', '000', '000'],
};

function drawText3x5(buf: Uint8ClampedArray, w: number, h: number, text: string, x0: number, y0: number, col: RGB): void {
  let x = x0;
  for (const ch of text.toUpperCase()) {
    const g = FONT_3X5[ch] ?? FONT_3X5[' '];
    for (let gy = 0; gy < 5; gy++) {
      for (let gx = 0; gx < 3; gx++) {
        if (g[gy][gx] === '1') setPixel(buf, w, h, x + gx, y0 + gy, { ...col, a: 255 });
      }
    }
    x += 4;
  }
}

function main(): void {
  fs.mkdirSync(SPRITES_DIR, { recursive: true });
  fs.mkdirSync(PROOFS_DIR, { recursive: true });
  fs.mkdirSync(PLAYABLE_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_ROOT, '.gdignore'), '# Isolated V7.2 study — excluded from M01 production Godot scan\n');

  console.log('=== VERDANT SIGNAL V7.2 — ARTISTIC REFINEMENT, LIFE & GODOT PROJECT BUILD ===');

  // 1. Extract all 13 handcrafted modular sprite families onto our 60-color V7.2 palette!
  console.log('[1/7] Extracting 5 distinct colossal trunk anatomies, fern skirts, chime-reed focal landmark & canopies...');
  const pStraight = path.join(U71, 'v71_titan_trunk_left.png');
  const pGnarled = path.join(U71, 'v71_titan_trunk_gnarled.png');
  const pButtress = path.join(U71, 'v71_titan_trunk_buttress.png');
  const pBush = path.join(U71, 'v71_dense_undergrowth_bush.png');
  const pCanopy = path.join(U71, 'v71_overhanging_canopy_mass.png');
  const pLog = path.join(U71, 'v71_fallen_moss_root_log.png');
  const pHorizon = path.join(U71, 'v71_distant_horizon_strip.png');
  const pTreeline = path.join(U71, 'v71_distant_treeline_foliage_edge.png');

  // Brand-new V7.2 artistic refinement sprites!
  const pSplitArch = path.join(U72, 'v72_titan_split_hollow_arch.png');
  const pMossPillar = path.join(U72, 'v72_titan_moss_canopy_pillar.png');
  const pFernCluster = path.join(U72, 'v72_lush_fern_clump_cluster.png');
  const pChimeOutcrop = path.join(U72, 'v72_clearing_chime_outcrop.png');
  const pFgBoughFern = path.join(U72, 'v72_foreground_bough_fern_frame.png');
  const pCanopyAlt = path.join(U72, 'v72_canopy_bough_alt.png');

  const treeline_ridge = extractV72Sprite({ sourcePath: pTreeline, targetW: 280, targetH: 92, trimTop: true, tintHex: '#1e5261', tintAmount: 0.22 });
  const treeline_ridge_flip = flipHorizontal(treeline_ridge);

  // 5 Distinct Midground Colossal Trunk Anatomies!
  const titan_straight = extractV72Sprite({ sourcePath: pStraight, targetW: 192, targetH: 288 });
  const titan_straight_tall = extractV72Sprite({ sourcePath: pStraight, targetW: 204, targetH: 312 });
  const titan_gnarled = extractV72Sprite({ sourcePath: pGnarled, targetW: 204, targetH: 284 });
  const titan_gnarled_flip = flipHorizontal(titan_gnarled);
  const titan_buttress = extractV72Sprite({ sourcePath: pButtress, targetW: 224, targetH: 304 });
  const titan_split_arch = extractV72Sprite({ sourcePath: pSplitArch, targetW: 236, targetH: 298 });
  const titan_moss_pillar = extractV72Sprite({ sourcePath: pMossPillar, targetW: 212, targetH: 302 });

  // Atmospheric Cool Blue-Teal Depth-Veiled Rear Perimeter Titans (clear atmospheric separation!)
  const titan_straight_bg = extractV72Sprite({ sourcePath: pStraight, targetW: 162, targetH: 244, tintHex: '#1e5261', tintAmount: 0.42, darken: 0.14 });
  const titan_gnarled_bg = extractV72Sprite({ sourcePath: pGnarled, targetW: 170, targetH: 242, tintHex: '#1e5261', tintAmount: 0.42, darken: 0.14 });
  const titan_buttress_bg = extractV72Sprite({ sourcePath: pButtress, targetW: 184, targetH: 252, tintHex: '#1e5261', tintAmount: 0.40, darken: 0.14 });
  const titan_split_arch_bg = extractV72Sprite({ sourcePath: pSplitArch, targetW: 188, targetH: 246, tintHex: '#1e5261', tintAmount: 0.42, darken: 0.14 });
  const titan_moss_pillar_bg = extractV72Sprite({ sourcePath: pMossPillar, targetW: 176, targetH: 252, tintHex: '#1e5261', tintAmount: 0.42, darken: 0.14 });

  // Tucked Walkable Fern Root-Skirts & Dense Undergrowth Bushes!
  const fern_cluster = extractV72Sprite({ sourcePath: pFernCluster, targetW: 62, targetH: 48, trimTop: true });
  const fern_cluster_flip = flipHorizontal(fern_cluster);
  const fern_cluster_small = extractV72Sprite({ sourcePath: pFernCluster, targetW: 48, targetH: 38, trimTop: true });
  const fern_cluster_small_flip = flipHorizontal(fern_cluster_small);

  const bush_mid = extractV72Sprite({ sourcePath: pBush, targetW: 112, targetH: 82, trimTop: true });
  const bush_mid_dark = extractV72Sprite({ sourcePath: pBush, targetW: 118, targetH: 86, tintHex: '#143b47', tintAmount: 0.30, darken: 0.22, trimTop: true });
  const bush_small_dark = extractV72Sprite({ sourcePath: pBush, targetW: 84, targetH: 62, tintHex: '#143b47', tintAmount: 0.32, darken: 0.24, trimTop: true });
  const bush_fg_huge = extractV72Sprite({ sourcePath: pBush, targetW: 204, targetH: 146, tintHex: '#09241d', tintAmount: 0.28, darken: 0.24, trimTop: true });
  const bush_fg_small_flip = flipHorizontal(extractV72Sprite({ sourcePath: pBush, targetW: 142, targetH: 102, tintHex: '#09241d', tintAmount: 0.28, darken: 0.24, trimTop: true }));

  // NEW Rich Gnarled Moss-Branch & Silhouetted Jungle Fern Foreground Frame!
  const fg_bough_fern = extractV72Sprite({ sourcePath: pFgBoughFern, targetW: 214, targetH: 158, trimTop: true, trimLeft: false, tintHex: '#09241d', tintAmount: 0.18, darken: 0.14 });
  const fg_bough_fern_flip = flipHorizontal(fg_bough_fern);

  // Two Distinct Sweeping Overhanging Canopy Families!
  const canopy_mass = extractV72Sprite({ sourcePath: pCanopy, targetW: 288, targetH: 144, darken: 0.08 });
  const canopy_mass_flip = flipHorizontal(canopy_mass);
  const canopy_mass_wide = extractV72Sprite({ sourcePath: pCanopy, targetW: 328, targetH: 148, darken: 0.12 });
  const canopy_bough_alt = extractV72Sprite({ sourcePath: pCanopyAlt, targetW: 276, targetH: 138, trimTop: true, trimLeft: false, darken: 0.06 });
  const canopy_bough_alt_flip = flipHorizontal(canopy_bough_alt);

  // Giant Fallen Mossy Hollow Log + NEW Deliberate Clearing Focal Outcrop (Mossy Stone + Singing Chime-Reeds + Orchids)!
  const fallen_log = extractV72Sprite({ sourcePath: pLog, targetW: 152, targetH: 96, trimTop: true });
  const fallen_log_flip = flipHorizontal(fallen_log);
  const clearing_chime_outcrop = extractV72Sprite({ sourcePath: pChimeOutcrop, targetW: 94, targetH: 64, trimTop: true });

  const sprites: Record<string, RgbaImage> = {
    treeline_ridge, treeline_ridge_flip,
    titan_straight, titan_straight_tall, titan_gnarled, titan_gnarled_flip,
    titan_buttress, titan_split_arch, titan_moss_pillar,
    titan_straight_bg, titan_gnarled_bg, titan_buttress_bg, titan_split_arch_bg, titan_moss_pillar_bg,
    fern_cluster, fern_cluster_flip, fern_cluster_small, fern_cluster_small_flip,
    bush_mid, bush_mid_dark, bush_small_dark, bush_fg_huge, bush_fg_small_flip,
    fg_bough_fern, fg_bough_fern_flip,
    canopy_mass, canopy_mass_flip, canopy_mass_wide, canopy_bough_alt, canopy_bough_alt_flip,
    fallen_log, fallen_log_flip, clearing_chime_outcrop,
  };

  for (const [key, img] of Object.entries(sprites)) {
    writePng(path.join(SPRITES_DIR, `${key}.png`), img.pixels, img.width, img.height);
  }

  const maraSprites = buildPlayableMaraV7Sheet();
  writePng(path.join(SPRITES_DIR, 'mara_v72_spritesheet.png'), maraSprites.sheetPixels, maraSprites.sheetW, maraSprites.sheetH);

  // 2. Build refined 1440x340 forest floor (with damp root-skirts & bark litter!) + distant cliff horizon
  console.log('[2/7] Building refined painterly 1440x340 forest floor with root-skirt integration & horizon...');
  const world = getV72ForestWorldDef();
  const { floor, horizon, lightMap } = buildV72ForestFloorAndHorizon(world, pHorizon);
  writePng(path.join(SPRITES_DIR, 'forest_floor_1440x340.png'), floor.pixels, floor.width, floor.height);
  writePng(path.join(SPRITES_DIR, 'distant_horizon_640x128.png'), horizon.pixels, horizon.width, horizon.height);

  // 3. Render native 480x270 compositions A, B, C!
  console.log('[3/7] Rendering native 480x270 compositions A (Corridor), B (Deep Interior), C (Clearing)...');
  const frameA = renderV72ForestFrame({
    world, floor, horizon, lightMap, sprites, maraSprites,
    maraX: world.presets.A_corridor.maraX, maraY: world.presets.A_corridor.maraY,
    maraDir: world.presets.A_corridor.dir, maraStep: 0,
    camX: world.presets.A_corridor.camX, camY: world.presets.A_corridor.camY, timeSec: 0.7,
  });
  const frameB = renderV72ForestFrame({
    world, floor, horizon, lightMap, sprites, maraSprites,
    maraX: world.presets.B_interior.maraX, maraY: world.presets.B_interior.maraY,
    maraDir: world.presets.B_interior.dir, maraStep: 1,
    camX: world.presets.B_interior.camX, camY: world.presets.B_interior.camY, timeSec: 1.4,
  });
  const frameC = renderV72ForestFrame({
    world, floor, horizon, lightMap, sprites, maraSprites,
    maraX: world.presets.C_clearing.maraX, maraY: world.presets.C_clearing.maraY,
    maraDir: world.presets.C_clearing.dir, maraStep: 0,
    camX: world.presets.C_clearing.camX, camY: world.presets.C_clearing.camY, timeSec: 2.1,
  });

  writePng(path.join(PROOFS_DIR, 'proof_A_dense_forest_corridor_480x270.png'), frameA.pixels, V72_VIEW_W, V72_VIEW_H);
  writePng(path.join(PROOFS_DIR, 'proof_B_deep_forest_interior_480x270.png'), frameB.pixels, V72_VIEW_W, V72_VIEW_H);
  writePng(path.join(PROOFS_DIR, 'proof_C_forest_clearing_480x270.png'), frameC.pixels, V72_VIEW_W, V72_VIEW_H);

  // 4. Build UNSCALED 1x V7.1 vs V7.2 3-ROW COMPARISON SHEET (exact 480x270 per panel — ZERO enlargement!)
  console.log('[4/7] Assembling unscaled 1x native V7.1 vs V7.2 comparison sheet...');
  const v71ProofDir = path.join(REPO_ROOT, 'game/assets/v71_forest_recomposition_study/proofs');
  const v71A = loadPngRaw(path.join(v71ProofDir, 'proof_A_dense_forest_corridor_480x270.png'));
  const v71B = loadPngRaw(path.join(v71ProofDir, 'proof_B_deep_forest_interior_480x270.png'));
  const v71C = loadPngRaw(path.join(v71ProofDir, 'proof_C_forest_clearing_480x270.png'));

  const PAD = 8, HEADER = 16;
  const CW = PAD * 3 + V72_VIEW_W * 2;
  const CH = PAD * 4 + HEADER * 3 + V72_VIEW_H * 3;
  const comp = createEmptyBuffer(CW, CH);
  const bgDark = hexToRgb('#091314');
  for (let i = 0; i < CW * CH; i++) {
    comp[i * 4] = bgDark.r; comp[i * 4 + 1] = bgDark.g; comp[i * 4 + 2] = bgDark.b; comp[i * 4 + 3] = 255;
  }

  const rows: Array<{ leftLabel: string; rightLabel: string; leftPx: Uint8ClampedArray; rightPx: Uint8ClampedArray }> = [
    {
      leftLabel: 'V7.1 BASELINE A: DENSE CORRIDOR (480X270 1X)',
      rightLabel: 'V7.2 REFINED A: SPLIT ARCH TITAN + FERNS + BOUGH (480X270 1X)',
      leftPx: v71A.pixels, rightPx: frameA.pixels,
    },
    {
      leftLabel: 'V7.1 BASELINE B: DEEP INTERIOR (480X270 1X)',
      rightLabel: 'V7.2 REFINED B: 5 TRUNK ANATOMIES + FERN SKIRTS (480X270 1X)',
      leftPx: v71B.pixels, rightPx: frameB.pixels,
    },
    {
      leftLabel: 'V7.1 BASELINE C: FOREST CLEARING (480X270 1X)',
      rightLabel: 'V7.2 REFINED C: CHIME-REED FOCAL OUTCROP + FERNS (480X270 1X)',
      leftPx: v71C.pixels, rightPx: frameC.pixels,
    },
  ];
  rows.forEach((row, rIdx) => {
    const y0 = PAD + rIdx * (PAD + HEADER + V72_VIEW_H);
    drawText3x5(comp, CW, CH, row.leftLabel, PAD + 2, y0 + 5, hexToRgb('#94c2bd'));
    blitV4(comp, CW, CH, row.leftPx, V72_VIEW_W, V72_VIEW_H, PAD, y0 + HEADER);
    drawText3x5(comp, CW, CH, row.rightLabel, PAD * 2 + V72_VIEW_W + 2, y0 + 5, hexToRgb('#ffe573'));
    blitV4(comp, CW, CH, row.rightPx, V72_VIEW_W, V72_VIEW_H, PAD * 2 + V72_VIEW_W, y0 + HEADER);
  });
  writePng(path.join(PROOFS_DIR, 'comparison_V71_vs_V72_native_1x.png'), comp, CW, CH);

  // 5. Render 36-frame ENVIRONMENTAL LIFE LOOP GIF (Zone C Living Forest — sway, ripples, falling leaves, chime spores, light!)
  console.log('[5/7] Rendering 36-frame native 480x270 Environmental Life Loop GIF...');
  const tmpLife = '/tmp/v72_life_frames';
  fs.rmSync(tmpLife, { recursive: true, force: true });
  fs.mkdirSync(tmpLife, { recursive: true });
  const LIFE_FRAMES = 36;
  const lifeFiles: string[] = [];
  for (let f = 0; f < LIFE_FRAMES; f++) {
    const tSec = (f / LIFE_FRAMES) * 5.4;
    const r = renderV72ForestFrame({
      world, floor, horizon, lightMap, sprites, maraSprites,
      maraX: world.presets.C_clearing.maraX, maraY: world.presets.C_clearing.maraY,
      maraDir: 'up', maraStep: 0,
      camX: world.presets.C_clearing.camX, camY: world.presets.C_clearing.camY,
      timeSec: tSec,
    });
    const fp = path.join(tmpLife, `life_${String(f).padStart(3, '0')}.png`);
    writePng(fp, r.pixels, V72_VIEW_W, V72_VIEW_H);
    lifeFiles.push(fp);
  }
  execFileSync('convert', ['-delay', '12', '-loop', '0', ...lifeFiles, '-layers', 'Optimize', path.join(PROOFS_DIR, 'proof_D_environmental_life_loop_480x270.gif')], {
    stdio: 'inherit',
  });

  // 6. Render 80-frame CONTINUOUS PLAYABLE WALKTHROUGH GIF (all 8 test scenarios + refined natural occlusion!)
  console.log('[6/7] Rendering 80-frame native 480x270 Playable Walkthrough GIF (A -> B -> C with refined occlusion)...');
  const tmpWalk = '/tmp/v72_walk_frames';
  fs.rmSync(tmpWalk, { recursive: true, force: true });
  fs.mkdirSync(tmpWalk, { recursive: true });

  const waypoints: Array<[number, number]> = [
    [224, 278], // Corridor start near sunlit puddle (puddle ripple test!)
    [264, 256], // Narrow corridor between roots & ferns
    [368, 254], // Walking cleanly BEHIND close front-right Split Hollow Arch titan (refined natural occlusion!)
    [474, 256], // Passing A->B gateway
    [548, 256], // Walking BEHIND close Zone B left Buttress titan
    [676, 264], // Walking in front of Fallen Hollow Log in glowing dappled Zone B heart
    [796, 252], // Weaving BEHIND Zone B front-center Moss Pillar titan
    [912, 248], // Threading through dense vegetation & B->C shaded throat
    [1068, 260], // Emerging from deep forest into sunlit clearing!
    [1192, 272], // Arriving beside pools facing the glowing Chime-Reed focal outcrop!
  ];
  const segLens: number[] = [];
  let totalLen = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const d = Math.hypot(waypoints[i + 1][0] - waypoints[i][0], waypoints[i + 1][1] - waypoints[i][1]);
    segLens.push(d);
    totalLen += d;
  }

  const WALK_FRAMES = 80;
  const walkFiles: string[] = [];
  let camX = 0, camY = 42;
  let maxOccludedPx = 0;
  let bestOccFrame = 0;

  for (let f = 0; f < WALK_FRAMES; f++) {
    const uGlob = f / (WALK_FRAMES - 1);
    let dist = uGlob * totalLen;
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

    const tCamX = Math.max(0, Math.min(world.worldW - V72_VIEW_W, mx - V72_VIEW_W * 0.48));
    const tCamY = Math.max(24, Math.min(world.worldH - V72_VIEW_H, my - V72_VIEW_H * 0.78));
    camX = f === 0 ? tCamX : camX + (tCamX - camX) * 0.18;
    camY = f === 0 ? tCamY : camY + (tCamY - camY) * 0.16;

    const r = renderV72ForestFrame({
      world, floor, horizon, lightMap, sprites, maraSprites,
      maraX: mx, maraY: my, maraDir: dir, maraStep: Math.floor(f / 2) % 4,
      camX, camY, timeSec: f * 0.11,
    });
    if (r.occludedPixels > maxOccludedPx) {
      maxOccludedPx = r.occludedPixels;
      bestOccFrame = f;
    }
    const fp = path.join(tmpWalk, `walk_${String(f).padStart(3, '0')}.png`);
    writePng(fp, r.pixels, V72_VIEW_W, V72_VIEW_H);
    walkFiles.push(fp);
  }
  // Also save the sharpest walk-behind occlusion frame as a standalone native 480x270 still for direct inspection!
  fs.copyFileSync(
    path.join(tmpWalk, `walk_${String(bestOccFrame).padStart(3, '0')}.png`),
    path.join(PROOFS_DIR, 'proof_F_natural_occlusion_readability_480x270.png')
  );
  console.log(`   Walkthrough peak occlusion overlap: ${maxOccludedPx} px at frame ${bestOccFrame} (natural ordered-dither peek — ZERO neon cyan glow!)`);

  execFileSync('convert', ['-delay', '9', '-loop', '0', ...walkFiles, '-layers', 'Optimize', path.join(PROOFS_DIR, 'proof_E_playable_walkthrough_A_to_C_480x270.gif')], {
    stdio: 'inherit',
  });

  // 7. Export the 100% REAL STANDALONE GODOT 4.7.2 PROJECT + supplementary interactive browser preview!
  console.log('[7/7] Exporting 100% real standalone Godot 4.7.2 project & supplementary browser playable preview...');
  const godotStats = exportV72StandaloneGodotProject({
    godotProjectDir: GODOT_PROJ_DIR,
    sourceSpritesDir: SPRITES_DIR,
    world,
    sprites,
  });
  console.log(
    `   Godot 4.7.2 scene wired: ${godotStats.extResourceCount} ExtResources | ${godotStats.subResourceCount} SubResources | ` +
    `${godotStats.spriteNodeCount} textured Sprite2D nodes | ${godotStats.solidColliderCount} solid StaticBody2D+CollisionShape2D obstacles`
  );

  emitSupplementaryBrowserPreview(world, sprites);
  console.log('=== V7.2 FOREST REFINEMENT & REAL GODOT PROJECT BUILD COMPLETE ===');
}

function emitSupplementaryBrowserPreview(
  world: ReturnType<typeof getV72ForestWorldDef>,
  sprites: Record<string, RgbaImage>
): void {
  const manifest = {
    version: 'V7.2',
    viewW: V72_VIEW_W,
    viewH: V72_VIEW_H,
    worldW: world.worldW,
    worldH: world.worldH,
    walkBounds: world.walkBounds,
    presets: world.presets,
    puddles: world.puddles,
    spriteSizes: Object.fromEntries(Object.entries(sprites).map(([k, v]) => [k, { w: v.width, h: v.height }])),
    props: world.props,
  };
  fs.writeFileSync(path.join(PLAYABLE_DIR, 'v72_forest_manifest.json'), JSON.stringify(manifest, null, 2));

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VERDANT SIGNAL V7.2 — Forest Refinement &amp; Environmental Life Preview (480x270 Native)</title>
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
    button.active { background: #266b64; color: #fff; border-color: #ffe573; }
    .stage {
      border: 2px solid #264d4a; background: #040b0b; line-height: 0;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.7);
    }
    canvas { display: block; image-rendering: pixelated; image-rendering: crisp-edges; }
    .hud { font-size: 11px; color: #9ec9c4; text-align: center; max-width: 960px; line-height: 1.45; }
  </style>
</head>
<body>
  <div class="bar">
    <strong>VERDANT SIGNAL V7.2 — SUPPLEMENTARY BROWSER PREVIEW</strong>
    <button id="btnA" class="active">1: A. Corridor</button>
    <button id="btnB">2: B. Deep Interior</button>
    <button id="btnC">3: C. Clearing</button>
    <button id="btnOcc">4: Behind Trunk</button>
    <button id="btnAuto">Auto-Walk (A→C)</button>
    <button id="btn1x">1x Native (480×270)</button>
    <button id="btn2x" class="active">2x Integer (960×540)</button>
  </div>
  <div class="stage">
    <canvas id="game" width="480" height="270" style="width:960px;height:540px;"></canvas>
  </div>
  <div class="hud" id="status">
    WASD / Arrows to walk · Keys 1/2/3 jump zones · Note: Browser preview only — real Godot 4.7.2 project lives in ../godot_project/
  </div>
  <script>
    (async () => {
      const manifest = await (await fetch('./v72_forest_manifest.json')).json();
      const loadImg = (src) => new Promise((res, rej) => {
        const img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = src;
      });
      const floorImg = await loadImg('../sprites/forest_floor_1440x340.png');
      const horizonImg = await loadImg('../sprites/distant_horizon_640x128.png');
      const maraSheet = await loadImg('../sprites/mara_v72_spritesheet.png');
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
        ['btnA','btnB','btnC','btnOcc'].forEach(id => document.getElementById(id).classList.remove('active'));
        if (key === 'A_corridor') document.getElementById('btnA').classList.add('active');
        if (key === 'B_interior') document.getElementById('btnB').classList.add('active');
        if (key === 'C_clearing') document.getElementById('btnC').classList.add('active');
      };

      document.getElementById('btnA').onclick = () => snapPreset('A_corridor');
      document.getElementById('btnB').onclick = () => snapPreset('B_interior');
      document.getElementById('btnC').onclick = () => snapPreset('C_clearing');
      document.getElementById('btnOcc').onclick = () => {
        autoWalk = false; mara.x = 382; mara.y = 256; mara.dir = 'right';
        ['btnA','btnB','btnC'].forEach(id => document.getElementById(id).classList.remove('active'));
        document.getElementById('btnOcc').classList.add('active');
      };
      document.getElementById('btnAuto').onclick = () => { autoWalk = !autoWalk; };
      document.getElementById('btn1x').onclick = () => setZoom(1);
      document.getElementById('btn2x').onclick = () => setZoom(2);

      window.addEventListener('keydown', (e) => {
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
        if (e.key === '1') snapPreset('A_corridor');
        else if (e.key === '2') snapPreset('B_interior');
        else if (e.key === '3') snapPreset('C_clearing');
        else if (e.key === '4') document.getElementById('btnOcc').click();
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

      // Subtle per-prop sway draw (slices sprite cleanly in 4 horizontal bands for crisp pixel bend!)
      const drawSwayProp = (img, dx, dy, p, tSec) => {
        if (!p.swayKind || p.swayKind === 'none' || p.swayKind === 'chime' || !p.swayAmp) {
          ctx.drawImage(img, dx, dy);
          return;
        }
        const gust = 0.68 + 0.32 * Math.sin(tSec * 0.55 - p.x * 0.011);
        const wave = Math.sin(tSec * (p.swaySpeed || 0.8) + (p.swayPhase || 0)) * p.swayAmp * gust;
        const bands = 6;
        const bh = Math.ceil(img.height / bands);
        for (let b = 0; b < bands; b++) {
          const sy = b * bh;
          const sh = Math.min(bh, img.height - sy);
          if (sh <= 0) continue;
          const u = b / (bands - 1);
          const weight = p.swayKind === 'canopy' ? (0.22 + 0.78 * u) : Math.pow(1 - u, 2);
          const shift = Math.round(wave * weight);
          ctx.drawImage(img, 0, sy, img.width, sh, dx + shift, dy + sy, img.width, sh);
        }
      };

      const route = [
        [224,278],[264,256],[368,254],[474,256],[548,256],
        [676,264],[796,252],[912,248],[1068,260],[1192,272]
      ];
      let lastT = performance.now();
      let stepAcc = 0;
      const startT = lastT;

      function tick(now) {
        const dt = Math.min(0.05, (now - lastT) / 1000);
        const tSec = (now - startT) / 1000;
        lastT = now;

        let vx = 0, vy = 0;
        if (autoWalk) {
          autoPhase = (autoPhase + dt * 0.082) % 1;
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
        // Plane 0: Horizon (0.22x)
        const hx = Math.round((ix * 0.22) % (horizonImg.width - 480));
        ctx.drawImage(horizonImg, hx, 0, 480, horizonImg.height, 0, 0, 480, horizonImg.height);
        // Plane 1A: Forest Floor
        ctx.drawImage(floorImg, ix, iy, 480, 270, 0, 0, 480, 270);

        // Environmental Life: Subtle expanding puddle ripples
        ctx.strokeStyle = 'rgba(220,249,255,0.58)';
        ctx.lineWidth = 1;
        for (const pud of manifest.puddles) {
          const cyc = ((tSec / pud.ripplePeriod) + pud.ripplePhase) % 1;
          if (cyc < 0.55) {
            const u = cyc / 0.55;
            ctx.beginPath();
            ctx.ellipse(Math.round(pud.x - ix), Math.round(pud.y - iy), 2 + u * 11, 1 + u * 4, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // Plane 1B: Treeline ridge
        for (const p of manifest.props) {
          if (p.layer !== 'treeline') continue;
          const img = sprites[p.spriteKey];
          ctx.drawImage(img, Math.round(p.x - ix - img.width / 2), Math.round(p.y - iy - img.height));
        }

        // Plane 2: Rear Titans
        const bg = manifest.props.filter(p => p.layer === 'bg_titan').sort((a, b) => a.y - b.y);
        for (const p of bg) {
          const img = sprites[p.spriteKey];
          drawSwayProp(img, Math.round(p.x - ix - img.width / 2), Math.round(p.y - iy - img.height), p, tSec);
        }

        // Plane 3: Y-Sorted Colossal Trunks, Ferns, Outcrop & Mara
        const ys = manifest.props.filter(p => p.layer === 'ysort').map(p => ({ kind: 'prop', y: p.y, p }));
        ys.push({ kind: 'mara', y: mara.y });
        ys.sort((a, b) => a.y - b.y);
        let maraDrawn = false, occluded = false;
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
            drawSwayProp(img, dx, dy, item.p, tSec);
            if (maraDrawn && mDx + 20 > dx + 26 && mDx + 8 < dx + img.width - 26 && mDy + 34 > dy && mDy < dy + img.height) {
              occluded = true;
            }
          }
        }

        // Subtle falling leaves & chime-reed spores
        for (let i = 0; i < 10; i++) {
          const period = 7.0 + (i % 4) * 1.1;
          const u = ((tSec / period) + i * 0.13) % 1;
          const lx = Math.round(((i * 137 + 80) % 1360) + Math.sin(u * 9 + i) * 12 - ix);
          const ly = Math.round(44 + u * 235 - iy);
          if (lx >= 0 && lx < 480 && ly >= 0 && ly < 270) {
            ctx.fillStyle = (i & 1) ? '#e8a05a' : '#c9783c';
            ctx.fillRect(lx, ly, 2, 1);
          }
        }
        for (let i = 0; i < 6; i++) {
          const u = ((tSec / 3.8) + i * 0.17) % 1;
          const sx = Math.round(1244 + Math.sin(tSec * 1.4 + i * 2) * 8 - ix);
          const sy = Math.round(206 - u * 26 - iy);
          if (sx >= 0 && sx < 480 && sy >= 0 && sy < 270) {
            ctx.fillStyle = 'rgba(148,245,238,' + (Math.sin(u * Math.PI) * 0.85).toFixed(2) + ')';
            ctx.fillRect(sx, sy, 1, 1);
          }
        }

        // Plane 4 & 5: Overhang + Foreground Parallax
        for (const layerName of ['overhang', 'foreground']) {
          for (const p of manifest.props) {
            if (p.layer !== layerName) continue;
            const img = sprites[p.spriteKey];
            const pf = p.parallax || (layerName === 'foreground' ? 1.15 : 1.05);
            const anchor = p.anchorCamX || 0;
            const dx = Math.round(p.x - ix - (ix - anchor) * (pf - 1));
            const dy = Math.round(p.y - iy);
            drawSwayProp(img, dx, dy, p, tSec);
            if (layerName === 'foreground' && mDx + 20 > dx + 18 && mDx + 8 < dx + img.width - 18 && mDy + 34 > dy + 16 && mDy < dy + img.height) {
              occluded = true;
            }
          }
        }

        // Refined natural silhouette peek (NO neon cyan glow!)
        if (occluded) {
          ctx.save();
          ctx.globalAlpha = 0.42;
          ctx.drawImage(maraSheet, mara.step * 28, dirRow[mara.dir] * 40, 28, 40, mDx, mDy, 28, 40);
          ctx.restore();
        }

        const zone = mara.x < 480 ? 'A. Dense Corridor' : mara.x < 960 ? 'B. Deep Interior' : 'C. Sunlit Clearing';
        statusEl.textContent = 'Zone: ' + zone + ' | Mara=(' + Math.round(mara.x) + ',' + Math.round(mara.y) + ') | Cam=(' + ix + ',' + iy + ') | Browser preview only — Real Godot 4.7.2 project in ../godot_project/';
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
    '<!doctype html><html><head><meta http-equiv="refresh" content="0; url=./playable_web/index.html" /></head><body><a href="./playable_web/index.html">Open V7.2 Supplementary Browser Preview</a></body></html>\n'
  );
}

main();
