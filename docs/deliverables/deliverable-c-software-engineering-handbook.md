# Deliverable C — Software Engineering Handbook

> **Purpose**: Prescriptive engineering principles, architectural rules, pattern governance, and code-quality discipline governing all future Godot projects.

---

## 1. Core Engineering Philosophy

1. **Engineering Over Code Generation**: Code is a maintenance cost; working, clean, replaceable systems are the asset.
2. **Simplicity First, Abstraction Earned**: Prefer the simplest reliable architecture that satisfies real requirements. Never add layers for hypothetical future features ("YAGNI").
3. **Explicit Contracts Over Implicit Conventions**: Favor static types, `@abstract` interfaces, typed signals, and `@tool` configuration warnings over tribal knowledge buried in comments.
4. **Local Reasoning & Scene Isolation**: Every scene should be runnable standalone (`F6`) or testable in isolation without booting an entire game world.
5. **Measure Performance, Prove Correctness**: Never guess about bottlenecks and never claim unexecuted code is verified.

---

## 2. Architectural Standards for Godot Projects

### Tree Coupling & Ownership Laws
- **Call Down, Signal Up**: Parents invoke child methods or inject child dependencies via `@export`. Children **never** call `get_parent().get_parent()` or hardcode upward `$"/root/..."` scene paths.
- **Scene-Local Unique Names Only**: `%NodeName` is permitted strictly inside the owning scene, never reached across scene boundaries.
- **Parent-Child Implies Lifetime Ownership**: If Entity B should survive when Entity A is freed (e.g., projectiles, death VFX, loot drops), Entity B belongs in a world container sibling, NOT as a child of Entity A.
- **Composition Over Deep Inheritance**: Limit custom script inheritance to 1–2 levels (e.g., `@abstract AIState -> PatrolState`). Build complex entities by composing focused child component nodes and immutable `Resource` profiles.

### Data & State Boundaries
- **Immutable Blueprints vs. Mutable Runtime State**: `.tres` `Resource` definitions (items, stats, movement profiles) are **read-only** at runtime. Per-instance mutable state lives on dedicated runtime objects or component fields (or explicitly `resource_local_to_scene` / `.duplicate(true)` when unavoidable).
- **Strict Logic / UI Separation**: Gameplay systems (`InventoryContainer`, `HealthComponent`, `SaveSystem`, `QuestManager`) must have **zero imports or references to `Control` nodes**. Views bind to models via signals and cleanly `unbind()` on close/exit.
- **Minimal, Scoped Autoloads**: Every Autoload requires explicit justification (process-wide lifetime, manages its own internal state, does not reach into scene internals). Prefer `class_name` + `static func` for utilities and injected scene components for gameplay systems.

---

## 3. Design Pattern Governance

Apply a pattern **only when its concrete trigger condition is present**:

| Pattern | Approved Trigger Condition | Banned Anti-Pattern |
| --- | --- | --- |
| **State / FSM / HFSM** | Entity has >= 3 mutually exclusive behavioral modes with distinct enter/exit/tick rules | Wrapping a 2-state boolean toggle (`is_open`) in 4 classes |
| **Observer (`signal` / EventBus)** | Producer should not know concrete consumers (UI, audio, achievements, quests) | Chaining 4+ indirect EventBus hops that hide deterministic execution order |
| **Strategy (`@abstract` Resource/Node)** | Behavior legitimately swaps at runtime or across entity variants (InputSource, AI steering, ItemEffect) | Creating an abstract strategy for a single fixed algorithm |
| **Command** | Action queue, undo/redo, deterministic replay, or input macro buffering is required | Wrapping direct `move_and_slide()` calls in command allocations |
| **Object Pool** | Profiling or high spawn frequency (projectiles, hit VFX, popups) warrants eliminating instantiate/free churn | Pooling rare long-lived entities (bosses, level doors) |
| **Factory** | Entity creation requires multi-step registry lookup, pool acquisition, and dependency wiring | Trivial 1-line wrapper around `PackedScene.instantiate()` |
| **Singleton (Autoload)** | Genuinely global coordinator (`SaveService`, `AudioController`, `SceneTransitioner`) | Global `GameData.gd` mutable state bucket touched by every script |

---

## 4. GDScript Code Quality Rules

### Strict Typing & Declarations
1. **100% Static Typing**: Every variable, parameter, return type, `Array[T]`, and `Dictionary[K, V]` must be explicitly typed (enable Project Settings strict warnings as errors for project scripts; exclude `addons/` via Godot 4.6 `directory_rules`).
2. **Safe Inference**: Use `:=` only when the RHS has a concrete static type — **never** use `:=` on `Variant`-returning APIs (`Dictionary.get()`, `JSON.parse_string()`, `Array[i]` on untyped arrays, `call()`).
3. **Class Definition Order (Official Godot Style Guide + `gdlint` Enforced)**:
   1. Docstring (`##`) & `@tool` / `@icon` / `@abstract`
   2. `class_name` & `extends`
   3. `signal` declarations
   4. `enum` declarations
   5. `const` declarations
   6. `@export` variables (grouped via `@export_group` / `@export_subgroup`)
   7. Public member `var`s
   8. Private member `_var`s
   9. `@onready` variables
   10. Inner classes (`class ...`)
   11. Lifecycle callbacks (`_init`, `_enter_tree`, `_ready`, `_process`, `_physics_process`, `_exit_tree`, `_unhandled_input`)
   12. Public methods
   13. Private `_helper` methods & `_on_*` signal handlers

### Structure, Naming, & Defensive Craft
- **Naming**: `PascalCase` for classes/nodes/enums, `CONSTANT_CASE` for constants/enum values, `snake_case` for functions/variables/signals/files, leading `_` for private members/helpers, `&"string_name"` for actions/groups/signals/keys.
- **Complexity Limits**: Max line length `100` characters; keep functions concise (~35 lines max, <= 6 return exits); prefer early-return guard clauses over deep nesting.
- **No Silent Failures**: Validate external inputs, null exports, and file I/O; surface contract breaches via `push_error()` / `push_warning()` / structured `Result` objects; reserve `assert()` strictly for debug-only programmer invariants (with zero side effects).
- **Lifecycle Hygiene**:
  - Guard `@onready` usage inside `@export` setters with `if is_node_ready():`.
  - Disconnect external/Autoload signal connections and kill owned `Tween`s in `_exit_tree()`.
  - Guard post-`await` and cached `Node` references with `is_instance_valid()` and `is_inside_tree()`.
  - Defer physics state changes (`set_deferred`) inside collision/area signal callbacks.
  - Never leave empty `_process()` or `_physics_process()` overrides in production scripts.

---

## 5. Code Review & Safe Refactoring Checklist

Before merging any change, verify:
- [ ] **Single clear responsibility**: Does each modified script own one cohesive role?
- [ ] **Zero hidden coupling**: No upward `get_parent()` chains, no new global state dumps, no UI refs inside logic models.
- [ ] **Inspector & Scene safety**: Were any `@export` variable names or `.tscn` node paths changed? If so, were all dependent `.tscn`/`.tres` files updated?
- [ ] **Resource safety**: Are shared `.tres` resources kept strictly immutable?
- [ ] **Physics & Interpolation safety**: Are body transforms updated only in `_physics_process()`, velocity kept in units/sec, physics flush mutations deferred, and teleports resetting interpolation?
- [ ] **Memory safety**: Any manual `Node.new()` guaranteed to enter tree or be freed? Any Autoload connections disconnected on `_exit_tree()`?
- [ ] **Verification honesty**: Static checks (`gdparse`/`gdlint`) passed? Runtime execution / tests explicitly documented with actual evidence?
