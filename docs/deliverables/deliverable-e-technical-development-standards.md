# Deliverable E — Technical Development Standards

> **Authority**: Mandatory engineering standards to enforce from Day 1 on any future Godot project created after Phase 1.

---

## 1. Technical Decision-Making Protocol (Mandatory Pre-Implementation Gate)

Before engineering any significant system, refactor, or dependency, document explicit answers to all **9 protocol questions**:

1. **What exact problem are we solving?** (State the gameplay/technical symptom, not a preconceived solution.)
2. **What is the simplest reliable solution?** (Baseline minimum-complexity approach.)
3. **What alternative solutions exist?** (At least 2 viable technical approaches.)
4. **What are the concrete advantages and disadvantages of each?** (Iteration speed, coupling, runtime cost, failure modes.)
5. **How will this affect other systems?** (Physics tick, rendering batching, save schema, UI focus, scene lifecycle, asset pipeline.)
6. **What are the performance implications?** (CPU/GPU/VRAM/allocation profile at expected scale.)
7. **How easy will it be to maintain and change later?** (Onboarding clarity, refactoring blast radius, Inspector ergonomics.)
8. **How will we test and verify it?** (Static checks, headless unit/integration tests, interactive verification steps.)
9. **Is this solution appropriate for the actual project scope and phase?** (Prototype vs. vertical slice vs. production.)

---

## 2. Project Bootstrap Standards (Day-1 Checklist)

Before writing gameplay code in any new Godot 4.x project:
1. **Pin Exact Engine Version**: Record exact Godot version (e.g., `4.7.2-stable`) in `README.md` and CI; never mix minor Godot versions across contributors without running the official migration checklist.
2. **Configure Renderer & Physics Consciously**: Lock renderer (`Forward+` / `Mobile` / `Compatibility`), 3D physics (`Jolt Physics`), `physics_ticks_per_second`, and `physics_interpolation` before authoring physics scenes.
3. **Lock Strict GDScript Compiler Warnings**:
   - Escalate `untyped_declaration`, `unsafe_property_access`, `unsafe_method_access`, `unsafe_call_argument`, and `unsafe_cast` to **Error** (`=2`) for project code; exclude third-party `addons/` via `debug/gdscript/warnings/directory_rules` (Godot 4.6+).
   - Enable `debug/settings/gdscript/always_track_call_stacks = true` (Godot 4.5+) for release diagnostics.
4. **Name All Physics, Render, and Navigation Layers First**: Zero anonymous layer numbers allowed in scripts or `.tscn` files.
5. **Define InputMap Actions First**: Zero raw keycode checks (`KEY_SPACE`, `KEY_E`) in gameplay logic; use `StringName` action constants (`&"jump"`, `&"interact"`).
6. **Configure `.gitignore` Properly**: Ignore `.godot/`, export builds, and OS scratch files; **always commit `.uid` and `.import` files**.
7. **Establish Feature-First Directory Layout**: Co-locate scene, script, and local resources by domain (`core/`, `entities/`, `systems/`, `world/`, `ui/`, `audio/`).

---

## 3. Subsystem-Specific Standards

| Subsystem | Mandatory Standard |
| --- | --- |
| **Scene & Node Design** | Every entity scene runs standalone (`F6`) without crashing. Root script wires child components via `@export` injection and emits `_get_configuration_warnings()` when required exports are missing. |
| **Resources & Assets** | Shared `.tres` definitions are immutable. Asset import presets are standardized per category (sprite filtering, VRAM compression, mono force on 2D/3D spatial SFX, audio loop points). |
| **Physics & Movement** | All physics body motion runs inside `_physics_process()`; `CharacterBody.velocity` stays in units/sec; `CollisionShape` is never non-uniformly scaled; physics flush mutations use `set_deferred()`; teleports call `reset_physics_interpolation()`. |
| **Animation** | Keep a `RESET` track in every `AnimationPlayer`. Use `ANIMATION_CALLBACK_MODE_PROCESS_PHYSICS` when animating colliders/platforms. Cleanup active hitboxes inside `State.exit()`. |
| **Rendering & Shaders** | Share `ShaderMaterial` across identical entities and vary per-instance state via `instance uniform`. Keep draw calls bounded via atlases / `MultiMesh`. Avoid unnecessary `BackBufferCopy` / always-updating `SubViewport`s. |
| **TileMap Environments** | Use separate `TileMapLayer` nodes per role (`Ground`, `Walls/YSort`, `Canopy`). Drive gameplay tile properties via `TileSet` custom data layers. Preserve `physics_quadrant_size = 16` on static terrain. |
| **UI & UX** | Layout exclusively with Anchors + Containers. Set passive wrappers to `MOUSE_FILTER_IGNORE`. Route world input through `_unhandled_input()`. Support full keyboard/gamepad focus + restoration + AccessKit labels + `reduced_motion`. Use Godot 4.7 `offset_transform_*` for container-safe UI animations. |
| **Audio** | Route all audio through named buses with an `AudioEffectLimiter` on `Master`. Persist user volumes as linear `0.0–1.0`. Use `AudioStreamRandomizer` for repeated SFX and native `AudioStreamInteractive`/`Synchronized` for adaptive music. |
| **Persistence (Save/Load)** | Never load untrusted user save files via `ResourceLoader.load()` (`.tres` RCE risk). Use versioned JSON (or safe binary without objects) + HMAC integrity + schema migrators + atomic `.tmp -> .bak -> .sav` writes. Key entities by stable `persistent_id`, never `NodePath`. |
| **Randomness** | Never use global `randi()`/`randf()` for procedural generation or testable mechanics — always inject an explicit seeded `RandomNumberGenerator`. |

---

## 4. Performance & Quality Gates

### Mandatory Pre-Merge CI / Local Gate
1. `gdparse` AST pass on 100% of `.gd` files.
2. `gdlint` pass with zero errors (100-char max line length, strict class ordering, complexity bounds).
3. Headless Godot script check (`godot --headless --quit --check-only`) when Godot runtime is available.
4. Automated GUT / GdUnit4 unit & scene integration suite green.
5. `Performance.OBJECT_ORPHAN_NODE_COUNT == 0` verified after scene teardown and pool release cycles.

### Quantitative Milestone Budgets (Baseline Targets — Calibrated Per Project Spec)
- **Frame Pacing**: `p99` frame time strictly below target frame budget (`<= 16.6 ms` for 60 FPS; dev headroom target `<= 11 ms`).
- **Memory Leaks**: `0` net object growth across repeated scene load/unload cycles verified via Godot 4.6 **ObjectDB Snapshot Diffing**.
- **Verification Reporting**: Every pull request and milestone sign-off must explicitly declare its achieved Verification Level (`1: Written`, `2: Reviewed`, `3: Executed`, `4: Tested`, `5: Verified in Game`) with zero inflated claims.
