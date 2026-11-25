## Advanced responsive grounded CharacterBody2D movement controller.
## Implements derived jump kinematics, coyote time, jump buffering, variable jump height,
## apex hang, slope snapping, one-way platform drop-through, and moving platform inertia.
class_name AdvancedMovementController2D
extends CharacterBody2D

signal jumped(used_coyote_time: bool)
signal landed(impact_speed: float)
signal dropped_through_platform()

const ONE_WAY_LAYER_BIT: int = 2

@export var profile: GroundedMovementProfile2D
@export var input_source: InputSource2D

var _coyote_timer: float = 0.0
var _jump_buffer_timer: float = 0.0
var _drop_through_timer: float = 0.0
var _was_on_floor: bool = false
var _last_air_vy: float = 0.0


func _ready() -> void:
	motion_mode = CharacterBody2D.MOTION_MODE_GROUNDED
	floor_stop_on_slope = true
	floor_constant_speed = true
	floor_block_on_wall = true
	platform_on_leave = CharacterBody2D.PLATFORM_ON_LEAVE_ADD_VELOCITY
	_apply_profile_body_settings()


func _physics_process(delta: float) -> void:
	if profile == null or input_source == null:
		return

	var intent: InputIntent2D = input_source.sample_intent(delta)
	_tick_timers(delta, intent)
	_handle_one_way_drop(intent)
	_apply_horizontal_velocity(intent.move_axis.x, delta)
	_apply_gravity(delta)
	_try_execute_jump(intent)

	if not is_on_floor():
		_last_air_vy = velocity.y

	move_and_slide()

	var now_on_floor := is_on_floor()
	if now_on_floor and not _was_on_floor:
		landed.emit(maxf(0.0, _last_air_vy))
		_last_air_vy = 0.0
	_was_on_floor = now_on_floor


func get_coyote_remaining() -> float:
	return _coyote_timer


func get_jump_buffer_remaining() -> float:
	return _jump_buffer_timer


func _apply_profile_body_settings() -> void:
	if profile == null:
		return
	floor_snap_length = profile.floor_snap_px
	floor_max_angle = deg_to_rad(profile.max_slope_degrees)


func _tick_timers(delta: float, intent: InputIntent2D) -> void:
	if is_on_floor():
		_coyote_timer = profile.coyote_time
	else:
		_coyote_timer = maxf(0.0, _coyote_timer - delta)

	if intent.jump_just_pressed:
		_jump_buffer_timer = profile.jump_buffer_time
	else:
		_jump_buffer_timer = maxf(0.0, _jump_buffer_timer - delta)

	if _drop_through_timer > 0.0:
		_drop_through_timer = maxf(0.0, _drop_through_timer - delta)
		if is_zero_approx(_drop_through_timer):
			set_collision_mask_value(ONE_WAY_LAYER_BIT, true)


func _handle_one_way_drop(intent: InputIntent2D) -> void:
	if not is_on_floor():
		return
	if intent.drop_through_held and intent.jump_just_pressed:
		_jump_buffer_timer = 0.0
		_coyote_timer = 0.0
		_drop_through_timer = profile.one_way_drop_duration
		set_collision_mask_value(ONE_WAY_LAYER_BIT, false)
		position.y += 1.0
		dropped_through_platform.emit()


func _apply_horizontal_velocity(axis_x: float, delta: float) -> void:
	var grounded := is_on_floor()
	if absf(axis_x) > 0.01:
		var target_vx := axis_x * profile.max_run_speed
		var accel := profile.ground_acceleration if grounded else profile.air_acceleration
		if grounded and signf(velocity.x) != 0.0 and signf(velocity.x) != signf(axis_x):
			accel *= profile.ground_turn_multiplier
		velocity.x = move_toward(velocity.x, target_vx, accel * delta)
	else:
		var decel := profile.ground_friction if grounded else profile.air_drag
		velocity.x = move_toward(velocity.x, 0.0, decel * delta)


func _apply_gravity(delta: float) -> void:
	if is_on_floor():
		return
	var gravity := profile.get_rise_gravity() if velocity.y < 0.0 else profile.get_fall_gravity()
	if absf(velocity.y) < profile.apex_velocity_threshold:
		gravity *= profile.apex_gravity_scale
	velocity.y = minf(velocity.y + gravity * delta, profile.max_fall_speed)


func _try_execute_jump(intent: InputIntent2D) -> void:
	if _jump_buffer_timer > 0.0 and _coyote_timer > 0.0 and _drop_through_timer <= 0.0:
		var used_coyote := not is_on_floor()
		velocity.y = profile.get_jump_velocity()
		_jump_buffer_timer = 0.0
		_coyote_timer = 0.0
		jumped.emit(used_coyote)

	if intent.jump_just_released and velocity.y < 0.0:
		velocity.y *= profile.jump_cut_multiplier
