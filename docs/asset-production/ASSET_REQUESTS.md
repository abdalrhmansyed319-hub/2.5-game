# *VERDANT SIGNAL* — Production Asset Requests & Delivery Manifest

> **Governing Standard**: Mandatory Asset Request & Specification Protocol (active for every production milestone).  
> **Visual & Technical Lock**: Oblique 3/4 Top-Down Painterly Pixel Art · **`480×270`** native viewport (`960×540` `2×` window) · **`16×16`** tile foundation · **`16×24`** Dr. Mara Lin footprint · **`Nearest`** texture filtering (`mipmaps = false`, zero mixels) · **Godot `4.7.2-stable` `GL Compatibility`** (Intel HD Graphics 3000 minimum target — keep alpha layers clean, avoid excessive per-pixel overdraw!).  
> **Palette Authority**: All hex ramps below strictly obey the WCAG-verified 5-Band color scripts in [`docs/concept/data/biomes.json`](../concept/data/biomes.json) and [`docs/concept/14-art-direction-and-pixel-art-bible.md`](../concept/14-art-direction-and-pixel-art-bible.md).

---

## 1. Asset Status Workflow & Approval Gate

Every asset progresses strictly through six tracked states:
`Requested` -> `In Production` -> `Received` -> `Integrated` -> `Tested` -> `Approved`

**Mandatory Intake Verification (on Receipt)**:
1. Inspect exact pixel dimensions, alpha transparency, frame grid alignment, and seam continuity via `tools/asset_inspector.py` + direct visual review (`read_file`).
2. Report any deviation from spec before integrating; never overwrite an `Approved` asset without explicit user approval.
3. Place inside the mapped `game/assets/` subfolder, verify `.import` (`Nearest`, `Mipmaps Off`, `Lossless`), test inside the target Godot scene on Windows, and advance status here.

---

## 2. Master Asset Delivery Manifest (Current Status)

| Asset ID | Filename | Milestone | Category | Target Godot Destination | Priority | Status |
| --- | --- | :---: | --- | --- | :---: | :---: |
| `AST-000` | `icon.svg` | M00 (Bootstrap) | Project Icon | `game/assets/icon.svg` | Critical | **Integrated** *(Pending Windows visual sign-off)* |
| `AST-001` | `char_mara_lin_sheet.png` | M01 (Visual & Movement Prototype) | Character Sprite Sheet | `game/assets/characters/player/char_mara_lin_sheet.png` | **Critical** | **Requested** |
| `AST-002` | `env_amber_coast_ground_tileset.png` | M01 (Visual & Movement Prototype) | Core Ground Tileset | `game/assets/world/tilesets/env_amber_coast_ground_tileset.png` | **Critical** | **Requested** |
| `AST-003` | `env_singing_canopy_ground_tileset.png` | M01 (Visual & Movement Prototype) | Core Ground Tileset | `game/assets/world/tilesets/env_singing_canopy_ground_tileset.png` | **Critical** | **Requested** |
| `AST-004` | `prop_singing_reedwood_tree_sheet.png` | M01 (Visual & Movement Prototype) | Multi-Tile Tree & Canopy | `game/assets/world/props/prop_singing_reedwood_tree_sheet.png` | **Critical** | **Requested** |
| `AST-005` | `prop_rimlands_flora_sheet.png` | M01 (Visual & Movement Prototype) | Starter Flora Props | `game/assets/world/flora/prop_rimlands_flora_sheet.png` | **High** | **Requested** |
| `AST-006` | `prop_drop_pod_landmark_sheet.png` | M01 (Visual & Movement Prototype) | Hero Landmark Prop | `game/assets/world/landmarks/prop_drop_pod_landmark_sheet.png` | **High** | **Requested** |
| `AST-007` | `fx_shadows_ripples_lens_sheet.png` | M01 (Visual & Movement Prototype) | Ground Shadows & VFX | `game/assets/vfx/fx_shadows_ripples_lens_sheet.png` | **High** | **Requested** |
| `AST-008` | `sfx_rimlands_core_pack` (`10` `.ogg`/`.wav` clips) | M01/M02 (Feel & Audio Gate) | Surface Footsteps & Lens SFX | `game/audio/sfx/` | **Optional** *(High for M02)* | **Requested** |

---

## 3. Shared Visual Consistency & Viewport Constraints (Apply to ALL M01 Assets)

- **Key Light Direction**: Locked **top-left (~45°)** warm golden-amber sunlight (*Aurelia-K* dwarf star) across all Milestone 01 daylight art. Shadows hue-shift toward cool slate-teal (`#2D423E` / `#1C485C`), never flat muddy black or grey.
- **No Mixels / Strict `1:1` Pixel Density**: Every pixel in characters, tiles, trees, landmarks, and VFX MUST match the exact same `1×` logical grid (`16×16` base tiles inside `480×270` viewport). Never mix higher-res strokes or anti-aliased brushes!
- **Living-Painting Readability Rule**: Keep Band 3 playable ground (`#B89A6C` sand, `#6F8A68` moss/forest floor) low-noise and painterly with soft organic gradients so Dr. Mara Lin (`16×24`, ~9% of screen height) reads effortlessly in motion without visual clutter.
- **Seamless Neighbors (M01 Ecosystem Continuity)**:
  - `env_amber_coast_ground_tileset.png` and `env_singing_canopy_ground_tileset.png` MUST share identical sand-to-grass border edge values (`#B89A6C` -> `#97AF7E` -> `#6F8A68`) so coastal beaches melt organically into the Reedwood forest without straight grid seams.
  - `prop_singing_reedwood_tree_sheet.png` lower trunk roots MUST color-blend cleanly onto `#6F8A68` / `#3D5444` forest floor tiles, while overhead canopies use clean opaque/semi-cutout pixel silhouettes (avoid soft blurred drop-shadows to stay crisp and Intel HD 3000-friendly).

---

## 4. Milestone 01 — Stage 05 Visual & Movement Prototype Gate (Exact Asset Specifications)

> **Why These Exact 8 Assets Are Needed Next**: Milestone 01 validates *VERDANT SIGNAL*'s core visual identity and technical feasibility on Windows (`Godot 4.7.2` + `GL Compatibility` on Intel HD Graphics 3000): crisp `480×270` scaling on `1366×768`, `16×24` character legibility across bright sand AND shaded forest, tall canopy walk-behind cutaway occlusion, non-grid painterly shoreline/forest tiling, and live `60 FPS` `3×3` `TileMapLayer` streaming.

---

### `AST-001` — `char_mara_lin_sheet.png`
1. **Asset Name**: `char_mara_lin_sheet.png`
2. **Purpose**: Primary playable protagonist (**Dr. Mara Lin**) for locomotion, crouch-stealth, and Acoustic Field Lens aiming/scanning in the Milestone 01 prototype and Vertical Slice.
3. **Visual Description**: Solitary human xenobotanist in a practical, weathered expedition field suit engineered for **dual-polarity readability** across both bright sand (`#B89A6C`) and deep reedwood shade (`#47695E`):
   - Weathered ivory-white helmet dome & upper shoulder shell (`#F4EFE2`, shaded `#C9D0C8`) so she pops cleanly in dark forests.
   - Deep charcoal-navy rugged trousers, boots, belt & compact field backpack (`#202A36`, shaded `#12161C`) so she pops cleanly on sunlit ochre sand.
   - Warm terracotta-orange expedition strap/pack trim (`#FF6B3D`) and small glowing amber-gold visor/chest lens indicator (`#FFB838`) for immediate eye-tracking.
   - Soft, crisp dark-navy selective outline (`#12161C`) — avoid muddy pure black boxes.
4. **Dimensions**:
   - **Per Frame**: `16 × 24 px` (single character height ~`20–22 px` inside the `16×24` cell, leaving `2 px` top headroom for bobbing and `1–2 px` side clearance).
   - **Total Sprite Sheet**: **`96 × 384 px`** (`6` columns × `16` rows, zero padding/spacing between cells).
5. **Perspective**: Oblique 3/4 Top-Down (head/shoulders slightly angled from above, feet clearly grounded on the bottom baseline).
6. **Style**: Painterly indie pixel art (*Hyper Light Drifter* × *Eastward* silhouette clarity), clean pixel clusters, zero mixels, zero soft anti-aliasing, warm top-left key light.
7. **Animation (Single Combined Sprite Sheet — Transparent Background)**:
   - **Layout**: `6` columns × `16` rows (`16×24` per cell -> `96×384 px` total). Unused trailing cells in shorter rows stay fully transparent.
   - **Directions**: `4` dedicated directions (`down`, `up`, `right`, `left`) — separate `left` and `right` rows prevent backpack/tool asymmetry mirroring artifacts.
   - **Exact Row-by-Row Frame Order & Playback**:
     - Row `00` (`idle_down`): `4` frames (Cols `0–3`), subtle breathing & pack shift, `5 FPS`, looping.
     - Row `01` (`idle_up`): `4` frames (Cols `0–3`), `5 FPS`, looping.
     - Row `02` (`idle_right`): `4` frames (Cols `0–3`), `5 FPS`, looping.
     - Row `03` (`idle_left`): `4` frames (Cols `0–3`), `5 FPS`, looping.
     - Row `04` (`walk_down`): `6` frames (Cols `0–5`), crisp natural stride (`contact-down-pass-contact-down-pass`), `10 FPS`, looping.
     - Row `05` (`walk_up`): `6` frames (Cols `0–5`), `10 FPS`, looping.
     - Row `06` (`walk_right`): `6` frames (Cols `0–5`), `10 FPS`, looping.
     - Row `07` (`walk_left`): `6` frames (Cols `0–5`), `10 FPS`, looping.
     - Row `08` (`crouch_walk_down`): `4` frames (Cols `0–3`), lowered hunched careful stealth posture (~`17 px` tall), `7 FPS`, looping.
     - Row `09` (`crouch_walk_up`): `4` frames (Cols `0–3`), `7 FPS`, looping.
     - Row `10` (`crouch_walk_right`): `4` frames (Cols `0–3`), `7 FPS`, looping.
     - Row `11` (`crouch_walk_left`): `4` frames (Cols `0–3`), `7 FPS`, looping.
     - Row `12` (`lens_scan_down`): `2` frames (Cols `0–1`), raising Acoustic Field Lens with subtle amber visor glow pulse (`#FFB838`), `4 FPS`, looping while held.
     - Row `13` (`lens_scan_up`): `2` frames (Cols `0–1`), `4 FPS`, looping while held.
     - Row `14` (`lens_scan_right`): `2` frames (Cols `0–1`), `4 FPS`, looping while held.
     - Row `15` (`lens_scan_left`): `2` frames (Cols `0–1`), `4 FPS`, looping while held.
8. **Transparency**: Required (`RGBA` 32-bit PNG, fully transparent background; zero baked floor shadow — shadow comes from `AST-007` so elevation/water reflections behave cleanly!).
9. **Pivot / Origin**: Bottom-center at **`(8, 22)`** inside each `16×24` frame (feet planted squarely on row `y = 22` so Y-sorting against trees and rocks aligns pixel-accurately).
10. **Variations**: `4` directional views × `4` animation states (`16` rows total on one sheet).
11. **Godot Integration**:
    - Target Path: `game/assets/characters/player/char_mara_lin_sheet.png`
    - Node Type: `Sprite2D` (`hframes = 6`, `vframes = 16`, `offset = Vector2(0, -10)`) driven by `AnimationPlayer` (or `AnimatedSprite2D` using `AtlasTexture`) inside `CharacterBody2D` on `YSortWorldLayer`.
    - Import Settings: `Compress = Lossless`, `Mipmaps = Off`, `Filter = Nearest` (project default).
12. **Priority**: **Critical** (required to test real `16×24` silhouette legibility, contrast, and canopy occlusion in Milestone 01).

---

### `AST-002` — `env_amber_coast_ground_tileset.png`
1. **Asset Name**: `env_amber_coast_ground_tileset.png`
2. **Purpose**: Primary ground, curved shoreline, shallow tidal water, and low coastal rock-ledge tileset for **Biome 01 — Amber Kelp Littoral** (crash-landing zone).
3. **Visual Description**: Painterly warm alien littoral coastline under golden sunlight:
   - Dry & damp ochre sand (`#B89A6C` base, `#D7BE91` sunlit ripples, `#9B7F58` wet shoreline band, `#7C6549` tidal pebbles/shadows).
   - Translucent teal coastal water (`#367E8A` shallow turquoise, `#1C485C` deeper water edge, crisp `#C9DCE3` 1 px organic sea-foam edges).
   - Layered weathered coastal sandstone/basalt low cliffs (`#7E9AA2` sunlit top rim, `#566B73` vertical rock face, `#2D423E` base shadow).
   - **Anti-Grid Rule**: Avoid repetitive checkerboard sand noise; keep 70% of center sand tiles calm & smooth with subtle organic wind ripples, putting crisp detail along curved shore bevels and sparse shell/pebble variants.
4. **Dimensions**:
   - **Tile Size**: `16 × 16 px` exact grid.
   - **Total Atlas Dimensions**: **`192 × 128 px`** (`12` columns × `8` rows, `0 px` padding — Godot `TileSetAtlasSource` `use_texture_padding = true` handles seam protection cleanly).
5. **Perspective**: Oblique 3/4 Top-Down (cliff vertical faces clearly visible on southern/front edges, top walkable faces angled gently downward).
6. **Style**: Painterly pixel art, hue-shifted warm-to-cool ramps, zero harsh black tile borders, seamlessly tileable across repeating ground/water cells.
7. **Animation**: Static terrain tileset PLUS `2`-frame gentle shoreline foam / water shimmer rows included cleanly in the bottom rows:
   - **Exact Atlas Grid Map (`12 cols × 8 rows`)**:
     - Rows `0–2`, Cols `0–3` (`4×3`): `12` core dry-sand autotile pieces + `4` subtle sand-ripple/pebble variation tiles (Cols `4–7`, Row `0`).
     - Rows `0–2`, Cols `4–11`: Curved **Dry Sand -> Wet Sand -> Shallow Water** shoreline autotile set (outer corners, inner corners, straight N/S/E/W curved bevels — `16` tiles minimum).
     - Rows `3–5`, Cols `0–5`: **Low Coastal Rock Ledge / Cliff** autotile set (top cap, front vertical rock face `16–32 px` visual drop, left/right cliff corners, inner notches).
     - Rows `3–5`, Cols `6–11`: **Shallow Tidal Pool & Submerged Sandbars** (walkable knee-deep water tiles + wet dark-ochre mud/shell borders for *Drift-Wreck Cove* Low Tide!).
     - Row `6`, Cols `0–7`: **Animated Water Surface & Foam Frame A** (`4` shallow water shimmer + `4` N/S/E/W foam edge tiles).
     - Row `7`, Cols `0–7`: **Animated Water Surface & Foam Frame B** (matching `2 FPS` gentle surf loop with Row `6`; remaining cells Cols `8–11` reserved for organic beach pebbles, driftwood, and washed-up kelp decals).
8. **Transparency**: Required (`RGBA` 32-bit PNG; transparent outside curved shoreline edges, cliff overlays, and beach decals so layers composite cleanly on stacked `TileMapLayer` nodes!).
9. **Pivot / Origin**: Standard `TileMapLayer` cell center `(8, 8)` per `16×16` tile.
10. **Variations**: `4` seamless dry sand floor variants, `2` animated water shimmer frames, `4` beach debris/pebble decals.
11. **Godot Integration**:
    - Target Path: `game/assets/world/tilesets/env_amber_coast_ground_tileset.png`
    - Node Type: `TileSetAtlasSource` (`texture_region_size = Vector2i(16, 16)`, `use_texture_padding = true`) across `WaterBaseLayer`, `GroundLayer` (with `custom_data("surface_type") = "sand" | "shallow_water"`), `CliffWallCollisionLayer` (`physics_quadrant_size = 16`), and `GroundDecalShadowLayer`.
    - Import Settings: `Compress = Lossless`, `Mipmaps = Off`, `Filter = Nearest`.
12. **Priority**: **Critical** (foundation of the Milestone 01 playable coastline & `TileMapLayer` streaming benchmark).

---

### `AST-003` — `env_singing_canopy_ground_tileset.png`
1. **Asset Name**: `env_singing_canopy_ground_tileset.png`
2. **Purpose**: Ground terrain, moss borders, root-lined forest paths, and seamless sand-to-forest ecotone transition tiles for **Biome 02 — Singing Reedwood Canopy**.
3. **Visual Description**: Lush, painterly olive-sage alien woodland floor (`#6F8A68` base moss/leaf litter, `#97AF7E` warm sun-dappled patches, `#3D5444` deep canopy floor shadows, `#47695E` cool background moss edges) paired with pale golden-ochre worn footpath dirt (`#B89A6C` / `#8C7757`) and shallow forest creek water (`#4B8B82`).
   - **Mandatory Neighbor Seamlessness**: Ecotone transition tiles MUST connect cleanly on their outer transparent edges to `env_amber_coast_ground_tileset.png`'s `#B89A6C` ochre sand so coastal grass tufts overlap beach sand naturally!
4. **Dimensions**:
   - **Tile Size**: `16 × 16 px` exact grid.
   - **Total Atlas Dimensions**: **`192 × 96 px`** (`12` columns × `6` rows, `0 px` padding).
5. **Perspective**: Oblique 3/4 Top-Down matching `AST-002` identically.
6. **Style**: Painterly pixel art, soft low-noise turf clusters (never noisy 1 px grass static!), cohesive hue-shifted teal-olive shadows matching `AST-002`.
7. **Animation**: Static tileset (ambient forest movement comes from `AST-004` tree sway & `AST-005` swaying flora!).
   - **Exact Atlas Grid Map (`12 cols × 6 rows`)**:
     - Rows `0–2`, Cols `0–3`: `4` seamless olive-sage moss base floor tiles + `8` **Forest Floor -> Coastal Sand** ragged organic edge transition tiles (overlapping grass tufts & exposed reed roots!).
     - Rows `0–2`, Cols `4–11`: **Root-Lined Dirt Trail** autotile set (straight, curved corners, junctions, worn clearing patches).
     - Rows `3–5`, Cols `0–5`: **Elevated Mossy Forest Terrace / Root-Bank Ledge** (matching `AST-002` cliff height grammar for multi-tier glades!).
     - Rows `3–5`, Cols `6–11`: **Forest Stream Bank (`#4B8B82`) & Ground Decals** (fallen hollow reed segments, dappled sun-spot decals, clover/lichen moss patches, stepping stones).
8. **Transparency**: Required (`RGBA` 32-bit PNG; transparent outside organic transition edges, root overhangs, and ground decals).
9. **Pivot / Origin**: Standard `TileMapLayer` cell center `(8, 8)` per `16×16` tile.
10. **Variations**: `4` calm base turf variants + `6` organic ground litter/root decals.
11. **Godot Integration**:
    - Target Path: `game/assets/world/tilesets/env_singing_canopy_ground_tileset.png`
    - Node Type: `TileSetAtlasSource` (`16×16`, `use_texture_padding = true`) on `GroundLayer` (`custom_data("surface_type") = "reedwood_floor"`), `CliffWallCollisionLayer`, and `GroundDecalShadowLayer`.
    - Import Settings: `Compress = Lossless`, `Mipmaps = Off`, `Filter = Nearest`.
12. **Priority**: **Critical** (required to test dual-polarity contrast and seamless biome transitions in Milestone 01).

---

### `AST-004` — `prop_singing_reedwood_tree_sheet.png`
1. **Asset Name**: `prop_singing_reedwood_tree_sheet.png`
2. **Purpose**: Signature towering alien tree (**Singing Reedwood**, *Arundo sonoris*) proving our "small astronaut in sweeping painted nature" scale AND testing **walk-behind translucent canopy fadeaways** in Oblique 3/4 Top-Down!
3. **Visual Description**: Cathedral-tall, slender, slightly fluted hollow reed-tree (`~3.3×` Dr. Mara Lin's height!):
   - **Lower Trunk & Buttress Roots**: Pale warm-ochre / weathered driftwood-olive segmented hollow reed column (`#9B8F74` sunlit left ridge, `#5F6652` mid-bark, `#313D36` deep shadow) featuring **distinct carved vertical dark wind-slits** (`#1B2624`) along the upper trunk that catch faint golden internal resonance glow (`#FFB838`) when wind passes through! Root flare grips `#3D5444` mossy ground cleanly.
   - **Upper Feathery Canopy Crown**: Sweeping painterly layered fronds/plumes in muted seafoam-sage (`#97AF7E` sunlit crown tips, `#6F8A68` mid-fronds, `#47695E` deep underside shade, `#2D423E` shadow recesses) arching organically outward.
   - **Critical Layer Split**: Each tree is split cleanly across two adjacent columns — **Lower Trunk/Roots** (solid Y-sorted collision trunk) and **Overhead Canopy Crown** (placed on `CanopyWeatherOverlayLayer` so it smoothly fades translucent when Mara walks behind it without fading the grounded trunk!).
4. **Dimensions**:
   - **Per Cell**: `48 × 80 px` (spanning `3 × 5` world tiles!).
   - **Total Sheet Dimensions**: **`96 × 160 px`** (`2` columns × `2` rows, `0 px` padding).
5. **Perspective**: Oblique 3/4 Top-Down (roots grounded cleanly near bottom, tall fluted trunk rising vertically, feathery canopy overhanging upward and slightly forward).
6. **Style**: Painterly pixel clusters (think Ghibli foliage depth in crisp `1×` pixel art — lush layered silhouette masses, never random single-pixel leaf noise!).
7. **Animation**: Static split-layer sprite sheet (gentle organic wind sway & storm-bending driven cleanly via our lightweight Stage 05 `pixel_wind_sway.gdshader` — Intel HD 3000 friendly!).
   - **Exact Sheet Layout (`2 cols × 2 rows`, `48×80` per cell -> `96×160 px`)**:
     - Row `0`, Col `0`: **Variant A — Lower Fluted Trunk & Grounded Roots** (trunk base sits at `y = 66..76`, upper trunk cuts cleanly behind canopy).
     - Row `0`, Col `1`: **Variant A — Overhead Canopy Crown** (registered pixel-for-pixel at the EXACT same `48×80` canvas coordinates as Col `0` so stacking Col `1` directly over Col `0` assembles the complete seamless tree!).
     - Row `1`, Col `0`: **Variant B — Slightly Leaning Twin-Stem Fluted Trunk & Roots** (breaks visual repetition in groves).
     - Row `1`, Col `1`: **Variant B — Matching Overhead Canopy Crown** (pixel-registered to Row `1`, Col `0`).
8. **Transparency**: Required (`RGBA` 32-bit PNG, fully transparent outside trunk/canopy silhouettes; zero baked ground shadow).
9. **Pivot / Origin**: Trunk base bottom-center at **`(24, 72)`** inside each `48×80` cell (both Col `0` and Col `1` share identical `(24, 72)` registration!).
10. **Variations**: `2` distinct tree silhouettes × `2` registered layers (`trunk` + `canopy`).
11. **Godot Integration**:
    - Target Path: `game/assets/world/props/prop_singing_reedwood_tree_sheet.png`
    - Node Type: Reusable `StaticBody2D` scene (`YSortWorldLayer`) with trunk `Sprite2D` + compact foot `CollisionShape2D` (`16×10 px` capsule at trunk base) + canopy `Sprite2D` (`z_index` / `CanopyWeatherOverlayLayer` + `Area2D` on `layer_8="canopy_occluder"` triggering smooth `0.35` alpha cutaway fade when Mara enters behind it).
    - Import Settings: `Compress = Lossless`, `Mipmaps = Off`, `Filter = Nearest`.
12. **Priority**: **Critical** (essential for Milestone 01's scale check, Y-sorting, and canopy-occlusion verification!).

---

### `AST-005` — `prop_rimlands_flora_sheet.png`
1. **Asset Name**: `prop_rimlands_flora_sheet.png`
2. **Purpose**: Interactive starter botanical props populating the Milestone 01 coastline & reedwood edge (`Amber Tide-Kelp`, `Mirror Glasswort`, `Sun-Drop Bulb`, `Cordage Frond`).
3. **Visual Description**: Four unmistakable alien plant silhouettes anchored in `amber_kelp_coast` and `singing_canopy` palettes:
   - **Amber Tide-Kelp (`fl_01`)**: Tall translucent golden-amber ribbon kelp (`#E49836` mid, `#FFC648` sunlit rim, `#8C5320` wet stem base) rising from coastal shallows/wet sand.
   - **Mirror Glasswort (`fl_02`)**: Compact crystalline sea-glass succulent cluster (`#C9DCE3` specular tips, `#7E9AA2` translucent stalks, `#367E8A` wet shadow) hugging sandy coves.
   - **Sun-Drop Bulb (`fl_04`)**: Warm bulbous forest-edge shrub with glowing honey-gold nectar petals (`#FFB838` / `#FFE047` open bloom inside `#47695E` cupped sepals; closed tight olive bud at night!).
   - **Cordage Frond (`fl_05`)**: Broad tough woven-ribbed fern fronds (`#6F8A68` / `#97AF7E` fibrous veins, `#3D5444` base).
4. **Dimensions**:
   - **Per Cell**: `16 × 32 px` uniform cell grid (shorter `16×16` ground plants occupy the bottom half `y = 16..31` cleanly!).
   - **Total Sheet Dimensions**: **`64 × 128 px`** (`4` columns × `4` rows, `0 px` padding).
5. **Perspective**: Oblique 3/4 Top-Down.
6. **Style**: Painterly pixel art, distinct readable shapes even in grayscale, crisp dark-tinted bases grounding into sand/moss.
7. **Animation & Exact Sheet Layout (`4 cols × 4 rows`, `16×32` per cell -> `64×128 px`, transparent PNG)**:
   - Row `0`, Cols `0–3`: **`Amber Tide-Kelp`** — `4`-frame gentle sea-breeze sway cycle (`4 FPS`, looping).
   - Row `1`, Cols `0–1`: **`Mirror Glasswort`** — `2` static shape variations (Cols `2–3` transparent).
   - Row `2`, Cols `0–1`: **`Sun-Drop Bulb`** — Col `0`: *Daytime Open Blooming State*, Col `1`: *Nighttime Closed Bud State* (Cols `2–3` transparent).
   - Row `3`, Cols `0–1`: **`Cordage Frond`** — `2` static clump variations (Cols `2–3` transparent).
8. **Transparency**: Required (`RGBA` 32-bit PNG, transparent background).
9. **Pivot / Origin**: Bottom-center at **`(8, 30)`** inside each `16×32` cell for accurate Y-sorting.
10. **Variations**: `4` distinct flora species covering `10` total frames/variants on one clean sheet.
11. **Godot Integration**:
    - Target Path: `game/assets/world/flora/prop_rimlands_flora_sheet.png`
    - Node Type: Modular flora `Node2D` scenes (`Sprite2D` region / `AnimatedSprite2D` on `YSortWorldLayer` + `Area2D` on `layer_5="interactable_flora"`).
    - Import Settings: `Compress = Lossless`, `Mipmaps = Off`, `Filter = Nearest`.
12. **Priority**: **High** (brings Milestone 01 coastline & glades to life and validates ecological Poisson spacing visually).

---

### `AST-006` — `prop_drop_pod_landmark_sheet.png`
1. **Asset Name**: `prop_drop_pod_landmark_sheet.png`
2. **Purpose**: **Hero Landmark #1 (*Drop-Pod Clearing*)** — Mara's crashed *ICV Meridian* emergency drop-pod + salvage crates proving our **Handcrafted Hero Landmark + Feathered Blend Collar** visual strategy!
3. **Visual Description**: Grounded, tactile sci-fi human intrusion contrasting warmly against organic alien sand:
   - **Emergency Drop-Pod Hull**: Scuffed matte ivory-ceramic outer plates (`#E8E4D8`, shaded `#9DA4AB`), international aerospace burnt-orange rescue stripe (`#FF6B3D`), heat-scorched charcoal thruster nose (`#202A36`), cracked curved canopy glass (`#367E8A` reflecting pale sky `#C9DCE3`), angled partially embedded into furrowed ochre sand (`#B89A6C` / `#7C6549` soft feathered sand-ridge collar along the bottom edge so it melts seamlessly into `AST-002` sand!).
   - **Salvage Crates (2)**: Compact weathered field supply cases (`#D7CFC2` + `#FF6B3D` hazard latch) partially dusted with coastal sand.
4. **Dimensions**:
   - **Total Sheet Dimensions**: **`96 × 64 px`** (single clean prop sheet with transparent background):
     - Region `(0, 0, 64, 48)`: **Crashed *ICV Meridian* Drop-Pod** (`64 × 48 px` = `4 × 3` world tiles).
     - Region `(64, 0, 16, 16)`: **Supply Crate Variant A (Intact)** (`16 × 16 px`).
     - Region `(80, 0, 16, 16)`: **Supply Crate Variant B (Half-Buried Open)** (`16 × 16 px`).
     - Region `(64, 16, 32, 32)`: **Deployed Compact Field Camp Tent / Lamp Pack** (`32 × 32 px`, warm amber interior glow `#FFB838` for Milestone 01 lighting & camp readability test!).
     - Region `(0, 48, 64, 16)`: **Scorched Sand Skid-Furrow Ground Decal** (`64 × 16 px`, transparent soft edges for `GroundDecalShadowLayer`).
5. **Perspective**: Oblique 3/4 Top-Down matching `AST-002` & `AST-004`.
6. **Style**: Painterly pixel art, realistic lived-in scratches and dust (zero glossy plastic gradients), warm top-left sunlight matching coastline tiles.
7. **Animation**: Static landmark prop sheet (optional tiny blinking beacon LED or rising smoke wisps handled cleanly via lightweight Godot pixels/particles later).
8. **Transparency**: Required (`RGBA` 32-bit PNG, transparent background).
9. **Pivot / Origin**:
   - Drop-Pod: bottom-center **`(32, 42)`** within its `64×48` region.
   - Crates: **`(8, 14)`** within each `16×16` region.
   - Camp Tent: **`(16, 28)`** within its `32×32` region.
10. **Variations**: `5` cohesive Hero Landmark elements packed on `1` atlas sheet.
11. **Godot Integration**:
    - Target Path: `game/assets/world/landmarks/prop_drop_pod_landmark_sheet.png`
    - Node Type: Handcrafted `PackedScene` prefab (`game/world/landmarks/drop_pod_clearing.tscn`) using `Sprite2D` (`region_enabled = true`) + `StaticBody2D` polygon collider on `layer_1="world_solid"`.
    - Import Settings: `Compress = Lossless`, `Mipmaps = Off`, `Filter = Nearest`.
12. **Priority**: **High** (proves the living-painting focal composition & feathered landmark blend collar in Milestone 01).

---

### `AST-007` — `fx_shadows_ripples_lens_sheet.png`
1. **Asset Name**: `fx_shadows_ripples_lens_sheet.png`
2. **Purpose**: Grounded pixel contact shadows (preventing floating actors/trees!), shallow-water footstep wade ripples, and **Acoustic Field Lens** concentric pulse wave VFX — all lightweight `Sprite2D` quads ideal for `GL Compatibility / Intel HD 3000` (zero heavy GPU shaders required!).
3. **Visual Description**:
   - **Contact Shadows**: Clean crisp elliptical dark-slate shadows (`#12161C` at ~`35–45%` uniform pixel opacity — crisp pixel-art edges, NO blurry Gaussian feathering!).
   - **Shallow-Water Wade Ripples**: Crisp 1 px expanding concentric ovals in pale seafoam `#C9DCE3` / `#6CF2B2` tint.
   - **Acoustic Field Lens Pulse**: Delicate broken concentric harmonic wave rings in soft bioluminescent cyan-gold (`#4CE8E0` & `#FFB838`, 1 px crisp dashed arcs expanding outward!).
4. **Dimensions**:
   - **Per Cell**: `32 × 32 px` uniform cell grid.
   - **Total Sheet Dimensions**: **`128 × 96 px`** (`4` columns × `3` rows, `0 px` padding).
5. **Perspective**: Flat oblique ground-plane ovals (`2:1` horizontal-to-vertical perspective compression matching Oblique 3/4 Top-Down!).
6. **Style**: Clean crisp 1 px pixel-art VFX, zero blurry anti-aliased rings.
7. **Animation & Exact Sheet Layout (`4 cols × 3 rows`, `32×32` per cell -> `128×96 px`, transparent PNG)**:
   - Row `0`, Col `0`: **Small Actor Contact Shadow** (`12×6 px` centered oval for Mara / small fauna).
   - Row `0`, Col `1`: **Medium Flora/Crate Contact Shadow** (`18×9 px` centered oval).
   - Row `0`, Col `2`: **Large Tree Trunk Contact Shadow** (`30×14 px` centered oval for Singing Reedwoods).
   - Row `0`, Col `3`: Transparent (unused).
   - Row `1`, Cols `0–3`: **Shallow-Water Wade Ripple** — `4`-frame expanding ring (`8 FPS`, one-shot).
   - Row `2`, Cols `0–3`: **Acoustic Field Lens Sound Wave Ring** — `4`-frame expanding dashed harmonic oval (`8 FPS`, one-shot/pulse).
8. **Transparency**: Required (`RGBA` 32-bit PNG, semi-transparent shadow row + crisp opaque/alpha pixel rings).
9. **Pivot / Origin**: Center **`(16, 16)`** inside each `32×32` cell.
10. **Variations**: `3` shadow sizes + `2` four-frame VFX animations (`11` active cells).
11. **Godot Integration**:
    - Target Path: `game/assets/vfx/fx_shadows_ripples_lens_sheet.png`
    - Node Type: `Sprite2D` (`region_enabled = true`) on `GroundDecalShadowLayer` (shadows) + lightweight pooled `AnimatedSprite2D` (ripples & acoustic rings).
    - Import Settings: `Compress = Lossless`, `Mipmaps = Off`, `Filter = Nearest`.
12. **Priority**: **High** (immediately anchors sprites into the painted ground and proves Acoustic Lens readability with near-zero GPU cost on Intel HD 3000).

---

### `AST-008` — `sfx_rimlands_core_pack` (Audio Asset Pack — `10` Short Clips)
1. **Asset Name** *(exact filenames)*:
   - `sfx_footstep_sand_01.ogg`, `sfx_footstep_sand_02.ogg`, `sfx_footstep_sand_03.ogg`
   - `sfx_footstep_water_01.ogg`, `sfx_footstep_water_02.ogg`, `sfx_footstep_water_03.ogg`
   - `sfx_footstep_moss_01.ogg`, `sfx_footstep_moss_02.ogg`, `sfx_footstep_moss_03.ogg`
   - `sfx_acoustic_lens_ping_01.ogg`
   *(Uncompressed 16-bit `.wav` also accepted cleanly for short clips under 200 KB!)*
2. **Purpose**: Proves *VERDANT SIGNAL*'s surface-aware `TileData` footstep audio and organic acoustic Field Lens feedback routed cleanly through `game/audio/default_bus_layout.tres` (`Tier2_Action`!).
3. **Visual / Sonic Description**: Dry, intimate, organic Foley with zero harsh clipping or metallic sci-fi beeps:
   - *Sand*: Soft crunchy dry littoral grit (`0.12–0.18s`).
   - *Water*: Light ankle-deep tidal lap/splash (`0.18–0.25s`).
   - *Moss/Reedwood Floor*: Soft muffled woodland earth & dry reed leaf brush (`0.12–0.18s`).
   - *Acoustic Lens Ping*: Warm breathy wooden-flute / glass-harmonica double-overtone chime (`0.45–0.65s`, gentle resonant tail).
4. **Dimensions / Technical Format**: **Mono**, `44.1 kHz`, `16-bit` `.ogg` (Vorbis `q6`) or `.wav`, peak normalized cleanly to **`-3 dBFS`**, trimmed tightly (`< 10 ms` leading silence).
5. **Perspective**: Non-positional centered player Foley (`AudioStreamPlayer`, Mono).
6. **Style**: Intimate organic acoustic naturalism matching Deliverable O (`15-audio-direction.md`).
7. **Animation / Playback**: Loaded into Godot `AudioStreamRandomizer` (`PLAYBACK_RANDOM_NO_REPEATS`, `±4%` pitch variance) per surface type; one-shot non-looping clips.
8. **Transparency**: N/A (Audio — clean silence tail, zero DC offset or click pops).
9. **Pivot / Origin**: Transient onset aligned cleanly within first `5–10 ms` of clip.
10. **Variations**: `3` distinct takes per surface × `3` surfaces (`9` footsteps) + `1` Acoustic Lens ping = `10` files.
11. **Godot Integration**:
    - Target Path: `game/audio/sfx/`
    - Node Type: `AudioStreamPlayer` routed to bus **`Tier2_Action`** with `AudioStreamRandomizer` driven by `TileData.get_custom_data("surface_type")`.
    - Import Settings: `Loop = Off`.
12. **Priority**: **Optional** for Milestone 01 Visual Prototype (code can run silently until received), **High** for Milestone 02 Feel & Audio Gate.
