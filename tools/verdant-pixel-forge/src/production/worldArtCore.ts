/**
 * VERDANT SIGNAL — Shared Painterly Pixel-Art World Production Core
 * =================================================================
 * Native VERDANT PIXEL FORGE TypeScript production library providing:
 *   1. Unified Rimlands World & Character Master Palette (hue-shifted ramps,
 *      zero pure #000000/#FFFFFF, locked upper-left ~38° golden key light).
 *   2. Toroidally-seamless multi-octave painterly cluster fields (zero tile seams).
 *   3. Exact border-continuous Wang 4-corner signed-distance shoreline & ecotone
 *      generators matching world_chunk_streamer.gd pixel-for-pixel.
 *   4. Native VPF ProjectDocument (.vpf.json) & RGBA8 PNG assembly helpers.
 */

import {
  compositeFrame,
  createEmptyBuffer,
  hexToRgba,
  setPixel,
} from '../engine/pixelBuffer';
import { DEFAULT_PALETTES } from '../engine/paletteEngine';
import { serializeVpfProject } from '../engine/exportEngine';
import type {
  AnimationFrame,
  LayerNode,
  PaletteColor,
  PalettePreset,
  ProjectDocument,
  RGBA,
} from '../types/studio';

export interface WorldColorDef {
  id: string;
  name: string;
  hex: string;
  group: string;
}

/**
 * Curated Unified Painterly Palette for VERDANT SIGNAL Milestone 01
 * Harmonizes Mara Lin's 30-color hero palette directly with Amber Coast,
 * Singing Canopy, Reedwood, Flora, Drop-Pod, and VFX material ramps.
 */
export const WORLD_PALETTE_DEFS: WorldColorDef[] = [
  // --- A. AMBER COAST SAND & EARTH ---
  { id: 'SND0', name: 'Wet Pebble Deep', hex: '#4D3D34', group: 'Amber Sand' },
  { id: 'SND1', name: 'Damp Shore Shade', hex: '#7C6549', group: 'Amber Sand' },
  { id: 'SND2', name: 'Wet Sand Rim', hex: '#9B7F58', group: 'Amber Sand' },
  { id: 'SND3', name: 'Ochre Sand Base', hex: '#B89A6C', group: 'Amber Sand' },
  { id: 'SND4', name: 'Warm Sand Swell', hex: '#C8AD7E', group: 'Amber Sand' },
  { id: 'SND5', name: 'Sunlit Sand Crest', hex: '#D9C092', group: 'Amber Sand' },
  { id: 'SND6', name: 'Shell & Quartz Glint', hex: '#EDE3C4', group: 'Amber Sand' },

  // --- B. COASTAL WATER, SHALLOWS & SEA-FOAM ---
  { id: 'WAT0', name: 'Abyssal Trough', hex: '#143244', group: 'Coastal Water' },
  { id: 'WAT1', name: 'Deep Shelf Teal', hex: '#1C485C', group: 'Coastal Water' },
  { id: 'WAT2', name: 'Mid Coastal Teal', hex: '#286475', group: 'Coastal Water' },
  { id: 'WAT3', name: 'Turquoise Shallow', hex: '#367E8A', group: 'Coastal Water' },
  { id: 'WAT4', name: 'Sunlit Shallow', hex: '#52979E', group: 'Coastal Water' },
  { id: 'WAT5', name: 'Sky Reflection Mist', hex: '#86B3B4', group: 'Coastal Water' },
  { id: 'WAT6', name: 'Sea Foam Edge', hex: '#C2D9DD', group: 'Coastal Water' },
  { id: 'WAT7', name: 'Sea Foam Crest', hex: '#E8F3EE', group: 'Coastal Water' },

  // --- C. COASTAL BASALT / SANDSTONE CLIFFS ---
  { id: 'RCK0', name: 'Cliff Crevice', hex: '#1D2C2D', group: 'Coastal Rock' },
  { id: 'RCK1', name: 'Cliff Base Shade', hex: '#2D423E', group: 'Coastal Rock' },
  { id: 'RCK2', name: 'Basalt Wall Dark', hex: '#41555D', group: 'Coastal Rock' },
  { id: 'RCK3', name: 'Basalt Wall Mid', hex: '#566B73', group: 'Coastal Rock' },
  { id: 'RCK4', name: 'Weathered Rim', hex: '#7E9AA2', group: 'Coastal Rock' },
  { id: 'RCK5', name: 'Sunlit Stone Lip', hex: '#A5BCC0', group: 'Coastal Rock' },
  { id: 'RCK6', name: 'Salt-Bleached Cap', hex: '#CFDCD8', group: 'Coastal Rock' },

  // --- D. SINGING CANOPY MOSS, TURF & FOLIAGE ---
  { id: 'MOS0', name: 'Deep Undergrowth', hex: '#192924', group: 'Canopy Moss' },
  { id: 'MOS1', name: 'Cool Canopy Shade', hex: '#294036', group: 'Canopy Moss' },
  { id: 'MOS2', name: 'Forest Floor Dark', hex: '#3D5444', group: 'Canopy Moss' },
  { id: 'MOS3', name: 'Cool Sage Transition', hex: '#47695E', group: 'Canopy Moss' },
  { id: 'MOS4', name: 'Deep Olive Turf', hex: '#587856', group: 'Canopy Moss' },
  { id: 'MOS5', name: 'Olive-Sage Base', hex: '#6F8A68', group: 'Canopy Moss' },
  { id: 'MOS6', name: 'Sun-Dappled Moss', hex: '#87A26E', group: 'Canopy Moss' },
  { id: 'MOS7', name: 'Sunlit Frond Tip', hex: '#9FB87E', group: 'Canopy Moss' },
  { id: 'MOS8', name: 'Golden Canopy Catch', hex: '#C8BC6E', group: 'Canopy Moss' },
  { id: 'MOS9', name: 'Warm Leaf Specular', hex: '#E4DF9E', group: 'Canopy Moss' },

  // --- E. REEDWOOD TRUNK, ROOTS & FOREST CREEK ---
  { id: 'RED0', name: 'Wind-Slit Cavity', hex: '#1B2423', group: 'Reedwood' },
  { id: 'RED1', name: 'Root Umber Dark', hex: '#2F2B28', group: 'Reedwood' },
  { id: 'RED2', name: 'Shaded Bark Ridge', hex: '#434B40', group: 'Reedwood' },
  { id: 'RED3', name: 'Fluted Reed Mid', hex: '#5F6652', group: 'Reedwood' },
  { id: 'RED4', name: 'Warm Reed Flank', hex: '#7D7A62', group: 'Reedwood' },
  { id: 'RED5', name: 'Sunlit Reed Ridge', hex: '#9B8F74', group: 'Reedwood' },
  { id: 'RED6', name: 'Dry Reed Highlight', hex: '#C4B794', group: 'Reedwood' },
  { id: 'CRK0', name: 'Creek Deep', hex: '#2D5D5C', group: 'Forest Creek' },
  { id: 'CRK1', name: 'Creek Mid', hex: '#4B8B82', group: 'Forest Creek' },
  { id: 'CRK2', name: 'Creek Shimmer', hex: '#7BB6A6', group: 'Forest Creek' },

  // --- F. AMBER KELP, SUN-DROP BULB & RESONANCE SIGNALS ---
  { id: 'KLP0', name: 'Kelp Stalk Dark', hex: '#5A321C', group: 'Flora & Signal' },
  { id: 'KLP1', name: 'Amber Kelp Shade', hex: '#8C5320', group: 'Flora & Signal' },
  { id: 'KLP2', name: 'Amber Kelp Mid', hex: '#C87828', group: 'Flora & Signal' },
  { id: 'KLP3', name: 'Golden Kelp Ribbon', hex: '#E89E38', group: 'Flora & Signal' },
  { id: 'KLP4', name: 'Sun-Drop Honey', hex: '#FFC648', group: 'Flora & Signal' },
  { id: 'KLP5', name: 'Biolum Core Glow', hex: '#FFF0A8', group: 'Flora & Signal' },
  { id: 'SIG0', name: 'Acoustic Pulse Cyan', hex: '#4CE8E0', group: 'Flora & Signal' },
  { id: 'SIG1', name: 'Bio-Mint Ripple', hex: '#6CF2B2', group: 'Flora & Signal' },
  { id: 'SIG2', name: 'Warm Lantern Glow', hex: '#FFB838', group: 'Flora & Signal' },

  // --- G. DROP-POD AEROSPACE CERAMIC, METAL & RESCUE ORANGE ---
  { id: 'POD0', name: 'Scorch Charcoal', hex: '#1B1D26', group: 'Drop-Pod' },
  { id: 'POD1', name: 'Hull Shadow Slate', hex: '#384350', group: 'Drop-Pod' },
  { id: 'POD2', name: 'Weathered Alloy', hex: '#66737D', group: 'Drop-Pod' },
  { id: 'POD3', name: 'Matte Ceramic Shade', hex: '#9DA4A8', group: 'Drop-Pod' },
  { id: 'POD4', name: 'Warm Ceramic Mid', hex: '#CFCBC0', group: 'Drop-Pod' },
  { id: 'POD5', name: 'Sunlit Ivory Hull', hex: '#ECE7D9', group: 'Drop-Pod' },
  { id: 'POD6', name: 'Hull Specular Rim', hex: '#F7F3E6', group: 'Drop-Pod' },
  { id: 'RSC0', name: 'Rescue Dark', hex: '#7D2C1D', group: 'Drop-Pod' },
  { id: 'RSC1', name: 'Rescue Terracotta', hex: '#C64A28', group: 'Drop-Pod' },
  { id: 'RSC2', name: 'Rescue Signal Orange', hex: '#F06A38', group: 'Drop-Pod' },
  { id: 'RSC3', name: 'Rescue Sunlit Edge', hex: '#FA9E5B', group: 'Drop-Pod' },

  // --- H. REEDWOOD CANOPY VOLUMETRIC FOLIAGE (Upper-Left Sunlit Spruce-Emerald) ---
  { id: 'CAN0', name: 'Canopy Deep Undercut', hex: '#1A2B26', group: 'Reedwood Canopy' },
  { id: 'CAN1', name: 'Spruce Hollow Shade', hex: '#233A31', group: 'Reedwood Canopy' },
  { id: 'CAN2', name: 'Emerald Bough Shadow', hex: '#2E4E3E', group: 'Reedwood Canopy' },
  { id: 'CAN3', name: 'Forest Canopy Mid', hex: '#3D684A', group: 'Reedwood Canopy' },
  { id: 'CAN4', name: 'Lush Leaf Volume', hex: '#528255', group: 'Reedwood Canopy' },
  { id: 'CAN5', name: 'Moss-Lime Crown', hex: '#6B9B60', group: 'Reedwood Canopy' },
  { id: 'CAN6', name: 'Sunlit Leaf Cluster', hex: '#8BB46E', group: 'Reedwood Canopy' },
  { id: 'CAN7', name: 'Golden Canopy Edge', hex: '#B0CA7E', group: 'Reedwood Canopy' },
  { id: 'CAN8', name: 'Dewlit Crown Spark', hex: '#CFD992', group: 'Reedwood Canopy' },

  // --- I. MIRROR GLASSWORT & SUN-DROP BIOLUMINESCENCE ---
  { id: 'GLW0', name: 'Salt-Crystal Deep', hex: '#1B4952', group: 'Flora Special' },
  { id: 'GLW1', name: 'Glasswort Shade', hex: '#2B6E74', group: 'Flora Special' },
  { id: 'GLW2', name: 'Glasswort Prism Mid', hex: '#4AA09D', group: 'Flora Special' },
  { id: 'GLW3', name: 'Translucent Crystal', hex: '#86D6C8', group: 'Flora Special' },
  { id: 'GLW4', name: 'Prism Catchlight', hex: '#E4FFF6', group: 'Flora Special' },
  { id: 'SUN0', name: 'Biolum Stem Green', hex: '#4F7B38', group: 'Flora Special' },
  { id: 'SUN1', name: 'Biolum Lime Glow', hex: '#8AC44B', group: 'Flora Special' },
  { id: 'SUN2', name: 'Sun-Drop Petal Gold', hex: '#D4EA64', group: 'Flora Special' },
  { id: 'SUN3', name: 'Blossom Radiant Core', hex: '#FFF6A8', group: 'Flora Special' },
  { id: 'SUN4', name: 'Blossom Incandescent', hex: '#FFFFFF', group: 'Flora Special' },

  // --- J. MERIDIAN LANDMARK HULL, TITANIUM, CANVAS, GLASS & VFX ---
  { id: 'CHR0', name: 'Impact Carbon Soot', hex: '#191D24', group: 'Meridian Camp' },
  { id: 'CHR1', name: 'Scorch Ash Umber', hex: '#343238', group: 'Meridian Camp' },
  { id: 'TIT0', name: 'Titanium Deep Recess', hex: '#222B36', group: 'Meridian Camp' },
  { id: 'TIT1', name: 'Blued Alloy Shadow', hex: '#3D4B5A', group: 'Meridian Camp' },
  { id: 'TIT2', name: 'Brushed Titanium Mid', hex: '#637586', group: 'Meridian Camp' },
  { id: 'TIT3', name: 'Alloy Sunlit Bevel', hex: '#90A2B2', group: 'Meridian Camp' },
  { id: 'TIT4', name: 'Chrome Specular Edge', hex: '#C6D4DE', group: 'Meridian Camp' },
  { id: 'HUL0', name: 'Ceramic Seam Deep', hex: '#545B66', group: 'Meridian Camp' },
  { id: 'HUL1', name: 'Ceramic Shade Cool', hex: '#7A838C', group: 'Meridian Camp' },
  { id: 'HUL2', name: 'Weathered Ceramic', hex: '#A4ABB0', group: 'Meridian Camp' },
  { id: 'HUL3', name: 'Warm Ivory Hull', hex: '#CBCBC4', group: 'Meridian Camp' },
  { id: 'HUL4', name: 'Sunlit Ceramic Shell', hex: '#E4E6E0', group: 'Meridian Camp' },
  { id: 'HUL5', name: 'Aerospace Highlight', hex: '#F4F7F5', group: 'Meridian Camp' },
  { id: 'ORG0', name: 'Meridian Rust Shadow', hex: '#7B341E', group: 'Meridian Camp' },
  { id: 'ORG1', name: 'Meridian Terracotta', hex: '#B4562B', group: 'Meridian Camp' },
  { id: 'ORG2', name: 'Meridian Suit Orange', hex: '#DE884A', group: 'Meridian Camp' },
  { id: 'ORG3', name: 'Meridian Sunlit Lip', hex: '#F3B474', group: 'Meridian Camp' },
  { id: 'TNT0', name: 'Tent Seam Umber', hex: '#4B3A2C', group: 'Meridian Camp' },
  { id: 'TNT1', name: 'Canvas Shade Ochre', hex: '#765D43', group: 'Meridian Camp' },
  { id: 'TNT2', name: 'Expedition Canvas Mid', hex: '#9C805C', group: 'Meridian Camp' },
  { id: 'TNT3', name: 'Sunlit Tent Canvas', hex: '#C2A87E', group: 'Meridian Camp' },
  { id: 'TNT4', name: 'Canvas Ridge Bright', hex: '#E0CBA2', group: 'Meridian Camp' },
  { id: 'GLS0', name: 'Viewport Deep Marine', hex: '#14262E', group: 'Meridian Camp' },
  { id: 'GLS1', name: 'Armored Glass Teal', hex: '#244A56', group: 'Meridian Camp' },
  { id: 'GLS2', name: 'Viewport Sky Glint', hex: '#4A8E9C', group: 'Meridian Camp' },
  { id: 'SHD0', name: 'Contact Shadow Indigo', hex: '#12161C', group: 'VFX' },
  { id: 'LNS0', name: 'Harmonic Outer Halo', hex: '#288C84', group: 'VFX' },
  { id: 'LNS1', name: 'Acoustic Pulse Cyan', hex: '#56D4BA', group: 'VFX' },
  { id: 'LNS2', name: 'Harmonic Wave Bright', hex: '#94F2DC', group: 'VFX' },
  { id: 'LNS3', name: 'Acoustic Node Spark', hex: '#E2FFF7', group: 'VFX' },
];

const COLOR_MAP: Record<string, RGBA> = {};
for (const def of WORLD_PALETTE_DEFS) {
  COLOR_MAP[def.id] = hexToRgba(def.hex, 255);
}

export function buildWorldPalettePreset(
  id = 'verdant-rimlands-master',
  name = 'VERDANT SIGNAL Rimlands World Master'
): PalettePreset {
  const colors: PaletteColor[] = WORLD_PALETTE_DEFS.map((c) => ({
    id: c.id,
    token: c.id,
    name: c.name,
    hex: c.hex,
    ramp: c.group,
  }));
  return { id, name, description: 'Unified Rimlands painterly environment & character world palette', colors };
}

export function worldRgba(id: string, alphaOverride?: number): RGBA {
  const c = COLOR_MAP[id];
  if (!c) throw new Error(`Unknown world palette token: ${id}`);
  if (alphaOverride === undefined) return c;
  return { r: c.r, g: c.g, b: c.b, a: Math.max(0, Math.min(255, Math.round(alphaOverride))) };
}

// ============================================================================
// DETERMINISTIC HASH & PERIODIC PAINTERLY CLUSTER NOISE (ZERO SEAMS!)
// ============================================================================

export function hash2i(x: number, y: number, seed: number): number {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

/**
 * Smooth periodic 2D value noise that wraps seamlessly every `period` pixels.
 * Guarantees ZERO hard seams across repeating 16x16 tiles!
 */
export function periodicNoise(
  x: number,
  y: number,
  cellSize: number,
  periodCells: number,
  seed: number
): number {
  const gx = x / cellSize;
  const gy = y / cellSize;
  const ix = Math.floor(gx);
  const iy = Math.floor(gy);
  const fx = gx - ix;
  const fy = gy - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const mod = (n: number) => ((n % periodCells) + periodCells) % periodCells;
  const x0 = mod(ix);
  const x1 = mod(ix + 1);
  const y0 = mod(iy);
  const y1 = mod(iy + 1);
  const a = hash2i(x0, y0, seed);
  const b = hash2i(x1, y0, seed);
  const c = hash2i(x0, y1, seed);
  const d = hash2i(x1, y1, seed);
  return (a * (1 - ux) + b * ux) * (1 - uy) + (c * (1 - ux) + d * ux) * uy;
}

/**
 * Painterly 2-octave periodic organic cluster value in [0, 1] wrapping cleanly on 16x16.
 */
export function tileClusterField(x: number, y: number, seed: number): number {
  const macro = periodicNoise(x, y, 4, 4, seed);
  const mid = periodicNoise(x, y, 2, 8, seed + 97);
  return macro * 0.68 + mid * 0.32;
}

/**
 * Exact border-continuous Wang 4-corner signed field for a 16x16 tile.
 * Corner bits match world_chunk_streamer.gd: TL=1, TR=2, BL=4, BR=8.
 *
 * CRITICAL SEAM PROOF:
 * Along any tile border (u=0, u=1, v=0, or v=1), the field value depends ONLY on
 * the two corners along that edge plus a 1D symmetric edge-ripple function of the
 * shared coordinate — so opposite edges of ANY valid neighboring Wang pair match
 * PIXEL-FOR-PIXEL!
 */
export function sampleWangField(
  mask: number,
  lx: number,
  ly: number,
  wobbleSeed: number,
  wobbleAmp = 0.16
): number {
  // Use pixel centers in [0, 1] where edge pixels sit symmetrically around 0..1
  const u = (lx + 0.5) / 16;
  const v = (ly + 0.5) / 16;
  const tl = (mask & 1) ? 1 : -1;
  const tr = (mask & 2) ? 1 : -1;
  const bl = (mask & 4) ? 1 : -1;
  const br = (mask & 8) ? 1 : -1;

  // Base bilinear corner interpolation (strictly shared along all 4 tile borders!)
  const top = tl * (1 - u) + tr * u;
  const bot = bl * (1 - u) + br * u;
  let f = top * (1 - v) + bot * v;

  // For diagonal saddle tiles (mask 6 = TR+BL, mask 9 = TL+BR), bias center slightly
  // positive so the diagonal sand/moss spit bridges cleanly without pinching apart!
  if (mask === 6 || mask === 9) {
    const cx = 1 - Math.abs(u - 0.5) * 2;
    const cy = 1 - Math.abs(v - 0.5) * 2;
    f += 0.28 * cx * cy;
  }

  // Edge-preserving organic wobble:
  // Along u=0/1 or v=0/1, the 1D wave matches identically across touching tiles,
  // while interior pixels get rich natural coastal irregularity!
  const edgeWaveX = Math.sin(u * Math.PI * 2 + wobbleSeed) * 0.55 + Math.cos(u * Math.PI * 4 + wobbleSeed * 1.7) * 0.45;
  const edgeWaveY = Math.sin(v * Math.PI * 2 + wobbleSeed * 1.3) * 0.55 + Math.cos(v * Math.PI * 4 + wobbleSeed * 2.1) * 0.45;
  // Blend so along horizontal borders (v near 0/1) only edgeWaveX contributes, and vice versa
  const interior = Math.sin(u * Math.PI) * Math.sin(v * Math.PI);
  const w =
    edgeWaveX * (1 - Math.sin(v * Math.PI)) * 0.55 +
    edgeWaveY * (1 - Math.sin(u * Math.PI)) * 0.55 +
    (periodicNoise(lx, ly, 4, 4, wobbleSeed) * 2 - 1) * interior * 1.15;

  return f + w * wobbleAmp;
}

// ============================================================================
// LAYERED PIXEL CANVAS BUILT DIRECTLY ON VERDANT PIXEL FORGE BUFFERS
// ============================================================================

export class WorldLayerCanvas {
  readonly width: number;
  readonly height: number;
  readonly layerOrder: Array<{ id: string; name: string }>;
  readonly layers: Record<string, Uint8ClampedArray> = {};

  constructor(width: number, height: number, layerDefs: Array<{ id: string; name: string }>) {
    this.width = width;
    this.height = height;
    this.layerOrder = layerDefs;
    for (const def of layerDefs) {
      this.layers[def.id] = createEmptyBuffer(width, height);
    }
  }

  buf(layerId: string): Uint8ClampedArray {
    const b = this.layers[layerId];
    if (!b) throw new Error(`Unknown layer ${layerId}`);
    return b;
  }

  px(layerId: string, x: number, y: number, token: string, alpha?: number): void {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    if (token === '.') {
      setPixel(this.buf(layerId), this.width, this.height, ix, iy, { r: 0, g: 0, b: 0, a: 0 });
      return;
    }
    setPixel(this.buf(layerId), this.width, this.height, ix, iy, worldRgba(token, alpha));
  }

  rgbaPx(layerId: string, x: number, y: number, r: number, g: number, b: number, a: number): void {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    setPixel(this.buf(layerId), this.width, this.height, ix, iy, { r, g, b, a });
  }

  isOpaque(layerId: string, x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false;
    return this.buf(layerId)[(y * this.width + x) * 4 + 3] > 0;
  }

  clearRect(layerId: string, x0: number, y0: number, w: number, h: number): void {
    const b = this.buf(layerId);
    const z: RGBA = { r: 0, g: 0, b: 0, a: 0 };
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) {
        if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
          setPixel(b, this.width, this.height, x, y, z);
        }
      }
    }
  }

  fillRect(layerId: string, x0: number, y0: number, w: number, h: number, token: string, alpha?: number): void {
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) {
        this.px(layerId, x, y, token, alpha);
      }
    }
  }

  fillEllipse(
    layerId: string,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    token: string,
    alpha?: number,
    clip?: { x0: number; y0: number; x1: number; y1: number }
  ): void {
    const minX = Math.max(clip ? clip.x0 : 0, Math.floor(cx - rx - 1));
    const maxX = Math.min(clip ? clip.x1 : this.width - 1, Math.ceil(cx + rx + 1));
    const minY = Math.max(clip ? clip.y0 : 0, Math.floor(cy - ry - 1));
    const maxY = Math.min(clip ? clip.y1 : this.height - 1, Math.ceil(cy + ry + 1));
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1.0) {
          this.px(layerId, x, y, token, alpha);
        }
      }
    }
  }

  fillPoly(
    layerId: string,
    pts: Array<[number, number]>,
    token: string,
    alpha?: number,
    clip?: { x0: number; y0: number; x1: number; y1: number }
  ): void {
    let minX = this.width;
    let maxX = 0;
    let minY = this.height;
    let maxY = 0;
    for (const [px, py] of pts) {
      minX = Math.min(minX, Math.floor(px));
      maxX = Math.max(maxX, Math.ceil(px));
      minY = Math.min(minY, Math.floor(py));
      maxY = Math.max(maxY, Math.ceil(py));
    }
    if (clip) {
      minX = Math.max(minX, clip.x0);
      maxX = Math.min(maxX, clip.x1);
      minY = Math.max(minY, clip.y0);
      maxY = Math.min(maxY, clip.y1);
    }
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const sx = x + 0.5;
        const sy = y + 0.5;
        let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const [xi, yi] = pts[i];
          const [xj, yj] = pts[j];
          const intersect = yi > sy !== yj > sy && sx < ((xj - xi) * (sy - yi)) / (yj - yi + 1e-9) + xi;
          if (intersect) inside = !inside;
        }
        if (inside) this.px(layerId, x, y, token, alpha);
      }
    }
  }

  line(layerId: string, x0: number, y0: number, x1: number, y1: number, token: string, alpha?: number): void {
    let ix0 = Math.round(x0);
    let iy0 = Math.round(y0);
    const ix1 = Math.round(x1);
    const iy1 = Math.round(y1);
    const dx = Math.abs(ix1 - ix0);
    const dy = -Math.abs(iy1 - iy0);
    const sx = ix0 < ix1 ? 1 : -1;
    const sy = iy0 < iy1 ? 1 : -1;
    let err = dx + dy;
    while (true) {
      this.px(layerId, ix0, iy0, token, alpha);
      if (ix0 === ix1 && iy0 === iy1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        ix0 += sx;
      }
      if (e2 <= dx) {
        err += dx;
        iy0 += sy;
      }
    }
  }

  /**
   * Paint a painterly shaded organic rock/foliage cluster inside an elliptical/irregular lobe
   * obeying locked upper-left (~38°) warm sunlight and cool lower-right shadow depth.
   */
  paintShadedBlob(
    layerId: string,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    ramp: string[], // darkest [0] -> brightest [N-1]
    seed: number,
    clip?: { x0: number; y0: number; x1: number; y1: number },
    opts?: { wobble?: number; contrast?: number; lightBias?: number }
  ): void {
    const wobble = opts?.wobble ?? 0.18;
    const contrast = opts?.contrast ?? 1.0;
    const lightBias = opts?.lightBias ?? 0.0;
    const minX = Math.max(clip ? clip.x0 : 0, Math.floor(cx - rx * 1.35));
    const maxX = Math.min(clip ? clip.x1 : this.width - 1, Math.ceil(cx + rx * 1.35));
    const minY = Math.max(clip ? clip.y0 : 0, Math.floor(cy - ry * 1.35));
    const maxY = Math.min(clip ? clip.y1 : this.height - 1, Math.ceil(cy + ry * 1.35));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const nx = (x + 0.5 - cx) / rx;
        const ny = (y + 0.5 - cy) / ry;
        const ang = Math.atan2(ny, nx);
        const edgeJitter =
          (Math.sin(ang * 3 + seed) * 0.55 + Math.cos(ang * 5 - seed * 1.3) * 0.45) * wobble;
        const r2 = nx * nx + ny * ny;
        const limit = (1 + edgeJitter) * (1 + edgeJitter);
        if (r2 > limit) continue;

        const nz = Math.sqrt(Math.max(0.02, limit - r2));
        // Locked ~38° upper-left warm key light
        let lum = (-0.64 * nx - 0.62 * ny + 0.45 * nz) * 0.54 * contrast + 0.50 + lightBias;
        // Organic painterly cluster modulation (2px macro clusters, not noisy static!)
        const clust = periodicNoise(x, y, 2, 16, seed + 31) - 0.5;
        lum += clust * 0.22;

        // Soft dark bottom-right sel-out edge without flat black outlines
        if (r2 > limit * 0.78 && nx + ny > 0.25) {
          lum -= 0.26;
        }
        const idx = Math.max(0, Math.min(ramp.length - 1, Math.round(lum * (ramp.length - 1))));
        this.px(layerId, x, y, ramp[idx]);
      }
    }
  }

  /**
   * Build a genuine editable VERDANT PIXEL FORGE v1 ProjectDocument (.vpf.json).
   */
  toProjectDocument(opts: {
    id: string;
    name: string;
    pivot: { x: number; y: number };
    styleNotes: string;
    tileSize?: number;
  }): ProjectDocument {
    const palette = buildWorldPalettePreset();
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
    const cels: Record<string, Uint8ClampedArray> = {};
    for (const def of this.layerOrder) {
      cels[def.id] = new Uint8ClampedArray(this.layers[def.id]);
    }
    const frame: AnimationFrame = {
      id: 'frame-0',
      durationMs: 200,
      cels,
    };
    const tileDim = opts.tileSize ?? 16;
    return {
      id: opts.id,
      name: opts.name,
      width: this.width,
      height: this.height,
      layers,
      frames: [frame],
      tags: [{ id: 'tag-atlas', name: 'atlas', from: 0, to: 0, color: '#6F8A68' }],
      activeLayerId: layers[layers.length - 1].id,
      activeFrameIndex: 0,
      soloLayerId: null,
      palettes: [palette, ...DEFAULT_PALETTES],
      activePaletteId: palette.id,
      paletteLocked: true,
      tileset: {
        tileWidth: tileDim,
        tileHeight: tileDim,
        selectedTileIndex: 0,
        metadata: {},
        mapCols: 8,
        mapRows: 6,
        mapCells: Array.from({ length: 48 }, () => ({
          tileIndex: -1,
          rotation: 0,
          flipH: false,
          flipV: false,
        })),
      },
      guides: [],
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
      styleNotes: '',
    });
    return compositeFrame(doc.width, doc.height, doc.layers, doc.frames[0], null);
  }
}

export function serializeWorldVpfProject(doc: ProjectDocument): string {
  return serializeVpfProject(doc);
}

// ============================================================================
// BLITTING & COMPOSITING UTILITIES FOR ASSEMBLED GAMEPLAY QA PREVIEWS
// ============================================================================

export function blitAlpha(
  dst: Uint8ClampedArray,
  dstW: number,
  dstH: number,
  src: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  dx: number,
  dy: number,
  srcRect?: { x: number; y: number; w: number; h: number },
  alphaMul = 1.0,
  tint?: [number, number, number]
): void {
  const sx0 = srcRect ? srcRect.x : 0;
  const sy0 = srcRect ? srcRect.y : 0;
  const sw = srcRect ? srcRect.w : srcW;
  const sh = srcRect ? srcRect.h : srcH;
  const tr = tint ? tint[0] : 1;
  const tg = tint ? tint[1] : 1;
  const tb = tint ? tint[2] : 1;

  for (let y = 0; y < sh; y++) {
    const ty = Math.round(dy) + y;
    if (ty < 0 || ty >= dstH) continue;
    const sy = sy0 + y;
    if (sy < 0 || sy >= srcH) continue;
    for (let x = 0; x < sw; x++) {
      const tx = Math.round(dx) + x;
      if (tx < 0 || tx >= dstW) continue;
      const sx = sx0 + x;
      if (sx < 0 || sx >= srcW) continue;
      const si = (sy * srcW + sx) * 4;
      const sa = (src[si + 3] / 255) * alphaMul;
      if (sa <= 0) continue;
      const di = (ty * dstW + tx) * 4;
      const sr = Math.min(255, src[si] * tr);
      const sg = Math.min(255, src[si + 1] * tg);
      const sb = Math.min(255, src[si + 2] * tb);
      if (sa >= 0.999) {
        dst[di] = sr;
        dst[di + 1] = sg;
        dst[di + 2] = sb;
        dst[di + 3] = 255;
      } else {
        const da = dst[di + 3] / 255;
        const outA = sa + da * (1 - sa);
        if (outA > 0) {
          dst[di] = Math.round((sr * sa + dst[di] * da * (1 - sa)) / outA);
          dst[di + 1] = Math.round((sg * sa + dst[di + 1] * da * (1 - sa)) / outA);
          dst[di + 2] = Math.round((sb * sa + dst[di + 2] * da * (1 - sa)) / outA);
          dst[di + 3] = Math.round(outA * 255);
        }
      }
    }
  }
}

export function scaleNearest(
  src: Uint8ClampedArray,
  w: number,
  h: number,
  scale: number
): { pixels: Uint8ClampedArray; width: number; height: number } {
  const ow = w * scale;
  const oh = h * scale;
  const out = createEmptyBuffer(ow, oh);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const si = (y * w + x) * 4;
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const di = ((y * scale + sy) * ow + (x * scale + sx)) * 4;
          out[di] = src[si];
          out[di + 1] = src[si + 1];
          out[di + 2] = src[si + 2];
          out[di + 3] = src[si + 3];
        }
      }
    }
  }
  return { pixels: out, width: ow, height: oh };
}
