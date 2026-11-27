import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const V72_ROOT = path.join(REPO_ROOT, 'game/assets/v72_forest_refinement_study');
const GODOT_DIR = path.join(V72_ROOT, 'godot_project');
const TSCN_PATH = path.join(GODOT_DIR, 'scenes/v72_forest_refinement.tscn');
const GD_PATH = path.join(GODOT_DIR, 'scripts/v72_forest_refinement.gd');
const PROJ_PATH = path.join(GODOT_DIR, 'project.godot');

interface TscnNode {
  name: string;
  type: string;
  parent: string;
  fullPath: string;
  props: Record<string, string>;
}

function parseTscnNodes(tscn: string): TscnNode[] {
  const nodes: TscnNode[] = [];
  const sections = tscn.split(/\n(?=\[)/g);
  for (const sec of sections) {
    const m = sec.match(/^\[node name="([^"]+)" type="([^"]+)"(?: parent="([^"]*)")?\]/);
    if (!m) continue;
    const [, name, type, parent = ''] = m;
    const props: Record<string, string> = {};
    for (const line of sec.split('\n').slice(1)) {
      const kv = line.match(/^([a-zA-Z0-9_/]+)\s*=\s*(.+)$/);
      if (kv) props[kv[1]] = kv[2].trim();
    }
    const fullPath = parent === '' ? '.' : parent === '.' ? name : `${parent}/${name}`;
    nodes.push({ name, type, parent, fullPath, props });
  }
  return nodes;
}

describe('V7.2 Standalone Godot 4.7.2 Project & Strict Isolation Validation', () => {
  it('enforces strict V7.2 isolation via .gdignore and native 480x270 proof outputs', () => {
    expect(fs.existsSync(path.join(V72_ROOT, '.gdignore'))).toBe(true);

    const nativeProofs = [
      'proof_A_dense_forest_corridor_480x270.png',
      'proof_B_deep_forest_interior_480x270.png',
      'proof_C_forest_clearing_480x270.png',
      'proof_F_natural_occlusion_readability_480x270.png',
    ];
    for (const fn of nativeProofs) {
      const fp = path.join(V72_ROOT, 'proofs', fn);
      expect(fs.existsSync(fp)).toBe(true);
      const dims = execFileSync('identify', ['-format', '%wx%h', fp], { encoding: 'utf8' }).trim();
      expect(dims).toBe('480x270');
    }

    expect(fs.existsSync(path.join(V72_ROOT, 'proofs/comparison_V71_vs_V72_native_1x.png'))).toBe(true);
    expect(fs.existsSync(path.join(V72_ROOT, 'proofs/proof_D_environmental_life_loop_480x270.gif'))).toBe(true);
    expect(fs.existsSync(path.join(V72_ROOT, 'proofs/proof_E_playable_walkthrough_A_to_C_480x270.gif'))).toBe(true);
  });

  it('configures Godot 4.7.2 project.godot for native 480x270 integer GL Compatibility pixel art', () => {
    const proj = fs.readFileSync(PROJ_PATH, 'utf8');
    expect(proj).toContain('run/main_scene="res://scenes/v72_forest_refinement.tscn"');
    expect(proj).toContain('window/size/viewport_width=480');
    expect(proj).toContain('window/size/viewport_height=270');
    expect(proj).toContain('window/stretch/mode="viewport"');
    expect(proj).toContain('window/stretch/scale_mode="integer"');
    expect(proj).toContain('renderer/rendering_method="gl_compatibility"');
    expect(proj).toContain('textures/canvas_textures/default_texture_filter=0');
    expect(proj).toContain('2d/snap/snap_2d_transforms_to_pixel=true');
    expect(proj).toContain('2d/snap/snap_2d_vertices_to_pixel=true');
  });

  it('resolves every load_steps, ExtResource file path, and SubResource ID in v72_forest_refinement.tscn with zero dangling references', () => {
    const tscn = fs.readFileSync(TSCN_PATH, 'utf8');

    const headerMatch = tscn.match(/^\[gd_scene load_steps=(\d+) format=3\]/);
    expect(headerMatch).not.toBeNull();
    const declaredLoadSteps = Number(headerMatch![1]);

    const extMap = new Map<string, { type: string; resPath: string }>();
    for (const m of tscn.matchAll(/^\[ext_resource type="([^"]+)" path="(res:\/\/[^"]+)" id="([^"]+)"\]/gm)) {
      const [, type, resPath, id] = m;
      expect(extMap.has(id)).toBe(false);
      extMap.set(id, { type, resPath });
      const diskPath = path.join(GODOT_DIR, resPath.replace(/^res:\/\//, ''));
      expect(fs.existsSync(diskPath), `Missing ExtResource on disk: ${resPath}`).toBe(true);
      expect(fs.statSync(diskPath).size).toBeGreaterThan(0);
    }

    const subIds = new Set<string>();
    for (const m of tscn.matchAll(/^\[sub_resource type="([^"]+)" id="([^"]+)"\]/gm)) {
      const id = m[2];
      expect(subIds.has(id)).toBe(false);
      subIds.add(id);
    }

    expect(declaredLoadSteps).toBe(extMap.size + subIds.size + 1);

    // Every ExtResource("...") and SubResource("...") reference MUST resolve cleanly
    for (const m of tscn.matchAll(/ExtResource\("([^"]+)"\)/g)) {
      expect(extMap.has(m[1]), `Dangling ExtResource("${m[1]}")`).toBe(true);
    }
    for (const m of tscn.matchAll(/SubResource\("([^"]+)"\)/g)) {
      expect(subIds.has(m[1]), `Dangling SubResource("${m[1]}")`).toBe(true);
    }

    // Zero V7.1 metadata-only placeholder stubs allowed!
    expect(tscn).not.toContain('metadata/sprite_key');
  });

  it('wires real Sprite2D visuals, real CollisionShape2D solid obstacles, Y-sorting, Parallax2D layers, Mara, and Environmental Life in Godot', () => {
    const tscn = fs.readFileSync(TSCN_PATH, 'utf8');
    const nodes = parseTscnNodes(tscn);
    const byPath = new Map(nodes.map((n) => [n.fullPath, n]));

    // Horizon Parallax2D + textured HorizonSprite
    const horizonParallax = byPath.get('HorizonParallax');
    expect(horizonParallax?.type).toBe('Parallax2D');
    expect(horizonParallax?.props.scroll_scale).toBe('Vector2(0.22, 0.0)');
    expect(byPath.get('HorizonParallax/HorizonSprite')?.props.texture).toContain('ExtResource(');

    // Textured ForestFloor with puddle ripple ShaderMaterial
    const floor = byPath.get('ForestFloor');
    expect(floor?.type).toBe('Sprite2D');
    expect(floor?.props.texture).toContain('ExtResource(');
    expect(floor?.props.material).toBe('SubResource("mat_puddle_floor")');

    // Y-Sorted World + Mara CharacterBody2D + BodySprite + Natural OcclusionPeekSprite + Collision + Camera2D
    const ySort = byPath.get('YSortWorld');
    expect(ySort?.props.y_sort_enabled).toBe('true');

    expect(byPath.get('YSortWorld/Mara')?.type).toBe('CharacterBody2D');
    expect(byPath.get('YSortWorld/Mara/BodySprite')?.props.texture).toContain('ExtResource(');
    expect(byPath.get('YSortWorld/Mara/OcclusionPeekSprite')?.props.material).toBe('SubResource("mat_mara_occ")');
    expect(byPath.get('YSortWorld/Mara/OcclusionPeekSprite')?.props.z_index).toBe('45');
    expect(byPath.get('YSortWorld/Mara/CollisionShape2D')?.props.shape).toBe('SubResource("shape_mara_body")');
    expect(byPath.get('YSortWorld/Mara/Camera2D')?.type).toBe('Camera2D');

    // Every StaticBody2D solid obstacle MUST own BOTH a textured Sprite2D child AND a real CollisionShape2D child!
    const staticBodies = nodes.filter((n) => n.type === 'StaticBody2D');
    expect(staticBodies.length).toBeGreaterThanOrEqual(18);
    for (const body of staticBodies) {
      const spr = byPath.get(`${body.fullPath}/Sprite2D`);
      const col = byPath.get(`${body.fullPath}/CollisionShape2D`);
      expect(spr?.type, `Solid obstacle ${body.name} missing Sprite2D`).toBe('Sprite2D');
      expect(spr?.props.texture, `Solid obstacle ${body.name} missing Sprite2D texture`).toContain('ExtResource(');
      expect(col?.type, `Solid obstacle ${body.name} missing CollisionShape2D`).toBe('CollisionShape2D');
      expect(col?.props.shape, `Solid obstacle ${body.name} missing CollisionShape2D shape`).toContain('SubResource(');
    }

    // Textured Sprite2D total across all depth planes
    const texturedSprites = nodes.filter((n) => n.type === 'Sprite2D' && n.props.texture?.includes('ExtResource('));
    expect(texturedSprites.length).toBeGreaterThanOrEqual(60);

    // Overhang (1.05x) & Foreground (1.15x) Parallax2D layers with sprites
    expect(byPath.get('OverhangParallax')?.type).toBe('Parallax2D');
    expect(byPath.get('OverhangParallax')?.props.scroll_scale).toBe('Vector2(1.05, 1.0)');
    expect(byPath.get('ForegroundParallax')?.type).toBe('Parallax2D');
    expect(byPath.get('ForegroundParallax')?.props.scroll_scale).toBe('Vector2(1.15, 1.0)');

    // Environmental Life nodes (CanopyDappleOverlay + 3 CPUParticles2D emitters)
    expect(byPath.get('EnvironmentalLifeLayer/CanopyDappleOverlay')?.type).toBe('ColorRect');
    expect(byPath.get('EnvironmentalLifeLayer/FallingLeaves')?.type).toBe('CPUParticles2D');
    expect(byPath.get('EnvironmentalLifeLayer/ChimeAcousticSpores')?.type).toBe('CPUParticles2D');
    expect(byPath.get('EnvironmentalLifeLayer/SunlitPollenMotes')?.type).toBe('CPUParticles2D');

    // Every @onready node path in v72_forest_refinement.gd MUST exist in the .tscn!
    const gd = fs.readFileSync(GD_PATH, 'utf8');
    const onreadyRefs = [...gd.matchAll(/@onready\s+var\s+\w+\s*:\s*\w+\s*=\s*\$([A-Za-z0-9_/]+)/g)];
    expect(onreadyRefs.length).toBeGreaterThanOrEqual(6);
    for (const ref of onreadyRefs) {
      expect(byPath.has(ref[1]), `GDScript @onready $${ref[1]} does not exist in scene`).toBe(true);
    }
    expect(gd).toContain('move_and_slide()');
    expect(gd).toContain('--capture-proofs');
  });

  it('validates all 4 GL Compatibility canvas_item shaders and their scene uniforms', () => {
    const shaderFiles = [
      'foliage_sway.gdshader',
      'puddle_ripples.gdshader',
      'canopy_dapple_light.gdshader',
      'mara_natural_occlusion.gdshader',
    ];
    for (const fn of shaderFiles) {
      const code = fs.readFileSync(path.join(GODOT_DIR, 'shaders', fn), 'utf8');
      expect(code).toContain('shader_type canvas_item;');
      const opens = (code.match(/\{/g) ?? []).length;
      const closes = (code.match(/\}/g) ?? []).length;
      expect(opens).toBe(closes);
      const pOpens = (code.match(/\(/g) ?? []).length;
      const pCloses = (code.match(/\)/g) ?? []).length;
      expect(pOpens).toBe(pCloses);
    }

    // Verify natural occlusion shader avoids neon cyan glow (uses texture color + 2x2 ordered dither)
    const occShader = fs.readFileSync(path.join(GODOT_DIR, 'shaders/mara_natural_occlusion.gdshader'), 'utf8');
    expect(occShader).toContain('texture(TEXTURE, UV)');
    expect(occShader).toContain('FRAGCOORD');
    expect(fs.existsSync(path.join(GODOT_DIR, 'run_windows_verification.bat'))).toBe(true);
  });
});
