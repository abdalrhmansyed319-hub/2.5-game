/**
 * VERDANT SIGNAL V7.0 — IMMERSIVE WORLD PERSPECTIVE & ENVIRONMENTAL SCALE BUILDER
 * ===============================================================================
 * Generates the completely isolated V7.0 playable visual study under:
 *   `game/assets/v7_immersive_world_study/` (protected by `.gdignore`)
 *
 * Outputs:
 *   1. Native 1x handcrafted 56-color pixel-art sprites & biome grounds (`sprites/`)
 *   2. Exact native 480x270 gameplay screenshots (`proofs/proof_A..E4_480x270.png`)
 *      with ZERO artificial enlargement hiding pixel-art defects!
 *   3. Native 480x270 animated Y-sort & occlusion walkthrough (`proof_E_depth_sort_walkthrough_480x270.gif`)
 *   4. Unscaled 1x side-by-side comparison plates (`comparison_A_vs_B_C_D_native_1x.png`
 *      and `comparison_E_depth_sort_4steps_native_1x.png`)
 *   5. Shared scene manifest (`playable_web/v7_study_manifest.json`) driving the
 *      live playable browser study & isolated Godot 4.7.2 study scenes!
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { encodeRGBA8PNG } from '../engine/pngEncoder';
import { createEmptyBuffer } from '../engine/pixelBuffer';
import { blitV4, drawTextV4, fillBoardBgV4 } from '../v4_masterpiece/v4Core';
import { drawRectBorder } from '../v5_soul/v5PixelEngine';
import {
  V7_COAST_PALETTE,
  V7_FOREST_PALETTE,
  V7_SWAMP_PALETTE,
  buildBiomeGround,
  buildPlayableMaraV7Sheet,
  buildReedwoodVariantB,
  extractCraftedPropFromMagenta,
  groundBottomCroppedCliff,
  type MaraDirV7,
} from './v7PixelAtlas';
import {
  VIEW_H,
  VIEW_W,
  WORLD_H,
  WORLD_W,
  getV7BiomeScenes,
  renderCurrentM01Overhead480x270,
  renderV7SceneFrame,
  type RgbaImage,
} from './v7WorldEngine';

const REPO = path.resolve(process.cwd(), '../..');
const UNDERLAY = '/tmp/v7_underlay';
const TMP_GIF = '/tmp/v7_gif_frames';
const ROOT = path.join(REPO, 'game/assets/v7_immersive_world_study');
const D_SPRITES = path.join(ROOT, 'sprites');
const D_PROOFS = path.join(ROOT, 'proofs');
const D_WEB = path.join(ROOT, 'playable_web');
const D_GODOT = path.join(ROOT, 'godot_study');

for (const d of [ROOT, D_SPRITES, D_PROOFS, D_WEB, D_GODOT, TMP_GIF]) {
  fs.mkdirSync(d, { recursive: true });
}

fs.writeFileSync(
  path.join(ROOT, '.gdignore'),
  '# VERDANT SIGNAL V7.0 — Isolated Immersive World Perspective & Scale Study (excluded from M01 Godot production imports).\n',
  'utf8'
);

function writeLosslessPng(filePath: string, px: Uint8ClampedArray, w: number, h: number): void {
  const rawPath = `${filePath}.raw.png`;
  fs.writeFileSync(rawPath, encodeRGBA8PNG(px, w, h));
  execFileSync('convert', [rawPath, '-strip', '-define', 'png:compression-level=9', `PNG32:${filePath}`]);
  fs.unlinkSync(rawPath);
}

function makeGif(framePaths: string[], outGif: string, delayCs: number): void {
  execFileSync('convert', ['-dispose', 'none', '-delay', String(delayCs), '-loop', '0', ...framePaths, '-layers', 'Optimize', outGif]);
}

function flipRgbaX(src: RgbaImage): RgbaImage {
  const out = createEmptyBuffer(src.width, src.height);
  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      const si = (y * src.width + (src.width - 1 - x)) * 4;
      const di = (y * src.width + x) * 4;
      out[di] = src.pixels[si];
      out[di + 1] = src.pixels[si + 1];
      out[di + 2] = src.pixels[si + 2];
      out[di + 3] = src.pixels[si + 3];
    }
  }
  return { pixels: out, width: src.width, height: src.height };
}

function darkenForFgDepth(src: RgbaImage, factor = 0.72): RgbaImage {
  const out = new Uint8ClampedArray(src.pixels);
  for (let i = 0; i < out.length; i += 4) {
    if (out[i + 3] < 128) continue;
    // Cool slightly into deep atmospheric foreground silhouette shade!
    out[i] = Math.round(out[i] * factor * 0.92);
    out[i + 1] = Math.round(out[i + 1] * factor);
    out[i + 2] = Math.round(Math.min(255, out[i + 2] * (factor + 0.08)));
  }
  return { pixels: out, width: src.width, height: src.height };
}

console.log('=== BUILDING VERDANT SIGNAL V7.0 — IMMERSIVE WORLD PERSPECTIVE STUDY ===');

// ----------------------------------------------------------------------------
// 1. CRAFT ALL NATIVE PIXEL-ART BIOME GROUNDS, MONUMENTAL PROPS & 28x40 MARA
// ----------------------------------------------------------------------------
console.log('1/5 Extracting zero-fringe 56-color pixel-art grounds & monumental structures...');

const sprites: Record<string, RgbaImage> = {
  forest_ground: {
    pixels: buildBiomeGround(path.join(UNDERLAY, 'v7_forest_ground_and_horizon.png'), WORLD_W, WORLD_H, V7_FOREST_PALETTE),
    width: WORLD_W,
    height: WORLD_H,
  },
  swamp_ground: {
    pixels: buildBiomeGround(path.join(UNDERLAY, 'v7_swamp_ground_and_horizon.png'), WORLD_W, WORLD_H, V7_SWAMP_PALETTE),
    width: WORLD_W,
    height: WORLD_H,
  },
  coast_ground: {
    pixels: buildBiomeGround(path.join(UNDERLAY, 'v7_coast_ground_and_horizon.png'), WORLD_W, WORLD_H, V7_COAST_PALETTE),
    width: WORLD_W,
    height: WORLD_H,
  },
  // Colossal Singing Reedwood Trunks (extending straight off TOP of the 270px viewport!)
  reedwood_a: extractCraftedPropFromMagenta(
    path.join(UNDERLAY, 'v7_prop_colossal_reedwood.png'),
    176, 268, V7_FOREST_PALETTE,
    { keepTopEdge: true, darkContourHex: '#1a0c10' }
  ),
  reedwood_b: buildReedwoodVariantB(
    path.join(UNDERLAY, 'v7_prop_colossal_reedwood.png'),
    188, 276, V7_FOREST_PALETTE
  ),
  // Overhanging Camera-Framing Canopy Boughs
  fg_canopy_left: extractCraftedPropFromMagenta(
    path.join(UNDERLAY, 'v7_prop_fg_canopy_bough.png'),
    178, 122, V7_FOREST_PALETTE,
    { darkContourHex: '#081e1b' }
  ),
  // Swamp Colossal Root Arches & Towering Reeds (extends cleanly up behind overhanging swamp canopy!)
  swamp_root_reeds: extractCraftedPropFromMagenta(
    path.join(UNDERLAY, 'v7_prop_swamp_root_reeds.png'),
    210, 212, V7_SWAMP_PALETTE,
    { keepTopEdge: true, darkContourHex: '#07161c' }
  ),
  fg_swamp_reeds: extractCraftedPropFromMagenta(
    path.join(UNDERLAY, 'v7_prop_fg_swamp_reeds.png'),
    208, 134, V7_SWAMP_PALETTE,
    { darkContourHex: '#07161c' }
  ),
  // Coastal Monolithic Cliffs (organically grounded rocky base skirt!) & Sea-Boulders
  coast_monolith: groundBottomCroppedCliff(
    extractCraftedPropFromMagenta(
      path.join(UNDERLAY, 'v7_prop_coast_monolith.png'),
      176, 214, V7_COAST_PALETTE,
      { darkContourHex: '#111621' }
    )
  ),
  coast_boulder: extractCraftedPropFromMagenta(
    path.join(UNDERLAY, 'v7_prop_coast_boulder.png'),
    118, 72, V7_COAST_PALETTE,
    { darkContourHex: '#111621' }
  ),
  // Swamp overhanging canopy bough (extracted in Swamp 56-color palette for top-right corner framing!)
  fg_swamp_canopy_tr: flipRgbaX(
    darkenForFgDepth(
      extractCraftedPropFromMagenta(
        path.join(UNDERLAY, 'v7_prop_fg_canopy_bough.png'),
        178, 122, V7_SWAMP_PALETTE,
        { darkContourHex: '#07161c' }
      ),
      0.78
    )
  ),
};

// Derived mirrored & foreground-shaded framing silhouettes (no extra model calls!)
sprites.fg_swamp_canopy_tl = flipRgbaX(sprites.fg_swamp_canopy_tr);
sprites.fg_canopy_right = flipRgbaX(sprites.fg_canopy_left);
sprites.fg_canopy_bot_left = darkenForFgDepth(sprites.fg_canopy_left, 0.72);
sprites.swamp_root_reeds_flip = flipRgbaX(sprites.swamp_root_reeds);
sprites.coast_boulder_fg = darkenForFgDepth(flipRgbaX(sprites.coast_boulder), 0.68);

// Persist every single native 1x sprite asset to `sprites/` for BOTH Godot & Live Browser Playable Study!
for (const [key, img] of Object.entries(sprites)) {
  writeLosslessPng(path.join(D_SPRITES, `${key}.png`), img.pixels, img.width, img.height);
}

const maraV7 = buildPlayableMaraV7Sheet();
writeLosslessPng(path.join(D_SPRITES, 'mara_v7_28x40_sheet.png'), maraV7.sheetPixels, maraV7.sheetW, maraV7.sheetH);

// ----------------------------------------------------------------------------
// 2. RENDER PROOF A — EXACT CURRENT M01 OVERHEAD PRESENTATION (NATIVE 480x270)
// ----------------------------------------------------------------------------
console.log('2/5 Rendering Proof A (Exact Current Milestone 01 Overhead @ native 480x270)...');
const proofA = renderCurrentM01Overhead480x270(REPO, 118, -24);
writeLosslessPng(path.join(D_PROOFS, 'proof_A_current_m01_overhead_480x270.png'), proofA, VIEW_W, VIEW_H);
// Also save to sprites/ so the interactive web playable study can toggle directly to Mode 1 (M01 Overhead)!
writeLosslessPng(path.join(D_SPRITES, 'm01_current_overhead_480x270.png'), proofA, VIEW_W, VIEW_H);

// ----------------------------------------------------------------------------
// 3. RENDER PROOFS B, C, D — IMMERSIVE FOREST, SWAMP & COAST (NATIVE 480x270!)
// ----------------------------------------------------------------------------
console.log('3/5 Rendering Proofs B (Forest), C (Swamp) & D (Coast) @ native 480x270...');
const scenes = getV7BiomeScenes();

const proofB = renderV7SceneFrame({
  scene: scenes.forest,
  sprites,
  maraSprites: maraV7,
  maraX: scenes.forest.spawnX,
  maraY: scenes.forest.spawnY,
  maraDir: scenes.forest.spawnDir,
  maraStep: 0,
  animPhase: 0.15,
}).pixels;
writeLosslessPng(path.join(D_PROOFS, 'proof_B_immersive_forest_480x270.png'), proofB, VIEW_W, VIEW_H);

const proofC = renderV7SceneFrame({
  scene: scenes.swamp,
  sprites,
  maraSprites: maraV7,
  maraX: scenes.swamp.spawnX,
  maraY: scenes.swamp.spawnY,
  maraDir: scenes.swamp.spawnDir,
  maraStep: 1,
  animPhase: 0.25,
}).pixels;
writeLosslessPng(path.join(D_PROOFS, 'proof_C_immersive_swamp_480x270.png'), proofC, VIEW_W, VIEW_H);

const proofD = renderV7SceneFrame({
  scene: scenes.coast,
  sprites,
  maraSprites: maraV7,
  maraX: scenes.coast.spawnX,
  maraY: scenes.coast.spawnY,
  maraDir: scenes.coast.spawnDir,
  maraStep: 0,
  animPhase: 0.35,
}).pixels;
writeLosslessPng(path.join(D_PROOFS, 'proof_D_immersive_coast_480x270.png'), proofD, VIEW_W, VIEW_H);

// ----------------------------------------------------------------------------
// 4. RENDER PROOF E — TRUE DEPTH SORTING & OCCLUSION WALKTHROUGH (NATIVE 480x270)
// ----------------------------------------------------------------------------
console.log('4/5 Rendering Proof E (Walk In Front -> Behind -> Occluded -> Re-emerge @ native 480x270)...');
// Colossal hero left Singing Reedwood trunk is anchored at (x=152, sortY=238).
// Demonstrate Mara walking cleanly:
//   E1: IN FRONT OF the colossal roots (x=176, y=256 > sortY=238) -> Mara renders 100% IN FRONT!
//   E2: STEPPING BEHIND the right flank of the massive trunk (x=184, y=220 < sortY=238) -> Trunk cleanly clips her left side!
//   E3: WALKING FULLY BEHIND the 88px-wide colossal trunk (x=154, y=214 < sortY=238) -> Trunk renders IN FRONT + subtle readable silhouette peek!
//   E4: RE-EMERGING on the sunlit far side into the glade (x=222, y=212) -> Cleanly back in open view!
const keyE = [
  { file: 'proof_E1_mara_in_front_of_tree_480x270.png', x: 176, y: 256, dir: 'left' as MaraDirV7, step: 1, label: 'E1. IN FRONT OF COLOSSAL TRUNK (Y 256 ABOVE SORT 238)' },
  { file: 'proof_E2_mara_entering_behind_tree_480x270.png', x: 184, y: 220, dir: 'left' as MaraDirV7, step: 3, label: 'E2. ENTERING BEHIND TRUNK (Y 220 BEHIND SORT 238)' },
  { file: 'proof_E3_mara_occluded_behind_tree_480x270.png', x: 154, y: 214, dir: 'left' as MaraDirV7, step: 1, label: 'E3. BEHIND TRUNK WITH READABILITY SILHOUETTE PEEK' },
  { file: 'proof_E4_mara_reemerging_from_tree_480x270.png', x: 224, y: 210, dir: 'right' as MaraDirV7, step: 1, label: 'E4. RE-EMERGING INTO SUNLIT FOREST GLADE' },
];

const eBufs: Uint8ClampedArray[] = [];
for (const k of keyE) {
  const res = renderV7SceneFrame({
    scene: scenes.forest,
    sprites,
    maraSprites: maraV7,
    maraX: k.x,
    maraY: k.y,
    maraDir: k.dir,
    maraStep: k.step,
    camFocusX: 256,
    camFocusY: 244,
    animPhase: 0.2,
  });
  console.log(`   ${k.file}: occludedPixels=${res.occludedPixels}`);
  writeLosslessPng(path.join(D_PROOFS, k.file), res.pixels, VIEW_W, VIEW_H);
  eBufs.push(res.pixels);
}

// Build smooth 36-frame native 480x270 animated depth-sorting & parallax walkthrough GIF!
{
  const waypoints: Array<[number, number, MaraDirV7]> = [
    [232, 256, 'left'],
    [176, 256, 'left'],
    [122, 254, 'left'],
    [108, 232, 'up'],
    [116, 214, 'right'],
    [154, 214, 'right'],
    [194, 214, 'right'],
    [232, 218, 'down'],
    [232, 256, 'down'],
  ];
  const gifPaths: string[] = [];
  const totalFrames = 36;
  const segCount = waypoints.length - 1;
  for (let f = 0; f < totalFrames; f++) {
    const u = (f / totalFrames) * segCount;
    const seg = Math.min(segCount - 1, Math.floor(u));
    const localT = u - seg;
    const [x0, y0, dir] = waypoints[seg];
    const [x1, y1] = waypoints[seg + 1];
    const mx = x0 + (x1 - x0) * localT;
    const my = y0 + (y1 - y0) * localT;
    const res = renderV7SceneFrame({
      scene: scenes.forest,
      sprites,
      maraSprites: maraV7,
      maraX: mx,
      maraY: my,
      maraDir: dir,
      maraStep: Math.floor(f / 2) % 4,
      camFocusX: 252 + (mx - 180) * 0.28,
      camFocusY: 244 + (my - 236) * 0.25,
      animPhase: f / totalFrames,
    });
    const fp = path.join(TMP_GIF, `v7_depth_f${String(f).padStart(2, '0')}.png`);
    writeLosslessPng(fp, res.pixels, VIEW_W, VIEW_H);
    gifPaths.push(fp);
  }
  makeGif(gifPaths, path.join(D_PROOFS, 'proof_E_depth_sort_walkthrough_480x270.gif'), 11);
}

// ----------------------------------------------------------------------------
// 5. BUILD UNSCALED 1X NATIVE COMPARISON MATRICES (ZERO ENLARGEMENT!)
// ----------------------------------------------------------------------------
console.log('5/5 Building unscaled 1x native comparison matrices & playable manifest...');

function buildNative1xGrid2x2(
  outPath: string,
  header: string,
  panels: Array<{ title: string; pixels: Uint8ClampedArray }>
): void {
  const pad = 12;
  const topH = 26;
  const cellW = VIEW_W;
  const cellH = VIEW_H + 16;
  const BW = pad * 3 + cellW * 2;
  const BH = topH + pad * 2 + cellH * 2;
  const board = createEmptyBuffer(BW, BH);
  fillBoardBgV4(board, BW, BH);
  drawTextV4(board, BW, BH, header, pad, 8, 1, { r: 252, g: 218, b: 142, a: 255 });

  panels.forEach((p, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = pad + col * (cellW + pad);
    const y = topH + row * (cellH + pad);
    drawTextV4(board, BW, BH, p.title, x, y, 1, { r: 142, g: 232, b: 220, a: 255 });
    blitV4(board, BW, BH, p.pixels, VIEW_W, VIEW_H, x, y + 12);
    drawRectBorder(board, BW, BH, x - 1, y + 11, VIEW_W + 2, VIEW_H + 2, { r: 120, g: 168, b: 192, a: 255 });
  });
  writeLosslessPng(outPath, board, BW, BH);
}

buildNative1xGrid2x2(
  path.join(D_PROOFS, 'comparison_A_vs_B_C_D_native_1x.png'),
  'VERDANT SIGNAL V7.0 - UNSCALED NATIVE 1X (480X270 EACH) COMPARISON: CURRENT M01 OVERHEAD VS IMMERSIVE BIOMES',
  [
    { title: 'A. CURRENT M01 DISTANT OVERHEAD (480X270 NATIVE 1X)', pixels: proofA },
    { title: 'B. V7.0 IMMERSIVE DENSE FOREST (480X270 NATIVE 1X)', pixels: proofB },
    { title: 'C. V7.0 IMMERSIVE LIVING SWAMP (480X270 NATIVE 1X)', pixels: proofC },
    { title: 'D. V7.0 IMMERSIVE VAST COAST (480X270 NATIVE 1X)', pixels: proofD },
  ]
);

buildNative1xGrid2x2(
  path.join(D_PROOFS, 'comparison_E_depth_sort_4steps_native_1x.png'),
  'VERDANT SIGNAL V7.0 - PROOF E: UNSCALED NATIVE 1X (480X270) DEPTH SORTING & OCCLUSION SEQUENCE',
  keyE.map((k, idx) => ({ title: k.label, pixels: eBufs[idx] }))
);

// Write shared manifest for the Live Playable Browser Study & Godot 4.7.2 study scene!
fs.writeFileSync(
  path.join(D_WEB, 'v7_study_manifest.json'),
  JSON.stringify(
    {
      viewport: { width: VIEW_W, height: VIEW_H },
      mara: { frameW: maraV7.frameW, frameH: maraV7.frameH, sheet: '../sprites/mara_v7_28x40_sheet.png' },
      scenes,
    },
    null,
    2
  ),
  'utf8'
);

console.log('=== VERDANT SIGNAL V7.0 — ALL NATIVE 480x270 PROOFS & SPRITES GENERATED! ===');
