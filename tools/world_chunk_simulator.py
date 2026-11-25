#!/usr/bin/env python3
"""Hybrid Handcrafted-Landmark + Ecological-Niche World Chunk Simulator (Phase 4 Studio Tool #4).

Proves Part 5 technical feasibility for large painterly pixel-art worlds in Godot 4:
  - Simulates a 64x64 tile chunk (1024x1024 px world space @ 16px/tile) spanning the
    Vertical Slice ecotone (Amber Kelp Littoral -> Singing Reedwood Canopy).
  - Applies deterministic multi-octave terrain elevation & coastal river carving.
  - Stamps a protected Handcrafted Hero Landmark mask ("Drop-Pod Crash Clearing + Relay Arch")
    proving procedural flora NEVER overlaps or obscures hero compositions.
  - Runs Poisson-disc minimum-spacing ecological niche placement (each species spawns ONLY in
    biologically valid elevation/moisture strata).
  - Measures exact serialized chunk JSON footprint & entity budget, and renders a crisp visual
    preview PNG for direct visual inspection via read_file.
"""

from __future__ import annotations

import json
import math
import random
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("ERROR: Pillow required. Run via /tmp/gdtools-venv/bin/python", file=sys.stderr)
    sys.exit(2)

CHUNK = 64
SEED = 41904


def smooth_noise(x: float, y: float) -> float:
    return (
        0.52 * math.sin(x * 0.11 + 0.4) * math.cos(y * 0.09 - 0.3)
        + 0.28 * math.sin(x * 0.23 - y * 0.17 + 1.1)
        + 0.20 * math.cos((x + y) * 0.31)
    )


def simulate_chunk() -> tuple[list[list[str]], list[dict], dict]:
    rng = random.Random(SEED)
    terrain: list[list[str]] = [["sand" for _ in range(CHUNK)] for _ in range(CHUNK)]
    landmark_mask = [[False for _ in range(CHUNK)] for _ in range(CHUNK)]

    # 1. Elevation + Coastline + Winding River Carving
    for y in range(CHUNK):
        for x in range(CHUNK):
            # West coast -> East elevated Singing Reedwood ridge
            coast_grad = (x / float(CHUNK)) * 1.35 + smooth_noise(x, y) * 0.26
            river_center = 28 + int(6.5 * math.sin(y * 0.13 + 0.8))
            in_river = abs(x - river_center) <= 2 and y > 18
            if coast_grad < 0.28:
                terrain[y][x] = "deep_water"
            elif coast_grad < 0.42 or in_river:
                terrain[y][x] = "shallow_water"
            elif coast_grad < 0.58:
                terrain[y][x] = "sand"
            elif coast_grad < 0.94:
                terrain[y][x] = "meadow"
            else:
                terrain[y][x] = "ridge"

    # 2. Stamp Protected Handcrafted Hero Landmark (Drop-Pod Clearing & Broken Relay Arch)
    lx0, ly0, lw, lh = 34, 10, 14, 12
    for y in range(ly0, ly0 + lh):
        for x in range(lx0, lx0 + lw):
            terrain[y][x] = "landmark_clearing"
            landmark_mask[y][x] = True

    # 3. Poisson-Disc Ecological Niche Placement (separate Flora & Fauna spacing layers!)
    entities: list[dict] = []
    flora_pts: list[tuple[int, int, int]] = []
    fauna_pts: list[tuple[int, int, int]] = []

    def can_place(x: int, y: int, min_dist: int, layer_pts: list[tuple[int, int, int]]) -> bool:
        if landmark_mask[y][x]:
            return False
        for ox, oy, od in layer_pts:
            if (x - ox) ** 2 + (y - oy) ** 2 < max(min_dist, od) ** 2:
                return False
        return True

    niche_rules = [
        ("fl_03_flute_reed", "flora", {"meadow", "ridge"}, 4, 48),
        ("fl_01_amber_kelp", "flora", {"shallow_water"}, 3, 36),
        ("fl_04_sun_nectar_pod", "flora", {"meadow"}, 4, 24),
        ("fl_02_salt_glasswort", "flora", {"sand"}, 3, 28),
        ("fa_01_shore_strider", "fauna", {"sand", "shallow_water"}, 8, 5),
        ("fa_03_chime_glider", "fauna", {"meadow", "ridge"}, 10, 4),
    ]

    for species_id, layer_kind, valid_terrains, min_dist, target_count in niche_rules:
        layer_pts = flora_pts if layer_kind == "flora" else fauna_pts
        placed = 0
        for _ in range(target_count * 35):
            if placed >= target_count:
                break
            x = rng.randint(2, CHUNK - 3)
            y = rng.randint(2, CHUNK - 3)
            if terrain[y][x] in valid_terrains and can_place(x, y, min_dist, layer_pts):
                layer_pts.append((x, y, min_dist))
                entities.append({"species": species_id, "layer": layer_kind, "tile": [x, y], "terrain": terrain[y][x]})
                placed += 1

    # Measure serialized chunk size (matching Godot binary/JSON chunk streaming budget!)
    chunk_payload = {
        "chunk_coord": [0, 0],
        "biome_ecotone": "amber_kelp_coast->singing_canopy",
        "size_tiles": [CHUNK, CHUNK],
        "landmark_stamp": {"id": "lm_crash_pod_clearing", "rect": [lx0, ly0, lw, lh]},
        "entities": entities,
    }
    serialized_bytes = len(json.dumps(chunk_payload, separators=(",", ":")).encode("utf-8"))

    metrics = {
        "chunk_tiles": f"{CHUNK}x{CHUNK} ({CHUNK * CHUNK} tiles = {CHUNK * 16}x{CHUNK * 16} px)",
        "landmark_cells_protected": lw * lh,
        "landmark_violations": sum(
            1 for e in entities if landmark_mask[e["tile"][1]][e["tile"][0]]
        ),
        "total_entities": len(entities),
        "entity_json_kb": round(serialized_bytes / 1024.0, 2),
        "by_species": {
            r[0]: sum(1 for e in entities if e["species"] == r[0]) for r in niche_rules
        },
    }
    return terrain, entities, metrics


def render_chunk_preview(terrain: list[list[str]], entities: list[dict], metrics: dict, out_path: Path) -> None:
    scale = 8
    map_px = CHUNK * scale
    w, h = map_px + 280, map_px + 48
    img = Image.new("RGB", (w, h), (18, 21, 27))
    draw = ImageDraw.Draw(img)
    draw.text((16, 12), "64x64 Hybrid Chunk Proof - Protected Hero Landmark + Ecological Niche Poisson Placement", fill=(238, 242, 248))

    t_colors = {
        "deep_water": (28, 72, 92),
        "shallow_water": (54, 126, 138),
        "sand": (184, 154, 108),
        "meadow": (111, 138, 104),
        "ridge": (74, 104, 88),
        "landmark_clearing": (152, 138, 114),
    }

    ox, oy = 16, 36
    for y in range(CHUNK):
        for x in range(CHUNK):
            col = t_colors[terrain[y][x]]
            draw.rectangle([ox + x * scale, oy + y * scale, ox + (x + 1) * scale - 1, oy + (y + 1) * scale - 1], fill=col)

    # Outline handcrafted Hero Landmark box + pod silhouette
    lx0, ly0, lw, lh = 34, 10, 14, 12
    draw.rectangle(
        [ox + lx0 * scale, oy + ly0 * scale, ox + (lx0 + lw) * scale, oy + (ly0 + lh) * scale],
        outline=(255, 198, 72),
        width=2,
    )
    draw.ellipse([ox + (lx0 + 4) * scale, oy + (ly0 + 4) * scale, ox + (lx0 + 10) * scale, oy + (ly0 + 8) * scale], fill=(235, 232, 224), outline=(36, 44, 58), width=2)
    draw.text((ox + (lx0 + 1) * scale, oy + (ly0 + 1) * scale), "HERO POD", fill=(255, 230, 140))

    # Draw ecologically placed entities
    e_styles = {
        "fl_03_flute_reed": ((34, 68, 52), 4),
        "fl_01_amber_kelp": ((228, 152, 54), 3),
        "fl_04_sun_nectar_pod": ((255, 214, 78), 3),
        "fl_02_salt_glasswort": ((214, 236, 224), 2),
        "fa_01_shore_strider": ((255, 92, 66), 4),
        "fa_03_chime_glider": ((92, 236, 245), 4),
    }
    for e in entities:
        tx, ty = e["tile"]
        col, rad = e_styles[e["species"]]
        cx, cy = ox + tx * scale + scale // 2, oy + ty * scale + scale // 2
        draw.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], fill=col, outline=(18, 22, 28))

    # Right sidebar legend + telemetry
    sx = ox + map_px + 18
    sy = oy
    draw.text((sx, sy), "ECOLOGICAL NICHE LEGEND", fill=(150, 212, 238))
    sy += 22
    for label, col in [
        ("Deep / Shallow Water", (54, 126, 138)),
        ("Littoral Sand", (184, 154, 108)),
        ("Lowland Meadow", (111, 138, 104)),
        ("Reedwood Ridge", (74, 104, 88)),
        ("Hero Landmark Mask", (255, 198, 72)),
    ]:
        draw.rectangle([sx, sy, sx + 14, sy + 14], fill=col)
        draw.text((sx + 22, sy + 1), label, fill=(225, 230, 238))
        sy += 22

    sy += 10
    draw.text((sx, sy), "SPECIES SPAWNS (POISSON)", fill=(150, 212, 238))
    sy += 22
    for sp, cnt in metrics["by_species"].items():
        col, _ = e_styles[sp]
        draw.ellipse([sx + 2, sy + 2, sx + 12, sy + 12], fill=col)
        draw.text((sx + 20, sy), f"{sp}: {cnt}", fill=(225, 230, 238))
        sy += 20

    sy += 14
    draw.text((sx, sy), "CHUNK STREAMING TELEMETRY", fill=(150, 212, 238))
    sy += 22
    for line in [
        f"Grid: {CHUNK}x{CHUNK} tiles",
        f"World: {CHUNK*16}x{CHUNK*16} px",
        f"Entities: {metrics['total_entities']}",
        f"Entity JSON: {metrics['entity_json_kb']} KB",
        f"Landmark Overlaps: {metrics['landmark_violations']}",
    ]:
        draw.text((sx, sy), line, fill=(215, 240, 200))
        sy += 19

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path)


def main() -> int:
    terrain, entities, metrics = simulate_chunk()
    out_png = Path("docs/concept/visuals/chunk_distribution_proof.png")
    render_chunk_preview(terrain, entities, metrics, out_png)
    print("=== Hybrid World Chunk Distribution Proof ===")
    print(json.dumps(metrics, indent=2))
    print(f"Saved visual chunk proof -> {out_png}")
    return 1 if metrics["landmark_violations"] > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
