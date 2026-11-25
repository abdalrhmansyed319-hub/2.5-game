# 13 — Professional Game Design Case Studies

> **Methodology**: Every case study below explicitly separates **Verified Facts** (grounded in documented developer talks, published interviews, and primary postmortems) from **Design Analysis & Transferable Principles** (our professional engineering/design synthesis). Never imitate surface aesthetics blindly — extract the underlying structural principle.

---

## Case Study 1 — *Celeste* (Extremely OK Games): Forgiveness Inside High Difficulty

### Verified Facts (Maddy Thorson, 2020 Developer Thread & Interviews)
- Maddy Thorson publicly documented 10 deliberate game-feel "fudge" mechanics built into *Celeste*, including:
  1. **Coyote time** (jumping shortly after leaving a ledge).
  2. **Jump buffering** (registering jump pressed shortly before touching ground to jump on exact landing frame).
  3. **Half-gravity at jump apex** (extending hang time and fine landing control near peak vertical velocity).
  4. **Jump corner correction** (nudging Madeline horizontally around ceiling corners on slight head-clips instead of killing upward momentum).
  5. **Lift momentum storage** (persisting moving-platform launch momentum for several frames even after a lift stops).
  6. **Generous wall-kick grace distance** (2 pixels off a wall at 320×180 logical resolution).
- Thorson explicitly articulated the philosophy: *"All are centered around widening timing/positioning windows, so that everything is fudged a tiny bit in the player's favor. I think this is a big reason why Celeste can feel kind even though it's very difficult — it wants you to succeed."*

### Design Analysis & Transferable Principles
- **Principle**: High challenge feels *fair and empowering* rather than cruel when controls are micro-tuned to interpret player *intent* generously and failure turnaround is instantaneous (~1 second per single-screen room).
- **Ludo-Narrative Integration**: The punishing-yet-empathetic loop (paired with an unpatronizing Assist Mode) directly mirrors the story's themes of perseverance and self-compassion.
- **Godot 4.7 Bridge**: Implemented directly in `Lab 02` (`AdvancedMovementController2D`) and expanded in `Exercise D` (`FeelSandboxController2D`).

---

## Case Study 2 — *Super Mario 3D World* (Nintendo): 4-Step *Kishōtenketsu* Teaching

### Verified Facts (Koichi Hayashida Interviews; Documented via Mark Brown / GMTK & Eurogamer)
- Director Koichi Hayashida explicitly confirmed that *Super Mario 3D World* stages follow the classical East Asian 4-part narrative structure ***Kishōtenketsu***:
  1. **Ki (Introduction)**: Present one new mechanic in a safe setting where failure is non-lethal or immediately recoverable.
  2. **Shō (Development)**: Escalate the mechanic into real spatial challenges.
  3. **Ten (Twist)**: Subvert expectations or combine the mechanic with another familiar element/hazard.
  4. **Ketsu (Conclusion)**: Deliver a climactic mastery payoff (flagpole/exit/optional collectible challenge).

### Design Analysis & Transferable Principles
- **Principle**: You rarely need text tutorial pop-ups when spatial layout itself conducts a 4-beat lesson. *"A hazard never kills a player who has not first met it safely."*
- **Caution / Tradeoff**: Applying *Kishōtenketsu* rigidly to every single room across an exploration-heavy open world can feel overly formulaic; treat it as a modular teaching rhythm inside individual set-pieces, dungeons, or mechanic introductions.
- **Creative Lab Bridge**: Applied structurally in `Exercise A` (Blockout 1: Linear Kishōtenketsu Gauntlet).

---

## Case Study 3 — *The Legend of Zelda: Breath of the Wild* (Nintendo): Triangle & Gravity Rules

### Verified Facts (Hidemaro Fujibayashi & Makoto Yonezu, CEDEC 2017 Presentation)
- Nintendo's field level designers documented two structural open-world tools:
  1. **The Triangle Rule at Three Scales**:
     - *Large triangles* act as distant orientation landmarks (drawing on urbanist Kevin Lynch's *The Image of the City*).
     - *Medium triangles* act as visual screens obscuring what lies behind them — sparking curiosity (*"what's behind that ridge?"*) and offering immediate spatial choice (*"go over or go around?"*).
     - *Small triangles* modulate moment-to-moment traversal tempo.
  2. **The Gravity Rule**: Ranking points of interest by visual visibility so appealing landmarks organically "pull" player curiosity without relying on linear UI waypoints.
- Early prototypes using Sheikah Towers purely as linear waypoints felt overly restrictive, motivating the shift to curiosity-driven visual lures.

### Design Analysis & Transferable Principles
- **Principle**: Even in 2D or compact semi-open worlds, **controlled occlusion + visible distant landmarks** creates far stronger exploration drive than revealing an entire flat map at once or plastering arrows across the HUD.
- **Creative Lab Bridge**: Applied to sightline/landmark planning in `Exercise A` (Blockout 2) and `Exercise B` (World Building).

---

## Case Study 4 — *Into the Breach* (Subset Games): UI-Guided Design & Radical Clarity

### Verified Facts (Matthew Davis & Justin Ma, GDC 2019 Postmortem & Rock Paper Shotgun Interview)
- Co-creators Matthew Davis and Justin Ma spent roughly **half of their four-year development cycle** iterating on the game's UI and information telegraphing.
- Every enemy explicitly telegraphs its exact target tile and attack type before resolution (distinct visual languages: looping arcs for artillery, dotted paths for projectiles, bold arrows for melee).
- When playtesters failed to parse multi-sentence weapon tooltips, Davis built dynamic **animated unit-specific tooltips** previewing exact tile effects.
- Justin Ma summarized their ruthless editorial rule: ***"Just as a game design principle, we would sacrifice cool ideas for the sake of clarity every time. If it can be shown in a clear way, yes, we can have that."***

### Design Analysis & Transferable Principles
- **Principle**: Telegraphed intent doesn't make a game easy — it shifts difficulty from *guessing hidden rules* to *solving deep, transparent tradeoffs* ("moving that attacker saves the building AND hits another enemy!").
- **Design Discipline**: If playtesters repeatedly misunderstand a mechanic, treat it as a **design/communication bug**, never player stupidity. Cut clever mechanics that cannot be communicated cleanly at a glance.

---

## Case Study 5 — *Hades* (Supergiant Games): Transforming Failure Into Narrative Momentum

### Verified Facts (Greg Kasavin Interviews — VICE, Rock Paper Shotgun, Origin Story)
- Creative Director Greg Kasavin identified the central emotional friction of roguelikes: frequent death and progress reset can feel demoralizing.
- Supergiant designed *Hades* around the principles **"no game-over state"** and **"every run counts"**: because the player remembers past deaths and boss patterns, protagonist Zagreus and the NPCs in the House of Hades also remember and react.
- *Hades* evaluates a massive priority-filtered database of contextual dialogue events tied to run telemetry (which enemy killed you, low-HP encounters, weapon/boon combinations), ensuring narrative advances continuously without artificial daily-login manipulation.

### Design Analysis & Transferable Principles
- **Principle**: Identify the most frequent friction point in your core gameplay loop (death, backtracking, resource loss, crafting wait) and ask: **how can narrative, world reactivity, or systemic persistence turn that exact friction into anticipation?**

---

## Case Study 6 — *Half-Life 2* (Valve) & *Hollow Knight* (Team Cherry): Environmental Storytelling & Sense of Place

### Verified Facts & Documented Design Patterns
- ***Half-Life 2*** (Valve, 2004): Integrated seamless real-time narrative without pre-rendered cutscene disconnects; used lighting contrast and landmarks to navigate without minimaps; in *"We Don't Go to Ravenholm,"* guided players through a 3-step environmental learning loop (environment as micro-narrative -> environment as weapon -> weapon as puzzle solution), while coastal dried-out docks visually communicated Combine ocean depletion without lengthy exposition.
- ***Hollow Knight*** (Team Cherry, 2017): Established unmistakable **Sense of Place** across interconnected subterranean regions via sharp regional contrasts in palette, architectural motifs, ambient soundscapes (rain & melancholy piano in City of Tears vs. tense silence & skittering in Deepnest vs. lush chimes in Greenpath), and fragmented archaeological lore rewarding observant players.

### Design Analysis & Transferable Principles
- **Principle**: Environmental storytelling works best when **visual art, lighting, audio ambience, level architecture, and gameplay hazards all reinforce the exact same regional truth** — while noting the documented tradeoff (*Hollow Knight*'s cryptic storytelling delights explorers who enjoy piecing clues together, but can fatigue players who want clearer immediate narrative stakes; calibrate explicitness intentionally to the project's audience!).

---

## Case Study 7 — *Scroll Back: Side-Scrolling Cameras* (Itay Keren, GDC 2015)

### Verified Facts (Itay Keren, GDC 2015 Talk & Gamasutra Paper)
- Analyzed camera behavior across decades of 2D side-scrollers grounded in human foveal vs. peripheral vision physiology, cataloging camera windows (dead zones), axis snapping, platform snapping (locking vertical scrolling until landing on a new elevation), and directional look-ahead leading.

### Design Analysis & Transferable Principles
- **Principle**: Camera design is a first-class gameplay mechanic, not a default transform attachment. Every movement archetype demands bespoke deadzone, lead, and vertical-snap rules.
- **Godot 4.7 Bridge**: Implemented as a verified GDScript component in `Exercise G` (`creative-labs/exercise_g_integrated_design/camera_director_2d.gd`).
