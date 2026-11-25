# Deliverable Q — Content Scale and Production Cost Analysis

> **Honesty Mandate (`DDL-008` / `DDL-009`)**: Unrealistic scope kills more beautiful indie games than technical bugs ever do — and **inflating counts through cosmetic palette swaps destroys player trust!** Below is a zero-inflation, 4-horizon content strategy separating **Vertical Slice**, **Version 1.0 Target**, **Post-1.0 Expansions**, and **Final Long-Term Vision**.

---

## 1. Zero-Inflation 4-Horizon Content Strategy (Explicit Taxonomy Definitions)

- **Core Biome** = Independent master tileset + bespoke 5-band palette + unique atmospheric rule + ambient audio stem.
- **Distinct Sub-Biome** = Shares parent base terrain kit + distinct micro-elevation/lighting rule + unique hero landmarks + >= 1 exclusive ecological/traversal mechanic (never a tint swap!).
- **Core Species (Archetype)** = Bespoke silhouette, animation/shader kit, acoustic signature, ecological niche, and >= 2 gameplay roles.
- **Mechanical Ecotype** = Applies **ONLY** to widespread multi-biome non-legendary species with BOTH a visible silhouette overlay AND real chemical/behavioral variance. Single-biome endemics and the `4` Legendary Keystones are **NEVER cloned!**
- **Individual Variation** = Scale/growth/framing polish — **NEVER counted in catalog numbers!**

| Scope Dimension | **1. Vertical Slice** *(Proof of Identity)* | **2. Version 1.0 Target** *(Shipping Flagship)* | **3. Post-1.0 Expansions** *(Modular Updates/DLC)* | **4. Final Long-Term Vision** *(Full Oura-IV Atlas)* |
| --- | --- | --- | --- | --- |
| **Biomes / Environments** | **`2` Core Biomes + `1` Teaser Ecotone** (`4` named sub-areas across `4×4` chunks) | **`12` Core Biomes + `24` Distinct Sub-Biomes = `36` Named Environmental Identities** (+ `1` Geode Hub) | `+ 4–6` Outer Archipelago / Deep Rift Expansion Biomes | Full **`36+` planetary environmental identities** realized at peak painterly fidelity |
| **Flora Catalog** | **`6` Core Flora Species** *(zero ecotype duplication)* | **`24` Core Flora Species + `18` Mechanical Multi-Biome Ecotypes = `42` Catalog Entries** | **`48–72` Core Flora Species** + genuine biome ecotypes | Scalable via JSON toward **`200+`** strictly where new habitats justify distinct mechanics |
| **Fauna Catalog** | **`6` Core Fauna Species** *(incl. Lichen-Back Newt & Reed-Fang Lurker)* | **`20` Core Fauna Species** (`16` regular + `4` unique Keystones) **+ `10` Regional Ecotypes = `30` Catalog Entries** | **`36–50` Core Fauna Species** + regional behavioral ecotypes | Scalable toward **`100–200`** strictly with bespoke silhouettes & readable ecology |
| **Estimated Bespoke Frames** | **`~500 – 700` frames** | **`~5,200 – 7,600` frames** *(disciplined 4–8 frame painterly loops + LUT/wind shaders)* | Modular per-pack (`~1,200` frames/pack) | Multi-year franchise art atlas |
| **Estimated Production Effort** | **`8 – 12 weeks`** *(preceded by `1–2 wk` Windows Visual Prototype Gate)* | **`24 – 36 person-months`** *(2–3 person team over 12–18m, or phased Early Access)* | `3–5 months` per expansion | Multi-year sustained studio lifecycle |

---

## 2. Where the Real Production Cost Lives (And How We Beat It!)

1. **Cost Driver #1 — Painterly Pixel Art (~55% of Total Production Effort)**:
   - *Solution*: `480×270` logical canvas (`16×16` tiles) cuts painted pixel area by **75%** compared to HD pixel art while looking *more* cohesive! Use **shader-driven wind sway, water ripples, and 1D time-of-day LUT grading** so artists paint **ONE** crisp daylight version per tile/plant instead of repainting Day/Dusk/Night/Storm frames by hand!
2. **Cost Driver #2 — Creature Animation (~20% of Total Effort)**:
   - *Solution*: Keep small ambient wildlife (`12×12`–`24×24`) crisp and expressive in **4–6 frame readable cycles** (just like *Hyper Light Drifter* & *Celeste*!), reserving richer multi-part procedural/hand-animated rigs strictly for the **4 Legendary Keystone Giants**!
3. **Cost Driver #3 — Hand-Dressing Vast Maps (~15% of Total Effort)**:
   - *Solution*: Our **35% Handcrafted Hero Landmarks + 65% Poisson Ecological Mosaic** pipeline (`tools/world_chunk_simulator.py`) gives artists maximum impact on unforgettable hero paintings while letting ecological placement tools handle organic ground cover, shore reeds, and grass ripples cleanly!
4. **Cost Driver #4 — Systems, Audio & Polish (~10% of Total Effort)**:
   - *Solution*: Reuse our verified Phase 1–2 Godot 4.7 foundations (`FeelSandboxController2D`, `CameraDirector2D`, `SaveSystem`, `ResponsiveUI`, `AudioStreamRandomizer/Interactive`) + automated `tools/ecology_validator.py` & `tools/palette_director.py` to eliminate manual QA churn!

---

## 3. Recommended Release Scaling Strategy (If Built by a Solo Dev or Tiny Team)
- **Phase A (Months 1–3)**: **Vertical Slice Demo** (*Sunken Rimlands* — `2` biomes, `6` flora, `5` fauna, Relay Node 1) -> Gather blind human playtesters + publisher/community validation!
- **Phase B (Months 4–10)**: **Act 1–2 Early Access / Core Release** (`6` Core Biomes: Rimlands, Lowland Basin, Basalt Terraces, Mycelial Caverns — `14` flora / `12` fauna archetypes).
- **Phase C (Months 11–18)**: **Full v1.0 Planetary Completion** (All `12` Core Biomes + `24` Sub-Biomes = `36` environments, all `24` flora & `20` fauna archetypes, Caldera Climax & all 3 Endings).
- **Phase D (Post-1.0 Expansions)**: Data-driven JSON taxonomy seamlessly scales toward the user's long-term **200+ flora / 120–200 fauna** dream via free biome/ecotype expansion updates without touching engine code!
