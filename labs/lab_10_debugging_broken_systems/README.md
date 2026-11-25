# Lab 10 — Debugging Intentionally Broken Systems (4 Classic Godot Failure Modes)

## 1. Objective
Construct, diagnose, and repair four high-frequency, real-world Godot 4.x defect classes by authoring paired `buggy/` vs. `fixed/` implementations with explicit root-cause postmortems and automated static invariant verification.

## 2. Technical Approach
Isolate four distinct engine-level failure mechanisms rather than trivial syntax typos:
1. **Bug 01 (Memory & Signals)**: Anonymous lambda connected to a long-lived emitter without teardown + dereferencing a freed `Node2D` without `is_instance_valid()`.
2. **Bug 02 (Physics Tick & Query Flush)**: Multiplying `CharacterBody2D.velocity` by `delta` before `move_and_slide()` (double-delta scaling) + synchronously setting `CollisionShape2D.disabled` / `Area2D.monitoring` inside `body_entered`.
3. **Bug 03 (Resource Reference Semantics)**: Storing and mutating mutable `current_hp` directly on a shared `Resource` `.tres` blueprint, causing cross-instance state corruption.
4. **Bug 04 (Scene Lifecycle & Tree Coupling)**: Accessing an `@onready` child inside an `@export` setter before `_ready()` runs + reaching upward via `get_parent().get_parent().call(...)`.

## 3. Architecture
```text
lab_10_debugging_broken_systems/
├── buggy/   # Minimal reproductions of each anti-pattern (clearly marked DO NOT USE)
└── fixed/   # Clean, production-grade repairs enforcing Godot 4.7 invariants
```

## 4. Implementation
- `buggy/bug_01_signal_leak_buggy.gd` -> `fixed/bug_01_signal_leak_fixed.gd`
- `buggy/bug_02_physics_buggy.gd` -> `fixed/bug_02_physics_fixed.gd`
- `buggy/bug_03_shared_resource_buggy.gd` -> `fixed/bug_03_shared_resource_fixed.gd`
- `buggy/bug_04_lifecycle_buggy.gd` -> `fixed/bug_04_lifecycle_fixed.gd`

## 5. Testing Process
- **Code Written**: Complete (8 `.gd` scripts — 4 broken + 4 repaired).
- **Static Verification (`tools/verify_labs.py`)**:
  - All 8 files parse cleanly via `gdparse` (proving they are real *runtime/architectural* bugs, not broken syntax!).
  - All 4 `fixed/` scripts pass strict `gdlint` and Godot `4.7.2-stable` API checks.
  - Custom invariant checks in `tools/verify_labs.py` programmatically assert that each `buggy/` file exhibits its target anti-pattern and each `fixed/` file implements its exact required safeguard (`disconnect` + `is_instance_valid`, `set_deferred`, isolated runtime `_current_hp`, `is_node_ready()` + `signal` without `get_parent()`).
- **Runtime Execution in Godot**: *Not yet executed* (pending Godot 4.7+ binary; planned GUT tests assert crash/corruption reproduction on `buggy/` and clean pass + `OBJECT_ORPHAN_NODE_COUNT == 0` on `fixed/`).

## 6. Problems Encountered
- Notice how subtle these four bugs are: every single `buggy/` file is **100% valid GDScript syntax** and even passes basic type checking! That proves why static syntax checks alone are never sufficient — architectural review, engine lifecycle knowledge, and runtime/automated testing are mandatory.

## 7. Final Result
A documented reference library of 4 real Godot production failure modes paired with clean, idiomatic repairs.

## 8. Possible Improvements
- Expand with Bug 05 (`await` re-entrancy & freed-after-await) and Bug 06 (`TileMapLayer.get_coords_for_body_rid()` under Godot 4.5+ `physics_quadrant_size = 16`).
- Attach an automated Godot headless regression script reproducing each failure and verifying each fix in CI.
