# *VERDANT SIGNAL* — Pre-Production Lock & Complete Concept Suite (`A`–`Y`)

> **Status**: **Controlled Pre-Production Lock COMPLETE (`L4` Verified Data, Visuals & Simulations — Ready for Windows Godot Technical & Visual Prototype Validation)**  
> **Production Boundary**: **No production game code, final world map, or mass assets have been created.** All Phase 1, Phase 2, and Phase 3 studio documentation remains 100% preserved intact.

---

## 1. Strategic Design Review & Pre-Production Lock (`W`–`Y` — Start Here!)

| Letter | Deliverable Title | Document |
| :---: | --- | --- |
| **W** | Strategic Design Review, Forensic Audit & Technical Reality Check | [`23-strategic-design-review-and-audit.md`](23-strategic-design-review-and-audit.md) |
| **X** | Studio Design Decision Log (`DDL-001`–`DDL-016` — Autonomous vs. User Input) | [`24-design-decision-log.md`](24-design-decision-log.md) |
| **Y** | Vertical Slice Acceptance Criteria (*"The Rimlands Awakening"*) | [`25-vertical-slice-acceptance-criteria.md`](25-vertical-slice-acceptance-criteria.md) |

---

## 2. Core Concept Foundation Deliverables (`A` through `V`)

| Letter | Deliverable Title | Document |
| :---: | --- | --- |
| **A** | Executive Creative Assessment | [`01-executive-creative-assessment.md`](01-executive-creative-assessment.md) |
| **B** | Original Concept Critique and Improvement Report | [`02-concept-critique-and-reinvention.md`](02-concept-critique-and-reinvention.md) |
| **C** | Final Recommended Game Identity and Core Pillars | [`03-game-identity-and-core-pillars.md`](03-game-identity-and-core-pillars.md) |
| **D** | Complete Story and Narrative Foundation | [`04-story-and-narrative-foundation.md`](04-story-and-narrative-foundation.md) |
| **E** | Planetary Worldbuilding Bible (*Oura-IV*) | [`05-planetary-worldbuilding-bible.md`](05-planetary-worldbuilding-bible.md) |
| **F** | Biome Encyclopedia and Ecological Distribution Framework | [`06-biome-encyclopedia-and-distribution.md`](06-biome-encyclopedia-and-distribution.md) |
| **G** | Flora Design and Database Specification | [`07-flora-design-and-database-spec.md`](07-flora-design-and-database-spec.md) |
| **H** | Fauna Design and Behavior Framework | [`08-fauna-design-and-behavior-framework.md`](08-fauna-design-and-behavior-framework.md) |
| **I** | Survival and Gameplay Systems Design | [`09-survival-and-gameplay-systems.md`](09-survival-and-gameplay-systems.md) |
| **J** | Scientific Exploration and Discovery System | [`10-scientific-exploration-and-discovery.md`](10-scientific-exploration-and-discovery.md) |
| **K** | Progression, Crafting, and Technology Design | [`11-progression-crafting-and-technology.md`](11-progression-crafting-and-technology.md) |
| **L** | Main Objective, Mission Structure, and Ending Design | [`12-main-objective-missions-and-endings.md`](12-main-objective-missions-and-endings.md) |
| **M** | Dynamic Weather and Environmental Events Design | [`13-dynamic-weather-and-environmental-events.md`](13-dynamic-weather-and-environmental-events.md) |
| **N** | Artistic Direction and Pixel Art Production Bible | [`14-art-direction-and-pixel-art-bible.md`](14-art-direction-and-pixel-art-bible.md) |
| **O** | Audio Direction | [`15-audio-direction.md`](15-audio-direction.md) |
| **P** | Technical Feasibility and Godot Architecture Proposal | [`16-technical-feasibility-and-godot-architecture.md`](16-technical-feasibility-and-godot-architecture.md) |
| **Q** | Content Scale and Production Cost Analysis | [`17-content-scale-and-production-cost-analysis.md`](17-content-scale-and-production-cost-analysis.md) |
| **R** | Available Tools and Capabilities Audit | [`18-available-tools-and-capabilities-audit.md`](18-available-tools-and-capabilities-audit.md) |
| **S** | Custom Tool Development Plan and Implemented Utilities | [`19-custom-tools-plan-and-utilities.md`](19-custom-tools-plan-and-utilities.md) |
| **T** | Production Roadmap and Recommended Vertical Slice | [`20-production-roadmap-and-vertical-slice.md`](20-production-roadmap-and-vertical-slice.md) |
| **U** | Risk Register and Critical Design Questions | [`21-risk-register-and-critical-decisions.md`](21-risk-register-and-critical-decisions.md) |
| **V** | Final Game Design Document (Master Living GDD) | [`22-final-game-design-document.md`](22-final-game-design-document.md) |

---

## 3. Verified Structured Databases, Visual Proofs & Studio Utilities

- **Structured Concept Databases (`docs/concept/data/`)**:
  - [`biomes.json`](data/biomes.json) (`12` core + `24` distinct sub-biomes = `36` named identities + `1` Geode Hub)
  - [`flora.json`](data/flora.json) (`24` core flora species -> `42` v1.0 catalog entries w/ zero inflation)
  - [`fauna.json`](data/fauna.json) (`20` core fauna species incl. `4` unique Keystones -> `30` v1.0 catalog entries, `34` verified trophic links)
  - [`weather.json`](data/weather.json) (`8` dynamic planetary events + `24m` day/night cycle)
  - [`progression.json`](data/progression.json) (`7` acyclic milestones, `3` Relay Spine nodes, explicit `safe_entry_mechanism` proofs)
  - [`ecology_validation_report.md`](data/ecology_validation_report.md) *(automated validator output: `0` errors, `0` warnings)*
- **Visually Inspected Studio Proof Artifacts (`docs/concept/visuals/`)**:
  - [`biome_palette_master_sheet.png`](visuals/biome_palette_master_sheet.png) (`12/12` Color + Grayscale 5-Band Contrast Audit)
  - [`world_biome_climate_map.png`](visuals/world_biome_climate_map.png) (Whittaker Moisture × Temp + Adjacency Graph)
  - [`ecosystem_foodweb_graph.png`](visuals/ecosystem_foodweb_graph.png) (4-Column Weather -> Flora -> Herbivore -> Predator Graph)
  - [`chunk_distribution_proof.png`](visuals/chunk_distribution_proof.png) (`64×64` Hybrid Hero Landmark + Poisson Niche Chunk Proof)
- **Implemented & Tested Custom Utilities (`tools/`)**:
  - [`tools/ecology_validator.py`](../../tools/ecology_validator.py)
  - [`tools/palette_director.py`](../../tools/palette_director.py)
  - [`tools/ecosystem_visualizer.py`](../../tools/ecosystem_visualizer.py)
  - [`tools/world_chunk_simulator.py`](../../tools/world_chunk_simulator.py)
