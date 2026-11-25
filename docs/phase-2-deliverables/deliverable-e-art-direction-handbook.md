# Deliverable E — Art Direction Handbook

> **Foundation**: Synthesized from [`Creative KB-06`](../creative-knowledge-base/06-art-direction-and-visual-identity.md), [`Creative KB-07`](../creative-knowledge-base/07-character-design-and-animation-direction.md), and [`Exercise F`](../../creative-labs/exercise_f_art_direction/README.md).  
> **Godot 4.7 Bridge**: [`Tech KB-05 Rendering & Shaders`](../knowledge-base/05-rendering-and-shaders.md) & [`Tech KB-04 Animation Systems`](../knowledge-base/04-animation-systems.md).

---

## 1. Visual Hierarchy Law: The 5-Band Readability Architecture
Every frame of gameplay must pass the **Desaturated Grayscale Squint Test** across five strict visual bands:
1. **Band 1 — Distant Sky / Parallax Void**: Compressed low internal contrast, atmospheric perspective hue shift.
2. **Band 2 — Background Architecture**: Muted, softer value range; never mimics solid collision outlines.
3. **Band 3 — Playable Ground & Solid Collision Edges**: Calm floor fill with razor-clear boundary bevels/edges so walkable space reads effortlessly.
4. **Band 4 — Protagonist, Allies, Enemies & Interactables**: High silhouette figure-ground contrast (`>= 4.5:1` target against Band 2 BG) + distinctive silhouettes.
5. **Band 5 — Hazards, Projectiles, Telegraphs & Critical HUD**: Peak luminance/rim contrast + acute warning shape language + semantic accent colors.

### Value Polarity Inversion (Proven in Exercise F)
- **Bright Environments**: Anchor Band 4 actors with **dark, crisp silhouettes** (`5.30:1` measured in Exercise F) and wrap bright colored Band 5 hazards in a **high-contrast dark silhouette rim** (preventing bright reds/oranges from vanishing at `1.40:1` luminance in grayscale/colorblind vision!).
- **Dark Environments**: Flip polarity so Band 4 actors carry **warm bright highlights/trim** (`10.17:1`) and Band 5 hazards emit **luminous high-value contrast** (`8.80:1`).

---

## 2. Color Harmony, Lighting, & Shape Language
- **60–30–10 Color Budget**: 60% calm ambient ground/environment, 30% structural architecture, 10% high-energy focal accents.
- **Hue-Shifted Ramps**: Shift shadows slightly cooler/deeper and highlights warmer/brighter (or deliberately inverted for cool moonlight + warm firelight) — never muddy colors by shading with flat gray/black.
- **Semantic Color Protection**: Reserve danger hues (e.g., hazard crimson/toxic cyan) strictly for gameplay threats — never scatter lethal-colored flowers onto safe ground!
- **Shape Language Discipline**:
  - *Circles/Curves*: Friendly, agile, organic, safe.
  - *Squares/Rectangles*: Heavy, architectural, defensive, solid.
  - *Triangles/Acute Diagonals*: Sharp, hostile, fast, hazardous.
- **Negative Space & Detail Clustering**: Concentrate micro-detail around intentional focal landmarks and transitions; leave calm visual breathing space everywhere else.

---

## 3. Pixel Art & Visual Consistency Standards
- **Zero "Mixels"**: Maintain strict 1:1 world pixel density across tiles, characters, props, and world particles; configure `Nearest` texture filtering and clean integer/viewport scaling (`Tech KB-05`).
- **Constrained Cohesive Palettes**: Share unified shadow and highlight anchor tones across materials so sprites and tiles inhabit the exact same physical light.
- **Consistent Key-Light & Perspective**: Never mix top-down 90° props onto 3/4 wall perspectives or mirror strongly side-lit sprites carelessly across mismatched light directions.

---

## 4. Character & Interactive Animation Direction
- **200 ms Silhouette Test**: Distinct role/threat recognition purely from solid silhouette at gameplay camera distance.
- **Responsive Timing Over Film Smoothness**:
  - *Player Light Verbs*: `1–2` frames anticipation max -> snappy active pose/smear -> brief responsive follow-through.
  - *Enemy Attacks*: Clear, exaggerated anticipation telegraph giving fair human reaction time -> decisive active strike -> punishable recovery pose!
  - *Secondary Motion*: Trailing scarves/cloaks/hair lagging 1–2 frames add vivid life without interfering with hitboxes.
  - *Pivot Squash & Stretch*: Always animate scale on a child `visual_pivot` (`Exercise D`), NEVER scaling physics collision shapes!
