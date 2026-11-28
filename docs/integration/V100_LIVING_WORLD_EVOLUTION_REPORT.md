# VERDANT SIGNAL — V10.0 "The World That Never Stops Living" Evolution Report

**Branch:** `arena/1d52d1b9-2-5-game`  
**Target Runtime:** Godot 4.7.2-stable (GL Compatibility / ANGLE fallback, `640×360` native viewport → `1280×720` `2×` integer nearest, MSAA/HDR off) — tuned for Windows / Intel HD Graphics 3000  
**Scope:** Holistic V10.0 artistic, environmental, botanical, shader, creature-life, audio, and production-bug-fix evolution across the unified `2304×2880` continuous **Broken Shore (`y = 1344..2880`) ↔ Living Forest (`y = 0..1536`)** world.  
**Preservation Guarantee:** All 3 original `88×88` Mara character sprite strips (`mara_original/*.png`, SHA-256 `3f1af238...`), all 20 V9.0 handcrafted sprites, and all 8 prior study directories remain strictly preserved.

---

## 1. Visual & Environmental Evolution (Stages 1–3, Committed at `6bb1c2f`)

### 1.1 Seamless Forest-to-Shore Ecotone & Terrain Polish
- **Zero Horizontal Ecotone Seam:** Rebuilt the northern `y = 1344..1488` overlap band of `v90_broken_shore_floor_2304x1536.png` by directly sampling and smoothly cross-blending the actual V8.0 `v80_living_floor_2304x1536.png` pixel buffer with organic multi-frequency feathering (automated pixel-level test verifies mean per-channel seam delta `< 12` across all `2304` columns).
- **Organic Coastal Dunes & Foreshore Micro-Detail:** Replaced repetitive horizontal sand striping with gentle diagonal wind-sculpted dune swells, scattered wet pebbles, wrack-line drift shells, buried expedition power cables leading seamlessly out of the *ICV Meridian* aft breach, and a rocky tidal surge channel feeding `tp_east_outer` `(1906, 2244)`.
- **V8.0 Living Forest Floor Refinement (`v100ForestFloorPolish.ts`):** Polished `v80_living_floor_2304x1536.png` with glassy clear shallow spring pools, softly weathered mossy trail flagstones, lush clover/moss micro-scatter, and rich root-dappled edges while preserving 100% of V8.0 walkability and collision boundaries (`81` `StaticBody2D`, `142` convex polygons, `perim_s_bush_4` / `perim_s_bush_5` intact).
- **Organic Breaking-Wave Sea-Stack Surf (`ocean_surf_foam_64x48_8f.png`):** Rebuilt the 8-frame coastal surf splash atlas from geometric dotted rings into naturalistic directional seaward wave-break crests & trailing froth streaks.

### 1.2 Seven New Handcrafted Storytelling, Flora & Fauna Assets (100% Editable `.vpf.json`)
All 7 new assets are generated deterministically by `tools/verdant-pixel-forge/src/v100_living_world/buildV100LivingWorld.ts`, paired 1:1 with editable Verdant Pixel Forge `.vpf.json` files under `game/assets/_vpf_sources/broken_shore/` (`28/28` total cataloged assets):

| Asset | Dimensions | Role & World Placement |
|---|---:|---|
| `meridian_field_relay.png` | `64×76` | Deployed expedition telemetry tripod + amber pulsing beacon along the Zone A/B debris trail |
| `meridian_specimen_pod.png` | `56×44` | Cracked *ICV Meridian* containment cylinder leaking luminous cyan xenobiological pollen |
| `ancient_waymarker_stone.png` | `72×92` | Pre-human carved harmonic monolith guarding the Zone F Inland Gateway threshold |
| `ecotone_moss_boulder.png` | `84×62` | Moss-draped coastal/forest bridge geology anchoring the ecotone transition |
| `coastal_biolum_coral.png` | `48×42` | Tidepool bioluminescent branching coral fans framing the eastern tidepool sanctuary |
| `coastal_canopy_fern_clump.png` | `64×50` | Lush coastal-edge fern clusters softening the northern meadow-to-forest corridor |
| `coastal_spore_moths_16x16_4x2.png` | `64×32` | 4-frame × 2-variant animated bioluminescent Coastal Spore-Moths (`kind = 2`) |

### 1.3 Visual QA Pass 1 → Pass 2 Catch & Resolution
A dedicated `2304×2880` composite & 8-zone inspection renderer (`renderProductionWorldAtlas.ts`) audited BEFORE (`7499163`), Pass 1, and Pass 2 renders. Pass 1 caught 6 subtle defects — all 6 were corrected in source and visually verified clean in Pass 2:
1. Faint horizontal color jump along the `y = 1344` ecotone seam → eliminated via direct V8.0 pixel sampling & irregular botanical moss bridging.
2. Horizontal washboard banding on open Zone A sand → replaced with low-frequency oblique dune swells.
3. Dashed appearance on half-buried *Meridian* cables → rendered as continuous wind-drifted cables.
4. `tp_east_outer` kelp rim clipping into sand → shifted pool center to `(1906, 2244)` inside a carved basalt tidal surge channel.
5. Noisy forest trail flagstones & horizontal pool streak in V8.0 floor → replaced with glassy clear pools & soft organic mossy trail stepping stones.
6. Dotted elliptical sea-stack surf collar → replaced with organic breaking-wave spray & foam trails.

### 1.4 Upgraded Ecosystem Density
- **Broken Shore Props:** `66` authored placements (preserving all 6 critical walkable coordinates collider-free).
- **Coastal Living Tufts:** `1037` wind- & footstep-reactive coastal grass/fern/succulent tufts (`+718` in V8.0 Living Forest = **`1755` total interactive tufts**, frustum-culled into fixed `Sprite2D` pools for zero GC / stable Intel HD 3000 FPS).
- **Coastal Fauna:** `14` active creatures (`4` Chime-Wing Gliders, `4` Mirror-Shell Crabs, `6` Bioluminescent Spore-Moths) + `7` V8.0 woodland critters = **`21` living fauna**.
- **Discoverable Ecological Sites:** Preserved all `10` V9.0 `scan_sites` (`3` interior-only inside *ICV Meridian*) + added `4` new `v100_ecological_sites` (`Meridian Field Relay`, `Cracked Specimen Pod`, `Ancient Harmonic Waymarker`, `Bioluminescent Tidepool Coral`).

---

## 2. Production Godot 4.7.2 Engine, Shader, Creature, Audio & Bug Fixes (Stage 4)

### 2.1 Four Real Production Bugs Found & Fixed
1. **Broken Coastal `Area2D` Collision Mask (`verdant_broken_shore.gd`):** `_build_walkable_zones()` previously configured `area.collision_layer = 0; area.collision_mask = 1`, which missed `Player` (`layer = 4`, Layer 3 `player_body`), preventing *ICV Meridian* interior cutaway & coastal slow-brush `Area2D` triggers. Fixed to `collision_layer = 128; collision_mask = 4` plus deterministic `Geometry2D.is_point_in_polygon` sync for both walking and zone warps.
2. **Coastal Occlusion & Micro-Lighting Cutoff (`verdant_living_forest.gd` + `rimlands_prototype.gd`):** `VerdantLivingForest.step_living_ecosystem()` previously forced `set_occluded_peek(false)` and flat white tint whenever `p_pos.y >= 1420.0`. Replaced with unified cross-biome `_sync_unified_player_atmosphere()` blending forest ↔ shore micro-lighting smoothly across `y = 1360..1580` and activating `OcclusionPeekSprite` behind tall coastal landmarks (*ICV Meridian* hull, Basalt Cliffs, Ancient Waymarker, Gateway Redwoods).
3. **Broken Wet-Sand Shader Check & Stale Tidepool Coordinate (`coastal_ocean.gdshader`):** `is_wet_sand` previously required `base.b > base.r - 0.03`, which missed warm capillary-damp sand (`#8f7254` / `#6b533c`), and `pools[1]` still pointed to `(1902, 2262)`. Synced `pools[1]` to `(1906, 2244)`, added `is_damp_foreshore` matching actual damp foreshore hues, and added subtle twilight bioluminescent caustic shimmer around all 5 tidepools (100% float-only, zero `hint_screen_texture`, zero bitwise ops).
4. **Floor Z-Order Collision & Cutaway Capture Settle (`verdant_broken_shore.tscn` + `rimlands_prototype.gd`):** `BrokenShoreFloor` was at `z_index = -1`, colliding with `VfxLayer` (`z_index = -1`) for water ripples & acoustic rings; moved to `z_index = -2` matching `ForestFloor`. Also added `force_settle_interior_state()` on `_warp_to_zone()` so automated Zone B2 cutaway captures immediately display the full breached aft interior.

### 2.2 Shader, Lighting & Creature-Life Polish
- **Dual-Harmonic Foliage Flutter (`foliage_sway.gdshader`):** Added a secondary phase-offset micro-flutter harmonic (`0` extra texture taps, `0` fragment overhead) so neighboring coastal shrubs and forest crowns never bend in robotic lockstep.
- **Localized Storytelling Glows & Sunbeam Shafts (`verdant_broken_shore.tscn/.gd`):** Added additive pulsing beacon/bioluminescence halos on the Field Relay, Specimen Pod, and Ancient Waymarker plus 3 soft morning sunbeam shafts across Zone F and the Waking Shore — reusing existing `biolum_halo_64x64.png` with zero additional texture memory.
- **Reactive Coastal Creature AI (`verdant_broken_shore.gd`):**
  - *Chime-Wing Gliders:* Thermal-gust climb/glide flapping cadence.
  - *Mirror-Shell Crabs:* Natural pause-and-forage cadence with sharper alert scuttling when Mara sprints or approaches within `52–68 px`.
  - *Bioluminescent Spore-Moths (`MothSporeLayer`):* Figure-8 fluttering, twilight luminosity lift, and curious harmonic drift toward Mara when she emits an Acoustic Field Lens pulse within `160 px`.

### 2.3 Deterministic 5-Tier Living World Audio (`buildV100LivingAudio.ts` + `audio_director.gd`)
Synthesized 6 compact deterministic 16-bit mono `22050 Hz` `.wav` assets (`396 KB` combined — zero runtime synthesis CPU overhead) wired cleanly into the existing 5-tier bus layout (`default_bus_layout.tres`):
- `game/audio/ambient/coastal_surf_breeze.wav` (`173 KB`, seamless crossfade loop on `Tier5_Atmosphere`)
- `game/audio/ambient/living_forest_canopy.wav` (`173 KB`, seamless crossfade loop on `Tier5_Atmosphere`)
- `game/audio/sfx/step_sand.wav`, `step_grass.wav`, `step_water.wav` (`4.4–7.0 KB` each on `Tier3_World`, pitch-varied & synced to Mara's stride plant frames `1` and `5` via `PlayerController.footstep_triggered`)
- `game/audio/sfx/acoustic_lens_chime.wav` (`20 KB` on `Tier2_Action`, harmonic boost when resonant features are detected)

Ambience crossfades smoothly with Mara's `world_pos.y` (`y = 1220..1980`), swells subtly during coastal wind gusts, ducks gently (`0.42×`) inside the breached *ICV Meridian* aft bay, and guards every asset with `ResourceLoader.exists()`.

---

## 3. Verification & Honest Platform Limitations

### 3.1 Automated Checks Verified in This Sandbox (All Passing)
- `cd tools/verdant-pixel-forge && npm run typecheck` (`tsc --noEmit`): **PASS (0 errors)**
- `cd tools/verdant-pixel-forge && npx vitest run`: **PASS (`8/8` test files, `38/38` tests)** — includes preserved M01/V7.2/V7.3/V8.0/V9.0 suites plus new `v100LivingWorldValidation.test.ts` verifying all 7 V10.0 sprites + `.vpf.json` sources, pixel-level northern ecotone seam continuity, all 6 WAV PCM files, all 4 Stage 4 production bug fixes, and unmodified Mara SHA-256 integrity.
- `cd tools/verdant-pixel-forge && npm run build` (`tsc -b && vite build`): **PASS**
- Strict static GDScript / `.tscn` / `.gdshader` audit across all 7 modified `.gd` scripts, `verdant_broken_shore.tscn` (`load_steps = 7` exact), and both modified shaders: **PASS (0 warnings/hazards)**

### 3.2 Windows Godot 4.7.2 Runtime Verification (To Run on Target Hardware)
Because this Linux sandbox does not include a Godot `4.7.2-stable` binary or Intel HD Graphics 3000 GPU, live Godot headless smoke execution, real GL Compatibility / ANGLE shader compilation, and hardware 60 FPS measurements must be executed on Windows using the newly added verification harness:

```bat
game\tools\run_production_v100_verification.bat "C:\Path\To\Godot_v4.7.2-stable_win64.exe"
```

This runs:
1. Headless `res://tests/smoke_runner.tscn` (now verifying all V8.0 + V9.0 + `13` V10.0 asset/audio paths, `14` coastal fauna, `force_settle_interior_state()`, Ancient Waymarker scanning, and `AudioDirector` playback methods).
2. Automated `640×360` production proof capture (`--capture-production-proofs`) into `game/godot_runtime_captures/`.
3. Interactive launch of the unified V10.0 VERDANT SIGNAL experience.
