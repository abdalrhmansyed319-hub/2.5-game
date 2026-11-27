# VERDANT SIGNAL — V7.3: EXTREME PLAYABILITY, CONTINUOUS WORLD & PROFESSIONAL ENVIRONMENTAL COLLISION SYSTEM

**Status:** Isolated Playability Study Complete (Static, Physics & Visual Proofs Verified — Pending Windows Godot 4.7.2 Runtime Sign-Off)  
**Isolated Workspace Root:** `game/assets/v73_open_world_playability_study/` (`.gdignore`-protected)  
**Visual Baseline Preserved Untouched:** V7.2 (`5f3a4cb`), V7.1 (`be1d194`), V7.0 (`1186efc`), V5.0 (`70f1b02`), V4.0 (`9b0e7d4`), v3.0 (`b1a67b5`), Milestone 01 (`ad81346`), and production `game/project.godot` are **100% untouched**.

---

## 1. Supplied Player Character Inspection & Integration Report

**Source File (Google Drive):** `A_highly_detailed_full-body_pixel_121240.zip` (`1,770,255` bytes, `465` entries)  
**Verbatim Preservation Path:**
- Original archive (bit-for-bit untouched): `game/assets/v73_open_world_playability_study/character_source_original/A_highly_detailed_full-body_pixel_121240.zip`
- Unpacked read-only reference mirror: `game/assets/v73_open_world_playability_study/character_source_original/extracted/`
- Structured machine-readable manifest: `game/assets/v73_open_world_playability_study/character_inspection_manifest.json`

### Complete Asset Inventory & Audit

| Category | Path inside ZIP | Frame Dimensions | Directions Present | Frames / Dir | Transparency / Format |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Static Rotations | `Idle/rotations/*.png` | `64×64` (body bbox `33–47×59–62`, foot baseline `y=60..63`) | **8 directions** (`south`, `south-east`, `east`, `north-east`, `north`, `north-west`, `west`, `south-west`) | 1 | Clean 8-bit `sRGBA` transparent alpha |
| `Idle` | `Idle/animations/Idle/{dir}/` | **`88×88`** (`12px` uniform padding around the same `64×64` body, foot anchor `(44, 75)`) | **4 cardinals only** (`south`, `north`, `east`, `west`) | 8 (`frame_000`–`frame_007`) | Clean 8-bit `sRGBA` |
| `Walking` | `Idle/animations/Walking/{dir}/` | **`88×88`** | **4 cardinals only** (`south`, `north`, `east`, `west`) | 8 (`frame_000`–`frame_007`) | Clean 8-bit `sRGBA` |
| `Running` | `Idle/animations/Running/{dir}/` | **`88×88`** | **4 cardinals only** (`south`, `north`, `east`, `west`) | 8 (`frame_000`–`frame_007`) | Clean 8-bit `sRGBA` |
| Contextual Action Animations (10 archived sets) | `Idle/animations/{Crawling,Falling Back Death,Getting Up,High Kick,Jumping,Picking Up,Pulling Heavy Object,Pushing,Sad Walk,Taking a Punch}/` | **`88×88`** | **4 cardinals only** (`south`, `north`, `east`, `west`) | 9 each | Clean 8-bit `sRGBA` |

### Transparent Reporting of Supplied-Asset Findings (Zero Fabrication, Zero Alteration)
1. **Zero Pixel Modification Verified:** Every integrated sprite strip (`char_idle_88x88_8x4.png`, `char_walking_88x88_8x4.png`, `char_running_88x88_8x4.png`) packs the exact unmodified `88×88` RGBA pixels side-by-side (`704×352`). Our automated Vitest suite performs a byte-for-byte `Buffer.compare` check against the raw unpacked source frame (`frame_000.png`) to guarantee **0 altered pixels, 0 resizing, 0 recoloring, and 0 cropping**.
2. **Missing Diagonal Multi-Frame Animations:** While static `64×64` rotations include all 8 compass headings, **all 13 multi-frame animations (`Idle`, `Walking`, `Running`, etc.) only supply 4 cardinal directions (`south`, `north`, `east`, `west`)**. Per your strict instruction never to fabricate missing artwork, V7.3 drives full normalized 8-direction movement physics while applying **hysteresis-locked cardinal facing (`1.12×` axis bias)** so diagonal walking/running never flickers or pops between facing directions. If you later supply diagonal animated frames (`south-east`, `north-east`, `north-west`, `south-west`), the controller can drop them in as rows 4–7 with zero architecture changes.
3. **Viewport Resolution & Unmodified Scale Decision (`640×360` vs `480×270`):** Because the unmodified character body is **`~60px` tall inside an `88×88` frame**, displaying her unmodified at `480×270` causes her sprite to occupy `22.2%` of vertical screen height (leaving tight framing around massive ancient trees), whereas **`640×360` (`16:9` exact `1:1` pixel ratio, integer-scaling `2× → 1280×720` and `3× → 1920×1080`)** keeps her at `16.6%` of viewport height with **zero resampling of the supplied pixel art** while preserving V7.2's monumental scale contrast against towering ancient trees. If you explicitly prefer strict `480×270` native viewport resolution in Godot `project.godot`, we can either: (a) keep the character unmodified at `480×270` (closer camera feel) or (b) apply an approved character downscale only after your explicit approval.
4. **Anti-Slide & Ground Alignment:** `BodySprite.offset = Vector2(0, -31)` aligns the exact boot contact pixel `(44, 75)` directly to `Player.position (0, 0)`. When `actual_speed < 8.0 px/s` against a solid obstacle, the controller immediately transitions from `walking`/`running` to `idle` so the character never slides or runs in place against trunks, boulders, or logs.

---

## 2. Zero Visible Asset Boundaries & Continuous World Architecture

V7.3 eliminates V7.2's visible rectangular sprite boundaries through three structural engineering changes:
1. **100% Uncropped 4-Side Interior Modular Assets:** Every standalone tree (`full_tree_rock`, `full_tree_redwood`), overhead canopy crown (`crown_dome_a`, `crown_wide_b`), exposed root arch (`root_arch`), mossy boulder cluster (`mossy_boulder_cluster`, `mossy_boulder_small`), fallen hollow log (`fallen_hollow_log`), ancient waystone (`waystone_landmark`), clearing chime outcrop (`clearing_chime_outcrop`), fern, and bush is extracted with a verified transparent margin on all 4 sides (`verifyUncropped4Sides` enforces `0` opaque border pixels).
2. **Seamless Trunk-to-Canopy Pairing:** Every colossal ancient trunk (`titan_moss_pillar`, `titan_buttress`, `titan_gnarled`, `titan_straight`, `titan_split_arch`, `full_tree_broad_base`) is strictly paired with an overlapping complete canopy crown (`crown_dome_a` / `crown_wide_b`) draped `45–60px` down over the upper trunk bark — making every trunk-to-canopy transition seamless with **0 exposed trunk tops** across the entire map.
3. **Continuous `2304×1536` Open-World Canvas with 240px+ 4-Edge Deep-Forest Ring:**
   - World Floor: Continuous non-repeating painterly `2304×1536` woodland canvas (zero tile seams) featuring multi-octave moss shade, organic worn mossy loam trails, fallen autumn leaf-litter beds around roots, tiny pebbles, clover tufts, wildflowers, and 6 sky-reflecting rainwater pools.
   - Camera Clamping: `camX ∈ [240, 1424]`, `camY ∈ [200, 976]` (`640×360` view spans `[240..2064] × [200..1336]`).
   - Walkable Core: `walkX ∈ [330, 1974]`, `walkY ∈ [290, 1236]`, surrounded on all 4 sides (North, South, East, West) by organic depth-staggered giant trees, overlapping canopy roofs, and perimeter thickets extending past the camera edges.
   - **Automated 25-Position Boundary Scan:** Verified across a `5×5` camera grid spanning every boundary and corner — **`25/25` positions 100% opaque, `0` uncovered colossal trunk tops, `0` empty/void pixels**, visually confirmed in `proofs/proof_08_all_4_world_boundaries_quad_1x.png`.

---

## 3. Continuous Explorable Open World — All 8 Environmental Composition Categories (A–H)

| Key | Category | Zone Location | Distinctive Elements & Navigation Routes |
| :--- | :--- | :--- | :--- |
| `1` | **B — Medium-Density Woodland** | Central Woodland Hub (`1024, 822`) | Massive central Moss Pillar Titan navigable **360°** (front & behind), sunlit root puddle, mossy boulders, soft slow-thickets, and organic worn woodland trails radiating in all directions. |
| `2` | **A — Dense Ancient Forest Cluster** | Northwest Cathedral (`586, 582`) | Overlapping triple-colossal ancient trunks, deep cool indigo-pine canopy shade, soft undergrowth thicket, and western root arch (`nw_arch_west`). |
| `3` | **D — Root-Dominated Hollow** | North Hollow (`1118, 454`) | Singular focal **Exposed Root Arch** with solid left/right structural root legs and a wide **walkable center passage underneath**, framed by moss boulders and reflective pool. |
| `4` | **H — Distinct Landmark Glade** | Northeast Glade (`1656, 518`) | Carved spiral **Ancient Acoustic Waystone Monolith** wrapped in mossy roots, shelf fungi, golden flowers, and gently rising acoustic spores. |
| `5` | **C — Broad Sunlit Clearing** | East Clearing (`1618, 824`) | Strong golden dappled clearing contrasting deep NW shade, featuring the **Chime-Reed & Sun-Drop Orchid Outcrop** and twin sky-reflecting pools (`0.90×` wading + live footstep ripples). |
| `6` | **F — Wet Forest Floor & Shallow Pools** | South Basin (`1146, 1044`) | Broad shallow rainwater pools with dew-drop & explorer footstep ripples, mossy shoreline boulders, and lush ferns. |
| `7` | **E — Mossy Rock Formations** | Southwest Ridge (`654, 1116`) | Staggered multi-scale mossy slate rock clusters (large + small + flipped variants, zero adjacent repeats) with multiple winding passages between boulders. |
| `8` | **G — Fallen-Tree Environment** | West Hollow (`632, 944`) | Dramatic giant mossy **Fallen Hollow Tunnel Log** encrusted in violet shelf fungi, with multi-segment rootball & barrel collision allowing tight navigation all around its contours. |

---

## 4. Professional Multi-Shape Physical Collision System & Live `F3` Debug Mode

Every solid obstacle in both the simulation engine (`v73OpenWorldEngine.ts`) and the real Godot 4.7.2 scene (`scenes/v73_open_world_forest.tscn`) uses deliberate convex `CollisionPolygon2D` shapes matching the physical contact base (NEVER oversized rectangles!).

| Collider Role | Godot Node Type | Debug Color (`F3`) | Gameplay Behavior |
| :--- | :--- | :--- | :--- |
| `solid_trunk` | `StaticBody2D` + `CollisionPolygon2D` (hexagonal trunk base) | Red (`#FF4A4A`) | Solid trunk core; outer bark silhouettes & upper trunks allow full walk-behind Y-sorting & natural 2×2 ordered-dither peek. |
| `solid_root` | `StaticBody2D` + `CollisionPolygon2D` (separate angled root spurs / arch legs) | Amber (`#FFA438`) | Structural buttress roots & arch legs block physically; outer decorative root tips remain cleanly walkable. |
| `solid_rock` | `StaticBody2D` + `CollisionPolygon2D` (beveled rock footprint) | Sky Blue (`#4CC3FF`) | Follows boulder contours cleanly with zero invisible remote blocking. |
| `solid_log` | `StaticBody2D` + 2× `CollisionPolygon2D` (rootball + main trunk barrel) | Orange (`#FF7A40`) | Follows angled hollow fallen log form; surrounding ferns & path remain unobstructed. |
| `solid_thicket` | `StaticBody2D` + `CollisionPolygon2D` | Violet (`#D86CFF`) | Dense deep-forest outer perimeter barrier bushes. |
| `slow_thicket` | `Area2D` + `CollisionPolygon2D` (`collision_layer=4`) | Dashed Lime (`#B8FF4A`) | Deliberately designated dense undergrowth bushes that allow smooth pass-through at **`0.78×` speed**. |
| `walkable_arch` | `Area2D` + `CollisionPolygon2D` (`collision_layer=4`) | Dashed Cyan (`#38F2FF`) | Walkable open center passage underneath Exposed Root Arches (`1.0×` speed + triggers natural overhead occlusion peek). |
| Decorative Ferns / Canopies | `Sprite2D` only (**zero collision**) | *(none)* | Ferns never snag feet; overhead canopies never block ground travel. |
| Player Foot Footprint | `CharacterBody2D` + rotated `CapsuleShape2D` (`r=6, h=22`) | White Ellipse | Rounded boot capsule prevents snagging/jitter on convex polygon vertices. |

---

## 5. Standalone Godot 4.7.2 (`GL Compatibility`) Architecture & Intel HD 3000 Profiling

**Standalone Project Path:** `game/assets/v73_open_world_playability_study/godot_project/`

### Real Scene Composition (`scenes/v73_open_world_forest.tscn`)
- **Renderer:** `gl_compatibility` (OpenGL 3.3 / Intel HD Graphics 3000 safe)
- **External Resources:** `38` verified `.png` / `.gd` / `.gdshader` files (zero broken paths)
- **Sub-Resources:** `100` (`ShaderMaterial` sway/ripple/dapple/occlusion + player `CapsuleShape2D`)
- **Real Godot Nodes:** `170` `Sprite2D` nodes, `81` `StaticBody2D` nodes owning `142` exact `CollisionPolygon2D` shapes, `6` `Area2D` walkable zone triggers (`slow_thicket` & `walkable_arch`), `1` `CharacterBody2D` player with `Camera2D` pixel snapping, `1` `CollisionDebugDrawer` (`F3`), and `1` `PerfLabel` live HUD (`F4`).

### Static Hardware Budget Analysis (Intel HD Graphics 3000)
| Metric | V7.3 Measured Static Count | Intel HD 3000 Safety Notes |
| :--- | :--- | :--- |
| Peak Visible Culled Props / Frame | **`<= 33` sprites** across all 25 camera grid positions | Godot 4 `CanvasItem` frustum culling skips off-screen sprites automatically. |
| Active `CPUParticles2D` Count | **`34` total particles** (18 leaves + 8 clearing spores + 8 waystone spores) | CPU-driven tiny quads (`<= 2px`); well under conservative Intel HD 3000 fill-rate budget. |
| Custom Shaders (`GL Compatibility`) | `4` minimal 2D `canvas_item` shaders (`foliage_sway`, `puddle_ripples`, `canopy_dapple_light`, `mara_natural_occlusion`) | Zero screen-reading `hint_screen_texture` passes, zero multi-pass bloom, zero 2D shadow casters; strictly branch-light arithmetic. |
| Physics Bodies / Polygons | `81` static bodies (`142` convex polygons) + `6` `Area2D` zones | Static broadphase spatial hash (`BVH`); near-zero per-frame physics cost for 1 `CharacterBody2D`. |
| Transparent Overdraw Risk | 2–3 max overlapping layers (floor + Y-sort trunk/arch + overhead canopy) | Tightly trimmed sprite bounds prevent full-screen transparent quad overdraw. |

### IMPORTANT RUNTIME DISCLOSURE & WINDOWS GODOT 4.7.2 VERIFICATION
> **Real Godot 4.7.2 Runtime Status:** This Linux sandbox has **no Godot 4.7.2 binary, no OpenGL/GPU driver, and no display server**. Therefore, **no live Godot 4.7.2 runtime execution or hardware FPS measurement on Intel HD Graphics 3000 was performed here**, and no unmeasured FPS target is claimed. The browser preview (`playable_web/index.html`) and Vitest suite (`18/18` passed) validate scene integrity, bit-for-bit character preservation, boundary coverage, and collision math — they are **not** substitutes for running the real Godot project on your target Windows hardware.

#### Exact Windows Godot 4.7.2 Verification Commands
1. **Interactive Playtest (with live `F3` Collision-Debug & `F4` Intel HD 3000 Profiler HUD):**
   ```bat
   cd game\assets\v73_open_world_playability_study\godot_project
   run_windows_verification.bat
   ```
   - Controls: `WASD` / `Arrows` (8-dir normalized) · `Shift` (Run) · `F3` (Live Collision-Debug overlay) · `F4` (Live FPS / frame ms / draw calls HUD) · `1–8` (Jump to Composition Zones A–H) · `F9` (Save native `640×360` PNG capture).
2. **Automated Headless/Windowed 10-Shot Godot Runtime Proof Capture:**
   ```bat
   run_windows_verification.bat capture
   ```
   Saves 10 native `640×360` Godot-rendered PNGs (`godot_01`–`godot_10`, covering gameplay zones, Collision-Debug overlays, and all 4 world boundaries) into `godot_project/godot_runtime_captures/`.

---

## 6. Required Proof Deliverables Inventory (`game/assets/v73_open_world_playability_study/proofs/`)

| Artifact | Purpose |
| :--- | :--- |
| `proof_01_woodland_hub_center_640x360.png` | Native `640×360` Central Woodland Hub (360° Giant Moss Pillar Titan + unmodified astronaut) |
| `proof_02_root_arch_and_hollow_640x360.png` | Native `640×360` North Root-Dominated Hollow (walking straight beneath Exposed Root Arch) |
| `proof_03_sunlit_clearing_and_chimes_640x360.png` | Native `640×360` East Broad Sunlit Clearing + Chime-Reed & Sun-Drop Orchid Outcrop + pool |
| `proof_04_fallen_log_and_rocks_640x360.png` | Native `640×360` West Fallen Hollow Tunnel Log + Southwest Mossy Boulder Ridge |
| `proof_05_collision_debug_hub_640x360.png` | **Collision-Debug:** Trunk core, amber root spurs, blue rocks, dashed lime slow-thickets & white foot ellipse |
| `proof_06_collision_debug_arch_640x360.png` | **Collision-Debug:** Exposed Root Arch amber structural legs + cyan walkable center passage |
| `proof_07_collision_debug_clearing_log_640x360.png` | **Collision-Debug:** Dual-polygon Fallen Hollow Log + Mossy Boulder polygons |
| `proof_08_all_4_world_boundaries_quad_1x.png` | **Boundary Verification:** Unscaled `2×2` native `640×360` proof of NORTH, SOUTH, WEST & EAST boundaries |
| `proof_09_continuous_exploration_9_scenarios_640x360.gif` | **Continuous Exploration Recording (120 frames):** Uninterrupted physics-driven tour demonstrating all 9 required movement, collision, occlusion, biome & 4-boundary scenarios |
| `proof_10_behind_trunk_natural_occlusion_640x360.png` | Natural 2×2 ordered-dither peek behind colossal Hub trunk (**zero artificial cyan glow**) |
| `proof_11_waystone_glade_640x360.png` | Native `640×360` Northeast Ancient Acoustic Waystone Landmark Glade |
