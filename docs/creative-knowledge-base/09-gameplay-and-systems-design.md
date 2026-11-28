# 09 — Gameplay and Systems Design

> **Technical Bridge (Phase 1)**: Connects directly to [`KB-09 Game Systems Architecture`](../knowledge-base/09-game-systems-architecture.md) and [`Labs 01–07`](../../labs/README.md).  
> **Scope**: Designing cohesive interconnected gameplay ecosystems across Movement, Combat, AI, Interaction, Inventory, Equipment, Resources, Progression, Puzzles, Hazards, and Checkpoints — using the 8-point Systems Design Contract.

---

## 1. Systems Thinking: Avoid Isolated "Feature Islands"

A common failure in indie and AAA games alike is bolting popular genre features together (crafting + stealth + skill tree + hunger meter + fishing) without connecting them to the **core gameplay loop**.

> **The Systems Cohesion Test**: Every gameplay system must either **feed into**, **create tension with**, or **reward mastery of** the Core Loop. If removing System X barely changes how the player thinks or plays during the Core Loop, System X is scope bloat — cut or redesign it!

---

## 2. The 8-Point System Specification Contract

Before designing or building any gameplay system, define all 8 attributes explicitly:
1. **Purpose**: What core player emotion or decision does this system create?
2. **Player-Facing Experience**: What does the player perceive, decide, and feel while engaging with it?
3. **Rules & Constraints**: Clear, learnable invariants and limits (what is allowed, what costs what).
4. **Inputs & Outputs**: What player actions/resources enter the system, and what state changes/feedback emerge?
5. **Cross-System Relationships**: Exact feedback edges to Movement, Combat, Exploration, Economy, UI, Audio, and Save state.
6. **Balance Levers**: Which data-driven `Resource` parameters govern tuning without rewriting code?
7. **Failure & Exploit Cases**: Dominant strategies, softlocks, infinite loops, tedious degenerate play ("optimizing the fun out").
8. **Contribution to Whole-Game Identity**: Why this specific version of the system belongs *in this game* rather than generic boilerplate.

---

## 3. Core System Design Principles by Category

### Movement & Traversal Systems
- Traversal should feel enjoyable even in an empty room — make moving between encounters intrinsically tactile.
- Design movement verbs to double as **exploration gates and combat tools** (e.g., a dash or grapple that both crosses chasms and repositions around attacks creates deep systemic elegance).

### Combat & Enemy Behavior Systems
- **The Conversation Model of Combat**: Good combat is a readable call-and-response rhythm between enemy intent (clear anticipation telegraph) and player counter-verbs (reposition, parry, interrupt, exploit opening).
- **Enemy Roles (Chess-Piece Composition)**: Design small enemy rosters with **complementary spatial pressure** (e.g., a stationary area-denial threat forcing movement + a fast flanker punishing standing still + an armored anchor protecting ranged allies) rather than 20 nearly identical melee sponges!
- **Encounter Arenas**: Enemy AI and arena layout are inseparable — cover, ledges, hazards, and sightlines transform the exact same enemy roster into completely fresh tactical puzzles.

### Resource, Inventory, & Equipment Systems
- **Scarcity Drives Decisions**: Unlimited potions turn healing into mindless button-mashing; bounded rechargeable flasks or finite inventory capacity transform every hit taken and every pickup carried into a tense tactical choice.
- **Equipment as Playstyle Modifiers**: Prefer gear/upgrades that alter *how you play* (new risk/reward tradeoffs, range/cadence shifts, elemental interactions) over linear `+2 ATK -> +4 ATK -> +6 ATK` spreadsheet churn.

### Exploration, Puzzle, & Environmental Hazard Systems
- **Puzzles**: Built on **clear learnable rules** introduced individually (*Kishōtenketsu*), then combined to produce genuine "aha!" moments without tedious mechanical execution repeats once solved. Never gate a puzzle behind obscure moon-logic or pixel-hunting!
- **Environmental Hazards**: Always visually distinct (Band 5 contrast + signature audio hum), consistent in rules, and ideally **systemic** (affecting enemies as well as the player so clever players can turn hazards into weapons!).

### Progression, Economy, Checkpoints, & Save Design
- **Positive vs. Negative Feedback Loops**:
  - *Positive (Snowball)*: Success grants more power -> thrilling power spikes, but risks trivializing late game if unchecked.
  - *Negative (Rubber-Banding / Diminishing Returns)*: Keeps tension sharp, prevents runaway imbalances, and aids struggling players without feeling rigged.
- **Checkpoints & Saves**: Align save rules with the intended emotional tone (frictionless instant checkpoints for precision mastery games; intentional rest-site saves for high-tension survival/exploration — never lose player progress due to technical crashes!).
