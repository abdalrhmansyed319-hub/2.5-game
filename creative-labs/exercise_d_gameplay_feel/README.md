# Exercise D — Gameplay Feel Laboratory (A/B Kinetic & Forgiveness Comparator)

> **Training Notice**: Genre-agnostic kinetic feel sandbox verifying player-favoring control forgiveness and anticipation/impact/follow-through coupling in Godot `4.7.2-stable` GDScript. **Not** part of any actual game project.

---

## 1. Objective
Design and engineer an inspectable A/B gameplay feel comparator (`FeelProfile` + `FeelSandboxController2D`) that isolates six proven kinetic/forgiveness mechanics so designers can compare **"Raw Physics Baseline"** vs. **"Tuned Responsive Feel"** strictly via data swapping without modifying movement code.

## 2. Design Intent
Prove concretely why mathematically "accurate" raw physics feels punishing and stiff to humans, whereas subtle player-favoring forgiveness windows (100–120 ms timing tolerances, 4 px ceiling corner nudges, apex gravity hang, and visual-pivot squash/stretch) make identical mechanics feel exhilarating, kind, and precise.

## 3. Research
- **Maddy Thorson (*Celeste*, 2020 Developer Thread)**: Coyote time, jump buffering, apex half-gravity, and ceiling corner correction ("head-bonk wiggle").
- **Phase 2 KB-02 (Player Psychology & Game Feel)**: Anticipation/Impact/Follow-Through triad, perceptual time vs. clock time, and accessibility (`reduced_motion`).
- **Phase 1 Tech KB-03 & KB-04**: `CharacterBody2D.test_move()`, `move_and_slide()`, `Tween` on a separate `visual_pivot` (never scaling `CollisionShape2D`!).

## 4. Creative Decisions

### Quantitative A/B Tuning Matrix
| Feel Layer | `RawBaseline` | `TunedResponsive` | Psychological Effect on Player |
| --- | --- | --- | --- |
| **Coyote Time** | `0.00 s` | `0.11 s` (~6.6 frames @ 60Hz) | Prevents infuriating "I pressed jump right at the edge!" non-jumps |
| **Jump Buffer** | `0.00 s` | `0.12 s` (~7.2 frames @ 60Hz) | Fires jump on exact landing frame when pressed slightly early |
| **Apex Half-Gravity** | `1.00×` | `0.55×` when `\|vy\| <= 45` | Gives brief floating mastery window to nail micro-adjustments |
| **Variable Jump Cut** | `1.00×` (fixed arc) | `0.45×` on button release | Empowers crisp short-hops and expressive rhythmic control |
| **Ceiling Corner Correction** | `0 px` | `4 px` probe left/right | Nudges actor gently past 1–4 px ceiling clips instead of killing arc |
| **Visual Pivot Squash/Stretch** | `1.0×` static | Takeoff `(0.84, 1.22)` / Land `(1.24, 0.78)` | Instant kinetic weight without disturbing physics collision boxes |
| **Reduced-Motion Guard** | N/A | Disables squash/stretch tween cleanly | Respects vestibular accessibility while keeping all forgiveness active |

## 5. Implementation Approach
- `feel_profile.gd` (`FeelProfile` `Resource`): Exposes all feel levers as inspector-editable `@export_range` properties plus a `create_raw_baseline()` factory.
- `feel_sandbox_controller_2d.gd` (`FeelSandboxController2D`): Uses `test_move()` sweeps for deterministic ceiling corner correction and emits `feel_event_emitted(event_name, intensity)` signals so audio/particles/camera hitstop stay completely decoupled from physics!

## 6. Testing
- **Static Verification (`tools/verify_labs.py` — Executed)**: Verified `feel_profile.gd` and `feel_sandbox_controller_2d.gd` with `gdparse`, `gdlint`, and Godot `4.7.2-stable` XML Class-Ref API audit (`CharacterBody2D.test_move`, `move_and_slide`, `Tween.tween_property`, `Input.get_axis`).
- **Live Interactive Feel Playtesting**: *Not executed* (no Godot binary available in sandbox). Parameter values (`0.11s`, `0.12s`, `0.55×`, `4 px`) are industry-grounded starting baselines that MUST be playtested live with real controller/keyboard input!

## 7. Evaluation
- **Strengths**: Zero code coupling between feel tuning and physics logic; every feel effect can be toggled independently (`0.0`) for controlled A/B playtests; collision shapes stay untouched during squash/stretch.
- **Weaknesses**: `trigger_impact_hitstop()` emits a decoupled request signal rather than mutating `Engine.time_scale` directly (architecturally safer, requires a parent `HitstopManager` listener in runtime scenes); corner correction checks integer pixel offsets best suited to 2D pixel-grid platforms.

## 8. Problems
- Early draft applied `visual_pivot.scale` directly on the `CharacterBody2D` root — caught immediately against Phase 1 `KB-03` invariant (*never non-uniformly scale collision bodies!*) and moved strictly onto an exported child `visual_pivot: Node2D`.
- Ensured `feel_sandbox_controller_2d.gd` handles `Input.is_action_just_pressed` cleanly with `maxf(profile.jump_buffer_sec, delta)` so `RawBaseline` (`0.0` buffer) still triggers a crisp same-frame jump without swallowing single-frame presses!

## 9. Improvements
- Add horizontal moving-platform lift-momentum persistence (Celeste's "lift boost" grace window) and an in-game debug HUD graph plotting real-time jump arc + coyote/buffer activation markers during Godot runtime playtesting.

## 10. Final Assessment
Cleanly bridges Phase 2 game-feel theory directly into verified Godot `4.7.2-stable` data-driven GDScript architecture. Ready for instant live A/B playtest calibration once a Godot runtime is active.
