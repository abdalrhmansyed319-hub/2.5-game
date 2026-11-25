# 07 — Character Design and Animation Direction

> **Technical Bridge (Phase 1)**: Connects to [`KB-04 Animation Systems`](../knowledge-base/04-animation-systems.md), [`KB-03 Physics & Movement`](../knowledge-base/03-physics-and-movement-systems.md), and [`KB-05 Rendering & Shaders`](../knowledge-base/05-rendering-and-shaders.md).  
> **Scope**: Silhouette & shape readability, proportions & visual identity, functional costume/prop cues, animation timing & Disney principles in games, state clarity, and coupling animation direction to gameplay feel.

---

## 1. Character Design: Instant Silhouette & Gameplay Readability

In a well-designed game, a player should recognize **who a character is, whether they are friend or foe, and roughly what threat/role they pose within 200 milliseconds** — even as a pure black silhouette!

### Four Pillars of Game Character Design
1. **Unmistakable Silhouette**:
   - Exaggerate distinguishing profile markers (headgear, cloak, weapon profile, posture, limb proportions) so no two distinct enemy archetypes share an ambiguous outline at gameplay camera distance.
   - Maintain **negative space** around limbs and weapons so poses read clearly in motion rather than collapsing into a solid blob.
2. **Proportion & Scale as Role Communication**:
   - *Small / Compact / Quick*: Low HP, agile, swarm or evasive archetype.
   - *Broad / Top-Heavy / Square*: Armored, slow, high-impact melee or defensive anchor.
   - *Tall / Angular / Elongated*: Ranged, caster, fragile glass-cannon, or eerie boss presence.
   - **Protagonist Privilege**: The player character must maintain the clearest, highest-contrast silhouette against every biome's background palette (e.g., bright scarf/cape/headband/trim that reads cleanly in both dark caverns and sunlit plazas).
3. **Color Identity & Focal Points**:
   - Concentrate visual contrast near the **head/face, weapon/hands, and core torso** — the exact spots players watch to anticipate actions and read emotion.
   - Give distinct factions or enemy tiers cohesive palette signatures (avoid lazy pure-hue recolors without silhouette/prop distinction whenever budget permits).
4. **Functional Visual Storytelling**:
   - Every strap, pouch, tool, wear mark, and posture shift should answer *what this character actually does in the world* (no meaningless decorative belts/spikes cluttering tiny sprites).

---

## 2. Animation Direction for Interactive Media (Not Film!)

Film animation prioritizes smooth realism; **game animation prioritizes instant responsiveness, clear state reading, and kinetic punch**:

### Adapting Classic Animation Principles to Games
| Principle | Interactive Game Application | Pitfall to Avoid |
| --- | --- | --- |
| **Anticipation** | Critical on *enemy* attacks (telegraphs giving fair reaction windows!) and *heavy* player moves. Keep *light* player actions snappy (`1–2` frames anticipation max) so controls never feel laggy! | Long 10-frame windups on basic player jump or light attack -> feels sluggish and broken |
| **Squash & Stretch** | Launch stretch on jump takeoff, compression squash on landing, recoil squash on impact (applied on visual pivot, never scaling collision shapes!) | Leaving characters permanently stretched or distorting pixel art unevenly |
| **Exaggeration & Smear Frames** | 1–2 frame weapon arc smears communicate blazing swing speed even at 12 FPS sprite animation | Too many blurry intermediate frames making swings look slow and noodle-like |
| **Staging & Clear Poses** | Hold the **extreme key pose** (contact/apex/guard) slightly longer than transition frames so the eye registers intent cleanly | Evenly spaced robotic frames with zero timing contrast ("floaty tweening") |
| **Follow-Through & Overlapping Action** | Capes, scarves, hair, antennae, and weapon tails lag 1–2 frames behind torso stops — adds tremendous life to idle and movement transitions | Rigid statue stops where every part freezes on the same frame |

---

## 3. Core Character Animation State Vocabulary

Every playable actor and interactive enemy benefits from clear, visually distinct states aligned 1:1 with the gameplay FSM (`KB-04`, `Lab 04`):
- **Idle (Breathing / Personality)**: Subtle rhythm showing character disposition (alert fighter bounce vs. weary slump vs. curious look-around).
- **Locomotion (Start -> Loop -> Turn/Skid -> Stop)**: Even a 1–2 frame turn-skid or stop-settle makes movement feel vastly more physical than snapping straight from Run to Idle!
- **Airborne (Rise -> Apex Turnover -> Fall -> Land Recovery)**: Clear visual cue distinguishing rising momentum vs. falling momentum (e.g., arms/cloak trailing down vs. fluttering up) + brief non-blocking landing compression.
- **Action / Combat Triad (Windup Telegraph -> Active Strike/Smear -> Recovery Follow-Through)**: Must align strictly with gameplay active hitbox frames and cancel windows (`KB-04`).
- **Hit Reaction & Status States (Flinch, Stagger, Guard, Interact, Defeat)**: Distinct silhouettes so the player instantly knows when an enemy's armor broke or when an invulnerability window ended.

---

## 4. Facial Expressions & Personality at Any Scale

- **Small Pixel Sprites (16×16 – 32×32)**: Convey 90% of emotion through **posture, head tilt, eye blink/direction, and secondary props (cloak/ears/weapon droop)** rather than cramming unreadable 1-pixel mouths! Pair with expressive dialogue portraits when narrative detail is needed.
- **Large 2D / 3D Rigs**: Keep expression transitions crisp and synced with dialogue cadence, gameplay danger (bracing when low HP), and environmental curiosity (glancing toward nearby interactables!).
