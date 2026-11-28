# Deliverable T — Production Roadmap and Recommended Vertical Slice

> **Core Discipline (`Phase 3 Deliverable C`)**: Never start by building 12 biomes or 400 species simultaneously! Prove the **entire soul, art bar, ecological AI, scientific synthesis loop, and chunk streaming tech** inside ONE unforgettable, tightly bounded **8–12 Week Vertical Slice** — preceded by a **1–2 Week Windows Visual & Streaming Prototype Gate**!  
> **Revision Note (Pre-Production Lock — see [`DDL-002` / `DDL-012` / `DDL-014`](24-design-decision-log.md) & [`Deliverable Y`](25-vertical-slice-acceptance-criteria.md))**: Fixed earlier internal contradiction by explicitly adding **`Lichen-Back Newt`** (`6` Fauna total!), aligned `wx_02_ion_tempest` to cover Rimlands squalls, replaced the premature "living planet" Act 1 spoiler with the **ambiguous prime-interval subterranean anomaly**, and locked full pass/fail Acceptance Criteria in [`25-vertical-slice-acceptance-criteria.md`](25-vertical-slice-acceptance-criteria.md)!

---

## 1. The Recommended Vertical Slice — *"The Rimlands Awakening"* (`8–12 Weeks`)

### Exact Bounded Scope (Full Acceptance Contract -> [`Deliverable Y`](25-vertical-slice-acceptance-criteria.md))
- **Playable Footprint**: **`4 × 4` Chunks (`16` total `64×64`-tile chunks = `4096×4096 px`, ~25–40 minutes of unhurried rich play)** built via author-composed layouts + offline scatter assist + feathered landmark collars running on a real `3×3` active chunk streamer:
  - **Core Biome 1**: *Amber Kelp Littoral* (`Drop-Pod Clearing` Hero Landmark + `Drift-Wreck Cove` tidal shoreline)
  - **Core Biome 2**: *Singing Reedwood Canopy* (`Hollow Flute Groves` Relay Node 1 Hero Landmark + `Sun-Dappled Glades`)
  - **Teaser Border Ecotone**: Wet edge of *Vitreous Fen & Bog* (visible emerald acid mist blocking deeper basin entry—giving players an immediate concrete scientific reason to solve Hypothesis #1!)
- **Organism Roster (`12` Hand-Crafted Core Species — Zero Ecotype Clones!)**:
  - **6 Flora**: *Amber Tide-Kelp*, *Mirror Glasswort*, *Singing Reedwood*, *Sun-Drop Bulb*, *Cordage Frond*, *Breath-Sponge Lichen* (at safe wet Canopy/Fen ecotone).
  - **6 Autonomous Fauna**: *Stilt-Strider* (shy coastal grazer), *Mirror-Shell Crab* (tidal burrower), *Chime-Wing Glider* (curious scanner-mimic!), *Prism-Pollen Moth* (pollinator swarm), **`Lichen-Back Newt`** (Fen-border symbiote breathing inside Acid Mist!), *Reed-Fang Ambush Lurker* (single territorial marsh ambush predator testing stealth, Acoustic Decoy & Kinetic Core-Spike!).
- **Dynamic Environment**: Full `24-min` (accelerated `10-min` demo option) **Dawn -> Sun -> Dusk -> Bioluminescent Night** LUT cycle + **1 Rimlands Ion Tempest Squall** telegraphed 60 seconds early by howling Singing Reedwoods + **1 Twin-Moon Low Tide** exposing *Drift-Wreck Cove* salvage!
- **Complete Core Loop Proven End-to-End**:
  1. Wake inside the painted *Drop-Pod Clearing* beside a small solitary Mara.
  2. Explore coastline & forest; scan/sketch flora & observe Chime-Glider mimicry with the **Acoustic Field Lens**.
  3. Notice **Singing Reedwoods** howling before an Ion Tempest squall -> take shelter under reed arches / camp tent while rain splashes!
  4. Wait for **Twin-Moon Low Tide** to recover the *Meridian* transmitter dish from *Drift-Wreck Cove* (evading or luring a territorial *Reed-Fang Lurker*).
  5. Observe a **Lichen-Back Newt** grazing *Breath-Sponge Lichen* at the safe Fen ecotone -> return to **Camp Field Lab Open-Question Synthesis Board** -> synthesize **Bio-Membrane Filter Mk1**!
  6. Assemble and harmonically tune **Relay Node 1** in *Hollow Flute Groves* -> **Ambiguous Act 1 Cliffhanger**: orbital uplink bounces off ionospheric static, yet the dish locks onto an eerie repeating **prime-interval subterranean echo**—leaving players debating whether Oura-IV hides strange piezoelectric geology, an alien machine, or an unlisted human ship!

### Vertical Slice Kill/Go Exit Criteria (Before Expanding to Full Production!)
- [ ] **Art Test**: Blind screenshots at `1080p` (`4×` scale) earn spontaneous *"this looks like a living painting!"* reactions AND pass desaturated 5-Band squint tests (`L6`).
- [ ] **Wonder & Clarity Test**: Blind playtesters navigate to Drift-Wreck Cove and Hollow Flute Grove without quest markers, understand the 60-second storm warning, and experience at least one unscripted wildlife moment (`L6`).
- [ ] **Tech Test**: Smooth `60 FPS` (`p99 < 14 ms`) across all 16 chunks with zero streaming hitches, clean save/load round-trip, and seamless M+K + Gamepad parity (`L5`).

---

## 2. Full Staged Production Roadmap (Mapped to Phase 3 Stages 01–10)

| Stage | Timeline Estimate *(2–3 Person Studio)* | Key Deliverables & Exit Gate |
| --- | --- | --- |
| **Stage 01–04 (Discovery, GDD Lock, Art/Asset Pilot)** | `Weeks 1–3` | User signs off critical decisions (`Deliverable U`); lock actual Godot version; create & visually audit (`asset_inspector.py` + `read_file`) first `16×16` Rimlands painter-grade tileset + Mara `16×24` sprite sheet |
| **Stage 05–06 (Core Tech & Greybox Prototype)** | `Weeks 4–7` | Implement chunk streamer, `FeelSandboxController2D` adapted to 3/4 top-down, `CameraDirector2D`, Acoustic Lens, Utility AI prototype, Camp Synthesis Board -> **Greybox Fun Gate!** |
| **Stage 07 (Vertical Slice — *"The Rimlands Awakening"*)** | `Weeks 8–14` | Full painted Rimlands + audio/weather/LUT + Relay Node 1 -> **Blind Human Playtest & Greenlight Gate!** |
| **Stage 08A (Act 2 Expansion — Lowland Basin & Highland Steppe)** | `Months 4–9` | Add *Vitreous Fen*, *Vesper Fungal Jungle*, *Basalt Terraces*, *Deep Mycelial Caverns*; `8` more flora + `7` fauna archetypes; Relay Node 2 + *Surveyor-01* reveal |
| **Stage 08B (Act 3–4 Expansion — Extreme Biomes & Climax)** | `Months 10–15` | Add *Ochre Badlands*, *Coral Archipelago*, *Abyssal Shelf*, *Quartz Peaks*, *Cryo-Glacier*, *Blighted Caldera*; remaining `10` flora + `8` fauna archetypes (incl. 4 Keystones); Relay Node 3 & all 3 Endings |
| **Stage 09–10 (Refinement, Performance & Release Prep)** | `Months 16–18` | Multi-hour pacing/balance pass, full accessibility & localization pass, `p99` profiling across hardware tiers, clean exports, release QA (`L6`) |
