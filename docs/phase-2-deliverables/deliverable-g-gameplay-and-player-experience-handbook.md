# Deliverable G — Gameplay and Player Experience Handbook

> **Foundation**: Synthesized from [`Creative KB-01`](../creative-knowledge-base/01-game-design-fundamentals.md), [`KB-02`](../creative-knowledge-base/02-player-psychology-and-game-feel.md), [`KB-09`](../creative-knowledge-base/09-gameplay-and-systems-design.md), [`KB-10`](../creative-knowledge-base/10-camera-and-presentation-design.md), [`KB-11`](../creative-knowledge-base/11-sound-design-and-atmosphere.md), [`KB-12`](../creative-knowledge-base/12-ux-ui-and-player-experience.md), and [`Exercises D & G`](../../creative-labs/README.md).  
> **Godot 4.7 Bridge**: [`Labs 02, 04, 07, 08`](../../labs/README.md), [`FeelSandboxController2D`](../../creative-labs/exercise_d_gameplay_feel/feel_sandbox_controller_2d.gd), [`CameraDirector2D`](../../creative-labs/exercise_g_integrated_design/camera_director_2d.gd).

---

## 1. Core Loop, Flow, and Systems Cohesion
- **Micro -> Core -> Meta Loops**: Every second-to-second input verb must feel intrinsically tactile before layering minute-to-minute objectives or hour-to-hour progression.
- **The Systems Cohesion Gate**: Before adding any gameplay system (combat, inventory, crafting, AI, puzzles, economy), write its **8-Point Systems Spec** (`KB-09`) and prove how it feeds into, creates tension with, or rewards mastery of the Core Loop. Cut isolated "feature islands."
- **Meaningful Failure & Fair Mastery**: Players quit over *confusion and unfairness*, not challenge. Ensure every failure answers immediately: *(1) What hit me? (2) Why? (3) How can I beat it next try?* — paired with crisp retry turnaround.

---

## 2. Game Feel Engineering Checklist (Proven in Exercise D)
Every responsive action game builds on player-favoring kinetic tuning decoupled into data-driven `Resource` profiles (`FeelProfile`):
- **Input Forgiveness**: Coyote time (`~80–120 ms`), input buffering (`~100–130 ms`), apex gravity softening (`~0.5–0.65×`), variable jump release cut, subtle ledge/ceiling corner nudges (`2–4 px`).
- **Anticipation -> Impact -> Follow-Through**:
  - Snappy player launch (`1–2` frames anticipation max); clear telegraphed enemy windups!
  - Multi-sensory impact resonance: brief micro-hitstop (`30–60 ms`), hit-flash shader (`instance uniform`), directional particles, pitch-varied SFX, subtle trauma² camera kick.
  - Pivot squash/stretch (`visual_pivot` only — never scaling `CollisionShape2D`!), respecting `reduced_motion` accessibility.

---

## 3. Camera Direction Standards (Proven in Exercise G — `CameraDirector2D`)
Never ship a raw centered `Camera2D` child! Apply Itay Keren's *Scroll Back* principles:
- **Camera Window (Dead Zone)**: Suppresses micro-jitter during tiny spacing adjustments.
- **Directional Look-Ahead with Commit Delay**: Smoothly leads toward travel/aim direction (`~0.12–0.18s` direction commit prevents whipping on rapid micro-taps).
- **Vertical Platform Snapping**: Holds steady elevation during routine jumps, snapping smoothly on landing (with a safe fall-margin override so downward threats always stay visible!).
- **Room Bounds & Focus Anchors**: Clamp room edges cleanly (`apply_room_bounds(Rect2i)`) and briefly blend toward newly unlocked shortcuts/vistas (`set_focus_anchor()`).
- **Accessible Trauma² Shake**: Drive `FastNoiseLite` strictly onto `Camera2D.offset` & `rotation` (never mutating `global_position`!) scaled by a user-facing `0%–100%` screen-shake setting.

---

## 4. Audio Direction & Mix Priority (`KB-11` + `Tech KB-08`)
- Enforce strict 5-Tier acoustic mixing via Godot Audio Buses:
  - *Tier 1*: Lethal telegraphs, player hurt, voice -> crisp transient priority + subtle ducking.
  - *Tier 2*: Footsteps (surface-aware via `TileData`), player verbs, weapon hits (`AudioStreamRandomizer`, no repeats).
  - *Tier 3*: Spatialized enemies & environmental mechanisms (Mono-forced `AudioStreamPlayer2D/3D`).
  - *Tier 4*: Adaptive music stems (`AudioStreamSynchronized` / `AudioStreamInteractive`).
  - *Tier 5*: Regional ambient beds + `Area2D/3D` reverb bus overrides + **strategic silence** for dramatic contrast!

---

## 5. UX/UI Clarity & Accessibility (`KB-12` + `Tech KB-07` / `Lab 08`)
- ***Into the Breach* Rule**: Sacrifice clever mechanics that cannot be communicated clearly at a glance; telegraph enemy intent cleanly!
- **Minimal Glanceable HUD**: Critical state visible in peripheral vision; detailed comparisons revealed cleanly on hover/focus (`progressive disclosure`).
- **Seamless M+K & Gamepad Parity**: Live glyph switching, unbroken focus loops, instant Cancel/Back, `MOUSE_FILTER_IGNORE` on passive overlays.
- **Accessibility Baseline**: High-contrast text (`>= 4.5:1`), colorblind-safe iconography (shape + value + label), subtitles with speaker labels, reduced-motion & screen-shake sliders, and Godot 4.5–4.7 AccessKit screen-reader metadata.
