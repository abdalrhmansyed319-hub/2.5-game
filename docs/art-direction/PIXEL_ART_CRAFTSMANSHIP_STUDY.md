# *VERDANT SIGNAL* — Professional Pixel Art Craftsmanship Study

> **Phase 1 Production Reference Document**  
> **Purpose**: Establish verifiable, studio-grade pixel-art technical rules before executing artist training exercises (Phase 3) and the `128×128` Dr. Mara Lin character visual benchmark (Phase 5).  
> **Primary Visual Study Target**: Attached painterly 3/4 oblique pixel-art wilderness reference (`~308×238` native pixel grid, scaled ~`3.5×` in capture), synthesized with foundational craft literature from Derek Yu, Pedro Medeiros (Saint11), Raymond Schlitter (Slynyrd), Cure (PixelJoint), and contemporary cluster/dithering analysis.

---

## 1. Pixel Clusters & Intentional Pixel Placement

- **Core Law**: Pixels are the atomic grid unit, but **pixel clusters** (contiguous, same-color pixel shapes) are the artist's actual brushstrokes (Cure; Schlitter). Every cluster must communicate a distinct anatomical plane, fold, shadow cast, or specular catchlight.
- **Anti-Noise Rule (Orphan Pixels)**: An isolated `1×1` pixel sitting on a flat field reads as digital dirt unless it serves a deliberate high-contrast purpose (specular glint on wet glass/metal, tiny berry catchlight, eye sparkle, deliberate grit dot on soil). During cleanup, every unintended orphan is either absorbed into an adjacent cluster or removed.
- **Cluster Count Economy**: A readable limb, torso pad, or rock needs **3–5 bold, intentional clusters** (core shadow, midtone, lit plane, accent highlight), not 14 fractured scraps. As seen on the foreground moose in our reference (~`67×61` native px), the entire shoulder and ribcage read cleanly because large sunlit terracotta clusters anchor the mass while smaller 2–4 px fur/ridge clusters break only the light-to-shadow terminator.
- **Zero-Accident Construction**: Every pixel in a sprite must belong strictly to a deliberate limited palette with binary alpha (`A = 0` or `A = 255`) on the silhouette edge — never soft brush bleed, never automatic downsampling blur, and never semi-transparent halo pixels.

---

## 2. Pixel Density & Resolution Management

- **Uniform Pixel Scale (Zero "Mixels")**: All elements in a sprite or scene must share one strict `1:1` native pixel grid. Scaling assets to non-integer ratios (e.g., `1.35×` or `193.5%`) destroys square pixel uniformity (Schlitter).
- **Resolution Dictates Abstraction Budget**:
  - Small sprites (`16×24` to `32×32`): Every pixel carries symbolic load; shape and value contrast outrank fine seams (Derek Yu).
  - Medium-large benchmark sprites (`64×64` to `128×128`, matching the `~50×58`–`67×61` creatures in our reference and our `128×128` Mara Lin character concept): Enough pixel real estate to render material separation (quilted suit baffles, brushed metal latches, curved reflective helmet glass, stitched seams) **without** abandoning visible pixel-cluster craftsmanship.
- **Detail Density Calibration**: Never pack maximum detail into every square inch of a `128×128` sprite. Match the reference's density rhythm: ~`60%` broad, readable volume clusters + ~`30%` medium structural folds/seams + ~`10%` concentrated crisp micro-detail (visor reflections, clasps, telemetry LEDs, edge highlights).

---

## 3. Silhouette Construction & Readability

- **Silhouette-First Workflow**: Establish a strong, asymmetrical, unmistakable silhouette in flat solid color before placing a single shade pixel (Derek Yu; Schlitter). If the silhouette fails in solid black against white, interior shading cannot rescue it.
- **Negative Space & Limb Separation**: Carve clear pockets of negative space between torso, arms, tool/pack protrusions, and legs so the pose reads instantaneously at `1×` native resolution. Notice in the reference how the moose antlers, neck arch, belly gap, and separated legs create immediate figure recognition even from across a room.
- **Pose & Weight**: Avoid stiff front-facing T-poses. Use a grounded 3/4 stance with subtle contrapposto weight shift, slightly staggered boots, and asymmetrical equipment silhouette (backpack housing, chest module, left/right arm variation).

---

## 4. Form Construction Using Pixel Clusters (Not Blurry Gradients)

- **Sculpting 3D Planes (Saint11 / Derek Yu)**: Imagine the character as clay primitives (sphere helmet, cylindrical limbs, beveled torso chest-rig, cushioned baffle pads). Flat planes hold **one uniform value**; curved planes step smoothly across 3–5 value clusters perpendicular to the key light.
- **Eliminate Pillow-Shading**: Never ring a shape symmetrically with darker pixels inward from its entire outline. Pillow-shading ignores light direction and flattens volume into inflated balloons (Cure; Saint11). Light must strike one consistent hemisphere (upper-left) and cast volume shadows across the opposite hemisphere (lower-right).
- **Eliminate Banding**: Banding occurs when two adjacent color clusters hug along a long parallel stair-step diagonal, producing a thick "fat pixel" seam that pins the surface flat (Cure; the-pixel.art). Fix banding mechanically by:
  1. **Interlocking cluster edges** (irregular toothed/zipper transitions following form contours).
  2. **Compressing mid-transition strips** on sharp bevels.
  3. **Breaking parallel diagonals** so each cluster shifts angle with the underlying 3D plane.

---

## 5. Professional Color Theory & Limited Palettes

- **Palette Discipline**: Constraining a character/study to **16–32 deliberate colors** (organized into 4–6 linked material ramps sharing common deep shadows and warm highlight anchors) enforces visual cohesion and stops muddy over-rendering (Derek Yu; Schlitter).
- **Chroma Restraint (Key Insight from Reference)**: Quantitative sampling of the attached reference proves that **global median saturation is only `38.0%`** (interquartile range `32.3%–42.3%`, with `p95 = 58.3%`), while value stays grounded around `median V = 45.9%` (`p05 = 19.2%`, `p95 = 71.8%`). High-craft painterly pixel art **avoids neon `90–100%` saturation** on large surfaces; instead, restrained earthy midtones allow modest highlights (`V = 75–94%`) and small focal accents to glow like genuine sunlight.
- **Value Verification (Grayscale Squint Test)**: Desaturate any sprite to grayscale and view at `1×`. Primary forms (helmet, torso, limbs, focal visor/pack) must separate purely through luminance hierarchy (Derek Yu).

---

## 6. Hue Shifting & Color Temperature

- **Never Use Straight Ramps**: Dragging only brightness down produces dead, muddy gray shadows; dragging only brightness up produces chalky pastel highlights (Cure).
- **Reference-Proven Temperature Arc**:
  - **Highlights -> Warm** (shift hue toward golden-yellow / warm parchment-peach, `H ≈ 35°–60°`; lower saturation slightly at peak specular).
  - **Midtones -> True Material Hue** (highest meaningful material chroma — e.g., burnt orange-terracotta `H ≈ 12°–26°`, muted teal `H ≈ 172°–185°`, olive moss `H ≈ 80°–100°`).
  - **Shadows -> Cool & Deep** (rotate hue firmly toward **deep crimson-mahogany -> plum-indigo-violet `H ≈ 260°–350°`** on warm objects, or **deep forest teal-slate `H ≈ 150°–210°`** on cool/neutral objects).
- **Universal Shadow Bridge**: Sharing one unifying deep shadow tone (`#1D1422`–`#241E2E` cool plum-charcoal, measured directly on the reference antlers, bush interiors, and deep pond shadows) ties metal, fabric, glass, and organic surfaces into one physical atmosphere.

---

## 7. Light Direction, Ambient Lighting & Cast Shadows

- **Locked Key-Light Vector**: **Upper-left (~10–11 o'clock, oblique 45° top-front-left)**, matching both the attached reference and *VERDANT SIGNAL*'s world lighting lock.
- **Five Light Zones on Every Sculpted Form (Saint11)**:
  1. **Specular / Reflection Highlight**: Tiny, tight, high-value cluster on smooth/hard surfaces (visor glass, brushed steel rim); absent or broad/soft on matte padded fabric.
  2. **Lit Plane**: Broad warm-shifted primary clusters facing top-left.
  3. **Core Terminator & Volume Shadow**: Sharp, confident shift into rich saturated mid-dark then cool deep shadow on lower-right curved turns.
  4. **Projected / Cast Shadows**: Crisp, high-contrast cast shadows where overlapping parts block light (helmet overhang onto collar, chest pack onto lower suit, arm onto torso, boots onto ground).
  5. **Subtle Bounce / Ambient Fill**: Faint cool sky/teal-slate lift along select lower-right shadow edges on metallic or glassy surfaces so shadows feel three-dimensional rather than flat cutouts.
- **Grounded Cast Shadows**: In the reference, every moose casts a crisp, low-value **cool slate-green-charcoal (`#1A2224`)** shadow anchored firmly under its contact points and extending rightward with slightly broken, organic edges — never a generic semi-transparent airbrushed oval.

---

## 8. Material Rendering: Fabric, Metal, Glass & Organic Surfaces

| Material | Value Contrast | Highlight Behavior | Shadow & Edge Treatment | Cluster Signature |
| --- | --- | --- | --- | --- |
| **Padded Heavy Fabric** *(astronaut suit)* | Medium-high (`4–5` tones) | Broad, soft-edged warm amber/peach lit crests; **no sharp white specular dots** | Warm mahogany core fold shadows -> cool plum-brown deep seam crevices; stitched seams read via crisp 1 px recessed dark lines paired with 1 px lit upper ridge | Soft rounded sculptural pillows separated by crisp diagonal/curved seam channels and compression creases at elbows/knees |
| **Brushed / Weathered Metal** *(clasps, helmet ring, canister)* | **Very High** (dramatic dark-to-bright leaps) | Tight, sharp, elongated bright specular bars (`#E8E3CC`–`#F4F2DC`) placed directly next to deep shadow bands | High-contrast dark cool slate/plum reflections (`#242430`) + subtle cool-teal sky bounce + warm amber suit bounce on underside! | Crisp horizontal/curved reflection stripes with abrupt 1-step transitions (metal reflects its environment, not soft diffuse gradients!) |
| **Curved Glass Visor** *(helmet faceplate)* | **Extreme + Layered Depth** | Razor-sharp curved white/cream specular slash (`#F3F6D4`) on upper-left curvature + tiny secondary dot glint | Deep cool dark teal-indigo interior (`#14212B` -> `#223A44` -> `#3D5E62`) showing subtle recessed interior silhouette/horizon tint + faint bottom-right rim reflection | Clean smooth curved bands following spherical visor geometry; zero noisy speckling inside glass! |
| **Organic Surfaces** *(moss, bark, stone, bone, foliage)* | Medium-rich, earthy | Warm sunlit parchment/ochre clusters on upper crowns | Deep cool plum-brown or forest-teal occlusion underneath; zero black outlines | Broken, interlocking irregular 2–5 px clusters suggesting natural growth, weathering, and grain without visual static |

---

## 9. Dithering Techniques — And When NOT to Use Dithering

- **When Dithering Works**: Large low-contrast atmospheric transitions (misty skies, wide pond water reflections) or deliberate tactile grit (dry gravel, rough burlap, weathered rust) across areas **at least `8–10 px` wide** using controlled ordered patterns (25% / 50% checkerboard / 4×4 Bayer) between **closely spaced values** (the-pixel.art; Derek Yu).
- **When NOT to Use Dithering**:
  - **NEVER** across small character limbs, helmet visors, or tight fabric folds (`< 8 px` wide) — it turns clean forms into noisy TV static.
  - **NEVER** between high-contrast colors (creates harsh vibrating checkerboard grids).
  - **NEVER** as a crutch to fake gradients on smooth metal or glass.
- **Reference Verdict**: The attached reference uses **virtually zero mechanical checkerboard dithering**. Instead, it blends planes via **interlocking organic clusters** and subtle `1–2 px` edge teeth — which is the exact technique we lock for *VERDANT SIGNAL*.

---

## 10. Texture Creation Without Visual Noise

- **Implied Texture > Literal Pixel-by-Pixel Texture**: Suggest weave, scuffing, fur, or grass by placing texture detail **strategically along the light-to-shadow terminator** and in focal clusters while leaving lit planes and deep shadows relatively calm (Schlitter).
- **Detail-to-Rest Ratio**: Follow the **70/30 visual rest rule** — calm midtone planes give the eye breathing room so seams, metallic rivets, scuffs, and visor reflections read as crisp craftsmanship rather than visual chaos.

---

## 11. Anti-Aliasing (AA) Designed Specifically for Pixel Art

- **Manual Internal AA Only**: Place 1–3 px intermediate-value pixels inside jagged curved corners and long shallow diagonals *inside* the sprite (such as the curved helmet visor rim or curved chest plate), scaling AA length proportionally to the segment length it bridges (Derek Yu; Cure).
- **Strict Rules**:
  - **NEVER** anti-alias 45° lines or perfectly horizontal/vertical edges (makes them blurry).
  - **NEVER** anti-alias the **exterior silhouette against transparency** with semi-transparent alpha pixels (produces ugly pale/dark halos when composited over changing game backgrounds in Godot!).
  - **NEVER** let AA pixels line up symmetrically across adjacent color steps (creates AA-banding).

---

## 12. Edge Control & Pixel Consistency

- **Clean Curve Math (No Jaggies)**: Curved silhouettes and internal contours must progress monotonically in segment length (e.g., `4 -> 3 -> 2 -> 1 -> 1 -> 2 -> 3 -> 4`). Abrupt step reversals (e.g., `3 -> 1 -> 3 -> 1`) create unsightly jaggies that must be smoothed manually during polish (Derek Yu).
- **Selective Outlining (Sel-Out) & Edge Polarity**: Match the reference's sophisticated edge language:
  - **NO uniform `#000000` cartoon outlines!**
  - Use **deep cool plum-brown / dark slate (`#1D1422`–`#2A1C28`)** on shadowed undersides, occluded undersides of pads, and high-contrast separations.
  - Use **darker area-colored tones** (deep burnt mahogany `#4F2826`, dark slate `#34424A`) along mid-lit outer silhouettes so edges stay crisp over any terrain without looking sticker-pasted.
  - Allow **warm lit edges** on top-left sun-catching crests (helmet crown, sunlit shoulder ridge) to meet the world cleanly via value contrast rather than heavy dark ink.

---

## 13. Depth, Perspective & Environmental Integration

- **Oblique 3/4 Top-Down Projection**: Slight downward viewing angle (~25°–35° above horizontal), so we see the top crown of the helmet, top plane of shoulders/backpack, slight downward curve of chest straps/belt/collar ellipses, and planted boots resting on a coherent ground plane (front boot slightly lower in Y than rear boot for depth!).
- **Atmospheric Cohesion**: Even on a standalone transparent character sprite, subtle cool-teal ambient bounce from Oura-IV's coastal sky/foliage on dark metallic edges and deep plum-slate shadow grounding make Dr. Mara Lin belong physically inside the reference's sunlit wilderness world.

---

## 14. Sprite Readability at Actual Game Resolution

- **Multi-Scale Verification**: Always audit pixel art at **three scales**:
  1. **`1×` Native (`100%`)**: Tests true silhouette clarity, value hierarchy, focal point (helmet/visor + orange chest mass), and instant readability without squinting.
  2. **`2×` Preview (`200%`)**: Matches actual game presentation on `1366×768` / `1080p` displays.
  3. **`4×` Zoom (`400%`)**: Exposes jaggies, orphan pixels, banding, stray palette leaks, and sloppy cluster joins.
- **Focal-Point Hierarchy**: Highest value contrast sits at the **head/helmet visor & upper torso telemetry pack**, stepping down slightly toward legs/boots so the player's eye locks immediately onto the character's identity.

---

## 15. Rich Detail With Clean Shapes (Professional Workflow)

Synthesized from Schlitter, Saint11, and Derek Yu, every asset in *VERDANT SIGNAL* follows a strict **5-Pass Construction Discipline**:
1. **Pass 1 — Silhouette & Anatomical Proportion Block-In**: Solid shape, clear negative space, grounded stance, asymmetrical gear read.
2. **Pass 2 — Major Color Planes & Core Light/Shadow Split**: Flat material zones + bold upper-left light vs. lower-right shadow clusters (zero micro-detail yet!).
3. **Pass 3 — Sculpted Form, Folds & Cast Shadows**: Volume modeling (baffles, folds, visor dome, metallic cylinders) + crisp projected shadows between overlapping parts.
4. **Pass 4 — Material Polish & Focused Detail**: Seams, stitched ribs, brushed metallic highlights, visor reflection slash, subtle telemetry glow, organic surface texture at terminators.
5. **Pass 5 — Pixel-Level Audit & Cleanup**: De-jag curves, purge unintended orphan pixels, break any parallel banding, verify sel-out edge discipline, run grayscale squint test + `1×`/`2×`/`4×` review.

---

## 16. Repeatable Studio Quality-Control Checklist (Art Quality Gate)

Every practice sheet and production sprite MUST be audited honestly against all 10 criteria before approval:

- [ ] **QC-01 Exact Native Grid & Zero Blur**: Exact target pixel dimensions, `RGBA8` PNG, binary silhouette alpha (`0` or `255` only), zero auto-AA, zero upscaling/downsampling artifacts.
- [ ] **QC-02 Strict Limited Palette**: Total color count strictly bounded (`<= 32` colors for `128×128` hero character; `<= 16` for isolated material studies), organized into coherent hue-shifted ramps with shared shadow anchors.
- [ ] **QC-03 Instant `1×` Silhouette Readability**: Unmistakable pose, gear identity, and clear negative space at `100%` native size and in solid silhouette.
- [ ] **QC-04 Locked Light Direction**: Consistent upper-left (~10–11 o'clock) key light across every component, with crisp projected shadows cast down-right. Zero pillow-shading.
- [ ] **QC-05 Cluster Cleanliness**: Bold, intentional clusters; zero unintended orphan pixels; zero parallel diagonal banding seams; clean monotonic curve progression (de-jagged).
- [ ] **QC-06 Hue-Shifted Value Hierarchy**: Warm-shifted sunlit crests, earthy controlled midtones (no neon saturation overload), cool deep plum/slate shadows; passes grayscale value separation test.
- [ ] **QC-07 Distinct Material Separation**: Fabric reads soft & quilted; metal reads crisp & high-contrast reflective; glass reads deep, curved & specular; organic forms read naturally textured.
- [ ] **QC-08 Edge & Sel-Out Mastery**: Zero harsh uniform `#000000` outline; clean area-colored/shadow-weighted edges that hold up against both light sunlit terrain and dark shaded terrain.
- [ ] **QC-09 Reference Aesthetic Fidelity**: Evokes the painterly, earthy, atmospheric handcrafted pixel craftsmanship of the visual style reference without copying its subject matter.
- [ ] **QC-10 Godot & Animation Readiness**: Crisp pivot alignment, clean logical part separation (head/helmet, torso/pack, limbs, boots) ready for future animation breakdown and `Nearest`-filtered Godot rendering.

---

## 17. Verified Research Sources

1. **Derek Yu**, *Pixel Art Tutorial: Basics* (`derekyu.com/makegames/pixelart.html`) — Silhouette construction, line de-jagging, clay-volume shading, manual internal AA, selective outlining (sel-out), sparing dithering, and grayscale value checks.
2. **Pedro Medeiros (Saint11)**, *4 – Basic Shading* (`saint11.art/pixel_art_articles/article4/`) — Light physics (volume shadow, sharp terminator, projected shadow, specular reflection, bounce light), flat vs. curved planes, pillow-shading avoidance, and deliberate simplification over photo resizing.
3. **Raymond Schlitter (Slynyrd)**, *Pixelblog #5–7, #54, #57 & Pixel Diary* (`slynyrd.com/blog`) — Pixel-cluster thinking, strict integer scaling, limited-palette discipline, layered anatomical armor/character construction, and pushing detail just until the mind fills the rest.
4. **Cure (PixelJoint)**, *The Pixel Art Tutorial* (`pixeljoint.com/forum/forum_posts.asp?TID=11299`) — Formal definitions of pixel clusters, banding taxonomy (45°, skip-one, AA-banding), pillow-shading diagnostics, and hue-shifted color ramps.
5. **the-pixel.art Technical Guides**, *Clusters, Orphan Pixels, and Banding* & *Dithering in Pixel Art* (`the-pixel.art/articles/`) — Mechanical banding fixes (edge interlocking, band compression), orphan pixel discipline, and strict criteria for when dithering succeeds vs. turns sprites into static.
6. **Direct Forensic Pixel & Palette Analysis of Primary Visual Style Reference** (`/tmp/arena-coding-uploads/IMG_20261126_155715.jpg`) — Measured native pixel pitch (`3.505 px` -> `~308×238` native canvas), exact HSV hue-shifting curves across 8 material crops, saturation discipline (`median S = 38%`), and shadow/cluster anatomy.
