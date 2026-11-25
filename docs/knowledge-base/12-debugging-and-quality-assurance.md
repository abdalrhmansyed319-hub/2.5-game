# 12 — Debugging and Quality Assurance

> **Verification Baseline**: Godot Engine `4.7.2-stable` (`Logger.xml`, `OS.xml`, `Performance.xml`, Godot 4.5 script backtracing & custom loggers, Godot 4.6 ObjectDB snapshots & step-out debugger).  
> **Scope**: Systematic debugging methodology, stack traces, runtime/logic/physics/visual/memory bug classes, automated testing (GUT / GdUnit4 / headless CI), verification taxonomy, and regression discipline.

---

## 1. Strict Verification Taxonomy (Non-Negotiable Engineering Honesty)

Every piece of code and every feature must be tracked honestly against **five distinct states** — never conflate them:

| Level | State | Meaning | Evidence Required |
| --- | --- | --- | --- |
| **1** | **Code Written** | Files authored in workspace | Source files exist on disk |
| **2** | **Code Reviewed** | Static analysis, lint, API cross-check, architecture review | `gdparse`/`gdlint` pass, Class-Ref API audit, peer/self review checklist |
| **3** | **Code Executed** | Script actually loaded and ran inside a real Godot runtime binary | Headless or editor execution log with zero parse/runtime errors |
| **4** | **Feature Tested** | Unit/integration test suite + edge-case assertions executed and passed | Automated test runner output (GUT / GdUnit4 / CLI test scene) |
| **5** | **Feature Verified in Actual Game** | End-to-end interactive verification in target build/scene under realistic play conditions | Playtest checklist, profiler verification, zero regressions |

**Mandatory Rule**: Never mark or claim Level 3, 4, or 5 without actual execution evidence.

---

## 2. Scientific Debugging Methodology

Never apply random trial-and-error edits ("shotgun debugging"). Follow a strict 6-step loop:

1. **Reproduce Reliably**: Isolate the smallest deterministic repro (exact scene, input sequence, RNG seed, framerate/physics tick rate).
2. **Read the Exact Error & Backtrace**: Inspect the very *first* error in the Debugger -> Errors tab (subsequent errors are frequently cascading fallout from a single null reference!).
   - *Godot 4.5+*: Enable `debug/settings/gdscript/always_track_call_stacks` and register a custom **`Logger`** subclass (`OS.add_logger(my_logger)`) overriding `_log_error()` and `_log_message()` to capture structured crash/error reports even in release builds!
3. **Form a Falsifiable Hypothesis**: State explicitly what state mismatch you expect and where it diverges from truth.
4. **Instrument / Observe**:
   - Use **Breakpoints**, **Step Into / Step Over / Step Out *(4.6+)***, Remote Scene Tree inspection, Live Property Editing, and Expression Evaluator *(with history in 4.6+)*.
   - Use **Godot 4.6 Runtime Speed Controls** (slow down game speed in editor!) to inspect rapid physics/collision/animation bugs frame by frame.
   - Use **Debug Draw** (`Debug -> Visible Collision Shapes`, `Visible Navigation`, `Visible Paths`, custom `_draw()` overlays in 2D / `ImmediateMesh` in 3D).
5. **Fix the Root Cause (Not the Symptom)**: Adding `if node != null:` blindly to silence a crash often hides a deeper lifecycle or ownership bug. Ask *why* it was null!
6. **Add a Regression Guard**: Write a unit/integration test or invariant assertion so that exact defect class can never silently return.

---

## 3. Common Godot Bug Classes & Root-Cause Signatures

| Bug Category | Classic Symptom | Root Cause in Godot | Definitive Fix |
| --- | --- | --- | --- |
| **Lifecycle / Init Order** | `Invalid set index on base: 'null instance'` inside `@export` setter or sibling `_ready()` | `@export` setters run *before* `_ready()`; parent `_ready()` runs *after* children, while sibling order depends on tree order | Guard `@onready` access with `if is_node_ready():`; wire sibling references from parent coordinator's `_ready()` via dependency injection. |
| **Physics Flush Mutation** | `Can't change this state while flushing queries` error in `body_entered` / `area_entered` | Modifying `CollisionShape.disabled`, `Area.monitoring`, or `add_child` synchronously inside a physics signal callback | Use `set_deferred(&"disabled", true)` / `call_deferred(&"add_child", ...)` or connect signal with `CONNECT_DEFERRED`. |
| **Physics `delta` Misuse** | Character crawls at 1/60th speed or behaves differently at 30 Hz vs 120 Hz | Multiplying `CharacterBody.velocity` by `delta` before `move_and_slide()` (double-delta!), or moving interpolated bodies in `_process()` | Keep `velocity` in units/second; multiply only accelerations by `delta`; run all physics body updates in `_physics_process()`. |
| **Shared `Resource` Mutation** | Damaging Enemy A drops Enemy B's health or flashes all enemies white | `Resource` loaded from disk is shared by reference across every scene instance | Separate immutable blueprint `Resource` from mutable runtime state, or enable `resource_local_to_scene = true` / `duplicate()`, or use `instance uniform` in shaders. |
| **Freed Reference & Signal Leak** | `Previously freed` crash or steadily climbing `OBJECT_ORPHAN_NODE_COUNT` | Storing `Node` refs without `is_instance_valid()` checks, removing nodes via `remove_child()` without freeing, or connecting anonymous lambdas to Autoload signals without disconnecting | Guard cached node refs with `is_instance_valid()`; disconnect Autoload connections in `_exit_tree()`; audit leaks with Godot 4.6 **ObjectDB Snapshots & Diffing**. |
| **TileMapLayer `body_rid` Bug (4.5+)** | `get_coords_for_body_rid()` returns wrong cell `(0, 0)` or `(16, 0)` | Godot 4.5 enabled `physics_quadrant_size = 16` chunking by default | Compute exact cell from `collision.get_position() - collision.get_normal()` via `local_to_map()`, or set `physics_quadrant_size = 1` only on small destructible layers. |
| **UI Input Swallowing** | World clicks don't fire or buttons can't be clicked | Full-rect overlay `Control` left with `MOUSE_FILTER_STOP` instead of `MOUSE_FILTER_IGNORE`; gameplay reading `_input()` instead of `_unhandled_input()` | Inspect `Viewport.gui_get_hovered_control()` during runtime; set overlays to `MOUSE_FILTER_IGNORE`; route world input to `_unhandled_input()`. |
| **Visual / Camera Jitter** | Stuttering movement on 120 Hz/144 Hz monitors or pixel shimmering | Physics ticks mismatched with monitor refresh without interpolation, or missing `reset_physics_interpolation()` on teleport | Enable Physics Interpolation, move bodies strictly in `_physics_process()`, test at `10 Hz` physics tick rate to expose jitter immediately. |

---

## 4. Automated Testing & QA Strategy for Godot Projects

### Testing Pyramid for Games
1. **Static Analysis Gate (Fastest — runs without Godot binary or in CI)**:
   - `gdparse` (AST syntax validity) + `gdlint` (style, shadowing, complexity, unused rules) + Godot strict compiler warnings (`--check-only` in headless Godot).
2. **Pure Logic Unit Tests (Fast — milliseconds per test)**:
   - Test `RefCounted` models and deterministic math/state machines in isolation (inventory transactions, damage formulas, save migrations, quest progression, coyote/jump-buffer timers) using **GUT** (Godot Unit Test) or **GdUnit4** running in headless CLI (`godot --headless -s addons/gut/gut_cmdln.gd`).
3. **Scene Integration Tests (Moderate)**:
   - Instantiate real `.tscn` components in a headless test harness, step physics frames (`await get_tree().physics_frame`), verify signals emitted, collisions resolved, and `OBJECT_ORPHAN_NODE_COUNT == 0` after teardown!
4. **Edge-Case & Stress QA Checklist**:
   - Pause/unpause mid-action (mid-jump, mid-attack, mid-dialogue, mid-transition).
   - Rapid input mashing (double-click buttons, spam interact/save/pause).
   - Boundary values (`0` health, negative damage, max stack overflow, `0.0` weight limit, empty save file, corrupted JSON/HMAC save file, missing `.bak`).
   - Resolution & aspect-ratio sweep (16:9, 16:10, 21:9, 4:3, windowed resize).
   - Input device hot-swap (mouse+keyboard <-> gamepad focus recovery).
   - Long-session soak test (30+ minutes + scene transitions comparing Godot 4.6 ObjectDB snapshots for zero leak drift).
