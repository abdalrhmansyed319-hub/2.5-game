#!/usr/bin/env python3
"""Generate clearly labeled TEMPORARY DEBUG PLACEHOLDER PNGs for Milestone 01.

Every generated sheet matches the exact audited v2.0 pixel dimensions, frame
grids, atlas coordinates, unused transparent cells, and pivots defined in
docs/asset-production/ASSET_REQUESTS.md (AST-001 through AST-007).

These files are temporary geometric debug fixtures ONLY — never final art.
"""

from __future__ import annotations

import math
import pathlib
import struct
import zlib

OUT_DIR = pathlib.Path("game/assets/debug_placeholders")


def hex_rgba(h: str, a: int = 255) -> tuple[int, int, int, int]:
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


class Canvas:
    def __init__(self, width: int, height: int) -> None:
        self.w = width
        self.h = height
        self.buf = bytearray(width * height * 4)

    def px(self, x: int, y: int, col: tuple[int, int, int, int]) -> None:
        if 0 <= x < self.w and 0 <= y < self.h:
            i = (y * self.w + x) * 4
            self.buf[i : i + 4] = bytes(col)

    def rect(
        self, x0: int, y0: int, w: int, h: int, col: tuple[int, int, int, int]
    ) -> None:
        for y in range(y0, y0 + h):
            for x in range(x0, x0 + w):
                self.px(x, y, col)

    def rect_outline(
        self, x0: int, y0: int, w: int, h: int, col: tuple[int, int, int, int]
    ) -> None:
        for x in range(x0, x0 + w):
            self.px(x, y0, col)
            self.px(x, y0 + h - 1, col)
        for y in range(y0, y0 + h):
            self.px(x0, y, col)
            self.px(x0 + w - 1, y, col)

    def ellipse(
        self,
        cx: float,
        cy: float,
        rx: float,
        ry: float,
        col: tuple[int, int, int, int],
        ring_only: bool = False,
        dashed: bool = False,
    ) -> None:
        x0 = max(0, int(math.floor(cx - rx - 1)))
        x1 = min(self.w - 1, int(math.ceil(cx + rx + 1)))
        y0 = max(0, int(math.floor(cy - ry - 1)))
        y1 = min(self.h - 1, int(math.ceil(cy + ry + 1)))
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                dx = (x + 0.5 - cx) / max(rx, 0.01)
                dy = (y + 0.5 - cy) / max(ry, 0.01)
                d = dx * dx + dy * dy
                if ring_only:
                    if 0.68 <= d <= 1.08:
                        if dashed and ((x + y) % 3 == 0):
                            continue
                        self.px(x, y, col)
                elif d <= 1.0:
                    self.px(x, y, col)

    def save_png(self, path: pathlib.Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)

        def chunk(tag: bytes, data: bytes) -> bytes:
            return (
                struct.pack("!I", len(data))
                + tag
                + data
                + struct.pack("!I", zlib.crc32(tag + data) & 0xFFFFFFFF)
            )

        raw = bytearray()
        stride = self.w * 4
        for y in range(self.h):
            raw.append(0)
            start = y * stride
            raw.extend(self.buf[start : start + stride])
        ihdr = struct.pack("!IIBBBBB", self.w, self.h, 8, 6, 0, 0, 0)
        png = (
            b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", ihdr)
            + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
            + chunk(b"IEND", b"")
        )
        path.write_bytes(png)


def make_ast001_mara() -> None:
    """AST-001: 96x384 (6 cols x 16 rows of 16x24), feet grounded at y=22."""
    c = Canvas(96, 384)
    outline = hex_rgba("#12161C")
    ivory = hex_rgba("#F4EFE2")
    ivory_sh = hex_rgba("#C9D0C8")
    navy = hex_rgba("#202A36")
    orange = hex_rgba("#FF6B3D")
    amber = hex_rgba("#FFB838")
    cyan = hex_rgba("#4CE8E0")

    row_counts = [
        4, 4, 4, 4,  # idle down/up/right/left
        6, 6, 6, 6,  # walk down/up/right/left
        4, 4, 4, 4,  # crouch_walk down/up/right/left
        2, 2, 2, 2,  # lens_scan down/up/right/left
    ]
    dirs = ["down", "up", "right", "left"]

    for row, count in enumerate(row_counts):
        state = row // 4  # 0=idle, 1=walk, 2=crouch, 3=lens
        d = dirs[row % 4]
        for col in range(count):
            ox = col * 16
            oy = row * 24
            bob = 1 if (state == 1 and col in (1, 4)) else (1 if (state == 0 and col == 2) else 0)
            crouch_drop = 4 if state == 2 else 0
            top_y = oy + 3 + bob + crouch_drop
            torso_h = 6 if state != 2 else 4
            leg_y = top_y + 6 + torso_h

            # Grounded boots on y = 22 (two feet alternating on walk/crouch)
            stride = 0
            if state in (1, 2):
                stride = (-1 if col % 2 == 0 else 1) if col in (0, 3, 2) else 0
            lx = ox + 5 + (stride if d in ("right", "left") else 0)
            rx = ox + 9 - (stride if d in ("right", "left") else 0)
            ly = oy + 21 - (1 if state in (1, 2) and col in (0, 1) else 0)
            ry = oy + 21 - (1 if state in (1, 2) and col in (3, 4) else 0)

            # Dark outline silhouette + navy pants & boots
            c.rect(ox + 4, top_y, 8, (oy + 22) - top_y, outline)
            c.rect(ox + 5, leg_y, 6, (oy + 22) - leg_y, navy)
            c.rect(lx, ly, 2, 2, outline)
            c.rect(rx, ry, 2, 2, outline)
            c.px(lx, oy + 22, navy)
            c.px(rx, oy + 22, navy)

            # Upper ivory expedition coat + asymmetrical orange diagonal strap
            c.rect(ox + 5, top_y + 6, 6, torso_h, ivory)
            c.rect(ox + 9, top_y + 6, 2, torso_h, ivory_sh)
            # Helmet crown (ivory sunlit top-left, shaded right)
            c.rect(ox + 5, top_y + 1, 6, 5, ivory)
            c.rect(ox + 9, top_y + 2, 2, 4, ivory_sh)

            # Direction-specific features (NO horizontal mirroring!)
            if d == "down":
                c.rect(ox + 6, top_y + 3, 4, 2, navy)
                c.rect(ox + 7, top_y + 3, 2, 1, amber)
                # Diagonal strap L-shoulder -> R-hip (viewer left -> right)
                for s in range(min(torso_h, 4)):
                    c.px(ox + 6 + s, top_y + 6 + s, orange)
                # Right-hip lens holster
                c.rect(ox + 10, top_y + 6 + torso_h - 1, 2, 2, orange)
            elif d == "up":
                # Backpack on back + asymmetrical orange buckle on right side
                c.rect(ox + 5, top_y + 6, 6, torso_h, navy)
                c.rect(ox + 9, top_y + 7, 2, 3, orange)
            elif d == "right":
                # Facing East: visor on right, pack on left, holster visible front-right
                c.rect(ox + 9, top_y + 3, 2, 2, amber)
                c.rect(ox + 3, top_y + 6, 2, torso_h, navy)
                c.rect(ox + 8, top_y + 8, 2, 2, orange)
            elif d == "left":
                # Facing West: visor on left, pack on right, top-left sunlight stays on helmet!
                c.rect(ox + 5, top_y + 3, 2, 2, amber)
                c.rect(ox + 11, top_y + 6, 2, torso_h, navy)
                c.rect(ox + 6, top_y + 7, 2, 2, orange)

            # Acoustic Field Lens active glow in lens_scan_* rows
            if state == 3:
                glow = cyan if col == 0 else amber
                if d == "down":
                    c.rect(ox + 10, top_y + 7, 3, 2, glow)
                elif d == "up":
                    c.rect(ox + 10, top_y + 4, 2, 2, glow)
                elif d == "right":
                    c.rect(ox + 11, top_y + 6, 3, 2, glow)
                elif d == "left":
                    c.rect(ox + 2, top_y + 6, 3, 2, glow)

    c.save_png(OUT_DIR / "debug_placeholder_char_mara_lin_sheet.png")


def _draw_wang_tile(
    c: Canvas,
    col: int,
    row: int,
    mask: int,
    fill: tuple[int, int, int, int],
    edge: tuple[int, int, int, int],
    hi: tuple[int, int, int, int],
    variant: int = 0,
    ragged: bool = False,
) -> None:
    """Bitmask bits: TL=1, TR=2, BL=4, BR=8."""
    ox, oy = col * 16, row * 16
    tl = bool(mask & 1)
    tr = bool(mask & 2)
    bl = bool(mask & 4)
    br = bool(mask & 8)
    for y in range(16):
        fy = (y + 0.5) / 16.0
        for x in range(16):
            fx = (x + 0.5) / 16.0
            v = (
                (1.0 if tl else 0.0) * (1.0 - fx) * (1.0 - fy)
                + (1.0 if tr else 0.0) * fx * (1.0 - fy)
                + (1.0 if bl else 0.0) * (1.0 - fx) * fy
                + (1.0 if br else 0.0) * fx * fy
            )
            jitter = (((x * 13 + y * 7) % 5) - 2) * 0.045 if ragged else 0.0
            if v + jitter >= 0.48:
                col_px = fill
                if v + jitter < 0.62 and mask != 15:
                    col_px = edge
                elif variant == 1 and (x + y * 2) % 11 == 0:
                    col_px = hi
                elif variant == 2 and ((x == 4 and y == 6) or (x == 11 and y == 12)):
                    col_px = edge
                elif variant == 3 and (x == 9 and y == 4):
                    col_px = hi
                c.px(ox + x, oy + y, col_px)


def make_ast002_amber_coast() -> None:
    """AST-002: 192x128 (12x8 tiles of 16x16), exact v2.0 audited map."""
    c = Canvas(192, 128)
    sand = hex_rgba("#B89A6C")
    sand_hi = hex_rgba("#D7BE91")
    sand_wet = hex_rgba("#9B7F58")
    sand_dark = hex_rgba("#7C6549")
    water = hex_rgba("#367E8A")
    water_hi = hex_rgba("#529DA8")
    deep = hex_rgba("#1C485C")
    foam = hex_rgba("#C9DCE3")
    cliff_top = hex_rgba("#7E9AA2")
    cliff_face = hex_rgba("#566B73")
    cliff_sh = hex_rgba("#2D423E")
    kelp = hex_rgba("#E49836")

    # 18 Wang corner sand tiles (Terrain Set 0, T0)
    wang_map = [
        (0, 0, 15, 0), (1, 0, 15, 1), (2, 0, 15, 2), (3, 0, 15, 3),
        (4, 0, 8, 0), (5, 0, 12, 0), (6, 0, 4, 0), (7, 0, 10, 0),
        (0, 1, 14, 0), (1, 1, 13, 0), (2, 1, 11, 0), (3, 1, 7, 0),
        (4, 1, 5, 0), (5, 1, 2, 0), (6, 1, 3, 0), (7, 1, 1, 0),
        (0, 2, 9, 0), (1, 2, 6, 0),
    ]
    for col, row, mask, var in wang_map:
        _draw_wang_tile(c, col, row, mask, sand, sand_wet, sand_hi, var)

    # 6 Beach Decals at (2,2)..(7,2)
    c.rect(2 * 16 + 5, 2 * 16 + 7, 3, 2, foam)
    c.rect(2 * 16 + 10, 2 * 16 + 10, 2, 2, sand_hi)
    c.rect(3 * 16 + 3, 2 * 16 + 6, 10, 3, kelp)
    c.rect(4 * 16 + 2, 2 * 16 + 7, 12, 3, sand_dark)
    c.ellipse(5 * 16 + 8, 2 * 16 + 8, 5, 3, hex_rgba("#367E8A", 190))
    for px_x, px_y in [(4, 5), (9, 8), (6, 11), (11, 5)]:
        c.rect(6 * 16 + px_x, 2 * 16 + px_y, 2, 2, sand_dark)
    c.rect(7 * 16 + 3, 2 * 16 + 5, 10, 1, sand_hi)
    c.rect(7 * 16 + 5, 2 * 16 + 10, 8, 1, sand_hi)

    # 12 Shallow Tidal Pool & Wet Sandbars: cols 8..11, rows 0..2
    c.rect(8 * 16, 0, 16, 16, hex_rgba("#367E8A", 220))
    c.rect(9 * 16, 0, 16, 16, hex_rgba("#367E8A", 220))
    c.rect(9 * 16 + 3, 5, 5, 1, water_hi)
    c.rect(10 * 16, 0, 16, 16, sand_wet)
    c.rect(11 * 16, 0, 16, 16, sand_wet)
    c.rect(11 * 16 + 4, 6, 3, 2, sand_dark)
    tidal_masks = [
        (8, 1, 12), (9, 1, 3), (10, 1, 10), (11, 1, 5),
        (8, 2, 8), (9, 2, 4), (10, 2, 2), (11, 2, 1),
    ]
    for col, row, mask in tidal_masks:
        _draw_wang_tile(c, col, row, mask, sand_wet, sand_dark, sand)

    # 18 Coastal Cliffs: cols 0..5, rows 3..5
    for row in range(3, 6):
        for col in range(0, 6):
            ox, oy = col * 16, row * 16
            if row == 3:
                c.rect(ox, oy, 16, 16, cliff_top)
                c.rect_outline(ox, oy, 16, 16, cliff_face)
            elif row == 4:
                c.rect(ox, oy, 16, 16, cliff_top)
                c.rect(ox, oy + 12, 16, 4, cliff_face)
            else:
                c.rect(ox, oy, 16, 13, cliff_face)
                c.rect(ox, oy + 13, 16, 3, cliff_sh)
                c.rect(ox + 2, oy + 3, 12, 2, cliff_top)

    # 12 Deep Water Shelf: cols 6..11, rows 3..4 (row 5 cols 6..11 STAY UNUSED/TRANSPARENT!)
    for row in (3, 4):
        for col in range(6, 12):
            ox, oy = col * 16, row * 16
            c.rect(ox, oy, 16, 16, deep)
            if col >= 8:
                c.rect(ox + 2, oy + 2, 12, 3, water)

    # 12 Horizontal Animated 2-frame water/foam pairs: rows 6..7, cols 0..11
    for row in (6, 7):
        for pair in range(6):
            for frame in (0, 1):
                ox = (pair * 2 + frame) * 16
                oy = row * 16
                base_col = deep if (row == 6 and pair == 2) else water
                c.rect(ox, oy, 16, 16, base_col)
                shift = frame * 3
                c.rect(ox + 2 + shift, oy + 4, 6, 1, water_hi)
                c.rect(ox + 7 - shift, oy + 11, 5, 1, water_hi)
                # Foam accents on pairs 3..5 (row 6) and 0..4 (row 7)
                if (row == 6 and pair >= 3) or (row == 7 and pair <= 4):
                    c.rect(ox + 1, oy + 1 + frame, 14, 2, foam)

    c.save_png(OUT_DIR / "debug_placeholder_env_amber_coast_ground_tileset.png")


def make_ast003_singing_canopy() -> None:
    """AST-003: 192x96 (12x6 tiles of 16x16), exact v2.0 audited map."""
    c = Canvas(192, 96)
    moss = hex_rgba("#6F8A68")
    moss_hi = hex_rgba("#97AF7E")
    moss_sh = hex_rgba("#3D5444")
    trail = hex_rgba("#B89A6C")
    trail_edge = hex_rgba("#8C7757")
    creek = hex_rgba("#4B8B82")
    creek_hi = hex_rgba("#8FC7B8")
    terrace = hex_rgba("#47695E")
    terrace_sh = hex_rgba("#2D423E")

    # Zone A: 18 Ragged Moss->Sand Wang tiles
    wang_map = [
        (0, 0, 15, 0), (1, 0, 15, 1), (2, 0, 15, 2), (3, 0, 15, 3),
        (4, 0, 8, 0), (5, 0, 12, 0), (6, 0, 4, 0), (7, 0, 10, 0),
        (0, 1, 14, 0), (1, 1, 13, 0), (2, 1, 11, 0), (3, 1, 7, 0),
        (4, 1, 5, 0), (5, 1, 2, 0), (6, 1, 3, 0), (7, 1, 1, 0),
        (0, 2, 9, 0), (1, 2, 6, 0),
    ]
    for col, row, mask, var in wang_map:
        _draw_wang_tile(c, col, row, mask, moss, moss_sh, moss_hi, var, ragged=True)

    # Zone C: 6 Forest Decals at (2,2)..(7,2)
    c.rect(2 * 16 + 2, 2 * 16 + 6, 12, 4, hex_rgba("#9B8F74"))
    c.rect(3 * 16 + 2, 2 * 16 + 8, 12, 2, moss_sh)
    c.rect(4 * 16 + 7, 2 * 16 + 2, 2, 12, moss_sh)
    c.ellipse(5 * 16 + 8, 2 * 16 + 8, 5, 4, hex_rgba("#D7E8A8", 120))
    c.rect(6 * 16 + 5, 2 * 16 + 6, 5, 4, moss_hi)
    c.rect(7 * 16 + 4, 2 * 16 + 5, 8, 6, hex_rgba("#7E9AA2"))

    # Zone B: 16 Full 4-bit Cardinal Root-Lined Dirt Trail Tiles at cols 8..11, rows 0..3
    for bitmask in range(16):
        col = 8 + (bitmask % 4)
        row = bitmask // 4
        ox, oy = col * 16, row * 16
        c.rect(ox + 4, oy + 4, 8, 8, trail)
        c.rect_outline(ox + 3, oy + 3, 10, 10, trail_edge)
        if bitmask & 1:  # N
            c.rect(ox + 4, oy, 8, 6, trail)
        if bitmask & 2:  # E
            c.rect(ox + 10, oy + 4, 6, 8, trail)
        if bitmask & 4:  # S
            c.rect(ox + 4, oy + 10, 8, 6, trail)
        if bitmask & 8:  # W
            c.rect(ox, oy + 4, 6, 8, trail)

    # Zone D: 18 Mossy Terraces at cols 0..5, rows 3..5
    for row in range(3, 6):
        for col in range(0, 6):
            ox, oy = col * 16, row * 16
            if row < 5:
                c.rect(ox, oy, 16, 16, terrace)
                c.rect(ox + 1, oy + 1, 14, 14, moss)
            else:
                c.rect(ox, oy, 16, 13, terrace)
                c.rect(ox, oy + 13, 16, 3, terrace_sh)

    # Zone E: Creek Banks (cols 6..7, rows 3..5) & 4 Animated 2-frame Stream Pairs (cols 8..11, rows 4..5)
    for row in range(3, 6):
        for col in (6, 7):
            ox, oy = col * 16, row * 16
            c.rect(ox, oy, 16, 16, creek)
            c.rect(ox, oy, 16, 4, moss)
            c.rect(ox, oy + 4, 16, 2, moss_sh)
    for row in (4, 5):
        for pair in (0, 1):
            for frame in (0, 1):
                ox = (8 + pair * 2 + frame) * 16
                oy = row * 16
                c.rect(ox, oy, 16, 16, creek)
                c.rect(ox + 2 + frame * 3, oy + 5, 7, 1, creek_hi)
                c.rect(ox + 6 - frame * 2, oy + 11, 5, 1, creek_hi)

    c.save_png(OUT_DIR / "debug_placeholder_env_singing_canopy_ground_tileset.png")


def make_ast004_reedwood() -> None:
    """AST-004: 96x160 (2x2 of 48x80), shared origin (24,72), 4px overlap y=32..36."""
    c = Canvas(96, 160)
    trunk_hi = hex_rgba("#9B8F74")
    trunk_mid = hex_rgba("#5F6652")
    trunk_sh = hex_rgba("#313D36")
    slit = hex_rgba("#1B2624")
    glow = hex_rgba("#FFB838")
    canopy_hi = hex_rgba("#97AF7E")
    canopy_mid = hex_rgba("#6F8A68")
    canopy_sh = hex_rgba("#47695E")
    canopy_deep = hex_rgba("#2D423E")

    for var in (0, 1):
        oy = var * 80
        lean = 0 if var == 0 else 2
        # Col 0: Lower Fluted Trunk & Grounded Roots (rises up to y=32 overlap collar!)
        ox = 0
        # Root flare anchored around (24, 72)
        c.ellipse(ox + 24, oy + 72, 11, 4, trunk_sh)
        c.ellipse(ox + 23, oy + 71, 8, 3, trunk_mid)
        for y in range(32, 74):
            shift = int(lean * ((72 - y) / 40.0))
            c.rect(ox + 19 + shift, oy + y, 10, 1, trunk_mid)
            c.rect(ox + 19 + shift, oy + y, 3, 1, trunk_hi)
            c.rect(ox + 26 + shift, oy + y, 3, 1, trunk_sh)
        if var == 1:
            # Twin leaning stem
            for y in range(34, 72):
                shift = -int(4 * ((72 - y) / 38.0))
                c.rect(ox + 21 + shift, oy + y, 5, 1, trunk_mid)
                c.rect(ox + 21 + shift, oy + y, 2, 1, trunk_hi)
        # Signature carved vertical wind-slits with subtle resonance glint
        c.rect(ox + 22 + lean, oy + 42, 2, 12, slit)
        c.px(ox + 23 + lean, oy + 46, glow)
        c.rect(ox + 25 + lean, oy + 52, 2, 9, slit)

        # Col 1: Overhead Canopy Crown (spans y=2..36, pixel-registered at (24,72)!)
        ox = 48
        cx = ox + 24 + lean
        c.ellipse(cx, oy + 22, 21, 14, canopy_deep)
        c.ellipse(cx, oy + 20, 20, 13, canopy_sh)
        c.ellipse(cx - 2, oy + 17, 17, 11, canopy_mid)
        c.ellipse(cx - 5, oy + 13, 12, 8, canopy_hi)
        c.ellipse(cx + 8, oy + 22, 10, 8, canopy_mid)
        c.ellipse(cx - 9, oy + 24, 9, 7, canopy_sh)

    c.save_png(OUT_DIR / "debug_placeholder_prop_singing_reedwood_tree_sheet.png")


def make_ast005_flora() -> None:
    """AST-005: 64x128 (4x4 of 16x32), pivot (8,30)."""
    c = Canvas(64, 128)
    # Row 0: Amber Tide-Kelp 4-frame sway
    for col in range(4):
        ox, oy = col * 16, 0
        sway = (-2, -1, 1, 2)[col]
        for y in range(4, 31):
            t = (30 - y) / 26.0
            sx = ox + 7 + int(round(sway * t * t))
            c.rect(sx, oy + y, 3, 1, hex_rgba("#E49836"))
            c.px(sx, oy + y, hex_rgba("#FFC648"))
            if y > 24:
                c.rect(sx, oy + y, 3, 1, hex_rgba("#8C5320"))

    # Row 1: Mirror Glasswort (Cols 0..1; Cols 2..3 UNUSED)
    for col in (0, 1):
        ox, oy = col * 16, 32
        c.ellipse(ox + 8, oy + 25, 5 + col, 4, hex_rgba("#367E8A"))
        c.rect(ox + 6, oy + 17 + col, 2, 10, hex_rgba("#7E9AA2"))
        c.rect(ox + 9, oy + 19 - col, 2, 8, hex_rgba("#7E9AA2"))
        c.px(ox + 6, oy + 17 + col, hex_rgba("#C9DCE3"))
        c.px(ox + 9, oy + 19 - col, hex_rgba("#C9DCE3"))

    # Row 2: Sun-Drop Bulb (Col 0 Day Open, Col 1 Night Closed; Cols 2..3 UNUSED)
    c.ellipse(8, 64 + 24, 6, 5, hex_rgba("#47695E"))
    c.ellipse(8, 64 + 21, 4, 3, hex_rgba("#FFB838"))
    c.rect(7, 64 + 20, 2, 2, hex_rgba("#FFE047"))
    c.ellipse(16 + 8, 64 + 25, 4, 4, hex_rgba("#47695E"))
    c.rect(16 + 7, 64 + 22, 2, 2, hex_rgba("#97AF7E"))

    # Row 3: Cordage Frond (Cols 0..1; Cols 2..3 UNUSED)
    for col in (0, 1):
        ox, oy = col * 16, 96
        c.ellipse(ox + 8, oy + 25, 6, 4, hex_rgba("#3D5444"))
        c.ellipse(ox + 6 + col, oy + 20, 5, 6, hex_rgba("#6F8A68"))
        c.rect(ox + 7 + col, oy + 15, 2, 12, hex_rgba("#97AF7E"))

    c.save_png(OUT_DIR / "debug_placeholder_prop_rimlands_flora_sheet.png")


def make_ast006_drop_pod() -> None:
    """AST-006: 96x64 partitioned atlas; (64,48,32,16) stays UNUSED/TRANSPARENT."""
    c = Canvas(96, 64)
    ivory = hex_rgba("#E8E4D8")
    slate = hex_rgba("#9DA4AB")
    orange = hex_rgba("#FF6B3D")
    charcoal = hex_rgba("#202A36")
    glass = hex_rgba("#367E8A")
    sky = hex_rgba("#C9DCE3")
    sand = hex_rgba("#B89A6C")
    sand_sh = hex_rgba("#7C6549")
    amber = hex_rgba("#FFB838")

    # (0,0,64,48): Drop-Pod Hull + Feathered Sand Collar
    c.ellipse(32, 40, 28, 7, sand_sh)
    c.ellipse(32, 39, 25, 6, sand)
    c.ellipse(32, 24, 24, 15, charcoal)
    c.ellipse(31, 22, 22, 13, slate)
    c.ellipse(29, 19, 19, 10, ivory)
    # Rescue orange band & cracked cockpit viewport
    c.rect(24, 10, 6, 22, orange)
    c.ellipse(42, 20, 7, 5, glass)
    c.rect(40, 17, 3, 2, sky)
    c.rect(10, 22, 8, 8, charcoal)  # Scorched thruster nose

    # (64,0,16,16): Crate A Intact
    c.rect(66, 4, 12, 10, charcoal)
    c.rect(67, 5, 10, 8, hex_rgba("#D7CFC2"))
    c.rect(67, 8, 10, 2, orange)

    # (80,0,16,16): Crate B Half-Buried
    c.rect(82, 7, 12, 7, charcoal)
    c.rect(83, 8, 10, 5, hex_rgba("#D7CFC2"))
    c.rect(81, 12, 14, 3, sand)

    # (64,16,32,32): Field Camp Tent
    for y in range(18):
        half = int((y / 17.0) * 12) + 2
        c.rect(80 - half, 24 + y, half * 2, 1, ivory if y < 10 else slate)
    c.rect(76, 33, 8, 9, charcoal)
    c.rect(78, 35, 4, 6, amber)

    # (0,48,64,16): Scorched Sand Skid-Furrow Decal
    c.ellipse(32, 56, 29, 6, hex_rgba("#7C6549", 180))
    c.ellipse(32, 56, 22, 3, hex_rgba("#202A36", 130))

    # (64,48,32,16) explicitly untouched (RGBA = 0,0,0,0)
    c.save_png(OUT_DIR / "debug_placeholder_prop_drop_pod_landmark_sheet.png")


def make_ast007_fx() -> None:
    """AST-007: 128x96 (4x3 of 32x32), >=1px margin on all cells."""
    c = Canvas(128, 96)
    shadow = hex_rgba("#12161C", 105)
    ripple = hex_rgba("#C9DCE3", 215)
    ripple_fade = hex_rgba("#6CF2B2", 150)
    lens_cyan = hex_rgba("#4CE8E0", 230)
    lens_gold = hex_rgba("#FFB838", 180)

    # Row 0: Shadows (Small 12x6, Medium 18x9, Large 30x14; Col 3 UNUSED)
    c.ellipse(16, 16, 6, 3, shadow)
    c.ellipse(32 + 16, 16, 9, 4.5, shadow)
    c.ellipse(64 + 16, 16, 15, 7, shadow)

    # Row 1: Shallow-Water Wade Ripple (4 frames)
    for col, (rx, ry) in enumerate([(4, 2), (7, 3.5), (10, 5), (13, 6.5)]):
        c.ellipse(
            col * 32 + 16,
            32 + 16,
            rx,
            ry,
            ripple if col < 2 else ripple_fade,
            ring_only=True,
            dashed=(col >= 2),
        )

    # Row 2: Acoustic Field Lens Pulse Wave (4 frames, max 30x15)
    for col, (rx, ry) in enumerate([(5, 2.5), (8, 4), (12, 6), (15, 7.5)]):
        c.ellipse(
            col * 32 + 16,
            64 + 16,
            rx,
            ry,
            lens_cyan if col % 2 == 0 else lens_gold,
            ring_only=True,
            dashed=True,
        )

    c.save_png(OUT_DIR / "debug_placeholder_fx_shadows_ripples_lens_sheet.png")


def main() -> None:
    make_ast001_mara()
    make_ast002_amber_coast()
    make_ast003_singing_canopy()
    make_ast004_reedwood()
    make_ast005_flora()
    make_ast006_drop_pod()
    make_ast007_fx()
    print(f"Generated 7 audited Milestone 01 DEBUG PLACEHOLDER PNGs in {OUT_DIR}")


if __name__ == "__main__":
    main()
