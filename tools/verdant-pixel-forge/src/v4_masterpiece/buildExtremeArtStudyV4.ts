/**
 * VERDANT SIGNAL — ART DIRECTION V4.0 MASTER STUDY SUITE BUILDER
 * ==============================================================
 * Generates ALL isolated V4.0 visual studies, native PNGs, validated editable
 * `.vpf.json` projects, comparison plates (1x + enlarged), AND live animated GIFs
 * under `game/assets/extreme_artistic_study_v4/` (protected by `.gdignore`).
 *
 * ZERO baseline AST-001..AST-007 assets, Godot scenes, scripts, or project.godot
 * settings are modified.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { encodeRGBA8PNG } from '../engine/pngEncoder';
import { createEmptyBuffer, setPixel } from '../engine/pixelBuffer';
import { deserializeProjectJSON } from '../engine/exportEngine';
import { blitV4, drawTextV4, fillBoardBgV4, scaleNearestV4, V4Canvas } from './v4Core';
import { buildMaraV4, getMaraV4Metrics, POSE_HERO_3Q, type MaraPoseSpec, type MaraV4Res } from './v4MaraMasterpiece';
import { MARA_RUN_8F, MARA_TRANSITIONS_12F, MARA_WALK_8F } from './v4MaraAnimations';
import { buildAmberCoastMasterpiece, buildV4TerrainTileStudy, paintV4Glasswort, paintV4TideKelp } from './v4AmberCoastOcean';
import {
  buildSingingCanopyMasterpiece,
  buildUnifiedVerticalSliceV4,
  buildV4DropPodNarrative,
  buildV4HarmonicVfxSheet,
  buildV4ReedwoodMaster,
  paintV4ShelfFungi,
  paintV4SunDropOrchid,
} from './v4SingingCanopyAndProps';

const REPO = path.resolve(process.cwd(), '../..');
const ROOT = path.join(REPO, 'game/assets/extreme_artistic_study_v4');
const D_HERO = path.join(ROOT, '01_hero_mara_lin');
const D_ANIM = path.join(ROOT, '02_animation_studies');
const D_OCEAN = path.join(ROOT, '03_amber_coast_ocean_masterpiece');
const D_FOREST = path.join(ROOT, '04_singing_canopy_alien_forest');
const D_PROPS = path.join(ROOT, '05_props_landmarks_vfx');
const D_SLICE = path.join(ROOT, '06_unified_vertical_slice_v4');
const TMP_GIF = '/tmp/v4_gif_frames';

for (const d of [ROOT, D_HERO, D_ANIM, D_OCEAN, D_FOREST, D_PROPS, D_SLICE, TMP_GIF]) {
  fs.mkdirSync(d, { recursive: true });
}

// Strict Godot isolation
fs.writeFileSync(
  path.join(ROOT, '.gdignore'),
  '# VERDANT SIGNAL V4.0 Extreme Artistic Study — isolated from Godot imports during artistic review.\n',
  'utf8'
);

function savePngAndVpf(pngPath: string, vpfPath: string, px: Uint8ClampedArray, w: number, h: number, vpfJson: string): void {
  fs.writeFileSync(pngPath, encodeRGBA8PNG(px, w, h));
  fs.writeFileSync(vpfPath, vpfJson, 'utf8');
  const parsed = deserializeProjectJSON(vpfJson);
  if (parsed.width !== w || parsed.height !== h) {
    throw new Error(`VPF round-trip failed for ${vpfPath}`);
  }
}

function makeAnimatedGif(framePaths: string[], outGif: string, delayCs: number): void {
  execFileSync('convert', ['-dispose', 'background', '-delay', String(delayCs), '-loop', '0', ...framePaths, outGif]);
}

function drawRule(buf: Uint8ClampedArray, w: number, h: number, x0: number, x1: number, y: number): void {
  for (let x = x0; x <= x1; x++) setPixel(buf, w, h, x, y, { r: 68, g: 94, b: 118, a: 255 });
}

console.log('=== BUILDING VERDANT SIGNAL V4.0 EXTREME ARTISTIC MASTER STUDY ===');

// ---------------------------------------------------------------------------
// 1. HERO DR. MARA LIN — ALL 5 NATIVE RESOLUTIONS + COMPARISON BOARD (1X / 2X / 3X)
// ---------------------------------------------------------------------------
const resList: MaraV4Res[] = ['48x64', '64x80', '64x96', '96x128', '128x128'];
const heroByRes: Record<MaraV4Res, { px: Uint8ClampedArray; w: number; h: number; gy: number }> = {} as any;

for (const res of resList) {
  const m = getMaraV4Metrics(res);
  const built = buildMaraV4(res, POSE_HERO_3Q);
  const px = built.canvas.composite();
  heroByRes[res] = { px, w: m.w, h: m.h, gy: m.groundY };
  savePngAndVpf(
    path.join(D_HERO, `mara_v4_master_${res}.png`),
    path.join(D_HERO, `mara_v4_master_${res}.vpf.json`),
    px, m.w, m.h, built.vpfJson
  );
}

// Board 01: 5-Way Native Hero Resolution Comparison at 1X, 2X, and 3X!
{
  const SW = 456;
  const SH = 136;
  const strip1x = createEmptyBuffer(SW, SH);
  const gY = 126;
  drawRule(strip1x, SW, SH, 6, SW - 7, gY + 1);
  const offsets: Array<{ res: MaraV4Res; x: number; label: string; highlight?: boolean }> = [];
  let cx = 12;
  for (const res of resList) {
    const h = heroByRes[res];
    blitV4(strip1x, SW, SH, h.px, h.w, h.h, cx, gY - h.gy);
    offsets.push({
      res,
      x: cx,
      label: res === '64x96' ? '64X96*' : res === '128x128' ? '128X128 HERO' : res.toUpperCase(),
      highlight: res === '64x96' || res === '128x128',
    });
    cx += h.w + 10;
  }
  const s2x = scaleNearestV4(strip1x, SW, SH, 2);
  const s3x = scaleNearestV4(strip1x, SW, SH, 3);

  const BW = s3x.width + 48; // 1416 px
  const BH = 70 + SH + 34 + s2x.height + 40 + s3x.height + 52;
  const board = createEmptyBuffer(BW, BH);
  fillBoardBgV4(board, BW, BH);

  drawTextV4(board, BW, BH, 'VERDANT SIGNAL V4.0 - DR. MARA LIN NATIVE RESOLUTION MASTER STUDY (1X / 2X / 3X)', 24, 16, 2, { r: 248, g: 215, b: 136, a: 255 });
  drawTextV4(board, BW, BH, 'ALL FIVE RESOLUTIONS AUTHORED NATIVELY (ZERO UPSCALING) - 4-MATERIAL SEPARATION & CURVED ENVIRONMENTAL VISOR REFLECTIONS', 24, 38, 1, { r: 162, g: 204, b: 222, a: 255 });

  const y1 = 62;
  drawTextV4(board, BW, BH, '1X NATIVE PIXELS', 24, y1, 1, { r: 138, g: 228, b: 216, a: 255 });
  blitV4(board, BW, BH, strip1x, SW, SH, 24, y1 + 12);

  const y2 = y1 + SH + 24;
  drawTextV4(board, BW, BH, '2X INTEGER GAMEPLAY SCALE', 24, y2, 1, { r: 138, g: 228, b: 216, a: 255 });
  blitV4(board, BW, BH, s2x.pixels, s2x.width, s2x.height, 24, y2 + 12);

  const y3 = y2 + s2x.height + 28;
  drawTextV4(board, BW, BH, '3X MASTER CRAFTSMANSHIP INSPECTION', 24, y3, 2, { r: 138, g: 228, b: 216, a: 255 });
  blitV4(board, BW, BH, s3x.pixels, s3x.width, s3x.height, 24, y3 + 22);
  for (const o of offsets) {
    drawTextV4(
      board, BW, BH, o.label, 24 + o.x * 3, y3 + 22 + s3x.height + 10, 2,
      o.highlight ? { r: 252, g: 214, b: 112, a: 255 } : { r: 205, g: 218, b: 230, a: 255 }
    );
  }
  fs.writeFileSync(path.join(D_HERO, 'board_01_mara_5res_comparison_1x_2x_3x.png'), encodeRGBA8PNG(board, BW, BH));
}

// ---------------------------------------------------------------------------
// 2. ANIMATION MASTER STUDIES (64x96 NATIVE): WALK 8F + RUN 8F + TRANSITIONS 13F + LIVE GIFS!
// ---------------------------------------------------------------------------
function renderAnimStrip(
  poses: MaraPoseSpec[],
  stripPng: string,
  stripVpf: string,
  gifOut: string | null,
  delayCs: number,
  tagName: string
): Uint8ClampedArray[] {
  const fw = 64, fh = 96;
  const sw = poses.length * fw;
  const stripCanvas = new V4Canvas(sw, fh, [{ id: 'l01_strip', name: `${tagName} Animation Strip` }]);
  const frameBufs: Uint8ClampedArray[] = [];
  const gifFrames: string[] = [];

  poses.forEach((p, idx) => {
    const built = buildMaraV4('64x96', p);
    const px = built.canvas.composite();
    frameBufs.push(px);
    blitV4(stripCanvas.cels.l01_strip, sw, fh, px, fw, fh, idx * fw, 0);

    if (gifOut) {
      // Render crisp 3x animated frame on dark studio slate with ground reference line!
      const f1x = createEmptyBuffer(fw + 16, fh + 16);
      fillBoardBgV4(f1x, fw + 16, fh + 16);
      drawRule(f1x, fw + 16, fh + 16, 4, fw + 11, 98);
      blitV4(f1x, fw + 16, fh + 16, px, fw, fh, 8, 8);
      const f3x = scaleNearestV4(f1x, fw + 16, fh + 16, 3);
      const fp = path.join(TMP_GIF, `${tagName}_f${String(idx).padStart(2, '0')}.png`);
      fs.writeFileSync(fp, encodeRGBA8PNG(f3x.pixels, f3x.width, f3x.height));
      gifFrames.push(fp);
    }
  });

  const stripComp = stripCanvas.composite();
  savePngAndVpf(
    stripPng,
    stripVpf,
    stripComp,
    sw,
    fh,
    stripCanvas.serializeVpf({
      id: `v4_anim_${tagName}`,
      name: `V4.0 ANIMATION STRIP — ${tagName} (${poses.length}f @ 64x96)`,
      pivot: { x: 31, y: 90 },
      tileSize: 32,
      styleNotes: `Art Direction V4.0 native 64x96 animation study (${tagName}, ${poses.length} handcrafted kinematic frames).`,
    })
  );

  if (gifOut && gifFrames.length > 0) {
    makeAnimatedGif(gifFrames, gifOut, delayCs);
  }
  return frameBufs;
}

const walkBufs = renderAnimStrip(
  MARA_WALK_8F,
  path.join(D_ANIM, 'mara_walk_8f_strip_64x96.png'),
  path.join(D_ANIM, 'mara_walk_8f_strip_64x96.vpf.json'),
  path.join(D_ANIM, 'mara_walk_8f_preview_3x.gif'),
  11,
  'walk_8f'
);

const runBufs = renderAnimStrip(
  MARA_RUN_8F,
  path.join(D_ANIM, 'mara_run_8f_strip_64x96.png'),
  path.join(D_ANIM, 'mara_run_8f_strip_64x96.vpf.json'),
  path.join(D_ANIM, 'mara_run_8f_preview_3x.gif'),
  8,
  'run_8f'
);

const transBufs = renderAnimStrip(
  MARA_TRANSITIONS_12F,
  path.join(D_ANIM, 'mara_transitions_and_actions_strip_64x96.png'),
  path.join(D_ANIM, 'mara_transitions_and_actions_strip_64x96.vpf.json'),
  null,
  18,
  'transitions_13f'
);

// Build Live Seamless Transitions Showcase GIF: Idle(2) -> Start -> Walk(4) -> Surge -> Run(4) -> Skid-Stop -> Crouch -> Jump -> Fall -> Land -> Acoustic Scan!
{
  const seq: Array<{ buf: Uint8ClampedArray; lbl: string }> = [
    { buf: transBufs[0], lbl: 'IDLE BREATHE' },
    { buf: transBufs[1], lbl: 'IDLE BREATHE' },
    { buf: transBufs[2], lbl: 'START ACCEL' },
    { buf: walkBufs[0], lbl: 'WALK STRIDE' },
    { buf: walkBufs[1], lbl: 'WALK STRIDE' },
    { buf: walkBufs[2], lbl: 'WALK STRIDE' },
    { buf: walkBufs[3], lbl: 'WALK STRIDE' },
    { buf: transBufs[3], lbl: 'WALK -> RUN' },
    { buf: runBufs[0], lbl: 'RUN SPRINT' },
    { buf: runBufs[1], lbl: 'RUN SPRINT' },
    { buf: runBufs[2], lbl: 'RUN PUSH-OFF' },
    { buf: runBufs[3], lbl: 'RUN FLIGHT' },
    { buf: transBufs[4], lbl: 'SKID STOP' },
    { buf: transBufs[5], lbl: 'CROUCH LOW' },
    { buf: transBufs[6], lbl: 'CROUCH WALK' },
    { buf: transBufs[7], lbl: 'JUMP RISE' },
    { buf: transBufs[8], lbl: 'AIR FALL' },
    { buf: transBufs[9], lbl: 'SQUASH LAND' },
    { buf: transBufs[11], lbl: 'ACOUSTIC SCAN' },
    { buf: transBufs[11], lbl: 'ACOUSTIC SCAN' },
  ];
  const fps: string[] = [];
  seq.forEach((item, i) => {
    const f1 = createEmptyBuffer(96, 120);
    fillBoardBgV4(f1, 96, 120);
    drawTextV4(f1, 96, 120, item.lbl, 6, 6, 1, { r: 248, g: 215, b: 136, a: 255 });
    drawRule(f1, 96, 120, 6, 89, 110);
    blitV4(f1, 96, 120, item.buf, 64, 96, 16, 20);
    const f3 = scaleNearestV4(f1, 96, 120, 3);
    const fp = path.join(TMP_GIF, `trans_seq_${String(i).padStart(2, '0')}.png`);
    fs.writeFileSync(fp, encodeRGBA8PNG(f3.pixels, f3.width, f3.height));
    fps.push(fp);
  });
  makeAnimatedGif(fps, path.join(D_ANIM, 'mara_transitions_demo_3x.gif'), 14);
}

// Board 02: Complete Annotated Animation Master Study (1X strips + 2X full inspection!)
{
  const CW = 8 * 68 + 16; // 560 native -> 1120 at 2x
  const CH = 478;
  const b1 = createEmptyBuffer(CW, CH);
  fillBoardBgV4(b1, CW, CH);

  drawTextV4(b1, CW, CH, 'V4.0 ANIMATION MASTER STUDY - WALK (8F), RUN (8F), & TRANSITIONS/ACTIONS (13F) @ 64X96', 8, 8, 1, { r: 248, g: 215, b: 136, a: 255 });

  const stampStripRow = (title: string, bufs: Uint8ClampedArray[], labels: string[], y: number) => {
    drawTextV4(b1, CW, CH, title, 8, y, 1, { r: 138, g: 228, b: 216, a: 255 });
    drawRule(b1, CW, CH, 8, CW - 9, y + 99);
    bufs.forEach((buf, i) => {
      blitV4(b1, CW, CH, buf, 64, 96, 8 + i * 68, y + 9);
      drawTextV4(b1, CW, CH, labels[i], 10 + i * 68, y + 102, 1, { r: 185, g: 205, b: 220, a: 255 });
    });
  };

  stampStripRow('01. WALK CYCLE (CONTACT / DOWN / PASSING / HIGH-LIFT X2 + DELAYED PACK/HOSE)', walkBufs,
    ['CONT R', 'DOWN R', 'PASS R', 'LIFT R', 'CONT L', 'DOWN L', 'PASS L', 'LIFT L'], 24);
  stampStripRow('02. RUN CYCLE (20 DEG LEAN, PUSH-OFF DUST, AIRBORNE FLIGHT & ANTENNA WHIP)', runBufs,
    ['STRK R', 'DRIV R', 'PUSH R', 'FLGT R', 'STRK L', 'DRIV L', 'PUSH L', 'FLGT L'], 138);
  stampStripRow('03. TRANSITIONS & LOCOMOTION (IDLE, START, SURGE, SKID-STOP, CROUCH, JUMP)', transBufs.slice(0, 8),
    ['IDLE A', 'IDLE B', 'START', 'W->RUN', 'SKID', 'CROUCH', 'C-WALK', 'JUMP'], 252);
  stampStripRow('04. AIR FALL, LANDING, HURT RECOIL & FIELD SCIENCE ACTIONS (SCAN / SPECIMEN)', transBufs.slice(8),
    ['FALL', 'LAND', 'HURT', 'SCAN', 'PROBE'], 366);

  fs.writeFileSync(path.join(D_ANIM, 'board_02_animation_master_study_1x.png'), encodeRGBA8PNG(b1, CW, CH));
  const b2 = scaleNearestV4(b1, CW, CH, 2);
  fs.writeFileSync(path.join(D_ANIM, 'board_02_animation_master_study_2x.png'), encodeRGBA8PNG(b2.pixels, b2.width, b2.height));
}

// ---------------------------------------------------------------------------
// 3. AMBER COAST & LIVING OCEAN MASTERPIECE (640x360 + 2X + 4F ANIMATED GIF + 32 vs 48 TERRAIN!)
// ---------------------------------------------------------------------------
console.log('Rendering Living Amber Coast Ocean (4 animation phases)...');
const oceanPhases: Uint8ClampedArray[] = [];
const oceanGifPaths: string[] = [];
let ocean0Vpf = '';

for (let i = 0; i < 4; i++) {
  const built = buildAmberCoastMasterpiece(i / 4);
  const px = built.canvas.composite();
  oceanPhases.push(px);
  if (i === 0) ocean0Vpf = built.vpfJson;
  const o2x = scaleNearestV4(px, 640, 360, 2);
  const fp = path.join(TMP_GIF, `ocean_f${i}.png`);
  fs.writeFileSync(fp, encodeRGBA8PNG(o2x.pixels, o2x.width, o2x.height));
  oceanGifPaths.push(fp);
}

savePngAndVpf(
  path.join(D_OCEAN, 'amber_coast_masterpiece_640x360_1x.png'),
  path.join(D_OCEAN, 'amber_coast_masterpiece_640x360_1x.vpf.json'),
  oceanPhases[0], 640, 360, ocean0Vpf
);
const ocean2x = scaleNearestV4(oceanPhases[0], 640, 360, 2);
fs.writeFileSync(path.join(D_OCEAN, 'amber_coast_masterpiece_1280x720_2x.png'), encodeRGBA8PNG(ocean2x.pixels, ocean2x.width, ocean2x.height));
makeAnimatedGif(oceanGifPaths, path.join(D_OCEAN, 'amber_coast_ocean_animated_4f_2x.gif'), 26);

// Native Terrain Resolution Study: 32x32 vs 48x48 (1X, 2X, 3X)!
const terr32 = buildV4TerrainTileStudy(32);
const terr48 = buildV4TerrainTileStudy(48);
const t32Px = terr32.canvas.composite();
const t48Px = terr48.canvas.composite();
savePngAndVpf(path.join(D_OCEAN, 'terrain_v4_native_32x32.png'), path.join(D_OCEAN, 'terrain_v4_native_32x32.vpf.json'), t32Px, terr32.width, terr32.height, terr32.vpfJson);
savePngAndVpf(path.join(D_OCEAN, 'terrain_v4_native_48x48.png'), path.join(D_OCEAN, 'terrain_v4_native_48x48.vpf.json'), t48Px, terr48.width, terr48.height, terr48.vpfJson);

{
  const t32_2 = scaleNearestV4(t32Px, 160, 96, 2);
  const t48_2 = scaleNearestV4(t48Px, 240, 144, 2);
  const t32_3 = scaleNearestV4(t32Px, 160, 96, 3);
  const t48_3 = scaleNearestV4(t48Px, 240, 144, 3);

  const BW = 24 + t32_3.width + 24 + t48_3.width + 24; // 1272 px
  const BH = 68 + 164 + 318 + t48_3.height + 54;
  const board = createEmptyBuffer(BW, BH);
  fillBoardBgV4(board, BW, BH);

  drawTextV4(board, BW, BH, 'V4.0 NATIVE TERRAIN STUDY - 32X32 VS 48X48 GODOT TERRAIN SET MODULES (1X / 2X / 3X)', 24, 16, 2, { r: 248, g: 215, b: 136, a: 255 });
  drawTextV4(board, BW, BH, 'CAUSTIC SHALLOWS, CELLULAR FOAM, MIRROR WET SAND, IRON-OXIDE/QUARTZ CLIFFS & BRANCHING FOREST ROOTS', 24, 38, 1, { r: 162, g: 204, b: 222, a: 255 });

  const y1 = 62;
  drawTextV4(board, BW, BH, '1X NATIVE (32X32 LEFT / 48X48 RIGHT)', 24, y1, 1, { r: 138, g: 228, b: 216, a: 255 });
  blitV4(board, BW, BH, t32Px, 160, 96, 24, y1 + 14);
  blitV4(board, BW, BH, t48Px, 240, 144, 212, y1 + 14);

  const y2 = y1 + 168;
  drawTextV4(board, BW, BH, '2X GAMEPLAY SCALE', 24, y2, 1, { r: 138, g: 228, b: 216, a: 255 });
  blitV4(board, BW, BH, t32_2.pixels, t32_2.width, t32_2.height, 24, y2 + 14);
  blitV4(board, BW, BH, t48_2.pixels, t48_2.width, t48_2.height, 24 + t32_2.width + 24, y2 + 14);

  const y3 = y2 + t48_2.height + 28;
  drawTextV4(board, BW, BH, '3X MICRO-GEOLOGY, FOAM & ROOT INSPECTION', 24, y3, 2, { r: 138, g: 228, b: 216, a: 255 });
  blitV4(board, BW, BH, t32_3.pixels, t32_3.width, t32_3.height, 24, y3 + 22);
  blitV4(board, BW, BH, t48_3.pixels, t48_3.width, t48_3.height, 24 + t32_3.width + 24, y3 + 22);
  drawTextV4(board, BW, BH, '32X32 NATIVE* (RECOMMENDED GRID)', 24, y3 + 22 + t48_3.height + 8, 2, { r: 252, g: 214, b: 112, a: 255 });
  drawTextV4(board, BW, BH, '48X48 NATIVE (LANDMARK DETAIL)', 24 + t32_3.width + 24, y3 + 22 + t48_3.height + 8, 2, { r: 205, g: 218, b: 230, a: 255 });

  fs.writeFileSync(path.join(D_OCEAN, 'board_03_terrain_32_vs_48_native_1x_2x_3x.png'), encodeRGBA8PNG(board, BW, BH));
}

// ---------------------------------------------------------------------------
// 4. SINGING CANOPY ALIEN FOREST SANCTUARY (640x360 + 1280x720 2X!)
// ---------------------------------------------------------------------------
console.log('Rendering Singing Canopy Alien Forest Sanctuary...');
const forestBuilt = buildSingingCanopyMasterpiece(heroByRes['64x96'].px);
const forestPx = forestBuilt.canvas.composite();
savePngAndVpf(
  path.join(D_FOREST, 'singing_canopy_masterpiece_640x360_1x.png'),
  path.join(D_FOREST, 'singing_canopy_masterpiece_640x360_1x.vpf.json'),
  forestPx, 640, 360, forestBuilt.vpfJson
);
const forest2x = scaleNearestV4(forestPx, 640, 360, 2);
fs.writeFileSync(path.join(D_FOREST, 'singing_canopy_masterpiece_1280x720_2x.png'), encodeRGBA8PNG(forest2x.pixels, forest2x.width, forest2x.height));

// ---------------------------------------------------------------------------
// 5. DEDICATED PROPS, TREES, FLORA, NARRATIVE DROP-POD & VFX MASTER SHEET!
// ---------------------------------------------------------------------------
console.log('Rendering Dedicated V4.0 Props, Reedwood, Drop-Pod & VFX Studies...');
const reedBuilt = buildV4ReedwoodMaster('ancient');
const podBuilt = buildV4DropPodNarrative();
const vfxBuilt = buildV4HarmonicVfxSheet();
const reedPx = reedBuilt.canvas.composite();
const podPx = podBuilt.canvas.composite();
const vfxPx = vfxBuilt.canvas.composite();

savePngAndVpf(path.join(D_PROPS, 'prop_v4_reedwood_160x224.png'), path.join(D_PROPS, 'prop_v4_reedwood_160x224.vpf.json'), reedPx, 160, 224, reedBuilt.vpfJson);
savePngAndVpf(path.join(D_PROPS, 'prop_v4_droppod_narrative_240x152.png'), path.join(D_PROPS, 'prop_v4_droppod_narrative_240x152.vpf.json'), podPx, 240, 152, podBuilt.vpfJson);
savePngAndVpf(path.join(D_PROPS, 'fx_v4_harmonic_vfx_256x128.png'), path.join(D_PROPS, 'fx_v4_harmonic_vfx_256x128.vpf.json'), vfxPx, 256, 128, vfxBuilt.vpfJson);

// Build showcase Flora Strip (Amber Tide-Kelp + Mirror Glasswort + Sun-Drop Orchid + Violet Shelf-Fungi)
const floraCanvas = new V4Canvas(200, 88, [{ id: 'l01', name: 'Flora' }, { id: 'l02', name: 'Glow' }]);
paintV4TideKelp(floraCanvas, 'l01', 28, 76, 1.35, 0);
paintV4Glasswort(floraCanvas, 'l01', 78, 76, 1.35);
paintV4SunDropOrchid(floraCanvas, 'l01', 'l02', 132, 74, 1.35);
paintV4ShelfFungi(floraCanvas, 'l01', 'l02', 178, 66, 1.45);
const floraPx = floraCanvas.composite();

// Board 05: All Upgraded AST-004..AST-007 Masterpieces at 1X & 2X!
{
  const BW = 1160;
  const BH = 600;
  const board = createEmptyBuffer(BW, BH);
  fillBoardBgV4(board, BW, BH);

  drawTextV4(board, BW, BH, 'V4.0 MASTER PROPS & VFX - REEDWOOD (AST-004), FLORA (AST-005), DROP-POD (AST-006) & VFX', 20, 14, 2, { r: 248, g: 215, b: 136, a: 255 });

  // Left: Ancient Singing Reedwood 2x!
  const r2 = scaleNearestV4(reedPx, 160, 224, 2);
  drawTextV4(board, BW, BH, 'AST-004 SINGING REEDWOOD (160X224 @ 2X)', 20, 46, 1, { r: 138, g: 228, b: 216, a: 255 });
  blitV4(board, BW, BH, r2.pixels, r2.width, r2.height, 20, 62);
  // 1x Reedwood inset
  blitV4(board, BW, BH, reedPx, 160, 224, 344, 286);
  drawTextV4(board, BW, BH, '1X NATIVE', 386, 514, 1, { r: 185, g: 205, b: 220, a: 255 });

  // Top-Right: Narrative Crashed ICV Meridian Drop-Pod & Camp Diorama 2x!
  const p2 = scaleNearestV4(podPx, 240, 152, 2);
  drawTextV4(board, BW, BH, 'AST-006 CRASHED DROP-POD & CAMP DIORAMA (240X152 @ 2X)', 520, 46, 1, { r: 138, g: 228, b: 216, a: 255 });
  blitV4(board, BW, BH, p2.pixels, p2.width, p2.height, 520, 62);

  // Bottom-Right Left: Alien Flora 1.5x -> crisp 2x well separated from VFX!
  const f2 = scaleNearestV4(floraPx, 200, 88, 2);
  drawTextV4(board, BW, BH, 'AST-005 ALIEN FLORA (2X)', 480, 384, 1, { r: 138, g: 228, b: 216, a: 255 });
  blitV4(board, BW, BH, f2.pixels, f2.width, f2.height, 480, 400);

  // Bottom-Right Right: Layered Harmonic VFX 1x (clean clear margin!)
  drawTextV4(board, BW, BH, 'AST-007 HARMONIC VFX (1X)', 896, 384, 1, { r: 138, g: 228, b: 216, a: 255 });
  blitV4(board, BW, BH, vfxPx, 256, 128, 896, 412);

  fs.writeFileSync(path.join(D_PROPS, 'board_05_reedwood_flora_droppod_vfx_1x_2x.png'), encodeRGBA8PNG(board, BW, BH));
}

// ---------------------------------------------------------------------------
// 6. THE CROWN JEWEL — UNIFIED V4.0 VERTICAL SLICE (640x360 1X & 1280x720 2X!)
// ---------------------------------------------------------------------------
console.log('Rendering Crown-Jewel Unified V4.0 Vertical Slice...');
const sliceBuilt = buildUnifiedVerticalSliceV4(
  oceanPhases[0],
  transBufs[11] // Active Acoustic Lens Scan 64x96!
);
const slicePx = sliceBuilt.canvas.composite();
savePngAndVpf(
  path.join(D_SLICE, 'verdant_signal_v4_vertical_slice_640x360_1x.png'),
  path.join(D_SLICE, 'verdant_signal_v4_vertical_slice_640x360_1x.vpf.json'),
  slicePx, 640, 360, sliceBuilt.vpfJson
);
const slice2x = scaleNearestV4(slicePx, 640, 360, 2);
fs.writeFileSync(path.join(D_SLICE, 'verdant_signal_v4_vertical_slice_1280x720_2x.png'), encodeRGBA8PNG(slice2x.pixels, slice2x.width, slice2x.height));

console.log('=== ALL V4.0 MASTER STUDY ASSETS, COMPARISON BOARDS, VPF SOURCES & ANIMATED GIFS COMPLETE! ===');
