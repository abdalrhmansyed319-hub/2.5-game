## Abstract FSM state contract (Godot 4.5+ @abstract).
## States signal transition requests upward rather than directly swapping sibling states.
@abstract
class_name AIState
extends Node

signal transition_requested(next_state_name: StringName, payload: Dictionary)

var blackboard: Dictionary[StringName, Variant] = {}


func enter(_payload: Dictionary = {}) -> void:
	pass


func exit() -> void:
	pass


@abstract
func physics_update(delta: float) -> void


func request_transition(next_state_name: StringName, payload: Dictionary = {}) -> void:
	transition_requested.emit(next_state_name, payload)
