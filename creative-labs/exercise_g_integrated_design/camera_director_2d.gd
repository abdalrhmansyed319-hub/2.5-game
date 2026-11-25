class_name CameraDirector2D
extends Camera2D
## Exercise G: Production-grade 2D Camera Director implementing Itay Keren's
## "Scroll Back" (GDC 2015) techniques for Godot 4.7:
##   - Horizontal/Vertical Deadzone Window (prevents micro-jitter)
##   - Directional Look-Ahead Lead with Commit Delay (frames upcoming hazards)
##   - Vertical Platform Snapping with Fall Safety Threshold (eliminates jump seasickness)
##   - Smooth Focus Anchor Blending (vistas, boss reveals, shortcuts)
##   - Quadratic Trauma FastNoiseLite Screen Shake respecting accessibility scale

@export var target: CharacterBody2D
@export var deadzone_half_size: Vector2 = Vector2(24.0, 20.0)
@export var lookahead_distance: float = 48.0
@export var lookahead_commit_sec: float = 0.14
@export var horizontal_smooth_speed: float = 7.5
@export var vertical_snap_speed: float = 6.0
@export var vertical_fall_margin: float = 72.0
@export var trauma_decay_rate: float = 1.6
@export var max_shake_offset: Vector2 = Vector2(10.0, 8.0)
@export var max_shake_rotation_rad: float = 0.025
@export_range(0.0, 1.0, 0.05) var accessibility_shake_scale: float = 1.0

var _anchor_pos: Vector2 = Vector2.ZERO
var _grounded_y: float = 0.0
var _facing_dir: float = 1.0
var _pending_dir: float = 1.0
var _dir_commit_timer: float = 0.0
var _current_lookahead_x: float = 0.0

var _focus_override: Node2D
var _focus_blend: float = 0.0
var _trauma: float = 0.0
var _noise_time: float = 0.0
var _noise: FastNoiseLite = FastNoiseLite.new()


func _ready() -> void:
	_noise.seed = 4072
	_noise.frequency = 1.8
	if target != null:
		_anchor_pos = target.global_position
		_grounded_y = target.global_position.y
		global_position = _anchor_pos


func _physics_process(delta: float) -> void:
	if target == null:
		return
	_update_lookahead(delta)
	_update_anchor(delta)
	_apply_focus_and_position(delta)
	_update_trauma_shake(delta)


func add_trauma(amount: float) -> void:
	_trauma = clampf(_trauma + maxf(0.0, amount), 0.0, 1.0)


func set_focus_anchor(anchor: Node2D, blend_weight: float = 0.5) -> void:
	_focus_override = anchor
	_focus_blend = clampf(blend_weight, 0.0, 1.0)


func clear_focus_anchor() -> void:
	_focus_override = null
	_focus_blend = 0.0


func apply_room_bounds(bounds: Rect2i) -> void:
	limit_left = bounds.position.x
	limit_top = bounds.position.y
	limit_right = bounds.position.x + bounds.size.x
	limit_bottom = bounds.position.y + bounds.size.y


func _update_lookahead(delta: float) -> void:
	var vx := target.velocity.x
	if absf(vx) > 10.0:
		var desired := signf(vx)
		if is_equal_approx(desired, _pending_dir):
			_dir_commit_timer += delta
			if _dir_commit_timer >= lookahead_commit_sec:
				_facing_dir = desired
		else:
			_pending_dir = desired
			_dir_commit_timer = 0.0

	var target_lead := _facing_dir * lookahead_distance
	var weight := 1.0 - exp(-horizontal_smooth_speed * delta)
	_current_lookahead_x = lerpf(_current_lookahead_x, target_lead, weight)


func _update_anchor(delta: float) -> void:
	var tpos := target.global_position
	var dx := tpos.x - _anchor_pos.x
	if absf(dx) > deadzone_half_size.x:
		var excess_x := dx - signf(dx) * deadzone_half_size.x
		var hx_weight := 1.0 - exp(-horizontal_smooth_speed * delta)
		_anchor_pos.x += excess_x * hx_weight

	if target.is_on_floor():
		_grounded_y = tpos.y
	elif tpos.y > _grounded_y + vertical_fall_margin:
		_grounded_y = tpos.y - vertical_fall_margin
	elif tpos.y < _grounded_y - vertical_fall_margin * 1.25:
		_grounded_y = tpos.y + vertical_fall_margin * 0.5

	var dy := _grounded_y - _anchor_pos.y
	if absf(dy) > deadzone_half_size.y:
		var hy_weight := 1.0 - exp(-vertical_snap_speed * delta)
		_anchor_pos.y = lerpf(_anchor_pos.y, _grounded_y, hy_weight)


func _apply_focus_and_position(delta: float) -> void:
	var desired := Vector2(_anchor_pos.x + _current_lookahead_x, _anchor_pos.y)
	if _focus_override != null and is_instance_valid(_focus_override):
		desired = desired.lerp(_focus_override.global_position, _focus_blend)
	var pos_weight := 1.0 - exp(-horizontal_smooth_speed * delta)
	global_position = global_position.lerp(desired, pos_weight)


func _update_trauma_shake(delta: float) -> void:
	if _trauma <= 0.0:
		offset = Vector2.ZERO
		rotation = 0.0
		return
	_trauma = maxf(0.0, _trauma - trauma_decay_rate * delta)
	_noise_time += delta * 28.0
	var shake := _trauma * _trauma * accessibility_shake_scale
	offset = Vector2(
		_noise.get_noise_2d(1.0, _noise_time) * max_shake_offset.x * shake,
		_noise.get_noise_2d(73.0, _noise_time) * max_shake_offset.y * shake,
	)
	rotation = _noise.get_noise_2d(149.0, _noise_time) * max_shake_rotation_rad * shake
