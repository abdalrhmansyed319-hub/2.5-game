# VERDANT SIGNAL — V9.0: THE BROKEN SHORE — Master Art Direction & Production Plan

**Checkpoint Base:** `8df43bc` on `arena/1d52d1b9-2-5-game` (`main` untouched at `cfad6b8`)  
**Target:** Main Production Game (`game/project.godot`, Godot 4.7.2, `GL Compatibility`, Intel HD Graphics 3000)  
**World Architecture:** Seamless Continuous `2304 × 2880` Playable World — **The Broken Shore (South: `y = 1344..2880`)** connecting continuously northward through **Zone F — The Inland Gateway (`y = 1240..1580`)** straight into the approved **V8.0 Living Forest Sanctuary (`y = 0..1536`)**.

---

## 1. Phase 0 — Production Audit & Narrative Integration

- **Canon Lore Continuity (`docs/concept/04-story-and-narrative-foundation.md`):**
  - During orbital approach to **Oura-IV (`K-419b`)**, an electromagnetic **Blooming Tide** shorted the automated avionics of Solstice Exo-Survey vessel ***ICV Meridian***.
  - Dr. Mara Lin's heavy exploration lander separated and skidded violently across the **Amber Kelp Littoral (The Broken Shore)**, carving a scorched impact trench into the golden-ochre beach and coming to rest near the basalt headland with its aft equipment/telemetry compartment breached open.
  - Awakening on **Zone A — The Waking Shore**, Mara stands beside the vast animated alien ocean, spots the smoking wreckage of the *ICV Meridian* lander up the beach, explores tidepools & basalt cliffs, recovers expedition telemetry/equipment inside the breached aft bay, and pushes inland through the Coastal Vegetation Belt and **Inland Gateway** straight into the towering **Singing Reedwood Living Forest (V8.0)** — ZERO scene cuts, ZERO loading transitions, ZERO duplicate player/HUD/autoload architectures!
- **Existing Production Systems Extended (Never Replaced):**
  - `game/project.godot` (`640×360` native viewport, `1280×720` exact `2×` integer window, `gl_compatibility`, ANGLE fallback, 5 strict GDScript warnings, 12 `InputMap` actions, 8 physics layers)
  - `GameState` & `AudioDirector` lean autoloads + 5-tier `default_bus_layout.tres`
  - `PlayerController` (`88×88` bit-for-bit unmodified original character strips, 4 cardinal directions, zero fabricated diagonal/crouch sprites, `OcclusionPeekSprite`, Acoustic Field Lens `Q`/RMB, Field Sampling `E`, Crouch `C`, Sprint/Run `Shift`/`Space`)
  - `VerdantLivingForest` (`y = 0..1536`) extended cleanly with a walkable `180 px` southern trail opening (`x = 1040..1240`) meeting `VerdantBrokenShore` (`y = 1344..2880`)
  - `WorldChunkStreamer` (`9/9` active chunks maintained, sanctuary footprint expanded cleanly to cover the full continuous `[0..144] × [0..180]` Shore-to-Forest playable region)

---

## 2. Phase 1 — Master Art Direction Anchored on Dr. Mara Lin (`char_idle_88x88_8x4.png`)

Direct pixel analysis of the user's unmodified original astronaut sprite (`47 × 62 px` active figure inside `88 × 88` cell, **31 curated colors**) defines every visual invariant for V9.0:

| Visual Invariant | Extracted Mara Reference Value | Applied Across All V9.0 Broken Shore Assets |
| :--- | :--- | :--- |
| **Scale** | `47 × 62 px` (`1 m ≈ 32 px`, boot pivot `(44, 75)` → `offset (0, -31)`) | Crashed *ICV Meridian* Lander `~352 × 208 px` (~`11 m × 6.5 m`), basalt monoliths `128–192 px`, coastal boulders `64–112 px`, tide-kelp `32–48 px`, Mirror-Shell Crabs `16 × 12 px`, Chime-Wing Gliders `24 × 18 px` |
| **Outline Ink** | `#1e0c1c` (deep warm plum-indigo exterior 1px sel-out) | All modular landmarks, spacecraft hull, basalt cliffs, boulders, coastal flora, debris & fauna use `#1e0c1c` / `#2a1b31` crisp 1px sel-out outlines (never pure `#000000`, never blurred edges) |
| **Lighting Direction** | Strong top-left warm low-angle sunlight (`~38°`) | Warm ivory-gold top-left highlights (`#eff2e5`, `#f2d59b`, `#e69242`), cool plum-slate & teal-indigo ambient shadows (`#2a1b31`, `#3b4b5c`, `#1f394e`) |
| **Aerospace Titanium & Livery** | Ivory-steel `#eff2e5 → #d1c7a7 → #a19f93 → #777575 → #485565 → #2a1b31` + Solstice terracotta `#f2b25f → #e69242 → #bf5c27 → #a44522 → #67272d` + Visor cyan-slate `#b8f0ff → #71969c → #485565 → #2a1b31` | Exact material grammar shared by the crashed *ICV Meridian* Lander, detached hull cowlings, cargo crates, emergency beacon & interior nav console |
| **Ocean & Foam Ramp** | Deep abyss `#122036` → Sapphire `#1a3854` → Cobalt-teal `#235670` → Sunlit turquoise `#348592` → Jade shallows `#5bb0a4` → Submerged sand-jade `#8dc29e` → Sun-glint & lacy foam `#d9f0ea` / `#eff2e5` | 8 continuous depth transitions, translucent shallows showing submerged rocks & kelp beds, 8-frame animated wave crests, advancing/retreating shore foam & rock-break spray |
| **Sand & Basalt Ramp** | Dry warm ochre `#e2c896 → #d1b37d → #ba9762` · Damp sand `#967549 → #755838` · Glossy wet reflective sand `#5e6d74 → #7c969b` · Stratified basalt `#788994 → #556472 → #3c4654 → #2a1b31 → #1e0c1c` | Distinct tactile readability between dry sand (with soft footprints), damp sand, mirror-wet shoreline, stratified basalt ledges & mossy cliff crowns |
| **Coastal Flora Ramp** | Salt-sage & wind-grass `#c8d678 → #8db256 → #548242 → #2c5234 → #1a3228` · Amber Tide-Kelp `#f2b25f → #d67831 → #8a3524` · Mirror Glasswort & Luminous Tide-Blossoms `#8ef5e8 → #4cc2bc → #26787e` | Rooted coastal tufts, succulents, salt-shrubs, tide-kelp & flowers seamlessly bridged into V8.0's emerald forest palette across Zone F |

---

## 3. Spatial World Blueprint (`2304 × 2880` Continuous World)

```
y = 0    ┌───────────────────────────────────────────────────────────┐
         │      V8.0 LIVING FOREST SANCTUARY (EXISTING PRODUCTION)   │
         │  Hub (1024,822) · Root Arch · Waystone · Chime Clearing   │
y = 1240 ├─────────────────────┐   GATEWAY   ┌───────────────────────┤
         │  Southern Forest    │ (1040..1240)│   Southern Forest     │
y = 1344 ╞═════════════════════╧═══ZONE F════╧═══════════════════════╡
         │          ZONE F — THE INLAND GATEWAY (y = 1344..1600)     │
         │    Mossy dune-to-forest ecotone, root steps & ferns       │
y = 1600 ├──────────────┬─────────────────────────────┬──────────────┤
         │   ZONE D     │   ZONE E — COASTAL          │   Eastern    │
         │  BASALT      │   VEGETATION BELT           │   Coastal    │
         │  SHORE       │   (wind-grass dunes,        │   Bluffs &   │
y = 1920 │  (stratified │    succulents, driftwood)   │   Shrubs     │
         │   cliffs,    ├─────────────────────────────┼──────────────┤
         │   passages,  │   ZONE B — CRASH IMPACT     │   ZONE C —   │
         │   sea spray) │   FIELD (ICV Meridian       │   TIDEPOOL   │
         │              │   wreck + walkable aft bay  │   COAST      │
y = 2240 ├──────────────┴──────────────┐  + trench)   │ (shallow     │
         │  ZONE A — THE WAKING SHORE  │              │  basins,     │
         │  (Spawn @ 740, 2290: surf,  │              │  kelp, crabs,│
y = 2420 │   wreck glimpse, footprints)│              │  tide rocks) │
         ╞═════════════════════════════╧══════════════╧══════════════╡
         │       THE VAST ALIEN OCEAN (y = 2360..2880, 520px deep)   │
         │  Translucent shallows · Reefs · Sea stacks · Rolling      │
         │  animated swells · Sun reflection column · Distant sea    │
y = 2880 └───────────────────────────────────────────────────────────┘
```

---

## 4. Staged Production Commit Plan

1. **Checkpoint Commit (Phase 0/1):** `docs/art-direction/V90_BROKEN_SHORE_ART_DIRECTION.md` (zero production files altered).
2. **Asset Forge & Multi-Pass QA (Phases 2, 3, 7, 8):** Generate, visually inspect at `1×` & `3×`, palette-unify, cluster-refine, and export all Broken Shore pixel-art sprites, editable `.vpf.json` sources, 8-frame ocean/foam/grass/fauna animation atlases, crashed *ICV Meridian* multi-layer wreck, and asset catalog into `game/assets/world/broken_shore/`.
3. **Production Level & Systems Integration (Phases 4, 5, 6, 9, 10):** Build `game/world/broken_shore/verdant_broken_shore.tscn` & `verdant_broken_shore.gd`, coastal ocean/spray shaders (`game/shaders/coastal_ocean.gdshader`), footprints/splashes/grass bending/interior cutaway/acoustic scanning/field sampling, open the seamless Zone F Inland Gateway in `verdant_living_forest.tscn`, and connect both regions continuously inside `RimlandsPrototype` starting Mara on **The Waking Shore**.
4. **Validation, Motion Proofs & Final Deliverables (Phases 8–11):** Exhaustive Vitest validation suite (`v90BrokenShoreProductionValidation.test.ts`), updated Godot 4.7.2 `smoke_runner.gd` & `run_production_v90_verification.bat`, native-resolution architectural/art-QA inspection proofs & animated ocean/gameplay GIFs, asset catalog doc, and honest final report.
