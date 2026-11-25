# Deliverable G — Flora Design and Database Specification

> **Verified Data Source**: [`docs/concept/data/flora.json`](data/flora.json) — `24` Core Flora Species audited via `tools/ecology_validator.py` (`0` errors, `15` multi-biome species eligible for genuine mechanical ecotypes; `9` single-biome endemics kept unique).  
> **Revision Note (Pre-Production Lock — see [`DDL-009` / `DDL-013`](24-design-decision-log.md))**: Eliminated the earlier blanket `24 × 3–4 = 72–96` multiplier after our forensic audit revealed 9 flora archetypes inhabit only 1 biome! Replaced with **zero-inflation taxonomic definitions**, realistic v1.0 catalog counts (`24` Core Species + `18` Mechanical Multi-Biome Ecotypes = `42` catalog entries), repaired 3 orphan `animal_link` labels, and placed `fl_06_filter_lichen` at the safe wet *Singing Canopy / Fen Ecotone* border to prevent circular Tier-2 deadlocks!

---

## 1. Zero-Inflation Botanical Taxonomy (Explicit Definitions)

We **never** inflate species counts through palette swaps or cosmetic variation. Every botanical term has a strict engineering and artistic definition:

| Term | Exact Definition | Counted in Field Codex? | Shipping v1.0 Count |
| --- | --- | :---: | :---: |
| **Archetype / Core Species** | Unique botanical silhouette, bespoke sprite set & shader behavior, distinct ecological niche, and >= 2 mechanical roles. | **Yes (Primary Entry)** | **`24` Core Flora Species** *(Vertical Slice: `6`)* |
| **Mechanical Ecotype** | Climate-adapted regional morph of a **multi-biome Core Species ONLY** (combining a distinct sprite silhouette overlay — e.g., salt crust, frost rime, volcanic ash-shield — AND altered chemistry/weather yield). Single-biome endemics NEVER get fake ecotypes! | **Yes (Sub-Entry)** | **`18` Mechanical Ecotypes** *(across the 15 multi-biome species)* -> **`42` Total v1.0 Catalog Entries** |
| **Individual Variation** | Subtle scale (`±10%`), growth stage (budding/mature/wilted), or natural framing flip inside a chunk. | **NO (Never counted!)** | Visual richness only |

- **Long-Term Scaling Horizon**: Post-1.0 regional expansions expand cleanly via JSON toward **`48–72+` Core Flora Species** (and toward the long-term `200+` planetary atlas vision strictly where new habitats justify genuinely distinct biology!).

---

## 2. Canonical Flora JSON Schema (Godot `Resource`-Ready)
Every entry in `docs/concept/data/flora.json` maps 1:1 to a typed Godot `FloraSpeciesData extends Resource`:
- `id`, `scientific_name`, `common_name`, `category` (`tree`, `shrub`, `ground_cover`, `fungi`, `moss`, `aquatic_tree`, `aquatic_plant`, `carnivorous`, `parasitic`, `bioluminescent`, `resource_bearing`, `medicinal`, `defensive`, `rare`)
- `biomes[]`, `elevation_niches[]`, `moisture_range`, `edible`, `toxicity`, `resource`
- `weather_behavior` (real-time gameplay & animation state shift!)
- `animal_link` (verified trophic or behavioral partner!)
- `mechanic` (concrete player interaction / scientific synthesis value)
- `discovery_stages`: `[1: Visual Sketch -> 2: Live Sample/Behavior -> 3: Lab Synthesis Blueprint]`

---

## 3. Complete 24 Shipping v1 Flora Archetypes Showcase

| ID | Scientific & Common Name | Category | Biomes | Edible / Toxicity | Dynamic Weather Behavior | Ecological & Gameplay Role |
| --- | --- | --- | --- | --- | --- | --- |
| `fl_01` | *Macrophylla aurantia* — **Amber Tide-Kelp** | Aquatic Tree | Coast, Archipelago | Edible / None | Bends flat in gale | Primary early ration & agar gel; grazed by Stilt-Striders |
| `fl_02` | *Salicornia vitrea* — **Mirror Glasswort** | Ground Cover | Coast, Badlands | No / Mild Brine | Crystallizes in bright sun | Silica source for lenses; burrow camo for Mirror-Shell Crabs |
| `fl_03` | *Arundo sonoris* — **Singing Reedwood** | Tree | Singing Canopy | No / None | **Chimes loudly 60s before storms!** | Living storm warning + resonant antenna struts; Chime-Glider nests |
| `fl_04` | *Mellifera solaris* — **Sun-Drop Bulb** | Shrub | Canopy, Basalt | Edible / None | Closes petals at night | Daytime stamina buff & adhesive resin; pollinated by Prism Moths |
| `fl_05` | *Filix tenax* — **Cordage Frond** | Ground Cover | Canopy, Fen | No / None | Swells absorbing rain | Field rope & emergency shelter tarp; Moss-Back Grazer bedding |
| `fl_06` | *Pneuma lichenis* — **Breath-Sponge Lichen** | Moss | Fen, Jungle | No / None | Glows bright green in acid mist | **Key T2 unlock**: purifies acid mist for Suit Filter Mk1; Lichen-Newt symbiote |
| `fl_07` | *Nepenthes vocalis* — **Mimic Pitcher** | Carnivorous | Fen, Jungle | No / Digestive Acid | Opens wide in rain | Mimics moth/scanner chimes to lure prey; enzyme source for Acoustic Lure |
| `fl_08` | *Lucerna palustris* — **Bog Lantern Reed** | Bioluminescent | Fen | No / Mild Nausea | Brightens in thick fog | Natural diegetic navigation trail through foggy marshes; lamp resin |
| `fl_09` | *Fungus megacap* — **Vesper Umbrella-Tree** | Fungi | Fungal Jungle | No / Raw Neuro-Spore | Releases spore-rain on thunder | Physical rain/spore shelter canopy; bio-cable filament source |
| `fl_10` | *Campanula noctis* — **Lumen-Cap Bell** | Bioluminescent | Jungle, Caverns | Edible* / Raw Hallucinogen | Pulses in sync with Blooming Tide | Brewed into Night-Vision Tonic *after* lab analysis; Echo-Bat food |
| `fl_11` | *Parasita ferrum* — **Static Siphon-Vine** | Parasitic | Jungle, Peaks | No / Electrical Sting | Crackles visibly in Ion Storms | Drains suit charge if brushed; refined into Neuro-Static antidote |
| `fl_12` | *Gramen argenteum* — **Wind-Grain Grass** | Ground Cover | Basalt Terraces | Edible / None | Ripples showing wind direction | Tall stealth cover & dry trail ration; feeds Horn-Beast herds |
| `fl_13` | *Acanthus piezo* — **Snap-Burr Thistle** | Defensive | Basalt, Badlands | No / Barbed | Fires audible seed pods in dry wind | Natural acoustic tripwire deterring Rift-Hounds; iron nodule source |
| `fl_14` | *Cactoides cerifera* — **Mirage Wax-Barrel** | Resource-Bearing | Ochre Badlands | Edible / None | Sweats cooling wax at zenith noon | Desert hydration & heat-insulation balm; Sand-Skink water source |
| `fl_15` | *Cupriflora arida* — **Verdigris Salt-Bloom** | Rare | Badlands, Caldera | No / Heavy Metal | **Blooms ONLY after rare storms!** | Hyper-accumulates pure copper salts needed for Relay Array coils |
| `fl_16` | *Pneumatocystis pelagica* — **Float-Bladder Raft** | Aquatic Plant | Archipelago, Shelf | No / None | Rises with Twin-Moon high tide | Living walkways lifting to coastal cliffs; Buoyancy Skiff craft |
| `fl_17` | *Corallium astrum* — **Star-Glass Coral** | Bioluminescent | Abyssal Shelf | No / Stinging Tip | Shifts hue with ocean currents | Releases breathable underwater O2 bubble columns; reef lighting |
| `fl_18` | *Pteris fulminis* — **Grounding Storm-Fern** | Defensive | Quartz Peaks | No / None | **Safely grounds lightning strikes!** | Standing beneath saves Mara during Ion Tempests; Capacitor Ore craft |
| `fl_19` | *Bryum glaciale* — **Thermal Cushion-Moss** | Medicinal | Peaks, Glacier | Edible / None | Generates exothermic heat in blizzard | Brewed into Hypothermia Tea & thermal burn salve; Snow-Vole bedding |
| `fl_20` | *Nymphaea borealis* — **Aurora Ice-Lotus** | Rare | Cryo-Glacier | Edible / None | **Unfolds ONLY during Aurora Whiteouts!** | Rare superconductor coolant & cryo-enzyme needed for endgame array |
| `fl_21` | *Mycelia synaptica* — **Choir Root-Nerve** | Rare | Caverns, Jungle | No / None | Transmits light waves during Blooming Tide | Planetary neural conduit; story revelation & harmonic relay bridge |
| `fl_22` | *Sonobryum caverna* — **Whisper-Velvet Moss** | Moss | Mycelial Caverns | No / None | Dampens all footstep acoustics | Walking on it silences footsteps past predators; Acoustic Boot upgrade |
| `fl_23` | *Thermophila caldera* — **Cinder-Bloom Mat** | Medicinal | Caldera, Shelf | No / Raw Sulfur Burn | Thrives on volcanic ash fall | Extremophile culture needed to synthesize **Bio-Remediation Serum!** |
| `fl_24` | *Necromycota synthetica* — **Grey Catalyst Husk** | Parasitic (Synthetic) | Sulfur Caldera | No / High Radiation | Emits static interference storms | Invasive artificial blight from *Surveyor-01* repelling all native life |
