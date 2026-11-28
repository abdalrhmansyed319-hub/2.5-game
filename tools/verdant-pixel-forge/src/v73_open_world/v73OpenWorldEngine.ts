/**
 * VERDANT SIGNAL — V7.3 CONTINUOUS OPEN-WORLD FOREST ENGINE & COLLISION SYSTEM
 * ==============================================================================
 * Pass 2 Masterpiece Polish:
 *   - Seamless organic trunk-to-canopy junctions (crowns drape 45-60px over trunk tops -> ZERO seam!)
 *   - Rich painterly 2304x1536 continuous forest floor with worn woodland trails, leaf-litter root beds,
 *     mossy pebbles, wild clover specks, lichen patches, and multi-layered dapple shade
 *   - 8 unmistakable composition categories (A-H) with zero nearby duplicate silhouettes
 *   - Pixel-tight multi-polygon physical colliders matching exact trunk/root/rock/log contact bases
 *   - Unmodified 88x88 supplied player character atlas + natural 2x2 ordered-dither foliage peek
 */

import { createEmptyBuffer, setPixel } from '../engine/pixelBuffer';
import { blitV4 } from '../v4_masterpiece/v4Core';
import { type RGB, hexToRgb } from '../v5_soul/v5PixelEngine';
import { type RgbaImage } from '../v7_immersive/v7WorldEngine';
import { V72_FOREST_MASTER_PALETTE } from '../v72_forest/v72ForestEngine';

export const V73_VIEW_W = 640;
export const V73_VIEW_H = 360;
export const V73_WORLD_W = 2304;
export const V73_WORLD_H = 1536;

// Camera clamps strictly inside the 2304x1536 continuous woodland (240px+ forest buffer on ALL 4 edges!)
export const V73_CAM_MIN_X = 240;
export const V73_CAM_MAX_X = V73_WORLD_W - V73_VIEW_W - 240; // 1424
export const V73_CAM_MIN_Y = 200;
export const V73_CAM_MAX_Y = V73_WORLD_H - V73_VIEW_H - 200; // 976

// Walkable perimeter nestled organically inside the continuous deep-forest ring
export const V73_WALK_MIN_X = 330;
export const V73_WALK_MAX_X = 1974;
export const V73_WALK_MIN_Y = 290;
export const V73_WALK_MAX_Y = 1236;

// Supplied player character frame spec (VERBATIM UNMODIFIED 88x88 from user Drive ZIP)
export const V73_CHAR_FRAME_W = 88;
export const V73_CHAR_FRAME_H = 88;
export const V73_CHAR_FOOT_X = 44;
export const V73_CHAR_FOOT_Y = 75;
export const V73_CHAR_COL_RX = 11;
export const V73_CHAR_COL_RY = 6;
export const V73_WALK_SPEED = 84;
export const V73_RUN_SPEED = 128;

export const V73_MASTER_PALETTE = V72_FOREST_MASTER_PALETTE;

export type V73CardinalDir = 'south' | 'north' | 'east' | 'west';
export type V73AnimState = 'idle' | 'walking' | 'running';

export type V73ColliderRole =
  | 'solid_trunk'
  | 'solid_root'
  | 'solid_rock'
  | 'solid_log'
  | 'solid_thicket'
  | 'slow_thicket'
  | 'walkable_arch';

export interface Vec2 {
  x: number;
  y: number;
}

export interface V73LocalCollider {
  suffix: string;
  role: V73ColliderRole;
  points: Vec2[];
}

export interface V73WorldCollider {
  id: string;
  propId: string;
  role: V73ColliderRole;
  points: Vec2[];
}

export type V73PropLayer = 'ysort' | 'overhead_arch' | 'canopy' | 'perimeter_canopy';

export interface V73PropPlacement {
  id: string;
  spriteKey: string;
  layer: V73PropLayer;
  x: number;
  y: number;
  sortOffsetY?: number;
  isColossalTrunk?: boolean;
  swayKind?: 'none' | 'fern' | 'canopy' | 'chime';
  swayAmp?: number;
  swaySpeed?: number;
  swayPhase?: number;
  groundShadowRx?: number;
  groundShadowRy?: number;
  localColliders?: V73LocalCollider[];
}

export interface V73PoolSpec {
  id: string;
  x: number;
  y: number;
  rx: number;
  ry: number;
  ripplePeriod: number;
  ripplePhase: number;
}

export interface V73ClearingSpec {
  id: string;
  x: number;
  y: number;
  rx: number;
  ry: number;
  intensity: number;
}

export interface V73OpenWorldDef {
  worldW: number;
  worldH: number;
  viewW: number;
  viewH: number;
  camBounds: { minX: number; maxX: number; minY: number; maxY: number };
  walkBounds: { minX: number; maxX: number; minY: number; maxY: number };
  pools: V73PoolSpec[];
  clearings: V73ClearingSpec[];
  props: V73PropPlacement[];
  colliders: V73WorldCollider[];
  presets: Record<string, { label: string; playerX: number; playerY: number; dir: V73CardinalDir }>;
}

export function isSolidCollider(role: V73ColliderRole): boolean {
  return (
    role === 'solid_trunk' ||
    role === 'solid_root' ||
    role === 'solid_rock' ||
    role === 'solid_log' ||
    role === 'solid_thicket'
  );
}

// ============================================================================
// PIXEL-TIGHT MULTI-SHAPE PHYSICAL COLLIDER TEMPLATES (HUGGING EXACT BASES!)
// ============================================================================

function hexPoly(rx: number, ry: number, ox = 0, oy = 0): Vec2[] {
  return [
    { x: Math.round(ox - rx * 0.65), y: Math.round(oy - ry) },
    { x: Math.round(ox + rx * 0.65), y: Math.round(oy - ry) },
    { x: Math.round(ox + rx), y: Math.round(oy) },
    { x: Math.round(ox + rx * 0.65), y: Math.round(oy + ry) },
    { x: Math.round(ox - rx * 0.65), y: Math.round(oy + ry) },
    { x: Math.round(ox - rx), y: Math.round(oy) },
  ];
}

function titanMultiColliders(coreRx: number, coreRy: number, leftSpur = true, rightSpur = true): V73LocalCollider[] {
  const cols: V73LocalCollider[] = [
    { suffix: 'trunk_core', role: 'solid_trunk', points: hexPoly(coreRx, coreRy, 0, -24) },
  ];
  if (leftSpur) {
    cols.push({
      suffix: 'root_l',
      role: 'solid_root',
      points: [
        { x: -coreRx - 24, y: -14 },
        { x: -coreRx + 4, y: -26 },
        { x: -coreRx + 10, y: -16 },
        { x: -coreRx - 18, y: -6 },
      ],
    });
  }
  if (rightSpur) {
    cols.push({
      suffix: 'root_r',
      role: 'solid_root',
      points: [
        { x: coreRx - 8, y: -25 },
        { x: coreRx + 24, y: -14 },
        { x: coreRx + 18, y: -5 },
        { x: coreRx - 10, y: -15 },
      ],
    });
  }
  return cols;
}

function fullTreeColliders(rx: number, ry: number, oy = -26): V73LocalCollider[] {
  return [{ suffix: 'trunk_core', role: 'solid_trunk', points: hexPoly(rx, ry, 0, oy) }];
}

function rootArchColliders(): V73LocalCollider[] {
  // Two solid structural root legs on far left/right; wide walkable center passage underneath!
  return [
    {
      suffix: 'arch_leg_l',
      role: 'solid_root',
      points: [
        { x: -90, y: -16 },
        { x: -58, y: -38 },
        { x: -46, y: -24 },
        { x: -64, y: -10 },
      ],
    },
    {
      suffix: 'arch_leg_r',
      role: 'solid_root',
      points: [
        { x: 46, y: -34 },
        { x: 84, y: -22 },
        { x: 94, y: -10 },
        { x: 64, y: -10 },
      ],
    },
    {
      suffix: 'arch_passage',
      role: 'walkable_arch',
      points: [
        { x: -42, y: -34 },
        { x: 42, y: -34 },
        { x: 42, y: -8 },
        { x: -42, y: -8 },
      ],
    },
  ];
}

function fallenLogColliders(): V73LocalCollider[] {
  return [
    {
      suffix: 'log_rootball',
      role: 'solid_log',
      points: [
        { x: -106, y: -34 },
        { x: -64, y: -46 },
        { x: -50, y: -24 },
        { x: -72, y: -12 },
        { x: -106, y: -20 },
      ],
    },
    {
      suffix: 'log_barrel',
      role: 'solid_log',
      points: [
        { x: -54, y: -42 },
        { x: 44, y: -40 },
        { x: 66, y: -22 },
        { x: 34, y: -12 },
        { x: -52, y: -16 },
      ],
    },
  ];
}

function mossyRockColliders(scale = 1.0): V73LocalCollider[] {
  const s = (v: number) => Math.round(v * scale);
  return [
    {
      suffix: 'rock_base',
      role: 'solid_rock',
      points: [
        { x: s(-56), y: s(-26) },
        { x: s(-28), y: s(-42) },
        { x: s(28), y: s(-40) },
        { x: s(58), y: s(-24) },
        { x: s(44), y: s(-10) },
        { x: s(-44), y: s(-10) },
      ],
    },
  ];
}

function waystoneColliders(): V73LocalCollider[] {
  return [{ suffix: 'waystone_base', role: 'solid_rock', points: hexPoly(30, 13, 0, -18) }];
}

function chimeOutcropColliders(): V73LocalCollider[] {
  return [{ suffix: 'chime_rock', role: 'solid_rock', points: hexPoly(42, 16, 0, -20) }];
}

function slowBushColliders(): V73LocalCollider[] {
  return [{ suffix: 'slow_foliage', role: 'slow_thicket', points: hexPoly(34, 15, 0, -16) }];
}

function solidThicketColliders(rx = 52, ry = 22): V73LocalCollider[] {
  return [{ suffix: 'dense_thicket', role: 'solid_thicket', points: hexPoly(rx, ry, 0, -18) }];
}

// ============================================================================
// WORLD COMPOSITION — ALL 8 CATEGORIES (A-H) + ZERO SEAM CANOPY CROWNS
// ============================================================================

export function getV73OpenWorldDef(): V73OpenWorldDef {
  const pools: V73PoolSpec[] = [
    { id: 'pool_clear_w', x: 1584, y: 866, rx: 56, ry: 22, ripplePeriod: 4.1, ripplePhase: 0.2 },
    { id: 'pool_clear_e', x: 1732, y: 896, rx: 46, ry: 18, ripplePeriod: 5.3, ripplePhase: 0.65 },
    { id: 'pool_basin_a', x: 1144, y: 1038, rx: 64, ry: 24, ripplePeriod: 4.6, ripplePhase: 0.1 },
    { id: 'pool_basin_b', x: 1272, y: 1084, rx: 44, ry: 18, ripplePeriod: 3.9, ripplePhase: 0.52 },
    { id: 'pool_hub_w', x: 1004, y: 764, rx: 32, ry: 13, ripplePeriod: 5.0, ripplePhase: 0.8 },
    { id: 'pool_arch_w', x: 966, y: 492, rx: 34, ry: 14, ripplePeriod: 4.4, ripplePhase: 0.35 },
  ];

  const clearings: V73ClearingSpec[] = [
    { id: 'clearing_east_main', x: 1648, y: 812, rx: 224, ry: 154, intensity: 1.0 },
    { id: 'clearing_waystone', x: 1696, y: 472, rx: 148, ry: 104, intensity: 0.78 },
    { id: 'clearing_hub_dapple', x: 1068, y: 792, rx: 142, ry: 102, intensity: 0.42 },
    { id: 'clearing_root_hollow', x: 1118, y: 470, rx: 136, ry: 90, intensity: 0.48 },
    { id: 'clearing_wet_basin', x: 1196, y: 1044, rx: 152, ry: 98, intensity: 0.58 },
    { id: 'clearing_west_log', x: 648, y: 944, rx: 146, ry: 104, intensity: 0.44 },
  ];

  const props: V73PropPlacement[] = [];

  // Helper: Colossal Ancient Titan ALWAYS paired with seamless overhead canopy draping 52px OVER trunk top!
  const addCappedTitan = (
    id: string,
    trunkKey: string,
    crownKey: 'crown_dome_a' | 'crown_wide_b' | 'crown_wide_b_flip',
    x: number,
    y: number,
    coreRx: number,
    coreRy: number,
    phase: number,
    crownOffsetY = -246,
    crownLayer: 'canopy' | 'perimeter_canopy' = 'canopy'
  ) => {
    props.push({
      id,
      spriteKey: trunkKey,
      layer: 'ysort',
      x,
      y,
      isColossalTrunk: true,
      groundShadowRx: coreRx + 36,
      groundShadowRy: coreRy + 16,
      localColliders: titanMultiColliders(coreRx, coreRy),
    });
    props.push({
      id: `${id}_crown`,
      spriteKey: crownKey,
      layer: crownLayer,
      x: x + (phase > 3 ? 6 : -6),
      y: y + crownOffsetY,
      swayKind: 'canopy',
      swayAmp: 1.15,
      swaySpeed: 0.62 + (phase % 0.3),
      swayPhase: phase,
    });
  };

  // ==========================================================================
  // B. MEDIUM-DENSITY CENTRAL WOODLAND HUB (360-deg Multi-Route Exploration)
  // ==========================================================================
  addCappedTitan('hub_center_titan', 'titan_moss_pillar', 'crown_dome_a', 1094, 808, 42, 18, 1.1, -244);

  props.push(
    {
      id: 'hub_nw_tree',
      spriteKey: 'full_tree_rock',
      layer: 'ysort',
      x: 842,
      y: 664,
      groundShadowRx: 68,
      groundShadowRy: 24,
      localColliders: fullTreeColliders(38, 16, -24),
    },
    {
      id: 'hub_east_redwood',
      spriteKey: 'full_tree_redwood',
      layer: 'ysort',
      x: 1326,
      y: 668,
      groundShadowRx: 60,
      groundShadowRy: 22,
      localColliders: fullTreeColliders(34, 15, -26),
    },
    {
      id: 'hub_se_redwood',
      spriteKey: 'full_tree_redwood_flip',
      layer: 'ysort',
      x: 1372,
      y: 942,
      groundShadowRx: 60,
      groundShadowRy: 22,
      localColliders: fullTreeColliders(34, 15, -26),
    },
    {
      id: 'hub_sw_tree',
      spriteKey: 'full_tree_rock_flip',
      layer: 'ysort',
      x: 866,
      y: 1004,
      groundShadowRx: 68,
      groundShadowRy: 24,
      localColliders: fullTreeColliders(38, 16, -24),
    },
    {
      id: 'hub_slow_bush_1',
      spriteKey: 'bush_mid',
      layer: 'ysort',
      x: 974,
      y: 882,
      swayKind: 'fern',
      swayAmp: 1.0,
      swaySpeed: 0.9,
      swayPhase: 0.4,
      groundShadowRx: 44,
      groundShadowRy: 15,
      localColliders: slowBushColliders(),
    },
    {
      id: 'hub_slow_bush_2',
      spriteKey: 'bush_mid_dark',
      layer: 'ysort',
      x: 1266,
      y: 786,
      swayKind: 'fern',
      swayAmp: 1.1,
      swaySpeed: 0.84,
      swayPhase: 2.3,
      groundShadowRx: 46,
      groundShadowRy: 16,
      localColliders: slowBushColliders(),
    },
    {
      id: 'hub_small_rock_1',
      spriteKey: 'mossy_boulder_small',
      layer: 'ysort',
      x: 862,
      y: 742,
      groundShadowRx: 38,
      groundShadowRy: 14,
      localColliders: mossyRockColliders(0.64),
    },
    {
      id: 'hub_small_rock_2',
      spriteKey: 'mossy_boulder_small_flip',
      layer: 'ysort',
      x: 1244,
      y: 886,
      groundShadowRx: 38,
      groundShadowRy: 14,
      localColliders: mossyRockColliders(0.64),
    }
  );

  // ==========================================================================
  // A. DENSE ANCIENT FOREST CLUSTER (Northwest Deep-Canopy Cathedral)
  // ==========================================================================
  addCappedTitan('nw_titan_1', 'titan_buttress', 'crown_wide_b', 494, 488, 46, 20, 0.3, -246);
  addCappedTitan('nw_titan_2', 'titan_gnarled', 'crown_dome_a', 724, 492, 42, 18, 2.2, -242);
  addCappedTitan('nw_titan_3', 'full_tree_broad_base', 'crown_wide_b_flip', 474, 718, 46, 19, 4.1, -182);

  props.push(
    {
      id: 'nw_redwood_mid',
      spriteKey: 'full_tree_redwood',
      layer: 'ysort',
      x: 686,
      y: 742,
      groundShadowRx: 60,
      groundShadowRy: 22,
      localColliders: fullTreeColliders(34, 15, -26),
    },
    {
      id: 'nw_slow_bush_1',
      spriteKey: 'bush_mid_dark',
      layer: 'ysort',
      x: 594,
      y: 572,
      swayKind: 'fern',
      swayAmp: 1.0,
      swaySpeed: 0.8,
      swayPhase: 1.6,
      groundShadowRx: 44,
      groundShadowRy: 15,
      localColliders: slowBushColliders(),
    },
    {
      id: 'nw_arch_west',
      spriteKey: 'root_arch_flip',
      layer: 'overhead_arch',
      x: 596,
      y: 676,
      sortOffsetY: -6,
      groundShadowRx: 68,
      groundShadowRy: 16,
      localColliders: rootArchColliders(),
    },
    {
      id: 'nw_extra_crown_shade',
      spriteKey: 'crown_dome_a',
      layer: 'canopy',
      x: 592,
      y: 356,
      swayKind: 'canopy',
      swayAmp: 1.2,
      swaySpeed: 0.58,
      swayPhase: 3.1,
    }
  );

  // ==========================================================================
  // D. ROOT-DOMINATED HOLLOW (North — Iconic Singular Walkable Root Arch!)
  // ==========================================================================
  props.push(
    {
      id: 'arch_north_focal',
      spriteKey: 'root_arch',
      layer: 'overhead_arch',
      x: 1118,
      y: 472,
      sortOffsetY: -6,
      groundShadowRx: 72,
      groundShadowRy: 17,
      localColliders: rootArchColliders(),
    },
    {
      id: 'arch_boulder_w',
      spriteKey: 'mossy_boulder_small',
      layer: 'ysort',
      x: 924,
      y: 448,
      groundShadowRx: 38,
      groundShadowRy: 14,
      localColliders: mossyRockColliders(0.64),
    },
    {
      id: 'arch_boulder_e',
      spriteKey: 'mossy_boulder_small_flip',
      layer: 'ysort',
      x: 1246,
      y: 398,
      groundShadowRx: 38,
      groundShadowRy: 14,
      localColliders: mossyRockColliders(0.64),
    },
    {
      id: 'arch_redwood_w',
      spriteKey: 'full_tree_redwood_flip',
      layer: 'ysort',
      x: 926,
      y: 386,
      groundShadowRx: 60,
      groundShadowRy: 22,
      localColliders: fullTreeColliders(34, 15, -26),
    }
  );

  // ==========================================================================
  // H. DISTINCT LANDMARK GLADE (Northeast Ancient Acoustic Waystone)
  // ==========================================================================
  props.push(
    {
      id: 'ne_waystone',
      spriteKey: 'waystone_landmark',
      layer: 'ysort',
      x: 1694,
      y: 486,
      groundShadowRx: 46,
      groundShadowRy: 16,
      localColliders: waystoneColliders(),
    },
    {
      id: 'ne_tree_w',
      spriteKey: 'full_tree_rock_flip',
      layer: 'ysort',
      x: 1484,
      y: 504,
      groundShadowRx: 66,
      groundShadowRy: 24,
      localColliders: fullTreeColliders(36, 16, -24),
    },
    {
      id: 'ne_rock_accent',
      spriteKey: 'mossy_boulder_small',
      layer: 'ysort',
      x: 1582,
      y: 544,
      groundShadowRx: 38,
      groundShadowRy: 14,
      localColliders: mossyRockColliders(0.64),
    }
  );
  addCappedTitan('ne_titan_e', 'titan_gnarled_flip', 'crown_dome_a', 1938, 496, 42, 18, 5.1, -242);

  // ==========================================================================
  // C. BROAD SUNLIT CLEARING (East — Unobstructed Chime-Reed Outcrop & Pools!)
  // ==========================================================================
  props.push(
    {
      id: 'clear_chime_outcrop',
      spriteKey: 'clearing_chime_outcrop',
      layer: 'ysort',
      x: 1704,
      y: 786,
      swayKind: 'chime',
      swayAmp: 0.9,
      swaySpeed: 1.0,
      swayPhase: 0.7,
      groundShadowRx: 54,
      groundShadowRy: 18,
      localColliders: chimeOutcropColliders(),
    },
    {
      id: 'clear_rock_n',
      spriteKey: 'mossy_boulder_small_flip',
      layer: 'ysort',
      x: 1536,
      y: 706,
      groundShadowRx: 38,
      groundShadowRy: 14,
      localColliders: mossyRockColliders(0.64),
    },
    {
      id: 'clear_se_tree',
      spriteKey: 'full_tree_rock',
      layer: 'ysort',
      x: 1554,
      y: 1094,
      groundShadowRx: 66,
      groundShadowRy: 24,
      localColliders: fullTreeColliders(38, 16, -24),
    },
    {
      id: 'clear_ne_tree',
      spriteKey: 'full_tree_redwood',
      layer: 'ysort',
      x: 1852,
      y: 668,
      groundShadowRx: 60,
      groundShadowRy: 22,
      localColliders: fullTreeColliders(34, 15, -26),
    }
  );
  addCappedTitan('clear_east_arch', 'titan_split_arch', 'crown_wide_b', 1966, 964, 48, 20, 2.7, -238);
  addCappedTitan('clear_south_titan', 'titan_straight', 'crown_dome_a', 1806, 1146, 42, 18, 4.4, -244);

  // ==========================================================================
  // F. WET FOREST FLOOR & SHALLOW POOLS (South Basin)
  // ==========================================================================
  addCappedTitan('south_titan_e', 'titan_buttress', 'crown_wide_b_flip', 1384, 1154, 46, 20, 1.8, -244);
  props.push(
    {
      id: 'south_bush_slow',
      spriteKey: 'bush_mid',
      layer: 'ysort',
      x: 1054,
      y: 1126,
      swayKind: 'fern',
      swayAmp: 1.0,
      swaySpeed: 0.88,
      swayPhase: 3.8,
      groundShadowRx: 44,
      groundShadowRy: 15,
      localColliders: slowBushColliders(),
    },
    {
      id: 'south_rock_pool',
      spriteKey: 'mossy_boulder_small',
      layer: 'ysort',
      x: 1218,
      y: 982,
      groundShadowRx: 38,
      groundShadowRy: 14,
      localColliders: mossyRockColliders(0.64),
    }
  );

  // ==========================================================================
  // E. MOSSY ROCK FORMATIONS RIDGE (Southwest — Varied Scales & Flips!)
  // ==========================================================================
  props.push(
    {
      id: 'rock_sw_1',
      spriteKey: 'mossy_boulder_cluster',
      layer: 'ysort',
      x: 562,
      y: 1094,
      groundShadowRx: 64,
      groundShadowRy: 22,
      localColliders: mossyRockColliders(1.0),
    },
    {
      id: 'rock_sw_2',
      spriteKey: 'mossy_boulder_small_flip',
      layer: 'ysort',
      x: 742,
      y: 1152,
      groundShadowRx: 42,
      groundShadowRy: 15,
      localColliders: mossyRockColliders(0.64),
    },
    {
      id: 'rock_sw_3',
      spriteKey: 'mossy_boulder_cluster_flip',
      layer: 'ysort',
      x: 904,
      y: 1184,
      groundShadowRx: 64,
      groundShadowRy: 22,
      localColliders: mossyRockColliders(1.0),
    }
  );
  addCappedTitan('sw_titan_guard', 'titan_gnarled', 'crown_dome_a', 442, 1138, 42, 18, 0.9, -242);

  // ==========================================================================
  // G. FALLEN-TREE ENVIRONMENT (West — Dramatic Hollow Mossy Tunnel Log!)
  // ==========================================================================
  props.push({
    id: 'west_fallen_log',
    spriteKey: 'fallen_hollow_log',
    layer: 'ysort',
    x: 616,
    y: 896,
    groundShadowRx: 98,
    groundShadowRy: 22,
    localColliders: fallenLogColliders(),
  });

  // ==========================================================================
  // WALKABLE DECORATIVE FERNS & WOODLAND GROUND FLORA (ZERO BLOCKING!)
  // ==========================================================================
  const fernPlacements: Array<[number, number, string, number]> = [
    [1044, 796, 'fern_cluster', 0.2],
    [1168, 766, 'fern_cluster_small', 1.4],
    [934, 728, 'fern_cluster_flip', 2.8],
    [1202, 858, 'fern_cluster_small_flip', 0.9],
    [1046, 514, 'fern_cluster', 2.1],
    [1194, 496, 'fern_cluster_flip', 3.4],
    [1036, 408, 'fern_cluster_small', 4.1],
    [1604, 756, 'fern_cluster_small', 1.9],
    [1762, 828, 'fern_cluster_flip', 4.6],
    [1642, 916, 'fern_cluster_small_flip', 2.5],
    [1526, 868, 'fern_cluster', 5.1],
    [1632, 464, 'fern_cluster_small', 0.7],
    [1768, 522, 'fern_cluster_flip', 3.2],
    [1112, 1086, 'fern_cluster_flip', 0.6],
    [1236, 1034, 'fern_cluster', 3.8],
    [1318, 1126, 'fern_cluster_small', 1.7],
    [682, 912, 'fern_cluster', 5.2],
    [514, 946, 'fern_cluster_small_flip', 2.9],
    [648, 1076, 'fern_cluster_flip', 1.2],
    [794, 1094, 'fern_cluster_small', 4.4],
    [544, 622, 'fern_cluster_small', 2.3],
    [744, 578, 'fern_cluster_flip', 0.4],
    [822, 912, 'fern_cluster_small_flip', 3.6],
    [1446, 756, 'fern_cluster', 1.1],
    [1478, 926, 'fern_cluster_small', 4.8],
    [966, 988, 'fern_cluster_flip', 2.0],
    [1862, 796, 'fern_cluster_small_flip', 3.3],
    [1832, 542, 'fern_cluster', 0.8],
    [418, 866, 'fern_cluster_flip', 4.0],
    [1078, 1192, 'fern_cluster_small', 1.5],
  ];
  fernPlacements.forEach(([x, y, key, ph], idx) => {
    props.push({
      id: `fern_walk_${idx}`,
      spriteKey: key,
      layer: 'ysort',
      x,
      y,
      swayKind: 'fern',
      swayAmp: 1.2,
      swaySpeed: 0.86 + (idx % 5) * 0.08,
      swayPhase: ph,
      groundShadowRx: 26,
      groundShadowRy: 9,
    });
  });

  // ==========================================================================
  // CONTINUOUS ORGANIC 4-EDGE PERIMETER FOREST RING (ZERO CUT EDGES!)
  // ==========================================================================
  const crownCycle: Array<'crown_dome_a' | 'crown_wide_b' | 'crown_wide_b_flip'> = [
    'crown_dome_a',
    'crown_wide_b',
    'crown_wide_b_flip',
  ];

  // 1) NORTH PERIMETER (y = 224..284 — safely north of interior arches/trees!)
  const northTrunks: Array<[number, number, string]> = [
    [244, 276, 'titan_straight'],
    [456, 258, 'titan_buttress'],
    [664, 268, 'titan_moss_pillar'],
    [868, 252, 'titan_gnarled'],
    [1066, 246, 'titan_straight'],
    [1272, 256, 'titan_moss_pillar'],
    [1478, 248, 'titan_buttress'],
    [1686, 262, 'titan_gnarled_flip'],
    [1892, 254, 'titan_split_arch'],
    [2092, 274, 'titan_straight'],
  ];
  northTrunks.forEach(([x, y, tk], i) => {
    addCappedTitan(`perim_n_tr${i}`, tk, crownCycle[i % 3], x, y, 48, 20, i * 0.7, -238, 'perimeter_canopy');
  });
  for (let i = 0; i < 12; i++) {
    const x = 138 + i * 184 + ((i * 23) % 28) - 14;
    props.push({
      id: `perim_n_roof_${i}`,
      spriteKey: crownCycle[(i + 1) % 3],
      layer: 'perimeter_canopy',
      x,
      y: 178 + (i % 3) * 18,
      swayKind: 'canopy',
      swayAmp: 1.0,
      swaySpeed: 0.62,
      swayPhase: i * 0.9,
    });
  }

  // 2) SOUTH PERIMETER (Organic depth-staggered giant trees, canopies, boulders & thickets!)
  const southFullTrees: Array<[number, number, string]> = [
    [346, 1344, 'full_tree_rock'],
    [618, 1358, 'full_tree_redwood_flip'],
    [942, 1364, 'full_tree_rock_flip'],
    [1288, 1352, 'full_tree_redwood'],
    [1624, 1368, 'full_tree_rock'],
    [1948, 1350, 'full_tree_redwood_flip'],
  ];
  southFullTrees.forEach(([x, y, tk], i) => {
    props.push({
      id: `perim_s_tree_${i}`,
      spriteKey: tk,
      layer: 'ysort',
      x,
      y,
      groundShadowRx: 72,
      groundShadowRy: 26,
      localColliders: fullTreeColliders(42, 18, -26),
    });
  });
  for (let i = 0; i < 10; i++) {
    const x = 220 + i * 204 + ((i * 41) % 36) - 18;
    const y = 1316 + (i % 3) * 24;
    props.push({
      id: `perim_s_bush_${i}`,
      spriteKey: i % 2 === 0 ? 'bush_fg_huge' : 'bush_fg_small_flip',
      layer: 'ysort',
      x,
      y,
      swayKind: 'fern',
      swayAmp: 0.9,
      swaySpeed: 0.72 + (i % 3) * 0.08,
      swayPhase: i * 1.1,
      groundShadowRx: 70,
      groundShadowRy: 22,
      localColliders: solidThicketColliders(58, 22),
    });
    props.push({
      id: `perim_s_canopy_${i}`,
      spriteKey: crownCycle[(i + 2) % 3],
      layer: 'perimeter_canopy',
      x: x + 44,
      y: 1388 + (i % 2) * 18,
      swayKind: 'canopy',
      swayAmp: 1.0,
      swaySpeed: 0.58,
      swayPhase: i * 0.6,
    });
  }

  // 3) WEST PERIMETER (x = 186..288)
  const westTrunks: Array<[number, number, string]> = [
    [224, 492, 'titan_gnarled'],
    [256, 696, 'titan_moss_pillar'],
    [214, 902, 'titan_buttress'],
    [262, 1112, 'titan_straight'],
    [218, 1298, 'titan_split_arch'],
  ];
  westTrunks.forEach(([x, y, tk], i) => {
    addCappedTitan(`perim_w_tr${i}`, tk, crownCycle[i % 3], x, y, 48, 20, i * 1.3, -240, 'perimeter_canopy');
  });
  for (let i = 0; i < 6; i++) {
    props.push({
      id: `perim_w_bush_${i}`,
      spriteKey: i % 2 === 0 ? 'bush_fg_huge' : 'bush_mid_dark',
      layer: 'ysort',
      x: 244 + (i % 2) * 38,
      y: 382 + i * 168,
      groundShadowRx: 56,
      groundShadowRy: 19,
      localColliders: solidThicketColliders(44, 18),
    });
  }

  // 4) EAST PERIMETER (x = 2016..2112)
  const eastTrunks: Array<[number, number, string]> = [
    [2066, 466, 'titan_buttress'],
    [2044, 678, 'titan_straight'],
    [2086, 886, 'titan_gnarled_flip'],
    [2052, 1094, 'titan_moss_pillar'],
    [2078, 1296, 'titan_buttress'],
  ];
  eastTrunks.forEach(([x, y, tk], i) => {
    addCappedTitan(`perim_e_tr${i}`, tk, crownCycle[(i + 1) % 3], x, y, 48, 20, i * 1.1, -240, 'perimeter_canopy');
  });
  for (let i = 0; i < 6; i++) {
    props.push({
      id: `perim_e_bush_${i}`,
      spriteKey: i % 2 === 0 ? 'bush_fg_small_flip' : 'bush_mid_dark',
      layer: 'ysort',
      x: 2028 + (i % 2) * 32,
      y: 382 + i * 168,
      groundShadowRx: 54,
      groundShadowRy: 18,
      localColliders: solidThicketColliders(42, 18),
    });
  }

  const colliders: V73WorldCollider[] = [];
  for (const p of props) {
    if (!p.localColliders) continue;
    for (const lc of p.localColliders) {
      colliders.push({
        id: `${p.id}_${lc.suffix}`,
        propId: p.id,
        role: lc.role,
        points: lc.points.map((pt) => ({ x: p.x + pt.x, y: p.y + pt.y })),
      });
    }
  }

  return {
    worldW: V73_WORLD_W,
    worldH: V73_WORLD_H,
    viewW: V73_VIEW_W,
    viewH: V73_VIEW_H,
    camBounds: { minX: V73_CAM_MIN_X, maxX: V73_CAM_MAX_X, minY: V73_CAM_MIN_Y, maxY: V73_CAM_MAX_Y },
    walkBounds: { minX: V73_WALK_MIN_X, maxX: V73_WALK_MAX_X, minY: V73_WALK_MIN_Y, maxY: V73_WALK_MAX_Y },
    pools,
    clearings,
    props,
    colliders,
    presets: {
      hub_center: { label: 'Central Woodland Hub', playerX: 1024, playerY: 822, dir: 'east' },
      dense_nw: { label: 'Dense Ancient Grove (NW)', playerX: 586, playerY: 582, dir: 'north' },
      root_arch: { label: 'Exposed Root Arch Hollow (N)', playerX: 1118, playerY: 454, dir: 'north' },
      waystone_ne: { label: 'Ancient Waystone Glade (NE)', playerX: 1656, playerY: 518, dir: 'north' },
      clearing_e: { label: 'Broad Sunlit Clearing (E)', playerX: 1618, playerY: 824, dir: 'east' },
      wet_pools_s: { label: 'Wet Basin & Pools (S)', playerX: 1146, playerY: 1044, dir: 'east' },
      mossy_rocks_sw: { label: 'Mossy Rock Formations (SW)', playerX: 654, playerY: 1116, dir: 'west' },
      fallen_log_w: { label: 'Fallen Hollow Log (W)', playerX: 632, playerY: 944, dir: 'west' },
    },
  };
}

// ============================================================================
// CONVEX POLYGON COLLISION SOLVER
// ============================================================================

function pointInConvexPoly(px: number, py: number, pts: Vec2[]): boolean {
  let sign = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const cross = (b.x - a.x) * (py - a.y) - (b.y - a.y) * (px - a.x);
    if (Math.abs(cross) < 1e-6) continue;
    const s = cross > 0 ? 1 : -1;
    if (sign === 0) sign = s;
    else if (sign !== s) return false;
  }
  return true;
}

function distPointToSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const l2 = dx * dx + dy * dy;
  if (l2 < 1e-6) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

export function ellipseIntersectsPoly(cx: number, cy: number, rx: number, ry: number, pts: Vec2[]): boolean {
  const sy = rx / ry;
  const scy = cy * sy;
  const sPts = pts.map((p) => ({ x: p.x, y: p.y * sy }));
  if (pointInConvexPoly(cx, scy, sPts)) return true;
  for (let i = 0; i < sPts.length; i++) {
    const a = sPts[i];
    const b = sPts[(i + 1) % sPts.length];
    if (distPointToSeg(cx, scy, a.x, a.y, b.x, b.y) < rx) return true;
  }
  return false;
}

export interface V73MoveResult {
  x: number;
  y: number;
  blocked: boolean;
  speedMul: number;
  inSlowThicket: boolean;
  inPool: boolean;
  underArch: boolean;
}

export function isPointBlocked(world: V73OpenWorldDef, x: number, y: number): boolean {
  if (x < world.walkBounds.minX || x > world.walkBounds.maxX || y < world.walkBounds.minY || y > world.walkBounds.maxY) {
    return true;
  }
  for (const c of world.colliders) {
    if (!isSolidCollider(c.role)) continue;
    if (ellipseIntersectsPoly(x, y, V73_CHAR_COL_RX, V73_CHAR_COL_RY, c.points)) return true;
  }
  return false;
}

export function evaluateV73Movement(
  world: V73OpenWorldDef,
  curX: number,
  curY: number,
  dx: number,
  dy: number
): V73MoveResult {
  let inSlowThicket = false;
  let underArch = false;
  for (const c of world.colliders) {
    if (c.role === 'slow_thicket' && ellipseIntersectsPoly(curX, curY, V73_CHAR_COL_RX, V73_CHAR_COL_RY, c.points)) {
      inSlowThicket = true;
    } else if (c.role === 'walkable_arch' && ellipseIntersectsPoly(curX, curY, V73_CHAR_COL_RX, V73_CHAR_COL_RY, c.points)) {
      underArch = true;
    }
  }
  let inPool = false;
  for (const p of world.pools) {
    if (Math.hypot((curX - p.x) / p.rx, (curY - p.y) / p.ry) < 0.92) {
      inPool = true;
      break;
    }
  }
  const speedMul = inSlowThicket ? 0.78 : inPool ? 0.9 : 1.0;
  const sdx = dx * speedMul;
  const sdy = dy * speedMul;

  let nx = curX;
  let ny = curY;
  if (!isPointBlocked(world, curX + sdx, curY + sdy)) {
    nx = curX + sdx;
    ny = curY + sdy;
  } else {
    if (Math.abs(sdx) > 1e-4 && !isPointBlocked(world, curX + sdx, curY)) nx = curX + sdx;
    if (Math.abs(sdy) > 1e-4 && !isPointBlocked(world, nx, curY + sdy)) ny = curY + sdy;
  }
  const moved = Math.hypot(nx - curX, ny - curY);
  const wanted = Math.hypot(sdx, sdy);
  return { x: nx, y: ny, blocked: wanted > 0.05 && moved < wanted * 0.12, speedMul, inSlowThicket, inPool, underArch };
}

// ============================================================================
// RICH PAINTERLY CONTINUOUS 2304x1536 FOREST FLOOR (TRAILS + LEAF LITTER + MOSS!)
// ============================================================================

function hash2d(ix: number, iy: number): number {
  let n = Math.imul(ix, 374761393) + Math.imul(iy, 668265263);
  n = (n ^ (n >>> 13)) * 1274126177;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function smoothNoise(x: number, y: number, cell: number): number {
  const fx = x / cell;
  const fy = y / cell;
  const ix = Math.floor(fx);
  const iy = Math.floor(fy);
  const tx = fx - ix;
  const ty = fy - iy;
  const ux = tx * tx * (3 - 2 * tx);
  const uy = ty * ty * (3 - 2 * ty);
  const a = hash2d(ix, iy);
  const b = hash2d(ix + 1, iy);
  const c = hash2d(ix, iy + 1);
  const d = hash2d(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x: number, y: number): number {
  return (
    smoothNoise(x, y, 160) * 0.45 +
    smoothNoise(x + 313, y - 197, 68) * 0.30 +
    smoothNoise(x - 127, y + 419, 26) * 0.17 +
    smoothNoise(x + 71, y + 83, 10) * 0.08
  );
}

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// Organic curving woodland trail segments linking all 8 zones subtly (never straight corridors!)
const WOODLAND_TRAIL_SEGS: Array<[number, number, number, number]> = [
  [1024, 836, 1118, 634], // Hub -> North Hollow
  [1118, 634, 1118, 456], // Through Exposed Root Arch
  [1118, 456, 1420, 444], // North Arch -> Waystone Glade
  [1420, 444, 1666, 514], // Into Waystone Glade
  [1666, 514, 1624, 774], // Waystone -> Sunlit Clearing
  [1046, 846, 1344, 822], // Hub -> Sunlit Clearing
  [1344, 822, 1606, 818], // Clearing entrance
  [1046, 846, 1138, 1018], // Hub -> Wet Basin Pools
  [1138, 1018, 868, 1094], // Wet Basin -> Mossy Rocks
  [868, 1094, 646, 1018], // Mossy Rocks -> Fallen Log
  [646, 1018, 628, 766],  // Fallen Log -> NW Grove
  [628, 766, 984, 818],   // NW Grove -> Hub
];

export function buildV73ContinuousForestFloor(world: V73OpenWorldDef): {
  floor: RgbaImage;
  lightMap: Float32Array;
} {
  const W = world.worldW;
  const H = world.worldH;
  const pixels = createEmptyBuffer(W, H);
  const lightMap = new Float32Array(W * H);

  const floorBand = [
    hexToRgb('#09241d'), // 0 deep ancient canopy shade
    hexToRgb('#0d3b2c'), // 1 deep forest moss
    hexToRgb('#155939'), // 2 shadowed woodland moss
    hexToRgb('#247d43'), // 3 rich emerald moss
    hexToRgb('#3ca34b'), // 4 mid vibrant moss
    hexToRgb('#67c752'), // 5 sunlit meadow moss
    hexToRgb('#a6df5f'), // 6 bright sunlit fern/moss
    hexToRgb('#d7ef72'), // 7 golden sun-glade peak
  ];
  const loamDark = hexToRgb('#3a2618');
  const loamMid = hexToRgb('#593b22');
  const leafAmber = hexToRgb('#94592c');
  const leafCopper = hexToRgb('#c27d3b');
  const pebbleGrey = hexToRgb('#4f6b70');
  const pebbleLit = hexToRgb('#8ba8ab');
  const flowerGold = hexToRgb('#ffe573');
  const flowerViolet = hexToRgb('#c8a2ff');

  const waterDeep = hexToRgb('#1a4a5e');
  const waterMid = hexToRgb('#2c7894');
  const waterSky = hexToRgb('#60b7d1');
  const waterHi = hexToRgb('#9ee0ee');
  const mudRim = hexToRgb('#283b28');

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const n = fbm(x, y);
      const micro = smoothNoise(x, y, 7);
      const fine = hash2d(x, y);
      const bayer = (BAYER4[y & 3][x & 3] + 0.5) / 16 - 0.5;

      // Ambient canopy illumination across all 8 composition zones
      let light = 0.25 + n * 0.24;
      const dNW = Math.hypot((x - 560) / 360, (y - 540) / 290);
      if (dNW < 1.1) light -= (1.1 - dNW) * 0.16;

      for (const cl of world.clearings) {
        const wn = (n - 0.5) * 0.34;
        const d = Math.hypot((x - cl.x) / cl.rx, (y - cl.y) / cl.ry) + wn;
        if (d < 1.15) {
          const s = Math.max(0, 1 - d / 1.15);
          light += s * s * 0.54 * cl.intensity;
        }
      }

      // Soft darkened border shade around continuous outer perimeter forest ring
      const edgeDist = Math.min(x, W - 1 - x, y, H - 1 - y);
      if (edgeDist < 290) light -= (1 - edgeDist / 290) * 0.24;

      light = Math.max(0.04, Math.min(0.99, light));
      lightMap[y * W + x] = light;

      // Subtle organic worn mossy woodland foot-trail (broken up with fbm noise so it feels 100% natural!)
      let trailDist = 999;
      for (let s = 0; s < WOODLAND_TRAIL_SEGS.length; s++) {
        const seg = WOODLAND_TRAIL_SEGS[s];
        const d = distPointToSeg(x, y, seg[0], seg[1], seg[2], seg[3]);
        if (d < trailDist) trailDist = d;
      }
      const warpedTrail = trailDist + (n - 0.5) * 28 + (micro - 0.5) * 10;

      let col: RGB;
      const idxF = light * (floorBand.length - 1) + bayer * 0.92;
      const idx = Math.max(0, Math.min(floorBand.length - 1, Math.round(idxF)));
      col = floorBand[idx];

      // Worn mossy loam trail texture (organic patchy earth + stepping pebbles — never artificial lines!)
      if (warpedTrail < 26 && light > 0.22) {
        const tWeight = Math.max(0, 1 - warpedTrail / 26);
        if (tWeight + bayer * 0.35 > 0.58) {
          col = micro > 0.54 ? loamMid : loamDark;
          if (fine > 0.965) col = pebbleGrey;
          else if (fine > 0.945 && light > 0.55) col = pebbleLit;
          else if (fine < 0.045) col = leafAmber;
        }
      } else {
        // Painterly grass tufts, clover specks, fallen autumn leaf litter & wildflowers!
        const tuft = smoothNoise(x * 1.4 + 41, y * 1.8 - 19, 14);
        if (tuft > 0.77 && idx < floorBand.length - 1 && ((x + y) & 1) === 0) {
          col = floorBand[Math.min(floorBand.length - 1, idx + 1)];
        } else if (tuft < 0.22 && idx > 0 && ((x ^ y) & 1) === 0) {
          col = floorBand[Math.max(0, idx - 1)];
        }
        // Organic fallen autumn leaves scattered naturally in woodland pockets
        if (n > 0.56 && micro > 0.72 && fine > 0.915) {
          col = light > 0.58 ? leafCopper : leafAmber;
        }
        // Subtle sunlit wildflower & moss-blossom dots in clearings and glades!
        if (light > 0.62 && fine > 0.9945) {
          col = (x & 3) === 0 ? flowerViolet : flowerGold;
        }
      }

      // Reflective forest rainwater pools (with mossy damp rim + sky reflection!)
      for (const p of world.pools) {
        const pd = Math.hypot((x - p.x) / p.rx, (y - p.y) / p.ry) + (micro - 0.5) * 0.22;
        if (pd < 1.12) {
          if (pd > 0.94) {
            col = mudRim;
          } else if (pd > 0.78) {
            col = waterDeep;
          } else {
            const refl = smoothNoise(x * 0.8, y * 1.5, 18) + bayer * 0.16;
            col = refl > 0.7 ? waterHi : refl > 0.44 ? waterSky : waterMid;
          }
          break;
        }
      }

      setPixel(pixels, W, H, x, y, { ...col, a: 255 });
    }
  }

  // Bake soft organic ground contact shadows & fallen leaf-litter beds around every rooted prop!
  const shadowCol = hexToRgb('#061712');
  for (const p of world.props) {
    if (!p.groundShadowRx || !p.groundShadowRy) continue;
    const rx = p.groundShadowRx;
    const ry = p.groundShadowRy;
    const cy = p.y - 6;
    const x0 = Math.max(0, Math.floor(p.x - rx - 18));
    const x1 = Math.min(W - 1, Math.ceil(p.x + rx + 18));
    const y0 = Math.max(0, Math.floor(cy - ry - 14));
    const y1 = Math.min(H - 1, Math.ceil(cy + ry + 14));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d = Math.hypot((x - p.x) / rx, (y - cy) / ry);
        const bayer = (BAYER4[y & 3][x & 3] + 0.5) / 16;
        if (d < 1.0) {
          const strength = (1 - d * d) * 0.54;
          if (strength > bayer * 0.64) {
            const oi = (y * W + x) * 4;
            pixels[oi] = Math.round(pixels[oi] * (1 - strength) + shadowCol.r * strength);
            pixels[oi + 1] = Math.round(pixels[oi + 1] * (1 - strength) + shadowCol.g * strength);
            pixels[oi + 2] = Math.round(pixels[oi + 2] * (1 - strength) + shadowCol.b * strength);
          }
        } else if (d < 1.38 && rx >= 54) {
          // Organic fallen root-bed leaf litter ring around giant ancient trees!
          const h = hash2d(x, y);
          if (h > 0.885 && smoothNoise(x, y, 12) > 0.45) {
            const lc = h > 0.95 ? leafCopper : h > 0.92 ? leafAmber : loamDark;
            setPixel(pixels, W, H, x, y, { ...lc, a: 255 });
          }
        }
      }
    }
  }

  return { floor: { pixels, width: W, height: H }, lightMap };
}

// ============================================================================
// FRAME COMPOSITOR + COLLISION-DEBUG OVERLAY
// ============================================================================

export interface V73CharacterAtlas {
  frames: Record<V73AnimState, Record<V73CardinalDir, RgbaImage[]>>;
}

export interface V73RenderOpts {
  world: V73OpenWorldDef;
  floor: RgbaImage;
  lightMap: Float32Array;
  sprites: Record<string, RgbaImage>;
  charAtlas: V73CharacterAtlas;
  playerX: number;
  playerY: number;
  playerDir: V73CardinalDir;
  playerAnim: V73AnimState;
  playerFrameIdx: number;
  camX: number;
  camY: number;
  timeSec: number;
  debugCollision?: boolean;
}

const ROLE_DEBUG_RGB: Record<V73ColliderRole, RGB> = {
  solid_trunk: { r: 255, g: 74, b: 74 },
  solid_root: { r: 255, g: 164, b: 56 },
  solid_rock: { r: 76, g: 195, b: 255 },
  solid_log: { r: 255, g: 122, b: 64 },
  solid_thicket: { r: 216, g: 108, b: 255 },
  slow_thicket: { r: 184, g: 255, b: 74 },
  walkable_arch: { r: 56, g: 242, b: 255 },
};

function drawDebugLine(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  col: RGB,
  dashed = false
): void {
  const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= steps; i++) {
    if (dashed && (Math.floor(i / 3) & 1) === 1) continue;
    const x = Math.round(x0 + ((x1 - x0) * i) / steps);
    const y = Math.round(y0 + ((y1 - y0) * i) / steps);
    if (x >= 0 && x < w && y >= 0 && y < h) {
      setPixel(buf, w, h, x, y, { ...col, a: 255 });
    }
  }
}

function drawDebugPolygon(buf: Uint8ClampedArray, w: number, h: number, pts: Vec2[], col: RGB, dashed = false): void {
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (const p of pts) {
    if (p.x < minX) minX = Math.floor(p.x);
    if (p.x > maxX) maxX = Math.ceil(p.x);
    if (p.y < minY) minY = Math.floor(p.y);
    if (p.y > maxY) maxY = Math.ceil(p.y);
  }
  minX = Math.max(0, minX);
  maxX = Math.min(w - 1, maxX);
  minY = Math.max(0, minY);
  maxY = Math.min(h - 1, maxY);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (!pointInConvexPoly(x, y, pts)) continue;
      if (dashed && ((x + y) % 5) !== 0) continue;
      const oi = (y * w + x) * 4;
      const a = dashed ? 0.36 : 0.24;
      buf[oi] = Math.round(buf[oi] * (1 - a) + col.r * a);
      buf[oi + 1] = Math.round(buf[oi + 1] * (1 - a) + col.g * a);
      buf[oi + 2] = Math.round(buf[oi + 2] * (1 - a) + col.b * a);
    }
  }

  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    drawDebugLine(buf, w, h, a.x, a.y, b.x, b.y, col, dashed);
  }
}

function drawDebugEllipse(buf: Uint8ClampedArray, w: number, h: number, cx: number, cy: number, rx: number, ry: number, col: RGB): void {
  const segs = 28;
  for (let i = 0; i < segs; i++) {
    const a0 = (i / segs) * Math.PI * 2;
    const a1 = ((i + 1) / segs) * Math.PI * 2;
    drawDebugLine(
      buf, w, h,
      cx + Math.cos(a0) * rx, cy + Math.sin(a0) * ry,
      cx + Math.cos(a1) * rx, cy + Math.sin(a1) * ry,
      col, false
    );
  }
}

export function renderV73OpenWorldFrame(opts: V73RenderOpts): {
  pixels: Uint8ClampedArray;
  drawnProps: number;
  occludedPixels: number;
} {
  const {
    world, floor, lightMap, sprites, charAtlas,
    playerX, playerY, playerDir, playerAnim, playerFrameIdx,
    timeSec, debugCollision = false,
  } = opts;
  const W = V73_VIEW_W;
  const H = V73_VIEW_H;
  const camX = Math.max(world.camBounds.minX, Math.min(world.camBounds.maxX, Math.round(opts.camX)));
  const camY = Math.max(world.camBounds.minY, Math.min(world.camBounds.maxY, Math.round(opts.camY)));
  const out = createEmptyBuffer(W, H);

  for (let y = 0; y < H; y++) {
    const srcOff = ((camY + y) * floor.width + camX) * 4;
    const dstOff = y * W * 4;
    out.set(floor.pixels.subarray(srcOff, srcOff + W * 4), dstOff);
  }

  const rippleCol = hexToRgb('#dcf9ff');
  for (const p of world.pools) {
    const cyc = ((timeSec / p.ripplePeriod) + p.ripplePhase) % 1;
    if (cyc < 0.56) {
      const u = cyc / 0.56;
      const sx = p.x - camX;
      const sy = p.y - camY;
      const rx = 2 + u * 12;
      const ry = 1 + u * 4.5;
      if (sx + rx >= 0 && sx - rx < W && sy + ry >= 0 && sy - ry < H) {
        drawDebugEllipse(out, W, H, sx, sy, rx, ry, rippleCol);
      }
    }
    if (Math.hypot((playerX - p.x) / p.rx, (playerY - p.y) / p.ry) < 0.92) {
      const fu = (timeSec * 1.45) % 1;
      drawDebugEllipse(out, W, H, playerX - camX, playerY - camY, 4 + fu * 16, 2 + fu * 6, rippleCol);
    }
  }

  type SortItem =
    | { kind: 'prop'; sortY: number; prop: V73PropPlacement }
    | { kind: 'player'; sortY: number };

  const ySortList: SortItem[] = [];
  for (const prop of world.props) {
    if (prop.layer !== 'ysort' && prop.layer !== 'overhead_arch') continue;
    const img = sprites[prop.spriteKey];
    const dx = Math.round(prop.x - camX - img.width / 2);
    const dy = Math.round(prop.y - camY - img.height);
    if (dx + img.width < -16 || dx > W + 16 || dy + img.height < -16 || dy > H + 16) continue;
    ySortList.push({ kind: 'prop', sortY: prop.y + (prop.sortOffsetY ?? 0), prop });
  }
  ySortList.push({ kind: 'player', sortY: playerY });
  ySortList.sort((a, b) => a.sortY - b.sortY);

  const charFrames = charAtlas.frames[playerAnim][playerDir];
  const charSprite = charFrames[Math.abs(playerFrameIdx) % charFrames.length];
  const charDrawX = Math.round(playerX - camX - V73_CHAR_FOOT_X);
  const charDrawY = Math.round(playerY - camY - V73_CHAR_FOOT_Y);

  const playerMask = new Uint8Array(W * H);
  const occluderMask = new Uint8Array(W * H);
  let playerDrawn = false;
  let drawnProps = 0;

  const pLight = lightMap[Math.max(0, Math.min(world.worldH - 1, Math.round(playerY))) * world.worldW + Math.max(0, Math.min(world.worldW - 1, Math.round(playerX)))];
  const shadeMul = pLight < 0.24 ? 0.91 : pLight > 0.68 ? 1.03 : 1.0;

  for (const item of ySortList) {
    if (item.kind === 'player') {
      const psx = Math.round(playerX - camX);
      const psy = Math.round(playerY - camY);
      for (let sy = -4; sy <= 4; sy++) {
        for (let sx = -14; sx <= 14; sx++) {
          if ((sx * sx) / 196 + (sy * sy) / 16 <= 1.0) {
            const bx = psx + sx;
            const by = psy + sy;
            if (bx >= 0 && bx < W && by >= 0 && by < H) {
              const oi = (by * W + bx) * 4;
              out[oi] = Math.round(out[oi] * 0.56);
              out[oi + 1] = Math.round(out[oi + 1] * 0.62);
              out[oi + 2] = Math.round(out[oi + 2] * 0.62);
            }
          }
        }
      }
      for (let sy = 0; sy < charSprite.height; sy++) {
        const dy = charDrawY + sy;
        if (dy < 0 || dy >= H) continue;
        for (let sx = 0; sx < charSprite.width; sx++) {
          const dx = charDrawX + sx;
          if (dx < 0 || dx >= W) continue;
          const si = (sy * charSprite.width + sx) * 4;
          if (charSprite.pixels[si + 3] < 128) continue;
          const oi = (dy * W + dx) * 4;
          out[oi] = Math.min(255, Math.round(charSprite.pixels[si] * shadeMul));
          out[oi + 1] = Math.min(255, Math.round(charSprite.pixels[si + 1] * shadeMul));
          out[oi + 2] = Math.min(255, Math.round(charSprite.pixels[si + 2] * (shadeMul < 1 ? 0.96 : shadeMul)));
          out[oi + 3] = 255;
          playerMask[dy * W + dx] = 1;
        }
      }
      playerDrawn = true;
    } else {
      const prop = item.prop;
      const img = sprites[prop.spriteKey];
      const sway =
        prop.swayKind === 'fern' || prop.swayKind === 'chime'
          ? Math.round(Math.sin(timeSec * (prop.swaySpeed ?? 0.9) + (prop.swayPhase ?? 0)) * (prop.swayAmp ?? 1.0))
          : 0;
      const dx = Math.round(prop.x - camX - img.width / 2) + sway;
      const dy = Math.round(prop.y - camY - img.height);
      blitV4(out, W, H, img.pixels, img.width, img.height, dx, dy);
      drawnProps++;

      if (playerDrawn) {
        const ox0 = Math.max(0, Math.max(dx, charDrawX));
        const ox1 = Math.min(W, Math.min(dx + img.width, charDrawX + charSprite.width));
        const oy0 = Math.max(0, Math.max(dy, charDrawY));
        const oy1 = Math.min(H, Math.min(dy + img.height, charDrawY + charSprite.height));
        for (let y = oy0; y < oy1; y++) {
          for (let x = ox0; x < ox1; x++) {
            const pi = ((y - dy) * img.width + (x - dx)) * 4 + 3;
            if (img.pixels[pi] >= 128) occluderMask[y * W + x] = 1;
          }
        }
      }
    }
  }

  for (const layerName of ['canopy', 'perimeter_canopy'] as V73PropLayer[]) {
    for (const prop of world.props) {
      if (prop.layer !== layerName) continue;
      const img = sprites[prop.spriteKey];
      const sway = Math.round(Math.sin(timeSec * (prop.swaySpeed ?? 0.6) + (prop.swayPhase ?? 0)) * (prop.swayAmp ?? 1.1));
      const dx = Math.round(prop.x - camX - img.width / 2) + sway;
      const dy = Math.round(prop.y - camY - img.height / 2);
      if (dx + img.width < -16 || dx > W + 16 || dy + img.height < -16 || dy > H + 16) continue;
      blitV4(out, W, H, img.pixels, img.width, img.height, dx, dy);
      drawnProps++;

      const ox0 = Math.max(0, Math.max(dx, charDrawX));
      const ox1 = Math.min(W, Math.min(dx + img.width, charDrawX + charSprite.width));
      const oy0 = Math.max(0, Math.max(dy, charDrawY));
      const oy1 = Math.min(H, Math.min(dy + img.height, charDrawY + charSprite.height));
      for (let y = oy0; y < oy1; y++) {
        for (let x = ox0; x < ox1; x++) {
          const pi = ((y - dy) * img.width + (x - dx)) * 4 + 3;
          if (img.pixels[pi] >= 128) occluderMask[y * W + x] = 1;
        }
      }
    }
  }

  let occludedPixels = 0;
  for (let sy = 0; sy < charSprite.height; sy++) {
    const dy = charDrawY + sy;
    if (dy < 0 || dy >= H) continue;
    for (let sx = 0; sx < charSprite.width; sx++) {
      const dx = charDrawX + sx;
      if (dx < 0 || dx >= W) continue;
      const idx = dy * W + dx;
      if (!playerMask[idx] || !occluderMask[idx]) continue;
      occludedPixels++;
      const ditherOn = ((dx & 1) ^ (dy & 1)) === 0;
      const blend = ditherOn ? 0.56 : 0.18;
      const si = (sy * charSprite.width + sx) * 4;
      const oi = idx * 4;
      out[oi] = Math.round(out[oi] * (1 - blend) + charSprite.pixels[si] * blend);
      out[oi + 1] = Math.round(out[oi + 1] * (1 - blend) + charSprite.pixels[si + 1] * blend);
      out[oi + 2] = Math.round(out[oi + 2] * (1 - blend) + charSprite.pixels[si + 2] * blend);
    }
  }

  const leafCol = hexToRgb('#d68445');
  const sporeCol = hexToRgb('#94f5ed');
  for (let i = 0; i < 18; i++) {
    const lx = ((i * 197 + Math.floor(timeSec * (11 + (i % 4) * 3))) % (W + 80)) - 40;
    const ly = ((i * 113 + Math.floor(timeSec * (14 + (i % 3) * 4))) % (H + 60)) - 30;
    if (lx >= 1 && lx < W - 1 && ly >= 1 && ly < H - 1) {
      setPixel(out, W, H, lx, ly, { ...leafCol, a: 255 });
      setPixel(out, W, H, lx + 1, ly, { ...leafCol, a: 255 });
    }
  }
  const landmarks: Vec2[] = [
    { x: 1704, y: 742 },
    { x: 1694, y: 422 },
  ];
  for (const lm of landmarks) {
    for (let i = 0; i < 6; i++) {
      const spX = Math.round(lm.x - camX + Math.sin(timeSec * 1.1 + i * 1.4) * 14);
      const spY = Math.round(lm.y - camY - ((timeSec * 8 + i * 11) % 34));
      if (spX >= 0 && spX < W && spY >= 0 && spY < H) {
        setPixel(out, W, H, spX, spY, { ...sporeCol, a: 255 });
      }
    }
  }

  if (debugCollision) {
    for (const c of world.colliders) {
      const screenPts = c.points.map((pt) => ({ x: pt.x - camX, y: pt.y - camY }));
      const inView = screenPts.some((pt) => pt.x >= -120 && pt.x <= W + 120 && pt.y >= -120 && pt.y <= H + 120);
      if (!inView) continue;
      drawDebugPolygon(out, W, H, screenPts, ROLE_DEBUG_RGB[c.role], !isSolidCollider(c.role));
    }
    drawDebugEllipse(out, W, H, Math.round(playerX - camX), Math.round(playerY - camY), V73_CHAR_COL_RX, V73_CHAR_COL_RY, {
      r: 255, g: 255, b: 255,
    });
  }

  return { pixels: out, drawnProps, occludedPixels };
}
