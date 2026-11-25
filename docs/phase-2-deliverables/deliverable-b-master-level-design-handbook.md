# Deliverable B — Master Level Design Handbook

> **Foundation**: Synthesized from [`Creative KB-03`](../creative-knowledge-base/03-professional-level-design.md), [`Creative KB-13`](../creative-knowledge-base/13-professional-game-design-case-studies.md), and [`Exercise A`](../../creative-labs/exercise_a_level_design/README.md).  
> **Godot 4.7 Bridge**: [`Tech KB-06 TileMap & Environment`](../knowledge-base/06-tilemap-and-environment-engineering.md) & [`Lab 06`](../../labs/lab_06_tilemap_environment/README.md).

---

## 1. Core Level Design Law: Gameplay Structure Before Decoration
Never paint finished foliage, decals, or lighting onto an unverified floorplan. A level that is confusing or flat in neutral greybox blocks will remain confusing and flat after 40 hours of art polish!

## 2. Step Zero — Lock Traversal & Spatial Metrics First
Before placing a single wall, freeze a **Metrics Sheet** driven directly by the player controller (`CharacterBody2D/3D`):
- **Actor Footprint & Clearance**: Width, Height, Minimum Corridor Width (`>= 2×` actor width), Minimum Doorway Height (`>= 1.5×` actor height).
- **Traversal Envelope**: Comfortable Jump vs. Max Jump (leave `10–15%` forgiveness buffer on critical-path gaps), Dash/Climb reach, Ledge-Step height.
- **Interaction & Combat Range**: Melee swing arc, Projectile sightline range, Aggro detection radius.
- **Camera Viewport Window**: Exact tile dimensions visible simultaneously (e.g., `20 × 12` tiles) — guarantees every lethal hazard and landing ledge enters sightlines *before* the player commits!

## 3. Silent Visual Guidance Toolkit (Navigate Without Text)
1. **Lighting & Luminance Contrast**: Brighter openings, warm torches, and skylight shafts naturally pull human attention out of shaded rooms.
2. **Leading Architectural Lines**: Floor paving strips, pipe runs, wall trim, railings, and flowing water direct the eye effortlessly along the critical path.
3. **Kevin Lynch's 5 Urban Elements**: *Paths* (routes), *Edges* (hard boundaries), *Districts* (regional motifs), *Nodes* (hubs/intersections), and *Landmarks* (tall/distinct orientation anchors).
4. **The Triangle & Gravity Rules (*Breath of the Wild*)**: Large distant landmarks orient macro travel; medium terrain screens obscure what lies ahead to spark curiosity (*"go over or around?"*); visually ranked POIs create organic pull without GPS arrows.
5. **Breadcrumbing & Denial**: Place small breadcrumbs (pickups, lit props, worn tracks) inviting curiosity; use unmistakable visual denial (solid iron grates, sheer cliffs) to communicate boundaries honestly.

## 4. Spatial Topologies & When to Choose Each
| Topology | Best Emotional Rhythm | Watch-Out Anti-Pattern |
| --- | --- | --- |
| **Linear Spine (with micro-branches)** | Tight narrative pacing & *Kishōtenketsu* teaching (*Mario 3D World*, *HL2*) | Hallway fatigue if zero sightline variety or breathing pockets exist |
| **Hub-and-Spoke** | Safe home decompression + self-directed mission choice | Disconnected feeling unless wings visually overlook or unlock shortcuts into the Hub |
| **Interconnected Loops & One-Way Shortcuts** | Satisfying world mastery & "aha!" mental-map collapse (*Hollow Knight*, *Souls*) | Tedious backtracking if shortcuts open too late or lack recognizable landmarks |
| **Vertical Spire / Layered Elevation** | Escalating stakes & early foreshadowing of upper/lower destinations | Blind downward drops onto hazards without camera look-down or safe ledges! |

## 5. Pacing & Teaching Blueprint
- **4-Act *Kishōtenketsu* Progression**:
  1. *Ki (Safe Intro)*: Zero-death room proving how the new mechanic works.
  2. *Shō (Development)*: Real challenge applying the mechanic cleanly.
  3. *Ten (Twist)*: Combine the mechanic with an existing system or subvert rhythm.
  4. *Ketsu (Payoff)*: Climactic mastery test + optional risk/reward branch + immediate decompression vista.
- **Sawtooth Intensity Curve**: Alternate **Tension Beats** (tight geometry, active threats, timing pressure) with **Decompression Beats** (wider safe space, calm vista, checkpoint, environmental storytelling) so adrenaline never numbs out.
- **Fair Checkpoints**: Place checkpoints **immediately before** high-risk tests (never forcing boring 60-second empty hallway walk-backs after every attempt!).

## 6. 12-Step Production Level Workflow
1. Define 1-sentence **Room/Level Intent** & emotional beat.
2. Confirm **Metrics Sheet** & available Asset Kit (`Deliverable D`).
3. Sketch **2D Flow Topology** (critical path, loops, shortcuts, sightlines, rest nodes).
4. Plot **Intensity & Teaching Curve** (*Kishōtenketsu* beats).
5. Build **Neutral Greybox** (`TileMapLayer` collision + untextured placeholders).
6. **Playtest Greybox Solo & Blind** (watch pauses, missed jumps, blind deaths, dead zones).
7. Iterate spatial layout until navigation feels effortless with **zero HUD arrows**.
8. Place **Checkpoints, Encounters, Triggers, and Camera Zones** (`CameraDirector2D`).
9. Apply **Base Structural Tile Art** (checking seams, inner corners, wall thickness).
10. Layer **Secondary Storytelling Props & Lighting** (strict 5-Band readability check!).
11. Layer **Regional Soundscapes, Surface Footsteps, and Reverb Triggers**.
12. Final **Squint Test, Collision/Softlock Pass, & Frame-Time Audit**.
