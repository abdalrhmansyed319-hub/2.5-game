import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const GAME_ROOT = path.join(REPO_ROOT, 'game');
const V80_STUDY_ROOT = path.join(GAME_ROOT, 'assets/v80_living_world_study');
const V73_STUDY_ROOT = path.join(GAME_ROOT, 'assets/v73_open_world_playability_study');

const PRODUCTION_SCENES = [
  'scenes/boot/main.tscn',
  'characters/player/player.tscn',
  'world/rimlands_prototype.tscn',
  'world/living_forest/verdant_living_forest.tscn',
  'world/flora/flora_prop.tscn',
  'world/props/singing_reedwood_tree.tscn',
  'world/landmarks/drop_pod_clearing.tscn',
  'ui/prototype_hud.tscn',
  'tests/smoke_runner.tscn',
];

const PRODUCTION_SCRIPTS = [
  'autoload/game_state.gd',
  'autoload/audio_director.gd',
  'resources/biome_data.gd',
  'resources/flora_species_data.gd',
  'resources/fauna_species_data.gd',
  'resources/weather_event_data.gd',
  'systems/asset_paths.gd',
  'scenes/boot/main.gd',
  'characters/player/player.gd',
  'world/rimlands_tileset_builder.gd',
  'world/world_chunk_streamer.gd',
  'world/living_forest/verdant_living_forest.gd',
  'world/rimlands_prototype.gd',
  'world/props/singing_reedwood_tree.gd',
  'world/flora/flora_prop.gd',
  'world/landmarks/drop_pod_clearing.gd',
  'world/vfx/ground_ring_vfx.gd',
  'ui/prototype_hud.gd',
  'tests/smoke_runner.gd',
];

describe('VERDANT SIGNAL — Production Main Game V8.0 Integration Verification', () => {
  it('verifies production project.godot 640x360 integer scaling, Intel HD 3000 GL Compatibility, strict warnings & preserved systems', () => {
    const proj = fs.readFileSync(path.join(GAME_ROOT, 'project.godot'), 'utf8');

    // Viewport & integer scaling for Intel HD 3000 (1366x768 fits exact 2x 1280x720)
    expect(proj).toContain('window/size/viewport_width=640');
    expect(proj).toContain('window/size/viewport_height=360');
    expect(proj).toContain('window/size/window_width_override=1280');
    expect(proj).toContain('window/size/window_height_override=720');
    expect(proj).toContain('window/stretch/mode="viewport"');
    expect(proj).toContain('window/stretch/scale_mode="integer"');

    // Intel HD Graphics 3000 GL Compatibility + pixel crispness
    expect(proj).toContain('renderer/rendering_method="gl_compatibility"');
    expect(proj).toContain('gl_compatibility/fallback_to_angle=true');
    expect(proj).toContain('textures/canvas_textures/default_texture_filter=0');
    expect(proj).toContain('anti_aliasing/quality/msaa_2d=0');
    expect(proj).toContain('viewport/hdr_2d=false');
    expect(proj).toContain('2d/snap/snap_2d_transforms_to_pixel=true');
    expect(proj).toContain('2d/snap/snap_2d_vertices_to_pixel=true');

    // Strict GDScript warnings preserved
    expect(proj).toContain('gdscript/warnings/untyped_declaration=1');
    expect(proj).toContain('gdscript/warnings/unsafe_property_access=1');
    expect(proj).toContain('gdscript/warnings/unsafe_method_access=1');
    expect(proj).toContain('gdscript/warnings/unsafe_call_argument=1');
    expect(proj).toContain('gdscript/warnings/unsafe_cast=1');

    // Preserved main scene, autoloads, audio bus layout, physics layers & all 12 input actions
    expect(proj).toContain('run/main_scene="res://scenes/boot/main.tscn"');
    expect(proj).toContain('GameState="*res://autoload/game_state.gd"');
    expect(proj).toContain('AudioDirector="*res://autoload/audio_director.gd"');
    expect(proj).toContain('buses/default_bus_layout="res://audio/default_bus_layout.tres"');
    for (const action of [
      'move_left',
      'move_right',
      'move_up',
      'move_down',
      'crouch_stealth',
      'sprint_dodge',
      'interact_sample',
      'toggle_acoustic_lens',
      'use_tool_primary',
      'use_tool_secondary',
      'open_field_codex',
      'pause_menu',
    ]) {
      expect(proj).toContain(`${action}={`);
    }
  });

  it('audits ALL 9 production .tscn scenes for exact load_steps, valid res:// resources, valid IDs & collision layer alignment', () => {
    for (const relScene of PRODUCTION_SCENES) {
      const fullPath = path.join(GAME_ROOT, relScene);
      expect(fs.existsSync(fullPath), `Missing scene ${relScene}`).toBe(true);
      const tscn = fs.readFileSync(fullPath, 'utf8');

      // Exact load_steps check
      const header = tscn.match(/^\[gd_scene load_steps=(\d+) format=3\]/m);
      expect(header, `Missing gd_scene header in ${relScene}`).not.toBeNull();
      const declaredSteps = Number(header![1]);

      const extMatches = [...tscn.matchAll(/^\[ext_resource type="([^"]+)" path="res:\/\/([^"]+)" id="([^"]+)"\]$/gm)];
      const subMatches = [...tscn.matchAll(/^\[sub_resource type="([^"]+)" id="([^"]+)"\]$/gm)];
      expect(declaredSteps, `load_steps mismatch in ${relScene}`).toBe(extMatches.length + subMatches.length + 1);

      // Every ext_resource exists on disk inside production game/
      const declaredExtIds = new Set<string>();
      for (const m of extMatches) {
        const resRel = m[2];
        const id = m[3];
        declaredExtIds.add(id);
        expect(fs.existsSync(path.join(GAME_ROOT, resRel)), `Broken ext_resource res://${resRel} in ${relScene}`).toBe(
          true
        );
        expect(resRel.startsWith('sprites/'), `Leaked standalone path res://${resRel} in ${relScene}`).toBe(false);
        expect(resRel.startsWith('scripts/'), `Leaked standalone path res://${resRel} in ${relScene}`).toBe(false);
      }

      const declaredSubIds = new Set<string>(subMatches.map((m) => m[2]));

      // Every ExtResource(...) and SubResource(...) reference resolves cleanly
      for (const ref of tscn.matchAll(/ExtResource\("([^"]+)"\)/g)) {
        expect(declaredExtIds.has(ref[1]), `Undeclared ExtResource("${ref[1]}") in ${relScene}`).toBe(true);
      }
      for (const ref of tscn.matchAll(/SubResource\("([^"]+)"\)/g)) {
        expect(declaredSubIds.has(ref[1]), `Undeclared SubResource("${ref[1]}") in ${relScene}`).toBe(true);
      }
    }

    // Deep V8.0 production living forest scene geometry & Intel HD 3000 limits
    const forestTscn = fs.readFileSync(path.join(GAME_ROOT, 'world/living_forest/verdant_living_forest.tscn'), 'utf8');
    expect((forestTscn.match(/type="StaticBody2D"/g) ?? []).length).toBe(81);
    expect((forestTscn.match(/type="CollisionPolygon2D"/g) ?? []).length).toBe(148); // 142 solid + 6 walkable Area2D polygons
    expect((forestTscn.match(/type="Area2D"/g) ?? []).length).toBe(6);
    expect((forestTscn.match(/collision_layer = 128\ncollision_mask = 4/g) ?? []).length).toBe(6);
    expect(forestTscn).not.toContain('collision_mask = 2');
    expect(forestTscn).not.toContain('name="HudCanvas"');
    expect(forestTscn).not.toContain('name="WorldMoodModulate"');

    const particleAmounts = [...forestTscn.matchAll(/type="CPUParticles2D"[\s\S]*?amount = (\d+)/g)].map((m) =>
      Number(m[1])
    );
    const totalParticles = particleAmounts.reduce((a, b) => a + b, 0);
    expect(totalParticles).toBe(40);
    expect(totalParticles).toBeLessThanOrEqual(42);
  });

  it('audits ALL 19 production GDScript files for valid res:// paths, InputMap alignment & strict static typing', () => {
    for (const relScript of PRODUCTION_SCRIPTS) {
      const fullPath = path.join(GAME_ROOT, relScript);
      expect(fs.existsSync(fullPath), `Missing script ${relScript}`).toBe(true);
      const gd = fs.readFileSync(fullPath, 'utf8');

      // Every res:// literal points to a real file inside game/ (excluding runtime capture output directory)
      for (const m of gd.matchAll(/"res:\/\/([^"]+)"/g)) {
        const resPath = m[1];
        if (resPath.endsWith('/') || resPath === 'godot_runtime_captures') {
          continue;
        }
        expect(fs.existsSync(path.join(GAME_ROOT, resPath)), `Broken res://${resPath} in ${relScript}`).toBe(true);
      }

      // No stale standalone "sprint" action (production uses "sprint_dodge")
      expect(gd).not.toContain('is_action_pressed("sprint")');

      // Ensure zero untyped `for x in` loops across all production scripts
      const untypedFor = [...gd.matchAll(/^\s*for\s+([a-zA-Z_]\w*)\s+in\s+/gm)];
      expect(untypedFor.map((m) => m[0]), `Untyped for-loop in ${relScript}`).toEqual([]);
    }

    // Confirm chunk streamer protects sanctuary from invisible legacy water/cliff barriers
    const chunkGd = fs.readFileSync(path.join(GAME_ROOT, 'world/world_chunk_streamer.gd'), 'utf8');
    expect(chunkGd).toContain('_in_living_forest_sanctuary');
    expect(chunkGd).toContain('SANCTUARY_MAX_TX: int = 144');
    expect(chunkGd).toContain('SANCTUARY_MAX_TY: int = 96');

    // Confirm living ecosystem data JSON integrity (718 tufts + 7 critters)
    const eco = JSON.parse(
      fs.readFileSync(path.join(GAME_ROOT, 'assets/world/living_forest/data/living_ecosystem_data.json'), 'utf8')
    );
    expect(eco.tufts.length).toBe(718);
    expect(eco.critters.length).toBe(7);
  });

  it('guarantees bit-for-bit unmodified original 88x88 player character artwork inside production game/', () => {
    const prodCharDir = path.join(GAME_ROOT, 'assets/characters/player/mara_original');
    const studyCharDir = path.join(V80_STUDY_ROOT, 'godot_project/sprites');

    for (const file of ['char_idle_88x88_8x4.png', 'char_walking_88x88_8x4.png', 'char_running_88x88_8x4.png']) {
      const prodBuf = fs.readFileSync(path.join(prodCharDir, file));
      const studyBuf = fs.readFileSync(path.join(studyCharDir, file));
      expect(Buffer.compare(prodBuf, studyBuf), `Byte mismatch on ${file}`).toBe(0);

      const dims = execFileSync('identify', ['-format', '%wx%h', path.join(prodCharDir, file)], {
        encoding: 'utf8',
      }).trim();
      expect(dims).toBe('704x352');
    }

    // Verify frame (0,0) raw RGBA pixels match original supplied ZIP extraction bit-for-bit
    const rawOrig = execFileSync(
      'convert',
      [
        path.join(V73_STUDY_ROOT, 'character_source_original/extracted/Idle/animations/Walking/south/frame_000.png'),
        '-depth',
        '8',
        'rgba:-',
      ],
      { maxBuffer: 88 * 88 * 4 + 4096 }
    );
    const rawProdCell = execFileSync(
      'convert',
      [path.join(prodCharDir, 'char_walking_88x88_8x4.png'), '-crop', '88x88+0+0', '+repage', '-depth', '8', 'rgba:-'],
      { maxBuffer: 88 * 88 * 4 + 4096 }
    );
    expect(Buffer.compare(rawOrig, rawProdCell)).toBe(0);
  });

  it('preserves all previous Milestone 01 production assets, isolated studies, and Windows verification harness', () => {
    // Previous production assets preserved untouched
    const preservedLegacy = [
      'assets/characters/player/char_mara_lin_sheet.png',
      'assets/world/tilesets/env_amber_coast_ground_tileset.png',
      'assets/world/tilesets/env_singing_canopy_ground_tileset.png',
      'assets/world/props/prop_singing_reedwood_tree_sheet.png',
      'assets/world/flora/prop_rimlands_flora_sheet.png',
      'assets/world/landmarks/prop_drop_pod_landmark_sheet.png',
      'assets/vfx/fx_shadows_ripples_lens_sheet.png',
      'audio/default_bus_layout.tres',
    ];
    for (const rel of preservedLegacy) {
      expect(fs.existsSync(path.join(GAME_ROOT, rel)), `Legacy asset deleted: ${rel}`).toBe(true);
    }

    // Isolated V8.0 & V7.3 studies preserved untouched with .gdignore protection
    expect(fs.existsSync(path.join(V80_STUDY_ROOT, '.gdignore'))).toBe(true);
    expect(fs.existsSync(path.join(V73_STUDY_ROOT, '.gdignore'))).toBe(true);
    expect(fs.existsSync(path.join(GAME_ROOT, 'tools/run_production_v80_verification.bat'))).toBe(true);
  });
});
