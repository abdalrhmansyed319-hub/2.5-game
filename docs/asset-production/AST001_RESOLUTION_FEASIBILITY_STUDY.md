# AST-001 Artistic Direction & Resolution Feasibility Study — Dr. Mara Lin

> **Study Status**: **Complete — Pending User Artistic & Production Direction Review**  
> **Trigger**: Rejection of the original `16×24` AST-001 candidate (`game/assets/characters/player/candidates/`, preserved untouched for reference) due to insufficient pixel area to honor *VERDANT SIGNAL*'s painterly art direction and Dr. Mara Lin's approved `128×128` v2 hero identity.  
> **Isolation Guarantee**: **No changes** have been made to `game/project.godot`, Milestone 01 scenes/scripts, `game/assets/debug_placeholders/`, `game/assets/characters/player/candidates/`, Mara Lin `128×128` v1/v2 concepts, or `docs/asset-production/ASSET_REQUESTS.md`.

---

## 1. Executive Summary & Headline Recommendation

We authored **three independent, full-detail standing character prototypes** of Dr. Mara Lin at **`32×48`**, **`48×64`**, and **`64×80`** directly through **VERDANT PIXEL FORGE**'s native TypeScript buffer, palette, QC, and 13-layer `.vpf.json` project engine (not upscaled from `16×24` and not downscaled from `128×128`).

### Primary Production Recommendation: **`48×64 px` per frame** (`3×4` standard tiles · `8×` pixel area of `16×24`)

- **Why `48×64` wins**: It is the **earliest resolution where every single one of Dr. Mara Lin's 8 required visual features reads cleanly at BOTH `1×` native scale and `4×` nearest-neighbor zoom** without collapsing into abstract color blocks, while remaining practical to animate across a full directional sprite sheet and compatible with Godot `4.7.2` `GL Compatibility` on Intel HD Graphics 3000 (`1366×768`).
- **Art-Benchmark Proof**: In our approved environmental style reference (`docs/art-direction/VERDANT_SIGNAL_PIXEL_ART_STYLE_GUIDE.md`), the standing field-explorer silhouette measured **`~50×58` to `~67×61 px`** native. Our **`48×64`** Mara Lin prototype has a **`38×57 px`** opaque standing silhouette — matching the style benchmark's vertical scale within **1 pixel (`57 px` vs `58 px`)**.
- **Viable Compact Alternative**: **`32×48 px`** (`26×43 px` figure) is the strongest option if you prefer **zero viewport/camera changes** to Milestone 01's current `480×270` (`16×16` tile) configuration and want roughly **~45% lower animation labor** than `48×64`, accepting tighter simplification of fine harness hardware, fabric seams, and oxygen hose detail.
- **Why `64×80` is NOT recommended for full gameplay sheets**: Although visually gorgeous (`50×71 px` figure — near hero-concept fidelity), `64×80` forces a full world-scale/viewport redesign, consumes **`1.64×`** more painted pixels per frame than `48×64` (`3.05×` more than `32×48`), and makes a 64-frame multi-direction character sheet (plus future fauna/NPCs at matching density) prohibitively expensive to animate cleanly.

---

## 2. Deliverable Inventory & VERDANT PIXEL FORGE Authenticity

### Authoring Transparency (VERDANT PIXEL FORGE Native Layer Pipeline)

All three prototypes were built using **VERDANT PIXEL FORGE**'s own engine modules (`src/engine/pixelBuffer.ts`, `src/engine/paletteEngine.ts`, `src/engine/qcEngine.ts`, `src/engine/pngEncoder.ts`, `src/engine/exportEngine.ts`) via dedicated resolution-independent native authoring scripts (`src/production/vpfSculptTools.ts`, `maraProto32x48.ts`, `maraProto48x64.ts`, `maraProto64x80.ts`, `buildFeasibilityStudyViaVpf.ts`) that write directly into VPF's native **`13`-layer `ProjectDocument` (`.vpf.json` schema v1)** and run VPF's real PNG encoder and QC checks.

Every `.vpf.json` file is registered in VERDANT PIXEL FORGE's **Open Repo Asset** menu (`/api/repo-assets`) and opens directly in the interactive studio with all **13 separate editable pixel layers** intact (`l01_antenna_comm` through `l13_handheld_scanner`) so any layer can be soloed, toggled, repainted with Pencil/Fill/Shading tools, or re-exported inside the app.

### Output Artifacts

| Deliverable | Workspace Path | Dimensions / Spec |
| --- | --- | --- |
| **Master 4-Resolution Comparison Sheet (`4×` + `1×` across 4 biomes)** | `game/assets/characters/player/feasibility_study/previews/ast001_resolution_comparison_1x_and_4x.png` | `844 × 560 px` PNG |
| **Prototype 1 (`32×48`) — Editable VPF Project** | `game/assets/characters/player/feasibility_study/mara_lin_proto_32x48.vpf.json` | `32 × 48 px` · `13` layers · Pivot `(15, 45)` |
| **Prototype 1 (`32×48`) — Native `1×` PNG & Preview Card** | `game/assets/characters/player/feasibility_study/mara_lin_proto_32x48.png`<br>`game/assets/characters/player/feasibility_study/previews/mara_lin_proto_32x48_1x_and_4x.png` | `32 × 48` native / `404 × 252` card |
| **Prototype 2 (`48×64`) — Editable VPF Project** *(Recommended)* | `game/assets/characters/player/feasibility_study/mara_lin_proto_48x64.vpf.json` | `48 × 64 px` · `13` layers · Pivot `(22, 60)` |
| **Prototype 2 (`48×64`) — Native `1×` PNG & Preview Card** | `game/assets/characters/player/feasibility_study/mara_lin_proto_48x64.png`<br>`game/assets/characters/player/feasibility_study/previews/mara_lin_proto_48x64_1x_and_4x.png` | `48 × 64` native / `500 × 316` card |
| **Prototype 3 (`64×80`) — Editable VPF Project** | `game/assets/characters/player/feasibility_study/mara_lin_proto_64x80.vpf.json` | `64 × 80 px` · `13` layers · Pivot `(29, 74)` |
| **Prototype 3 (`64×80`) — Native `1×` PNG & Preview Card** | `game/assets/characters/player/feasibility_study/mara_lin_proto_64x80.png`<br>`game/assets/characters/player/feasibility_study/previews/mara_lin_proto_64x80_1x_and_4x.png` | `64 × 80` native / `596 × 380` card |

### Shared 13-Layer Architecture (Editable in VERDANT PIXEL FORGE)

`l01_antenna_comm` · `l02_backpack_chassis` · `l03_oxygen_cylinder` · `l04_back_arm_shadow` · `l05_legs_fabric_panels` · `l06_kneepads_heavy_boots` · `l07_suit_torso_arms` · `l08_harness_belt_pouches` · `l09_specimen_canister` · `l10_chest_instrument_panel` · `l11_helmet_shell_collar` · `l12_helmet_glass_visor` · `l13_handheld_scanner`

---

## 3. Quantitative Pixel & QC Comparison

| Metric | `16×24` *(Rejected)* | `32×48` *(Proto 1)* | **`48×64`** *(Proto 2 — Rec.)* | `64×80` *(Proto 3)* |
| --- | :---: | :---: | :---: | :---: |
| **Frame Dimensions** | `16 × 24` (`384 px²`) | `32 × 48` (`1,536 px²`) | **`48 × 64` (`3,072 px²`)** | `64 × 80` (`5,120 px²`) |
| **Pixel Area vs `16×24`** | `1.0×` | `4.0×` | **`8.0×`** | `13.3×` |
| **Opaque Figure BBox (`w × h`)** | `13 × 21 px` | `26 × 43 px` | **`38 × 57 px`** | `50 × 71 px` |
| **Opaque Pixels Painted** | `~210 px` | `590 px` (`38.4%`) | **`1,097 px` (`35.7%`)** | `1,800 px` (`35.2%`) |
| **Aspect Ratio (`w / h` of figure)** | `0.62` (squished) | `0.60` (lean 3/4) | **`0.67` (heroic 3/4)** | `0.70` (near v2 `0.78`) |
| **Foot Pivot `(x, y)`** | `(8, 22)` | `(15, 45)` | **`(22, 60)`** | `(29, 74)` |
| **Editable VPF Layers** | `8` *(sheet project)* | `13` | **`13`** | `13` |
| **Master Palette Colors Used** | `24 / 30` | `29 / 30` | **`29 / 30`** | `29 / 30` |
| **Off-Palette / Semi-Alpha Pixels** | `0 / 0` | `0 / 0` | **`0 / 0`** | `0 / 0` |
| **Measured Key Light Angle (Upper-Left)** | `~42°` | `39°` | **`39°`** | `38°` |

---

## 4. Feature-by-Feature Artistic Evaluation (`1×` Native & `4×` Zoom)

| Required Dr. Mara Lin Feature | `16×24` *(Rejected)* | `32×48` *(Proto 1)* | **`48×64`** *(Proto 2 — Rec.)* | `64×80` *(Proto 3)* |
| --- | --- | --- | --- | --- |
| **1. Oversized Orange Helmet + Glass Visor** | 1-tone oval + 2px teal smudge; cream stripe & ear cap lost. | Clear burnt-orange dome, 1px stripe, curved cyan visor & specular arc; neck collar reads cleanly at `1×`. | **Full spherical 6-tone shading**, crisp 2px racing stripe, distinct side ear-comm cap, bolted titanium collar, and layered domed glass visor with curved double specular & warm floor bounce. | Museum-grade helmet geometry with multi-pixel bolted collar lugs, recessed visor gasket rim, and fine optical falloff. |
| **2. Spacesuit Fabric Panels & Seams** | Impossible — chest/limbs are 2–3px wide slabs. | Readable torso/leg fold shadows & teal shoulder badge; seams stay subtle (`1px`). | **Distinct multi-panel construction**: quilted bicep seam, horizontal waist gather, diagonal shin drape above boots, and rotated 4×4 teal diamond shoulder patch. | Rich stitched panels, vertical thigh seams, layered sleeve baffles, and deep cloth compression folds. |
| **3. Chest Equipment & Survival Harness** | 3×3 grey square; harness & belt merge into dark pixels. | Oscilloscope bezel, mini waveform, twin harness straps, metallic belt buckle & specimen jar all read cleanly. | **Hero-grade chest console**: beveled titanium bezel, live glowing teal waveform, green/orange LED indicators, 3px weathered leather harness w/ titanium D-rings, center belt buckle, hip pouches & glowing flora canister. | Individually detailed latch pins, recessed console screen bezel, D-ring openings, and multi-tone flora leaf silhouette inside the specimen jar. |
| **4. Substantial Backpack (O2, Antenna, Cables, Housing)** | 2px grey sliver behind shoulder; zero mechanical identity. | Distinct titanium pack, O2 tank w/ orange band, angled antenna w/ glowing tip, and 1px ribbed breathing hose. | **Unmistakable expedition pack**: beveled titanium chassis with recessed cooling louvers, telemetry LED, strapped O2 cylinder w/ metallic gauge collar, angled comm mast, and ribbed dark breathing hose arching into the neck ring. | Full triple-louver housing, corner mounting bolts, banded valve neck, pressure gauge stem, and articulated breathing hose ribs. |
| **5. Separated Arms, Gloves, Legs & Heavy Boots** | Arms fuse into torso; feet are 3×2 dark stubs. | Crisp left elbow negative space, distinct thighs, kneepads, and separated heavy boots. | **Clean anatomical silhouette**: generous triangular negative-space window under bent left elbow, wrist collar rings, wrapped dark leather fingers, articulated kneepads, and lugged tread boots firmly planted. | Complete finger separation on both gloves, knee-guard hinge lines/rivets, instep clasps, and multi-lug sole treads. |
| **6. Handheld Scientific Scanner** | 2–3 disconnected cyan pixels; reads as glare/noise. | Recognizable angled metallic barrel + miniature glowing teal parabolic dish held in gloved right hand. | **Complete, unclipped acoustic scanner**: angled brushed-metal body w/ orange emitter accent, ergonomic dark-leather grip + wrapped thumb, tilted elliptical collector dish, and central bright acoustic receiver pin. | Fine emitter status LED, concentric parabolic bowl depth, receiver probe highlight, and individually wrapped trigger/grip fingers. |
| **7. Material Shading, Highlights & Deep Shadows** | Limited to 2–3 values per material; flat reads at `1×`. | Clean 4-material contrast (suit / metal / leather / glass) with sculpted shadow edges; slight compression on specular zones. | **Full 6-stop material ramps** across orange cloth, brushed titanium, weathered leather, and reflective glass; zero flat black outlines; holds crisp contrast on Dark Studio, Amber Sand, Canopy Moss, and Forest Shade at `1×`. | Full painterly softness & tonal transition fidelity rivaling the `128×128` concept portrait. |
| **8. Silhouette & Pixel Clusters** | Chibi-abstract; breaks Mara Lin's realistic explorer proportions. | Tight, disciplined pixel clusters; authentic explorer identity at compact scale. | **Iconic studio-grade silhouette**: instantly recognizable as Dr. Mara Lin across all 4 biomes at `1×` and `4×` with intentional, clean clusters and zero orphan pixel noise. | Exceptionally crisp silhouette, though fine sub-details approach dense illustration scale when shrunk to `1×` in motion. |

---

## 5. Animation Feasibility & Production Cost Analysis

AST-001 specifies **64 non-mirrored frames** (`4` directions × `idle[4] + walk[6] + crouch_walk[4] + lens_scan[2]`, horizontal mirroring disallowed due to asymmetrical backpack/scanner/light direction) arranged in a `6×16` (`96`-cell) sheet.

| Production Dimension | `32×48` | **`48×64`** *(Recommended)* | `64×80` |
| --- | :---: | :---: | :---: |
| **Painted Opaque Pixels / Frame** | `~590 px` | **`~1,097 px`** (`1.86×` of `32×48`) | `~1,800 px` (`3.05×` of `32×48`) |
| **64-Frame Sheet Dimensions (`6×16`)** | `192 × 768 px` | **`288 × 1,024 px`** | `384 × 1,280 px` |
| **Uncompressed RGBA VRAM (64 frames)** | `576 KB` | **`1.13 MB`** | `1.88 MB` |
| **Relative Hand-Animation Effort (64 frames)** | **`1.0×` (Fastest)** | **`~1.7×` (Sustainable)** | **`~2.9×` (High Risk)** |
| **Sub-Pixel / Stride Readability in Walk & Crouch** | Good (`2–3 px` stride swing, `1 px` breathe bob); crouch reduces figure to `~32 px` tall. | **Excellent** (`4–5 px` stride arc, clean knee bend, visible scanner raise & subtle chest-screen pulse; crouch stays ~`42 px` tall with clear pack/visor readability). | Requires meticulous pixel-by-pixel anti-jitter discipline on seams, buckles, louvers, and hose across every frame — tiny misalignments read as "swimming" pixels in motion. |
| **Multi-Layer Modular Reuse in VPF (`13` layers)** | High — helmet/pack/legs translate cleanly, limited seam redraw. | **High** — `13` clean layers allow animating legs (`l05/l06`), arms/scanner (`l04/l07/l13`), torso bob (`l07–l10`), and pack/antenna sway (`l01–l03`) independently with secondary follow-through! | Moderate — large curved forms require manual volume re-shading on every limb angle rather than clean layer shifts. |
| **Downstream Art Debt (Fauna, NPCs, Props, Tiles)** | Low — harmonizes directly with `16×16` or `24×24` world tiles and modest prop sheets. | **Balanced** — pairs naturally with painterly `24×24` or `32×32` environment detail (or high-craft `16×16` tiles grouped in `2×2` / `3×3` painterly clusters like *Eastward*). | High — every creature, tree, ruin, and tool in *VERDANT SIGNAL* must match `64×80` micro-detail density to avoid jarring pixel-density mismatch. |

---

## 6. Godot `4.7.2` Integration & World-Scale Impact Assessment

> **Current `game/project.godot` Baseline (Untouched)**:  
> `viewport = 480×270`, `window = 960×540` (`2×` integer scale), `stretch/mode = "viewport"`, `stretch/scale_mode = "integer"`, `renderer = GL Compatibility` (Intel HD Graphics 3000, `1366×768 @ 60 Hz`), `default_texture_filter = Nearest`, pixel-snapped transforms/vertices.

### Viewport Framing & Hardware Compatibility Matrix

| Frame Size (Opaque Figure) | Screen Height % on `480×270` *(Current)* | Screen Height % on `640×360` *(Optional Upgrade)* | Integer Scaling on `1366×768` Monitor | Tile Footprint (`16×16` Base Grid) | Godot `Sprite2D.offset` (`centered=true`) |
| --- | :---: | :---: | --- | :---: | :---: |
| `16×24` (`13×21`) *(Rejected)* | `7.8%` *(Too tiny)* | `5.8%` | `2×` (`960×540`) | `1 × 1.5` tiles | `Vector2(0, -10)` |
| **`32×48` (`26×43`)** | **`15.9%` (Ideal on `480×270`!)** | `11.9%` | `2×` (`960×540`) | `2 × 3` tiles | `Vector2(1, -21)` *(or `(0, -21)` centered)* |
| **`48×64` (`38×57`)** *(Rec.)* | `21.1%` *(Close, intimate action-adventure)* | **`15.8%` (Golden sweet spot!)** | `480×270` → `2×` (`960×540`)<br>`640×360` → `2×` (`1280×720`, fits `1366×768`!) | `3 × 4` tiles (`16×16`)<br>or `1.5 × 2` (`32×32`) | `Vector2(2, -28)` *(or `(0, -28)` centered)* |
| `64×80` (`50×71`) | `26.3%` *(Cramped exploration view)* | `19.7%` *(Heavy camera presence)* | `640×360` → `2×` (`1280×720`)<br>Larger viewports lose `2×` integer scale on `1366×768`! | `4 × 5` tiles (`16×16`)<br>or `2 × 2.5` (`32×32`) | `Vector2(3, -34)` *(or `(0, -34)` centered)* |

### Technical Engineering Implications in Godot `4.7.2`

1. **GPU / Intel HD Graphics 3000 Safety**: All three sheet sizes (`192×768`, `288×1024`, `384×1280`) stay well below `2048×2048` single-texture limits and use `< 2 MB` uncompressed VRAM. Zero `GL Compatibility` shader, draw-call, or fill-rate bottlenecks.
2. **No Mixels / Strict `1:1` Pixel Integrity**: Whichever frame size is approved, `Sprite2D.scale` MUST remain strictly `Vector2(1, 1)` with `Filter = Nearest` and `Mipmaps = Off`. We **never** shrink a `64×80` or `48×64` sprite via non-unit `Sprite2D.scale`.
3. **Viewport & Tile Harmony**:
   - **If `48×64` is approved**: We strongly recommend pairing it with a **`640×360` native viewport** (`1280×720` `2×` window — cleanly fits `1366×768` with exact `2×` integer scaling!), keeping Mara at an ideal **`15.8%` of viewport height** with rich exploration sightlines, OR keeping `480×270` if a tighter, more cinematic close-camera feel (`21.1%` figure height) is preferred. World tiles can remain `16×16` modular sub-tiles authored in painterly `32×32` macro-clusters, or step cleanly to `32×32` base tiles (updating `AST-002`–`AST-007` specs before production begins, since `AST-002`–`AST-007` are still in `Requested` state and no final tileset art has been sunk yet!).
   - **If `32×48` is approved**: Works immediately inside the existing **`480×270`** viewport (`15.9%` figure height) with zero viewport change; only `Player` collision footprint, movement speed tuning, and prop scale ratios in `AST-004`/`AST-005`/`AST-006` adjust proportionally.
4. **Collision & Y-Sort Anchor**:
   - Y-sort foot anchor remains at exact ground contact between both boots (`y = 60` on `48×64`, `y = 45` on `32×48`).
   - Foot `RectangleShape2D` scales proportionally to the boots (`~20×10 px` for `48×64`, `~14×8 px` for `32×48`) so Mara walks tightly around tree trunks and cliff ledges without snagging her helmet or backpack.

---

## 7. Proposed AST-001 Specification Revisions (For User Approval Only — Not Yet Applied)

No edits have been made to `docs/asset-production/ASSET_REQUESTS.md` or `game/project.godot`. Upon your review, we propose updating `AST-001` as follows (choose **Option A — Recommended `48×64`** or **Option B — Compact `32×48`**):

| Spec Field | Current AST-001 v2.0 (`16×24` — Rejected) | Proposed **Option A: `48×64` (Recommended)** | Proposed **Option B: `32×48` (Compact)** |
| --- | --- | --- | --- |
| **Per-Frame Dimensions** | `16 × 24 px` | **`48 × 64 px`** | `32 × 48 px` |
| **Total Sheet (`6×16`, 64 active / 32 unused)** | `96 × 384 px` | **`288 × 1,024 px`** | `192 × 768 px` |
| **Visual Identity Alignment** | Outdated pre-benchmark text (ivory jacket, amber visor) | **Align to approved Mara Lin v2 identity**: burnt-orange segmented suit & helmet, cream stripe, teal glass visor, titanium backpack + O2 tank + antenna + breathing hose, chest oscilloscope, leather harness/boots, specimen jar, handheld acoustic scanner | Same approved Mara Lin v2 identity, tuned for compact `32×48` clusters |
| **Palette & Shading Authority** | Legacy biome hex table | **30-Color Master Palette** (`VERDANT_SIGNAL_PIXEL_ART_STYLE_GUIDE.md`), sculpted dark-value shadow edges (no flat black outlines), top-left `~40°` key light | Same 30-Color Master Palette & lighting rules |
| **Pivot / `Sprite2D.offset`** | Pivot `(8, 22)` → `Vector2(0, -10)` | Centered foot pivot **`(24, 60)` → `Vector2(0, -28)`** *(final sheet frames horizontally centered on foot axis)* | Centered foot pivot **`(16, 45)` → `Vector2(0, -21)`** |
| **Foot Collider (`RectangleShape2D`)** | `10 × 6 px` at `(0, -2)` | **`20 × 10 px`** at `(0, -4)` | **`14 × 8 px`** at `(0, -3)` |
| **Recommended Native Viewport** | `480 × 270` (`960×540` `2×`) | **`640 × 360`** (`1280×720` `2×`, fits `1366×768`) *or keep `480×270` close camera* | **`480 × 270`** (`960×540` `2×`, zero viewport change) |
| **Downstream M01 Spec Alignment (`AST-002`–`AST-007`)** | `16×16` tiles, `48×80` trees, `16×32` flora | Re-proportion `AST-004`–`AST-007` props/trees/shadows to match `48×64` Mara (and decide `16×16` vs `32×32` tile grid) before production starts | Re-proportion `AST-004`–`AST-007` modestly to match `32×48` Mara |

---

## 8. Review Decision Gate

Before any specification is revised, any full 64-frame production sheet is authored, or any Godot integration occurs, please confirm:

1. **Approved Production Frame Size**: **`48×64`** *(Recommended)*, **`32×48`** *(Compact)*, or **`64×80`** *(Hero Showcase)*?
2. **Artistic Notes on the Chosen Prototype**: Any silhouette, proportion, helmet/visor, backpack, harness, scanner, or shading adjustments you want dialed in before we lock the base character design?
3. **Viewport & World-Scale Direction** *(if choosing `48×64`)*: Keep `480×270` (closer camera) or step up to `640×360` (`1280×720` `2×` window) alongside proportional `AST-002`–`AST-007` spec updates?
