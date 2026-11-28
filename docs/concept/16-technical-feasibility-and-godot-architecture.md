# Deliverable P — Technical Feasibility and Godot Architecture Proposal

> **Engine Verification Discipline (`Phase 3 Deliverable D` + [`DDL-012` / `DDL-013`](24-design-decision-log.md))**: Earlier static XML checks referenced official Godot `4.7.2-stable` documentation cloned into this Linux sandbox. **We DO NOT claim that Godot `4.7.2` — or ANY specific Godot version — is installed on the user's actual Windows development machine!** Stage 05 Step 0 MUST directly verify the installed Windows Godot binary, renderer (`Forward+` vs `Compatibility`), GPU, and display resolution before writing production GDScript. Furthermore, offline Python simulations (`tools/world_chunk_simulator.py`) are strictly **`L4` spatial/data-size math** and NEVER proof of live Godot Windows runtime performance (`L5`)!

---

## 1. Epistemic Honesty Matrix (Verified vs. Proposed)

| Technical Pillar | Status | Concrete Evidence / What Remains Unverified |
| --- | --- | --- |
| **Hybrid `64×64` Chunk + Hero Landmark Protection + Poisson Niche Spawning** | **Prototype Verified (`L4` Python Simulation)** | Proven in `tools/world_chunk_simulator.py` (`4096` tiles = `1024×1024 px`, `168` protected Hero Landmark cells, `0` overlaps, `123` fauna/flora entities, **`10.2 KB`** serialized entity payload). Godot runtime `TileMapLayer` streaming frame spikes remain **Proposed (`L2`) — must benchmark in Godot!** |
| **Data-Driven Ecological Taxonomy & Reachability** | **Schema & Validator Verified (`L4`)** | Proven across `docs/concept/data/*.json` via `tools/ecology_validator.py` (`0` errors, `34` trophic links). Godot custom `Resource` loading & serialization (`Lab 07`) verified at `L4` static/API only. |
| **Multi-Biome 5-Band Readability & Pixel Pipeline** | **Quantitatively + Visually Verified (`L4`)** | Proven across all `12/12` biomes via `tools/palette_director.py` + `read_file` visual audit. Real-time Godot `CanvasModulate` + 1D LUT shader + `PointLight2D` GPU fill-rate remain **Proposed (`L2`) — must profile in Godot!** |
| **Responsive 2D Locomotion & *Scroll Back* Camera** | **Static / API Verified (`L4`)** | Proven in `labs/lab_02`, `creative-labs/exercise_d` (`FeelSandboxController2D`), and `exercise_g` (`CameraDirector2D` — `gdparse`/`gdlint`/Godot `4.7.2` XML clean). Live `60–144 Hz` physics-interpolation smoothness remains **Unverified (`L5` pending)**! |

---

## 2. Large-World Streaming Architecture (Solving the "Gigantic Painterly World" Problem)

Loading a single gigantic `TileMapLayer` of `4000×4000` tiles crashes RAM and freezes frame times (confirmed in Godot 4 community benchmarks & Phase 1 `KB-06`). Our **Continental Mosaic Chunk Architecture** keeps runtime memory flat regardless of total planet size:

```text
  Active Runtime Window (3×3 Chunks around Player = 9 Chunks Loaded)
  ┌──────────────┬──────────────┬──────────────┐
  │ Chunk(-1,-1) │ Chunk(0,-1)  │ Chunk(+1,-1) │  • Each Chunk = 64×64 tiles (1024×1024 px)
  ├──────────────┼──────────────┼──────────────┤  • 1 Chunk ≈ 2.1×3.8 screens at 480×270!
  │ Chunk(-1, 0) │  [PLAYER]    │ Chunk(+1, 0) │  • Active tiles in RAM <= 36,864 cells
  ├──────────────┼──────────────┼──────────────┤  • Active wildlife entities <= 40–60 actors
  │ Chunk(-1,+1) │ Chunk(0,+1)  │ Chunk(+1,+1) │  • Preload ring via WorkerThreadPool /
  └──────────────┴──────────────┴──────────────┘    ResourceLoader.load_threaded_request()
```

### Hybrid Handcrafted + Procedural Chunk Composition
1. **Macro World Grid (`WorldAtlasResource`)**: Low-resolution hand-authored continental control map (`1 pixel = 1 chunk` or `16×16` cells) painted by the designer defining exact biome regions, rivers, coastlines, cliffs, and Hero Landmark anchor coordinates—giving **100% authorial artistic control over planetary geography!**
2. **Hero Landmark Stamps (`PackedScene` Prefabs — 35% of world space)**: Drop-Pod Clearing, Broken Relay Arch, *Surveyor-01* Wreck Core, Root-Nerve Cathedral, Tidal Monolith Shoals—hand-painted and hand-lit scenes stamped into chunks with an explicit **Landmark Exclusion Mask** (`tools/world_chunk_simulator.py`: `0` overlaps!).
3. **Ecologically Constrained Mosaic Fill (`65%` of world space)**: Deterministic seeded per-chunk terrain autotiling (`TileMapLayer.set_cells_terrain_connect`) + multi-layer Poisson-disc flora/fauna placement obeying elevation, moisture, and biome JSON rules.
4. **Separated `TileMapLayer` Stack (Per Active Chunk)**:
   - `WaterBaseLayer` (animated shoreline + reflection mask)
   - `GroundLayer` (calm Band 3 terrain + `custom_data("surface_type")` for surface footsteps!)
   - `CliffWallCollisionLayer` (`physics_quadrant_size = 16`, unified solid polygons)
   - `GroundDecalShadowLayer` (contact shadows, paths, pebble variation, zero collision)
   - `YSortWorldLayer` (`Node2D` `y_sort_enabled = true`: Player, Fauna, Multi-Tile Trees, Interactive Props)
   - `CanopyWeatherOverlayLayer` (translucent leaf canopies that fade cleanly when player walks behind them!)

---

## 3. Data-Driven Species & Simplified Readable Autonomous Fauna Architecture

- **Zero Hardcoded Species Subclasses**: All `42` v1.0 flora catalog entries (`24` core + `18` ecotypes) and `30` v1.0 fauna entries (`20` core + `10` ecotypes) are driven by lightweight `Resource` definitions compiled from `docs/concept/data/*.json` via a small build importer!
- **Simplified 2-Layer Wildlife Architecture (Replaces Fragile Global Off-Screen Migration — `DDL-010`)**:
  - **Active Ring (`3×3` chunks)**: Full Godot `CharacterBody2D` + crisp **4-State Autonomous AI** (`Routine/Forage`, `Weather-Adapt`, `Alert/Interact`, `Predation/Flee`) ticking staggered at `4 Hz` (`0.25s` slices) + `VisibleOnScreenEnabler2D` pausing off-screen sprite animations.
  - **Deterministic Chunk Ecological State Windows**: When a chunk streams into the active `3×3` ring, creature spawns & initial states evaluate deterministically from `(time_of_day × weather_state × local_conduct_delta)` — delivering lively, weather-appropriate wildlife with zero brittle global off-screen pathing overhead!
- **Vertical Slice Streaming Pragmatism (`DDL-012`)**: For *The Rimlands Awakening* (`4×4 = 16` chunks), use **author-composed macro chunk layouts + offline scatter assist + feathered 4–6 tile landmark blend collars** running on the real `3×3` threaded chunk streamer (`ResourceLoader.load_threaded_request`) — deferring runtime continental generation until live Windows `p99` streaming benchmarks pass!

---

## 4. Pixel-Perfect `480×270` Rendering, Lighting & Save Architecture

- **Rendering (`Tech KB-05`)**:
  - World rendered inside a crisp `480×270` `SubViewport` (integer-scaled with optional smooth sub-pixel camera shader for butter-smooth panning at 60–144 Hz without shimmering pixel edges!), while crisp high-res UI / Field Journal text renders cleanly on top so tiny scientific notes remain effortlessly readable!
  - **Time-of-Day & Weather Lighting**: Global `CanvasModulate` + lightweight **1D Palette LUT Screen Shader** paired with a small pool (`<= 16` active on screen) of soft `PointLight2D` halos for camp lanterns, suit headlamp, and key bioluminescent landmarks—avoiding heavy 2D shadow-caster `LightOccluder2D` fill-rate traps on low-end GPUs!
- **Save Architecture (`Phase 1 Lab 07` Delta-Save Pattern)**:
  - Never serialize 100,000 unchanged procedural tiles! Store **ONLY**: *(1) World Seed + Version*, *(2) Player State & Inventory*, *(3) Discovered Codex & Hypothesis Flags*, *(4) Story & Ending Flags*, *(5) Player-Built Camps & Relay States*, and *(6) Sparse Per-Chunk Delta Diffs* (harvested rare nodes, opened wrecks) inside atomic HMAC-verified JSON/binary save files (`< 150 KB` total!).
