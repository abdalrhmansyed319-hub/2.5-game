# 03 — Professional Level Design

> **Technical Bridge (Phase 1)**: Connects to [`KB-01 Godot Architecture`](../knowledge-base/01-godot-engine-architecture.md), [`KB-06 TileMap & Environment`](../knowledge-base/06-tilemap-and-environment-engineering.md), and [`Exercise A Level Design Lab`](../../creative-labs/exercise_a_level_design/README.md).  
> **Scope**: Spatial composition, sightlines & landmarks, navigation without UI crutches, Kishōtenketsu progression, loop/shortcut topologies, checkpoint psychology, environmental storytelling, and the 12-step professional greybox workflow.

---

## 1. Level Design Is Applied Spatial Psychology

A level is not a pretty diorama with enemies sprinkled inside. A level is a **spatial instrument** that orchestrates player perception, curiosity, rhythm, decision-making, learning, and emotion.

### Fundamental Spatial Vocabulary
- **Metrics First (The Holy Rule of Layout)**: Before placing a single wall, lock **character dimensions and traversal metrics** (actor width/height, normal jump height & horizontal reach, dash distance, door clearance, camera visible viewport width/height). Every gap, ledge, corridor, and sightline derives mathematically from those metrics!
- **Spatial Hierarchy & Framing (Weenie / Landmark Design)**:
  - **Primary Landmarks (Macro)**: Towering, unmistakable silhouettes visible from across a region (anchored to Kevin Lynch's *Image of the City* principles — paths, edges, districts, nodes, landmarks).
  - **Secondary Landmarks (Meso)**: Distinctive bridges, statues, lit archways, or color-coded shrines anchoring a sub-area so the player builds an effortless mental map without opening a menu.
  - **Sightlines & Framing**: Compose doorways, arches, and gaps to frame upcoming objectives or intriguing secrets the instant a player enters a space. Use *Breath of the Wild*'s **Triangle Rule** (large triangles orient, medium triangles obscure to spark surprise and offer "over or around" choices, small triangles modulate traversal rhythm).

---

## 2. Silent Guidance (Leading Players Without Arrows or Pop-Ups)

Guide attention organically using layered environmental signposting:
1. **Lighting & Value Contrast**: The human eye snaps automatically to the highest-contrast or warmest/brightest focal area (e.g., sunlit doorway at the end of a cool shadowed corridor).
2. **Leading Lines**: Cables, water channels, floor trim, banner rows, rails, cracked stone paths, and architectural ribs naturally pull the eye toward exits or interactables.
3. **Affordance & Visual Language Consistency**: Establish consistent material/color rules early (e.g., worn paint/chalk marks climbable ledges; cracked masonry indicates breakable walls; specific lamp color marks safe checkpoints) and **never violate your own visual rules**.
4. **Breadcrumbs & Motion**: Trails of minor pickups, fluttering cloth, drifting embers, escaping dust, or a patrolling figure seen briefly through a grate draw curiosity naturally.
5. **Negative Space & Composition**: Clear the silhouette around critical doors, switches, and hazards — never bury an interactive lever inside decorative clutter.

---

## 3. Spatial Topologies & Route Architecture

| Topology | Characteristics | Best Used For | Core Risk to Mitigate |
| --- | --- | --- | --- |
| **Linear / Directed Spine** | Controlled beat-by-beat pacing, strong authored sightlines | Teaching arcs, dramatic set-pieces, tight platforming gauntlets | Can feel claustrophobic or railroaded -> add micro-branches & visual vistas |
| **Branching / Loops with Shortcuts** | Main path splits into risk/reward side routes that loop back via one-way unlocked shortcuts | Action-adventure, dungeon spaces, souls-like regions | Getting lost or tedious backtracking -> strong landmarks & gratifying shortcut reveals |
| **Hub-and-Spoke** | Central safe/social hub radiating into distinct thematic wings that later interconnect | Metroidvanias, quest hubs, chapter-based exploration | Repetitive hub crossings -> evolve hub state over time & unlock fast transit/shortcuts |
| **Open Field / Sandbox Nodes** | Multi-approach points of interest visible across open sightlines | Exploration-forward worlds, emergent systemic play | Aimless flat emptiness -> apply Gravity Rule (visible POI density every 20–40 seconds of travel) |

### Critical Path vs. Optional Paths & Secrets
- **Critical Path**: Readable, fair, rhythmically paced; never depends on obscure pixel-hunting to progress.
- **Optional Side Routes**: Higher skill challenge, curiosity payoff, lore, shortcuts, or alternate tactical flanks (e.g., stealth high ground vs. direct brawler entrance).
- **Fair Secrets**: Every secret must have at least **one subtle diegetic tell** (a slightly mismatched masonry seam, faint wind particles, unusual audio hum, a visible ledge from an adjacent room) so observant players feel clever, not lucky.

---

## 4. Level Progression: Teaching Through Space (*Kishōtenketsu*)

Adopted by Koichi Hayashida (*Super Mario 3D World*) and rooted in classic 4-act structure:

1. **Ki — Introduction (Safe Sandbox)**: Present one new mechanic or hazard in an environment where failure is impossible or completely non-lethal. Let the player experiment and observe cause-and-effect firsthand.
2. **Shō — Development (Applied Challenge)**: Require the mechanic across escalating layouts with real stakes (gaps, timing, light enemy interference) while keeping the mechanic as the clear focus.
3. **Ten — Twist (Subversion or Synthesis)**: Combine the new mechanic with an *earlier* familiar mechanic, invert an assumption, or add a dynamic pressure constraint — creating an unforgettable "aha!" escalation.
4. **Ketsu — Conclusion (Mastery Climax & Release)**: A climactic mastery test followed immediately by a clear reward, vista, or safe decompression space.

> **Golden Teaching Rule**: *Never kill a player with a rule they haven't safely witnessed at least once.*

---

## 5. Pacing, Encounter Rhythm, and Checkpoint Placement

- **Alternate Modalities**: Rotate traversal, combat/tension, puzzles/observation, discovery, and calm decompression so no single cognitive muscle fatigues.
- **Checkpoint Placement Psychology**:
  - Place checkpoints immediately **before** high-stakes skill tests or boss arenas (eliminating punitive 90-second filler walks) and **after** major victories/cutscenes.
  - Never trigger a checkpoint mid-hazard or in an unwinnable low-health/no-ammo trap state!
  - In risk/reward designs (e.g., bonfire/bench loops), place shortcuts that fold a 5-minute trek into a 15-second run-back once earned.

---

## 6. Environmental Storytelling in Level Design

Build rooms that answer *"Who built this? What happened here? What changed since?"* without text boxes:
- **Architectural Purpose**: Spaces should look plausibly built for their in-world inhabitants first, then adapted by gameplay (doors lead somewhere logical; storage rooms sit near docks; guardhouses overlook chokepoints).
- **Micro-Vignettes (3-Part Clues)**: Place prop clusters telling a complete micro-story (e.g., hastily stacked barricade + dropped lantern + claw/scorch marks on the *inside* of the door -> they weren't keeping something out; something broke out).
- **Before/After Contrasts**: Show an intact version of a structure early so encountering a collapsed, flooded, or overgrown version later carries instant emotional weight.

---

## 7. Mandatory 12-Step Professional Level Design Workflow

1. **Define Intended Player Experience** (Target emotion, pacing curve, core fantasy).
2. **Identify Gameplay Objectives** (Mechanics taught, tested, twisted; key player verbs).
3. **Establish Spatial Layout** (2D bubble diagram / top-down paper map showing rooms, loops, elevation).
4. **Map Primary & Optional Routes** (Critical path, shortcuts, flanking routes, secrets).
5. **Chart Challenge & Pacing Progression** (Sawtooth tension graph + rest beats + checkpoint placements).
6. **Identify Environmental Storytelling Beats** (Landmarks, vistas, 3-part prop vignettes).
7. **Audit Required Assets Against Real Inventory** (Confirm what exists vs. what needs authoring/substitution).
8. **Build Pure Greybox Blockout** (Plain collision shapes/neutral grid tiles — ZERO art decoration!).
9. **Playtest Navigation, Metrics & Pacing** (Verify sightlines, jump distances, camera framing, dead ends, flow time).
10. **Iterate Layout ruthlessly** (Moving a wall in greybox takes 10 seconds; moving a dressed environment takes 10 hours!).
11. **Integrate Art, Lighting, Audio & Polish Pass** (Preserve greybox readability and collision metrics strictly!).
12. **Playtest with Fresh Eyes & Iterate** (Watch where testers hesitate, look away, miss cues, or lose flow).
