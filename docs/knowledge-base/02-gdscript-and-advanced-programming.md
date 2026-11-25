# 02 — GDScript and Advanced Programming

> **Verification Baseline**: Godot Engine `4.7.2-stable` (`@GDScript.xml`, `GDScript.xml`, official GDScript reference for 4.4–4.7).  
> **Scope**: Static typing, OOP & `@abstract`, typed collections, setters/getters, signals, lambdas/Callables, coroutines/`await`, annotations, error handling, and GDScript vs. C#/GDExtension tradeoffs.

---

## 1. Static Typing & Compiler Optimization

GDScript is gradually typed, but **production projects should enforce strict static typing everywhere**.

### Why Static Typing Matters in Godot 4.x
1. **Compile-time & parse-time bug prevention**: Catches misspelled members, mismatched parameter types, and invalid casts before runtime.
2. **Real runtime performance gain**: Godot 4's GDScript VM emits specialized typed opcodes (`SET_MEMBER`, direct integer/float/Vector arithmetic, direct native method bindings) instead of generic `Variant` lookup/boxing.
3. **Self-documenting APIs & LSP precision**: Enables accurate autocomplete, hover docs, and safe refactoring.

### Key Typing Rules & Modern Godot 4.4–4.7 Syntax
- **Explicit vs. Inferred (`:=`)**:
  ```gdscript
  var speed: float = 240.0
  var direction := Vector2.ZERO # inferred as Vector2 (never use := with Variant-returning functions like Dictionary.get() or JSON.parse_string()!)
  ```
- **Typed Arrays (`Array[T]`)** *(Godot 4.0+)*:
  ```gdscript
  var waypoints: Array[Vector2] = []
  ```
  *Caveat*: `Array[SubClass]` is **not** covariant with `Array[BaseClass]` on assignment (`var a: Array[Node] = children_2d` fails); use `.assign()` when copying compatible elements.
- **Typed Dictionaries (`Dictionary[K, V]`)** *(Godot 4.4+)*:
  ```gdscript
  var item_counts: Dictionary[StringName, int] = {}
  ```
  Eliminates an entire class of untyped key/value runtime crashes and documents schema directly in type signatures.
- **Override Return Type Inheritance (Godot 4.7 breaking change, GH-115763)**:
  Overriding a method whose base signature declares a return type now inherits that return type and requires an explicit `return` statement on all paths.
- **Packed Array Element Mutation (Godot 4.7 change, GH-113228)**:
  Mutating an element of a `Packed*Array` property (`my_points[0] = Vector2.ONE`) no longer triggers the property's setter for the whole array; reassign or emit notifications explicitly when side effects are required.
- **`StringName` (`&"name"`) vs. `String`**:
  Use `StringName` for frequently compared identifiers (input actions, signal names, animation names, group names, dictionary keys). `StringName` comparisons are O(1) pointer comparisons. Note that Godot 4.6 migrated `AnimationPlayer` animation name properties (`current_animation`, `assigned_animation`, `autoplay`) to `StringName`.

---

## 2. Classes, Inheritance, Inner Classes, and `@abstract`

### Class Structure & Registration
- `class_name MyComponent` registers a global script class visible in the Inspector, `Add Node` dialog, and type annotations.
- Every `.gd` script **is** a class implicitly inheriting `RefCounted` if `extends` is omitted.
- **Inner classes** (`class SlotResult:`) are excellent for tightly scoped value objects / DTOs (e.g., damage packets, query results, inventory transaction outcomes) without polluting the global `class_name` namespace.

### Abstract Classes and Methods *(Godot 4.5+)*
Verified against `@GDScript.xml` and official 4.5+ GDScript docs:
```gdscript
@abstract
class_name State
extends Node

@abstract
func enter(context: Dictionary) -> void

@abstract
func physics_update(delta: float) -> void

func exit() -> void:
	pass
```
- An `@abstract` class cannot be instantiated directly (`State.new()` is a parse error) and appears dimmed in the editor's Add Node dialog.
- `@abstract` methods have **no body** and **must** be implemented by every non-abstract subclass.
- Rules verified from Godot 4.5+:
  - Any class containing an unimplemented `@abstract` method must itself be marked `@abstract`.
  - `super()` cannot call an `@abstract` base method.
  - `static func` and lambdas cannot be `@abstract`.
- **When to use `@abstract`**: State machine bases, strategy/command contracts, saveable/interactable base components where a missing override must fail at parse time rather than silently doing nothing at runtime.

### Variadic Functions *(Godot 4.5+)*
```gdscript
func log_values(prefix: String, ...values: Array) -> void:
	print(prefix, " ", values)
```
- The rest parameter collects excess arguments into an untyped `Array` (cannot annotate `...values: Array[int]`).
- To forward arguments to another function, use `target_callable.callv(values)`.

---

## 3. Properties, Setters/Getters, Enums, and Constants

### Setters and Getters
```gdscript
signal health_changed(new_value: float, max_value: float)

@export var max_health: float = 100.0:
	set(value):
		max_health = maxf(1.0, value)
		health = minf(health, max_health)

var health: float = 100.0:
	set(value):
		var clamped := clampf(value, 0.0, max_health)
		if is_equal_approx(clamped, health):
			return
		health = clamped
		health_changed.emit(health, max_health)
```
**Critical Pitfalls**:
1. **Accessing `health` inside its own setter/getter directly accesses the backing field** (no infinite recursion in Godot 4), **EXCEPT** calling `self.health = ...` *does* re-invoke the setter!
2. **`@export` setters run BEFORE `_ready()`** when a scene is deserialized! Never touch `@onready` child node references inside a setter without checking `if is_node_ready():` first!
3. **Float equality**: Prefer `is_equal_approx()` over `==` for floating-point change guards.

### Enums and Constants
- Named enums (`enum MoveState { IDLE, RUN, AIRBORNE }`) act as typed integer sets and work directly with `@export var state: MoveState`.
- Use `const` for compile-time constants (`const GRAVITY_SCALE: float = 1.0`, `const ACTION_JUMP: StringName = &"jump"`).
- Use `static var` / `static func` (Godot 4.1+) for class-level helpers and factories without Autoloads. Use `@static_unload` on classes with static references to `Node`/`Resource` if they could leak on reload/exit.

---

## 4. Signals, Callables, and Lambdas

### First-Class Signals & Callables
```gdscript
signal item_added(item_id: StringName, quantity: int)

func _ready() -> void:
	item_added.connect(_on_item_added)

func _on_item_added(item_id: StringName, quantity: int) -> void:
	pass
```
- `Callable` binds an object + method name (or lambda closure) and supports `.bind(...)`, `.unbind(n)`, `.call()`, `.callv(args)`, `.call_deferred()`, and `.is_valid()`.
- **Lambda Capture Semantics (CRITICAL!)**:
  - Value types (`int`, `float`, `bool`, `Vector2`, `String`) are captured **by value** at lambda creation time — mutating a captured local `int` inside a lambda does NOT mutate the outer variable!
  - Reference types (`Array`, `Dictionary`, `Object`) capture the reference (mutations to contents are visible outside).
- **Disconnecting Lambdas**: Store the lambda `Callable` in a member variable if you must disconnect it later, or prefer named methods on the subscriber node.

---

## 5. Coroutines, `await`, and Asynchronous Pitfalls

`await` suspends function execution until a signal fires or a coroutine returns, returning a `GDScriptFunctionState`-like coroutine internally.

```gdscript
func play_hit_stop(duration: float) -> void:
	if duration <= 0.0:
		return
	await get_tree().create_timer(duration, false).timeout
	if not is_instance_valid(self) or not is_inside_tree():
		return
	_resume_after_hit_stop()
```

### Mandatory `await` Safety Rules
1. **Re-entrancy hazard**: A button click or trigger firing twice can launch two concurrent coroutines mutating the same state! Guard with state flags, generation counters (`var _action_token: int = 0`), or `Tween` replacement (`if _tween: _tween.kill()`).
2. **Post-`await` validity hazard**: While suspended, `self`, target nodes, or `get_tree()` may have exited the tree or been freed! Always validate `is_inside_tree()` / `is_instance_valid(target)` immediately after `await` before accessing nodes.
3. **Never `await` inside `_physics_process()` or `_process()`** — it spawns an unbound coroutine every tick!
4. **Pause-aware timers**: `get_tree().create_timer(seconds, process_always)` defaults `process_always = true` (keeps ticking while paused!). Pass `false` for gameplay timers that must pause with the game!

---

## 6. Verified Godot 4.7.2 Annotations Reference

Verified directly from `/tmp/godot-ref/modules/gdscript/doc_classes/@GDScript.xml`:

| Category | Verified Annotations |
| --- | --- |
| **Lifecycle / Execution** | `@tool`, `@onready`, `@abstract` *(4.5+)*, `@static_unload`, `@icon("res://...")` |
| **Networking** | `@rpc("authority"/"any_peer", "call_local"/"call_remote", "reliable"/"unreliable", channel)` |
| **Inspector Organization** | `@export_category`, `@export_group`, `@export_subgroup` |
| **Inspector Typing & Widgets** | `@export`, `@export_range`, `@export_enum`, `@export_flags`, `@export_flags_2d_physics`, `@export_flags_3d_physics`, `@export_flags_2d_render`, `@export_flags_3d_render`, `@export_flags_2d_navigation`, `@export_flags_3d_navigation`, `@export_flags_avoidance`, `@export_exp_easing`, `@export_color_no_alpha`, `@export_multiline`, `@export_placeholder`, `@export_file`, `@export_file_path`, `@export_dir`, `@export_global_file`, `@export_global_dir`, `@export_node_path`, `@export_storage`, `@export_custom`, `@export_tool_button` *(4.4+)* |
| **Compiler Warnings** | `@warning_ignore("code")`, `@warning_ignore_start("code")` *(4.4+)*, `@warning_ignore_restore("code")` *(4.4+)* |

---

## 7. Error Handling & Defensive Programming

GDScript does **not** have `try`/`catch` exceptions. Error handling is explicit and contract-driven:

1. **Return `Error` enum or typed Result objects**: Follow Godot's `OK` / `ERR_*` convention or return an inner `Result` object (`ok: bool`, `error_code: Error`, `message: String`, `value: Variant`).
2. **Engine error reporting**:
   - `push_error("...")` / `push_warning("...")`: Logs to debugger, triggers script backtrace (Godot 4.5+), and works in release builds without crashing.
   - `assert(condition, "message")`: **Debug builds only** (stripped in release exports!). Never put side-effectful expressions inside `assert()`.
3. **Configuration warnings (`@tool` + `_get_configuration_warnings() -> PackedStringArray`)**: Surface missing required exports or misconfigured child nodes directly in the Scene Tree dock before the game even runs.
4. **Null/Freed guards**: Prefer early-return guard clauses (`if target == null or not is_instance_valid(target): return`) to keep indentation flat and failure modes explicit.

---

## 8. GDScript vs. C# vs. GDExtension Decision Matrix

| Criterion | GDScript | C# (.NET) | GDExtension (C++/Rust) |
| --- | --- | --- | --- |
| **Iteration speed** | Fastest (zero external build step, instant hot-reload) | Moderate (MSBuild compile cycle) | Slowest (native compilation per target platform) |
| **Engine integration** | Native first-class; tightest Scene/Inspector/Signal ergonomics | Strong, with minor marshaling overhead across Godot API boundaries | Full native engine/server access |
| **CPU-heavy compute** | Good for gameplay logic; ~5–15x slower than C#/C++ on tight numeric inner loops | High performance; watch GC pause spikes | Maximum performance, zero GC, SIMD/multithreading |
| **Web / Mobile export** | Full support across Desktop, Mobile, Web | Web export constraints vary by .NET/WASM maturity; larger binary | Requires cross-compiling native libraries per platform/arch |
| **Recommended Role** | **Default for 95%+ of gameplay, UI, tooling, orchestration** | Teams with existing C# expertise or large simulation/procedural codebases | Isolated bottlenecks proven by profiling (voxel meshers, custom pathfinding, audio DSP, third-party native SDKs) |

**Engineering Principle**: Start in strictly typed GDScript. Introduce C# or GDExtension **only** when profiling demonstrates an algorithmic/compute bottleneck that cannot be solved better via Godot's built-in C++ Servers (`RenderingServer`, `PhysicsServer`, `MultiMesh`, `Image`, compute shaders).
