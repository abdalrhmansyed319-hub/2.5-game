/**
 * VERDANT SIGNAL — High-Resolution Art Upgrade Study Suite Generator
 * ==================================================================
 * Builds ALL isolated high-resolution studies, editable VPF sources, 1x/2x/4x
 * visual comparison boards, and the 640x360 / 1280x720 Vertical Slice showcase
 * into `game/assets/high_res_upgrade_study/` (protected by `.gdignore` so the
 * playable M01 baseline build in `game/assets/` remains 100% untouched!).
 */

import fs from 'node:fs';
import path from 'node:path';
import { encodeRGBA8PNG } from '../engine/pngEncoder';
import { createEmptyBuffer, setPixel } from '../engine/pixelBuffer';
import { deserializeProjectJSON } from '../engine/exportEngine';
import { buildAst001MaraLinFinal } from '../production/ast001MaraLinFinal';
import { buildAst002AmberCoast } from '../production/ast002AmberCoast';
import { buildAst003SingingCanopy } from '../production/ast003SingingCanopy';
import { buildMaraHighResStudy, type MaraPoseKind, type MaraResolutionPreset } from './sculptMaraHighRes';
import { buildNativeTerrainShowcase, buildVerticalSlice640x360 } from './sculptWorldHighRes';
import { blitHR, scaleNearestHR } from './highResPaletteAndSculpt';

const REPO_ROOT = path.resolve(process.cwd(), '../..');
const STUDY_ROOT = path.join(REPO_ROOT, 'game/assets/high_res_upgrade_study');
const CHAR_DIR = path.join(STUDY_ROOT, 'characters');
const TERR_DIR = path.join(STUDY_ROOT, 'terrain');
const COMP_DIR = path.join(STUDY_ROOT, 'comparisons');

for (const d of [STUDY_ROOT, CHAR_DIR, TERR_DIR, COMP_DIR]) {
  fs.mkdirSync(d, { recursive: true });
}

// Strict Godot isolation marker — guarantees zero interference with playable M01 build!
fs.writeFileSync(
  path.join(STUDY_ROOT, '.gdignore'),
  '# High-Resolution Art Upgrade Study — isolated from Godot runtime imports until user approves migration.\n',
  'utf8'
);

// Clean 5x7 pixel bitmap font for razor-sharp crisp comparison board labels!
const FONT_5X7: Record<string, string[]> = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.####', '#....', '#....', '#..##', '#...#', '#...#', '.###.'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#...#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  ',': ['.....', '.....', '.....', '.....', '..##.', '..#..', '.#...'],
  '.': ['.....', '.....', '.....', '.....', '.....', '..##.', '..##.'],
  '&': ['.###.', '#...#', '.###.', '#.#..', '#..#.', '#...#', '.###.'],
  '0': ['.###.', '#..##', '#.#.#', '#.#.#', '##..#', '#...#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  '2': ['.###.', '#...#', '....#', '..##.', '.#...', '#....', '#####'],
  '3': ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  '4': ['#...#', '#...#', '#...#', '#####', '....#', '....#', '....#'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['.###.', '#....', '####.', '#...#', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  '*': ['..#..', '#.#.#', '.###.', '#.#.#', '..#..', '.....', '.....'],
  '-': ['.....', '.....', '.....', '#####', '.....', '.....', '.....'],
  '/': ['....#', '...#.', '...#.', '..#..', '.#...', '.#...', '#....'],
  ':': ['.....', '..#..', '..#..', '.....', '..#..', '..#..', '.....'],
  '(': ['..#..', '.#...', '#....', '#....', '#....', '.#...', '..#..'],
  ')': ['..#..', '...#.', '....#', '....#', '....#', '...#.', '..#..'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
};

function drawText(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  text: string,
  x: number,
  y: number,
  scale = 1,
  color = { r: 235, g: 240, b: 245, a: 255 }
): void {
  const up = text.toUpperCase();
  let cx = x;
  for (const ch of up) {
    const glyph = FONT_5X7[ch] ?? FONT_5X7[' '];
    for (let gy = 0; gy < 7; gy++) {
      for (let gx = 0; gx < 5; gx++) {
        if (glyph[gy][gx] !== '#') continue;
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            setPixel(buf, w, h, cx + gx * scale + sx, y + gy * scale + sy, color);
          }
        }
      }
    }
    cx += 6 * scale;
  }
}

function fillBoardBg(buf: Uint8ClampedArray, w: number, h: number): void {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = (((x >> 4) + (y >> 4)) & 1) === 0;
      setPixel(buf, w, h, x, y, { r: ch ? 20 : 24, g: ch ? 26 : 31, b: ch ? 34 : 40, a: 255 });
    }
  }
}

function drawRule(buf: Uint8ClampedArray, w: number, h: number, x0: number, x1: number, y: number, col = { r: 70, g: 92, b: 110, a: 255 }): void {
  for (let x = x0; x <= x1; x++) setPixel(buf, w, h, x, y, col);
}

function saveAsset(pngPath: string, vpfPath: string, pixels: Uint8ClampedArray, w: number, h: number, vpfJson: string): void {
  fs.writeFileSync(pngPath, encodeRGBA8PNG(pixels, w, h));
  fs.writeFileSync(vpfPath, vpfJson, 'utf8');
  // Strict VPF round-trip validation!
  const parsed = deserializeProjectJSON(vpfJson);
  if (parsed.width !== w || parsed.height !== h) {
    throw new Error(`VPF round-trip dimension mismatch for ${vpfPath}`);
  }
}

console.log('=== BUILDING VERDANT SIGNAL HIGH-RESOLUTION ART UPGRADE STUDY ===');

// ---------------------------------------------------------------------------
// 1. AUTHOR ALL 4 NATIVE CHARACTER RESOLUTIONS + 48x64 4-POSE PRODUCTION SUITE
// ---------------------------------------------------------------------------
const base16Buf = buildAst001MaraLinFinal().canvas.composite();
const maraResPresets: MaraResolutionPreset[] = ['32x48', '48x64', '64x80', '64x96'];
const maraHeroByRes: Record<MaraResolutionPreset, { pixels: Uint8ClampedArray; w: number; h: number; gy: number }> = {} as any;

for (const preset of maraResPresets) {
  const study = buildMaraHighResStudy(preset, 'hero_3q');
  const px = study.canvas.composite();
  const gy = preset === '32x48' ? 45 : preset === '48x64' ? 60 : preset === '64x80' ? 75 : 91;
  maraHeroByRes[preset] = { pixels: px, w: study.width, h: study.height, gy };
  saveAsset(
    path.join(CHAR_DIR, `mara_native_${preset}.png`),
    path.join(CHAR_DIR, `mara_native_${preset}.vpf.json`),
    px, study.width, study.height, study.vpfJson
  );
}

const poses48: MaraPoseKind[] = ['hero_3q', 'walk_right', 'crouch_sample', 'lens_scan'];
const mara48Poses: Record<MaraPoseKind, Uint8ClampedArray> = {} as any;
for (const pose of poses48) {
  const study = buildMaraHighResStudy('48x64', pose);
  const px = study.canvas.composite();
  mara48Poses[pose] = px;
  saveAsset(
    path.join(CHAR_DIR, `mara_native_48x64_${pose}.png`),
    path.join(CHAR_DIR, `mara_native_48x64_${pose}.vpf.json`),
    px, 48, 64, study.vpfJson
  );
}

// ---------------------------------------------------------------------------
// 2. BOARD 01: DR. MARA LIN RESOLUTION COMPARISON AT 1X, 2X, AND 4X!
// ---------------------------------------------------------------------------
{
  // Build clean 1x strip of all 5 resolutions (16x24, 32x48, 48x64, 64x80, 64x96)
  const SW = 276;
  const SH = 104;
  const strip1x = createEmptyBuffer(SW, SH);
  const gY = 98;
  // Ground reference line
  drawRule(strip1x, SW, SH, 4, SW - 5, gY + 1, { r: 72, g: 94, b: 112, a: 255 });
  const slots = [
    { label: '16X24', x: 10, w: 16, h: 24, gy: 22, buf: base16Buf, srcW: 96, srcH: 384, region: { x: 0, y: 0, w: 16, h: 24 } },
    { label: '32X48', x: 38, w: 32, h: 48, gy: 45, buf: maraHeroByRes['32x48'].pixels, srcW: 32, srcH: 48 },
    { label: '48X64*', x: 80, w: 48, h: 64, gy: 60, buf: maraHeroByRes['48x64'].pixels, srcW: 48, srcH: 64 },
    { label: '64X80', x: 138, w: 64, h: 80, gy: 75, buf: maraHeroByRes['64x80'].pixels, srcW: 64, srcH: 80 },
    { label: '64X96', x: 208, w: 64, h: 96, gy: 91, buf: maraHeroByRes['64x96'].pixels, srcW: 64, srcH: 96 },
  ];
  for (const sl of slots) {
    blitHR(strip1x, SW, SH, sl.buf, sl.srcW, sl.srcH, sl.x, gY - sl.gy, sl.region);
  }
  const strip2x = scaleNearestHR(strip1x, SW, SH, 2);
  const strip4x = scaleNearestHR(strip1x, SW, SH, 4);

  const BW = strip4x.width + 48; // 1152 px wide
  const BH = 64 + SH + 44 + strip2x.height + 48 + strip4x.height + 52;
  const board = createEmptyBuffer(BW, BH);
  fillBoardBg(board, BW, BH);

  drawText(board, BW, BH, 'DR. MARA LIN - NATIVE RESOLUTION COMPARISON (1X / 2X / 4X)', 24, 16, 2, { r: 242, g: 210, b: 140, a: 255 });
  drawText(board, BW, BH, '16X24 BASELINE VS NATIVE 32X48, 48X64 (RECOMMENDED*), 64X80, AND 64X96 - ZERO UPSCALING', 24, 38, 1, { r: 165, g: 195, b: 210, a: 255 });

  // 1X Row
  const y1 = 62;
  drawText(board, BW, BH, '1X NATIVE PIXELS', 24, y1, 1, { r: 140, g: 220, b: 210, a: 255 });
  blitHR(board, BW, BH, strip1x, SW, SH, 24, y1 + 12);

  // 2X Row
  const y2 = y1 + SH + 28;
  drawText(board, BW, BH, '2X INTEGER SCALE', 24, y2, 1, { r: 140, g: 220, b: 210, a: 255 });
  blitHR(board, BW, BH, strip2x.pixels, strip2x.width, strip2x.height, 24, y2 + 12);

  // 4X Row
  const y4 = y2 + strip2x.height + 32;
  drawText(board, BW, BH, '4X CLOSE-UP CRAFT INSPECTION', 24, y4, 2, { r: 140, g: 220, b: 210, a: 255 });
  blitHR(board, BW, BH, strip4x.pixels, strip4x.width, strip4x.height, 24, y4 + 22);
  for (const sl of slots) {
    const lx = 24 + sl.x * 4;
    const isRec = sl.label.includes('*');
    drawText(
      board, BW, BH, sl.label, lx, y4 + 22 + strip4x.height + 8, 2,
      isRec ? { r: 252, g: 210, b: 112, a: 255 } : { r: 200, g: 215, b: 228, a: 255 }
    );
  }
  fs.writeFileSync(path.join(COMP_DIR, '01_mara_resolutions_1x_2x_4x.png'), encodeRGBA8PNG(board, BW, BH));
}

// ---------------------------------------------------------------------------
// 3. BOARD 02: 48X64 DR. MARA LIN 4-POSE PRODUCTION SHOWPIECE (1X / 2X / 4X)
// ---------------------------------------------------------------------------
{
  const SW = 224;
  const SH = 72;
  const strip1x = createEmptyBuffer(SW, SH);
  drawRule(strip1x, SW, SH, 4, SW - 5, 65, { r: 72, g: 94, b: 112, a: 255 });
  const pLabels = ['HERO 3/4', 'WALK RIGHT', 'CROUCH SAMPLE', 'LENS SCAN'];
  poses48.forEach((pose, i) => {
    blitHR(strip1x, SW, SH, mara48Poses[pose], 48, 64, 6 + i * 54, 4);
  });
  const strip2x = scaleNearestHR(strip1x, SW, SH, 2);
  const strip4x = scaleNearestHR(strip1x, SW, SH, 4);

  const BW = strip4x.width + 48; // 944 px
  const BH = 64 + SH + 34 + strip2x.height + 40 + strip4x.height + 48;
  const board = createEmptyBuffer(BW, BH);
  fillBoardBg(board, BW, BH);

  drawText(board, BW, BH, 'DR. MARA LIN - 48X64 PRODUCTION CHARACTER STUDY (1X / 2X / 4X)', 24, 16, 2, { r: 242, g: 210, b: 140, a: 255 });
  drawText(board, BW, BH, 'FOUR NATIVE PRODUCTION POSES: CONTRAPPOSTO IDLE, SIDE STRIDE, CROUCH PROBE, HARMONIC SCAN', 24, 38, 1, { r: 165, g: 195, b: 210, a: 255 });

  const y1 = 62;
  drawText(board, BW, BH, '1X NATIVE (48X64)', 24, y1, 1, { r: 140, g: 220, b: 210, a: 255 });
  blitHR(board, BW, BH, strip1x, SW, SH, 24, y1 + 12);

  const y2 = y1 + SH + 24;
  drawText(board, BW, BH, '2X GAMEPLAY SCALE', 24, y2, 1, { r: 140, g: 220, b: 210, a: 255 });
  blitHR(board, BW, BH, strip2x.pixels, strip2x.width, strip2x.height, 24, y2 + 12);

  const y4 = y2 + strip2x.height + 28;
  drawText(board, BW, BH, '4X STUDIO CRAFT INSPECTION', 24, y4, 2, { r: 140, g: 220, b: 210, a: 255 });
  blitHR(board, BW, BH, strip4x.pixels, strip4x.width, strip4x.height, 24, y4 + 22);
  pLabels.forEach((lbl, i) => {
    drawText(board, BW, BH, lbl, 24 + (6 + i * 54) * 4, y4 + 22 + strip4x.height + 8, 2, { r: 220, g: 232, b: 242, a: 255 });
  });
  fs.writeFileSync(path.join(COMP_DIR, '02_mara_48x64_production_4poses_1x_2x_4x.png'), encodeRGBA8PNG(board, BW, BH));
}

// ---------------------------------------------------------------------------
// 4. NATIVE TERRAIN STUDIES (24x24 & 32x32) + BOARD 03 (16 VS 24 VS 32 AT 1X/2X/4X)
// ---------------------------------------------------------------------------
const terr24 = buildNativeTerrainShowcase(24);
const terr24Px = terr24.canvas.composite();
saveAsset(
  path.join(TERR_DIR, 'terrain_native_24x24_ecotone.png'),
  path.join(TERR_DIR, 'terrain_native_24x24_ecotone.vpf.json'),
  terr24Px, terr24.width, terr24.height, terr24.vpfJson
);

const terr32 = buildNativeTerrainShowcase(32);
const terr32Px = terr32.canvas.composite();
saveAsset(
  path.join(TERR_DIR, 'terrain_native_32x32_ecotone.png'),
  path.join(TERR_DIR, 'terrain_native_32x32_ecotone.vpf.json'),
  terr32Px, terr32.width, terr32.height, terr32.vpfJson
);

// Build matching 5x3 (80x48) strip from ACTUAL baseline 16x16 AST-002 + AST-003 tiles for 100% honest comparison!
const ast002Base = buildAst002AmberCoast().canvas.composite();
const ast003Base = buildAst003SingingCanopy().canvas.composite();
const terr16W = 80;
const terr16H = 48;
const terr16Px = createEmptyBuffer(terr16W, terr16H);
for (let row = 0; row < 3; row++) {
  // Col 0: Shallow coastal water (AST-002 cols 8..9 row 0), Col 1: Amber Sand (cols 0..2 row 0),
  // Col 2: Coastal Cliff (row 3 cap -> row 4 face -> row 5 base), Col 3: Moss-to-Sand Ecotone, Col 4: Canopy Moss
  blitHR(terr16Px, terr16W, terr16H, ast002Base, 192, 128, 0, row * 16, { x: 16 * (8 + (row % 2)), y: 0, w: 16, h: 16 });
  blitHR(terr16Px, terr16W, terr16H, ast002Base, 192, 128, 16, row * 16, { x: 16 * (row % 3), y: 0, w: 16, h: 16 });
  blitHR(terr16Px, terr16W, terr16H, ast002Base, 192, 128, 32, row * 16, { x: 16 * 1, y: 16 * (3 + row), w: 16, h: 16 });
  blitHR(terr16Px, terr16W, terr16H, ast002Base, 192, 128, 48, row * 16, { x: 16 * (row % 2), y: 0, w: 16, h: 16 });
  blitHR(terr16Px, terr16W, terr16H, ast003Base, 192, 96, 48, row * 16, { x: 16 * 6, y: 16 * 1, w: 16, h: 16 });
  blitHR(terr16Px, terr16W, terr16H, ast003Base, 192, 96, 64, row * 16, { x: 16 * (row % 3), y: 0, w: 16, h: 16 });
}

{
  // Board 03: Shows 16x16 Baseline (80x48), 24x24 Native (120x72), and 32x32 Native (160x96) at 1X, 2X, and 4X!
  const t16_2x = scaleNearestHR(terr16Px, terr16W, terr16H, 2);
  const t24_2x = scaleNearestHR(terr24Px, terr24.width, terr24.height, 2);
  const t32_2x = scaleNearestHR(terr32Px, terr32.width, terr32.height, 2);

  const t16_4x = scaleNearestHR(terr16Px, terr16W, terr16H, 4);
  const t24_4x = scaleNearestHR(terr24Px, terr24.width, terr24.height, 4);
  const t32_4x = scaleNearestHR(terr32Px, terr32.width, terr32.height, 4);

  const BW = 24 + t16_4x.width + 20 + t24_4x.width + 20 + t32_4x.width + 24; // ~1528 px
  const BH = 64 + 116 + 220 + t32_4x.height + 70;
  const board = createEmptyBuffer(BW, BH);
  fillBoardBg(board, BW, BH);

  drawText(board, BW, BH, 'ENVIRONMENT TERRAIN - 16X16 BASELINE VS NATIVE 24X24 VS NATIVE 32X32 (1X / 2X / 4X)', 24, 16, 2, { r: 242, g: 210, b: 140, a: 255 });
  drawText(board, BW, BH, 'FIVE SEAMLESS BIOME ZONES LEFT TO RIGHT: OCEAN SURF - WET/DRY SAND - STRATIFIED CLIFF - ECOTONE - CANOPY MOSS & ROOTS', 24, 38, 1, { r: 165, g: 195, b: 210, a: 255 });

  // 1X Row
  const y1 = 62;
  drawText(board, BW, BH, '1X NATIVE (16X16 / 24X24 / 32X32)', 24, y1, 1, { r: 140, g: 220, b: 210, a: 255 });
  blitHR(board, BW, BH, terr16Px, terr16W, terr16H, 24, y1 + 14);
  blitHR(board, BW, BH, terr24Px, terr24.width, terr24.height, 24 + terr16W + 24, y1 + 14);
  blitHR(board, BW, BH, terr32Px, terr32.width, terr32.height, 24 + terr16W + 24 + terr24.width + 24, y1 + 14);

  // 2X Row
  const y2 = y1 + 124;
  drawText(board, BW, BH, '2X GAMEPLAY SCALE', 24, y2, 1, { r: 140, g: 220, b: 210, a: 255 });
  blitHR(board, BW, BH, t16_2x.pixels, t16_2x.width, t16_2x.height, 24, y2 + 14);
  blitHR(board, BW, BH, t24_2x.pixels, t24_2x.width, t24_2x.height, 24 + t16_2x.width + 24, y2 + 14);
  blitHR(board, BW, BH, t32_2x.pixels, t32_2x.width, t32_2x.height, 24 + t16_2x.width + 24 + t24_2x.width + 24, y2 + 14);

  // 4X Row
  const y4 = y2 + t32_2x.height + 28;
  drawText(board, BW, BH, '4X GEOLOGY, ROOT & FOLIAGE CRAFT INSPECTION', 24, y4, 2, { r: 140, g: 220, b: 210, a: 255 });
  const x16 = 24;
  const x24 = x16 + t16_4x.width + 20;
  const x32 = x24 + t24_4x.width + 20;
  blitHR(board, BW, BH, t16_4x.pixels, t16_4x.width, t16_4x.height, x16, y4 + 24);
  blitHR(board, BW, BH, t24_4x.pixels, t24_4x.width, t24_4x.height, x24, y4 + 24);
  blitHR(board, BW, BH, t32_4x.pixels, t32_4x.width, t32_4x.height, x32, y4 + 24);

  const ly = y4 + 24 + t32_4x.height + 10;
  drawText(board, BW, BH, '16X16 BASELINE', x16, ly, 2, { r: 195, g: 205, b: 215, a: 255 });
  drawText(board, BW, BH, '24X24 NATIVE CANDIDATE', x24, ly, 2, { r: 195, g: 215, b: 225, a: 255 });
  drawText(board, BW, BH, '32X32 NATIVE (RECOMMENDED*)', x32, ly, 2, { r: 252, g: 210, b: 112, a: 255 });

  fs.writeFileSync(path.join(COMP_DIR, '03_terrain_resolutions_16_vs_24_vs_32_1x_2x_4x.png'), encodeRGBA8PNG(board, BW, BH));
}

// ---------------------------------------------------------------------------
// 5. SHOWSTOPPING 640x360 (1X) & 1280x720 (2X) HIGH-RESOLUTION VERTICAL SLICE!
// ---------------------------------------------------------------------------
const vslice1x = buildVerticalSlice640x360(
  mara48Poses.lens_scan,
  mara48Poses.walk_right,
  mara48Poses.crouch_sample
);
fs.writeFileSync(path.join(COMP_DIR, '04_vertical_slice_640x360_1x.png'), encodeRGBA8PNG(vslice1x, 640, 360));
const vslice2x = scaleNearestHR(vslice1x, 640, 360, 2);
fs.writeFileSync(path.join(COMP_DIR, '04_vertical_slice_1280x720_2x.png'), encodeRGBA8PNG(vslice2x.pixels, vslice2x.width, vslice2x.height));

console.log('=== ALL HIGH-RES STUDY PNGS & VPF SOURCES GENERATED & ROUND-TRIP VALIDATED! ===');
