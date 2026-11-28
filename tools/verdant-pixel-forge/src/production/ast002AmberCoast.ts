/**
 * AST-002 — Amber Kelp Littoral Ground Tileset (192x128, 12x8 of 16x16)
 * =====================================================================
 * Final Production Artwork authored natively through VERDANT PIXEL FORGE.
 *
 * Strictly obeys docs/asset-production/ASSET_REQUESTS.md v2.0 &
 * game/world/rimlands_tileset_builder.gd + world_chunk_streamer.gd:
 *   - Rows 0..1 Cols 0..7 + Row 2 Cols 0..1 : 18 Dry Sand & Wang Shoreline tiles
 *   - Row 2 Cols 2..7                      : 6 Transparent Beach Decals
 *   - Rows 0..2 Cols 8..11                 : 12 Shallow Tidal Pools & Wet Sandbars
 *   - Rows 3..5 Cols 0..5                  : 18 Stratified 3/4 Coastal Cliff tiles
 *   - Rows 3..4 Cols 6..11                 : 12 Deep Water Shelf & Reef tiles
 *   - Row 5 Cols 6..11                     : 6 EXPLICIT UNUSED TRANSPARENT CELLS
 *   - Rows 6..7 Cols 0..11                 : 12 Horizontal 2-frame Animated Water/Foam pairs
 */

import {
  WorldLayerCanvas,
  hash2i,
  periodicNoise,
  sampleWangField,
  tileClusterField,
} from './worldArtCore';
import type { ProjectDocument } from '../types/studio';

const LAYERS = [
  { id: 'l01_water_and_deep_shelf', name: '01 Water & Deep Shelf' },
  { id: 'l02_sand_ground_wang', name: '02 Sand Ground & Wang Shore' },
  { id: 'l03_shore_foam_pebbles', name: '03 Shore Rims, Ripples & Pebbles' },
  { id: 'l04_coastal_cliffs', name: '04 Coastal Basalt Cliffs' },
  { id: 'l05_beach_decals', name: '05 Beach Decals' },
];

// Exact Wang bitmask (TL=1, TR=2, BL=4, BR=8) matching world_chunk_streamer.gd
const WANG_CELLS: Array<{ col: number; row: number; mask: number }> = [
  { col: 4, row: 0, mask: 8 },  // BR only (NW outer cape)
  { col: 5, row: 0, mask: 12 }, // BL+BR (North shoreline)
  { col: 6, row: 0, mask: 4 },  // BL only (NE outer cape)
  { col: 7, row: 0, mask: 10 }, // TR+BR (West shoreline)
  { col: 0, row: 1, mask: 14 }, // TR+BL+BR (Inner NW cove)
  { col: 1, row: 1, mask: 13 }, // TL+BL+BR (Inner NE cove)
  { col: 2, row: 1, mask: 11 }, // TL+TR+BR (Inner SW cove)
  { col: 3, row: 1, mask: 7 },  // TL+TR+BL (Inner SE cove)
  { col: 4, row: 1, mask: 5 },  // TL+BL (East shoreline)
  { col: 5, row: 1, mask: 2 },  // TR only (SW outer cape)
  { col: 6, row: 1, mask: 3 },  // TL+TR (South shoreline)
  { col: 7, row: 1, mask: 1 },  // TL only (SE outer cape)
  { col: 0, row: 2, mask: 9 },  // TL+BR (Diagonal NW-SE spit)
  { col: 1, row: 2, mask: 6 },  // TR+BL (Diagonal NE-SW spit)
];

function paintCalmSandBase(
  c: WorldLayerCanvas,
  ox: number,
  oy: number,
  seed: number,
  variant: 0 | 1 | 2 | 3
): void {
  // Painterly calm ochre coastal sand (Band 3 low-noise readability law!):
  // Broad horizontal wind-swept swells (`cellSizeX=8, cellSizeY=4`) with ZERO polka-dot blobs
  // or dark ink dots so huge beaches look silky, sunlit, and completely grid-free!
  for (let ly = 0; ly < 16; ly++) {
    for (let lx = 0; lx < 16; lx++) {
      const shared = periodicNoise(lx, ly * 1.5, 8, 2, 17) * 0.65 + periodicNoise(lx, ly, 4, 4, 29) * 0.35;
      const distEdge = Math.min(lx, ly, 15 - lx, 15 - ly);
      const iw = Math.min(1, distEdge / 3.0);
      const local = periodicNoise(lx, ly * 1.5, 8, 2, seed) * 0.6 + periodicNoise(lx, ly, 4, 4, seed + 13) * 0.4;
      const v = shared * (1 - iw * 0.5) + local * (iw * 0.5);

      let tok = 'SND3';
      if (v > 0.65) tok = 'SND4';
      else if (v < 0.12) tok = 'SND2';
      c.px('l02_sand_ground_wang', ox + lx, oy + ly, tok);
    }
  }

  // Variant-specific whisper-soft handcrafted micro-detail (no repeating dark dots!)
  if (variant === 0) {
    // Variant A (55%): Serene velvet ochre sand with one gentle sunlit crest
    c.line('l03_shore_foam_pebbles', ox + 4, oy + 5, ox + 8, oy + 4, 'SND4');
    c.px('l03_shore_foam_pebbles', ox + 6, oy + 4, 'SND5');
    c.line('l03_shore_foam_pebbles', ox + 9, oy + 11, ox + 12, oy + 11, 'SND4');
  } else if (variant === 1) {
    // Variant B (20%): Delicate curved coastal wind ripples (warm sunlit crest + soft SND2 lee)
    const ripples: Array<[number, number, number]> = [
      [2, 4, 5],
      [8, 9, 5],
      [3, 13, 4],
    ];
    for (const [rx, ry, len] of ripples) {
      for (let i = 0; i < len; i++) {
        const yOff = i >= 3 ? 1 : 0;
        c.px('l03_shore_foam_pebbles', ox + rx + i, oy + ry + yOff, i === 1 || i === 2 ? 'SND5' : 'SND4');
        if (i > 0 && i < len - 1) {
          c.px('l03_shore_foam_pebbles', ox + rx + i, oy + ry + yOff + 1, 'SND2');
        }
      }
    }
  } else if (variant === 2) {
    // Variant C (15%): Soft warm coastal pebbles embedded gently in sand (low-contrast, zero polka-dots!)
    const pebs: Array<[number, number]> = [[3, 6], [11, 4], [9, 12]];
    for (const [px, py] of pebs) {
      c.px('l03_shore_foam_pebbles', ox + px, oy + py, 'SND5');
      c.px('l03_shore_foam_pebbles', ox + px + 1, oy + py, 'SND4');
      c.px('l03_shore_foam_pebbles', ox + px + 1, oy + py + 1, 'SND2');
    }
  } else {
    // Variant D (10%): Delicate shell glints & wind-blown crescent hollow
    c.px('l03_shore_foam_pebbles', ox + 4, oy + 6, 'SND5');
    c.px('l03_shore_foam_pebbles', ox + 5, oy + 6, 'SND6');
    c.px('l03_shore_foam_pebbles', ox + 5, oy + 7, 'SND2');
    c.px('l03_shore_foam_pebbles', ox + 11, oy + 10, 'SND5');
    c.px('l03_shore_foam_pebbles', ox + 12, oy + 10, 'SND6');
    c.px('l03_shore_foam_pebbles', ox + 12, oy + 11, 'SND2');
  }
}

function paintWangShoreTile(c: WorldLayerCanvas, col: number, row: number, mask: number): void {
  const ox = col * 16;
  const oy = row * 16;

  // Compute border-continuous signed field on a 18x18 padded grid so we can
  // inspect normal/sunlit direction & distance to shoreline cleanly!
  const field: number[][] = [];
  for (let ly = -1; ly <= 16; ly++) {
    const rArr: number[] = [];
    for (let lx = -1; lx <= 16; lx++) {
      rArr.push(sampleWangField(mask, lx, ly, 42, 0.14));
    }
    field.push(rArr);
  }
  const fAt = (lx: number, ly: number) => field[ly + 1][lx + 1];

  for (let ly = 0; ly < 16; ly++) {
    for (let lx = 0; lx < 16; lx++) {
      const f = fAt(lx, ly);
      if (f < -0.02) continue; // transparent outside curved sand shoreline!

      // Estimate outward shoreline gradient (points toward land)
      const gx = fAt(lx + 1, ly) - fAt(lx - 1, ly);
      const gy = fAt(lx, ly + 1) - fAt(lx, ly - 1);
      // Upper-left (~38°) sun lights south/east-facing embankments? Actually an embankment
      // rising from water to land catches upper-left light on its north-west facing rim (gx+gy > 0)!
      const sunDot = gx * 0.65 + gy * 0.65;
      // Blends identically into calm dry ochre sand base!
      const shared = periodicNoise(lx, ly * 1.5, 8, 2, 17) * 0.65 + periodicNoise(lx, ly, 4, 4, 29) * 0.35;

      if (f < 0.14) {
        // Outer wet shore lip touching turquoise coastal water
        const peb = hash2i(lx + col * 19, ly + row * 31, 611);
        if (sunDot < -0.06) {
          c.px('l02_sand_ground_wang', ox + lx, oy + ly, peb > 0.78 ? 'SND0' : 'SND1');
        } else {
          c.px('l02_sand_ground_wang', ox + lx, oy + ly, peb > 0.82 ? 'SND1' : 'SND2');
        }
      } else if (f < 0.30) {
        // Damp amber-ochre transitional shore band
        if (sunDot > 0.08 && shared > 0.50) {
          c.px('l02_sand_ground_wang', ox + lx, oy + ly, 'SND4');
        } else if (sunDot < -0.08) {
          c.px('l02_sand_ground_wang', ox + lx, oy + ly, 'SND2');
        } else {
          c.px('l02_sand_ground_wang', ox + lx, oy + ly, shared > 0.45 ? 'SND2' : 'SND1');
        }
      } else if (f < 0.44) {
        // Sunlit raised dry beach crest just inland from damp rim!
        c.px(
          'l02_sand_ground_wang',
          ox + lx,
          oy + ly,
          sunDot > 0.05 && shared > 0.46 ? 'SND5' : shared > 0.58 ? 'SND4' : 'SND3'
        );
      } else {
        let tok = 'SND3';
        if (shared > 0.65) tok = 'SND4';
        else if (shared < 0.12) tok = 'SND2';
        c.px('l02_sand_ground_wang', ox + lx, oy + ly, tok);
      }
    }
  }

  // Delicate, broken organic sea-foam kiss right outside the sand curve (never a solid white outline!)
  for (let ly = 0; ly < 16; ly++) {
    for (let lx = 0; lx < 16; lx++) {
      const f = fAt(lx, ly);
      if (f >= -0.02) continue;
      const touchesLand =
        fAt(lx - 1, ly) >= -0.02 ||
        fAt(lx + 1, ly) >= -0.02 ||
        fAt(lx, ly - 1) >= -0.02 ||
        fAt(lx, ly + 1) >= -0.02;
      if (touchesLand && f > -0.17) {
        const wave = Math.sin(lx * 0.7 + ly * 0.55 + 0.9);
        if (wave > 0.12) {
          c.px('l03_shore_foam_pebbles', ox + lx, oy + ly, wave > 0.68 ? 'WAT6' : 'WAT5');
        }
      }
    }
  }
}

function paintTidalPoolsAndWetSandbars(c: WorldLayerCanvas): void {
  // (8,0) & (9,0): Walkable translucent shallow tidal pools (blend smoothly with water!)
  for (let i = 0; i < 2; i++) {
    const ox = (8 + i) * 16;
    const oy = 0;
    for (let ly = 0; ly < 16; ly++) {
      for (let lx = 0; lx < 16; lx++) {
        const cl = tileClusterField(lx, ly, 211 + i * 23);
        const swell = periodicNoise(lx, ly * 2, 4, 4, 301);
        let tok = 'WAT3';
        if (cl > 0.64) tok = 'WAT4';
        else if (cl < 0.26) tok = 'WAT2';
        if (swell > 0.72 && ly % 4 === (i === 0 ? 1 : 2)) tok = 'WAT5';
        c.px('l01_water_and_deep_shelf', ox + lx, oy + ly, tok);
      }
    }
    // Warm submerged sandbars peeking softly beneath crystal-clear shallows
    if (i === 0) {
      c.px('l03_shore_foam_pebbles', ox + 4, oy + 5, 'WAT5');
      c.px('l03_shore_foam_pebbles', ox + 5, oy + 5, 'WAT6');
      c.px('l03_shore_foam_pebbles', ox + 10, oy + 11, 'WAT4');
      c.px('l03_shore_foam_pebbles', ox + 11, oy + 11, 'WAT5');
    } else {
      c.px('l03_shore_foam_pebbles', ox + 6, oy + 4, 'WAT5');
      c.px('l03_shore_foam_pebbles', ox + 7, oy + 4, 'WAT5');
      c.px('l03_shore_foam_pebbles', ox + 3, oy + 10, 'WAT6');
      c.px('l03_shore_foam_pebbles', ox + 11, oy + 8, 'WAT4');
    }
  }

  // (10,0) Wet Dark Sandbar A & (11,0) Wet Sandbar Pebbles
  for (let i = 0; i < 2; i++) {
    const ox = (10 + i) * 16;
    for (let ly = 0; ly < 16; ly++) {
      for (let lx = 0; lx < 16; lx++) {
        const cl = tileClusterField(lx, ly, 409 + i * 19);
        const tok = cl > 0.62 ? 'SND2' : cl < 0.28 ? 'SND0' : 'SND1';
        c.px('l02_sand_ground_wang', ox + lx, ly, tok);
      }
    }
    if (i === 1) {
      // Smooth rounded wet river/tidal pebbles catching sky sheen
      const pebs: Array<[number, number]> = [[4, 4], [10, 6], [6, 11], [12, 12]];
      for (const [px, py] of pebs) {
        c.px('l03_shore_foam_pebbles', ox + px, py, 'RCK4');
        c.px('l03_shore_foam_pebbles', ox + px + 1, py, 'RCK2');
        c.px('l03_shore_foam_pebbles', ox + px, py + 1, 'SND0');
        c.px('l03_shore_foam_pebbles', ox + px + 1, py + 1, 'SND0');
      }
    } else {
      // Subtle shimmering water film streak
      c.line('l03_shore_foam_pebbles', ox + 4, 6, ox + 7, 6, 'WAT5');
      c.line('l03_shore_foam_pebbles', ox + 9, 11, ox + 11, 11, 'WAT4');
    }
  }

  // (8,1)..(11,1) Curved Wet-Sandbar / Tidal-Pool Edges (N, S, W, E)
  // (8,2)..(11,2) Curved Wet-Sandbar / Tidal-Pool Corners (NW, NE, SW, SE)
  const wetMasks: Array<{ col: number; row: number; mask: number }> = [
    { col: 8, row: 1, mask: 12 }, // N edge
    { col: 9, row: 1, mask: 3 },  // S edge
    { col: 10, row: 1, mask: 10 }, // W edge
    { col: 11, row: 1, mask: 5 },  // E edge
    { col: 8, row: 2, mask: 8 },  // NW corner
    { col: 9, row: 2, mask: 4 },  // NE corner
    { col: 10, row: 2, mask: 2 }, // SW corner
    { col: 11, row: 2, mask: 1 }, // SE corner
  ];
  for (const wm of wetMasks) {
    const ox = wm.col * 16;
    const oy = wm.row * 16;
    for (let ly = 0; ly < 16; ly++) {
      for (let lx = 0; lx < 16; lx++) {
        const f = sampleWangField(wm.mask, lx, ly, 77, 0.14);
        if (f < 0) continue;
        const cl = tileClusterField(lx, ly, 409);
        let tok = cl > 0.58 ? 'SND2' : 'SND1';
        if (f < 0.18) tok = 'SND0';
        else if (f < 0.34 && cl > 0.52) tok = 'WAT4';
        c.px('l02_sand_ground_wang', ox + lx, oy + ly, tok);
      }
    }
  }
}

function paintCoastalCliffs(c: WorldLayerCanvas): void {
  // Stratified 3/4 oblique coastal sandstone/basalt rock cliffs (Cols 0..5, Rows 3..5)
  const paintCliffTop = (col: number, row: number, nLip: boolean, wLip: boolean, eLip: boolean, seed: number) => {
    const ox = col * 16;
    const oy = row * 16;
    for (let ly = 0; ly < 16; ly++) {
      for (let lx = 0; lx < 16; lx++) {
        // Organically round NW & NE cliff corners so cliff outcrops feel sculpted by sea wind, not boxed!
        if (nLip && wLip && lx + ly < 4) continue;
        if (nLip && eLip && (15 - lx) + ly < 4) continue;
        if (nLip && ly === 0 && Math.sin(lx * 0.8 + col) < -0.25) continue;

        const cl = tileClusterField(lx, ly, seed);
        const strata = Math.sin(ly * 0.42 + lx * 0.14 + seed) * 0.12;
        const v = cl + strata;
        let tok = v > 0.62 ? 'RCK5' : v < 0.30 ? 'RCK3' : 'RCK4';

        // Sculpted ragged upper sunlit rim + shadow crevices
        const topRim = nLip && ((ly <= 2) || (wLip && lx + ly === 4) || (eLip && (15 - lx) + ly === 4));
        if (topRim) {
          const isOuter = (ly === 0) || (wLip && lx + ly === 4) || (eLip && (15 - lx) + ly === 4) || (ly === 1 && Math.sin(lx * 0.8 + col) < -0.25);
          tok = isOuter ? (eLip && lx > 10 ? 'RCK1' : 'RCK2') : ly <= 2 ? 'RCK6' : 'RCK5';
        } else if (wLip && lx <= 2) {
          tok = lx === 0 ? 'RCK2' : lx === 1 ? 'RCK5' : 'RCK4';
        } else if (eLip && lx >= 13) {
          tok = lx === 15 ? 'RCK1' : lx === 14 ? 'RCK2' : 'RCK3';
        }
        c.px('l04_coastal_cliffs', ox + lx, oy + ly, tok);
      }
    }
    // Delicate natural fracture cracks & salt-lichen touches
    if (!nLip && !wLip && !eLip) {
      c.line('l04_coastal_cliffs', ox + 4, oy + 6, ox + 8, oy + 7, 'RCK2');
      c.line('l04_coastal_cliffs', ox + 4, oy + 5, ox + 8, oy + 6, 'RCK5');
    }
  };

  // Row 3: Top Cap tiles (0,3)..(4,3)
  paintCliffTop(0, 3, true, true, false, 501);  // NW Rim
  paintCliffTop(1, 3, true, false, false, 507); // N Rim
  paintCliffTop(2, 3, true, false, true, 513);  // NE Rim
  paintCliffTop(3, 3, false, false, false, 521); // Plateau Center A
  paintCliffTop(4, 3, false, false, false, 529); // Plateau Center B
  // Small lichen & salt-bleached patch on Plateau B
  c.fillEllipse('l04_coastal_cliffs', 4 * 16 + 7, 3 * 16 + 7, 3.2, 2.2, 'RCK5');
  c.px('l04_coastal_cliffs', 4 * 16 + 6, 3 * 16 + 6, 'RCK6');

  // (5,3) HERO SOLO COASTAL BOULDER OUTCROP (stamped directly on Amber Coast beaches by world_chunk_streamer.gd!)
  {
    const ox = 5 * 16;
    const oy = 3 * 16;
    const clip = { x0: ox, y0: oy, x1: ox + 15, y1: oy + 15 };
    // Subtle feathered sand-collar shadow grounding boulder right into ochre sand
    c.fillEllipse('l04_coastal_cliffs', ox + 8.5, oy + 12.2, 6.8, 2.8, 'SND1', undefined, clip);
    c.fillEllipse('l04_coastal_cliffs', ox + 9.0, oy + 12.6, 5.5, 2.0, 'RCK1', undefined, clip);
    // Primary sculpted irregular stratified coastal boulder (two overlapping faceted masses!)
    c.paintShadedBlob(
      'l04_coastal_cliffs',
      ox + 7.2,
      oy + 8.4,
      5.4,
      4.8,
      ['RCK0', 'RCK1', 'RCK2', 'RCK3', 'RCK4', 'RCK5', 'RCK6'],
      641,
      clip,
      { wobble: 0.16, contrast: 1.15, lightBias: 0.04 }
    );
    // Smaller tucked secondary flank rock to the right
    c.paintShadedBlob(
      'l04_coastal_cliffs',
      ox + 11.4,
      oy + 10.6,
      3.1,
      2.6,
      ['RCK0', 'RCK1', 'RCK2', 'RCK3', 'RCK4', 'RCK5'],
      653,
      clip,
      { wobble: 0.14, contrast: 1.05, lightBias: -0.06 }
    );
    // Crisp sunlit sandstone ridge & deep oblique fracture crevice!
    c.line('l04_coastal_cliffs', ox + 4, oy + 6, ox + 8, oy + 5, 'RCK6');
    c.line('l04_coastal_cliffs', ox + 5, oy + 9, ox + 9, oy + 8, 'RCK1');
    c.line('l04_coastal_cliffs', ox + 5, oy + 10, ox + 8, oy + 9, 'RCK4');
    // Tiny salt-lichen moss speck tucked on sunlit upper flank
    c.px('l04_coastal_cliffs', ox + 4, oy + 8, 'MOS5');
    c.px('l04_coastal_cliffs', ox + 5, oy + 8, 'MOS6');
  }

  // Row 4: Mid / Inner Corners (0,4)..(5,4)
  paintCliffTop(0, 4, false, true, false, 541);  // W Rim
  paintCliffTop(1, 4, false, false, false, 547); // Center C
  paintCliffTop(2, 4, false, false, true, 557);  // E Rim
  // (3,4) Inner NW & (4,4) Inner NE & (5,4) Side Pillar Mid
  paintCliffTop(3, 4, false, false, false, 563);
  c.fillRect('l04_coastal_cliffs', 3 * 16, 4 * 16, 4, 4, 'RCK1');
  c.line('l04_coastal_cliffs', 3 * 16 + 4, 4 * 16, 3 * 16 + 4, 4 * 16 + 4, 'RCK5');
  paintCliffTop(4, 4, false, false, false, 569);
  c.fillRect('l04_coastal_cliffs', 4 * 16 + 12, 4 * 16, 4, 4, 'RCK1');
  c.line('l04_coastal_cliffs', 4 * 16 + 11, 4 * 16, 4 * 16 + 11, 4 * 16 + 4, 'RCK2');
  paintCliffTop(5, 4, false, true, true, 577);

  // Row 5: South Vertical Stratified Cliff Faces (0,5)..(5,5)
  for (let col = 0; col < 6; col++) {
    const ox = col * 16;
    const oy = 5 * 16;
    if (col === 4) {
      // (4,5) Base Shadow Fringe (transparent soft rocky cliff-foot shadow)
      for (let ly = 0; ly < 7; ly++) {
        for (let lx = 0; lx < 16; lx++) {
          const edge = 4 + Math.round(Math.sin(lx * 0.5) * 1.4);
          if (ly < edge) {
            c.px('l04_coastal_cliffs', ox + lx, oy + ly, ly < 2 ? 'RCK0' : 'RCK1', ly < 2 ? 190 : 115);
          }
        }
      }
      continue;
    }

    for (let ly = 0; ly < 16; ly++) {
      for (let lx = 0; lx < 16; lx++) {
        if (col === 0 && lx === 0 && ly >= 12) continue;
        if (col === 3 && lx === 15 && ly >= 12) continue;
        if (col === 5 && (lx < 3 || lx > 12)) continue; // Narrow rock notch pillar

        // Irregular organic upper overhanging sandstone ledge (breaks rigid straight top bar!)
        const ledgeH = 2 + Math.round((Math.sin(lx * 0.55 + col * 2.1) * 0.5 + 0.5) * 1.4);
        if (ly < ledgeH) {
          const lip = periodicNoise(lx + col * 11, ly, 3, 8, 601);
          c.px('l04_coastal_cliffs', ox + lx, oy + ly, ly === 0 ? 'RCK5' : lip > 0.5 ? 'RCK6' : 'RCK4');
        } else if (ly === ledgeH) {
          // Crisp under-lip occlusion shadow
          c.px('l04_coastal_cliffs', ox + lx, oy + ly, 'RCK1');
        } else if (ly >= 14) {
          // Grounded dark cliff foot meeting sand
          c.px('l04_coastal_cliffs', ox + lx, oy + ly, ly === 15 ? 'RCK0' : 'RCK1');
        } else {
          // Sculpted chunky stratified sandstone/basalt blocks (irregular fissures, NOT zebra stripes!)
          const slab = periodicNoise(lx + col * 7, ly * 0.45, 4, 8, 619 + col * 13);
          const horizStrata = (ly === 8 || ly === 12) && periodicNoise(lx, ly, 3, 8, 631) > 0.42;
          const v = slab - (ly - 4) * 0.025 + (lx < 4 && col === 0 ? 0.14 : 0) - (lx > 11 && col === 3 ? 0.18 : 0);
          let tok = 'RCK3';
          if (horizStrata) tok = 'RCK1';
          else if (v > 0.64) tok = 'RCK4';
          else if (v < 0.28) tok = 'RCK1';
          else if (v < 0.44) tok = 'RCK2';
          if (ly === 9 && periodicNoise(lx, ly, 3, 8, 631) > 0.54) tok = 'RCK4'; // sunlit strata lip!
          if (col === 0 && lx === 0) tok = 'RCK1';
          if (col === 3 && lx === 15) tok = 'RCK0';
          c.px('l04_coastal_cliffs', ox + lx, oy + ly, tok);
        }
      }
    }
  }
}

function paintDeepWaterShelf(c: WorldLayerCanvas): void {
  // Rows 3..4, Cols 6..11: Deep Water Shelf & Submerged Reefs
  for (let row = 3; row <= 4; row++) {
    for (let col = 6; col <= 11; col++) {
      const ox = col * 16;
      const oy = row * 16;
      for (let ly = 0; ly < 16; ly++) {
        for (let lx = 0; lx < 16; lx++) {
          const swell = tileClusterField(lx, ly, 701 + col * 7 + row * 13);
          let tok = swell > 0.64 ? 'WAT2' : swell < 0.25 ? 'WAT0' : 'WAT1';
          // Shelf drop-off edge gradients
          if (row === 3 && col === 8 && ly < 4) tok = ly < 2 ? 'WAT3' : 'WAT2';
          if (row === 3 && col === 9 && ly > 11) tok = ly > 13 ? 'WAT3' : 'WAT2';
          if (row === 3 && col === 10 && lx < 4) tok = lx < 2 ? 'WAT3' : 'WAT2';
          if (row === 3 && col === 11 && lx > 11) tok = lx > 13 ? 'WAT3' : 'WAT2';
          if (row === 4 && col === 6 && lx + ly < 7) tok = 'WAT2';
          if (row === 4 && col === 7 && (15 - lx) + ly < 7) tok = 'WAT2';
          if (row === 4 && col === 8 && lx + (15 - ly) < 7) tok = 'WAT2';
          if (row === 4 && col === 9 && (15 - lx) + (15 - ly) < 7) tok = 'WAT2';
          c.px('l01_water_and_deep_shelf', ox + lx, oy + ly, tok);
        }
      }
      // Subtle submerged kelp/coral reef silhouettes on (10,4) and (11,4)
      if (row === 4 && (col === 10 || col === 11)) {
        const clip = { x0: ox + 1, y0: oy + 1, x1: ox + 14, y1: oy + 14 };
        c.fillEllipse('l01_water_and_deep_shelf', ox + 7, oy + 9, 4.5, 3.0, 'WAT0', undefined, clip);
        c.fillEllipse('l01_water_and_deep_shelf', ox + 10, oy + 6, 3.2, 2.2, 'WAT2', undefined, clip);
        c.px('l03_shore_foam_pebbles', ox + 6, oy + 7, 'WAT3');
        c.px('l03_shore_foam_pebbles', ox + 7, oy + 7, 'WAT4');
      }
    }
  }
}

function paintAnimatedWaterAndFoam(c: WorldLayerCanvas): void {
  // Rows 6..7: 12 Horizontal 2-frame Animated Water & Foam pairs!
  // Pair 0 (0,6)+(1,6): Shallow Shimmer A
  // Pair 1 (2,6)+(3,6): Shallow Shimmer B (seamless neighbor with Pair 0!)
  // Pair 2 (4,6)+(5,6): Deep Water Swell
  // Pairs 3..10: N/S/W/E & NW/NE/SW/SE Shore Sea-Foam Lapping
  // Pair 11 (10,7)+(11,7): Tidal Pool Gentle Shimmer
  const paintWaterFrame = (
    col: number,
    row: number,
    frame: 0 | 1,
    deep: boolean,
    variantShift: number,
    foamSide?: 'N' | 'S' | 'W' | 'E' | 'NW' | 'NE' | 'SW' | 'SE' | 'POOL'
  ) => {
    const ox = col * 16;
    const oy = row * 16;
    const shiftX = frame * 2;
    const shiftY = frame === 1 ? 1 : 0;

    for (let ly = 0; ly < 16; ly++) {
      for (let lx = 0; lx < 16; lx++) {
        // Silky calm coastal water — serene horizontal swells (ZERO dotted tile grid on wide ocean!)
        const sx = (lx + shiftX) & 15;
        const w1 = Math.sin((sx / 16) * Math.PI * 2 + (ly / 16) * Math.PI * 2);
        const w2 = Math.sin((ly / 16) * Math.PI * 4 - (sx / 16) * Math.PI * 2);
        const sw = periodicNoise(sx, ly, 4, 4, deep ? 811 : 809);
        const v = sw * 0.45 + (w1 * 0.25 + w2 * 0.25 + 0.5) * 0.55;

        let tok = deep ? 'WAT1' : 'WAT3';
        if (deep) {
          // Keep deep ocean calm, vast & low-contrast (Band 3 calm ground law!)
          if (v < 0.22) tok = 'WAT0';
        } else {
          if (v > 0.68) tok = 'WAT4';
          else if (v < 0.18) tok = 'WAT2';
        }
        c.px('l01_water_and_deep_shelf', ox + lx, oy + ly, tok);
      }
    }

    // Painterly horizontal sky-reflection shimmer streaks (delicate, staggered, zero polka-dots!)
    const streaks: Array<[number, number, number, string]> = deep
      ? [
          [1 + shiftX, 3, 5, 'WAT2'],
          [8 + shiftX, 9, 6, 'WAT2'],
          [3 + shiftX, 14, 5, 'WAT0'],
        ]
      : variantShift === 0
        ? [
            [2 + shiftX, 3, 4, 'WAT4'],
            [3 + shiftX, 3, 2, 'WAT5'],
            [9 + shiftX, 10, 4, 'WAT4'],
            [4 + shiftX, 14, 3, 'WAT2'],
          ]
        : [
            [8 + shiftX, 5, 4, 'WAT4'],
            [9 + shiftX, 5, 2, 'WAT5'],
            [2 + shiftX, 11, 4, 'WAT4'],
            [11 + shiftX, 14, 3, 'WAT2'],
          ];

    for (const [rx, ry, len, tok] of streaks) {
      for (let i = 0; i < len; i++) {
        c.px('l03_shore_foam_pebbles', ox + ((rx + i) & 15), oy + (ry & 15), tok);
      }
    }

    // Scalloped 2-frame lapping coastal sea-foam ribbons
    if (foamSide && foamSide !== 'POOL') {
      const lap = frame === 0 ? 0 : 1;
      for (let ly = 0; ly < 16; ly++) {
        for (let lx = 0; lx < 16; lx++) {
          let dist = 99;
          const wave = Math.sin((lx + ly + frame * 3) * 0.6) * 0.8;
          if (foamSide === 'N') dist = ly - lap + wave;
          else if (foamSide === 'S') dist = 15 - ly - lap + wave;
          else if (foamSide === 'W') dist = lx - lap + wave;
          else if (foamSide === 'E') dist = 15 - lx - lap + wave;
          else if (foamSide === 'NW') dist = Math.hypot(lx, ly) - 2 - lap + wave;
          else if (foamSide === 'NE') dist = Math.hypot(15 - lx, ly) - 2 - lap + wave;
          else if (foamSide === 'SW') dist = Math.hypot(lx, 15 - ly) - 2 - lap + wave;
          else if (foamSide === 'SE') dist = Math.hypot(15 - lx, 15 - ly) - 2 - lap + wave;

          if (dist >= 0 && dist < 1.3) {
            c.px('l03_shore_foam_pebbles', ox + lx, oy + ly, dist < 0.7 ? 'WAT7' : 'WAT6');
          } else if (dist >= 1.3 && dist < 2.6) {
            c.px('l03_shore_foam_pebbles', ox + lx, oy + ly, 'WAT5');
          }
        }
      }
    } else if (foamSide === 'POOL') {
      // Gentle tidal-pool sky glint pulsing softly
      c.line('l03_shore_foam_pebbles', ox + 4 + frame, oy + 5, ox + 7 + frame, oy + 5, 'WAT6');
      c.px('l03_shore_foam_pebbles', ox + 5 + frame, oy + 5, 'WAT7');
      c.line('l03_shore_foam_pebbles', ox + 8 - frame, oy + 11, ox + 11 - frame, oy + 11, 'WAT5');
    }
  };

  paintWaterFrame(0, 6, 0, false, 0);
  paintWaterFrame(1, 6, 1, false, 0);
  paintWaterFrame(2, 6, 0, false, 5);
  paintWaterFrame(3, 6, 1, false, 5);
  paintWaterFrame(4, 6, 0, true, 0);
  paintWaterFrame(5, 6, 1, true, 0);

  paintWaterFrame(6, 6, 0, false, 0, 'N');
  paintWaterFrame(7, 6, 1, false, 0, 'N');
  paintWaterFrame(8, 6, 0, false, 0, 'S');
  paintWaterFrame(9, 6, 1, false, 0, 'S');
  paintWaterFrame(10, 6, 0, false, 0, 'W');
  paintWaterFrame(11, 6, 1, false, 0, 'W');

  paintWaterFrame(0, 7, 0, false, 0, 'E');
  paintWaterFrame(1, 7, 1, false, 0, 'E');
  paintWaterFrame(2, 7, 0, false, 0, 'NW');
  paintWaterFrame(3, 7, 1, false, 0, 'NW');
  paintWaterFrame(4, 7, 0, false, 0, 'NE');
  paintWaterFrame(5, 7, 1, false, 0, 'NE');
  paintWaterFrame(6, 7, 0, false, 0, 'SW');
  paintWaterFrame(7, 7, 1, false, 0, 'SW');
  paintWaterFrame(8, 7, 0, false, 0, 'SE');
  paintWaterFrame(9, 7, 1, false, 0, 'SE');
  paintWaterFrame(10, 7, 0, false, 2, 'POOL');
  paintWaterFrame(11, 7, 1, false, 2, 'POOL');
}

function paintBeachDecals(c: WorldLayerCanvas): void {
  const oy = 2 * 16;

  // (2,2) Pearlescent Tide Shells
  {
    const ox = 2 * 16;
    // Spiral shell A
    c.px('l05_beach_decals', ox + 4, oy + 6, 'SND6');
    c.px('l05_beach_decals', ox + 5, oy + 5, 'SND6');
    c.px('l05_beach_decals', ox + 6, oy + 6, 'SND5');
    c.px('l05_beach_decals', ox + 5, oy + 6, 'SND4');
    c.px('l05_beach_decals', ox + 5, oy + 7, 'SND1');
    c.px('l05_beach_decals', ox + 6, oy + 7, 'SND1');
    // Tiny clam shell B
    c.px('l05_beach_decals', ox + 10, oy + 10, 'SND6');
    c.px('l05_beach_decals', ox + 11, oy + 10, 'SND5');
    c.px('l05_beach_decals', ox + 10, oy + 11, 'SND2');
    c.px('l05_beach_decals', ox + 11, oy + 11, 'SND1');
    // Micro shell speck
    c.px('l05_beach_decals', ox + 9, oy + 6, 'SND6');
  }

  // (3,2) Washed Golden Amber Kelp Ribbon
  {
    const ox = 3 * 16;
    const pts: Array<[number, number, string, string]> = [
      [3, 9, 'KLP2', 'KLP0'],
      [4, 8, 'KLP3', 'KLP1'],
      [5, 8, 'KLP4', 'KLP2'],
      [6, 9, 'KLP3', 'KLP1'],
      [7, 9, 'KLP2', 'KLP0'],
      [8, 8, 'KLP3', 'KLP1'],
      [9, 7, 'KLP4', 'KLP2'],
      [10, 7, 'KLP3', 'KLP1'],
      [11, 8, 'KLP2', 'KLP0'],
      [12, 8, 'KLP1', 'SND1'],
    ];
    for (const [dx, dy, top, bot] of pts) {
      c.px('l05_beach_decals', ox + dx, oy + dy, top);
      c.px('l05_beach_decals', ox + dx, oy + dy + 1, bot);
      c.px('l05_beach_decals', ox + dx, oy + dy + 2, 'SND1');
    }
  }

  // (4,2) Salt-Bleached Driftwood Branch
  {
    const ox = 4 * 16;
    c.line('l05_beach_decals', ox + 3, oy + 9, ox + 12, oy + 7, 'RED6');
    c.line('l05_beach_decals', ox + 3, oy + 10, ox + 12, oy + 8, 'RED4');
    c.line('l05_beach_decals', ox + 4, oy + 11, ox + 12, oy + 9, 'RED1');
    // Small weathered fork twig
    c.line('l05_beach_decals', ox + 8, oy + 7, ox + 10, oy + 5, 'RED5');
    c.px('l05_beach_decals', ox + 9, oy + 6, 'RED3');
    c.px('l05_beach_decals', ox + 3, oy + 10, 'SND1');
  }

  // (5,2) Reflective Tidal Mirror Puddle
  {
    const ox = 5 * 16;
    const clip = { x0: ox + 1, y0: oy + 1, x1: ox + 14, y1: oy + 14 };
    c.fillEllipse('l05_beach_decals', ox + 8, oy + 8.5, 5.2, 3.2, 'SND1', undefined, clip);
    c.fillEllipse('l05_beach_decals', ox + 8, oy + 8.3, 4.3, 2.5, 'WAT3', undefined, clip);
    c.fillEllipse('l05_beach_decals', ox + 7.2, oy + 7.8, 2.8, 1.4, 'WAT5', undefined, clip);
    c.line('l05_beach_decals', ox + 6, oy + 7, ox + 8, oy + 7, 'WAT6');
    c.px('l05_beach_decals', ox + 6, oy + 7, 'WAT7');
  }

  // (6,2) Coastal Basalt Pebble Cluster
  {
    const ox = 6 * 16;
    // Main pebble
    c.px('l05_beach_decals', ox + 5, oy + 6, 'RCK5');
    c.px('l05_beach_decals', ox + 6, oy + 6, 'RCK4');
    c.px('l05_beach_decals', ox + 5, oy + 7, 'RCK3');
    c.px('l05_beach_decals', ox + 6, oy + 7, 'RCK2');
    c.px('l05_beach_decals', ox + 6, oy + 8, 'SND1');
    c.px('l05_beach_decals', ox + 7, oy + 7, 'SND1');
    // Secondary pebble
    c.px('l05_beach_decals', ox + 10, oy + 9, 'RCK5');
    c.px('l05_beach_decals', ox + 11, oy + 9, 'RCK3');
    c.px('l05_beach_decals', ox + 10, oy + 10, 'RCK2');
    c.px('l05_beach_decals', ox + 11, oy + 10, 'SND1');
    // Micro warm stone
    c.px('l05_beach_decals', ox + 7, oy + 11, 'SND5');
    c.px('l05_beach_decals', ox + 8, oy + 11, 'SND1');
  }

  // (7,2) Sunlit Wind-Sculpted Sand Drift
  {
    const ox = 7 * 16;
    c.line('l05_beach_decals', ox + 3, oy + 6, ox + 11, oy + 5, 'SND5');
    c.line('l05_beach_decals', ox + 4, oy + 7, ox + 12, oy + 6, 'SND2');
    c.line('l05_beach_decals', ox + 5, oy + 10, ox + 11, oy + 9, 'SND5');
    c.line('l05_beach_decals', ox + 6, oy + 11, ox + 12, oy + 10, 'SND2');
  }
}

export function buildAst002AmberCoast(): { canvas: WorldLayerCanvas; doc: ProjectDocument } {
  const c = new WorldLayerCanvas(192, 128, LAYERS);

  // 1. 4 Seamless Calm Dry Ochre Sand Base Variants (0,0)..(3,0)
  paintCalmSandBase(c, 0, 0, 101, 0);
  paintCalmSandBase(c, 16, 0, 113, 1);
  paintCalmSandBase(c, 32, 0, 127, 2);
  paintCalmSandBase(c, 48, 0, 139, 3);

  // 2. 14 Curved Wang 4-Corner Shoreline Tiles
  for (const cell of WANG_CELLS) {
    paintWangShoreTile(c, cell.col, cell.row, cell.mask);
  }

  // 3. 12 Shallow Tidal Pools & Wet Sandbars (Cols 8..11, Rows 0..2)
  paintTidalPoolsAndWetSandbars(c);

  // 4. 18 Stratified 3/4 Coastal Cliff Tiles (Cols 0..5, Rows 3..5)
  paintCoastalCliffs(c);

  // 5. 12 Deep Water Shelf & Submerged Reef Tiles (Cols 6..11, Rows 3..4)
  paintDeepWaterShelf(c);

  // 6. 12 Horizontal 2-Frame Animated Water & Foam Pairs (Rows 6..7)
  paintAnimatedWaterAndFoam(c);

  // 7. 6 Handcrafted Beach Decals (2,2)..(7,2)
  paintBeachDecals(c);

  // 8. Enforce 6 EXPLICITLY UNUSED / TRANSPARENT CELLS: (6,5)..(11,5)
  for (const layer of LAYERS) {
    c.clearRect(layer.id, 6 * 16, 5 * 16, 6 * 16, 16);
  }

  const doc = c.toProjectDocument({
    id: 'ast002-amber-coast-tileset',
    name: 'AST-002: Amber Kelp Littoral Ground Tileset (192x128)',
    pivot: { x: 8, y: 8 },
    tileSize: 16,
    styleNotes:
      'Final production AST-002 tileset: 18 seamless Wang ochre sand & curved shoreline tiles, 6 beach decals, 12 tidal pools/wet sandbars, 18 stratified coastal basalt cliffs, 12 deep-water shelf/reef tiles, 6 explicit transparent unused cells (6,5)..(11,5), and 12 horizontal 2-frame animated coastal water/foam pairs.',
  });

  return { canvas: c, doc };
}
