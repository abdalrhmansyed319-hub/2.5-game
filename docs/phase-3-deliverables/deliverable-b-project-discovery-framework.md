# Phase 3 Deliverable B — Professional Project Discovery Framework

> **Purpose**: Structured Stage 01 methodology to fully understand a user's new game vision, real assets, technical environment, and constraints BEFORE proposing architecture or writing production code.

---

## 1. Core Discovery Rules
1. **Zero Premature Assumptions**: Never impose a genre, perspective (2D/2.5D/3D), narrative tone, art style, or engine version onto a new project before the user specifies or approves it.
2. **Ask Focused, High-Leverage Questions Only**: Do not overwhelm the user with a 40-question form; ask only what is essential to avoid misaligning project identity or technical foundations, proposing clean defaults for non-critical choices.
3. **Separate Truth From Hypothesis**: In the Project Discovery Document (`docs/project-memory/01-project-vision.md`), explicitly tag every item as:
   - **`[CONFIRMED]`**: Explicitly stated or approved by the user, or directly verified from workspace files/engine config.
   - **`[PROPOSED]`**: Studio recommendation awaiting user sign-off.
   - **`[UNRESOLVED]`**: Open decision requiring clarification before dependent stages begin.

---

## 2. The 12-Dimension Discovery Checklist

| # | Dimension | What Must Be Captured & Verified |
| --- | --- | --- |
| **01** | **Game Vision & Core Hook** | What makes this game worth playing? Core emotional promise & reference touchstones (what the user loves *and* dislikes). |
| **02** | **Project Objectives** | Scope ambition: compact micro-game, polished vertical slice, indie commercial release, jam entry, or learning prototype? |
| **03** | **Intended Audience** | Casual explorers, precision challenge fans, narrative readers, tactical thinkers, or mixed accessibility needs? |
| **04** | **Genre & Core Mechanics** | Primary player verbs and core loop (avoid vague genre labels alone — pin down what the player *actually does* every 10 seconds). |
| **05** | **Perspective & Camera** | Side-scrolling 2D, top-down 3/4, isometric, 2.5D, third-person 3D, or first-person 3D? Logical resolution & aspect ratio. |
| **06** | **Target Platforms & Inputs** | Desktop (Windows/Linux/macOS), Web, Steam Deck/Gamepad, Mobile? Primary vs. secondary input parity requirements. |
| **07** | **Core Player Experience** | Target feelings (curiosity, tension, flow mastery, cozy warmth, strategic satisfaction, atmospheric dread). |
| **08** | **Visual Direction** | User-supplied asset aesthetic, lighting/atmosphere targets, pixel art vs. hand-painted vs. stylized 3D. |
| **09** | **Available Assets Audit** | Exact workspace paths of provided sprites, tilesets, 3D models, fonts, audio — inspected immediately via Stage 04 (`Deliverable E`). |
| **10** | **Technical Environment** | **Exact installed Godot Engine version** (`project.godot` + local/user runtime version!), renderer (`Forward+` / `Mobile` / `Compatibility`), existing code/plugins. |
| **11** | **Production Constraints** | Time budget, asset creation limits, solo vs. team workflow, localization/accessibility baseline. |
| **12** | **User Creative Preferences** | Non-negotiables, favorite mechanics, hard dislikes, desired level of creative pushback & studio autonomy. |

---

## 3. The 10-Step Discovery Mode Execution Sequence (Section 20 Protocol)
When the user introduces a real project:
1. Listen closely and capture raw vision & goals.
2. Confirm intended genre, perspective, and primary verbs.
3. Align on core player experience and target emotions.
4. Inspect existing project files, Godot version, and every available visual/audio asset (`tools/asset_inspector.py` + `read_file`).
5. Record all hard requirements and constraints cleanly (`[CONFIRMED]` vs. `[UNRESOLVED]`).
6. Surface high-value creative opportunities and honest asset/technical gaps.
7. Assess technical constraints and architectural fit (no overengineering!).
8. Present 2–3 distinct concept directions (when open) with tradeoff comparisons and one clear studio recommendation.
9. Draft the Project Discovery Document (`01-project-vision.md`) and staged Production Roadmap (`12-development-roadmap.md`).
10. **Obtain explicit user approval before opening Stage 05+ production!**
