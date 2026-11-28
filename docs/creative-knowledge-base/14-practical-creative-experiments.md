# 14 — Practical Creative Experiments (Verified Findings & Lab Synthesis)

> **Location of Artifacts**: [`creative-labs/`](../../creative-labs/README.md) (Exercises A–G) and [`tools/asset_inspector.py`](../../tools/asset_inspector.py).  
> **Strict Honesty Distinction**: Below we separate **Executed & Verified Findings** (Python forensics, real visual PNG inspections via `read_file`, static `gdparse`/`gdlint`/Godot `4.7.2-stable` XML verification) from **Unverified Runtime Areas** (live interactive feel, camera smoothness at 60–144 FPS, and human playtesting inside a running Godot binary).

---

## 1. Summary of All 7 Practical Creative Exercises

| Lab | Primary Deliverable | Key Creative/Technical Proof | Real Defect Caught During Verification |
| --- | --- | --- | --- |
| **Ex A — Level Design** | 3 spatial blockouts on `16 px` grid (`20×12` camera window) | *Kishōtenketsu* 4-act safety ramp, Triangle/Landmark sightlines, vertical shortcut elevation | Caught lethal pit under Beat 1 before safe mechanic introduction -> added 2-tile safe floor |
| **Ex B — World Building** | Fictional 3-strata world (*The Saltglass Cisterns*) | Single hydrological cause driving 3 contrasting biomes, 3-era stratigraphy, natural water compass | Caught causally disconnected "lava cavern" draft -> replaced with flooded saltglass filtration vaults |
| **Ex C — Tileset & Asset Intelligence** | 16-tile `64×64` synthetic atlas + 14×10 room preview + `asset_inventory.md` + `tileset_assembly_map.gd` | End-to-end automated Pillow forensics + direct `read_file` pixel visual review + Godot `TileMapLayer` code | **Pass 1 visual inspection caught 3 real pixel defects** (broken west-wall highlight, unmitered pillar corners, 1px notched inner corners) -> repaired & visually verified on Pass 2! Also caught 2 `gdlint` errors (`max-returns`, line length) -> fixed! |
| **Ex D — Gameplay Feel** | `FeelProfile` (`Resource`) + `FeelSandboxController2D` A/B comparator | Data-driven toggle of coyote time, jump buffer, apex hang, variable cut, 4 px corner nudge, squash/stretch | Caught root-body scale pitfall -> isolated strictly to child `visual_pivot` respecting `reduced_motion` |
| **Ex E — Narrative Design** | Branching dialogue, 3 item specs, 2 in-world logs, 1 zero-text room vignette | Passed blinded Voice Test, `<= 28 words/beat`, genuine traversal tradeoffs mapped to save flags | Caught cosmetic branching in Draft 1 -> upgraded to mutually meaningful Winch vs. Deep Mask choices |
| **Ex F — Art Direction** | 2 inverted-polarity 5-band palettes + `art_direction_5band_study.png` | Quantitative WCAG luminance ratios + real side-by-side Color vs. Grayscale squint test (`read_file`) | **Pass 1 math (`1.40:1`) & visual squint test exposed bright vermilion `#E8522E` melting into sunlit gray stone!** Repaired with crisp `3 px` dark silhouette rim (`#1C161A`), visually verified on Pass 2! |
| **Ex G — Integrated Design** | Multidisciplinary 3-screen slice blueprint + `CameraDirector2D` (`camera_director_2d.gd`) | Production Godot 4.7 *Scroll Back* camera (deadzone, commit-delayed look-ahead, platform snap, trauma² noise shake) | Caught direct `global_position` shake mutation breaking room bounds -> isolated strictly to `offset` & `rotation` |

---

## 2. Verification Audit Ledger (Strict Honesty Scale)

| Verification Level | Phase 2 Artifacts Verified at This Level |
| --- | --- |
| **1. Designed / Written** | All 7 Exercises (`A`–`G`), 4 Godot 4.7 GDScripts, 3 Python tooling/fixture scripts (`asset_inspector.py`, `build_training_tileset.py`, `verify_palette_contrast.py`) |
| **2. Reviewed / Audited** | All 7 Exercises audited against all 10 required sections, the 10-Point Creative Decision Framework, and Phase 1 Technical Standards |
| **3. Executed (Tooling / Visual / Static)** | **Executed**: `tools/asset_inspector.py` (0 warnings), `build_training_tileset.py`, `verify_palette_contrast.py`, **Direct Visual PNG Inspection via `read_file`** (2 passes each on Exercise C & Exercise F), and `tools/verify_labs.py` (`gdparse` 37/37, `gdlint` 33/33, Godot `4.7.2-stable` XML Class-Ref API audit across 837 classes) |
| **4. Tested in Live Godot Engine Runtime** | **NOT EXECUTED** — sandbox lacks a Godot Engine executable; live feel calibration (`FeelSandboxController2D`), real-time camera smoothness (`CameraDirector2D`), interactive greybox playtesting, and real-time audio mixing MUST be validated in an interactive Godot `4.7.2-stable` runtime once Phase 3+ begins. |
| **5. Verified in an Actual Production Game** | **NOT APPLICABLE YET** — intentionally withheld per Phase 2 Section 19 (*Do Not Start the Actual Game Yet*). |
