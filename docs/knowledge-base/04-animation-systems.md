# 04 — Animation Systems

> **Verification Baseline**: Godot Engine `4.7.2-stable` (`AnimationMixer.xml`, `AnimationPlayer.xml`, `AnimationTree.xml`, `AnimationNodeStateMachine.xml`, `AnimationNodeBlendSpace2D.xml`, `AnimatedSprite2D.xml`, `Tween.xml`).  
> **Scope**: `AnimationMixer` architecture, `AnimationPlayer`, `AnimationTree`, state machines & blend spaces, sprite animation, animation callbacks, root motion, procedural/tween animation, and performance.

---

## 1. Godot 4 Animation Architecture (`AnimationMixer` Hierarchy)

In Godot 4.2+, both `AnimationPlayer` and `AnimationTree` inherit from **`AnimationMixer`**, which unifies track caching, blending, audio polyphony, deterministic evaluation, and root motion extraction.

### Key `AnimationMixer` Concepts (Verified `AnimationMixer.xml`)
- **`AnimationLibrary`**: Animations live inside named libraries (the default unnamed library `""` plus optional named libraries like `"combat/slash"`). Libraries are shareable `Resource`s — ideal for sharing locomotion sets across multiple rigs or importing animations cleanly from `.glb`/`.fbx` pipelines.
- **`callback_mode_process`**:
  - `ANIMATION_CALLBACK_MODE_PROCESS_IDLE` (default): Updates in `_process`. Use for visual-only animations.
  - `ANIMATION_CALLBACK_MODE_PROCESS_PHYSICS`: Updates in `_physics_process`. **Mandatory** when animating `AnimatableBody2D/3D`, collision shapes, hitboxes, or root-motion characters!
- **`callback_mode_method`**: Controls whether Call Method tracks fire immediately or deferred (`DEFERRED` default — prevents corrupting node tree/physics state mid-animation evaluation).
- **`deterministic`**: Enables deterministic blending order (critical when blend weights sum to 0 or for reproducible playback).
- **`reset_on_save` & `RESET` Track**: Keep a `RESET` animation holding default rest values so the editor restores clean state on save and runtime tracks don't leave dirty properties (e.g., stuck red hit-flash modulate or enabled hitbox) when an animation is interrupted!

### Godot 4.6–4.7 Verified Animation Changes
- **Godot 4.6**: `AnimationPlayer.current_animation`, `assigned_animation`, `autoplay`, and `current_animation_changed` migrated to **`StringName`**; new 3D Inverse Kinematics framework (`BoneConstraint3D`, `BoneTwistDisperser3D`, `LimitAngularVelocityModifier3D`) replaced legacy `SkeletonIK3D`.
- **Godot 4.7**:
  - `AnimationNodeBlendSpace1D` and `AnimationNodeBlendSpace2D` introduced **`SyncMode` enum (`sync_mode`)** replacing legacy boolean `sync` behavior, plus named blend points (`add_blend_point(..., name)`).
  - `Animation.length` metadata upgraded to `double`; internal optimizations to `Animation`, `AnimationLibrary`, `AnimationMixer`, `AnimationPlayer`, and `AnimationTree` (`process_thread_group` safety).

---

## 2. Choosing the Right Animation System

| System | Strengths | Best Used For | Avoid When |
| --- | --- | --- | --- |
| **`AnimatedSprite2D` + `SpriteFrames`** | Simplest setup, zero track boilerplate, fast 2D frame swaps | Simple props, pickups, basic 2D entities whose visuals don't drive hitboxes/SFX/shader params | You need synchronized hitbox timing, SFX triggers, shader flashes, or complex multi-property timelines. |
| **`AnimationPlayer`** | Can animate **any** property on any node, call methods, play audio, drive `Sprite2D.frame` + collision + shaders in lockstep | 2D characters with synced hitboxes/VFX/audio, cutscenes, doors/traps, UI transitions, discrete state playback | You need smooth 3D skeletal cross-blending, locomotion directional blend spaces, or layered upper/lower-body masks. |
| **`AnimationTree`** | Visual blend graphs (`StateMachine`, `BlendSpace1D/2D`, `BlendTree`, bone filters/masks, `OneShot`, `TimeScale`, `Add2`) | 3D skeletal characters, directional 2D/3D locomotion blending, layered upper-body actions while running | Trivial 2-frame props (unnecessary graph complexity). |
| **`Tween` (Code-Driven Procedural)** | Dynamic runtime targets, zero asset authoring, effortless easing curves | Hit-flash, button hover bounce, camera punch, floating damage numbers, dynamic knockback/recoil, springy squash-and-stretch | Fixed authored keyframe choreography (use `AnimationPlayer`). |

---

## 3. `AnimationTree` Engineering Patterns

### Separating Gameplay State from Visual Presentation
**Critical Architecture Rule**: Never make `AnimationTree` the source of truth for gameplay logic!
- Gameplay FSM / controller owns truth (`is_grounded`, `move_velocity`, `is_attacking`, `facing_dir`).
- A thin **Animation Driver** component reads gameplay state and pushes normalized parameters into `AnimationTree`:
  ```gdscript
  const PARAM_BLEND_POS: StringName = &"parameters/Locomotion/blend_position"
  const PARAM_PLAYBACK: StringName = &"parameters/playback"

  func sync_locomotion(normalized_dir: Vector2) -> void:
  	_anim_tree.set(PARAM_BLEND_POS, normalized_dir)
  ```
- Using `AnimationNodeStateMachine` **`advance_expression_base_node`** allows transitions driven cleanly by boolean expressions on a dedicated view-model/driver node without scattering `travel()` calls across gameplay scripts.
- **Layered Upper/Lower Body Blending (3D)**: Use `AnimationNodeBlendTree` with a `OneShot` or `Blend2` node + **Bone Filter** enabled on upper-body bones so characters can attack/reload/aim independently while legs blend seamlessly in a locomotion `BlendSpace2D`.

### Synchronizing Gameplay Events with Animation (Attack Windows, Footsteps, VFX)
1. **Call Method Tracks**: Call a lightweight event hook on the entity's controller or signal router (e.g., `emit_anim_event(&"footstep")`, `emit_anim_event(&"strike_frame")`) rather than directly invoking external systems from the animation track.
2. **Active Hitbox Frames**: Animate hitbox `CollisionShape` enabled state **and** always guarantee cleanup in `state.exit()` (in case the character gets staggered/interrupted mid-swing before the disable keyframe fires!).
3. **Animation Completion**: Prefer `AnimationMixer.animation_finished` signal (or StateMachine playback state checks) over brittle hardcoded timers matching clip length.

---

## 4. Root Motion vs. Code-Driven Locomotion

| Aspect | Code-Driven (`CharacterBody` velocity) | Root Motion (`AnimationMixer.get_root_motion_position()`) |
| --- | --- | --- |
| **Responsiveness** | Instant, crisp, zero input lag | Grounded, weighty, zero foot sliding |
| **Predictability** | Exact distances/speeds defined in data | Distance tied to authored clip curves |
| **Best Usage** | Platformers, fast arcade action, tight dodge/dash control | Realistic 3D melee combos, climbing/vaulting, cinematic turns |
| **Hybrid Pattern** | Use code-driven velocity for core locomotion, and selectively apply root motion delta (`get_root_motion_position() / delta`) during committed attack lunges or mantling states. |

*Note*: When extracting root motion on a `CharacterBody3D`, transform `get_root_motion_position()` by the character's current basis/rotation (`quaternion * get_root_motion_position()`) and divide by `delta` to produce velocity before calling `move_and_slide()`.

---

## 5. Procedural Animation & `Tween` Hygiene

### Reusable Procedural Techniques
- **Squash & Stretch**: Apply scale impulse on jump/land (`Vector2(0.8, 1.25)` on launch, `Vector2(1.25, 0.78)` on impact) strictly on a **visual child pivot**, NEVER on the physics root `CharacterBody` (scaling the root corrupts `CollisionShape`!).
- **Spring / Damped Harmonic Motion**: Second-order dynamics (frequency `f`, damping `zeta`, response `r`) for snappy, organic follow-through on capes, weapon sway, camera tilt, and UI panels without authoring animations.
- **2D/3D Look-At / Aim Tilt**: Rotate head/weapon pivots procedurally toward aim vectors with clamped angular velocity (`move_toward` / `lerp_angle`).

### `Tween` Lifecycle Safety
- Create Tweens bound to a node (`create_tween()` on the owning `Node`, NOT `get_tree().create_tween()`) so the Tween automatically stops when that node exits the tree or is freed!
- Always kill any previous competing Tween before starting a new one on the same property:
  ```gdscript
  var _flash_tween: Tween

  func trigger_flash() -> void:
  	if _flash_tween != null and _flash_tween.is_valid():
  		_flash_tween.kill()
  	_flash_tween = create_tween()
  	_flash_tween.tween_property(_visual, "modulate", Color.WHITE, 0.12).from(Color(3.0, 3.0, 3.0, 1.0))
  ```
- Be aware of `Tween.set_pause_mode()` if a UI Tween must animate while the game is paused.

---

## 6. Animation Performance Considerations

- Avoid running `AnimationPlayer`/`AnimationTree` on off-screen entities: disable processing (`active = false`) via `VisibleOnScreenNotifier2D/3D` when visuals are outside the camera frustum (keep gameplay timers separate so off-screen gameplay doesn't freeze unexpectedly).
- Avoid animating `String` or heavy resource allocations inside per-frame tracks; keep tracks strictly numeric/transform/frame-index.
- Prefer **GPU skinning** (Godot default) and reasonable bone counts on crowds; consider LOD meshes/rigs or baked vertex animation textures (VAT) + `MultiMeshInstance3D` for hundreds of distant animated background actors.
