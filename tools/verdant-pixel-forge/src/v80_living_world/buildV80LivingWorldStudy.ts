/**
 * VERDANT SIGNAL — V8.0 LIVING WORLD STUDY BUILDER
 * ==============================================================================
 * Strictly isolated inside: game/assets/v80_living_world_study/ (.gdignore)
 * Reads V7.3 extracted modular sprites & verbatim unmodified 88x88 character strips
 * READ-ONLY — V7.3, V7.2, V7.1, V7.0, V5.0, V4.0, v3.0, Milestone 01 & production
 * game/project.godot remain 100% untouched!
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { encodeRGBA8PNG } from '../engine/pngEncoder';
import { createEmptyBuffer, setPixel } from '../engine/pixelBuffer';
import { blitV4 } from '../v4_masterpiece/v4Core';
import { type RGB, hexToRgb } from '../v5_soul/v5PixelEngine';
import { type RgbaImage } from '../v7_immersive/v7WorldEngine';
import {
  V73_CHAR_FRAME_H,
  V73_CHAR_FRAME_W,
  V73_RUN_SPEED,
  V73_VIEW_H,
  V73_VIEW_W,
  V73_WALK_SPEED,
  type V73AnimState,
  type V73CardinalDir,
  type V73CharacterAtlas,
  evaluateV73Movement,
  getV73OpenWorldDef,
} from '../v73_open_world/v73OpenWorldEngine';
import {
  V80_TUFT_SPECIES_LIST,
  buildV80LivingAtlas,
  buildV80LivingForestFloor,
  generateV80LivingEcosystemPlacements,
} from './v80LivingGroundArt';
import {
  type V80GrassBendRecord,
  type V80LightingMood,
  type V80WorldState,
  getV80Sunbeams,
  renderV80LivingWorldFrame,
  updateV80GrassFootsteps,
} from './v80LivingWorldEngine';
import { exportV80StandaloneGodotProject } from './v80GodotProjectExporter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../..');

const V73_ROOT = path.join(REPO_ROOT, 'game/assets/v73_open_world_playability_study');
const V73_SPRITES_DIR = path.join(V73_ROOT, 'sprites');
const V73_PROOFS_DIR = path.join(V73_ROOT, 'proofs');
const V73_CHAR_EXTRACTED = path.join(V73_ROOT, 'character_source_original/extracted/Idle');

const OUT_ROOT = path.join(REPO_ROOT, 'game/assets/v80_living_world_study');
const SPRITES_DIR = path.join(OUT_ROOT, 'sprites');
const PROOFS_DIR = path.join(OUT_ROOT, 'proofs');
const PLAYABLE_DIR = path.join(OUT_ROOT, 'playable_web');
const GODOT_PROJ_DIR = path.join(OUT_ROOT, 'godot_project');

function writePng(filePath: string, pixels: Uint8ClampedArray, width: number, height: number): void {
  fs.writeFileSync(filePath, encodeRGBA8PNG(pixels, width, height));
}

function loadPngRaw(filePath: string): RgbaImage {
  const dimStr = execFileSync('identify', ['-format', '%w %h', filePath], { encoding: 'utf8' }).trim();
  const [width, height] = dimStr.split(' ').map(Number);
  const rawBuf = execFileSync('convert', [filePath, '-depth', '8', 'rgba:-'], {
    maxBuffer: width * height * 4 + 65536,
  });
  return { pixels: new Uint8ClampedArray(rawBuf), width, height };
}

function loadUnmodifiedCharacterAtlasReadOnly(): V73CharacterAtlas {
  const animMap: Record<V73AnimState, string> = { idle: 'Idle', walking: 'Walking', running: 'Running' };
  const dirs: V73CardinalDir[] = ['south', 'north', 'east', 'west'];
  const frames: V73CharacterAtlas['frames'] = {
    idle: { south: [], north: [], east: [], west: [] },
    walking: { south: [], north: [], east: [], west: [] },
    running: { south: [], north: [], east: [], west: [] },
  };
  for (const state of ['idle', 'walking', 'running'] as V73AnimState[]) {
    // Copy exact unmodified packed 88x88 character strip directly from V7.3 read-only
    fs.copyFileSync(
      path.join(V73_SPRITES_DIR, `char_${state}_88x88_8x4.png`),
      path.join(SPRITES_DIR, `char_${state}_88x88_8x4.png`)
    );
    for (const dir of dirs) {
      const dirPath = path.join(V73_CHAR_EXTRACTED, 'animations', animMap[state], dir);
      const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.png')).sort();
      for (const fn of files) {
        const img = loadPngRaw(path.join(dirPath, fn));
        if (img.width !== V73_CHAR_FRAME_W || img.height !== V73_CHAR_FRAME_H) {
          throw new Error(`Unexpected char dim ${img.width}x${img.height}`);
        }
        frames[state][dir].push(img);
      }
    }
  }
  return { frames };
}

const FONT_3X5: Record<string, string[]> = {
  A: ['010', '101', '111', '101', '101'], B: ['110', '101', '110', '101', '110'],
  C: ['011', '100', '100', '100', '011'], D: ['110', '101', '101', '101', '110'],
  E: ['111', '100', '110', '100', '111'], F: ['111', '100', '110', '100', '100'],
  G: ['011', '100', '101', '101', '011'], H: ['101', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'], K: ['101', '101', '110', '101', '101'],
  L: ['100', '100', '100', '100', '111'], M: ['101', '111', '111', '101', '101'],
  N: ['110', '101', '101', '101', '101'], O: ['010', '101', '101', '101', '010'],
  P: ['110', '101', '110', '100', '100'], R: ['110', '101', '110', '101', '101'],
  S: ['011', '100', '010', '001', '110'], T: ['111', '010', '010', '010', '010'],
  U: ['101', '101', '101', '101', '011'], V: ['101', '101', '101', '101', '010'],
  W: ['101', '101', '111', '111', '101'], X: ['101', '101', '010', '101', '101'],
  Y: ['101', '101', '010', '010', '010'], Z: ['111', '001', '010', '100', '111'],
  '0': ['111', '101', '101', '101', '111'], '1': ['010', '110', '010', '010', '111'],
  '2': ['110', '001', '010', '100', '111'], '3': ['110', '001', '010', '001', '110'],
  '4': ['101', '101', '111', '001', '001'], '5': ['111', '100', '110', '001', '110'],
  '6': ['011', '100', '111', '101', '111'], '7': ['111', '001', '010', '010', '010'],
  '8': ['111', '101', '111', '101', '111'], '9': ['111', '101', '111', '001', '110'],
  '.': ['000', '000', '000', '000', '010'], ':': ['000', '010', '000', '010', '000'],
  '-': ['000', '000', '111', '000', '000'], '+': ['000', '010', '111', '010', '000'],
  '(': ['010', '100', '100', '100', '010'], ')': ['010', '001', '001', '001', '010'],
  '/': ['001', '001', '010', '100', '100'], ' ': ['000', '000', '000', '000', '000'],
};

function drawText3x5(buf: Uint8ClampedArray, w: number, h: number, text: string, x0: number, y0: number, col: RGB): void {
  let x = x0;
  for (const ch of text.toUpperCase()) {
    const g = FONT_3X5[ch] ?? FONT_3X5[' '];
    for (let gy = 0; gy < 5; gy++) {
      for (let gx = 0; gx < 3; gx++) {
        if (g[gy][gx] === '1') setPixel(buf, w, h, x + gx, y0 + gy, { ...col, a: 255 });
      }
    }
    x += 4;
  }
}

function cropAndScaleNearest(src: Uint8ClampedArray, srcW: number, sx: number, sy: number, cw: number, ch: number, scale: number): RgbaImage {
  const dw = cw * scale;
  const dh = ch * scale;
  const out = createEmptyBuffer(dw, dh);
  for (let y = 0; y < dh; y++) {
    const py = sy + Math.floor(y / scale);
    for (let x = 0; x < dw; x++) {
      const px = sx + Math.floor(x / scale);
      const si = (py * srcW + px) * 4;
      const di = (y * dw + x) * 4;
      out[di] = src[si]; out[di + 1] = src[si + 1]; out[di + 2] = src[si + 2]; out[di + 3] = 255;
    }
  }
  return { pixels: out, width: dw, height: dh };
}

function main(): void {
  fs.mkdirSync(SPRITES_DIR, { recursive: true });
  fs.mkdirSync(PROOFS_DIR, { recursive: true });
  fs.mkdirSync(PLAYABLE_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_ROOT, '.gdignore'), '# Isolated V8.0 Living World study — excluded from production Godot scan\n');

  console.log('=== VERDANT SIGNAL V8.0 — THE LIVING WORLD REVOLUTION BUILD ===');

  // 1. Load unmodified character sprites + V7.3 modular props read-only
  console.log('[1/8] Loading unmodified 88x88 character strips & V7.3 modular props (read-only)...');
  const charAtlas = loadUnmodifiedCharacterAtlasReadOnly();
  const baseWorld = getV73OpenWorldDef();
  const sprites: Record<string, RgbaImage> = {};
  for (const p of baseWorld.props) {
    if (sprites[p.spriteKey]) continue;
    const srcPath = path.join(V73_SPRITES_DIR, `${p.spriteKey}.png`);
    const dstPath = path.join(SPRITES_DIR, `${p.spriteKey}.png`);
    fs.copyFileSync(srcPath, dstPath);
    sprites[p.spriteKey] = loadPngRaw(srcPath);
  }

  // 2. PASS A/B/C: Build handcrafted living grass atlas + revolutionary 2304x1536 ground + root-interlacing tufts!
  console.log('[2/8] PASS A/B/C: Crafting 6-frame living grass atlas, 4-frame critters & 2304x1536 detailed grass/embedded-root floor...');
  const livingAtlas = buildV80LivingAtlas();
  writePng(path.join(SPRITES_DIR, 'living_grass_tufts_24x24_6x8.png'), livingAtlas.tuftSheet.pixels, livingAtlas.tuftSheet.width, livingAtlas.tuftSheet.height);
  writePng(path.join(SPRITES_DIR, 'living_critters_12x12_4x3.png'), livingAtlas.critterSheet.pixels, livingAtlas.critterSheet.width, livingAtlas.critterSheet.height);

  const ground = buildV80LivingForestFloor(baseWorld);
  writePng(path.join(SPRITES_DIR, 'v80_living_floor_2304x1536.png'), ground.floor.pixels, ground.floor.width, ground.floor.height);

  const { tufts, critters } = generateV80LivingEcosystemPlacements(baseWorld, ground);
  const sunbeams = getV80Sunbeams();
  const state: V80WorldState = { baseWorld, ground, livingAtlas, tufts, critters, sunbeams };

  const rootWrapCount = tufts.filter((t) => t.isRootWrap).length;
  console.log(
    `   PASS A/B/C stats: ${ground.bakedBotanicalStamps} handcrafted grass/clover/flower/pebble stamps | ` +
    `${ground.embeddedPropsCount} objects physically embedded into soil/roots | ` +
    `${tufts.length} live animated grass tufts (${rootWrapCount} root/rock/log foreground wraps) | ${critters.length} butterflies/moths`
  );

  const snapCam = (px: number, py: number) => ({
    cx: Math.max(baseWorld.camBounds.minX, Math.min(baseWorld.camBounds.maxX, Math.round(px - V73_VIEW_W / 2))),
    cy: Math.max(baseWorld.camBounds.minY, Math.min(baseWorld.camBounds.maxY, Math.round(py - V73_VIEW_H / 2 - 18))),
  });

  // 3. PASS D: Render native 640x360 gameplay stills across ALL zones & lighting moods!
  console.log('[3/8] PASS D: Rendering native 640x360 Living World scenes across Afternoon, Dawn & Shaded Forest moods...');
  const stillSpecs: Array<{ file: string; px: number; py: number; dir: V73CardinalDir; anim: V73AnimState; f: number; mood: V80LightingMood; dbg?: boolean }> = [
    { file: 'v80_04_hub_afternoon_640x360.png', px: 1024, py: 822, dir: 'east', anim: 'walking', f: 2, mood: 'afternoon' },
    { file: 'v80_05_root_arch_afternoon_640x360.png', px: 1118, py: 454, dir: 'north', anim: 'walking', f: 3, mood: 'afternoon' },
    { file: 'v80_06_clearing_afternoon_640x360.png', px: 1618, py: 824, dir: 'east', anim: 'idle', f: 0, mood: 'afternoon' },
    { file: 'v80_07_waystone_biolum_shaded_640x360.png', px: 1656, py: 518, dir: 'north', anim: 'idle', f: 0, mood: 'shaded_forest' },
    { file: 'v80_08_fallen_log_dawn_640x360.png', px: 632, py: 956, dir: 'west', anim: 'walking', f: 5, mood: 'dawn' },
    { file: 'v80_09_collision_debug_intact_640x360.png', px: 1024, py: 822, dir: 'east', anim: 'idle', f: 0, mood: 'afternoon', dbg: true },
  ];

  const renderedMap: Record<string, Uint8ClampedArray> = {};
  for (const s of stillSpecs) {
    const { cx, cy } = snapCam(s.px, s.py);
    const fr = renderV80LivingWorldFrame({
      state, sprites, charAtlas,
      playerX: s.px, playerY: s.py, playerDir: s.dir, playerAnim: s.anim, playerFrameIdx: s.f,
      camX: cx, camY: cy, timeSec: 2.1, mood: s.mood, debugCollision: !!s.dbg,
    });
    writePng(path.join(PROOFS_DIR, s.file), fr.pixels, V73_VIEW_W, V73_VIEW_H);
    renderedMap[s.file] = fr.pixels;
  }

  // 4. Build Direct 1:1 BEFORE vs AFTER Comparison Sheet (V7.3 vs V8.0 on Hub & Sunlit Clearing!)
  console.log('[4/8] Composing direct 1:1 BEFORE (V7.3) vs AFTER (V8.0) comparison quad...');
  const v73Hub = loadPngRaw(path.join(V73_PROOFS_DIR, 'proof_01_woodland_hub_center_640x360.png'));
  const v73Clear = loadPngRaw(path.join(V73_PROOFS_DIR, 'proof_03_sunlit_clearing_and_chimes_640x360.png'));
  const PAD = 8, HDR = 16;
  const CW = PAD * 3 + V73_VIEW_W * 2;
  const CH = PAD * 3 + HDR * 2 + V73_VIEW_H * 2;
  const comp = createEmptyBuffer(CW, CH);
  const bg = hexToRgb('#091314');
  for (let i = 0; i < CW * CH; i++) {
    comp[i * 4] = bg.r; comp[i * 4 + 1] = bg.g; comp[i * 4 + 2] = bg.b; comp[i * 4 + 3] = 255;
  }
  const compPanels: Array<[string, Uint8ClampedArray]> = [
    ['BEFORE: V7.3 WOODLAND HUB (SMOOTH NOISE FLOOR)', v73Hub.pixels],
    ['AFTER: V8.0 LIVING WORLD HUB (GRASS BLADES + ROOT INTEGRATION + SUNBEAMS)', renderedMap['v80_04_hub_afternoon_640x360.png']],
    ['BEFORE: V7.3 SUNLIT CLEARING (FLAT GREEN + NO LIGHT SHAFTS)', v73Clear.pixels],
    ['AFTER: V8.0 LIVING WORLD CLEARING (REAL MEADOW + SUNBEAMS + BUTTERFLIES)', renderedMap['v80_06_clearing_afternoon_640x360.png']],
  ];
  compPanels.forEach(([label, pix], idx) => {
    const ox = PAD + (idx % 2) * (V73_VIEW_W + PAD);
    const oy = PAD + Math.floor(idx / 2) * (V73_VIEW_H + HDR + PAD);
    drawText3x5(comp, CW, CH, label, ox + 2, oy + 5, idx % 2 === 1 ? hexToRgb('#ffe573') : hexToRgb('#9cc9c4'));
    blitV4(comp, CW, CH, pix, V73_VIEW_W, V73_VIEW_H, ox, oy + HDR);
  });
  writePng(path.join(PROOFS_DIR, 'v80_01_before_after_V73_vs_V80_1x.png'), comp, CW, CH);

  // 5. Build 3x Nearest-Neighbor Close-Up Inspection Sheet (Ground Grass Blades + Root Embedding + Clearing!)
  console.log('[5/8] Composing 3x close-up craftsmanship audit sheet (grass blades, roots, flowers, boulders)...');
  const zCropW = 140, zCropH = 100, Z = 3;
  const zw = PAD * 4 + zCropW * Z * 3;
  const zh = PAD * 2 + HDR + zCropH * Z;
  const zoomSheet = createEmptyBuffer(zw, zh);
  for (let i = 0; i < zw * zh; i++) {
    zoomSheet[i * 4] = bg.r; zoomSheet[i * 4 + 1] = bg.g; zoomSheet[i * 4 + 2] = bg.b; zoomSheet[i * 4 + 3] = 255;
  }
  const hubPix = renderedMap['v80_04_hub_afternoon_640x360.png'];
  const archPix = renderedMap['v80_05_root_arch_afternoon_640x360.png'];
  const clrPix = renderedMap['v80_06_clearing_afternoon_640x360.png'];
  const zoomPanels: Array<[string, RgbaImage]> = [
    ['3X ZOOM: GIANT TRUNK ROOTS + LIVING GRASS + MUSHROOMS', cropAndScaleNearest(hubPix, V73_VIEW_W, 290, 96, zCropW, zCropH, Z)],
    ['3X ZOOM: EXPOSED ROOT ARCH + ROOT-FERNS + WILDFLOWERS', cropAndScaleNearest(archPix, V73_VIEW_W, 240, 128, zCropW, zCropH, Z)],
    ['3X ZOOM: SUNLIT MEADOW GRASS + CHIMES + REFLECTIVE POOL', cropAndScaleNearest(clrPix, V73_VIEW_W, 260, 124, zCropW, zCropH, Z)],
  ];
  zoomPanels.forEach(([label, zImg], idx) => {
    const ox = PAD + idx * (zCropW * Z + PAD);
    drawText3x5(zoomSheet, zw, zh, label, ox + 2, PAD + 5, hexToRgb('#ffe573'));
    blitV4(zoomSheet, zw, zh, zImg.pixels, zImg.width, zImg.height, ox, PAD + HDR);
  });
  writePng(path.join(PROOFS_DIR, 'v80_02_ground_and_root_integration_zoom_3x.png'), zoomSheet, zw, zh);

  // 6. Build 3 Cinematic Lighting Moods Triptych (Afternoon | Misty Rose-Gold Dawn | Shaded Twilight Biolum!)
  console.log('[6/8] Composing 3 Cinematic Lighting Moods triptych (Afternoon / Misty Dawn / Shaded Forest)...');
  const cCam = snapCam(1618, 824);
  const moods: Array<[V80LightingMood, string]> = [
    ['afternoon', 'MOOD 1: GOLDEN AFTERNOON GLADE (WARM SHAFTS + COOL SHADE)'],
    ['dawn', 'MOOD 2: MISTY ROSE-GOLD DAWN (MORNING MIST + DEW SPARKLES)'],
    ['shaded_forest', 'MOOD 3: SHADED TWILIGHT FOREST (LOCALIZED BIOLUMINESCENCE)'],
  ];
  const TW = PAD * 2 + V73_VIEW_W;
  const TH = PAD * 4 + HDR * 3 + V73_VIEW_H * 3;
  const trip = createEmptyBuffer(TW, TH);
  for (let i = 0; i < TW * TH; i++) {
    trip[i * 4] = bg.r; trip[i * 4 + 1] = bg.g; trip[i * 4 + 2] = bg.b; trip[i * 4 + 3] = 255;
  }
  moods.forEach(([mKey, mLabel], idx) => {
    const fr = renderV80LivingWorldFrame({
      state, sprites, charAtlas,
      playerX: 1618, playerY: 824, playerDir: 'east', playerAnim: 'idle', playerFrameIdx: 0,
      camX: cCam.cx, camY: cCam.cy, timeSec: 2.8, mood: mKey,
    });
    const oy = PAD + idx * (V73_VIEW_H + HDR + PAD);
    drawText3x5(trip, TW, TH, mLabel, PAD + 2, oy + 5, hexToRgb('#ffe573'));
    blitV4(trip, TW, TH, fr.pixels, V73_VIEW_W, V73_VIEW_H, PAD, oy + HDR);
  });
  writePng(path.join(PROOFS_DIR, 'v80_03_lighting_3_moods_triptych_1x.png'), trip, TW, TH);

  // 7. PASS E: Record TWO Live Animated Playable Proofs!
  //    (A) Still Breathing World GIF (standing completely still while nature breathes & wind waves pass!)
  //    (B) Live Walking Exploration GIF (grass bending & springing back under footsteps + wind gust + leaf shower!)
  console.log('[7/8] PASS E: Recording Living-Still-World GIF & Live-Walking-Grass-Bend Exploration GIF...');
  const tmpStill = '/tmp/v80_still_frames';
  fs.rmSync(tmpStill, { recursive: true, force: true });
  fs.mkdirSync(tmpStill, { recursive: true });
  const stillFiles: string[] = [];
  for (let k = 0; k < 48; k++) {
    const t = k * 0.14;
    // Gentle calm start -> building wind gust wave across grass around frames 18..34 -> calm return!
    const gust = k >= 16 && k <= 34 ? Math.sin(((k - 16) / 18) * Math.PI) * 0.9 : 0;
    const fr = renderV80LivingWorldFrame({
      state, sprites, charAtlas,
      playerX: 1618, playerY: 824, playerDir: 'east', playerAnim: 'idle', playerFrameIdx: Math.floor(t * 5) % 8,
      camX: cCam.cx, camY: cCam.cy, timeSec: t, mood: 'afternoon', forcedGust: gust,
    });
    const fp = path.join(tmpStill, `s_${String(k).padStart(3, '0')}.png`);
    writePng(fp, fr.pixels, V73_VIEW_W, V73_VIEW_H);
    stillFiles.push(fp);
  }
  execFileSync('convert', ['-delay', '10', '-loop', '0', ...stillFiles, '-layers', 'Optimize', path.join(PROOFS_DIR, 'v80_10_living_world_still_breathing_640x360.gif')], {
    stdio: 'inherit',
  });

  // Live Walking Exploration GIF proving grass bending under boots + springing back + wind gust + multi-biome transitions!
  const tmpWalk = '/tmp/v80_walk_frames';
  fs.rmSync(tmpWalk, { recursive: true, force: true });
  fs.mkdirSync(tmpWalk, { recursive: true });
  const walkTour: Array<{ x: number; y: number; run?: boolean }> = [
    { x: 1018, y: 836 },
    { x: 1184, y: 828 },
    { x: 1172, y: 726 },
    { x: 1118, y: 548, run: true },
    { x: 1118, y: 446 }, // Straight through Exposed Root Arch!
    { x: 1580, y: 506, run: true }, // Waystone Glade!
    { x: 1618, y: 818, run: true }, // Broad Sunlit Clearing!
    { x: 1712, y: 874 }, // Wading through reflective pool + tall meadow grass!
  ];
  let px = walkTour[0].x, py = walkTour[0].y;
  let camX = Math.max(baseWorld.camBounds.minX, Math.min(baseWorld.camBounds.maxX, px - V73_VIEW_W / 2));
  let camY = Math.max(baseWorld.camBounds.minY, Math.min(baseWorld.camBounds.maxY, py - V73_VIEW_H / 2 - 18));
  let dir: V73CardinalDir = 'east';
  let animAcc = 0;
  let tSim = 0;
  const DT = 0.11;
  const bendMap = new Map<string, V80GrassBendRecord>();
  const walkFrames: Array<{
    px: number; py: number; cx: number; cy: number; dir: V73CardinalDir; anim: V73AnimState; fIdx: number; t: number;
    bends: Map<string, V80GrassBendRecord>;
  }> = [];

  for (let wp = 1; wp < walkTour.length; wp++) {
    const tgt = walkTour[wp];
    const isRun = !!tgt.run;
    for (let g = 0; g < 110; g++) {
      const vx = tgt.x - px, vy = tgt.y - py, dist = Math.hypot(vx, vy);
      if (dist < 14) break;
      const nx = vx / dist, ny = vy / dist;
      const sp = isRun ? V73_RUN_SPEED : V73_WALK_SPEED;
      const step = evaluateV73Movement(baseWorld, px, py, nx * sp * DT, ny * sp * DT);
      px = step.x; py = step.y;
      if (Math.abs(nx) >= Math.abs(ny)) dir = nx >= 0 ? 'east' : 'west';
      else dir = ny >= 0 ? 'south' : 'north';

      const anim: V73AnimState = step.blocked ? 'idle' : isRun ? 'running' : 'walking';
      updateV80GrassFootsteps(tufts, bendMap, px, py, !step.blocked, DT);
      animAcc += DT * (anim === 'running' ? 12.5 : anim === 'walking' ? 9.5 : 5.0);
      tSim += DT;

      const tcx = Math.max(baseWorld.camBounds.minX, Math.min(baseWorld.camBounds.maxX, px - V73_VIEW_W / 2));
      const tcy = Math.max(baseWorld.camBounds.minY, Math.min(baseWorld.camBounds.maxY, py - V73_VIEW_H / 2 - 18));
      camX += (tcx - camX) * 0.24;
      camY += (tcy - camY) * 0.24;

      const snapBends = new Map<string, V80GrassBendRecord>();
      for (const [bk, bv] of bendMap.entries()) snapBends.set(bk, { ...bv });
      walkFrames.push({ px, py, cx: camX, cy: camY, dir, anim, fIdx: Math.floor(animAcc) % 8, t: tSim, bends: snapBends });
      if (step.blocked) break;
    }
  }

  const WALK_GIF_COUNT = 88;
  const walkFiles: string[] = [];
  let totalBentInstances = 0;
  let peakVisibleTufts = 0;
  for (let k = 0; k < WALK_GIF_COUNT; k++) {
    const idx = Math.min(walkFrames.length - 1, Math.round((k / (WALK_GIF_COUNT - 1)) * (walkFrames.length - 1)));
    const wf = walkFrames[idx];
    const gust = k >= 50 && k <= 68 ? Math.sin(((k - 50) / 18) * Math.PI) * 0.85 : 0;
    const fr = renderV80LivingWorldFrame({
      state, sprites, charAtlas,
      playerX: wf.px, playerY: wf.py, playerDir: wf.dir, playerAnim: wf.anim, playerFrameIdx: wf.fIdx,
      camX: wf.cx, camY: wf.cy, timeSec: wf.t, mood: 'afternoon', forcedGust: gust, grassBends: wf.bends,
    });
    totalBentInstances += fr.bentTufts;
    if (fr.drawnLivingTufts > peakVisibleTufts) peakVisibleTufts = fr.drawnLivingTufts;
    const fp = path.join(tmpWalk, `w_${String(k).padStart(3, '0')}.png`);
    writePng(fp, fr.pixels, V73_VIEW_W, V73_VIEW_H);
    walkFiles.push(fp);
  }
  execFileSync('convert', ['-delay', '10', '-loop', '0', ...walkFiles, '-layers', 'Optimize', path.join(PROOFS_DIR, 'v80_11_living_world_walking_grass_bend_640x360.gif')], {
    stdio: 'inherit',
  });
  console.log(`   Living exploration GIF recorded: ${WALK_GIF_COUNT} frames | peak visible culled tufts=${peakVisibleTufts} | footstep-bent tuft frames=${totalBentInstances}`);

  // 8. Export REAL Standalone Godot 4.7.2 Project & Supplementary Browser Interactive Preview!
  console.log('[8/8] Exporting standalone Godot 4.7.2 V8.0 Living World project & supplementary interactive preview...');
  const godotStats = exportV80StandaloneGodotProject({
    godotProjectDir: GODOT_PROJ_DIR,
    sourceSpritesDir: SPRITES_DIR,
    state,
    sprites,
  });
  console.log(
    `   Godot 4.7.2 V8.0 scene wired: ${godotStats.extResourceCount} ExtResources | ${godotStats.subResourceCount} SubResources | ` +
    `${godotStats.spriteNodeCount} Sprite2Ds | ${godotStats.solidBodyCount} StaticBody2Ds (${godotStats.solidPolygonCount} exact CollisionPolygon2Ds) | ` +
    `${godotStats.areaZoneCount} Area2Ds | ${godotStats.livingTuftCount} living grass tufts (144 pooled culled) | ${godotStats.critterCount} critters | ${godotStats.totalCpuParticles} CPUParticles2D`
  );

  emitSupplementaryWebPreview(state, sprites);
  console.log('=== VERDANT SIGNAL V8.0 LIVING WORLD BUILD COMPLETE ===');
}

function emitSupplementaryWebPreview(state: V80WorldState, sprites: Record<string, RgbaImage>): void {
  const m = state.baseWorld;
  const manifest = {
    version: 'V8.0',
    viewW: V73_VIEW_W,
    viewH: V73_VIEW_H,
    worldW: m.worldW,
    worldH: m.worldH,
    camBounds: m.camBounds,
    walkBounds: m.walkBounds,
    pools: m.pools,
    presets: m.presets,
    spriteSizes: Object.fromEntries(Object.entries(sprites).map(([k, v]) => [k, { w: v.width, h: v.height }])),
    props: m.props,
    colliders: m.colliders,
    tufts: state.tufts.map((t) => ({
      id: t.id,
      x: t.x,
      y: t.y,
      row: V80_TUFT_SPECIES_LIST.indexOf(t.species),
      phase: Number(t.phase.toFixed(3)),
      sens: Number(t.windSensitivity.toFixed(2)),
    })),
    critters: state.critters,
  };
  fs.writeFileSync(path.join(PLAYABLE_DIR, 'v80_living_manifest.json'), JSON.stringify(manifest));

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VERDANT SIGNAL V8.0 — Living World Forest Preview (640x360 Native)</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100vh; background: #061010; color: #e2f5f1;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 10px; gap: 7px;
    }
    .bar { display: flex; flex-wrap: wrap; gap: 5px; justify-content: center; max-width: 1280px; font-size: 11px; align-items: center; }
    button {
      background: #0f2928; color: #baf7ef; border: 1px solid #2b6b66;
      padding: 4px 8px; cursor: pointer; font-family: inherit; font-size: 11px; border-radius: 4px;
    }
    button:hover { background: #18423f; }
    button.active { background: #266b63; color: #fff; border-color: #ffe573; }
    .stage { border: 2px solid #264d4a; background: #040b0b; line-height: 0; box-shadow: 0 12px 36px rgba(0,0,0,0.75); }
    canvas { display: block; image-rendering: pixelated; image-rendering: crisp-edges; }
    .hud { font-size: 11px; color: #9ec9c4; text-align: center; max-width: 1240px; line-height: 1.45; }
  </style>
</head>
<body>
  <div class="bar">
    <strong>VERDANT SIGNAL V8.0 — LIVING WORLD PREVIEW (SUPPLEMENTARY — NOT GODOT RUNTIME PROOF)</strong>
    <button id="b1">1: Hub</button>
    <button id="b2">2: NW Grove</button>
    <button id="b3">3: Root Arch</button>
    <button id="b4">4: Waystone</button>
    <button id="b5">5: Clearing</button>
    <button id="b6">6: Wet Pools</button>
    <button id="b7">7: Rocks</button>
    <button id="b8">8: Fallen Log</button>
    <button id="btnMood" class="active">F5: Afternoon</button>
    <button id="btnGust">F6: Wind Gust</button>
    <button id="btnDbg">F3: ColDebug</button>
    <button id="btn1x">1x</button>
    <button id="btn2x" class="active">2x</button>
  </div>
  <div class="stage">
    <canvas id="game" width="640" height="360" style="width:1280px;height:720px;"></canvas>
  </div>
  <div class="hud" id="status">
    WASD / Arrows (8-dir normalized) · Shift: Run · F5: Mood (Afternoon/Dawn/Shaded) · F6: Wind Gust · F3: Collision-Debug · Real Godot 4.7.2 project in ../godot_project/
  </div>
  <script>
    (async () => {
      const m = await (await fetch('./v80_living_manifest.json')).json();
      const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
      const floorImg = await loadImg('../sprites/v80_living_floor_2304x1536.png');
      const tuftImg = await loadImg('../sprites/living_grass_tufts_24x24_6x8.png');
      const critterImg = await loadImg('../sprites/living_critters_12x12_4x3.png');
      const beamsImg = await loadImg('../godot_project/sprites/sunbeams_1152x768.png');
      const bioHaloImg = await loadImg('../godot_project/sprites/biolum_halo_64x64.png');
      const charTex = {
        idle: await loadImg('../sprites/char_idle_88x88_8x4.png'),
        walking: await loadImg('../sprites/char_walking_88x88_8x4.png'),
        running: await loadImg('../sprites/char_running_88x88_8x4.png'),
      };
      const sprites = {};
      for (const k of Object.keys(m.spriteSizes)) sprites[k] = await loadImg('../sprites/' + k + '.png');

      const canvas = document.getElementById('game');
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const statusEl = document.getElementById('status');

      let px = m.presets.hub_center.playerX, py = m.presets.hub_center.playerY;
      let camX = Math.max(m.camBounds.minX, Math.min(m.camBounds.maxX, px - 320));
      let camY = Math.max(m.camBounds.minY, Math.min(m.camBounds.maxY, py - 198));
      let dirRow = 2, anim = 'idle', animAcc = 0, debugCol = false, moodIdx = 0, manualGust = 0;
      const moodNames = ['Afternoon', 'Misty Dawn', 'Shaded Forest'];
      const keys = new Set();
      const bends = new Map();

      const presetKeys = ['hub_center','dense_nw','root_arch','waystone_ne','clearing_e','wet_pools_s','mossy_rocks_sw','fallen_log_w'];
      const jump = (k) => {
        const p = m.presets[k]; px = p.playerX; py = p.playerY;
        dirRow = { south: 0, north: 1, east: 2, west: 3 }[p.dir];
        camX = Math.max(m.camBounds.minX, Math.min(m.camBounds.maxX, px - 320));
        camY = Math.max(m.camBounds.minY, Math.min(m.camBounds.maxY, py - 198));
      };
      presetKeys.forEach((pk, idx) => document.getElementById('b' + (idx + 1)).onclick = () => jump(pk));
      document.getElementById('btnDbg').onclick = () => { debugCol = !debugCol; document.getElementById('btnDbg').classList.toggle('active', debugCol); };
      document.getElementById('btnMood').onclick = () => { moodIdx = (moodIdx + 1) % 3; document.getElementById('btnMood').textContent = 'F5: ' + moodNames[moodIdx]; };
      document.getElementById('btnGust').onclick = () => { manualGust = 3.0; };
      document.getElementById('btn1x').onclick = () => { canvas.style.width = '640px'; canvas.style.height = '360px'; document.getElementById('btn1x').classList.add('active'); document.getElementById('btn2x').classList.remove('active'); };
      document.getElementById('btn2x').onclick = () => { canvas.style.width = '1280px'; canvas.style.height = '720px'; document.getElementById('btn2x').classList.add('active'); document.getElementById('btn1x').classList.remove('active'); };

      window.addEventListener('keydown', (e) => {
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','F3','F5','F6'].includes(e.key)) e.preventDefault();
        if (e.key === 'F3') { document.getElementById('btnDbg').click(); return; }
        if (e.key === 'F5') { document.getElementById('btnMood').click(); return; }
        if (e.key === 'F6') { manualGust = 3.0; return; }
        if (e.key >= '1' && e.key <= '8') { jump(presetKeys[Number(e.key) - 1]); return; }
        keys.add(e.key.toLowerCase());
      });
      window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

      const ptInPoly = (x, y, pts) => {
        let sign = 0;
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i], b = pts[(i + 1) % pts.length];
          const c = (b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x);
          if (Math.abs(c) < 1e-6) continue;
          const s = c > 0 ? 1 : -1;
          if (!sign) sign = s; else if (sign !== s) return false;
        }
        return true;
      };
      const distSeg = (x, y, ax, ay, bx, by) => {
        const dx = bx - ax, dy = by - ay, l2 = dx*dx + dy*dy;
        if (l2 < 1e-6) return Math.hypot(x - ax, y - ay);
        const t = Math.max(0, Math.min(1, ((x - ax)*dx + (y - ay)*dy) / l2));
        return Math.hypot(x - (ax + t*dx), y - (ay + t*dy));
      };
      const hitsPoly = (cx, cy, rx, ry, pts) => {
        const sy = rx / ry, scy = cy * sy;
        const sp = pts.map(p => ({ x: p.x, y: p.y * sy }));
        if (ptInPoly(cx, scy, sp)) return true;
        for (let i = 0; i < sp.length; i++) if (distSeg(cx, scy, sp[i].x, sp[i].y, sp[(i + 1) % sp.length].x, sp[(i + 1) % sp.length].y) < rx) return true;
        return false;
      };
      const isSolid = (r) => ['solid_trunk','solid_root','solid_rock','solid_log','solid_thicket'].includes(r);
      const blockedAt = (x, y) => {
        if (x < m.walkBounds.minX || x > m.walkBounds.maxX || y < m.walkBounds.minY || y > m.walkBounds.maxY) return true;
        for (const c of m.colliders) if (isSolid(c.role) && hitsPoly(x, y, 11, 6, c.points)) return true;
        return false;
      };
      const roleColors = { solid_trunk:'#ff4a4a', solid_root:'#ffa438', solid_rock:'#4cc3ff', solid_log:'#ff7a40', solid_thicket:'#d86cff', slow_thicket:'#b8ff4a', walkable_arch:'#38f2ff' };

      let last = performance.now(), start = last;
      function tick(now) {
        const dt = Math.min(0.05, (now - last) / 1000);
        const tSec = (now - start) / 1000;
        last = now;
        if (manualGust > 0) manualGust = Math.max(0, manualGust - dt);
        const gustWave = Math.max(0, Math.sin(tSec * 0.44 - 0.8));
        const gust = Math.max(manualGust / 3.0, Math.pow(gustWave, 4));

        for (const [k, v] of bends.entries()) { v.timer -= dt; if (v.timer <= 0) bends.delete(k); }

        let vx = 0, vy = 0;
        if (keys.has('a') || keys.has('arrowleft')) vx -= 1;
        if (keys.has('d') || keys.has('arrowright')) vx += 1;
        if (keys.has('w') || keys.has('arrowup')) vy -= 1;
        if (keys.has('s') || keys.has('arrowdown')) vy += 1;

        let terrainMul = 1.0;
        for (const c of m.colliders) if (c.role === 'slow_thicket' && hitsPoly(px, py, 11, 6, c.points)) terrainMul = 0.78;
        for (const p of m.pools) if (Math.hypot((px - p.x)/p.rx, (py - p.y)/p.ry) < 0.92) terrainMul = Math.min(terrainMul, 0.90);

        const wantsRun = keys.has('shift');
        let moving = false;
        if (vx || vy) {
          const len = Math.hypot(vx, vy), nx = vx / len, ny = vy / len;
          const sp = (wantsRun ? 128 : 84) * terrainMul;
          const ox = px, oy = py;
          if (!blockedAt(px + nx * sp * dt, py + ny * sp * dt)) { px += nx * sp * dt; py += ny * sp * dt; }
          else {
            if (!blockedAt(px + nx * sp * dt, py)) px += nx * sp * dt;
            if (!blockedAt(px, py + ny * sp * dt)) py += ny * sp * dt;
          }
          if (Math.abs(nx) > Math.abs(ny) * 1.12) dirRow = nx > 0 ? 2 : 3;
          else if (Math.abs(ny) > Math.abs(nx) * 1.12) dirRow = ny > 0 ? 0 : 1;
          const actualSp = Math.hypot(px - ox, py - oy) / Math.max(dt, 0.0001);
          moving = actualSp >= 8;
          anim = !moving ? 'idle' : (wantsRun && actualSp > 94 ? 'running' : 'walking');
        } else { anim = 'idle'; }
        animAcc += dt * (anim === 'running' ? 12.5 : anim === 'walking' ? 9.5 : 5.0);
        const fCol = Math.floor(animAcc) % 8;

        const tcx = Math.max(m.camBounds.minX, Math.min(m.camBounds.maxX, px - 320));
        const tcy = Math.max(m.camBounds.minY, Math.min(m.camBounds.maxY, py - 198));
        camX += (tcx - camX) * Math.min(1, dt * 7);
        camY += (tcy - camY) * Math.min(1, dt * 7);
        const ix = Math.round(camX), iy = Math.round(camY);

        ctx.drawImage(floorImg, ix, iy, 640, 360, 0, 0, 640, 360);

        // Water ripples & droplets
        ctx.strokeStyle = 'rgba(226,252,255,0.65)';
        for (let pi = 0; pi < m.pools.length; pi++) {
          const p = m.pools[pi];
          const cyc = ((tSec / p.ripplePeriod) + p.ripplePhase) % 1;
          if (cyc >= 0.14 && cyc < 0.70) {
            const u = (cyc - 0.14) / 0.56;
            ctx.beginPath(); ctx.ellipse(Math.round(p.x - ix), Math.round(p.y - iy), 2 + u * 13, 1 + u * 5, 0, 0, Math.PI * 2); ctx.stroke();
          }
        }

        // Y-sorted props + live frustum-culled animated grass tufts + explorer
        const ys = [];
        for (const p of m.props) {
          if (p.layer !== 'ysort' && p.layer !== 'overhead_arch') continue;
          const img = sprites[p.spriteKey];
          const dx = Math.round(p.x - ix - img.width / 2), dy = Math.round(p.y - iy - img.height);
          if (dx + img.width < -16 || dx > 656 || dy + img.height < -16 || dy > 376) continue;
          ys.push({ kind: 'prop', y: p.y + (p.sortOffsetY || 0), p, img, dx, dy });
        }
        let visTufts = 0;
        for (const t of m.tufts) {
          if (t.x < ix - 24 || t.x > ix + 664 || t.y < iy - 24 || t.y > iy + 384) continue;
          if (moving && Math.abs(t.x - px) < 22 && Math.abs(t.y - py) < 15 && Math.hypot(t.x - px, (t.y - py) * 1.35) < 21) {
            bends.set(t.id, { timer: 0.48, side: t.x >= px ? 1 : -1 });
          }
          ys.push({ kind: 'tuft', y: t.y, t });
          visTufts++;
        }
        ys.push({ kind: 'player', y: py });
        ys.sort((a, b) => a.y - b.y);

        let pDrawn = false, occ = false;
        const cdx = Math.round(px - ix - 44), cdy = Math.round(py - iy - 75);
        for (const item of ys) {
          if (item.kind === 'player') {
            ctx.fillStyle = 'rgba(7,22,17,0.42)';
            ctx.beginPath(); ctx.ellipse(Math.round(px - ix), Math.round(py - iy), 13, 4, 0, 0, Math.PI * 2); ctx.fill();
            ctx.drawImage(charTex[anim], fCol * 88, dirRow * 88, 88, 88, cdx, cdy, 88, 88);
            pDrawn = true;
          } else if (item.kind === 'tuft') {
            const t = item.t;
            const b = bends.get(t.id);
            let tf = 0;
            if (b && b.timer > 0.14) tf = b.side < 0 ? 4 : 5;
            else {
              const tw = Math.sin(tSec * (1.35 + gust * 1.1) - t.x * 0.011 + t.y * 0.0038);
              const lw = (0.22 + tw * (0.46 + gust * 0.72) + gust * 0.48 + Math.sin(tSec * 1.2 + t.phase) * 0.28) * t.sens;
              tf = lw > 0.88 ? 2 : lw > 0.26 ? 1 : lw < -0.26 ? 3 : 0;
            }
            ctx.drawImage(tuftImg, tf * 24, t.row * 24, 24, 24, Math.round(t.x - ix - 12), Math.round(t.y - iy - 21), 24, 24);
          } else {
            ctx.drawImage(item.img, item.dx, item.dy);
            if (pDrawn && cdx + 62 > item.dx + 22 && cdx + 26 < item.dx + item.img.width - 22 && cdy + 74 > item.dy + 16 && cdy + 14 < item.dy + item.img.height) occ = true;
          }
        }
        for (const ln of ['canopy', 'perimeter_canopy']) {
          for (const p of m.props) {
            if (p.layer !== ln) continue;
            const img = sprites[p.spriteKey];
            const sw = Math.round(Math.sin(tSec * 0.7 + (p.swayPhase || 0)) * (1 + gust * 1.6));
            const dx = Math.round(p.x - ix - img.width / 2) + sw, dy = Math.round(p.y - iy - img.height / 2);
            if (dx + img.width < -16 || dx > 656 || dy + img.height < -16 || dy > 376) continue;
            ctx.drawImage(img, dx, dy);
            if (cdx + 62 > dx + 24 && cdx + 26 < dx + img.width - 24 && cdy + 74 > dy + 16 && cdy + 14 < dy + img.height - 16) occ = true;
          }
        }
        if (occ) { ctx.save(); ctx.globalAlpha = 0.44; ctx.drawImage(charTex[anim], fCol * 88, dirRow * 88, 88, 88, cdx, cdy, 88, 88); ctx.restore(); }

        // Mood atmospheric tint + additive painterly canopy sunbeams + localized bioluminescence!
        if (moodIdx === 1) { ctx.fillStyle = 'rgba(84,72,118,0.14)'; ctx.fillRect(0, 0, 640, 360); }
        else if (moodIdx === 2) { ctx.fillStyle = 'rgba(10,24,48,0.34)'; ctx.fillRect(0, 0, 640, 360); }

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const cloud = 0.82 + 0.18 * Math.sin(tSec * 0.28);
        ctx.globalAlpha = (moodIdx === 0 ? 0.38 : moodIdx === 1 ? 0.44 : 0.14) * cloud;
        ctx.drawImage(beamsImg, ix / 2, iy / 2, 320, 180, 0, 0, 640, 360);
        ctx.globalAlpha = (moodIdx === 2 ? 0.75 : 0.42) * (0.78 + 0.22 * Math.sin(tSec * 1.45));
        for (const [bx, by, sc] of [[1694,424,1.5],[1712,746,1.3],[1054,814,0.8],[574,902,0.85]]) {
          ctx.drawImage(bioHaloImg, Math.round(bx - ix - 32 * sc), Math.round(by - iy - 32 * sc), 64 * sc, 64 * sc);
        }
        ctx.restore();

        // Living critters (butterflies & glowing twilight moths) + falling autumn leaves + golden dust motes
        for (const cr of m.critters) {
          const cx = cr.homeX + Math.cos(tSec * cr.speed + cr.phase) * cr.radiusX + Math.sin(tSec * 1.7 + cr.phase) * 9;
          const cy = cr.homeY + Math.sin(tSec * cr.speed * 1.3 + cr.phase) * cr.radiusY;
          const wf = Math.floor(tSec * 9.5 + cr.phase * 4) % 4;
          ctx.drawImage(critterImg, wf * 12, cr.kind * 12, 12, 12, Math.round(cx - ix - 6), Math.round(cy - iy - 6), 12, 12);
        }
        const lc = gust > 0.35 ? 22 : 12;
        ctx.fillStyle = '#d9843b';
        for (let i = 0; i < lc; i++) {
          const lx = Math.round(((i * 197 + tSec * (11 + gust * 26 + (i % 4) * 3)) % 720) - 40);
          const ly = Math.round(((i * 113 + tSec * (12 + (i % 3) * 3)) % 420) - 30);
          ctx.fillRect(lx, ly, 2, 1);
        }
        ctx.fillStyle = 'rgba(255,244,176,0.75)';
        for (let i = 0; i < 16; i++) {
          const dx = Math.round(((i * 97 + tSec * (5 + (i % 3) * 2)) % 640));
          const dy = Math.round(((i * 71 + Math.cos(tSec * 0.6 + i) * 14) % 360 + 360) % 360);
          ctx.fillRect(dx, dy, 1, 1);
        }

        if (debugCol) {
          for (const c of m.colliders) {
            ctx.save(); ctx.strokeStyle = roleColors[c.role] || '#fff'; ctx.fillStyle = (roleColors[c.role] || '#fff') + '35';
            if (!isSolid(c.role)) ctx.setLineDash([3, 3]);
            ctx.beginPath(); c.points.forEach((pt, idx) => idx === 0 ? ctx.moveTo(pt.x - ix, pt.y - iy) : ctx.lineTo(pt.x - ix, pt.y - iy));
            ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
          }
          ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(Math.round(px - ix), Math.round(py - iy), 11, 6, 0, 0, Math.PI * 2); ctx.stroke();
        }
        statusEl.textContent = 'V8.0 LIVING WORLD | Pos=(' + Math.round(px) + ',' + Math.round(py) + ') | Mood=' + moodNames[moodIdx] + ' | VisibleTufts=' + visTufts + ' | Gust=' + gust.toFixed(2) + ' | F5:Mood F6:Gust F3:ColDebug | Real Godot 4.7.2 in ../godot_project/';
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    })();
  </script>
</body>
</html>
`;
  fs.writeFileSync(path.join(PLAYABLE_DIR, 'index.html'), html);
  fs.writeFileSync(
    path.join(OUT_ROOT, 'index.html'),
    '<!doctype html><html><head><meta http-equiv="refresh" content="0; url=./playable_web/index.html" /></head><body><a href="./playable_web/index.html">Open V8.0 Living World Preview</a></body></html>\n'
  );
}

main();
