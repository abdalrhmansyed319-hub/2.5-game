class_name RimlandsTileSetBuilder
extends RefCounted
## Builds the runtime Godot 4.7.2 TileSet for AST-002 (Amber Kelp Littoral)
## and AST-003 (Singing Reedwood Canopy) using the exact audited v2.0 layout.

const TILE_SIZE: int = 16
const SOURCE_AMBER_COAST: int = 0
const SOURCE_SINGING_CANOPY: int = 1

const FULL_SQUARE_POLY: PackedVector2Array = [
	Vector2(-8.0, -8.0),
	Vector2(8.0, -8.0),
	Vector2(8.0, 8.0),
	Vector2(-8.0, 8.0),
]


static func build_tileset() -> TileSet:
	var ts := TileSet.new()
	ts.tile_size = Vector2i(TILE_SIZE, TILE_SIZE)

	ts.add_custom_data_layer(0)
	ts.set_custom_data_layer_name(0, "surface_type")
	ts.set_custom_data_layer_type(0, TYPE_STRING)

	ts.add_physics_layer(0)
	ts.set_physics_layer_collision_layer(0, 1)
	ts.set_physics_layer_collision_mask(0, 0)

	# Terrain Set 0: Wang 4-corner ground & ecotone transitions
	ts.add_terrain_set(0)
	ts.set_terrain_set_mode(0, TileSet.TERRAIN_MODE_MATCH_CORNERS)
	ts.add_terrain(0, 0)
	ts.set_terrain_name(0, 0, "amber_sand")
	ts.add_terrain(0, 1)
	ts.set_terrain_name(0, 1, "reedwood_floor")

	# Terrain Set 1: Coastal cliffs & mossy terraces
	ts.add_terrain_set(1)
	ts.set_terrain_set_mode(1, TileSet.TERRAIN_MODE_MATCH_CORNERS_AND_SIDES)
	ts.add_terrain(1, 0)
	ts.set_terrain_name(1, 0, "coastal_cliff")
	ts.add_terrain(1, 1)
	ts.set_terrain_name(1, 1, "moss_terrace")

	# Terrain Set 2: 4-bit cardinal forest footpaths
	ts.add_terrain_set(2)
	ts.set_terrain_set_mode(2, TileSet.TERRAIN_MODE_MATCH_SIDES)
	ts.add_terrain(2, 0)
	ts.set_terrain_name(2, 0, "forest_trail")

	var coast_tex: Texture2D = AssetPaths.load_texture("AST-002")
	if coast_tex != null:
		var coast_src: TileSetAtlasSource = _build_amber_coast_source(coast_tex)
		ts.add_source(coast_src, SOURCE_AMBER_COAST)

	var canopy_tex: Texture2D = AssetPaths.load_texture("AST-003")
	if canopy_tex != null:
		var canopy_src: TileSetAtlasSource = _build_singing_canopy_source(canopy_tex)
		ts.add_source(canopy_src, SOURCE_SINGING_CANOPY)

	return ts


static func _build_amber_coast_source(tex: Texture2D) -> TileSetAtlasSource:
	var src := TileSetAtlasSource.new()
	src.texture = tex
	src.texture_region_size = Vector2i(TILE_SIZE, TILE_SIZE)
	src.use_texture_padding = true

	# Rows 0..1 Cols 0..7 + Row 2 Cols 0..1: 18 Sand Wang tiles
	for row: int in range(2):
		for col: int in range(8):
			_register_tile(src, Vector2i(col, row), "sand", false)
	_register_tile(src, Vector2i(0, 2), "sand", false)
	_register_tile(src, Vector2i(1, 2), "sand", false)

	# Row 2 Cols 2..7: 6 Beach Decals
	for col: int in range(2, 8):
		_register_tile(src, Vector2i(col, 2), "", false)

	# Rows 0..2 Cols 8..11: 12 Shallow Tidal Pool & Wet Sandbars
	for row: int in range(3):
		for col: int in range(8, 12):
			_register_tile(src, Vector2i(col, row), "shallow_water", false)

	# Rows 3..5 Cols 0..5: 18 Coastal Cliffs (solid world_solid)
	for row: int in range(3, 6):
		for col: int in range(6):
			_register_tile(src, Vector2i(col, row), "rock", true)

	# Rows 3..4 Cols 6..11: 12 Deep Water Shelf (impassable border)
	for row: int in range(3, 5):
		for col: int in range(6, 12):
			_register_tile(src, Vector2i(col, row), "deep_water", true)

	# Rows 6..7: 12 Horizontal 2-frame Animated Water & Foam pairs
	for row: int in [6, 7]:
		for pair: int in range(6):
			var base_coord := Vector2i(pair * 2, row)
			var is_deep: bool = (row == 6 and pair == 2)
			var surf: String = "deep_water" if is_deep else "shallow_water"
			_register_animated_pair(src, base_coord, surf, is_deep, 2.0)

	return src


static func _build_singing_canopy_source(tex: Texture2D) -> TileSetAtlasSource:
	var src := TileSetAtlasSource.new()
	src.texture = tex
	src.texture_region_size = Vector2i(TILE_SIZE, TILE_SIZE)
	src.use_texture_padding = true

	# Zone A: 18 Forest Moss & Ecotone Wang tiles
	for row: int in range(2):
		for col: int in range(8):
			_register_tile(src, Vector2i(col, row), "reedwood_floor", false)
	_register_tile(src, Vector2i(0, 2), "reedwood_floor", false)
	_register_tile(src, Vector2i(1, 2), "reedwood_floor", false)

	# Zone C: 6 Forest Decals
	for col: int in range(2, 8):
		_register_tile(src, Vector2i(col, 2), "", false)

	# Zone B: 16 Full 4-bit Cardinal Dirt Footpaths (Cols 8..11, Rows 0..3)
	for row: int in range(4):
		for col: int in range(8, 12):
			_register_tile(src, Vector2i(col, row), "forest_trail", false)

	# Zone D: 18 Mossy Terraces (solid world_solid)
	for row: int in range(3, 6):
		for col: int in range(6):
			_register_tile(src, Vector2i(col, row), "rock", true)

	# Zone E: Creek Banks (Cols 6..7, Rows 3..5)
	for row: int in range(3, 6):
		for col: int in range(6, 8):
			_register_tile(src, Vector2i(col, row), "shallow_water", false)

	# Zone E: 4 Horizontal 2-frame Animated Forest Stream pairs (Rows 4..5, Cols 8..11)
	for row: int in [4, 5]:
		for pair: int in range(2):
			var base_coord := Vector2i(8 + pair * 2, row)
			_register_animated_pair(src, base_coord, "shallow_water", false, 2.0)

	return src


static func _register_tile(
	src: TileSetAtlasSource,
	coord: Vector2i,
	surface_name: String,
	is_solid: bool
) -> void:
	src.create_tile(coord)
	var td: TileData = src.get_tile_data(coord, 0)
	if td == null:
		return
	if not surface_name.is_empty():
		td.set_custom_data("surface_type", surface_name)
	if is_solid:
		td.add_collision_polygon(0)
		td.set_collision_polygon_points(0, 0, FULL_SQUARE_POLY)


static func _register_animated_pair(
	src: TileSetAtlasSource,
	base_coord: Vector2i,
	surface_name: String,
	is_solid: bool,
	fps: float
) -> void:
	src.create_tile(base_coord)
	src.set_tile_animation_columns(base_coord, 2)
	src.set_tile_animation_frames_count(base_coord, 2)
	src.set_tile_animation_speed(base_coord, fps)
	var td: TileData = src.get_tile_data(base_coord, 0)
	if td == null:
		return
	td.set_custom_data("surface_type", surface_name)
	if is_solid:
		td.add_collision_polygon(0)
		td.set_collision_polygon_points(0, 0, FULL_SQUARE_POLY)
