# Lab 04 — Modular Enemy AI (FSM + Perception + Throttled Navigation)

## 1. Objective
Architect a modular, extensible AI agent separating **Perception** (vision cone, occlusion raycasts, memory decay), **Decision** (reusable node-based Finite State Machine using `@abstract` state contracts and typed blackboards), and **Steering/Navigation** (`NavigationAgent2D` with throttled path updates).

## 2. Technical Approach
- Define `@abstract class_name AIState` with `enter()`, `exit()`, and `@abstract physics_update(delta)` so every concrete state is statically enforced to implement its tick logic.
- Enforce "signal up" state transitions: states emit `transition_requested(next_state_name, payload)` to `AIStateMachine`, which guards against re-entrant transition loops via `_is_transitioning`.
- Throttle expensive queries: `AIPerceptionSensor2D` evaluates vision on a configurable `scan_interval` (`0.15 s`), and `AIChaseState2D` updates `NavigationAgent2D.target_position` every `0.20 s` instead of every physics tick.
- Respect `NavigationServer` map sync by skipping the first physics frame inside `AIPatrolState2D` before sampling `get_next_path_position()`.

## 3. Architecture
```text
AIAgent (CharacterBody2D)
├── NavigationAgent2D
├── AIPerceptionSensor2D (FOV + LOS + memory decay)
└── AIStateMachine (owns Dictionary[StringName, Variant] blackboard)
    ├── Patrol (AIPatrolState2D)
    └── Chase (AIChaseState2D)
```

## 4. Implementation
- `ai_state.gd`: `@abstract` base state with typed blackboard reference and `transition_requested` signal.
- `ai_state_machine.gd`: State registry, guarded transitions, `state_changed` signal.
- `ai_perception_sensor_2d.gd`: Vision cone dot-product test, `PhysicsRayQueryParameters2D` LOS check, last-known-position memory decay.
- `ai_patrol_state_2d.gd`: Cyclic waypoint navigation with arrival dwell timers.
- `ai_chase_state_2d.gd`: Throttled target pursuit falling back to `Patrol` when memory expires.

## 5. Testing Process
- **Code Written**: Complete (5 `.gd` scripts).
- **Static Verification (`tools/verify_labs.py`)**: Verified via `gdparse`, `gdlint`, and Godot `4.7.2-stable` XML Class-Ref API verification (`NavigationAgent2D`, `CharacterBody2D`, `@abstract`, `Dictionary[StringName, Variant]`).
- **Runtime Execution in Godot**: *Not yet executed* (pending Godot 4.7+ binary; planned runtime suite verifies state transitions, re-entrancy protection, wall occlusion blocking sight, and memory timeout return to patrol).

## 6. Problems Encountered
- Re-entrancy risk if `state.enter()` immediately requests another transition synchronously: guarded explicitly with `_is_transitioning` flag and `push_warning`.
- `NavigationAgent2D.get_next_path_position()` can return stale coordinates on the very first physics frame before the navigation map synchronizes; handled cleanly via `_nav_ready_frames`.

## 7. Final Result
A clean AI skeleton where adding `Search`, `Attack`, or `Stagger` requires adding new `AIState` child nodes without modifying `AIStateMachine` or `AIPerceptionSensor2D`.

## 8. Possible Improvements
- Support `NavigationAgent2D.avoidance_enabled = true` by routing desired velocity through `nav_agent.set_velocity()` and listening to `velocity_computed` for multi-agent crowds.
- Stagger `AIPerceptionSensor2D._scan_timer` with a deterministic per-instance initial offset so 50 agents never spike raycasts on the exact same physics tick.
