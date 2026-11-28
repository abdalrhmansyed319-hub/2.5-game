# 11 — Performance and Optimization

> **Verification Baseline**: Godot Engine `4.7.2-stable` (`Performance.xml`, `RenderingServer.xml`, official Optimization & Profiling documentation, Godot 4.5–4.7 debugger/profiler features).  
> **Scope**: Frame budget engineering, CPU/GPU profiling, Godot 4.6 ObjectDB diffing, memory & resource loading, draw call & batching optimization, physics costs, GDScript micro- vs. macro-optimization, and stutter prevention.

---

## 1. Golden Rules of Performance Engineering

1. **Measure Before Optimizing**: Never optimize based on intuition. Always identify whether the frame is **CPU-bound (main thread / gameplay / physics)**, **GPU-bound (vertex / fragment fillrate / lighting / shadows)**, **Bandwidth/Memory-bound**, or **I/O / Shader-Stutter-bound**.
2. **Respect Frame Time (ms), Not FPS**:
   - FPS is non-linear: dropping from 60 FPS -> 30 FPS adds **16.67 ms**, whereas dropping from 120 FPS -> 60 FPS adds **8.33 ms**.
   - Target budgets: **16.67 ms** for 60 FPS (aim for **< 11 ms** headroom in development); **8.33 ms** for 120 FPS.
   - Track **99th-percentile frame time (`p99` / worst spike)**, not just average FPS — a single 60 ms stutter ruins player feel even at 120 FPS average!
3. **Algorithm & Architecture First, Micro-Optimization Last**: Replacing an O(N²) distance check with an `Area2D`/spatial grid or replacing 1,000 `Sprite2D` nodes with 1 `MultiMeshInstance2D` yields 10x–100x gains without harming readability.

---

## 2. Profiling & Telemetry Toolkit in Godot 4.6–4.7

### Built-In Profiling Tools
1. **Debugger -> Profiler (CPU)**: Shows inclusive vs. self time per GDScript function, `_process`, `_physics_process`, and engine frames. Sort by *Self Time* to locate hot functions.
2. **Debugger -> Visual Profiler (CPU + GPU)**: Breaks down GPU pass timings (Shadow Pass, Opaque Pass, Transparent Pass, Glow/Post-Process, 2D Canvas). Essential for distinguishing fillrate vs. geometry vs. lighting bottlenecks!
3. **Debugger -> Monitors + Custom Monitors**:
   - Track `TIME_PROCESS`, `TIME_PHYSICS_PROCESS`, `TIME_NAVIGATION_PROCESS`, `OBJECT_COUNT`, `OBJECT_NODE_COUNT`, `OBJECT_ORPHAN_NODE_COUNT`, `RENDER_TOTAL_DRAW_CALLS_IN_FRAME`, `RENDER_TOTAL_PRIMITIVES_IN_FRAME`, `RENDER_VIDEO_MEM_USED`, `PHYSICS_2D/3D_ACTIVE_OBJECTS`, `PHYSICS_2D/3D_COLLISION_PAIRS`.
   - Register domain metrics with `Performance.add_custom_monitor(id, callable, args, type)` *(optional `type` added in Godot 4.6)* — e.g., active pool utilization, AI agents ticking, active projectiles.
4. **Debugger -> ObjectDB Snapshots & Diffing *(Godot 4.6+)***:
   - Capture live ObjectDB snapshot at Checkpoint A -> perform gameplay cycle -> capture Snapshot B -> diff to see **exact leaked Nodes/Resources/Objects** by class and path!
5. **External Profilers**:
   - **RenderDoc** (Vulkan / OpenGL / D3D12): Inspect individual draw calls, state changes, broken batches, overdraw, and shader instructions.
   - **Tracy / Perfetto**: Deep C++/engine-thread tracing supported natively in Godot 4.7 profiling builds.

---

## 3. CPU Optimization (GDScript, SceneTree, Physics, Navigation)

### SceneTree & Script Bottlenecks
- **Node Count Matters**: Every active `Node` with `_process` or `_physics_process` incurs C++->GDScript virtual dispatch overhead every frame/tick.
  - Call `set_process(false)` / `set_physics_process(false)` on idle/inactive nodes (or `PROCESS_MODE_DISABLED` in pools).
  - Never implement empty `_process(delta): pass` methods — even an empty override forces Godot to invoke GDScript every frame!
- **Static Typing + Caching**:
  - Type all hot-loop variables (`var i: int`, `var dist_sq: float`).
  - Use `distance_squared_to()` instead of `distance_to()` when comparing ranges (avoids `sqrt()`).
  - Cache node references (`@onready` or `@export`) — never call `get_node()` or `get_tree().get_nodes_in_group()` inside inner loops.
  - Pre-allocate dynamic buffers using **`Array.reserve()` / `String` / `Vector` `.reserve()` *(Godot 4.6+)*** when constructing large arrays.
  - Avoid per-frame heap churn (`String` concatenation, temporary `Dictionary`/`Array` allocations, creating `PhysicsRayQueryParameters` inside tight loops).

### Physics Costs
- **Simplify Collision Shapes**: Prefer circles/spheres, capsules, and boxes over dense polygon/trimesh colliders.
- **Audit Collision Layers/Masks**: Keep sensor `Area`s one-directional (`monitoring = false` on targets, `monitorable = false` on scanners).
- **TileMapLayer Physics Chunking (4.5+)**: Keep `physics_quadrant_size` at `16` (default) on static terrain so Godot merges tile shapes into chunked bodies.
- **AI / Raycast Throttling**: Stagger expensive AI path queries and LOS raycasts across frames (`if (Engine.get_physics_frames() + _ai_slot) % 6 == 0:`) so 40 enemies never all spike on the exact same tick!

---

## 4. GPU & Rendering Optimization

| Bottleneck Symptom | Diagnostic Verification | Primary Fixes |
| --- | --- | --- |
| **High Draw Calls (CPU->GPU submission bound)** | High `RENDER_TOTAL_DRAW_CALLS_IN_FRAME`, low GPU time, high CPU render thread | Batch 2D sprites (shared atlases + `instance uniform` shaders), use `MultiMeshInstance2D/3D`, merge static meshes, minimize unique materials & z-index interleaving. |
| **Fragment / Fillrate Bound** | Halving viewport resolution nearly doubles frame rate | Reduce transparent overdraw (trim sprites, limit fullscreen translucent layers/particles), disable expensive post-processing (SSAO/SSIL/Volumetric Fog/SSR) on low presets, simplify heavy fragment shaders. |
| **Shadow Pass Heavy (3D)** | Shadow pass dominates Visual Profiler | Disable shadows on non-key lights, tighten `DirectionalLight3D` `max_distance` and cascades, set static props to `SHADOW_CASTING_SETTING_OFF` where negligible, use baked `LightmapGI`. |
| **Vertex / Geometry Bound** | High `RENDER_TOTAL_PRIMITIVES_IN_FRAME` | Enable automatic Mesh LOD on import, configure `visibility_range_begin/end`, add `OccluderInstance3D` culling, keep skinned meshes lean. |
| **VRAM Exhaustion / Texture Thrash** | High `RENDER_TEXTURE_MEM_USED` | Enable VRAM compression (BPTC/S3TC/ETC2/ASTC), downscale oversized textures (2K/4K -> 512/1024 where texel density warrants), enable mipmaps, unload unused level resources. |

---

## 5. Memory Management, Loading, and Stutter Prevention

### Preventing Runtime Frame Hitches (The 4 Main Causes of Stutter)
1. **Synchronous Asset Loading (`load()`)**:
   - *Fix*: Preload small frequent assets; stream levels/large scenes asynchronously with `ResourceLoader.load_threaded_request()`.
2. **First-Time Shader / Pipeline Compilation**:
   - *Fix*: Leverage Godot 4.4+ **Ubershaders** and Godot 4.5+ **Shader Baker** at export; warm up critical particle systems (`GPUParticles2D/3D` emitting 1 transparent/offscreen frame during loading screen) so particle shaders compile before combat starts!
3. **Instantiation / `queue_free()` Spikes**:
   - *Fix*: Use **`ObjectPool`** for rapid-fire entities (bullets, hit VFX, damage popups, footsteps); spread initial level enemy spawns across multiple frames during load if instantiating dozens of heavy scenes.
4. **GDScript Memory & C# GC Notes**:
   - GDScript uses deterministic reference counting (`RefCounted`) + manual `Node` freeing — **no stop-the-world GC pauses**, making frame-time pacing highly predictable! However, freeing a giant 5,000-node subtree in one frame still stalls the main thread — amortize teardown or pool where needed.
   - If C# is ever introduced, avoid per-frame managed allocations (LINQ, boxing, string interpolation in `_Process`) to prevent Gen2 GC spikes.

---

## 6. Optimization Workflow Protocol

1. Define quantitative target budgets per target hardware tier (e.g., 60 FPS / 16.6 ms, max draw calls, max VRAM, max orphan nodes = `0`).
2. Build a **repeatable benchmark / stress scene** (fixed camera, fixed RNG seed, deterministic entity count) so before/after metrics are apples-to-apples!
3. Capture baseline metrics (`p50`, `p95`, `p99` frame time, draw calls, active physics pairs, memory).
4. Optimize the #1 bottleneck only.
5. Re-measure and verify both the performance gain **and** zero visual/functional regressions.
