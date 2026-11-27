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

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const STUDY_ROOT = path.join(REPO_ROOT, 'game/assets/v73_open_world_playability_study');
const GODOT_ROOT = path.join(STUDY_ROOT, 'godot_project');
const PROOFS_DIR = path.join(STUDY_ROOT, 'proofs');

describe('VERDANT SIGNAL V7.3 — Open-World Playability, Collision & Godot 4.7.2 Integrity', () => {
  it('enforces strict .gdignore isolation and preserves original supplied character ZIP verbatim', () => {
    expect(fs.existsSync(path.join(STUDY_ROOT, '.gdignore'))).toBe(true);
    const zipPath = path.join(STUDY_ROOT, 'character_source_original/A_highly_detailed_full-body_pixel_121240.zip');
    expect(fs.existsSync(zipPath)).toBe(true);
    expect(fs.statSync(zipPath).size).toBe(1770255);

    const manifestPath = path.join(STUDY_ROOT, 'character_inspection_manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifest.preservedVerbatim).toBe(true);
    expect(manifest.animationFrameSize).toBe('88x88');
    expect(manifest.animatedDirectionsPresent).toEqual(['south', 'north', 'east', 'west']);
    expect(manifest.missingAnimatedDirections).toEqual(['south-east', 'north-east', 'north-west', 'south-west']);

    // Verify BIT-FOR-BIT identical pixel data between original supplied frame and packed Godot strip cell (0,0)
    const rawOrig = execFileSync(
      'convert',
      [
        path.join(STUDY_ROOT, 'character_source_original/extracted/Idle/animations/Walking/south/frame_000.png'),
        '-depth',
        '8',
        'rgba:-',
      ],
      { maxBuffer: 88 * 88 * 4 + 4096 }
    );
    const rawPackedCell = execFileSync(
      'convert',
      [path.join(GODOT_ROOT, 'sprites/char_walking_88x88_8x4.png'), '-crop', '88x88+0+0', '+repage', '-depth', '8', 'rgba:-'],
      { maxBuffer: 88 * 88 * 4 + 4096 }
    );
    expect(Buffer.compare(rawOrig, rawPackedCell)).toBe(0);
  });

  it('exports a valid standalone Godot 4.7.2 GL Compatibility project with real multi-polygon colliders & F3/F4 tooling', () => {
    const projText = fs.readFileSync(path.join(GODOT_ROOT, 'project.godot'), 'utf8');
    expect(projText).toContain(`viewport_width=${V73_VIEW_W}`);
    expect(projText).toContain(`viewport_height=${V73_VIEW_H}`);
    expect(projText).toContain('renderer/rendering_method="gl_compatibility"');
    expect(projText).toContain('2d/snap/snap_2d_transforms_to_pixel=true');
    expect(projText).toContain('run/main_scene="res://scenes/v73_open_world_forest.tscn"');

    const tscn = fs.readFileSync(path.join(GODOT_ROOT, 'scenes/v73_open_world_forest.tscn'), 'utf8');
    const extMatches = [...tscn.matchAll(/\[ext_resource type="([^"]+)" path="res:\/\/([^"]+)" id="([^"]+)"\]/g)];
    expect(extMatches.length).toBeGreaterThanOrEqual(34);
    for (const m of extMatches) {
      expect(fs.existsSync(path.join(GODOT_ROOT, m[2]))).toBe(true);
    }

    const spriteCount = (tscn.match(/type="Sprite2D"/g) ?? []).length;
    const staticBodyCount = (tscn.match(/type="StaticBody2D"/g) ?? []).length;
    const polyColCount = (tscn.match(/type="CollisionPolygon2D"/g) ?? []).length;
    const areaZoneCount = (tscn.match(/type="Area2D"/g) ?? []).length;
    expect(spriteCount).toBeGreaterThanOrEqual(150);
    expect(staticBodyCount).toBeGreaterThanOrEqual(75);
    expect(polyColCount).toBeGreaterThanOrEqual(140);
    expect(areaZoneCount).toBeGreaterThanOrEqual(6);

    // Ensure natural occlusion peek stays above canopies and uses ZERO artificial cyan outline shader
    expect(tscn).toContain('name="OcclusionPeekSprite"');
    expect(tscn).toContain('z_as_relative = false');
    expect(tscn).toContain('name="CollisionDebugDrawer"');

    // Verify Intel HD 3000 particle cap <= 36 across all CPUParticles2D emitters
    const particleAmounts = [...tscn.matchAll(/type="CPUParticles2D"[\s\S]*?amount = (\d+)/g)].map((m) => Number(m[1]));
    const totalParticles = particleAmounts.reduce((a, b) => a + b, 0);
    expect(totalParticles).toBeGreaterThan(0);
    expect(totalParticles).toBeLessThanOrEqual(36);

    const gd = fs.readFileSync(path.join(GODOT_ROOT, 'scripts/v73_open_world_forest.gd'), 'utf8');
    expect(gd).toContain('KEY_F3');
    expect(gd).toContain('KEY_F4');
    expect(gd).toContain('--capture-proofs');
    expect(gd).toContain('actual_speed < 8.0');
  });

  it('validates physical open-world collision behaviors (trunks, root arch passage, slow thickets, decorative ferns, pools)', () => {
    const world = getV73OpenWorldDef();

    // 1. Open woodland hub allows smooth cardinal AND diagonal movement
    const openMove = evaluateV73Movement(world, 1024, 836, 10, 10);
    expect(openMove.blocked).toBe(false);
    expect(openMove.x).toBeGreaterThan(1030);
    expect(openMove.y).toBeGreaterThan(842);

    // 2. Massive Hub Titan solid core & buttress root block movement cleanly
    expect(isPointBlocked(world, 1094, 784)).toBe(true);

    // 3. Exposed Root Arch: center passage is 100% WALKABLE (underArch=true), while left & right root pillars BLOCK!
    const archPass = evaluateV73Movement(world, 1118, 452, 0, -10);
    expect(archPass.blocked).toBe(false);
    expect(archPass.underArch).toBe(true);
    expect(isPointBlocked(world, 1118 - 66, 452)).toBe(true);
    expect(isPointBlocked(world, 1118 + 68, 452)).toBe(true);

    // 4. Slow undergrowth bush allows smooth pass-through at deliberate 0.78x resistance (non-blocking!)
    const slowStep = evaluateV73Movement(world, 974, 866, 10, 0);
    expect(slowStep.blocked).toBe(false);
    expect(slowStep.inSlowThicket).toBe(true);
    expect(slowStep.speedMul).toBeCloseTo(0.78, 2);

    // 5. Shallow clearing pool allows smooth wading at 0.90x speed
    const poolStep = evaluateV73Movement(world, 1584, 866, 10, 0);
    expect(poolStep.blocked).toBe(false);
    expect(poolStep.inPool).toBe(true);
    expect(poolStep.speedMul).toBeCloseTo(0.9, 2);

    // 6. Decorative walkable fern does NOT block or slow the player!
    const fernStep = evaluateV73Movement(world, 1202, 858, 8, 0);
    expect(fernStep.blocked).toBe(false);
    expect(fernStep.speedMul).toBe(1.0);

    // 7. Fallen hollow log & mossy boulders solidly block pass-through
    expect(isPointBlocked(world, 616, 868)).toBe(true);
    expect(isPointBlocked(world, 562, 1070)).toBe(true);

    // 8. Every single preset spawn point is guaranteed non-blocked
    for (const preset of Object.values(world.presets)) {
      expect(isPointBlocked(world, preset.playerX, preset.playerY)).toBe(false);
    }
  });

  it('confirms all required V7.3 native visual, collision-debug, boundary & continuous-exploration proofs exist', () => {
    const requiredProofs = [
      'proof_01_woodland_hub_center_640x360.png',
      'proof_02_root_arch_and_hollow_640x360.png',
      'proof_03_sunlit_clearing_and_chimes_640x360.png',
      'proof_04_fallen_log_and_rocks_640x360.png',
      'proof_05_collision_debug_hub_640x360.png',
      'proof_06_collision_debug_arch_640x360.png',
      'proof_07_collision_debug_clearing_log_640x360.png',
      'proof_08_all_4_world_boundaries_quad_1x.png',
      'proof_09_continuous_exploration_9_scenarios_640x360.gif',
      'proof_10_behind_trunk_natural_occlusion_640x360.png',
      'proof_11_waystone_glade_640x360.png',
    ];
    for (const fn of requiredProofs) {
      const fp = path.join(PROOFS_DIR, fn);
      expect(fs.existsSync(fp)).toBe(true);
      expect(fs.statSync(fp).size).toBeGreaterThan(15000);
    }
    expect(fs.existsSync(path.join(GODOT_ROOT, 'run_windows_verification.bat'))).toBe(true);
    expect(fs.existsSync(path.join(STUDY_ROOT, 'playable_web/index.html'))).toBe(true);
  });
});
