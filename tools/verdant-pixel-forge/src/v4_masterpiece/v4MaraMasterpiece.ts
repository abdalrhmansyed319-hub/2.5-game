/**
 * VERDANT SIGNAL V4.0 — Dr. Mara Lin Masterpiece Character & Kinematic Animation Engine
 * =====================================================================================
 * Genuinely authors Dr. Mara Lin natively at ALL FIVE candidate resolutions:
 *   - 48x64 px
 *   - 64x80 px
 *   - 64x96 px (★ Top Gameplay Candidate — full illustrated proportions + sustainable animation)
 *   - 96x128 px (Ultra-Rich Hero Candidate)
 *   - 128x128 px (Museum Showcase Hero Benchmark)
 *
 * ZERO upscaling from smaller sprites. Every material obeys the 4-Material Rendering Law:
 *   1. Matte/Satin Orange Fabric (painterly 2x2 clusters, tailored seams, lineless sunlit crests)
 *   2. Compressed Weathered Dark Leather & Rubber (espresso core + crisp edge wear)
 *   3. High-Contrast Brushed Aerospace Titanium (sharp dark-to-bright specular bevels)
 *   4. Curved Panoramic Visor Glass (real curved sky + horizon + warm Amber Coast sand bounce!)
 *
 * Also powers full kinematic Walk (8f), Run (8f), and Transitions/Actions (10f) animations
 * with real joint bending, foot roll, torso inclination, and delayed backpack/antenna/hose physics!
 */

import { V4Canvas } from './v4Core';

const SUIT_RAMP = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'];
const LEATHER_RAMP = ['B0', 'B1', 'B2', 'B3', 'B4', 'B5'];
const METAL_RAMP = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6'];

export const MARA_V4_LAYERS = [
  { id: 'l01_ground_fx', name: '01 Ground Shadow & Foot Dust' },
  { id: 'l02_silhouette_ink', name: '02 Selective Shadow Contour' },
  { id: 'l03_antenna_hose', name: '03 Telemetry Antenna & Coiled O2 Hose' },
  { id: 'l04_backpack_rig', name: '04 Life-Support Backpack, Radiator & O2 Tank' },
  { id: 'l05_far_arm', name: '05 Far Arm & Gloved Hand' },
  { id: 'l06_far_leg', name: '06 Far Leg & Knee Guard' },
  { id: 'l06b_far_boot', name: '06B Far Articulated Expedition Boot' },
  { id: 'l07_near_leg', name: '07 Near Leg & Armored Kneepad' },
  { id: 'l07b_near_boot', name: '07B Near Lugged Expedition Boot' },
  { id: 'l08_suit_torso', name: '08 Tailored Quilted Exosuit Torso & Folds' },
  { id: 'l09_harness_belt', name: '09 Stitched Leather Harness, Pouches & Moss Vial' },
  { id: 'l10_chest_telemetry', name: '10 Brushed Titanium Chest Oscilloscope & Gauge' },
  { id: 'l11_helmet_shell', name: '11 Sculpted Aerospace Helmet, Collar & Ear Comm' },
  { id: 'l12_panoramic_visor', name: '12 Panoramic Curved Glass Visor (Env Reflection)' },
  { id: 'l13_near_arm_lens', name: '13 Near Arm, Patch, Glove & Acoustic Field Lens' },
  { id: 'l14_specular_vfx', name: '14 Specular Catchlights & Harmonic Scan VFX' },
];

export type MaraV4Res = '48x64' | '64x80' | '64x96' | '96x128' | '128x128';

export interface MaraPoseSpec {
  name: string;
  facing: '3q' | 'side';
  /** Vertical offset of pelvis relative to standing rest (+ down squash, - up lift/airborne) */
  pelvisDy: number;
  /** Horizontal shift of center of mass */
  pelvisDx: number;
  /** Torso forward lean in degrees (+ leans forward right, - leans back recoil) */
  torsoLeanDeg: number;
  /** Helmet tilt in degrees */
  headPitchDeg: number;
  /** Near (viewer-left/front) leg angles (0 = straight down, + = forward right, - = back left) */
  nearThighDeg: number;
  nearKneeBendDeg: number; // >= 0 bends knee backwards naturally!
  nearFootPitchDeg: number; // + toes up (heel strike), - toes pointed down (push-off)
  /** Far (viewer-right/back) leg angles */
  farThighDeg: number;
  farKneeBendDeg: number;
  farFootPitchDeg: number;
  /** Near (front/left) arm angles */
  nearShoulderDeg: number;
  nearElbowBendDeg: number; // >= 0 bends elbow forward!
  /** Far (back/right) arm angles */
  farShoulderDeg: number;
  farElbowBendDeg: number;
  /** Secondary motion physics lag! */
  backpackLagY: number;
  antennaWhipDeg: number;
  hoseSag: number;
  vialSwingDeg: number;
  /** Equipment & narrative action states */
  holdLens: 'hip_ready' | 'aim_scan' | 'stowed';
  microProbe?: boolean;
  dustPuff?: 'rear_kick' | 'skid_front' | 'land_burst' | 'none';
  hurtFlash?: boolean;
}

interface ResMetrics {
  w: number;
  h: number;
  groundY: number;
  /** Anatomical scale multiplier (1.0 exactly at 96x128 where standing figure is ~104px tall!) */
  sc: number;
  cx: number;
  detailTier: 1 | 2 | 3 | 4 | 5;
}

export function getMaraV4Metrics(res: MaraV4Res): ResMetrics {
  switch (res) {
    case '48x64':
      return { w: 48, h: 64, groundY: 60, sc: 0.49, cx: 23, detailTier: 1 };
    case '64x80':
      return { w: 64, h: 80, groundY: 75, sc: 0.62, cx: 31, detailTier: 2 };
    case '64x96':
      return { w: 64, h: 96, groundY: 90, sc: 0.75, cx: 31, detailTier: 3 };
    case '96x128':
      return { w: 96, h: 128, groundY: 120, sc: 0.98, cx: 46, detailTier: 4 };
    case '128x128':
      return { w: 128, h: 128, groundY: 120, sc: 1.04, cx: 61, detailTier: 5 };
  }
}

const DEG = Math.PI / 180;
function rotPt(ox: number, oy: number, len: number, degFromDown: number): [number, number] {
  const rad = degFromDown * DEG;
  return [ox + Math.sin(rad) * len, oy + Math.cos(rad) * len];
}

/** Iconic V4.0 Hero 3/4 Contrapposto Stance (directly elevating mara_lin_concept_128x128_v2!) */
export const POSE_HERO_3Q: MaraPoseSpec = {
  name: 'HERO 3/4 CONTRAPPOSTO',
  facing: '3q',
  pelvisDy: 0,
  pelvisDx: -3,
  torsoLeanDeg: 4,
  headPitchDeg: 2,
  nearThighDeg: -10,
  nearKneeBendDeg: 6,
  nearFootPitchDeg: 0,
  farThighDeg: 14,
  farKneeBendDeg: 5,
  farFootPitchDeg: 0,
  nearShoulderDeg: -36,
  nearElbowBendDeg: 66,
  farShoulderDeg: 14,
  farElbowBendDeg: 62,
  backpackLagY: 0,
  antennaWhipDeg: -8,
  hoseSag: 1.0,
  vialSwingDeg: 4,
  holdLens: 'hip_ready',
};

/** Helper: paint an articulated heavy expedition boot with rounded toe box, heel counter, ankle buckle & lugged tread! */
function paintArticulatedBoot(
  c: V4Canvas,
  layer: string,
  ankleX: number,
  ankleY: number,
  footPitchDeg: number,
  dirSign: number, // +1 right facing, 0.45 3/4 outward
  sc: number,
  detailTier: number,
  bias: number
): void {
  const rad = footPitchDeg * DEG;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const xf = (lx: number, ly: number): [number, number] => [
    ankleX + lx * cos * dirSign - ly * sin,
    ankleY + lx * sin * dirSign + ly * cos,
  ];

  const bh = 10.5 * sc;
  const toeLen = 11.2 * sc;
  const heelLen = -4.6 * sc;

  // Sculpted polygonal expedition boot silhouette (padded ankle shaft -> arched instep -> rounded toe box -> thick lugged sole!)
  const bootPoly: Array<[number, number]> = [
    xf(-3.6 * sc, -2.5 * sc),
    xf(3.4 * sc, -2.5 * sc),
    xf(4.5 * sc, 2.2 * sc),
    xf(toeLen * 0.78, 3.8 * sc),
    xf(toeLen, 6.2 * sc),
    xf(toeLen * 0.94, bh),
    xf(heelLen, bh),
    xf(heelLen - 0.8 * sc, 6.2 * sc),
    xf(-4.2 * sc, 2.5 * sc),
  ];
  c.fillPoly(layer, bootPoly, 'B2');

  // Shade compressed dark weathered espresso leather (deep core + sharp sunlit instep edge!)
  c.shadeMaskedRegion(layer, ankleX + 2.5 * sc * dirSign, ankleY + 4.5 * sc, 8.5 * sc, 6.5 * sc, LEATHER_RAMP, {
    material: 'leather',
    bias: bias - 0.08,
    wobble: 0.04,
  });

  // Heavy dark vulcanized rubber lugged traction sole along bottom edge!
  const sA = xf(heelLen, bh - 1.2 * sc);
  const sB = xf(toeLen * 0.94, bh - 1.2 * sc);
  const sC = xf(toeLen * 0.92, bh + 0.8 * sc);
  const sD = xf(heelLen, bh + 0.8 * sc);
  c.fillPoly(layer, [sA, sB, sC, sD], 'B0');

  // Reinforced metallic-rubber toe cap scuff & brushed titanium ankle strap clasp (detailTier >= 2!)
  if (detailTier >= 2) {
    const [tx, ty] = xf(toeLen * 0.65, 5.2 * sc);
    c.px(layer, tx, ty, 'B4');
    c.px(layer, tx + 1, ty, 'B5');
    // Ankle leather retention strap + silver clasp
    const [ax0, ay0] = xf(-3.4 * sc, 1.5 * sc);
    const [ax1, ay1] = xf(3.8 * sc, 2.0 * sc);
    c.line(layer, ax0, ay0, ax1, ay1, 'B0', 255, layer);
    const [bx, by] = xf(1.5 * sc, 1.2 * sc);
    c.px(layer, bx, by, 'M5');
    if (detailTier >= 4) {
      c.px(layer, bx + 1, by, 'M6');
      // Distinct rubber lug teeth along bottom sole!
      for (let t = 0.1; t <= 0.85; t += 0.18) {
        const lx = heelLen + (toeLen - heelLen) * t;
        const [gx, gy] = xf(lx, bh + 0.6 * sc);
        c.px(layer, gx, gy, 'B1');
      }
    }
  }
}

/** Paint Mara's iconic Curved Panoramic Glass Visor with TRUE Environmental Reflection (sky dome + canopy horizon + warm sand bounce!) */
function paintV4PanoramicVisor(
  c: V4Canvas,
  vcx: number,
  vcy: number,
  vrx: number,
  vry: number,
  detailTier: number,
  harmonicGlow: boolean
): void {
  const x0 = Math.max(0, Math.floor(vcx - vrx - 4));
  const x1 = Math.min(c.width - 1, Math.ceil(vcx + vrx + 4));
  const y0 = Math.max(0, Math.floor(vcy - vry - 4));
  const y1 = Math.min(c.height - 1, Math.ceil(vcy + vry + 4));

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const nx = (x + 0.5 - vcx) / Math.max(1, vrx);
      const ny = (y + 0.5 - vcy) / Math.max(1, vry);
      // Iconic contoured aerospace visor silhouette: wide wrap-around upper dome tapering gently toward jawline!
      const jawTaper = ny > 0 ? 1.0 + ny * 0.18 : 1.0 - ny * 0.05;
      const r = Math.hypot(nx * jawTaper, ny);
      if (r > 1.15) continue;

      if (r > 0.94) {
        // Precision machined titanium gasket bezel (dark shadowed lower-right, razor sunlit upper-left bevel!)
        const bevel = -nx * 0.60 - ny * 0.68;
        const tok = bevel > 0.52 ? 'M5' : bevel > 0.16 ? 'M3' : bevel > -0.25 ? 'M1' : 'M0';
        c.px('l12_panoramic_visor', x, y, tok);
        continue;
      }

      // TRUE CURVED ENVIRONMENTAL REFLECTION SHADER INSIDE PANORAMIC GLASS!
      // Spherical horizon distortion curve
      const horizonY = ny + nx * nx * 0.24 - 0.06;
      let tok = 'V0';

      if (r > 0.84 && (ny < -0.1 || nx > 0.2)) {
        // Deep recessed rim shadow right inside titanium bezel
        tok = 'V0';
      } else if (horizonY < -0.36 && nx < 0.42) {
        // Bright sunlit upper sky dome reflection!
        tok = nx < -0.14 ? (harmonicGlow ? 'L3' : 'V6') : (harmonicGlow ? 'L2' : 'V5');
      } else if (horizonY < -0.05) {
        // Clear pale teal Rimlands sky gradient curving across upper glass
        tok = harmonicGlow ? (nx < 0.25 ? 'L2' : 'V4') : (nx < 0.22 ? 'V4' : 'V3');
      } else if (horizonY < 0.14) {
        // Distant Singing Canopy forest horizon silhouette curving subtly across glass center!
        const treeWave = Math.sin(nx * 9.0) * 0.05;
        tok = horizonY < 0.06 + treeWave ? 'V2' : 'V1';
      } else if (ny > 0.48 && r > 0.58 && r < 0.86 && nx > -0.45 && nx < 0.48) {
        // Warm sunlit Amber Coast sand bounce reflected softly along lower curved glass lip!
        tok = harmonicGlow ? 'L1' : detailTier >= 3 ? 'VR' : 'V2';
      } else {
        // Deep tinted marine-abyss glass depth (subtle interior mask shadow)
        tok = Math.abs(nx) < 0.35 && ny > 0.2 ? 'V0' : 'V1';
      }
      c.px('l12_panoramic_visor', x, y, tok);
    }
  }

  // Razor-crisp curved dual specular sky catchlight ribbons on upper-left glass curve!
  const gx = vcx - vrx * 0.44;
  const gy = vcy - vry * 0.44;
  c.line('l14_specular_vfx', gx - 1, gy + 2, gx + vrx * 0.24, gy - vry * 0.10, 'V6');
  if (detailTier >= 3) {
    c.line('l14_specular_vfx', gx, gy + 3, gx + vrx * 0.16, gy + 1, harmonicGlow ? 'L3' : 'V5');
    // Secondary curved micro-glint dot on lower-right visor glass
    c.px('l14_specular_vfx', Math.round(vcx + vrx * 0.36), Math.round(vcy + vry * 0.42), harmonicGlow ? 'L2' : 'V4');
  }
}

/** Paint Mara's Engineered Multi-Component Parabolic Acoustic Field Lens (advanced believable scientific hardware!) */
function paintV4AcousticFieldLens(
  c: V4Canvas,
  handX: number,
  handY: number,
  aimDeg: number, // 0 = right horizontal, -22 = raised aim scan
  sc: number,
  detailTier: number,
  activeScan: boolean
): void {
  const rad = aimDeg * DEG;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const xf = (lx: number, ly: number): [number, number] => [
    handX + lx * cos - ly * sin,
    handY + lx * sin + ly * cos,
  ];

  // 1. Ergonomic dark-rubber grip & burnt-orange safety trigger housing
  const gripPoly = [xf(-2.5 * sc, -1.5 * sc), xf(2.8 * sc, -1.5 * sc), xf(1.8 * sc, 5.2 * sc), xf(-3.2 * sc, 4.8 * sc)];
  c.fillPoly('l13_near_arm_lens', gripPoly, 'B1');
  c.px('l13_near_arm_lens', ...xf(1.6 * sc, 1.4 * sc), 'S5'); // tactical orange trigger!

  // 2. Machined titanium receiver barrel with glowing cyan charge-indicator strip!
  const barrelPoly = [xf(-3.5 * sc, -3.2 * sc), xf(7.5 * sc, -3.4 * sc), xf(7.5 * sc, 1.8 * sc), xf(-3.2 * sc, 1.5 * sc)];
  c.fillPoly('l13_near_arm_lens', barrelPoly, 'M2');
  c.shadeMaskedRegion('l13_near_arm_lens', ...xf(2.5 * sc, -1.0 * sc), 6 * sc, 3 * sc, METAL_RAMP, { material: 'metal' });
  // Glowing cyan battery/resonance meter along barrel flank!
  c.line('l14_specular_vfx', ...xf(-0.5 * sc, -1.2 * sc), ...xf(4.5 * sc, -1.2 * sc), activeScan ? 'L3' : 'L2');

  // 3. Sculpted Conical Dark-Gunmetal Parabolic Reflector Shell!
  const [dishCx, dishCy] = xf(10.5 * sc, -1.0 * sc);
  const rx = Math.max(2.6, 4.2 * sc);
  const ry = Math.max(4.6, 8.2 * sc);
  const dishBack = [
    xf(6.2 * sc, -3.6 * sc),
    xf(10.6 * sc, -ry),
    xf(10.6 * sc, ry - 1.5 * sc),
    xf(6.2 * sc, 2.2 * sc),
  ];
  c.fillPoly('l13_near_arm_lens', dishBack, 'M1');
  c.line('l13_near_arm_lens', ...xf(6.5 * sc, -3.5 * sc), ...xf(10.4 * sc, -ry + 1), 'M5'); // crisp sunlit top metal bevel!

  // 4. Open Concave Deep-Marine Optical Dish Face + Concentric Harmonic Ring Grooves!
  const x0 = Math.max(0, Math.floor(dishCx - rx - 2));
  const x1 = Math.min(c.width - 1, Math.ceil(dishCx + rx + 3));
  const y0 = Math.max(0, Math.floor(dishCy - ry - 2));
  const y1 = Math.min(c.height - 1, Math.ceil(dishCy + ry + 2));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const nx = (x - (dishCx + 0.8 * sc)) / (rx * 0.92);
      const ny = (y - dishCy) / (ry * 0.95);
      const r = Math.hypot(nx, ny);
      if (r > 1.08) continue;
      if (r > 0.84) {
        // Beveled metallic dish rim lip (sharp specular jump!)
        const tok = ny < -0.35 ? 'M6' : ny < 0.15 ? 'M4' : ny < 0.55 ? 'M2' : 'M0';
        c.px('l13_near_arm_lens', x, y, tok);
      } else {
        // Concave optical mirror with delicate concentric acoustic wave-guide rings!
        let tok = r < 0.25 ? (activeScan ? 'L3' : 'L2')
          : r < 0.48 ? (activeScan ? 'L2' : 'V3')
          : r < 0.68 ? (activeScan ? 'L1' : 'V2')
          : 'V0';
        if (detailTier >= 3 && Math.abs(r - 0.56) < 0.08) tok = activeScan ? 'L3' : 'V4';
        c.px('l13_near_arm_lens', x, y, tok);
      }
    }
  }

  // 5. Three Precision Protruding Titanium Focal Struts converging onto an Incandescent Cyan Crystal Resonator!
  const [tipX, tipY] = xf(15.2 * sc, -1.0 * sc);
  c.line('l13_near_arm_lens', ...xf(10.8 * sc, -ry * 0.72), tipX, tipY, 'M4');
  c.line('l13_near_arm_lens', ...xf(10.8 * sc, ry * 0.65), tipX, tipY, 'M1');
  c.line('l13_near_arm_lens', ...xf(10.5 * sc, -1.0 * sc), tipX, tipY, 'M3');
  c.px('l14_specular_vfx', tipX, tipY, 'L3');
  if (detailTier >= 3) {
    c.px('l14_specular_vfx', tipX - 1, tipY, 'L2');
    c.px('l14_specular_vfx', tipX, tipY - 1, 'L2');
  }

  // 6. Luminous Multi-Tiered Harmonic Acoustic Wave Arcs when actively scanning!
  if (activeScan) {
    for (let ring = 1; ring <= 3; ring++) {
      const rr = (3.5 + ring * 4.2) * sc;
      for (let a = -0.82; a <= 0.82; a += 0.10) {
        const lx = 15.8 * sc + Math.cos(a) * rr * 0.62;
        const ly = -1.0 * sc + Math.sin(a) * rr;
        const [ax, ay] = xf(lx, ly);
        const tok = ring === 1 ? 'L3' : ring === 2 ? 'L2' : 'L1';
        c.blendPx('l14_specular_vfx', ax, ay, tok, ring === 1 ? 255 : ring === 2 ? 200 : 135);
      }
    }
  }
}

/** Paint Mara's Complex Life-Support Backpack: Louvered Radiator Chassis + Vertical Brushed Titanium O2 Tank + Gauge + Coiled Hose! */
function paintV4BackpackRig(
  c: V4Canvas,
  bx: number,
  by: number,
  sc: number,
  detailTier: number,
  pose: MaraPoseSpec
): void {
  const isSide = pose.facing === 'side';
  const pw = (isSide ? 14.5 : 13.5) * sc;
  const ph = 24.5 * sc;
  const topY = by + pose.backpackLagY * sc;
  const whipRad = pose.antennaWhipDeg * DEG;

  // 1. Flexible Whipping Telemetry Antenna + Base Mount + Blinking Ivory Sensor Bead!
  const antBaseX = bx - pw * 0.15;
  const antBaseY = topY - 1 * sc;
  const antLen = 21 * sc;
  const antMidX = antBaseX + Math.sin(whipRad * 0.6) * antLen * 0.5;
  const antMidY = antBaseY - Math.cos(whipRad * 0.6) * antLen * 0.5;
  const antTipX = antBaseX + Math.sin(whipRad) * antLen;
  const antTipY = antBaseY - Math.cos(whipRad) * antLen;
  c.line('l03_antenna_hose', antBaseX, antBaseY, antMidX, antMidY, 'M4');
  c.line('l03_antenna_hose', antMidX, antMidY, antTipX, antTipY, 'M5');
  c.line('l03_antenna_hose', antBaseX + 1, antBaseY, antMidX + 1, antMidY, 'M1');
  c.fillEllipse('l14_specular_vfx', antTipX, antTipY, Math.max(0.8, 1.3 * sc), Math.max(0.8, 1.3 * sc), 'M6');
  // Machined antenna socket collar
  c.fillPoly('l04_backpack_rig', [
    [antBaseX - 2.2 * sc, antBaseY + 1 * sc],
    [antBaseX + 2.5 * sc, antBaseY + 1 * sc],
    [antBaseX + 2.0 * sc, antBaseY - 3.2 * sc],
    [antBaseX - 1.8 * sc, antBaseY - 3.2 * sc],
  ], 'M2');
  c.px('l04_backpack_rig', antBaseX - 1 * sc, antBaseY - 2 * sc, 'M5');

  // 2. Sculpted Chamfered Aerospace Backpack Chassis (angled beveled corners, NOT a flat box!)
  const packPoly: Array<[number, number]> = [
    [bx - pw * 0.45, topY + 2 * sc],
    [bx - pw * 0.25, topY],
    [bx + pw * 0.45, topY],
    [bx + pw * 0.55, topY + 3 * sc],
    [bx + pw * 0.50, topY + ph - 2 * sc],
    [bx + pw * 0.25, topY + ph],
    [bx - pw * 0.35, topY + ph],
    [bx - pw * 0.52, topY + ph - 3 * sc],
  ];
  c.fillPoly('l04_backpack_rig', packPoly, 'M2');
  c.shadeMaskedRegion('l04_backpack_rig', bx, topY + ph * 0.48, pw * 0.65, ph * 0.55, METAL_RAMP, {
    material: 'metal',
    bias: -0.05,
  });

  // Recessed Radiator Cooling Louver Fins + Thermal Gold-Foil Accent Strip (detailTier >= 2!)
  if (detailTier >= 2) {
    const finCount = detailTier >= 4 ? 4 : 3;
    for (let f = 0; f < finCount; f++) {
      const fy = topY + (5.5 + f * 3.8) * sc;
      c.line('l04_backpack_rig', bx - pw * 0.18, fy, bx + pw * 0.32, fy, 'M0');
      c.line('l04_backpack_rig', bx - pw * 0.18, fy + 1, bx + pw * 0.30, fy + 1, 'M4');
    }
    // Thermal gold-foil insulation strip along lower pack bay!
    if (detailTier >= 3) {
      c.line('l04_backpack_rig', bx - pw * 0.22, topY + ph - 4 * sc, bx + pw * 0.28, topY + ph - 4 * sc, 'A1');
      c.line('l04_backpack_rig', bx - pw * 0.22, topY + ph - 3 * sc, bx + pw * 0.28, topY + ph - 3 * sc, 'A0');
    }
  }

  // 3. Vertical Pressurized Brushed-Titanium O2 Cylinder + Twin Orange Clamp Bands + Ruby Valve + Pressure Gauge!
  const cylCx = bx - pw * 0.66;
  const cylW = Math.max(3.6, 7.2 * sc);
  const cylH = ph * 0.90;
  const cylY0 = topY + 2.2 * sc;
  for (let ly = 0; ly <= Math.round(cylH); ly++) {
    const ny = ly / Math.max(1, cylH);
    const capShrink = ny < 0.09 ? Math.sqrt(ny / 0.09) : ny > 0.91 ? Math.sqrt((1 - ny) / 0.09) : 1.0;
    const hw = Math.max(1, Math.round((cylW * 0.5) * capShrink));
    for (let dx = -hw; dx <= hw; dx++) {
      const nx = dx / Math.max(1, hw);
      let tok = 'M2';
      if (dx === -hw || dx === hw || ly === 0 || ly === Math.round(cylH)) tok = 'M0';
      else if (nx < -0.25) tok = 'M6'; // razor vertical brushed-titanium specular highlight band!
      else if (nx < 0.15) tok = 'M5';
      else if (nx < 0.52) tok = 'M3';
      else tok = 'M1';

      // Twin iconic terracotta clamping bands wrapping the pressurized cylinder!
      const onClamp = Math.abs(ny - 0.30) < 0.07 || Math.abs(ny - 0.72) < 0.07;
      if (onClamp && dx > -hw && dx < hw) {
        tok = nx < -0.1 ? 'S6' : nx < 0.3 ? 'S4' : 'S2';
      }
      c.px('l04_backpack_rig', Math.round(cylCx + dx), Math.round(cylY0 + ly), tok);
    }
  }
  // Crimson Reserve Pressure Valve + Tiny Round Pressure Gauge Dial atop O2 cylinder!
  c.fillEllipse('l04_backpack_rig', cylCx, cylY0 - 1.2 * sc, Math.max(1.2, 2.2 * sc), Math.max(1.0, 1.5 * sc), 'R1');
  c.px('l04_backpack_rig', cylCx + 1.4 * sc, cylY0 - 1.0 * sc, 'R0');
  if (detailTier >= 4) {
    // Mini circular white-face pressure gauge dial mounted on upper valve manifold!
    c.fillEllipse('l04_backpack_rig', cylCx + 3.2 * sc, cylY0 + 1.5 * sc, 2.0 * sc, 2.0 * sc, 'M0');
    c.fillEllipse('l04_backpack_rig', cylCx + 3.2 * sc, cylY0 + 1.5 * sc, 1.3 * sc, 1.3 * sc, 'M6');
    c.px('l14_specular_vfx', cylCx + 3.5 * sc, cylY0 + 1.2 * sc, 'R1'); // gauge needle!
  }

  // 4. Corrugated Coiled Umbilical Oxygen Hose swinging dynamically with secondary physics (`hoseSag`)!
  const sag = pose.hoseSag * 4.5 * sc;
  const hPts: Array<[number, number, number]> = [
    [bx + pw * 0.10, topY + ph * 0.24, Math.max(1.0, 1.7 * sc)],
    [bx + pw * 0.58, topY + ph * 0.42 + sag, Math.max(1.0, 1.6 * sc)],
    [bx + pw * 1.15, topY + ph * 0.34 + sag * 0.5, Math.max(1.0, 1.5 * sc)],
  ];
  c.paintTaperedSpline('l03_antenna_hose', hPts, 'B1');
  // Crisp metallic ribbing ridges along the hose curve!
  for (let i = 0; i <= 7; i++) {
    const t = i / 7;
    const mt = 1 - t;
    const hx = mt * mt * hPts[0][0] + 2 * mt * t * hPts[1][0] + t * t * hPts[2][0];
    const hy = mt * mt * hPts[0][1] + 2 * mt * t * hPts[1][1] + t * t * hPts[2][1];
    c.px('l03_antenna_hose', hx, hy - 0.8 * sc, (i & 1) === 0 ? 'B4' : 'B0');
  }
}

/** Paint Mara's Iconic Translucent Glass Moss-Specimen Canister (swings naturally with hip inertia!) */
function paintV4SpecimenCanister(
  c: V4Canvas,
  hx: number,
  hy: number,
  swingDeg: number,
  sc: number,
  detailTier: number
): void {
  const rad = swingDeg * DEG;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const xf = (lx: number, ly: number): [number, number] => [hx + lx * cos - ly * sin, hy + lx * sin + ly * cos];

  const hw = Math.max(1.8, 3.6 * sc);
  const vh = Math.max(5.5, 12.2 * sc);

  // Outer titanium protective cage & glass chamber
  c.fillPoly('l09_harness_belt', [xf(-hw, 0), xf(hw, 0), xf(hw, vh), xf(-hw, vh)], 'M0');
  // Upper & lower machined steel end-caps
  c.fillPoly('l09_harness_belt', [xf(-hw, 0), xf(hw, 0), xf(hw, vh * 0.22), xf(-hw, vh * 0.22)], 'M4');
  c.fillPoly('l09_harness_belt', [xf(-hw, vh * 0.78), xf(hw, vh * 0.78), xf(hw, vh), xf(-hw, vh)], 'M2');
  // Luminous glowing alien emerald-chartreuse botanical moss specimen inside glass cylinder!
  c.fillPoly('l09_harness_belt', [xf(-hw + 1, vh * 0.24), xf(hw - 1, vh * 0.24), xf(hw - 1, vh * 0.76), xf(-hw + 1, vh * 0.76)], 'V2');
  c.fillPoly('l09_harness_belt', [xf(-hw + 1, vh * 0.38), xf(hw - 1, vh * 0.38), xf(hw - 1, vh * 0.76), xf(-hw + 1, vh * 0.76)], 'G5');
  c.fillPoly('l09_harness_belt', [xf(-hw + 1.3, vh * 0.44), xf(hw * 0.35, vh * 0.44), xf(hw * 0.35, vh * 0.70), xf(-hw + 1.3, vh * 0.70)], 'G7');
  // Crisp glass reflection specular streak!
  c.line('l14_specular_vfx', ...xf(-hw + 1.2, vh * 0.26), ...xf(-hw + 1.2, vh * 0.72), 'V6');
  if (detailTier >= 4) {
    c.px('l14_specular_vfx', ...xf(0, vh * 0.56), 'G8'); // bioluminescent spore speck!
  }
}

/** Paint Mara's Sophisticated Brushed-Titanium Chest Telemetry Oscilloscope & Status Panel! */
function paintV4ChestRig(
  c: V4Canvas,
  cx: number,
  cy: number,
  w: number,
  h: number,
  detailTier: number,
  harmonicGlow: boolean
): void {
  const x0 = Math.round(cx - w / 2);
  const y0 = Math.round(cy - h / 2);
  const rw = Math.max(7, Math.round(w));
  const rh = Math.max(5, Math.round(h));

  // Chamfered machined titanium instrument chassis (sharp bevel highlight on upper-left, deep cast shadow below!)
  c.fillPoly('l10_chest_telemetry', [
    [x0 + 1, y0], [x0 + rw - 2, y0], [x0 + rw - 1, y0 + 1],
    [x0 + rw - 1, y0 + rh - 2], [x0 + rw - 2, y0 + rh - 1],
    [x0 + 1, y0 + rh - 1], [x0, y0 + rh - 2], [x0, y0 + 1],
  ], 'M2');
  c.shadeMaskedRegion('l10_chest_telemetry', cx, cy, rw * 0.6, rh * 0.6, METAL_RAMP, { material: 'metal', bias: harmonicGlow ? 0.14 : 0.02 });
  // Crisp sunlit top-left metallic bezel edge & shadowed bottom-right rim!
  c.line('l10_chest_telemetry', x0 + 1, y0, x0 + rw - 2, y0, 'M5');
  c.line('l10_chest_telemetry', x0, y0 + 1, x0, y0 + rh - 2, 'M4');
  c.line('l10_chest_telemetry', x0 + 1, y0 + rh - 1, x0 + rw - 2, y0 + rh - 1, 'M0');
  c.line('l10_chest_telemetry', x0 + rw - 1, y0 + 1, x0 + rw - 1, y0 + rh - 2, 'M0');
  // Projected cast shadow directly underneath chest console onto orange suit fabric!
  c.line('l08_suit_torso', x0 + 1, y0 + rh, x0 + rw, y0 + rh, 'S0', 255, 'l08_suit_torso');
  if (detailTier >= 3) c.line('l08_suit_torso', x0 + 2, y0 + rh + 1, x0 + rw, y0 + rh + 1, 'S1', 255, 'l08_suit_torso');

  // Recessed Dark-Marine Oscilloscope Readout Screen
  const pad = detailTier >= 3 ? 2 : 1;
  const sx = x0 + pad;
  const sy = y0 + pad;
  const sw = Math.max(4, Math.round(rw * 0.58));
  const sh = Math.max(3, rh - pad * 2);
  for (let ly = 0; ly < sh; ly++) {
    for (let lx = 0; lx < sw; lx++) {
      c.px('l10_chest_telemetry', sx + lx, sy + ly, ly === 0 ? 'V0' : 'V1');
    }
  }
  // Live glowing acoustic sine waveform + subtle baseline grid!
  const midY = sy + Math.floor(sh / 2);
  for (let lx = 0; lx < sw; lx++) {
    const amp = sh >= 6 ? 2.1 : sh >= 4 ? 1.3 : 0.7;
    const wy = Math.round(midY - Math.sin((lx / Math.max(1, sw - 1)) * Math.PI * 2.5) * amp);
    c.px('l14_specular_vfx', sx + lx, Math.max(sy, Math.min(sy + sh - 1, wy)), harmonicGlow ? 'L3' : 'L2');
  }

  // Right-side tactile rotary dial, green status LED, and ruby hazard indicator!
  const bx = sx + sw + (detailTier >= 4 ? 2 : 1);
  if (bx < x0 + rw - 1) {
    c.px('l14_specular_vfx', bx, sy, harmonicGlow ? 'L3' : 'G7');
    if (sy + 2 < y0 + rh - 1) c.px('l14_specular_vfx', bx, sy + 2, 'R1');
    if (detailTier >= 4 && sy + 4 < y0 + rh - 1) {
      // Tiny silver rotary calibration knob!
      c.fillEllipse('l10_chest_telemetry', bx + 1, sy + 5, 1.5, 1.5, 'M5');
      c.px('l10_chest_telemetry', bx + 1, sy + 5, 'M1');
    }
  }
}

// ============================================================================
// MAIN MASTERPIECE BUILDER — DRIVES ALL 5 RESOLUTIONS & ALL ANIMATION FRAMES!
// ============================================================================

export function buildMaraV4(
  res: MaraV4Res,
  pose: MaraPoseSpec = POSE_HERO_3Q
): { canvas: V4Canvas; vpfJson: string; width: number; height: number } {
  const m = getMaraV4Metrics(res);
  const c = new V4Canvas(m.w, m.h, MARA_V4_LAYERS);
  const sc = m.sc;
  const dt = m.detailTier;
  const isSide = pose.facing === 'side';
  const isScan = pose.holdLens === 'aim_scan';

  // --- ANATOMICAL SKELETON COMPUTATION (True 6.0-Head Heroic Explorer Proportions!) ---
  const thighLen = 22.5 * sc;
  const shinLen = 21.5 * sc;
  const torsoLen = 26.5 * sc;
  const upperArmLen = 15.5 * sc;
  const foreArmLen = 14.5 * sc;

  const restPelvisY = m.groundY - (thighLen + shinLen + 6.5 * sc);
  const pelvisX = m.cx + pose.pelvisDx * sc;
  const pelvisY = restPelvisY + pose.pelvisDy * sc;

  const leanRad = pose.torsoLeanDeg * DEG;
  const shoulderMidX = pelvisX + Math.sin(leanRad) * torsoLen;
  const shoulderMidY = pelvisY - Math.cos(leanRad) * torsoLen;
  const headCx = shoulderMidX + Math.sin((pose.torsoLeanDeg + pose.headPitchDeg) * DEG) * (15.5 * sc);
  const headCy = shoulderMidY - Math.cos((pose.torsoLeanDeg + pose.headPitchDeg) * DEG) * (15.0 * sc);

  // Subtle grounded contact shadow & dynamic foot-dust FX on `l01_ground_fx`!
  const shScale = Math.max(0.55, 1.0 + pose.pelvisDy * 0.03);
  for (let y = Math.floor(m.groundY - 4 * sc); y <= Math.ceil(m.groundY + 5 * sc); y++) {
    for (let x = Math.floor(pelvisX - 24 * sc * shScale); x <= Math.ceil(pelvisX + 24 * sc * shScale); x++) {
      const r = Math.hypot((x - pelvisX) / (22 * sc * shScale), (y - (m.groundY + 1)) / (4.5 * sc * shScale));
      if (r < 1.0) c.px('l01_ground_fx', x, y, 'SH', r < 0.55 ? 110 : 55);
    }
  }
  if (pose.dustPuff && pose.dustPuff !== 'none') {
    const dx = pose.dustPuff === 'rear_kick' ? pelvisX - 18 * sc : pose.dustPuff === 'skid_front' ? pelvisX + 16 * sc : pelvisX;
    for (let p = 0; p < 3; p++) {
      const rx = dx + (p - 1) * 5 * sc;
      const ry = m.groundY - (2 + p * 1.6) * sc;
      c.fillEllipse('l01_ground_fx', rx, ry, (3.2 - p * 0.6) * sc, (2.2 - p * 0.3) * sc, p === 0 ? 'D4' : 'D5');
    }
  }

  // --- 1. LIFE-SUPPORT BACKPACK, RADIATOR, O2 CYLINDER & COILED HOSE ---
  const bpOffsetX = isSide ? -12.5 * sc : -14.8 * sc;
  paintV4BackpackRig(c, shoulderMidX + bpOffsetX, shoulderMidY - 2.5 * sc, sc, dt, pose);

  // --- 2. ARTICULATED KINEMATIC LEGS (Far Leg -> Near Leg; boots on dedicated layers so shins stay rich orange!) ---
  const paintLeg = (
    legLayer: string,
    bootLayer: string,
    hipX: number,
    hipY: number,
    thighDeg: number,
    kneeBendDeg: number,
    footPitchDeg: number,
    lightBias: number
  ) => {
    const [kneeX, kneeY] = rotPt(hipX, hipY, thighLen, thighDeg);
    const shinDeg = thighDeg - kneeBendDeg;
    const [ankleX, ankleY] = rotPt(kneeX, kneeY, shinLen, shinDeg);

    c.paintTaperedSpline(legLayer, [
      [hipX, hipY - 1 * sc, 6.8 * sc],
      [(hipX + kneeX) * 0.5, (hipY + kneeY) * 0.5, 6.2 * sc],
      [kneeX, kneeY, 5.2 * sc],
      [(kneeX + ankleX) * 0.5, (kneeY + ankleY) * 0.5, 4.9 * sc],
      [ankleX, ankleY, 4.1 * sc],
    ], 'S4');

    c.shadeMaskedRegion(legLayer, (hipX + ankleX) * 0.5, (hipY + ankleY) * 0.5, 14 * sc, 24 * sc, SUIT_RAMP, {
      material: 'cloth',
      bias: lightBias,
      foldFn: (_x, y) => Math.sin((y - kneeY) * 0.45 / Math.max(0.4, sc)) * 0.08,
    });

    if (dt >= 3 && lightBias >= 0) {
      const px = (hipX + kneeX) * 0.5 - 3.0 * sc;
      const py = (hipY + kneeY) * 0.5 - 1.5 * sc;
      c.fillPoly(legLayer, [
        [px - 3 * sc, py - 4 * sc], [px + 2.5 * sc, py - 3.5 * sc],
        [px + 2.5 * sc, py + 4 * sc], [px - 3 * sc, py + 3.5 * sc],
      ], 'S2', legLayer);
      c.line(legLayer, px - 2.5 * sc, py - 3 * sc, px + 2 * sc, py - 2.5 * sc, 'S6', 255, legLayer);
      c.px(legLayer, px, py - 1 * sc, 'M4');
    }

    const kpX = kneeX + (isSide ? 2.4 * sc : 0.8 * sc);
    const kpY = kneeY;
    c.fillPoly(legLayer, [
      [kpX - 4.4 * sc, kpY - 3.6 * sc], [kpX + 4.4 * sc, kpY - 3.6 * sc],
      [kpX + 5.0 * sc, kpY + 0.5 * sc], [kpX + 3.6 * sc, kpY + 4.0 * sc],
      [kpX - 3.6 * sc, kpY + 4.0 * sc], [kpX - 5.0 * sc, kpY + 0.5 * sc],
    ], 'B1');
    c.line(legLayer, kpX - 3.5 * sc, kpY - 3.0 * sc, kpX + 2.5 * sc, kpY - 3.0 * sc, 'B4');
    if (dt >= 2) {
      c.px(legLayer, kpX - 2.0 * sc, kpY, 'M4');
      c.px(legLayer, kpX + 2.0 * sc, kpY, 'M3');
    }

    paintArticulatedBoot(c, bootLayer, ankleX, ankleY, footPitchDeg, isSide ? 1.0 : 0.72, sc, dt, lightBias);
  };

  const farHipX = pelvisX + (isSide ? 1.5 * sc : 6.2 * sc);
  const nearHipX = pelvisX + (isSide ? -1.5 * sc : -5.8 * sc);
  paintLeg('l06_far_leg', 'l06b_far_boot', farHipX, pelvisY + 2 * sc, pose.farThighDeg, pose.farKneeBendDeg, pose.farFootPitchDeg, -0.16);
  paintLeg('l07_near_leg', 'l07b_near_boot', nearHipX, pelvisY + 2 * sc, pose.nearThighDeg, pose.nearKneeBendDeg, pose.nearFootPitchDeg, 0.08);

  // --- 3. FAR ARM (Behind torso — holds Parabolic Acoustic Field Lens in 3/4 poses!) ---
  const farShX = shoulderMidX + (isSide ? 3.0 * sc : 11.2 * sc);
  const farShY = shoulderMidY + 3.5 * sc;
  const [farElbX, farElbY] = rotPt(farShX, farShY, upperArmLen, pose.farShoulderDeg);
  const [farHandX, farHandY] = rotPt(farElbX, farElbY, foreArmLen, pose.farShoulderDeg + pose.farElbowBendDeg);
  c.paintTaperedSpline('l05_far_arm', [
    [farShX, farShY, 5.4 * sc],
    [farElbX, farElbY, 4.4 * sc],
    [farHandX, farHandY, 3.6 * sc],
  ], 'S3');
  c.shadeMaskedRegion('l05_far_arm', (farShX + farHandX) * 0.5, (farShY + farHandY) * 0.5, 14 * sc, 16 * sc, SUIT_RAMP, {
    material: 'cloth',
    bias: isScan ? 0.04 : -0.18,
  });
  // Far dark espresso-leather glove + silver wrist-lock cuff
  c.fillEllipse('l05_far_arm', farHandX, farHandY, 4.0 * sc, 3.4 * sc, 'B1');
  c.px('l05_far_arm', farHandX - 1.5 * sc, farHandY - 1.2 * sc, 'B4');
  c.px('l05_far_arm', (farElbX + farHandX * 3) / 4, (farElbY + farHandY * 3) / 4, 'M4');

  // --- 4. TAILORED QUILTED EXOSUIT TORSO (Anatomical Trapezoid Silhouette + Drapery Folds!) ---
  const torsoHalfTop = (isSide ? 9.5 : 13.5) * sc;
  const torsoHalfWaist = (isSide ? 8.2 : 10.6) * sc;
  const torsoHalfHip = (isSide ? 9.2 : 12.2) * sc;
  const pCos = Math.cos(leanRad);
  const pSin = Math.sin(leanRad);
  const tPt = (lx: number, ly: number): [number, number] => [
    pelvisX + lx * pCos - ly * pSin,
    pelvisY + lx * pSin + ly * pCos,
  ];

  const torsoPoly: Array<[number, number]> = [
    tPt(-torsoHalfTop, -torsoLen + 2 * sc),
    tPt(-torsoHalfTop * 0.55, -torsoLen - 1.5 * sc),
    tPt(torsoHalfTop * 0.55, -torsoLen - 1.5 * sc),
    tPt(torsoHalfTop, -torsoLen + 2 * sc),
    tPt(torsoHalfWaist, -torsoLen * 0.25),
    tPt(torsoHalfHip, 3.5 * sc),
    tPt(0, 7.5 * sc),
    tPt(-torsoHalfHip, 3.5 * sc),
    tPt(-torsoHalfWaist, -torsoLen * 0.25),
  ];
  c.fillPoly('l08_suit_torso', torsoPoly, 'S4');
  c.shadeMaskedRegion('l08_suit_torso', (pelvisX + shoulderMidX) * 0.5, (pelvisY + shoulderMidY) * 0.5, 16 * sc, 18 * sc, SUIT_RAMP, {
    material: 'cloth',
    bias: pose.hurtFlash ? 0.22 : 0.04,
    foldFn: (_x, y, nx, ny) => {
      // Realistic diagonal fabric tension folds converging toward waist belt!
      return Math.sin((ny * 5.2 + nx * 1.8)) * 0.07;
    },
    rimBounceToken: isScan ? 'L1' : undefined,
  });

  // Tailored recessed suit seam lines + sunlit lower puff-lips!
  c.carveTailoredSeam(
    'l08_suit_torso',
    [tPt(-torsoHalfTop * 0.85, -torsoLen * 0.72), tPt(0, -torsoLen * 0.65), tPt(torsoHalfTop * 0.85, -torsoLen * 0.72)],
    'S1', 'S0', 'S6', Math.round(shoulderMidX + 2 * sc)
  );
  // Real ~38 deg cast shadow thrown by helmet collar onto upper chest/right shoulder!
  c.fillEllipse('l08_suit_torso', shoulderMidX + 3 * sc, shoulderMidY + 2 * sc, 10 * sc, 3.5 * sc, 'S1', 'l08_suit_torso');

  // --- 5. STITCHED LEATHER HARNESS, UTILITY BELT, POUCHES & SWINGING MOSS SPECIMEN CANISTER ---
  const beltY = -2.5 * sc;
  const beltH = 5.2 * sc;
  // Vertical stitched shoulder-to-belt harness straps!
  if (!isSide) {
    for (const sx of [-7.2 * sc, 5.8 * sc]) {
      const sPoly = [tPt(sx - 1.7 * sc, -torsoLen), tPt(sx + 1.7 * sc, -torsoLen), tPt(sx + 1.5 * sc, beltY), tPt(sx - 1.5 * sc, beltY)];
      c.fillPoly('l09_harness_belt', sPoly, 'B1');
      c.line('l09_harness_belt', ...tPt(sx - 1.2 * sc, -torsoLen + 2 * sc), ...tPt(sx - 1.0 * sc, beltY - 1 * sc), 'B4');
      // Metallic harness D-ring clasp on collarbone!
      if (dt >= 3) {
        const [rx, ry] = tPt(sx, -torsoLen + 4.5 * sc);
        c.fillEllipse('l09_harness_belt', rx, ry, 1.8 * sc, 1.4 * sc, 'M5');
        c.px('l09_harness_belt', rx, ry, 'M1');
      }
    }
  } else {
    // Diagonal side backpack strap across ribcage
    const sPoly = [tPt(-5.5 * sc, -torsoLen + 2 * sc), tPt(-2.2 * sc, -torsoLen + 2 * sc), tPt(1.5 * sc, beltY), tPt(-2.0 * sc, beltY)];
    c.fillPoly('l09_harness_belt', sPoly, 'B1');
    c.line('l09_harness_belt', ...tPt(-4.8 * sc, -torsoLen + 3 * sc), ...tPt(-1.4 * sc, beltY), 'B4');
  }

  // Heavy contoured dark-espresso leather utility belt!
  const beltPoly = [
    tPt(-torsoHalfHip * 1.04, beltY - beltH * 0.5),
    tPt(torsoHalfHip * 1.04, beltY - beltH * 0.5),
    tPt(torsoHalfHip * 1.04, beltY + beltH * 0.5),
    tPt(-torsoHalfHip * 1.04, beltY + beltH * 0.5),
  ];
  c.fillPoly('l09_harness_belt', beltPoly, 'B1');
  c.line('l09_harness_belt', ...tPt(-torsoHalfHip, beltY - beltH * 0.4), ...tPt(torsoHalfHip * 0.4, beltY - beltH * 0.4), 'B4');
  // Cast shadow beneath utility belt onto upper thighs!
  c.line('l08_suit_torso', ...tPt(-torsoHalfHip, beltY + beltH * 0.65), ...tPt(torsoHalfHip, beltY + beltH * 0.65), 'S0', 255, 'l08_suit_torso');

  // Machined brushed-titanium belt buckle + weathered hip field pouch!
  if (!isSide) {
    const [bx, by] = tPt(0.5 * sc, beltY);
    c.fillPoly('l09_harness_belt', [[bx - 3.6 * sc, by - 3.2 * sc], [bx + 3.6 * sc, by - 3.2 * sc], [bx + 3.6 * sc, by + 3.2 * sc], [bx - 3.6 * sc, by + 3.2 * sc]], 'M3');
    c.line('l09_harness_belt', bx - 3 * sc, by - 2.6 * sc, bx + 2.5 * sc, by - 2.6 * sc, 'M6');
    c.px('l09_harness_belt', bx, by, 'M0');
    // Left hip leather pouch
    const [px, py] = tPt(-torsoHalfHip * 0.92, beltY + 1.5 * sc);
    c.fillPoly('l09_harness_belt', [[px - 3.2 * sc, py - 2.8 * sc], [px + 3.2 * sc, py - 2.8 * sc], [px + 3.0 * sc, py + 4.4 * sc], [px - 3.0 * sc, py + 4.4 * sc]], 'B2');
    c.line('l09_harness_belt', px - 2.8 * sc, py - 2.2 * sc, px + 2.5 * sc, py - 2.2 * sc, 'B5');
  }
  // Iconic Glowing Translucent Moss Specimen Canister swinging gently on hip!
  const [vx, vy] = tPt(isSide ? 3.5 * sc : torsoHalfHip * 0.72, beltY + 1.0 * sc);
  paintV4SpecimenCanister(c, vx, vy, pose.vialSwingDeg, sc, dt);

  // --- 6. CHEST TELEMETRY OSCILLOSCOPE CONSOLE ---
  const [rigX, rigY] = tPt(isSide ? 6.8 * sc : 0.8 * sc, -torsoLen * 0.56);
  paintV4ChestRig(c, rigX, rigY, (isSide ? 7.2 : 16.5) * sc, 11.2 * sc, dt, isScan);

  // --- 7. SCULPTED AEROSPACE HELMET SHELL + NECK LOCKING RING + EAR COMM + PANORAMIC GLASS VISOR! ---
  const headRx = 14.5 * sc;
  const headRy = 13.0 * sc;
  // Sculpted segmented brushed-titanium neck locking collar ring!
  c.fillEllipse('l11_helmet_shell', shoulderMidX + 0.8 * sc, shoulderMidY - 2.5 * sc, headRx * 0.82, 4.2 * sc, 'M2');
  c.shadeMaskedRegion('l11_helmet_shell', shoulderMidX + 0.8 * sc, shoulderMidY - 2.5 * sc, headRx * 0.82, 4.2 * sc, METAL_RAMP, { material: 'metal' });

  // Organic contoured aerospace helmet dome (slightly fuller upper brow, refined tapered chin-guard!)
  c.fillEllipse('l11_helmet_shell', headCx, headCy, headRx, headRy, 'S4');
  c.shadeMaskedRegion('l11_helmet_shell', headCx, headCy, headRx, headRy, SUIT_RAMP, {
    material: 'cloth',
    bias: 0.08,
    wobble: 0.04,
  });
  if (isScan) {
    // Crisp cyan bounce highlight strictly along right cheek curve of helmet dome (zero neck drip!)
    c.line('l14_specular_vfx', headCx + headRx * 0.85, headCy - headRy * 0.2, headCx + headRx * 0.82, headCy + headRy * 0.25, 'L2');
  }

  // Iconic Ceramic Ivory-White Dorsal Crown Stripe curving cleanly over helmet top!
  const stHalfW = Math.max(1.2, 2.8 * sc);
  for (let y = Math.floor(headCy - headRy); y <= Math.ceil(headCy - headRy * 0.14); y++) {
    const ny = (y - headCy) / headRy;
    const scx = headCx + 0.6 * sc;
    for (let x = Math.floor(scx - stHalfW); x <= Math.ceil(scx + stHalfW); x++) {
      const nx = (x - headCx) / headRx;
      if (nx * nx + ny * ny > 0.90) continue;
      const isEdge = Math.abs(x - scx) >= stHalfW - 0.65;
      c.px('l11_helmet_shell', x, y, isEdge ? 'M3' : ny < -0.58 ? 'M6' : 'M5');
    }
  }

  // Precision Titanium Ear-Comm Pod + Illuminated Status Pin!
  const earX = headCx - (isSide ? headRx * 0.42 : headRx * 0.84);
  const earW = Math.max(2.4, 5.2 * sc);
  const earH = Math.max(4.0, 8.2 * sc);
  c.fillPoly('l11_helmet_shell', [
    [earX - earW * 0.5, headCy - earH * 0.42], [earX + earW * 0.5, headCy - earH * 0.42],
    [earX + earW * 0.5, headCy + earH * 0.48], [earX - earW * 0.5, headCy + earH * 0.48],
  ], 'M2');
  c.line('l11_helmet_shell', earX - earW * 0.4, headCy - earH * 0.36, earX + earW * 0.3, headCy - earH * 0.36, 'M6');
  c.px('l14_specular_vfx', earX, headCy + 1.0 * sc, isScan ? 'L3' : 'L2');

  // Curved Panoramic Marine-Teal Glass Visor with Sky + Canopy Horizon + Warm Sand Bounce!
  const vcx = headCx + (isSide ? headRx * 0.36 : headRx * 0.16);
  const vcy = headCy + headRy * 0.08;
  const vrx = isSide ? headRx * 0.65 : headRx * 0.70;
  const vry = headRy * 0.58;
  paintV4PanoramicVisor(c, vcx, vcy, vrx, vry, dt, isScan);

  // --- 8. NEAR ARM, ICV MERIDIAN SHOULDER PATCH, GLOVE & PARABOLIC ACOUSTIC FIELD LENS! ---
  const nearShX = shoulderMidX + (isSide ? -2.0 * sc : -12.4 * sc);
  const nearShY = shoulderMidY + 3.2 * sc;
  const [nearElbX, nearElbY] = rotPt(nearShX, nearShY, upperArmLen, pose.nearShoulderDeg);
  const [nearHandX, nearHandY] = rotPt(nearElbX, nearElbY, foreArmLen, pose.nearShoulderDeg + pose.nearElbowBendDeg);

  // Sculpted armored shoulder pauldron + bent sleeve + corrugated elbow crease!
  c.paintTaperedSpline('l13_near_arm_lens', [
    [nearShX, nearShY, 5.8 * sc],
    [nearElbX, nearElbY, 4.7 * sc],
    [nearHandX, nearHandY, 3.8 * sc],
  ], 'S4');
  c.shadeMaskedRegion('l13_near_arm_lens', (nearShX + nearHandX) * 0.5, (nearShY + nearHandY) * 0.5, 16 * sc, 18 * sc, SUIT_RAMP, {
    material: 'cloth',
    bias: 0.14,
  });

  // Iconic Dark-Teal ICV Meridian Shoulder Expedition Patch with Golden Emblem!
  if (dt >= 2) {
    const px = nearShX + (nearElbX - nearShX) * 0.30 - 1.5 * sc;
    const py = nearShY + (nearElbY - nearShY) * 0.30;
    c.fillPoly('l13_near_arm_lens', [
      [px - 2.4 * sc, py - 2.6 * sc], [px + 2.4 * sc, py - 2.4 * sc],
      [px + 2.2 * sc, py + 2.4 * sc], [px - 2.4 * sc, py + 2.2 * sc],
    ], 'V1');
    c.px('l14_specular_vfx', px, py, 'A1'); // golden Meridian crest dot!
    if (dt >= 4) c.px('l14_specular_vfx', px - 1, py - 1, 'V5');
  }

  // Sculpted dark-espresso articulated exo-glove + brushed steel wrist-lock ring!
  c.fillEllipse('l13_near_arm_lens', nearHandX, nearHandY, 4.2 * sc, 3.6 * sc, 'B1');
  c.line('l13_near_arm_lens', nearHandX - 2.5 * sc, nearHandY - 2.0 * sc, nearHandX + 1.5 * sc, nearHandY - 2.2 * sc, 'B4');
  const [cuffX, cuffY] = [(nearElbX + nearHandX * 3) / 4, (nearElbY + nearHandY * 3) / 4];
  c.fillEllipse('l13_near_arm_lens', cuffX, cuffY, 3.6 * sc, 1.5 * sc, 'M4');

  // Parabolic Acoustic Field Lens (held cleanly in far gloved hand on 3/4 poses, OR micro-probe during crouch sampling!)
  if (pose.holdLens !== 'stowed') {
    const lx = isSide ? nearHandX : farHandX;
    const ly = isSide ? nearHandY : farHandY;
    paintV4AcousticFieldLens(c, lx, ly, isScan ? -14 : 0, sc, dt, isScan);
  } else if (pose.microProbe) {
    // Illuminated botanical field micro-probe casting delicate translucent cyan laser scan beam!
    const tipX = nearHandX + 9.5 * sc;
    const tipY = nearHandY + 4.5 * sc;
    c.line('l13_near_arm_lens', nearHandX + 1, nearHandY, tipX, tipY, 'M5');
    c.line('l13_near_arm_lens', nearHandX + 1, nearHandY + 1, tipX - 1, tipY + 1, 'M1');
    c.px('l14_specular_vfx', tipX, tipY, 'L3');
    for (let dy = 1; dy <= Math.round(9 * sc); dy++) {
      const half = Math.round(dy * 0.62);
      for (let dx = -half; dx <= half; dx++) {
        c.blendPx('l14_specular_vfx', tipX + dx + dy * 0.25, tipY + dy, dy <= 3 ? 'L2' : 'L1', Math.max(45, 200 - dy * 18));
      }
    }
  }

  // Selective painterly silhouette contour (strictly excludes ground shadows & glowing VFX!)
  c.applySelectiveSilhouetteContour('l02_silhouette_ink', 'S0', 'S1', true, ['l01_ground_fx', 'l14_specular_vfx']);

  const vpfJson = c.serializeVpf({
    id: `v4_mara_${res}_${pose.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    name: `V4.0 MASTERPIECE — Dr. Mara Lin (${res} · ${pose.name})`,
    pivot: { x: Math.round(m.cx), y: m.groundY },
    tileSize: 32,
    styleNotes: `Art Direction V4.0 native ${res} study (${pose.name}). 14 editable VPF layers, 4-material separation, curved environmental visor reflections, zero upscaling.`,
  });

  return { canvas: c, vpfJson, width: m.w, height: m.h };
}
