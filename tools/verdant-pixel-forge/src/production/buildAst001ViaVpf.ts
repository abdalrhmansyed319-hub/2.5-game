/**
 * VERDANT PIXEL FORGE — Headless Studio Production Export Runner for AST-001
 * Runs strictly through VERDANT PIXEL FORGE's TypeScript engines (no Python drawing!)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAst001VpfProject, AST001_ROW_SPEC } from './ast001MaraAuthoring.ts';
import { compositeFrame, hexToRgba } from '../engine/pixelBuffer.ts';
import { scaleBufferNearest } from '../engine/transformEngine.ts';
import { encodeRGBA8PNG } from '../engine/pngEncoder.ts';
import { encodeAnimatedGIF } from '../engine/gifEncoder.ts';
import {
  buildGodotImportSidecar,
  buildGodotManifestJSON,
  encodeSpriteSheetPNG,
  serializeVpfProject,
} from '../engine/exportEngine.ts';
import { runAnimationContinuityAudit, runPixelQualityAudit } from '../engine/qcEngine.ts';
import { VERDANT_MASTER_PALETTE } from '../engine/paletteEngine.ts';

const REPO_ROOT = process.env.VERDANT_REPO_ROOT
  ? path.resolve(process.env.VERDANT_REPO_ROOT)
  : fs.existsSync(path.join(process.cwd(), 'game/project.godot'))
    ? process.cwd()
    : path.resolve(process.cwd(), '../..');
const OUT_DIR = path.join(REPO_ROOT, 'game/assets/characters/player/candidates');
const PREV_DIR = path.join(OUT_DIR, 'previews');

fs.mkdirSync(PREV_DIR, { recursive: true });

// Helper: Blit RGBA buffer onto larger canvas buffer
function blit(
  dst: Uint8ClampedArray,
  dstW: number,
  dstH: number,
  src: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  ox: number,
  oy: number
): void {
  for (let y = 0; y < srcH; y++) {
    const ty = oy + y;
    if (ty < 0 || ty >= dstH) continue;
    for (let x = 0; x < srcW; x++) {
      const tx = ox + x;
      if (tx < 0 || tx >= dstW) continue;
      const s = (y * srcW + x) * 4;
      const sa = src[s + 3];
      if (sa === 0) continue;
      const d = (ty * dstW + tx) * 4;
      dst[d] = src[s];
      dst[d + 1] = src[s + 1];
      dst[d + 2] = src[s + 2];
      dst[d + 3] = sa;
    }
  }
}

function fillRect(
  dst: Uint8ClampedArray,
  dstW: number,
  dstH: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
  hex: string
): void {
  const c = hexToRgba(hex, 255);
  for (let y = ry; y < ry + rh; y++) {
    if (y < 0 || y >= dstH) continue;
    for (let x = rx; x < rx + rw; x++) {
      if (x < 0 || x >= dstW) continue;
      const d = (y * dstW + x) * 4;
      dst[d] = c.r;
      dst[d + 1] = c.g;
      dst[d + 2] = c.b;
      dst[d + 3] = 255;
    }
  }
}

function strokeRect(
  dst: Uint8ClampedArray,
  dstW: number,
  dstH: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
  hex: string
): void {
  fillRect(dst, dstW, dstH, rx, ry, rw, 1, hex);
  fillRect(dst, dstW, dstH, rx, ry + rh - 1, rw, 1, hex);
  fillRect(dst, dstW, dstH, rx, ry, 1, rh, hex);
  fillRect(dst, dstW, dstH, rx + rw - 1, ry, 1, rh, hex);
}

// 1. Author Project inside VERDANT PIXEL FORGE Engine
const doc = buildAst001VpfProject();

// 2. Save Editable Layered .vpf.json Project
const vpfPath = path.join(OUT_DIR, 'ast001_char_mara_lin_candidate.vpf.json');
fs.writeFileSync(vpfPath, serializeVpfProject(doc), 'utf-8');

// 3. Export Final 96x384 Lossless RGBA8 Sprite Sheet via VPF `tag_rows` Exporter
const sheetOpts = { layout: 'tag_rows' as const, columns: 6, spacing: 0, margin: 0 };
const { pngBytes, sheet } = encodeSpriteSheetPNG(doc, sheetOpts);
const sheetPath = path.join(OUT_DIR, 'ast001_char_mara_lin_sheet.png');
fs.writeFileSync(sheetPath, pngBytes);

// 4. Export Godot 4.7.2 .import Sidecar & Technical Manifest JSON
const importPath = path.join(OUT_DIR, 'ast001_char_mara_lin_sheet.png.import');
fs.writeFileSync(importPath, buildGodotImportSidecar('ast001_char_mara_lin_sheet.png'), 'utf-8');

const manifestPath = path.join(OUT_DIR, 'ast001_godot_manifest.json');
fs.writeFileSync(
  manifestPath,
  buildGodotManifestJSON(doc, 'ast001_char_mara_lin_sheet.png', sheetOpts, sheet.frameRects, sheet.cols, sheet.rows),
  'utf-8'
);

// 5. Generate Enlarged 8x Direction & State Inspection Sheet (4 cols: Idle/Walk/Crouch/Scan x 4 rows: Down/Up/Right/Left)
{
  const scale = 8;
  const cw = doc.width * scale;  // 128
  const ch = doc.height * scale; // 192
  const pad = 12;
  const outW = pad * 5 + cw * 4;
  const outH = pad * 5 + ch * 4;
  const buf = new Uint8ClampedArray(outW * outH * 4);
  fillRect(buf, outW, outH, 0, 0, outW, outH, '#141820');

  const dirs = ['down', 'up', 'right', 'left'] as const;
  const stateCols = [
    { state: 'idle', pickFrame: 0 },
    { state: 'walk', pickFrame: 0 }, // stride contact frame
    { state: 'crouch_walk', pickFrame: 0 },
    { state: 'lens_scan', pickFrame: 1 }, // active harmonic pulse frame
  ];

  dirs.forEach((d, rIdx) => {
    stateCols.forEach((sc, cIdx) => {
      const tag = doc.tags.find((t) => t.name === `${sc.state}_${d}`)!;
      const frame = doc.frames[tag.from + sc.pickFrame];
      const comp = compositeFrame(doc.width, doc.height, doc.layers, frame, null);
      const up = scaleBufferNearest(comp, doc.width, doc.height, cw, ch);
      const ox = pad + cIdx * (cw + pad);
      const oy = pad + rIdx * (ch + pad);
      // Subtle studio backdrop alternating Oura sand & moss contrast strips
      fillRect(buf, outW, outH, ox, oy, cw, ch, '#1E242E');
      // Ground contact guide at y=22*scale
      fillRect(buf, outW, outH, ox, oy + 22 * scale, cw, 2, '#3A4658');
      blit(buf, outW, outH, up.pixels, cw, ch, ox, oy);
      strokeRect(buf, outW, outH, ox - 1, oy - 1, cw + 2, ch + 2, '#3A4557');
    });
  });
  fs.writeFileSync(path.join(PREV_DIR, 'ast001_directions_and_states_8x.png'), encodeRGBA8PNG(buf, outW, outH));
}

// 6. Generate 6x Walk Cycles Sheet (All 4 Directions x 6 Frames) + 1x Biome Background Readability Strip!
{
  const scale = 6;
  const cw = doc.width * scale;  // 96
  const ch = doc.height * scale; // 144
  const pad = 8;
  const stripH = 120;
  const outW = pad * 7 + cw * 6;
  const outH = pad * 6 + ch * 4 + stripH;
  const buf = new Uint8ClampedArray(outW * outH * 4);
  fillRect(buf, outW, outH, 0, 0, outW, outH, '#141820');

  const walkTags = ['walk_down', 'walk_up', 'walk_right', 'walk_left'];
  walkTags.forEach((tName, rIdx) => {
    const tag = doc.tags.find((t) => t.name === tName)!;
    for (let c = 0; c < 6; c++) {
      const comp = compositeFrame(doc.width, doc.height, doc.layers, doc.frames[tag.from + c], null);
      const up = scaleBufferNearest(comp, doc.width, doc.height, cw, ch);
      const ox = pad + c * (cw + pad);
      const oy = pad + rIdx * (ch + pad);
      fillRect(buf, outW, outH, ox, oy, cw, ch, '#1E242E');
      fillRect(buf, outW, outH, ox, oy + 22 * scale, cw, 2, '#3A4658');
      blit(buf, outW, outH, up.pixels, cw, ch, ox, oy);
      strokeRect(buf, outW, outH, ox - 1, oy - 1, cw + 2, ch + 2, '#344052');
    }
  });

  // Bottom Readability Test Bar: 1x native AND 3x crisp on Amber Coast Sand, Singing Canopy Moss, Deep Forest, Dark Slate
  const barY = pad * 5 + ch * 4;
  const biomes = ['#B89A6C', '#6F8A68', '#2D423E', '#181C24'];
  const panelW = Math.floor((outW - pad * 5) / 4);
  biomes.forEach((bg, bIdx) => {
    const px0 = pad + bIdx * (panelW + pad);
    fillRect(buf, outW, outH, px0, barY, panelW, stripH - pad, bg);
    const dirs = ['idle_down', 'idle_right', 'idle_left', 'idle_up'];
    dirs.forEach((dName, di) => {
      const tag = doc.tags.find((t) => t.name === dName)!;
      const comp = compositeFrame(doc.width, doc.height, doc.layers, doc.frames[tag.from], null);
      // 1x native at top row
      blit(buf, outW, outH, comp, doc.width, doc.height, px0 + 12 + di * 30, barY + 8);
      // 3x gameplay zoom below
      const up3 = scaleBufferNearest(comp, doc.width, doc.height, doc.width * 3, doc.height * 3);
      blit(buf, outW, outH, up3.pixels, up3.width, up3.height, px0 + 4 + di * 34, barY + 38);
    });
  });

  fs.writeFileSync(path.join(PREV_DIR, 'ast001_walk_cycles_6x.png'), encodeRGBA8PNG(buf, outW, outH));
}

// 7. Generate Complete Sheet Comparison (1x Native 96x384 + 3x Annotated Grid 288x1152)
{
  const up3 = scaleBufferNearest(sheet.pixels, sheet.width, sheet.height, sheet.width * 3, sheet.height * 3);
  const pad = 16;
  const outW = pad * 3 + sheet.width + up3.width;
  const outH = pad * 2 + up3.height;
  const buf = new Uint8ClampedArray(outW * outH * 4);
  fillRect(buf, outW, outH, 0, 0, outW, outH, '#161B22');

  // 1x native on subtle checker/dark box
  fillRect(buf, outW, outH, pad, pad, sheet.width, sheet.height, '#202630');
  blit(buf, outW, outH, sheet.pixels, sheet.width, sheet.height, pad, pad);
  strokeRect(buf, outW, outH, pad - 1, pad - 1, sheet.width + 2, sheet.height + 2, '#DE884A');

  // 3x complete 6x16 sheet with cell grid hairlines so all 64 active + 32 transparent cells are visible!
  const gx = pad * 2 + sheet.width;
  const gy = pad;
  fillRect(buf, outW, outH, gx, gy, up3.width, up3.height, '#202630');
  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 6; c++) {
      const cx = gx + c * 48;
      const cy = gy + r * 72;
      const isPopulated = c < AST001_ROW_SPEC[r].frames;
      fillRect(buf, outW, outH, cx, cy, 48, 72, isPopulated ? '#252C38' : '#181C24');
      strokeRect(buf, outW, outH, cx, cy, 48, 72, '#2F3847');
    }
  }
  blit(buf, outW, outH, up3.pixels, up3.width, up3.height, gx, gy);
  strokeRect(buf, outW, outH, gx - 1, gy - 1, up3.width + 2, up3.height + 2, '#649291');

  fs.writeFileSync(path.join(PREV_DIR, 'ast001_sheet_1x_and_3x_review.png'), encodeRGBA8PNG(buf, outW, outH));
}

// 8. Export Animated GIF Playback Previews (using VPF's own GIF89a Encoder!)
const gifTags = ['idle_down', 'walk_down', 'walk_up', 'walk_right', 'walk_left', 'crouch_walk_right', 'lens_scan_right', 'lens_scan_left'];
for (const tagName of gifTags) {
  const tag = doc.tags.find((t) => t.name === tagName)!;
  const gifFrames: Array<{ pixels: Uint8ClampedArray; durationMs: number }> = [];
  for (let i = tag.from; i <= tag.to; i++) {
    const comp = compositeFrame(doc.width, doc.height, doc.layers, doc.frames[i], null);
    const up4 = scaleBufferNearest(comp, doc.width, doc.height, doc.width * 4, doc.height * 4);
    gifFrames.push({ pixels: up4.pixels, durationMs: doc.frames[i].durationMs });
  }
  fs.writeFileSync(path.join(PREV_DIR, `anim_${tagName}_4x.gif`), encodeAnimatedGIF(doc.width * 4, doc.height * 4, gifFrames));
}

// Combined 4x Showcase GIF cycling through all 4 directions & states
{
  const showcaseFrames: Array<{ pixels: Uint8ClampedArray; durationMs: number }> = [];
  const order = ['idle_down', 'walk_down', 'walk_right', 'walk_up', 'walk_left', 'crouch_walk_right', 'lens_scan_right', 'lens_scan_left'];
  for (const tagName of order) {
    const tag = doc.tags.find((t) => t.name === tagName)!;
    const loops = tag.to - tag.from + 1 <= 2 ? 3 : 2;
    for (let rep = 0; rep < loops; rep++) {
      for (let i = tag.from; i <= tag.to; i++) {
        const comp = compositeFrame(doc.width, doc.height, doc.layers, doc.frames[i], null);
        const up4 = scaleBufferNearest(comp, doc.width, doc.height, doc.width * 4, doc.height * 4);
        showcaseFrames.push({ pixels: up4.pixels, durationMs: doc.frames[i].durationMs });
      }
    }
  }
  fs.writeFileSync(path.join(PREV_DIR, 'ast001_showcase_loop_4x.gif'), encodeAnimatedGIF(doc.width * 4, doc.height * 4, showcaseFrames));
}

// 9. Run Full VERDANT PIXEL FORGE Quality & Animation Continuity Audits!
const sheetQC = runPixelQualityAudit(sheet.pixels, sheet.width, sheet.height, VERDANT_MASTER_PALETTE, 16, 24);
const animAudit = runAnimationContinuityAudit(doc);

// Verify all 32 unused cells are strictly 100% transparent RGBA(0,0,0,0)
let unusedNonZeroPx = 0;
for (let r = 0; r < 16; r++) {
  const populatedCols = AST001_ROW_SPEC[r].frames;
  for (let c = populatedCols; c < 6; c++) {
    for (let y = 0; y < 24; y++) {
      for (let x = 0; x < 16; x++) {
        const idx = ((r * 24 + y) * 96 + (c * 16 + x)) * 4;
        if (sheet.pixels[idx + 3] !== 0) unusedNonZeroPx++;
      }
    }
  }
}

console.log(JSON.stringify({
  sheet_dimensions: `${sheet.width}x${sheet.height}`,
  grid: `${sheet.cols}x${sheet.rows}`,
  populated_cells: sheet.populatedCells,
  transparent_cells: sheet.transparentCells,
  unused_cell_stray_pixels: unusedNonZeroPx,
  sheet_unique_colors: sheetQC.uniqueColors,
  sheet_off_palette_pixels: sheetQC.offPalettePixels,
  sheet_semi_alpha_pixels: sheetQC.semiAlphaPixels,
  sheet_stray_orphans: sheetQC.accidentalOrphans.length,
  sheet_intentional_catchlights: sheetQC.intentionalHighlights.length,
  all_binary_alpha: animAudit.allBinaryAlpha,
  total_off_palette: animAudit.totalOffPalettePixels,
  mirror_checks: animAudit.mirrorPairsDetected,
  tag_audits: animAudit.tagAudits,
}, null, 2));
