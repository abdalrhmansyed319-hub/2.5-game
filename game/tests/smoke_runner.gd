extends Node
## Automated Milestone 01 Smoke & Error-Detection Runner for Godot 4.7.2.
##
## Run via:
##   Godot_v4.7.2-stable_win64_console.exe --headless --path game res://tests/smoke_runner.tscn
##
## Executes inside the real project.godot environment (autoloads, InputMap,
## physics layers, AudioBusLayout), verifies scripts/scenes/resources, steps
## live BootDiagnostics + RimlandsPrototype frames, and exits cleanly.

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
	"res://ui/prototype_hud.tscn",
	"res://world/rimlands_prototype.tscn",
]

const REQUIRED_INPUT_ACTIONS: PackedStringArray = [
	"move_left",
	"move_right",
	"move_up",
	"move_down",
	"crouch_stealth",
	"toggle_acoustic_lens",
]

const FRAMES_TO_STEP: int = 10

var _failures: PackedStringArray = PackedStringArray()
var _step_frames_left: int = 0
var _prototype_instance: Node = null


func _ready() -> void:
	print("[SMOKE] === VERDANT SIGNAL Godot 4.7.2 Headless Smoke Runner ===")
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
		"[SMOKE] Textures loaded: %d/%d (placeholders active: %d)"
		% [
			loaded_tex,
			AssetPaths.ASSET_IDS.size(),
			AssetPaths.get_placeholder_count(),
		]
	)

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
		var streamer: Node = _prototype_instance.get_node_or_null("WorldChunkStreamer")
		if streamer is WorldChunkStreamer:
			var wcs: WorldChunkStreamer = streamer as WorldChunkStreamer
			var chunk_count: int = wcs.get_active_chunk_count()
			var surf: String = wcs.get_surface_type_at(Vector2(22.0, 26.0))
			print(
				"[SMOKE] RimlandsPrototype stepped %d ticks | chunks=%d/9 | spawn_surf=%s"
				% [FRAMES_TO_STEP, chunk_count, surf]
			)
			if chunk_count != 9:
				_record_fail("Expected 9 active chunks, got %d" % chunk_count)
		_prototype_instance.queue_free()

	if _failures.is_empty():
		print("[SMOKE] RESULT: PASS (0 smoke assertion failures)")
		get_tree().quit(0)
		return
	print("[SMOKE] RESULT: FAIL (%d failures)" % _failures.size())
	get_tree().quit(1)
