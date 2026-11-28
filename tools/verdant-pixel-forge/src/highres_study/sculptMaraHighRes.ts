/**
 * VERDANT SIGNAL — High-Resolution Native Dr. Mara Lin Character Sculptor (Pass 2 Studio Craft!)
 * ==============================================================================================
 * Genuinely authors Dr. Mara Lin natively at ALL FOUR candidate resolutions:
 *   - 32x48 px
 *   - 48x64 px (★ Recommended Sweet Spot — also authored in 4 full production poses!)
 *   - 64x80 px
 *   - 64x96 px (Tall heroic realistic-proportion anatomy comparison)
 *
 * Pass 2 visual refinements after 3x/4x pixel inspection:
 *   - Redesigned Acoustic Field Lens: crisp gunmetal-rimmed angled parabolic dish + dark teal
 *     concave optic + bright cyan central transducer (zero white blob!)
 *   - Deepened leather boots, gloves & harness to rich dark espresso-chocolate (matching
 *     mara_lin_concept_128x128_v2.png) with crisp subtle edge highlights & lugged soles
 *   - Tucked beveled aerospace backpack closer to shoulder with richer slate-steel shading
 *     and visible curved ribbed O2 hose looping into collarbone manifold
 *   - Sculpted richer helmet visor bevels + sleek curved sky reflection + lower chin-vent
 *   - Completely rebuilt Crouch/Sample pose with natural bent explorer posture, chest harness,
 *     raised knee brace, and glowing botanical micro-probe scan cone
 *   - Upgraded Active Acoustic Lens Scan pose with distinct braced stance, two-hand calibration
 *     silhouette, crisp nested cyan harmonic soundwave arcs & cyan rim bounce lighting
 */

import { HighResCanvas, type ClipRect } from './highResPaletteAndSculpt';

const SUIT = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'];
// Rich dark chocolate-espresso leather ramp for boots, gloves, kneepads & straps (matches v2 concept!)
const DARK_LEATHER = ['B0', 'B0', 'B1', 'B2', 'B3', 'B4'];
const STRAP_LEATHER = ['B0', 'B1', 'B2', 'B3', 'B4', 'B5'];
// Darker brushed aerospace steel for backpack chassis & lens dish so it never looks like flat white cardboard
const DARK_METAL = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5'];
const BRIGHT_METAL = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
const VISOR = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];

export const MARA_HR_LAYERS = [
  { id: 'l01_outline', name: '01 Exterior Selective Outline' },
  { id: 'l02_antenna_hose', name: '02 Radio Antenna & Ribbed O2 Hose' },
  { id: 'l03_backpack_o2', name: '03 Life-Support Backpack & O2 Cylinder' },
  { id: 'l04_back_limbs', name: '04 Far Arm & Back Boot' },
  { id: 'l05_legs_boots', name: '05 Legs, Knee Armor & Treaded Boots' },
  { id: 'l06_suit_torso', name: '06 Layered Quilted Exosuit Torso' },
  { id: 'l07_harness_pouches', name: '07 Leather Harness, Belt & Specimen Vial' },
  { id: 'l08_chest_rig', name: '08 Titanium Chest Telemetry Oscilloscope' },
  { id: 'l09_helmet_dome', name: '09 Sculpted Helmet Shell & Ear Comm' },
  { id: 'l10_curved_visor', name: '10 Panoramic Curved Glass Visor' },
  { id: 'l11_front_arm_lens', name: '11 Front Arm, Gloves & Acoustic Field Lens' },
  { id: 'l12_specular_glow', name: '12 Specular Catchlights & Harmonic Bounce' },
];

export type MaraResolutionPreset = '32x48' | '48x64' | '64x80' | '64x96';
export type MaraPoseKind = 'hero_3q' | 'walk_right' | 'crouch_sample' | 'lens_scan';

interface BodyMetrics {
  w: number;
  h: number;
  groundY: number;
  bodyH: number;
  cx: number;
  headRx: number;
  headRy: number;
  headY: number;
  torsoTopY: number;
  waistY: number;
  torsoHalfW: number;
  hipHalfW: number;
  kneeY: number;
  bootH: number;
  detailTier: 1 | 2 | 3 | 4;
}

function getMetrics(preset: MaraResolutionPreset): BodyMetrics {
  if (preset === '32x48') {
    return {
      w: 32, h: 48, groundY: 45, bodyH: 37, cx: 15.5,
      headRx: 6.4, headRy: 5.6, headY: 14.5,
      torsoTopY: 20.5, waistY: 31.0, torsoHalfW: 5.5, hipHalfW: 5.1,
      kneeY: 37.5, bootH: 4.6, detailTier: 1,
    };
  }
  if (preset === '48x64') {
    return {
      w: 48, h: 64, groundY: 60, bodyH: 49, cx: 22.5,
      headRx: 8.8, headRy: 7.6, headY: 19.2,
      torsoTopY: 27.2, waistY: 41.2, torsoHalfW: 7.8, hipHalfW: 7.2,
      kneeY: 50.0, bootH: 6.4, detailTier: 2,
    };
  }
  if (preset === '64x80') {
    return {
      w: 64, h: 80, groundY: 75, bodyH: 61, cx: 30.0,
      headRx: 10.9, headRy: 9.3, headY: 23.8,
      torsoTopY: 33.8, waistY: 51.2, torsoHalfW: 9.8, hipHalfW: 9.1,
      kneeY: 62.5, bootH: 8.0, detailTier: 3,
    };
  }
  // 64x96 — Tall heroic realistic-proportion human scale (~78px standing figure, ~6 heads tall!)
  return {
    w: 64, h: 96, groundY: 91, bodyH: 77, cx: 30.0,
    headRx: 9.8, headRy: 9.0, headY: 22.8,
    torsoTopY: 32.8, waistY: 57.0, torsoHalfW: 10.0, hipHalfW: 9.2,
    kneeY: 74.5, bootH: 9.2, detailTier: 4,
  };
}

/** Paint a rich multi-band curved dark-teal panoramic glass visor with horizon & sky reflections! */
function paintCurvedGlassVisor(
  c: HighResCanvas,
  vcx: number,
  vcy: number,
  vrx: number,
  vry: number,
  detailTier: number,
  harmonicBounce: boolean,
  clip: ClipRect
): void {
  const xMin = Math.max(clip.x0, Math.floor(vcx - vrx - 2));
  const xMax = Math.min(clip.x1, Math.ceil(vcx + vrx + 2));
  const yMin = Math.max(clip.y0, Math.floor(vcy - vry - 2));
  const yMax = Math.min(clip.y1, Math.ceil(vcy + vry + 2));

  for (let y = yMin; y <= yMax; y++) {
    for (let x = xMin; x <= xMax; x++) {
      const nx = (x - vcx) / vrx;
      const ny = (y - vcy) / vry;
      // Sleek curved aerospace panoramic trapezoid-oval
      const squish = ny > 0 ? 1 + ny * 0.16 : 1 - ny * 0.05;
      const r = Math.hypot(nx * squish, ny);
      if (r > 1.15) continue;

      if (r > 0.94) {
        // Sleek dark-gunmetal aerospace gasket bezel (never overly chalky!)
        const lit = -nx * 0.55 - ny * 0.65;
        const rimTok = lit > 0.45 ? 'M4' : lit > 0.05 ? 'M2' : lit > -0.30 ? 'M1' : 'M0';
        c.px('l10_curved_visor', x, y, rimTok);
        continue;
      }

      // Deep dark-marine curved panoramic glass with crisp upper-left sky curve!
      const curveY = ny + nx * nx * 0.24;
      let tok = 'V0';
      if (curveY < -0.34 && nx < 0.35) {
        tok = nx < -0.15 ? (harmonicBounce ? 'L3' : 'V6') : (harmonicBounce ? 'L2' : 'V5');
      } else if (curveY < -0.02) {
        tok = harmonicBounce ? (nx < 0.25 ? 'L1' : 'V4') : (nx < 0.2 ? 'V4' : 'V3');
      } else if (curveY < 0.28) {
        tok = harmonicBounce ? 'V3' : 'V2';
      } else if (r > 0.68 && ny > 0.44 && nx > -0.25 && nx < 0.38) {
        // Subtle lower-edge cyan rim reflection
        tok = harmonicBounce ? 'L2' : 'V3';
      } else {
        tok = curveY < 0.58 ? 'V1' : 'V0';
      }

      if (r > 0.84 && ny > 0.0) tok = 'V0';
      c.px('l10_curved_visor', x, y, tok);
    }
  }

  // Crisp upper-left glass specular highlight arc + lower-right ambient bounce dot!
  const gx = Math.round(vcx - vrx * 0.40);
  const gy = Math.round(vcy - vry * 0.42);
  c.px('l12_specular_glow', gx, gy, 'V6');
  c.px('l12_specular_glow', gx + 1, gy, 'V6');
  if (detailTier >= 2) {
    c.px('l12_specular_glow', gx - 1, gy + 1, 'V5');
    c.px('l12_specular_glow', gx + 2, gy - 1, 'V5');
    c.px('l12_specular_glow', Math.round(vcx + vrx * 0.30), Math.round(vcy + vry * 0.44), harmonicBounce ? 'L2' : 'V4');
  }
}

/** Paint Mara's beveled titanium Chest Telemetry Oscilloscope with live waveform & status LEDs! */
function paintChestTelemetryRig(
  c: HighResCanvas,
  cx: number,
  cy: number,
  w: number,
  h: number,
  detailTier: number,
  harmonicBounce: boolean
): void {
  const x0 = Math.round(cx - w / 2);
  const y0 = Math.round(cy - h / 2);
  c.sculptBeveledBox('l08_chest_rig', x0, y0, w, h, DARK_METAL, { roundCorners: detailTier >= 2, lightBias: harmonicBounce ? 0.14 : 0.02 });

  const sx = x0 + (detailTier === 1 ? 1 : 2);
  const sy = y0 + (detailTier === 1 ? 1 : 2);
  const sw = Math.max(3, Math.round(w * 0.56));
  const sh = Math.max(2, h - (detailTier === 1 ? 2 : 4));

  for (let ly = 0; ly < sh; ly++) {
    for (let lx = 0; lx < sw; lx++) {
      c.px('l08_chest_rig', sx + lx, sy + ly, ly === 0 ? 'V0' : 'V1');
    }
  }
  const midY = sy + Math.floor(sh / 2);
  for (let lx = 0; lx < sw; lx++) {
    const wave = Math.round(Math.sin((lx / Math.max(1, sw - 1)) * Math.PI * 2.2) * (sh >= 4 ? 1.2 : 0.6));
    c.px('l12_specular_glow', sx + lx, Math.max(sy, Math.min(sy + sh - 1, midY - wave)), harmonicBounce ? 'L3' : 'V5');
  }

  const bx = sx + sw + 1;
  if (bx < x0 + w - 1) {
    c.px('l12_specular_glow', bx, sy, harmonicBounce ? 'L3' : 'O3');
    if (sy + 2 < y0 + h - 1) c.px('l12_specular_glow', bx, sy + 2, 'R1');
    if (detailTier >= 3 && bx + 1 < x0 + w - 1) {
      c.px('l08_chest_rig', bx + 1, sy, 'M4');
      c.px('l08_chest_rig', bx + 1, sy + 2, 'R0');
    }
  }
}

/** Paint Mara's iconic translucent glass Moss Specimen Canister hanging on her hip belt! */
function paintSpecimenVial(c: HighResCanvas, x: number, y: number, w: number, h: number): void {
  const rx = Math.round(x - w / 2);
  const ry = Math.round(y);
  const capH = Math.max(1, Math.round(h * 0.22));
  c.sculptBeveledBox('l07_harness_pouches', rx, ry, w, capH, DARK_METAL);
  c.sculptBeveledBox('l07_harness_pouches', rx, ry + h - capH, w, capH, DARK_METAL);
  const midStart = ry + capH;
  const midEnd = ry + h - capH;
  for (let py = midStart; py < midEnd; py++) {
    for (let px = rx; px < rx + w; px++) {
      if (px === rx || px === rx + w - 1) c.px('l07_harness_pouches', px, py, 'M0');
      else if (px === rx + 1) c.px('l12_specular_glow', px, py, 'V6');
      else {
        const isLower = py >= midStart + Math.floor((midEnd - midStart) * 0.30);
        c.px('l07_harness_pouches', px, py, isLower ? (px === rx + 2 ? 'O3' : 'O2') : 'V2');
      }
    }
  }
}

/**
 * PASS 2 REDESIGNED ACOUSTIC FIELD LENS!
 * Crisp dark-gunmetal angled parabolic dish cup + recessed deep marine-teal optical mirror
 * + incandescent cyan transducer pin + outer titanium aperture prongs — ZERO white blob!
 */
function paintParabolicFieldLens(
  c: HighResCanvas,
  hx: number,
  hy: number,
  scale: number,
  activeScan: boolean,
  clip: ClipRect
): void {
  const dishX = hx + 3.2 * scale;
  const dishY = hy - 1.4 * scale;
  const rx = Math.max(2.0, 2.7 * scale);
  const ry = Math.max(3.2, 4.6 * scale);

  // 1. Dark gunmetal barrel & ergonomic pistol receiver extending from gloved fist
  c.sculptBezierTube('l11_front_arm_lens', [hx - 1.8 * scale, hy + 1.0 * scale], [hx + 0.5 * scale, hy + 0.2 * scale], [dishX - 1.5 * scale, dishY + 0.2 * scale], 1.5 * scale, 1.3 * scale, DARK_METAL, { outlineDark: 'M0', clip });
  c.px('l11_front_arm_lens', hx - 0.6 * scale, hy + 0.6 * scale, 'S5'); // orange safety grip strip!

  // 2. Sculpted outer dark-steel conical reflector back-shell
  c.sculptVolume('l11_front_arm_lens', dishX - 0.9 * scale, dishY, rx * 0.95, ry * 0.96, DARK_METAL, {
    tiltDeg: -10,
    lightBias: -0.10,
    outlineDark: 'M0',
    outlineLight: 'M4',
    clip,
  });

  // 3. Open Concave Deep-Teal Parabolic Optical Mirror Face (angled outward-right!)
  const xMin = Math.max(clip.x0, Math.floor(dishX - rx - 1));
  const xMax = Math.min(clip.x1, Math.ceil(dishX + rx + 2));
  const yMin = Math.max(clip.y0, Math.floor(dishY - ry - 1));
  const yMax = Math.min(clip.y1, Math.ceil(dishY + ry + 1));

  for (let y = yMin; y <= yMax; y++) {
    for (let x = xMin; x <= xMax; x++) {
      const nx = (x - (dishX + 0.4 * scale)) / (rx * 0.88);
      const ny = (y - dishY) / (ry * 0.94);
      const r = Math.hypot(nx, ny);
      if (r > 1.08) continue;
      if (r > 0.82) {
        // Razor-crisp metallic rim lip of the parabolic dish (dark underside, bright sunlit upper rim!)
        const tok = ny < -0.25 ? 'M5' : ny < 0.25 ? 'M3' : 'M1';
        c.px('l11_front_arm_lens', x, y, tok);
      } else {
        // Concave dark-marine optical mirror dish glowing brightest at its central focal core!
        const tok =
          r < 0.28 ? (activeScan ? 'L3' : 'L2')
            : r < 0.56 ? (activeScan ? 'L1' : 'V3')
            : (activeScan ? 'V3' : 'V1');
        c.px('l11_front_arm_lens', x, y, tok);
      }
    }
  }

  // 4. Delicate protruding central brass/titanium acoustic emitter needle + glowing focal point!
  c.line('l11_front_arm_lens', dishX + 0.5 * scale, dishY, dishX + 2.8 * scale, dishY - 0.4 * scale, 'M4');
  c.px('l12_specular_glow', dishX + 3.0 * scale, dishY - 0.5 * scale, activeScan ? 'L3' : 'V6');

  // 5. Layered Harmonic Interference Wave Arcs when actively scanning!
  if (activeScan) {
    const fx = dishX + 3.4 * scale;
    const fy = dishY - 0.5 * scale;
    for (let ring = 1; ring <= 3; ring++) {
      const rr = (2.4 + ring * 2.6) * scale;
      for (let a = -0.78; a <= 0.78; a += 0.14) {
        const ax = Math.round(fx + Math.cos(a) * rr * 0.62);
        const ay = Math.round(fy + Math.sin(a) * rr);
        if (ax >= clip.x0 && ax <= clip.x1 && ay >= clip.y0 && ay <= clip.y1) {
          const tok = ring === 1 ? 'L3' : ring === 2 ? 'L2' : 'L1';
          const alpha = ring === 1 ? 255 : ring === 2 ? 210 : 145;
          c.px('l12_specular_glow', ax, ay, tok, alpha);
        }
      }
    }
  }
}

/** Paint Mara's deep dark-chocolate-leather Heavy Expedition Boots (faithful to v2 concept!) */
function paintHeavyBoot(
  c: HighResCanvas,
  ankleX: number,
  ankleY: number,
  soleY: number,
  toeDirX: number,
  scale: number,
  clip: ClipRect
): void {
  const bh = Math.max(3.6, soleY - ankleY);
  const footCenterX = ankleX + toeDirX * 1.4 * scale;

  // Padded dark espresso-leather boot shaft + metallic ankle strap buckle
  c.sculptVolume('l05_legs_boots', ankleX, ankleY + bh * 0.30, 3.0 * scale, bh * 0.44, DARK_LEATHER, {
    lightBias: -0.04,
    outlineDark: 'B0',
    outlineLight: 'B3',
    clip,
  });
  // Grounded rounded leather toe box
  c.sculptVolume('l05_legs_boots', footCenterX + toeDirX * 1.2 * scale, soleY - bh * 0.30, 3.8 * scale, bh * 0.35, DARK_LEATHER, {
    lightBias: -0.02,
    outlineDark: 'B0',
    outlineLight: 'B4',
    clip,
  });
  // Thick dark lugged rubber sole planted flat on groundY!
  const sL = Math.round(footCenterX - 3.3 * scale + Math.min(0, toeDirX * 1.2 * scale));
  const sR = Math.round(footCenterX + 3.3 * scale + Math.max(0, toeDirX * 1.2 * scale));
  for (let x = sL; x <= sR; x++) {
    c.px('l05_legs_boots', x, soleY, 'B0');
    c.px('l05_legs_boots', x, soleY - 1, (x & 1) === 0 ? 'B0' : 'B1');
  }
  // Subtle leather top scuff & dark brushed steel toe-plate glint
  c.px('l12_specular_glow', footCenterX + toeDirX * 1.3 * scale, soleY - bh * 0.44, 'B5');
  if (scale >= 0.9) {
    c.px('l12_specular_glow', footCenterX + toeDirX * 0.5 * scale, ankleY + bh * 0.16, 'M4'); // ankle strap buckle!
  }
}

/** Paint Mara's sculpted Aerospace Helmet with sleek ivory dorsal stripe, ear pod, neck collar & curved glass visor! */
function paintMaraHelmet(
  c: HighResCanvas,
  hx: number,
  hy: number,
  rx: number,
  ry: number,
  facing: '3q' | 'right',
  detailTier: number,
  harmonicBounce: boolean,
  clip: ClipRect
): void {
  // 1. Sculpted rounded burnt-orange aerospace helmet shell
  c.sculptVolume('l09_helmet_dome', hx, hy, rx, ry, SUIT, {
    lightBias: 0.06,
    outlineDark: 'S0',
    outlineLight: 'S4',
    clip,
  });

  // 2. Sleek Ceramic Ivory-White Dorsal Crown Stripe
  const stripeW = Math.max(1.0, rx * 0.21);
  for (let y = Math.floor(hy - ry); y <= Math.ceil(hy - ry * 0.14); y++) {
    const ny = (y - hy) / ry;
    const scx = hx + rx * 0.04;
    for (let x = Math.floor(scx - stripeW); x <= Math.ceil(scx + stripeW); x++) {
      const nx = (x - hx) / rx;
      if (nx * nx + ny * ny > 0.90) continue;
      const isEdge = Math.abs(x - scx) >= stripeW - 0.55;
      c.px('l09_helmet_dome', x, y, isEdge ? 'M3' : ny < -0.58 ? 'M6' : 'M5');
    }
  }

  // 3. Beveled Titanium Ear-Comm Pod + Glowing Cyan Comms LED
  const earX = facing === 'right' ? hx - rx * 0.44 : hx - rx * 0.84;
  const earW = Math.max(2, Math.round(rx * 0.34));
  const earH = Math.max(3, Math.round(ry * 0.58));
  c.sculptBeveledBox('l09_helmet_dome', earX - earW / 2, hy - earH / 2 + 1, earW, earH, DARK_METAL, { roundCorners: detailTier >= 2 });
  c.px('l12_specular_glow', earX, hy + 1, harmonicBounce ? 'L3' : 'V5');

  // 4. Sculpted Dark-Titanium Neck Locking Ring + Dark Chin Vent!
  const colY = hy + ry * 0.85;
  c.sculptVolume('l09_helmet_dome', hx, colY, rx * 0.78, Math.max(1.6, ry * 0.24), DARK_METAL, {
    lightBias: harmonicBounce ? 0.16 : 0.04,
    outlineDark: 'M0',
    outlineLight: 'M4',
    clip,
  });

  // 5. Curved Panoramic Marine-Teal Glass Visor
  const vcx = facing === 'right' ? hx + rx * 0.36 : hx + rx * 0.15;
  const vcy = hy + ry * 0.06;
  const vrx = facing === 'right' ? rx * 0.64 : rx * 0.69;
  const vry = ry * 0.57;
  paintCurvedGlassVisor(c, vcx, vcy, vrx, vry, detailTier, harmonicBounce, clip);
}

/** Paint Mara's tucked Aerospace Life-Support Backpack + Brushed Titanium O2 Cylinder + Ruby Valve + Ribbed O2 Hose! */
function paintBackpackAndO2(
  c: HighResCanvas,
  bx: number,
  by: number,
  scale: number,
  sideProfile: boolean,
  clip: ClipRect
): void {
  const pw = Math.round((sideProfile ? 7.2 : 6.8) * scale);
  const ph = Math.round(13.0 * scale);

  // Slender radio telemetry antenna rising gracefully above backpack
  const antX = bx - pw * 0.05;
  const antTopY = Math.max(2, by - ph * 0.90);
  c.line('l02_antenna_hose', antX, by - 1, antX - 1.0 * scale, antTopY, 'M4');
  c.line('l02_antenna_hose', antX + 1, by - 1, antX, antTopY + 1, 'M1');
  c.px('l12_specular_glow', antX - 1.0 * scale, antTopY, 'M6');
  c.sculptBeveledBox('l03_backpack_o2', antX - 1.2 * scale, by - 2.0 * scale, Math.max(2, 2.4 * scale), Math.max(2, 2.4 * scale), DARK_METAL);

  // Shaded slate-steel aerospace backpack chassis (tucked tightly behind shoulder — never cardboard white!)
  c.sculptBeveledBox('l03_backpack_o2', bx - pw * 0.42, by, pw, ph, DARK_METAL, { roundCorners: true, lightBias: -0.06 });
  // Subtle technical vent louvers on pack face
  if (scale >= 0.85) {
    const vx0 = Math.round(bx - pw * 0.18);
    const vx1 = Math.round(bx + pw * 0.25);
    c.line('l03_backpack_o2', vx0, Math.round(by + ph * 0.28), vx1, Math.round(by + ph * 0.28), 'M1');
    c.line('l03_backpack_o2', vx0, Math.round(by + ph * 0.44), vx1, Math.round(by + ph * 0.44), 'M1');
  }

  // Vertical Brushed-Titanium Pressurized O2 Cylinder strapped to outer rim
  const cylX = bx - pw * 0.56;
  const cylW = Math.max(3, Math.round(3.8 * scale));
  const cylH = Math.round(ph * 0.88);
  for (let ly = 0; ly < cylH; ly++) {
    for (let lx = 0; lx < cylW; lx++) {
      const nx = (lx / Math.max(1, cylW - 1)) * 2 - 1;
      let tok = 'M3';
      if (lx === 0 || lx === cylW - 1 || ly === 0 || ly === cylH - 1) tok = 'M0';
      else if (nx < -0.1) tok = 'M5';
      else if (nx < 0.35) tok = 'M4';
      else tok = 'M1';
      // Horizontal terracotta retention strap around O2 cylinder
      if (Math.abs(ly - cylH * 0.48) < Math.max(1, 1.3 * scale) && lx > 0 && lx < cylW - 1) {
        tok = nx < 0 ? 'S5' : 'S3';
      }
      c.px('l03_backpack_o2', Math.round(cylX - cylW / 2 + lx), Math.round(by + 1.4 * scale + ly), tok);
    }
  }
  // Ruby-Red Emergency Reserve Pressure Valve on cylinder top!
  const vx = Math.round(cylX);
  const vy = Math.round(by + 0.6 * scale);
  c.px('l03_backpack_o2', vx, vy, 'R1');
  c.px('l03_backpack_o2', vx - 1, vy, 'R1');
  c.px('l03_backpack_o2', vx + 1, vy, 'R0');

  // Curved corrugated black-rubber O2 hose looping smoothly from backpack into collarbone manifold!
  if (scale >= 0.85) {
    c.sculptBezierTube(
      'l02_antenna_hose',
      [bx + pw * 0.15, by + ph * 0.18],
      [bx + pw * 0.72, by + ph * 0.04],
      [bx + pw * 1.15, by + ph * 0.34],
      Math.max(1.0, 1.15 * scale),
      Math.max(1.0, 1.15 * scale),
      DARK_LEATHER,
      { ribFreq: 4, outlineDark: 'B0', clip }
    );
  }
}

export function buildMaraHighResStudy(
  preset: MaraResolutionPreset,
  pose: MaraPoseKind = 'hero_3q'
): { canvas: HighResCanvas; vpfJson: string; width: number; height: number } {
  const m = getMetrics(preset);
  const c = new HighResCanvas(m.w, m.h, MARA_HR_LAYERS);
  const clip: ClipRect = { x0: 1, y0: 1, x1: m.w - 2, y1: m.h - 2 };
  const sc = m.bodyH / 49.0;
  const isScan = pose === 'lens_scan';

  if (pose === 'hero_3q' || pose === 'lens_scan') {
    const cx = isScan ? m.cx - 3.5 * sc : m.cx;
    // Tucked snugly behind Mara's shoulder so backpack feels unified with her torso!
    const bpX = cx - m.torsoHalfW * 0.98;
    const bpY = m.torsoTopY - 1.8 * sc;
    paintBackpackAndO2(c, bpX, bpY, sc, false, clip);

    // 1. Athletic Contrapposto Legs (tapered thighs -> armored kneepads -> calves -> dark leather boots!)
    const stanceSpread = isScan ? 1.24 : 1.0;
    const lHipX = cx - m.hipHalfW * 0.50;
    const rHipX = cx + m.hipHalfW * 0.54;
    const lFootX = cx - m.hipHalfW * 0.70 * stanceSpread;
    const rFootX = cx + m.hipHalfW * 0.90 * stanceSpread;
    const ankleY = m.groundY - m.bootH;

    // Far/right leg
    c.sculptBezierTube('l05_legs_boots', [rHipX, m.waistY], [rHipX + 1.6 * sc, m.kneeY], [rFootX, ankleY], 3.4 * sc, 2.5 * sc, SUIT, {
      ribFreq: m.detailTier >= 3 ? 2.5 : undefined,
      lightBias: -0.10,
      outlineDark: 'S0',
      outlineLight: 'S3',
      clip,
    });
    // Near/left leg
    c.sculptBezierTube('l05_legs_boots', [lHipX, m.waistY], [lHipX - 1.4 * sc, m.kneeY], [lFootX, ankleY], 3.7 * sc, 2.7 * sc, SUIT, {
      ribFreq: m.detailTier >= 3 ? 2.5 : undefined,
      lightBias: 0.08,
      outlineDark: 'S0',
      outlineLight: 'S4',
      clip,
    });
    // Cargo thigh pocket detail on tall 64x96 & 64x80 studies!
    if (m.detailTier >= 3) {
      c.sculptBeveledBox('l05_legs_boots', lHipX - 3.6 * sc, (m.waistY + m.kneeY) * 0.48, 2.8 * sc, 4.0 * sc, DARK_LEATHER, { roundCorners: true });
    }

    // Dark-leather armored kneepads with brushed steel rivets!
    const kpW = 3.2 * sc;
    const kpH = 2.6 * sc;
    c.sculptBeveledBox('l05_legs_boots', lFootX - kpW * 0.52, m.kneeY - kpH * 0.5, kpW * 1.15, kpH, DARK_LEATHER, { roundCorners: true });
    c.sculptBeveledBox('l05_legs_boots', rFootX - kpW * 0.55, m.kneeY - kpH * 0.45, kpW * 1.05, kpH * 0.95, DARK_LEATHER, { roundCorners: true, lightBias: -0.10 });
    if (m.detailTier >= 2) {
      c.px('l12_specular_glow', lFootX - kpW * 0.2, m.kneeY, 'M4');
      c.px('l12_specular_glow', rFootX - kpW * 0.2, m.kneeY, 'M3');
    }

    // Deep dark-chocolate heavy expedition boots!
    paintHeavyBoot(c, rFootX, ankleY, m.groundY, 0.78, sc, clip);
    paintHeavyBoot(c, lFootX, ankleY, m.groundY, 0.34, sc * 1.04, clip);

    // 2. Sculpted Layered Quilted Exosuit Torso
    const chestMidY = (m.torsoTopY + m.waistY) * 0.48;
    c.sculptVolume('l06_suit_torso', cx, m.waistY + 0.5 * sc, m.hipHalfW * 0.98, 4.4 * sc, SUIT, {
      outlineDark: 'S0',
      outlineLight: 'S4',
      clip,
    });
    c.sculptVolume('l06_suit_torso', cx, chestMidY, m.torsoHalfW, (m.waistY - m.torsoTopY) * 0.62, SUIT, {
      seamBands: m.detailTier >= 2 ? 2.5 : undefined,
      lightBias: isScan ? 0.08 : 0.04,
      outlineDark: 'S0',
      outlineLight: 'S5',
      clip,
    });

    // 3. Weathered Dark-Leather Harness Straps, Belt, Buckle, Pouch & Translucent Moss Specimen Vial!
    const strapW = Math.max(1.5, 2.0 * sc);
    c.sculptBeveledBox('l07_harness_pouches', cx - m.torsoHalfW * 0.58, m.torsoTopY + 0.5 * sc, strapW, m.waistY - m.torsoTopY, STRAP_LEATHER);
    c.sculptBeveledBox('l07_harness_pouches', cx + m.torsoHalfW * 0.32, m.torsoTopY + 0.5 * sc, strapW, m.waistY - m.torsoTopY, STRAP_LEATHER, { lightBias: -0.1 });
    const beltH = Math.max(2.6, 3.6 * sc);
    c.sculptBeveledBox('l07_harness_pouches', cx - m.hipHalfW * 1.02, m.waistY - beltH * 0.55, m.hipHalfW * 2.04, beltH, DARK_LEATHER, { roundCorners: true });
    const buckW = Math.max(3, Math.round(3.6 * sc));
    c.sculptBeveledBox('l07_harness_pouches', cx - buckW / 2, m.waistY - beltH * 0.58, buckW, beltH * 1.05, BRIGHT_METAL);
    c.px('l12_specular_glow', cx - buckW * 0.15, m.waistY - beltH * 0.18, 'M6');
    c.sculptBeveledBox('l07_harness_pouches', cx - m.hipHalfW * 1.04, m.waistY - beltH * 0.3, Math.max(3, 3.4 * sc), Math.max(3, 4.0 * sc), DARK_LEATHER, { roundCorners: true });
    paintSpecimenVial(c, cx + m.hipHalfW * 0.72, m.waistY - 0.5 * sc, Math.max(3, Math.round(4.0 * sc)), Math.max(5, Math.round(6.6 * sc)));

    // 4. Beveled Titanium Chest Telemetry Oscilloscope!
    paintChestTelemetryRig(c, cx + 0.4 * sc, chestMidY + 0.5 * sc, Math.max(6, Math.round(9.4 * sc)), Math.max(5, Math.round(7.4 * sc)), m.detailTier, isScan);

    // 5. Left-Side Arm (viewer's left): Hip-stance in Hero Idle, OR raised to calibrate chest telemetry dial in Scan Pose!
    const shLX = cx - m.torsoHalfW * 0.94;
    const shLY = m.torsoTopY + 2.8 * sc;
    const elbowLX = isScan ? shLX - 3.6 * sc : shLX - 4.3 * sc;
    const elbowLY = isScan ? shLY + 5.8 * sc : shLY + 6.4 * sc;
    const handLX = isScan ? cx - 3.2 * sc : cx - m.hipHalfW * 0.94;
    const handLY = isScan ? chestMidY + 2.0 * sc : m.waistY - 1.5 * sc;

    c.sculptBezierTube('l11_front_arm_lens', [shLX, shLY], [elbowLX, elbowLY], [handLX, handLY], 3.0 * sc, 2.2 * sc, SUIT, {
      ribFreq: m.detailTier >= 2 ? 2.0 : undefined,
      lightBias: 0.12,
      outlineDark: 'S0',
      outlineLight: 'S5',
      clip,
    });
    if (m.detailTier >= 2) {
      c.sculptBeveledBox('l11_front_arm_lens', shLX - 2.4 * sc, shLY + 1.2 * sc, Math.max(2, 2.8 * sc), Math.max(2, 2.4 * sc), VISOR);
      c.px('l12_specular_glow', shLX - 1.5 * sc, shLY + 2.0 * sc, 'V6');
    }
    // Deep espresso-leather glove + silver wrist-cuff clasp
    c.sculptVolume('l11_front_arm_lens', handLX, handLY, 2.3 * sc, 1.9 * sc, DARK_LEATHER, { outlineDark: 'B0', outlineLight: 'B4', clip });
    c.px('l12_specular_glow', handLX - 0.8 * sc, handLY - 0.6 * sc, 'M5');

    // 6. Right-Side Arm (viewer's right) holding Sculpted Parabolic Acoustic Field Lens!
    const shRX = cx + m.torsoHalfW * 0.92;
    const shRY = m.torsoTopY + 3.0 * sc;
    const elbRX = shRX + (isScan ? 4.2 : 2.6) * sc;
    const elbRY = shRY + (isScan ? 1.8 : 5.2) * sc;
    const handRX = shRX + (isScan ? 7.8 : 6.0) * sc;
    const handRY = shRY + (isScan ? -1.4 : 3.8) * sc;

    c.sculptBezierTube('l04_back_limbs', [shRX, shRY], [elbRX, elbRY], [handRX, handRY], 2.8 * sc, 2.1 * sc, SUIT, {
      lightBias: isScan ? 0.08 : -0.10,
      outlineDark: 'S0',
      outlineLight: 'S3',
      clip,
    });
    c.sculptVolume('l11_front_arm_lens', handRX, handRY, 2.1 * sc, 1.9 * sc, DARK_LEATHER, { outlineDark: 'B0', outlineLight: 'B4', clip });
    paintParabolicFieldLens(c, handRX + 0.8 * sc, handRY - 0.5 * sc, sc, isScan, clip);

    // 7. Sculpted Space Helmet + Curved Panoramic Marine-Teal Glass Visor!
    paintMaraHelmet(c, cx + 0.5 * sc, m.headY, m.headRx, m.headRy, '3q', m.detailTier, isScan, clip);

    // Rich harmonic cyan bounce light kissing shoulder, helmet rim & chest bezel during active scan!
    if (isScan) {
      c.line('l12_specular_glow', shRX + 1, shRY - 1, shRX + 2, shRY + 3, 'L2', 220);
      c.px('l12_specular_glow', cx + m.headRx * 0.88, m.headY + 1, 'L2', 210);
      c.px('l12_specular_glow', cx + m.torsoHalfW * 0.65, chestMidY, 'L2', 200);
    }
  } else if (pose === 'walk_right') {
    const cx = m.cx + 1;
    paintBackpackAndO2(c, cx - 7.8 * sc, m.torsoTopY - 1.8 * sc, sc * 1.02, true, clip);

    // Far arm swinging forward-right
    c.sculptBezierTube('l04_back_limbs', [cx + 2 * sc, m.torsoTopY + 3 * sc], [cx + 7 * sc, m.torsoTopY + 9 * sc], [cx + 11 * sc, m.waistY - 1 * sc], 2.5 * sc, 1.9 * sc, SUIT, { lightBias: -0.16, outlineDark: 'S0', clip });
    c.sculptVolume('l04_back_limbs', cx + 11.4 * sc, m.waistY - 0.8 * sc, 2.0 * sc, 1.8 * sc, DARK_LEATHER, { outlineDark: 'B0', clip });

    const ankleY = m.groundY - m.bootH;
    // Trailing back leg
    c.sculptBezierTube('l04_back_limbs', [cx - 1 * sc, m.waistY], [cx - 6.5 * sc, m.kneeY - 1 * sc], [cx - 10.5 * sc, ankleY - 1 * sc], 3.2 * sc, 2.5 * sc, SUIT, { lightBias: -0.16, outlineDark: 'S0', clip });
    paintHeavyBoot(c, cx - 10.5 * sc, ankleY - 1 * sc, m.groundY - 1, 0.85, sc * 0.95, clip);

    // Leading sunlit front leg + dark kneepad + heel-strike boot
    c.sculptBezierTube('l05_legs_boots', [cx + 1 * sc, m.waistY], [cx + 6.5 * sc, m.kneeY - 0.5 * sc], [cx + 9.2 * sc, ankleY], 3.5 * sc, 2.7 * sc, SUIT, { lightBias: 0.10, outlineDark: 'S0', outlineLight: 'S5', clip });
    c.sculptBeveledBox('l05_legs_boots', cx + 5.6 * sc, m.kneeY - 2.2 * sc, 3.6 * sc, 3.0 * sc, DARK_LEATHER, { roundCorners: true });
    paintHeavyBoot(c, cx + 9.2 * sc, ankleY, m.groundY, 1.0, sc * 1.02, clip);

    // Forward-leaning sculpted side torso + harness strap + belt + moss specimen canister!
    c.sculptVolume('l06_suit_torso', cx + 0.5 * sc, (m.torsoTopY + m.waistY) * 0.5, 6.6 * sc, (m.waistY - m.torsoTopY) * 0.62, SUIT, { tiltDeg: 10, seamBands: 2.5, lightBias: 0.05, outlineDark: 'S0', outlineLight: 'S5', clip });
    c.sculptBeveledBox('l07_harness_pouches', cx - 1.0 * sc, m.torsoTopY + 1.0 * sc, 2.2 * sc, m.waistY - m.torsoTopY - 1 * sc, STRAP_LEATHER);
    c.sculptBeveledBox('l07_harness_pouches', cx - 5.6 * sc, m.waistY - 2.2 * sc, 11.8 * sc, 3.6 * sc, DARK_LEATHER, { roundCorners: true });
    paintSpecimenVial(c, cx + 2.4 * sc, m.waistY - 0.5 * sc, 4, 7);

    // Near arm swinging smoothly back-left with Meridian patch & dark leather glove
    c.sculptBezierTube('l11_front_arm_lens', [cx - 0.5 * sc, m.torsoTopY + 3.0 * sc], [cx - 4.6 * sc, m.torsoTopY + 10.5 * sc], [cx - 7.4 * sc, m.waistY + 2.0 * sc], 3.0 * sc, 2.2 * sc, SUIT, { lightBias: 0.14, outlineDark: 'S0', outlineLight: 'S5', clip });
    c.sculptBeveledBox('l11_front_arm_lens', cx - 2.5 * sc, m.torsoTopY + 4.5 * sc, 3, 2.5, VISOR);
    c.sculptVolume('l11_front_arm_lens', cx - 7.8 * sc, m.waistY + 2.4 * sc, 2.2 * sc, 2.0 * sc, DARK_LEATHER, { outlineDark: 'B0', outlineLight: 'B4', clip });

    paintMaraHelmet(c, cx + 2.2 * sc, m.headY + 0.5 * sc, m.headRx, m.headRy, 'right', m.detailTier, false, clip);
  } else {
    // =========================================================================
    // PASS 2 REBUILT BOTANIST CROUCH / SPECIMEN SAMPLING POSE!
    // Natural forward-angled athletic kneel, crisp chest harness & side rig,
    // bent probing arm casting a translucent cyan botanical micro-scan cone!
    // =========================================================================
    const dropY = 10.0 * sc;
    const cx = m.cx - 1.5 * sc;
    paintBackpackAndO2(c, cx - 7.2 * sc, m.torsoTopY + dropY - 3.6 * sc, sc * 0.96, true, clip);

    const ankleY = m.groundY - m.bootH;
    // Back kneeling leg grounded smoothly on mossy soil
    c.sculptBezierTube('l04_back_limbs', [cx - 2 * sc, m.waistY + dropY - 1.5 * sc], [cx - 2.8 * sc, m.groundY - 2.6 * sc], [cx - 10.2 * sc, m.groundY - 2.6 * sc], 3.2 * sc, 2.5 * sc, SUIT, { lightBias: -0.14, outlineDark: 'S0', clip });
    c.sculptBeveledBox('l04_back_limbs', cx - 4.4 * sc, m.groundY - 4.6 * sc, 3.4 * sc, 3.0 * sc, DARK_LEATHER, { roundCorners: true });
    paintHeavyBoot(c, cx - 10.2 * sc, m.groundY - 5.2 * sc, m.groundY, 0.45, sc * 0.92, clip);

    // Front braced leg bent cleanly at 90 degrees supporting weight!
    c.sculptBezierTube('l05_legs_boots', [cx + 0.4 * sc, m.waistY + dropY - 2.4 * sc], [cx + 7.2 * sc, m.waistY + dropY + 0.4 * sc], [cx + 6.6 * sc, ankleY], 3.4 * sc, 2.7 * sc, SUIT, { lightBias: 0.08, outlineDark: 'S0', outlineLight: 'S5', clip });
    c.sculptBeveledBox('l05_legs_boots', cx + 5.8 * sc, m.waistY + dropY - 1.2 * sc, 3.4 * sc, 3.0 * sc, DARK_LEATHER, { roundCorners: true });
    paintHeavyBoot(c, cx + 6.6 * sc, ankleY, m.groundY, 0.95, sc * 1.0, clip);

    // Sculpted forward-angled torso (streamlined athletic back curve, NEVER a balloon!)
    c.sculptBezierTube(
      'l06_suit_torso',
      [cx - 1.2 * sc, m.waistY + dropY - 2.2 * sc],
      [cx + 0.2 * sc, m.torsoTopY + dropY + 5.0 * sc],
      [cx + 3.0 * sc, m.torsoTopY + dropY + 1.0 * sc],
      5.4 * sc,
      5.2 * sc,
      SUIT,
      { ribFreq: 2.0, lightBias: 0.04, outlineDark: 'S0', outlineLight: 'S5', clip }
    );
    // Crisp dark-leather diagonal backpack harness strap + side chest telemetry rig + hip belt + specimen jar!
    c.sculptBezierTube('l07_harness_pouches', [cx - 2.8 * sc, m.torsoTopY + dropY + 1.5 * sc], [cx + 0.4 * sc, m.torsoTopY + dropY + 6.5 * sc], [cx + 1.0 * sc, m.waistY + dropY - 2.5 * sc], 1.4 * sc, 1.3 * sc, STRAP_LEATHER, { outlineDark: 'B0', clip });
    c.sculptBeveledBox('l08_chest_rig', cx + 4.4 * sc, m.torsoTopY + dropY + 3.5 * sc, 3.4 * sc, 5.2 * sc, DARK_METAL, { roundCorners: true });
    c.px('l12_specular_glow', cx + 6.4 * sc, m.torsoTopY + dropY + 5.2 * sc, 'L2');
    c.sculptBeveledBox('l07_harness_pouches', cx - 4.4 * sc, m.waistY + dropY - 3.4 * sc, 9.8 * sc, 3.2 * sc, DARK_LEATHER, { roundCorners: true });
    paintSpecimenVial(c, cx - 1.0 * sc, m.waistY + dropY - 1.8 * sc, 4, 6);

    // Bent explorer arm extending forward-downward holding metallic optical botanical scanner wand!
    const shX = cx + 1.6 * sc;
    const shY = m.torsoTopY + dropY + 2.5 * sc;
    const elbX = cx + 6.8 * sc;
    const elbY = m.torsoTopY + dropY + 8.0 * sc;
    const handX = cx + 12.6 * sc;
    const handY = m.groundY - 7.0 * sc;
    c.sculptBezierTube('l11_front_arm_lens', [shX, shY], [elbX, elbY], [handX, handY], 2.8 * sc, 2.0 * sc, SUIT, { lightBias: 0.12, outlineDark: 'S0', outlineLight: 'S5', clip });
    c.sculptBeveledBox('l11_front_arm_lens', shX - 1.0 * sc, shY + 1.0 * sc, 3, 2.5, VISOR); // Meridian shoulder patch!
    c.sculptVolume('l11_front_arm_lens', handX, handY, 2.2 * sc, 1.9 * sc, DARK_LEATHER, { outlineDark: 'B0', outlineLight: 'B4', clip });

    // Detailed angled titanium botanical micro-probe + glowing cyan scan cone illuminating ground!
    const tipX = handX + 5.0 * sc;
    const tipY = handY + 2.2 * sc;
    c.line('l11_front_arm_lens', handX + 1, handY, tipX, tipY, 'M4');
    c.line('l11_front_arm_lens', handX + 1, handY + 1, tipX - 0.5, tipY + 1, 'M1');
    c.px('l12_specular_glow', tipX, tipY, 'L3');
    // Delicate translucent cyan triangular scan beam touching ground specimen!
    for (let dy = 1; dy <= 5; dy++) {
      const halfSpan = Math.round(dy * 0.65);
      for (let dx = -halfSpan; dx <= halfSpan; dx++) {
        const px = Math.round(tipX + dx + dy * 0.25);
        const py = Math.round(tipY + dy);
        if (px >= clip.x0 && px <= clip.x1 && py >= clip.y0 && py <= m.groundY) {
          c.px('l12_specular_glow', px, py, dy <= 2 ? 'L2' : 'L1', Math.max(70, 210 - dy * 28));
        }
      }
    }

    paintMaraHelmet(c, cx + 4.4 * sc, m.headY + dropY + 0.6 * sc, m.headRx, m.headRy, 'right', m.detailTier, true, clip);
  }

  // Final selective exterior contour polish
  c.applyExteriorSelOut('l01_outline', 'S0', 'S1', clip);

  const vpfJson = c.serializeVpf({
    id: `hr_mara_${preset}_${pose}`,
    name: `HIGH-RES STUDY — Dr. Mara Lin (${preset} · ${pose})`,
    pivot: { x: Math.round(m.cx), y: m.groundY },
    tileSize: preset === '32x48' ? 24 : 32,
    styleNotes: `Genuine native-resolution ${preset} high-craft study of Dr. Mara Lin (${pose}). Pass 2 studio-polished with 12 editable VPF layers and 48-color hue-shifted high-res palette — zero upscaling from 16x24.`,
  });

  return { canvas: c, vpfJson, width: m.w, height: m.h };
}
