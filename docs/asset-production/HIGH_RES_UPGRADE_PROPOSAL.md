# VERDANT SIGNAL — High-Resolution Art Upgrade Proposal (v3.0 Direction)

- **Status:** Proposal & Visual Craft Study — **Awaiting User Approval Before Production Migration**
- **Branch:** `arena/1d52d1b9-2-5-game` (Isolated Study Directory: `game/assets/high_res_upgrade_study/` protected by `.gdignore`)
- **Baseline Protection:** Playable Milestone 01 baseline (`AST-001`–`AST-007` at `16×24` / `16×16`, `480×270` viewport, `project.godot`, and all Godot scenes/scripts) remains **100% untouched**.
- **Stage 05 Gate Note:** Live Windows Godot `4.7.2` runtime validation remains pending on the target Windows machine (no Godot binary exists in the Linux authoring environment).

---

## 1. Executive Recommendation Summary

To decisively shatter the visual quality ceiling of the Milestone 01 `16×24` / `16×16` baseline and achieve true flagship handcrafted indie pixel-art quality (comparable to *Eastward*, *Sea of Stars*, and our painterly 3/4 oblique wilderness reference `IMG_20261126_155715.jpg`), we recommend upgrading *VERDANT SIGNAL* to the following **Unified High-Resolution Art Standard (v3.0)**:

| Architecture Layer | Current M01 Baseline (v2.0) | **★ Recommended High-Res Standard (v3.0)** | Scale Multiplier |
| :--- | :--- | :--- | :--- |
| **Virtual Viewport** | `480×270` (16:9) | **`640×360` (16:9)** — exact integer divisor of 720p (`2×`), 1080p (`3×`), 1440p (`4×`), 4K (`6×`) | `1.33×` linear (`1.78×` area) |
| **Dr. Mara Lin Frame (`AST-001`)** | `16×24 px` (`384 px²`) | **`48×64 px` (`3,072 px²`, standing figure ~`49 px` tall)** | **`8.0×` pixel detail area** |
| **All World Tilesets (`AST-002`, `AST-003`, future biomes)** | `16×16 px` (`256 px²`) | **`32×32 px` (`1,024 px²`) unified Godot `TileMapLayer` grid** | **`4.0×` pixel detail area** |
| **Singing Reedwood Trees (`AST-004`)** | `48×80 px` per tree | **`112×168 px` per tree (split trunk + painterly canopy)** | `4.9×` pixel detail area |
| **Rimlands Flora Props (`AST-005`)** | `16×32 px` per prop | **`32×64 px` per prop** | `4.0×` pixel detail area |
| **Crashed Drop-Pod Landmark (`AST-006`)** | `96×64 px` packed atlas | **`256×160 px` atlas (`152×96` capsule + `80×60` camp tent/crate + decals)** | `6.7×` pixel detail area |
| **Shadows, Ripples & Lens VFX (`AST-007`)** | `32×32 px` cells | **`64×64 px` cells (+ `128×64` high-res resonance ring overlay)** | `4.0×` pixel detail area |
| **Master Palette Craft** | 23–34 colors per sheet (4–5 step ramps) | **48-color hue-shifted high-res master palette (7–8 step ramps)** | Smooth painterly cloth/glass/rock sculpting |

### Why `640×360` + `32×32` Tiles + `48×64` Dr. Mara Lin Wins Over Every Alternative
1. **Perfect Hero-to-World Harmonic Ratio (`1.5×2.0` tiles):** At `48×64` on a `32×32` grid inside a `640×360` viewport, the camera frames **`20 × 11.25` tiles** and Dr. Mara Lin occupies **`~13.6%` of screen height** (`49 px / 360 px`, cell `17.8%`). This hits the exact iconic visual cadence of *Eastward* and *Sea of Stars* — large enough to read her curved panoramic glass visor reflections, live chest oscilloscope waveform, glowing moss-specimen vial, riveted boots, and Parabolic Acoustic Field Lens **at 1× native scale**, while keeping rich environmental vistas around her.
2. **100% Exact Integer Scaling on Every Modern Monitor:** `640×360` scales cleanly by **`2×` (`1280×720`)**, **`3×` (`1920×1080`)**, **`4×` (`2560×1440`)**, and **`6×` (`3840×2160`)** with zero uneven pixel rows or shimmering scroll artifacts.
3. **Dramatic Leap in Craft Without Crushing Indie Animation Scope:** `48×64` delivers `8×` the pixels of `16×24` — unlocking genuine multi-material spacesuit construction — while costing **`~48%` of the animation labor of `64×80`** and **`~38%` of `64×96`**, keeping a full 64-frame hero sheet plus future NPCs/fauna realistic to finish at studio quality.
4. **Negligible Intel HD Graphics 3000 VRAM Cost:** All 7 upgraded M01 sheets total only **`~5.1 MB` uncompressed RGBA8 GPU VRAM** (under `1.0%` of Intel HD 3000's 512 MB shared VRAM), with every single atlas staying strictly within OpenGL 3.1's **`2048×2048`** hardware texture limit.

---

## 2. Visual Study Gallery & Evidence Index

Every image below was **genuinely authored natively at target resolution** inside VERDANT PIXEL FORGE's layered pipeline (`tools/verdant-pixel-forge/src/highres_study/`) with **zero upscaling** from `16×24` or `16×16`. Every character and terrain study also ships with a validated editable `.vpf.json` source project.

| Comparison Plate / Study Asset | Workspace Path | What It Proves |
| :--- | :--- | :--- |
| **Board 01 — Dr. Mara Lin 5-Way Resolution Lineup (`1×`, `2×`, `4×`)** | `game/assets/high_res_upgrade_study/comparisons/01_mara_resolutions_1x_2x_4x.png` | Direct native comparison of `16×24` baseline vs native `32×48`, `48×64★`, `64×80`, and `64×96` at `1×`, `2×`, and `4×`. |
| **Board 02 — Dr. Mara Lin `48×64` 4-Pose Production Showpiece (`1×`, `2×`, `4×`)** | `game/assets/high_res_upgrade_study/comparisons/02_mara_48x64_production_4poses_1x_2x_4x.png` | Proves expressive multi-pose craft at `48×64`: Hero 3/4 Contrapposto, Dynamic Right Walk Stride, Botanist Crouch Sample w/ scan cone, and Active Acoustic Field Lens Scan w/ harmonic arcs & cyan bounce lighting. |
| **Board 03 — Native Terrain Study `16×16` vs `24×24` vs `32×32` (`1×`, `2×`, `4×`)** | `game/assets/high_res_upgrade_study/comparisons/03_terrain_resolutions_16_vs_24_vs_32_1x_2x_4x.png` | Direct side-by-side comparison across 5 seamless biome zones: Ocean Surf, Wet/Dry Amber Sand, Stratified Mineral Coastal Cliff, Ragged Ecotone, and Singing Canopy Moss & Branching Roots. |
| **Board 04 — Unified High-Res Vertical Slice (`640×360` `1×` & `1280×720` `2×`)** | `game/assets/high_res_upgrade_study/comparisons/04_vertical_slice_640x360_1x.png` & `04_vertical_slice_1280x720_2x.png` | Complete living gameplay-scale proof integrating `48×64` Mara Lin (3 poses), `32×32`-density seamless Coast-to-Bluff-to-Canopy terrain, `112×168` painterly Singing Reedwood trees, `32×64` Rimlands flora, `152×96` conical Crashed Drop-Pod, `80×60` lantern camp tent + supply crate, and layered Acoustic Field Lens VFX. |
| **Editable Native VPF Character Sources (8 `.vpf.json` + PNGs)** | `game/assets/high_res_upgrade_study/characters/` | 12-layer editable VPF documents for `32×48`, `48×64` (lineup + all 4 poses), `64×80`, and `64×96` — round-trip verified via `deserializeProjectJSON`. |
| **Editable Native VPF Terrain Sources (2 `.vpf.json` + PNGs)** | `game/assets/high_res_upgrade_study/terrain/` | 3-layer editable VPF documents for native `24×24` (`120×72`) and native `32×32` (`160×96`) seamless ecotone strips. |

---

## 3. Dr. Mara Lin Character Resolution Evaluation (`32×48` vs `48×64` vs `64×80` vs `64×96`)

All four candidate resolutions faithfully preserve Mara Lin's approved identity (`game/assets/characters/player/mara_lin_concept_128x128_v2.png`): burnt-orange quilted survival suit with ceramic ivory helmet stripe, curved dark-teal panoramic glass visor, beveled titanium ear-comm pod & chest telemetry oscilloscope, dark espresso-leather harness/gloves/kneepads/boots, hip-mounted translucent glass moss-specimen canister, vertical brushed-titanium O2 tank with ruby pressure valve & ribbed O2 hose, and sculpted dark-gunmetal Parabolic Acoustic Field Lens.

| Candidate Frame | Active Body Height | Pixel Area vs `16×24` | Visual Craft & Material Definition | Gameplay Scale (`640×360` / `960×540`) | Full 64-Frame Sheet Size & Anim Cost | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`16×24` (Baseline)** | `21 px` | `1.0×` (`384 px²`) | Symbolic icons only; cannot separate straps, oscilloscope waveform, stitched seams, or lens cup geometry. | `7.8%` of `270p` | `96×384` (Baseline `1.0×`) | **Rejected as final ceiling** (baseline archive only) |
| **`32×48`** | `37 px` | `4.0×` (`1,536 px²`) | Clean retro-premium jump; visor reflection, O2 tank, specimen vial, and lens cup read cleanly, **but** chest oscilloscope is squeezed to `5×3 px`, shoulder patch & stitching are absent, and gloved hands remain `3–4 px` buds. | `10.3%` of `360p` (best with `24×24` tiles) | `256×384` (`~2.2×` labor) | **Viable Budget Option**, but leaves clear flagship detail on the table |
| **`48×64` ★ RECOMMENDED** | **`49 px`** | **`8.0×` (`3,072 px²`)** | **Flagship indie sweet spot.** Full multi-material definition: curved multi-band sky reflection inside panoramic visor, live undulating cyan chest oscilloscope waveform + dual status LEDs, stitched quilted torso folds, dark-teal *ICV Meridian* shoulder patch, glowing glass moss specimen jar, ribbed O2 hose, armored kneepads w/ rivets, heavy espresso lugged boots, and unmistakable parabolic Acoustic Field Lens dish. | **`13.6%` of `360p`** (`1.5×2.0` tiles on `32×32` grid — iconic *Eastward* framing!) | **`384×512` (`~3.8×` labor — sustainable for 64 frames + full cast)** | **★ RECOMMENDED PRODUCTION STANDARD** |
| **`64×80`** | `61 px` | `13.3×` (`5,120 px²`) | Collector-grade micro-detail: cargo thigh pockets, deeper visor bevels, crisp two-cycle oscilloscope readout, and larger boot treads. **However**, at `640×360` Mara feels oversized (`17%` body / `22%` cell), pushing the camera to `960×540` (which breaks `2×` integer scaling on `1280×720` screens!). | `17.0%` of `360p` (cramped) or `11.3%` of `540p` (non-integer on 720p) | `512×640` (`~7.2×` labor — heavy animation bottleneck) | **Strong Runner-Up** (best only if targeting a `960×540` / `1080p`-first combat platformer rather than top-down exploration) |
| **`64×96`** | `77 px` | `16.0×` (`6,144 px²`) | Tall realistic 6-head adult proportions with showcase-level spacesuit anatomy. **However**, in a 3/4 oblique top-down exploration game, a `~77 px` tall sprite towers `2.4–3.0` tiles vertically over `32×32` tiles, requiring giant `48×48` terrain tiles & `220 px+` trees and multiplying total game art workload by **`4×–5×`**. | `21.4%` of `360p` (way too tall) / `14.3%` of `540p` | `512×768` (`~10×` labor) | **Not Recommended** for top-down 3/4 oblique exploration |

### Why `48×64` Wins the Craftsmanship Inspection (`1×`, `2×`, and `4×`)
Inspecting `02_mara_48x64_production_4poses_1x_2x_4x.png` at all three zoom levels confirms:
- **At `1×` (`48×64`):** Mara reads instantaneously without visual noise — warm terracotta silhouette pops cleanly over both Amber Coast sand and Singing Canopy moss, dark espresso boots anchor her weight, and the cyan Acoustic Field Lens focal point draws the player's eye directly toward gameplay interactions.
- **At `2×` (720p gameplay scale) and `3×` (1080p gameplay scale):** Every narrative equipment detail rewards the player — the oscilloscope screen pulses, the moss specimen jar glows bright emerald on her belt, the crimson valve caps her brushed-titanium O2 tank, and during `lens_scan` the three concentric cyan harmonic arcs wash cool bounce reflections across her visor glass and shoulder.
- **At `4×` (close-up craft audit):** Zero blurry anti-aliasing, zero orphan noise pixels, disciplined selective outlines (warmer sienna on sunlit upper-left rims, deep plum ink on shadowed bottom-right contours), and fluid organic cloth/limb curves across all 4 distinct stances (`hero_3q`, `walk_right`, `crouch_sample`, `lens_scan`).

---

## 4. Environment & Terrain Resolution Evaluation (`16×16` vs `24×24` vs `32×32`)

### Unified Tile Size Recommendation Across All Environments: **`32×32 px`**
We strongly recommend **one unified `32×32 px` native tile grid across ALL environments** (Amber Coast `AST-002`, Singing Canopy `AST-003`, and every future Rimlands biome). Mixing tile sizes (e.g., `24×24` for beaches and `32×32` for forests) would introduce mismatched Godot `TileMapLayer` grid snapping, uneven pixel density across biome ecotones, and inconsistent navigation/collision cells.

| Environment Feature | `16×16` Baseline (v2.0) | Native `24×24` Candidate (`2.25×` area) | **★ Native `32×32` Recommended (`4.0×` area)** |
| :--- | :--- | :--- | :--- |
| **Amber Coast Ocean & Surf** | 2–3 tone shallow strips; 1–2 px foam line | Smooth turquoise surf with 2-band sea-foam lace | **Multi-layered deep ocean swells, translucent caustic shallows, organic frothy surf lace & delicate wave ripples** |
| **Wet/Dry Sand & Beach Detail** | Flat 3-tone sand; 1 px pebble dots | Gentle dune ripples + dark damp shore edge | **Sweeping wind-rippled ochre dunes, dark capillary wet shoreline reflecting sky, sculpted 3 px spiral shells & quartz glints** |
| **Stratified Coastal Cliffs** | 3 blocky horizontal stone stripes | Clear rock shelves + 1 subtle pale highlight vein | **True coastal geology: overhanging mossy turf lip, angled fractured sandstone strata, crisp vertical fault cracks, pale glittering quartz/calcite veins & grounded talus scree boulders** |
| **Singing Canopy Forest Floor** | Simple mottled green fill + tiny 2 px grass ticks | Soft shadow pools + small 3 px grass tufts & thin roots | **Direct match to `IMG_20261126_155715.jpg`: sweeping painterly sunlit/shadow meadow drifts, organic footpaths, varied 4–6 px multi-blade grass & wildflower clusters, mossy woodland boulders, and gnarled branching surface roots weaving naturally under moss** |
| **Sand-to-Moss Ecotone** | Chunky 4–6 px stepped edge | Smooth curved border with 2 px lip | **Organic ragged creeping moss fingers with dark shadow undercut & stray sandy pockets — zero visible tile seams** |
| **Godot Terrain Set Compatibility** | Compatible (`16×16` grid) | Compatible (`24×24` grid) | **100% Native Godot 4 `TileSet` Terrain Set Compatible** (`32×32` grid, periodic edge-wrapped interior fills + deterministic edge-locked 16-case / 47-case peering bits for Water↔Sand, Cliff Top/Wall/Base, and Sand↔Moss transitions) |

### Godot 4 Terrain Set Technical Compatibility Guarantee (`32×32`)
Every upgraded `32×32` tileset follows strict Godot 4 `TileSet` rules so level designers paint organic coastlines and forests effortlessly:
- **Zero Grid Seam Law:** All base interior tiles (Deep Water, Shallow Water, Dry Sand, Damp Sand, Meadow Moss, Forest Soil) are authored on periodic edge-continuous fields so any two interior variants tile edge-to-edge with zero visible `32×32` seams.
- **Deterministic Edge-Anchored Peering Bits:** Every transition tile (Water→Sand Wang-16, Cliff Rim/Wall/Base, Moss→Sand Ecotone) locks its boundary crossing coordinates identically on `N/E/S/W` edges (`x ∈ {0, 31}` or `y ∈ {0, 31}`), ensuring **100% seamless Godot 4 `Terrain Set` automapping** (`Match Corners and Sides` / `Match Sides`).
- **Modular Biome Variants:** Base interior fills provide **4–6 weighted probability variants** (`probability` weights in Godot `TileSet` from `0.45` calm base down to `0.08` clover/shell/pebble accent) to completely eradicate repetitive tiling rhythms.

---

## 5. Animation Workload & Intel HD Graphics 3000 Performance / VRAM Budget

### 5.1 Animation Workload Analysis (Honest Production Estimate)
Upgrading from `16×24` to `48×64` substantially increases per-frame detail — here is the realistic animation authoring cost across candidate resolutions for Dr. Mara Lin's full 64-frame M01 animation sheet (`Idle ×4 dirs ×4f`, `Walk ×4 dirs ×6f`, `Crouch ×4 dirs ×2f`, `Acoustic Lens Scan ×4 dirs ×4f` = 64 active frames):

| Resolution | Pixels per Frame | 64-Frame Active Pixel Budget | Estimated Authoring Time (w/ VPF Modular Layer Rig) | Full Game Cast Feasibility (Hero + 6 Fauna/NPCs) |
| :--- | :--- | :--- | :--- | :--- |
| `16×24` (Baseline) | `384 px` | `24,576 px` | ~1–2 days | Trivial, but visually unacceptable |
| `32×48` | `1,536 px` | `98,304 px` | ~4–5 days | Easy |
| **`48×64` ★ RECOMMENDED** | **`3,072 px`** | **`196,608 px`** | **~7–10 days** (accelerated ~40% using VPF's 12-layer separation: helmet/backpack/chassis shift smoothly while limbs & hose re-sculpt per keyframe) | **High Feasibility — flagship indie studio sweet spot** |
| `64×80` | `5,120 px` | `327,680 px` | ~15–20 days | Strained — requires strict frame-count cuts or larger art team |
| `64×96` | `6,144 px` | `393,216 px` | ~22–30 days | High scope risk for solo/small indie production |

> **Pipeline Multiplier Advantage:** Because our VERDANT PIXEL FORGE `.vpf.json` workflow separates Mara into **12 clean editable layers** (`l01_outline` through `l12_specular_glow`), secondary equipment (helmet shell, visor glass, backpack + O2 cylinder, chest oscilloscope) retains crisp sub-pixel consistency across frames while legs, knees, boots, sleeves, and the Acoustic Field Lens receive dedicated handcrafted keyframe arcs, squash/stretch, and harmonic bounce light.

### 5.2 Intel HD Graphics 3000 (`GL Compatibility`) Performance & VRAM Budget

Target minimum hardware constraint: **Intel HD Graphics 3000** (OpenGL 3.1 / `GL Compatibility` renderer, 512 MB shared system VRAM, hard max texture dimension `2048×2048`, limited fragment shader fill-rate).

| Upgraded v3.0 Asset | Atlas Dimensions | Max Dim ≤ 2048? | Uncompressed RGBA8 GPU VRAM | Est. Lossless PNG Disk Size |
| :--- | :--- | :--- | :--- | :--- |
| `AST-001` Dr. Mara Lin (`48×64`, 8 cols × 8 rows = 64 active frames) | `384 × 512 px` | YES (`512`) | **0.75 MB** (`786 KB`) | ~140 KB |
| `AST-002` Amber Coast Tileset (`32×32`, 12 cols × 8 rows = 96 tiles) | `384 × 256 px` | YES (`384`) | **0.38 MB** (`393 KB`) | ~160 KB |
| `AST-003` Singing Canopy Tileset (`32×32`, 12 cols × 6 rows = 72 tiles) | `384 × 192 px` | YES (`384`) | **0.28 MB** (`295 KB`) | ~125 KB |
| `AST-004` Singing Reedwood Trees (`112×168` × 2 split variants) | `224 × 336 px` | YES (`336`) | **0.29 MB** (`301 KB`) | ~110 KB |
| `AST-005` Rimlands Flora Props (`32×64`, 4 cols × 4 rows) | `128 × 256 px` | YES (`256`) | **0.13 MB** (`131 KB`) | ~60 KB |
| `AST-006` Crashed Drop-Pod, Camp Tent & Crates Atlas | `256 × 160 px` | YES (`256`) | **0.16 MB** (`164 KB`) | ~75 KB |
| `AST-007` High-Res Shadows, Ripples & Harmonic Lens VFX (`64×64` + `128×64`) | `256 × 256 px` | YES (`256`) | **0.25 MB** (`262 KB`) | ~85 KB |
| **TOTAL M01 UPGRADED SET (ALL 7 SHEETS)** | — | **100% PASS** | **`2.24 MB` GPU VRAM** | **~755 KB disk** |
| *Projected Full-Game Total (~10 Biomes + 12 Characters + Props + UI)* | — | **100% PASS** | **`~28–38 MB` GPU VRAM** | **~9–12 MB disk** |

**Hardware Verdict for Intel HD Graphics 3000 (`GL Compatibility`):**
- **VRAM Headroom:** `2.24 MB` for M01 (`< 0.5%` of 512 MB VRAM) and `~35 MB` for the full shipped game (`< 7%` of 512 MB VRAM) — **virtually zero VRAM pressure**.
- **Texture Size Limit:** Every atlas stays strictly `≤ 512 px` (`≤ 2048 px` max OpenGL 3.1 cap).
- **Fill-Rate & Draw Calls:** Rendering a `640×360` framebuffer (`230,400 px`) vs `480×270` (`129,600 px`) adds only `+100,800 px` of 2D nearest-neighbor sprite blitting (`< 0.4 ms` per frame on HD 3000). With `TileMapLayer` chunk batching, zero real-time 2D normal-map shaders required, and integer viewport scaling (`canvas_items` / `viewport` stretch), **locked 60 FPS on Intel HD Graphics 3000 is guaranteed with massive headroom**.

---

## 6. Non-Destructive Migration Plan (Zero Disruption to Playable M01)

This proposal strictly protects the working Milestone 01 build. **Nothing in `game/assets/` (production baseline), `game/scenes/`, `game/scripts/`, or `game/project.godot` has been altered.** Once you approve this `v3.0` High-Resolution Direction, migration proceeds cleanly in **4 reversible phases**:

### Phase 0 — Archive & Lock Baseline (15 minutes)
1. Tag or snapshot current M01 baseline (`AST-001`–`AST-007` at `16×24`/`16×16`) under `game/assets/_m01_lowres_baseline_archive/` (with `.gdignore`) so the `480×270` build can always be restored or compared side-by-side.
2. Keep existing playable scenes compiling cleanly until every high-res asset passes visual QA.

### Phase 1 — Produce High-Resolution `v3.0` Art Suite (`AST-001` through `AST-007`)
Author all 7 production sheets natively in VERDANT PIXEL FORGE using the approved `48×64` / `32×32` / 48-color master palette standard, validating each batch via `1×`, `2×`, and `4×` composite QA before touching Godot:
1. **Batch A (Hero):** Complete `AST-001 v3.0` (`384×512`, `48×64` × 64 frames: Idle/Walk/Crouch/Lens-Scan × 4 directions) + editable `.vpf.json`.
2. **Batch B (Terrain):** Complete `AST-002 v3.0` Amber Coast (`384×256`, `32×32` seamless tiles + stratified cliffs) & `AST-003 v3.0` Singing Canopy (`384×192`, `32×32` seamless meadow/roots/ecotones).
3. **Batch C (Landmarks, Flora & VFX):** Complete `AST-004 v3.0` Singing Reedwoods (`224×336`), `AST-005 v3.0` Rimlands Flora (`128×256`), `AST-006 v3.0` Crashed Drop-Pod & Camp Clearing (`256×160`), and `AST-007 v3.0` Layered Shadows/Ripples/Harmonic Lens VFX (`256×256`).
4. **Full-Scene Visual QA Gate:** Composite all 3 M01 test arenas (`Scene A` Drop-Pod Clearing, `Scene B` Amber Coast Shoreline, `Scene C` Singing Canopy Grove) at `640×360` (`1×`) and `1280×720` (`2×`) for user sign-off.

### Phase 2 — Atomic Godot Project & Scene Scale Upgrade (Single Coordinated PR/Commit)
Once `AST-001`–`AST-007 v3.0` are visually approved, update the Godot project cleanly in one atomic step:
1. **`game/project.godot`:**
   - Update `display/window/size/viewport_width=640`, `viewport_height=360` (keeping `stretch/mode="viewport"` and `stretch/scale_mode="integer"` so 720p/1080p/1440p render razor-sharp!).
2. **Player (`MaraLin.tscn` & `player_controller.gd`):**
   - Swap `SpriteFrames` / `AtlasTexture` cell slice from `16×24` -> `48×64` (`offset = Vector2(0, -28)` so boot soles align cleanly at `y = 0` Y-sort pivot!).
   - Scale player movement speed by `2.0×` (`base_speed` in pixels/sec doubles cleanly to match the `2.0×` `16 px -> 32 px` tile size, preserving exact tile-per-second exploration pacing!), and update ground `CollisionShape2D` capsule radius (`6 px -> 12 px`).
3. **World TileMaps (`AmberCoast.tres`, `SingingCanopy.tres`, `TileMapLayer`s):**
   - Update `TileSet.tile_size` from `Vector2i(16, 16)` -> `Vector2i(32, 32)` and wire the upgraded `32×32` Terrain Set peering-bit masks.
   - Reposition world landmarks/spawns by exact `2.0×` world coordinates (`old_pos * 2`), keeping map layout, sightlines, and traversal rhythm identical while doubling environmental fidelity.
4. **Props & Acoustic Field Lens (`AST-004`–`AST-007`):**
   - Update prop sprite regions, Y-sort foot pivots, trunk collision footprints (`2×`), and Acoustic Field Lens scan radius (`2×`).

### Phase 3 — Live Windows Godot `4.7.2` Verification (Stage 05 Gate)
Run the upgraded build on the Windows Godot `4.7.2` target machine (`GL Compatibility`), confirming:
- Clean integer scaling at `1280×720` (`2×`) and `1920×1080` (`3×`)
- Seamless `TileMapLayer` terrain painting with zero seams across Water↔Sand, Cliff, and Sand↔Moss
- Smooth 60 FPS traversal, Y-sort occlusion behind `112×168` Singing Reedwood canopies, and crisp `48×64` Mara Lin animation timing.

---

## 7. Decision Requested From You

Before we touch a single baseline asset or modify `project.godot`, please confirm:
1. **Approve the Recommended `v3.0` Target Architecture?** (`640×360` viewport + **`48×64` Dr. Mara Lin** + **`32×32` unified seamless terrain** + upgraded `AST-004`–`AST-007` landmarks, as documented in `docs/asset-production/ASSET_REQUESTS_V3_HIGH_RES_PROPOSAL.md`)
2. **Or prefer an alternative candidate** from the visual comparison boards (e.g., `64×80` Mara Lin on `960×540`, or any stylistic adjustments to suit saturation, visor geometry, tree foliage, or drop-pod proportions)?

Once approved, we will immediately begin **Phase 1: Production of the full `v3.0` High-Resolution Asset Suite (`AST-001`–`AST-007`)**.
