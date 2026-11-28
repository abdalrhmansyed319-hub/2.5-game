# Phase 3 Deliverable F — Gameplay and Level Production Framework

> **Purpose**: Repeatable multidisciplinary blueprint governing how every gameplay feature and every playable level/environment moves from raw creative intent to polished, verified Godot execution.  
> **Foundation**: Integrates Phase 3 Sections 4 & 5 with [`Phase 2 Deliverables B, C, G`](../phase-2-deliverables/deliverable-b-master-level-design-handbook.md) and [`Exercises A, B, D, G`](../../creative-labs/README.md).

---

## 1. The 12-Step Master Gameplay Feature Production Workflow (Section 4)
*Never confuse a functioning mechanic with a polished mechanic!* Every gameplay feature follows all 12 steps:

| Step | Activity | Gate / Output |
| --- | --- | --- |
| **01. Intended Experience** | Define the exact player emotion, rhythm, and fantasy this feature delivers | 1–2 sentence Player Experience Statement |
| **02. Core Purpose** | Confirm how it reinforces, creates tension with, or rewards mastery of the Core Loop (reject isolated feature islands!) | Systems Cohesion Verification |
| **03. Gameplay Rules** | Specify clear, learnable invariants, costs, cooldowns, edge cases, and counterplay | Compact Rules Spec in `08-gameplay-systems.md` |
| **04. Technical Requirements** | Identify required Godot nodes, physics layers, input actions, signals, save persistence, and frame-time impact | Technical Impact Note |
| **05. System Architecture** | Separate immutable tuning `Resource` data (e.g., `FeelProfile`, `WeaponData`) from runtime Node state; enforce Signal-Up/Call-Down | Clean decoupled scene & script contract |
| **06. Minimal Prototype** | Build the leanest working greybox version (no ornamental VFX bloat yet) | Executable/Static-clean prototype |
| **07. Functional Testing** | Verify core triggers, edge cases, cancellations, death/reset recovery, and invalid inputs | Functional pass log (`L3`–`L5`) |
| **08. Feel Evaluation** | Judge kinetic responsiveness, predictability, readability, and emotional impact honestly | Playtest / Feel critique notes |
| **09. Feel & Feedback Polish** | Tune player-favoring forgiveness (coyote, buffering, corner nudges), anticipation/impact/follow-through, hitstop, SFX, trauma shake, visual clarity | Polished responsive mechanic |
| **10. Cross-System Integration** | Wire cleanly to Camera (`CameraDirector2D`), Audio Buses, UI/HUD indicators, AI reactions, and `SaveSystem` | Integrated vertical test |
| **11. Regression Testing** | Verify existing movement, combat, UI focus, and save loading remain unbroken | Regression pass in `15-testing-and-qa-reports.md` |
| **12. Documentation** | Update `08-gameplay-systems.md`, `18-change-history.md`, and `20-production-status.md` with honest verification level (`L1–L6`) | Up-to-date Project Memory |

---

## 2. The 5-Axis Master World & Level Production Matrix (Section 5)
Every playable room, stage, or region MUST be engineered simultaneously across all **five structural axes** (never by randomly painting tiles!):

| Axis | Required Design & Engineering Elements | Quality Check Question |
| --- | --- | --- |
| **1. Gameplay Structure** | Main route, optional risk/reward branches, exploration hooks, encounters, obstacles, interactive triggers, rewards, fair checkpoints, secrets, *Kishōtenketsu* teaching curve, sawtooth pacing | *Does the room teach, challenge, surprise, and reward cleanly without cheap deaths or dull empty stretches?* |
| **2. Spatial Structure** | Locked player/jump/camera metrics, room connections & one-way shortcuts, verticality, sightlines, silent visual guidance (lighting/leading lines/landmarks), camera bounds & look-ahead zones, unambiguous boundaries | *Can a blind player navigate the critical path with zero text arrows and zero blind leaps?* |
| **3. Visual Structure** | Foreground framing, gameplay plane separation, background parallax, cohesive lighting angle, 5-Band Value Hierarchy, detail clustering + negative space, seamless audited tile placement | *Does the room pass a desaturated grayscale squint test with instant Band 4/5 clarity and zero seam bugs?* |
| **4. Narrative Structure** | Environmental history (3-era stratigraphy where fitting), diegetic prop clusters, orienting world landmarks, regional contrast & transition zones, cohesive world causality | *Does the space communicate where you are and what happened here without stopping gameplay for exposition?* |
| **5. Technical Structure** | Clean modular Godot scene tree, separated `TileMapLayer` planes, clean collision shapes (`physics_quadrant_size`, deferred toggles), navigation meshes/regions, light/draw-call budgets, resource reuse | *Does the room load cleanly, stay within target `p99` frame budgets, and avoid softlocks or orphan nodes?* |

---

## 3. Level Production Iteration Rhythm
1. **Metrics & Intent Lock** -> 2. **2D Flow & Sightline Diagram** -> 3. **Neutral Greybox Scene** -> 4. **Greybox Flow Playtest & Revision** -> 5. **Encounters, Checkpoints & Camera Bounds** -> 6. **Audited Asset Kit Dressing (Pass 1)** -> 7. **Visual Seam & Grayscale Squint Audit** -> 8. **Lighting, Audio Ambience & Surface Footsteps** -> 9. **Full Collision, Softlock & Frame-Time QA**.
