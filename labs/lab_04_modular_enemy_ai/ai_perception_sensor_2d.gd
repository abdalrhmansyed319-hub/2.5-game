## Perception sensor combining vision cone (FOV + distance), LOS raycast occlusion,
## and memory decay of the last known target position.
class_name AIPerceptionSensor2D
extends Node2D

signal target_spotted(target: Node2D, position: Vector2)
signal target_lost(last_known_position: Vector2)

@export_range(32.0, 2000.0, 4.0) var vision_range: float = 320.0
@export_range(10.0, 360.0, 1.0) var field_of_view_degrees: float = 110.0
@export_range(0.5, 30.0, 0.25) var memory_duration: float = 4.0
@export_range(0.05, 1.0, 0.05) var scan_interval: float = 0.15
@export_flags_2d_physics var occlusion_mask: int = 1
@export var target_group: StringName = &"perception_target"

var facing_direction: Vector2 = Vector2.RIGHT
var current_target: Node2D = null
var last_known_position: Vector2 = Vector2.ZERO
var has_visual: bool = false

var _scan_timer: float = 0.0
var _memory_timer: float = 0.0


func _physics_process(delta: float) -> void:
	if _memory_timer > 0.0:
		_memory_timer = maxf(0.0, _memory_timer - delta)
		if is_zero_approx(_memory_timer) and not has_visual:
			current_target = null

	_scan_timer -= delta
	if _scan_timer > 0.0:
		return
	_scan_timer = scan_interval
	_evaluate_vision()


func has_recent_memory() -> bool:
	return _memory_timer > 0.0


func _evaluate_vision() -> void:
	var best_visible: Node2D = null
	var best_dist_sq: float = vision_range * vision_range
	var cos_half_fov := cos(deg_to_rad(field_of_view_degrees * 0.5))

	for node in get_tree().get_nodes_in_group(target_group):
		if not (node is Node2D) or not is_instance_valid(node):
			continue
		var candidate := node as Node2D
		var offset := candidate.global_position - global_position
		var dist_sq := offset.length_squared()
		if dist_sq > best_dist_sq or dist_sq < 0.001:
			continue
		var dir := offset / sqrt(dist_sq)
		if facing_direction.dot(dir) < cos_half_fov:
			continue
		if _is_occluded(candidate.global_position):
			continue
		best_dist_sq = dist_sq
		best_visible = candidate

	if best_visible != null:
		current_target = best_visible
		last_known_position = best_visible.global_position
		_memory_timer = memory_duration
		if not has_visual:
			has_visual = true
			target_spotted.emit(best_visible, last_known_position)
	elif has_visual:
		has_visual = false
		target_lost.emit(last_known_position)


func _is_occluded(world_target: Vector2) -> bool:
	var space_state := get_world_2d().direct_space_state
	var query := PhysicsRayQueryParameters2D.create(global_position, world_target, occlusion_mask)
	query.collide_with_areas = false
	query.collide_with_bodies = true
	return not space_state.intersect_ray(query).is_empty()
