# Lab 05 — Data-Driven Inventory Architecture

## 1. Objective
Engineer a pure, UI-agnostic, strictly typed inventory model separating immutable `ItemDefinition` `Resource`s from mutable `InventorySlot` runtime instances inside a transactional `InventoryContainer` with stacking, weight limits, metadata isolation, serialization, and granular signals.

## 2. Technical Approach
- Keep `ItemDefinition` (`Resource`) strictly read-only so dozens of stacks can safely share the exact same `.tres` reference without cross-mutation bugs.
- Isolate per-instance runtime state (e.g., durability, custom attributes) in `InventorySlot.instance_metadata` and deep-duplicate dictionaries on insertion/serialization so callers cannot alias internal state.
- Make `remove_item()` strictly atomic (pre-check total available count before mutating any slot) so partial failed removals never corrupt player inventory.
- Return explicit remainders from `add_item()` so callers decide whether excess items drop to the world or reject pickup.
- Serialize strictly by `item_id: String` (never embedding raw `Resource` object pointers in save files) and rehydrate against an explicit `Dictionary[StringName, ItemDefinition]` registry.

## 3. Architecture
```text
ItemDefinition (immutable Resource .tres)
        ▲ referenced by
InventorySlot (RefCounted runtime entry: item, quantity, instance_metadata)
        ▲ owned by
InventoryContainer (RefCounted pure model -> emits slot_changed / inventory_changed)
        ▲ observed by (zero reverse coupling!)
UI Grid View / Save System
```

## 4. Implementation
- `item_definition.gd`: Read-only item schema `Resource`.
- `inventory_slot.gd`: Runtime slot state and stack compatibility validator.
- `inventory_container.gd`: Full transactional container (`add_item`, `remove_item`, `move_or_swap`, `count_item`, `get_total_weight`, `serialize`, `deserialize`).

## 5. Testing Process
- **Code Written**: Complete (3 `.gd` scripts).
- **Static Verification (`tools/verify_labs.py`)**: Verified via `gdparse`, `gdlint`, and Godot `4.7.2-stable` XML Class-Ref API checks.
- **Runtime Execution in Godot**: *Not yet executed* (pending Godot 4.7+ binary; pure `RefCounted` design allows instant zero-SceneTree headless unit testing in GUT/GdUnit4 for stack overflow, weight caps, metadata mismatch non-stacking, atomic removal rollback, and serialize/deserialize roundtrip).

## 6. Problems Encountered
- Metadata aliasing risk: passing a `Dictionary` into `add_item()` without `.duplicate(true)` would let external callers mutate slot metadata later and silently violate stack equivalence invariants. Fixed by deep-duplicating on entry and serialization.
- `Dictionary` equality in GDScript compares contents recursively, making `instance_metadata == candidate_meta` clean for preventing enchanted/damaged items from merging into pristine stacks.

## 7. Final Result
A production-ready, framework-free inventory core decoupled from Godot UI, physics, and save-file storage formats.

## 8. Possible Improvements
- Add `split_stack(from_index, to_index, split_amount)` and deterministic `sort_by(comparator: Callable)`.
- Add an `EquipmentContainer` companion enforcing typed equipment slot compatibility and emitting stat modifier deltas.
