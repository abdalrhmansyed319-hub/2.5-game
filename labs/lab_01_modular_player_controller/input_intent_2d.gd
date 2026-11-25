## Standardized per-tick input snapshot decoupling input hardware/AI from motor logic.
class_name InputIntent2D
extends RefCounted

var move_axis: Vector2 = Vector2.ZERO
var jump_just_pressed: bool = false
var jump_held: bool = false
var jump_just_released: bool = false
var interact_just_pressed: bool = false
var drop_through_held: bool = false


func reset() -> void:
	move_axis = Vector2.ZERO
	jump_just_pressed = false
	jump_held = false
	jump_just_released = false
	interact_just_pressed = false
	drop_through_held = false
