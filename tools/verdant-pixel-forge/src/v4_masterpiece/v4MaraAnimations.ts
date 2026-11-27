/**
 * VERDANT SIGNAL V4.0 — Professional Hero Animation Keyframe Studies
 * ==================================================================
 * Dedicated animation suites for Dr. Mara Lin (authored natively at 64x96
 * gameplay candidate scale — zero static limb shifting!):
 *   1. 8-Frame Walk Cycle (Contact -> Down -> Passing -> High-Lift x2)
 *   2. 8-Frame Dynamic Run Cycle (Strong lean, push-off dust, flight frames, secondary lag)
 *   3. 12-Frame Transitions & Field Actions Study (Idle Breathe, Start, Walk->Run,
 *      Skid-Stop, Crouch, Crouch-Walk, Jump Rise, Fall, Squash Land, Hurt Recoil,
 *      Acoustic Field Lens Scan, Kneeling Specimen Sample)
 */

import type { MaraPoseSpec } from './v4MaraMasterpiece';

/** 8-Frame Professional Walk Cycle (side profile, locked weight transfer & delayed secondary physics!) */
export const MARA_WALK_8F: MaraPoseSpec[] = [
  // F0: Contact (Near leg heel strike forward, far leg pushing off behind; backpack neutral)
  {
    name: 'W01 CONTACT R', facing: 'side', pelvisDy: 1.5, pelvisDx: 0, torsoLeanDeg: 6, headPitchDeg: -2,
    nearThighDeg: 28, nearKneeBendDeg: 4, nearFootPitchDeg: -16,
    farThighDeg: -24, farKneeBendDeg: 14, farFootPitchDeg: 18,
    nearShoulderDeg: -24, nearElbowBendDeg: 26, farShoulderDeg: 26, farElbowBendDeg: 32,
    backpackLagY: -0.6, antennaWhipDeg: -12, hoseSag: 0.9, vialSwingDeg: -10, holdLens: 'stowed',
  },
  // F1: Down (Weight absorbs into front knee squash; pelvis lowest; backpack lags DOWN!)
  {
    name: 'W02 DOWN R', facing: 'side', pelvisDy: 3.6, pelvisDx: 0.5, torsoLeanDeg: 8, headPitchDeg: -1,
    nearThighDeg: 16, nearKneeBendDeg: 24, nearFootPitchDeg: 0,
    farThighDeg: -22, farKneeBendDeg: 40, farFootPitchDeg: 24,
    nearShoulderDeg: -30, nearElbowBendDeg: 32, farShoulderDeg: 32, farElbowBendDeg: 38,
    backpackLagY: 1.4, antennaWhipDeg: -18, hoseSag: 1.35, vialSwingDeg: -16, holdLens: 'stowed',
  },
  // F2: Passing (Near leg supports weight cleanly vertical; far knee bends & passes forward!)
  {
    name: 'W03 PASSING R', facing: 'side', pelvisDy: 0.2, pelvisDx: 0.5, torsoLeanDeg: 6, headPitchDeg: 0,
    nearThighDeg: -2, nearKneeBendDeg: 6, nearFootPitchDeg: 0,
    farThighDeg: 8, farKneeBendDeg: 52, farFootPitchDeg: 14,
    nearShoulderDeg: -6, nearElbowBendDeg: 20, farShoulderDeg: 8, farElbowBendDeg: 28,
    backpackLagY: 0.6, antennaWhipDeg: -8, hoseSag: 1.0, vialSwingDeg: 4, holdLens: 'stowed',
  },
  // F3: High-Lift (Pelvis peaks rising off near toe; far foot arcs forward ready for heel strike!)
  {
    name: 'W04 HIGH-LIFT R', facing: 'side', pelvisDy: -2.0, pelvisDx: 1.0, torsoLeanDeg: 5, headPitchDeg: 1,
    nearThighDeg: -16, nearKneeBendDeg: 8, nearFootPitchDeg: 14,
    farThighDeg: 26, farKneeBendDeg: 26, farFootPitchDeg: -6,
    nearShoulderDeg: 16, nearElbowBendDeg: 28, farShoulderDeg: -14, farElbowBendDeg: 22,
    backpackLagY: -1.4, antennaWhipDeg: -4, hoseSag: 0.7, vialSwingDeg: 14, holdLens: 'stowed',
  },
  // F4: Opposite Contact (Far leg heel strike forward, near leg extended behind!)
  {
    name: 'W05 CONTACT L', facing: 'side', pelvisDy: 1.5, pelvisDx: 0, torsoLeanDeg: 6, headPitchDeg: -2,
    nearThighDeg: -24, nearKneeBendDeg: 14, nearFootPitchDeg: 18,
    farThighDeg: 28, farKneeBendDeg: 4, farFootPitchDeg: -16,
    nearShoulderDeg: 26, nearElbowBendDeg: 34, farShoulderDeg: -24, farElbowBendDeg: 24,
    backpackLagY: -0.6, antennaWhipDeg: -12, hoseSag: 0.9, vialSwingDeg: 12, holdLens: 'stowed',
  },
  // F5: Opposite Down (Weight settles cleanly onto far leg; backpack drops on 1-frame follow-through!)
  {
    name: 'W06 DOWN L', facing: 'side', pelvisDy: 3.6, pelvisDx: 0.5, torsoLeanDeg: 8, headPitchDeg: -1,
    nearThighDeg: -22, nearKneeBendDeg: 42, nearFootPitchDeg: 24,
    farThighDeg: 16, farKneeBendDeg: 24, farFootPitchDeg: 0,
    nearShoulderDeg: 32, nearElbowBendDeg: 40, farShoulderDeg: -30, farElbowBendDeg: 30,
    backpackLagY: 1.4, antennaWhipDeg: -18, hoseSag: 1.35, vialSwingDeg: 16, holdLens: 'stowed',
  },
  // F6: Opposite Passing (Far leg straightens vertical; near leg folds sharply passing forward!)
  {
    name: 'W07 PASSING L', facing: 'side', pelvisDy: 0.2, pelvisDx: 0.5, torsoLeanDeg: 6, headPitchDeg: 0,
    nearThighDeg: 10, nearKneeBendDeg: 52, nearFootPitchDeg: 14,
    farThighDeg: -2, farKneeBendDeg: 6, farFootPitchDeg: 0,
    nearShoulderDeg: 8, nearElbowBendDeg: 28, farShoulderDeg: -6, farElbowBendDeg: 20,
    backpackLagY: 0.6, antennaWhipDeg: -8, hoseSag: 1.0, vialSwingDeg: -4, holdLens: 'stowed',
  },
  // F7: Opposite High-Lift (Pelvis crests; near leg swings boldly forward for next Contact R!)
  {
    name: 'W08 HIGH-LIFT L', facing: 'side', pelvisDy: -2.0, pelvisDx: 1.0, torsoLeanDeg: 5, headPitchDeg: 1,
    nearThighDeg: 26, nearKneeBendDeg: 26, nearFootPitchDeg: -6,
    farThighDeg: -16, farKneeBendDeg: 8, farFootPitchDeg: 14,
    nearShoulderDeg: -14, nearElbowBendDeg: 22, farShoulderDeg: 16, farElbowBendDeg: 28,
    backpackLagY: -1.4, antennaWhipDeg: -4, hoseSag: 0.7, vialSwingDeg: -14, holdLens: 'stowed',
  },
];

/** 8-Frame Dynamic Athletic Run Cycle (strong forward lean, airborne flight, explosive toe-off & whipping gear!) */
export const MARA_RUN_8F: MaraPoseSpec[] = [
  // R0: Power Contact / Absorb (Near boot strikes under center of mass; torso pitched boldly forward 19 deg!)
  {
    name: 'R01 STRIKE R', facing: 'side', pelvisDy: 4.5, pelvisDx: 1.0, torsoLeanDeg: 19, headPitchDeg: -9,
    nearThighDeg: 32, nearKneeBendDeg: 28, nearFootPitchDeg: -10,
    farThighDeg: -34, farKneeBendDeg: 64, farFootPitchDeg: 28,
    nearShoulderDeg: -42, nearElbowBendDeg: 82, farShoulderDeg: 44, farElbowBendDeg: 88,
    backpackLagY: 2.2, antennaWhipDeg: -32, hoseSag: 1.6, vialSwingDeg: -24, holdLens: 'stowed',
  },
  // R1: Drive / Compression (Deep athletic drive over planted front leg; arms pump powerfully!)
  {
    name: 'R02 DRIVE R', facing: 'side', pelvisDy: 6.2, pelvisDx: 1.5, torsoLeanDeg: 21, headPitchDeg: -10,
    nearThighDeg: 8, nearKneeBendDeg: 34, nearFootPitchDeg: 0,
    farThighDeg: -8, farKneeBendDeg: 82, farFootPitchDeg: 24,
    nearShoulderDeg: -22, nearElbowBendDeg: 88, farShoulderDeg: 24, farElbowBendDeg: 90,
    backpackLagY: 2.8, antennaWhipDeg: -36, hoseSag: 1.8, vialSwingDeg: -12, holdLens: 'stowed',
  },
  // R2: Explosive Push-Off R (Near leg drives straight back with dust kick; far knee thrusts high forward!)
  {
    name: 'R03 PUSH-OFF R', facing: 'side', pelvisDy: -1.0, pelvisDx: 2.0, torsoLeanDeg: 22, headPitchDeg: -10,
    nearThighDeg: -36, nearKneeBendDeg: 10, nearFootPitchDeg: 30,
    farThighDeg: 48, farKneeBendDeg: 68, farFootPitchDeg: 8,
    nearShoulderDeg: 28, nearElbowBendDeg: 92, farShoulderDeg: -28, farElbowBendDeg: 78,
    backpackLagY: -1.2, antennaWhipDeg: -28, hoseSag: 0.7, vialSwingDeg: 20, holdLens: 'stowed',
    dustPuff: 'rear_kick',
  },
  // R3: AIRBORNE FLIGHT 1 (BOTH boots clear the ground! Maximum dynamic horizontal suspension!)
  {
    name: 'R04 FLIGHT R', facing: 'side', pelvisDy: -5.8, pelvisDx: 2.2, torsoLeanDeg: 20, headPitchDeg: -9,
    nearThighDeg: -42, nearKneeBendDeg: 46, nearFootPitchDeg: 32,
    farThighDeg: 52, farKneeBendDeg: 32, farFootPitchDeg: -12,
    nearShoulderDeg: 46, nearElbowBendDeg: 88, farShoulderDeg: -44, farElbowBendDeg: 82,
    backpackLagY: -2.6, antennaWhipDeg: -22, hoseSag: 0.4, vialSwingDeg: 28, holdLens: 'stowed',
  },
  // R4: Opposite Power Strike (Far boot absorbs impact!)
  {
    name: 'R05 STRIKE L', facing: 'side', pelvisDy: 4.5, pelvisDx: 1.0, torsoLeanDeg: 19, headPitchDeg: -9,
    nearThighDeg: -34, nearKneeBendDeg: 64, nearFootPitchDeg: 28,
    farThighDeg: 32, farKneeBendDeg: 28, farFootPitchDeg: -10,
    nearShoulderDeg: 44, nearElbowBendDeg: 88, farShoulderDeg: -42, farElbowBendDeg: 82,
    backpackLagY: 2.2, antennaWhipDeg: -32, hoseSag: 1.6, vialSwingDeg: 24, holdLens: 'stowed',
  },
  // R5: Opposite Compression Drive
  {
    name: 'R06 DRIVE L', facing: 'side', pelvisDy: 6.2, pelvisDx: 1.5, torsoLeanDeg: 21, headPitchDeg: -10,
    nearThighDeg: -8, nearKneeBendDeg: 82, nearFootPitchDeg: 24,
    farThighDeg: 8, farKneeBendDeg: 34, farFootPitchDeg: 0,
    nearShoulderDeg: 24, nearElbowBendDeg: 90, farShoulderDeg: -22, farElbowBendDeg: 88,
    backpackLagY: 2.8, antennaWhipDeg: -36, hoseSag: 1.8, vialSwingDeg: 12, holdLens: 'stowed',
  },
  // R6: Explosive Push-Off L (Dust puff kicks behind far boot; near knee drives fiercely forward!)
  {
    name: 'R07 PUSH-OFF L', facing: 'side', pelvisDy: -1.0, pelvisDx: 2.0, torsoLeanDeg: 22, headPitchDeg: -10,
    nearThighDeg: 48, nearKneeBendDeg: 68, nearFootPitchDeg: 8,
    farThighDeg: -36, farKneeBendDeg: 10, farFootPitchDeg: 30,
    nearShoulderDeg: -28, nearElbowBendDeg: 78, farShoulderDeg: 28, farElbowBendDeg: 92,
    backpackLagY: -1.2, antennaWhipDeg: -28, hoseSag: 0.7, vialSwingDeg: -20, holdLens: 'stowed',
    dustPuff: 'rear_kick',
  },
  // R7: AIRBORNE FLIGHT 2 (Suspended dynamically before Strike R!)
  {
    name: 'R08 FLIGHT L', facing: 'side', pelvisDy: -5.8, pelvisDx: 2.2, torsoLeanDeg: 20, headPitchDeg: -9,
    nearThighDeg: 52, nearKneeBendDeg: 32, nearFootPitchDeg: -12,
    farThighDeg: -42, farKneeBendDeg: 46, farFootPitchDeg: 32,
    nearShoulderDeg: -44, nearElbowBendDeg: 82, farShoulderDeg: 46, farElbowBendDeg: 88,
    backpackLagY: -2.6, antennaWhipDeg: -22, hoseSag: 0.4, vialSwingDeg: -28, holdLens: 'stowed',
  },
];

/** 12-Frame Complete Transitions, Locomotion & Field Science Actions Study! */
export const MARA_TRANSITIONS_12F: MaraPoseSpec[] = [
  // 1. Idle Breathing (Exhale / Settled)
  {
    name: 'IDLE BREATHE A', facing: '3q', pelvisDy: 0.8, pelvisDx: -3, torsoLeanDeg: 4, headPitchDeg: 2,
    nearThighDeg: -10, nearKneeBendDeg: 8, nearFootPitchDeg: 0,
    farThighDeg: 14, farKneeBendDeg: 6, farFootPitchDeg: 0,
    nearShoulderDeg: -36, nearElbowBendDeg: 66, farShoulderDeg: 14, farElbowBendDeg: 60,
    backpackLagY: 0.6, antennaWhipDeg: -8, hoseSag: 1.1, vialSwingDeg: 3, holdLens: 'hip_ready',
  },
  // 2. Idle Breathing (Inhale / Alert Chest Rise)
  {
    name: 'IDLE BREATHE B', facing: '3q', pelvisDy: -0.8, pelvisDx: -3, torsoLeanDeg: 2, headPitchDeg: 0,
    nearThighDeg: -10, nearKneeBendDeg: 4, nearFootPitchDeg: 0,
    farThighDeg: 14, farKneeBendDeg: 4, farFootPitchDeg: 0,
    nearShoulderDeg: -38, nearElbowBendDeg: 68, farShoulderDeg: 16, farElbowBendDeg: 64,
    backpackLagY: -0.7, antennaWhipDeg: -5, hoseSag: 0.85, vialSwingDeg: 5, holdLens: 'hip_ready',
  },
  // 3. Walk-Start Acceleration (Weight shifts forward ahead of feet before first stride!)
  {
    name: 'START ACCEL', facing: 'side', pelvisDy: 3.0, pelvisDx: 1.0, torsoLeanDeg: 15, headPitchDeg: -6,
    nearThighDeg: 18, nearKneeBendDeg: 32, nearFootPitchDeg: 0,
    farThighDeg: -18, farKneeBendDeg: 20, farFootPitchDeg: 20,
    nearShoulderDeg: -26, nearElbowBendDeg: 64, farShoulderDeg: 24, farElbowBendDeg: 62,
    backpackLagY: 1.2, antennaWhipDeg: -22, hoseSag: 1.3, vialSwingDeg: -16, holdLens: 'stowed',
  },
  // 4. Walk -> Run Surge Transition (Dropping center of gravity into explosive sprint lean!)
  {
    name: 'WALK->RUN SURGE', facing: 'side', pelvisDy: 4.0, pelvisDx: 2.0, torsoLeanDeg: 23, headPitchDeg: -11,
    nearThighDeg: -30, nearKneeBendDeg: 18, nearFootPitchDeg: 28,
    farThighDeg: 42, farKneeBendDeg: 72, farFootPitchDeg: 10,
    nearShoulderDeg: 34, nearElbowBendDeg: 88, farShoulderDeg: -34, farElbowBendDeg: 76,
    backpackLagY: 0.5, antennaWhipDeg: -34, hoseSag: 1.1, vialSwingDeg: -22, holdLens: 'stowed',
    dustPuff: 'rear_kick',
  },
  // 5. Skid-Stop Deceleration Brace (Heels digging forward, torso pitched cleanly back, front dust puff!)
  {
    name: 'SKID-STOP BRACE', facing: 'side', pelvisDy: 5.5, pelvisDx: -2.0, torsoLeanDeg: -12, headPitchDeg: 8,
    nearThighDeg: 36, nearKneeBendDeg: 22, nearFootPitchDeg: -22,
    farThighDeg: 12, farKneeBendDeg: 42, farFootPitchDeg: -8,
    nearShoulderDeg: -34, nearElbowBendDeg: 46, farShoulderDeg: 36, farElbowBendDeg: 52,
    backpackLagY: 2.0, antennaWhipDeg: 18, hoseSag: 1.4, vialSwingDeg: 26, holdLens: 'stowed',
    dustPuff: 'skid_front',
  },
  // 6. Deep Field Crouch (Low center of gravity, knees bent tightly)
  {
    name: 'CROUCH LOW', facing: 'side', pelvisDy: 16.5, pelvisDx: -1.0, torsoLeanDeg: 22, headPitchDeg: -12,
    nearThighDeg: 56, nearKneeBendDeg: 92, nearFootPitchDeg: 0,
    farThighDeg: 18, farKneeBendDeg: 86, farFootPitchDeg: 26,
    nearShoulderDeg: 24, nearElbowBendDeg: 48, farShoulderDeg: 36, farElbowBendDeg: 42,
    backpackLagY: 2.5, antennaWhipDeg: -16, hoseSag: 1.5, vialSwingDeg: 10, holdLens: 'stowed',
  },
  // 7. Crouch-Walk Stealth Step (Low sneaking forward reach!)
  {
    name: 'CROUCH WALK', facing: 'side', pelvisDy: 14.5, pelvisDx: 1.0, torsoLeanDeg: 26, headPitchDeg: -14,
    nearThighDeg: 62, nearKneeBendDeg: 74, nearFootPitchDeg: -10,
    farThighDeg: -12, farKneeBendDeg: 72, farFootPitchDeg: 28,
    nearShoulderDeg: -16, nearElbowBendDeg: 68, farShoulderDeg: 34, farElbowBendDeg: 58,
    backpackLagY: 1.0, antennaWhipDeg: -24, hoseSag: 1.3, vialSwingDeg: -14, holdLens: 'stowed',
  },
  // 8. Jump Launch / Rising Arc (Upward vertical stretch, leading knee tucked!)
  {
    name: 'JUMP RISE', facing: 'side', pelvisDy: -10.5, pelvisDx: 0, torsoLeanDeg: 10, headPitchDeg: -4,
    nearThighDeg: 46, nearKneeBendDeg: 76, nearFootPitchDeg: 16,
    farThighDeg: -18, farKneeBendDeg: 22, farFootPitchDeg: 32,
    nearShoulderDeg: 58, nearElbowBendDeg: 64, farShoulderDeg: -38, farElbowBendDeg: 54,
    backpackLagY: 2.8, antennaWhipDeg: -26, hoseSag: 1.6, vialSwingDeg: 14, holdLens: 'stowed',
  },
  // 9. Airborne Fall (Legs reaching downward bracing for touchdown; arms lifted for balance!)
  {
    name: 'AIR FALL', facing: 'side', pelvisDy: -7.5, pelvisDx: 0, torsoLeanDeg: 6, headPitchDeg: 12,
    nearThighDeg: 24, nearKneeBendDeg: 28, nearFootPitchDeg: 10,
    farThighDeg: -8, farKneeBendDeg: 36, farFootPitchDeg: 18,
    nearShoulderDeg: -56, nearElbowBendDeg: 34, farShoulderDeg: 52, farElbowBendDeg: 30,
    backpackLagY: -2.8, antennaWhipDeg: 14, hoseSag: 0.3, vialSwingDeg: -18, holdLens: 'stowed',
  },
  // 10. Heavy Squash Landing (Deep shock absorption + bilateral ground dust burst!)
  {
    name: 'SQUASH LAND', facing: 'side', pelvisDy: 15.0, pelvisDx: 0.5, torsoLeanDeg: 24, headPitchDeg: -8,
    nearThighDeg: 52, nearKneeBendDeg: 84, nearFootPitchDeg: 0,
    farThighDeg: 34, farKneeBendDeg: 78, farFootPitchDeg: 0,
    nearShoulderDeg: -38, nearElbowBendDeg: 52, farShoulderDeg: 40, farElbowBendDeg: 48,
    backpackLagY: 3.4, antennaWhipDeg: -28, hoseSag: 1.9, vialSwingDeg: 18, holdLens: 'stowed',
    dustPuff: 'land_burst',
  },
  // 11. Hurt Recoil (Sharp knockback arch, head snapped back, arms flared defensively!)
  {
    name: 'HURT RECOIL', facing: 'side', pelvisDy: 2.0, pelvisDx: -3.5, torsoLeanDeg: -18, headPitchDeg: -14,
    nearThighDeg: 22, nearKneeBendDeg: 30, nearFootPitchDeg: -14,
    farThighDeg: -18, farKneeBendDeg: 24, farFootPitchDeg: 16,
    nearShoulderDeg: -48, nearElbowBendDeg: 26, farShoulderDeg: 64, farElbowBendDeg: 28,
    backpackLagY: -1.8, antennaWhipDeg: 28, hoseSag: 0.5, vialSwingDeg: 32, holdLens: 'stowed',
    hurtFlash: true,
  },
  // 12. Active Scientific Scan + Kneeling Specimen Inspect (two key field actions!)
  {
    name: 'ACOUSTIC SCAN', facing: '3q', pelvisDy: 1.5, pelvisDx: -10.5, torsoLeanDeg: 5, headPitchDeg: 2,
    nearThighDeg: -14, nearKneeBendDeg: 12, nearFootPitchDeg: 0,
    farThighDeg: 18, farKneeBendDeg: 10, farFootPitchDeg: 0,
    nearShoulderDeg: -20, nearElbowBendDeg: 94, farShoulderDeg: 24, farElbowBendDeg: 64,
    backpackLagY: 0, antennaWhipDeg: -10, hoseSag: 1.0, vialSwingDeg: 6, holdLens: 'aim_scan',
  },
  {
    name: 'SPECIMEN PROBE', facing: 'side', pelvisDy: 16.0, pelvisDx: -3.0, torsoLeanDeg: 26, headPitchDeg: 10,
    nearThighDeg: 58, nearKneeBendDeg: 94, nearFootPitchDeg: 0,
    farThighDeg: -20, farKneeBendDeg: 88, farFootPitchDeg: 22,
    nearShoulderDeg: 36, nearElbowBendDeg: 20, farShoulderDeg: 22, farElbowBendDeg: 62,
    backpackLagY: 1.6, antennaWhipDeg: -18, hoseSag: 1.4, vialSwingDeg: 12, holdLens: 'stowed',
    microProbe: true,
  },
];
