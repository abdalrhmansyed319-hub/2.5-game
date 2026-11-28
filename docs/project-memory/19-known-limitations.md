# 19 — Known Limitations

> **Status**: `ACTIVE (Environment & Verification Boundaries Logged Honestly)`

## Environment & Studio Baseline Limitations
1. **Sandbox Runtime Constraint**: No Godot Engine executable is installed in this sandbox container; therefore `L5` (Runtime Tested) and `L6` (Playtested & Verified) require execution on a host with the target Godot binary installed.
2. **Project Engine Version Unverified Yet**: Studio preparation used Godot `4.7.2-stable` XML Class Reference; actual project Godot version must be verified from `project.godot` at Stage 01.
3. **Project Assets Not Yet Supplied**: Stage 04 Asset Audit (`05-asset-catalog.md`) remains pending user asset delivery.
