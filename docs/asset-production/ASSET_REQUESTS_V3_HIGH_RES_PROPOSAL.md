# VERDANT SIGNAL — Asset Production Requests v3.0 (High-Resolution Proposal)

- **Document Version:** `3.0-PROPOSAL` (Supersedes `v2.0` `ASSET_REQUESTS.md` **only after user approval of `HIGH_RES_UPGRADE_PROPOSAL.md`**)
- **Target Virtual Viewport:** `640×360` (16:9, exact integer scaling at `2×` 720p, `3×` 1080p, `4×` 1440p, `6×` 4K)
- **Unified World Tile Grid:** `32×32 px` across ALL biomes (`TileMapLayer` + Godot 4 `TileSet` Terrain Sets)
- **Target Renderer & Hardware:** Godot `4.7.2` (`GL Compatibility`, OpenGL 3.1 / Intel HD Graphics 3000 safe; all sheets `≤ 512×512`, nearest-neighbor filtering, zero mipmaps, strict binary alpha except explicitly layered VFX sheets)
- **Palette Authority:** Expanded **48-color Hue-Shifted Painterly High-Res Master Palette** (`VERDANT_HIGHRES_PALETTE_48` in `tools/verdant-pixel-forge/src/highres_study/highResPaletteAndSculpt.ts`), locked upper-left (~40°) sunlight key, selective outlines (warm sienna/slate on sunlit rims, deep plum/indigo ink on shadowed contours), zero anti-aliasing blur.

---

## Master High-Resolution Asset Manifest (`AST-001` through `AST-007` v3.0)

| Asset ID | Proposed Path (Post-Approval) | Sheet Size | Cell / Unit Size | Active Regions | GPU VRAM (RGBA8) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`AST-001` v3.0** | `game/assets/characters/player/char_mara_lin_sheet.png` | `384 × 512` | `48 × 64` | 64 active frames (8×8 grid, zero wasted rows!) | `0.75 MB` | Proposed (Study Complete) |
| **`AST-002` v3.0** | `game/assets/environments/amber_coast/env_amber_coast_ground_tileset.png` | `384 × 256` | `32 × 32` | 90 active tiles + 6 reserved transparent cells (12×8) | `0.38 MB` | Proposed (Study Complete) |
| **`AST-003` v3.0** | `game/assets/environments/singing_canopy/env_singing_canopy_ground_tileset.png` | `384 × 192` | `32 × 32` | 72 active tiles (12×6, 100% utilized) | `0.28 MB` | Proposed (Study Complete) |
| **`AST-004` v3.0** | `game/assets/props/trees/prop_singing_reedwood_tree_sheet.png` | `224 × 336` | `112 × 168` | 2 distinct tree silhouettes × split Base/Trunk + Canopy (4 regions) | `0.29 MB` | Proposed (Study Complete) |
| **`AST-005` v3.0** | `game/assets/props/flora/prop_rimlands_flora_sheet.png` | `128 × 256` | `32 × 64` | 12 active flora props/states + 4 reserved cells (4×4) | `0.13 MB` | Proposed (Study Complete) |
| **`AST-006` v3.0** | `game/assets/props/landmarks/prop_drop_pod_landmark_sheet.png` | `256 × 160` | Packed Atlas | 6 regions (152×96 Drop-Pod, 80×60 Tent+Crate, Furrow Decals, Beacon) | `0.16 MB` | Proposed (Study Complete) |
| **`AST-007` v3.0** | `game/assets/vfx/fx_shadows_ripples_lens_sheet.png` | `256 × 256` | `64 × 64` & `128 × 64` | Contact Shadows (3), Water Ripples (4f), Acoustic Lens Waves (4f) + Large Field Overlay | `0.25 MB` | Proposed (Study Complete) |
| **TOTAL M01 v3.0** | — | Max `512 px` | `32×32` / `48×64` | — | **`2.24 MB`** | **Awaiting Approval** |

---

## Detailed Specifications (`AST-001` through `AST-007` v3.0)

### `AST-001` v3.0 — Dr. Mara Lin Player Character Master Sheet (`48×64` Native)
- **Identity Lock:** Preserves 100% of `mara_lin_concept_128x128_v2.png` — sculpted burnt-orange aerospace helmet with ivory crown stripe & beveled titanium ear-comm pod; curved dark-teal panoramic glass visor with multi-band sky reflection; quilted terracotta exosuit with stitched fold lines & dark-teal *ICV Meridian* shoulder patch; beveled brushed-titanium chest telemetry oscilloscope with live cyan waveform & green/ruby status LEDs; dark espresso-leather harness, belt, armored kneepads w/ rivets, gloves, and heavy lugged boots; glowing emerald glass moss-specimen canister on hip; tucked slate-steel life-support backpack with vertical brushed-titanium O2 tank, ruby pressure valve, telemetry antenna & curved ribbed O2 hose; and dark-gunmetal Parabolic Acoustic Field Lens with glowing cyan emitter focal point.
- **Dimensions & Grid:** **`384 × 512 px`** (`8 columns × 8 rows` of **`48 × 64 px`** cells = **64 active frames**, zero empty rows!).
  - **Row 0 (Cols 0–3):** `idle_down` (4f, 220 ms/f — gentle breathing torso swell, antenna sway, oscilloscope waveform trace pulse)
  - **Row 0 (Cols 4–7):** `idle_up` (4f, 220 ms/f — full back-pack & vertical O2 cylinder profile + breathing shoulder rise)
  - **Row 1 (Cols 0–3):** `idle_right` (4f, 220 ms/f — side profile showing helmet curve, O2 hose loop, specimen jar)
  - **Row 1 (Cols 4–7):** `idle_left` (4f, 220 ms/f — uniquely lit left-facing profile preserving locked upper-left sunlight; never lazy flip!)
  - **Rows 2–3 (`walk_down` 6f + `crouch_down` 2f; `walk_up` 6f + `crouch_up` 2f):** Full 6-frame athletic stride (contact, down, pass, high-lift, opposite contact, pass) with boot heel-roll, knee flexion, backpack counter-bob, and opposing arm swing; plus 2-frame deep botanist kneel + micro-probe sampling!
  - **Rows 4–5 (`walk_right` 6f + `crouch_right` 2f; `walk_left` 6f + `crouch_left` 2f):** Dedicated left/right strides preserving upper-left lighting, O2 hose bounce, and hip specimen vial motion.
  - **Rows 6–7 (`lens_scan_down/up/right/left` × 4f each = 16f):** Braced wide athletic stance, off-hand calibrating chest telemetry dial, primary hand raising the Parabolic Acoustic Field Lens dish, emitting pulsing cyan-mint harmonic soundwave arcs with dynamic cyan rim bounce lighting across visor glass, collar, and shoulder!
- **Pivot & Collision:** Ground Y-sort anchor at **`(23, 60)`** (boot soles planted at `y = 60` with `4 px` bottom safety margin). Godot `CollisionShape2D` ground ellipse: `radius = 12 px`, `height = 10 px` centered at `(0, 0)`.
- **VPF Source Requirement:** 12-layer editable `.vpf.json` (`l01_outline` through `l12_specular_glow`) passing `deserializeProjectJSON` round-trip validation.

---

### `AST-002` v3.0 — Amber Coast Ground & Stratified Cliff Tileset (`32×32` Native)
- **Dimensions & Grid:** **`384 × 256 px`** (`12 cols × 8 rows` of **`32 × 32 px`** native tiles = 90 active + 6 reserved transparent).
- **Art Craft Upgrades over `16×16`:**
  - **Deep & Shallow Coastal Ocean (Rows 6–7):** Smooth multi-band horizontal pelagic swells (`W0`–`W2`), translucent turquoise reefs (`W3`–`W4`) with golden-teal caustic light webs, and animated 3-frame shoreline surf surge — zero polka-dot repetition.
  - **Amber Coast Sand & Wet Shore Transitions (Rows 0–2):** 6 weighted dry wind-rippled ochre dune interior tiles (`D2`–`D5` with subtle quartz glints & micro-shells), full **16-case Godot Terrain Set Wang shoreline** with dark capillary wet sand (`D0`/`D1`), translucent water overlap, and organic broken sea-foam lace (`W5`/`W6`), plus 6 transparent beach decals (tide shells, driftwood knots, pebble clusters, kelp wash).
  - **Stratified Geological Coastal Cliffs (Rows 3–5):** Full **3-tier Godot Terrain Set cliff kit** (Overhanging Mossy/Sandy Cliff Rim, Angled Fractured Sandstone/Basalt Wall Strata with vertical geological fault fissures & pale glittering quartz/calcite mineral veins `K5`/`K6`, and Wet Salt-Spray Base + Talus Scree Boulders).
- **Godot 4 `TileSet` Integration:** `tile_size = Vector2i(32, 32)`, 3 Terrain Sets (`Terrain 0: Amber Sand`, `Terrain 1: Shallow Water`, `Terrain 2: Coastal Cliff`), Physics Layer 0 polygons auto-baked on deep water & cliff wall cells.

---

### `AST-003` v3.0 — Singing Canopy Forest Floor, Roots & Ecotone Tileset (`32×32` Native)
- **Dimensions & Grid:** **`384 × 192 px`** (`12 cols × 6 rows` of **`32 × 32 px`** native tiles = 72/72 active).
- **Art Craft Upgrades over `16×16` (Honoring `IMG_20261126_155715.jpg`):**
  - **Velvety Sun-Dappled Meadow & Moss Interiors (Row 0, 6 weighted tiles + Row 1 dappled shade variants):** Sweeping broad painterly sunlight/shadow moss washes (`G1`–`G6`) with zero repeating grid spots; handcrafted varied 4–6 px curling multi-blade grass clusters, pale woodland clover, and dew-lit golden tips (`G7`/`G8`).
  - **Winding Woodland Trail & Exposed Gnarled Root Network (Rows 2–3):** Full **16-case Godot Terrain Set** for organic packed-humus woodland footpaths + modular curved/branching sculpted surface roots (`T0`–`T6`) partially tucked beneath creeping moss & grass blades so they sit organically IN the forest floor.
  - **Ragged Organic Sand-to-Moss Biome Ecotone (Rows 4–5):** Full **16-case Godot Terrain Set** bridging `AST-002` Amber Sand seamlessly into `AST-003` Singing Canopy Moss with ragged creeping turf fingers, dark shadow undercut (`D0`/`G1`), and stray windblown sand pockets — completely eliminating straight biome seams.

---

### `AST-004` v3.0 — Singing Reedwood Trees (`112×168` Native Split Trunk / Canopy)
- **Dimensions & Grid:** **`224 × 336 px`** — 2 distinct organic tree silhouettes (**Matriarch Broad-Crown** & **Wind-Swept Grove Reedwood**), each cleanly split into:
  - **Bottom Half (`112 × 168` Lower Layer — `y_sort_enabled`):** Sculpted spreading buttress roots gripping mossy soil (`T0`–`T6`), velvety moss knuckles (`G2`–`G6`), and bundled organ-pipe hollow reed stems carved with beveled vertical acoustic wind-slits.
  - **Top Half (`112 × 168` Overhead Canopy Layer — renders above Mara when she walks behind the trunk!):** Seamless hand-painted painterly scalloped leaf crown (`G0`–`G8`) with **zero harsh black circles between interior foliage lobes**, deep spruce under-boughs, and hundreds of crisp sunlit golden-sage leaf clusters.
- **Pivot & Collision:** Root center Y-sort pivot at **`(56, 152)`**; trunk collision capsule `28 × 14 px` centered at root knuckle so player walks freely around buttress roots and smoothly underneath the upper canopy boughs.

---

### `AST-005` v3.0 — Rimlands Native Flora Props (`32×64` Native)
- **Dimensions & Grid:** **`128 × 256 px`** (`4 cols × 4 rows` of **`32 × 64 px`** cells = 12 active + 4 reserved):
  - **Row 0 (3f gentle tide-sway + 1 harvested state):** **Amber Tide-Kelp** — curved golden kelp ribbons cradling luminous translucent honey gas-bladders (`F0`–`F5`).
  - **Row 1 (3 harmonic shimmer variants + 1 crystalline shard cluster):** **Mirror Glasswort** — razor-faceted hexagonal sea-teal mineral spires (`C0`–`C3`) reflecting sunlight along wet shorelines.
  - **Row 2 (Closed bud -> Blooming -> Radiant Acoustic-Resonance Glow + 1 meadow fern cluster):** **Sun-Drop Blossoms** — sculpted dark-emerald leaf rosettes opening into warm golden-ivory bioluminescent petals (`F3`–`F5`/`L3`) that react brightly when scanned by Mara's Acoustic Field Lens!
  - **Row 3:** Reserved for M02 Cordage Fronds & Spore-Lichen expansion.
- **Pivot:** Ground contact shadow center at **`(16, 58)`**.

---

### `AST-006` v3.0 — Crashed *ICV Meridian* Drop-Pod & Field Camp Landmark Atlas (`256×160`)
- **Dimensions:** **`256 × 160 px`** packed high-craft landmark atlas:
  - **Region A (`0, 0, 152, 96`) — Crashed Orbital Drop-Pod:** True angular-conical aerospace re-entry capsule pitched nose-down into a churned sand impact berm (`D0`–`D4`), featuring twin scorched rear retro-thrusters, beveled ceramic heat-tile panel grooves & rivets, bold terracotta *ICV Meridian* identification band, recessed crew hatch with status LEDs, glowing fractured cyan cockpit viewport revealing internal telemetry console, and bent dorsal comm-dish welded to the hull spine with ruby distress beacon.
  - **Region B (`152, 0, 80, 60`) — Geodesic Field Camp Tent + Riveted Supply Crate:** Sculpted terracotta expedition dome braced with metallic external frame arches, guy-lines & stakes, open zippered flap casting warm amber lantern light (`F3`/`F4`) onto the grass, paired with a riveted brushed-titanium Meridian expedition crate.
  - **Regions C–F (`y = 96..160`) — Modular Crash-Site Props:** Standalone riveted supply crate (`24×20`), trailing scorched skid-furrow decals (`64×32` × 2), scattered ceramic heat-tile debris (`32×24`), and animated 2-frame glowing distress beacon flare (`16×16`).
- **Pivot & Collision:** Drop-Pod Y-sort anchor at `(76, 80)`, polygon collision matching grounded hull footprint (`116 × 38 px`) so Mara can walk behind the curved upper nose and inspect the glowing cockpit & hatch up close.

---

### `AST-007` v3.0 — High-Resolution Contact Shadows, Tide Ripples & Acoustic Field Lens VFX (`256×256`)
- **Dimensions:** **`256 × 256 px`** layered semi-transparent RGBA8 VFX atlas:
  - **Row 0 (`64×64` × 4 cells):** Multi-step soft elliptical ground contact shadows (Small Flora `22×8`, Mara Hero `30×12`, Camp/Boulder `48×18`, Large Canopy/Pod `60×24`).
  - **Row 1 (`64×64` × 4f animated loop):** Delicate concentric shallow-water surf & wading ripples with bright sea-foam crests (`W5`/`W6`) and subtle dark wave troughs (`W1`).
  - **Row 2 (`64×64` × 4f animated loop):** Handheld Parabolic Acoustic Field Lens muzzle-aperture harmonic wave arcs (`L1`/`L2`/`L3`).
  - **Row 3 (`128×64` × 2f alternating harmonic interference frames):** Full ground-projected **Acoustic Field Lens Resonance Ring Field** — crisp concentric cyan-mint interference waves with glowing 6-node harmonic peaks & soft translucent teal illumination pool for live flora scanning.
- **Note on Alpha:** `AST-007` is the **sole** asset class authorized to use controlled stepped semi-transparency (`alpha ∈ {36, 75, 130, 195, 255}`); `AST-001` through `AST-006` enforce crisp binary alpha (except integrated baked ground contact shadows where specified).
