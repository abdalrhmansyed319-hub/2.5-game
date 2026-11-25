## Reusable passive interactable component (Area2D: monitorable = true, monitoring = false).
## Attach to any world object (door, lever, pickup) without inheriting a shared base class.
class_name Interactable2D
extends Area2D

signal focused(interactor: Node)
signal unfocused(interactor: Node)
signal interacted(interactor: Node)

## Localized key or label shown by a decoupled UI prompt when focused.
@export var prompt_label: String = "Interact"
## Higher priority wins when multiple interactables overlap the same interactor.
@export var priority: int = 0
## Maximum interaction range check used by scoring logic.
@export_range(8.0, 512.0, 1.0) var max_distance: float = 96.0
## Whether an unobstructed line-of-sight raycast is required.
@export var requires_line_of_sight: bool = false
@export var enabled: bool = true
@export_range(0.0, 30.0, 0.05) var cooldown_seconds: float = 0.0

var _cooldown_remaining: float = 0.0


func _ready() -> void:
	monitoring = false
	monitorable = true


func _physics_process(delta: float) -> void:
	if _cooldown_remaining > 0.0:
		_cooldown_remaining = maxf(0.0, _cooldown_remaining - delta)


func can_interact(interactor: Node) -> bool:
	if not enabled or _cooldown_remaining > 0.0:
		return false
	if interactor == null or not is_instance_valid(interactor):
		return false
	return true


func trigger_interaction(interactor: Node) -> bool:
	if not can_interact(interactor):
		return false
	if cooldown_seconds > 0.0:
		_cooldown_remaining = cooldown_seconds
	interacted.emit(interactor)
	return true


func notify_focus_gained(interactor: Node) -> void:
	focused.emit(interactor)


func notify_focus_lost(interactor: Node) -> void:
	unfocused.emit(interactor)
