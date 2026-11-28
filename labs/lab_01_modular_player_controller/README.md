# Lab 01 — Modular Player Controller (Composition Architecture)

## 1. Objective
Design and implement a strictly typed, reusable, composition-based actor controller in Godot `4.7.2-stable` that cleanly decouples input sampling, movement tuning data, kinematic velocity solving, and `CharacterBody2D` physics execution so any component can be swapped (e.g., human input -> AI/replay input) without editing the controller.

## 2. Technical Approach
- Separate immutable tuning data (`MovementConfig2D` `Resource`) from runtime logic.
- Define a Godot 4.5+ `@abstract class_name InputSource2D` contract returning a reusable `InputIntent2D` snapshot (zero per-frame heap allocation).
- Keep `PlanarMotor2D` as a pure kinematic velocity solver testable independently of the physics engine.
- Use `@tool` + `_get_configuration_warnings()` on `ModularActorController2D` so misconfigured scenes warn immediately in the Godot Editor.
- Call `reset_physics_interpolation()` on explicit teleports (`teleport_to`) to prevent visual streak artifacts when Physics Interpolation is enabled.

## 3. Architecture
```text
ModularActor2D (CharacterBody2D — Coordinator)
├── CollisionShape2D (CapsuleShape2D)
├── PlayerInputSource2D (extends @abstract InputSource2D)
└── PlanarMotor2D (references immutable MovementConfig2D Resource)
```
- **Call Down**: `ModularActorController2D._physics_process()` queries `input_source.sample_intent()` and passes inputs to `motor.compute_velocity()`.
- **Signal Up**: `PlanarMotor2D` emits `velocity_updated` / `facing_changed`; `ModularActorController2D` emits `moved` / `interact_requested`.

## 4. Implementation
- `movement_config_2d.gd`: Read-only `@export_range` movement tuning `Resource`.
- `input_intent_2d.gd`: Reusable `RefCounted` intent DTO avoiding per-tick allocations.
- `input_source_2d.gd`: `@abstract` input interface (`@abstract func sample_intent(delta: float) -> InputIntent2D`).
- `player_input_source_2d.gd`: Concrete `InputMap` reader using `StringName` constants.
- `planar_motor_2d.gd`: Acceleration, friction, and reverse-direction turn-multiplier solver.
- `modular_actor_controller_2d.gd`: Thin `CharacterBody2D` coordinator with `@tool` configuration warnings and physics-interpolation-safe teleport.
- `modular_actor_2d.tscn`: Composed Godot 4.x scene wiring dependencies via Inspector `NodePath` exports.

## 5. Testing Process
- **Code Written**: Complete (6 `.gd` scripts + 1 `.tscn`).
- **Static Verification (`tools/verify_labs.py`)**: Verified via `gdparse` AST parsing, `gdlint` style/static checks, Godot `4.7.2-stable` XML Class-Ref API verification, and `.tscn` structure validation.
- **Runtime Execution in Godot**: *Not yet executed* (Godot binary unavailable in this sandbox; ready to run once opened in Godot 4.7+).

## 6. Problems Encountered
- Initial `.tscn` header `load_steps` count was manually estimated as `5` instead of `7` (`4 ext_resource + 2 sub_resource + 1`); caught during review/validation and corrected.
- Must guard `_ready()` and `_physics_process()` with `if Engine.is_editor_hint(): return` because `@tool` is enabled for `_get_configuration_warnings()`.

## 7. Final Result
A clean, decoupled controller blueprint where switching from keyboard/gamepad to deterministic scripted test input or AI requires swapping a single child node and zero edits to `ModularActorController2D` or `PlanarMotor2D`.

## 8. Possible Improvements
- Add a parallel 3D `PlanarMotor3D` + camera-basis projection adapter for `CharacterBody3D`.
- Add a `ScriptedInputSource2D` test double driving automated headless movement verification in GUT/GdUnit4.
