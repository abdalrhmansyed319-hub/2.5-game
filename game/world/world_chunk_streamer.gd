class_name WorldChunkStreamer
extends Node2D
## Deterministic 32x32-tile (512x512 px) 3x3 chunk streaming prototype for
## VERDANT SIGNAL Milestone 01 (Amber Kelp Littoral -> Singing Reedwood Canopy).
##
## Maintains 9 active chunks around the player across 5 TileMapLayers plus
## chunk-scoped Y-sorted props so draw calls and RAM stay bounded on Intel HD 3000.

const CHUNK_TILES: int = 32
const TILE_PX: int = 16
const CHUNK_PX: int = CHUNK_TILES * TILE_PX
const STREAM_RADIUS: int = 1

# Handcrafted V8.0 Living Forest Sanctuary tile footprint ([0..2304] x [0..1536] px)
const SANCTUARY_MIN_TX: int = 0
const SANCTUARY_MAX_TX: int = 144
const SANCTUARY_MIN_TY: int = 0
const SANCTUARY_MAX_TY: int = 96

const TREE_SCENE: PackedScene = preload("res://world/props/singing_reedwood_tree.tscn")
const FLORA_SCENE: PackedScene = preload("res://world/flora/flora_prop.tscn")
const DROP_POD_SCENE: PackedScene = preload("res://world/landmarks/drop_pod_clearing.tscn")

# Wang 4-corner bitmask (index 0..15; TL=1, TR=2, BL=4, BR=8) -> AST-002/003 coords
const WANG_MASK_TO_COORD: Array[Vector2i] = [
	Vector2i(0, 0),  # 0 (unused)
	Vector2i(7, 1),  # 1: TL
	Vector2i(5, 1),  # 2: TR
	Vector2i(6, 1),  # 3: TL+TR
	Vector2i(6, 0),  # 4: BL
	Vector2i(4, 1),  # 5: TL+BL
	Vector2i(1, 2),  # 6: TR+BL
	Vector2i(3, 1),  # 7: TL+TR+BL
	Vector2i(4, 0),  # 8: BR
	Vector2i(0, 2),  # 9: TL+BR
	Vector2i(7, 0),  # 10: TR+BR
	Vector2i(2, 1),  # 11: TL+TR+BR
	Vector2i(5, 0),  # 12: BL+BR
	Vector2i(1, 1),  # 13: TL+BL+BR
	Vector2i(0, 1),  # 14: TR+BL+BR
	Vector2i(0, 0),  # 15: TL+TR+BL+BR
]

var _loaded_coords: Array[Vector2i] = []
var _loaded_buckets: Array[Node2D] = []
var _current_center_chunk: Vector2i = Vector2i(99999, 99999)
var _is_night: bool = false
var _tileset: TileSet = null

@onready var _water_layer: TileMapLayer = $WaterBaseLayer
@onready var _ground_layer: TileMapLayer = $GroundLayer
@onready var _ecotone_layer: TileMapLayer = $EcotoneOverlayLayer
@onready var _cliff_layer: TileMapLayer = $CliffWallCollisionLayer
@onready var _decal_layer: TileMapLayer = $GroundDecalShadowLayer
@onready var _ysort_layer: Node2D = $YSortWorldLayer


func _ready() -> void:
	_tileset = RimlandsTileSetBuilder.build_tileset()
	_water_layer.tile_set = _tileset
	_ground_layer.tile_set = _tileset
	_ecotone_layer.tile_set = _tileset
	_cliff_layer.tile_set = _tileset
	_decal_layer.tile_set = _tileset


func update_around_world_pos(world_pos: Vector2) -> void:
	var chunk_coord: Vector2i = world_to_chunk(world_pos)
	if chunk_coord == _current_center_chunk:
		return
	_current_center_chunk = chunk_coord
	_sync_active_chunks(chunk_coord)


func world_to_chunk(world_pos: Vector2) -> Vector2i:
	return Vector2i(
		int(floor(world_pos.x / float(CHUNK_PX))),
		int(floor(world_pos.y / float(CHUNK_PX)))
	)


func get_active_chunk_count() -> int:
	return _loaded_coords.size()


func get_center_chunk() -> Vector2i:
	return _current_center_chunk


func get_ysort_layer() -> Node2D:
	return _ysort_layer


func set_night_mode(night_enabled: bool) -> void:
	_is_night = night_enabled
	for node: Node in get_tree().get_nodes_in_group("scannable_flora"):
		if node is FloraProp:
			(node as FloraProp).set_night_mode(_is_night)


func get_surface_type_at(world_pos: Vector2) -> String:
	if _ground_layer.tile_set == null:
		return "sand"
	var cell: Vector2i = _ground_layer.local_to_map(_ground_layer.to_local(world_pos))
	var layers: Array[TileMapLayer] = [
		_decal_layer,
		_ecotone_layer,
		_ground_layer,
		_water_layer,
	]
	for layer: TileMapLayer in layers:
		var td: TileData = layer.get_cell_tile_data(cell)
		if td == null:
			continue
		var raw_val: Variant = td.get_custom_data("surface_type")
		if raw_val != null:
			var label: String = str(raw_val)
			if not label.is_empty():
				return label
	return "sand"


func _sync_active_chunks(center: Vector2i) -> void:
	var desired: Array[Vector2i] = []
	for dy: int in range(-STREAM_RADIUS, STREAM_RADIUS + 1):
		for dx: int in range(-STREAM_RADIUS, STREAM_RADIUS + 1):
			desired.append(Vector2i(center.x + dx, center.y + dy))

	var i: int = _loaded_coords.size() - 1
	while i >= 0:
		var existing: Vector2i = _loaded_coords[i]
		if not desired.has(existing):
			_unload_chunk_at(i)
		i -= 1

	for needed: Vector2i in desired:
		if not _loaded_coords.has(needed):
			_load_chunk(needed)


func _load_chunk(chunk_coord: Vector2i) -> void:
	var prop_bucket := Node2D.new()
	prop_bucket.name = "ChunkProps_%d_%d" % [chunk_coord.x, chunk_coord.y]
	prop_bucket.y_sort_enabled = true
	_ysort_layer.add_child(prop_bucket)
	_loaded_coords.append(chunk_coord)
	_loaded_buckets.append(prop_bucket)

	var origin_x: int = chunk_coord.x * CHUNK_TILES
	var origin_y: int = chunk_coord.y * CHUNK_TILES

	# Pass 1: Tiles across Water, Sand Ground, Moss Ecotone, Trails, Cliffs, Decals
	for ly: int in range(CHUNK_TILES):
		var ty: int = origin_y + ly
		for lx: int in range(CHUNK_TILES):
			var tx: int = origin_x + lx
			_populate_tile(tx, ty)

	# Pass 2: Handcrafted Hero Landmark #1 at Chunk (0, 0)
	if chunk_coord == Vector2i.ZERO:
		var landmark: Node2D = DROP_POD_SCENE.instantiate() as Node2D
		if landmark != null:
			landmark.position = Vector2(0.0, -8.0)
			prop_bucket.add_child(landmark)

	# Pass 3: Deterministic Reedwood Groves & Starter Flora
	_populate_chunk_props(chunk_coord, origin_x, origin_y, prop_bucket)


func _unload_chunk_at(index: int) -> void:
	var chunk_coord: Vector2i = _loaded_coords[index]
	var bucket: Node2D = _loaded_buckets[index]
	var origin_x: int = chunk_coord.x * CHUNK_TILES
	var origin_y: int = chunk_coord.y * CHUNK_TILES

	for ly: int in range(CHUNK_TILES):
		var ty: int = origin_y + ly
		for lx: int in range(CHUNK_TILES):
			var cell := Vector2i(origin_x + lx, ty)
			_water_layer.erase_cell(cell)
			_ground_layer.erase_cell(cell)
			_ecotone_layer.erase_cell(cell)
			_cliff_layer.erase_cell(cell)
			_decal_layer.erase_cell(cell)

	if is_instance_valid(bucket):
		bucket.queue_free()
	_loaded_coords.remove_at(index)
	_loaded_buckets.remove_at(index)


func _populate_tile(tx: int, ty: int) -> void:
	if _tileset == null:
		return
	var cell := Vector2i(tx, ty)
	var coast_src: int = RimlandsTileSetBuilder.SOURCE_AMBER_COAST
	var canopy_src: int = RimlandsTileSetBuilder.SOURCE_SINGING_CANOPY
	if not _tileset.has_source(coast_src) or not _tileset.has_source(canopy_src):
		return

	# Inside the handcrafted V8.0 Living Forest Sanctuary, keep chunk streaming active
	# on collision-free moss floor tiles so zero legacy water/cliff barriers block the forest!
	if _in_living_forest_sanctuary(tx, ty):
		_ground_layer.set_cell(cell, canopy_src, Vector2i(0, 0))
		return

	# Base animated water layer everywhere beneath coastline & deep shelf
	var elev: float = _sample_elevation(tx, ty)
	if elev < -0.35:
		_water_layer.set_cell(cell, coast_src, Vector2i(4, 6))
		return
	var shimmer_col: int = 0 if ((tx + ty) & 1) == 0 else 2
	_water_layer.set_cell(cell, coast_src, Vector2i(shimmer_col, 6))

	# Curved Wang 4-corner Sand Shoreline on GroundLayer
	var sand_mask: int = _compute_wang_mask(tx, ty, 0.0)
	if sand_mask > 0:
		var sand_coord: Vector2i = _pick_wang_coord(sand_mask, tx, ty)
		_ground_layer.set_cell(cell, coast_src, sand_coord)
	elif elev > -0.14:
		var tidal_coord := Vector2i(8 if ((tx * 3 + ty) & 1) == 0 else 9, 0)
		_ground_layer.set_cell(cell, coast_src, tidal_coord)

	# Curved Wang 4-corner Singing Reedwood Moss Ecotone on EcotoneOverlayLayer
	var moss_mask: int = _compute_wang_mask(tx, ty, 0.34)
	if moss_mask > 0:
		var moss_coord: Vector2i = _pick_wang_coord(moss_mask, tx, ty)
		_ecotone_layer.set_cell(cell, canopy_src, moss_coord)

	# Winding Root-Lined Forest Footpath (4-bit cardinal mask in AST-003 Zone B)
	if moss_mask == 15 and _is_trail_tile(tx, ty):
		var trail_bits: int = 0
		if _is_trail_tile(tx, ty - 1):
			trail_bits |= 1
		if _is_trail_tile(tx + 1, ty):
			trail_bits |= 2
		if _is_trail_tile(tx, ty + 1):
			trail_bits |= 4
		if _is_trail_tile(tx - 1, ty):
			trail_bits |= 8
		var trail_coord := Vector2i(8 + (trail_bits & 3), trail_bits >> 2)
		_decal_layer.set_cell(cell, canopy_src, trail_coord)
		return

	# Sparse coastal rock outcrops & forest decals (outside Drop-Pod Clearing & V8.0 Living Forest Sanctuary)
	var h: int = _hash_2d(tx, ty, 911)
	if not _in_spawn_clearing(tx, ty) and not _in_living_forest_sanctuary(tx, ty):
		if sand_mask == 15 and moss_mask == 0 and (h % 97) == 0:
			_cliff_layer.set_cell(cell, coast_src, Vector2i(5, 3))
		elif sand_mask == 15 and moss_mask == 0 and (h % 29) == 0:
			_decal_layer.set_cell(cell, coast_src, Vector2i(2 + (h % 6), 2))
		elif moss_mask == 15 and (h % 23) == 0:
			_decal_layer.set_cell(cell, canopy_src, Vector2i(2 + (h % 6), 2))


func _populate_chunk_props(
	chunk_coord: Vector2i,
	origin_x: int,
	origin_y: int,
	bucket: Node2D
) -> void:
	# Spaced Singing Reedwood trees on 4x4 tile cells (outside handcrafted V8.0 Living Forest Sanctuary)
	for gy: int in range(0, CHUNK_TILES, 4):
		for gx: int in range(0, CHUNK_TILES, 4):
			var h: int = _hash_2d(chunk_coord.x * 8 + gx, chunk_coord.y * 8 + gy, 307)
			var tx: int = origin_x + gx + (h % 3)
			var ty: int = origin_y + gy + ((h >> 3) % 3)
			if _in_spawn_clearing(tx, ty) or _is_trail_tile(tx, ty) or _in_living_forest_sanctuary(tx, ty):
				continue
			if _sample_elevation(tx, ty) > 0.42 and (h % 100) < 42:
				var tree: SingingReedwoodTree = (
					TREE_SCENE.instantiate() as SingingReedwoodTree
				)
				if tree != null:
					tree.position = Vector2(
						float(tx * TILE_PX + 8),
						float(ty * TILE_PX + 12)
					)
					tree.set_variant((h >> 6) & 1)
					bucket.add_child(tree)

	# Starter Flora Props (AST-005; inside sanctuary handled by VerdantLivingForest embedded flora)
	for gy: int in range(0, CHUNK_TILES, 3):
		for gx: int in range(0, CHUNK_TILES, 3):
			var hf: int = _hash_2d(origin_x + gx, origin_y + gy, 733)
			if (hf % 100) >= 24:
				continue
			var tx: int = origin_x + gx + (hf & 1)
			var ty: int = origin_y + gy + ((hf >> 2) & 1)
			if _in_spawn_clearing(tx, ty) or _is_trail_tile(tx, ty) or _in_living_forest_sanctuary(tx, ty):
				continue
			var elev: float = _sample_elevation(tx, ty)
			var species: int = -1
			if elev > -0.14 and elev <= 0.04:
				species = 0  # Amber Tide-Kelp
			elif elev > 0.06 and elev <= 0.28:
				species = 1  # Mirror Glasswort
			elif elev > 0.30 and elev <= 0.48:
				species = 2  # Sun-Drop Bulb (Day/Night)
			elif elev > 0.48:
				species = 3  # Cordage Frond
			if species >= 0:
				var flora: FloraProp = FLORA_SCENE.instantiate() as FloraProp
				if flora != null:
					flora.position = Vector2(
						float(tx * TILE_PX + 8),
						float(ty * TILE_PX + 12)
					)
					flora.configure(species, (hf >> 4) & 1, _is_night)
					bucket.add_child(flora)


func _compute_wang_mask(tx: int, ty: int, threshold: float) -> int:
	var mask: int = 0
	if _sample_corner_elev(tx, ty) >= threshold:
		mask |= 1  # TL
	if _sample_corner_elev(tx + 1, ty) >= threshold:
		mask |= 2  # TR
	if _sample_corner_elev(tx, ty + 1) >= threshold:
		mask |= 4  # BL
	if _sample_corner_elev(tx + 1, ty + 1) >= threshold:
		mask |= 8  # BR
	return mask


func _pick_wang_coord(mask: int, tx: int, ty: int) -> Vector2i:
	if mask == 15:
		var r: int = _hash_2d(tx, ty, 503) % 100
		if r < 55:
			return Vector2i(0, 0)
		if r < 75:
			return Vector2i(1, 0)
		if r < 90:
			return Vector2i(2, 0)
		return Vector2i(3, 0)
	return WANG_MASK_TO_COORD[clampi(mask, 0, 15)]


func _sample_corner_elev(cx: int, cy: int) -> float:
	return _sample_elevation_f(float(cx) - 0.5, float(cy) - 0.5)


func _sample_elevation(tx: int, ty: int) -> float:
	return _sample_elevation_f(float(tx), float(ty))


func _sample_elevation_f(fx: float, fy: float) -> float:
	# West/South = Amber Kelp Coastline; East/North = Singing Reedwood Canopy
	var slope: float = (fx + 4.0) * 0.045 - (fy - 3.0) * 0.028
	var wave_a: float = sin(fx * 0.14 + fy * 0.09) * 0.14
	var wave_b: float = cos(fx * 0.07 - fy * 0.13) * 0.11
	return slope + wave_a + wave_b


func _is_trail_tile(tx: int, ty: int) -> bool:
	if tx < 6:
		return false
	var center_y: float = sin(float(tx) * 0.15) * 4.0 - 2.0
	return absf(float(ty) - center_y) <= 0.75


func _in_spawn_clearing(tx: int, ty: int) -> bool:
	return absf(float(tx)) <= 6.0 and absf(float(ty)) <= 5.0


func _in_living_forest_sanctuary(tx: int, ty: int) -> bool:
	return (
		tx >= SANCTUARY_MIN_TX
		and tx <= SANCTUARY_MAX_TX
		and ty >= SANCTUARY_MIN_TY
		and ty <= SANCTUARY_MAX_TY
	)


func _hash_2d(x: int, y: int, seed_val: int) -> int:
	var n: int = (x * 374761393 + y * 668265263 + seed_val * 1442695041) & 0x7FFFFFFF
	n = ((n >> 13) ^ n) & 0x7FFFFFFF
	return ((n * 1274126177) & 0x7FFFFFFF) >> 8
