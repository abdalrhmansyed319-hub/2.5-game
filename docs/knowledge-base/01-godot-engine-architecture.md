# 01 — Godot Engine Architecture

> **Verification Baseline**: Godot Engine `4.7.2-stable` (Official Class Reference XML commit `ed1daf0bf`, `docs.godotengine.org` stable/4.7).  
> **Scope**: Core engine architecture, Server/Scene split, SceneTree lifecycle, Resources, Signals, Groups, Autoloads, memory ownership, import pipeline, and project configuration.

---

## 1. Layered Engine Architecture (Servers vs. SceneTree)

Godot is architected in **two major abstraction layers** above the OS/platform drivers:

1. **Low-Level Servers (`RenderingServer`, `PhysicsServer2D`, `PhysicsServer3D`, `AudioServer`, `NavigationServer2D/3D`, `DisplayServer`, `TextServer`, `AccessibilityServer`)**
   - Servers own the actual simulation and rendering state in packed, cache-friendly C++ structures and expose opaque handles called **`RID`** (Resource IDs).
   - Servers can run on separate threads (e.g., render thread, physics step, audio mixing thread) without requiring `Node` overhead.
   - **When to bypass Nodes and use Servers directly**: massive homogeneous workloads (thousands of projectiles, foliage instances, particle-like hazards, custom spatial queries) where per-node `SceneTree` traversal and GDScript `_process` calls become CPU-bound.
2. **High-Level Scene System (`SceneTree` + `Node` + `Resource`)**
   - `Node`s are thin, ergonomic lifecycle wrappers that create, update, and destroy server `RID`s automatically (e.g., `MeshInstance3D` manages a visual instance `RID` in `RenderingServer`; `CollisionObject2D` manages body/area `RID`s in `PhysicsServer2D`).
   - `PackedScene` serializes a node subtree (overrides, connections, sub-resources, editable children) into a reusable blueprint (`.tscn` text or `.scn` binary).

### Why This Split Matters Architecturally
- **Nodes** excel at composition, tooling, Inspector configuration, editor visualization, and readable ownership trees.
- **Resources** excel at shared, serializable data (meshes, textures, materials, item definitions, movement configs, stats tables).
- **Servers** are the escape hatch when profiling proves `Node` overhead (not gameplay logic) is the bottleneck.

---

## 2. SceneTree, Node Hierarchy, and Exact Lifecycle Order

### Structural Ownership Rules
- Every active `Node` lives in a single `SceneTree` rooted at `get_tree().root` (a `Window` viewport).
- Child lifetime is coupled to parent lifetime: calling `queue_free()` on a parent schedules the parent and its entire subtree for deletion at the end of the current frame.
- **Rule of Thumb (Official Scene Organization Principle)**: Use parent-child nesting when the child is logically *owned by* the parent (deleting the parent should delete the child). Independent entities (e.g., spawned projectiles, detached VFX) belong as siblings under a dedicated world container, not inside the emitter.

### Exact Node Lifecycle & Notification Order
Verified against `Object.xml` and `Node.xml` (Godot `4.7.2-stable`):

| Phase | Callback / Notification | Order | Notes |
| --- | --- | --- | --- |
| 1. Allocation | `_init()` -> `NOTIFICATION_POSTINITIALIZE (0)` | Top-down (at instantiation) | Node is **not** in SceneTree yet; `@onready` vars are **not** initialized; `@export` values from `.tscn` are applied **after** `_init()`. |
| 2. Tree Entry | `_enter_tree()` / `NOTIFICATION_ENTER_TREE (10)` | **Top-down** (parent before children) | Node has a valid `get_tree()` and path, but sibling/child `_ready()` has not run yet. |
| 3. Post Entry | `NOTIFICATION_POST_ENTER_TREE (27)` | Top-down | Internal post-entry hook after entering tree. |
| 4. Ready | `@onready` evaluation -> `_ready()` / `NOTIFICATION_READY (13)` | **Bottom-up** (children before parent) | Guaranteed that all descendants are already ready. Called **once** unless `request_ready()` is explicitly invoked before re-adding to tree. |
| 5. Per-Frame | `_process(delta)` / `NOTIFICATION_PROCESS (17)` | Tree order (modified by `process_priority`) | Variable timestep tied to render frame rate. |
| 6. Per-Physics-Tick | `_physics_process(delta)` / `NOTIFICATION_PHYSICS_PROCESS (16)` | Tree order (modified by `process_physics_priority`) | Fixed timestep (`physics/common/physics_ticks_per_second`, default 60 Hz). |
| 7. Tree Exit | `_exit_tree()` / `NOTIFICATION_EXIT_TREE (11)` | **Bottom-up** (children before parent) | Release external subscriptions/timers/handles here if node may be reparented or removed. |
| 8. Destruction | `NOTIFICATION_PREDELETE (1)` | Destructor order | Invoked immediately before memory is freed (via `free()` or deferred `queue_free()`). Cannot be cancelled. |

### Processing Modes & Thread Groups
- **`Node.process_mode`** (verified `Node.xml`):
  - `PROCESS_MODE_INHERIT (0)`: Inherits parent's effective mode.
  - `PROCESS_MODE_PAUSABLE (1)`: Runs only when `get_tree().paused == false`.
  - `PROCESS_MODE_WHEN_PAUSED (2)`: Runs only when `get_tree().paused == true` (ideal for pause menus).
  - `PROCESS_MODE_ALWAYS (3)`: Always runs regardless of pause state (ideal for audio managers, transition overlays, pause input listeners).
  - `PROCESS_MODE_DISABLED (4)`: Never processes (useful for object-pooled inactive nodes).
- **`Node.process_priority` & `process_physics_priority`**: Lower values run earlier; negative values run before default `0`. Prefer explicit dependency/signal ordering over fragile magic priority numbers.
- **`Node.process_thread_group`**: Allows running an isolated subtree on a worker thread (`PROCESS_THREAD_GROUP_SUB_THREAD`), with `call_deferred()` / `process_thread_messages` marshaling back to the main thread. Only use when profiling proves CPU main-thread saturation on independent subtrees.

### Scene Switching Mechanisms
- `SceneTree.change_scene_to_file(path)` / `change_scene_to_packed(packed_scene)`: Deferred replacement of `current_scene`; autoloads persist.
- `SceneTree.change_scene_to_node(node)` *(introduced in Godot 4.6)*: Switches directly to an already-instantiated `Node` (useful when pre-instantiating and initializing a scene before handoff).
- **Recommended Production Pattern**: Keep a persistent root `GameHost` / `SceneManager` scene that swaps level subtrees manually under a `WorldContainer` node. This preserves deterministic transition hooks (fade out -> `ResourceLoader.load_threaded_request()` -> progress -> swap -> fade in) without destroying persistent camera/HUD/debug rigs.

---

## 3. Resources, UIDs, and Resource Management

### Reference Semantics (Critical Source of Bugs)
- `Resource` inherits `RefCounted` (automatic reference counting; freed when refcount reaches 0).
- **Resources are cached and shared by path** inside `ResourceLoader`. Loading `res://data/default_stats.tres` in 50 enemy instances returns the **exact same in-memory `Resource` object**!
  - Mutating a shared `Resource` at runtime mutates it for **every** instance referencing it.
  - **Solutions**:
    1. Keep static definitions **immutable** (read-only `Resource` blueprints) and store mutable runtime state on a separate instance object or node.
    2. Enable **`resource_local_to_scene = true`** when a scene must own a unique copy per scene instantiation (e.g., per-enemy `ShaderMaterial` or `StyleBoxFlat`).
    3. Call `resource.duplicate()` (shallow) or `resource.duplicate(true)` (deep for sub-resources) explicitly when cloning mutable data.

### `preload()` vs. `load()` vs. `ResourceLoader.load_threaded_request()`
| Mechanism | Timing | Thread | Use Case |
| --- | --- | --- | --- |
| `preload("res://...")` | Parse/compile time (must be constant literal) | Main thread | Small, always-needed scenes/scripts/icons tightly bound to the script. Warning: creates hard dependency chains; avoid cyclic `preload()` between two `.tscn`/`.gd` files. |
| `load(path)` / `ResourceLoader.load(path)` | Runtime synchronous | Main thread | Dynamic paths or already-cached resources. Causes frame hitches on large textures/scenes/audio! |
| `ResourceLoader.load_threaded_request(path)` | Runtime asynchronous | Worker thread | Level transitions, streaming chunks, large assets. Poll with `load_threaded_get_status()` and retrieve with `load_threaded_get()`. |

### UIDs and File System Paths (Godot 4.4+)
- **`res://`**: Read-only in exported builds (packed into `.pck`). Never write save files or runtime caches to `res://`.
- **`user://`**: Writable per-user persistent directory (`OS.get_user_data_dir()`). Use for saves, user settings, and diagnostic logs.
- **UIDs (`uid://...`)**: Since Godot 4.4, Godot generates `.uid` sidecar files alongside scripts, shaders, and resources so moving or renaming files in the FileSystem dock preserves references across `.tscn` and `.tres` files without breaking paths. **Always commit `.uid` files to Git.**

---

## 4. Communication Patterns: Signals, Groups, Metadata, and Autoloads

### The Golden Rule of Godot Tree Coupling
> **"Call down, signal up."**
> - Parents may call methods directly on their owned children (or inject dependencies into children).
> - Children must **never** reach upward with `get_parent().get_parent().do_something()` or fragile `$"../../HUD"` paths. Instead, children emit **signals** that parents or coordinators connect to.
> - Use **Scene Unique Names** (`%NodeName`) only *within the same scene* for stable internal references that survive child reparenting.

### Signals
- First-class typed observer mechanism (`signal health_changed(current: float, maximum: float)`).
- Supports `CONNECT_ONE_SHOT`, `CONNECT_DEFERRED` (executes during idle frame, essential inside physics callbacks), and `CONNECT_REFERENCE_COUNTED`.
- **Lifetime Rule**:
  - When a `Node` connected to a signal is freed, Godot automatically cleans up connections targeting its methods.
  - **HOWEVER**, lambdas/closures bound to signals on longer-lived emitters (e.g., an Autoload EventBus) capture references and are **not** automatically tied to the subscriber node's lifetime unless explicitly disconnected in `_exit_tree()` or avoided in favor of named methods on the subscriber `Object`!

### Groups and Metadata
- **Groups** (`add_to_group(&"saveable")`, `get_tree().get_nodes_in_group(&"saveable")`, `call_group()`):
  - Ideal for cross-cutting capabilities (e.g., persistence participants, pausable entities, damageable targets, debug overlays) without tight class hierarchies.
  - Use `StringName` literals (`&"group_name"`) for fast hashed lookups.
- **Metadata** (`set_meta()`, `get_meta()`, `has_meta()`):
  - Untyped key-value bag on any `Object`. Use sparingly for editor/tool tags or quick duck-typed annotations; prefer typed custom `Resource`s or explicit component nodes for core gameplay contracts.

### Autoloads (Singletons) — When to Use vs. Avoid
Per official Godot best practices (*Autoloads versus regular nodes*):
- An Autoload is simply a `Node` (or `PackedScene`) automatically instanced as a direct child of `/root` before the main scene loads, persisting across `change_scene_*` calls.
- **Legitimate Autoload Uses**:
  1. Thin, stateless/scoped global coordinators that genuinely span all scenes (e.g., `SaveManager`, `SceneTransitioner`, `SettingsService`, `AudioBusController`).
  2. Scoped EventBus for truly global cross-system events (avoid dumping every local entity event into a global bus!).
- **Anti-Patterns**:
  - Putting gameplay state (player HP, enemy lists, level flags) inside a God-object `Global.gd` Autoload — creates hidden temporal coupling, breaks scene isolation (`F6` Run Current Scene), and makes unit testing painful.
  - Using Autoloads purely for static helper functions or constants — since Godot 4.1, `class_name` + `static func` + `static var` provide clean namespaced utilities without polluting `/root`.

---

## 5. Memory Management and Object Ownership

Godot has **two distinct memory ownership models**:

1. **`RefCounted` subclasses** (`Resource`, `FileAccess`, `DirAccess`, `HMACContext`, `Tween`? *Note: `Tween` inherits `RefCounted` AND is owned by `SceneTree` while running!*):
   - Automatically freed when the last strong reference disappears.
   - **Pitfall — Reference Cycles**: Two `RefCounted` objects pointing strongly to each other leak memory forever because Godot has no tracing garbage collector! Break cycles with `WeakRef` (`weakref(obj)`) or explicit `dispose()` cleanup.
2. **Manual `Object` / `Node` subclasses**:
   - **NOT** reference counted. Creating a `Node.new()` without adding it to the `SceneTree` or calling `free()` creates an **Orphan Node** leak (detectable via `Performance.OBJECT_ORPHAN_NODE_COUNT` and Godot 4.6's **ObjectDB Snapshots & Diffing**!).
   - Always use `queue_free()` during frame/physics processing rather than immediate `free()` to avoid invalidating active physics/signal iteration.
   - Always guard potentially freed `Node` references with `is_instance_valid(node)` before dereferencing (a freed `Node` reference is NOT equal to `null` in GDScript until invalidated — wait: in Godot 4, `is_instance_valid(obj)` is the authoritative check because `obj != null` can return `true` for a previously freed `Object`!).

---

## 6. Project Settings, Import Pipeline, and Version Hygiene

### Critical Project Settings to Configure Early (Godot 4.6–4.7 Baseline)
- **Renderer Selection**: `Forward+` (desktop Vulkan/D3D12/Metal), `Mobile` (mobile/low-end Vulkan/D3D12/Metal), `Compatibility` (OpenGL/Web). Note: Godot 4.6 made D3D12 default on Windows; Jolt Physics default for 3D.
- **Display & Stretch**: Godot 4.7 defaults new projects to `display/window/stretch/mode = "canvas_items"` and `aspect = "expand"` (verify consciously for pixel-art vs vector/3D needs).
- **Physics**: `physics/common/physics_ticks_per_second`, `physics/common/physics_interpolation` (enable early if decoupling physics tick from monitor refresh rate!).
- **GDScript Strictness**: Enable strict static typing warnings (`debug/gdscript/warnings/untyped_declaration`, `unsafe_property_access`, `unsafe_method_access`, `unsafe_call_argument`, `unsafe_cast`) and use Godot 4.6's `debug/gdscript/warnings/directory_rules` to exclude third-party `addons/` from strict project warnings!
- **Diagnostics**: Enable `debug/settings/gdscript/always_track_call_stacks` (Godot 4.5+) if shipping custom crash/bug loggers in release builds.

### Import Pipeline Essentials
- Source assets (`.png`, `.glb`, `.wav`, `.ogg`, `.ttf`) are never used raw at runtime; Godot compiles optimized runtime representations into `.godot/imported/` governed by `.import` sidecar files.
- **Git Rules**:
  - **Commit**: `.import` files, `.uid` files, `project.godot`, `.tscn`, `.tres`, `.gd`, `.gdshader`.
  - **Ignore**: `.godot/` directory (local cache, editor metadata, imported binaries).
- **Asset Import Discipline**: Configure import presets by asset category (e.g., 2D sprite vs 3D albedo/normal map VRAM compression, mipmaps, looping flags on audio, glTF mesh/skeleton/collision conventions) rather than tweaking assets inconsistently one by one.
