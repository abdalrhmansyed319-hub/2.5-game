# *VERDANT SIGNAL* — Painterly Pixel Art Style Guide

> **Phase 2 Style Deconstruction & Production Law**  
> **Reference Source**: Primary attached painterly 3/4 oblique pixel-art reference (analyzed directly from artwork pixels, ignoring surrounding UI).  
> **Mandate**: Reproduce the reference's **artistic craftsmanship, palette sophistication, lighting cohesion, cluster discipline, and tactile richness** across *VERDANT SIGNAL*'s alien-planet survival identity — never copy its moose, bushes, pond, or composition.  
> **Spec Continuity Note (AST-001 Protection)**: This style guide defines the elevated visual-craftsmanship standard and introduces the **`128×128` Dr. Mara Lin Character Concept & Visual Quality Benchmark** (`game/assets/characters/player/`). Milestone 01's `AST-001` (`96×384` / `16×24` prototype animation sheet in [`docs/asset-production/ASSET_REQUESTS.md`](../asset-production/ASSET_REQUESTS.md)) remains intact and explicitly documented until visual direction & in-game sprite scale are formally locked after Phase 5 review.

---

## 1. Forensic Deconstruction of the Visual Style Reference

Direct spatial-frequency (FFT) and per-region HSV quantization of the attached reference (`1080×833` capture) extracted its exact underlying artistic architecture:

| Visual Dimension | Quantitative Measurement From Reference | Artistic Law Extracted for *VERDANT SIGNAL* |
| --- | --- | --- |
| **Native Pixel Scale** | `3.505 px` pitch (`~308×238` native canvas); standing creatures occupy `~50×58` to `~67×61` native px; small detailed props (skull) occupy `~26×13` native px | Keep pixel clusters chunky, deliberate, and visible at `1×`. Hero figures need enough pixel density to model overlapping 3D planes (shoulders, collar, helmet dome, pads, boots) without looking vector-smooth or low-detail 16-bit. |
| **Cluster Sizes** | Core body/surface volumes = `6–20+ px` clusters; sculptural folds/fur tufts/leaves = `2–5 px` organic clusters; focal glints/berries = `1–2 px` intentional accents | Follow the **60 / 30 / 10 Cluster Budget**: `60%` broad calm volume clusters, `30%` medium sculpted structural/fold clusters, `10%` crisp concentrated focal highlights & micro-detail. |
| **Global Value & Chroma Discipline** | `V`: `p05 = 19.2%`, `median = 45.9%`, `p75 = 52.5%`, `p95 = 71.8%`<br>`S`: `p05 = 15.1%`, `median = 38.0%`, `p75 = 42.3%`, `p95 = 58.3%` | **Earthy Painterly Restraint**: Keep dominant material midtones at `S = 35–58%` (never gaudy `95%` neon plastic!). Reserve high luminance (`V = 80–95%`) strictly for sunlit crests, tiny glass/metal specular slashes, and small focal sensors. |
| **Deepest Shadow Colors** | Antlers/crevices: `#19111D`–`#241E2E` (`H = 262°–280°`, **cool indigo-plum**, `S = 32–41%`, `V = 11–18%`)<br>Shaded grass: `#192D23` (`H = 150°`, **deep forest teal-green**, `V = 18%`)<br>Ground cast shadows: `#1A2224` (`H = 192°`, **cool slate-charcoal**, `V = 14%`) | **NEVER use pure `#000000` black!** Anchor all deepest shadows, crevice lines, and dark equipment undersides in **cool plum-indigo (`#1C1523`)** or **deep teal-slate (`#162126`)**. |
| **Highlight Colors** | Warm lit fur crest: `#C9AD92` (`H = 30°`, `S = 27%`, `V = 79%`)<br>Sunlit foliage crest: `#DDD281`–`#E5DC8A` (`H = 52°–54°`, `S = 40–45%`, `V = 85–90%`)<br>Peak bone/water glints: `#F3F6D4` (`H = 65°`, `S = 14%`, `V = 96%`) | **Warm Atmospheric Sunlight**: Highlights always hue-shift toward warm golden parchment / pale amber-ivory (`H = 34°–58°`) while **dropping saturation** as luminance approaches `90–96%`. |
| **Edge Treatment** | **Zero uniform black cartoon outlines.** Silhouettes are defined by deep plum-brown/mahogany dark edges on shadowed undersides, mid-dark area-colored edges on midplanes, and direct warm sunlit rim clusters on upper-left crests | **Sculpted Sel-Out / Painted Edges**: Use dark plum-umber (`#231724`) or deep burnt mahogany (`#442022`) on shadowed exterior edges; step up to mid-dark material edges on upper-left lit silhouettes so the character feels painted into the world rather than outlined with marker ink. |
| **Texture Density** | Quiet smooth water interior (`#647D7D` -> `#BFC0A4`) and soft olive grass planes contrast sharply against high-detail collar zones (pebble ring, antler tines, berry fronds, sunlit coat terminators) | **Focal Detail Clustering**: Concentrate high-frequency texture (stitched ribs, seams, visor speculars, chest buckles, fabric scuffs) at the **upper torso, helmet, joints, and terminators**, leaving broad sunlit pads calm and readable. |
| **Environmental Lighting** | Crisp directional sun from **upper-left (~10–11 o'clock)**; warm sunlit top-left planes, rich mid-dark core shadows on lower-right, crisp dark rightward-extending ground cast shadows (`#1A2224`) | **Unbreakable Key-Light Lock**: Every form receives warm sunlit key light from **top-left (~45°)**, cool ambient teal-slate sky bounce on select dark lower-right metal/glass faces, and crisp downward-right projected shadows. |
| **Surface Rendering** | Tactile, painterly, matte-to-satin organic surfaces (dry fur, weathered river stone, dry ivory bone, soft foliage) contrasted with crisp, clean horizontal water reflections and tiny 1–2 px bright glints | **Material Contrast Law**: Contrast Mara's **matte/satin quilted survival suit** (broad soft clusters, stitched crevices) sharply against **weathered brushed metal** (abrupt dark-to-bright specular bars) and her **deep curved helmet glass** (cool dark interior + razor-sharp cream specular slash). |
| **Overall Atmosphere** | Quiet, naturalistic, weathered, grounded wilderness — warm afternoon sun filtered through cool atmospheric shadow; melancholic yet vivid | *VERDANT SIGNAL* characters must feel **lived-in, practical, slightly weathered, and physically grounded** on an alien frontier — never shiny plastic toys or flat cartoon icons. |

---

## 2. *VERDANT SIGNAL* Master Character & Material Palette (`30` Colors)

Derived directly from the reference's measured HSV hue-shifting curves and saturation ceiling, expanded into **5 linked material ramps** that share unified shadow temperature (`#1C1523` plum-charcoal / `#142026` deep slate-teal) and warm sunlit highlight anchors (`#F2EED0` warm sunlit cream):

### Ramp A — Oversized Orange Astronaut Survival Suit *(6 Steps: Cool Plum-Brown -> Warm Amber-Peach)*
Matches the reference's extraordinary moose-coat hue arc (`265° -> 355° -> 14° -> 24° -> 36°`), shifted into recognizable high-visibility expedition orange with earthy painterly restraint:
| Role | Hex | Approx. HSV | Usage |
| --- | :---: | --- | --- |
| `SUIT_0` Deep Crevice / Underside Sel-Out | `#231622` | `H 305° S 38% V 14%` | Deepest underarm/crotch/collar occlusion & shadowed edge definition |
| `SUIT_1` Deep Shadow Fold | `#4F2425` | `H 359° S 54% V 31%` | Core fold shadows, shaded suit back, seam channels |
| `SUIT_2` Warm Shadow / Turn | `#873A2B` | `H 10° S 68% V 53%` | Lower-right volume turn, inner sleeve & padded pocket underside |
| `SUIT_3` Primary Suit Midtone | `#C25B32` | `H 17° S 74% V 76%` | Signature expedition orange-terracotta body mass |
| `SUIT_4` Lit Upper Plane | `#DE884A` | `H 25° S 66% V 87%` | Sunlit top-left chest baffles, shoulder dome, helmet trim |
| `SUIT_5` Sunlit Crease Rim | `#EFC17C` | `H 36° S 48% V 94%` | Focused warm amber-gold edge catches on upper-left padded crests |

### Ramp B — Dark Brown Harness, Straps, Gloves & Heavy Boots *(5 Steps: Cool Plum -> Weathered Leather/Rubber)*
| Role | Hex | Approx. HSV | Usage |
| --- | :---: | --- | --- |
| `BRN_0` Deepest Outline / Sole | `#1B1420` | `H 275° S 38% V 13%` | Universal darkest shadow anchor, boot treads, deep recess lines |
| `BRN_1` Dark Umber Base | `#362428` | `H 347° S 33% V 21%` | Reinforced rubber boots, knee guards, shadow side of harness |
| `BRN_2` Weathered Leather Mid | `#593C36` | `H 10° S 39% V 35%` | Utility belt, shoulder straps, glove cuffs, pouch body |
| `BRN_3` Lit Harness Plane | `#805B4B` | `H 18° S 41% V 50%` | Sunlit strap edges, worn boot toes, leather highlights |
| `BRN_4` Scuffed Warm Rim | `#AA856B` | `H 25° S 37% V 67%` | Subtle worn edge scuffing on top-left leather straps & knee guards |

### Ramp C — Weathered Brushed Metal *(6 Steps: Cool Dark Slate -> Crisp Warm Specular)*
Modeled from the reference's weathered river-stone & water-slate neutrals (`H = 210° -> 185° -> 48°`), tuned for crisp metallic contrast:
| Role | Hex | Approx. HSV | Usage |
| --- | :---: | --- | --- |
| `MET_0` Deep Metal Reflection | `#222531` | `H 228° S 30% V 19%` | High-contrast dark reflection band on cylinders & helmet neck ring |
| `MET_1` Shadowed Steel | `#414B56` | `H 211° S 24% V 34%` | Shaded backpack casing, clasps, tool barrel, visor frame |
| `MET_2` Mid Brushed Titanium | `#6A757A` | `H 199° S 13% V 48%` | Primary weathered aluminum/titanium planes |
| `MET_3` Lit Steel Plane | `#9BA39A` | `H 113° S 6% V 64%` | Upper-left sunlit metallic bevels & helmet collar ring |
| `MET_4` Bright Metal Edge | `#CFCBB4` | `H 51° S 13% V 81%` | Sharp metallic edge glint (warm sun-shifted) |
| `MET_5` Peak Specular Catch | `#F2EED0` | `H 53° S 14% V 95%` | Tiny 1–3 px specular bars on visor glass & polished metal rims |

### Ramp D — Curved Glass Helmet Visor & Muted Teal Tech Accents *(6 Steps: Deep Abyssal Teal -> Mist-Teal Glint)*
Directly echoes the reference pond's cool dusty slate-teal (`#586E6B` / `#647D7D`) and dark reflection core (`#1A2224`):
| Role | Hex | Approx. HSV | Usage |
| --- | :---: | --- | --- |
| `VIS_0` Deep Visor Core | `#141E28` | `H 210° S 50% V 16%` | Recessed helmet interior shadow & upper-inner visor cavity |
| `VIS_1` Dark Teal Glass Depth | `#213842` | `H 198° S 50% V 26%` | Shaded curved glass body & muted-teal suit trim shadow |
| `VIS_2` Muted Teal Midtone | `#3A6168` | `H 189° S 44% V 41%` | Primary visor glass curve, muted-teal equipment accents & collar patches |
| `VIS_3` Reflected Sky-Teal | `#649291` | `H 179° S 31% V 57%` | Secondary sky/atmosphere bounce band inside visor & teal sensor trim |
| `VIS_4` Soft Glass Mist / Glow | `#9BC2B6` | `H 162° S 20% V 76%` | Subtle visor horizon reflection & muted-teal active telemetry LED |
| `VIS_5` Crisp Glass Highlight | `#DCE8D5` | `H 98° S 8% V 91%` | Curved glass sheen bridging directly into `MET_5` (`#F2EED0`) peak slash |

### Ramp E — Organic Planetary Accents & Grounded Shadows *(7 Steps — Reference Wilderness Bridge)*
Used in Phase 3 Practice D (organic study) and for Mara's xenobiology sample vial / botanical specimen & environmental grounding:
| Role | Hex | Approx. HSV | Usage |
| --- | :---: | --- | --- |
| `ORG_0` Ground Shadow / Deep Moss | `#192924` | `H 161° S 39% V 16%` | Deep organic occlusion & grounded contact shadow anchor |
| `ORG_1` Shaded Forest Olive | `#324B36` | `H 130° S 33% V 29%` | Shaded lichen/moss underside |
| `ORG_2` Earthy Olive Moss | `#567449` | `H 102° S 37% V 45%` | Signature reference meadow/moss midtone |
| `ORG_3` Warm Sunlit Sage | `#7B9056` | `H 82° S 40% V 56%` | Lit organic foliage & specimen moss |
| `ORG_4` Sunlit Ochre Leaf | `#C8BC6E` | `H 52° S 45% V 78%` | Reference bush-frond sunlit highlight |
| `ORG_5` Warm Ivory / Bone | `#E2E1BE` | `H 58° S 16% V 89%` | Reference skull/ivory trim & helmet ceramic white-cream accent |
| `ORG_6` Xenobiology Berry/Amber Accent | `#A83B3B` | `H 0° S 65% V 66%` | Tiny botanical spore/warning latch accent (used sparingly!) |

> **Palette Law**: Every sprite in the training exercises uses `<= 16` colors strictly from these ramps; Dr. Mara Lin (`128×128`) uses `<= 28` colors strictly from Ramps A–E (zero unindexed stray RGB values, zero alpha blending on edges!).

---

## 3. Enforceable Production Rules (How Every Asset Must Be Painted)

### Rule 1 — Zero Pure Black, Zero Pure White, Zero Auto-Blur
- Forbidden: `#000000`, `#FFFFFF`, soft brush strokes, Gaussian blur, semi-transparent exterior anti-aliasing (`0 < alpha < 255`), and downsampled photographic/AI gradients.
- Required: Binary alpha (`0` or `255`), strict palette indexing, and `Nearest` preview scaling (`1×`, `2×`, `4×`).

### Rule 2 — Locked Upper-Left Key Light (~10–11 O'Clock)
- Every rounded component (helmet dome, shoulder baffles, arms, thighs, canisters, rocks, pods) must display its warmest highlight cluster on the **upper-left** (`~10–11 o'clock`), rich midtone across the center-front, core shadow on the **lower-right** (`~4–5 o'clock`), and crisp cast shadow falling onto any surface tucked beneath/behind it.

### Rule 3 — Sculpted Sel-Out Edges (Never Sticker-Outlines)
- Exterior silhouette edges step by local illumination:
  - **Shadowed bottom & right edges**: `BRN_0` (`#1B1420`) or `SUIT_0` (`#231622`) / `ORG_0` (`#192924`).
  - **Mid-lit vertical edges**: `SUIT_1` (`#4F2425`) or `MET_0` (`#222531`) / `BRN_1` (`#362428`).
  - **Directly sunlit top-left crests**: `SUIT_2` (`#873A2B`) or `MET_1` (`#414B56`) thin 1 px edge — or broken sel-out where the lit plane meets air cleanly without heavy ink!

### Rule 4 — Cluster Geometry & Anti-Banding Discipline
- Build major planes first with bold, clean clusters (`>= 3 px` thick).
- Break any long parallel diagonal boundary between adjacent shade clusters by interlocking pixels cleanly along the natural surface contour (rib seams, curved fabric folds, fur/moss tufts).
- Smooth curved silhouettes monotonically (e.g., `5 -> 3 -> 2 -> 1 -> 1 -> 2 -> 3 -> 5`); manually fix every jaggy before sign-off.
- Use manual internal AA sparingly ONLY inside high-contrast curved bevels (helmet rim, glass visor boundary, shoulder curve) — NEVER on 45° lines and NEVER against transparent background.

### Rule 5 — Material Contrast Hierarchy on Dr. Mara Lin
To make the `128×128` astronaut read unmistakably as a **crafted expedition suit** rather than a flat cartoon mascot:
1. **Helmet & Glass Visor (Primary Focal Point — Highest Contrast)**:
   - Sturdy matte-ceramic / painted-orange-and-warm-ivory-trimmed pressurized helmet shell with side acoustic transducer pods (weathered titanium + muted-teal status light).
   - Deep curved dark-teal glass faceplate (`VIS_0` -> `VIS_3`) with subtle interior brow/chin reflection depth, crisp curved specular slash (`VIS_5` + `MET_5`) on upper-left, and faint secondary bottom-right rim catchlight.
   - Heavy ribbed titanium-and-rubber neck lock ring (`MET_0`–`MET_4`) casting a sharp shadow onto the upper chest!
2. **Oversized Orange Survival Suit (Dominant Volume Mass)**:
   - Intentionally bulky, insulated, slightly oversized proportions (wide padded shoulders, quilted rib baffles across sleeves and legs, tucked waist compression beneath the heavy utility harness, gathered cloth folds at elbows, inner thighs, and above the boots).
   - Seams rendered as crisp 1 px recessed shadow lines (`SUIT_1` / `SUIT_0`) paired with a 1–2 px warm sunlit lip (`SUIT_4` / `SUIT_5`) on the lower/lit edge of each baffle — creating unmistakable 3D quilted padding!
3. **Weathered Equipment & Material Accents**:
   - **Life-Support Backpack** peeking cleanly behind shoulders/upper back (weathered titanium casing, oxygen/acoustic canister silhouette, subtle muted-teal status pip & antenna stub — breaking the silhouette asymmetrically!).
   - **Chest Telemetry & Harness Rig**: Dark weathered brown cross-straps (`BRN_1`–`BRN_4`) with brushed metal buckles (`MET_1`–`MET_5`) and a compact chest environmental sensor module with a muted-teal glass readout (`VIS_2`–`VIS_4`).
   - **Utility Belt, Sample Canister & Acoustic Field Probe**: Asymmetrical right-hip specimen canister (glass vial with faint organic teal/amber shimmer) and left-hand / hip-mounted weathered metal field instrument.
   - **Insulated Gloves & Heavy Treaded Boots**: Deep umber-charcoal rubberized palms, articulated knuckles, padded dark knee guards, and chunky planetary survival boots planted in a confident, slightly turned 3/4 explorer stance.

---

## 4. Technical Delivery Standards (Godot `4.7.2` Compatibility)

- **File Format**: Uncompressed/lossless `RGBA8` PNG (never JPEG).
- **Canvas Alignment**: Exact integer target canvas (`128×128` for the Phase 5 character benchmark), clean negative space (figure ~`98–110 px` tall, centered horizontally with `>= 8 px` clean transparent margins top/bottom/sides so zero limbs clip and future animation frames have swing room).
- **Source Working Files**: Every training sheet and final character asset must preserve its editable layered source definition (human-readable palette + layered pixel-art blueprint/script) alongside the exported native PNG so any pixel, cluster, layer, or palette ramp can be refined non-destructively.
- **Godot Import Settings**: `Filter = Nearest`, `Mipmaps = Off`, `Compress = Lossless`, `GL Compatibility` safe (zero shaders required to read cleanly!).
