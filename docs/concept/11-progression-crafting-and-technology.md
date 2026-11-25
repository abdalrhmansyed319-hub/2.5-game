# Deliverable K — Progression, Crafting, and Technology Design

> **Verified Data Source**: [`docs/concept/data/progression.json`](data/progression.json) — all **7 Acyclic Branching Progression Milestones** and **3 Relay Spine Nodes** audited via `tools/ecology_validator.py` (`DAG acyclic=True`, `0` errors, every milestone carrying an explicit `safe_entry_mechanism`!).  
> **Revision Note (Pre-Production Lock — see [`DDL-006` / `DDL-007`](24-design-decision-log.md))**: Earlier draft conflicted with `Deliverable L` (listing only 2 Relay Nodes instead of 3!) and contained circular hazard dependencies (`ms_02`/`ms_03`/`ms_04`). Rebuilt below into a **verified 7-milestone Acyclic Branching DAG** aligned 1:1 with the 3-Node Harmonic Relay Spine (`Node 1 Hollow Flute Grove -> Node 2 Root-Nerve Nexus -> Node 3 Quartz Peaks Spire -> Caldera`) and replacing full underwater rebreather diving with the Oblique 3/4 *Buoyancy Skiff + Tidal Vapor Seal*!

---

## 1. Realistic Improvisational Tech Philosophy
Dr. Mara Lin is a **stranded xenobotanist**, NOT a one-woman aerospace factory printing titanium spaceships from chopped trees! Therefore, every single piece of crafted technology obeys **grounded improvisational bio-engineering**:
- **Structural Metal & Micro-Electronics**: Salvaged strictly from **finite meaningful wreckage** (*ICV Meridian* drop-pod debris, scattered cargo canisters, and forgotten *Surveyor-01* relay buoys) — never mined magically out of boulders!
- **Active Materials, Filters, Coatings, Cables & Fuel**: Engineered organically from **analyzed Oura-IV biology and minerals** (mycelial filament bio-cables, lichen respiration membranes, wax thermal coatings, storm-fern arc conductors, kelp buoyancy bladders, crystal acoustic resonators).

---

## 2. Acyclic Branching Progression DAG (7 Milestones — Zero Circular Deadlocks!)

Every single Tier-2/3/4 biome has a **verified natural/ecotone access window** BEFORE you craft its permanent suit upgrade — eliminating Metroidvania soft-locks completely:

| ID / Branch | Prerequisites | Required Biomes | Verified Safe-Entry Window (Before Permanent Upgrade!) | Key Unlocks |
| --- | --- | --- | --- | --- |
| **`ms_01` (Spine T1)** | None | Amber Coast, Singing Canopy | Breathable Tier-1 Rimlands; Twin-Moon Low Tide exposes *Drift-Wreck Cove* | **Acoustic Field Lens**, **Camp Synthesis Bench**, **Collapsible Field Shelter** |
| **`ms_02` (Spine T1->T2)** | `ms_01` | Amber Coast, Singing Canopy | *Breath-Sponge Lichen* & *Lichen-Back Newt* inhabit the safe wet Canopy/Fen ecotone border | **Acid/Spore Suit Filter Mk1**, **Harmonic Decoy Beacon**, **Relay Node 1 (*Hollow Flute Grove*)** |
| **`ms_03` (Basin/Caverns T2)** | `ms_02` | Vitreous Fen, Vesper Jungle, Mycelial Caverns | Protected by *Suit Filter Mk1*; *Echo-Bat* sonar pings illuminate cavern paths | **Whisper-Moss Stealth Boots**, **Bio-Cable Link**, **Night-Vision Tonic**, **Sedative Bio-Dart**, **Relay Node 2 (*Root-Nerve Nexus*)** |
| **`ms_04a` (Azure Sea Branch T3)** *(Parallel Optional)* | `ms_02` | Basalt Terraces, Coral Archipelago, Tidal Lagoon Reef | *Basalt Terraces* require zero suit filter; *Float-Bladder Rafts* on Archipelago shores let you build the **Buoyancy Skiff** BEFORE crossing deep reefs drained at Low Tide! | **Buoyancy Skiff**, **Tidal Vapor Seal**, **Submerged *Surveyor-01* Buoy Black Box** |
| **`ms_04b` (Rift Thermal Branch T3)** *(Parallel)* | `ms_02` | Basalt Terraces, Ochre Badlands | *Ochre Badlands* is safely traversable at **Dusk, Night & Dawn** (and inside *Glass-Skink* shade tunnels) to earn permanent thermal wax! | **Thermal Wax/Moss Suit Lining**, **Relay Copper Winding Coils**, ***Surveyor-01* Telemetry Tracker** |
| **`ms_05` (Summit Spine T3)** | `ms_03`, `ms_04b` | Basalt Terraces, Quartz Peaks | *Thermal Lining* shields alpine cold; sheltering beside **Grounding Storm-Ferns** lets you safely gather Capacitor Ore during Ion Tempests! | **Arc-Grounded Suit**, **Geode Vault Shortcut Hub**, **Relay Node 3 (*Piezoelectric Spire*)** |
| **`ms_06` (Climax T4)** | `ms_05` | Cryo-Glacier, Mycelial Caverns, Sulfur Caldera | *Thermal Lining* + Geothermal Springs allow Glacier runs; walking in the steam-shadow of the **Cinder-Back Tortoise** crosses Caldera radiation! | **Bio-Remediation Culture** *(Endings B/C)* OR **Salvaged Reactor Overdrive** *(Ending A)* |

---

## 3. Compact Base & Field-Camp Design (Zero Base-Building Bloat!)
We deliberately **reject** sprawling 500-tile factory base-building (which clashes with the nomadic "living painting" exploration identity!):
- **Home Base (*The Drop-Pod Clearing*, Amber Kelp Coast)**: A cozy, visually evolving diorama that grows naturally as you repair its **Solar Dish**, **Botanical Terrarium Planters** (growing small samples of discovered plants for quick camp brewing!), **Field Lab Synthesis Table**, and **Acoustic Map Table**!
- **Forward Waystations (Compact Collapsible Field Camps)**: Mara can pitch lightweight 2-tile camps in scenic overlooks across distant regions—establishing warm rest/brew/save/fast-relay-ping checkpoints without cluttering pristine wilderness with ugly concrete walls!
