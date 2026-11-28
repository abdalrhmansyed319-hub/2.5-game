/**
 * VERDANT SIGNAL — V8.0 STANDALONE REAL GODOT 4.7.2 LIVING WORLD EXPORTER
 * ==============================================================================
 * Exports a complete, standalone Godot 4.7.2 (GL Compatibility — Intel HD 3000 safe)
 * project at: game/assets/v80_living_world_study/godot_project/
 *
 * Preserves 100% of V7.3's open-world physics, multi-polygon collisions, zero-boundary
 * forest ring, and unmodified 88x88 character frames while adding:
 *   - Handcrafted 2304x1536 detailed grass & embedded-root ground
 *   - Frustum-culled pooled 72-node Y-sorted Living Grass & Root-Fern Animator
 *     driven by traveling wind waves, gusts (F6) & player footstep compression/spring-back
 *   - Single-draw-call painterly volumetric-style canopy sunbeams + cloud drift
 *   - 3 switchable cinematic lighting moods (F5: Afternoon / Misty Dawn / Shaded Forest)
 *   - Localized bioluminescence halos + 7 animated butterflies/moths + <= 40 CPUParticles2D
 *   - Live F3 Collision-Debug + live F4 Intel HD 3000 Performance HUD + --capture-proofs CLI
 */

import fs from 'node:fs';
import path from 'node:path';
import { createEmptyBuffer, setPixel } from '../engine/pixelBuffer';
import { encodeRGBA8PNG } from '../engine/pngEncoder';
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
  isSolidCollider,
} from '../v73_open_world/v73OpenWorldEngine';
import { V80_TUFT_SPECIES_LIST } from './v80LivingGroundArt';
import { type V80SunbeamSpec, type V80WorldState } from './v80LivingWorldEngine';

export interface ExportV80GodotOpts {
  godotProjectDir: string;
  sourceSpritesDir: string;
  state: V80WorldState;
  sprites: Record<string, RgbaImage>;
}

export interface ExportV80GodotStats {
  extResourceCount: number;
  subResourceCount: number;
  spriteNodeCount: number;
  solidBodyCount: number;
  solidPolygonCount: number;
  areaZoneCount: number;
  livingTuftCount: number;
  critterCount: number;
  totalCpuParticles: number;
}

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** Pre-bakes crisp Bayer-dithered diagonal canopy sunbeams into a lightweight additive PNG! */
function bakeSunbeamsTexture(worldW: number, worldH: number, sunbeams: V80SunbeamSpec[]): RgbaImage {
  // Bake at 1/2 scale (1152x768) -> scales 2x cleanly in Godot with 4x smaller VRAM on Intel HD 3000!
  const W = worldW / 2;
  const H = worldH / 2;
  const buf = createEmptyBuffer(W, H);

  for (const beam of sunbeams) {
    const bx0 = beam.topX / 2;
    const by0 = beam.topY / 2;
    const bw = beam.width / 2;
    const bl = beam.length / 2;
    const yStart = Math.max(0, Math.floor(by0));
    const yEnd = Math.min(H - 1, Math.ceil(by0 + bl));

    for (let y = yStart; y <= yEnd; y++) {
      const v = (y - by0) / bl;
      const cx = bx0 + (y - by0) * 0.52;
      const hw = (bw * (0.48 + v * 0.72)) * 0.5;
      const xStart = Math.max(0, Math.floor(cx - hw));
      const xEnd = Math.min(W - 1, Math.ceil(cx + hw));
      const vertFade = Math.sin(Math.min(1, v) * Math.PI) * (0.65 + 0.35 * (1 - v));

      for (let x = xStart; x <= xEnd; x++) {
        const u = Math.abs(x - cx) / Math.max(1, hw);
        if (u >= 1) continue;
        const rib = 0.74 + 0.26 * Math.sin((x - cx) * 0.44 + beam.phase);
        const a = (1 - u * u) * vertFade * rib * beam.strength;
        const bayer = (BAYER4[y & 3][x & 3] + 0.5) / 16;
        if (a < bayer * 0.14) continue;
        const oi = (y * W + x) * 4;
        const addAlpha = Math.min(255, Math.round(a * 175));
        buf[oi] = 255;
        buf[oi + 1] = 242;
        buf[oi + 2] = 176;
        buf[oi + 3] = Math.min(255, buf[oi + 3] + addAlpha);
      }
    }
  }
  return { pixels: buf, width: W, height: H };
}

/** Pre-bakes a crisp 64x64 Bayer-dithered localized bioluminescent glow halo sprite (zero blur shader!). */
function bakeBioHaloTexture(): RgbaImage {
  const S = 64;
  const buf = createEmptyBuffer(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const d = Math.hypot((x - 32) / 31, (y - 32) / 26);
      if (d >= 1) continue;
      const fall = (1 - d) * (1 - d);
      const bayer = (BAYER4[y & 3][x & 3] + 0.5) / 16;
      if (fall * 1.4 < bayer * 0.25) continue;
      setPixel(buf, S, S, x, y, { r: 92, g: 235, b: 224, a: Math.min(255, Math.round(fall * 155)) });
    }
  }
  return { pixels: buf, width: S, height: S };
}

function buildFoliageSwayShader(): string {
  return `shader_type canvas_item;
// VERDANT SIGNAL V8.0 — Gust-Responsive Desynchronized Foliage & Canopy Sway (Intel HD 3000 safe)
uniform int sway_kind = 1; // 1 = fern/bush, 2 = overhead canopy
uniform float sway_amp = 1.2;
uniform float sway_speed = 0.85;
uniform float sway_phase = 0.0;
uniform float world_x = 0.0;
uniform float gust_factor = 0.0;

void vertex() {
	float gust = 0.65 + 0.35 * sin(TIME * 0.55 - world_x * 0.009) + gust_factor * 0.95;
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
// VERDANT SIGNAL V8.0 — Live Canopy Droplet Ripples, Sun Glints & Explorer Footstep Ripples
uniform vec2 tex_size = vec2(2304.0, 1536.0);
uniform vec2 player_world_pos = vec2(1024.0, 822.0);

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
		pools[0] = vec2(1584.0, 866.0);
		pools[1] = vec2(1732.0, 896.0);
		pools[2] = vec2(1144.0, 1038.0);
		pools[3] = vec2(1272.0, 1084.0);
		pools[4] = vec2(1004.0, 764.0);
		pools[5] = vec2(966.0, 492.0);

		float periods[6];
		periods[0] = 4.1; periods[1] = 5.3; periods[2] = 4.6;
		periods[3] = 3.9; periods[4] = 5.0; periods[5] = 4.4;

		float phases[6];
		phases[0] = 0.20; phases[1] = 0.65; phases[2] = 0.10;
		phases[3] = 0.52; phases[4] = 0.80; phases[5] = 0.35;

		float ripple = 0.0;
		for (int i = 0; i < 6; i++) {
			float cyc = fract(TIME / periods[i] + phases[i]);
			if (cyc >= 0.14 && cyc < 0.70) {
				float u = (cyc - 0.14) / 0.56;
				float ring = ellipse_ring(wp, pools[i], vec2(2.0 + u * 13.0, 1.0 + u * 5.0), 0.18);
				ripple = max(ripple, ring * (1.0 - u) * 0.62);
			}
		}

		// Subtle sky-sparkle shimmer glints
		float glint = step(0.96, sin(TIME * 2.2 + floor(wp.x * 0.15) * 4.7 + floor(wp.y * 0.25) * 3.1));
		ripple = max(ripple, glint * 0.38);

		// Live explorer footstep water ripple when wading across shallow pools
		float foot_dist = length((wp - player_world_pos) / vec2(22.0, 9.0));
		if (foot_dist < 1.35) {
			float fu = fract(TIME * 1.45);
			float fring = ellipse_ring(wp, player_world_pos, vec2(4.0 + fu * 16.0, 2.0 + fu * 6.0), 0.20);
			ripple = max(ripple, fring * (1.0 - fu) * 0.78);
		}
		base.rgb = mix(base.rgb, vec3(0.91, 0.99, 1.0), clamp(ripple, 0.0, 0.82));
	}
	COLOR = base;
}
`;
}

function buildNaturalOcclusionShader(): string {
  return `shader_type canvas_item;
// VERDANT SIGNAL V8.0 — Natural 2x2 Ordered-Dither Foliage Peek (ZERO artificial cyan glow!)
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
  return `; Engine configuration file — VERDANT SIGNAL V8.0 Living World Study
; Target: Windows / Linux Godot 4.7.2 (GL Compatibility — Intel HD Graphics 3000 compatible)
; Native Viewport: 640x360 (1:1 matching unmodified 88x88 supplied character frames; 2x=1280x720, 3x=1920x1080)

config_version=5

[application]

config/name="Verdant Signal — V8.0 Living World Forest Study"
run/main_scene="res://scenes/v80_living_world_forest.tscn"
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
environment/defaults/default_clear_color=Color(0.032, 0.13, 0.10, 1)
`;
}

function buildMainGdScript(state: V80WorldState): string {
  const world = state.baseWorld;
  const poolLines = world.pools.map((p) => `\t{"x": ${p.x}.0, "y": ${p.y}.0, "rx": ${p.rx}.0, "ry": ${p.ry}.0},`).join('\n');
  return `extends Node2D
## VERDANT SIGNAL — V8.0 Real Godot 4.7.2 Living World Controller (GL Compatibility / Intel HD 3000)
##
## Hotkeys:
##   WASD / Arrows : 4-dir + normalized 8-dir exploration | Shift : Run
##   F3 : Toggle live Collision-Debug polygons over artwork
##   F4 : Toggle live Intel HD 3000 Performance Profiler HUD
##   F5 : Cycle Cinematic Lighting Mood (Golden Afternoon -> Misty Rose-Gold Dawn -> Shaded Twilight Forest)
##   F6 : Trigger Living Wind Gust + Leaf Shower event
##   1-8: Jump between all 8 environmental composition zones (A-H)
##   F9 : Capture native 640x360 PNG screenshot
##   CLI: godot --path game/assets/v80_living_world_study/godot_project -- --capture-proofs

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
const TEX_TUFTS: Texture2D = preload("res://sprites/living_grass_tufts_24x24_6x8.png")
const TEX_CRITTERS: Texture2D = preload("res://sprites/living_critters_12x12_4x3.png")

const MOOD_NAMES := ["AFTERNOON", "DAWN", "SHADED_FOREST"]
const GRASS_POOL_SIZE := 144

@onready var forest_floor: Sprite2D = $ForestFloor
@onready var y_sort_world: Node2D = $YSortWorld
@onready var canopy_layer: Node2D = $CanopyLayer
@onready var perimeter_canopy_layer: Node2D = $PerimeterCanopyLayer
@onready var walkable_zones_layer: Node2D = $WalkableZonesLayer
@onready var sunbeams_sprite: Sprite2D = $AtmosphericLightingLayer/SunbeamsOverlay
@onready var biolum_layer: Node2D = $AtmosphericLightingLayer/BiolumGlowLayer
@onready var critters_layer: Node2D = $EnvironmentalLifeLayer/CrittersLayer
@onready var falling_leaves: CPUParticles2D = $EnvironmentalLifeLayer/FallingLeaves
@onready var mood_modulate: CanvasModulate = $WorldMoodModulate
@onready var player: CharacterBody2D = $YSortWorld/Player
@onready var body_sprite: Sprite2D = $YSortWorld/Player/BodySprite
@onready var peek_sprite: Sprite2D = $YSortWorld/Player/OcclusionPeekSprite
@onready var cam: Camera2D = $YSortWorld/Player/MainCamera
@onready var debug_drawer: Node2D = $CollisionDebugDrawer
@onready var perf_label: Label = $HudCanvas/PerfLabel

var _dir_row: int = 2
var _anim_state: String = "idle"
var _anim_acc: float = 0.0
var _frame_col: int = 0
var _time_sec: float = 0.0
var _manual_gust_timer: float = 0.0
var _mood_idx: int = 0

var _debug_collision: bool = false
var _show_perf_hud: bool = true
var _occluders: Array[Sprite2D] = []
var _canopy_sprites: Array[Sprite2D] = []
var _sway_materials: Array[ShaderMaterial] = []
var _slow_zone_count: int = 0
var _in_arch_count: int = 0
var _solid_poly_cache: Array[Dictionary] = []
var _area_poly_cache: Array[Dictionary] = []

# Pooled frustum-culled Living Grass & Critter Systems (Intel HD 3000 friendly!)
var _tuft_data: Array = []
var _tuft_pool: Array[Sprite2D] = []
var _tuft_bends: Dictionary = {} # tuft_idx -> {"timer": float, "side": int}
var _visible_tufts_drawn: int = 0

var _critter_data: Array = []
var _critter_nodes: Array[Sprite2D] = []

func _ready() -> void:
	cam.limit_left = ${V73_CAM_MIN_X}
	cam.limit_right = ${V73_CAM_MAX_X + V73_VIEW_W}
	cam.limit_top = ${V73_CAM_MIN_Y}
	cam.limit_bottom = ${V73_CAM_MAX_Y + V73_VIEW_H}
	cam.position_smoothing_enabled = true
	cam.position_smoothing_speed = 7.0

	for child in y_sort_world.get_children():
		if child == player:
			continue
		if child is StaticBody2D:
			var spr := child.get_node_or_null("Sprite2D") as Sprite2D
			if spr != null:
				_occluders.append(spr)
				if spr.material is ShaderMaterial:
					_sway_materials.append(spr.material as ShaderMaterial)
			for sub in child.get_children():
				if sub is CollisionPolygon2D:
					var role := String(sub.get_meta("role", "solid_trunk"))
					_solid_poly_cache.append({"node": child, "poly": sub.polygon, "role": role})
		elif child is Sprite2D:
			var s2 := child as Sprite2D
			_occluders.append(s2)
			if s2.material is ShaderMaterial:
				_sway_materials.append(s2.material as ShaderMaterial)

	for layer_node in [canopy_layer, perimeter_canopy_layer]:
		for child in layer_node.get_children():
			if child is Sprite2D:
				var s2 := child as Sprite2D
				_canopy_sprites.append(s2)
				if s2.material is ShaderMaterial:
					_sway_materials.append(s2.material as ShaderMaterial)

	for area in walkable_zones_layer.get_children():
		if area is Area2D:
			var role := String(area.get_meta("role", "slow_thicket"))
			area.body_entered.connect(_on_zone_entered.bind(role))
			area.body_exited.connect(_on_zone_exited.bind(role))
			for sub in area.get_children():
				if sub is CollisionPolygon2D:
					_area_poly_cache.append({"node": area, "poly": sub.polygon, "role": role})

	_load_living_ecosystem_json()
	_apply_mood()
	debug_drawer.draw.connect(_on_debug_draw)
	_apply_character_frame()

	if "--capture-proofs" in OS.get_cmdline_user_args():
		call_deferred("_run_automated_godot_capture")

func _load_living_ecosystem_json() -> void:
	var txt := FileAccess.get_file_as_string("res://data/living_ecosystem_data.json")
	var parsed = JSON.parse_string(txt)
	if parsed is Dictionary:
		_tuft_data = parsed.get("tufts", [])
		_critter_data = parsed.get("critters", [])

	# Pre-allocate fixed frustum-culled Sprite2D pool inside YSortWorld (zero runtime allocations!)
	for i in range(GRASS_POOL_SIZE):
		var s := Sprite2D.new()
		s.texture = TEX_TUFTS
		s.hframes = 6
		s.vframes = 8
		s.offset = Vector2(0, -9)
		s.visible = false
		y_sort_world.add_child(s)
		_tuft_pool.append(s)

	# Create lightweight animated woodland butterflies & glowing twilight moths
	for cr in _critter_data:
		var cs := Sprite2D.new()
		cs.texture = TEX_CRITTERS
		cs.hframes = 4
		cs.vframes = 3
		cs.frame_coords = Vector2i(0, int(cr["kind"]))
		critters_layer.add_child(cs)
		_critter_nodes.append(cs)

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
	_time_sec += delta
	if _manual_gust_timer > 0.0:
		_manual_gust_timer = maxf(0.0, _manual_gust_timer - delta)

	var dir := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	if dir == Vector2.ZERO:
		dir = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")

	var wants_run := Input.is_action_pressed("sprint") or Input.is_key_pressed(KEY_SHIFT)
	var base_speed := RUN_SPEED if wants_run else WALK_SPEED

	var terrain_mul := 0.78 if _slow_zone_count > 0 else 1.0
	var in_pool := false
	for pool in POOLS:
		var d := Vector2((player.position.x - pool.x) / pool.rx, (player.position.y - pool.y) / pool.ry).length()
		if d < 0.92:
			in_pool = true
			terrain_mul = minf(terrain_mul, 0.90)
			break

	var prev_pos := player.position
	var is_moving := false
	if dir.length_squared() > 0.001:
		var norm_dir := dir.normalized()
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
			_set_anim_state("idle")
		else:
			is_moving = true
			_set_anim_state("running" if (wants_run and actual_speed > 94.0) else "walking")
	else:
		player.velocity = Vector2.ZERO
		_set_anim_state("idle")

	var fps := RUN_FPS if _anim_state == "running" else (WALK_FPS if _anim_state == "walking" else IDLE_FPS)
	_anim_acc += delta * fps
	_frame_col = int(_anim_acc) % 8
	_apply_character_frame()
	_update_living_ecosystem(delta, is_moving)
	_update_environment_and_occlusion()

	if _debug_collision:
		debug_drawer.queue_redraw()
	if _show_perf_hud:
		_update_perf_hud(in_pool)

func _update_living_ecosystem(delta: float, is_moving: bool) -> void:
	# Decay existing player footstep bends
	var expired: Array = []
	for k in _tuft_bends.keys():
		_tuft_bends[k]["timer"] -= delta
		if _tuft_bends[k]["timer"] <= 0.0:
			expired.append(k)
	for k in expired:
		_tuft_bends.erase(k)

	# Periodic living wind gust rhythm + manual F6 gust pulse
	var gust_wave := maxf(0.0, sin(_time_sec * 0.44 - 0.8))
	var gust_strength := maxf(_manual_gust_timer / 3.0, pow(gust_wave, 4.0))
	for sm in _sway_materials:
		sm.set_shader_parameter("gust_factor", gust_strength)
	falling_leaves.gravity = Vector2(5.0 + gust_strength * 28.0, 10.0)

	# Cloud drift breathing modulation on painterly canopy sunbeams + biolum pulse
	var cloud := 0.82 + 0.18 * sin(_time_sec * 0.28)
	var base_beam_a := 0.72 if _mood_idx == 0 else (0.82 if _mood_idx == 1 else 0.24)
	sunbeams_sprite.modulate.a = base_beam_a * cloud
	var bio_a := (0.62 if _mood_idx == 0 else (0.78 if _mood_idx == 1 else 1.0)) * (0.78 + 0.22 * sin(_time_sec * 1.45))
	biolum_layer.modulate.a = bio_a

	# Frustum-cull & animate visible Living Grass & Root-Fern Tufts in pool
	var cam_center := cam.get_screen_center_position()
	var vx0 := cam_center.x - ${V73_VIEW_W / 2 + 28}.0
	var vx1 := cam_center.x + ${V73_VIEW_W / 2 + 28}.0
	var vy0 := cam_center.y - ${V73_VIEW_H / 2 + 28}.0
	var vy1 := cam_center.y + ${V73_VIEW_H / 2 + 28}.0

	var pool_idx := 0
	for i in range(_tuft_data.size()):
		var td: Dictionary = _tuft_data[i]
		var tx: float = td["x"]
		var ty: float = td["y"]
		if tx < vx0 or tx > vx1 or ty < vy0 or ty > vy1:
			continue

		if is_moving and absf(tx - player.position.x) < 22.0 and absf(ty - player.position.y) < 15.0:
			var dist := Vector2(tx - player.position.x, (ty - player.position.y) * 1.35).length()
			if dist < 21.0:
				_tuft_bends[i] = {"timer": 0.48, "side": 1 if tx >= player.position.x else -1}

		if pool_idx >= GRASS_POOL_SIZE:
			continue
		var spr := _tuft_pool[pool_idx]
		pool_idx += 1
		spr.visible = true
		spr.position = Vector2(tx, ty)

		var f_col := 0
		if _tuft_bends.has(i) and _tuft_bends[i]["timer"] > 0.14:
			f_col = 4 if _tuft_bends[i]["side"] < 0 else 5
		else:
			var travel := sin(_time_sec * (1.35 + gust_strength * 1.1) - tx * 0.011 + ty * 0.0038)
			var local_w := (0.22 + travel * (0.46 + gust_strength * 0.72) + gust_strength * 0.48 + sin(_time_sec * 1.2 + float(td["phase"])) * 0.28) * float(td["sens"])
			if local_w > 0.88:
				f_col = 2
			elif local_w > 0.26:
				f_col = 1
			elif local_w < -0.26:
				f_col = 3
		spr.frame_coords = Vector2i(f_col, int(td["row"]))

	_visible_tufts_drawn = pool_idx
	for r in range(pool_idx, GRASS_POOL_SIZE):
		_tuft_pool[r].visible = false

	# Animate fluttering butterflies & glowing forest moths
	for ci in range(_critter_nodes.size()):
		var cr: Dictionary = _critter_data[ci]
		var cs := _critter_nodes[ci]
		var spd: float = cr["speed"]
		var ph: float = cr["phase"]
		cs.position = Vector2(
			float(cr["x"]) + cos(_time_sec * spd + ph) * float(cr["rx"]) + sin(_time_sec * 1.7 + ph) * 9.0,
			float(cr["y"]) + sin(_time_sec * spd * 1.3 + ph) * float(cr["ry"]) + cos(_time_sec * 2.8 + ph) * 5.0
		)
		cs.frame_coords = Vector2i(int(_time_sec * 9.5 + ph * 4.0) % 4, int(cr["kind"]))

func _apply_mood() -> void:
	if _mood_idx == 0:
		# Golden Afternoon Glade
		mood_modulate.color = Color(1.0, 1.0, 0.98, 1.0)
		sunbeams_sprite.modulate = Color(1.0, 0.95, 0.68, 0.72)
	elif _mood_idx == 1:
		# Misty Rose-Gold Dawn
		mood_modulate.color = Color(0.95, 0.92, 1.04, 1.0)
		sunbeams_sprite.modulate = Color(1.0, 0.82, 0.66, 0.82)
	else:
		# Deep Shaded Twilight Forest (Bioluminescence takes center stage!)
		mood_modulate.color = Color(0.66, 0.78, 0.94, 1.0)
		sunbeams_sprite.modulate = Color(0.68, 0.88, 0.88, 0.24)

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

	var dist_clear := Vector2((player.position.x - 1648.0) / 235.0, (player.position.y - 812.0) / 160.0).length()
	if dist_clear < 1.0:
		body_sprite.modulate = Color(1.05, 1.03, 0.98, 1.0)
	elif player.position.x < 760.0 and player.position.y < 680.0:
		body_sprite.modulate = Color(0.89, 0.93, 0.98, 1.0)
	else:
		body_sprite.modulate = Color(1.0, 1.0, 1.0, 1.0)

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

	var foot_pts := PackedVector2Array()
	for i in range(25):
		var a := (float(i) / 24.0) * TAU
		foot_pts.append(player.global_position + Vector2(cos(a) * ${V73_CHAR_COL_RX}.0, sin(a) * ${V73_CHAR_COL_RY}.0))
	debug_drawer.draw_polyline(foot_pts, Color.WHITE, 1.0, false)

func _update_perf_hud(in_pool: bool) -> void:
	var fps := Engine.get_frames_per_second()
	var frame_ms := Performance.get_monitor(Performance.TIME_PROCESS) * 1000.0
	var draws := int(Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME))
	var zone := "THICKET(0.78x)" if _slow_zone_count > 0 else ("ARCH" if _in_arch_count > 0 else ("POOL(0.90x)" if in_pool else "GRASS(1.0x)"))
	perf_label.text = "V8.0 LIVING WORLD | %d FPS (%.1fms) | Draws:%d | Tufts:%d | Mood:%s | %s | F3:Col F5:Mood F6:Gust" % [
		fps, frame_ms, draws, _visible_tufts_drawn, MOOD_NAMES[_mood_idx], zone
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
			KEY_F5:
				_mood_idx = (_mood_idx + 1) % 3
				_apply_mood()
			KEY_F6:
				_manual_gust_timer = 3.0
			KEY_1: _jump_to(Vector2(1024.0, 822.0), 2)
			KEY_2: _jump_to(Vector2(586.0, 582.0), 1)
			KEY_3: _jump_to(Vector2(1118.0, 454.0), 1)
			KEY_4: _jump_to(Vector2(1656.0, 518.0), 1)
			KEY_5: _jump_to(Vector2(1618.0, 824.0), 2)
			KEY_6: _jump_to(Vector2(1146.0, 1044.0), 2)
			KEY_7: _jump_to(Vector2(654.0, 1116.0), 3)
			KEY_8: _jump_to(Vector2(632.0, 944.0), 3)
			KEY_F9:
				_save_capture("manual_v80_640x360.png")

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
	print("V8.0 Godot runtime capture saved: ", full_path)

func _run_automated_godot_capture() -> void:
	_show_perf_hud = false
	perf_label.visible = false
	var shots := [
		{"name": "godot_v80_01_hub_afternoon.png", "pos": Vector2(1024.0, 822.0), "dir": 2, "mood": 0, "dbg": false},
		{"name": "godot_v80_02_root_arch_afternoon.png", "pos": Vector2(1118.0, 454.0), "dir": 1, "mood": 0, "dbg": false},
		{"name": "godot_v80_03_clearing_afternoon.png", "pos": Vector2(1618.0, 824.0), "dir": 2, "mood": 0, "dbg": false},
		{"name": "godot_v80_04_clearing_dawn.png", "pos": Vector2(1618.0, 824.0), "dir": 2, "mood": 1, "dbg": false},
		{"name": "godot_v80_05_waystone_shaded_biolum.png", "pos": Vector2(1656.0, 518.0), "dir": 1, "mood": 2, "dbg": false},
		{"name": "godot_v80_06_fallen_log_afternoon.png", "pos": Vector2(632.0, 956.0), "dir": 3, "mood": 0, "dbg": false},
		{"name": "godot_v80_07_collision_debug_hub.png", "pos": Vector2(1024.0, 822.0), "dir": 2, "mood": 0, "dbg": true},
	]
	for s in shots:
		_mood_idx = s["mood"]
		_debug_collision = s["dbg"]
		_apply_mood()
		_jump_to(s["pos"], s["dir"])
		debug_drawer.queue_redraw()
		await get_tree().process_frame
		await get_tree().process_frame
		await RenderingServer.frame_post_draw
		_save_capture(s["name"])
	get_tree().quit(0)
`;
}

export function exportV80StandaloneGodotProject(opts: ExportV80GodotOpts): ExportV80GodotStats {
  const { godotProjectDir, sourceSpritesDir, state, sprites } = opts;
  const world = state.baseWorld;
  const gSpritesDir = path.join(godotProjectDir, 'sprites');
  const gShadersDir = path.join(godotProjectDir, 'shaders');
  const gScenesDir = path.join(godotProjectDir, 'scenes');
  const gScriptsDir = path.join(godotProjectDir, 'scripts');
  const gDataDir = path.join(godotProjectDir, 'data');

  fs.mkdirSync(gSpritesDir, { recursive: true });
  fs.mkdirSync(gShadersDir, { recursive: true });
  fs.mkdirSync(gScenesDir, { recursive: true });
  fs.mkdirSync(gScriptsDir, { recursive: true });
  fs.mkdirSync(gDataDir, { recursive: true });

  // 1. Copy all sprites + write pre-baked sunbeams, biolum halo & living ecosystem JSON data
  for (const fn of fs.readdirSync(sourceSpritesDir)) {
    if (!fn.endsWith('.png')) continue;
    fs.copyFileSync(path.join(sourceSpritesDir, fn), path.join(gSpritesDir, fn));
  }

  const sunbeamsImg = bakeSunbeamsTexture(world.worldW, world.worldH, state.sunbeams);
  fs.writeFileSync(path.join(gSpritesDir, 'sunbeams_1152x768.png'), encodeRGBA8PNG(sunbeamsImg.pixels, sunbeamsImg.width, sunbeamsImg.height));
  const bioHaloImg = bakeBioHaloTexture();
  fs.writeFileSync(path.join(gSpritesDir, 'biolum_halo_64x64.png'), encodeRGBA8PNG(bioHaloImg.pixels, bioHaloImg.width, bioHaloImg.height));

  const ecoData = {
    tufts: state.tufts.map((t) => ({
      x: t.x,
      y: t.y,
      row: V80_TUFT_SPECIES_LIST.indexOf(t.species),
      phase: Number(t.phase.toFixed(3)),
      sens: Number(t.windSensitivity.toFixed(2)),
    })),
    critters: state.critters.map((c) => ({
      kind: c.kind,
      x: c.homeX,
      y: c.homeY,
      rx: c.radiusX,
      ry: c.radiusY,
      speed: c.speed,
      phase: c.phase,
    })),
  };
  fs.writeFileSync(path.join(gDataDir, 'living_ecosystem_data.json'), JSON.stringify(ecoData));

  // 2. Write project.godot, shaders & GDScript
  fs.writeFileSync(path.join(godotProjectDir, 'project.godot'), buildProjectGodot());
  fs.writeFileSync(path.join(gShadersDir, 'foliage_sway.gdshader'), buildFoliageSwayShader());
  fs.writeFileSync(path.join(gShadersDir, 'puddle_ripples.gdshader'), buildPuddleRippleShader());
  fs.writeFileSync(path.join(gShadersDir, 'mara_natural_occlusion.gdshader'), buildNaturalOcclusionShader());
  fs.writeFileSync(path.join(gScriptsDir, 'v80_living_world_forest.gd'), buildMainGdScript(state));

  // 3. Build real node-based Godot 4.7.2 scene: scenes/v80_living_world_forest.tscn
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

  const idScript = addExt('Script', 'res://scripts/v80_living_world_forest.gd', 'main_script');
  const idSwayShader = addExt('Shader', 'res://shaders/foliage_sway.gdshader', 'sway_shader');
  const idPuddleShader = addExt('Shader', 'res://shaders/puddle_ripples.gdshader', 'puddle_shader');
  const idOccShader = addExt('Shader', 'res://shaders/mara_natural_occlusion.gdshader', 'occ_shader');
  const idFloorTex = addExt('Texture2D', 'res://sprites/v80_living_floor_2304x1536.png', 'floor_tex');
  const idCharIdleTex = addExt('Texture2D', 'res://sprites/char_idle_88x88_8x4.png', 'char_idle_tex');
  const idSunbeamsTex = addExt('Texture2D', 'res://sprites/sunbeams_1152x768.png', 'sunbeams_tex');
  const idBioHaloTex = addExt('Texture2D', 'res://sprites/biolum_halo_64x64.png', 'bio_halo_tex');

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
  const idOccMat = addSub('ShaderMaterial', 'mat_natural_occ', [`shader = ExtResource("${idOccShader}")`]);
  const idAddBlendMat = addSub('CanvasItemMaterial', 'mat_additive_light', ['blend_mode = 1']);
  const idPlayerFootShape = addSub('CapsuleShape2D', 'shape_player_foot', [
    `radius = ${V73_CHAR_COL_RY}.0`,
    `height = ${V73_CHAR_COL_RX * 2}.0`,
  ]);

  const makeSwayMat = (p: V80WorldState['baseWorld']['props'][number]): string | null => {
    if (!p.swayKind || p.swayKind === 'none' || p.swayKind === 'chime') return null;
    const kindNum = p.swayKind === 'canopy' ? 2 : 1;
    return addSub('ShaderMaterial', `mat_sway_${p.id}`, [
      `shader = ExtResource("${idSwayShader}")`,
      `shader_parameter/sway_kind = ${kindNum}`,
      `shader_parameter/sway_amp = ${(p.swayAmp ?? 1.1).toFixed(2)}`,
      `shader_parameter/sway_speed = ${(p.swaySpeed ?? 0.8).toFixed(2)}`,
      `shader_parameter/sway_phase = ${(p.swayPhase ?? 0.0).toFixed(2)}`,
      `shader_parameter/world_x = ${p.x.toFixed(1)}`,
      'shader_parameter/gust_factor = 0.0',
    ]);
  };

  const formatPoly = (pts: Array<{ x: number; y: number }>) =>
    `PackedVector2Array(${pts.map((pt) => `${pt.x}, ${pt.y}`).join(', ')})`;

  let spriteNodeCount = 0;
  let solidBodyCount = 0;
  let solidPolygonCount = 0;
  let areaZoneCount = 0;

  // Root
  nodeLines.push('[node name="V80LivingWorldForest" type="Node2D"]');
  nodeLines.push(`script = ExtResource("${idScript}")`);
  nodeLines.push('');

  nodeLines.push('[node name="WorldMoodModulate" type="CanvasModulate" parent="."]');
  nodeLines.push('color = Color(1, 1, 0.98, 1)');
  nodeLines.push('');

  nodeLines.push('[node name="ForestFloor" type="Sprite2D" parent="."]');
  nodeLines.push(`material = SubResource("${idFloorMat}")`);
  nodeLines.push(`texture = ExtResource("${idFloorTex}")`);
  nodeLines.push('centered = false');
  nodeLines.push('');
  spriteNodeCount++;

  // Y-Sorted World (Player + Multi-Polygon Trees/Rocks/Logs + Pooled Animated Grass Tufts!)
  nodeLines.push('[node name="YSortWorld" type="Node2D" parent="."]');
  nodeLines.push('y_sort_enabled = true');
  nodeLines.push('');

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

  nodeLines.push('[node name="WalkableZonesLayer" type="Node2D" parent="."]');
  nodeLines.push('');
  nodeLines.push(...walkableZoneNodes);

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

  // Atmospheric Painterly Lighting Layer (Single-Draw-Call Sunbeams + Localized Biolum Halos!)
  nodeLines.push('[node name="AtmosphericLightingLayer" type="Node2D" parent="."]');
  nodeLines.push('z_index = 37');
  nodeLines.push('');
  nodeLines.push('[node name="SunbeamsOverlay" type="Sprite2D" parent="AtmosphericLightingLayer"]');
  nodeLines.push(`material = SubResource("${idAddBlendMat}")`);
  nodeLines.push(`texture = ExtResource("${idSunbeamsTex}")`);
  nodeLines.push('centered = false');
  nodeLines.push('scale = Vector2(2, 2)');
  nodeLines.push('modulate = Color(1, 0.95, 0.68, 0.72)');
  nodeLines.push('');
  spriteNodeCount++;

  nodeLines.push('[node name="BiolumGlowLayer" type="Node2D" parent="AtmosphericLightingLayer"]');
  nodeLines.push('');
  const bioAnchors: Array<[string, number, number, number]> = [
    ['GlowWaystone', 1694, 424, 1.55],
    ['GlowChimes', 1712, 746, 1.35],
    ['GlowHubRoot', 1054, 814, 0.75],
    ['GlowLogFungi', 574, 902, 0.85],
    ['GlowArchHollow', 1064, 476, 0.75],
  ];
  for (const [bName, bx, by, sc] of bioAnchors) {
    nodeLines.push(`[node name="${bName}" type="Sprite2D" parent="AtmosphericLightingLayer/BiolumGlowLayer"]`);
    nodeLines.push(`material = SubResource("${idAddBlendMat}")`);
    nodeLines.push(`position = Vector2(${bx}, ${by})`);
    nodeLines.push(`scale = Vector2(${sc}, ${sc})`);
    nodeLines.push(`texture = ExtResource("${idBioHaloTex}")`);
    nodeLines.push('');
    spriteNodeCount++;
  }

  // Environmental Life Layer (Strictly <= 40 CPUParticles2D + 7 Animated Butterflies/Moths — Intel HD 3000 safe!)
  nodeLines.push('[node name="EnvironmentalLifeLayer" type="Node2D" parent="."]');
  nodeLines.push('z_index = 39');
  nodeLines.push('');
  nodeLines.push('[node name="CrittersLayer" type="Node2D" parent="EnvironmentalLifeLayer"]');
  nodeLines.push('');
  nodeLines.push('[node name="FallingLeaves" type="CPUParticles2D" parent="EnvironmentalLifeLayer"]');
  nodeLines.push('position = Vector2(1152, 540)');
  nodeLines.push('amount = 16');
  nodeLines.push('lifetime = 8.0');
  nodeLines.push('preprocess = 4.0');
  nodeLines.push('emission_shape = 3');
  nodeLines.push('emission_rect_extents = Vector2(860, 440)');
  nodeLines.push('direction = Vector2(0.35, 1.0)');
  nodeLines.push('spread = 28.0');
  nodeLines.push('gravity = Vector2(5, 10)');
  nodeLines.push('initial_velocity_min = 12.0');
  nodeLines.push('initial_velocity_max = 22.0');
  nodeLines.push('scale_amount_min = 1.5');
  nodeLines.push('scale_amount_max = 2.0');
  nodeLines.push('color = Color(0.86, 0.54, 0.24, 0.92)');
  nodeLines.push('');
  nodeLines.push('[node name="SunlitDustMotes" type="CPUParticles2D" parent="EnvironmentalLifeLayer"]');
  nodeLines.push('position = Vector2(1260, 740)');
  nodeLines.push('amount = 10');
  nodeLines.push('lifetime = 6.5');
  nodeLines.push('preprocess = 3.0');
  nodeLines.push('emission_shape = 3');
  nodeLines.push('emission_rect_extents = Vector2(720, 380)');
  nodeLines.push('direction = Vector2(0.4, -0.2)');
  nodeLines.push('spread = 45.0');
  nodeLines.push('gravity = Vector2(0, -1)');
  nodeLines.push('initial_velocity_min = 3.0');
  nodeLines.push('initial_velocity_max = 7.0');
  nodeLines.push('scale_amount_min = 1.0');
  nodeLines.push('scale_amount_max = 1.2');
  nodeLines.push('color = Color(1.0, 0.95, 0.68, 0.72)');
  nodeLines.push('');
  nodeLines.push('[node name="FloatingSilkSeeds" type="CPUParticles2D" parent="EnvironmentalLifeLayer"]');
  nodeLines.push('position = Vector2(1152, 720)');
  nodeLines.push('amount = 6');
  nodeLines.push('lifetime = 9.0');
  nodeLines.push('preprocess = 4.0');
  nodeLines.push('emission_shape = 3');
  nodeLines.push('emission_rect_extents = Vector2(800, 400)');
  nodeLines.push('direction = Vector2(1.0, 0.15)');
  nodeLines.push('spread = 20.0');
  nodeLines.push('gravity = Vector2(3, 1)');
  nodeLines.push('initial_velocity_min = 10.0');
  nodeLines.push('initial_velocity_max = 18.0');
  nodeLines.push('scale_amount_min = 1.2');
  nodeLines.push('scale_amount_max = 1.6');
  nodeLines.push('color = Color(0.94, 0.98, 0.91, 0.85)');
  nodeLines.push('');
  nodeLines.push('[node name="BiolumSpores" type="CPUParticles2D" parent="EnvironmentalLifeLayer"]');
  nodeLines.push('position = Vector2(1704, 590)');
  nodeLines.push('amount = 8');
  nodeLines.push('lifetime = 4.4');
  nodeLines.push('preprocess = 2.0');
  nodeLines.push('emission_shape = 3');
  nodeLines.push('emission_rect_extents = Vector2(45, 165)');
  nodeLines.push('direction = Vector2(0, -1)');
  nodeLines.push('spread = 24.0');
  nodeLines.push('gravity = Vector2(0, -3)');
  nodeLines.push('initial_velocity_min = 4.0');
  nodeLines.push('initial_velocity_max = 8.0');
  nodeLines.push('scale_amount_min = 1.0');
  nodeLines.push('scale_amount_max = 1.5');
  nodeLines.push('color = Color(0.60, 0.98, 0.94, 0.84)');
  nodeLines.push('');

  // Collision-Debug Drawer (F3) & Live Intel HD 3000 Perf HUD (F4)
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
  nodeLines.push('theme_override_colors/font_color = Color(0.96, 0.99, 0.96, 1)');
  nodeLines.push('theme_override_colors/font_shadow_color = Color(0, 0, 0, 0.85)');
  nodeLines.push('theme_override_font_sizes/font_size = 9');
  nodeLines.push('text = "V8.0 LIVING WORLD | F3:ColDebug F4:PerfHUD F5:Mood F6:WindGust 1-8:Biomes"');
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
  fs.writeFileSync(path.join(gScenesDir, 'v80_living_world_forest.tscn'), tscn);

  const bat = `@echo off
REM VERDANT SIGNAL V8.0 — Real Godot 4.7.2 Living World Verification Launcher (Windows / Intel HD 3000)
REM Usage:
REM   run_windows_verification.bat         -> Launches playable V8.0 Living World (WASD+Shift, F3 ColDebug, F4 PerfHUD, F5 Mood, F6 Gust, 1-8 Biomes)
REM   run_windows_verification.bat capture -> Auto-captures 7 native 640x360 PNGs across moods & Collision-Debug directly from Godot!
setlocal
if "%GODOT_EXE%"=="" set GODOT_EXE=godot
if /i "%1"=="capture" (
  echo Running Godot 4.7.2 V8.0 automated native 640x360 capture...
  "%GODOT_EXE%" --path "%~dp0." -- --capture-proofs
) else (
  echo Launching Godot 4.7.2 V8.0 Living World Forest Study...
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
    livingTuftCount: state.tufts.length,
    critterCount: state.critters.length,
    totalCpuParticles: 40,
  };
}
