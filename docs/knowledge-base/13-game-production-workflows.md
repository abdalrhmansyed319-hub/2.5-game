# 13 — Game Production Workflows

> **Scope**: End-to-end professional game production pipeline, milestone discipline, scope & risk control, technical design alignment with gameplay design, repository/CI hygiene, and post-release maintenance.

---

## 1. Professional Game Production Lifecycle

| Phase | Core Objective | Technical Engineering Focus | Exit Gate (Definition of Done) |
| --- | --- | --- | --- |
| **1. Pre-Production** | Validate vision, target platforms, art/tech feasibility, core pillars, and realistic scope | Choose Godot version & renderer (`Forward+`/`Mobile`/`Compatibility`), define naming/folder/layer standards, spike high-risk technical unknowns, create Technical Design Document (TDD) | Locked target engine version, proven technical spikes, approved core loop spec & milestone plan |
| **2. Prototyping (Greybox)** | Prove the **core gameplay loop is fun** as cheaply as possible | Fast throwaway or cleanly isolated greybox mechanics using primitive shapes/placeholder SFX — **do not polish art or build save/menu infrastructure yet** | Playable core loop validated by real playtesters; kill/pivot weak mechanics early |
| **3. Vertical Slice** | Prove full production quality across **every system** in one representative segment (5–15 min) | Finalize production architecture (movement, AI, combat/interaction, UI, audio, save/load, level pipeline, shaders), establish performance budgets and asset import presets | One end-to-end slice at shippable quality bar; accurate cost/time estimates for full content |
| **4. Production (Feature & Content Dev)** | Build all features and content predictably on top of stable vertical-slice pipelines | Empower content creation via data-driven Resources/TileSets/editor tools; protect system stability with automated tests and strict PR reviews | **Alpha Milestone**: Feature-complete (all mechanics playable start-to-finish, even if some content/art is WIP) |
| **5. Alpha -> Beta (Content Lock)** | Complete all levels, assets, UI flows, localization, accessibility, and integration | Fix integration bugs, verify save-schema migrations, implement telemetry/crash logging (`Logger`), lock feature creep | **Beta Milestone**: Content-complete & feature-locked; playable start-to-finish with all assets integrated |
| **6. Optimization, QA & Polish** | Hit target frame budgets, eliminate crashes/softlocks, elevate game feel | Profile CPU/GPU/VRAM on min-spec hardware, fix ObjectDB leaks, soak test, polish VFX/audio/UI feedback, platform certification checks | Zero S0/S1 blockers, performance within budget on min-spec, release candidate signed off |
| **7. Release & Post-Release** | Smooth launch, rapid hotfixes, sustainable maintenance | Automated export presets (PCK/patch PCKs with delta encoding in 4.6+), symbol/backtrace retention, strict save backward-compatibility migrations | Stable live build, structured bug triage, patch pipeline tested |

---

## 2. Technical Alignment with Game Design

An elite game engineer never builds mechanics blindly from a ticket — engineering choices directly shape player experience:

- **Core Gameplay Loop First**: Identify the 5-second micro-loop (e.g., move -> observe -> act -> feedback) and ensure input latency, responsiveness, and feedback clarity are rock-solid before layering meta-systems.
- **Game Feel ("Juice") Is Engineering + Design Together**:
  - Input responsiveness (buffering, coyote windows, cancel frames, deadzone curves).
  - Anticipation -> Action -> Follow-through (telegraphs, brief hit-stop, subtle camera impulse, synchronized audio pitch variation, visual hit-flash).
  - Keep "juice" configurable (tunable `Resource` parameters + reduced-motion accessibility toggle) so feel can be iterated in seconds.
- **Balancing & Iteration Speed**:
  - Expose gameplay tuning levers as clean `Resource` profiles or tables rather than burying constants inside 10 scripts — every minute saved in iteration compounds across hundreds of playtest loops.
- **Technical Debt Management**:
  - Distinguish **deliberate prototype shortcuts** (tagged clearly with `TODO(vertical-slice):` and scheduled for cleanup) from **accidental structural rot** (tight coupling, untyped dicts, duplicated state). Never carry greybox spaghetti directly into full production without a planned stabilization pass.

---

## 3. Repository, Asset Pipeline, and CI Hygiene for Godot 4.x

### Folder Architecture (Feature-First vs. Type-First)
For medium-to-large Godot projects, **domain/feature-first organization** outperforms dumping 500 files into `scripts/` and `scenes/`:
```text
src/ (or game/)
├── core/          # Generic engine utilities, state machine base, save/audio services, event contracts
├── entities/      # Self-contained entity modules (each with .tscn, .gd, sub-resources)
├── systems/       # Cross-cutting gameplay systems (inventory, quests, dialogue, combat components)
├── world/         # TileSets, environments, reusable props, level scenes
├── ui/            # Themes, HUD widgets, menus, screen stack
└── audio/         # Bus layout, audio stream resources
```
*Why*: Keeping an entity's `.tscn`, `.gd`, and local `.tres` together makes refactoring, deletion, and code review drastically cleaner and reduces cross-folder hunting.

### Version Control & Collaboration Discipline
- **Commit `.uid` and `.import` files** alongside source assets (critical in Godot 4.4+); **ignore `.godot/`** in `.gitignore`.
- **Avoid `.tscn` Merge Conflicts**: Decompose large levels and UI screens into smaller instanced sub-scenes so two contributors rarely edit the exact same `.tscn` simultaneously!
- **Godot 4.6 Large Text Scene Warning**: Respect the editor warning when text scenes grow huge (e.g., embedded mesh arrays or giant tile data) — extract heavy sub-resources into external `.tres`/`.res` files.
- **Automated CI Checks on Every PR**:
  1. Static syntax & lint gate (`gdparse`, `gdlint`, `gdformat --check`).
  2. Headless Godot script validation (`godot --headless --quit --check-only` if CI image provides Godot).
  3. Automated unit/integration test suite (GUT / GdUnit4).
  4. Automated export smoke build verifying all target presets compile cleanly.
