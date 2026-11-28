/**
 * VERDANT SIGNAL — V8.0 LIVING WORLD COMPOSITOR, LIGHTING & DYNAMIC NATURE ENGINE
 * ==============================================================================
 * Integrates:
 *   - Pass A/B: Handcrafted 2304x1536 detailed grass ecosystem + physical root embedding
 *   - Pass C:   Living frame-by-frame animated grass tufts responding to traveling wind
 *               waves, periodic wind gusts & real explorer footstep bend/spring-back
 *   - Pass D:   Magical painterly canopy light shafts, cloud-drift rhythm, warm-sun vs
 *               cool-shade lighting contrast, localized bioluminescence & 3 moods
 *               ('afternoon' | 'dawn' | 'shaded_forest')
 *   - Pass E:   Sunlit dust motes, drifting pollen/spores, silk seeds, falling leaves,
 *               branch water droplets splashing into puddles & fluttering butterflies/moths
 *   - V7.3 Preservation: Zero change to movement, multi-polygon collisions, camera clamping,
 *               or unmodified 88x88 supplied player character sprites!
 */

import { createEmptyBuffer, setPixel } from '../engine/pixelBuffer';
import { blitV4 } from '../v4_masterpiece/v4Core';
import { type RGB, hexToRgb } from '../v5_soul/v5PixelEngine';
import { type RgbaImage } from '../v7_immersive/v7WorldEngine';
import {
  V73_CHAR_COL_RX,
  V73_CHAR_COL_RY,
  V73_CHAR_FOOT_X,
  V73_CHAR_FOOT_Y,
  V73_VIEW_H,
  V73_VIEW_W,
  type V73AnimState,
  type V73CardinalDir,
  type V73CharacterAtlas,
  type V73ColliderRole,
  type V73OpenWorldDef,
  type V73PropLayer,
  type V73PropPlacement,
  type Vec2,
  isSolidCollider,
} from '../v73_open_world/v73OpenWorldEngine';
import {
  V80_TUFT_CELL,
  type V80CritterSpec,
  type V80GroundBuildResult,
  type V80LivingAtlas,
  type V80LivingTuft,
} from './v80LivingGroundArt';

export type V80LightingMood = 'afternoon' | 'dawn' | 'shaded_forest';

export interface V80SunbeamSpec {
  id: string;
  topX: number;
  topY: number;
  width: number;
  length: number;
  strength: number;
  phase: number;
}

export interface V80WorldState {
  baseWorld: V73OpenWorldDef;
  ground: V80GroundBuildResult;
  livingAtlas: V80LivingAtlas;
  tufts: V80LivingTuft[];
  critters: V80CritterSpec[];
  sunbeams: V80SunbeamSpec[];
}

export interface V80GrassBendRecord {
  timer: number; // > 0 while compressed by footsteps (springs back over 0.45s)
  side: -1 | 1;  // -1 bends left, +1 bends right
}

export function getV80Sunbeams(): V80SunbeamSpec[] {
  return [
    // Broad Sunlit Clearing (East) — dramatic pair of warm golden cathedral shafts!
    { id: 'beam_clear_a', topX: 1556, topY: 590, width: 78, length: 340, strength: 1.0, phase: 0.2 },
    { id: 'beam_clear_b', topX: 1692, topY: 604, width: 62, length: 310, strength: 0.86, phase: 1.5 },
    // Central Woodland Hub — warm opening beside colossal Moss Pillar Titan!
    { id: 'beam_hub_a', topX: 988, topY: 596, width: 66, length: 310, strength: 0.78, phase: 0.9 },
    // Exposed Root Arch Hollow (North) — slanting right through the gnarled root arch!
    { id: 'beam_arch_a', topX: 1068, topY: 282, width: 64, length: 286, strength: 0.84, phase: 2.3 },
    // Ancient Waystone Glade (Northeast) — spotlighting the carved spiral monolith!
    { id: 'beam_waystone', topX: 1632, topY: 294, width: 68, length: 296, strength: 0.92, phase: 3.1 },
    // Wet Basin & Pools (South) — glinting across shallow sky-reflecting pools!
    { id: 'beam_pools', topX: 1126, topY: 842, width: 70, length: 294, strength: 0.82, phase: 4.0 },
    // Fallen Hollow Log Glade (West) — illuminating shelf fungi & mossy bark!
    { id: 'beam_log', topX: 596, topY: 718, width: 62, length: 296, strength: 0.74, phase: 1.8 },
  ];
}

/**
 * Traveling organic wind wave + periodic gust rhythm (calm breath -> gust wave -> calm).
 * Returns local wind strength in [-0.6, +1.55] and active macro gust factor in [0, 1].
 */
export function sampleV80Wind(x: number, y: number, timeSec: number, forcedGust = 0): {
  localWind: number;
  gustStrength: number;
} {
  // Periodic gust envelope (~14s natural living breath — quiet periods + dramatic breeze moments!)
  const gustWave = Math.max(0, Math.sin(timeSec * 0.44 - 0.8));
  const periodicGust = Math.pow(gustWave, 4.0);
  const gustStrength = Math.max(forcedGust, periodicGust);

  // Traveling West-to-East macro wave sweeping naturally across grass patches
  const travelWave = Math.sin(timeSec * (1.35 + gustStrength * 1.1) - x * 0.011 + y * 0.0038);
  const microFlutter = Math.sin(timeSec * 2.1 + x * 0.047 + y * 0.031) * 0.24;
  const localWind = 0.22 + travelWave * (0.46 + gustStrength * 0.72) + gustStrength * 0.48 + microFlutter;
  return { localWind, gustStrength };
}

/**
 * Updates per-tuft footstep compression state as the player steps near living grass clusters.
 */
export function updateV80GrassFootsteps(
  tufts: V80LivingTuft[],
  bendMap: Map<string, V80GrassBendRecord>,
  playerX: number,
  playerY: number,
  isMoving: boolean,
  dt: number
): void {
  for (const [id, rec] of bendMap.entries()) {
    rec.timer -= dt;
    if (rec.timer <= 0) bendMap.delete(id);
  }
  if (!isMoving) return;
  for (const t of tufts) {
    const dx = t.x - playerX;
    const dy = t.y - playerY;
    if (Math.abs(dx) > 22 || Math.abs(dy) > 15) continue;
    const d = Math.hypot(dx, dy * 1.35);
    if (d < 21) {
      bendMap.set(t.id, { timer: 0.48, side: dx >= 0 ? 1 : -1 });
    }
  }
}

export function selectV80TuftFrameIndex(
  tuft: V80LivingTuft,
  timeSec: number,
  bend: V80GrassBendRecord | undefined,
  forcedGust = 0
): number {
  if (bend && bend.timer > 0.14) {
    return bend.side < 0 ? 4 : 5;
  }
  const { localWind } = sampleV80Wind(tuft.x, tuft.y, timeSec, forcedGust);
  const v = (localWind + Math.sin(timeSec * 1.2 + tuft.phase) * 0.28) * tuft.windSensitivity;
  if (v > 0.88) return 2; // strong gust bend right!
  if (v > 0.26) return 1; // gentle breeze right!
  if (v < -0.26) return 3; // soft recoil left!
  return 0; // upright rest
}

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const ROLE_DEBUG_RGB: Record<V73ColliderRole, RGB> = {
  solid_trunk: { r: 255, g: 74, b: 74 },
  solid_root: { r: 255, g: 164, b: 56 },
  solid_rock: { r: 76, g: 195, b: 255 },
  solid_log: { r: 255, g: 122, b: 64 },
  solid_thicket: { r: 216, g: 108, b: 255 },
  slow_thicket: { r: 184, g: 255, b: 74 },
  walkable_arch: { r: 56, g: 242, b: 255 },
};

function drawLinePx(buf: Uint8ClampedArray, w: number, h: number, x0: number, y0: number, x1: number, y1: number, col: RGB, dashed = false): void {
  const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= steps; i++) {
    if (dashed && (Math.floor(i / 3) & 1) === 1) continue;
    const x = Math.round(x0 + ((x1 - x0) * i) / steps);
    const y = Math.round(y0 + ((y1 - y0) * i) / steps);
    if (x >= 0 && x < w && y >= 0 && y < h) setPixel(buf, w, h, x, y, { ...col, a: 255 });
  }
}

function drawEllipsePx(buf: Uint8ClampedArray, w: number, h: number, cx: number, cy: number, rx: number, ry: number, col: RGB, alpha = 0.72): void {
  const segs = 28;
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    const x = Math.round(cx + Math.cos(a) * rx);
    const y = Math.round(cy + Math.sin(a) * ry);
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const oi = (y * w + x) * 4;
    buf[oi] = Math.round(buf[oi] * (1 - alpha) + col.r * alpha);
    buf[oi + 1] = Math.round(buf[oi + 1] * (1 - alpha) + col.g * alpha);
    buf[oi + 2] = Math.round(buf[oi + 2] * (1 - alpha) + col.b * alpha);
  }
}

function addLocalGlow(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  cx: number,
  cy: number,
  radius: number,
  col: RGB,
  strength: number
): void {
  const x0 = Math.max(0, Math.floor(cx - radius));
  const x1 = Math.min(w - 1, Math.ceil(cx + radius));
  const y0 = Math.max(0, Math.floor(cy - radius));
  const y1 = Math.min(h - 1, Math.ceil(cy + radius));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const d = Math.hypot(x - cx, (y - cy) * 1.25) / radius;
      if (d >= 1) continue;
      const bayer = (BAYER4[y & 3][x & 3] + 0.5) / 16;
      const fall = (1 - d) * (1 - d) * strength;
      if (fall * 1.5 < bayer * 0.25) continue;
      const oi = (y * w + x) * 4;
      buf[oi] = Math.min(255, Math.round(buf[oi] + col.r * fall));
      buf[oi + 1] = Math.min(255, Math.round(buf[oi + 1] + col.g * fall));
      buf[oi + 2] = Math.min(255, Math.round(buf[oi + 2] + col.b * fall));
    }
  }
}

export interface V80RenderOpts {
  state: V80WorldState;
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
  mood?: V80LightingMood;
  forcedGust?: number;
  grassBends?: Map<string, V80GrassBendRecord>;
  debugCollision?: boolean;
}

export function renderV80LivingWorldFrame(opts: V80RenderOpts): {
  pixels: Uint8ClampedArray;
  drawnProps: number;
  drawnLivingTufts: number;
  bentTufts: number;
  occludedPixels: number;
} {
  const {
    state, sprites, charAtlas,
    playerX, playerY, playerDir, playerAnim, playerFrameIdx,
    timeSec, mood = 'afternoon', forcedGust = 0, grassBends, debugCollision = false,
  } = opts;
  const world = state.baseWorld;
  const floor = state.ground.floor;
  const lightMap = state.ground.lightMap;
  const W = V73_VIEW_W;
  const H = V73_VIEW_H;
  const camX = Math.max(world.camBounds.minX, Math.min(world.camBounds.maxX, Math.round(opts.camX)));
  const camY = Math.max(world.camBounds.minY, Math.min(world.camBounds.maxY, Math.round(opts.camY)));

  const out = createEmptyBuffer(W, H);

  // 1. Copy revolutionary handcrafted 2304x1536 living forest floor viewport slice
  for (let y = 0; y < H; y++) {
    const srcOff = ((camY + y) * floor.width + camX) * 4;
    out.set(floor.pixels.subarray(srcOff, srcOff + W * 4), y * W * 4);
  }

  // 2. Animated Puddle Reflections: sky sparkles, falling branch droplets & expanding water ripples!
  const rippleCol = mood === 'dawn' ? hexToRgb('#ffe8d6') : hexToRgb('#e2fcff');
  const glintCol = mood === 'dawn' ? hexToRgb('#fff0c4') : hexToRgb('#f5fffc');
  for (let pi = 0; pi < world.pools.length; pi++) {
    const p = world.pools[pi];
    const sx = p.x - camX;
    const sy = p.y - camY;
    if (sx + p.rx < -16 || sx - p.rx > W + 16 || sy + p.ry < -16 || sy - p.ry > H + 16) continue;

    // Gentle sunlit water-surface shimmer glints
    for (let g = 0; g < 3; g++) {
      const gx = Math.round(sx + Math.sin(g * 2.1 + pi) * p.rx * 0.45);
      const gy = Math.round(sy + Math.cos(g * 1.7 + pi) * p.ry * 0.35);
      const pulse = Math.sin(timeSec * 2.3 + g * 2.4 + pi);
      if (pulse > 0.45 && gx > 1 && gx < W - 1 && gy > 1 && gy < H - 1) {
        setPixel(out, W, H, gx, gy, { ...glintCol, a: 255 });
        if (pulse > 0.78) setPixel(out, W, H, gx + 1, gy, { ...glintCol, a: 255 });
      }
    }

    // Periodic falling water droplet from canopy -> splash -> expanding concentric ripple ring!
    const cyc = ((timeSec / p.ripplePeriod) + p.ripplePhase) % 1;
    if (cyc < 0.14) {
      // Falling translucent raindrop streaking gently from overhanging branch down into pool!
      const dropU = cyc / 0.14;
      const dx = Math.round(sx + Math.sin(pi * 3.1) * p.rx * 0.25);
      const dy = Math.round(sy - (1 - dropU) * 52);
      if (dx >= 0 && dx < W && dy >= 1 && dy < H - 1) {
        setPixel(out, W, H, dx, dy - 1, { ...rippleCol, a: 255 });
        setPixel(out, W, H, dx, dy, { ...glintCol, a: 255 });
      }
    } else if (cyc < 0.70) {
      const u = (cyc - 0.14) / 0.56;
      const dx = sx + Math.sin(pi * 3.1) * p.rx * 0.25;
      drawEllipsePx(out, W, H, dx, sy, 2 + u * 13, 1 + u * 5, rippleCol, (1 - u) * 0.75);
      if (u > 0.18) {
        drawEllipsePx(out, W, H, dx, sy, 1 + (u - 0.18) * 9, 0.7 + (u - 0.18) * 3.4, rippleCol, (1 - u) * 0.45);
      }
    }

    // Live explorer footstep water ripple when wading across shallow pool
    if (Math.hypot((playerX - p.x) / p.rx, (playerY - p.y) / p.ry) < 0.94) {
      const fu = (timeSec * 1.45) % 1;
      drawEllipsePx(out, W, H, playerX - camX, playerY - camY, 4 + fu * 17, 2 + fu * 6.5, rippleCol, (1 - fu) * 0.8);
    }
  }

  // 3. Y-SORTED WORLD: Props + Live Animated Grass & Root-Interlacing Flora + Unmodified Astronaut!
  type SortItem =
    | { kind: 'prop'; sortY: number; prop: V73PropPlacement }
    | { kind: 'tuft'; sortY: number; tuft: V80LivingTuft }
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

  // Frustum-cull living animated grass & root-wrap flora (only ~45-70 visible per frame — Intel HD 3000 fast!)
  const visibleBioTufts: V80LivingTuft[] = [];
  let drawnLivingTufts = 0;
  let bentTufts = 0;
  for (const tuft of state.tufts) {
    const sx = tuft.x - camX;
    const sy = tuft.y - camY;
    if (sx < -V80_TUFT_CELL || sx > W + V80_TUFT_CELL || sy < -V80_TUFT_CELL || sy > H + V80_TUFT_CELL) continue;
    ySortList.push({ kind: 'tuft', sortY: tuft.y, tuft });
    if (tuft.species === 'biolum_blossom') visibleBioTufts.push(tuft);
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

  const pLight =
    lightMap[
      Math.max(0, Math.min(world.worldH - 1, Math.round(playerY))) * world.worldW +
        Math.max(0, Math.min(world.worldW - 1, Math.round(playerX)))
    ];
  const playerLightR = mood === 'dawn' ? (pLight > 0.6 ? 1.06 : 0.94) : mood === 'shaded_forest' ? 0.88 : pLight > 0.65 ? 1.05 : pLight < 0.25 ? 0.89 : 1.0;
  const playerLightG = mood === 'dawn' ? (pLight > 0.6 ? 1.01 : 0.94) : mood === 'shaded_forest' ? 0.92 : pLight > 0.65 ? 1.03 : pLight < 0.25 ? 0.93 : 1.0;
  const playerLightB = mood === 'dawn' ? 1.02 : mood === 'shaded_forest' ? 1.02 : pLight < 0.25 ? 0.97 : 0.99;

  for (const item of ySortList) {
    if (item.kind === 'player') {
      // Soft grounded boot contact shadow
      const psx = Math.round(playerX - camX);
      const psy = Math.round(playerY - camY);
      for (let sy = -4; sy <= 4; sy++) {
        for (let sx = -13; sx <= 13; sx++) {
          if ((sx * sx) / 169 + (sy * sy) / 16 <= 1.0) {
            const bx = psx + sx;
            const by = psy + sy;
            if (bx >= 0 && bx < W && by >= 0 && by < H) {
              const oi = (by * W + bx) * 4;
              out[oi] = Math.round(out[oi] * 0.56);
              out[oi + 1] = Math.round(out[oi + 1] * 0.62);
              out[oi + 2] = Math.round(out[oi + 2] * 0.64);
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
          out[oi] = Math.min(255, Math.round(charSprite.pixels[si] * playerLightR));
          out[oi + 1] = Math.min(255, Math.round(charSprite.pixels[si + 1] * playerLightG));
          out[oi + 2] = Math.min(255, Math.round(charSprite.pixels[si + 2] * playerLightB));
          out[oi + 3] = 255;
          playerMask[dy * W + dx] = 1;
        }
      }
      playerDrawn = true;
    } else if (item.kind === 'tuft') {
      const tuft = item.tuft;
      const bend = grassBends?.get(tuft.id);
      const fIdx = selectV80TuftFrameIndex(tuft, timeSec, bend, forcedGust);
      if (fIdx >= 4) bentTufts++;
      const img = state.livingAtlas.tuftFrames[tuft.species][fIdx];
      const dx = Math.round(tuft.x - camX - 12);
      const dy = Math.round(tuft.y - camY - 21);
      // Warm sunlit grass highlights vs cool shade adaptation per tuft location!
      const tLight = lightMap[Math.max(0, Math.min(world.worldH - 1, tuft.y)) * world.worldW + Math.max(0, Math.min(world.worldW - 1, tuft.x))];
      const shadeT = tuft.species === 'biolum_blossom' ? 1.0 : tLight < 0.28 ? 0.80 : tLight > 0.66 ? 1.07 : 0.96;
      for (let sy = 0; sy < img.height; sy++) {
        const oy = dy + sy;
        if (oy < 0 || oy >= H) continue;
        for (let sx = 0; sx < img.width; sx++) {
          const ox = dx + sx;
          if (ox < 0 || ox >= W) continue;
          const si = (sy * img.width + sx) * 4;
          if (img.pixels[si + 3] < 128) continue;
          const oi = (oy * W + ox) * 4;
          out[oi] = Math.min(255, Math.round(img.pixels[si] * shadeT));
          out[oi + 1] = Math.min(255, Math.round(img.pixels[si + 1] * (shadeT < 1 ? shadeT * 1.03 : shadeT)));
          out[oi + 2] = Math.min(255, Math.round(img.pixels[si + 2] * (shadeT < 1 ? shadeT * 1.12 : shadeT * 0.94)));
          out[oi + 3] = 255;
        }
      }
      drawnLivingTufts++;
    } else {
      const prop = item.prop;
      const img = sprites[prop.spriteKey];
      const { localWind, gustStrength } = sampleV80Wind(prop.x, prop.y, timeSec, forcedGust);
      // Subtle local rustle if the explorer walks right past a fern or undergrowth bush!
      const pDist = Math.hypot(playerX - prop.x, playerY - prop.y);
      const rustle = (prop.swayKind === 'fern' && pDist < 42) ? Math.sin(timeSec * 9.0) * 1.4 : 0;
      const sway =
        prop.swayKind === 'fern' || prop.swayKind === 'chime'
          ? Math.round(localWind * (prop.swayAmp ?? 1.1) * (1 + gustStrength * 0.65) + rustle)
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

  // 4. Overhead Canopy Crowns & Perimeter Roofs (desynchronized gust-responsive breeze!)
  for (const layerName of ['canopy', 'perimeter_canopy'] as V73PropLayer[]) {
    for (const prop of world.props) {
      if (prop.layer !== layerName) continue;
      const img = sprites[prop.spriteKey];
      const { localWind, gustStrength } = sampleV80Wind(prop.x, prop.y, timeSec, forcedGust);
      const sway = Math.round(
        (Math.sin(timeSec * (prop.swaySpeed ?? 0.62) + (prop.swayPhase ?? 0)) * 0.7 + localWind * 0.45) *
          (prop.swayAmp ?? 1.15) *
          (1 + gustStrength * 0.75)
      );
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

  // 5. Natural 2x2 Ordered-Dither Behind-Trunk/Canopy Readability Peek (ZERO neon cyan glow!)
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
      const blend = ((dx & 1) ^ (dy & 1)) === 0 ? 0.56 : 0.18;
      const si = (sy * charSprite.width + sx) * 4;
      const oi = idx * 4;
      out[oi] = Math.round(out[oi] * (1 - blend) + charSprite.pixels[si] * blend);
      out[oi + 1] = Math.round(out[oi + 1] * (1 - blend) + charSprite.pixels[si + 1] * blend);
      out[oi + 2] = Math.round(out[oi + 2] * (1 - blend) + charSprite.pixels[si + 2] * blend);
    }
  }

  // 6. PASS D: MAGICAL, CINEMATIC PAINTERLY LIGHTING & 3 DISTINCT ATMOSPHERIC MOODS!
  const cloudDrift = 0.84 + 0.16 * Math.sin(timeSec * 0.28 + camX * 0.002);
  if (mood === 'dawn') {
    // Dreamy Misty Rose-Gold Dawn: cool cerulean-lavender morning valley mist + warm apricot sunlit glades!
    for (let y = 0; y < H; y++) {
      const lmRow = (camY + y) * world.worldW + camX;
      const depthMist = 0.16 + 0.14 * (1 - y / H); // softer cool morning valley mist deeper into the forest!
      for (let x = 0; x < W; x++) {
        const l = lightMap[lmRow + x];
        const oi = (y * W + x) * 4;
        const r = out[oi], g = out[oi + 1], b = out[oi + 2];
        const mist = (1 - l * 0.72) * depthMist;
        const warm = Math.max(0, l - 0.42) * 0.36;
        out[oi] = Math.min(255, Math.round(r * (0.90 + warm) + 74 * mist + 48 * warm));
        out[oi + 1] = Math.min(255, Math.round(g * (0.86 + warm * 0.38) + 84 * mist + 18 * warm));
        out[oi + 2] = Math.min(255, Math.round(b * (1.02 - warm * 0.18) + 128 * mist + 8 * warm));
      }
    }
  } else if (mood === 'shaded_forest') {
    // Deep Twilight Emerald-Indigo Forest — showcases delicate localized alien bioluminescence!
    for (let y = 0; y < H; y++) {
      const lmRow = (camY + y) * world.worldW + camX;
      for (let x = 0; x < W; x++) {
        const l = lightMap[lmRow + x];
        const oi = (y * W + x) * 4;
        const dim = 0.56 + l * 0.20;
        out[oi] = Math.min(255, Math.round(out[oi] * dim * 0.76));
        out[oi + 1] = Math.min(255, Math.round(out[oi + 1] * dim * 0.94));
        out[oi + 2] = Math.min(255, Math.round(out[oi + 2] * dim * 1.22 + 12));
      }
    }
  } else {
    // Signature Golden Afternoon: crisp warm sunlit honey-gold grass vs deep cool blue-pine canopy shade!
    for (let y = 0; y < H; y++) {
      const lmRow = (camY + y) * world.worldW + camX;
      for (let x = 0; x < W; x++) {
        const l = lightMap[lmRow + x];
        const oi = (y * W + x) * 4;
        if (l > 0.52) {
          const wBoost = (l - 0.52) * 0.30 * cloudDrift;
          out[oi] = Math.min(255, Math.round(out[oi] * (1 + wBoost) + 18 * wBoost));
          out[oi + 1] = Math.min(255, Math.round(out[oi + 1] * (1 + wBoost * 0.74) + 8 * wBoost));
          out[oi + 2] = Math.max(0, Math.round(out[oi + 2] * (1 - wBoost * 0.24)));
        } else if (l < 0.32) {
          const cool = (0.32 - l) * 0.38;
          out[oi] = Math.max(0, Math.round(out[oi] * (1 - cool * 0.40)));
          out[oi + 1] = Math.max(0, Math.round(out[oi + 1] * (1 - cool * 0.14)));
          out[oi + 2] = Math.min(255, Math.round(out[oi + 2] * (1 + cool * 0.24) + 8 * cool));
        }
      }
    }
  }

  // 7. Soft Painterly Diagonal Volumetric-Style Canopy Sunbeams (Bayer 4x4 Pixel-Crisp!)
  const beamRgb =
    mood === 'dawn'
      ? { r: 255, g: 190, b: 144 }
      : mood === 'shaded_forest'
        ? { r: 162, g: 222, b: 226 }
        : { r: 255, g: 242, b: 166 };
  const moodBeamMul = mood === 'dawn' ? 0.34 : mood === 'shaded_forest' ? 0.09 : 0.27;

  for (const beam of state.sunbeams) {
    const swayShift = Math.sin(timeSec * 0.34 + beam.phase) * 8;
    const bx0 = beam.topX - camX + swayShift;
    const by0 = beam.topY - camY;
    // Quick visibility cull (beam slants ~28 deg down-right: dx = dy * 0.52)
    if (bx0 + beam.width + beam.length * 0.52 < -20 || bx0 - beam.width > W + 20) continue;
    if (by0 + beam.length < -20 || by0 > H + 20) continue;

    const beamPulse = (0.82 + 0.18 * Math.sin(timeSec * 0.45 + beam.phase)) * cloudDrift;
    const yStart = Math.max(0, Math.floor(by0));
    const yEnd = Math.min(H - 1, Math.ceil(by0 + beam.length));

    for (let y = yStart; y <= yEnd; y++) {
      const v = (y - by0) / beam.length; // 0 at top canopy gap -> 1 at mossy floor pool!
      const centerX = bx0 + (y - by0) * 0.52;
      const halfW = (beam.width * (0.48 + v * 0.72)) * 0.5;
      const xStart = Math.max(0, Math.floor(centerX - halfW));
      const xEnd = Math.min(W - 1, Math.ceil(centerX + halfW));
      const vertFade = Math.sin(Math.min(1, v) * Math.PI) * (0.65 + 0.35 * (1 - v));

      for (let x = xStart; x <= xEnd; x++) {
        const u = Math.abs(x - centerX) / Math.max(1, halfW);
        if (u >= 1) continue;
        // Soft internal ray-ribbons inside each sunbeam so it reads as delicate dappled shafts!
        const rib = 0.72 + 0.28 * Math.sin((x - centerX) * 0.22 + beam.phase);
        const a = (1 - u * u) * vertFade * rib * beam.strength * beamPulse * moodBeamMul;
        const bayer = (BAYER4[y & 3][x & 3] + 0.5) / 16;
        if (a < bayer * 0.04) continue;
        const oi = (y * W + x) * 4;
        out[oi] = Math.min(255, Math.round(out[oi] + beamRgb.r * a));
        out[oi + 1] = Math.min(255, Math.round(out[oi + 1] + beamRgb.g * a));
        out[oi + 2] = Math.min(255, Math.round(out[oi + 2] + beamRgb.b * a));
      }
    }
  }

  // 8. Restrained Localized Alien Bioluminescence (Chime-Reeds, Waystone Spiral & Dew-Blossoms!)
  const bioMul = mood === 'shaded_forest' ? 1.85 : mood === 'dawn' ? 1.05 : 0.78;
  const bioBreath = 0.76 + 0.24 * Math.sin(timeSec * 1.45);
  const landmarks: Array<{ x: number; y: number; r: number; col: RGB; s: number }> = [
    { x: 1712, y: 746, r: 54, col: { r: 74, g: 228, b: 218 }, s: 0.28 * bioMul * bioBreath },
    { x: 1694, y: 424, r: 62, col: { r: 86, g: 218, b: 232 }, s: 0.34 * bioMul * (0.78 + 0.22 * Math.cos(timeSec * 1.15)) },
    { x: 1694, y: 472, r: 36, col: { r: 248, g: 196, b: 92 }, s: 0.22 * bioMul },
  ];
  for (const lm of landmarks) {
    const lx = lm.x - camX;
    const ly = lm.y - camY;
    if (lx + lm.r >= 0 && lx - lm.r < W && ly + lm.r >= 0 && ly - lm.r < H) {
      addLocalGlow(out, W, H, lx, ly, lm.r, lm.col, lm.s);
    }
  }
  for (const bt of visibleBioTufts) {
    const pulse = 0.7 + 0.3 * Math.sin(timeSec * 1.8 + bt.phase);
    addLocalGlow(out, W, H, bt.x - camX, bt.y - camY - 9, 20, { r: 66, g: 222, b: 210 }, 0.18 * bioMul * pulse);
  }

  // 9. PASS E: LIVING ATMOSPHERE — Sunlit Dust Motes, Floating Seeds, Falling Leaves, Spores & Butterflies!
  const { gustStrength } = sampleV80Wind(camX + W / 2, camY + H / 2, timeSec, forcedGust);

  // 9a. Tiny sunlit golden pollen & dust motes floating inside illuminated air pockets
  const dustCol = mood === 'dawn' ? hexToRgb('#ffe6bd') : hexToRgb('#fff3ad');
  for (let i = 0; i < 24; i++) {
    const wx = camX + ((i * 97 + Math.round(timeSec * (5 + (i % 4) * 2) + Math.sin(timeSec * 0.7 + i) * 14)) % W + W) % W;
    const wy = camY + ((i * 71 + Math.round(Math.cos(timeSec * 0.55 + i * 1.3) * 18)) % H + H) % H;
    const l = lightMap[Math.max(0, Math.min(world.worldH - 1, wy)) * world.worldW + Math.max(0, Math.min(world.worldW - 1, wx))];
    if (l < 0.44 && mood !== 'shaded_forest') continue;
    const sx = wx - camX;
    const sy = wy - camY;
    if (sx >= 1 && sx < W - 1 && sy >= 1 && sy < H - 1) {
      const oi = (sy * W + sx) * 4;
      const a = 0.58 + 0.32 * Math.sin(timeSec * 2.2 + i);
      out[oi] = Math.min(255, Math.round(out[oi] * (1 - a) + dustCol.r * a));
      out[oi + 1] = Math.min(255, Math.round(out[oi + 1] * (1 - a) + dustCol.g * a));
      out[oi + 2] = Math.min(255, Math.round(out[oi + 2] * (1 - a) + dustCol.b * a));
    }
  }

  // 9b. Occasional floating pale silk seeds drifting gracefully across the breeze
  const seedCol = hexToRgb('#f0f9e8');
  for (let i = 0; i < 6; i++) {
    const sx = Math.round(((i * 143 + timeSec * (16 + gustStrength * 22 + (i % 3) * 4)) % (W + 60)) - 30);
    const sy = Math.round(((i * 89 + Math.sin(timeSec * 1.1 + i * 2.1) * 26 + timeSec * 4) % (H + 40)) - 20);
    if (sx >= 1 && sx < W - 1 && sy >= 1 && sy < H - 1) {
      setPixel(out, W, H, sx, sy, { ...seedCol, a: 255 });
      setPixel(out, W, H, sx - 1, sy - 1, { r: 205, g: 228, b: 205, a: 255 });
    }
  }

  // 9c. Falling autumn leaves (gentle quiet cadence -> richer shower during wind gusts!)
  const leafCount = gustStrength > 0.35 ? 24 : 13;
  const leafA = hexToRgb('#d9843b');
  const leafB = hexToRgb('#e8b256');
  const leafC = hexToRgb('#9e4c28');
  for (let i = 0; i < leafCount; i++) {
    const speedX = 11 + gustStrength * 26 + (i % 4) * 3;
    const speedY = 12 + (i % 3) * 3.5;
    const lx = Math.round(((i * 197 + timeSec * speedX + Math.sin(timeSec * 2.4 + i) * 9) % (W + 80)) - 40);
    const ly = Math.round(((i * 113 + timeSec * speedY) % (H + 60)) - 30);
    if (lx >= 2 && lx < W - 2 && ly >= 2 && ly < H - 2) {
      const lc = i % 3 === 0 ? leafB : i % 3 === 1 ? leafA : leafC;
      const flip = Math.sin(timeSec * 3.5 + i) >= 0 ? 1 : -1;
      setPixel(out, W, H, lx, ly, { ...lc, a: 255 });
      setPixel(out, W, H, lx + flip, ly, { ...lc, a: 255 });
      setPixel(out, W, H, lx + flip, ly - 1, { ...leafB, a: 255 });
    }
  }

  // 9d. Delicate drifting alien turquoise spores rising slowly from Waystone & Chime-Reeds
  const sporeCol = hexToRgb('#9efaf0');
  const sporeSources: Vec2[] = [
    { x: 1708, y: 746 },
    { x: 1694, y: 422 },
  ];
  for (const ss of sporeSources) {
    for (let i = 0; i < 7; i++) {
      const sx = Math.round(ss.x - camX + Math.sin(timeSec * 0.9 + i * 1.4) * 18);
      const sy = Math.round(ss.y - camY - ((timeSec * 7.5 + i * 9) % 44));
      if (sx >= 0 && sx < W && sy >= 0 && sy < H) {
        setPixel(out, W, H, sx, sy, { ...sporeCol, a: 255 });
      }
    }
  }

  // 9e. Animated fluttering forest butterflies & glowing twilight moths!
  for (const cr of state.critters) {
    const cx = cr.homeX + Math.cos(timeSec * cr.speed + cr.phase) * cr.radiusX + Math.sin(timeSec * 1.7 + cr.phase) * 9;
    const cy = cr.homeY + Math.sin(timeSec * cr.speed * 1.3 + cr.phase) * cr.radiusY + Math.cos(timeSec * 2.8 + cr.phase) * 5;
    const sx = Math.round(cx - camX - 6);
    const sy = Math.round(cy - camY - 6);
    if (sx < -12 || sx > W + 12 || sy < -12 || sy > H + 12) continue;
    const wingFrame = Math.floor(timeSec * 9.5 + cr.phase * 4) % 4;
    const cImg = state.livingAtlas.critterFrames[cr.kind][wingFrame];
    blitV4(out, W, H, cImg.pixels, cImg.width, cImg.height, sx, sy);
    if (cr.kind === 1) {
      addLocalGlow(out, W, H, sx + 6, sy + 6, 12, { r: 72, g: 224, b: 212 }, 0.16 * bioMul);
    }
  }

  // 10. Optional F3 Collision-Debug Polygon Overlay (proving 100% intact V7.3 collision fidelity!)
  if (debugCollision) {
    for (const c of world.colliders) {
      const screenPts = c.points.map((pt) => ({ x: pt.x - camX, y: pt.y - camY }));
      if (!screenPts.some((pt) => pt.x >= -120 && pt.x <= W + 120 && pt.y >= -120 && pt.y <= H + 120)) continue;
      const col = ROLE_DEBUG_RGB[c.role];
      const dashed = !isSolidCollider(c.role);
      for (let i = 0; i < screenPts.length; i++) {
        const a = screenPts[i];
        const b = screenPts[(i + 1) % screenPts.length];
        drawLinePx(out, W, H, a.x, a.y, b.x, b.y, col, dashed);
      }
    }
    drawEllipsePx(out, W, H, Math.round(playerX - camX), Math.round(playerY - camY), V73_CHAR_COL_RX, V73_CHAR_COL_RY, {
      r: 255, g: 255, b: 255,
    }, 0.95);
  }

  return { pixels: out, drawnProps, drawnLivingTufts, bentTufts, occludedPixels };
}
