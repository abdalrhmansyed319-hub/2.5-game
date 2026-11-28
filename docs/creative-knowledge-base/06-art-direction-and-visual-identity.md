# 06 — Art Direction and Visual Identity

> **Technical Bridge (Phase 1)**: Connects to [`KB-05 Rendering & Shaders`](../knowledge-base/05-rendering-and-shaders.md), [`KB-06 TileMap & Environment`](../knowledge-base/06-tilemap-and-environment-engineering.md), and [`Exercise F Art Direction Lab`](../../creative-labs/exercise_f_art_direction/README.md).  
> **Scope**: Visual hierarchy & readability, color theory & harmony, value separation (the 5-band rule), shape language, environmental depth, pixel art direction, lighting/atmosphere, and consistency governance.

---

## 1. The Supreme Law of Game Art Direction: Readability First

Unlike static illustration, game art moves at 60–144 FPS while the player makes split-second spatial decisions. Therefore:
> **Never allow background detail, decorative clutter, lighting bloom, or particles to compete visually with playable terrain, actors, hazards, or interactive cues.**

### The 5-Band Value & Saturation Hierarchy
Verify every screen by desaturating it to grayscale (squint test):

| Visual Band | Value & Contrast Budget | Saturation Budget | Purpose |
| --- | --- | --- | --- |
| **1. Distant Parallax / Sky** | Narrow, compressed value range; low internal contrast | Low (atmospheric perspective shift toward sky/fog hue) | Establishes depth, mood, and regional scale without pulling focus |
| **2. Background Architecture / Non-Playable Walls** | Medium-low contrast; softer edges | Low to moderate | Frames space and communicates lore without masquerading as solid collision |
| **3. Playable Ground & Solid Collision Edges** | Clear crisp top/boundary edge contrast; calm interior fill | Moderate, grounded earth/stone/material tones | Tells the player effortlessly where they can stand and where walls block movement |
| **4. Actors, Interactables & Enemies** | **High silhouette contrast** against bands 1–3; distinct shape language | Higher / deliberate accent hue contrast | Instant figure-ground separation within 50 ms of entering view |
| **5. Projectiles, Hazards, Telegraphs & Critical UI** | **Peak luminance & sharpest contrast** | Peak focal accent hues (e.g., danger warm/bright vs. interactable cool/gold) | Impossible to miss even in peripheral vision during frantic motion |

---

## 2. Color Theory, Harmony, and Temperature

- **60–30–10 Allocation Rule**: ~60% dominant ambient/environment tones, ~30% secondary structural/architectural tones, ~10% high-energy focal accents (actors, landmarks, hazards, interactables).
- **Hue Shifting (Avoiding Muddy Shading)**: Never shade solely by mixing pure black or highlight by mixing pure white! Shift shadows subtly toward cooler/deeper hues (e.g., warm ochre -> burgundy/indigo shadows) and highlights toward warmer/brighter hues (or invert for moonlit cool keys + warm torch fills).
- **Semantic Color Consistency**: Reserve specific accent hues consistently for gameplay semantics across the entire game (e.g., if bright crimson signals lethal damage, do not scatter bright crimson decorative flowers onto safe walkable grass!).
- **Colorblind Verification**: Pair every color signal with distinct **value contrast + shape/iconography** so Deuteranopia/Protanopia players read every hazard and UI state effortlessly.

---

## 3. Composition, Shape Language, and Depth

### Shape Language Psychology
- **Circles / Curves**: Approachable, organic, safe, agile, protective.
- **Squares / Rectangles**: Stable, heavy, immovable, architectural, stubborn, defensive.
- **Triangles / Acute Diagonals**: Sharp, energetic, hazardous, aggressive, fast, directional.
*Apply shape language consistently across terrain silhouettes, props, enemies, and UI frames!*

### Environmental Depth & Negative Space
- **Foreground Framing**: Dark, slightly larger parallax silhouettes passing gently in the bottom/top frame corners add cinematic depth — *never* let foreground silhouettes block the player's feet, landing ledges, or incoming projectiles!
- **Rest Areas & Negative Space**: Group micro-details into intentional focal clusters surrounded by calm breathing room ("detail density contrast"). Covering 100% of every tile with noise makes the entire screen visually fatiguing and flat.
- **Lighting Direction & Atmospheric Effects**: Maintain one coherent primary light direction per region; use subtle depth fog, dust motes, water reflections, and localized light pools (`PointLight2D` / `AreaLight3D` in Godot 4.7) to guide the eye toward objectives.

---

## 4. Pixel Art Direction (Specialized Craft)

When working in pixel art, technical and artistic rules fuse tightly:
- **Strict Pixel Density Consistency ("Mixels" Are Forbidden)**: Every sprite, tile, prop, and particle in world space must share the exact same effective pixel scale (1:1). Never scale a 16×16 sprite to `1.37x` or mix crisp 1px pixel art with smooth high-res vector strokes on the same world plane (note: crisp high-res HUD over a `SubViewport` pixel world can be an intentional deliberate choice if cleanly bounded).
- **Pixel Clusters & Clean Lines**: Group pixels into purposeful readable shapes rather than noisy 1-pixel "pillow-shaded" or random-pixel confetti ("jaggies" and "orphans"). Use controlled **anti-aliasing** only along curved/angled contours where it smooths silhouettes without blurring readability.
- **Constrained Palette Discipline**: Smaller, intentional color ramps (typically 4–6 tones per material ramp, reused across tiles and props via shared shadow/highlight hues) unify disparate assets far better than millions of arbitrary colors.
- **Pixel-Perfect Godot Configuration (`KB-05`)**: `Nearest` texture filtering, integer or clean `viewport` scaling (or pixel-snapped `SubViewport` camera rig), `use_texture_padding = true` on `TileSetAtlasSource`, and crisp non-rotated collision-aligned geometry unless deliberate subpixel/hi-bit rotation is part of the art spec.

---

## 5. Visual Consistency Governance

Before integrating any new asset or effect, check five invariants:
1. Does it respect the **5-Band Value Hierarchy** (squint test passes)?
2. Does its **pixel/texel density** match adjacent assets?
3. Does its **perspective/projection** and **key-light direction** match the scene?
4. Does its **palette temperature** harmonize with the region's key colors?
5. Does it **clarify** or **clutter** gameplay? (If it only adds noise, cut it.)
