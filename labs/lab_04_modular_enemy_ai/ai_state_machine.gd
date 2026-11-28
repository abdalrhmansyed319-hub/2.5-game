## Generic node-based Finite State Machine with typed blackboard sharing and re-entrancy guards.
class_name AIStateMachine
extends Node

signal state_changed(previous_state: StringName, next_state: StringName)

@export var initial_state: AIState

var blackboard: Dictionary[StringName, Variant] = {}
var _states: Dictionary[StringName, AIState] = {}
var _current_state: AIState = null
var _is_transitioning: bool = false


func _ready() -> void:
	for child in get_children():
		if child is AIState:
			var state := child as AIState
			var key := StringName(state.name)
			_states[key] = state
			state.blackboard = blackboard
			state.transition_requested.connect(_on_transition_requested)

	if initial_state != null:
		transition_to(StringName(initial_state.name))


func _physics_process(delta: float) -> void:
	if _current_state != null:
		_current_state.physics_update(delta)


func get_current_state_name() -> StringName:
	return StringName(_current_state.name) if _current_state != null else &""


func transition_to(next_state_name: StringName, payload: Dictionary = {}) -> bool:
	if _is_transitioning:
		push_warning("AIStateMachine: Ignored re-entrant transition to '%s'." % next_state_name)
		return false
	if not _states.has(next_state_name):
		push_error("AIStateMachine: Unknown state '%s'." % next_state_name)
		return false

	var next_state: AIState = _states[next_state_name]
	if next_state == _current_state:
		return false

	_is_transitioning = true
	var previous_name := get_current_state_name()
	if _current_state != null:
		_current_state.exit()
	_current_state = next_state
	_current_state.enter(payload)
	_is_transitioning = false
	state_changed.emit(previous_name, next_state_name)
	return true


func _on_transition_requested(next_state_name: StringName, payload: Dictionary) -> void:
	transition_to(next_state_name, payload)
