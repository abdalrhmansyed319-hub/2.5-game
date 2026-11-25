#!/usr/bin/env python3
"""Multi-Biome Painterly Palette & 5-Band Contrast Auditor (Phase 4 Studio Tool #2).

Audits all 12 Core Biomes in docs/concept/data/biomes.json for WCAG figure-ground
luminance contrast (Astronaut Silhouette Band 4 vs Background Band 2 & Ground Band 3,
plus Signal/Hazard Band 5 readability), and renders a visual 12-Biome Color Script
+ Desaturated Grayscale Squint-Test Master Sheet for direct visual inspection!
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("ERROR: Pillow required. Run via /tmp/gdtools-venv/bin/python", file=sys.stderr)
    sys.exit(2)


def hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def srgb_linear(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def wcag_lum(rgb: tuple[int, int, int]) -> float:
    r, g, b = (srgb_linear(v / 255.0) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_ratio(c1: tuple[int, int, int], c2: tuple[int, int, int]) -> float:
    l1, l2 = wcag_lum(c1), wcag_lum(c2)
    return (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)


def to_gray(rgb: tuple[int, int, int]) -> tuple[int, int, int]:
    y = int(round(0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.722 * 0 + 0.0722 * rgb[2]))
    return (y, y, y)


def render_master_sheet(biomes: list[dict], out_path: Path) -> tuple[list[str], list[dict]]:
    cols = 2
    rows = (len(biomes) + 1) // 2
    card_w, card_h = 460, 122
    pad = 16
    w = cols * card_w + (cols + 1) * pad
    h = rows * card_h + (rows + 1) * pad + 38

    img = Image.new("RGB", (w, h), (18, 20, 26))
    draw = ImageDraw.Draw(img)
    draw.text((pad, 12), "VERDANT SIGNAL (Oura-IV) - 12-Biome 5-Band Color Script & Grayscale Squint Audit", fill=(235, 238, 244))

    warnings: list[str] = []
    audit_rows: list[dict] = []

    for idx, b in enumerate(biomes):
        pal = b["palette"]
        c_sky = hex_to_rgb(pal["band1_sky"])
        c_bg = hex_to_rgb(pal["band2_bg"])
        c_gnd = hex_to_rgb(pal["band3_ground"])
        c_act = hex_to_rgb(pal["band4_actor"])
        c_sig = hex_to_rgb(pal["band5_signal"])
        c_wat = hex_to_rgb(pal["water"])

        cr_bg = contrast_ratio(c_act, c_bg)
        cr_gnd = contrast_ratio(c_act, c_gnd)
        cr_sig_gnd = contrast_ratio(c_sig, c_gnd)

        status = "PASS"
        if cr_bg < 4.5 or cr_gnd < 3.0:
            status = "WARN"
            warnings.append(f"{b['id']}: Actor contrast low (vs BG={cr_bg:.2f}:1, vs Ground={cr_gnd:.2f}:1)")

        audit_rows.append(
            {
                "biome": b["id"],
                "name": b["name"],
                "actor_vs_bg": round(cr_bg, 2),
                "actor_vs_ground": round(cr_gnd, 2),
                "signal_vs_ground": round(cr_sig_gnd, 2),
                "status": status,
            }
        )

        col = idx % cols
        row = idx // cols
        x0 = pad + col * (card_w + pad)
        y0 = 38 + pad + row * (card_h + pad)

        draw.rectangle([x0, y0, x0 + card_w, y0 + card_h], fill=(28, 31, 38), outline=(56, 62, 74))
        header = f"T{b['tier']} {b['name']} | Act/BG {cr_bg:.1f}:1 Act/Gnd {cr_gnd:.1f}:1 [{status}]"
        draw.text((x0 + 8, y0 + 6), header, fill=(230, 234, 240) if status == "PASS" else (255, 190, 90))

        # Draw Color Mini-Vista (left) and Grayscale Squint Mini-Vista (right)
        for panel_idx, gray in enumerate((False, True)):
            px0 = x0 + 8 + panel_idx * 226
            py0 = y0 + 24
            pw, ph = 216, 66
            sky = to_gray(c_sky) if gray else c_sky
            bg = to_gray(c_bg) if gray else c_bg
            gnd = to_gray(c_gnd) if gray else c_gnd
            act = to_gray(c_act) if gray else c_act
            sig = to_gray(c_sig) if gray else c_sig
            wat = to_gray(c_wat) if gray else c_wat

            # Sky + BG silhouettes + Water strip + Playable Ground
            draw.rectangle([px0, py0, px0 + pw, py0 + ph], fill=sky)
            draw.polygon([(px0 + 10, py0 + 44), (px0 + 55, py0 + 12), (px0 + 102, py0 + 44)], fill=bg)
            draw.polygon([(px0 + 118, py0 + 44), (px0 + 166, py0 + 8), (px0 + 210, py0 + 44)], fill=bg)
            draw.rectangle([px0, py0 + 42, px0 + pw, py0 + 52], fill=wat)
            draw.rectangle([px0, py0 + 50, px0 + pw, py0 + ph], fill=gnd)
            # Small Astronaut silhouette (Band 4) with visor dot
            ax, ay = px0 + 62, py0 + 36
            draw.rectangle([ax, ay + 6, ax + 9, ay + 18], fill=act)
            draw.ellipse([ax + 1, ay, ax + 8, ay + 7], fill=act)
            # Signal / Hazard Beacon (Band 5 with crisp contrasting dark/light rim)
            sx, sy = px0 + 150, py0 + 40
            rim = (20, 20, 24) if wcag_lum(c_gnd) > 0.22 else (245, 245, 245)
            rim_c = to_gray(rim) if gray else rim
            draw.polygon([(sx + 8, sy), (sx, sy + 16), (sx + 16, sy + 16)], fill=sig, outline=rim_c, width=2)

            # 6 Swatch bar directly below panel
            chips = [sky, bg, wat, gnd, act, sig]
            cw = pw // 6
            for ci, ch in enumerate(chips):
                draw.rectangle([px0 + ci * cw, py0 + ph + 4, px0 + (ci + 1) * cw - 2, py0 + ph + 18], fill=ch)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path)
    return warnings, audit_rows


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit multi-biome 5-band palettes and generate visual master sheet.")
    parser.add_argument("--biomes", default="docs/concept/data/biomes.json")
    parser.add_argument("--out", default="docs/concept/visuals/biome_palette_master_sheet.png")
    args = parser.parse_args()

    biomes = json.loads(Path(args.biomes).read_text(encoding="utf-8"))["biomes"]
    warnings, rows = render_master_sheet(biomes, Path(args.out))

    print("=== 12-Biome 5-Band Palette & Contrast Audit ===")
    for r in rows:
        print(
            f"  [{r['status']}] {r['biome']:20s} | Actor/BG={r['actor_vs_bg']:5.2f}:1 | "
            f"Actor/Gnd={r['actor_vs_ground']:5.2f}:1 | Sig/Gnd={r['signal_vs_ground']:5.2f}:1"
        )
    print(f"Saved master sheet -> {args.out} ({len(warnings)} contrast warnings)")
    return 1 if warnings else 0


if __name__ == "__main__":
    sys.exit(main())
