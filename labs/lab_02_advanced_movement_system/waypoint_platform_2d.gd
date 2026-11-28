## Physics-synchronized moving platform using AnimatableBody2D (sync_to_physics = true).
## Moves strictly inside _physics_process so riders inherit exact platform velocity cleanly.
class_name WaypointPlatform2D
extends AnimatableBody2D

@export var waypoints: Array[Vector2] = [Vector2.ZERO, Vector2(160.0, 0.0)]
@export_range(10.0, 1000.0, 1.0) var speed: float = 90.0
@export_range(0.0, 5.0, 0.05) var pause_at_waypoint: float = 0.4

var _origin: Vector2 = Vector2.ZERO
var _current_index: int = 0
var _pause_timer: float = 0.0


func _ready() -> void:
	sync_to_physics = true
	_origin = global_position


func _physics_process(delta: float) -> void:
	if waypoints.size() < 2:
		return
	if _pause_timer > 0.0:
		_pause_timer = maxf(0.0, _pause_timer - delta)
		return

	var target_pos := _origin + waypoints[_current_index]
	var step := speed * delta
	global_position = global_position.move_toward(target_pos, step)

	if global_position.distance_squared_to(target_pos) <= 0.25:
		global_position = target_pos
		_current_index = (_current_index + 1) % waypoints.size()
		_pause_timer = pause_at_waypoint
