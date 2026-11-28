# Phase 3 Deliverable G — Quality Assurance Framework

> **Purpose**: Rigorous dual-track Technical + Creative QA system anchored by the strict **L1–L6 Evidence Verification Ladder**, structured Playtesting Protocol, and Evidence-Only Performance Engineering rules.

---

## 1. The Mandatory L1–L6 Verification Ladder (Section 10)
**NEVER claim a higher verification level than actual concrete evidence supports!** Every feature, system, level, and milestone in `15-testing-and-qa-reports.md` and `20-production-status.md` carries an explicit verification tag:

| Level | Label | Required Proof Before Claiming |
| --- | --- | --- |
| **L1** | **Studied** | Concept researched against authoritative Godot docs, primary developer postmortems, or verified references. |
| **L2** | **Understood** | Principles, tradeoffs, failure modes, and project-specific limitations clearly documented. |
| **L3** | **Implemented** | Complete working code, scene, asset setup, or level artifact persisted in workspace files. |
| **L4** | **Static / API Validated** | Passed AST parsing (`gdparse`), linting (`gdlint`), official Godot version XML Class-Ref API audit, `.tscn` structural validation, and/or visual PNG/forensic inspection (`asset_inspector.py` + `read_file`). |
| **L5** | **Runtime Tested** | Executed live inside the actual target Godot Engine binary with verified logs, zero runtime errors, verified physics/UI/save behavior, and measured frame timings. |
| **L6** | **Playtested & Verified** | Evaluated inside the actual playable game across real gameplay scenarios (ideally including blind human playtesting) with recorded observations and regression confirmation. |

---

## 2. Dual-Track QA Inspection Pipeline

### Track A — Technical Quality Assurance
1. **Syntax & Static Analysis**: `gdparse` + `gdlint` (`0` errors on production code).
2. **Engine API Compatibility**: Verified strictly against the project's **actual installed Godot version**.
3. **Scene & Resource Integrity**: Valid `.tscn` `load_steps`, `res://` links, `NodePath` bindings, zero shared mutable `Resource` leaks.
4. **Runtime & Integration Testing**: Launch scene transitions, save/load round-trips (including corrupt-file recovery), input device hot-swapping (M+K <-> Gamepad), pause/resume state safety.
5. **Regression Testing**: Re-verify prior milestones after core refactors or shared-component edits.
6. **Performance & Error Monitoring**: Zero console errors/orphan leaks (`ObjectDB` diffing in Godot 4.6+), measured frame time (`p50`/`p99`), CPU/GPU/physics/memory/draw-call profiling (`17-performance-reports.md`). *Never invent benchmark numbers!*

### Track B — Creative & Player Experience QA
1. **Visual & Asset Inspection (`read_file` / Live Viewport)**: Seam/miter check, zero pixel distortion/mixels, 5-Band Grayscale Squint Test (`>= 4.5:1` focal clarity or high-contrast rim), colorblind legibility.
2. **Movement & Game Feel Evaluation**: Responsiveness, precision, predictability, forgiveness windows, anticipation/impact/follow-through.
3. **Level Flow Evaluation**: Blind navigation without HUD arrows, sightlines, difficulty spikes, checkpoint fairness, softlock attempts (jumping into corners, backtracking early).
4. **Animation, Audio & UI/UX Audit**: Silhouette readability, mix tier balance (no sonic mud or repetition fatigue), glanceable HUD, controller focus loops, subtitles & reduced-motion compliance.

---

## 3. Structured Playtesting & Root-Cause Investigation Protocol (Section 9)
- **Separate Predictions from Observations**: Log *"Studio Predicted"* vs. *"Observed Player Behavior"* separately — **never fabricate playtest results!**
- **Observe Silently First**: During human playtesting, resist explaining controls or hinting where to go; every hesitation, repeated death, or ignored doorway is golden diagnostic data.
- **Fix Root Causes, Never Band-Aids**:
  - *Symptom*: Players keep missing a platform ledge.
  - *Superficial Band-Aid*: Pop up text saying "Jump right at the edge!"
  - *Root-Cause Fix*: Audit gap vs. jump metrics, check coyote time/jump buffering, verify camera look-ahead & floor edge silhouette contrast, then adjust geometry or tuning cleanly!

---

## 4. Defect Severity & Tracking Standard (`16-bug-tracking.md`)
- **S1 — Blocker / Crash / Softlock / Save Corruption**: Fix immediately before any new feature work.
- **S2 — Major Gameplay / Visual / UX Break**: Fix within current milestone; blocks milestone approval.
- **S3 — Minor Polish / Edge Defect**: Schedule cleanly in backlog or Stage 09 Refinement.
- **S4 — Cosmetic / Nice-to-Have**: Track transparently; never delay core stability over S4 items.
