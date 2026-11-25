# 06 — TileMap and Environment Engineering

> **Verification Baseline**: Godot Engine `4.7.2-stable` (`TileMapLayer.xml`, `TileSet.xml`, `TileSetAtlasSource.xml`, `TileSetScenesCollectionSource.xml`, `TileData.xml`).  
> **Scope**: `TileMapLayer` architecture (replacing deprecated monolithic `TileMap`), `TileSet` resources, Atlas & Scene sources, Terrains/Auto-Tiling, transforms & origins, custom tile metadata, Y-sorting, Z-index layering, and physics chunking.

---

## 1. `TileMapLayer` Architecture (Godot 4.3+ Standard)

The monolithic `TileMap` node was deprecated in Godot 4.3 in favor of composing independent **`TileMapLayer`** nodes (`Node2D` subclasses).

### Why Multiple `TileMapLayer` Nodes Beat Legacy `TileMap`
1. **True Scene-Tree Composability**: Each layer is a real `Node2D` with its own `z_index`, `y_sort_enabled`, `modulate`, `material`/`ShaderMaterial`, `visibility`, and `collision_enabled` toggle.
2. **Interleaved Y-Sorting**: Entities (player, enemies, props) can sit directly between or inside a Y-sorted layer (`WorldYSort`) alongside trees/walls without hacks.
3. **Clean Separation of Concerns**: Share a single `.tres` `TileSet` resource across multiple `TileMapLayer` nodes while isolating each layer's role:
   - `GroundLayer` (`z_index = -20`, `collision_enabled = false`) — base terrain, paths, floors.
   - `GroundDecalsLayer` (`z_index = -10`, `collision_enabled = false`) — grass tufts, cracks, transitions, shadows.
   - `WallsAndPropsLayer` (`y_sort_enabled = true`, `collision_enabled = true`) — vertical walls, pillars, trees sharing Y-sort with characters.
   - `CanopyOverlayLayer` (`z_index = 20`, `collision_enabled = false`) — roofs, arches, treetops drawn above actors.
   - `CollisionMaskLayer` (optional invisible structural layer if visual tiles and physical boundaries intentionally differ).

---

## 2. `TileSet` Design: Sources, Alternatives, and Transforms

### Source Types
1. **`TileSetAtlasSource`**: Slices a sprite sheet texture into tiles (`texture_region_size`, `margins`, `separation`).
   - Keep `use_texture_padding = true` (default) to prevent bleeding artifacts from adjacent atlas tiles under subpixel camera motion or linear filtering.
   - Supports multi-cell tiles (e.g., 2x3 pillar or tree) and animated tiles (`TILE_ANIMATION_MODE_DEFAULT` or `TILE_ANIMATION_MODE_RANDOM_START_TIMES` for swaying foliage/water!).
2. **`TileSetScenesCollectionSource`**: Places full `.tscn` scenes (torches, chests, moving traps, interactive doors, spawn markers) directly onto the grid.
   - At runtime, Godot instantiates each scene tile as a child of the `TileMapLayer` at the tile's position.
   - **Godot 4.6+ Enhancement**: Scene tiles in `TileMapLayer` now support rotation/transforms (GH-108010).
   - **Lifecycle Caveat**: Scene tile children are instantiated dynamically during `TileMapLayer` tree setup — do not assume they exist inside a sibling's `_init()`; query after `_ready()` or via `child_entered_tree` / groups.

### Alternative Tiles & Runtime Tile Transforms
- **Alternative Tiles**: Variants of an atlas tile sharing the same sprite region but differing in flip/transpose, `modulate`, `material`, `z_index`, `y_sort_origin`, collision, or `probability` (for weighted random brush painting!).
- **Runtime Transform Flags (`TileSetAtlasSource`)**:
  - `TRANSFORM_FLIP_H`, `TRANSFORM_FLIP_V`, `TRANSFORM_TRANSPOSE` can be bitwise-OR'd into `alternative_tile` when calling `set_cell(coords, source_id, atlas_coords, alt_flags)` — letting you rotate tiles in 90° increments procedurally without bloating the TileSet with manual alternatives!
- **Tile Origins (`TileData.texture_origin` & `y_sort_origin`)**:
  - `texture_origin`: Offsets how the tile sprite draws relative to its grid cell center (vital for tall props/walls whose footprint sits at the base cell).
  - `y_sort_origin`: Offsets the Y-sorting pivot point in pixels relative to the cell center (e.g., set at the base trunk of a tree or front bottom edge of a wall so characters correctly walk behind/in front of it!).

---

## 3. Terrain Sets & Auto-Tiling Engineering

Terrains automate edge, corner, and transition selection using peering bitmasks painted onto each tile in the `TileSet`:

### The Three Terrain Modes (`TileSet.TerrainMode`)
1. **Match Corners and Sides (`TERRAIN_MODE_MATCH_CORNERS_AND_SIDES`)**:
   - Inspects all 8 neighbors (N, NE, E, SE, S, SW, W, NW).
   - Requires a **47-tile blob tileset** (for 1 terrain against empty) for complete coverage of inner corners, outer corners, corridors, and islands.
   - **Best for**: Crisp top-down walls, cliffs, platformer ground blocks with bevels and inner corners.
2. **Match Corners (`TERRAIN_MODE_MATCH_CORNERS`)**:
   - Inspects the 4 diagonal corners (Wang corner tiles — only **16 tiles** per terrain pair!).
   - **Best for**: Organic ground blends (grass-to-dirt, sand-to-water) where smooth transitions matter more than 1-tile-wide corridors.
3. **Match Sides (`TERRAIN_MODE_MATCH_SIDES`)**:
   - Inspects 4 cardinal edges (N, E, S, W — **16 tiles**).
   - **Best for**: Pipes, roads, fences, railroad tracks, narrow pathways.

### Terrain Consistency Best Practices
- Ensure **every** reachable peering bit combination exists in the tileset (missing inner-corner combinations force Godot's solver to pick jarring fallback tiles!).
- Keep **Terrain Set boundaries aligned** with collision semantics: tiles sharing a Terrain Set can transition cleanly into each other (e.g., grass <-> dirt <-> stone), whereas unrelated layers (e.g., elevated cliffs) belong in a separate Terrain Set or separate `TileMapLayer`.
- **Runtime Procedural Painting**:
  - `TileMapLayer.set_cells_terrain_connect(cells, terrain_set, terrain, ignore_empty_terrains)`: Batch-paints an array of `Vector2i` coordinates and updates neighboring transition tiles in one pass. **Always batch cell arrays** rather than calling `set_cells_terrain_connect([single_cell], ...)` in a tight loop!
  - `TileMapLayer.set_cells_terrain_path(path, terrain_set, terrain)`: Ideal for procedural roads, rivers, or tunnels where only consecutive path neighbors should connect.

---

## 4. Coordinates, Custom Data Layers, and Runtime Queries

### Coordinate Conversions
- World -> Local -> Grid:
  ```gdscript
  func world_to_cell(layer: TileMapLayer, world_pos: Vector2) -> Vector2i:
  	return layer.local_to_map(layer.to_local(world_pos))

  func cell_to_world(layer: TileMapLayer, cell: Vector2i) -> Vector2:
  	return layer.to_global(layer.map_to_local(cell))
  ```
  Always pass through `to_local()` / `to_global()` so non-zero layer transforms never skew cell lookups!

### Custom Data Layers (Data-Driven Tiles)
Define strongly typed custom data layers in the `TileSet` (e.g., `"surface_type": StringName`, `"move_speed_multiplier": float`, `"damage_per_sec": float`, `"is_climbable": bool`):
```gdscript
func get_surface_type_at_world_pos(layer: TileMapLayer, world_pos: Vector2) -> StringName:
	var cell: Vector2i = layer.local_to_map(layer.to_local(world_pos))
	var tile_data: TileData = layer.get_cell_tile_data(cell)
	if tile_data == null:
		return &"none"
	if not tile_data.has_custom_data("surface_type"):
		return &"default"
	return StringName(tile_data.get_custom_data("surface_type"))
```
This eliminates fragile atlas-coordinate hardcoding (`if atlas_coords == Vector2i(3, 2): ...`) — artists can reorganize the atlas without breaking gameplay logic!

### Runtime Tile Modification Hooks
Override `_use_tile_data_runtime_update(coords)` and `_tile_data_runtime_update(coords, tile_data)` on a `TileMapLayer` subclass when specific cells need dynamic runtime overrides (e.g., disabling navigation polygon under a placed barricade tile or tinting a damaged tile) without mutating shared `TileSet` data.

---

## 5. Physics Chunking & `physics_quadrant_size` (Godot 4.5+ Critical Detail!)

Verified directly against Godot `4.5–4.7` migration docs and `TileMapLayer.xml`:
- Since **Godot 4.5**, `TileMapLayer` merges adjacent tile collision shapes into chunked physics quadrants controlled by **`physics_quadrant_size`** (default **`16`**, grouping 16×16 = 256 cells per physics body!).
- **Huge Performance Benefit**: Eliminates hundreds/thousands of tiny individual static physics bodies AND eliminates internal tile-seam snagging when sliding across flat floors!
- **CRITICAL API CAVEAT**:
  - `TileMapLayer.get_coords_for_body_rid(body_rid)` returns the **quadrant origin**, NOT the individual tile coordinate, whenever `physics_quadrant_size > 1`!
  - **How to identify an exact collided tile cleanly**:
    - Option A (Recommended, keeps chunking performance): Take the `KinematicCollision2D.get_position()`, offset slightly *into* the surface (`hit_pos - collision.get_normal() * 1.0`), and call `layer.local_to_map(layer.to_local(sample_pos))`.
    - Option B (Only for small destructible-tile layers): Set `physics_quadrant_size = 1` on that specific interactive/destructible `TileMapLayer` so `get_coords_for_body_rid()` returns exact per-tile coordinates.

---

## 6. Y-Sorting, Z-Index, Navigation, and Optimization

- **Y-Sorting Rules**:
  - Enable `y_sort_enabled = true` on the common parent container (`WorldYSort`) **and** on every `TileMapLayer` whose tiles must sort individually with entities (not as one flat plane).
  - Never assign different `z_index` values to nodes that need to Y-sort against each other (`z_index` always takes precedence over Y-sorting!).
- **Navigation Layers**: Avoid putting navigation polygons on *both* ground tiles and obstacle tiles at the same coordinate (overlapping nav polygons create broken agent paths). Prefer baking a `NavigationRegion2D` from physics collision geometry (parsed from the collision `TileMapLayer`) rather than painting TileSet navigation polygons manually on complex multi-layer maps!
- **Rendering Chunking**: Tune `rendering_quadrant_size` (default 16) — larger quadrants reduce draw calls on static maps, smaller quadrants improve frustum culling and reduce rebuild spikes when frequently mutating tiles at runtime.
