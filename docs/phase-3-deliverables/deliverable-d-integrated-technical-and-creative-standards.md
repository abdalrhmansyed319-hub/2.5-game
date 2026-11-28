# Phase 3 Deliverable D — Integrated Technical and Creative Standards

> **Purpose**: Single unified standard fusing Phase 1 Engineering Discipline, Phase 2 Creative Governance, and Phase 3 Studio Decision-Making, Code Delivery, and Completion Rules.

---

## 1. The Unified 10-Criteria Studio Decision Framework (Section 16 Gate)
Evaluate every major technical OR creative decision against all 10 criteria before committing:
1. **Quality**: Does this elevate the final craft rather than settling for "good enough"?
2. **Player Experience**: Does it measurably improve responsiveness, clarity, immersion, or fun?
3. **Creative Identity**: Does it strengthen the approved Creative Direction Document (`03-creative-direction.md`)?
4. **Technical Feasibility**: Is it cleanly supported by the project's **actual verified Godot version** and node model?
5. **Performance**: Does it stay comfortably within target `p99` frame-time, draw-call, and memory budgets?
6. **Maintainability**: Can a teammate understand, debug, and safely modify this 3 months later?
7. **Asset Compatibility**: Does it respect real user-provided asset scales, style, lighting, and tile connectivity?
8. **Production Cost**: Does player value justify the authoring, testing, and maintenance effort?
9. **Future Scalability**: Does it unlock clean systemic reuse without painting later milestones into a corner?
10. **Risk**: What breaks if this assumption is wrong, and how cheap is it to pivot or roll back?

> *Tradeoff Rule*: Never chase the most complex, fastest-hacked, or flashiest option automatically — choose the option delivering the strongest balanced outcome within the project's real constraints.

---

## 2. Unified Technical Implementation & Code Delivery Standards
*(Extends [`Phase 1 Deliverable E`](../deliverables/deliverable-e-technical-development-standards.md) with Phase 3 Section 7 Code Delivery Protocol)*

### Mandatory Project Engine Check
- At the start of every real project, inspect `project.godot` and verify the **actual installed Godot version & renderer** — never assume `4.7.2-stable` if the user's project runs `4.3`, `4.4`, `4.5`, or `4.6`!

### 9-Step Safe Modification Protocol (Modifying Any Existing Project)
1. **Inspect** all relevant scenes, scripts, resources, and autoloads first.
2. **Map dependencies** (signals, groups, `@export` paths, `TileSet` IDs, input actions).
3. **Identify affected systems** and regression blast radius.
4. **Plan** minimal, clean surgical edits.
5. **Modify only what is necessary** — never overwrite entire files unnecessarily or silently strip working features!
6. **Preserve existing behavior** unless intentionally deprecated and logged.
7. **Validate** (`gdparse`, `gdlint`, Godot API check, `.tscn` integrity, and live runtime test when available).
8. **Report changed files** with exact paths and integration steps.
9. **Report unresolved issues & limitations honestly** — never pass off incomplete stub code as finished!

### Core Godot Code Invariants
- Strict static typing (`var speed: float = 200.0`, typed arrays/returns), clean `class_name` contracts.
- Signal-up / Call-down scene decoupling (`get_parent().get_parent()` forbidden; use `@export` references or signals).
- Separate immutable `Resource` definitions from mutable runtime instance state (preventing shared-resource corruption!).
- Deferred collision/physics mutations (`set_deferred`), decoupled `visual_pivot` scaling (never non-uniformly scale `CollisionShape2D/3D`), and `MOUSE_FILTER_IGNORE` on passive HUD overlays.

---

## 3. Creative Direction & Visual/Audio/UX Governance
*(Integrates [`Phase 2 Deliverable I`](../phase-2-deliverables/deliverable-i-creative-quality-standards.md) with Section 8)*
- Maintain one living **Creative Direction Document (`03-creative-direction.md`)** governing: Visual Identity, Color Language, Shape Language, Environmental Style, Character Style, Animation Direction, Lighting Direction, Audio Identity, Narrative Tone, Gameplay Philosophy, and Player Experience Goals.
- Enforce **5-Band Value Readability** (grayscale squint test passes; `>= 4.5:1` focal separation or crisp high-contrast rim on bright ground; colorblind shape/value redundancy).
- Enforce **Zero Mixels & Asset Honesty** (1:1 texel density, no stretching, no invented user assets, original source files preserved untouched).
- Enforce **Clarity Over Decoration (*Into the Breach* Rule)**, **5-Tier Audio Mix Priority**, **Concise Voice-Distinct Writing (`12–28 words/beat`)**, and **M+K / Gamepad / AccessKit Parity**.

---

## 4. The Professional Completion Standard (Section 17)
A feature, room, character, system, or game is **NOT** complete merely because code compiles or a sprite appears on screen. Every milestone completion report MUST explicitly distinguish:
1. **Planned** (original scope & acceptance criteria)
2. **Implemented** (exact files, scenes, systems created/modified)
3. **Tested** (exact verification tools/procedures run & L1–L6 level achieved)
4. **Passed** (verified green results)
5. **Failed** (defects detected during testing)
6. **Remaining Incomplete** (unfinished items or deferred polish)
7. **Requires Human Evaluation** (live game feel, blind playtesting, aesthetic judgment)
8. **Recommended Next Improvements** (highest-value next steps)
