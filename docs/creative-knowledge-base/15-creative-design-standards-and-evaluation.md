# 15 — Creative Design Standards and Evaluation

> **Scope**: The 10-Point Creative Decision-Making Framework, Creative Collaboration Protocol, Anti-Pattern Guardrails, and Holistic Evaluation Rubric governing all creative decisions on future game projects.

---

## 1. The 10-Point Creative Decision-Making Framework (Mandatory Gate)

Before proposing or adopting any significant creative feature, mechanic, region, visual change, or narrative element, evaluate all **10 criteria**:

1. **Player Experience Alignment**: Does it directly serve the intended core player emotion and micro-loop?
2. **Game Identity Fit**: Does it strengthen the project's unique identity rather than feeling pasted from another genre?
3. **Visual Coherence**: Does it harmonize with the art bible, palette, value hierarchy (5-band rule), perspective, and pixel density?
4. **Mechanical Meaning**: Does it create genuine player decisions, counterplay, or expressive agency rather than busywork?
5. **Exploration & Engagement Value**: Does it deepen curiosity, pacing, discovery, or replayable mastery?
6. **Complexity Economy**: Is its cognitive and systemic cost justified, or does it add bloat that dilutes stronger core pillars?
7. **Asset Feasibility**: Can the actual user-provided (or approved) assets support it cleanly without visual hacks or stretching?
8. **Technical Feasibility**: Can it be engineered cleanly, maintainably, and within Godot `4.7+` performance budgets (`Phase 1 Standards`)?
9. **Future Extensibility**: Does it unlock clean systemic combinations or content leverage later, or paint the project into a corner?
10. **Comparative Superiority**: Is it genuinely stronger than at least two simpler alternatives we considered?

---

## 2. Four Core Creative Fallacies to Actively Guard Against

| Fallacy | Symptom | Corrective Standard |
| --- | --- | --- |
| **Originality = Randomness** | Combining weird unrelated mechanics/themes purely to seem "unique" | Originality comes from **deep cohesive commitment** to a clear premise and its systemic consequences. |
| **Complexity = Quality** | Adding 12 currencies, 6 meters, and 40 skills to look "deep" | **Depth = simple learnable rules producing rich emergent decisions** (elegance ratio: depth / complexity). |
| **Visual Detail = Good Art Direction** | Packing every pixel with texture noise, bloom, and clutter | **Readability, value separation, negative space, and silhouette clarity** always beat raw detail density. |
| **Difficulty = Meaningful Challenge** | Cheap traps, bloated HP pools, opaque hitboxes, punishing walk-backs | Challenge must be **readable, fair, responsive, and rewarding to master** (*Celeste* / *Into the Breach*). |

---

## 3. Creative Collaboration Protocol (Working with the Project Owner)

The **user is the project owner and final creative decision-maker**. Our role as Creative Director & Senior Engineer is to elevate their vision with rigorous craft and honest judgment:

1. **Never Blindly Rubber-Stamp Weaknesses**: If a proposed mechanic, level layout, narrative turn, or asset mix has a genuine weakness, respectfully and clearly:
   - State the **exact weakness** (without ego or condescension).
   - Explain its **concrete impact on player experience or production scope**.
   - Propose **2–3 grounded alternatives**.
   - Compare tradeoffs objectively.
   - Recommend the **strongest option** and explain why.
   - **Respect and execute the user's final decision cleanly.**
2. **Never Hijack Creative Identity**: Do not inject unsolicited lore, tone shifts, genre pivots, or invented assets outside approved direction.
3. **Ask Focused Questions Only When Essential Information Is Missing**: Avoid endless trivial questionnaires when reasonable, reversible decisions can be made within approved pillars.
4. **Preserve User Assets & Vision**: Audit real assets before planning environments; disclose missing pieces transparently and propose practical creative/technical remedies.

---

## 4. Holistic Creative Quality Evaluation Rubric (1–5 Scale per Pillar)

Used to audit every future greybox level, vertical slice, art pass, and milestone build:

| Pillar | Level 1 (Broken) | Level 3 (Functional) | Level 5 (Exceptional / Shippable) |
| --- | --- | --- | --- |
| **Core Loop & Game Feel** | Sluggish, unreadable, frustrating | Responsive and clear, lacks tactile nuance | Instantaneous control, generous forgiveness, resonant anticipation/impact/follow-through |
| **Level Flow & Readability** | Players get lost, dead zones, blind traps | Clear critical path, basic pacing | Silent visual guidance, Kishōtenketsu escalation, rewarding shortcuts & fair secrets |
| **World & Visual Cohesion** | Clashing styles, unreadable clutter, flat rooms | Consistent assets, acceptable contrast | Strict 5-band value clarity, unmistakable regional identity, seamless tiles & atmospheric depth |
| **Narrative & Audio Integration** | Exposition walls, silent or jarring SFX | Competent dialogue and working audio | Ludo-narrative harmony, evocative environmental beats, layered adaptive audio & dynamic contrast |
| **UX & Accessibility** | Swallowed clicks, broken controller focus, dense HUD | Usable on M+K, clear basic HUD | Effortless M+K + gamepad parity, minimal glanceable HUD, AccessKit & reduced-motion support |
| **Technical-Creative Alignment** | Creative scope crashes framerate or explodes architecture | Runs smoothly with minor debt | Creative ambition fits cleanly within Godot `4.7+` architecture, asset kit, and `p99` frame budgets |
