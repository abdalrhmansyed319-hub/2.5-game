import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { describe, it, expect } from 'vitest';
import { loadPngRgba } from '../v90_broken_shore/v90PaletteAndExtractor';

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const GAME_ROOT = path.join(REPO_ROOT, 'game');
const SHORE_ROOT = path.join(GAME_ROOT, 'assets/world/broken_shore');
const FOREST_ROOT = path.join(GAME_ROOT, 'assets/world/living_forest');
const VPF_SHORE_ROOT = path.join(GAME_ROOT, 'assets/_vpf_sources/broken_shore');

function rgbHex(r: number, g: number, b: number): string {
  return (
    '#' +
    r.toString(16).padStart(2, '0') +
    g.toString(16).padStart(2, '0') +
    b.toString(16).padStart(2, '0')
  );
}

describe('VERDANT SIGNAL V10.0 — The World That Never Stops Living Validation', () => {
  const V100_SPRITES: Array<{ rel: string; vpf: string; w: number; h: number }> = [
    { rel: 'sprites/meridian_field_relay.png', vpf: 'meridian_field_relay.vpf.json', w: 64, h: 76 },
    { rel: 'sprites/meridian_specimen_pod.png', vpf: 'meridian_specimen_pod.vpf.json', w: 56, h: 44 },
    { rel: 'sprites/ancient_waymarker_stone.png', vpf: 'ancient_waymarker_stone.vpf.json', w: 72, h: 92 },
    { rel: 'sprites/ecotone_moss_boulder.png', vpf: 'ecotone_moss_boulder.vpf.json', w: 84, h: 62 },
    { rel: 'sprites/coastal_biolum_coral.png', vpf: 'coastal_biolum_coral.vpf.json', w: 48, h: 42 },
    { rel: 'sprites/coastal_canopy_fern_clump.png', vpf: 'coastal_canopy_fern_clump.vpf.json', w: 64, h: 50 },
    { rel: 'animated/coastal_spore_moths_16x16_4x2.png', vpf: 'coastal_spore_moths.vpf.json', w: 64, h: 32 },
  ];

  it('verifies all 7 handcrafted V10.0 sprites + editable .vpf.json sources, disciplined pixel-art palette & zero chroma residue', () => {
    for (const s of V100_SPRITES) {
      const pngPath = path.join(SHORE_ROOT, s.rel);
      const vpfPath = path.join(VPF_SHORE_ROOT, s.vpf);
      expect(fs.existsSync(pngPath), `Missing V10.0 PNG: ${s.rel}`).toBe(true);
      expect(fs.existsSync(vpfPath), `Missing V10.0 VPF source: ${s.vpf}`).toBe(true);

      const png = loadPngRgba(pngPath);
      expect(png.w).toBe(s.w);
      expect(png.h).toBe(s.h);

      let opaque = 0;
      let chroma = 0;
      const uniqueColors = new Set<string>();
      for (let i = 0; i < png.rgba.length; i += 4) {
        const a = png.rgba[i + 3];
        if (a === 0) continue;
        opaque++;
        const r = png.rgba[i];
        const g = png.rgba[i + 1];
        const b = png.rgba[i + 2];
        if (r > 200 && b > 200 && g < 60) chroma++;
        if (a >= 128) uniqueColors.add(rgbHex(r, g, b));
      }
      expect(opaque).toBeGreaterThan(80);
      expect(chroma).toBe(0);
      expect(uniqueColors.size).toBeGreaterThanOrEqual(6);
      expect(uniqueColors.size).toBeLessThanOrEqual(28);
    }
  });

  it('verifies pixel-level northern ecotone continuity between Living Forest & Broken Shore floors (zero horizontal seam)', () => {
    const shoreFloor = loadPngRgba(path.join(SHORE_ROOT, 'v90_broken_shore_floor_2304x1536.png'));
    const forestFloor = loadPngRgba(path.join(FOREST_ROOT, 'sprites/v80_living_floor_2304x1536.png'));
    expect(shoreFloor.w).toBe(2304);
    expect(shoreFloor.h).toBe(1536);
    expect(forestFloor.w).toBe(2304);
    expect(forestFloor.h).toBe(1536);

    // Along the y = 1344..1352 overlap line, Broken Shore floor seamlessly matches Living Forest floor pixels!
    let sumDiff = 0;
    let samples = 0;
    for (let dy = 0; dy < 8; dy++) {
      for (let x = 0; x < shoreFloor.w; x += 2) {
        const si = (dy * shoreFloor.w + x) * 4;
        const fi = ((1344 + dy) * forestFloor.w + x) * 4;
        const dr = Math.abs(shoreFloor.rgba[si] - forestFloor.rgba[fi]);
        const dg = Math.abs(shoreFloor.rgba[si + 1] - forestFloor.rgba[fi + 1]);
        const db = Math.abs(shoreFloor.rgba[si + 2] - forestFloor.rgba[fi + 2]);
        sumDiff += (dr + dg + db) / 3;
        samples++;
      }
    }
    const meanSeamDiff = sumDiff / samples;
    expect(meanSeamDiff).toBeLessThan(12);
  });

  it('verifies V10.0 ecosystem data upgrades (66 props, 1037 tufts, 14 fauna, 4 V10.0 ecological sites, synced tp_east_outer)', () => {
    const eco = JSON.parse(fs.readFileSync(path.join(SHORE_ROOT, 'broken_shore_ecosystem_data.json'), 'utf8'));
    const catalog = JSON.parse(fs.readFileSync(path.join(SHORE_ROOT, 'broken_shore_asset_catalog.json'), 'utf8'));

    expect(catalog.totalAssets).toBe(28);
    expect(eco.props.length).toBeGreaterThanOrEqual(66);
    expect(eco.tufts.length).toBeGreaterThanOrEqual(1000);
    expect(eco.fauna.length).toBe(14);
    expect(eco.fauna.filter((f: { kind: number }) => f.kind === 2).length).toBe(6);
    expect(eco.v100_ecological_sites.length).toBe(4);

    const tpEastOuter = eco.tidepools.find((t: { id: string }) => t.id === 'tp_east_outer');
    expect(tpEastOuter).toBeDefined();
    expect(tpEastOuter.x).toBe(1906);
    expect(tpEastOuter.y).toBe(2244);
  });

  it('verifies all 6 deterministic V10.0 16-bit mono 22050Hz WAV audio assets exist & contain valid PCM data', () => {
    const wavs = [
      'audio/ambient/coastal_surf_breeze.wav',
      'audio/ambient/living_forest_canopy.wav',
      'audio/sfx/step_sand.wav',
      'audio/sfx/step_grass.wav',
      'audio/sfx/step_water.wav',
      'audio/sfx/acoustic_lens_chime.wav',
    ];
    for (const rel of wavs) {
      const abs = path.join(GAME_ROOT, rel);
      expect(fs.existsSync(abs), `Missing audio WAV: ${rel}`).toBe(true);
      const buf = fs.readFileSync(abs);
      expect(buf.toString('ascii', 0, 4)).toBe('RIFF');
      expect(buf.toString('ascii', 8, 12)).toBe('WAVE');
      const channels = buf.readUInt16LE(22);
      const sampleRate = buf.readUInt32LE(24);
      const bitsPerSample = buf.readUInt16LE(34);
      const dataBytes = buf.readUInt32LE(40);
      expect(channels).toBe(1);
      expect(sampleRate).toBe(22050);
      expect(bitsPerSample).toBe(16);
      expect(dataBytes).toBeGreaterThan(1000);

      let maxAbs = 0;
      for (let off = 44; off + 1 < Math.min(buf.length, 44 + dataBytes); off += 2) {
        const s = Math.abs(buf.readInt16LE(off));
        if (s > maxAbs) maxAbs = s;
      }
      expect(maxAbs).toBeGreaterThan(500);
    }
  });

  it('verifies all 4 Stage 4 production Godot 4.7.2 bug fixes & V10.0 living world wiring', () => {
    const shoreTscn = fs.readFileSync(path.join(GAME_ROOT, 'world/broken_shore/verdant_broken_shore.tscn'), 'utf8');
    expect(shoreTscn).toContain('name="BrokenShoreFloor"');
    expect(shoreTscn).toMatch(/name="BrokenShoreFloor"[\s\S]*?z_index = -2/);
    expect(shoreTscn).toContain('name="MothSporeLayer"');
    expect(shoreTscn).toContain('name="FieldRelayGlow"');
    expect(shoreTscn).toContain('name="WaymarkerGlow"');
    expect(shoreTscn).toContain('name="GatewaySunbeamWest"');

    const shoreGd = fs.readFileSync(path.join(GAME_ROOT, 'world/broken_shore/verdant_broken_shore.gd'), 'utf8');
    expect(shoreGd).toContain('area.collision_layer = 128');
    expect(shoreGd).toContain('area.collision_mask = 4');
    expect(shoreGd).toContain('TEX_SPORE_MOTHS');
    expect(shoreGd).toContain('v100_ecological_sites');
    expect(shoreGd).toContain('force_settle_interior_state');
    expect(shoreGd).toContain('compute_coastal_player_occlusion');
    expect(shoreGd).toContain('compute_coastal_player_tint');

    const forestGd = fs.readFileSync(path.join(GAME_ROOT, 'world/living_forest/verdant_living_forest.gd'), 'utf8');
    expect(forestGd).toContain('compute_forest_player_occlusion');
    expect(forestGd).toContain('compute_forest_player_tint');
    expect(forestGd).not.toContain('player.set_occluded_peek(false)');

    const oceanShader = fs.readFileSync(path.join(GAME_ROOT, 'shaders/coastal_ocean.gdshader'), 'utf8');
    expect(oceanShader).toContain('pools[1] = vec2(1906.0, 2244.0);');
    expect(oceanShader).toContain('is_damp_foreshore');
    expect(oceanShader).not.toContain('hint_screen_texture');
    expect(oceanShader).not.toMatch(/<<|>>|texelFetch/);

    const foliageShader = fs.readFileSync(path.join(GAME_ROOT, 'shaders/foliage_sway.gdshader'), 'utf8');
    expect(foliageShader).toContain('secondary');
    expect(foliageShader).not.toContain('hint_screen_texture');

    const protoGd = fs.readFileSync(path.join(GAME_ROOT, 'world/rimlands_prototype.gd'), 'utf8');
    expect(protoGd).toContain('_sync_unified_player_atmosphere');
    expect(protoGd).toContain('AudioDirector.update_biome_ambience');
    expect(protoGd).toContain('AudioDirector.play_footstep');
    expect(protoGd).toContain('AudioDirector.play_acoustic_lens_chime');
    expect(protoGd).toContain('force_settle_interior_state');

    const audioGd = fs.readFileSync(path.join(GAME_ROOT, 'autoload/audio_director.gd'), 'utf8');
    expect(audioGd).toContain('verify_bus_layout');
    expect(audioGd).toContain('set_bus_volume_linear');
    expect(audioGd).toContain('coastal_surf_breeze.wav');
    expect(audioGd).toContain('living_forest_canopy.wav');
    expect(audioGd).toContain('ResourceLoader.exists');

    const smokeGd = fs.readFileSync(path.join(GAME_ROOT, 'tests/smoke_runner.gd'), 'utf8');
    expect(smokeGd).toContain('verify_v100_living_world_assets');
    expect(smokeGd).toContain('shore_fauna != 14');
  });

  it('guarantees unmodified 88x88 Mara character sprite SHA-256 integrity', () => {
    const idleBuf = fs.readFileSync(
      path.join(GAME_ROOT, 'assets/characters/player/mara_original/char_idle_88x88_8x4.png')
    );
    const sha = crypto.createHash('sha256').update(idleBuf).digest('hex');
    expect(sha.startsWith('3f1af238')).toBe(true);
  });
});
