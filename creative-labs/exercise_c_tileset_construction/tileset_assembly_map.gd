class_name TrainingTilesetAssembler2D
extends Node2D
## Exercise C: Godot 4.7 TileMapLayer resolver matching synthetic_stone_moss_tileset.png (4x4).
## Demonstrates strict separation of Ground/Wall TileMapLayers and deterministic bitmask lookup.

const TILE_FLOOR_BASE := Vector2i(0, 0)
const TILE_FLOOR_CRACKED := Vector2i(1, 0)
const TILE_FLOOR_MOSS := Vector2i(2, 0)
const TILE_WALL_FILL := Vector2i(3, 0)

const TILE_WALL_NORTH := Vector2i(0, 1)
const TILE_WALL_SOUTH := Vector2i(1, 1)
const TILE_WALL_WEST := Vector2i(2, 1)
const TILE_WALL_EAST := Vector2i(3, 1)

const TILE_OUTER_NW := Vector2i(0, 2)
const TILE_OUTER_NE := Vector2i(1, 2)
const TILE_OUTER_SW := Vector2i(2, 2)
const TILE_OUTER_SE := Vector2i(3, 2)

const TILE_INNER_NW := Vector2i(0, 3)
const TILE_INNER_NE := Vector2i(1, 3)
const TILE_INNER_SW := Vector2i(2, 3)
const TILE_INNER_SE := Vector2i(3, 3)

@export var ground_layer: TileMapLayer
@export var wall_layer: TileMapLayer
@export var atlas_source_id: int = 0


func build_room_from_grid(wall_grid: Array[PackedInt32Array]) -> void:
	if ground_layer == null or wall_layer == null:
		push_warning("TrainingTilesetAssembler2D requires both ground_layer and wall_layer.")
		return
	ground_layer.clear()
	wall_layer.clear()

	var rows := wall_grid.size()
	for r in range(rows):
		var cols := wall_grid[r].size()
		for c in range(cols):
			var cell := Vector2i(c, r)
			if wall_grid[r][c] == 0:
				var floor_tile := _pick_floor_variant(r, c)
				ground_layer.set_cell(cell, atlas_source_id, floor_tile)
			else:
				var wall_tile := resolve_wall_atlas_coords(wall_grid, r, c)
				wall_layer.set_cell(cell, atlas_source_id, wall_tile)


func resolve_wall_atlas_coords(
	wall_grid: Array[PackedInt32Array],
	r: int,
	c: int,
) -> Vector2i:
	var open_n := not _is_wall(wall_grid, r - 1, c)
	var open_s := not _is_wall(wall_grid, r + 1, c)
	var open_w := not _is_wall(wall_grid, r, c - 1)
	var open_e := not _is_wall(wall_grid, r, c + 1)

	if open_n and open_w:
		return TILE_OUTER_NW
	if open_n and open_e:
		return TILE_OUTER_NE
	if open_s and open_w:
		return TILE_OUTER_SW
	if open_s and open_e:
		return TILE_OUTER_SE

	return _resolve_straight_or_inner(wall_grid, r, c, open_n, open_s, open_w, open_e)


func _resolve_straight_or_inner(
	wall_grid: Array[PackedInt32Array],
	r: int,
	c: int,
	open_n: bool,
	open_s: bool,
	open_w: bool,
	open_e: bool,
) -> Vector2i:
	if open_s:
		return TILE_WALL_NORTH
	if open_n:
		return TILE_WALL_SOUTH
	if open_e:
		return TILE_WALL_WEST
	if open_w:
		return TILE_WALL_EAST
	return _resolve_inner_corner(wall_grid, r, c)


func _resolve_inner_corner(wall_grid: Array[PackedInt32Array], r: int, c: int) -> Vector2i:
	if not _is_wall(wall_grid, r + 1, c + 1):
		return TILE_INNER_NW
	if not _is_wall(wall_grid, r + 1, c - 1):
		return TILE_INNER_NE
	if not _is_wall(wall_grid, r - 1, c + 1):
		return TILE_INNER_SW
	if not _is_wall(wall_grid, r - 1, c - 1):
		return TILE_INNER_SE
	return TILE_WALL_FILL


func _pick_floor_variant(r: int, c: int) -> Vector2i:
	var hash_val := (r * 7 + c * 13) % 11
	if hash_val == 0:
		return TILE_FLOOR_MOSS
	if hash_val == 3 or hash_val == 8:
		return TILE_FLOOR_CRACKED
	return TILE_FLOOR_BASE


func _is_wall(wall_grid: Array[PackedInt32Array], r: int, c: int) -> bool:
	if r < 0 or r >= wall_grid.size():
		return true
	if c < 0 or c >= wall_grid[r].size():
		return true
	return wall_grid[r][c] == 1
