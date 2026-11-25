class_name RimlandsPrototype
extends Node2D
## Milestone 01 runnable prototype scene (Amber Kelp Littoral + Singing Reedwood Canopy).
##
## Tests independent systems on GL Compatibility / Intel HD Graphics 3000:
##   - 3x3 deterministic TileMapLayer chunk streaming (32x32 tiles/chunk)
##   - Dr. Mara Lin 4-direction non-mirrored movement, crouch, & wade speed
##   - Split-layer Singing Reedwood walk-behind cutaway canopy fade
##   - Acoustic Field Lens ground pulse & flora resonance feedback
##   - Lightweight CanvasModulate 4-phase Time-of-Day preview (zero heavy lights)

const BOOT_SCENE_PATH: String = "res://scenes/boot/main.tscn"
const HUD_REFRESH_INTERVAL: float = 0.15

const TIME_PHASE_NAMES: PackedStringArray = [
	"Golden Day",
	"Amber Dusk",
	"Twilight Night",
	"Cool Dawn",
]

const TIME_PHASE_TINTS: Array[Color] = [
	Color(1.0, 0.99, 0.95, 1.0),
	Color(0.95, 0.78, 0.64, 1.0),
	Color(0.56, 0.66, 0.82, 1.0),
	Color(0.84, 0.91, 0.96, 1.0),
]

var _time_phase_index: int = 0
var _hud_timer: float = 0.0
var _adapter_short: String = "unknown"
var _last_scan_text: String = "hold Q or RMB near flora"

@onready var _world_streamer: WorldChunkStreamer = $WorldChunkStreamer
@onready var _player: PlayerController = $WorldChunkStreamer/YSortWorldLayer/Player
@onready var _vfx_layer: Node2D = $VfxLayer
@onready var _time_modulate: CanvasModulate = $TimeModulate
@onready var _hud: PrototypeHud = $PrototypeHud


func _ready() -> void:
	_adapter_short = _build_adapter_label()
	_player.position = Vector2(22.0, 26.0)
	_player.acoustic_pulse_emitted.connect(_on_player_acoustic_pulse)
	_player.water_ripple_requested.connect(_on_player_water_ripple)
	_world_streamer.update_around_world_pos(_player.global_position)
	_apply_time_phase()


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey:
		var key_ev: InputEventKey = event as InputEventKey
		if not key_ev.pressed or key_ev.echo:
			return
		if key_ev.keycode == KEY_T:
			_time_phase_index = (_time_phase_index + 1) % TIME_PHASE_NAMES.size()
			_apply_time_phase()
		elif key_ev.keycode == KEY_F3:
			_hud.toggle_telemetry()
		elif key_ev.keycode == KEY_ESCAPE:
			var err: Error = get_tree().change_scene_to_file(BOOT_SCENE_PATH)
			if err != OK:
				push_warning("Could not return to boot scene: %d" % err)


func _process(delta: float) -> void:
	_world_streamer.update_around_world_pos(_player.global_position)
	var surf: String = _world_streamer.get_surface_type_at(_player.global_position)
	_player.set_surface_type(surf)

	_hud_timer += delta
	if _hud_timer >= HUD_REFRESH_INTERVAL:
		_hud_timer = 0.0
		var fps: float = Engine.get_frames_per_second()
		var frame_ms: float = delta * 1000.0
		var chunk_c: Vector2i = _world_streamer.get_center_chunk()
		var world_line: String = "CHUNK: (%d, %d) [%d/9 active] | SURF: %s" % [
			chunk_c.x,
			chunk_c.y,
			_world_streamer.get_active_chunk_count(),
			surf,
		]
		var cut_flag: String = "YES (fade)" if _player.canopy_overlap_count > 0 else "no"
		var actor_line: String = "MARA: %s (%s) | CANOPY: %s | TIME: %s" % [
			_player.get_state_label(),
			_player.get_facing_label(),
			cut_flag,
			TIME_PHASE_NAMES[_time_phase_index],
		]
		_hud.update_telemetry(
			fps,
			frame_ms,
			_adapter_short,
			world_line,
			actor_line,
			_last_scan_text
		)


func _apply_time_phase() -> void:
	_time_modulate.color = TIME_PHASE_TINTS[_time_phase_index]
	var is_night: bool = (_time_phase_index == 2)
	_world_streamer.set_night_mode(is_night)


func _on_player_acoustic_pulse(world_pos: Vector2, scan_radius: float) -> void:
	var ring := GroundRingVfx.new()
	_vfx_layer.add_child(ring)
	ring.configure(2, world_pos, 8.0)

	var hits: PackedStringArray = []
	var radius_sq: float = scan_radius * scan_radius
	for node: Node in get_tree().get_nodes_in_group("scannable_flora"):
		if node is FloraProp:
			var flora: FloraProp = node as FloraProp
			if flora.global_position.distance_squared_to(world_pos) <= radius_sq:
				var species_name: String = flora.trigger_acoustic_scan_response()
				if not hits.has(species_name):
					hits.append(species_name)
	if hits.is_empty():
		_last_scan_text = "no flora within %d px" % int(scan_radius)
		return
	_last_scan_text = ", ".join(hits)


func _on_player_water_ripple(world_pos: Vector2) -> void:
	var ring := GroundRingVfx.new()
	_vfx_layer.add_child(ring)
	ring.configure(1, world_pos, 8.0)


func _build_adapter_label() -> String:
	var adapter: String = RenderingServer.get_video_adapter_name()
	if adapter.is_empty():
		adapter = "GL Compatibility"
	if adapter.length() > 28:
		return adapter.substr(0, 28)
	return adapter
