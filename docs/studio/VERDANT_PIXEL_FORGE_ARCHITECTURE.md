# VERDANT PIXEL FORGE — Architecture & Engineering Plan

> **Product**: VERDANT PIXEL FORGE — Interactive Pixel-Art Creation & Production Studio  
> **Location**: `tools/verdant-pixel-forge/` (strictly decoupled from `game/`, `game/project.godot`, and `AST-001`)  
> **Target Pipeline**: Native Godot `4.7.2` pixel-art workflow (`Nearest` filtering, strict RGBA binary transparency, sprite sheets, tilesets, `.import` + JSON manifests) & native `.source.json` interoperability with existing *VERDANT SIGNAL* assets.

---

## 1. Repository Discovery & Reusable Foundations

Inspection of the existing repository identified reusable data formats and assets integrated directly into VERDANT PIXEL FORGE:
- **Master 30-Color Palette** (`tools/pixel_art_core.py` & `docs/art-direction/VERDANT_SIGNAL_PIXEL_ART_STYLE_GUIDE.md`): 5 hue-shifted material ramps (`Suit Orange S0–S5`, `Harness/Boots B0–B4`, `Brushed Titanium M0–M5`, `Visor Glass/Teal V0–V5`, `Oura-IV Organic O0–O6`) shipped as the studio's default palette alongside biome palettes from `docs/concept/data/biomes.json`.
- **Layered Indexed Source Format (`verdant_signal_indexed_pixel_source_v1`)**: Existing `mara_lin_concept_128x128_v2.source.json` (23 layers), `mara_lin_concept_128x128.source.json` (22 layers), and `practice_a..e.source.json` can be loaded natively into the editor with all layers intact via the built-in repo asset loader or local file import.
- **Asset & Quality Audit Rules** (`tools/asset_inspector.py`, `tools/palette_director.py`, `docs/art-direction/PIXEL_ART_CRAFTSMANSHIP_STUDY.md`): Orphan-pixel classification, grayscale luminance separation, WCAG contrast checking, semi-alpha auditing, and tile-seam inspection translated into live interactive non-destructive canvas overlays.

---

## 2. Modular Software Architecture (`tools/verdant-pixel-forge/src/`)

| Module | Path | Responsibility |
| --- | --- | --- |
| **Document Model** | `src/types/studio.ts` | Strongly typed multi-frame, multi-layer, group/clipping, selection, tileset, palette, tags, reference, and QC types |
| **Drawing Engine** | `src/engine/pixelBuffer.ts` | Integer `Uint8ClampedArray` RGBA pixel ops: pixel-perfect stroke filter, Bresenham line, midpoint ellipse, rect, contiguous/global flood fill, Bayer/checker dithering, custom brushes, H/V/Radial symmetry, opacity & clipping compositing |
| **Selection Engine** | `src/engine/selectionEngine.ts` | Rect marquee, freehand polygon lasso, magic wand, floating copy/cut/paste/duplicate/move, crop-to-selection |
| **Transform Engine** | `src/engine/transformEngine.ts` | Exact 90° CW/CCW rotation, H/V flip, pixel-aware free rotation (Nearest & 3-pass shear), nearest-neighbor scale, anchored canvas resize, independent per-tile transforms |
| **History & Persistence** | `src/engine/historyEngine.ts`, `src/engine/projectPersistence.ts` | Multi-step undo/redo snapshots, `.vpf.json` & `.source.json` serialization, IndexedDB autosave & crash recovery |
| **Palette Engine** | `src/engine/paletteEngine.ts` | Material ramps, hue-shifted ramp generator, global color replace, usage/duplicate/unused analysis, grayscale luminance & WCAG contrast, `.gpl`/`.hex`/`.json` import/export |
| **Animation Engine** | `src/engine/animationEngine.ts` | Frame CRUD, reordering, per-frame duration, animation tags (`Idle`, `Walk`, `Run`, `Crouch`, `Scan`, `Interact`, `Damage`), onion skinning, playback controller |
| **Tileset Engine** | `src/engine/tilesetEngine.ts` | Configurable tile slicing, independent tile editing & rotation/flip/duplication/replacement, seamless 3×3 wrap check, tile metadata, live interactive tilemap painter & autotile preview |
| **Quality Intelligence** | `src/engine/qcEngine.ts` | Non-destructive overlays distinguishing errors vs. artistic choices: silhouette, grayscale, intentional vs. accidental orphans, banding, noise, palette lock, semi-alpha, light direction, tile seams |
| **Export & Godot Pipeline** | `src/engine/exportEngine.ts`, `src/engine/gifEncoder.ts` | Lossless PNG RGBA, configurable sprite sheets, pure-TS GIF89a LZW animated GIF encoder, layer/frame batch export, Godot 4 `.import` sidecars & JSON manifests |
| **Studio Workspace UI** | `src/components/*` | Desktop-grade dark studio layout: menu bar, left tool rail + options strip, central high-FPS pixel canvas viewport, right docked Layers/Palette/Reference/QC panels, bottom Animation Timeline, dedicated Tileset Lab mode, Export dialog |

---

## 3. Core Engineering Risks & Mitigations

1. **Performance on `128×128`–`256×256` Multi-Layer Canvases**: Raw typed-array pixel buffers mutated in place during active pointer strokes with direct Canvas2D blitting; React state updates only on stroke commit or UI transitions.
2. **Accidental Blur / Anti-Aliasing**: All drawing, fills, shapes, rotations, and scaling run strictly in integer array space; all canvas contexts enforce `imageSmoothingEnabled = false` and CSS `image-rendering: pixelated`.
3. **Browser Sandboxing & Preview Compatibility**: Vite binds `0.0.0.0` with `allowedHosts: true` and serves repository read-only assets over relative `/api/repo-assets` endpoints—zero `localhost` URLs in client code.
4. **Data Safety**: Debounced IndexedDB autosave on every edit with recovery on reopen, plus explicit `.vpf.json` save/reopen and zero write access to Milestone 01 gameplay files or `AST-001`.

---

## 4. Staged Delivery Plan

- **Stage 1 (Interactive Studio Prototype — Current Deliverable)**: Complete working application supporting all 12 core prototype requirements + full drawing engine, layer manager (with drag/drop, groups, opacity, clipping, solo, lock, independent transforms), pixel-exact transformations, animation timeline + onion skin + playback + GIF/sprite-sheet export, Tileset Lab + live tilemap painter, Palette Engine + hue shifting + usage audit, Artistic QC overlays, Reference Workspace, `.vpf.json` & `.source.json` persistence + IndexedDB autosave, and Godot 4 export bundle—verified end-to-end through the real rendered UI.
- **Stage 2 (Post-Approval Expansion)**: Multi-frame tweening helpers, external Aseprite `.aseprite` binary importer, custom shader preview (Godot ambient/rim lighting simulation), and batch tileset autotile terrain solver presets.
