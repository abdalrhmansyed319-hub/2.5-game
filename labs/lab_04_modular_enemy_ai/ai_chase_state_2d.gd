## Chase state: pursues visible or recently remembered target with throttled repathing.
class_name AIChaseState2D
extends AIState

@export var agent_body: CharacterBody2D
@export var nav_agent: NavigationAgent2D
@export var perception: AIPerceptionSensor2D
@export_range(40.0, 900.0, 5.0) var chase_speed: float = 195.0
@export_range(0.05, 1.0, 0.05) var repath_interval: float = 0.2

var _repath_timer: float = 0.0


func enter(_payload: Dictionary = {}) -> void:
	_repath_timer = 0.0


func physics_update(delta: float) -> void:
	if agent_body == null or nav_agent == null or perception == null:
		return

	if not perception.has_visual and not perception.has_recent_memory():
		request_transition(&"Patrol")
		return

	_repath_timer -= delta
	if _repath_timer <= 0.0:
		_repath_timer = repath_interval
		nav_agent.target_position = perception.last_known_position

	if nav_agent.is_navigation_finished():
		agent_body.velocity = Vector2.ZERO
		return

	var next_pos := nav_agent.get_next_path_position()
	var dir := (next_pos - agent_body.global_position).normalized()
	if dir.length_squared() > 0.01:
		perception.facing_direction = dir
	agent_body.velocity = dir * chase_speed
	agent_body.move_and_slide()
