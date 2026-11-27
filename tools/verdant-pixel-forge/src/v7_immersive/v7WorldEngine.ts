/**
 * VERDANT SIGNAL V7.0 — UNIFIED IMMERSIVE WORLD COMPOSITOR & M01 COMPARISON RENDERER
 * ===================================================================================
 * Renders:
 *   - Proof A: Pixel-exact native 480x270 render of current Milestone 01 distant
 *     overhead presentation using REAL unmodified M01 assets & WorldChunkStreamer math.
 *   - Proofs B, C, D, E: Native 480x270 gameplay camera captures of the V7.0 5-plane
 *     immersive world stack (Forest Cathedral, Living Swamp, Vast Amber Coast, and
 *     dynamic Y-sorted walk-in-front / walk-behind / re-emerge occlusion sequence).
 *
 * ZERO artificial enlargement in proof renders — exact 480x270 native pixels!
 */

import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createEmptyBuffer, getPixel, setPixel } from '../engine/pixelBuffer';
import { blitV4, hash2v4 } from '../v4_masterpiece/v4Core';
import { type RGB, blendRgbPx, hexToRgb } from '../v5_soul/v5PixelEngine';
import { type MaraDirV7, type MaraV7SpriteSet } from './v7PixelAtlas';

export const VIEW_W = 480;
export const VIEW_H = 270;
export const WORLD_W = 600;
export const WORLD_H = 310;

export interface RgbaImage {
  pixels: Uint8ClampedArray;
  width: number;
  height: number;
}

export interface WorldPropDef {
  id: string;
  spriteKey: string;
  /** World X of sprite center-bottom anchor */
  x: number;
  /** World Y of sprite foot-base baseline (EXACT Y-sort pivot!) */
  sortY: number;
  /** Solid trunk/rock core collider relative to (x, sortY) */
  colRx: number;
  colRy: number;
  colOffsetY?: number;
  /** Optional subtle foreground overlay flag (renders in Plane 5 with parallax instead of Y-sort) */
  layer: 'ysort' | 'overhang' | 'foreground';
  parallax?: number;
  /** Slight anchor tweak for overhang / foreground placement */
  anchorTopLeft?: boolean;
  /** Soft ground contact shadow radii */
  shadowRx?: number;
  shadowRy?: number;
}

export interface BiomeSceneDef {
  id: 'forest' | 'swamp' | 'coast';
  title: string;
  subtitle: string;
  groundKey: string;
  worldW: number;
  worldH: number;
  /** Default Mara spawn (world coordinates, foot-base) */
  spawnX: number;
  spawnY: number;
  spawnDir: MaraDirV7;
  /** Walkable bounds / water barriers for playable demo */
  walkBounds: { minX: number; maxX: number; minY: number; maxY: number };
  /** Camera framing offset (shifts player into lower-middle third so colossal world towers overhead!) */
  camOffsetY: number;
  shadowColor: RGB;
  occlusionRimColor: RGB;
  props: WorldPropDef[];
}

// ============================================================================
// HELPER: LOAD REAL EXISTING PNG TO RGBA BUFFER VIA IMAGEMAGICK
// ============================================================================
export function loadPngRgba(filePath: string): RgbaImage {
  const dimStr = execFileSync('identify', ['-format', '%w %h', filePath], { encoding: 'utf8' }).trim();
  const [w, h] = dimStr.split(' ').map(Number);
  const raw = execFileSync('convert', [filePath, '-depth', '8', 'rgba:-'], {
    maxBuffer: w * h * 4 + 65536,
  });
  return { pixels: new Uint8ClampedArray(raw), width: w, height: h };
}

function blitRegion(
  dst: Uint8ClampedArray, dw: number, dh: number,
  src: RgbaImage,
  sx0: number, sy0: number, rw: number, rh: number,
  dx0: number, dy0: number,
  alphaScale = 1.0
): void {
  const ix0 = Math.round(dx0);
  const iy0 = Math.round(dy0);
  for (let y = 0; y < rh; y++) {
    const ty = iy0 + y;
    if (ty < 0 || ty >= dh) continue;
    const sy = sy0 + y;
    if (sy < 0 || sy >= src.height) continue;
    for (let x = 0; x < rw; x++) {
      const tx = ix0 + x;
      if (tx < 0 || tx >= dw) continue;
      const sx = sx0 + x;
      if (sx < 0 || sx >= src.width) continue;
      const si = (sy * src.width + sx) * 4;
      const sa = Math.round(src.pixels[si + 3] * alphaScale);
      if (sa === 0) continue;
      const di = (ty * dw + tx) * 4;
      if (sa >= 254 || dst[di + 3] === 0) {
        dst[di] = src.pixels[si];
        dst[di + 1] = src.pixels[si + 1];
        dst[di + 2] = src.pixels[si + 2];
        dst[di + 3] = Math.max(dst[di + 3], sa);
      } else {
        const inv = 255 - sa;
        dst[di] = Math.round((src.pixels[si] * sa + dst[di] * inv) / 255);
        dst[di + 1] = Math.round((src.pixels[si + 1] * sa + dst[di + 1] * inv) / 255);
        dst[di + 2] = Math.round((src.pixels[si + 2] * sa + dst[di + 2] * inv) / 255);
        dst[di + 3] = 255;
      }
    }
  }
}

// ============================================================================
// PROOF A: PIXEL-EXACT NATIVE 480x270 RENDER OF CURRENT MILESTONE 01 OVERHEAD
// ============================================================================
// Mirrors `game/world/world_chunk_streamer.gd` + `rimlands_prototype.gd` +
// `player.tscn` (`Camera2D zoom=(1,1)`, `16x16` tiles, `16x24` Mara, `48x80` trees)
// using the ACTUAL UNMODIFIED M01 PNG files from `game/assets/`!

const M01_WANG_COORDS: Array<[number, number]> = [
  [0, 0], [7, 1], [5, 1], [6, 1], [6, 0], [4, 1], [1, 2], [3, 1],
  [4, 0], [0, 2], [7, 0], [2, 1], [5, 0], [1, 1], [0, 1], [0, 0],
];

function m01SampleElev(fx: number, fy: number): number {
  const slope = (fx + 4.0) * 0.045 - (fy - 3.0) * 0.028;
  const waveA = Math.sin(fx * 0.14 + fy * 0.09) * 0.14;
  const waveB = Math.cos(fx * 0.07 - fy * 0.13) * 0.11;
  return slope + waveA + waveB;
}

function m01Hash(x: number, y: number, seed: number): number {
  let n = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041)) & 0x7fffffff;
  n = ((n >>> 13) ^ n) & 0x7fffffff;
  return (Math.imul(n, 1274126177) & 0x7fffffff) >>> 8;
}

function m01WangMask(tx: number, ty: number, threshold: number): number {
  let m = 0;
  if (m01SampleElev(tx - 0.5, ty - 0.5) >= threshold) m |= 1;
  if (m01SampleElev(tx + 0.5, ty - 0.5) >= threshold) m |= 2;
  if (m01SampleElev(tx - 0.5, ty + 0.5) >= threshold) m |= 4;
  if (m01SampleElev(tx + 0.5, ty + 0.5) >= threshold) m |= 8;
  return m;
}

function m01PickWang(mask: number, tx: number, ty: number): [number, number] {
  if (mask === 15) {
    const r = m01Hash(tx, ty, 503) % 100;
    if (r < 55) return [0, 0];
    if (r < 75) return [1, 0];
    if (r < 90) return [2, 0];
    return [3, 0];
  }
  return M01_WANG_COORDS[mask & 15];
}

function m01IsTrail(tx: number, ty: number): boolean {
  if (tx < 6) return false;
  const cy = Math.sin(tx * 0.15) * 4.0 - 2.0;
  return Math.abs(ty - cy) <= 0.75;
}

function m01InSpawnClearing(tx: number, ty: number): boolean {
  return Math.abs(tx) <= 6 && Math.abs(ty) <= 5;
}

export function renderCurrentM01Overhead480x270(
  repoRoot: string,
  playerWorldX = 112,
  playerWorldY = -24
): Uint8ClampedArray {
  const coast = loadPngRgba(path.join(repoRoot, 'game/assets/world/tilesets/env_amber_coast_ground_tileset.png'));
  const canopy = loadPngRgba(path.join(repoRoot, 'game/assets/world/tilesets/env_singing_canopy_ground_tileset.png'));
  const treeTex = loadPngRgba(path.join(repoRoot, 'game/assets/world/props/prop_singing_reedwood_tree_sheet.png'));
  const floraTex = loadPngRgba(path.join(repoRoot, 'game/assets/world/flora/prop_rimlands_flora_sheet.png'));
  const podTex = loadPngRgba(path.join(repoRoot, 'game/assets/world/landmarks/prop_drop_pod_landmark_sheet.png'));
  const fxTex = loadPngRgba(path.join(repoRoot, 'game/assets/vfx/fx_shadows_ripples_lens_sheet.png'));
  const maraTex = loadPngRgba(path.join(repoRoot, 'game/assets/characters/player/char_mara_lin_sheet.png'));

  const out = createEmptyBuffer(VIEW_W, VIEW_H);
  // Camera2D in M01 is strictly centered on Mara with zoom = (1, 1)
  const camX = Math.round(playerWorldX - VIEW_W / 2);
  const camY = Math.round(playerWorldY - VIEW_H / 2);

  const minTx = Math.floor(camX / 16) - 1;
  const maxTx = Math.ceil((camX + VIEW_W) / 16) + 1;
  const minTy = Math.floor(camY / 16) - 1;
  const maxTy = Math.ceil((camY + VIEW_H) / 16) + 1;

  // Pass 1: TileMapLayers (Water -> Sand Ground -> Moss Ecotone -> Trail/Decal/Cliff)
  for (let ty = minTy; ty <= maxTy; ty++) {
    for (let tx = minTx; tx <= maxTx; tx++) {
      const sx = tx * 16 - camX;
      const sy = ty * 16 - camY;
      const elev = m01SampleElev(tx, ty);
      if (elev < -0.35) {
        blitRegion(out, VIEW_W, VIEW_H, coast, 4 * 16, 6 * 16, 16, 16, sx, sy);
        continue;
      }
      const shim = ((tx + ty) & 1) === 0 ? 0 : 2;
      blitRegion(out, VIEW_W, VIEW_H, coast, shim * 16, 6 * 16, 16, 16, sx, sy);

      const sandMask = m01WangMask(tx, ty, 0.0);
      if (sandMask > 0) {
        const [cx, cy] = m01PickWang(sandMask, tx, ty);
        blitRegion(out, VIEW_W, VIEW_H, coast, cx * 16, cy * 16, 16, 16, sx, sy);
      } else if (elev > -0.14) {
        const tc = ((tx * 3 + ty) & 1) === 0 ? 8 : 9;
        blitRegion(out, VIEW_W, VIEW_H, coast, tc * 16, 0, 16, 16, sx, sy);
      }

      const mossMask = m01WangMask(tx, ty, 0.34);
      if (mossMask > 0) {
        const [cx, cy] = m01PickWang(mossMask, tx, ty);
        blitRegion(out, VIEW_W, VIEW_H, canopy, cx * 16, cy * 16, 16, 16, sx, sy);
      }

      if (mossMask === 15 && m01IsTrail(tx, ty)) {
        let bits = 0;
        if (m01IsTrail(tx, ty - 1)) bits |= 1;
        if (m01IsTrail(tx + 1, ty)) bits |= 2;
        if (m01IsTrail(tx, ty + 1)) bits |= 4;
        if (m01IsTrail(tx - 1, ty)) bits |= 8;
        blitRegion(out, VIEW_W, VIEW_H, canopy, (8 + (bits & 3)) * 16, (bits >> 2) * 16, 16, 16, sx, sy);
        continue;
      }

      const h = m01Hash(tx, ty, 911);
      if (!m01InSpawnClearing(tx, ty)) {
        if (sandMask === 15 && mossMask === 0 && (h % 97) === 0) {
          blitRegion(out, VIEW_W, VIEW_H, coast, 5 * 16, 3 * 16, 16, 16, sx, sy);
        } else if (sandMask === 15 && mossMask === 0 && (h % 29) === 0) {
          blitRegion(out, VIEW_W, VIEW_H, coast, (2 + (h % 6)) * 16, 2 * 16, 16, 16, sx, sy);
        } else if (mossMask === 15 && (h % 23) === 0) {
          blitRegion(out, VIEW_W, VIEW_H, canopy, (2 + (h % 6)) * 16, 2 * 16, 16, 16, sx, sy);
        }
      }
    }
  }

  // Drop-pod skid decal at (0, -8)
  blitRegion(out, VIEW_W, VIEW_H, podTex, 0, 48, 64, 16, -32 - camX, -16 - camY);

  // Collect Y-sorted objects (Drop-Pod, Trees, Flora, Player)
  interface YObj { sortY: number; draw: () => void; canopy?: () => void }
  const yObjs: YObj[] = [];

  // Drop-pod landmark at (0, -8)
  yObjs.push({
    sortY: -8,
    draw: () => {
      blitRegion(out, VIEW_W, VIEW_H, podTex, 0, 0, 64, 48, -32 - camX, -8 - 42 - camY);
      blitRegion(out, VIEW_W, VIEW_H, podTex, 64, 16, 32, 32, -48 - camX, 2 - 28 - camY);
    },
  });

  // Exact M01 sparse 4x4 tile (64x64px) Reedwood tree placement!
  for (let cy = -1; cy <= 1; cy++) {
    for (let cx = -1; cx <= 1; cx++) {
      const ox = cx * 32, oy = cy * 32;
      for (let gy = 0; gy < 32; gy += 4) {
        for (let gx = 0; gx < 32; gx += 4) {
          const h = m01Hash(cx * 8 + gx, cy * 8 + gy, 307);
          const tx = ox + gx + (h % 3);
          const ty = oy + gy + ((h >> 3) % 3);
          if (m01InSpawnClearing(tx, ty) || m01IsTrail(tx, ty)) continue;
          if (m01SampleElev(tx, ty) > 0.42 && (h % 100) < 42) {
            const wx = tx * 16 + 8;
            const wy = ty * 16 + 12;
            if (wx < camX - 48 || wx > camX + VIEW_W + 48 || wy < camY - 80 || wy > camY + VIEW_H + 80) continue;
            const variant = (h >> 6) & 1;
            const rowY = variant * 80;
            yObjs.push({
              sortY: wy,
              draw: () => {
                blitRegion(out, VIEW_W, VIEW_H, fxTex, 64, 0, 32, 32, wx - 16 - camX, wy - 16 - camY);
                blitRegion(out, VIEW_W, VIEW_H, treeTex, 0, rowY, 48, 80, wx - 24 - camX, wy - 72 - camY);
              },
              canopy: () => {
                blitRegion(out, VIEW_W, VIEW_H, treeTex, 48, rowY, 48, 80, wx - 24 - camX, wy - 72 - camY);
              },
            });
          }
        }
      }
      // Flora props
      for (let gy = 0; gy < 32; gy += 3) {
        for (let gx = 0; gx < 32; gx += 3) {
          const hf = m01Hash(ox + gx, oy + gy, 733);
          if ((hf % 100) >= 24) continue;
          const tx = ox + gx + (hf & 1);
          const ty = oy + gy + ((hf >> 2) & 1);
          if (m01InSpawnClearing(tx, ty) || m01IsTrail(tx, ty)) continue;
          const elev = m01SampleElev(tx, ty);
          let sp = -1;
          if (elev > -0.14 && elev <= 0.04) sp = 0;
          else if (elev > 0.06 && elev <= 0.28) sp = 1;
          else if (elev > 0.30 && elev <= 0.48) sp = 2;
          else if (elev > 0.48) sp = 3;
          if (sp >= 0) {
            const wx = tx * 16 + 8;
            const wy = ty * 16 + 12;
            if (wx < camX - 24 || wx > camX + VIEW_W + 24 || wy < camY - 32 || wy > camY + VIEW_H + 32) continue;
            const vCol = (hf >> 4) & 1;
            yObjs.push({
              sortY: wy,
              draw: () => {
                blitRegion(out, VIEW_W, VIEW_H, floraTex, vCol * 16, sp * 32, 16, 32, wx - 8 - camX, wy - 28 - camY);
              },
            });
          }
        }
      }
    }
  }

  // Player M01 Mara (`16x24` frame 0 = idle down)
  yObjs.push({
    sortY: playerWorldY,
    draw: () => {
      blitRegion(out, VIEW_W, VIEW_H, fxTex, 0, 0, 32, 32, playerWorldX - 16 - camX, playerWorldY - 16 - camY);
      blitRegion(out, VIEW_W, VIEW_H, maraTex, 0, 0, 16, 24, playerWorldX - 8 - camX, playerWorldY - 22 - camY);
    },
  });

  yObjs.sort((a, b) => a.sortY - b.sortY);
  for (const o of yObjs) o.draw();
  for (const o of yObjs) if (o.canopy) o.canopy();

  return out;
}

// ============================================================================
// THREE COMPOSED IMMERSIVE V7.0 BIOME WORLD DEFINITIONS (640x360 WORLD MAPS)
// ============================================================================

export function getV7BiomeScenes(): Record<'forest' | 'swamp' | 'coast', BiomeSceneDef> {
  return {
    forest: {
      id: 'forest',
      title: 'B. IMMERSIVE DENSE FOREST - SINGING REEDWOOD CATHEDRAL',
      subtitle: 'COLOSSAL 78-96PX TRUNKS EXTENDING OFF-SCREEN, FOREGROUND CANOPY FRAMING & LIVE Y-SORT',
      groundKey: 'forest_ground',
      worldW: WORLD_W,
      worldH: WORLD_H,
      // Mara stands in the sunlit lower clearing facing UP INTO the cathedral trunk corridor!
      // camOffsetY = -88 frames the camera so bright turquoise sky & distant misty peaks peek
      // right through the upper canopy gap while colossal trunks tower straight off the top edge!
      spawnX: 300,
      spawnY: 244,
      spawnDir: 'up',
      walkBounds: { minX: 98, maxX: 502, minY: 146, maxY: 294 },
      camOffsetY: -88,
      shadowColor: hexToRgb('#0c291f'),
      occlusionRimColor: hexToRgb('#8cf7f0'),
      props: [
        // Mid-back colossal guardian trunks narrowing the forest corridor
        { id: 'tree_back_left', spriteKey: 'reedwood_a', x: 174, sortY: 184, colRx: 24, colRy: 10, colOffsetY: -8, layer: 'ysort', shadowRx: 48, shadowRy: 12 },
        { id: 'tree_back_right', spriteKey: 'reedwood_b', x: 428, sortY: 188, colRx: 26, colRy: 10, colOffsetY: -8, layer: 'ysort', shadowRx: 50, shadowRy: 12 },
        // Hero Colossal Singing Reedwood Trunks flanking the playable sunlit clearing!
        // Players walk cleanly IN FRONT OF (y > sortY) AND BEHIND (y < sortY) these enormous trunks!
        { id: 'tree_hero_left', spriteKey: 'reedwood_b', x: 152, sortY: 238, colRx: 28, colRy: 13, colOffsetY: -9, layer: 'ysort', shadowRx: 62, shadowRy: 15 },
        { id: 'tree_hero_right', spriteKey: 'reedwood_a', x: 446, sortY: 234, colRx: 28, colRy: 13, colOffsetY: -9, layer: 'ysort', shadowRx: 60, shadowRy: 15 },
        // Camera-edge foreground framing canopy boughs (Plane 5 with 1.14x parallax — corners framed, sky peak visible in center!)
        { id: 'fg_bough_top_left', spriteKey: 'fg_canopy_left', x: -34, sortY: -18, colRx: 0, colRy: 0, layer: 'foreground', parallax: 1.14, anchorTopLeft: true },
        { id: 'fg_bough_top_right', spriteKey: 'fg_canopy_right', x: 334, sortY: -20, colRx: 0, colRy: 0, layer: 'foreground', parallax: 1.14, anchorTopLeft: true },
        { id: 'fg_bough_bot_left', spriteKey: 'fg_canopy_bot_left', x: -38, sortY: 172, colRx: 0, colRy: 0, layer: 'foreground', parallax: 1.16, anchorTopLeft: true },
      ],
    },
    swamp: {
      id: 'swamp',
      title: 'C. IMMERSIVE LIVING SWAMP - MIRE OF WHISPERING ROOTS',
      subtitle: 'VAST WINDING WATER CHANNELS (>55% SCREEN), GNARLED ROOT ARCHES & TOWERING REEDS',
      groundKey: 'swamp_ground',
      worldW: WORLD_W,
      worldH: WORLD_H,
      // Mara walks along the wet muddy causeway surrounded by vast dark-teal channels, giant reeds,
      // and misty golden-teal mangrove silhouettes vanishing into the upper horizon!
      spawnX: 274,
      spawnY: 224,
      spawnDir: 'right',
      walkBounds: { minX: 108, maxX: 492, minY: 146, maxY: 286 },
      camOffsetY: -86,
      shadowColor: hexToRgb('#0b1f24'),
      occlusionRimColor: hexToRgb('#9efcf4'),
      props: [
        // Colossal mangrove buttress-root arch & dense towering reed wall on left bank
        { id: 'swamp_roots_left', spriteKey: 'swamp_root_reeds', x: 134, sortY: 204, colRx: 30, colRy: 13, colOffsetY: -8, layer: 'ysort', shadowRx: 60, shadowRy: 14 },
        // Colossal gnarled mangrove arch & towering swamp reed wall framing right bank
        { id: 'swamp_roots_right', spriteKey: 'swamp_root_reeds_flip', x: 462, sortY: 222, colRx: 30, colRy: 13, colOffsetY: -8, layer: 'ysort', shadowRx: 60, shadowRy: 14 },
        // Flush bottom-left foreground marsh reeds & overhanging cyan moss vine (cleanly bleeds past bottom edge!)
        { id: 'fg_swamp_bot_left', spriteKey: 'fg_swamp_reeds', x: -24, sortY: 158, colRx: 0, colRy: 0, layer: 'foreground', parallax: 1.15, anchorTopLeft: true },
        // Dark mossy overhanging swamp canopy boughs framing upper-left & upper-right corners (keeping misty mangrove horizon open in center!)
        { id: 'fg_swamp_top_left', spriteKey: 'fg_swamp_canopy_tl', x: -34, sortY: -22, colRx: 0, colRy: 0, layer: 'foreground', parallax: 1.14, anchorTopLeft: true },
        { id: 'fg_swamp_top_right', spriteKey: 'fg_swamp_canopy_tr', x: 332, sortY: -22, colRx: 0, colRy: 0, layer: 'foreground', parallax: 1.14, anchorTopLeft: true },
      ],
    },
    coast: {
      id: 'coast',
      title: 'D. IMMERSIVE COASTAL ENVIRONMENT - AMBER COAST LEVIATHAN SHORE',
      subtitle: 'VAST OCEAN (~60% VIEWPORT), CURLING LACY FOAM, STRATIFIED CLIFFS & FOREGROUND BOULDERS',
      groundKey: 'coast_ground',
      worldW: WORLD_W,
      worldH: WORLD_H,
      // Mara stands along the sweeping amber beach gazing across the immense living ocean & golden sunrise horizon!
      spawnX: 372,
      spawnY: 224,
      spawnDir: 'left',
      walkBounds: { minX: 242, maxX: 486, minY: 132, maxY: 288 },
      camOffsetY: -86,
      shadowColor: hexToRgb('#4a291e'),
      occlusionRimColor: hexToRgb('#ffe094'),
      props: [
        // Colossal stratified coastal cliff headland (organically grounded rock skirt — zero flat bottom edge!)
        { id: 'coast_cliff_upper', spriteKey: 'coast_monolith', x: 522, sortY: 196, colRx: 42, colRy: 20, colOffsetY: -12, layer: 'ysort', shadowRx: 70, shadowRy: 16 },
        // Weathered tidepool sea-rock formation right by Mara (walk cleanly in front of & behind it!)
        { id: 'coast_boulder_mid', spriteKey: 'coast_boulder', x: 454, sortY: 244, colRx: 32, colRy: 12, colOffsetY: -8, layer: 'ysort', shadowRx: 52, shadowRy: 12 },
        // Dark shadowed foreground cliff rock framing strictly the bottom-right corner edge!
        { id: 'fg_coast_rock_br', spriteKey: 'coast_boulder_fg', x: 396, sortY: 218, colRx: 0, colRy: 0, layer: 'foreground', parallax: 1.15, anchorTopLeft: true },
      ],
    },
  };
}

// ============================================================================
// REAL 5-PLANE IMMERSIVE NATIVE 480x270 GAMEPLAY FRAME RENDERER
// ============================================================================

function drawSoftContactShadow(
  buf: Uint8ClampedArray, w: number, h: number,
  cx: number, cy: number, rx: number, ry: number, col: RGB, maxAlpha: number
): void {
  const x0 = Math.max(0, Math.floor(cx - rx));
  const x1 = Math.min(w - 1, Math.ceil(cx + rx));
  const y0 = Math.max(0, Math.floor(cy - ry));
  const y1 = Math.min(h - 1, Math.ceil(cy + ry));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const d = ((x - cx) * (x - cx)) / (rx * rx) + ((y - cy) * (y - cy)) / (ry * ry);
      if (d <= 1.0) {
        const a = Math.round((1 - d) * maxAlpha);
        blendRgbPx(buf, w, h, x, y, col, a);
      }
    }
  }
}

/** Draw subtle living animated biome polish (water sparkles, pollen motes, spore glints) */
function drawLivingBiomeAmbience(
  buf: Uint8ClampedArray,
  scene: BiomeSceneDef,
  camX: number,
  camY: number,
  animPhase: number
): void {
  const ph = animPhase * Math.PI * 2;
  if (scene.id === 'forest') {
    const gold = hexToRgb('#fff5b8');
    const cyan = hexToRgb('#8cf7f0');
    const skyGlint = hexToRgb('#c9f4ff');
    // Subtle rainwater puddle sparkles
    for (let i = 0; i < 12; i++) {
      const wx = 190 + hash2v4(i, 11, 701) * 260;
      const wy = 262 + hash2v4(i, 23, 709) * 52;
      const sx = Math.round(wx - camX);
      const sy = Math.round(wy - camY);
      const p = Math.sin(ph + i * 1.4);
      if (p > 0.45 && sx >= 0 && sx < VIEW_W && sy >= 0 && sy < VIEW_H) {
        const bg = getPixel(buf, VIEW_W, VIEW_H, sx, sy);
        if (bg.b > bg.r + 20) {
          blendRgbPx(buf, VIEW_W, VIEW_H, sx, sy, skyGlint, 210);
          blendRgbPx(buf, VIEW_W, VIEW_H, sx + 1, sy, skyGlint, 140);
        }
      }
    }
    // Floating sunlit forest pollen motes
    for (let i = 0; i < 18; i++) {
      const bx = 60 + hash2v4(i, 37, 811) * 520;
      const by0 = 70 + hash2v4(i, 53, 823) * 240;
      const drift = (animPhase + hash2v4(i, 71, 829)) % 1;
      const fade = Math.sin(drift * Math.PI);
      const sx = bx + Math.sin(ph + i) * 4 - camX;
      const sy = by0 - drift * 18 - camY;
      blendRgbPx(buf, VIEW_W, VIEW_H, sx, sy, i % 3 === 0 ? cyan : gold, Math.round(fade * 210));
    }
  } else if (scene.id === 'swamp') {
    const cyan = hexToRgb('#9efcf4');
    const waterGlint = hexToRgb('#94c4bd');
    for (let i = 0; i < 20; i++) {
      const wx = 80 + hash2v4(i, 19, 911) * 480;
      const wy = 140 + hash2v4(i, 29, 919) * 180;
      const sx = Math.round(wx - camX);
      const sy = Math.round(wy - camY);
      if (sx < 0 || sx >= VIEW_W || sy < 0 || sy >= VIEW_H) continue;
      const bg = getPixel(buf, VIEW_W, VIEW_H, sx, sy);
      const p = Math.sin(ph + i * 1.3);
      if (p > 0.4 && bg.g > bg.r && bg.b > bg.r) {
        blendRgbPx(buf, VIEW_W, VIEW_H, sx, sy, waterGlint, 155);
        blendRgbPx(buf, VIEW_W, VIEW_H, sx + 1, sy, waterGlint, 110);
      }
    }
    // Floating bioluminescent swamp spore fireflies
    for (let i = 0; i < 16; i++) {
      const bx = 70 + hash2v4(i, 41, 937) * 500;
      const by0 = 110 + hash2v4(i, 59, 947) * 210;
      const drift = (animPhase + hash2v4(i, 83, 953)) % 1;
      const fade = Math.sin(drift * Math.PI);
      const sx = bx + Math.cos(ph + i * 1.1) * 5 - camX;
      const sy = by0 - drift * 14 - camY;
      blendRgbPx(buf, VIEW_W, VIEW_H, sx, sy, cyan, Math.round(fade * 225));
    }
  } else {
    // Amber Coast living ocean sparkles & tiny curling foam shimmer!
    const gold = hexToRgb('#fffbe0');
    const foam = hexToRgb('#f5fcf7');
    for (let i = 0; i < 28; i++) {
      const wx = 20 + hash2v4(i, 17, 601) * 340;
      const wy = 72 + hash2v4(i, 31, 607) * 230;
      const sx = Math.round(wx - camX);
      const sy = Math.round(wy - camY);
      if (sx < 0 || sx >= VIEW_W || sy < 0 || sy >= VIEW_H) continue;
      const bg = getPixel(buf, VIEW_W, VIEW_H, sx, sy);
      const p = Math.sin(ph + i * 1.5);
      if (p > 0.42 && (bg.b >= bg.r - 10 || (bg.r > 220 && bg.g > 200))) {
        const col = wy < 165 ? gold : foam;
        blendRgbPx(buf, VIEW_W, VIEW_H, sx, sy, col, 210);
        blendRgbPx(buf, VIEW_W, VIEW_H, sx + 1, sy, col, 150);
      }
    }
  }
}

export function renderV7SceneFrame(opts: {
  scene: BiomeSceneDef;
  sprites: Record<string, RgbaImage>;
  maraSprites: MaraV7SpriteSet;
  maraX: number;
  maraY: number;
  maraDir: MaraDirV7;
  maraStep: number;
  animPhase?: number;
  /** Optional explicit camera center override (defaults to Mara + scene.camOffsetY) */
  camFocusX?: number;
  camFocusY?: number;
  /** Render debug Y-sort baseline & trunk collision overlay */
  showDebugSortLines?: boolean;
}): { pixels: Uint8ClampedArray; camX: number; camY: number; occludedPixels: number } {
  const { scene, sprites, maraSprites, maraX, maraY, maraDir, maraStep } = opts;
  const animPhase = opts.animPhase ?? 0;

  // Compute clamped pixel-snapped 480x270 gameplay camera!
  const focusX = opts.camFocusX ?? maraX;
  const focusY = (opts.camFocusY ?? maraY) + scene.camOffsetY;
  const camX = Math.round(Math.max(0, Math.min(scene.worldW - VIEW_W, focusX - VIEW_W / 2)));
  const camY = Math.round(Math.max(0, Math.min(scene.worldH - VIEW_H, focusY - VIEW_H / 2)));
  const camShiftX = camX - (scene.worldW - VIEW_W) / 2;
  const camShiftY = camY - (scene.worldH - VIEW_H) / 2;

  const out = createEmptyBuffer(VIEW_W, VIEW_H);

  // PLANE 1 & 2: Oblique Ground, Living Water & Distant Horizon (exact 1:1 native 480x270 slice of 640x360 world!)
  const ground = sprites[scene.groundKey];
  blitRegion(out, VIEW_W, VIEW_H, ground, camX, camY, VIEW_W, VIEW_H, 0, 0);
  drawLivingBiomeAmbience(out, scene, camX, camY, animPhase);

  // PLANE 3: Y-SORTED MONUMENTAL WORLD (Exact foot-base sortY!)
  // Paint grounded contact shadows first beneath all Y-sorted structures & Mara
  for (const prop of scene.props) {
    if (prop.layer !== 'ysort') continue;
    if (prop.shadowRx && prop.shadowRy) {
      drawSoftContactShadow(
        out, VIEW_W, VIEW_H,
        prop.x - camX, prop.sortY - camY - 2,
        prop.shadowRx, prop.shadowRy,
        scene.shadowColor, 118
      );
    }
  }
  // Mara's subtle ground contact shadow (plus soft wet sand reflection on Amber Coast!)
  drawSoftContactShadow(out, VIEW_W, VIEW_H, maraX - camX, maraY - camY - 1, 9, 3.5, scene.shadowColor, 130);

  // Build strict Y-sort draw queue!
  interface SortEntry {
    sortY: number;
    kind: 'prop' | 'mara';
    prop?: WorldPropDef;
  }
  const queue: SortEntry[] = scene.props
    .filter((p) => p.layer === 'ysort')
    .map((prop) => ({ sortY: prop.sortY, kind: 'prop', prop }));
  queue.push({ sortY: maraY, kind: 'mara' });
  queue.sort((a, b) => a.sortY - b.sortY);

  // Track exact screen rect & pixels occupied by Mara so we can apply localized
  // readability rim ONLY where an occluding foreground structure actually covers her!
  const maraFrame = maraSprites.frames[maraDir][maraStep % 4];
  const maraScreenX = Math.round(maraX - camX - maraSprites.frameW / 2);
  const maraScreenY = Math.round(maraY - camY - (maraSprites.frameH - 3));
  let maraDrawn = false;
  const occluderMask = new Uint8Array(VIEW_W * VIEW_H);

  for (const item of queue) {
    if (item.kind === 'mara') {
      blitV4(out, VIEW_W, VIEW_H, maraFrame, maraSprites.frameW, maraSprites.frameH, maraScreenX, maraScreenY);
      maraDrawn = true;
    } else if (item.prop) {
      const spr = sprites[item.prop.spriteKey];
      const dx = Math.round(item.prop.x - camX - spr.width / 2);
      const dy = Math.round(item.prop.sortY - camY - spr.height);
      blitV4(out, VIEW_W, VIEW_H, spr.pixels, spr.width, spr.height, dx, dy);

      // If this monumental prop drew AFTER Mara (sortY > maraY), mark pixels that physically occlude Mara!
      if (maraDrawn) {
        for (let my = 0; my < maraSprites.frameH; my++) {
          const sy = maraScreenY + my;
          if (sy < 0 || sy >= VIEW_H) continue;
          const py = sy - dy;
          if (py < 0 || py >= spr.height) continue;
          for (let mx = 0; mx < maraSprites.frameW; mx++) {
            const sx = maraScreenX + mx;
            if (sx < 0 || sx >= VIEW_W) continue;
            const px = sx - dx;
            if (px < 0 || px >= spr.width) continue;
            const mAlpha = maraFrame[(my * maraSprites.frameW + mx) * 4 + 3];
            const pAlpha = spr.pixels[(py * spr.width + px) * 4 + 3];
            if (mAlpha > 128 && pAlpha > 128) {
              occluderMask[sy * VIEW_W + sx] = 1;
            }
          }
        }
      }
    }
  }

  // LOCALIZED OCCLUSION READABILITY SILHOUETTE:
  // Only when a substantial chunk of Mara is behind a colossal trunk/reed, draw a
  // crisp subtle 1px dithered silhouette rim + warm visor hint so the player NEVER
  // loses Mara while preserving 100% of the physical mass & solidity of the tree!
  let occludedPixels = 0;
  for (let i = 0; i < occluderMask.length; i++) occludedPixels += occluderMask[i];

  if (occludedPixels >= 18) {
    const rim = scene.occlusionRimColor;
    for (let my = 0; my < maraSprites.frameH; my++) {
      const sy = maraScreenY + my;
      if (sy < 1 || sy >= VIEW_H - 1) continue;
      for (let mx = 0; mx < maraSprites.frameW; mx++) {
        const sx = maraScreenX + mx;
        if (sx < 1 || sx >= VIEW_W - 1) continue;
        if (!occluderMask[sy * VIEW_W + sx]) continue;
        // Detect Mara silhouette boundary pixel
        const mL = mx > 0 ? maraFrame[(my * maraSprites.frameW + (mx - 1)) * 4 + 3] : 0;
        const mR = mx < maraSprites.frameW - 1 ? maraFrame[(my * maraSprites.frameW + (mx + 1)) * 4 + 3] : 0;
        const mU = my > 0 ? maraFrame[((my - 1) * maraSprites.frameW + mx) * 4 + 3] : 0;
        const mD = my < maraSprites.frameH - 1 ? maraFrame[((my + 1) * maraSprites.frameW + mx) * 4 + 3] : 0;
        const isEdge = mL < 128 || mR < 128 || mU < 128 || mD < 128;
        if (isEdge) {
          blendRgbPx(out, VIEW_W, VIEW_H, sx, sy, rim, 165);
        } else if (((sx + sy) & 1) === 0) {
          // Subtle checkerboard translucent suit/visor peek right inside her occluded silhouette
          const mi = (my * maraSprites.frameW + mx) * 4;
          blendRgbPx(out, VIEW_W, VIEW_H, sx, sy, {
            r: maraFrame[mi], g: maraFrame[mi + 1], b: maraFrame[mi + 2],
          }, 62);
        }
      }
    }
  }

  // PLANE 5: CAMERA-EDGE FOREGROUND FRAMING (1.14x–1.16x Parallax Overlays!)
  for (const prop of scene.props) {
    if (prop.layer !== 'foreground') continue;
    const spr = sprites[prop.spriteKey];
    const pFactor = prop.parallax ?? 1.14;
    // Slight foreground parallax shift relative to camera movement!
    const pxOffset = Math.round(camShiftX * (pFactor - 1.0));
    const pyOffset = Math.round(camShiftY * (pFactor - 1.0));
    const dx = Math.round(prop.x - pxOffset);
    const dy = Math.round(prop.sortY - pyOffset);
    blitV4(out, VIEW_W, VIEW_H, spr.pixels, spr.width, spr.height, dx, dy);
  }

  // Optional debug Y-sort & trunk-collider overlay (for technical docs if requested)
  if (opts.showDebugSortLines) {
    const cyan = hexToRgb('#8cf7f0');
    const amber = hexToRgb('#ffc947');
    for (const p of scene.props) {
      if (p.layer !== 'ysort') continue;
      const sx = Math.round(p.x - camX);
      const sy = Math.round(p.sortY - camY);
      for (let x = sx - 28; x <= sx + 28; x++) blendRgbPx(out, VIEW_W, VIEW_H, x, sy, cyan, 180);
    }
    const mx = Math.round(maraX - camX), my = Math.round(maraY - camY);
    for (let x = mx - 12; x <= mx + 12; x++) blendRgbPx(out, VIEW_W, VIEW_H, x, my, amber, 230);
  }

  return { pixels: out, camX, camY, occludedPixels };
}
