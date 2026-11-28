import type { AnimationFrame, PaletteColor, PalettePreset } from '../types/studio';
import { hexToRgba, rgbaToHex } from './pixelBuffer';

export const VERDANT_MASTER_PALETTE: PalettePreset = {
  id: 'verdant_master_30',
  name: 'VERDANT SIGNAL Master (30)',
  description: 'Locked 5-ramp painterly hue-shifted palette derived from the Oura-IV visual reference.',
  colors: [
    // Ramp A — Survival Suit Orange
    { id: 'S0', token: 'S0', ramp: 'Suit Orange', name: 'Crevice Plum', hex: '#231622' },
    { id: 'S1', token: 'S1', ramp: 'Suit Orange', name: 'Deep Mahogany', hex: '#4F2425' },
    { id: 'S2', token: 'S2', ramp: 'Suit Orange', name: 'Burnt Sienna', hex: '#873A2B' },
    { id: 'S3', token: 'S3', ramp: 'Suit Orange', name: 'Suit Terracotta', hex: '#C25B32' },
    { id: 'S4', token: 'S4', ramp: 'Suit Orange', name: 'Sunlit Amber', hex: '#DE884A' },
    { id: 'S5', token: 'S5', ramp: 'Suit Orange', name: 'Apricot Crest', hex: '#EFC17C' },
    // Ramp B — Harness, Leather & Boots
    { id: 'B0', token: 'B0', ramp: 'Leather & Boots', name: 'Plum Charcoal', hex: '#1B1420' },
    { id: 'B1', token: 'B1', ramp: 'Leather & Boots', name: 'Dark Umber', hex: '#362428' },
    { id: 'B2', token: 'B2', ramp: 'Leather & Boots', name: 'Weathered Leather', hex: '#593C36' },
    { id: 'B3', token: 'B3', ramp: 'Leather & Boots', name: 'Worn Strap', hex: '#805B4B' },
    { id: 'B4', token: 'B4', ramp: 'Leather & Boots', name: 'Scuffed Edge', hex: '#AA856B' },
    // Ramp C — Brushed Titanium & Metal
    { id: 'M0', token: 'M0', ramp: 'Brushed Metal', name: 'Steel Trough', hex: '#222531' },
    { id: 'M1', token: 'M1', ramp: 'Brushed Metal', name: 'Shaded Steel', hex: '#414B56' },
    { id: 'M2', token: 'M2', ramp: 'Brushed Metal', name: 'Weathered Titanium', hex: '#6A757A' },
    { id: 'M3', token: 'M3', ramp: 'Brushed Metal', name: 'Lit Bevel', hex: '#9BA39A' },
    { id: 'M4', token: 'M4', ramp: 'Brushed Metal', name: 'Sunlit Glint', hex: '#CFCBB4' },
    { id: 'M5', token: 'M5', ramp: 'Brushed Metal', name: 'Peak Cream Specular', hex: '#F2EED0' },
    // Ramp D — Curved Glass Visor & Teal Telemetry
    { id: 'V0', token: 'V0', ramp: 'Visor & Teal', name: 'Visor Core', hex: '#141E28' },
    { id: 'V1', token: 'V1', ramp: 'Visor & Teal', name: 'Deep Glass Teal', hex: '#213842' },
    { id: 'V2', token: 'V2', ramp: 'Visor & Teal', name: 'Muted Tech Teal', hex: '#3A6168' },
    { id: 'V3', token: 'V3', ramp: 'Visor & Teal', name: 'Sky Curve', hex: '#649291' },
    { id: 'V4', token: 'V4', ramp: 'Visor & Teal', name: 'Horizon Mist', hex: '#9BC2B6' },
    { id: 'V5', token: 'V5', ramp: 'Visor & Teal', name: 'Specular Bridge', hex: '#DCE8D5' },
    // Ramp E — Organic Oura-IV Flora & Accents
    { id: 'O0', token: 'O0', ramp: 'Oura-IV Organic', name: 'Forest Occlusion', hex: '#192924' },
    { id: 'O1', token: 'O1', ramp: 'Oura-IV Organic', name: 'Pine Shadow', hex: '#324B36' },
    { id: 'O2', token: 'O2', ramp: 'Oura-IV Organic', name: 'Earthy Moss', hex: '#567449' },
    { id: 'O3', token: 'O3', ramp: 'Oura-IV Organic', name: 'Sunlit Sage', hex: '#7B9056' },
    { id: 'O4', token: 'O4', ramp: 'Oura-IV Organic', name: 'Ochre Frond', hex: '#C8BC6E' },
    { id: 'O5', token: 'O5', ramp: 'Oura-IV Organic', name: 'Ceramic Ivory', hex: '#E2E1BE' },
    { id: 'O6', token: 'O6', ramp: 'Oura-IV Organic', name: 'Ruby Specimen', hex: '#A83B3B' },
  ],
};

export const AMBER_COAST_PALETTE: PalettePreset = {
  id: 'biome_amber_coast',
  name: 'Oura-IV: Amber Coast & Tidepools',
  description: 'Warm littoral ochre sandstone, misty tidal slate, and sunlit kelp biome palette.',
  colors: [
    { id: 'ac0', ramp: 'Basalt', name: 'Tide Shadow', hex: '#1B1D29' },
    { id: 'ac1', ramp: 'Basalt', name: 'Wet Slate', hex: '#373C49' },
    { id: 'ac2', ramp: 'Basalt', name: 'Coastal Stone', hex: '#62686E' },
    { id: 'ac3', ramp: 'Basalt', name: 'Drift Limestone', hex: '#9A9B90' },
    { id: 'ac4', ramp: 'Sandstone', name: 'Deep Cliff', hex: '#4B2A26' },
    { id: 'ac5', ramp: 'Sandstone', name: 'Rust Sand', hex: '#8A4B34' },
    { id: 'ac6', ramp: 'Sandstone', name: 'Amber Shelf', hex: '#C6824B' },
    { id: 'ac7', ramp: 'Sandstone', name: 'Sunlit Dune', hex: '#E6BF82' },
    { id: 'ac8', ramp: 'Tidepool', name: 'Abyssal Teal', hex: '#162A34' },
    { id: 'ac9', ramp: 'Tidepool', name: 'Shallow Surf', hex: '#37656E' },
    { id: 'ac10', ramp: 'Tidepool', name: 'Seafoam Glint', hex: '#7DA8A4' },
    { id: 'ac11', ramp: 'Tidepool', name: 'Mist Crest', hex: '#CBE0D4' },
    { id: 'ac12', ramp: 'Kelp', name: 'Kelp Shade', hex: '#2A4234' },
    { id: 'ac13', ramp: 'Kelp', name: 'Sea Olive', hex: '#5B7A4A' },
    { id: 'ac14', ramp: 'Kelp', name: 'Amber Spore', hex: '#D8A24A' },
    { id: 'ac15', ramp: 'Kelp', name: 'Coral Accent', hex: '#BD4B42' },
  ],
};

export const SINGING_CANOPY_PALETTE: PalettePreset = {
  id: 'biome_singing_canopy',
  name: 'Oura-IV: Singing Canopy',
  description: 'Deep cathedral reedwood shadows, warm sunbeams, and luminous bio-acoustic flora.',
  colors: [
    { id: 'sc0', ramp: 'Bark', name: 'Root Plum', hex: '#1A1320' },
    { id: 'sc1', ramp: 'Bark', name: 'Bark Umber', hex: '#3B282C' },
    { id: 'sc2', ramp: 'Bark', name: 'Redwood Mid', hex: '#684238' },
    { id: 'sc3', ramp: 'Bark', name: 'Sunlit Bark', hex: '#9D6D54' },
    { id: 'sc4', ramp: 'Foliage', name: 'Canopy Deep', hex: '#152522' },
    { id: 'sc5', ramp: 'Foliage', name: 'Moss Shade', hex: '#2B4939' },
    { id: 'sc6', ramp: 'Foliage', name: 'Reed Leaf', hex: '#4E7549' },
    { id: 'sc7', ramp: 'Foliage', name: 'Sunshaft Leaf', hex: '#8BA45A' },
    { id: 'sc8', ramp: 'Foliage', name: 'Golden Pollen', hex: '#DCD082' },
    { id: 'sc9', ramp: 'Bio-Signal', name: 'Resonance Deep', hex: '#1B3A48' },
    { id: 'sc10', ramp: 'Bio-Signal', name: 'Harmonic Cyan', hex: '#4B8E94' },
    { id: 'sc11', ramp: 'Bio-Signal', name: 'Signal Glow', hex: '#A4D8CB' },
  ],
};

export const DEFAULT_PALETTES: PalettePreset[] = [
  VERDANT_MASTER_PALETTE,
  AMBER_COAST_PALETTE,
  SINGING_CANOPY_PALETTE,
];

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hn = (((h % 360) + 360) % 360) / 360;
  const sn = Math.max(0, Math.min(100, s)) / 100;
  const ln = Math.max(0, Math.min(100, l)) / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return [v, v, v];
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hue2rgb = (t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return [
    Math.round(hue2rgb(hn + 1 / 3) * 255),
    Math.round(hue2rgb(hn) * 255),
    Math.round(hue2rgb(hn - 1 / 3) * 255),
  ];
}

/**
 * Generates an artistic hue-shifted pixel-art color ramp (shadows shift cool toward
 * violet-plum ~275 deg; highlights shift warm toward golden sunlit yellow ~48 deg).
 */
export function generateHueShiftedRamp(
  baseHex: string,
  steps = 5,
  hueShiftStrength = 26
): string[] {
  const { r, g, b } = hexToRgba(baseHex);
  const [h0, s0, l0] = rgbToHsl(r, g, b);
  const out: string[] = [];
  const mid = (steps - 1) / 2;

  const shiftToward = (h: number, target: number, amount: number) => {
    let diff = ((target - h + 540) % 360) - 180;
    return (h + Math.sign(diff) * Math.min(Math.abs(diff), amount) + 360) % 360;
  };

  for (let i = 0; i < steps; i++) {
    const t = (i - mid) / Math.max(1, mid); // -1 (darkest shadow) to +1 (brightest highlight)
    const l = Math.max(10, Math.min(90, l0 + t * 34));
    const s = Math.max(14, Math.min(72, s0 + (t < 0 ? Math.abs(t) * 8 : -t * 10)));
    const h =
      t < 0
        ? shiftToward(h0, 285, Math.abs(t) * hueShiftStrength) // cool plum shadows
        : shiftToward(h0, 48, t * hueShiftStrength);           // warm sunlit highlights
    const [nr, ng, nb] = hslToRgb(h, s, l);
    out.push(rgbaToHex(nr, ng, nb));
  }
  return out;
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgba(hex);
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function wcagContrast(hexA: string, hexB: string): number {
  const l1 = relativeLuminance(hexA);
  const l2 = relativeLuminance(hexB);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function nearestPaletteHex(hex: string, palette: PalettePreset): string {
  if (palette.colors.length === 0) return hex.toUpperCase();
  const c = hexToRgba(hex);
  let best = palette.colors[0].hex;
  let bestDist = Infinity;
  for (const item of palette.colors) {
    const p = hexToRgba(item.hex);
    const d = (c.r - p.r) ** 2 * 0.3 + (c.g - p.g) ** 2 * 0.59 + (c.b - p.b) ** 2 * 0.11;
    if (d < bestDist) {
      bestDist = d;
      best = item.hex;
    }
  }
  return best.toUpperCase();
}

export interface PaletteUsageAnalysis {
  counts: Record<string, number>;
  unusedHexes: string[];
  duplicateHexes: string[];
  offPaletteHexes: string[];
  totalOpaque: number;
}

export function analyzePaletteUsage(
  composite: Uint8ClampedArray,
  palette: PalettePreset
): PaletteUsageAnalysis {
  const counts: Record<string, number> = {};
  let totalOpaque = 0;
  for (let i = 0; i < composite.length; i += 4) {
    if (composite[i + 3] === 0) continue;
    totalOpaque++;
    const hx = rgbaToHex(composite[i], composite[i + 1], composite[i + 2]);
    counts[hx] = (counts[hx] ?? 0) + 1;
  }

  const palSet = new Set<string>();
  const duplicates = new Set<string>();
  for (const c of palette.colors) {
    const u = c.hex.toUpperCase();
    if (palSet.has(u)) duplicates.add(u);
    palSet.add(u);
  }

  const unusedHexes = Array.from(palSet).filter((hx) => !counts[hx]);
  const offPaletteHexes = Object.keys(counts).filter((hx) => !palSet.has(hx));
  return {
    counts,
    unusedHexes,
    duplicateHexes: Array.from(duplicates),
    offPaletteHexes,
    totalOpaque,
  };
}

export function replaceColorAcrossFrames(
  frames: AnimationFrame[],
  fromHex: string,
  toHex: string
): { frames: AnimationFrame[]; replacedPixels: number } {
  const src = hexToRgba(fromHex);
  const dst = hexToRgba(toHex);
  let replaced = 0;
  const nextFrames = frames.map((frame) => {
    const nextCels: Record<string, Uint8ClampedArray> = {};
    for (const [layerId, buf] of Object.entries(frame.cels)) {
      const copy = new Uint8ClampedArray(buf);
      for (let i = 0; i < copy.length; i += 4) {
        if (copy[i + 3] > 0 && copy[i] === src.r && copy[i + 1] === src.g && copy[i + 2] === src.b) {
          copy[i] = dst.r;
          copy[i + 1] = dst.g;
          copy[i + 2] = dst.b;
          replaced++;
        }
      }
      nextCels[layerId] = copy;
    }
    return { ...frame, cels: nextCels };
  });
  return { frames: nextFrames, replacedPixels: replaced };
}

export function exportPaletteGPL(palette: PalettePreset): string {
  const lines = ['GIMP Palette', `Name: ${palette.name}`, 'Columns: 6', '#'];
  for (const c of palette.colors) {
    const { r, g, b } = hexToRgba(c.hex);
    lines.push(
      `${String(r).padStart(3, ' ')} ${String(g).padStart(3, ' ')} ${String(b).padStart(3, ' ')}\t${c.name}`
    );
  }
  return lines.join('\n') + '\n';
}

export function exportPaletteHex(palette: PalettePreset): string {
  return palette.colors.map((c) => c.hex.replace('#', '').toLowerCase()).join('\n') + '\n';
}

export function importPaletteText(text: string, fallbackName: string): PalettePreset | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // JSON format
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        const colors: PaletteColor[] = parsed
          .map((item, idx) => {
            const hx = typeof item === 'string' ? item : item?.hex;
            if (!hx) return null;
            const norm = hx.startsWith('#') ? hx.toUpperCase() : `#${hx.toUpperCase()}`;
            return { id: `imp_${idx}`, hex: norm, name: item?.name || norm, ramp: item?.ramp || 'Imported' };
          })
          .filter(Boolean) as PaletteColor[];
        if (colors.length > 0) {
          return { id: `pal_${Date.now()}`, name: fallbackName, description: 'Imported JSON palette', colors };
        }
      } else if (parsed && Array.isArray(parsed.colors)) {
        return {
          id: `pal_${Date.now()}`,
          name: parsed.name || fallbackName,
          description: parsed.description || 'Imported JSON palette',
          colors: parsed.colors.map((c: PaletteColor, i: number) => ({
            id: c.id || `imp_${i}`,
            hex: c.hex.toUpperCase(),
            name: c.name || c.hex,
            ramp: c.ramp || 'Imported',
          })),
        };
      }
    } catch {
      // fall through
    }
  }

  // GIMP .gpl format
  if (trimmed.startsWith('GIMP Palette')) {
    const lines = trimmed.split(/\r?\n/);
    let name = fallbackName;
    const colors: PaletteColor[] = [];
    for (const line of lines) {
      if (line.startsWith('Name:')) {
        name = line.slice(5).trim() || fallbackName;
        continue;
      }
      if (!line.trim() || line.startsWith('#') || line.startsWith('Columns:')) continue;
      const m = line.trim().match(/^(\d+)\s+(\d+)\s+(\d+)(?:\s+(.*))?$/);
      if (m) {
        const hex = rgbaToHex(Number(m[1]), Number(m[2]), Number(m[3]));
        colors.push({ id: `gpl_${colors.length}`, hex, name: (m[4] || hex).trim(), ramp: 'Imported' });
      }
    }
    if (colors.length > 0) {
      return { id: `pal_${Date.now()}`, name, description: 'Imported GIMP .gpl palette', colors };
    }
  }

  // Plain .hex list
  const hexMatches = trimmed.match(/#?[0-9a-fA-F]{6}/g);
  if (hexMatches && hexMatches.length > 0) {
    const colors = hexMatches.map((m, idx) => {
      const hex = m.startsWith('#') ? m.toUpperCase() : `#${m.toUpperCase()}`;
      return { id: `hex_${idx}`, hex, name: hex, ramp: 'Imported' };
    });
    return { id: `pal_${Date.now()}`, name: fallbackName, description: 'Imported HEX palette', colors };
  }
  return null;
}
