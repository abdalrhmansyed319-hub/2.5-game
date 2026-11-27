/**
 * VERDANT SIGNAL V7.2 — VISUAL REFINEMENT, ENVIRONMENTAL LIFE & GODOT-SYNCED ENGINE
 * =================================================================================
 * Preserves V7.1's approved A (Dense Corridor), B (Deep Interior), and C (Clearing)
 * compositions while elevating:
 *   1. Silhouette & bark variety: 5 distinct colossal trunk anatomies + 2 distinct
 *      overhanging canopies + 2 distinct foreground frames + tucked fern root-skirts
 *      + natural Chime-Reed & Sun-Drop Orchid clearing focal outcrop.
 *   2. Root-to-ground integration: baked damp moss aprons, fallen warm bark litter,
 *      tight ambient-occlusion root contact shadows & tucked fern skirts.
 *   3. Restrained environmental life: desynchronized canopy/branch sway, travelling
 *      fern/bush breeze waves, puddle dew-drop water ripples, subtle drifting dappled
 *      light, occasional falling cinnamon leaves & quiet acoustic spores/pollen.
 *   4. Refined player readability: natural ordered-dither foliage peek showing Mara's
 *      actual warm expedition colors (ZERO artificial neon cyan outline!), dynamic
 *      sun-to-shade lighting integration & subtle puddle foot ripples.
 */

import { createEmptyBuffer, getPixel, setPixel } from '../engine/pixelBuffer';
import { blitV4, hash2v4 } from '../v4_masterpiece/v4Core';
import { type RGB, blendRgbPx, digitizeToCraftedPixelArt, hexToRgb, loadUnderpaintToGrid } from '../v5_soul/v5PixelEngine';
import { type MaraDirV7, type MaraV7SpriteSet } from '../v7_immersive/v7PixelAtlas';
import { type RgbaImage } from '../v7_immersive/v7WorldEngine';

export const V72_VIEW_W = 480;
export const V72_VIEW_H = 270;
export const V72_WORLD_W = 1440;
export const V72_WORLD_H = 340;

/** Curated 60-Color VERDANT SIGNAL Singing Canopy V7.2 Master Palette (True Hue-Shifted Lighting!) */
export const V72_FOREST_MASTER_PALETTE: string[] = [
  // Morning Turquoise Sky, Clouds & Distant Sunlit Sandstone Monolith Cliffs (9)
  '#f4fffc', '#c5f5f5', '#73deeb', '#33b6d6', '#258cb5',
  '#f7d29c', '#d99f6c', '#9e7262', '#5f6f85',
  // Distant Atmospheric Misty Teal Forest Silhouettes & Slate Mossy Outcrops (7)
  '#82bcc2', '#52949e', '#306e7a', '#1e5261', '#143b47', '#89a39f', '#526b6b',
  // Sunlit Chartreuse Glade -> Lush Mid-Emerald -> Deep Cool Pine Canopy Shade (11)
  '#e3f062', '#b9de49', '#8bc439', '#5da334', '#3b8231',
  '#24642e', '#174b2a', '#0f3724', '#09241d', '#051615', '#344f38',
  // Sky-Reflecting Rainwater Puddles & Wet Mossy Shorelines (5)
  '#dcf9ff', '#84d7fa', '#40a2e0', '#246fb0', '#144370',
  // Sophisticated Colossal Bark: Warm Sunlit Amber -> Mahogany -> Cool Indigo-Plum Crevices (11)
  '#e8a05a', '#c9783c', '#a35629', '#7d3b1e', '#592718',
  '#3c1a16', '#261116', '#170b12', '#332436', '#4a3245', '#6e4e44',
  // Organic Forest Earth, Fallen Bark Litter & Mossy Damp Soil (4)
  '#b89050', '#8f6b3a', '#664a2c', '#453120',
  // Bioluminescent Acoustic Chime-Reeds, Cyan Moss & Lavender Shelf-Fungi (8)
  '#e6ffff', '#94f5ee', '#40cfc9', '#1e8c91',
  '#f2d4ff', '#c98ee3', '#8c52ad', '#562f73',
  // Sun-Drop Orchids & Mara Harmonized Expedition Suit (5)
  '#ffe573', '#ff9247', '#d45526', '#edf2f7', '#cf363a',
];

export type V72LayerKind = 'treeline' | 'bg_titan' | 'ysort' | 'overhang' | 'foreground';
export type V72SwayKind = 'none' | 'canopy' | 'fern' | 'bush' | 'chime';

export interface V72PropInstance {
  id: string;
  spriteKey: string;
  /** World X (center-bottom for treeline/bg_titan/ysort; world top-left for overhang/foreground) */
  x: number;
  /** World Y (exact foot-base sortY for treeline/bg_titan/ysort; world top-left for overhang/foreground) */
  y: number;
  layer: V72LayerKind;
  parallax?: number;
  anchorCamX?: number;
  /** Solid collider ellipse (omitted for walkable fern skirts & rear visual trees) */
  colRx?: number;
  colRy?: number;
  colOffsetY?: number;
  /** Soft ground shadow radii + damp root-skirt integration radius */
  shadowRx?: number;
  shadowRy?: number;
  /** Whether to bake damp root-apron moss & fallen bark chips directly on ground under this prop */
  rootSkirt?: boolean;
  /** Desynchronized environmental motion parameters (identical in Godot shaders & live preview!) */
  swayKind?: V72SwayKind;
  swayAmp?: number;
  swaySpeed?: number;
  swayPhase?: number;
}

export interface V72PuddleDef {
  id: string;
  x: number;
  y: number;
  rx: number;
  ry: number;
  seed: number;
  ripplePhase: number;
  ripplePeriod: number;
}

export interface V72ForestWorldDef {
  worldW: number;
  worldH: number;
  walkBounds: { minX: number; maxX: number; minY: number; maxY: number };
  presets: {
    A_corridor: { title: string; maraX: number; maraY: number; dir: MaraDirV7; camX: number; camY: number };
    B_interior: { title: string; maraX: number; maraY: number; dir: MaraDirV7; camX: number; camY: number };
    C_clearing: { title: string; maraX: number; maraY: number; dir: MaraDirV7; camX: number; camY: number };
  };
  puddles: V72PuddleDef[];
  props: V72PropInstance[];
}

export function getV72ForestWorldDef(): V72ForestWorldDef {
  return {
    worldW: V72_WORLD_W,
    worldH: V72_WORLD_H,
    walkBounds: { minX: 48, maxX: 1392, minY: 168, maxY: 318 },
    presets: {
      A_corridor: {
        title: 'A. DENSE FOREST CORRIDOR (V7.2 NATIVE 480X270)',
        maraX: 254,
        maraY: 266,
        dir: 'up',
        camX: 0,
        camY: 42,
      },
      B_interior: {
        title: 'B. DEEP FOREST INTERIOR (V7.2 NATIVE 480X270)',
        maraX: 678,
        maraY: 264,
        dir: 'right',
        camX: 480,
        camY: 42,
      },
      C_clearing: {
        title: 'C. DRAMATIC FOREST CLEARING (V7.2 NATIVE 480X270)',
        maraX: 1192,
        maraY: 274,
        dir: 'up',
        camX: 960,
        camY: 42,
      },
    },
    puddles: [
      { id: 'puddle_A_small', x: 222, y: 264, rx: 24, ry: 9, seed: 137, ripplePhase: 0.15, ripplePeriod: 3.9 },
      { id: 'puddle_A_main', x: 296, y: 294, rx: 46, ry: 16, seed: 101, ripplePhase: 0.62, ripplePeriod: 4.7 },
      { id: 'puddle_B_heart', x: 664, y: 278, rx: 34, ry: 12, seed: 211, ripplePhase: 0.34, ripplePeriod: 5.1 },
      { id: 'puddle_C_left', x: 1128, y: 268, rx: 36, ry: 13, seed: 349, ripplePhase: 0.81, ripplePeriod: 4.3 },
      { id: 'puddle_C_main', x: 1258, y: 288, rx: 56, ry: 18, seed: 307, ripplePhase: 0.08, ripplePeriod: 3.6 },
    ],
    props: [
      // ======================================================================
      // LAYER 1B: CONTINUOUS LAYERED DISTANT TREELINE FOLIAGE RIDGE
      // ======================================================================
      { id: 'TL_A1', spriteKey: 'treeline_ridge', x: 160, y: 172, layer: 'treeline' },
      { id: 'TL_A2', spriteKey: 'treeline_ridge_flip', x: 420, y: 174, layer: 'treeline' },
      { id: 'TL_B1', spriteKey: 'treeline_ridge', x: 680, y: 172, layer: 'treeline' },
      { id: 'TL_B2', spriteKey: 'treeline_ridge_flip', x: 940, y: 174, layer: 'treeline' },
      { id: 'TL_C1', spriteKey: 'treeline_ridge', x: 1200, y: 172, layer: 'treeline' },
      { id: 'TL_C2', spriteKey: 'treeline_ridge_flip', x: 1420, y: 174, layer: 'treeline' },

      // ======================================================================
      // ZONE A (x = 0..480): DENSE FOREST CORRIDOR (V7.1 layout refined with
      // 4 unique trunk anatomies, tucked fern skirts & bespoke foreground bough!)
      // ======================================================================
      { id: 'A_bg_left_deep', spriteKey: 'titan_moss_pillar_bg', x: 194, y: 176, layer: 'bg_titan', shadowRx: 72, shadowRy: 16, rootSkirt: true },
      { id: 'A_bg_right_deep', spriteKey: 'titan_straight_bg', x: 378, y: 172, layer: 'bg_titan', shadowRx: 68, shadowRy: 15, rootSkirt: true },
      { id: 'A_bg_bush_l', spriteKey: 'bush_mid_dark', x: 44, y: 176, layer: 'bg_titan', swayKind: 'bush', swayAmp: 0.7, swaySpeed: 0.71, swayPhase: 0.4 },
      { id: 'A_bg_bush_c', spriteKey: 'bush_small_dark', x: 256, y: 168, layer: 'bg_titan', swayKind: 'bush', swayAmp: 0.6, swaySpeed: 0.89, swayPhase: 1.7 },
      { id: 'A_bg_bush_r', spriteKey: 'bush_mid_dark', x: 446, y: 174, layer: 'bg_titan', swayKind: 'bush', swayAmp: 0.7, swaySpeed: 0.63, swayPhase: 3.1 },

      // Left Colossal Wall: straight furrowed redwood rising straight off top edge + tucked fern root-skirt!
      { id: 'A_mid_left_titan', spriteKey: 'titan_straight_tall', x: 92, y: 248, layer: 'ysort', colRx: 34, colRy: 13, colOffsetY: -12, shadowRx: 92, shadowRy: 22, rootSkirt: true },
      { id: 'A_fern_left_root', spriteKey: 'fern_cluster', x: 134, y: 248, layer: 'ysort', shadowRx: 20, shadowRy: 6, swayKind: 'fern', swayAmp: 1.3, swaySpeed: 1.18, swayPhase: 0.2 },
      { id: 'A_bush_mid_left', spriteKey: 'bush_mid', x: 180, y: 214, layer: 'ysort', colRx: 20, colRy: 9, colOffsetY: -6, shadowRx: 44, shadowRy: 12, swayKind: 'bush', swayAmp: 0.9, swaySpeed: 0.84, swayPhase: 2.3 },

      // Staggered Mid-Right Leaning Gnarled Titan + fern tuft
      { id: 'A_mid_right_lean', spriteKey: 'titan_gnarled_flip', x: 354, y: 220, layer: 'ysort', colRx: 32, colRy: 13, colOffsetY: -10, shadowRx: 80, shadowRy: 19, rootSkirt: true },
      { id: 'A_fern_mid_right', spriteKey: 'fern_cluster_small_flip', x: 306, y: 226, layer: 'ysort', shadowRx: 18, shadowRy: 6, swayKind: 'fern', swayAmp: 1.2, swaySpeed: 1.32, swayPhase: 4.1 },

      // Close Front-Right NEW DRAMATIC SPLIT HOLLOW ARCH TITAN (gripping mossy boulders beside Mara!)
      { id: 'A_front_right_titan', spriteKey: 'titan_split_arch', x: 422, y: 298, layer: 'ysort', colRx: 42, colRy: 16, colOffsetY: -12, shadowRx: 102, shadowRy: 24, rootSkirt: true },
      { id: 'A_fern_front_r', spriteKey: 'fern_cluster_flip', x: 354, y: 294, layer: 'ysort', shadowRx: 22, shadowRy: 7, swayKind: 'fern', swayAmp: 1.4, swaySpeed: 1.07, swayPhase: 1.1 },

      // Asymmetric Overhanging Canopy: NEW crooked mossy bough sweeping from top-right!
      { id: 'A_ov_tr', spriteKey: 'canopy_bough_alt_flip', x: 214, y: 24, layer: 'overhang', parallax: 1.05, anchorCamX: 0, swayKind: 'canopy', swayAmp: 1.5, swaySpeed: 0.68, swayPhase: 0.5 },
      { id: 'A_ov_tl_edge', spriteKey: 'canopy_mass_flip', x: -188, y: 6, layer: 'overhang', parallax: 1.05, anchorCamX: 0, swayKind: 'canopy', swayAmp: 1.2, swaySpeed: 0.82, swayPhase: 2.6 },

      // NEW Rich Gnarled Moss-Branch & Silhouetted Jungle Fern Foreground Framing bottom-left!
      { id: 'A_fg_bot_left', spriteKey: 'fg_bough_fern', x: -24, y: 164, layer: 'foreground', parallax: 1.15, anchorCamX: 0, swayKind: 'fern', swayAmp: 1.4, swaySpeed: 0.77, swayPhase: 1.9 },

      // ======================================================================
      // TRANSITION GATEWAY A -> B (x = 450..540)
      // ======================================================================
      { id: 'AB_bg_wall', spriteKey: 'titan_gnarled_bg', x: 508, y: 170, layer: 'bg_titan', shadowRx: 72, shadowRy: 16, rootSkirt: true },
      { id: 'AB_bush_top', spriteKey: 'bush_mid_dark', x: 486, y: 192, layer: 'ysort', colRx: 24, colRy: 10, colOffsetY: -6, shadowRx: 46, shadowRy: 12, swayKind: 'bush', swayAmp: 0.8, swaySpeed: 0.91, swayPhase: 3.4 },

      // ======================================================================
      // ZONE B (x = 480..960): DEEP FOREST INTERIOR
      // 4 depth tiers combining ALL 5 distinct trunk anatomies, giant fallen log,
      // tucked fern root-skirts & 3 distinct interlocking overhanging canopies!
      // ======================================================================
      { id: 'B_bg_1', spriteKey: 'titan_straight_bg', x: 598, y: 166, layer: 'bg_titan', shadowRx: 68, shadowRy: 15, rootSkirt: true },
      { id: 'B_bg_2', spriteKey: 'titan_split_arch_bg', x: 752, y: 170, layer: 'bg_titan', shadowRx: 78, shadowRy: 16, rootSkirt: true },
      { id: 'B_bg_3', spriteKey: 'titan_moss_pillar_bg', x: 912, y: 166, layer: 'bg_titan', shadowRx: 74, shadowRy: 16, rootSkirt: true },
      { id: 'B_bg_bush_1', spriteKey: 'bush_mid_dark', x: 672, y: 176, layer: 'bg_titan', swayKind: 'bush', swayAmp: 0.6, swaySpeed: 0.74, swayPhase: 0.9 },
      { id: 'B_bg_bush_2', spriteKey: 'bush_mid_dark', x: 836, y: 178, layer: 'bg_titan', swayKind: 'bush', swayAmp: 0.6, swaySpeed: 0.66, swayPhase: 2.4 },

      // Mid-Back Overlapping Ancient Titans & Giant Fallen Hollow Mossy Log + Tucked Ferns!
      { id: 'B_mid_left_gnarled', spriteKey: 'titan_gnarled', x: 600, y: 228, layer: 'ysort', colRx: 34, colRy: 14, colOffsetY: -10, shadowRx: 86, shadowRy: 20, rootSkirt: true },
      { id: 'B_mid_right_titan', spriteKey: 'titan_straight', x: 868, y: 224, layer: 'ysort', colRx: 34, colRy: 14, colOffsetY: -10, shadowRx: 82, shadowRy: 19, rootSkirt: true },
      { id: 'B_fallen_log', spriteKey: 'fallen_log', x: 716, y: 226, layer: 'ysort', colRx: 36, colRy: 11, colOffsetY: -8, shadowRx: 68, shadowRy: 16, rootSkirt: true },
      { id: 'B_fern_log_l', spriteKey: 'fern_cluster_small', x: 656, y: 232, layer: 'ysort', shadowRx: 18, shadowRy: 6, swayKind: 'fern', swayAmp: 1.2, swaySpeed: 1.24, swayPhase: 0.7 },
      { id: 'B_bush_mid_r', spriteKey: 'bush_mid', x: 782, y: 204, layer: 'ysort', colRx: 20, colRy: 9, colOffsetY: -6, shadowRx: 42, shadowRy: 11, swayKind: 'bush', swayAmp: 0.8, swaySpeed: 0.88, swayPhase: 4.5 },

      // Close Foreground-Mid Colossal Trunks right INSIDE playable area (cathedral buttress left + plated moss pillar right!)
      { id: 'B_front_left_titan', spriteKey: 'titan_buttress', x: 538, y: 304, layer: 'ysort', colRx: 40, colRy: 15, colOffsetY: -12, shadowRx: 98, shadowRy: 23, rootSkirt: true },
      { id: 'B_front_center_titan', spriteKey: 'titan_moss_pillar', x: 806, y: 298, layer: 'ysort', colRx: 36, colRy: 14, colOffsetY: -10, shadowRx: 90, shadowRy: 21, rootSkirt: true },
      { id: 'B_fern_front_c', spriteKey: 'fern_cluster', x: 626, y: 292, layer: 'ysort', shadowRx: 24, shadowRy: 7, swayKind: 'fern', swayAmp: 1.4, swaySpeed: 1.12, swayPhase: 2.8 },
      { id: 'B_fern_pillar_base', spriteKey: 'fern_cluster_small_flip', x: 742, y: 296, layer: 'ysort', shadowRx: 18, shadowRy: 6, swayKind: 'fern', swayAmp: 1.2, swaySpeed: 1.29, swayPhase: 5.1 },

      // Seamless Interlocking Overhanging Canopy Cathedral Roof (3 distinct shapes, desynchronized slow sway!)
      { id: 'B_ov_crown', spriteKey: 'canopy_mass_wide', x: 562, y: -14, layer: 'overhang', parallax: 1.05, anchorCamX: 480, swayKind: 'canopy', swayAmp: 1.1, swaySpeed: 0.59, swayPhase: 1.4 },
      { id: 'B_ov_left', spriteKey: 'canopy_bough_alt', x: 454, y: 18, layer: 'overhang', parallax: 1.05, anchorCamX: 480, swayKind: 'canopy', swayAmp: 1.6, swaySpeed: 0.76, swayPhase: 3.9 },
      { id: 'B_ov_right', spriteKey: 'canopy_mass', x: 698, y: 12, layer: 'overhang', parallax: 1.05, anchorCamX: 480, swayKind: 'canopy', swayAmp: 1.4, swaySpeed: 0.67, swayPhase: 0.2 },

      // Foreground Dark Shadowed Undergrowth Framing BOTH lower corners (100% uncropped silhouettes on interior scrolling edges!)
      { id: 'B_fg_bl', spriteKey: 'bush_fg_huge', x: 432, y: 204, layer: 'foreground', parallax: 1.15, anchorCamX: 480, swayKind: 'bush', swayAmp: 1.2, swaySpeed: 0.81, swayPhase: 2.1 },
      { id: 'B_fg_br', spriteKey: 'bush_fg_small_flip', x: 826, y: 214, layer: 'foreground', parallax: 1.15, anchorCamX: 480, swayKind: 'bush', swayAmp: 1.3, swaySpeed: 0.73, swayPhase: 4.7 },

      // ======================================================================
      // TRANSITION THROAT B -> C (x = 928..1020)
      // ======================================================================
      { id: 'BC_throat_top', spriteKey: 'titan_straight', x: 966, y: 212, layer: 'ysort', colRx: 32, colRy: 13, colOffsetY: -10, shadowRx: 78, shadowRy: 18, rootSkirt: true },
      { id: 'BC_throat_bot', spriteKey: 'bush_mid', x: 962, y: 298, layer: 'ysort', colRx: 22, colRy: 9, colOffsetY: -6, shadowRx: 44, shadowRy: 12, swayKind: 'bush', swayAmp: 0.9, swaySpeed: 0.94, swayPhase: 1.2 },

      // ======================================================================
      // ZONE C (x = 960..1440): DRAMATIC SUNLIT FOREST CLEARING
      // Sun-drenched sanctuary opening ringed by distinct perimeter giants,
      // featuring our deliberate organic focal point: mossy Chime-Reed & Orchid Outcrop!
      // ======================================================================
      { id: 'C_bg_left', spriteKey: 'titan_buttress_bg', x: 1034, y: 172, layer: 'bg_titan', shadowRx: 74, shadowRy: 16, rootSkirt: true },
      { id: 'C_bg_right', spriteKey: 'titan_gnarled_bg', x: 1368, y: 174, layer: 'bg_titan', shadowRx: 76, shadowRy: 16, rootSkirt: true },
      { id: 'C_bg_bush_l', spriteKey: 'bush_small_dark', x: 1118, y: 170, layer: 'bg_titan', swayKind: 'bush', swayAmp: 0.6, swaySpeed: 0.85, swayPhase: 0.6 },
      { id: 'C_bg_bush_r', spriteKey: 'bush_small_dark', x: 1298, y: 172, layer: 'bg_titan', swayKind: 'bush', swayAmp: 0.6, swaySpeed: 0.72, swayPhase: 3.3 },

      // Perimeter Enormous Framing Titans on Left & Right Edges + Tucked Ferns!
      { id: 'C_rim_left', spriteKey: 'titan_gnarled', x: 1004, y: 266, layer: 'ysort', colRx: 34, colRy: 14, colOffsetY: -10, shadowRx: 86, shadowRy: 20, rootSkirt: true },
      { id: 'C_fern_left', spriteKey: 'fern_cluster', x: 1054, y: 264, layer: 'ysort', shadowRx: 22, shadowRy: 7, swayKind: 'fern', swayAmp: 1.3, swaySpeed: 1.15, swayPhase: 2.2 },
      { id: 'C_rim_log', spriteKey: 'fallen_log_flip', x: 1096, y: 204, layer: 'ysort', colRx: 32, colRy: 10, colOffsetY: -7, shadowRx: 60, shadowRy: 15, rootSkirt: true },

      // DELIBERATE NATURAL FOCAL LANDMARK: Mossy Chime-Reed & Sun-Drop Orchid Stone Outcrop!
      { id: 'C_focal_chime_outcrop', spriteKey: 'clearing_chime_outcrop', x: 1244, y: 224, layer: 'ysort', colRx: 26, colRy: 10, colOffsetY: -8, shadowRx: 40, shadowRy: 12, rootSkirt: true, swayKind: 'chime', swayAmp: 0.5, swaySpeed: 1.6, swayPhase: 0.4 },

      { id: 'C_rim_right_titan', spriteKey: 'titan_buttress', x: 1404, y: 288, layer: 'ysort', colRx: 42, colRy: 16, colOffsetY: -12, shadowRx: 100, shadowRy: 23, rootSkirt: true },
      { id: 'C_bush_right', spriteKey: 'bush_mid', x: 1334, y: 234, layer: 'ysort', colRx: 20, colRy: 9, colOffsetY: -6, shadowRx: 42, shadowRy: 11, swayKind: 'bush', swayAmp: 0.9, swaySpeed: 0.79, swayPhase: 5.0 },
      { id: 'C_fern_right', spriteKey: 'fern_cluster_small_flip', x: 1330, y: 274, layer: 'ysort', shadowRx: 18, shadowRy: 6, swayKind: 'fern', swayAmp: 1.2, swaySpeed: 1.21, swayPhase: 1.5 },

      // Asymmetric Outer Corner Overhanging Canopy (leaving clearing sky & sandstone cliff monoliths wide open!)
      { id: 'C_ov_tl', spriteKey: 'canopy_bough_alt', x: 868, y: 6, layer: 'overhang', parallax: 1.04, anchorCamX: 960, swayKind: 'canopy', swayAmp: 1.4, swaySpeed: 0.64, swayPhase: 2.9 },
      { id: 'C_ov_tr', spriteKey: 'canopy_mass', x: 1268, y: 12, layer: 'overhang', parallax: 1.04, anchorCamX: 960, swayKind: 'canopy', swayAmp: 1.3, swaySpeed: 0.78, swayPhase: 0.8 },

      // Foreground Framing Corners (uncropped bush on scrolling left edge + gnarled moss-branch frame anchored safely off far-right world edge > 1440!)
      { id: 'C_fg_bl', spriteKey: 'bush_fg_huge', x: 904, y: 196, layer: 'foreground', parallax: 1.15, anchorCamX: 960, swayKind: 'bush', swayAmp: 1.2, swaySpeed: 0.75, swayPhase: 3.7 },
      { id: 'C_fg_br', spriteKey: 'fg_bough_fern_flip', x: 1260, y: 164, layer: 'foreground', parallax: 1.15, anchorCamX: 960, swayKind: 'fern', swayAmp: 1.3, swaySpeed: 0.89, swayPhase: 1.0 },
    ],
  };
}

// ============================================================================
// PAINTERLY 16-BIT FOREST FLOOR + ROOT-SKIRT INTEGRATION + HORIZON BUILDER
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
    sample(x * 0.025, y * 0.036, seed) * 0.48 +
    sample(x * 0.068, y * 0.088, seed + 37) * 0.34 +
    sample(x * 0.16, y * 0.21, seed + 91) * 0.18
  );
}

export function buildV72ForestFloorAndHorizon(
  world: V72ForestWorldDef,
  horizonSourcePath: string
): { floor: RgbaImage; horizon: RgbaImage; lightMap: Float32Array } {
  const HW = 640, HH = 128;
  const hRaw = loadUnderpaintToGrid(horizonSourcePath, HW, HH, 1);
  const hDig = digitizeToCraftedPixelArt(hRaw, HW, HH, V72_FOREST_MASTER_PALETTE, {
    ditherThreshold: 0.040,
    ditherStrength: 0.018,
    cleanPasses: 2,
  });

  const W = world.worldW, H = world.worldH;
  const buf = createEmptyBuffer(W, H);

  const turfSunHi = hexToRgb('#e3f062');
  const turfSunMid = hexToRgb('#b9de49');
  const turfMoss = hexToRgb('#8bc439');
  const turfMid = hexToRgb('#5da334');
  const turfDeep = hexToRgb('#3b8231');
  const turfSh1 = hexToRgb('#24642e');
  const turfSh2 = hexToRgb('#174b2a');
  const turfSh3 = hexToRgb('#0f3724');
  const turfVoid = hexToRgb('#09241d');
  const earthHi = hexToRgb('#b89050');
  const earthMid = hexToRgb('#8f6b3a');
  const earthDk = hexToRgb('#664a2c');
  const earthDeep = hexToRgb('#453120');
  const stoneHi = hexToRgb('#89a39f');
  const stoneDk = hexToRgb('#526b6b');
  const skyPudHi = hexToRgb('#dcf9ff');
  const skyPudMid = hexToRgb('#84d7fa');
  const skyPudDeep = hexToRgb('#40a2e0');
  const skyPudRim = hexToRgb('#246fb0');
  const skyPudEdge = hexToRgb('#144370');

  // Natural dappled canopy sunlight openings (warped by multi-scale leaf noise!)
  const sunOpenings: Array<[number, number, number, number, number]> = [
    [252, 274, 114, 54, 0.90],
    [258, 214, 78, 42, 0.72],
    [682, 266, 76, 36, 0.74],
    [742, 240, 52, 24, 0.56],
    [892, 268, 56, 26, 0.54],
    [1202, 254, 178, 82, 1.04],
    [1192, 202, 134, 52, 0.90],
    [1256, 294, 136, 48, 0.95],
  ];

  const lightMap = new Float32Array(W * H);

  for (let y = 134; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nCoarse = fbm2(x, y, 503);
      const nLeaf = fbm2(x * 2.3, y * 2.7, 619);
      const nCluster = fbm2(x * 4.8, y * 5.4, 709);

      let light = 0.23 + (nCoarse - 0.45) * 0.42 + (nLeaf - 0.5) * 0.28;
      for (const [px, py, rx, ry, power] of sunOpenings) {
        const wx = x + (nLeaf - 0.5) * 36;
        const wy = y + (nCoarse - 0.5) * 22;
        const d = Math.hypot((wx - px) / rx, (wy - py) / ry);
        if (d < 1.34) {
          const wgt = Math.max(0, 1 - d / 1.34);
          light += wgt * wgt * power * 0.74;
        }
      }
      // Deep leafy irregular canopy shade anchored beneath every colossal trunk & bush
      for (const p of world.props) {
        if (p.layer === 'ysort' || p.layer === 'bg_titan') {
          const sx = (p.shadowRx ?? 64) * 1.42;
          const sy = (p.shadowRy ?? 16) * 2.55;
          const wx = x + (nLeaf - 0.5) * 26;
          const wy = y + (nCluster - 0.5) * 14;
          const d = Math.hypot((wx - p.x) / sx, (wy - (p.y - 6)) / sy);
          if (d < 1.18) {
            light -= (1 - d / 1.18) * 0.48;
          }
        }
      }
      if (y < 164) {
        light -= (1 - (y - 134) / 30) * 0.34;
      }

      lightMap[y * W + x] = light;

      // Painterly organic stepped 16-bit value clusters (zero artificial oval pads!)
      const stepVal = light + (nCluster - 0.5) * 0.22;
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

  // ROOT-SKIRT GROUND INTEGRATION: clean organic clustered damp-moss & dark-mulch aprons under EVERY trunk/log/outcrop (ZERO 1px speckle noise!)
  for (const p of world.props) {
    if (!p.rootSkirt) continue;
    const rx = (p.shadowRx ?? 76) * 0.96;
    const ry = (p.shadowRy ?? 18) * 1.18;
    const x0 = Math.max(0, Math.floor(p.x - rx));
    const x1 = Math.min(W - 1, Math.ceil(p.x + rx));
    const y0 = Math.max(140, Math.floor(p.y - ry));
    const y1 = Math.min(H - 1, Math.ceil(p.y + ry * 0.78));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const warp = (fbm2(x * 2.4, y * 2.8, 1301) - 0.5) * 0.62;
        const d = Math.hypot((x - p.x) / rx, (y - (p.y - 4)) / ry) + warp;
        if (d < 0.74) {
          const patch = fbm2(x * 3.8, y * 4.4, 1319);
          if (d < 0.40) {
            const col = patch > 0.68 ? earthDeep : patch > 0.46 ? turfSh3 : turfVoid;
            setPixel(buf, W, H, x, y, { ...col, a: 255 });
          } else if (patch > 0.62) {
            setPixel(buf, W, H, x, y, { ...turfSh3, a: 255 });
          } else if (patch < 0.24 && d < 0.58) {
            setPixel(buf, W, H, x, y, { ...earthDk, a: 255 });
          }
        }
      }
    }
  }

  // Subtle organic earth pockets & scattered fallen leaves (NO drawn road!)
  for (let i = 0; i < 88; i++) {
    const cx = Math.round(20 + hash2v4(i, 51, 1009) * (W - 40));
    const cy = Math.round(166 + hash2v4(i, 67, 1019) * (H - 176));
    if (lightMap[cy * W + cx] < 0.46) continue;
    const rx = 3 + Math.floor(hash2v4(i, 73, 1031) * 5);
    const ry = 2 + Math.floor(hash2v4(i, 79, 1039) * 3);
    for (let dy = -ry; dy <= ry; dy++) {
      for (let dx = -rx; dx <= rx; dx++) {
        const d = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
        if (d + (hash2v4(cx + dx, cy + dy, 1051) - 0.5) * 0.50 > 0.80) continue;
        const col = dy < 0 ? earthMid : d > 0.52 ? earthDeep : earthDk;
        setPixel(buf, W, H, cx + dx, cy + dy, { ...col, a: 255 });
      }
    }
  }

  // Sky-reflecting organic rainwater puddles with crisp mossy/muddy banks & reflected foliage depth
  for (const pud of world.puddles) {
    const { x: px, y: py, rx, ry, seed } = pud;
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
          if (d > 0.76 && y < py) col = skyPudEdge;
          else if (d > 0.76) col = skyPudRim;
          else if (reflN > 0.64) col = skyPudHi;
          else if (reflN > 0.40) col = skyPudMid;
          else col = skyPudDeep;
          setPixel(buf, W, H, x, y, { ...col, a: 255 });
        } else if (d < 1.07) {
          const col = y < py ? turfSh2 : ((x + y) & 1) === 0 ? earthDk : turfSh1;
          setPixel(buf, W, H, x, y, { ...col, a: 255 });
        }
      }
    }
  }

  // Hand-pixeled layered grass blade tufts, clover patches, mossy stones & blooming woodland flora
  const leafWarm = hexToRgb('#c9783c');
  const leafDk = hexToRgb('#7d3b1e');
  const orchHi = hexToRgb('#ffe573');
  const orchMid = hexToRgb('#ff9247');
  const cyanBud = hexToRgb('#94f5ee');
  const whiteBlossom = hexToRgb('#f4fffc');

  for (let i = 0; i < 1150; i++) {
    const gx = Math.round(10 + hash2v4(i, 13, 809) * (W - 20));
    const gy = Math.round(146 + hash2v4(i, 29, 821) * (H - 154));
    const bg = getPixel(buf, W, H, gx, gy);
    if (bg.a < 128 || bg.b > bg.g + 12) continue;
    const lv = lightMap[gy * W + gx];
    const baseC = lv > 0.68 ? turfMid : lv > 0.42 ? turfSh1 : turfSh3;
    const midC = lv > 0.68 ? turfMoss : lv > 0.42 ? turfDeep : turfSh2;
    const tipC = lv > 0.68 ? turfSunHi : lv > 0.42 ? turfSunMid : turfMid;

    setPixel(buf, W, H, gx, gy + 1, { ...baseC, a: 255 });
    setPixel(buf, W, H, gx - 1, gy + 1, { ...baseC, a: 255 });
    setPixel(buf, W, H, gx, gy, { ...midC, a: 255 });
    setPixel(buf, W, H, gx, gy - 1, { ...tipC, a: 255 });
    setPixel(buf, W, H, gx - 1, gy, { ...midC, a: 255 });
    setPixel(buf, W, H, gx - 2, gy - 1, { ...tipC, a: 255 });
    setPixel(buf, W, H, gx + 1, gy, { ...baseC, a: 255 });
    setPixel(buf, W, H, gx + 2, gy - 1, { ...midC, a: 255 });
    if (i % 3 === 0) setPixel(buf, W, H, gx, gy - 2, { ...tipC, a: 255 });
  }

  // Mossy stones & warm fallen cinnamon leaves
  for (let i = 0; i < 95; i++) {
    const sx = Math.round(24 + hash2v4(i, 83, 1117) * (W - 48));
    const sy = Math.round(168 + hash2v4(i, 97, 1129) * (H - 178));
    const bg = getPixel(buf, W, H, sx, sy);
    if (bg.a < 128 || bg.b > bg.g + 12) continue;
    if (i % 2 === 0) {
      setPixel(buf, W, H, sx, sy, { ...stoneHi, a: 255 });
      setPixel(buf, W, H, sx + 1, sy, { ...stoneHi, a: 255 });
      setPixel(buf, W, H, sx - 1, sy + 1, { ...stoneDk, a: 255 });
      setPixel(buf, W, H, sx, sy + 1, { ...stoneDk, a: 255 });
      setPixel(buf, W, H, sx + 1, sy + 1, { ...turfVoid, a: 255 });
      setPixel(buf, W, H, sx, sy - 1, { ...turfMoss, a: 255 });
    } else {
      setPixel(buf, W, H, sx, sy, { ...leafWarm, a: 255 });
      setPixel(buf, W, H, sx + 1, sy, { ...leafDk, a: 255 });
      setPixel(buf, W, H, sx - 1, sy + 1, { ...earthHi, a: 255 });
    }
  }

  // Sun-Drop Orchids, pale woodland clover flowers & subtle cyan buds
  const bloomSpots: Array<[number, number, 'gold' | 'cyan' | 'white']> = [
    [194, 232, 'gold'], [202, 236, 'white'], [314, 268, 'cyan'], [218, 296, 'gold'],
    [286, 250, 'white'], [266, 234, 'gold'], [342, 260, 'white'],
    [658, 246, 'cyan'], [692, 272, 'gold'], [716, 258, 'white'], [748, 272, 'gold'], [832, 264, 'cyan'],
    [1104, 240, 'gold'], [1114, 246, 'white'], [1142, 288, 'gold'], [1166, 224, 'white'],
    [1182, 254, 'gold'], [1214, 238, 'gold'], [1274, 238, 'cyan'], [1284, 248, 'gold'],
    [1296, 258, 'cyan'], [1224, 296, 'white'], [1152, 252, 'white'],
  ];
  for (const [bx, by, kind] of bloomSpots) {
    const c1 = kind === 'cyan' ? cyanBud : kind === 'white' ? whiteBlossom : orchHi;
    const c2 = kind === 'cyan' ? hexToRgb('#40cfc9') : kind === 'white' ? turfSunHi : orchMid;
    setPixel(buf, W, H, bx, by + 1, { ...turfSh2, a: 255 });
    setPixel(buf, W, H, bx - 1, by, { ...c2, a: 255 });
    setPixel(buf, W, H, bx + 1, by, { ...c2, a: 255 });
    setPixel(buf, W, H, bx, by - 1, { ...c1, a: 255 });
    setPixel(buf, W, H, bx, by, { ...c1, a: 255 });
  }

  return {
    floor: { pixels: buf, width: W, height: H },
    horizon: { pixels: hDig.pixels, width: HW, height: HH },
    lightMap,
  };
}

// ============================================================================
// RESTRAINED ENVIRONMENTAL MOTION + NATURAL MARA OCCLUSION RENDERER (480x270!)
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

/**
 * Blits a swaying foliage sprite with row-wise natural organic wind bending:
 *   - 'canopy': top attached to overhead branches (0 sway), lower hanging vines & leaves sway gently!
 *   - 'fern' / 'bush': bottom roots anchored to soil (0 sway), upper fronds & leaf tips rustle gently!
 *   - 'none' / 'chime': rigid crisp blit!
 */
function blitWithNaturalSway(
  dest: Uint8ClampedArray, dw: number, dh: number,
  spr: RgbaImage, dx: number, dy: number,
  prop: V72PropInstance, timeSec: number,
  occRecorder?: { mScreenX: number; mScreenY: number; maraFrame: Uint8ClampedArray; fw: number; fh: number; occMask: Uint8Array }
): void {
  const kind = prop.swayKind ?? 'none';
  const amp = prop.swayAmp ?? 0;
  const speed = prop.swaySpeed ?? 0.8;
  const phase = prop.swayPhase ?? 0;

  // Travelling organic wind gust wave across the forest so adjacent plants NEVER move in lockstep!
  const gust = 0.68 + 0.32 * Math.sin(timeSec * 0.55 - prop.x * 0.011);
  const baseWave = Math.sin(timeSec * speed + phase) * amp * gust;

  for (let sy = 0; sy < spr.height; sy++) {
    const outY = dy + sy;
    if (outY < 0 || outY >= dh) continue;

    let rowShift = 0;
    if (kind === 'fern' || kind === 'bush') {
      // Anchored firmly at roots (sy = height-1 -> 0); graceful bend toward frond tips (sy = 0)!
      const t = 1 - sy / Math.max(1, spr.height - 1);
      const frondFlutter = Math.sin(timeSec * (speed * 2.1) + phase + sy * 0.14) * 0.35 * amp;
      rowShift = Math.round((baseWave + frondFlutter) * t * t);
    } else if (kind === 'canopy') {
      // Anchored at upper bough (sy = 0 -> 0); gentle lazy drift on lower hanging moss & leaf clouds!
      const t = sy / Math.max(1, spr.height - 1);
      const leafRustle = Math.sin(timeSec * (speed * 1.9) + phase + sy * 0.09) * 0.30 * amp;
      rowShift = Math.round((baseWave + leafRustle) * (0.25 + 0.75 * t));
    }

    for (let sx = 0; sx < spr.width; sx++) {
      const si = (sy * spr.width + sx) * 4;
      if (spr.pixels[si + 3] < 128) continue;
      const outX = dx + sx + rowShift;
      if (outX < 0 || outX >= dw) continue;
      const di = (outY * dw + outX) * 4;
      dest[di] = spr.pixels[si];
      dest[di + 1] = spr.pixels[si + 1];
      dest[di + 2] = spr.pixels[si + 2];
      dest[di + 3] = 255;

      if (occRecorder) {
        const mx = outX - occRecorder.mScreenX;
        const my = outY - occRecorder.mScreenY;
        if (mx >= 0 && mx < occRecorder.fw && my >= 0 && my < occRecorder.fh) {
          if (occRecorder.maraFrame[(my * occRecorder.fw + mx) * 4 + 3] > 128) {
            occRecorder.occMask[outY * dw + outX] = 1;
          }
        }
      }
    }
  }
}

export function renderV72ForestFrame(opts: {
  world: V72ForestWorldDef;
  floor: RgbaImage;
  horizon: RgbaImage;
  lightMap: Float32Array;
  sprites: Record<string, RgbaImage>;
  maraSprites: MaraV7SpriteSet;
  maraX: number;
  maraY: number;
  maraDir: MaraDirV7;
  maraStep: number;
  camX: number;
  camY: number;
  /** Continuous elapsed time in seconds driving restrained environmental motion! */
  timeSec?: number;
}): { pixels: Uint8ClampedArray; occludedPixels: number } {
  const { world, floor, horizon, lightMap, sprites, maraSprites, maraX, maraY, maraDir, maraStep } = opts;
  const timeSec = opts.timeSec ?? 0;
  const icamX = Math.round(Math.max(0, Math.min(world.worldW - V72_VIEW_W, opts.camX)));
  const icamY = Math.round(Math.max(0, Math.min(world.worldH - V72_VIEW_H, opts.camY)));
  const out = createEmptyBuffer(V72_VIEW_W, V72_VIEW_H);

  // PLANE 0: Distant Morning Sky & Colossal Monolith Horizon (0.22x Parallax)
  const hScrollX = Math.round((icamX * 0.22) % Math.max(1, horizon.width - V72_VIEW_W));
  for (let y = 0; y < Math.min(horizon.height, V72_VIEW_H); y++) {
    for (let x = 0; x < V72_VIEW_W; x++) {
      const sx = (hScrollX + x) % horizon.width;
      const si = (y * horizon.width + sx) * 4;
      const di = (y * V72_VIEW_W + x) * 4;
      out[di] = horizon.pixels[si];
      out[di + 1] = horizon.pixels[si + 1];
      out[di + 2] = horizon.pixels[si + 2];
      out[di + 3] = 255;
    }
  }

  // PLANE 1A: Continuous Handcrafted Forest Floor
  for (let y = 0; y < V72_VIEW_H; y++) {
    const sy = icamY + y;
    if (sy < 0 || sy >= floor.height) continue;
    for (let x = 0; x < V72_VIEW_W; x++) {
      const sx = icamX + x;
      if (sx < 0 || sx >= floor.width) continue;
      const si = (sy * floor.width + sx) * 4;
      if (floor.pixels[si + 3] < 128) continue;
      const di = (y * V72_VIEW_W + x) * 4;
      out[di] = floor.pixels[si];
      out[di + 1] = floor.pixels[si + 1];
      out[di + 2] = floor.pixels[si + 2];
      out[di + 3] = 255;
    }
  }

  // ENVIRONMENTAL LIFE 1: Subtle Shifting Dappled Canopy Light Pools on Forest Floor!
  const warmDapple = hexToRgb('#e3f062');
  const dappleSpots: Array<[number, number, number, number, number]> = [
    [258, 256, 22, 9, 0.3], [274, 282, 18, 7, 1.8],
    [682, 266, 20, 8, 0.9], [728, 256, 15, 6, 2.7],
    [1182, 246, 32, 12, 1.1], [1234, 264, 28, 11, 3.2], [1166, 278, 24, 9, 4.4],
  ];
  for (const [dx0, dy0, rx, ry, ph] of dappleSpots) {
    const cx = Math.round(dx0 + Math.sin(timeSec * 0.72 + ph) * 3.2 - icamX);
    const cy = Math.round(dy0 + Math.cos(timeSec * 0.58 + ph * 1.3) * 1.4 - icamY);
    const pulse = 0.5 + 0.5 * Math.sin(timeSec * 0.88 + ph);
    const alpha = Math.round(16 + pulse * 18);
    if (cx + rx < 0 || cx - rx >= V72_VIEW_W) continue;
    for (let y = Math.max(0, cy - ry); y <= Math.min(V72_VIEW_H - 1, cy + ry); y++) {
      for (let x = Math.max(0, cx - rx); x <= Math.min(V72_VIEW_W - 1, cx + rx); x++) {
        const d = ((x - cx) * (x - cx)) / (rx * rx) + ((y - cy) * (y - cy)) / (ry * ry);
        if (d > 1.0) continue;
        const bg = getPixel(out, V72_VIEW_W, V72_VIEW_H, x, y);
        // Only dapple mossy ground (skip blue puddles)
        if (bg.b > bg.g + 12) continue;
        blendRgbPx(out, V72_VIEW_W, V72_VIEW_H, x, y, warmDapple, Math.round((1 - d) * alpha));
      }
    }
  }

  // ENVIRONMENTAL LIFE 2: Gentle Expanding Dew-Drop Water Ripples & Sky Glints in Puddles!
  const glintCol = hexToRgb('#f4fffc');
  const rippleCol = hexToRgb('#dcf9ff');
  for (const pud of world.puddles) {
    const pcx = Math.round(pud.x - icamX);
    const pcy = Math.round(pud.y - icamY);
    if (pcx + pud.rx < -8 || pcx - pud.rx > V72_VIEW_W + 8) continue;

    // Intermittent expanding dew-drop ripple ring (strictly inside puddle water pixels!)
    const cycle = ((timeSec / pud.ripplePeriod) + pud.ripplePhase) % 1;
    if (cycle < 0.55) {
      const u = cycle / 0.55;
      const rRx = 2 + u * Math.min(14, pud.rx * 0.42);
      const rRy = 1 + u * Math.min(5, pud.ry * 0.42);
      const dropX = pcx + Math.round(Math.sin(pud.seed) * pud.rx * 0.28);
      const dropY = pcy + Math.round(Math.cos(pud.seed) * pud.ry * 0.22);
      const ringAlpha = Math.round((1 - u) * 185);
      const steps = 28;
      for (let s = 0; s < steps; s++) {
        const ang = (s / steps) * Math.PI * 2;
        const rxp = Math.round(dropX + Math.cos(ang) * rRx);
        const ryp = Math.round(dropY + Math.sin(ang) * rRy);
        if (rxp < 0 || rxp >= V72_VIEW_W || ryp < 0 || ryp >= V72_VIEW_H) continue;
        const bg = getPixel(out, V72_VIEW_W, V72_VIEW_H, rxp, ryp);
        if (bg.b > bg.g + 10) {
          blendRgbPx(out, V72_VIEW_W, V72_VIEW_H, rxp, ryp, rippleCol, ringAlpha);
        }
      }
    }

    // Subtle puddle foot-step ripple if Mara stands inside puddle!
    if (Math.hypot((maraX - pud.x) / pud.rx, (maraY - pud.y) / pud.ry) < 0.92) {
      const mU = (timeSec * 1.4) % 1;
      const mRx = 3 + mU * 9;
      const mRy = 1.5 + mU * 3.5;
      const mA = Math.round((1 - mU) * 195);
      for (let s = 0; s < 20; s++) {
        const ang = (s / 20) * Math.PI * 2;
        const rxp = Math.round(maraX - icamX + Math.cos(ang) * mRx);
        const ryp = Math.round(maraY - icamY - 1 + Math.sin(ang) * mRy);
        if (rxp >= 0 && rxp < V72_VIEW_W && ryp >= 0 && ryp < V72_VIEW_H) {
          const bg = getPixel(out, V72_VIEW_W, V72_VIEW_H, rxp, ryp);
          if (bg.b > bg.g + 10) blendRgbPx(out, V72_VIEW_W, V72_VIEW_H, rxp, ryp, glintCol, mA);
        }
      }
    }
  }
  // Subtle twinkling morning sky glints on water surfaces
  for (let i = 0; i < 22; i++) {
    const wx = 180 + hash2v4(i, 19, 431) * 1160;
    const wy = 248 + hash2v4(i, 37, 439) * 58;
    const sx = Math.round(wx - icamX);
    const sy = Math.round(wy - icamY);
    if (sx < 1 || sx >= V72_VIEW_W - 2 || sy < 1 || sy >= V72_VIEW_H - 1) continue;
    const bg = getPixel(out, V72_VIEW_W, V72_VIEW_H, sx, sy);
    if (bg.b > bg.g + 16 && Math.sin(timeSec * 2.1 + i * 1.7) > 0.48) {
      blendRgbPx(out, V72_VIEW_W, V72_VIEW_H, sx, sy, glintCol, 200);
      blendRgbPx(out, V72_VIEW_W, V72_VIEW_H, sx + 1, sy, glintCol, 125);
    }
  }

  // PLANE 1B: Continuous Lush Layered Distant Treeline Foliage Ridge
  for (const p of world.props) {
    if (p.layer !== 'treeline') continue;
    const spr = sprites[p.spriteKey];
    const dx = Math.round(p.x - icamX - spr.width / 2);
    const dy = Math.round(p.y - icamY - spr.height);
    if (dx + spr.width < -10 || dx > V72_VIEW_W + 10) continue;
    blitV4(out, V72_VIEW_W, V72_VIEW_H, spr.pixels, spr.width, spr.height, dx, dy);
  }

  // PLANE 2: Rear Atmospheric Cool-Teal Perimeter Forest Wall
  const shCol = hexToRgb('#09241d');
  const bgProps = world.props.filter((p) => p.layer === 'bg_titan').sort((a, b) => a.y - b.y);
  for (const p of bgProps) {
    const spr = sprites[p.spriteKey];
    if (p.shadowRx && p.shadowRy) {
      drawGroundShadow(out, V72_VIEW_W, V72_VIEW_H, p.x - icamX, p.y - icamY - 3, p.shadowRx, p.shadowRy, shCol, 120);
    }
    const dx = Math.round(p.x - icamX - spr.width / 2);
    const dy = Math.round(p.y - icamY - spr.height);
    if (dx + spr.width < -8 || dx > V72_VIEW_W + 8) continue;
    blitWithNaturalSway(out, V72_VIEW_W, V72_VIEW_H, spr, dx, dy, p, timeSec);
  }

  // PLANE 3: TRUE Y-SORTED COLOSSAL ARCHITECTURE + TUCKED FERNS + CHIME-REED OUTCROP + MARA!
  const ysortProps = world.props.filter((p) => p.layer === 'ysort');
  for (const p of ysortProps) {
    if (p.shadowRx && p.shadowRy) {
      drawGroundShadow(out, V72_VIEW_W, V72_VIEW_H, p.x - icamX, p.y - icamY - 3, p.shadowRx, p.shadowRy, shCol, 142);
    }
  }
  drawGroundShadow(out, V72_VIEW_W, V72_VIEW_H, maraX - icamX, maraY - icamY - 1, 9, 3.5, shCol, 148);

  interface SortEntry { sortY: number; kind: 'prop' | 'mara'; prop?: V72PropInstance }
  const queue: SortEntry[] = ysortProps.map((prop) => ({ sortY: prop.y, kind: 'prop', prop }));
  queue.push({ sortY: maraY, kind: 'mara' });
  queue.sort((a, b) => a.sortY - b.sortY);

  // Subtle physical light integration on Mara: gently cooler in deep Zone B canopy shade, warmer in sunlit clearing!
  const baseMaraFrame = maraSprites.frames[maraDir][maraStep % 4];
  const mLightIdx = Math.max(0, Math.min(world.worldH - 1, Math.round(maraY))) * world.worldW +
    Math.max(0, Math.min(world.worldW - 1, Math.round(maraX)));
  const localLight = lightMap[mLightIdx] ?? 0.55;
  const maraFrame = new Uint8ClampedArray(baseMaraFrame);
  if (localLight < 0.42) {
    // Subtle physical canopy shade integration (~10% cool pine shade!)
    const shadeAmt = Math.min(0.13, (0.42 - localLight) * 0.32);
    for (let i = 0; i < maraFrame.length; i += 4) {
      if (maraFrame[i + 3] < 128) continue;
      maraFrame[i] = Math.round(maraFrame[i] * (1 - shadeAmt * 1.15));
      maraFrame[i + 1] = Math.round(maraFrame[i + 1] * (1 - shadeAmt * 0.72));
      maraFrame[i + 2] = Math.round(maraFrame[i + 2] * (1 - shadeAmt * 0.35));
    }
  } else if (localLight > 0.74) {
    // Subtle sunlit warmth in Zone C clearing (~5% morning sun kiss on top highlights!)
    for (let i = 0; i < maraFrame.length; i += 4) {
      if (maraFrame[i + 3] < 128) continue;
      maraFrame[i] = Math.min(255, Math.round(maraFrame[i] * 1.05));
      maraFrame[i + 1] = Math.min(255, Math.round(maraFrame[i + 1] * 1.04));
    }
  }

  const mScreenX = Math.round(maraX - icamX - maraSprites.frameW / 2);
  const mScreenY = Math.round(maraY - icamY - (maraSprites.frameH - 3));
  let maraDrawn = false;
  const occMask = new Uint8Array(V72_VIEW_W * V72_VIEW_H);
  const occRec = { mScreenX, mScreenY, maraFrame, fw: maraSprites.frameW, fh: maraSprites.frameH, occMask };

  for (const item of queue) {
    if (item.kind === 'mara') {
      blitV4(out, V72_VIEW_W, V72_VIEW_H, maraFrame, maraSprites.frameW, maraSprites.frameH, mScreenX, mScreenY);
      maraDrawn = true;
    } else if (item.prop) {
      const spr = sprites[item.prop.spriteKey];
      const dx = Math.round(item.prop.x - icamX - spr.width / 2);
      const dy = Math.round(item.prop.y - icamY - spr.height);
      if (dx + spr.width < -12 || dx > V72_VIEW_W + 12) continue;
      blitWithNaturalSway(out, V72_VIEW_W, V72_VIEW_H, spr, dx, dy, item.prop, timeSec, maraDrawn ? occRec : undefined);
    }
  }

  // ENVIRONMENTAL LIFE 3: Restrained Falling Cinnamon Leaves, Quiet Acoustic Chime Spores & Sunlit Pollen!
  const leafC1 = hexToRgb('#c9783c');
  const leafC2 = hexToRgb('#e8a05a');
  const goldMote = hexToRgb('#ffe573');
  const cyanSpore = hexToRgb('#94f5ee');

  // Occasional unhurried falling cinnamon leaves tumbling gently through air (ONLY 12 across whole 1440px world!)
  for (let i = 0; i < 12; i++) {
    const startX = 60 + hash2v4(i, 17, 1423) * (world.worldW - 120);
    const period = 6.5 + hash2v4(i, 31, 1433) * 4.5;
    const t = ((timeSec / period) + hash2v4(i, 47, 1447)) % 1;
    const wx = startX + Math.sin(t * Math.PI * 3.5 + i) * 14 + t * 18;
    const wy = 42 + t * 238;
    const sx = Math.round(wx - icamX);
    const sy = Math.round(wy - icamY);
    if (sx < 1 || sx >= V72_VIEW_W - 2 || sy < 1 || sy >= V72_VIEW_H - 2) continue;
    const flip = Math.sin(timeSec * 3.4 + i * 2.1) > 0;
    const c = flip ? leafC2 : leafC1;
    setPixel(out, V72_VIEW_W, V72_VIEW_H, sx, sy, { ...c, a: 255 });
    setPixel(out, V72_VIEW_W, V72_VIEW_H, sx + (flip ? 1 : -1), sy + 1, { ...leafC1, a: 255 });
  }

  // Quiet rising cyan acoustic spores near Zone C Chime-Reed Outcrop & mossy hollows + sunlit pollen motes
  for (let i = 0; i < 24; i++) {
    const isChimeSpore = i < 6;
    const bx = isChimeSpore
      ? 1244 + (hash2v4(i, 11, 1511) - 0.5) * 24
      : 40 + hash2v4(i, 41, 757) * (world.worldW - 80);
    const by0 = isChimeSpore
      ? 206 + (hash2v4(i, 23, 1523) - 0.5) * 10
      : 92 + hash2v4(i, 61, 761) * 190;
    const period = isChimeSpore ? 3.8 : 5.4 + hash2v4(i, 53, 1543) * 3.0;
    const drift = ((timeSec / period) + hash2v4(i, 79, 769)) % 1;
    const fade = Math.sin(drift * Math.PI);
    const sx = Math.round(bx + Math.sin(timeSec * 1.4 + i * 1.5) * (isChimeSpore ? 4 : 6) - icamX);
    const sy = Math.round(by0 - drift * (isChimeSpore ? 26 : 16) - icamY);
    if (sx >= 0 && sx < V72_VIEW_W && sy >= 0 && sy < V72_VIEW_H) {
      const col = isChimeSpore || i % 4 === 0 ? cyanSpore : goldMote;
      blendRgbPx(out, V72_VIEW_W, V72_VIEW_H, sx, sy, col, Math.round(fade * (isChimeSpore ? 215 : 175)));
    }
  }

  // PLANE 4 & 5: OVERHANGING HIGH CANOPY BOUGHS + FOREGROUND CAMERA FRAMING (anchored exact parallax + sway!)
  for (const layerName of ['overhang', 'foreground'] as const) {
    for (const p of world.props) {
      if (p.layer !== layerName) continue;
      const spr = sprites[p.spriteKey];
      const pf = p.parallax ?? (layerName === 'foreground' ? 1.15 : 1.05);
      const anchor = p.anchorCamX ?? 0;
      const dx = Math.round(p.x - icamX - (icamX - anchor) * (pf - 1));
      const dy = Math.round(p.y - icamY);
      if (dx + spr.width < -16 || dx > V72_VIEW_W + 16) continue;
      blitWithNaturalSway(out, V72_VIEW_W, V72_VIEW_H, spr, dx, dy, p, timeSec, occRec);
    }
  }

  // REFINED V7.2 PLAYER READABILITY: Natural Ordered-Dither Foliage Peek (ZERO neon cyan glow!)
  // Shows Mara's actual warm rust-orange suit & ivory helmet cleanly glimpsed through leaves/timber!
  let occludedPixels = 0;
  for (let i = 0; i < occMask.length; i++) occludedPixels += occMask[i];
  if (occludedPixels >= 18) {
    const warmRimHint = hexToRgb('#edf2f7');
    for (let my = 0; my < maraSprites.frameH; my++) {
      const sy = mScreenY + my;
      if (sy < 1 || sy >= V72_VIEW_H - 1) continue;
      for (let mx = 0; mx < maraSprites.frameW; mx++) {
        const sx = mScreenX + mx;
        if (sx < 1 || sx >= V72_VIEW_W - 1) continue;
        if (!occMask[sy * V72_VIEW_W + sx]) continue;
        const mi = (my * maraSprites.frameW + mx) * 4;
        const mR = maraFrame[mi], mG = maraFrame[mi + 1], mB = maraFrame[mi + 2];

        // Natural 2x2 ordered leaf-gap dither showing Mara's REAL colors (readable even against cinnamon bark — zero sci-fi glow!)
        const bayerSlot = ((sx & 1) << 1) | (sy & 1);
        if (bayerSlot === 0 || bayerSlot === 3) {
          blendRgbPx(out, V72_VIEW_W, V72_VIEW_H, sx, sy, { r: mR, g: mG, b: mB }, 160);
        } else {
          blendRgbPx(out, V72_VIEW_W, V72_VIEW_H, sx, sy, { r: mR, g: mG, b: mB }, 72);
        }
        // Subtle warm ivory top-helmet glint ONLY on helmet pixels when deeply occluded
        if (my < 14 && mR > 180 && mG > 160 && bayerSlot === 0) {
          blendRgbPx(out, V72_VIEW_W, V72_VIEW_H, sx, sy, warmRimHint, 86);
        }
      }
    }
  }

  return { pixels: out, occludedPixels };
}
