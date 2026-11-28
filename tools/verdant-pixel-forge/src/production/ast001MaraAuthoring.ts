/**
 * VERDANT PIXEL FORGE — AST-001 Production Asset Authoring Module (Pass 2 Refined)
 * ---------------------------------------------------------------------------------
 * Authors Dr. Mara Lin (16x24 · 64 populated frames across 16 tags · 8 editable layers)
 * strictly through VERDANT PIXEL FORGE's pixel buffer, palette, and compositing APIs.
 *
 * Pass 2 Artistic Refinements Applied After Pass 1 Visual Review:
 *  1. Anchored backpack antenna strictly to backpack top (eliminated detached crouch antenna).
 *  2. Grounded dual-leg 3/4 explorer stance on Right/Left idle & scan (eliminated 1-leg look).
 *  3. Simplified side-profile ear pod into subtle dark steel so curved glass visor reads cleanly as ONE mass.
 *  4. Rebuilt 6-frame walk cycles (true pendulum leg/arm swing + clear Down/Up contact-recoil-passing)
 *     and stabilized Crouch Walk helmet/torso bob to eliminate jitter.
 *  5. Boldened pixel clusters (2-4px solid planes, reduced micro-noise & singletons dramatically).
 *  6. Sculpted clean, compact metallic parabolic Acoustic Field Lens with zero floating stray dots.
 *  7. Tucked Down-view backpack cleanly behind upper-left shoulder for crisp astronaut silhouette.
 *
 * Output exports via VERDANT PIXEL FORGE's `tag_rows` Godot sprite-sheet exporter to:
 *   - 96x384 RGBA8 PNG (6 cols x 16 rows = 96 cells: 64 populated + 32 transparent)
 *   - Pivot (8, 22) -> Godot Sprite2D.offset = Vector2(0, -10)
 *   - Zero horizontal mirroring (4 individually authored directions with locked top-left 45° sun)
 */
import type { AnimationFrame, AnimationTag, LayerNode, ProjectDocument } from '../types/studio';
import { createEmptyBuffer, hexToRgba, setPixel } from '../engine/pixelBuffer';
import { DEFAULT_PALETTES, VERDANT_MASTER_PALETTE } from '../engine/paletteEngine';

export type Direction4 = 'down' | 'up' | 'right' | 'left';
export type AnimState4 = 'idle' | 'walk' | 'crouch_walk' | 'lens_scan';

const PAL: Record<string, { r: number; g: number; b: number; a: number }> = Object.fromEntries(
  VERDANT_MASTER_PALETTE.colors.map((c) => [c.token!, hexToRgba(c.hex, 255)])
);

const W = 16;
const H = 24;

export const AST001_LAYERS: LayerNode[] = [
  { id: 'l01_back_pack', name: '01 Back Pack & Antenna', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l02_legs_boots', name: '02 Legs & Boots', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l03_suit_body', name: '03 Suit Torso & Arms', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l04_harness_belt', name: '04 Harness Belt & Vial', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l05_chest_front_pack', name: '05 Chest Rig / Front Pack', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l06_helmet_shell', name: '06 Helmet Shell & Collar', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l07_visor_glass', name: '07 Curved Teal Visor', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l08_acoustic_lens', name: '08 Acoustic Field Lens', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
];

type CelMap = Record<string, Uint8ClampedArray>;

function makeBlankCels(): CelMap {
  const cels: CelMap = {};
  for (const l of AST001_LAYERS) cels[l.id] = createEmptyBuffer(W, H);
  return cels;
}

function px(cels: CelMap, layerId: string, x: number, y: number, tok: string): void {
  const col = PAL[tok];
  if (!col) throw new Error(`Unknown palette token: ${tok}`);
  setPixel(cels[layerId], W, H, x, y, col);
}

function row(cels: CelMap, layerId: string, x0: number, y: number, tokens: string[]): void {
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (!t || t === '.') continue;
    px(cels, layerId, x0 + i, y, t);
  }
}

interface Kinematics {
  headDy: number;
  torsoDy: number;
  /** -1 = left back / right forward, 0 = neutral, +1 = left forward / right back */
  stridePhase: -2 | -1 | 0 | 1 | 2;
  /** Down/Up walk foot lift: -1 = left lifted, 0 = both planted, +1 = right lifted */
  frontBackLift: -1 | 0 | 1;
  armSwing: -1 | 0 | 1;
  crouch: boolean;
  scanning: boolean;
  pulseOn: boolean;
  blinkPip: boolean;
}

function getAnimKinematics(state: AnimState4, col: number): Kinematics {
  if (state === 'idle') {
    // Calm, steady explorer idle: frame 0 neutral, frame 1 chest LED pulse, frame 2 subtle breath settle (torso/shoulders only), frame 3 recover
    return {
      headDy: col === 2 ? 1 : 0,
      torsoDy: col === 2 ? 1 : 0,
      stridePhase: 0,
      frontBackLift: 0,
      armSwing: 0,
      crouch: false,
      scanning: false,
      pulseOn: false,
      blinkPip: col === 1 || col === 2,
    };
  }

  if (state === 'walk') {
    // Exact AST-001 6-frame walk cycle:
    // 0: L-contact | 1: Down recoil (+1px) | 2: Passing | 3: R-contact | 4: Down recoil (+1px) | 5: Passing
    const table: Kinematics[] = [
      { headDy: 0, torsoDy: 0, stridePhase: 2, frontBackLift: 1, armSwing: 1, crouch: false, scanning: false, pulseOn: false, blinkPip: true },
      { headDy: 1, torsoDy: 1, stridePhase: 1, frontBackLift: 1, armSwing: 1, crouch: false, scanning: false, pulseOn: false, blinkPip: false },
      { headDy: 0, torsoDy: 0, stridePhase: 0, frontBackLift: 0, armSwing: 0, crouch: false, scanning: false, pulseOn: false, blinkPip: false },
      { headDy: 0, torsoDy: 0, stridePhase: -2, frontBackLift: -1, armSwing: -1, crouch: false, scanning: false, pulseOn: false, blinkPip: true },
      { headDy: 1, torsoDy: 1, stridePhase: -1, frontBackLift: -1, armSwing: -1, crouch: false, scanning: false, pulseOn: false, blinkPip: false },
      { headDy: 0, torsoDy: 0, stridePhase: 0, frontBackLift: 0, armSwing: 0, crouch: false, scanning: false, pulseOn: false, blinkPip: false },
    ];
    return table[col % 6];
  }

  if (state === 'crouch_walk') {
    // Compact stealth height ~17px (y=6..22), rock-steady head height with deliberate 4-frame creep stride!
    const table: Kinematics[] = [
      { headDy: 4, torsoDy: 3, stridePhase: 2, frontBackLift: 1, armSwing: 1, crouch: true, scanning: false, pulseOn: false, blinkPip: false },
      { headDy: 4, torsoDy: 3, stridePhase: 0, frontBackLift: 0, armSwing: 0, crouch: true, scanning: false, pulseOn: false, blinkPip: true },
      { headDy: 4, torsoDy: 3, stridePhase: -2, frontBackLift: -1, armSwing: -1, crouch: true, scanning: false, pulseOn: false, blinkPip: false },
      { headDy: 4, torsoDy: 3, stridePhase: 0, frontBackLift: 0, armSwing: 0, crouch: true, scanning: false, pulseOn: false, blinkPip: false },
    ];
    return table[col % 4];
  }

  // lens_scan (2 frames @ 4 FPS): Steady raised scanner, frame 1 harmonic receiver flare
  return {
    headDy: 0,
    torsoDy: 0,
    stridePhase: 0,
    frontBackLift: 0,
    armSwing: 0,
    crouch: false,
    scanning: true,
    pulseOn: col === 1,
    blinkPip: col === 1,
  };
}

// ==============================================================================
// DIRECTION 0: DOWN (SOUTH) — Iconic Mara Lin v2 Front Silhouette
// ==============================================================================
function paintDown(cels: CelMap, state: AnimState4, col: number): void {
  const k = getAnimKinematics(state, col);
  const hy = 2 + k.headDy;
  const ty = 10 + k.torsoDy;

  // --- 01 BACKPACK & ANTENNA (Tucked cleanly behind upper-left shoulder, ALWAYS bolted!) ---
  const bpTop = ty - 2;
  px(cels, 'l01_back_pack', 2, bpTop - 3, k.blinkPip ? 'V4' : 'M4');
  px(cels, 'l01_back_pack', 2, bpTop - 2, 'M2');
  px(cels, 'l01_back_pack', 2, bpTop - 1, 'M2');
  row(cels, 'l01_back_pack', 2, bpTop, ['M3', 'M2']);
  row(cels, 'l01_back_pack', 2, bpTop + 1, ['M3', 'M1']);
  row(cels, 'l01_back_pack', 2, bpTop + 2, ['M2', 'M1']);

  // --- 02 LEGS & BOOTS (Bold 3px legs, clear forward/back step shading, grounded at y=22!) ---
  const lBack = k.frontBackLift < 0; // left leg stepped back
  const rBack = k.frontBackLift > 0; // right leg stepped back
  const lSoleY = lBack ? 21 : 22;
  const rSoleY = rBack ? 21 : 22;

  if (k.crouch) {
    // Athletic crouched thighs cleanly aligned with waist width (x=4..11) and crisp knee separation!
    row(cels, 'l02_legs_boots', 4, 17, ['S4', 'S4', 'S3', 'S1', 'S1', 'S3', 'S2', 'S1']);
    row(cels, 'l02_legs_boots', 4, 18, ['B2', 'B1', 'B0', '.', '.', 'B1', 'B1', 'B0']);
    row(cels, 'l02_legs_boots', 4, 19, ['S3', 'S2', 'S1', '.', '.', 'S2', 'S1', 'S0']);
  } else {
    row(cels, 'l02_legs_boots', 4, 16, ['S4', 'S4', 'S3', 'S2', 'S1', 'S3', 'S2', 'S2']);
    row(cels, 'l02_legs_boots', 4, 17, lBack ? ['S2', 'S2', 'S1'] : ['S4', 'S4', 'S2']);
    row(cels, 'l02_legs_boots', 9, 17, rBack ? ['S2', 'S1', 'S0'] : ['S3', 'S3', 'S1']);
    // Knee guards (clean 3x1 dark umber clusters!)
    row(cels, 'l02_legs_boots', 4, lBack ? 18 : 18, lBack ? ['B1', 'B0', 'B0'] : ['B2', 'B1', 'B0']);
    row(cels, 'l02_legs_boots', 9, rBack ? 18 : 18, rBack ? ['B0', 'B0', 'B0'] : ['B2', 'B1', 'B0']);
    // Lower calves
    row(cels, 'l02_legs_boots', 4, 19, lBack ? ['S2', 'S1', 'S0'] : ['S3', 'S3', 'S1']);
    row(cels, 'l02_legs_boots', 9, 19, rBack ? ['S1', 'S1', 'S0'] : ['S3', 'S2', 'S1']);
  }

  // Left Boot (viewer's left)
  row(cels, 'l02_legs_boots', 4, lSoleY - 2, lBack ? ['B1', 'B1', 'B0'] : ['B2', 'B2', 'B1']);
  row(cels, 'l02_legs_boots', 3, lSoleY - 1, lBack ? ['.', 'B1', 'B1', 'B0'] : ['B3', 'B2', 'B1', 'B0']);
  row(cels, 'l02_legs_boots', 3, lSoleY, lBack ? ['.', 'B0', 'B0', 'B0'] : ['B1', 'B0', 'B0', 'B0']);

  // Right Boot (viewer's right)
  row(cels, 'l02_legs_boots', 9, rSoleY - 2, rBack ? ['B1', 'B0', 'B0'] : ['B2', 'B1', 'B0']);
  row(cels, 'l02_legs_boots', 9, rSoleY - 1, rBack ? ['B1', 'B0', 'B0'] : ['B2', 'B2', 'B1', 'B0']);
  row(cels, 'l02_legs_boots', 9, rSoleY, rBack ? ['B0', 'B0', 'B0'] : ['B0', 'B0', 'B0', 'B0']);

  // --- 03 SUIT TORSO & ARMS (Bold painterly orange clusters!) ---
  const lArmDy = k.armSwing > 0 ? 1 : k.armSwing < 0 ? -1 : 0;
  const rArmDy = k.scanning ? 0 : -lArmDy;

  row(cels, 'l03_suit_body', 3, ty, ['S4', 'S4', 'S4', 'S3', 'S3', 'S3', 'S2', 'S2', 'S2', 'S1']);
  row(cels, 'l03_suit_body', 3, ty + 1, ['S4', 'S4', 'S3', 'S3', 'S3', 'S2', 'S2', 'S2', 'S2', 'S1']);
  row(cels, 'l03_suit_body', 3, ty + 2, ['S3', 'S4', 'S3', 'S3', 'S2', 'S2', 'S2', 'S2', 'S1', 'S1']);
  if (!k.crouch) {
    row(cels, 'l03_suit_body', 4, ty + 3, ['S3', 'S3', 'S3', 'S2', 'S2', 'S2', 'S1', 'S1']);
    row(cels, 'l03_suit_body', 4, ty + 4, ['S4', 'S4', 'S3', 'S3', 'S2', 'S2', 'S1', 'S1']);
  }

  // Viewer's LEFT Arm (sunlit orange + crisp teal shoulder patch)
  const laBase = ty + 1 + (lArmDy < 0 ? -1 : 0);
  row(cels, 'l03_suit_body', 2, laBase, ['S4', 'S4']);
  row(cels, 'l03_suit_body', 2, laBase + 1, ['V3', 'S4']); // signature teal shoulder patch
  row(cels, 'l03_suit_body', 2, ty + 3 + lArmDy, ['S3', 'S3']);
  row(cels, 'l03_suit_body', 2, ty + 4 + lArmDy, ['B2', 'B1']); // dark brown insulated glove

  // Viewer's RIGHT Arm (scanner hand!)
  if (k.scanning) {
    row(cels, 'l03_suit_body', 12, ty + 1, ['S2', 'S2']);
    row(cels, 'l03_suit_body', 12, ty + 2, ['S2', 'S1']);
    row(cels, 'l03_suit_body', 11, ty + 3, ['B2', 'B1']);
  } else {
    const raBase = ty + 1 + (rArmDy < 0 ? -1 : 0);
    row(cels, 'l03_suit_body', 12, raBase, ['S2', 'S2']);
    row(cels, 'l03_suit_body', 12, raBase + 1, ['S2', 'S1']);
    row(cels, 'l03_suit_body', 12, ty + 3 + rArmDy, ['S2', 'S1']);
    row(cels, 'l03_suit_body', 12, ty + 4 + rArmDy, ['B1', 'B0']); // dark glove
  }

  // --- 04 HARNESS, UTILITY BELT & RIGHT-HIP MOSS SPECIMEN VIAL ---
  const beltY = k.crouch ? ty + 3 : ty + 5;
  for (let y = ty; y < beltY; y++) {
    px(cels, 'l04_harness_belt', 5, y, 'B1');
    px(cels, 'l04_harness_belt', 10, y, 'B0');
  }
  row(cels, 'l04_harness_belt', 4, beltY, ['B2', 'B1', 'B1', 'M3', 'M3', 'B0', 'B1', 'B0']);
  // Viewer's RIGHT hip: crisp 2px glowing moss specimen vial!
  row(cels, 'l04_harness_belt', 10, beltY + 1, ['O3', 'O2']);

  // --- 05 CHEST TELEMETRY RIG (Clean bold titanium bezel + teal screen) ---
  row(cels, 'l05_chest_front_pack', 6, ty + 1, ['M3', 'M3', 'M2', 'M1']);
  row(cels, 'l05_chest_front_pack', 6, ty + 2, ['M2', k.blinkPip ? 'V4' : 'V3', 'V2', 'M1']);
  if (!k.crouch) {
    row(cels, 'l05_chest_front_pack', 6, ty + 3, ['M1', 'M1', 'M1', 'M0']);
  }

  // --- 06 HELMET SHELL & COLLAR (Bold sunlit orange dome + clean ivory crown stripe!) ---
  row(cels, 'l06_helmet_shell', 5, hy, ['S4', 'S4', 'O5', 'O5', 'S3', 'S2']);
  row(cels, 'l06_helmet_shell', 4, hy + 1, ['S4', 'S4', 'S4', 'O5', 'O5', 'S3', 'S2', 'S2']);
  // Side ear pods (compact weathered steel so visor dominates!)
  px(cels, 'l06_helmet_shell', 3, hy + 2, 'M2'); px(cels, 'l06_helmet_shell', 4, hy + 2, 'S3');
  px(cels, 'l06_helmet_shell', 11, hy + 2, 'S2'); px(cels, 'l06_helmet_shell', 12, hy + 2, 'M1');
  px(cels, 'l06_helmet_shell', 3, hy + 3, 'M3'); px(cels, 'l06_helmet_shell', 4, hy + 3, 'S3');
  px(cels, 'l06_helmet_shell', 11, hy + 3, 'S1'); px(cels, 'l06_helmet_shell', 12, hy + 3, 'M0');
  px(cels, 'l06_helmet_shell', 3, hy + 4, 'M1'); px(cels, 'l06_helmet_shell', 4, hy + 4, 'S2');
  px(cels, 'l06_helmet_shell', 11, hy + 4, 'S1'); px(cels, 'l06_helmet_shell', 12, hy + 4, 'M0');
  row(cels, 'l06_helmet_shell', 4, hy + 5, ['S2', 'S2', 'S2', 'S1', 'S1', 'S1', 'S1', 'S0']);
  row(cels, 'l06_helmet_shell', 5, hy + 6, ['S2', 'S2', 'M1', 'M0', 'S1', 'S0']);
  // Heavy Titanium Neck Ring
  row(cels, 'l06_helmet_shell', 4, hy + 7, ['M3', 'M3', 'M2', 'M2', 'M1', 'M1', 'M0', 'M0']);

  // --- 07 CURVED DARK-TEAL GLASS VISOR (Deep glassy mass + crisp top-left arc!) ---
  row(cels, 'l07_visor_glass', 5, hy + 2, ['V3', 'V5', 'V4', 'V2', 'V1', 'V0']);
  row(cels, 'l07_visor_glass', 5, hy + 3, ['V5', 'M5', 'V3', 'V2', 'V1', 'V0']);
  row(cels, 'l07_visor_glass', 5, hy + 4, ['V2', 'V2', 'V1', 'V1', 'V0', 'V0']);
  row(cels, 'l07_visor_glass', 5, hy + 5, ['V1', 'V1', 'V0', 'V0', 'V0', 'V0']);

  // --- 08 ACOUSTIC FIELD LENS (Clean parabolic metallic dish, ZERO stray confetti dots!) ---
  if (k.scanning) {
    row(cels, 'l08_acoustic_lens', 11, ty + 2, ['M3', 'M4', 'M3']);
    row(cels, 'l08_acoustic_lens', 10, ty + 3, ['M3', k.pulseOn ? 'M5' : 'V3', k.pulseOn ? 'V5' : 'V3', 'M2']);
    row(cels, 'l08_acoustic_lens', 10, ty + 4, ['M2', k.pulseOn ? 'V5' : 'V2', k.pulseOn ? 'V4' : 'V1', 'M1']);
    row(cels, 'l08_acoustic_lens', 11, ty + 5, ['M1', 'M0', 'M0']);
  }
}

// ==============================================================================
// DIRECTION 1: UP (NORTH) — Iconic Full Brushed-Titanium Backpack & O2 Tank
// ==============================================================================
function paintUp(cels: CelMap, state: AnimState4, col: number): void {
  const k = getAnimKinematics(state, col);
  const hy = 2 + k.headDy;
  const ty = 10 + k.torsoDy;

  // --- 02 LEGS & BOOTS (Clear walk stride lift, grounded at y=22!) ---
  const lBack = k.frontBackLift < 0;
  const rBack = k.frontBackLift > 0;
  const lSoleY = lBack ? 21 : 22;
  const rSoleY = rBack ? 21 : 22;

  if (k.crouch) {
    row(cels, 'l02_legs_boots', 4, 17, ['S3', 'S3', 'S2', 'S2', 'S1', 'S2', 'S2', 'S1']);
    row(cels, 'l02_legs_boots', 4, 18, ['S3', 'S2', 'S1', '.', '.', 'S2', 'S1', 'S1']);
    row(cels, 'l02_legs_boots', 4, 19, ['B2', 'B1', 'B0', '.', '.', 'B1', 'B1', 'B0']);
  } else {
    row(cels, 'l02_legs_boots', 4, 16, ['S4', 'S3', 'S3', 'S2', 'S1', 'S2', 'S2', 'S1']);
    row(cels, 'l02_legs_boots', 4, 17, lBack ? ['S2', 'S2', 'S1'] : ['S4', 'S3', 'S2']);
    row(cels, 'l02_legs_boots', 9, 17, rBack ? ['S2', 'S1', 'S0'] : ['S3', 'S2', 'S1']);
    row(cels, 'l02_legs_boots', 4, 18, lBack ? ['S2', 'S1', 'S0'] : ['S3', 'S3', 'S1']);
    row(cels, 'l02_legs_boots', 9, 18, rBack ? ['S1', 'S1', 'S0'] : ['S2', 'S2', 'S1']);
    row(cels, 'l02_legs_boots', 4, 19, lBack ? ['S2', 'S1', 'S0'] : ['S3', 'S2', 'S1']);
    row(cels, 'l02_legs_boots', 9, 19, rBack ? ['S1', 'S0', 'S0'] : ['S2', 'S1', 'S0']);
  }

  row(cels, 'l02_legs_boots', 4, lSoleY - 2, ['B2', 'B1', 'B0']);
  row(cels, 'l02_legs_boots', 4, lSoleY - 1, ['B2', 'B1', 'B0']);
  row(cels, 'l02_legs_boots', 4, lSoleY, ['B0', 'B0', 'B0']);

  row(cels, 'l02_legs_boots', 9, rSoleY - 2, ['B1', 'B1', 'B0']);
  row(cels, 'l02_legs_boots', 9, rSoleY - 1, ['B1', 'B0', 'B0']);
  row(cels, 'l02_legs_boots', 9, rSoleY, ['B0', 'B0', 'B0']);

  // --- 03 SUIT SHOULDERS & ARMS ---
  const lArmDy = k.scanning ? -2 : k.armSwing > 0 ? 1 : k.armSwing < 0 ? -1 : 0;
  const rArmDy = k.armSwing > 0 ? -1 : k.armSwing < 0 ? 1 : 0;

  row(cels, 'l03_suit_body', 3, ty, ['S4', 'S4', 'S3', 'S3', 'S2', 'S2', 'S2', 'S2', 'S1', 'S1']);
  if (k.scanning) {
    row(cels, 'l03_suit_body', 2, ty - 1, ['S4', 'S3']);
    row(cels, 'l03_suit_body', 2, ty, ['S3', 'S3']);
    row(cels, 'l03_suit_body', 2, ty + 1, ['S3', 'S2']);
  } else {
    const laBase = ty + 1 + (lArmDy < 0 ? -1 : 0);
    row(cels, 'l03_suit_body', 2, laBase, ['S4', 'S3']);
    row(cels, 'l03_suit_body', 2, laBase + 1, ['S3', 'S3']);
    row(cels, 'l03_suit_body', 2, ty + 3 + lArmDy, ['S3', 'S2']);
    row(cels, 'l03_suit_body', 2, ty + 4 + lArmDy, ['B2', 'B1']);
  }

  const raBase = ty + 1 + (rArmDy < 0 ? -1 : 0);
  row(cels, 'l03_suit_body', 12, raBase, ['S2', 'S2']);
  row(cels, 'l03_suit_body', 12, raBase + 1, ['S2', 'V2']); // Teal arm patch on viewer's right (true 180° flip!)
  row(cels, 'l03_suit_body', 12, ty + 3 + rArmDy, ['S2', 'S1']);
  row(cels, 'l03_suit_body', 12, ty + 4 + rArmDy, ['B1', 'B0']);

  // --- 04 BELT & LEFT-HIP MOSS VIAL ---
  const beltY = k.crouch ? ty + 3 : ty + 5;
  row(cels, 'l04_harness_belt', 4, beltY, ['O3', 'B1', 'B1', 'B1', 'B0', 'B0', 'B1', 'B0']);
  px(cels, 'l04_harness_belt', 4, beltY + 1, 'O2'); // moss canister peeking on viewer's left hip

  // --- 05 FULL BACKPACK, O2 CYLINDER & BOLTED ANTENNA (Viewer's RIGHT — true 180° from DOWN!) ---
  const packTop = ty - 1;
  // Antenna ALWAYS bolted solidly straight into top-right of backpack (x=11)!
  px(cels, 'l01_back_pack', 11, packTop - 4, k.blinkPip ? 'V4' : 'M4');
  px(cels, 'l01_back_pack', 11, packTop - 3, 'M2');
  px(cels, 'l01_back_pack', 11, packTop - 2, 'M2');
  px(cels, 'l01_back_pack', 11, packTop - 1, 'M1');

  row(cels, 'l05_chest_front_pack', 4, packTop, ['M3', 'M4', 'M4', 'M3', 'M2', 'M2', 'M3', 'M2']);
  row(cels, 'l05_chest_front_pack', 4, packTop + 1, ['M4', 'M3', 'M3', 'M3', 'M2', 'M1', 'M3', 'M2']);
  row(cels, 'l05_chest_front_pack', 4, packTop + 2, ['M3', k.blinkPip ? 'V4' : 'V3', 'M2', 'M2', 'M1', 'B0', 'S3', 'S2']);
  row(cels, 'l05_chest_front_pack', 4, packTop + 3, ['M2', 'M2', 'M2', 'M1', 'M1', 'B0', 'M2', 'M1']);
  row(cels, 'l05_chest_front_pack', 4, packTop + 4, ['M2', 'M1', 'M1', 'M1', 'M0', 'B0', 'M1', 'M0']);
  if (!k.crouch) {
    row(cels, 'l05_chest_front_pack', 4, packTop + 5, ['B1', 'B1', 'B0', 'B0', 'B0', 'B0', 'M1', 'M0']);
  }
  // Curved shoulder hose connecting top-left pack into helmet collar
  px(cels, 'l05_chest_front_pack', 4, hy + 6, 'B1');

  // --- 06 HELMET BACK DOME (Bold clusters + warm ivory vertical stripe!) ---
  row(cels, 'l06_helmet_shell', 5, hy, ['S4', 'S4', 'O5', 'O5', 'S3', 'S2']);
  row(cels, 'l06_helmet_shell', 4, hy + 1, ['S4', 'S4', 'S4', 'O5', 'O5', 'S3', 'S2', 'S2']);
  row(cels, 'l06_helmet_shell', 3, hy + 2, ['M2', 'S4', 'S4', 'S3', 'O5', 'M4', 'S2', 'S2', 'S1', 'M1']);
  row(cels, 'l06_helmet_shell', 3, hy + 3, ['M3', 'S3', 'S4', 'S3', 'M4', 'M3', 'S2', 'S2', 'S1', 'M0']);
  row(cels, 'l06_helmet_shell', 3, hy + 4, ['M1', 'S3', 'S3', 'S3', 'M3', 'M2', 'S2', 'S1', 'S1', 'M0']);
  row(cels, 'l06_helmet_shell', 4, hy + 5, ['S2', 'S2', 'S2', 'S2', 'S1', 'S1', 'S1', 'S0']);
  row(cels, 'l06_helmet_shell', 5, hy + 6, ['S2', 'S1', 'S1', 'S1', 'S0', 'S0']);
  row(cels, 'l06_helmet_shell', 4, hy + 7, ['M3', 'M3', 'M2', 'M2', 'M1', 'M1', 'M0', 'M0']);

  // --- 08 ACOUSTIC LENS RAISED NORTH (viewer's LEFT shoulder!) ---
  if (k.scanning) {
    row(cels, 'l08_acoustic_lens', 1, hy + 4, ['M3', 'M4', 'M3']);
    row(cels, 'l08_acoustic_lens', 1, hy + 5, [k.pulseOn ? 'V5' : 'V3', k.pulseOn ? 'M5' : 'V4', 'M2']);
    row(cels, 'l08_acoustic_lens', 1, hy + 6, ['M2', 'M1', 'B1']);
  }
}

// ==============================================================================
// DIRECTION 2: RIGHT (EAST) — Grounded Dual-Leg 3/4 Stance, Sunlit Backpack LEFT,
// Clean Curved Visor RIGHT, Near Teal Arm Patch & Leather Hip Pouch!
// ==============================================================================
function paintRight(cels: CelMap, state: AnimState4, col: number): void {
  const k = getAnimKinematics(state, col);
  const hy = 2 + k.headDy;
  const ty = 10 + k.torsoDy;
  const leanX = k.crouch ? 1 : 0;

  // --- 01 BACKPACK & BOLTED ANTENNA ON BACK (viewer's LEFT — sunlit by top-left key light!) ---
  const bpY = ty - 1;
  px(cels, 'l01_back_pack', 3, bpY - 4, k.blinkPip ? 'V4' : 'M5');
  px(cels, 'l01_back_pack', 3, bpY - 3, 'M3');
  px(cels, 'l01_back_pack', 3, bpY - 2, 'M2');
  px(cels, 'l01_back_pack', 3, bpY - 1, 'M2');

  row(cels, 'l01_back_pack', 2, bpY, ['M4', 'M4', 'M3', 'M2']);
  row(cels, 'l01_back_pack', 2, bpY + 1, ['M4', 'M4', 'M3', 'M2']);
  row(cels, 'l01_back_pack', 2, bpY + 2, ['S4', 'S3', 'M2', 'M1']); // orange cylinder strap
  row(cels, 'l01_back_pack', 2, bpY + 3, ['M3', k.blinkPip ? 'V4' : 'V3', 'M2', 'M1']);
  row(cels, 'l01_back_pack', 2, bpY + 4, ['M2', 'M2', 'M1', 'M0']);
  if (!k.crouch) row(cels, 'l01_back_pack', 3, bpY + 5, ['M1', 'M1', 'M0']);

  // --- 02 DUAL LEGS & BOOTS (Grounded 3/4 stance on idle/scan; crisp scissors+passing stride on walk!) ---
  const legY = k.crouch ? 17 : 16;
  const isPassing = (state === 'walk' || state === 'crouch_walk') && k.stridePhase === 0;
  const nearX = isPassing ? 7 : k.stridePhase === 2 ? 9 : k.stridePhase === 1 ? 8 : k.stridePhase === -2 ? 5 : k.stridePhase === -1 ? 6 : 8;
  const farX = isPassing ? 6 : k.stridePhase === 2 ? 5 : k.stridePhase === 1 ? 6 : k.stridePhase === -2 ? 9 : k.stridePhase === -1 ? 8 : 5;
  const farLift = isPassing ? -1 : 0;

  // Far/Back Leg (deeper warm shadow S2/S1 + dark boot B1/B0 so depth separation is unmistakable!)
  row(cels, 'l02_legs_boots', farX, legY, ['S2', 'S2', 'S1']);
  row(cels, 'l02_legs_boots', farX, legY + 1, ['S2', 'S1', 'S1']);
  if (!k.crouch) {
    row(cels, 'l02_legs_boots', farX, legY + 2 + farLift, ['B1', 'B1', 'B0']);
    row(cels, 'l02_legs_boots', farX, legY + 3 + farLift, ['S2', 'S1', 'S0']);
  }
  row(cels, 'l02_legs_boots', farX, 20 + farLift, ['B1', 'B1', 'B0']);
  row(cels, 'l02_legs_boots', farX, 21 + farLift, ['B1', 'B1', 'B1', 'B0']);
  row(cels, 'l02_legs_boots', farX, 22 + farLift, ['B0', 'B0', 'B0', 'B0']);

  // Near/Front Leg (bright sunlit orange S4/S3 + crisp dark knee pad + heavy boot!)
  row(cels, 'l02_legs_boots', nearX, legY, ['S4', 'S4', 'S2']);
  row(cels, 'l02_legs_boots', nearX, legY + 1, ['S4', 'S3', 'S2']);
  if (!k.crouch) {
    row(cels, 'l02_legs_boots', nearX, legY + 2, ['S3', 'B2', 'B1']);
    row(cels, 'l02_legs_boots', nearX, legY + 3, ['S3', 'S2', 'S1']);
  } else {
    row(cels, 'l02_legs_boots', nearX, legY + 2, ['B2', 'B2', 'B1']);
  }
  row(cels, 'l02_legs_boots', nearX, 20, ['B2', 'M3', 'B1']);
  row(cels, 'l02_legs_boots', nearX, 21, ['B2', 'B2', 'B3', 'B1']); // toe points RIGHT
  row(cels, 'l02_legs_boots', nearX, 22, ['B1', 'B0', 'B0', 'B0']);

  // Hip bridge
  row(cels, 'l02_legs_boots', 6, legY, ['S3', 'S3', 'S2']);

  // --- 03 SUIT TORSO & NEAR ARM (Near side = Teal Arm Patch!) ---
  row(cels, 'l03_suit_body', 5 + leanX, ty, ['S4', 'S4', 'S4', 'S3', 'S3', 'S2']);
  row(cels, 'l03_suit_body', 5 + leanX, ty + 1, ['S4', 'S4', 'S3', 'S3', 'S2', 'S2']);
  row(cels, 'l03_suit_body', 5 + leanX, ty + 2, ['S4', 'S4', 'S3', 'S3', 'S2', 'S1']);
  if (!k.crouch) {
    row(cels, 'l03_suit_body', 5 + leanX, ty + 3, ['S3', 'S3', 'S3', 'S2', 'S2', 'S1']);
    row(cels, 'l03_suit_body', 5 + leanX, ty + 4, ['S3', 'S3', 'S2', 'S2', 'S1', 'S1']);
  }

  // Far-side right arm extends forward in lens_scan_right
  if (k.scanning) {
    row(cels, 'l03_suit_body', 10 + leanX, ty + 1, ['S3', 'S2']);
    row(cels, 'l03_suit_body', 10 + leanX, ty + 2, ['B2', 'B1']);
  }

  // Near-side Arm (swings opposite near leg, displays signature Teal Shoulder Patch!)
  const armDx = k.stridePhase > 0 ? -1 : k.stridePhase < 0 ? 1 : 0;
  const armX = 6 + leanX + armDx;
  row(cels, 'l03_suit_body', armX, ty + 1, ['S4', 'S4', 'S3']);
  row(cels, 'l03_suit_body', armX, ty + 2, ['S4', 'V3', 'S3']); // Teal Patch
  row(cels, 'l03_suit_body', armX + (armDx > 0 ? 1 : 0), ty + 3, ['S3', 'S2']);
  row(cels, 'l03_suit_body', armX + (armDx > 0 ? 1 : 0), ty + 4, ['B2', 'B1']); // dark glove

  // --- 04 HARNESS, BELT & NEAR-SIDE LEATHER HIP POUCH ---
  const beltY = k.crouch ? ty + 3 : ty + 5;
  px(cels, 'l04_harness_belt', 8 + leanX, ty, 'B2');
  px(cels, 'l04_harness_belt', 9 + leanX, ty + 1, 'B1');
  row(cels, 'l04_harness_belt', 5 + leanX, beltY, ['B2', 'B2', 'B1', 'B1', 'M3', 'B0']);
  px(cels, 'l04_harness_belt', 6 + leanX, beltY + 1, 'B1'); // leather pouch

  // --- 05 CHEST TELEMETRY EDGE ---
  px(cels, 'l05_chest_front_pack', 10 + leanX, ty + 1, 'M3');
  px(cels, 'l05_chest_front_pack', 10 + leanX, ty + 2, k.blinkPip ? 'V4' : 'V3');
  if (!k.crouch) px(cels, 'l05_chest_front_pack', 10 + leanX, ty + 3, 'M1');

  // --- 06 HELMET SHELL (Clean 3/4 Profile Facing RIGHT — Subtle steel ear pod, ZERO bug eyes!) ---
  const hx = 4 + leanX;
  row(cels, 'l06_helmet_shell', hx + 1, hy, ['S4', 'S4', 'O5', 'S4', 'S3', 'S2']);
  row(cels, 'l06_helmet_shell', hx, hy + 1, ['S4', 'S4', 'S4', 'O5', 'S3', 'S2', 'S2']);
  row(cels, 'l06_helmet_shell', hx, hy + 2, ['S4', 'S4', 'S3', 'S3']);
  row(cels, 'l06_helmet_shell', hx, hy + 3, ['S3', 'M2', 'M1', 'S2']); // subtle dark steel ear pod!
  row(cels, 'l06_helmet_shell', hx, hy + 4, ['S3', 'M1', 'M1', 'S2']);
  row(cels, 'l06_helmet_shell', hx + 1, hy + 5, ['S2', 'S2', 'S2', 'S1', 'S1', 'S0']);
  row(cels, 'l06_helmet_shell', hx + 2, hy + 6, ['S2', 'S1', 'M1', 'M0', 'S0']);
  row(cels, 'l06_helmet_shell', hx + 1, hy + 7, ['M3', 'M3', 'M2', 'M2', 'M1', 'M0']);

  // --- 07 CURVED GLASS VISOR (ONE unmistakable deep dark-teal glass mass facing RIGHT!) ---
  row(cels, 'l07_visor_glass', hx + 4, hy + 2, ['V3', 'V5', 'V3', 'V1']);
  row(cels, 'l07_visor_glass', hx + 4, hy + 3, ['V3', 'M5', 'V2', 'V0']);
  row(cels, 'l07_visor_glass', hx + 4, hy + 4, ['V1', 'V1', 'V0', 'V0']);
  row(cels, 'l07_visor_glass', hx + 4, hy + 5, ['V1', 'V0', 'V0']);

  // --- 08 ACOUSTIC FIELD LENS (Compact parabolic metallic dish aimed EAST w/ solid grip!) ---
  if (k.scanning) {
    const lx = 11 + leanX;
    row(cels, 'l08_acoustic_lens', lx + 1, ty, ['M3', 'M4', 'M3']);
    row(cels, 'l08_acoustic_lens', lx, ty + 1, ['M3', 'M2', k.pulseOn ? 'M5' : 'V3', k.pulseOn ? 'V5' : 'V3']);
    row(cels, 'l08_acoustic_lens', lx - 1, ty + 2, ['B2', 'B1', 'M2', k.pulseOn ? 'V5' : 'V2', k.pulseOn ? 'V4' : 'V1']);
    row(cels, 'l08_acoustic_lens', lx, ty + 3, ['B1', 'M1', 'M1', 'M0']);
  }
}

// ==============================================================================
// DIRECTION 3: LEFT (WEST) — INDIVIDUALLY AUTHORED (ZERO HORIZONTAL MIRRORING!)
// Top-left 45° key light hits FRONT curved visor, chest & nose brightly;
// rear backpack falls into deep cool steel shadow; NEAR side displays Green Moss Vial!
// ==============================================================================
function paintLeft(cels: CelMap, state: AnimState4, col: number): void {
  const k = getAnimKinematics(state, col);
  const hy = 2 + k.headDy;
  const ty = 10 + k.torsoDy;
  const leanX = k.crouch ? -1 : 0;

  // --- 01 BACKPACK & BOLTED ANTENNA ON BACK (viewer's RIGHT — shaded cool steel!) ---
  const bpY = ty - 1;
  px(cels, 'l01_back_pack', 12, bpY - 4, k.blinkPip ? 'V4' : 'M3');
  px(cels, 'l01_back_pack', 12, bpY - 3, 'M2');
  px(cels, 'l01_back_pack', 12, bpY - 2, 'M1');
  px(cels, 'l01_back_pack', 12, bpY - 1, 'M1');

  row(cels, 'l01_back_pack', 10, bpY, ['M2', 'M2', 'M2', 'M1']);
  row(cels, 'l01_back_pack', 10, bpY + 1, ['M2', 'M2', 'M1', 'M0']);
  row(cels, 'l01_back_pack', 10, bpY + 2, ['M1', 'S2', 'S1', 'S1']); // shaded O2 strap
  row(cels, 'l01_back_pack', 10, bpY + 3, ['M1', 'M1', k.blinkPip ? 'V4' : 'V2', 'M0']);
  row(cels, 'l01_back_pack', 10, bpY + 4, ['M1', 'M1', 'M0', 'M0']);
  if (!k.crouch) row(cels, 'l01_back_pack', 10, bpY + 5, ['M0', 'M0', 'M0']);

  // --- 02 DUAL LEGS & BOOTS (Grounded 3/4 stance on idle/scan; crisp scissors+passing stride on walk!) ---
  const legY = k.crouch ? 17 : 16;
  const isPassing = (state === 'walk' || state === 'crouch_walk') && k.stridePhase === 0;
  const nearX = isPassing ? 6 : k.stridePhase === 2 ? 4 : k.stridePhase === 1 ? 5 : k.stridePhase === -2 ? 8 : k.stridePhase === -1 ? 7 : 5;
  const farX = isPassing ? 7 : k.stridePhase === 2 ? 8 : k.stridePhase === 1 ? 7 : k.stridePhase === -2 ? 4 : k.stridePhase === -1 ? 5 : 8;
  const farLift = isPassing ? -1 : 0;

  // Far/Back Leg
  row(cels, 'l02_legs_boots', farX, legY, ['S2', 'S1', 'S1']);
  row(cels, 'l02_legs_boots', farX, legY + 1, ['S2', 'S1', 'S0']);
  if (!k.crouch) {
    row(cels, 'l02_legs_boots', farX, legY + 2 + farLift, ['B1', 'B0', 'B0']);
    row(cels, 'l02_legs_boots', farX, legY + 3 + farLift, ['S1', 'S1', 'S0']);
  }
  row(cels, 'l02_legs_boots', farX, 20 + farLift, ['B1', 'B0', 'B0']);
  row(cels, 'l02_legs_boots', farX - 1, 21 + farLift, ['B1', 'B1', 'B0', 'B0']);
  row(cels, 'l02_legs_boots', farX - 1, 22 + farLift, ['B0', 'B0', 'B0', 'B0']);

  // Near/Front Leg (front left edge catches warm top-left sunlight!)
  row(cels, 'l02_legs_boots', nearX, legY, ['S4', 'S4', 'S2']);
  row(cels, 'l02_legs_boots', nearX, legY + 1, ['S4', 'S3', 'S2']);
  if (!k.crouch) {
    row(cels, 'l02_legs_boots', nearX, legY + 2, ['B3', 'B2', 'S2']);
    row(cels, 'l02_legs_boots', nearX, legY + 3, ['S3', 'S2', 'S1']);
  } else {
    row(cels, 'l02_legs_boots', nearX, legY + 2, ['B3', 'B2', 'B1']);
  }
  row(cels, 'l02_legs_boots', nearX, 20, ['M3', 'B2', 'B1']);
  row(cels, 'l02_legs_boots', nearX - 1, 21, ['B3', 'B2', 'B2', 'B0']); // toe points LEFT!
  row(cels, 'l02_legs_boots', nearX - 1, 22, ['B1', 'B0', 'B0', 'B0']);

  // Hip bridge
  row(cels, 'l02_legs_boots', 7, legY, ['S3', 'S2', 'S2']);

  // --- 03 SUIT TORSO & NEAR ARM (Scanner hand on near side — NO teal patch!) ---
  row(cels, 'l03_suit_body', 5 + leanX, ty, ['S5', 'S4', 'S4', 'S3', 'S2', 'S2']);
  row(cels, 'l03_suit_body', 5 + leanX, ty + 1, ['S4', 'S4', 'S3', 'S3', 'S2', 'S1']);
  row(cels, 'l03_suit_body', 5 + leanX, ty + 2, ['S4', 'S4', 'S3', 'S2', 'S2', 'S1']);
  if (!k.crouch) {
    row(cels, 'l03_suit_body', 5 + leanX, ty + 3, ['S4', 'S3', 'S3', 'S2', 'S1', 'S1']);
    row(cels, 'l03_suit_body', 5 + leanX, ty + 4, ['S3', 'S3', 'S2', 'S2', 'S1', 'S0']);
  }

  if (k.scanning) {
    row(cels, 'l03_suit_body', 5 + leanX, ty + 1, ['S4', 'S4', 'S3']);
    row(cels, 'l03_suit_body', 4 + leanX, ty + 2, ['B2', 'B1', 'S3']);
  } else {
    const armDx = k.stridePhase > 0 ? 1 : k.stridePhase < 0 ? -1 : 0;
    const armX = 7 + leanX + armDx;
    row(cels, 'l03_suit_body', armX, ty + 1, ['S4', 'S3', 'S2']);
    row(cels, 'l03_suit_body', armX, ty + 2, ['S4', 'S3', 'S2']);
    row(cels, 'l03_suit_body', armX + (armDx < 0 ? -1 : 0), ty + 3, ['S3', 'S2']);
    row(cels, 'l03_suit_body', armX + (armDx < 0 ? -1 : 0), ty + 4, ['B2', 'B1']);
  }

  // --- 04 HARNESS, BELT & NEAR-SIDE GREEN MOSS SPECIMEN VIAL! ---
  const beltY = k.crouch ? ty + 3 : ty + 5;
  px(cels, 'l04_harness_belt', 7 + leanX, ty, 'B2');
  px(cels, 'l04_harness_belt', 6 + leanX, ty + 1, 'B1');
  row(cels, 'l04_harness_belt', 5 + leanX, beltY, ['M4', 'B2', 'B1', 'B1', 'B1', 'B0']);
  // Prominent near-side Green Moss Specimen Canister!
  row(cels, 'l04_harness_belt', 7 + leanX, beltY + 1, ['O4', 'O3']);
  if (!k.crouch) row(cels, 'l04_harness_belt', 7 + leanX, beltY + 2, ['O2', 'M2']);

  // --- 05 CHEST TELEMETRY FRONT EDGE (Sunlit titanium on left chest front!) ---
  px(cels, 'l05_chest_front_pack', 5 + leanX, ty + 1, 'M4');
  px(cels, 'l05_chest_front_pack', 5 + leanX, ty + 2, k.blinkPip ? 'V5' : 'V4');
  if (!k.crouch) px(cels, 'l05_chest_front_pack', 5 + leanX, ty + 3, 'M2');

  // --- 06 HELMET SHELL (Clean 3/4 Profile Facing LEFT — Top-left sun hits crown & visor!) ---
  const hx = 4 + leanX;
  row(cels, 'l06_helmet_shell', hx + 1, hy, ['S5', 'S5', 'O5', 'S4', 'S3', 'S2']);
  row(cels, 'l06_helmet_shell', hx + 1, hy + 1, ['S5', 'S4', 'O5', 'S4', 'S3', 'S2', 'S1']);
  row(cels, 'l06_helmet_shell', hx + 4, hy + 2, ['S3', 'S3', 'S2', 'S1']);
  row(cels, 'l06_helmet_shell', hx + 4, hy + 3, ['S3', 'M2', 'M1', 'S1']); // subtle shaded steel ear pod
  row(cels, 'l06_helmet_shell', hx + 4, hy + 4, ['S2', 'M1', 'M0', 'S0']);
  row(cels, 'l06_helmet_shell', hx + 1, hy + 5, ['S2', 'S2', 'S2', 'S1', 'S1', 'S0']);
  row(cels, 'l06_helmet_shell', hx + 1, hy + 6, ['M2', 'M1', 'S1', 'S1', 'S0']);
  row(cels, 'l06_helmet_shell', hx + 1, hy + 7, ['M4', 'M3', 'M2', 'M2', 'M1', 'M0']);

  // --- 07 CURVED GLASS VISOR (ONE deep dark-teal glass mass facing LEFT w/ brightest sunlit arc!) ---
  row(cels, 'l07_visor_glass', hx, hy + 2, ['V4', 'V5', 'V3', 'V1']);
  row(cels, 'l07_visor_glass', hx, hy + 3, ['M5', 'V4', 'V2', 'V1']);
  row(cels, 'l07_visor_glass', hx, hy + 4, ['V2', 'V1', 'V1', 'V0']);
  row(cels, 'l07_visor_glass', hx + 1, hy + 5, ['V1', 'V0', 'V0']);

  // --- 08 ACOUSTIC FIELD LENS (Compact parabolic metallic dish aimed WEST w/ solid grip!) ---
  if (k.scanning) {
    const lx = Math.max(0, 1 + leanX);
    row(cels, 'l08_acoustic_lens', lx, ty, ['M3', 'M4', 'M3']);
    row(cels, 'l08_acoustic_lens', lx, ty + 1, [k.pulseOn ? 'V5' : 'V3', k.pulseOn ? 'M5' : 'V3', 'M3', 'M2']);
    row(cels, 'l08_acoustic_lens', lx, ty + 2, [k.pulseOn ? 'V4' : 'V2', k.pulseOn ? 'V5' : 'V2', 'M2', 'B1', 'B2']);
    row(cels, 'l08_acoustic_lens', lx, ty + 3, ['M1', 'M1', 'M0', 'B1']);
  }
}

function paintFrame(pose: { dir: Direction4; state: AnimState4; col: number }): CelMap {
  const cels = makeBlankCels();
  if (pose.dir === 'down') paintDown(cels, pose.state, pose.col);
  else if (pose.dir === 'up') paintUp(cels, pose.state, pose.col);
  else if (pose.dir === 'right') paintRight(cels, pose.state, pose.col);
  else paintLeft(cels, pose.state, pose.col);
  return cels;
}

export const AST001_ROW_SPEC: Array<{
  row: number;
  name: string;
  dir: Direction4;
  state: AnimState4;
  frames: number;
  durationMs: number;
  tagColor: string;
}> = [
  { row: 0, name: 'idle_down', dir: 'down', state: 'idle', frames: 4, durationMs: 200, tagColor: '#DE884A' },
  { row: 1, name: 'idle_up', dir: 'up', state: 'idle', frames: 4, durationMs: 200, tagColor: '#DE884A' },
  { row: 2, name: 'idle_right', dir: 'right', state: 'idle', frames: 4, durationMs: 200, tagColor: '#DE884A' },
  { row: 3, name: 'idle_left', dir: 'left', state: 'idle', frames: 4, durationMs: 200, tagColor: '#DE884A' },
  { row: 4, name: 'walk_down', dir: 'down', state: 'walk', frames: 6, durationMs: 100, tagColor: '#649291' },
  { row: 5, name: 'walk_up', dir: 'up', state: 'walk', frames: 6, durationMs: 100, tagColor: '#649291' },
  { row: 6, name: 'walk_right', dir: 'right', state: 'walk', frames: 6, durationMs: 100, tagColor: '#649291' },
  { row: 7, name: 'walk_left', dir: 'left', state: 'walk', frames: 6, durationMs: 100, tagColor: '#649291' },
  { row: 8, name: 'crouch_walk_down', dir: 'down', state: 'crouch_walk', frames: 4, durationMs: 143, tagColor: '#7B9056' },
  { row: 9, name: 'crouch_walk_up', dir: 'up', state: 'crouch_walk', frames: 4, durationMs: 143, tagColor: '#7B9056' },
  { row: 10, name: 'crouch_walk_right', dir: 'right', state: 'crouch_walk', frames: 4, durationMs: 143, tagColor: '#7B9056' },
  { row: 11, name: 'crouch_walk_left', dir: 'left', state: 'crouch_walk', frames: 4, durationMs: 143, tagColor: '#7B9056' },
  { row: 12, name: 'lens_scan_down', dir: 'down', state: 'lens_scan', frames: 2, durationMs: 250, tagColor: '#EFC17C' },
  { row: 13, name: 'lens_scan_up', dir: 'up', state: 'lens_scan', frames: 2, durationMs: 250, tagColor: '#EFC17C' },
  { row: 14, name: 'lens_scan_right', dir: 'right', state: 'lens_scan', frames: 2, durationMs: 250, tagColor: '#EFC17C' },
  { row: 15, name: 'lens_scan_left', dir: 'left', state: 'lens_scan', frames: 2, durationMs: 250, tagColor: '#EFC17C' },
];

export function buildAst001VpfProject(): ProjectDocument {
  const frames: AnimationFrame[] = [];
  const tags: AnimationTag[] = [];

  for (const spec of AST001_ROW_SPEC) {
    const startIdx = frames.length;
    for (let c = 0; c < spec.frames; c++) {
      frames.push({
        id: `f_${spec.name}_${c}`,
        durationMs: spec.durationMs,
        cels: paintFrame({ dir: spec.dir, state: spec.state, col: c }),
      });
    }
    tags.push({
      id: `tag_${spec.name}`,
      name: spec.name,
      from: startIdx,
      to: frames.length - 1,
      color: spec.tagColor,
    });
  }

  return {
    id: 'vpf_ast001_char_mara_lin',
    name: 'AST-001_char_mara_lin_candidate',
    width: W,
    height: H,
    layers: AST001_LAYERS.map((l) => ({ ...l })),
    frames,
    tags,
    activeLayerId: 'l06_helmet_shell',
    activeFrameIndex: 0,
    soloLayerId: null,
    palettes: DEFAULT_PALETTES,
    activePaletteId: VERDANT_MASTER_PALETTE.id,
    paletteLocked: true,
    tileset: {
      tileWidth: 16,
      tileHeight: 24,
      selectedTileIndex: 0,
      metadata: {},
      mapCols: 6,
      mapRows: 4,
      mapCells: Array.from({ length: 24 }, () => ({ tileIndex: -1, rotation: 0, flipH: false, flipV: false })),
    },
    guides: [{ id: 'g_ground', orientation: 'horizontal', pos: 22 }],
    styleNotes:
      'AST-001 Dr. Mara Lin Production Candidate Pass 2 (16x24, 64 frames, 6x16 = 96x384 sheet). Ground contact at (8,22) -> Godot Sprite2D.offset=(0,-10). Zero horizontal mirroring; locked top-left 45° key light; Mara Lin v2 orange survival suit + ivory helmet stripe + deep curved dark-teal glass visor + weathered brown harness/boots + titanium backpack/O2 tank + green moss specimen vial + compact metallic parabolic Acoustic Field Lens.',
    references: [],
    pivot: { x: 8, y: 22 },
    updatedAt: Date.now(),
  };
}
