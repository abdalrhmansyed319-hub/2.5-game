# 14 — Technical Research and References

> **Research Date**: 2026-11-25  
> **Verified Engine Baseline**: Godot Engine `4.7.2-stable` (released 2026-08-18; source tag `4.7.2-stable`, commit `ed1daf0bf001b61586d9930840f2f1394092c079`).

---

## 1. Research Methodology & Evidence Hierarchy

To prevent hallucinated APIs, outdated Godot 3.x / 4.0 habits, and unverified folklore, all technical claims follow a strict **source priority order**:

1. **Authoritative Engine Source & Class Reference XML** (`github.com/godotengine/godot`, `doc/classes/*.xml` & `modules/*/doc_classes/*.xml` pinned to exact release tag `4.7.2-stable`).
2. **Official Godot Documentation & Migration Guides** (`docs.godotengine.org/en/stable/` & `/en/4.7/`).
3. **Official Godot Release Notes & Merged PR Changelogs** (`godotengine.org/releases/4.4/`, `4.5/`, `4.6/`, `4.7/`).
4. **Foundational Game Engineering Literature** (architecture, patterns, physics, rendering, game feel).
5. **Verified Practical Experiments** (`labs/` + automated static/API verification scripts + future runtime test runs).

---

## 2. Verified Godot 4.4 -> 4.7 Evolution Ledger

Tracking exact engine version deltas prevents introducing deprecated patterns or subtle upgrade bugs:

| Version | Release Date | High-Impact Verified Technical Changes | Primary Source |
| --- | --- | --- | --- |
| **4.4-stable** | 2025-03-03 | Built-in **Jolt Physics** module (experimental); **Typed Dictionaries** (`Dictionary[K, V]`); **UID `.uid` sidecar files**; **Ubershaders**; **2D Physics Interpolation**; **Automatic 2D Batching**; Embedded game window & interactive in-game editing; Patch PCKs; `@export_tool_button`, `@warning_ignore_start/restore`. | `godotengine.org/releases/4.4/` |
| **4.5-stable** | 2025-09-15 | GDScript **`@abstract` classes & methods**; **Variadic functions** (`...args: Array`); **Stencil buffer** support; **AccessKit screen reader** accessibility on `Control`; **Script backtracing & custom `Logger` API**; **Shader Baker**; **`TileMapLayer.physics_quadrant_size` chunking default 16** (behavior change to `get_coords_for_body_rid()`); Jolt `Area3D` always detects static bodies. | `godotengine.org/releases/4.5/`, `upgrading_to_godot_4.5.html` |
| **4.6-stable** | 2026-01-26 | **Jolt Physics default for 3D**; **D3D12 default on Windows**; **`SceneTree.change_scene_to_node()`**; **ObjectDB live snapshots & diffing**; **2D renderer GPU batching overhaul (1.1x–7x faster)**; New 3D IK solvers (`BoneConstraint3D`, `BoneTwistDisperser3D`, `LimitAngularVelocityModifier3D`); `AnimationPlayer` animation names migrated to `StringName`; `Control.pivot_offset_ratio`; rotating scene tiles in `TileMapLayer`; `Array`/`Vector`/`String.reserve()`; `debug/gdscript/warnings/directory_rules`; delta-encoded patch PCKs; SSR overhaul; material debanding. | `godotengine.org/releases/4.6/`, `upgrading_to_godot_4.6.html` |
| **4.7 / 4.7.2-stable** | 2026-06-18 / 2026-08-18 | **`Control` Offset Transforms (`offset_transform_*`)** for container-safe UI animation; **`AreaLight3D`**; **HDR display output**; **Inline text shader previews**; **Nearest-neighbor 3D viewport scaling**; `AnimationNodeBlendSpace1D/2D.sync_mode` (`SyncMode` enum); `PhysicsServer2D.body_set_shape_as_one_way_collision(..., direction)`; GDScript override return type inheritance (GH-115763) & packed array element mutation setter change (GH-113228); new project stretch defaults (`canvas_items` + `expand`); Godot Asset Store; AnimationMixer/Tree optimizations. | `godotengine.org/releases/4.7/`, `upgrading_to_godot_4.7.html`, GitHub release `4.7.2-stable` |

---

## 3. Authoritative Primary Documentation Index

### Official Godot Engine Docs (`docs.godotengine.org/en/4.7/`)
- **Best Practices**:
  - *Scene Organization*: `tutorials/best_practices/scene_organization.html`
  - *Autoloads versus Regular Nodes*: `tutorials/best_practices/autoloads_versus_internal_nodes.html`
  - *Godot Notifications*: `tutorials/best_practices/godot_notifications.html`
  - *Data Preferences & Node Alternatives*: `tutorials/best_practices/node_alternatives.html`
- **Scripting (GDScript)**:
  - *GDScript Reference* (`@abstract`, variadics, static typing, typed dictionaries): `tutorials/scripting/gdscript/gdscript_basics.html`
  - *GDScript Style Guide*: `tutorials/scripting/gdscript/gdscript_styleguide.html`
  - *Static Typing in GDScript*: `tutorials/scripting/gdscript/static_typing.html`
- **Physics & Movement**:
  - *Physics Introduction & Troubleshooting*: `tutorials/physics/index.html`
  - *Using Jolt Physics*: `tutorials/physics/using_jolt_physics.html`
  - *Using Physics Interpolation*: `tutorials/physics/interpolation/using_physics_interpolation.html`
  - *Using CharacterBody2D / 3D*: `tutorials/physics/using_character_body_2d.html`
- **Environments, Rendering, Audio, UI, Optimization**:
  - *TileMapLayer Class Reference*: `classes/class_tilemaplayer.html`
  - *Control Class Reference*: `classes/class_control.html`
  - *Interactive Audio Streams*: `modules/interactive_music/doc_classes/` (`AudioStreamInteractive`, `AudioStreamSynchronized`, `AudioStreamPlaylist`)
  - *Optimization & Profiling Tutorials*: `tutorials/performance/index.html`
  - *Migration Guides (4.3 -> 4.7)*: `tutorials/migrating/index.html`

### Foundational Game Engineering Reference Books
- **Robert Nystrom**, *Game Programming Patterns* — State, Command, Observer, Object Pool, Data Locality, Component, Game Loop.
- **Jason Gregory**, *Game Engine Architecture* (3rd ed.) — Engine subsystems, memory/object lifetimes, fixed-timestep physics, animation blending, rendering pipelines.
- **Steve Swink**, *Game Feel* — Input responsiveness, physics tuning curves, forgiveness mechanics, spatial feedback.
- **Eric Lengyel**, *Foundations of Game Engine Development* — Linear algebra, transforms, collision geometry, rendering math.
- **Martin Fowler / Robert C. Martin**, *Refactoring* & *Clean Architecture* — Modularity, dependency direction, safe incremental refactoring.

---

## 4. Local Class Reference Verification Method (Phase 1 Tooling)

During Phase 1, we checked out the official `godotengine/godot` `4.7.2-stable` `doc/classes/` and core module `doc_classes/` XML files into a non-persisted sandbox cache (`/tmp/godot-ref`, 810+ core class XMLs + GDScript & Interactive Music modules) and paired them with `gdtoolkit 4.5.0` (`gdparse` + `gdlint`) inside `tools/verify_labs.py` so every practical lab script is syntactically parsed, style-linted, and API-verified against authoritative Godot `4.7.2-stable` definitions.
