# Deliverable A — Technical Knowledge Map

> **Phase**: Phase 1 — Technical & Engineering Foundation  
> **Engine Baseline**: Godot Engine `4.7.2-stable`  
> **Knowledge Base Reference**: [`../knowledge-base/README.md`](../knowledge-base/README.md) (15 Domains)

---

## 1. Systems Dependency & Integration Architecture

Game development is not 15 disconnected checklists — it is an interlocking engineering graph where decisions in one layer constrain or empower every other layer:

```text
                      ┌─────────────────────────────────────────┐
                      │  13. Production Workflows & Technical   │
                      │      Design Alignment (Scope, Milestones│
                      │      CI/Git, Core Loop Engineering)     │
                      └────────────────────┬────────────────────┘
                                           │ governs
                      ┌────────────────────▼────────────────────┐
                      │ 10. Software Engineering & Architecture │
                      │     (SOLID, Composition, Data-Driven,   │
                      │      Pragmatic Design Patterns)         │
                      └────────────────────┬────────────────────┘
                                           │ structures
            ┌──────────────────────────────┼──────────────────────────────┐
            ▼                              ▼                              ▼
┌───────────────────────┐    ┌──────────────────────────┐    ┌───────────────────────┐
│ 01. Godot Architecture│◄──►│ 02. Advanced GDScript    │◄──►│ 09. Gameplay Systems  │
│ (Servers, SceneTree,  │    │ (Static Typing, @abstract│    │ (Combat, Inventory,   │
│  Lifecycle, Resources,│    │  Typed Collections,      │    │  Interaction, Quests, │
│  Signals, Memory)     │    │  Callables, await Safety)│    │  AI/Nav, Save/Load)   │
└───────────┬───────────┘    └──────────────────────────┘    └───────────┬───────────┘
            │ drives runtime subsystems                                  │ feeds feedback
  ┌─────────┼─────────┬──────────────┬──────────────┐                    │
  ▼         ▼         ▼              ▼              ▼                    │
┌────┐   ┌────┐   ┌────────┐    ┌────────┐    ┌──────────┐               │
│03. │   │04. │   │05.     │    │06.     │    │07. UI/UX │◄──────────────┘
│Phys│◄─►│Anim│◄─►│Render &│◄──►│TileMap │    │08. Audio │
│&Mv │   │Sys │   │Shaders │    │& Env   │    │Systems   │
└─┬──┘   └─┬──┘   └───┬────┘    └───┬────┘    └────┬─────┘
  └────────┴──────────┴─────────────┴──────────────┘
                      │ measured, hardened, and verified by
      ┌───────────────┴───────────────┬───────────────────────────────┐
      ▼                               ▼                               ▼
┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────────┐
│ 11. Performance &     │   │ 12. Debugging & QA    │   │ 14. Primary Research &    │
│     Optimization      │◄─►│     (5-Level Verify,  │◄─►│ 15. Practical Labs        │
│ (CPU/GPU/VRAM/ObjectDB│   │      Automated Tests) │   │     (labs/ + verify_labs) │
└───────────────────────┘   └───────────────────────┘   └───────────────────────────┘
```

---

## 2. Complete Domain Map, Relationships, and Production Importance

| Domain | Knowledge File | Upstream Dependencies | Downstream Impacts | Why It Is Mission-Critical in Production |
| --- | --- | --- | --- | --- |
| **01. Godot Engine Architecture** | `01-godot-engine-architecture.md` | OS/Drivers, Engine Servers | Every single scene, script, memory budget, and asset pipeline | Misunderstanding Server/Scene separation, `_enter_tree`/`_ready` order, shared `Resource` semantics, or Autoload abuse creates unmaintainable projects and subtle leaks. |
| **02. GDScript & Advanced Programming** | `02-gdscript-and-advanced-programming.md` | Domain 01 (`Object`, `RefCounted`, `Variant`) | Codebase velocity, bug rate, CPU script time, refactoring safety | Strict typing, `@abstract` contracts (4.5+), safe `await`, and clear GDScript-vs-C#/GDExtension judgment prevent entire categories of runtime failures while keeping iteration fast. |
| **03. Physics & Movement Systems** | `03-physics-and-movement-systems.md` | Domains 01, 02 (`_physics_process`, Jolt/GodotPhysics2D) | Player game feel, level geometry rules, animation timing, AI steering | Movement and physical response are what the player feels every millisecond. Fixed-tick discipline, interpolation, forgiveness windows, and clean collision masks separate responsive games from frustrating ones. |
| **04. Animation Systems** | `04-animation-systems.md` | Domains 01, 03 (`AnimationMixer`, physics callbacks) | Combat timing, visual polish, root motion, CPU/skinning cost | Decoupling gameplay truth from `AnimationTree` presentation prevents animation bugs from softlocking gameplay while keeping attacks, footsteps, and VFX frame-accurate. |
| **05. Rendering & Shaders** | `05-rendering-and-shaders.md` | Domains 01, 04 (Renderers, Viewports, CanvasItem/Spatial) | Visual identity, frame time (GPU/fillrate), readability, target hardware support | Renderer choice (`Forward+`/`Mobile`/`Compatibility`), batching hygiene, shader design, and lighting budgets dictate both visual craft and playable frame rates. |
| **06. TileMap & Environment Engineering** | `06-tilemap-and-environment-engineering.md` | Domains 01, 03, 05 (`TileMapLayer`, `TileSet`, Y-sort) | Level authoring velocity, collision reliability, navigation baking, rendering draw calls | Clean multi-layer `TileMapLayer` separation, custom data layers, terrains, and Godot 4.5+ `physics_quadrant_size` mastery empower fast, bug-free environment production. |
| **07. UI & UX Engineering** | `07-ui-and-ux-engineering.md` | Domains 01, 02, 05 (Controls, Themes, Input routing) | Usability, readability, multi-aspect scaling, controller/accessibility support | Poor `mouse_filter`, container fighting, broken gamepad focus, or UI-coupled gameplay models break usability across aspect ratios and input devices. |
| **08. Audio Systems** | `08-audio-systems.md` | Domains 01, 04, 09 (`AudioServer`, Buses, Interactive Streams) | Emotional resonance, tactile feedback, spatial awareness, audio thread CPU | Bus architecture, linear volume control, `AudioStreamRandomizer`, and native `AudioStreamInteractive`/`Synchronized` elevate perceived production value dramatically at low cost. |
| **09. Game Systems Architecture** | `09-game-systems-architecture.md` | Domains 01, 02, 03, 07, 10 | Feature velocity, save stability, content scalability, live-ops/patching | Modular Combat, Interaction, Inventory, Quest, AI, and crash-safe versioned Save/Load systems allow content to scale without exponential bug growth. |
| **10. Software Engineering Principles** | `10-software-engineering-principles.md` | General CS / SE foundations | Long-term maintainability across every script and system | Composition over inheritance, dependency inversion, pragmatic pattern usage, and safe refactoring protect teams from late-production collapse. |
| **11. Performance & Optimization** | `11-performance-and-optimization.md` | Domains 01, 03, 05, 06, 09 | Playability on min-spec hardware, frame-pacing (`p99`), battery/thermals | Measurement-driven CPU/GPU/VRAM profiling, batching, pooling, and stutter elimination guarantee smooth frame pacing without premature complexity. |
| **12. Debugging & Quality Assurance** | `12-debugging-and-quality-assurance.md` | All technical domains | Shipping reliability, regression prevention, release-build diagnostics | Scientific debugging, strict 5-level verification honesty, custom `Logger` backtraces (4.5+), ObjectDB diffing (4.6+), and automated tests turn chaotic crunch into predictable quality. |
| **13. Game Production Workflows** | `13-game-production-workflows.md` | Domains 10, 11, 12 + Game Design | Schedule realism, team parallelism, scope discipline, clean releases | Prototyping vs. vertical slice discipline, feature-first repo structure, `.uid`/`.import` Git hygiene, and CI gates keep ambition aligned with execution reality. |
| **14. Technical Research & References** | `14-technical-research-and-references.md` | Official Godot source XML, Docs, Industry Literature | Technical accuracy across engine upgrades (4.4 -> 4.7+) | Grounding decisions in version-verified primary sources eliminates deprecated habits and fabricated APIs. |
| **15. Practical Experiments & Solutions** | `15-practical-experiments-and-verified-solutions.md` | Domains 01–14 applied in `labs/` | Proven reusable patterns and concrete tooling (`tools/verify_labs.py`) | Converts passive study into tangible code artifacts, surfaced real lint/scene defects, and clarified the exact boundary between static and runtime verification. |

---

## 3. Critical Cross-Domain Coupling Points to Watch in Every Project

1. **Physics <-> Rendering**: Physics Interpolation (4.4+) requires all interpolated gameplay transforms to mutate strictly inside `_physics_process()` and requires `reset_physics_interpolation()` on teleports/pool spawns.
2. **TileMapLayer <-> Physics**: Godot 4.5+ `physics_quadrant_size = 16` merges tile collision bodies — directly changing `get_coords_for_body_rid()` behavior and requiring normal-biased world sampling or selective opt-out.
3. **Animation <-> Gameplay/Physics**: Animating `AnimatableBody` or combat hitboxes requires `ANIMATION_CALLBACK_MODE_PROCESS_PHYSICS` plus guaranteed hitbox cleanup in `State.exit()` when animations are interrupted.
4. **Resources <-> Memory & State**: Shared `.tres` caching is a massive memory optimization *and* a top source of cross-instance state corruption when mutable runtime fields leak into `Resource` blueprints.
5. **UI <-> Input & Rendering**: Godot 4.7's default `canvas_items` + `expand` stretch settings and `Control.offset_transform_*` unlock clean multi-aspect scaling and container-safe UI animation, provided `mouse_filter` and `_unhandled_input()` routing remain disciplined.
