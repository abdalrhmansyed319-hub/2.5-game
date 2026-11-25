## Repeatable GPU/CPU batching harness comparing N individual Sprite2D nodes vs.
## one MultiMeshInstance2D draw call with seeded layout and custom Performance monitors.
class_name PerformanceBenchmarkHarness2D
extends Node2D

enum RenderMode {
	INDIVIDUAL_SPRITES,
	MULTIMESH_BATCHED,
}

const MONITOR_ACTIVE_INSTANCES: StringName = &"labs/benchmark_instance_count"
const MONITOR_FRAME_P99_MS: StringName = &"labs/frame_time_p99_ms"

@export var render_mode: RenderMode = RenderMode.MULTIMESH_BATCHED
@export_range(100, 10000, 100) var instance_count: int = 2000
@export var rng_seed: int = 424242
@export var bounds_size: Vector2 = Vector2(1280.0, 720.0)
@export var sprite_texture: Texture2D
@export_range(30, 600, 10) var sample_window_frames: int = 180

var _rng := RandomNumberGenerator.new()
var _frame_times_ms: PackedFloat64Array = PackedFloat64Array()
var _sample_cursor: int = 0
var _sample_filled: int = 0
var _positions: PackedVector2Array = PackedVector2Array()
var _velocities: PackedVector2Array = PackedVector2Array()
var _sprites: Array[Sprite2D] = []
var _multimesh_node: MultiMeshInstance2D = null
var _multimesh: MultiMesh = null


func _ready() -> void:
	_frame_times_ms.resize(sample_window_frames)
	_register_custom_monitors()
	rebuild_benchmark()


func _exit_tree() -> void:
	_unregister_custom_monitors()


func _process(delta: float) -> void:
	var frame_ms := delta * 1000.0
	_frame_times_ms[_sample_cursor] = frame_ms
	_sample_cursor = (_sample_cursor + 1) % sample_window_frames
	_sample_filled = mini(_sample_filled + 1, sample_window_frames)

	_step_simulation(delta)
	_sync_renderables()


func rebuild_benchmark() -> void:
	_clear_renderables()
	_rng.seed = rng_seed
	_positions.resize(instance_count)
	_velocities.resize(instance_count)

	for i in range(instance_count):
		_positions[i] = Vector2(
			_rng.randf_range(0.0, bounds_size.x),
			_rng.randf_range(0.0, bounds_size.y)
		)
		var angle := _rng.randf_range(0.0, TAU)
		var speed := _rng.randf_range(30.0, 140.0)
		_velocities[i] = Vector2(cos(angle), sin(angle)) * speed

	if render_mode == RenderMode.INDIVIDUAL_SPRITES:
		_build_individual_sprites()
	else:
		_build_multimesh()


func capture_telemetry_snapshot() -> Dictionary:
	return {
		"render_mode": RenderMode.keys()[render_mode],
		"instance_count": instance_count,
		"fps": Performance.get_monitor(Performance.TIME_FPS),
		"process_ms": Performance.get_monitor(Performance.TIME_PROCESS) * 1000.0,
		"physics_ms": Performance.get_monitor(Performance.TIME_PHYSICS_PROCESS) * 1000.0,
		"frame_p99_ms": get_frame_time_p99_ms(),
		"draw_calls": Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME),
		"primitives": Performance.get_monitor(Performance.RENDER_TOTAL_PRIMITIVES_IN_FRAME),
		"node_count": Performance.get_monitor(Performance.OBJECT_NODE_COUNT),
		"orphan_nodes": Performance.get_monitor(Performance.OBJECT_ORPHAN_NODE_COUNT),
	}


func get_frame_time_p99_ms() -> float:
	if _sample_filled <= 0:
		return 0.0
	var sorted: Array[float] = []
	sorted.resize(_sample_filled)
	for i in range(_sample_filled):
		sorted[i] = _frame_times_ms[i]
	sorted.sort()
	var idx := clampi(int(ceil(float(_sample_filled) * 0.99)) - 1, 0, _sample_filled - 1)
	return sorted[idx]


func _step_simulation(delta: float) -> void:
	for i in range(instance_count):
		var pos := _positions[i] + _velocities[i] * delta
		var vel := _velocities[i]
		if pos.x < 0.0 or pos.x > bounds_size.x:
			vel.x = -vel.x
			pos.x = clampf(pos.x, 0.0, bounds_size.x)
		if pos.y < 0.0 or pos.y > bounds_size.y:
			vel.y = -vel.y
			pos.y = clampf(pos.y, 0.0, bounds_size.y)
		_positions[i] = pos
		_velocities[i] = vel


func _sync_renderables() -> void:
	if render_mode == RenderMode.INDIVIDUAL_SPRITES:
		for i in range(_sprites.size()):
			_sprites[i].position = _positions[i]
	elif _multimesh != null:
		for i in range(instance_count):
			_multimesh.set_instance_transform_2d(i, Transform2D(0.0, _positions[i]))


func _build_individual_sprites() -> void:
	_sprites.resize(instance_count)
	for i in range(instance_count):
		var sprite := Sprite2D.new()
		sprite.texture = sprite_texture
		sprite.position = _positions[i]
		add_child(sprite)
		_sprites[i] = sprite


func _build_multimesh() -> void:
	_multimesh = MultiMesh.new()
	_multimesh.transform_format = MultiMesh.TRANSFORM_2D
	_multimesh.instance_count = instance_count
	var quad := QuadMesh.new()
	quad.size = Vector2(16.0, 16.0)
	_multimesh.mesh = quad

	_multimesh_node = MultiMeshInstance2D.new()
	_multimesh_node.multimesh = _multimesh
	_multimesh_node.texture = sprite_texture
	add_child(_multimesh_node)
	_sync_renderables()


func _clear_renderables() -> void:
	for sprite in _sprites:
		if is_instance_valid(sprite):
			sprite.queue_free()
	_sprites.clear()
	if _multimesh_node != null and is_instance_valid(_multimesh_node):
		_multimesh_node.queue_free()
	_multimesh_node = null
	_multimesh = null


func _register_custom_monitors() -> void:
	if not Performance.has_custom_monitor(MONITOR_ACTIVE_INSTANCES):
		Performance.add_custom_monitor(MONITOR_ACTIVE_INSTANCES, func() -> int: return instance_count)
	if not Performance.has_custom_monitor(MONITOR_FRAME_P99_MS):
		Performance.add_custom_monitor(MONITOR_FRAME_P99_MS, get_frame_time_p99_ms)


func _unregister_custom_monitors() -> void:
	if Performance.has_custom_monitor(MONITOR_ACTIVE_INSTANCES):
		Performance.remove_custom_monitor(MONITOR_ACTIVE_INSTANCES)
	if Performance.has_custom_monitor(MONITOR_FRAME_P99_MS):
		Performance.remove_custom_monitor(MONITOR_FRAME_P99_MS)
