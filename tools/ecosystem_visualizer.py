#!/usr/bin/env python3
"""Ecosystem Food-Web & Biome Climate Distribution Visualizer (Phase 4 Studio Tool #3).

Generates two analytical visual artifacts directly from docs/concept/data/*.json:
  1. docs/concept/visuals/world_biome_climate_map.png
     (Whittaker-style Moisture x Temperature Biome Chart with real biome swatches & adjacency edges)
  2. docs/concept/visuals/ecosystem_foodweb_graph.png
     (4-Column Trophic & Ecological Interaction Graph: Weather -> Flora -> Herbivores -> Predators/Keystones)
"""

from __future__ import annotations

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


def render_climate_map(biomes: list[dict], out_path: Path) -> None:
    w, h = 1120, 620
    img = Image.new("RGB", (w, h), (18, 22, 28))
    draw = ImageDraw.Draw(img)

    margin_l, margin_t, margin_b = 82, 62, 68
    plot_w = 690
    plot_h = h - margin_t - margin_b

    draw.text((margin_l, 18), "OURA-IV - Whittaker Climate Distribution & World Adjacency Graph (12 Core Biomes)", fill=(238, 242, 248))
    draw.rectangle([margin_l, margin_t, margin_l + plot_w, margin_t + plot_h], fill=(24, 29, 38), outline=(72, 82, 98))

    # Grid lines: Moisture 0.0..1.0 (X), Temp -20..50 C (Y)
    for step in range(0, 11, 2):
        m = step / 10.0
        gx = int(margin_l + m * plot_w)
        draw.line([(gx, margin_t), (gx, margin_t + plot_h)], fill=(38, 46, 58))
        draw.text((gx - 12, margin_t + plot_h + 10), f"{int(m*100)}%", fill=(170, 182, 198))
    draw.text((margin_l + plot_w // 2 - 80, h - 28), "MOISTURE / HUMIDITY (%)", fill=(210, 220, 232))

    for temp in (-20, -10, 0, 10, 20, 30, 40, 50):
        norm_y = (temp - (-20)) / 70.0
        gy = int(margin_t + plot_h - norm_y * plot_h)
        draw.line([(margin_l, gy), (margin_l + plot_w, gy)], fill=(38, 46, 58))
        draw.text((margin_l - 42, gy - 6), f"{temp}C", fill=(170, 182, 198))
    draw.text((14, margin_t + plot_h // 2 - 20), "TEMP\n(C)", fill=(210, 220, 232))

    coords: dict[str, tuple[int, int]] = {}
    for b in biomes:
        nx = max(0.05, min(0.95, b["moisture"]))
        ny = max(0.05, min(0.95, (b["temp_c"] - (-20)) / 70.0))
        cx = int(margin_l + nx * plot_w)
        cy = int(margin_t + plot_h - ny * plot_h)
        coords[b["id"]] = (cx, cy)

    # Draw adjacency edges first
    drawn_edges: set[tuple[str, str]] = set()
    for b in biomes:
        for nb in b["adjacent"]:
            if nb in coords:
                edge = tuple(sorted((b["id"], nb)))
                if edge not in drawn_edges:
                    drawn_edges.add(edge)
                    draw.line([coords[b["id"]], coords[nb]], fill=(92, 118, 148), width=2)

    # Draw numbered biome nodes (zero text overlap!) + crisp right-hand index directory
    tier_rings = {1: (120, 230, 150), 2: (110, 200, 245), 3: (245, 200, 95), 4: (250, 110, 95)}
    sx = margin_l + plot_w + 26
    sy = margin_t
    draw.text((sx, sy - 20), "BIOME DIRECTORY (ID / TIER / CLIMATE)", fill=(150, 212, 238))

    for idx, b in enumerate(biomes, start=1):
        cx, cy = coords[b["id"]]
        fill = hex_to_rgb(b["palette"]["band3_ground"])
        ring = tier_rings[b["tier"]]
        r = 15
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill, outline=ring, width=3)
        num_txt = f"{idx:02d}"
        draw.text((cx - 6, cy - 5), num_txt, fill=(250, 250, 250) if sum(fill) < 420 else (18, 22, 28))

        ry = sy + (idx - 1) * 40
        draw.ellipse([sx, ry + 4, sx + 22, ry + 26], fill=fill, outline=ring, width=2)
        draw.text((sx + 5, ry + 10), num_txt, fill=(250, 250, 250) if sum(fill) < 420 else (18, 22, 28))
        draw.text((sx + 30, ry + 2), f"[T{b['tier']}] {b['name']}", fill=(236, 240, 246))
        draw.text((sx + 30, ry + 16), f"{b['elevation']} | {b['temp_c']}C | {int(b['moisture']*100)}% moisture", fill=(158, 172, 190))

    draw.text((margin_l, 40), "Tier Rings:  T1=Green (Safe)   T2=Cyan (Bio-Filter)   T3=Gold (Envelope/Skiff)   T4=Coral (Endgame)", fill=(185, 198, 212))

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path)


def render_foodweb_graph(flora: list[dict], fauna: list[dict], weather: list[dict], out_path: Path) -> None:
    # Select representative slice cleanly readable without visual soup (8 weather, 12 key flora, 12 key fauna)
    w, h = 1140, 720
    img = Image.new("RGB", (w, h), (16, 19, 25))
    draw = ImageDraw.Draw(img)
    draw.text((24, 14), "OURA-IV - Trophic Food-Web & Dynamic Weather Coupling (Sampled Ecological Spine)", fill=(238, 242, 248))

    col_x = [30, 310, 610, 895]
    headers = ["PLANETARY WEATHER (8)", "PRODUCERS / FLORA (12 Key)", "CONSUMERS / SYMBIOTES (10)", "PREDATORS & KEYSTONES (10)"]
    for cx, hdr in zip(col_x, headers):
        draw.text((cx, 40), hdr, fill=(140, 210, 235))

    flora_key = flora[:12]
    herb_fauna = [a for a in fauna if a["role"] not in ("predator", "legendary_keystone", "legendary_symbiote", "legendary_non_aggressive_hazard")][:10]
    pred_fauna = [a for a in fauna if a not in herb_fauna][:10]

    node_pos: dict[str, tuple[int, int]] = {}
    box_w, box_h = 218, 28

    def draw_col(items: list[dict], x: int, name_key: str, fill: tuple[int, int, int], outline: tuple[int, int, int]) -> None:
        step = (h - 90) // max(1, len(items))
        for i, item in enumerate(items):
            y = 66 + i * step
            node_pos[item["id"]] = (x, y)
            draw.rectangle([x, y, x + box_w, y + box_h], fill=fill, outline=outline)
            raw_txt = item[name_key].split("(")[0].strip()
            txt = raw_txt[:32]
            draw.text((x + 6, y + 8), txt, fill=(238, 242, 246))

    draw_col(weather, col_x[0], "name", (34, 42, 62), (96, 140, 210))
    draw_col(flora_key, col_x[1], "common_name", (30, 56, 44), (92, 188, 128))
    draw_col(herb_fauna, col_x[2], "common_name", (54, 48, 28), (220, 186, 86))
    draw_col(pred_fauna, col_x[3], "common_name", (64, 30, 36), (235, 102, 92))

    # Draw Weather -> Flora biome overlap links (subtle)
    for wx in weather:
        wx_b = set(wx["biomes"])
        x1, y1 = node_pos[wx["id"]]
        for fl in flora_key:
            if wx_b & set(fl["biomes"]):
                x2, y2 = node_pos[fl["id"]]
                draw.line([(x1 + box_w, y1 + box_h // 2), (x2, y2 + box_h // 2)], fill=(54, 72, 102), width=1)

    # Draw Flora/Prey -> Fauna diet trophic arrows
    for group, edge_col in ((herb_fauna, (108, 196, 134)), (pred_fauna, (238, 126, 98))):
        for a in group:
            x2, y2 = node_pos[a["id"]]
            for food_id in a["diet"]:
                if food_id in node_pos:
                    x1, y1 = node_pos[food_id]
                    draw.line([(x1 + box_w, y1 + box_h // 2), (x2, y2 + box_h // 2)], fill=edge_col, width=2)

    # Re-draw labels cleanly on top of lines for crisp readability
    draw_col(weather, col_x[0], "name", (34, 42, 62), (96, 140, 210))
    draw_col(flora_key, col_x[1], "common_name", (30, 56, 44), (92, 188, 128))
    draw_col(herb_fauna, col_x[2], "common_name", (54, 48, 28), (220, 186, 86))
    draw_col(pred_fauna, col_x[3], "common_name", (64, 30, 36), (235, 102, 92))

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path)


def main() -> int:
    data_dir = Path("docs/concept/data")
    biomes = json.loads((data_dir / "biomes.json").read_text(encoding="utf-8"))["biomes"]
    flora = json.loads((data_dir / "flora.json").read_text(encoding="utf-8"))["flora"]
    fauna = json.loads((data_dir / "fauna.json").read_text(encoding="utf-8"))["fauna"]
    weather = json.loads((data_dir / "weather.json").read_text(encoding="utf-8"))["planetary_events"]

    render_climate_map(biomes, Path("docs/concept/visuals/world_biome_climate_map.png"))
    render_foodweb_graph(flora, fauna, weather, Path("docs/concept/visuals/ecosystem_foodweb_graph.png"))
    print("Generated world_biome_climate_map.png and ecosystem_foodweb_graph.png")
    return 0


if __name__ == "__main__":
    sys.exit(main())
