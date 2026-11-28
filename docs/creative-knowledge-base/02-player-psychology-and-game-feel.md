# 02 — Player Psychology and Game Feel

> **Technical Bridge (Phase 1)**: Connects to [`KB-03 Physics & Movement`](../knowledge-base/03-physics-and-movement-systems.md), [`KB-04 Animation Systems`](../knowledge-base/04-animation-systems.md), [`KB-08 Audio Systems`](../knowledge-base/08-audio-systems.md), and [`Lab 02 Advanced Movement`](../../labs/lab_02_advanced_movement_system/README.md).  
> **Scope**: Intrinsic vs. extrinsic motivation, cognitive load, tension/release, reward timing, meaningful failure, kinesthetic game feel, forgiveness mechanics, and multi-sensory feedback choreography.

---

## 1. Player Psychology: Why Games Feel Compelling

### Self-Determination Theory (SDT) in Games
Research in player motivation (Rigby & Ryan, *Glued to Games*) identifies three core intrinsic psychological needs:
1. **Competence (Mastery)**: Feeling genuinely capable and seeing measurable growth in skill — fueled by fair challenges, clear cause-and-effect feedback, and graduated escalation.
2. **Autonomy (Agency)**: Feeling your decisions and strategies are *yours* — fueled by expressive movement, multiple tactical solutions, optional exploration routes, and respecting player intelligence instead of nagging tutorials.
3. **Relatedness (Meaning & Connection)**: Feeling your actions matter to characters, factions, or a believable world — fueled by reactive NPCs, world state consequences, and resonant themes.

### Managing Cognitive Load & Attention
- Human working memory holds roughly **3–5 active chunks** at once.
- **Never introduce two unfamiliar mechanics AND a lethal hazard simultaneously.**
- Offload tracking from working memory onto readable diegetic cues (e.g., character posture/weapon glow showing charged state, audio pitch climbing as a meter fills, consistent color/shape language for hazards).

### Curiosity, Tension & Release, and Reward Timing
- **Information-Gap Theory of Curiosity (Loewenstein)**: Curiosity peaks when players perceive a *specific gap* between what they see and what they want to know (e.g., a locked grate revealing a glowing shortcut behind it, a ruined bridge hinting at an alternate crossing, an unexplained landmark on the horizon).
- **Tension & Release**: Sustained dread without relief numbs the player; continuous comfort without stakes breeds boredom. Alternate high-focus sequences with low-pressure decompression beats (safe rooms, traversal vistas, calm dialogue, environmental discovery).
- **Reward Timing**:
  - Immediate micro-feedback (within **< 50 ms** of input) confirms action execution.
  - Earned discovery/mastery rewards outperform arbitrary random grind drops; avoid manipulative dark-pattern timers/skinner boxes that erode player trust.

### Meaningful Failure vs. Player Frustration
Players tolerate — and even love — high failure counts when **four conditions hold**:
1. **Attribution Clarity**: "I know *exactly* why I failed."
2. **Fairness**: Controls responded reliably; hitboxes and telegraphs matched visuals.
3. **Fast Recovery**: Restarting the attempt takes ~1 second, not 30 seconds of menu/reload friction.
4. **Carry-Forward Value**: Every failed attempt teaches a pattern, opens a shortcut, or advances narrative/knowledge (as Greg Kasavin demonstrated in *Hades*).

---

## 2. Game Feel: The Anatomy of Kinesthetic Satisfaction

Steve Swink (*Game Feel*) defines game feel as the intersection of **Real-Time Control**, **Simulated Space**, and **Polish (Feedback)**. A mathematically accurate physics controller frequently feels sluggish or punishing until tuned specifically for human perception.

### A. Input Responsiveness & Forgiveness Windows
Verified from Maddy Thorson's *Celeste* design breakdown (2020) and applied in our `Lab 02` & `Exercise D`:
- **Perceived Input Latency**: Target **<= 1–2 frames** from button press to first visual/audio acknowledgement. Never hide basic actions (jump, dodge, light attack) behind long startup animations before *something* visibly reacts.
- **Coyote Time (`80–130 ms`)**: Permit jumping briefly after walking off a ledge. Players perceive strict frame-0 ledge dropoffs as "the jump button ate my input!"
- **Input Buffering (`80–140 ms`)**: Queue jump/attack/dodge presses made just before landing or recovery ends so the action fires cleanly on the first legal frame.
- **Corner Correction / Edge Nudge (`2–6 px`)**: Slightly nudge a rising character past the outer corner of a ceiling block instead of halting vertical momentum on a 2-pixel clip.
- **Apex Gravity Reduction & Variable Jump Cut**: Lightening gravity near jump peak widens aerial precision; cutting upward velocity on early release grants expressive height control.
- **Momentum Preservation**: Retaining moving-platform inertia (`PLATFORM_ON_LEAVE_ADD_VELOCITY`) for a brief window makes dynamic traversal feel generous and heroic.

### B. Weight, Momentum, and Acceleration Curves
Different movement curves communicate completely different physical fantasies:
- **Crisp / Snappy Arcade**: Very high acceleration (`0.05–0.10 s` to top speed), very high turn-around deceleration (`1.6x–2.2x` acceleration), minimal slide -> emphasizes precision and instant dodging.
- **Weighty / Grounded Deliberate**: Moderate acceleration (`0.18–0.30 s`), committed inertia, heavier footstep cadence, recovery frames -> emphasizes physical mass, deliberate commitment, and tactical positioning.
- **Fluid / Momentum-Driven**: Lower friction, speed-preserving slopes/dashes, wide air steering -> emphasizes flow, speedrunning chains, and expressive arcs.

---

## 3. Multi-Sensory Feedback Choreography (Anticipation -> Impact -> Follow-Through)

Satisfying actions follow Disney's classic animation triad extended across **Animation + Physics + Camera + VFX + Audio**:

1. **Anticipation (Telegraph — 50 to 300 ms depending on action weight)**:
   - Visual silhouette wind-up (pull back, crouch, weapon gleam, distinct color/shape telegraph).
   - Rising audio cue (inhale, mechanical click, charge hum).
   - *Design value*: Gives both the player (for their own heavy moves) and defenders (against enemy attacks) readable timing.
2. **Impact (Contact Frame — 16 to 100 ms)**:
   - **Hit-Stop (Freeze Frame — `30–90 ms`)**: Briefly pauses attacker/victim animation (and optionally micro-pauses local motion) on solid contact. Communicates kinetic force far better than giant damage numbers! *Caution*: Never freeze so long (`> 120 ms` on light hits) that controls feel broken, and never drop buffered inputs during hit-stop!
   - **Directional Camera Impulse / Trauma Shake**: Short directional kick along the impact vector (`trauma^2` decay) rather than chaotic constant screen vibration. Always pair with a screen-shake intensity / reduced-motion setting.
   - **High-Contrast Hit Flash**: 1–2 frame pure white/bright silhouette flash via `instance uniform` shader (`KB-05`) so hit confirmation reads unmistakably even in peripheral vision.
   - **Layered Audio Impact**: Transient crack/snap (high freq) + body thump (low-mid punch) + material texture (metal/wood/stone) via `AudioStreamRandomizer` (`KB-08`).
   - **Directional Particles**: Fast burst aligned with impact normal, fading quickly so particles never obscure gameplay silhouettes!
3. **Follow-Through (Settling — 80 to 250 ms)**:
   - Squash-and-stretch recovery on visual child pivot (`KB-04`), knockback slide with friction, dust puff, weapon settle, and crisp return to neutral stance.

### The Golden Restraint Rule of "Juice"
> **Juice must clarify state and amplify weight — never drown readability.**  
> Excessive permanent screen shake, giant opaque particle clouds, loud repetitive sounds, or long hit-stops on trash enemies turn satisfying feedback into visual noise and fatigue. Calibrate feedback intensity strictly proportionally to the **significance of the event** (light tap < heavy strike < critical break < boss defeat).
