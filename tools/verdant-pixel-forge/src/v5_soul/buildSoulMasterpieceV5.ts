/**
 * VERDANT SIGNAL V5.0 — THE SOUL OF PIXEL ART MASTER STUDY BUILDER
 * =================================================================
 * Generates all three isolated V5.0 Masterpiece Demonstrations under
 * `game/assets/soul_of_pixel_art_v5/` (protected by `.gdignore`):
 *   A. THE HERO — Soulful Dr. Mara Lin (Portrait 128x128, Hero 64x96/128x128,
 *      32 handcrafted animation frames + 4 live animated GIFs + inspection boards)
 *   B. THE OCEAN — Breathtaking Amber Coast Morning Vista (480x270 native 56-color
 *      pixel art, 12-frame living animated GIF, 1x/2x/3x + 4x pixel-cluster loupes)
 *   C. THE LIVING WORLD — Singing Canopy Alien Forest Sanctuary (480x270 native
 *      56-color pixel art, 12-frame living animated GIF, 1x/2x/3x + 4x pixel loupes)
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { encodeRGBA8PNG } from '../engine/pngEncoder';
import { createEmptyBuffer, setPixel } from '../engine/pixelBuffer';
import { deserializeProjectJSON } from '../engine/exportEngine';
import { V4Canvas, blitV4, drawTextV4, fillBoardBgV4, scaleNearestV4 } from '../v4_masterpiece/v4Core';
import {
  AMBER_COAST_V5_PALETTE,
  SINGING_CANOPY_V5_PALETTE,
  cropRgba,
  drawPaletteSwatches,
  drawRectBorder,
} from './v5PixelEngine';
import { buildMaraV5, buildMaraV5MasterPortrait128, type MaraV5Pose } from './v5MaraSoul';
import { MARA_V5_EMOTIONS_10F, MARA_V5_IDLE_6F, MARA_V5_RUN_8F, MARA_V5_WALK_8F } from './v5MaraAnimations';
import { buildForestMasterpieceV5, buildOceanMasterpieceV5 } from './v5LivingWorlds';

const REPO = path.resolve(process.cwd(), '../..');
const ROOT = path.join(REPO, 'game/assets/soul_of_pixel_art_v5');
const D_HERO = path.join(ROOT, 'A_the_hero_mara_lin');
const D_OCEAN = path.join(ROOT, 'B_the_ocean_amber_coast');
const D_FOREST = path.join(ROOT, 'C_the_living_world_forest');
const TMP_GIF = '/tmp/v5_gif_frames';

const D_HERO_FRAMES = path.join(D_HERO, 'frames');
const D_OCEAN_FRAMES = path.join(D_OCEAN, 'frames');
const D_FOREST_FRAMES = path.join(D_FOREST, 'frames');

for (const d of [ROOT, D_HERO, D_OCEAN, D_FOREST, D_HERO_FRAMES, D_OCEAN_FRAMES, D_FOREST_FRAMES, TMP_GIF]) {
  fs.mkdirSync(d, { recursive: true });
}

fs.writeFileSync(
  path.join(ROOT, '.gdignore'),
  '# VERDANT SIGNAL V5.0 — The Soul of Pixel Art Master Study (isolated from Godot imports during artistic review).\n',
  'utf8'
);

function writeLosslessPng(filePath: string, px: Uint8ClampedArray, w: number, h: number): void {
  const rawPath = `${filePath}.raw.png`;
  fs.writeFileSync(rawPath, encodeRGBA8PNG(px, w, h));
  execFileSync('convert', [rawPath, '-strip', '-define', 'png:compression-level=9', `PNG32:${filePath}`]);
  fs.unlinkSync(rawPath);
}

function savePngAndVpf(pngPath: string, vpfPath: string, px: Uint8ClampedArray, w: number, h: number, vpfJson: string): void {
  writeLosslessPng(pngPath, px, w, h);
  fs.writeFileSync(vpfPath, vpfJson, 'utf8');
  const parsed = deserializeProjectJSON(vpfJson);
  if (parsed.width !== w || parsed.height !== h) {
    throw new Error(`VPF round-trip validation failed for ${vpfPath}`);
  }
}

function makeGif(framePaths: string[], outGif: string, delayCs: number, dispose: 'background' | 'none' = 'background'): void {
  execFileSync('convert', ['-dispose', dispose, '-delay', String(delayCs), '-loop', '0', ...framePaths, '-layers', 'Optimize', outGif]);
}

function drawRule(buf: Uint8ClampedArray, w: number, h: number, x0: number, x1: number, y: number): void {
  for (let x = x0; x <= x1; x++) setPixel(buf, w, h, x, y, { r: 74, g: 102, b: 126, a: 255 });
}

console.log('=== BUILDING VERDANT SIGNAL V5.0 — THE SOUL OF PIXEL ART ===');

// ============================================================================
// A. THE HERO — DR. MARA LIN WITH A SOUL
// ============================================================================
console.log('1/3 Crafting A. THE HERO (Soulful Portrait, Standing Hero & 32 Living Animation Frames)...');

const portrait = buildMaraV5MasterPortrait128('/tmp/v5_paint_underlay/mara_portrait_underpaint.png');
const portraitPx = portrait.basePixels;
savePngAndVpf(
  path.join(D_HERO, 'mara_v5_soul_portrait_128x128.png'),
  path.join(D_HERO, 'mara_v5_soul_portrait_128x128.vpf.json'),
  portraitPx, 128, 128, portrait.vpfJson
);
const p3x = scaleNearestV4(portraitPx, 128, 128, 3);
writeLosslessPng(path.join(D_HERO, 'mara_v5_soul_portrait_3x.png'), p3x.pixels, p3x.width, p3x.height);

// Export Living Blinking & Breeze-Rippled 6-Frame Hero Portrait GIF @ 3x!
{
  const pGifPaths: string[] = [];
  // Natural peaceful rhythm: hold open eyes gently, brief quiet blink, soft breeze flutter!
  const seq = [0, 1, 2, 3, 4, 5, 0, 1, 2, 3];
  seq.forEach((fIdx, step) => {
    const z3 = scaleNearestV4(portrait.frames[fIdx], 128, 128, 3);
    const fp = path.join(TMP_GIF, `portrait_v5_f${String(step).padStart(2, '0')}.png`);
    writeLosslessPng(fp, z3.pixels, z3.width, z3.height);
    pGifPaths.push(fp);
  });
  makeGif(pGifPaths, path.join(D_HERO, 'mara_v5_portrait_living_3x.gif'), 24, 'none');
}

const hero64 = buildMaraV5('64x96', MARA_V5_IDLE_6F[0]);
const hero64Px = hero64.canvas.composite();
savePngAndVpf(
  path.join(D_HERO, 'mara_v5_hero_standing_64x96.png'),
  path.join(D_HERO, 'mara_v5_hero_standing_64x96.vpf.json'),
  hero64Px, 64, 96, hero64.vpfJson
);

const hero128 = buildMaraV5('128x128', MARA_V5_IDLE_6F[0]);
const hero128Px = hero128.canvas.composite();
savePngAndVpf(
  path.join(D_HERO, 'mara_v5_hero_standing_128x128.png'),
  path.join(D_HERO, 'mara_v5_hero_standing_128x128.vpf.json'),
  hero128Px, 128, 128, hero128.vpfJson
);

function renderAnimSuite(
  poses: MaraV5Pose[],
  stripPng: string,
  stripVpf: string,
  gifOut: string | null,
  delayCs: number,
  tag: string
): Uint8ClampedArray[] {
  const fw = 64, fh = 96;
  const sw = poses.length * fw;
  const stripCanvas = new V4Canvas(sw, fh, [{ id: 'l01', name: `${tag} Strip` }]);
  const bufs: Uint8ClampedArray[] = [];
  const gifFrames: string[] = [];

  poses.forEach((pose, idx) => {
    const built = buildMaraV5('64x96', pose);
    const px = built.canvas.composite();
    bufs.push(px);
    blitV4(stripCanvas.cels.l01, sw, fh, px, fw, fh, idx * fw, 0);
    // Export individual native 1x animation frame PNG!
    writeLosslessPng(
      path.join(D_HERO_FRAMES, `mara_${tag}_${String(idx).padStart(2, '0')}_${pose.name}.png`),
      px, fw, fh
    );

    if (gifOut) {
      const f1 = createEmptyBuffer(fw + 24, fh + 20);
      fillBoardBgV4(f1, fw + 24, fh + 20);
      drawRule(f1, fw + 24, fh + 20, 6, fw + 17, 98);
      blitV4(f1, fw + 24, fh + 20, px, fw, fh, 12, 10);
      const f3 = scaleNearestV4(f1, fw + 24, fh + 20, 3);
      const fp = path.join(TMP_GIF, `${tag}_${String(idx).padStart(2, '0')}.png`);
      writeLosslessPng(fp, f3.pixels, f3.width, f3.height);
      gifFrames.push(fp);
    }
  });

  savePngAndVpf(
    stripPng, stripVpf, stripCanvas.composite(), sw, fh,
    stripCanvas.serializeVpf({
      id: `v5_mara_${tag}`,
      name: `V5.0 SOUL — Dr. Mara Lin ${tag} (${poses.length}f @ 64x96)`,
      pivot: { x: 32, y: 88 },
      tileSize: 32,
      styleNotes: `Art Direction V5.0 handcrafted ${tag} animation strip (${poses.length} bespoke frames @ 64x96).`,
    })
  );

  if (gifOut && gifFrames.length > 0) makeGif(gifFrames, gifOut, delayCs);
  return bufs;
}

const idleBufs = renderAnimSuite(
  MARA_V5_IDLE_6F,
  path.join(D_HERO, 'mara_v5_idle_6f_strip_64x96.png'),
  path.join(D_HERO, 'mara_v5_idle_6f_strip_64x96.vpf.json'),
  path.join(D_HERO, 'mara_v5_idle_breath_3x.gif'),
  20,
  'idle_6f'
);

const walkBufs = renderAnimSuite(
  MARA_V5_WALK_8F,
  path.join(D_HERO, 'mara_v5_walk_8f_strip_64x96.png'),
  path.join(D_HERO, 'mara_v5_walk_8f_strip_64x96.vpf.json'),
  path.join(D_HERO, 'mara_v5_walk_8f_3x.gif'),
  11,
  'walk_8f'
);

const runBufs = renderAnimSuite(
  MARA_V5_RUN_8F,
  path.join(D_HERO, 'mara_v5_run_8f_strip_64x96.png'),
  path.join(D_HERO, 'mara_v5_run_8f_strip_64x96.vpf.json'),
  path.join(D_HERO, 'mara_v5_run_8f_3x.gif'),
  8,
  'run_8f'
);

const emoBufs = renderAnimSuite(
  MARA_V5_EMOTIONS_10F,
  path.join(D_HERO, 'mara_v5_emotions_10f_strip_64x96.png'),
  path.join(D_HERO, 'mara_v5_emotions_10f_strip_64x96.vpf.json'),
  null,
  18,
  'emotions_10f'
);

// Build continuous Emotional & Transitions Acting Reel GIF!
{
  const reel: Array<{ buf: Uint8ClampedArray; lbl: string }> = [
    { buf: idleBufs[0], lbl: 'QUIET BREATH' },
    { buf: idleBufs[2], lbl: 'MORNING BREEZE' },
    { buf: emoBufs[3], lbl: 'QUIET WONDER' },
    { buf: emoBufs[3], lbl: 'QUIET WONDER' },
    { buf: emoBufs[0], lbl: 'START LEAN' },
    { buf: walkBufs[0], lbl: 'HUMAN WALK' },
    { buf: walkBufs[1], lbl: 'HUMAN WALK' },
    { buf: walkBufs[2], lbl: 'HUMAN WALK' },
    { buf: walkBufs[3], lbl: 'HUMAN WALK' },
    { buf: emoBufs[1], lbl: 'WALK -> RUN' },
    { buf: runBufs[0], lbl: 'POWERFUL RUN' },
    { buf: runBufs[1], lbl: 'POWERFUL RUN' },
    { buf: runBufs[2], lbl: 'PUSH-OFF' },
    { buf: runBufs[3], lbl: 'AIR FLIGHT' },
    { buf: emoBufs[2], lbl: 'WEIGHTY SKID-STOP' },
    { buf: emoBufs[2], lbl: 'WEIGHTY SKID-STOP' },
    { buf: emoBufs[5], lbl: 'EXHAUSTED BREATH' },
    { buf: emoBufs[5], lbl: 'EXHAUSTED BREATH' },
    { buf: emoBufs[4], lbl: 'CURIOSITY & AWE' },
    { buf: emoBufs[4], lbl: 'CURIOSITY & AWE' },
    { buf: emoBufs[6], lbl: 'STARTLED ALERT' },
    { buf: emoBufs[9], lbl: 'HARMONIC SCAN' },
    { buf: emoBufs[9], lbl: 'HARMONIC SCAN' },
  ];
  const rFrames: string[] = [];
  reel.forEach((item, i) => {
    const f1 = createEmptyBuffer(108, 122);
    fillBoardBgV4(f1, 108, 122);
    drawTextV4(f1, 108, 122, item.lbl, 6, 6, 1, { r: 252, g: 218, b: 142, a: 255 });
    drawRule(f1, 108, 122, 6, 101, 112);
    blitV4(f1, 108, 122, item.buf, 64, 96, 22, 22);
    const f3 = scaleNearestV4(f1, 108, 122, 3);
    const fp = path.join(TMP_GIF, `soul_reel_${String(i).padStart(2, '0')}.png`);
    writeLosslessPng(fp, f3.pixels, f3.width, f3.height);
    rFrames.push(fp);
  });
  makeGif(rFrames, path.join(D_HERO, 'mara_v5_soul_and_transitions_3x.gif'), 15);
}

// Board A1: Hero Portrait & Expressive Character Study (1X / 2X / 3X)!
{
  const BW = 1240;
  const BH = 560;
  const board = createEmptyBuffer(BW, BH);
  fillBoardBgV4(board, BW, BH);
  drawTextV4(board, BW, BH, 'A. THE HERO - DR. MARA LIN: CHARACTER WITH A SOUL (V5.0 PORTRAIT & KEY EMOTIONAL POSES)', 20, 14, 2, { r: 252, g: 218, b: 142, a: 255 });
  drawTextV4(board, BW, BH, 'HANDCRAFTED 48-COLOR PIXEL ART - FLOWING EXPEDITION SCARF, SUNRISE VISOR REFLECTION & SUBTLE HUMAN GAZE', 20, 36, 1, { r: 162, g: 212, b: 226, a: 255 });

  // Left: 128x128 Close-Up Portrait at 3x (384x384) + 1x native inset!
  drawTextV4(board, BW, BH, 'EMOTIONAL PORTRAIT (128X128 - 3X)', 20, 62, 1, { r: 142, g: 232, b: 220, a: 255 });
  blitV4(board, BW, BH, p3x.pixels, 384, 384, 20, 78);
  drawRectBorder(board, BW, BH, 19, 77, 386, 386, { r: 248, g: 204, b: 120, a: 255 });
  // 1x native portrait + 1x native 64x96 gameplay hero side-by-side underneath!
  blitV4(board, BW, BH, portraitPx, 128, 128, 424, 334);
  drawRectBorder(board, BW, BH, 423, 333, 130, 130, { r: 120, g: 160, b: 185, a: 255 });
  drawTextV4(board, BW, BH, '1X PORTRAIT', 424, 470, 1, { r: 192, g: 212, b: 225, a: 255 });

  blitV4(board, BW, BH, hero64Px, 64, 96, 574, 366);
  drawTextV4(board, BW, BH, '1X HERO', 578, 470, 1, { r: 192, g: 212, b: 225, a: 255 });

  // Center-Top: Standing 128x128 Hero @ 2x (256x256)
  const h128_2x = scaleNearestV4(hero128Px, 128, 128, 2);
  drawTextV4(board, BW, BH, 'GALLERY FIGURE (128X128 - 2X)', 424, 62, 1, { r: 142, g: 232, b: 220, a: 255 });
  blitV4(board, BW, BH, h128_2x.pixels, 256, 256, 420, 74);

  // Right Showcase Grid: 4 Iconic Soulful Poses @ 3x! (Wonder, Curiosity w/ Orchid, Skid-Stop, Harmonic Scan!)
  drawTextV4(board, BW, BH, 'EMOTIONAL ACTING & WEIGHT SHOWCASE (NATIVE 64X96 - 2X)', 694, 62, 1, { r: 142, g: 232, b: 220, a: 255 });
  const keyShow: Array<{ buf: Uint8ClampedArray; title: string; col: number; row: number }> = [
    { buf: emoBufs[3], title: 'QUIET WONDER', col: 0, row: 0 },
    { buf: emoBufs[4], title: 'CURIOSITY & ORCHID', col: 1, row: 0 },
    { buf: emoBufs[2], title: 'WEIGHTY SKID-STOP', col: 2, row: 0 },
    { buf: emoBufs[5], title: 'EXHAUSTED BREATH', col: 0, row: 1 },
    { buf: emoBufs[6], title: 'STARTLED ALERT', col: 1, row: 1 },
    { buf: emoBufs[9], title: 'HARMONIC SCAN', col: 2, row: 1 },
  ];
  for (const k of keyShow) {
    const s2 = scaleNearestV4(k.buf, 64, 96, 2);
    const x = 694 + k.col * 176;
    const y = 84 + k.row * 224;
    drawRule(board, BW, BH, x + 8, x + 136, y + 176);
    blitV4(board, BW, BH, s2.pixels, 128, 192, x + 10, y);
    drawTextV4(board, BW, BH, k.title, x + 12, y + 194, 1, { r: 245, g: 215, b: 145, a: 255 });
  }

  writeLosslessPng(path.join(D_HERO, 'board_A1_mara_soul_showcase_1x_2x_3x.png'), board, BW, BH);
}

// Board A2: Complete 32-Frame Annotated Living Animation Sheet (1X & 2X)!
{
  const CW = 10 * 66 + 16; // 676 native -> 1352 at 2x
  const CH = 480;
  const b1 = createEmptyBuffer(CW, CH);
  fillBoardBgV4(b1, CW, CH);
  drawTextV4(b1, CW, CH, 'A. THE HERO - COMPLETE LIVING ANIMATIONS: IDLE (6F), HUMAN WALK (8F), POWERFUL RUN (8F) & SOUL (10F) - 64X96', 8, 8, 1, { r: 252, g: 218, b: 142, a: 255 });

  const stampRow = (title: string, bufs: Uint8ClampedArray[], poses: MaraV5Pose[], y: number) => {
    drawTextV4(b1, CW, CH, title, 8, y, 1, { r: 142, g: 232, b: 220, a: 255 });
    drawRule(b1, CW, CH, 8, CW - 9, y + 98);
    bufs.forEach((buf, i) => {
      blitV4(b1, CW, CH, buf, 64, 96, 8 + i * 66, y + 10);
      drawTextV4(b1, CW, CH, poses[i].label, 10 + i * 66, y + 102, 1, { r: 192, g: 212, b: 225, a: 255 });
    });
  };
  stampRow('01. LIVING IDLE BREATHING & COASTAL WIND SCARF (6 FRAMES)', idleBufs, MARA_V5_IDLE_6F, 24);
  stampRow('02. HUMAN WALKING CYCLE (HEEL-STRIKE TOE-UP, WEIGHT SINK, TALL PASS, FLEXED TOE-OFF)', walkBufs, MARA_V5_WALK_8F, 138);
  stampRow('03. POWERFUL ATHLETIC RUN (22 DEG LEAN, AIRBORNE FLIGHT, WHIPPING SCARF & DUST CURLS)', runBufs, MARA_V5_RUN_8F, 252);
  stampRow('04. WEIGHTY TRANSITIONS & EMOTIONAL SOUL STUDY (10 INDIVIDUALLY ACTED POSES)', emoBufs, MARA_V5_EMOTIONS_10F, 366);

  writeLosslessPng(path.join(D_HERO, 'board_A2_mara_living_animations_1x.png'), b1, CW, CH);
  const b2 = scaleNearestV4(b1, CW, CH, 2);
  writeLosslessPng(path.join(D_HERO, 'board_A2_mara_living_animations_2x.png'), b2.pixels, b2.width, b2.height);
}

// ============================================================================
// HELPER FOR B & C — PIXEL-LEVEL MASTERPIECE INSPECTION BOARDS (1X + 2X + 4X LOUPES!)
// ============================================================================
function buildWorldInspectionBoard(opts: {
  outPath: string;
  title: string;
  subtitle: string;
  base1x: Uint8ClampedArray;
  w: number;
  h: number;
  paletteHex: string[];
  loupes: Array<{ label: string; rx: number; ry: number; rw: number; rh: number }>;
}): void {
  const s2 = scaleNearestV4(opts.base1x, opts.w, opts.h, 2); // 960x540
  const BW = 1500;
  const BH = 860;
  const board = createEmptyBuffer(BW, BH);
  fillBoardBgV4(board, BW, BH);

  drawTextV4(board, BW, BH, opts.title, 20, 14, 2, { r: 252, g: 218, b: 142, a: 255 });
  drawTextV4(board, BW, BH, opts.subtitle, 20, 36, 1, { r: 162, g: 212, b: 226, a: 255 });

  // Main 2X cinema showcase (960x540) on top-left
  drawTextV4(board, BW, BH, '2X INTEGER CINEMA VIEW (960X540 - 4X TO 1920X1080)', 20, 56, 1, { r: 142, g: 232, b: 220, a: 255 });
  blitV4(board, BW, BH, s2.pixels, s2.width, s2.height, 20, 70);
  drawRectBorder(board, BW, BH, 19, 69, s2.width + 2, s2.height + 2, { r: 248, g: 204, b: 120, a: 255 });

  // True 1X Native Gameplay Scale (480x270) on top-right!
  drawTextV4(board, BW, BH, 'TRUE 1X NATIVE PIXEL ART (480X270)', 998, 56, 1, { r: 142, g: 232, b: 220, a: 255 });
  blitV4(board, BW, BH, opts.base1x, opts.w, opts.h, 998, 70);
  drawRectBorder(board, BW, BH, 997, 69, opts.w + 2, opts.h + 2, { r: 120, g: 168, b: 192, a: 255 });

  // Visual 56-Color Master Palette Swatch Matrix right below 1X preview (zero text clipping!)
  drawTextV4(board, BW, BH, '56-COLOR CURATED PIXEL PALETTE (HUE-SHIFTED RAMPS)', 998, 362, 1, { r: 245, g: 215, b: 145, a: 255 });
  drawTextV4(board, BW, BH, 'HAND-CLEANED CLUSTERS & 12-FRAME LIVING ANIMATION', 998, 376, 1, { r: 162, g: 212, b: 226, a: 255 });
  drawPaletteSwatches(board, BW, BH, opts.paletteHex, 998, 396, 14, 30, 4);
  drawTextV4(board, BW, BH, 'NATIVE 40X60 DR. MARA LIN (ZERO FRACTIONAL SCALING)', 998, 544, 1, { r: 142, g: 232, b: 220, a: 255 });
  drawTextV4(board, BW, BH, 'ALL 12 INDIVIDUAL FRAMES & VPF SOURCES INCLUDED', 998, 558, 1, { r: 192, g: 212, b: 225, a: 255 });

  // Three 4X PIXEL-LEVEL CLUSTER MAGNIFIER LOUPES across the bottom (proving crisp 56-color pixel craft!)
  drawTextV4(board, BW, BH, '4X PIXEL-CLUSTER INSPECTION LOUPES (ZERO AI BLUR, ZERO MIXELS, 56-COLOR CURATED PIXEL PALETTE)', 20, 624, 1, { r: 142, g: 232, b: 220, a: 255 });

  opts.loupes.forEach((lp, i) => {
    const cropped = cropRgba(opts.base1x, opts.w, opts.h, lp.rx, lp.ry, lp.rw, lp.rh);
    const z4 = scaleNearestV4(cropped, lp.rw, lp.rh, 4);
    const lx = 20 + i * 488;
    const ly = 640;
    blitV4(board, BW, BH, z4.pixels, z4.width, z4.height, lx, ly);
    drawRectBorder(board, BW, BH, lx - 1, ly - 1, z4.width + 2, z4.height + 2, { r: 248, g: 204, b: 120, a: 255 });
    drawTextV4(board, BW, BH, `${i + 1}. ${lp.label}`, lx, ly + z4.height + 8, 1, { r: 245, g: 215, b: 145, a: 255 });
    // Subtle callout frame on 1x preview showing exact loupe region
    drawRectBorder(board, BW, BH, 998 + lp.rx, 70 + lp.ry, lp.rw, lp.rh, { r: 255, g: 224, b: 130, a: 255 });
  });

  writeLosslessPng(opts.outPath, board, BW, BH);
}

// ============================================================================
// B. THE OCEAN — AMBER COAST MORNING MASTERPIECE (480x270 + 12F LIVING GIF!)
// ============================================================================
console.log('2/3 Crafting B. THE OCEAN (480x270 56-Color Pixel Art + 12-Frame Living Ocean GIF)...');
const ocean = buildOceanMasterpieceV5('/tmp/v5_paint_underlay/amber_coast_underpaint.png');
savePngAndVpf(
  path.join(D_OCEAN, 'amber_coast_v5_480x270_1x.png'),
  path.join(D_OCEAN, 'amber_coast_v5_480x270_1x.vpf.json'),
  ocean.basePixels, ocean.width, ocean.height, ocean.vpfJson
);
const ocean2x = scaleNearestV4(ocean.basePixels, ocean.width, ocean.height, 2);
const ocean3x = scaleNearestV4(ocean.basePixels, ocean.width, ocean.height, 3);
writeLosslessPng(path.join(D_OCEAN, 'amber_coast_v5_960x540_2x.png'), ocean2x.pixels, ocean2x.width, ocean2x.height);
writeLosslessPng(path.join(D_OCEAN, 'amber_coast_v5_1440x810_3x.png'), ocean3x.pixels, ocean3x.width, ocean3x.height);

{
  const oGifPaths: string[] = [];
  ocean.frames.forEach((fr, idx) => {
    // Save individual native 1x animation frame!
    writeLosslessPng(path.join(D_OCEAN_FRAMES, `amber_coast_f${String(idx).padStart(2, '0')}_480x270.png`), fr, ocean.width, ocean.height);
    const z2 = scaleNearestV4(fr, ocean.width, ocean.height, 2);
    const fp = path.join(TMP_GIF, `ocean_v5_f${String(idx).padStart(2, '0')}.png`);
    writeLosslessPng(fp, z2.pixels, z2.width, z2.height);
    oGifPaths.push(fp);
  });
  makeGif(oGifPaths, path.join(D_OCEAN, 'amber_coast_living_ocean_12f_2x.gif'), 16, 'none');
}

buildWorldInspectionBoard({
  outPath: path.join(D_OCEAN, 'board_B_ocean_pixel_craft_inspection.png'),
  title: 'B. THE OCEAN - AMBER COAST ALIEN MORNING (V5.0 MASTERPIECE STUDY)',
  subtitle: '56-COLOR CURATED PIXEL PALETTE - SUNRISE WATER SPARKLES, TRANSPARENT SHALLOWS, LACY FOAM & NATIVE MARA',
  base1x: ocean.basePixels,
  w: ocean.width,
  h: ocean.height,
  paletteHex: AMBER_COAST_V5_PALETTE,
  loupes: [
    { label: 'GOLDEN SUNRISE & LIQUID LIGHT', rx: 52, ry: 52, rw: 112, rh: 50 },
    { label: 'TRANSPARENT SHALLOWS, KELP & LACY FOAM', rx: 162, ry: 168, rw: 112, rh: 50 },
    { label: 'NATIVE 40X60 MARA, WET REFLECTION & CLIFFS', rx: 288, ry: 170, rw: 112, rh: 50 },
  ],
});

// ============================================================================
// C. THE LIVING WORLD — SINGING CANOPY ALIEN FOREST SANCTUARY (480x270 + 12F GIF!)
// ============================================================================
console.log('3/3 Crafting C. THE LIVING WORLD (480x270 56-Color Pixel Art + 12-Frame Living Forest GIF)...');
const forest = buildForestMasterpieceV5('/tmp/v5_paint_underlay/singing_canopy_underpaint.png');
savePngAndVpf(
  path.join(D_FOREST, 'singing_canopy_v5_480x270_1x.png'),
  path.join(D_FOREST, 'singing_canopy_v5_480x270_1x.vpf.json'),
  forest.basePixels, forest.width, forest.height, forest.vpfJson
);
const forest2x = scaleNearestV4(forest.basePixels, forest.width, forest.height, 2);
const forest3x = scaleNearestV4(forest.basePixels, forest.width, forest.height, 3);
writeLosslessPng(path.join(D_FOREST, 'singing_canopy_v5_960x540_2x.png'), forest2x.pixels, forest2x.width, forest2x.height);
writeLosslessPng(path.join(D_FOREST, 'singing_canopy_v5_1440x810_3x.png'), forest3x.pixels, forest3x.width, forest3x.height);

{
  const fGifPaths: string[] = [];
  forest.frames.forEach((fr, idx) => {
    // Save individual native 1x animation frame!
    writeLosslessPng(path.join(D_FOREST_FRAMES, `singing_canopy_f${String(idx).padStart(2, '0')}_480x270.png`), fr, forest.width, forest.height);
    const z2 = scaleNearestV4(fr, forest.width, forest.height, 2);
    const fp = path.join(TMP_GIF, `forest_v5_f${String(idx).padStart(2, '0')}.png`);
    writeLosslessPng(fp, z2.pixels, z2.width, z2.height);
    fGifPaths.push(fp);
  });
  makeGif(fGifPaths, path.join(D_FOREST, 'singing_canopy_living_world_12f_2x.gif'), 16, 'none');
}

buildWorldInspectionBoard({
  outPath: path.join(D_FOREST, 'board_C_forest_pixel_craft_inspection.png'),
  title: 'C. THE LIVING WORLD - SINGING CANOPY ALIEN FOREST SANCTUARY (V5.0 MASTERPIECE STUDY)',
  subtitle: '56-COLOR CURATED PIXEL PALETTE - GOLDEN GOD-RAYS, FLUTED REEDWOODS, SPRING POOL, FUNGI & NATIVE MARA',
  base1x: forest.basePixels,
  w: forest.width,
  h: forest.height,
  paletteHex: SINGING_CANOPY_V5_PALETTE,
  loupes: [
    { label: 'VIOLET SHELF-FUNGI & ANCIENT CAIRN', rx: 64, ry: 162, rw: 112, rh: 50 },
    { label: 'NATIVE 40X60 MARA & GLOWING SUN-DROP ORCHIDS', rx: 162, ry: 178, rw: 112, rh: 50 },
    { label: 'CRYSTAL SPRING POOL & CYAN TENDRILS', rx: 210, ry: 158, rw: 112, rh: 50 },
  ],
});

console.log('=== VERDANT SIGNAL V5.0 — ALL THREE SOULFUL MASTERPIECE DEMONSTRATIONS COMPLETE! ===');
