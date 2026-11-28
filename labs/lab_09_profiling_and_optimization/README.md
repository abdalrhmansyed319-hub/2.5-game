# Lab 09 — Profiling, Object Pooling, and Rendering Batching Harness

## 1. Objective
Build reusable performance-engineering infrastructure: (1) a leak-safe generic `NodeObjectPool` eliminating high-frequency instantiation/free spikes, and (2) a deterministic, seeded `PerformanceBenchmarkHarness2D` comparing naive `N` `Sprite2D` nodes against a single `MultiMeshInstance2D` draw call while exposing `p99` frame time and official `Performance` telemetry monitors.

## 2. Technical Approach
- **`NodeObjectPool`**: Pre-warms pooled scenes, disables inactive nodes via `PROCESS_MODE_DISABLED` + `visible = false`, resets physics interpolation (`reset_physics_interpolation()`) on acquire so reused projectiles never visually streak from their old release coordinates, invokes optional `on_pool_acquire()` / `on_pool_release()` hooks, and cleans up detached nodes on `_exit_tree()` to guarantee zero orphan leaks.
- **`PerformanceBenchmarkHarness2D`**: Uses a fixed `RandomNumberGenerator` seed (`424242`) and flat `PackedVector2Array` SoA (Structure-of-Arrays) buffers (`_positions`, `_velocities`) to run apples-to-apples comparisons between `INDIVIDUAL_SPRITES` and `MULTIMESH_BATCHED`, registering live custom monitors via `Performance.add_custom_monitor()` and removing them cleanly in `_exit_tree()`.

## 3. Architecture
- `node_object_pool.gd`: Reusable pool component (`prewarm`, `acquire`, `release`, utilization counters).
- `performance_benchmark_harness_2d.gd`: Deterministic benchmark rig + `capture_telemetry_snapshot()` returning FPS, `TIME_PROCESS`, `TIME_PHYSICS_PROCESS`, `p99` frame ms, `RENDER_TOTAL_DRAW_CALLS_IN_FRAME`, `OBJECT_NODE_COUNT`, and `OBJECT_ORPHAN_NODE_COUNT`.

## 4. Implementation
- `node_object_pool.gd`
- `performance_benchmark_harness_2d.gd`

## 5. Testing Process
- **Code Written**: Complete (2 `.gd` scripts).
- **Static Verification (`tools/verify_labs.py`)**: Verified via `gdparse`, `gdlint`, and Godot `4.7.2-stable` XML Class-Ref API checks (`Performance.Monitor` constants, `Performance.add_custom_monitor`, `MultiMesh`, `MultiMeshInstance2D`, `Node.reset_physics_interpolation`).
- **Runtime Execution in Godot**: *Not yet executed* (pending Godot 4.7+ binary — **no synthetic FPS/ms benchmark numbers are fabricated!** Actual measured `p99` frame times and draw call counts must be collected on real target hardware once Godot runtime is available).

## 6. Problems Encountered
- Registering custom monitors with `Performance.add_custom_monitor()` without checking `has_custom_monitor()` and calling `remove_custom_monitor()` in `_exit_tree()` leaves dangling monitor callables if the scene is reloaded! Handled with symmetrical register/unregister lifecycle hooks.
- Releasing a pooled node twice would duplicate it inside `_available`, causing two callers to acquire the exact same `Node` instance simultaneously. Prevented by tracking live ownership in `_active: Dictionary[int, Node]` and rejecting non-active releases.

## 7. Final Result
A disciplined, measurement-first optimization kit enforcing pool safety invariants and honest telemetry collection.

## 8. Possible Improvements
- Use `RenderingServer.multimesh_set_buffer()` with a packed `PackedFloat32Array` buffer update in Godot 4 to push all 2,000+ transforms to the GPU in a single C++ bulk call instead of 2,000 GDScript `set_instance_transform_2d()` calls!
- Add an automated A/B sweep script that runs 300 warmup + 300 measured frames per mode and dumps CSV/JSON reports.
