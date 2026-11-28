class_name VerdantLivingForest
extends Node2D
## VERDANT SIGNAL — Production V8.0 Living World Forest Controller.
##
## Integrates all approved V8.0 environmental systems cleanly into the main
## Godot 4.7.2 production architecture (GL Compatibility / Intel HD Graphics 3000):
##   - 2304x1536 handcrafted living floor with puddle droplet & footstep ripples
##   - 81 multi-polygon StaticBody2D colliders (142 convex polygons) + 6 Area2D zones
##   - 718 animated grass/fern/wildflower tufts via 144-slot frustum-culled Sprite2D pool
##   - Asynchronous wind waves, periodic/manual wind gusts & player footstep grass bending
##   - 3 approved V8.0 cinematic lighting moods (Afternoon, Misty Dawn, Shaded Twilight)
##   - Sunbeams, localized alien bioluminescence, 7 fluttering butterflies/moths & 40 CPUParticles2D
##   - Acoustic Field Lens resonance & Field Sampling integration with production PlayerController

const WORLD_MIN_X: float = 330.0
const WORLD_MAX_X: float = 1974.0
const WORLD_MIN_Y: float = 290.0
const WORLD_MAX_Y: float = 2520.0

const CAM_LIMIT_LEFT: int = 240
const CAM_LIMIT_RIGHT: int = 2064
const CAM_LIMIT_TOP: int = 200
const CAM_LIMIT_BOTTOM: int = 2860

const DEFAULT_SPAWN_POS: Vector2 = Vector2(1024.0, 822.0)

const GRASS_POOL_SIZE: int = 144
const FOOTSTEP_BEND_DURATION: float = 0.48
const FOOTSTEP_BEND_RELEASE: float = 0.14

const ECOSYSTEM_DATA_PATH: String = "res://assets/world/living_forest/data/living_ecosystem_data.json"
const TEX_TUFTS: Texture2D = preload("res://assets/world/living_forest/sprites/living_grass_tufts_24x24_6x8.png")
const TEX_CRITTERS: Texture2D = preload("res://assets/world/living_forest/sprites/living_critters_12x12_4x3.png")
const FLORA_SCENE: PackedScene = preload("res://world/flora/flora_prop.tscn")

const MOOD_NAMES: PackedStringArray = [
	"Golden Afternoon",
	"Misty Rose-Gold Dawn",
	"Shaded Twilight Forest",
]

const MOOD_MODULATE_TINTS: Array[Color] = [
	Color(1.0, 1.0, 0.98, 1.0),
	Color(0.95, 0.92, 1.04, 1.0),
	Color(0.66, 0.78, 0.94, 1.0),
]

const MOOD_BEAM_COLORS: Array[Color] = [
	Color(1.0, 0.95, 0.68, 0.72),
	Color(1.0, 0.82, 0.66, 0.82),
	Color(0.68, 0.88, 0.88, 0.24),
]

const POOL_CENTERS: PackedVector2Array = [
	Vector2(1584.0, 866.0),
	Vector2(1732.0, 896.0),
	Vector2(1144.0, 1038.0),
	Vector2(1272.0, 1084.0),
	Vector2(1004.0, 764.0),
	Vector2(966.0, 492.0),
]

const POOL_RADII: PackedVector2Array = [
	Vector2(56.0, 22.0),
	Vector2(46.0, 18.0),
	Vector2(64.0, 24.0),
	Vector2(44.0, 18.0),
	Vector2(32.0, 13.0),
	Vector2(34.0, 14.0),
]

# Authentic xenobiological features integrated into Acoustic Field Lens (Q/RMB) & Sampling (E)
const ECOLOGICAL_SCAN_SITES: Array[Dictionary] = [
	{"id": "waystone_spiral", "name": "Waystone Spiral Conduit", "pos": Vector2(1694.0, 466.0), "radius": 115.0},
	{"id": "chime_reeds", "name": "Chime-Reed Outcrop", "pos": Vector2(1712.0, 774.0), "radius": 110.0},
	{"id": "colossal_buttress", "name": "Colossal Buttress Reedwood", "pos": Vector2(1088.0, 796.0), "radius": 120.0},
	{"id": "exposed_root_arch", "name": "Exposed Root Archway", "pos": Vector2(1118.0, 472.0), "radius": 105.0},
	{"id": "hollow_log_fungi", "name": "Luminous Bracket Fungi Log", "pos": Vector2(616.0, 916.0), "radius": 110.0},
	{"id": "clearing_pools", "name": "Reflective Canopy Pool", "pos": Vector2(1584.0, 866.0), "radius": 96.0},
	{"id": "south_basins", "name": "Mossy Rain Basin", "pos": Vector2(1144.0, 1038.0), "radius": 96.0},
]

# Scannable production FloraProp specimens tucked into open clearings inside YSortWorld
const EMBEDDED_FLORA_PLACEMENTS: Array[Dictionary] = [
	{"pos": Vector2(1078.0, 842.0), "species": 2, "variant": 0},
	{"pos": Vector2(1542.0, 822.0), "species": 0, "variant": 0},
	{"pos": Vector2(1686.0, 826.0), "species": 2, "variant": 1},
	{"pos": Vector2(1648.0, 504.0), "species": 3, "variant": 0},
	{"pos": Vector2(1062.0, 496.0), "species": 3, "variant": 1},
	{"pos": Vector2(686.0, 948.0), "species": 2, "variant": 0},
	{"pos": Vector2(1204.0, 1024.0), "species": 1, "variant": 0},
]

const ZONE_WARP_POINTS: Array[Dictionary] = [
	{"name": "Woodland Hub", "pos": Vector2(1024.0, 822.0), "dir": 2},
	{"name": "NW Shaded Grove", "pos": Vector2(586.0, 582.0), "dir": 1},
	{"name": "Exposed Root Arch", "pos": Vector2(1118.0, 454.0), "dir": 1},
	{"name": "Waystone Shrine", "pos": Vector2(1656.0, 518.0), "dir": 1},
	{"name": "Sunlit Chime Clearing", "pos": Vector2(1618.0, 824.0), "dir": 2},
	{"name": "South Reflective Basins", "pos": Vector2(1146.0, 1044.0), "dir": 2},
	{"name": "SW Deep Canopy", "pos": Vector2(654.0, 1116.0), "dir": 3},
	{"name": "Mossy Hollow Log", "pos": Vector2(632.0, 944.0), "dir": 3},
]

var _time_sec: float = 0.0
var _mood_idx: int = 0
var _manual_gust_timer: float = 0.0
var _biolum_scan_boost: float = 0.0
var _debug_collision: bool = false

var _slow_zone_count: int = 0
var _in_arch_count: int = 0
var _visible_tufts_drawn: int = 0
var _active_bent_tufts: int = 0
var _current_gust_strength: float = 0.0

var _tracked_player: PlayerController = null
var _occluders: Array[Sprite2D] = []
var _canopy_sprites: Array[Sprite2D] = []
var _sway_materials: Array[ShaderMaterial] = []
var _solid_poly_cache: Array[Dictionary] = []
var _area_poly_cache: Array[Dictionary] = []

var _tuft_x: PackedFloat32Array = PackedFloat32Array()
var _tuft_y: PackedFloat32Array = PackedFloat32Array()
var _tuft_row: PackedInt32Array = PackedInt32Array()
var _tuft_phase: PackedFloat32Array = PackedFloat32Array()
var _tuft_sens: PackedFloat32Array = PackedFloat32Array()
var _tuft_bend_timer: PackedFloat32Array = PackedFloat32Array()
var _tuft_bend_side: PackedInt32Array = PackedInt32Array()
var _active_bend_indices: Array[int] = []
var _tuft_pool: Array[Sprite2D] = []

var _critter_x: PackedFloat32Array = PackedFloat32Array()
var _critter_y: PackedFloat32Array = PackedFloat32Array()
var _critter_rx: PackedFloat32Array = PackedFloat32Array()
var _critter_ry: PackedFloat32Array = PackedFloat32Array()
var _critter_speed: PackedFloat32Array = PackedFloat32Array()
var _critter_phase: PackedFloat32Array = PackedFloat32Array()
var _critter_kind: PackedInt32Array = PackedInt32Array()
var _critter_nodes: Array[Sprite2D] = []

@onready var _forest_floor: Sprite2D = $ForestFloor
@onready var _ysort_world: Node2D = $YSortWorld
@onready var _canopy_layer: Node2D = $CanopyLayer
@onready var _perimeter_canopy_layer: Node2D = $PerimeterCanopyLayer
@onready var _walkable_zones_layer: Node2D = $WalkableZonesLayer
@onready var _sunbeams_sprite: Sprite2D = $AtmosphericLightingLayer/SunbeamsOverlay
@onready var _biolum_layer: Node2D = $AtmosphericLightingLayer/BiolumGlowLayer
@onready var _critters_layer: Node2D = $EnvironmentalLifeLayer/CrittersLayer
@onready var _falling_leaves: CPUParticles2D = $EnvironmentalLifeLayer/FallingLeaves
@onready var _debug_drawer: Node2D = $CollisionDebugDrawer


func _ready() -> void:
	_index_scene_geometry()
	_load_living_ecosystem_data()
	_spawn_embedded_scannable_flora()
	_debug_drawer.draw.connect(_on_debug_draw)
	apply_lighting_mood(0)


func get_ysort_world() -> Node2D:
	return _ysort_world


func bind_player(player: PlayerController) -> void:
	_tracked_player = player
	_slow_zone_count = 0
	_in_arch_count = 0
	var cam: Camera2D = player.get_camera()
	if cam != null:
		cam.limit_left = CAM_LIMIT_LEFT
		cam.limit_right = CAM_LIMIT_RIGHT
		cam.limit_top = CAM_LIMIT_TOP
		cam.limit_bottom = CAM_LIMIT_BOTTOM
		cam.offset = Vector2(0.0, -24.0)
		cam.position_smoothing_enabled = true
		cam.position_smoothing_speed = 7.0
		cam.reset_smoothing()


func apply_lighting_mood(mood_idx: int) -> Color:
	_mood_idx = posmod(mood_idx, MOOD_NAMES.size())
	var beam_col: Color = MOOD_BEAM_COLORS[_mood_idx]
	_sunbeams_sprite.modulate = beam_col
	return MOOD_MODULATE_TINTS[_mood_idx]


func get_mood_index() -> int:
	return _mood_idx


func get_mood_name() -> String:
	return MOOD_NAMES[_mood_idx]


func is_twilight_biolum_mood() -> bool:
	return _mood_idx == 2


func trigger_wind_gust(duration_sec: float = 3.0) -> void:
	_manual_gust_timer = maxf(_manual_gust_timer, duration_sec)


func toggle_collision_debug() -> bool:
	_debug_collision = not _debug_collision
	_debug_drawer.queue_redraw()
	return _debug_collision


func set_collision_debug(enabled: bool) -> void:
	_debug_collision = enabled
	_debug_drawer.queue_redraw()


func get_total_tuft_count() -> int:
	return _tuft_x.size()


func get_visible_tuft_count() -> int:
	return _visible_tufts_drawn


func get_active_bent_tuft_count() -> int:
	return _active_bent_tufts


func get_critter_count() -> int:
	return _critter_nodes.size()


func get_current_gust_strength() -> float:
	return _current_gust_strength


func get_zone_status_label(player_pos: Vector2) -> String:
	if _slow_zone_count > 0:
		return "thicket (0.78x)"
	if _in_arch_count > 0:
		return "root_arch"
	if is_in_shallow_pool(player_pos):
		return "shallow_pool (0.90x)"
	return "living_meadow"


func is_in_shallow_pool(world_pos: Vector2) -> bool:
	for i: int in range(POOL_CENTERS.size()):
		var c: Vector2 = POOL_CENTERS[i]
		var r: Vector2 = POOL_RADII[i]
		var dx: float = (world_pos.x - c.x) / r.x
		var dy: float = (world_pos.y - c.y) / r.y
		if (dx * dx + dy * dy) < 0.8464:
			return true
	return false


func get_surface_type_at(world_pos: Vector2) -> String:
	if is_in_shallow_pool(world_pos):
		return "shallow_water"
	if _slow_zone_count > 0:
		return "dense_thicket"
	if _in_arch_count > 0:
		return "root_arch_soil"
	return "living_forest"


func compute_terrain_speed_multiplier(world_pos: Vector2) -> float:
	var mul: float = 0.78 if _slow_zone_count > 0 else 1.0
	if is_in_shallow_pool(world_pos):
		mul = minf(mul, 0.90)
	return mul


func clamp_player_to_world(pos: Vector2) -> Vector2:
	return Vector2(
		clampf(pos.x, WORLD_MIN_X, WORLD_MAX_X),
		clampf(pos.y, WORLD_MIN_Y, WORLD_MAX_Y)
	)


func get_warp_point(index_zero_based: int) -> Dictionary:
	if index_zero_based < 0 or index_zero_based >= ZONE_WARP_POINTS.size():
		return {}
	return ZONE_WARP_POINTS[index_zero_based]


func scan_ecological_sites(world_pos: Vector2, scan_radius: float) -> PackedStringArray:
	var hits: PackedStringArray = PackedStringArray()
	for site: Dictionary in ECOLOGICAL_SCAN_SITES:
		var pos_v: Variant = site.get("pos", Vector2.ZERO)
		var site_pos: Vector2 = pos_v as Vector2 if pos_v is Vector2 else Vector2.ZERO
		var site_r: float = _dict_float(site, "radius", 96.0)
		var combined_r: float = maxf(scan_radius, site_r)
		if world_pos.distance_to(site_pos) <= combined_r:
			var label: String = _dict_str(site, "name", "Alien Flora")
			if not hits.has(label):
				hits.append(label)
	if not hits.is_empty():
		_biolum_scan_boost = 1.4
	return hits


func sample_nearest_feature(world_pos: Vector2, max_dist: float = 115.0) -> String:
	var best_name: String = ""
	var best_d: float = max_dist
	for site: Dictionary in ECOLOGICAL_SCAN_SITES:
		var pos_v: Variant = site.get("pos", Vector2.ZERO)
		var site_pos: Vector2 = pos_v as Vector2 if pos_v is Vector2 else Vector2.ZERO
		var d: float = world_pos.distance_to(site_pos)
		if d < best_d:
			best_d = d
			best_name = _dict_str(site, "name", "")
	return best_name


func step_living_ecosystem(delta: float, player: PlayerController) -> void:
	_tracked_player = player
	_time_sec += delta
	if _manual_gust_timer > 0.0:
		_manual_gust_timer = maxf(0.0, _manual_gust_timer - delta)
	if _biolum_scan_boost > 0.0:
		_biolum_scan_boost = maxf(0.0, _biolum_scan_boost - delta * 1.2)

	# Decay active player footstep grass bends (zero-allocation typed PackedFloat32Array!)
	var bi: int = _active_bend_indices.size() - 1
	while bi >= 0:
		var idx: int = _active_bend_indices[bi]
		var next_t: float = _tuft_bend_timer[idx] - delta
		if next_t <= 0.0:
			_tuft_bend_timer[idx] = 0.0
			_tuft_bend_side[idx] = 0
			_active_bend_indices.remove_at(bi)
		else:
			_tuft_bend_timer[idx] = next_t
		bi -= 1

	# Living wind rhythm (gentle breathing + periodic organic gusts + F6 manual surge)
	var gust_wave: float = maxf(0.0, sin(_time_sec * 0.44 - 0.8))
	var gust_strength: float = maxf(_manual_gust_timer / 3.0, pow(gust_wave, 4.0))
	_current_gust_strength = gust_strength

	for sm: ShaderMaterial in _sway_materials:
		sm.set_shader_parameter("gust_factor", gust_strength)
	_falling_leaves.gravity = Vector2(5.0 + gust_strength * 28.0, 10.0)

	# Drifting canopy cloud shadow modulation on sunbeams + biolum breathing
	var cloud_drift: float = 0.82 + 0.18 * sin(_time_sec * 0.28)
	var base_beam_alpha: float = MOOD_BEAM_COLORS[_mood_idx].a
	var beam_mod: Color = _sunbeams_sprite.modulate
	beam_mod.a = base_beam_alpha * cloud_drift
	_sunbeams_sprite.modulate = beam_mod

	var base_bio: float = 0.62 if _mood_idx == 0 else (0.78 if _mood_idx == 1 else 1.0)
	var bio_pulse: float = 0.78 + 0.22 * sin(_time_sec * 1.45)
	_biolum_layer.modulate.a = clampf(base_bio * bio_pulse + _biolum_scan_boost * 0.24, 0.0, 1.0)

	# Update puddle_ripples shader with player world position
	if _forest_floor.material is ShaderMaterial:
		var floor_mat: ShaderMaterial = _forest_floor.material as ShaderMaterial
		floor_mat.set_shader_parameter("player_world_pos", player.global_position)

	# Frustum-cull & animate 718 living grass/fern/wildflower tufts into 144 pooled Sprite2Ds
	var cam: Camera2D = player.get_camera()
	var cam_center: Vector2 = cam.get_screen_center_position() if cam != null else player.global_position
	var vx0: float = cam_center.x - 356.0
	var vx1: float = cam_center.x + 356.0
	var vy0: float = cam_center.y - 216.0
	var vy1: float = cam_center.y + 216.0

	var p_pos: Vector2 = player.global_position
	var is_moving: bool = player.velocity.length_squared() > 25.0
	var pool_idx: int = 0
	var total_tufts: int = _tuft_x.size()

	for i: int in range(total_tufts):
		var tx: float = _tuft_x[i]
		var ty: float = _tuft_y[i]
		if tx < vx0 or tx > vx1 or ty < vy0 or ty > vy1:
			continue

		if is_moving and absf(tx - p_pos.x) < 22.0 and absf(ty - p_pos.y) < 15.0:
			var foot_dist: float = Vector2(tx - p_pos.x, (ty - p_pos.y) * 1.35).length()
			if foot_dist < 21.0:
				if _tuft_bend_timer[i] <= 0.0:
					_active_bend_indices.append(i)
				_tuft_bend_timer[i] = FOOTSTEP_BEND_DURATION
				_tuft_bend_side[i] = 1 if tx >= p_pos.x else -1

		if pool_idx >= GRASS_POOL_SIZE:
			continue
		var spr: Sprite2D = _tuft_pool[pool_idx]
		pool_idx += 1
		spr.visible = true
		spr.position = Vector2(tx, ty)

		var f_col: int = 0
		if _tuft_bend_timer[i] > FOOTSTEP_BEND_RELEASE:
			f_col = 4 if _tuft_bend_side[i] < 0 else 5
		else:
			var travel: float = sin(_time_sec * (1.35 + gust_strength * 1.1) - tx * 0.011 + ty * 0.0038)
			var local_w: float = (
				0.22
				+ travel * (0.46 + gust_strength * 0.72)
				+ gust_strength * 0.48
				+ sin(_time_sec * 1.2 + _tuft_phase[i]) * 0.28
			) * _tuft_sens[i]
			if local_w > 0.88:
				f_col = 2
			elif local_w > 0.26:
				f_col = 1
			elif local_w < -0.26:
				f_col = 3
		spr.frame_coords = Vector2i(f_col, _tuft_row[i])

	_visible_tufts_drawn = pool_idx
	_active_bent_tufts = _active_bend_indices.size()
	for r: int in range(pool_idx, GRASS_POOL_SIZE):
		_tuft_pool[r].visible = false

	# Animate woodland butterflies & glowing twilight moths
	var critter_total: int = _critter_nodes.size()
	for ci: int in range(critter_total):
		var cs: Sprite2D = _critter_nodes[ci]
		var spd: float = _critter_speed[ci]
		var ph: float = _critter_phase[ci]
		cs.position = Vector2(
			_critter_x[ci] + cos(_time_sec * spd + ph) * _critter_rx[ci] + sin(_time_sec * 1.7 + ph) * 9.0,
			_critter_y[ci] + sin(_time_sec * spd * 1.3 + ph) * _critter_ry[ci] + cos(_time_sec * 2.8 + ph) * 5.0
		)
		cs.frame_coords = Vector2i(int(_time_sec * 9.5 + ph * 4.0) % 4, _critter_kind[ci])

	# Update player natural lighting & foliage occlusion peek (forest interior only; RimlandsPrototype coordinates unified speed!)
	if p_pos.y < 1420.0:
		player.set_lighting_tint(_compute_player_lighting_tint(p_pos))
		player.set_occluded_peek(_compute_player_occluded(p_pos))
	else:
		player.set_lighting_tint(Color(1.0, 1.0, 1.0, 1.0))
		player.set_occluded_peek(false)

	if _debug_collision:
		_debug_drawer.queue_redraw()


func _index_scene_geometry() -> void:
	for child: Node in _ysort_world.get_children():
		if child is StaticBody2D:
			var body_node: StaticBody2D = child as StaticBody2D
			var spr_node: Node = body_node.get_node_or_null("Sprite2D")
			if spr_node is Sprite2D:
				var spr: Sprite2D = spr_node as Sprite2D
				_occluders.append(spr)
				if spr.material is ShaderMaterial:
					_sway_materials.append(spr.material as ShaderMaterial)
			for sub: Node in body_node.get_children():
				if sub is CollisionPolygon2D:
					var cpoly: CollisionPolygon2D = sub as CollisionPolygon2D
					var role_v: Variant = cpoly.get_meta("role", "solid_trunk")
					_solid_poly_cache.append({
						"node": body_node,
						"poly": cpoly.polygon,
						"role": str(role_v),
					})
		elif child is Sprite2D:
			var s2: Sprite2D = child as Sprite2D
			_occluders.append(s2)
			if s2.material is ShaderMaterial:
				_sway_materials.append(s2.material as ShaderMaterial)

	var canopy_layers: Array[Node2D] = [_canopy_layer, _perimeter_canopy_layer]
	for layer_node: Node2D in canopy_layers:
		for child: Node in layer_node.get_children():
			if child is Sprite2D:
				var cspr: Sprite2D = child as Sprite2D
				_canopy_sprites.append(cspr)
				if cspr.material is ShaderMaterial:
					_sway_materials.append(cspr.material as ShaderMaterial)

	for child: Node in _walkable_zones_layer.get_children():
		if child is Area2D:
			var area: Area2D = child as Area2D
			var role: String = str(area.get_meta("role", "slow_thicket"))
			area.body_entered.connect(_on_zone_entered.bind(role))
			area.body_exited.connect(_on_zone_exited.bind(role))
			for sub: Node in area.get_children():
				if sub is CollisionPolygon2D:
					var cpoly: CollisionPolygon2D = sub as CollisionPolygon2D
					_area_poly_cache.append({
						"node": area,
						"poly": cpoly.polygon,
						"role": role,
					})


func _load_living_ecosystem_data() -> void:
	if not FileAccess.file_exists(ECOSYSTEM_DATA_PATH):
		push_error("VerdantLivingForest: Missing living ecosystem data at " + ECOSYSTEM_DATA_PATH)
		return
	var raw_txt: String = FileAccess.get_file_as_string(ECOSYSTEM_DATA_PATH)
	var parsed: Variant = JSON.parse_string(raw_txt)
	if not (parsed is Dictionary):
		push_error("VerdantLivingForest: Failed to parse living ecosystem JSON.")
		return
	var root_dict: Dictionary = parsed as Dictionary

	var tufts_v: Variant = root_dict.get("tufts", [])
	if tufts_v is Array:
		var tufts_arr: Array = tufts_v as Array
		for item: Variant in tufts_arr:
			if item is Dictionary:
				var d: Dictionary = item as Dictionary
				_tuft_x.append(_dict_float(d, "x", 0.0))
				_tuft_y.append(_dict_float(d, "y", 0.0))
				_tuft_row.append(_dict_int(d, "row", 0))
				_tuft_phase.append(_dict_float(d, "phase", 0.0))
				_tuft_sens.append(_dict_float(d, "sens", 1.0))
				_tuft_bend_timer.append(0.0)
				_tuft_bend_side.append(0)

	var critters_v: Variant = root_dict.get("critters", [])
	if critters_v is Array:
		var critters_arr: Array = critters_v as Array
		for item: Variant in critters_arr:
			if item is Dictionary:
				var d: Dictionary = item as Dictionary
				_critter_x.append(_dict_float(d, "x", 0.0))
				_critter_y.append(_dict_float(d, "y", 0.0))
				_critter_rx.append(_dict_float(d, "rx", 36.0))
				_critter_ry.append(_dict_float(d, "ry", 24.0))
				_critter_speed.append(_dict_float(d, "speed", 0.65))
				_critter_phase.append(_dict_float(d, "phase", 0.0))
				_critter_kind.append(_dict_int(d, "kind", 0))

	# Pre-allocate fixed frustum-culled Sprite2D pool inside YSortWorld
	for _i: int in range(GRASS_POOL_SIZE):
		var s := Sprite2D.new()
		s.texture = TEX_TUFTS
		s.hframes = 6
		s.vframes = 8
		s.offset = Vector2(0.0, -9.0)
		s.visible = false
		_ysort_world.add_child(s)
		_tuft_pool.append(s)

	# Create lightweight animated butterflies & glowing twilight moths
	for ci: int in range(_critter_x.size()):
		var cs := Sprite2D.new()
		cs.texture = TEX_CRITTERS
		cs.hframes = 4
		cs.vframes = 3
		cs.frame_coords = Vector2i(0, _critter_kind[ci])
		_critters_layer.add_child(cs)
		_critter_nodes.append(cs)


func _spawn_embedded_scannable_flora() -> void:
	for entry: Dictionary in EMBEDDED_FLORA_PLACEMENTS:
		var flora_node: Node = FLORA_SCENE.instantiate()
		if flora_node is FloraProp:
			var flora: FloraProp = flora_node as FloraProp
			var pos_v: Variant = entry.get("pos", Vector2.ZERO)
			flora.position = pos_v as Vector2 if pos_v is Vector2 else Vector2.ZERO
			flora.configure(
				_dict_int(entry, "species", 2),
				_dict_int(entry, "variant", 0),
				is_twilight_biolum_mood()
			)
			_ysort_world.add_child(flora)


func _on_zone_entered(body: Node2D, role: String) -> void:
	if body != _tracked_player:
		return
	if role == "slow_thicket":
		_slow_zone_count += 1
	elif role == "walkable_arch":
		_in_arch_count += 1
		if _tracked_player != null:
			_tracked_player.notify_canopy_entered()


func _on_zone_exited(body: Node2D, role: String) -> void:
	if body != _tracked_player:
		return
	if role == "slow_thicket":
		_slow_zone_count = maxi(0, _slow_zone_count - 1)
	elif role == "walkable_arch":
		_in_arch_count = maxi(0, _in_arch_count - 1)
		if _tracked_player != null:
			_tracked_player.notify_canopy_exited()


func _compute_player_lighting_tint(p_pos: Vector2) -> Color:
	var dist_clear: float = Vector2(
		(p_pos.x - 1648.0) / 235.0,
		(p_pos.y - 812.0) / 160.0
	).length()
	if dist_clear < 1.0:
		return Color(1.05, 1.03, 0.98, 1.0)
	if p_pos.x < 760.0 and p_pos.y < 680.0:
		return Color(0.89, 0.93, 0.98, 1.0)
	return Color(1.0, 1.0, 1.0, 1.0)


func _compute_player_occluded(p_pos: Vector2) -> bool:
	if _in_arch_count > 0:
		return true
	var p_rect := Rect2(p_pos + Vector2(-15.0, -54.0), Vector2(30.0, 50.0))
	for spr: Sprite2D in _occluders:
		if spr.texture == null:
			continue
		var parent_n: Node = spr.get_parent()
		var sort_y: float = spr.global_position.y
		if parent_n is Node2D and parent_n != _ysort_world:
			sort_y = (parent_n as Node2D).global_position.y
		if sort_y <= p_pos.y:
			continue
		var sz: Vector2 = spr.texture.get_size()
		var spr_rect := Rect2(spr.global_position + spr.offset - sz * 0.34, sz * 0.68)
		if p_rect.intersects(spr_rect):
			return true
	for cspr: Sprite2D in _canopy_sprites:
		if cspr.texture == null:
			continue
		var sz: Vector2 = cspr.texture.get_size()
		var crect := Rect2(cspr.global_position - sz * 0.36, sz * 0.72)
		if p_rect.intersects(crect):
			return true
	return false


func _on_debug_draw() -> void:
	if not _debug_collision:
		return
	var role_colors: Dictionary = {
		"solid_trunk": Color(1.0, 0.29, 0.29, 0.95),
		"solid_root": Color(1.0, 0.64, 0.22, 0.95),
		"solid_rock": Color(0.30, 0.76, 1.0, 0.95),
		"solid_log": Color(1.0, 0.48, 0.25, 0.95),
		"solid_thicket": Color(0.85, 0.42, 1.0, 0.95),
		"slow_thicket": Color(0.72, 1.0, 0.29, 0.92),
		"walkable_arch": Color(0.22, 0.95, 1.0, 0.92),
	}
	for item: Dictionary in _solid_poly_cache:
		var node_v: Variant = item.get("node")
		var poly_v: Variant = item.get("poly")
		if not (node_v is Node2D) or not (poly_v is PackedVector2Array):
			continue
		var node: Node2D = node_v as Node2D
		var poly: PackedVector2Array = poly_v as PackedVector2Array
		if poly.is_empty():
			continue
		var role: String = _dict_str(item, "role", "solid_trunk")
		var col_v: Variant = role_colors.get(role, Color.RED)
		var col: Color = col_v as Color if col_v is Color else Color.RED
		var world_pts := PackedVector2Array()
		for pt: Vector2 in poly:
			world_pts.append(node.global_position + pt)
		_debug_drawer.draw_colored_polygon(world_pts, Color(col.r, col.g, col.b, 0.24))
		var closed: PackedVector2Array = world_pts.duplicate()
		closed.append(world_pts[0])
		_debug_drawer.draw_polyline(closed, col, 1.0, false)

	for item: Dictionary in _area_poly_cache:
		var node_v: Variant = item.get("node")
		var poly_v: Variant = item.get("poly")
		if not (node_v is Node2D) or not (poly_v is PackedVector2Array):
			continue
		var node: Node2D = node_v as Node2D
		var poly: PackedVector2Array = poly_v as PackedVector2Array
		if poly.is_empty():
			continue
		var role: String = _dict_str(item, "role", "slow_thicket")
		var col_v: Variant = role_colors.get(role, Color.GREEN)
		var col: Color = col_v as Color if col_v is Color else Color.GREEN
		var world_pts := PackedVector2Array()
		for pt: Vector2 in poly:
			world_pts.append(node.global_position + pt)
		_debug_drawer.draw_colored_polygon(world_pts, Color(col.r, col.g, col.b, 0.18))
		var closed: PackedVector2Array = world_pts.duplicate()
		closed.append(world_pts[0])
		_debug_drawer.draw_polyline(closed, col, 1.0, false)

	if _tracked_player != null and is_instance_valid(_tracked_player):
		var foot_pts := PackedVector2Array()
		for i: int in range(25):
			var a: float = (float(i) / 24.0) * TAU
			foot_pts.append(_tracked_player.global_position + Vector2(cos(a) * 11.0, sin(a) * 6.0))
		_debug_drawer.draw_polyline(foot_pts, Color.WHITE, 1.0, false)


func _dict_float(d: Dictionary, key: String, fallback: float) -> float:
	var v: Variant = d.get(key, fallback)
	if v is float:
		return v as float
	if v is int:
		return float(v as int)
	return fallback


func _dict_int(d: Dictionary, key: String, fallback: int) -> int:
	var v: Variant = d.get(key, fallback)
	if v is int:
		return v as int
	if v is float:
		return int(v as float)
	return fallback


func _dict_str(d: Dictionary, key: String, fallback: String) -> String:
	var v: Variant = d.get(key, fallback)
	if v == null:
		return fallback
	return str(v)
