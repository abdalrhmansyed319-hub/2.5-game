/**
 * VERDANT SIGNAL V7.1 — COMPLETE FOREST ENVIRONMENTAL RECOMPOSITION ENGINE (PASS 2)
 * =================================================================================
 * Continuous 1440x340 multi-zone Singing Reedwood playable forest viewed at
 * exact native 480x270 gameplay camera resolution:
 *
 *   Zone A (x =   0..480): Dense Forest Corridor (asymmetric colossal trunk wall
 *                          left, close buttress right, overhanging canopy top-right,
 *                          distant treeline & narrow off-center cliff sliver)
 *   Zone B (x = 480..960): Deep Forest Interior (4 overlapping depth tiers of
 *                          colossal trunks, fallen hollow mossy log, interlocked
 *                          cathedral canopy roof, Mara threading inside!)
 *   Zone C (x = 960..1440): Dramatic Forest Clearing (rich handcrafted sunlit
 *                          mossy glade & sky-reflecting pool ringed by off-screen
 *                          giants, lush distant treeline & sunlit cliff monoliths)
 */

import { createEmptyBuffer, getPixel, setPixel } from '../engine/pixelBuffer';
import { blitV4, hash2v4 } from '../v4_masterpiece/v4Core';
import { type RGB, blendRgbPx, digitizeToCraftedPixelArt, hexToRgb, loadUnderpaintToGrid } from '../v5_soul/v5PixelEngine';
import { type MaraDirV7, type MaraV7SpriteSet } from '../v7_immersive/v7PixelAtlas';
import { type RgbaImage } from '../v7_immersive/v7WorldEngine';

export const V71_VIEW_W = 480;
export const V71_VIEW_H = 270;
export const V71_WORLD_W = 1440;
export const V71_WORLD_H = 340;

/** Curated 54-Color VERDANT SIGNAL Singing Canopy V7.1 Master Palette */
export const V71_FOREST_MASTER_PALETTE: string[] = [
  // Morning Turquoise Sky, Clouds & Distant Sunlit Monolith Cliffs (9)
  '#f2fffd', '#c2f7f7', '#6ee0ed', '#30b9d9', '#258fb8',
  '#f7d098', '#d99e6c', '#9e7060', '#5e6b80',
  // Distant Atmospheric Misty Teal Forest Silhouettes (4)
  '#7eb8bf', '#498b96', '#286673', '#164552',
  // Sunlit Chartreuse Glade -> Lush Mid-Emerald -> Deep Pine-Teal Canopy Shade (10)
  '#dced58', '#b5de45', '#87c437', '#5aa332', '#398230',
  '#23632c', '#164a28', '#0e3623', '#09241c', '#051514',
  // Sky-Reflecting Rainwater Puddles & Wet Moss Edges (5)
  '#d4f7ff', '#7ed4fa', '#3ca0e0', '#226eb0', '#144473',
  // Colossal Singing Reedwood Bark & Sprawling Roots (Warm Cinnamon -> Deep Espresso) (8)
  '#e09652', '#c27138', '#9c5126', '#78381c', '#542416', '#381612', '#210c0e', '#12060a',
  // Organic Forest Earth, Fallen Leaves & Mossy Stones (6)
  '#b58d4c', '#8c6938', '#664a2b', '#473321', '#7d948c', '#4d615e',
  // Bioluminescent Cyan Acoustic Slits/Moss, Violet Shelf-Fungi & Golden Sun-Drop Orchids (7)
  '#e3ffff', '#85f7f0', '#2ed1cc', '#188c94',
  '#f2ccff', '#be7ce0', '#6d398f',
  // Golden Orchid & Mara Harmonized Accents (5)
  '#ffe36e', '#ff8c42', '#d45224', '#e8f0f5', '#cf3438',
];

export type V71LayerKind = 'treeline' | 'bg_titan' | 'ysort' | 'overhang' | 'foreground';

export interface V71PropInstance {
  id: string;
  spriteKey: string;
  /** World X (center-bottom for treeline/bg_titan/ysort; top-left world X for overhang/foreground) */
  x: number;
  /** World Y (exact foot-base sortY for treeline/bg_titan/ysort; top-left world Y for overhang/foreground) */
  y: number;
  layer: V71LayerKind;
  parallax?: number;
  /** Zone camera X at which parallax offset equals zero (so placement is exact in every zone!) */
  anchorCamX?: number;
  /** Tight trunk-core solid collider ellipse (relative to x, y) so outer roots remain walkable */
  colRx?: number;
  colRy?: number;
  colOffsetY?: number;
  /** Soft ground shadow ellipse radii cast beneath prop */
  shadowRx?: number;
  shadowRy?: number;
}

export interface V71ForestWorldDef {
  worldW: number;
  worldH: number;
  walkBounds: { minX: number; maxX: number; minY: number; maxY: number };
  presets: {
    A_corridor: { title: string; maraX: number; maraY: number; dir: MaraDirV7; camX: number; camY: number };
    B_interior: { title: string; maraX: number; maraY: number; dir: MaraDirV7; camX: number; camY: number };
    C_clearing: { title: string; maraX: number; maraY: number; dir: MaraDirV7; camX: number; camY: number };
  };
  props: V71PropInstance[];
}

export function getV71ForestWorldDef(): V71ForestWorldDef {
  return {
    worldW: V71_WORLD_W,
    worldH: V71_WORLD_H,
    walkBounds: { minX: 48, maxX: 1392, minY: 168, maxY: 318 },
    presets: {
      A_corridor: {
        title: 'A. DENSE FOREST CORRIDOR (480X270 NATIVE 1X)',
        maraX: 256,
        maraY: 266,
        dir: 'up',
        camX: 0,
        camY: 42,
      },
      B_interior: {
        title: 'B. DEEP FOREST INTERIOR (480X270 NATIVE 1X)',
        maraX: 678,
        maraY: 264,
        dir: 'right',
        camX: 480,
        camY: 42,
      },
      C_clearing: {
        title: 'C. DRAMATIC FOREST CLEARING (480X270 NATIVE 1X)',
        maraX: 1196,
        maraY: 274,
        dir: 'up',
        camX: 960,
        camY: 42,
      },
    },
    props: [
      // ======================================================================
      // CONTINUOUS LAYERED DISTANT TREELINE RIDGE (replaces flat hill horizon!)
      // Bridges distant turquoise cliff monoliths seamlessly into the rear forest!
      // ======================================================================
      { id: 'TL_A1', spriteKey: 'treeline_ridge', x: 160, y: 172, layer: 'treeline' },
      { id: 'TL_A2', spriteKey: 'treeline_ridge_flip', x: 420, y: 174, layer: 'treeline' },
      { id: 'TL_B1', spriteKey: 'treeline_ridge', x: 680, y: 172, layer: 'treeline' },
      { id: 'TL_B2', spriteKey: 'treeline_ridge_flip', x: 940, y: 174, layer: 'treeline' },
      { id: 'TL_C1', spriteKey: 'treeline_ridge', x: 1200, y: 172, layer: 'treeline' },
      { id: 'TL_C2', spriteKey: 'treeline_ridge_flip', x: 1420, y: 174, layer: 'treeline' },

      // ======================================================================
      // ZONE A (x = 0..480): ASYMMETRIC DENSE FOREST CORRIDOR
      // Deliberately asymmetric (ZERO V7.0 mirror!):
      //   - Left side: UNOBSCURED enormous vertical trunk rising straight off TOP edge!
      //   - Mid-rear off-center left: Staggered atmospheric titan closing the rear left!
      //   - Upper-right: Sweeping overhanging canopy mass arching over the passage!
      //   - Close front-right: Colossal moss-draped cathedral buttress right beside Mara!
      //   - Bottom-left: Huge dark shadowed foreground bush framing the camera lens!
      // ======================================================================
      { id: 'A_bg_left_deep', spriteKey: 'titan_gnarled_bg', x: 192, y: 176, layer: 'bg_titan', shadowRx: 72, shadowRy: 16 },
      { id: 'A_bg_right_deep', spriteKey: 'titan_straight_bg', x: 378, y: 172, layer: 'bg_titan', shadowRx: 68, shadowRy: 15 },
      { id: 'A_bg_bush_l', spriteKey: 'bush_mid_dark', x: 44, y: 176, layer: 'bg_titan' },
      { id: 'A_bg_bush_c', spriteKey: 'bush_small_dark', x: 256, y: 168, layer: 'bg_titan' },
      { id: 'A_bg_bush_r', spriteKey: 'bush_mid_dark', x: 446, y: 174, layer: 'bg_titan' },

      // Enormous UNOBSCURED Left Colossal Trunk Wall (straight furrowed redwood rising straight off top edge!)
      { id: 'A_mid_left_titan', spriteKey: 'titan_straight_tall', x: 92, y: 248, layer: 'ysort', colRx: 36, colRy: 14, colOffsetY: -12, shadowRx: 90, shadowRy: 22 },
      { id: 'A_bush_mid_left', spriteKey: 'bush_mid', x: 178, y: 214, layer: 'ysort', colRx: 20, colRy: 9, colOffsetY: -6, shadowRx: 44, shadowRy: 12 },

      // Staggered Mid-Right Leaning Gnarled Titan squeezing the upper-right corridor!
      { id: 'A_mid_right_lean', spriteKey: 'titan_gnarled_flip', x: 356, y: 220, layer: 'ysort', colRx: 32, colRy: 13, colOffsetY: -10, shadowRx: 78, shadowRy: 18 },

      // Close Foreground-Right COLOSSAL Buttress Titan (right near bottom-right beside Mara & puddles!)
      { id: 'A_front_right_titan', spriteKey: 'titan_buttress', x: 422, y: 298, layer: 'ysort', colRx: 42, colRy: 16, colOffsetY: -12, shadowRx: 98, shadowRy: 22 },
      { id: 'A_bush_front_r', spriteKey: 'bush_small', x: 332, y: 290, layer: 'ysort', colRx: 16, colRy: 7, colOffsetY: -4, shadowRx: 32, shadowRy: 9 },

      // Asymmetric Overhanging Canopy: sweeps heavily from UPPER-RIGHT (leaving left colossal trunk unobstructed!)
      { id: 'A_ov_tr', spriteKey: 'canopy_mass', x: 214, y: 10, layer: 'overhang', parallax: 1.05, anchorCamX: 0 },
      { id: 'A_ov_tl_edge', spriteKey: 'canopy_mass_flip', x: -186, y: 6, layer: 'overhang', parallax: 1.05, anchorCamX: 0 },

      // Massive Dark Shadowed Foreground Bush framing bottom-left quadrant!
      { id: 'A_fg_bot_left', spriteKey: 'bush_fg_huge', x: -32, y: 188, layer: 'foreground', parallax: 1.15, anchorCamX: 0 },

      // ======================================================================
      // TRANSITION GATEWAY A -> B (x = 450..540)
      // ======================================================================
      { id: 'AB_bg_wall', spriteKey: 'titan_gnarled_bg', x: 508, y: 170, layer: 'bg_titan', shadowRx: 72, shadowRy: 16 },
      { id: 'AB_bush_top', spriteKey: 'bush_mid_dark', x: 486, y: 192, layer: 'ysort', colRx: 24, colRy: 10, colOffsetY: -6, shadowRx: 46, shadowRy: 12 },

      // ======================================================================
      // ZONE B (x = 480..960): DEEP FOREST INTERIOR
      // 4 overlapping depth tiers of colossal trunks, massive fallen hollow log,
      // seamless interlocked overhanging canopy cathedral roof, Mara clearly visible
      // stepping through the dappled heart between giant roots!
      // ======================================================================
      { id: 'B_bg_1', spriteKey: 'titan_straight_bg', x: 598, y: 166, layer: 'bg_titan', shadowRx: 68, shadowRy: 15 },
      { id: 'B_bg_2', spriteKey: 'titan_buttress_bg', x: 752, y: 170, layer: 'bg_titan', shadowRx: 78, shadowRy: 16 },
      { id: 'B_bg_3', spriteKey: 'titan_gnarled_bg', x: 912, y: 166, layer: 'bg_titan', shadowRx: 74, shadowRy: 16 },
      { id: 'B_bg_bush_1', spriteKey: 'bush_mid_dark', x: 672, y: 176, layer: 'bg_titan' },
      { id: 'B_bg_bush_2', spriteKey: 'bush_mid_dark', x: 836, y: 178, layer: 'bg_titan' },

      // Mid-Back Overlapping Ancient Titans & Giant Fallen Hollow Mossy Log
      { id: 'B_mid_left_gnarled', spriteKey: 'titan_gnarled', x: 600, y: 228, layer: 'ysort', colRx: 34, colRy: 14, colOffsetY: -10, shadowRx: 86, shadowRy: 20 },
      { id: 'B_mid_right_titan', spriteKey: 'titan_straight', x: 864, y: 224, layer: 'ysort', colRx: 34, colRy: 14, colOffsetY: -10, shadowRx: 82, shadowRy: 19 },
      { id: 'B_fallen_log', spriteKey: 'fallen_log', x: 716, y: 226, layer: 'ysort', colRx: 36, colRy: 11, colOffsetY: -8, shadowRx: 64, shadowRy: 15 },
      { id: 'B_bush_mid_r', spriteKey: 'bush_mid', x: 782, y: 204, layer: 'ysort', colRx: 20, colRy: 9, colOffsetY: -6, shadowRx: 42, shadowRy: 11 },

      // Close Foreground-Mid Colossal Trunks right INSIDE playable area (distinct silhouettes — ZERO twins in A->B!)
      { id: 'B_front_left_titan', spriteKey: 'titan_gnarled_tall', x: 540, y: 304, layer: 'ysort', colRx: 38, colRy: 15, colOffsetY: -12, shadowRx: 94, shadowRy: 22 },
      { id: 'B_front_center_titan', spriteKey: 'titan_straight_alt', x: 804, y: 298, layer: 'ysort', colRx: 32, colRy: 13, colOffsetY: -10, shadowRx: 80, shadowRy: 19 },
      { id: 'B_bush_front_c', spriteKey: 'bush_small', x: 626, y: 296, layer: 'ysort', colRx: 16, colRy: 7, colOffsetY: -4, shadowRx: 34, shadowRy: 10 },

      // Seamless Interlocking Overhanging Canopy Cathedral Roof (B_ov_crown sits behind organic curved B_ov_left & B_ov_right!)
      { id: 'B_ov_crown', spriteKey: 'canopy_mass_wide', x: 562, y: -14, layer: 'overhang', parallax: 1.05, anchorCamX: 480 },
      { id: 'B_ov_left', spriteKey: 'canopy_mass_flip', x: 438, y: 10, layer: 'overhang', parallax: 1.05, anchorCamX: 480 },
      { id: 'B_ov_right', spriteKey: 'canopy_mass', x: 696, y: 12, layer: 'overhang', parallax: 1.05, anchorCamX: 480 },

      // Foreground Dark Shadowed Undergrowth Framing BOTH lower corners of Deep Interior!
      { id: 'B_fg_bl', spriteKey: 'bush_fg_huge', x: 432, y: 204, layer: 'foreground', parallax: 1.15, anchorCamX: 480 },
      { id: 'B_fg_br', spriteKey: 'bush_fg_huge_flip', x: 806, y: 206, layer: 'foreground', parallax: 1.15, anchorCamX: 480 },

      // ======================================================================
      // TRANSITION THROAT B -> C (x = 928..1020)
      // ======================================================================
      { id: 'BC_throat_top', spriteKey: 'titan_straight', x: 966, y: 212, layer: 'ysort', colRx: 32, colRy: 13, colOffsetY: -10, shadowRx: 78, shadowRy: 18 },
      { id: 'BC_throat_bot', spriteKey: 'bush_mid', x: 962, y: 298, layer: 'ysort', colRx: 22, colRy: 9, colOffsetY: -6, shadowRx: 44, shadowRy: 12 },

      // ======================================================================
      // ZONE C (x = 960..1440): DRAMATIC SUNLIT FOREST CLEARING
      // Dramatic emotional contrast against enclosed A & B: wide sunlit mossy glade
      // & sky-reflecting pool ringed completely by off-screen giants, mossy log,
      // lush layered distant treeline & sunlit sandstone monolith cliffs!
      // ======================================================================
      { id: 'C_bg_left', spriteKey: 'titan_buttress_bg', x: 1034, y: 172, layer: 'bg_titan', shadowRx: 74, shadowRy: 16 },
      { id: 'C_bg_right', spriteKey: 'titan_gnarled_bg', x: 1368, y: 174, layer: 'bg_titan', shadowRx: 76, shadowRy: 16 },
      { id: 'C_bg_bush_l', spriteKey: 'bush_small_dark', x: 1118, y: 170, layer: 'bg_titan' },
      { id: 'C_bg_bush_r', spriteKey: 'bush_small_dark', x: 1298, y: 172, layer: 'bg_titan' },

      // Perimeter Enormous Framing Titans on Left & Right Edges of the Sunlit Clearing
      { id: 'C_rim_left', spriteKey: 'titan_gnarled', x: 1004, y: 266, layer: 'ysort', colRx: 34, colRy: 14, colOffsetY: -10, shadowRx: 84, shadowRy: 20 },
      { id: 'C_rim_log', spriteKey: 'fallen_log_flip', x: 1098, y: 204, layer: 'ysort', colRx: 32, colRy: 10, colOffsetY: -7, shadowRx: 58, shadowRy: 14 },
      { id: 'C_rim_right_titan', spriteKey: 'titan_buttress', x: 1404, y: 288, layer: 'ysort', colRx: 42, colRy: 16, colOffsetY: -12, shadowRx: 98, shadowRy: 22 },
      { id: 'C_bush_right', spriteKey: 'bush_mid', x: 1334, y: 234, layer: 'ysort', colRx: 20, colRy: 9, colOffsetY: -6, shadowRx: 42, shadowRy: 11 },

      // Asymmetric Outer Corner Overhanging Canopy (keeping sunlit clearing sky & cliffs wide open!)
      { id: 'C_ov_tl', spriteKey: 'canopy_mass_flip', x: 842, y: 4, layer: 'overhang', parallax: 1.04, anchorCamX: 960 },
      { id: 'C_ov_tr', spriteKey: 'canopy_mass', x: 1268, y: 12, layer: 'overhang', parallax: 1.04, anchorCamX: 960 },

      // Properly Anchored Bottom-Left & Bottom-Right Corner Foreground Framing Bushes!
      { id: 'C_fg_bl', spriteKey: 'bush_fg_huge', x: 924, y: 208, layer: 'foreground', parallax: 1.15, anchorCamX: 960 },
      { id: 'C_fg_br', spriteKey: 'bush_fg_small_flip', x: 1344, y: 222, layer: 'foreground', parallax: 1.15, anchorCamX: 960 },
    ],
  };
}

// ============================================================================
// HANDCRAFTED 16-BIT CLUSTERED PIXEL-ART FOREST FLOOR (ZERO AIRBRUSH SPOTLIGHT!)
// ============================================================================

function fbm2(x: number, y: number, seed: number): number {
  const sample = (fx: number, fy: number, s: number) => {
    const ix = Math.floor(fx), iy = Math.floor(fy);
    const tx = fx - ix, ty = fy - iy;
    const ux = tx * tx * (3 - 2 * tx);
    const uy = ty * ty * (3 - 2 * ty);
    const a = hash2v4(ix, iy, s);
    const b = hash2v4(ix + 1, iy, s);
    const c = hash2v4(ix, iy + 1, s);
    const d = hash2v4(ix + 1, iy + 1, s);
    return (a * (1 - ux) + b * ux) * (1 - uy) + (c * (1 - ux) + d * ux) * uy;
  };
  return (
    sample(x * 0.025, y * 0.036, seed) * 0.50 +
    sample(x * 0.068, y * 0.088, seed + 37) * 0.32 +
    sample(x * 0.16, y * 0.21, seed + 91) * 0.18
  );
}

export function buildV71ForestFloorAndHorizon(
  world: V71ForestWorldDef,
  horizonSourcePath: string
): { floor: RgbaImage; horizon: RgbaImage } {
  // 1. Digitize the distant morning monolith cliff & sky horizon strip (640x128 for 0.22x parallax)
  const HW = 640, HH = 128;
  const hRaw = loadUnderpaintToGrid(horizonSourcePath, HW, HH, 1);
  const hDig = digitizeToCraftedPixelArt(hRaw, HW, HH, V71_FOREST_MASTER_PALETTE, {
    ditherThreshold: 0.042,
    ditherStrength: 0.020,
    cleanPasses: 2,
  });

  // 2. Build crisp, richly clustered 16-bit SNES pixel-art forest floor (1440x340)!
  const W = world.worldW, H = world.worldH;
  const buf = createEmptyBuffer(W, H);

  const turfSunHi = hexToRgb('#dced58');
  const turfSunMid = hexToRgb('#b5de45');
  const turfMoss = hexToRgb('#87c437');
  const turfMid = hexToRgb('#5aa332');
  const turfDeep = hexToRgb('#398230');
  const turfSh1 = hexToRgb('#23632c');
  const turfSh2 = hexToRgb('#164a28');
  const turfSh3 = hexToRgb('#0e3623');
  const turfVoid = hexToRgb('#09241c');
  const earthHi = hexToRgb('#b58d4c');
  const earthMid = hexToRgb('#8c6938');
  const earthDk = hexToRgb('#664a2b');
  const earthDeep = hexToRgb('#473321');
  const stoneHi = hexToRgb('#7d948c');
  const stoneDk = hexToRgb('#4d615e');
  const skyPudHi = hexToRgb('#d4f7ff');
  const skyPudMid = hexToRgb('#7ed4fa');
  const skyPudDeep = hexToRgb('#3ca0e0');
  const skyPudRim = hexToRgb('#226eb0');
  const skyPudEdge = hexToRgb('#144473');

  // Natural dappled canopy openings — warped by multi-scale leaf noise so edges look like
  // REAL overhanging tree-branch & leaf shadows (NEVER smooth round airbrush spotlights!)
  const sunOpenings: Array<[number, number, number, number, number]> = [
    // Zone A corridor dappled openings
    [250, 276, 112, 54, 0.88],
    [258, 214, 78, 42, 0.72],
    // Zone B deep cathedral filtered shafts
    [682, 266, 74, 34, 0.72],
    [742, 240, 52, 24, 0.56],
    [892, 268, 56, 26, 0.54],
    // Zone C broad dramatic sunlit clearing
    [1198, 256, 174, 80, 1.02],
    [1184, 200, 132, 52, 0.88],
    [1256, 294, 134, 48, 0.94],
  ];

  // Organic irregular sky-reflecting rainwater puddles
  const puddles: Array<[number, number, number, number, number]> = [
    [298, 294, 46, 16, 101],
    [224, 264, 24, 9, 137],
    [664, 278, 34, 12, 211],
    [1256, 286, 58, 19, 307],
    [1128, 266, 38, 13, 349],
  ];

  // Store light field so pixel-art clusters (moss pillows, grass tufts, stones, flowers) respond to light!
  const lightMap = new Float32Array(W * H);

  for (let y = 134; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // Irregular leafy cluster noise breaks all smooth contours into crisp 16-bit woodland patches!
      const nCoarse = fbm2(x, y, 503);
      const nLeaf = fbm2(x * 2.4, y * 2.8, 619);
      const nCluster = fbm2(x * 4.5, y * 5.2, 709);

      let light = 0.24 + (nCoarse - 0.45) * 0.42 + (nLeaf - 0.5) * 0.26;
      for (const [px, py, rx, ry, power] of sunOpenings) {
        // Warp elliptical distance strongly with leafy noise -> organic dappled shade edges!
        const wx = x + (nLeaf - 0.5) * 34;
        const wy = y + (nCoarse - 0.5) * 20;
        const d = Math.hypot((wx - px) / rx, (wy - py) / ry);
        if (d < 1.32) {
          const wgt = Math.max(0, 1 - d / 1.32);
          light += wgt * wgt * power * 0.72;
        }
      }
      // Leafy irregular tree canopy shadows anchored under every colossal trunk & bush!
      for (const p of world.props) {
        if (p.layer === 'ysort' || p.layer === 'bg_titan') {
          const sx = (p.shadowRx ?? 64) * 1.38;
          const sy = (p.shadowRy ?? 16) * 2.5;
          const wx = x + (nLeaf - 0.5) * 24;
          const wy = y + (nCluster - 0.5) * 12;
          const d = Math.hypot((wx - p.x) / sx, (wy - (p.y - 6)) / sy);
          if (d < 1.15) {
            light -= (1 - d / 1.15) * 0.46;
          }
        }
      }
      // Subtle darkening at top where ground tucks underneath the lush treeline foliage ridge!
      if (y < 164) {
        light -= (1 - (y - 134) / 30) * 0.34;
      }

      lightMap[y * W + x] = light;

      // CRISP STEPPED PIXEL-ART VALUE BANDS (no uniform checkerboard airbrush — organic cluster steps!)
      const stepVal = light + (nCluster - 0.5) * 0.16;
      let col: RGB;
      if (stepVal > 0.90) col = turfSunHi;
      else if (stepVal > 0.76) col = turfSunMid;
      else if (stepVal > 0.62) col = turfMoss;
      else if (stepVal > 0.48) col = turfMid;
      else if (stepVal > 0.35) col = turfDeep;
      else if (stepVal > 0.23) col = turfSh1;
      else if (stepVal > 0.12) col = turfSh2;
      else col = turfSh3;

      setPixel(buf, W, H, x, y, { ...col, a: 255 });
    }
  }

  // LAYER A: Subtle Organic Multi-Lobe Moss & Sunlit Grass Clusters (no repeating pill ovals — irregular pixel-art woodland texture!)
  for (let i = 0; i < 420; i++) {
    const cx = Math.round(12 + hash2v4(i, 11, 907) * (W - 24));
    const cy = Math.round(154 + hash2v4(i, 23, 919) * (H - 162));
    const rx = 5 + Math.floor(hash2v4(i, 37, 929) * 11);
    const ry = 2 + Math.floor(hash2v4(i, 43, 941) * 4);
    const lv = lightMap[cy * W + cx];
    const isBright = lv > 0.68;
    const isMid = lv > 0.42;
    const topCol = isBright ? turfSunHi : isMid ? turfMoss : turfDeep;
    const midCol = isBright ? turfSunMid : isMid ? turfMid : turfSh1;

    for (let dy = -ry; dy <= ry; dy++) {
      for (let dx = -rx; dx <= rx; dx++) {
        const px = cx + dx, py = cy + dy;
        if (px < 0 || px >= W || py < 144 || py >= H) continue;
        const d = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
        const warp = (fbm2(px * 3.1, py * 3.8, 971 + (i % 7)) - 0.5) * 0.95;
        if (d + warp > 0.72) continue;
        const col = dy < 0 ? topCol : midCol;
        setPixel(buf, W, H, px, py, { ...col, a: 255 });
      }
    }
  }

  // LAYER B: Natural Earthy Moss-Scuff Pockets & Exposed Creeping Forest Rootlets around Tree Bases (ZERO artificial road!)
  for (let i = 0; i < 110; i++) {
    const cx = Math.round(20 + hash2v4(i, 51, 1009) * (W - 40));
    const cy = Math.round(166 + hash2v4(i, 67, 1019) * (H - 176));
    if (lightMap[cy * W + cx] < 0.44) continue;
    const rx = 3 + Math.floor(hash2v4(i, 73, 1031) * 6);
    const ry = 2 + Math.floor(hash2v4(i, 79, 1039) * 3);
    for (let dy = -ry; dy <= ry; dy++) {
      for (let dx = -rx; dx <= rx; dx++) {
        const d = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
        if (d + (hash2v4(cx + dx, cy + dy, 1051) - 0.5) * 0.45 > 0.85) continue;
        const col = dy < 0 ? earthMid : d > 0.55 ? earthDeep : earthDk;
        setPixel(buf, W, H, cx + dx, cy + dy, { ...col, a: 255 });
      }
    }
  }

  // LAYER C: Crisp Organic Sky-Reflecting Rainwater Puddles with Multi-Tone Shoreline & Reflected Treetops!
  for (const [px, py, rx, ry, seed] of puddles) {
    const x0 = Math.max(0, Math.floor(px - rx * 1.45));
    const x1 = Math.min(W - 1, Math.ceil(px + rx * 1.45));
    const y0 = Math.max(142, Math.floor(py - ry * 1.45));
    const y1 = Math.min(H - 1, Math.ceil(py + ry * 1.45));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const warp = (fbm2(x * 1.7, y * 1.9, seed) - 0.5) * 0.72;
        const d = Math.hypot((x - px) / rx, (y - py) / ry) + warp;
        if (d < 0.90) {
          const reflN = fbm2(x * 1.3 + 20, y * 2.1, seed + 55);
          let col: RGB;
          if (d > 0.77 && y < py) col = skyPudEdge;
          else if (d > 0.77) col = skyPudRim;
          else if (reflN > 0.65) col = skyPudHi;
          else if (reflN > 0.42) col = skyPudMid;
          else col = skyPudDeep;
          setPixel(buf, W, H, x, y, { ...col, a: 255 });
        } else if (d < 1.06) {
          // Crisp mossy/damp earthen shoreline rim
          const col = y < py ? turfSh2 : ((x + y) & 1) === 0 ? earthDk : turfSh1;
          setPixel(buf, W, H, x, y, { ...col, a: 255 });
        }
      }
    }
  }

  // LAYER D: Hand-Pixeled Layered Grass Blade Tufts, Mossy Pebbles, Fallen Red-Amber Leaves & Woodland Blooms!
  const leafWarm = hexToRgb('#c27138');
  const leafDk = hexToRgb('#78381c');
  const orchHi = hexToRgb('#ffe36e');
  const orchMid = hexToRgb('#ff8c42');
  const cyanBud = hexToRgb('#85f7f0');
  const whiteBlossom = hexToRgb('#f2fffd');

  // Crisp 5-blade & 3-blade pixel-art meadow tufts (over 900 organic tufts!)
  for (let i = 0; i < 920; i++) {
    const gx = Math.round(10 + hash2v4(i, 13, 809) * (W - 20));
    const gy = Math.round(146 + hash2v4(i, 29, 821) * (H - 154));
    const bg = getPixel(buf, W, H, gx, gy);
    if (bg.a < 128 || bg.b > bg.g + 12) continue; // skip puddles
    const lv = lightMap[gy * W + gx];
    const baseC = lv > 0.68 ? turfMid : lv > 0.42 ? turfSh1 : turfSh3;
    const midC = lv > 0.68 ? turfMoss : lv > 0.42 ? turfDeep : turfSh2;
    const tipC = lv > 0.68 ? turfSunHi : lv > 0.42 ? turfSunMid : turfMid;

    // Grounded 1px shadow base under tuft
    setPixel(buf, W, H, gx, gy + 1, { ...baseC, a: 255 });
    setPixel(buf, W, H, gx - 1, gy + 1, { ...baseC, a: 255 });
    // Center + flanking blades
    setPixel(buf, W, H, gx, gy, { ...midC, a: 255 });
    setPixel(buf, W, H, gx, gy - 1, { ...tipC, a: 255 });
    setPixel(buf, W, H, gx - 1, gy, { ...midC, a: 255 });
    setPixel(buf, W, H, gx - 2, gy - 1, { ...tipC, a: 255 });
    setPixel(buf, W, H, gx + 1, gy, { ...baseC, a: 255 });
    setPixel(buf, W, H, gx + 2, gy - 1, { ...midC, a: 255 });
    if (i % 3 === 0) {
      setPixel(buf, W, H, gx, gy - 2, { ...tipC, a: 255 });
    }
  }

  // Mossy woodland stones & fallen cinnamon reedwood leaves!
  for (let i = 0; i < 85; i++) {
    const sx = Math.round(24 + hash2v4(i, 83, 1117) * (W - 48));
    const sy = Math.round(168 + hash2v4(i, 97, 1129) * (H - 178));
    const bg = getPixel(buf, W, H, sx, sy);
    if (bg.a < 128 || bg.b > bg.g + 12) continue;
    if (i % 2 === 0) {
      // Mossy pebble cluster
      setPixel(buf, W, H, sx, sy, { ...stoneHi, a: 255 });
      setPixel(buf, W, H, sx + 1, sy, { ...stoneHi, a: 255 });
      setPixel(buf, W, H, sx - 1, sy + 1, { ...stoneDk, a: 255 });
      setPixel(buf, W, H, sx, sy + 1, { ...stoneDk, a: 255 });
      setPixel(buf, W, H, sx + 1, sy + 1, { ...turfVoid, a: 255 });
      setPixel(buf, W, H, sx, sy - 1, { ...turfMoss, a: 255 });
    } else {
      // Fallen warm reedwood leaf cluster
      setPixel(buf, W, H, sx, sy, { ...leafWarm, a: 255 });
      setPixel(buf, W, H, sx + 1, sy, { ...leafDk, a: 255 });
      setPixel(buf, W, H, sx - 1, sy + 1, { ...earthHi, a: 255 });
    }
  }

  // Golden Sun-Drop Orchids, pale woodland clover blossoms & glowing cyan forest buds!
  const bloomSpots: Array<[number, number, 'gold' | 'cyan' | 'white']> = [
    [194, 232, 'gold'], [202, 236, 'white'], [314, 268, 'cyan'], [218, 296, 'gold'],
    [286, 250, 'white'], [266, 234, 'gold'], [342, 260, 'white'],
    [658, 246, 'cyan'], [692, 272, 'gold'], [716, 258, 'white'], [748, 272, 'gold'], [832, 264, 'cyan'],
    [1104, 240, 'gold'], [1114, 246, 'white'], [1142, 288, 'gold'], [1166, 224, 'white'],
    [1182, 254, 'gold'], [1238, 228, 'gold'], [1284, 246, 'gold'], [1296, 258, 'cyan'],
    [1224, 296, 'white'], [1274, 226, 'white'], [1152, 252, 'white'],
  ];
  for (const [bx, by, kind] of bloomSpots) {
    const c1 = kind === 'cyan' ? cyanBud : kind === 'white' ? whiteBlossom : orchHi;
    const c2 = kind === 'cyan' ? hexToRgb('#2ed1cc') : kind === 'white' ? turfSunHi : orchMid;
    setPixel(buf, W, H, bx, by + 1, { ...turfSh2, a: 255 });
    setPixel(buf, W, H, bx - 1, by, { ...c2, a: 255 });
    setPixel(buf, W, H, bx + 1, by, { ...c2, a: 255 });
    setPixel(buf, W, H, bx, by - 1, { ...c1, a: 255 });
    setPixel(buf, W, H, bx, by, { ...c1, a: 255 });
  }

  return {
    floor: { pixels: buf, width: W, height: H },
    horizon: { pixels: hDig.pixels, width: HW, height: HH },
  };
}

// ============================================================================
// 6-PLANE IMMERSIVE V7.1 FOREST RENDERER (EXACT NATIVE 480x270 GAMEPLAY VIEW!)
// ============================================================================

function drawGroundShadow(
  buf: Uint8ClampedArray, w: number, h: number,
  cx: number, cy: number, rx: number, ry: number, col: RGB, alpha: number
): void {
  const x0 = Math.max(0, Math.floor(cx - rx));
  const x1 = Math.min(w - 1, Math.ceil(cx + rx));
  const y0 = Math.max(0, Math.floor(cy - ry));
  const y1 = Math.min(h - 1, Math.ceil(cy + ry));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const d = ((x - cx) * (x - cx)) / (rx * rx) + ((y - cy) * (y - cy)) / (ry * ry);
      if (d <= 1.0) {
        blendRgbPx(buf, w, h, x, y, col, Math.round((1 - d) * alpha));
      }
    }
  }
}

export function renderV71ForestFrame(opts: {
  world: V71ForestWorldDef;
  floor: RgbaImage;
  horizon: RgbaImage;
  sprites: Record<string, RgbaImage>;
  maraSprites: MaraV7SpriteSet;
  maraX: number;
  maraY: number;
  maraDir: MaraDirV7;
  maraStep: number;
  camX: number;
  camY: number;
  animPhase?: number;
}): { pixels: Uint8ClampedArray; occludedPixels: number } {
  const { world, floor, horizon, sprites, maraSprites, maraX, maraY, maraDir, maraStep } = opts;
  const animPhase = opts.animPhase ?? 0;
  const icamX = Math.round(Math.max(0, Math.min(world.worldW - V71_VIEW_W, opts.camX)));
  const icamY = Math.round(Math.max(0, Math.min(world.worldH - V71_VIEW_H, opts.camY)));
  const out = createEmptyBuffer(V71_VIEW_W, V71_VIEW_H);

  // PLANE 0: Distant Morning Sky & Colossal Monolith Horizon (0.22x Parallax!)
  const hScrollX = Math.round((icamX * 0.22) % Math.max(1, horizon.width - V71_VIEW_W));
  for (let y = 0; y < Math.min(horizon.height, V71_VIEW_H); y++) {
    for (let x = 0; x < V71_VIEW_W; x++) {
      const sx = (hScrollX + x) % horizon.width;
      const si = (y * horizon.width + sx) * 4;
      const di = (y * V71_VIEW_W + x) * 4;
      out[di] = horizon.pixels[si];
      out[di + 1] = horizon.pixels[si + 1];
      out[di + 2] = horizon.pixels[si + 2];
      out[di + 3] = 255;
    }
  }

  // PLANE 1A: Continuous Handcrafted Clustered 16-bit Playable Forest Floor
  for (let y = 0; y < V71_VIEW_H; y++) {
    const sy = icamY + y;
    if (sy < 0 || sy >= floor.height) continue;
    for (let x = 0; x < V71_VIEW_W; x++) {
      const sx = icamX + x;
      if (sx < 0 || sx >= floor.width) continue;
      const si = (sy * floor.width + sx) * 4;
      if (floor.pixels[si + 3] < 128) continue;
      const di = (y * V71_VIEW_W + x) * 4;
      out[di] = floor.pixels[si];
      out[di + 1] = floor.pixels[si + 1];
      out[di + 2] = floor.pixels[si + 2];
      out[di + 3] = 255;
    }
  }

  // PLANE 1B: Continuous Lush Layered Distant Treeline Foliage Ridge (overlaps top floor edge organically!)
  for (const p of world.props) {
    if (p.layer !== 'treeline') continue;
    const spr = sprites[p.spriteKey];
    const dx = Math.round(p.x - icamX - spr.width / 2);
    const dy = Math.round(p.y - icamY - spr.height);
    if (dx + spr.width < -10 || dx > V71_VIEW_W + 10) continue;
    blitV4(out, V71_VIEW_W, V71_VIEW_H, spr.pixels, spr.width, spr.height, dx, dy);
  }

  // Animated puddle glints!
  const glint = hexToRgb('#f2fffd');
  const ph = animPhase * Math.PI * 2;
  for (let i = 0; i < 24; i++) {
    const wx = 180 + hash2v4(i, 19, 431) * 1160;
    const wy = 248 + hash2v4(i, 37, 439) * 58;
    const sx = Math.round(wx - icamX);
    const sy = Math.round(wy - icamY);
    if (sx < 1 || sx >= V71_VIEW_W - 2 || sy < 1 || sy >= V71_VIEW_H - 1) continue;
    const bg = getPixel(out, V71_VIEW_W, V71_VIEW_H, sx, sy);
    if (bg.b > bg.g + 16 && Math.sin(ph + i * 1.4) > 0.35) {
      blendRgbPx(out, V71_VIEW_W, V71_VIEW_H, sx, sy, glint, 220);
      blendRgbPx(out, V71_VIEW_W, V71_VIEW_H, sx + 1, sy, glint, 145);
    }
  }

  // PLANE 2: Rear Perimeter Colossal Forest Wall (sorted by y)
  const shCol = hexToRgb('#09241c');
  const bgProps = world.props.filter((p) => p.layer === 'bg_titan').sort((a, b) => a.y - b.y);
  for (const p of bgProps) {
    const spr = sprites[p.spriteKey];
    if (p.shadowRx && p.shadowRy) {
      drawGroundShadow(out, V71_VIEW_W, V71_VIEW_H, p.x - icamX, p.y - icamY - 3, p.shadowRx, p.shadowRy, shCol, 128);
    }
    const dx = Math.round(p.x - icamX - spr.width / 2);
    const dy = Math.round(p.y - icamY - spr.height);
    if (dx + spr.width < 0 || dx >= V71_VIEW_W) continue;
    blitV4(out, V71_VIEW_W, V71_VIEW_H, spr.pixels, spr.width, spr.height, dx, dy);
  }

  // PLANE 3: TRUE Y-SORTED PLAYABLE COLOSSAL ARCHITECTURE + DR. MARA LIN!
  const ysortProps = world.props.filter((p) => p.layer === 'ysort');
  for (const p of ysortProps) {
    if (p.shadowRx && p.shadowRy) {
      drawGroundShadow(out, V71_VIEW_W, V71_VIEW_H, p.x - icamX, p.y - icamY - 3, p.shadowRx, p.shadowRy, shCol, 140);
    }
  }
  drawGroundShadow(out, V71_VIEW_W, V71_VIEW_H, maraX - icamX, maraY - icamY - 1, 9, 3.5, shCol, 145);

  interface SortEntry { sortY: number; kind: 'prop' | 'mara'; prop?: V71PropInstance }
  const queue: SortEntry[] = ysortProps.map((prop) => ({ sortY: prop.y, kind: 'prop', prop }));
  queue.push({ sortY: maraY, kind: 'mara' });
  queue.sort((a, b) => a.sortY - b.sortY);

  const maraFrame = maraSprites.frames[maraDir][maraStep % 4];
  const mScreenX = Math.round(maraX - icamX - maraSprites.frameW / 2);
  const mScreenY = Math.round(maraY - icamY - (maraSprites.frameH - 3));
  let maraDrawn = false;
  const occMask = new Uint8Array(V71_VIEW_W * V71_VIEW_H);

  for (const item of queue) {
    if (item.kind === 'mara') {
      blitV4(out, V71_VIEW_W, V71_VIEW_H, maraFrame, maraSprites.frameW, maraSprites.frameH, mScreenX, mScreenY);
      maraDrawn = true;
    } else if (item.prop) {
      const spr = sprites[item.prop.spriteKey];
      const dx = Math.round(item.prop.x - icamX - spr.width / 2);
      const dy = Math.round(item.prop.y - icamY - spr.height);
      if (dx + spr.width < -10 || dx > V71_VIEW_W + 10) continue;
      blitV4(out, V71_VIEW_W, V71_VIEW_H, spr.pixels, spr.width, spr.height, dx, dy);

      if (maraDrawn) {
        for (let my = 0; my < maraSprites.frameH; my++) {
          const sy = mScreenY + my;
          if (sy < 0 || sy >= V71_VIEW_H) continue;
          const py = sy - dy;
          if (py < 0 || py >= spr.height) continue;
          for (let mx = 0; mx < maraSprites.frameW; mx++) {
            const sx = mScreenX + mx;
            if (sx < 0 || sx >= V71_VIEW_W) continue;
            const px = sx - dx;
            if (px < 0 || px >= spr.width) continue;
            if (maraFrame[(my * maraSprites.frameW + mx) * 4 + 3] > 128 &&
                spr.pixels[(py * spr.width + px) * 4 + 3] > 128) {
              occMask[sy * V71_VIEW_W + sx] = 1;
            }
          }
        }
      }
    }
  }

  // Floating sunlit pollen & luminous cyan forest spores drifting between mid & foreground!
  const goldMote = hexToRgb('#ffe36e');
  const cyanMote = hexToRgb('#85f7f0');
  for (let i = 0; i < 28; i++) {
    const bx = 30 + hash2v4(i, 41, 757) * (world.worldW - 60);
    const by0 = 78 + hash2v4(i, 61, 761) * 210;
    const drift = (animPhase + hash2v4(i, 79, 769)) % 1;
    const fade = Math.sin(drift * Math.PI);
    const sx = Math.round(bx + Math.sin(ph + i * 1.3) * 5 - icamX);
    const sy = Math.round(by0 - drift * 18 - icamY);
    if (sx >= 0 && sx < V71_VIEW_W && sy >= 0 && sy < V71_VIEW_H) {
      blendRgbPx(out, V71_VIEW_W, V71_VIEW_H, sx, sy, i % 3 === 0 ? cyanMote : goldMote, Math.round(fade * 210));
    }
  }

  // PLANE 4 & 5: OVERHANGING HIGH CANOPY BOUGHS + FOREGROUND CAMERA FRAMING (anchored exact parallax!)
  for (const layerName of ['overhang', 'foreground'] as const) {
    for (const p of world.props) {
      if (p.layer !== layerName) continue;
      const spr = sprites[p.spriteKey];
      const pf = p.parallax ?? (layerName === 'foreground' ? 1.15 : 1.05);
      const anchor = p.anchorCamX ?? 0;
      const dx = Math.round(p.x - icamX - (icamX - anchor) * (pf - 1));
      const dy = Math.round(p.y - icamY);
      if (dx + spr.width < -16 || dx > V71_VIEW_W + 16) continue;
      blitV4(out, V71_VIEW_W, V71_VIEW_H, spr.pixels, spr.width, spr.height, dx, dy);

      // Also track foreground bush/canopy overlap over Mara so she NEVER becomes unreadable!
      for (let my = 0; my < maraSprites.frameH; my++) {
        const sy = mScreenY + my;
        if (sy < 0 || sy >= V71_VIEW_H) continue;
        const py = sy - dy;
        if (py < 0 || py >= spr.height) continue;
        for (let mx = 0; mx < maraSprites.frameW; mx++) {
          const sx = mScreenX + mx;
          if (sx < 0 || sx >= V71_VIEW_W) continue;
          const px = sx - dx;
          if (px < 0 || px >= spr.width) continue;
          if (maraFrame[(my * maraSprites.frameW + mx) * 4 + 3] > 128 &&
              spr.pixels[(py * spr.width + px) * 4 + 3] > 128) {
            occMask[sy * V71_VIEW_W + sx] = 1;
          }
        }
      }
    }
  }

  // Localized Readability Silhouette Peek ONLY on overlapped Mara pixels behind ANY colossal trunk OR foreground bush!
  let occludedPixels = 0;
  for (let i = 0; i < occMask.length; i++) occludedPixels += occMask[i];
  if (occludedPixels >= 16) {
    const rim = hexToRgb('#85f7f0');
    for (let my = 0; my < maraSprites.frameH; my++) {
      const sy = mScreenY + my;
      if (sy < 1 || sy >= V71_VIEW_H - 1) continue;
      for (let mx = 0; mx < maraSprites.frameW; mx++) {
        const sx = mScreenX + mx;
        if (sx < 1 || sx >= V71_VIEW_W - 1) continue;
        if (!occMask[sy * V71_VIEW_W + sx]) continue;
        const mL = mx > 0 ? maraFrame[(my * maraSprites.frameW + (mx - 1)) * 4 + 3] : 0;
        const mR = mx < maraSprites.frameW - 1 ? maraFrame[(my * maraSprites.frameW + (mx + 1)) * 4 + 3] : 0;
        const mU = my > 0 ? maraFrame[((my - 1) * maraSprites.frameW + mx) * 4 + 3] : 0;
        const mD = my < maraSprites.frameH - 1 ? maraFrame[((my + 1) * maraSprites.frameW + mx) * 4 + 3] : 0;
        if (mL < 128 || mR < 128 || mU < 128 || mD < 128) {
          blendRgbPx(out, V71_VIEW_W, V71_VIEW_H, sx, sy, rim, 178);
        } else if (((sx + sy) & 1) === 0) {
          const mi = (my * maraSprites.frameW + mx) * 4;
          blendRgbPx(out, V71_VIEW_W, V71_VIEW_H, sx, sy, {
            r: maraFrame[mi], g: maraFrame[mi + 1], b: maraFrame[mi + 2],
          }, 72);
        }
      }
    }
  }

  return { pixels: out, occludedPixels };
}
