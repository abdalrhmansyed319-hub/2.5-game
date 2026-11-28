/**
 * VERDANT SIGNAL — V11.0 "The Art of Immersion"
 * Handcrafted Micro-Storytelling Pixel-Art Assets + Editable .vpf.json Sources (Pass 2 Refined)
 *
 * Generates ONLY 3 focused, lore-faithful environmental storytelling sprites
 * (preserving all V8.0, V9.0, and V10.0 assets untouched):
 *   1. surveyor01_peg.png (24x28)        — Weathered 19-year-old SRV-01 titanium survey piton
 *   2. metallic_blight_crust.png (36x24) — Asymmetric root overtaken by ash-grey catalyst crust
 *   3. mycelial_luminous_seam.png (32x28)— Asymmetric damp mossy pocket with luminous mycelium
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import {
  type SpriteBitmap,
  hexToRgb,
  saveEditableVpfSource,
  savePngRgba,
} from '../v90_broken_shore/v90PaletteAndExtractor';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const OUT_SPRITES_DIR = path.join(REPO_ROOT, 'game/assets/world/immersion/sprites');
const OUT_VPF_DIR = path.join(REPO_ROOT, 'game/assets/_vpf_sources/immersion');
const QA_DIR = '/tmp/v110_qa';

function makeBitmap(w: number, h: number): SpriteBitmap {
  return { w, h, rgba: new Uint8Array(w * h * 4) };
}

function setPx(bmp: SpriteBitmap, x: number, y: number, hex: string, a = 255): void {
  const ix = Math.round(x);
  const iy = Math.round(y);
  if (ix < 0 || iy < 0 || ix >= bmp.w || iy >= bmp.h) return;
  const { r, g, b } = hexToRgb(hex);
  const o = (iy * bmp.w + ix) * 4;
  bmp.rgba[o] = r;
  bmp.rgba[o + 1] = g;
  bmp.rgba[o + 2] = b;
  bmp.rgba[o + 3] = a;
}

function drawLine(bmp: SpriteBitmap, x0: number, y0: number, x1: number, y1: number, hex: string, a = 255): void {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    setPx(bmp, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, hex, a);
  }
}

function fillEllipse(
  bmp: SpriteBitmap,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  hex: string,
  a = 255
): void {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1.0) setPx(bmp, x, y, hex, a);
    }
  }
}

function applyCrispOutline(bmp: SpriteBitmap, outlineHex: string): void {
  const copy = new Uint8Array(bmp.rgba);
  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (let y = 0; y < bmp.h; y++) {
    for (let x = 0; x < bmp.w; x++) {
      const o = (y * bmp.w + x) * 4;
      if (copy[o + 3] >= 128) continue;
      let touchesOpaque = false;
      for (const [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= bmp.w || ny >= bmp.h) continue;
        if (copy[(ny * bmp.w + nx) * 4 + 3] >= 200) {
          touchesOpaque = true;
          break;
        }
      }
      if (touchesOpaque) setPx(bmp, x, y, outlineHex, 255);
    }
  }
}

/** 1. Pass 2: Asymmetric 19-year-old Surveyor-01 titanium geological piton + collar + stub whip (24x28) */
function buildSurveyor01Peg(): SpriteBitmap {
  const bmp = makeBitmap(24, 28);

  // Asymmetric sloped metal foot-plate / anchoring collar tilted into earth
  for (let x = 7; x <= 17; x++) {
    setPx(bmp, x, 23, x < 12 ? '#676f75' : '#404650');
    setPx(bmp, x, 24, '#363c46');
  }
  // Tiny diagonal support strut on right side only (asymmetric industrial silhouette!)
  drawLine(bmp, 12, 18, 17, 23, '#404650');
  drawLine(bmp, 12, 17, 16, 22, '#9d9b94');

  // Slanted titanium survey mast (tilted ~15 deg left from coastal wind erosion)
  for (let i = 0; i < 16; i++) {
    const y = 23 - i;
    const cx = 11 - i * 0.18;
    for (let dx = -1; dx <= 1; dx++) {
      const px = Math.round(cx + dx);
      let col = dx === -1 ? '#d2cdc0' : dx === 0 ? '#9d9b94' : '#404650';
      // Weathered Solstice burnt-orange telemetry band
      if (i >= 9 && i <= 11) {
        col = dx === -1 ? '#d86820' : dx === 0 ? '#a44522' : '#6e2e1d';
      }
      // Corroded salt streak near lower shaft
      if (i >= 2 && i <= 4 && dx === 0) col = '#676f75';
      setPx(bmp, px, y, col);
    }
  }

  // Beveled sensor head housing + dark glass lens slit
  for (let dx = -2; dx <= 2; dx++) {
    setPx(bmp, 8 + dx, 7, dx <= 0 ? '#eeeadf' : '#9d9b94');
    setPx(bmp, 8 + dx, 8, dx === -1 ? '#8cf2ea' : dx <= 0 ? '#676f75' : '#404650');
  }
  // Bent thin micro-antenna wire rising asymmetrically from top-left
  drawLine(bmp, 7, 6, 5, 2, '#676f75');
  setPx(bmp, 5, 2, '#d2cdc0');

  // Frayed orange survey tape flag fluttering off right collar
  drawLine(bmp, 11, 12, 16, 11, '#d86820');
  drawLine(bmp, 12, 13, 18, 13, '#a44522');
  setPx(bmp, 19, 13, '#f2b25f');

  // One small weathered coastal stone tucked against left foot-plate
  fillEllipse(bmp, 6.2, 23.5, 2.0, 1.4, '#4d5364');
  setPx(bmp, 6, 22, '#7d8392');

  applyCrispOutline(bmp, '#1e0c1c');

  // Subtle translucent ground shadow beneath base only
  for (let x = 5; x <= 19; x++) {
    const o = (25 * bmp.w + x) * 4;
    if (bmp.rgba[o + 3] === 0) setPx(bmp, x, 25, '#2b242c', 125);
  }
  return bmp;
}

/** 2. Pass 2: Asymmetric dead organic root overtaken from the left by ash-grey metallic blight crust (36x24) */
function buildMetallicBlightCrust(): SpriteBitmap {
  const bmp = makeBitmap(36, 24);

  // Diagonal exposed gnarled tree root (living/warm bark on right -> dead grey-choked on left!)
  // Right healthy-to-fading wood end (x = 18..31)
  for (let t = 0; t <= 16; t++) {
    const u = t / 16;
    const x = Math.round(18 + u * 13);
    const y = Math.round(13 + Math.sin(u * 2.4) * 3.0 + u * 2.2);
    setPx(bmp, x, y - 2, '#8d684a');
    setPx(bmp, x, y - 1, '#704c36');
    setPx(bmp, x, y, '#4e3528');
    setPx(bmp, x, y + 1, '#36231d');
  }
  // Small living moss tuft retreating at far right tip
  fillEllipse(bmp, 29, 14, 2.6, 1.5, '#335c3e');
  setPx(bmp, 29, 13, '#679c52');

  // Left & central root completely overtaken by chalky ash-grey metallic catalyst crust (x = 4..21)
  for (let t = 0; t <= 18; t++) {
    const u = t / 18;
    const x = Math.round(4 + u * 17);
    const y = Math.round(16 - u * 3.0 + Math.sin(u * 3.1) * 1.8);
    setPx(bmp, x, y - 2, '#b4b8c0');
    setPx(bmp, x, y - 1, '#848994');
    setPx(bmp, x, y, '#585c66');
    setPx(bmp, x, y + 1, '#3a3d47');
  }

  // Secondary choked side-root spur extending upper-left
  drawLine(bmp, 13, 13, 8, 8, '#585c66');
  drawLine(bmp, 13, 12, 8, 7, '#9ea3ad');

  // Calcified metallic crust blisters & brittle pewter-violet crystal splinters
  fillEllipse(bmp, 12, 13, 4.4, 2.8, '#676c76');
  fillEllipse(bmp, 11.2, 12.2, 2.8, 1.7, '#9fa4ae');
  setPx(bmp, 10, 11, '#cfd2d8');

  fillEllipse(bmp, 18, 12, 3.6, 2.2, '#5c606c');
  fillEllipse(bmp, 17.5, 11.4, 2.1, 1.3, '#8f949f');

  // Tiny unnatural sharp mineral needles & pale mauve sheen along the infection boundary
  drawLine(bmp, 15, 10, 16, 6, '#988ba6');
  setPx(bmp, 16, 6, '#cfd2d8');
  drawLine(bmp, 19, 10, 21, 7, '#7b6c88');
  setPx(bmp, 13, 13, '#897a96');
  setPx(bmp, 17, 13, '#897a96');
  setPx(bmp, 8, 15, '#b4b8c0');

  applyCrispOutline(bmp, '#1f202a');

  // Soft desaturated ash soil stain beneath crust
  for (let x = 5; x <= 26; x++) {
    const o = (19 * bmp.w + x) * 4;
    if (bmp.rgba[o + 3] === 0) setPx(bmp, x, 19, '#2e3038', 110);
  }
  return bmp;
}

/** 3. Pass 2: Asymmetric mossy damp root/stone pocket with gossamer turquoise mycelium & micro-caps (32x28) */
function buildMycelialLuminousSeam(): SpriteBitmap {
  const bmp = makeBitmap(32, 28);

  // Asymmetric mossy stone & bark cradle
  fillEllipse(bmp, 15, 18, 10.5, 5.2, '#162922');
  fillEllipse(bmp, 14, 16.5, 8.6, 4.4, '#234232');
  fillEllipse(bmp, 12, 15, 5.8, 3.2, '#335c3e');
  fillEllipse(bmp, 20, 17.5, 5.2, 3.0, '#2a4a38');

  // Curved bark rib framing the left edge
  drawLine(bmp, 6, 18, 9, 12, '#4e3528');
  drawLine(bmp, 7, 18, 10, 12, '#704c36');
  drawLine(bmp, 8, 17, 11, 13, '#335c3e');

  // Low-hugging delicate curved turquoise mycelial filaments weaving organically across damp moss
  const filaments: Array<[number, number, number, number]> = [
    [10, 15, 16, 16],
    [16, 16, 23, 14],
    [23, 14, 26, 17],
    [16, 16, 13, 19],
    [13, 19, 8, 20],
    [16, 16, 20, 20],
    [20, 20, 25, 21],
    [15, 15, 18, 12],
  ];
  for (const [x0, y0, x1, y1] of filaments) {
    drawLine(bmp, x0, y0 + 1, x1, y1 + 1, '#1e4260');
    drawLine(bmp, x0, y0, x1, y1, '#3c949c');
  }

  // Three tiny asymmetric luminous cyan-jade micro-mushrooms nestled in the damp hollow!
  // Cap 1 (left-center, tallest)
  drawLine(bmp, 14, 15, 14, 11, '#56b2a6');
  fillEllipse(bmp, 14, 10, 3.0, 1.6, '#56b2a6');
  setPx(bmp, 13, 9, '#8cf2ea');
  setPx(bmp, 14, 9, '#eff2e5');
  setPx(bmp, 15, 10, '#8cf2ea');

  // Cap 2 (right-lower, medium)
  drawLine(bmp, 20, 16, 21, 13, '#3c949c');
  fillEllipse(bmp, 21, 12.2, 2.3, 1.3, '#56b2a6');
  setPx(bmp, 20, 11, '#8cf2ea');
  setPx(bmp, 21, 12, '#eff2e5');

  // Cap 3 (small bud tucked near base)
  setPx(bmp, 17, 15, '#56b2a6');
  setPx(bmp, 17, 14, '#8cf2ea');
  setPx(bmp, 18, 14, '#eff2e5');

  // Fine glowing spore-beads along threads
  setPx(bmp, 11, 15, '#8cf2ea');
  setPx(bmp, 16, 17, '#eff2e5');
  setPx(bmp, 23, 15, '#8cf2ea');
  setPx(bmp, 12, 19, '#8cf2ea');
  setPx(bmp, 22, 20, '#8cf2ea');

  // Tiny warm amber moss-spore accent on left bark rim
  setPx(bmp, 8, 15, '#d86820');
  setPx(bmp, 9, 14, '#f2b25f');

  applyCrispOutline(bmp, '#142024');
  return bmp;
}

function main(): void {
  fs.mkdirSync(OUT_SPRITES_DIR, { recursive: true });
  fs.mkdirSync(OUT_VPF_DIR, { recursive: true });
  fs.mkdirSync(QA_DIR, { recursive: true });

  const assets: Array<{ id: string; bmp: SpriteBitmap; desc: string }> = [
    {
      id: 'surveyor01_peg',
      bmp: buildSurveyor01Peg(),
      desc: 'Weathered 19-year-old SRV-01 titanium geological survey piton (Kaelen Voss trace)',
    },
    {
      id: 'metallic_blight_crust',
      bmp: buildMetallicBlightCrust(),
      desc: 'Asymmetric gnarled root overtaken by ash-grey mineralized synthetic catalyst residue',
    },
    {
      id: 'mycelial_luminous_seam',
      bmp: buildMycelialLuminousSeam(),
      desc: 'Asymmetric damp mossy pocket with turquoise bioluminescent mycelium and micro-caps',
    },
  ];

  const pngPaths: string[] = [];
  for (const a of assets) {
    const pngPath = path.join(OUT_SPRITES_DIR, `${a.id}.png`);
    const vpfPath = path.join(OUT_VPF_DIR, `${a.id}.vpf.json`);
    savePngRgba(pngPath, a.bmp);
    saveEditableVpfSource(vpfPath, a.id, a.bmp, {
      version: 'V11.0',
      category: 'immersion_storytelling',
      frameWidth: a.bmp.w,
      frameHeight: a.bmp.h,
      frameCount: 1,
      description: a.desc,
    });
    pngPaths.push(pngPath);
    console.log(`Built Pass 2 ${a.id}: ${a.bmp.w}x${a.bmp.h} -> ${path.relative(REPO_ROOT, pngPath)}`);
  }

  const sheetPath = path.join(QA_DIR, 'v110_micro_sprites_pass2_4x.png');
  execFileSync('montage', [
    ...pngPaths,
    '-background',
    '#2a3632',
    '-filter',
    'Point',
    '-resize',
    '400%',
    '-geometry',
    '+16+16',
    '-tile',
    '3x1',
    sheetPath,
  ]);
  console.log(`Rendered Pass 2 4x QA strip -> ${sheetPath}`);
}

main();
