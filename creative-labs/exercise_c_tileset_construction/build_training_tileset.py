#!/usr/bin/env python3
"""Synthetic 16x16 Pixel-Art Training Tileset & Seamless Room Assembler (Exercise C).

STRICT NOTICE: Generates a disposable synthetic training fixture solely to exercise
Asset Intelligence inspection (tools/asset_inspector.py), visual seam/corner verification
via read_file, and Godot 4.7 TileMapLayer mapping. Not user game assets.

Tileset Layout (64x64 px = 4x4 grid of 16x16 tiles):
  Row 0 (Floor & Fill Variants - Band 3 calm playable ground):
    (0,0) Floor Base (muted warm flagstone)
    (1,0) Floor Variant A (subtle crack)
    (2,0) Floor Variant B (small moss tuft corner)
    (3,0) Solid Wall Top Fill (dark slate capstone interior)
  Row 1 (Outer Wall Edges bordering floor):
    (0,1) Wall North Edge (top stone cap with south drop lip facing floor below)
    (1,1) Wall South Edge (southern wall cap bordering floor above)
    (2,1) Wall West Edge (left wall border facing floor on right)
    (3,1) Wall East Edge (right wall border facing floor on left)
  Row 2 (Outer Convex Corners - framing wall masses projecting into floor):
    (0,2) Outer NW Corner (floor on W and N)
    (1,2) Outer NE Corner (floor on E and N)
    (2,2) Outer SW Corner (floor on W and S)
    (3,2) Outer SE Corner (floor on E and S)
  Row 3 (Inner Concave Corners - framing room interior corners cleanly!):
    (0,3) Inner NW Corner (walls on N and W; floor on S and E)
    (1,3) Inner NE Corner (walls on N and E; floor on S and W)
    (2,3) Inner SW Corner (walls on S and W; floor on N and E)
    (3,3) Inner SE Corner (walls on S and E; floor on N and W)
"""

from __future__ import annotations

from pathlib import Path
from PIL import Image

OUT_DIR = Path(__file__).resolve().parent
TILE = 16

# Constrained 9-color hue-shifted pixel-art palette (5-band disciplined!)
# Floor ramp (Band 3 calm mid-low contrast)
FL_BASE = (122, 114, 102, 255)   # #7A7266
FL_LIGHT = (138, 130, 116, 255)  # #8A8274
FL_DARK = (98, 92, 84, 255)      # #625C54
FL_MOSS = (86, 118, 88, 255)     # #567658
FL_MOSS_HI = (108, 144, 102, 255)# #6C9066

# Wall ramp (Band 3 crisp collision edge, cool slate contrasting warm floor)
WL_TOP = (44, 52, 64, 255)       # #2C3440
WL_TOP_VAR = (52, 61, 74, 255)   # #343D4A
WL_BEVEL_HI = (94, 110, 128, 255)# #5E6E80 (top-left key light highlight!)
WL_EDGE_DK = (28, 33, 42, 255)   # #1C212A (crisp collision outline)
WL_FACE = (68, 78, 92, 255)      # #444E5C (south-facing vertical stone masonry)
WL_SHADOW = (82, 76, 70, 255)    # #524C46 (contact shadow cast onto floor)


def new_tile(bg: tuple[int, int, int, int]) -> Image.Image:
    return Image.new("RGBA", (TILE, TILE), bg)


def draw_floor_base() -> Image.Image:
    im = new_tile(FL_BASE)
    px = im.load()
    # Subtle flagstone mortar grid (low contrast so actors pop cleanly!)
    for x in range(TILE):
        px[x, 0] = FL_DARK
        px[x, 8] = FL_DARK
    for y in range(0, 8):
        px[0, y] = FL_DARK
    for y in range(8, 16):
        px[8, y] = FL_DARK
    # Top-left soft stone bevel highlight
    for x in range(1, 15):
        px[x, 1] = FL_LIGHT
        if x != 8:
            px[x, 9] = FL_LIGHT
    return im


def draw_floor_cracked() -> Image.Image:
    im = draw_floor_base()
    px = im.load()
    for cx, cy in ((4, 3), (5, 4), (6, 4), (7, 5), (6, 6), (11, 11), (12, 12), (13, 12)):
        px[cx, cy] = FL_DARK
    return im


def draw_floor_moss() -> Image.Image:
    im = draw_floor_base()
    px = im.load()
    for mx, my in ((2, 2), (3, 2), (2, 3), (3, 3), (4, 3), (9, 10), (10, 10), (10, 11)):
        px[mx, my] = FL_MOSS
    for hx, hy in ((2, 2), (9, 10)):
        px[hx, hy] = FL_MOSS_HI
    return im


def draw_wall_top_fill() -> Image.Image:
    im = new_tile(WL_TOP)
    px = im.load()
    # Subtle dark masonry texture (low noise, calm void behind walls)
    for y in range(0, TILE, 4):
        for x in range(0, TILE, 4):
            if (x + y) % 8 == 0:
                px[x + 1, y + 1] = WL_TOP_VAR
                px[x + 2, y + 1] = WL_TOP_VAR
    return im


def draw_wall_with_borders(
    open_n: bool = False,
    open_s: bool = False,
    open_w: bool = False,
    open_e: bool = False,
    inner_nw: bool = False,
    inner_ne: bool = False,
    inner_sw: bool = False,
    inner_se: bool = False,
) -> Image.Image:
    """Renders a cohesive 16x16 wall tile with pixel-clean mitered bevels & corners.

    Geometry constants across all tiles so adjacent edges align 100% seamlessly:
      - Rim thickness on N/W/E edges: 3 px (0=dark outline, 1=bright bevel, 2=stone trim)
      - South-facing 3/4 wall facade: y=9 bright cap lip, y=10 dark lip, y=11..14 stone face, y=15 dark base
    """
    im = draw_wall_top_fill()
    px = im.load()

    # 1. Straight open edges
    if open_n:
        for x in range(TILE):
            px[x, 0] = WL_EDGE_DK
            px[x, 1] = WL_BEVEL_HI
            px[x, 2] = WL_FACE

    if open_s:
        for x in range(TILE):
            px[x, 9] = WL_BEVEL_HI
            px[x, 10] = WL_EDGE_DK
            for y in range(11, 15):
                px[x, y] = WL_FACE if (x + y) % 5 != 0 else WL_TOP_VAR
            px[x, 15] = WL_EDGE_DK
        for y in range(11, 15):
            px[5, y] = WL_TOP
            px[11, y] = WL_TOP

    if open_w:
        y_end = 10 if open_s else TILE
        for y in range(y_end):
            px[0, y] = WL_EDGE_DK
            px[1, y] = WL_BEVEL_HI
            px[2, y] = WL_FACE
        if open_s:
            for y in range(10, TILE):
                px[0, y] = WL_EDGE_DK

    if open_e:
        y_end = 10 if open_s else TILE
        for y in range(y_end):
            px[15, y] = WL_EDGE_DK
            px[14, y] = WL_BEVEL_HI
            px[13, y] = WL_FACE
        if open_s:
            for y in range(10, TILE):
                px[15, y] = WL_EDGE_DK

    # 2. Clean 45-degree corner miters where two open edges meet
    if open_n and open_w:
        px[0, 0] = WL_EDGE_DK
        px[1, 0] = WL_EDGE_DK
        px[0, 1] = WL_EDGE_DK
        px[1, 1] = WL_BEVEL_HI
        px[2, 1] = WL_BEVEL_HI
        px[1, 2] = WL_BEVEL_HI
        px[2, 2] = WL_FACE
    if open_n and open_e:
        px[15, 0] = WL_EDGE_DK
        px[14, 0] = WL_EDGE_DK
        px[15, 1] = WL_EDGE_DK
        px[14, 1] = WL_BEVEL_HI
        px[13, 1] = WL_BEVEL_HI
        px[14, 2] = WL_BEVEL_HI
        px[13, 2] = WL_FACE
    if open_s and open_w:
        px[0, 9] = WL_EDGE_DK
        px[1, 9] = WL_BEVEL_HI
        px[2, 9] = WL_BEVEL_HI
        px[1, 10] = WL_EDGE_DK
    if open_s and open_e:
        px[15, 9] = WL_EDGE_DK
        px[14, 9] = WL_BEVEL_HI
        px[13, 9] = WL_BEVEL_HI
        px[14, 10] = WL_EDGE_DK

    # 3. Inner Concave Corners matching exact rim geometry (0..2 on N/W, 13..15 on E, 9..15 on S)
    if inner_se:
        # Connects open_e (cols 13..15) above with open_s (rows 9..15) to the right
        for y in range(9, 16):
            px[13, y] = WL_FACE
            px[14, y] = WL_BEVEL_HI if y <= 9 else WL_FACE
            px[15, y] = WL_EDGE_DK if y >= 10 else WL_BEVEL_HI
        px[13, 9] = WL_FACE
        px[14, 9] = WL_BEVEL_HI
        px[15, 9] = WL_BEVEL_HI
        px[14, 10] = WL_EDGE_DK
        px[15, 10] = WL_EDGE_DK
        for y in range(11, 15):
            px[13, y] = WL_FACE
            px[14, y] = WL_BEVEL_HI
            px[15, y] = WL_FACE
        px[15, 15] = WL_EDGE_DK
        px[14, 15] = WL_BEVEL_HI
        px[13, 15] = WL_FACE
        px[15, 11] = WL_FACE
        px[15, 12] = WL_FACE
        px[15, 13] = WL_FACE
        px[15, 14] = WL_FACE
        # Outer border along vertical right face continues cleanly into x=15 below y=10
        px[15, 10] = WL_EDGE_DK
        px[15, 15] = WL_EDGE_DK
        px[14, 9] = WL_BEVEL_HI
        px[15, 9] = WL_BEVEL_HI

    if inner_sw:
        # Mirror of inner_se: connects open_w (cols 0..2) above with open_s (rows 9..15) to the left
        for y in range(9, 16):
            px[2, y] = WL_FACE
            px[1, y] = WL_BEVEL_HI
            px[0, y] = WL_FACE
        px[0, 9] = WL_BEVEL_HI
        px[1, 9] = WL_BEVEL_HI
        px[2, 9] = WL_FACE
        px[0, 10] = WL_EDGE_DK
        px[1, 10] = WL_EDGE_DK
        px[0, 15] = WL_EDGE_DK

    if inner_ne:
        # Connects open_e (cols 13..15) below with open_n (rows 0..2) to the right
        for y in range(0, 3):
            for x in range(13, 16):
                px[x, y] = WL_FACE
        px[14, 1] = WL_BEVEL_HI
        px[15, 1] = WL_BEVEL_HI
        px[14, 2] = WL_BEVEL_HI
        px[15, 0] = WL_EDGE_DK

    if inner_nw:
        # Connects open_w (cols 0..2) below with open_n (rows 0..2) to the left
        for y in range(0, 3):
            for x in range(0, 3):
                px[x, y] = WL_FACE
        px[1, 1] = WL_BEVEL_HI
        px[0, 1] = WL_BEVEL_HI
        px[1, 2] = WL_BEVEL_HI
        px[0, 0] = WL_EDGE_DK

    return im


def build_tileset() -> dict[tuple[int, int], Image.Image]:
    tiles: dict[tuple[int, int], Image.Image] = {
        # Row 0: Floors + Solid Wall Fill
        (0, 0): draw_floor_base(),
        (1, 0): draw_floor_cracked(),
        (2, 0): draw_floor_moss(),
        (3, 0): draw_wall_top_fill(),
        # Row 1: Wall Edges (named by which side of the room they form!)
        (0, 1): draw_wall_with_borders(open_s=True),  # North wall of room (open on S)
        (1, 1): draw_wall_with_borders(open_n=True),  # South wall of room (open on N)
        (2, 1): draw_wall_with_borders(open_e=True),  # West wall of room (open on E)
        (3, 1): draw_wall_with_borders(open_w=True),  # East wall of room (open on W)
        # Row 2: Outer Convex Corners (pillar / alcove corners projecting into floor)
        (0, 2): draw_wall_with_borders(open_n=True, open_w=True),
        (1, 2): draw_wall_with_borders(open_n=True, open_e=True),
        (2, 2): draw_wall_with_borders(open_s=True, open_w=True),
        (3, 2): draw_wall_with_borders(open_s=True, open_e=True),
        # Row 3: Inner Concave Corners (4 interior corners of a walled room!)
        (0, 3): draw_wall_with_borders(inner_se=True),  # Room NW corner (floor at SE)
        (1, 3): draw_wall_with_borders(inner_sw=True),  # Room NE corner (floor at SW)
        (2, 3): draw_wall_with_borders(inner_ne=True),  # Room SW corner (floor at NE)
        (3, 3): draw_wall_with_borders(inner_nw=True),  # Room SE corner (floor at NW)
    }

    atlas = Image.new("RGBA", (TILE * 4, TILE * 4), (0, 0, 0, 0))
    for (cx, cy), tile_im in tiles.items():
        atlas.paste(tile_im, (cx * TILE, cy * TILE))
    atlas.save(OUT_DIR / "synthetic_stone_moss_tileset.png")
    return tiles


def build_assembled_room_preview(tiles: dict[tuple[int, int], Image.Image]) -> None:
    """Assembles a 14x10 room with an interior L-alcove and pillar to test EVERY edge & corner!"""
    # 1 = wall, 0 = floor
    grid = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]
    rows, cols = len(grid), len(grid[0])

    def is_wall(r: int, c: int) -> bool:
        if r < 0 or r >= rows or c < 0 or c >= cols:
            return True
        return grid[r][c] == 1

    room_native = Image.new("RGBA", (cols * TILE, rows * TILE), WL_TOP)
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 0:
                # Deterministic low-repetition floor variation
                h = (r * 7 + c * 13) % 11
                coord = (2, 0) if h == 0 else ((1, 0) if h in (3, 8) else (0, 0))
                tile_im = tiles[coord].copy()
                # Cast subtle 2px contact shadow below north wall facades!
                if is_wall(r - 1, c):
                    px = tile_im.load()
                    for x in range(TILE):
                        px[x, 0] = WL_SHADOW
                        px[x, 1] = FL_DARK
                room_native.paste(tile_im, (c * TILE, r * TILE))
            else:
                n = not is_wall(r - 1, c)
                s = not is_wall(r + 1, c)
                w = not is_wall(r, c - 1)
                e = not is_wall(r, c + 1)
                nw = not is_wall(r - 1, c - 1)
                ne = not is_wall(r - 1, c + 1)
                sw = not is_wall(r + 1, c - 1)
                se = not is_wall(r + 1, c + 1)

                # Select exact tile from our 16-tile atlas (outer corners -> edges -> inner corners -> fill)
                if n and w:
                    coord = (0, 2)
                elif n and e:
                    coord = (1, 2)
                elif s and w:
                    coord = (2, 2)
                elif s and e:
                    coord = (3, 2)
                elif s:
                    coord = (0, 1)
                elif n:
                    coord = (1, 1)
                elif e:
                    coord = (2, 1)
                elif w:
                    coord = (3, 1)
                elif se:
                    coord = (0, 3)
                elif sw:
                    coord = (1, 3)
                elif ne:
                    coord = (2, 3)
                elif nw:
                    coord = (3, 3)
                else:
                    coord = (3, 0)
                room_native.paste(tiles[coord], (c * TILE, r * TILE))

    # Save both native 1x pixel-perfect and 4x nearest-neighbor inspection preview
    room_native.save(OUT_DIR / "assembled_room_native.png")
    room_4x = room_native.resize((cols * TILE * 4, rows * TILE * 4), Image.Resampling.NEAREST)
    room_4x.save(OUT_DIR / "assembled_room_preview_4x.png")
    tileset_4x = Image.open(OUT_DIR / "synthetic_stone_moss_tileset.png").resize(
        (TILE * 4 * 4, TILE * 4 * 4), Image.Resampling.NEAREST
    )
    tileset_4x.save(OUT_DIR / "synthetic_stone_moss_tileset_4x.png")


if __name__ == "__main__":
    built = build_tileset()
    build_assembled_room_preview(built)
    print("Generated synthetic tileset and assembled room preview successfully.")
