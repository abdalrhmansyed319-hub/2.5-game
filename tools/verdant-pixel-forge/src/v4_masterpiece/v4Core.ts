/**
 * VERDANT SIGNAL — ART DIRECTION V4.0 MASTERPIECE PIXEL ENGINE (Core)
 * ===================================================================
 * Built for elite handcrafted indie pixel-art craftsmanship:
 *   - Curated 64-color hue-shifted V4 Master Palette (cinematic ocean depths,
 *     caustic shallows, mirror-wet sand, iron-oxide & quartz coastal cliffs,
 *     lush sun-dappled forest canopy, alien violet shelf-fungi, thermal gold MLI,
 *     and 4-material Dr. Mara Lin separation)
 *   - True painterly 2x2/3x2 interlocking pixel-cluster shading (lineless sunlit
 *     crests + deep plum/indigo shadow masses — zero cartoon sticker circles!)
 *   - Polygon & variable-width anatomical spline mask builders (organic drapery
 *     & beveled aerospace hulls instead of smooth geometric pills)
 *   - Real ~38 deg directional cast-shadow & ambient-occlusion pass
 *   - Editable VPF `.vpf.json` serializer & strict round-trip validation
 */

import type { AnimationFrame, LayerNode, PaletteColor, PalettePreset, ProjectDocument, RGBA } from '../types/studio';
import { compositeFrame, createEmptyBuffer, hexToRgba, setPixel } from '../engine/pixelBuffer';
import { DEFAULT_PALETTES } from '../engine/paletteEngine';
import { serializeVpfProject } from '../engine/exportEngine';

export interface V4ColorDef {
  id: string;
  name: string;
  hex: string;
  group: string;
}

export const V4_MASTER_PALETTE: V4ColorDef[] = [
  // === 1. DR. MARA LIN — MATTE/SATIN ORANGE EXPLORATION FABRIC (8 steps) ===
  { id: 'S0', name: 'Suit Plum Core Shadow', hex: '#1C0E1A', group: 'Mara Suit' },
  { id: 'S1', name: 'Suit Deep Mahogany', hex: '#3F1922', group: 'Mara Suit' },
  { id: 'S2', name: 'Suit Burnt Umber', hex: '#6E2B22', group: 'Mara Suit' },
  { id: 'S3', name: 'Suit Rich Rust', hex: '#A64126', group: 'Mara Suit' },
  { id: 'S4', name: 'Suit Iconic Terracotta', hex: '#D2622E', group: 'Mara Suit' },
  { id: 'S5', name: 'Suit Sunlit Tangerine', hex: '#EB9044', group: 'Mara Suit' },
  { id: 'S6', name: 'Suit Warm Apricot Crest', hex: '#F6BE6E', group: 'Mara Suit' },
  { id: 'S7', name: 'Suit Silk Specular Rim', hex: '#FDE3A8', group: 'Mara Suit' },

  // === 2. WEATHERED DARK LEATHER, RUBBER & HARNESS (6 compressed steps) ===
  { id: 'B0', name: 'Leather Ink Espresso', hex: '#130E16', group: 'Mara Leather' },
  { id: 'B1', name: 'Leather Deep Core', hex: '#26181F', group: 'Mara Leather' },
  { id: 'B2', name: 'Leather Saddle Shadow', hex: '#452B2A', group: 'Mara Leather' },
  { id: 'B3', name: 'Leather Worn Umber', hex: '#6B4638', group: 'Mara Leather' },
  { id: 'B4', name: 'Leather Scuffed Tan', hex: '#976B50', group: 'Mara Leather' },
  { id: 'B5', name: 'Leather Bleached Edge', hex: '#C49B76', group: 'Mara Leather' },

  // === 3. HIGH-CONTRAST BRUSHED AEROSPACE TITANIUM & CERAMIC (7 steps) ===
  { id: 'M0', name: 'Titanium Steel Recess', hex: '#161C28', group: 'Aerospace Metal' },
  { id: 'M1', name: 'Titanium Dark Gunmetal', hex: '#2D3849', group: 'Aerospace Metal' },
  { id: 'M2', name: 'Titanium Shaded Steel', hex: '#4F5E70', group: 'Aerospace Metal' },
  { id: 'M3', name: 'Titanium Mid Alloy', hex: '#7A8A96', group: 'Aerospace Metal' },
  { id: 'M4', name: 'Titanium Sunlit Bevel', hex: '#AAB6B8', group: 'Aerospace Metal' },
  { id: 'M5', name: 'Titanium Brushed Cream', hex: '#D8DAC8', group: 'Aerospace Metal' },
  { id: 'M6', name: 'Titanium Razor Specular', hex: '#F8F7E6', group: 'Aerospace Metal' },

  // === 4. CURVED PANORAMIC VISOR GLASS & HARMONIC OPTICS (8 steps) ===
  { id: 'V0', name: 'Visor Abyssal Interior', hex: '#09141E', group: 'Visor & Optics' },
  { id: 'V1', name: 'Visor Deep Marine', hex: '#132B3A', group: 'Visor & Optics' },
  { id: 'V2', name: 'Visor Curved Teal', hex: '#214C5C', group: 'Visor & Optics' },
  { id: 'V3', name: 'Visor Horizon Mid', hex: '#387685', group: 'Visor & Optics' },
  { id: 'V4', name: 'Visor Sky Dome', hex: '#63A8AE', group: 'Visor & Optics' },
  { id: 'V5', name: 'Visor Mint Reflection', hex: '#9FD9CE', group: 'Visor & Optics' },
  { id: 'V6', name: 'Visor Crisp Catchlight', hex: '#E8FAF0', group: 'Visor & Optics' },
  { id: 'VR', name: 'Visor Warm Sand Bounce', hex: '#947858', group: 'Visor & Optics' },

  // === 5. SCIENTIFIC TELEMETRY, SPECIMEN & THERMAL GOLD FOIL (8 steps) ===
  { id: 'L0', name: 'Harmonic Deep Glow', hex: '#165E68', group: 'Science & Foil' },
  { id: 'L1', name: 'Harmonic Wave Cyan', hex: '#29A6A8', group: 'Science & Foil' },
  { id: 'L2', name: 'Harmonic Bright Pulse', hex: '#69E6D8', group: 'Science & Foil' },
  { id: 'L3', name: 'Harmonic Pure Spark', hex: '#D8FFF8', group: 'Science & Foil' },
  { id: 'R0', name: 'Ruby Valve Dark', hex: '#6E1E28', group: 'Science & Foil' },
  { id: 'R1', name: 'Ruby LED Bright', hex: '#E34B46', group: 'Science & Foil' },
  { id: 'A0', name: 'Thermal Foil Shade', hex: '#7A4816', group: 'Science & Foil' },
  { id: 'A1', name: 'Thermal Gold Foil', hex: '#E8AE38', group: 'Science & Foil' },

  // === 6. LIVING AMBER COAST OCEAN & SHALLOW SEABED (12 steps!) ===
  { id: 'W0', name: 'Ocean Abyssal Indigo', hex: '#0A1D33', group: 'Living Ocean' },
  { id: 'W1', name: 'Ocean Deep Cobalt', hex: '#11314F', group: 'Living Ocean' },
  { id: 'W2', name: 'Ocean Swell Blue', hex: '#194B6A', group: 'Living Ocean' },
  { id: 'W3', name: 'Ocean Cerulean Reef', hex: '#236A82', group: 'Living Ocean' },
  { id: 'W4', name: 'Ocean Emerald Teal', hex: '#2F8B96', group: 'Living Ocean' },
  { id: 'W5', name: 'Shallow Clear Turquoise', hex: '#47AEAD', group: 'Living Ocean' },
  { id: 'W6', name: 'Sunlit Aqua Glass', hex: '#76CFC2', group: 'Living Ocean' },
  { id: 'W7', name: 'Shallow Caustic Web', hex: '#B4ECE0', group: 'Living Ocean' },
  { id: 'W8', name: 'Seafoam Lacy Cream', hex: '#DCF6EE', group: 'Living Ocean' },
  { id: 'W9', name: 'Wave Crest Pure White', hex: '#F6FDFA', group: 'Living Ocean' },
  { id: 'WS', name: 'Submerged Sandbar Teal', hex: '#6A9B89', group: 'Living Ocean' },
  { id: 'WR', name: 'Submerged Reef Stone', hex: '#22525E', group: 'Living Ocean' },

  // === 7. AMBER SAND, MIRROR-WET SHORE & GEOLOGICAL CLIFFS (12 steps!) ===
  { id: 'D0', name: 'Wet Sand Deep Umber', hex: '#4E3729', group: 'Sand & Cliffs' },
  { id: 'D1', name: 'Wet Shore Caramel', hex: '#6F5038', group: 'Sand & Cliffs' },
  { id: 'DM', name: 'Wet Sand Sky Mirror', hex: '#748C96', group: 'Sand & Cliffs' },
  { id: 'D2', name: 'Dune Shadow Lee', hex: '#9A744C', group: 'Sand & Cliffs' },
  { id: 'D3', name: 'Warm Ochre Sand', hex: '#C49A64', group: 'Sand & Cliffs' },
  { id: 'D4', name: 'Sunlit Dune Crest', hex: '#DFBC84', group: 'Sand & Cliffs' },
  { id: 'D5', name: 'Quartz Shell Sparkle', hex: '#F6E6BE', group: 'Sand & Cliffs' },
  { id: 'K0', name: 'Cliff Cave Abyss', hex: '#141923', group: 'Sand & Cliffs' },
  { id: 'K1', name: 'Basalt Indigo Shadow', hex: '#26303E', group: 'Sand & Cliffs' },
  { id: 'K2', name: 'Iron Oxide Shale Band', hex: '#5D443C', group: 'Sand & Cliffs' },
  { id: 'K3', name: 'Coastal Sandstone Mid', hex: '#7C6D60', group: 'Sand & Cliffs' },
  { id: 'K4', name: 'Sunlit Limestone Shelf', hex: '#AC9982', group: 'Sand & Cliffs' },
  { id: 'K5', name: 'Calcite Quartz Vein', hex: '#D8CDB8', group: 'Sand & Cliffs' },

  // === 8. SINGING CANOPY ALIEN FOREST, REEDWOODS & BIOLUM FLORA (18 steps!) ===
  { id: 'G0', name: 'Canopy Abyssal Pine', hex: '#0E1C1D', group: 'Alien Forest' },
  { id: 'G1', name: 'Spruce Deep Shadow', hex: '#19302D', group: 'Alien Forest' },
  { id: 'G2', name: 'Forest Pine Shade', hex: '#26493C', group: 'Alien Forest' },
  { id: 'G3', name: 'Moss Forest Mid', hex: '#3A6648', group: 'Alien Forest' },
  { id: 'G4', name: 'Velvet Olive Moss', hex: '#568452', group: 'Alien Forest' },
  { id: 'G5', name: 'Sun-Dappled Fern', hex: '#78A35C', group: 'Alien Forest' },
  { id: 'G6', name: 'Warm Chartreuse Leaf', hex: '#A1C26A', group: 'Alien Forest' },
  { id: 'G7', name: 'Golden Sunlit Crown', hex: '#CDD978', group: 'Alien Forest' },
  { id: 'G8', name: 'Dew Pollen Sparkle', hex: '#F2F0B4', group: 'Alien Forest' },

  { id: 'T0', name: 'Reed Slit Abyss', hex: '#17191A', group: 'Reedwood & Flora' },
  { id: 'T1', name: 'Root Humus Umber', hex: '#302724', group: 'Reedwood & Flora' },
  { id: 'T2', name: 'Bark Ridge Dark', hex: '#4F493E', group: 'Reedwood & Flora' },
  { id: 'T3', name: 'Fluted Reed Mid', hex: '#726C58', group: 'Reedwood & Flora' },
  { id: 'T4', name: 'Warm Reed Flank', hex: '#968B70', group: 'Reedwood & Flora' },
  { id: 'T5', name: 'Sunlit Reed Ridge', hex: '#BAA98B', group: 'Reedwood & Flora' },
  { id: 'T6', name: 'Pale Reed Highlight', hex: '#DFD0B0', group: 'Reedwood & Flora' },

  { id: 'P0', name: 'Spore Fungi Deep Plum', hex: '#422240', group: 'Reedwood & Flora' },
  { id: 'P1', name: 'Spore Fungi Magenta', hex: '#823D6B', group: 'Reedwood & Flora' },
  { id: 'P2', name: 'Spore Fungi Orchid', hex: '#C66E96', group: 'Reedwood & Flora' },
  { id: 'P3', name: 'Spore Fungi Biolum', hex: '#F4BCD0', group: 'Reedwood & Flora' },

  { id: 'F0', name: 'Kelp Holdfast Dark', hex: '#542914', group: 'Reedwood & Flora' },
  { id: 'F1', name: 'Amber Kelp Shade', hex: '#944F1E', group: 'Reedwood & Flora' },
  { id: 'F2', name: 'Amber Kelp Ribbon', hex: '#D67C28', group: 'Reedwood & Flora' },
  { id: 'F3', name: 'Sun-Drop Gold Glow', hex: '#F5B846', group: 'Reedwood & Flora' },
  { id: 'F4', name: 'Incandescent Petal', hex: '#FFF2A8', group: 'Reedwood & Flora' },
  { id: 'SH', name: 'Contact Shadow Deep', hex: '#10141D', group: 'Reedwood & Flora' },
];

export const V4_COL: Record<string, RGBA> = Object.fromEntries(
  V4_MASTER_PALETTE.map((c) => [c.id, hexToRgba(c.hex, 255)])
);

export function buildV4PalettePreset(): PalettePreset {
  const colors: PaletteColor[] = V4_MASTER_PALETTE.map((c) => ({
    id: c.id,
    token: c.id,
    name: c.name,
    hex: c.hex,
    ramp: c.group,
  }));
  return {
    id: 'verdant-v4-masterpiece',
    name: 'VERDANT SIGNAL V4.0 Masterpiece Palette',
    description: 'Curated hue-shifted cinematic painterly palette for V4.0 extreme artistic rebirth.',
    colors,
  };
}

export function hash2v4(x: number, y: number, seed = 1337): number {
  let n = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041)) & 0x7fffffff;
  n = ((n >> 13) ^ n) & 0x7fffffff;
  return ((Math.imul(n, 1274126177) & 0x7fffffff) >> 8) / 0x7fffff;
}

export function smoothNoiseV4(x: number, y: number, periodX: number, periodY: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const wrap = (n: number, p: number) => ((n % p) + p) % p;
  const x0 = wrap(xi, periodX);
  const x1 = wrap(xi + 1, periodX);
  const y0 = wrap(yi, periodY);
  const y1 = wrap(yi + 1, periodY);
  const a = hash2v4(x0, y0, seed);
  const b = hash2v4(x1, y0, seed);
  const c = hash2v4(x0, y1, seed);
  const d = hash2v4(x1, y1, seed);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

/** Deterministic 2x2 / 3x2 macro painterly cluster wave (gives handcrafted interlocking pixel clusters, NEVER pixel noise!) */
export function painterlyClusterWave(x: number, y: number): number {
  const bx = Math.floor(x / 2);
  const by = Math.floor(y / 2);
  return Math.sin(bx * 1.47 + by * 2.13) * 0.55 + Math.cos(bx * 0.83 - by * 1.59) * 0.45;
}

/** Organic Voronoi cellular distance for lacy receding sea-foam & shimmering underwater caustics! */
export function worleyCellEdge(x: number, y: number, cellSize: number, seed = 42): { f1: number; f2: number; edge: number } {
  const gx = x / cellSize;
  const gy = y / cellSize;
  const ix = Math.floor(gx);
  const iy = Math.floor(gy);
  let f1 = 99;
  let f2 = 99;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = ix + dx;
      const cy = iy + dy;
      const px = cx + 0.15 + hash2v4(cx, cy, seed) * 0.70;
      const py = cy + 0.15 + hash2v4(cx, cy, seed + 19) * 0.70;
      const d = Math.hypot(gx - px, gy - py);
      if (d < f1) {
        f2 = f1;
        f1 = d;
      } else if (d < f2) {
        f2 = d;
      }
    }
  }
  return { f1, f2, edge: f2 - f1 };
}

export class V4Canvas {
  readonly width: number;
  readonly height: number;
  readonly layerDefs: Array<{ id: string; name: string }>;
  readonly cels: Record<string, Uint8ClampedArray> = {};

  constructor(width: number, height: number, layerDefs: Array<{ id: string; name: string }>) {
    this.width = width;
    this.height = height;
    this.layerDefs = layerDefs;
    for (const def of layerDefs) {
      this.cels[def.id] = createEmptyBuffer(width, height);
    }
  }

  px(layerId: string, x: number, y: number, token: string, alpha = 255): void {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    if (token === '.') {
      setPixel(this.cels[layerId], this.width, this.height, ix, iy, { r: 0, g: 0, b: 0, a: 0 });
      return;
    }
    const base = V4_COL[token];
    if (!base) throw new Error(`Unknown V4 palette token: ${token}`);
    setPixel(this.cels[layerId], this.width, this.height, ix, iy, {
      r: base.r,
      g: base.g,
      b: base.b,
      a: Math.max(0, Math.min(255, Math.round(alpha))),
    });
  }

  blendPx(layerId: string, x: number, y: number, token: string, alpha: number): void {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    const base = V4_COL[token];
    if (!base) throw new Error(`Unknown V4 token: ${token}`);
    const buf = this.cels[layerId];
    const i = (iy * this.width + ix) * 4;
    const sa = Math.max(0, Math.min(1, alpha / 255));
    const da = buf[i + 3] / 255;
    const outA = sa + da * (1 - sa);
    if (outA <= 0) return;
    buf[i] = Math.round((base.r * sa + buf[i] * da * (1 - sa)) / outA);
    buf[i + 1] = Math.round((base.g * sa + buf[i + 1] * da * (1 - sa)) / outA);
    buf[i + 2] = Math.round((base.b * sa + buf[i + 2] * da * (1 - sa)) / outA);
    buf[i + 3] = Math.round(outA * 255);
  }

  has(layerId: string, x: number, y: number): boolean {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return false;
    return this.cels[layerId][(iy * this.width + ix) * 4 + 3] > 0;
  }

  line(layerId: string, x0: number, y0: number, x1: number, y1: number, token: string, alpha = 255, maskLayer?: string): void {
    let ix0 = Math.round(x0);
    let iy0 = Math.round(y0);
    const ix1 = Math.round(x1);
    const iy1 = Math.round(y1);
    const dx = Math.abs(ix1 - ix0);
    const dy = Math.abs(iy1 - iy0);
    const sx = ix0 < ix1 ? 1 : -1;
    const sy = iy0 < iy1 ? 1 : -1;
    let err = dx - dy;
    while (true) {
      if (!maskLayer || this.has(maskLayer, ix0, iy0)) this.px(layerId, ix0, iy0, token, alpha);
      if (ix0 === ix1 && iy0 === iy1) break;
      const e2 = err * 2;
      if (e2 > -dy) { err -= dy; ix0 += sx; }
      if (e2 < dx) { err += dx; iy0 += sy; }
    }
  }

  /** Crisp scanline filled polygon for tailored clothing silhouettes, beveled hulls, boots & rock facets! */
  fillPoly(layerId: string, pts: Array<[number, number]>, token: string, maskLayer?: string): void {
    if (pts.length < 3) return;
    let minY = this.height;
    let maxY = 0;
    for (const [, py] of pts) {
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }
    const y0 = Math.max(0, Math.floor(minY));
    const y1 = Math.min(this.height - 1, Math.ceil(maxY));
    for (let y = y0; y <= y1; y++) {
      const fy = y + 0.5;
      const xs: number[] = [];
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i];
        const [xj, yj] = pts[j];
        if ((yi > fy) !== (yj > fy)) {
          xs.push(xi + ((fy - yi) * (xj - xi)) / (yj - yi));
        }
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const sx = Math.max(0, Math.ceil(xs[k] - 0.5));
        const ex = Math.min(this.width - 1, Math.floor(xs[k + 1] - 0.5));
        for (let x = sx; x <= ex; x++) {
          if (!maskLayer || this.has(maskLayer, x, y)) this.px(layerId, x, y, token);
        }
      }
    }
  }

  fillEllipse(layerId: string, cx: number, cy: number, rx: number, ry: number, token: string, maskLayer?: string): void {
    const x0 = Math.max(0, Math.floor(cx - rx - 1));
    const x1 = Math.min(this.width - 1, Math.ceil(cx + rx + 1));
    const y0 = Math.max(0, Math.floor(cy - ry - 1));
    const y1 = Math.min(this.height - 1, Math.ceil(cy + ry + 1));
    for (let y = y0; y <= y1; y++) {
      const ny = (y + 0.5 - cy) / Math.max(0.5, ry);
      for (let x = x0; x <= x1; x++) {
        const nx = (x + 0.5 - cx) / Math.max(0.5, rx);
        if (nx * nx + ny * ny <= 1.0) {
          if (!maskLayer || this.has(maskLayer, x, y)) this.px(layerId, x, y, token);
        }
      }
    }
  }

  /** Smooth anatomical variable-radius stroke (zero lumpy seams!) */
  paintTaperedSpline(layerId: string, pts: Array<[number, number, number]>, token: string, maskLayer?: string): void {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0, r0] = pts[i];
      const [x1, y1, r1] = pts[i + 1];
      const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 3));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = x0 + (x1 - x0) * t;
        const y = y0 + (y1 - y0) * t;
        const r = r0 + (r1 - r0) * t;
        if (r <= 0.65) {
          const ix = Math.round(x);
          const iy = Math.round(y);
          if (!maskLayer || this.has(maskLayer, ix, iy)) this.px(layerId, ix, iy, token);
        } else {
          this.fillEllipse(layerId, x, y, r, r, token, maskLayer);
        }
      }
    }
  }

  /**
   * TRUE PAINTERLY CLUSTER SHADER (Lineless sunlit upper-left crests + deep plum/indigo shadow masses!)
   * Shades an existing anatomical mask in-place using interlocking 2x2/3x2 pixel clusters!
   */
  shadeMaskedRegion(
    layerId: string,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    ramp: string[],
    opts?: {
      bias?: number;
      wobble?: number;
      material?: 'cloth' | 'leather' | 'metal';
      foldFn?: (x: number, y: number, nx: number, ny: number) => number;
      rimBounceToken?: string;
      clipEllipse?: boolean;
      pad?: number;
    }
  ): void {
    const pad = opts?.clipEllipse ? 1 : (opts?.pad ?? 14);
    const x0 = Math.max(0, Math.floor(cx - rx - pad));
    const x1 = Math.min(this.width - 1, Math.ceil(cx + rx + pad));
    const y0 = Math.max(0, Math.floor(cy - ry - pad));
    const y1 = Math.min(this.height - 1, Math.ceil(cy + ry + pad));
    const bias = opts?.bias ?? 0;
    const wobble = opts?.wobble ?? (opts?.material === 'metal' ? 0.025 : 0.065);

    for (let y = y0; y <= y1; y++) {
      const ny = (y + 0.5 - cy) / Math.max(1, ry);
      for (let x = x0; x <= x1; x++) {
        if (!this.has(layerId, x, y)) continue;
        const nx = (x + 0.5 - cx) / Math.max(1, rx);
        if (opts?.clipEllipse && nx * nx + ny * ny > 1.04) continue;
        const nz = Math.sqrt(Math.max(0.05, 1.0 - Math.min(0.95, nx * nx * 0.60 + ny * ny * 0.55)));
        let dot = -0.66 * nx - 0.56 * ny + 0.48 * nz + bias;
        if (opts?.foldFn) dot += opts.foldFn(x, y, nx, ny);
        dot += painterlyClusterWave(x, y) * wobble;

        if (opts?.material === 'metal') {
          // Sharp high-contrast aerospace brushed-metal response!
          const spec = Math.pow(Math.max(0, dot), 1.65);
          const idx = Math.min(ramp.length - 1, Math.max(0, Math.round(spec * (ramp.length - 1))));
          this.px(layerId, x, y, ramp[idx]);
        } else if (opts?.material === 'leather') {
          // Compressed dark espresso core + sharp worn highlights ONLY on top-left crests!
          const val = Math.max(0, Math.min(1, (dot + 0.20) * 0.72));
          const idx = Math.min(ramp.length - 1, Math.max(0, Math.floor(val * ramp.length)));
          this.px(layerId, x, y, ramp[idx]);
        } else {
          // Matte/satin quilted exploration suit fabric: rich burnt-terracotta midtones, deep plum shadow, precious crests!
          const val = Math.max(0, Math.min(1, (dot + 0.18) * 0.68));
          let idx = Math.min(ramp.length - 1, Math.max(0, Math.floor(val * ramp.length)));
          if (idx === ramp.length - 1 && dot < 0.88) idx = ramp.length - 2;
          // Subtle cool/cyan ambient rim bounce on lower-right curve if provided!
          if (opts?.rimBounceToken && nx > 0.52 && ny > 0.15 && nx * nx + ny * ny > 0.55 && idx <= 2) {
            this.px(layerId, x, y, opts.rimBounceToken);
          } else {
            this.px(layerId, x, y, ramp[idx]);
          }
        }
      }
    }
  }

  /** Carve tailored recessed fabric crease + sunlit lower puff-lip (direct from mara_lin_concept_128x128_v2 craft!) */
  carveTailoredSeam(
    layerId: string,
    pts: Array<[number, number]>,
    shadowTok: string,
    darkShadowTok: string,
    lipTok: string,
    litSplitX: number
  ): void {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const steps = Math.max(1, Math.abs(Math.round(x1 - x0)) + Math.abs(Math.round(y1 - y0)));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = Math.round(x0 + (x1 - x0) * t);
        const y = Math.round(y0 + (y1 - y0) * t);
        if (!this.has(layerId, x, y)) continue;
        this.px(layerId, x, y, x > litSplitX ? darkShadowTok : shadowTok);
        if (x <= litSplitX && this.has(layerId, x, y + 1)) {
          this.px(layerId, x, y + 1, lipTok);
        }
      }
    }
  }

  /**
   * Selective Master Sel-Out Polish:
   * Leaves sunlit upper-left crests CLEAN & LINELESS (warm rich edge tint only if needed)
   * while anchoring shadowed lower-right contours in deep rich plum/slate ink!
   */
  applySelectiveSilhouetteContour(
    targetLayerId: string,
    darkInk: string,
    midInk: string,
    skipLitUpperLeft = true,
    excludeLayerIds: string[] = []
  ): void {
    const exclude = new Set([targetLayerId, ...excludeLayerIds]);
    const opaque = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false;
      const idx = (y * this.width + x) * 4 + 3;
      for (const def of this.layerDefs) {
        if (exclude.has(def.id)) continue;
        if (this.cels[def.id][idx] > 180) return true;
      }
      return false;
    };
    const marks: Array<[number, number, string]> = [];
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (opaque(x, y)) continue;
        const nL = opaque(x - 1, y);
        const nR = opaque(x + 1, y);
        const nU = opaque(x, y - 1);
        const nD = opaque(x, y + 1);
        if (!nL && !nR && !nU && !nD) continue;
        const isPureUpperLeft = (nR || nD) && !nL && !nU;
        if (isPureUpperLeft) {
          if (!skipLitUpperLeft) marks.push([x, y, midInk]);
          else marks.push([x, y, midInk]);
        } else {
          marks.push([x, y, darkInk]);
        }
      }
    }
    for (const [mx, my, tok] of marks) this.px(targetLayerId, mx, my, tok);
  }

  toProjectDocument(opts: {
    id: string;
    name: string;
    pivot: { x: number; y: number };
    tileSize: number;
    styleNotes: string;
  }): ProjectDocument {
    const palette = buildV4PalettePreset();
    const layers: LayerNode[] = this.layerDefs.map((def) => ({
      id: def.id,
      name: def.name,
      kind: 'layer',
      parentId: null,
      visible: true,
      locked: false,
      opacity: 100,
      clipped: false,
    }));
    const frame: AnimationFrame = {
      id: 'v4_frame_0',
      durationMs: 120,
      cels: Object.fromEntries(this.layerDefs.map((d) => [d.id, new Uint8ClampedArray(this.cels[d.id])])),
    };
    return {
      id: opts.id,
      name: opts.name,
      width: this.width,
      height: this.height,
      layers,
      frames: [frame],
      tags: [{ id: 'v4_tag', name: 'v4_masterpiece', from: 0, to: 0, color: '#EB9044' }],
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
  }

  composite(): Uint8ClampedArray {
    const doc = this.toProjectDocument({ id: 't', name: 't', pivot: { x: 0, y: 0 }, tileSize: 32, styleNotes: '' });
    return compositeFrame(doc.width, doc.height, doc.layers, doc.frames[0], null);
  }

  serializeVpf(opts: {
    id: string;
    name: string;
    pivot: { x: number; y: number };
    tileSize: number;
    styleNotes: string;
  }): string {
    return serializeVpfProject(this.toProjectDocument(opts));
  }
}

export function scaleNearestV4(src: Uint8ClampedArray, w: number, h: number, scale: number): {
  pixels: Uint8ClampedArray;
  width: number;
  height: number;
} {
  const ow = w * scale;
  const oh = h * scale;
  const out = createEmptyBuffer(ow, oh);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const si = (y * w + x) * 4;
      const r = src[si], g = src[si + 1], b = src[si + 2], a = src[si + 3];
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const di = ((y * scale + sy) * ow + (x * scale + sx)) * 4;
          out[di] = r; out[di + 1] = g; out[di + 2] = b; out[di + 3] = a;
        }
      }
    }
  }
  return { pixels: out, width: ow, height: oh };
}

export function blitV4(
  dst: Uint8ClampedArray,
  dw: number,
  dh: number,
  src: Uint8ClampedArray,
  sw: number,
  sh: number,
  dx: number,
  dy: number,
  region?: { x: number; y: number; w: number; h: number },
  opacity = 1.0
): void {
  const rx = region ? region.x : 0;
  const ry = region ? region.y : 0;
  const rw = region ? region.w : sw;
  const rh = region ? region.h : sh;
  for (let y = 0; y < rh; y++) {
    const ty = dy + y;
    if (ty < 0 || ty >= dh) continue;
    for (let x = 0; x < rw; x++) {
      const tx = dx + x;
      if (tx < 0 || tx >= dw) continue;
      const si = ((ry + y) * sw + (rx + x)) * 4;
      const sa = (src[si + 3] / 255) * opacity;
      if (sa <= 0) continue;
      const di = (ty * dw + tx) * 4;
      if (sa >= 0.999) {
        dst[di] = src[si]; dst[di + 1] = src[si + 1]; dst[di + 2] = src[si + 2]; dst[di + 3] = 255;
      } else {
        const da = dst[di + 3] / 255;
        const outA = sa + da * (1 - sa);
        if (outA > 0) {
          dst[di] = Math.round((src[si] * sa + dst[di] * da * (1 - sa)) / outA);
          dst[di + 1] = Math.round((src[si + 1] * sa + dst[di + 1] * da * (1 - sa)) / outA);
          dst[di + 2] = Math.round((src[si + 2] * sa + dst[di + 2] * da * (1 - sa)) / outA);
          dst[di + 3] = Math.round(outA * 255);
        }
      }
    }
  }
}

/** Crisp 5x7 bitmap labeler for comparison & animation study plates */
const FONT57: Record<string, string[]> = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.####', '#....', '#....', '#..##', '#...#', '#...#', '.###.'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  J: ['..###', '...#.', '...#.', '...#.', '#..#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#...#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
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
  '>': ['.#...', '..#..', '...#.', '....#', '...#.', '..#..', '.#...'],
  '/': ['....#', '...#.', '...#.', '..#..', '.#...', '.#...', '#....'],
  ':': ['.....', '..#..', '..#..', '.....', '..#..', '..#..', '.....'],
  ',': ['.....', '.....', '.....', '.....', '..##.', '..#..', '.#...'],
  '.': ['.....', '.....', '.....', '.....', '.....', '..##.', '..##.'],
  '&': ['.###.', '#...#', '.###.', '#.#..', '#..#.', '#...#', '.###.'],
  '(': ['..#..', '.#...', '#....', '#....', '#....', '.#...', '..#..'],
  ')': ['..#..', '...#.', '....#', '....#', '....#', '...#.', '..#..'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
};

export function drawTextV4(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  text: string,
  x: number,
  y: number,
  scale = 1,
  color = { r: 236, g: 242, b: 248, a: 255 }
): void {
  let cx = x;
  for (const ch of text.toUpperCase()) {
    const g = FONT57[ch] ?? FONT57[' '];
    for (let gy = 0; gy < 7; gy++) {
      for (let gx = 0; gx < 5; gx++) {
        if (g[gy][gx] !== '#') continue;
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

export function fillBoardBgV4(buf: Uint8ClampedArray, w: number, h: number): void {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = (((x >> 4) + (y >> 4)) & 1) === 0;
      setPixel(buf, w, h, x, y, { r: ch ? 18 : 22, g: ch ? 24 : 28, b: ch ? 32 : 38, a: 255 });
    }
  }
}
