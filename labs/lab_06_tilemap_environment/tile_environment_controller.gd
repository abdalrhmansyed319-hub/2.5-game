## Multi-layer TileMapLayer environment controller demonstrating Godot 4.5-4.7 best practices:
## - Separated Ground / Decal / Y-Sorted Structure / Canopy TileMapLayers
## - Safe world<->cell coordinate conversion accounting for layer transforms
## - Batched terrain painting (set_cells_terrain_connect)
## - Custom TileData surface metadata queries (zero hardcoded atlas coords)
## - Exact hit-cell lookup that works cleanly with Godot 4.5+ physics_quadrant_size chunking!
class_name TileEnvironmentController
extends Node2D

signal tile_modified(layer_name: StringName, cell: Vector2i)

const CUSTOM_SURFACE_KEY: String = "surface_type"
const CUSTOM_SPEED_MULT_KEY: String = "speed_multiplier"

@export var ground_layer: TileMapLayer
@export var walls_ysort_layer: TileMapLayer
@export var canopy_overlay_layer: TileMapLayer
@export var destructible_layer: TileMapLayer


func _ready() -> void:
	if ground_layer != null:
		ground_layer.collision_enabled = false
		ground_layer.z_index = -20
	if walls_ysort_layer != null:
		walls_ysort_layer.y_sort_enabled = true
		walls_ysort_layer.collision_enabled = true
		# Keep chunked physics (default 16) for optimal static terrain performance.
		walls_ysort_layer.physics_quadrant_size = 16
	if canopy_overlay_layer != null:
		canopy_overlay_layer.collision_enabled = false
		canopy_overlay_layer.z_index = 20
	if destructible_layer != null:
		# Opt-out of physics chunking ONLY on small destructible layers requiring body_rid precision.
		destructible_layer.physics_quadrant_size = 1


func world_to_cell(layer: TileMapLayer, world_pos: Vector2) -> Vector2i:
	if layer == null:
		return Vector2i.ZERO
	return layer.local_to_map(layer.to_local(world_pos))


func cell_to_world(layer: TileMapLayer, cell: Vector2i) -> Vector2:
	if layer == null:
		return Vector2.ZERO
	return layer.to_global(layer.map_to_local(cell))


## Resolves the exact collided tile on a chunked TileMapLayer (physics_quadrant_size > 1)
## by stepping inside the hit normal rather than relying on get_coords_for_body_rid().
func resolve_collided_cell(
	layer: TileMapLayer,
	collision: KinematicCollision2D,
	penetration_bias_px: float = 1.5
) -> Vector2i:
	if layer == null or collision == null:
		return Vector2i.ZERO
	var sample_world := collision.get_position() - collision.get_normal() * penetration_bias_px
	return world_to_cell(layer, sample_world)


func query_surface_type(world_pos: Vector2) -> StringName:
	if ground_layer == null:
		return &"none"
	var cell := world_to_cell(ground_layer, world_pos)
	var data := ground_layer.get_cell_tile_data(cell)
	if data == null or not data.has_custom_data(CUSTOM_SURFACE_KEY):
		return &"default"
	return StringName(str(data.get_custom_data(CUSTOM_SURFACE_KEY)))


func query_move_speed_multiplier(world_pos: Vector2) -> float:
	if ground_layer == null:
		return 1.0
	var cell := world_to_cell(ground_layer, world_pos)
	var data := ground_layer.get_cell_tile_data(cell)
	if data == null or not data.has_custom_data(CUSTOM_SPEED_MULT_KEY):
		return 1.0
	return clampf(float(data.get_custom_data(CUSTOM_SPEED_MULT_KEY)), 0.1, 3.0)


## Batches terrain auto-tiling in a single solver call rather than per-cell calls.
func paint_terrain_region(
	layer: TileMapLayer,
	cells: Array[Vector2i],
	terrain_set: int,
	terrain_id: int,
	ignore_empty_terrains: bool = true
) -> void:
	if layer == null or cells.is_empty():
		return
	layer.set_cells_terrain_connect(cells, terrain_set, terrain_id, ignore_empty_terrains)
	for cell in cells:
		tile_modified.emit(StringName(layer.name), cell)


## Places an atlas tile rotated in 90-degree clockwise steps via TileSetAtlasSource transform flags.
func set_rotated_atlas_tile(
	layer: TileMapLayer,
	cell: Vector2i,
	source_id: int,
	atlas_coords: Vector2i,
	quarter_turns_cw: int
) -> void:
	if layer == null:
		return
	var alt_flags: int = 0
	var steps := posmod(quarter_turns_cw, 4)
	match steps:
		1:
			alt_flags = TileSetAtlasSource.TRANSFORM_TRANSPOSE | TileSetAtlasSource.TRANSFORM_FLIP_H
		2:
			alt_flags = TileSetAtlasSource.TRANSFORM_FLIP_H | TileSetAtlasSource.TRANSFORM_FLIP_V
		3:
			alt_flags = TileSetAtlasSource.TRANSFORM_TRANSPOSE | TileSetAtlasSource.TRANSFORM_FLIP_V
		_:
			alt_flags = 0
	layer.set_cell(cell, source_id, atlas_coords, alt_flags)
	tile_modified.emit(StringName(layer.name), cell)
