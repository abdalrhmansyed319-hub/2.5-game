/**
 * VERDANT SIGNAL — High-Resolution Painterly Pixel Art Engine (Study Core)
 * ========================================================================
 * Dedicated studio-grade painterly pixel sculpting foundation for the
 * High-Resolution Art Upgrade Study (32x48 / 48x64 / 64x80 / 64x96 characters
 * and 24x24 / 32x32 environments).
 *
 * Key craft upgrades over low-res baseline:
 *   - Curated 48-color hue-shifted character + world master palette (7-8 tone ramps)
 *   - Organic bezier-swept anatomical limb/hose sculpting (zero blocky rectangles!)
 *   - Volumetric 3D surface lighting with upper-left (~40 deg) warm key + cool fill + rim bounce
 *   - Curved multi-layer glass visor shader (horizon reflection + sky curve + crisp specular arc)
 *   - Automatic selective-outline (sel-out) pass: dark cool crevices on shadowed edges, warm
 *     rich edge-tints on sunlit edges — ZERO harsh uniform black outlines, ZERO anti-alias blur!
 */

import type { AnimationFrame, LayerNode, PaletteColor, PalettePreset, ProjectDocument, RGBA } from '../types/studio';
import { compositeFrame, createEmptyBuffer, hexToRgba, setPixel } from '../engine/pixelBuffer';
import { DEFAULT_PALETTES } from '../engine/paletteEngine';
import { serializeVpfProject } from '../engine/exportEngine';

export interface HRColorDef {
  id: string;
  name: string;
  hex: string;
  group: string;
}

export const HIGHRES_PALETTE_DEFS: HRColorDef[] = [
  // --- RAMP A: Survival Suit Terracotta-Orange (8 rich hue-shifted steps!) ---
  { id: 'S0', name: 'Suit Crevice Plum', hex: '#1D111C', group: 'Suit Orange' },
  { id: 'S1', name: 'Suit Deep Mahogany', hex: '#3F1B22', group: 'Suit Orange' },
  { id: 'S2', name: 'Suit Burnt Sienna', hex: '#6E2C24', group: 'Suit Orange' },
  { id: 'S3', name: 'Suit Rust Shadow', hex: '#A1422A', group: 'Suit Orange' },
  { id: 'S4', name: 'Suit Terracotta Mid', hex: '#CC5F32', group: 'Suit Orange' },
  { id: 'S5', name: 'Suit Sunlit Amber', hex: '#E38A48', group: 'Suit Orange' },
  { id: 'S6', name: 'Suit Apricot Fold', hex: '#F2B66A', group: 'Suit Orange' },
  { id: 'S7', name: 'Suit Warm Rim Highlight', hex: '#FCE0A2', group: 'Suit Orange' },

  // --- RAMP B: Leather Harness, Pouches, Gloves & Treaded Boots (7 steps) ---
  { id: 'B0', name: 'Leather Plum Ink', hex: '#14101A', group: 'Leather & Boots' },
  { id: 'B1', name: 'Leather Deep Espresso', hex: '#281B22', group: 'Leather & Boots' },
  { id: 'B2', name: 'Leather Dark Umber', hex: '#452E2D', group: 'Leather & Boots' },
  { id: 'B3', name: 'Leather Saddle Mid', hex: '#69463B', group: 'Leather & Boots' },
  { id: 'B4', name: 'Leather Worn Strap', hex: '#8F644F', group: 'Leather & Boots' },
  { id: 'B5', name: 'Leather Scuffed Edge', hex: '#B58B6D', group: 'Leather & Boots' },
  { id: 'B6', name: 'Leather Bleached Rim', hex: '#D6B494', group: 'Leather & Boots' },

  // --- RAMP C: Brushed Aerospace Titanium & Ceramic Trim (7 steps) ---
  { id: 'M0', name: 'Titanium Deep Recess', hex: '#181E2A', group: 'Brushed Metal' },
  { id: 'M1', name: 'Titanium Gunmetal', hex: '#313B4A', group: 'Brushed Metal' },
  { id: 'M2', name: 'Titanium Shaded Steel', hex: '#505D6B', group: 'Brushed Metal' },
  { id: 'M3', name: 'Titanium Mid Alloy', hex: '#79868E', group: 'Brushed Metal' },
  { id: 'M4', name: 'Titanium Lit Bevel', hex: '#A6B0AD', group: 'Brushed Metal' },
  { id: 'M5', name: 'Titanium Sunlit Brushed', hex: '#D4D3BE', group: 'Brushed Metal' },
  { id: 'M6', name: 'Titanium Ivory Specular', hex: '#F5F2DA', group: 'Brushed Metal' },

  // --- RAMP D: Curved Panoramic Glass Visor & Acoustic Lens Optics (7 steps) ---
  { id: 'V0', name: 'Visor Abyssal Core', hex: '#0D1822', group: 'Visor & Lens' },
  { id: 'V1', name: 'Visor Deep Marine', hex: '#172E3B', group: 'Visor & Lens' },
  { id: 'V2', name: 'Visor Curved Teal', hex: '#264C5A', group: 'Visor & Lens' },
  { id: 'V3', name: 'Visor Horizon Mid', hex: '#3F7682', group: 'Visor & Lens' },
  { id: 'V4', name: 'Visor Sky Curve', hex: '#6AA4A6', group: 'Visor & Lens' },
  { id: 'V5', name: 'Visor Mint Reflection', hex: '#A3D4C8', group: 'Visor & Lens' },
  { id: 'V6', name: 'Visor Incandescent Glint', hex: '#E6F7E8', group: 'Visor & Lens' },

  // --- RAMP E: Botanical Specimen Vial, Telemetry LEDs & Accents (6 steps) ---
  { id: 'O0', name: 'Flora Shadow Deep', hex: '#192D24', group: 'Organic & Signal' },
  { id: 'O1', name: 'Flora Specimen Mid', hex: '#446B40', group: 'Organic & Signal' },
  { id: 'O2', name: 'Flora Luminous Moss', hex: '#7EB055', group: 'Organic & Signal' },
  { id: 'O3', name: 'Flora Biolum Core', hex: '#C4DF76', group: 'Organic & Signal' },
  { id: 'R0', name: 'Ruby Valve Dark', hex: '#6E2028', group: 'Organic & Signal' },
  { id: 'R1', name: 'Ruby Telemetry LED', hex: '#D94A44', group: 'Organic & Signal' },

  // --- RAMP F: Rimlands High-Res Environment (Water, Sand, Cliffs, Moss, Trees) ---
  { id: 'W0', name: 'Ocean Abyssal', hex: '#163547', group: 'Coastal Water' },
  { id: 'W1', name: 'Ocean Deep Swell', hex: '#1F4A5F', group: 'Coastal Water' },
  { id: 'W2', name: 'Shallow Reef Shadow', hex: '#2D6878', group: 'Coastal Water' },
  { id: 'W3', name: 'Turquoise Shallows', hex: '#428A94', group: 'Coastal Water' },
  { id: 'W4', name: 'Sunlit Surf Reflection', hex: '#6CB2B4', group: 'Coastal Water' },
  { id: 'W5', name: 'Seafoam Lace', hex: '#A8D8D2', group: 'Coastal Water' },
  { id: 'W6', name: 'Foam Crest Sparkle', hex: '#E6F4EE', group: 'Coastal Water' },

  { id: 'D0', name: 'Wet Sand Capillary', hex: '#5B4535', group: 'Amber Sand' },
  { id: 'D1', name: 'Damp Shore Sand', hex: '#7F6248', group: 'Amber Sand' },
  { id: 'D2', name: 'Warm Sand Lee', hex: '#A4835A', group: 'Amber Sand' },
  { id: 'D3', name: 'Ochre Sand Base', hex: '#C2A070', group: 'Amber Sand' },
  { id: 'D4', name: 'Sunlit Dune Crest', hex: '#D8BA88', group: 'Amber Sand' },
  { id: 'D5', name: 'Quartz Shell Glint', hex: '#EFE0B8', group: 'Amber Sand' },

  { id: 'K0', name: 'Cliff Crevice Ink', hex: '#1B222A', group: 'Coastal Cliff' },
  { id: 'K1', name: 'Basalt Deep Shade', hex: '#313C46', group: 'Coastal Cliff' },
  { id: 'K2', name: 'Weathered Rock Dark', hex: '#4E5B64', group: 'Coastal Cliff' },
  { id: 'K3', name: 'Sandstone Slate Mid', hex: '#717E82', group: 'Coastal Cliff' },
  { id: 'K4', name: 'Sunlit Cliff Face', hex: '#98A4A0', group: 'Coastal Cliff' },
  { id: 'K5', name: 'Mineral Vein Highlight', hex: '#C2C9BC', group: 'Coastal Cliff' },
  { id: 'K6', name: 'Quartz Rim Specular', hex: '#E3E5D6', group: 'Coastal Cliff' },

  { id: 'G0', name: 'Canopy Deep Undercut', hex: '#182824', group: 'Singing Canopy' },
  { id: 'G1', name: 'Spruce Shade', hex: '#253D32', group: 'Singing Canopy' },
  { id: 'G2', name: 'Forest Moss Dark', hex: '#375842', group: 'Singing Canopy' },
  { id: 'G3', name: 'Olive Turf Shadow', hex: '#4E724E', group: 'Singing Canopy' },
  { id: 'G4', name: 'Meadow Moss Base', hex: '#68895C', group: 'Singing Canopy' },
  { id: 'G5', name: 'Sun-Dappled Grass', hex: '#86A468', group: 'Singing Canopy' },
  { id: 'G6', name: 'Sunlit Leaf Cluster', hex: '#A9C076', group: 'Singing Canopy' },
  { id: 'G7', name: 'Golden Meadow Blade', hex: '#CFCB7E', group: 'Singing Canopy' },
  { id: 'G8', name: 'Dewlit Tip Sparkle', hex: '#ECE9B2', group: 'Singing Canopy' },

  { id: 'T0', name: 'Reed Slit Abyss', hex: '#1B1F20', group: 'Reedwood Bark' },
  { id: 'T1', name: 'Root Umber Shadow', hex: '#332C28', group: 'Reedwood Bark' },
  { id: 'T2', name: 'Bark Ridge Dark', hex: '#4E4B40', group: 'Reedwood Bark' },
  { id: 'T3', name: 'Fluted Reed Mid', hex: '#6F6D59', group: 'Reedwood Bark' },
  { id: 'T4', name: 'Warm Reed Flank', hex: '#918970', group: 'Reedwood Bark' },
  { id: 'T5', name: 'Sunlit Bark Ridge', hex: '#B4A789', group: 'Reedwood Bark' },
  { id: 'T6', name: 'Dry Reed Highlight', hex: '#D8CAAB', group: 'Reedwood Bark' },

  { id: 'F0', name: 'Kelp Holdfast', hex: '#522C18', group: 'Rimlands Flora' },
  { id: 'F1', name: 'Amber Kelp Shade', hex: '#8B4F20', group: 'Rimlands Flora' },
  { id: 'F2', name: 'Amber Kelp Ribbon', hex: '#C8782A', group: 'Rimlands Flora' },
  { id: 'F3', name: 'Golden Kelp Glow', hex: '#EEAA42', group: 'Rimlands Flora' },
  { id: 'F4', name: 'Honey Bladder Bright', hex: '#FFD874', group: 'Rimlands Flora' },
  { id: 'F5', name: 'Incandescent Core', hex: '#FFF7C8', group: 'Rimlands Flora' },

  { id: 'C0', name: 'Crystal Sea Deep', hex: '#17444E', group: 'Glasswort & Glow' },
  { id: 'C1', name: 'Crystal Teal Mid', hex: '#388B8E', group: 'Glasswort & Glow' },
  { id: 'C2', name: 'Crystal Mint Facet', hex: '#7CD0C6', group: 'Glasswort & Glow' },
  { id: 'C3', name: 'Crystal Prism Spark', hex: '#E4FFF6', group: 'Glasswort & Glow' },
  { id: 'L0', name: 'Harmonic Halo Deep', hex: '#227F7A', group: 'Glasswort & Glow' },
  { id: 'L1', name: 'Harmonic Wave Cyan', hex: '#58DABF', group: 'Glasswort & Glow' },
  { id: 'L2', name: 'Harmonic Node Bright', hex: '#A2F7E2', group: 'Glasswort & Glow' },
  { id: 'L3', name: 'Harmonic Spark White', hex: '#ECFFFA', group: 'Glasswort & Glow' },
  { id: 'SH', name: 'Contact Shadow Slate', hex: '#12161E', group: 'Glasswort & Glow' },
];

export const HR_COL: Record<string, RGBA> = Object.fromEntries(
  HIGHRES_PALETTE_DEFS.map((c) => [c.id, hexToRgba(c.hex, 255)])
);

export function buildHighResPalettePreset(): PalettePreset {
  const colors: PaletteColor[] = HIGHRES_PALETTE_DEFS.map((c) => ({
    id: c.id,
    token: c.id,
    name: c.name,
    hex: c.hex,
    ramp: c.group,
  }));
  return {
    id: 'verdant-highres-master',
    name: 'VERDANT SIGNAL High-Res Master Palette',
    description: 'Expanded 7-8 step hue-shifted painterly ramps for high-resolution characters and worlds.',
    colors,
  };
}

export function hash2(x: number, y: number, seed = 1337): number {
  let n = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041)) & 0x7fffffff;
  n = ((n >> 13) ^ n) & 0x7fffffff;
  return ((Math.imul(n, 1274126177) & 0x7fffffff) >> 8) / 0x7fffff;
}

export function smoothNoise(x: number, y: number, periodX: number, periodY: number, seed: number): number {
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
  const a = hash2(x0, y0, seed);
  const b = hash2(x1, y0, seed);
  const c = hash2(x0, y1, seed);
  const d = hash2(x1, y1, seed);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

export function fbmPeriodic(x: number, y: number, size: number, seed: number): number {
  const n1 = smoothNoise((x / size) * 2, (y / size) * 2, 2, 2, seed);
  const n2 = smoothNoise((x / size) * 4, (y / size) * 4, 4, 4, seed + 31);
  const n3 = smoothNoise((x / size) * 8, (y / size) * 8, 8, 8, seed + 67);
  return n1 * 0.52 + n2 * 0.32 + n3 * 0.16;
}

export interface ClipRect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export class HighResCanvas {
  readonly width: number;
  readonly height: number;
  readonly layerOrder: Array<{ id: string; name: string }>;
  readonly cels: Record<string, Uint8ClampedArray> = {};

  constructor(width: number, height: number, layerDefs: Array<{ id: string; name: string }>) {
    this.width = width;
    this.height = height;
    this.layerOrder = layerDefs;
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
    const base = HR_COL[token];
    if (!base) throw new Error(`Unknown high-res token: ${token}`);
    setPixel(this.cels[layerId], this.width, this.height, ix, iy, {
      r: base.r,
      g: base.g,
      b: base.b,
      a: Math.max(0, Math.min(255, Math.round(alpha))),
    });
  }

  isFilled(layerId: string, x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false;
    return this.cels[layerId][(y * this.width + x) * 4 + 3] > 0;
  }

  line(layerId: string, x0: number, y0: number, x1: number, y1: number, token: string, alpha = 255): void {
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
      this.px(layerId, ix0, iy0, token, alpha);
      if (ix0 === ix1 && iy0 === iy1) break;
      const e2 = err * 2;
      if (e2 > -dy) { err -= dy; ix0 += sx; }
      if (e2 < dx) { err += dx; iy0 += sy; }
    }
  }

  /** Sculpt a smoothly shaded organic ellipsoid volume with locked upper-left key light + rim bounce + crisp sel-out! */
  sculptVolume(
    layerId: string,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    ramp: string[],
    opts?: {
      tiltDeg?: number;
      lightBias?: number;
      seamBands?: number;
      rimToken?: string;
      outlineLight?: string;
      outlineDark?: string;
      clip?: ClipRect;
    }
  ): void {
    const tilt = ((opts?.tiltDeg ?? 0) * Math.PI) / 180;
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);
    const lBias = opts?.lightBias ?? 0;
    const pad = Math.ceil(Math.max(rx, ry)) + 2;
    const xMin = Math.max(opts?.clip?.x0 ?? 0, Math.floor(cx - pad));
    const xMax = Math.min(opts?.clip?.x1 ?? this.width - 1, Math.ceil(cx + pad));
    const yMin = Math.max(opts?.clip?.y0 ?? 0, Math.floor(cy - pad));
    const yMax = Math.min(opts?.clip?.y1 ?? this.height - 1, Math.ceil(cy + pad));

    for (let y = yMin; y <= yMax; y++) {
      for (let x = xMin; x <= xMax; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const u = (dx * cosT + dy * sinT) / Math.max(0.5, rx);
        const v = (-dx * sinT + dy * cosT) / Math.max(0.5, ry);
        const r2 = u * u + v * v;
        if (r2 > 1.0) continue;

        const z = Math.sqrt(Math.max(0, 1 - r2));
        // 3D normal (nx, ny, nz) under locked upper-left (~40 deg) key light (-0.58, -0.62, 0.52)
        const nx = u * cosT - v * sinT;
        const ny = u * sinT + v * cosT;
        const keyDot = nx * -0.58 + ny * -0.62 + z * 0.52;
        const rimBounce = r2 > 0.72 && nx > 0.35 && ny > 0.15 ? 0.14 : 0;
        const seamCrease =
          opts?.seamBands && Math.abs(Math.sin(v * Math.PI * opts.seamBands)) < 0.12 ? -0.18 : 0;

        const isBorder = r2 > 0.80;
        if (isBorder && (opts?.outlineDark || opts?.outlineLight)) {
          const isLitEdge = keyDot > 0.24;
          const oTok = isLitEdge ? (opts.outlineLight ?? ramp[2]) : (opts.outlineDark ?? ramp[0]);
          this.px(layerId, x, y, oTok);
          continue;
        }

        const val = Math.max(0, Math.min(1, 0.44 + keyDot * 0.54 + lBias + rimBounce + seamCrease));
        const idx = Math.min(ramp.length - 1, Math.max(1, Math.round(val * (ramp.length - 1))));
        const tok = rimBounce > 0.1 && opts?.rimToken ? opts.rimToken : ramp[idx];
        this.px(layerId, x, y, tok);
      }
    }
  }

  /** Sculpt a curved organic limb, hose, or sleeve swept cleanly along a quadratic Bezier curve! */
  sculptBezierTube(
    layerId: string,
    p0: [number, number],
    p1: [number, number],
    p2: [number, number],
    rStart: number,
    rEnd: number,
    ramp: string[],
    opts?: {
      ribFreq?: number;
      lightBias?: number;
      outlineDark?: string;
      outlineLight?: string;
      clip?: ClipRect;
    }
  ): void {
    const steps = Math.max(24, Math.ceil((Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + Math.hypot(p2[0] - p1[0], p2[1] - p1[1])) * 2.5));
    // Collect sampled centerline points
    const pts: Array<{ x: number; y: number; r: number; t: number }> = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const mt = 1 - t;
      const x = mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0];
      const y = mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1];
      const r = rStart + (rEnd - rStart) * t;
      pts.push({ x, y, r, t });
    }

    const maxR = Math.max(rStart, rEnd) + 2;
    const minX = Math.max(opts?.clip?.x0 ?? 0, Math.floor(Math.min(p0[0], p1[0], p2[0]) - maxR));
    const maxX = Math.min(opts?.clip?.x1 ?? this.width - 1, Math.ceil(Math.max(p0[0], p1[0], p2[0]) + maxR));
    const minY = Math.max(opts?.clip?.y0 ?? 0, Math.floor(Math.min(p0[1], p1[1], p2[1]) - maxR));
    const maxY = Math.min(opts?.clip?.y1 ?? this.height - 1, Math.ceil(Math.max(p0[1], p1[1], p2[1]) + maxR));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        let bestNorm = 999;
        let bestDx = 0;
        let bestDy = 0;
        let bestT = 0;
        for (let i = 0; i < pts.length; i++) {
          const pt = pts[i];
          const dx = x - pt.x;
          const dy = y - pt.y;
          const norm = Math.hypot(dx, dy) / Math.max(0.6, pt.r);
          if (norm < bestNorm) {
            bestNorm = norm;
            bestDx = dx / Math.max(0.6, pt.r);
            bestDy = dy / Math.max(0.6, pt.r);
            bestT = pt.t;
          }
        }
        if (bestNorm > 1.0) continue;

        const z = Math.sqrt(Math.max(0, 1 - bestNorm * bestNorm));
        const keyDot = bestDx * -0.60 + bestDy * -0.60 + z * 0.50;
        const rib = opts?.ribFreq ? Math.sin(bestT * Math.PI * 2 * opts.ribFreq) * 0.16 : 0;

        if (bestNorm > 0.78 && (opts?.outlineDark || opts?.outlineLight)) {
          this.px(layerId, x, y, keyDot > 0.25 ? (opts.outlineLight ?? ramp[2]) : (opts.outlineDark ?? ramp[0]));
          continue;
        }
        const val = Math.max(0, Math.min(1, 0.44 + keyDot * 0.52 + (opts?.lightBias ?? 0) + rib));
        const idx = Math.min(ramp.length - 1, Math.max(1, Math.round(val * (ramp.length - 1))));
        this.px(layerId, x, y, ramp[idx]);
      }
    }
  }

  /** Sculpt a rounded beveled metallic plate/chassis with crisp 45-deg sunlit top-left bevel & dark bottom-right recess! */
  sculptBeveledBox(
    layerId: string,
    x0: number,
    y0: number,
    w: number,
    h: number,
    ramp: string[],
    opts?: { roundCorners?: boolean; lightBias?: number }
  ): void {
    const rx0 = Math.round(x0);
    const ry0 = Math.round(y0);
    const rw = Math.max(2, Math.round(w));
    const rh = Math.max(2, Math.round(h));
    for (let ly = 0; ly < rh; ly++) {
      for (let lx = 0; lx < rw; lx++) {
        if (opts?.roundCorners && (lx === 0 || lx === rw - 1) && (ly === 0 || ly === rh - 1)) continue;
        const isTop = ly === 0;
        const isLeft = lx === 0;
        const isBot = ly === rh - 1;
        const isRight = lx === rw - 1;
        let tok: string;
        if (isBot || isRight) tok = ramp[0];
        else if (isTop || isLeft) tok = ramp[Math.min(ramp.length - 1, 1)];
        else if (ly === 1 || lx === 1) tok = ramp[Math.min(ramp.length - 1, ramp.length - 2)];
        else if (ly === rh - 2 || lx === rw - 2) tok = ramp[Math.min(ramp.length - 1, 2)];
        else {
          const grad = 1 - (lx / rw) * 0.45 - (ly / rh) * 0.45 + (opts?.lightBias ?? 0);
          const idx = Math.min(ramp.length - 2, Math.max(2, Math.round(grad * (ramp.length - 1))));
          tok = ramp[idx];
        }
        this.px(layerId, rx0 + lx, ry0 + ly, tok);
      }
    }
  }

  /** Selective outer-contour sel-out polish over composite: adds razor-clean 1px dark plum/slate exterior outline ONLY where needed! */
  applyExteriorSelOut(targetLayerId: string, darkToken: string, litToken: string, clip?: ClipRect): void {
    const comp = this.composite();
    const x0 = clip?.x0 ?? 1;
    const y0 = clip?.y0 ?? 1;
    const x1 = clip?.x1 ?? this.width - 2;
    const y1 = clip?.y1 ?? this.height - 2;
    const opaqueAt = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false;
      return comp[(y * this.width + x) * 4 + 3] > 0;
    };

    const toPaint: Array<[number, number, string]> = [];
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (opaqueAt(x, y)) continue;
        const nL = opaqueAt(x - 1, y);
        const nR = opaqueAt(x + 1, y);
        const nU = opaqueAt(x, y - 1);
        const nD = opaqueAt(x, y + 1);
        if (!nL && !nR && !nU && !nD) continue;
        // Upper-left contour gets warmer/softer sel-out; bottom-right gets crisp deep dark ink!
        const isUpperLeftBorder = (nR || nD) && !nL && !nU;
        toPaint.push([x, y, isUpperLeftBorder ? litToken : darkToken]);
      }
    }
    for (const [px, py, tok] of toPaint) {
      this.px(targetLayerId, px, py, tok);
    }
  }

  toProjectDocument(opts: {
    id: string;
    name: string;
    pivot: { x: number; y: number };
    tileSize: number;
    styleNotes: string;
  }): ProjectDocument {
    const palette = buildHighResPalettePreset();
    const layers: LayerNode[] = this.layerOrder.map((def) => ({
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
      id: 'hr_study_frame_0',
      durationMs: 140,
      cels: Object.fromEntries(this.layerOrder.map((d) => [d.id, new Uint8ClampedArray(this.cels[d.id])])),
    };
    return {
      id: opts.id,
      name: opts.name,
      width: this.width,
      height: this.height,
      layers,
      frames: [frame],
      tags: [{ id: 'tag_study', name: 'highres_study', from: 0, to: 0, color: '#E38A48' }],
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
    const doc = this.toProjectDocument({
      id: 'tmp',
      name: 'tmp',
      pivot: { x: 0, y: 0 },
      tileSize: 32,
      styleNotes: '',
    });
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

/** Clean integer nearest-neighbor scaler */
export function scaleNearestHR(src: Uint8ClampedArray, w: number, h: number, scale: number): {
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
      const r = src[si];
      const g = src[si + 1];
      const b = src[si + 2];
      const a = src[si + 3];
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const di = ((y * scale + sy) * ow + (x * scale + sx)) * 4;
          out[di] = r;
          out[di + 1] = g;
          out[di + 2] = b;
          out[di + 3] = a;
        }
      }
    }
  }
  return { pixels: out, width: ow, height: oh };
}

/** Alpha-over blit with optional region & opacity */
export function blitHR(
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
        dst[di] = src[si];
        dst[di + 1] = src[si + 1];
        dst[di + 2] = src[si + 2];
        dst[di + 3] = 255;
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
