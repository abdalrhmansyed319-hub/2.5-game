# Deliverable S — Custom Tool Development Plan and Implemented Utilities

> **Part 6 Mandate**: *"Build practical supporting tools when they are genuinely useful and can be implemented safely. Do not merely describe tools that you can actually create."*  
> Below are **six genuinely implemented, tested studio utilities** in `tools/` (**4 brand-new tools built & verified right now** + **2 existing Phase 1–2 tools**), followed by **3 planned future tools** that legitimately require a live Godot runtime.

---

## 1. Implemented & Verified Studio Utilities (`tools/` — Ready Today!)

### Tool 1 — `tools/ecology_validator.py` *(NEW — Implemented & Executed!)*
- **Purpose**: Automated consistency auditor preventing broken ecosystems, unreachable upgrades, orphan biome links, and cosmetic species clones as the database scales toward 200+ organisms.
- **Inputs -> Outputs**: Reads `docs/concept/data/{biomes,flora,fauna,weather,progression}.json` -> terminal audit summary + Markdown coverage report (`docs/concept/data/ecology_validation_report.md`).
- **Dependencies**: Pure Python `3.11+` stdlib (**zero third-party dependencies!**).
- **Verified Execution & Real Bugs Caught**:
  - Pass 1 immediately caught **2 genuine trophic spatial mismatches** (`fa_10_echo_bat` eating `fa_04_prism_moth` without biome overlap; `fa_17_cloud_kite` eating `fa_03_chime_glider` without biome overlap)!
  - Upgraded during Pre-Production Lock (`DDL-006`/`DDL-009`) with **Kahn's Algorithm DAG Acyclicity + Safe-Entry Verification + Relay Spine Cross-Checking + Multi-Biome Anti-Inflation Counts**: verified **`0 errors, 0 warnings`** across `12` core + `24` sub-biomes (`36` identities, `12/12` reachable), `24` core flora (`15` multi-biome), `20` core fauna (`15` multi-biome non-legendary), **`34/34` trophic links**, `8` weather events, `7` acyclic milestones, and `3` verified Relay Spine nodes!
- **Limitations**: Validates structural & spatial logic; does not simulate real-time Godot AI pathfinding collisions.

### Tool 2 — `tools/palette_director.py` *(NEW — Implemented, Executed & Visually Inspected!)*
- **Purpose**: Automated WCAG figure-ground luminance contrast auditor + 12-Biome Color Script & Desaturated Grayscale Squint-Test Master Sheet generator.
- **Inputs -> Outputs**: `docs/concept/data/biomes.json` -> terminal WCAG contrast audit + [`docs/concept/visuals/biome_palette_master_sheet.png`](visuals/biome_palette_master_sheet.png).
- **Dependencies**: Python 3.11 + Pillow (`PIL`).
- **Verified Execution & Real Bugs Caught**:
  - Run 1 flagged **4 real low-contrast background values** (`basalt_terraces` `4.36:1`, `azure_archipelago` `4.30:1`, `quartz_peaks` `4.10:1`, and `cryo_glacier` `2.76:1`!).
  - Tuning atmospheric mist values in `biomes.json` brought **all `12/12` Core Biomes to `[PASS]` (`4.82:1`–`12.80:1` Actor/BG)**, visually confirmed across both Color and Grayscale via `read_file`!
- **Limitations**: Audits static base color scripts; cannot measure real-time Godot additive `PointLight2D` or bloom shaders.

### Tool 3 — `tools/ecosystem_visualizer.py` *(NEW — Implemented, Executed & Visually Inspected!)*
- **Purpose**: Renders live analytical visuals straight from the JSON design databases so world geography and food-web density stay inspectable at a glance.
- **Inputs -> Outputs**: `docs/concept/data/*.json` -> [`docs/concept/visuals/world_biome_climate_map.png`](visuals/world_biome_climate_map.png) (Whittaker Moisture × Temp + Adjacency Graph + Indexed Directory) & [`docs/concept/visuals/ecosystem_foodweb_graph.png`](visuals/ecosystem_foodweb_graph.png) (4-column Weather -> Flora -> Herbivores -> Predators graph).
- **Dependencies**: Python 3.11 + Pillow (`PIL`).
- **Verified Execution**: Visually inspected via `read_file`; caught overlapping labels in the wet-temperate cluster on Pass 1 and refactored into a crisp zero-overlap numbered node + right-hand directory layout verified on Pass 2!

### Tool 4 — `tools/world_chunk_simulator.py` *(NEW — Implemented, Executed & Visually Inspected!)*
- **Purpose**: Validates **offline spatial placement math & serialized entity payload size (`L4`)** for our Hybrid Handcrafted-Landmark + Poisson Ecological-Niche chunk model — *explicitly NOT a substitute for live Godot Windows runtime profiling (`L5`)!* (`DDL-012`).
- **Inputs -> Outputs**: Deterministic seed (`41904`) + Vertical Slice biome rules -> JSON telemetry + [`docs/concept/visuals/chunk_distribution_proof.png`](visuals/chunk_distribution_proof.png).
- **Dependencies**: Python 3.11 + Pillow (`PIL`).
- **Verified Execution & Real Bug Caught**:
  - Run 1 exposed a real spacing bug (`fa_01_shore_strider: 0`, `fa_03_chime_glider: 0`) because flora and fauna shared one single Poisson occlusion pool!
  - Separating `flora_pts` and `fauna_pts` layers yielded **`123` ecologically banded spawns** (`48` reedwoods, `36` kelp, `11` sun-drop bulbs, `19` glasswort, `5` stilt-striders, `4` chime-gliders), **`168` Hero Landmark cells protected with `0` overlaps**, and a tiny **`10.2 KB`** chunk entity payload—visually confirmed via `read_file`!

### Existing Verified Studio Utilities (Preserved & Operational)
- **Tool 5 — `tools/asset_inspector.py`** *(Phase 2)*: Pixel-accurate PNG/tileset/spritesheet analyzer generating Section 5D 9-field Asset Inventories (`exit 0`, `0` warnings).
- **Tool 6 — `tools/verify_labs.py`** *(Phase 1–2)*: Unified `gdparse` (`37/37`), `gdlint` (`33/33`), Godot `4.7.2-stable` XML Class-Ref API audit (`233/233` across `837` classes), `.tscn` structural validator (`3/3`), and Lab 10 invariants (`4/4`).

---

## 2. Planned Future Utilities (Require Live Production Assets or Godot Runtime)

| Planned Tool | Purpose | Why Deferred Until Production Starts |
| --- | --- | --- |
| **`tools/json_to_godot_tres.py`** | Compiles `docs/concept/data/*.json` into typed Godot `.tres` `FloraSpeciesData` / `FaunaSpeciesData` / `BiomeData` resources automatically | Requires locked final Godot project version & `res://` script UIDs at Stage 05 |
| **`tools/tileset_seam_tester.py`** | Automated edge-pixel continuity & bitmask completeness verifier for real Aseprite-exported 47-tile blob tilesets | Requires actual user/artist production tilesets at Stage 04 |
| **Godot In-Engine Ecosystem Debug Overlay (`addons/oura_debug/`)** | Live runtime HUD showing chunk streaming load times (`ms`), active Utility AI drives, acoustic noise rings, and `p99` frame graph | Requires live Godot Editor runtime (`L5`) at Stage 06 Prototyping |
