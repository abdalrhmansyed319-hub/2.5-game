# VERDANT SIGNAL — V7.0: IMMERSIVE WORLD PERSPECTIVE & ENVIRONMENTAL SCALE
## Architectural Diagnosis, Playable Study Specification & Native-Resolution Proofs

> **Status:** **Isolated Visual & Playable Study — Pending Artistic & Gameplay Review** (NOT production-approved).
> **Protection Verified:** 100% isolated under `game/assets/v7_immersive_world_study/` (protected by `.gdignore`, `3.5 MB`, 36 files). Zero modifications to Milestone 01 (`game/project.godot`, `game/assets/characters`, `game/assets/world`, `game/assets/vfx`, `game/world/`, `game/characters/`), v3.0, V4.0, or V5.0.

---

## 1. Existing Godot Architecture Diagnosis (Why M01 Feels Like an Overhead Map)

Inspection of the actual Milestone 01 Godot 4.7.2 architecture (`game/project.godot`, `game/characters/player/player.{gd,tscn}`, `game/world/rimlands_prototype.{gd,tscn}`, `game/world/props/singing_reedwood_tree.{gd,tscn}`, `game/world/world_chunk_streamer.gd`, `game/world/rimlands_tileset_builder.gd`) identified **five structural causes** behind the distant tabletop/map feeling:

| # | Subsystem | Current M01 Implementation | Root Cause of "Overhead Map" Feeling |
|---|---|---|---|
| 1 | **Camera & Framing** | `480×270` viewport, `Camera2D` `zoom = (1,1)`, `offset = (0,0)`, `16×16` tiles (`30 × 17` visible grid). | Strictly dead-centering `16×24` Mara across `30 × 17` uniform flat tiles reads like a tactical RPG overworld map; zero vertical headroom exists for colossal structures or distant horizons. |
| 2 | **Scale Ratio (Hero vs. Structures)** | Mara = `16×24px` (`~14×22px` body); `AST-004` Singing Reedwood = `48×80px` (`~14px` trunk width = `1.0×` Mara's width; `80px` height = only `29.6%` of viewport height). | Every tree fits completely inside the viewport like a miniature tabletop ornament. Nothing towers above Mara or extends beyond screen boundaries. |
| 3 | **Spatial Composition & Density** | `world_chunk_streamer.gd` scatters single `48×80` trees on a `4×4`-tile (`64×64px`) grid at `42%` chance (`elev > 0.42`). | Leaves ~75%+ of the screen as empty uniform grass tiles with isolated tiny trees dotted sparsely across it — zero natural corridors, enclosures, or dramatic clearing reveals. |
| 4 | **Foreground Framing & Occlusion** | No foreground camera-framing plane. `CanopySprite` (`z_index = 20`) fades its entire `44×52px` box uniformly to `0.38` alpha on `Area2D` overlap. | Zero elements frame the edges of the camera lens or move with foreground parallax; uniform whole-canopy fade makes trees feel flimsy rather than massive solid living structures. |
| 5 | **Water & Biome Presence** | No swamp biome; Amber Coast water is `16×16` repeating tiles with narrow shoreline bands and single `16×16` cliff/rock tiles. | Water reads as a thin blue strip pasted beside yellow sand rather than an immense living sea or winding swamp ecosystem. |

---

## 2. Current M01 vs. Proposed V7.0 Immersive Architecture

| Dimension | Current M01 Baseline (Proof A) | Proposed V7.0 Immersive Standard (Proofs B–E) |
|---|---|---|
| **Native Viewport** | `480×270` (`2×` = `960×540`, `4×` = `1920×1080`) | **Preserved at `480×270`** (exact `2×`/`4×` integer scaling; Intel HD 3000 & GL Compatibility safe — scale is solved through real environmental architecture, NOT camera zoom!) |
| **Camera Configuration** | `Camera2D` `zoom=(1,1)`, `offset=(0,0)` dead-centered | `Camera2D` `zoom=(1,1)`, **oblique framing `offset = Vector2(0, -86..-88)`** + gentle directional look-ahead (`±14px` X), smoothing `6.5–7.5`, pixel-snapped transforms. Places Mara in the **lower-middle third** so colossal trunks, swamp canopies, cliffs, and distant horizons dominate overhead. |
| **Character Scale (Dr. Mara Lin)** | `16×24px` (`8.9%` viewport height) | **Native `28×40px` (`~34px` standing height = `12.6%` viewport height, `~14px` torso width)** — natively authored 4-direction sprites (`down`, `up`/back-into-world, `right`, `left`, zero fractional scaling) so her helmet, sunrise visor, flowing crimson scarf, and titanium backpack stay crisp at `1×` while still feeling small beneath colossal biomes. |
| **Monumental Structure Dimensions** | `48×80px` trees (`14px` trunk = `1.0×` Mara width) | **Forest:** Colossal Singing Reedwood trunks **`176×268px` & `188×276px`** (**trunk core `78–96px` wide = `5.5×–6.8×` Mara's body width**, extending straight off the top of the `270px` screen; sprawling root buttresses `150–175px` wide!).<br>**Swamp:** Gnarled root arches + towering reed walls **`210×212px`** (reeds `~96px` tall = `2.8×` Mara's height) enclosing **>55% continuous winding water channels**.<br>**Coast:** Open living ocean spanning **~60% of viewport** to sunrise horizon + grounded stratified cliff monoliths **`176×214px`** & weathered sea-boulders **`118×72px`**. |
| **Depth Layer Stack & Sorting** | Flat `TileMapLayers` (`z=-10..-2`) + single `YSortWorldLayer` + flat `z=20` canopy | **5-Plane Layered World Stack:**<br>1. **Background Horizon & Oblique Ground (`z = -20`)**: Sky sliver / misty peaks / mangrove fog / sunrise sea stacks + walkable oblique terrain & living water.<br>2. **Contact Shadows (`z = -5`)**: Soft elliptical shadow puddles grounding every colossal root, rock, and Mara's boots.<br>3. **Y-Sorted World (`z = 0`, `y_sort_enabled = true`)**: Strict foot-base `sortY` ordering across Mara and every colossal trunk, root wall, reed cluster, cliff, and boulder.<br>4. **Localized Occlusion Readability (`z = +15`)**: When a `sortY > mara.y` structure overlaps Mara, the tree stays 100% solid and heavy while a delicate **1px rim + 24% checkerboard silhouette peek** renders strictly on overlapped pixels (GL Compatibility / Intel HD 3000 safe shader `v7_occlusion_silhouette.gdshader`).<br>5. **Camera-Edge Foreground Framing (`z = +40`, `1.14×–1.16×` parallax)**: Dark shadowed boughs, marsh reeds, and foreground coastal rock corners framing the lens. |

---

## 3. Gameplay, Collision & Readability Implications

1. **Solid Core vs. Walkable Root Skirts:** Colossal trunks have wide sprawling roots (`150–175px` visually), but their `StaticBody2D` collision footprints are intentionally sculpted tightly around the **solid trunk core** (`colRx = 24–30px`, `colRy = 10–13px`, `colOffsetY = -8px`). This allows Mara to step naturally over mossy outer root toes AND walk smoothly **behind** massive trunks without snagging on invisible bounding boxes.
2. **Walk-Behind Visibility Without Destroying Scale:** Fading a massive `90px`-wide tree to `38%` alpha makes it look like cardboard. Instead, V7.0 keeps colossal trunks **100% opaque** and triggers the **localized silhouette rim (`v7_occlusion_silhouette.gdshader`)** strictly over overlapped player pixels (`occludedPixels >= 18`). The player feels Mara genuinely vanish behind living timber while retaining effortless positional awareness.
3. **Navigable Sightlines & Value Contrast:** Corridors (`76–110px` clear passage between massive trunk walls) are deliberately lit with brighter moss/sand/mud pools against cooler shaded margins so Mara's warm burnt-terracotta suit, cyan visor, and crimson scarf remain readable at native `1×` (`480×270`) across Forest, Swamp, and Coast.
4. **Hardware Safety (Intel HD Graphics 3000 / GL Compatibility):** Preserving native `480×270` resolution with zero heavy post-processing, zero dynamic 2D lights, and a single lightweight non-screen-reading alpha-neighbor shader keeps fillrate and VRAM well within OpenGL 3.1 / ANGLE budgets.

---

## 4. Native-Resolution Visual Proofs & Playable Implementations

Every proof screenshot below is rendered at **exact native `480×270` (`1×` actual gameplay camera scale)** with **zero artificial enlargement**:

### Required Native `480×270` Proofs (`game/assets/v7_immersive_world_study/proofs/`)
- **Proof A (Current M01 Overhead):** `proof_A_current_m01_overhead_480x270.png` — Pixel-exact render using real unmodified M01 assets & `WorldChunkStreamer` placement.
- **Proof B (Immersive Dense Forest):** `proof_B_immersive_forest_480x270.png` — Singing Reedwood Cathedral with colossal trunks extending off-screen, sky & misty peaks peeking through upper canopy, sky-reflecting puddles, and foreground canopy framing.
- **Proof C (Immersive Living Swamp):** `proof_C_immersive_swamp_480x270.png` — Mire of Whispering Roots with >55% winding murky/amber water channels, muddy banks, submerged roots, gnarled root arches, towering swamp reeds, misty mangrove horizon, and foreground reed/moss framing.
- **Proof D (Immersive Coastal Environment):** `proof_D_immersive_coast_480x270.png` — Amber Coast Leviathan Shore with vast ocean & sunrise horizon (~60% viewport), translucent turquoise swells, organic lacy foam, sky-reflecting wet sand, grounded stratified coastal cliffs, and foreground sea rocks.
- **Proof E (Depth Sorting & Occlusion):**
  - `proof_E1_mara_in_front_of_tree_480x270.png` (`y=256 > sortY=238`, `occludedPixels = 0` — Mara cleanly IN FRONT).
  - `proof_E2_mara_entering_behind_tree_480x270.png` (`y=220 < sortY=238`, `occludedPixels = 262` — stepping partially behind colossal bark).
  - `proof_E3_mara_occluded_behind_tree_480x270.png` (`y=214 < sortY=238`, `occludedPixels = 409` — fully behind trunk with localized silhouette readability peek).
  - `proof_E4_mara_reemerging_from_tree_480x270.png` (`y=210`, `occludedPixels = 29` — re-emerging into sunlit glade).
  - `proof_E_depth_sort_walkthrough_480x270.gif` — Smooth 36-frame native `480×270` live walkthrough showing Mara walking in front of, behind, and past the colossal trunk with real camera tracking and `1.14×` foreground parallax.
- **Unscaled `1×` Native Comparison Grids:**
  - `comparison_A_vs_B_C_D_native_1x.png` (2×2 matrix of exact `1×` `480×270` frames A, B, C, D).
  - `comparison_E_depth_sort_4steps_native_1x.png` (2×2 matrix of exact `1×` `480×270` frames E1 → E2 → E3 → E4).

### Isolated Playable Studies
1. **Interactive Live Browser Playable Study:** `game/assets/v7_immersive_world_study/playable_web/index.html` (served live on port `5187`; WASD/Arrows movement, `1`–`4` instant mode compare, `R` auto depth-sort demo, `G` Y-sort/collider debug overlay, `1×`/`2×` pixel-scale toggle).
2. **Isolated Godot 4.7.2 Playable Study Scene:** `game/assets/v7_immersive_world_study/godot_study/{v7_immersive_study.tscn,v7_immersive_study.gd,v7_occlusion_silhouette.gdshader}`.
