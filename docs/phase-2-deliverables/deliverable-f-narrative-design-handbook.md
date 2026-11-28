# Deliverable F — Narrative Design Handbook

> **Foundation**: Synthesized from [`Creative KB-08`](../creative-knowledge-base/08-narrative-design-and-game-writing.md), [`Creative KB-13`](../creative-knowledge-base/13-professional-game-design-case-studies.md) (*Hades*, *Half-Life 2*, *Hollow Knight*), and [`Exercise E`](../../creative-labs/exercise_e_narrative/README.md).  
> **Godot 4.7 Bridge**: [`Tech KB-09 Game Systems`](../knowledge-base/09-game-systems-architecture.md) & [`Lab 07 SaveSystem`](../../labs/lab_07_save_load_system/README.md).

---

## 1. Core Principle: Ludo-Narrative Integration
Story in a game is not an essay pasted between gameplay chapters — it is what happens when **core mechanics, world geography, player agency, and character stakes reinforce the exact same thematic truth**.

### The Lightest-Effective-Layer Rule
Deliver every narrative beat through the least intrusive layer capable of landing it clearly:
1. **Systemic / Mechanical Consequence** (highest agency — e.g., *Hades*'s death-and-return dialogue loop).
2. **Environmental Storytelling** (zero interruption — spatial props, wear marks, barricades telling history).
3. **Diegetic Micro-Writing** (opt-in — item blurbs, signage, barks, short human ledgers/receipts).
4. **Concise Interactive Dialogue** (short rhythmic exchanges anchored in immediate conflict & meaningful choice).
5. **Authored Cutscenes** (strictly reserved for rare emotional turning points that genuinely earn taking away control).

---

## 2. Character Construction & The Voice Test
Every recurring NPC or protagonist requires:
- **Surface Want vs. Hidden Need**: Concrete immediate goal vs. deeper emotional truth driving their friction.
- **Specific Flaw / Bias**: Characters who speak neutrally like encyclopedias feel dead; characters speak through their profession, fears, and blind spots.
- **The Blinded Voice Test**: Cover speaker names across 4–6 lines — rhythm, sentence length, diction, and concrete metaphors must identify each speaker unmistakably!
- **Reactive Memory**: Track compact world/action story flags in `SaveSystem` (`Lab 07`) so characters notice what the player actually accomplished, bypassed, or failed.

---

## 3. Practical Game Writing Standards (Verified in Exercise E)
- **Dialogue Box Length**: Target **12–28 words (1–2 crisp sentences)** per UI beat so text reads effortlessly at gameplay tempo and reserves ~30% width margin for localization.
- **Cut Throat-Clearing Exposition**: Delete *"Greetings adventurer!"*, *"As you already know..."*, and verbose recaps of on-screen events; start scenes late and leave early!
- **Meaningful Choice Design**: Every major choice should change at least one of: (a) **tactical/traversal route** (e.g., shortcut vs. gear upgrade in Exercise E), (b) **character relationship/reactive callbacks**, or (c) **world-state flag** — never trick players with fake options that trigger identical replies without clear tonal purpose.
- **Two-Beat Item Descriptions**:
  - *Line 1*: Unambiguous gameplay mechanic / effect (clarity first — never hide stats inside poetry!).
  - *Line 2*: 1–2 concise evocative sentences linking the object to world culture or human detail.
- **Short Diegetic Documents**: `60–140 words` max, written in authentic in-world voices (foreman's hurried log, folded receipt, cracked warning plaque) rather than textbook lore dumps.
- **Dynamic Tutorial Prompts**: Prefer silent spatial *Kishōtenketsu* teaching first; when text is needed, use brief imperative verbs + live device-aware input glyphs (`[Interact] Open`, never hardcoded keyboard keys!).
