# VERDANT SIGNAL — V7.2 Visual Refinement & Real Godot 4.7.2 Implementation Study

> **Status:** Isolated refinement & real Godot 4.7.2 validation package (`game/assets/v72_forest_refinement_study/`, excluded from production via `.gdignore`).  
> **Production Protection:** Zero changes to Milestone 01, production `game/project.godot`, production assets, v3.0, V4.0, V5.0, V7.0, or V7.1.

---

## 1. Visual Refinement Highlights (Preserving V7.1 A / B / C Baseline)

- **5 Distinct Colossal Trunk Anatomies** (eliminating repeated silhouettes across A, B, and C):
  1. `titan_straight` / `titan_straight_tall` (vertical furrowed redwood)
  2. `titan_split_arch` (**new V7.2** — split hollow root arch gripping mossy forest boulders in Corridor A)
  3. `titan_moss_pillar` (**new V7.2** — fluted moss-draped canopy pillar with shelf fungi & hanging vines in Interior B)
  4. `titan_gnarled` (twisting roots with lavender shelf fungi)
  5. `titan_buttress` (wide cathedral buttress roots with hanging cyan moss)
- **Root-to-Ground Integration:** Clustered damp emerald-umber moss aprons baked directly under every colossal trunk, fallen hollow log, and stone outcrop (`forest_floor_1440x340.png`) + walkable `fern_cluster` / `fern_cluster_small` skirts tucked naturally into root clefts.
- **Deliberate Clearing Focal Landmark:** Added `clearing_chime_outcrop` (mossy slate-teal boulder with 3 pale-cyan acoustic chime-reeds and golden Sun-Drop Orchids) at `(1244, 224)` inside Sunlit Clearing C.
- **Varied Canopy & Foreground Framing:** Added crooked mossy `canopy_bough_alt` overhead and gnarled `fg_bough_fern` on world-edge corners (`A` bottom-left, `C` bottom-right), while keeping uncropped bush silhouettes on interior scrolling edges so Zone A→B→C camera pans have zero cut seams.
- **Restrained Environmental Life (`proof_D_environmental_life_loop_480x270.gif`):**
  - Per-instance desynchronized canopy, bush & fern breeze sway (staggered phase/speed + travelling gust wave — never synchronized)
  - Staggered puddle dew-drop water ripples + live Mara footstep puddle ripples
  - Slow shifting dappled canopy light pools
  - Subtle falling cinnamon leaves, sunlit clearing pollen motes, and pale-cyan acoustic chime spores rising from the clearing outcrop
- **Natural Mara Readability (`proof_F_natural_occlusion_readability_480x270.png`):**
  - Subtle ambient zone shading (cool deep-canopy tint in Zone B, warm sun in Zone C)
  - Replaced V7.1's neon cyan occlusion outline with a **2×2 ordered-dither natural foliage peek** showing Mara's actual warm suit & ivory helmet colors ONLY when occluded behind trunks or foreground foliage — zero artificial cyan glow.

---

## 2. Real Standalone Godot 4.7.2 Implementation (`godot_project/`)

Every V7.1 placeholder stub (`metadata/sprite_key` on empty `StaticBody2D`, untextured `ForestFloor` / `HorizonParallax`) has been replaced by a real, self-contained **Godot 4.7.2 (`GL Compatibility`)** project at:

`game/assets/v72_forest_refinement_study/godot_project/`

- **`project.godot`**: Native `480×270` viewport (`960×540` `2×` integer override), `stretch/mode="viewport"`, `stretch/scale_mode="integer"`, `gl_compatibility`, `default_texture_filter=0` (Nearest), `snap_2d_transforms_to_pixel=true`, `snap_2d_vertices_to_pixel=true`.
- **`scenes/v72_forest_refinement.tscn`**:
  - **41 `ExtResource`** textures/shaders/scripts (all present under `res://`) and **54 `SubResource`** materials & collision shapes (`load_steps=96`)
  - **63 real textured `Sprite2D` nodes** across 6 depth planes (`HorizonParallax` `0.22×` `Parallax2D`, `ForestFloor` with `puddle_ripples.gdshader`, `TreelineLayer`, `RearTitansLayer`, `YSortWorld` with `y_sort_enabled=true`, `OverhangParallax` `1.05×`, and `ForegroundParallax` `1.15×`)
  - **18 solid `StaticBody2D` obstacles**, each with BOTH its real textured `Sprite2D` AND a matching `CollisionShape2D` (`CapsuleShape2D`)
  - **`YSortWorld/Mara` (`CharacterBody2D`)** with `BodySprite`, `OcclusionPeekSprite` (`z_index=45`, `z_as_relative=false`, `mara_natural_occlusion.gdshader`), `CollisionShape2D`, and pixel-clamped `Camera2D`
  - **`EnvironmentalLifeLayer`**: `CanopyDappleOverlay` (`canopy_dapple_light.gdshader`) + 3 `CPUParticles2D` emitters (`FallingLeaves`, `ChimeAcousticSpores`, `SunlitPollenMotes`)
- **4 GL Compatibility Shaders (`shaders/*.gdshader`)**: `foliage_sway.gdshader`, `puddle_ripples.gdshader`, `canopy_dapple_light.gdshader`, `mara_natural_occlusion.gdshader`.
- **`scripts/v72_forest_refinement.gd`**: Playable WASD/Arrow `move_and_slide()` movement, puddle ripple shader tracking, dynamic Y-sort + foreground occlusion peek toggle, quick camera jump keys (`1`/`2`/`3`/`4`/`5`, `F9` manual capture), and `--capture-proofs` CLI capture harness.

---

## 3. Honest Sandbox Verification Disclosure & Local Windows Godot Steps

- **What WAS verified in this Linux sandbox:**
  - All native `480×270` visual proofs (`A`, `B`, `C`, `F`), unscaled `1×` V7.1 vs V7.2 comparison sheet, `proof_D` environmental life loop GIF, and `proof_E` 80-frame A→C playable walkthrough GIF were rendered and visually inspected.
  - Automated static & referential integrity validation (`tools/verdant-pixel-forge/src/__tests__/v72GodotValidation.test.ts` — 5/5 passing, 14/14 suite total) verified `project.godot`, `load_steps=96`, all 41 `ExtResource` files on disk, all 54 `SubResource` references, zero V7.1 metadata stubs, all 63 textured `Sprite2D` nodes, all 18 `StaticBody2D+CollisionShape2D` solid obstacles, all `@onready` script paths, and all 4 `.gdshader` files.
- **What was NOT executed in this sandbox:**
  - `godot` / `godot4` runtime execution and real Godot framebuffer rendering were **NOT** run here because this sandbox has no Godot binary, no `Xvfb`/X11, no `libGL`/`libvulkan`, and outbound release downloads from `release-assets.githubusercontent.com` are blocked.
  - The browser preview (`playable_web/index.html`) is strictly a supplementary preview and is **not** presented as proof of Godot engine execution.

### Exact Local Windows Godot 4.7.2 Verification Steps

1. **Interactive Playtest in Godot 4.7.2 (Windows):**
   - Double-click `game\assets\v72_forest_refinement_study\godot_project\run_windows_verification.bat`, **or** run:
     ```bat
     "C:\Path\To\Godot_v4.7.2-stable_win64.exe" --path game\assets\v72_forest_refinement_study\godot_project
     ```
   - Walk with **WASD / Arrow Keys** (walk in front of & behind colossal trunks, weave between roots and ferns, cross A→B→C into the sunlit clearing, step across puddles).
   - Press **`1` / `2` / `3`** to inspect A / B / C, **`4`** for walk-behind occlusion readability, **`5`** for exposed-root navigation, **`F9`** for manual `480×270` PNG capture.
2. **Automated Real-Godot `480×270` Capture Run:**
   ```bat
   game\assets\v72_forest_refinement_study\godot_project\run_windows_verification.bat capture
   ```
   Saves 6 real Godot-rendered native `480×270` PNG screenshots into `game\assets\v72_forest_refinement_study\godot_project\godot_runtime_captures\`.
