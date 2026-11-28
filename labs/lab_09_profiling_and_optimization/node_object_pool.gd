## Generic Node Object Pool eliminating instantiation/queue_free frame spikes.
## Enforces deterministic reset, physics interpolation reset, and zero orphan leaks on exit.
class_name NodeObjectPool
extends Node

signal pool_expanded(new_total_size: int)

@export var pooled_scene: PackedScene
@export_range(0, 2000, 1) var initial_size: int = 32
@export_range(1, 5000, 1) var max_size: int = 256
@export var allow_growth: bool = true

var _available: Array[Node] = []
var _active: Dictionary[int, Node] = {}


func _ready() -> void:
	if pooled_scene != null and initial_size > 0:
		prewarm(initial_size)


func _exit_tree() -> void:
	# Prevent orphan leaks if pool is removed while instances exist outside its child hierarchy.
	for node in _available:
		if is_instance_valid(node) and not node.is_inside_tree():
			node.queue_free()
	_available.clear()
	_active.clear()


func prewarm(count: int) -> void:
	if pooled_scene == null:
		push_error("NodeObjectPool: Cannot prewarm without a pooled_scene.")
		return
	var target := mini(max_size, get_total_size() + count)
	while get_total_size() < target:
		var instance := _create_instance()
		_deactivate_node(instance)
		_available.append(instance)


func acquire(spawn_parent: Node = null) -> Node:
	var instance: Node = null
	while not _available.is_empty():
		var candidate: Node = _available.pop_back()
		if is_instance_valid(candidate):
			instance = candidate
			break

	if instance == null:
		if not allow_growth or get_total_size() >= max_size or pooled_scene == null:
			return null
		instance = _create_instance()
		pool_expanded.emit(get_total_size() + 1)

	var target_parent := spawn_parent if spawn_parent != null else self
	if instance.get_parent() != target_parent:
		if instance.get_parent() != null:
			instance.reparent(target_parent, false)
		else:
			target_parent.add_child(instance)

	_activate_node(instance)
	_active[instance.get_instance_id()] = instance
	return instance


func release(instance: Node) -> bool:
	if instance == null or not is_instance_valid(instance):
		return false
	var id := instance.get_instance_id()
	if not _active.has(id):
		return false

	_active.erase(id)
	_deactivate_node(instance)
	_available.append(instance)
	return true


func get_active_count() -> int:
	return _active.size()


func get_available_count() -> int:
	return _available.size()


func get_total_size() -> int:
	return _active.size() + _available.size()


func _create_instance() -> Node:
	var node := pooled_scene.instantiate()
	add_child(node)
	return node


func _activate_node(node: Node) -> void:
	node.process_mode = Node.PROCESS_MODE_INHERIT
	if node is CanvasItem:
		(node as CanvasItem).visible = true
	elif node is Node3D:
		(node as Node3D).visible = true
	node.reset_physics_interpolation()
	if node.has_method(&"on_pool_acquire"):
		node.call(&"on_pool_acquire")


func _deactivate_node(node: Node) -> void:
	if node.has_method(&"on_pool_release"):
		node.call(&"on_pool_release")
	if node is CanvasItem:
		(node as CanvasItem).visible = false
	elif node is Node3D:
		(node as Node3D).visible = false
	node.process_mode = Node.PROCESS_MODE_DISABLED
