/**
 * AST-007 — Contact Shadows, Shallow-Water Ripples & Acoustic Lens VFX (128x96)
 * =============================================================================
 * Final Production Artwork authored natively through VERDANT PIXEL FORGE.
 *
 * Strictly obeys docs/asset-production/ASSET_REQUESTS.md v2.0 &
 * game/world/vfx/ground_ring_vfx.gd + player.tscn + drop_pod_clearing.tscn:
 *   - 4x3 grid of 32x32 px cells, pivot (16, 16), >=1 px transparent cell margin!
 *   - Row 0: Contact Shadows S (12x6), M (18x9), L (30x14) in #12161C @ 35-45% alpha + (3,0) transparent
 *   - Row 1: 4-frame Shallow-Water Footstep Ripples expanding 8x4 -> 26x13
 *   - Row 2: 4-frame Acoustic Field Lens Harmonic Pulse Rings expanding 10x5 -> 30x15
 */

import { WorldLayerCanvas } from './worldArtCore';
import type { ProjectDocument } from '../types/studio';

const LAYERS = [
  { id: 'l01_contact_shadows', name: '01 Contact Shadows (S / M / L)' },
  { id: 'l02_water_ripples', name: '02 Shallow-Water Footstep Ripples' },
  { id: 'l03_acoustic_lens_rings', name: '03 Acoustic Field Lens Harmonic Rings' },
];

function paintContactShadow(c: WorldLayerCanvas, col: number, rx: number, ry: number): void {
  const ox = col * 32;
  const oy = 0;
  const cx = 15.5;
  const cy = 15.5;

  for (let ly = 1; ly < 31; ly++) {
    for (let lx = 1; lx < 31; lx++) {
      const d = Math.hypot((lx - cx) / rx, (ly - cy) / ry);
      if (d > 1.0) continue;
      // Clean stepped pixel-art translucency (#12161C): crisp grounded core (~42%) + soft outer feather (~22%)
      let alpha = 108;
      if (d > 0.78) alpha = 56;
      else if (d < 0.45) alpha = 116;
      c.px('l01_contact_shadows', ox + lx, oy + ly, 'SHD0', alpha);
    }
  }
}

function paintWaterRippleFrame(c: WorldLayerCanvas, col: number): void {
  const ox = col * 32;
  const oy = 32; // Row 1!
  const cx = 15.5;
  const cy = 15.5;

  // Expanding diameters: 8x4 -> 14x7 -> 20x10 -> 26x13
  const sizes: Array<[number, number, number]> = [
    [4.0, 2.0, 235],
    [7.0, 3.5, 215],
    [10.0, 5.0, 180],
    [13.0, 6.5, 130],
  ];
  const [rx, ry, baseAlpha] = sizes[col];

  for (let ly = 1; ly < 31; ly++) {
    for (let lx = 1; lx < 31; lx++) {
      const nx = (lx - cx) / rx;
      const ny = (ly - cy) / ry;
      const d = Math.hypot(nx, ny);
      const ang = Math.atan2(ny, nx);

      // Outer primary crisp 1px sea-foam ripple ring (gracefully dissipating droplets on later frames!)
      const gapWave = Math.sin(ang * (col >= 2 ? 6 : 4) + col * 1.4);
      const breakThresh = col === 3 ? 0.08 : col === 2 ? -0.42 : -2.0;
      const ringTol = col === 0 ? 0.20 : col === 1 ? 0.13 : 0.095;

      if (Math.abs(d - 0.94) < ringTol && gapWave > breakThresh) {
        const lit = -nx * 0.5 - ny * 0.6;
        const tok = lit > 0.05 ? 'WAT7' : lit > -0.35 ? 'WAT6' : 'WAT5';
        c.px('l02_water_ripples', ox + lx, oy + ly, tok, baseAlpha);
      } else if (col <= 1 && Math.abs(d - 0.72) < 0.10 && gapWave > -0.5) {
        c.px('l02_water_ripples', ox + lx, oy + ly, 'WAT2', Math.round(baseAlpha * 0.45));
      } else if (col >= 1 && Math.abs(d - 0.56) < 0.09 && gapWave > -0.15) {
        c.px('l02_water_ripples', ox + lx, oy + ly, 'WAT6', Math.round(baseAlpha * 0.78));
      }
    }
  }
}

function paintAcousticLensRingFrame(c: WorldLayerCanvas, col: number): void {
  const ox = col * 32;
  const oy = 64; // Row 2!
  const cx = 15.5;
  const cy = 15.5;

  // Expanding harmonic resonance waves: 10x5 -> 16x8 -> 24x12 -> 30x15
  const specs: Array<[number, number, number]> = [
    [5.0, 2.5, 245],
    [8.0, 4.0, 235],
    [12.0, 6.0, 200],
    [14.6, 7.3, 145],
  ];
  const [rx, ry, baseAlpha] = specs[col];

  for (let ly = 1; ly < 31; ly++) {
    for (let lx = 1; lx < 31; lx++) {
      const nx = (lx - cx) / rx;
      const ny = (ly - cy) / ry;
      const d = Math.hypot(nx, ny);
      const ang = Math.atan2(ny, nx);

      // Soft outer harmonic bioluminescent halo around primary pulse
      if (Math.abs(d - 0.96) < 0.22 && Math.abs(d - 0.96) >= 0.10) {
        const haloBreak = col === 3 ? Math.sin(ang * 8) > 0.1 : true;
        if (haloBreak) {
          c.px('l03_acoustic_lens_rings', ox + lx, oy + ly, 'LNS0', Math.round(baseAlpha * 0.35));
        }
      }

      // Crisp incandescent primary acoustic harmonic ring!
      if (Math.abs(d - 0.94) < 0.11) {
        const dash = col === 3 ? Math.cos(ang * 8) > -0.15 : true;
        if (dash) {
          // 4 cardinal harmonic resonance bright nodes along the ellipse!
          const isNode = Math.abs(Math.sin(ang * 2)) < 0.22;
          const tok = isNode ? 'LNS3' : col <= 1 ? 'LNS2' : 'LNS1';
          c.px('l03_acoustic_lens_rings', ox + lx, oy + ly, tok, baseAlpha);
        }
      }

      // Inner phase-locked secondary harmonic wave (frames 1..3)!
      if (col >= 1 && Math.abs(d - 0.58) < 0.10) {
        const innerDash = Math.cos(ang * 6 + col) > -0.2;
        if (innerDash) {
          c.px('l03_acoustic_lens_rings', ox + lx, oy + ly, col === 1 ? 'LNS2' : 'LNS1', Math.round(baseAlpha * 0.72));
        }
      }
    }
  }

  // Frame 0 initial focal spark at center
  if (col === 0) {
    c.px('l03_acoustic_lens_rings', ox + 15, oy + 15, 'LNS3', 220);
    c.px('l03_acoustic_lens_rings', ox + 16, oy + 15, 'LNS3', 220);
    c.px('l03_acoustic_lens_rings', ox + 15, oy + 16, 'LNS2', 180);
    c.px('l03_acoustic_lens_rings', ox + 16, oy + 16, 'LNS2', 180);
  }
}

export function buildAst007ShadowsRipplesLens(): { canvas: WorldLayerCanvas; doc: ProjectDocument } {
  const c = new WorldLayerCanvas(128, 96, LAYERS);

  // Row 0: Contact Shadows S (12x6), M (18x9), L (30x14), plus (3,0) strictly transparent!
  paintContactShadow(c, 0, 6.0, 3.0);
  paintContactShadow(c, 1, 9.0, 4.5);
  paintContactShadow(c, 2, 14.5, 7.0);

  // Row 1: 4-Frame Shallow-Water Ripples
  for (let col = 0; col < 4; col++) {
    paintWaterRippleFrame(c, col);
  }

  // Row 2: 4-Frame Acoustic Field Lens Harmonic Rings
  for (let col = 0; col < 4; col++) {
    paintAcousticLensRingFrame(c, col);
  }

  const doc = c.toProjectDocument({
    id: 'ast007-shadows-ripples-lens',
    name: 'AST-007: Contact Shadows, Water Ripples & Acoustic Lens VFX (128x96)',
    pivot: { x: 16, y: 16 },
    tileSize: 32,
    styleNotes:
      'Final production AST-007 VFX sheet: Row 0 S/M/L #12161C stepped contact shadows + (3,0) unused transparent; Row 1 4-frame shallow-water footstep ripples; Row 2 4-frame Acoustic Field Lens harmonic resonance pulse rings.',
  });

  return { canvas: c, doc };
}
