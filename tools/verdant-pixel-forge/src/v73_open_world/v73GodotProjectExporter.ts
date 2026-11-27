/**
 * VERDANT SIGNAL V7.3 — STANDALONE REAL GODOT 4.7.2 OPEN-WORLD PROJECT EXPORTER
 * ==============================================================================
 * Generates a 100% self-contained, immediately runnable Godot 4.7.2 (GL Compatibility)
 * project at: game/assets/v73_open_world_playability_study/godot_project/
 *
 * Key Guarantees:
 *   - 640x360 native 1:1 viewport matching the user's UNMODIFIED 88x88 (~60px body)
 *     character sprites (integer-scaled 2x -> 1280x720, 3x -> 1920x1080).
 *   - Real multi-shape CollisionPolygon2D on every solid tree trunk, structural buttress
 *     root spur, mossy rock cluster, fallen hollow log, and perimeter thicket.
 *   - Real Area2D + CollisionPolygon2D for walkable slow thickets (0.78x) and walkable
 *     exposed root-arch passages (1.0x).
 *   - Zero collision on overhead canopies; every colossal trunk topped by complete
 *     uncropped overlapping canopy crowns.
 *   - Live F3 Collision-Debug renderer + live F4 Intel HD 3000 Performance HUD +
 *     --capture-proofs CLI verification script + run_windows_verification.bat.
 */

import fs from 'node:fs';
import path from 'node:path';
import { type RgbaImage } from '../v7_immersive/v7WorldEngine';
import {
  V73_CAM_MAX_X,
  V73_CAM_MAX_Y,
  V73_CAM_MIN_X,
  V73_CAM_MIN_Y,
  V73_CHAR_COL_RX,
  V73_CHAR_COL_RY,
  V73_RUN_SPEED,
  V73_VIEW_H,
  V73_VIEW_W,
  V73_WALK_MAX_X,
  V73_WALK_MAX_Y,
  V73_WALK_MIN_X,
  V73_WALK_MIN_Y,
  V73_WALK_SPEED,
  type V73OpenWorldDef,
  isSolidCollider,
} from './v73OpenWorldEngine';

export interface ExportV73GodotOpts {
  godotProjectDir: string;
  sourceSpritesDir: string;
  world: V73OpenWorldDef;
  sprites: Record<string, RgbaImage>;
}

export interface ExportV73GodotStats {
  extResourceCount: number;
  subResourceCount: number;
  spriteNodeCount: number;
  solidBodyCount: number;
  solidPolygonCount: number;
  areaZoneCount: number;
}

function buildFoliageSwayShader(): string {
  return `shader_type canvas_item;
// VERDANT SIGNAL V7.3 — Restrained Desynchronized Foliage & Canopy Sway (Intel HD 3000 safe)
uniform int sway_kind = 1; // 1 = fern/bush (anchored bottom), 2 = overhead canopy (soft center-drape)
uniform float sway_amp = 1.2;
uniform float sway_speed = 0.85;
uniform float sway_phase = 0.0;
uniform float world_x = 0.0;

void vertex() {
	float gust = 0.66 + 0.34 * sin(TIME * 0.55 - world_x * 0.009);
	float wave = sin(TIME * sway_speed + sway_phase) * sway_amp * gust;
	float weight = 0.0;
	if (sway_kind == 2) {
		weight = 0.28 + 0.72 * sin(clamp(UV.y, 0.0, 1.0) * 2.67);
	} else {
		float inv_y = clamp(1.0 - UV.y, 0.0, 1.0);
		weight = inv_y * inv_y;
	}
	VERTEX.x += floor(wave * weight + 0.5);
}
`;
}

function buildPuddleRippleShader(): string {
  return `shader_type canvas_item;
// VERDANT SIGNAL V7.3 — Live Staggered Dew-Drop & Explorer Footstep Water Ripples
uniform vec2 tex_size = vec2(2304.0, 1536.0);
uniform vec2 player_world_pos = vec2(1018.0, 816.0);

float ellipse_ring(vec2 p, vec2 center, vec2 radii, float thickness) {
	vec2 d = (p - center) / max(radii, vec2(1.0));
	float dist = length(d);
	return 1.0 - smoothstep(thickness * 0.4, thickness, abs(dist - 1.0));
}

void fragment() {
	vec4 base = texture(TEXTURE, UV);
	vec2 wp = UV * tex_size;
	bool is_water = (base.b > base.g + 0.05) && (base.b > base.r + 0.14);
	if (is_water) {
		vec2 pools[6];
		pools[0] = vec2(1582.0, 862.0);
		pools[1] = vec2(1742.0, 906.0);
		pools[2] = vec2(1148.0, 1038.0);
		pools[3] = vec2(1266.0, 1086.0);
		pools[4] = vec2(998.0, 744.0);
		pools[5] = vec2(544.0, 632.0);

		float periods[6];
		periods[0] = 4.1; periods[1] = 5.3; periods[2] = 4.6;
		periods[3] = 3.9; periods[4] = 5.0; periods[5] = 4.4;

		float phases[6];
		phases[0] = 0.20; phases[1] = 0.65; phases[2] = 0.10;
		phases[3] = 0.52; phases[4] = 0.80; phases[5] = 0.35;

		float ripple = 0.0;
		for (int i = 0; i < 6; i++) {
			float cyc = fract(TIME / periods[i] + phases[i]);
			if (cyc < 0.56) {
				float u = cyc / 0.56;
				float ring = ellipse_ring(wp, pools[i], vec2(2.0 + u * 12.0, 1.0 + u * 4.5), 0.18);
				ripple = max(ripple, ring * (1.0 - u) * 0.55);
			}
		}

		// Live explorer footstep water ripple when wading across shallow pools!
		float foot_dist = length((wp - player_world_pos) / vec2(22.0, 9.0));
		if (foot_dist < 1.35) {
			float fu = fract(TIME * 1.45);
			float fring = ellipse_ring(wp, player_world_pos, vec2(4.0 + fu * 16.0, 2.0 + fu * 6.0), 0.20);
			ripple = max(ripple, fring * (1.0 - fu) * 0.72);
		}
		base.rgb = mix(base.rgb, vec3(0.863, 0.976, 1.0), clamp(ripple, 0.0, 0.78));
	}
	COLOR = base;
}
`;
}

function buildCanopyDappleShader(): string {
  return `shader_type canvas_item;
// VERDANT SIGNAL V7.3 — Subtle Shifting Canopy Sunlight Shafts (GL Compatibility safe)
uniform vec2 world_size = vec2(2304.0, 1536.0);

void fragment() {
	vec2 wp = UV * world_size;
	float drift_x = sin(TIME * 0.24) * 9.0;
	float drift_y = cos(TIME * 0.18) * 4.5;

	float g_clear = max(0.0, 1.0 - length((wp - vec2(1656.0 + drift_x, 836.0 + drift_y)) / vec2(215.0, 145.0)));
	float g_way = max(0.0, 1.0 - length((wp - vec2(1704.0 - drift_x * 0.6, 468.0 + drift_y)) / vec2(128.0, 92.0)));
	float g_pool = max(0.0, 1.0 - length((wp - vec2(1188.0 + drift_x * 0.7, 1036.0 - drift_y)) / vec2(142.0, 96.0)));
	float g_hub = max(0.0, 1.0 - length((wp - vec2(1076.0 - drift_x * 0.5, 696.0 + drift_y * 0.5)) / vec2(96.0, 72.0)));

	float pulse = 0.85 + 0.15 * sin(TIME * 0.42 + wp.x * 0.008);
	float alpha = (g_clear * g_clear * 0.11 + g_way * g_way * 0.08 + g_pool * g_pool * 0.07 + g_hub * g_hub * 0.05) * pulse;
	COLOR = vec4(1.0, 0.94, 0.58, clamp(alpha, 0.0, 0.15));
}
`;
}

function buildNaturalOcclusionShader(): string {
  return `shader_type canvas_item;
// VERDANT SIGNAL V7.3 — Natural 2x2 Ordered-Dither Foliage Peek (ZERO artificial cyan glow!)
void fragment() {
	vec4 tex = texture(TEXTURE, UV);
	if (tex.a < 0.2) {
		discard;
	}
	int px = int(floor(FRAGCOORD.x)) & 1;
	int py = int(floor(FRAGCOORD.y)) & 1;
	int slot = (py << 1) | px;
	float alpha = (slot == 0 || slot == 3) ? 0.60 : 0.24;
	COLOR = vec4(tex.rgb, tex.a * alpha);
}
`;
}

function buildProjectGodot(): string {
  return `; Engine configuration file — VERDANT SIGNAL V7.3 Standalone Open-World Playability Study
; Target: Windows / Linux Godot 4.7.2 (GL Compatibility — Intel HD Graphics 3000 compatible)
; Viewport: 640x360 native 1:1 matching unmodified 88x88 supplied astronaut sprites
;           (exact 2x integer = 1280x720, exact 3x integer = 1920x1080)

config_version=5

[application]

config/name="Verdant Signal — V7.3 Open-World Forest Playability Study"
run/main_scene="res://scenes/v73_open_world_forest.tscn"
config/features=PackedStringArray("4.7", "GL Compatibility")

[display]

window/size/viewport_width=${V73_VIEW_W}
window/size/viewport_height=${V73_VIEW_H}
window/size/window_width_override=${V73_VIEW_W * 2}
window/size/window_height_override=${V73_VIEW_H * 2}
window/stretch/mode="viewport"
window/stretch/aspect="keep"
window/stretch/scale_mode="integer"

[input]

move_left={
"deadzone": 0.2,
"events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":65,"key_label":0,"unicode":97), Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":4194319,"key_label":0,"unicode":0)]
}
move_right={
"deadzone": 0.2,
"events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":68,"key_label":0,"unicode":100), Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":4194321,"key_label":0,"unicode":0)]
}
move_up={
"deadzone": 0.2,
"events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":87,"key_label":0,"unicode":119), Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":4194320,"key_label":0,"unicode":0)]
}
move_down={
"deadzone": 0.2,
"events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":83,"key_label":0,"unicode":115), Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":4194322,"key_label":0,"unicode":0)]
}
sprint={
"deadzone": 0.2,
"events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":4194325,"key_label":0,"unicode":0)]
}

[layer_names]

2d_physics/layer_1="WorldSolids"
2d_physics/layer_2="Player"
2d_physics/layer_3="WalkableZones"

[rendering]

renderer/rendering_method="gl_compatibility"
renderer/rendering_method.mobile="gl_compatibility"
textures/canvas_textures/default_texture_filter=0
2d/snap/snap_2d_transforms_to_pixel=true
2d/snap/snap_2d_vertices_to_pixel=true
environment/defaults/default_clear_color=Color(0.035, 0.14, 0.11, 1)
`;
}

function buildMainGdScript(world: V73OpenWorldDef): string {
  const poolLines = world.pools.map((p) => `\t{"x": ${p.x}.0, "y": ${p.y}.0, "rx": ${p.rx}.0, "ry": ${p.ry}.0},`).join('\n');
  return `extends Node2D
## VERDANT SIGNAL — V7.3 Real Godot 4.7.2 Continuous Open-World Forest Controller
##
## Features:
##   - True 4-direction + normalized diagonal exploration across 2304x1536 continuous woodland
##   - Unmodified 88x88 supplied character artwork (Idle / Walking / Running, 4 cardinal anims;
##     note: diagonal walk/run frames are not present in supplied ZIP — hysteresis-locked cardinal
##     facing prevents flicker without fabricating missing artwork!)
##   - Blocked-wall anti-slide detection (never plays walk cycle when pushed against solid trunk/rock)
##   - Multi-shape physical CollisionPolygon2D + Area2D slow-thicket (0.78x) & walkable root arch
##   - F3 : Toggle live Collision-Debug overlay directly over artwork
##   - F4 : Toggle live Intel HD 3000 Performance Profiler HUD (FPS, frame ms, draw calls, colliders)
##   - 1-8: Jump to each environmental composition category (Hub, NW Grove, Root Arch, Waystone, Clearing, Pools, Rocks, Fallen Log)
##   - F9 : Capture native 640x360 PNG screenshot
##   - CLI: godot --path game/assets/v73_open_world_playability_study/godot_project -- --capture-proofs

const WALK_SPEED := ${V73_WALK_SPEED}.0
const RUN_SPEED := ${V73_RUN_SPEED}.0
const WALK_FPS := 9.5
const RUN_FPS := 12.5
const IDLE_FPS := 5.0

const MIN_X := ${V73_WALK_MIN_X}.0
const MAX_X := ${V73_WALK_MAX_X}.0
const MIN_Y := ${V73_WALK_MIN_Y}.0
const MAX_Y := ${V73_WALK_MAX_Y}.0

const POOLS := [
${poolLines}
]

const TEX_IDLE: Texture2D = preload("res://sprites/char_idle_88x88_8x4.png")
const TEX_WALK: Texture2D = preload("res://sprites/char_walking_88x88_8x4.png")
const TEX_RUN: Texture2D = preload("res://sprites/char_running_88x88_8x4.png")

@onready var forest_floor: Sprite2D = $ForestFloor
@onready var y_sort_world: Node2D = $YSortWorld
@onready var canopy_layer: Node2D = $CanopyLayer
@onready var perimeter_canopy_layer: Node2D = $PerimeterCanopyLayer
@onready var walkable_zones_layer: Node2D = $WalkableZonesLayer
@onready var player: CharacterBody2D = $YSortWorld/Player
@onready var body_sprite: Sprite2D = $YSortWorld/Player/BodySprite
@onready var peek_sprite: Sprite2D = $YSortWorld/Player/OcclusionPeekSprite
@onready var cam: Camera2D = $YSortWorld/Player/MainCamera
@onready var debug_drawer: Node2D = $CollisionDebugDrawer
@onready var perf_label: Label = $HudCanvas/PerfLabel

# Row mapping in 8x4 88x88 strips: 0=south, 1=north, 2=east, 3=west
var _dir_row: int = 2
var _anim_state: String = "idle"
var _anim_acc: float = 0.0
var _frame_col: int = 0

var _debug_collision: bool = false
var _show_perf_hud: bool = true
var _occluders: Array[Sprite2D] = []
var _canopy_sprites: Array[Sprite2D] = []
var _slow_zone_count: int = 0
var _in_arch_count: int = 0
var _solid_poly_cache: Array[Dictionary] = []
var _area_poly_cache: Array[Dictionary] = []

func _ready() -> void:
	cam.limit_left = ${V73_CAM_MIN_X}
	cam.limit_right = ${V73_CAM_MAX_X + V73_VIEW_W}
	cam.limit_top = ${V73_CAM_MIN_Y}
	cam.limit_bottom = ${V73_CAM_MAX_Y + V73_VIEW_H}
	cam.position_smoothing_enabled = true
	cam.position_smoothing_speed = 7.0

	# Collect real Sprite2D occluders & collision polygons for exact debug draw + natural peek
	for child in y_sort_world.get_children():
		if child == player:
			continue
		if child is StaticBody2D:
			var spr := child.get_node_or_null("Sprite2D") as Sprite2D
			if spr != null:
				_occluders.append(spr)
			for sub in child.get_children():
				if sub is CollisionPolygon2D:
					var role := String(sub.get_meta("role", "solid_trunk"))
					_solid_poly_cache.append({"node": child, "poly": sub.polygon, "role": role})
		elif child is Sprite2D:
			_occluders.append(child as Sprite2D)

	for layer_node in [canopy_layer, perimeter_canopy_layer]:
		for child in layer_node.get_children():
			if child is Sprite2D:
				_canopy_sprites.append(child as Sprite2D)

	# Wire Area2D slow-thicket & walkable root-arch triggers
	for area in walkable_zones_layer.get_children():
		if area is Area2D:
			var role := String(area.get_meta("role", "slow_thicket"))
			area.body_entered.connect(_on_zone_entered.bind(role))
			area.body_exited.connect(_on_zone_exited.bind(role))
			for sub in area.get_children():
				if sub is CollisionPolygon2D:
					_area_poly_cache.append({"node": area, "poly": sub.polygon, "role": role})

	debug_drawer.draw.connect(_on_debug_draw)
	_apply_character_frame()

	if "--capture-proofs" in OS.get_cmdline_user_args():
		call_deferred("_run_automated_godot_capture")

func _on_zone_entered(body: Node2D, role: String) -> void:
	if body != player:
		return
	if role == "slow_thicket":
		_slow_zone_count += 1
	elif role == "walkable_arch":
		_in_arch_count += 1

func _on_zone_exited(body: Node2D, role: String) -> void:
	if body != player:
		return
	if role == "slow_thicket":
		_slow_zone_count = maxi(0, _slow_zone_count - 1)
	elif role == "walkable_arch":
		_in_arch_count = maxi(0, _in_arch_count - 1)

func _physics_process(delta: float) -> void:
	var dir := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	if dir == Vector2.ZERO:
		dir = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")

	var wants_run := Input.is_action_pressed("sprint") or Input.is_key_pressed(KEY_SHIFT)
	var base_speed := RUN_SPEED if wants_run else WALK_SPEED

	# Terrain-aware feel: soft slow-thicket (0.78x) and shallow pool wading (0.90x)
	var terrain_mul := 0.78 if _slow_zone_count > 0 else 1.0
	var in_pool := false
	for pool in POOLS:
		var d := Vector2((player.position.x - pool.x) / pool.rx, (player.position.y - pool.y) / pool.ry).length()
		if d < 0.92:
			in_pool = true
			terrain_mul = minf(terrain_mul, 0.90)
			break

	var prev_pos := player.position
	if dir.length_squared() > 0.001:
		var norm_dir := dir.normalized()
		# Hysteresis-locked 4-cardinal facing (prevents flicker on diagonal release; zero fabricated frames!)
		if absf(norm_dir.x) > absf(norm_dir.y) * 1.12:
			_dir_row = 2 if norm_dir.x > 0.0 else 3
		elif absf(norm_dir.y) > absf(norm_dir.x) * 1.12:
			_dir_row = 0 if norm_dir.y > 0.0 else 1
		else:
			if _dir_row == 0 or _dir_row == 1:
				_dir_row = 0 if norm_dir.y >= 0.0 else 1
			else:
				_dir_row = 2 if norm_dir.x >= 0.0 else 3

		player.velocity = norm_dir * (base_speed * terrain_mul)
		player.move_and_slide()
		player.position.x = clampf(player.position.x, MIN_X, MAX_X)
		player.position.y = clampf(player.position.y, MIN_Y, MAX_Y)

		var actual_speed := player.position.distance_to(prev_pos) / maxf(delta, 0.0001)
		if actual_speed < 8.0:
			# Blocked against solid trunk/rock -> immediately stop walking animation (zero wall-sliding!)
			_set_anim_state("idle")
		else:
			_set_anim_state("running" if (wants_run and actual_speed > 94.0) else "walking")
	else:
		player.velocity = Vector2.ZERO
		_set_anim_state("idle")

	var fps := RUN_FPS if _anim_state == "running" else (WALK_FPS if _anim_state == "walking" else IDLE_FPS)
	_anim_acc += delta * fps
	_frame_col = int(_anim_acc) % 8
	_apply_character_frame()
	_update_environment_and_occlusion()

	if _debug_collision:
		debug_drawer.queue_redraw()
	if _show_perf_hud:
		_update_perf_hud(in_pool)

func _set_anim_state(next_state: String) -> void:
	if _anim_state != next_state:
		_anim_state = next_state
		_anim_acc = 0.0
		_frame_col = 0

func _apply_character_frame() -> void:
	var tex := TEX_RUN if _anim_state == "running" else (TEX_WALK if _anim_state == "walking" else TEX_IDLE)
	if body_sprite.texture != tex:
		body_sprite.texture = tex
		peek_sprite.texture = tex
	var fc := Vector2i(_frame_col, _dir_row)
	body_sprite.frame_coords = fc
	peek_sprite.frame_coords = fc

func _update_environment_and_occlusion() -> void:
	var floor_mat := forest_floor.material as ShaderMaterial
	if floor_mat != null:
		floor_mat.set_shader_parameter("player_world_pos", player.global_position)

	# Subtle physical light integration (warm sunlit clearing vs cool ancient canopy shade)
	var dist_clear := Vector2((player.position.x - 1656.0) / 245.0, (player.position.y - 836.0) / 168.0).length()
	if dist_clear < 1.0:
		body_sprite.modulate = Color(1.03, 1.02, 0.99, 1.0)
	elif player.position.x < 760.0 and player.position.y < 680.0:
		body_sprite.modulate = Color(0.91, 0.94, 0.98, 1.0)
	else:
		body_sprite.modulate = Color(1.0, 1.0, 1.0, 1.0)

	# Detect real Y-sort trunk/arch OR overhead canopy occlusion -> toggle natural 2x2 ordered-dither peek!
	var p_rect := Rect2(player.global_position + Vector2(-15.0, -54.0), Vector2(30.0, 50.0))
	var occluded := _in_arch_count > 0
	if not occluded:
		for spr in _occluders:
			if spr.texture == null:
				continue
			var owner_n := spr.get_parent() as Node2D
			var sort_y := owner_n.global_position.y if owner_n != y_sort_world else spr.global_position.y
			if sort_y <= player.global_position.y:
				continue
			var sz := spr.texture.get_size()
			var spr_rect := Rect2(spr.global_position + spr.offset - sz * 0.34, sz * 0.68)
			if p_rect.intersects(spr_rect):
				occluded = true
				break
	if not occluded:
		for cspr in _canopy_sprites:
			if cspr.texture == null:
				continue
			var sz := cspr.texture.get_size()
			var crect := Rect2(cspr.global_position - sz * 0.36, sz * 0.72)
			if p_rect.intersects(crect):
				occluded = true
				break
	peek_sprite.visible = occluded

func _on_debug_draw() -> void:
	if not _debug_collision:
		return
	var role_colors := {
		"solid_trunk": Color(1.0, 0.29, 0.29, 0.95),
		"solid_root": Color(1.0, 0.64, 0.22, 0.95),
		"solid_rock": Color(0.30, 0.76, 1.0, 0.95),
		"solid_log": Color(1.0, 0.48, 0.25, 0.95),
		"solid_thicket": Color(0.85, 0.42, 1.0, 0.95),
		"slow_thicket": Color(0.72, 1.0, 0.29, 0.92),
		"walkable_arch": Color(0.22, 0.95, 1.0, 0.92),
	}
	for item in _solid_poly_cache:
		var node: Node2D = item["node"]
		var poly: PackedVector2Array = item["poly"]
		var col: Color = role_colors.get(item["role"], Color.RED)
		var world_pts := PackedVector2Array()
		for pt in poly:
			world_pts.append(node.global_position + pt)
		debug_drawer.draw_colored_polygon(world_pts, Color(col.r, col.g, col.b, 0.24))
		var closed := world_pts.duplicate()
		closed.append(world_pts[0])
		debug_drawer.draw_polyline(closed, col, 1.0, false)

	for item in _area_poly_cache:
		var node: Node2D = item["node"]
		var poly: PackedVector2Array = item["poly"]
		var col: Color = role_colors.get(item["role"], Color.GREEN)
		var world_pts := PackedVector2Array()
		for pt in poly:
			world_pts.append(node.global_position + pt)
		debug_drawer.draw_colored_polygon(world_pts, Color(col.r, col.g, col.b, 0.18))
		var closed := world_pts.duplicate()
		closed.append(world_pts[0])
		debug_drawer.draw_polyline(closed, col, 1.0, false)

	# Draw player's exact foot footprint ellipse
	var foot_pts := PackedVector2Array()
	for i in range(25):
		var a := (float(i) / 24.0) * TAU
		foot_pts.append(player.global_position + Vector2(cos(a) * ${V73_CHAR_COL_RX}.0, sin(a) * ${V73_CHAR_COL_RY}.0))
	debug_drawer.draw_polyline(foot_pts, Color.WHITE, 1.0, false)

func _update_perf_hud(in_pool: bool) -> void:
	var fps := Engine.get_frames_per_second()
	var frame_ms := Performance.get_monitor(Performance.TIME_PROCESS) * 1000.0
	var draws := int(Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME))
	var zone_note := "SLOW_THICKET(0.78x)" if _slow_zone_count > 0 else ("UNDER_ARCH" if _in_arch_count > 0 else ("SHALLOW_POOL(0.90x)" if in_pool else "OPEN_MOSS(1.0x)"))
	perf_label.text = "V7.3 GODOT 4.7.2 | %d FPS (%.1f ms) | Draws:%d | Polygons:%d | Pos:(%d,%d) | %s | %s | F3:ColDebug F4:HUD" % [
		fps, frame_ms, draws, _solid_poly_cache.size() + _area_poly_cache.size(),
		int(player.position.x), int(player.position.y), _anim_state.to_upper(), zone_note
	]

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		match event.keycode:
			KEY_F3:
				_debug_collision = not _debug_collision
				debug_drawer.queue_redraw()
			KEY_F4:
				_show_perf_hud = not _show_perf_hud
				perf_label.visible = _show_perf_hud
			KEY_1: _jump_to(Vector2(1024.0, 822.0), 2)
			KEY_2: _jump_to(Vector2(586.0, 582.0), 1)
			KEY_3: _jump_to(Vector2(1118.0, 454.0), 1)
			KEY_4: _jump_to(Vector2(1656.0, 518.0), 1)
			KEY_5: _jump_to(Vector2(1618.0, 824.0), 2)
			KEY_6: _jump_to(Vector2(1146.0, 1044.0), 2)
			KEY_7: _jump_to(Vector2(654.0, 1116.0), 3)
			KEY_8: _jump_to(Vector2(632.0, 944.0), 3)
			KEY_F9:
				_save_capture("manual_v73_640x360.png")

func _jump_to(pos: Vector2, dir_row: int) -> void:
	player.position = pos
	_dir_row = dir_row
	cam.reset_smoothing()
	_apply_character_frame()
	_update_environment_and_occlusion()

func _save_capture(filename: String) -> void:
	var out_dir := ProjectSettings.globalize_path("res://godot_runtime_captures")
	DirAccess.make_dir_recursive_absolute(out_dir)
	var img := get_viewport().get_texture().get_image()
	var full_path := out_dir.path_join(filename)
	img.save_png(full_path)
	print("V7.3 Godot runtime capture saved: ", full_path, " (", img.get_width(), "x", img.get_height(), ")")

func _run_automated_godot_capture() -> void:
	_show_perf_hud = false
	perf_label.visible = false
	var shots := [
		{"name": "godot_01_woodland_hub_640x360.png", "pos": Vector2(1024.0, 822.0), "dir": 2, "dbg": false},
		{"name": "godot_02_root_arch_640x360.png", "pos": Vector2(1118.0, 454.0), "dir": 1, "dbg": false},
		{"name": "godot_03_sunlit_clearing_640x360.png", "pos": Vector2(1618.0, 824.0), "dir": 2, "dbg": false},
		{"name": "godot_04_waystone_glade_640x360.png", "pos": Vector2(1656.0, 518.0), "dir": 1, "dbg": false},
		{"name": "godot_05_collision_debug_hub_640x360.png", "pos": Vector2(1024.0, 822.0), "dir": 2, "dbg": true},
		{"name": "godot_06_collision_debug_arch_640x360.png", "pos": Vector2(1118.0, 454.0), "dir": 1, "dbg": true},
		{"name": "godot_07_boundary_north_640x360.png", "pos": Vector2(1118.0, 314.0), "dir": 1, "dbg": false},
		{"name": "godot_08_boundary_south_640x360.png", "pos": Vector2(1152.0, 1216.0), "dir": 0, "dbg": false},
		{"name": "godot_09_boundary_west_640x360.png", "pos": Vector2(368.0, 938.0), "dir": 3, "dbg": false},
		{"name": "godot_10_boundary_east_640x360.png", "pos": Vector2(1924.0, 758.0), "dir": 2, "dbg": false},
	]
	for s in shots:
		_debug_collision = s["dbg"]
		_jump_to(s["pos"], s["dir"])
		debug_drawer.queue_redraw()
		await get_tree().process_frame
		await get_tree().process_frame
		await RenderingServer.frame_post_draw
		_save_capture(s["name"])
	get_tree().quit(0)
`;
}

export function exportV73StandaloneGodotProject(opts: ExportV73GodotOpts): ExportV73GodotStats {
  const { godotProjectDir, sourceSpritesDir, world, sprites } = opts;
  const gSpritesDir = path.join(godotProjectDir, 'sprites');
  const gShadersDir = path.join(godotProjectDir, 'shaders');
  const gScenesDir = path.join(godotProjectDir, 'scenes');
  const gScriptsDir = path.join(godotProjectDir, 'scripts');

  fs.mkdirSync(gSpritesDir, { recursive: true });
  fs.mkdirSync(gShadersDir, { recursive: true });
  fs.mkdirSync(gScenesDir, { recursive: true });
  fs.mkdirSync(gScriptsDir, { recursive: true });

  // 1. Copy every sprite PNG (including unmodified packed 88x88 character strips + 2304x1536 floor)
  for (const fn of fs.readdirSync(sourceSpritesDir)) {
    if (!fn.endsWith('.png')) continue;
    fs.copyFileSync(path.join(sourceSpritesDir, fn), path.join(gSpritesDir, fn));
  }

  // 2. Write project.godot, 4 GL Compatibility shaders, and main GDScript controller
  fs.writeFileSync(path.join(godotProjectDir, 'project.godot'), buildProjectGodot());
  fs.writeFileSync(path.join(gShadersDir, 'foliage_sway.gdshader'), buildFoliageSwayShader());
  fs.writeFileSync(path.join(gShadersDir, 'puddle_ripples.gdshader'), buildPuddleRippleShader());
  fs.writeFileSync(path.join(gShadersDir, 'canopy_dapple_light.gdshader'), buildCanopyDappleShader());
  fs.writeFileSync(path.join(gShadersDir, 'mara_natural_occlusion.gdshader'), buildNaturalOcclusionShader());
  fs.writeFileSync(path.join(gScriptsDir, 'v73_open_world_forest.gd'), buildMainGdScript(world));

  // 3. Assemble real node-based Godot 4.7.2 scene: scenes/v73_open_world_forest.tscn
  const extLines: string[] = [];
  const subLines: string[] = [];
  const nodeLines: string[] = [];

  let extIdx = 0;
  const addExt = (type: string, resPath: string, suffix: string): string => {
    extIdx++;
    const id = `${extIdx}_${suffix}`;
    extLines.push(`[ext_resource type="${type}" path="${resPath}" id="${id}"]`);
    return id;
  };

  const idScript = addExt('Script', 'res://scripts/v73_open_world_forest.gd', 'main_script');
  const idSwayShader = addExt('Shader', 'res://shaders/foliage_sway.gdshader', 'sway_shader');
  const idPuddleShader = addExt('Shader', 'res://shaders/puddle_ripples.gdshader', 'puddle_shader');
  const idDappleShader = addExt('Shader', 'res://shaders/canopy_dapple_light.gdshader', 'dapple_shader');
  const idOccShader = addExt('Shader', 'res://shaders/mara_natural_occlusion.gdshader', 'occ_shader');
  const idFloorTex = addExt('Texture2D', 'res://sprites/forest_floor_2304x1536.png', 'floor_tex');
  const idCharIdleTex = addExt('Texture2D', 'res://sprites/char_idle_88x88_8x4.png', 'char_idle_tex');

  const spriteExtId: Record<string, string> = {};
  for (const p of world.props) {
    if (!spriteExtId[p.spriteKey]) {
      spriteExtId[p.spriteKey] = addExt('Texture2D', `res://sprites/${p.spriteKey}.png`, `tex_${p.spriteKey}`);
    }
  }

  let subCount = 0;
  const addSub = (type: string, id: string, body: string[]): string => {
    subCount++;
    subLines.push(`[sub_resource type="${type}" id="${id}"]`);
    for (const b of body) subLines.push(b);
    subLines.push('');
    return id;
  };

  const idFloorMat = addSub('ShaderMaterial', 'mat_puddle_floor', [
    `shader = ExtResource("${idPuddleShader}")`,
    `shader_parameter/tex_size = Vector2(${world.worldW}.0, ${world.worldH}.0)`,
    `shader_parameter/player_world_pos = Vector2(${world.presets.hub_center.playerX}.0, ${world.presets.hub_center.playerY}.0)`,
  ]);
  const idDappleMat = addSub('ShaderMaterial', 'mat_canopy_dapple', [
    `shader = ExtResource("${idDappleShader}")`,
    `shader_parameter/world_size = Vector2(${world.worldW}.0, ${world.worldH}.0)`,
  ]);
  const idOccMat = addSub('ShaderMaterial', 'mat_natural_occ', [`shader = ExtResource("${idOccShader}")`]);
  const idPlayerFootShape = addSub('CapsuleShape2D', 'shape_player_foot', [
    `radius = ${V73_CHAR_COL_RY}.0`,
    `height = ${V73_CHAR_COL_RX * 2}.0`,
  ]);

  const makeSwayMat = (p: V73OpenWorldDef['props'][number]): string | null => {
    if (!p.swayKind || p.swayKind === 'none' || p.swayKind === 'chime') return null;
    const kindNum = p.swayKind === 'canopy' ? 2 : 1;
    return addSub('ShaderMaterial', `mat_sway_${p.id}`, [
      `shader = ExtResource("${idSwayShader}")`,
      `shader_parameter/sway_kind = ${kindNum}`,
      `shader_parameter/sway_amp = ${(p.swayAmp ?? 1.1).toFixed(2)}`,
      `shader_parameter/sway_speed = ${(p.swaySpeed ?? 0.8).toFixed(2)}`,
      `shader_parameter/sway_phase = ${(p.swayPhase ?? 0.0).toFixed(2)}`,
      `shader_parameter/world_x = ${p.x.toFixed(1)}`,
    ]);
  };

  const formatPoly = (pts: Array<{ x: number; y: number }>) =>
    `PackedVector2Array(${pts.map((pt) => `${pt.x}, ${pt.y}`).join(', ')})`;

  let spriteNodeCount = 0;
  let solidBodyCount = 0;
  let solidPolygonCount = 0;
  let areaZoneCount = 0;

  // Root
  nodeLines.push('[node name="V73OpenWorldForest" type="Node2D"]');
  nodeLines.push(`script = ExtResource("${idScript}")`);
  nodeLines.push('');

  // Continuous 2304x1536 Forest Floor with real Puddle Ripple Shader
  nodeLines.push('[node name="ForestFloor" type="Sprite2D" parent="."]');
  nodeLines.push(`material = SubResource("${idFloorMat}")`);
  nodeLines.push(`texture = ExtResource("${idFloorTex}")`);
  nodeLines.push('centered = false');
  nodeLines.push('');
  spriteNodeCount++;

  // Y-Sorted World (Player + All Solid Multi-Polygon Trees/Rocks/Logs/Landmarks + Walkable Ferns)
  nodeLines.push('[node name="YSortWorld" type="Node2D" parent="."]');
  nodeLines.push('y_sort_enabled = true');
  nodeLines.push('');

  // Player CharacterBody2D (UNMODIFIED 88x88 sprites, foot anchor at pixel (44,75) -> offset=(0, -31)!)
  nodeLines.push('[node name="Player" type="CharacterBody2D" parent="YSortWorld"]');
  nodeLines.push(`position = Vector2(${world.presets.hub_center.playerX}, ${world.presets.hub_center.playerY})`);
  nodeLines.push('collision_layer = 2');
  nodeLines.push('collision_mask = 1');
  nodeLines.push('');
  nodeLines.push('[node name="BodySprite" type="Sprite2D" parent="YSortWorld/Player"]');
  nodeLines.push(`texture = ExtResource("${idCharIdleTex}")`);
  nodeLines.push('offset = Vector2(0, -31)');
  nodeLines.push('hframes = 8');
  nodeLines.push('vframes = 4');
  nodeLines.push('frame_coords = Vector2i(0, 2)');
  nodeLines.push('');
  spriteNodeCount++;
  nodeLines.push('[node name="OcclusionPeekSprite" type="Sprite2D" parent="YSortWorld/Player"]');
  nodeLines.push('visible = false');
  nodeLines.push('z_index = 45');
  nodeLines.push('z_as_relative = false');
  nodeLines.push(`material = SubResource("${idOccMat}")`);
  nodeLines.push(`texture = ExtResource("${idCharIdleTex}")`);
  nodeLines.push('offset = Vector2(0, -31)');
  nodeLines.push('hframes = 8');
  nodeLines.push('vframes = 4');
  nodeLines.push('frame_coords = Vector2i(0, 2)');
  nodeLines.push('');
  spriteNodeCount++;
  nodeLines.push('[node name="FootCollider" type="CollisionShape2D" parent="YSortWorld/Player"]');
  nodeLines.push('rotation = 1.5707964');
  nodeLines.push(`shape = SubResource("${idPlayerFootShape}")`);
  nodeLines.push('');
  nodeLines.push('[node name="MainCamera" type="Camera2D" parent="YSortWorld/Player"]');
  nodeLines.push('offset = Vector2(0, -24)');
  nodeLines.push(`limit_left = ${V73_CAM_MIN_X}`);
  nodeLines.push(`limit_right = ${V73_CAM_MAX_X + V73_VIEW_W}`);
  nodeLines.push(`limit_top = ${V73_CAM_MIN_Y}`);
  nodeLines.push(`limit_bottom = ${V73_CAM_MAX_Y + V73_VIEW_H}`);
  nodeLines.push('position_smoothing_enabled = true');
  nodeLines.push('position_smoothing_speed = 7.0');
  nodeLines.push('');

  const walkableZoneNodes: string[] = [];

  for (const p of world.props) {
    if (p.layer !== 'ysort' && p.layer !== 'overhead_arch') continue;
    const sz = sprites[p.spriteKey];
    const matId = makeSwayMat(p);
    const solidLocals = (p.localColliders ?? []).filter((lc) => isSolidCollider(lc.role));
    const areaLocals = (p.localColliders ?? []).filter((lc) => !isSolidCollider(lc.role));

    if (solidLocals.length > 0) {
      nodeLines.push(`[node name="${p.id}" type="StaticBody2D" parent="YSortWorld"]`);
      nodeLines.push(`position = Vector2(${p.x}, ${p.y + (p.sortOffsetY ?? 0)})`);
      nodeLines.push('collision_layer = 1');
      nodeLines.push('collision_mask = 0');
      nodeLines.push('');
      nodeLines.push(`[node name="Sprite2D" type="Sprite2D" parent="YSortWorld/${p.id}"]`);
      if (matId) nodeLines.push(`material = SubResource("${matId}")`);
      nodeLines.push(`texture = ExtResource("${spriteExtId[p.spriteKey]}")`);
      nodeLines.push(`offset = Vector2(0, ${-sz.height / 2 - (p.sortOffsetY ?? 0)})`);
      nodeLines.push('');
      spriteNodeCount++;
      solidBodyCount++;

      for (const lc of solidLocals) {
        const adjPts = lc.points.map((pt) => ({ x: pt.x, y: pt.y - (p.sortOffsetY ?? 0) }));
        nodeLines.push(`[node name="Col_${lc.suffix}" type="CollisionPolygon2D" parent="YSortWorld/${p.id}"]`);
        nodeLines.push(`polygon = ${formatPoly(adjPts)}`);
        nodeLines.push(`metadata/role = "${lc.role}"`);
        nodeLines.push('');
        solidPolygonCount++;
      }
    } else {
      nodeLines.push(`[node name="${p.id}" type="Sprite2D" parent="YSortWorld"]`);
      if (matId) nodeLines.push(`material = SubResource("${matId}")`);
      nodeLines.push(`position = Vector2(${p.x}, ${p.y})`);
      nodeLines.push(`texture = ExtResource("${spriteExtId[p.spriteKey]}")`);
      nodeLines.push(`offset = Vector2(0, ${-sz.height / 2})`);
      nodeLines.push('');
      spriteNodeCount++;
    }

    // Separate Area2D triggers for walkable slow-thickets (0.78x) and walkable root-arch passages (1.0x)!
    for (const ac of areaLocals) {
      const aName = `Zone_${p.id}_${ac.suffix}`;
      walkableZoneNodes.push(`[node name="${aName}" type="Area2D" parent="WalkableZonesLayer"]`);
      walkableZoneNodes.push(`position = Vector2(${p.x}, ${p.y})`);
      walkableZoneNodes.push('collision_layer = 4');
      walkableZoneNodes.push('collision_mask = 2');
      walkableZoneNodes.push(`metadata/role = "${ac.role}"`);
      walkableZoneNodes.push('');
      walkableZoneNodes.push(`[node name="Shape" type="CollisionPolygon2D" parent="WalkableZonesLayer/${aName}"]`);
      walkableZoneNodes.push(`polygon = ${formatPoly(ac.points)}`);
      walkableZoneNodes.push('');
      areaZoneCount++;
    }
  }

  // Walkable Zones Layer (Area2D slow-thickets & arch tunnels)
  nodeLines.push('[node name="WalkableZonesLayer" type="Node2D" parent="."]');
  nodeLines.push('');
  nodeLines.push(...walkableZoneNodes);

  // Overhead Canopy Layer (ZERO ground collision — covers 100% of colossal trunk tops!)
  nodeLines.push('[node name="CanopyLayer" type="Node2D" parent="."]');
  nodeLines.push('z_index = 30');
  nodeLines.push('');
  for (const p of world.props.filter((x) => x.layer === 'canopy')) {
    const matId = makeSwayMat(p);
    nodeLines.push(`[node name="${p.id}" type="Sprite2D" parent="CanopyLayer"]`);
    if (matId) nodeLines.push(`material = SubResource("${matId}")`);
    nodeLines.push(`position = Vector2(${p.x}, ${p.y})`);
    nodeLines.push(`texture = ExtResource("${spriteExtId[p.spriteKey]}")`);
    nodeLines.push('');
    spriteNodeCount++;
  }

  // Continuous Perimeter Canopy Roof Layer (z_index=35 — seals all 4 boundaries!)
  nodeLines.push('[node name="PerimeterCanopyLayer" type="Node2D" parent="."]');
  nodeLines.push('z_index = 35');
  nodeLines.push('');
  for (const p of world.props.filter((x) => x.layer === 'perimeter_canopy')) {
    const matId = makeSwayMat(p);
    nodeLines.push(`[node name="${p.id}" type="Sprite2D" parent="PerimeterCanopyLayer"]`);
    if (matId) nodeLines.push(`material = SubResource("${matId}")`);
    nodeLines.push(`position = Vector2(${p.x}, ${p.y})`);
    nodeLines.push(`texture = ExtResource("${spriteExtId[p.spriteKey]}")`);
    nodeLines.push('');
    spriteNodeCount++;
  }

  // Environmental Life Layer (lightweight Intel HD 3000 safe CPUParticles2D <= 36 total!)
  nodeLines.push('[node name="EnvironmentalLifeLayer" type="Node2D" parent="."]');
  nodeLines.push('z_index = 38');
  nodeLines.push('');
  nodeLines.push('[node name="CanopyDappleOverlay" type="ColorRect" parent="EnvironmentalLifeLayer"]');
  nodeLines.push(`material = SubResource("${idDappleMat}")`);
  nodeLines.push(`offset_right = ${world.worldW}.0`);
  nodeLines.push(`offset_bottom = ${world.worldH}.0`);
  nodeLines.push('mouse_filter = 2');
  nodeLines.push('');
  nodeLines.push('[node name="FallingLeaves" type="CPUParticles2D" parent="EnvironmentalLifeLayer"]');
  nodeLines.push('position = Vector2(1152, 540)');
  nodeLines.push('amount = 18');
  nodeLines.push('lifetime = 8.0');
  nodeLines.push('preprocess = 4.0');
  nodeLines.push('emission_shape = 3');
  nodeLines.push('emission_rect_extents = Vector2(840, 420)');
  nodeLines.push('direction = Vector2(0.32, 1.0)');
  nodeLines.push('spread = 26.0');
  nodeLines.push('gravity = Vector2(4, 10)');
  nodeLines.push('initial_velocity_min = 12.0');
  nodeLines.push('initial_velocity_max = 20.0');
  nodeLines.push('scale_amount_min = 1.5');
  nodeLines.push('scale_amount_max = 2.0');
  nodeLines.push('color = Color(0.84, 0.52, 0.27, 0.90)');
  nodeLines.push('');
  nodeLines.push('[node name="ChimeSporesClearing" type="CPUParticles2D" parent="EnvironmentalLifeLayer"]');
  nodeLines.push('position = Vector2(1724, 742)');
  nodeLines.push('amount = 8');
  nodeLines.push('lifetime = 4.0');
  nodeLines.push('preprocess = 2.0');
  nodeLines.push('emission_shape = 3');
  nodeLines.push('emission_rect_extents = Vector2(16, 6)');
  nodeLines.push('direction = Vector2(0, -1)');
  nodeLines.push('spread = 24.0');
  nodeLines.push('gravity = Vector2(0, -3)');
  nodeLines.push('initial_velocity_min = 4.0');
  nodeLines.push('initial_velocity_max = 8.0');
  nodeLines.push('scale_amount_min = 1.0');
  nodeLines.push('scale_amount_max = 1.5');
  nodeLines.push('color = Color(0.58, 0.96, 0.93, 0.82)');
  nodeLines.push('');
  nodeLines.push('[node name="WaystoneSporesGlade" type="CPUParticles2D" parent="EnvironmentalLifeLayer"]');
  nodeLines.push('position = Vector2(1712, 406)');
  nodeLines.push('amount = 8');
  nodeLines.push('lifetime = 4.2');
  nodeLines.push('preprocess = 2.0');
  nodeLines.push('emission_shape = 3');
  nodeLines.push('emission_rect_extents = Vector2(14, 6)');
  nodeLines.push('direction = Vector2(0, -1)');
  nodeLines.push('spread = 24.0');
  nodeLines.push('gravity = Vector2(0, -3)');
  nodeLines.push('initial_velocity_min = 4.0');
  nodeLines.push('initial_velocity_max = 8.0');
  nodeLines.push('scale_amount_min = 1.0');
  nodeLines.push('scale_amount_max = 1.5');
  nodeLines.push('color = Color(0.58, 0.96, 0.93, 0.80)');
  nodeLines.push('');

  // Collision-Debug Vector Drawer (F3 toggle) & Intel HD 3000 Live Performance HUD (F4 toggle)
  nodeLines.push('[node name="CollisionDebugDrawer" type="Node2D" parent="."]');
  nodeLines.push('z_index = 80');
  nodeLines.push('');
  nodeLines.push('[node name="HudCanvas" type="CanvasLayer" parent="."]');
  nodeLines.push('');
  nodeLines.push('[node name="PerfLabel" type="Label" parent="HudCanvas"]');
  nodeLines.push('offset_left = 6.0');
  nodeLines.push('offset_top = 4.0');
  nodeLines.push('offset_right = 634.0');
  nodeLines.push('offset_bottom = 22.0');
  nodeLines.push('theme_override_colors/font_color = Color(0.95, 0.98, 0.95, 1)');
  nodeLines.push('theme_override_colors/font_shadow_color = Color(0, 0, 0, 0.85)');
  nodeLines.push('theme_override_font_sizes/font_size = 9');
  nodeLines.push('text = "V7.3 GODOT 4.7.2 | Press F3: Collision-Debug | F4: Perf HUD | Shift: Run | 1-8: Biomes"');
  nodeLines.push('');

  const loadSteps = extIdx + subCount + 1;
  const tscn = [
    `[gd_scene load_steps=${loadSteps} format=3]`,
    '',
    ...extLines,
    '',
    ...subLines,
    ...nodeLines,
  ].join('\n');

  fs.writeFileSync(path.join(gScenesDir, 'v73_open_world_forest.tscn'), tscn);

  const bat = `@echo off
REM VERDANT SIGNAL V7.3 — Real Godot 4.7.2 Open-World Playability Verification Launcher (Windows)
REM Usage:
REM   run_windows_verification.bat         -> Launches playable V7.3 open world (WASD+Shift, F3 ColDebug, F4 PerfHUD, 1-8 Biomes)
REM   run_windows_verification.bat capture -> Auto-captures 9 native 640x360 gameplay, boundary & collision-debug PNGs from Godot!
setlocal
if "%GODOT_EXE%"=="" set GODOT_EXE=godot
if /i "%1"=="capture" (
  echo Running Godot 4.7.2 V7.3 automated native 640x360 capture...
  "%GODOT_EXE%" --path "%~dp0." -- --capture-proofs
) else (
  echo Launching Godot 4.7.2 V7.3 Open-World Forest Study...
  "%GODOT_EXE%" --path "%~dp0."
)
endlocal
`;
  fs.writeFileSync(path.join(godotProjectDir, 'run_windows_verification.bat'), bat);

  return {
    extResourceCount: extIdx,
    subResourceCount: subCount,
    spriteNodeCount,
    solidBodyCount,
    solidPolygonCount,
    areaZoneCount,
  };
}
