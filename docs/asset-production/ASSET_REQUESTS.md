# *VERDANT SIGNAL* — Production Asset Requests & Delivery Manifest

> **Governing Standard**: Mandatory Asset Request & Specification Protocol (active for every production milestone).  
> **Specification Audit Status**: **v2.0 (Audited & Mathematically Verified)** — All `AST-001`–`AST-007` frame grids, atlas coordinates, pixel-overlap checks, `TileSet` terrain configurations, directional mirroring rules, and Godot `Sprite2D` local offsets have been formally audited before artwork production.  
> **Visual & Technical Lock**: Oblique 3/4 Top-Down Painterly Pixel Art · **`480×270`** native viewport (`960×540` `2×` window) · **`16×16`** tile foundation · **`16×24`** Dr. Mara Lin footprint · **`Nearest`** texture filtering (`mipmaps = false`, zero mixels) · **Godot `4.7.2-stable` `GL Compatibility`** (Intel HD Graphics 3000 minimum target).  
> **Palette Authority**: All hex ramps strictly obey [`docs/concept/data/biomes.json`](../concept/data/biomes.json) and [`docs/concept/14-art-direction-and-pixel-art-bible.md`](../concept/14-art-direction-and-pixel-art-bible.md).

---

## 1. Specification Audit Changelog (v1.0 -> v2.0 Corrections Resolved)

| Asset ID | Audit Finding in v1.0 | Resolution Applied in v2.0 |
| :---: | --- | --- |
| `AST-001` | Row ranges were summarized (`00–03`, etc.) without a cell-by-cell flat index map (`0..95`), unused cell map, or formal directional-mirroring policy. | Added complete `6×16` (`96`-cell) frame-by-frame table (`64` populated + `32` explicit unused transparent cells), proved `Sprite2D.offset = Vector2(0, -10)`, and formally **rejected horizontal mirroring (`flip_h`)** due to Mara's asymmetrical pack strap, right-hip lens holster, and top-left 45° key light. |
| `AST-002` | Cols `4–7`, Row `0` overlapped between dry-sand variants and shoreline autotiles; animated water frames were stacked vertically across Rows `6` and `7` rather than horizontal pairs; missing Godot `TileSet` terrain bitmask spec. | Rebuilt into a **100% non-overlapping `12×8` (`96`-cell) coordinate map** (`18` `TERRAIN_MODE_MATCH_CORNERS` Wang tiles + `12` shallow tidal + `6` decals + `18` cliffs + `12` deep-water shelf + `6` explicit unused cells + `12` horizontal `2`-frame `animation_columns=2` water/foam pairs). |
| `AST-003` | Ecotone transitions, trail autotiles, and stream tiles lacked an exact `(col, row)` coordinate map and `TileSet` terrain mode specification. | Rebuilt into a **100% non-overlapping `12×6` (`72`-cell) coordinate map** (`18` `TERRAIN_MODE_MATCH_CORNERS` moss->sand ecotone tiles + `16` full 4-bit `TERRAIN_MODE_MATCH_SIDES` trail tiles + `6` decals + `18` mossy terraces + `14` creek bank & `2`-frame horizontal stream tiles). |
| `AST-004` | Lacked exact Godot node assembly, local `Sprite2D.offset` proof, canopy z-ordering vs Y-sort architecture, and trunk/canopy fade seam collar. | Specified exact shared origin `(24, 72)`, proven `offset = Vector2(0, -32)` on both `TrunkSprite` and `CanopySprite` (`z_index = 20, z_as_relative = false`) under one `StaticBody2D`, mandatory **`4 px` trunk-behind-canopy overlap collar (`y = 32..36`)**, and exact foot collider + `CanopyFadeArea` bounds. |
| `AST-005` | Missing explicit `Rect2` bounds, unused cell listing, and `Sprite2D.offset` proof. | Verified `4×4` (`16×32` cells = `64×128 px`) with `10` active cells, `6` explicit unused cells, zero overlap, and `offset = Vector2(0, -14)`. |
| `AST-006` | Bottom-right `32×16` rectangle `(64, 48, 32, 16)` was unmentioned in the `96×64` atlas; missing per-region `Sprite2D.offset` math. | Mathematically partitioned all `6144 px²` (`5` prop `Rect2`s + explicit `(64, 48, 32, 16)` `UNUSED / TRANSPARENT` cell) with verified `Sprite2D.offset` values for every prop. |
| `AST-007` | Missing per-frame oval bounds check inside `32×32` cells to verify zero clipping on largest shadow/pulse frames. | Verified all `12` `32×32` cells (`11` active + `1` explicit unused cell `(3,0)`), bounded largest shadow (`30×14`) and pulse (`30×15`) with `>= 1 px` transparent margin, and verified `offset = Vector2.ZERO`. |

---

## 2. Asset Status Workflow & Approval Gate

Every production asset progresses strictly through six tracked states:
`Requested` -> `In Production` -> `Received` -> `Integrated` -> `Tested` -> `Approved`

**Mandatory Intake Verification (on Receipt)**:
1. Inspect exact pixel dimensions, alpha transparency, frame grid alignment, unused-cell cleanliness, and seam continuity via `tools/asset_inspector.py` + direct visual review (`read_file`).
2. Report any deviation from spec before integrating; never overwrite an `Approved` asset without explicit user permission.
3. Place inside the mapped `game/assets/` subfolder, verify `.import` (`Nearest`, `Mipmaps Off`, `Lossless`), test inside the target Godot scene on actual Windows hardware, and advance status here.

---

## 3. Master Production Asset Delivery Manifest

| Asset ID | Filename | Milestone | Category | Target Godot Destination | Priority | Status |
| :---: | --- | :---: | --- | --- | :---: | :---: |
| `AST-000` | `icon.svg` | M00 | Project Icon | `game/assets/icon.svg` | Critical | **Integrated** *(Pending Windows visual sign-off)* |
| `AST-001` | `char_mara_lin_sheet.png` | M01 | Character Sprite Sheet (`96×384`) | `game/assets/characters/player/char_mara_lin_sheet.png` *(Candidate staged in `candidates/`)* | **Critical** | **Received** *(VPF Candidate Pending Artistic Approval — Not Yet Integrated)* |
| `AST-002` | `env_amber_coast_ground_tileset.png` | M01 | Core Ground Tileset (`192×128`) | `game/assets/world/tilesets/env_amber_coast_ground_tileset.png` | **Critical** | **Requested** *(Spec v2.0 Audited)* |
| `AST-003` | `env_singing_canopy_ground_tileset.png` | M01 | Core Ground Tileset (`192×96`) | `game/assets/world/tilesets/env_singing_canopy_ground_tileset.png` | **Critical** | **Requested** *(Spec v2.0 Audited)* |
| `AST-004` | `prop_singing_reedwood_tree_sheet.png` | M01 | Multi-Tile Tree & Canopy (`96×160`) | `game/assets/world/props/prop_singing_reedwood_tree_sheet.png` | **Critical** | **Requested** *(Spec v2.0 Audited)* |
| `AST-005` | `prop_rimlands_flora_sheet.png` | M01 | Starter Flora Props (`64×128`) | `game/assets/world/flora/prop_rimlands_flora_sheet.png` | **High** | **Requested** *(Spec v2.0 Audited)* |
| `AST-006` | `prop_drop_pod_landmark_sheet.png` | M01 | Hero Landmark Prop (`96×64`) | `game/assets/world/landmarks/prop_drop_pod_landmark_sheet.png` | **High** | **Requested** *(Spec v2.0 Audited)* |
| `AST-007` | `fx_shadows_ripples_lens_sheet.png` | M01 | Ground Shadows & VFX (`128×96`) | `game/assets/vfx/fx_shadows_ripples_lens_sheet.png` | **High** | **Requested** *(Spec v2.0 Audited)* |
| `AST-008` | `sfx_rimlands_core_pack` (`10` `.ogg`/`.wav`) | M01/M02 | Surface Footsteps & Lens SFX | `game/audio/sfx/` | **Optional** *(High for M02)* | **Requested** |

### Temporary Debug Placeholder Registry (NEVER Counts as Production Art)

> Per Rule 6 (*Do Not Block Progress Unnecessarily*), Milestone 01 engineering uses isolated, explicitly labeled debug geometry stored strictly under `game/assets/debug_placeholders/`. Every placeholder matches the **exact v2.0 audited dimensions and cell coordinates** so swapping final artwork requires zero code rewrite. **The Stage 05 Visual Prototype Gate CANNOT pass until every `DEBUG_PLACEHOLDER` below is replaced by approved production artwork and verified on Windows hardware.**

| Replaces | Temporary Debug File (Non-Final) | Dimensions |
| :---: | --- | :---: |
| `AST-001` | `game/assets/debug_placeholders/debug_placeholder_char_mara_lin_sheet.png` | `96 × 384 px` |
| `AST-002` | `game/assets/debug_placeholders/debug_placeholder_env_amber_coast_ground_tileset.png` | `192 × 128 px` |
| `AST-003` | `game/assets/debug_placeholders/debug_placeholder_env_singing_canopy_ground_tileset.png` | `192 × 96 px` |
| `AST-004` | `game/assets/debug_placeholders/debug_placeholder_prop_singing_reedwood_tree_sheet.png` | `96 × 160 px` |
| `AST-005` | `game/assets/debug_placeholders/debug_placeholder_prop_rimlands_flora_sheet.png` | `64 × 128 px` |
| `AST-006` | `game/assets/debug_placeholders/debug_placeholder_prop_drop_pod_landmark_sheet.png` | `96 × 64 px` |
| `AST-007` | `game/assets/debug_placeholders/debug_placeholder_fx_shadows_ripples_lens_sheet.png` | `128 × 96 px` |

---

## 4. Shared Visual Consistency & Viewport Constraints (Apply to ALL M01 Assets)

- **Key Light Direction**: Locked **top-left (~45°)** warm golden-amber sunlight (*Aurelia-K* dwarf star). Shadows hue-shift cool (`#2D423E` / `#1C485C`), never flat muddy grey/black.
- **No Mixels / Strict `1:1` Pixel Density**: Every pixel matches the `1×` logical grid (`16×16` tiles inside `480×270` viewport; scaled `2×` to `960×540` window). Zero anti-aliased brushes, zero Gaussian blur, zero mixed resolutions.
- **Living-Painting Readability Rule**: Keep Band 3 playable ground (`#B89A6C` sand, `#6F8A68` moss) calm and painterly so Dr. Mara Lin (`16×24`, ~9% of screen height) pops cleanly in motion across both sunlit beach and shaded canopy.
- **Intel HD Graphics 3000 (`GL Compatibility`) Constraint**: Avoid excessive stacked alpha blur layers; rely on crisp opaque pixel silhouettes and lightweight single-quad overlays.
- **Seamless Neighbors**:
  - `AST-003` ragged moss edges (`#6F8A68` / `#97AF7E`) composite directly over `AST-002` dry sand (`#B89A6C`) on `EcotoneOverlayLayer` (`z_index = 0`, above `GroundLayer`).
  - `AST-004` lower tree roots ground onto `#6F8A68` / `#3D5444` forest floor tiles; `AST-006` drop-pod sand collar blends directly into `#B89A6C` / `#7C6549` coastal sand.

---

## 5. Audited Milestone 01 Asset Specifications (v2.0 — Zero Ambiguity)

---

### `AST-001` — `char_mara_lin_sheet.png` (**Priority: Critical**)

1. **Asset Name**: `char_mara_lin_sheet.png`
2. **Purpose**: Primary playable protagonist (**Dr. Mara Lin**) for 8-direction movement, crouch-stealth, Y-sort readability, and Acoustic Field Lens scanning.
3. **Visual Description**: Solitary human xenobotanist engineered for **dual-polarity readability** on both sunlit ochre sand (`#B89A6C`) and deep reedwood shade (`#47695E`):
   - Weathered ivory-white helmet crown & upper jacket (`#F4EFE2`, shade `#C9D0C8`) for forest readability.
   - Deep charcoal-navy rugged trousers, boots & field backpack (`#202A36`, shade `#12161C`) for bright-sand readability.
   - **Asymmetrical Equipment Details (Why Mirroring Is Forbidden)**: Diagonal burnt-orange terracotta strap (`#FF6B3D`) running from Mara's left shoulder to right hip, **right-hip Acoustic Field Lens holster**, **right-handed Field Lens raise during `lens_scan_*`**, and glowing amber-gold visor/lens accent (`#FFB838`).
   - Crisp selective dark-navy outline (`#12161C`).
4. **Dimensions**:
   - **Per Frame**: **`16 × 24 px`** (standing figure occupies `x = 2..13`, `y = 2..22`, leaving `2 px` headroom for walk bobbing and `1 px` bottom safety row `y = 23`).
   - **Total Sprite Sheet**: **`96 × 384 px`** (`6` columns × `16` rows = `96` cells, `0 px` padding/spacing).
5. **Perspective**: Oblique 3/4 Top-Down.
6. **Style**: Painterly indie pixel art (*Hyper Light Drifter* × *Eastward* silhouette clarity), warm top-left 45° key light, zero mixels.
7. **Animation & Exact Frame-by-Frame Sheet Layout (`96 × 384 px`, Single Sheet, Transparent PNG)**:
   - **Directional Mirroring Policy**: **HORIZONTAL MIRRORING (`flip_h`) IS EXPLICITLY DISALLOWED.** Because Mara's diagonal strap, right-hip lens holster, right-hand scan posture, and top-left 45° sunlight are asymmetrical, `right` and `left` MUST be individually drawn across dedicated rows.
   - **Cell Accounting**: **`64` populated frames** + **`32` explicitly unused fully-transparent cells (`RGBA = 0,0,0,0`)** = `96` total cells (`hframes = 6, vframes = 16`).

| Row | Animation Name | Direction | Frame Count | Populated Cols | Flat `Sprite2D.frame` Indices | Unused Transparent Cols | Playback |
| :---: | --- | :---: | :---: | :---: | :---: | :---: | :---: |
| `00` | `idle_down` | Down (South) | `4` | `0, 1, 2, 3` | `0, 1, 2, 3` | `4, 5` (indices `4, 5`) | `5 FPS`, Loop |
| `01` | `idle_up` | Up (North) | `4` | `0, 1, 2, 3` | `6, 7, 8, 9` | `4, 5` (indices `10, 11`) | `5 FPS`, Loop |
| `02` | `idle_right` | Right (East) | `4` | `0, 1, 2, 3` | `12, 13, 14, 15` | `4, 5` (indices `16, 17`) | `5 FPS`, Loop |
| `03` | `idle_left` | Left (West) | `4` | `0, 1, 2, 3` | `18, 19, 20, 21` | `4, 5` (indices `22, 23`) | `5 FPS`, Loop |
| `04` | `walk_down` | Down (South) | `6` | `0, 1, 2, 3, 4, 5` | `24, 25, 26, 27, 28, 29` | *None* | `10 FPS`, Loop |
| `05` | `walk_up` | Up (North) | `6` | `0, 1, 2, 3, 4, 5` | `30, 31, 32, 33, 34, 35` | *None* | `10 FPS`, Loop |
| `06` | `walk_right` | Right (East) | `6` | `0, 1, 2, 3, 4, 5` | `36, 37, 38, 39, 40, 41` | *None* | `10 FPS`, Loop |
| `07` | `walk_left` | Left (West) | `6` | `0, 1, 2, 3, 4, 5` | `42, 43, 44, 45, 46, 47` | *None* | `10 FPS`, Loop |
| `08` | `crouch_walk_down` | Down (South) | `4` | `0, 1, 2, 3` | `48, 49, 50, 51` | `4, 5` (indices `52, 53`) | `7 FPS`, Loop |
| `09` | `crouch_walk_up` | Up (North) | `4` | `0, 1, 2, 3` | `54, 55, 56, 57` | `4, 5` (indices `58, 59`) | `7 FPS`, Loop |
| `10` | `crouch_walk_right` | Right (East) | `4` | `0, 1, 2, 3` | `60, 61, 62, 63` | `4, 5` (indices `64, 65`) | `7 FPS`, Loop |
| `11` | `crouch_walk_left` | Left (West) | `4` | `0, 1, 2, 3` | `66, 67, 68, 69` | `4, 5` (indices `70, 71`) | `7 FPS`, Loop |
| `12` | `lens_scan_down` | Down (South) | `2` | `0, 1` | `72, 73` | `2, 3, 4, 5` (`74..77`) | `4 FPS`, Loop |
| `13` | `lens_scan_up` | Up (North) | `2` | `0, 1` | `78, 79` | `2, 3, 4, 5` (`80..83`) | `4 FPS`, Loop |
| `14` | `lens_scan_right` | Right (East) | `2` | `0, 1` | `84, 85` | `2, 3, 4, 5` (`86..89`) | `4 FPS`, Loop |
| `15` | `lens_scan_left` | Left (West) | `2` | `0, 1` | `90, 91` | `2, 3, 4, 5` (`92..95`) | `4 FPS`, Loop |

   - **Walk Cycle Frame Order (`walk_*`, 6 frames)**: `Col 0` Left-foot contact -> `Col 1` Down recoil (`+1 px` lower) -> `Col 2` Passing -> `Col 3` Right-foot contact -> `Col 4` Down recoil (`+1 px` lower) -> `Col 5` Passing.
   - **Crouch Walk Posture (`crouch_walk_*`, 4 frames)**: Hunched silhouette ~`17 px` tall (`y = 6..22`), feet stay planted on `y = 22`.
8. **Transparency**: Required (`RGBA` 32-bit PNG, fully transparent background; zero baked floor shadow — shadow comes from `AST-007`).
9. **Pivot / Origin & Godot Offset Proof**:
   - Ground contact foot-center inside every `16×24` frame: **`(8, 22)`** (soles rest on row `y = 22`).
   - Frame geometric center: `(8, 12)`.
   - With `Sprite2D.centered = true`: `offset = Vector2(8 - 8, 12 - 22) = Vector2(0, -10)`. Pixel `(8, 22)` maps identically to `CharacterBody2D` local origin `(0, 0)` (exact Y-sort anchor!).
10. **Variations**: `4` dedicated non-mirrored directions × `4` locomotion/tool states (`16` rows).
11. **Godot Integration**:
    - Path: `game/assets/characters/player/char_mara_lin_sheet.png`
    - Node: `Sprite2D` (`hframes = 6`, `vframes = 16`, `centered = true`, `offset = Vector2(0, -10)`) inside `Player` (`CharacterBody2D`, `motion_mode = MOTION_MODE_FLOATING`, `collision_layer = 2`, `collision_mask = 5`, foot `RectangleShape2D(10, 6)` at `(0, -2)`).
    - Import: `Compress = Lossless`, `Mipmaps = Off`, `Filter = Nearest`.
12. **Production Candidate Delivery Status (2026-11-25 — Pending User Artistic Sign-Off)**:
    - **Authoring Tool**: Authored and exported natively through **VERDANT PIXEL FORGE v1.1** (`tools/verdant-pixel-forge/`, 8 editable layers × 64 populated frames × 16 tags, exported via `'tag_rows'` Godot `6×16` RGBA8 PNG pipeline). Visual identity reconciled directly with approved `mara_lin_concept_128x128_v2.png` and `VERDANT_SIGNAL_PIXEL_ART_STYLE_GUIDE.md` (30-color Master Palette: burnt-orange survival suit, warm ivory helmet stripe, curved dark-teal glass visor, weathered brown harness/boots, brushed titanium backpack & chest rig, moss specimen vial, metallic parabolic Acoustic Field Lens).
    - **Candidate Staging Paths (Isolated from M01 Gameplay & Concept Art)**:
      - Production Candidate Sheet (`96×384` RGBA8 PNG): `game/assets/characters/player/candidates/ast001_char_mara_lin_sheet.png`
      - Editable VPF Studio Project (8 layers × 64 frames): `game/assets/characters/player/candidates/ast001_char_mara_lin_candidate.vpf.json` (also loadable live via VERDANT PIXEL FORGE **Repo Assets -> `ast001_mara_vpf`**)
      - Godot Metadata & Import Sidecar: `game/assets/characters/player/candidates/ast001_godot_manifest.json` & `ast001_char_mara_lin_sheet.png.import`
      - Review & Animated Previews: `game/assets/characters/player/candidates/previews/` (`ast001_directions_and_states_8x.png`, `ast001_walk_cycles_6x.png`, `ast001_sheet_1x_and_3x_review.png`, `ast001_showcase_loop_4x.gif`, + 8 individual `4×` animated GIFs)
    - **Integration Gate**: `game/assets/debug_placeholders/debug_placeholder_char_mara_lin_sheet.png` and `game/characters/player/player.gd` remain **untouched** until explicit artistic approval is granted. Upon approval, promote `candidates/ast001_char_mara_lin_sheet.png` -> `game/assets/characters/player/char_mara_lin_sheet.png` and wire into `Player.tscn`.
12. **Priority**: **Critical**.

---

### `AST-002` — `env_amber_coast_ground_tileset.png` (**Priority: Critical**)

1. **Asset Name**: `env_amber_coast_ground_tileset.png`
2. **Purpose**: Ground sand, curved coastlines, walkable shallow tidal pools, low coastal cliffs, beach decals, and animated coastal water/foam for **Biome 01 — Amber Kelp Littoral**.
3. **Visual Description**: Warm ochre coastal sand (`#B89A6C` base, `#D7BE91` sunlit ripple, `#9B7F58` damp shore edge, `#7C6549` pebble shade), translucent turquoise-teal coastal water (`#367E8A` shallow, `#1C485C` deep, `#C9DCE3` 1 px organic sea-foam), weathered coastal sandstone/basalt ledges (`#7E9AA2` top cap, `#566B73` vertical front rock face, `#2D423E` base shade). Keep center sand tiles calm & low-noise so characters pop clearly.
4. **Dimensions**: **`16 × 16 px`** tile grid · **`192 × 128 px`** total atlas (`12` columns × `8` rows = `96` cells, `0 px` padding; Godot `use_texture_padding = true`).
5. **Perspective**: Oblique 3/4 Top-Down (southern vertical cliff faces clearly readable).
6. **Style**: Painterly pixel art, zero harsh grid outlines, seamlessly tileable across repeating ground/water regions.
7. **Animation & Exact Non-Overlapping `12 × 8` (`96`-Cell) Atlas Coordinate Map**:
   - Every `(col, row)` coordinate is uniquely assigned (`18 + 12 + 6 + 18 + 12 + 6 unused + 24 animated = 96` cells; **zero overlaps**).
   - **Animated Water Layout Rule**: Godot 4 `TileSetAtlasSource` reads consecutive frames horizontally (`animation_columns = 2`, `animation_frames_count = 2`, `animation_speed = 2.0 FPS`). Rows `6` and `7` therefore hold `6` side-by-side 2-frame pairs each (`12` animated water/foam tiles total).

| Atlas Coords `(col, row)` | Tile Role / Exact Description | Godot Layer | `surface_type` / Physics / Terrain Bitmask |
| --- | --- | --- | --- |
| `(0,0)` | Full Dry Ochre Sand A (calm base, weight `0.55`) | `GroundLayer` | `sand` · **Terrain Set 0 (`MATCH_CORNERS`) T0**: `TL+TR+BL+BR` |
| `(1,0)` | Full Dry Sand B (subtle wind ripple, weight `0.20`) | `GroundLayer` | `sand` · **Set 0 T0**: `TL+TR+BL+BR` |
| `(2,0)` | Full Dry Sand C (tiny pebbles, weight `0.15`) | `GroundLayer` | `sand` · **Set 0 T0**: `TL+TR+BL+BR` |
| `(3,0)` | Full Dry Sand D (faint shell glint, weight `0.10`) | `GroundLayer` | `sand` · **Set 0 T0**: `TL+TR+BL+BR` |
| `(4,0)` | Curved Sand Cape — Outer NW Corner | `GroundLayer` | `sand` · **Set 0 T0**: `BR` only (transparent NW/NE/SW) |
| `(5,0)` | Curved Coastline — North Edge (water north) | `GroundLayer` | `sand` · **Set 0 T0**: `BL+BR` |
| `(6,0)` | Curved Sand Cape — Outer NE Corner | `GroundLayer` | `sand` · **Set 0 T0**: `BL` only |
| `(7,0)` | Curved Coastline — West Edge (water west) | `GroundLayer` | `sand` · **Set 0 T0**: `TR+BR` |
| `(0,1)` | Concave Cove Bay — Inner NW Water Notch | `GroundLayer` | `sand` · **Set 0 T0**: `TR+BL+BR` |
| `(1,1)` | Concave Cove Bay — Inner NE Water Notch | `GroundLayer` | `sand` · **Set 0 T0**: `TL+BL+BR` |
| `(2,1)` | Concave Cove Bay — Inner SW Water Notch | `GroundLayer` | `sand` · **Set 0 T0**: `TL+TR+BR` |
| `(3,1)` | Concave Cove Bay — Inner SE Water Notch | `GroundLayer` | `sand` · **Set 0 T0**: `TL+TR+BL` |
| `(4,1)` | Curved Coastline — East Edge (water east) | `GroundLayer` | `sand` · **Set 0 T0**: `TL+BL` |
| `(5,1)` | Curved Sand Cape — Outer SW Corner | `GroundLayer` | `sand` · **Set 0 T0**: `TR` only |
| `(6,1)` | Curved Coastline — South Edge (water south) | `GroundLayer` | `sand` · **Set 0 T0**: `TL+TR` |
| `(7,1)` | Curved Sand Cape — Outer SE Corner | `GroundLayer` | `sand` · **Set 0 T0**: `TL` only |
| `(0,2)` | Diagonal Sand Spit Bridge (NW–SE) | `GroundLayer` | `sand` · **Set 0 T0**: `TL+BR` |
| `(1,2)` | Diagonal Sand Spit Bridge (NE–SW) | `GroundLayer` | `sand` · **Set 0 T0**: `TR+BL` |
| `(2,2)`–`(7,2)` | **6 Beach Decals** (transparent): `(2,2)` Shells, `(3,2)` Washed Kelp, `(4,2)` Driftwood, `(5,2)` Tide Puddle, `(6,2)` Pebble Cluster, `(7,2)` Wind Drift | `GroundDecalShadowLayer` | Decorative only (no physics) |
| `(8,0)`–`(11,0)` | **Shallow Tidal Pool & Wet Sandbars**: `(8,0)` Shallow Water A, `(9,0)` Shallow Water B, `(10,0)` Wet Dark Sandbar A, `(11,0)` Wet Sandbar Pebbles | `GroundLayer` | `shallow_water` (walkable, 75% speed + ripples!) |
| `(8,1)`–`(11,1)` | Curved Wet-Sandbar / Tidal-Pool Edges: `(8,1)` N, `(9,1)` S, `(10,1)` W, `(11,1)` E | `GroundLayer` | `shallow_water` |
| `(8,2)`–`(11,2)` | Curved Wet-Sandbar / Tidal-Pool Corners: `(8,2)` NW, `(9,2)` NE, `(10,2)` SW, `(11,2)` SE | `GroundLayer` | `shallow_water` |
| `(0,3)`–`(5,3)` | **Low Coastal Cliff Top Cap**: `(0,3)` NW Rim, `(1,3)` N Rim, `(2,3)` NE Rim, `(3,3)` Plateau Center A, `(4,3)` Plateau Center B, `(5,3)` Solo Boulder Cap | `CliffWallCollisionLayer` | **Terrain Set 1 (`MATCH_CORNERS_AND_SIDES`) T0** · Solid `layer_1` |
| `(0,4)`–`(5,4)` | **Coastal Cliff Mid / Inner Corners**: `(0,4)` W Rim, `(1,4)` Center C, `(2,4)` E Rim, `(3,4)` Inner NW, `(4,4)` Inner NE, `(5,4)` Side Pillar Mid | `CliffWallCollisionLayer` | **Set 1 T0** · Solid `layer_1` |
| `(0,5)`–`(5,5)` | **Coastal Cliff South Vertical Face**: `(0,5)` SW Vertical Drop, `(1,5)` S Vertical Face A, `(2,5)` S Vertical Face B, `(3,5)` SE Vertical Drop, `(4,5)` Base Shadow Fringe, `(5,5)` Narrow Rock Notch | `CliffWallCollisionLayer` | **Set 1 T0** · Solid `layer_1` |
| `(6,3)`–`(11,3)` | **Deep Water Shelf**: `(6,3)` Deep Water A, `(7,3)` Deep Water B, `(8,3)` Shelf N, `(9,3)` Shelf S, `(10,3)` Shelf W, `(11,3)` Shelf E | `WaterBaseLayer` | `deep_water` · Impassable border (`layer_1`) |
| `(6,4)`–`(11,4)` | **Deep Water Corners & Reefs**: `(6,4)` NW, `(7,4)` NE, `(8,4)` SW, `(9,4)` SE, `(10,4)` Submerged Reef A, `(11,4)` Submerged Reef B | `WaterBaseLayer` | `deep_water` · Impassable border (`layer_1`) |
| `(6,5)`–`(11,5)` | **`6` EXPLICITLY UNUSED / TRANSPARENT CELLS** (`RGBA = 0,0,0,0`) | — | Reserved for Low/High Tide expansion |
| `(0,6)+(1,6)` | **Anim Pair 0**: Open Shallow Water Shimmer A (Frame 0 + Frame 1) | `WaterBaseLayer` | `shallow_water` · `anim_cols=2, frames=2, 2.0 FPS` |
| `(2,6)+(3,6)` | **Anim Pair 1**: Open Shallow Water Shimmer B | `WaterBaseLayer` | `shallow_water` · `anim_cols=2, frames=2, 2.0 FPS` |
| `(4,6)+(5,6)` | **Anim Pair 2**: Deep Water Swell | `WaterBaseLayer` | `deep_water` · `anim_cols=2, frames=2, 2.0 FPS` |
| `(6,6)+(7,6)` | **Anim Pair 3**: North Shore Sea-Foam Lap | `WaterBaseLayer` | `shallow_water` · `anim_cols=2, frames=2, 2.0 FPS` |
| `(8,6)+(9,6)` | **Anim Pair 4**: South Shore Sea-Foam Lap | `WaterBaseLayer` | `shallow_water` · `anim_cols=2, frames=2, 2.0 FPS` |
| `(10,6)+(11,6)` | **Anim Pair 5**: West Shore Sea-Foam Lap | `WaterBaseLayer` | `shallow_water` · `anim_cols=2, frames=2, 2.0 FPS` |
| `(0,7)+(1,7)` | **Anim Pair 6**: East Shore Sea-Foam Lap | `WaterBaseLayer` | `shallow_water` · `anim_cols=2, frames=2, 2.0 FPS` |
| `(2,7)+(3,7)` | **Anim Pair 7**: NW Corner Foam | `WaterBaseLayer` | `shallow_water` · `anim_cols=2, frames=2, 2.0 FPS` |
| `(4,7)+(5,7)` | **Anim Pair 8**: NE Corner Foam | `WaterBaseLayer` | `shallow_water` · `anim_cols=2, frames=2, 2.0 FPS` |
| `(6,7)+(7,7)` | **Anim Pair 9**: SW Corner Foam | `WaterBaseLayer` | `shallow_water` · `anim_cols=2, frames=2, 2.0 FPS` |
| `(8,7)+(9,7)` | **Anim Pair 10**: SE Corner Foam | `WaterBaseLayer` | `shallow_water` · `anim_cols=2, frames=2, 2.0 FPS` |
| `(10,7)+(11,7)` | **Anim Pair 11**: Tidal Pool Gentle Shimmer | `WaterBaseLayer` | `shallow_water` · `anim_cols=2, frames=2, 2.0 FPS` |

8. **Transparency**: Required (`RGBA` 32-bit PNG; transparent outside curved sand coastlines, cliffs, decals, and unused cells).
9. **Pivot / Origin**: `TileMapLayer` standard tile center `(8, 8)`.
10. **Variations**: `4` dry-sand base variants, `6` beach decals, `12` horizontal `2`-frame water/foam loops.
11. **Godot Integration**:
    - Path: `game/assets/world/tilesets/env_amber_coast_ground_tileset.png`
    - `TileSet` Config: `tile_size = Vector2i(16, 16)`, `TileSetAtlasSource` (`source_id = 0`, `texture_region_size = Vector2i(16, 16)`, `use_texture_padding = true`), `Custom Data Layer 0 = "surface_type" (TYPE_STRING)`, `Physics Layer 0 = layer 1 ("world_solid")`, `Terrain Set 0 = TERRAIN_MODE_MATCH_CORNERS`, `Terrain Set 1 = TERRAIN_MODE_MATCH_CORNERS_AND_SIDES`.
    - Import: `Compress = Lossless`, `Mipmaps = Off`, `Filter = Nearest`.
12. **Priority**: **Critical**.

---

### `AST-003` — `env_singing_canopy_ground_tileset.png` (**Priority: Critical**)

1. **Asset Name**: `env_singing_canopy_ground_tileset.png`
2. **Purpose**: Forest floor moss, ragged coastal-sand ecotone border, 4-bit root-lined dirt footpaths, mossy root-bank terraces, decals, and forest creek tiles for **Biome 02 — Singing Reedwood Canopy**.
3. **Visual Description**: Painterly olive-sage forest floor (`#6F8A68` base, `#97AF7E` dappled sun patches, `#3D5444` deep shade, `#47695E` cool edges), worn golden-ochre footpath (`#B89A6C` / `#8C7757` bordered by dark roots `#3D5444`), forest stream water (`#4B8B82`). Outer ecotone edges (`Rows 0–2, Cols 0–7`) MUST overlap transparently onto `AST-002`'s `#B89A6C` sand with organic grass blades & moss tufts!
4. **Dimensions**: **`16 × 16 px`** tile grid · **`192 × 96 px`** total atlas (`12` columns × `6` rows = `72` cells, `0 px` padding).
5. **Perspective & Style**: Oblique 3/4 Top-Down matching `AST-002` identically; low-noise painterly turf clusters.
6. **Animation & Exact Non-Overlapping `12 × 6` (`72`-Cell) Atlas Coordinate Map**:
   - Every `(col, row)` coordinate uniquely assigned (`18 + 16 + 6 + 18 + 6 + 8 animated = 72` cells; **zero overlaps, zero wasted cells**).

| Atlas Coords `(col, row)` | Tile Role / Exact Description | Godot Layer | `surface_type` / Physics / Terrain Bitmask |
| --- | --- | --- | --- |
| `(0,0)`–`(3,0)` | `4` Calm Olive-Sage Moss Base Variants (`A 0.50, B 0.25, C 0.15, D 0.10`) | `EcotoneOverlayLayer` / `GroundLayer` | `reedwood_floor` · **Terrain Set 0 (`MATCH_CORNERS`) T1**: `TL+TR+BL+BR` |
| `(4,0)`–`(7,0)` | Ragged Moss->Sand Outer Edges: `(4,0)` NW (`BR`), `(5,0)` N (`BL+BR`), `(6,0)` NE (`BL`), `(7,0)` W (`TR+BR`) | `EcotoneOverlayLayer` | `reedwood_floor` · **Set 0 T1** (transparent outside ragged grass border!) |
| `(0,1)`–`(3,1)` | Ragged Moss->Sand Concave Bays: `(0,1)` Inner NW (`TR+BL+BR`), `(1,1)` Inner NE (`TL+BL+BR`), `(2,1)` Inner SW (`TL+TR+BR`), `(3,1)` Inner SE (`TL+TR+BL`) | `EcotoneOverlayLayer` | `reedwood_floor` · **Set 0 T1** |
| `(4,1)`–`(7,1)` | Ragged Moss->Sand Outer Edges: `(4,1)` E (`TL+BL`), `(5,1)` SW (`TR`), `(6,1)` S (`TL+TR`), `(7,1)` SE (`TL`) | `EcotoneOverlayLayer` | `reedwood_floor` · **Set 0 T1** |
| `(0,2)`–`(1,2)` | Diagonal Moss Bridges: `(0,2)` NW–SE (`TL+BR`), `(1,2)` NE–SW (`TR+BL`) | `EcotoneOverlayLayer` | `reedwood_floor` · **Set 0 T1** |
| `(2,2)`–`(7,2)` | **`6` Forest Floor Decals** (transparent): `(2,2)` Hollow Fallen Reed, `(3,2)` Surface Root A, `(4,2)` Surface Root B, `(5,2)` Sun-Dapple Spot, `(6,2)` Clover/Lichen Tuft, `(7,2)` Mossy Stepping Stone | `GroundDecalShadowLayer` | Decorative only |
| `(8,0)`–`(11,3)` | **`16` Root-Lined Dirt Trail Tiles** (`4×4` complete 4-bit cardinal mask `N=1, E=2, S=4, W=8`!): Row `0`: `(8,0)` Isolated `0000`, `(9,0)` N end `0001`, `(10,0)` E end `0010`, `(11,0)` NE turn `0011`; Row `1`: `(8,1)` S end `0100`, `(9,1)` Vertical N+S `0101`, `(10,1)` SE turn `0110`, `(11,1)` T-East `0111`; Row `2`: `(8,2)` W end `1000`, `(9,2)` NW turn `1001`, `(10,2)` Horizontal E+W `1010`, `(11,2)` T-North `1011`; Row `3`: `(8,3)` SW turn `1100`, `(9,3)` T-West `1101`, `(10,3)` T-South `1110`, `(11,3)` Crossroads `1111` | `GroundDecalShadowLayer` / `EcotoneOverlayLayer` | `forest_trail` · **Terrain Set 2 (`TERRAIN_MODE_MATCH_SIDES`) T0** |
| `(0,3)`–`(5,5)` | **`18` Mossy Root-Bank Terrace Cliffs** (`6×3` mirroring `AST-002` cliff layout identically: Row `3` top mossy rims, Row `4` mid/inner corners, Row `5` vertical root-earth front faces!) | `CliffWallCollisionLayer` | **Terrain Set 1 (`MATCH_CORNERS_AND_SIDES`) T1** · Solid `layer_1` |
| `(6,3)`–`(7,5)` | **`6` Forest Creek Moss Banks**: `(6,3)` N Bank, `(7,3)` S Bank, `(6,4)` W Bank, `(7,4)` E Bank, `(6,5)` Outer Bank Corner, `(7,5)` Inner Bank Corner | `EcotoneOverlayLayer` | `shallow_water` |
| `(8,4)+(9,4)` | **Anim Pair 0**: Forest Stream Shimmer A (`#4B8B82`) | `WaterBaseLayer` | `shallow_water` · `anim_cols=2, frames=2, 2.0 FPS` |
| `(10,4)+(11,4)` | **Anim Pair 1**: Forest Stream Shimmer B | `WaterBaseLayer` | `shallow_water` · `anim_cols=2, frames=2, 2.0 FPS` |
| `(8,5)+(9,5)` | **Anim Pair 2**: Stream Pebble Riffle A | `WaterBaseLayer` | `shallow_water` · `anim_cols=2, frames=2, 2.0 FPS` |
| `(10,5)+(11,5)` | **Anim Pair 3**: Stream Leaf-Eddy Ripple B | `WaterBaseLayer` | `shallow_water` · `anim_cols=2, frames=2, 2.0 FPS` |

7. **Transparency & Pivot**: Transparent PNG outside ragged moss edges, trails, banks, and decals · Standard tile center `(8, 8)`.
8. **Variations**: `4` moss base variants, `16` full cardinal trail connections, `6` decals, `4` animated creek loops.
9. **Godot Integration**:
   - Path: `game/assets/world/tilesets/env_singing_canopy_ground_tileset.png`
   - `TileSet` Config: `TileSetAtlasSource` (`source_id = 1`, `texture_region_size = Vector2i(16, 16)`, `use_texture_padding = true`), sharing `Terrain Set 0` (T1 `"reedwood_floor"`), `Terrain Set 1` (T1 `"moss_terrace"`), and `Terrain Set 2` (`TERRAIN_MODE_MATCH_SIDES`, T0 `"forest_trail"`).
   - Import: `Compress = Lossless`, `Mipmaps = Off`, `Filter = Nearest`.
10. **Priority**: **Critical**.

---

### `AST-004` — `prop_singing_reedwood_tree_sheet.png` (**Priority: Critical**)

1. **Asset Name**: `prop_singing_reedwood_tree_sheet.png`
2. **Purpose**: Iconic towering `48×80` **Singing Reedwood** (*Arundo sonoris*) split cleanly into grounded Y-sorted trunk + overhead cutaway canopy crown.
3. **Visual Description**: Tall fluted hollow reed trunk (`#9B8F74` sunlit left ridge, `#5F6652` mid, `#313D36` shadow) with carved vertical dark wind-slits (`#1B2624`) and faint warm resonance accents (`#FFB838`), rooted into `#3D5444` moss; sweeping seafoam-sage feathery canopy crown (`#97AF7E` sunlit tips, `#6F8A68` mid, `#47695E`/`#2D423E` underside).
4. **Dimensions**: **`48 × 80 px`** per cell · **`96 × 160 px`** total sheet (`2` cols × `2` rows, `0 px` padding).
5. **Perspective & Style**: Oblique 3/4 Top-Down; crisp painterly foliage masses (no 1 px leaf static, no blurred shadows).
6. **Exact Cell Map & Mandatory `4 px` Trunk-Behind-Canopy Overlap Seam**:
   - **`(0, 0, 48, 80)`**: **Variant A — Lower Fluted Trunk & Roots** (roots sit `y = 66..76`; trunk rises solidly up to **`y = 32`** — including a `4 px` overlap collar `y = 32..36` tucked behind the canopy rim!).
   - **`(48, 0, 48, 80)`**: **Variant A — Overhead Canopy Crown** (canopy foliage spans `y = 2..36`, registered **pixel-for-pixel** on the exact same `48×80` canvas as Col `0` so compositing Col `1` directly over Col `0` creates one seamless tree AND fading Col `1` to `0.38` alpha never exposes a floating gap!).
   - **`(0, 80, 48, 80)`**: **Variant B — Leaning Twin-Stem Fluted Trunk & Roots** (same `(24, 72)` anchor and `y = 32..36` overlap collar).
   - **`(48, 80, 48, 80)`**: **Variant B — Matching Overhead Canopy Crown** (pixel-registered to Row `1`, Col `0`).
7. **Animation**: Static split-layer sheet (lightweight pixel wind-sway added in later shader pass).
8. **Transparency**: Required (`RGBA` 32-bit PNG, transparent background, zero baked floor shadow).
9. **Shared Origin, Offset Proof & Exact Godot Assembly Architecture**:
   - **Shared Origin Inside EVERY `48×80` Cell**: Trunk base center at **`(24, 72)`**.
   - **Geometric Center of `48×80` Cell**: `(24, 40)`.
   - **Exact Local `Sprite2D.offset` (with `centered = true`)**: **`Vector2(24 - 24, 40 - 72) = Vector2(0, -32)`** on BOTH `TrunkSprite` and `CanopySprite`!
   - **Exact Godot Scene Hierarchy (`game/world/props/singing_reedwood_tree.tscn`)**:
     ```text
     SingingReedwoodTree (StaticBody2D, child of YSortWorldLayer, collision_layer = 1 "world_solid")
     ├── ShadowSprite       (Sprite2D, AST-007 Large Shadow, pos=(0,0), z_index = -1)
     ├── FootCollider       (CollisionShape2D, RectangleShape2D(14, 8), pos=(0, -2))
     ├── TrunkSprite        (Sprite2D, region_rect=Rect2(0, variant*80, 48, 80), pos=(0,0), offset=(0,-32))
     ├── CanopySprite       (Sprite2D, region_rect=Rect2(48, variant*80, 48, 80), pos=(0,0), offset=(0,-32), z_index=20, z_as_relative=false)
     └── CanopyFadeArea     (Area2D, collision_layer=128 "canopy_occluder", collision_mask=2 "player")
         └── FadeShape      (CollisionShape2D, RectangleShape2D(44, 52), pos=(0, -44))
     ```
   - **Why This Assembly Never Drifts**: Keeping `CanopySprite` as a child of `SingingReedwoodTree` at identical `pos = (0, 0), offset = (0, -32)` with `z_index = 20, z_as_relative = false` guarantees **pixel-exact `(0, -32)` lock** with `TrunkSprite` while always drawing above Y-sorted actors — and smoothly fading `CanopySprite.modulate.a` between `1.0` and `0.38` whenever Mara enters `CanopyFadeArea`!
10. **Variations**: `2` silhouettes × `2` pixel-registered layers (`4` cells total).
11. **Godot Integration**: `game/assets/world/props/prop_singing_reedwood_tree_sheet.png` · Lossless / `Nearest` / `Mipmaps Off`.
12. **Priority**: **Critical**.

---

### `AST-005` — `prop_rimlands_flora_sheet.png` (**Priority: High**)

1. **Asset Name**: `prop_rimlands_flora_sheet.png`
2. **Purpose**: Interactive starter botanical props (`Amber Tide-Kelp`, `Mirror Glasswort`, `Sun-Drop Bulb`, `Cordage Frond`).
3. **Visual Description**: `Amber Tide-Kelp` (`#E49836`/`#FFC648`/`#8C5320` tall golden coastal ribbons), `Mirror Glasswort` (`#C9DCE3`/`#7E9AA2`/`#367E8A` crystalline succulent), `Sun-Drop Bulb` (`#FFB838`/`#FFE047` open honey-gold bloom / `#47695E` tight closed night bud), `Cordage Frond` (`#6F8A68`/`#97AF7E`/`#3D5444` woven fibrous fern).
4. **Dimensions**: **`16 × 32 px`** per cell · **`64 × 128 px`** total sheet (`4` cols × `4` rows = `16` cells, `0 px` padding; **zero overlap verified**).
5. **Perspective & Style**: Oblique 3/4 Top-Down; crisp unmistakable silhouettes even in grayscale.
6. **Exact Non-Overlapping `4 × 4` Cell Map (`64 × 128 px`, Transparent PNG)**:
   - Row `0` (`y = 0..31`): `(0,0)`..`(3,0)` (`Rect2(col*16, 0, 16, 32)`) -> **`Amber Tide-Kelp`** `4`-frame sway (`4 FPS`, loop; kelp rises `y_local = 3..30`).
   - Row `1` (`y = 32..63`): `(0,1)`, `(1,1)` -> **`Mirror Glasswort`** Static Variants A & B (`y_local = 14..30`); `(2,1)`, `(3,1)` -> **`UNUSED / TRANSPARENT`**.
   - Row `2` (`y = 64..95`): `(0,2)` -> **`Sun-Drop Bulb` Open (Day)**, `(1,2)` -> **`Sun-Drop Bulb` Closed (Night)** (`y_local = 14..30`); `(2,2)`, `(3,2)` -> **`UNUSED / TRANSPARENT`**.
   - Row `3` (`y = 96..127`): `(0,3)`, `(1,3)` -> **`Cordage Frond`** Static Variants A & B (`y_local = 12..30`); `(2,3)`, `(3,3)` -> **`UNUSED / TRANSPARENT`**.
7. **Transparency**: Required (`RGBA` 32-bit PNG, `10` active cells + `6` transparent unused cells).
8. **Pivot / Origin & Godot Offset Proof**: Ground base `(8, 30)` inside `16×32` cell (center `(8, 16)`) -> **`Sprite2D.offset = Vector2(0, -14)`** (`centered = true`).
9. **Variations**: `4` species (`10` frames/variants).
10. **Godot Integration**: `game/assets/world/flora/prop_rimlands_flora_sheet.png` -> `game/world/flora/flora_prop.tscn` (`YSortWorldLayer`, `Area2D` on `layer_5="interactable_flora"`); Lossless / `Nearest` / `Mipmaps Off`.
11. **Priority**: **High**.

---

### `AST-006` — `prop_drop_pod_landmark_sheet.png` (**Priority: High**)

1. **Asset Name**: `prop_drop_pod_landmark_sheet.png`
2. **Purpose**: **Hero Landmark #1 (*Drop-Pod Clearing*)** proving handcrafted focal composition and feathered ochre-sand collar blending into `AST-002`.
3. **Visual Description**: Weathered matte ivory *ICV Meridian* drop-pod (`#E8E4D8`/`#9DA4AB`) with burnt-orange rescue stripe (`#FF6B3D`), heat-scorched nose (`#202A36`), cracked teal glass (`#367E8A`/`#C9DCE3`), embedded in feathered ochre sand (`#B89A6C`/`#7C6549`), paired with `2` salvage crates, `1` compact warm-glowing field camp tent (`#FFB838`), and `1` scorched sand skid-furrow decal.
4. **Dimensions & Exact Partition Verification (`96 × 64 px` = `6144 px²`, Zero Overlap)**:

| Region Name | Exact `Rect2(x, y, w, h)` | Area (`px²`) | Pivot `(px, py)` Inside Region | Verified Godot `Sprite2D.offset` (`centered = true`) |
| --- | :---: | :---: | :---: | :---: |
| Crashed *ICV Meridian* Drop-Pod | `Rect2(0, 0, 64, 48)` | `3072` | `(32, 42)` | `Vector2(0, -18)` |
| Salvage Crate A (Intact) | `Rect2(64, 0, 16, 16)` | `256` | `(8, 14)` | `Vector2(0, -6)` |
| Salvage Crate B (Half-Buried Open) | `Rect2(80, 0, 16, 16)` | `256` | `(8, 14)` | `Vector2(0, -6)` |
| Deployed Field Camp Tent | `Rect2(64, 16, 32, 32)` | `1024` | `(16, 28)` | `Vector2(0, -12)` |
| Scorched Sand Skid-Furrow Decal | `Rect2(0, 48, 64, 16)` | `1024` | `(32, 8)` | `Vector2(0, 0)` |
| **`UNUSED / TRANSPARENT`** | `Rect2(64, 48, 32, 16)` | `512` | — | Must stay `RGBA = 0,0,0,0` |
| **Total Partition Check** | **`96 × 64 px`** | **`6144`** | **Zero Overlap** | **100% Verified** |

5. **Perspective & Style**: Oblique 3/4 Top-Down; warm top-left sunlight matching `AST-002`/`AST-004`, worn matte aerospace paint.
6. **Animation**: Static prop atlas.
7. **Transparency**: Required (`RGBA` 32-bit PNG).
8. **Variations**: `5` landmark props packed cleanly on `1` sheet.
9. **Godot Integration**: `game/assets/world/landmarks/prop_drop_pod_landmark_sheet.png` -> `game/world/landmarks/drop_pod_clearing.tscn` (`Sprite2D` regions + `StaticBody2D` colliders on `layer_1="world_solid"`); Lossless / `Nearest` / `Mipmaps Off`.
10. **Priority**: **High**.

---

### `AST-007` — `fx_shadows_ripples_lens_sheet.png` (**Priority: High**)

1. **Asset Name**: `fx_shadows_ripples_lens_sheet.png`
2. **Purpose**: Crisp pixel contact shadows, shallow-water footstep ripples, and Acoustic Field Lens harmonic rings — ultra-lightweight `Sprite2D` quads ideal for Intel HD Graphics 3000.
3. **Visual Description**: Uniform semi-transparent pixel-edged ellipses (`#12161C` at `35–45%` alpha, zero blur), `1 px` pale-foam water rings (`#C9DCE3`/`#6CF2B2`), and dashed `1 px` cyan-gold harmonic rings (`#4CE8E0`/`#FFB838`).
4. **Dimensions**: **`32 × 32 px`** per cell · **`128 × 96 px`** total sheet (`4` cols × `3` rows = `12` cells, `0 px` padding; **all drawings maintain `>= 1 px` margin inside `32×32`**).
5. **Perspective & Style**: Ground-plane `2:1` oblique ellipses; crisp `1 px` pixel edges.
6. **Exact Non-Overlapping `4 × 3` Cell Map (`128 × 96 px`, Transparent PNG)**:
   - Row `0` (`y = 0..31` — Static Contact Shadows):
     - `(0,0)` Small Actor Shadow: `12×6 px` oval centered at `(16, 16)` (`x = 10..21, y = 13..18`).
     - `(1,0)` Medium Flora/Crate Shadow: `18×9 px` oval centered at `(16, 16)` (`x = 7..24, y = 12..20`).
     - `(2,0)` Large Tree Trunk Shadow: `30×14 px` oval centered at `(16, 16)` (`x = 1..30, y = 9..22` — `1 px` margin).
     - `(3,0)` **`UNUSED / TRANSPARENT`** (`RGBA = 0,0,0,0`).
   - Row `1` (`y = 32..63` — Shallow-Water Wade Ripple, `8 FPS`, one-shot):
     - `(0,1)` `8×4 px` oval -> `(1,1)` `14×7 px` -> `(2,1)` `20×10 px` -> `(3,1)` `26×13 px` fading dashed oval.
   - Row `2` (`y = 64..95` — Acoustic Field Lens Wave Ring, `8 FPS`, one-shot):
     - `(0,2)` `10×5 px` ring -> `(1,2)` `16×8 px` -> `(2,2)` `24×12 px` -> `(3,2)` `30×15 px` (`1 px` margin) fading dashed harmonic ring.
7. **Transparency & Pivot**: Transparent PNG · Center **`(16, 16)`** -> **`Sprite2D.offset = Vector2.ZERO`** (`centered = true`).
8. **Variations**: `3` contact shadows + `2` four-frame VFX animations (`11` active cells + `1` unused).
9. **Godot Integration**: `game/assets/vfx/fx_shadows_ripples_lens_sheet.png` -> `Sprite2D` shadows + lightweight pooled `Node2D` VFX script (`game/world/vfx/ground_ring_vfx.gd`); Lossless / `Nearest` / `Mipmaps Off`.
10. **Priority**: **High**.

---

### `AST-008` — `sfx_rimlands_core_pack` (**Priority: Optional for M01, High for M02**)

1. **Asset Names (`10` clips)**:
   - `sfx_footstep_sand_01.ogg`, `sfx_footstep_sand_02.ogg`, `sfx_footstep_sand_03.ogg`
   - `sfx_footstep_water_01.ogg`, `sfx_footstep_water_02.ogg`, `sfx_footstep_water_03.ogg`
   - `sfx_footstep_moss_01.ogg`, `sfx_footstep_moss_02.ogg`, `sfx_footstep_moss_03.ogg`
   - `sfx_acoustic_lens_ping_01.ogg` *(16-bit `.wav` under 200 KB also accepted)*
2. **Purpose**: Surface-aware `TileData` footsteps & organic wooden-flute/glass Acoustic Field Lens chime routed to `Tier2_Action`.
3. **Sonic Description**: Dry intimate natural Foley — soft sand grit (`0.12–0.18s`), gentle ankle-water lap (`0.18–0.25s`), muffled moss/reed brush (`0.12–0.18s`), breathy warm wooden-flute/glass harmonic chime (`0.45–0.65s`).
4. **Format**: **Mono**, `44.1 kHz`, `16-bit` `.ogg` (Vorbis `q6`) or `.wav`, peak normalized `-3 dBFS`, `< 10 ms` leading trim, `Loop = Off`.
5. **Godot Integration**: `game/audio/sfx/` -> `AudioStreamPlayer` (`bus = "Tier2_Action"`) using `AudioStreamRandomizer` (`PLAYBACK_RANDOM_NO_REPEATS`, `±4%` pitch variance).
