## Pure planar kinematic velocity solver component for CharacterBody2D.
## Computes smooth acceleration/friction/turn-around velocity without owning input or visuals.
class_name PlanarMotor2D
extends Node

signal velocity_updated(new_velocity: Vector2)
signal facing_changed(new_facing: Vector2)

@export var config: MovementConfig2D

var _facing: Vector2 = Vector2.RIGHT


func compute_velocity(
	current_velocity: Vector2,
	move_axis: Vector2,
	delta: float
) -> Vector2:
	if config == null:
		push_warning("PlanarMotor2D requires a MovementConfig2D resource.")
		return current_velocity

	var next_velocity := current_velocity
	if move_axis.length_squared() > 0.0001:
		var target := move_axis * config.max_speed
		var rate := config.acceleration
		if current_velocity.dot(move_axis) < 0.0:
			rate *= config.turn_multiplier
		next_velocity = current_velocity.move_toward(target, rate * delta)
		_update_facing(move_axis.normalized())
	else:
		next_velocity = current_velocity.move_toward(Vector2.ZERO, config.friction * delta)

	velocity_updated.emit(next_velocity)
	return next_velocity


func get_facing() -> Vector2:
	return _facing


func _update_facing(direction: Vector2) -> void:
	if not direction.is_equal_approx(_facing):
		_facing = direction
		facing_changed.emit(_facing)
