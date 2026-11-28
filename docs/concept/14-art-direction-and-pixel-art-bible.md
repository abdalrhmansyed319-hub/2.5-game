# Deliverable N — Artistic Direction and Pixel Art Production Bible

> **Visual Proof Artifacts**: Audited quantitatively across all 12 Core Biomes via `tools/palette_director.py` (`12/12` `[PASS]`, `0` contrast warnings!) and visually inspected via `read_file` in [`docs/concept/visuals/biome_palette_master_sheet.png`](visuals/biome_palette_master_sheet.png).  
> **Reference Aesthetic Signal**: Rich, atmospheric, painterly pixel art with a **small solitary human protagonist** framed inside carefully composed, living natural landscapes (*Hyper Light Drifter* × *Eastward* × Studio Ghibli landscape scale).  
> **Revision Note (Pre-Production Lock — see [`DDL-011`](24-design-decision-log.md) & [`Deliverable W`](23-strategic-design-review-and-audit.md))**: `480×270` + `16×16` + `16×24` remains our **recommended starting default**, NOT an untested assumption! Before bulk pixel art begins, a **1–2 week Windows Playable Visual Prototype Gate** MUST validate: (1) `480×270` vs `640×360` scaling on `1440p` (`5.33×` non-integer vs `4×` exact!) and Steam Deck (`1280×800`), (2) `482×272` overscan smooth sub-pixel camera panning at `60–144 Hz`, and (3) `16×24` tool/expressiveness readability + canopy fadeaways in dense Reedwood forests!

---

## 1. Resolution, Projection & Pixel Density Lock (Zero "Mixels"!)

| Spec | Locked Production Value | Engineering & Artistic Justification |
| --- | --- | --- |
| **Camera Perspective** | **Oblique 3/4 Top-Down** *(with layered cliff heights & horizon parallax at overlooks)* | Supports 360° open exploration of lakes, rivers, canyons, forests, and herds while still allowing soaring painterly horizons at ridge overlooks! |
| **Logical Base Viewport** | **`480 × 270 px`** (`16:9` native) | Exact **4× integer scale** to `1920×1080`, **8×** to `4K` (`3840×2160`)! Identical logical canvas to *Hyper Light Drifter*—gives 2.25× richer painterly nuance than `320×180` while keeping hand-painted pixel art 4× faster to paint than `960×540`! |
| **World Tile Grid** | **`16 × 16 px`** base structural grid *(with `32×48` to `96×128` multi-tile painterly trees, cliffs & hero landmarks)* | Fine enough for organic curved shorelines, terraced cliffs, and lush grass borders without blocky "RPG Maker grid" stiffness! |
| **Astronaut Scale** | **`16 × 24 px`** sprite footprint (~`9%` of viewport height!) | **Small, fragile, unmistakably human** beside 96-pixel-tall Singing Reedwoods and 128-pixel Umbrella-Fungi—immediately evoking solitary awe! |
| **Texture Filtering & Scaling** | Strict **`Nearest`** filtering, pixel-snapped `SubViewport` (or crisp `viewport` stretch mode), `use_texture_padding = true` on all `TileSetAtlasSource` | Zero blurry scaling, zero sub-pixel tile seam lines, zero mismatched pixel sizes ("mixels")! |

---

## 2. The 5-Band Painterly Readability Law (Audited Across All 12 Biomes)

Even the most gorgeous pixel painting fails as a game if the tiny `16×24` astronaut vanishes into foliage! Every single biome strictly obeys **Value Polarity Inversion** (verified via `tools/palette_director.py`):

- **Bright Sunlit Biomes** *(Amber Coast, Basalt Terraces, Ochre Badlands, Coral Archipelago, Quartz Peaks, Cryo-Glacier)*:
  - Soft, warm/atmospheric high-value skies & misty backgrounds (`Band 1–2`), grounded textured playable earth (`Band 3`).
  - Mara's silhouette reads crisply via her **dark charcoal-navy expedition pack & helmet shadow (`#1C222D`–`#202A36`)** achieving **`4.8:1` to `10.2:1`** contrast!
- **Dim / Twilight / Subterranean Biomes** *(Singing Canopy Shade, Vitreous Fen, Vesper Fungal Jungle, Abyssal Shelf, Mycelial Caverns, Blighted Caldera)*:
  - Deep cool/velvety low-value backgrounds (`Band 1–2`) & damp stone (`Band 3`).
  - Mara's suit dynamically catches **warm ivory-white rim lighting + her soft golden visor/shoulder-lamp halo (`#F4EFE2`–`#F8EEDB`)** achieving **`5.3:1` to `12.8:1`** contrast!
- **Band 5 Signals, Hazards & Telegraphs**: Always combine **peak accent hue + acute/distinct silhouette + crisp high-contrast dark/light outline** so visibility holds at 100% even in desaturated grayscale or colorblind vision!

---

## 3. Making Pixel Art Feel Like "Living Paintings" (5 Craft Techniques)

1. **Hide the Tile Grid Religiously**: Break straight `16×16` edges using overlapping curved shore bevels, hanging grass tufts, root overhangs, pebble decals, and irregular multi-tile rock/cliff stamps (`35%` hero landmarks + `65%` organic mosaic chunks).
2. **Hue-Shifted Painterly Ramps (Never Black/White Shading)**: Keep each biome within a curated **24–32 color master ramp** sharing unified shadow hues (e.g., deep teal-indigo shadows under golden-ochre sun; violet-plum shadows inside fungal twilight).
3. **Subtle Environmental Motion (Breathing Paintings)**:
   - Vertex/UV pixel-snapped wind-sway shaders on reeds, kelp fronds, and tall prairie grass ripples (reacting dynamically to real-time wind velocity!).
   - Layered water rendering: crisp `2-frame` animated foam borders + subtle inverted sky/moon reflection shader + animated player wade ripples!
   - Atmospheric drift particles: drifting golden pollen motes, rising marsh mist wisps, falling glowing spore-snow, crisp raindrop splashes on ground & giant mushroom caps!
4. **Directional Key-Light & Soft Grounded Shadows**: Lock consistent top-left sun/moon angle across each biome; stamp elliptical dark-tinted contact shadows beneath every tree trunk, rock, creature, and astronaut so nothing ever floats!
5. **Time-of-Day Color Grading (`CanvasModulate` + 1D Palette-LUT Shader)**: Smoothly shift each biome across **Dawn Mist -> High Sun -> Golden Dusk -> Bioluminescent Night** using crafted artist LUT curves (never ugly muddy flat gray darkening!) while selectively lighting emissive masks on bioluminescent flora, fireflies, and Mara's headlamp!
