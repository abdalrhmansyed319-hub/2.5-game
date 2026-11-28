## Tuning profile for responsive grounded platforming / gravity-based 2D movement.
class_name GroundedMovementProfile2D
extends Resource

@export_group("Horizontal Locomotion")
@export_range(20.0, 1500.0, 1.0) var max_run_speed: float = 280.0
@export_range(50.0, 12000.0, 10.0) var ground_acceleration: float = 2600.0
@export_range(50.0, 12000.0, 10.0) var ground_friction: float = 2800.0
@export_range(1.0, 4.0, 0.05) var ground_turn_multiplier: float = 1.8
@export_range(50.0, 10000.0, 10.0) var air_acceleration: float = 1700.0
@export_range(0.0, 6000.0, 10.0) var air_drag: float = 450.0

@export_group("Jump & Gravity")
@export_range(16.0, 600.0, 1.0) var jump_height: float = 112.0
@export_range(0.1, 1.5, 0.01) var time_to_apex: float = 0.36
@export_range(1.0, 3.0, 0.05) var fall_gravity_multiplier: float = 1.55
@export_range(0.1, 1.0, 0.05) var jump_cut_multiplier: float = 0.48
@export_range(100.0, 3000.0, 10.0) var max_fall_speed: float = 980.0
@export_range(0.0, 200.0, 1.0) var apex_velocity_threshold: float = 45.0
@export_range(0.2, 1.0, 0.05) var apex_gravity_scale: float = 0.65

@export_group("Forgiveness & Surfaces")
@export_range(0.0, 0.3, 0.01) var coyote_time: float = 0.11
@export_range(0.0, 0.3, 0.01) var jump_buffer_time: float = 0.12
@export_range(0.0, 32.0, 0.5) var floor_snap_px: float = 10.0
@export_range(15.0, 75.0, 1.0) var max_slope_degrees: float = 46.0
@export_range(0.05, 0.5, 0.01) var one_way_drop_duration: float = 0.16


## Derived jump launch speed: v0 = -2 * H / t_apex (negative Y is up in Godot 2D).
func get_jump_velocity() -> float:
	return (-2.0 * jump_height) / maxf(0.05, time_to_apex)


## Derived rise gravity: g = 2 * H / (t_apex^2).
func get_rise_gravity() -> float:
	var t := maxf(0.05, time_to_apex)
	return (2.0 * jump_height) / (t * t)


func get_fall_gravity() -> float:
	return get_rise_gravity() * fall_gravity_multiplier
