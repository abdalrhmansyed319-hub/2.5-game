# 03 — Physics and Movement Systems

> **Verification Baseline**: Godot Engine `4.7.2-stable` (`CharacterBody2D.xml`, `CharacterBody3D.xml`, `AnimatableBody2D.xml`, `Area2D.xml`, `RayCast2D.xml`, `ShapeCast2D.xml`, `PhysicsServer2D/3D`, official Physics & Jolt documentation).  
> **Scope**: 2D/3D physics engines, body types, collision layers/masks, ray/shape queries, responsive character controllers, slopes, moving platforms, one-way collisions, and physics interpolation.

---

## 1. Physics Engines in Godot 4.6–4.7

- **2D Physics**: `GodotPhysics2D` (built-in).
- **3D Physics**:
  - **Jolt Physics** is built into Godot (4.4+) and is the **default 3D physics engine for newly created projects since Godot 4.6**.
  - Key Jolt nuances verified against Godot 4.5–4.7 migration docs:
    - Godot 4.5+: `Area3D` always detects static bodies when layers/masks match (`areas_detect_static_bodies` setting removed). Control overlaps explicitly via layers/masks.
    - Godot 4.7+: `SoftBody3D` default mass standardized to 1 kg with consistent stiffness conversion; `WorldBoundaryShape3D.plane.d` sign now matches Godot Physics convention.
  - **GodotPhysics3D** remains selectable in Project Settings if legacy compatibility is needed.

---

## 2. Physics Body & Detection Types — Selection Guide

| Node Type | Motion Control | Affected by Gravity/Forces? | Primary Use Cases |
| --- | --- | --- | --- |
| **`StaticBody2D/3D`** | Immovable world geometry | No | Walls, floors, static terrain. Moving it breaks contact velocity estimation! |
| **`AnimatableBody2D/3D`** | Moved by script/animation (`sync_to_physics = true`) | No | Moving platforms, doors, elevators. Properly imparts platform velocity to riders (`CharacterBody`, `RigidBody`). |
| **`CharacterBody2D/3D`** | Script-driven via `velocity` + `move_and_slide()` | Manual (in script) | Players, bipedal NPCs, enemies needing crisp, responsive, non-floaty movement and exact slope/wall/floor rules. |
| **`RigidBody2D/3D`** | Physics solver forces/impulses (`_integrate_forces`) | Yes | Crates, debris, projectiles affected by gravity/rebound, vehicles, ragdolls. **Never** overwrite `global_position` directly in `_physics_process` — use forces, impulses, or `PhysicsDirectBodyState` inside `_integrate_forces()`. |
| **`Area2D/3D`** | Overlap detection & local physics overrides | No | Hitboxes, hurtboxes, interaction zones, triggers, water/wind/gravity fields, audio bus zones. |

### Collision Shape Engineering Rules
- **NEVER apply non-uniform scale** (and ideally avoid scaling altogether) on `CollisionShape2D/3D` or physics bodies — it corrupts collision normals, breaks Jolt/GodotPhysics contact manifolds, and causes tunneling. Resize the underlying `Shape2D/3D` resource dimensions instead!
- Prefer primitive shapes (`CapsuleShape`, `BoxShape`/`RectangleShape`, `SphereShape`/`CircleShape`) over concave `ConcavePolygonShape` / trimesh for dynamic bodies. Capsules prevent snagging on tile/polygon seams.
- Keep `CollisionShape` resource unique (`local_to_scene` or distinct resource) if resizing dynamically at runtime (e.g., crouching hitbox).

---

## 3. Collision Layers and Masks Architecture

- **Layer** ("What I AM"): The bit(s) this `CollisionObject` occupies.
- **Mask** ("What I SCAN/COLLIDE WITH"): The bit(s) this `CollisionObject` checks against.
- **Named Layers Mandatory**: Always name physics layers in `Project Settings > Layer Names > 2D/3D Physics` before authoring scenes. Never leave anonymous layer numbers (`layer 5`, `mask 12`).
- **Standard Separation Principle**:
  - Separate solid movement geometry (`world_solid`, `one_way_platform`) from gameplay sensors (`player_hurtbox`, `enemy_hitbox`, `interactables`, `vision_occluders`).
  - **Performance Win**: Set `monitorable = false` on sensor `Area`s that only *detect* others (e.g., an interactor scanner), and `monitoring = false` on passive targets that only *get detected* (e.g., pickup/interactable volumes). This cuts broadphase pair checks roughly in half!
  - **Physics Flush Rule**: Never toggle `CollisionShape.disabled` or `Area.monitoring` synchronously inside an `area_entered`/`body_entered` signal callback — the physics space is locked during flush! Use `set_deferred(&"disabled", true)` or `set_deferred(&"monitoring", false)`.

---

## 4. `CharacterBody2D` / `CharacterBody3D` Deep Dive

### Critical `move_and_slide()` Rule (Classic Godot 4 Bug!)
- `move_and_slide()` **automatically multiplies `velocity` by `delta`** internally!
  - **WRONG**: `velocity = dir * speed * delta; move_and_slide()` (produces frame-rate-dependent crawling!).
  - **RIGHT**: `velocity = dir * speed` (units per second), accelerate with `velocity.x = move_toward(velocity.x, target, accel * delta)`, then call `move_and_slide()`.
- `move_and_slide()` modifies `velocity` to slide along hit surfaces (removing the component into the collision normal) and returns `true` if any collision occurred.

### Essential Configuration Properties (Verified `CharacterBody2D.xml`)
- **`motion_mode`**:
  - `MOTION_MODE_GROUNDED` (default): Distinguishes floor, wall, and ceiling using `up_direction` and `floor_max_angle` (default `45°` = `PI/4`). Use for side-scrollers and 3D walking/platforming.
  - `MOTION_MODE_FLOATING`: Treats all surfaces as walls; no floor snapping or slope logic. Use for top-down 2D, space/underwater, or free-flying controllers.
- **`floor_snap_length`**: Distance the body snaps downward to stay glued when descending slopes or moving platforms (e.g., `8.0` px in 2D or `0.2` m in 3D). Automatically bypassed when moving upward (jumping).
- **`floor_stop_on_slope`**: Prevents sliding slowly down sloped floors while idle.
- **`floor_constant_speed`**: Keeps horizontal ground speed constant up/down slopes instead of projecting horizontally.
- **`floor_block_on_wall`**: Prevents climbing steep walls that exceed `floor_max_angle`.
- **`platform_on_leave`**: Controls momentum inheritance when leaving a moving `AnimatableBody`:
  - `PLATFORM_ON_LEAVE_ADD_VELOCITY` (default — preserves full moving platform velocity)
  - `PLATFORM_ON_LEAVE_ADD_UPWARD_VELOCITY`
  - `PLATFORM_ON_LEAVE_DO_NOTHING`
- **`safe_margin`**: Skin thickness preventing numerical penetration into walls (avoid setting to `0.0`).

---

## 5. Responsive Movement Systems ("Game Feel" Engineering)

Raw physics is technically accurate but feels unresponsive without deliberate forgiveness mechanics:

1. **Acceleration / Deceleration / Turn-Around Curves**:
   - Separate `ground_acceleration`, `ground_friction`, `air_acceleration`, `air_drag`, and `turn_acceleration` (higher deceleration when input opposes current horizontal velocity for snappy direction reversal).
2. **Coyote Time (Ledge Forgiveness)**:
   - Track `_coyote_timer` (typically `0.08–0.14 s`). Refresh while `is_on_floor()` is true; decrement while airborne; consume immediately on jump so double-jumps cannot exploit coyote time.
3. **Jump Buffering**:
   - Track `_jump_buffer_timer` (typically `0.08–0.14 s`) when jump is pressed while airborne. If the character lands before the timer expires, execute the jump on the landing physics tick.
4. **Variable Jump Height & Asymmetric Gravity**:
   - Release jump early -> multiply upward velocity by a cut factor (e.g., `0.5`) or increase upward release gravity.
   - Apply heavier `fall_gravity` than `rise_gravity` (typically `1.3x–1.7x`) and cap `max_fall_speed` (terminal velocity) for crisp arcs.
   - Optional **Apex Hang**: Reduce gravity slightly when `absf(velocity.y) < apex_threshold` to widen peak air control.
5. **One-Way Platforms & Drop-Through**:
   - Configure `CollisionShape2D.one_way_collision = true` (and `one_way_collision_margin` to prevent tunneling at high fall speeds). Note: Godot 4.7 added directional one-way collision support on `PhysicsServer2D.body_set_shape_as_one_way_collision(..., direction)`.
   - **Clean Drop-Through Implementation**: Either nudge `position.y += 1.0` after momentarily disabling the character's collision mask bit for the dedicated `one_way_platform` layer (`set_collision_mask_value(ONE_WAY_LAYER, false)`) for ~`0.15 s` (or until clear of overlap via `ShapeCast2D`). Never disable the platform's own collision (that drops other entities too!).
6. **Moving Platforms**:
   - Build platforms with `AnimatableBody2D/3D` (`sync_to_physics = true`) driven inside `_physics_process()` (or an `AnimationPlayer` with `callback_mode_process = ANIMATION_CALLBACK_MODE_PROCESS_PHYSICS`).
   - Do **not** drive `sync_to_physics = true` platforms from `_process()` — causes desync and jitter.

---

## 6. Spatial Queries: `RayCast`, `ShapeCast`, and `PhysicsDirectSpaceState`

| Tool | Best For | Key Performance / Usage Notes |
| --- | --- | --- |
| **`RayCast2D/3D`** | Persistent sensor lines (ledge detection, wall check, ground normal probe, simple LOS) | Automatically updates once per physics tick. Call `force_raycast_update()` only if you changed `target_position` and need an immediate same-tick answer. |
| **`ShapeCast2D/3D`** | Thick sweeps (head clearance check before standing from crouch, melee sweep, landing clearance) | Avoids hairline ray misses on corners. Watch `max_results` and disable when unneeded. |
| **`get_world_2d/3d().direct_space_state`** | Ad-hoc queries (`intersect_ray`, `intersect_shape`, `intersect_point`, `cast_motion`) | **ONLY safe to query inside `_physics_process()`** (space state is locked outside physics step). Reuse `PhysicsRayQueryParameters2D/3D` objects in hot loops to reduce allocations. |

---

## 7. Physics Interpolation (Godot 4.4–4.7)

High-refresh monitors (120 Hz, 144 Hz, 240 Hz) clash with a fixed 60 Hz physics tick, producing visible motion stutter unless **Physics Interpolation** is enabled (`Project Settings > Physics > Common > Physics Interpolation`).

### Mandatory Rules When Using Physics Interpolation (Verified Official Docs)
1. **Move all interpolated gameplay objects strictly inside `_physics_process(delta)`**, NOT `_process(delta)`. Moving an interpolated node in `_process()` causes severe jitter because interpolation computes visuals between the previous and current physics-tick transforms.
2. **Teleporting / Spawning / Respawning**: Immediately call `reset_physics_interpolation()` on the node (and camera if applicable) after snapping its transform so it does not visually streak across the level from its old position!
3. **Selective Opt-Out**: Set `physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_OFF` on nodes intentionally updated per render frame (e.g., frame-rate mouse cursor reticles or UI-space effects).
4. **Testing Trick**: Temporarily lower `physics_ticks_per_second` to `10` Hz while developing — any interpolation misuse (missed `reset_physics_interpolation()`, transform modified in `_process()`) becomes immediately obvious!
5. **Camera Smoothing**: Follow the target's interpolated transform (`get_global_transform_interpolated()`) inside `_process()` or use `Camera2D/3D` interpolation cleanly so camera and target never fight each other.
