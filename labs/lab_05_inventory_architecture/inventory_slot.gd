## Mutable runtime slot entry inside an InventoryContainer.
class_name InventorySlot
extends RefCounted

var item: ItemDefinition = null
var quantity: int = 0
var instance_metadata: Dictionary = {}


func is_empty() -> bool:
	return item == null or quantity <= 0


func clear() -> void:
	item = null
	quantity = 0
	instance_metadata = {}


func can_stack_with(candidate: ItemDefinition, candidate_meta: Dictionary = {}) -> bool:
	if is_empty() or candidate == null:
		return false
	if item.item_id != candidate.item_id:
		return false
	if item.max_stack <= 1 or quantity >= item.max_stack:
		return false
	return instance_metadata == candidate_meta


func get_total_weight() -> float:
	if is_empty():
		return 0.0
	return item.unit_weight * float(quantity)
