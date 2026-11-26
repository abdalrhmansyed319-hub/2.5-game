class_name PlayerController
extends CharacterBody2D
## Dr. Mara Lin top-down controller for Milestone 01 prototype.
##
## Drives exact AST-001 6x16 non-mirrored animation rows (zero flip_h),
## surface-aware wade speed/ripples, crouch-stealth, and Acoustic Field Lens.

signal acoustic_pulse_emitted(world_pos: Vector2, scan_radius: float)
signal water_ripple_requested(world_pos: Vector2)

const WALK_SPEED: float = 74.0
const CROUCH_SPEED: float = 40.0
const LENS_SPEED: float = 32.0
const SHALLOW_WATER_FACTOR: float = 0.75
const ACCEL_RATE: float = 680.0
const FRICTION_RATE: float = 760.0

const LENS_SCAN_RADIUS: float = 96.0
const LENS_PULSE_INTERVAL: float = 0.55
const WATER_RIPPLE_INTERVAL: float = 0.34

const SHEET_COLS: int = 6
const SHEET_ROWS: int = 16

const STATE_IDLE: int = 0
const STATE_WALK: int = 1
const STATE_CROUCH: int = 2
const STATE_LENS: int = 3

const DIR_DOWN: int = 0
const DIR_UP: int = 1
const DIR_RIGHT: int = 2
const DIR_LEFT: int = 3

const STATE_FRAME_COUNTS: PackedInt32Array = [4, 6, 4, 2]
const STATE_FPS: PackedFloat32Array = [5.0, 10.0, 7.0, 4.0]

var current_surface: String = "sand"
var is_crouching: bool = false
var is_scanning: bool = false
var canopy_overlap_count: int = 0

var _facing_dir: int = DIR_DOWN
var _anim_state: int = STATE_IDLE
var _anim_time: float = 0.0
var _lens_pulse_timer: float = 0.0
var _water_ripple_timer: float = 0.0

@onready var _body_sprite: Sprite2D = $BodySprite
@onready var _shadow_sprite: Sprite2D = $ShadowSprite
@onready var _camera: Camera2D = $Camera2D


func _ready() -> void:
	motion_mode = CharacterBody2D.MOTION_MODE_FLOATING
	_setup_sprites()
	_apply_animation_frame(0)


func _physics_process(delta: float) -> void:
	var input_vec: Vector2 = Input.get_vector(
		"move_left",
		"move_right",
		"move_up",
		"move_down"
	)
	is_crouching = Input.is_action_pressed("crouch_stealth")
	is_scanning = Input.is_action_pressed("toggle_acoustic_lens")

	if input_vec.length_squared() > 0.01:
		_update_facing(input_vec)

	var target_speed: float = _resolve_move_speed()
	var target_vel: Vector2 = input_vec * target_speed
	var rate: float = ACCEL_RATE if input_vec.length_squared() > 0.01 else FRICTION_RATE
	velocity = velocity.move_toward(target_vel, rate * delta)
	move_and_slide()

	_update_animation(delta, input_vec)
	_update_lens_pulses(delta)
	_update_water_ripples(delta)


func set_surface_type(surface_name: String) -> void:
	current_surface = surface_name


func notify_canopy_entered() -> void:
	canopy_overlap_count += 1


func notify_canopy_exited() -> void:
	canopy_overlap_count = maxi(0, canopy_overlap_count - 1)


func get_facing_label() -> String:
	match _facing_dir:
		DIR_UP:
			return "up"
		DIR_RIGHT:
			return "right"
		DIR_LEFT:
			return "left"
		_:
			return "down"


func get_state_label() -> String:
	match _anim_state:
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
	_body_sprite.texture = AssetPaths.load_texture("AST-001")
	_body_sprite.hframes = SHEET_COLS
	_body_sprite.vframes = SHEET_ROWS
	_body_sprite.centered = true
	_body_sprite.offset = Vector2(0.0, -10.0)
	_body_sprite.flip_h = false

	_shadow_sprite.texture = AssetPaths.load_texture("AST-007")
	_shadow_sprite.centered = true
	_shadow_sprite.offset = Vector2.ZERO
	_shadow_sprite.region_enabled = true
	_shadow_sprite.region_rect = Rect2(0.0, 0.0, 32.0, 32.0)


func _resolve_move_speed() -> float:
	var base_speed: float = WALK_SPEED
	if is_scanning:
		base_speed = LENS_SPEED
	elif is_crouching:
		base_speed = CROUCH_SPEED
	if current_surface == "shallow_water":
		return base_speed * SHALLOW_WATER_FACTOR
	return base_speed


func _update_facing(input_vec: Vector2) -> void:
	if absf(input_vec.x) > absf(input_vec.y):
		_facing_dir = DIR_RIGHT if input_vec.x > 0.0 else DIR_LEFT
		return
	_facing_dir = DIR_DOWN if input_vec.y >= 0.0 else DIR_UP


func _update_animation(delta: float, input_vec: Vector2) -> void:
	var next_state: int = STATE_IDLE
	if is_scanning:
		next_state = STATE_LENS
	elif is_crouching:
		next_state = STATE_CROUCH
	elif input_vec.length_squared() > 0.01:
		next_state = STATE_WALK

	if next_state != _anim_state:
		_anim_state = next_state
		_anim_time = 0.0

	var is_moving: bool = velocity.length_squared() > 9.0
	if _anim_state == STATE_CROUCH and not is_moving:
		_apply_animation_frame(0)
		return

	_anim_time += delta
	var fps: float = STATE_FPS[_anim_state]
	var frame_count: int = STATE_FRAME_COUNTS[_anim_state]
	var col_idx: int = int(floor(_anim_time * fps)) % frame_count
	_apply_animation_frame(col_idx)


func _apply_animation_frame(col_idx: int) -> void:
	var row_idx: int = _anim_state * 4 + _facing_dir
	_body_sprite.frame = row_idx * SHEET_COLS + col_idx


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
