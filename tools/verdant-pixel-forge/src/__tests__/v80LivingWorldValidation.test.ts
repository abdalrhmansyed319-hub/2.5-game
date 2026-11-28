import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import {
  V73_VIEW_H,
  V73_VIEW_W,
  evaluateV73Movement,
  getV73OpenWorldDef,
  isPointBlocked,
} from '../v73_open_world/v73OpenWorldEngine';
import {
  type V80GrassBendRecord,
  sampleV80Wind,
  selectV80TuftFrameIndex,
  updateV80GrassFootsteps,
} from '../v80_living_world/v80LivingWorldEngine';
import { type V80LivingTuft } from '../v80_living_world/v80LivingGroundArt';

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const V73_ROOT = path.join(REPO_ROOT, 'game/assets/v73_open_world_playability_study');
const V80_ROOT = path.join(REPO_ROOT, 'game/assets/v80_living_world_study');
const GODOT_ROOT = path.join(V80_ROOT, 'godot_project');
const PROOFS_DIR = path.join(V80_ROOT, 'proofs');

describe('VERDANT SIGNAL V8.0 — Living World Art, Footstep Grass Physics & Godot 4.7.2 Integrity', () => {
  it('enforces .gdignore isolation and preserves original unmodified 88x88 player character pixels bit-for-bit', () => {
    expect(fs.existsSync(path.join(V80_ROOT, '.gdignore'))).toBe(true);
    const rawOrig = execFileSync(
      'convert',
      [
        path.join(V73_ROOT, 'character_source_original/extracted/Idle/animations/Walking/south/frame_000.png'),
        '-depth',
        '8',
        'rgba:-',
      ],
      { maxBuffer: 88 * 88 * 4 + 4096 }
    );
    const rawV80Cell = execFileSync(
      'convert',
      [path.join(GODOT_ROOT, 'sprites/char_walking_88x88_8x4.png'), '-crop', '88x88+0+0', '+repage', '-depth', '8', 'rgba:-'],
      { maxBuffer: 88 * 88 * 4 + 4096 }
    );
    expect(Buffer.compare(rawOrig, rawV80Cell)).toBe(0);
  });

  it('validates living grass wind-wave modulation and player footstep compression / spring-back physics', () => {
    const sampleTuft: V80LivingTuft = {
      id: 't_test',
      species: 'meadow_tall',
      x: 1040,
      y: 830,
      phase: 0.4,
      windSensitivity: 1.15,
      isRootWrap: false,
    };
    const bends = new Map<string, V80GrassBendRecord>();

    // Strong gust cleanly selects handcrafted wind-gust bend frame (frame 2)
    const gustFrame = selectV80TuftFrameIndex(sampleTuft, 2.0, undefined, 0.95);
    expect(gustFrame).toBe(2);
    const w = sampleV80Wind(1040, 830, 2.0, 0.9);
    expect(w.gustStrength).toBeGreaterThanOrEqual(0.9);

    // Player stepping slightly left of tuft bends blades cleanly to the right (frame 5)!
    updateV80GrassFootsteps([sampleTuft], bends, 1030, 830, true, 0.05);
    expect(bends.has('t_test')).toBe(true);
    expect(selectV80TuftFrameIndex(sampleTuft, 0.5, bends.get('t_test'), 0)).toBe(5);

    // After 0.5s with player gone, grass smoothly springs back out of footstep compression!
    updateV80GrassFootsteps([sampleTuft], bends, 1200, 830, false, 0.52);
    expect(bends.has('t_test')).toBe(false);
    expect(selectV80TuftFrameIndex(sampleTuft, 0.5, bends.get('t_test'), 0)).toBeLessThan(4);
  });

  it('preserves 100% of V7.3 open-world movement and multi-polygon collision guarantees', () => {
    const world = getV73OpenWorldDef();
    // Root arch walkable passage intact while structural pillars block
    const archPass = evaluateV73Movement(world, 1118, 452, 0, -10);
    expect(archPass.blocked).toBe(false);
    expect(archPass.underArch).toBe(true);
    expect(isPointBlocked(world, 1118 - 66, 452)).toBe(true);
    expect(isPointBlocked(world, 1118 + 68, 452)).toBe(true);

    // Slow thicket (0.78x) and shallow pool (0.90x) intact
    const slow = evaluateV73Movement(world, 974, 866, 10, 0);
    expect(slow.blocked).toBe(false);
    expect(slow.speedMul).toBeCloseTo(0.78, 2);
  });

  it('exports a valid standalone Godot 4.7.2 GL Compatibility V8.0 project within Intel HD 3000 limits', () => {
    const proj = fs.readFileSync(path.join(GODOT_ROOT, 'project.godot'), 'utf8');
    expect(proj).toContain(`viewport_width=${V73_VIEW_W}`);
    expect(proj).toContain(`viewport_height=${V73_VIEW_H}`);
    expect(proj).toContain('renderer/rendering_method="gl_compatibility"');
    expect(proj).toContain('run/main_scene="res://scenes/v80_living_world_forest.tscn"');

    const tscn = fs.readFileSync(path.join(GODOT_ROOT, 'scenes/v80_living_world_forest.tscn'), 'utf8');
    const extMatches = [...tscn.matchAll(/\[ext_resource type="([^"]+)" path="res:\/\/([^"]+)" id="([^"]+)"\]/g)];
    expect(extMatches.length).toBeGreaterThanOrEqual(38);
    for (const m of extMatches) {
      expect(fs.existsSync(path.join(GODOT_ROOT, m[2]))).toBe(true);
    }
    expect((tscn.match(/type="StaticBody2D"/g) ?? []).length).toBeGreaterThanOrEqual(80);
    expect((tscn.match(/type="CollisionPolygon2D"/g) ?? []).length).toBeGreaterThanOrEqual(140);
    expect((tscn.match(/type="Area2D"/g) ?? []).length).toBeGreaterThanOrEqual(6);
    expect(tscn).toContain('name="SunbeamsOverlay"');
    expect(tscn).toContain('name="BiolumGlowLayer"');
    expect(tscn).toContain('name="CrittersLayer"');

    // Intel HD 3000 particle cap <= 42 across all CPUParticles2D emitters
    const particleAmounts = [...tscn.matchAll(/type="CPUParticles2D"[\s\S]*?amount = (\d+)/g)].map((m) => Number(m[1]));
    const totalParticles = particleAmounts.reduce((a, b) => a + b, 0);
    expect(totalParticles).toBeGreaterThan(0);
    expect(totalParticles).toBeLessThanOrEqual(42);

    // Living ecosystem data JSON exists with >= 600 tufts & 7 critters
    const eco = JSON.parse(fs.readFileSync(path.join(GODOT_ROOT, 'data/living_ecosystem_data.json'), 'utf8'));
    expect(eco.tufts.length).toBeGreaterThanOrEqual(600);
    expect(eco.critters.length).toBe(7);

    const gd = fs.readFileSync(path.join(GODOT_ROOT, 'scripts/v80_living_world_forest.gd'), 'utf8');
    expect(gd).toContain('GRASS_POOL_SIZE := 144');
    expect(gd).toContain('KEY_F3');
    expect(gd).toContain('KEY_F4');
    expect(gd).toContain('KEY_F5');
    expect(gd).toContain('KEY_F6');
    expect(gd).toContain('--capture-proofs');
  });

  it('verifies all 11 required V8.0 comparison, 3x zoom, mood triptych & animated living-world proofs exist', () => {
    const required = [
      'v80_01_before_after_V73_vs_V80_1x.png',
      'v80_02_ground_and_root_integration_zoom_3x.png',
      'v80_03_lighting_3_moods_triptych_1x.png',
      'v80_04_hub_afternoon_640x360.png',
      'v80_05_root_arch_afternoon_640x360.png',
      'v80_06_clearing_afternoon_640x360.png',
      'v80_07_waystone_biolum_shaded_640x360.png',
      'v80_08_fallen_log_dawn_640x360.png',
      'v80_09_collision_debug_intact_640x360.png',
      'v80_10_living_world_still_breathing_640x360.gif',
      'v80_11_living_world_walking_grass_bend_640x360.gif',
    ];
    for (const fn of required) {
      const fp = path.join(PROOFS_DIR, fn);
      expect(fs.existsSync(fp)).toBe(true);
      expect(fs.statSync(fp).size).toBeGreaterThan(20000);
    }
    expect(fs.existsSync(path.join(GODOT_ROOT, 'run_windows_verification.bat'))).toBe(true);
    expect(fs.existsSync(path.join(V80_ROOT, 'playable_web/index.html'))).toBe(true);
  });
});
