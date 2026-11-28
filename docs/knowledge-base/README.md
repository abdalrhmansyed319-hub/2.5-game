# Phase 1 — Godot & Game Engineering Knowledge Base

> **Engine Verification Baseline**: Godot `4.7.2-stable` (verified against official `godotengine/godot` `4.7.2-stable` Class Reference XML and `docs.godotengine.org`).  
> **Purpose**: Reusable, structured technical engineering reference built prior to game concept selection or production.

---

## Directory Map (15 Core Domains)

| # | Domain | File | Primary Focus |
| --- | --- | --- | --- |
| **01** | Godot Engine Architecture | [01-godot-engine-architecture.md](01-godot-engine-architecture.md) | Servers vs. SceneTree, Node lifecycle/notifications, Resources & UIDs, Signals/Groups/Autoloads, memory ownership |
| **02** | GDScript and Advanced Programming | [02-gdscript-and-advanced-programming.md](02-gdscript-and-advanced-programming.md) | Static typing, `@abstract` & variadics (4.5+), typed collections, setters, Callables/lambdas, `await` safety, GDScript vs. C#/GDExtension |
| **03** | Physics and Movement Systems | [03-physics-and-movement-systems.md](03-physics-and-movement-systems.md) | Jolt (default 3D in 4.6+), bodies & layers, `CharacterBody`, game-feel movement mechanics, one-way/moving platforms, physics interpolation |
| **04** | Animation Systems | [04-animation-systems.md](04-animation-systems.md) | `AnimationMixer`, `AnimationPlayer` vs. `AnimationTree`, 4.7 `SyncMode`, event synchronization, root motion, procedural/Tween hygiene |
| **05** | Rendering and Shaders | [05-rendering-and-shaders.md](05-rendering-and-shaders.md) | Forward+/Mobile/Compatibility, 2D batching (4.6 overhaul), pixel-perfect & scaling, Viewports/Cameras, `AreaLight3D` (4.7), shaders & stencil (4.5+) |
| **06** | TileMap and Environment Engineering | [06-tilemap-and-environment-engineering.md](06-tilemap-and-environment-engineering.md) | `TileMapLayer` multi-layer architecture, Atlas & Scene sources, Terrain modes, custom data layers, 4.5+ `physics_quadrant_size` chunking, Y-sorting |
| **07** | UI and UX Engineering | [07-ui-and-ux-engineering.md](07-ui-and-ux-engineering.md) | Anchors vs. Containers, Themes, `mouse_filter` & input order, gamepad focus, AccessKit accessibility, 4.7 `offset_transform_*` animations |
| **08** | Audio Systems | [08-audio-systems.md](08-audio-systems.md) | Positional vs. global audio, bus architecture, linear vs. dB, `AudioStreamRandomizer`, native adaptive audio (`AudioStreamInteractive`/`Synchronized`), optimization |
| **09** | Game Systems Architecture | [09-game-systems-architecture.md](09-game-systems-architecture.md) | Decoupled Combat/Health, Interaction, Inventory/Equipment, Quests, Dialogue, AI/Navigation, atomic HMAC Save/Load, Pooling, Game State |
| **10** | Software Engineering Principles | [10-software-engineering-principles.md](10-software-engineering-principles.md) | SOLID in Godot, Composition over Inheritance, Data- & Event-Driven design, pragmatic Design Patterns, code quality & safe refactoring |
| **11** | Performance and Optimization | [11-performance-and-optimization.md](11-performance-and-optimization.md) | Frame-time budgets, Visual Profiler & 4.6 ObjectDB diffing, CPU/GPU/VRAM bottlenecks, batching/MultiMesh, stutter elimination |
| **12** | Debugging and Quality Assurance | [12-debugging-and-quality-assurance.md](12-debugging-and-quality-assurance.md) | 5-level verification taxonomy, scientific debugging, 4.5+ `Logger`/backtraces, classic Godot bug catalog, automated testing (GUT/GdUnit4) |
| **13** | Game Production Workflows | [13-game-production-workflows.md](13-game-production-workflows.md) | Pre-production through post-release pipeline, prototyping vs. vertical slice, technical-design alignment, Git/CI hygiene for Godot 4.x |
| **14** | Technical Research and References | [14-technical-research-and-references.md](14-technical-research-and-references.md) | Source hierarchy, verified Godot 4.4–4.7 evolution ledger, official documentation index, foundational literature |
| **15** | Practical Experiments and Verified Solutions | [15-practical-experiments-and-verified-solutions.md](15-practical-experiments-and-verified-solutions.md) | Master synthesis of all 10 hands-on labs in `labs/`, static/API verification metrics, caught defects, and proven engineering solutions |

---

## Companion Directories
- **Practical Technical Labs**: [`../../labs/README.md`](../../labs/README.md) — 10 isolated, genre-agnostic Godot 4.7.2 engineering exercises with full 8-part engineering writeups.
- **Phase 1 Deliverables (A–F)**: [`../deliverables/`](../deliverables/) — Technical Knowledge Map, Godot Expertise Report, Software Engineering Handbook, Practical Capability Report, Technical Development Standards, and Remaining Knowledge Gaps.
- **Static Verification Tooling**: [`../../tools/verify_labs.py`](../../tools/verify_labs.py) — Automated `gdparse` + `gdlint` + Godot `4.7.2-stable` XML Class-Reference API + `.tscn` structural validator.
