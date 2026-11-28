## FIX 01: Named method connection + explicit _exit_tree disconnect + is_instance_valid() guard.
class_name Bug01SignalLeakFixed
extends Node

var _cached_target: Node2D = null
var _event_emitter: Node = null


func attach_to_emitter(emitter: Node, target: Node2D) -> void:
	detach_from_emitter()
	if emitter == null or not is_instance_valid(emitter):
		return
	if not emitter.has_signal(&"pulse"):
		push_error("Bug01SignalLeakFixed: Emitter lacks expected 'pulse' signal.")
		return
	_event_emitter = emitter
	_cached_target = target
	_event_emitter.connect(&"pulse", _on_emitter_pulse)


func detach_from_emitter() -> void:
	if _event_emitter != null and is_instance_valid(_event_emitter):
		if _event_emitter.is_connected(&"pulse", _on_emitter_pulse):
			_event_emitter.disconnect(&"pulse", _on_emitter_pulse)
	_event_emitter = null


func _exit_tree() -> void:
	detach_from_emitter()


func _on_emitter_pulse(strength: float) -> void:
	if _cached_target == null or not is_instance_valid(_cached_target):
		_cached_target = null
		return
	_cached_target.position.x += strength
