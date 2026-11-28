/**
 * VERDANT SIGNAL V5.0 — DR. MARA LIN: A CHARACTER WITH A SOUL
 * ===========================================================
 * 100% pure handcrafted pixel-art anatomy & expressive character sculptor:
 *   - Appealing heroic indie-RPG proportions (~2.7 heads tall @ 64x96, gallery 128x128)
 *   - Flowing weathered signal-crimson & sunlit-amber expedition field scarf tucked
 *     into her dark-navy insulated collar cowl (true fluid secondary cloth arcs!)
 *   - Panoramic curved glass visor reflecting the alien golden sunrise & turquoise
 *     horizon, with a subtle warm human brow/eye silhouette softly visible inside
 *   - Articulated bending boots (heel-strike vs flexed toe-box push-off), tapered
 *     organic limbs, expressive posed gloved hands, ribbed breathing hose, brushed
 *     titanium life-support pack, live emotion-reactive chest telemetry & 3-prong
 *     Parabolic Acoustic Field Lens!
 */

import { createEmptyBuffer, setPixel } from '../engine/pixelBuffer';
import { V4Canvas, V4_COL, blitV4, hash2v4 } from '../v4_masterpiece/v4Core';
import {
  MARA_PORTRAIT_V5_PALETTE,
  blendRgbPx,
  digitizeToCraftedPixelArt,
  hexToRgb,
  loadSquareUnderpaintToGrid,
  serializeBuffersToVpf,
} from './v5PixelEngine';

// Extend V4 palette seamlessly with V5 expressive soul & scarf tokens (pure crisp pixel ramps!)
export const V5_EXTRA_COL: Record<string, { r: number; g: number; b: number }> = {
  // Flowing expedition signal scarf (deep wine shadow -> warm crimson -> sunlit coral-amber edge!)
  C0: { r: 62, g: 18, b: 32 },
  C1: { r: 122, g: 30, b: 44 },
  C2: { r: 186, g: 52, b: 56 },
  C3: { r: 235, g: 108, b: 78 },
  C4: { r: 252, g: 184, b: 112 },
  // Dark insulated navy collar / flexible joint gussets / explorer gloves
  N0: { r: 18, g: 24, b: 38 },
  N1: { r: 34, g: 46, b: 68 },
  N2: { r: 58, g: 76, b: 102 },
  N3: { r: 96, g: 122, b: 152 },
  // Subtle warm human skin/eye glow behind tinted panoramic visor glass
  E0: { r: 148, g: 104, b: 86 },
  E1: { r: 214, g: 164, b: 132 },
  E2: { r: 252, g: 220, b: 184 },
  // Warm golden sunrise rim-light / floral bounce reflection
  U0: { r: 255, g: 214, b: 120 },
  U1: { r: 255, g: 242, b: 196 },
};
for (const [k, v] of Object.entries(V5_EXTRA_COL)) {
  V4_COL[k] = { r: v.r, g: v.g, b: v.b, a: 255 };
}

const SUIT_RAMP = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'];
const LEATHER_RAMP = ['B0', 'B1', 'B2', 'B3', 'B4'];
const METAL_RAMP = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
const NAVY_RAMP = ['N0', 'N1', 'N2', 'N3'];

export type MaraV5Mood = 'calm' | 'wonder' | 'curious' | 'determined' | 'tired' | 'startled' | 'scan';

export interface MaraV5Pose {
  name: string;
  label: string;
  view: 'three_quarter' | 'side_right';
  mood: MaraV5Mood;
  hipDx: number;
  hipDy: number;          // + down (weight sink/crouch), - up (passing/flight)
  torsoLean: number;      // + forward lean, - lean back (skid-stop / wonder / recoil)
  chestExpand: number;    // subtle living breath expansion (-0.4..+0.8)
  headDx: number;
  headDy: number;
  headPitch: number;      // - looking up in wonder, + looking down tired/curious
  // Legs: hip angle (+ forward), knee bend (+ backward flex), footTilt (+ heel strike toe-up, - toe push-off!)
  farHip: number;
  farKnee: number;
  farFootTilt: number;
  nearHip: number;
  nearKnee: number;
  nearFootTilt: number;
  // Arms: shoulder angle (+ forward), elbow bend (+ forward/upward), handPose
  farShoulder: number;
  farElbow: number;
  nearShoulder: number;
  nearElbow: number;
  nearHand: 'relaxed' | 'fist' | 'reach' | 'splay' | 'lens' | 'guard';
  // Secondary living motion!
  packLagY: number;
  packTilt: number;
  antennaLag: number;
  // Flowing expedition scarf control points (dx, dy relative to left neck collar in normalized units!)
  scarfCtrl: Array<[number, number, number]>;
  // Environmental storytelling FX
  dustPuff?: 'behind' | 'ahead' | 'land' | 'none';
  visorBounce?: 'sunrise' | 'cyan' | 'gold';
  floatingOrchid?: boolean; // paints tiny glowing golden Sun-Drop Orchid right beneath her reaching hand!
}

export interface MaraV5Metrics {
  w: number;
  h: number;
  groundY: number;
  s: number;
  hipX: number;
  hipY: number;
  thighL: number;
  shinL: number;
  torsoH: number;
  headR: number;
  armU: number;
  armL: number;
}

export type MaraV5Res = '40x60' | '64x96' | '128x128';

export function getMaraV5Metrics(res: MaraV5Res): MaraV5Metrics {
  if (res === '128x128') {
    return {
      w: 128, h: 128, groundY: 118, s: 1.42,
      hipX: 60, hipY: 75, thighL: 19, shinL: 20,
      torsoH: 25, headR: 15.2, armU: 13.5, armL: 12.5,
    };
  }
  if (res === '40x60') {
    return {
      w: 40, h: 60, groundY: 55, s: 0.625,
      hipX: 19, hipY: 36, thighL: 8.4, shinL: 8.9,
      torsoH: 11.2, headR: 7.0, armU: 6.0, armL: 5.6,
    };
  }
  return {
    w: 64, h: 96, groundY: 88, s: 1.0,
    hipX: 30, hipY: 57, thighL: 13.5, shinL: 14.2,
    torsoH: 17.8, headR: 11.2, armU: 9.6, armL: 9.0,
  };
}

/** Paint curved articulated leg + knee pad + flexing boot onto dedicated limb & boot layers */
function drawSoulLeg(
  c: V4Canvas,
  limbLayer: string,
  bootLayer: string,
  hx: number,
  hy: number,
  hipDeg: number,
  kneeDeg: number,
  footTilt: number,
  m: MaraV5Metrics,
  isFar: boolean
): { fx: number; fy: number } {
  const s = m.s;
  const hRad = (hipDeg * Math.PI) / 180;
  const kRad = ((hipDeg - kneeDeg) * Math.PI) / 180;
  const kx = hx + Math.sin(hRad) * m.thighL;
  const ky = hy + Math.cos(hRad) * m.thighL;
  const ax = kx + Math.sin(kRad) * m.shinL;
  const ay = Math.min(m.groundY - 1.5 * s, ky + Math.cos(kRad) * m.shinL);

  // Organic tapered thigh -> flexible knee -> sculpted calf!
  c.paintTaperedSpline(limbLayer, [
    [hx, hy, 4.3 * s],
    [(hx + kx) * 0.5, (hy + ky) * 0.5, 3.8 * s],
    [kx, ky, 3.2 * s],
    [(kx + ax) * 0.5, (ky + ay) * 0.5, 3.3 * s],
    [ax, ay - 1.2 * s, 2.7 * s],
  ], 'S4');

  const legCx = (hx + ax) * 0.5;
  const legCy = (hy + ay) * 0.5;
  c.shadeMaskedRegion(limbLayer, legCx, legCy, 12 * s, 20 * s, SUIT_RAMP, {
    material: 'cloth',
    bias: isFar ? -0.34 : 0.04,
    foldFn: (_x, y) => (Math.abs(y - ky) < 2.2 * s ? -0.15 : 0),
  });

  // Tailored outer thigh seam + sculpted dark navy knee-pad with sunlit bevel!
  c.line(limbLayer, hx - 0.5 * s, hy + 2 * s, kx - 0.5 * s, ky - 1 * s, isFar ? 'S1' : 'S2');
  c.fillEllipse(limbLayer, kx + 1.0 * s, ky, 3.1 * s, 2.3 * s, isFar ? 'N0' : 'N1');
  c.line(limbLayer, kx - 1.0 * s, ky - 1.2 * s, kx + 2.2 * s, ky - 1.2 * s, isFar ? 'N2' : 'N3', 255, limbLayer);

  // Sculpted nimble expedition boot that ACTUALLY FLEXES (compact silhouette — zero flipper distortion!)
  const toeLen = 3.5 * s;
  const heelLen = 1.8 * s;
  const fRad = (footTilt * Math.PI) / 180;
  const heelX = ax - Math.cos(fRad) * heelLen;
  const heelY = ay + 1.2 * s + Math.sin(fRad) * heelLen;
  const toeX = ax + Math.cos(fRad) * toeLen;
  const toeY = ay + 1.2 * s - Math.sin(fRad) * toeLen;

  // Compact ankle collar + sleek contoured toe-box + crisp lug sole
  c.paintTaperedSpline(bootLayer, [
    [ax, ay - 1.6 * s, 2.5 * s],
    [ax + 0.4 * s, ay + 0.4 * s, 2.3 * s],
    [heelX, heelY, 1.7 * s],
  ], 'B2');
  c.paintTaperedSpline(bootLayer, [
    [ax, ay - 0.2 * s, 2.4 * s],
    [(ax + toeX) * 0.55, (ay + toeY) * 0.55, 2.0 * s],
    [toeX, toeY, 1.45 * s],
  ], 'B2');

  c.shadeMaskedRegion(bootLayer, ax + 0.9 * s, ay, 6.2 * s, 4.5 * s, LEATHER_RAMP, {
    material: 'leather',
    bias: isFar ? -0.30 : 0.10,
    pad: 3,
  });
  c.line(bootLayer, ax - 2.0 * s, ay - 1.8 * s, ax + 2.0 * s, ay - 1.8 * s, isFar ? 'B1' : 'B4', 255, bootLayer);
  c.line(bootLayer, heelX, heelY + 1.3 * s, toeX, toeY + 1.2 * s, 'B0');
  if (!isFar) {
    c.px(bootLayer, toeX - 1.0 * s, toeY - 0.9 * s, 'B4');
  }
  return { fx: (heelX + toeX) * 0.5, fy: Math.max(heelY, toeY) };
}

/** Paint expressive curved arm + padded elbow + posed gloved hand (relaxed / fist / reach / splay / lens / guard!) */
function drawSoulArm(
  c: V4Canvas,
  layer: string,
  sx: number,
  sy: number,
  shDeg: number,
  elDeg: number,
  m: MaraV5Metrics,
  isFar: boolean,
  handType: MaraV5Pose['nearHand']
): { hx: number; hy: number } {
  const s = m.s;
  const sRad = (shDeg * Math.PI) / 180;
  const eRad = ((shDeg + elDeg) * Math.PI) / 180;
  const ex = sx + Math.sin(sRad) * m.armU;
  const ey = sy + Math.cos(sRad) * m.armU;
  const hx = ex + Math.sin(eRad) * m.armL;
  const hy = ey + Math.cos(eRad) * m.armL;

  c.paintTaperedSpline(layer, [
    [sx, sy, 3.5 * s],
    [(sx + ex) * 0.5, (sy + ey) * 0.5, 3.0 * s],
    [ex, ey, 2.7 * s],
    [(ex + hx) * 0.5, (ey + hy) * 0.5, 2.5 * s],
    [hx, hy, 2.2 * s],
  ], 'S4');

  c.shadeMaskedRegion(layer, (sx + hx) * 0.5, (sy + hy) * 0.5, 11 * s, 11 * s, SUIT_RAMP, {
    material: 'cloth',
    bias: isFar ? -0.34 : 0.10,
  });

  // Dark navy ribbed elbow patch & wrist cuff
  c.fillEllipse(layer, ex, ey, 2.2 * s, 2.0 * s, isFar ? 'N0' : 'N1');
  c.fillEllipse(layer, hx, hy, 2.5 * s, 2.3 * s, isFar ? 'N0' : 'N2');
  if (!isFar) c.px(layer, hx - 0.8 * s, hy - 1.0 * s, 'N3');

  // Expressive gloved fingers conveying genuine gesture & emotion!
  const dx = Math.sin(eRad);
  const dy = Math.cos(eRad);
  if (handType === 'reach') {
    // Delicately outstretched curious fingers reaching toward a glowing alien flower!
    c.line(layer, hx, hy, hx + dx * 3.4 * s, hy + dy * 3.4 * s, 'N2');
    c.line(layer, hx, hy + 0.8 * s, hx + dx * 3.0 * s, hy + dy * 2.4 * s + 1.2 * s, 'N1');
    c.px(layer, hx + dx * 3.2 * s, hy + dy * 3.2 * s, 'U0'); // warm golden floral glow on fingertip!
  } else if (handType === 'splay') {
    c.line(layer, hx, hy, hx + dx * 2.8 * s - 1 * s, hy + dy * 2.8 * s - 1 * s, 'N2');
    c.line(layer, hx, hy, hx + dx * 3.0 * s + 1 * s, hy + dy * 3.0 * s + 1 * s, 'N1');
  } else if (handType === 'relaxed' && !isFar) {
    c.px(layer, hx + dx * 2.2 * s, hy + dy * 2.2 * s, 'N1');
  }

  return { hx, hy };
}

/** Paint flowing weathered crimson-and-amber expedition field scarf with true wind-borne pixel arcs! */
function drawFlowingScarf(
  c: V4Canvas,
  backLayer: string,
  frontLayer: string,
  collarX: number,
  collarY: number,
  ctrl: Array<[number, number, number]>,
  s: number,
  warmRim: boolean
): void {
  // Trailing tail tucked behind collar/shoulder onto backLayer (so it wraps cleanly around her body!)
  const pts: Array<[number, number, number]> = ctrl.map(([dx, dy, r]) => [
    collarX + dx * s,
    collarY + dy * s,
    r * s,
  ]);
  // Dark wine under-shadow ribbon
  const shPts: Array<[number, number, number]> = pts.map(([x, y, r]) => [x + 0.5 * s, y + 1.1 * s, r * 0.96]);
  c.paintTaperedSpline(backLayer, shPts, 'C0');
  // Rich crimson body
  c.paintTaperedSpline(backLayer, pts, 'C2');
  // Sunlit coral-amber upper wind-catching fold edge!
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0, r0] = pts[i];
    const [x1, y1, r1] = pts[i + 1];
    c.line(backLayer, x0, y0 - r0 * 0.55, x1, y1 - r1 * 0.55, warmRim ? 'C4' : 'C3');
  }
  // Delicate notched wind-frayed scarf tip
  const [tx, ty] = pts[pts.length - 1];
  c.px(backLayer, tx - 1.2 * s, ty - 0.6 * s, 'C3');
  c.px(backLayer, tx - 0.8 * s, ty + 0.8 * s, 'C1');

  // Snug wrapped collar cowl fold hugging front of neck ring!
  c.fillEllipse(frontLayer, collarX + 0.8 * s, collarY + 0.4 * s, 5.8 * s, 2.4 * s, 'C1');
  c.fillEllipse(frontLayer, collarX + 0.4 * s, collarY - 0.2 * s, 5.2 * s, 1.9 * s, 'C2');
  c.line(frontLayer, collarX - 3.6 * s, collarY - 1.2 * s, collarX + 2.8 * s, collarY - 1.2 * s, warmRim ? 'C4' : 'C3');
}

/** Paint Dr. Mara Lin's 3-prong Parabolic Acoustic Field Lens instrument */
function drawSoulAcousticLens(
  c: V4Canvas,
  layer: string,
  vfxLayer: string,
  hx: number,
  hy: number,
  s: number,
  activeScan: boolean
): void {
  const gx = hx + 2.2 * s;
  const gy = hy - 0.5 * s;
  // Ergonomic angled grip & brushed titanium chassis
  c.fillPoly(layer, [
    [gx - 2.0 * s, gy + 2.5 * s],
    [gx + 0.8 * s, gy + 2.5 * s],
    [gx + 1.5 * s, gy - 1.8 * s],
    [gx - 1.2 * s, gy - 1.8 * s],
  ], 'M2');
  c.fillPoly(layer, [
    [gx - 1.2 * s, gy - 2.2 * s],
    [gx + 6.5 * s, gy - 2.2 * s],
    [gx + 6.5 * s, gy + 1.2 * s],
    [gx - 1.2 * s, gy + 1.2 * s],
  ], 'M4');
  c.line(layer, gx - 1.0 * s, gy - 2.2 * s, gx + 6.0 * s, gy - 2.2 * s, 'M6');

  // 3-prong Parabolic Acoustic Dish cradling glowing turquoise crystal emitter!
  const dx = gx + 7.2 * s;
  const dy = gy - 0.4 * s;
  c.line(layer, dx - 1 * s, dy - 3.6 * s, dx + 2.8 * s, dy - 4.2 * s, 'M5');
  c.line(layer, dx - 1 * s, dy + 3.2 * s, dx + 2.8 * s, dy + 3.8 * s, 'M2');
  c.fillEllipse(layer, dx + 1.2 * s, dy, 2.8 * s, 4.2 * s, 'L0');
  c.fillEllipse(layer, dx + 1.4 * s, dy, 2.0 * s, 3.1 * s, activeScan ? 'L3' : 'L2');
  c.px(layer, dx + 1.6 * s, dy - 0.8 * s, 'W9');

  if (activeScan) {
    // Graceful concentric glowing turquoise sound-wave arcs radiating into the alien air!
    for (const [r, alpha, tok] of [[5.5 * s, 235, 'L3'], [9.2 * s, 175, 'L2'], [13.0 * s, 115, 'L1']] as const) {
      for (let a = -0.82; a <= 0.82; a += 0.12) {
        c.blendPx(vfxLayer, dx + 2.2 * s + Math.cos(a) * r, dy + Math.sin(a) * r * 0.9, tok, alpha);
      }
    }
  }
}

/** Paint tiny glowing golden Sun-Drop Orchid for Mara's Fascination / Curiosity acting pose! */
function drawTinyCuriousOrchid(c: V4Canvas, fxLayer: string, ox: number, oy: number, s: number): void {
  // Soft warm golden radiance halo illuminating Mara's fingers & visor!
  for (let dy = -12 * s; dy <= 10 * s; dy++) {
    for (let dx = -12 * s; dx <= 12 * s; dx++) {
      const d = Math.hypot(dx, dy) / (12 * s);
      if (d < 1.0) c.blendPx(fxLayer, ox + dx, oy - 4 * s + dy, 'U0', Math.round((1 - d) * 85));
    }
  }
  c.line(fxLayer, ox, oy + 4 * s, ox, oy - 3 * s, 'G4');
  c.line(fxLayer, ox, oy + 4 * s, ox - 3 * s, oy + 1 * s, 'G5');
  c.line(fxLayer, ox, oy + 4 * s, ox + 3 * s, oy + 1 * s, 'G3');
  c.fillEllipse(fxLayer, ox, oy - 4 * s, 3.2 * s, 2.6 * s, 'F3');
  c.fillEllipse(fxLayer, ox - 0.5 * s, oy - 4.5 * s, 1.8 * s, 1.5 * s, 'F4');
  c.px(fxLayer, ox - 0.4 * s, oy - 4.8 * s, 'W9');
}

// ============================================================================
// MAIN V5.0 SOULFUL DR. MARA LIN SCULPTOR (40x60 WORLD, 64x96 GAMEPLAY & 128x128 SHOWCASE)
// ============================================================================
export function buildMaraV5(res: MaraV5Res, pose: MaraV5Pose): {
  canvas: V4Canvas;
  vpfJson: string;
  width: number;
  height: number;
} {
  const m = getMaraV5Metrics(res);
  const s = m.s;
  const c = new V4Canvas(m.w, m.h, [
    { id: 'l01_ground_fx', name: '01 Ground Shadow & Footstep Dust Curls' },
    { id: 'l01b_outline', name: '01b Selective Shadow Silhouette Contour' },
    { id: 'l02_scarf_back', name: '02 Flowing Expedition Scarf Tail' },
    { id: 'l03_backpack', name: '03 Titanium Life-Support Pack, O2 Tank & Whip Antenna' },
    { id: 'l04_far_arm', name: '04 Far Articulated Arm & Glove' },
    { id: 'l05_far_leg', name: '05 Far Articulated Leg & Knee Guard' },
    { id: 'l05b_far_boot', name: '05b Far Flexing Leather Boot' },
    { id: 'l06_near_leg', name: '06 Near Articulated Leg & Knee Guard' },
    { id: 'l06b_near_boot', name: '06b Near Flexing Leather Boot' },
    { id: 'l07_torso', name: '07 Sculpted Terracotta Spacesuit Torso & Utility Belt' },
    { id: 'l08_collar_hose', name: '08 Insulated Navy Collar, Scarf Cowl & Ribbed O2 Hose' },
    { id: 'l09_helmet', name: '09 Sculpted Explorer Helmet & Panoramic Soul Visor' },
    { id: 'l10_near_arm', name: '10 Near Articulated Arm, Glove & Acoustic Lens' },
    { id: 'l11_vfx_glow', name: '11 Luminous Scan Waves, Golden Orchid & Specular Glow' },
  ]);

  const leanRad = (pose.torsoLean * Math.PI) / 180;
  const hipX = m.hipX + pose.hipDx * s;
  const hipY = m.hipY + pose.hipDy * s;
  const shX = hipX + Math.sin(leanRad) * m.torsoH;
  const shY = hipY - Math.cos(leanRad) * m.torsoH - pose.chestExpand * s;
  const headX = shX + (pose.headDx + Math.sin(leanRad) * 2.2) * s;
  const headY = shY - (m.headR * 0.92 - pose.headDy) * s;

  const is3Q = pose.view === 'three_quarter';
  const warmRim = pose.visorBounce === 'sunrise' || pose.visorBounce === 'gold';

  // 1. Soft translucent grounded contact shadow + athletic dust curls!
  const airborneLift = Math.max(0, -pose.hipDy);
  const shRx = Math.max(7.5 * s, (13.2 - airborneLift * 0.7) * s);
  const shRy = Math.max(2.0 * s, (3.6 - airborneLift * 0.16) * s);
  const shA = Math.max(48, Math.round(115 - airborneLift * 9));
  for (let y = Math.floor(m.groundY - shRy - 1); y <= Math.ceil(m.groundY + shRy + 1); y++) {
    for (let x = Math.floor(hipX - shRx - 2); x <= Math.ceil(hipX + shRx + 2); x++) {
      const r = Math.hypot((x - (hipX + 1.2 * s)) / shRx, (y - (m.groundY + 1.0 * s)) / shRy);
      if (r < 1.0) c.px('l01_ground_fx', x, y, 'SH', r < 0.62 ? shA : Math.round(shA * 0.48));
    }
  }
  if (pose.dustPuff === 'behind') {
    c.fillEllipse('l01_ground_fx', hipX - 14 * s, m.groundY - 1.5 * s, 4.5 * s, 2.4 * s, 'D4');
    c.fillEllipse('l01_ground_fx', hipX - 19 * s, m.groundY - 3.6 * s, 3.0 * s, 1.8 * s, 'D5');
    c.px('l01_ground_fx', hipX - 22 * s, m.groundY - 5.2 * s, 'W9');
  } else if (pose.dustPuff === 'ahead') {
    c.fillEllipse('l01_ground_fx', hipX + 13 * s, m.groundY - 1.2 * s, 5.2 * s, 2.6 * s, 'D4');
    c.fillEllipse('l01_ground_fx', hipX + 18 * s, m.groundY - 4.0 * s, 3.4 * s, 2.0 * s, 'D5');
    c.px('l01_ground_fx', hipX + 21 * s, m.groundY - 6.0 * s, 'W9');
  } else if (pose.dustPuff === 'land') {
    c.fillEllipse('l01_ground_fx', hipX - 13 * s, m.groundY - 0.8 * s, 4.2 * s, 2.0 * s, 'D4');
    c.fillEllipse('l01_ground_fx', hipX + 14 * s, m.groundY - 0.8 * s, 4.2 * s, 2.0 * s, 'D4');
  }

  // 2. Flowing Expedition Field Scarf (tail behind shoulder + cowl front on l08!)
  drawFlowingScarf(c, 'l02_scarf_back', 'l08_collar_hose', shX - 1.0 * s, shY - 0.8 * s, pose.scarfCtrl, s, warmRim);

  // 3. Brushed Titanium Life-Support Backpack + O2 Cylinder + Whip Antenna!
  const px = shX - (is3Q ? 7.6 : 8.8) * s + Math.sin(((pose.torsoLean + pose.packTilt) * Math.PI) / 180) * -2.5 * s;
  const py = shY + (5.2 + pose.packLagY) * s;
  // Whip Telemetry Antenna bending naturally with velocity & wind!
  const antX = px - 2.6 * s;
  const antY = py - 9.0 * s;
  const antTipX = antX + (-2.4 + pose.antennaLag) * s;
  const antTipY = antY - 13.5 * s;
  c.paintTaperedSpline('l03_backpack', [
    [antX, antY, 0.9 * s],
    [(antX + antTipX) * 0.5 + pose.antennaLag * 0.25 * s, (antY + antTipY) * 0.5, 0.7 * s],
    [antTipX, antTipY, 0.55 * s],
  ], 'M4');
  c.fillEllipse('l03_backpack', antTipX, antTipY, 1.15 * s, 1.15 * s, 'R1');
  c.px('l11_vfx_glow', antTipX, antTipY, 'W9');

  // Sculpted dorsal pack + vertical cylinder + crimson pressure valve!
  c.fillPoly('l03_backpack', [
    [px - 4.2 * s, py - 8.8 * s],
    [px + 3.4 * s, py - 8.0 * s],
    [px + 3.0 * s, py + 7.6 * s],
    [px - 4.6 * s, py + 7.0 * s],
  ], 'M3');
  c.fillEllipse('l03_backpack', px - 4.8 * s, py + 0.2 * s, 3.2 * s, 7.6 * s, 'M4');
  c.shadeMaskedRegion('l03_backpack', px - 1.5 * s, py, 7.5 * s, 9.5 * s, METAL_RAMP, {
    material: 'metal',
    bias: 0.14,
  });
  c.fillEllipse('l03_backpack', px - 4.8 * s, py - 8.2 * s, 2.0 * s, 1.6 * s, 'R1');
  c.line(c.cels.l03_backpack ? 'l03_backpack' : 'l03_backpack', px - 7.4 * s, py - 2.0 * s, px - 2.2 * s, py - 2.0 * s, 'S5');
  c.line('l03_backpack', px - 7.4 * s, py + 3.0 * s, px - 2.2 * s, py + 3.0 * s, 'N1');

  // 4. Far Arm & Far/Near Articulated Legs + Flexing Boots!
  const farShX = shX + (is3Q ? 5.6 : 2.8) * s;
  const farShY = shY + 1.8 * s;
  drawSoulArm(c, 'l04_far_arm', farShX, farShY, pose.farShoulder, pose.farElbow, m, true, 'relaxed');

  drawSoulLeg(
    c, 'l05_far_leg', 'l05b_far_boot',
    hipX + (is3Q ? 3.5 : 1.5) * s, hipY,
    pose.farHip, pose.farKnee, pose.farFootTilt, m, true
  );
  drawSoulLeg(
    c, 'l06_near_leg', 'l06b_near_boot',
    hipX - (is3Q ? 3.0 : 1.0) * s, hipY,
    pose.nearHip, pose.nearKnee, pose.nearFootTilt, m, false
  );

  // 5. Sculpted Explorer Spacesuit Torso (Graceful Waist Taper, Chest Monitor, Leather Belt & Specimen Vial!)
  const chestW = (is3Q ? 8.2 : 6.8) * s + pose.chestExpand * 0.55 * s;
  const waistW = (is3Q ? 6.6 : 5.6) * s;
  const hipW = (is3Q ? 7.4 : 6.1) * s;
  const midX = (hipX + shX) * 0.5;
  const midY = (hipY + shY) * 0.5;

  c.fillPoly('l07_torso', [
    [shX - chestW, shY + 0.5 * s],
    [shX + chestW, shY + 0.5 * s],
    [midX + waistW, midY + 2.8 * s],
    [hipX + hipW, hipY + 1.5 * s],
    [hipX - hipW, hipY + 1.5 * s],
    [midX - waistW, midY + 2.8 * s],
  ], 'S4');
  // Rounded sculpted shoulders
  c.fillEllipse('l07_torso', shX - chestW * 0.62, shY + 1.6 * s, 4.2 * s, 3.6 * s, 'S5');
  c.fillEllipse('l07_torso', shX + chestW * 0.62, shY + 1.6 * s, 3.8 * s, 3.4 * s, 'S3');

  c.shadeMaskedRegion('l07_torso', midX, midY, 9.5 * s, 12.5 * s, SUIT_RAMP, {
    material: 'cloth',
    bias: 0.08,
    foldFn: (_x, y) => Math.sin((y - midY) * 0.65) * 0.08,
  });

  // Dark Navy Shoulder Harness Straps + Heavy Leather Utility Belt & Brushed Metal Buckle!
  c.line('l07_torso', shX - 4.2 * s, shY + 1.5 * s, hipX - 3.6 * s, hipY - 1.8 * s, 'N1');
  c.line('l07_torso', shX + 3.6 * s, shY + 1.5 * s, hipX + 3.2 * s, hipY - 1.8 * s, 'N0');
  const beltY = hipY - 1.8 * s;
  c.fillPoly('l07_torso', [
    [hipX - hipW - 0.4 * s, beltY - 1.8 * s],
    [hipX + hipW + 0.4 * s, beltY - 1.8 * s],
    [hipX + hipW + 0.2 * s, beltY + 1.8 * s],
    [hipX - hipW - 0.2 * s, beltY + 1.8 * s],
  ], 'B1');
  c.line('l07_torso', hipX - hipW, beltY - 1.8 * s, hipX + hipW * 0.5, beltY - 1.8 * s, 'B4');
  c.fillPoly('l07_torso', [
    [hipX - 1.5 * s, beltY - 1.8 * s],
    [hipX + 2.2 * s, beltY - 1.8 * s],
    [hipX + 2.2 * s, beltY + 1.6 * s],
    [hipX - 1.5 * s, beltY + 1.6 * s],
  ], 'M5');
  c.px('l07_torso', hipX + 0.4 * s, beltY - 0.2 * s, 'M2');

  // Glowing Emerald Specimen Vial clipped cleanly to her hip belt!
  const vx = hipX + (is3Q ? 4.4 : 3.2) * s;
  const vy = beltY + 3.2 * s;
  c.fillPoly('l07_torso', [
    [vx - 1.8 * s, vy - 2.6 * s], [vx + 1.8 * s, vy - 2.6 * s],
    [vx + 1.8 * s, vy + 2.8 * s], [vx - 1.8 * s, vy + 2.8 * s],
  ], 'M2');
  c.fillPoly('l07_torso', [
    [vx - 1.1 * s, vy - 1.4 * s], [vx + 1.1 * s, vy - 1.4 * s],
    [vx + 1.1 * s, vy + 2.0 * s], [vx - 1.1 * s, vy + 2.0 * s],
  ], 'G6');
  c.px('l11_vfx_glow', vx - 0.4 * s, vy - 0.5 * s, 'G8');

  // Live Emotion-Reactive Chest Telemetry Monitor!
  const cxM = midX + (is3Q ? 1.0 : 3.2) * s;
  const cyM = shY + 7.2 * s;
  const mw = (is3Q ? 4.6 : 3.4) * s;
  const mh = 3.6 * s;
  c.fillPoly('l07_torso', [[cxM - mw, cyM - mh], [cxM + mw, cyM - mh], [cxM + mw, cyM + mh], [cxM - mw, cyM + mh]], 'M2');
  c.line('l07_torso', cxM - mw, cyM - mh, cxM + mw, cyM - mh, 'M6');
  c.fillPoly('l07_torso', [[cxM - mw + 1.1 * s, cyM - mh + 1.1 * s], [cxM + mw - 1.1 * s, cyM - mh + 1.1 * s], [cxM + mw - 1.1 * s, cyM + mh - 1.1 * s], [cxM - mw + 1.1 * s, cyM + mh - 1.1 * s]], 'V0');
  // Live telemetry pulse varies with Mara's mood!
  const waveCol = pose.mood === 'startled' ? 'R1' : pose.mood === 'curious' ? 'U0' : 'L3';
  const amp = pose.mood === 'determined' || pose.mood === 'startled' ? 1.6 * s : pose.mood === 'tired' ? 0.5 * s : 1.1 * s;
  c.line('l07_torso', cxM - mw + 1.8 * s, cyM, cxM - 0.6 * s, cyM - amp, waveCol);
  c.line('l07_torso', cxM - 0.6 * s, cyM - amp, cxM + 0.8 * s, cyM + amp, waveCol);
  c.line('l07_torso', cxM + 0.8 * s, cyM + amp, cxM + mw - 1.8 * s, cyM - 0.3 * s, waveCol);

  // 6. Dark Navy Collar Ring + Ribbed Breathing Hose curving smoothly from pack into collar!
  c.fillEllipse('l08_collar_hose', shX + 0.4 * s, shY + 1.0 * s, 6.4 * s, 2.3 * s, 'N1');
  c.line('l08_collar_hose', shX - 4.8 * s, shY + 0.2 * s, shX + 4.4 * s, shY + 0.2 * s, 'M5');
  c.paintTaperedSpline('l08_collar_hose', [
    [px - 0.8 * s, py - 6.8 * s, 1.5 * s],
    [px + 2.5 * s, shY - 3.5 * s, 1.45 * s],
    [shX - 2.6 * s, shY + 0.2 * s, 1.4 * s],
  ], 'N1');
  c.px('l08_collar_hose', px + 1.8 * s, shY - 4.0 * s, 'N3');

  // 7. SCULPTED EXPLORER HELMET & PANORAMIC SOUL VISOR (Skyline Reflection + Subtle Human Gaze!)
  const hr = m.headR;
  c.fillEllipse('l09_helmet', headX, headY, hr * 1.02, hr * 0.98, 'S4');
  // Subtle rounded ear-comm audio dome on near temple
  c.fillEllipse('l09_helmet', headX - hr * 0.85, headY + 0.5 * s, 2.4 * s, 3.0 * s, 'M3');
  c.px('l09_helmet', headX - hr * 0.90, headY - 0.5 * s, 'M6');
  c.shadeMaskedRegion('l09_helmet', headX, headY, hr * 1.06, hr * 1.02, SUIT_RAMP, {
    material: 'cloth',
    bias: 0.14,
  });
  // Warm golden morning sunrise crown rim highlight!
  if (warmRim) {
    for (let a = Math.PI * 1.08; a <= Math.PI * 1.62; a += 0.10) {
      c.px('l09_helmet', headX + Math.cos(a) * (hr * 0.90), headY + Math.sin(a) * (hr * 0.86), 'U0');
    }
  }
  // Crisp curved white/titanium dorsal helmet stripe!
  c.line('l09_helmet', headX - 1.5 * s, headY - hr * 0.92, headX + 1.8 * s, headY - hr * 0.54, 'M6', 255, 'l09_helmet');

  // PANORAMIC CURVED GLASS VISOR (With Reflected Alien Horizon + Subtle Warm Human Eyes Inside!)
  const vxC = headX + (is3Q ? 2.4 : 4.2) * s;
  const vyC = headY + (0.6 + pose.headPitch * 4.2) * s;
  const vRx = (is3Q ? 7.6 : 6.5) * s;
  const vRy = 5.6 * s;

  // Brushed dark metal visor bezel gasket
  c.fillEllipse('l09_helmet', vxC, vyC, vRx + 1.1 * s, vRy + 1.0 * s, 'N0');
  c.fillEllipse('l09_helmet', vxC, vyC, vRx, vRy, 'V1');

  // Paint curved atmospheric glass reflection pixel-by-pixel inside visor!
  for (let y = Math.floor(vyC - vRy); y <= Math.ceil(vyC + vRy); y++) {
    const ny = (y + 0.5 - vyC) / vRy;
    for (let x = Math.floor(vxC - vRx); x <= Math.ceil(vxC + vRx); x++) {
      const nx = (x + 0.5 - vxC) / vRx;
      if (nx * nx + ny * ny > 1.0) continue;

      let tok = 'V1';
      // Upper-left luminous sky & golden sunrise horizon curve reflected across curved visor dome!
      const curveHorizon = -0.05 + nx * nx * 0.22;
      if (ny < curveHorizon - 0.42) {
        tok = pose.visorBounce === 'gold' ? 'U0' : 'V4';
      } else if (ny < curveHorizon - 0.10) {
        tok = pose.visorBounce === 'gold' ? 'F4' : pose.visorBounce === 'sunrise' ? 'U0' : 'V3';
      } else if (ny < curveHorizon + 0.14) {
        tok = pose.visorBounce === 'cyan' ? 'L3' : 'V2';
      } else if (ny > 0.54) {
        // Warm golden chest-suit/earth bounce along lower visor chin curve!
        tok = pose.visorBounce === 'gold' ? 'F3' : pose.visorBounce === 'cyan' ? 'L2' : 'S5';
      } else {
        tok = 'V1';
      }
      c.px('l09_helmet', x, y, tok);
    }
  }

  // SUBTLE WARM HUMAN SOUL BEHIND THE TINTED GLASS (Softly visible warm eyes/brow — gives Mara unmistakable humanity!)
  const eyeY = vyC + (0.6 + pose.headPitch * 1.4) * s;
  const eyeOff = is3Q ? 2.1 * s : 1.4 * s;
  if (pose.mood === 'tired') {
    // Gently lowered heavy lids
    c.line('l09_helmet', vxC - eyeOff - 0.8 * s, eyeY + 0.6 * s, vxC - eyeOff + 0.8 * s, eyeY + 0.6 * s, 'E1');
    if (is3Q) c.line('l09_helmet', vxC + eyeOff - 0.8 * s, eyeY + 0.6 * s, vxC + eyeOff + 0.8 * s, eyeY + 0.6 * s, 'E1');
  } else {
    // Soft luminous warm skin-glow hint + tiny expressive dark gaze dots subtly caught behind tinted glass!
    c.fillEllipse('l09_helmet', vxC + (is3Q ? 0.3 : 1.0) * s, eyeY + 0.5 * s, 3.6 * s, 1.8 * s, 'E0');
    c.px('l09_helmet', vxC - eyeOff * 0.7, eyeY + 0.2 * s, 'E2');
    c.px('l09_helmet', vxC - eyeOff * 0.7 + 0.9 * s, eyeY + 0.2 * s, 'V0');
    if (is3Q) {
      c.px('l09_helmet', vxC + eyeOff * 0.9, eyeY + 0.2 * s, 'E2');
      c.px('l09_helmet', vxC + eyeOff * 0.9 + 0.9 * s, eyeY + 0.2 * s, 'V0');
    }
  }
  // Crisp curved glass crescent specular highlight in upper-left visor corner!
  c.line('l09_helmet', vxC - vRx * 0.58, vyC - vRy * 0.42, vxC - vRx * 0.16, vyC - vRy * 0.66, 'W9');
  c.px('l09_helmet', vxC - vRx * 0.66, vyC - vRy * 0.22, 'U1');

  // 8. Near Articulated Arm + Expressive Hand + Optional Parabolic Acoustic Field Lens / Glowing Orchid!
  const nearShX = shX - (is3Q ? 6.4 : 2.2) * s;
  const nearShY = shY + 2.0 * s;
  const hand = drawSoulArm(c, 'l10_near_arm', nearShX, nearShY, pose.nearShoulder, pose.nearElbow, m, false, pose.nearHand);

  if (pose.nearHand === 'lens') {
    drawSoulAcousticLens(c, 'l10_near_arm', 'l11_vfx_glow', hand.hx, hand.hy, s, pose.mood === 'scan');
  }
  if (pose.floatingOrchid) {
    drawTinyCuriousOrchid(c, 'l11_vfx_glow', hand.hx + 5.8 * s, hand.hy + 3.8 * s, s);
  }

  // Selective artistic silhouette contour (lineless on sunlit upper-left crests, deep cool plum on underside/right!)
  c.applySelectiveSilhouetteContour('l01b_outline', 'S0', 'S1', true, ['l01_ground_fx', 'l11_vfx_glow']);

  const vpfJson = c.serializeVpf({
    id: `v5_mara_${res}_${pose.name}`,
    name: `V5.0 SOUL — Dr. Mara Lin (${pose.label}, ${res})`,
    pivot: { x: Math.round(m.w / 2), y: m.groundY },
    tileSize: 32,
    styleNotes: `Art Direction V5.0 Soul of Pixel Art — bespoke handcrafted Dr. Mara Lin (${pose.label}), flowing expedition scarf, warm sunrise visor reflection & human silhouette gaze.`,
  });

  return { canvas: c, vpfJson, width: m.w, height: m.h };
}

// ============================================================================
// GALLERY-GRADE 128x128 CLOSE-UP EMOTIONAL PORTRAIT STUDY (THE SOUL OF MARA!)
// ============================================================================
export function buildMaraV5CloseUpPortrait128(): {
  canvas: V4Canvas;
  vpfJson: string;
  width: number;
  height: number;
} {
  const W = 128;
  const H = 128;
  const c = new V4Canvas(W, H, [
    { id: 'l01_morning_bg', name: '01 Soft Alien Sunrise Coastal Backdrop' },
    { id: 'l02_scarf_back', name: '02 Flowing Wind-Tossed Signal Scarf' },
    { id: 'l03_shoulders_pack', name: '03 Terracotta Shoulders, Pack & Antenna' },
    { id: 'l04_collar_scarf', name: '04 Insulated Collar Cowl & Ribbed Hose' },
    { id: 'l05_helmet_visor', name: '05 Sculpted Explorer Helmet & Soulful Panoramic Visor' },
    { id: 'l06_light_motes', name: '06 Morning Sun Rim-Light & Drifting Spores' },
  ]);

  // 1. Soft painterly sunrise coastal atmosphere behind portrait (warm peach-gold left -> cool misty teal right!)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const t = (x / W) * 0.65 + (y / H) * 0.35;
      const band = Math.floor(t * 6 + ((x ^ y) & 1) * 0.18);
      const sky = ['U1', 'U0', 'S6', 'V4', 'V3', 'V2', 'V1'][Math.max(0, Math.min(6, band))];
      c.px('l01_morning_bg', x, y, sky);
    }
  }
  // Distant misty mountain silhouette along lower horizon
  for (let x = 0; x < W; x++) {
    const my = 96 + Math.sin(x * 0.04) * 8 + Math.cos(x * 0.09) * 4;
    for (let y = Math.round(my); y < H; y++) c.px('l01_morning_bg', x, y, 'V1');
  }

  // 2. Flowing crimson-amber expedition scarf streaming softly right in the coastal morning breeze!
  c.paintTaperedSpline('l02_scarf_back', [
    [68, 92, 9], [86, 98, 10], [104, 92, 8.5], [118, 86, 5.5], [125, 89, 2.5],
  ], 'C1');
  c.paintTaperedSpline('l02_scarf_back', [
    [70, 90, 7], [86, 95, 7.5], [103, 90, 6.2], [117, 85, 3.8],
  ], 'C2');
  c.line('l02_scarf_back', 74, 84, 116, 82, 'C4');

  // 3. Life-support backpack crest & whipping antenna rising cleanly behind left shoulder
  c.paintTaperedSpline('l03_shoulders_pack', [[24, 96, 2.2], [20, 56, 1.8], [16, 20, 1.2]], 'M4');
  c.fillEllipse('l03_shoulders_pack', 16, 20, 2.8, 2.8, 'R1');
  c.px('l06_light_motes', 15, 19, 'W9');
  c.fillEllipse('l03_shoulders_pack', 26, 98, 14, 24, 'M3');
  c.shadeMaskedRegion('l03_shoulders_pack', 26, 98, 14, 24, METAL_RAMP, { material: 'metal', bias: 0.14 });
  c.fillEllipse('l03_shoulders_pack', 22, 75, 5.5, 4.2, 'R1');

  // Broad sculpted burnt-terracotta spacesuit shoulders + leather harness + chest telemetry corner!
  c.fillEllipse('l03_shoulders_pack', 62, 118, 42, 28, 'S4');
  c.shadeMaskedRegion('l03_shoulders_pack', 62, 118, 42, 28, SUIT_RAMP, {
    material: 'cloth',
    bias: 0.12,
    foldFn: (x, y) => Math.sin((x - 62) * 0.18 + y * 0.1) * 0.08,
  });
  // Golden morning sunrise rim highlight kissing her left shoulder!
  for (let a = Math.PI * 1.05; a <= Math.PI * 1.48; a += 0.06) {
    c.px('l03_shoulders_pack', 62 + Math.cos(a) * 41, 118 + Math.sin(a) * 27, 'U0');
    c.px('l03_shoulders_pack', 62 + Math.cos(a) * 40, 118 + Math.sin(a) * 26, 'U1');
  }
  c.fillPoly('l03_shoulders_pack', [[40, 96], [49, 96], [52, 127], [41, 127]], 'N1');
  c.fillPoly('l03_shoulders_pack', [[76, 96], [85, 96], [88, 127], [77, 127]], 'N0');
  // Glowing cyan chest console top edge peeking cleanly at bottom center!
  c.fillPoly('l03_shoulders_pack', [[54, 112], [74, 112], [74, 127], [54, 127]], 'M3');
  c.fillPoly('l03_shoulders_pack', [[57, 115], [71, 115], [71, 126], [57, 126]], 'V0');
  c.line('l03_shoulders_pack', 59, 121, 63, 118, 'L3');
  c.line('l03_shoulders_pack', 63, 118, 66, 123, 'L3');
  c.line('l03_shoulders_pack', 66, 123, 69, 119, 'L3');

  // 4. Insulated navy neck collar ring + warm sunlit crimson scarf wrap + ribbed hose!
  c.fillEllipse('l04_collar_scarf', 62, 92, 26, 9.5, 'N1');
  c.line('l04_collar_scarf', 38, 89, 86, 89, 'M5');
  c.fillEllipse('l04_collar_scarf', 63, 95, 25, 8.2, 'C1');
  c.fillEllipse('l04_collar_scarf', 62, 93, 23, 6.4, 'C2');
  c.line('l04_collar_scarf', 42, 90, 74, 89, 'C4');
  c.paintTaperedSpline('l04_collar_scarf', [[28, 88, 4.5], [38, 84, 4.2], [47, 92, 4.0]], 'N1');
  c.px('l04_collar_scarf', 36, 82, 'N3');

  // 5. HEROIC SCULPTED EXPLORER HELMET (Centerpiece!)
  const hx = 62;
  const hy = 54;
  const hr = 36;
  c.fillEllipse('l05_helmet_visor', hx, hy, hr * 1.02, hr * 0.96, 'S4');
  // Brushed titanium ear-comm pod on left temple
  c.fillEllipse('l05_helmet_visor', hx - 34, hy + 4, 7.5, 11.5, 'M3');
  c.shadeMaskedRegion('l05_helmet_visor', hx - 34, hy + 4, 7.5, 11.5, METAL_RAMP, { material: 'metal', bias: 0.16, clipEllipse: true });
  c.shadeMaskedRegion('l05_helmet_visor', hx, hy, hr * 1.04, hr * 0.98, SUIT_RAMP, {
    material: 'cloth',
    bias: 0.15,
    clipEllipse: true,
  });
  // Crisp white dorsal racing stripe & warm golden morning rim-light along helmet crown!
  c.fillPoly('l05_helmet_visor', [[56, 20], [66, 20], [69, 34], [58, 34]], 'M6');
  for (let a = Math.PI * 1.06; a <= Math.PI * 1.66; a += 0.04) {
    c.px('l05_helmet_visor', hx + Math.cos(a) * (hr - 1), hy + Math.sin(a) * (hr * 0.95 - 1), 'U1');
    c.px('l05_helmet_visor', hx + Math.cos(a) * (hr - 2), hy + Math.sin(a) * (hr * 0.95 - 2), 'U0');
  }

  // PANORAMIC CURVED GLASS VISOR — SHOWING WARM SUNRISE OCEAN REFLECTION + MARA'S GENTLE HUMAN GAZE!
  const vx = 67;
  const vy = 56;
  const vRx = 26;
  const vRy = 19.5;
  c.fillEllipse('l05_helmet_visor', vx, vy, vRx + 2.5, vRy + 2.2, 'N0');
  c.fillEllipse('l05_helmet_visor', vx, vy, vRx + 1.2, vRy + 1.0, 'M3');

  for (let y = Math.floor(vy - vRy); y <= Math.ceil(vy + vRy); y++) {
    const ny = (y + 0.5 - vy) / vRy;
    for (let x = Math.floor(vx - vRx); x <= Math.ceil(vx + vRx); x++) {
      const nx = (x + 0.5 - vx) / vRx;
      if (nx * nx + ny * ny > 1.0) continue;

      // Curved reflected alien morning horizon!
      const hCurve = -0.14 + nx * nx * 0.24;
      let tok = 'V1';
      if (ny < hCurve - 0.36) tok = 'V4'; // pale turquoise morning sky
      else if (ny < hCurve - 0.10) tok = nx < 0.2 ? 'U1' : 'U0'; // radiant golden sunrise glow!
      else if (ny < hCurve + 0.10) tok = 'S6'; // warm apricot horizon band
      else if (ny < hCurve + 0.36) tok = 'V2'; // reflected teal ocean swells
      else if (ny > 0.68) tok = 'S5'; // warm lower suit bounce reflection
      else tok = 'V1';
      c.px('l05_helmet_visor', x, y, tok);
    }
  }

  // GENTLE HUMAN FACE SILHOUETTE SOFTLY BACKLIT INSIDE TINTED GLASS (THE SOUL OF DR. MARA LIN!)
  // Soft warm sunlit cheek & bridge of nose + expressive focused dark eyes with tiny golden sunrise catchlights!
  c.fillEllipse('l05_helmet_visor', vx + 1, vy + 3, 14, 9, 'E0');
  c.fillEllipse('l05_helmet_visor', vx - 3, vy + 2, 7, 5, 'E1');
  // Subtle dark stray hair lock framing her left temple inside helmet
  c.paintTaperedSpline('l05_helmet_visor', [[vx - 15, vy - 2, 3.0], [vx - 13, vy + 6, 2.2], [vx - 11, vy + 11, 1.2]], 'N0');
  // Expressive gentle eyes gazing warmly toward the sunrise horizon!
  for (const [ex, ey] of [[vx - 6, vy + 2], [vx + 7, vy + 2]]) {
    c.fillEllipse('l05_helmet_visor', ex, ey, 3.2, 2.4, 'E2');
    c.fillEllipse('l05_helmet_visor', ex + 0.4, ey, 2.0, 2.1, 'N0');
    c.px('l05_helmet_visor', ex - 0.4, ey - 0.8, 'U1'); // tiny golden sunrise catchlight in her eyes!!
    // Soft arched eyebrow above
    c.line('l05_helmet_visor', ex - 3.2, ey - 3.4, ex + 2.6, ey - 3.8, 'B1');
  }
  // Subtle warm hint of a quiet amazed smile
  c.line('l05_helmet_visor', vx - 2, vy + 10, vx + 3, vy + 9.5, 'E1');

  // Sweeping curved glossy glass specular arcs across upper-left visor dome (integrating face naturally behind glass!)
  for (let i = 0; i < 16; i++) {
    const t = i / 15;
    const gx = vx - 18 + t * 14;
    const gy = vy - 7 - Math.sin(t * Math.PI * 0.72) * 8;
    c.fillEllipse('l06_light_motes', gx, gy, 1.5, 1.2, 'W9');
  }
  c.fillEllipse('l06_light_motes', vx - 19, vy - 1, 1.6, 1.4, 'U1');

  // Delicate floating golden morning pollen motes drifting past her helmet!
  for (const [mx, my, tok] of [[24, 42, 'U1'], [104, 34, 'U0'], [96, 62, 'L3'], [18, 72, 'U0'], [114, 52, 'U1']] as const) {
    c.blendPx('l06_light_motes', mx, my, tok, 120);
    c.px('l06_light_motes', mx, my, 'W9');
  }

  const vpfJson = c.serializeVpf({
    id: 'v5_mara_soul_portrait_128x128_legacy',
    name: 'V5.0 SOUL — Dr. Mara Lin Procedural Portrait Study (128x128)',
    pivot: { x: 64, y: 64 },
    tileSize: 32,
    styleNotes: 'Legacy procedural portrait helper.',
  });
  return { canvas: c, vpfJson, width: W, height: H };
}

// ============================================================================
// MASTER 48-COLOR 128x128 SOULFUL PORTRAIT + 6-FRAME LIVING BLINK & BREEZE GIF!
// ============================================================================
export function buildMaraV5MasterPortrait128(underpaintPath: string): {
  basePixels: Uint8ClampedArray;
  frames: Uint8ClampedArray[];
  vpfJson: string;
  width: number;
  height: number;
} {
  const S = 128;
  const raw = loadSquareUnderpaintToGrid(underpaintPath, S, 2);
  const digitized = digitizeToCraftedPixelArt(raw, S, S, MARA_PORTRAIT_V5_PALETTE, {
    ditherThreshold: 0.040,
    ditherStrength: 0.020,
    cleanPasses: 2,
  });

  // Hand-pixel identity refinement: seamlessly blend over the tiny sleeve patch (x=104..111, y=109..123)
  // with angled curved terracotta suit fabric + a subtle warm ICV Meridian cyan-gold mission stripe!
  const colSuitHi = hexToRgb('#eb8442');
  const colSuitMid = hexToRgb('#cf602c');
  const colSuitSh = hexToRgb('#a84222');
  const colMeridianCyan = hexToRgb('#33adb3');
  const colMeridianGold = hexToRgb('#ffe5a8');
  const colSuitSeam = hexToRgb('#7a2c1e');
  for (let y = 109; y <= 123; y++) {
    const tilt = Math.round((y - 115) * 0.28);
    for (let dx = 0; dx < 9; dx++) {
      const x = 104 + dx + tilt;
      if (x >= S) continue;
      // Only overwrite pixels inside the original patch region (preserve surrounding suit highlight & crease)
      const isPatchCore = y >= 111 && y <= 121 && dx >= 1 && dx <= 6;
      const isBorder = y >= 110 && y <= 122 && dx >= 0 && dx <= 7 && !isPatchCore;
      if (isPatchCore) {
        const col =
          y >= 114 && y <= 116
            ? colMeridianCyan
            : y === 117
              ? colMeridianGold
              : dx <= 2
                ? colSuitSh
                : colSuitMid;
        setPixel(digitized.pixels, S, S, x, y, { ...col, a: 255 });
      } else if (isBorder) {
        setPixel(digitized.pixels, S, S, x, y, { ...(dx >= 6 ? colSuitHi : colSuitSeam), a: 255 });
      }
    }
  }

  // Hand-author 6 living portrait frames: subtle gentle blink (frame 4), soft scarf wind-tip flutter,
  // shimmering sunrise glint across her curved glass visor & floating morning pollen motes!
  const colSkinLid = hexToRgb('#d99370');
  const colLash = hexToRgb('#1c1a26');
  const colCatch = hexToRgb('#fff8de');
  const colGlint = hexToRgb('#ebfffa');
  const colGold = hexToRgb('#ffe5a8');
  const colCyan = hexToRgb('#60d9d6');

  const frames: Uint8ClampedArray[] = [];
  let f0Fx = createEmptyBuffer(S, S);

  for (let f = 0; f < 6; f++) {
    const t = f / 6;
    const ph = t * Math.PI * 2;
    const fr = new Uint8ClampedArray(digitized.pixels);
    const fx = createEmptyBuffer(S, S);

    // Subtle crisp eye catchlight sparkle + natural peaceful blink on frame 4!
    if (f === 4) {
      // Gentle warm closed eyelids resting peacefully across both eyes (left eye ~x=63..71, y=50..54; right ~x=83..89, y=51..54)
      for (let x = 63; x <= 71; x++) {
        setPixel(fr, S, S, x, 50, { ...colSkinLid, a: 255 });
        setPixel(fr, S, S, x, 51, { ...colSkinLid, a: 255 });
        setPixel(fr, S, S, x, 52, { ...colSkinLid, a: 255 });
        setPixel(fr, S, S, x, 53, { ...colLash, a: 255 });
      }
      for (let x = 82; x <= 88; x++) {
        setPixel(fr, S, S, x, 51, { ...colSkinLid, a: 255 });
        setPixel(fr, S, S, x, 52, { ...colSkinLid, a: 255 });
        setPixel(fr, S, S, x, 53, { ...colLash, a: 255 });
      }
    } else {
      // Crisp bright golden sunrise catchlight dot in both warm eyes!
      setPixel(fr, S, S, 66, 51, { ...colCatch, a: 255 });
      setPixel(fr, S, S, 85, 52, { ...colCatch, a: 255 });
    }

    // Subtle breathing morning wind-ripple on trailing crimson scarf tip (x=95..124, y=87..99)!
    const tipDy = Math.round(Math.sin(ph) * 1.1);
    if (tipDy !== 0) {
      for (let x = 100; x <= 125; x++) {
        for (let y = 88; y <= 98; y++) {
          const iSrc = (y * S + x) * 4;
          const r = digitized.pixels[iSrc];
          const g = digitized.pixels[iSrc + 1];
          const b = digitized.pixels[iSrc + 2];
          // Shift warm crimson/amber scarf tip pixels gently vertically by 1px with sea breeze!
          if (r > g + 25 && r > b + 20) {
            const ny = Math.max(0, Math.min(S - 1, y + tipDy));
            setPixel(fr, S, S, x, ny, { r, g, b, a: 255 });
          }
        }
      }
    }

    // Subtle shimmering specular twinkle on right curved glass dome & floating golden morning pollen!
    if (Math.sin(ph) > 0.35) {
      blendRgbPx(fx, S, S, 95, 42, colGlint, 185);
      blendRgbPx(fx, S, S, 96, 43, colGlint, 140);
    }
    for (let i = 0; i < 8; i++) {
      const mx = 10 + hash2v4(i, 19, 613) * 108;
      const my0 = 14 + hash2v4(i, 37, 619) * 90;
      // Keep pollen gently in sky/periphery so face remains crystal clear
      if (mx > 46 && mx < 98 && my0 > 24 && my0 < 84) continue;
      const drift = (t + hash2v4(i, 53, 631)) % 1;
      const fade = Math.sin(drift * Math.PI);
      const px = mx + Math.sin(ph + i) * 2.5;
      const py = my0 - drift * 10;
      const isCyan = i % 3 === 0;
      blendRgbPx(fx, S, S, px, py, isCyan ? colCyan : colGold, Math.round(fade * 125));
      blendRgbPx(fx, S, S, px, py, colCatch, Math.round(fade * 235));
    }

    blitV4(fr, S, S, fx, S, S, 0, 0);
    frames.push(fr);
    if (f === 0) f0Fx = fx;
  }

  const vpfJson = serializeBuffersToVpf({
    id: 'v5_mara_soul_portrait_128x128',
    name: 'V5.0 SOUL — Dr. Mara Lin Expressive Close-Up Portrait (128x128)',
    width: S,
    height: S,
    paletteHex: MARA_PORTRAIT_V5_PALETTE,
    layers: [
      { id: 'l01_portrait_pixels', name: '01 48-Color Hand-Quantized Master Portrait', pixels: digitized.pixels },
      { id: 'l02_living_glints', name: '02 Sunrise Specular Glints & Morning Pollen', pixels: f0Fx },
    ],
    pivot: { x: 64, y: 64 },
    tileSize: 32,
    styleNotes: 'Art Direction V5.0 Emotional Hero Portrait (48-color pixel art @ 128x128) with reflected golden ocean horizon across visor, warm human gaze, Meridian mission patch & 6-frame living blink/breeze animation.',
  });

  return { basePixels: frames[0], frames, vpfJson, width: S, height: S };
}
