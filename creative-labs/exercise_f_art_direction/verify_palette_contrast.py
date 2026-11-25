#!/usr/bin/env python3
"""5-Band Art Direction & Grayscale Squint-Test Study Generator (Exercise F).

Evaluates two contrasting fictional regional mood palettes against the 5-Band
Value Hierarchy & WCAG figure-ground luminance contrast thresholds, and renders
a crisp visual comparison card (Color + Desaturated Grayscale Squint Test) for
direct visual inspection via read_file.
"""

from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw

OUT_DIR = Path(__file__).resolve().parent

# Band 1: Distant Sky/Parallax | Band 2: BG Arch | Band 3: Playable Ground | Band 4: Actor | Band 5: Hazard/Focal
PALETTES: dict[str, list[tuple[str, tuple[int, int, int]]]] = {
    "Mood A - Arid Sun-Kiln (Warm Day)": [
        ("B1 Sky/Parallax", (196, 206, 212)),
        ("B2 BG Masonry", (166, 158, 146)),
        ("B3 Playable Ground", (124, 114, 100)),
        ("B4 Actor Silhouette", (36, 44, 58)),
        ("B5 Hazard / Telegraph", (232, 82, 46)),
    ],
    "Mood B - Deep Sluice Vault (Cool Night)": [
        ("B1 Cavern Void", (18, 28, 38)),
        ("B2 BG Arches", (34, 49, 62)),
        ("B3 Playable Stone", (64, 82, 94)),
        ("B4 Actor Silhouette", (236, 224, 198)),
        ("B5 Hazard / Telegraph", (78, 232, 218)),
    ],
}


def srgb_to_linear(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def wcag_luminance(rgb: tuple[int, int, int]) -> float:
    r, g, b = (srgb_to_linear(v / 255.0) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_ratio(c1: tuple[int, int, int], c2: tuple[int, int, int]) -> float:
    l1, l2 = wcag_luminance(c1), wcag_luminance(c2)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)


def to_grayscale(rgb: tuple[int, int, int]) -> tuple[int, int, int]:
    y = int(round(0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]))
    return (y, y, y)


def render_study_card() -> None:
    w, h = 860, 440
    img = Image.new("RGB", (w, h), (22, 24, 28))
    draw = ImageDraw.Draw(img)

    y_offset = 24
    for title, bands in PALETTES.items():
        b1, b2, b3, b4, b5 = (b[1] for b in bands)
        cr_actor_bg = contrast_ratio(b4, b2)
        cr_actor_ground = contrast_ratio(b4, b3)
        cr_hazard_bg = contrast_ratio(b5, b2)
        print(
            f"{title}: Actor-vs-BG={cr_actor_bg:.2f}:1 | "
            f"Actor-vs-Ground={cr_actor_ground:.2f}:1 | Hazard-vs-BG={cr_hazard_bg:.2f}:1"
        )

        # Left half: Color Scene Mockup; Right half: Grayscale Squint Test Mockup
        for col_idx, grayscale in enumerate((False, True)):
            x0 = 24 + col_idx * 416
            swatches = [to_grayscale(c) if grayscale else c for _, c in bands]
            c_sky, c_bg, c_ground, c_actor, c_hazard = swatches

            # Scene box (392 x 136)
            box_w, box_h = 392, 136
            draw.rectangle([x0, y_offset + 22, x0 + box_w, y_offset + 22 + box_h], fill=c_sky)
            # Distant BG architectural pillars (Band 2)
            for px in (36, 136, 252, 336):
                draw.rectangle([x0 + px, y_offset + 42, x0 + px + 36, y_offset + 126], fill=c_bg)
            # Playable ground shelf (Band 3) + crisp top edge
            draw.rectangle([x0, y_offset + 114, x0 + box_w, y_offset + 158], fill=c_ground)
            # Actor silhouette (Band 4: rounded circle + body)
            ax, ay = x0 + 110, y_offset + 82
            draw.rectangle([ax, ay + 10, ax + 18, ay + 32], fill=c_actor)
            draw.ellipse([ax + 2, ay - 2, ax + 16, ay + 12], fill=c_actor)
            # Hazard telegraph triangle (Band 5: acute shape + dark silhouette rim for bright daylight readability!)
            hx, hy = x0 + 275, y_offset + 86
            tri = [(hx + 14, hy), (hx, hy + 28), (hx + 28, hy + 28)]
            outline_col = to_grayscale((28, 22, 26)) if grayscale else (28, 22, 26)
            draw.polygon(tri, fill=c_hazard, outline=outline_col, width=3)

            # 5 Swatch chips below scene
            chip_w = box_w // 5
            for idx, sw in enumerate(swatches):
                cx = x0 + idx * chip_w
                draw.rectangle([cx, y_offset + 162, cx + chip_w - 4, y_offset + 184], fill=sw)

            label = f"{title} [{'GRAYSCALE SQUINT' if grayscale else 'COLOR'}]"
            draw.text((x0 + 4, y_offset + 4), label, fill=(230, 232, 236))

        y_offset += 212

    img.save(OUT_DIR / "art_direction_5band_study.png")
    print("Saved art_direction_5band_study.png")


if __name__ == "__main__":
    render_study_card()
