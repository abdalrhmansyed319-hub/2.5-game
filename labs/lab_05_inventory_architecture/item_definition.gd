## Immutable item definition blueprint stored as a Resource (.tres).
## Never mutate ItemDefinition fields at runtime; store mutable per-stack state in InventorySlot.
class_name ItemDefinition
extends Resource

@export var item_id: StringName = &""
@export var display_name: String = ""
@export var category: StringName = &"general"
@export_range(1, 9999, 1) var max_stack: int = 1
@export_range(0.0, 1000.0, 0.05) var unit_weight: float = 0.0
@export var icon: Texture2D
@export var tags: Array[StringName] = []


func is_valid() -> bool:
	return not item_id.is_empty() and max_stack >= 1
