extends Node
## Automated Production Smoke & V9.0 + V8.0 Unified Integration Verification Runner for Godot 4.7.2.
##
## Run via:
##   Godot_v4.7.2-stable_win64_console.exe --headless --path game res://tests/smoke_runner.tscn
##
## Executes inside the real production project.godot environment (autoloads, InputMap,
## physics layers, AudioBusLayout, strict GDScript warnings), verifies ALL Milestone 01,
## V8.0 Living Forest, AND V9.0 The Broken Shore scripts/scenes/shaders/resources,
## steps live unified RimlandsPrototype frames across BOTH The Broken Shore AND Living
## Forest, tests moods/gusts/lens/sampling/breached interior, and exits 0 on pass or 1 on fail.

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
	"res://world/broken_shore/verdant_broken_shore.gd",
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
	"res://world/broken_shore/verdant_broken_shore.tscn",
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
	print("[SMOKE] === VERDANT SIGNAL Production V9.0 + V8.0 Godot 4.7.2 Headless Smoke Runner ===")
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

	var missing_v90: PackedStringArray = AssetPaths.verify_v90_broken_shore_assets()
	if not missing_v90.is_empty():
		_record_fail("Missing V9.0 Broken Shore production assets: " + ", ".join(missing_v90))
	else:
		print("[SMOKE] V9.0 Broken Shore assets verified (%d paths)" % AssetPaths.V90_REQUIRED_PATHS.size())

	var missing_v100: PackedStringArray = AssetPaths.verify_v100_living_world_assets()
	if not missing_v100.is_empty():
		_record_fail("Missing V10.0 Living World assets/audio: " + ", ".join(missing_v100))
	else:
		print("[SMOKE] V10.0 Living World storytelling assets & audio verified (%d paths)" % AssetPaths.V100_REQUIRED_PATHS.size())

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
		var shore_n: Node = _prototype_instance.get_node_or_null("VerdantBrokenShore")
		var player_ctrl: PlayerController = null

		if forest_n is VerdantLivingForest:
			var vlf: VerdantLivingForest = forest_n as VerdantLivingForest
			var p_in_ysort: Node = vlf.get_ysort_world().get_node_or_null("Player")
			if p_in_ysort is PlayerController:
				player_ctrl = p_in_ysort as PlayerController
			else:
				_record_fail("PlayerController was not reparented into unified YSortWorld")

		# 1. Verify V9.0 The Broken Shore (spawned on Zone A Waking Shore)
		if shore_n is VerdantBrokenShore and player_ctrl != null:
			var vbs: VerdantBrokenShore = shore_n as VerdantBrokenShore
			var shore_tufts: int = vbs.get_total_tuft_count()
			var shore_vis: int = vbs.get_visible_tuft_count()
			var shore_fauna: int = vbs.get_fauna_count()
			print(
				"[SMOKE] VerdantBrokenShore stepped %d ticks | tufts=%d/%d | fauna=%d | surface=%s"
				% [
					FRAMES_TO_STEP,
					shore_vis,
					shore_tufts,
					shore_fauna,
					vbs.get_surface_type_at(player_ctrl.global_position),
				]
			)
			if shore_tufts < 900:
				_record_fail("Expected >= 900 V10.0 Broken Shore coastal tufts, got %d" % shore_tufts)
			if shore_vis <= 0 or shore_vis > VerdantBrokenShore.GRASS_POOL_SIZE:
				_record_fail("Broken Shore visible culled tufts out of pool range: %d" % shore_vis)
			if shore_fauna != 14:
				_record_fail("Expected 14 coastal fauna (4 Gliders + 4 Crabs + 6 Spore-Moths), got %d" % shore_fauna)

			var surf_dry: String = vbs.get_surface_type_at(Vector2(748.0, 2288.0))
			var surf_shallow: String = vbs.get_surface_type_at(Vector2(1756.0, 2196.0))
			if surf_dry != "dry_sand":
				_record_fail("Expected dry_sand at Zone A spawn, got " + surf_dry)
			if surf_shallow != "shallow_water":
				_record_fail("Expected shallow_water inside eastern tidepool, got " + surf_shallow)

			var crash_scan: PackedStringArray = vbs.scan_coastal_sites(Vector2(1300.0, 2168.0), 112.0)
			if crash_scan.is_empty():
				_record_fail("Acoustic scan near ICV Meridian hull returned zero hits")
			var crash_sample: String = vbs.sample_nearest_coastal_feature(Vector2(1300.0, 2168.0))
			if crash_sample.is_empty():
				_record_fail("Field sample near ICV Meridian hull returned empty feature")

			# V10.0: Verify breached ICV Meridian cutaway interior settle & V10.0 Waymarker scan
			vbs.force_settle_interior_state(Vector2(1384.0, 2212.0))
			if not vbs.is_in_meridian_interior():
				_record_fail("Expected force_settle_interior_state at Zone B2 (1384, 2212) to enter Meridian interior")
			vbs.force_settle_interior_state(Vector2(748.0, 2288.0))
			if vbs.is_in_meridian_interior():
				_record_fail("Expected force_settle_interior_state at Zone A (748, 2288) to exit Meridian interior")

			var waymarker_scan: PackedStringArray = vbs.scan_coastal_sites(Vector2(1032.0, 1524.0), 112.0)
			if waymarker_scan.is_empty():
				_record_fail("V10.0 Acoustic scan near Ancient Harmonic Waymarker returned zero hits")

			AudioDirector.update_biome_ambience(2288.0, 0.25, false)
			AudioDirector.play_footstep("sand", false)
			AudioDirector.play_acoustic_lens_chime(true)
		else:
			_record_fail("VerdantBrokenShore missing from RimlandsPrototype")

		# 2. Verify continuous transition into V8.0 Living Forest Sanctuary
		if forest_n is VerdantLivingForest and player_ctrl != null:
			var vlf2: VerdantLivingForest = forest_n as VerdantLivingForest
			player_ctrl.position = VerdantLivingForest.DEFAULT_SPAWN_POS
			if player_ctrl.get_camera() != null:
				player_ctrl.get_camera().reset_smoothing()
			vlf2.step_living_ecosystem(0.016, player_ctrl)
			var total_tufts: int = vlf2.get_total_tuft_count()
			var visible_tufts: int = vlf2.get_visible_tuft_count()
			var critters: int = vlf2.get_critter_count()
			print(
				"[SMOKE] VerdantLivingForest continuity verified | tufts=%d/%d | critters=%d | mood=%s"
				% [visible_tufts, total_tufts, critters, vlf2.get_mood_name()]
			)
			if total_tufts < 600:
				_record_fail("Expected >= 600 living forest tufts, got %d" % total_tufts)
			if visible_tufts <= 0 or visible_tufts > VerdantLivingForest.GRASS_POOL_SIZE:
				_record_fail("Living Forest visible culled tufts out of pool range: %d" % visible_tufts)
			if critters != 7:
				_record_fail("Expected 7 living woodland critters, got %d" % critters)

			for m_idx: int in range(3):
				vlf2.apply_lighting_mood(m_idx)
			vlf2.apply_lighting_mood(0)
			vlf2.trigger_wind_gust(2.0)
			var scan_hits: PackedStringArray = vlf2.scan_ecological_sites(Vector2(1694.0, 466.0), 112.0)
			if scan_hits.is_empty():
				_record_fail("Acoustic scan near Waystone Spiral returned zero hits")
			var sample_name: String = vlf2.sample_nearest_feature(Vector2(1694.0, 466.0))
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
