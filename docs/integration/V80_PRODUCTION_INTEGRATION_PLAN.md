# VERDANT SIGNAL — V8.0 Production Integration Architecture & Stage Checkpoint

**Checkpoint Commit Base:** `4dee7d9` on `arena/1d52d1b9-2-5-game` (`main` untouched)  
**Approved Visual Source (Preserved Untouched):** `game/assets/v80_living_world_study/`  
**Target Production Project:** `game/` (`res://project.godot`)

---

## Stage A — Production Codebase Audit Summary

Full line-by-line inspection of the existing production project (`game/`) verified the following active runtime architecture:

| System | Existing Production Path(s) | Status & Integration Strategy |
| :--- | :--- | :--- |
| **Project Config & Renderer** | `game/project.godot` | Already configured for Godot 4.7 `GL Compatibility` + `fallback_to_angle=true`, Nearest filtering, pixel snapping, MSAA/HDR off, and all 5 strict GDScript type warnings enabled. Upgrade viewport cleanly from `480×270` (`960×540` window) to V8.0's approved `640×360` (`1280×720` exact `2×` integer window on `1366×768` Intel HD 3000). |
| **Autoloads** | `autoload/game_state.gd`, `autoload/audio_director.gd` | Preserve both lean autoloads intact. Update `GameState.DEFAULT_VIEWPORT_SIZE` to `Vector2i(640, 360)` and add clean field-discovery tracking for `interact_sample`. |
| **Boot Diagnostics** | `scenes/boot/main.tscn`, `scenes/boot/main.gd` | Preserve full DDL-015 hardware/GPU/AudioBus diagnostics. Update scaling readout to `640×360`, verify V8.0 assets, and support `--verify-production` / `--capture-production-proofs` CLI flags for Windows verification. |
| **Asset Registry** | `systems/asset_paths.gd` | Preserve all existing `AST-001`..`AST-007` production & placeholder paths untouched; register V8.0 Living World & unmodified Mara original character asset paths cleanly alongside them. |
| **Player Controller** | `characters/player/player.tscn`, `characters/player/player.gd` | Preserve `PlayerController` (`class_name`), `acoustic_pulse_emitted`, `water_ripple_requested`, crouch-stealth, Acoustic Field Lens, canopy overlap tracking, and `Camera2D`. Integrate bit-for-bit unmodified `88×88` Mara strips (`char_idle/walking/running_88x88_8x4.png`), `sprint_dodge` run state, `OcclusionPeekSprite` with `mara_natural_occlusion.gdshader`, and terrain speed multiplier support without fabricating missing sprites. |
| **Playable World & Chunk Streaming** | `world/rimlands_prototype.tscn`, `world/rimlands_prototype.gd`, `world/world_chunk_streamer.gd`, `world/rimlands_tileset_builder.gd` | Mount modular `VerdantLivingForest` (`world/living_forest/verdant_living_forest.tscn`) as the playable Living Forest Sanctuary (`2304×1536`) directly inside `RimlandsPrototype`. Share unified `y_sort_enabled` world hierarchy with `Player`, keep `WorldChunkStreamer` 3×3 streaming (9 active chunks) operating cleanly with zero legacy prop overlap inside the living forest sanctuary footprint, and wire Acoustic Field Lens scanning to both V8.0 living forest landmarks/flora and chunk-streamed `FloraProp`s. |
| **Existing World Props & VFX** | `world/flora/flora_prop.*`, `world/props/singing_reedwood_tree.*`, `world/landmarks/drop_pod_clearing.*`, `world/vfx/ground_ring_vfx.gd` | Preserve 100% intact (zero deletions). |
| **HUD & Controls** | `ui/prototype_hud.tscn`, `ui/prototype_hud.gd` | Adapt anchor offsets cleanly for `640×360` viewport readability; display V8.0 Living World telemetry (Mood, Active Culled Tufts, Terrain Zone, Wind Gust status, Field Samples) alongside FPS, frame ms, GPU adapter, chunk status, and Acoustic Field Lens scans. |
| **Headless Smoke Runner** | `tests/smoke_runner.tscn`, `tests/smoke_runner.gd` | Preserve all M01 assertions and extend to verify all integrated V8.0 scripts, scenes, shaders, living ecosystem JSON, pooled grass tufts, unmodified character textures, and live integrated `RimlandsPrototype` stepping. |

---

## Conflicts Discovered During Audit & Planned Resolutions

1. **Strict GDScript Type Warnings (`game/project.godot`):** Production enforces all 5 strict GDScript type warnings (`untyped_declaration`, `unsafe_property_access`, `unsafe_method_access`, `unsafe_call_argument`, `unsafe_cast`). Standalone V8.0 GDScript contained untyped JSON dictionary lookups and loop variables. **Resolution:** Author `verdant_living_forest.gd` and all production edits with 100% explicit static typing (`Dictionary` helper accessors, typed arrays, explicit casts).
2. **Input Action Name Mismatch (`sprint` vs `sprint_dodge`):** Standalone V8.0 checked `"sprint"`, whereas production `project.godot` defines `"sprint_dodge"` (`Shift`/`Space`). **Resolution:** Adapt production `PlayerController` to bind Run to production's existing `"sprint_dodge"` action while keeping all other M01 actions unchanged.
3. **Physics Collision Layer Alignment:** Production places `Player` on Layer 3 (`collision_layer = 4`, `collision_mask = 11`), `world_solid` on Layer 1 (`bit 1`), and `canopy_occluder` on Layer 8 (`bit 128`). Standalone V8.0 placed walkable `Area2D` zones on `collision_mask = 2`. **Resolution:** Align all V8.0 solid `StaticBody2D` obstacles to `collision_layer = 1` (`world_solid`) and all walkable `Area2D` zones (`slow_thicket`, `walkable_arch`) to `collision_layer = 128`, `collision_mask = 4` (`player_body`).
4. **Viewport Upgrade (`480×270` → `640×360`) & HUD Layout:** `PrototypeHud.ControlsLabel` had hardcoded `offset_right = 474.0` from the `480×270` layout. **Resolution:** Switch `ControlsLabel` and `PlaceholderBanner` to responsive anchor-based layout and verify readability at `640×360` (`1×`) and `1280×720` (`2×` exact integer scale on `1366×768` Intel HD Graphics 3000 screens).
5. **Chunk Streamer Overlap Inside V8.0 Living Forest Footprint:** Without spatial coordination, `WorldChunkStreamer`'s procedural 16×16 reedwoods and coastal cliffs would overlap the handcrafted `2304×1536` V8.0 Living Forest floor and multi-polygon colliders. **Resolution:** Add sanctuary bounds awareness to `WorldChunkStreamer` so chunks still stream cleanly (`9/9 active` maintained for engine continuity & outer exploration) while suppressing legacy procedural cliff/tree placement inside the handcrafted V8.0 Living Forest sanctuary (`[0..2304] × [0..1536]`) and preserving `DropPodClearing` cleanly at the sanctuary clearing perimeter.
6. **Time-of-Day Hotkey Alignment (`T` vs `F5`) & HUD/Collision Toggles (`F3` vs `F4`):** Production used `T` for Time-of-Day and `F3` for Telemetry HUD; standalone V8.0 used `F5` for Mood, `F3` for Collision-Debug, `F4` for Perf HUD, `F6` for Gust. **Resolution:** Preserve production's `T` (plus `F5` alias) for cycling the 3 V8.0 Cinematic Lighting Moods, preserve `F3` for toggling Telemetry HUD, assign `F4` to live Collision-Debug polygon overlay, and keep `F6` for triggering Wind Gust + Leaf Shower.

---

## Staged Commit Plan (Safe Rollback Granularity)

- **Commit 1 (Stage A Checkpoint):** `docs/integration/V80_PRODUCTION_INTEGRATION_PLAN.md` (zero production files modified yet).
- **Commit 2 (Stage B — Assets & Shaders):** Approved V8.0 environmental sprites, living ecosystem data JSON, unmodified `88×88` character strips, and Intel HD 3000 shaders imported cleanly into `game/assets/` & `game/shaders/` (preserving all old production assets and isolated studies untouched).
- **Commit 3 (Stage C & D — Systems, World, Player, Viewport, HUD, Gameplay Integration):** `VerdantLivingForest` scene & strictly typed script, `RimlandsPrototype` + `WorldChunkStreamer` + `PlayerController` + `PrototypeHud` + `BootDiagnostics` + `AssetPaths` + `GameState` + `project.godot` integration.
- **Commit 4 (Stage E & F — Production Validation, Smoke Runner, Windows Verification Harness, Architectural Proofs & Final Report):** Upgraded `game/tests/smoke_runner.gd`, `game/tools/run_production_v80_verification.bat`, comprehensive Vitest production validation suite `v80ProductionIntegrationValidation.test.ts`, and production integration proof sheets.
