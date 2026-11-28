# Deliverable F — Biome Encyclopedia and Ecological Distribution Framework

> **Verified Data Source**: Backed by [`docs/concept/data/biomes.json`](data/biomes.json), validated via `tools/ecology_validator.py` (`12/12` reachable, `0` errors), color-audited via `tools/palette_director.py` (`12/12` `[PASS]`), and plotted in [`visuals/world_biome_climate_map.png`](visuals/world_biome_climate_map.png) & [`visuals/biome_palette_master_sheet.png`](visuals/biome_palette_master_sheet.png).  
> **Revision Note (Pre-Production Lock — see [`DDL-007` / `DDL-008`](24-design-decision-log.md))**: Reconciled `biomes.json` math cleanly (`12` Core Biomes + `24` Distinct Sub-Biomes = `36` Named Environmental Identities + `1` Subterranean Transition Connector Hub) with strict anti-reskin criteria, and redesigned Biome #08 (*Bioluminescent Lagoon & Tidal Reef*) to play natively in **Oblique 3/4 Top-Down** via Buoyancy Skiff + Twin-Moon Low-Tide drained reef-basins rather than requiring a redundant full underwater diving engine!

---

## 1. Solving the "36 Biome Identities" Ambition Honestly: Strict 3-Layer Taxonomy

Creating 36 completely disconnected master tilesets would collapse indie production, while recoloring dirt patches would cheapen exploration. Instead, Oura-IV achieves **36 Named Environmental Identities** cleanly and transparently:
- **12 Independent Core Biomes**: Each possesses a bespoke master tileset, unique 5-band color script, distinct atmospheric/hazard rule, signature silhouette architecture, and dedicated ambient audio stem.
- **24 Distinct Sub-Biomes** (`2` per Core Biome): Share their parent biome's base terrain kit while strictly requiring **(a) a distinct micro-elevation or lighting/fog rule**, **(b) unique hero landmark silhouettes**, and **(c) at least ONE exclusive ecological or traversal mechanic** (never cosmetic tint swaps!).
- **1 Cross-Regional Subterranean Connector Hub (*Piezoelectric Geode Vaults*)**: Unlocks mid-game to stitch distant coastal, alpine, subterranean, and caldera routes into a cohesive interconnected world map (tracked separately from the 36 environmental identities so counts never inflate!).

---

## 2. Complete 12-Core-Biome (+24 Sub-Biomes) Encyclopedia

| # | Core Biome *(Macro-Region)* | Tier | Climate (`Temp / Moist`) | Nested Sub-Biomes (24 Total) | Atmospheric Condition | Signature Resources | Exploration & Ecological Hook |
| --- | --- | :---: | --- | --- | --- | --- | --- |
| **01** | **Amber Kelp Littoral** *(Sunken Rimlands)* | T1 | `19°C / 85%` | *Tidal Mirror Flats*, *Drift-Wreck Cove* | Safe temperate air | Amber Agar, Salt Silicate, Hull Alloy | Crash-landing zone; Twin-Moon low tides expose submerged *Meridian* wreckage & shimmering reflection pools |
| **02** | **Singing Reedwood Canopy** *(Sunken Rimlands)* | T1 | `21°C / 72%` | *Hollow Flute Groves*, *Sun-Dappled Glades* | Periodic mild pollen | Resonant Reed, Amber Sap, Fibrous Bast | Towering hollow trees sing wind chords that warn 60s before storms; peaceful starter discovery sanctuary |
| **03** | **Vitreous Fen & Bog** *(Lowland Basin)* | T2 | `24°C / 96%` | *Lantern Mire*, *Sunken Root Catacombs* | Low-lying Acid Mist | Filter Lichen, Bio-Sulfur, Peat Resin | Steaming wetlands bridged by root-arches; stay elevated or craft Breath-Sponge filter; ambush lurkers in fog |
| **04** | **Vesper Fungal Jungle** *(Lowland Basin)* | T2 | `26°C / 88%` | *Spore-Fall Ravine*, *Parasite Crown* | Neuro-Spore Rain | Mycelial Filament, Luminous Cap, Alkaloid Nectar | Perpetual bioluminescent twilight under colossal umbrella-fungi; shelter under caps during spore-rain |
| **05** | **Steppe of Wind-Carved Basalt** *(Highland Divide)* | T2 | `16°C / 42%` | *Grass-Sea Plains*, *Whispering Monoliths* | Gusting Crosswinds | Piezo-Basalt, Wind-Grain, Iron Nodule | Sweeping hexagonal cliffs & shimmering grass waves; migratory Horn-Beast herds & first *Surveyor-01* clues |
| **06** | **Ochre Salt-Canyon Desert** *(Sun-Scoured Rift)* | T3 | `41°C / 14%` | *Fulgerite Dunes*, *Dry Riverbed Fossils* | Midday Heat Radiation | Fulgerite Glass, Copper Salts, Desert Wax | Blistering canyon labyrinth cooled at twilight; follow Glass-Skink shade tunnels & harvest storm-triggered copper blooms |
| **07** | **Pelagic Coral Archipelago** *(Azure Sea)* | T3 | `22°C / 92%` | *Floating Atoll Rings*, *Sunken Monolith Shoals* | Syzygy Tidal Surges | Buoy Bladders, Pearl Chitin, Brine Crystal | Island chain traversed via buoyancy skiff & living kelp-raft bridges that rise/sink with twin-moon tides |
| **08** | **Bioluminescent Lagoon & Tidal Reef** *(Azure Sea)* | T3 | `11°C / 100%` | *Glass-Water Kelp Drop*, *Drained Thermal Reef-Basins* | Tidal Vapor Surge | Pressure Gel, Vent Titanium, Lumen Coral | **Oblique 3/4 Aquatic Innovation**: Glide by Buoyancy Skiff over transparent glowing reefs at High Tide; walk directly across drained terraced coral boardwalks & bubbling reef vents during **Twin-Moon Low Tide**! *Tide-Singing Ray* habitat |
| **09** | **Resonant Quartz Peaks** *(Highland Divide)* | T3 | `2°C / 48%` | *Cloud-Bridge Ridges*, *Piezoelectric Spires* | Thin Air + Lightning | Resonant Quartz, Alpine Moss, Capacitor Ore | High alpine ridges pierced by glowing crystal needles; shelter beside Grounding Storm-Ferns; **Primary Relay Array site!** |
| **10** | **Rime-Glass Tundra & Glacier** *(Polar Crown)* | T4 | `-18°C / 55%` | *Aurora Ice Shelves*, *Geothermal Oases* | Severe Hypothermia | Cryo-Enzyme, Superconductor Vein, Glacial Amber | Aurora-lit ice expanses punctuated by warm steaming springs; **Aurora Ice-Lotus** blooms ONLY during magnetic whiteouts! |
| **11** | **Deep Mycelial & Crystal Caverns** *(Subterranean Choir)* | T3 | `14°C / 80%` | *Echoing Dripstone Halls*, *Root-Nerve Nexus* (+ *Geode Vaults* Hub) | Darkness + Spores | Neural Hyphae, Echo Mineral, Cave Silkworm Thread | Subterranean continent-linking cathedral where glowing root-nerves carry visible light waves; guarded by Choir Root-Weavers |
| **12** | **The Blighted Caldera** *(Sun-Scoured Rift)* | T4 | `48°C / 25%` | *Obsidian Glass Flows*, *Surveyor-01 Wreck Core* | Radiation + Sulfur | Reactor Core Cell, Obsidian Prism, Thermo-Bacterium | Dramatic climax scar where leaking corporate catalyst petrifies living roots; walk in the shade of *Cinder-Back Tortoise*! |

---

## 3. Ecological Distribution Logic (Zero Random Placement!)
Every chunk evaluates **5 ecological parameters** before placing a single organism (proven in `tools/world_chunk_simulator.py`):
1. **Elevation Stratum** (`submerged`, `shallow_water`, `littoral_sand`, `lowland_meadow`, `ridge_cliff`, `subterranean`, `alpine`).
2. **Moisture & Proximity to Water** (riverbanks & tidal edges generate rich riparian bands automatically).
3. **Hero Landmark Protection Mask** (`0` procedural spawns inside hand-painted hero vistas!).
4. **Poisson-Disc Species Spacing Layers** (separate spacing layers for canopy trees, understory shrubs/ground cover, and roaming wildlife so flora frames clear sightlines without choking walkable corridors!).
5. **Micro-Climate & Weather Triggers** (certain rare plants spawn or open *only* near geothermal vents, inside shaded canyons, or following Ion Tempests / Aurora Whiteouts).
