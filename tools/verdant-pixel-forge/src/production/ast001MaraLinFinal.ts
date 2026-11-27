/**
 * AST-001 — Dr. Mara Lin Final Production Character Sprite Sheet (96x384)
 * =======================================================================
 * Final Commercial Production Artwork authored natively through VERDANT PIXEL FORGE.
 * Pass 2 Master Sculpt: zero waist separation on bobY=-1 frames, full organic
 * heroic proportions across all 4 non-mirrored directions, authentic 6-frame bipedal
 * walk, unmistakable -4px field-sampling crouch (zero floating background props),
 * and crisp sculpted Acoustic Field Lens harmonic scan!
 *
 * Strictly obeys docs/asset-production/ASSET_REQUESTS.md v2.0 &
 * game/characters/player/{player.gd, player.tscn} + VERDANT_SIGNAL_PIXEL_ART_STYLE_GUIDE.md:
 *   - Sheet size   : 96x384 px (6 cols x 16 rows of 16x24 px cells)
 *   - Pivot        : (8, 22) -> Sprite2D.offset = Vector2(0, -10), flip_h = false
 *   - Palette      : Strict 30-color VERDANT_MASTER_PALETTE (ZERO off-palette RGB, strict binary alpha 0|255)
 *   - Lighting     : Locked upper-left (~40 deg) key light across ALL 4 non-mirrored directions
 *   - Row layout   : state * 4 + dir (dir: 0=Down, 1=Up, 2=Right, 3=Left)
 *       Rows  0.. 3: idle      (4 active frames cols 0..3, cols 4..5 strictly transparent)
 *       Rows  4.. 7: walk      (6 active frames cols 0..5)
 *       Rows  8..11: crouch    (4 active frames cols 0..3, cols 4..5 strictly transparent)
 *       Rows 12..15: lens_scan (2 active frames cols 0..1, cols 2..5 strictly transparent)
 */

import type { AnimationFrame, LayerNode, ProjectDocument, RGBA } from '../types/studio';
import { compositeFrame, createEmptyBuffer, hexToRgba, setPixel } from '../engine/pixelBuffer';
import { DEFAULT_PALETTES, VERDANT_MASTER_PALETTE } from '../engine/paletteEngine';

const PAL: Record<string, RGBA> = Object.fromEntries(
  VERDANT_MASTER_PALETTE.colors.map((c) => [c.token!, hexToRgba(c.hex, 255)])
);
const ZERO: RGBA = { r: 0, g: 0, b: 0, a: 0 };

const MARA_LAYERS: LayerNode[] = [
  { id: 'l01_antenna', name: '01 Radio Antenna & Mast', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l02_backpack', name: '02 Expedition Backpack & O2 Tank', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l03_back_arm', name: '03 Far Arm & Sleeve', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l04_legs_boots', name: '04 Legs, Kneepads & Heavy Boots', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l05_suit_torso', name: '05 Quilted Survival Suit Torso', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l06_harness_belt', name: '06 Leather Harness & Utility Belt', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l07_helmet_visor', name: '07 Sculpted Helmet & Curved Visor', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l08_front_arm_lens', name: '08 Front Arm & Acoustic Field Lens', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
];

type Dir = 0 | 1 | 2 | 3; // 0=Down, 1=Up, 2=Right, 3=Left

class MaraSheetCanvas {
  readonly width = 96;
  readonly height = 384;
  readonly cels: Record<string, Uint8ClampedArray> = {};

  constructor() {
    for (const l of MARA_LAYERS) {
      this.cels[l.id] = createEmptyBuffer(this.width, this.height);
    }
  }

  stamp(
    col: number,
    row: number,
    layerId: string,
    dx: number,
    dy: number,
    rows: string[],
    legend: Record<string, string>
  ): void {
    const ox = col * 16;
    const oy = row * 24;
    const buf = this.cels[layerId];
    for (let r = 0; r < rows.length; r++) {
      const line = rows[r];
      for (let c = 0; c < line.length; c++) {
        const ch = line[c];
        if (ch === '.' || ch === ' ') continue;
        const tok = legend[ch];
        if (!tok) throw new Error(`Unknown pixel char '${ch}'`);
        const lx = dx + c;
        const ly = dy + r;
        if (lx < 0 || lx >= 16 || ly < 0 || ly >= 24) continue;
        setPixel(buf, this.width, this.height, ox + lx, oy + ly, tok === 'CLR' ? ZERO : PAL[tok]);
      }
    }
  }

  px(col: number, row: number, layerId: string, lx: number, ly: number, tok: string): void {
    if (lx < 0 || lx >= 16 || ly < 0 || ly >= 24) return;
    setPixel(this.cels[layerId], this.width, this.height, col * 16 + lx, row * 24 + ly, tok === 'CLR' ? ZERO : PAL[tok]);
  }

  toProjectDocument(): ProjectDocument {
    const frame: AnimationFrame = {
      id: 'mara_atlas_master',
      durationMs: 140,
      cels: Object.fromEntries(MARA_LAYERS.map((l) => [l.id, new Uint8ClampedArray(this.cels[l.id])])),
    };
    return {
      id: 'ast001-mara-lin-final',
      name: 'AST-001: Dr. Mara Lin Production Sheet (96x384, 64 Non-Mirrored Frames)',
      width: this.width,
      height: this.height,
      layers: MARA_LAYERS.map((l) => ({ ...l })),
      frames: [frame],
      tags: [
        { id: 'tag_idle', name: 'idle_4dir', from: 0, to: 0, color: '#649291' },
        { id: 'tag_walk', name: 'walk_4dir', from: 0, to: 0, color: '#DE884A' },
        { id: 'tag_crouch', name: 'crouch_4dir', from: 0, to: 0, color: '#7B9056' },
        { id: 'tag_lens', name: 'lens_scan_4dir', from: 0, to: 0, color: '#9BC2B6' },
      ],
      activeLayerId: 'l07_helmet_visor',
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
        mapRows: 16,
        mapCells: Array.from({ length: 96 }, (_, i) => ({
          tileIndex: i,
          rotation: 0,
          flipH: false,
          flipV: false,
        })),
      },
      guides: [{ id: 'g_pivot_y', orientation: 'horizontal', pos: 22 }],
      styleNotes:
        'Final commercial AST-001 Dr. Mara Lin 96x384 sheet: 64 non-mirrored 16x24 frames across Down/Up/Right/Left x Idle(4)/Walk(6)/Crouch(4)/LensScan(2). Strict 30-color VERDANT_MASTER_PALETTE, binary alpha, locked upper-left light, zero waist gaps, zero detached pixels.',
      references: [],
      pivot: { x: 8, y: 22 },
      updatedAt: Date.now(),
    };
  }

  composite(): Uint8ClampedArray {
    const doc = this.toProjectDocument();
    return compositeFrame(doc.width, doc.height, doc.layers, doc.frames[0], null);
  }
}

const LEG: Record<string, string> = {
  '0': 'S0', '1': 'S1', '2': 'S2', '3': 'S3', '4': 'S4', '5': 'S5',
  'k': 'B0', 'b': 'B1', 'l': 'B2', 'r': 'B3', 'u': 'B4',
  'd': 'M0', 's': 'M1', 't': 'M2', 'a': 'M3', 'c': 'M4', 'w': 'M5',
  'v': 'V0', 'g': 'V1', 'e': 'V2', 'q': 'V3', 'i': 'V4', 'f': 'V5',
  'R': 'O6', 'G': 'O3', 'Y': 'O4', 'C': 'O5',
};

// ============================================================================
// SCULPTED SPACE HELMETS (10x8 px — Ceramic/Orange Dome + Panoramic Curved Teal Visor)
// ============================================================================

const HELMET_DOWN_STD = [
  '..ddccad..',
  '.d543321d.',
  '.d4dqqgdd.',
  'd3dqfegv0d',
  'd3dqeegv0d',
  'd2dggevv0d',
  '.d1dvvv0d.',
  '..dcatcd..',
];

const HELMET_DOWN_GLOW = [
  '..ddccad..',
  '.d543321d.',
  '.d4diigdd.',
  'd3difigv0d',
  'd3diqegv0d',
  'd2dqgevv0d',
  '.d1dvvv0d.',
  '..dcatcd..',
];

const HELMET_UP_STD = [
  '..ddccad..',
  '.d544321d.',
  'd54433210d',
  'd44332210d',
  'd43322110d',
  'd33221100d',
  '.d21100dd.',
  '..dcatcd..',
];

const HELMET_RIGHT_STD = [
  '..ddccad..',
  '.d54432ad.',
  'd5433dqqgd',
  'd4332dqfgv',
  'd4322deegv',
  'd3221dgvvv',
  '.d210dvvv.',
  '..dcatcd..',
];

const HELMET_RIGHT_GLOW = [
  '..ddccad..',
  '.d54432ad.',
  'd5433diigd',
  'd4332difiv',
  'd4322diqgv',
  'd3221dqvvv',
  '.d210dvvv.',
  '..dcatcd..',
];

const HELMET_LEFT_STD = [
  '..daccd...',
  '.da33211d.',
  'dgqqd3210d',
  'vgfqd2210d',
  'vgeed2110d',
  'vvvgd1100d',
  '.vvvd00dd.',
  '..dctacd..',
];

const HELMET_LEFT_GLOW = [
  '..daccd...',
  '.da33211d.',
  'dgiid3210d',
  'vifid2210d',
  'vqied2110d',
  'vvvqd1100d',
  '.vvvd00dd.',
  '..dctacd..',
];

interface PoseParams {
  bobY: number;
  crouchDrop: number;
  leanX: number;
  stepPhase: number;
  antennaSway: number;
  visorGlintShift: number;
  lensGlow: 0 | 1 | 2;
}

function drawMaraDown(sc: MaraSheetCanvas, col: number, row: number, p: PoseParams): void {
  const by = p.bobY + p.crouchDrop;
  const cx = 3 + p.leanX;

  // 1. Radio Antenna (right-back physical side -> viewer's right x=12)
  const antTopY = Math.max(0, by);
  sc.px(col, row, 'l01_antenna', 12 + p.antennaSway, antTopY, 'M4');
  sc.px(col, row, 'l01_antenna', 12, antTopY + 1, 'M3');
  sc.px(col, row, 'l01_antenna', 12, antTopY + 2, 'M2');
  sc.px(col, row, 'l01_antenna', 12, antTopY + 3, 'M1');
  sc.px(col, row, 'l01_antenna', 12, antTopY + 4, 'M0');

  // 2. Backpack & O2 valve peeking subtly behind shoulders
  sc.stamp(col, row, 'l02_backpack', cx - 1, 8 + by, [
    '.d........d.',
    'dc........sd',
    'da........sd',
    'dt........sd',
    '.d........d.',
  ], LEG);
  sc.px(col, row, 'l02_backpack', cx, 8 + by, 'O6');

  // 4. Legs & Heavy Boots — ALWAYS overlap upward to y=15 (y=16 on crouch) so ZERO waist gap ever opens!
  if (p.crouchDrop > 0) {
    sc.stamp(col, row, 'l04_legs_boots', cx, 16, [
      '.k433221k.',
      '.k43k210k.',
      '.k32k10k..',
      'krlbkbbk..',
      'kbkk.kkbk.',
      '.kk...kkk.',
    ], LEG);
  } else if (p.stepPhase === 1) {
    sc.stamp(col, row, 'l04_legs_boots', cx, 15, [
      '.k433221k.',
      '.k43kk21k.',
      '.k32k.k1k.',
      '.krlk.kbk.',
      '.kbbk..kk.',
      '.kbbk.....',
      '..kk......',
    ], LEG);
  } else if (p.stepPhase === 2) {
    sc.stamp(col, row, 'l04_legs_boots', cx, 15, [
      '.k433221k.',
      '.k43kk21k.',
      '.k32kk10k.',
      '.krlk.k2k.',
      '.kbbk.kbk.',
      '.kbbk..kk.',
      '..kk......',
    ], LEG);
  } else if (p.stepPhase === 3) {
    // Passing rise (bobY=-1): solid pelvis y=15..16 + crisp lifted right heel!
    sc.stamp(col, row, 'l04_legs_boots', cx, 15, [
      '.k433221k.',
      '.k432210k.',
      '.k32kk10k.',
      '.krlk.kbk.',
      '.kbbk..kk.',
      '..kk......',
      '..........',
    ], LEG);
  } else if (p.stepPhase === 4) {
    sc.stamp(col, row, 'l04_legs_boots', cx, 15, [
      '.k433221k.',
      '.k43kk21k.',
      '.k3k.k21k.',
      '.kbk.krlk.',
      '.kk..kbbk.',
      '.....kbbk.',
      '......kk..',
    ], LEG);
  } else if (p.stepPhase === 5) {
    sc.stamp(col, row, 'l04_legs_boots', cx, 15, [
      '.k433221k.',
      '.k43kk21k.',
      '.k32kk21k.',
      '.k2k.krlk.',
      '.kbk.kbbk.',
      '.kk..kbbk.',
      '......kk..',
    ], LEG);
  } else if (p.stepPhase === 6) {
    // Passing rise opposite (bobY=-1): solid pelvis y=15..16 + crisp lifted left heel!
    sc.stamp(col, row, 'l04_legs_boots', cx, 15, [
      '.k433221k.',
      '.k432210k.',
      '.k3k.k21k.',
      '.kbk.krlk.',
      '.kk..kbbk.',
      '......kk..',
      '..........',
    ], LEG);
  } else if (p.lensGlow > 0) {
    // Wide braced investigator stance (connected solidly through y=15 even on f1 bobY=-1!)
    sc.stamp(col, row, 'l04_legs_boots', cx, 15, [
      '.k433221k.',
      '.k43kk21k.',
      'k32k..k10k',
      'krlk..kblk',
      'kbbk..kbbk',
      'kbbk..kbbk',
      '.kk....kk.',
    ], LEG);
  } else {
    sc.stamp(col, row, 'l04_legs_boots', cx, 15, [
      '.k433221k.',
      '.k43kk21k.',
      '.k32kk10k.',
      '.krlkkblk.',
      '.kbbkkbbk.',
      '.kbbkkbbk.',
      '..kk..kk..',
    ], LEG);
  }

  // 5. Quilted Survival Suit Torso (full sculpted shoulders tapering cleanly into hip belt at y=15..16!)
  if (p.crouchDrop > 0) {
    sc.stamp(col, row, 'l05_suit_torso', cx, 13, [
      '.05433210.',
      '044332100.',
      '.0432210..',
      '.0322100..',
    ], LEG);
  } else {
    sc.stamp(col, row, 'l05_suit_torso', cx, 10 + by, [
      '.05433210.',
      '054433210.',
      '044332210.',
      '.0433210..',
      '.0332210..',
      '.0322110..',
    ], LEG);
  }

  // 6. Leather Chest Harness & Utility Belt (always sits cleanly over torso waist!)
  const beltY = p.crouchDrop > 0 ? 16 : 14 + by;
  sc.stamp(col, row, 'l06_harness_belt', cx, beltY - 3, [
    '..dc..sd..',
    '..kb..bk..',
    '..kb..bk..',
    '.kbrcklbk.',
  ], LEG);

  // 7. Sculpted Space Helmet & Panoramic Glass Visor
  const helmY = p.crouchDrop > 0 ? 6 : 2 + by;
  sc.stamp(col, row, 'l07_helmet_visor', cx, helmY, p.lensGlow > 0 ? HELMET_DOWN_GLOW : HELMET_DOWN_STD, LEG);
  if (p.visorGlintShift !== 0 && p.lensGlow === 0) {
    sc.px(col, row, 'l07_helmet_visor', cx + 4, helmY + 3, 'V5');
    sc.px(col, row, 'l07_helmet_visor', cx + 3, helmY + 4, 'V4');
  }

  // 8. Front Arms, Field Sampling Probe (crouch), & Sculpted Acoustic Field Lens (lens_scan)!
  if (p.lensGlow > 0) {
    // Both gloved hands cradling circular brushed-titanium Acoustic Field Lens emitter!
    sc.stamp(col, row, 'l08_front_arm_lens', cx - 1, 11 + by, [
      '.04k....k10.',
      '04k.daad.k10',
      '0k.dciicd.k0',
      '.k.dqiifd.k.',
      '....dddd....',
    ], LEG);
    if (p.lensGlow === 2) {
      // Incandescent harmonic aperture core & crisp cyan pulse glint
      sc.px(col, row, 'l08_front_arm_lens', cx + 4, 13 + by, 'V5');
      sc.px(col, row, 'l08_front_arm_lens', cx + 5, 13 + by, 'V5');
      sc.px(col, row, 'l08_front_arm_lens', cx + 4, 15 + by, 'V4');
      sc.px(col, row, 'l08_front_arm_lens', cx + 5, 15 + by, 'V3');
    }
  } else if (p.crouchDrop > 0) {
    // Grounded field-sampling stance: left hand braced on knee, right hand extending brushed-titanium botanical probe downward!
    const probePulse = p.stepPhase === 11;
    sc.stamp(col, row, 'l08_front_arm_lens', cx - 1, 14, [
      '.04k....k20.',
      '03k......k10',
      '0k........k0',
      '..........kb',
      '.........drk',
    ], LEG);
    sc.px(col, row, 'l08_front_arm_lens', cx + 8, 19, 'M3');
    sc.px(col, row, 'l08_front_arm_lens', cx + 8, 20, probePulse ? 'V4' : 'M4');
    if (probePulse) sc.px(col, row, 'l08_front_arm_lens', cx + 8, 21, 'V5');
  } else {
    const lArmY = p.stepPhase === 4 || p.stepPhase === 5 ? -1 : p.stepPhase === 1 || p.stepPhase === 2 ? 1 : 0;
    const rArmY = -lArmY;
    sc.stamp(col, row, 'l08_front_arm_lens', cx - 1, 11 + by + lArmY, ['05k', '04k', '03k', 'krl', '.kk'], LEG);
    sc.stamp(col, row, 'l08_front_arm_lens', cx + 8, 11 + by + rArmY, ['k20', 'k10', 'k10', 'lbk', 'kk.'], LEG);
  }
}

function drawMaraUp(sc: MaraSheetCanvas, col: number, row: number, p: PoseParams): void {
  const by = p.bobY + p.crouchDrop;
  const cx = 3 + p.leanX;

  // 1. Radio Antenna (physical right-back -> viewer's left x=3)
  const antTopY = Math.max(0, by);
  sc.px(col, row, 'l01_antenna', 3 + p.antennaSway, antTopY, 'M5');
  sc.px(col, row, 'l01_antenna', 3, antTopY + 1, 'M4');
  sc.px(col, row, 'l01_antenna', 3, antTopY + 2, 'M3');
  sc.px(col, row, 'l01_antenna', 3, antTopY + 3, 'M2');
  sc.px(col, row, 'l01_antenna', 3, antTopY + 4, 'M1');

  // 4. Legs & Heavy Boots (connected solidly at y=15 on ALL frames — zero waist gap!)
  if (p.crouchDrop > 0) {
    sc.stamp(col, row, 'l04_legs_boots', cx, 16, [
      '.k322110k.',
      '.k32kk10k.',
      '.k21kk10k.',
      '.kbbkkbbk.',
      'kbkkk.kkbk',
      '.kk....kk.',
    ], LEG);
  } else if (p.stepPhase === 1 || p.stepPhase === 2) {
    sc.stamp(col, row, 'l04_legs_boots', cx, 15, [
      '.k322110k.',
      '.k32kk10k.',
      '.k21k.k1k.',
      '.kbbk.kbk.',
      '.kbbk..kk.',
      '..kk......',
      '..........',
    ], LEG);
  } else if (p.stepPhase === 4 || p.stepPhase === 5) {
    sc.stamp(col, row, 'l04_legs_boots', cx, 15, [
      '.k322110k.',
      '.k32kk10k.',
      '.k2k.k21k.',
      '.kbk.kbbk.',
      '.kk..kbbk.',
      '......kk..',
      '..........',
    ], LEG);
  } else if (p.stepPhase === 3 || p.stepPhase === 6) {
    sc.stamp(col, row, 'l04_legs_boots', cx, 15, [
      '.k322110k.',
      '.k321100k.',
      '.k21kk10k.',
      '.kbbkkbbk.',
      '.kbbk.kbk.',
      '..kk...kk.',
      '..........',
    ], LEG);
  } else if (p.lensGlow > 0) {
    sc.stamp(col, row, 'l04_legs_boots', cx, 15, [
      '.k322110k.',
      '.k32kk10k.',
      'k21k..k10k',
      'kbbk..kbbk',
      'kbbk..kbbk',
      '.kk....kk.',
      '..........',
    ], LEG);
  } else {
    sc.stamp(col, row, 'l04_legs_boots', cx, 15, [
      '.k322110k.',
      '.k32kk10k.',
      '.k21kk10k.',
      '.kblkkbbk.',
      '.kbbkkbbk.',
      '.kbbkkbbk.',
      '..kk..kk..',
    ], LEG);
  }

  // 5. Torso back
  const torsoY = p.crouchDrop > 0 ? 13 : 10 + by;
  sc.stamp(col, row, 'l05_suit_torso', cx, torsoY, [
    '.05433210.',
    '044332210.',
    '043322110.',
    '.0322110..',
    '.0221100..',
  ], LEG);

  // 3. Arms + Raised Acoustic Field Lens when scanning UP!
  if (p.lensGlow > 0) {
    sc.stamp(col, row, 'l08_front_arm_lens', cx - 2, 7 + by, [
      '.di.',
      'dqfd',
      'dced',
      'k43k',
      '.k30',
      '..k0',
    ], LEG);
    if (p.lensGlow === 2) {
      sc.px(col, row, 'l08_front_arm_lens', cx - 1, 6 + by, 'V5');
      sc.px(col, row, 'l08_front_arm_lens', cx - 2, 7 + by, 'V4');
    }
    sc.stamp(col, row, 'l03_back_arm', cx + 8, 11 + by, ['k20', 'k10', 'lbk', 'kk.'], LEG);
  } else {
    const lArmY = p.stepPhase === 1 || p.stepPhase === 2 ? -1 : p.stepPhase === 4 || p.stepPhase === 5 ? 1 : 0;
    const rArmY = -lArmY;
    sc.stamp(col, row, 'l03_back_arm', cx - 1, 11 + by + lArmY, ['04k', '03k', 'krl', '.kk'], LEG);
    sc.stamp(col, row, 'l03_back_arm', cx + 8, 11 + by + rArmY, ['k20', 'k10', 'lbk', 'kk.'], LEG);
  }

  // 7. Helmet Back
  const helmY = p.crouchDrop > 0 ? 6 : 2 + by;
  sc.stamp(col, row, 'l07_helmet_visor', cx, helmY, HELMET_UP_STD, LEG);

  // 6. Iconic Expedition Backpack + Vertical Brushed Titanium O2 Cylinder!
  const packY = p.crouchDrop > 0 ? 12 : 9 + by;
  sc.stamp(col, row, 'l06_harness_belt', cx + 1, packY, [
    'dRcddssd',
    'dwcdrlbd',
    'dcadrlbd',
    'datdtrbd',
    'dasdbbbd',
    '.ddkbbkd',
    '..kbrbk.',
  ], LEG);
}

function drawMaraRight(sc: MaraSheetCanvas, col: number, row: number, p: PoseParams): void {
  const by = p.bobY + p.crouchDrop;
  const cx = 3 + p.leanX;

  // 1. Radio Antenna rising behind backpack on LEFT (x=3)
  const antTopY = Math.max(0, by);
  sc.px(col, row, 'l01_antenna', 3 + p.antennaSway, antTopY, 'M5');
  sc.px(col, row, 'l01_antenna', 3, antTopY + 1, 'M4');
  sc.px(col, row, 'l01_antenna', 3, antTopY + 2, 'M3');
  sc.px(col, row, 'l01_antenna', 3, antTopY + 3, 'M2');
  sc.px(col, row, 'l01_antenna', 3, antTopY + 4, 'M1');

  // 2. Heroic Sunlit Expedition Backpack + Brushed Titanium O2 Tank on LEFT back!
  const packY = p.crouchDrop > 0 ? 11 : 8 + by;
  sc.stamp(col, row, 'l02_backpack', 1 + p.leanX, packY, [
    '.dRd.',
    'dwcad',
    'dcadd',
    'datbd',
    'dasbd',
    'dsbbd',
    '.dkd.',
  ], LEG);

  // 3. Far Arm swinging naturally behind torso
  if (p.stepPhase === 1 || p.stepPhase === 2) {
    sc.stamp(col, row, 'l03_back_arm', cx + 6, 12 + by, ['210', '10k', 'bk.'], LEG);
  } else if (p.stepPhase === 4 || p.stepPhase === 5) {
    sc.stamp(col, row, 'l03_back_arm', cx + 2, 12 + by, ['210', '10k', 'bk.'], LEG);
  }

  // 4. Sculpted Side-Profile Legs & Boots (anchored cleanly from y=15 -> ZERO waist gap!)
  if (p.crouchDrop > 0) {
    sc.stamp(col, row, 'l04_legs_boots', cx - 1, 16, [
      '..04321k..',
      '..0432k...',
      '.032k32k..',
      'kbbk.krlk.',
      'kkk..kbbk.',
      '......kkk.',
    ], LEG);
  } else if (p.stepPhase === 1) {
    sc.stamp(col, row, 'l04_legs_boots', cx - 2, 15, [
      '...04321k.',
      '...0432k..',
      '..032k43k.',
      '.k21k.k32k',
      'kbbk...krl',
      'kkk....kbb',
      '........kk',
    ], LEG);
  } else if (p.stepPhase === 2) {
    sc.stamp(col, row, 'l04_legs_boots', cx - 1, 15, [
      '..04321k..',
      '..0432k...',
      '.032k32k..',
      '.k2k.krlk.',
      'kbk..kbbk.',
      'kk...kbbk.',
      '......kkk.',
    ], LEG);
  } else if (p.stepPhase === 3 || p.stepPhase === 6) {
    // Passing rise (bobY=-1): solid connected pelvis y=15 + lifted mid-stride knee!
    sc.stamp(col, row, 'l04_legs_boots', cx, 15, [
      '.04321k...',
      '.04321k...',
      '.032k2k...',
      '.krlkbbk..',
      '.kbbk.kk..',
      '..kkk.....',
      '..........',
    ], LEG);
  } else if (p.stepPhase === 4) {
    sc.stamp(col, row, 'l04_legs_boots', cx - 2, 15, [
      '...04321k.',
      '...0432k..',
      '..043k21k.',
      '.k32k.k10k',
      'krlk...kbb',
      'kbbk...kkk',
      '.kk.......',
    ], LEG);
  } else if (p.stepPhase === 5) {
    sc.stamp(col, row, 'l04_legs_boots', cx - 1, 15, [
      '..04321k..',
      '..0432k...',
      '.043k21k..',
      '.krlk.k1k.',
      'kbbk..kbk.',
      'kbbk...kk.',
      '.kkk......',
    ], LEG);
  } else if (p.lensGlow > 0) {
    sc.stamp(col, row, 'l04_legs_boots', cx - 1, 15, [
      '..04321k..',
      '..0432k...',
      '.043k32k..',
      '.k3k.krlk.',
      'kbbk..kbbk',
      'kbbk..kbbk',
      '.kk....kkk',
    ], LEG);
  } else {
    sc.stamp(col, row, 'l04_legs_boots', cx, 15, [
      '.04321k...',
      '.04321k...',
      '.03221k...',
      '.krlbbk...',
      '.kbbkbk...',
      '.kbbkbbk..',
      '..kk.kkk..',
    ], LEG);
  }

  // 5. Full-Volume Quilted Survival Torso (facing RIGHT)
  if (p.crouchDrop > 0) {
    sc.stamp(col, row, 'l05_suit_torso', cx, 13, [
      '.0543210..',
      '044332100.',
      '.0322110..',
      '.0321100..',
    ], LEG);
  } else {
    sc.stamp(col, row, 'l05_suit_torso', cx, 10 + by, [
      '.0543210..',
      '05443210..',
      '04433210..',
      '04332210..',
      '.033210...',
      '.032110...',
    ], LEG);
  }

  // 6. Leather Harness Strap & Belt
  const beltY = p.crouchDrop > 0 ? 16 : 14 + by;
  sc.stamp(col, row, 'l06_harness_belt', cx + 1, beltY - 3, [
    '.dc...',
    '.kb...',
    '..kb..',
    'kbrckb',
  ], LEG);

  // 7. Sculpted Right-Facing Space Helmet
  const helmY = p.crouchDrop > 0 ? 6 : 2 + by;
  sc.stamp(col, row, 'l07_helmet_visor', cx, helmY, p.lensGlow > 0 ? HELMET_RIGHT_GLOW : HELMET_RIGHT_STD, LEG);

  // 8. Front Arm + Sculpted Handheld Acoustic Field Lens / Botanical Sampling Probe!
  if (p.lensGlow > 0) {
    // Arm extended cleanly RIGHT holding circular brushed-titanium Acoustic Lens emitter!
    sc.stamp(col, row, 'l08_front_arm_lens', cx + 2, 10 + by, [
      '......dd..',
      '05443dcid.',
      '04321dcifd',
      '.0210ddqd.',
      '......dd..',
    ], LEG);
    if (p.lensGlow === 2) {
      sc.px(col, row, 'l08_front_arm_lens', 15, 12 + by, 'V5');
      sc.px(col, row, 'l08_front_arm_lens', 14, 10 + by, 'V4');
      sc.px(col, row, 'l08_front_arm_lens', 14, 14 + by, 'V4');
    }
  } else if (p.crouchDrop > 0) {
    // Reaching down-right with brushed-titanium field sampling tool (attached cleanly to glove!)
    const pulse = p.stepPhase === 11;
    sc.stamp(col, row, 'l08_front_arm_lens', cx + 2, 14, [
      '054k....',
      '.043k...',
      '..032k..',
      '...krlk.',
      '....kbcd',
    ], LEG);
    if (pulse) {
      sc.px(col, row, 'l08_front_arm_lens', cx + 9, 19, 'V4');
      sc.px(col, row, 'l08_front_arm_lens', cx + 10, 19, 'V5');
    } else {
      sc.px(col, row, 'l08_front_arm_lens', cx + 9, 19, 'M4');
    }
  } else if (p.stepPhase === 1 || p.stepPhase === 2) {
    sc.stamp(col, row, 'l08_front_arm_lens', cx, 11 + by, ['..05k', '.043k', '032k.', 'krl..', 'kk...'], LEG);
  } else if (p.stepPhase === 4 || p.stepPhase === 5) {
    sc.stamp(col, row, 'l08_front_arm_lens', cx + 2, 11 + by, ['05k..', '043k.', '.032k', '..krl', '...kk'], LEG);
  } else {
    sc.stamp(col, row, 'l08_front_arm_lens', cx + 2, 11 + by, ['05k', '04k', '03k', 'krl', '.kk'], LEG);
  }
}

function drawMaraLeft(sc: MaraSheetCanvas, col: number, row: number, p: PoseParams): void {
  // STRICTLY NON-MIRRORED LEFT DIRECTION (Upper-left key light hits front visor & chest brightly, backpack in cool shade!)
  const by = p.bobY + p.crouchDrop;
  const cx = 3 + p.leanX;

  // 1. Radio Antenna rising behind backpack on RIGHT (x=12)
  const antTopY = Math.max(0, by);
  sc.px(col, row, 'l01_antenna', 12 + p.antennaSway, antTopY, 'M4');
  sc.px(col, row, 'l01_antenna', 12, antTopY + 1, 'M3');
  sc.px(col, row, 'l01_antenna', 12, antTopY + 2, 'M2');
  sc.px(col, row, 'l01_antenna', 12, antTopY + 3, 'M1');
  sc.px(col, row, 'l01_antenna', 12, antTopY + 4, 'M0');

  // 2. Heroic Shaded Backpack + O2 Cylinder on RIGHT back (non-mirrored cool side!)
  const packY = p.crouchDrop > 0 ? 11 : 8 + by;
  sc.stamp(col, row, 'l02_backpack', 10 + p.leanX, packY, [
    '.dRd.',
    'datsd',
    'dstsd',
    'dbsad',
    'dbssd',
    'dbbsd',
    '.dkd.',
  ], LEG);

  // 3. Far Arm peeking naturally on left-front during stride
  if (p.stepPhase === 1 || p.stepPhase === 2) {
    sc.stamp(col, row, 'l03_back_arm', cx + 1, 12 + by, ['032', 'k21', '.kb'], LEG);
  } else if (p.stepPhase === 4 || p.stepPhase === 5) {
    sc.stamp(col, row, 'l03_back_arm', cx + 5, 12 + by, ['021', 'k10', '.kb'], LEG);
  }

  // 4. Sculpted Left-Facing Legs & Boots (anchored solidly at y=15 -> ZERO waist gap!)
  if (p.crouchDrop > 0) {
    sc.stamp(col, row, 'l04_legs_boots', cx, 16, [
      '..k43210..',
      '...k4320..',
      '..k43k210.',
      '.krlk.kbbk',
      '.kbbk..kkk',
      '.kkk......',
    ], LEG);
  } else if (p.stepPhase === 1) {
    sc.stamp(col, row, 'l04_legs_boots', cx - 1, 15, [
      '..k43210..',
      '..k4320...',
      '.k43k210..',
      'k32k.k10k.',
      'rlk...kbbk',
      'bbk....kkk',
      'kk........',
    ], LEG);
  } else if (p.stepPhase === 2) {
    sc.stamp(col, row, 'l04_legs_boots', cx, 15, [
      '..k43210..',
      '...k4320..',
      '..k43k210.',
      '.krlk.k1k.',
      '.kbbk..kbk',
      '.kbbk...kk',
      'kkk.......',
    ], LEG);
  } else if (p.stepPhase === 3 || p.stepPhase === 6) {
    // Passing rise (bobY=-1): solid connected pelvis y=15 + lifted stride knee!
    sc.stamp(col, row, 'l04_legs_boots', cx + 1, 15, [
      '..k43210..',
      '..k43210..',
      '..k3k210..',
      '.kbbkrlk..',
      '.kk.kbbk..',
      '.....kkk..',
      '..........',
    ], LEG);
  } else if (p.stepPhase === 4) {
    sc.stamp(col, row, 'l04_legs_boots', cx - 1, 15, [
      '..k43210..',
      '..k4320...',
      '.k21k320..',
      'k10k.k32k.',
      'bbk...krlk',
      'kkk...kbbk',
      '.......kk.',
    ], LEG);
  } else if (p.stepPhase === 5) {
    sc.stamp(col, row, 'l04_legs_boots', cx, 15, [
      '..k43210..',
      '...k4320..',
      '..k21k320.',
      '.k1k.krlk.',
      'kbk..kbbk.',
      'kk...kbbk.',
      '......kkk.',
    ], LEG);
  } else if (p.lensGlow > 0) {
    sc.stamp(col, row, 'l04_legs_boots', cx, 15, [
      '..k43210..',
      '...k4320..',
      '..k43k210.',
      '.krlk.k1k.',
      'kbbk..kbbk',
      'kbbk..kbbk',
      'kkk....kk.',
    ], LEG);
  } else {
    sc.stamp(col, row, 'l04_legs_boots', cx + 1, 15, [
      '...k43210.',
      '...k43210.',
      '...k32110.',
      '...krlbbk.',
      '...kbkbbk.',
      '..kbbkbbk.',
      '..kkk.kk..',
    ], LEG);
  }

  // 5. Full-Volume Quilted Torso (facing LEFT -> front-left chest sunlit S5/S4!)
  if (p.crouchDrop > 0) {
    sc.stamp(col, row, 'l05_suit_torso', cx, 13, [
      '..0543210.',
      '.054322100',
      '..0321100.',
      '..0321000.',
    ], LEG);
  } else {
    sc.stamp(col, row, 'l05_suit_torso', cx, 10 + by, [
      '..0543210.',
      '..05432100',
      '..04432100',
      '..04322100',
      '...032100.',
      '...032100.',
    ], LEG);
  }

  // 6. Harness & Belt
  const beltY = p.crouchDrop > 0 ? 16 : 14 + by;
  sc.stamp(col, row, 'l06_harness_belt', cx + 2, beltY - 3, [
    '...cd.',
    '...bk.',
    '..bk..',
    'bkcrbk',
  ], LEG);

  // 7. Non-Mirrored Left-Facing Sculpted Helmet
  const helmY = p.crouchDrop > 0 ? 6 : 2 + by;
  sc.stamp(col, row, 'l07_helmet_visor', cx, helmY, p.lensGlow > 0 ? HELMET_LEFT_GLOW : HELMET_LEFT_STD, LEG);

  // 8. Front Arm + Sculpted Handheld Acoustic Field Lens / Botanical Probe!
  if (p.lensGlow > 0) {
    sc.stamp(col, row, 'l08_front_arm_lens', 0, 10 + by, [
      '..dd......',
      '.dicd34450',
      'dficd12340',
      '.dqdd0120.',
      '..dd......',
    ], LEG);
    if (p.lensGlow === 2) {
      sc.px(col, row, 'l08_front_arm_lens', 0, 12 + by, 'V5');
      sc.px(col, row, 'l08_front_arm_lens', 1, 10 + by, 'V4');
      sc.px(col, row, 'l08_front_arm_lens', 1, 14 + by, 'V4');
    }
  } else if (p.crouchDrop > 0) {
    const pulse = p.stepPhase === 11;
    sc.stamp(col, row, 'l08_front_arm_lens', cx - 1, 14, [
      '....k430',
      '...k3210',
      '..k210..',
      '.krlk...',
      'dcbk....',
    ], LEG);
    if (pulse) {
      sc.px(col, row, 'l08_front_arm_lens', cx - 1, 19, 'V4');
      sc.px(col, row, 'l08_front_arm_lens', cx - 2, 19, 'V5');
    } else {
      sc.px(col, row, 'l08_front_arm_lens', cx - 1, 19, 'M4');
    }
  } else if (p.stepPhase === 1 || p.stepPhase === 2) {
    sc.stamp(col, row, 'l08_front_arm_lens', cx + 4, 11 + by, ['k40..', 'k320.', '.k210', '..lrk', '...kk'], LEG);
  } else if (p.stepPhase === 4 || p.stepPhase === 5) {
    sc.stamp(col, row, 'l08_front_arm_lens', cx + 2, 11 + by, ['..k40', '.k320', 'k210.', 'lrk..', 'kk...'], LEG);
  } else {
    sc.stamp(col, row, 'l08_front_arm_lens', cx + 4, 11 + by, ['k40', 'k30', 'k20', 'lrk', 'kk.'], LEG);
  }
}

function drawDirection(sc: MaraSheetCanvas, dir: Dir, col: number, row: number, p: PoseParams): void {
  if (dir === 0) drawMaraDown(sc, col, row, p);
  else if (dir === 1) drawMaraUp(sc, col, row, p);
  else if (dir === 2) drawMaraRight(sc, col, row, p);
  else drawMaraLeft(sc, col, row, p);
}

export function buildAst001MaraLinFinal(): { canvas: MaraSheetCanvas; doc: ProjectDocument } {
  const sc = new MaraSheetCanvas();

  for (let dir = 0 as Dir; dir < 4; dir = (dir + 1) as Dir) {
    const idlePoses: PoseParams[] = [
      { bobY: 0, crouchDrop: 0, leanX: 0, stepPhase: 0, antennaSway: 0, visorGlintShift: 0, lensGlow: 0 },
      { bobY: -1, crouchDrop: 0, leanX: 0, stepPhase: 0, antennaSway: 0, visorGlintShift: 1, lensGlow: 0 },
      { bobY: -1, crouchDrop: 0, leanX: 0, stepPhase: 0, antennaSway: 1, visorGlintShift: 1, lensGlow: 0 },
      { bobY: 0, crouchDrop: 0, leanX: 0, stepPhase: 0, antennaSway: 0, visorGlintShift: 0, lensGlow: 0 },
    ];
    for (let f = 0; f < 4; f++) drawDirection(sc, dir, f, 0 + dir, idlePoses[f]);

    const walkPoses: PoseParams[] = [
      { bobY: 0, crouchDrop: 0, leanX: 0, stepPhase: 1, antennaSway: -1, visorGlintShift: 0, lensGlow: 0 },
      { bobY: 1, crouchDrop: 0, leanX: 0, stepPhase: 2, antennaSway: 0, visorGlintShift: 0, lensGlow: 0 },
      { bobY: -1, crouchDrop: 0, leanX: 0, stepPhase: 3, antennaSway: 1, visorGlintShift: 1, lensGlow: 0 },
      { bobY: 0, crouchDrop: 0, leanX: 0, stepPhase: 4, antennaSway: 1, visorGlintShift: 0, lensGlow: 0 },
      { bobY: 1, crouchDrop: 0, leanX: 0, stepPhase: 5, antennaSway: 0, visorGlintShift: 0, lensGlow: 0 },
      { bobY: -1, crouchDrop: 0, leanX: 0, stepPhase: 6, antennaSway: -1, visorGlintShift: 1, lensGlow: 0 },
    ];
    for (let f = 0; f < 6; f++) drawDirection(sc, dir, f, 4 + dir, walkPoses[f]);

    const crouchPoses: PoseParams[] = [
      { bobY: 0, crouchDrop: 4, leanX: 0, stepPhase: 10, antennaSway: 0, visorGlintShift: 0, lensGlow: 0 },
      { bobY: 0, crouchDrop: 4, leanX: 0, stepPhase: 11, antennaSway: 1, visorGlintShift: 1, lensGlow: 0 },
      { bobY: 0, crouchDrop: 4, leanX: 0, stepPhase: 11, antennaSway: 1, visorGlintShift: 1, lensGlow: 0 },
      { bobY: 0, crouchDrop: 4, leanX: 0, stepPhase: 10, antennaSway: 0, visorGlintShift: 0, lensGlow: 0 },
    ];
    for (let f = 0; f < 4; f++) drawDirection(sc, dir, f, 8 + dir, crouchPoses[f]);

    const scanPoses: PoseParams[] = [
      { bobY: 0, crouchDrop: 0, leanX: 0, stepPhase: 20, antennaSway: 0, visorGlintShift: 0, lensGlow: 1 },
      { bobY: -1, crouchDrop: 0, leanX: 0, stepPhase: 21, antennaSway: 1, visorGlintShift: 1, lensGlow: 2 },
    ];
    for (let f = 0; f < 2; f++) drawDirection(sc, dir, f, 12 + dir, scanPoses[f]);
  }

  return { canvas: sc, doc: sc.toProjectDocument() };
}
