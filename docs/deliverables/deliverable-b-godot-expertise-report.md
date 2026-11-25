# Deliverable B — Godot Expertise Report

> **Target Engine Baseline**: Godot Engine `4.7.2-stable` (verified against official `godotengine/godot` `4.7.2-stable` XML Class Reference — 837 loaded classes — and official `docs.godotengine.org` 4.4–4.7 documentation).

---

## 1. Engine Architecture
- **Dual-Layer Server/Scene Model**: Low-level C++ Servers (`RenderingServer`, `PhysicsServer2D/3D`, `AudioServer`, `NavigationServer2D/3D`, `AccessibilityServer`) store cache-friendly simulation data behind opaque `RID` handles; `SceneTree` + `Node` provide ergonomic composition, editor integration, and deterministic tree-owned lifecycles.
- **Exact Lifecycle Discipline**: `_init()` -> `_enter_tree()` (top-down) -> `@onready` + `_ready()` (bottom-up) -> `_process()` / `_physics_process()` -> `_exit_tree()` (bottom-up) -> `NOTIFICATION_PREDELETE`.
- **Memory & Ownership**: Explicit distinction between `RefCounted` (`Resource`, `FileAccess`, `HMACContext` — watch reference cycles, break with `WeakRef`) and manual `Object`/`Node` lifetimes (orphan leaks caught via `OBJECT_ORPHAN_NODE_COUNT` and Godot 4.6 **ObjectDB Snapshots & Diffing**).
- **Scene Transitions & Project Hygiene**: Prefer explicit root `WorldContainer` swapping (or Godot 4.6 `SceneTree.change_scene_to_node()` + `ResourceLoader.load_threaded_request()`) over raw synchronous `change_scene_to_file()`. Always commit `.uid` (Godot 4.4+) and `.import` sidecar files while ignoring `.godot/`.
- **Communication Hierarchy**: "Call down, signal up." Reserve Autoloads for thin cross-scene coordinators; use `class_name` + `static func`/`static var` for utilities and Groups (`StringName`) for cross-cutting capabilities.

## 2. Advanced GDScript Programming
- **Modern Godot 4.4–4.7 Language Features Mastered**:
  - Strict static typing across variables, functions, `Array[T]`, and **Typed Dictionaries (`Dictionary[K, V]`, 4.4+)**.
  - **`@abstract` classes and methods (4.5+)** enforcing compile-time subclass contracts (applied in Labs 01, 04, 07).
  - **Variadic functions (`...args: Array`, 4.5+)** with `.callv()` forwarding.
  - **Godot 4.7 breaking nuances**: Overridden typed-return methods inherit return types and require explicit `return` paths (GH-115763); packed array element writes no longer trigger parent property setters (GH-113228).
  - Scoped warning suppression (`@warning_ignore_start` / `@warning_ignore_restore`) and Godot 4.6 directory warning rules (`debug/gdscript/warnings/directory_rules`).
- **Safety Disciplines**: Guard `@onready` access inside `@export` setters with `if is_node_ready():`; validate `is_instance_valid()` after `await` and on cached `Node` refs; store bound `Callable` references for explicit disconnect; use `StringName` (`&"..."`) for hot identifiers.
- **Polyglot Judgment**: Default to strictly typed GDScript; introduce C# or GDExtension only when profiling proves a tight CPU-compute bottleneck unreachable via Godot's native C++ Servers or compute shaders.

## 3. Physics and Movement Systems
- **3D & 2D Engine Baseline**: Built-in **Jolt Physics** is now the default 3D physics engine (since Godot 4.6); `GodotPhysics2D` drives 2D. Key Jolt behaviors verified (4.5 `Area3D` static overlap reporting; 4.7 `SoftBody3D` mass & `WorldBoundaryShape3D` plane sign normalization).
- **Body Discipline**: `StaticBody` (immovable), `AnimatableBody` (`sync_to_physics = true` for moving platforms/doors), `CharacterBody` (`move_and_slide()` — velocity in units/sec, never double-multiplied by `delta`), `RigidBody` (forces/impulses/`_integrate_forces`), `Area` (asymmetric `monitoring` vs `monitorable` flags to cut broadphase cost). Never scale `CollisionShape` non-uniformly.
- **Responsive Movement Engineering**: Derived jump kinematics from designer metrics (`jump_height`, `time_to_apex`), asymmetric rise/fall gravity, apex hang, coyote time, jump buffering, variable jump cut, slope snapping (`floor_snap_length`, `floor_stop_on_slope`, `floor_constant_speed`), actor-mask one-way drop-through, and moving-platform momentum inheritance (`PLATFORM_ON_LEAVE_ADD_VELOCITY`).
- **Physics Interpolation (4.4–4.7)**: Move interpolated gameplay nodes strictly in `_physics_process()`, call `reset_physics_interpolation()` on teleports/pool acquisition, and validate by testing temporarily at `10 Hz` physics tick rate.

## 4. Animation Systems
- **Unified `AnimationMixer` Core**: Shared base for `AnimationPlayer` and `AnimationTree` managing `AnimationLibrary` assets, `callback_mode_process` (mandatory `PHYSICS` when driving moving platforms or hitboxes), `RESET` tracks preventing dirty interrupted state, and deterministic evaluation.
- **Godot 4.6–4.7 Updates**: `AnimationPlayer` animation names use `StringName` (4.6); new 3D IK constraint/solver stack (`BoneConstraint3D`, `BoneTwistDisperser3D`, `LimitAngularVelocityModifier3D`, 4.6); `AnimationNodeBlendSpace1D/2D` uses `SyncMode` enum `sync_mode` and named blend points (4.7).
- **Gameplay/Presentation Decoupling**: Gameplay FSM owns state truth and feeds parameters to `AnimationTree`; Call Method tracks emit lightweight animation events rather than reaching into external gameplay managers; `State.exit()` always guarantees hitbox/VFX cleanup on interruption.
- **Procedural & `Tween` Hygiene**: Apply squash-and-stretch on visual child pivots (never the `CharacterBody` root); bind Tweens to owning nodes (`node.create_tween()`) and kill competing Tweens before launching replacements.

## 5. Rendering and Shaders
- **Renderer Selection**: `Forward+` (desktop Vulkan/D3D12 [Windows default 4.6]/Metal, full GI/HDR/AreaLight3D), `Mobile` (bandwidth-optimized Vulkan/D3D12/Metal, overhauled Glow 4.6, foveated subsampled images 4.7), `Compatibility` (OpenGL/WebGL2, simple SSAO & motion vectors 4.6).
- **2D Pipeline & Batching**: Automatic 2D batching (4.4+, GPU-overhauled 1.1x–7x faster in 4.6) preserved by atlasing textures, sharing materials, using **`instance uniform`** shader parameters for per-entity variation (hit-flash/tint), and minimizing `z_index` fragmentation.
- **3D & Post-Processing Capabilities (4.5–4.7)**: Stencil buffer support (4.5), material debanding & HDR precision (4.6), `AreaLight3D`, HDR display output, nearest-neighbor 3D viewport scaling, and inline text shader previews (4.7); Ubershaders (4.4) + Shader Baker (4.5) minimize pipeline compilation stutter.
- **Pixel-Perfect & Viewport Control**: Conscious choice between `viewport` vs `canvas_items` stretch modes (4.7 defaults new projects to `canvas_items` + `expand`), `Nearest` filtering for pixel art, and `UPDATE_WHEN_VISIBLE`/`UPDATE_ONCE` discipline on `SubViewport`s.

## 6. TileMap and Environment Systems
- **`TileMapLayer` Modularity**: Compose independent `TileMapLayer` nodes (Ground, Decals, Y-Sorted Walls/Props, Canopy Overlay, Destructible) sharing one `TileSet` `.tres` resource.
- **Data-Driven Tiles & Terrains**: Use typed `TileSet` custom data layers (`surface_type`, `speed_multiplier`) instead of hardcoding atlas coordinates; select the right Terrain Mode (Match Corners & Sides 47-tile blob vs. Match Corners 16-tile Wang vs. Match Sides 16-tile path); batch runtime updates via `set_cells_terrain_connect()`.
- **Scene Tiles & Transforms**: `TileSetScenesCollectionSource` (now supporting rotated scene tiles since Godot 4.6) and procedural 90° atlas rotation via `TileSetAtlasSource.TRANSFORM_FLIP_H/V/TRANSPOSE`.
- **Godot 4.5+ Physics Chunking Mastery**: Preserve `physics_quadrant_size = 16` on static terrain for seam-free performance and pinpoint exact collided tiles using normal-biased `local_to_map()`, reserving `physics_quadrant_size = 1` strictly for small destructible layers requiring `get_coords_for_body_rid()`.

## 7. UI and UX Engineering
- **Layout Architecture**: Anchors/Offsets for viewport-pinned frames + Containers (`MarginContainer`, `VBoxContainer`, `HBoxContainer`, `GridContainer`, `PanelContainer`, `CenterContainer`) for flow layouts; never fight container child transforms manually.
- **Godot 4.7 Container-Safe Animations**: Use `Control.offset_transform_enabled`, `offset_transform_visual_only = true`, `offset_transform_pivot_ratio`, and `offset_transform_scale` to animate buttons/cards inside Containers without layout jitter or hover-hitbox loss.
- **Input & Focus Mastery**: Strict `MOUSE_FILTER_IGNORE` on passive overlays, gameplay clicks routed through `_unhandled_input()`, explicit focus restoration on modal close, and wrap-around `focus_neighbor_*` wiring for gamepad/keyboard parity.
- **Accessibility (4.5–4.7)**: Native AccessKit properties (`accessibility_name`, `accessibility_description`, `accessibility_live`), reduced-motion toggles, colorblind-safe visual redundancy, and centralized `Theme` + `ThemeTypeVariation` styling.

## 8. Audio Systems
- **Playback & Spatialization**: `AudioStreamPlayer` (UI/music), `AudioStreamPlayer2D/3D` (mono-forced spatial SFX), `max_polyphony` to avoid clip cutting without spawning nodes, and detached/pooled one-shot players so dying actors never chop their own death SFX.
- **Bus & Volume Hygiene**: Structured bus tree (`Master [Limiter]` -> `Music`, `SFX [Combat/World/UI]`, `Ambience`, `Voice`), linear `0.0–1.0` persisted slider values mapped via `AudioServer.set_bus_volume_linear()` / `linear_to_db()`, and `Area2D/3D` `audio_bus_override` reverb zones.
- **Variation & Native Adaptive Music**: Zero-code variation via `AudioStreamRandomizer` (`PLAYBACK_RANDOM_NO_REPEATS`, `random_pitch_semitones`, `random_volume_offset_db`); native adaptive music via `AudioStreamSynchronized` (phase-locked vertical stems), `AudioStreamInteractive` (bar/beat-synced horizontal transitions + stingers), and `AudioStreamPlaylist`.

## 9. Advanced Gameplay Systems
- **Decoupled 3-Layer Pattern**: Immutable `Resource` blueprints -> Pure `RefCounted`/Component logic models -> Signal-driven Presentation/UI views.
- **Engineered Blueprints**: Componentized Combat (`DamagePacket` + `HealthComponent` + `Hitbox` + `Hurtbox`), Priority/LOS Interaction (`Interactor2D`/`Interactable2D`), Transactional Inventory (`ItemDefinition`/`InventorySlot`/`InventoryContainer`), Modular AI (`@abstract AIState` + FSM Blackboard + Throttled Perception + Throttled `NavigationAgent`), and Crash-Safe Versioned Save/Load (non-executable JSON + HMAC-SHA256 + `v1 -> v2` migrator + atomic `.tmp -> .bak -> .sav` swap).

## 10. Performance Engineering & Optimization
- **Measurement-First Discipline**: Profile CPU Profiler, GPU Visual Profiler, `Performance` monitors + custom monitors (`Performance.add_custom_monitor()`), `p99` frame-time tracking, RenderDoc, and Godot 4.6 ObjectDB snapshots before refactoring for speed.
- **High-Leverage Techniques**: `MultiMeshInstance2D/3D` (and `RenderingServer.multimesh_set_buffer()`), `NodeObjectPool` eliminating spawn/free spikes, `Array`/`String.reserve()` (4.6), staggered AI/raycast ticks, 2D atlasing + `instance uniform` shaders, Mesh LOD/occlusion culling/VRAM compression in 3D, and threaded asset loading + shader warmup to eliminate runtime stutters.

## 11. Debugging and Quality Assurance
- **Modern Godot 4.5–4.7 Diagnostics**: Release-mode script backtraces (`always_track_call_stacks`) + custom `Logger` subclasses (4.5), ObjectDB live leak diffing + debugger Step Out + editor runtime speed controls (4.6).
- **Defect Prevention**: Static analysis (`gdparse` + `gdlint`), official XML Class-Ref verification, automated GUT/GdUnit4 headless unit & integration testing, orphan-node assertions (`OBJECT_ORPHAN_NODE_COUNT == 0`), and strict 5-level verification honesty.
