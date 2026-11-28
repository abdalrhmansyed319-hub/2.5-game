## Patrol state: navigates cyclically across waypoints with throttled NavigationAgent2D queries.
class_name AIPatrolState2D
extends AIState

@export var agent_body: CharacterBody2D
@export var nav_agent: NavigationAgent2D
@export var perception: AIPerceptionSensor2D
@export var patrol_points: Array[Vector2] = []
@export_range(20.0, 600.0, 5.0) var patrol_speed: float = 110.0
@export_range(0.0, 10.0, 0.1) var wait_at_point: float = 0.8

var _waypoint_index: int = 0
var _wait_timer: float = 0.0
var _nav_ready_frames: int = 0


func enter(_payload: Dictionary = {}) -> void:
	_wait_timer = 0.0
	_nav_ready_frames = 0
	if not patrol_points.is_empty() and nav_agent != null:
		nav_agent.target_position = patrol_points[_waypoint_index]


func physics_update(delta: float) -> void:
	if agent_body == null or nav_agent == null:
		return

	if perception != null and perception.has_visual:
		request_transition(&"Chase")
		return

	# Wait one physics frame after enter so NavigationServer synchronizes map changes.
	if _nav_ready_frames < 1:
		_nav_ready_frames += 1
		return

	if patrol_points.is_empty():
		agent_body.velocity = Vector2.ZERO
		return

	if _wait_timer > 0.0:
		_wait_timer = maxf(0.0, _wait_timer - delta)
		agent_body.velocity = Vector2.ZERO
		if is_zero_approx(_wait_timer):
			_waypoint_index = (_waypoint_index + 1) % patrol_points.size()
			nav_agent.target_position = patrol_points[_waypoint_index]
		return

	if nav_agent.is_navigation_finished():
		_wait_timer = wait_at_point
		agent_body.velocity = Vector2.ZERO
		return

	var next_pos := nav_agent.get_next_path_position()
	var dir := (next_pos - agent_body.global_position).normalized()
	if perception != null and dir.length_squared() > 0.01:
		perception.facing_direction = dir
	agent_body.velocity = dir * patrol_speed
	agent_body.move_and_slide()
