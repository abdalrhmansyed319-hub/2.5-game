# 05 — Asset Analysis and Tileset Engineering

> **Technical Bridge (Phase 1)**: Connects directly to [`KB-06 TileMap & Environment Engineering`](../knowledge-base/06-tilemap-and-environment-engineering.md), [`Lab 06 Multi-Layer TileMapLayer`](../../labs/lab_06_tilemap_environment/README.md), [`tools/asset_inspector.py`](../../tools/asset_inspector.py), and [`Exercise C Tileset Construction Lab`](../../creative-labs/exercise_c_tileset_construction/README.md).  
> **Scope**: Forensic analysis of user-provided visual assets, mandatory asset governance rules, structured asset inventory cataloging, tileset topology & bitmask construction, seam/corner hygiene, and honest gap mitigation.

---

## 1. Mandatory Asset Governance Rules (Zero Exceptions)

When working with user-provided visual assets on any future project:
1. **User-Provided Assets Are Primary**: Treat the user's supplied art collection as the authoritative visual source unless the user explicitly approves generated or supplemental assets.
2. **Never Fabricate Availability**: Never invent filenames, sprite frames, or tileset pieces and claim they exist in the supplied assets.
3. **Never Claim Uninspected Files**: Only state dimensions, palettes, tile layouts, or visual contents for files you have actually opened and analyzed via tooling (`tools/asset_inspector.py` + visual image inspection via `read_file`).
4. **Preserve Artistic Identity**: Never distort aspect ratios, mix conflicting pixel densities (e.g., 16×16 tiles next to scaled 64×64 HD sprites), or randomly drop decorative props where they break perspective or lighting direction.
5. **Analyze Before Designing**: Complete a full Asset Inventory *before* committing to level blockout details or biome art plans — design *with* the real kit, not against an imagined kit.
6. **Report Gaps Honestly & Propose Concrete Solutions**: When a required tile (e.g., an inner corner, diagonal slope, or water edge) is missing from the kit, report the exact gap and propose options (layout adaptation, valid flip/transpose reuse, layered decal composition, or requesting/authoring the missing tile).

---

## 2. Systematic Visual Asset Inspection Protocol

For every supplied image asset, extract **two layers of intelligence** — Quantitative (via `tools/asset_inspector.py`) and Qualitative (via direct visual inspection):

### A. Quantitative Technical Forensics (`tools/asset_inspector.py`)
- **Canvas Dimensions & Aspect Ratio**: Exact `width × height` in pixels; check exact divisibility by standard grid sizes (`8`, `12`, `16`, `24`, `32`, `48`, `64`).
- **Color Mode & Transparency**: RGBA vs. RGB/Indexed; exact transparent pixel percentage; whether alpha is strictly binary (1-bit crisp pixel art) or soft anti-aliased (painterly/vector).
- **Palette Profile**: Unique color count, dominant hex palette swatches, luminance range (detecting if backgrounds are too bright/high-contrast vs. foreground sprites!), saturation clusters.
- **Grid & Sprite Slicing**: Detect candidate tile/frame dimensions, count non-empty cells vs. empty padding cells, detect uniform margins/separations, and identify row-based animation strips vs. packed atlases.
- **Border Continuity Signatures**: Sample north/south/east/west 1-pixel edge strips of candidate tiles to detect which edges tile seamlessly vs. which represent bordered walls, caps, or corners.

### B. Qualitative Artistic Analysis (Visual Inspection via `read_file`)
- **Perspective / Projection**: Strict side-view, 3/4 top-down (vertical walls visible on south face), orthographic top-down, isometric (2:1 pixel steps), or oblique 2.5D.
- **Pixel Density (Texel Scale)**: Are outlines 1px crisp pixel art, 2px chunky, or high-res painterly? Never mix mismatched effective pixel sizes on screen.
- **Lighting Direction**: Consistent key-light angle (most commonly top-left or straight top-down) — note that horizontal flipping (`TRANSFORM_FLIP_H`) flips highlights across the X-axis! Safe for symmetric/ambient textures, noticeable on strongly directional shaded props.
- **Edge & Outline Treatment**: Pure black outlines, selective colored outlines ("selout"), or lineless shapes; silhouette contrast against ground tiles.
- **Material & Architectural Semantics**: Identify exact function of each tile/prop (walkable floor, solid wall top, wall front face, ledge cap, outer corner, inner corner, overhang, decal, animated frame sequence).

---

## 3. Structured Asset Inventory Standard (Section 5D Format)

Every cataloged asset must record all **9 required fields**:
1. **Asset Filename** (exact workspace path)
2. **Asset Type** (`tileset`, `spritesheet`, `prop_atlas`, `character_anim`, `ui_9slice`, `background_parallax`, `vfx_strip`, `icon`)
3. **Dimensions** (`W × H px`, plus detected grid cell size e.g. `16×16`, columns × rows)
4. **Visual Description** (palette summary, perspective, lighting direction, outline style, material quality)
5. **Intended Function** (verified visual purpose — explicitly note uncertainty if ambiguous)
6. **Possible Variations** (safe flips/rotations, animation frames, modulate/palette-swap candidates, multi-tile assemblies)
7. **Relationships with Other Assets** (matching palette/perspective companions, layer pairings — e.g., floor atlas + matching wall/decal sheet)
8. **Potential Uses** (concrete environment/gameplay roles)
9. **Known Limitations** (missing inner corners, asymmetric lighting blocking flips, mixed pixel scale, transparency bleed risks)

---

## 4. Tileset Construction & Seamless Environment Engineering

### Understanding Tile Roles & Connectivity Topologies
A complete seamless environment kit generally requires distinct functional families:
- **Fill & Floor Variants**: Base fill + 2–5 subtle low-contrast variation tiles (cracks, pebbles, slight moss) weighted via `TileData.probability` so large surfaces never form obvious checkerboard repetition!
- **Outer Edges (N, E, S, W)** & **Outer Convex Corners (NW, NE, SE, SW)**: Frame solid islands, platforms, and room perimeters.
- **Inner Concave Corners (Inner NW, NE, SE, SW)**: The #1 most commonly missed tiles in amateur maps! Required wherever two perpendicular walls or terrain masses meet in an L-shape or T-junction.
- **Floor-to-Wall Transitions & Wall Depth**: In 3/4 top-down views, south-facing walls require both a **wall cap (top)** and a **vertical wall face (front)** plus a subtle contact shadow cast onto the floor below — anchoring height and preventing flat "wallpaper" rooms.
- **Terrain Autotiling Mapping (Godot `TileMapLayer` Bridge)**:
  - **16-tile Wang Corner / 4-bit Cardinal Bitmask** (`N=1, E=2, S=4, W=8` or corner bits): Cleanly covers solid landmasses, rivers, and simple rooms.
  - **47-tile Blob Set (`TERRAIN_MODE_MATCH_CORNERS_AND_SIDES`)**: Required when 1-tile-wide corridors, peninsulas, and inner+outer corners must all connect seamlessly without visual breaks.

### Seamless Construction Quality Checklist
- [ ] **Zero Tile Seams / Bleeding**: Enable `use_texture_padding = true` on `TileSetAtlasSource` and `Nearest` filtering for pixel art.
- [ ] **No Naked Exposed Edges**: Every wall cap closes cleanly at corners; no cut-off brick ends floating next to floor tiles.
- [ ] **Consistent Wall Thickness & Perspective**: Never mix 1-tile top-down walls with 2-tile tall front walls inconsistently on the same plane.
- [ ] **Controlled Repetition**: Break up long spans (> 4 identical consecutive tiles) with subtle variation tiles, structural trims, decals on a separate `TileMapLayer`, or props.
- [ ] **Layer Hygiene**: Separate `Ground` -> `GroundDecals` -> `WallsAndProps (Y-Sorted)` -> `CanopyOverlay` (`KB-06`, `Lab 06`) so visual depth and collision remain crisp and bug-free.
