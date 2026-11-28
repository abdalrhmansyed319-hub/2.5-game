# Deliverable V — Final Game Design Document (Master Living GDD v1.0)

> **Project**: ***VERDANT SIGNAL*** *(Working Title — Planet Oura-IV / Catalog K-419b)*  
> **Document Role**: Authoritative master summary integrating Deliverables `A`–`Y` (`01`–`25`) into one coherent, pre-production-locked Game Design Document. **No production game code, mass assets, or full world implementation started; ready for Windows Godot verification & Visual Prototype Gate (`DDL-015` / `DDL-016`).**  
> **Revision Note (Pre-Production Lock — see [`23-strategic-design-review-and-audit.md`](23-strategic-design-review-and-audit.md) & [`24-design-decision-log.md`](24-design-decision-log.md))**: Updated cleanly to reflect all resolved contradictions (`DDL-001`–`DDL-016`): 4-Hypothesis slow-burn mystery, 3 accumulated world-state ending axes, tactile 4-tool field self-defense & ethical hunting, zero-inflation v1.0 catalog counts (`42` flora / `30` fauna), 7-milestone acyclic progression DAG, Oblique 3/4 Lagoon & Tidal Reef redesign, 4-state readable fauna AI, `480×270` vs `640×360` Visual Prototype Gate, and full Vertical Slice Acceptance Criteria (`Deliverable Y`).

---

## 1. High Concept & Five Creative Pillars
- **Genre**: Painterly Xenobiological Exploration × Ecological Survival × Field-Science Mystery.
- **Perspective & Visual Target**: Oblique 3/4 Top-Down Painterly Pixel Art · Default **`480×270`** (`16×16` tiles, `16×24` astronaut) — **validated via Windows Visual Prototype A/B Gate against `640×360` (`4×` exact at `1440p`) before bulk art production!**
- **Core Premise**: Xenobotanist **Dr. Mara Lin** crash-lands on ocean-continental exoplanet **Oura-IV** after an electromagnetic **Blooming Tide** disrupts her survey ship. Investigating an ambiguous repeating harmonic anomaly across 4 competing scientific hypotheses, she uncovers both an erased 19-year-old corporate probe (*Surveyor-01*) and a slow bio-acoustic planetary intelligence (**"The Mycelial Choir"**) poisoned in the Deep Caldera—culminating in **3 endings earned organically from accumulated play** rather than a final dialogue choice!
- **Five Pillars**:
  1. *Every Horizon Is a Living Painting* (Painterly pixel craft + 12/12 WCAG 5-band color scripts)
  2. *Nature Exists for Itself* (Readable 4-state autonomous wildlife living independently of the player)
  3. *Science IS Survival & Progression* (Field Observation -> Sampling -> Open-Question Camp Synthesis Board = Tech Tree)
  4. *Survival Creates Adventure, Never Chores* (Expedition Stamina/Rations + Environmental Suit Envelopes; zero nagging hunger/durability timers)
  5. *The World Tells the Truth Without Lecturing* (Layered 4-Hypothesis mystery, *Surveyor-01* forensics, harmonic audio clues)

---

## 2. Core Gameplay Loop & Systems Summary
- **4-Beat Expedition Loop**: `Prepare at Field Camp` -> `Explore, Observe & Weather-Adapt` -> `Sample, Record & Evade/Defend/Harmonize` -> `Solve Open Questions on Synthesis Board & Unlock New Envelopes / Relay Nodes`.
- **Survival & Field Defense (`Deliverable I`)**:
  - *Exertion Stamina & Botanical Rations*: Analyzed alien flora restores stamina cap & grants real thermal/electrical/night adaptations.
  - *Suit Environmental Envelope*: Calm exploration in Tier-1 Rimlands; active hazard drain in Acid Mist, Neuro-Spores, Ion Lightning, Tidal Vapor, Polar Cold, and Caldera Radiation.
  - *Tactile 4-Tool Field Self-Defense & Ethical Hunting*: *Kinetic Core-Spike* stagger, *Photonic Flash-Flare*, *Harmonic Decoy/Repeller Chime*, and *Sedative Bio-Dart*. Emergency hunting works cleanly to save Mara's life, yet yields degraded scientific data, triggers temporary herd fear, and subtly registers in Ecological Conduct.
  - *4 Intrinsic Side-Exploration Rewards*: Subterranean Root/Geode shortcuts, non-mandatory field utility upgrades, Kaelen Voss's 7 forensic caches, and illustrated Codex/Drop-Pod diorama growth.
- **Scientific Discovery (`Deliverable J`)**:
  - 3-Tier Mastery per organism: *T1 Quick Lens Sketch* -> *T2 Live Sample / Acoustic Recording / Observed Interaction* -> *T3 Open-Question Field Lab Synthesis*.
  - Toggleable **Acoustic Field Lens** visualizing sound ripples, stealth radii, cave bat sonar echoes, and harmonic waveforms.

---

## 3. World, Biomes, Flora, Fauna & Dynamic Weather (`Deliverables E–H, M, Q`)
- **Continental Mosaic (`6` Macro-Regions -> `12` Core Biomes + `24` Distinct Sub-Biomes = `36` Named Environmental Identities + `1` Geode Connector Hub)** — backed by [`data/biomes.json`](data/biomes.json) (`12/12` reachable & color-audited):
  - *Tier 1*: Amber Kelp Littoral, Singing Reedwood Canopy
  - *Tier 2*: Vitreous Fen & Bog, Vesper Fungal Jungle, Steppe of Wind-Carved Basalt
  - *Tier 3*: Ochre Salt-Canyon Desert, Pelagic Coral Archipelago, **Bioluminescent Lagoon & Tidal Reef** *(Oblique 3/4 Skiff + Low-Tide Drained Reef-Basins)*, Resonant Quartz Peaks, Deep Mycelial & Crystal Caverns
  - *Tier 4*: Rime-Glass Tundra & Glacier, The Blighted Caldera (*Surveyor-01* Scar)
- **Zero-Inflation Version 1.0 Species Catalog (`Deliverables G, H, Q`, [`data/flora.json`](data/flora.json), [`data/fauna.json`](data/fauna.json))**:
  - **Flora (v1.0)**: **`24` Core Flora Species + `18` Mechanical Multi-Biome Ecotypes = `42` catalog entries** (single-biome endemics never duplicated; post-1.0 expandable cleanly toward `48–72+` and long-term `200+`).
  - **Fauna (v1.0)**: **`20` Core Fauna Species** (`16` regular + `4` unique uncloned Legendary Keystones) **+ `10` Regional Ecotypes = `30` catalog entries** (`34/34` trophic links verified; 4-State Readable Autonomous AI + Deterministic Chunk Ecological State Windows).
- **Dynamic Weather (`Deliverable M`, [`data/weather.json`](data/weather.json))**: `24-min` Dawn/Sun/Dusk/Bioluminescent Night cycle + **8 Planetary Events** (*Blooming Tide*, *Ion Tempest* incl. Rimlands squalls, *Acid Mist*, *Spore-Fall*, *Twin-Moon Syzygy Tide*, *Zenith Heat Scour*, *Aurora Whiteout*, *Choir Tremor*).

---

## 4. Layered Narrative Arc, Acyclic Progression & Accumulated Endings (`Deliverables D, K, L`)
- **4-Hypothesis Layered Mystery (`DDL-002`)**: *I. Abiotic Geophysical Resonance* (Act 1 — ambiguous Relay Node 1 prime-interval anomaly!) -> *II. Buried Human / Artificial Beacon* (Early Act 2 — *Surveyor-01* & Kaelen Voss!) -> *III. Non-Sentient Colonial Homeostasis* (Late Act 2 — Blooming Tide synchronization) -> *IV. The Mycelial Choir & The Caldera Wound* (Acts 3–4).
- **Unified 3-Node Relay Spine & 7-Milestone Acyclic DAG (`data/progression.json`)**:
  1. `Node 1 (Hollow Flute Groves)` -> `Node 2 (Root-Nerve Nexus)` -> `Node 3 (Piezoelectric Spires)` -> `Caldera Convergence`, with parallel Tier-3 Sea & Desert branches and explicit `safe_entry_mechanism` windows preventing any circular deadlock!
- **3 Endings Earned via 3 Diegetic World-State Axes (`Ecological Conduct` × `Forensic Truth` × `Caldera & Relay Intervention`)**: **Ending A (*Extraction — The Cold Signal*)** · **Ending B (*Symbiosis — The Living Chorus*)** · **Ending C (*The Witness — Quiet Horizon*, sinking the corporate transponder)**.

---

## 5. Art, Audio, Technical Architecture & Vertical Slice (`Deliverables N–Y`)
- **Art (`Deliverable N`, `Deliverable W`)**: Pixel-perfect `SubViewport` + crisp UI overlay, 1D LUT day/night grading, wind/water shaders, strict 5-Band Contrast (`12/12` `[PASS]`). Default `480×270` (`16×24` Mara) gated by **Windows Visual Prototype A/B Test** (`480×270` vs `640×360` at `1080p`/`1440p` + smooth sub-pixel camera + canopy occlusion!).
- **Audio (`Deliverable O`)**: Organic wood/glass/marimba + warm synth identity; 5-Tier Godot Audio Bus hierarchy; surface-aware `TileData` footsteps; 40–50% musical silence ratio; playable acoustic cues.
- **Godot Architecture (`Deliverable P`, `Deliverable W`)**: Verify actual installed **Windows Godot version** before Stage 05 coding! `3×3` active `64×64`-tile chunk streamer (`ResourceLoader.load_threaded_request`); author-composed chunks + offline scatter assist + feathered blend collars for Vertical Slice; staggered `4 Hz` 4-state AI; compact delta-save (`Lab 07`). Static Python simulation (`L4`) explicitly NOT treated as live Windows runtime proof (`L5`)!
- **First Playable Milestone (`Deliverable T` + [`Deliverable Y: Acceptance Criteria`](25-vertical-slice-acceptance-criteria.md))**: **8–12 Week Vertical Slice (*"The Rimlands Awakening"*)** — `4×4` chunks (`Amber Coast + Singing Canopy + Fen Border`), **`6` flora + `6` fauna** (incl. *Lichen-Back Newt* & *Reed-Fang Lurker*), Ion Tempest squall + Twin-Moon Low Tide, Open-Question Synthesis Board -> ambiguous Relay Node 1 cliffhanger, verified by live Windows `p99 < 14 ms` telemetry & `>= 4/5` blind human playtest pass rates!

---

## 6. Cross-Reference Index to Supporting Specifications (`A`–`Y`)
- **Assessment, Critique & Identity**: [`01`](01-executive-creative-assessment.md) · [`02`](02-concept-critique-and-reinvention.md) · [`03`](03-game-identity-and-core-pillars.md)
- **Narrative, World, Biomes, Flora, Fauna**: [`04`](04-story-and-narrative-foundation.md) · [`05`](05-planetary-worldbuilding-bible.md) · [`06`](06-biome-encyclopedia-and-distribution.md) · [`07`](07-flora-design-and-database-spec.md) · [`08`](08-fauna-design-and-behavior-framework.md)
- **Gameplay, Science, Tech, Missions, Weather**: [`09`](09-survival-and-gameplay-systems.md) · [`10`](10-scientific-exploration-and-discovery.md) · [`11`](11-progression-crafting-and-technology.md) · [`12`](12-main-objective-missions-and-endings.md) · [`13`](13-dynamic-weather-and-environmental-events.md)
- **Art, Audio, Godot Tech, Cost, Tools, Roadmap, Risks**: [`14`](14-art-direction-and-pixel-art-bible.md) · [`15`](15-audio-direction.md) · [`16`](16-technical-feasibility-and-godot-architecture.md) · [`17`](17-content-scale-and-production-cost-analysis.md) · [`18`](18-available-tools-and-capabilities-audit.md) · [`19`](19-custom-tools-plan-and-utilities.md) · [`20`](20-production-roadmap-and-vertical-slice.md) · [`21`](21-risk-register-and-critical-decisions.md)
- **Pre-Production Lock & Acceptance Suite (`W`–`Y`)**: [`23`](23-strategic-design-review-and-audit.md) · [`24`](24-design-decision-log.md) · [`25`](25-vertical-slice-acceptance-criteria.md)
