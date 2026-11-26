#!/usr/bin/env python3
"""
VERDANT SIGNAL — Phase 3 & Phase 4 Revised Pixel-Art Training Studies (Round 2)
-------------------------------------------------------------------------------
Revises all 5 training studies after the Phase 4 Internal Art Quality Gate:
  - Practice A: Curved 3/4 perspective ribs & orange stripe, cleaner gauge bezel,
    de-jagged shoulder, sharp specular metal bars, reduced orphan pixels.
  - Practice B: Reshaped from round ball into tailored, draped quilted shoulder-
    to-forearm astronaut sleeve swatch with cuff, tension folds, clean clusters.
  - Practice C: Extruded pressurized helmet silhouette (brow overhang, chin vent,
    dual ear pods), anti-banded titanium bezel, cleaner layered glass interior.
  - Practice D: Completely rebuilt fronds as lush continuous tapered crescent
    leaf clusters (matching reference bush craft), calm faceted boulder planes.
  - Practice E: Natural 3/4 contrapposto explorer stance (bent arms, staggered
    stride, cinched waist vs bulky padded shoulders/knees, clean unified clusters).
"""

from __future__ import annotations

import math
from pathlib import Path
from typing import Dict, List, Sequence, Tuple

from pixel_art_core import (
    IDX_TO_TOKEN,
    TOKEN_TO_IDX,
    PixelCanvas,
    audit_sprite_png,
    make_inspection_sheet,
)

OUT_DIR = Path("game/assets/art_tests/pixel_art_training")


def paint_tapered_curve(
    c: PixelCanvas,
    layer: str,
    pts: Sequence[Tuple[float, float, float]],
    token: str,
    mask_layer: str | None = None,
) -> None:
    """
    Paint a continuous, solid, smoothly tapered cluster stroke along control
    points (x, y, radius). Samples densely on integer grid so zero gaps or
    orphan dot-trails ever occur!
    """
    for i in range(len(pts) - 1):
        x0, y0, r0 = pts[i]
        x1, y1, r1 = pts[i + 1]
        dist = max(1, int(math.ceil(math.hypot(x1 - x0, y1 - y0) * 3.0)))
        for s in range(dist + 1):
            t = s / dist
            x = x0 + (x1 - x0) * t
            y = y0 + (y1 - y0) * t
            r = r0 + (r1 - r0) * t
            if r <= 0.65:
                ix, iy = int(round(x)), int(round(y))
                if mask_layer is None or c.get_px(mask_layer, ix, iy) != ".":
                    c.set_px(layer, ix, iy, token)
            else:
                c.fill_ellipse(layer, x, y, r, r, token, mask_layer=mask_layer)


def absorb_accidental_orphans(
    c: PixelCanvas,
    layer_name: str,
    protected_tokens: Sequence[str] = ("M5", "V5", "V4", "O6", "S5"),
) -> int:
    """
    Mechanical cleanup pass (Cure / the-pixel.art rule): absorb unintended 1px
    isolated orphan pixels on a layer into their most frequent 4-neighbor token,
    while preserving intentional focal specular/accent pixels.
    """
    lyr = c.layer(layer_name)
    H, W = lyr.shape
    prot = {TOKEN_TO_IDX[t] for t in protected_tokens}
    fixed = 0
    snap = lyr.copy()
    for y in range(H):
        for x in range(W):
            v = int(snap[y, x])
            if v == 0 or v in prot:
                continue
            neigh: List[int] = []
            same = 0
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < W and 0 <= ny < H:
                    nv = int(snap[ny, nx])
                    if nv == v:
                        same += 1
                    elif nv != 0:
                        neigh.append(nv)
            if same == 0 and neigh:
                # Absorb into most common solid neighbor
                best = max(set(neigh), key=neigh.count)
                lyr[y, x] = best
                fixed += 1
    return fixed


# ==============================================================================
# PRACTICE A (Revised) — Weathered Metallic Expedition Canister (48x48)
# ==============================================================================
def build_practice_a() -> PixelCanvas:
    c = PixelCanvas(48, 48)
    for lyr in ["shadow", "handle", "body", "cap", "details"]:
        c.add_layer(lyr)

    # 1. Crisp grounded rightward cast shadow (reference angle + organic right tail)
    c.fill_ellipse("shadow", 24.5, 41.2, 12.2, 3.0, "O0")
    c.fill_polygon("shadow", [(24, 39), (40, 39), (42, 41), (38, 43), (22, 43)], "O0")
    for px, py in [(41, 39), (42, 40), (39, 43), (40, 42)]:
        c.set_px("shadow", px, py, ".")

    # 2. Sturdy right-side carry handle lug
    c.fill_polygon(
        "handle",
        [(31, 18), (37, 18), (38, 20), (38, 31), (37, 33), (31, 33),
         (31, 30), (35, 30), (35, 21), (31, 21)],
        "M0",
    )
    c.fill_polygon(
        "handle",
        [(31, 19), (36, 19), (37, 20), (37, 30), (36, 31), (31, 31),
         (31, 30), (35, 30), (35, 20), (31, 20)],
        "M1",
    )
    c.draw_line("handle", 32, 19, 36, 19, "M3")
    c.draw_line("handle", 33, 19, 35, 19, "M4")
    c.draw_line("handle", 36, 21, 36, 29, "M2")

    # 3. Main vertical cylindrical titanium body (x=12..32, y=13..40) with curved 3/4 ribs!
    for y in range(13, 41):
        for x in range(12, 33):
            if y >= 37:
                nx = (x - 22.0) / 10.4
                ny = (y - 36.5) / 4.0
                if nx * nx + ny * ny > 1.0:
                    continue
            u = (x - 12.0) / 20.0
            # Subtle elliptical droop curve (sag = +1.8px at center x=22) for true 3/4 cylinder!
            sag = 1.8 * math.sin(u * math.pi)
            y_corr = y - sag

            # Crisp metallic vertical reflection stripes (abrupt value leaps!)
            if u < 0.08:
                tok = "M1" if y < 35 else "M0"
            elif u < 0.16:
                tok = "M2"
            elif u < 0.27:
                tok = "M4" if y_corr < 34 else "M3"
            elif u < 0.37:
                tok = "M5" if (15.5 <= y_corr <= 34.0) else "M4"
            elif u < 0.48:
                tok = "M3" if y_corr < 34 else "M2"
            elif u < 0.63:
                tok = "M2" if y_corr < 35 else "M1"
            elif u < 0.80:
                tok = "M1"
            elif u < 0.91:
                tok = "M0"
            else:
                tok = "V2" if (16 <= y <= 35) else "M0"

            # Projected shadow from upper shoulder overhang (curved to match cylinder!)
            if y_corr < 13.4:
                tok = "M0"
            elif y_corr < 14.5:
                tok = "M1" if u < 0.38 else "M0"

            # Reinforced dark bottom foot collar (y_corr >= 35.5)
            if y_corr >= 35.5:
                if y_corr < 36.4:
                    tok = "M3" if u < 0.42 else ("M2" if u < 0.62 else "M0")
                elif y_corr < 37.6:
                    tok = "M2" if u < 0.46 else ("M1" if u < 0.68 else "M0")
                else:
                    tok = "M1" if u < 0.32 else "M0"

            # Outer right edge anchor
            if x == 32:
                tok = "M0"
            c.set_px("body", x, y, tok)

    # 4. Curved 3/4 expedition-orange identification stripe (y_corr in 19.5..23.5) — clean above gauge!
    for x in range(13, 32):
        u = (x - 12.0) / 20.0
        sag = 1.8 * math.sin(u * math.pi)
        for dy in range(4):
            yy = int(round(19.5 + sag)) + dy
            if u < 0.12:
                tok = "S1"
            elif u < 0.28:
                tok = "S4"
            elif u < 0.39:
                tok = "S5" if dy == 0 else "S4"
            elif u < 0.58:
                tok = "S3"
            elif u < 0.78:
                tok = "S2"
            else:
                tok = "S1"
            c.set_px("details", x, yy, tok)
        # Crisp curved clamping rib right above (y_corr=18) and below (y_corr=32.5)
        for rib_base in (17.6, 33.0):
            ry = int(round(rib_base + sag))
            top_t = "M5" if 0.20 <= u <= 0.42 else ("M4" if u < 0.58 else ("M2" if u < 0.85 else "V2"))
            bot_t = "M2" if u < 0.42 else ("M1" if u < 0.64 else "M0")
            c.set_px("details", x, ry, top_t)
            c.set_px("details", x, ry + 1, bot_t)
            c.set_px("details", x, ry + 2, "M1" if u < 0.40 else "M0")

    # Small deliberate paint scuff chip revealing bright titanium on the orange band (2px cluster, not noise)
    c.set_px("details", 16, 21, "M4")
    c.set_px("details", 17, 21, "M4")
    c.set_px("details", 16, 22, "M3")

    # 5. Clean recessed circular pressure gauge seated in the calm lower titanium zone (center 20, 29.5)
    c.fill_ellipse("details", 20.0, 29.5, 4.4, 4.4, "M0")
    # Crisp lit bottom-right concave bezel rim
    for px, py in [(22, 32), (23, 31), (23, 30), (21, 33), (22, 33)]:
        c.set_px("details", px, py, "M3")
    c.set_px("details", 23, 32, "M4")
    # Dark teal glass face (clean 3px radius!)
    c.fill_ellipse("details", 20.0, 29.5, 3.1, 3.1, "V0")
    c.fill_ellipse("details", 20.2, 29.8, 2.4, 2.3, "V2")
    c.fill_rect("details", 19, 29, 21, 30, "V3")
    # Clean crisp gauge needle + upper-left glass catchlight
    c.set_px("details", 18, 28, "V5")
    c.set_px("details", 20, 30, "M5")
    c.set_px("details", 21, 29, "M5")
    c.set_px("details", 22, 28, "M4")

    # 6. Clean beveled top shoulder dome & central pressure valve cap (de-jagged monotonic curves!)
    c.fill_ellipse("cap", 22.0, 12.2, 10.2, 3.4, "M2")
    c.fill_ellipse("cap", 21.0, 11.4, 8.6, 2.5, "M3")
    # Crisp monotonic top-left metallic rim highlight
    for px, py in [(14, 11), (15, 10), (16, 10), (17, 9), (18, 9), (19, 9), (20, 9), (21, 9)]:
        c.set_px("cap", px, py, "M4")
    for px, py in [(16, 10), (17, 10), (18, 9), (19, 9)]:
        c.set_px("cap", px, py, "M5")
    # Shadowed right rim + cast shadow from cap
    for px, py in [(29, 10), (30, 11), (31, 11), (31, 12), (30, 13), (28, 14)]:
        c.set_px("cap", px, py, "M1")
    for px, py in [(31, 12), (30, 12), (24, 10), (25, 10), (26, 10), (27, 11), (28, 11), (25, 11), (26, 11)]:
        c.set_px("cap", px, py, "M0")

    # Raised valve cap (x=18..26, y=6..10)
    for y in range(6, 11):
        for x in range(18, 27):
            if y == 6 and x in (18, 26):
                continue
            u = (x - 18.0) / 8.0
            if y == 6:
                tok = "M5" if u < 0.50 else ("M4" if u < 0.78 else "M2")
            elif y == 7:
                tok = "M4" if u < 0.45 else ("M3" if u < 0.72 else "M1")
            else:
                tok = "M2" if u < 0.18 else ("M5" if (u < 0.46 and y == 8) else ("M4" if u < 0.48 else ("M2" if u < 0.72 else "M0")))
            c.set_px("cap", x, y, tok)
    # Tiny ruby pressure latch on cap
    c.fill_rect("cap", 22, 8, 23, 9, "O6")
    c.set_px("cap", 22, 8, "S5")

    absorb_accidental_orphans(c, "body")
    absorb_accidental_orphans(c, "cap")
    absorb_accidental_orphans(c, "details")
    return c


# ==============================================================================
# PRACTICE B (Revised) — Tailored Quilted Orange Astronaut Sleeve & Cuff (48x48)
# Fixes Round 1's "round pumpkin" silhouette: now unmistakably a bent, padded
# astronaut suit shoulder & forearm sleeve with dark brown cinch strap, metal
# buckle, elbow compression folds, and ribbed titanium wrist lock ring!
# ==============================================================================
def build_practice_b() -> PixelCanvas:
    c = PixelCanvas(48, 48)
    for lyr in ["shadow", "cuff", "fabric", "seams", "strap"]:
        c.add_layer(lyr)

    # 1. Grounded cast shadow underneath draped sleeve
    c.fill_polygon("shadow", [(13, 39), (37, 38), (43, 40), (41, 43), (18, 43), (11, 41)], "O0")
    c.set_px("shadow", 42, 40, ".")

    # 2. Ribbed dark metal/rubber wrist lock ring aligned cleanly with lower-right sleeve cuff!
    c.fill_polygon("cuff", [(32, 33), (39, 28), (43, 32), (42, 38), (36, 41), (31, 38)], "M1")
    c.draw_line("cuff", 33, 33, 39, 29, "M4", thickness=2)
    c.draw_line("cuff", 34, 32, 38, 29, "M5")
    c.draw_line("cuff", 35, 35, 41, 31, "M2", thickness=2)
    c.draw_line("cuff", 35, 38, 42, 34, "M0", thickness=2)
    c.fill_ellipse("cuff", 39.8, 36.2, 2.2, 3.2, "B0")
    c.fill_ellipse("cuff", 39.5, 36.2, 1.2, 2.0, "S0")

    # 3. Draped, bent padded orange astronaut shoulder -> elbow -> forearm silhouette!
    sleeve_poly = [
        (7, 16), (11, 9), (19, 6), (27, 8), (33, 14),
        (37, 22), (39, 29), (35, 37), (28, 40), (19, 39),
        (12, 35), (7, 27),
    ]
    c.fill_polygon("fabric", sleeve_poly, "S3")

    # Sculpt 3 distinct padded quilted baffles across the bent sleeve (ZERO modulo static!)
    for y in range(6, 41):
        for x in range(6, 40):
            if c.get_px("fabric", x, y) == ".":
                continue
            dx = x - 21.0
            dy = y - 23.0
            s = (dx * 0.62 + dy * 0.78) / 18.0
            t = (-dx * 0.78 + dy * 0.62) / 13.5

            if s < -0.28:
                u_b = (s + 0.90) / 0.62
            elif s < 0.28:
                u_b = (s + 0.28) / 0.56
            else:
                u_b = (s - 0.28) / 0.62
            u_b = max(0.0, min(1.0, u_b))

            nx = (x - 20.5) / 16.0 + 0.20 * (u_b - 0.42)
            ny = (y - 21.5) / 16.5 + 0.30 * (u_b - 0.40)

            fold = 0.0
            if t > 0.18 and -0.30 < s < 0.50:
                fold = -0.24 * math.exp(-((s - 0.08) ** 2) / 0.09) * min(1.0, (t - 0.18) * 1.6)
                fold += 0.15 * math.exp(-((s - 0.32) ** 2) / 0.06) * min(1.0, (t - 0.12) * 1.4)

            nz = math.sqrt(max(0.06, 1.0 - min(0.94, nx * nx * 0.68 + ny * ny * 0.68)))
            dot = (-0.64 * nx - 0.60 * ny + 0.48 * nz) + fold

            if dot < -0.20:
                tok = "S0"
            elif dot < 0.05:
                tok = "S1"
            elif dot < 0.34:
                tok = "S2"
            elif dot < 0.60:
                tok = "S3"
            elif dot < 0.80:
                tok = "S4"
            else:
                tok = "S5"
            c.set_px("fabric", x, y, tok)

    # 4. Crisp hand-sculpted quilted baffle seam channels + sunlit padded lips (bold 2px clean curves!)
    seam1 = [(9, 21), (13, 18), (18, 16), (24, 15), (29, 16), (33, 18)]
    seam2 = [(14, 33), (19, 29), (24, 27), (30, 25), (35, 25), (38, 26)]
    for seam in (seam1, seam2):
        c.draw_polyline("seams", seam, "S1", mask_layer="fabric")
        lit_lip = [(x, y + 1) for x, y in seam if x <= 23]
        c.draw_polyline("seams", lit_lip, "S4", mask_layer="fabric")
        for x, y in seam:
            if 11 <= x <= 18 and c.get_px("fabric", x, y + 1) != ".":
                c.set_px("seams", x, y + 1, "S5")

    # Clean bold diagonal cloth compression fold below strap (2px shaded valley + 2px lit ridge)
    c.draw_polyline("seams", [(18, 36), (21, 33), (25, 31)], "S0", mask_layer="fabric")
    c.draw_polyline("seams", [(19, 37), (22, 34), (26, 32)], "S1", mask_layer="fabric")
    c.draw_polyline("seams", [(17, 34), (20, 31), (24, 29)], "S3", mask_layer="fabric")

    # Muted-teal expedition shoulder patch sewn cleanly onto top baffle (x=15..22, y=10..14)
    c.fill_polygon("seams", [(15, 11), (22, 9), (24, 12), (17, 14)], "V2", mask_layer="fabric")
    c.draw_line("seams", 16, 11, 21, 10, "V3", mask_layer="fabric")
    c.set_px("seams", 17, 11, "V4")
    c.draw_line("seams", 17, 14, 24, 12, "S1", mask_layer="fabric")

    # 5. Dark weathered brown cinch webbing strap gripping the forearm + projected shadow!
    strap_pts = [(11, 29), (16, 25), (22, 22), (28, 20), (34, 19)]
    for i in range(len(strap_pts) - 1):
        x0, y0 = strap_pts[i]
        x1, y1 = strap_pts[i + 1]
        steps = max(1, abs(x1 - x0) + abs(y1 - y0))
        for s in range(steps + 1):
            t = s / steps
            x = int(round(x0 + (x1 - x0) * t))
            y = int(round(y0 + (y1 - y0) * t))
            for dy in range(-2, 2):
                yy = y + dy
                if c.get_px("fabric", x, yy) == ".":
                    continue
                if dy == -2:
                    tok = "B4" if x < 21 else ("B3" if x < 29 else "B2")
                elif dy == -1:
                    tok = "B3" if x < 22 else ("B2" if x < 30 else "B1")
                elif dy == 0:
                    tok = "B2" if x < 24 else "B1"
                else:
                    tok = "B1" if x < 22 else "B0"
                c.set_px("strap", x, yy, tok)
            # Crisp 2px cast shadow directly beneath strap onto orange cloth!
            for sh in (2, 3):
                if c.get_px("fabric", x, y + sh) != ".":
                    c.set_px("seams", x, y + sh, "S0" if (sh == 2 and x > 18) else "S1")

    # Weathered titanium D-ring buckle seated cleanly on the strap at (21..27, 19..25)
    c.fill_rect("strap", 21, 19, 27, 25, "M0")
    c.fill_rect("strap", 22, 20, 26, 24, "M2")
    c.fill_rect("strap", 23, 21, 25, 23, "B2")
    c.draw_line("strap", 21, 19, 26, 19, "M4")
    c.draw_line("strap", 21, 19, 21, 24, "M3")
    c.set_px("strap", 22, 19, "M5")
    c.set_px("strap", 23, 19, "M5")

    # Clean sculpted sel-out on outer perimeter (shadowed bottom-right dark, sunlit upper-left warm!)
    c.apply_sel_out(
        "fabric",
        {
            "S0": ("S1", "S0", "B0"),
            "S1": ("S2", "S1", "S0"),
            "S2": ("S2", "S1", "S0"),
            "S3": ("S2", "S2", "S1"),
            "S4": ("S3", "S2", "S1"),
            "S5": ("S4", "S3", "S2"),
        },
        include_exterior=False,
    )
    absorb_accidental_orphans(c, "fabric")
    absorb_accidental_orphans(c, "seams")
    absorb_accidental_orphans(c, "strap")
    c.add_layer("final_polish")
    comp = c.composite_indices()
    H, W = comp.shape
    prot = {TOKEN_TO_IDX[t] for t in ("M5", "V5", "V4", "O6", "S5", "B4")}
    for y in range(H):
        for x in range(W):
            v = int(comp[y, x])
            if v == 0 or v in prot:
                continue
            same = 0
            neigh: List[int] = []
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < W and 0 <= ny < H:
                    nv = int(comp[ny, nx])
                    if nv == v:
                        same += 1
                    elif nv != 0:
                        neigh.append(nv)
            if same == 0 and neigh:
                c.set_px("final_polish", x, y, IDX_TO_TOKEN[max(set(neigh), key=neigh.count)])
    return c


# ==============================================================================
# PRACTICE C (Revised) — Extruded Pressurized Glass Helmet Visor (48x48)
# Fixes Round 1's plain circle silhouette & bezel banding: adds cantilevered
# visor brow hood, side acoustic pods on both sides, recessed chin rebreather
# grille, anti-banded metallic bezel, and deep translucent curved visor glass!
# ==============================================================================
def build_practice_c() -> PixelCanvas:
    c = PixelCanvas(48, 48)
    for lyr in ["rear_pod", "shell", "bezel", "visor", "visor_fx", "front_pods"]:
        c.add_layer(lyr)

    # 1. Far-right ear transducer pod peeking behind 3/4 turned helmet (breaks circular symmetry!)
    c.fill_polygon("rear_pod", [(38, 19), (42, 20), (42, 27), (38, 28)], "M0")
    c.fill_rect("rear_pod", 39, 21, 41, 25, "M1")
    c.set_px("rear_pod", 40, 21, "M2")

    # 2. Sculpted pressurized helmet dome + protruding brow hood + angled chin guard!
    c.fill_ellipse("shell", 22.5, 22.0, 17.0, 16.2, "S3")
    # Extruded brow overhang & contoured jaw/chin-guard shell
    c.fill_polygon(
        "shell",
        [(13, 10), (26, 7), (36, 12), (40, 19), (39, 29), (33, 37), (23, 39), (12, 36), (8, 28)],
        "S3",
    )
    c.shade_sculpted_volume(
        "shell", 22.5, 21.5, 17.5, 16.5,
        ramp=["S0", "S1", "S2", "S3", "S4", "S5"],
        thresholds=[-0.24, 0.04, 0.30, 0.58, 0.80],
    )

    # Warm ceramic-ivory dorsal crest stripe with crisp panel seam
    for y in range(6, 15):
        for x in range(19, 27):
            if c.get_px("shell", x, y) != ".":
                if x in (19, 26):
                    c.set_px("shell", x, y, "S1")
                elif y < 9:
                    c.set_px("shell", x, y, "M5" if x < 23 else "O5")
                elif y < 12:
                    c.set_px("shell", x, y, "O5" if x < 24 else "M3")
                else:
                    c.set_px("shell", x, y, "M3" if x < 24 else "M2")

    # Sculpted brow visor-hood overhang ridge casting crisp shadow onto bezel top!
    c.draw_polyline("shell", [(14, 13), (20, 11), (28, 11), (34, 13)], "S5", mask_layer="shell")
    c.draw_polyline("shell", [(14, 14), (20, 12), (28, 12), (35, 14)], "S1", mask_layer="shell")

    # 3. Clean anti-banded titanium visor bezel (tight compressed value zones, zero stair-step bands!)
    c.fill_ellipse("bezel", 25.5, 23.5, 14.2, 10.6, "M1")
    for y in range(12, 36):
        for x in range(10, 41):
            if c.get_px("bezel", x, y) == ".":
                continue
            nx = (x - 25.5) / 14.2
            ny = (y - 23.5) / 10.6
            # Compress highlight sharply into upper-left metallic bevel, keep right solid M1/M0!
            if nx < -0.15 and ny < 0.05:
                tok = "M5" if (nx + ny < -0.95) else ("M4" if nx + ny < -0.55 else "M3")
            elif ny < -0.55 and nx < 0.45:
                tok = "M3"
            elif nx > 0.35 or ny > 0.55:
                tok = "M0"
            else:
                tok = "M2" if (nx + ny < 0.15) else "M1"
            c.set_px("bezel", x, y, tok)
    # Recessed dark rubber gasket gripping the curved glass
    c.fill_ellipse("bezel", 25.6, 23.8, 12.6, 8.9, "B0")

    # 4. Deep Curved Dark-Teal Glass Visor (Clean Spherical Reflection + Subtle Interior Depth!)
    c.fill_ellipse("visor", 25.6, 23.8, 11.7, 8.0, "V1")
    for y in range(15, 33):
        for x in range(13, 39):
            if c.get_px("visor", x, y) == ".":
                continue
            nx = (x - 25.6) / 11.7
            ny = (y - 23.8) / 8.0
            r2 = nx * nx + ny * ny

            # Crisp deep projected shadow cast by brow overhang along upper-left interior rim!
            if ny < -0.56 or (nx < -0.66 and ny < 0.10):
                c.set_px("visor", x, y, "V0")
                continue

            # Subtle recessed interior depth: darkened lower-center cavity suggesting helmet liner & space behind glass
            # Overlaid with clean spherical horizon reflection sweep!
            horizon_y = 0.04 - 0.18 * (nx * nx) - 0.10 * nx
            if ny < horizon_y - 0.24:
                tok = "V2" if nx < 0.35 else "V1"
            elif ny < horizon_y + 0.08:
                tok = "V3" if (-0.42 < nx < 0.48) else "V2"
            elif ny < horizon_y + 0.42:
                tok = "V1" if (-0.55 < nx < 0.35) else "V0"
            else:
                # Subtle cool-teal + warm-amber lower glass rim bounce
                tok = "V2" if (-0.30 < nx < 0.52 and r2 > 0.48) else "V0"
            c.set_px("visor", x, y, tok)

    # Subtle curved glass reflection arc (RAZOR-SHARP upper-left specular slash!)
    paint_tapered_curve(
        c, "visor_fx",
        [(16.5, 22.0, 1.3), (18.2, 19.6, 1.4), (21.0, 18.2, 1.3), (24.0, 17.8, 0.9)],
        "V4", mask_layer="visor",
    )
    paint_tapered_curve(
        c, "visor_fx",
        [(17.0, 21.4, 0.9), (18.8, 19.3, 1.0), (21.4, 18.2, 0.9), (23.2, 18.0, 0.5)],
        "V5", mask_layer="visor",
    )
    # Crisp warm-cream peak specular core inside slash!
    for px, py in [(18, 20), (19, 19), (20, 19), (21, 18), (19, 20)]:
        c.set_px("visor_fx", px, py, "M5")
    # Secondary small crisp catchlight glint cleanly separated below-left
    c.fill_rect("visor_fx", 16, 24, 17, 25, "V5")
    c.set_px("visor_fx", 16, 24, "M5")
    # Clean bottom-right specular rim bounce along lower curved glass edge
    paint_tapered_curve(
        c, "visor_fx",
        [(27.5, 30.2, 0.6), (30.5, 29.8, 0.6), (33.0, 28.6, 0.5)],
        "V3", mask_layer="visor",
    )
    c.set_px("visor_fx", 30, 30, "V4")
    c.set_px("visor_fx", 31, 30, "V4")

    # 5. Front-left acoustic ear transducer housing + short stub antenna + chin rebreather vent + neck ring!
    c.fill_polygon("front_pods", [(5, 19), (11, 18), (12, 29), (7, 31), (4, 27), (4, 22)], "M1")
    c.fill_rect("front_pods", 6, 19, 10, 23, "M3")
    c.draw_line("front_pods", 6, 19, 9, 19, "M4")
    c.set_px("front_pods", 7, 19, "M5")
    c.fill_rect("front_pods", 7, 25, 10, 29, "M0")
    # Muted-teal LED telemetry bar on ear pod
    c.fill_rect("front_pods", 7, 26, 9, 27, "V3")
    c.set_px("front_pods", 7, 26, "V4")
    # Short angled tactical mic/comm stub rising cleanly above left ear pod
    c.draw_line("front_pods", 7, 12, 7, 18, "M1", thickness=2)
    c.draw_line("front_pods", 7, 12, 7, 17, "M3")
    c.set_px("front_pods", 7, 11, "V4")

    # Recessed chin rebreather grille at lower front (y=34..37)
    c.fill_rect("front_pods", 20, 35, 29, 37, "M0")
    for gx in (21, 24, 27):
        c.draw_line("front_pods", gx, 35, gx, 36, "M3")

    # Heavy pressurized titanium neck lock ring (y=37..43)
    c.fill_ellipse("front_pods", 24.0, 40.0, 13.5, 3.6, "M1")
    for x in range(11, 38):
        for y in range(37, 44):
            if c.get_px("front_pods", x, y) == ".":
                continue
            u = (x - 11.0) / 26.0
            if y == 37:
                tok = "M0"
            elif y == 38:
                tok = "M4" if u < 0.36 else ("M3" if u < 0.56 else "M1")
            elif y == 39:
                tok = "M5" if (0.14 < u < 0.32) else ("M3" if u < 0.52 else ("M2" if u < 0.70 else "M0"))
            elif y == 40:
                tok = "M2" if u < 0.50 else ("M1" if u < 0.72 else "M0")
            else:
                tok = "M1" if u < 0.40 else "B0"
            c.set_px("front_pods", x, y, tok)

    c.apply_sel_out(
        "shell",
        {
            "S0": ("S1", "S0", "B0"),
            "S1": ("S2", "S1", "B0"),
            "S2": ("S2", "S1", "S0"),
            "S3": ("S2", "S1", "S0"),
            "S4": ("S3", "S2", "S1"),
            "S5": ("S4", "S3", "S2"),
            "O5": ("M3", "M2", "M1"),
            "M5": ("M4", "M3", "M1"),
            "M3": ("M2", "M1", "M0"),
        },
        include_exterior=False,
    )
    for lyr in ("shell", "bezel", "visor", "front_pods"):
        absorb_accidental_orphans(c, lyr)
    return c


# ==============================================================================
# PRACTICE D (Revised) — Organic Mossy Basalt Relic & Lush Alien Fronds (48x48)
# Fixes Round 1's speckled 138-orphan dot fronds: now builds lush, continuous,
# tapered 3-4px sunlit crescent leaf clusters directly echoing the reference's
# bush fronds, over a deep plum-burgundy core and calm faceted river stone!
# ==============================================================================
def build_practice_d() -> PixelCanvas:
    c = PixelCanvas(48, 48)
    for lyr in ["shadow", "stone", "moss", "core", "fronds", "berries"]:
        c.add_layer(lyr)

    # 1. Grounded rightward cast shadow with organic broken edge
    c.fill_ellipse("shadow", 25.0, 38.8, 16.0, 4.0, "O0")
    c.fill_polygon("shadow", [(25, 36), (42, 36), (44, 38), (41, 41), (24, 41)], "O0")
    for px, py in [(43, 36), (44, 37), (42, 41)]:
        c.set_px("shadow", px, py, ".")

    # 2. Calm, bold faceted basalt boulder (inspired by reference pond stones — NO noisy sin/cos static!)
    stone_poly = [
        (9, 35), (10, 27), (14, 21), (22, 19), (30, 21),
        (36, 25), (38, 32), (35, 38), (27, 40), (15, 39),
    ]
    c.fill_polygon("stone", stone_poly, "B2")
    # 4 bold painterly rock planes (upper-left lit cap, mid-front warm face, right shadowed plane, deep base)
    c.fill_polygon("stone", [(11, 29), (14, 22), (22, 20), (27, 23), (24, 29), (15, 32)], "B3", mask_layer="stone")
    c.fill_polygon("stone", [(13, 25), (17, 21), (23, 21), (21, 26), (15, 27)], "M3", mask_layer="stone")
    c.fill_polygon("stone", [(16, 22), (21, 21), (20, 24), (16, 24)], "O5", mask_layer="stone")
    c.fill_polygon("stone", [(27, 22), (36, 25), (38, 33), (34, 38), (25, 39), (24, 31)], "B1", mask_layer="stone")
    c.fill_polygon("stone", [(29, 31), (37, 31), (36, 38), (25, 40), (14, 39), (11, 36)], "B0", mask_layer="stone")
    # Subtle stone cleft line separating left & right rock facets
    c.draw_polyline("stone", [(24, 24), (25, 29), (23, 35)], "B1", mask_layer="stone")

    # 3. Soft continuous olive moss cushions draping over rock ledges (bold clusters, zero static!)
    for mx, my, rx, ry in [(15, 26, 6.0, 3.6), (22, 25, 7.2, 4.0), (29, 27, 5.4, 3.4), (14, 34, 4.8, 2.6)]:
        c.fill_ellipse("moss", mx, my, rx, ry, "O2", mask_layer="stone")
    # Lit upper moss crests + cool shaded moss undersides
    for mx, my, rx, ry in [(14, 24.5, 4.2, 2.0), (21, 23.5, 5.0, 2.2), (13, 33.0, 3.0, 1.4)]:
        c.fill_ellipse("moss", mx, my, rx, ry, "O3", mask_layer="moss")
    c.fill_ellipse("moss", 14.5, 23.8, 2.2, 1.1, "O4", mask_layer="moss")
    for mx, my, rx, ry in [(29, 28.8, 4.8, 2.2), (22, 28.0, 5.5, 1.8), (16, 35.8, 4.0, 1.3)]:
        c.fill_ellipse("moss", mx, my, rx, ry, "O1", mask_layer="moss")
    c.fill_ellipse("moss", 31.0, 29.2, 3.0, 1.6, "O0", mask_layer="moss")

    # 4. Dense deep plum-burgundy foliage interior core (the reference's signature color-depth trick!)
    c.fill_ellipse("core", 23.0, 19.0, 11.2, 6.8, "B0")
    c.fill_ellipse("core", 22.8, 18.2, 10.2, 6.0, "S0")
    c.fill_ellipse("core", 22.0, 17.4, 8.2, 4.5, "S1")

    # 5. Lush, continuous, tapered sunlit ochre-parchment curved leaf fronds (3-4px bold blades!)
    def paint_lush_frond(
        spine: Sequence[Tuple[float, float, float]],
        lit: bool = True,
    ) -> None:
        # 1) Shaded olive-green underside shadow slightly shifted down-right
        sh_pts = [(x + 0.6, y + 1.1, r * 0.95) for x, y, r in spine]
        paint_tapered_curve(c, "fronds", sh_pts, "O1" if lit else "O0")
        # 2) Lush mid-olive blade body
        paint_tapered_curve(c, "fronds", spine, "O3" if lit else "O2")
        # 3) Sunlit warm parchment-ochre upper ridge along top-left face of blade!
        if lit:
            hi_pts = [(x - 0.3, y - 0.6, max(0.5, r * 0.72)) for x, y, r in spine[:-1]]
            paint_tapered_curve(c, "fronds", hi_pts, "O4")
            # Focused warm sunlit cream crest along the arched bend!
            if len(spine) >= 3:
                peak_pts = [(x - 0.3, y - 0.7, max(0.45, r * 0.48)) for x, y, r in spine[1:-1]]
                paint_tapered_curve(c, "fronds", peak_pts, "O5")
        else:
            hi_pts = [(x - 0.2, y - 0.5, max(0.5, r * 0.60)) for x, y, r in spine[:-1]]
            paint_tapered_curve(c, "fronds", hi_pts, "O3")
            if len(spine) >= 3:
                paint_tapered_curve(c, "fronds", [(spine[1][0], spine[1][1] - 0.6, 0.7)], "O4")

    # Back-layer fronds first (painter's depth order!)
    paint_lush_frond([(22, 13, 1.8), (18, 9.5, 1.9), (14, 9.5, 1.5), (10.5, 12.5, 0.9)], lit=True)
    paint_lush_frond([(24, 13, 1.8), (27, 9.5, 1.8), (31, 10.0, 1.4), (34, 13.0, 0.8)], lit=True)
    paint_lush_frond([(23, 12, 1.7), (22, 8.5, 1.6), (19.5, 7.2, 1.2), (17.5, 8.2, 0.7)], lit=True)
    # Side sweeping bold fronds
    paint_lush_frond([(19, 15, 2.0), (14, 14.5, 2.1), (10.5, 17.5, 1.6), (8.5, 21.5, 0.8)], lit=True)
    paint_lush_frond([(27, 15, 2.0), (32, 15.0, 2.0), (35.5, 18.0, 1.5), (37.0, 22.0, 0.8)], lit=False)
    # Foreground cascading hero fronds drooping over the deep plum core (bold 3-4px clusters!)
    paint_lush_frond([(21, 14.5, 2.1), (18.5, 17.5, 2.2), (17.0, 21.5, 1.8), (16.5, 25.5, 0.9)], lit=True)
    paint_lush_frond([(24.5, 14.5, 2.1), (25.0, 18.0, 2.2), (26.0, 22.0, 1.7), (27.5, 25.5, 0.9)], lit=True)
    paint_lush_frond([(27.5, 16.0, 1.8), (30.0, 19.0, 1.8), (31.5, 22.8, 1.2)], lit=False)

    # 6. 4 crisp ruby-crimson spore berries tucked in the shadowed crevices (2x2 + 1px warm catchlight)
    for bx, by in [(13, 19), (21, 21), (28, 19), (21, 13)]:
        c.fill_rect("berries", bx, by, bx + 1, by + 1, "O6")
        c.set_px("berries", bx + 1, by + 1, "S1")
        c.set_px("berries", bx, by, "S5")

    # Small grounded sunlit pebbles beside base
    c.fill_rect("stone", 7, 37, 8, 38, "B1")
    c.set_px("stone", 7, 37, "M3")
    c.fill_rect("stone", 40, 34, 41, 35, "B1")
    c.set_px("stone", 40, 34, "M3")

    for lyr in ("stone", "moss", "core", "fronds"):
        absorb_accidental_orphans(c, lyr)
    return c


# ==============================================================================
# PRACTICE E (Revised) — Natural 3/4 Stance Miniature Dr. Mara Lin (64x64)
# Fixes Round 1's stiff boxy Lego torso/legs: introduces true 3/4 contrapposto
# stance, staggered stride with negative space between legs, bent explorer arms,
# cinched waist vs bulky padded shoulders, and clean unified cluster edges!
# ==============================================================================
def build_practice_e() -> PixelCanvas:
    c = PixelCanvas(64, 64)
    for lyr in [
        "shadow", "backpack", "rear_arm", "rear_leg", "front_leg",
        "boots", "torso", "harness", "front_arm", "helmet", "visor",
    ]:
        c.add_layer(lyr)

    # 1. Grounded directional cast shadow extending rightward under staggered boots
    c.fill_ellipse("shadow", 34.0, 57.2, 13.5, 2.7, "O0")
    c.fill_polygon("shadow", [(30, 56), (49, 56), (51, 58), (46, 59), (27, 59)], "O0")
    c.set_px("shadow", 50, 56, ".")
    c.set_px("shadow", 48, 59, ".")

    # 2. Asymmetrical Life-Support Backpack + Telemetry Antenna behind left/upper back
    c.fill_polygon("backpack", [(16, 17), (25, 17), (25, 35), (17, 35), (15, 32), (15, 20)], "M1")
    c.fill_polygon("backpack", [(16, 18), (22, 18), (22, 23), (16, 23)], "M3")
    c.draw_line("backpack", 16, 18, 22, 18, "M4")
    c.set_px("backpack", 17, 18, "M5")
    c.fill_rect("backpack", 16, 25, 21, 33, "M2")
    c.draw_line("backpack", 16, 24, 23, 24, "M0")
    c.draw_line("backpack", 16, 30, 23, 30, "M0")
    c.fill_rect("backpack", 17, 26, 19, 27, "V3")
    c.set_px("backpack", 17, 26, "V4")
    # Crisp slender 1px antenna + glowing teal tip (zero jaggies!)
    c.draw_line("backpack", 18, 9, 18, 17, "M2")
    c.draw_line("backpack", 18, 9, 18, 13, "M3")
    c.set_px("backpack", 18, 8, "V4")

    # 3. Rear/Right Arm bent forward holding compact glowing Acoustic Field Sensor (clean silhouette!)
    c.fill_polygon("rear_arm", [(37, 24), (43, 27), (45, 33), (44, 37), (39, 37), (38, 32)], "S2")
    c.fill_polygon("rear_arm", [(38, 25), (42, 28), (43, 32), (39, 32)], "S3")
    c.draw_line("rear_arm", 39, 31, 44, 31, "S1")
    # Forearm angled slightly forward-right + dark glove + crisp sensor unit
    c.fill_polygon("rear_arm", [(40, 35), (45, 35), (47, 39), (42, 40)], "B1")
    c.set_px("rear_arm", 42, 36, "B3")
    # Clean compact handheld acoustic transceiver (2x4 metallic body + glowing teal dish!)
    c.fill_polygon("rear_arm", [(45, 37), (50, 37), (51, 40), (46, 41)], "M2")
    c.draw_line("rear_arm", 46, 37, 49, 37, "M4")
    c.fill_rect("rear_arm", 49, 38, 51, 40, "V3")
    c.set_px("rear_arm", 50, 38, "V5")

    # 4. Staggered 3/4 Stride Legs with CLEAR negative-space gap between thighs/calves!
    # Rear/Right leg angled slightly back-right (x=34..43, y=38..52)
    c.fill_polygon("rear_leg", [(34, 38), (41, 38), (43, 45), (41, 52), (36, 52), (36, 45), (34, 42)], "S2")
    c.fill_polygon("rear_leg", [(35, 39), (38, 39), (39, 45), (36, 45)], "S3")
    c.fill_polygon("rear_leg", [(39, 39), (42, 44), (41, 51), (38, 51)], "S1")
    # Dark padded knee guard angled on rear knee
    c.fill_polygon("rear_leg", [(37, 44), (42, 44), (42, 47), (37, 47)], "B1")
    c.draw_line("rear_leg", 38, 44, 41, 44, "B3")

    # Front/Left leg planted confidently forward-left (x=21..32, y=38..53) — lit side!
    c.fill_polygon("front_leg", [(23, 38), (32, 38), (31, 45), (30, 53), (23, 53), (21, 46), (22, 41)], "S3")
    c.fill_polygon("front_leg", [(22, 39), (28, 39), (27, 46), (22, 46)], "S4")
    c.draw_line("front_leg", 23, 40, 26, 40, "S5")
    c.fill_polygon("front_leg", [(28, 39), (31, 39), (30, 52), (27, 52)], "S2")
    c.draw_line("front_leg", 30, 40, 29, 51, "S1")
    c.draw_line("front_leg", 22, 42, 30, 42, "S1")  # thigh baffle crease
    # Padded dark brown knee guard + cast shadow under it
    c.fill_polygon("front_leg", [(22, 45), (29, 45), (29, 48), (22, 48)], "B2")
    c.draw_line("front_leg", 23, 45, 27, 45, "B3")
    c.set_px("front_leg", 24, 45, "B4")
    c.draw_line("front_leg", 22, 48, 29, 48, "B0")
    c.draw_line("front_leg", 23, 49, 29, 49, "S1")

    # 5. Grounded Heavy Treaded Planetary Boots (staggered Y height for 3/4 depth!)
    # Rear right boot (y=51..56)
    c.fill_polygon("boots", [(35, 51), (42, 51), (45, 55), (44, 57), (35, 57), (34, 54)], "B1")
    c.fill_rect("boots", 36, 52, 40, 54, "B2")
    c.draw_line("boots", 36, 52, 39, 52, "B3")
    c.draw_line("boots", 35, 56, 44, 56, "B0")
    # Front left boot (planted lower at y=52..58, angled 3/4 forward-right!)
    c.fill_polygon("boots", [(22, 52), (30, 52), (33, 56), (32, 58), (22, 58), (21, 55)], "B2")
    c.fill_rect("boots", 22, 53, 26, 55, "B3")
    c.draw_line("boots", 23, 53, 25, 53, "B4")
    c.fill_rect("boots", 27, 53, 32, 57, "B1")
    c.draw_line("boots", 22, 57, 32, 57, "B0")

    # 6. Tapered, Broad-Shouldered, Cinched-Waist Oversized Torso (organic silhouette, NOT a box!)
    c.fill_polygon(
        "torso",
        [(22, 22), (38, 22), (41, 26), (39, 34), (38, 39), (31, 41), (24, 39), (22, 33), (20, 26)],
        "S3",
    )
    c.shade_sculpted_volume(
        "torso", 29.5, 30.0, 11.0, 10.5,
        ramp=["S0", "S1", "S2", "S3", "S4", "S5"],
        thresholds=[-0.22, 0.04, 0.30, 0.58, 0.80],
    )
    # Cast shadow from pressurized helmet overhang onto upper chest
    c.fill_ellipse("torso", 31.0, 23.2, 8.2, 2.3, "S1", mask_layer="torso")
    c.fill_ellipse("torso", 32.0, 22.8, 6.8, 1.7, "S0", mask_layer="torso")
    # Curved chest baffle seam
    c.draw_polyline("torso", [(22, 29), (28, 30), (35, 30), (39, 29)], "S1", mask_layer="torso")
    c.draw_polyline("torso", [(23, 30), (28, 31), (32, 31)], "S4", mask_layer="torso")

    # 7. Harness Rig, Chest Telemetry Module & Cinched Utility Belt
    c.draw_polyline("harness", [(25, 23), (26, 30), (26, 36)], "B2", thickness=2)
    c.draw_line("harness", 25, 23, 25, 35, "B3")
    c.draw_polyline("harness", [(36, 23), (35, 30), (34, 36)], "B1", thickness=2)
    # Brushed titanium chest telemetry unit with muted-teal display
    c.fill_rect("harness", 27, 26, 35, 32, "M1")
    c.draw_line("harness", 27, 26, 34, 26, "M4")
    c.draw_line("harness", 27, 26, 27, 31, "M3")
    c.set_px("harness", 28, 26, "M5")
    c.fill_rect("harness", 28, 27, 33, 30, "V1")
    c.fill_rect("harness", 29, 28, 32, 29, "V3")
    c.set_px("harness", 29, 28, "V4")
    c.draw_line("harness", 28, 32, 35, 32, "M0")
    c.draw_line("harness", 28, 33, 35, 33, "S1")
    # Cinched dark utility belt + brushed steel clasp + right-hip specimen canister
    c.fill_polygon("harness", [(22, 35), (39, 35), (38, 38), (23, 38)], "B1")
    c.draw_line("harness", 23, 35, 31, 35, "B3")
    c.draw_line("harness", 23, 38, 38, 38, "B0")
    c.draw_line("harness", 24, 39, 37, 39, "S1")
    c.fill_rect("harness", 29, 35, 32, 38, "M3")
    c.set_px("harness", 29, 35, "M5")
    c.set_px("harness", 32, 38, "M0")
    # Specimen canister at right hip
    c.fill_rect("harness", 36, 35, 39, 41, "M1")
    c.fill_rect("harness", 37, 36, 38, 39, "V3")
    c.set_px("harness", 37, 36, "V5")
    c.draw_line("harness", 36, 40, 39, 40, "M0")

    # 8. Front/Left Bulky Quilted Arm — natural slight elbow bend inward toward hip belt!
    c.fill_polygon("front_arm", [(19, 24), (24, 25), (24, 32), (26, 38), (22, 40), (18, 36), (17, 30)], "S3")
    c.fill_polygon("front_arm", [(18, 25), (22, 25), (21, 35), (18, 34)], "S4")
    c.draw_line("front_arm", 19, 26, 19, 32, "S5")
    c.draw_line("front_arm", 23, 26, 23, 33, "S2")
    c.draw_line("front_arm", 18, 30, 23, 30, "S1")
    c.draw_line("front_arm", 18, 31, 21, 31, "S5")
    # Muted-teal wrist cuff + dark insulated glove angled slightly forward
    c.draw_line("front_arm", 20, 36, 25, 36, "V2")
    c.draw_line("front_arm", 20, 36, 22, 36, "V4")
    c.fill_ellipse("front_arm", 24.0, 39.2, 2.7, 2.4, "B2")
    c.fill_rect("front_arm", 22, 38, 24, 39, "B3")
    c.set_px("front_arm", 22, 38, "B4")
    c.draw_line("front_arm", 23, 41, 26, 41, "B0")

    # 9. Pressurized Helmet & Curved Dark-Teal Glass Visor (Focal Point!)
    c.fill_ellipse("helmet", 31.0, 22.4, 7.2, 2.2, "M2")
    c.draw_line("helmet", 25, 22, 30, 22, "M4")
    c.draw_line("helmet", 32, 23, 37, 23, "M0")
    c.fill_ellipse("helmet", 31.0, 14.6, 8.8, 8.2, "S3")
    c.shade_sculpted_volume(
        "helmet", 31.0, 14.4, 8.8, 8.2,
        ramp=["S0", "S1", "S2", "S3", "S4", "S5"],
        thresholds=[-0.22, 0.05, 0.30, 0.58, 0.78],
    )
    c.fill_rect("helmet", 29, 7, 32, 10, "O5")
    c.draw_line("helmet", 29, 7, 31, 7, "M5")
    c.fill_rect("helmet", 22, 13, 24, 17, "M2")
    c.draw_line("helmet", 22, 13, 23, 13, "M4")
    c.set_px("helmet", 23, 15, "V4")

    # Clean metallic bezel + spherical dark-teal glass faceplate
    c.fill_ellipse("visor", 33.2, 15.2, 6.5, 5.1, "M1")
    c.draw_polyline("visor", [(28, 12), (30, 10), (34, 10)], "M4")
    c.fill_ellipse("visor", 33.4, 15.4, 5.4, 4.0, "V0")
    c.fill_ellipse("visor", 33.5, 15.8, 4.7, 3.2, "V1")
    c.fill_rect("visor", 30, 15, 36, 16, "V2")
    c.fill_rect("visor", 31, 15, 34, 15, "V3")
    # Crisp specular slash + small secondary glint + subtle bottom rim bounce
    c.draw_polyline("visor", [(29, 14), (30, 13), (32, 13)], "V5")
    c.set_px("visor", 30, 13, "M5")
    c.set_px("visor", 31, 13, "M5")
    c.set_px("visor", 29, 16, "V4")
    c.draw_line("visor", 34, 18, 36, 18, "V3")

    # Apply unified outer sel-out ONLY on composite outer silhouette (prevents internal layer orphan mess!)
    c.add_layer("selout")
    comp = c.composite_indices()
    H, W = comp.shape
    sel_dark = {
        "S0": "B0", "S1": "B0", "S2": "S0", "S3": "S1", "S4": "S2", "S5": "S3",
        "B1": "B0", "B2": "B0", "B3": "B1",
        "M0": "B0", "M1": "M0", "M2": "M0", "M3": "M1", "M4": "M2",
    }
    for y in range(H):
        for x in range(W):
            v = int(comp[y, x])
            if v == 0:
                continue
            tok = IDX_TO_TOKEN[v]
            if tok not in sel_dark:
                continue
            # Check bottom/right perimeter ONLY (reference style: shadow edges darken, lit top-left stays luminous!)
            br_empty = False
            for dx, dy in [(1, 0), (0, 1)]:
                nx, ny = x + dx, y + dy
                if not (0 <= nx < W and 0 <= ny < H) or comp[ny, nx] == 0:
                    br_empty = True
            if br_empty and y < 56:  # don't override ground shadow
                c.set_px("selout", x, y, sel_dark[tok])

    c.add_layer("final_polish")
    comp = c.composite_indices()
    H, W = comp.shape
    prot = {TOKEN_TO_IDX[t] for t in ("M5", "V5", "V4", "O6", "S5", "B4")}
    for y in range(H):
        for x in range(W):
            v = int(comp[y, x])
            if v == 0 or v in prot:
                continue
            same = 0
            neigh: List[int] = []
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < W and 0 <= ny < H:
                    nv = int(comp[ny, nx])
                    if nv == v:
                        same += 1
                    elif nv != 0:
                        neigh.append(nv)
            if same == 0 and neigh:
                best = max(set(neigh), key=neigh.count)
                c.set_px("final_polish", x, y, IDX_TO_TOKEN[best])
    return c


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    exercises = [
        ("Practice A — Weathered Metal Canister (Rev 2)", "practice_a_weathered_metal_canister", build_practice_a),
        ("Practice B — Quilted Orange Suit Sleeve (Rev 2)", "practice_b_orange_suit_fabric", build_practice_b),
        ("Practice C — Curved Glass Helmet Visor (Rev 2)", "practice_c_glass_helmet_visor", build_practice_c),
        ("Practice D — Organic Moss & Alien Fronds (Rev 2)", "practice_d_organic_moss_relic", build_practice_d),
        ("Practice E — Miniature Astronaut Study (Rev 2)", "practice_e_miniature_astronaut_study", build_practice_e),
    ]

    png_list: List[Tuple[str, Path]] = []
    for title, stem, builder in exercises:
        canvas = builder()
        png_path = OUT_DIR / f"{stem}.png"
        src_path = OUT_DIR / f"{stem}.source.json"
        canvas.save_png(png_path)
        canvas.save_source_json(src_path, metadata={"title": title, "phase": "Phase 4 Revised (Round 2)"})
        r = audit_sprite_png(png_path)
        png_list.append((title, png_path))
        print(
            f"[OK] {stem}.png | {r['dimensions']} | bbox={r['bbox_size']} | "
            f"colors={r['unique_colors']} (off={r['off_palette_colors']}) | "
            f"non_bin_a={r['non_binary_alpha_pixels']} | orphans={r['orphan_1px_count']} | "
            f"pure_bw={r['pure_black_or_white']}"
        )

    make_inspection_sheet(png_list, Path("/tmp/training_round2_review.png"), zoom=4)
    print("\nSaved Round 2 inspection sheet -> /tmp/training_round2_review.png")


if __name__ == "__main__":
    main()
