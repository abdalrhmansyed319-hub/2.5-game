import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  type SpriteBitmap,
  flipSpriteHorizontal,
  loadPngRgba,
  savePngRgba,
} from '../v90_broken_shore/v90PaletteAndExtractor';

const REPO_ROOT = path.resolve(process.cwd(), '../..');
const GAME_ROOT = path.join(REPO_ROOT, 'game');

interface DrawItem {
  sortY: number;
  draw: (dst: SpriteBitmap, x0: number, y0: number) => void;
}

function createBitmap(w: number, h: number): SpriteBitmap {
  return { w, h, rgba: new Uint8Array(w * h * 4) };
}

function blitAlpha(dst: SpriteBitmap, src: SpriteBitmap, dx: number, dy: number, alphaMul = 1.0): void {
  const ix0 = Math.round(dx);
  const iy0 = Math.round(dy);
  for (let sy = 0; sy < src.h; sy++) {
    const ty = iy0 + sy;
    if (ty < 0 || ty >= dst.h) continue;
    for (let sx = 0; sx < src.w; sx++) {
      const tx = ix0 + sx;
      if (tx < 0 || tx >= dst.w) continue;
      const si = (sy * src.w + sx) * 4;
      const a = Math.round(src.rgba[si + 3] * alphaMul);
      if (a <= 2) continue;
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

function cropRegion(sheet: SpriteBitmap, col: number, row: number, fw: number, fh: number): SpriteBitmap {
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

function downscaleBox2x(src: SpriteBitmap): SpriteBitmap {
  const ow = Math.floor(src.w / 2);
  const oh = Math.floor(src.h / 2);
  const out = createBitmap(ow, oh);
  for (let y = 0; y < oh; y++) {
    for (let x = 0; x < ow; x++) {
      let r = 0, g = 0, b = 0;
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const si = ((y * 2 + dy) * src.w + (x * 2 + dx)) * 4;
          r += src.rgba[si];
          g += src.rgba[si + 1];
          b += src.rgba[si + 2];
        }
      }
      const di = (y * ow + x) * 4;
      out.rgba[di] = r >> 2;
      out.rgba[di + 1] = g >> 2;
      out.rgba[di + 2] = b >> 2;
      out.rgba[di + 3] = 255;
    }
  }
  return out;
}

interface ParsedForestSprite {
  name: string;
  parent: string;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  texPath: string;
}

function parseForestTscn(tscnPath: string): {
  ysortSprites: ParsedForestSprite[];
  canopySprites: ParsedForestSprite[];
} {
  const txt = fs.readFileSync(tscnPath, 'utf8');
  const extMap = new Map<string, string>();
  const extRegex = /\[ext_resource[^\]]*path="res:\/\/([^"]+)"[^\]]*id="([^"]+)"\]/g;
  let m: RegExpExecArray | null;
  while ((m = extRegex.exec(txt)) !== null) {
    extMap.set(m[2], path.join(GAME_ROOT, m[1]));
  }

  // Track StaticBody2D parent positions under YSortWorld
  const parentPos = new Map<string, { x: number; y: number }>();
  const blocks = txt.split(/\n(?=\[node )/);
  const ysortSprites: ParsedForestSprite[] = [];
  const canopySprites: ParsedForestSprite[] = [];

  for (const b of blocks) {
    const hdr = b.match(/^\[node name="([^"]+)" type="([^"]+)" parent="([^"]+)"\]/);
    if (!hdr) continue;
    const [, name, type, parent] = hdr;
    const posM = b.match(/position = Vector2\(([^,]+),\s*([^)]+)\)/);
    const offM = b.match(/offset = Vector2\(([^,]+),\s*([^)]+)\)/);
    const texM = b.match(/texture = ExtResource\("([^"]+)"\)/);
    const px = posM ? parseFloat(posM[1]) : 0;
    const py = posM ? parseFloat(posM[2]) : 0;
    const ox = offM ? parseFloat(offM[1]) : 0;
    const oy = offM ? parseFloat(offM[2]) : 0;

    if (parent === 'YSortWorld' && type === 'StaticBody2D') {
      parentPos.set(`YSortWorld/${name}`, { x: px, y: py });
    }
    if (type === 'Sprite2D' && texM) {
      const texPath = extMap.get(texM[1]);
      if (!texPath || !fs.existsSync(texPath)) continue;
      if (parent === 'YSortWorld') {
        ysortSprites.push({ name, parent, x: px, y: py, offsetX: ox, offsetY: oy, texPath });
      } else if (parent.startsWith('YSortWorld/')) {
        const pp = parentPos.get(parent) ?? { x: 0, y: 0 };
        ysortSprites.push({ name, parent, x: pp.x + px, y: pp.y + py, offsetX: ox, offsetY: oy, texPath });
      } else if (parent === 'CanopyLayer' || parent === 'PerimeterCanopyLayer') {
        canopySprites.push({ name, parent, x: px, y: py, offsetX: ox, offsetY: oy, texPath });
      }
    }
  }
  return { ysortSprites, canopySprites };
}

export function renderUnifiedProductionWorld(outDir: string, prefix: string): void {
  fs.mkdirSync(outDir, { recursive: true });
  const W = 2304;
  const H = 2880;
  const world = createBitmap(W, H);

  const texCache = new Map<string, SpriteBitmap>();
  const getTex = (absPath: string, flip = false): SpriteBitmap => {
    const key = `${absPath}|${flip ? 1 : 0}`;
    const c = texCache.get(key);
    if (c) return c;
    const base = texCache.get(`${absPath}|0`) ?? loadPngRgba(absPath);
    texCache.set(`${absPath}|0`, base);
    const res = flip ? flipSpriteHorizontal(base) : base;
    texCache.set(key, res);
    return res;
  };

  // 1. Composite ACTUAL production ForestFloor (0..1536) + BrokenShoreFloor (1344..2880)!
  const v80Floor = getTex(path.join(GAME_ROOT, 'assets/world/living_forest/sprites/v80_living_floor_2304x1536.png'));
  const v90Floor = getTex(path.join(GAME_ROOT, 'assets/world/broken_shore/v90_broken_shore_floor_2304x1536.png'));
  blitAlpha(world, v80Floor, 0, 0);
  blitAlpha(world, v90Floor, 0, 1344);

  // Load actual ecosystem JSONs
  const forestEco = JSON.parse(
    fs.readFileSync(path.join(GAME_ROOT, 'assets/world/living_forest/data/living_ecosystem_data.json'), 'utf8')
  ) as {
    tufts: Array<{ x: number; y: number; row: number }>;
    critters: Array<{ x: number; y: number; kind: number }>;
  };

  const shoreEco = JSON.parse(
    fs.readFileSync(path.join(GAME_ROOT, 'assets/world/broken_shore/broken_shore_ecosystem_data.json'), 'utf8')
  ) as {
    shoreline_step_px: number;
    shoreline_y_samples: number[];
    amber_kelp: Array<{ x: number; y: number; phase: number }>;
    tufts: Array<{ x: number; y: number; row: number }>;
    fauna: Array<{ kind: number; x: number; y: number }>;
    props: Array<{
      id: string;
      spriteKey: string;
      x: number;
      y: number;
      offsetY: number;
      layer: string;
      waveBreakCollar?: boolean;
    }>;
  };

  const shoreSpriteMap: Record<string, string> = {
    meridian_wreck_hull: 'assets/world/broken_shore/sprites/meridian_wreck_hull.png',
    meridian_interior_bay: 'assets/world/broken_shore/sprites/meridian_interior_bay.png',
    meridian_debris_cowling: 'assets/world/broken_shore/sprites/meridian_debris_cowling.png',
    meridian_cargo_crate: 'assets/world/broken_shore/sprites/meridian_cargo_crate.png',
    meridian_rescue_beacon: 'assets/world/broken_shore/sprites/meridian_rescue_beacon.png',
    basalt_cliff_monolith: 'assets/world/broken_shore/sprites/basalt_cliff_monolith.png',
    basalt_sea_stack: 'assets/world/broken_shore/sprites/basalt_sea_stack.png',
    basalt_sea_stack_med: 'assets/world/broken_shore/sprites/basalt_sea_stack_med.png',
    coastal_boulder_cluster: 'assets/world/broken_shore/sprites/coastal_boulder_cluster.png',
    coastal_boulder_sm: 'assets/world/broken_shore/sprites/coastal_boulder_sm.png',
    coastal_driftwood_log: 'assets/world/broken_shore/sprites/coastal_driftwood_log.png',
    coastal_salt_shrub: 'assets/world/broken_shore/sprites/coastal_salt_shrub.png',
    coastal_salt_shrub_sm: 'assets/world/broken_shore/sprites/coastal_salt_shrub_sm.png',
    coastal_succulent: 'assets/world/broken_shore/sprites/coastal_succulent.png',
    coastal_succulent_sm: 'assets/world/broken_shore/sprites/coastal_succulent_sm.png',
    forest_tree_redwood: 'assets/world/living_forest/sprites/full_tree_redwood.png',
    forest_tree_rock: 'assets/world/living_forest/sprites/full_tree_rock.png',
    forest_fern_cluster: 'assets/world/living_forest/sprites/fern_cluster.png',
    // V10.0 optional new sprites auto-discovered if present!
    coastal_reed_arch: 'assets/world/broken_shore/sprites/coastal_reed_arch.png',
    meridian_data_relay: 'assets/world/broken_shore/sprites/meridian_data_relay.png',
    coastal_biolum_coral: 'assets/world/broken_shore/sprites/coastal_biolum_coral.png',
    coastal_tidal_rib: 'assets/world/broken_shore/sprites/coastal_tidal_rib.png',
    ecotone_moss_boulder: 'assets/world/broken_shore/sprites/ecotone_moss_boulder.png',
  };

  // Helper to sample shoreline Y from JSON
  const sampleWaterlineY = (wx: number): number => {
    const step = shoreEco.shoreline_step_px;
    const arr = shoreEco.shoreline_y_samples;
    const fx = Math.max(0, Math.min(arr.length - 1, wx / step));
    const i0 = Math.floor(fx);
    const i1 = Math.min(arr.length - 1, i0 + 1);
    const t = fx - i0;
    return arr[i0] * (1 - t) + arr[i1] * t;
  };

  // 2. Shoreline Surf Ribbons & Ocean Props
  const surfSheet = getTex(path.join(GAME_ROOT, 'assets/world/broken_shore/animated/ocean_surf_foam_64x48_8f.png'));
  const kelpSheet = getTex(path.join(GAME_ROOT, 'assets/world/broken_shore/animated/amber_tide_kelp_48x40_4f.png'));
  const shoreTuftSheet = getTex(path.join(GAME_ROOT, 'assets/world/broken_shore/animated/coastal_grass_tufts_24x24_6x8.png'));
  const forestTuftSheet = getTex(path.join(GAME_ROOT, 'assets/world/living_forest/sprites/living_grass_tufts_24x24_6x8.png'));
  const shoreFaunaSheet = getTex(path.join(GAME_ROOT, 'assets/world/broken_shore/animated/coastal_fauna_24x20_4x2.png'));

  for (let gx = 32; gx < 2272; gx += 52) {
    const sy = sampleWaterlineY(gx);
    const f = Math.floor(gx / 52) % 8;
    const foam = cropRegion(surfSheet, f, 0, 64, 24);
    blitAlpha(world, foam, gx - 32, sy - 8);
  }

  for (const p of shoreEco.props) {
    if (p.layer !== 'ocean_prop') continue;
    const flip = p.spriteKey.endsWith('_flip');
    const baseKey = flip ? p.spriteKey.slice(0, -5) : p.spriteKey;
    const rel = shoreSpriteMap[baseKey];
    if (!rel) continue;
    const abs = path.join(GAME_ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    const tex = getTex(abs, flip);
    blitAlpha(world, tex, p.x - tex.w / 2, p.y + p.offsetY - tex.h / 2);
    if (p.waveBreakCollar) {
      const collar = cropRegion(surfSheet, 2, 1, 64, 24);
      blitAlpha(world, collar, p.x - 32, p.y - 8);
    }
  }

  for (const ak of shoreEco.amber_kelp) {
    const f = Math.floor(ak.phase) % 4;
    const k = cropRegion(kelpSheet, f, 0, 48, 40);
    blitAlpha(world, k, ak.x - 24, ak.y - 26);
  }

  // 3. Build Unified YSortWorld Draw List (EXACT mirror of real RimlandsPrototype!)
  const draws: DrawItem[] = [];
  const forestParsed = parseForestTscn(path.join(GAME_ROOT, 'world/living_forest/verdant_living_forest.tscn'));

  for (const sp of forestParsed.ysortSprites) {
    const tex = getTex(sp.texPath);
    draws.push({
      sortY: sp.y,
      draw: (dst) => blitAlpha(dst, tex, sp.x + sp.offsetX - tex.w / 2, sp.y + sp.offsetY - tex.h / 2),
    });
  }

  for (const t of forestEco.tufts) {
    draws.push({
      sortY: t.y,
      draw: (dst) => {
        const tile = cropRegion(forestTuftSheet, 0, Math.min(7, t.row), 24, 24);
        blitAlpha(dst, tile, t.x - 12, t.y - 21);
      },
    });
  }

  for (const p of shoreEco.props) {
    if (p.layer !== 'ysort') continue;
    const flip = p.spriteKey.endsWith('_flip');
    const baseKey = flip ? p.spriteKey.slice(0, -5) : p.spriteKey;
    const rel = shoreSpriteMap[baseKey];
    if (!rel) continue;
    const abs = path.join(GAME_ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    const tex = getTex(abs, flip);
    draws.push({
      sortY: p.y,
      draw: (dst) => blitAlpha(dst, tex, p.x - tex.w / 2, p.y + p.offsetY - tex.h / 2),
    });
  }

  for (const t of shoreEco.tufts) {
    draws.push({
      sortY: t.y,
      draw: (dst) => {
        const tile = cropRegion(shoreTuftSheet, 1, Math.min(7, t.row), 24, 24);
        blitAlpha(dst, tile, t.x - 12, t.y - 21);
      },
    });
  }

  for (const fa of shoreEco.fauna) {
    if (fa.kind !== 1) continue;
    draws.push({
      sortY: fa.y,
      draw: (dst) => {
        const crab = cropRegion(shoreFaunaSheet, 1, 1, 24, 20);
        blitAlpha(dst, crab, fa.x - 12, fa.y - 16);
      },
    });
  }

  draws.sort((a, b) => a.sortY - b.sortY);
  for (const d of draws) d.draw(world, 0, 0);

  // 4. Overhead Canopy & Perimeter Canopy from V8.0 Forest + Soaring Chime-Wing Gliders
  for (const cp of forestParsed.canopySprites) {
    const tex = getTex(cp.texPath);
    blitAlpha(world, tex, cp.x + cp.offsetX - tex.w / 2, cp.y + cp.offsetY - tex.h / 2);
  }
  for (const fa of shoreEco.fauna) {
    if (fa.kind !== 0) continue;
    const glider = cropRegion(shoreFaunaSheet, 1, 0, 24, 20);
    blitAlpha(world, glider, fa.x - 12, fa.y - 64);
  }

  // Save Full World Overview (0.5x = 1152x1440)
  savePngRgba(path.join(outDir, `${prefix}_01_full_world_overview.png`), downscaleBox2x(world));

  // Save 7 native 640x360 gameplay camera crops (2x nearest = 1280x720) with unmodified Dr. Mara Lin!
  const maraSheet = getTex(path.join(GAME_ROOT, 'assets/characters/player/mara_original/char_idle_88x88_8x4.png'));
  const maraE = cropRegion(maraSheet, 0, 2, 88, 88);
  const maraN = cropRegion(maraSheet, 0, 1, 88, 88);

  const views = [
    { name: '02_forest_hub', cx: 1024, cy: 822, mx: 1024, my: 822, mara: maraE },
    { name: '03_forest_chime_pools', cx: 1620, cy: 830, mx: 1618, my: 824, mara: maraE },
    { name: '04_forest_to_shore_transition', cx: 1142, cy: 1580, mx: 1142, my: 1510, mara: maraN },
    { name: '05_coastal_veg_belt', cx: 1180, cy: 1860, mx: 1168, my: 1840, mara: maraN },
    { name: '06_waking_shore_spawn', cx: 880, cy: 2330, mx: 748, my: 2288, mara: maraE },
    { name: '07_meridian_crash_site', cx: 1280, cy: 2208, mx: 1178, my: 2248, mara: maraE },
    { name: '08_tidepool_coast', cx: 1764, cy: 2208, mx: 1712, my: 2178, mara: maraE },
    { name: '09_basalt_shore_ocean', cx: 610, cy: 2380, mx: 576, my: 2196, mara: maraE },
  ];

  for (const v of views) {
    const crop = createBitmap(640, 360);
    const x0 = Math.round(v.cx - 320);
    const y0 = Math.round(v.cy - 180);
    for (let y = 0; y < 360; y++) {
      for (let x = 0; x < 640; x++) {
        const sx = Math.max(0, Math.min(W - 1, x0 + x));
        const sy = Math.max(0, Math.min(H - 1, y0 + y));
        const si = (sy * W + sx) * 4;
        const di = (y * 640 + x) * 4;
        crop.rgba[di] = world.rgba[si];
        crop.rgba[di + 1] = world.rgba[si + 1];
        crop.rgba[di + 2] = world.rgba[si + 2];
        crop.rgba[di + 3] = 255;
      }
    }
    blitAlpha(crop, v.mara, v.mx - x0 - 44, v.my - y0 - 75);
    savePngRgba(path.join(outDir, `${prefix}_${v.name}_2x.png`), upscaleNearest(crop, 2));
  }
  console.log(`Rendered unified production atlas + ${views.length} gameplay crops -> ${outDir}`);
}

const args = process.argv.slice(2);
const out = args[0] ?? '/tmp/v100_qa/before';
const pref = args[1] ?? 'before';
renderUnifiedProductionWorld(out, pref);
