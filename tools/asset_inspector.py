#!/usr/bin/env python3
"""Asset Intelligence Analyzer CLI (Phase 2 — Section 5 Asset Analysis Tool).

Inspects user-provided or training PNG/image visual assets and extracts objective
forensic metadata:
  - Canvas dimensions, color mode, transparency ratio & alpha edge type (binary vs soft)
  - Unique color count, top dominant hex palette swatches, luminance range (5-band check)
  - Candidate tile-grid dimensions (8/16/24/32/48/64), active non-empty cell count,
    and per-tile border continuity hints (solid fill vs bordered/corner cells)
  - Optional structured Markdown Asset Inventory output matching Section 5D (9 fields)

Usage:
  python3 tools/asset_inspector.py <file_or_directory> [--tile-size 16] [--markdown out.md]
"""

from __future__ import annotations

import argparse
import json
import statistics
import sys
from collections import Counter
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print(
        "ERROR: Pillow (PIL) is required. Run with /tmp/gdtools-venv/bin/python or install pillow.",
        file=sys.stderr,
    )
    sys.exit(2)

SUPPORTED_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".bmp"}
CANDIDATE_TILE_SIZES = (8, 12, 16, 24, 32, 48, 64)


def rgb_to_hex(rgb: tuple[int, int, int]) -> str:
    return "#{:02X}{:02X}{:02X}".format(*rgb)


def relative_luminance(rgb: tuple[int, int, int]) -> float:
    return (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255.0


def infer_tile_candidates(width: int, height: int) -> list[int]:
    return [s for s in CANDIDATE_TILE_SIZES if width % s == 0 and height % s == 0]


def analyze_grid(img: Image.Image, tile_size: int) -> dict:
    w, h = img.size
    if tile_size <= 0 or w % tile_size != 0 or h % tile_size != 0:
        return {"compatible": False, "tile_size": tile_size}

    cols = w // tile_size
    rows = h // tile_size
    rgba = img.convert("RGBA")
    px = rgba.load()

    non_empty_cells = 0
    edge_summary: list[dict] = []

    for r in range(rows):
        for c in range(cols):
            x0, y0 = c * tile_size, r * tile_size
            opaque = 0
            border_lums: dict[str, list[float]] = {"N": [], "S": [], "W": [], "E": []}
            interior_lums: list[float] = []

            for dy in range(tile_size):
                for dx in range(tile_size):
                    red, grn, blu, alpha = px[x0 + dx, y0 + dy]
                    if alpha > 0:
                        opaque += 1
                        lum = relative_luminance((red, grn, blu))
                        if dy == 0:
                            border_lums["N"].append(lum)
                        if dy == tile_size - 1:
                            border_lums["S"].append(lum)
                        if dx == 0:
                            border_lums["W"].append(lum)
                        if dx == tile_size - 1:
                            border_lums["E"].append(lum)
                        if 1 <= dx < tile_size - 1 and 1 <= dy < tile_size - 1:
                            interior_lums.append(lum)

            if opaque == 0:
                continue
            non_empty_cells += 1
            mean_int = statistics.fmean(interior_lums) if interior_lums else 0.0
            contrasted_edges = []
            for side, vals in border_lums.items():
                if not vals:
                    continue
                if abs(statistics.fmean(vals) - mean_int) >= 0.07:
                    contrasted_edges.append(side)

            edge_summary.append(
                {
                    "cell": [c, r],
                    "opaque_ratio": round(opaque / (tile_size * tile_size), 3),
                    "contrasted_edges": contrasted_edges,
                }
            )

    return {
        "compatible": True,
        "tile_size": tile_size,
        "cols": cols,
        "rows": rows,
        "total_cells": cols * rows,
        "non_empty_cells": non_empty_cells,
        "cells": edge_summary,
    }


def inspect_image(path: Path, forced_tile_size: int | None = None) -> dict:
    with Image.open(path) as img:
        orig_mode = img.mode
        w, h = img.size
        rgba = img.convert("RGBA")
        pixels = list(rgba.get_flattened_data()) if hasattr(rgba, "get_flattened_data") else list(rgba.getdata())

    total_px = len(pixels)
    transparent_px = 0
    semi_transparent_px = 0
    opaque_colors: Counter[tuple[int, int, int]] = Counter()
    luminances: list[float] = []

    for r, g, b, a in pixels:
        if a == 0:
            transparent_px += 1
        else:
            if a < 255:
                semi_transparent_px += 1
            rgb = (r, g, b)
            opaque_colors[rgb] += 1
            luminances.append(relative_luminance(rgb))

    alpha_style = "opaque"
    if transparent_px > 0 or semi_transparent_px > 0:
        alpha_style = "soft_antialiased_alpha" if semi_transparent_px > 0 else "binary_pixel_alpha"

    dominant_palette = [
        {"hex": rgb_to_hex(rgb), "count": cnt, "share_pct": round(100.0 * cnt / max(1, total_px - transparent_px), 2)}
        for rgb, cnt in opaque_colors.most_common(12)
    ]

    lum_stats = {
        "min": round(min(luminances), 3) if luminances else 0.0,
        "median": round(statistics.median(luminances), 3) if luminances else 0.0,
        "max": round(max(luminances), 3) if luminances else 0.0,
        "std": round(statistics.pstdev(luminances), 3) if len(luminances) > 1 else 0.0,
    }

    tile_candidates = infer_tile_candidates(w, h)
    chosen_tile = forced_tile_size if forced_tile_size else (16 if 16 in tile_candidates else (tile_candidates[-1] if tile_candidates else None))
    grid_info = analyze_grid(rgba, chosen_tile) if chosen_tile else {"compatible": False}

    return {
        "filename": path.as_posix(),
        "width": w,
        "height": h,
        "color_mode": orig_mode,
        "alpha_style": alpha_style,
        "transparent_pct": round(100.0 * transparent_px / max(1, total_px), 2),
        "unique_opaque_colors": len(opaque_colors),
        "dominant_palette": dominant_palette,
        "luminance": lum_stats,
        "candidate_tile_sizes": tile_candidates,
        "grid_analysis": grid_info,
    }


def render_markdown_inventory(records: list[dict], base_dir: Path) -> str:
    lines = [
        "# Automated Asset Intelligence Inventory",
        "",
        "> Generated via `tools/asset_inspector.py`. Quantitative technical forensics below are",
        "> verified directly from source image pixels. Qualitative artistic notes (perspective,",
        "> lighting direction, intended gameplay semantics) must be confirmed via visual inspection.",
        "",
    ]
    for rec in records:
        p = Path(rec["filename"])
        try:
            rel = p.resolve().relative_to(base_dir.resolve()).as_posix()
        except ValueError:
            rel = p.name
        grid = rec["grid_analysis"]
        grid_desc = (
            f"{grid['tile_size']}×{grid['tile_size']} px ({grid['cols']} cols × {grid['rows']} rows, "
            f"{grid['non_empty_cells']}/{grid['total_cells']} non-empty cells)"
            if grid.get("compatible")
            else f"Non-uniform / candidate divisors: {rec['candidate_tile_sizes']}"
        )
        swatches = ", ".join(f"`{c['hex']}` ({c['share_pct']}%)" for c in rec["dominant_palette"][:8])
        lum = rec["luminance"]

        lines.extend(
            [
                f"## Asset: `{rel}`",
                "",
                f"- **1. Asset Filename**: `{rel}`",
                f"- **2. Asset Type**: `{'tileset / atlas candidate' if grid.get('compatible') and grid.get('total_cells', 0) > 1 else 'single image / sprite'}` *(confirm visually)*",
                f"- **3. Dimensions**: `{rec['width']} × {rec['height']} px` | Mode: `{rec['color_mode']}` | Grid: {grid_desc}",
                f"- **4. Visual Description (Forensic)**: `{rec['unique_opaque_colors']}` unique opaque colors; alpha: `{rec['alpha_style']}` (`{rec['transparent_pct']}%` transparent); luminance min/med/max/std = `{lum['min']} / {lum['median']} / {lum['max']} / {lum['std']}`; dominant swatches: {swatches}",
                "- **5. Intended Function**: *Requires visual inspection confirmation (see companion exercise notes).*",
                f"- **6. Possible Variations**: Flip/transpose eligibility depends on lighting direction symmetry; `{rec['unique_opaque_colors']}` palette entries allow clean palette/modulate shifts.",
                "- **7. Relationships with Other Assets**: Verify shared palette & texel scale against neighboring assets in same directory.",
                "- **8. Potential Uses**: TileMapLayer atlas source / Sprite2D / UI frame depending on confirmed visual role.",
                f"- **9. Known Limitations**: Candidate grid divisors `{rec['candidate_tile_sizes']}`; check inner corners & directional lighting before horizontal flipping.",
                "",
            ]
        )
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Inspect image assets and output Asset Intelligence metadata.")
    parser.add_argument("target", help="Image file or directory to inspect")
    parser.add_argument("--tile-size", type=int, default=None, help="Explicit tile size in px (e.g. 16)")
    parser.add_argument("--markdown", type=str, default=None, help="Write structured Markdown inventory to path")
    parser.add_argument("--json", action="store_true", help="Print JSON output to stdout")
    args = parser.parse_args()

    target = Path(args.target)
    if not target.exists():
        print(f"ERROR: Target not found: {target}", file=sys.stderr)
        return 1

    files = [target] if target.is_file() else sorted(p for p in target.rglob("*") if p.suffix.lower() in SUPPORTED_EXTS)
    if not files:
        print(f"ERROR: No supported image files found under {target}", file=sys.stderr)
        return 1

    records = [inspect_image(f, args.tile_size) for f in files]

    if args.markdown:
        out_path = Path(args.markdown)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(render_markdown_inventory(records, target.parent if target.is_file() else target), encoding="utf-8")

    if args.json or not args.markdown:
        print(json.dumps(records, indent=2))
    else:
        print(f"Inspected {len(records)} asset(s); Markdown inventory written to {args.markdown}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
