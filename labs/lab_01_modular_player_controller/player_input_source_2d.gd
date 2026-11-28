## Concrete human input provider reading Godot InputMap actions into an InputIntent2D.
class_name PlayerInputSource2D
extends InputSource2D

const ACTION_LEFT: StringName = &"move_left"
const ACTION_RIGHT: StringName = &"move_right"
const ACTION_UP: StringName = &"move_up"
const ACTION_DOWN: StringName = &"move_down"
const ACTION_JUMP: StringName = &"jump"
const ACTION_INTERACT: StringName = &"interact"

@export var normalize_vector: bool = true

var _intent: InputIntent2D = InputIntent2D.new()


func sample_intent(_delta: float) -> InputIntent2D:
	var raw_axis := Vector2(
		Input.get_axis(ACTION_LEFT, ACTION_RIGHT),
		Input.get_axis(ACTION_UP, ACTION_DOWN)
	)
	if normalize_vector and raw_axis.length_squared() > 1.0:
		raw_axis = raw_axis.normalized()

	_intent.move_axis = raw_axis
	_intent.jump_just_pressed = Input.is_action_just_pressed(ACTION_JUMP)
	_intent.jump_held = Input.is_action_pressed(ACTION_JUMP)
	_intent.jump_just_released = Input.is_action_just_released(ACTION_JUMP)
	_intent.interact_just_pressed = Input.is_action_just_pressed(ACTION_INTERACT)
	_intent.drop_through_held = raw_axis.y > 0.65
	return _intent
