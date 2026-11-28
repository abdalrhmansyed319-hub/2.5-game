# Deliverable I — Survival and Gameplay Systems Design

> **Guiding Principle (`Phase 2 KB-09` + Critique Decision 4)**: **Zero tedious meter chores.** Every survival system must either *(a) create an exciting field decision*, *(b) connect organically to Xenobotany/Ecology*, or *(c) be ruthlessly cut!*  
> **Revision Note (Pre-Production Lock — see [`DDL-004` / `DDL-005`](24-design-decision-log.md))**: Added concrete **Tactile Field Self-Defense & Ethical Hunting Trade-Offs** (eliminating earlier hand-waving around cornered predators and emergency hunting) plus **4 Intrinsic Exploration Reward Pillars** so off-path wandering always pays off!

---

## 1. Survival System Triage (What We Keep, Reinvent, or Cut!)

| Candidate Mechanic | Studio Verdict | Design Rationale |
| --- | --- | --- |
| **Exertion Stamina & Botanical Rations** | **KEEP & ELEVATE** | Replaces nagging hunger/thirst timers! Running, climbing cliffs, swimming, and hauling samples burn short-term Stamina; eating **analyzed alien food & field teas** restores peak Stamina cap AND grants purposeful **biome adaptations** (Heat Balm, Cold Tea, Night-Vision Tonic, Anti-Static). Eating *unanalyzed* plants risks unpredictable nausea/buffs! |
| **Suit Environmental Envelope (Air / Thermal / Shield)** | **KEEP & ELEVATE** | Breathable air in Tier-1 Rimlands = calm, unhurried wonder! Entering extreme ecosystems (Acid Mist, Neuro-Spores, Ion Lightning, Blizzard Cold, Deep Reef Pressure, Caldera Radiation) drains the **Suit Envelope** cleanly—driving shelter-seeking, weather timing, and scientific suit upgrades. |
| **Situational Afflictions & Field Remedies** | **KEEP (SIMPLIFIED)** | 4 clear, readable biological states (*Spore Cough*, *Neuro-Static*, *Thermal Burn/Chill*, *Laceration*), never random invisible RNG diseases. Each has a crisp visual/audio cue and a biome-native botanical cure! |
| **Shelter & Portable Field Camp** | **KEEP (TACTILE)** | Pitching a compact collapsible **Field Tent / Synthesis Pack** (or ducking beneath Umbrella-Fungi / Reedwood Arches) shields Mara from violent storms, resets fatigue/afflictions, lets her brew botanical tonics, and lets her sketch/synthesize discoveries beside a warm camp lantern! |
| **Hydration / Water Purification** | **FOLD INTO BOTANICAL RATIONS** | Handled naturally through *desert hydration sources* (Mirage Wax-Barrel, purified rain-catchers at camp) rather than a separate annoying thirst countdown bar. |
| **Weapon/Tool Durability & Repair Grind** | **CUT COMPLETELY** | Breaking a scanner or climbing piton mid-expedition creates zero meaningful joy; tools rely on **rechargeable suit capacitor** (recharged passively by sun/camp/piezo crystals) instead! |
| **Punishing Sleep Deprivation Timer** | **CUT COMPLETELY** | Sleeping at camp is a **strategic player tool** (fast-forward past scorching noon or toxic fog, heal injuries, wait for nocturnal blooms!)—never a forced blur-screen punishment. |

---

## 2. Core Gameplay Loop (The 4-Beat Expedition Rhythm)

```text
  [1. PREPARE AT FIELD CAMP]           [2. EXPEDITION & OBSERVATION]
  Check storm forecast, brew 1–2       Traverse painterly landscapes, track fauna
  botanical rations, pack tools   ───► stealthily, listen with Acoustic Lens,
                                       shelter dynamically from weather
               ▲                                      │
               │                                      ▼
  [4. SYNTHESIZE & EXPAND REACH]       [3. SAMPLE, HARVEST & SURVIVE]
  Combine samples on Field Lab Board   Collect living clippings, audio chords,
  -> unlock bio-suit adaptations & ◄── minerals, wreck logs; evade/distract
  planetary Relay Array nodes!         predators with ecological tools
```

---

## 3. Movement, Controls & Non-Lethal Ecological Toolset
- **Responsive Oblique 3/4 Top-Down Feel (`Phase 1 Lab 02` + `Phase 2 Exercise D`)**:
  - Crisp 8-directional locomotion with smooth acceleration curves, subtle footstep dust/ripples, **Crouch/Stealth Walk** (suppresses footstep acoustic ring on Whisper-Moss/grass), **Sprint / Dodge-Step** (uses brief Stamina), **Ledge-Mantle / Cliff Grapple**, and **Shallow Wade / Rebreather Swim**.
  - Built-in player-favoring forgiveness: input buffering on mantle/interact, smooth corner sliding around trees/rocks (`move_and_slide` rounded capsule collider — zero frustrating pixel-snagging on foliage!).
- **Core Field Gear & Tactile Self-Defense Kit (Non-Firearm Agency — Never Helpless!)**:
  1. **Acoustic Field Lens**: Aimable directional scope visualizing sound waves, animal alertness rings, and scanning organisms at safe distance.
  2. **Botanical Clipping Knife & Pneumatic Core-Spike**: Dual-purpose geological/botanical tool that extracts plant clippings and crystal cores — AND serves as Mara's **desperate close-range defensive stagger** (pushing back a lunging *Reed-Fang Lurker* or *Rift-Hound* to create an escape window without turning the game into a sword brawler!).
  3. **Photonic Flash-Flare**: High-visibility defensive tool that blinds nocturnal *Canopy Dusk-Stalkers*, illuminates pitch-black cavern chasms, and marks cliff landmarks.
  4. **Harmonic Decoy & Repeller Chime**: Tossable acoustic resonator mimicking prey calls (lures ambush predators off choke points) or emitting startled-flock harmonics (breaks pack hunter encirclement cleanly!).
  5. **Sedative Bio-Dart Sampler** *(Earned Tier-2 Botany)*: Briefly tranquilizes large or aggressive wildlife for safe high-grade tissue swabs OR desperate survival harvest.
  6. **Collapsible Camp Pack & Buoyancy Skiff** *(T3)*: Mobile rest/synthesis shelter + inflatable kelp-bladder skiff for gliding across the Azure Sea & Tidal Lagoon.

### Ethical Hunting & Ecological Footprint (Natural Consequence, Zero Lecturing!)
- **Can Mara Hunt When Survival Demands It?** **Yes.** If caught far from rations or cornered repeatedly, Mara can tranquilize or trap small/medium herbivores (*Stilt-Strider*, *Moss-Grazer*) for high-calorie emergency field rations.
- **Why Non-Lethal Observation Remains Superior (Real Mechanical Trade-Off)**:
  1. *Data Quality*: Dead specimens yield only partial anatomical notes—never Tier-2 live behavioral/acoustic data needed for top-tier syntheses!
  2. *Living World Memory*: Killing an organism leaves an ecological alarm ripple—nearby herds/flocks stay skittish and flee Mara at double distance for `2–3` in-game days!
  3. *Accumulated Ecological Conduct*: Repeated destructive harvesting/killing quietly shifts Mara's world-state relationship with the **Choir Root-Weavers** and the planetary resonance finale (`DDL-003`)—without a single preachy popup or "Game Over" scold!

---

## 4. Four Intrinsic Exploration Rewards (Why Wander Beyond the Main Spine?)
1. **Interconnected World Shortcuts**: Discovering subterranean **Choir Root-Nerve Passages** and **Piezoelectric Geode Vault** links physically connects distant biomes, cutting cross-continental travel in half!
2. **Non-Mandatory Utility Synergies**: Optional discoveries unlock meaningful quality-of-life field mastery (faster `0.4s` Field Lens focus, wider Acoustic Spectrum range, quieter movement, extended ration buff duration, extra Camp Pack slots).
3. **Kaelen Voss's 7 Forensic Field Caches**: Hidden across scenic overlooks, dry canyons, and sunken shoals—rewarding curiosity with survival supplies, alternate blueprint shortcuts, and crucial *Surveyor-01* story revelations!
4. **Illustrated Field Codex & Evolving Drop-Pod Diorama**: Captured vista sketches enrich Mara's illustrated Journal, while recovered botanical clippings organically decorate and stock the Drop-Pod Clearing camp!
