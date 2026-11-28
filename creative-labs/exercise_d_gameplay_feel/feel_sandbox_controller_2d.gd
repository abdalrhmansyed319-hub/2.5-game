class_name FeelSandboxController2D
extends CharacterBody2D
## Exercise D: A/B Gameplay Feel Comparator implementing Celeste-inspired forgiveness
## and kinetic animation cues (coyote time, jump buffer, apex hang, corner correction,
## visual-pivot squash/stretch) decoupled via FeelProfile Resources.

signal feel_event_emitted(event_name: StringName, intensity: float)

@export var profile: FeelProfile
@export var visual_pivot: Node2D
@export var move_speed: float = 160.0
@export var ground_accel: float = 1400.0
@export var air_accel: float = 950.0
@export var jump_velocity: float = -310.0
@export var base_gravity: float = 980.0
@export var max_fall_speed: float = 480.0

var _coyote_timer: float = 0.0
var _buffer_timer: float = 0.0
var _was_on_floor: bool = false
var _scale_tween: Tween


func _ready() -> void:
	if profile == null:
		profile = FeelProfile.new()


func _physics_process(delta: float) -> void:
	var on_floor := is_on_floor()
	_update_timers(delta, on_floor)
	_apply_horizontal(delta, on_floor)
	_apply_vertical(delta)
	_try_execute_jump()
	_try_corner_correction(delta)

	move_and_slide()
	_handle_landing_feedback(on_floor, is_on_floor())
	_was_on_floor = is_on_floor()


func trigger_impact_hitstop() -> void:
	if profile.hitstop_sec <= 0.0:
		return
	feel_event_emitted.emit(&"hitstop_requested", profile.hitstop_sec)


func _update_timers(delta: float, on_floor: bool) -> void:
	if on_floor:
		_coyote_timer = profile.coyote_time_sec
	else:
		_coyote_timer = maxf(0.0, _coyote_timer - delta)

	if Input.is_action_just_pressed(&"jump"):
		_buffer_timer = maxf(profile.jump_buffer_sec, delta)
	else:
		_buffer_timer = maxf(0.0, _buffer_timer - delta)


func _apply_horizontal(delta: float, on_floor: bool) -> void:
	var axis := Input.get_axis(&"move_left", &"move_right")
	var accel := ground_accel if on_floor else air_accel
	velocity.x = move_toward(velocity.x, axis * move_speed, accel * delta)


func _apply_vertical(delta: float) -> void:
	if is_on_floor():
		return
	var grav := base_gravity
	if absf(velocity.y) <= profile.apex_velocity_threshold:
		grav *= profile.apex_gravity_scale
	velocity.y = minf(max_fall_speed, velocity.y + grav * delta)

	if Input.is_action_just_released(&"jump") and velocity.y < 0.0:
		velocity.y *= profile.jump_cut_multiplier


func _try_execute_jump() -> void:
	if _buffer_timer <= 0.0 or _coyote_timer <= 0.0:
		return
	velocity.y = jump_velocity
	_coyote_timer = 0.0
	_buffer_timer = 0.0
	_pulse_visual_scale(profile.takeoff_stretch, 0.14)
	feel_event_emitted.emit(&"jump_takeoff", 1.0)


func _try_corner_correction(delta: float) -> void:
	if profile.corner_correction_px <= 0.0 or velocity.y >= 0.0:
		return
	var step_motion := Vector2(0.0, velocity.y * delta)
	if not test_move(global_transform, step_motion):
		return
	var max_nudge := int(profile.corner_correction_px)
	for offset in range(1, max_nudge + 1):
		var right_xform := global_transform.translated(Vector2(float(offset), 0.0))
		if not test_move(right_xform, step_motion):
			global_position.x += float(offset)
			feel_event_emitted.emit(&"corner_nudged", float(offset))
			return
		var left_xform := global_transform.translated(Vector2(float(-offset), 0.0))
		if not test_move(left_xform, step_motion):
			global_position.x -= float(offset)
			feel_event_emitted.emit(&"corner_nudged", float(-offset))
			return


func _handle_landing_feedback(was_grounded: bool, now_grounded: bool) -> void:
	if now_grounded and not was_grounded:
		_pulse_visual_scale(profile.landing_squash, 0.12)
		feel_event_emitted.emit(&"landed", 1.0)


func _pulse_visual_scale(target_scale: Vector2, recover_sec: float) -> void:
	if visual_pivot == null or profile.reduced_motion:
		return
	if _scale_tween != null and _scale_tween.is_valid():
		_scale_tween.kill()
	visual_pivot.scale = target_scale
	_scale_tween = create_tween()
	_scale_tween.tween_property(visual_pivot, "scale", Vector2.ONE, recover_sec) \
		.set_trans(Tween.TRANS_SINE) \
		.set_ease(Tween.EASE_OUT)
