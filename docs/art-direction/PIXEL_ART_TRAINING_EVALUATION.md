# *VERDANT SIGNAL* — Phase 4 Internal Art Quality Gate Evaluation

> **Scope**: Honest, pixel-level evaluation of all five Phase 3 training exercises (`game/assets/art_tests/pixel_art_training/`) across Round 1 and Round 2 revisions before starting Phase 5 (`128×128` Dr. Mara Lin character visual benchmark).  
> **Inspection Protocol**: Audited via automated indexed-palette QC (`tools/pixel_art_core.py`) AND visual inspection at `1×` native, `4×` nearest-neighbor zoom on sunlit reference olive grass (`#667A4D`), deep shaded forest (`#24362A`), grayscale luminance separation, and solid silhouette panels.

---

## 1. Quantitative Round 1 -> Round 2 Progress Summary

| Exercise | Native Size | Unique Colors (Off-Palette) | Non-Binary Alpha | Pure `#000`/`#FFF` | 1px Orphans (R1 -> R2) | Phase 4 Verdict |
| --- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Practice A** — `practice_a_weathered_metal_canister.png` | `48×48` | `17` (`0`) | `0` | `False` | `44` -> **`8`** (`-82%`) | **PASS** |
| **Practice B** — `practice_b_orange_suit_fabric.png` | `48×48` | `21` (`0`) | `0` | `False` | `59` -> **`9`** (`-85%`) | **PASS** |
| **Practice C** — `practice_c_glass_helmet_visor.png` | `48×48` | `20` (`0`) | `0` | `False` | `65` -> **`31`** (`-52%`) | **PASS** |
| **Practice D** — `practice_d_organic_moss_relic.png` | `48×48` | `14` (`0`) | `0` | `False` | `138` -> **`20`** (`-86%`) | **PASS** |
| **Practice E** — `practice_e_miniature_astronaut_study.png` | `64×64` | `25` (`0`) | `0` | `False` | `95` -> **`26`** (`-73%`) | **PASS** |

---

## 2. Exercise-by-Exercise Critique & Concrete Improvements Applied

### Practice A — Weathered Metallic Expedition Canister (`48×48`)
- **Round 1 Weaknesses Identified**: Horizontal clamping ribs and orange paint stripe were completely flat (`y = const`) rather than curving downward across the cylindrical 3/4 oblique front; pressure gauge sat too close to the orange stripe; `44` stray orphan pixels from isolated rivets and alternating left-edge border tones.
- **Round 2 Fixes Applied**: Added subtle elliptical 3/4 sag (`+1.8 px` center curve) across clamping ribs, cast shadows, and orange identification band; repositioned pressure gauge cleanly into calm titanium space with concave recessed bezel lighting; replaced stray speckles with a deliberate 3-pixel chipped-paint metallic scuff; reduced orphans to `8`.
- **Remaining Honest Note**: The specular vertical bar reads strongly as brushed titanium at both `1×` and `4×`; on the `128×128` hero character, curved metallic bands should add slightly more subtle asymmetric environmental reflection breaks so large metal housings feel genuinely hand-weathered rather than extruded.

### Practice B — Quilted Orange Astronaut Suit Fabric (`48×48`)
- **Round 1 Weaknesses Identified**: Silhouette read too round ("orange ball with a belt") instead of tailored astronaut garment construction; modulo weave pattern created `59` noisy orphan pixels along terminators; initial Round 2 wrist cuff angle protruded too sharply.
- **Round 2 Fixes Applied**: Reshaped into a draped, bent padded astronaut shoulder-and-forearm sleeve with a sewn muted-teal expedition patch, deep diagonal Y-compression elbow fold, dark brown webbing cinch strap + cast shadow + titanium D-ring buckle, and an aligned ribbed wrist lock ring; removed noisy modulo weave entirely, dropping orphans from `59` to **`9`**.
- **Remaining Honest Note**: Fabric loft, seam valleys, and warm-to-plum hue-shifting now read convincingly as heavy insulated cloth without plastic glare — directly validating our Ramp A (`S0`–`S5`) recipe for Phase 5.

### Practice C — Curved Glass Helmet Visor (`48×48`)
- **Round 1 Weaknesses Identified**: Plain circular bowling-ball outline; diagonal stair-step banding along bottom-right metallic visor bezel; floating dark mic-boom smudge inside visor; `65` orphan pixels.
- **Round 2 Fixes Applied**: Sculpted an extruded pressurized brow overhang, dual ear transducer pods (left active pod + short comm stub, right rear pod hint), recessed chin rebreather vent grille, and heavy titanium neck collar ring; compressed bezel value zones to eliminate diagonal banding; rebuilt the curved glass reflection with continuous tapered curves (`V4` -> `V5` -> `M5`) + crisp secondary catchlight and clean bottom-right rim bounce (`31` orphans, predominantly intentional specular/LED accents).
- **Remaining Honest Note**: This helmet silhouette and glass reflection language is strong enough to serve directly as the visual anchor for Phase 5 at `2×` scale (`~36×34 px` helmet on `128×128`).

### Practice D — Organic Mossy Basalt Relic & Alien Fronds (`48×48`)
- **Round 1 Weaknesses Identified (Weakest Initial Exercise)**: Sparse discrete frond waypoints produced fragmented dotted spider-legs (`138` orphans!) instead of the reference's bold, continuous 3–4 px curved leaf clusters; sinusoidal rock facets created patchy camouflage spots instead of calm faceted river stone.
- **Round 2 Fixes Applied**: Rebuilt every frond using densely sampled continuous tapered crescent curves (`3–4 px` sunlit ochre-parchment arches over a dense plum-burgundy core, dotted with 4 crisp ruby berries); simplified the basalt stone into 4 calm painterly facets cloaked in continuous sculpted olive-moss cushions (`138` -> **`20`** orphans!).
- **Key Craft Lesson Carried Into Phase 5**: Bold, continuous, tapered cluster masses ALWAYS beat fragmented procedural texture lines.

### Practice E — Miniature Dr. Mara Lin Character Study (`64×64`)
- **Round 1 Weaknesses Identified**: Stiff vertical box torso and parallel pipe legs; jagged 2px-thick diagonal probe wand; `95` orphans caused by per-layer independent sel-out passes clashing at overlaps.
- **Round 2 Fixes Applied**: Introduced natural 3/4 stance with staggered stride and clean negative-space gap between legs, tapered cinched waist contrasting against bulky padded shoulders, bent arms holding a crisp glowing acoustic field transceiver, tall asymmetrical backpack + slender 1px antenna, and unified outer shadow-edge sel-out (`95` -> **`26`** orphans).
- **Key Craft Lesson Carried Into Phase 5**: At `128×128`, we have **4× the pixel area** of `64×64` — so we must NOT simply draw a bigger version of this miniature! Instead, we must elevate every anatomical curve, cloth fold, quilted suit seam, pack strap, utility buckle, glove articulation, boot tread, and curved visor reflection to true high-craft painterly character-art standards!

---

## 3. Gate Sign-Off

All five Phase 3 training exercises pass the Phase 4 Internal Art Quality Gate on silhouette readability, palette integrity (`0` off-palette colors, `0` pure black/white, `0` semi-transparent alpha pixels), directional upper-left light consistency, material separation, and similarity to the reference's handcrafted painterly pixel-art language. **Cleared to begin Phase 5 (`128×128` Dr. Mara Lin Hero Visual Benchmark).**
