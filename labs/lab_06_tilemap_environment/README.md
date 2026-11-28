# Lab 06 — Multi-Layer TileMapLayer Environment Engineering

## 1. Objective
Construct a modern Godot 4.5–4.7 `TileMapLayer` multi-layer environment rig demonstrating clean visual/collision/Y-sort layering, shared `TileSet` custom metadata queries, batched terrain auto-tiling, procedural 90° tile rotation flags, and exact collision cell resolution compatible with Godot 4.5+ `physics_quadrant_size` physics chunking.

## 2. Technical Approach
- Replace deprecated `TileMap` with 4 purpose-built `TileMapLayer` nodes sharing one `TileSet` resource: `GroundLayer` (`z_index = -20`), `WallsAndPropsLayer` (`y_sort_enabled = true`, `physics_quadrant_size = 16`), `DestructibleLayer` (`physics_quadrant_size = 1` for per-cell `body_rid`), and `CanopyOverlayLayer` (`z_index = 20`).
- Query gameplay semantics (`surface_type`, `speed_multiplier`) exclusively through `TileData.get_custom_data()` so atlas reorganization never breaks gameplay code.
- Resolve collided tiles on chunked layers by nudging `collision.get_position() - collision.get_normal() * penetration_bias_px` into `local_to_map()`, avoiding the Godot 4.5+ `get_coords_for_body_rid()` quadrant-origin trap.
- Compute procedural 90° tile rotations using bitwise `TileSetAtlasSource.TRANSFORM_FLIP_H/V/TRANSPOSE` flags rather than duplicating atlas variants.

## 3. Architecture
```text
TileEnvironment (Node2D, y_sort_enabled = true, TileEnvironmentController)
├── GroundLayer (TileMapLayer, z_index = -20, collision_enabled = false)
├── WorldYSort (Node2D, y_sort_enabled = true)
│   ├── WallsAndPropsLayer (TileMapLayer, y_sort_enabled = true, physics_quadrant_size = 16)
│   └── DestructibleLayer (TileMapLayer, y_sort_enabled = true, physics_quadrant_size = 1)
└── CanopyOverlayLayer (TileMapLayer, z_index = 20, collision_enabled = false)
```

## 4. Implementation
- `tile_environment_controller.gd`: Layer coordinator, world<->cell transform helpers, chunk-safe `resolve_collided_cell()`, custom data queries, batched `paint_terrain_region()`, and `set_rotated_atlas_tile()`.
- `tile_environment.tscn`: Multi-layer scene wiring all 4 `TileMapLayer` nodes and a shared `TileSet` with two custom data layers (`surface_type`, `speed_multiplier`).

## 5. Testing Process
- **Code Written**: Complete (1 `.gd` script + 1 `.tscn` scene).
- **Static Verification (`tools/verify_labs.py`)**: Verified via `gdparse`, `gdlint`, Godot `4.7.2-stable` XML Class-Ref API checks (`TileMapLayer`, `TileSetAtlasSource` constants, `TileData`, `KinematicCollision2D`), and `.tscn` structural validation (`load_steps=3`, valid `NodePath` references).
- **Runtime Execution in Godot**: *Not yet executed* (pending Godot 4.7+ binary; planned tests include sliding collision across chunked 16x16 floors verifying `resolve_collided_cell()` accuracy, surface metadata lookups under non-zero layer offsets, and 4-step rotation bitmask verification).

## 6. Problems Encountered
- In Godot 4.5+, `get_coords_for_body_rid()` silently returns the 16x16 physics quadrant origin rather than the exact tile coordinate unless `physics_quadrant_size = 1`. Handled cleanly by documenting and implementing both strategies: normal-biased world lookup for static chunked walls, and `physics_quadrant_size = 1` strictly isolated to `DestructibleLayer`.
- Bitwise rotation order matters: `TRANSPOSE | FLIP_H` gives 90° CW while `TRANSPOSE | FLIP_V` gives 270° CW (90° CCW).

## 7. Final Result
A clean, Godot 4.7-idiomatic environment scaffold ready to accept any tileset/terrain assets without architectural changes.

## 8. Possible Improvements
- Add `_use_tile_data_runtime_update()` / `_tile_data_runtime_update()` on a specialized `TileMapLayer` subclass to dynamically disable navigation cells beneath placed obstacles.
- Add a `NavigationRegion2D` baker that parses `WallsAndPropsLayer` physics geometry automatically.
