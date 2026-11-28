import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  type SpriteBitmap,
  V90_MASTER_HEX,
  bakeCrispPixelSprite,
  extractForegroundComponents,
  flipSpriteHorizontal,
  loadPngRgba,
  saveEditableVpfSource,
  savePngRgba,
} from './v90PaletteAndExtractor';
import {
  buildAmberTideKelpSheet,
  buildCoastalFaunaAtlas,
  buildCoastalFxDecalsAtlas,
  buildCoastalLivingGrassAtlas,
  buildOceanFoamAndBreakAtlas,
} from './v90CoastalFloraAndWaterSprites';
import {
  V90_SCAN_SITES,
  V90_SHORE_H,
  V90_SHORE_ORIGIN_Y,
  V90_SPAWN_POS,
  V90_TIDEPOOLS,
  V90_WARP_ZONES,
  V90_WORLD_W,
  getBrokenShoreWaterlineY,
  getV90AmberKelpPlacements,
  getV90BrokenShoreProps,
  getV90CoastalFauna,
  getV90WalkableZones,
} from './v90BrokenShoreWorldDef';
import { buildV90BrokenShoreTerrain } from './v90BrokenShoreTerrain';

interface AssetCatalogEntry {
  id: string;
  category: 'spacecraft' | 'geology' | 'coastal_flora' | 'ocean_water' | 'fauna' | 'fx' | 'terrain';
  productionPath: string;
  vpfSourcePath: string;
  canvasWidth: number;
  canvasHeight: number;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  frameOrder: string;
  pivotOrigin: [number, number];
  sortingOriginYOffset: number;
  visualHeightPx: number;
  collisionFootprint: string;
  materialRole: string;
  sceneUses: string[];
  paletteCount: number;
}

const REPO_ROOT = path.resolve(process.cwd(), '../..');
const RAW_DIR = '/tmp/v90_raw';
const PROD_ROOT = path.join(REPO_ROOT, 'game/assets/world/broken_shore');
const PROD_SPRITES = path.join(PROD_ROOT, 'sprites');
const PROD_ANIM = path.join(PROD_ROOT, 'animated');
const VPF_ROOT = path.join(REPO_ROOT, 'game/assets/_vpf_sources/broken_shore');
const QA_DIR = '/tmp/v90_qa';

const V80_FLOOR_PATH = path.join(REPO_ROOT, 'game/assets/world/living_forest/sprites/v80_living_floor_2304x1536.png');
const V80_SPRITES_DIR = path.join(REPO_ROOT, 'game/assets/world/living_forest/sprites');
const MARA_IDLE_PATH = path.join(REPO_ROOT, 'game/assets/characters/player/mara_original/char_idle_88x88_8x4.png');

function createBitmap(w: number, h: number): SpriteBitmap {
  return { w, h, rgba: new Uint8Array(w * h * 4) };
}

function blitAlpha(dst: SpriteBitmap, src: SpriteBitmap, dx: number, dy: number): void {
  const ix0 = Math.round(dx);
  const iy0 = Math.round(dy);
  for (let sy = 0; sy < src.h; sy++) {
    const ty = iy0 + sy;
    if (ty < 0 || ty >= dst.h) continue;
    for (let sx = 0; sx < src.w; sx++) {
      const tx = ix0 + sx;
      if (tx < 0 || tx >= dst.w) continue;
      const si = (sy * src.w + sx) * 4;
      const a = src.rgba[si + 3];
      if (a === 0) continue;
      const di = (ty * dst.w + tx) * 4;
      if (a >= 250) {
        dst.rgba[di] = src.rgba[si];
        dst.rgba[di + 1] = src.rgba[si + 1];
        dst.rgba[di + 2] = src.rgba[si + 2];
        dst.rgba[di + 3] = 255;
      } else {
        const fa = a / 255;
        const ia = 1 - fa;
        dst.rgba[di] = Math.round(dst.rgba[di] * ia + src.rgba[si] * fa);
        dst.rgba[di + 1] = Math.round(dst.rgba[di + 1] * ia + src.rgba[si + 1] * fa);
        dst.rgba[di + 2] = Math.round(dst.rgba[di + 2] * ia + src.rgba[si + 2] * fa);
        dst.rgba[di + 3] = 255;
      }
    }
  }
}

function upscaleNearest(src: SpriteBitmap, scale: number): SpriteBitmap {
  const out = createBitmap(src.w * scale, src.h * scale);
  for (let y = 0; y < out.h; y++) {
    const sy = Math.floor(y / scale);
    for (let x = 0; x < out.w; x++) {
      const sx = Math.floor(x / scale);
      const si = (sy * src.w + sx) * 4;
      const di = (y * out.w + x) * 4;
      out.rgba[di] = src.rgba[si];
      out.rgba[di + 1] = src.rgba[si + 1];
      out.rgba[di + 2] = src.rgba[si + 2];
      out.rgba[di + 3] = src.rgba[si + 3];
    }
  }
  return out;
}

function countDistinctColors(bmp: SpriteBitmap): number {
  const s = new Set<number>();
  for (let i = 0; i < bmp.rgba.length; i += 4) {
    if (bmp.rgba[i + 3] < 128) continue;
    s.add((bmp.rgba[i] << 16) | (bmp.rgba[i + 1] << 8) | bmp.rgba[i + 2]);
  }
  return s.size;
}

function measureVisualHeight(bmp: SpriteBitmap): number {
  let minY = bmp.h;
  let maxY = -1;
  for (let y = 0; y < bmp.h; y++) {
    for (let x = 0; x < bmp.w; x++) {
      if (bmp.rgba[(y * bmp.w + x) * 4 + 3] >= 128) {
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return maxY >= minY ? maxY - minY + 1 : 0;
}

function cropFrame(sheet: SpriteBitmap, col: number, row: number, fw: number, fh: number): SpriteBitmap {
  const out = createBitmap(fw, fh);
  for (let y = 0; y < fh; y++) {
    for (let x = 0; x < fw; x++) {
      const si = ((row * fh + y) * sheet.w + (col * fw + x)) * 4;
      const di = (y * fw + x) * 4;
      out.rgba[di] = sheet.rgba[si];
      out.rgba[di + 1] = sheet.rgba[si + 1];
      out.rgba[di + 2] = sheet.rgba[si + 2];
      out.rgba[di + 3] = sheet.rgba[si + 3];
    }
  }
  return out;
}

function renderCameraCrop(
  floor: SpriteBitmap,
  v80Floor: SpriteBitmap,
  sprites: Record<string, SpriteBitmap>,
  grassSheet: SpriteBitmap,
  kelpSheet: SpriteBitmap,
  surfSheet: SpriteBitmap,
  faunaSheet: SpriteBitmap,
  maraFrame: SpriteBitmap,
  props: ReturnType<typeof getV90BrokenShoreProps>,
  tufts: Array<{ x: number; y: number; row: number; phase: number; sens: number }>,
  camCenterX: number,
  camCenterY: number,
  maraX: number,
  maraY: number,
  showInteriorCutaway = false
): SpriteBitmap {
  const CW = 640;
  const CH = 360;
  const x0 = Math.round(camCenterX - CW / 2);
  const y0 = Math.round(camCenterY - CH / 2);
  const canvas = createBitmap(CW, CH);

  // 1. Copy unified world floor (seamlessly compositing V8.0 Forest for y < 1344 and V9.0 Shore for y >= 1344!)
  for (let py = 0; py < CH; py++) {
    const gy = y0 + py;
    for (let px = 0; px < CW; px++) {
      const gx = x0 + px;
      const di = (py * CW + px) * 4;
      if (gx < 0 || gx >= V90_WORLD_W) {
        canvas.rgba[di] = 16;
        canvas.rgba[di + 1] = 29;
        canvas.rgba[di + 2] = 50;
        canvas.rgba[di + 3] = 255;
        continue;
      }
      if (gy >= V90_SHORE_ORIGIN_Y && gy < V90_SHORE_ORIGIN_Y + V90_SHORE_H) {
        const si = ((gy - V90_SHORE_ORIGIN_Y) * floor.w + gx) * 4;
        canvas.rgba[di] = floor.rgba[si];
        canvas.rgba[di + 1] = floor.rgba[si + 1];
        canvas.rgba[di + 2] = floor.rgba[si + 2];
        canvas.rgba[di + 3] = 255;
      } else if (gy >= 0 && gy < v80Floor.h) {
        const si = (gy * v80Floor.w + gx) * 4;
        canvas.rgba[di] = v80Floor.rgba[si];
        canvas.rgba[di + 1] = v80Floor.rgba[si + 1];
        canvas.rgba[di + 2] = v80Floor.rgba[si + 2];
        canvas.rgba[di + 3] = 255;
      }
    }
  }

  // 2. Animated Shoreline Surf Foam Ribbons (Row 0 ONLY: 64x24!) along the organic coastline contour!
  for (let gx = Math.max(0, x0 - 64); gx < Math.min(V90_WORLD_W, x0 + CW + 64); gx += 52) {
    const sy = getBrokenShoreWaterlineY(gx);
    if (sy < y0 - 32 || sy > y0 + CH + 32) continue;
    const f = Math.abs(Math.floor(gx / 52)) % 8;
    const foamFrame = cropFrame(surfSheet, f, 0, 64, 24);
    blitAlpha(canvas, foamFrame, gx - x0 - 32, sy - y0 - 8);
  }

  // 3. Offshore Ocean Props & Wave Break Collars (Row 1 ONLY: 64x24!)
  for (const p of props.filter((pr) => pr.layer === 'ocean_prop')) {
    const spr = sprites[p.spriteKey];
    if (!spr) continue;
    const dx = Math.round(p.x - x0 - spr.w / 2);
    const dy = Math.round(p.y - y0 + p.offsetY - spr.h / 2);
    blitAlpha(canvas, spr, dx, dy);
    if (p.waveBreakCollar) {
      const collar = cropFrame(surfSheet, 2, 1, 64, 24);
      blitAlpha(canvas, collar, Math.round(p.x - x0 - 32), Math.round(p.y - y0 - 6));
    }
  }

  // 4. Swaying Amber Tide-Kelp Colonies in Tidepools & Shallows!
  for (const ak of getV90AmberKelpPlacements()) {
    const f = Math.floor(ak.phase) % 4;
    const kelp = cropFrame(kelpSheet, f, 0, 48, 40);
    blitAlpha(canvas, kelp, Math.round(ak.x - x0 - 24), Math.round(ak.y - y0 - 26));
  }

  // 5. Build Y-Sorted Draw List (Props + Tufts + Mara + Fauna + Optional Breached Interior Cutaway!)
  const drawables: Array<{ sortY: number; draw: () => void }> = [];

  for (const t of tufts) {
    if (t.x < x0 - 24 || t.x > x0 + CW + 24 || t.y < y0 - 24 || t.y > y0 + CH + 24) continue;
    drawables.push({
      sortY: t.y,
      draw: () => {
        const tile = cropFrame(grassSheet, 1, t.row, 24, 24);
        blitAlpha(canvas, tile, Math.round(t.x - x0 - 12), Math.round(t.y - y0 - 20));
      },
    });
  }

  for (const p of props.filter((pr) => pr.layer === 'ysort')) {
    const spr = sprites[p.spriteKey];
    if (!spr) continue;
    drawables.push({
      sortY: p.y,
      draw: () => {
        const dx = Math.round(p.x - x0 - spr.w / 2);
        const dy = Math.round(p.y - y0 + p.offsetY - spr.h / 2);
        blitAlpha(canvas, spr, dx, dy);
        if (showInteriorCutaway && p.id === 'icv_meridian_wreck' && sprites.meridian_interior_bay) {
          const bay = sprites.meridian_interior_bay;
          blitAlpha(canvas, bay, Math.round(p.x - x0 - bay.w / 2 + 12), Math.round(p.y - y0 - bay.h / 2 - 54));
        }
      },
    });
  }

  // Unmodified 88x88 Dr. Mara Lin character sprite (boot anchor offsetY = -31 -> top-left at x-44, y-75!)
  drawables.push({
    sortY: maraY,
    draw: () => {
      blitAlpha(canvas, maraFrame, Math.round(maraX - x0 - 44), Math.round(maraY - y0 - 75));
    },
  });

  // Skittering Mirror-Shell Crabs (ground-sorted)
  for (const fa of getV90CoastalFauna().filter((f) => f.kind === 1)) {
    drawables.push({
      sortY: fa.y,
      draw: () => {
        const crab = cropFrame(faunaSheet, 1, 1, 24, 20);
        blitAlpha(canvas, crab, Math.round(fa.x - x0 - 12), Math.round(fa.y - y0 - 16));
      },
    });
  }

  drawables.sort((a, b) => a.sortY - b.sortY);
  for (const d of drawables) d.draw();

  // 6. Soaring Chime-Wing Gliders above the world!
  for (const fa of getV90CoastalFauna().filter((f) => f.kind === 0)) {
    const bird = cropFrame(faunaSheet, 1, 0, 24, 20);
    blitAlpha(canvas, bird, Math.round(fa.x - x0 - 12), Math.round(fa.y - y0 - 64));
  }

  return canvas;
}

async function main(): Promise<void> {
  fs.mkdirSync(PROD_SPRITES, { recursive: true });
  fs.mkdirSync(PROD_ANIM, { recursive: true });
  fs.mkdirSync(VPF_ROOT, { recursive: true });
  fs.mkdirSync(QA_DIR, { recursive: true });

  console.log('=== V9.0 THE BROKEN SHORE — PRODUCTION ASSET FORGE ===');
  const sprites: Record<string, SpriteBitmap> = {};
  const catalog: AssetCatalogEntry[] = [];

  const registerHeroSprite = (
    id: string,
    rawFile: string,
    componentIdx: number,
    targetW: number,
    targetH: number,
    category: AssetCatalogEntry['category'],
    offsetY: number,
    collisionFootprint: string,
    materialRole: string,
    sceneUses: string[],
    opts?: { generateFlip?: boolean; smallVariant?: { id: string; w: number; h: number; offsetY: number } }
  ): void => {
    const { src, components } = extractForegroundComponents(path.join(RAW_DIR, rawFile));
    if (componentIdx >= components.length) {
      throw new Error(`Expected component ${componentIdx} in ${rawFile}, found ${components.length}`);
    }
    const comp = components[componentIdx];
    const cw = comp.maxX - comp.minX + 1;
    const ch = comp.maxY - comp.minY + 1;
    const bmp = bakeCrispPixelSprite(src, comp, targetW, targetH, true);
    sprites[id] = bmp;

    const prodRel = `game/assets/world/broken_shore/sprites/${id}.png`;
    const vpfRel = `game/assets/_vpf_sources/broken_shore/${id}.vpf.json`;
    savePngRgba(path.join(REPO_ROOT, prodRel), bmp);
    saveEditableVpfSource(path.join(REPO_ROOT, vpfRel), id, bmp, {
      category,
      materialRole,
      pivotOrigin: [Math.round(bmp.w / 2), Math.round(bmp.h / 2 - offsetY)],
      rawSource: rawFile,
      componentIndex: componentIdx,
      rawComponentPixels: comp.pixelCount,
    });

    catalog.push({
      id,
      category,
      productionPath: prodRel,
      vpfSourcePath: vpfRel,
      canvasWidth: bmp.w,
      canvasHeight: bmp.h,
      frameWidth: bmp.w,
      frameHeight: bmp.h,
      frameCount: 1,
      frameOrder: 'single_static',
      pivotOrigin: [Math.round(bmp.w / 2), Math.round(bmp.h / 2 - offsetY)],
      sortingOriginYOffset: offsetY,
      visualHeightPx: measureVisualHeight(bmp),
      collisionFootprint,
      materialRole,
      sceneUses,
      paletteCount: countDistinctColors(bmp),
    });

    if (opts?.generateFlip) {
      sprites[`${id}_flip`] = flipSpriteHorizontal(bmp);
    }

    if (opts?.smallVariant) {
      const sv = opts.smallVariant;
      const smallBmp = bakeCrispPixelSprite(src, comp, sv.w, sv.h, true);
      sprites[sv.id] = smallBmp;
      sprites[`${sv.id}_flip`] = flipSpriteHorizontal(smallBmp);
      const sProdRel = `game/assets/world/broken_shore/sprites/${sv.id}.png`;
      const sVpfRel = `game/assets/_vpf_sources/broken_shore/${sv.id}.vpf.json`;
      savePngRgba(path.join(REPO_ROOT, sProdRel), smallBmp);
      saveEditableVpfSource(path.join(REPO_ROOT, sVpfRel), sv.id, smallBmp, {
        category,
        materialRole,
        derivedFrom: id,
      });
      catalog.push({
        id: sv.id,
        category,
        productionPath: sProdRel,
        vpfSourcePath: sVpfRel,
        canvasWidth: smallBmp.w,
        canvasHeight: smallBmp.h,
        frameWidth: smallBmp.w,
        frameHeight: smallBmp.h,
        frameCount: 1,
        frameOrder: 'single_static',
        pivotOrigin: [Math.round(smallBmp.w / 2), Math.round(smallBmp.h / 2 - sv.offsetY)],
        sortingOriginYOffset: sv.offsetY,
        visualHeightPx: measureVisualHeight(smallBmp),
        collisionFootprint: 'scaled_variant_polygon',
        materialRole,
        sceneUses,
        paletteCount: countDistinctColors(smallBmp),
      });
    }

    console.log(
      `  [HERO] ${id.padEnd(26)} ${String(bmp.w).padStart(3)}x${String(bmp.h).padEnd(3)} (comp#${componentIdx} ${cw}x${ch}, ${countDistinctColors(bmp)} colors)`
    );
  };

  // 1. Extract & quantize all 10 verified modular hero assets!
  registerHeroSprite(
    'meridian_wreck_hull',
    'v90_meridian_wreck_hull.png',
    0, // Giant centerpiece ICV Meridian hull (discards margin turnarounds cleanly!)
    356,
    212,
    'spacecraft',
    -88,
    '3-polygon solid hull/nose/thrusters + open breached aft ramp at (+56..+122, -6..+42)',
    'Terracotta/titanium painted hull plating, scorched ceramic heat tiles, cracked cyan canopy, breached cargo deck',
    ['Zone B: Crash Impact Field (Hero Centerpiece)']
  );

  registerHeroSprite(
    'meridian_interior_bay',
    'v90_meridian_interior_bay.png',
    0,
    228,
    136,
    'spacecraft',
    -42,
    'Walkable interior grating deck revealed when player enters breached aft ramp Area2D',
    'Industrial metal deck grating, cracked cyan nav console, emergency lockers, amber stasis cylinders',
    ['Zone B2: Explorable ICV Meridian Aft Compartment Cutaway']
  );

  registerHeroSprite(
    'meridian_debris_cowling',
    'v90_meridian_debris_cowling.png',
    0,
    118,
    84,
    'spacecraft',
    -34,
    '5-vertex solid debris polygon [-42,-22 .. 48,-4 .. -38,8]',
    'Torn scorched thruster cowling, fused twin retro-nozzles & dangling copper-orange conduits',
    ['Zone B: Impact Trail', 'Zone C: Tidepool Debris Edge'],
    { generateFlip: true }
  );

  // Cleanly split v90_meridian_cargo_pod.png along the diagonal seam into TWO distinct zero-duplication props:
  // (1) Left: UNIT-042 Exploration Cargo Crate ONLY (68x54)
  // (2) Right: Emergency Rescue Beacon Transponder Pod ONLY (44x58)
  {
    const { src, components } = extractForegroundComponents(path.join(RAW_DIR, 'v90_meridian_cargo_pod.png'));
    const full = components[0];
    const bw = full.maxX - full.minX + 1;
    const bh = full.maxY - full.minY + 1;

    const sliceHalf = (keepRight: boolean) => {
      const masked = new Uint8Array(bw * bh);
      let minX = bw, minY = bh, maxX = 0, maxY = 0, count = 0;
      for (let ly = 0; ly < bh; ly++) {
        const gy = full.minY + ly;
        const cutX = Math.round(940 - Math.max(0, gy - 310) * 0.43);
        for (let lx = 0; lx < bw; lx++) {
          const gx = full.minX + lx;
          if (keepRight ? gx < cutX : gx >= cutX) continue;
          if (!full.mask[ly * bw + lx]) continue;
          masked[ly * bw + lx] = 1;
          if (lx < minX) minX = lx;
          if (lx > maxX) maxX = lx;
          if (ly < minY) minY = ly;
          if (ly > maxY) maxY = ly;
          count++;
        }
      }
      const sbw = maxX - minX + 1;
      const sbh = maxY - minY + 1;
      const subMask = new Uint8Array(sbw * sbh);
      for (let y = 0; y < sbh; y++) {
        for (let x = 0; x < sbw; x++) {
          subMask[y * sbw + x] = masked[(minY + y) * bw + (minX + x)];
        }
      }
      return {
        minX: full.minX + minX,
        minY: full.minY + minY,
        maxX: full.minX + maxX,
        maxY: full.minY + maxY,
        pixelCount: count,
        mask: subMask,
        w: sbw,
        h: sbh,
      };
    };

    const crateComp = sliceHalf(false);
    const crateBmp = bakeCrispPixelSprite(src, crateComp, 72, 58, true);
    sprites.meridian_cargo_crate = crateBmp;
    sprites.meridian_cargo_crate_flip = flipSpriteHorizontal(crateBmp);
    const cProdRel = 'game/assets/world/broken_shore/sprites/meridian_cargo_crate.png';
    const cVpfRel = 'game/assets/_vpf_sources/broken_shore/meridian_cargo_crate.vpf.json';
    savePngRgba(path.join(REPO_ROOT, cProdRel), crateBmp);
    saveEditableVpfSource(path.join(REPO_ROOT, cVpfRel), 'meridian_cargo_crate', crateBmp, {
      category: 'spacecraft',
      materialRole: 'Battered Solstice UNIT-042 scientific exploration cargo crate with amber bio-vial rack',
      rawSource: 'v90_meridian_cargo_pod.png',
    });
    catalog.push({
      id: 'meridian_cargo_crate',
      category: 'spacecraft',
      productionPath: cProdRel,
      vpfSourcePath: cVpfRel,
      canvasWidth: crateBmp.w,
      canvasHeight: crateBmp.h,
      frameWidth: crateBmp.w,
      frameHeight: crateBmp.h,
      frameCount: 1,
      frameOrder: 'single_static',
      pivotOrigin: [Math.round(crateBmp.w / 2), Math.round(crateBmp.h / 2 + 22)],
      sortingOriginYOffset: -22,
      visualHeightPx: measureVisualHeight(crateBmp),
      collisionFootprint: '4-vertex solid crate polygon [-24,-14 .. 26,4]',
      materialRole: 'Battered Solstice UNIT-042 scientific exploration cargo crate with amber bio-vial rack',
      sceneUses: ['Zone A: Waking Shore Debris', 'Zone B: Crash Perimeter'],
      paletteCount: countDistinctColors(crateBmp),
    });
    console.log(
      `  [HERO] ${'meridian_cargo_crate'.padEnd(26)} ${String(crateBmp.w).padStart(3)}x${String(crateBmp.h).padEnd(3)} (isolated left crate ${crateComp.w}x${crateComp.h}, ${countDistinctColors(crateBmp)} colors)`
    );

    const beaconComp = sliceHalf(true);
    const beaconBmp = bakeCrispPixelSprite(src, beaconComp, 48, 56, true);
    sprites.meridian_rescue_beacon = beaconBmp;
    const bProdRel = 'game/assets/world/broken_shore/sprites/meridian_rescue_beacon.png';
    const bVpfRel = 'game/assets/_vpf_sources/broken_shore/meridian_rescue_beacon.vpf.json';
    savePngRgba(path.join(REPO_ROOT, bProdRel), beaconBmp);
    saveEditableVpfSource(path.join(REPO_ROOT, bVpfRel), 'meridian_rescue_beacon', beaconBmp, {
      category: 'spacecraft',
      materialRole: 'Orange/titanium orbital rescue transponder dish with cyan LED grid & amber vials',
      rawSource: 'v90_meridian_cargo_pod.png',
    });
    catalog.push({
      id: 'meridian_rescue_beacon',
      category: 'spacecraft',
      productionPath: bProdRel,
      vpfSourcePath: bVpfRel,
      canvasWidth: beaconBmp.w,
      canvasHeight: beaconBmp.h,
      frameWidth: beaconBmp.w,
      frameHeight: beaconBmp.h,
      frameCount: 1,
      frameOrder: 'single_static',
      pivotOrigin: [Math.round(beaconBmp.w / 2), Math.round(beaconBmp.h / 2 + 22)],
      sortingOriginYOffset: -22,
      visualHeightPx: measureVisualHeight(beaconBmp),
      collisionFootprint: '4-vertex solid beacon base [-14,-10 .. 16,4]',
      materialRole: 'Orange/titanium orbital rescue transponder dish with cyan LED grid & blinking strobe',
      sceneUses: ['Zone A: Waking Shore Story Landmark'],
      paletteCount: countDistinctColors(beaconBmp),
    });
    console.log(
      `  [HERO] ${'meridian_rescue_beacon'.padEnd(26)} ${String(beaconBmp.w).padStart(3)}x${String(beaconBmp.h).padEnd(3)} (isolated right pod ${beaconComp.w}x${beaconComp.h}, ${countDistinctColors(beaconBmp)} colors)`
    );
  }

  registerHeroSprite(
    'basalt_cliff_monolith',
    'v90_basalt_cliff_monolith.png',
    0,
    162,
    152,
    'geology',
    -66,
    '5-vertex solid cliff base [-66,-42 .. 72,-6 .. -56,14]',
    'Stratified dark-slate coastal basalt monolith crowned with emerald moss & sunlit lichen',
    ['Zone D: Basalt Shore Headland', 'Zone C: Eastern Cliff Wall', 'Zone F: Inland Gateway Pillars'],
    { generateFlip: true }
  );

  registerHeroSprite(
    'basalt_sea_stack',
    'v90_basalt_sea_stack.png',
    0,
    118,
    152,
    'geology',
    -58,
    'Offshore landmark (beyond deep-water barrier)',
    'Tall weathered offshore basalt sea stack with mossy crown and glistening wet tidal rock collar',
    ['Vast Alien Ocean: Midground & Horizon Sea Stacks'],
    {
      generateFlip: true,
      smallVariant: { id: 'basalt_sea_stack_med', w: 84, h: 108, offsetY: -44 },
    }
  );

  registerHeroSprite(
    'coastal_boulder_cluster',
    'v90_coastal_boulder_cluster.png',
    0,
    108,
    80,
    'geology',
    -32,
    '5-vertex solid boulder cluster [-44,-22 .. 48,-2 .. -40,10]',
    'Barnacle-crusted coastal basalt boulders with turquoise wet bases & orange coastal moss',
    ['Zone C: Tidepool Coast', 'Zone D: Basalt Passage', 'Zone E: Coastal Dune Rocks', 'Offshore Reefs'],
    {
      generateFlip: true,
      smallVariant: { id: 'coastal_boulder_sm', w: 72, h: 54, offsetY: -20 },
    }
  );

  registerHeroSprite(
    'coastal_driftwood_log',
    'v90_coastal_driftwood_log.png',
    0,
    134,
    84,
    'geology',
    -34,
    '5-vertex solid driftwood trunk [-54,-18 .. 58,-4 .. -48,8]',
    'Sun-bleached salt-weathered coastal driftwood with warm ochre sand burrowing & sprouting moss',
    ['Zone A: Waking Shore', 'Zone D: Basalt Shelter', 'Zone E: Dune Crest'],
    { generateFlip: true }
  );

  registerHeroSprite(
    'coastal_salt_shrub',
    'v90_coastal_salt_shrub.png',
    0,
    92,
    74,
    'coastal_flora',
    -30,
    '4-vertex woody stem base [-22,-12 .. 26,2] (small variant walkable sway)',
    'Wind-bent gnarled coastal salt-shrub with sage-emerald foliage & warm golden blossom clusters',
    ['Zone E: Coastal Vegetation Belt', 'Zone F: Inland Gateway Ecotone'],
    {
      generateFlip: true,
      smallVariant: { id: 'coastal_salt_shrub_sm', w: 64, h: 52, offsetY: -22 },
    }
  );

  registerHeroSprite(
    'coastal_succulent',
    'v90_coastal_succulent.png',
    0,
    56,
    54,
    'coastal_flora',
    -22,
    'Walkable ornamental alien flora (reactive sway)',
    'Alien translucent Mirror Glasswort (fl_02) coastal succulent with crystalline cyan-jade tips',
    ['Zone C: Tidepool Coast', 'Zone D: Basalt Shore', 'Zone E: Dune Edge'],
    {
      generateFlip: true,
      smallVariant: { id: 'coastal_succulent_sm', w: 38, h: 36, offsetY: -15 },
    }
  );

  // Load approved V8.0 Forest Ecotone sprites for seamless Zone F continuity (read-only reference!)
  sprites.forest_tree_redwood = loadPngRgba(path.join(V80_SPRITES_DIR, 'full_tree_redwood.png'));
  sprites.forest_tree_redwood_flip = flipSpriteHorizontal(sprites.forest_tree_redwood);
  sprites.forest_tree_rock = loadPngRgba(path.join(V80_SPRITES_DIR, 'full_tree_rock.png'));
  sprites.forest_tree_rock_flip = flipSpriteHorizontal(sprites.forest_tree_rock);
  sprites.forest_fern_cluster = loadPngRgba(path.join(V80_SPRITES_DIR, 'fern_cluster.png'));
  sprites.forest_fern_cluster_flip = flipSpriteHorizontal(sprites.forest_fern_cluster);

  // 2. Build handcrafted native 1:1 animated sprite sheets!
  const grassSheet = buildCoastalLivingGrassAtlas();
  const kelpSheet = buildAmberTideKelpSheet();
  const surfSheet = buildOceanFoamAndBreakAtlas();
  const faunaSheet = buildCoastalFaunaAtlas();
  const fxSheet = buildCoastalFxDecalsAtlas();

  const saveAnim = (
    id: string,
    bmp: SpriteBitmap,
    category: AssetCatalogEntry['category'],
    fw: number,
    fh: number,
    frames: number,
    frameOrder: string,
    materialRole: string,
    sceneUses: string[]
  ): void => {
    const prodRel = `game/assets/world/broken_shore/animated/${id}.png`;
    const vpfRel = `game/assets/_vpf_sources/broken_shore/${id}.vpf.json`;
    savePngRgba(path.join(REPO_ROOT, prodRel), bmp);
    saveEditableVpfSource(path.join(REPO_ROOT, vpfRel), id, bmp, { category, fw, fh, frames, frameOrder, materialRole });
    catalog.push({
      id,
      category,
      productionPath: prodRel,
      vpfSourcePath: vpfRel,
      canvasWidth: bmp.w,
      canvasHeight: bmp.h,
      frameWidth: fw,
      frameHeight: fh,
      frameCount: frames,
      frameOrder,
      pivotOrigin: [Math.round(fw / 2), fh - 2],
      sortingOriginYOffset: -Math.round(fh / 2),
      visualHeightPx: fh,
      collisionFootprint: 'none (animated reactive flora/water/fauna/fx)',
      materialRole,
      sceneUses,
      paletteCount: countDistinctColors(bmp),
    });
    console.log(`  [ANIM] ${id.padEnd(32)} ${bmp.w}x${bmp.h} (${frames} frames of ${fw}x${fh})`);
  };

  saveAnim(
    'coastal_grass_tufts_24x24_6x8',
    grassSheet,
    'coastal_flora',
    24,
    24,
    48,
    '8 species rows x 6 horizontal sway/bend columns (bendL, idle, swayR1, swayR2, gustR, bendR)',
    'Sea oats, salt sedge, dune grass, tidal blossoms, coastal moss, Amber Tide-Kelp tufts, lichen & inland grass',
    ['Zones A–F reactive wind & player-parting coastal flora pool']
  );
  saveAnim(
    'amber_tide_kelp_48x40_4f',
    kelpSheet,
    'coastal_flora',
    48,
    40,
    4,
    '4 horizontal frames cycling smooth underwater ocean swell & glowing honey-amber bladder shimmer',
    'Amber Tide-Kelp (fl_01) luminous coastal kelp colonies anchored in tidepools & translucent shallows',
    ['Zone C: Tidepool Coast', 'Shallow Translucent Reef Margin']
  );
  saveAnim(
    'ocean_surf_foam_64x48_8f',
    surfSheet,
    'ocean_water',
    64,
    48,
    8,
    '8 horizontal frames looping organic shoreline surge wash (top) and basalt rock wave-break spray collar (bottom)',
    'Lacy sea-foam surge bands, turquoise surf crest highlights & rock-impact ocean mist spray',
    ['Organic Shoreline Waterline Contour', 'Offshore Basalt Sea Stacks & Headland Cliffs']
  );
  saveAnim(
    'coastal_fauna_24x20_4x2',
    faunaSheet,
    'fauna',
    24,
    20,
    8,
    'Row 0: 4-frame Chime-Wing Glider (fa_03) wing-beat; Row 1: 4-frame Mirror-Shell Crab (fa_02) tidepool scuttle',
    'Luminous coastal wildlife echoing Oura-IV ecological biodiversity',
    ['Zones A–D sky & tidepool living ambient fauna']
  );
  saveAnim(
    'coastal_fx_decals_16x16_4x3',
    fxSheet,
    'fx',
    16,
    16,
    12,
    'Row 0: dry/wet sand footprints; Row 1: 4-frame shallow-water wade splash & ripple rings; Row 2: crash sparks & beacon strobe',
    'Interactive player traversal decals & crash-site environmental detail',
    ['Sand Footprints', 'Shallow Water Wading Splashes', 'ICV Meridian Electrical Arcs & Rescue Beacon']
  );

  // 3. Build 2304x1536 Broken Shore Terrain & Vast Alien Ocean Floor!
  const props = getV90BrokenShoreProps();
  const terrain = buildV90BrokenShoreTerrain(V80_FLOOR_PATH, props);
  const floorProdRel = 'game/assets/world/broken_shore/v90_broken_shore_floor_2304x1536.png';
  const floorVpfRel = 'game/assets/_vpf_sources/broken_shore/v90_broken_shore_floor_2304x1536.vpf.json';
  savePngRgba(path.join(REPO_ROOT, floorProdRel), terrain.floor);
  saveEditableVpfSource(path.join(REPO_ROOT, floorVpfRel), 'v90_broken_shore_floor_2304x1536', terrain.floor, {
    category: 'terrain',
    originGlobalY: V90_SHORE_ORIGIN_Y,
    unifiedWorldSize: [V90_WORLD_W, 2880],
    ecotoneOverlapY: [1344, 1536],
    stats: terrain.stats,
  });
  catalog.push({
    id: 'v90_broken_shore_floor_2304x1536',
    category: 'terrain',
    productionPath: floorProdRel,
    vpfSourcePath: floorVpfRel,
    canvasWidth: terrain.floor.w,
    canvasHeight: terrain.floor.h,
    frameWidth: terrain.floor.w,
    frameHeight: terrain.floor.h,
    frameCount: 1,
    frameOrder: 'single_world_canvas',
    pivotOrigin: [0, 0],
    sortingOriginYOffset: 0,
    visualHeightPx: terrain.floor.h,
    collisionFootprint: 'organic multi-segment DeepWaterBarrier following waterlineY(x)+40',
    materialRole: '8-zone alien ocean, sunlit reflection column, wet/damp/dry beach sand, 5 tidepools, crash skid trench & V8.0 forest seam',
    sceneUses: ['Unified Production World Ground Layer (y=1344..2880)'],
    paletteCount: countDistinctColors(terrain.floor),
  });
  console.log(
    `  [FLOOR] v90_broken_shore_floor_2304x1536.png (${terrain.stats.botanicalStamps} botanical stamps, ${terrain.stats.embeddedProps} embedded props, ${terrain.stats.livingTufts} living tufts)`
  );

  // 4. Export Runtime Ecosystem JSON & Complete Asset Metadata Catalog!
  const shorelineSamples: number[] = [];
  for (let x = 0; x <= V90_WORLD_W; x += 32) {
    shorelineSamples.push(getBrokenShoreWaterlineY(Math.min(V90_WORLD_W - 1, x)));
  }

  const ecosystemData = {
    version: 'v9.0-broken-shore-production',
    world_w: V90_WORLD_W,
    shore_origin_y: V90_SHORE_ORIGIN_Y,
    shore_h: V90_SHORE_H,
    unified_world_h: 2880,
    spawn: V90_SPAWN_POS,
    shoreline_step_px: 32,
    shoreline_y_samples: shorelineSamples,
    tidepools: V90_TIDEPOOLS,
    amber_kelp: getV90AmberKelpPlacements(),
    tufts: terrain.tufts,
    fauna: getV90CoastalFauna(),
    scan_sites: V90_SCAN_SITES,
    warp_zones: V90_WARP_ZONES,
    walkable_zones: getV90WalkableZones(),
    props: props.map((p) => ({
      id: p.id,
      spriteKey: p.spriteKey,
      x: p.x,
      y: p.y,
      offsetY: p.offsetY,
      layer: p.layer,
      swayKind: p.swayKind ?? 0,
      swayAmp: p.swayAmp ?? 0,
      swayPhase: p.swayPhase ?? 0,
      waveBreakCollar: Boolean(p.waveBreakCollar),
      colliders: p.colliders ?? [],
    })),
  };

  fs.writeFileSync(
    path.join(PROD_ROOT, 'broken_shore_ecosystem_data.json'),
    JSON.stringify(ecosystemData, null, 2),
    'utf8'
  );
  fs.writeFileSync(
    path.join(PROD_ROOT, 'broken_shore_asset_catalog.json'),
    JSON.stringify(
      {
        version: 'V9.0-BROKEN-SHORE',
        masterPaletteHex: V90_MASTER_HEX,
        totalAssets: catalog.length,
        entries: catalog,
      },
      null,
      2
    ),
    'utf8'
  );

  // 5. Render Mandatory Multi-Pass QA Inspection Boards (640x360 Real-Camera 1x & 2x Crops + Sprite Sheet!)
  const v80Floor = loadPngRgba(V80_FLOOR_PATH);
  const maraSheet = loadPngRgba(MARA_IDLE_PATH);
  const maraEast = cropFrame(maraSheet, 0, 2, 88, 88);
  const maraNorth = cropFrame(maraSheet, 0, 1, 88, 88);

  const qaViews = [
    { name: 'qa_01_zoneA_waking_shore', cx: 880, cy: 2340, mx: 748, my: 2288, mara: maraEast, interior: false },
    { name: 'qa_02_zoneB_meridian_crash_hero', cx: 1264, cy: 2220, mx: 1172, my: 2248, mara: maraEast, interior: false },
    { name: 'qa_03_zoneB2_meridian_interior_bay', cx: 1344, cy: 2178, mx: 1384, my: 2212, mara: maraNorth, interior: true },
    { name: 'qa_04_zoneC_tidepool_coast', cx: 1764, cy: 2214, mx: 1712, my: 2178, mara: maraEast, interior: false },
    { name: 'qa_05_zoneD_basalt_shore_ocean', cx: 560, cy: 2340, mx: 576, my: 2196, mara: maraEast, interior: false },
    { name: 'qa_06_zoneF_inland_gateway_v80_seam', cx: 1142, cy: 1476, mx: 1142, my: 1516, mara: maraNorth, interior: false },
    { name: 'qa_07_vast_alien_ocean_horizon', cx: 740, cy: 2560, mx: 748, my: 2386, mara: maraEast, interior: false },
  ];

  for (const v of qaViews) {
    const frame1x = renderCameraCrop(
      terrain.floor,
      v80Floor,
      sprites,
      grassSheet,
      kelpSheet,
      surfSheet,
      faunaSheet,
      v.mara,
      props,
      terrain.tufts,
      v.cx,
      v.cy,
      v.mx,
      v.my,
      v.interior
    );
    savePngRgba(path.join(QA_DIR, `${v.name}_1x.png`), frame1x);
    savePngRgba(path.join(QA_DIR, `${v.name}_2x.png`), upscaleNearest(frame1x, 2));
  }

  // Render full-asset QA sprite board side-by-side with unmodified Dr. Mara Lin for exact scale & cluster audit!
  const sheetW = 920;
  const sheetH = 620;
  const board = createBitmap(sheetW, sheetH);
  for (let i = 0; i < board.rgba.length; i += 4) {
    board.rgba[i] = 36;
    board.rgba[i + 1] = 46;
    board.rgba[i + 2] = 60;
    board.rgba[i + 3] = 255;
  }
  blitAlpha(board, maraEast, 16, 16);
  blitAlpha(board, sprites.meridian_wreck_hull, 112, 12);
  blitAlpha(board, sprites.meridian_interior_bay, 488, 36);
  blitAlpha(board, sprites.meridian_debris_cowling, 742, 46);
  blitAlpha(board, sprites.meridian_cargo_crate, 742, 146);
  blitAlpha(board, sprites.meridian_rescue_beacon, 824, 148);
  blitAlpha(board, sprites.basalt_cliff_monolith, 20, 240);
  blitAlpha(board, sprites.basalt_sea_stack, 198, 240);
  blitAlpha(board, sprites.coastal_boulder_cluster, 336, 268);
  blitAlpha(board, sprites.coastal_driftwood_log, 462, 266);
  blitAlpha(board, sprites.coastal_salt_shrub, 612, 272);
  blitAlpha(board, sprites.coastal_succulent, 720, 286);
  blitAlpha(board, kelpSheet, 20, 412);
  blitAlpha(board, surfSheet, 20, 468);
  blitAlpha(board, grassSheet, 556, 396);
  blitAlpha(board, faunaSheet, 724, 412);
  blitAlpha(board, fxSheet, 724, 468);
  savePngRgba(path.join(QA_DIR, 'qa_00_master_asset_board.png'), board);

  console.log(`=== DONE! Exported ${catalog.length} production assets + 7 QA inspection renders to ${QA_DIR} ===`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
