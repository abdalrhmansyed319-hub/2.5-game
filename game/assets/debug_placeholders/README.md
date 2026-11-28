# Temporary Debug Placeholder Assets (NON-FINAL — DO NOT SHIP)

> **STRICT WARNING**: Every image inside `game/assets/debug_placeholders/` is **TEMPORARY GEOMETRIC DEBUG ART** created solely so Milestone 01 movement, `TileMapLayer` streaming, Y-sorting, canopy occlusion, and Acoustic Field Lens systems can be engineered and tested independently while production pixel art (`AST-001`–`AST-007`) is being created.
>
> - **Visual Prototype Gate Rule**: The Stage 05 Visual Prototype Gate **CANNOT PASS** while any file in this directory is referenced by `game/`.
> - **Drop-In Layout Parity**: Every file here uses the **exact audited v2.0 pixel dimensions, cell grids, pivot anchors, and unused-cell regions** specified in [`docs/asset-production/ASSET_REQUESTS.md`](../../../docs/asset-production/ASSET_REQUESTS.md) so swapping in approved final artwork requires zero gameplay code changes.

| Temporary Debug File | Dimensions | Production Replacement |
| --- | :---: | --- |
| `debug_placeholder_char_mara_lin_sheet.png` | `96 × 384 px` | `game/assets/characters/player/char_mara_lin_sheet.png` (`AST-001`) |
| `debug_placeholder_env_amber_coast_ground_tileset.png` | `192 × 128 px` | `game/assets/world/tilesets/env_amber_coast_ground_tileset.png` (`AST-002`) |
| `debug_placeholder_env_singing_canopy_ground_tileset.png` | `192 × 96 px` | `game/assets/world/tilesets/env_singing_canopy_ground_tileset.png` (`AST-003`) |
| `debug_placeholder_prop_singing_reedwood_tree_sheet.png` | `96 × 160 px` | `game/assets/world/props/prop_singing_reedwood_tree_sheet.png` (`AST-004`) |
| `debug_placeholder_prop_rimlands_flora_sheet.png` | `64 × 128 px` | `game/assets/world/flora/prop_rimlands_flora_sheet.png` (`AST-005`) |
| `debug_placeholder_prop_drop_pod_landmark_sheet.png` | `96 × 64 px` | `game/assets/world/landmarks/prop_drop_pod_landmark_sheet.png` (`AST-006`) |
| `debug_placeholder_fx_shadows_ripples_lens_sheet.png` | `128 × 96 px` | `game/assets/vfx/fx_shadows_ripples_lens_sheet.png` (`AST-007`) |
