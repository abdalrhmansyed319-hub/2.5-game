# Exercise F — Art Direction & Visual Readability Laboratory

> **Training Notice**: Isolated art-direction experiment testing **5-Band Value Separation**, **Shape Language**, **Mood Temperature Inversion**, and **Grayscale Squint-Test Readability** across two fictional lighting moods. **Not** the art style of any future user game.

---

## 1. Objective
Construct and quantitatively + visually validate two diametrically opposed regional color/value scripts (**Mood A: Bright Arid Day** vs. **Mood B: Dark Subterranean Night**) demonstrating that figure-ground clarity and hazard readability can be maintained in *both* bright and dark environments by inverting the 5-Band Value Hierarchy properly.

## 2. Design Intent
Show practically how art direction solves the #1 visual failure mode in indie games — actors disappearing into noisy or mid-value backgrounds — by proving figure-ground contrast both mathematically (WCAG relative luminance ratio) and visually (side-by-side color + desaturated grayscale squint-test card inspected via `read_file`).

## 3. Research
- **Phase 2 KB-06 (Art Direction & Visual Identity)**: 5-Band Value Hierarchy, 60–30–10 color balance, hue-shifted shadows, shape language psychology (rounded actor vs. rectangular architecture vs. acute triangular hazards), and colorblind redundancy.
- **WCAG 2.1 Luminance Contrast Formula**: Standard relative luminance ratio targeting `>= 4.5:1` for primary focal actors against background masonry.

## 4. Creative Decisions

| Visual Band | Shape Language | Mood A — Bright Arid Day (Warm) | Mood B — Deep Vault Night (Cool) |
| --- | --- | --- | --- |
| **Band 1: Sky / Distant Void** | Broad horizontal open negative space | `#C4CED4` (High value, low saturation mist) | `#121C26` (Deep dark teal-indigo void) |
| **Band 2: BG Architecture** | Vertical rectangular columns, muted edges | `#A69E92` (Warm compressed mid-high value) | `#22313E` (Low-value cool slate arches) |
| **Band 3: Playable Ground** | Horizontal solid plane, crisp top edge | `#7C7264` (Grounded mid-tone limestone) | `#40525E` (Elevated cool damp stone) |
| **Band 4: Actor Silhouette** | Rounded approachable head + compact torso | `#242C3A` (**Dark silhouette** against bright world!) | `#ECE0C6` (**Bright warm silhouette** against dark world!) |
| **Band 5: Hazard / Telegraph** | Acute sharp triangle + peak accent hue | `#E8522E` (High-energy fiery vermilion) | `#4EE8DA` (Luminous electric cyan-teal) |

### Key Art Direction Insight: Value Polarity Inversion
- In **Bright Worlds (Mood A)**, the protagonist reads strongest as a **dark, crisp silhouette** against bright low-contrast atmospheric backgrounds.
- In **Dark Worlds (Mood B)**, trying to use a dark cloak vanishes completely — flipping value polarity so the actor carries a **bright warm highlight/trim** guarantees effortless peripheral tracking!

## 5. Implementation Approach
- `verify_palette_contrast.py`: Computes exact sRGB linearized WCAG contrast ratios between Actor vs. BG, Actor vs. Ground, and Hazard vs. BG, then renders `art_direction_5band_study.png` showing both full-color and desaturated grayscale squint-test mockups side by side.
- Visually inspected `art_direction_5band_study.png` directly using `read_file`.

## 6. Testing
- **Automated Luminance Ratio Verification (Executed)**: Ran `verify_palette_contrast.py`:
  - **Mood A (Warm Day)**: `Actor-vs-BG = 5.30:1` (passes WCAG 4.5:1), `Actor-vs-Ground = 2.97:1`, raw unoutlined `Hazard-vs-BG = 1.40:1` *(caught critical grayscale visibility failure!)*.
  - **Mood B (Cool Night)**: `Actor-vs-BG = 10.17:1`, `Actor-vs-Ground = 6.20:1`, `Hazard-vs-BG = 8.80:1` (all bands clear `>= 6.0:1`).
- **Direct Visual Inspection Pass 1 & Pass 2 (`read_file` on `art_direction_5band_study.png` — Executed)**: Pass 1 visually confirmed the `1.40:1` vermilion hazard nearly blending into mid-gray stone in the desaturated squint panel; Pass 2 visually verified the repaired `3 px` high-contrast dark silhouette rim (`#1C161A`) restoring instant grayscale & colorblind legibility!

## 7. Evaluation
- **Strengths**: Proves objectively via both WCAG math AND real visual grayscale inspection that saturation alone fails in bright daylight environments; combining **acute shape language + high-contrast dark silhouette rim** solves daylight hazard readability cleanly while keeping Mood B's inverted luminous hierarchy crystal-clear (`10.17:1` / `8.80:1`).
- **Weaknesses**: Flat-shaded mockup does not capture real-time particle bloom, dynamic shadow-casting lights, or scrolling parallax motion blur — which must be audited live in Godot's viewport once art assets exist.

## 8. Problems
- **Real Defect Caught in Pass 1 Visual Squint Test**: Raw vermilion `#E8522E` popped vividly against warm beige `#A69E92` in full color, yet measured only `1.40:1` luminance contrast and virtually vanished into the mid-gray ground/pillar in the desaturated grayscale panel! Fixed in `verify_palette_contrast.py` by adding a crisp `3 px` dark silhouette rim (`#1C161A`) around Band 5 hazards, visually verified on Pass 2.

## 9. Improvements
- Add automated Protanopia / Deuteranopia color-matrix simulation panels alongside the grayscale squint test in `verify_palette_contrast.py` for future production art bibles.

## 10. Final Assessment
Establishes a rigorous, measurable, visually verifiable art-direction pipeline combining color theory, value polarity inversion, shape psychology, and quantitative contrast verification.
