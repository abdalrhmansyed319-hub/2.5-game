extends Node
## 5-Tier Audio Bus & V11.0 Living World Immersion Soundscape Director for VERDANT SIGNAL.
##
## Manages seamless biome ambience crossfades (Coastal Surf <-> Living Forest Canopy)
## on Tier5_Atmosphere, spatialized piezo-harmonic proximity resonance on Tier3_World,
## surface- & stealth-aware footsteps with CaveReverb interior/arch routing, Acoustic
## Field Lens harmonic chimes, Metallic Blight micro-static, Chime-Glider mimic calls,
## field-sampling confirmations, and Emergent Insight swells on Tier4_Music.

const REQUIRED_BUSES: PackedStringArray = [
	"Master",
	"Tier1_Critical",
	"Tier2_Action",
	"Tier3_World",
	"Tier4_Music",
	"Tier5_Atmosphere",
	"CaveReverb",
]

const AMBIENT_COAST_PATH: String = "res://audio/ambient/coastal_surf_breeze.wav"
const AMBIENT_FOREST_PATH: String = "res://audio/ambient/living_forest_canopy.wav"
const AMBIENT_WAYMARKER_PATH: String = "res://audio/ambient/waymarker_resonance.wav"

const SFX_STEP_SAND_PATH: String = "res://audio/sfx/step_sand.wav"
const SFX_STEP_GRASS_PATH: String = "res://audio/sfx/step_grass.wav"
const SFX_STEP_WATER_PATH: String = "res://audio/sfx/step_water.wav"
const SFX_STEP_METAL_PATH: String = "res://audio/sfx/step_metal.wav"

const SFX_LENS_CHIME_PATH: String = "res://audio/sfx/acoustic_lens_chime.wav"
const SFX_SAMPLE_CONFIRM_PATH: String = "res://audio/sfx/sample_confirm.wav"
const SFX_INSIGHT_DISCOVERY_PATH: String = "res://audio/sfx/insight_discovery.wav"
const SFX_BLIGHT_STATIC_PATH: String = "res://audio/sfx/blight_static.wav"
const SFX_GLIDER_MIMIC_PATH: String = "res://audio/sfx/glider_mimic_call.wav"

var _coast_player: AudioStreamPlayer = null
var _forest_player: AudioStreamPlayer = null
var _resonance_player: AudioStreamPlayer = null
var _step_player: AudioStreamPlayer = null
var _chime_player: AudioStreamPlayer = null
var _feedback_player: AudioStreamPlayer = null
var _wildlife_player: AudioStreamPlayer = null
var _insight_player: AudioStreamPlayer = null

var _sfx_sand: AudioStream = null
var _sfx_grass: AudioStream = null
var _sfx_water: AudioStream = null
var _sfx_metal: AudioStream = null
var _sfx_chime: AudioStream = null
var _sfx_sample_confirm: AudioStream = null
var _sfx_insight: AudioStream = null
var _sfx_blight_static: AudioStream = null
var _sfx_glider_mimic: AudioStream = null

var _ambience_ready: bool = false
var _interior_reverb_active: bool = false
var _last_glider_call_sec: float = -10.0
var _elapsed_sec: float = 0.0
var _rng: RandomNumberGenerator = RandomNumberGenerator.new()


func _ready() -> void:
	_rng.seed = 110731
	_init_living_world_audio()


func _process(delta: float) -> void:
	_elapsed_sec += delta


func verify_bus_layout() -> PackedStringArray:
	var missing: PackedStringArray = PackedStringArray()
	for bus_name: String in REQUIRED_BUSES:
		if AudioServer.get_bus_index(bus_name) == -1:
			missing.append(bus_name)
	return missing


func set_bus_volume_linear(bus_name: String, linear_volume: float) -> bool:
	var bus_idx: int = AudioServer.get_bus_index(bus_name)
	if bus_idx == -1:
		return false
	var clamped: float = clampf(linear_volume, 0.0, 1.0)
	AudioServer.set_bus_volume_db(bus_idx, linear_to_db(clamped))
	AudioServer.set_bus_mute(bus_idx, clamped <= 0.0001)
	return true


func set_interior_reverb(active: bool) -> void:
	if _interior_reverb_active == active:
		return
	_interior_reverb_active = active
	var has_reverb: bool = AudioServer.get_bus_index("CaveReverb") != -1
	var world_bus: String = "Tier3_World" if AudioServer.get_bus_index("Tier3_World") != -1 else "Master"
	var action_bus: String = "Tier2_Action" if AudioServer.get_bus_index("Tier2_Action") != -1 else "Master"
	if _step_player != null:
		_step_player.bus = "CaveReverb" if (active and has_reverb) else world_bus
	if _chime_player != null:
		_chime_player.bus = "CaveReverb" if (active and has_reverb) else action_bus


func is_interior_reverb_active() -> bool:
	return _interior_reverb_active


func update_biome_ambience(world_y: float, wind_gust: float, in_interior: bool) -> void:
	if not _ambience_ready:
		return
	# Smooth organic crossfade across the Zone F ecotone (y = 1220 forest <-> y = 1980 coast)
	var coast_t: float = clampf((world_y - 1220.0) / 760.0, 0.0, 1.0)
	var forest_t: float = 1.0 - coast_t
	var interior_duck: float = 0.36 if in_interior else 1.0
	var gust_lift: float = 1.0 + clampf(wind_gust, 0.0, 1.0) * 0.28
	var slow_breath: float = 0.94 + 0.06 * sin(_elapsed_sec * 0.31)

	var coast_lin: float = clampf((0.05 + coast_t * 0.45) * interior_duck * gust_lift * slow_breath, 0.001, 0.85)
	var forest_lin: float = clampf((0.04 + forest_t * 0.43) * interior_duck * slow_breath, 0.001, 0.85)

	if _coast_player != null:
		_coast_player.volume_db = linear_to_db(coast_lin)
		if not _coast_player.playing:
			_coast_player.play()
	if _forest_player != null:
		_forest_player.volume_db = linear_to_db(forest_lin)
		if not _forest_player.playing:
			_forest_player.play()


func update_landmark_resonance(proximity_strength: float, is_twilight: bool) -> void:
	if _resonance_player == null:
		return
	var p: float = clampf(proximity_strength, 0.0, 1.0)
	if p <= 0.02:
		if _resonance_player.playing:
			_resonance_player.stop()
		return
	var twilight_boost: float = 1.32 if is_twilight else 1.0
	var lin: float = clampf(p * p * 0.22 * twilight_boost, 0.001, 0.36)
	_resonance_player.volume_db = linear_to_db(lin)
	if not _resonance_player.playing:
		_resonance_player.play()


func play_footstep(surface_kind: String, is_running: bool, is_crouching: bool = false) -> void:
	if _step_player == null:
		return
	var chosen: AudioStream = _sfx_grass
	if surface_kind == "water":
		chosen = _sfx_water
	elif surface_kind == "metal":
		chosen = _sfx_metal if _sfx_metal != null else _sfx_sand
	elif surface_kind == "sand":
		chosen = _sfx_sand
	if chosen == null:
		return
	_step_player.stream = chosen
	var pitch_base: float = 1.06 if is_running else (0.91 if is_crouching else 0.98)
	_step_player.pitch_scale = _rng.randf_range(0.93, 1.10) * pitch_base
	var vol_lin: float = 0.42 if is_running else (0.14 if is_crouching else 0.27)
	_step_player.volume_db = linear_to_db(vol_lin)
	_step_player.play()


func play_acoustic_lens_chime(resonance_boost: bool = false) -> void:
	if _chime_player == null or _sfx_chime == null:
		return
	_chime_player.stream = _sfx_chime
	_chime_player.pitch_scale = 1.08 if resonance_boost else _rng.randf_range(0.97, 1.04)
	_chime_player.volume_db = linear_to_db(0.36 if resonance_boost else 0.26)
	_chime_player.play()


func play_sample_confirm(is_new_discovery: bool = true) -> void:
	if _feedback_player == null:
		return
	var chosen: AudioStream = _sfx_sample_confirm if _sfx_sample_confirm != null else _sfx_chime
	if chosen == null:
		return
	_feedback_player.stream = chosen
	_feedback_player.pitch_scale = 1.02 if is_new_discovery else 0.84
	_feedback_player.volume_db = linear_to_db(0.38 if is_new_discovery else 0.18)
	_feedback_player.play()


func play_blight_static() -> void:
	if _feedback_player == null or _sfx_blight_static == null:
		return
	_feedback_player.stream = _sfx_blight_static
	_feedback_player.pitch_scale = _rng.randf_range(0.94, 1.06)
	_feedback_player.volume_db = linear_to_db(0.32)
	_feedback_player.play()


func play_glider_mimic_call() -> void:
	if _wildlife_player == null or _sfx_glider_mimic == null:
		return
	if (_elapsed_sec - _last_glider_call_sec) < 3.6:
		return
	_last_glider_call_sec = _elapsed_sec
	_wildlife_player.stream = _sfx_glider_mimic
	_wildlife_player.pitch_scale = _rng.randf_range(0.95, 1.07)
	_wildlife_player.volume_db = linear_to_db(0.24)
	_wildlife_player.play()


func play_insight_discovery() -> void:
	if _insight_player == null or _sfx_insight == null:
		return
	_insight_player.stream = _sfx_insight
	_insight_player.pitch_scale = 1.0
	_insight_player.volume_db = linear_to_db(0.42)
	_insight_player.play()


func _init_living_world_audio() -> void:
	var atmo_bus: String = "Tier5_Atmosphere" if AudioServer.get_bus_index("Tier5_Atmosphere") != -1 else "Master"
	var world_bus: String = "Tier3_World" if AudioServer.get_bus_index("Tier3_World") != -1 else "Master"
	var action_bus: String = "Tier2_Action" if AudioServer.get_bus_index("Tier2_Action") != -1 else "Master"
	var music_bus: String = "Tier4_Music" if AudioServer.get_bus_index("Tier4_Music") != -1 else "Master"

	var coast_stream: AudioStream = _load_looping_wav(AMBIENT_COAST_PATH)
	var forest_stream: AudioStream = _load_looping_wav(AMBIENT_FOREST_PATH)
	var res_stream: AudioStream = _load_looping_wav(AMBIENT_WAYMARKER_PATH)

	if coast_stream != null:
		_coast_player = AudioStreamPlayer.new()
		_coast_player.name = "CoastalAmbiencePlayer"
		_coast_player.bus = atmo_bus
		_coast_player.stream = coast_stream
		_coast_player.volume_db = -36.0
		add_child(_coast_player)
	if forest_stream != null:
		_forest_player = AudioStreamPlayer.new()
		_forest_player.name = "ForestAmbiencePlayer"
		_forest_player.bus = atmo_bus
		_forest_player.stream = forest_stream
		_forest_player.volume_db = -36.0
		add_child(_forest_player)
	if res_stream != null:
		_resonance_player = AudioStreamPlayer.new()
		_resonance_player.name = "LandmarkResonancePlayer"
		_resonance_player.bus = world_bus
		_resonance_player.stream = res_stream
		_resonance_player.volume_db = -40.0
		add_child(_resonance_player)

	_sfx_sand = _load_stream(SFX_STEP_SAND_PATH)
	_sfx_grass = _load_stream(SFX_STEP_GRASS_PATH)
	_sfx_water = _load_stream(SFX_STEP_WATER_PATH)
	_sfx_metal = _load_stream(SFX_STEP_METAL_PATH)
	_sfx_chime = _load_stream(SFX_LENS_CHIME_PATH)
	_sfx_sample_confirm = _load_stream(SFX_SAMPLE_CONFIRM_PATH)
	_sfx_insight = _load_stream(SFX_INSIGHT_DISCOVERY_PATH)
	_sfx_blight_static = _load_stream(SFX_BLIGHT_STATIC_PATH)
	_sfx_glider_mimic = _load_stream(SFX_GLIDER_MIMIC_PATH)

	_step_player = AudioStreamPlayer.new()
	_step_player.name = "FootstepFoleyPlayer"
	_step_player.bus = world_bus
	add_child(_step_player)

	_chime_player = AudioStreamPlayer.new()
	_chime_player.name = "AcousticLensChimePlayer"
	_chime_player.bus = action_bus
	add_child(_chime_player)

	_feedback_player = AudioStreamPlayer.new()
	_feedback_player.name = "FieldFeedbackPlayer"
	_feedback_player.bus = action_bus
	add_child(_feedback_player)

	_wildlife_player = AudioStreamPlayer.new()
	_wildlife_player.name = "WildlifeVoicePlayer"
	_wildlife_player.bus = world_bus
	add_child(_wildlife_player)

	_insight_player = AudioStreamPlayer.new()
	_insight_player.name = "InsightHarmonicPlayer"
	_insight_player.bus = music_bus
	add_child(_insight_player)

	_ambience_ready = (_coast_player != null or _forest_player != null)


func _load_stream(res_path: String) -> AudioStream:
	if not ResourceLoader.exists(res_path):
		return null
	var res: Resource = load(res_path)
	if res is AudioStream:
		return res as AudioStream
	return null


func _load_looping_wav(res_path: String) -> AudioStream:
	var stream: AudioStream = _load_stream(res_path)
	if stream is AudioStreamWAV:
		var dup: Resource = (stream as AudioStreamWAV).duplicate()
		if dup is AudioStreamWAV:
			var wav: AudioStreamWAV = dup as AudioStreamWAV
			wav.loop_mode = AudioStreamWAV.LOOP_FORWARD
			wav.loop_begin = 0
			# 16-bit mono PCM -> sample count = byte length / 2
			wav.loop_end = maxi(0, int(floor(float(wav.data.size()) * 0.5)))
			return wav
	return stream
