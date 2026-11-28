import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  type SpriteBitmap,
  V90_MASTER_HEX,
  saveEditableVpfSource,
  savePngRgba,
} from '../v90_broken_shore/v90PaletteAndExtractor';
import {
  V100_ECOLOGICAL_SITES,
  V90_SCAN_SITES,
  V90_SHORE_H,
  V90_SHORE_ORIGIN_Y,
  V90_SPAWN_POS,
  V90_TIDEPOOLS,
  V90_UNIFIED_WORLD_H,
  V90_WARP_ZONES,
  V90_WORLD_W,
  getBrokenShoreWaterlineY,
  getV90AmberKelpPlacements,
  getV90BrokenShoreProps,
  getV90CoastalFauna,
  getV90WalkableZones,
} from '../v90_broken_shore/v90BrokenShoreWorldDef';
import { buildV90BrokenShoreTerrain } from '../v90_broken_shore/v90BrokenShoreTerrain';
import { buildOceanFoamAndBreakAtlas } from '../v90_broken_shore/v90CoastalFloraAndWaterSprites';
import {
  buildAncientWaymarkerStoneSprite,
  buildCoastalBiolumCoralSprite,
  buildCoastalCanopyFernSprite,
  buildCoastalSporeMothsAtlas,
  buildMeridianFieldRelaySprite,
  buildMeridianSpecimenPodSprite,
  buildEcotoneMossBoulderSprite,
} from './v100StoryAndFloraSprites';
import { buildRefinedV100ForestFloor } from './v100ForestFloorPolish';

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
const PROD_ROOT = path.join(REPO_ROOT, 'game/assets/world/broken_shore');
const PROD_SPRITES = path.join(PROD_ROOT, 'sprites');
const PROD_ANIM = path.join(PROD_ROOT, 'animated');
const VPF_ROOT = path.join(REPO_ROOT, 'game/assets/_vpf_sources/broken_shore');
const V80_FLOOR_PATH = path.join(REPO_ROOT, 'game/assets/world/living_forest/sprites/v80_living_floor_2304x1536.png');

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

function main(): void {
  console.log('=== VERDANT SIGNAL V10.0 — LIVING WORLD EVOLUTION BUILDER ===');

  // 1. Refine V8.0 Living Forest Floor idempotently from baseline 7499163
  console.log('[1/4] Refining V8.0 Living Forest floor (southern trail spur, spring pools, trail fringes)...');
  buildRefinedV100ForestFloor(REPO_ROOT);

  // 2. Build & save 7 handcrafted V10.0 storytelling, botanical & fauna assets (+ editable .vpf.json!)
  console.log('[2/4] Crafting 7 new V10.0 handcrafted sprites + editable .vpf.json sources...');
  const newAssets: Array<{
    id: string;
    category: AssetCatalogEntry['category'];
    bmp: SpriteBitmap;
    subdir: 'sprites' | 'animated';
    filename: string;
    fw: number;
    fh: number;
    frameCount: number;
    frameOrder: string;
    pivot: [number, number];
    sortOffY: number;
    footprint: string;
    materialRole: string;
    sceneUses: string[];
  }> = [
    {
      id: 'meridian_field_relay',
      category: 'spacecraft',
      bmp: buildMeridianFieldRelaySprite(),
      subdir: 'sprites',
      filename: 'meridian_field_relay.png',
      fw: 64, fh: 76, frameCount: 1, frameOrder: 'static',
      pivot: [32, 68], sortOffY: -34,
      footprint: 'polygon 36x14',
      materialRole: 'solid_debris',
      sceneUses: ['Zone B Crash Site Telemetry Uplink'],
    },
    {
      id: 'meridian_specimen_pod',
      category: 'spacecraft',
      bmp: buildMeridianSpecimenPodSprite(),
      subdir: 'sprites',
      filename: 'meridian_specimen_pod.png',
      fw: 56, fh: 44, frameCount: 1, frameOrder: 'static',
      pivot: [28, 36], sortOffY: -18,
      footprint: 'polygon 42x13',
      materialRole: 'solid_debris',
      sceneUses: ['Zone B Aft Bay Spilled Bio-Specimen Canister'],
    },
    {
      id: 'ancient_waymarker_stone',
      category: 'geology',
      bmp: buildAncientWaymarkerStoneSprite(),
      subdir: 'sprites',
      filename: 'ancient_waymarker_stone.png',
      fw: 72, fh: 92, frameCount: 1, frameOrder: 'static',
      pivot: [36, 82], sortOffY: -40,
      footprint: 'polygon 42x20',
      materialRole: 'solid_rock',
      sceneUses: ['Zone F Inland Gateway Ancient Harmonic Waymarker'],
    },
    {
      id: 'ecotone_moss_boulder',
      category: 'geology',
      bmp: buildEcotoneMossBoulderSprite(),
      subdir: 'sprites',
      filename: 'ecotone_moss_boulder.png',
      fw: 84, fh: 62, frameCount: 1, frameOrder: 'static',
      pivot: [42, 53], sortOffY: -26,
      footprint: 'polygon 72x28',
      materialRole: 'solid_rock',
      sceneUses: ['Zone E & F Coastal-to-Forest Ecotone Moss Outcrops'],
    },
    {
      id: 'coastal_biolum_coral',
      category: 'coastal_flora',
      bmp: buildCoastalBiolumCoralSprite(),
      subdir: 'sprites',
      filename: 'coastal_biolum_coral.png',
      fw: 48, fh: 42, frameCount: 1, frameOrder: 'static',
      pivot: [24, 37], sortOffY: -16,
      footprint: 'walkable_tidepool_flora',
      materialRole: 'tidepool_coral',
      sceneUses: ['Zone C & D Alien Tidepool Marine Reefs'],
    },
    {
      id: 'coastal_canopy_fern_clump',
      category: 'coastal_flora',
      bmp: buildCoastalCanopyFernSprite(),
      subdir: 'sprites',
      filename: 'coastal_canopy_fern_clump.png',
      fw: 64, fh: 50, frameCount: 1, frameOrder: 'static',
      pivot: [32, 43], sortOffY: -20,
      footprint: 'walkable_understory',
      materialRole: 'coastal_flora',
      sceneUses: ['Zone E & F Coastal Ecotone Understory'],
    },
    {
      id: 'coastal_spore_moths',
      category: 'fauna',
      bmp: buildCoastalSporeMothsAtlas(),
      subdir: 'animated',
      filename: 'coastal_spore_moths_16x16_4x2.png',
      fw: 16, fh: 16, frameCount: 8, frameOrder: 'row0=cyan_spore_moth(4f);row1=amber_dune_moth(4f)',
      pivot: [8, 8], sortOffY: 0,
      footprint: 'aerial_ambient_fauna',
      materialRole: 'coastal_fauna',
      sceneUses: ['Zones B, C, E, F Ambient Living Wildlife'],
    },
  ];

  // Load existing V9.0 catalog and preserve all 21 original entries cleanly
  const catalogPath = path.join(PROD_ROOT, 'broken_shore_asset_catalog.json');
  const existingCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8')) as {
    version: string;
    masterPaletteHex: string[];
    totalAssets: number;
    entries: AssetCatalogEntry[];
  };
  const newIds = new Set(newAssets.map((a) => a.id));
  const preservedEntries = existingCatalog.entries.filter((e) => !newIds.has(e.id));

  for (const a of newAssets) {
    const outPng = path.join(a.subdir === 'sprites' ? PROD_SPRITES : PROD_ANIM, a.filename);
    const outVpf = path.join(VPF_ROOT, `${a.id}.vpf.json`);
    savePngRgba(outPng, a.bmp);
    saveEditableVpfSource(outVpf, a.id, a.bmp, {
      category: a.category,
      frameWidth: a.fw,
      frameHeight: a.fh,
      frameCount: a.frameCount,
      version: 'V10.0',
    });
    preservedEntries.push({
      id: a.id,
      category: a.category,
      productionPath: `game/assets/world/broken_shore/${a.subdir}/${a.filename}`,
      vpfSourcePath: `game/assets/_vpf_sources/broken_shore/${a.id}.vpf.json`,
      canvasWidth: a.bmp.w,
      canvasHeight: a.bmp.h,
      frameWidth: a.fw,
      frameHeight: a.fh,
      frameCount: a.frameCount,
      frameOrder: a.frameOrder,
      pivotOrigin: a.pivot,
      sortingOriginYOffset: a.sortOffY,
      visualHeightPx: measureVisualHeight(a.bmp),
      collisionFootprint: a.footprint,
      materialRole: a.materialRole,
      sceneUses: a.sceneUses,
      paletteCount: countDistinctColors(a.bmp),
    });
  }

  // Update ocean surf foam & breaking-wave atlas (organic seaward splash plumes!)
  const surfFoam = buildOceanFoamAndBreakAtlas();
  savePngRgba(path.join(PROD_ANIM, 'ocean_surf_foam_64x48_8f.png'), surfFoam);
  saveEditableVpfSource(
    path.join(VPF_ROOT, 'ocean_surf_foam_64x48_8f.vpf.json'),
    'ocean_surf_foam_64x48_8f',
    surfFoam,
    { category: 'ocean_water', frameWidth: 64, frameHeight: 24, frameCount: 16, version: 'V10.0' }
  );
  const surfEntry = preservedEntries.find((e) => e.id === 'ocean_surf_foam_64x48_8f');
  if (surfEntry) surfEntry.paletteCount = countDistinctColors(surfFoam);

  // 3. Rebuild artisanal 2304x1536 Broken Shore terrain & seamless ecotone!
  console.log('[3/4] Sculpting V10.0 artisanal 2304x1536 Broken Shore terrain, tidepools, wrack line & ecotone...');
  const props = getV90BrokenShoreProps();
  const terrain = buildV90BrokenShoreTerrain(V80_FLOOR_PATH, props);
  const floorPngPath = path.join(PROD_ROOT, 'v90_broken_shore_floor_2304x1536.png');
  const floorVpfPath = path.join(VPF_ROOT, 'v90_broken_shore_floor_2304x1536.vpf.json');
  savePngRgba(floorPngPath, terrain.floor);
  saveEditableVpfSource(floorVpfPath, 'v90_broken_shore_floor_2304x1536', terrain.floor, {
    category: 'terrain',
    frameWidth: 2304,
    frameHeight: 1536,
    frameCount: 1,
    version: 'V10.0',
  });

  // Update terrain paletteCount in catalog
  const floorEntry = preservedEntries.find((e) => e.id === 'v90_broken_shore_floor');
  if (floorEntry) {
    floorEntry.paletteCount = countDistinctColors(terrain.floor);
  }

  const updatedCatalog = {
    version: 'V10.0_LIVING_WORLD_EVOLUTION',
    masterPaletteHex: V90_MASTER_HEX,
    totalAssets: preservedEntries.length,
    entries: preservedEntries,
  };
  fs.writeFileSync(catalogPath, JSON.stringify(updatedCatalog, null, 2));

  // 4. Write updated broken_shore_ecosystem_data.json
  console.log('[4/4] Writing V10.0 broken_shore_ecosystem_data.json...');
  const shorelineStep = 16;
  const shorelineSamples: number[] = [];
  for (let x = 0; x <= V90_WORLD_W; x += shorelineStep) {
    shorelineSamples.push(getBrokenShoreWaterlineY(Math.min(V90_WORLD_W - 1, x)));
  }

  const ecosystemData = {
    version: 'V10.0_LIVING_WORLD_EVOLUTION',
    world_w: V90_WORLD_W,
    shore_origin_y: V90_SHORE_ORIGIN_Y,
    shore_h: V90_SHORE_H,
    unified_world_h: V90_UNIFIED_WORLD_H,
    spawn: V90_SPAWN_POS,
    shoreline_step_px: shorelineStep,
    shoreline_y_samples: shorelineSamples,
    tidepools: V90_TIDEPOOLS,
    amber_kelp: getV90AmberKelpPlacements(),
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
    walkable_zones: getV90WalkableZones(),
    tufts: terrain.tufts,
    fauna: getV90CoastalFauna(),
    scan_sites: V90_SCAN_SITES,
    v100_ecological_sites: V100_ECOLOGICAL_SITES,
    warp_zones: V90_WARP_ZONES,
  };

  fs.writeFileSync(
    path.join(PROD_ROOT, 'broken_shore_ecosystem_data.json'),
    JSON.stringify(ecosystemData, null, 2)
  );

  console.log(
    `DONE! Assets=${updatedCatalog.totalAssets}, Props=${props.length}, Tufts=${terrain.tufts.length}, BotanicalStamps=${terrain.stats.botanicalStamps}, Fauna=${ecosystemData.fauna.length}`
  );
}

main();
