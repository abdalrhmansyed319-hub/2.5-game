/**
 * AST-004 — Singing Reedwood Tree Split-Canopy Sheet (96x160, 2x2 of 48x80)
 * =========================================================================
 * Final Production Artwork authored natively through VERDANT PIXEL FORGE.
 *
 * Strictly obeys docs/asset-production/ASSET_REQUESTS.md v2.0 &
 * game/world/props/singing_reedwood_tree.gd:
 *   - Cell size : 48x80 px, pivot (24, 72) -> offset (0, -32)
 *   - Col 0 (x=0..47)  : Trunk & buttress roots (y=32..76; y=0..31 strictly transparent)
 *   - Col 1 (x=48..95) : Pixel-registered cutaway canopy (y=2..36; y=37..79 strictly transparent)
 *   - Overlap collar   : y=32..36 shared registration ensures zero seam when canopy fades to 0.38 alpha!
 *   - Row 0 (y=0..79)  : Variant A — Tall stately twin-fluted Singing Reedwood
 *   - Row 1 (y=80..159): Variant B — Ancient wider triple-bundled Singing Reedwood
 */

import { WorldLayerCanvas, hash2i, periodicNoise } from './worldArtCore';
import type { ProjectDocument } from '../types/studio';

const LAYERS = [
  { id: 'l01_trunk_roots', name: '01 Fluted Reedwood Trunk & Roots' },
  { id: 'l02_trunk_slits_moss', name: '02 Resonance Slits & Bark Moss' },
  { id: 'l03_canopy_deep_shadow', name: '03 Canopy Deep Undercuts' },
  { id: 'l04_canopy_boughs', name: '04 Volumetric Leaf Bough Clusters' },
  { id: 'l05_canopy_sun_highlights', name: '05 Upper-Left Sunlit Leaf Tips' },
];

interface LeafCluster {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  seed: number;
  /** Light bias from -0.35 (lower-right shade) to +0.42 (upper-left crown sun) */
  sunBias: number;
}

function paintFlutedReedTrunk(
  c: WorldLayerCanvas,
  rowIdx: 0 | 1
): void {
  const oy = rowIdx * 80;
  const clip = { x0: 1, y0: oy + 32, x1: 46, y1: oy + 76 };

  // Sculpt bundled organic hollow reed pipes curving gracefully into buttress roots!
  const pipes: Array<{
    baseX: number;
    topX: number;
    halfW: number;
    topY: number;
    botY: number;
    litShift: number;
  }> =
    rowIdx === 0
      ? [
          { baseX: 20.0, topX: 20.5, halfW: 2.3, topY: 32, botY: 72, litShift: 0.25 },
          { baseX: 24.0, topX: 24.0, halfW: 2.8, topY: 32, botY: 74, litShift: 0.05 },
          { baseX: 28.0, topX: 27.5, halfW: 2.2, topY: 32, botY: 72, litShift: -0.25 },
        ]
      : [
          { baseX: 18.5, topX: 19.5, halfW: 2.4, topY: 32, botY: 72, litShift: 0.28 },
          { baseX: 23.0, topX: 23.2, halfW: 2.9, topY: 32, botY: 75, litShift: 0.1 },
          { baseX: 27.5, topX: 27.0, halfW: 2.6, topY: 32, botY: 74, litShift: -0.15 },
          { baseX: 30.8, topX: 29.5, halfW: 1.8, topY: 33, botY: 71, litShift: -0.32 },
        ];

  // Upper shadowy fork branches inside the y=32..42 collar (guarantees lush continuity under transparent canopy!)
  const forks: Array<[number, number, number, number, string]> =
    rowIdx === 0
      ? [
          [21, 39, 13, 33, 'RED3'],
          [21, 40, 14, 34, 'RED1'],
          [27, 40, 35, 33, 'RED2'],
          [27, 41, 34, 34, 'RED0'],
        ]
      : [
          [19, 41, 11, 33, 'RED3'],
          [19, 42, 12, 34, 'RED1'],
          [28, 42, 37, 34, 'RED2'],
          [28, 43, 36, 35, 'RED0'],
          // Iconic weathered side-branch spur at y=46..50
          [19, 49, 12, 46, 'RED4'],
          [19, 50, 13, 47, 'RED2'],
          [12, 45, 13, 45, 'MOS7'],
        ];
  for (const [x0, y0, x1, y1, tok] of forks) {
    c.line('l01_trunk_roots', x0, oy + y0, x1, oy + y1, tok);
  }

  // Grounded buttress roots gripping mossy soil at y=65..76 (centered at pivot x=24, y=72!)
  const roots: Array<{ x0: number; y0: number; x1: number; y1: number; thick: number; lit: boolean }> =
    rowIdx === 0
      ? [
          { x0: 20, y0: 66, x1: 12, y1: 73, thick: 2.0, lit: true },
          { x0: 22, y0: 68, x1: 17, y1: 75, thick: 1.8, lit: true },
          { x0: 24, y0: 69, x1: 24, y1: 76, thick: 2.1, lit: false },
          { x0: 27, y0: 68, x1: 31, y1: 75, thick: 1.8, lit: false },
          { x0: 28, y0: 66, x1: 36, y1: 73, thick: 1.9, lit: false },
        ]
      : [
          { x0: 19, y0: 65, x1: 10, y1: 73, thick: 2.2, lit: true },
          { x0: 21, y0: 68, x1: 16, y1: 76, thick: 2.0, lit: true },
          { x0: 24, y0: 69, x1: 23, y1: 76, thick: 2.2, lit: true },
          { x0: 27, y0: 68, x1: 31, y1: 76, thick: 2.0, lit: false },
          { x0: 29, y0: 66, x1: 38, y1: 73, thick: 2.1, lit: false },
        ];

  for (const rt of roots) {
    const steps = 20;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const rx = rt.x0 + (rt.x1 - rt.x0) * t;
      const ry = rt.y0 + (rt.y1 - rt.y0) * t + Math.sin(t * Math.PI) * 1.1;
      const rad = Math.max(0.7, rt.thick * (1 - t * 0.55));
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          const d = Math.hypot(dx, dy);
          if (d > rad) continue;
          const px = Math.round(rx + dx);
          const py = Math.round(ry + dy);
          if (px < clip.x0 || px > clip.x1 || oy + py < clip.y0 || oy + py > clip.y1) continue;
          let tok = rt.lit ? 'RED4' : 'RED2';
          if (dy < 0 && rt.lit) tok = 'RED5';
          else if (dy > 0.5) tok = 'RED1';
          if (d > rad - 0.65 && dy > 0) tok = 'RED0';
          c.px('l01_trunk_roots', px, oy + py, tok);
        }
      }
    }
  }

  // Taper upper reed tips organically into canopy foliage at y=32..35 (zero flat rectangular cut at 0.38 alpha!)
  for (const pipe of pipes) {
    for (let y = pipe.topY; y <= pipe.botY; y++) {
      if (y === 32 && Math.abs(pipe.topX - 24) > 3.2) continue;
      const t = (y - pipe.topY) / (pipe.botY - pipe.topY);
      const flare = t > 0.78 ? (t - 0.78) * 3.8 : 0;
      const topTaper = y < 36 ? (36 - y) * 0.35 : 0;
      const cx = pipe.topX + (pipe.baseX - pipe.topX) * t + Math.sin(t * Math.PI * 1.5 + rowIdx) * 0.5;
      const hw = Math.max(0.8, pipe.halfW + flare - topTaper);
      // Canopy casts a cool deep shadow across the top y=32..40 collar!
      const canopyShade = y < 40 ? (40 - y) * 0.085 : 0;
      // Subtle horizontal bamboo/reed growth rings every 7-8 px!
      const isNodeRing = (y - 34) % 8 === 0;

      for (let x = Math.floor(cx - hw - 1); x <= Math.ceil(cx + hw + 1); x++) {
        if (x < clip.x0 || x > clip.x1) continue;
        const nx = (x - cx) / hw; // -1 (left) .. +1 (right)
        if (Math.abs(nx) > 1.0) continue;

        // Cylindrical lighting from upper-left (-0.55) with warm fluted rib highlight!
        const cyl = -nx * 0.55 + (1 - Math.abs(nx + 0.35)) * 0.35 + pipe.litShift;
        const barkTex = (periodicNoise(x, y * 0.4, 2, 8, 901 + rowIdx * 17) - 0.5) * 0.18;
        const l = cyl + barkTex - canopyShade - (isNodeRing ? 0.16 : 0);

        let tok = 'RED3';
        if (Math.abs(nx) > 0.86) {
          // Crisp sel-out dark bark flute groove between pipes!
          tok = nx > 0 ? 'RED0' : 'RED1';
        } else if (l > 0.48) {
          tok = 'RED6';
        } else if (l > 0.28) {
          tok = 'RED5';
        } else if (l > 0.10) {
          tok = 'RED4';
        } else if (l > -0.10) {
          tok = 'RED3';
        } else if (l > -0.28) {
          tok = 'RED2';
        } else {
          tok = 'RED1';
        }
        c.px('l01_trunk_roots', x, oy + y, tok);
      }
    }
  }

  // Signature Iconic Acoustic Wind-Resonance Slits carved into the hollow reedwood columns!
  // Dark hollow vertical ovals (`RED0`) with bright sunlit warm ochre lip (`RED6`) on the right interior edge!
  const slits: Array<[number, number, number]> =
    rowIdx === 0
      ? [
          [20, 48, 5],
          [24, 56, 6],
          [27, 45, 4],
        ]
      : [
          [19, 46, 5],
          [23, 55, 6],
          [27, 49, 5],
          [24, 64, 4],
        ];
  for (const [sx, sy, sh] of slits) {
    for (let dy = 0; dy < sh; dy++) {
      c.px('l02_trunk_slits_moss', sx, oy + sy + dy, 'RED0');
      // Warm acoustic inner-wall glint on right rim & subtle shadow notch on left
      if (dy > 0 && dy < sh - 1) {
        c.px('l02_trunk_slits_moss', sx + 1, oy + sy + dy, 'RED6');
      }
    }
    c.px('l02_trunk_slits_moss', sx, oy + sy - 1, 'RED2');
    c.px('l02_trunk_slits_moss', sx, oy + sy + sh, 'RED5');
  }

  // Living velvet woodland moss & warm sunlit lichen nestled at the root hollows & collar!
  const mossSpots: Array<[number, number, string]> =
    rowIdx === 0
      ? [
          [16, 71, 'MOS6'], [17, 71, 'MOS7'], [16, 72, 'MOS4'],
          [22, 72, 'MOS5'], [23, 73, 'MOS6'], [29, 71, 'MOS4'],
          [19, 42, 'MOS7'], [20, 43, 'MOS5'],
        ]
      : [
          [14, 71, 'MOS7'], [15, 71, 'MOS6'], [15, 72, 'MOS4'],
          [20, 73, 'MOS6'], [21, 73, 'MOS7'], [26, 72, 'MOS5'],
          [32, 71, 'MOS4'], [18, 43, 'MOS7'], [19, 44, 'MOS5'],
          [29, 59, 'MOS6'], [30, 59, 'MOS7'],
        ];
  for (const [mx, my, mtok] of mossSpots) {
    c.px('l02_trunk_slits_moss', mx, oy + my, mtok);
  }
}

function paintPainterlyCutawayCanopy(c: WorldLayerCanvas, rowIdx: 0 | 1): void {
  const ox = 48; // Column 1!
  const oy = rowIdx * 80;
  // STRICT registration law: canopy pixels MUST live cleanly within x=1..46, y=2..36!
  const clip = { x0: ox + 1, y0: oy + 2, x1: ox + 46, y1: oy + 36 };

  // Build volumetric painterly multi-bough foliage crown (inspired directly by reference painting!)
  // Ordered back-to-front / bottom-to-top so sunlit upper-left leaf pillows stack over shadowed lower boughs!
  const boughs: LeafCluster[] =
    rowIdx === 0
      ? [
          // Deep lower-back shadow shelves (y=23..35)
          { cx: 14, cy: 26, rx: 10.5, ry: 7.2, seed: 101, sunBias: -0.18 },
          { cx: 34, cy: 27, rx: 10.5, ry: 7.0, seed: 109, sunBias: -0.34 },
          { cx: 24, cy: 29, rx: 11.5, ry: 6.5, seed: 113, sunBias: -0.25 },
          // Mid-body lush emerald leaf lobes (y=14..26)
          { cx: 11, cy: 20, rx: 9.2, ry: 6.8, seed: 127, sunBias: 0.08 },
          { cx: 36, cy: 21, rx: 9.2, ry: 6.6, seed: 131, sunBias: -0.22 },
          { cx: 29, cy: 19, rx: 10.5, ry: 7.2, seed: 137, sunBias: -0.04 },
          { cx: 18, cy: 19, rx: 10.5, ry: 7.4, seed: 139, sunBias: 0.16 },
          // Upper-left sunlit billowing crown pillows (y=5..17)
          { cx: 30, cy: 12, rx: 9.2, ry: 6.2, seed: 149, sunBias: 0.10 },
          { cx: 17, cy: 11, rx: 9.8, ry: 6.6, seed: 151, sunBias: 0.28 },
          { cx: 23, cy: 8, rx: 9.0, ry: 5.8, seed: 157, sunBias: 0.36 },
        ]
      : [
          // Variant B: Wider ancient tiered Reedwood umbrella crown!
          { cx: 12, cy: 27, rx: 10.8, ry: 6.8, seed: 201, sunBias: -0.15 },
          { cx: 36, cy: 28, rx: 10.2, ry: 6.8, seed: 211, sunBias: -0.35 },
          { cx: 24, cy: 29, rx: 12.2, ry: 6.5, seed: 223, sunBias: -0.24 },
          { cx: 9, cy: 21, rx: 8.4, ry: 6.4, seed: 227, sunBias: 0.05 },
          { cx: 38, cy: 21, rx: 8.2, ry: 6.4, seed: 229, sunBias: -0.26 },
          { cx: 29, cy: 20, rx: 10.8, ry: 7.0, seed: 233, sunBias: -0.05 },
          { cx: 18, cy: 19, rx: 11.0, ry: 7.0, seed: 239, sunBias: 0.18 },
          { cx: 32, cy: 13, rx: 9.2, ry: 6.0, seed: 241, sunBias: 0.08 },
          { cx: 15, cy: 12, rx: 9.6, ry: 6.2, seed: 251, sunBias: 0.30 },
          { cx: 24, cy: 9, rx: 10.0, ry: 6.0, seed: 257, sunBias: 0.38 },
          { cx: 20, cy: 6, rx: 6.4, ry: 3.8, seed: 263, sunBias: 0.42 },
        ];

  const ramp = ['CAN0', 'CAN1', 'CAN2', 'CAN3', 'CAN4', 'CAN5', 'CAN6', 'CAN7'];

  // Paint each scalloped painterly leaf-bough volume with crisp outer foliage tufts!
  for (let bi = 0; bi < boughs.length; bi++) {
    const b = boughs[bi];
    const layerId = bi < 3 ? 'l03_canopy_deep_shadow' : 'l04_canopy_boughs';

    for (let ly = Math.floor(b.cy - b.ry - 2); ly <= Math.ceil(b.cy + b.ry + 2); ly++) {
      for (let lx = Math.floor(b.cx - b.rx - 2); lx <= Math.ceil(b.cx + b.rx + 2); lx++) {
        const px = ox + lx;
        const py = oy + ly;
        if (px < clip.x0 || px > clip.x1 || py < clip.y0 || py > clip.y1) continue;

        const nx = (lx - b.cx) / b.rx;
        const ny = (ly - b.cy) / b.ry;
        const ang = Math.atan2(ny, nx);
        // Scalloped botanical leaf-tuft silhouette!
        const scallop =
          Math.sin(ang * 7 + b.seed) * 0.11 +
          Math.cos(ang * 13 - b.seed * 0.7) * 0.06;
        const dist = Math.hypot(nx, ny) + scallop;
        if (dist > 1.0) continue;

        // Upper-left (~40 deg) painterly volumetric shading per bough + fine leaf texture!
        const keyDot = -nx * 0.56 - ny * 0.64;
        const leafClump = (periodicNoise(lx, ly, 2, 8, b.seed * 3) - 0.5) * 0.28;
        const rimDarken = dist > 0.84 && keyDot < 0.1 ? -0.26 : 0;
        const val = 0.42 + keyDot * 0.44 + b.sunBias + leafClump + rimDarken;

        // Edge sel-out discipline: shadowed underside edges get deep CAN0/CAN1; sunlit upper-left rims glow CAN6/CAN7!
        let idx = Math.round(Math.max(0, Math.min(1, val)) * (ramp.length - 1));
        if (dist > 0.87 && ny > 0.15) idx = Math.min(idx, 1);
        if (dist > 0.87 && ny > 0.45 && nx > 0.0) idx = 0;

        c.px(layerId, px, py, ramp[idx]);
      }
    }
  }

  // Handcrafted sunlit golden leaf-blade highlights & tiny swaying reed-tassels along lower edge!
  const crownSparks: Array<[number, number, string]> =
    rowIdx === 0
      ? [
          [18, 6, 'CAN8'], [19, 6, 'CAN7'], [21, 5, 'CAN8'], [22, 6, 'CAN7'],
          [13, 10, 'CAN8'], [14, 10, 'CAN7'], [11, 15, 'CAN7'], [12, 16, 'CAN8'],
          [26, 7, 'CAN7'], [27, 8, 'CAN7'], [16, 15, 'CAN8'], [17, 15, 'CAN7'],
          [9, 19, 'CAN7'], [21, 14, 'CAN7'], [29, 10, 'CAN7'],
        ]
      : [
          [18, 5, 'CAN8'], [19, 5, 'CAN8'], [22, 6, 'CAN7'], [24, 6, 'CAN8'],
          [12, 10, 'CAN8'], [13, 10, 'CAN7'], [9, 17, 'CAN7'], [14, 15, 'CAN8'],
          [15, 16, 'CAN7'], [27, 8, 'CAN7'], [30, 10, 'CAN7'], [19, 14, 'CAN8'],
          [11, 13, 'CAN7'], [21, 11, 'CAN7'],
        ];
  for (const [sx, sy, tok] of crownSparks) {
    c.px('l05_canopy_sun_highlights', ox + sx, oy + sy, tok);
  }

  // Delicate weeping reed-moss streamers & leaf tufts hugging the y=32..36 registration seam!
  const streamers: Array<[number, number, number]> =
    rowIdx === 0
      ? [[13, 33, 3], [19, 34, 2], [25, 34, 2], [32, 33, 3]]
      : [[11, 33, 3], [17, 34, 2], [24, 34, 2], [30, 34, 2], [36, 33, 3]];
  for (const [tx, ty, len] of streamers) {
    for (let dy = 0; dy < len; dy++) {
      if (ty + dy > 36) continue;
      c.px(
        'l05_canopy_sun_highlights',
        ox + tx,
        oy + ty + dy,
        dy === 0 ? 'CAN3' : dy === 1 ? 'CAN2' : 'CAN1'
      );
      if (dy === 0 && hash2i(tx, ty, 331) > 0.4) {
        c.px('l05_canopy_sun_highlights', ox + tx - 1, oy + ty, 'CAN4');
      }
    }
  }
}

export function buildAst004SingingReedwood(): { canvas: WorldLayerCanvas; doc: ProjectDocument } {
  const c = new WorldLayerCanvas(96, 160, LAYERS);

  // Variant A (Row 0) & Variant B (Row 1)
  paintFlutedReedTrunk(c, 0);
  paintPainterlyCutawayCanopy(c, 0);
  paintFlutedReedTrunk(c, 1);
  paintPainterlyCutawayCanopy(c, 1);

  const doc = c.toProjectDocument({
    id: 'ast004-singing-reedwood-tree',
    name: 'AST-004: Singing Reedwood Split-Canopy Tree Sheet (96x160)',
    pivot: { x: 24, y: 72 },
    tileSize: 48,
    styleNotes:
      'Final production AST-004 Singing Reedwood sheet: 2 variants (Row 0 & Row 1), Col 0 fluted acoustic trunk & buttress roots (y=32..76), Col 1 pixel-registered volumetric cutaway canopy (y=2..36), 4px overlap collar y=32..36 for seamless 0.38 alpha canopy fade.',
  });

  return { canvas: c, doc };
}
