# Lab 03 — Reusable Interaction Framework

## 1. Objective
Build a completely decoupled, component-based interaction system (`Interactor2D` + `Interactable2D`) supporting priority arbitration, facing-angle preference, distance weighting, optional line-of-sight occlusion raycasting, cooldowns, and UI-agnostic focus signals.

## 2. Technical Approach
- Apply asymmetric `Area2D` flags (`monitoring = false, monitorable = true` on `Interactable2D`; `monitoring = true, monitorable = false` on `Interactor2D`) to minimize broadphase physics pair work.
- Score overlapping interactables inside `_physics_process()` (where `direct_space_state` is guaranteed unlocked for LOS raycasts).
- Notify both the `Interactable2D` (for outline shader / highlight feedback) and external observers via `active_target_changed(previous, current)` (for floating prompt UI).

## 3. Architecture
```text
Actor Root ──> Interactor2D (Area2D, monitoring=true)
                  │ detects via physics layer 4 ("interactable")
                  ▼
World Prop ──> Interactable2D (Area2D, monitorable=true)
                  │ emits interacted(interactor) -> prop logic handles domain behavior
```

## 4. Implementation
- `interactable_2d.gd`: Passive component owning prompt label, priority, range, LOS toggle, cooldown, and focus/interaction signals.
- `interactor_2d.gd`: Active scanner managing candidate lifetime pruning, composite scoring, LOS raycast verification, and focus transitions.

## 5. Testing Process
- **Code Written**: Complete (2 `.gd` scripts).
- **Static Verification (`tools/verify_labs.py`)**: Verified via `gdparse`, `gdlint`, and Godot `4.7.2-stable` XML Class-Ref API checks (`Area2D`, `PhysicsRayQueryParameters2D.create()`, `PhysicsDirectSpaceState2D.intersect_ray()`).
- **Runtime Execution in Godot**: *Not yet executed* (pending Godot 4.7+ binary; planned tests cover overlapping multi-priority focus switching, wall LOS occlusion, freeing an active interactable mid-overlap, and cooldown gating).

## 6. Problems Encountered
- If an `Interactable2D` is freed (`queue_free()`) while currently focused, accessing `_active_target` without `is_instance_valid()` would throw a freed-instance error. Guarded via `_prune_invalid_candidates()` and `is_instance_valid()` checks in both `get_active_target()` and `_set_active_target()`.
- `direct_space_state` queries must stay strictly inside `_physics_process()`, never `_process()` or `_unhandled_input()`.

## 7. Final Result
A drop-in interaction framework requiring zero shared inheritance between doors, chests, NPCs, switches, or pickups, with deterministic target selection in cluttered environments.

## 8. Possible Improvements
- Reuse a cached `PhysicsRayQueryParameters2D` member object instead of calling `.create()` per LOS candidate to eliminate small per-tick allocations.
- Add hold-to-interact progress support (`hold_duration`, `hold_progress_changed(ratio)` signal) for long interactions.
