export interface V90PolygonCollider {
  name: string;
  role: 'solid_hull' | 'solid_cliff' | 'solid_rock' | 'solid_debris' | 'solid_driftwood' | 'solid_tree' | 'deep_water';
  points: Array<[number, number]>; // relative to prop anchor (x, y)
}

export interface V90PropPlacement {
  id: string;
  spriteKey: string;
  x: number; // Global unified world X (0..2304)
  y: number; // Global unified world Y (1344..2880)
  offsetY: number; // Sprite2D.offset.y so feet/base align to (x, y)
  layer: 'ysort' | 'ocean_prop' | 'canopy';
  swayKind?: 0 | 1 | 2;
  swayAmp?: number;
  swayPhase?: number;
  embedKind: 'sand_berm' | 'wet_rock' | 'cliff_base' | 'wreck_trench' | 'dune_plant' | 'tidepool' | 'none';
  colliders?: V90PolygonCollider[];
  waveBreakCollar?: boolean;
}

export interface V90WalkableZone {
  id: string;
  role: 'meridian_interior' | 'tidepool_shallow' | 'coastal_brush_slow' | 'inland_gateway';
  x: number;
  y: number;
  points: Array<[number, number]>;
}

export interface V90LivingCoastalTuft {
  x: number;
  y: number;
  row: number; // 0..7 species row in coastal_grass_tufts_24x24_6x8.png
  phase: number;
  sens: number;
}

export interface V90CoastalFauna {
  kind: 0 | 1; // 0 = Chime-Wing Glider, 1 = Mirror-Shell Crab
  x: number;
  y: number;
  rx: number;
  ry: number;
  speed: number;
  phase: number;
}

export interface V90TidepoolDef {
  id: string;
  x: number;
  y: number;
  rx: number;
  ry: number;
}

export interface V90ScanSite {
  id: string;
  name: string;
  detail: string;
  x: number;
  y: number;
  radius: number;
  interiorOnly?: boolean;
}

export const V90_WORLD_W = 2304;
export const V90_SHORE_ORIGIN_Y = 1344; // Seamless 192px ecotone overlap with V8.0 Forest (0..1536)
export const V90_SHORE_H = 1536; // Covers global y = 1344..2880
export const V90_UNIFIED_WORLD_H = 2880;
export const V90_SPAWN_POS = { x: 748, y: 2288 }; // Zone A — The Waking Shore, looking east toward ICV Meridian!

/**
 * Organic irregular Alien Coastline contour (returns global Y where dry/wet sand meets translucent surf).
 * Sweeps naturally with basalt headland west, sheltered Waking Shore cove, wide Crash Beach,
 * and jagged eastern Tidepool Coast lagoon!
 */
export function getBrokenShoreWaterlineY(x: number): number {
  const nx = x / V90_WORLD_W;
  let y = 2408;
  // Western Basalt Headland juts gently seaward around x=360..580
  y += Math.exp(-Math.pow((x - 420) / 185, 2)) * 56;
  // Sheltered crescent bay at Zone A — The Waking Shore (x=660..960)
  y -= Math.exp(-Math.pow((x - 790) / 190, 2)) * 42;
  // Wide sandy spit at Zone B — Crash Impact Field (x=1140..1460)
  y += Math.exp(-Math.pow((x - 1290) / 230, 2)) * 28;
  // Indented rocky cove at Zone C — Tidepool Coast (x=1660..2020)
  y -= Math.exp(-Math.pow((x - 1835) / 215, 2)) * 84;
  // Organic multi-frequency coastal irregularity (never a straight horizontal line!)
  y += Math.sin(nx * Math.PI * 6.4 + 0.5) * 18;
  y += Math.cos(nx * Math.PI * 13.5 - 0.9) * 10;
  y += Math.sin(nx * Math.PI * 25.0 + 1.4) * 5;
  return Math.round(y);
}

/**
 * Northern boundary where dry golden sand transitions into the Coastal Vegetation Belt (Zone E)
 * and curves northward into Zone F — The Inland Gateway (x=960..1320 -> V8.0 Living Forest!).
 */
export function getCoastalVegBeltY(x: number): number {
  let y = 1978;
  // Deep sandy crash corridor pushes vegetation back around the ICV Meridian wreck!
  y -= Math.exp(-Math.pow((x - 1280) / 290, 2)) * 72;
  // Western Basalt Shore pushes cliffs down toward the beach
  y += Math.exp(-Math.pow((x - 460) / 210, 2)) * 54;
  // Organic dune waves
  y += Math.sin(x * 0.0085 + 0.4) * 26 + Math.cos(x * 0.019 - 0.8) * 14;
  return Math.round(y);
}

export const V90_TIDEPOOLS: V90TidepoolDef[] = [
  { id: 'tp_east_main', x: 1756, y: 2196, rx: 82, ry: 34 },
  { id: 'tp_east_outer', x: 1902, y: 2262, rx: 64, ry: 28 },
  { id: 'tp_east_north', x: 1848, y: 2096, rx: 56, ry: 24 },
  { id: 'tp_wreck_edge', x: 1588, y: 2292, rx: 52, ry: 22 },
  { id: 'tp_west_basalt', x: 562, y: 2298, rx: 58, ry: 24 },
];

export const V90_SCAN_SITES: V90ScanSite[] = [
  {
    id: 'meridian_hull',
    name: 'ICV Meridian Lander Hull',
    detail: 'Solstice Exo-Survey Lander — EM surge hull scorch & breached aft bay',
    x: 1300,
    y: 2168,
    radius: 175,
  },
  {
    id: 'meridian_nav_console',
    name: 'ICV Meridian Nav Console',
    detail: 'Black-box log: Blooming Tide harmonic shorted descent thrusters',
    x: 1336,
    y: 2142,
    radius: 75,
    interiorOnly: true,
  },
  {
    id: 'meridian_supply_locker',
    name: 'Emergency Exo-Survey Locker',
    detail: 'Intact breathable filter cartridges & emergency field beacon cells',
    x: 1272,
    y: 2152,
    radius: 72,
    interiorOnly: true,
  },
  {
    id: 'meridian_specimens',
    name: 'Bio-Containment Canister Rack',
    detail: 'Five sterile Oura-IV field specimen stasis cylinders intact',
    x: 1392,
    y: 2166,
    radius: 76,
    interiorOnly: true,
  },
  {
    id: 'rescue_beacon_shore',
    name: 'Meridian Rescue Beacon Pod',
    detail: 'Cracked orbital transponder emitting weak prime-interval carrier ping',
    x: 944,
    y: 2258,
    radius: 95,
  },
  {
    id: 'detached_thruster',
    name: 'Sheared Retro-Thruster Cowling',
    detail: 'Torn ceramic heat-tiles & fused propulsion manifold from impact skid',
    x: 1054,
    y: 2236,
    radius: 98,
  },
  {
    id: 'tidepool_amber_kelp',
    name: 'Amber Tide-Kelp Colony (fl_01)',
    detail: 'Luminous honey gas-bladders swaying in warm translucent tidepool',
    x: 1762,
    y: 2188,
    radius: 112,
  },
  {
    id: 'mirror_glasswort_cluster',
    name: 'Mirror Glasswort Spire (fl_02)',
    detail: 'Crystalline silica-rich alien coastal succulent glinting in sunlight',
    x: 1848,
    y: 2056,
    radius: 96,
  },
  {
    id: 'basalt_headland_monolith',
    name: 'Stratified Piezo-Basalt Cliff',
    detail: 'Layered coastal basalt vibrating softly with distant ocean swell',
    x: 510,
    y: 1960,
    radius: 118,
  },
  {
    id: 'inland_gateway_threshold',
    name: 'Singing Canopy Inland Gateway',
    detail: 'Sheltered coastal root threshold entering the V8.0 Living Forest',
    x: 1142,
    y: 1470,
    radius: 130,
  },
];

export const V90_WARP_ZONES = [
  { name: 'Zone A: The Waking Shore', x: 748, y: 2288, dir: 2 },
  { name: 'Zone B: ICV Meridian Crash Site', x: 1216, y: 2248, dir: 1 },
  { name: 'Zone B2: Breached Lander Interior', x: 1384, y: 2212, dir: 1 },
  { name: 'Zone C: The Tidepool Coast', x: 1712, y: 2178, dir: 2 },
  { name: 'Zone D: The Basalt Shore', x: 560, y: 2060, dir: 3 },
  { name: 'Zone E: Coastal Vegetation Belt', x: 1168, y: 1760, dir: 1 },
  { name: 'Zone F: Inland Gateway -> Forest', x: 1142, y: 1456, dir: 1 },
  { name: 'V8.0 Living Forest Hub', x: 1024, y: 822, dir: 2 },
];

export function getV90BrokenShoreProps(): V90PropPlacement[] {
  const props: V90PropPlacement[] = [
    // =========================================================================
    // OFFSHORE SEA STACKS & OCEAN REEF FORMATIONS (y = 2470..2740, vast ocean!)
    // =========================================================================
    {
      id: 'sea_stack_sw_far',
      spriteKey: 'basalt_sea_stack',
      x: 472,
      y: 2636,
      offsetY: -58,
      layer: 'ocean_prop',
      embedKind: 'wet_rock',
      waveBreakCollar: true,
    },
    {
      id: 'sea_stack_center_far',
      spriteKey: 'basalt_sea_stack_med',
      x: 984,
      y: 2692,
      offsetY: -44,
      layer: 'ocean_prop',
      embedKind: 'wet_rock',
      waveBreakCollar: true,
    },
    {
      id: 'sea_stack_east_mid',
      spriteKey: 'basalt_sea_stack',
      x: 1624,
      y: 2594,
      offsetY: -58,
      layer: 'ocean_prop',
      embedKind: 'wet_rock',
      waveBreakCollar: true,
    },
    {
      id: 'sea_stack_far_east',
      spriteKey: 'basalt_sea_stack_med_flip',
      x: 1988,
      y: 2536,
      offsetY: -44,
      layer: 'ocean_prop',
      embedKind: 'wet_rock',
      waveBreakCollar: true,
    },
    {
      id: 'reef_boulder_w',
      spriteKey: 'coastal_boulder_sm',
      x: 682,
      y: 2494,
      offsetY: -22,
      layer: 'ocean_prop',
      embedKind: 'wet_rock',
      waveBreakCollar: true,
    },
    {
      id: 'reef_boulder_c',
      spriteKey: 'coastal_boulder_sm_flip',
      x: 1272,
      y: 2536,
      offsetY: -22,
      layer: 'ocean_prop',
      embedKind: 'wet_rock',
      waveBreakCollar: true,
    },
    {
      id: 'reef_boulder_e',
      spriteKey: 'coastal_boulder_cluster',
      x: 1852,
      y: 2418,
      offsetY: -30,
      layer: 'ocean_prop',
      embedKind: 'wet_rock',
      waveBreakCollar: true,
    },

    // =========================================================================
    // ZONE B — THE CRASH IMPACT FIELD (ICV MERIDIAN HERO WRECK + DEBRIS!)
    // =========================================================================
    {
      id: 'icv_meridian_wreck',
      spriteKey: 'meridian_wreck_hull',
      x: 1326,
      y: 2192,
      offsetY: -88,
      layer: 'ysort',
      embedKind: 'wreck_trench',
      // Surgical multi-polygon colliders hugging nose, main hull & twin thrusters,
      // LEAVING THE BREACHED AFT CARGO RAMP AT (+56..+122, -6..+42) COMPLETELY WALKABLE!
      colliders: [
        {
          name: 'Col_meridian_nose',
          role: 'solid_hull',
          points: [
            [-162, -16], [-118, -56], [-48, -62], [-34, -8], [-116, 12], [-156, 4],
          ],
        },
        {
          name: 'Col_meridian_mid_hull',
          role: 'solid_hull',
          points: [
            [-50, -68], [52, -74], [74, -22], [36, 14], [-42, 4],
          ],
        },
        {
          name: 'Col_meridian_thrusters',
          role: 'solid_hull',
          points: [
            [62, -76], [164, -78], [168, -32], [116, -24], [64, -32],
          ],
        },
      ],
    },
    {
      id: 'meridian_debris_cowling_main',
      spriteKey: 'meridian_debris_cowling',
      x: 1054,
      y: 2236,
      offsetY: -24,
      layer: 'ysort',
      embedKind: 'sand_berm',
      colliders: [
        {
          name: 'Col_cowling_main',
          role: 'solid_debris',
          points: [[-42, -22], [34, -24], [48, -4], [24, 12], [-38, 8]],
        },
      ],
    },
    {
      id: 'meridian_cargo_crate_waking',
      spriteKey: 'meridian_cargo_crate',
      x: 882,
      y: 2212,
      offsetY: -22,
      layer: 'ysort',
      embedKind: 'sand_berm',
      colliders: [
        {
          name: 'Col_crate_waking',
          role: 'solid_debris',
          points: [[-24, -14], [22, -14], [26, 4], [-22, 6]],
        },
      ],
    },
    {
      id: 'meridian_rescue_beacon_waking',
      spriteKey: 'meridian_rescue_beacon',
      x: 946,
      y: 2258,
      offsetY: -22,
      layer: 'ysort',
      embedKind: 'sand_berm',
      colliders: [
        {
          name: 'Col_beacon_waking',
          role: 'solid_debris',
          points: [[-14, -10], [14, -10], [16, 4], [-14, 4]],
        },
      ],
    },
    {
      id: 'meridian_cargo_crate_east',
      spriteKey: 'meridian_cargo_crate_flip',
      x: 1528,
      y: 2158,
      offsetY: -22,
      layer: 'ysort',
      embedKind: 'sand_berm',
      colliders: [
        {
          name: 'Col_crate_east',
          role: 'solid_debris',
          points: [[-24, -14], [22, -14], [26, 4], [-22, 6]],
        },
      ],
    },
    {
      id: 'meridian_debris_tidepool',
      spriteKey: 'meridian_debris_cowling_flip',
      x: 1656,
      y: 2248,
      offsetY: -24,
      layer: 'ysort',
      embedKind: 'sand_berm',
      colliders: [
        {
          name: 'Col_cowling_tide',
          role: 'solid_debris',
          points: [[-40, -20], [34, -22], [44, -4], [22, 10], [-36, 8]],
        },
      ],
    },

    // =========================================================================
    // ZONE A — THE WAKING SHORE (Framing Driftwood, Coastal Boulders & Flora)
    // =========================================================================
    {
      id: 'waking_driftwood_west',
      spriteKey: 'coastal_driftwood_log',
      x: 618,
      y: 2234,
      offsetY: -34,
      layer: 'ysort',
      embedKind: 'sand_berm',
      colliders: [
        {
          name: 'Col_drift_waking',
          role: 'solid_driftwood',
          points: [[-54, -18], [48, -22], [58, -4], [40, 10], [-48, 8]],
        },
      ],
    },
    {
      id: 'waking_boulder_shore',
      spriteKey: 'coastal_boulder_sm',
      x: 824,
      y: 2334,
      offsetY: -20,
      layer: 'ysort',
      embedKind: 'wet_rock',
      colliders: [
        {
          name: 'Col_waking_rock',
          role: 'solid_rock',
          points: [[-26, -12], [24, -12], [28, 4], [-24, 6]],
        },
      ],
    },

    // =========================================================================
    // ZONE C — THE TIDEPOOL COAST (Rocks, Amber Kelp, Glasswort & Reef Walls)
    // =========================================================================
    {
      id: 'tidepool_boulder_north',
      spriteKey: 'coastal_boulder_cluster',
      x: 1778,
      y: 2054,
      offsetY: -32,
      layer: 'ysort',
      embedKind: 'wet_rock',
      colliders: [
        {
          name: 'Col_tp_boulder_n',
          role: 'solid_rock',
          points: [[-44, -22], [40, -24], [48, -2], [24, 12], [-40, 10]],
        },
      ],
    },
    {
      id: 'tidepool_boulder_mid',
      spriteKey: 'coastal_boulder_sm_flip',
      x: 1684,
      y: 2132,
      offsetY: -20,
      layer: 'ysort',
      embedKind: 'wet_rock',
      colliders: [
        {
          name: 'Col_tp_boulder_m',
          role: 'solid_rock',
          points: [[-26, -12], [24, -12], [28, 4], [-24, 6]],
        },
      ],
    },
    {
      id: 'tidepool_cliff_east_edge',
      spriteKey: 'basalt_cliff_monolith_flip',
      x: 2024,
      y: 2088,
      offsetY: -66,
      layer: 'ysort',
      embedKind: 'cliff_base',
      colliders: [
        {
          name: 'Col_east_cliff_1',
          role: 'solid_cliff',
          points: [[-66, -42], [62, -42], [72, -6], [42, 16], [-56, 14]],
        },
      ],
    },
    {
      id: 'tidepool_cliff_ne',
      spriteKey: 'basalt_cliff_monolith',
      x: 1988,
      y: 1852,
      offsetY: -66,
      layer: 'ysort',
      embedKind: 'cliff_base',
      colliders: [
        {
          name: 'Col_east_cliff_2',
          role: 'solid_cliff',
          points: [[-66, -42], [62, -42], [72, -6], [42, 16], [-56, 14]],
        },
      ],
    },
    {
      id: 'tidepool_succulent_1',
      spriteKey: 'coastal_succulent',
      x: 1854,
      y: 2046,
      offsetY: -22,
      layer: 'ysort',
      swayKind: 1,
      swayAmp: 0.55,
      swayPhase: 0.7,
      embedKind: 'dune_plant',
    },
    {
      id: 'tidepool_succulent_2',
      spriteKey: 'coastal_succulent_sm_flip',
      x: 1644,
      y: 2076,
      offsetY: -15,
      layer: 'ysort',
      swayKind: 1,
      swayAmp: 0.5,
      swayPhase: 1.9,
      embedKind: 'dune_plant',
    },
    {
      id: 'tidepool_succulent_3',
      spriteKey: 'coastal_succulent_sm',
      x: 1916,
      y: 2158,
      offsetY: -15,
      layer: 'ysort',
      swayKind: 1,
      swayAmp: 0.5,
      swayPhase: 3.1,
      embedKind: 'dune_plant',
    },

    // =========================================================================
    // ZONE D — THE BASALT SHORE (Stratified Cliffs, Narrow Passages & Spray!)
    // =========================================================================
    {
      id: 'basalt_cliff_w_south',
      spriteKey: 'basalt_cliff_monolith',
      x: 422,
      y: 2292,
      offsetY: -66,
      layer: 'ysort',
      embedKind: 'cliff_base',
      waveBreakCollar: true,
      colliders: [
        {
          name: 'Col_basalt_ws',
          role: 'solid_cliff',
          points: [[-66, -42], [62, -42], [72, -6], [42, 16], [-56, 14]],
        },
      ],
    },
    {
      id: 'basalt_cliff_w_mid',
      spriteKey: 'basalt_cliff_monolith_flip',
      x: 342,
      y: 2072,
      offsetY: -66,
      layer: 'ysort',
      embedKind: 'cliff_base',
      colliders: [
        {
          name: 'Col_basalt_wm',
          role: 'solid_cliff',
          points: [[-66, -42], [62, -42], [72, -6], [42, 16], [-56, 14]],
        },
      ],
    },
    {
      id: 'basalt_cliff_w_inner',
      spriteKey: 'basalt_cliff_monolith',
      x: 562,
      y: 1938,
      offsetY: -66,
      layer: 'ysort',
      embedKind: 'cliff_base',
      colliders: [
        {
          name: 'Col_basalt_wi',
          role: 'solid_cliff',
          points: [[-66, -42], [62, -42], [72, -6], [42, 16], [-56, 14]],
        },
      ],
    },
    {
      id: 'basalt_cliff_w_north',
      spriteKey: 'basalt_cliff_monolith_flip',
      x: 356,
      y: 1796,
      offsetY: -66,
      layer: 'ysort',
      embedKind: 'cliff_base',
      colliders: [
        {
          name: 'Col_basalt_wn',
          role: 'solid_cliff',
          points: [[-66, -42], [62, -42], [72, -6], [42, 16], [-56, 14]],
        },
      ],
    },
    {
      id: 'basalt_boulder_passage',
      spriteKey: 'coastal_boulder_cluster_flip',
      x: 694,
      y: 2064,
      offsetY: -32,
      layer: 'ysort',
      embedKind: 'sand_berm',
      colliders: [
        {
          name: 'Col_basalt_boulder_p',
          role: 'solid_rock',
          points: [[-42, -20], [40, -22], [46, -2], [22, 10], [-38, 8]],
        },
      ],
    },
    {
      id: 'basalt_driftwood_shelter',
      spriteKey: 'coastal_driftwood_log_flip',
      x: 476,
      y: 2128,
      offsetY: -34,
      layer: 'ysort',
      embedKind: 'sand_berm',
      colliders: [
        {
          name: 'Col_drift_basalt',
          role: 'solid_driftwood',
          points: [[-52, -18], [46, -20], [56, -4], [38, 10], [-46, 8]],
        },
      ],
    },
    {
      id: 'basalt_succulent_1',
      spriteKey: 'coastal_succulent',
      x: 632,
      y: 1998,
      offsetY: -22,
      layer: 'ysort',
      swayKind: 1,
      swayAmp: 0.55,
      swayPhase: 2.2,
      embedKind: 'dune_plant',
    },

    // =========================================================================
    // ZONE E — THE COASTAL VEGETATION BELT (Wind-Bent Shrubs, Dunes & Ecotone!)
    // =========================================================================
    {
      id: 'veg_shrub_w1',
      spriteKey: 'coastal_salt_shrub',
      x: 786,
      y: 1882,
      offsetY: -30,
      layer: 'ysort',
      swayKind: 1,
      swayAmp: 1.0,
      swayPhase: 0.4,
      embedKind: 'dune_plant',
      colliders: [
        {
          name: 'Col_shrub_w1',
          role: 'solid_rock',
          points: [[-22, -12], [22, -12], [26, 2], [-22, 4]],
        },
      ],
    },
    {
      id: 'veg_shrub_w2',
      spriteKey: 'coastal_salt_shrub_sm_flip',
      x: 924,
      y: 1954,
      offsetY: -22,
      layer: 'ysort',
      swayKind: 1,
      swayAmp: 1.1,
      swayPhase: 1.6,
      embedKind: 'dune_plant',
    },
    {
      id: 'veg_shrub_c1',
      spriteKey: 'coastal_salt_shrub_flip',
      x: 1384,
      y: 1862,
      offsetY: -30,
      layer: 'ysort',
      swayKind: 1,
      swayAmp: 0.95,
      swayPhase: 2.7,
      embedKind: 'dune_plant',
      colliders: [
        {
          name: 'Col_shrub_c1',
          role: 'solid_rock',
          points: [[-22, -12], [22, -12], [26, 2], [-22, 4]],
        },
      ],
    },
    {
      id: 'veg_shrub_e1',
      spriteKey: 'coastal_salt_shrub',
      x: 1642,
      y: 1844,
      offsetY: -30,
      layer: 'ysort',
      swayKind: 1,
      swayAmp: 1.05,
      swayPhase: 3.9,
      embedKind: 'dune_plant',
      colliders: [
        {
          name: 'Col_shrub_e1',
          role: 'solid_rock',
          points: [[-22, -12], [22, -12], [26, 2], [-22, 4]],
        },
      ],
    },
    {
      id: 'veg_shrub_e2',
      spriteKey: 'coastal_salt_shrub_sm',
      x: 1546,
      y: 1952,
      offsetY: -22,
      layer: 'ysort',
      swayKind: 1,
      swayAmp: 1.15,
      swayPhase: 4.5,
      embedKind: 'dune_plant',
    },
    {
      id: 'veg_driftwood_dune',
      spriteKey: 'coastal_driftwood_log',
      x: 1022,
      y: 1808,
      offsetY: -34,
      layer: 'ysort',
      embedKind: 'sand_berm',
      colliders: [
        {
          name: 'Col_drift_dune',
          role: 'solid_driftwood',
          points: [[-50, -16], [46, -18], [54, -2], [36, 10], [-44, 8]],
        },
      ],
    },
    {
      id: 'veg_boulder_mid',
      spriteKey: 'coastal_boulder_cluster',
      x: 1476,
      y: 1756,
      offsetY: -32,
      layer: 'ysort',
      embedKind: 'dune_plant',
      colliders: [
        {
          name: 'Col_veg_boulder',
          role: 'solid_rock',
          points: [[-42, -20], [40, -22], [46, -2], [22, 10], [-38, 8]],
        },
      ],
    },
    {
      id: 'veg_succulent_d1',
      spriteKey: 'coastal_succulent',
      x: 842,
      y: 1986,
      offsetY: -22,
      layer: 'ysort',
      swayKind: 1,
      swayAmp: 0.5,
      swayPhase: 0.9,
      embedKind: 'dune_plant',
    },
    {
      id: 'veg_succulent_d2',
      spriteKey: 'coastal_succulent_flip',
      x: 1272,
      y: 1864,
      offsetY: -22,
      layer: 'ysort',
      swayKind: 1,
      swayAmp: 0.55,
      swayPhase: 2.1,
      embedKind: 'dune_plant',
    },
    {
      id: 'veg_succulent_d3',
      spriteKey: 'coastal_succulent_sm',
      x: 1724,
      y: 1918,
      offsetY: -15,
      layer: 'ysort',
      swayKind: 1,
      swayAmp: 0.5,
      swayPhase: 3.6,
      embedKind: 'dune_plant',
    },

    // =========================================================================
    // ZONE F — THE INLAND GATEWAY (Bridging Seamlessly Into V8.0 Living Forest!)
    // Open walkable threshold x = 1040..1240, y = 1320..1640!
    // =========================================================================
    {
      id: 'gateway_basalt_west_pillar',
      spriteKey: 'basalt_cliff_monolith',
      x: 886,
      y: 1584,
      offsetY: -66,
      layer: 'ysort',
      embedKind: 'cliff_base',
      colliders: [
        {
          name: 'Col_gw_west',
          role: 'solid_cliff',
          points: [[-64, -40], [58, -40], [68, -4], [40, 14], [-54, 12]],
        },
      ],
    },
    {
      id: 'gateway_basalt_east_pillar',
      spriteKey: 'basalt_cliff_monolith_flip',
      x: 1412,
      y: 1588,
      offsetY: -66,
      layer: 'ysort',
      embedKind: 'cliff_base',
      colliders: [
        {
          name: 'Col_gw_east',
          role: 'solid_cliff',
          points: [[-64, -40], [58, -40], [68, -4], [40, 14], [-54, 12]],
        },
      ],
    },
    {
      id: 'gateway_tree_west',
      spriteKey: 'forest_tree_redwood',
      x: 682,
      y: 1624,
      offsetY: -108,
      layer: 'ysort',
      embedKind: 'dune_plant',
      colliders: [
        {
          name: 'Col_gw_tree_w',
          role: 'solid_tree',
          points: [[-34, -22], [34, -22], [42, -4], [24, 10], [-28, 10]],
        },
      ],
    },
    {
      id: 'gateway_tree_east',
      spriteKey: 'forest_tree_rock_flip',
      x: 1672,
      y: 1632,
      offsetY: -108,
      layer: 'ysort',
      embedKind: 'dune_plant',
      colliders: [
        {
          name: 'Col_gw_tree_e',
          role: 'solid_tree',
          points: [[-34, -22], [34, -22], [42, -4], [24, 10], [-28, 10]],
        },
      ],
    },
    {
      id: 'gateway_tree_far_w',
      spriteKey: 'forest_tree_rock',
      x: 492,
      y: 1554,
      offsetY: -108,
      layer: 'ysort',
      embedKind: 'dune_plant',
      colliders: [
        {
          name: 'Col_gw_tree_fw',
          role: 'solid_tree',
          points: [[-34, -22], [34, -22], [42, -4], [24, 10], [-28, 10]],
        },
      ],
    },
    {
      id: 'gateway_tree_far_e',
      spriteKey: 'forest_tree_redwood_flip',
      x: 1854,
      y: 1564,
      offsetY: -108,
      layer: 'ysort',
      embedKind: 'dune_plant',
      colliders: [
        {
          name: 'Col_gw_tree_fe',
          role: 'solid_tree',
          points: [[-34, -22], [34, -22], [42, -4], [24, 10], [-28, 10]],
        },
      ],
    },
    {
      id: 'gateway_shrub_w',
      spriteKey: 'coastal_salt_shrub',
      x: 996,
      y: 1516,
      offsetY: -30,
      layer: 'ysort',
      swayKind: 1,
      swayAmp: 0.9,
      swayPhase: 1.2,
      embedKind: 'dune_plant',
    },
    {
      id: 'gateway_shrub_e',
      spriteKey: 'coastal_salt_shrub_flip',
      x: 1296,
      y: 1522,
      offsetY: -30,
      layer: 'ysort',
      swayKind: 1,
      swayAmp: 0.9,
      swayPhase: 2.5,
      embedKind: 'dune_plant',
    },
    {
      id: 'gateway_fern_1',
      spriteKey: 'forest_fern_cluster',
      x: 1036,
      y: 1468,
      offsetY: -28,
      layer: 'ysort',
      swayKind: 1,
      swayAmp: 1.1,
      swayPhase: 0.5,
      embedKind: 'dune_plant',
    },
    {
      id: 'gateway_fern_2',
      spriteKey: 'forest_fern_cluster_flip',
      x: 1244,
      y: 1474,
      offsetY: -28,
      layer: 'ysort',
      swayKind: 1,
      swayAmp: 1.1,
      swayPhase: 2.1,
      embedKind: 'dune_plant',
    },
    {
      id: 'gateway_fern_3',
      spriteKey: 'forest_fern_cluster',
      x: 974,
      y: 1648,
      offsetY: -28,
      layer: 'ysort',
      swayKind: 1,
      swayAmp: 1.0,
      swayPhase: 3.3,
      embedKind: 'dune_plant',
    },
    {
      id: 'gateway_fern_4',
      spriteKey: 'forest_fern_cluster_flip',
      x: 1312,
      y: 1656,
      offsetY: -28,
      layer: 'ysort',
      swayKind: 1,
      swayAmp: 1.0,
      swayPhase: 4.1,
      embedKind: 'dune_plant',
    },
  ];
  return props;
}

export function getV90WalkableZones(): V90WalkableZone[] {
  return [
    {
      // Breached aft compartment ramp + walkable interior deck trigger!
      id: 'Zone_meridian_breached_interior',
      role: 'meridian_interior',
      x: 1396,
      y: 2208,
      points: [
        [-48, -32], [58, -32], [68, 28], [-32, 34],
      ],
    },
    {
      id: 'Zone_tidepool_east_main',
      role: 'tidepool_shallow',
      x: 1756,
      y: 2196,
      points: [[-80, -18], [0, -34], [80, -18], [80, 18], [0, 34], [-80, 18]],
    },
    {
      id: 'Zone_tidepool_east_outer',
      role: 'tidepool_shallow',
      x: 1902,
      y: 2262,
      points: [[-62, -14], [0, -28], [62, -14], [62, 14], [0, 28], [-62, 14]],
    },
    {
      id: 'Zone_coastal_veg_belt_slow_w',
      role: 'coastal_brush_slow',
      x: 786,
      y: 1882,
      points: [[-36, -24], [36, -24], [42, 6], [-38, 8]],
    },
    {
      id: 'Zone_inland_gateway_corridor',
      role: 'inland_gateway',
      x: 1142,
      y: 1470,
      points: [[-112, -96], [112, -96], [112, 96], [-112, 96]],
    },
  ];
}

export function getV90CoastalFauna(): V90CoastalFauna[] {
  return [
    // 4 Soaring Chime-Wing Gliders (fa_03) gliding organically over ocean, wreck & cliffs
    { kind: 0, x: 780, y: 2450, rx: 148, ry: 52, speed: 0.42, phase: 0.3 },
    { kind: 0, x: 1420, y: 2340, rx: 176, ry: 64, speed: 0.36, phase: 2.1 },
    { kind: 0, x: 1820, y: 2220, rx: 124, ry: 58, speed: 0.48, phase: 4.4 },
    { kind: 0, x: 520, y: 2040, rx: 112, ry: 48, speed: 0.39, phase: 1.5 },
    // 4 Skittering Mirror-Shell Crabs (fa_02) patrolling tidepools & wet shore!
    { kind: 1, x: 1742, y: 2182, rx: 32, ry: 12, speed: 0.92, phase: 0.2 },
    { kind: 1, x: 1882, y: 2248, rx: 28, ry: 10, speed: 1.05, phase: 1.8 },
    { kind: 1, x: 842, y: 2368, rx: 36, ry: 11, speed: 0.86, phase: 3.4 },
    { kind: 1, x: 1592, y: 2314, rx: 26, ry: 10, speed: 0.98, phase: 5.1 },
  ];
}

export function getV90AmberKelpPlacements(): Array<{ x: number; y: number; phase: number }> {
  return [
    { x: 1724, y: 2196, phase: 0.1 },
    { x: 1796, y: 2212, phase: 1.4 },
    { x: 1886, y: 2274, phase: 2.6 },
    { x: 1938, y: 2254, phase: 3.9 },
    { x: 1838, y: 2102, phase: 0.8 },
    { x: 1592, y: 2298, phase: 2.1 },
    { x: 572, y: 2306, phase: 3.3 },
    { x: 912, y: 2394, phase: 1.7 },
    { x: 1168, y: 2434, phase: 4.2 },
    { x: 1684, y: 2354, phase: 0.5 },
  ];
}
