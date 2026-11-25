# Deliverable I — Creative Quality Standards

> **Foundation**: Synthesized from [`Creative KB-15`](../creative-knowledge-base/15-creative-design-standards-and-evaluation.md) and integrated directly with [`Phase 1 Deliverable E — Technical Development Standards`](../deliverables/deliverable-e-technical-development-standards.md).

---

## 1. Mandatory 10-Point Creative Decision Gate
No significant mechanic, level region, art pass, UI redesign, or narrative arc enters production without passing all 10 criteria:
1. **Player Experience**: Directly strengthens the core intended player emotion and micro-loop.
2. **Identity Fit**: Reinforces the project's unique premise rather than diluting it with borrowed genre tropes.
3. **Visual Coherence**: Respects the 5-Band Value Hierarchy, art bible, perspective, key light, and 1:1 texel density.
4. **Mechanical Meaning**: Generates real tactical/expressive decisions rather than rote busywork.
5. **Exploration & Engagement**: Enhances pacing, discovery, sightlines, or replayable mastery.
6. **Complexity Economy**: Earns its cognitive and maintenance cost (*Depth / Complexity* ratio).
7. **Asset Feasibility**: Fully supported by verified user-provided or explicitly approved assets — zero visual hacks.
8. **Technical Feasibility**: Cleanly implementable within Phase 1's Godot `4.7.2-stable` architecture & frame-time budgets.
9. **Extensibility**: Opens clean systemic combinations rather than creating dead-end one-off code.
10. **Comparative Superiority**: Proven stronger than at least two simpler alternatives considered.

---

## 2. Hard Creative Anti-Pattern Rejections
Reject immediately during design or code review:
- **Decoration Before Structure**: Polishing tile art/particles over broken greybox flow.
- **Unreadable Clutter**: Background details/bloom out-contrasting Band 4 actors or Band 5 hazards (failing grayscale squint test).
- **Asset Abuse**: Stretching tiles, mixing inconsistent pixel scales ("mixels"), ignoring lighting direction on flips, or fabricating unlisted user assets.
- **Silent Trap Design**: Killing players with unintroduced hazards, blind camera drops, or punitive empty walk-backs.
- **Exposition Walls**: Pausing gameplay for multi-paragraph lore dumps when 2 seconds of environment or a 20-word dialogue exchange works better.
- **Feature Bloat ("Feature Islands")**: Systems disconnected from the Core Loop.
- **False Verification Claims**: Labeling untested design hypotheses or statically checked GDScripts as "playtested" or "fun."

---

## 3. Project Owner Collaboration & Constructive Critique Standard
- The **user owns the creative vision and makes all final creative decisions**.
- When spotting a creative flaw (weak pacing, style clash, scope bloat, unclear mechanic), deliver structured constructive feedback:
  1. **Exact Weakness** (specific, objective)
  2. **Concrete Impact** (player confusion, scope risk, visual clutter)
  3. **2–3 Grounded Alternatives**
  4. **Objective Tradeoff Comparison**
  5. **Clear Recommendation** — then execute the user's chosen direction wholeheartedly!

---

## 4. Milestone Quality Gate Rubric (Minimum `4.0 / 5.0` Target Before Shipping Any Slice)
| Pillar | Passing Ship Standard (`>= 4 / 5`) |
| --- | --- |
| **Core Loop & Feel** | Instant responsive controls, generous forgiveness windows, crisp anticipation/impact/follow-through, zero sluggish input dead-time |
| **Level Flow & Readability** | Players navigate critical path blind with zero text guidance; *Kishōtenketsu* learning curve; rewarding loops/shortcuts; fair checkpoints |
| **World & Visual Cohesion** | Verified grayscale squint-test pass across all 5 bands; seam-free tiles; unmistakable regional contrast; zero mixels |
| **Narrative & Audio** | Concise voice-distinct writing; environmental storytelling coherence; 5-tier balanced mix; surface footsteps & adaptive dynamics |
| **UX & Accessibility** | Effortless M+K + gamepad parity; glanceable HUD; WCAG `>= 4.5:1` text; colorblind redundancy; reduced-motion & shake toggles; AccessKit labels |
| **Technical-Creative Sync** | Clean Godot 4.7 scene/signal architecture (`Phase 1 Standards`), `0` static/lint warnings, smooth `p99` frame pacing |
