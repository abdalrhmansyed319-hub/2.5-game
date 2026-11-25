# Deliverable D — Asset Intelligence Handbook

> **Foundation**: Synthesized from [`Creative KB-05`](../creative-knowledge-base/05-asset-analysis-and-tileset-engineering.md), [`Exercise C`](../../creative-labs/exercise_c_tileset_construction/README.md), and our verified CLI tool [`tools/asset_inspector.py`](../../tools/asset_inspector.py).  
> **Godot 4.7 Bridge**: [`Tech KB-06 TileMap & Environment`](../knowledge-base/06-tilemap-and-environment-engineering.md).

---

## 1. Non-Negotiable Asset Governance Rules
1. **User-Provided Assets Come First**: Always inspect and treat user-supplied visual collections as the primary visual authority unless replacements or additions are explicitly approved.
2. **Absolute Inspection Honesty**: Never invent assets and claim they exist in provided folders; never claim to have inspected an asset you could not actually open or view.
3. **Artistic Respect**: Never non-uniformly stretch/squish sprites or tiles, never mix clashing pixel densities ("mixels") or mismatched art styles without flagging the mismatch explicitly, and never scatter props randomly without functional/visual intent.
4. **Analyze Before Designing Environments**: Complete the full Asset Inventory BEFORE designing room dimensions, wall thicknesses, or tileset mechanics; report every missing tile/corner/prop honestly with concrete creative or technical workarounds!

---

## 2. Two-Stage Asset Inspection Protocol (Quantitative + Qualitative)

### Stage 1 — Automated Quantitative Forensics (`tools/asset_inspector.py`)
Run our Pillow-powered inspector on every supplied asset folder:
```bash
/tmp/gdtools-venv/bin/python tools/asset_inspector.py <assets_dir> --tile-size <N> --markdown asset_inventory.md
```
Automatically extracts verified pixel ground truth:
- Exact canvas dimensions (`W × H px`), color mode, alpha classification (`opaque` vs. `binary_pixel_alpha` vs. `soft_antialiased_alpha`), transparency ratio.
- Unique color count, top dominant hex swatches, luminance min/median/max/std (early 5-band contrast warning!).
- Valid tile-grid divisors (`8/16/24/32/48/64`), occupied cell count, and border-contrast continuity signals.

### Stage 2 — Mandatory Visual Inspection (`read_file` on Image Files)
Tooling alone cannot verify art direction! Visually inspect the actual image (at native or nearest-neighbor upscaled preview for small pixel tiles) to classify:
- Exact **projection/perspective** (side-view, 3/4 top-down, strict top-down, isometric).
- **Primary key-light direction** (determines whether horizontal flipping breaks shading consistency!).
- **Rim thickness, corner miters, inner concave corners, overhang lips, and base contact shadows**.
- **Style signature** (outline color/weight, pixel clustering, hue-shifted ramps, material fidelity).

---

## 3. Mandatory 9-Field Asset Inventory Standard
Every inspected asset in a real project MUST be logged with all 9 fields (auto-scaffolded by `tools/asset_inspector.py` and completed via visual inspection):
1. **Asset Filename** (exact workspace path)
2. **Asset Type** (tileset, autotile blob, prop atlas, character spritesheet, VFX, UI slice)
3. **Dimensions** (sheet `W×H`, grid tile size, frame counts/margins)
4. **Visual Description** (forensic palette/alpha + visual perspective, light angle, outline, texture density)
5. **Intended Function** (playable ground, solid wall, background fill, hazard, interactive prop, overlay)
6. **Possible Variations** (safe flips/rotations, terrain variants, `modulate` palette shifts, modular sub-cropping)
7. **Relationships with Other Assets** (shared palette, scale compatibility, snap points, layering order)
8. **Potential Uses** (primary architectural role + creative modular reuse without visual distortion)
9. **Known Limitations** (missing inner corners, asymmetric lighting blocking flips, missing 1-tile thin walls, palette clashes)

---

## 4. Tileset Assembly & Seam-Prevention Rules (Proven in Exercise C)
- **Verify Every Edge & Corner Type Before Scaling Up**: Assemble a small test room containing an outer perimeter, a 2×2 interior pillar (outer convex corners), a projecting wall peninsula, and an L-alcove (inner concave corners) — then **visually inspect it via `read_file`**! *(In Exercise C, this exact step caught 3 real pixel-level miter/bevel/inner-corner defects on Pass 1!)*
- **Layer Discipline (`Godot 4.7 TileMapLayer`)**: Split cleanly into `BackgroundLayer`, `GroundLayer`, `WallCollisionLayer`, `ContactShadowDecalLayer`, `YSortPropsActors`, and `CanopyOverlayLayer`.
- **Break Floor Repetition Gently**: Use 75–85% calm base floor tiles mixed with sparse subtle cracks/moss/wear variants (`15–25%`); avoid high-contrast grid patterns that create dizzying checkerboards.
- **Prevent Sub-Pixel Atlas Bleeding**: Always enable `use_texture_padding = true` on `TileSetAtlasSource` (`Tech KB-06`) and `Nearest` filtering for crisp pixel art.
- **Handling Missing Tiles Honestly**: Never force a missing inner corner or thin wall by stretching wrong tiles — instead either (a) enforce minimum 2-tile wall thicknesses in level blockouts, (b) layer a matching neutral trim prop over the join, or (c) request/authorize the exact missing tile list from the user!
