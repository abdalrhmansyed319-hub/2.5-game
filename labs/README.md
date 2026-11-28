# Phase 1 — Practical Technical Labs (`labs/`)

> **Important Scope Notice**: This directory contains **isolated, genre-agnostic technical engineering exercises** built during Phase 1 capability preparation. It is **NOT** a game project and makes zero assumptions about any future game's genre, mechanics, story, or art style.
> **Target Engine Baseline**: Godot `4.7.2-stable`.

---

## Directory Index

| Lab | Domain Demonstrated | Documentation & Code |
| --- | --- | --- |
| **Lab 01** | Modular Player Controller (Composition, `@abstract InputSource2D`, `@tool` warnings) | [lab_01_modular_player_controller/README.md](lab_01_modular_player_controller/README.md) |
| **Lab 02** | Advanced Grounded Movement (Derived jump physics, coyote, buffer, drop-through, moving platform) | [lab_02_advanced_movement_system/README.md](lab_02_advanced_movement_system/README.md) |
| **Lab 03** | Reusable Interaction Framework (`Interactor2D`/`Interactable2D`, scoring, LOS raycast) | [lab_03_interaction_framework/README.md](lab_03_interaction_framework/README.md) |
| **Lab 04** | Modular Enemy AI (`@abstract AIState`, FSM blackboard, vision sensor, throttled `NavigationAgent2D`) | [lab_04_modular_enemy_ai/README.md](lab_04_modular_enemy_ai/README.md) |
| **Lab 05** | Data-Driven Inventory (`ItemDefinition` `Resource`, transactional `InventoryContainer`, registry serialization) | [lab_05_inventory_architecture/README.md](lab_05_inventory_architecture/README.md) |
| **Lab 06** | Multi-Layer `TileMapLayer` Environment (4 layers, terrains, custom data, 4.5+ chunk-safe collision lookup) | [lab_06_tilemap_environment/README.md](lab_06_tilemap_environment/README.md) |
| **Lab 07** | Flexible Atomic Save/Load System (JSON + HMAC-SHA256, `v1 -> v2` migration, `.tmp -> .bak -> .sav`) | [lab_07_save_load_system/README.md](lab_07_save_load_system/README.md) |
| **Lab 08** | Responsive UI & Accessibility (Containers, focus loop/restore, AccessKit, 4.7 `offset_transform_*`) | [lab_08_responsive_ui_architecture/README.md](lab_08_responsive_ui_architecture/README.md) |
| **Lab 09** | Profiling, Pooling & Batching (`NodeObjectPool`, `MultiMeshInstance2D` harness, `Performance` monitors) | [lab_09_profiling_and_optimization/README.md](lab_09_profiling_and_optimization/README.md) |
| **Lab 10** | Debugging Intentionally Broken Systems (4 paired `buggy/` vs `fixed/` classic Godot defects) | [lab_10_debugging_broken_systems/README.md](lab_10_debugging_broken_systems/README.md) |

---

## Verification Status

Run static verification locally:
```bash
python3 tools/verify_labs.py
```

Current measured static verification state:
- **Code Written**: 33 `.gd` scripts + 3 `.tscn` scenes + `labs/project.godot`
- **AST Parsed (`gdparse 4.5.0`)**: 33 / 33 PASS
- **Style & Static Linted (`gdlint 4.5.0`)**: 29 / 29 PASS (4 `lab_10/buggy/` files intentionally excluded from lint, still AST-parsed)
- **Godot `4.7.2-stable` XML Class-Ref API Checks**: 189 / 189 PASS (against 837 official engine classes)
- **Scene Structure Validation (`.tscn`)**: 3 / 3 PASS
- **Lab 10 Buggy/Fixed Invariants**: 4 / 4 PASS
- **Godot Engine Runtime Execution**: **NOT EXECUTED** (no Godot binary available in sandbox — open `labs/project.godot` in Godot `4.7.2-stable` to execute scenes and automated tests)
