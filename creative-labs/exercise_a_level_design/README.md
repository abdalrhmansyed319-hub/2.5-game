# Exercise A — Level Design Laboratory (3 Contrasting Spatial Blockouts)

> **Training Notice**: Isolated, genre-agnostic spatial level design laboratory built strictly to demonstrate and evaluate level architecture principles. **Not** part of any actual game project.

---

## 1. Objective
Design, diagram, and critically evaluate **three distinct spatial level blockouts** using locked universal traversal metrics to demonstrate mastery of pacing, sightlines, silent visual guidance, *Kishōtenketsu* progression, loop/shortcut topology, risk/reward branching, and checkpoint placement.

## 2. Design Intent
Prove that spatial layout alone — before a single decorative sprite or line of dialogue exists — governs player curiosity, learning, emotional tension, and satisfaction. Each blockout tests a different spatial archetype:
- **Blockout A1 (Linear *Kishōtenketsu* Gauntlet)**: Teach one timing/traversal mechanic without a single word of tutorial text.
- **Blockout A2 (Hub-and-Spoke Exploration Loop)**: Guide organic non-linear curiosity using *Breath of the Wild*'s Triangle/Landmark rules and a gratifying one-way shortcut.
- **Blockout A3 (Vertical Shortcut Spire)**: Use vertical sightlines and stacked risk/reward ledges to create anticipation and earned checkpoint relief.

## 3. Research
- **Koichi Hayashida (*Super Mario 3D World*)**: 4-step *Kishōtenketsu* escalation (*Ki* safe intro -> *Shō* development -> *Ten* twist -> *Ketsu* payoff).
- **Fujibayashi & Yonezu (*Breath of the Wild*, CEDEC 2017)**: 3-scale Triangle Rule & Gravity Rule for landmark-driven navigation.
- **Kevin Lynch (*The Image of the City*)**: Paths, edges, districts, nodes, and landmarks enabling effortless mental mapping.
- **Technical Phase 1 Constraints**: `TileMapLayer` grid (`16×16 px`), `Camera2D` logical viewport (`20 × 12` tiles = `320×192 px`), `CharacterBody2D` metrics (`1 × 2` tiles actor, `4.5`-tile max jump height, `6`-tile horizontal jump reach).

## 4. Creative Decisions

### Locked Universal Metrics (Applied to All 3 Blockouts)
| Metric | Value (Tiles) | Design Rationale |
| --- | --- | --- |
| Actor Footprint | `1 W × 2 H` | Clean `3`-tile minimum doorway clearance (`1.5×` actor height) |
| Safe Jump Gap / Max Jump Gap | `3–4` / `5.5` tiles | Leaves `0.5`-tile forgiveness margin below physical limit |
| Standard Ledge Step / Max Ledge | `2–3` / `4` tiles | Comfortable rhythm without pixel-perfect apex frustration |
| Camera Visible Window | `20 W × 12 H` tiles | Every hazard & landing ledge must enter sightline **before** commitment |

---

### Blockout A1 — Linear *Kishōtenketsu* Gauntlet (4-Beat Teaching Spine)
*Mechanic under test (abstract)*: **Timed Collapsing Bridge Tiles (`=`)** that drop 0.6s after contact and regenerate after 2.0s.

```text
  [ACT 1: KI - SAFE]     [ACT 2: SHO - DEV]      [ACT 3: TEN - TWIST]         [ACT 4: KETSU - PAYOFF]
  (Floor underneath!)    (Pit hazard + rhythm)   (Bridge + Moving Plat <->)   (Mastery Sprint + Vista)
                                                                                 *Opt Secret*
  ###################    ####################    #########################    ######################
  #                 #    #                  #    #        <--[M]-->      #    #     (O)            #
  # S  ===  ===  C1 #--->  C1  ===   ===  C2 #--->  C2  ===     ===   C3 #--->  C3 === === === [E] #
  # ############### #    # ###     #     ### #    # ###             ### #    # ###             ### #
  # # SAFE FLOOR! # #    # #  XXXXX#XXXXX  # #    # # XXXXXXXXXXXXXXX # #    # # XXXXXXXXXXXXXXX # #
  ###################    ####################    #########################    ######################
  Legend: S=Start  ===:Collapsing Tile  C1..C3=Checkpoints  [M]=Moving Platform  X=Hazard  (O)=Optional Risk Reward  [E]=Exit Vista
```
- **Beat 1 (*Ki*)**: Solid floor 2 tiles directly beneath `===`. Falling costs **zero HP**, teaches drop timing + visual shake + audio crackle + regeneration safely.
- **Beat 2 (*Shō*)**: Pit hazard introduced with a clean 1-tile safe island midway; checkpoint `C1` immediately precedes hazard so retries take `< 1 second`.
- **Beat 3 (*Ten*)**: Combines collapsing bridge with a timed `AnimatableBody2D` moving platform `[M]` — player must sync jump takeoff instead of blindly sprinting.
- **Beat 4 (*Ketsu*)**: Three-step rhythmic sprint chain with an optional upper branch `(O)` reachable only by jumping early off the middle bridge (high-risk mastery reward), immediately opening into Exit Vista `[E]` (decompression beat).

---

### Blockout A2 — Hub-and-Spoke Exploration Loop (Silent Sightlines & Shortcut Reveal)
```text
                         [NORTH OVERLOOK: Locked Monument Gate (L)]
                                   ▲               ▲
                      (Shortcut    │               │  (Visible through
                       Door [D]!)  │               │   grate from Hub!)
  [WEST WING: Tight]  ┌────────────┴──┐   ┌────────┴────────────┐  [EAST WING: Open]
  [Chambers & Switch] │   [LOCKED     │   │  Elevated Gallery   │  [Patrol & Key   ]
  [  (S1) -----> ]────┤   GRATE]      │   │  -> Drops to Hub!   ├───► (K) Risk Alcove
                      │               │   └────────┬────────────┘
                      │  CENTRAL HUB  │            │ (One-Way Drop!)
                      │  [Landmark    │◄───────────┘
                      │   Fountain]   │
                      │   (Safe Rest) │
                      └───────▲───────┘
                              │ [Player Entry Sightline: sees Fountain + distant Gate (L)!]
```
- **Entry Composition**: Entering from south frames **Central Landmark Fountain** in the midground and **Locked Monument Gate (L)** straight north in the background (immediate visual goal with zero text).
- **Left vs. Right Contrast**: West Wing = enclosed rhythmic stealth/puzzle corridors leading to Switch `S1` that opens **Shortcut Door `[D]`** right beside the Hub. East Wing = brighter elevated gallery giving a clear downward sightline into the Hub before rewarding bold exploration `(K)` and dropping smoothly back via a one-way ledge.

---

### Blockout A3 — Vertical Shortcut Spire (Elevation Foreshadowing)
```text
   FLOOR 3 (Summit)    [C3] ───► Boss / Climax Terrace ───► [Elevator Lever (V)]
                        ▲                                           │
   FLOOR 2 (Mid-Tier)  [Climb Shaft: Narrow Ledges + Hazard]        │ (Unlocks direct
                        ▲                                           │  vertical lift
   FLOOR 1 (Lower)     [Intro Ledges] ──► [Locked Lift Gate (V)]◄───┘  straight to
                        ▲                      │                       Floor 1 Rest!)
   GROUND (Entry)      [S / C1 Safe Camp] ─────┘ (Player sees broken Lift on Minute 1!)
```
- **Emotional Arc**: On Minute 1 at Ground Camp `C1`, the player walks right past the locked Lift Gate `(V)` (curiosity planted). Climbing Floors 1 -> 2 -> 3 builds steady altitude tension (sawtooth pauses on wide landings). Pulling Lever `(V)` at Floor 3 drops the lift straight down into Ground Camp — turning a 4-minute ascent into a 4-second joyful shortcut!

## 5. Implementation Approach
- Designed directly against Phase 1's `TileMapLayer` grid (`16×16 px`) and `Lab 02` (`AdvancedMovementController2D` + `WaypointPlatform2D`) metrics so each blockout can drop straight into greybox `TileMapLayer` scenes without recalculating jump physics.
- Checkpoints (`C1`–`C3`) map cleanly to `Area2D` triggers persisting only lightweight checkpoint IDs via `Lab 07` (`SaveSystem`).

## 6. Testing
- **Metric Audit (Paper/Grid Verification)**: Checked all gap widths (`<= 4` tiles vs. `6`-tile max reach), ceiling clearances (`>= 3` tiles vs. `2`-tile actor height), and camera framing (`20×12` window fits Act 1 safe floor + Act 2 hazard telegraph before jump commit).
- **Live Playtest Status**: *Not executed in Godot runtime* (sandbox lacks Godot binary; paper/metric blockout verified only — real flow feel and timing require interactive greybox playtesting!).

## 7. Evaluation
- **Strengths**: Zero tutorial text required across all 3 blockouts; strong contrast in spatial pacing (horizontal rhythm vs. circular hub exploration vs. vertical climb-and-collapse); every checkpoint eliminates punitive walk-backs.
- **Weaknesses**: Paper blockouts cannot verify true kinetic timing feel (e.g., whether `0.6s` bridge collapse feels tense vs. unfair without live testing).

## 8. Problems
- Initial draft of Blockout A1 placed a lethal pit immediately under the first collapsing bridge — caught during *Kishōtenketsu* review (violated *"never kill a player with an unintroduced mechanic"*) and revised to include a 2-tile-deep safe floor beneath Beat 1.
- Initial draft of Blockout A2 lacked a clear sightline to the North Gate from entry; opened the central north archway sightline so the primary macro goal reads in frame 1.

## 9. Improvements
- Convert all 3 ASCII blockouts into playable greybox `.tscn` levels inside Godot `4.7+` using neutral collision tiles and record playtester heatmaps (death locations, pause spots, camera dwell times).
- Add a 2-minute traversal timing check on Blockout A3 to confirm the Floor 1 -> 3 climb doesn't overstay its welcome before unlocking the lift.

## 10. Final Assessment
Demonstrates rigorous spatial design methodology (metrics-first, silent sightlines, *Kishōtenketsu*, loop shortcuts, checkpoint fairness). Ready for greybox execution once a Godot runtime and actual project movement metrics exist.
