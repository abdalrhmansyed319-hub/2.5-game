# `game/assets/` — Production Art & Media Intake

- **Pixel Standards (`docs/concept/14-art-direction-and-pixel-art-bible.md`)**: `16×16` structural tile grid, `16×24` Dr. Mara Lin default scale, strict `Nearest` texture filtering (`default_texture_filter=0`), zero mixels, 5-Band figure-ground readability (`tools/palette_director.py`).
- **Intake Gate**: All real visual assets added here must match [`docs/asset-production/ASSET_REQUESTS.md`](../../docs/asset-production/ASSET_REQUESTS.md), pass `tools/asset_inspector.py` + direct visual review, and keep their Godot `*.import` sidecar files committed in Git.
- **Current Contents**: `icon.svg` (custom *VERDANT SIGNAL* vector project emblem). No placeholder mass assets added.
