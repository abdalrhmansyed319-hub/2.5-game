/**
 * VERDANT SIGNAL V7.3 — CONTINUOUS OPEN-WORLD PLAYABILITY & GODOT 4.7.2 BUILDER
 * ==============================================================================
 * Outputs strictly to: game/assets/v73_open_world_playability_study/ (.gdignore)
 * Preserves M01, production game/project.godot, v3.0, V4.0, V5.0, V7.0, V7.1 & V7.2 100% untouched!
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { encodeRGBA8PNG } from '../engine/pngEncoder';
import { createEmptyBuffer, setPixel } from '../engine/pixelBuffer';
import { blitV4 } from '../v4_masterpiece/v4Core';
import { type RGB, digitizeToCraftedPixelArt, hexToRgb } from '../v5_soul/v5PixelEngine';
import { type RgbaImage } from '../v7_immersive/v7WorldEngine';
import {
  V73_CHAR_FRAME_H,
  V73_CHAR_FRAME_W,
  V73_MASTER_PALETTE,
  V73_RUN_SPEED,
  V73_VIEW_H,
  V73_VIEW_W,
  V73_WALK_SPEED,
  type V73AnimState,
  type V73CardinalDir,
  type V73CharacterAtlas,
  buildV73ContinuousForestFloor,
  evaluateV73Movement,
  getV73OpenWorldDef,
  renderV73OpenWorldFrame,
} from './v73OpenWorldEngine';
import { exportV73StandaloneGodotProject } from './v73GodotProjectExporter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const U71 = '/tmp/v71_underlay';
const U72 = '/tmp/v72_underlay';
const U73 = '/tmp/v73_underlay';

const OUT_ROOT = path.join(REPO_ROOT, 'game/assets/v73_open_world_playability_study');
const CHAR_SRC_EXTRACTED = path.join(OUT_ROOT, 'character_source_original/extracted/Idle');
const SPRITES_DIR = path.join(OUT_ROOT, 'sprites');
const PROOFS_DIR = path.join(OUT_ROOT, 'proofs');
const PLAYABLE_DIR = path.join(OUT_ROOT, 'playable_web');
const GODOT_PROJ_DIR = path.join(OUT_ROOT, 'godot_project');

function writePng(filePath: string, pixels: Uint8ClampedArray, width: number, height: number): void {
  fs.writeFileSync(filePath, encodeRGBA8PNG(pixels, width, height));
}

function loadPngRaw(filePath: string): RgbaImage {
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
 * Loads the user's UNMODIFIED 88x88 character animation frames verbatim (ZERO resizing,
 * ZERO recoloring, ZERO cropping!) and packs lossless 8x4 (704x352) strips for Godot/web.
 */
function loadUnmodifiedCharacterAtlas(): { atlas: V73CharacterAtlas; report: Record<string, unknown> } {
  const animMap: Record<V73AnimState, string> = {
    idle: 'Idle',
    walking: 'Walking',
    running: 'Running',
  };
  const dirs: V73CardinalDir[] = ['south', 'north', 'east', 'west'];
  const frames: V73CharacterAtlas['frames'] = {
    idle: { south: [], north: [], east: [], west: [] },
    walking: { south: [], north: [], east: [], west: [] },
    running: { south: [], north: [], east: [], west: [] },
  };

  for (const state of ['idle', 'walking', 'running'] as V73AnimState[]) {
    const stripW = V73_CHAR_FRAME_W * 8;
    const stripH = V73_CHAR_FRAME_H * 4;
    const strip = createEmptyBuffer(stripW, stripH);

    dirs.forEach((dir, rowIdx) => {
      const dirPath = path.join(CHAR_SRC_EXTRACTED, 'animations', animMap[state], dir);
      const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.png')).sort();
      if (files.length !== 8) {
        throw new Error(`Expected 8 frames in ${dirPath}, found ${files.length}`);
      }
      files.forEach((fn, colIdx) => {
        const img = loadPngRaw(path.join(dirPath, fn));
        if (img.width !== V73_CHAR_FRAME_W || img.height !== V73_CHAR_FRAME_H) {
          throw new Error(`Unexpected frame dimensions in ${fn}: ${img.width}x${img.height}`);
        }
        frames[state][dir].push(img);
        // Copy exact unmodified RGBA bytes into 88x88 cell (ZERO pixel alteration!)
        const ox = colIdx * V73_CHAR_FRAME_W;
        const oy = rowIdx * V73_CHAR_FRAME_H;
        for (let y = 0; y < V73_CHAR_FRAME_H; y++) {
          const srcOff = y * V73_CHAR_FRAME_W * 4;
          const dstOff = ((oy + y) * stripW + ox) * 4;
          strip.set(img.pixels.subarray(srcOff, srcOff + V73_CHAR_FRAME_W * 4), dstOff);
        }
      });
    });

    writePng(path.join(SPRITES_DIR, `char_${state}_88x88_8x4.png`), strip, stripW, stripH);
  }

  return {
    atlas: { frames },
    report: {
      sourceZip: 'character_source_original/A_highly_detailed_full-body_pixel_121240.zip',
      preservedVerbatim: true,
      animationFrameSize: '88x88',
      staticRotationFrameSize: '64x64',
      staticRotationDirections: ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'],
      animatedDirectionsPresent: ['south', 'north', 'east', 'west'],
      missingAnimatedDirections: ['south-east', 'north-east', 'north-west', 'south-west'],
      movementAnimationsIntegrated: ['Idle (8f x 4 dirs)', 'Walking (8f x 4 dirs)', 'Running (8f x 4 dirs)'],
      additionalArchivedActionAnimations: 10,
    },
  };
}

/**
 * Border BFS zero-fringe chroma-key extractor unified onto our 60-color V7.2/V7.3 palette.
 * Adds optional 2px transparent safety margin when enforceUncropped=true so interior modular
 * props NEVER touch sprite borders!
 */
function extractV73Sprite(opts: {
  sourcePath: string;
  targetW: number;
  targetH: number;
  subCropFrac?: { x0: number; x1: number; y0: number; y1: number };
  tintHex?: string;
  tintAmount?: number;
  darken?: number;
  padPx?: number;
  trimTop?: boolean;
}): RgbaImage {
  const {
    sourcePath, targetW, targetH, subCropFrac,
    tintHex, tintAmount = 0, darken = 0, padPx = 2, trimTop = true,
  } = opts;
  const full = loadPngRaw(sourcePath);

  const rx0 = subCropFrac ? Math.floor(full.width * subCropFrac.x0) : 0;
  const rx1 = subCropFrac ? Math.ceil(full.width * subCropFrac.x1) : full.width;
  const ry0 = subCropFrac ? Math.floor(full.height * subCropFrac.y0) : 0;
  const ry1 = subCropFrac ? Math.ceil(full.height * subCropFrac.y1) : full.height;
  const rw = rx1 - rx0;
  const rh = ry1 - ry0;

  const isBg = new Uint8Array(rw * rh);
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      const si = ((ry0 + y) * full.width + (rx0 + x)) * 4;
      const r = full.pixels[si], g = full.pixels[si + 1], b = full.pixels[si + 2], a = full.pixels[si + 3];
      if (a < 128 || (Math.min(r, b) - g > 46 && r > 135 && b > 135)) {
        isBg[y * rw + x] = 1;
      }
    }
  }

  const exterior = new Uint8Array(rw * rh);
  const queue = new Int32Array(rw * rh);
  let qHead = 0, qTail = 0;
  const enq = (idx: number) => {
    if (!exterior[idx] && isBg[idx]) { exterior[idx] = 1; queue[qTail++] = idx; }
  };
  for (let x = 0; x < rw; x++) { enq(x); enq((rh - 1) * rw + x); }
  for (let y = 0; y < rh; y++) { enq(y * rw); enq(y * rw + (rw - 1)); }
  while (qHead < qTail) {
    const idx = queue[qHead++];
    const x = idx % rw;
    const y = (idx - x) / rw;
    if (x > 0) enq(idx - 1);
    if (x < rw - 1) enq(idx + 1);
    if (y > 0) enq(idx - rw);
    if (y < rh - 1) enq(idx + rw);
  }

  const mask = new Uint8Array(rw * rh);
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      const idx = y * rw + x;
      if (exterior[idx]) continue;
      const si = ((ry0 + y) * full.width + (rx0 + x)) * 4;
      if (full.pixels[si] > 220 && full.pixels[si + 2] > 220 && full.pixels[si + 1] < 55) continue;
      mask[idx] = 1;
    }
  }

  // 1px magenta halo erosion on boundary pixels only
  const maskClean = new Uint8Array(mask);
  for (let y = 1; y < rh - 1; y++) {
    for (let x = 1; x < rw - 1; x++) {
      const idx = y * rw + x;
      if (!mask[idx]) continue;
      if (!mask[idx - 1] || !mask[idx + 1] || !mask[idx - rw] || !mask[idx + rw]) {
        const si = ((ry0 + y) * full.width + (rx0 + x)) * 4;
        if (Math.min(full.pixels[si], full.pixels[si + 2]) - full.pixels[si + 1] > 24 && full.pixels[si] > 110 && full.pixels[si + 2] > 110) {
          maskClean[idx] = 0;
        }
      }
    }
  }

  let minX = rw, minY = rh, maxX = -1, maxY = -1;
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      if (maskClean[y * rw + x]) {
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

  const innerW = Math.max(1, targetW - padPx * 2);
  const innerH = Math.max(1, targetH - (trimTop ? padPx * 2 : padPx));
  const tintRgb = tintHex ? hexToRgb(tintHex) : null;
  const down = createEmptyBuffer(targetW, targetH);

  for (let ty = 0; ty < innerH; ty++) {
    const sy0 = minY + Math.floor((ty * cropH) / innerH);
    const sy1 = Math.min(maxY + 1, minY + Math.max(Math.floor(((ty + 1) * cropH) / innerH), sy0 - minY + 1));
    for (let tx = 0; tx < innerW; tx++) {
      const sx0 = minX + Math.floor((tx * cropW) / innerW);
      const sx1 = Math.min(maxX + 1, minX + Math.max(Math.floor(((tx + 1) * cropW) / innerW), sx0 - minX + 1));
      let rSum = 0, gSum = 0, bSum = 0, fg = 0, tot = 0;
      for (let sy = sy0; sy < sy1; sy++) {
        for (let sx = sx0; sx < sx1; sx++) {
          tot++;
          const idx = sy * rw + sx;
          if (!maskClean[idx]) continue;
          const si = ((ry0 + sy) * full.width + (rx0 + sx)) * 4;
          rSum += full.pixels[si];
          gSum += full.pixels[si + 1];
          bSum += full.pixels[si + 2];
          fg++;
        }
      }
      if (fg >= Math.max(1, tot * 0.44)) {
        let r = rSum / fg, g = gSum / fg, b = bSum / fg;
        if (darken > 0) { r *= 1 - darken; g *= 1 - darken * 0.85; b *= 1 - darken * 0.65; }
        if (tintRgb && tintAmount > 0) {
          r = r * (1 - tintAmount) + tintRgb.r * tintAmount;
          g = g * (1 - tintAmount) + tintRgb.g * tintAmount;
          b = b * (1 - tintAmount) + tintRgb.b * tintAmount;
        }
        const outX = tx + padPx;
        const outY = ty + (trimTop ? padPx : 0);
        setPixel(down, targetW, targetH, outX, outY, {
          r: Math.max(0, Math.min(255, Math.round(r))),
          g: Math.max(0, Math.min(255, Math.round(g))),
          b: Math.max(0, Math.min(255, Math.round(b))),
          a: 255,
        });
      }
    }
  }

  const dig = digitizeToCraftedPixelArt(down, targetW, targetH, V73_MASTER_PALETTE, {
    ditherThreshold: 0.036,
    ditherStrength: 0.015,
    cleanPasses: 2,
  });

  for (let i = 0; i < targetW * targetH; i++) {
    if (down[i * 4 + 3] < 128) {
      dig.pixels[i * 4] = 0; dig.pixels[i * 4 + 1] = 0; dig.pixels[i * 4 + 2] = 0; dig.pixels[i * 4 + 3] = 0;
    } else {
      dig.pixels[i * 4 + 3] = 255;
    }
  }

  return { pixels: dig.pixels, width: targetW, height: targetH };
}

function verifyUncropped4Sides(name: string, img: RgbaImage): void {
  let borderOpaque = 0;
  for (let x = 0; x < img.width; x++) {
    if (img.pixels[x * 4 + 3] >= 128) borderOpaque++;
    if (img.pixels[((img.height - 1) * img.width + x) * 4 + 3] >= 128) borderOpaque++;
  }
  for (let y = 0; y < img.height; y++) {
    if (img.pixels[(y * img.width) * 4 + 3] >= 128) borderOpaque++;
    if (img.pixels[(y * img.width + (img.width - 1)) * 4 + 3] >= 128) borderOpaque++;
  }
  if (borderOpaque > 0) {
    throw new Error(`Sprite "${name}" has ${borderOpaque} opaque border pixels — violates zero-cut-edge rule!`);
  }
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
  '-': ['000', '000', '111', '000', '000'], '+': ['000', '010', '111', '010', '000'],
  '(': ['010', '100', '100', '100', '010'], ')': ['010', '001', '001', '001', '010'],
  ' ': ['000', '000', '000', '000', '000'],
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
  fs.writeFileSync(path.join(OUT_ROOT, '.gdignore'), '# Isolated V7.3 open-world playability study — excluded from production Godot scan\n');

  console.log('=== VERDANT SIGNAL V7.3 — CONTINUOUS OPEN-WORLD FOREST & GODOT 4.7.2 BUILD ===');

  // 1. Load UNMODIFIED supplied astronaut frames verbatim!
  console.log('[1/8] Loading UNMODIFIED 88x88 supplied character animations (Idle, Walking, Running x 4 cardinals)...');
  const { atlas: charAtlas, report: charReport } = loadUnmodifiedCharacterAtlas();
  fs.writeFileSync(path.join(OUT_ROOT, 'character_inspection_manifest.json'), JSON.stringify(charReport, null, 2));

  // 2. Extract complete-silhouette modular open-world sprites & verify zero cropped interior borders!
  console.log('[2/8] Extracting complete-silhouette open-world canopies, full trees, root arch, rocks, hollow log & landmarks...');

  // Complete uncropped overhead canopy crowns (100% alpha=0 on ALL 4 SIDES!)
  const crown_dome_a = extractV73Sprite({ sourcePath: path.join(U73, 'v73_complete_crown_dome_a.png'), targetW: 316, targetH: 186, padPx: 4 });
  const crown_wide_b = extractV73Sprite({ sourcePath: path.join(U73, 'v73_complete_crown_wide_b.png'), targetW: 324, targetH: 184, padPx: 4 });
  const crown_wide_b_flip = flipHorizontal(crown_wide_b);

  // Complete uncropped full-height standalone trees (100% alpha=0 on ALL 4 SIDES!)
  const full_tree_rock = extractV73Sprite({ sourcePath: path.join(U73, 'v73_complete_full_tree_b.png'), targetW: 268, targetH: 234, padPx: 4 });
  const full_tree_rock_flip = flipHorizontal(full_tree_rock);
  const full_tree_redwood = extractV73Sprite({ sourcePath: path.join(U73, 'v73_complete_full_tree_c.png'), targetW: 214, targetH: 296, padPx: 4 });
  const full_tree_redwood_flip = flipHorizontal(full_tree_redwood);

  // Broad ancient buttress tree base (always paired with crown_dome_a!)
  const full_tree_broad_base = extractV73Sprite({ sourcePath: path.join(U73, 'v73_complete_full_tree_a.png'), targetW: 292, targetH: 248, trimTop: false, padPx: 3 });

  // Complete uncropped exposed root arch, mossy boulder cluster, hollow fallen log & landmarks!
  const root_arch = extractV73Sprite({ sourcePath: path.join(U73, 'v73_complete_exposed_root_arch_clean.png'), targetW: 216, targetH: 132, padPx: 4 });
  const root_arch_flip = flipHorizontal(root_arch);
  const mossy_boulder_cluster = extractV73Sprite({ sourcePath: path.join(U73, 'v73_complete_mossy_rock_cluster.png'), targetW: 152, targetH: 112, padPx: 4 });
  const mossy_boulder_cluster_flip = flipHorizontal(mossy_boulder_cluster);
  const mossy_boulder_small = extractV73Sprite({ sourcePath: path.join(U73, 'v73_complete_mossy_rock_cluster.png'), targetW: 98, targetH: 74, padPx: 4 });
  const mossy_boulder_small_flip = flipHorizontal(mossy_boulder_small);
  const fallen_hollow_log = extractV73Sprite({ sourcePath: path.join(U73, 'v73_complete_fallen_hollow_tunnel_log.png'), targetW: 248, targetH: 142, padPx: 4 });
  // Center-extracted standalone Ancient Acoustic Waystone (x in [0.32..0.68])
  const waystone_landmark = extractV73Sprite({
    sourcePath: path.join(U73, 'v73_complete_ancient_waystone_landmark.png'),
    targetW: 108,
    targetH: 148,
    subCropFrac: { x0: 0.32, x1: 0.68, y0: 0.0, y1: 1.0 },
    padPx: 4,
  });
  // V7.2 Iconic Chime-Reed & Sun-Drop Orchid Outcrop scaled harmoniously for 60px explorer!
  const clearing_chime_outcrop = extractV73Sprite({ sourcePath: path.join(U72, 'v72_clearing_chime_outcrop.png'), targetW: 126, targetH: 88, padPx: 4 });

  // 5 Distinct V7.2 Colossal Trunk Anatomies (ALWAYS paired with crown_dome_a / crown_wide_b overhead!)
  const titan_straight = extractV73Sprite({ sourcePath: path.join(U71, 'v71_titan_trunk_left.png'), targetW: 214, targetH: 304, trimTop: false, padPx: 2 });
  const titan_gnarled = extractV73Sprite({ sourcePath: path.join(U71, 'v71_titan_trunk_gnarled.png'), targetW: 224, targetH: 300, trimTop: false, padPx: 2 });
  const titan_gnarled_flip = flipHorizontal(titan_gnarled);
  const titan_buttress = extractV73Sprite({ sourcePath: path.join(U71, 'v71_titan_trunk_buttress.png'), targetW: 246, targetH: 312, trimTop: false, padPx: 2 });
  const titan_split_arch = extractV73Sprite({ sourcePath: path.join(U72, 'v72_titan_split_hollow_arch.png'), targetW: 256, targetH: 306, trimTop: false, padPx: 2 });
  const titan_moss_pillar = extractV73Sprite({ sourcePath: path.join(U72, 'v72_titan_moss_canopy_pillar.png'), targetW: 232, targetH: 308, trimTop: false, padPx: 2 });

  // Complete uncropped walkable ferns & undergrowth bushes (100% alpha=0 on ALL 4 SIDES!)
  const fern_cluster = extractV73Sprite({ sourcePath: path.join(U72, 'v72_lush_fern_clump_cluster.png'), targetW: 78, targetH: 60, padPx: 3 });
  const fern_cluster_flip = flipHorizontal(fern_cluster);
  const fern_cluster_small = extractV73Sprite({ sourcePath: path.join(U72, 'v72_lush_fern_clump_cluster.png'), targetW: 60, targetH: 48, padPx: 3 });
  const fern_cluster_small_flip = flipHorizontal(fern_cluster_small);
  const bush_mid = extractV73Sprite({ sourcePath: path.join(U71, 'v71_dense_undergrowth_bush.png'), targetW: 126, targetH: 92, padPx: 3 });
  const bush_mid_dark = extractV73Sprite({ sourcePath: path.join(U71, 'v71_dense_undergrowth_bush.png'), targetW: 132, targetH: 96, tintHex: '#143b47', tintAmount: 0.28, darken: 0.20, padPx: 3 });
  const bush_fg_huge = extractV73Sprite({ sourcePath: path.join(U71, 'v71_dense_undergrowth_bush.png'), targetW: 204, targetH: 146, tintHex: '#09241d', tintAmount: 0.24, darken: 0.20, padPx: 3 });
  const bush_fg_small_flip = flipHorizontal(extractV73Sprite({ sourcePath: path.join(U71, 'v71_dense_undergrowth_bush.png'), targetW: 162, targetH: 116, tintHex: '#09241d', tintAmount: 0.24, darken: 0.20, padPx: 3 }));

  const sprites: Record<string, RgbaImage> = {
    crown_dome_a, crown_wide_b, crown_wide_b_flip,
    full_tree_rock, full_tree_rock_flip, full_tree_redwood, full_tree_redwood_flip, full_tree_broad_base,
    root_arch, root_arch_flip, mossy_boulder_cluster, mossy_boulder_cluster_flip,
    mossy_boulder_small, mossy_boulder_small_flip,
    fallen_hollow_log, waystone_landmark, clearing_chime_outcrop,
    titan_straight, titan_gnarled, titan_gnarled_flip, titan_buttress, titan_split_arch, titan_moss_pillar,
    fern_cluster, fern_cluster_flip, fern_cluster_small, fern_cluster_small_flip,
    bush_mid, bush_mid_dark, bush_fg_huge, bush_fg_small_flip,
  };

  // STRICT AUTOMATED 4-SIDE UNCROPPED SILHOUETTE VERIFICATION on every complete sprite!
  const mustBeUncropped = [
    'crown_dome_a', 'crown_wide_b', 'crown_wide_b_flip',
    'full_tree_rock', 'full_tree_rock_flip', 'full_tree_redwood', 'full_tree_redwood_flip',
    'root_arch', 'root_arch_flip', 'mossy_boulder_cluster', 'mossy_boulder_cluster_flip',
    'mossy_boulder_small', 'mossy_boulder_small_flip',
    'fallen_hollow_log', 'waystone_landmark', 'clearing_chime_outcrop',
    'fern_cluster', 'fern_cluster_flip', 'fern_cluster_small', 'fern_cluster_small_flip',
    'bush_mid', 'bush_mid_dark', 'bush_fg_huge', 'bush_fg_small_flip',
  ];
  for (const key of mustBeUncropped) {
    verifyUncropped4Sides(key, sprites[key]);
  }
  for (const [k, img] of Object.entries(sprites)) {
    writePng(path.join(SPRITES_DIR, `${k}.png`), img.pixels, img.width, img.height);
  }

  // 3. Build continuous 2304x1536 painterly forest floor!
  console.log('[3/8] Building continuous 2304x1536 painterly forest floor (zero tiling seams, all 8 zones A-H)...');
  const world = getV73OpenWorldDef();
  const { floor, lightMap } = buildV73ContinuousForestFloor(world);
  writePng(path.join(SPRITES_DIR, 'forest_floor_2304x1536.png'), floor.pixels, floor.width, floor.height);

  // 4. AUTOMATED ASSET BOUNDARY & TRUNK-CROWN COVERAGE AUDIT across 25 camera positions!
  console.log('[4/8] Running automated Asset Boundary & Colossal-Trunk Crown Coverage verification...');
  const canopyProps = world.props.filter((p) => p.layer === 'canopy' || p.layer === 'perimeter_canopy');
  let uncoveredTrunks = 0;
  for (const t of world.props.filter((p) => p.isColossalTrunk)) {
    const tImg = sprites[t.spriteKey];
    const trunkTopY = t.y - tImg.height;
    // Verify an overlapping canopy crown spans BOTH horizontally across trunk center AND vertically past trunkTopY!
    const covered = canopyProps.some((c) => {
      const cImg = sprites[c.spriteKey];
      const cx0 = c.x - cImg.width * 0.44;
      const cx1 = c.x + cImg.width * 0.44;
      const cy0 = c.y - cImg.height * 0.46;
      const cy1 = c.y + cImg.height * 0.46;
      return t.x >= cx0 && t.x <= cx1 && trunkTopY >= cy0 && trunkTopY <= cy1;
    });
    if (!covered) {
      console.error(`  WARNING: Colossal trunk ${t.id} topY=${trunkTopY} at x=${t.x} not covered by overhead canopy!`);
      uncoveredTrunks++;
    }
  }
  if (uncoveredTrunks > 0) {
    throw new Error(`Boundary validation FAILED: ${uncoveredTrunks} colossal trunks lack overhead canopy crown coverage!`);
  }

  // Scan 5x5 = 25 camera positions spanning EVERY boundary & corner!
  let boundaryFramesChecked = 0;
  let maxDrawnProps = 0;
  for (let iy = 0; iy < 5; iy++) {
    for (let ix = 0; ix < 5; ix++) {
      const cx = Math.round(world.camBounds.minX + ((world.camBounds.maxX - world.camBounds.minX) * ix) / 4);
      const cy = Math.round(world.camBounds.minY + ((world.camBounds.maxY - world.camBounds.minY) * iy) / 4);
      const r = renderV73OpenWorldFrame({
        world, floor, lightMap, sprites, charAtlas,
        playerX: Math.max(world.walkBounds.minX, Math.min(world.walkBounds.maxX, cx + V73_VIEW_W / 2)),
        playerY: Math.max(world.walkBounds.minY, Math.min(world.walkBounds.maxY, cy + V73_VIEW_H / 2)),
        playerDir: 'south', playerAnim: 'idle', playerFrameIdx: 0,
        camX: cx, camY: cy, timeSec: 1.0,
      });
      // Verify 100% opaque framebuffer (zero empty border/void pixels anywhere!)
      for (let i = 3; i < r.pixels.length; i += 4) {
        if (r.pixels[i] !== 255) throw new Error(`Transparent void pixel found at camera (${cx},${cy})!`);
      }
      if (r.drawnProps > maxDrawnProps) maxDrawnProps = r.drawnProps;
      boundaryFramesChecked++;
    }
  }
  console.log(`   Boundary audit PASSED: ${boundaryFramesChecked}/25 camera grid positions 100% solid | 0 uncovered colossal trunk tops | peak culled props/frame=${maxDrawnProps}`);

  // 5. Render native 640x360 gameplay captures & dedicated Collision-Debug screenshots!
  console.log('[5/8] Rendering native 640x360 gameplay proofs & Collision-Debug screenshots...');
  const snapCam = (px: number, py: number) => ({
    cx: Math.max(world.camBounds.minX, Math.min(world.camBounds.maxX, Math.round(px - V73_VIEW_W / 2))),
    cy: Math.max(world.camBounds.minY, Math.min(world.camBounds.maxY, Math.round(py - V73_VIEW_H / 2 - 18))),
  });

  const stillSpecs: Array<{ file: string; px: number; py: number; dir: V73CardinalDir; anim: V73AnimState; f: number; dbg: boolean }> = [
    { file: 'proof_01_woodland_hub_center_640x360.png', px: 1024, py: 822, dir: 'east', anim: 'walking', f: 2, dbg: false },
    { file: 'proof_02_root_arch_and_hollow_640x360.png', px: 1118, py: 454, dir: 'north', anim: 'walking', f: 3, dbg: false },
    { file: 'proof_03_sunlit_clearing_and_chimes_640x360.png', px: 1618, py: 824, dir: 'east', anim: 'idle', f: 0, dbg: false },
    { file: 'proof_04_fallen_log_and_rocks_640x360.png', px: 632, py: 956, dir: 'west', anim: 'walking', f: 5, dbg: false },
    { file: 'proof_05_collision_debug_hub_640x360.png', px: 1024, py: 822, dir: 'east', anim: 'idle', f: 0, dbg: true },
    { file: 'proof_06_collision_debug_arch_640x360.png', px: 1118, py: 454, dir: 'north', anim: 'walking', f: 2, dbg: true },
    { file: 'proof_07_collision_debug_clearing_log_640x360.png', px: 642, py: 964, dir: 'west', anim: 'idle', f: 0, dbg: true },
    { file: 'proof_11_waystone_glade_640x360.png', px: 1656, py: 518, dir: 'north', anim: 'idle', f: 0, dbg: false },
  ];

  for (const s of stillSpecs) {
    const { cx, cy } = snapCam(s.px, s.py);
    const fr = renderV73OpenWorldFrame({
      world, floor, lightMap, sprites, charAtlas,
      playerX: s.px, playerY: s.py, playerDir: s.dir, playerAnim: s.anim, playerFrameIdx: s.f,
      camX: cx, camY: cy, timeSec: 1.8, debugCollision: s.dbg,
    });
    writePng(path.join(PROOFS_DIR, s.file), fr.pixels, V73_VIEW_W, V73_VIEW_H);
  }

  // 6. Render ALL 4 WORLD BOUNDARIES 2x2 QUAD (exact 1x native 640x360 per panel!)
  console.log('[6/8] Rendering 2x2 All-4-World-Boundaries proof sheet (North, South, West, East at exact camera limits)...');
  const bPanels: Array<{ label: string; px: number; py: number; cx: number; cy: number; dir: V73CardinalDir }> = [
    { label: 'NORTH BOUNDARY (CAM Y=200 MIN — CONTINUOUS CANOPY)', px: 1118, py: 314, cx: 798, cy: world.camBounds.minY, dir: 'north' },
    { label: 'SOUTH BOUNDARY (CAM Y=976 MAX — CONTINUOUS FOREST)', px: 1152, py: 1216, cx: 832, cy: world.camBounds.maxY, dir: 'south' },
    { label: 'WEST BOUNDARY (CAM X=240 MIN — CONTINUOUS GROVE)', px: 448, py: 944, cx: world.camBounds.minX, cy: 760, dir: 'west' },
    { label: 'EAST BOUNDARY (CAM X=1424 MAX — CONTINUOUS GROVE)', px: 1812, py: 762, cx: world.camBounds.maxX, cy: 590, dir: 'east' },
  ];
  const PAD = 8, HDR = 16;
  const QW = PAD * 3 + V73_VIEW_W * 2;
  const QH = PAD * 3 + HDR * 2 + V73_VIEW_H * 2;
  const quad = createEmptyBuffer(QW, QH);
  const bgCol = hexToRgb('#091314');
  for (let i = 0; i < QW * QH; i++) {
    quad[i * 4] = bgCol.r; quad[i * 4 + 1] = bgCol.g; quad[i * 4 + 2] = bgCol.b; quad[i * 4 + 3] = 255;
  }
  bPanels.forEach((bp, idx) => {
    const r = renderV73OpenWorldFrame({
      world, floor, lightMap, sprites, charAtlas,
      playerX: bp.px, playerY: bp.py, playerDir: bp.dir, playerAnim: 'walking', playerFrameIdx: 1,
      camX: bp.cx, camY: bp.cy, timeSec: 2.2,
    });
    const gx = idx % 2;
    const gy = Math.floor(idx / 2);
    const ox = PAD + gx * (V73_VIEW_W + PAD);
    const oy = PAD + gy * (V73_VIEW_H + HDR + PAD);
    drawText3x5(quad, QW, QH, bp.label, ox + 2, oy + 5, hexToRgb('#ffe573'));
    blitV4(quad, QW, QH, r.pixels, V73_VIEW_W, V73_VIEW_H, ox, oy + HDR);
  });
  writePng(path.join(PROOFS_DIR, 'proof_08_all_4_world_boundaries_quad_1x.png'), quad, QW, QH);

  // 7. Render CONTINUOUS PLAYABLE RECORDING covering ALL 9 REQUIRED SCENARIOS via real physics collision solver!
  console.log('[7/8] Recording continuous native 640x360 open-world exploration GIF (all 9 required scenarios)...');
  const tmpRec = '/tmp/v73_rec_frames';
  fs.rmSync(tmpRec, { recursive: true, force: true });
  fs.mkdirSync(tmpRec, { recursive: true });

  // Waypoint loop exercising:
  //   (1) 4 cardinals (E, N, W, S)  (2) Diagonals (NE, SE, SW, NW)
  //   (3) Full 360-deg circle around central massive Hub Titan (1094, 786) — in front & behind!
  //   (4) Walking RIGHT UNDER Exposed Root Arch (1118, 470) & approaching North Boundary (y=302)
  //   (5) NE Waystone Glade -> Broad Sunlit Clearing + Chime-Reeds -> East Boundary (x=1956)
  //   (6) Wet Pools -> South Boundary (y=1220) -> Mossy Rocks -> Fallen Hollow Log -> West Boundary (x=344) -> Dense NW soft thicket!
  const tour: Array<{ x: number; y: number; run?: boolean }> = [
    { x: 1004, y: 822 },          // Start W of Central Hub Titan (walk E in front of giant trunk!)
    { x: 1184, y: 822 },          // E (in front of trunk)
    { x: 1196, y: 740 },          // N (circling around east side of trunk)
    { x: 1094, y: 726 },          // W (walking cleanly BEHIND colossal trunk — natural occlusion peek!)
    { x: 1002, y: 742 },          // SW diagonal (finishing full 360-deg tree circle!)
    { x: 1118, y: 540 },          // NE diagonal toward Root-Dominated Hollow
    { x: 1118, y: 454 },          // N — walking RIGHT UNDERNEATH the Exposed Root Arch!
    { x: 1118, y: 312 },          // N — approaching NORTH world boundary (zero cut edges!)
    { x: 1620, y: 486, run: true }, // SE diagonal sprint to Ancient Waystone Landmark (NE Glade)
    { x: 1656, y: 838, run: true }, // S into Broad Sunlit Clearing + Chime-Reed Outcrop!
    { x: 1948, y: 838, run: true }, // E — approaching EAST world boundary (zero cut edges!)
    { x: 1620, y: 940, run: true }, // SW diagonal across reflective clearing pools
    { x: 1168, y: 1044, run: true },// W into Wet Basin Pools (live footstep water ripples!)
    { x: 1168, y: 1218 },         // S — approaching SOUTH world boundary (zero cut edges!)
    { x: 678, y: 1134, run: true }, // W past Mossy Rock Formations Ridge
    { x: 670, y: 912 },           // N past Fallen Hollow Log Crossing
    { x: 350, y: 886, run: true },// W — approaching WEST world boundary (zero cut edges!)
    { x: 586, y: 554, run: true },// NE diagonal into Dense NW Grove & walking through soft slow-thicket!
  ];

  let px = tour[0].x;
  let py = tour[0].y;
  let camX = Math.max(world.camBounds.minX, Math.min(world.camBounds.maxX, px - V73_VIEW_W / 2));
  let camY = Math.max(world.camBounds.minY, Math.min(world.camBounds.maxY, py - V73_VIEW_H / 2 - 18));
  let dir: V73CardinalDir = 'east';
  let animAcc = 0;

  // Simulate fixed 0.14s physics steps through EVERY waypoint using real evaluateV73Movement!
  const simFrames: Array<{ px: number; py: number; cx: number; cy: number; dir: V73CardinalDir; anim: V73AnimState; fIdx: number; t: number }> = [];
  let tSim = 0;
  const DT = 0.12;
  for (let wp = 1; wp < tour.length; wp++) {
    const target = tour[wp];
    const isRun = !!target.run;
    for (let guard = 0; guard < 120; guard++) {
      const vx = target.x - px;
      const vy = target.y - py;
      const dist = Math.hypot(vx, vy);
      if (dist < 14) break;
      const nx = vx / dist;
      const ny = vy / dist;
      const baseSpeed = isRun ? V73_RUN_SPEED : V73_WALK_SPEED;
      const step = evaluateV73Movement(world, px, py, nx * baseSpeed * DT, ny * baseSpeed * DT);
      px = step.x;
      py = step.y;
      if (Math.abs(nx) >= Math.abs(ny)) dir = nx >= 0 ? 'east' : 'west';
      else dir = ny >= 0 ? 'south' : 'north';

      const anim: V73AnimState = step.blocked ? 'idle' : isRun ? 'running' : 'walking';
      const fps = anim === 'running' ? 12.5 : anim === 'walking' ? 9.5 : 5.0;
      animAcc += DT * fps;
      tSim += DT;

      const tCamX = Math.max(world.camBounds.minX, Math.min(world.camBounds.maxX, px - V73_VIEW_W / 2));
      const tCamY = Math.max(world.camBounds.minY, Math.min(world.camBounds.maxY, py - V73_VIEW_H / 2 - 18));
      camX += (tCamX - camX) * 0.24;
      camY += (tCamY - camY) * 0.24;

      simFrames.push({ px, py, cx: camX, cy: camY, dir, anim, fIdx: Math.floor(animAcc) % 8, t: tSim });
      if (step.blocked) break;
    }
  }

  // Downsample evenly to 120 crisp frames (~12s smooth looping continuous exploration recording!)
  const GIF_COUNT = 120;
  const gifFiles: string[] = [];
  let peakOccPx = 0;
  let bestOccFile = '';
  for (let k = 0; k < GIF_COUNT; k++) {
    const sIdx = Math.min(simFrames.length - 1, Math.round((k / (GIF_COUNT - 1)) * (simFrames.length - 1)));
    const sf = simFrames[sIdx];
    const r = renderV73OpenWorldFrame({
      world, floor, lightMap, sprites, charAtlas,
      playerX: sf.px, playerY: sf.py, playerDir: sf.dir, playerAnim: sf.anim, playerFrameIdx: sf.fIdx,
      camX: sf.cx, camY: sf.cy, timeSec: sf.t,
    });
    const fp = path.join(tmpRec, `rec_${String(k).padStart(3, '0')}.png`);
    writePng(fp, r.pixels, V73_VIEW_W, V73_VIEW_H);
    gifFiles.push(fp);
    if (r.occludedPixels > peakOccPx && sf.py < 760 && sf.px > 1030 && sf.px < 1160) {
      peakOccPx = r.occludedPixels;
      bestOccFile = fp;
    }
  }
  if (bestOccFile) {
    fs.copyFileSync(bestOccFile, path.join(PROOFS_DIR, 'proof_10_behind_trunk_natural_occlusion_640x360.png'));
  }
  console.log(`   Continuous exploration recorded: ${simFrames.length} physics steps -> ${GIF_COUNT} GIF frames | peak behind-trunk occlusion=${peakOccPx} px (natural ordered-dither peek — ZERO cyan glow!)`);

  execFileSync('convert', ['-delay', '10', '-loop', '0', ...gifFiles, '-layers', 'Optimize', path.join(PROOFS_DIR, 'proof_09_continuous_exploration_9_scenarios_640x360.gif')], {
    stdio: 'inherit',
  });

  // 8. Export REAL standalone Godot 4.7.2 project + supplementary interactive browser preview!
  console.log('[8/8] Exporting standalone Godot 4.7.2 open-world project & supplementary browser playable preview...');
  const godotStats = exportV73StandaloneGodotProject({
    godotProjectDir: GODOT_PROJ_DIR,
    sourceSpritesDir: SPRITES_DIR,
    world,
    sprites,
  });
  console.log(
    `   Godot 4.7.2 scene wired: ${godotStats.extResourceCount} ExtResources | ${godotStats.subResourceCount} SubResources | ` +
    `${godotStats.spriteNodeCount} Sprite2D nodes | ${godotStats.solidBodyCount} StaticBody2Ds (${godotStats.solidPolygonCount} exact CollisionPolygon2Ds) | ${godotStats.areaZoneCount} Area2D walkable zones`
  );

  emitSupplementaryWebPreview(world, sprites);
  console.log('=== V7.3 CONTINUOUS OPEN-WORLD FOREST & GODOT 4.7.2 BUILD COMPLETE ===');
}

function emitSupplementaryWebPreview(
  world: ReturnType<typeof getV73OpenWorldDef>,
  sprites: Record<string, RgbaImage>
): void {
  const manifest = {
    version: 'V7.3',
    viewW: V73_VIEW_W,
    viewH: V73_VIEW_H,
    worldW: world.worldW,
    worldH: world.worldH,
    camBounds: world.camBounds,
    walkBounds: world.walkBounds,
    pools: world.pools,
    presets: world.presets,
    spriteSizes: Object.fromEntries(Object.entries(sprites).map(([k, v]) => [k, { w: v.width, h: v.height }])),
    props: world.props,
    colliders: world.colliders,
  };
  fs.writeFileSync(path.join(PLAYABLE_DIR, 'v73_world_manifest.json'), JSON.stringify(manifest));

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VERDANT SIGNAL V7.3 — Continuous Open-World Playability Preview (640x360 Native)</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100vh; background: #071211; color: #e2f5f1;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 12px; gap: 8px;
    }
    .bar { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; max-width: 1280px; font-size: 11px; align-items: center; }
    button {
      background: #102a29; color: #baf7ef; border: 1px solid #2b6b66;
      padding: 5px 8px; cursor: pointer; font-family: inherit; font-size: 11px; border-radius: 4px;
    }
    button:hover { background: #18423f; }
    button.active { background: #266b63; color: #fff; border-color: #ffe573; }
    .stage { border: 2px solid #264d4a; background: #040b0b; line-height: 0; box-shadow: 0 12px 36px rgba(0,0,0,0.72); }
    canvas { display: block; image-rendering: pixelated; image-rendering: crisp-edges; }
    .hud { font-size: 11px; color: #9ec9c4; text-align: center; max-width: 1240px; line-height: 1.45; }
  </style>
</head>
<body>
  <div class="bar">
    <strong>VERDANT SIGNAL V7.3 — SUPPLEMENTARY BROWSER PREVIEW (NOT GODOT RUNTIME PROOF)</strong>
    <button id="b1">1: Hub</button>
    <button id="b2">2: NW Grove</button>
    <button id="b3">3: Root Arch</button>
    <button id="b4">4: Waystone</button>
    <button id="b5">5: Clearing</button>
    <button id="b6">6: Wet Pools</button>
    <button id="b7">7: Mossy Rocks</button>
    <button id="b8">8: Hollow Log</button>
    <button id="btnDbg">F3: Collision Debug</button>
    <button id="btn1x">1x (640×360)</button>
    <button id="btn2x" class="active">2x (1280×720)</button>
  </div>
  <div class="stage">
    <canvas id="game" width="640" height="360" style="width:1280px;height:720px;"></canvas>
  </div>
  <div class="hud" id="status">
    WASD / Arrows (all 8 dirs, normalized) · Shift: Run · F3: Collision-Debug Overlay · Real standalone Godot 4.7.2 project is in ../godot_project/
  </div>
  <script>
    (async () => {
      const m = await (await fetch('./v73_world_manifest.json')).json();
      const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
      const floorImg = await loadImg('../sprites/forest_floor_2304x1536.png');
      const charTex = {
        idle: await loadImg('../sprites/char_idle_88x88_8x4.png'),
        walking: await loadImg('../sprites/char_walking_88x88_8x4.png'),
        running: await loadImg('../sprites/char_running_88x88_8x4.png'),
      };
      const sprites = {};
      for (const k of Object.keys(m.spriteSizes)) sprites[k] = await loadImg('../sprites/' + k + '.png');

      const canvas = document.getElementById('game');
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const statusEl = document.getElementById('status');

      let px = m.presets.hub_center.playerX, py = m.presets.hub_center.playerY;
      let camX = Math.max(m.camBounds.minX, Math.min(m.camBounds.maxX, px - 320));
      let camY = Math.max(m.camBounds.minY, Math.min(m.camBounds.maxY, py - 198));
      let dirRow = 2, anim = 'idle', animAcc = 0, debugCol = false;
      const keys = new Set();

      const presetKeys = ['hub_center','dense_nw','root_arch','waystone_ne','clearing_e','wet_pools_s','mossy_rocks_sw','fallen_log_w'];
      const jump = (k) => {
        const p = m.presets[k];
        px = p.playerX; py = p.playerY;
        dirRow = { south: 0, north: 1, east: 2, west: 3 }[p.dir];
        camX = Math.max(m.camBounds.minX, Math.min(m.camBounds.maxX, px - 320));
        camY = Math.max(m.camBounds.minY, Math.min(m.camBounds.maxY, py - 198));
      };
      presetKeys.forEach((pk, idx) => document.getElementById('b' + (idx + 1)).onclick = () => jump(pk));
      document.getElementById('btnDbg').onclick = () => { debugCol = !debugCol; document.getElementById('btnDbg').classList.toggle('active', debugCol); };
      document.getElementById('btn1x').onclick = () => { canvas.style.width = '640px'; canvas.style.height = '360px'; document.getElementById('btn1x').classList.add('active'); document.getElementById('btn2x').classList.remove('active'); };
      document.getElementById('btn2x').onclick = () => { canvas.style.width = '1280px'; canvas.style.height = '720px'; document.getElementById('btn2x').classList.add('active'); document.getElementById('btn1x').classList.remove('active'); };

      window.addEventListener('keydown', (e) => {
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','F3'].includes(e.key)) e.preventDefault();
        if (e.key === 'F3') { document.getElementById('btnDbg').click(); return; }
        if (e.key >= '1' && e.key <= '8') { jump(presetKeys[Number(e.key) - 1]); return; }
        keys.add(e.key.toLowerCase());
      });
      window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

      const ptInPoly = (x, y, pts) => {
        let sign = 0;
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i], b = pts[(i + 1) % pts.length];
          const c = (b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x);
          if (Math.abs(c) < 1e-6) continue;
          const s = c > 0 ? 1 : -1;
          if (!sign) sign = s; else if (sign !== s) return false;
        }
        return true;
      };
      const distSeg = (x, y, ax, ay, bx, by) => {
        const dx = bx - ax, dy = by - ay, l2 = dx*dx + dy*dy;
        if (l2 < 1e-6) return Math.hypot(x - ax, y - ay);
        const t = Math.max(0, Math.min(1, ((x - ax)*dx + (y - ay)*dy) / l2));
        return Math.hypot(x - (ax + t*dx), y - (ay + t*dy));
      };
      const hitsPoly = (cx, cy, rx, ry, pts) => {
        const sy = rx / ry, scy = cy * sy;
        const sp = pts.map(p => ({ x: p.x, y: p.y * sy }));
        if (ptInPoly(cx, scy, sp)) return true;
        for (let i = 0; i < sp.length; i++) {
          const a = sp[i], b = sp[(i + 1) % sp.length];
          if (distSeg(cx, scy, a.x, a.y, b.x, b.y) < rx) return true;
        }
        return false;
      };
      const isSolid = (r) => ['solid_trunk','solid_root','solid_rock','solid_log','solid_thicket'].includes(r);
      const blockedAt = (x, y) => {
        if (x < m.walkBounds.minX || x > m.walkBounds.maxX || y < m.walkBounds.minY || y > m.walkBounds.maxY) return true;
        for (const c of m.colliders) if (isSolid(c.role) && hitsPoly(x, y, 11, 6, c.points)) return true;
        return false;
      };

      const roleColors = {
        solid_trunk: '#ff4a4a', solid_root: '#ffa438', solid_rock: '#4cc3ff',
        solid_log: '#ff7a40', solid_thicket: '#d86cff', slow_thicket: '#b8ff4a', walkable_arch: '#38f2ff'
      };

      let last = performance.now(), start = last;
      function tick(now) {
        const dt = Math.min(0.05, (now - last) / 1000);
        const tSec = (now - start) / 1000;
        last = now;

        let vx = 0, vy = 0;
        if (keys.has('a') || keys.has('arrowleft')) vx -= 1;
        if (keys.has('d') || keys.has('arrowright')) vx += 1;
        if (keys.has('w') || keys.has('arrowup')) vy -= 1;
        if (keys.has('s') || keys.has('arrowdown')) vy += 1;

        let terrainMul = 1.0;
        for (const c of m.colliders) if (c.role === 'slow_thicket' && hitsPoly(px, py, 11, 6, c.points)) terrainMul = 0.78;
        for (const p of m.pools) if (Math.hypot((px - p.x)/p.rx, (py - p.y)/p.ry) < 0.92) terrainMul = Math.min(terrainMul, 0.90);

        const wantsRun = keys.has('shift');
        if (vx || vy) {
          const len = Math.hypot(vx, vy), nx = vx / len, ny = vy / len;
          const sp = (wantsRun ? 128 : 84) * terrainMul;
          const ox = px, oy = py;
          if (!blockedAt(px + nx * sp * dt, py + ny * sp * dt)) { px += nx * sp * dt; py += ny * sp * dt; }
          else {
            if (!blockedAt(px + nx * sp * dt, py)) px += nx * sp * dt;
            if (!blockedAt(px, py + ny * sp * dt)) py += ny * sp * dt;
          }
          if (Math.abs(nx) > Math.abs(ny) * 1.12) dirRow = nx > 0 ? 2 : 3;
          else if (Math.abs(ny) > Math.abs(nx) * 1.12) dirRow = ny > 0 ? 0 : 1;
          const actualSp = Math.hypot(px - ox, py - oy) / Math.max(dt, 0.0001);
          anim = actualSp < 8 ? 'idle' : (wantsRun && actualSp > 94 ? 'running' : 'walking');
        } else {
          anim = 'idle';
        }
        animAcc += dt * (anim === 'running' ? 12.5 : anim === 'walking' ? 9.5 : 5.0);
        const fCol = Math.floor(animAcc) % 8;

        const tcx = Math.max(m.camBounds.minX, Math.min(m.camBounds.maxX, px - 320));
        const tcy = Math.max(m.camBounds.minY, Math.min(m.camBounds.maxY, py - 198));
        camX += (tcx - camX) * Math.min(1, dt * 7);
        camY += (tcy - camY) * Math.min(1, dt * 7);
        const ix = Math.round(camX), iy = Math.round(camY);

        ctx.drawImage(floorImg, ix, iy, 640, 360, 0, 0, 640, 360);

        // Pool ripples
        ctx.strokeStyle = 'rgba(220,249,255,0.6)';
        for (const p of m.pools) {
          const cyc = ((tSec / p.ripplePeriod) + p.ripplePhase) % 1;
          if (cyc < 0.56) {
            const u = cyc / 0.56;
            ctx.beginPath();
            ctx.ellipse(Math.round(p.x - ix), Math.round(p.y - iy), 2 + u * 12, 1 + u * 4.5, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // Y-sorted props + player
        const ys = [];
        for (const p of m.props) {
          if (p.layer !== 'ysort' && p.layer !== 'overhead_arch') continue;
          const img = sprites[p.spriteKey];
          const dx = Math.round(p.x - ix - img.width / 2), dy = Math.round(p.y - iy - img.height);
          if (dx + img.width < -16 || dx > 656 || dy + img.height < -16 || dy > 376) continue;
          ys.push({ kind: 'prop', y: p.y + (p.sortOffsetY || 0), p, img, dx, dy });
        }
        ys.push({ kind: 'player', y: py });
        ys.sort((a, b) => a.y - b.y);

        let drawn = 0, pDrawn = false, occ = false;
        const cdx = Math.round(px - ix - 44), cdy = Math.round(py - iy - 75);
        for (const item of ys) {
          if (item.kind === 'player') {
            ctx.fillStyle = 'rgba(7,22,17,0.42)';
            ctx.beginPath(); ctx.ellipse(Math.round(px - ix), Math.round(py - iy), 14, 4, 0, 0, Math.PI * 2); ctx.fill();
            ctx.drawImage(charTex[anim], fCol * 88, dirRow * 88, 88, 88, cdx, cdy, 88, 88);
            pDrawn = true;
          } else {
            ctx.drawImage(item.img, item.dx, item.dy);
            drawn++;
            if (pDrawn && cdx + 62 > item.dx + 22 && cdx + 26 < item.dx + item.img.width - 22 && cdy + 74 > item.dy + 16 && cdy + 14 < item.dy + item.img.height) occ = true;
          }
        }
        for (const ln of ['canopy', 'perimeter_canopy']) {
          for (const p of m.props) {
            if (p.layer !== ln) continue;
            const img = sprites[p.spriteKey];
            const dx = Math.round(p.x - ix - img.width / 2), dy = Math.round(p.y - iy - img.height / 2);
            if (dx + img.width < -16 || dx > 656 || dy + img.height < -16 || dy > 376) continue;
            ctx.drawImage(img, dx, dy);
            drawn++;
            if (cdx + 62 > dx + 24 && cdx + 26 < dx + img.width - 24 && cdy + 74 > dy + 16 && cdy + 14 < dy + img.height - 16) occ = true;
          }
        }
        if (occ) {
          ctx.save(); ctx.globalAlpha = 0.44;
          ctx.drawImage(charTex[anim], fCol * 88, dirRow * 88, 88, 88, cdx, cdy, 88, 88);
          ctx.restore();
        }
        if (debugCol) {
          for (const c of m.colliders) {
            ctx.save();
            ctx.strokeStyle = roleColors[c.role] || '#fff';
            ctx.fillStyle = (roleColors[c.role] || '#fff') + '38';
            if (!isSolid(c.role)) ctx.setLineDash([3, 3]);
            ctx.beginPath();
            c.points.forEach((pt, idx) => idx === 0 ? ctx.moveTo(pt.x - ix, pt.y - iy) : ctx.lineTo(pt.x - ix, pt.y - iy));
            ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.restore();
          }
          ctx.strokeStyle = '#ffffff';
          ctx.beginPath(); ctx.ellipse(Math.round(px - ix), Math.round(py - iy), 11, 6, 0, 0, Math.PI * 2); ctx.stroke();
        }
        statusEl.textContent = 'Pos=(' + Math.round(px) + ',' + Math.round(py) + ') | Cam=(' + ix + ',' + iy + ') | State=' + anim.toUpperCase() + ' | SpeedMul=' + terrainMul.toFixed(2) + 'x | DrawnProps=' + drawn + ' | F3: ColDebug=' + (debugCol ? 'ON' : 'OFF') + ' | Browser preview only — Real Godot 4.7.2 project in ../godot_project/';
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
    '<!doctype html><html><head><meta http-equiv="refresh" content="0; url=./playable_web/index.html" /></head><body><a href="./playable_web/index.html">Open V7.3 Supplementary Browser Preview</a></body></html>\n'
  );
}

main();
