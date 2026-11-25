# Deliverable H — Fauna Design and Behavior Framework

> **Verified Data Source**: [`docs/concept/data/fauna.json`](data/fauna.json) — `20` Core Fauna Species (`16` regular + `4` unique Legendary Keystones), **`34/34` trophic food-web spatial co-location links verified (`0` errors)** via `tools/ecology_validator.py` and visualized in [`visuals/ecosystem_foodweb_graph.png`](visuals/ecosystem_foodweb_graph.png).  
> **Revision Note (Pre-Production Lock — see [`DDL-009` / `DDL-010`](24-design-decision-log.md))**: (1) Replaced inflated `20 × 2–3 = 48–60` multiplier with honest zero-inflation taxonomy: **`20` Core Fauna Species + `10` Regional Ecotypes (strictly on widespread non-legendary species; Legendary Keystones are NEVER cloned!) = `30` v1.0 zoological catalog entries**. (2) Simplified overengineered global off-screen continental migration simulation into **4 Crisp Readable On-Screen Behavioral States + Deterministic Chunk Ecological State Windows**! (3) Extended `fa_06_bog_filterer` to the safe wet *Singing Canopy / Fen Ecotone* border for Vertical Slice & Act 1 progress parity.

---

## 1. Zero-Inflation Zoological Taxonomy & Readable 4-State Autonomous AI

### Explicit Fauna Definitions
- **Core Fauna Species (`20` in v1.0; `6` in Vertical Slice)**: Bespoke silhouette, bespoke animation set, unique acoustic signature, trophic role, and distinct player interaction. Includes **`4` Unique Legendary Keystones** (*Resonant Horn-Beast*, *Tide-Singing Ray*, *Choir Root-Weaver*, *Cinder-Back Tortoise*) — iconic singular organisms NEVER cosmetically cloned!
- **Regional Ecotype (`10` in v1.0)**: Strictly limited to widespread non-legendary multi-biome species where biome climate alters BOTH visual silhouette/plumage AND an observable behavior (e.g., *Archipelago Stilt-Strider* wading deeper to eat Buoy-Kelp vs. *Coast Stilt-Strider*).
- **Individual Variation (`NEVER` counted as species)**: Juvenile vs. adult scale, horn asymmetry, flock plumage noise.

### Simplified 4-State Autonomous Ecology (Inspired by *Rain World*, Built to Ship!)
Rather than debugging an overengineered global off-screen continental pathfinding simulator across unloaded chunks, Oura-IV achieves vivid, believable living ecosystems through **two disciplined layers**:
1. **Four Crisp, Unmistakable On-Screen Behavioral States** (ticking staggered at `4 Hz`):
   - **`State 1 — Routine / Forage`**: Grazing co-located flora, basking, patrolling nests, or schooling; predators **rest visibly once fed**!
   - **`State 2 — Weather-Adapt`**: Distinct physical responses to storms, twilight, tides, and heat (*Horn-Beasts* circle into windbreaks, *Sand-Skinks* burrow at noon, *Mirror-Crabs* dig in before Tidal Surge).
   - **`State 3 — Alert / Interact`**: Clear 3-stage territorial warnings (flare -> vocalize -> lunge) OR curious social behavior (*Chime-Gliders* mimicking Field Lens pings, *Lichen-Newts* venting clean air bubbles when fed!).
   - **`State 4 — Predation / Flee`**: Autonomous hunter-prey pursuits (e.g., *Reed-Fang Lurker* stalking *Stilt-Striders*) and smart evasion of sprinting players or tossed Acoustic Decoys!
2. **Deterministic Chunk Ecological State Windows (Replaces Fragile Global Off-Screen Migration)**:
   - When a `64×64` chunk enters the active `3×3` ring, its wildlife distribution & initial states resolve deterministically from `(time_of_day × weather_state × chunk_conduct_delta)` — meaning entering a fog-draped marsh at dusk organically reveals a live Lurker ambush or sheltering flock with **zero off-screen pathing overhead and zero soft-locked missing species!**

---

## 2. Complete 20 Shipping v1 Fauna Archetypes Matrix

| ID | Common & Scientific Name | Role & Locomotion | Social / Activity | Temperament | Verified Diet | Emergent Gameplay & Player Interaction |
| --- | --- | --- | --- | --- | --- | --- |
| `fa_01` | **Stilt-Strider** (*Grallator littoris*) | Herbivore · Terrestrial | Flock · Diurnal | Shy | Amber Kelp | Flees sprinting players; crouched observation reveals kelp-bed harvest zones |
| `fa_02` | **Mirror-Shell Crab** (*Carcinus specularis*) | Scavenger · Amphibious | Solitary · Crepuscular | Defensive | Mirror Glasswort | Freezes reflecting sunlight; burrows during Twin-Moon surge; pinches only if grabbed |
| `fa_03` | **Chime-Wing Glider** (*Volans harmonicus*) | Omnivore · Flying | Flock · Diurnal | Curious | Sun-Drop Bulb, Prism Moth | **Mimics Mara's scanner beeps!** Harmonizing back leads Mara to rare fruiting shrubs |
| `fa_04` | **Prism-Pollen Moth** (*Lepidoptera chroma*) | Pollinator · Flying | Swarm · Diurnal | Passive | Sun-Drop Bulb, Lumen Bell | Lands on motionless players; trails reveal hidden nocturnal blooms & safe wind corridors |
| `fa_05` | **Moss-Back Grazer** (*Cervus frondis*) | Herbivore · Terrestrial | Herd · Diurnal | Cautious | Cordage Frond, Wind-Grain | Calm herd animals that shelter under Reedwood arches during rain; primary prey for predators |
| `fa_06` | **Lichen-Back Newt** (*Batrachus purus*) | Symbiote · Amphibious | Pair · Nocturnal | Passive | Breath-Sponge, Prism Moth | **Non-violent ally**: feeding it lichen emits a clean-air bubble inside toxic Acid Mist! |
| `fa_07` | **Reed-Fang Lurker** (*Saurus limosus*) | Predator · Amphibious | Solitary · Crepuscular | Ambush | Stilt-Strider, Lichen Newt | Tracks loud water splashes in fog; easily distracted away from choke points with an Acoustic Lure |
| `fa_08` | **Canopy Dusk-Stalker** (*Felis mycelia*) | Predator · Arboreal | Solitary · Nocturnal | Predatory | Chime-Glider, Moss Grazer | Hunts silently during Spore-Fall; startled and repelled cleanly by bright flares or resonant chimes |
| `fa_09` | **Arc-Shell Beetle** (*Scarabaeus volta*) | **Non-Aggressive Hazard** | Colony · Diurnal | Indifferent | Umbrella-Tree, Storm-Fern | Ignores Mara completely, yet discharges painful static arcs if crowded or supercharged in storms! |
| `fa_10` | **Sonar Bell-Wing** (*Chiroptera resonans*) | Omnivore · Flying | Colony · Nocturnal | Skittish | Lumen Bell, Prism Moth | **Natural radar**: their cave sonar pings temporarily paint hidden subterranean walls on Mara's Acoustic Lens! |
| `fa_11` | **Resonant Horn-Beast** (*Bovis tympanum*) | **Keystone Herbivore** | Migratory Herd · Diurnal | Protective | Wind-Grain Grass | Tramples threats near calves; deep resonant bellows literally harmonize with Relay Array frequencies! |
| `fa_12` | **Rift-Hound** (*Cursor basalti*) | Predator · Terrestrial | Pack · Diurnal | Pack Hunter | Moss Grazer, Sand-Skink | Coordinates flanking chases in open steppe; retreats into canyon shade at zenith noon or away from Horn-Herds |
| `fa_13` | **Glass-Burrow Skink** (*Scincus fulgur*) | Burrower · Herbivore | Colony · Crepuscular | Shy | Mirage Wax-Barrel | Freshly dug burrows expose buried copper seams and cool midday heat-shelters |
| `fa_14` | **Copper-Plate Roller** (*Lorica cupri*) | Scavenger · Terrestrial | Solitary · Nocturnal | Defensive | Copper Bloom, Cinder Mat | Curls into impervious heatproof metal sphere during ash storms; sheds collectible mineral scales cleanly |
| `fa_15` | **Star-Fin Shoal** (*Piscis lucis*) | Aquatic Herbivore | School · Diurnal | Passive | Star-Glass Coral, Buoy Kelp | Swirling luminous fish attracted to suit headlamp—illuminating shadowy reefs naturally |
| `fa_16` | **Tide-Singing Ray** (*Mobula caerulea*) | **Legendary Keystone** | Solitary · Diurnal | Majestic Passive | Star-Fin Shoal | Colossal luminous manta leaping during Blooming Tides; following its whale-like song uncovers submerged *Surveyor-01* buoy! |
| `fa_17` | **Storm-Crest Kite** (*Accipiter nimbus*) | Predator · Flying | Pair · Diurnal | Territorial | Snow-Vole, Arc-Shell Beetle | Drops armored Arc-Shell Beetles onto quartz ledges to crack them open; dive-warns near cliff nests |
| `fa_18` | **Rime-Puff Burrower** (*Microtus rimae*) | Burrower · Herbivore | Colony · Diurnal | Curious | Cushion-Moss, Ice-Lotus | Huddles around steaming polar springs in whiteouts—guiding lost players straight to thermal safety! |
| `fa_19` | **Choir Root-Weaver** (*Arachna synaptica*) | **Legendary Symbiote** | Colony · Nocturnal | Semi-Intelligent | Choir Root-Nerve, Echo Bat | Blind delicate tenders repairing subterranean neural roots; fiercely hostile if Mara damages roots, yet grant serene safe passage once she plays the Harmonic Greeting! |
| `fa_20` | **Cinder-Back Tortoise** (*Colossus calderae*) | **Legendary Non-Aggressive Hazard** | Solitary · Diurnal | Ancient Indifferent | Cinder-Bloom Mat | House-sized volcanic titan venting cooling steam clouds—Mara literally walks alongside its moving shade shadow to cross lethal Caldera radiation! |
