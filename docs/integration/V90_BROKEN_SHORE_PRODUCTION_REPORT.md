# VERDANT SIGNAL — V9.0: THE BROKEN SHORE — PRODUCTION INTEGRATION & ASSET REPORT

**Branch:** `arena/1d52d1b9-2-5-game` (`main` untouched at `cfad6b89004a7bf5eb91c2c7f02684353523a72a`)  
**Target Engine:** Godot `4.7.2-stable` (`GL Compatibility`, `640×360` native pixel viewport / `1280×720` integer 2× window, ANGLE fallback for Intel HD Graphics 3000)  
**Art Direction Reference:** `docs/art-direction/V90_BROKEN_SHORE_ART_DIRECTION.md`  
**Machine-Readable Catalog:** `game/assets/world/broken_shore/broken_shore_asset_catalog.json`

---

## 1. Executive Summary

**V9.0 — The Broken Shore (The Crash Site)** has been built directly inside the real production Godot 4.7.2 game (`game/`) as the opening coastal crash-site region of **VERDANT SIGNAL**, seamlessly joined to the approved **V8.0 Living Forest Sanctuary** in a single continuous `2304 × 2880` Y-sorted playable world (zero teleport cuts, zero separate disconnected study scenes, zero duplicated gameplay controllers).

- **Unmodified Original Character Preserved:** All three original `88×88` (`704×352` 8×4) Dr. Mara Lin character strips under `game/assets/characters/player/mara_original/` remain bit-for-bit unmodified (verified SHA-256 `3f1af238...` on `char_idle_88x88_8x4.png`).
- **Continuous Six-Zone Opening Region (`y = 1344..2880`) Connected to V8.0 Forest (`y = 0..1536`):**
  - **Zone A — The Waking Shore** (`spawn: (748, 2288)` facing East toward wreck; driftwood, coastal rocks, rescue beacon, exploration crate, glossy wet sand & shallow surf)
  - **Zone B — The Crash Impact Field** (hero crashed *ICV Meridian* lander at `(1326, 2192)`, 340 px tapered scorched impact skid furrow, sheared retro-thruster cowling, scattered cargo & sparks)
  - **Zone B2 — Explorable Breached Aft Compartment** (walkable lowered cargo ramp entering the smooth cutaway interior grating bay with cracked cyan nav console, emergency lockers & 5 glowing amber bio-containment cylinders — integrated with Acoustic Field Lens `Q/RMB` & Field Sampling `E`)
  - **Zone C — The Tidepool Coast** (`x = 1580..2040`; translucent turquoise tidepools, 4-frame swaying Amber Tide-Kelp `fl_01`, Mirror Glasswort `fl_02` succulents, skittering Mirror-Shell Crabs `fa_02` & eastern basalt cliffs)
  - **Zone D — The Basalt Shore** (`x = 300..710`; stratified coastal basalt monoliths, narrow rocky shoreline passages, sheltering driftwood, wave-break surf spray & sweeping view across offshore basalt sea stacks)
  - **Zone E — The Coastal Vegetation Belt** (`y = 1620..1980`; wind-bent salt shrubs, golden sea oats, salt sedge, dune wildflowers & winding sandy inland footpath)
  - **Zone F — The Inland Gateway** (`x = 886..1412, y = 1344..1620`; twin basalt gateway pillars, coastal shrubs, V8.0 forest ferns & widened southern perimeter gateway at `perim_s_bush_4/5` opening directly into the approved V8.0 Living Forest Sanctuary)

---

## 2. Complete V9.0 Production Asset Catalog (21 Assets + 21 Editable `.vpf.json` Sources)

All production sprites are unified on the 68-color Mara-anchored `V90_MASTER_HEX` palette (`#1e0c1c` sel-out outlines, warm top-left sunlight, cool shadows, crisp native pixel clusters, verified `0` magenta `#FF00FF` chroma residue). Every asset has an editable RLE layered `.vpf.json` source stored under `game/assets/_vpf_sources/broken_shore/` (`.gdignore` protected).

| Asset ID | Category | Canvas / Frame | Frames & Order | Pivot / Sort Offset | Collision Footprint / Role | Production Path |
|---|---|---:|---|---|---|---|
| `v90_broken_shore_floor_2304x1536` | Terrain | `2304×1536` | 1 world canvas | `(0, 0)` / `0` | Organic `DeepWaterBarrier` along `waterlineY(x)+40` | `game/assets/world/broken_shore/v90_broken_shore_floor_2304x1536.png` |
| `meridian_wreck_hull` | Spacecraft | `358×184` | 1 static hero | `(179, 180)` / `-88` | 3 convex hull polygons (`nose`, `mid_hull`, `thrusters`); open aft ramp | `game/assets/world/broken_shore/sprites/meridian_wreck_hull.png` |
| `meridian_interior_bay` | Spacecraft | `230×119` | 1 cutaway deck | `(115, 102)` / `-55` | Walkable interior grating deck revealed via `Zone_meridian_breached_interior` | `game/assets/world/broken_shore/sprites/meridian_interior_bay.png` |
| `meridian_debris_cowling` | Spacecraft | `120×74` | 1 (+flip) | `(60, 61)` / `-24` | 5-vertex solid debris polygon | `game/assets/world/broken_shore/sprites/meridian_debris_cowling.png` |
| `meridian_cargo_crate` | Spacecraft | `71×60` | 1 (+flip) | `(36, 52)` / `-22` | 4-vertex solid UNIT-042 crate polygon | `game/assets/world/broken_shore/sprites/meridian_cargo_crate.png` |
| `meridian_rescue_beacon` | Spacecraft | `43×58` | 1 static + strobe | `(22, 51)` / `-22` | 4-vertex solid beacon base | `game/assets/world/broken_shore/sprites/meridian_rescue_beacon.png` |
| `basalt_cliff_monolith` | Geology | `160×154` | 1 (+flip) | `(80, 143)` / `-66` | 5-vertex solid stratified cliff base | `game/assets/world/broken_shore/sprites/basalt_cliff_monolith.png` |
| `basalt_sea_stack` | Geology | `120×150` | 1 (+flip) | `(60, 133)` / `-58` | Offshore ocean landmark beyond deep-water barrier | `game/assets/world/broken_shore/sprites/basalt_sea_stack.png` |
| `basalt_sea_stack_med` | Geology | `84×108` | 1 (+flip) | `(42, 98)` / `-44` | Mid-distance offshore ocean sea stack | `game/assets/world/broken_shore/sprites/basalt_sea_stack_med.png` |
| `coastal_boulder_cluster` | Geology | `110×71` | 1 (+flip) | `(55, 68)` / `-32` | 5-vertex solid boulder cluster | `game/assets/world/broken_shore/sprites/coastal_boulder_cluster.png` |
| `coastal_boulder_sm` | Geology | `72×54` | 1 (+flip) | `(36, 47)` / `-20` | 4-vertex solid reef/shore boulder | `game/assets/world/broken_shore/sprites/coastal_boulder_sm.png` |
| `coastal_driftwood_log` | Geology | `136×69` | 1 (+flip) | `(68, 69)` / `-34` | 5-vertex solid salt-bleached driftwood trunk | `game/assets/world/broken_shore/sprites/coastal_driftwood_log.png` |
| `coastal_salt_shrub` | Flora | `94×70` | 1 (+flip, sway) | `(47, 65)` / `-30` | 4-vertex woody stem base + `foliage_sway.gdshader` | `game/assets/world/broken_shore/sprites/coastal_salt_shrub.png` |
| `coastal_salt_shrub_sm` | Flora | `64×52` | 1 (+flip, sway) | `(32, 48)` / `-22` | Walkable wind-swaying coastal shrub | `game/assets/world/broken_shore/sprites/coastal_salt_shrub_sm.png` |
| `coastal_succulent` | Flora | `54×56` | 1 (+flip, sway) | `(27, 50)` / `-22` | Walkable Mirror Glasswort (`fl_02`) alien succulent | `game/assets/world/broken_shore/sprites/coastal_succulent.png` |
| `coastal_succulent_sm` | Flora | `38×36` | 1 (+flip, sway) | `(19, 33)` / `-15` | Walkable compact Mirror Glasswort variant | `game/assets/world/broken_shore/sprites/coastal_succulent_sm.png` |
| `coastal_grass_tufts_24x24_6x8` | Animated Flora | `144×192` / `24×24` | 48 (8 species × 6 bend) | `(12, 22)` / `-9` | 815 pooled tufts (144-slot frustum pool) w/ wind + footstep bend | `game/assets/world/broken_shore/animated/coastal_grass_tufts_24x24_6x8.png` |
| `amber_tide_kelp_48x40_4f` | Animated Flora | `192×40` / `48×40` | 4-frame swell loop | `(24, 38)` / `-6` | 10 swaying Amber Tide-Kelp (`fl_01`) colonies in tidepools/shallows | `game/assets/world/broken_shore/animated/amber_tide_kelp_48x40_4f.png` |
| `ocean_surf_foam_64x48_8f` | Animated Ocean | `512×48` / `64×24` | 16 (Row 0 surf / Row 1 break) | `(32, 22)` / `0` | Organic shoreline foam wash + sea-stack wave-break collars | `game/assets/world/broken_shore/animated/ocean_surf_foam_64x48_8f.png` |
| `coastal_fauna_24x20_4x2` | Animated Fauna | `96×40` / `24×20` | 8 (Row 0 Glider / Row 1 Crab) | `(12, 18)` / `-6` | 4 soaring Chime-Wing Gliders (`fa_03`) + 4 Mirror-Shell Crabs (`fa_02`) | `game/assets/world/broken_shore/animated/coastal_fauna_24x20_4x2.png` |
| `coastal_fx_decals_16x16_4x3` | Animated FX | `64×48` / `16×16` | 12 (footprints, splashes, sparks) | `(8, 14)` / `0` | 32-slot sand footprint & wade splash ring buffer + hull sparks/beacon | `game/assets/world/broken_shore/animated/coastal_fx_decals_16x16_4x3.png` |

---

## 3. Phase 8 Multi-Pass Pixel-Art Quality Assurance Log

Three full visual inspection passes were executed on rendered `640×360` real-camera 1×/2× views across Zones A–F, Breached Interior Bay, Vast Alien Ocean Horizon, and the Master Asset Board alongside unmodified Dr. Mara Lin:

1. **Pass 1 Inspection Findings → Pass 2 Fixes:**
   - Replaced per-pixel speckled static in the crash impact furrow and geometric oval ship shadow with smooth handcrafted twin-groove plowed skid bands, crisp scorch streaks, and a diagonal fuselage-fitted grounding shadow.
   - Replaced zebra-striped sand ripples with broad calm warm golden-ochre beach expanses and gentle wind-swept highlights.
   - Separated `ocean_surf_foam_64x48_8f.png` slicing cleanly into Row 0 (`64×24` shoreline wash) vs. Row 1 (`64×24` rock break collar) so zero rock rings appear in open surf.
   - Replaced dot-speckled cliff talus rings with sculpted flat basalt slabs and crisp 2-tone seafoam crescents around offshore sea stacks.
   - Cleanly isolated `meridian_cargo_crate` from `meridian_rescue_beacon` along the seam so zero duplicated rescue beacons appear on Zone A.
   - Lowered `meridian_debris_cowling` `offsetY` (`-34 → -24`) so it embeds physically into displaced sand berms; refined `meridian_interior_bay` cutaway offset (`+12, -55`) so its torn upper bulkhead aligns with the fuselage seam.
2. **Pass 2 Inspection Findings → Pass 3 Final Polish:**
   - Added smooth capsule entry/exit tapering to the crash impact furrow so both the western impact entry wedge and eastern resting crater taper organically with zero straight cutoff edge.
   - Staggered horizontal pixel-art ocean wave-crest glints per row to eliminate subtle vertical stacking across the morning sunlight reflection column.
   - Increased organic Poisson-jittered botanical sprig density (`18,869` stamps) along the Zone E/F coastal meadow and smooth contour-blended the top `192 px` overlap against `v80_living_floor_2304x1536.png` for a seamless shore-to-forest transition.

---

## 4. Intel HD Graphics 3000 / GL Compatibility Engineering

- **Renderer & Scaling:** Preserves `renderer/rendering_method="gl_compatibility"`, `fallback_to_angle=true`, `640×360` viewport, `1280×720` integer 2× window, nearest-neighbor filtering (`default_texture_filter=0`), `msaa_2d=0`, `hdr_2d=false`, and pixel snapping.
- **Shader Discipline:** `game/shaders/coastal_ocean.gdshader` is strictly float-only single-pass `canvas_item` (zero `hint_screen_texture`, zero integer bitwise ops, zero multi-pass blur).
- **Bounded Memory & Draw Calls:** Total V9.0 runtime assets weigh `816 KB` on disk; all `815` coastal tufts share a bounded `144`-slot frustum-culled `Sprite2D` pool (zero coastal tufts drawn when Mara explores V8.0 Forest, and zero forest tufts drawn when Mara explores The Broken Shore); footprints/splashes use a bounded `32`-slot ring pool; coastal atmosphere uses lightweight `CPUParticles2D` (`18` sea-spray + `12` coastal seeds).

---

## 5. Exact Files Added & Modified

### New Production Game Files
- `game/shaders/coastal_ocean.gdshader`
- `game/world/broken_shore/verdant_broken_shore.tscn`
- `game/world/broken_shore/verdant_broken_shore.gd`
- `game/tools/run_production_v90_verification.bat`
- `game/assets/world/broken_shore/` (`21` PNGs + `broken_shore_ecosystem_data.json` + `broken_shore_asset_catalog.json`)
- `game/assets/_vpf_sources/broken_shore/` (`21` editable `.vpf.json` source files)

### Extended Production Game Files
- `game/world/rimlands_prototype.tscn` (mounts `VerdantBrokenShore`, sets starting spawn at Zone A Waking Shore `(748, 2288)`)
- `game/world/rimlands_prototype.gd` (unified Y-sorted Shore-to-Forest orchestration, lighting moods, gusts, scanning, sampling, collision debug, 1–8 zone warps & 9-shot automated proof capture)
- `game/world/living_forest/verdant_living_forest.tscn` (widens southern perimeter gateway at `perim_s_bush_4/5` & `perim_s_canopy_4/5` for seamless Zone F entry while keeping all 81 V8.0 colliders intact)
- `game/world/living_forest/verdant_living_forest.gd` (extends unified camera bottom limit to `2860` & world max Y to `2520`, preserves forest-only occlusion peek)
- `game/world/world_chunk_streamer.gd` (adds `BROKEN_SHORE_MAX_TY = 182` alongside preserved `SANCTUARY_MAX_TY = 96` so zero legacy tiles/props collide with the unified `2304×2880` handcrafted world)
- `game/systems/asset_paths.gd` (adds `V90_REQUIRED_PATHS` & `verify_v90_broken_shore_assets()`)
- `game/ui/prototype_hud.gd` (verifies V9.0 + V8.0 assets in banner & updates controls legend)
- `game/scenes/boot/main.gd` (reports V9.0 Broken Shore + V8.0 Forest + unmodified Mara verification on boot diagnostics)
- `game/tests/smoke_runner.gd` (verifies V9.0 Broken Shore + V8.0 Living Forest unified runtime assertions)

### Production Forge, Documentation & Automated Validation
- `docs/art-direction/V90_BROKEN_SHORE_ART_DIRECTION.md`
- `docs/integration/V90_BROKEN_SHORE_PRODUCTION_REPORT.md`
- `tools/verdant-pixel-forge/src/v90_broken_shore/` (`v90PaletteAndExtractor.ts`, `v90CoastalFloraAndWaterSprites.ts`, `v90BrokenShoreWorldDef.ts`, `v90BrokenShoreTerrain.ts`, `buildV90BrokenShoreProduction.ts`)
- `tools/verdant-pixel-forge/src/__tests__/v90BrokenShoreProductionValidation.test.ts`

---

## 6. Honest Verification Status & Windows Godot 4.7.2 Procedure

### Verified in This Sandbox
- `npm run typecheck` (`tsc --noEmit`): **PASS**
- `npx vitest run`: **7/7 test files, 32/32 tests PASSED** (covering bit-for-bit unmodified Mara SHA-256, all 21 V9.0 PNGs + `.vpf.json` dimensions & `0` magenta chroma leakage, collision-free spawn/interior/gateway paths, exact `.tscn` `load_steps` & valid `res://` references across all scenes/scripts, Intel HD 3000 shader safety, preserved V8.0 integration tests, and all 8 prior isolated studies intact).
- `npm run build` (`tsc -b && vite build`): **PASS**
- Static strict GDScript audit (`untyped_declaration`, `unsafe_cast`, `integer_division`): **0 issues**

### Honest Sandbox Limitation (Unverified Until Run on Windows)
- **No Godot `4.7.2` binary is installed inside this Linux sandbox.** Accordingly, live Godot 4.7.2 runtime execution, live Intel HD Graphics 3000 frame times / FPS measurements, and Godot-rendered viewport captures were **not** executed here and are never fabricated.

### Exact Windows Godot 4.7.2 Verification Commands
Run directly on Windows (including Intel HD Graphics 3000 hardware):

```bat
game\tools\run_production_v90_verification.bat "C:\Path\To\Godot_v4.7.2-stable_win64.exe"
```

This runs three automated steps in sequence:
1. **Headless Smoke Verification:** `godot --headless --path game res://tests/smoke_runner.tscn` (verifies all scripts, scenes, V9.0 + V8.0 assets, unmodified Mara strips, Broken Shore surfaces/tufts/fauna/scans, AND continuous V8.0 Living Forest continuity).
2. **Automated Native `640×360` Runtime Proof Capture + Hardware Telemetry:** `godot --path game -- --capture-production-proofs` (captures 9 native `640×360` Godot PNGs across Zones A–F, Breached *ICV Meridian* Interior, Twilight Mood, Collision Debug, and V8.0 Forest Hub to `game/godot_runtime_captures/` and logs actual GPU adapter, FPS & draw calls).
3. **Interactive Production Playtest:** launches `game/project.godot` at `1280×720` (`2×` integer-scaled `640×360`).
