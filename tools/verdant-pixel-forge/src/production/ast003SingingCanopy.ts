/**
 * AST-003 — Singing Reedwood Canopy Ground Tileset (192x96, 12x6 of 16x16)
 * ========================================================================
 * Final Production Artwork authored natively through VERDANT PIXEL FORGE.
 *
 * Strictly obeys docs/asset-production/ASSET_REQUESTS.md v2.0 &
 * game/world/rimlands_tileset_builder.gd + world_chunk_streamer.gd:
 *   - Zone A (Rows 0..1 Cols 0..7 + Row 2 Cols 0..1): 18 Olive-Sage Moss & Ragged Ecotone Wang tiles
 *   - Zone C (Row 2 Cols 2..7)                      : 6 Transparent Forest Floor Decals
 *   - Zone B (Rows 0..3 Cols 8..11)                 : 16 Complete 4-bit Cardinal Root-Lined Dirt Trails
 *   - Zone D (Rows 3..5 Cols 0..5)                  : 18 Mossy Root-Bank Terrace Cliffs
 *   - Zone E (Rows 3..5 Cols 6..7 + Rows 4..5 8..11): 6 Forest Creek Moss Banks + 4 Animated 2-frame Stream Pairs
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
  { id: 'l01_creek_water_anim', name: '01 Forest Creek & Banks' },
  { id: 'l02_moss_floor_wang', name: '02 Moss Floor & Ragged Ecotone' },
  { id: 'l03_grass_blades_dapple', name: '03 Painterly Grass Tufts & Dapple' },
  { id: 'l04_dirt_footpaths_4bit', name: '04 4-Bit Root-Lined Footpaths' },
  { id: 'l05_moss_terraces_decals', name: '05 Moss Terraces & Forest Decals' },
];

const WANG_CELLS: Array<{ col: number; row: number; mask: number }> = [
  { col: 4, row: 0, mask: 8 },  // BR only
  { col: 5, row: 0, mask: 12 }, // BL+BR (N edge)
  { col: 6, row: 0, mask: 4 },  // BL only
  { col: 7, row: 0, mask: 10 }, // TR+BR (W edge)
  { col: 0, row: 1, mask: 14 }, // TR+BL+BR (Inner NW)
  { col: 1, row: 1, mask: 13 }, // TL+BL+BR (Inner NE)
  { col: 2, row: 1, mask: 11 }, // TL+TR+BR (Inner SW)
  { col: 3, row: 1, mask: 7 },  // TL+TR+BL (Inner SE)
  { col: 4, row: 1, mask: 5 },  // TL+BL (E edge)
  { col: 5, row: 1, mask: 2 },  // TR only
  { col: 6, row: 1, mask: 3 },  // TL+TR (S edge)
  { col: 7, row: 1, mask: 1 },  // TL only
  { col: 0, row: 2, mask: 9 },  // TL+BR (Diagonal NW-SE)
  { col: 1, row: 2, mask: 6 },  // TR+BL (Diagonal NE-SW)
];

function paintCalmMossBase(
  c: WorldLayerCanvas,
  ox: number,
  oy: number,
  seed: number,
  variant: 0 | 1 | 2 | 3
): void {
  // Painterly olive-sage meadow/moss ground directly inspired by the moose-meadow reference:
  // Broad calm MOS5 (#6F8A68) & MOS4 (#587856) volume sweeps with ZERO polka-dot center ellipses!
  for (let ly = 0; ly < 16; ly++) {
    for (let lx = 0; lx < 16; lx++) {
      const shared = periodicNoise(lx, ly * 1.3, 8, 2, 31) * 0.65 + periodicNoise(lx, ly, 4, 4, 47) * 0.35;
      const distEdge = Math.min(lx, ly, 15 - lx, 15 - ly);
      const iw = Math.min(1, distEdge / 3.0);
      const local = periodicNoise(lx, ly * 1.3, 8, 2, seed) * 0.6 + periodicNoise(lx, ly, 4, 4, seed + 17) * 0.4;
      const v = shared * (1 - iw * 0.5) + local * (iw * 0.5);

      let tok = 'MOS5';
      if (v > 0.66) tok = 'MOS6';
      else if (v < 0.24) tok = 'MOS4';
      c.px('l02_moss_floor_wang', ox + lx, oy + ly, tok);
    }
  }

  // Handcrafted painterly 2-3px vertical grass blades (asymmetric & off-center across variants — ZERO grid rhythm!)
  const paintBlade = (tx: number, ty: number, sunlit: boolean) => {
    c.px('l03_grass_blades_dapple', ox + tx, oy + ty + 1, 'MOS4');
    c.px('l03_grass_blades_dapple', ox + tx, oy + ty, sunlit ? 'MOS7' : 'MOS6');
    c.px('l03_grass_blades_dapple', ox + tx + 1, oy + ty + 1, 'MOS3');
    if (sunlit) {
      c.px('l03_grass_blades_dapple', ox + tx, oy + ty - 1, 'MOS8');
      c.px('l03_grass_blades_dapple', ox + tx - 1, oy + ty, 'MOS6');
    }
  };

  if (variant === 0) {
    // Variant A (50%): Calm open meadow olive-sage with 2 subtle natural grass blades
    paintBlade(3, 5, false);
    paintBlade(12, 11, false);
  } else if (variant === 1) {
    // Variant B (25%): Subtle diagonal sun-dappled meadow grass blades (NO circular spotlight!)
    c.line('l03_grass_blades_dapple', ox + 4, oy + 5, ox + 9, oy + 4, 'MOS6');
    c.line('l03_grass_blades_dapple', ox + 5, oy + 6, ox + 10, oy + 5, 'MOS6');
    paintBlade(5, 4, true);
    paintBlade(11, 10, false);
    paintBlade(2, 12, false);
  } else if (variant === 2) {
    // Variant C (15%): Cool dappled turf trough + sunlit grass tufts + tiny moss blossom
    c.line('l03_grass_blades_dapple', ox + 5, oy + 9, ox + 11, oy + 8, 'MOS4');
    c.line('l03_grass_blades_dapple', ox + 6, oy + 10, ox + 10, oy + 9, 'MOS3');
    paintBlade(4, 4, true);
    paintBlade(12, 6, false);
    c.px('l03_grass_blades_dapple', ox + 9, oy + 12, 'MOS8');
  } else {
    // Variant D (10%): Weathered mossy woodland pebble nestled among sunlit blades
    paintBlade(4, 5, true);
    c.px('l03_grass_blades_dapple', ox + 10, oy + 10, 'RCK5');
    c.px('l03_grass_blades_dapple', ox + 11, oy + 10, 'RCK4');
    c.px('l03_grass_blades_dapple', ox + 10, oy + 11, 'RCK2');
    c.px('l03_grass_blades_dapple', ox + 11, oy + 11, 'MOS2');
    paintBlade(9, 11, false);
  }
}

function paintRaggedMossEcotoneTile(c: WorldLayerCanvas, col: number, row: number, mask: number): void {
  const ox = col * 16;
  const oy = row * 16;

  // Border-continuous Wang signed field with organic grass-tuft overhang along the sand ecotone!
  const field: number[][] = [];
  for (let ly = -1; ly <= 16; ly++) {
    const rArr: number[] = [];
    for (let lx = -1; lx <= 16; lx++) {
      // Slightly higher organic wobble for lush mossy peninsula fingers creeping onto Amber Coast sand!
      rArr.push(sampleWangField(mask, lx, ly, 67, 0.22));
    }
    field.push(rArr);
  }
  const fAt = (lx: number, ly: number) => field[ly + 1][lx + 1];

  for (let ly = 0; ly < 16; ly++) {
    for (let lx = 0; lx < 16; lx++) {
      const f = fAt(lx, ly);
      const shared = periodicNoise(lx, ly * 1.3, 8, 2, 31) * 0.65 + periodicNoise(lx, ly, 4, 4, 47) * 0.35;
      const tuftMod = (Math.sin(lx * 2.1 + Math.cos(ly * 1.4)) * 0.5 + 0.5) * 0.14;
      const eff = f + tuftMod - 0.06;
      if (eff < 0) continue;

      const gx = fAt(lx + 1, ly) - fAt(lx - 1, ly);
      const gy = fAt(lx, ly + 1) - fAt(lx, ly - 1);
      const sunDot = gx * 0.65 + gy * 0.65;

      if (eff < 0.15) {
        if (sunDot < -0.05) {
          c.px('l02_moss_floor_wang', ox + lx, oy + ly, shared > 0.5 ? 'MOS3' : 'MOS2');
        } else {
          c.px('l02_moss_floor_wang', ox + lx, oy + ly, shared > 0.52 ? 'MOS7' : 'MOS4');
        }
      } else if (eff < 0.34) {
        if (sunDot > 0.06 && shared > 0.48) {
          c.px('l02_moss_floor_wang', ox + lx, oy + ly, 'MOS7');
        } else if (sunDot < -0.06) {
          c.px('l02_moss_floor_wang', ox + lx, oy + ly, 'MOS4');
        } else {
          c.px('l02_moss_floor_wang', ox + lx, oy + ly, shared > 0.5 ? 'MOS6' : 'MOS5');
        }
      } else {
        let tok = 'MOS5';
        if (shared > 0.66) tok = 'MOS6';
        else if (shared < 0.24) tok = 'MOS4';
        c.px('l02_moss_floor_wang', ox + lx, oy + ly, tok);
      }
    }
  }
}

function paintFourBitFootpaths(c: WorldLayerCanvas): void {
  // Complete 16-tile 4-bit cardinal mask (N=1, E=2, S=4, W=8) in Cols 8..11, Rows 0..3
  // Exact mapping verified in world_chunk_streamer.gd: col = 8 + (bits & 3), row = bits >> 2
  for (let bits = 0; bits < 16; bits++) {
    const col = 8 + (bits & 3);
    const row = bits >> 2;
    const ox = col * 16;
    const oy = row * 16;
    const hasN = (bits & 1) !== 0;
    const hasE = (bits & 2) !== 0;
    const hasS = (bits & 4) !== 0;
    const hasW = (bits & 8) !== 0;

    for (let ly = 0; ly < 16; ly++) {
      for (let lx = 0; lx < 16; lx++) {
        // Smooth distance to the nearest connected road segment!
        // Center hub circle at (7.5, 7.5), plus straight cardinal arms matching edges identically!
        const cx = 7.5;
        const cy = 7.5;
        let d = Math.hypot(lx - cx, ly - cy);

        if (hasN && ly <= cy) d = Math.min(d, Math.abs(lx - cx));
        if (hasS && ly >= cy) d = Math.min(d, Math.abs(lx - cx));
        if (hasW && lx <= cx) d = Math.min(d, Math.abs(ly - cy));
        if (hasE && lx >= cx) d = Math.min(d, Math.abs(ly - cy));

        // Border-safe organic edge irregularity (zero distortion right at arm ends so joins match 100%!)
        const edgeFade = Math.min(lx, ly, 15 - lx, 15 - ly) / 3.0;
        const wob = (periodicNoise(lx, ly, 3, 8, 907 + bits * 5) - 0.5) * 1.45 * Math.min(1, edgeFade);
        const effD = d + wob;

        if (effD > 5.4) continue; // transparent outside root-lined trail!

        const n = tileClusterField(lx, ly, 433);
        if (effD <= 3.2) {
          // Packed golden-ochre worn trail heart (soft, painterly, organic!)
          let tok = 'SND3';
          if (n > 0.64 && effD < 2.3) tok = 'SND4';
          else if (n < 0.28) tok = 'SND2';
          if (hash2i(lx + bits * 13, ly + bits * 7, 1009) > 0.94 && effD < 2.2) {
            tok = 'SND5';
          }
          c.px('l04_dirt_footpaths_4bit', ox + lx, oy + ly, tok);
        } else if (effD <= 4.4) {
          // Natural damp earth verge transitioning softly toward mossy turf
          const litRim = (lx < cx || ly < cy) && n > 0.45;
          c.px('l04_dirt_footpaths_4bit', ox + lx, oy + ly, litRim ? 'SND2' : 'SND1');
        } else {
          // Soft feathery moss tufts & subtle forest root accents (no heavy cartoon border!)
          const rootHash = hash2i(lx, ly, 1117 + bits * 3);
          const tok = rootHash > 0.62 ? 'MOS4' : rootHash > 0.28 ? 'MOS3' : 'RED2';
          c.px('l04_dirt_footpaths_4bit', ox + lx, oy + ly, tok);
        }
      }
    }
  }
}

function paintMossTerraces(c: WorldLayerCanvas): void {
  // Rows 3..5, Cols 0..5: 18 Mossy Root-Bank Terrace Cliffs (mirroring AST-002 cliff topology!)
  const paintTerraceTop = (col: number, row: number, nLip: boolean, wLip: boolean, eLip: boolean, seed: number) => {
    const ox = col * 16;
    const oy = row * 16;
    for (let ly = 0; ly < 16; ly++) {
      for (let lx = 0; lx < 16; lx++) {
        // Organically curved mossy bank corners
        if (nLip && wLip && lx + ly < 4) continue;
        if (nLip && eLip && (15 - lx) + ly < 4) continue;
        if (nLip && ly === 0 && Math.sin(lx * 0.9 + col) < -0.2) continue;

        const cl = tileClusterField(lx, ly, seed);
        let tok = cl > 0.64 ? 'MOS6' : cl < 0.26 ? 'MOS4' : 'MOS5';
        const topRim = nLip && ((ly <= 2) || (wLip && lx + ly === 4) || (eLip && (15 - lx) + ly === 4));
        if (topRim) {
          const isOuter = ly === 0 || (wLip && lx + ly === 4) || (eLip && (15 - lx) + ly === 4);
          tok = isOuter ? 'MOS2' : ly <= 2 ? 'MOS7' : 'MOS6';
        } else if (wLip && lx <= 2) {
          tok = lx === 0 ? 'MOS2' : lx === 1 ? 'MOS7' : 'MOS6';
        } else if (eLip && lx >= 13) {
          tok = lx === 15 ? 'MOS1' : lx === 14 ? 'MOS3' : 'MOS4';
        }
        c.px('l05_moss_terraces_decals', ox + lx, oy + ly, tok);
      }
    }
  };

  paintTerraceTop(0, 3, true, true, false, 701);
  paintTerraceTop(1, 3, true, false, false, 709);
  paintTerraceTop(2, 3, true, false, true, 719);
  paintTerraceTop(3, 3, false, false, false, 727);
  paintTerraceTop(4, 3, false, false, false, 733);
  // (5,3) Solo Mossy Root-Rock Mound
  {
    const ox = 5 * 16;
    const oy = 3 * 16;
    const clip = { x0: ox, y0: oy, x1: ox + 15, y1: oy + 15 };
    c.fillEllipse('l05_moss_terraces_decals', ox + 8, oy + 12, 6.5, 2.6, 'MOS1', undefined, clip);
    c.paintShadedBlob('l05_moss_terraces_decals', ox + 8, oy + 9, 5.5, 4.5, ['RED1', 'RED2', 'RED3', 'RED4', 'MOS4', 'MOS6', 'MOS7'], 743, clip);
    c.fillEllipse('l05_moss_terraces_decals', ox + 7.2, oy + 6.4, 4.4, 2.5, 'MOS6', undefined, clip);
    c.line('l05_moss_terraces_decals', ox + 5, oy + 5, ox + 9, oy + 5, 'MOS7');
  }

  paintTerraceTop(0, 4, false, true, false, 751);
  paintTerraceTop(1, 4, false, false, false, 757);
  paintTerraceTop(2, 4, false, false, true, 761);
  paintTerraceTop(3, 4, false, false, false, 769);
  c.fillRect('l05_moss_terraces_decals', 3 * 16, 4 * 16, 4, 4, 'MOS1');
  paintTerraceTop(4, 4, false, false, false, 773);
  c.fillRect('l05_moss_terraces_decals', 4 * 16 + 12, 4 * 16, 4, 4, 'MOS1');
  paintTerraceTop(5, 4, false, true, true, 787);

  // Row 5: Vertical Root-Earth Front Faces with overhanging mossy lips!
  for (let col = 0; col < 6; col++) {
    const ox = col * 16;
    const oy = 5 * 16;
    if (col === 4) {
      // Base forest shadow fringe
      for (let ly = 0; ly < 7; ly++) {
        for (let lx = 0; lx < 16; lx++) {
          const edge = 4 + Math.round(Math.sin(lx * 0.55) * 1.4);
          if (ly < edge) {
            c.px('l05_moss_terraces_decals', ox + lx, oy + ly, ly < 2 ? 'MOS0' : 'MOS1', ly < 2 ? 190 : 115);
          }
        }
      }
      continue;
    }
    for (let ly = 0; ly < 16; ly++) {
      for (let lx = 0; lx < 16; lx++) {
        if (col === 0 && lx === 0 && ly >= 13) continue;
        if (col === 3 && lx === 15 && ly >= 13) continue;
        if (col === 5 && (lx < 3 || lx > 12)) continue;

        const droop = Math.round((Math.sin(lx * 0.75 + col * 1.9) * 0.5 + 0.5) * 2.5);
        if (ly <= 2 + droop) {
          c.px('l05_moss_terraces_decals', ox + lx, oy + ly, ly === 0 ? 'MOS7' : ly <= 1 + droop ? 'MOS5' : 'MOS2');
        } else if (ly >= 14) {
          c.px('l05_moss_terraces_decals', ox + lx, oy + ly, ly === 15 ? 'MOS0' : 'RED1');
        } else {
          // Layered gnarled roots gripping dark forest earth strata (organic, NOT uniform stripes!)
          const earth = periodicNoise(lx + col * 5, ly * 0.6, 4, 8, 829 + col * 7);
          const rootCurve = Math.abs(((lx + Math.round(Math.sin(ly * 0.5) * 1.5)) % 7) - 3) <= 0.6;
          let tok = earth > 0.62 ? 'RED3' : earth < 0.30 ? 'RED1' : 'RED2';
          if (rootCurve && ly > 4) tok = earth > 0.45 ? 'RED4' : 'RED3';
          if (col === 0 && lx === 0) tok = 'RED1';
          if (col === 3 && lx === 15) tok = 'MOS0';
          c.px('l05_moss_terraces_decals', ox + lx, oy + ly, tok);
        }
      }
    }
  }
}

function paintForestCreekAndBanks(c: WorldLayerCanvas): void {
  // (6,3)..(7,5): 6 Forest Creek Moss Banks (N, S, W, E, Outer Corner, Inner Corner)
  const bankSpecs: Array<{ col: number; row: number; kind: 'N' | 'S' | 'W' | 'E' | 'OUT' | 'IN' }> = [
    { col: 6, row: 3, kind: 'N' },
    { col: 7, row: 3, kind: 'S' },
    { col: 6, row: 4, kind: 'W' },
    { col: 7, row: 4, kind: 'E' },
    { col: 6, row: 5, kind: 'OUT' },
    { col: 7, row: 5, kind: 'IN' },
  ];
  for (const b of bankSpecs) {
    const ox = b.col * 16;
    const oy = b.row * 16;
    for (let ly = 0; ly < 16; ly++) {
      for (let lx = 0; lx < 16; lx++) {
        const cl = tileClusterField(lx, ly, 853);
        const w = Math.sin((lx + ly) * 0.65) * 1.1;
        let bankD = -10;
        if (b.kind === 'N') bankD = 5.5 + w - ly;
        else if (b.kind === 'S') bankD = ly - (10.5 + w);
        else if (b.kind === 'W') bankD = 5.5 + w - lx;
        else if (b.kind === 'E') bankD = lx - (10.5 + w);
        else if (b.kind === 'OUT') bankD = 6.5 + w - Math.hypot(lx, ly);
        else bankD = Math.hypot(15 - lx, 15 - ly) - (10.5 + w);

        if (bankD > 1.8) {
          c.px('l01_creek_water_anim', ox + lx, oy + ly, cl > 0.56 ? 'MOS6' : 'MOS4');
        } else if (bankD > 0) {
          c.px('l01_creek_water_anim', ox + lx, oy + ly, bankD > 0.8 ? 'MOS2' : 'RED1');
        } else if (bankD > -1.4) {
          c.px('l01_creek_water_anim', ox + lx, oy + ly, 'CRK0');
        } else {
          c.px('l01_creek_water_anim', ox + lx, oy + ly, cl > 0.6 ? 'CRK2' : 'CRK1');
        }
      }
    }
  }

  // Rows 4..5, Cols 8..11: 4 Horizontal 2-Frame Animated Forest Stream Pairs!
  const paintStream = (col: number, row: number, frame: 0 | 1, pebbles: boolean, shiftSeed: number) => {
    const ox = col * 16;
    const oy = row * 16;
    const sx = frame * 2;
    for (let ly = 0; ly < 16; ly++) {
      for (let lx = 0; lx < 16; lx++) {
        const v = tileClusterField((lx + sx) & 15, (ly + frame) & 15, 881 + shiftSeed);
        let tok = 'CRK1';
        if (v > 0.68) tok = 'CRK2';
        else if (v < 0.28) tok = 'CRK0';
        c.px('l01_creek_water_anim', ox + lx, oy + ly, tok);
      }
    }
    if (pebbles) {
      // Submerged dark smooth creek pebbles + bright sunlit riffle foam
      c.fillEllipse('l01_creek_water_anim', ox + 5, oy + 9, 2.2, 1.5, 'CRK0');
      c.fillEllipse('l01_creek_water_anim', ox + 11, oy + 5, 2.0, 1.4, 'CRK0');
      c.line('l01_creek_water_anim', ox + 4 + frame, oy + 7, ox + 7 + frame, oy + 7, 'WAT6');
      c.line('l01_creek_water_anim', ox + 9 + frame, oy + 12, ox + 12 + frame, oy + 12, 'CRK2');
    } else {
      c.line('l01_creek_water_anim', ox + ((3 + sx) & 15), oy + 4, ox + ((6 + sx) & 15), oy + 4, 'CRK2');
      c.px('l01_creek_water_anim', ox + ((4 + sx) & 15), oy + 4, 'WAT6');
      c.line('l01_creek_water_anim', ox + ((9 + sx) & 15), oy + 11, ox + ((12 + sx) & 15), oy + 11, 'CRK2');
    }
  };

  paintStream(8, 4, 0, false, 0);
  paintStream(9, 4, 1, false, 0);
  paintStream(10, 4, 0, false, 17);
  paintStream(11, 4, 1, false, 17);
  paintStream(8, 5, 0, true, 31);
  paintStream(9, 5, 1, true, 31);
  paintStream(10, 5, 0, true, 47);
  paintStream(11, 5, 1, true, 47);
}

function paintForestDecals(c: WorldLayerCanvas): void {
  const oy = 2 * 16;

  // (2,2) Hollow Fallen Singing Reed Segment (horizontal fluted tube with dark wind-slit!)
  {
    const ox = 2 * 16;
    c.line('l05_moss_terraces_decals', ox + 2, oy + 7, ox + 12, oy + 6, 'RED6');
    c.line('l05_moss_terraces_decals', ox + 2, oy + 8, ox + 12, oy + 7, 'RED4');
    c.line('l05_moss_terraces_decals', ox + 3, oy + 9, ox + 13, oy + 8, 'RED2');
    c.line('l05_moss_terraces_decals', ox + 3, oy + 10, ox + 13, oy + 9, 'MOS1');
    // Hollow dark tube mouth & resonance slit
    c.px('l05_moss_terraces_decals', ox + 13, oy + 7, 'RED0');
    c.px('l05_moss_terraces_decals', ox + 7, oy + 7, 'RED0');
    c.px('l05_moss_terraces_decals', ox + 8, oy + 7, 'RED0');
    c.px('l05_moss_terraces_decals', ox + 5, oy + 9, 'MOS6'); // moss creeping over fallen reed
  }

  // (3,2) Gnarled Surface Root A
  {
    const ox = 3 * 16;
    c.line('l05_moss_terraces_decals', ox + 2, oy + 8, ox + 7, oy + 7, 'RED4');
    c.line('l05_moss_terraces_decals', ox + 7, oy + 7, ox + 13, oy + 9, 'RED3');
    c.line('l05_moss_terraces_decals', ox + 2, oy + 9, ox + 7, oy + 8, 'RED2');
    c.line('l05_moss_terraces_decals', ox + 7, oy + 8, ox + 13, oy + 10, 'RED1');
    c.px('l05_moss_terraces_decals', ox + 5, oy + 6, 'MOS7');
    c.px('l05_moss_terraces_decals', ox + 10, oy + 10, 'MOS1');
  }

  // (4,2) Branching Surface Root B (vertical-diagonal)
  {
    const ox = 4 * 16;
    c.line('l05_moss_terraces_decals', ox + 8, oy + 2, ox + 7, oy + 9, 'RED4');
    c.line('l05_moss_terraces_decals', ox + 9, oy + 2, ox + 8, oy + 9, 'RED2');
    c.line('l05_moss_terraces_decals', ox + 7, oy + 9, ox + 4, oy + 13, 'RED3');
    c.line('l05_moss_terraces_decals', ox + 8, oy + 9, ox + 12, oy + 12, 'RED2');
    c.px('l05_moss_terraces_decals', ox + 7, oy + 4, 'RED5');
    c.px('l05_moss_terraces_decals', ox + 9, oy + 10, 'MOS1');
  }

  // (5,2) Golden Sun-Dapple Spot (soft translucent sunlight pooling on forest floor!)
  {
    const ox = 5 * 16;
    const clip = { x0: ox + 1, y0: oy + 1, x1: ox + 14, y1: oy + 14 };
    c.fillEllipse('l05_moss_terraces_decals', ox + 8, oy + 8, 5.2, 3.6, 'MOS7', 110, clip);
    c.fillEllipse('l05_moss_terraces_decals', ox + 7.5, oy + 7.5, 3.2, 2.2, 'MOS8', 135, clip);
    c.px('l05_moss_terraces_decals', ox + 7, oy + 7, 'MOS9', 165);
    c.px('l05_moss_terraces_decals', ox + 8, oy + 7, 'MOS9', 150);
  }

  // (6,2) Luminous Clover & Lichen Tuft
  {
    const ox = 6 * 16;
    c.px('l05_moss_terraces_decals', ox + 6, oy + 9, 'MOS2');
    c.px('l05_moss_terraces_decals', ox + 7, oy + 10, 'MOS1');
    c.px('l05_moss_terraces_decals', ox + 8, oy + 10, 'MOS2');
    c.px('l05_moss_terraces_decals', ox + 9, oy + 9, 'MOS2');
    c.px('l05_moss_terraces_decals', ox + 6, oy + 8, 'MOS6');
    c.px('l05_moss_terraces_decals', ox + 7, oy + 7, 'MOS7');
    c.px('l05_moss_terraces_decals', ox + 8, oy + 8, 'MOS6');
    c.px('l05_moss_terraces_decals', ox + 9, oy + 7, 'MOS7');
    c.px('l05_moss_terraces_decals', ox + 7, oy + 6, 'MOS8');
    c.px('l05_moss_terraces_decals', ox + 10, oy + 8, 'MOS8');
    c.px('l05_moss_terraces_decals', ox + 8, oy + 7, 'MOS9'); // tiny sunlit dew blossom!
  }

  // (7,2) Weathered Mossy Stepping Stone
  {
    const ox = 7 * 16;
    const clip = { x0: ox + 1, y0: oy + 1, x1: ox + 14, y1: oy + 14 };
    c.fillEllipse('l05_moss_terraces_decals', ox + 8.4, oy + 9.2, 4.8, 3.0, 'MOS1', undefined, clip);
    c.fillEllipse('l05_moss_terraces_decals', ox + 7.8, oy + 8.0, 4.5, 2.8, 'RCK3', undefined, clip);
    c.fillEllipse('l05_moss_terraces_decals', ox + 7.2, oy + 7.4, 3.4, 2.0, 'RCK4', undefined, clip);
    c.line('l05_moss_terraces_decals', ox + 5, oy + 6, ox + 8, oy + 6, 'RCK5');
    c.px('l05_moss_terraces_decals', ox + 5, oy + 8, 'MOS6');
    c.px('l05_moss_terraces_decals', ox + 6, oy + 9, 'MOS5');
    c.px('l05_moss_terraces_decals', ox + 10, oy + 7, 'MOS7');
  }
}

export function buildAst003SingingCanopy(): { canvas: WorldLayerCanvas; doc: ProjectDocument } {
  const c = new WorldLayerCanvas(192, 96, LAYERS);

  // 1. 4 Calm Olive-Sage Moss Floor Variants (0,0)..(3,0)
  paintCalmMossBase(c, 0, 0, 201, 0);
  paintCalmMossBase(c, 16, 0, 211, 1);
  paintCalmMossBase(c, 32, 0, 223, 2);
  paintCalmMossBase(c, 48, 0, 233, 3);

  // 2. 14 Organic Ragged Moss->Sand Ecotone Wang Tiles
  for (const cell of WANG_CELLS) {
    paintRaggedMossEcotoneTile(c, cell.col, cell.row, cell.mask);
  }

  // 3. 16 Complete 4-Bit Cardinal Root-Lined Dirt Footpaths (Cols 8..11, Rows 0..3)
  paintFourBitFootpaths(c);

  // 4. 18 Mossy Root-Bank Terrace Cliffs (Cols 0..5, Rows 3..5)
  paintMossTerraces(c);

  // 5. 6 Forest Creek Moss Banks + 4 Animated 2-Frame Stream Pairs
  paintForestCreekAndBanks(c);

  // 6. 6 Forest Floor Decals (2,2)..(7,2)
  paintForestDecals(c);

  const doc = c.toProjectDocument({
    id: 'ast003-singing-canopy-tileset',
    name: 'AST-003: Singing Reedwood Canopy Ground Tileset (192x96)',
    pivot: { x: 8, y: 8 },
    tileSize: 16,
    styleNotes:
      'Final production AST-003 tileset: 18 olive-sage moss & organic ragged sand-ecotone Wang tiles, 6 forest floor decals, 16 complete 4-bit cardinal root-lined dirt footpaths, 18 mossy root-bank terrace cliffs, 6 creek banks, and 4 animated 2-frame forest stream pairs.',
  });

  return { canvas: c, doc };
}
