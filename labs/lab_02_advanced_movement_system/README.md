# Lab 02 — Advanced Movement System (Responsive Grounded Kinematics)

## 1. Objective
Engineer a high-precision, game-feel-focused 2D grounded movement controller demonstrating derived jump kinematics (tuned by jump height & time-to-apex rather than arbitrary gravity constants), coyote time, jump buffering, variable jump cut, apex hang, slope snapping, one-way platform drop-through, and physics-synced moving platform velocity inheritance.

## 2. Technical Approach
- Derive jump launch velocity ($v_0 = -2H / t_{\text{apex}}$) and rise gravity ($g = 2H / t_{\text{apex}}^2$) from designer-friendly `jump_height` and `time_to_apex` fields in `GroundedMovementProfile2D` so tuning jump height never unpredictably alters jump duration.
- Apply asymmetric rise/fall gravity plus reduced gravity near the jump apex (`absf(velocity.y) < apex_velocity_threshold`) for responsive peak air control.
- Implement one-way drop-through strictly on the actor's collision mask (`set_collision_mask_value(ONE_WAY_LAYER_BIT, false)` + `position.y += 1.0`) rather than disabling the platform collider itself, ensuring multiplayer/multi-NPC safety.
- Pair with `WaypointPlatform2D` (`AnimatableBody2D` with `sync_to_physics = true`) updated in `_physics_process()` so `CharacterBody2D.PLATFORM_ON_LEAVE_ADD_VELOCITY` transfers exact platform velocity without jitter.

## 3. Architecture
- `GroundedMovementProfile2D` (`Resource`): Read-only kinematic tuning profile with pure helper derivation methods.
- `AdvancedMovementController2D` (`CharacterBody2D`): Consumes `InputSource2D` (reused from Lab 01!), manages timers/states, emits `jumped(used_coyote_time)`, `landed(impact_speed)`, and `dropped_through_platform`.
- `WaypointPlatform2D` (`AnimatableBody2D`): Deterministic physics-synced platform mover.

## 4. Implementation
- `grounded_movement_profile_2d.gd`
- `advanced_movement_controller_2d.gd`
- `waypoint_platform_2d.gd`

## 5. Testing Process
- **Code Written**: Complete (3 `.gd` scripts).
- **Static Verification (`tools/verify_labs.py`)**: Verified via `gdparse`, `gdlint`, and Godot `4.7.2-stable` XML Class-Ref API checks (`CharacterBody2D`, `AnimatableBody2D` properties and enum constants).
- **Runtime Execution in Godot**: *Not yet executed* (pending Godot 4.7+ binary; intended tests include 10 Hz physics-interpolation sweep, slope descent snap test, coyote/buffer edge-frame assertions, and moving platform takeoff momentum check).

## 6. Problems Encountered
- Subtle interaction between jump-buffer and drop-through: pressing `down + jump` must explicitly clear `_jump_buffer_timer` and `_coyote_timer` before `_try_execute_jump()` runs, otherwise the character simultaneously jumps upward while disabling the one-way mask! Solved by clearing both timers and gating `_try_execute_jump()` on `_drop_through_timer <= 0.0`.
- Must clamp `time_to_apex` via `maxf(0.05, time_to_apex)` to guarantee zero division-by-zero risks if edited to `0.0` in the Inspector.

## 7. Final Result
A mathematically clean, designer-tunable grounded movement system with decoupled input sampling and zero platform-side coupling.

## 8. Possible Improvements
- Replace fixed `_drop_through_timer` duration with a `ShapeCast2D` clearance check so extremely tall or slow-falling bodies re-enable one-way collision exactly upon clearing the platform.
- Add optional corner-correction nudges (head-bonk forgiveness rays) and wall-slide/wall-jump state extensions via Lab 04's FSM.
