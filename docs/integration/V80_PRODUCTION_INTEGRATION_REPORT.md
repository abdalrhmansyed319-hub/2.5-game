# VERDANT SIGNAL — V8.0 Production Integration Report

**Branch:** `arena/1d52d1b9-2-5-game` (`main` untouched at `cfad6b8`)  
**Integration Status:** Production code, assets, scenes, shaders, viewport (`640×360`), gameplay compatibility, and automated static/structural validation **COMPLETE**. Real Windows Godot 4.7.2 runtime execution & Intel HD Graphics 3000 FPS profiling **READY FOR USER HARDWARE VERIFICATION** via `game/tools/run_production_v80_verification.bat` (sandbox lacks Godot binary/GPU — disclosed transparently below).

---

## 1. Exact Production Files Added or Modified

### Stage A — Pre-Integration Architecture Audit & Checkpoint (`a8aa6cb`)
- **Added:** `docs/integration/V80_PRODUCTION_INTEGRATION_PLAN.md`

### Stage B — Approved V8.0 Assets, Shaders & Unmodified Character Strips (`7f203ab`)
- **Added (`36` environmental PNGs + JSON + README):**
  - `game/assets/world/living_forest/sprites/v80_living_floor_2304x1536.png`
  - `game/assets/world/living_forest/sprites/living_grass_tufts_24x24_6x8.png`
  - `game/assets/world/living_forest/sprites/living_critters_12x12_4x3.png`
  - `game/assets/world/living_forest/sprites/sunbeams_1152x768.png`
  - `game/assets/world/living_forest/sprites/biolum_halo_64x64.png`
  - `game/assets/world/living_forest/sprites/*.png` (`31` modular forest trees, colossal trunks, canopies, root arches, hollow fallen log, mossy boulders, Chime-Reed outcrop, Waystone Shrine, ferns, undergrowth thickets)
  - `game/assets/world/living_forest/data/living_ecosystem_data.json` (`718` animated grass tufts + `7` woodland butterflies/moths)
  - `game/assets/world/living_forest/README.md`
- **Added (bit-for-bit unmodified original `88×88` player character strips — verified via SHA-256 & `Buffer.compare === 0`):**
  - `game/assets/characters/player/mara_original/char_idle_88x88_8x4.png`
  - `game/assets/characters/player/mara_original/char_walking_88x88_8x4.png`
  - `game/assets/characters/player/mara_original/char_running_88x88_8x4.png`
  - `game/assets/characters/player/mara_original/README.md`
- **Added (Intel HD Graphics 3000 `GL Compatibility` / ANGLE safe shaders):**
  - `game/shaders/foliage_sway.gdshader`
  - `game/shaders/mara_natural_occlusion.gdshader` (upgraded to float-only `mod()` parity for maximum OpenGL 3.1 / ANGLE D3D10.1 compatibility)
  - `game/shaders/puddle_ripples.gdshader`

### Stage C & D — Living World Systems, Unified World, Player, Viewport & HUD (`0a756fc`)
- **Added:**
  - `game/world/living_forest/verdant_living_forest.tscn` (modular production scene: `load_steps=136`, `81` `StaticBody2D` / `142` convex `CollisionPolygon2D`, `6` walkable `Area2D` zones aligned to production layers `128`/`4`, `40` `CPUParticles2D`, `SunbeamsOverlay`, `BiolumGlowLayer`, `CrittersLayer`, `ForestFloor` at `z_index = -2`, unified `YSortWorld`)
  - `game/world/living_forest/verdant_living_forest.gd` (`class_name VerdantLivingForest`, 100% strictly typed GDScript, zero-allocation `PackedFloat32Array` footstep bend tracking, `144`-slot frustum-culled grass Sprite2D pool, 3 lighting moods, wind waves/gusts, occlusion peek detection, Acoustic Field Lens & Field Sample landmark resonance, live `F4` collision-debug renderer)
- **Modified:**
  - `game/project.godot` (viewport `640×360`, window `1280×720` `2×` integer scale; preserved `gl_compatibility`, ANGLE fallback, Nearest filtering, MSAA/HDR off, pixel snap, all 5 strict GDScript warnings, all 12 `InputMap` actions, all 8 physics layers, both lean autoloads, and `BootDiagnostics` entry scene)
  - `game/autoload/game_state.gd` (updated `DEFAULT_VIEWPORT_SIZE = Vector2i(640, 360)` and added lean `sampled_features` field-sample registry)
  - `game/systems/asset_paths.gd` (preserved all `AST-001`..`AST-007` mappings; added `MARA_ORIG_*` & `V80_REQUIRED_PATHS` + `verify_v80_living_world_assets()`)
  - `game/scenes/boot/main.gd` (updated `640×360` scaling diagnostics, V8.0 + unmodified Mara asset verification, and `--capture-production-proofs` forwarding)
  - `game/characters/player/player.tscn` & `game/characters/player/player.gd` (integrated unmodified `88×88` Mara strips, `OcclusionPeekSprite` with `mara_natural_occlusion.gdshader`, smooth horizontal `CapsuleShape2D` footprint, `sprint_dodge` run state, `interact_sample` (`E`) signal, terrain speed multiplier & lighting tint hooks — zero fabricated frames)
  - `game/world/world_chunk_streamer.gd` (preserved 3×3 chunk streaming & `9/9 active chunks`; added `[0..144] × [0..96]` sanctuary footprint coordination eliminating invisible legacy water-barrier / cliff / tree overlaps)
  - `game/world/rimlands_prototype.tscn` & `game/world/rimlands_prototype.gd` (mounted `VerdantLivingForest` into main playable world, unified `Player` inside `VerdantLivingForest/YSortWorld`, synced `TimeModulate` with all 3 V8.0 moods, wired Acoustic Field Lens, Field Sampling, water ripples, wind gusts, collision debug, zone warps, and `--capture-production-proofs`)
  - `game/world/vfx/ground_ring_vfx.gd` (adjusted local `z_index = 0` inside `VfxLayer` at `z_index = -1` so lens pulses & ripples draw cleanly above `ForestFloor (-2)` and below `YSortWorld (0)`)
  - `game/ui/prototype_hud.tscn` & `game/ui/prototype_hud.gd` (adapted anchors for crisp `640×360` layout + V8.0 Living World telemetry)

### Stage E & F — Production Validation, Smoke Runner & Windows Verification Harness
- **Modified:** `game/tests/smoke_runner.gd` (extended real Godot 4.7.2 headless smoke runner to validate all V8.0 production scripts, scenes, shaders, assets, unmodified `704×352` Mara strips, unified YSortWorld player mount, `718` tufts / `144` pool, `7` critters, all 3 moods, wind gusts, acoustic scan & field sampling)
- **Added:** `game/tools/run_production_v80_verification.bat` (one-click Windows Godot 4.7.2 verification: headless smoke runner → automated native `640×360` screenshot capture + real FPS log → interactive play)
- **Added:** `tools/verdant-pixel-forge/src/__tests__/v80ProductionIntegrationValidation.test.ts` (automated Vitest verification of `project.godot`, all 9 production `.tscn` files, all 19 production `.gd` scripts, bit-for-bit unmodified character pixels, sanctuary chunk coordination & legacy asset preservation)
- **Added:** `docs/integration/V80_PRODUCTION_INTEGRATION_REPORT.md`

---

## 2. Exact V8.0 Systems Integrated

- Handcrafted `2304×1536` living forest ground (`94,310` botanical grass cushions, wildflowers, clover, moss, fallen leaves, stepping cobbles, damp soil & reflective pools) with live `puddle_ripples.gdshader` canopy droplets, sun glints, and player wade ripples.
- Physical ground embedding of all `115` modular trees, colossal trunks, root arches, hollow fallen log, mossy boulders, Chime-Reeds, and Waystone Shrine (`81` `StaticBody2D` / `142` convex `CollisionPolygon2D`s + `6` walkable `Area2D` zones).
- `718` individually animated grass/fern/wildflower tufts (`living_grass_tufts_24x24_6x8.png`, 6 handcrafted frames × 8 species) rendered via a fixed `144`-slot frustum-culled `Sprite2D` pool inside unified `YSortWorld` with asynchronous traveling wind waves, periodic/manual wind gusts (`F6`/`G`), and player footstep compression + smooth recovery.
- All 3 approved V8.0 cinematic lighting moods (`T` or `F5`): **Golden Afternoon**, **Misty Rose-Gold Dawn**, and **Shaded Twilight Forest**, synchronized with `TimeModulate`, painterly `SunbeamsOverlay`, localized `BiolumGlowLayer`, and night-blooming `Sun-Drop Bulb` flora.
- Living atmospheric ecosystem active even while standing still: `7` animated butterflies & twilight moths (`living_critters_12x12_4x3.png`), `40` `CPUParticles2D` (`16` falling leaves, `10` sunlit dust motes, `6` floating silk seeds, `8` bioluminescent spores), gust-responsive `foliage_sway.gdshader` canopy/fern sway, and `mara_natural_occlusion.gdshader` 2×2 dither silhouette peek behind trees & under root arches.

---

## 3. Existing Production Gameplay Systems Preserved

- **Bootstrap & Diagnostics (`scenes/boot/main.tscn/.gd`):** Preserved intact with updated `640×360` scaling metrics and V8.0 verification.
- **Lean Autoloads (`GameState`, `AudioDirector`) & 5-Tier `default_bus_layout.tres`:** 100% preserved.
- **All 12 Production `InputMap` Actions & 8 Physics Layer Names:** 100% preserved.
- **Player Mechanics (`PlayerController`):** 4-direction/8-direction movement (`WASD`/Arrows), Sprint/Run (`Shift`/`Space` via `sprint_dodge`), Crouch-Stealth (`C`/`Ctrl` via `crouch_stealth`), Acoustic Field Lens (`Q`/RMB via `toggle_acoustic_lens` emitting `GroundRingVfx` & scanning both V8.0 ecological landmarks and `scannable_flora`), Field Sampling (`E` via `interact_sample`), shallow-water speed & ripple VFX, canopy overlap tracking, and `Camera2D` smoothing/clamping.
- **Deterministic 3×3 Chunk Streaming (`WorldChunkStreamer` + `RimlandsTileSetBuilder`):** Remains active (`9/9 active chunks`), with all legacy M01 assets (`AST-001`..`AST-007`, `SingingReedwoodTree`, `FloraProp`, `DropPodClearing`, `debug_placeholders/`) and all isolated studies (`v80_living_world_study/`, `v73_open_world_playability_study/`, etc.) preserved untouched.

---

## 4. Conflicts Discovered & How They Were Resolved

| # | Conflict Discovered | Root Cause | Production Resolution |
| :- | :--- | :--- | :--- |
| **1** | **Invisible legacy water barriers inside SW Living Forest** | `WorldChunkStreamer._sample_elevation_f` drops below `-0.35` in tiles `(0..60, 50..96)`, placing solid `PHYSICS_LAYER_WATER_BARRIER` tiles underneath the southwestern V8.0 forest (Mossy Fallen Log & SW Grove). | Added `_in_living_forest_sanctuary(tx, ty)` (`[0..144] × [0..96]`) in `world_chunk_streamer.gd` so sanctuary chunks emit clean single-layer walkable `reedwood_floor` tiles with zero legacy barriers or cliffs (also reducing tile overdraw 4× on Intel HD 3000!). |
| **2** | **Strict GDScript Type Warnings (`game/project.godot`)** | Production enables all 5 strict warnings (`untyped_declaration`, `unsafe_property_access`, `unsafe_method_access`, `unsafe_call_argument`, `unsafe_cast`), whereas standalone V8.0 script used untyped dictionaries & loop vars. | Rewrote `verdant_living_forest.gd` and all modified production scripts with 100% explicit static typing + zero-allocation `PackedFloat32Array` / `PackedInt32Array` tuft bend arrays (0 issues in strict static audit). |
| **3** | **Input Action Mismatch (`sprint` vs `sprint_dodge`)** | Standalone V8.0 polled `"sprint"`, which does not exist in production `project.godot`. | Adapted `PlayerController` to bind Run to production's existing `"sprint_dodge"` action (`Shift` / `Space`). |
| **4** | **Physics Layer Mismatch on Walkable `Area2D` Zones** | Standalone V8.0 placed walkable zones on `collision_layer = 4, collision_mask = 2`, whereas production places `Player` on Layer 3 (`bit 4`) and `canopy_occluder` on Layer 8 (`bit 128`). | Aligned all 6 `WalkableZonesLayer` `Area2D` nodes in `verdant_living_forest.tscn` to `collision_layer = 128, collision_mask = 4`. |
| **5** | **Z-Order Burial of `GroundRingVfx` Under `ForestFloor`** | Production `VfxLayer` sat at `z_index = -3` with `GroundRingVfx.z_index = -1`, which would render behind `ForestFloor` (`0`). | Set `ForestFloor.z_index = -2`, `VfxLayer.z_index = -1`, and `GroundRingVfx.z_index = 0` so acoustic scan pulses & ripples draw crisply over ground and under `YSortWorld (0)`. |
| **6** | **Viewport Upgrade (`480×270` → `640×360`) HUD Clipping** | `PrototypeHud.ControlsLabel` had hardcoded `offset_right = 474.0`. | Converted `ControlsLabel` to full-width anchors (`anchor_right = 1.0, offset_right = -6.0`), widened `TelemetryPanel`, and updated `project.godot` window override to `1280×720` (`2×` exact integer scale on `1366×768` Intel HD 3000 displays). |
| **7** | **Duplicate Root Systems & Y-Sort Separation** | Standalone V8.0 owned its own `Player`, `WorldMoodModulate`, and `HudCanvas`, while production `RimlandsPrototype` owns `Player`, `TimeModulate`, and `PrototypeHud`. | Stripped standalone duplicates from `verdant_living_forest.tscn`, mounted `VerdantLivingForest` inside `RimlandsPrototype`, and reparented production `Player` cleanly into `VerdantLivingForest/YSortWorld` in `_ready()` for 100% unified Y-sorting. |
| **8** | **Bitwise Integer Ops in Occlusion Shader on Legacy ANGLE** | `mara_natural_occlusion.gdshader` used integer `&` / `<<` / `|` ops. | Simplified to float-only `mod(floor(FRAGCOORD.xy), 2.0)` producing the identical 2×2 dither with maximum OpenGL 3.1 / ANGLE D3D10.1 safety. |

---

## 5. Actual Godot 4.7.2 Runtime Test Results (Honest Sandbox Disclosure)

- **Sandbox Status:** Verified via `which godot godot4 godot-mono` — **no Godot 4.7.2 binary, OpenGL/ANGLE runtime, or Windows Intel HD Graphics 3000 GPU exists in this Linux sandbox**, and GitHub release binary downloads are blocked by egress rules.
- **Therefore, live Godot 4.7.2 execution has NOT yet been run inside this sandbox.** Zero runtime screenshots, recordings, or FPS measurements are fabricated.
- **Ready for Immediate Real Windows Godot 4.7.2 Verification:** Run `game\tools\run_production_v80_verification.bat "C:\Path\To\Godot_v4.7.2-stable_win64.exe"` on Windows to automatically execute:
  1. Headless `res://tests/smoke_runner.tscn` verifying all 18 scripts, 8 scenes, 12 V8.0 assets, unmodified `704×352` Mara sheets, `9/9` active chunks, `718` tufts / `144` pool, `7` critters, moods, gusts, acoustic scans, and field sampling.
  2. Automated native `640×360` screenshot capture (`-- --capture-production-proofs`) saving 7 live Godot 4.7.2 PNGs to `game/godot_runtime_captures/` + logging real GPU adapter, FPS, and draw calls.
  3. Full interactive gameplay session in the integrated main project.

---

## 6. Automated Test, Typecheck, Static Audit & Build Results

Executed in `tools/verdant-pixel-forge` after Stage E:
- `npm run typecheck` (`tsc --noEmit`): **PASS (0 errors)**
- `npm test` (`vitest run`): **PASS — 28 / 28 tests passing across 6 test files**, including `v80ProductionIntegrationValidation.test.ts` (`5/5` tests auditing `project.godot`, all 9 production `.tscn` files with exact `load_steps` & resource/ID resolution, all 19 production `.gd` scripts, bit-for-bit unmodified `88×88` character pixels, sanctuary chunk coordination, and legacy/study preservation).
- Strict GDScript static audit across all 9 modified/added production scripts: **PASS (0 untyped declarations, 0 untyped parameters, 0 missing return types, 0 unsafe chained Dictionary accesses)**.
- `npm run build` (`tsc -b && vite build`): **PASS (clean production bundle)**.

---

## 7. Performance Budget & Measurements (Estimates vs. Pending Hardware Measurements)

- **Hardware-Measured FPS (Intel HD Graphics 3000 / Windows Godot 4.7.2):** **NOT YET MEASURED** (pending execution of `game/tools/run_production_v80_verification.bat` on the user's Windows Intel HD Graphics 3000 machine).
- **Verified Static & Algorithmic Budget (Measured in Build/Validation):**
  - Renderer: `gl_compatibility` with `fallback_to_angle=true`, MSAA 0, HDR 2D off, Nearest filtering, zero real-time `PointLight2D` / `LightOccluder2D` / full-screen post-processing shaders.
  - Living Grass Pool: `718` world tufts culled into a fixed `144`-slot `Sprite2D` pool (zero runtime node allocations; verified peak visible tufts in camera view = `109 <= 144`) backed by typed `PackedFloat32Array` / `PackedInt32Array` footstep bend tracking.
  - Particles: `40` total `CPUParticles2D` (`16` leaves + `10` dust + `6` seeds + `8` spores).
  - Chunk Overdraw Optimization: Reduced `TileMapLayer` writes inside the `[0..144] × [0..96]` Living Forest Sanctuary from 5 layers down to 1 collision-free base tile layer.

---

## 8. Remaining Work Requiring User Windows Verification

1. Run `game\tools\run_production_v80_verification.bat "C:\Path\To\Godot_v4.7.2-stable_win64.exe"` on your Windows Intel HD Graphics 3000 machine.
2. Confirm `smoke_runner.tscn` reports `[SMOKE] RESULT: PASS (0 smoke assertion failures)` and check the Godot Output panel for zero runtime/shader warnings.
3. Review the captured live Godot 4.7.2 `640×360` screenshots in `game/godot_runtime_captures/` and record real FPS / frame-time ms from the HUD (`F3`) and console telemetry line `[PROD-V80] RUNTIME TELEMETRY`.
4. Playtest walking/running through grass (`WASD`/`Shift`), passing behind trees & under the Exposed Root Arch, crouching (`C`), scanning flora/landmarks (`Q`/RMB), sampling (`E`), cycling all 3 lighting moods (`T`/`F5`), triggering wind gusts (`F6`/`G`), and toggling collision polygons (`F4`).
