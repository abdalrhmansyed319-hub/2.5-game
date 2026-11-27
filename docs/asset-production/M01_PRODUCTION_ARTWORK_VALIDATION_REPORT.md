# VERDANT SIGNAL — Milestone 01 Production Artwork Validation & Integration Report

- **Branch**: `arena/1d52d1b9-2-5-game`
- **Specification Authority**: `docs/asset-production/ASSET_REQUESTS.md` (v2.0 Audited Spec) & `docs/art-direction/VERDANT_SIGNAL_PIXEL_ART_STYLE_GUIDE.md`
- **Authoring Pipeline**: VERDANT PIXEL FORGE (`tools/verdant-pixel-forge/src/production/`), exporting lossless RGBA8 PNGs + editable layered `.vpf.json` projects verified via `deserializeProjectJSON` round-trip.
- **Stage 05 Visual Prototype Gate**: **NOT YET COMPLETE** — All `7/7` production PNGs are integrated at exact `AssetPaths`, eliminating debug placeholder fallbacks, **pending live execution and visual sign-off on Windows Godot `4.7.2-stable` (`GL Compatibility`)** (no Godot binary exists in this Linux sandbox).

---

## 1. Delivered Final Production Assets & Automated QA Results

| Asset ID | Final Production PNG | Dims | Size | Colors | Editable VPF Source (`.vpf.json`) | Automated Contract & Pixel QA |
| :---: | --- | :---: | :---: | :---: | --- | --- |
| `AST-001` | `game/assets/characters/player/char_mara_lin_sheet.png` | `96×384` | 147,918 B | 23 | `game/assets/_vpf_sources/ast001_char_mara_lin_sheet.vpf.json` *(8 layers)* | **PASS** — 64 active + 32 transparent unused cells; 0 AA/semi-alpha px; 0 off-palette RGB (`VERDANT_MASTER_PALETTE`); 94 non-mirror diffs (Right vs Left); 0 waist gaps. |
| `AST-002` | `game/assets/world/tilesets/env_amber_coast_ground_tileset.png` | `192×128` | 98,505 B | 34 | `game/assets/_vpf_sources/ast002_env_amber_coast_ground_tileset.vpf.json` *(5 layers)* | **PASS** — 90 active tiles (18 Wang sand/shore, 6 decals, 12 wet tidal sandbars, 18 stratified coastal cliffs incl. `(5,3)` boulder, 12 deep water shelf, 12 2-frame horizontal water/foam pairs) + 6 transparent unused cells `(6..11, 5)`. |
| `AST-003` | `game/assets/world/tilesets/env_singing_canopy_ground_tileset.png` | `192×96` | 73,897 B | 30 | `game/assets/_vpf_sources/ast003_env_singing_canopy_ground_tileset.vpf.json` *(5 layers)* | **PASS** — 72/72 active tiles (18 ragged moss->sand Wang ecotone tiles, 6 forest decals, 16 full 4-bit cardinal root-lined dirt footpaths, 18 mossy root terraces, 6 creek banks, 4 2-frame stream pairs), zero grid seams. |
| `AST-004` | `game/assets/world/props/prop_singing_reedwood_tree_sheet.png` | `96×160` | 61,668 B | 20 | `game/assets/_vpf_sources/ast004_prop_singing_reedwood_tree_sheet.vpf.json` *(5 layers)* | **PASS** — 2 variants (`48×80` cells), Col 0 fluted acoustic trunk `y=32..76` (`y=0..31` strictly transparent), Col 1 volumetric cutaway canopy `y=2..36` (`y=37..79` strictly transparent), `4 px` overlap collar `y=32..36` verified seamlessly at `0.38` alpha. |
| `AST-005` | `game/assets/world/flora/prop_rimlands_flora_sheet.png` | `64×128` | 32,964 B | 28 | `game/assets/_vpf_sources/ast005_prop_rimlands_flora_sheet.vpf.json` *(3 layers)* | **PASS** — 10 active flora sprites (4-frame Amber Tide-Kelp wind sway, Mirror Glasswort A/B crystals, Sun-Drop Bulb Day closed & Night glowing star blossom, Cordage Frond A/B) + 6 transparent unused cells. |
| `AST-006` | `game/assets/world/landmarks/prop_drop_pod_landmark_sheet.png` | `96×64` | 24,708 B | 54 | `game/assets/_vpf_sources/ast006_prop_drop_pod_landmark_sheet.vpf.json` *(4 layers)* | **PASS** — 5 exact atlas sub-regions (`64×48` tilted *ICV Meridian* drop-pod, `16×16` Crates A & B, `32×32` lantern-lit geodesic tent, `64×16` scorched skid-furrow decal) + `(64,48,32,16)` strictly transparent. |
| `AST-007` | `game/assets/vfx/fx_shadows_ripples_lens_sheet.png` | `128×96` | 49,316 B | 9 | `game/assets/_vpf_sources/ast007_fx_shadows_ripples_lens_sheet.vpf.json` *(3 layers)* | **PASS** — 11 active `32×32` VFX cells (S/M/L `#12161C` contact shadows, 4-frame shallow-water ripples, 4-frame Acoustic Field Lens harmonic rings) + `(3,0)` strictly transparent, `>= 1 px` transparent cell border enforced on every cell. |

---

## 2. Visual QA Evidence (`docs/asset-production/qa_evidence/`)

- `scene_a_drop_pod_hero_spawn_480x270_1x.png` & `_960x540_2x.png` — Drop-Pod clearing hero spawn with full Rimlands palette, Y-sorting, 4-bit dirt trails, Reedwood grove, and Mara Lin lens scan.
- `scene_b_coast_ecotone_cutaway_480x270_1x.png` & `_960x540_2x.png` — Amber Coast beach-to-canopy Wang transitions, stratified coastal cliff, Mara figure-ground contrast on sand vs moss, crouch-sampling posture, and live `0.38` alpha Singing Reedwood canopy cutaway.
- `scene_c_twilight_night_biolum_480x270_1x.png` & `_960x540_2x.png` — Dusk/night modulation pass showing bioluminescent open Night Sun-Drop Blossoms, warm camp tent lantern, drop-pod hatch glow, and cyan Acoustic Field Lens pulse readability.
- `qa_ast001_biome_poses_3x.png` — 4-direction Mara Lin pose & biome figure-ground matrix across Amber Coast sand and Singing Canopy moss.

---

## 3. Godot Integration & Architecture Notes

- **Zero Runtime Script/Scene Disruption**: All 7 final PNGs occupy the exact `AssetPaths` paths referenced by `game/systems/asset_paths.gd`. Existing fallback debug assets under `game/assets/debug_placeholders/` remain untouched, and `AssetPaths.resolve_texture()` now resolves `0/7` placeholders automatically.
- **Native Godot Import Safety**: No synthetic `.import` / fake `.ctex` files were committed; Godot `4.7.2` on Windows will natively import all 7 lossless PNGs using `project.godot`'s `textures/canvas_textures/default_texture_filter=0` (`Nearest`) and `Mipmaps = Off`.
- **Lean Runtime Footprint**: Editable `.vpf.json` projects live in `game/assets/_vpf_sources/` with a `.gdignore` marker so Godot skips indexing editor sources, and QA composite evidence lives outside `game/` under `docs/asset-production/qa_evidence/`.
- **VERDANT PIXEL FORGE Studio Verification**: All 7 `.vpf.json` files are registered in `tools/verdant-pixel-forge/vite.config.ts`, verified by `deserializeProjectJSON` round-trip, and `npm test` (`9/9`), `npm run typecheck`, and `npm run build` all pass cleanly.
- **Workflow Honesty Note**: While every `.vpf.json` uses VPF's exact data schema, palette engine, layer compositor, and lossless PNG encoder, the pixel generation was authored programmatically via VPF's TypeScript engine modules (`tools/verdant-pixel-forge/src/production/*.ts`) rather than manual browser mouse strokes. All 7 `.vpf.json` projects open directly inside the live VERDANT PIXEL FORGE web UI for interactive layer-by-layer pixel editing.

---

## 4. Pending Windows Godot 4.7.2 Verification Checklist (Required Before Stage 05 Sign-Off)

1. Open `game/project.godot` in Godot `4.7.2-stable` on Windows (`GL Compatibility`) and let Godot auto-import the 7 production PNGs (confirm `Compress = Lossless`, `Mipmaps = Off`, `Filter = Nearest`).
2. Run `game/tests/smoke_runner.gd` / `RimlandsPrototype` (`F5`) and verify HUD reports **`0/7 PLACEHOLDERS`**, zero missing texture warnings, and clean Intel HD 3000 frame pacing.
3. Playtest in real time: 8-direction walk, crouch, Acoustic Field Lens scan (`E`/`Space`), shallow-water wading ripples, Singing Reedwood `0.38` canopy fade behind trunks, and Day/Night cycle Sun-Drop blossom switch.
