/**
 * VERDANT PIXEL FORGE — AST-001 Resolution & Artistic Feasibility Study Runner
 * ----------------------------------------------------------------------------
 * Exports all 3 independent Dr. Mara Lin character design prototypes (32×48, 48×64, 64×80)
 * strictly through VERDANT PIXEL FORGE's native engines (`compositeFrame`, `serializeVpfProject`,
 * `encodeRGBA8PNG`, `runPixelQualityAudit`) to `game/assets/characters/player/feasibility_study/`.
 *
 * Strictly preserves:
 *   - Rejected 16×24 candidate in `candidates/` (read-only reference only!)
 *   - Approved 128×128 v1 & v2 concepts
 *   - Milestone 01 gameplay, `project.godot`, debug placeholders, and `ASSET_REQUESTS.md`
 */
import fs from 'node:fs';
import path from 'node:path';
import type { ProjectDocument, RGBA } from '../types/studio';
import { compositeFrame, hexToRgba, setPixel } from '../engine/pixelBuffer';
import { VERDANT_MASTER_PALETTE } from '../engine/paletteEngine';
import { encodeRGBA8PNG } from '../engine/pngEncoder';
import { deserializeProjectJSON, serializeVpfProject } from '../engine/exportEngine';
import { runPixelQualityAudit } from '../engine/qcEngine';
import {
  blitOver,
  fillPreviewRect,
  scaleNearestRGBA,
  strokePreviewRect,
} from './vpfSculptTools';
import { buildMaraProto32x48 } from './maraProto32x48';
import { buildMaraProto48x64 } from './maraProto48x64';
import { buildMaraProto64x80 } from './maraProto64x80';

const REPO_ROOT = process.env.VERDANT_REPO_ROOT
  ? path.resolve(process.env.VERDANT_REPO_ROOT)
  : fs.existsSync(path.join(process.cwd(), 'game/project.godot'))
    ? process.cwd()
    : path.resolve(process.cwd(), '../..');

const OUT_DIR = path.join(REPO_ROOT, 'game/assets/characters/player/feasibility_study');
const PREV_DIR = path.join(OUT_DIR, 'previews');
const REJECTED_VPF = path.join(
  REPO_ROOT,
  'game/assets/characters/player/candidates/ast001_char_mara_lin_candidate.vpf.json'
);

// Minimal crisp 3x5 pixel bitmap font for clean nearest-neighbor review labels
const FONT_3X5: Record<string, string[]> = {
  '0': ['111', '101', '101', '101', '111'],
  '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '111', '001', '111'],
  '4': ['101', '101', '111', '001', '001'],
  '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'],
  '7': ['111', '001', '010', '010', '010'],
  '8': ['111', '101', '111', '101', '111'],
  '9': ['111', '101', '111', '001', '111'],
  A: ['010', '101', '111', '101', '101'],
  B: ['110', '101', '110', '101', '110'],
  C: ['111', '100', '100', '100', '111'],
  D: ['110', '101', '101', '101', '110'],
  E: ['111', '100', '110', '100', '111'],
  F: ['111', '100', '110', '100', '100'],
  G: ['111', '100', '101', '101', '111'],
  H: ['101', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'],
  J: ['001', '001', '001', '101', '111'],
  K: ['101', '101', '110', '101', '101'],
  L: ['100', '100', '100', '100', '111'],
  M: ['101', '111', '101', '101', '101'],
  N: ['111', '101', '101', '101', '101'],
  O: ['111', '101', '101', '101', '111'],
  P: ['111', '101', '111', '100', '100'],
  Q: ['111', '101', '101', '111', '001'],
  R: ['110', '101', '110', '101', '101'],
  S: ['111', '100', '111', '001', '111'],
  T: ['111', '010', '010', '010', '010'],
  U: ['101', '101', '101', '101', '111'],
  V: ['101', '101', '101', '101', '010'],
  W: ['101', '101', '101', '111', '101'],
  X: ['101', '101', '010', '101', '101'],
  Y: ['101', '101', '010', '010', '010'],
  Z: ['111', '001', '010', '100', '111'],
  '-': ['000', '000', '111', '000', '000'],
  ':': ['000', '010', '000', '010', '000'],
  '(': ['010', '100', '100', '100', '010'],
  ')': ['010', '001', '001', '001', '010'],
  '/': ['001', '001', '010', '100', '100'],
  '.': ['000', '000', '000', '000', '010'],
  ' ': ['000', '000', '000', '000', '000'],
};

function drawPixelText(
  dst: Uint8ClampedArray,
  dw: number,
  dh: number,
  text: string,
  x0: number,
  y0: number,
  scale: number,
  col: RGBA
): void {
  const upper = text.toUpperCase();
  let cx = x0;
  for (const ch of upper) {
    const glyph = FONT_3X5[ch] ?? FONT_3X5[' '];
    for (let gy = 0; gy < glyph.length; gy++) {
      for (let gx = 0; gx < glyph[gy].length; gx++) {
        if (glyph[gy][gx] === '1') {
          for (let sy = 0; sy < scale; sy++) {
            for (let sx = 0; sx < scale; sx++) {
              setPixel(dst, dw, dh, cx + gx * scale + sx, y0 + gy * scale + sy, col);
            }
          }
        }
      }
    }
    cx += 4 * scale;
  }
}

function getOpaqueBounds(buf: Uint8ClampedArray, w: number, h: number) {
  let minX = w;
  let maxX = -1;
  let minY = h;
  let maxY = -1;
  let count = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (buf[(y * w + x) * 4 + 3] > 0) {
        count++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return {
    opaquePixels: count,
    fillPct: Number(((count / (w * h)) * 100).toFixed(1)),
    bbox: count > 0 ? { x0: minX, y0: minY, x1: maxX, y1: maxY, w: maxX - minX + 1, h: maxY - minY + 1 } : null,
  };
}

function buildIndividualReviewCard(
  title: string,
  comp: Uint8ClampedArray,
  w: number,
  h: number,
  pivotY: number
): { pixels: Uint8ClampedArray; width: number; height: number } {
  const s4W = w * 4;
  const s4H = h * 4;
  const s4 = scaleNearestRGBA(comp, w, h, 4);
  const s2 = scaleNearestRGBA(comp, w, h, 2);

  const pad = 18;
  const headerH = 26;
  const sideColW = Math.max(120, w * 2 + 24);
  const cw = pad + s4W + pad + sideColW + pad + sideColW + pad;
  const ch = headerH + pad + Math.max(s4H + 16, h * 2 + h + 64) + pad;
  const out = new Uint8ClampedArray(cw * ch * 4);

  const bg = hexToRgba('#141A21', 255);
  const card = hexToRgba('#1C242E', 255);
  const border = hexToRgba('#384758', 255);
  const textCol = hexToRgba('#E9ECEF', 255);
  const accent = hexToRgba('#DE884A', 255);
  const groundLine = hexToRgba('#455A6B', 255);

  fillPreviewRect(out, cw, ch, 0, 0, cw, ch, bg);
  drawPixelText(out, cw, ch, title, pad, 9, 2, accent);

  // Left hero card: 4x nearest-neighbor on dark studio
  const c1X = pad;
  const c1Y = headerH + 8;
  fillPreviewRect(out, cw, ch, c1X, c1Y, s4W + 8, s4H + 20, card);
  strokePreviewRect(out, cw, ch, c1X, c1Y, s4W + 8, s4H + 20, border);
  drawPixelText(out, cw, ch, `4X ZOOM (${s4W}X${s4H})`, c1X + 6, c1Y + 5, 1, textCol);
  // Subtle pivot ground line
  fillPreviewRect(out, cw, ch, c1X + 4, c1Y + 14 + pivotY * 4 + 3, s4W, 1, groundLine);
  blitOver(out, cw, ch, s4, s4W, s4H, c1X + 4, c1Y + 14);

  // Middle column: 1x native on studio + 2x on Amber Coast Sand
  const c2X = c1X + s4W + 8 + pad;
  const boxH = Math.floor((s4H + 20 - 10) / 2);

  // 1x native dark studio
  fillPreviewRect(out, cw, ch, c2X, c1Y, sideColW, boxH, card);
  strokePreviewRect(out, cw, ch, c2X, c1Y, sideColW, boxH, border);
  drawPixelText(out, cw, ch, `1X NATIVE (${w}X${h})`, c2X + 6, c1Y + 5, 1, textCol);
  blitOver(out, cw, ch, comp, w, h, c2X + Math.floor((sideColW - w) / 2), c1Y + Math.floor((boxH - h) / 2) + 4);

  // 2x Amber Coast Sand
  const sandY = c1Y + boxH + 10;
  fillPreviewRect(out, cw, ch, c2X, sandY, sideColW, boxH, hexToRgba('#B89A6C', 255));
  strokePreviewRect(out, cw, ch, c2X, sandY, sideColW, boxH, border);
  drawPixelText(out, cw, ch, '2X AMBER SAND', c2X + 6, sandY + 5, 1, hexToRgba('#231622', 255));
  blitOver(out, cw, ch, s2, w * 2, h * 2, c2X + Math.floor((sideColW - w * 2) / 2), sandY + Math.floor((boxH - h * 2) / 2) + 6);

  // Right column: 2x Singing Canopy Moss + 2x Deep Forest Shade
  const c3X = c2X + sideColW + pad;
  fillPreviewRect(out, cw, ch, c3X, c1Y, sideColW, boxH, hexToRgba('#6F8A68', 255));
  strokePreviewRect(out, cw, ch, c3X, c1Y, sideColW, boxH, border);
  drawPixelText(out, cw, ch, '2X CANOPY MOSS', c3X + 6, c1Y + 5, 1, hexToRgba('#141A21', 255));
  blitOver(out, cw, ch, s2, w * 2, h * 2, c3X + Math.floor((sideColW - w * 2) / 2), c1Y + Math.floor((boxH - h * 2) / 2) + 6);

  fillPreviewRect(out, cw, ch, c3X, sandY, sideColW, boxH, hexToRgba('#2D423E', 255));
  strokePreviewRect(out, cw, ch, c3X, sandY, sideColW, boxH, border);
  drawPixelText(out, cw, ch, '2X FOREST SHADE', c3X + 6, sandY + 5, 1, textCol);
  blitOver(out, cw, ch, s2, w * 2, h * 2, c3X + Math.floor((sideColW - w * 2) / 2), sandY + Math.floor((boxH - h * 2) / 2) + 6);

  return { pixels: out, width: cw, height: ch };
}

function buildMasterComparisonSheet(
  entries: Array<{ label: string; sub: string; comp: Uint8ClampedArray; w: number; h: number; pivotY: number; highlight?: boolean }>
): { pixels: Uint8ClampedArray; width: number; height: number } {
  const pad = 20;
  const colGap = 16;
  const headerH = 34;

  // Top Row: 4x Nearest-Neighbor side-by-side aligned by GROUND PIVOT!
  const colWidths = entries.map((e) => Math.max(120, e.w * 4 + 20));
  const totalColsW = colWidths.reduce((a, b) => a + b, 0) + colGap * (entries.length - 1);
  const row4H = 80 * 4 + 34; // 354px

  // Middle Row: Exact 1x Native Side-by-Side (Dark Studio + Amber Sand + Canopy Moss + Forest Shade)
  const nativeStripH = 112;

  const cw = pad * 2 + totalColsW;
  const ch = headerH + pad + row4H + pad + nativeStripH + pad;
  const out = new Uint8ClampedArray(cw * ch * 4);

  const bg = hexToRgba('#12171E', 255);
  const card = hexToRgba('#1B222C', 255);
  const border = hexToRgba('#384758', 255);
  const goldBorder = hexToRgba('#DE884A', 255);
  const textCol = hexToRgba('#EDF2F4', 255);
  const mutedText = hexToRgba('#98A6B5', 255);
  const groundLine = hexToRgba('#4C6275', 255);

  fillPreviewRect(out, cw, ch, 0, 0, cw, ch, bg);
  drawPixelText(
    out,
    cw,
    ch,
    'AST-001 RESOLUTION FEASIBILITY STUDY: 16X24 (REJECTED) VS 32X48 VS 48X64 VS 64X80',
    pad,
    12,
    2,
    goldBorder
  );

  // --- TOP ROW: 4x NEAREST-NEIGHBOR GROUND-ALIGNED COMPARISON ---
  const row1Y = headerH + 6;
  const groundLineY4x = row1Y + row4H - 22;
  let cx = pad;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const colW = colWidths[i];
    fillPreviewRect(out, cw, ch, cx, row1Y, colW, row4H, card);
    strokePreviewRect(out, cw, ch, cx, row1Y, colW, row4H, e.highlight ? goldBorder : border);
    drawPixelText(out, cw, ch, e.label, cx + 8, row1Y + 7, 2, e.highlight ? goldBorder : textCol);
    drawPixelText(out, cw, ch, e.sub, cx + 8, row1Y + 21, 1, mutedText);
    // Shared ground baseline at 4x
    fillPreviewRect(out, cw, ch, cx + 6, groundLineY4x, colW - 12, 1, groundLine);

    const s4 = scaleNearestRGBA(e.comp, e.w, e.h, 4);
    const drawX = cx + Math.floor((colW - e.w * 4) / 2);
    const drawY = groundLineY4x - e.pivotY * 4 - 3;
    blitOver(out, cw, ch, s4, e.w * 4, e.h * 4, drawX, drawY);
    cx += colW + colGap;
  }

  // --- BOTTOM ROW: TRUE 1X NATIVE SCALE ACROSS 4 BIOME BACKDROPS ---
  const row2Y = row1Y + row4H + pad;
  const biomes = [
    { name: '1X DARK STUDIO', hex: '#1B222C', text: '#EDF2F4' },
    { name: '1X AMBER COAST SAND', hex: '#B89A6C', text: '#231622' },
    { name: '1X SINGING CANOPY MOSS', hex: '#6F8A68', text: '#141A21' },
    { name: '1X DEEP FOREST SHADE', hex: '#2D423E', text: '#EDF2F4' },
  ];
  const biomeW = Math.floor((totalColsW - colGap * 3) / 4);
  for (let b = 0; b < biomes.length; b++) {
    const bx = pad + b * (biomeW + colGap);
    fillPreviewRect(out, cw, ch, bx, row2Y, biomeW, nativeStripH, hexToRgba(biomes[b].hex, 255));
    strokePreviewRect(out, cw, ch, bx, row2Y, biomeW, nativeStripH, border);
    drawPixelText(out, cw, ch, biomes[b].name, bx + 8, row2Y + 6, 1, hexToRgba(biomes[b].text, 255));

    const baseLineY = row2Y + nativeStripH - 12;
    fillPreviewRect(out, cw, ch, bx + 6, baseLineY, biomeW - 12, 1, hexToRgba('#000000', 255));
    // Place all 4 resolutions side by side at exact 1x native scale, grounded on baseLineY!
    const totalNativeW = entries.reduce((acc, e) => acc + e.w, 0) + 10 * (entries.length - 1);
    let nx = bx + Math.floor((biomeW - totalNativeW) / 2);
    for (const e of entries) {
      const ny = baseLineY - e.pivotY - 1;
      blitOver(out, cw, ch, e.comp, e.w, e.h, nx, ny);
      nx += e.w + 10;
    }
  }

  return { pixels: out, width: cw, height: ch };
}

fs.mkdirSync(PREV_DIR, { recursive: true });

const prototypes: Array<{ slug: string; label: string; sub: string; doc: ProjectDocument; highlight?: boolean }> = [
  {
    slug: 'mara_lin_proto_32x48',
    label: '32X48',
    sub: '2X3 TILES (4X AREA)',
    doc: buildMaraProto32x48(),
  },
  {
    slug: 'mara_lin_proto_48x64',
    label: '48X64',
    sub: '3X4 TILES (8X AREA)',
    doc: buildMaraProto48x64(),
    highlight: true,
  },
  {
    slug: 'mara_lin_proto_64x80',
    label: '64X80',
    sub: '4X5 TILES (13.3X)',
    doc: buildMaraProto64x80(),
  },
];

// Read rejected 16x24 candidate frame 0 non-destructively for comparison baseline ONLY
const rejectedDoc = deserializeProjectJSON(fs.readFileSync(REJECTED_VPF, 'utf-8'));
const rejectedComp = compositeFrame(rejectedDoc.width, rejectedDoc.height, rejectedDoc.layers, rejectedDoc.frames[0], null);

const comparisonEntries: Array<{
  label: string;
  sub: string;
  comp: Uint8ClampedArray;
  w: number;
  h: number;
  pivotY: number;
  highlight?: boolean;
}> = [
  {
    label: '16X24',
    sub: 'REJECTED BASELINE',
    comp: rejectedComp,
    w: rejectedDoc.width,
    h: rejectedDoc.height,
    pivotY: rejectedDoc.pivot.y,
  },
];

const report: Array<Record<string, unknown>> = [];

for (const p of prototypes) {
  const { doc, slug, label, sub, highlight } = p;
  const comp = compositeFrame(doc.width, doc.height, doc.layers, doc.frames[0], null);
  const qc = runPixelQualityAudit(comp, doc.width, doc.height, VERDANT_MASTER_PALETTE, 16, 16);
  const bounds = getOpaqueBounds(comp, doc.width, doc.height);

  // 1. Save editable .vpf.json via VERDANT PIXEL FORGE serializer
  const vpfPath = path.join(OUT_DIR, `${slug}.vpf.json`);
  fs.writeFileSync(vpfPath, serializeVpfProject(doc), 'utf-8');

  // 2. Save native transparent RGBA8 PNG via VERDANT PIXEL FORGE PNG encoder
  const pngPath = path.join(OUT_DIR, `${slug}.png`);
  fs.writeFileSync(pngPath, encodeRGBA8PNG(comp, doc.width, doc.height));

  // 3. Save individual 1x + 4x + 4-biome review card
  const card = buildIndividualReviewCard(`MARA LIN PROTOTYPE ${label} (VERDANT PIXEL FORGE)`, comp, doc.width, doc.height, doc.pivot.y);
  fs.writeFileSync(path.join(PREV_DIR, `${slug}_1x_and_4x.png`), encodeRGBA8PNG(card.pixels, card.width, card.height));

  comparisonEntries.push({
    label,
    sub,
    comp,
    w: doc.width,
    h: doc.height,
    pivotY: doc.pivot.y,
    highlight,
  });

  report.push({
    slug,
    dimensions: `${doc.width}x${doc.height}`,
    layers: doc.layers.length,
    pivot: doc.pivot,
    opaquePixels: bounds.opaquePixels,
    fillPct: bounds.fillPct,
    bbox: bounds.bbox,
    uniqueColors: qc.uniqueColors,
    offPalettePixels: qc.offPalettePixels,
    semiAlphaPixels: qc.semiAlphaPixels,
    orphanPixels: qc.accidentalOrphans.length,
    intentionalCatchlights: qc.intentionalHighlights.length,
    lightAngleDeg: qc.lightAngleDeg,
    lightConsistencyScore: qc.lightConsistencyScore,
  });
}

// 4. Save Master 4-Resolution Visual Comparison Board
const board = buildMasterComparisonSheet(comparisonEntries);
fs.writeFileSync(
  path.join(PREV_DIR, 'ast001_resolution_comparison_1x_and_4x.png'),
  encodeRGBA8PNG(board.pixels, board.width, board.height)
);

console.log(JSON.stringify({ prototypes: report, comparison_board: `${board.width}x${board.height}` }, null, 2));
