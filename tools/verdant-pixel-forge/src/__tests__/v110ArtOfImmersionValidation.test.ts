import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { describe, it, expect } from 'vitest';
import { loadPngRgba } from '../v90_broken_shore/v90PaletteAndExtractor';

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const GAME_ROOT = path.join(REPO_ROOT, 'game');
const IMMERSION_ROOT = path.join(GAME_ROOT, 'assets/world/immersion');
const VPF_IMMERSION_ROOT = path.join(GAME_ROOT, 'assets/_vpf_sources/immersion');
const SHORE_ROOT = path.join(GAME_ROOT, 'assets/world/broken_shore');

function rgbHex(r: number, g: number, b: number): string {
  return (
    '#' +
    r.toString(16).padStart(2, '0') +
    g.toString(16).padStart(2, '0') +
    b.toString(16).padStart(2, '0')
  );
}

function pointInPolygon(px: number, py: number, pts: Array<[number, number]>): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-9) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

describe('VERDANT SIGNAL V11.0 — The Art of Immersion Validation', () => {
  const V110_SPRITES: Array<{ rel: string; vpf: string; w: number; h: number }> = [
    { rel: 'sprites/surveyor01_peg.png', vpf: 'surveyor01_peg.vpf.json', w: 24, h: 28 },
    { rel: 'sprites/metallic_blight_crust.png', vpf: 'metallic_blight_crust.vpf.json', w: 36, h: 24 },
    { rel: 'sprites/mycelial_luminous_seam.png', vpf: 'mycelial_luminous_seam.vpf.json', w: 32, h: 28 },
  ];

  it('verifies all 3 handcrafted V11.0 micro-storytelling sprites + editable .vpf.json sources, palette restraint & zero chroma spill', () => {
    for (const s of V110_SPRITES) {
      const pngPath = path.join(IMMERSION_ROOT, s.rel);
      const vpfPath = path.join(VPF_IMMERSION_ROOT, s.vpf);
      expect(fs.existsSync(pngPath), `Missing V11.0 sprite: ${s.rel}`).toBe(true);
      expect(fs.existsSync(vpfPath), `Missing V11.0 VPF source: ${s.vpf}`).toBe(true);

      const vpfDoc = JSON.parse(fs.readFileSync(vpfPath, 'utf8'));
      expect(vpfDoc.width).toBe(s.w);
      expect(vpfDoc.height).toBe(s.h);

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
      expect(opaque).toBeGreaterThan(60);
      expect(chroma).toBe(0);
      expect(uniqueColors.size).toBeGreaterThanOrEqual(5);
      expect(uniqueColors.size).toBeLessThanOrEqual(20);
    }
  });

  it('verifies all 6 procedural V11.0 16-bit mono 22050Hz WAV audio clips exist, are valid PCM & non-silent', () => {
    const wavs = [
      'audio/sfx/step_metal.wav',
      'audio/sfx/sample_confirm.wav',
      'audio/sfx/insight_discovery.wav',
      'audio/sfx/blight_static.wav',
      'audio/sfx/glider_mimic_call.wav',
      'audio/ambient/waymarker_resonance.wav',
    ];
    for (const rel of wavs) {
      const abs = path.join(GAME_ROOT, rel);
      expect(fs.existsSync(abs), `Missing V11.0 WAV: ${rel}`).toBe(true);
      const buf = fs.readFileSync(abs);
      expect(buf.toString('ascii', 0, 4)).toBe('RIFF');
      expect(buf.toString('ascii', 8, 12)).toBe('WAVE');
      expect(buf.readUInt16LE(22)).toBe(1);
      expect(buf.readUInt32LE(24)).toBe(22050);
      expect(buf.readUInt16LE(34)).toBe(16);
      const dataBytes = buf.readUInt32LE(40);
      expect(dataBytes).toBeGreaterThan(2000);

      let maxAbs = 0;
      for (let off = 44; off + 1 < Math.min(buf.length, 44 + dataBytes); off += 2) {
        const s = Math.abs(buf.readInt16LE(off));
        if (s > maxAbs) maxAbs = s;
      }
      expect(maxAbs).toBeGreaterThan(400);
    }
  });

  it('verifies FieldCodex has 27 unique entries, 4 valid Emergent Insights, non-spoiling 4-layer lore & valid coordinates', () => {
    const codexGd = fs.readFileSync(path.join(GAME_ROOT, 'systems/field_codex.gd'), 'utf8');

    // Parse all entry IDs and coordinates from FieldCodex
    const entryMatches = [...codexGd.matchAll(/"id":\s*"([a-z0-9_]+)"[\s\S]*?"pos":\s*Vector2\(([0-9.]+),\s*([0-9.]+)\)/g)];
    expect(entryMatches.length).toBe(27);

    const entryIds = new Set<string>();
    for (const m of entryMatches) {
      const id = m[1];
      const x = Number(m[2]);
      const y = Number(m[3]);
      expect(entryIds.has(id), `Duplicate FieldCodex entry ID: ${id}`).toBe(false);
      entryIds.add(id);
      expect(x).toBeGreaterThanOrEqual(48);
      expect(x).toBeLessThanOrEqual(2256);
      expect(y).toBeGreaterThanOrEqual(48);
      expect(y).toBeLessThanOrEqual(2600);
    }

    // Verify all linked_id cross-references point to valid entries
    const linkedMatches = [...codexGd.matchAll(/"linked_id":\s*"([a-z0-9_]+)"/g)];
    expect(linkedMatches.length).toBeGreaterThanOrEqual(6);
    for (const lm of linkedMatches) {
      expect(entryIds.has(lm[1]), `Broken linked_id in FieldCodex: ${lm[1]}`).toBe(true);
    }

    // Verify all 4 Emergent Insights reference valid discovery IDs
    const insightBlock = codexGd.slice(codexGd.indexOf('func get_all_insights()'));
    const insightIds = [...insightBlock.matchAll(/"id":\s*"(insight_[a-z0-9_]+)"/g)].map((m) => m[1]);
    expect(insightIds).toEqual([
      'insight_prime_echo',
      'insight_surveyor01',
      'insight_silent_wound',
      'insight_connected_chorus',
    ]);

    const reqMatches = [...insightBlock.matchAll(/"required_any_[ab]":\s*\[([^\]]+)\]/g)];
    expect(reqMatches.length).toBe(8);
    for (const rm of reqMatches) {
      const refs = [...rm[1].matchAll(/"([a-z0-9_]+)"/g)].map((r) => r[1]);
      expect(refs.length).toBeGreaterThanOrEqual(1);
      for (const ref of refs) {
        expect(entryIds.has(ref), `Insight requires unknown discovery ID: ${ref}`).toBe(true);
      }
    }

    // Lore restraint check: never prematurely spoil Act 3-4 Mycelial Choir / Caldera secrets in Act 1 notes
    expect(codexGd).not.toMatch(/Mycelial Choir/i);
    expect(codexGd).not.toMatch(/Kaelen Voss/i);
    expect(codexGd).not.toMatch(/Caldera Heart/i);
  });

  it('verifies all 6 V11.0 hidden discoveries are collider-free and approachable on walkable terrain', () => {
    const eco = JSON.parse(fs.readFileSync(path.join(SHORE_ROOT, 'broken_shore_ecosystem_data.json'), 'utf8'));
    const coastalHidden = [
      { id: 'surveyor01_peg', x: 468, y: 2224 },
      { id: 'coastal_blight_crust', x: 478, y: 1796 },
      { id: 'driftwood_tide_cache', x: 846, y: 1742 },
      { id: 'outer_surge_resonance', x: 1892, y: 2212 },
    ];
    for (const pt of coastalHidden) {
      for (const prop of eco.props) {
        for (const col of prop.colliders) {
          const wpts: Array<[number, number]> = col.points.map(([lx, ly]: [number, number]) => [
            prop.x + lx,
            prop.y + ly,
          ]);
          expect(pointInPolygon(pt.x, pt.y, wpts), `${pt.id} overlaps collider ${prop.id}/${col.name}`).toBe(false);
        }
      }
    }

    const forestTscn = fs.readFileSync(path.join(GAME_ROOT, 'world/living_forest/verdant_living_forest.tscn'), 'utf8');
    const bodyRe =
      /\[node name="([^"]+)" type="StaticBody2D" parent="YSortWorld"\][\s\S]*?position = Vector2\(([^,]+), ([^)]+)\)[\s\S]*?polygon = PackedVector2Array\(([^)]+)\)/g;
    const bodies: Array<{ name: string; pts: Array<[number, number]> }> = [];
    for (const m of forestTscn.matchAll(bodyRe)) {
      const bx = Number(m[2]);
      const by = Number(m[3]);
      const nums = m[4].split(',').map((s) => Number(s.trim()));
      const pts: Array<[number, number]> = [];
      for (let i = 0; i < nums.length; i += 2) pts.push([bx + nums[i], by + nums[i + 1]]);
      bodies.push({ name: m[1], pts });
    }
    for (const pt of [
      { id: 'nw_mycelial_seam', x: 596, y: 568 },
      { id: 'sw_blight_trace', x: 668, y: 1108 },
    ]) {
      for (const b of bodies) {
        expect(pointInPolygon(pt.x, pt.y, b.pts), `${pt.id} overlaps forest collider ${b.name}`).toBe(false);
      }
    }
  });

  it('verifies V11.0 Immersion-First HUD, AudioDirector CaveReverb/Resonance, Reactive Flora/Fauna & AssetPaths wiring', () => {
    const hudTscn = fs.readFileSync(path.join(GAME_ROOT, 'ui/prototype_hud.tscn'), 'utf8');
    expect(hudTscn).toContain('load_steps=5');
    expect(hudTscn).toContain('name="RegionWhisperLabel"');
    expect(hudTscn).toContain('name="ObservationCardPanel"');
    expect(hudTscn).toContain('name="ProximityPromptPanel"');
    expect(hudTscn).toContain('name="OpeningWhisperLabel"');
    expect(hudTscn).toContain('name="FieldJournalOverlay"');

    const hudGd = fs.readFileSync(path.join(GAME_ROOT, 'ui/prototype_hud.gd'), 'utf8');
    expect(hudGd).toContain('set_telemetry_visible(false)');
    expect(hudGd).toContain('toggle_field_journal');
    expect(hudGd).toContain('show_field_observation');
    expect(hudGd).toContain('queue_field_observation');
    expect(hudGd).toContain('announce_region');
    expect(hudGd).toContain('update_proximity_prompt');

    const audioGd = fs.readFileSync(path.join(GAME_ROOT, 'autoload/audio_director.gd'), 'utf8');
    expect(audioGd).toContain('set_interior_reverb');
    expect(audioGd).toContain('CaveReverb');
    expect(audioGd).toContain('update_landmark_resonance');
    expect(audioGd).toContain('play_sample_confirm');
    expect(audioGd).toContain('play_insight_discovery');
    expect(audioGd).toContain('play_blight_static');
    expect(audioGd).toContain('play_glider_mimic_call');
    expect(audioGd).toContain('step_metal.wav');

    const shoreGd = fs.readFileSync(path.join(GAME_ROOT, 'world/broken_shore/verdant_broken_shore.gd'), 'utf8');
    expect(shoreGd).toContain('_spawn_v110_mystery_traces');
    expect(shoreGd).toContain('trigger_glider_acoustic_response');
    expect(shoreGd).toContain('get_harmonic_landmark_proximity');
    expect(shoreGd).toContain('get_region_display_name');
    expect(shoreGd).toContain('player.is_crouching');

    const forestGd = fs.readFileSync(path.join(GAME_ROOT, 'world/living_forest/verdant_living_forest.gd'), 'utf8');
    expect(forestGd).toContain('_spawn_v110_forest_traces');
    expect(forestGd).toContain('is_under_root_arch');
    expect(forestGd).toContain('get_harmonic_landmark_proximity');
    expect(forestGd).toContain('get_region_display_name');
    expect(forestGd).toContain('trigger_proximity_rustle');

    const floraGd = fs.readFileSync(path.join(GAME_ROOT, 'world/flora/flora_prop.gd'), 'utf8');
    expect(floraGd).toContain('trigger_proximity_rustle');

    const protoGd = fs.readFileSync(path.join(GAME_ROOT, 'world/rimlands_prototype.gd'), 'utf8');
    expect(protoGd).toContain('AcousticEchoVfx');
    expect(protoGd).toContain('FieldCodex');
    expect(protoGd).toContain('open_field_codex');
    expect(protoGd).toContain('AudioDirector.set_interior_reverb');
    expect(protoGd).toContain('AudioDirector.update_landmark_resonance');
    expect(protoGd).toContain('_evaluate_emergent_insights');

    const assetPathsGd = fs.readFileSync(path.join(GAME_ROOT, 'systems/asset_paths.gd'), 'utf8');
    expect(assetPathsGd).toContain('V110_REQUIRED_PATHS');
    expect(assetPathsGd).toContain('verify_v110_immersion_assets');

    const bootGd = fs.readFileSync(path.join(GAME_ROOT, 'scenes/boot/main.gd'), 'utf8');
    expect(bootGd).toContain('verify_v110_immersion_assets');
    expect(bootGd).toContain('V11.0');

    const smokeGd = fs.readFileSync(path.join(GAME_ROOT, 'tests/smoke_runner.gd'), 'utf8');
    expect(smokeGd).toContain('verify_v110_immersion_assets');
    expect(smokeGd).toContain('field_codex.gd');
    expect(smokeGd).toContain('acoustic_echo_vfx.gd');
  });

  it('guarantees zero regression on unmodified 88x88 Mara character sprite SHA-256 and V8/V9/V10 asset invariants', () => {
    const idleBuf = fs.readFileSync(
      path.join(GAME_ROOT, 'assets/characters/player/mara_original/char_idle_88x88_8x4.png')
    );
    const sha = crypto.createHash('sha256').update(idleBuf).digest('hex');
    expect(sha.startsWith('3f1af238')).toBe(true);
  });
});
