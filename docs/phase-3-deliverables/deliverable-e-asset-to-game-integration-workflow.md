# Phase 3 Deliverable E — Asset-to-Game Integration Workflow

> **Purpose**: Complete, non-destructive 9-step production pipeline turning raw user-provided visual and audio files into clean, seam-free, well-performing Godot environments, characters, and interfaces.  
> **Foundation**: Integrates [`Phase 2 Deliverable D`](../phase-2-deliverables/deliverable-d-asset-intelligence-handbook.md), [`tools/asset_inspector.py`](../../tools/asset_inspector.py), [`Exercise C`](../../creative-labs/exercise_c_tileset_construction/README.md), and [`Phase 1 Tech KB-06`](../knowledge-base/06-tilemap-and-environment-engineering.md).

---

## 1. Non-Negotiable Asset Governance Rules
1. **Preserve Originals Untouched**: Keep raw user-supplied files cleanly separated (e.g., `assets/raw/` or original folder) from any derived/packed/Godot-configured assets (`assets/derived/` or `resources/tilesets/`). Avoid destructive overwrites.
2. **User Assets Are Primary Visual Truth**: Never silently discard, replace, stretch, blur, or restyle user-provided art.
3. **Real Inspection Only**: Combine programmatic pixel forensics (`tools/asset_inspector.py`) with direct visual inspection (`read_file` on PNGs/spritesheets) — never infer tile roles solely from filenames!
4. **Honest Gap Disclosure**: When essential corners, transitions, animations, or props are missing, document the gap explicitly in `05-asset-catalog.md` and propose concrete architectural workarounds (e.g., 2-tile wall minimums, modular overlay trims, palette shifts, or targeted asset additions) for user approval.

---

## 2. The 9-Step Asset-to-Game Integration Pipeline

| Step | Action | Concrete Tools & Outputs |
| --- | --- | --- |
| **1. Inspect** | Scan folder structure, file types, image dimensions, audio formats, naming conventions, duplicates. Run `tools/asset_inspector.py` + visually view sheets via `read_file`. | Raw pixel report (`W×H`, alpha style, palette swatches, luminance range, candidate grid sizes) + direct visual notes |
| **2. Classify** | Assign true visual & functional roles dynamically matching the real kit: Ground, Platforms, Walls, Outer/Inner Corners, Edges, Transitions, Backgrounds, Foreground, Props, Characters, VFX, UI, Audio. | Populated **9-Field Asset Catalog** (`docs/project-memory/05-asset-catalog.md`) |
| **3. Analyze** | Audit cross-asset compatibility: pixel/texel scale (zero mixels!), outline weight, perspective angle, key-light direction (safe flip eligibility!), transparency edge quality, color harmony, animation frame sizes. | Compatibility Matrix (works together cleanly vs. needs adjustment vs. incompatible) |
| **4. Map** | Map exact atlas cell coordinates `(col, row)`, terrain bitmask connectivity (16-tile solid mass vs. 47-tile thin walls), sprite pivot points, hitbox bounds, and animation frame ranges. | Tile/Sprite Coordinate Map & Terrain Bitmask Plan |
| **5. Plan** | Design Godot layer architecture (`BackgroundLayer`, `GroundLayer`, `WallCollisionLayer`, `ShadowDecalLayer`, `YSortActorsProps`, `CanopyOverlayLayer`) and modular variation budget (breaking grid repetition cleanly). | Environment Construction Plan aligned with Level Metrics |
| **6. Implement** | Configure Godot import settings (`Nearest` vs. `Linear`, mipmaps, compression), build `TileSet` (`use_texture_padding = true`, Terrains, physics polygons, `custom_data` surface tags), `SpriteFrames`, and `StyleBoxTexture` 9-slices non-destructively. | Clean Godot `.tres` resources & modular scenes |
| **7. Validate** | Build a compact **Kit Torture-Test Room** exercising every straight edge, convex pillar corner, concave alcove corner, floor variant, collision seam, and actor silhouette contrast! Inspect visually (`read_file` on rendered screenshot/preview) & run `verify_labs.py` / Godot runtime checks. | Seam, Collision, Alignment & 5-Band Grayscale Squint Verification |
| **8. Refine** | Fix miter glitches, padding bleed, repetitive floor checkerboarding, misaligned pivots, or overly tight collision boxes; tune lighting/contact shadows to ground assets naturally. | Verified Pass 2 clean environment/sprite integration |
| **9. Document** | Record final atlas IDs, layer conventions, `custom_data` keys, safe variations, and known limitations permanently. | Updated `05-asset-catalog.md`, `04-technical-architecture.md`, `19-known-limitations.md` |

---

## 3. Ready Studio Command Reference
```bash
# Step 1: Automated pixel forensics & 9-field Asset Inventory scaffold
/tmp/gdtools-venv/bin/python tools/asset_inspector.py <assets_path> --tile-size <N> --markdown docs/project-memory/05-asset-catalog.md
```
*(Always follow Step 1 immediately by visually inspecting key tilesets/spritesheets via `read_file` to confirm perspective, lighting direction, inner corners, and artistic cohesion!)*
