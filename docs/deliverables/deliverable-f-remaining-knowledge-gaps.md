# Deliverable F — Remaining Knowledge Gaps & Practical Testing Backlog

> **Commitment to Intellectual Honesty**: This document explicitly surfaces every technical area that has **not** yet been practically executed, deeply stress-tested, or mastered beyond theoretical/API-verified understanding. Nothing is hidden or glossed over.

---

## 1. Critical Gap #1 — Live Godot `4.7.2-stable` Runtime Execution & Automated Test Verification

- **Current State**: All 10 practical labs (`33 .gd` files, `3 .tscn` scenes) are statically parsed (`gdparse`), linted (`gdlint`), and Class-Ref API verified (`189` checks against `837` official Godot `4.7.2-stable` XML classes), **but 0 of 10 have been executed inside an actual Godot engine binary** because no Godot executable is available in this sandbox.
- **Concrete Risks Still Unverified at Runtime**:
  - Subtle GDScript runtime edge cases (e.g., strict Godot 4.7 `Typed Dictionary` / `Array[T]` variance or `NodePath` export resolution order inside hand-authored `.tscn` files).
  - Real physics behavior: `CharacterBody2D` slope transitions, `AnimatableBody2D` rider momentum handoff, `TileMapLayer` `physics_quadrant_size = 16` normal-bias collision precision, and `NavigationServer2D` first-frame map sync timing.
  - Real `SaveSystem` atomic rename behavior across OS filesystems (Windows vs. Linux `DirAccess.rename_absolute()` overwrite semantics when target file already exists!). *Note: On Windows, atomic rename over an existing destination can fail if not unlinked/rotated first — Lab 07 rotates `final_path -> bak_path` first, which mitigates this, but MUST be tested on both Linux and Windows!*
- **Remediation Plan**: Immediately upon gaining access to a Godot `4.7.2-stable` executable (locally or in CI), run `godot --headless --path labs --quit --check-only`, install GUT or GdUnit4, and write executable unit + integration tests promoting Labs 01–10 to **Level 3–4 (Executed & Tested)**.

---

## 2. Practical Gaps Across Untested Engine Subsystems

| Gap Area | Current Level | Specific Practical Gaps Remaining | Planned Deepening / Exercise |
| --- | --- | --- | --- |
| **3D Physics & Jolt Engine Practice** | Studied & XML-Verified (L2) | No hands-on 3D `CharacterBody3D`, camera-relative 3D controller, `SpringArm3D`, Jolt `RigidBody3D`/joint tuning, stair-stepping, or 3D `NavigationAgent3D` obstacle avoidance lab built yet. | Build a 3D `CharacterBody3D` + Jolt collision + camera rig + stair-snap exercise once target project dimensionality is confirmed. |
| **Shader Authoring & Visual Profiling (`.gdshader`)** | Studied (L2) | Zero live shader compilation, GPU Visual Profiler capture, RenderDoc draw-call inspection, stencil-buffer silhouette implementation (4.5+), `AreaLight3D` tuning (4.7+), or post-processing pass benchmarking performed yet. | Author and compile real `canvas_item` (`instance uniform` hit-flash, outline, water/distortion) and `spatial` (stencil X-ray, stylized lighting) shaders in Godot 4.7 and profile them with Visual Profiler + RenderDoc. |
| **Complex `AnimationTree` & 3D IK Graphs** | Studied & XML-Verified (L2) | Only procedural `Tween` was implemented (`Lab 08`). Need hands-on practice wiring `AnimationNodeStateMachine` + `BlendSpace2D` (`SyncMode` in 4.7) + Bone Filters + Root Motion + Godot 4.6's new `BoneConstraint3D`/`BoneTwistDisperser3D` IK stack. | Build a skeletal/sprite `AnimationTree` lab driven by an external gameplay FSM with synchronized attack hitboxes and interruption cleanup. |
| **Interactive Audio Implementation & Mixing** | Studied & XML-Verified (L2) | Bus layout `.tres`, `AudioStreamRandomizer`, `AudioStreamInteractive` beat-synced transitions, `AudioStreamSynchronized` stem crossfades, and `Area2D/3D` reverb overrides have not been authored or auditioned with real audio hardware. | Create a live audio test rig verifying polyphony, `AudioEffectLimiter`, linear bus sliders, stem fading, and seamless OGG loop points. |
| **Real Hardware CPU/GPU/VRAM Profiling & ObjectDB Diffing** | Harness Built (L4), Unmeasured | `Lab 09` built the measurement harness (`NodeObjectPool`, `MultiMeshInstance2D` benchmark, custom monitors), but zero real `p50`/`p95`/`p99` frame-time numbers, GPU timings, or Godot 4.6 ObjectDB snapshot diffs have been captured on actual hardware. | Execute `Lab 09` A/B sweeps (`INDIVIDUAL_SPRITES` vs `MULTIMESH_BATCHED` vs `RenderingServer.multimesh_set_buffer()`) and capture real ObjectDB leak diffs. |
| **Gameplay Systems Not Yet Lab-Implemented** | Studied (L2) | Combat (`DamagePacket`/`HealthComponent`/`Hitbox`/`Hurtbox`), Equipment/Stats modifier pipeline, Event-driven Quests, Branching Dialogue Runner, and Seeded Procedural Generation exist as blueprints (`KB-09`) rather than implemented labs. | Implement targeted labs only as needed when project requirements are defined (avoiding premature game-specific assumptions during Phase 1). |
| **Editor Plugins (`@tool`, `EditorPlugin`, `EditorInspectorPlugin`)** | Studied (L2) | Used `@tool` + `_get_configuration_warnings()` in `Lab 01`, but have not yet built custom gizmos, custom Inspector property editors, or `@export_tool_button` (4.4+) editor workflows. | Build focused editor tooling when production content pipelines (e.g., level validation, item database browser) show clear ROI. |
| **C# (.NET) Interop & GDExtension (C++/Rust)** | Conceptual (L2) | Understand decision boundaries vs. GDScript, but have not practically authored/compiled a GDExtension library or mixed GDScript/C# marshaling bridge in Godot 4.7. | Defer unless profiling a real project proves a native compute bottleneck unreachable via Godot's C++ Servers or compute shaders. |
| **Multiplayer / Networking (`MultiplayerSpawner`, `MultiplayerSynchronizer`, `@rpc`)** | Minimal Study (L1) | Not a primary Phase 1 focus; high-level replication, client-side prediction, rollback, and lag compensation require dedicated deep study if any future project involves multiplayer. | Conduct a dedicated networking spike before committing to any multiplayer feature. |
| **Platform Exporting, Patch PCKs, Shader Baker & Certification** | Studied (L2) | Have not executed real desktop/mobile/web export pipelines, Godot 4.5 Shader Baker pre-compilation, Godot 4.6 delta-encoded patch PCKs, or platform store compliance checks. | Test export presets early during Pre-Production / Vertical Slice (never wait until Beta!). |

---

## 3. Summary of Readiness vs. Caution

- **High Confidence (Ready to Architect & Engineer)**: Godot `4.7.2-stable` architecture, strictly typed GDScript, modular composition, 2D physics/movement design, `TileMapLayer` architecture, responsive/accessible UI (including 4.7 `offset_transform_*`), interaction/AI/inventory/save-load engineering, software architecture standards, and static quality gates.
- **Requires Early Runtime Validation in Next Phases**: Executing live automated tests in Godot `4.7+`, real GPU/CPU shader & Visual Profiler measurement, `AnimationTree` integration, live audio mixing, and 3D/Jolt hands-on calibration if the future project involves 3D or 2.5D workflows.
