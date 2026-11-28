# VERDANT SIGNAL — V7.1: COMPLETE FOREST ENVIRONMENTAL RECOMPOSITION

**Status:** Isolated Visual & Playable Prototype Complete — **Awaiting Visual Review & User Approval**  
**Production Integration:** **LOCKED / NOT INTEGRATED** (Milestone 01, `game/project.godot`, V7.0, V5.0, V4.0, and v3.0 remain 100% untouched)  
**Isolated Study Directory:** `game/assets/v71_forest_recomposition_study/` (protected by `.gdignore`)

---

## 1. Root Compositional Diagnosis of Rejected V7.0

V7.0 (`game/assets/v7_immersive_world_study/`, kept intact strictly as the before baseline) was rejected because it still relied on:

- **Mirrored edge framing over a static painted backdrop:** Two symmetric identical trunks sat on the far left and right edges, leaving a wide open painted center rather than genuine multi-depth forest space.
- **Drawn-on artificial perspective road:** A winding brown trail painted straight onto the backdrop forced a theatrical stage look instead of organic navigable mossy forest ground carved naturally between roots and bushes.
- **Insufficient spatial dominance:** The forest felt pasted around the border of an open screen rather than physically enclosing the player at staggered depths.

---

## 2. V7.1 Architectural Recomposition Principles

Rebuilt purely inside *VERDANT SIGNAL*'s Singing Reedwood art direction (54-color Singing Canopy palette, native `480×270` gameplay viewport, zero enlargement, zero decorative UI):

1. **Continuous Multi-Zone Playable World (`1440×340`):** One continuous navigable forest connecting **A. Dense Forest Corridor (`x = 0..480`) → B. Deep Forest Interior (`x = 480..960`) → C. Dramatic Forest Clearing (`x = 960..1440`)**.
2. **Six Distinct Zero-Fringe Modular Handcrafted Forest Structures:**
   - Enormous straight furrowed Singing Reedwood trunk (`204×312px` rising straight off the top edge of the `480×270` screen)
   - Leaning gnarled moss-and-violet-fungi titan (`218×304px`, border-flood-fill chroma-keyed so interior violet shelf-fungi stay 100% solid)
   - Flared moss-and-cyan-draped cathedral buttress titan (`224×304px`)
   - Dense multi-tier fern & undergrowth banks (`78×58px` mid-edge up to `204×146px` dark foreground framing masses)
   - Sweeping interlocking overhanging canopy boughs (`288×144px` & `328×148px`)
   - Giant fallen hollow mossy redwood log (`152×96px`)
   - Plus layered atmospheric distant treeline foliage ridge (`280×92px`) and distant morning cliff monolith horizon (`640×128px`).
3. **Zero Painted Artificial Road:** Playable ground is continuous organic clustered 16-bit moss & grass turf shaped naturally by irregular leafy canopy shadow pools, creeping roots, woodland pebbles, orchids, and sky-reflecting rainwater puddles.
4. **Six-Plane Multi-Depth Stack with Anchored Parallax & Live Y-Sort Occlusion:**
   - **Plane 0 (`0.22×`):** Morning turquoise sky & distant sandstone monolith cliffs
   - **Plane 1A/1B (`1.0×`):** Handcrafted organic mossy forest floor + lush overlapping distant treeline foliage ridge (zero straight horizon cut)
   - **Plane 2 (`1.0×`):** Cool atmospheric teal-tinted rear perimeter titans
   - **Plane 3 (`1.0×`, `y_sort_enabled = true`):** Staggered asymmetric colossal trunks, fallen hollow logs, undergrowth banks, and Dr. Mara Lin (`28×40px` native) walking freely behind and in front of massive roots
   - **Plane 4 (`1.05×` anchored parallax):** Interlocking overhanging high canopy boughs
   - **Plane 5 (`1.15×` anchored parallax):** Dark shadowed foreground undergrowth framing corners + localized luminous cyan silhouette readability peek whenever Mara passes behind colossal trunks or foreground foliage.

---

## 3. Native `480×270` (`1×` Actual Gameplay Camera) Verification Metrics

All proof screenshots are rendered at **exact unscaled native `480×270`** with zero upscaling, blur, or presentation frames:

| Composition | Proof Artifact | Living Forest Dominance | Natural Walkable Floor | Distant Horizon / Sky Peek |
| :--- | :--- | ---: | ---: | ---: |
| **A. Dense Forest Corridor** | `proofs/proof_A_dense_forest_corridor_480x270.png` | **77.1%** | 21.5% | 1.5% |
| **B. Deep Forest Interior** | `proofs/proof_B_deep_forest_interior_480x270.png` | **88.1%** | 11.9% | 0.0% |
| **C. Dramatic Forest Clearing** | `proofs/proof_C_forest_clearing_480x270.png` | **70.2%** | 23.2% | 6.6% |

### Additional Proof & Playable Artifacts
- **Side-by-Side Unscaled `1×` Comparison vs. Rejected V7.0:** `game/assets/v71_forest_recomposition_study/proofs/comparison_rejected_V70_vs_new_V71_native_1x.png` (`984×596`, exact `1×` `480×270` per panel)
- **Playable Movement Recording (72 Frames Native `480×270`):** `game/assets/v71_forest_recomposition_study/proofs/proof_D_playable_walkthrough_A_to_C_480x270.gif` (continuous walk from A Corridor → behind & in front of colossal trunks through B Deep Interior → into C Sunlit Clearing; peak verified walk-behind occlusion overlap `407 px` with live cyan silhouette readability)
- **Live Interactive Browser Prototype:** `game/assets/v71_forest_recomposition_study/playable_web/index.html` (WASD / Arrow keys across all 3 zones, keys `1`/`2`/`3` jump to A/B/C, Auto-Walk A→C toggle, `1×` Native / `2×` Crisp Integer toggle)
- **Isolated Godot 4.7.2 Study Scene:** `game/assets/v71_forest_recomposition_study/godot_study/v71_forest_recomposition.{tscn,gd}`
- **Reproducible Generator Source:** `tools/verdant-pixel-forge/src/v71_forest/{v71ForestEngine,buildV71ForestStudy}.ts`

---

## 4. Strict Isolation & Approval Gate

- Milestone 01 (`game/project.godot`, `game/characters/`, `game/world/`, `game/assets/sprites/`, etc.) has **zero changes**.
- Rejected V7.0 (`game/assets/v7_immersive_world_study/`, `tools/verdant-pixel-forge/src/v7_immersive/`) and all earlier studies (`V5.0`, `V4.0`, `v3.0`) remain **100% intact**.
- **No production integration will begin** until these actual native `480×270` visuals and playable walkthrough receive explicit user approval.
