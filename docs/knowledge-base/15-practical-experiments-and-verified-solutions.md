# 15 — Practical Experiments and Verified Solutions

> **Verification Harness**: `tools/verify_labs.py` (`gdparse 4.5.0`, `gdlint 4.5.0`, official Godot `4.7.2-stable` XML Class Reference index — 837 classes, `.tscn` structural validator, Lab 10 invariant checker).  
> **Honesty Notice**: All 10 practical exercises in `labs/` have been **written, architecture-reviewed, AST-parsed (`33/33`), style/static-linted (`29/29`), API-verified against Godot `4.7.2-stable` XML (`189/189` checks), and scene-validated (`3/3`)**. **None have been executed in a live Godot runtime binary** because no Godot executable is installed in this sandbox and GitHub release asset CDN downloads (`release-assets.githubusercontent.com`) fall outside the sandbox outbound allowlist.

---

## 1. Master Lab Matrix (10 Practical Engineering Exercises)

| Lab | Directory | Files | Core Patterns & Verified Godot 4.7 APIs | Static/API Status | Runtime Status |
| --- | --- | --- | --- | --- | --- |
| **01** | `labs/lab_01_modular_player_controller/` | 6 `.gd`, 1 `.tscn` | Composition over inheritance, `@abstract InputSource2D`, read-only `MovementConfig2D` `Resource`, `@tool` `_get_configuration_warnings()`, `reset_physics_interpolation()` | **PASS** (AST, Lint, API, `.tscn`) | Pending Godot 4.7+ runtime |
| **02** | `labs/lab_02_advanced_movement_system/` | 3 `.gd` | Derived jump kinematics ($v_0 = -2H/t$, $g = 2H/t^2$), coyote time, jump buffer, variable jump cut, apex hang, actor-mask one-way drop-through, `AnimatableBody2D.sync_to_physics` | **PASS** (AST, Lint, API) | Pending Godot 4.7+ runtime |
| **03** | `labs/lab_03_interaction_framework/` | 2 `.gd` | Asymmetric `Area2D` (`monitoring` vs `monitorable`), composite priority/facing/distance scoring, `_physics_process` `direct_space_state` LOS raycast, `is_instance_valid()` candidate pruning | **PASS** (AST, Lint, API) | Pending Godot 4.7+ runtime |
| **04** | `labs/lab_04_modular_enemy_ai/` | 5 `.gd` | `@abstract AIState`, `AIStateMachine` with re-entrancy guard & `Dictionary[StringName, Variant]` blackboard, throttled vision cone + memory decay, throttled `NavigationAgent2D` | **PASS** (AST, Lint, API) | Pending Godot 4.7+ runtime |
| **05** | `labs/lab_05_inventory_architecture/` | 3 `.gd` | Immutable `ItemDefinition` `Resource`, `InventorySlot`, transactional `InventoryContainer` (atomic `remove_item`, remainder-returning `add_item`, weight caps, deep-copied metadata, registry deserialization) | **PASS** (AST, Lint, API) | Pending Godot 4.7+ runtime |
| **06** | `labs/lab_06_tilemap_environment/` | 1 `.gd`, 1 `.tscn` | 4-layer `TileMapLayer` rig, shared `TileSet` custom data queries, batched `set_cells_terrain_connect()`, 90° `TileSetAtlasSource.TRANSFORM_*` bitmasks, chunk-safe hit-cell resolution (`physics_quadrant_size`) | **PASS** (AST, Lint, API, `.tscn`) | Pending Godot 4.7+ runtime |
| **07** | `labs/lab_07_save_load_system/` | 2 `.gd` | `@abstract SaveableComponent` with stable `persistent_id`, non-executable JSON + `HMACContext` SHA-256 integrity envelope, `v1 -> v2` schema migrator, atomic `.tmp -> .bak -> .sav` via `DirAccess.rename_absolute()` | **PASS** (AST, Lint, API) | Pending Godot 4.7+ runtime |
| **08** | `labs/lab_08_responsive_ui_architecture/` | 1 `.gd`, 1 `.tscn` | Responsive Container hierarchy, `MOUSE_FILTER_IGNORE` hygiene, AccessKit `accessibility_name`, focus save/restore + wrap-around neighbors, Godot 4.7 `Control.offset_transform_*` animations, `reduced_motion` toggle | **PASS** (AST, Lint, API, `.tscn`) | Pending Godot 4.7+ runtime |
| **09** | `labs/lab_09_profiling_and_optimization/` | 2 `.gd` | Generic leak-safe `NodeObjectPool` (double-release guard, `reset_physics_interpolation()`, orphan cleanup), seeded `MultiMeshInstance2D` vs `Sprite2D` harness, `Performance.add_custom_monitor()` & `p99` frame-time tracking | **PASS** (AST, Lint, API) | Pending Godot 4.7+ runtime |
| **10** | `labs/lab_10_debugging_broken_systems/` | 8 `.gd` (4 buggy, 4 fixed) | 4 paired classic Godot defects: (1) signal lambda leak & freed node ref; (2) `CharacterBody2D` double-`delta` & synchronous physics flush mutation; (3) shared `Resource` mutation; (4) `@export` setter before `_ready()` & upward `get_parent()` coupling | **PASS** (AST 8/8, Lint 4/4 fixed, Invariants 4/4) | Pending Godot 4.7+ runtime |

---

## 2. Real Defects Caught & Repaired During Static Verification

Running `tools/verify_labs.py` caught **7 genuine issues** on the first validation pass before final sign-off:

1. **`.tscn` `load_steps` mismatch (`lab_01/modular_actor_2d.tscn`)**:
   - *Finding*: Header declared `load_steps=5`, whereas the scene contained `4 ext_resource + 2 sub_resource` requiring `load_steps=7`.
   - *Fix*: Updated to `[gd_scene load_steps=7 format=3]`.
2. **Function complexity smell (`lab_07/save_system.gd`)**:
   - *Finding*: `gdlint` flagged `_read_and_verify()` with `max-returns` (>6 return exits), revealing mixed file I/O and envelope cryptographic verification responsibilities.
   - *Fix*: Extracted `_parse_and_verify_envelope(raw_text)` as a dedicated cohesive helper, simplifying both control flows.
3. **GDScript class definition ordering violation (`lab_09/performance_benchmark_harness_2d.gd`)**:
   - *Finding*: `gdlint` flagged `enum RenderMode` declared after `const` declarations (`class-definitions-order`), violating the official Godot GDScript Style Guide (`signals -> enums -> constants -> exports -> vars -> funcs`).
   - *Fix*: Moved `enum RenderMode` cleanly above constants.
4. **Line-length style violations across Labs 03, 05, 06, 07, 09**:
   - *Finding*: 11 lines exceeded Godot's 100-character limit (`max-line-length`).
   - *Fix*: Refactored verbose expressions and comments cleanly across all affected files.

**Post-fix verification run (`python3 tools/verify_labs.py`)**:
- `gdparse`: **33 / 33 passed**
- `gdlint`: **29 / 29 passed** (4 intentionally broken files in `lab_10/buggy/` excluded from style linting, still AST-parsed)
- Godot `4.7.2-stable` XML Class-Ref API audit: **189 / 189 checks passed** (against 837 official classes)
- `.tscn` structural validator: **3 / 3 passed**
- Lab 10 diagnostic invariants: **4 / 4 pairs passed**

---

## 3. Distilled Reusable Solutions Catalog

The following patterns proved clean, idiomatic, and directly reusable across future Godot 4.7+ projects:

1. **Zero-Allocation Input Intent Boundary** (`Lab 01`): Reusing a single `InputIntent2D` instance behind `@abstract InputSource2D` keeps player controllers 100% swappable for AI, scripted tests, or replays without allocating per physics tick.
2. **Designer-Space Jump Kinematics** (`Lab 02`): Computing `v0` and `g` from `jump_height` and `time_to_apex` decouples level geometry constraints from arbitrary gravity tweaking.
3. **Chunk-Safe `TileMapLayer` Hit Lookup** (`Lab 06`): Stepping `1.5 px` inward along `-collision.get_normal()` preserves Godot 4.5+ `physics_quadrant_size = 16` chunking speed while still pinpointing exact collided tiles.
4. **Tamper-Evident Crash-Safe Saves** (`Lab 07`): Canonical JSON inside an HMAC-SHA256 envelope written via `.tmp` -> `.bak` rotation -> `DirAccess.rename_absolute()` eliminates both `.tres` code-execution risks and mid-write save corruption.
5. **Container-Safe UI Juice** (`Lab 08`): Godot 4.7's `Control.offset_transform_enabled` + `offset_transform_visual_only = true` lets buttons scale/bounce inside `VBoxContainer` / `GridContainer` without breaking container layout or mouse hover stability.
6. **Runtime Pool Hygiene** (`Lab 09`): Tracking live instance IDs in `_active: Dictionary[int, Node]` prevents catastrophic double-release aliasing bugs, while calling `reset_physics_interpolation()` on acquire eliminates teleport streaks.

---

## 4. Next Verification Step (When Godot 4.7+ Runtime Becomes Available)

Opening `labs/project.godot` in Godot `4.7.2-stable` (or running headless `godot --headless --path labs --quit --check-only` plus a GUT/GdUnit4 suite) is the exact bridge required to promote these 10 labs from **Level 2 (Code Reviewed / Static & API Verified)** to **Level 3 (Executed)** and **Level 4 (Feature Tested)**.
