# Deliverable J — Remaining Creative Knowledge Gaps & Validation Needs

> **Strict Honesty Mandate**: Genuine readiness requires knowing clearly what we HAVE mastered, what remains UNVALIDATED in live execution, and where real-world creative blind spots exist before production begins.

---

## 1. Critical Runtime & Experiential Gaps (Cannot Be Solved Without Live Execution)

| Gap ID | Remaining Gap | Why It Matters | Concrete Phase 3+ Validation Plan |
| --- | --- | --- | --- |
| **CG-01** | **Unverified Live Game Feel & Kinetic Timing** | Coyote time (`0.11s`), jump buffer (`0.12s`), corner nudge (`4 px`), hitstop (`45 ms`), and camera look-ahead commit (`0.14s`) are grounded starting numbers, NOT universally optimal — 20 ms shifts feel wildly different live! | Run interactive A/B playtests in Godot `4.7.2-stable` with live `FeelProfile` hot-swapping & real controller/keyboard testers. |
| **CG-02** | **No Blind Human Playtesting Yet** | A designer is blind to their own assumptions ("curse of knowledge") — sightlines, puzzle clarity, difficulty spikes, and tutorial cues only prove themselves when fresh players play unguided. | Schedule silent observation blind playtests on every greybox milestone before art dressing; log hesitation points & death heatmaps. |
| **CG-03** | **Real-Time Camera Motion & Physics Interpolation Feel** | `CameraDirector2D` runs in `_physics_process` (`60 Hz`), which can interact subtly with Godot `4.4–4.7`'s `physics_interpolation` or pixel-snapping viewports on `120–144 Hz` monitors (micro-stutter risk!). | Profile live camera panning at `60/120/144 Hz` in Godot 4.7; test `_physics_process` vs. `_process` + sub-pixel viewport smoothing. |
| **CG-04** | **Real-Time Audio Mixing & Dynamic Fatigue** | Audio fatigue (repetitive footsteps, overlapping combat transients, resonant reverb mud, music stem transition jarringness) cannot be judged on paper — only through ears over 20+ continuous minutes! | Audition every audio bus (`Master/Music/SFX/Ambience/UI`) live across continuous play sessions with real speakers & headphones. |

---

## 2. Asset & Art Production Gaps

| Gap ID | Remaining Gap | Why It Matters | Concrete Phase 3+ Mitigation Plan |
| --- | --- | --- | --- |
| **CG-05** | **Untested Against Messy Real-World Third-Party Asset Packs** | Exercise C tested a clean synthetic 4×4 `64×64` tileset. Real user-supplied packs often have inconsistent padding, non-grid multi-tile props, missing inner corners, mixed artists, or ambiguous alpha borders. | Run `tools/asset_inspector.py` + full manual `read_file` visual catalog on EVERY user asset file before designing a single room; upgrade `asset_inspector.py` with margin/spacing & seam detectors if needed. |
| **CG-06** | **Real-Time Lighting, Shaders & VFX Readability Under Motion** | Static grayscale squint tests (Exercise F) catch base value flaws, but dynamic `PointLight2D` / `AreaLight3D`, additive glow, rain/fog particles, and camera motion can still ruin Band 4/5 figure-ground separation! | Perform live screenshot grayscale squint tests AND Deuteranopia/Protanopia checks during peak combat VFX intensity inside Godot! |
| **CG-07** | **Full 47-Tile Blob Autotiling & 3D Modular Kitbashing** | Exercise C built a 16-tile solid-mass tileset (requiring >= 2-tile walls); 1-tile thin walls/bridges require 47-tile Godot Terrain bitmasks, and 3D/2.5D worlds introduce modular snapping, trim sheets, UV texel consistency, and silhouette occlusion challenges. | Validate exact tile/mesh topology immediately once the user confirms 2D vs. 2.5D vs. 3D projection in Phase 3. |

---

## 3. Systems & Writing Scale Gaps

| Gap ID | Remaining Gap | Why It Matters | Concrete Phase 3+ Mitigation Plan |
| --- | --- | --- | --- |
| **CG-08** | **Multi-Hour Progression & Economy Balancing** | Paper math & 90-second vertical slices cannot detect late-game power creep, resource hoarding, pacing fatigue across hours 3–10, or degenerate player strategies. | Build lightweight telemetry logging + spreadsheet economy curves early; test full multi-room progression loops before scaling content volume. |
| **CG-09** | **Genre-Specific Mastery Depth Pending Project Definition** | Because Phase 2 strictly remained genre-agnostic (no genre chosen yet), deep specialized sub-craft (e.g., Metroidvania ability-gate matrices, Turn-Based Tactics action-economy math, Cozy Sim pacing, Action-RPG poise/i-frame tables, or Narrative Detective clue-web design) awaits the user's chosen genre! | Conduct a focused, rapid **Genre & Pillar Deep-Dive** immediately at Phase 3 kickoff once the user reveals their actual game vision and asset collection. |
| **CG-10** | **Voice, Localization & Screen-Reading Rhythm** | Written dialogue (Exercise E) was checked by word budget, not yet timed aloud or tested across expanded languages (~30% longer strings in German/Russian) or RTL layouts. | Test live text-reveal timing, overflow wrapping, and AccessKit screen-reader narration inside Godot `Control` containers early. |
