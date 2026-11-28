class_name RimlandsPrototype
extends Node2D
## VERDANT SIGNAL — Unified Production Playable World (V11.0 The Art of Immersion).
##
## Directly connects the Broken Shore crash-site opening region (Zones A-F, y=1344..2880)
## continuously north into the approved V8.0 Living Forest Sanctuary (y=0..1536) in a single
## seamless 2304x2880 Y-sorted world with zero loading screens or teleport cuts:
##   - Preserves deterministic 3x3 WorldChunkStreamer (9/9 active chunks) & unmodified 88x88 Mara
##   - Runs all V8.0 Living Forest, V9.0 Broken Shore, and V10.0 Living World systems
##   - Adds V11.0 Immersion Layer: FieldCodex (27 discoveries + 4 Emergent Field Insights),
##     AcousticEchoVfx harmonic replies & cross-node relay echoes, contextual proximity prompts,
##     poetic region whispers, Field Journal ([Tab]/[J]), CaveReverb interior/arch routing,
##     spatial piezo-harmonic landmark drones, stealth-aware fauna & metallic-blight traces.

const BOOT_SCENE_PATH: String = "res://scenes/boot/main.tscn"
const HUD_REFRESH_INTERVAL: float = 0.14
const REGION_WHISPER_COOLDOWN: float = 2.4

var _mood_index: int = 0
var _hud_timer: float = 0.0
var _region_cooldown: float = 0.0
var _current_region_name: String = ""
var _adapter_short: String = "unknown"
var _last_scan_text: String = "hold Q/RMB to scan | press E to sample | Tab/J Journal"

@onready var _world_streamer: WorldChunkStreamer = $WorldChunkStreamer
@onready var _living_forest: VerdantLivingForest = $VerdantLivingForest
@onready var _broken_shore: VerdantBrokenShore = $VerdantBrokenShore
@onready var _player: PlayerController = $WorldChunkStreamer/YSortWorldLayer/Player
@onready var _vfx_layer: Node2D = $VfxLayer
@onready var _time_modulate: CanvasModulate = $TimeModulate
@onready var _hud: PrototypeHud = $PrototypeHud


func _ready() -> void:
	GameState.set_phase(&"verdant_broken_shore_world")
	_adapter_short = _build_adapter_label()

	var ysort_target: Node2D = _living_forest.get_ysort_world()
	_broken_shore.mount_into_unified_ysort(ysort_target)
	if _player.get_parent() != ysort_target:
		_player.reparent(ysort_target, false)

	_player.position = VerdantBrokenShore.DEFAULT_SPAWN_POS
	_player.set_facing_row(PlayerController.DIR_RIGHT)
	_living_forest.bind_player(_player)

	_player.acoustic_pulse_emitted.connect(_on_player_acoustic_pulse)
	_player.water_ripple_requested.connect(_on_player_water_ripple)
	_player.field_sample_requested.connect(_on_player_field_sample)
	_player.footstep_triggered.connect(_on_player_footstep)

	_world_streamer.update_around_world_pos(_player.global_position)
	_apply_lighting_mood()
	_broken_shore.step_broken_shore(0.016, _player)
	_living_forest.step_living_ecosystem(0.016, _player)
	_sync_unified_player_atmosphere(_player.global_position)

	_current_region_name = _broken_shore.get_region_display_name(_player.global_position)
	_hud.announce_region(_current_region_name)

	if "--capture-production-proofs" in OS.get_cmdline_user_args():
		call_deferred("_run_automated_production_capture")


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("open_field_codex"):
		_hud.toggle_field_journal()
		return

	if event is InputEventKey:
		var key_ev: InputEventKey = event as InputEventKey
		if not key_ev.pressed or key_ev.echo:
			return
		match key_ev.keycode:
			KEY_J:
				_hud.toggle_field_journal()
			KEY_T, KEY_F5:
				_mood_index = (_mood_index + 1) % VerdantLivingForest.MOOD_NAMES.size()
				_apply_lighting_mood()
			KEY_F3:
				_hud.toggle_telemetry()
			KEY_F4:
				var dbg_on: bool = _broken_shore.toggle_collision_debug()
				_living_forest.set_collision_debug(dbg_on)
			KEY_F6, KEY_G:
				_broken_shore.trigger_wind_gust(3.0)
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
			KEY_9:
				_warp_to_forest_zone(4)
			KEY_0:
				_warp_to_forest_zone(3)
			KEY_F9:
				_save_production_capture("prod_v110_manual_640x360.png")
			KEY_ESCAPE:
				if _hud.is_journal_open():
					_hud.set_journal_open(false)
					return
				var err: Error = get_tree().change_scene_to_file(BOOT_SCENE_PATH)
				if err != OK:
					push_warning("Could not return to boot scene: %d" % err)


func _physics_process(delta: float) -> void:
	_player.position = _living_forest.clamp_player_to_world(_player.position)
	_world_streamer.update_around_world_pos(_player.global_position)

	var ppos: Vector2 = _player.global_position
	var in_shore: bool = _broken_shore.is_position_in_broken_shore(ppos)
	var surf: String = (
		_broken_shore.get_surface_type_at(ppos)
		if in_shore
		else _living_forest.get_surface_type_at(ppos)
	)
	var speed_mul: float = (
		_broken_shore.compute_terrain_speed_multiplier(ppos)
		if in_shore
		else _living_forest.compute_terrain_speed_multiplier(ppos)
	)
	_player.set_surface_type(surf)
	_player.set_terrain_speed_multiplier(speed_mul)

	_broken_shore.step_broken_shore(delta, _player)
	_living_forest.step_living_ecosystem(delta, _player)
	_sync_unified_player_atmosphere(ppos)

	if _region_cooldown > 0.0:
		_region_cooldown = maxf(0.0, _region_cooldown - delta)

	_hud_timer += delta
	if _hud_timer >= HUD_REFRESH_INTERVAL:
		_hud_timer = 0.0
		_refresh_exploration_prompts(ppos, in_shore)
		_refresh_hud(delta, surf, in_shore)


func _sync_unified_player_atmosphere(ppos: Vector2) -> void:
	var ecotone_t: float = clampf((ppos.y - 1360.0) / 220.0, 0.0, 1.0)
	var forest_tint: Color = _living_forest.compute_forest_player_tint(ppos)
	var coastal_tint: Color = _broken_shore.compute_coastal_player_tint(ppos)
	_player.set_lighting_tint(forest_tint.lerp(coastal_tint, ecotone_t))

	var occluded: bool = (
		_living_forest.compute_forest_player_occlusion(ppos)
		or _broken_shore.compute_coastal_player_occlusion(ppos)
	)
	_player.set_occluded_peek(occluded)

	var in_interior: bool = _broken_shore.is_in_meridian_interior()
	var in_reverb_space: bool = in_interior or _living_forest.is_under_root_arch()
	AudioDirector.set_interior_reverb(in_reverb_space)

	var gust: float = maxf(
		_living_forest.get_current_gust_strength(),
		_broken_shore.get_current_gust_strength()
	)
	AudioDirector.update_biome_ambience(ppos.y, gust, in_interior)

	var landmark_prox: float = maxf(
		_broken_shore.get_harmonic_landmark_proximity(ppos),
		_living_forest.get_harmonic_landmark_proximity(ppos)
	)
	AudioDirector.update_landmark_resonance(landmark_prox, _living_forest.is_twilight_biolum_mood())


func _refresh_exploration_prompts(ppos: Vector2, in_shore: bool) -> void:
	# 1. Poetic region arrival whispers (with gentle hysteresis cooldown)
	var region_name: String = (
		_broken_shore.get_region_display_name(ppos)
		if in_shore
		else _living_forest.get_region_display_name(ppos)
	)
	if region_name != _current_region_name and _region_cooldown <= 0.0:
		_current_region_name = region_name
		_region_cooldown = REGION_WHISPER_COOLDOWN
		_hud.announce_region(region_name)

	# 2. Unobtrusive contextual proximity prompt for nearest valid discovery
	var in_interior: bool = _broken_shore.is_in_meridian_interior()
	var nearest: Dictionary = FieldCodex.find_nearest_interactable(ppos, in_interior)
	if nearest.is_empty():
		_hud.update_proximity_prompt("")
		return
	var sid: String = str(nearest.get("id", ""))
	var sname: String = str(nearest.get("name", ""))
	if GameState.is_site_sampled(sid):
		_hud.update_proximity_prompt("✓ %s  •  [Q] Re-Scan  •  [Tab/J] Journal" % sname)
	elif GameState.is_site_scanned(sid):
		_hud.update_proximity_prompt("[E] Sample: %s  •  [Q] Acoustic Scan" % sname)
	else:
		_hud.update_proximity_prompt("[Q] Acoustic Scan  •  [E] Sample: %s" % sname)


func _refresh_hud(delta: float, surf: String, in_shore: bool) -> void:
	var fps: float = Engine.get_frames_per_second()
	var frame_ms: float = delta * 1000.0
	var chunk_c: Vector2i = _world_streamer.get_center_chunk()
	var vis_tufts: int = _broken_shore.get_visible_tuft_count() + _living_forest.get_visible_tuft_count()
	var tot_tufts: int = _broken_shore.get_total_tuft_count() + _living_forest.get_total_tuft_count()
	var bent_tufts: int = _broken_shore.get_active_bent_tuft_count() + _living_forest.get_active_bent_tuft_count()
	var zone_label: String = (
		_broken_shore.get_zone_status_label(_player.global_position)
		if in_shore
		else ("Living Forest: " + _living_forest.get_zone_status_label(_player.global_position))
	)
	var world_line: String = "CHUNK:(%d,%d)[%d/9] | TUFTS:%d/%d (bent:%d) | %s" % [
		chunk_c.x,
		chunk_c.y,
		_world_streamer.get_active_chunk_count(),
		vis_tufts,
		tot_tufts,
		bent_tufts,
		zone_label,
	]
	var gust_tag: String = "GUST" if _living_forest.get_current_gust_strength() > 0.35 else "breeze"
	var actor_line: String = "MARA:%s(%s) | SURF:%s | MOOD:%s | WIND:%s | LOG:%d | INS:%d" % [
		_player.get_state_label(),
		_player.get_facing_label(),
		surf,
		_living_forest.get_mood_name(),
		gust_tag,
		GameState.get_discovered_count(),
		GameState.get_insight_count(),
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
	_broken_shore.apply_lighting_mood(_mood_index)
	_time_modulate.color = modulate_tint
	var is_twilight: bool = _living_forest.is_twilight_biolum_mood()
	_world_streamer.set_night_mode(is_twilight)


func _warp_to_zone(zone_idx: int) -> void:
	var warp: Dictionary = _broken_shore.get_warp_point(zone_idx)
	if warp.is_empty():
		return
	var pos_v: Variant = warp.get("pos", VerdantBrokenShore.DEFAULT_SPAWN_POS)
	var dir_v: Variant = warp.get("dir", 2)
	if pos_v is Vector2:
		_player.position = pos_v as Vector2
	if dir_v is int:
		_player.set_facing_row(dir_v as int)
	var cam: Camera2D = _player.get_camera()
	if cam != null:
		cam.reset_smoothing()
	_broken_shore.force_settle_interior_state(_player.global_position)
	_broken_shore.step_broken_shore(0.016, _player)
	_living_forest.step_living_ecosystem(0.016, _player)
	_sync_unified_player_atmosphere(_player.global_position)
	_region_cooldown = 0.0
	_refresh_exploration_prompts(_player.global_position, _broken_shore.is_position_in_broken_shore(_player.global_position))


func _warp_to_forest_zone(forest_idx: int) -> void:
	var warp: Dictionary = _living_forest.get_warp_point(forest_idx)
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
	_broken_shore.force_settle_interior_state(_player.global_position)
	_broken_shore.step_broken_shore(0.016, _player)
	_living_forest.step_living_ecosystem(0.016, _player)
	_sync_unified_player_atmosphere(_player.global_position)
	_region_cooldown = 0.0
	_refresh_exploration_prompts(_player.global_position, _broken_shore.is_position_in_broken_shore(_player.global_position))


func _on_player_footstep(is_running: bool) -> void:
	var surf: String = _player.current_surface
	var kind: String = "grass"
	if surf == "shallow_water":
		kind = "water"
	elif surf == "spacecraft_grating":
		kind = "metal"
	elif surf == "dry_sand" or surf == "damp_sand" or surf == "wet_sand":
		kind = "sand"
	AudioDirector.play_footstep(kind, is_running, _player.is_crouching)


func _on_player_acoustic_pulse(world_pos: Vector2, scan_radius: float) -> void:
	var ring := GroundRingVfx.new()
	_vfx_layer.add_child(ring)
	ring.configure(2, world_pos, 8.0)

	# Keep existing biome visual glow boosts & scannable flora animations active
	var hits: PackedStringArray = _broken_shore.scan_coastal_sites(world_pos, scan_radius)
	var forest_hits: PackedStringArray = _living_forest.scan_ecological_sites(world_pos, scan_radius)
	for fh: String in forest_hits:
		if not hits.has(fh):
			hits.append(fh)

	var radius_sq: float = scan_radius * scan_radius
	for node: Node in get_tree().get_nodes_in_group("scannable_flora"):
		if node is FloraProp:
			var flora: FloraProp = node as FloraProp
			if flora.global_position.distance_squared_to(world_pos) <= radius_sq:
				var species_name: String = flora.trigger_acoustic_scan_response()
				if not hits.has(species_name):
					hits.append(species_name)

	# V11.0 Unified FieldCodex harmonic echo replies, cross-node echoes & Mara observation cards!
	var in_interior: bool = _broken_shore.is_in_meridian_interior()
	var codex_hits: Array[Dictionary] = FieldCodex.find_in_scan_radius(
		world_pos,
		in_interior,
		maxf(scan_radius, FieldCodex.SCAN_ECHO_RANGE_PX)
	)

	var has_blight: bool = false
	var primary_entry: Dictionary = {}
	var primary_dist: float = 999999.0

	for entry: Dictionary in codex_hits:
		var sid: String = str(entry.get("id", ""))
		var sname: String = str(entry.get("name", ""))
		var skind: String = str(entry.get("kind", "organic"))
		var spos_v: Variant = entry.get("pos", world_pos)
		var spos: Vector2 = spos_v as Vector2 if spos_v is Vector2 else world_pos
		var dist: float = world_pos.distance_to(spos)
		if dist < primary_dist:
			primary_dist = dist
			primary_entry = entry
		if not hits.has(sname):
			hits.append(sname)
		if skind == "blight":
			has_blight = true

		GameState.record_scanned_site(sid, sname)
		var delay_s: float = clampf(dist / 620.0, 0.05, 0.24)
		_spawn_echo(spos, skind, delay_s, 1.0)

	# Sympathetic cross-landmark harmonic echo guiding curiosity organically across the map!
	if not primary_entry.is_empty():
		var linked_id: String = str(primary_entry.get("linked_id", ""))
		if not linked_id.is_empty():
			var linked: Dictionary = FieldCodex.find_by_id(linked_id)
			if not linked.is_empty():
				var lpos_v: Variant = linked.get("pos", Vector2.ZERO)
				var lpos: Vector2 = lpos_v as Vector2 if lpos_v is Vector2 else Vector2.ZERO
				var to_linked: Vector2 = lpos - world_pos
				var echo_pos: Vector2 = lpos if to_linked.length() <= 240.0 else (world_pos + to_linked.normalized() * 118.0)
				_spawn_echo(echo_pos, str(linked.get("kind", "harmonic")), 0.42, 0.78)

	# Audio response: eerie damped static on blight, resonant chime otherwise + coastal glider mimicry!
	if has_blight:
		AudioDirector.play_blight_static()
	else:
		AudioDirector.play_acoustic_lens_chime(not hits.is_empty())

	if _broken_shore.is_position_in_broken_shore(world_pos) and not in_interior:
		if _broken_shore.trigger_glider_acoustic_response(world_pos):
			AudioDirector.play_glider_mimic_call()

	if not primary_entry.is_empty():
		var p_name: String = str(primary_entry.get("name", ""))
		var p_note: String = str(primary_entry.get("scan_note", ""))
		var p_kind: String = str(primary_entry.get("kind", "organic"))
		var badge: String = _badge_for_kind(p_kind, false)
		var accent: Color = _accent_for_kind(p_kind)
		_hud.show_field_observation(badge, p_name, p_note, accent, 5.4)
		_last_scan_text = ", ".join(hits)
		_evaluate_emergent_insights()
		return

	if not hits.is_empty():
		_last_scan_text = ", ".join(hits)
		_hud.show_field_observation(
			"ACOUSTIC SCAN",
			hits[0],
			"Resonant biological signature recorded in nearby foliage.",
			Color(0.54, 0.96, 0.88, 1.0),
			4.2
		)
		return

	# Subtle off-center harmonic compass whisper if an undiscovered site sits nearby (<= 440 px)
	var hint_entry: Dictionary = FieldCodex.find_nearest_undiscovered_hint(
		world_pos,
		in_interior,
		GameState.get_discovered_ids()
	)
	if not hint_entry.is_empty():
		var hpos_v: Variant = hint_entry.get("pos", world_pos)
		var hpos: Vector2 = hpos_v as Vector2 if hpos_v is Vector2 else world_pos
		var dir_vec: Vector2 = (hpos - world_pos).normalized()
		_spawn_echo(world_pos + dir_vec * 76.0, "direction_hint", 0.14, 0.82)
		var compass: String = _compass_label(dir_vec)
		_last_scan_text = "faint acoustic return to the %s" % compass
		_hud.show_field_observation(
			"FAINT RESONANCE",
			"Distant Acoustic Return (%s)" % compass.capitalize(),
			"A subtle harmonic echo answered from the %s — worth investigating closer." % compass,
			Color(0.52, 0.90, 0.94, 1.0),
			4.0
		)
		return

	_last_scan_text = "no resonant features within %d px" % int(scan_radius)
	_hud.show_field_observation(
		"ACOUSTIC SWEEP",
		"Quiet Horizon",
		"Only surf, wind, and familiar ground scatter within lens range.",
		Color(0.74, 0.84, 0.82, 1.0),
		2.8
	)


func _on_player_field_sample(world_pos: Vector2) -> void:
	var in_interior: bool = _broken_shore.is_in_meridian_interior()
	var entry: Dictionary = FieldCodex.find_nearest_interactable(world_pos, in_interior)

	if not entry.is_empty():
		var sid: String = str(entry.get("id", ""))
		var sname: String = str(entry.get("name", ""))
		var skind: String = str(entry.get("kind", "organic"))
		var snote: String = str(entry.get("sample_note", ""))
		var spos_v: Variant = entry.get("pos", world_pos)
		var spos: Vector2 = spos_v as Vector2 if spos_v is Vector2 else world_pos

		var newly_logged: bool = GameState.record_sampled_site(sid, sname)
		_spawn_echo(spos, "blight" if skind == "blight" else "sample_burst", 0.0, 1.05)
		if skind == "blight":
			AudioDirector.play_blight_static()
		else:
			AudioDirector.play_sample_confirm(newly_logged)

		var badge: String = _badge_for_kind(skind, true) if newly_logged else "FIELD LOGGED"
		var accent: Color = _accent_for_kind(skind)
		_hud.show_field_observation(badge, sname, snote, accent, 6.2)
		_last_scan_text = (
			"LOGGED SAMPLE: %s (%d total)" % [sname, GameState.get_sample_count()]
			if newly_logged
			else "ALREADY LOGGED: %s (%d total)" % [sname, GameState.get_sample_count()]
		)
		_evaluate_emergent_insights()
		return

	# Legacy fallback for any uncatalogued local landmark
	var feature_name: String = _broken_shore.sample_nearest_coastal_feature(world_pos)
	if feature_name.is_empty():
		feature_name = _living_forest.sample_nearest_feature(world_pos)
	if feature_name.is_empty():
		AudioDirector.play_sample_confirm(false)
		_last_scan_text = "move closer to wreckage, flora or traces to sample [E]"
		_hud.show_field_observation(
			"FIELD SAMPLER",
			"Out of Reach",
			"Move closer to wreckage, unusual flora, or resonant stone to collect a field sample.",
			Color(0.76, 0.82, 0.80, 1.0),
			2.8
		)
		return

	var newly_legacy: bool = GameState.record_field_sample(feature_name)
	AudioDirector.play_sample_confirm(newly_legacy)
	_last_scan_text = "LOGGED SAMPLE: %s (%d total)" % [feature_name, GameState.get_sample_count()]
	_hud.show_field_observation(
		"FIELD SAMPLE",
		feature_name,
		"Specimen sealed and archived in Mara's field journal.",
		Color(0.56, 0.98, 0.78, 1.0),
		4.8
	)


func _evaluate_emergent_insights() -> void:
	var new_insights: Array[Dictionary] = FieldCodex.evaluate_new_insights(
		GameState.get_discovered_ids(),
		GameState.unlocked_insight_ids
	)
	if new_insights.is_empty():
		return
	for ins: Dictionary in new_insights:
		var iid: String = str(ins.get("id", ""))
		var title: String = str(ins.get("title", "Field Insight"))
		var note: String = str(ins.get("note", ""))
		if GameState.record_unlocked_insight(iid, title, note):
			_hud.queue_field_observation(
				"FIELD INSIGHT",
				title,
				note,
				Color(1.0, 0.86, 0.48, 1.0),
				7.2,
				true
			)
			_last_scan_text = "INSIGHT UNLOCKED: " + title


func _spawn_echo(world_pos: Vector2, kind: String, delay_sec: float, scale_boost: float) -> void:
	var echo := AcousticEchoVfx.new()
	_vfx_layer.add_child(echo)
	echo.configure_echo(world_pos, kind, delay_sec, scale_boost)


func _badge_for_kind(kind: String, is_sample: bool) -> String:
	match kind:
		"blight":
			return "BLIGHT SAMPLE" if is_sample else "ACOUSTIC DAMPING"
		"surveyor":
			return "FORENSIC TRACE" if is_sample else "PRE-ARRIVAL TRACE"
		"meridian":
			return "WRECKAGE LOG" if is_sample else "TELEMETRY SCAN"
		"harmonic":
			return "HARMONIC SAMPLE" if is_sample else "HARMONIC ECHO"
		_:
			return "FIELD SAMPLE" if is_sample else "BIO-SCAN"


func _accent_for_kind(kind: String) -> Color:
	match kind:
		"blight":
			return Color(0.84, 0.72, 0.96, 1.0)
		"surveyor", "meridian":
			return Color(1.0, 0.80, 0.44, 1.0)
		"harmonic":
			return Color(0.48, 0.98, 0.96, 1.0)
		_:
			return Color(0.58, 0.96, 0.76, 1.0)


func _compass_label(dir_vec: Vector2) -> String:
	var ang: float = atan2(dir_vec.y, dir_vec.x)
	if ang >= -0.39 and ang < 0.39:
		return "east"
	if ang >= 0.39 and ang < 1.18:
		return "south-east"
	if ang >= 1.18 and ang < 1.96:
		return "south"
	if ang >= 1.96 and ang < 2.75:
		return "south-west"
	if ang >= -1.18 and ang < -0.39:
		return "north-east"
	if ang >= -1.96 and ang < -1.18:
		return "north"
	if ang >= -2.75 and ang < -1.96:
		return "north-west"
	return "west"


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
	print("[PROD-V110] Captured runtime screenshot: " + full_path)


func _run_automated_production_capture() -> void:
	_hud.set_telemetry_visible(false)
	var shots: Array[Dictionary] = [
		{"name": "prod_v110_01_zoneA_waking_shore.png", "zone": 0, "mood": 0, "dbg": false, "hud": false},
		{"name": "prod_v110_02_zoneB_meridian_crash.png", "zone": 1, "mood": 0, "dbg": false, "hud": false},
		{"name": "prod_v110_03_zoneB2_meridian_interior.png", "zone": 2, "mood": 0, "dbg": false, "hud": false},
		{"name": "prod_v110_04_zoneC_tidepool_coast.png", "zone": 3, "mood": 0, "dbg": false, "hud": false},
		{"name": "prod_v110_05_zoneD_basalt_ocean.png", "zone": 4, "mood": 0, "dbg": false, "hud": false},
		{"name": "prod_v110_06_zoneF_inland_gateway.png", "zone": 6, "mood": 0, "dbg": false, "hud": false},
		{"name": "prod_v110_07_meridian_twilight.png", "zone": 1, "mood": 2, "dbg": false, "hud": false},
		{"name": "prod_v110_08_collision_debug_crash.png", "zone": 1, "mood": 0, "dbg": true, "hud": true},
		{"name": "prod_v110_09_v80_forest_hub.png", "zone": 7, "mood": 0, "dbg": false, "hud": false},
	]
	for shot: Dictionary in shots:
		var mood_v: Variant = shot.get("mood", 0)
		var dbg_v: Variant = shot.get("dbg", false)
		var hud_v: Variant = shot.get("hud", false)
		var zone_v: Variant = shot.get("zone", 0)
		var name_v: Variant = shot.get("name", "prod_v110_shot.png")
		_mood_index = mood_v as int if mood_v is int else 0
		_apply_lighting_mood()
		var dbg_b: bool = dbg_v as bool if dbg_v is bool else false
		_broken_shore.set_collision_debug(dbg_b)
		_living_forest.set_collision_debug(dbg_b)
		_hud.set_telemetry_visible(hud_v as bool if hud_v is bool else false)
		_warp_to_zone(zone_v as int if zone_v is int else 0)
		await get_tree().physics_frame
		await get_tree().process_frame
		await get_tree().process_frame
		await RenderingServer.frame_post_draw
		var fname: String = name_v as String if name_v is String else "prod_v110_shot.png"
		_save_production_capture(fname)
	print("[PROD-V110] Automated 9-shot capture complete! FPS=%.1f" % Engine.get_frames_per_second())
	get_tree().quit(0)
