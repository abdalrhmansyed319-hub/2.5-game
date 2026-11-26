# *VERDANT SIGNAL* — Dr. Mara Lin `128×128` Refinement Pass (`v1` -> `v2`) Comparison Report

> **Original Asset (Preserved Untouched)**: `game/assets/characters/player/mara_lin_concept_128x128.png` + `.source.json`  
> **Refined Asset (Separate Version)**: `game/assets/characters/player/mara_lin_concept_128x128_v2.png` + `.source.json`  
> **Side-by-Side Comparison Sheet (`4×` + `1×` Native)**: `docs/art-direction/mara_lin_v1_vs_v2_comparison.png`  
> **Authoring Script**: `tools/build_mara_lin_128_v2.py`  
> **Preservation Guarantee**: Original `v1` PNG/JSON, `AST-001` (`96×384`), `game/project.godot`, and all Milestone 01 gameplay files remain 100% untouched.

---

## 1. Quantitative Technical Verification (`v1` vs. `v2`)

| Metric | Original (`v1`) | Refined (`v2`) | Notes |
| --- | :---: | :---: | --- |
| **Native Dimensions** | `128 × 128` RGBA | **`128 × 128` RGBA** | Exact native canvas, zero upscaling/downscaling |
| **Opaque Pixel Count / Fill** | `4,682` (`28.6%`) | **`4,544` (`27.7%`)** | Cleaner negative space & tapered silhouette |
| **Opaque Bounding Box** | `(25, 10)`–`(107, 117)` | **`(22, 11)`–`(104, 116)`** | Balanced margins: `22 px` L, `23 px` R, `11 px` T, `11 px` B |
| **Unique Colors Used** | `28` (`0` off-palette) | **`27` (`0` off-palette)** | Tighter restraint inside the 30-color Master Palette |
| **Non-Binary Alpha Pixels** | `0` | **`0`** | Strict binary transparency (`0` / `255`), zero blur |
| **4-Connected Single Pixels** | `33` (`0.70%`) | **`28` (`0.61%`)** | Strictly intentional catchlights & diagonal waveform vertices |
| **Pure `#000000` / `#FFFFFF`** | `False` | **`False`** | Warm-cool painterly shadow & highlight discipline |

---

## 2. Exact Improvements Across All 7 Priorities

1. **Handheld Acoustic Field Scanner Framing & Geometry (Priority 1)**:
   - Replaced `v1`'s horizontally shoved, flat-cut right rim (`x=107`) with a complete, closed 3/4 elliptical parabolic collector dish angled attentively upward (`~24°`), complete with shaded metallic bowl, internal acoustic receiver pin, and ergonomic rubber handle gripped cleanly by the gloved right hand.
   - Comfortably framed inside the canvas (`x_max = 104`, leaving **`23 px`** of unobstructed right margin) with complete visual separation from the hanging right-hip moss specimen vial.
2. **Pose & Explorer Body Language (Priority 2)**:
   - Transformed `v1`'s stiff upright vertical stance into a living **3/4 contrapposto field-research pose** without altering Mara's identity: attentive forward-right helmet/upper-chest lean, true 3/4 foreshortened torso & angled chest oscilloscope, confident bent left arm resting toward her hip pouch (opening a crisp triangular negative-space window inside the elbow), gently tilted utility belt, tapered sculptural calves, and a wider grounded exploratory stride.
3. **Pixel Cluster Cleanliness & Noise Reduction (Priority 3)**:
   - Eliminated `v1`'s noisy horizontal accordion stripes on both shins, replacing them with calm sculpted fabric planes and a single bold organic diagonal fold above each boot cuff.
   - Replaced `v1`'s 3-bar "robot teeth" chin grille with a calm sculpted dark recessed intake port, smoothed the jagged bright stair-steps along the visor bezel, removed the noisy 4-dot bottom vent row on the chest rig, and scaled down boxy bright boot latches into compact brushed-titanium clasps.
4. **Material Separation in Color & Grayscale (Priority 4)**:
   - Deepened leather/rubber surfaces (harness straps, belt, pouch, knee guards, gloves, boots) into a compressed dark `B0`/`B1` core with crisp selective `B2`/`B3` edge wear — visibly separating leather from burnt-orange cloth (`S3`/`S4`) in **both** full color and grayscale.
   - Sharpened titanium value jumps (`M0`/`M1` -> `M4`/`M5`) on the backpack chamfer, O2 cylinder, neck collar, chest rig bevel, buckles, and parabolic dish.
   - Deepened curved dark-teal glass (`V0`/`V1`) with a smooth spherical horizon sweep (removing `v1`'s flat dark mid-visor band) and clean upper-left specular slash.
5. **Lighting Transitions & Shadow Shapes (Priority 5)**:
   - Reserved bright apricot highlight `S5` strictly for upper hero crests (helmet crown, left shoulder dome, upper chest ridge) instead of flooding the thighs and lower arm, restoring rich burnt-terracotta midtones and crisp diagonal ~38° projected shadows under the collar, chest rig, belt, and knee guards — with zero blur or smooth gradients.
6. **Stylistic Consistency With Environmental Reference (Priority 6)**:
   - Removed `v1`'s mechanical uniform 1px dark outer border wrapping the right/bottom contours, adopting the reference's **lineless sunlit upper-left crests** and **sculpted plum-aubergine volume shadow masses**, paired with subtle `2×2` macro-block painterly cluster interlocking on soft fabric contrasted against taut, geometric hard edges on titanium and glass.
7. **Technical Compliance (Priority 7)**:
   - Preserved exact `128×128` transparent RGBA dimensions, binary alpha, and untouched `v1` source files.

---

## 3. Honest Assessment — What Still Needs Work

1. **Further Organic Breaking of Silhouette Contours**: While `v2` dramatically softens `v1`'s mechanical outline and introduces painterly cluster interlocking on fabric interiors, parts of the outer silhouette (most notably the right outer shoulder edge and backpack housing corners) still read slightly cleaner and more geometric than the rough, hand-tufted brushstroke silhouette of the reference's organic moose. This is partly appropriate for engineered space-suit hardware, though subtle 1–2 px fabric seam dimples and micro-weathering breaks along the outer sleeves and trousers could bridge the painterly gap even further.
2. **Micro-Definition Inside the Right Gloved Hand & Scanner Grip**: Because Mara's right forearm and glove sit on the shaded far side of the body, the transition between the dark leather glove (`B0`/`B1`), shaded wrist cuff (`M1`), and dark rubber pistol grip (`B0`) compresses slightly at `1×` native resolution. Adding a tiny `1–2 px` cool reflected rim highlight (`B2` or `M2`) separating thumb, palm, and grip would sharpen hand readability at `1×`.
3. **Subtle Environmental Ground Bounce on Lower Boots & Suit Hem**: In the reference scene, objects standing on sunlit olive grass pick up faint earthy warmth/olive-slate bounce along their lowest undersides. Because `v2` is a standalone transparent sprite meant to travel across multiple biomes (Amber Coast, Singing Canopy, Mossy Rimlands), keeping lower shadows biome-neutral plum-charcoal (`B0`/`S0`) is safer for engine reuse — though an optional biome-tinted ground bounce shader or subtle dusty scuff along the boot soles could further integrate her once placed in-world.
4. **Animation-Sheet Readiness Note**: This `128×128` benchmark locks silhouette, proportions, material separation, and painterly craft at hero showcase resolution; before producing `AST-001` (`96×384`) or higher-res animated sprites, a separate manual pixel-abstraction pass (never automated downscaling) will still be needed to validate walk-cycle readability at in-game scale.
