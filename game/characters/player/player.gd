class_name PlayerController
extends CharacterBody2D
## Dr. Mara Lin top-down controller for VERDANT SIGNAL (Production V8.0 Integration).
##
## Drives bit-for-bit unmodified 88x88 4-cardinal original character artwork
## (idle, walking, running — zero flip_h, zero fabricated frames), while preserving
## every production gameplay system: crouch-stealth, sprint/run, Acoustic Field Lens,
## field sampling, surface-aware wading & ripples, canopy overlap & foliage peek occlusion.

signal acoustic_pulse_emitted(world_pos: Vector2, scan_radius: float)
signal water_ripple_requested(world_pos: Vector2)
signal field_sample_requested(world_pos: Vector2)

const WALK_SPEED: float = 84.0
const RUN_SPEED: float = 128.0
const CROUCH_SPEED: float = 46.0
const LENS_SPEED: float = 38.0
const SHALLOW_WATER_FACTOR: float = 0.85
const ACCEL_RATE: float = 760.0
const FRICTION_RATE: float = 840.0

const LENS_SCAN_RADIUS: float = 112.0
const LENS_PULSE_INTERVAL: float = 0.55
const WATER_RIPPLE_INTERVAL: float = 0.34

const SHEET_COLS: int = 8
const SHEET_ROWS: int = 4

const STATE_IDLE: int = 0
const STATE_WALK: int = 1
const STATE_RUN: int = 2
const STATE_CROUCH: int = 3
const STATE_LENS: int = 4

# Exact row mapping in unmodified 88x88 8x4 strips: 0=south, 1=north, 2=east, 3=west
const DIR_DOWN: int = 0
const DIR_UP: int = 1
const DIR_RIGHT: int = 2
const DIR_LEFT: int = 3

const IDLE_FPS: float = 5.0
const WALK_FPS: float = 9.5
const RUN_FPS: float = 12.5
const CROUCH_FPS: float = 6.0

const TEX_IDLE: Texture2D = preload("res://assets/characters/player/mara_original/char_idle_88x88_8x4.png")
const TEX_WALK: Texture2D = preload("res://assets/characters/player/mara_original/char_walking_88x88_8x4.png")
const TEX_RUN: Texture2D = preload("res://assets/characters/player/mara_original/char_running_88x88_8x4.png")

var current_surface: String = "living_forest"
var is_crouching: bool = false
var is_running: bool = false
var is_scanning: bool = false
var canopy_overlap_count: int = 0

var _facing_dir: int = DIR_RIGHT
var _anim_state: int = STATE_IDLE
var _anim_time: float = 0.0
var _frame_col: int = 0
var _lens_pulse_timer: float = 0.0
var _water_ripple_timer: float = 0.0
var _terrain_speed_mul: float = 1.0

@onready var _body_sprite: Sprite2D = $BodySprite
@onready var _peek_sprite: Sprite2D = $OcclusionPeekSprite
@onready var _shadow_sprite: Sprite2D = $ShadowSprite
@onready var _camera: Camera2D = $Camera2D


func _ready() -> void:
	motion_mode = CharacterBody2D.MOTION_MODE_FLOATING
	_setup_sprites()
	_apply_animation_frame()


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("interact_sample"):
		field_sample_requested.emit(global_position)


func _physics_process(delta: float) -> void:
	var input_vec: Vector2 = Input.get_vector(
		"move_left",
		"move_right",
		"move_up",
		"move_down"
	)
	is_crouching = Input.is_action_pressed("crouch_stealth")
	is_scanning = Input.is_action_pressed("toggle_acoustic_lens")
	is_running = (
		Input.is_action_pressed("sprint_dodge")
		and not is_crouching
		and not is_scanning
	)

	if input_vec.length_squared() > 0.01:
		_update_facing(input_vec.normalized())

	var prev_pos: Vector2 = global_position
	var target_speed: float = _resolve_move_speed()
	var target_vel: Vector2 = input_vec * target_speed
	var rate: float = ACCEL_RATE if input_vec.length_squared() > 0.01 else FRICTION_RATE
	velocity = velocity.move_toward(target_vel, rate * delta)
	move_and_slide()

	var actual_speed: float = global_position.distance_to(prev_pos) / maxf(delta, 0.0001)
	_update_animation(delta, input_vec, actual_speed)
	_update_lens_pulses(delta)
	_update_water_ripples(delta)


func set_surface_type(surface_name: String) -> void:
	current_surface = surface_name


func set_terrain_speed_multiplier(multiplier: float) -> void:
	_terrain_speed_mul = clampf(multiplier, 0.4, 1.2)


func set_occluded_peek(occluded: bool) -> void:
	_peek_sprite.visible = occluded


func set_lighting_tint(tint: Color) -> void:
	_body_sprite.modulate = tint


func set_facing_row(dir_row: int) -> void:
	_facing_dir = clampi(dir_row, 0, 3)
	_apply_animation_frame()


func notify_canopy_entered() -> void:
	canopy_overlap_count += 1


func notify_canopy_exited() -> void:
	canopy_overlap_count = maxi(0, canopy_overlap_count - 1)


func get_facing_label() -> String:
	match _facing_dir:
		DIR_UP:
			return "north"
		DIR_RIGHT:
			return "east"
		DIR_LEFT:
			return "west"
		_:
			return "south"


func get_state_label() -> String:
	match _anim_state:
		STATE_RUN:
			return "run"
		STATE_WALK:
			return "walk"
		STATE_CROUCH:
			return "crouch"
		STATE_LENS:
			return "lens_scan"
		_:
			return "idle"


func get_camera() -> Camera2D:
	return _camera


func _setup_sprites() -> void:
	_body_sprite.texture = TEX_IDLE
	_body_sprite.hframes = SHEET_COLS
	_body_sprite.vframes = SHEET_ROWS
	_body_sprite.centered = true
	_body_sprite.offset = Vector2(0.0, -31.0)
	_body_sprite.flip_h = false

	_peek_sprite.texture = TEX_IDLE
	_peek_sprite.hframes = SHEET_COLS
	_peek_sprite.vframes = SHEET_ROWS
	_peek_sprite.centered = true
	_peek_sprite.offset = Vector2(0.0, -31.0)
	_peek_sprite.flip_h = false
	_peek_sprite.visible = false

	# Keep shadow sprite hidden for 88x88 original artwork (boots carry baked contact shading; no dark ovals)
	_shadow_sprite.visible = false


func _resolve_move_speed() -> float:
	var base_speed: float = WALK_SPEED
	if is_scanning:
		base_speed = LENS_SPEED
	elif is_crouching:
		base_speed = CROUCH_SPEED
	elif is_running:
		base_speed = RUN_SPEED
	var mul: float = _terrain_speed_mul
	if current_surface == "shallow_water":
		mul = minf(mul, SHALLOW_WATER_FACTOR)
	return base_speed * mul


func _update_facing(norm_dir: Vector2) -> void:
	if absf(norm_dir.x) > absf(norm_dir.y) * 1.12:
		_facing_dir = DIR_RIGHT if norm_dir.x > 0.0 else DIR_LEFT
	elif absf(norm_dir.y) > absf(norm_dir.x) * 1.12:
		_facing_dir = DIR_DOWN if norm_dir.y > 0.0 else DIR_UP
	else:
		if _facing_dir == DIR_DOWN or _facing_dir == DIR_UP:
			_facing_dir = DIR_DOWN if norm_dir.y >= 0.0 else DIR_UP
		else:
			_facing_dir = DIR_RIGHT if norm_dir.x >= 0.0 else DIR_LEFT


func _update_animation(delta: float, input_vec: Vector2, actual_speed: float) -> void:
	var is_moving: bool = input_vec.length_squared() > 0.01 and actual_speed >= 8.0
	var next_state: int = STATE_IDLE
	if is_scanning:
		next_state = STATE_LENS
	elif is_crouching:
		next_state = STATE_CROUCH
	elif is_moving:
		next_state = STATE_RUN if (is_running and actual_speed > 92.0) else STATE_WALK

	if next_state != _anim_state:
		_anim_state = next_state
		_anim_time = 0.0
		_frame_col = 0

	var fps: float = IDLE_FPS
	if _anim_state == STATE_RUN:
		fps = RUN_FPS
	elif _anim_state == STATE_WALK:
		fps = WALK_FPS
	elif _anim_state == STATE_CROUCH:
		fps = CROUCH_FPS if is_moving else IDLE_FPS
	elif _anim_state == STATE_LENS:
		fps = CROUCH_FPS if is_moving else IDLE_FPS

	_anim_time += delta * fps
	_frame_col = int(floor(_anim_time)) % SHEET_COLS
	_apply_animation_frame(is_moving)


func _apply_animation_frame(is_moving: bool = false) -> void:
	# Strictly use ONLY the three unmodified original strips (never fabricate missing states)
	var target_tex: Texture2D = TEX_IDLE
	if _anim_state == STATE_RUN:
		target_tex = TEX_RUN
	elif _anim_state == STATE_WALK or ((_anim_state == STATE_CROUCH or _anim_state == STATE_LENS) and is_moving):
		target_tex = TEX_WALK

	if _body_sprite.texture != target_tex:
		_body_sprite.texture = target_tex
		_peek_sprite.texture = target_tex

	var fc := Vector2i(_frame_col, _facing_dir)
	_body_sprite.frame_coords = fc
	_peek_sprite.frame_coords = fc


func _update_lens_pulses(delta: float) -> void:
	if not is_scanning:
		_lens_pulse_timer = 0.0
		return
	_lens_pulse_timer -= delta
	if _lens_pulse_timer <= 0.0:
		_lens_pulse_timer = LENS_PULSE_INTERVAL
		acoustic_pulse_emitted.emit(global_position, LENS_SCAN_RADIUS)


func _update_water_ripples(delta: float) -> void:
	if current_surface != "shallow_water" or velocity.length_squared() < 16.0:
		_water_ripple_timer = 0.0
		return
	_water_ripple_timer -= delta
	if _water_ripple_timer <= 0.0:
		_water_ripple_timer = WATER_RIPPLE_INTERVAL
		water_ripple_requested.emit(global_position)
