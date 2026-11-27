/**
 * VERDANT SIGNAL V4.0 — SINGING CANOPY ALIEN FOREST, LANDMARK PROPS, VFX & VERTICAL SLICE
 * =======================================================================================
 * Pass-2 Masterpiece Overhaul:
 *   - AST-004 Singing Reedwood Tree (160x224): TRUE hand-painted layered organic leaf-cluster
 *     crown (ZERO mechanical checkerboard sphere!), glowing turquoise wind-slits, sprawling
 *     mossy root buttresses, and surgically clipped violet shelf-fungi (ZERO rectangular bleed!)
 *   - AST-005 Alien Flora: Sun-Drop Orchids, Terraced Violet-Magenta Shelf-Fungi, Feathered Ferns
 *   - AST-006 Narrative Crashed ICV Meridian Drop-Pod & Camp Diorama (240x152): curved rounded
 *     pressurized stern bulkhead cowling, beveled aerospace hull ribs, buckled landing strut,
 *     torn scorched cables, shredded thermal gold MLI, glowing cyan holo-bay & cozy lantern tarp!
 *   - AST-007 Luminous Layered Harmonic Lens, Water Ripple & Bioluminescent Spore VFX (256x128)
 *   - Singing Canopy Alien Forest Sanctuary (640x360): shimmering crystal creek (ZERO Worley
 *     spiderweb!), clean mossy elliptical stepping stones, waterfall cascade, hollow log & sunbeams!
 *   - Crown-Jewel Single-Hero Unified V4.0 Vertical Slice (640x360 & 1280x720)!
 */

import { V4Canvas, blitV4, hash2v4, smoothNoiseV4 } from './v4Core';
import { paintV4Glasswort, paintV4TideKelp } from './v4AmberCoastOcean';

const REED_RAMP = ['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
const METAL_RAMP = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
const SUIT_RAMP = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'];
const CLIFF_RAMP = ['K0', 'K1', 'K2', 'K3', 'K4', 'K5'];
const FUNGI_RAMP = ['P0', 'P1', 'P2', 'P3'];

/** Paint lush radial feathered woodland fern cluster */
export function paintV4Fern(c: V4Canvas, layer: string, cx: number, cy: number, scale = 1.0): void {
  const fronds = [-152, -120, -86, -48, -20, 10];
  for (let i = 0; i < fronds.length; i++) {
    const rad = (fronds[i] * Math.PI) / 180;
    const len = (11 + (i % 2) * 4) * scale;
    const ex = cx + Math.cos(rad) * len;
    const ey = cy + Math.sin(rad) * len * 0.72;
    const bright = fronds[i] < -70;
    c.line(layer, cx, cy, ex, ey, bright ? 'G5' : 'G3');
    for (let s = 0.30; s <= 0.90; s += 0.22) {
      const mx = cx + (ex - cx) * s;
      const my = cy + (ey - cy) * s;
      const px = -Math.sin(rad) * 2.5 * scale * (1 - s * 0.4);
      const py = Math.cos(rad) * 2.0 * scale * (1 - s * 0.4);
      c.px(layer, mx + px, my + py, bright ? 'G7' : 'G5');
      c.px(layer, mx - px, my - py, bright ? 'G4' : 'G2');
    }
  }
  c.fillEllipse(layer, cx, cy + 1, 3.2 * scale, 1.5 * scale, 'G0');
}

/** Paint radiant bioluminescent Sun-Drop Orchid cluster! */
export function paintV4SunDropOrchid(c: V4Canvas, layer: string, glowLayer: string, bx: number, by: number, scale = 1.0): void {
  paintV4Fern(c, layer, bx, by, scale * 0.95);
  const heads: Array<[number, number, number]> = [
    [-7 * scale, -22 * scale, 0.82],
    [0, -31 * scale, 1.0],
    [7 * scale, -20 * scale, 0.78],
  ];
  for (const [dx, dy, hs] of heads) {
    c.paintTaperedSpline(layer, [[bx, by, 1.5 * scale], [bx + dx * 0.45, by + dy * 0.55, 1.1 * scale], [bx + dx, by + dy, 0.8 * scale]], 'G3');
    const fx = bx + dx;
    const fy = by + dy;
    const r = 4.2 * scale * hs;
    for (let y = Math.floor(fy - r * 2.4); y <= Math.ceil(fy + r * 2.4); y++) {
      for (let x = Math.floor(fx - r * 2.4); x <= Math.ceil(fx + r * 2.4); x++) {
        const d = Math.hypot(x - fx, y - fy) / (r * 2.4);
        if (d < 1.0) c.blendPx(glowLayer, x, y, 'F3', Math.round((1 - d) * 65));
      }
    }
    c.fillEllipse(layer, fx - r * 0.75, fy + r * 0.2, r * 0.8, r * 0.65, 'F2');
    c.fillEllipse(layer, fx + r * 0.75, fy + r * 0.2, r * 0.8, r * 0.65, 'F1');
    c.fillEllipse(layer, fx, fy - r * 0.45, r * 0.9, r * 0.85, 'F3');
    c.fillEllipse(layer, fx - r * 0.2, fy - r * 0.5, r * 0.5, r * 0.45, 'F4');
    c.px(glowLayer, fx, fy - r * 0.2, 'W9');
  }
}

/**
 * Paint terraced alien violet-magenta bioluminescent shelf-fungi cluster!
 * Uses strict `clipEllipse: true` — ZERO rectangular bleed onto parent trunks or logs!
 */
export function paintV4ShelfFungi(c: V4Canvas, layer: string, glowLayer: string, cx: number, cy: number, scale = 1.0): void {
  const shelves: Array<[number, number, number, number]> = [
    [-5.5 * scale, 2.5 * scale, 5.5 * scale, 2.6 * scale],
    [5.0 * scale, 0.5 * scale, 6.2 * scale, 2.8 * scale],
    [0, -3.5 * scale, 7.2 * scale, 3.2 * scale],
  ];
  for (const [dx, dy, rx, ry] of shelves) {
    const sx = cx + dx;
    const sy = cy + dy;
    c.fillEllipse(layer, sx, sy + ry * 0.55, rx * 0.92, ry * 0.65, 'P0'); // recessed dark gills
    c.fillEllipse(layer, sx, sy, rx, ry, 'P2');
    c.shadeMaskedRegion(layer, sx, sy, rx, ry, FUNGI_RAMP, {
      material: 'cloth',
      bias: 0.14,
      clipEllipse: true,
    });
    // Crisp glowing sunlit cap lip!
    c.line(layer, sx - rx * 0.65, sy - ry * 0.35, sx + rx * 0.35, sy - ry * 0.45, 'P3', 255, layer);
    for (let dyG = -4; dyG <= 4; dyG++) for (let dxG = -6; dxG <= 6; dxG++) {
      const d = Math.hypot(dxG / 6, dyG / 4);
      if (d < 1) c.blendPx(glowLayer, sx + dxG, sy + dyG, 'P3', Math.round((1 - d) * 52));
    }
  }
}

/** Paint a single organic hand-painted foliage leaf pillow (Eastward-style painterly clusters, ZERO Bayer grid & ZERO interior dark holes!) */
function paintLeafClusterLobe(
  c: V4Canvas,
  layer: string,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  shadowTok: string,
  midTok: string,
  litTok: string,
  rimTok: string | null,
  seed: number
): void {
  // 1. Deep under-hang crescent & outer shadow scallops FIRST (strictly framing the outer silhouette rim!)
  c.fillEllipse(layer, cx + 1.5, cy + 3.0, rx * 0.98, ry * 0.92, shadowTok);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + hash2v4(i, seed, 31) * 0.30;
    const lx = cx + Math.cos(a) * rx * 0.86;
    const ly = cy + Math.sin(a) * ry * 0.84;
    const lr = 2.6 + hash2v4(i, seed, 47) * 2.0;
    const isBottomRight = Math.cos(a) * 0.55 + Math.sin(a) * 0.78 > 0.15;
    c.fillEllipse(layer, lx + (isBottomRight ? 1 : 0), ly + (isBottomRight ? 1.5 : 0), lr, lr * 0.84, isBottomRight ? shadowTok : midTok);
  }
  // 2. Smooth overlapping mid-tone leaf body covering interior cleanly!
  c.fillEllipse(layer, cx, cy, rx * 0.94, ry * 0.88, midTok);
  // 3. Upper-left sunlit scalloped leaf crown + delicate crisp golden-dew highlight flecks!
  c.fillEllipse(layer, cx - rx * 0.16, cy - ry * 0.20, rx * 0.74, ry * 0.66, litTok);
  for (let i = 0; i < 8; i++) {
    const a = Math.PI * 0.88 + (i / 7) * Math.PI * 1.02;
    const lx = cx - rx * 0.10 + Math.cos(a) * rx * 0.58;
    const ly = cy - ry * 0.10 + Math.sin(a) * ry * 0.54;
    c.fillEllipse(layer, lx, ly, 2.8, 2.2, litTok);
    if (rimTok && i >= 1 && i <= 6) {
      c.px(layer, lx - 1, ly - 1, rimTok);
      c.px(layer, lx, ly - 1, rimTok);
      c.px(layer, lx - 1, ly, rimTok);
    }
  }
}

/** Paint a natural multi-lobe asymmetrical woodland shrub (3 overlapping organic leaf clusters!) */
function paintWoodlandBush(c: V4Canvas, layer: string, cx: number, cy: number, sc: number, seed: number): void {
  paintLeafClusterLobe(c, layer, cx + 8 * sc, cy + 2 * sc, 13 * sc, 8.5 * sc, 'G0', 'G1', 'G3', null, seed + 1);
  paintLeafClusterLobe(c, layer, cx - 9 * sc, cy + 2 * sc, 13 * sc, 9.0 * sc, 'G0', 'G2', 'G4', 'G6', seed + 2);
  paintLeafClusterLobe(c, layer, cx - 1 * sc, cy - 4 * sc, 14 * sc, 9.5 * sc, 'G1', 'G3', 'G5', 'G7', seed + 3);
}

// ============================================================================
// AST-004 V4.0 — SCULPTURAL SINGING REEDWOOD TREE (160x224)
// ============================================================================
export function buildV4ReedwoodMaster(variant: 'ancient' | 'windswept' = 'ancient'): {
  canvas: V4Canvas;
  vpfJson: string;
  width: number;
  height: number;
} {
  const W = 160;
  const H = 224;
  const c = new V4Canvas(W, H, [
    { id: 'l01_shadow', name: '01 Broad Dappled Forest Shadow' },
    { id: 'l02_roots_trunk', name: '02 Sprawling Root Arches & Organ-Pipe Trunk' },
    { id: 'l03_boughs_undercut', name: '03 Dark Interior Boughs & Spruce Undercut' },
    { id: 'l04_canopy_paint', name: '04 Hand-Painted Asymmetrical Leaf Cluster Crown' },
    { id: 'l05_glow_vines', name: '05 Acoustic Turquoise Wind-Slits, Fungi & Hanging Vines' },
  ]);
  const cx = 80;
  const baseY = 200;
  const lean = variant === 'windswept' ? 11 : -3;

  // Soft wide organic canopy ground shadow pool
  for (let y = baseY - 16; y <= baseY + 18; y++) {
    for (let x = cx - 58; x <= cx + 58; x++) {
      const r = Math.hypot((x - cx) / 56, (y - (baseY + 3)) / 16);
      if (r < 1.0) c.px('l01_shadow', x, y, 'SH', r < 0.58 ? 110 : 48);
    }
  }

  // 1. Sprawling Sculpted Buttress Root Arches gripping mossy woodland soil!
  const rootArcs: Array<Array<[number, number, number]>> = [
    [[cx - 10, baseY - 26, 7.5], [cx - 26, baseY - 8, 5.2], [cx - 48, baseY + 6, 2.2], [cx - 60, baseY + 10, 1.0]],
    [[cx - 3, baseY - 22, 6.8], [cx - 14, baseY + 2, 4.4], [cx - 26, baseY + 14, 1.6]],
    [[cx + 4, baseY - 22, 6.8], [cx + 16, baseY + 3, 4.4], [cx + 30, baseY + 13, 1.6]],
    [[cx + 11, baseY - 26, 7.2], [cx + 28, baseY - 6, 5.0], [cx + 52, baseY + 5, 2.0], [cx + 62, baseY + 8, 1.0]],
  ];
  for (const pts of rootArcs) c.paintTaperedSpline('l02_roots_trunk', pts, 'T3');

  // 2. Iconic Bundled Hollow Organ-Pipe Reedwood Stems flaring cleanly into crown boughs!
  const pipes = variant === 'ancient'
    ? [
        { dx: -15, topY: 96, r: 5.5 }, { dx: 15, topY: 100, r: 5.4 },
        { dx: -7, topY: 82, r: 6.6 }, { dx: 8, topY: 86, r: 6.4 }, { dx: 0, topY: 76, r: 7.4 },
      ]
    : [
        { dx: -11, topY: 102, r: 5.2 }, { dx: 11, topY: 104, r: 5.0 },
        { dx: -3, topY: 84, r: 6.6 }, { dx: 5, topY: 88, r: 6.0 },
      ];

  for (const p of pipes) {
    c.paintTaperedSpline('l02_roots_trunk', [
      [cx + p.dx * 1.25, baseY - 4, p.r * 1.25],
      [cx + p.dx * 0.95 + lean * 0.45, (baseY + p.topY) * 0.52, p.r * 0.92],
      [cx + p.dx * 1.15 + lean, p.topY, p.r * 0.80],
    ], 'T3');
  }
  // Unified painterly wood-grain shading across trunk & root flare!
  c.shadeMaskedRegion('l02_roots_trunk', cx + lean * 0.4, 145, 36, 70, REED_RAMP, {
    material: 'cloth',
    bias: 0.06,
    foldFn: (x) => Math.sin((x - cx) * 0.72) * 0.14,
  });

  // Glowing Turquoise Acoustic Wind-Slits carved along hollow reedwood pipes!
  for (const p of pipes) {
    for (let s = 0; s < 2; s++) {
      const sx = Math.round(cx + p.dx + lean * 0.45);
      const sy = Math.round(p.topY + 22 + s * 28);
      c.line('l02_roots_trunk', sx, sy, sx, sy + 10, 'T0');
      c.line('l02_roots_trunk', sx - 1, sy + 1, sx - 1, sy + 9, 'T5');
      c.line('l05_glow_vines', sx, sy + 3, sx, sy + 7, 'L1', 180);
      c.px('l05_glow_vines', sx, sy + 5, 'L2', 235);
    }
  }
  // Velvety emerald moss pads & SURGICAL violet shelf-fungi on root knuckle (painted onto l05 so ZERO bleed!)
  c.fillEllipse('l02_roots_trunk', cx - 20, baseY - 6, 9, 3.8, 'G4');
  c.fillEllipse('l02_roots_trunk', cx - 21, baseY - 7, 5.5, 2.2, 'G6');
  paintV4ShelfFungi(c, 'l05_glow_vines', 'l05_glow_vines', cx + 17, baseY - 11, 0.85);

  // 3. Visible Dark Interior Structural Boughs supporting the sweeping canopy!
  const ccx = cx + lean;
  c.paintTaperedSpline('l03_boughs_undercut', [[ccx - 4, 98, 5.5], [ccx - 28, 82, 3.5], [ccx - 46, 74, 2.0]], 'T1');
  c.paintTaperedSpline('l03_boughs_undercut', [[ccx + 4, 96, 5.5], [ccx + 30, 84, 3.5], [ccx + 48, 76, 2.0]], 'T1');

  // 4. TRUE HAND-PAINTED LAYERED ORGANIC LEAF-CLUSTER CROWN (ZERO Bayer checkerboard ball!)
  // Back-to-front depth stack: Deep dark shaded lower apron -> Mid-emerald bough clusters -> Radiant golden-sage upper crown!
  type Lobe = [number, number, number, number, string, string, string, string | null, number];
  const lobes: Lobe[] = variant === 'ancient'
    ? [
        // Deep backlit spruce under-canopy apron (gives strong silhouette & deep forest cool shadow!)
        [ccx + 36, 92, 24, 15, 'G0', 'G1', 'G2', null, 1],
        [ccx + 8, 96, 26, 15, 'G0', 'G1', 'G2', null, 2],
        [ccx - 28, 92, 26, 16, 'G0', 'G1', 'G3', null, 3],
        [ccx + 46, 72, 22, 16, 'G0', 'G1', 'G3', null, 4],
        // Mid-tier sweeping asymmetrical emerald leaf boughs
        [ccx + 22, 78, 25, 16, 'G1', 'G2', 'G4', null, 5],
        [ccx - 44, 70, 24, 17, 'G1', 'G3', 'G5', 'G6', 6],
        [ccx - 10, 78, 26, 17, 'G1', 'G3', 'G5', null, 7],
        [ccx + 34, 54, 22, 16, 'G1', 'G3', 'G5', null, 8],
        // Lush sunlit mid-upper foliage pillows catching golden 38 deg morning rays
        [ccx - 32, 50, 24, 17, 'G2', 'G4', 'G6', 'G7', 9],
        [ccx + 8, 54, 26, 18, 'G2', 'G4', 'G6', 'G7', 10],
        [ccx - 10, 42, 25, 17, 'G3', 'G5', 'G7', 'G8', 11],
        // Sun-kissed crown billows with crisp bright golden-dew leaf crests!
        [ccx + 18, 34, 20, 15, 'G2', 'G5', 'G7', 'G8', 12],
        [ccx - 20, 30, 22, 16, 'G3', 'G6', 'G7', 'G8', 13],
        [ccx - 2, 22, 19, 14, 'G4', 'G6', 'G8', 'G8', 14],
      ]
    : [
        [ccx + 30, 94, 22, 14, 'G0', 'G1', 'G2', null, 21],
        [ccx - 22, 92, 22, 15, 'G0', 'G1', 'G3', null, 22],
        [ccx + 36, 72, 22, 16, 'G0', 'G2', 'G4', null, 23],
        [ccx - 32, 72, 23, 16, 'G1', 'G3', 'G5', 'G6', 24],
        [ccx + 4, 76, 25, 16, 'G1', 'G3', 'G5', null, 25],
        [ccx + 22, 52, 22, 16, 'G2', 'G4', 'G6', 'G7', 26],
        [ccx - 18, 50, 23, 17, 'G2', 'G5', 'G7', 'G8', 27],
        [ccx + 0, 34, 22, 16, 'G3', 'G6', 'G8', 'G8', 28],
      ];

  for (const [lx, ly, rx, ry, sh, mid, lit, rim, seed] of lobes) {
    paintLeafClusterLobe(c, 'l04_canopy_paint', lx, ly, rx, ry, sh, mid, lit, rim, seed);
  }

  // Hanging Bioluminescent Spore Tendrils swaying softly from underside of dark canopy boughs!
  for (const [vx, vy, vlen] of [[ccx - 36, 94, 18], [ccx - 18, 98, 14], [ccx + 24, 96, 19], [ccx + 38, 90, 15]]) {
    c.line('l05_glow_vines', vx, vy, vx + 1, vy + vlen, 'G2');
    for (let d = 5; d <= vlen; d += 5) {
      c.px('l05_glow_vines', vx + (d > 10 ? 1 : 0), vy + d, d >= vlen - 2 ? 'L3' : 'L2');
    }
  }

  const vpfJson = c.serializeVpf({
    id: `v4_reedwood_${variant}`,
    name: `V4.0 MASTERPIECE — Singing Reedwood Tree (${variant}, 160x224)`,
    pivot: { x: cx, y: baseY },
    tileSize: 32,
    styleNotes: 'Pass-2 V4.0 Sculptural Singing Reedwood Tree: hand-painted layered organic leaf-cluster crown (zero Bayer grid), glowing turquoise wind-slits, mossy roots & surgical violet shelf-fungi.',
  });
  return { canvas: c, vpfJson, width: W, height: H };
}

// ============================================================================
// AST-006 V4.0 — NARRATIVE CRASHED ICV MERIDIAN ORBITAL DROP-POD DIORAMA (240x152)
// ============================================================================
export function buildV4DropPodNarrative(): {
  canvas: V4Canvas;
  vpfJson: string;
  width: number;
  height: number;
} {
  const W = 240;
  const H = 152;
  const c = new V4Canvas(W, H, [
    { id: 'l01_crater_trench', name: '01 Torn Impact Trench, Soot & Displaced Sand Berm' },
    { id: 'l02_thrusters_mast', name: '02 Curved Engine Cowling, Retro-Thrusters & Bent Dish' },
    { id: 'l03_lander_hull', name: '03 Curved Pressurized Aerospace Hull, Heat Tiles & Gold MLI' },
    { id: 'l04_tarp_camp', name: '04 Emergency Shelter Tarp, Field Workstation & Crates' },
    { id: 'l05_holo_glow', name: '05 Open Cyan Telemetry Bay, Hologram & Warm Lantern' },
  ]);

  // 1. ORGANIC TORN IMPACT CRATER & DISPLACED SAND BERM (ZERO sharp rectangular edges!)
  for (let y = 78; y <= 146; y++) {
    for (let x = 6; x <= 204; x++) {
      const n = smoothNoiseV4(x * 0.08, y * 0.08, 48, 48, 401);
      const r = Math.hypot((x - 102) / 96, (y - 116) / 22) + (n - 0.5) * 0.22;
      if (r < 0.96) {
        c.px('l01_crater_trench', x, y, r < 0.56 ? 'SH' : n > 0.48 ? 'D0' : 'K0', r < 0.56 ? 175 : 125);
      }
    }
  }
  // Curved churned earth berm heaped tightly around buried heat-shield nose & hull belly
  c.paintTaperedSpline('l01_crater_trench', [[44, 118, 6.5], [96, 128, 8.5], [154, 124, 8.0], [184, 110, 5.5]], 'D2');
  c.paintTaperedSpline('l01_crater_trench', [[52, 115, 4.0], [102, 124, 5.2], [154, 120, 5.0]], 'D4');
  c.fillEllipse('l01_crater_trench', 176, 124, 8, 4.8, 'K2');
  c.shadeMaskedRegion('l01_crater_trench', 176, 124, 8, 4.8, CLIFF_RAMP, { clipEllipse: true, bias: 0.1 });
  c.fillEllipse('l01_crater_trench', 44, 124, 6.5, 4, 'K2');
  c.shadeMaskedRegion('l01_crater_trench', 44, 124, 6.5, 4, CLIFF_RAMP, { clipEllipse: true, bias: 0.05 });

  // 2. CURVED ROUNDED REAR ENGINE COWLING + TWIN SCORCHED TITANIUM RETRO-THRUSTERS + BENT DISH!
  // Rounded pressurized rear aft-dome (eliminates the flat cut-wedge stern!)
  c.fillEllipse('l02_thrusters_mast', 40, 74, 16, 33, 'M2');
  c.shadeMaskedRegion('l02_thrusters_mast', 40, 74, 16, 33, METAL_RAMP, { material: 'metal', bias: -0.05, clipEllipse: true });
  for (const [tx, ty, r] of [[24, 66, 9], [22, 90, 10]]) {
    c.fillEllipse('l02_thrusters_mast', tx, ty, r * 1.05, r * 0.92, 'M1');
    c.shadeMaskedRegion('l02_thrusters_mast', tx, ty, r * 1.05, r * 0.92, METAL_RAMP, { material: 'metal', bias: -0.22, clipEllipse: true });
    c.fillEllipse('l02_thrusters_mast', tx - 3, ty + 1, r * 0.50, r * 0.58, 'S0');
  }
  // Buckled aluminum landing strut & torn trailing black/orange power cable spilling onto trench!
  c.line('l02_thrusters_mast', 52, 104, 34, 120, 'M3');
  c.line('l02_thrusters_mast', 53, 105, 35, 121, 'M1');
  c.fillEllipse('l02_thrusters_mast', 32, 121, 5, 2.2, 'M2');
  c.paintTaperedSpline('l02_thrusters_mast', [[40, 106, 1.2], [54, 118, 1.0], [72, 121, 0.9]], 'S1');

  // Bent Orbital Parabolic Comm-Dish welded firmly to dorsal collar + glowing Ruby Distress Beacon!
  c.line('l02_thrusters_mast', 78, 42, 64, 15, 'M4');
  c.line('l02_thrusters_mast', 79, 42, 65, 15, 'M1');
  c.fillPoly('l02_thrusters_mast', [[72, 38], [84, 38], [85, 46], [71, 46]], 'M2');
  c.fillEllipse('l02_thrusters_mast', 60, 16, 14, 7.2, 'M4');
  c.shadeMaskedRegion('l02_thrusters_mast', 60, 16, 14, 7.2, METAL_RAMP, { material: 'metal', bias: 0.16, clipEllipse: true });
  c.fillEllipse('l05_holo_glow', 56, 11, 2.0, 2.0, 'R1');
  for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) {
    const d = Math.hypot(dx, dy) / 6;
    if (d < 1) c.blendPx('l05_holo_glow', 56 + dx, 11 + dy, 'R1', Math.round((1 - d) * 95));
  }

  // 3. CURVED AEROSPACE PRESSURIZED ORBITAL LANDER HULL (Beveled Curved Crown + Meridian Band + Gold MLI!)
  for (let x = 38; x <= 178; x++) {
    const t = (x - 38) / 140;
    const cy = 72 + t * 22;
    // Smooth curved aerospace capsule ogive profile (rounded stern taper + domed blunt nose!)
    const sternRound = t < 0.08 ? Math.sqrt(Math.max(0.25, 1 - Math.pow((0.08 - t) / 0.08, 2) * 0.5)) : 1.0;
    const noseRound = t > 0.78 ? Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.78) / 0.22, 2))) : 1.0;
    const hh = 36 * (1 - t * 0.34) * sternRound * noseRound;
    const y0 = Math.round(cy - hh);
    const y1 = Math.round(cy + hh);
    for (let y = y0; y <= y1; y++) {
      const ny = (y - cy) / Math.max(1, hh);
      if (y === y0 || y === y1 || x === 178) {
        c.px('l03_lander_hull', x, y, ny < -0.35 ? 'M5' : 'M0');
        continue;
      }
      const isSeam = x === 66 || x === 96 || x === 128 || x === 152 || Math.abs(ny + 0.38) < 0.04 || Math.abs(ny - 0.36) < 0.04;
      const isHeatShield = t > 0.76;
      const isOrangeStripe = t > 0.38 && t < 0.56;
      const isGoldFoilBay = t > 0.16 && t < 0.28 && ny > 0.12 && ny < 0.62;

      let tok: string;
      if (isHeatShield) {
        tok = ny < -0.42 ? 'M3' : ny < 0.0 ? 'M2' : ny < 0.45 ? 'M1' : 'M0';
      } else if (isGoldFoilBay) {
        const crinkle = hash2v4(x >> 1, y >> 1, 71);
        tok = crinkle > 0.62 ? 'F4' : crinkle > 0.30 ? 'A1' : 'A0';
      } else if (isOrangeStripe) {
        tok = isSeam ? 'S1' : ny < -0.52 ? 'S6' : ny < -0.10 ? 'S5' : ny < 0.28 ? 'S4' : ny < 0.58 ? 'S3' : 'S1';
      } else {
        tok = isSeam ? 'M1' : ny < -0.58 ? 'M6' : ny < -0.22 ? 'M5' : ny < 0.18 ? 'M4' : ny < 0.54 ? 'M3' : 'M1';
      }
      if (ny > 0.44 && t > 0.48 && hash2v4(x, y, 419) > 0.54) tok = 'M1';
      c.px('l03_lander_hull', x, y, tok);
    }
  }

  // 4. OPEN HYDRAULIC CREW BAY SPILLING GLOWING CYAN TELEMETRY + FORWARD COCKPIT VIEWPORT!
  c.fillPoly('l03_lander_hull', [[54, 58], [78, 58], [78, 90], [54, 90]], 'V0');
  c.fillPoly('l03_lander_hull', [[56, 60], [76, 60], [76, 88], [56, 88]], 'V1');
  c.line('l05_holo_glow', 59, 67, 72, 67, 'L3');
  c.line('l05_holo_glow', 59, 72, 70, 72, 'L2');
  c.line('l05_holo_glow', 59, 77, 66, 77, 'G7');
  c.px('l05_holo_glow', 73, 65, 'R1');
  for (let y = 86; y <= 116; y++) {
    const spread = (y - 86) * 0.55;
    for (let x = Math.round(56 - spread); x <= Math.round(76 + spread); x++) {
      c.blendPx('l05_holo_glow', x, y, 'L1', Math.round((1 - (y - 86) / 30) * 82));
    }
  }
  c.fillPoly('l03_lander_hull', [[112, 62], [142, 66], [140, 84], [110, 80]], 'M0');
  c.fillPoly('l05_holo_glow', [[114, 64], [140, 68], [138, 82], [112, 78]], 'V1');
  c.line('l05_holo_glow', 116, 68, 134, 70, 'L3');
  c.line('l05_holo_glow', 116, 75, 132, 77, 'L2');
  c.px('l05_holo_glow', 135, 73, 'R1');

  // 5. PITCHED EMERGENCY EXPEDITION SHELTER TARP + WARM LANTERN FIELD WORKSTATION + RIVETED CRATES!
  c.line('l04_tarp_camp', 226, 76, 226, 128, 'M4');
  c.line('l04_tarp_camp', 227, 76, 227, 128, 'M1');
  c.line('l04_tarp_camp', 226, 76, 236, 128, 'B3');
  c.fillPoly('l04_tarp_camp', [[158, 66], [226, 76], [218, 96], [164, 92]], 'S4');
  c.shadeMaskedRegion('l04_tarp_camp', 192, 80, 36, 16, SUIT_RAMP, {
    material: 'cloth',
    bias: 0.08,
    foldFn: (x) => Math.sin(x * 0.24) * 0.14,
  });
  for (let y = 96; y <= 132; y++) for (let x = 166; x <= 228; x++) {
    if (Math.hypot((x - 196) / 32, (y - 122) / 11) < 1) c.blendPx('l01_crater_trench', x, y, 'SH', 115);
  }
  c.fillPoly('l04_tarp_camp', [[182, 108], [214, 108], [214, 114], [182, 114]], 'M3');
  c.line('l04_tarp_camp', 182, 108, 214, 108, 'M6');
  c.line('l04_tarp_camp', 185, 114, 185, 126, 'M1');
  c.line('l04_tarp_camp', 211, 114, 211, 126, 'M1');
  c.fillPoly('l04_tarp_camp', [[188, 98], [193, 98], [193, 108], [188, 108]], 'G5');
  c.line('l05_holo_glow', 189, 100, 189, 106, 'G8');
  c.fillPoly('l04_tarp_camp', [[202, 99], [208, 99], [208, 108], [202, 108]], 'F3');
  c.px('l05_holo_glow', 205, 103, 'F4');
  for (let y = 84; y <= 130; y++) for (let x = 178; x <= 232; x++) {
    const d = Math.hypot((x - 205) / 26, (y - 104) / 24);
    if (d < 1) c.blendPx('l05_holo_glow', x, y, 'F3', Math.round((1 - d) * 115));
  }
  c.fillPoly('l04_tarp_camp', [[160, 110], [180, 110], [180, 126], [160, 126]], 'M2');
  c.line('l04_tarp_camp', 160, 110, 180, 110, 'M5');
  c.line('l04_tarp_camp', 162, 116, 178, 116, 'S5');
  c.px('l04_tarp_camp', 170, 116, 'M6');

  const vpfJson = c.serializeVpf({
    id: 'v4_droppod_narrative_landmark',
    name: 'V4.0 MASTERPIECE — Crashed ICV Meridian Drop-Pod & Camp Diorama (240x152)',
    pivot: { x: 112, y: 124 },
    tileSize: 32,
    styleNotes: 'Pass-2 Narrative Drop-Pod: curved pressurized rear cowling, buckled landing strut, torn power cable, shredded gold MLI, glowing cyan holo-bay & cozy lantern camp.',
  });
  return { canvas: c, vpfJson, width: W, height: H };
}

// ============================================================================
// AST-007 V4.0 — LUMINOUS LAYERED VFX STUDY SHEET (256x128)
// ============================================================================
export function buildV4HarmonicVfxSheet(): { canvas: V4Canvas; vpfJson: string; width: number; height: number } {
  const W = 256;
  const H = 128;
  const c = new V4Canvas(W, H, [
    { id: 'l01_glow', name: '01 Soft Volumetric Glow Pools' },
    { id: 'l02_rings', name: '02 Crisp Interference Waves & Water Ripples' },
    { id: 'l03_sparks', name: '03 Harmonic Node Sparks & Floating Spores' },
  ]);

  const cx = 64, cy = 64;
  for (let y = 4; y < 124; y++) {
    for (let x = 4; x < 124; x++) {
      const r = Math.hypot((x - cx) / 56, (y - cy) / 36);
      if (r > 1.05) continue;
      if (r < 0.96) c.blendPx('l01_glow', x, y, 'L0', Math.round((1 - r) * 70 + 16));
      for (const rr of [0.34, 0.64, 0.94]) {
        const d = Math.abs(r - rr);
        if (d < 0.048) {
          const ang = Math.atan2((y - cy) / 36, (x - cx) / 56);
          const pulse = 0.62 + 0.38 * Math.sin(ang * 6);
          const tok = d < 0.018 && pulse > 0.85 ? 'L3' : rr > 0.8 ? 'L2' : 'L1';
          c.blendPx('l02_rings', x, y, tok, Math.round((1 - d / 0.048) * 235 * pulse));
        }
      }
    }
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const nx = cx + Math.cos(a) * 53;
    const ny = cy + Math.sin(a) * 34;
    c.fillEllipse('l03_sparks', nx, ny, 2.5, 2.0, 'L3');
    c.px('l03_sparks', nx, ny, 'W9');
  }
  for (let f = 0; f < 2; f++) {
    const rx = 160 + f * 60;
    const ry = 32;
    for (const r of [12, 22]) {
      for (let a = 0; a < Math.PI * 2; a += 0.09) {
        const px = rx + Math.cos(a) * (r + f * 3);
        const py = ry + Math.sin(a) * (r + f * 3) * 0.45;
        c.blendPx('l02_rings', px, py, Math.sin(a) < 0 ? 'W8' : 'W6', 200);
      }
    }
  }
  for (let i = 0; i < 22; i++) {
    const px = 136 + hash2v4(i, 19, 881) * 112;
    const py = 72 + hash2v4(i, 43, 887) * 48;
    const isCyan = i % 2 === 0;
    c.blendPx('l01_glow', px, py, isCyan ? 'L1' : 'F3', 90);
    c.px('l03_sparks', px, py, isCyan ? 'L3' : 'F4');
  }

  const vpfJson = c.serializeVpf({
    id: 'v4_harmonic_vfx_study',
    name: 'V4.0 MASTERPIECE — Layered Harmonic Lens, Ripple & Spore VFX (256x128)',
    pivot: { x: 64, y: 64 },
    tileSize: 64,
    styleNotes: 'Layered translucent harmonic acoustic interference field, shallow-water ripples, and drifting alien spore motes.',
  });
  return { canvas: c, vpfJson, width: W, height: H };
}

// ============================================================================
// DELIVERABLE 8 — SINGING CANOPY ALIEN FOREST SANCTUARY (640x360)
// ============================================================================
export function buildSingingCanopyMasterpiece(maraHeroBuf?: Uint8ClampedArray): {
  canvas: V4Canvas;
  vpfJson: string;
  width: number;
  height: number;
} {
  const W = 640;
  const H = 360;
  const c = new V4Canvas(W, H, [
    { id: 'l01_forest_floor', name: '01 Sun-Dappled Velvety Moss Floor & Humus' },
    { id: 'l02_woodland_creek', name: '02 Winding Crystal Woodland Creek (Natural Flow)' },
    { id: 'l03_stones_log_flora', name: '03 Mossy Stepping Stones, Hollow Log, Bushes & Flora' },
    { id: 'l04_trees_actors', name: '04 Hand-Painted Singing Reedwoods & Dr. Mara Lin' },
    { id: 'l05_sunshafts_pollen', name: '05 Volumetric Diagonal Sun-Shafts & Drifting Pollen' },
  ]);

  // 1. PAINTERLY VELVETY SUN-DAPPLED FOREST FLOOR + SHIMMERING NATURAL WOODLAND CREEK!
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nMacro = smoothNoiseV4(x * 0.008, y * 0.008, 64, 64, 313);
      const nMid = smoothNoiseV4(x * 0.026, y * 0.026, 96, 96, 541);
      const nFine = smoothNoiseV4(x * 0.085, y * 0.085, 128, 128, 733);

      const creekCenterY = 148 + (x / W) * 145 + Math.sin(x * 0.013) * 42 + (nMacro - 0.5) * 26;
      const creekHalfW = 24 + Math.sin(x * 0.02) * 5 + (nMid - 0.5) * 7;
      const distCreek = Math.abs(y - creekCenterY);

      if (distCreek < creekHalfW) {
        // NATURAL SHIMMERING WOODLAND STREAM (ZERO stained-glass Worley mesh!)
        const depth = 1 - distCreek / creekHalfW;
        const flowStreak = smoothNoiseV4(x * 0.022, y * 0.14, 96, 96, 223);
        let tok = depth > 0.66 ? 'W2' : depth > 0.38 ? 'W3' : depth > 0.18 ? 'W4' : 'W5';
        // Submerged mossy river pebbles glistening beneath clear shallow edges!
        if (depth < 0.42 && nFine > 0.72) tok = 'WS';
        // Crisp directional sunlight flow-glints dancing downstream!
        if (flowStreak > 0.70 && depth > 0.16) tok = flowStreak > 0.80 ? 'W8' : 'W6';
        // Foaming miniature whitewater riffle cascade around x = 196!
        const riffle = Math.abs(x - 196) + (nFine - 0.5) * 7;
        if (riffle < 8) tok = riffle < 3.5 ? 'W9' : 'W7';
        c.px('l02_woodland_creek', x, y, tok);
      } else if (distCreek < creekHalfW + 6.5) {
        // Dark moist mossy root-humus creek bank undercut!
        c.px('l01_forest_floor', x, y, distCreek < creekHalfW + 2.8 ? 'G0' : nFine > 0.48 ? 'T1' : 'G1');
      } else {
        const clearingGlow = 1.0 - Math.min(1.0, Math.hypot((x - 310) / 280, (y - 195) / 180));
        const sun = clearingGlow * 0.56 + nMacro * 0.32 + nMid * 0.16;
        let tok = 'G3';
        if (sun > 0.72) tok = nFine > 0.58 ? 'G6' : 'G5';
        else if (sun > 0.54) tok = nFine > 0.58 ? 'G5' : 'G4';
        else if (sun > 0.38) tok = nFine > 0.56 ? 'G4' : 'G3';
        else if (sun > 0.24) tok = nFine > 0.56 ? 'G2' : 'G1';
        else tok = nFine > 0.58 ? 'G1' : 'G0';
        c.px('l01_forest_floor', x, y, tok);
      }
    }
  }

  // SURGICAL ELLIPTICAL MOSSY STEPPING STONES (Dedicated l03 layer + clipEllipse: true — ZERO square blocks!)
  for (const [sx, sy, rx, ry] of [
    [192, 174, 13, 9], [198, 212, 15, 9], [336, 204, 11, 6.5], [362, 222, 11, 6.5], [388, 240, 12, 7],
  ]) {
    c.fillEllipse('l03_stones_log_flora', sx + 1.5, sy + 2.5, rx + 2, ry + 1.5, 'W1');
    c.fillEllipse('l03_stones_log_flora', sx, sy, rx, ry, 'K3');
    c.shadeMaskedRegion('l03_stones_log_flora', sx, sy, rx, ry, CLIFF_RAMP, {
      material: 'cloth',
      bias: 0.10,
      clipEllipse: true,
    });
    // Sunlit moss velvet cushion resting cleanly atop stone!
    c.fillEllipse('l03_stones_log_flora', sx - 2, sy - 2, rx * 0.58, ry * 0.42, 'G5');
    c.fillEllipse('l03_stones_log_flora', sx - 3, sy - 2.5, rx * 0.34, ry * 0.22, 'G7');
    // Tiny white water ripple curling upstream of stone
    c.line('l03_stones_log_flora', sx - rx - 2, sy - 1, sx - rx + 1, sy - ry * 0.6, 'W8');
  }

  // Fallen hollow moss-draped Reedwood log (shaded cleanly on its own region, fungi painted on l04/l05 so ZERO bleed!)
  c.paintTaperedSpline('l03_stones_log_flora', [[208, 126, 10], [254, 134, 9.5], [298, 138, 8.8]], 'T3');
  c.shadeMaskedRegion('l03_stones_log_flora', 253, 132, 48, 12, REED_RAMP, {
    material: 'cloth',
    bias: 0.08,
    pad: 2,
    foldFn: (_x, y) => Math.sin(y * 0.8) * 0.12,
  });
  c.fillEllipse('l03_stones_log_flora', 298, 138, 4.5, 7.5, 'T0'); // hollow dark reed interior!
  c.fillEllipse('l03_stones_log_flora', 236, 127, 13, 3.8, 'G5');
  c.fillEllipse('l03_stones_log_flora', 234, 126, 8, 2.2, 'G7');
  // Surgical glowing violet-magenta shelf-fungi on fallen log!
  paintV4ShelfFungi(c, 'l04_trees_actors', 'l05_sunshafts_pollen', 258, 133, 1.25);
  paintV4ShelfFungi(c, 'l04_trees_actors', 'l05_sunshafts_pollen', 278, 138, 0.95);

  // Lush multi-lobe asymmetrical woodland shrubs framing the glade edges!
  for (const [bx, by, sc, seed] of [
    [136, 118, 1.05, 101], [344, 112, 1.15, 102], [452, 294, 1.20, 103], [92, 318, 1.25, 104],
  ]) {
    paintWoodlandBush(c, 'l03_stones_log_flora', bx, by, sc, seed);
  }

  // Lush feathered woodland ferns, Sun-Drop Orchids, Mirror Glasswort & meadow wildflowers!
  for (const [fx, fy, sc] of [
    [128, 256, 1.3], [168, 286, 1.15], [278, 286, 1.25], [462, 168, 1.2], [516, 208, 1.1], [228, 162, 1.0],
  ]) {
    paintV4Fern(c, 'l03_stones_log_flora', fx, fy, sc);
  }
  paintV4SunDropOrchid(c, 'l03_stones_log_flora', 'l05_sunshafts_pollen', 298, 256, 1.15);
  paintV4SunDropOrchid(c, 'l03_stones_log_flora', 'l05_sunshafts_pollen', 436, 178, 1.05);
  paintV4SunDropOrchid(c, 'l03_stones_log_flora', 'l05_sunshafts_pollen', 142, 294, 0.95);
  paintV4Glasswort(c, 'l03_stones_log_flora', 316, 236, 0.90);
  paintV4Glasswort(c, 'l03_stones_log_flora', 418, 272, 1.0);

  for (let i = 0; i < 110; i++) {
    const gx = Math.round(16 + hash2v4(i, 11, 907) * 608);
    const gy = Math.round(24 + hash2v4(i, 29, 911) * 322);
    if (c.has('l02_woodland_creek', gx, gy)) continue;
    const bright = hash2v4(i, 61, 919) > 0.42;
    c.px('l03_stones_log_flora', gx, gy + 1, 'G1');
    c.line('l03_stones_log_flora', gx, gy, gx - 2, gy - 3, bright ? 'G7' : 'G5');
    c.line('l03_stones_log_flora', gx + 1, gy, gx + 2, gy - 2, bright ? 'G6' : 'G4');
    if (i % 8 === 0) c.px('l03_stones_log_flora', gx - 1, gy - 3, i % 16 === 0 ? 'P3' : 'F4');
  }

  // Hand-Painted Singing Reedwoods framing sanctuary + Dr. Mara Lin!
  const treeA = buildV4ReedwoodMaster('ancient').canvas.composite();
  const treeB = buildV4ReedwoodMaster('windswept').canvas.composite();
  const l4 = c.cels.l04_trees_actors;
  blitV4(l4, W, H, treeA, 160, 224, -18, -36);
  blitV4(l4, W, H, treeB, 160, 224, 342, -52);
  blitV4(l4, W, H, treeA, 160, 224, 488, -14);
  if (maraHeroBuf) {
    blitV4(l4, W, H, maraHeroBuf, 64, 96, 234, 174);
  }
  blitV4(l4, W, H, treeA, 160, 224, 494, 152);

  // Diagonal Volumetric Golden-Emerald Sun-Shafts & Drifting Bioluminescent Pollen!
  for (const [beamX, beamW] of [[156, 60], [294, 82], [428, 54]]) {
    for (let y = 0; y < H; y++) {
      const cxBeam = beamX + y * 0.46;
      for (let x = Math.floor(cxBeam - beamW); x <= Math.ceil(cxBeam + beamW); x++) {
        const d = Math.abs(x - cxBeam) / beamW;
        if (d < 1.0) {
          c.blendPx('l05_sunshafts_pollen', x, y, 'G8', Math.round((1 - d * d) * (1 - y / (H * 1.25)) * 32));
        }
      }
    }
  }
  for (let i = 0; i < 48; i++) {
    const px = Math.round(60 + hash2v4(i, 17, 991) * 520);
    const py = Math.round(28 + hash2v4(i, 41, 997) * 304);
    const isCyan = i % 3 === 0;
    c.blendPx('l05_sunshafts_pollen', px, py, isCyan ? 'L2' : 'F4', 110);
    c.px('l05_sunshafts_pollen', px, py, isCyan ? 'L3' : 'G8');
  }

  const vpfJson = c.serializeVpf({
    id: 'v4_singing_canopy_forest_masterpiece',
    name: 'V4.0 MASTERPIECE — Singing Canopy Alien Forest Sanctuary (640x360)',
    pivot: { x: 320, y: 180 },
    tileSize: 32,
    styleNotes: 'Pass-2 Singing Canopy Alien Forest Sanctuary: natural shimmering creek, clean mossy stepping stones, hand-painted Reedwoods, violet shelf-fungi, Sun-Drop orchids & volumetric morning sun-shafts.',
  });
  return { canvas: c, vpfJson, width: W, height: H };
}

// ============================================================================
// DELIVERABLE 10 — THE CROWN JEWEL: SINGLE-HERO UNIFIED V4.0 VERTICAL SLICE!
// ============================================================================
export function buildUnifiedVerticalSliceV4(
  amberOceanBuf: Uint8ClampedArray,
  maraScan64x96: Uint8ClampedArray
): { canvas: V4Canvas; vpfJson: string; width: number; height: number } {
  const W = 640;
  const H = 360;
  const c = new V4Canvas(W, H, [
    { id: 'l01_coast_forest_ground', name: '01 Living Amber Coast Ocean, 3/4 Cliffs & Alien Canopy' },
    { id: 'l02_props_landmarks', name: '02 Narrative Drop-Pod Camp, Flora & Singing Reedwoods' },
    { id: 'l03_hero_vfx', name: '03 Hero Dr. Mara Lin (64x96) & Harmonic Scan VFX' },
    { id: 'l04_atmosphere', name: '04 Volumetric Sun-Shafts, Sea Sparkles & Drifting Spores' },
  ]);

  // Start directly from the breathtaking Pass-2 Living Amber Coast Ocean + 3/4 Sandstone Cliffs!
  blitV4(c.cels.l01_coast_forest_ground, W, H, amberOceanBuf, W, H, 0, 0);

  // Lush multi-lobe woodland bushes & fern clusters hugging the alien canopy terrace!
  for (const [bx, by, sc, seed] of [[540, 146, 1.05, 201], [596, 174, 1.10, 202], [456, 332, 1.15, 203]]) {
    paintWoodlandBush(c, 'l02_props_landmarks', bx, by, sc, seed);
  }
  paintV4Fern(c, 'l02_props_landmarks', 436, 314, 1.15);
  paintV4Fern(c, 'l02_props_landmarks', 506, 220, 1.1);
  // Hero Focal Specimens: Glowing golden Sun-Drop Orchids thriving right along the coastal-canopy frontier!
  paintV4SunDropOrchid(c, 'l02_props_landmarks', 'l04_atmosphere', 466, 266, 1.22);
  paintV4SunDropOrchid(c, 'l02_props_landmarks', 'l04_atmosphere', 518, 286, 1.02);

  const treeA = buildV4ReedwoodMaster('ancient').canvas.composite();
  const treeB = buildV4ReedwoodMaster('windswept').canvas.composite();
  const dropPod = buildV4DropPodNarrative().canvas.composite();
  const vfx = buildV4HarmonicVfxSheet().canvas.composite();

  const l2 = c.cels.l02_props_landmarks;
  const l3 = c.cels.l03_hero_vfx;

  // Northern ridge Singing Reedwood framing the camp horizon
  blitV4(l2, W, H, treeB, 160, 224, 496, -54);

  // Narrative Crashed ICV Meridian Drop-Pod & Lantern Camp nestled cleanly on the upper coastal-canopy terrace!
  blitV4(l2, W, H, dropPod, 240, 152, 368, 38);

  // HERO FOCAL CENTERPIECE: Layered Luminous Acoustic Field Lens Resonance Field projecting over Sun-Drop Orchids!
  blitV4(l3, W, H, vfx, 256, 128, 396, 206, { x: 0, y: 0, w: 128, h: 128 }, 0.92);

  // ONE UNMISTAKABLE HERO DR. MARA LIN (Native 64x96!) standing cleanly on the sunlit beach-canopy edge scanning the glowing flora!
  blitV4(l3, W, H, maraScan64x96, 64, 96, 348, 198);

  // Foreground Ancient Singing Reedwood framing bottom-right depth!
  blitV4(l3, W, H, treeA, 160, 224, 502, 148);

  // Volumetric Morning Sun-Shafts & Bioluminescent Spore Motes!
  for (const [bx, bw] of [[256, 56], [404, 74]]) {
    for (let y = 0; y < H; y++) {
      const cxB = bx + y * 0.46;
      for (let x = Math.floor(cxB - bw); x <= Math.ceil(cxB + bw); x++) {
        const d = Math.abs(x - cxB) / bw;
        if (d < 1.0) c.blendPx('l04_atmosphere', x, y, 'G8', Math.round((1 - d * d) * (1 - y / (H * 1.3)) * 28));
      }
    }
  }
  for (let i = 0; i < 36; i++) {
    const px = Math.round(320 + hash2v4(i, 19, 991) * 300);
    const py = Math.round(38 + hash2v4(i, 43, 997) * 298);
    c.px('l04_atmosphere', px, py, i % 2 === 0 ? 'L3' : 'F4');
  }

  const vpfJson = c.serializeVpf({
    id: 'v4_unified_vertical_slice_640x360',
    name: 'V4.0 MASTERPIECE — Unified Vertical Slice (640x360)',
    pivot: { x: 320, y: 180 },
    tileSize: 32,
    styleNotes: 'Pass-2 Single-Hero V4.0 Vertical Slice uniting Living Amber Coast Ocean, 3/4 Sandstone Cliffs, Narrative Drop-Pod Camp, Hand-Painted Singing Reedwoods, Biolum Flora, Harmonic VFX & Native 64x96 Dr. Mara Lin.',
  });
  return { canvas: c, vpfJson, width: W, height: H };
}
