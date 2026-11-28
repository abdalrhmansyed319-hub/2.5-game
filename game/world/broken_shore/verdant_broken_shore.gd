class_name VerdantBrokenShore
extends Node2D
## VERDANT SIGNAL — Production V9.0 The Broken Shore (The Crash Site) Controller.
##
## Directly extends the real Godot 4.7.2 production world seamlessly south of
## VerdantLivingForest (continuous 2304x2880 world, zero teleport disconnect):
##   - 6 connected coastal subareas (Zone A Waking Shore -> Zone F Inland Gateway)
##   - Vast 8-depth animated alien ocean with coastal_ocean.gdshader, 8-frame surf
##     foam wash, offshore basalt sea stacks, wave-break spray & 5 translucent tidepools
##   - Handcrafted crashed ICV Meridian lander with multi-polygon hull collision,
##     open breached aft ramp & smooth walkable interior compartment cutaway
##   - 815 animated coastal grass/sedge/kelp tufts via 144-slot frustum-culled pool
##     with asynchronous sea-breeze waves, wind gusts & player footstep parting
##   - Live sand footprints & 4-frame shallow-water wading splashes (32-slot ring pool)
##   - 4 soaring Chime-Wing Gliders (fa_03) & 4 skittering Mirror-Shell Crabs (fa_02)
##   - Full Acoustic Field Lens (Q/RMB) & Field Sampling (E) integration

const SHORE_ORIGIN_Y: float = 1344.0
const WORLD_MIN_X: float = 330.0
const WORLD_MAX_X: float = 1974.0
const WORLD_MIN_Y: float = 290.0
const WORLD_MAX_Y: float = 2520.0

const UNIFIED_CAM_LIMIT_LEFT: int = 240
const UNIFIED_CAM_LIMIT_RIGHT: int = 2064
const UNIFIED_CAM_LIMIT_TOP: int = 200
const UNIFIED_CAM_LIMIT_BOTTOM: int = 2860

const DEFAULT_SPAWN_POS: Vector2 = Vector2(748.0, 2288.0)

const GRASS_POOL_SIZE: int = 144
const FOOTPRINT_POOL_SIZE: int = 32
const FOOTSTEP_BEND_DURATION: float = 0.48
const FOOTSTEP_BEND_RELEASE: float = 0.14
const WADE_MAX_DEPTH_PX: float = 40.0

const ECOSYSTEM_DATA_PATH: String = "res://assets/world/broken_shore/broken_shore_ecosystem_data.json"
const FOL_SWAY_SHADER: Shader = preload("res://shaders/foliage_sway.gdshader")
const TEX_COASTAL_TUFTS: Texture2D = preload("res://assets/world/broken_shore/animated/coastal_grass_tufts_24x24_6x8.png")
const TEX_AMBER_KELP: Texture2D = preload("res://assets/world/broken_shore/animated/amber_tide_kelp_48x40_4f.png")
const TEX_SURF_FOAM: Texture2D = preload("res://assets/world/broken_shore/animated/ocean_surf_foam_64x48_8f.png")
const TEX_COASTAL_FAUNA: Texture2D = preload("res://assets/world/broken_shore/animated/coastal_fauna_24x20_4x2.png")
const TEX_COASTAL_FX: Texture2D = preload("res://assets/world/broken_shore/animated/coastal_fx_decals_16x16_4x3.png")

const SPRITE_PATHS: Dictionary = {
	"meridian_wreck_hull": "res://assets/world/broken_shore/sprites/meridian_wreck_hull.png",
	"meridian_interior_bay": "res://assets/world/broken_shore/sprites/meridian_interior_bay.png",
	"meridian_debris_cowling": "res://assets/world/broken_shore/sprites/meridian_debris_cowling.png",
	"meridian_cargo_crate": "res://assets/world/broken_shore/sprites/meridian_cargo_crate.png",
	"meridian_rescue_beacon": "res://assets/world/broken_shore/sprites/meridian_rescue_beacon.png",
	"basalt_cliff_monolith": "res://assets/world/broken_shore/sprites/basalt_cliff_monolith.png",
	"basalt_sea_stack": "res://assets/world/broken_shore/sprites/basalt_sea_stack.png",
	"basalt_sea_stack_med": "res://assets/world/broken_shore/sprites/basalt_sea_stack_med.png",
	"coastal_boulder_cluster": "res://assets/world/broken_shore/sprites/coastal_boulder_cluster.png",
	"coastal_boulder_sm": "res://assets/world/broken_shore/sprites/coastal_boulder_sm.png",
	"coastal_driftwood_log": "res://assets/world/broken_shore/sprites/coastal_driftwood_log.png",
	"coastal_salt_shrub": "res://assets/world/broken_shore/sprites/coastal_salt_shrub.png",
	"coastal_salt_shrub_sm": "res://assets/world/broken_shore/sprites/coastal_salt_shrub_sm.png",
	"coastal_succulent": "res://assets/world/broken_shore/sprites/coastal_succulent.png",
	"coastal_succulent_sm": "res://assets/world/broken_shore/sprites/coastal_succulent_sm.png",
	"forest_tree_redwood": "res://assets/world/living_forest/sprites/full_tree_redwood.png",
	"forest_tree_rock": "res://assets/world/living_forest/sprites/full_tree_rock.png",
	"forest_fern_cluster": "res://assets/world/living_forest/sprites/fern_cluster.png",
}

var _time_sec: float = 0.0
var _mood_idx: int = 0
var _manual_gust_timer: float = 0.0
var _current_gust_strength: float = 0.0
var _debug_collision: bool = false
var _mounted_ysort: Node2D = null

var _in_meridian_interior: bool = false
var _interior_blend: float = 0.0
var _coastal_slow_count: int = 0
var _visible_tufts_drawn: int = 0
var _active_bent_tufts: int = 0
var _last_footprint_pos: Vector2 = Vector2.ZERO
var _footprint_side: int = 0
var _footprint_cursor: int = 0
var _scan_glow_boost: float = 0.0

var _shoreline_step: float = 32.0
var _shoreline_samples: PackedFloat32Array = PackedFloat32Array()
var _tidepools: Array[Dictionary] = []
var _scan_sites: Array[Dictionary] = []
var _warp_zones: Array[Dictionary] = []
var _tex_cache: Dictionary = {}
var _sway_materials: Array[ShaderMaterial] = []
var _solid_poly_cache: Array[Dictionary] = []
var _area_poly_cache: Array[Dictionary] = []

var _meridian_interior_sprite: Sprite2D = null
var _meridian_spark_sprite: Sprite2D = null
var _beacon_blink_sprite: Sprite2D = null

var _surf_sprites: Array[Sprite2D] = []
var _surf_phases: PackedFloat32Array = PackedFloat32Array()
var _break_sprites: Array[Sprite2D] = []
var _break_phases: PackedFloat32Array = PackedFloat32Array()
var _kelp_sprites: Array[Sprite2D] = []
var _kelp_phases: PackedFloat32Array = PackedFloat32Array()

var _tuft_x: PackedFloat32Array = PackedFloat32Array()
var _tuft_y: PackedFloat32Array = PackedFloat32Array()
var _tuft_row: PackedInt32Array = PackedInt32Array()
var _tuft_phase: PackedFloat32Array = PackedFloat32Array()
var _tuft_sens: PackedFloat32Array = PackedFloat32Array()
var _tuft_bend_timer: PackedFloat32Array = PackedFloat32Array()
var _tuft_bend_side: PackedInt32Array = PackedInt32Array()
var _active_bend_indices: Array[int] = []
var _tuft_pool: Array[Sprite2D] = []

var _glider_nodes: Array[Sprite2D] = []
var _glider_meta: Array[Dictionary] = []
var _crab_nodes: Array[Sprite2D] = []
var _crab_meta: Array[Dictionary] = []

var _decal_pool: Array[Sprite2D] = []
var _decal_life: PackedFloat32Array = PackedFloat32Array()
var _decal_max_life: PackedFloat32Array = PackedFloat32Array()
var _decal_kind: PackedInt32Array = PackedInt32Array() # 0 = sand footprint, 1 = wade splash

@onready var _shore_floor: Sprite2D = $BrokenShoreFloor
@onready var _surf_layer: Node2D = $ShoreSurfLayer
@onready var _ocean_props_layer: Node2D = $OceanPropsLayer
@onready var _kelp_layer: Node2D = $AmberKelpLayer
@onready var _footprint_layer: Node2D = $FootprintDecalLayer
@onready var _deep_water_barrier: StaticBody2D = $DeepWaterBarrier
@onready var _walkable_zones_layer: Node2D = $WalkableZonesLayer
@onready var _meridian_beacon_glow: Sprite2D = $CoastalAtmosphereLayer/MeridianBeaconGlow
@onready var _rescue_beacon_glow: Sprite2D = $CoastalAtmosphereLayer/RescueBeaconGlow
@onready var _cockpit_cyan_glow: Sprite2D = $CoastalAtmosphereLayer/CockpitCyanGlow
@onready var _interior_console_glow: Sprite2D = $CoastalAtmosphereLayer/InteriorConsoleGlow
@onready var _tidepool_amber_glow: Sprite2D = $CoastalAtmosphereLayer/TidepoolAmberGlow
@onready var _sea_spray_particles: CPUParticles2D = $CoastalAtmosphereLayer/SeaSprayParticles
@onready var _seed_particles: CPUParticles2D = $CoastalAtmosphereLayer/CoastalSeedParticles
@onready var _glider_layer: Node2D = $GliderSkyLayer
@onready var _debug_drawer: Node2D = $CollisionDebugDrawer


func _ready() -> void:
	_debug_drawer.draw.connect(_on_debug_draw)
	_init_footprint_pool()


func mount_into_unified_ysort(ysort_world: Node2D) -> void:
	if _mounted_ysort != null:
		return
	_mounted_ysort = ysort_world
	_load_and_build_broken_shore()


func apply_lighting_mood(mood_idx: int) -> void:
	_mood_idx = posmod(mood_idx, 3)
	var floor_mat: Material = _shore_floor.material
	if floor_mat is ShaderMaterial:
		(floor_mat as ShaderMaterial).set_shader_parameter(
			"twilight_glow",
			1.0 if _mood_idx == 2 else (0.35 if _mood_idx == 1 else 0.0)
		)


func trigger_wind_gust(duration_sec: float = 3.0) -> void:
	_manual_gust_timer = maxf(_manual_gust_timer, duration_sec)


func set_collision_debug(enabled: bool) -> void:
	_debug_collision = enabled
	_debug_drawer.queue_redraw()


func toggle_collision_debug() -> bool:
	_debug_collision = not _debug_collision
	_debug_drawer.queue_redraw()
	return _debug_collision


func is_position_in_broken_shore(world_pos: Vector2) -> bool:
	return world_pos.y >= SHORE_ORIGIN_Y + 48.0


func is_in_meridian_interior() -> bool:
	return _in_meridian_interior


func get_total_tuft_count() -> int:
	return _tuft_x.size()


func get_visible_tuft_count() -> int:
	return _visible_tufts_drawn


func get_active_bent_tuft_count() -> int:
	return _active_bent_tufts


func get_fauna_count() -> int:
	return _glider_nodes.size() + _crab_nodes.size()


func get_warp_zones() -> Array[Dictionary]:
	return _warp_zones


func get_warp_point(index_zero_based: int) -> Dictionary:
	if index_zero_based < 0 or index_zero_based >= _warp_zones.size():
		return {}
	return _warp_zones[index_zero_based]


func get_waterline_y(world_x: float) -> float:
	if _shoreline_samples.is_empty():
		return 2408.0
	var fx: float = clampf(world_x / _shoreline_step, 0.0, float(_shoreline_samples.size() - 1))
	var i0: int = int(floor(fx))
	var i1: int = mini(i0 + 1, _shoreline_samples.size() - 1)
	var t: float = fx - float(i0)
	return lerpf(_shoreline_samples[i0], _shoreline_samples[i1], t)


func is_in_tidepool(world_pos: Vector2) -> bool:
	for tp: Dictionary in _tidepools:
		var tx: float = _dict_float(tp, "x", 0.0)
		var ty: float = _dict_float(tp, "y", 0.0)
		var rx: float = maxf(1.0, _dict_float(tp, "rx", 40.0))
		var ry: float = maxf(1.0, _dict_float(tp, "ry", 18.0))
		var dx: float = (world_pos.x - tx) / rx
		var dy: float = (world_pos.y - ty) / ry
		if (dx * dx + dy * dy) <= 0.92:
			return true
	return false


func get_surface_type_at(world_pos: Vector2) -> String:
	if _in_meridian_interior:
		return "spacecraft_grating"
	if is_in_tidepool(world_pos):
		return "shallow_water"
	var sy: float = get_waterline_y(world_pos.x)
	if world_pos.y >= sy - 2.0:
		return "shallow_water"
	if world_pos.y >= sy - 22.0:
		return "wet_sand"
	if world_pos.y >= sy - 54.0:
		return "damp_sand"
	if world_pos.y >= 1940.0:
		return "dry_sand"
	if _coastal_slow_count > 0:
		return "coastal_shrub"
	return "coastal_grass"


func compute_terrain_speed_multiplier(world_pos: Vector2) -> float:
	if _in_meridian_interior:
		return 0.92
	var surf: String = get_surface_type_at(world_pos)
	match surf:
		"shallow_water":
			return 0.84
		"wet_sand":
			return 0.94
		"damp_sand":
			return 0.96
		"coastal_shrub":
			return 0.82
		_:
			return 1.0


func get_zone_status_label(world_pos: Vector2) -> String:
	if _in_meridian_interior:
		return "Zone B2: ICV Meridian Aft Bay"
	if world_pos.y < 1620.0:
		return "Zone F: Inland Gateway"
	if world_pos.y < 1980.0:
		return "Zone E: Coastal Veg Belt"
	if world_pos.x < 710.0:
		return "Zone D: Basalt Shore"
	if world_pos.x > 1580.0:
		return "Zone C: Tidepool Coast"
	if world_pos.x > 980.0 and world_pos.x < 1560.0:
		return "Zone B: Crash Impact Field"
	return "Zone A: The Waking Shore"


func scan_coastal_sites(world_pos: Vector2, scan_radius: float) -> PackedStringArray:
	var hits: PackedStringArray = PackedStringArray()
	for site: Dictionary in _scan_sites:
		var interior_only: bool = bool(site.get("interiorOnly", false))
		if interior_only and not _in_meridian_interior:
			continue
		var sx: float = _dict_float(site, "x", 0.0)
		var sy: float = _dict_float(site, "y", 0.0)
		var sr: float = _dict_float(site, "radius", 96.0)
		if world_pos.distance_to(Vector2(sx, sy)) <= maxf(scan_radius, sr):
			var label: String = _dict_str(site, "name", "Coastal Anomaly")
			if not hits.has(label):
				hits.append(label)
	if not hits.is_empty():
		_scan_glow_boost = 1.4
	return hits


func sample_nearest_coastal_feature(world_pos: Vector2) -> String:
	var best_name: String = ""
	var best_dist: float = 128.0
	for site: Dictionary in _scan_sites:
		var interior_only: bool = bool(site.get("interiorOnly", false))
		if interior_only and not _in_meridian_interior:
			continue
		var sx: float = _dict_float(site, "x", 0.0)
		var sy: float = _dict_float(site, "y", 0.0)
		var d: float = world_pos.distance_to(Vector2(sx, sy))
		if d < best_dist:
			best_dist = d
			best_name = _dict_str(site, "name", "")
	return best_name


func step_broken_shore(delta: float, player: PlayerController) -> void:
	_time_sec += delta
	if _manual_gust_timer > 0.0:
		_manual_gust_timer = maxf(0.0, _manual_gust_timer - delta)
	if _scan_glow_boost > 0.0:
		_scan_glow_boost = maxf(0.0, _scan_glow_boost - delta * 1.1)

	# Asynchronous sea-breeze + periodic gusts
	var periodic_gust: float = maxf(0.0, sin(_time_sec * 0.48 - 0.8) - 0.62) / 0.38
	var manual_gust: float = clampf(_manual_gust_timer / 1.5, 0.0, 1.0)
	_current_gust_strength = maxf(periodic_gust * 0.85, manual_gust)

	var player_pos: Vector2 = player.global_position
	var floor_mat: Material = _shore_floor.material
	if floor_mat is ShaderMaterial:
		var sm: ShaderMaterial = floor_mat as ShaderMaterial
		sm.set_shader_parameter("player_world_pos", player_pos)
		sm.set_shader_parameter("wind_gust", _current_gust_strength)

	for m: ShaderMaterial in _sway_materials:
		m.set_shader_parameter("gust_factor", _current_gust_strength)

	# Smooth breached ICV Meridian cutaway interior reveal!
	var target_blend: float = 1.0 if _in_meridian_interior else 0.0
	_interior_blend = move_toward(_interior_blend, target_blend, delta * 5.2)
	if _meridian_interior_sprite != null:
		_meridian_interior_sprite.visible = _interior_blend > 0.01
		_meridian_interior_sprite.modulate = Color(1.0, 1.0, 1.0, _interior_blend)

	_update_ocean_surf_and_kelp()
	_update_crash_fx_and_atmosphere()
	_update_coastal_tufts(delta, player)
	_update_coastal_fauna(delta, player_pos)
	_update_footprints_and_splashes(delta, player)


func _load_and_build_broken_shore() -> void:
	if not FileAccess.file_exists(ECOSYSTEM_DATA_PATH):
		push_error("Missing V9.0 Broken Shore ecosystem JSON: " + ECOSYSTEM_DATA_PATH)
		return
	var raw_text: String = FileAccess.get_file_as_string(ECOSYSTEM_DATA_PATH)
	var parsed: Variant = JSON.parse_string(raw_text)
	if not (parsed is Dictionary):
		push_error("Invalid JSON in " + ECOSYSTEM_DATA_PATH)
		return
	var data: Dictionary = parsed as Dictionary

	_shoreline_step = _dict_float(data, "shoreline_step_px", 32.0)
	var samples_v: Variant = data.get("shoreline_y_samples", [])
	if samples_v is Array:
		for sv: Variant in (samples_v as Array):
			_shoreline_samples.append(float(sv))

	var tp_v: Variant = data.get("tidepools", [])
	if tp_v is Array:
		for item: Variant in (tp_v as Array):
			if item is Dictionary:
				_tidepools.append(item as Dictionary)

	var scan_v: Variant = data.get("scan_sites", [])
	if scan_v is Array:
		for item: Variant in (scan_v as Array):
			if item is Dictionary:
				_scan_sites.append(item as Dictionary)

	var warp_v: Variant = data.get("warp_zones", [])
	if warp_v is Array:
		for item: Variant in (warp_v as Array):
			if item is Dictionary:
				var d: Dictionary = item as Dictionary
				_warp_zones.append({
					"name": _dict_str(d, "name", "Coastal Zone"),
					"pos": Vector2(_dict_float(d, "x", 748.0), _dict_float(d, "y", 2288.0)),
					"dir": _dict_int(d, "dir", 2),
				})

	_build_deep_water_barrier()
	_build_shoreline_surf_ribbons()
	_build_amber_kelp(data.get("amber_kelp", []))
	_build_props_and_interior(data.get("props", []))
	_build_walkable_zones(data.get("walkable_zones", []))
	_build_tuft_pool(data.get("tufts", []))
	_build_coastal_fauna(data.get("fauna", []))
	_debug_drawer.queue_redraw()


func _build_deep_water_barrier() -> void:
	if _shoreline_samples.size() < 2:
		return
	# Smooth multi-segment organic barrier along waterlineY(x) + WADE_MAX_DEPTH_PX
	# Lets Mara wade ~38px into translucent turquoise shallows while naturally blocking deep ocean!
	for i: int in range(_shoreline_samples.size() - 1):
		var x0: float = float(i) * _shoreline_step
		var x1: float = float(i + 1) * _shoreline_step
		var y0: float = _shoreline_samples[i] + WADE_MAX_DEPTH_PX
		var y1: float = _shoreline_samples[i + 1] + WADE_MAX_DEPTH_PX
		var poly := PackedVector2Array([
			Vector2(x0, y0),
			Vector2(x1, y1),
			Vector2(x1, y1 + 96.0),
			Vector2(x0, y0 + 96.0),
		])
		var col := CollisionPolygon2D.new()
		col.name = "DeepOceanSeg_%02d" % i
		col.polygon = poly
		_deep_water_barrier.add_child(col)
		_solid_poly_cache.append({"pts": poly, "role": "deep_water"})


func _build_shoreline_surf_ribbons() -> void:
	for gx: int in range(32, 2272, 52):
		var sy: float = get_waterline_y(float(gx))
		var sp := Sprite2D.new()
		sp.texture = TEX_SURF_FOAM
		sp.hframes = 8
		sp.vframes = 2
		sp.frame_coords = Vector2i(int(floor(float(gx) / 52.0)) % 8, 0) # Row 0 ONLY: lacy shoreline surf wash!
		sp.position = Vector2(float(gx), sy + 4.0)
		_surf_layer.add_child(sp)
		_surf_sprites.append(sp)
		_surf_phases.append(float(gx) * 0.037)


func _build_amber_kelp(kelp_raw: Variant) -> void:
	if not (kelp_raw is Array):
		return
	for item: Variant in (kelp_raw as Array):
		if not (item is Dictionary):
			continue
		var d: Dictionary = item as Dictionary
		var sp := Sprite2D.new()
		sp.texture = TEX_AMBER_KELP
		sp.hframes = 4
		sp.vframes = 1
		sp.position = Vector2(_dict_float(d, "x", 1756.0), _dict_float(d, "y", 2196.0) - 6.0)
		_kelp_layer.add_child(sp)
		_kelp_sprites.append(sp)
		_kelp_phases.append(_dict_float(d, "phase", 0.0))


func _build_props_and_interior(props_raw: Variant) -> void:
	if not (props_raw is Array):
		return
	for item: Variant in (props_raw as Array):
		if not (item is Dictionary):
			continue
		var d: Dictionary = item as Dictionary
		var pid: String = _dict_str(d, "id", "prop")
		var skey: String = _dict_str(d, "spriteKey", "")
		var flip_h: bool = skey.ends_with("_flip")
		var base_key: String = skey.substr(0, skey.length() - 5) if flip_h else skey
		var tex: Texture2D = _load_sprite_tex(base_key)
		if tex == null:
			continue

		var pos := Vector2(_dict_float(d, "x", 0.0), _dict_float(d, "y", 0.0))
		var off_y: float = _dict_float(d, "offsetY", 0.0)
		var layer_str: String = _dict_str(d, "layer", "ysort")
		var colliders_v: Variant = d.get("colliders", [])
		var has_colliders: bool = (colliders_v is Array) and not (colliders_v as Array).is_empty()

		var sp := Sprite2D.new()
		sp.name = "Sprite2D"
		sp.texture = tex
		sp.flip_h = flip_h
		sp.offset = Vector2(0.0, off_y)

		var sway_kind: int = _dict_int(d, "swayKind", 0)
		if sway_kind > 0:
			var sm := ShaderMaterial.new()
			sm.shader = FOL_SWAY_SHADER
			sm.set_shader_parameter("sway_kind", sway_kind)
			sm.set_shader_parameter("sway_amp", _dict_float(d, "swayAmp", 0.9))
			sm.set_shader_parameter("sway_speed", 1.15)
			sm.set_shader_parameter("sway_phase", _dict_float(d, "swayPhase", 0.0))
			sm.set_shader_parameter("world_x", pos.x)
			sp.material = sm
			_sway_materials.append(sm)

		if layer_str == "ocean_prop":
			sp.name = pid
			sp.position = pos
			_ocean_props_layer.add_child(sp)
			if bool(d.get("waveBreakCollar", false)):
				var collar := Sprite2D.new()
				collar.texture = TEX_SURF_FOAM
				collar.hframes = 8
				collar.vframes = 2
				collar.frame_coords = Vector2i(0, 1) # Row 1 ONLY: rock wave-break collar!
				collar.position = Vector2(pos.x, pos.y + 4.0)
				_surf_layer.add_child(collar)
				_break_sprites.append(collar)
				_break_phases.append(pos.x * 0.023)
		elif has_colliders:
			var body := StaticBody2D.new()
			body.name = pid
			body.position = pos
			body.collision_layer = 1
			body.collision_mask = 0
			body.add_child(sp)
			for cv: Variant in (colliders_v as Array):
				if not (cv is Dictionary):
					continue
				var cd: Dictionary = cv as Dictionary
				var pts_v: Variant = cd.get("points", [])
				if not (pts_v is Array):
					continue
				var local_poly := PackedVector2Array()
				var world_poly := PackedVector2Array()
				for pv: Variant in (pts_v as Array):
					if pv is Array:
						var pa: Array = pv as Array
						if pa.size() >= 2:
							var lp := Vector2(_var_float(pa[0]), _var_float(pa[1]))
							local_poly.append(lp)
							world_poly.append(pos + lp)
				if local_poly.size() >= 3:
					var cp := CollisionPolygon2D.new()
					cp.name = _dict_str(cd, "name", "Col")
					cp.polygon = local_poly
					body.add_child(cp)
					_solid_poly_cache.append({"pts": world_poly, "role": _dict_str(cd, "role", "solid_rock")})
			_mounted_ysort.add_child(body)
		else:
			sp.name = pid
			sp.position = pos
			_mounted_ysort.add_child(sp)

		# Mount ICV Meridian breached interior cutaway + live crash sparks right at y = 2193!
		if pid == "icv_meridian_wreck":
			var bay_tex: Texture2D = _load_sprite_tex("meridian_interior_bay")
			if bay_tex != null:
				_meridian_interior_sprite = Sprite2D.new()
				_meridian_interior_sprite.name = "MeridianInteriorCutaway"
				_meridian_interior_sprite.texture = bay_tex
				_meridian_interior_sprite.position = Vector2(pos.x + 12.0, pos.y + 1.0)
				_meridian_interior_sprite.offset = Vector2(0.0, -55.0)
				_meridian_interior_sprite.visible = false
				_meridian_interior_sprite.modulate = Color(1.0, 1.0, 1.0, 0.0)
				_mounted_ysort.add_child(_meridian_interior_sprite)

			_meridian_spark_sprite = Sprite2D.new()
			_meridian_spark_sprite.name = "MeridianHullSparks"
			_meridian_spark_sprite.texture = TEX_COASTAL_FX
			_meridian_spark_sprite.hframes = 4
			_meridian_spark_sprite.vframes = 3
			_meridian_spark_sprite.frame_coords = Vector2i(0, 2)
			_meridian_spark_sprite.position = Vector2(pos.x - 16.0, pos.y + 4.0)
			_meridian_spark_sprite.offset = Vector2(0.0, -42.0)
			_mounted_ysort.add_child(_meridian_spark_sprite)
		elif pid == "meridian_rescue_beacon":
			_beacon_blink_sprite = Sprite2D.new()
			_beacon_blink_sprite.name = "RescueBeaconStrobe"
			_beacon_blink_sprite.texture = TEX_COASTAL_FX
			_beacon_blink_sprite.hframes = 4
			_beacon_blink_sprite.vframes = 3
			_beacon_blink_sprite.frame_coords = Vector2i(1, 2)
			_beacon_blink_sprite.position = Vector2(pos.x, pos.y + 2.0)
			_beacon_blink_sprite.offset = Vector2(0.0, -34.0)
			_mounted_ysort.add_child(_beacon_blink_sprite)


func _build_walkable_zones(zones_raw: Variant) -> void:
	if not (zones_raw is Array):
		return
	for item: Variant in (zones_raw as Array):
		if not (item is Dictionary):
			continue
		var d: Dictionary = item as Dictionary
		var role: String = _dict_str(d, "role", "")
		var pos := Vector2(_dict_float(d, "x", 0.0), _dict_float(d, "y", 0.0))
		var pts_v: Variant = d.get("points", [])
		if not (pts_v is Array):
			continue
		var local_poly := PackedVector2Array()
		var world_poly := PackedVector2Array()
		for pv: Variant in (pts_v as Array):
			if pv is Array:
				var pa: Array = pv as Array
				if pa.size() >= 2:
					var lp := Vector2(_var_float(pa[0]), _var_float(pa[1]))
					local_poly.append(lp)
					world_poly.append(pos + lp)
		if local_poly.size() < 3:
			continue
		var area := Area2D.new()
		area.name = _dict_str(d, "id", "Zone")
		area.position = pos
		area.collision_layer = 0
		area.collision_mask = 1
		var cp := CollisionPolygon2D.new()
		cp.polygon = local_poly
		area.add_child(cp)
		area.body_entered.connect(_on_zone_entered.bind(role))
		area.body_exited.connect(_on_zone_exited.bind(role))
		_walkable_zones_layer.add_child(area)
		_area_poly_cache.append({"pts": world_poly, "role": role})


func _build_tuft_pool(tufts_raw: Variant) -> void:
	if tufts_raw is Array:
		for item: Variant in (tufts_raw as Array):
			if not (item is Dictionary):
				continue
			var d: Dictionary = item as Dictionary
			_tuft_x.append(_dict_float(d, "x", 0.0))
			_tuft_y.append(_dict_float(d, "y", 0.0))
			_tuft_row.append(clampi(_dict_int(d, "row", 0), 0, 7))
			_tuft_phase.append(_dict_float(d, "phase", 0.0))
			_tuft_sens.append(_dict_float(d, "sens", 1.0))
			_tuft_bend_timer.append(0.0)
			_tuft_bend_side.append(0)

	for i: int in range(GRASS_POOL_SIZE):
		var sp := Sprite2D.new()
		sp.name = "CoastalTuftPool_%03d" % i
		sp.texture = TEX_COASTAL_TUFTS
		sp.hframes = 6
		sp.vframes = 8
		sp.offset = Vector2(0.0, -9.0)
		sp.visible = false
		_mounted_ysort.add_child(sp)
		_tuft_pool.append(sp)


func _build_coastal_fauna(fauna_raw: Variant) -> void:
	if not (fauna_raw is Array):
		return
	for item: Variant in (fauna_raw as Array):
		if not (item is Dictionary):
			continue
		var d: Dictionary = item as Dictionary
		var kind: int = _dict_int(d, "kind", 0)
		var sp := Sprite2D.new()
		sp.texture = TEX_COASTAL_FAUNA
		sp.hframes = 4
		sp.vframes = 2
		sp.frame_coords = Vector2i(0, kind)
		var meta: Dictionary = {
			"x": _dict_float(d, "x", 780.0),
			"y": _dict_float(d, "y", 2300.0),
			"rx": _dict_float(d, "rx", 64.0),
			"ry": _dict_float(d, "ry", 24.0),
			"speed": _dict_float(d, "speed", 0.5),
			"phase": _dict_float(d, "phase", 0.0),
		}
		if kind == 0:
			_glider_layer.add_child(sp)
			_glider_nodes.append(sp)
			_glider_meta.append(meta)
		else:
			sp.offset = Vector2(0.0, -6.0)
			_mounted_ysort.add_child(sp)
			_crab_nodes.append(sp)
			_crab_meta.append(meta)


func _init_footprint_pool() -> void:
	for i: int in range(FOOTPRINT_POOL_SIZE):
		var sp := Sprite2D.new()
		sp.name = "CoastalDecal_%02d" % i
		sp.texture = TEX_COASTAL_FX
		sp.hframes = 4
		sp.vframes = 3
		sp.visible = false
		_footprint_layer.add_child(sp)
		_decal_pool.append(sp)
		_decal_life.append(0.0)
		_decal_max_life.append(1.0)
		_decal_kind.append(0)


func _update_ocean_surf_and_kelp() -> void:
	var surf_rate: float = 3.2 + _current_gust_strength * 1.4
	for i: int in range(_surf_sprites.size()):
		var f: int = int(floor(_time_sec * surf_rate + _surf_phases[i])) % 8
		_surf_sprites[i].frame_coords = Vector2i(f, 0)
	for i: int in range(_break_sprites.size()):
		var f: int = int(floor(_time_sec * (surf_rate * 0.9) + _break_phases[i])) % 8
		_break_sprites[i].frame_coords = Vector2i(f, 1)
	for i: int in range(_kelp_sprites.size()):
		var f: int = int(floor(_time_sec * 2.4 + _kelp_phases[i])) % 4
		_kelp_sprites[i].frame_coords = Vector2i(f, 0)


func _update_crash_fx_and_atmosphere() -> void:
	var twilight_boost: float = 1.65 if _mood_idx == 2 else (1.2 if _mood_idx == 1 else 1.0)
	var strobe: float = 0.5 + 0.5 * sin(_time_sec * 3.8)
	var spark_pulse: float = fmod(_time_sec * 1.7, 3.2)

	_meridian_beacon_glow.modulate = Color(1.0, 0.72, 0.34, (0.22 + strobe * 0.48) * twilight_boost)
	_rescue_beacon_glow.modulate = Color(1.0, 0.76, 0.36, (0.20 + (1.0 - strobe) * 0.54) * twilight_boost)
	_cockpit_cyan_glow.modulate = Color(0.42, 0.94, 0.92, (0.24 + _scan_glow_boost * 0.35) * twilight_boost)
	_interior_console_glow.modulate = Color(0.48, 0.96, 0.94, _interior_blend * (0.48 + 0.14 * sin(_time_sec * 5.2)))
	_tidepool_amber_glow.modulate = Color(0.96, 0.72, 0.36, (0.14 + 0.10 * sin(_time_sec * 1.8) + _scan_glow_boost * 0.3) * twilight_boost)

	if _meridian_spark_sprite != null:
		var spark_active: bool = spark_pulse < 0.38
		_meridian_spark_sprite.visible = spark_active
		if spark_active:
			_meridian_spark_sprite.frame_coords = Vector2i(0 if spark_pulse < 0.19 else 2, 2)
	if _beacon_blink_sprite != null:
		_beacon_blink_sprite.visible = strobe > 0.42
		_beacon_blink_sprite.frame_coords = Vector2i(1 if strobe > 0.72 else 3, 2)

	_sea_spray_particles.initial_velocity_max = 26.0 + _current_gust_strength * 28.0
	_seed_particles.initial_velocity_max = 24.0 + _current_gust_strength * 30.0


func _update_coastal_tufts(delta: float, player: PlayerController) -> void:
	var n: int = _tuft_x.size()
	if n == 0:
		return

	var ppos: Vector2 = player.global_position
	var pvel: Vector2 = player.velocity
	var moving: bool = pvel.length_squared() > 25.0

	# Decay active bent tufts
	var bi: int = _active_bend_indices.size() - 1
	while bi >= 0:
		var tidx: int = _active_bend_indices[bi]
		var rem: float = _tuft_bend_timer[tidx] - delta
		if rem <= 0.0:
			_tuft_bend_timer[tidx] = 0.0
			_tuft_bend_side[tidx] = 0
			_active_bend_indices.remove_at(bi)
		else:
			_tuft_bend_timer[tidx] = rem
		bi -= 1
	_active_bent_tufts = _active_bend_indices.size()

	# Frustum bounds around active camera (640x360 + generous margin)
	var cam: Camera2D = player.get_camera()
	var cpos: Vector2 = cam.get_screen_center_position() if cam != null else ppos
	var min_x: float = cpos.x - 360.0
	var max_x: float = cpos.x + 360.0
	var min_y: float = cpos.y - 224.0
	var max_y: float = cpos.y + 224.0

	var used: int = 0
	for i: int in range(n):
		var tx: float = _tuft_x[i]
		var ty: float = _tuft_y[i]
		if tx < min_x or tx > max_x or ty < min_y or ty > max_y:
			continue

		if moving:
			var dx: float = tx - ppos.x
			var dy: float = ty - ppos.y
			if (dx * dx + dy * dy) < 484.0: # 22px parting radius!
				if _tuft_bend_timer[i] <= 0.0:
					_active_bend_indices.append(i)
				_tuft_bend_timer[i] = FOOTSTEP_BEND_DURATION
				_tuft_bend_side[i] = -1 if dx < 0.0 else 1

		if used >= GRASS_POOL_SIZE:
			continue

		var sp: Sprite2D = _tuft_pool[used]
		used += 1
		sp.visible = true
		sp.position = Vector2(tx, ty)

		var col_idx: int = 1
		var bend_rem: float = _tuft_bend_timer[i]
		if bend_rem > FOOTSTEP_BEND_RELEASE:
			col_idx = 0 if _tuft_bend_side[i] < 0 else 5
		elif bend_rem > 0.0:
			col_idx = 1 if _tuft_bend_side[i] < 0 else 4
		else:
			var wave: float = sin(_time_sec * (2.1 + _current_gust_strength * 1.3) + tx * 0.018 + ty * 0.012 + _tuft_phase[i])
			var gust_bias: float = _current_gust_strength * 1.45 * _tuft_sens[i]
			var sway: float = wave * _tuft_sens[i] + gust_bias
			if sway < -0.55:
				col_idx = 0
			elif sway < 0.25:
				col_idx = 1
			elif sway < 0.85:
				col_idx = 2
			elif sway < 1.35:
				col_idx = 3
			else:
				col_idx = 4

		sp.frame_coords = Vector2i(col_idx, _tuft_row[i])

	for j: int in range(used, GRASS_POOL_SIZE):
		_tuft_pool[j].visible = false
	_visible_tufts_drawn = used


func _update_coastal_fauna(delta: float, player_pos: Vector2) -> void:
	# 4 Soaring Chime-Wing Gliders (fa_03) circling organically over ocean & shore!
	for i: int in range(_glider_nodes.size()):
		var m: Dictionary = _glider_meta[i]
		var ang: float = _time_sec * _dict_float(m, "speed", 0.4) + _dict_float(m, "phase", 0.0)
		var cx: float = _dict_float(m, "x", 900.0)
		var cy: float = _dict_float(m, "y", 2300.0)
		var rx: float = _dict_float(m, "rx", 120.0)
		var ry: float = _dict_float(m, "ry", 50.0)
		var nx: float = cx + cos(ang) * rx
		var ny: float = cy + sin(ang * 1.5) * ry - 52.0
		var sp: Sprite2D = _glider_nodes[i]
		sp.flip_h = (-sin(ang) < 0.0)
		sp.position = Vector2(nx, ny)
		sp.frame_coords = Vector2i(int(floor(_time_sec * 5.2 + float(i))) % 4, 0)

	# 4 Mirror-Shell Crabs (fa_02) skittering playfully near tidepools & dodging Mara!
	for i: int in range(_crab_nodes.size()):
		var m: Dictionary = _crab_meta[i]
		var ang: float = _time_sec * _dict_float(m, "speed", 0.9) + _dict_float(m, "phase", 0.0)
		var cx: float = _dict_float(m, "x", 1742.0)
		var cy: float = _dict_float(m, "y", 2182.0)
		var rx: float = _dict_float(m, "rx", 28.0)
		var ry: float = _dict_float(m, "ry", 10.0)
		var pos := Vector2(cx + sin(ang) * rx, cy + cos(ang * 2.0) * ry)
		var to_crab: Vector2 = pos - player_pos
		if to_crab.length_squared() < 2304.0 and to_crab.length_squared() > 1.0:
			pos += to_crab.normalized() * (14.0 * (1.0 - to_crab.length() / 48.0))
		var sp: Sprite2D = _crab_nodes[i]
		sp.position = pos
		sp.frame_coords = Vector2i(int(floor(_time_sec * 6.5 + float(i))) % 4, 1)
	# delta kept intentionally typed for future crab velocity easing
	if delta < 0.0:
		return


func _update_footprints_and_splashes(delta: float, player: PlayerController) -> void:
	# Age & animate existing decals
	for i: int in range(FOOTPRINT_POOL_SIZE):
		if _decal_life[i] <= 0.0:
			continue
		_decal_life[i] -= delta
		var sp: Sprite2D = _decal_pool[i]
		if _decal_life[i] <= 0.0:
			_decal_life[i] = 0.0
			sp.visible = false
			continue
		var frac: float = clampf(_decal_life[i] / maxf(0.05, _decal_max_life[i]), 0.0, 1.0)
		if _decal_kind[i] == 1:
			var f: int = clampi(int(floor((1.0 - frac) * 4.0)), 0, 3)
			sp.frame_coords = Vector2i(f, 1)
			sp.modulate = Color(1.0, 1.0, 1.0, frac * 0.92)
		else:
			sp.modulate = Color(1.0, 1.0, 1.0, minf(1.0, frac * 1.4) * 0.72)

	# Stamp new sand footprints or shallow-water wade splashes when walking on Broken Shore!
	var ppos: Vector2 = player.global_position
	if not is_position_in_broken_shore(ppos) or _in_meridian_interior:
		return
	if player.velocity.length_squared() < 100.0:
		return
	if _last_footprint_pos != Vector2.ZERO and ppos.distance_to(_last_footprint_pos) < 16.0:
		return

	_last_footprint_pos = ppos
	_footprint_side = 1 - _footprint_side
	var surf: String = get_surface_type_at(ppos)
	var idx: int = _footprint_cursor
	_footprint_cursor = (_footprint_cursor + 1) % FOOTPRINT_POOL_SIZE
	var decal: Sprite2D = _decal_pool[idx]
	var side_off := Vector2(-3.0 if _footprint_side == 0 else 3.0, 1.0)

	if surf == "shallow_water":
		decal.position = ppos + side_off
		decal.frame_coords = Vector2i(0, 1)
		decal.modulate = Color(1.0, 1.0, 1.0, 0.92)
		decal.visible = true
		_decal_kind[idx] = 1
		_decal_max_life[idx] = 0.42
		_decal_life[idx] = 0.42
	elif surf == "dry_sand" or surf == "damp_sand" or surf == "wet_sand":
		decal.position = ppos + side_off
		var col: int = 0 if surf == "dry_sand" else (1 if surf == "damp_sand" else 2)
		decal.frame_coords = Vector2i(col, 0)
		decal.modulate = Color(1.0, 1.0, 1.0, 0.72)
		decal.visible = true
		_decal_kind[idx] = 0
		_decal_max_life[idx] = 5.5
		_decal_life[idx] = 5.5


func _on_zone_entered(body: Node2D, role: String) -> void:
	if not (body is PlayerController):
		return
	if role == "meridian_interior":
		_in_meridian_interior = true
	elif role == "coastal_brush_slow":
		_coastal_slow_count += 1


func _on_zone_exited(body: Node2D, role: String) -> void:
	if not (body is PlayerController):
		return
	if role == "meridian_interior":
		_in_meridian_interior = false
	elif role == "coastal_brush_slow":
		_coastal_slow_count = maxi(0, _coastal_slow_count - 1)


func _on_debug_draw() -> void:
	if not _debug_collision:
		return
	for item: Dictionary in _solid_poly_cache:
		var pts_v: Variant = item.get("pts", PackedVector2Array())
		if not (pts_v is PackedVector2Array):
			continue
		var pts: PackedVector2Array = pts_v as PackedVector2Array
		var role: String = _dict_str(item, "role", "solid_rock")
		var c: Color = (
			Color(0.22, 0.68, 1.0, 0.36) if role == "deep_water"
			else Color(1.0, 0.42, 0.22, 0.44) if role == "solid_hull"
			else Color(1.0, 0.28, 0.35, 0.36)
		)
		_debug_drawer.draw_colored_polygon(pts, c)
		_debug_drawer.draw_polyline(pts, Color(c.r, c.g, c.b, 0.92), 1.5, false)

	for item: Dictionary in _area_poly_cache:
		var pts_v: Variant = item.get("pts", PackedVector2Array())
		if not (pts_v is PackedVector2Array):
			continue
		var pts: PackedVector2Array = pts_v as PackedVector2Array
		var role: String = _dict_str(item, "role", "")
		var c: Color = (
			Color(0.32, 0.98, 0.92, 0.34) if role == "meridian_interior"
			else Color(0.95, 0.85, 0.28, 0.26)
		)
		_debug_drawer.draw_colored_polygon(pts, c)
		_debug_drawer.draw_polyline(pts, Color(c.r, c.g, c.b, 0.9), 1.5, false)


func _load_sprite_tex(key: String) -> Texture2D:
	if _tex_cache.has(key):
		var cached: Variant = _tex_cache[key]
		return cached as Texture2D if cached is Texture2D else null
	var p: String = _dict_str(SPRITE_PATHS, key, "")
	if p.is_empty() or not ResourceLoader.exists(p):
		return null
	var res: Resource = ResourceLoader.load(p)
	if res is Texture2D:
		_tex_cache[key] = res
		return res as Texture2D
	return null


func _var_float(v: Variant, fallback: float = 0.0) -> float:
	return float(v) if (v is float or v is int) else fallback


func _dict_float(d: Dictionary, key: String, fallback: float) -> float:
	var v: Variant = d.get(key, fallback)
	return float(v) if (v is float or v is int) else fallback


func _dict_int(d: Dictionary, key: String, fallback: int) -> int:
	var v: Variant = d.get(key, fallback)
	return int(v) if (v is int or v is float) else fallback


func _dict_str(d: Dictionary, key: String, fallback: String) -> String:
	var v: Variant = d.get(key, fallback)
	return str(v) if v != null else fallback
