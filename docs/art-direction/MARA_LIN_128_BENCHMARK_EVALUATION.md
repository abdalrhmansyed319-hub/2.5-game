# *VERDANT SIGNAL* — Phase 5 Player Character Benchmark Evaluation (`128×128` Dr. Mara Lin)

> **Deliverable**: `game/assets/characters/player/mara_lin_concept_128x128.png` (`128×128` native transparent RGBA PNG)  
> **Editable Working Source**: `game/assets/characters/player/mara_lin_concept_128x128.source.json` (22 named indexed layers + full 30-color palette table)  
> **Authoring Script**: `tools/build_mara_lin_128.py` (uses `tools/pixel_art_core.py`)  
> **Scope Boundary**: Single high-craft character concept & visual-quality benchmark (NOT prematurely expanded into a multi-frame animation sheet).  
> **AST-001 Continuity Notice**: This `128×128` benchmark asset **coexists alongside**—and does **not** overwrite—the audited `AST-001` (`char_mara_lin_sheet.png`, `96×384`, `16×24` frame cells) specification in `docs/asset-production/ASSET_REQUESTS.md`. It establishes Mara Lin's visual identity, palette ratios, material rendering, and detail hierarchy before any full animation-sheet production resumes.

---

## 1. Exact Technical Verification Metrics

| Specification | Measured Value | Status |
| --- | --- | :---: |
| **Native Canvas Dimensions** | Exact `128 × 128 px` (`RGBA`, 8-bit lossless PNG) | **PASS** |
| **Opaque Pixel Count / Fill Ratio** | `4,682 px` (`28.6%` of canvas — generous balanced negative space) | **PASS** |
| **Opaque Bounding Box** | `(25, 10)` to `(107, 117)` -> `83 × 108 px` (`10 px` top margin, `10 px` bottom margin, `25 px` left, `20 px` right) | **PASS** |
| **Unique Colors Used** | `28` colors — `100%` within the 30-color *VERDANT SIGNAL* Master Palette (`0` off-palette) | **PASS** |
| **Pure `#000000` or `#FFFFFF`** | `False` (`0` pixels) | **PASS** |
| **Semi-Transparent Alpha Pixels** | `0` pixels (strict binary alpha: `0` or `255` only; zero antialiasing blur halos) | **PASS** |
| **4-Connected Single-Pixel Count** | `33` pixels (`0.70%` of opaque pixels — almost exclusively diagonal 8-connected curve vertices on the parabolic dish/oscilloscope waveform and intentional 1px specular catchlights) | **PASS** |
| **Background / Borders / Text** | Completely transparent (`#00000000`); zero framing, labels, or baked floor shadow | **PASS** |

---

## 2. Iterative Craft Refinement Log (Round 1 -> Round 2 -> Round 3)

Every round was visually inspected at `1×` native, `4×` nearest-neighbor zoom over sunlit reference olive grass (`#667A4D`), deep shaded forest (`#24362A`), grayscale luminance separation, and solid black silhouette panels:

- **Round 1 -> Round 2 Improvements**:
  - Removed the redundant second vertical helmet ear-pod antenna stub that crowded the backpack's primary whip telemetry antenna.
  - Replaced a rigid horizontal forehead brow stripe on the helmet with a smooth sculpted dome curve and cleaner ivory dorsal crest.
  - Added a proper curved pressure-suit pelvis/saddle gusset with diagonal hip tension folds below the utility belt and broke horizontal shin banding into asymmetrical diagonal fabric gathers above both boots.
  - Added subtle 3/4 sole perspective lift on the heavy lugged boots and widened the staggered stance slightly for steadier weight distribution.
  - Exposed the corrugated EVA life-support conduit hose (previously obscured underneath the front arm layer) arching cleanly from backpack to neck lock ring.
  - Slashed unintended 1px orphan pixels from `45` down to `22` in Round 2.
- **Round 2 -> Round 3 Silhouette & Negative-Space Improvements**:
  - **Caught via Solid Silhouette Inspection**: Round 2's angled cylindrical scanner read ambiguously in pure black silhouette; redesigned it into a crisp, unmistakable flared **parabolic acoustic field scanner** with boxy titanium chassis, orange casing trim, concave dark-teal resonance dish, and glowing emitter core.
  - **Caught via Negative-Space Audit**: Compacted the life-support backpack vertically (`y=31..64`) so it rides authentically across the upper/mid back instead of hiding the waist, opening a clean transparent **negative-space breathing window** between Mara's bent left forearm and cinched torso waist.
  - Terminated the corrugated EVA shoulder hose cleanly at the left neck collar latch so both the hose and the upper-left titanium harness buckle read without overlap.

---

## 3. Honest 9-Criteria Internal Quality-Gate Assessment

1. **Silhouette Readability — STRONG PASS**: Immediately recognizable in solid black silhouette as an oversized frontier astronaut & xenobiologist (compact upper-back pack + O2 tank + single whip antenna, iconic domed helmet + ear pods, clear breathing gap between left arm and waist, negative-space window between legs, flared parabolic field scanner).
2. **Cluster Discipline — STRONG PASS**: Bold sculpted clusters across shoulders, chest, thighs, helmet dome, and titanium plates; zero modulo fabric static, zero muddy gradients, zero unmotivated dithering.
3. **Palette Quality & Restraint — STRONG PASS**: Uses `28` colors strictly from the 30-color reference-derived Master Palette; earthy burnt-orange/terracotta (`S0`–`S5`), weathered leather brown (`B0`–`B4`), warm-cool titanium (`M0`–`M5`), muted atmospheric teal (`V0`–`V5`), and alien moss specimen accents (`O2`–`O4`) harmonize directly with sunlit olive grass and deep pine shadow.
4. **Light & Shadow Consistency — STRONG PASS**: Consistent upper-left key light (`~35°–40°`) across every component, with crisp projected shadows cast by the helmet/collar onto the chest, the chest oscilloscope onto the lower torso, the belt onto the thighs, and the strapped knee guards onto the shins.
5. **Material Definition — STRONG PASS**: Clear four-material separation (matte/satin quilted fabric vs. dark weathered leather/rubber vs. high-contrast brushed titanium vs. curved translucent dark-teal glass with layered horizon reflection & razor-sharp specular slash).
6. **Detail Hierarchy — STRONG PASS**: Primary focal hierarchy pulls the eye immediately to the bright helmet crest and deep curved glass visor -> chest oscilloscope & weathered leather harness -> glowing green-moss hip sample canister & parabolic acoustic scanner, while keeping lower limbs calmer and grounded.
7. **Pixel-Level Cleanliness — PASS**: Strict binary transparency, zero off-palette colors, zero `#000000`/`#FFFFFF`, crisp area-colored directional sel-out instead of flat black ink outlines.
8. **Alignment With Reference Artistic Language — PASS**: Captures the reference's painterly low-chroma warmth, deep cool plum-charcoal shadow anchors (`#1B1420`/`#231622`), warm apricot highlights (`#EFC17C`), calm flat-plane value grouping, and edge control without copying any scene element or creature.
9. **Suitability for Future Godot Integration & Animation — PASS**: Clean `128×128` transparent RGBA PNG with `Nearest` filtering compatibility, consistent 1px pixel scale, centered mass with `10 px` top/bottom margin, zero baked floor shadow, and 22 cleanly separated semantic layers in `.source.json` ready for future rigging/animation breakdown.

---

## 4. Honest Remaining Weaknesses & Next Artistic Growth Targets

To uphold strict artistic honesty (never falsely claiming perfection), the following real limitations remain open for future polish or when adapting into animated sprites:

1. **Micro-Symmetry in Lower-Torso / Leg Geometry**: Although Mara's stance uses a 3/4 turn, staggered boot baselines (`y=118` vs `y=115`), and asymmetrical gear (backpack, mission patch, left pouch vs. right moss canister, parabolic scanner), the core torso and hip alignment still leans slightly toward a heroic 3/4-front "showcase stand" rather than a full dynamic twist with dramatic foreshortening. When producing animated walk/idle cycles, exaggerating hip sway and counter-rotating shoulders by `2–3 px` will add even greater life.
2. **Subtle Internal Anti-Aliasing on Curved Diagonal Edges**: Outer contours deliberately retain strict binary alpha with directional sel-out (required for transparent game sprites over arbitrary backgrounds), and inner transitions are intentionally crisp; however, a few steep inner edges—such as the diagonal upper rim of the parabolic scanner dish (`x=98..105, y=64..70`)—still show slight 1px stair-stepping at `4×` zoom that could be hand-softened with 1–2 manual internal AA buffer pixels.
3. **Visor Interior Narrative Subtlety**: The glass visor convincingly reads as curved reflective dark-teal glass with recessed interior depth, but does not yet depict subtle facial features (eyes/brow hint) inside the helmet. This was a deliberate readability choice to preserve iconic astronaut mystery at game scale; if close-up dialogue portraits (`256×256`+) are added later, softly suggested eyes behind the tinted dome would deepen emotional storytelling.
4. **Downscaling Path to In-Game `AST-001` (`16×24` / `32×48`)**: Because this `128×128` concept benchmark intentionally showcases rich suit seams, oscilloscope waveforms, and a hanging moss canister, it **must not** be mechanically downscaled with bilinear/nearest resize to create `AST-001`! Instead, its visual hierarchy (orange helmet crest + dark-teal visor + silver backpack silhouette + brown harness + boots) should be manually re-authored via pixel abstraction at target in-game sprite resolution when Milestone 02 art production begins.
