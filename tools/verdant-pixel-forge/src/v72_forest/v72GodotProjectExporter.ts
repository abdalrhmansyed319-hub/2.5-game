/**
 * VERDANT SIGNAL V7.2 — REAL STANDALONE GODOT 4.7.2 PROJECT EXPORTER
 * ==================================================================
 * Generates a 100% REAL, ZERO-METADATA-HACK Godot 4.7.2 GL Compatibility project
 * inside `game/assets/v72_forest_refinement_study/godot_project/`:
 *   - Complete `project.godot` (480x270 native, 960x540 2x integer, Nearest filter, pixel snap)
 *   - Self-contained `sprites/*.png` textures referenced via real `ExtResource`
 *   - Real `.gdshader` files (foliage_sway, puddle_ripples, canopy_dapple_light, mara_natural_occlusion)
 *   - Real `scenes/v72_forest_refinement.tscn`:
 *       * HorizonParallax (Parallax2D 0.22x) -> HorizonSprite (Sprite2D)
 *       * ForestFloor (Sprite2D + puddle_ripples ShaderMaterial)
 *       * TreelineLayer -> Sprite2D ridges
 *       * RearTitansLayer (y_sort_enabled) -> Sprite2D rear titans & swaying bushes
 *       * YSortWorld (y_sort_enabled):
 *           - Mara (CharacterBody2D + BodySprite + OcclusionPeekSprite + CollisionShape2D + Camera2D)
 *           - Every solid obstacle -> StaticBody2D + Sprite2D + CollisionShape2D (CapsuleShape2D)
 *           - Every walkable fern skirt -> Sprite2D + unique sway ShaderMaterial
 *       * EnvironmentalLifeLayer -> CanopyDappleOverlay + 3 CPUParticles2D (leaves, chime spores, pollen)
 *       * OverhangParallax (Parallax2D 1.05x) -> swaying canopy Sprite2Ds
 *       * ForegroundParallax (Parallax2D 1.15x) -> swaying foreground fern/bush Sprite2Ds
 *   - Real `scripts/v72_forest_refinement.gd` with playable controls + `--capture-proofs` CLI harness
 *   - `run_windows_verification.bat` for one-command local Windows Godot 4.7.2 verification
 */

import fs from 'node:fs';
import path from 'node:path';
import { type RgbaImage } from '../v7_immersive/v7WorldEngine';
import { V72_VIEW_H, V72_VIEW_W, type V72ForestWorldDef } from './v72ForestEngine';

const FOLIAGE_SWAY_SHADER = `shader_type canvas_item;

// Subtle, pixel-snapped organic wind sway — desynchronized per instance via uniforms
// sway_kind: 1 = fern/bush (root-anchored bottom), 2 = overhang canopy (bough-anchored top)
uniform int sway_kind = 1;
uniform float sway_amp = 1.2;
uniform float sway_speed = 0.9;
uniform float sway_phase = 0.0;
uniform float world_x = 0.0;

void vertex() {
	float gust = 0.68 + 0.32 * sin(TIME * 0.55 - world_x * 0.011);
	float base_wave = sin(TIME * sway_speed + sway_phase) * sway_amp * gust;
	float weight = 0.0;
	if (sway_kind == 1) {
		// Anchored firmly at UV.y == 1.0 (soil roots); gentle rustle at UV.y == 0.0 (frond tips)
		float t = clamp(1.0 - UV.y, 0.0, 1.0);
		float flutter = sin(TIME * (sway_speed * 2.1) + sway_phase + UV.y * 6.0) * 0.32 * sway_amp;
		weight = t * t;
		VERTEX.x += round((base_wave + flutter) * weight);
	} else if (sway_kind == 2) {
		// Anchored at upper bough (UV.y == 0.0); lazy breeze sway along lower hanging moss/leaves
		float t = clamp(UV.y, 0.0, 1.0);
		float rustle = sin(TIME * (sway_speed * 1.8) + sway_phase + UV.y * 4.5) * 0.28 * sway_amp;
		weight = 0.22 + 0.78 * t;
		VERTEX.x += round((base_wave + rustle) * weight);
	}
}
`;

const PUDDLE_RIPPLES_SHADER = `shader_type canvas_item;

// Subtle expanding morning dew-drop ripples + Mara footstep ripples strictly on puddle water pixels
uniform vec2 tex_size = vec2(1440.0, 340.0);
uniform vec2 mara_world_pos = vec2(254.0, 266.0);

float ring_mask(vec2 px, vec2 center, float rx, float ry, float thickness) {
	vec2 d = (px - center) / vec2(max(rx, 0.5), max(ry, 0.5));
	float dist = length(d);
	return smoothstep(thickness, 0.0, abs(dist - 1.0));
}

void fragment() {
	vec4 col = texture(TEXTURE, UV);
	// Detect sky-reflecting rainwater puddle pixels (blue channel clearly exceeds green)
	bool is_puddle = (col.a > 0.5) && (col.b > col.g + 0.055) && (col.b > 0.35);
	if (is_puddle) {
		vec2 px = UV * tex_size;
		float glint = 0.0;

		// 5 staggered natural dew-drop ripples across Zones A, B, and C puddles
		vec4 p0 = vec4(222.0, 264.0, 0.15, 3.9);
		vec4 p1 = vec4(296.0, 294.0, 0.62, 4.7);
		vec4 p2 = vec4(664.0, 278.0, 0.34, 5.1);
		vec4 p3 = vec4(1128.0, 268.0, 0.81, 4.3);
		vec4 p4 = vec4(1258.0, 288.0, 0.08, 3.6);

		vec4 puddles[5] = vec4[5](p0, p1, p2, p3, p4);
		for (int i = 0; i < 5; i++) {
			float cyc = fract(TIME / puddles[i].w + puddles[i].z);
			if (cyc < 0.55) {
				float u = cyc / 0.55;
				float rx = 2.0 + u * 12.0;
				float ry = 1.0 + u * 4.5;
				glint = max(glint, ring_mask(px, puddles[i].xy, rx, ry, 0.18) * (1.0 - u) * 0.62);
			}
		}

		// Mara footstep water ripple when stepping inside any puddle
		float m_dist = length((px - mara_world_pos) / vec2(14.0, 6.0));
		if (m_dist < 1.2) {
			float mu = fract(TIME * 1.4);
			glint = max(glint, ring_mask(px, mara_world_pos - vec2(0.0, 1.0), 3.0 + mu * 8.5, 1.5 + mu * 3.2, 0.22) * (1.0 - mu) * 0.72);
		}

		// Gentle morning sky twinkle glints
		float shimmer = sin(TIME * 2.1 + floor(px.x * 0.35) * 1.9 + floor(px.y * 0.5) * 2.7);
		if (shimmer > 0.94) {
			glint = max(glint, 0.45);
		}

		vec3 ripple_tint = vec3(0.86, 0.98, 1.0);
		col.rgb = mix(col.rgb, ripple_tint, clamp(glint, 0.0, 0.75));
	}
	COLOR = col;
}
`;

const CANOPY_DAPPLE_SHADER = `shader_type canvas_item;

// Subtle shifting golden-chartreuse dappled morning light filtering through swaying canopy
uniform vec2 world_size = vec2(1440.0, 340.0);

void fragment() {
	vec2 px = UV * world_size;
	float d = 0.0;
	vec3 spots[5] = vec3[5](
		vec3(258.0, 256.0, 0.3),
		vec3(682.0, 266.0, 0.9),
		vec3(1182.0, 246.0, 1.1),
		vec3(1234.0, 264.0, 3.2),
		vec3(1166.0, 278.0, 4.4)
	);
	for (int i = 0; i < 5; i++) {
		vec2 c = spots[i].xy + vec2(sin(TIME * 0.72 + spots[i].z) * 3.2, cos(TIME * 0.58 + spots[i].z * 1.3) * 1.4);
		vec2 rel = (px - c) / vec2(26.0, 10.0);
		float dist = length(rel);
		if (dist < 1.0) {
			float pulse = 0.55 + 0.45 * sin(TIME * 0.88 + spots[i].z);
			d = max(d, (1.0 - dist) * pulse * 0.13);
		}
	}
	COLOR = vec4(0.89, 0.94, 0.38, d);
}
`;

const MARA_NATURAL_OCCLUSION_SHADER = `shader_type canvas_item;

// Refined V7.2 player readability: natural 2x2 ordered leaf-gap dither showing Mara's
// actual warm expedition suit & ivory helmet cleanly behind trunks/foliage — ZERO neon cyan glow!
void fragment() {
	vec4 col = texture(TEXTURE, UV);
	if (col.a < 0.5) {
		discard;
	}
	vec2 frag_px = floor(FRAGCOORD.xy);
	int bx = int(mod(frag_px.x, 2.0));
	int by = int(mod(frag_px.y, 2.0));
	int slot = bx * 2 + by;
	float alpha = (slot == 0 || slot == 3) ? 0.60 : 0.26;
	COLOR = vec4(col.rgb, alpha);
}
`;

function buildProjectGodot(): string {
  return `; Engine configuration file.
; VERDANT SIGNAL — V7.2 Isolated Standalone Forest Refinement Study (Godot 4.7.2)
; Strictly isolated from Milestone 01, V7.0, and V7.1.
;
; Native Pixel-Art Viewport: 480x270 (960x540 2x integer preview), GL Compatibility,
; Nearest texture filtering, pixel-snapped transforms/vertices.

config_version=5

[application]

config/name="VERDANT SIGNAL — V7.2 Forest Refinement Study"
config/description="Isolated V7.2 artistic refinement, environmental life, and real Godot 4.7.2 engine validation study."
run/main_scene="res://scenes/v72_forest_refinement.tscn"
config/features=PackedStringArray("4.7", "GL Compatibility")

[display]

window/size/viewport_width=${V72_VIEW_W}
window/size/viewport_height=${V72_VIEW_H}
window/size/window_width_override=${V72_VIEW_W * 2}
window/size/window_height_override=${V72_VIEW_H * 2}
window/stretch/mode="viewport"
window/stretch/aspect="keep"
window/stretch/scale_mode="integer"

[input]

move_left={
"deadzone": 0.2,
"events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":65,"key_label":0,"unicode":97,"location":0,"echo":false,"script":null)
, Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":4194319,"key_label":0,"unicode":0,"location":0,"echo":false,"script":null)
]
}
move_right={
"deadzone": 0.2,
"events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":68,"key_label":0,"unicode":100,"location":0,"echo":false,"script":null)
, Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":4194321,"key_label":0,"unicode":0,"location":0,"echo":false,"script":null)
]
}
move_up={
"deadzone": 0.2,
"events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":87,"key_label":0,"unicode":119,"location":0,"echo":false,"script":null)
, Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":4194320,"key_label":0,"unicode":0,"location":0,"echo":false,"script":null)
]
}
move_down={
"deadzone": 0.2,
"events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":83,"key_label":0,"unicode":115,"location":0,"echo":false,"script":null)
, Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":4194322,"key_label":0,"unicode":0,"location":0,"echo":false,"script":null)
]
}

[layer_names]

2d_physics/layer_1="world_solid"
2d_physics/layer_3="player_body"
2d_physics/layer_8="canopy_occluder"

[physics]

common/physics_interpolation=true
2d/default_gravity=0.0

[rendering]

renderer/rendering_method="gl_compatibility"
renderer/rendering_method.mobile="gl_compatibility"
gl_compatibility/fallback_to_angle=true
textures/canvas_textures/default_texture_filter=0
anti_aliasing/quality/msaa_2d=0
viewport/hdr_2d=false
2d/snap/snap_2d_transforms_to_pixel=true
2d/snap/snap_2d_vertices_to_pixel=true
environment/defaults/default_clear_color=Color(0.035, 0.085, 0.075, 1)
`;
}

function buildGdScript(world: V72ForestWorldDef): string {
  return `extends Node2D
## VERDANT SIGNAL — V7.2 Real Godot 4.7.2 Playable Forest Refinement Study
##
## Interactive Controls:
##   WASD / Arrow Keys : Walk freely through all 3 continuous zones (in front of & behind colossal trunks!)
##   1 / 2 / 3         : Jump directly to Composition A (Corridor), B (Deep Interior), C (Clearing)
##   4                 : Jump to Walk-Behind Colossal Trunk occlusion check
##   5                 : Jump to Between-Exposed-Roots navigation check
##   F9                : Capture native 480x270 PNG screenshot into user:// or res://godot_runtime_captures/
##
## Automated CLI Capture (Windows / Linux Godot 4.7.2):
##   godot --path game/assets/v72_forest_refinement_study/godot_project -- --capture-proofs

const WALK_SPEED := 78.0
const WORLD_W := ${world.worldW}.0
const WORLD_H := ${world.worldH}.0
const MIN_X := ${world.walkBounds.minX}.0
const MAX_X := ${world.walkBounds.maxX}.0
const MIN_Y := ${world.walkBounds.minY}.0
const MAX_Y := ${world.walkBounds.maxY}.0

@onready var forest_floor: Sprite2D = $ForestFloor
@onready var y_sort_world: Node2D = $YSortWorld
@onready var mara: CharacterBody2D = $YSortWorld/Mara
@onready var mara_sprite: Sprite2D = $YSortWorld/Mara/BodySprite
@onready var mara_peek: Sprite2D = $YSortWorld/Mara/OcclusionPeekSprite
@onready var cam: Camera2D = $YSortWorld/Mara/Camera2D
@onready var fg_parallax: Parallax2D = $ForegroundParallax

var _dir_row: int = 1 # 0=down, 1=up, 2=right, 3=left
var _step_acc: float = 0.0
var _step_frame: int = 0
var _occluder_sprites: Array[Sprite2D] = []
var _fg_sprites: Array[Sprite2D] = []

func _ready() -> void:
	cam.limit_left = 0
	cam.limit_top = 24
	cam.limit_right = int(WORLD_W)
	cam.limit_bottom = int(WORLD_H)
	cam.position_smoothing_enabled = true
	cam.position_smoothing_speed = 6.0

	# Collect real Sprite2D nodes inside YSortWorld & ForegroundParallax for precise occlusion peek detection
	for child in y_sort_world.get_children():
		if child == mara:
			continue
		if child is StaticBody2D:
			var spr := child.get_node_or_null("Sprite2D") as Sprite2D
			if spr != null:
				_occluder_sprites.append(spr)
		elif child is Sprite2D:
			_occluder_sprites.append(child as Sprite2D)

	for child in fg_parallax.get_children():
		if child is Sprite2D:
			_fg_sprites.append(child as Sprite2D)

	_apply_mara_frame()

	if "--capture-proofs" in OS.get_cmdline_user_args():
		call_deferred("_run_automated_godot_capture")

func _physics_process(delta: float) -> void:
	var dir := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	if dir == Vector2.ZERO:
		dir = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")

	if dir.length_squared() > 0.001:
		mara.velocity = dir.normalized() * WALK_SPEED
		mara.move_and_slide()
		mara.position.x = clampf(mara.position.x, MIN_X, MAX_X)
		mara.position.y = clampf(mara.position.y, MIN_Y, MAX_Y)
		if absf(dir.x) >= absf(dir.y):
			_dir_row = 2 if dir.x > 0.0 else 3
		else:
			_dir_row = 0 if dir.y > 0.0 else 1
		_step_acc += delta * 8.0
		_step_frame = int(_step_acc) % 4
	else:
		mara.velocity = Vector2.ZERO
		_step_frame = 0

	_apply_mara_frame()
	_update_environmental_integration()

func _apply_mara_frame() -> void:
	var fc := Vector2i(_step_frame, _dir_row)
	mara_sprite.frame_coords = fc
	mara_peek.frame_coords = fc

func _update_environmental_integration() -> void:
	# 1. Drive real-time puddle footstep ripples on ForestFloor shader
	var floor_mat := forest_floor.material as ShaderMaterial
	if floor_mat != null:
		floor_mat.set_shader_parameter("mara_world_pos", mara.global_position)

	# 2. Subtle physical ambient light integration (cooler in deep Zone B interior shade, warmer in Zone C clearing)
	var x := mara.position.x
	if x > 470.0 and x < 955.0:
		mara_sprite.modulate = Color(0.90, 0.94, 0.97, 1.0)
	elif x > 1040.0 and x < 1340.0:
		mara_sprite.modulate = Color(1.04, 1.03, 0.98, 1.0)
	else:
		mara_sprite.modulate = Color(1.0, 1.0, 1.0, 1.0)

	# 3. Real Y-sort & foreground occlusion detection -> enables subtle natural ordered-dither peek ONLY when occluded
	var m_rect := Rect2(mara.global_position + Vector2(-9.0, -32.0), Vector2(18.0, 30.0))
	var occluded := false
	for spr in _occluder_sprites:
		var owner_node := spr.get_parent() as Node2D
		var sort_y := owner_node.global_position.y if owner_node != y_sort_world else spr.global_position.y
		if sort_y <= mara.global_position.y:
			continue
		if spr.texture == null:
			continue
		var sz := spr.texture.get_size()
		# Tight inner silhouette check (excludes transparent margins)
		var spr_rect := Rect2(spr.global_position + spr.offset - sz * 0.36, sz * 0.72)
		if m_rect.intersects(spr_rect):
			occluded = true
			break

	if not occluded:
		var cam_tl := cam.get_screen_center_position() - Vector2(240.0, 135.0)
		var mara_screen := mara.global_position - cam_tl
		var m_srect := Rect2(mara_screen + Vector2(-9.0, -32.0), Vector2(18.0, 30.0))
		for fg in _fg_sprites:
			if fg.texture == null:
				continue
			var sz := fg.texture.get_size()
			var fg_screen := fg.position - cam_tl * fg_parallax.scroll_scale
			var fg_rect := Rect2(fg_screen + sz * 0.12, sz * 0.76)
			if m_srect.intersects(fg_rect):
				occluded = true
				break

	mara_peek.visible = occluded

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		match event.keycode:
			KEY_1:
				_jump_to(Vector2(${world.presets.A_corridor.maraX}.0, ${world.presets.A_corridor.maraY}.0), 1)
			KEY_2:
				_jump_to(Vector2(${world.presets.B_interior.maraX}.0, ${world.presets.B_interior.maraY}.0), 2)
			KEY_3:
				_jump_to(Vector2(${world.presets.C_clearing.maraX}.0, ${world.presets.C_clearing.maraY}.0), 1)
			KEY_4:
				_jump_to(Vector2(382.0, 256.0), 2) # Walk-behind close front-right split hollow arch titan!
			KEY_5:
				_jump_to(Vector2(692.0, 248.0), 2) # Moving between exposed roots & fallen hollow log!
			KEY_F9:
				_save_viewport_capture("manual_capture_480x270.png")

func _jump_to(pos: Vector2, dir_row: int) -> void:
	mara.position = pos
	_dir_row = dir_row
	_step_frame = 0
	cam.reset_smoothing()
	_apply_mara_frame()
	_update_environmental_integration()

func _save_viewport_capture(filename: String) -> void:
	var dir_path := ProjectSettings.globalize_path("res://godot_runtime_captures")
	DirAccess.make_dir_recursive_absolute(dir_path)
	var out_path := dir_path.path_join(filename)
	var img := get_viewport().get_texture().get_image()
	var err := img.save_png(out_path)
	if err == OK:
		print("[V7.2 GODOT CAPTURE] Saved native ", img.get_width(), "x", img.get_height(), " -> ", out_path)
	else:
		push_error("Failed to save capture: " + out_path)

func _run_automated_godot_capture() -> void:
	var shots := [
		["godot_A_dense_corridor_480x270.png", Vector2(${world.presets.A_corridor.maraX}.0, ${world.presets.A_corridor.maraY}.0), 1],
		["godot_B_deep_interior_480x270.png", Vector2(${world.presets.B_interior.maraX}.0, ${world.presets.B_interior.maraY}.0), 2],
		["godot_C_forest_clearing_480x270.png", Vector2(${world.presets.C_clearing.maraX}.0, ${world.presets.C_clearing.maraY}.0), 1],
		["godot_test_walk_behind_trunk_480x270.png", Vector2(390.0, 256.0), 2],
		["godot_test_between_roots_480x270.png", Vector2(734.0, 254.0), 2],
		["godot_test_clearing_focal_outcrop_480x270.png", Vector2(1218.0, 248.0), 1],
	]
	cam.position_smoothing_enabled = false
	for shot in shots:
		_jump_to(shot[1], shot[2])
		await get_tree().process_frame
		await get_tree().process_frame
		_save_viewport_capture(shot[0])
	print("[V7.2 GODOT VERIFICATION] All 6 real Godot 4.7.2 native 480x270 captures completed!")
	get_tree().quit(0)
`;
}

export function exportV72StandaloneGodotProject(opts: {
  godotProjectDir: string;
  sourceSpritesDir: string;
  world: V72ForestWorldDef;
  sprites: Record<string, RgbaImage>;
}): {
  extResourceCount: number;
  subResourceCount: number;
  solidColliderCount: number;
  spriteNodeCount: number;
} {
  const { godotProjectDir, sourceSpritesDir, world, sprites } = opts;
  const gSpritesDir = path.join(godotProjectDir, 'sprites');
  const gShadersDir = path.join(godotProjectDir, 'shaders');
  const gScenesDir = path.join(godotProjectDir, 'scenes');
  const gScriptsDir = path.join(godotProjectDir, 'scripts');

  fs.mkdirSync(gSpritesDir, { recursive: true });
  fs.mkdirSync(gShadersDir, { recursive: true });
  fs.mkdirSync(gScenesDir, { recursive: true });
  fs.mkdirSync(gScriptsDir, { recursive: true });

  // 1. Copy every PNG sprite inside godot_project/sprites/ so res://sprites/*.png resolves 100% natively!
  for (const file of fs.readdirSync(sourceSpritesDir)) {
    if (!file.endsWith('.png')) continue;
    fs.copyFileSync(path.join(sourceSpritesDir, file), path.join(gSpritesDir, file));
  }

  // 2. Write project.godot, shaders, GDScript, and Windows verification launcher
  fs.writeFileSync(path.join(godotProjectDir, 'project.godot'), buildProjectGodot());
  fs.writeFileSync(path.join(gShadersDir, 'foliage_sway.gdshader'), FOLIAGE_SWAY_SHADER);
  fs.writeFileSync(path.join(gShadersDir, 'puddle_ripples.gdshader'), PUDDLE_RIPPLES_SHADER);
  fs.writeFileSync(path.join(gShadersDir, 'canopy_dapple_light.gdshader'), CANOPY_DAPPLE_SHADER);
  fs.writeFileSync(path.join(gShadersDir, 'mara_natural_occlusion.gdshader'), MARA_NATURAL_OCCLUSION_SHADER);
  fs.writeFileSync(path.join(gScriptsDir, 'v72_forest_refinement.gd'), buildGdScript(world));

  // 3. Build 100% REAL Godot 4.7.2 `.tscn` scene with exact ExtResources, SubResources, Sprite2Ds, CollisionShape2Ds, Parallax2Ds, CPUParticles2D!
  const extResLines: string[] = [];
  const subResLines: string[] = [];
  const nodeLines: string[] = [];

  let extIdx = 0;
  const extMap = new Map<string, string>();
  const addExt = (type: string, resPath: string, slug: string): string => {
    const key = `${type}:${resPath}`;
    const existing = extMap.get(key);
    if (existing) return existing;
    extIdx++;
    const id = `${extIdx}_${slug}`;
    extMap.set(key, id);
    extResLines.push(`[ext_resource type="${type}" path="${resPath}" id="${id}"]`);
    return id;
  };

  // Register scripts, shaders, core world textures & Mara spritesheet
  const idScript = addExt('Script', 'res://scripts/v72_forest_refinement.gd', 'main_script');
  const idSwayShader = addExt('Shader', 'res://shaders/foliage_sway.gdshader', 'sway_shader');
  const idPuddleShader = addExt('Shader', 'res://shaders/puddle_ripples.gdshader', 'puddle_shader');
  const idDappleShader = addExt('Shader', 'res://shaders/canopy_dapple_light.gdshader', 'dapple_shader');
  const idOccShader = addExt('Shader', 'res://shaders/mara_natural_occlusion.gdshader', 'occ_shader');
  const idHorizonTex = addExt('Texture2D', 'res://sprites/distant_horizon_640x128.png', 'horizon_tex');
  const idFloorTex = addExt('Texture2D', 'res://sprites/forest_floor_1440x340.png', 'floor_tex');
  const idMaraTex = addExt('Texture2D', 'res://sprites/mara_v72_spritesheet.png', 'mara_tex');

  // Register every unique prop texture used in the scene
  const spriteExtId: Record<string, string> = {};
  for (const p of world.props) {
    if (!spriteExtId[p.spriteKey]) {
      spriteExtId[p.spriteKey] = addExt('Texture2D', `res://sprites/${p.spriteKey}.png`, `tex_${p.spriteKey}`);
    }
  }

  // Register shared SubResources (floor shader material, dapple material, mara occlusion material, mara collider)
  let subCount = 0;
  const addSub = (type: string, id: string, bodyLines: string[]): string => {
    subCount++;
    subResLines.push(`[sub_resource type="${type}" id="${id}"]`);
    for (const l of bodyLines) subResLines.push(l);
    subResLines.push('');
    return id;
  };

  const idFloorMat = addSub('ShaderMaterial', 'mat_puddle_floor', [
    `shader = ExtResource("${idPuddleShader}")`,
    `shader_parameter/tex_size = Vector2(${world.worldW}.0, ${world.worldH}.0)`,
    `shader_parameter/mara_world_pos = Vector2(${world.presets.A_corridor.maraX}.0, ${world.presets.A_corridor.maraY}.0)`,
  ]);
  const idDappleMat = addSub('ShaderMaterial', 'mat_canopy_dapple', [
    `shader = ExtResource("${idDappleShader}")`,
    `shader_parameter/world_size = Vector2(${world.worldW}.0, ${world.worldH}.0)`,
  ]);
  const idOccMat = addSub('ShaderMaterial', 'mat_mara_occ', [
    `shader = ExtResource("${idOccShader}")`,
  ]);
  const idMaraShape = addSub('CapsuleShape2D', 'shape_mara_body', [
    'radius = 5.0',
    'height = 12.0',
  ]);

  // Helper to create unique per-instance desynchronized sway ShaderMaterial
  const makeSwayMat = (p: V72ForestWorldDef['props'][number]): string | null => {
    if (!p.swayKind || p.swayKind === 'none' || p.swayKind === 'chime') return null;
    const kindNum = p.swayKind === 'canopy' ? 2 : 1;
    return addSub('ShaderMaterial', `mat_sway_${p.id}`, [
      `shader = ExtResource("${idSwayShader}")`,
      `shader_parameter/sway_kind = ${kindNum}`,
      `shader_parameter/sway_amp = ${(p.swayAmp ?? 1.1).toFixed(2)}`,
      `shader_parameter/sway_speed = ${(p.swaySpeed ?? 0.85).toFixed(2)}`,
      `shader_parameter/sway_phase = ${(p.swayPhase ?? 0.0).toFixed(2)}`,
      `shader_parameter/world_x = ${p.x.toFixed(1)}`,
    ]);
  };

  let spriteNodeCount = 0;
  let solidColliderCount = 0;

  // Root Node
  nodeLines.push('[node name="V72ForestRefinement" type="Node2D"]');
  nodeLines.push(`script = ExtResource("${idScript}")`);
  nodeLines.push('');

  // PLANE 0: Real Parallax2D Distant Horizon Vista (0.22x) + Textured Sprite2D!
  nodeLines.push('[node name="HorizonParallax" type="Parallax2D" parent="."]');
  nodeLines.push('scroll_scale = Vector2(0.22, 0.0)');
  nodeLines.push('repeat_size = Vector2(640, 0)');
  nodeLines.push('repeat_times = 3');
  nodeLines.push('');
  nodeLines.push('[node name="HorizonSprite" type="Sprite2D" parent="HorizonParallax"]');
  nodeLines.push(`texture = ExtResource("${idHorizonTex}")`);
  nodeLines.push('centered = false');
  nodeLines.push('');
  spriteNodeCount++;

  // PLANE 1A: Real Textured ForestFloor Sprite2D with animated puddle ripple shader!
  nodeLines.push('[node name="ForestFloor" type="Sprite2D" parent="."]');
  nodeLines.push(`material = SubResource("${idFloorMat}")`);
  nodeLines.push(`texture = ExtResource("${idFloorTex}")`);
  nodeLines.push('centered = false');
  nodeLines.push('');
  spriteNodeCount++;

  // PLANE 1B: TreelineLayer with real Sprite2D ridges
  nodeLines.push('[node name="TreelineLayer" type="Node2D" parent="."]');
  nodeLines.push('');
  for (const p of world.props.filter((x) => x.layer === 'treeline')) {
    const sz = sprites[p.spriteKey];
    nodeLines.push(`[node name="${p.id}" type="Sprite2D" parent="TreelineLayer"]`);
    nodeLines.push(`position = Vector2(${p.x}, ${p.y})`);
    nodeLines.push(`texture = ExtResource("${spriteExtId[p.spriteKey]}")`);
    nodeLines.push(`offset = Vector2(0, ${-sz.height / 2})`);
    nodeLines.push('');
    spriteNodeCount++;
  }

  // PLANE 2: RearTitansLayer (y_sort_enabled) with real textured Sprite2D nodes
  nodeLines.push('[node name="RearTitansLayer" type="Node2D" parent="."]');
  nodeLines.push('y_sort_enabled = true');
  nodeLines.push('');
  for (const p of world.props.filter((x) => x.layer === 'bg_titan')) {
    const sz = sprites[p.spriteKey];
    const matId = makeSwayMat(p);
    nodeLines.push(`[node name="${p.id}" type="Sprite2D" parent="RearTitansLayer"]`);
    if (matId) nodeLines.push(`material = SubResource("${matId}")`);
    nodeLines.push(`position = Vector2(${p.x}, ${p.y})`);
    nodeLines.push(`texture = ExtResource("${spriteExtId[p.spriteKey]}")`);
    nodeLines.push(`offset = Vector2(0, ${-sz.height / 2})`);
    nodeLines.push('');
    spriteNodeCount++;
  }

  // PLANE 3: YSortWorld (y_sort_enabled = true) containing Mara + ALL midground solid trunks & walkable ferns!
  nodeLines.push('[node name="YSortWorld" type="Node2D" parent="."]');
  nodeLines.push('y_sort_enabled = true');
  nodeLines.push('');

  // Mara CharacterBody2D + BodySprite + OcclusionPeekSprite + CollisionShape2D + Camera2D
  nodeLines.push('[node name="Mara" type="CharacterBody2D" parent="YSortWorld"]');
  nodeLines.push(`position = Vector2(${world.presets.A_corridor.maraX}, ${world.presets.A_corridor.maraY})`);
  nodeLines.push('collision_layer = 4');
  nodeLines.push('collision_mask = 1');
  nodeLines.push('');
  nodeLines.push('[node name="BodySprite" type="Sprite2D" parent="YSortWorld/Mara"]');
  nodeLines.push(`texture = ExtResource("${idMaraTex}")`);
  nodeLines.push('offset = Vector2(0, -17)');
  nodeLines.push('hframes = 4');
  nodeLines.push('vframes = 4');
  nodeLines.push('frame_coords = Vector2i(0, 1)');
  nodeLines.push('');
  spriteNodeCount++;
  nodeLines.push('[node name="OcclusionPeekSprite" type="Sprite2D" parent="YSortWorld/Mara"]');
  nodeLines.push('visible = false');
  nodeLines.push('z_index = 45');
  nodeLines.push('z_as_relative = false');
  nodeLines.push(`material = SubResource("${idOccMat}")`);
  nodeLines.push(`texture = ExtResource("${idMaraTex}")`);
  nodeLines.push('offset = Vector2(0, -17)');
  nodeLines.push('hframes = 4');
  nodeLines.push('vframes = 4');
  nodeLines.push('frame_coords = Vector2i(0, 1)');
  nodeLines.push('');
  spriteNodeCount++;
  nodeLines.push('[node name="CollisionShape2D" type="CollisionShape2D" parent="YSortWorld/Mara"]');
  nodeLines.push('position = Vector2(0, -3)');
  nodeLines.push('rotation = 1.5707964');
  nodeLines.push(`shape = SubResource("${idMaraShape}")`);
  nodeLines.push('');
  nodeLines.push('[node name="Camera2D" type="Camera2D" parent="YSortWorld/Mara"]');
  nodeLines.push('offset = Vector2(0, -74)');
  nodeLines.push('limit_left = 0');
  nodeLines.push('limit_top = 24');
  nodeLines.push(`limit_right = ${world.worldW}`);
  nodeLines.push(`limit_bottom = ${world.worldH}`);
  nodeLines.push('position_smoothing_enabled = true');
  nodeLines.push('position_smoothing_speed = 6.0');
  nodeLines.push('');

  // Every Y-sorted midground prop: StaticBody2D (+ Sprite2D + CollisionShape2D) for solids, Sprite2D for walkable ferns!
  for (const p of world.props.filter((x) => x.layer === 'ysort')) {
    const sz = sprites[p.spriteKey];
    const matId = makeSwayMat(p);
    if (p.colRx && p.colRy) {
      const shapeId = addSub('CapsuleShape2D', `shape_${p.id}`, [
        `radius = ${p.colRy.toFixed(1)}`,
        `height = ${Math.max(p.colRx * 2, p.colRy * 2).toFixed(1)}`,
      ]);
      nodeLines.push(`[node name="${p.id}" type="StaticBody2D" parent="YSortWorld"]`);
      nodeLines.push(`position = Vector2(${p.x}, ${p.y})`);
      nodeLines.push('collision_layer = 1');
      nodeLines.push('collision_mask = 0');
      nodeLines.push('');
      nodeLines.push(`[node name="Sprite2D" type="Sprite2D" parent="YSortWorld/${p.id}"]`);
      if (matId) nodeLines.push(`material = SubResource("${matId}")`);
      nodeLines.push(`texture = ExtResource("${spriteExtId[p.spriteKey]}")`);
      nodeLines.push(`offset = Vector2(0, ${-sz.height / 2})`);
      nodeLines.push('');
      nodeLines.push(`[node name="CollisionShape2D" type="CollisionShape2D" parent="YSortWorld/${p.id}"]`);
      nodeLines.push(`position = Vector2(0, ${p.colOffsetY ?? -8})`);
      nodeLines.push('rotation = 1.5707964');
      nodeLines.push(`shape = SubResource("${shapeId}")`);
      nodeLines.push('');
      spriteNodeCount++;
      solidColliderCount++;
    } else {
      nodeLines.push(`[node name="${p.id}" type="Sprite2D" parent="YSortWorld"]`);
      if (matId) nodeLines.push(`material = SubResource("${matId}")`);
      nodeLines.push(`position = Vector2(${p.x}, ${p.y})`);
      nodeLines.push(`texture = ExtResource("${spriteExtId[p.spriteKey]}")`);
      nodeLines.push(`offset = Vector2(0, ${-sz.height / 2})`);
      nodeLines.push('');
      spriteNodeCount++;
    }
  }

  // ENVIRONMENTAL LIFE LAYER: Dappled Shifting Sunlight + 3 CPUParticles2D (GL Compatibility / Intel HD 3000 safe!)
  nodeLines.push('[node name="EnvironmentalLifeLayer" type="Node2D" parent="."]');
  nodeLines.push('z_index = 20');
  nodeLines.push('');
  nodeLines.push('[node name="CanopyDappleOverlay" type="ColorRect" parent="EnvironmentalLifeLayer"]');
  nodeLines.push(`material = SubResource("${idDappleMat}")`);
  nodeLines.push(`offset_right = ${world.worldW}.0`);
  nodeLines.push(`offset_bottom = ${world.worldH}.0`);
  nodeLines.push('mouse_filter = 2');
  nodeLines.push('');
  nodeLines.push('[node name="FallingLeaves" type="CPUParticles2D" parent="EnvironmentalLifeLayer"]');
  nodeLines.push('position = Vector2(720, 48)');
  nodeLines.push('amount = 14');
  nodeLines.push('lifetime = 8.5');
  nodeLines.push('preprocess = 4.0');
  nodeLines.push('emission_shape = 3');
  nodeLines.push('emission_rect_extents = Vector2(680, 12)');
  nodeLines.push('direction = Vector2(0.35, 1.0)');
  nodeLines.push('spread = 28.0');
  nodeLines.push('gravity = Vector2(4, 10)');
  nodeLines.push('initial_velocity_min = 12.0');
  nodeLines.push('initial_velocity_max = 22.0');
  nodeLines.push('scale_amount_min = 1.5');
  nodeLines.push('scale_amount_max = 2.0');
  nodeLines.push('color = Color(0.84, 0.52, 0.27, 0.92)');
  nodeLines.push('');
  nodeLines.push('[node name="ChimeAcousticSpores" type="CPUParticles2D" parent="EnvironmentalLifeLayer"]');
  nodeLines.push('position = Vector2(1244, 206)');
  nodeLines.push('amount = 8');
  nodeLines.push('lifetime = 4.2');
  nodeLines.push('preprocess = 2.0');
  nodeLines.push('emission_shape = 3');
  nodeLines.push('emission_rect_extents = Vector2(14, 5)');
  nodeLines.push('direction = Vector2(0, -1)');
  nodeLines.push('spread = 24.0');
  nodeLines.push('gravity = Vector2(0, -3)');
  nodeLines.push('initial_velocity_min = 4.0');
  nodeLines.push('initial_velocity_max = 8.0');
  nodeLines.push('scale_amount_min = 1.0');
  nodeLines.push('scale_amount_max = 1.5');
  nodeLines.push('color = Color(0.58, 0.96, 0.93, 0.80)');
  nodeLines.push('');
  nodeLines.push('[node name="SunlitPollenMotes" type="CPUParticles2D" parent="EnvironmentalLifeLayer"]');
  nodeLines.push('position = Vector2(1196, 232)');
  nodeLines.push('amount = 16');
  nodeLines.push('lifetime = 6.0');
  nodeLines.push('preprocess = 3.0');
  nodeLines.push('emission_shape = 3');
  nodeLines.push('emission_rect_extents = Vector2(160, 48)');
  nodeLines.push('direction = Vector2(0.2, -1.0)');
  nodeLines.push('spread = 45.0');
  nodeLines.push('gravity = Vector2(1, -2)');
  nodeLines.push('initial_velocity_min = 2.0');
  nodeLines.push('initial_velocity_max = 5.0');
  nodeLines.push('color = Color(1.0, 0.90, 0.45, 0.68)');
  nodeLines.push('');

  // PLANE 4: Real OverhangParallax (Parallax2D 1.05x) + swaying canopy Sprite2Ds!
  // Exact Godot 4 Parallax2D placement formula (Parallax2D uses cam_top_left = -canvas_transform.origin):
  // screen_x = gx - cam_tl_x * pf; at cam_tl_x = anchor, screen_x = p.x - anchor => gx = p.x + anchor * (pf - 1)!
  nodeLines.push('[node name="OverhangParallax" type="Parallax2D" parent="."]');
  nodeLines.push('z_index = 30');
  nodeLines.push('scroll_scale = Vector2(1.05, 1.0)');
  nodeLines.push('');
  for (const p of world.props.filter((x) => x.layer === 'overhang')) {
    const pf = 1.05;
    const anchor = p.anchorCamX ?? 0;
    const gx = Math.round(p.x + anchor * (pf - 1));
    const matId = makeSwayMat(p);
    nodeLines.push(`[node name="${p.id}" type="Sprite2D" parent="OverhangParallax"]`);
    if (matId) nodeLines.push(`material = SubResource("${matId}")`);
    nodeLines.push(`position = Vector2(${gx}, ${p.y})`);
    nodeLines.push(`texture = ExtResource("${spriteExtId[p.spriteKey]}")`);
    nodeLines.push('centered = false');
    nodeLines.push('');
    spriteNodeCount++;
  }

  // PLANE 5: Real ForegroundParallax (Parallax2D 1.15x) + swaying foreground fern/bush Sprite2Ds!
  nodeLines.push('[node name="ForegroundParallax" type="Parallax2D" parent="."]');
  nodeLines.push('z_index = 40');
  nodeLines.push('scroll_scale = Vector2(1.15, 1.0)');
  nodeLines.push('');
  for (const p of world.props.filter((x) => x.layer === 'foreground')) {
    const pf = 1.15;
    const anchor = p.anchorCamX ?? 0;
    const gx = Math.round(p.x + anchor * (pf - 1));
    const matId = makeSwayMat(p);
    nodeLines.push(`[node name="${p.id}" type="Sprite2D" parent="ForegroundParallax"]`);
    if (matId) nodeLines.push(`material = SubResource("${matId}")`);
    nodeLines.push(`position = Vector2(${gx}, ${p.y})`);
    nodeLines.push(`texture = ExtResource("${spriteExtId[p.spriteKey]}")`);
    nodeLines.push('centered = false');
    nodeLines.push('');
    spriteNodeCount++;
  }

  const loadSteps = extIdx + subCount + 1;
  const tscn = [
    `[gd_scene load_steps=${loadSteps} format=3]`,
    '',
    ...extResLines,
    '',
    ...subResLines,
    ...nodeLines,
  ].join('\n');

  fs.writeFileSync(path.join(gScenesDir, 'v72_forest_refinement.tscn'), tscn);

  // 4. Write ready-to-use Windows Verification Launcher (`run_windows_verification.bat`)
  const bat = `@echo off
REM VERDANT SIGNAL V7.2 — Real Godot 4.7.2 Local Windows Verification Launcher
REM Usage:
REM   run_windows_verification.bat                -> Launches playable V7.2 forest in Godot 4.7.2
REM   run_windows_verification.bat capture        -> Auto-captures all 6 native 480x270 PNG proofs from Godot!
REM   (Set GODOT_EXE env var if godot is not on PATH, e.g. set GODOT_EXE=C:\\Godot\\Godot_v4.7.2-stable_win64.exe)

if "%GODOT_EXE%"=="" set GODOT_EXE=godot
set PROJ_DIR=%~dp0

if /I "%1"=="capture" (
  echo [V7.2] Running automated Godot 4.7.2 native 480x270 screenshot capture...
  "%GODOT_EXE%" --path "%PROJ_DIR%" -- --capture-proofs
) else (
  echo [V7.2] Launching playable Godot 4.7.2 V7.2 Forest Refinement Study...
  echo        Controls: WASD / Arrows to walk, 1/2/3/4/5 jump zones, F9 screenshot
  "%GODOT_EXE%" --path "%PROJ_DIR%"
)
`;
  fs.writeFileSync(path.join(godotProjectDir, 'run_windows_verification.bat'), bat);

  return {
    extResourceCount: extIdx,
    subResourceCount: subCount,
    solidColliderCount,
    spriteNodeCount,
  };
}
