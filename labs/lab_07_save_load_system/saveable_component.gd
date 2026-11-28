## Abstract saveable participant contract (Godot 4.5+ @abstract).
## Nodes opting into persistence expose a stable persistent_id (never a fragile runtime NodePath).
@abstract
class_name SaveableComponent
extends Node

const SAVEABLE_GROUP: StringName = &"saveable_component"

## Stable unique identifier authored in scene or assigned deterministically at spawn.
@export var persistent_id: StringName = &""


func _enter_tree() -> void:
	if not is_in_group(SAVEABLE_GROUP):
		add_to_group(SAVEABLE_GROUP)


@abstract
func capture_state() -> Dictionary


@abstract
func restore_state(state: Dictionary) -> void
