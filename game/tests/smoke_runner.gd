extends Node
## Automated Production Smoke & V8.0 Integration Verification Runner for Godot 4.7.2.
##
## Run via:
##   Godot_v4.7.2-stable_win64_console.exe --headless --path game res://tests/smoke_runner.tscn
##
## Executes inside the real production project.godot environment (autoloads, InputMap,
## physics layers, AudioBusLayout, strict GDScript warnings), verifies ALL Milestone 01
## AND integrated V8.0 Living World scripts/scenes/shaders/resources, steps live
## BootDiagnostics + integrated RimlandsPrototype frames, tests moods/gusts/lens/sampling,
## and exits cleanly with 0 on pass or 1 on any failure.

const SCRIPTS_TO_CHECK: PackedStringArray = [
	"res://autoload/game_state.gd",
	"res://autoload/audio_director.gd",
	"res://resources/biome_data.gd",
	"res://resources/flora_species_data.gd",
	"res://resources/fauna_species_data.gd",
	"res://resources/weather_event_data.gd",
	"res://systems/asset_paths.gd",
	"res://scenes/boot/main.gd",
	"res://characters/player/player.gd",
	"res://world/rimlands_tileset_builder.gd",
	"res://world/world_chunk_streamer.gd",
	"res://world/living_forest/verdant_living_forest.gd",
	"res://world/rimlands_prototype.gd",
	"res://world/props/singing_reedwood_tree.gd",
	"res://world/flora/flora_prop.gd",
	"res://world/landmarks/drop_pod_clearing.gd",
	"res://world/vfx/ground_ring_vfx.gd",
	"res://ui/prototype_hud.gd",
]

const SCENES_TO_CHECK: PackedStringArray = [
	"res://scenes/boot/main.tscn",
	"res://characters/player/player.tscn",
	"res://world/props/singing_reedwood_tree.tscn",
	"res://world/flora/flora_prop.tscn",
	"res://world/landmarks/drop_pod_clearing.tscn",
	"res://world/living_forest/verdant_living_forest.tscn",
	"res://ui/prototype_hud.tscn",
	"res://world/rimlands_prototype.tscn",
]

const REQUIRED_INPUT_ACTIONS: PackedStringArray = [
	"move_left",
	"move_right",
	"move_up",
	"move_down",
	"crouch_stealth",
	"sprint_dodge",
	"interact_sample",
	"toggle_acoustic_lens",
	"pause_menu",
]

const FRAMES_TO_STEP: int = 12

var _failures: PackedStringArray = PackedStringArray()
var _step_frames_left: int = 0
var _prototype_instance: Node = null


func _ready() -> void:
	print("[SMOKE] === VERDANT SIGNAL Production V8.0 Godot 4.7.2 Headless Smoke Runner ===")
	_check_autoloads_and_inputs()
	_check_scripts_and_scenes()
	_check_assets_and_tileset()
	_check_boot_scene()
	_launch_prototype_for_live_steps()


func _physics_process(_delta: float) -> void:
	if _step_frames_left <= 0:
		return
	_step_frames_left -= 1
	if _step_frames_left == 0:
		_finish_smoke_run()


func _record_fail(msg: String) -> void:
	_failures.append(msg)
	push_error("[SMOKE FAIL] " + msg)


func _check_autoloads_and_inputs() -> void:
	var missing_buses: PackedStringArray = AudioDirector.verify_bus_layout()
	if not missing_buses.is_empty():
		_record_fail("Missing audio buses: " + ", ".join(missing_buses))
	else:
		print("[SMOKE] AudioBusLayout OK (%d buses)" % AudioServer.bus_count)

	for action_name: String in REQUIRED_INPUT_ACTIONS:
		if not InputMap.has_action(action_name):
			_record_fail("Missing required InputMap action: " + action_name)
	print("[SMOKE] InputMap actions verified (%d checked)" % REQUIRED_INPUT_ACTIONS.size())

	if GameState.DEFAULT_VIEWPORT_SIZE != Vector2i(640, 360):
		_record_fail("Expected DEFAULT_VIEWPORT_SIZE 640x360, got %s" % str(GameState.DEFAULT_VIEWPORT_SIZE))


func _check_scripts_and_scenes() -> void:
	var ok_scripts: int = 0
	for path: String in SCRIPTS_TO_CHECK:
		var res: Resource = ResourceLoader.load(path)
		if res == null:
			_record_fail("Failed to load script: " + path)
		else:
			ok_scripts += 1
	print("[SMOKE] Scripts loaded: %d/%d" % [ok_scripts, SCRIPTS_TO_CHECK.size()])

	var ok_scenes: int = 0
	for path: String in SCENES_TO_CHECK:
		var res: Resource = ResourceLoader.load(path)
		if not (res is PackedScene):
			_record_fail("Failed to load PackedScene: " + path)
		else:
			ok_scenes += 1
	print("[SMOKE] Scenes loaded: %d/%d" % [ok_scenes, SCENES_TO_CHECK.size()])


func _check_assets_and_tileset() -> void:
	var loaded_tex: int = 0
	for asset_id: String in AssetPaths.ASSET_IDS:
		var tex: Texture2D = AssetPaths.load_texture(asset_id)
		if tex == null:
			_record_fail("Failed to load texture for " + asset_id)
		else:
			loaded_tex += 1
	print(
		"[SMOKE] M01 Textures loaded: %d/%d (placeholders active: %d)"
		% [
			loaded_tex,
			AssetPaths.ASSET_IDS.size(),
			AssetPaths.get_placeholder_count(),
		]
	)

	var missing_v80: PackedStringArray = AssetPaths.verify_v80_living_world_assets()
	if not missing_v80.is_empty():
		_record_fail("Missing V8.0 production assets: " + ", ".join(missing_v80))
	else:
		print("[SMOKE] V8.0 Living World & Unmodified Mara assets verified (%d paths)" % AssetPaths.V80_REQUIRED_PATHS.size())

	var char_paths: PackedStringArray = PackedStringArray([
		AssetPaths.MARA_ORIG_IDLE_PATH,
		AssetPaths.MARA_ORIG_WALK_PATH,
		AssetPaths.MARA_ORIG_RUN_PATH,
	])
	for cp: String in char_paths:
		var ctex: Texture2D = AssetPaths.load_texture_path(cp)
		if ctex == null:
			_record_fail("Failed to load unmodified character texture: " + cp)
		elif ctex.get_size() != Vector2(704.0, 352.0):
			_record_fail("Unexpected unmodified character sheet dimensions for %s: %s" % [cp, str(ctex.get_size())])

	var ts: TileSet = RimlandsTileSetBuilder.build_tileset()
	if ts == null:
		_record_fail("RimlandsTileSetBuilder.build_tileset() returned null")
		return
	if not ts.has_source(RimlandsTileSetBuilder.SOURCE_AMBER_COAST):
		_record_fail("TileSet missing SOURCE_AMBER_COAST (0)")
	if not ts.has_source(RimlandsTileSetBuilder.SOURCE_SINGING_CANOPY):
		_record_fail("TileSet missing SOURCE_SINGING_CANOPY (1)")
	print("[SMOKE] RimlandsTileSetBuilder OK (sources=%d)" % ts.get_source_count())


func _check_boot_scene() -> void:
	var res: Resource = ResourceLoader.load("res://scenes/boot/main.tscn")
	if not (res is PackedScene):
		_record_fail("Cannot instantiate BootDiagnostics")
		return
	var inst: Node = (res as PackedScene).instantiate()
	add_child(inst)
	inst.queue_free()
	print("[SMOKE] BootDiagnostics instantiated & freed cleanly")


func _launch_prototype_for_live_steps() -> void:
	var res: Resource = ResourceLoader.load("res://world/rimlands_prototype.tscn")
	if not (res is PackedScene):
		_record_fail("Cannot instantiate RimlandsPrototype")
		_finish_smoke_run()
		return
	_prototype_instance = (res as PackedScene).instantiate()
	add_child(_prototype_instance)
	_step_frames_left = FRAMES_TO_STEP


func _finish_smoke_run() -> void:
	if _prototype_instance != null and is_instance_valid(_prototype_instance):
		var streamer_n: Node = _prototype_instance.get_node_or_null("WorldChunkStreamer")
		if streamer_n is WorldChunkStreamer:
			var wcs: WorldChunkStreamer = streamer_n as WorldChunkStreamer
			var chunk_count: int = wcs.get_active_chunk_count()
			print("[SMOKE] WorldChunkStreamer active chunks: %d/9" % chunk_count)
			if chunk_count != 9:
				_record_fail("Expected 9 active chunks, got %d" % chunk_count)
		else:
			_record_fail("WorldChunkStreamer missing from RimlandsPrototype")

		var forest_n: Node = _prototype_instance.get_node_or_null("VerdantLivingForest")
		if forest_n is VerdantLivingForest:
			var vlf: VerdantLivingForest = forest_n as VerdantLivingForest
			var total_tufts: int = vlf.get_total_tuft_count()
			var visible_tufts: int = vlf.get_visible_tuft_count()
			var critters: int = vlf.get_critter_count()
			print(
				"[SMOKE] VerdantLivingForest stepped %d ticks | tufts=%d/%d | critters=%d | mood=%s"
				% [FRAMES_TO_STEP, visible_tufts, total_tufts, critters, vlf.get_mood_name()]
			)
			if total_tufts < 600:
				_record_fail("Expected >= 600 living grass tufts, got %d" % total_tufts)
			if visible_tufts <= 0 or visible_tufts > VerdantLivingForest.GRASS_POOL_SIZE:
				_record_fail("Visible culled tufts out of pool range: %d" % visible_tufts)
			if critters != 7:
				_record_fail("Expected 7 living woodland critters, got %d" % critters)

			# Verify Player is unified inside VerdantLivingForest/YSortWorld
			var player_in_ysort: Node = vlf.get_ysort_world().get_node_or_null("Player")
			if not (player_in_ysort is PlayerController):
				_record_fail("PlayerController was not reparented into VerdantLivingForest/YSortWorld")

			# Exercise all 3 lighting moods, wind gust & ecological acoustic scan
			for m_idx: int in range(3):
				vlf.apply_lighting_mood(m_idx)
			vlf.apply_lighting_mood(0)
			vlf.trigger_wind_gust(2.0)
			var scan_hits: PackedStringArray = vlf.scan_ecological_sites(Vector2(1694.0, 466.0), 112.0)
			if scan_hits.is_empty():
				_record_fail("Acoustic scan near Waystone Spiral returned zero hits")
			var sample_name: String = vlf.sample_nearest_feature(Vector2(1694.0, 466.0))
			if sample_name.is_empty():
				_record_fail("Field sample near Waystone Spiral returned empty feature")
		else:
			_record_fail("VerdantLivingForest missing from RimlandsPrototype")

		_prototype_instance.queue_free()

	if _failures.is_empty():
		print("[SMOKE] RESULT: PASS (0 smoke assertion failures)")
		get_tree().quit(0)
		return
	print("[SMOKE] RESULT: FAIL (%d failures)" % _failures.size())
	get_tree().quit(1)
