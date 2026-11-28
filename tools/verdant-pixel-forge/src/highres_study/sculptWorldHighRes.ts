/**
 * VERDANT SIGNAL — High-Resolution Native Environment, Terrain & World Props Engine (Pass 2 Painterly!)
 * ======================================================================================================
 * Genuinely authors native 24x24 and 32x32 seamless terrain tiles (Godot Terrain Set compatible)
 * PLUS museum-grade upgraded AST-004 through AST-007 showcase landmarks for our 640x360
 * High-Resolution Art Upgrade Vertical Slice!
 *
 * Pass 2 refinements after full-resolution visual audit:
 *   - Eliminated periodic 32px meadow texture grid: replaced with sweeping painterly sunlight/shadow
 *     meadow washes, organic worn woodland trail, lush fern tufts, varied grass clusters & mossy hummocks
 *   - Upgraded Singing Reedwood Trees to true painterly scalloped leaf crowns (ZERO cartoon outlines
 *     between interior foliage lobes!) + 2 distinct organic tree silhouettes
 *   - Replaced straight roots with organic branching gnarled roots emerging from tree trunks and
 *     weaving naturally under moss & grass tufts
 *   - Sculpted believable continuous northern coastal cliff headland with natural terrain integration
 *   - Rebuilt Crashed ICV Meridian Drop-Pod as a true conical-beveled aerospace re-entry capsule
 *     plowed into a trailing scorched impact furrow + expedition supply crate beside camp tent
 */

import {
  HighResCanvas,
  HR_COL,
  fbmPeriodic,
  hash2,
  smoothNoise,
} from './highResPaletteAndSculpt';

const CLIFF_RAMP = ['K0', 'K1', 'K2', 'K3', 'K4', 'K5', 'K6'];
const MOSS_RAMP = ['G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8'];
const REED_RAMP = ['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
const METAL_RAMP = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
const SUIT_RAMP = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'];

export type TerrainTileSize = 24 | 32;

export const TERRAIN_STUDY_LAYERS = [
  { id: 'l01_base_terrain', name: '01 Seamless Base Terrain & Water' },
  { id: 'l02_geology_roots', name: '02 Cliff Strata, Wet Shore & Branching Roots' },
  { id: 'l03_foliage_detail', name: '03 Painterly Grass Clusters, Ferns, Foam & Shells' },
];

/** Paint a rich multi-frond woodland fern / grass cluster directly onto a canvas */
function paintMeadowCluster(
  c: HighResCanvas,
  layer: string,
  cx: number,
  cy: number,
  size: number,
  sunlit: boolean,
  hasBlossom = false
): void {
  const baseDark = sunlit ? 'G2' : 'G1';
  const mid = sunlit ? 'G5' : 'G3';
  const tip = sunlit ? 'G7' : 'G5';
  const hi = sunlit ? 'G8' : 'G6';

  // Soft dark root pocket grounding tuft cleanly onto meadow
  for (let dx = -size; dx <= size; dx++) {
    c.px(layer, cx + dx, cy + 1, baseDark);
  }
  // Organic fanned curling grass blades of asymmetrical height (NEVER repetitive rubber-stamps!)
  const blades = [
    [-size, -Math.max(1, size - 1), mid, tip],
    [-Math.max(1, Math.round(size * 0.5)), -size - 1, mid, hi],
    [0, -size - 2, tip, hi],
    [Math.max(1, Math.round(size * 0.6)), -size, mid, tip],
    [size, -Math.max(1, size - 1), baseDark, mid],
  ] as const;

  for (const [dx, dy, cLow, cHi] of blades) {
    c.line(layer, cx + Math.round(dx * 0.35), cy, cx + dx, cy + dy, cLow);
    c.px(layer, cx + dx, cy + dy, cHi);
  }
  if (hasBlossom) {
    c.px(layer, cx - 1, cy - size - 1, 'F4');
    c.px(layer, cx + 1, cy - size, 'F5');
  }
}

/** Paint a gnarly organic S-curved branching surface root partially woven into dark moss humus! */
function paintGnarledRoot(
  c: HighResCanvas,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  bend: number,
  rStart: number,
  rEnd: number,
  seed: number
): void {
  const mx = (x0 + x1) * 0.5 + bend;
  const my = (y0 + y1) * 0.5 - bend * 0.55;
  // Soft moss crevice shadow hugging underside of root
  c.sculptBezierTube('l02_geology_roots', [x0 + 1, y0 + 2], [mx + 1, my + 2], [x1 + 1, y1 + 2], rStart * 1.05, rEnd * 1.05, ['G0', 'G0', 'G1']);
  // Sculpted twisted bark root
  c.sculptBezierTube('l02_geology_roots', [x0, y0], [mx, my], [x1, y1], rStart, rEnd, REED_RAMP, {
    ribFreq: 3.0,
    outlineDark: 'T0',
    outlineLight: 'T4',
  });
  // Organic secondary offshoot rootlet branching mid-way and diving back into mossy earth!
  const bx = mx + (hash2(Math.round(mx), seed, 81) - 0.5) * 14;
  const by = my + 10 + hash2(Math.round(my), seed, 97) * 10;
  c.sculptBezierTube('l02_geology_roots', [mx, my], [(mx + bx) * 0.5 + 3, (my + by) * 0.5], [bx, by], rStart * 0.55, 0.9, REED_RAMP, {
    outlineDark: 'T0',
    outlineLight: 'T3',
  });
  // Creeping emerald moss tufts overlapping parts of root so it sits IN the forest floor!
  c.sculptVolume('l03_foliage_detail', mx, my + 0.5, rStart * 0.9, rStart * 0.55, MOSS_RAMP, { lightBias: 0.05 });
}

/**
 * Paint a seamless miniature biome showcase strip at native tile size (24x24 OR 32x32)
 * covering 5 cols x 3 rows of genuine Godot Terrain Set tiles!
 */
export function buildNativeTerrainShowcase(tileSize: TerrainTileSize): {
  canvas: HighResCanvas;
  vpfJson: string;
  width: number;
  height: number;
} {
  const cols = 5;
  const rows = 3;
  const W = cols * tileSize;
  const H = rows * tileSize;
  const c = new HighResCanvas(W, H, TERRAIN_STUDY_LAYERS);
  const sc = tileSize / 32.0;

  const put = (layer: string, x: number, y: number, tok: string, alpha = 255) => {
    if (x >= 0 && y >= 0 && x < W && y < H) c.px(layer, x, y, tok, alpha);
  };

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // Smooth non-repeating macro field (anchored cleanly across tile edges)
      const nMacro = fbmPeriodic(x, y, W, 101);
      const nMid = fbmPeriodic(x, y, Math.max(48, tileSize * 2), 307);
      const nMicro = smoothNoise(x * 0.16, y * 0.16, 48, 48, 613);
      const nWave = Math.sin((y / tileSize) * Math.PI * 3.5 + nMacro * 3.8);
      const u = x / tileSize;
      const v = y / tileSize;

      const shoreBorder = 0.85 + Math.sin(v * Math.PI * 2.0) * 0.16 + (nMacro - 0.5) * 0.24;
      const cliffLeft = 1.92 + Math.sin(v * Math.PI * 2.0 + 1.1) * 0.10 + (nMacro - 0.5) * 0.14;
      const cliffRight = 2.94 + Math.cos(v * Math.PI * 2.0) * 0.10 + (nMacro - 0.5) * 0.14;
      const mossBorder = 3.12 + Math.sin(v * Math.PI * 2.0 - 0.6) * 0.18 + (nMacro - 0.5) * 0.34;

      if (u < shoreBorder) {
        const distShore = shoreBorder - u;
        let tok = 'W0';
        if (distShore < 0.08 + nMicro * 0.05) {
          tok = hash2(x, y, 911) > 0.34 ? 'W6' : 'W5';
        } else if (distShore < 0.22) {
          tok = nWave > 0.55 && nMicro > 0.52 ? 'W5' : nMid > 0.44 ? 'W4' : 'W3';
        } else if (distShore < 0.52) {
          tok = nWave > 0.62 ? 'W4' : nWave > -0.1 ? 'W3' : 'W2';
        } else {
          tok = nWave > 0.58 && nMacro > 0.48 ? 'W2' : nWave > -0.25 ? 'W1' : 'W0';
        }
        put('l01_base_terrain', x, y, tok);
      } else if (u < cliffLeft) {
        const distWet = u - shoreBorder;
        const ripple = Math.sin((x * 0.24 + y * 0.11) / sc + nMacro * 4.2);
        let tok = 'D3';
        if (distWet < 0.12 + nMicro * 0.04) tok = nMicro > 0.72 ? 'D1' : 'D0';
        else if (distWet < 0.28 + nMicro * 0.06) tok = ripple > 0.25 ? 'D2' : 'D1';
        else {
          if (ripple > 0.52 && nMacro > 0.45) tok = 'D4';
          else if (ripple < -0.45 && nMacro < 0.58) tok = 'D2';
          else tok = 'D3';
          if (tileSize === 32 && hash2(x, y, 521) > 0.985 && ripple > 0.4) tok = 'D5';
        }
        put('l01_base_terrain', x, y, tok);
      } else if (u < cliffRight) {
        const localU = (u - cliffLeft) / Math.max(0.1, cliffRight - cliffLeft);
        const strataPhase = (v * 3.8 + localU * 0.75 + nMid * 0.55) % 1.0;
        const crackNoise = Math.abs(smoothNoise(x * 0.15 / sc, y * 0.12 / sc, 24, 24, 777) - 0.5);
        let tok = 'K3';
        if (localU < 0.08) tok = 'K0';
        else if (localU > 0.80 - nMicro * 0.10) tok = localU > 0.90 ? 'G5' : nMicro > 0.5 ? 'G3' : 'G2';
        else if (crackNoise < 0.038 && tileSize === 32) tok = 'K0';
        else if (strataPhase < 0.14) tok = 'K1';
        else if (strataPhase < 0.30) tok = nMicro > 0.55 ? 'K5' : 'K4';
        else if (strataPhase > 0.62 && strataPhase < 0.69 && nMid > 0.46) tok = tileSize === 32 && nMicro > 0.58 ? 'K6' : 'K5';
        else tok = nMicro > 0.54 ? 'K3' : 'K2';
        put('l02_geology_roots', x, y, tok);
      } else if (u < mossBorder) {
        const mix = (u - cliffRight) / Math.max(0.05, mossBorder - cliffRight);
        const edgeJagged = nMacro * 0.60 + nMid * 0.40;
        let tok: string;
        if (mix + edgeJagged * 0.55 > 0.72) tok = nMicro > 0.58 ? 'G4' : nMicro > 0.30 ? 'G3' : 'G2';
        else if (mix + edgeJagged * 0.55 > 0.54) tok = 'D0';
        else tok = nMicro > 0.55 ? 'D3' : 'D2';
        put('l01_base_terrain', x, y, tok);
      } else {
        // Sweeping painterly dappled forest floor — ZERO repeating grid dots!
        const sunPool = fbmPeriodic(x, y, W, 809) * 0.65 + nMid * 0.35;
        let tok = 'G4';
        if (sunPool > 0.66) tok = nMicro > 0.62 ? 'G6' : 'G5';
        else if (sunPool > 0.48) tok = nMicro > 0.58 ? 'G5' : 'G4';
        else if (sunPool > 0.32) tok = nMicro > 0.56 ? 'G3' : 'G2';
        else tok = nMicro > 0.58 ? 'G2' : 'G1';
        put('l01_base_terrain', x, y, tok);
      }
    }
  }

  // Coastal shells & pebbles
  const shellSpots = tileSize === 32
    ? [[38, 18], [52, 44], [43, 76], [56, 22], [47, 60], [60, 82]]
    : [[29, 14], [39, 34], [33, 57], [43, 18]];
  for (const [sx, sy] of shellSpots) {
    put('l03_foliage_detail', sx, sy + 1, 'D0');
    put('l03_foliage_detail', sx + 1, sy + 1, 'D0');
    put('l03_foliage_detail', sx, sy, 'D5');
    put('l03_foliage_detail', sx + 1, sy, 'D4');
    if (tileSize === 32) put('l03_foliage_detail', sx, sy - 1, 'D5');
  }

  // Cliff-foot talus boulders
  const cliffFootX = Math.round(1.92 * tileSize);
  for (let b = 0; b < 3; b++) {
    const by = Math.round((0.45 + b * 0.95) * tileSize);
    c.sculptVolume('l02_geology_roots', cliffFootX - 2 * sc, by, 4.4 * sc, 3.0 * sc, CLIFF_RAMP, { outlineDark: 'K0', outlineLight: 'K4' });
  }

  // Organic gnarled branching woodland root system emerging from upper-right edge & curving naturally into moss!
  const rootBaseX = Math.round(4.65 * tileSize);
  paintGnarledRoot(c, rootBaseX + 6 * sc, 6 * sc, rootBaseX - 28 * sc, 34 * sc, -12 * sc, 3.2 * sc, 1.1 * sc, 11);
  paintGnarledRoot(c, rootBaseX + 4 * sc, 12 * sc, rootBaseX - 8 * sc, 66 * sc, 14 * sc, 2.8 * sc, 1.0 * sc, 23);

  // Mossy woodland stone nestled beside root knuckle
  if (tileSize === 32) {
    c.sculptVolume('l02_geology_roots', Math.round(3.65 * tileSize), Math.round(1.55 * tileSize), 5.8, 3.9, CLIFF_RAMP, { outlineDark: 'K0', outlineLight: 'K4' });
    c.sculptVolume('l03_foliage_detail', Math.round(3.65 * tileSize) - 1, Math.round(1.55 * tileSize) - 2, 4.2, 2.1, MOSS_RAMP, { lightBias: 0.1 });
  }

  // Varied painterly grass clusters & tiny woodland clover tufts
  const tuftCount = tileSize === 32 ? 32 : 18;
  for (let i = 0; i < tuftCount; i++) {
    const tx = Math.round((3.22 + hash2(i, 17, 401) * 1.66) * tileSize);
    const ty = Math.round((0.14 + hash2(i, 53, 409) * 2.72) * tileSize);
    paintMeadowCluster(c, 'l03_foliage_detail', tx, ty, tileSize === 32 ? (i % 3 === 0 ? 3 : 2) : 2, hash2(i, 91, 419) > 0.4, tileSize === 32 && i % 6 === 0);
  }

  const vpfJson = c.serializeVpf({
    id: `hr_terrain_study_${tileSize}x${tileSize}`,
    name: `HIGH-RES TERRAIN STUDY — ${tileSize}x${tileSize} Native Rimlands Ecotone`,
    pivot: { x: Math.round(W / 2), y: Math.round(H / 2) },
    tileSize,
    styleNotes: `Genuine native ${tileSize}x${tileSize} seamless terrain study demonstrating Amber Coast surf, wet/dry sand dunes, stratified mineral coastal cliffs, ragged ecotone, and Singing Canopy moss/roots. Godot Terrain Set compatible.`,
  });

  return { canvas: c, vpfJson, width: W, height: H };
}

// ============================================================================
// PASS 2 PAINTERLY HIGH-RES SHOWCASE PROPS (AST-004, AST-005, AST-006)
// ============================================================================

/**
 * High-Res AST-004 (112x168) — True Painterly Singing Reedwood Tree!
 * ZERO cartoon outlines between interior foliage lobes: sunlit scalloped leaf pillows blend
 * organically from deep spruce under-boughs (`G0`/`G1`) to golden-sage sunlit crowns (`G6`/`G8`),
 * directly honoring IMG_20261126_155715.jpg! Supports 2 distinct organic tree silhouettes!
 */
export function buildHighResReedwoodTree(variant: 'matriarch' | 'grove' = 'matriarch'): HighResCanvas {
  const W = 112;
  const H = 168;
  const c = new HighResCanvas(W, H, [
    { id: 'l01_shadow', name: '01 Broad Dappled Canopy Shadow' },
    { id: 'l02_roots_trunk', name: '02 Buttress Roots & Bundled Reedwood Stems' },
    { id: 'l03_canopy_base', name: '03 Deep Spruce Canopy Undercut' },
    { id: 'l04_canopy_paint', name: '04 Seamless Painterly Scalloped Leaf Crown' },
  ]);
  const cx = 56;
  const baseY = 152;
  const lean = variant === 'grove' ? 5 : 0;

  // Soft wide dappled ground shadow beneath canopy
  for (let y = baseY - 12; y <= baseY + 14; y++) {
    for (let x = cx - 44; x <= cx + 44; x++) {
      const r = Math.hypot((x - cx) / 42, (y - (baseY + 2)) / 12);
      if (r < 1.0) c.px('l01_shadow', x, y, 'SH', r < 0.62 ? 115 : 58);
    }
  }

  // 1. Gnarled Spreading Buttress Roots gripping mossy soil!
  const roots: Array<[[number, number], [number, number], [number, number]]> = [
    [[cx - 6, baseY - 18], [cx - 20, baseY - 3], [cx - 38, baseY + 5]],
    [[cx - 2, baseY - 14], [cx - 10, baseY + 2], [cx - 18, baseY + 10]],
    [[cx + 4, baseY - 15], [cx + 12, baseY + 2], [cx + 22, baseY + 9]],
    [[cx + 7, baseY - 18], [cx + 22, baseY - 2], [cx + 39, baseY + 4]],
  ];
  for (const [p0, p1, p2] of roots) {
    c.sculptBezierTube('l02_roots_trunk', p0, p1, p2, 5.4, 1.6, REED_RAMP, { ribFreq: 2.8, outlineDark: 'T0', outlineLight: 'T4' });
  }

  // 2. Bundled Organ-Pipe Hollow Reedwood Stems + Beveled Acoustic Wind-Slits!
  const pipes = variant === 'matriarch'
    ? [
        { dx: -11, topY: 78, r: 4.5, bias: 0.16 },
        { dx: 11, topY: 80, r: 4.4, bias: -0.16 },
        { dx: -5, topY: 66, r: 5.4, bias: 0.08 },
        { dx: 5, topY: 68, r: 5.2, bias: -0.06 },
        { dx: 0, topY: 62, r: 6.0, bias: 0.04 },
      ]
    : [
        { dx: -8, topY: 82, r: 4.2, bias: 0.14 },
        { dx: 8, topY: 84, r: 4.0, bias: -0.14 },
        { dx: -2, topY: 70, r: 5.2, bias: 0.06 },
        { dx: 4, topY: 72, r: 4.8, bias: -0.08 },
      ];

  for (const p of pipes) {
    c.sculptBezierTube(
      'l02_roots_trunk',
      [cx + p.dx * 1.12, baseY - 2],
      [cx + p.dx * 0.92 + lean * 0.5, (baseY + p.topY) * 0.52],
      [cx + p.dx * 1.05 + lean, p.topY],
      p.r * 1.1,
      p.r * 0.82,
      REED_RAMP,
      { lightBias: p.bias, outlineDark: 'T0', outlineLight: 'T5' }
    );
    for (let s = 0; s < 2; s++) {
      const sy = Math.round(p.topY + 18 + s * 24);
      const sx = Math.round(cx + p.dx + lean * 0.45);
      c.line('l02_roots_trunk', sx, sy, sx, sy + 7, 'T0');
      c.line('l02_roots_trunk', sx + 1, sy + 1, sx + 1, sy + 6, 'T1');
      c.line('l02_roots_trunk', sx - 1, sy + 1, sx - 1, sy + 6, 'T5');
    }
  }
  // Velvety emerald moss patches hugging root knuckles
  c.sculptVolume('l02_roots_trunk', cx - 14, baseY - 4, 6.0, 2.8, MOSS_RAMP, { lightBias: 0.06 });
  c.sculptVolume('l02_roots_trunk', cx + 10, baseY - 1, 5.0, 2.5, MOSS_RAMP, { lightBias: -0.05 });

  // 3. TRUE PAINTERLY SCALLOPED CANOPY CROWN (NO internal black circles — organic leaf mass!)
  const ccx = cx + lean;
  const lobes: Array<[number, number, number, number, number]> = variant === 'matriarch'
    ? [
        [ccx + 24, 70, 22, 16, -0.26],
        [ccx - 24, 70, 22, 16, -0.10],
        [ccx, 74, 24, 15, -0.20],
        [ccx + 30, 52, 20, 16, -0.14],
        [ccx - 30, 52, 22, 16, 0.04],
        [ccx + 12, 54, 22, 16, -0.04],
        [ccx - 10, 54, 24, 17, 0.08],
        [ccx + 20, 34, 20, 15, 0.04],
        [ccx - 20, 34, 22, 16, 0.16],
        [ccx, 38, 25, 17, 0.14],
        [ccx - 10, 20, 19, 14, 0.26],
        [ccx + 10, 22, 18, 13, 0.16],
      ]
    : [
        [ccx + 20, 74, 20, 14, -0.24],
        [ccx - 18, 72, 20, 14, -0.10],
        [ccx + 24, 56, 19, 15, -0.12],
        [ccx - 24, 54, 20, 15, 0.06],
        [ccx + 2, 58, 22, 15, 0.04],
        [ccx + 14, 38, 18, 14, 0.06],
        [ccx - 14, 36, 20, 15, 0.18],
        [ccx - 2, 24, 18, 13, 0.26],
      ];

  // Unified deep spruce canopy silhouette base
  for (const [lx, ly, rx, ry] of lobes) {
    c.sculptVolume('l03_canopy_base', lx, ly + 2, rx + 1.5, ry + 1.5, ['G0', 'G0', 'G1', 'G1'], { lightBias: -0.30 });
  }
  // Organic blended painterly leaf pillows (NO outlineDark between lobes!) + hundreds of individual crisp leaf flecks!
  for (const [lx, ly, rx, ry, bias] of lobes) {
    c.sculptVolume('l04_canopy_paint', lx, ly, rx, ry, MOSS_RAMP, { lightBias: bias });
    // Handcrafted scalloped individual 2-3px leaf clusters sweeping across the sunlit crown of each bough!
    for (let k = 0; k < 14; k++) {
      const ang = (k / 14) * Math.PI * 2;
      const dist = 0.55 + hash2(Math.round(lx) + k, Math.round(ly), 907) * 0.44;
      const fx = Math.round(lx + Math.cos(ang) * rx * dist);
      const fy = Math.round(ly + Math.sin(ang) * ry * dist);
      const sunFactor = -Math.cos(ang) * 0.55 - Math.sin(ang) * 0.65 + bias;
      if (sunFactor > 0.22) {
        const hi = sunFactor > 0.48 ? 'G8' : sunFactor > 0.34 ? 'G7' : 'G6';
        c.px('l04_canopy_paint', fx, fy, hi);
        c.px('l04_canopy_paint', fx + 1, fy, 'G6');
        c.px('l04_canopy_paint', fx, fy + 1, 'G5');
      } else if (sunFactor < -0.28) {
        c.px('l04_canopy_paint', fx, fy, 'G1');
        c.px('l04_canopy_paint', fx + 1, fy, 'G0');
      }
    }
  }
  return c;
}

/** High-Res AST-005 (32x64) — Rimlands Native Flora Trio */
export function buildHighResFloraProp(kind: 'amber_kelp' | 'glasswort' | 'sundrop'): HighResCanvas {
  const W = 32;
  const H = 64;
  const c = new HighResCanvas(W, H, [
    { id: 'l01_shadow', name: '01 Ground Shadow' },
    { id: 'l02_flora', name: '02 Sculpted Rimlands Flora' },
    { id: 'l03_glow', name: '03 Bioluminescent Highlights' },
  ]);
  const cx = 16;
  const by = 58;

  for (let x = cx - 9; x <= cx + 9; x++) {
    for (let y = by - 2; y <= by + 3; y++) {
      if (Math.hypot((x - cx) / 9, (y - by) / 3) < 1) c.px('l01_shadow', x, y, 'SH', 100);
    }
  }

  if (kind === 'amber_kelp') {
    const KELP = ['F0', 'F1', 'F2', 'F3', 'F4'];
    c.sculptBezierTube('l02_flora', [cx - 2, by], [cx - 10, by - 18], [cx - 5, by - 38], 2.6, 1.1, KELP, { outlineDark: 'F0' });
    c.sculptBezierTube('l02_flora', [cx + 1, by], [cx + 9, by - 22], [cx + 2, by - 46], 3.0, 1.2, KELP, { lightBias: 0.10, outlineDark: 'F0' });
    c.sculptBezierTube('l02_flora', [cx + 4, by], [cx + 11, by - 14], [cx + 9, by - 30], 2.2, 0.9, KELP, { outlineDark: 'F0' });
    for (const [bx, by2, r] of [[cx - 7, by - 26, 2.8], [cx + 5, by - 34, 3.2], [cx + 1, by - 45, 2.5], [cx + 10, by - 22, 2.4]]) {
      c.sculptVolume('l02_flora', bx, by2, r, r * 1.15, ['F1', 'F2', 'F3', 'F4', 'F5'], { lightBias: 0.18, outlineDark: 'F0' });
      c.px('l03_glow', bx - 1, by2 - 1, 'F5');
    }
  } else if (kind === 'glasswort') {
    const spires: Array<[number, number, number, number]> = [
      [cx - 6, by, 4, 22], [cx + 6, by, 4, 26], [cx - 1, by + 1, 6, 36], [cx + 3, by + 1, 4, 18],
    ];
    for (const [sx, sy, sw, sh] of spires) {
      for (let ly = 0; ly < sh; ly++) {
        const taper = ly < 6 ? ly / 6 : 1.0;
        const hw = Math.max(1, Math.round((sw * 0.5) * taper));
        for (let dx = -hw; dx <= hw; dx++) {
          let tok = 'C1';
          if (dx === -hw || dx === hw || ly === 0) tok = 'C0';
          else if (dx < 0) tok = ly < sh * 0.45 ? 'C3' : 'C2';
          else tok = ly < sh * 0.3 ? 'C2' : 'C1';
          c.px('l02_flora', sx + dx, sy - sh + ly, tok);
        }
      }
      c.px('l03_glow', sx - 1, sy - sh + 2, 'C3');
    }
  } else {
    c.sculptBezierTube('l02_flora', [cx, by], [cx - 9, by - 6], [cx - 12, by - 14], 3.0, 1.4, MOSS_RAMP, { outlineDark: 'G0' });
    c.sculptBezierTube('l02_flora', [cx, by], [cx + 9, by - 5], [cx + 12, by - 13], 3.0, 1.4, MOSS_RAMP, { lightBias: -0.08, outlineDark: 'G0' });
    c.sculptBezierTube('l02_flora', [cx, by], [cx - 1, by - 14], [cx + 1, by - 26], 2.2, 1.4, MOSS_RAMP, { outlineDark: 'G0' });
    const fy = by - 28;
    c.sculptVolume('l02_flora', cx - 4, fy + 1, 4.2, 3.6, ['F1', 'F2', 'F3', 'F4', 'F5'], { lightBias: 0.14, outlineDark: 'F0' });
    c.sculptVolume('l02_flora', cx + 4, fy + 1, 4.2, 3.6, ['F1', 'F2', 'F3', 'F4', 'F5'], { lightBias: 0.02, outlineDark: 'F0' });
    c.sculptVolume('l02_flora', cx, fy - 3, 4.5, 4.2, ['F1', 'F2', 'F3', 'F4', 'F5'], { lightBias: 0.24, outlineDark: 'F0' });
    c.sculptVolume('l03_glow', cx, fy, 2.4, 2.2, ['F4', 'F5', 'L3'], { lightBias: 0.35 });
  }
  return c;
}

/**
 * PASS 2 REBUILT AST-006 (152x96) — True Conical-Beveled Crashed ICV Meridian Orbital Drop-Pod!
 * Angular faceted aerospace hull (ZERO round egg shape!), twin scorched rear thruster bells,
 * ceramic heat-tile panel grooves, bold terracotta stripe, glowing fractured cyan cockpit glass,
 * bent parabolic comm-dish with pulsing beacon, and deep plowed sand impact crater!
 */
export function buildHighResDropPod(): HighResCanvas {
  const W = 152;
  const H = 96;
  const c = new HighResCanvas(W, H, [
    { id: 'l01_furrow_shadow', name: '01 Impact Skid Trench & Sand Berm' },
    { id: 'l02_thrusters_dish', name: '02 Scorched Thruster Bells & Bent Dish' },
    { id: 'l03_hull_shell', name: '03 Faceted Conical Aerospace Capsule Hull' },
    { id: 'l04_viewport_glow', name: '04 Armored Cyan Cockpit Glass & Beacon' },
  ]);

  // 1. Long plowed impact skid furrow & churned dark soot trench!
  for (let y = 52; y <= 92; y++) {
    for (let x = 6; x <= 146; x++) {
      const r = Math.hypot((x - 78) / 68, (y - 74) / 14);
      if (r < 1.0) c.px('l01_furrow_shadow', x, y, r < 0.56 ? 'SH' : 'D0', r < 0.56 ? 170 : 125);
    }
  }
  // Raised displaced sand impact berm around nose cone!
  c.sculptBezierTube('l01_furrow_shadow', [44, 78], [92, 88], [136, 78], 5.5, 3.8, ['D0', 'D1', 'D2', 'D3', 'D4'], { lightBias: 0.06 });

  // 2. Twin Scorched Titanium Rear Thruster Nozzles protruding from angled stern!
  for (const [tx, ty, tr] of [[24, 46, 7.5], [22, 62, 8.0]]) {
    c.sculptVolume('l02_thrusters_dish', tx, ty, tr * 1.15, tr, ['M0', 'M0', 'M1', 'M2', 'M3'], { tiltDeg: -10, outlineDark: 'M0' });
    c.sculptVolume('l02_thrusters_dish', tx - 3, ty + 1, tr * 0.55, tr * 0.65, ['S0', 'M0', 'M1']);
  }

  // 3. Bent Orbital Comm-Dish Mast welded solidly into upper capsule spine + Glowing Ruby Distress Beacon!
  c.line('l02_thrusters_dish', 58, 34, 50, 12, 'M4');
  c.line('l02_thrusters_dish', 59, 34, 51, 12, 'M1');
  c.sculptBeveledBox('l02_thrusters_dish', 55, 29, 7, 5, METAL_RAMP);
  c.sculptVolume('l02_thrusters_dish', 46, 13, 9, 5, METAL_RAMP, { tiltDeg: -24, lightBias: 0.14, outlineDark: 'M0', outlineLight: 'M5' });
  c.px('l04_viewport_glow', 43, 9, 'R1');
  c.px('l04_viewport_glow', 44, 9, 'R1');

  // 4. TRUE TAPERED CONICAL AEROSPACE CAPSULE FUSELAGE (pitched ~10 deg nose-down into impact berm!)
  // X spans 28 (blunt stern bulkhead) -> 128 (blunt scorched carbon-ceramic heat-shield nose!)
  for (let x = 28; x <= 128; x++) {
    const t = (x - 28) / 100; // 0 = stern, 1 = nose
    const cy = 48 + t * 14; // nose pitched downwards into sand!
    // Tapered aerospace capsule half-height profile: broad hexagonal stern tapering cleanly to blunt heat-shield nose!
    let halfH = 26 * (1 - t * 0.42);
    if (t > 0.86) {
      const nt = (t - 0.86) / 0.14;
      halfH *= Math.sqrt(Math.max(0, 1 - nt * nt));
    }
    const y0 = Math.round(cy - halfH);
    const y1 = Math.round(cy + halfH);

    for (let y = y0; y <= y1; y++) {
      const ny = (y - cy) / Math.max(1, halfH); // -1 top spine, +1 underside
      const isBorder = y === y0 || y === y1 || x === 28 || x === 128;
      if (isBorder) {
        c.px('l03_hull_shell', x, y, ny < -0.3 ? 'M4' : 'M0');
        continue;
      }

      // Vertical spacecraft heat-tile bulkhead panel seams!
      const isSeam = x === 48 || x === 72 || x === 96 || x === 112 || Math.abs(ny + 0.35) < 0.05 || Math.abs(ny - 0.32) < 0.05;
      // Scorched carbon-ceramic re-entry heat-shield nose cap (t > 0.82)
      const isHeatShield = t > 0.82;
      // Bold angled ICV Meridian terracotta expedition hull band (0.34 < t < 0.56)
      const isOrangeBand = t > 0.34 && t < 0.56;

      let tok: string;
      if (isHeatShield) {
        tok = ny < -0.45 ? 'M3' : ny < 0.0 ? 'M2' : ny < 0.45 ? 'M1' : 'M0';
      } else if (isOrangeBand) {
        tok = isSeam ? 'S1' : ny < -0.52 ? 'S6' : ny < -0.15 ? 'S5' : ny < 0.25 ? 'S4' : ny < 0.58 ? 'S3' : 'S1';
      } else {
        tok = isSeam ? 'M1' : ny < -0.56 ? 'M6' : ny < -0.22 ? 'M5' : ny < 0.18 ? 'M4' : ny < 0.52 ? 'M3' : 'M1';
      }
      // Re-entry soot scorch streaks feathering back from nose along lower belly!
      if (ny > 0.48 && t > 0.55 && hash2(x, y, 419) > 0.55) tok = 'M1';
      c.px('l03_hull_shell', x, y, tok);
    }
  }

  // 5. Recessed Beveled Side Crew Hatch (stern-mid) + Glowing Fractured Cyan Cockpit Viewport (forward-upper)!
  c.sculptBeveledBox('l03_hull_shell', 35, 36, 17, 20, ['M0', 'M1', 'M2', 'M3', 'M4'], { roundCorners: true });
  c.px('l04_viewport_glow', 39, 41, 'O3');
  c.px('l04_viewport_glow', 39, 44, 'R1');

  // Beveled trapezoidal cockpit window glowing brightly from live interior cyan console!
  c.sculptBeveledBox('l04_viewport_glow', 81, 41, 22, 13, ['M0', 'M1', 'M3', 'M5'], { roundCorners: true });
  for (let y = 43; y <= 51; y++) {
    for (let x = 83; x <= 100; x++) {
      const grad = (y - 43) / 8;
      let tok = grad < 0.30 ? 'L2' : grad < 0.65 ? 'V3' : 'V1';
      if (y === 44 && x >= 85 && x <= 93) tok = 'L3'; // curved specular glass glint!
      c.px('l04_viewport_glow', x, y, tok);
    }
  }
  // Subtle interior glowing console telemetry trace visible through window!
  c.line('l04_viewport_glow', 86, 48, 96, 48, 'O3');
  c.px('l04_viewport_glow', 97, 46, 'R1');

  return c;
}

/** High-Res AST-006B (64x56) — Weathered Geodesic Field Camp Tent + Riveted Supply Crate! */
export function buildHighResCampTent(): HighResCanvas {
  const W = 80;
  const H = 60;
  const c = new HighResCanvas(W, H, [
    { id: 'l01_shadow', name: '01 Tent & Crate Shadows' },
    { id: 'l02_canopy', name: '02 Geodesic Terracotta Canvas & Supply Crate' },
    { id: 'l03_interior', name: '03 Warm Lantern Interior Glow' },
  ]);
  for (let y = 38; y <= 55; y++) {
    for (let x = 6; x <= 58; x++) {
      if (Math.hypot((x - 32) / 26, (y - 46) / 8) < 1) c.px('l01_shadow', x, y, 'SH', 120);
    }
  }
  c.line('l01_shadow', 14, 36, 6, 48, 'B3');
  c.line('l01_shadow', 50, 36, 58, 48, 'B2');
  c.px('l01_shadow', 6, 48, 'M4');
  c.px('l01_shadow', 58, 48, 'M4');

  c.sculptVolume('l02_canopy', 32, 36, 22, 19, SUIT_RAMP, { lightBias: 0.08, outlineDark: 'S0', outlineLight: 'S5' });
  for (let y = 48; y < H; y++) for (let x = 0; x < 62; x++) c.px('l02_canopy', x, y, '.');
  c.sculptBezierTube('l02_canopy', [12, 46], [22, 18], [36, 18], 1.1, 1.1, METAL_RAMP);
  c.sculptBezierTube('l02_canopy', [52, 46], [44, 20], [32, 18], 1.1, 1.1, METAL_RAMP, { lightBias: -0.1 });

  for (let y = 28; y <= 47; y++) {
    const t = (y - 28) / 19;
    const hw = Math.round(t * 9);
    for (let x = 34 - hw; x <= 34 + hw; x++) {
      const distC = Math.abs(x - 34) / Math.max(1, hw);
      const tok = distC < 0.4 && y > 36 ? 'F4' : distC < 0.7 && y > 33 ? 'F3' : y > 32 ? 'S2' : 'S0';
      c.px('l03_interior', x, y, tok);
    }
  }
  for (let y = 47; y <= 53; y++) {
    for (let x = 22; x <= 46; x++) {
      const r = Math.hypot((x - 34) / 12, (y - 48) / 5);
      if (r < 1) c.px('l03_interior', x, y, 'F4', Math.round((1 - r) * 115));
    }
  }

  // Riveted brushed-titanium Meridian Expedition Supply Crate resting right next to tent!
  for (let y = 46; y <= 54; y++) for (let x = 58; x <= 77; x++) c.px('l01_shadow', x, y, 'SH', 110);
  c.sculptBeveledBox('l02_canopy', 58, 36, 18, 14, METAL_RAMP, { roundCorners: true });
  c.line('l02_canopy', 60, 41, 74, 41, 'S5'); // orange hazard lid band
  c.line('l02_canopy', 60, 42, 74, 42, 'S3');
  c.px('l03_interior', 67, 41, 'M6'); // metal clasp!

  return c;
}

export function stampHighResHarmonicField(
  dst: Uint8ClampedArray,
  dw: number,
  dh: number,
  cx: number,
  cy: number,
  radiusX: number,
  radiusY: number
): void {
  const blend = (x: number, y: number, tok: string, alpha: number) => {
    if (x < 0 || y < 0 || x >= dw || y >= dh) return;
    const col = HR_COL[tok];
    const sa = alpha / 255;
    const di = (y * dw + x) * 4;
    dst[di] = Math.round(col.r * sa + dst[di] * (1 - sa));
    dst[di + 1] = Math.round(col.g * sa + dst[di + 1] * (1 - sa));
    dst[di + 2] = Math.round(col.b * sa + dst[di + 2] * (1 - sa));
    dst[di + 3] = 255;
  };

  for (let y = Math.floor(cy - radiusY - 4); y <= Math.ceil(cy + radiusY + 4); y++) {
    for (let x = Math.floor(cx - radiusX - 4); x <= Math.ceil(cx + radiusX + 4); x++) {
      const r = Math.hypot((x - cx) / radiusX, (y - cy) / radiusY);
      if (r > 1.06) continue;
      if (r < 0.96) blend(x, y, 'L0', Math.round((1 - r) * 48 + 14));
      for (const ringR of [0.42, 0.72, 0.98]) {
        const d = Math.abs(r - ringR);
        if (d < 0.045) {
          const ang = Math.atan2((y - cy) / radiusY, (x - cx) / radiusX);
          const pulse = 0.65 + 0.35 * Math.sin(ang * 6);
          const tok = d < 0.018 && pulse > 0.85 ? 'L3' : ringR > 0.8 ? 'L2' : 'L1';
          blend(x, y, tok, Math.round((1 - d / 0.045) * 215 * pulse));
        }
      }
    }
  }
}

export function stampHighResShadow(
  dst: Uint8ClampedArray,
  dw: number,
  dh: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
): void {
  const sh = HR_COL.SH;
  for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) {
    for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
      if (x < 0 || y < 0 || x >= dw || y >= dh) continue;
      const r = Math.hypot((x - cx) / rx, (y - cy) / ry);
      if (r > 1.0) continue;
      const sa = r < 0.55 ? 0.52 : r < 0.82 ? 0.30 : 0.14;
      const di = (y * dw + x) * 4;
      dst[di] = Math.round(sh.r * sa + dst[di] * (1 - sa));
      dst[di + 1] = Math.round(sh.g * sa + dst[di + 1] * (1 - sa));
      dst[di + 2] = Math.round(sh.b * sa + dst[di + 2] * (1 - sa));
      dst[di + 3] = 255;
    }
  }
}

/**
 * PASS 2 BREATHTAKING 640x360 HIGH-RESOLUTION LIVING VERTICAL SLICE SHOWCASE!
 * Sweeping seamless non-grid painterly world directly honoring IMG_20261126_155715.jpg!
 */
export function buildVerticalSlice640x360(
  maraScanBuf: Uint8ClampedArray,
  maraWalkBuf: Uint8ClampedArray,
  maraCrouchBuf: Uint8ClampedArray
): Uint8ClampedArray {
  const W = 640;
  const H = 360;
  const c = new HighResCanvas(W, H, TERRAIN_STUDY_LAYERS);

  // 1. SWEEPING ORGANIC PAINTERLY COAST-TO-BLUFF-TO-CANOPY LANDSCAPE (ZERO 32px dot repetition!)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // Smooth non-periodic multi-scale noise across entire 640x360 canvas!
      const nMacro = smoothNoise(x * 0.009, y * 0.009, 64, 64, 211);
      const nMid = smoothNoise(x * 0.024, y * 0.024, 96, 96, 419);
      const nFine = smoothNoise(x * 0.075, y * 0.075, 128, 128, 617);
      const nWave = Math.sin(y * 0.21 + x * 0.03 + nMacro * 4.5);

      // Sweeping Amber Coast ocean shoreline curving gracefully from top-left toward lower-left
      const shoreX = 112 + Math.sin(y * 0.017) * 32 + (y / H) * 44 + (nMacro - 0.5) * 40;

      // Believable continuous Northern Coastal Bluff curving from ocean headland (x=shoreX) smoothly off the top-right ridge!
      const cliffTopY = 66 - Math.max(0, (x - 280) * 0.24) + Math.sin(x * 0.015) * 12 + (nMacro - 0.5) * 16;
      const cliffBotY = cliffTopY + 46 + (nMid - 0.5) * 8;
      const inNorthernBluff = x > shoreX - 4 && y >= cliffTopY && y <= cliffBotY && cliffBotY > 4;

      // Lush Singing Canopy meadow advancing gently from upper-right & right over ochre beach!
      const mossEdgeX = 278 + Math.sin(y * 0.022 + 0.7) * 40 + (nMacro - 0.5) * 52 + (nMid - 0.5) * 18;
      // Subtle warm worn woodland footpath curving gracefully from drop-pod clearing to camp tent!
      const trailCenterY = 236 - (x - 280) * 0.16 + Math.sin(x * 0.025) * 18;
      const distTrail = Math.abs(y - trailCenterY);
      const onTrail = x > 260 && x < 485 && distTrail < 12 + (nMid - 0.5) * 8;

      if (x < shoreX && !(inNorthernBluff && x > shoreX - 10)) {
        const d = shoreX - x;
        let tok = 'W0';
        if (d < 5 + nFine * 4) tok = hash2(x, y, 911) > 0.30 ? 'W6' : 'W5';
        else if (d < 16 + nMid * 8) tok = nWave > 0.55 && nFine > 0.5 ? 'W5' : nMid > 0.44 ? 'W4' : 'W3';
        else if (d < 52) tok = nWave > 0.62 ? 'W4' : nWave > -0.15 ? 'W3' : 'W2';
        else tok = nWave > 0.62 && nMacro > 0.45 ? 'W2' : nWave > -0.25 ? 'W1' : 'W0';
        c.px('l01_base_terrain', x, y, tok);
      } else if (inNorthernBluff) {
        const ly = (y - cliffTopY) / Math.max(1, cliffBotY - cliffTopY);
        const strata = (ly * 3.5 + x * 0.006 + nMid * 0.40) % 1.0;
        // Chiseled vertical-diagonal geological fracture seams (zero circular noise loops!)
        const fault = Math.abs(Math.sin(x * 0.11 + ly * 1.4 + nMid * 2.2));
        let tok = 'K3';
        if (ly < 0.17 + nFine * 0.07) tok = ly < 0.09 ? 'G6' : nFine > 0.5 ? 'G4' : 'G2';
        else if (ly > 0.91) tok = 'K0';
        else if (fault < 0.045 && ly > 0.20) tok = 'K0';
        else if (strata < 0.15) tok = 'K1';
        else if (strata < 0.30) tok = nFine > 0.52 ? 'K5' : 'K4';
        else if (strata > 0.62 && strata < 0.68 && nMid > 0.44) tok = nFine > 0.54 ? 'K6' : 'K5';
        else tok = nFine > 0.52 ? 'K3' : 'K2';
        c.px('l02_geology_roots', x, y, tok);
      } else if (x > mossEdgeX || y < cliffTopY) {
        // SWEEPING PAINTERLY MEADOW WASHES (rich canopy shadow drifts + golden sunlit clearings!)
        const sunPool = nMacro * 0.68 + nMid * 0.32;
        let tok = 'G4';
        if (onTrail && distTrail < 7 + (nFine - 0.5) * 4) {
          // Warm worn earthy sandy footpath leading from clearing to camp!
          tok = nFine > 0.6 ? 'D2' : nFine > 0.3 ? 'D1' : 'G3';
        } else if (sunPool > 0.62) {
          tok = nFine > 0.66 ? 'G6' : 'G5';
        } else if (sunPool > 0.44) {
          tok = nFine > 0.62 ? 'G5' : 'G4';
        } else if (sunPool > 0.28) {
          tok = nFine > 0.60 ? 'G3' : 'G2';
        } else {
          tok = nFine > 0.60 ? 'G2' : 'G1';
        }
        // Dark mossy undercut lip where meadow overlaps beach sand!
        if (x >= mossEdgeX && x < mossEdgeX + 4 && y > cliffBotY) tok = nFine > 0.45 ? 'G1' : 'D0';
        c.px('l01_base_terrain', x, y, tok);
      } else {
        const distWet = x - shoreX;
        const ripple = Math.sin(x * 0.13 + y * 0.07 + nMacro * 5.0);
        let tok = 'D3';
        if (distWet < 8 + nFine * 4) tok = nFine > 0.72 ? 'D1' : 'D0';
        else if (distWet < 20 + nMid * 8) tok = ripple > 0.25 ? 'D2' : 'D1';
        else {
          if (ripple > 0.52 && nMacro > 0.42) tok = 'D4';
          else if (ripple < -0.45 && nMacro < 0.58) tok = 'D2';
          else tok = 'D3';
          if (hash2(x, y, 521) > 0.988 && ripple > 0.35) tok = 'D5';
        }
        c.px('l01_base_terrain', x, y, tok);
      }
    }
  }

  // 2. CLIFF-FOOT TALUS BOULDERS, ORGANIC ROOTS RADIATING FROM REEDWOODS & SHALLOW WAVE RIPPLES!
  for (const [bx, by, r] of [[156, 114, 7.5], [198, 120, 6.2], [252, 114, 7.0], [322, 98, 6.0], [164, 214, 5.2]]) {
    c.sculptVolume('l02_geology_roots', bx, by, r, r * 0.68, CLIFF_RAMP, { outlineDark: 'K0', outlineLight: 'K4' });
  }
  // Gnarled branching roots anchored directly to our Singing Reedwood trees!
  paintGnarledRoot(c, 558, 150, 502, 168, -10, 4.0, 1.4, 31);
  paintGnarledRoot(c, 578, 326, 514, 336, -12, 4.2, 1.5, 47);

  // Delicate shallow-water tide ripples
  for (const [wx, wy, wr] of [[72, 248, 18], [100, 192, 14], [88, 308, 20]]) {
    for (let a = 0; a < Math.PI * 2; a += 0.14) {
      const px = Math.round(wx + Math.cos(a) * wr);
      const py = Math.round(wy + Math.sin(a) * wr * 0.42);
      if (px > 10 && px < 140) c.px('l03_foliage_detail', px, py, Math.sin(a) < 0 ? 'W5' : 'W4', 180);
    }
  }

  // Handcrafted varied multi-blade grass & wildflower tufts clustered naturally around meadow edges & clearings!
  for (let i = 0; i < 110; i++) {
    const gx = Math.round(295 + hash2(i, 11, 701) * 330);
    const gy = Math.round(16 + hash2(i, 29, 709) * 332);
    const sunlit = hash2(i, 73, 719) > 0.44;
    paintMeadowCluster(c, 'l03_foliage_detail', gx, gy, i % 4 === 0 ? 3 : 2, sunlit, i % 10 === 0);
  }
  // Beach pebbles & tide shells
  for (let i = 0; i < 24; i++) {
    const sx = Math.round(140 + hash2(i, 13, 331) * 135);
    const sy = Math.round(140 + hash2(i, 37, 337) * 204);
    c.px('l03_foliage_detail', sx, sy + 1, 'D0');
    c.px('l03_foliage_detail', sx, sy, 'D5');
    c.px('l03_foliage_detail', sx + 1, sy, 'D4');
  }

  const out = c.composite();

  // 3. COMPOSITE ALL HIGH-RES LANDMARKS, PROPS, HERO POSES & HARMONIC VFX IN TRUE Y-SORT ORDER!
  const treeMatriarch = buildHighResReedwoodTree('matriarch').composite();
  const treeGrove = buildHighResReedwoodTree('grove').composite();
  const dropPod = buildHighResDropPod().composite();
  const tentAndCrate = buildHighResCampTent().composite();
  const kelp = buildHighResFloraProp('amber_kelp').composite();
  const glasswort = buildHighResFloraProp('glasswort').composite();
  const sundrop = buildHighResFloraProp('sundrop').composite();

  const blit = (src: Uint8ClampedArray, sw: number, sh: number, dx: number, dy: number) => {
    for (let y = 0; y < sh; y++) {
      const ty = dy + y;
      if (ty < 0 || ty >= H) continue;
      for (let x = 0; x < sw; x++) {
        const tx = dx + x;
        if (tx < 0 || tx >= W) continue;
        const si = (y * sw + x) * 4;
        const sa = src[si + 3] / 255;
        if (sa <= 0) continue;
        const di = (ty * W + tx) * 4;
        if (sa >= 0.999) {
          out[di] = src[si]; out[di + 1] = src[si + 1]; out[di + 2] = src[si + 2]; out[di + 3] = 255;
        } else {
          out[di] = Math.round(src[si] * sa + out[di] * (1 - sa));
          out[di + 1] = Math.round(src[si + 1] * sa + out[di + 1] * (1 - sa));
          out[di + 2] = Math.round(src[si + 2] * sa + out[di + 2] * (1 - sa));
          out[di + 3] = 255;
        }
      }
    }
  };

  // Northern ridge Singing Reedwood grove (two distinct silhouettes!)
  blit(treeGrove, 112, 168, 404, -36);
  blit(treeMatriarch, 112, 168, 514, -4);

  // Crashed Conical ICV Meridian Orbital Drop-Pod & Lantern Camp Tent + Supply Crate!
  blit(dropPod, 152, 96, 186, 116);
  blit(tentAndCrate, 80, 60, 354, 134);

  // Rimlands Tide-Kelp, Mirror Glasswort & Sun-Drop Blossoms
  blit(kelp, 32, 64, 120, 164);
  blit(glasswort, 32, 64, 152, 198);
  blit(kelp, 32, 64, 140, 272);
  blit(glasswort, 32, 64, 190, 296);
  blit(sundrop, 32, 64, 384, 198);
  blit(sundrop, 32, 64, 466, 214);
  blit(sundrop, 32, 64, 520, 190);

  // HERO CENTERPIECE: Layered High-Res Acoustic Field Lens Resonance Field!
  stampHighResHarmonicField(out, W, H, 376, 246, 54, 26);

  // Native 48x64 Dr. Mara Lin in 3 iconic field-craft stances across both biomes!
  stampHighResShadow(out, W, H, 312, 252, 14, 5);
  blit(maraScanBuf, 48, 64, 290, 192);

  stampHighResShadow(out, W, H, 224, 286, 14, 5);
  blit(maraWalkBuf, 48, 64, 201, 226);

  stampHighResShadow(out, W, H, 444, 274, 15, 5);
  blit(maraCrouchBuf, 48, 64, 421, 214);

  // Foreground Matriarch Singing Reedwood framing bottom-right depth!
  blit(treeMatriarch, 112, 168, 526, 180);

  return out;
}
