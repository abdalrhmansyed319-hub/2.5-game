extends Node
## 5-Tier Audio Bus & V10.0 Living World Ambience/Foley Director for VERDANT SIGNAL.
##
## Verifies the expected audio bus layout at startup, manages seamless biome
## soundscape crossfades (Coastal Surf & Breeze <-> Living Forest Canopy) on
## Tier5_Atmosphere, plays surface-aware explorer footsteps on Tier3_World, and
## emits crystalline Acoustic Field Lens harmonic chimes on Tier2_Action.

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
const SFX_STEP_SAND_PATH: String = "res://audio/sfx/step_sand.wav"
const SFX_STEP_GRASS_PATH: String = "res://audio/sfx/step_grass.wav"
const SFX_STEP_WATER_PATH: String = "res://audio/sfx/step_water.wav"
const SFX_LENS_CHIME_PATH: String = "res://audio/sfx/acoustic_lens_chime.wav"

var _coast_player: AudioStreamPlayer = null
var _forest_player: AudioStreamPlayer = null
var _step_player: AudioStreamPlayer = null
var _chime_player: AudioStreamPlayer = null

var _sfx_sand: AudioStream = null
var _sfx_grass: AudioStream = null
var _sfx_water: AudioStream = null
var _sfx_chime: AudioStream = null

var _ambience_ready: bool = false
var _rng: RandomNumberGenerator = RandomNumberGenerator.new()


func _ready() -> void:
	_rng.seed = 100731
	_init_living_world_audio()


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


func update_biome_ambience(world_y: float, wind_gust: float, in_interior: bool) -> void:
	if not _ambience_ready:
		return
	# Smooth crossfade across the Zone F ecotone (y = 1220 forest <-> y = 1980 coast)
	var coast_t: float = clampf((world_y - 1220.0) / 760.0, 0.0, 1.0)
	var forest_t: float = 1.0 - coast_t
	var interior_duck: float = 0.42 if in_interior else 1.0
	var gust_lift: float = 1.0 + clampf(wind_gust, 0.0, 1.0) * 0.28

	var coast_lin: float = clampf((0.06 + coast_t * 0.46) * interior_duck * gust_lift, 0.001, 0.85)
	var forest_lin: float = clampf((0.04 + forest_t * 0.44) * interior_duck, 0.001, 0.85)

	if _coast_player != null:
		_coast_player.volume_db = linear_to_db(coast_lin)
		if not _coast_player.playing:
			_coast_player.play()
	if _forest_player != null:
		_forest_player.volume_db = linear_to_db(forest_lin)
		if not _forest_player.playing:
			_forest_player.play()


func play_footstep(surface_kind: String, is_running: bool) -> void:
	if _step_player == null:
		return
	var chosen: AudioStream = _sfx_grass
	if surface_kind == "water":
		chosen = _sfx_water
	elif surface_kind == "sand":
		chosen = _sfx_sand
	if chosen == null:
		return
	_step_player.stream = chosen
	_step_player.pitch_scale = _rng.randf_range(0.92, 1.12) * (1.06 if is_running else 0.98)
	_step_player.volume_db = linear_to_db(0.42 if is_running else 0.28)
	_step_player.play()


func play_acoustic_lens_chime(resonance_boost: bool = false) -> void:
	if _chime_player == null or _sfx_chime == null:
		return
	_chime_player.stream = _sfx_chime
	_chime_player.pitch_scale = 1.08 if resonance_boost else _rng.randf_range(0.97, 1.04)
	_chime_player.volume_db = linear_to_db(0.38 if resonance_boost else 0.28)
	_chime_player.play()


func _init_living_world_audio() -> void:
	var atmo_bus: String = "Tier5_Atmosphere" if AudioServer.get_bus_index("Tier5_Atmosphere") != -1 else "Master"
	var world_bus: String = "Tier3_World" if AudioServer.get_bus_index("Tier3_World") != -1 else "Master"
	var action_bus: String = "Tier2_Action" if AudioServer.get_bus_index("Tier2_Action") != -1 else "Master"

	var coast_stream: AudioStream = _load_looping_wav(AMBIENT_COAST_PATH)
	var forest_stream: AudioStream = _load_looping_wav(AMBIENT_FOREST_PATH)
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

	_sfx_sand = _load_stream(SFX_STEP_SAND_PATH)
	_sfx_grass = _load_stream(SFX_STEP_GRASS_PATH)
	_sfx_water = _load_stream(SFX_STEP_WATER_PATH)
	_sfx_chime = _load_stream(SFX_LENS_CHIME_PATH)

	_step_player = AudioStreamPlayer.new()
	_step_player.name = "FootstepFoleyPlayer"
	_step_player.bus = world_bus
	add_child(_step_player)

	_chime_player = AudioStreamPlayer.new()
	_chime_player.name = "AcousticLensChimePlayer"
	_chime_player.bus = action_bus
	add_child(_chime_player)

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
