#!/usr/bin/env python3
"""
VERDANT SIGNAL — Phase 5 Hero Character Visual Benchmark Builder (Round 2 Polish)
Dr. Mara Lin — Exact 128x128 Transparent RGBA Native Pixel Art
---------------------------------------------------------------------------------
Deliberately constructed, layered, strict indexed-palette pixel art using the
30-color hue-shifted VERDANT SIGNAL Master Palette derived from the visual
style reference (zero upscaling, zero blur, zero semi-transparent edges,
zero pure #000000/#FFFFFF, zero background/framing/text).

Round 2 Artistic Upgrades after 4x/1x Visual Art Gate Audit:
  1. Carved clean negative-space breathing window between bent left elbow/forearm
     and cinched torso waist for an unmistakable heroic silhouette.
  2. Added proper curved pressure-suit pelvis/saddle gusset + diagonal hip tension
     folds and organic asymmetrical cloth bunching above heavy boot cuffs.
  3. Replaced cluttered double-antenna stub with a single clean backpack telemetry
     whip antenna + visible corrugated EVA life-support conduit hose looping over
     the left backpack-to-collar shoulder line.
  4. Redesigned right-hand Acoustic Field Scanner into a hefty, angled xenobiology
     transceiver with glowing parabolic muted-teal resonance emitter (zero stray tips).
  5. Sculpted smoother organic helmet dome brow + richer layered translucent visor
     depth (subtle warm-teal lower bounce + razor-sharp twin curved glass specular).
  6. Slightly widened staggered 3/4 boot stance + curved 3/4 boot sole perspective +
     tightened clusters to slash unintended 1px orphan pixels.

Outputs:
  - game/assets/characters/player/mara_lin_concept_128x128.png
  - game/assets/characters/player/mara_lin_concept_128x128.source.json
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

OUT_PNG = Path("game/assets/characters/player/mara_lin_concept_128x128.png")
OUT_SRC = Path("game/assets/characters/player/mara_lin_concept_128x128.source.json")


def paint_tapered_stroke(
    c: PixelCanvas,
    layer: str,
    pts: Sequence[Tuple[float, float, float]],
    token: str,
    mask_layer: str | None = None,
) -> None:
    """Crisp continuous integer stroke with smooth radius taper (zero gaps/jaggies)."""
    for i in range(len(pts) - 1):
        x0, y0, r0 = pts[i]
        x1, y1, r1 = pts[i + 1]
        steps = max(1, int(math.ceil(math.hypot(x1 - x0, y1 - y0) * 3.0)))
        for s in range(steps + 1):
            t = s / steps
            x = x0 + (x1 - x0) * t
            y = y0 + (y1 - y0) * t
            r = r0 + (r1 - r0) * t
            if r <= 0.65:
                ix, iy = int(round(x)), int(round(y))
                if mask_layer is None or c.get_px(mask_layer, ix, iy) != ".":
                    c.set_px(layer, ix, iy, token)
            else:
                c.fill_ellipse(layer, x, y, r, r, token, mask_layer=mask_layer)


def shade_suit_region(
    c: PixelCanvas,
    layer: str,
    cx: float,
    cy: float,
    rx: float,
    ry: float,
    baffle_ys: Sequence[float] = (),
    baffle_amp: float = 0.22,
    fold_fn=None,
    bias: float = 0.0,
) -> None:
    """
    Sculpt padded astronaut suit orange fabric with locked upper-left key light,
    organic quilted baffle loft, and clean warm-amber-to-cool-plum clusters.
    """
    lyr = c.layer(layer)
    x0 = max(0, int(math.floor(cx - rx - 8)))
    x1 = min(c.width - 1, int(math.ceil(cx + rx + 8)))
    y0 = max(0, int(math.floor(cy - ry - 8)))
    y1 = min(c.height - 1, int(math.ceil(cy + ry + 8)))

    for y in range(y0, y1 + 1):
        ny = (y + 0.5 - cy) / max(ry, 1.0)
        b_ny = 0.0
        if baffle_ys:
            prev_y = y0 - 8.0
            next_y = y1 + 8.0
            for by in baffle_ys:
                if by <= y:
                    prev_y = by
                else:
                    next_y = by
                    break
            span = max(4.0, next_y - prev_y)
            u = max(0.0, min(1.0, (y - prev_y) / span))
            b_ny = (u - 0.38) * baffle_amp

        for x in range(x0, x1 + 1):
            if lyr[y, x] == 0:
                continue
            nx = (x + 0.5 - cx) / max(rx, 1.0)
            ny_eff = ny + b_ny
            nz = math.sqrt(max(0.08, 1.0 - min(0.92, nx * nx * 0.65 + ny_eff * ny_eff * 0.58)))
            dot = (-0.64 * nx - 0.58 * ny_eff + 0.50 * nz) + bias
            if fold_fn is not None:
                dot += fold_fn(x, y, nx, ny)
            if dot < -0.22:
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
            c.set_px(layer, x, y, tok)


def carve_quilted_seam(
    c: PixelCanvas,
    layer: str,
    mask_layer: str,
    pts: Sequence[Tuple[int, int]],
    lit_end_x: int,
    bright_end_x: int,
) -> None:
    """Draw a recessed stitched suit seam (dark crease + crisp sunlit padded lip)."""
    for i in range(len(pts) - 1):
        x0, y0 = pts[i]
        x1, y1 = pts[i + 1]
        steps = max(1, abs(x1 - x0) + abs(y1 - y0))
        for s in range(steps + 1):
            t = s / steps
            x = int(round(x0 + (x1 - x0) * t))
            y = int(round(y0 + (y1 - y0) * t))
            if c.get_px(mask_layer, x, y) == ".":
                continue
            c.set_px(layer, x, y, "S0" if x > lit_end_x else "S1")
            if c.get_px(mask_layer, x, y + 1) != ".":
                if x <= bright_end_x:
                    c.set_px(layer, x, y + 1, "S5")
                elif x <= lit_end_x:
                    c.set_px(layer, x, y + 1, "S4")
                elif x <= lit_end_x + 7:
                    c.set_px(layer, x, y + 1, "S3")


def build_mara_lin_128() -> PixelCanvas:
    c = PixelCanvas(128, 128)
    layer_names = [
        "backpack",
        "rear_arm",
        "scanner",
        "rear_leg",
        "rear_boot",
        "front_leg",
        "front_boot",
        "torso",
        "torso_seams",
        "harness",
        "shoulder_hose",
        "front_arm",
        "front_arm_details",
        "collar_ring",
        "helmet_rear_pod",
        "helmet_shell",
        "visor_bezel",
        "visor_glass",
        "visor_fx",
        "helmet_front_pods",
        "selout",
        "polish",
    ]
    for name in layer_names:
        c.add_layer(name)

    # ==========================================================================
    # 1. ASYMMETRICAL LIFE-SUPPORT BACKPACK + O2 CYLINDER + WHIP ANTENNA
    #    Compact upper/mid-back mount (y=31..64) so waist silhouette breathes!
    # ==========================================================================
    c.fill_polygon(
        "backpack",
        [(32, 33), (49, 31), (52, 35), (52, 62), (47, 65), (33, 64), (30, 59), (30, 37)],
        "M1",
    )
    c.fill_polygon("backpack", [(32, 34), (48, 32), (49, 38), (32, 39)], "M3", mask_layer="backpack")
    c.draw_polyline("backpack", [(33, 34), (41, 33), (47, 33)], "M4", mask_layer="backpack")
    c.draw_line("backpack", 35, 34, 41, 33, "M5", mask_layer="backpack")
    c.fill_rect("backpack", 32, 40, 44, 60, "M2")
    # Recessed horizontal radiator vent slats
    for vy in (42, 45, 48):
        c.draw_line("backpack", 34, vy, 43, vy, "M0")
        c.draw_line("backpack", 34, vy + 1, 41, vy + 1, "M3")
    # Muted-teal oxygen/power status strip
    c.fill_rect("backpack", 34, 52, 40, 55, "V0")
    c.fill_rect("backpack", 35, 53, 39, 54, "V3")
    c.draw_line("backpack", 35, 53, 37, 53, "V4")
    c.draw_line("backpack", 35, 53, 36, 53, "V5")
    c.draw_line("backpack", 31, 58, 45, 58, "M0")
    c.fill_rect("backpack", 32, 60, 44, 63, "M1")
    c.draw_line("backpack", 32, 59, 41, 59, "M3")

    # Side cylindrical pressurized O2 canister on far-left edge (x=25..33, y=38..63)
    for y in range(38, 64):
        for x in range(25, 34):
            if y in (38, 63) and x in (25, 33):
                continue
            u = (x - 25.0) / 8.0
            if u < 0.14:
                tok = "M1"
            elif u < 0.34:
                tok = "M4" if y < 60 else "M3"
            elif u < 0.50:
                tok = "M5" if (41 <= y <= 58) else "M4"
            elif u < 0.72:
                tok = "M2"
            else:
                tok = "M0"
            # Expedition-orange safety band around O2 cylinder (y=48..52)
            if 48 <= y <= 52:
                tok = "S4" if u < 0.38 else ("S5" if (u < 0.50 and y == 48) else ("S3" if u < 0.72 else "S1"))
            c.set_px("backpack", x, y, tok)
    for cy in (43, 57):
        c.draw_line("backpack", 25, cy, 33, cy, "M0")
        c.draw_line("backpack", 26, cy + 1, 30, cy + 1, "M4")
        c.draw_line("backpack", 31, cy + 1, 33, cy + 1, "M1")
    # Valve cap + subtle ruby safety tab atop O2 tank
    c.fill_rect("backpack", 27, 35, 31, 38, "M2")
    c.draw_line("backpack", 27, 35, 30, 35, "M4")
    c.fill_rect("backpack", 29, 36, 30, 37, "O6")

    # Single clean slender expedition telemetry whip antenna rising above backpack (y=11..33)
    c.fill_rect("backpack", 35, 29, 38, 33, "M1")
    c.draw_line("backpack", 35, 29, 37, 29, "M4")
    c.draw_polyline("backpack", [(36, 29), (35, 21), (34, 13)], "M1")
    c.draw_polyline("backpack", [(36, 27), (35, 20), (34, 14)], "M3")
    c.fill_rect("backpack", 33, 10, 35, 12, "V3")
    c.fill_rect("backpack", 34, 10, 35, 11, "V4")
    c.set_px("backpack", 34, 10, "V5")

    # ==========================================================================
    # 2. REAR/RIGHT ARM + INSULATED GLOVE + HEFTY ANGLED ACOUSTIC FIELD SCANNER
    #    Extended purposefully forward-right (x=72..106, y=47..82)
    # ==========================================================================
    c.fill_polygon(
        "rear_arm",
        [(71, 47), (81, 49), (87, 56), (88, 65), (92, 70), (88, 77), (80, 76), (76, 68), (72, 60)],
        "S2",
    )
    shade_suit_region(
        c, "rear_arm", 79.0, 61.0, 12.0, 16.0,
        baffle_ys=[56.0, 65.0],
        baffle_amp=0.22,
        bias=-0.16,
    )
    carve_quilted_seam(c, "rear_arm", "rear_arm", [(74, 56), (79, 57), (85, 56)], lit_end_x=80, bright_end_x=76)
    carve_quilted_seam(c, "rear_arm", "rear_arm", [(77, 65), (82, 66), (87, 64)], lit_end_x=82, bright_end_x=78)
    # Muted-teal pressurized wrist lock cuff
    c.fill_polygon("rear_arm", [(81, 70), (91, 68), (92, 72), (82, 74)], "M1")
    c.draw_line("rear_arm", 82, 70, 88, 69, "M4")
    c.draw_line("rear_arm", 83, 72, 90, 71, "V2")
    c.draw_line("rear_arm", 83, 72, 86, 72, "V4")

    # Articulated dark-brown insulated glove gripping scanner handle cleanly
    c.fill_polygon("rear_arm", [(83, 73), (92, 71), (95, 76), (93, 81), (87, 82), (83, 78)], "B1")
    c.fill_polygon("rear_arm", [(84, 73), (90, 72), (91, 76), (85, 77)], "B2")
    c.draw_line("rear_arm", 85, 73, 89, 72, "B3")
    c.draw_line("rear_arm", 86, 73, 87, 73, "B4")
    c.draw_line("rear_arm", 89, 77, 94, 76, "B0")
    c.draw_line("rear_arm", 89, 79, 93, 79, "B0")

    # Crisp Parabolic Xenobiology Acoustic Field Scanner (x=90..107, y=63..82)
    # Unmistakable flared scientific radar/acoustic dish + glowing teal core + boxy housing!
    c.fill_polygon("scanner", [(90, 76), (95, 75), (94, 82), (90, 82)], "B0")
    c.draw_line("scanner", 91, 76, 91, 80, "B2")
    # Compact chamfered rectangular scanner body (x=90..99, y=70..78)
    c.fill_rect("scanner", 90, 71, 98, 78, "M1")
    c.fill_rect("scanner", 91, 72, 97, 76, "M2")
    c.draw_line("scanner", 91, 71, 97, 71, "M4")
    c.draw_line("scanner", 92, 71, 95, 71, "M5")
    c.draw_line("scanner", 90, 78, 98, 78, "M0")
    c.fill_rect("scanner", 92, 73, 96, 75, "S3")  # orange technical side panel
    c.draw_line("scanner", 92, 73, 95, 73, "S4")
    # Wide flared parabolic acoustic emitter dish opening forward-right (x=98..106, y=64..80)!
    c.fill_polygon("scanner", [(98, 70), (103, 64), (106, 65), (107, 72), (105, 79), (102, 80), (98, 76)], "M1")
    c.draw_polyline("scanner", [(98, 70), (103, 64), (105, 64)], "M4")
    c.draw_line("scanner", 101, 66, 103, 64, "M5")
    c.draw_polyline("scanner", [(102, 80), (105, 79), (107, 73)], "M0")
    # Recessed concave dark-teal parabolic resonance dish + crisp emitter spike!
    c.fill_polygon("scanner", [(100, 71), (103, 66), (106, 67), (106, 76), (103, 78), (100, 75)], "V0")
    c.fill_polygon("scanner", [(101, 71), (104, 67), (105, 69), (105, 75), (103, 77), (101, 74)], "V2")
    c.fill_polygon("scanner", [(102, 71), (104, 68), (105, 71), (104, 75), (102, 74)], "V3")
    c.fill_rect("scanner", 103, 70, 105, 73, "V4")
    c.draw_line("scanner", 104, 70, 105, 71, "V5")
    c.set_px("scanner", 104, 70, "M5")

    # ==========================================================================
    # 3. STAGGERED 3/4 EXPLORER LEGS + CURVED PELVIS GUSSET + TREADED BOOTS
    #    Slightly widened heroic stance (clear negative space x=59..66!)
    # ==========================================================================
    # --- REAR / RIGHT LEG (stepped naturally back & right, sole at y=115) ---
    c.fill_polygon(
        "rear_leg",
        [(65, 76), (81, 76), (85, 88), (84, 98), (82, 107), (71, 107), (70, 96), (67, 86)],
        "S2",
    )
    def rear_leg_folds(x: int, y: int, nx: float, ny: float) -> float:
        # Organic diagonal fabric gathering folds above rear boot collar (breaks horizontal banding!)
        if 98 <= y <= 106:
            return 0.16 * math.sin((y - 98) * 0.90 + (x - 75) * 0.28)
        return 0.0

    shade_suit_region(
        c, "rear_leg", 74.5, 91.0, 10.5, 16.5,
        baffle_ys=[83.0],
        baffle_amp=0.20,
        fold_fn=rear_leg_folds,
        bias=-0.18,
    )
    carve_quilted_seam(c, "rear_leg", "rear_leg", [(67, 83), (74, 84), (83, 83)], lit_end_x=76, bright_end_x=71)
    # Inner thigh shadow cast by pelvis/front thigh
    c.fill_polygon("rear_leg", [(65, 76), (73, 76), (72, 88), (67, 86)], "S1", mask_layer="rear_leg")
    c.fill_polygon("rear_leg", [(65, 76), (70, 76), (69, 82), (66, 81)], "S0", mask_layer="rear_leg")
    # Diagonal gathered cloth tuck right above rear boot!
    c.draw_polyline("rear_leg", [(72, 101), (77, 103), (82, 102)], "S0", mask_layer="rear_leg")
    c.draw_polyline("rear_leg", [(72, 102), (76, 104), (80, 103)], "S3", mask_layer="rear_leg")

    # Padded weathered brown strapped knee guard on rear knee
    c.fill_polygon("rear_leg", [(72, 89), (84, 88), (85, 95), (81, 97), (73, 96)], "B1")
    c.fill_polygon("rear_leg", [(73, 89), (80, 89), (80, 94), (74, 94)], "B2")
    c.draw_line("rear_leg", 74, 89, 79, 89, "B3")
    c.draw_line("rear_leg", 74, 89, 76, 89, "B4")
    c.draw_line("rear_leg", 70, 92, 73, 92, "B0")
    c.draw_line("rear_leg", 73, 97, 84, 97, "S0", mask_layer="rear_leg")
    c.draw_line("rear_leg", 72, 98, 83, 98, "S1", mask_layer="rear_leg")

    # --- REAR / RIGHT HEAVY PLANETARY BOOT (y=105..115, slight 3/4 sole curve!) ---
    c.fill_polygon(
        "rear_boot",
        [(71, 105), (83, 105), (86, 110), (90, 112), (89, 114), (86, 115), (71, 115), (70, 111)],
        "B1",
    )
    c.fill_polygon("rear_boot", [(72, 106), (80, 106), (84, 111), (73, 112)], "B2", mask_layer="rear_boot")
    c.draw_polyline("rear_boot", [(72, 106), (78, 106), (82, 110)], "B3", mask_layer="rear_boot")
    c.draw_line("rear_boot", 73, 106, 77, 106, "B4", mask_layer="rear_boot")
    c.fill_rect("rear_boot", 76, 107, 79, 109, "M2")
    c.draw_line("rear_boot", 76, 107, 78, 107, "M4")
    c.draw_line("rear_boot", 82, 111, 88, 112, "B3", mask_layer="rear_boot")
    c.draw_line("rear_boot", 71, 112, 88, 112, "M1")
    c.fill_polygon("rear_boot", [(71, 113), (89, 113), (88, 114), (86, 115), (71, 115)], "B0")
    for tx in (73, 77, 81, 85):
        c.set_px("rear_boot", tx, 114, "B1")

    # --- FRONT / LEFT LEG (planted forward-left, lit side!, sole at y=118) ---
    c.fill_polygon(
        "front_leg",
        [(43, 75), (61, 76), (60, 90), (58, 109), (45, 109), (42, 98), (41, 86)],
        "S3",
    )
    def front_leg_folds(x: int, y: int, nx: float, ny: float) -> float:
        # Organic diagonal drapery folds above boot collar + hip tension tuck!
        val = 0.0
        if 100 <= y <= 108:
            val += 0.20 * math.sin((y - 100) * 0.85 - (x - 49) * 0.30)
        if y < 84 and x > 53:
            val -= 0.14
        return val

    shade_suit_region(
        c, "front_leg", 49.5, 91.5, 10.5, 17.5,
        baffle_ys=[83.0],
        baffle_amp=0.22,
        fold_fn=front_leg_folds,
        bias=0.08,
    )
    carve_quilted_seam(c, "front_leg", "front_leg", [(42, 83), (49, 84), (59, 83)], lit_end_x=53, bright_end_x=47)
    # Asymmetrical diagonal cloth bunching folds above front boot collar!
    c.draw_polyline("front_leg", [(44, 102), (50, 104), (57, 102)], "S1", mask_layer="front_leg")
    c.draw_polyline("front_leg", [(44, 103), (50, 105), (54, 104)], "S4", mask_layer="front_leg")
    c.draw_polyline("front_leg", [(46, 106), (52, 107), (58, 105)], "S0", mask_layer="front_leg")
    # Cast shadow under belt onto top of front thigh
    c.fill_polygon("front_leg", [(43, 75), (61, 76), (60, 79), (42, 78)], "S1", mask_layer="front_leg")
    c.draw_line("front_leg", 44, 76, 60, 77, "S0", mask_layer="front_leg")

    # Strapped Dark-Brown Articulated Knee Guard on Front Leg
    c.fill_polygon("front_leg", [(42, 90), (55, 90), (56, 97), (51, 99), (43, 98)], "B1")
    c.fill_polygon("front_leg", [(43, 91), (52, 91), (52, 96), (44, 96)], "B2")
    c.fill_polygon("front_leg", [(44, 91), (50, 91), (49, 94), (44, 94)], "B3")
    c.draw_line("front_leg", 44, 91, 48, 91, "B4")
    c.fill_rect("front_leg", 44, 92, 45, 92, "M4")
    c.draw_line("front_leg", 55, 92, 59, 92, "B1", thickness=2)
    c.draw_line("front_leg", 55, 96, 59, 96, "B0")
    c.draw_polyline("front_leg", [(43, 99), (50, 100), (56, 99)], "S0", mask_layer="front_leg")
    c.draw_polyline("front_leg", [(43, 100), (50, 101), (57, 100)], "S1", mask_layer="front_leg")

    # --- FRONT / LEFT HEAVY PLANETARY BOOT (y=107..118, slight 3/4 sole lift at far toe!) ---
    c.fill_polygon(
        "front_boot",
        [(44, 107), (58, 107), (61, 112), (65, 114), (64, 117), (61, 118), (44, 118), (43, 113)],
        "B1",
    )
    c.fill_polygon("front_boot", [(44, 108), (54, 108), (58, 113), (45, 114)], "B2", mask_layer="front_boot")
    c.fill_polygon("front_boot", [(45, 108), (52, 108), (53, 112), (45, 112)], "B3", mask_layer="front_boot")
    c.draw_line("front_boot", 46, 108, 51, 108, "B4", mask_layer="front_boot")
    c.fill_polygon("front_boot", [(54, 112), (61, 113), (62, 115), (54, 115)], "B2", mask_layer="front_boot")
    c.draw_line("front_boot", 55, 112, 60, 113, "B3", mask_layer="front_boot")
    c.draw_line("front_boot", 56, 112, 58, 112, "B4", mask_layer="front_boot")
    # Titanium ankle cinch latch
    c.fill_rect("front_boot", 48, 109, 52, 111, "M2")
    c.draw_line("front_boot", 48, 109, 51, 109, "M4")
    c.draw_line("front_boot", 49, 109, 50, 109, "M5")
    c.draw_line("front_boot", 48, 111, 52, 111, "M0")
    c.draw_line("front_boot", 44, 115, 63, 115, "M1")
    c.draw_line("front_boot", 44, 115, 52, 115, "M2")
    c.fill_polygon("front_boot", [(44, 116), (64, 116), (63, 117), (61, 118), (44, 118)], "B0")
    for tx in (46, 50, 54, 58, 61):
        c.set_px("front_boot", tx, 117, "B1")

    # ==========================================================================
    # 4. BULKY QUILTED ORANGE TORSO + CURVED PELVIS/SADDLE GUSSET!
    #    Waist tapers cleanly at x=47..77 so bent left arm breathes with negative space!
    # ==========================================================================
    c.fill_polygon(
        "torso",
        [(46, 44), (75, 44), (80, 50), (79, 64), (77, 74), (74, 81), (63, 83), (50, 81), (46, 74), (47, 63), (44, 51)],
        "S3",
    )
    def torso_folds(x: int, y: int, nx: float, ny: float) -> float:
        val = 0.0
        if 66 <= y <= 74:
            val += 0.14 * math.sin((x - 60) * 0.45) * ((y - 66) / 8.0)
        return val

    shade_suit_region(
        c, "torso", 60.0, 60.5, 20.0, 20.5,
        baffle_ys=[53.0, 62.0, 70.0],
        baffle_amp=0.22,
        fold_fn=torso_folds,
        bias=0.05,
    )
    # Cast shadow from helmet & neck ring onto upper chest
    c.fill_ellipse("torso_seams", 62.5, 47.0, 15.5, 4.4, "S1", mask_layer="torso")
    c.fill_ellipse("torso_seams", 63.5, 45.8, 13.5, 3.0, "S0", mask_layer="torso")
    carve_quilted_seam(c, "torso_seams", "torso", [(45, 55), (55, 57), (67, 57), (79, 55)], lit_end_x=62, bright_end_x=53)
    carve_quilted_seam(c, "torso_seams", "torso", [(47, 65), (57, 67), (68, 67), (78, 65)], lit_end_x=61, bright_end_x=53)
    # Diagonal tension creases radiating across curved pelvis gusset below belt (y=77..83)
    c.draw_polyline("torso_seams", [(54, 79), (59, 82), (65, 82), (70, 79)], "S1", mask_layer="torso")
    c.draw_polyline("torso_seams", [(58, 82), (62, 83), (67, 82)], "S0", mask_layer="torso")
    c.draw_polyline("torso_seams", [(52, 79), (56, 81), (60, 81)], "S4", mask_layer="torso")
    # Gathered waist fabric tuck folds right above belt
    for gx in (52, 57, 67, 72):
        c.draw_line("torso_seams", gx, 69, gx + (1 if gx < 60 else -1), 72, "S1", mask_layer="torso")
        if gx < 62:
            c.draw_line("torso_seams", gx - 1, 69, gx, 72, "S4", mask_layer="torso")

    # ==========================================================================
    # 5. HEAVY WEATHERED BROWN HARNESS, CHEST TELEMETRY RIG, BELT & SPECIMEN VIAL
    # ==========================================================================
    # Left shoulder harness strap (lit side)
    c.fill_polygon("harness", [(49, 45), (54, 45), (56, 73), (51, 73)], "B2")
    c.draw_line("harness", 49, 46, 51, 72, "B3", thickness=2)
    c.draw_line("harness", 49, 46, 50, 62, "B4")
    c.draw_line("harness", 55, 46, 56, 72, "B0")
    c.draw_line("harness", 56, 48, 57, 72, "S1")
    # Right shoulder harness strap (shadow side)
    c.fill_polygon("harness", [(69, 45), (74, 45), (72, 73), (67, 73)], "B1")
    c.draw_line("harness", 69, 46, 68, 72, "B2")
    c.draw_line("harness", 73, 46, 72, 72, "B0")

    # Titanium shoulder buckles
    for bx, by, lit in [(49, 49, True), (68, 49, False)]:
        c.fill_rect("harness", bx, by, bx + 5, by + 3, "M1")
        c.draw_line("harness", bx, by, bx + 4, by, "M4" if lit else "M3")
        if lit:
            c.draw_line("harness", bx + 1, by, bx + 2, by, "M5")
        c.draw_line("harness", bx, by + 3, bx + 5, by + 3, "M0")

    # Cantilevered Brushed-Titanium Chest Telemetry & Bio-Acoustic Oscilloscope Rig
    c.fill_polygon("harness", [(55, 65), (73, 65), (74, 54), (74, 67), (56, 67)], "S0")
    c.fill_polygon("harness", [(53, 52), (71, 52), (72, 54), (72, 64), (70, 65), (54, 65), (53, 63)], "M1")
    c.fill_polygon("harness", [(54, 53), (70, 53), (70, 63), (54, 63)], "M2")
    c.draw_line("harness", 54, 52, 70, 52, "M4")
    c.draw_line("harness", 53, 53, 53, 63, "M3")
    c.draw_line("harness", 55, 52, 62, 52, "M5")
    c.draw_line("harness", 72, 54, 72, 64, "M0")
    c.draw_line("harness", 54, 65, 71, 65, "M0")
    # Recessed Muted-Teal Oscilloscope Screen + Crisp Harmonic Waveform
    c.fill_rect("harness", 55, 54, 66, 61, "V0")
    c.fill_rect("harness", 56, 55, 65, 60, "V1")
    c.fill_rect("harness", 56, 56, 64, 59, "V2")
    for wx, wy in [(57, 58), (58, 58), (59, 57), (60, 56), (61, 58), (62, 59), (63, 57), (64, 58)]:
        c.set_px("harness", wx, wy, "V4")
    c.set_px("harness", 60, 56, "V5")
    c.draw_line("harness", 56, 55, 57, 55, "V5")
    # Right-side tactile dial + ruby emergency latch
    c.fill_rect("harness", 68, 55, 70, 57, "M0")
    c.draw_line("harness", 68, 55, 69, 55, "M4")
    c.fill_rect("harness", 68, 59, 70, 61, "O6")
    c.set_px("harness", 68, 59, "S5")
    for gx in (56, 59, 62, 65):
        c.draw_line("harness", gx, 63, gx + 1, 63, "M0")

    # Heavy Cinched Utility Belt wrapping curved 3/4 waist (y=72..78)
    c.fill_polygon("harness", [(46, 72), (78, 72), (78, 77), (62, 79), (47, 77)], "B1")
    c.fill_polygon("harness", [(47, 72), (63, 73), (62, 76), (47, 75)], "B2")
    c.draw_polyline("harness", [(47, 72), (55, 73), (62, 73)], "B3")
    c.draw_line("harness", 48, 72, 55, 73, "B4")
    c.draw_polyline("harness", [(47, 77), (62, 79), (78, 77)], "B0")
    # Brushed steel center quick-release buckle
    c.fill_rect("harness", 58, 72, 66, 79, "M0")
    c.fill_rect("harness", 59, 73, 65, 78, "M2")
    c.draw_line("harness", 58, 72, 65, 72, "M4")
    c.draw_line("harness", 59, 72, 62, 72, "M5")
    c.draw_line("harness", 58, 72, 58, 78, "M3")
    c.fill_rect("harness", 61, 74, 63, 77, "M1")
    c.fill_rect("harness", 61, 75, 62, 76, "V4")

    # Left-hip weathered leather field pouch (tucked neatly beside hip)
    c.fill_polygon("harness", [(47, 74), (55, 75), (55, 83), (48, 83), (46, 79)], "B1")
    c.fill_rect("harness", 47, 75, 53, 81, "B2")
    c.draw_line("harness", 47, 75, 53, 75, "B3")
    c.draw_line("harness", 48, 75, 50, 75, "B4")
    c.draw_line("harness", 47, 78, 54, 78, "B0")
    c.fill_rect("harness", 49, 77, 51, 79, "M3")
    c.draw_line("harness", 49, 77, 50, 77, "M5")

    # Right-hip hanging Glass Xenobiology Specimen Canister (glowing alien moss sample!)
    c.fill_rect("harness", 73, 71, 80, 74, "M2")
    c.draw_line("harness", 73, 71, 78, 71, "M4")
    c.draw_line("harness", 74, 71, 76, 71, "M5")
    c.fill_rect("harness", 73, 74, 80, 84, "V0")
    c.fill_rect("harness", 74, 75, 79, 82, "V1")
    c.fill_rect("harness", 75, 78, 78, 82, "O2")
    c.fill_rect("harness", 75, 77, 77, 80, "O3")
    c.fill_rect("harness", 75, 77, 76, 78, "O4")
    c.draw_line("harness", 74, 75, 74, 81, "V4")
    c.draw_line("harness", 74, 76, 74, 78, "V5")
    c.set_px("harness", 74, 76, "M5")
    c.fill_rect("harness", 73, 83, 80, 85, "M1")
    c.draw_line("harness", 73, 83, 77, 83, "M3")
    c.draw_line("harness", 73, 85, 80, 85, "M0")

    # ==========================================================================
    # 6. VISIBLE CORRUGATED EVA LIFE-SUPPORT SHOULDER HOSE (Backpack -> Collar Ring!)
    #    Clean compact arch terminating right into left titanium neck collar latch!
    # ==========================================================================
    hose_arc = [(43, 35, 1.9), (44, 39, 1.9), (46, 43, 1.9), (49, 45, 1.8)]
    paint_tapered_stroke(c, "shoulder_hose", [(x + 1, y + 1, r) for x, y, r in hose_arc], "B0")
    paint_tapered_stroke(c, "shoulder_hose", hose_arc, "M1")
    paint_tapered_stroke(c, "shoulder_hose", [(x - 0.6, y - 0.5, 1.0) for x, y, r in hose_arc], "M3")
    for hx, hy in [(44, 38), (45, 41), (47, 44)]:
        c.draw_line("shoulder_hose", hx - 1, hy, hx + 1, hy, "M0")
        c.draw_line("shoulder_hose", hx - 1, hy - 1, hx, hy - 1, "M4")

    # ==========================================================================
    # 7. FRONT/LEFT BULKY QUILTED ARM + NEGATIVE-SPACE ELBOW WINDOW!
    #    Opens crisp 2-3px breathing pocket between inner forearm (x=42..43) & waist (x=47)!
    # ==========================================================================
    c.fill_polygon(
        "front_arm",
        [(37, 46), (46, 46), (46, 56), (42, 65), (43, 73), (36, 75), (30, 69), (30, 58), (32, 50)],
        "S3",
    )
    def front_arm_folds(x: int, y: int, nx: float, ny: float) -> float:
        if 61 <= y <= 68 and x >= 38:
            return -0.22 * math.exp(-((y - 64.5) ** 2) / 4.5)
        return 0.0

    shade_suit_region(
        c, "front_arm", 37.5, 60.0, 9.0, 16.0,
        baffle_ys=[56.0, 65.0],
        baffle_amp=0.25,
        fold_fn=front_arm_folds,
        bias=0.14,
    )
    carve_quilted_seam(c, "front_arm_details", "front_arm", [(31, 56), (37, 57), (45, 56)], lit_end_x=41, bright_end_x=36)
    carve_quilted_seam(c, "front_arm_details", "front_arm", [(31, 65), (37, 66), (42, 64)], lit_end_x=40, bright_end_x=35)
    # Sewn muted-teal Solstice Exo-Survey shoulder patch on sunlit upper bicep!
    c.fill_polygon("front_arm_details", [(33, 50), (39, 49), (40, 54), (34, 55)], "V2", mask_layer="front_arm")
    c.draw_line("front_arm_details", 34, 50, 38, 49, "V3", mask_layer="front_arm")
    c.fill_rect("front_arm_details", 35, 51, 36, 52, "O5")
    c.draw_line("front_arm_details", 34, 55, 40, 54, "S1", mask_layer="front_arm")

    # Ribbed pressurized titanium & muted-teal wrist cuff (x=32..44, y=72..77)
    c.fill_polygon("front_arm_details", [(32, 72), (43, 71), (44, 76), (33, 77)], "M1")
    c.draw_line("front_arm_details", 33, 72, 40, 71, "M4")
    c.draw_line("front_arm_details", 34, 72, 36, 72, "M5")
    c.fill_rect("front_arm_details", 34, 74, 41, 75, "V2")
    c.draw_line("front_arm_details", 34, 74, 38, 74, "V4")
    c.draw_line("front_arm_details", 33, 77, 44, 76, "M0")

    # Heavy articulated insulated left glove poised cleanly beside hip!
    c.fill_polygon("front_arm_details", [(34, 77), (43, 76), (45, 82), (41, 86), (35, 85), (33, 81)], "B1")
    c.fill_polygon("front_arm_details", [(34, 77), (40, 77), (40, 82), (35, 82)], "B2")
    c.fill_polygon("front_arm_details", [(35, 77), (39, 77), (39, 80), (35, 80)], "B3")
    c.draw_line("front_arm_details", 35, 77, 38, 77, "B4")
    c.draw_line("front_arm_details", 39, 82, 44, 81, "B0")
    c.draw_line("front_arm_details", 38, 84, 43, 83, "B0")

    # ==========================================================================
    # 8. PRESSURIZED TITANIUM NECK LOCK RING (y=42..49)
    # ==========================================================================
    c.fill_ellipse("collar_ring", 62.5, 45.2, 14.5, 4.0, "M1")
    for y in range(41, 50):
        for x in range(47, 78):
            if c.get_px("collar_ring", x, y) == ".":
                continue
            u = (x - 47.0) / 30.0
            if y <= 42:
                tok = "M0"
            elif y == 43:
                tok = "M4" if u < 0.36 else ("M3" if u < 0.56 else "M1")
            elif y == 44:
                tok = "M5" if (0.14 < u < 0.32) else ("M3" if u < 0.52 else ("M2" if u < 0.72 else "M0"))
            elif y <= 46:
                tok = "M2" if u < 0.48 else ("M1" if u < 0.72 else "M0")
            else:
                tok = "M1" if u < 0.42 else "B0"
            c.set_px("collar_ring", x, y, tok)
    for lx in (54, 68):
        c.fill_rect("collar_ring", lx, 44, lx + 2, 47, "M0")
        c.draw_line("collar_ring", lx, 44, lx + 1, 44, "M4" if lx < 60 else "M2")

    # ==========================================================================
    # 9. SIGNATURE HERO HELMET & DEEP CURVED GLASS VISOR (Focal Anchor! y=15..45)
    #    Cleaned crown geometry (no harsh brow stripe, no redundant ear-stub!)
    # ==========================================================================
    c.fill_polygon("helmet_rear_pod", [(75, 25), (80, 26), (80, 35), (75, 36)], "M0")
    c.fill_rect("helmet_rear_pod", 76, 27, 79, 33, "M1")
    c.draw_line("helmet_rear_pod", 76, 27, 78, 27, "M2")

    c.fill_ellipse("helmet_shell", 61.5, 29.5, 16.5, 15.2, "S3")
    c.fill_polygon(
        "helmet_shell",
        [(52, 16), (65, 15), (75, 20), (78, 28), (77, 37), (71, 43), (61, 45), (51, 42), (46, 34)],
        "S3",
    )
    shade_suit_region(c, "helmet_shell", 61.0, 28.5, 16.5, 15.2, baffle_ys=(), bias=0.08)

    # Warm ceramic-ivory dorsal expedition crest stripe (clean sculpted dome curve!)
    for y in range(15, 22):
        for x in range(57, 66):
            if c.get_px("helmet_shell", x, y) == ".":
                continue
            if x in (57, 65):
                c.set_px("helmet_shell", x, y, "S2" if y < 19 else "S1")
            elif y < 18:
                c.set_px("helmet_shell", x, y, "M5" if x < 62 else "O5")
            elif y < 20:
                c.set_px("helmet_shell", x, y, "O5" if x < 63 else "M3")
            else:
                c.set_px("helmet_shell", x, y, "M3" if x < 63 else "M2")
    # Subtle sculpted visor brow lip (curved smoothly over bezel — zero stiff horizontal bar!)
    c.draw_polyline("helmet_shell", [(54, 21), (60, 20), (67, 20), (73, 21)], "S4", mask_layer="helmet_shell")

    # Anti-banded brushed titanium visor bezel frame
    c.fill_ellipse("visor_bezel", 65.0, 31.0, 13.5, 10.0, "M1")
    for y in range(20, 42):
        for x in range(50, 80):
            if c.get_px("visor_bezel", x, y) == ".":
                continue
            nx = (x - 65.0) / 13.5
            ny = (y - 31.0) / 10.0
            if nx < -0.15 and ny < 0.08:
                tok = "M5" if (nx + ny < -0.95) else ("M4" if nx + ny < -0.52 else "M3")
            elif ny < -0.55 and nx < 0.48:
                tok = "M3"
            elif nx > 0.35 or ny > 0.55:
                tok = "M0"
            else:
                tok = "M2" if (nx + ny < 0.16) else "M1"
            c.set_px("visor_bezel", x, y, tok)
    c.fill_ellipse("visor_bezel", 65.2, 31.2, 11.8, 8.3, "B0")

    # Deep Layered Curved Dark-Teal Glass Faceplate (Translucent Depth + Sky Reflection!)
    c.fill_ellipse("visor_glass", 65.2, 31.2, 11.0, 7.5, "V1")
    for y in range(23, 40):
        for x in range(53, 77):
            if c.get_px("visor_glass", x, y) == ".":
                continue
            nx = (x - 65.2) / 11.0
            ny = (y - 31.2) / 7.5
            r2 = nx * nx + ny * ny

            # Concave inner brow bezel cast shadow
            if ny < -0.58 or (nx < -0.68 and ny < 0.12):
                c.set_px("visor_glass", x, y, "V0")
                continue

            # Curved environmental reflection sweep over deep translucent helmet interior!
            horizon_y = 0.02 - 0.20 * (nx * nx) - 0.10 * nx
            if ny < horizon_y - 0.24:
                tok = "V2" if nx < 0.38 else "V1"
            elif ny < horizon_y + 0.10:
                tok = "V3" if (-0.45 < nx < 0.52) else "V2"
            elif ny < horizon_y + 0.44:
                # Subtle recessed dark helmet interior cavity behind lower glass
                if -0.34 < nx < 0.36 and ny > 0.14:
                    tok = "V0"
                else:
                    tok = "V1" if nx < 0.42 else "V0"
            else:
                tok = "V2" if (-0.30 < nx < 0.55 and r2 > 0.48) else "V0"
            c.set_px("visor_glass", x, y, tok)

    # Razor-Sharp Curved Glass Specular Reflection Slash + Secondary Glint + Warm/Teal Rim Bounce!
    paint_tapered_stroke(
        c, "visor_fx",
        [(56.4, 29.8, 1.3), (58.3, 27.3, 1.4), (61.2, 26.0, 1.3), (64.4, 25.6, 0.9)],
        "V4", mask_layer="visor_glass",
    )
    paint_tapered_stroke(
        c, "visor_fx",
        [(57.0, 29.2, 0.9), (58.9, 27.0, 1.0), (61.6, 25.9, 0.9), (63.5, 25.7, 0.5)],
        "V5", mask_layer="visor_glass",
    )
    for px, py in [(58, 28), (59, 27), (60, 26), (61, 26), (59, 28)]:
        c.set_px("visor_fx", px, py, "M5")
    # Crisp separated secondary lower-left glass sparkle dot
    c.fill_rect("visor_fx", 56, 32, 57, 33, "V5")
    c.set_px("visor_fx", 56, 32, "M5")
    # Clean curved bottom-right specular rim bounce inside curved glass!
    paint_tapered_stroke(
        c, "visor_fx",
        [(67.5, 37.2, 0.6), (70.4, 36.8, 0.6), (72.8, 35.6, 0.5)],
        "V3", mask_layer="visor_glass",
    )
    c.draw_line("visor_fx", 69, 37, 71, 37, "V4")

    # Left Acoustic Ear-Transducer Pod (sleek & clean without redundant vertical stub!)
    c.fill_polygon("helmet_front_pods", [(45, 26), (51, 25), (52, 36), (47, 38), (44, 34), (44, 29)], "M1")
    c.fill_rect("helmet_front_pods", 46, 26, 50, 31, "M3")
    c.draw_line("helmet_front_pods", 46, 26, 49, 26, "M4")
    c.draw_line("helmet_front_pods", 47, 26, 48, 26, "M5")
    c.fill_rect("helmet_front_pods", 47, 32, 50, 36, "M0")
    c.fill_rect("helmet_front_pods", 47, 33, 49, 34, "V3")
    c.draw_line("helmet_front_pods", 47, 33, 48, 33, "V4")

    # Recessed chin-guard rebreather vent grille (crisp 2px louvers, zero stray dots!)
    c.fill_rect("helmet_front_pods", 60, 41, 69, 43, "M0")
    for gx in (61, 64, 67):
        c.fill_rect("helmet_front_pods", gx, 41, gx + 1, 42, "M2")
        c.draw_line("helmet_front_pods", gx, 41, gx + 1, 41, "M3")

    # ==========================================================================
    # 10. UNIFIED PAINTERLY SEL-OUT & SURGICAL ORPHAN CLEANUP PASS
    # ==========================================================================
    comp = c.composite_indices()
    H, W = comp.shape
    sel_dark = {
        "S0": "B0", "S1": "B0", "S2": "S0", "S3": "S1", "S4": "S2", "S5": "S3",
        "B1": "B0", "B2": "B0", "B3": "B1", "B4": "B2",
        "M0": "B0", "M1": "M0", "M2": "M0", "M3": "M1", "M4": "M2",
        "V1": "V0", "V2": "V0", "V3": "V1",
    }
    sel_mid = {
        "S3": "S2", "S4": "S2", "S5": "S3",
        "M3": "M2", "M4": "M2",
        "B3": "B2", "B4": "B2",
    }
    for y in range(H):
        for x in range(W):
            v = int(comp[y, x])
            if v == 0:
                continue
            tok = IDX_TO_TOKEN[v]
            empties = []
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if not (0 <= nx < W and 0 <= ny < H) or comp[ny, nx] == 0:
                    empties.append((dx, dy))
            if not empties:
                continue
            ox = sum(d[0] for d in empties)
            oy = sum(d[1] for d in empties)
            if ox + oy >= 1 and tok in sel_dark:
                c.set_px("selout", x, y, sel_dark[tok])
            elif ox + oy == 0 and tok in sel_mid:
                c.set_px("selout", x, y, sel_mid[tok])

    # Mechanical orphan-pixel cleanup pass (preserves intentional 1px specular catchlights!)
    comp2 = c.composite_indices()
    protected = {TOKEN_TO_IDX[t] for t in ("M5", "V5", "V4", "O6", "S5")}
    for y in range(H):
        for x in range(W):
            v = int(comp2[y, x])
            if v == 0 or v in protected:
                continue
            same = 0
            neigh: List[int] = []
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < W and 0 <= ny < H:
                    nv = int(comp2[ny, nx])
                    if nv == v:
                        same += 1
                    elif nv != 0:
                        neigh.append(nv)
            if same == 0 and neigh:
                c.set_px("polish", x, y, IDX_TO_TOKEN[max(set(neigh), key=neigh.count)])

    return c


def main() -> None:
    canvas = build_mara_lin_128()
    canvas.save_png(OUT_PNG)
    canvas.save_source_json(
        OUT_SRC,
        metadata={
            "asset_name": "Dr. Mara Lin — Hero Character Concept Benchmark (128x128)",
            "phase": "Phase 5 Round 3 (Final Quality-Gate Polish)",
            "target_canvas": "128x128 transparent RGBA",
            "ast_001_note": "Character design & visual-quality benchmark; does NOT overwrite AST-001 (96x384 animation sheet).",
        },
    )
    report = audit_sprite_png(OUT_PNG)
    print("=== Dr. Mara Lin 128x128 (Round 3) Automated QC Audit ===")
    for k, v in report.items():
        print(f"  {k}: {v}")

    make_inspection_sheet(
        [("Dr. Mara Lin 128x128 (Round 3 Final)", OUT_PNG)],
        Path("/tmp/mara_128_round3_review.png"),
        zoom=4,
    )
    print("Saved 4x multi-backdrop review sheet -> /tmp/mara_128_round3_review.png")


if __name__ == "__main__":
    main()
