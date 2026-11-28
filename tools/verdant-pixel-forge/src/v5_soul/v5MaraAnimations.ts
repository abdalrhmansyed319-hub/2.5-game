/**
 * VERDANT SIGNAL V5.0 — SOULFUL, EMOTIONALLY ACTED DR. MARA LIN ANIMATIONS
 * ========================================================================
 * 32 individually designed key poses across 4 living animation suites:
 *   1. Living Idle Breathing (6 frames) — chest rise, breeze-rippled scarf, gentle skyward glance
 *   2. Human Walking Cycle (8 frames) — heel-strike toe-up, pelvic sink, tall passing, flexed toe-off
 *   3. Powerful Athletic Run (8 frames) — 22 deg sprint lean, airborne flight, whipping scarf & dust
 *   4. Weighty Transitions & Emotional Acting (10 frames) — Start, Surge, Skid-Stop (scarf flies forward!),
 *      Quiet Wonder, Gentle Curiosity w/ Glowing Orchid, Exhausted Breath, Startled Alert, Crouch, Jump & Scan!
 */

import type { MaraV5Pose } from './v5MaraSoul';

const BASE_IDLE: MaraV5Pose = {
  name: 'idle_0',
  label: 'IDLE 1',
  view: 'three_quarter',
  mood: 'calm',
  hipDx: 0,
  hipDy: 0,
  torsoLean: 1,
  chestExpand: 0,
  headDx: 0,
  headDy: 0,
  headPitch: -0.04,
  farHip: 8,
  farKnee: 3,
  farFootTilt: 0,
  nearHip: -9,
  nearKnee: 4,
  nearFootTilt: 0,
  farShoulder: 10,
  farElbow: 18,
  nearShoulder: -12,
  nearElbow: 24,
  nearHand: 'relaxed',
  packLagY: 0,
  packTilt: 0,
  antennaLag: -1.0,
  scarfCtrl: [[-2, 1, 2.2], [-7, 4, 2.0], [-12, 8, 1.5], [-16, 12, 0.9]],
  dustPuff: 'none',
  visorBounce: 'sunrise',
};

// ============================================================================
// 1. LIVING IDLE BREATHING & COASTAL BREEZE (6 FRAMES — NEVER STATIC!)
// ============================================================================
export const MARA_V5_IDLE_6F: MaraV5Pose[] = [
  {
    ...BASE_IDLE,
    name: 'idle_0', label: 'BREATHE 1',
    chestExpand: 0.0, headPitch: -0.04, antennaLag: -1.0,
    scarfCtrl: [[-2, 1, 2.2], [-7, 4, 2.0], [-12, 8, 1.5], [-16, 12, 0.9]],
  },
  {
    ...BASE_IDLE,
    name: 'idle_1', label: 'INHALE',
    hipDy: -0.3, chestExpand: 0.55, headDy: -0.4, headPitch: -0.10,
    nearShoulder: -10, nearElbow: 28, packLagY: -0.3, antennaLag: -1.8,
    scarfCtrl: [[-2, 1, 2.2], [-8, 3, 2.0], [-14, 5, 1.6], [-19, 8, 0.9]],
  },
  {
    ...BASE_IDLE,
    name: 'idle_2', label: 'PEAK',
    hipDy: -0.6, chestExpand: 0.95, headDy: -0.8, headPitch: -0.18,
    torsoLean: -1, nearShoulder: -8, nearElbow: 30, packLagY: -0.6, antennaLag: -2.6,
    scarfCtrl: [[-2, 0, 2.2], [-9, 1, 2.0], [-16, 3, 1.6], [-21, 5, 0.9]],
  },
  {
    ...BASE_IDLE,
    name: 'idle_3', label: 'GAZE',
    mood: 'wonder',
    hipDy: -0.4, chestExpand: 0.65, headDx: 0.6, headDy: -0.6, headPitch: -0.22,
    torsoLean: -1, nearShoulder: -9, nearElbow: 26, packLagY: -0.3, antennaLag: -2.1,
    scarfCtrl: [[-2, 1, 2.2], [-8, 2, 2.0], [-15, 5, 1.6], [-20, 7, 0.9]],
  },
  {
    ...BASE_IDLE,
    name: 'idle_4', label: 'EXHALE',
    hipDy: 0.2, chestExpand: 0.15, headDy: 0.2, headPitch: -0.06,
    torsoLean: 1.5, nearShoulder: -13, nearElbow: 22, packLagY: 0.3, antennaLag: -1.2,
    scarfCtrl: [[-2, 1, 2.2], [-7, 4, 2.0], [-13, 7, 1.5], [-17, 10, 0.9]],
  },
  {
    ...BASE_IDLE,
    name: 'idle_5', label: 'SETTLE',
    hipDy: 0.4, chestExpand: -0.2, headDy: 0.4, headPitch: 0.02,
    torsoLean: 2.0, nearShoulder: -14, nearElbow: 20, packLagY: 0.5, antennaLag: -0.7,
    scarfCtrl: [[-2, 1, 2.2], [-6, 5, 2.0], [-11, 9, 1.5], [-14, 13, 0.9]],
  },
];

// ============================================================================
// 2. HUMAN WALKING CYCLE (8 INDIVIDUALLY DESIGNED FRAMES — REAL WEIGHT & GRACE!)
// ============================================================================
export const MARA_V5_WALK_8F: MaraV5Pose[] = [
  {
    ...BASE_IDLE, view: 'side_right', name: 'walk_0', label: 'CONT R',
    hipDy: 0.8, torsoLean: 6, headPitch: 0.0,
    nearHip: 27, nearKnee: 4, nearFootTilt: 16,   // Heel-strike upturned toe!
    farHip: -25, farKnee: 16, farFootTilt: -22,   // Trailing foot rolling off toe-box!
    nearShoulder: -24, nearElbow: 22, farShoulder: 26, farElbow: 28,
    packLagY: -0.5, antennaLag: -2.0,
    scarfCtrl: [[-2, 1, 2.1], [-8, 3, 1.9], [-14, 6, 1.4], [-19, 8, 0.8]],
  },
  {
    ...BASE_IDLE, view: 'side_right', name: 'walk_1', label: 'DOWN R',
    hipDy: 2.4, torsoLean: 8, headDy: 0.6, headPitch: 0.06,
    nearHip: 16, nearKnee: 18, nearFootTilt: 0,   // Full flat-foot cushioned weight absorption!
    farHip: -28, farKnee: 34, farFootTilt: -30,   // Rear heel lifting into toe release!
    nearShoulder: -30, nearElbow: 28, farShoulder: 32, farElbow: 36,
    packLagY: 1.5, packTilt: 4, antennaLag: -1.4,
    scarfCtrl: [[-2, 0, 2.1], [-9, 1, 1.9], [-15, 4, 1.5], [-20, 7, 0.8]],
  },
  {
    ...BASE_IDLE, view: 'side_right', name: 'walk_2', label: 'PASS R',
    hipDy: -1.3, torsoLean: 5, headDy: -0.4, headPitch: -0.04,
    nearHip: -2, nearKnee: 5, nearFootTilt: 0,    // Tall supporting column!
    farHip: 10, farKnee: 44, farFootTilt: -10,    // Swinging knee folding gracefully forward!
    nearShoulder: -4, nearElbow: 18, farShoulder: 4, farElbow: 24,
    packLagY: 0.8, antennaLag: -2.4,
    scarfCtrl: [[-2, 1, 2.1], [-8, 4, 1.9], [-14, 8, 1.4], [-18, 11, 0.8]],
  },
  {
    ...BASE_IDLE, view: 'side_right', name: 'walk_3', label: 'LIFT R',
    hipDy: -2.2, torsoLean: 7, headDy: -0.6, headPitch: -0.06,
    nearHip: -18, nearKnee: 9, nearFootTilt: -18, // Buoyant toe-roll push-off!
    farHip: 29, farKnee: 22, farFootTilt: 10,     // Reaching forward to heel-strike!
    nearShoulder: 22, nearElbow: 32, farShoulder: -20, farElbow: 18,
    packLagY: -1.2, antennaLag: -3.2,
    scarfCtrl: [[-2, 1, 2.1], [-9, 3, 1.9], [-16, 5, 1.5], [-21, 6, 0.8]],
  },
  {
    ...BASE_IDLE, view: 'side_right', name: 'walk_4', label: 'CONT L',
    hipDy: 0.8, torsoLean: 6, headPitch: 0.0,
    farHip: 27, farKnee: 4, farFootTilt: 16,
    nearHip: -25, nearKnee: 16, nearFootTilt: -22,
    farShoulder: -24, farElbow: 22, nearShoulder: 26, nearElbow: 32,
    packLagY: -0.5, antennaLag: -2.0,
    scarfCtrl: [[-2, 1, 2.1], [-8, 3, 1.9], [-14, 6, 1.4], [-19, 9, 0.8]],
  },
  {
    ...BASE_IDLE, view: 'side_right', name: 'walk_5', label: 'DOWN L',
    hipDy: 2.4, torsoLean: 8, headDy: 0.6, headPitch: 0.06,
    farHip: 16, farKnee: 18, farFootTilt: 0,
    nearHip: -28, nearKnee: 34, nearFootTilt: -30,
    farShoulder: -30, farElbow: 28, nearShoulder: 32, nearElbow: 40,
    packLagY: 1.5, packTilt: 4, antennaLag: -1.4,
    scarfCtrl: [[-2, 0, 2.1], [-9, 1, 1.9], [-15, 4, 1.5], [-20, 7, 0.8]],
  },
  {
    ...BASE_IDLE, view: 'side_right', name: 'walk_6', label: 'PASS L',
    hipDy: -1.3, torsoLean: 5, headDy: -0.4, headPitch: -0.04,
    farHip: -2, farKnee: 5, farFootTilt: 0,
    nearHip: 10, nearKnee: 44, nearFootTilt: -10,
    farShoulder: -4, farElbow: 18, nearShoulder: 4, nearElbow: 24,
    packLagY: 0.8, antennaLag: -2.4,
    scarfCtrl: [[-2, 1, 2.1], [-8, 4, 1.9], [-14, 8, 1.4], [-18, 11, 0.8]],
  },
  {
    ...BASE_IDLE, view: 'side_right', name: 'walk_7', label: 'LIFT L',
    hipDy: -2.2, torsoLean: 7, headDy: -0.6, headPitch: -0.06,
    farHip: -18, farKnee: 9, farFootTilt: -18,
    nearHip: 29, nearKnee: 22, nearFootTilt: 10,
    farShoulder: 22, farElbow: 30, nearShoulder: -20, nearElbow: 20,
    packLagY: -1.2, antennaLag: -3.2,
    scarfCtrl: [[-2, 1, 2.1], [-9, 3, 1.9], [-16, 5, 1.5], [-21, 6, 0.8]],
  },
];

// ============================================================================
// 3. POWERFUL ATHLETIC RUNNING CYCLE (8 FRAMES — FULL LEAN, FLIGHT & WHIPPING SCARF!)
// ============================================================================
export const MARA_V5_RUN_8F: MaraV5Pose[] = [
  {
    ...BASE_IDLE, view: 'side_right', mood: 'determined', name: 'run_0', label: 'STRK R',
    hipDy: 2.2, torsoLean: 21, headDx: 1.0, headPitch: -0.05,
    nearHip: 34, nearKnee: 20, nearFootTilt: 14,
    farHip: -36, farKnee: 64, farFootTilt: -26,
    nearShoulder: -44, nearElbow: 74, farShoulder: 46, farElbow: 78, nearHand: 'fist',
    packLagY: 0.5, packTilt: 8, antennaLag: -5.5,
    scarfCtrl: [[-2, 0, 2.2], [-10, -1, 2.0], [-18, 2, 1.6], [-26, 0, 0.9]],
    dustPuff: 'none',
  },
  {
    ...BASE_IDLE, view: 'side_right', mood: 'determined', name: 'run_1', label: 'DRIV R',
    hipDy: 3.8, torsoLean: 24, headDx: 1.4, headDy: 0.5, headPitch: -0.04,
    nearHip: 10, nearKnee: 36, nearFootTilt: 0,
    farHip: -10, farKnee: 82, farFootTilt: -16,
    nearShoulder: -20, nearElbow: 86, farShoulder: 22, farElbow: 84, nearHand: 'fist',
    packLagY: 2.0, packTilt: 10, antennaLag: -4.8,
    scarfCtrl: [[-2, -1, 2.2], [-11, -2, 2.0], [-20, 0, 1.6], [-27, 2, 0.9]],
    dustPuff: 'none',
  },
  {
    ...BASE_IDLE, view: 'side_right', mood: 'determined', name: 'run_2', label: 'PUSH R',
    hipDy: -0.8, torsoLean: 23, headDx: 1.2, headPitch: -0.08,
    nearHip: -42, nearKnee: 14, nearFootTilt: -32,  // Explosive rear toe-off!
    farHip: 46, farKnee: 62, farFootTilt: 6,        // Powerful driving lead knee!
    nearShoulder: 46, nearElbow: 80, farShoulder: -42, farElbow: 72, nearHand: 'fist',
    packLagY: -1.4, packTilt: 6, antennaLag: -6.8,
    scarfCtrl: [[-2, 0, 2.2], [-11, 1, 2.0], [-20, -1, 1.6], [-28, -2, 0.9]],
    dustPuff: 'behind',
  },
  {
    ...BASE_IDLE, view: 'side_right', mood: 'determined', name: 'run_3', label: 'FLGT R',
    hipDy: -4.2, torsoLean: 20, headDx: 1.0, headDy: -0.6, headPitch: -0.08,
    nearHip: -34, nearKnee: 60, nearFootTilt: -24,  // Full airborne suspension!
    farHip: 42, farKnee: 24, farFootTilt: 12,
    nearShoulder: 50, nearElbow: 76, farShoulder: -46, farElbow: 70, nearHand: 'fist',
    packLagY: -2.4, packTilt: 4, antennaLag: -7.6,
    scarfCtrl: [[-2, 1, 2.2], [-11, 3, 2.0], [-20, 1, 1.6], [-28, 3, 0.9]],
    dustPuff: 'none',
  },
  {
    ...BASE_IDLE, view: 'side_right', mood: 'determined', name: 'run_4', label: 'STRK L',
    hipDy: 2.2, torsoLean: 21, headDx: 1.0, headPitch: -0.05,
    farHip: 34, farKnee: 20, farFootTilt: 14,
    nearHip: -36, nearKnee: 64, nearFootTilt: -26,
    farShoulder: -44, farElbow: 74, nearShoulder: 46, nearElbow: 82, nearHand: 'fist',
    packLagY: 0.5, packTilt: 8, antennaLag: -5.5,
    scarfCtrl: [[-2, 0, 2.2], [-10, -1, 2.0], [-18, 2, 1.6], [-26, 0, 0.9]],
  },
  {
    ...BASE_IDLE, view: 'side_right', mood: 'determined', name: 'run_5', label: 'DRIV L',
    hipDy: 3.8, torsoLean: 24, headDx: 1.4, headDy: 0.5, headPitch: -0.04,
    farHip: 10, farKnee: 36, farFootTilt: 0,
    nearHip: -10, nearKnee: 82, nearFootTilt: -16,
    farShoulder: -20, farElbow: 86, nearShoulder: 22, nearElbow: 88, nearHand: 'fist',
    packLagY: 2.0, packTilt: 10, antennaLag: -4.8,
    scarfCtrl: [[-2, -1, 2.2], [-11, -2, 2.0], [-20, 0, 1.6], [-27, 2, 0.9]],
  },
  {
    ...BASE_IDLE, view: 'side_right', mood: 'determined', name: 'run_6', label: 'PUSH L',
    hipDy: -0.8, torsoLean: 23, headDx: 1.2, headPitch: -0.08,
    farHip: -42, farKnee: 14, farFootTilt: -32,
    nearHip: 46, nearKnee: 62, nearFootTilt: 6,
    farShoulder: 46, farElbow: 80, nearShoulder: -42, nearElbow: 76, nearHand: 'fist',
    packLagY: -1.4, packTilt: 6, antennaLag: -6.8,
    scarfCtrl: [[-2, 0, 2.2], [-11, 1, 2.0], [-20, -1, 1.6], [-28, -2, 0.9]],
    dustPuff: 'behind',
  },
  {
    ...BASE_IDLE, view: 'side_right', mood: 'determined', name: 'run_7', label: 'FLGT L',
    hipDy: -4.2, torsoLean: 20, headDx: 1.0, headDy: -0.6, headPitch: -0.08,
    farHip: -34, farKnee: 60, farFootTilt: -24,
    nearHip: 42, nearKnee: 24, nearFootTilt: 12,
    farShoulder: 50, farElbow: 76, nearShoulder: -46, nearElbow: 74, nearHand: 'fist',
    packLagY: -2.4, packTilt: 4, antennaLag: -7.6,
    scarfCtrl: [[-2, 1, 2.2], [-11, 3, 2.0], [-20, 1, 1.6], [-28, 3, 0.9]],
  },
];

// ============================================================================
// 4. WEIGHTY TRANSITIONS & EMOTIONAL SOUL STUDY (10 INDIVIDUALLY ACTED POSES!)
// ============================================================================
export const MARA_V5_EMOTIONS_10F: MaraV5Pose[] = [
  {
    ...BASE_IDLE, view: 'side_right', mood: 'determined', name: 'tr_start', label: 'START',
    hipDy: 2.2, torsoLean: 16, headPitch: -0.04,
    nearHip: 20, nearKnee: 26, nearFootTilt: 0,
    farHip: -24, farKnee: 18, farFootTilt: -24,
    nearShoulder: -24, nearElbow: 52, farShoulder: 28, farElbow: 56, nearHand: 'fist',
    packLagY: 0.8, antennaLag: -3.2,
    scarfCtrl: [[-2, 1, 2.1], [-9, 3, 1.9], [-16, 6, 1.5], [-21, 9, 0.8]],
  },
  {
    ...BASE_IDLE, view: 'side_right', mood: 'determined', name: 'tr_surge', label: 'SURGE',
    hipDy: 1.0, torsoLean: 22, headDx: 1.2,
    nearHip: 38, nearKnee: 46, nearFootTilt: 8,
    farHip: -38, farKnee: 14, farFootTilt: -30,
    nearShoulder: -38, nearElbow: 78, farShoulder: 40, farElbow: 78, nearHand: 'fist',
    packLagY: -0.6, antennaLag: -6.0,
    scarfCtrl: [[-2, 0, 2.2], [-11, 0, 2.0], [-19, 2, 1.6], [-26, 1, 0.9]],
    dustPuff: 'behind',
  },
  {
    // HEAVY WEIGHTY SKID-STOP: heels digging hard, body leaning back, SCARF WHIPS FORWARD PAST HER HELMET!!
    ...BASE_IDLE, view: 'side_right', mood: 'determined', name: 'tr_skid', label: 'SKID-STOP',
    hipDy: 4.0, torsoLean: -14, headDx: -1.4, headPitch: 0.06,
    nearHip: 34, nearKnee: 12, nearFootTilt: 24,  // Heel digging sharply into sand!
    farHip: 12, farKnee: 36, farFootTilt: 16,
    nearShoulder: 26, nearElbow: 14, farShoulder: -24, farElbow: 12, nearHand: 'splay',
    packLagY: 1.6, packTilt: -10, antennaLag: 6.2, // Antenna whips forward from inertia!
    scarfCtrl: [[2, 0, 2.1], [10, -2, 1.9], [18, -4, 1.5], [24, -1, 0.9]], // Scarf flies FORWARD!!
    dustPuff: 'ahead',
  },
  {
    // QUIET WONDER: gazing softly up at the alien sunrise / giant singing reedwood canopy!
    ...BASE_IDLE, view: 'three_quarter', mood: 'wonder', name: 'em_wonder', label: 'WONDER',
    hipDy: -0.4, torsoLean: -5, chestExpand: 0.8, headDx: -0.8, headDy: -0.8, headPitch: -0.36,
    farHip: 8, farKnee: 4, nearHip: -8, nearKnee: 4,
    farShoulder: 8, farElbow: 16, nearShoulder: -8, nearElbow: 30, nearHand: 'relaxed',
    packLagY: -0.4, antennaLag: -1.6,
    scarfCtrl: [[-2, 1, 2.2], [-8, 3, 2.0], [-15, 6, 1.6], [-20, 8, 0.9]],
    visorBounce: 'sunrise',
  },
  {
    // GENTLE FASCINATION / CURIOSITY: kneeling gracefully toward a glowing golden Sun-Drop Orchid!
    ...BASE_IDLE, view: 'side_right', mood: 'curious', name: 'em_curious', label: 'CURIOUS',
    hipDy: 10.5, torsoLean: 24, headDx: 1.8, headDy: 0.8, headPitch: 0.24,
    nearHip: 56, nearKnee: 84, nearFootTilt: 0,    // Balanced deep kneeling lunge!
    farHip: -20, farKnee: 82, farFootTilt: -26,
    nearShoulder: 38, nearElbow: 18, farShoulder: 14, farElbow: 36, nearHand: 'reach',
    packLagY: 1.2, antennaLag: -1.4,
    scarfCtrl: [[-2, 2, 2.1], [-7, 6, 1.9], [-12, 11, 1.5], [-15, 16, 0.8]],
    visorBounce: 'gold',
    floatingOrchid: true,
  },
  {
    // TIRED / EXHAUSTED BREATH: heavy slumped shoulders, hands braced near knees, scarf drooping!
    ...BASE_IDLE, view: 'side_right', mood: 'tired', name: 'em_tired', label: 'TIRED',
    hipDy: 5.5, torsoLean: 22, chestExpand: -0.4, headDx: 2.0, headDy: 1.8, headPitch: 0.36,
    nearHip: 20, nearKnee: 36, nearFootTilt: 0,
    farHip: -10, farKnee: 24, farFootTilt: 0,
    nearShoulder: 12, nearElbow: 12, farShoulder: 16, farElbow: 10, nearHand: 'relaxed',
    packLagY: 2.2, packTilt: 8, antennaLag: 0.8,
    scarfCtrl: [[-1, 2, 2.1], [-3, 8, 1.9], [-4, 15, 1.5], [-4, 21, 0.8]],
    visorBounce: 'sunrise',
  },
  {
    // STARTLED / CAUTIOUS ALERT: stepping back protectively, guarding chest monitor!
    ...BASE_IDLE, view: 'three_quarter', mood: 'startled', name: 'em_startled', label: 'STARTLED',
    hipDx: -2.0, hipDy: 1.6, torsoLean: -11, headDx: -1.6, headPitch: -0.06,
    nearHip: 22, nearKnee: 16, nearFootTilt: 10,
    farHip: -20, farKnee: 22, farFootTilt: 0,
    nearShoulder: 18, nearElbow: 74, farShoulder: -24, farElbow: 22, nearHand: 'guard',
    packLagY: -1.0, antennaLag: 3.4,
    scarfCtrl: [[-2, 0, 2.2], [-10, -2, 2.0], [-18, -3, 1.5], [-24, 0, 0.9]],
    visorBounce: 'cyan',
  },
  {
    ...BASE_IDLE, view: 'side_right', mood: 'calm', name: 'tr_crouch', label: 'CROUCH',
    hipDy: 10.5, torsoLean: 18, headPitch: 0.10,
    nearHip: 56, nearKnee: 88, nearFootTilt: 0,
    farHip: 20, farKnee: 78, farFootTilt: -14,
    nearShoulder: 14, nearElbow: 46, farShoulder: -10, farElbow: 40, nearHand: 'relaxed',
    packLagY: 1.8, antennaLag: -1.2,
    scarfCtrl: [[-2, 2, 2.1], [-7, 6, 1.9], [-12, 10, 1.4], [-15, 14, 0.8]],
  },
  {
    ...BASE_IDLE, view: 'side_right', mood: 'determined', name: 'tr_jump', label: 'JUMP',
    hipDy: -7.5, torsoLean: 12, headPitch: -0.18,
    nearHip: 44, nearKnee: 64, nearFootTilt: -10,
    farHip: -16, farKnee: 22, farFootTilt: -28,
    nearShoulder: 52, nearElbow: 52, farShoulder: -34, farElbow: 46, nearHand: 'splay',
    packLagY: 2.2, antennaLag: -2.0,
    scarfCtrl: [[-2, 2, 2.1], [-6, 9, 1.9], [-10, 17, 1.5], [-12, 24, 0.8]],
  },
  {
    // SIGNATURE ACOUSTIC FIELD LENS SCAN!
    ...BASE_IDLE, view: 'three_quarter', mood: 'scan', name: 'act_scan', label: 'SCAN',
    hipDy: 0.4, torsoLean: 4, headPitch: -0.02,
    farHip: 12, farKnee: 6, nearHip: -12, nearKnee: 6,
    farShoulder: -8, farElbow: 24, nearShoulder: 46, nearElbow: 44, nearHand: 'lens',
    packLagY: 0, antennaLag: -2.2,
    scarfCtrl: [[-2, 1, 2.2], [-9, 3, 2.0], [-16, 5, 1.6], [-22, 7, 0.9]],
    visorBounce: 'cyan',
  },
];
