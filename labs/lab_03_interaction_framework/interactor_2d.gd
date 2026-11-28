## Reusable active interactor scanner (Area2D: monitoring = true, monitorable = false).
## Scores nearby Interactable2D candidates by priority, facing, distance, and optional LOS.
class_name Interactor2D
extends Area2D

signal active_target_changed(previous_target: Interactable2D, new_target: Interactable2D)
signal interaction_executed(target: Interactable2D)

@export var owner_actor: Node2D
@export_flags_2d_physics var los_occlusion_mask: int = 1
@export_range(0.0, 5.0, 0.1) var facing_weight: float = 1.5

var _candidates: Array[Interactable2D] = []
var _active_target: Interactable2D = null
var _facing_direction: Vector2 = Vector2.RIGHT


func _ready() -> void:
	monitoring = true
	monitorable = false
	area_entered.connect(_on_area_entered)
	area_exited.connect(_on_area_exited)


func _physics_process(_delta: float) -> void:
	_prune_invalid_candidates()
	_refresh_active_target()


func set_facing_direction(direction: Vector2) -> void:
	if direction.length_squared() > 0.0001:
		_facing_direction = direction.normalized()


func get_active_target() -> Interactable2D:
	if _active_target != null and not is_instance_valid(_active_target):
		_active_target = null
	return _active_target


func try_interact() -> bool:
	var target := get_active_target()
	if target == null:
		return false
	var actor: Node = owner_actor if owner_actor != null else self
	if target.trigger_interaction(actor):
		interaction_executed.emit(target)
		return true
	return false


func _on_area_entered(area: Area2D) -> void:
	if area is Interactable2D:
		var interactable := area as Interactable2D
		if not _candidates.has(interactable):
			_candidates.append(interactable)


func _on_area_exited(area: Area2D) -> void:
	if area is Interactable2D:
		var interactable := area as Interactable2D
		_candidates.erase(interactable)
		if _active_target == interactable:
			_set_active_target(null)


func _prune_invalid_candidates() -> void:
	for i in range(_candidates.size() - 1, -1, -1):
		if not is_instance_valid(_candidates[i]):
			_candidates.remove_at(i)


func _refresh_active_target() -> void:
	var best_target: Interactable2D = null
	var best_score: float = -INF
	var actor: Node = owner_actor if owner_actor != null else self

	for candidate in _candidates:
		if not candidate.can_interact(actor):
			continue
		var dist := global_position.distance_to(candidate.global_position)
		if dist > candidate.max_distance:
			continue
		if candidate.requires_line_of_sight and not _has_line_of_sight(candidate):
			continue

		var score := _score_candidate(candidate, dist)
		if score > best_score:
			best_score = score
			best_target = candidate

	if best_target != _active_target:
		_set_active_target(best_target)


func _score_candidate(candidate: Interactable2D, dist: float) -> float:
	var normalized_closeness := 1.0 - clampf(dist / maxf(1.0, candidate.max_distance), 0.0, 1.0)
	var to_candidate := (candidate.global_position - global_position).normalized()
	var facing_alignment := maxf(0.0, _facing_direction.dot(to_candidate))
	var priority_score := float(candidate.priority) * 10.0
	return priority_score + normalized_closeness * 2.0 + facing_alignment * facing_weight


func _has_line_of_sight(candidate: Interactable2D) -> bool:
	var space_state := get_world_2d().direct_space_state
	var query := PhysicsRayQueryParameters2D.create(
		global_position,
		candidate.global_position,
		los_occlusion_mask
	)
	query.collide_with_areas = false
	query.collide_with_bodies = true
	var hit := space_state.intersect_ray(query)
	return hit.is_empty()


func _set_active_target(next_target: Interactable2D) -> void:
	var previous := _active_target
	var actor: Node = owner_actor if owner_actor != null else self
	if previous != null and is_instance_valid(previous):
		previous.notify_focus_lost(actor)
	_active_target = next_target
	if _active_target != null and is_instance_valid(_active_target):
		_active_target.notify_focus_gained(actor)
	active_target_changed.emit(previous, _active_target)
