# 10 — Software Engineering Principles

> **Scope**: Clean architecture, SOLID applied pragmatically to Godot, Composition over Inheritance, Data-Driven Design, Design Patterns (and when NOT to use them), dependency discipline, code review standards, and safe refactoring.

---

## 1. Engineering Mindset: Code Is a Liability, Architecture Is Leverage

Writing code quickly is easy; maintaining a game 6 months into production when mechanics evolve is hard. Elite game engineering optimizes for **changeability, clarity, debuggability, and measurable performance**, never cleverness.

---

## 2. SOLID Principles Translated for Godot Engine

| Principle | Godot-Specific Meaning | Practical Violation Example | Clean Godot Solution |
| --- | --- | --- | --- |
| **Single Responsibility (SRP)** | Each script/component owns one coherent reason to change. | A 1,200-line `Player.gd` handling input, movement, combat, inventory, SFX, camera shake, and HUD updates. | Compose focused children/components: `InputSource`, `MovementMotor`, `HealthComponent`, `Interactor`, `AnimationDriver`. |
| **Open / Closed (OCP)** | Add new content/behaviors via new Resources, States, or Strategies without editing core switch statements. | Huge `match item_name:` blocks scattered in 5 scripts whenever a new item is added. | Data-driven `ItemDefinition` Resources + polymorphic `ItemEffect` sub-resources (`@abstract func apply(ctx)`). |
| **Liskov Substitution (LSP)** | Any subclass/component fulfills its base contract without surprising callers. | A subclass of `State` that expects a specific parent node type and crashes on generic actors. | Pass explicit typed interfaces/contexts or validate dependencies in `_get_configuration_warnings()`. |
| **Interface Segregation (ISP)** | Don't force components to depend on giant God-interfaces. | Every interactable object inheriting `EntityBase` with health, mana, AI, and physics. | Small independent capability components (`Interactable`, `Damageable`, `Saveable`) attached only where needed. |
| **Dependency Inversion (DIP)** | High-level logic depends on contracts (signals, `@abstract` bases, Resources), not concrete UI/level nodes. | `InventoryContainer` directly updating `$"/root/Main/HUD/InventoryGrid"`. | `InventoryContainer` emits `slot_updated(idx)`; HUD subscribes to the container. |

---

## 3. Composition Over Inheritance in Godot

Godot's Node tree **is** an object-composition engine — fight the urge to build deep inheritance trees (`Entity -> LivingEntity -> Humanoid -> ArmedHumanoid -> BossHumanoid`).

### Why Deep Inheritance Fails in Games
- Game design inevitably breaks rigid taxonomies ("Make a healing chest that walks away and can be poisoned!").
- Deep hierarchies couple every subclass to base class internals and obscure which `_physics_process()` runs first.

### Idiomatic Godot Composition
- Keep inheritance **shallow (1–2 levels max)** — e.g., `State -> PatrolState`, or `@abstract ItemEffect -> HealEffect`.
- Build entities by **attaching reusable child Component Nodes** (and/or `Resource` profiles) to a lightweight coordinating root node (`CharacterBody2D/3D`, `Node2D/3D`).
- Wire sibling components explicitly via **`@export` references in the root scene** (dependency injection in Inspector!) rather than hardcoded `get_node("../Health")` paths inside child components!

```gdscript
# Coordinator root injects dependencies cleanly in _ready() or via @export:
@export var movement_motor: MovementMotor
@export var health: HealthComponent
@export var hurtbox: HurtboxComponent
```

---

## 4. Event-Driven & Data-Driven Design

### Event-Driven Architecture
- Emit **past-tense domain signals** describing *what happened* (`health_depleted`, `item_picked_up`, `door_opened`), not imperative commands telling unknown listeners what to do (`play_death_sound_and_show_gameover`).
- Keep signal payloads minimal, typed, and immutable where possible.

### Data-Driven Design
- Move tuning constants, balance curves, loot tables, enemy profiles, and ability parameters out of hardcoded scripts into **`Resource` assets** (`.tres`) or structured schemas (JSON/CSV for large tabular datasets).
- Designers can iterate on `MovementProfile.tres` live in the Inspector without touching code, and identical systems can power completely different entities purely by swapping Resources!

---

## 5. Design Patterns — Pragmatic Selection Guide

> **Rule**: Never introduce a pattern to feel "architectural." Apply a pattern ONLY when the concrete problem it solves actually exists.

| Pattern | Real Problem It Solves | Idiomatic Godot Implementation | Over-Engineering Warning |
| --- | --- | --- | --- |
| **State / FSM / HFSM** | Complex mutually exclusive entity modes (`Idle`/`Run`/`Jump`/`Dash`/`Attack`) turning into spaghetti `if is_dashing and not is_stunned:` flags. | `StateMachine` node + `@abstract State` child nodes with `enter()`, `exit()`, `physics_update()`. | Overkill for a 2-state toggle (e.g., `is_open: bool` door). |
| **Observer** | Decoupling state producers from UI, audio, achievements, quests. | Native Godot `signal`s + scoped EventBus. | Avoid cascading signal chains 5 hops deep that hide control flow! |
| **Strategy** | Swappable algorithms (targeting rules, AI steering behaviors, damage formulas, input providers — Player vs AI vs Replay). | `@abstract` `Resource` or `RefCounted` strategy injected via `@export`. | Don't wrap a single fixed formula that will never vary. |
| **Command** | Input buffering, undo/redo (tools/level editors), deterministic replay, turn-based action queues. | `RefCounted` command objects (`execute()`, `undo()`) stored in a queue/stack. | Unnecessary for direct continuous movement unless replay/undo is a real requirement. |
| **Factory** | Complex entity spawning requiring configuration, resource lookup, pool acquisition, and initialization. | Static factory methods (`BulletFactory.spawn(config, transform)`) or dedicated `Spawner` node. | Don't write factories that merely wrap `scene.instantiate()`. |
| **Object Pool** | Allocation/GC/SceneTree churn spikes from high-frequency spawn/despawn (bullets, VFX, damage text). | Generic `ObjectPool` node managing `acquire()` / `release()` lifecycle. | Don't pool rare objects (bosses, doors, menus) — pooling adds state-reset bug surface! |
| **Singleton / Autoload** | Genuinely process-wide services (`SaveService`, `AudioController`, `SceneTransitioner`). | Godot Autoloads (strictly scoped, minimal count). | **Biggest Godot anti-pattern** when abused as global mutable state dump. |
| **Service Locator** | Avoiding rigid Autoload coupling in testable modules. | Lightweight `Services` registry allowing mock injection in tests. | Don't stack Service Locator on top of Autoloads redundantly; pick one clean boundary. |

---

## 6. Code Quality & Safe Refactoring Discipline

### Mandatory Code Quality Standards
1. **Strict Static Typing**: Type every variable, parameter, return value, Array, and Dictionary.
2. **Flat Control Flow**: Use guard clauses (`if not valid: return`) to avoid 4+ levels of nested `if`s.
3. **Small Focused Functions**: Each function does one clear thing; extract named helpers when a method grows past ~35–40 lines or mixes abstraction levels.
4. **No Magic Numbers / Strings**: Promote thresholds, layer bits, input actions, and animation names to `const` (`StringName` `&"..."`) or `@export` properties.
5. **Documentation Comments (`##`)**: Document public APIs, invariants, units (seconds, pixels/sec, meters/sec, radians vs degrees), and *why* non-obvious decisions exist — never write comments restating obvious syntax (`# increment i`).

### Safe Refactoring Protocol for Existing Code
1. **Understand before touching**: Trace all callers, signal connections (both in code AND inside `.tscn` files!), groups, and Inspector `@export` references (renaming an `@export var` silently loses serialized values in `.tscn`/`.tres` files!).
2. **Establish a characterization check / test** covering current behavior before altering internals.
3. **Refactor in small, behavior-preserving commits**: Separate structural refactoring commits from behavioral feature/bugfix commits.
4. **Verify**: Re-run static checks (`gdparse`/`gdlint`), scene reference checks, and runtime verification after every step.
