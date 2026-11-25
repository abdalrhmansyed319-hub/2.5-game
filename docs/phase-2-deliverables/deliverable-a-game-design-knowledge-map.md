# Deliverable A — Complete Game Design Knowledge Map

> **Phase 2 Master Index**: Unified structural index mapping all **15 Creative Domains**, **7 Practical Creative Laboratories**, **Automated Asset Intelligence Tooling**, and their direct engineering bridges to **Phase 1's Godot `4.7.2-stable` Technical Knowledge Base**.

---

## 1. The Complete 15-Domain Creative Knowledge Architecture

| Domain | Creative Knowledge Document | Practical Proof / Lab | Phase 1 Technical Bridge |
| --- | --- | --- | --- |
| **01. Game Design Fundamentals** | [`Creative KB-01`](../creative-knowledge-base/01-game-design-fundamentals.md) | MDA, Core Loops, Flow, Meaningful Agency, Balance | [`Tech KB-09`](../knowledge-base/09-game-systems-architecture.md), [`Tech KB-13`](../knowledge-base/13-game-production-workflows.md) |
| **02. Player Psychology & Game Feel** | [`Creative KB-02`](../creative-knowledge-base/02-player-psychology-and-game-feel.md) | [`Exercise D`](../../creative-labs/exercise_d_gameplay_feel/README.md) (`FeelProfile`, `FeelSandboxController2D`) | [`Tech KB-03`](../knowledge-base/03-physics-and-movement-systems.md), [`Tech KB-04`](../knowledge-base/04-animation-systems.md), [`Lab 02`](../../labs/lab_02_advanced_movement_system/README.md) |
| **03. Professional Level Design** | [`Creative KB-03`](../creative-knowledge-base/03-professional-level-design.md) | [`Exercise A`](../../creative-labs/exercise_a_level_design/README.md) (3 Metric-Locked Blockouts) | [`Tech KB-01`](../knowledge-base/01-godot-engine-architecture.md), [`Tech KB-06`](../knowledge-base/06-tilemap-and-environment-engineering.md), [`Lab 06`](../../labs/lab_06_tilemap_environment/README.md) |
| **04. World Building & Architecture** | [`Creative KB-04`](../creative-knowledge-base/04-world-building-and-environmental-architecture.md) | [`Exercise B`](../../creative-labs/exercise_b_world_building/README.md) (3-Strata Causality World Bible) | [`Tech KB-05`](../knowledge-base/05-rendering-and-shaders.md), [`Tech KB-06`](../knowledge-base/06-tilemap-and-environment-engineering.md), [`Tech KB-08`](../knowledge-base/08-audio-systems.md) |
| **05. Asset Analysis & Tileset Eng.** | [`Creative KB-05`](../creative-knowledge-base/05-asset-analysis-and-tileset-engineering.md) | [`Exercise C`](../../creative-labs/exercise_c_tileset_construction/README.md) + [`tools/asset_inspector.py`](../../tools/asset_inspector.py) | [`Tech KB-06`](../knowledge-base/06-tilemap-and-environment-engineering.md), [`Lab 06`](../../labs/lab_06_tilemap_environment/README.md) |
| **06. Art Direction & Visual Identity** | [`Creative KB-06`](../creative-knowledge-base/06-art-direction-and-visual-identity.md) | [`Exercise F`](../../creative-labs/exercise_f_art_direction/README.md) (5-Band Color + Grayscale Study) | [`Tech KB-05`](../knowledge-base/05-rendering-and-shaders.md), [`Tech KB-11`](../knowledge-base/11-performance-and-optimization.md) |
| **07. Character & Animation Direction** | [`Creative KB-07`](../creative-knowledge-base/07-character-design-and-animation-direction.md) | Silhouette/Shape Pillars, Interactive Animation Timing | [`Tech KB-04`](../knowledge-base/04-animation-systems.md), [`Lab 04`](../../labs/lab_04_modular_enemy_ai/README.md) |
| **08. Narrative Design & Game Writing** | [`Creative KB-08`](../creative-knowledge-base/08-narrative-design-and-game-writing.md) | [`Exercise E`](../../creative-labs/exercise_e_narrative/README.md) (Dialogue, Items, Docs, Vignette) | [`Tech KB-09`](../knowledge-base/09-game-systems-architecture.md), [`Lab 07`](../../labs/lab_07_save_load_system/README.md) |
| **09. Gameplay & Systems Design** | [`Creative KB-09`](../creative-knowledge-base/09-gameplay-and-systems-design.md) | 8-Point Systems Spec Contract & Cohesion Test | [`Tech KB-09`](../knowledge-base/09-game-systems-architecture.md), [`Labs 01–07`](../../labs/README.md) |
| **10. Camera & Presentation Design** | [`Creative KB-10`](../creative-knowledge-base/10-camera-and-presentation-design.md) | [`Exercise G`](../../creative-labs/exercise_g_integrated_design/README.md) (`CameraDirector2D`) | [`Tech KB-05`](../knowledge-base/05-rendering-and-shaders.md), [`Tech KB-03`](../knowledge-base/03-physics-and-movement-systems.md) |
| **11. Sound Design & Atmosphere** | [`Creative KB-11`](../creative-knowledge-base/11-sound-design-and-atmosphere.md) | 5-Tier Mix Priority, Adaptive Stems, Strategic Silence | [`Tech KB-08`](../knowledge-base/08-audio-systems.md), [`Lab 06`](../../labs/lab_06_tilemap_environment/README.md) |
| **12. UX/UI & Player Experience** | [`Creative KB-12`](../creative-knowledge-base/12-ux-ui-and-player-experience.md) | Glanceable HUD, M+K/Gamepad Parity, AccessKit | [`Tech KB-07`](../knowledge-base/07-ui-and-ux-engineering.md), [`Lab 08`](../../labs/lab_08_responsive_ui_architecture/README.md) |
| **13. Professional Case Studies** | [`Creative KB-13`](../creative-knowledge-base/13-professional-game-design-case-studies.md) | 7 Primary Verified Studies (*Celeste, Mario 3D World, BotW, Into the Breach, Hades, HL2/Hollow Knight, Scroll Back*) | Bridged directly to `Labs 02, 06, 08` & `Creative Labs A–G` |
| **14. Practical Creative Experiments** | [`Creative KB-14`](../creative-knowledge-base/14-practical-creative-experiments.md) | Consolidated Audit of Exercises A–G & Visual/Static Catches | [`tools/verify_labs.py`](../../tools/verify_labs.py) (`37/37` `.gd`, `33/33` lint, `233` XML checks) |
| **15. Creative Standards & Evaluation** | [`Creative KB-15`](../creative-knowledge-base/15-creative-design-standards-and-evaluation.md) | 10-Point Decision Gate, Collaboration Rules, 1–5 Rubric | [`Phase 1 Deliverable E`](../deliverables/deliverable-e-technical-development-standards.md) |

---

## 2. Production Workflow Integration (How Creative & Technical Maps Connect)

```text
  [1. User Vision & Real Assets] ──► [Asset Intelligence (Deliverable D + asset_inspector.py)]
                 │
                 ▼
  [2. Creative Pillars & World DNA (Deliverables C, E, F)] ──► [10-Point Gate (Deliverable I)]
                 │
                 ▼
  [3. Locked Metrics & Greybox Levels (Deliverable B)] ──► [Godot 4.7 Modular Scenes & TileMapLayer (Phase 1)]
                 │
                 ▼
  [4. Systems, Feel, Camera & UX (Deliverable G)] ──► [Data-Driven Resources, Signals, SaveSystem, AccessKit]
                 │
                 ▼
  [5. Iterative Live Playtesting & Critique] ──► [Honest Gap Tracking (Deliverable J)]
```

---

## 3. Complete Phase 2 Deliverables Directory
- **Deliverable A**: [`deliverable-a-game-design-knowledge-map.md`](deliverable-a-game-design-knowledge-map.md) *(this document)*
- **Deliverable B**: [`deliverable-b-master-level-design-handbook.md`](deliverable-b-master-level-design-handbook.md)
- **Deliverable C**: [`deliverable-c-world-building-handbook.md`](deliverable-c-world-building-handbook.md)
- **Deliverable D**: [`deliverable-d-asset-intelligence-handbook.md`](deliverable-d-asset-intelligence-handbook.md)
- **Deliverable E**: [`deliverable-e-art-direction-handbook.md`](deliverable-e-art-direction-handbook.md)
- **Deliverable F**: [`deliverable-f-narrative-design-handbook.md`](deliverable-f-narrative-design-handbook.md)
- **Deliverable G**: [`deliverable-g-gameplay-and-player-experience-handbook.md`](deliverable-g-gameplay-and-player-experience-handbook.md)
- **Deliverable H**: [`deliverable-h-practical-creative-capability-report.md`](deliverable-h-practical-creative-capability-report.md)
- **Deliverable I**: [`deliverable-i-creative-quality-standards.md`](deliverable-i-creative-quality-standards.md)
- **Deliverable J**: [`deliverable-j-remaining-creative-knowledge-gaps.md`](deliverable-j-remaining-creative-knowledge-gaps.md)
