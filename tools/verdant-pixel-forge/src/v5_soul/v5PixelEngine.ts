/**
 * VERDANT SIGNAL V5.0 — THE SOUL OF PIXEL ART CORE ENGINE
 * =======================================================
 * Authentic pixel-artist palette discipline (curated 56-color hue-shifted ramps),
 * perceptual OKLab cluster quantization, gradient-selective 2x2 classic pixel dither
 * (sky/mist only — solid sculpted clusters on forms!), morphological orphan-pixel
 * cleanup, crisp pixel primitives, and validated VPF (.vpf.json) serialization.
 */

import { execFileSync } from 'node:child_process';
import { createEmptyBuffer, setPixel } from '../engine/pixelBuffer';
import { serializeVpfProject } from '../engine/exportEngine';
import { DEFAULT_PALETTES } from '../engine/paletteEngine';
import type { AnimationFrame, LayerNode, PaletteColor, PalettePreset, ProjectDocument, RGBA } from '../types/studio';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface OKLab {
  L: number;
  a: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Perceptual OKLab conversion (far superior to RGB Euclidean for pixel-art palette ramps!) */
export function rgbToOklab(r: number, g: number, b: number): OKLab {
  const lin = (u: number) => {
    const s = u / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const lr = lin(r);
  const lg = lin(g);
  const lb = lin(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return {
    L: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  };
}

// ============================================================================
// CURATED 56-COLOR HUE-SHIFTED PIXEL-ART MASTER PALETTES
// ============================================================================

/** B. THE OCEAN — Amber Coast Alien Morning Sunrise Palette (56 curated pixel-art colors) */
export const AMBER_COAST_V5_PALETTE: string[] = [
  // Sunrise Sky & Clouds (warm apricot-gold -> soft turquoise zenith)
  '#fff9e0', '#ffe9ad', '#ffd082', '#f7ac6b', '#de8d63', '#b87a70', '#8d6f7a',
  '#bce8e0', '#88d1d4', '#63b5c4',
  // Distant Misty Headlands & Atmospheric Horizon
  '#8ca0c4', '#6c7ea8', '#52608a', '#3d4670',
  // Multi-Depth Living Ocean (sapphire -> marine -> emerald-turquoise -> crystal aqua -> foam)
  '#0f2648', '#153a66', '#175282', '#176e96', '#188ba3', '#22aba8',
  '#45c9b8', '#7be0c8', '#b8f0dc', '#edfbf4',
  // Golden Beach Sand & Mirror Wet Sand
  '#fce6a8', '#f2cb7c', '#deac5c', '#c28a46', '#9e6838', '#75482e', '#4d2c24',
  // Stratified Coastal Sandstone Cliffs & Wet Dark Basalt Rocks
  '#f0a054', '#d6783c', '#b55630', '#8c3d2a', '#632b28', '#3c1e26',
  '#5d5961', '#3f3d48', '#292935', '#171824',
  // Cliff Moss, Alien Tide-Kelp & Mirror Glasswort Succulents
  '#e0e86b', '#a8c744', '#6f9c34', '#436e2c', '#264726', '#162c20',
  '#d49b24', '#8f5f18', '#52f0e6', '#21b8ba',
  // Mara Hero Accents (embedded smoothly into the exact same scene palette!)
  '#ff8a3d', '#d95422', '#8f2718', '#42151a', '#d7e2ec',
];

/** C. THE LIVING WORLD — Singing Canopy Alien Forest Sanctuary Palette (56 curated pixel-art colors) */
export const SINGING_CANOPY_V5_PALETTE: string[] = [
  // Honey-Gold Morning Sun-Shafts & Atmospheric Forest Mist
  '#fffbe0', '#fff0ad', '#f5da82', '#d9bf6f', '#b5b878', '#89b088', '#629c8c', '#457c7a',
  // Layered Forest Foliage & Foreground Deep Spruce Silhouettes
  '#d2e368', '#a1c449', '#709e3b', '#487a32', '#2d592c', '#1c3e26', '#112920', '#0a1919',
  // Fluted Ancient Singing Reedwood Bark & Mossy Roots
  '#ebd09c', '#cca974', '#a88154', '#825e3c', '#5e402c', '#3e2922', '#241818',
  // Crystal Woodland Spring Pool & Shimmering Reflections
  '#dffef8', '#98f2ec', '#55dce0', '#28b7c4', '#188ba3', '#12607a', '#0f3e59',
  // Bioluminescent Alien Violet-Magenta Shelf-Fungi
  '#ffd6ff', '#eb96f0', '#c45cd6', '#8a34a6', '#521e6e',
  // Radiant Golden Sun-Drop Orchids
  '#ffdf66', '#f5a62a', '#d6681c', '#8f3616',
  // Glowing Turquoise Wind-Slits & Hanging Spore Tendrils
  '#75fff2', '#33d6d4', '#1696a1',
  // Mossy Stepping Stones & Ancient Weather-Carved Relic Cairn
  '#c7c9b0', '#969c88', '#687064', '#434a46', '#2a3030',
  // Mara Hero Accents (unified seamlessly into sanctuary palette!)
  '#ff8c42', '#d95422', '#942818', '#45151a', '#e0ebf2', '#8aa3b8', '#4c5f73', '#232c3b',
  '#cf3438',
];

/** A. THE HERO — Dr. Mara Lin Close-Up Emotional Portrait Palette (48 curated pixel-art colors) */
export const MARA_PORTRAIT_V5_PALETTE: string[] = [
  // Morning Sunrise Sky & Distant Coastal Backdrop
  '#fff8de', '#ffe5a8', '#fcc888', '#eda674', '#d19888', '#a38996', '#7b788e',
  '#c4f0e8', '#8ad6d4', '#56aeb8', '#387e91',
  // Burnt-Terracotta Weathered Exploration Spacesuit & Helmet
  '#ffb068', '#eb8442', '#cf602c', '#a84222', '#7a2c1e', '#4d1a1c', '#291018',
  // Panoramic Curved Teal Glass Visor & Reflected Horizon
  '#ebfffa', '#a6f4ec', '#60d9d6', '#33adb3', '#1c7c8c', '#124e63', '#0b2b3d',
  // Warm Expressive Human Skin, Eyes & Hair Behind Tinted Visor
  '#ffe0bf', '#f2ba91', '#d99370', '#b56e58', '#874c44', '#572d2e', '#1c1a26',
  // Weathered Crimson-Amber Flowing Expedition Scarf
  '#f09250', '#c74d36', '#942b29', '#611b24', '#38101c',
  // Brushed Silver-White Titanium Backpack, Ear-Comm Pod & Red O2 Valve
  '#f2f7fa', '#c6d4de', '#8fa2b2', '#5f7182', '#3c4857', '#202633',
  '#ed4245', '#ab222c',
  // Dark Navy Insulated Collar & Leather Harness
  '#303e57', '#1a2236', '#78503c',
];

/** Load a 1:1 square painting cleanly onto exact pixel dimensions with Kuwahara graphic smoothing */
export function loadSquareUnderpaintToGrid(filePath: string, size: number, kuwaharaRadius = 2): Uint8ClampedArray {
  const args = [
    filePath,
    ...(kuwaharaRadius > 0 ? ['-kuwahara', String(kuwaharaRadius)] : []),
    '-filter', 'Lanczos',
    '-resize', `${size}x${size}!`,
    '-depth', '8',
    'rgba:-',
  ];
  const raw = execFileSync('convert', args, { maxBuffer: size * size * 4 + 65536 });
  if (raw.length !== size * size * 4) {
    throw new Error(`Unexpected raw RGBA size from ${filePath}: got ${raw.length}`);
  }
  return new Uint8ClampedArray(raw);
}

/** Render a crisp visual Palette Swatch Matrix directly onto an inspection board! */
export function drawPaletteSwatches(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  paletteHex: string[],
  x0: number,
  y0: number,
  cols = 14,
  cellSize = 26,
  gap = 4
): void {
  paletteHex.forEach((hex, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const sx = x0 + col * (cellSize + gap);
    const sy = y0 + row * (cellSize + gap);
    const rgb = hexToRgb(hex);
    for (let y = 0; y < cellSize; y++) {
      for (let x = 0; x < cellSize; x++) {
        const isBorder = x === 0 || y === 0 || x === cellSize - 1 || y === cellSize - 1;
        setPixel(
          buf, w, h, sx + x, sy + y,
          isBorder ? { r: 22, g: 30, b: 44, a: 255 } : { r: rgb.r, g: rgb.g, b: rgb.b, a: 255 }
        );
      }
    }
  });
}

/**
 * Load an external PNG cleanly at exact target dimensions using ImageMagick edge-preserving
 * pixel-art preparation (`-kuwahara` graphic plane smoothing + crisp Lanczos downsample).
 */
export function loadUnderpaintToGrid(filePath: string, targetW: number, targetH: number, kuwaharaRadius = 2): Uint8ClampedArray {
  // Crop strictly to exact 16:9 centered aspect, apply gentle edge-preserving Kuwahara graphic
  // plane smoothing so painted areas form clean bold pixel-art clusters (never noisy photographic fuzz!),
  // then crisp-downsample onto the exact native pixel canvas!
  const args = [
    filePath,
    '-gravity', 'Center',
    '-crop', '1365x768+0+0', '+repage',
    ...(kuwaharaRadius > 0 ? ['-kuwahara', String(kuwaharaRadius)] : []),
    '-filter', 'Lanczos',
    '-resize', `${targetW}x${targetH}!`,
    '-depth', '8',
    'rgba:-',
  ];
  const raw = execFileSync('convert', args, { maxBuffer: targetW * targetH * 4 + 65536 });
  if (raw.length !== targetW * targetH * 4) {
    throw new Error(`Unexpected raw RGBA size from ${filePath}: got ${raw.length}`);
  }
  return new Uint8ClampedArray(raw);
}

/** 2x2 classic handcrafted pixel-art ordered Bayer matrix (scaled -0.5..+0.5) */
const BAYER_2X2 = [
  [-0.375, 0.125],
  [0.375, -0.125],
];

/**
 * TRUE PIXEL-ART CLUSTER QUANTIZER + ORPHAN-PIXEL CLEANUP
 * Maps an underpainting cleanly onto a strict curated pixel-art palette in perceptual OKLab space:
 * - Solid sculpted pixel clusters on high-contrast forms (rocks, cliffs, waves, foliage, trunks)
 * - Gentle classic 2x2 pixel-art dither ONLY on ultra-smooth atmospheric sky/mist/glow gradients
 * - 2-pass morphological orphan-pixel cleanup removes stray 1px confetti speckles while
 *   strictly preserving crisp bright highlights (sun sparkles, crescent moon, thin turquoise slits)!
 */
export function digitizeToCraftedPixelArt(
  srcRgba: Uint8ClampedArray,
  w: number,
  h: number,
  paletteHex: string[],
  opts?: {
    ditherThreshold?: number; // local gradient below which subtle 2x2 dither activates
    ditherStrength?: number;  // OKLab L-nudge amount
    cleanPasses?: number;
  }
): { pixels: Uint8ClampedArray; indices: Uint8Array; palette: RGB[] } {
  const palette = paletteHex.map(hexToRgb);
  const palLab = palette.map((c) => rgbToOklab(c.r, c.g, c.b));

  // Precompute OKLab image
  const srcLab: OKLab[] = new Array(w * h);
  for (let i = 0; i < w * h; i++) {
    srcLab[i] = rgbToOklab(srcRgba[i * 4], srcRgba[i * 4 + 1], srcRgba[i * 4 + 2]);
  }

  const ditherThreshold = opts?.ditherThreshold ?? 0.042;
  const ditherStrength = opts?.ditherStrength ?? 0.024;
  const indices = new Uint8Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const cur = srcLab[idx];

      // Measure local gradient magnitude to distinguish smooth sky/mist from crisp edges!
      const lx = x > 0 ? srcLab[idx - 1] : cur;
      const rx = x + 1 < w ? srcLab[idx + 1] : cur;
      const uy = y > 0 ? srcLab[idx - w] : cur;
      const dy = y + 1 < h ? srcLab[idx + w] : cur;
      const grad =
        Math.hypot(rx.L - lx.L, (rx.a - lx.a) * 1.4, (rx.b - lx.b) * 1.4) +
        Math.hypot(dy.L - uy.L, (dy.a - uy.a) * 1.4, (dy.b - uy.b) * 1.4);

      const dither = grad < ditherThreshold ? BAYER_2X2[y & 1][x & 1] * ditherStrength : 0;
      const tL = cur.L + dither;
      const ta = cur.a;
      const tb = cur.b;

      let best = 0;
      let bestDist = 1e9;
      for (let p = 0; p < palLab.length; p++) {
        const pl = palLab[p];
        const dL = tL - pl.L;
        const da = ta - pl.a;
        const db = tb - pl.b;
        // Weight chroma slightly higher so vivid turquoise/violet/gold accents stay rich!
        const dist = dL * dL + (da * da + db * db) * 1.35;
        if (dist < bestDist) {
          bestDist = dist;
          best = p;
        }
      }
      indices[idx] = best;
    }
  }

  // Morphological Pixel-Art Cluster Cleanup Pass:
  // Eliminate noisy isolated 1px speckles while strictly protecting intentional bright highlights
  // (moon, sun sparkles, foam dots, bioluminescent accents) and crisp dark silhouette outlines!
  const cleanPasses = opts?.cleanPasses ?? 2;
  for (let pass = 0; pass < cleanPasses; pass++) {
    const next = new Uint8Array(indices);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        const me = indices[idx];
        const meL = palLab[me].L;

        // Check 4-connected & 8-connected neighbors
        let same4 = 0;
        let same8 = 0;
        const counts = new Map<number, number>();
        for (let oy = -1; oy <= 1; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            if (ox === 0 && oy === 0) continue;
            const n = indices[(y + oy) * w + (x + ox)];
            if (n === me) {
              same8++;
              if (ox === 0 || oy === 0) same4++;
            } else {
              counts.set(n, (counts.get(n) ?? 0) + 1);
            }
          }
        }
        // Only clean strictly isolated orphan pixels (0 cardinal matches and <=1 diagonal match)
        if (same4 === 0 && same8 <= 1) {
          let dom = me;
          let domCnt = 0;
          for (const [k, v] of counts.entries()) {
            if (v > domCnt) {
              domCnt = v;
              dom = k;
            }
          }
          // Protect deliberate high-contrast specular glints or vivid thin glowing lines!
          const domLab = palLab[dom];
          const contrast = Math.abs(meL - domLab.L);
          const chromaMe = Math.hypot(palLab[me].a, palLab[me].b);
          if (domCnt >= 4 && contrast < 0.24 && !(chromaMe > 0.14 && meL > 0.72)) {
            next[idx] = dom;
          }
        }
      }
    }
    indices.set(next);
  }

  const pixels = createEmptyBuffer(w, h);
  for (let i = 0; i < w * h; i++) {
    const c = palette[indices[i]];
    pixels[i * 4] = c.r;
    pixels[i * 4 + 1] = c.g;
    pixels[i * 4 + 2] = c.b;
    pixels[i * 4 + 3] = 255;
  }
  return { pixels, indices, palette };
}

/** Alpha-blend a single RGB pixel onto a target buffer cleanly */
export function blendRgbPx(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  x: number,
  y: number,
  rgb: RGB,
  alpha: number
): void {
  const ix = Math.round(x);
  const iy = Math.round(y);
  if (ix < 0 || iy < 0 || ix >= w || iy >= h) return;
  const i = (iy * w + ix) * 4;
  const sa = Math.max(0, Math.min(1, alpha / 255));
  const da = buf[i + 3] / 255;
  const outA = sa + da * (1 - sa);
  if (outA <= 0) return;
  buf[i] = Math.round((rgb.r * sa + buf[i] * da * (1 - sa)) / outA);
  buf[i + 1] = Math.round((rgb.g * sa + buf[i + 1] * da * (1 - sa)) / outA);
  buf[i + 2] = Math.round((rgb.b * sa + buf[i + 2] * da * (1 - sa)) / outA);
  buf[i + 3] = Math.round(outA * 255);
}

/** Serialize multi-layer RGBA buffers cleanly into a validated VPF (.vpf.json) editable project */
export function serializeBuffersToVpf(opts: {
  id: string;
  name: string;
  width: number;
  height: number;
  paletteHex: string[];
  layers: Array<{ id: string; name: string; pixels: Uint8ClampedArray }>;
  pivot: { x: number; y: number };
  tileSize: number;
  styleNotes: string;
}): string {
  const paletteColors: PaletteColor[] = opts.paletteHex.map((hex, i) => ({
    id: `v5_c_${i}`,
    name: `V5 Color ${i}`,
    hex,
    locked: true,
    ramp: 'v5_soul',
  }));
  const palette: PalettePreset = {
    id: `${opts.id}_palette`,
    name: `${opts.name} Master Palette`,
    description: opts.styleNotes,
    colors: paletteColors,
  };
  const layers: LayerNode[] = opts.layers.map((l) => ({
    id: l.id,
    name: l.name,
    kind: 'layer',
    parentId: null,
    visible: true,
    locked: false,
    opacity: 100,
    clipped: false,
  }));
  const frame: AnimationFrame = {
    id: 'v5_frame_0',
    durationMs: 120,
    cels: Object.fromEntries(opts.layers.map((l) => [l.id, new Uint8ClampedArray(l.pixels)])),
  };
  const doc: ProjectDocument = {
    id: opts.id,
    name: opts.name,
    width: opts.width,
    height: opts.height,
    layers,
    frames: [frame],
    tags: [{ id: 'v5_tag', name: 'v5_soul_masterpiece', from: 0, to: 0, color: '#F7AC6B' }],
    activeLayerId: layers[layers.length - 1].id,
    activeFrameIndex: 0,
    soloLayerId: null,
    palettes: [palette, ...DEFAULT_PALETTES],
    activePaletteId: palette.id,
    paletteLocked: true,
    tileset: {
      tileWidth: opts.tileSize,
      tileHeight: opts.tileSize,
      selectedTileIndex: 0,
      metadata: {},
      mapCols: 4,
      mapRows: 4,
      mapCells: Array.from({ length: 16 }, () => ({ tileIndex: -1, rotation: 0, flipH: false, flipV: false })),
    },
    guides: [{ id: 'g_ground', orientation: 'horizontal', pos: opts.pivot.y }],
    styleNotes: opts.styleNotes,
    references: [],
    pivot: opts.pivot,
    updatedAt: Date.now(),
  };
  return serializeVpfProject(doc);
}

/** Crop a rectangular region cleanly from an RGBA buffer */
export function cropRgba(
  src: Uint8ClampedArray,
  sw: number,
  sh: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): Uint8ClampedArray {
  const out = createEmptyBuffer(rw, rh);
  for (let y = 0; y < rh; y++) {
    const sy = ry + y;
    if (sy < 0 || sy >= sh) continue;
    for (let x = 0; x < rw; x++) {
      const sx = rx + x;
      if (sx < 0 || sx >= sw) continue;
      const si = (sy * sw + sx) * 4;
      const di = (y * rw + x) * 4;
      out[di] = src[si];
      out[di + 1] = src[si + 1];
      out[di + 2] = src[si + 2];
      out[di + 3] = src[si + 3];
    }
  }
  return out;
}

/** Paint a 1px solid border frame around a viewport rect on an inspection board */
export function drawRectBorder(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  x: number,
  y: number,
  rw: number,
  rh: number,
  col: RGBA
): void {
  for (let ix = x; ix < x + rw; ix++) {
    setPixel(buf, w, h, ix, y, col);
    setPixel(buf, w, h, ix, y + rh - 1, col);
  }
  for (let iy = y; iy < y + rh; iy++) {
    setPixel(buf, w, h, x, iy, col);
    setPixel(buf, w, h, x + rw - 1, iy, col);
  }
}
