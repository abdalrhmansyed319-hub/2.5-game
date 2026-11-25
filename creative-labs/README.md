# Phase 2 — Practical Creative Design Laboratories (`creative-labs/`)

> **STRICT ISOLATION NOTICE**: Every exercise below (Exercises A–G) is a **100% isolated, fictional, genre-agnostic capability training laboratory**. None of these spaces, palettes, dialogue lines, worlds, or synthetic tilesets represent the user's actual future game project!

---

## Lab Directory & Verification Summary

Every exercise documents all **10 mandatory creative review sections**: *Objective, Design Intent, Research, Creative Decisions, Implementation Approach, Testing, Evaluation, Problems, Improvements, and Final Assessment*.

| Exercise | Focus Discipline | Artifacts Produced | Verification Executed |
| --- | --- | --- | --- |
| **[Exercise A](exercise_a_level_design/README.md)** | Level Design Laboratory | 3 metric-locked spatial blockouts (*Kishōtenketsu* Gauntlet, Hub-and-Spoke Loop, Vertical Shortcut Spire) | Paper/Grid Metric & Sightline Audit *(no Godot runtime playtest)* |
| **[Exercise B](exercise_b_world_building/README.md)** | World Building Laboratory | Isolated fictional 3-strata world (*The Saltglass Cisterns*): causality, 3-era stratigraphy, contrast matrix, transition zones | Geographic, Architectural & Connectivity Logic Audit |
| **[Exercise C](exercise_c_tileset_construction/README.md)** | Tileset & Asset Intelligence Lab | `build_training_tileset.py`, `synthetic_stone_moss_tileset.png`, `assembled_room_preview_4x.png`, `asset_inventory.md`, `tileset_assembly_map.gd` | **Executed** `tools/asset_inspector.py` + **2-Pass Visual Inspection (`read_file`)** catching & fixing 3 real pixel miter/seam defects + `tools/verify_labs.py` (`gdparse`/`gdlint`/Godot 4.7.2 XML) |
| **[Exercise D](exercise_d_gameplay_feel/README.md)** | Gameplay Feel Laboratory | `feel_profile.gd` (`Resource`), `feel_sandbox_controller_2d.gd` (`CharacterBody2D` A/B comparator) | **Executed** `tools/verify_labs.py` (`gdparse`/`gdlint`/Godot 4.7.2 XML) *(live feel requires Godot runtime)* |
| **[Exercise E](exercise_e_narrative/README.md)** | Narrative & Writing Laboratory | Reactive branching dialogue (Voice Test), 3 two-beat item descriptions, 2 in-world documents, 1 zero-text environmental vignette | Voice-Test, Word-Budget & Flag-Mapping Audit |
| **[Exercise F](exercise_f_art_direction/README.md)** | Art Direction Laboratory | `verify_palette_contrast.py`, `art_direction_5band_study.png` (Color + Grayscale Squint Test across 2 inverted lighting moods) | **Executed** WCAG Luminance Script + **2-Pass Visual Inspection (`read_file`)** catching & repairing `1.40:1` bright-daylight hazard contrast flaw |
| **[Exercise G](exercise_g_integrated_design/README.md)** | Integrated Design Laboratory | Full multidisciplinary vertical-slice blueprint + reusable Godot 4.7 `camera_director_2d.gd` (*Scroll Back* camera rig) | **Executed** `tools/verify_labs.py` (`gdparse`/`gdlint`/Godot 4.7.2 XML) + 10-Point Framework Audit *(live camera feel requires Godot runtime)* |

---

## Companion Tools
- **Automated Asset Intelligence Inspector**: [`../tools/asset_inspector.py`](../tools/asset_inspector.py)
- **Unified Phase 1 + Phase 2 GDScript/API Verifier**: [`../tools/verify_labs.py`](../tools/verify_labs.py)
- **Creative Knowledge Base Entry**: [`../docs/creative-knowledge-base/14-practical-creative-experiments.md`](../docs/creative-knowledge-base/14-practical-creative-experiments.md)
