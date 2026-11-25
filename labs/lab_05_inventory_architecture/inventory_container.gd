## Pure data-driven, UI-agnostic InventoryContainer with transactional add/remove/swap/split,
## weight cap enforcement, serialization, and granular change signals.
class_name InventoryContainer
extends RefCounted

signal slot_changed(slot_index: int)
signal inventory_changed()

var _slots: Array[InventorySlot] = []
var _max_weight: float = -1.0 # Negative means unlimited weight.


func _init(slot_capacity: int = 20, max_weight: float = -1.0) -> void:
	var clamped_cap := maxi(1, slot_capacity)
	_max_weight = max_weight
	_slots.resize(clamped_cap)
	for i in range(clamped_cap):
		_slots[i] = InventorySlot.new()


func get_capacity() -> int:
	return _slots.size()


func get_slot(index: int) -> InventorySlot:
	if not _is_valid_index(index):
		return null
	return _slots[index]


func get_total_weight() -> float:
	var total: float = 0.0
	for slot in _slots:
		total += slot.get_total_weight()
	return total


func count_item(item_id: StringName) -> int:
	var total: int = 0
	for slot in _slots:
		if not slot.is_empty() and slot.item.item_id == item_id:
			total += slot.quantity
	return total


## Adds as many units as fit (stack & weight limits). Returns leftover quantity (0 = all added).
func add_item(item: ItemDefinition, amount: int, meta: Dictionary = {}) -> int:
	if item == null or not item.is_valid() or amount <= 0:
		return maxi(0, amount)

	var remaining: int = amount
	var max_addable := _compute_weight_allowed_count(item, remaining)
	if max_addable <= 0:
		return remaining

	var to_place := max_addable
	var touched: Array[int] = []

	# Pass 1: Top off existing compatible stacks.
	for i in range(_slots.size()):
		if to_place <= 0:
			break
		var slot := _slots[i]
		if slot.can_stack_with(item, meta):
			var space := item.max_stack - slot.quantity
			var delta := mini(space, to_place)
			slot.quantity += delta
			to_place -= delta
			touched.append(i)

	# Pass 2: Fill empty slots.
	for i in range(_slots.size()):
		if to_place <= 0:
			break
		var slot := _slots[i]
		if slot.is_empty():
			var delta := mini(item.max_stack, to_place)
			slot.item = item
			slot.quantity = delta
			slot.instance_metadata = meta.duplicate(true)
			to_place -= delta
			touched.append(i)

	var placed := max_addable - to_place
	if placed > 0:
		_emit_updates(touched)
	return remaining - placed


## Atomic removal: removes exact amount only if sufficient quantity exists across slots.
func remove_item(item_id: StringName, amount: int) -> bool:
	if item_id.is_empty() or amount <= 0:
		return false
	if count_item(item_id) < amount:
		return false

	var remaining := amount
	var touched: Array[int] = []
	for i in range(_slots.size() - 1, -1, -1):
		if remaining <= 0:
			break
		var slot := _slots[i]
		if not slot.is_empty() and slot.item.item_id == item_id:
			var take := mini(slot.quantity, remaining)
			slot.quantity -= take
			remaining -= take
			if slot.quantity <= 0:
				slot.clear()
			touched.append(i)

	_emit_updates(touched)
	return true


## Merges stacks when compatible, otherwise swaps slot contents cleanly.
func move_or_swap(from_index: int, to_index: int) -> bool:
	if not _is_valid_index(from_index) or not _is_valid_index(to_index):
		return false
	if from_index == to_index:
		return false

	var src := _slots[from_index]
	var dst := _slots[to_index]
	if src.is_empty():
		return false

	if dst.can_stack_with(src.item, src.instance_metadata):
		var space := dst.item.max_stack - dst.quantity
		var transfer := mini(space, src.quantity)
		dst.quantity += transfer
		src.quantity -= transfer
		if src.quantity <= 0:
			src.clear()
	else:
		_slots[from_index] = dst
		_slots[to_index] = src

	_emit_updates([from_index, to_index])
	return true


func serialize() -> Dictionary:
	var entries: Array[Dictionary] = []
	for i in range(_slots.size()):
		var slot := _slots[i]
		if slot.is_empty():
			continue
		entries.append({
			"slot": i,
			"item_id": String(slot.item.item_id),
			"quantity": slot.quantity,
			"meta": slot.instance_metadata.duplicate(true),
		})
	return {
		"capacity": _slots.size(),
		"max_weight": _max_weight,
		"entries": entries,
	}


func deserialize(data: Dictionary, item_registry: Dictionary[StringName, ItemDefinition]) -> bool:
	if not data.has("entries") or not (data["entries"] is Array):
		return false
	for slot in _slots:
		slot.clear()

	var raw_entries: Array = data["entries"]
	var touched: Array[int] = []
	for entry in raw_entries:
		if not (entry is Dictionary):
			continue
		var idx: int = int(entry.get("slot", -1))
		var id := StringName(str(entry.get("item_id", "")))
		var qty: int = int(entry.get("quantity", 0))
		if not _is_valid_index(idx) or not item_registry.has(id) or qty <= 0:
			continue
		var def: ItemDefinition = item_registry[id]
		var slot := _slots[idx]
		slot.item = def
		slot.quantity = mini(qty, def.max_stack)
		var meta_raw: Variant = entry.get("meta", {})
		if meta_raw is Dictionary:
			slot.instance_metadata = (meta_raw as Dictionary).duplicate(true)
		else:
			slot.instance_metadata = {}
		touched.append(idx)

	_emit_updates(touched)
	return true


func _compute_weight_allowed_count(item: ItemDefinition, requested: int) -> int:
	if _max_weight < 0.0 or item.unit_weight <= 0.0:
		return requested
	var free_weight := maxf(0.0, _max_weight - get_total_weight())
	return mini(requested, int(floor(free_weight / item.unit_weight)))


func _is_valid_index(index: int) -> bool:
	return index >= 0 and index < _slots.size()


func _emit_updates(indices: Array[int]) -> void:
	for idx in indices:
		slot_changed.emit(idx)
	inventory_changed.emit()
