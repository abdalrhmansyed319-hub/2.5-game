#!/usr/bin/env python3
"""
VERDANT SIGNAL — Indexed-Palette Pixel Art Construction & QC Core
-----------------------------------------------------------------
Enforces strict pixel-art discipline:
  - Fixed 30-color hue-shifted Master Palette (from Style Guide Section 2)
  - Binary silhouette alpha only (A = 0 or A = 255; zero semi-transparent blur)
  - Layered indexed pixel canvas with editable JSON source export
  - Automated QC metrics: unique colors, orphan pixel detection, banding scan,
    grayscale value-separation preview, and 1x/4x nearest-neighbor review sheets.
"""

from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

import numpy as np
from PIL import Image

# ==============================================================================
# VERDANT SIGNAL MASTER PALETTE (30 Curated Hue-Shifted Colors)
# ==============================================================================
PALETTE_HEX: Dict[str, str] = {
    # Ramp A — Oversized Orange Astronaut Survival Suit
    "S0": "#231622",  # Deep crevice / cool plum-brown sel-out
    "S1": "#4F2425",  # Deep mahogany shadow fold
    "S2": "#873A2B",  # Warm burnt-sienna shadow turn
    "S3": "#C25B32",  # Primary expedition orange-terracotta midtone
    "S4": "#DE884A",  # Lit sunlit amber-orange upper plane
    "S5": "#EFC17C",  # Warm golden-peach sunlit crease rim

    # Ramp B — Dark Brown Harness, Straps, Gloves & Boots
    "B0": "#1B1420",  # Universal deepest cool plum-charcoal anchor
    "B1": "#362428",  # Dark umber rubber / shaded leather
    "B2": "#593C36",  # Weathered leather midtone
    "B3": "#805B4B",  # Lit strap / worn leather plane
    "B4": "#AA856B",  # Scuffed warm leather rim

    # Ramp C — Weathered Brushed Metal
    "M0": "#222531",  # Deep cool metal reflection trough
    "M1": "#414B56",  # Shadowed brushed steel
    "M2": "#6A757A",  # Mid weathered titanium
    "M3": "#9BA39A",  # Lit steel upper bevel
    "M4": "#CFCBB4",  # Warm sunlit metal edge glint
    "M5": "#F2EED0",  # Peak specular catch (warm cream, never pure #FFF)

    # Ramp D — Curved Glass Helmet Visor & Muted Teal Tech Accents
    "V0": "#141E28",  # Deep recessed visor core / interior shadow
    "V1": "#213842",  # Dark teal curved glass depth
    "V2": "#3A6168",  # Muted teal midtone / suit tech trim
    "V3": "#649291",  # Reflected sky-teal curve band
    "V4": "#9BC2B6",  # Soft glass horizon mist / telemetry glow
    "V5": "#DCE8D5",  # Crisp glass specular bridge

    # Ramp E — Organic Planetary Accents & Grounded Shadows
    "O0": "#192924",  # Ground shadow / deep forest occlusion
    "O1": "#324B36",  # Shaded forest olive
    "O2": "#567449",  # Reference earthy olive moss midtone
    "O3": "#7B9056",  # Warm sunlit sage leaf/moss
    "O4": "#C8BC6E",  # Sunlit ochre frond highlight
    "O5": "#E2E1BE",  # Warm ivory-bone / helmet ceramic cream
    "O6": "#A83B3B",  # Small xenobiology ruby-berry / latch warning accent
}

TOKEN_LIST: List[str] = ["."] + list(PALETTE_HEX.keys())
TOKEN_TO_IDX: Dict[str, int] = {t: i for i, t in enumerate(TOKEN_LIST)}
IDX_TO_TOKEN: Dict[int, str] = {i: t for i, t in enumerate(TOKEN_LIST)}


def hex_to_rgba(hx: str) -> Tuple[int, int, int, int]:
    hx = hx.lstrip("#")
    return (int(hx[0:2], 16), int(hx[2:4], 16), int(hx[4:6], 16), 255)


PALETTE_RGBA: List[Tuple[int, int, int, int]] = [(0, 0, 0, 0)] + [
    hex_to_rgba(PALETTE_HEX[t]) for t in TOKEN_LIST[1:]
]
PALETTE_ARR = np.array(PALETTE_RGBA, dtype=np.uint8)


class PixelCanvas:
    """Layered indexed pixel-art canvas with strict binary alpha and zero blur."""

    def __init__(self, width: int, height: int) -> None:
        self.width = width
        self.height = height
        self.layers: Dict[str, np.ndarray] = {}
        self.layer_order: List[str] = []

    def add_layer(self, name: str) -> np.ndarray:
        if name not in self.layers:
            self.layers[name] = np.zeros((self.height, self.width), dtype=np.uint8)
            self.layer_order.append(name)
        return self.layers[name]

    def layer(self, name: str) -> np.ndarray:
        return self.layers[name]

    def set_px(self, layer_name: str, x: int, y: int, token: str) -> None:
        if 0 <= x < self.width and 0 <= y < self.height:
            self.layers[layer_name][y, x] = TOKEN_TO_IDX[token]

    def get_px(self, layer_name: str, x: int, y: int) -> str:
        if 0 <= x < self.width and 0 <= y < self.height:
            return IDX_TO_TOKEN[int(self.layers[layer_name][y, x])]
        return "."

    def composite_indices(self) -> np.ndarray:
        out = np.zeros((self.height, self.width), dtype=np.uint8)
        for name in self.layer_order:
            lyr = self.layers[name]
            mask = lyr != 0
            out[mask] = lyr[mask]
        return out

    def to_rgba(self) -> np.ndarray:
        idx = self.composite_indices()
        return PALETTE_ARR[idx]

    def to_image(self) -> Image.Image:
        return Image.fromarray(self.to_rgba(), mode="RGBA")

    def save_png(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        self.to_image().save(path, format="PNG", optimize=True)

    def save_source_json(self, path: Path, metadata: Optional[Dict] = None) -> None:
        """Save editable layered indexed pixel-art source (lossless, human-inspectable)."""
        path.parent.mkdir(parents=True, exist_ok=True)
        layers_encoded: Dict[str, List[str]] = {}
        for name in self.layer_order:
            lyr = self.layers[name]
            rows = []
            for y in range(self.height):
                row_tokens = [IDX_TO_TOKEN[int(v)] for v in lyr[y]]
                rows.append(" ".join(row_tokens))
            layers_encoded[name] = rows
        payload = {
            "format": "verdant_signal_indexed_pixel_source_v1",
            "width": self.width,
            "height": self.height,
            "metadata": metadata or {},
            "palette": PALETTE_HEX,
            "layer_order": self.layer_order,
            "layers": layers_encoded,
        }
        path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    # ------------------------------------------------------------------
    # Crisp Integer Pixel-Art Drawing Primitives (ZERO AA / ZERO BLUR)
    # ------------------------------------------------------------------
    def fill_rect(
        self, layer_name: str, x0: int, y0: int, x1: int, y1: int, token: str
    ) -> None:
        idx = TOKEN_TO_IDX[token]
        xa, xb = max(0, min(x0, x1)), min(self.width - 1, max(x0, x1))
        ya, yb = max(0, min(y0, y1)), min(self.height - 1, max(y0, y1))
        if xa <= xb and ya <= yb:
            self.layers[layer_name][ya : yb + 1, xa : xb + 1] = idx

    def fill_polygon(
        self,
        layer_name: str,
        pts: Sequence[Tuple[float, float]],
        token: str,
        mask_layer: Optional[str] = None,
    ) -> None:
        """Exact integer scanline polygon fill (pixel-center sampling, zero AA)."""
        if len(pts) < 3:
            return
        idx = TOKEN_TO_IDX[token]
        lyr = self.layers[layer_name]
        ml = self.layers[mask_layer] if mask_layer else None
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        min_y = max(0, int(math.floor(min(ys))))
        max_y = min(self.height - 1, int(math.ceil(max(ys))))
        n = len(pts)
        for y in range(min_y, max_y + 1):
            yc = y + 0.5
            inter: List[float] = []
            for i in range(n):
                x1, y1 = pts[i]
                x2, y2 = pts[(i + 1) % n]
                if (y1 <= yc < y2) or (y2 <= yc < y1):
                    t = (yc - y1) / (y2 - y1)
                    inter.append(x1 + t * (x2 - x1))
            inter.sort()
            for j in range(0, len(inter) - 1, 2):
                x_start = max(0, int(math.ceil(inter[j] - 0.5)))
                x_end = min(self.width - 1, int(math.floor(inter[j + 1] - 0.5)))
                if x_start <= x_end:
                    if ml is None:
                        lyr[y, x_start : x_end + 1] = idx
                    else:
                        sub_mask = ml[y, x_start : x_end + 1] != 0
                        lyr[y, x_start : x_end + 1][sub_mask] = idx

    def fill_ellipse(
        self,
        layer_name: str,
        cx: float,
        cy: float,
        rx: float,
        ry: float,
        token: str,
        mask_layer: Optional[str] = None,
    ) -> None:
        idx = TOKEN_TO_IDX[token]
        lyr = self.layers[layer_name]
        ml = self.layers[mask_layer] if mask_layer else None
        x0 = max(0, int(math.floor(cx - rx - 1)))
        x1 = min(self.width - 1, int(math.ceil(cx + rx + 1)))
        y0 = max(0, int(math.floor(cy - ry - 1)))
        y1 = min(self.height - 1, int(math.ceil(cy + ry + 1)))
        for y in range(y0, y1 + 1):
            dy = (y + 0.5 - cy) / max(ry, 0.001)
            for x in range(x0, x1 + 1):
                dx = (x + 0.5 - cx) / max(rx, 0.001)
                if dx * dx + dy * dy <= 1.0:
                    if ml is None or ml[y, x] != 0:
                        lyr[y, x] = idx

    def draw_line(
        self,
        layer_name: str,
        x0: int,
        y0: int,
        x1: int,
        y1: int,
        token: str,
        thickness: int = 1,
        mask_layer: Optional[str] = None,
    ) -> None:
        """Bresenham integer line with optional mask clipping."""
        idx = TOKEN_TO_IDX[token]
        lyr = self.layers[layer_name]
        ml = self.layers[mask_layer] if mask_layer else None
        dx = abs(x1 - x0)
        dy = -abs(y1 - y0)
        sx = 1 if x0 < x1 else -1
        sy = 1 if y0 < y1 else -1
        err = dx + dy
        x, y = x0, y0
        r = thickness // 2
        while True:
            for oy in range(-r, thickness - r):
                for ox in range(-r, thickness - r):
                    px, py = x + ox, y + oy
                    if 0 <= px < self.width and 0 <= py < self.height:
                        if ml is None or ml[py, px] != 0:
                            lyr[py, px] = idx
            if x == x1 and y == y1:
                break
            e2 = 2 * err
            if e2 >= dy:
                err += dy
                x += sx
            if e2 <= dx:
                err += dx
                y += sy

    def draw_polyline(
        self,
        layer_name: str,
        pts: Sequence[Tuple[int, int]],
        token: str,
        thickness: int = 1,
        mask_layer: Optional[str] = None,
    ) -> None:
        for i in range(len(pts) - 1):
            self.draw_line(
                layer_name,
                pts[i][0],
                pts[i][1],
                pts[i + 1][0],
                pts[i + 1][1],
                token,
                thickness=thickness,
                mask_layer=mask_layer,
            )

    def paint_ascii_patch(
        self,
        layer_name: str,
        ox: int,
        oy: int,
        rows: Sequence[str],
        char_map: Dict[str, str],
        mask_layer: Optional[str] = None,
    ) -> None:
        """Hand-place exact pixels using a crisp 2D character matrix."""
        lyr = self.layers[layer_name]
        ml = self.layers[mask_layer] if mask_layer else None
        for dy, row in enumerate(rows):
            y = oy + dy
            if not (0 <= y < self.height):
                continue
            for dx, ch in enumerate(row):
                if ch not in char_map:
                    continue
                tok = char_map[ch]
                x = ox + dx
                if 0 <= x < self.width:
                    if ml is None or ml[y, x] != 0:
                        lyr[y, x] = TOKEN_TO_IDX[tok]

    def shade_sculpted_volume(
        self,
        layer_name: str,
        cx: float,
        cy: float,
        rx: float,
        ry: float,
        ramp: Sequence[str],
        light_dir: Tuple[float, float, float] = (-0.58, -0.62, 0.53),
        thresholds: Optional[Sequence[float]] = None,
        cluster_break_fn=None,
        mask_layer: Optional[str] = None,
        override_only_nonzero: bool = True,
    ) -> None:
        """
        Shade an existing sculpted mass using directional light + organic cluster
        edge-breaking (NO pillow shading, NO smooth gradients, strict discrete ramp).
        """
        lyr = self.layers[layer_name]
        ml = self.layers[mask_layer] if mask_layer else lyr
        lx, ly, lz = light_dir
        ln = math.sqrt(lx * lx + ly * ly + lz * lz)
        lx, ly, lz = lx / ln, ly / ln, lz / ln

        n = len(ramp)
        if thresholds is None:
            # Spread cleanly across [-0.35, +0.85]
            thresholds = [-0.35 + (1.18 * i) / (n - 1) for i in range(1, n)]

        x0 = max(0, int(math.floor(cx - rx - 2)))
        x1 = min(self.width - 1, int(math.ceil(cx + rx + 2)))
        y0 = max(0, int(math.floor(cy - ry - 2)))
        y1 = min(self.height - 1, int(math.ceil(cy + ry + 2)))

        for y in range(y0, y1 + 1):
            ny = (y + 0.5 - cy) / max(ry, 0.001)
            for x in range(x0, x1 + 1):
                if override_only_nonzero and lyr[y, x] == 0:
                    continue
                if ml is not None and ml[y, x] == 0:
                    continue
                nx = (x + 0.5 - cx) / max(rx, 0.001)
                r2 = nx * nx + ny * ny
                if r2 > 1.35:
                    continue
                nz = math.sqrt(max(0.04, 1.0 - min(0.96, r2)))
                inv = 1.0 / math.sqrt(nx * nx + ny * ny + nz * nz)
                dot = (nx * lx + ny * ly + nz * lz) * inv
                if cluster_break_fn is not None:
                    dot += cluster_break_fn(x, y, nx, ny)
                step = 0
                for th in thresholds:
                    if dot >= th:
                        step += 1
                lyr[y, x] = TOKEN_TO_IDX[ramp[min(step, n - 1)]]

    def apply_sel_out(
        self,
        target_layer: str,
        edge_map: Dict[str, Tuple[str, str, str]],
        include_exterior: bool = False,
        exterior_layer: Optional[str] = None,
    ) -> None:
        """
        Apply reference-style selective outlining (sel-out):
          edge_map[token] = (lit_top_left_edge, mid_edge, deep_shadow_bottom_right_edge)
        Replaces inner perimeter pixels (or optional 1px exterior collar) using
        directional edge polarity — ZERO pure black outlines.
        """
        src = self.composite_indices() if include_exterior else self.layers[target_layer].copy()
        out = self.layers[exterior_layer or target_layer]
        H, W = self.height, self.width

        for y in range(H):
            for x in range(W):
                if include_exterior:
                    if src[y, x] != 0:
                        continue
                    # Find adjacent opaque pixels
                    neighbors = []
                    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < W and 0 <= ny < H and src[ny, nx] != 0:
                            neighbors.append((dx, dy, IDX_TO_TOKEN[int(src[ny, nx])]))
                    if not neighbors:
                        continue
                    # Average outward normal (pointing from solid -> empty)
                    ox = sum(-d[0] for d in neighbors)
                    oy = sum(-d[1] for d in neighbors)
                    tok = neighbors[0][2]
                    if tok not in edge_map:
                        continue
                    lit_e, mid_e, shd_e = edge_map[tok]
                    # Top-left outward normal => ox + oy < 0 (lit edge)
                    # Bottom-right outward normal => ox + oy > 0 (shadow edge)
                    if ox + oy <= -1:
                        out[y, x] = TOKEN_TO_IDX[lit_e]
                    elif ox + oy >= 1:
                        out[y, x] = TOKEN_TO_IDX[shd_e]
                    else:
                        out[y, x] = TOKEN_TO_IDX[mid_e]
                else:
                    if src[y, x] == 0:
                        continue
                    # Check if on boundary (4-neighbor empty)
                    empties = []
                    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nx, ny = x + dx, y + dy
                        if not (0 <= nx < W and 0 <= ny < H) or src[ny, nx] == 0:
                            empties.append((dx, dy))
                    if not empties:
                        continue
                    tok = IDX_TO_TOKEN[int(src[y, x])]
                    if tok not in edge_map:
                        continue
                    lit_e, mid_e, shd_e = edge_map[tok]
                    ox = sum(d[0] for d in empties)
                    oy = sum(d[1] for d in empties)
                    if ox + oy <= -1:
                        if lit_e != ".":
                            out[y, x] = TOKEN_TO_IDX[lit_e]
                    elif ox + oy >= 1:
                        out[y, x] = TOKEN_TO_IDX[shd_e]
                    else:
                        out[y, x] = TOKEN_TO_IDX[mid_e]


# ==============================================================================
# AUTOMATED PIXEL-ART QUALITY-CONTROL AUDITOR & INSPECTION SHEET GENERATOR
# ==============================================================================
def audit_sprite_png(png_path: Path) -> Dict:
    """Measure objective pixel-art cleanliness metrics on a native PNG."""
    img = Image.open(png_path).convert("RGBA")
    arr = np.array(img)
    H, W, _ = arr.shape
    alpha = arr[:, :, 3]
    non_binary_alpha = int(np.sum((alpha > 0) & (alpha < 255)))
    opaque_mask = alpha == 255
    opaque_pixels = arr[opaque_mask][:, :3]
    unique_rgb = set(map(tuple, opaque_pixels.tolist())) if len(opaque_pixels) else set()

    allowed_rgb = {hex_to_rgba(hx)[:3] for hx in PALETTE_HEX.values()}
    off_palette = unique_rgb - allowed_rgb

    # Count 4-connected orphan pixels (1-pixel isolated clusters)
    # Build integer color ID map (-1 for transparent)
    cid = np.full((H, W), -1, dtype=np.int32)
    for y in range(H):
        for x in range(W):
            if alpha[y, x] == 255:
                r, g, b = int(arr[y, x, 0]), int(arr[y, x, 1]), int(arr[y, x, 2])
                cid[y, x] = (r << 16) | (g << 8) | b

    orphan_coords: List[Tuple[int, int]] = []
    for y in range(H):
        for x in range(W):
            c = cid[y, x]
            if c == -1:
                continue
            same_n = 0
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < W and 0 <= ny < H and cid[ny, nx] == c:
                    same_n += 1
            if same_n == 0:
                orphan_coords.append((x, y))

    # Bounding box & negative space
    ys, xs = np.where(opaque_mask)
    if len(xs):
        bbox = (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max()))
        bw, bh = bbox[2] - bbox[0] + 1, bbox[3] - bbox[1] + 1
    else:
        bbox, bw, bh = (0, 0, 0, 0), 0, 0

    return {
        "file": str(png_path),
        "dimensions": f"{W}x{H}",
        "opaque_pixels": int(np.sum(opaque_mask)),
        "fill_ratio_pct": round(100.0 * float(np.sum(opaque_mask)) / (W * H), 1),
        "bbox": bbox,
        "bbox_size": f"{bw}x{bh}",
        "unique_colors": len(unique_rgb),
        "off_palette_colors": len(off_palette),
        "non_binary_alpha_pixels": non_binary_alpha,
        "orphan_1px_count": len(orphan_coords),
        "pure_black_or_white": any(c in ((0, 0, 0), (255, 255, 255)) for c in unique_rgb),
    }


def make_inspection_sheet(
    png_paths: Sequence[Tuple[str, Path]],
    out_path: Path,
    zoom: int = 4,
    include_grayscale: bool = True,
    include_silhouette: bool = True,
) -> None:
    """
    Build a crisp nearest-neighbor inspection preview (in /tmp ONLY — never as a
    production asset) showing each sprite on:
      - Reference olive grass backdrop (#5E764A)
      - Deep shaded forest backdrop (#25382B)
      - 1x native scale
      - Optional grayscale value check & solid silhouette check
    """
    pad = 12
    row_imgs: List[Image.Image] = []
    bg_sunlit = (102, 122, 77, 255)   # Reference sunlit grass midtone
    bg_shaded = (36, 54, 42, 255)     # Reference shaded grass
    bg_light = (196, 194, 166, 255)   # Reference bright water/sky tone

    for label, p in png_paths:
        src = Image.open(p).convert("RGBA")
        W, H = src.size
        zw, zh = W * zoom, H * zoom

        panels: List[Image.Image] = []

        # Panel 1: Zoomed on reference sunlit olive grass
        p1 = Image.new("RGBA", (zw, zh), bg_sunlit)
        p1.alpha_composite(src.resize((zw, zh), Image.Resampling.NEAREST))
        panels.append(p1)

        # Panel 2: Zoomed on deep forest shade
        p2 = Image.new("RGBA", (zw, zh), bg_shaded)
        p2.alpha_composite(src.resize((zw, zh), Image.Resampling.NEAREST))
        panels.append(p2)

        # Panel 3: Grayscale luminance check (zoomed on mid-neutral)
        if include_grayscale:
            g = src.convert("LA").convert("RGBA")
            p3 = Image.new("RGBA", (zw, zh), (118, 118, 118, 255))
            p3.alpha_composite(g.resize((zw, zh), Image.Resampling.NEAREST))
            panels.append(p3)

        # Panel 4: Solid silhouette + 1x native previews stacked
        side_w = max(zw // 2, W + 24)
        p4 = Image.new("RGBA", (side_w, zh), bg_light)
        if include_silhouette:
            arr = np.array(src)
            sil = np.zeros_like(arr)
            m = arr[:, :, 3] > 0
            sil[m] = [27, 20, 32, 255]
            sil_img = Image.fromarray(sil, "RGBA").resize(
                (W * max(1, zoom // 2), H * max(1, zoom // 2)),
                Image.Resampling.NEAREST,
            )
            p4.alpha_composite(sil_img, (4, 4))
        # Also stamp 1x native on sunlit grass & shaded grass at bottom-right
        p4_g1 = Image.new("RGBA", (W + 8, H + 8), bg_sunlit)
        p4_g1.alpha_composite(src, (4, 4))
        p4.alpha_composite(p4_g1, (4, zh - H - 12))
        panels.append(p4)

        total_w = sum(im.width for im in panels) + pad * (len(panels) + 1)
        row = Image.new("RGBA", (total_w, zh + pad * 2), (24, 24, 30, 255))
        cx = pad
        for im in panels:
            row.alpha_composite(im, (cx, pad))
            cx += im.width + pad
        row_imgs.append(row)

    max_w = max(r.width for r in row_imgs)
    total_h = sum(r.height for r in row_imgs) + pad
    sheet = Image.new("RGBA", (max_w, total_h), (24, 24, 30, 255))
    cy = 0
    for r in row_imgs:
        sheet.alpha_composite(r, (0, cy))
        cy += r.height
    out_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_path, format="PNG")
