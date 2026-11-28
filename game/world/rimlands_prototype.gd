class_name RimlandsPrototype
extends Node2D
## VERDANT SIGNAL — Production Playable World (V8.0 Living World Integrated).
##
## Integrates the approved V8.0 Living Forest Sanctuary directly into the main
## Milestone 01 production architecture (GL Compatibility / Intel HD Graphics 3000):
##   - Preserves deterministic 3x3 WorldChunkStreamer (9/9 active chunks)
##   - Hosts unified Y-sorted PlayerController (unmodified 88x88 character strips)
##   - Runs all 718 pooled animated living grass tufts, wind waves, gusts & footstep bending
##   - Synchronizes all 3 V8.0 cinematic lighting moods (T / F5) with TimeModulate & night flora
##   - Preserves Acoustic Field Lens scanning (Q/RMB), Field Sampling (E), crouch-stealth (C/Ctrl),
##     sprint/run (Shift/Space), Telemetry HUD (F3), Collision Debug (F4), Wind Gust (F6/G),
##     and automated Windows Godot 4.7.2 proof capture (--capture-production-proofs).

const BOOT_SCENE_PATH: String = "res://scenes/boot/main.tscn"
const HUD_REFRESH_INTERVAL: float = 0.15

var _mood_index: int = 0
var _hud_timer: float = 0.0
var _adapter_short: String = "unknown"
var _last_scan_text: String = "hold Q/RMB to scan | press E to sample"

@onready var _world_streamer: WorldChunkStreamer = $WorldChunkStreamer
@onready var _living_forest: VerdantLivingForest = $VerdantLivingForest
@onready var _player: PlayerController = $WorldChunkStreamer/YSortWorldLayer/Player
@onready var _vfx_layer: Node2D = $VfxLayer
@onready var _time_modulate: CanvasModulate = $TimeModulate
@onready var _hud: PrototypeHud = $PrototypeHud


func _ready() -> void:
	GameState.set_phase(&"verdant_living_world")
	_adapter_short = _build_adapter_label()

	# Mount production Player inside VerdantLivingForest/YSortWorld so Mara,
	# all 115 embedded forest structures, 144 pooled animated grass tufts,
	# and scannable FloraProps share a single unified Y-sorted space.
	var ysort_target: Node2D = _living_forest.get_ysort_world()
	if _player.get_parent() != ysort_target:
		_player.reparent(ysort_target, false)

	_player.position = VerdantLivingForest.DEFAULT_SPAWN_POS
	_living_forest.bind_player(_player)

	_player.acoustic_pulse_emitted.connect(_on_player_acoustic_pulse)
	_player.water_ripple_requested.connect(_on_player_water_ripple)
	_player.field_sample_requested.connect(_on_player_field_sample)

	_world_streamer.update_around_world_pos(_player.global_position)
	_apply_lighting_mood()
	_living_forest.step_living_ecosystem(0.016, _player)

	if "--capture-production-proofs" in OS.get_cmdline_user_args():
		call_deferred("_run_automated_production_capture")


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey:
		var key_ev: InputEventKey = event as InputEventKey
		if not key_ev.pressed or key_ev.echo:
			return
		match key_ev.keycode:
			KEY_T, KEY_F5:
				_mood_index = (_mood_index + 1) % VerdantLivingForest.MOOD_NAMES.size()
				_apply_lighting_mood()
			KEY_F3:
				_hud.toggle_telemetry()
			KEY_F4:
				_living_forest.toggle_collision_debug()
			KEY_F6, KEY_G:
				_living_forest.trigger_wind_gust(3.0)
			KEY_1:
				_warp_to_zone(0)
			KEY_2:
				_warp_to_zone(1)
			KEY_3:
				_warp_to_zone(2)
			KEY_4:
				_warp_to_zone(3)
			KEY_5:
				_warp_to_zone(4)
			KEY_6:
				_warp_to_zone(5)
			KEY_7:
				_warp_to_zone(6)
			KEY_8:
				_warp_to_zone(7)
			KEY_F9:
				_save_production_capture("prod_v80_manual_640x360.png")
			KEY_ESCAPE:
				var err: Error = get_tree().change_scene_to_file(BOOT_SCENE_PATH)
				if err != OK:
					push_warning("Could not return to boot scene: %d" % err)


func _physics_process(delta: float) -> void:
	_player.position = _living_forest.clamp_player_to_world(_player.position)
	_world_streamer.update_around_world_pos(_player.global_position)

	var surf: String = _living_forest.get_surface_type_at(_player.global_position)
	_player.set_surface_type(surf)
	_living_forest.step_living_ecosystem(delta, _player)

	_hud_timer += delta
	if _hud_timer >= HUD_REFRESH_INTERVAL:
		_hud_timer = 0.0
		_refresh_hud(delta, surf)


func _refresh_hud(delta: float, surf: String) -> void:
	var fps: float = Engine.get_frames_per_second()
	var frame_ms: float = delta * 1000.0
	var chunk_c: Vector2i = _world_streamer.get_center_chunk()
	var world_line: String = "CHUNK:(%d,%d)[%d/9] | TUFTS:%d/%d (bent:%d) | ZONE:%s" % [
		chunk_c.x,
		chunk_c.y,
		_world_streamer.get_active_chunk_count(),
		_living_forest.get_visible_tuft_count(),
		_living_forest.get_total_tuft_count(),
		_living_forest.get_active_bent_tuft_count(),
		_living_forest.get_zone_status_label(_player.global_position),
	]
	var gust_tag: String = "GUST" if _living_forest.get_current_gust_strength() > 0.35 else "calm"
	var actor_line: String = "MARA:%s(%s) | SURF:%s | MOOD:%s | WIND:%s | SAMPLES:%d" % [
		_player.get_state_label(),
		_player.get_facing_label(),
		surf,
		_living_forest.get_mood_name(),
		gust_tag,
		GameState.get_sample_count(),
	]
	_hud.update_telemetry(
		fps,
		frame_ms,
		_adapter_short,
		world_line,
		actor_line,
		_last_scan_text
	)


func _apply_lighting_mood() -> void:
	var modulate_tint: Color = _living_forest.apply_lighting_mood(_mood_index)
	_time_modulate.color = modulate_tint
	var is_twilight: bool = _living_forest.is_twilight_biolum_mood()
	_world_streamer.set_night_mode(is_twilight)


func _warp_to_zone(zone_idx: int) -> void:
	var warp: Dictionary = _living_forest.get_warp_point(zone_idx)
	if warp.is_empty():
		return
	var pos_v: Variant = warp.get("pos", VerdantLivingForest.DEFAULT_SPAWN_POS)
	var dir_v: Variant = warp.get("dir", 2)
	if pos_v is Vector2:
		_player.position = pos_v as Vector2
	if dir_v is int:
		_player.set_facing_row(dir_v as int)
	var cam: Camera2D = _player.get_camera()
	if cam != null:
		cam.reset_smoothing()
	_living_forest.step_living_ecosystem(0.016, _player)


func _on_player_acoustic_pulse(world_pos: Vector2, scan_radius: float) -> void:
	var ring := GroundRingVfx.new()
	_vfx_layer.add_child(ring)
	ring.configure(2, world_pos, 8.0)

	var hits: PackedStringArray = _living_forest.scan_ecological_sites(world_pos, scan_radius)
	var radius_sq: float = scan_radius * scan_radius
	for node: Node in get_tree().get_nodes_in_group("scannable_flora"):
		if node is FloraProp:
			var flora: FloraProp = node as FloraProp
			if flora.global_position.distance_squared_to(world_pos) <= radius_sq:
				var species_name: String = flora.trigger_acoustic_scan_response()
				if not hits.has(species_name):
					hits.append(species_name)
	if hits.is_empty():
		_last_scan_text = "no resonant flora within %d px" % int(scan_radius)
		return
	_last_scan_text = ", ".join(hits)


func _on_player_field_sample(world_pos: Vector2) -> void:
	var feature_name: String = _living_forest.sample_nearest_feature(world_pos)
	if feature_name.is_empty():
		_last_scan_text = "move closer to flora or landmarks to sample [E]"
		return
	var newly_logged: bool = GameState.record_field_sample(feature_name)
	if newly_logged:
		_last_scan_text = "LOGGED SAMPLE: %s (%d total)" % [feature_name, GameState.get_sample_count()]
	else:
		_last_scan_text = "ALREADY LOGGED: %s (%d total)" % [feature_name, GameState.get_sample_count()]


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


func _save_production_capture(filename: String) -> void:
	var out_dir: String = ProjectSettings.globalize_path("res://godot_runtime_captures")
	DirAccess.make_dir_recursive_absolute(out_dir)
	var img: Image = get_viewport().get_texture().get_image()
	var full_path: String = out_dir.path_join(filename)
	img.save_png(full_path)
	print("[PROD-V80] Captured runtime screenshot: " + full_path)


func _run_automated_production_capture() -> void:
	_hud.set_telemetry_visible(false)
	var shots: Array[Dictionary] = [
		{"name": "prod_v80_01_hub_afternoon.png", "zone": 0, "mood": 0, "dbg": false, "hud": true},
		{"name": "prod_v80_02_root_arch_afternoon.png", "zone": 2, "mood": 0, "dbg": false, "hud": false},
		{"name": "prod_v80_03_clearing_afternoon.png", "zone": 4, "mood": 0, "dbg": false, "hud": false},
		{"name": "prod_v80_04_clearing_dawn.png", "zone": 4, "mood": 1, "dbg": false, "hud": false},
		{"name": "prod_v80_05_waystone_twilight.png", "zone": 3, "mood": 2, "dbg": false, "hud": false},
		{"name": "prod_v80_06_fallen_log_dawn.png", "zone": 7, "mood": 1, "dbg": false, "hud": false},
		{"name": "prod_v80_07_collision_debug_hub.png", "zone": 0, "mood": 0, "dbg": true, "hud": true},
	]
	for shot: Dictionary in shots:
		var mood_v: Variant = shot.get("mood", 0)
		var dbg_v: Variant = shot.get("dbg", false)
		var hud_v: Variant = shot.get("hud", false)
		var zone_v: Variant = shot.get("zone", 0)
		var name_v: Variant = shot.get("name", "prod_v80_shot.png")
		_mood_index = mood_v as int if mood_v is int else 0
		_apply_lighting_mood()
		_living_forest.set_collision_debug(dbg_v as bool if dbg_v is bool else false)
		_hud.set_telemetry_visible(hud_v as bool if hud_v is bool else false)
		_warp_to_zone(zone_v as int if zone_v is int else 0)
		await get_tree().process_frame
		await get_tree().process_frame
		await RenderingServer.frame_post_draw
		var fname: String = name_v as String if name_v is String else "prod_v80_shot.png"
		_save_production_capture(fname)
	var fps_sample: float = Engine.get_frames_per_second()
	var draws_sample: int = int(Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME))
	print(
		"[PROD-V80] RUNTIME TELEMETRY | Adapter=%s | FPS=%.1f | Draws=%d | Tufts=%d/%d"
		% [
			_adapter_short,
			fps_sample,
			draws_sample,
			_living_forest.get_visible_tuft_count(),
			_living_forest.get_total_tuft_count(),
		]
	)
	get_tree().quit(0)
