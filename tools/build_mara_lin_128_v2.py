#!/usr/bin/env python3
"""
VERDANT SIGNAL — Dr. Mara Lin 128x128 Hero Concept Benchmark (Refinement Pass v2 — Final)
-----------------------------------------------------------------------------------------
Deliberate professional refinement pass on the EXISTING v1 Mara Lin concept
(preserving v1 untouched and saving separately as mara_lin_concept_128x128_v2).

Refinement Priorities Addressed (v2 Round 1 -> Round 2):
  1. Complete, naturally framed handheld Acoustic Field Scanner comfortably inside
     the 128x128 canvas (zero clipping/slicing, balanced margins on all 4 sides)
     with tilted 3/4 parabolic acoustic dish + internal receiver pin + clear gloved grip.
  2. Living 3/4 contrapposto explorer pose & body language (without redesigning her):
     subtle attentive forward-right lean, true 3/4 torso foreshortening, gentle hip
     contrapposto tilt, confident left elbow-out/hand-to-hip-pouch poise opening a
     crisp triangular negative-space window, tapered sculptural legs in a grounded
     exploratory stride.
  3. Calm, sculpted pixel clusters across suit, helmet, gloves, boots & equipment;
     zero accordion striping, zero robot-teeth chin grille, minimal accidental orphans.
  4. Unmistakable 4-material separation in BOTH color and grayscale:
     - Matte/satin earthy orange fabric (S3/S4 broad clusters, irregular fabric drape)
     - Compressed dark weathered leather & rubber (B0/B1 core + crisp B2/B3 edge wear)
     - High-contrast precision brushed titanium (sharp M0/M1 -> M4/M5 specular jumps)
     - Deep curved translucent dark-teal glass (V0/V1 depth + curved horizon + specular)
  5. Reference-aligned painterly lighting, shadow shapes & organic edges:
     lineless sunlit upper-left crests, deep plum-aubergine volume shadow masses,
     diagonal ~38 deg projected shadows, organic stepped fabric edges contrasted
     against crisp geometric metal edges.
  6. Strict 128x128 transparent RGBA, 30-color Master Palette, binary alpha only.

Outputs:
  - game/assets/characters/player/mara_lin_concept_128x128_v2.png
  - game/assets/characters/player/mara_lin_concept_128x128_v2.source.json
"""

from __future__ import annotations

import math
from pathlib import Path
from typing import Callable, List, Sequence, Tuple

import numpy as np
from PIL import Image, ImageDraw

from pixel_art_core import (
    IDX_TO_TOKEN,
    TOKEN_TO_IDX,
    PixelCanvas,
    audit_sprite_png,
)

V1_PNG = Path("game/assets/characters/player/mara_lin_concept_128x128.png")
V2_PNG = Path("game/assets/characters/player/mara_lin_concept_128x128_v2.png")
V2_SRC = Path("game/assets/characters/player/mara_lin_concept_128x128_v2.source.json")


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


def _macro_painterly_wave(x: int, y: int) -> float:
    """
    Deterministic low-frequency 2x2 / 3x2 macro-cluster modulation inspired by the
    reference's interlocking painterly clusters (keeps shapes solid & noise-free).
    """
    bx = x // 2
    by = y // 2
    return math.sin(bx * 1.47 + by * 2.13) * 0.55 + math.cos(bx * 0.83 - by * 1.59) * 0.45


def shade_painterly_suit(
    c: PixelCanvas,
    layer: str,
    cx: float,
    cy: float,
    rx: float,
    ry: float,
    fold_fn: Callable[[int, int, float, float], float] | None = None,
    bias: float = 0.0,
    allow_s5: bool = False,
    wobble: float = 0.07,
) -> None:
    """
    Painterly reference-aligned insulated fabric shading:
      - Generous earthy burnt-orange (S3) & rust (S2) midtones with organic
        interlocking 2-4px cluster borders.
      - Warm sunlit apricot (S4) on upper-left planes; precious S5 reserved ONLY
        for top sunlit crests (helmet crown, left shoulder dome, main chest ridge).
      - Deep plum-aubergine (S0) & mahogany (S1) volume shadow masses (lineless!).
    """
    lyr = c.layer(layer)
    x0 = max(0, int(math.floor(cx - rx - 9)))
    x1 = min(c.width - 1, int(math.ceil(cx + rx + 9)))
    y0 = max(0, int(math.floor(cy - ry - 9)))
    y1 = min(c.height - 1, int(math.ceil(cy + ry + 9)))

    for y in range(y0, y1 + 1):
        ny = (y + 0.5 - cy) / max(ry, 1.0)
        for x in range(x0, x1 + 1):
            if lyr[y, x] == 0:
                continue
            nx = (x + 0.5 - cx) / max(rx, 1.0)
            nz = math.sqrt(max(0.06, 1.0 - min(0.94, nx * nx * 0.62 + ny * ny * 0.55)))
            dot = (-0.66 * nx - 0.56 * ny + 0.48 * nz) + bias
            if fold_fn is not None:
                dot += fold_fn(x, y, nx, ny)
            dot += _macro_painterly_wave(x, y) * wobble

            if dot < -0.22:
                tok = "S0"
            elif dot < 0.06:
                tok = "S1"
            elif dot < 0.34:
                tok = "S2"
            elif dot < 0.64:
                tok = "S3"
            elif dot < 0.87 or not allow_s5:
                tok = "S4"
            else:
                tok = "S5"
            c.set_px(layer, x, y, tok)


def carve_soft_seam(
    c: PixelCanvas,
    layer: str,
    mask_layer: str,
    pts: Sequence[Tuple[int, int]],
    lit_split_x: int,
    crest_end_x: int,
    add_lip: bool = True,
) -> None:
    """Organic tailored fabric seam (recessed crease + sunlit upper-lit puff lip)."""
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
            c.set_px(layer, x, y, "S0" if x > lit_split_x else "S1")
            if add_lip and c.get_px(mask_layer, x, y + 1) != ".":
                if x <= crest_end_x:
                    c.set_px(layer, x, y + 1, "S4")
                elif x <= lit_split_x:
                    c.set_px(layer, x, y + 1, "S3")


def build_mara_lin_128_v2() -> PixelCanvas:
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
        "specimen_vial",
        "shoulder_hose",
        "front_arm",
        "front_arm_details",
        "collar_ring",
        "helmet_rear_pod",
        "helmet_shell",
        "visor_bezel",
        "visor_glass",
        "visor_fx",
        "helmet_front_pod",
        "painterly_edges",
        "polish",
    ]
    for name in layer_names:
        c.add_layer(name)

    # ==========================================================================
    # 1. COMPACT UPPER-BACK LIFE-SUPPORT PACK + O2 CYLINDER + WHIP ANTENNA
    #    Slightly tilted ~4 deg matching Mara's attentive forward-right explorer lean!
    # ==========================================================================
    c.fill_polygon(
        "backpack",
        [(30, 33), (46, 31), (50, 34), (49, 60), (44, 63), (30, 62), (27, 57), (28, 37)],
        "M1",
    )
    # Sharp precision brushed-titanium bevel (high-contrast metal separation!)
    c.fill_polygon("backpack", [(30, 33), (46, 32), (46, 38), (29, 39)], "M3", mask_layer="backpack")
    c.draw_polyline("backpack", [(31, 33), (39, 32), (45, 32)], "M4", mask_layer="backpack")
    c.draw_line("backpack", 33, 33, 39, 32, "M5", mask_layer="backpack")
    c.fill_rect("backpack", 30, 40, 42, 57, "M2")
    # Two clean recessed radiator louvers
    for vy in (43, 47):
        c.draw_line("backpack", 32, vy, 41, vy, "M0")
        c.draw_line("backpack", 32, vy + 1, 39, vy + 1, "M3")
    # Compact recessed muted-teal status bar
    c.fill_rect("backpack", 32, 51, 38, 54, "V0")
    c.fill_rect("backpack", 33, 52, 37, 53, "V3")
    c.draw_line("backpack", 33, 52, 35, 52, "V4")
    # Deep chamfered underside metal shadow
    c.fill_polygon("backpack", [(30, 58), (47, 58), (44, 63), (30, 62)], "M0", mask_layer="backpack")
    c.draw_line("backpack", 31, 57, 40, 57, "M3")

    # Cylindrical pressurized O2 canister strapped to far-left back (x=22..30, y=38..62)
    for y in range(38, 63):
        for x in range(22, 31):
            if y in (38, 62) and x in (22, 30):
                continue
            u = (x - 22.0) / 8.0
            if u < 0.16:
                tok = "M2" if y < 58 else "M1"
            elif u < 0.36:
                tok = "M4" if y < 59 else "M3"
            elif u < 0.52:
                tok = "M5" if (40 <= y <= 57) else "M4"
            elif u < 0.76:
                tok = "M1"
            else:
                tok = "M0"
            if 48 <= y <= 52:
                tok = "S4" if u < 0.42 else ("S3" if u < 0.68 else "S1")
            c.set_px("backpack", x, y, tok)
    for cy in (43, 56):
        c.draw_line("backpack", 22, cy, 30, cy, "M0")
        c.draw_line("backpack", 23, cy + 1, 27, cy + 1, "M4")
        c.draw_line("backpack", 28, cy + 1, 30, cy + 1, "M1")
    c.fill_rect("backpack", 24, 35, 28, 38, "M2")
    c.draw_line("backpack", 24, 35, 27, 35, "M4")
    c.fill_rect("backpack", 26, 36, 27, 37, "O6")

    # Single slender planetary whip antenna rising gently left-up (y=12..33)
    c.fill_rect("backpack", 33, 29, 36, 33, "M1")
    c.draw_line("backpack", 33, 29, 35, 29, "M4")
    c.draw_polyline("backpack", [(34, 29), (33, 21), (32, 14)], "M1")
    c.draw_polyline("backpack", [(34, 27), (33, 20), (32, 15)], "M3")
    c.fill_rect("backpack", 31, 11, 33, 13, "V3")
    c.fill_rect("backpack", 32, 11, 33, 12, "V4")
    c.set_px("backpack", 32, 11, "V5")

    # ==========================================================================
    # 2. FAR/RIGHT ARM + ATTENTIVE SCANNING POSE + COMPLETE PARABOLIC SCANNER
    #    Raised naturally forward-upward (x=71..105, y=46..75) -> 22px right margin!
    # ==========================================================================
    c.fill_polygon(
        "rear_arm",
        [(70, 47), (79, 49), (85, 56), (85, 64), (91, 63), (92, 70), (83, 73), (76, 67), (72, 59)],
        "S2",
    )
    def rear_arm_folds(x: int, y: int, nx: float, ny: float) -> float:
        if 60 <= y <= 67 and 76 <= x <= 85:
            return -0.24 * math.exp(-((y - 63.5) ** 2) / 4.8)
        return 0.0

    shade_painterly_suit(
        c, "rear_arm", 79.5, 59.5, 11.5, 14.5,
        fold_fn=rear_arm_folds,
        bias=-0.16,
        allow_s5=False,
        wobble=0.07,
    )
    carve_soft_seam(c, "rear_arm", "rear_arm", [(73, 56), (79, 57), (84, 56)], lit_split_x=79, crest_end_x=76)
    c.draw_polyline("rear_arm", [(77, 64), (81, 65), (85, 64)], "S0", mask_layer="rear_arm")

    # Compact brushed-titanium & teal wrist lock cuff
    c.fill_polygon("rear_arm", [(85, 63), (89, 62), (90, 71), (86, 72)], "M1")
    c.draw_line("rear_arm", 86, 63, 88, 62, "M4")
    c.fill_rect("rear_arm", 87, 65, 88, 69, "V2")
    c.draw_line("rear_arm", 87, 65, 87, 67, "V4")

    # Articulated dark weathered leather glove gripping scanner handle cleanly!
    c.fill_polygon("rear_arm", [(88, 63), (95, 63), (97, 68), (95, 73), (90, 73), (87, 69)], "B0")
    c.fill_polygon("rear_arm", [(89, 64), (94, 64), (94, 69), (89, 69)], "B1")
    c.draw_line("rear_arm", 89, 64, 93, 64, "B2")
    c.draw_line("rear_arm", 90, 64, 92, 64, "B3")
    # Distinct wrapped finger creases underneath handle
    c.draw_line("rear_arm", 90, 70, 95, 70, "B1")
    c.draw_line("rear_arm", 91, 72, 94, 72, "B1")

    # COMPLETE, UN-CLIPPED 3/4 Parabolic Acoustic Field Scanner (x=88..105, y=51..75)
    # Tilted attentively upward (~24 deg) with wide concave parabolic dish + receiver pin!
    # Ergonomic dark rubber pistol grip descending cleanly below glove
    c.fill_polygon("scanner", [(90, 71), (94, 71), (93, 75), (89, 75)], "B0")
    c.draw_line("scanner", 90, 72, 90, 74, "B2")
    # Compact chamfered titanium transceiver chassis angled upward-right
    c.fill_polygon("scanner", [(88, 61), (96, 57), (99, 63), (96, 67), (89, 68), (87, 64)], "M1")
    c.fill_polygon("scanner", [(89, 62), (95, 58), (96, 63), (90, 65)], "M2", mask_layer="scanner")
    c.draw_polyline("scanner", [(89, 61), (92, 59), (95, 57)], "M4", mask_layer="scanner")
    c.draw_line("scanner", 90, 60, 93, 58, "M5", mask_layer="scanner")
    c.draw_polyline("scanner", [(89, 67), (94, 66), (97, 65)], "M0", mask_layer="scanner")
    # Warm burnt-orange expedition identification panel on chassis
    c.fill_polygon("scanner", [(90, 63), (94, 61), (95, 64), (91, 65)], "S3", mask_layer="scanner")
    c.draw_line("scanner", 91, 63, 93, 62, "S4", mask_layer="scanner")

    # COMPLETE Closed Rounded 3/4 Parabolic Acoustic Collector Dish (center 99.8, 59.0, rx=5.2, ry=7.0)
    # 100% closed titanium lip, zero sliced edges, 22px clear from right canvas edge!
    c.fill_ellipse("scanner", 99.6, 59.0, 5.2, 7.0, "M1")
    for y in range(51, 67):
        for x in range(94, 106):
            if c.get_px("scanner", x, y) == ".":
                continue
            dx = (x - 99.6) / 5.2
            dy = (y - 59.0) / 7.0
            r2 = dx * dx + dy * dy
            if r2 > 0.60:
                if dy < -0.25 and dx < 0.40:
                    c.set_px("scanner", x, y, "M4" if dy < -0.60 else "M3")
                elif dx > 0.45 or dy > 0.45:
                    c.set_px("scanner", x, y, "M0")
                else:
                    c.set_px("scanner", x, y, "M2")
    # Concave dark-teal parabolic resonance dish interior (offset +0.8 right, -0.3 up for 24 deg tilt!)
    c.fill_ellipse("scanner", 100.3, 58.7, 3.6, 5.4, "V0")
    c.fill_ellipse("scanner", 100.6, 58.6, 2.8, 4.3, "V2")
    c.fill_ellipse("scanner", 100.8, 58.4, 1.9, 3.0, "V3")
    # Crisp central acoustic transducer probe tip emerging gently inside the glowing dish!
    c.draw_line("scanner", 99, 59, 102, 58, "M1")
    c.fill_rect("scanner", 101, 57, 102, 59, "V4")
    c.set_px("scanner", 102, 57, "V5")
    c.set_px("scanner", 101, 57, "M5")
    c.draw_line("scanner", 97, 53, 99, 52, "M5")  # crisp metallic top rim glint

    # ==========================================================================
    # 3. LIVING CONTRAPPOSTO EXPLORER LEGS & GROUNDED HEAVY BOOTS!
    #    Tapered sculptural calves (no pipe legs!), slightly wider confident stride:
    #    - Near/left weight-bearing leg planted solidly forward (sole y=117)
    #    - Far/right trailing leg stepped naturally back-right (+3px wider, sole y=114)
    # ==========================================================================
    # --- FAR / RIGHT LEG (stepped naturally back-right with bent knee & calf taper) ---
    c.fill_polygon(
        "rear_leg",
        [(63, 76), (77, 77), (83, 88), (85, 96), (84, 105), (73, 105), (71, 95), (66, 86)],
        "S2",
    )
    def rear_leg_folds(x: int, y: int, nx: float, ny: float) -> float:
        # ONE organic diagonal cloth fold draping naturally above trailing boot collar
        if 99 <= y <= 105:
            d = y - (101.2 + (x - 77) * 0.18)
            return -0.24 * math.exp(-(d * d) / 1.8) + 0.16 * math.exp(-((d - 1.8) ** 2) / 2.2)
        return 0.0

    shade_painterly_suit(
        c, "rear_leg", 75.0, 90.5, 10.5, 16.0,
        fold_fn=rear_leg_folds,
        bias=-0.18,
        allow_s5=False,
        wobble=0.07,
    )
    # Soft diagonal shadow cast by pelvis/front thigh onto inner rear thigh
    c.fill_polygon("rear_leg", [(63, 76), (72, 77), (71, 88), (66, 86)], "S1", mask_layer="rear_leg")
    c.fill_polygon("rear_leg", [(63, 76), (69, 77), (68, 82), (65, 81)], "S0", mask_layer="rear_leg")

    # Dark compressed-leather contoured knee guard on far knee (unmistakably darker than orange!)
    c.fill_polygon("rear_leg", [(73, 88), (83, 88), (85, 94), (81, 96), (74, 95)], "B0")
    c.fill_polygon("rear_leg", [(74, 89), (81, 89), (81, 93), (75, 94)], "B1")
    c.draw_line("rear_leg", 75, 89, 80, 89, "B2")
    c.draw_line("rear_leg", 75, 89, 77, 89, "B3")
    c.draw_line("rear_leg", 70, 92, 74, 92, "B0")
    # Projected cast shadow under knee guard onto calm shin plane
    c.fill_polygon("rear_leg", [(73, 95), (84, 95), (84, 98), (72, 98)], "S0", mask_layer="rear_leg")
    c.draw_line("rear_leg", 72, 99, 82, 99, "S1", mask_layer="rear_leg")

    # --- FAR / RIGHT HEAVY PLANETARY BOOT (y=103..114, wider confident stride!) ---
    c.fill_polygon(
        "rear_boot",
        [(72, 103), (84, 103), (87, 108), (92, 111), (91, 113), (87, 114), (73, 114), (71, 109)],
        "B0",
    )
    c.fill_polygon("rear_boot", [(73, 104), (81, 104), (85, 109), (74, 110)], "B1", mask_layer="rear_boot")
    c.draw_polyline("rear_boot", [(74, 104), (79, 104), (83, 108)], "B2", mask_layer="rear_boot")
    c.draw_line("rear_boot", 75, 104, 78, 104, "B3", mask_layer="rear_boot")
    c.draw_line("rear_boot", 84, 109, 90, 111, "B2", mask_layer="rear_boot")
    c.draw_line("rear_boot", 85, 109, 88, 110, "B3", mask_layer="rear_boot")
    # Crisp brushed titanium ankle strap clasp (distinct metal glint against dark leather!)
    c.fill_rect("rear_boot", 77, 106, 80, 107, "M2")
    c.draw_line("rear_boot", 77, 106, 79, 106, "M4")
    # Matte rubber lugged sole (deep B0 mass + quiet tread relief)
    c.fill_polygon("rear_boot", [(72, 111), (91, 111), (91, 113), (87, 114), (73, 114)], "B0")
    for tx in (75, 79, 83, 87):
        c.set_px("rear_boot", tx, 113, "B1")

    # --- NEAR / LEFT WEIGHT-BEARING LEG (planted firmly forward, tapered ankle & organic drape!) ---
    c.fill_polygon(
        "front_leg",
        [(41, 74), (59, 76), (57, 90), (54, 107), (42, 107), (39, 96), (39, 85)],
        "S3",
    )
    def front_leg_folds(x: int, y: int, nx: float, ny: float) -> float:
        # ONE organic diagonal fabric gather draping over boot collar + soft inner thigh turn
        val = 0.0
        if 98 <= y <= 106:
            d = y - (101.8 - (x - 47) * 0.24)
            val += -0.24 * math.exp(-(d * d) / 1.9) + 0.16 * math.exp(-((d - 1.9) ** 2) / 2.4)
        if y < 83 and x > 50:
            val -= 0.16
        return val

    shade_painterly_suit(
        c, "front_leg", 47.5, 90.5, 10.2, 16.8,
        fold_fn=front_leg_folds,
        bias=0.06,
        allow_s5=False,
        wobble=0.075,
    )
    # Diagonal projected cast shadow from utility belt & hip pouch across upper thigh
    c.fill_polygon("front_leg", [(41, 74), (59, 76), (58, 80), (40, 78)], "S1", mask_layer="front_leg")
    c.fill_polygon("front_leg", [(43, 74), (59, 76), (58, 78), (43, 76)], "S0", mask_layer="front_leg")

    # Dark compressed-leather contoured front knee guard (strong grayscale separation from orange!)
    c.fill_polygon("front_leg", [(39, 88), (52, 89), (53, 95), (48, 97), (40, 96)], "B0")
    c.fill_polygon("front_leg", [(40, 89), (49, 90), (49, 94), (41, 94)], "B1")
    c.fill_polygon("front_leg", [(41, 89), (47, 90), (46, 92), (41, 92)], "B2")
    c.draw_line("front_leg", 42, 89, 45, 89, "B3")  # crisp worn-leather top edge catch
    # Rear dark retention strap + crisp diagonal shadow beneath knee pad
    c.fill_rect("front_leg", 52, 91, 56, 92, "B0")
    c.draw_line("front_leg", 52, 91, 55, 91, "B1")
    c.fill_polygon("front_leg", [(40, 96), (54, 97), (55, 99), (40, 98)], "S0", mask_layer="front_leg")
    c.draw_line("front_leg", 40, 99, 53, 99, "S1", mask_layer="front_leg")

    # --- NEAR / LEFT HEAVY PLANETARY BOOT (y=105..117, weighty grounded frontier boot!) ---
    c.fill_polygon(
        "front_boot",
        [(41, 105), (55, 105), (58, 111), (62, 113), (61, 116), (58, 117), (42, 117), (40, 112)],
        "B0",
    )
    c.fill_polygon("front_boot", [(41, 106), (51, 106), (55, 112), (42, 112)], "B1", mask_layer="front_boot")
    c.fill_polygon("front_boot", [(42, 106), (49, 106), (50, 110), (42, 110)], "B2", mask_layer="front_boot")
    c.draw_line("front_boot", 43, 106, 47, 106, "B3", mask_layer="front_boot")
    # Reinforced curved leather toe dome highlight
    c.fill_polygon("front_boot", [(51, 111), (58, 112), (60, 114), (51, 114)], "B1", mask_layer="front_boot")
    c.draw_line("front_boot", 53, 111, 58, 112, "B2", mask_layer="front_boot")
    c.draw_line("front_boot", 54, 111, 56, 111, "B3", mask_layer="front_boot")
    # High-contrast brushed-titanium ankle cinch clasp (clearly metallic vs dark leather!)
    c.fill_rect("front_boot", 45, 108, 49, 109, "M2")
    c.draw_line("front_boot", 45, 108, 48, 108, "M4")
    c.set_px("front_boot", 46, 108, "M5")
    c.draw_line("front_boot", 45, 110, 49, 110, "B0")
    # Heavy rubber mud-tread sole
    c.fill_polygon("front_boot", [(41, 114), (61, 114), (61, 116), (58, 117), (42, 117)], "B0")
    for tx in (44, 48, 52, 56, 59):
        c.set_px("front_boot", tx, 116, "B1")

    # ==========================================================================
    # 4. BULKY OVERSIZED QUILTED TORSO — TRUE 3/4 TURN & SUBTLE FORWARD LEAN!
    #    Upper chest shifted +1.5px forward-right; gentle contrapposto hip slope!
    # ==========================================================================
    c.fill_polygon(
        "torso",
        [(44, 43), (73, 44), (78, 50), (77, 63), (75, 74), (72, 81), (61, 83), (47, 80), (44, 73), (45, 62), (42, 50)],
        "S3",
    )
    def torso_folds(x: int, y: int, nx: float, ny: float) -> float:
        val = 0.0
        if 65 <= y <= 73:
            val += 0.14 * math.sin((x - 60) * 0.40) * ((y - 65) / 8.0)
        return val

    shade_painterly_suit(
        c, "torso", 59.0, 60.0, 19.5, 20.5,
        fold_fn=torso_folds,
        bias=0.05,
        allow_s5=True,
        wobble=0.07,
    )
    # Diagonal projected cast shadow from helmet & neck lock collar across upper-right chest!
    c.fill_ellipse("torso_seams", 62.5, 47.0, 15.2, 4.4, "S1", mask_layer="torso")
    c.fill_ellipse("torso_seams", 64.0, 45.8, 13.0, 3.0, "S0", mask_layer="torso")
    # Calm tailored horizontal chest seam curving subtly in 3/4 space
    carve_soft_seam(c, "torso_seams", "torso", [(45, 55), (57, 57), (69, 56), (77, 54)], lit_split_x=63, crest_end_x=53)
    # Curved pelvis gusset tension fold below contrapposto belt
    c.draw_polyline("torso_seams", [(50, 78), (58, 81), (65, 82), (70, 79)], "S1", mask_layer="torso")
    c.draw_polyline("torso_seams", [(56, 81), (61, 83), (67, 82)], "S0", mask_layer="torso")
    c.draw_polyline("torso_seams", [(48, 78), (54, 80), (58, 80)], "S4", mask_layer="torso")

    # ==========================================================================
    # 5. DARK WEATHERED LEATHER HARNESS, 3/4 CHEST RIG & CONTRAPPOSTO BELT
    #    Compressed dark B0/B1 leather core gives crystal-clear separation from S3 orange!
    # ==========================================================================
    # Left (near, wider & lit) dark weathered leather harness strap curving across 3/4 chest
    c.fill_polygon("harness", [(48, 44), (53, 45), (56, 72), (51, 72)], "B1")
    c.draw_polyline("harness", [(48, 45), (49, 57), (51, 71)], "B2", thickness=2)
    c.draw_polyline("harness", [(48, 45), (49, 55)], "B3")
    c.draw_polyline("harness", [(53, 46), (55, 58), (56, 71)], "B0")
    c.draw_polyline("harness", [(54, 48), (56, 60), (57, 71)], "S1")  # cast shadow right of strap

    # Right (far, foreshortened & shaded) dark leather harness strap
    c.fill_polygon("harness", [(69, 45), (73, 45), (72, 73), (68, 73)], "B0")
    c.draw_polyline("harness", [(69, 46), (68, 60), (68, 72)], "B1")

    # Crisp high-contrast brushed titanium shoulder clasps
    for bx, by, lit in [(48, 48, True), (68, 49, False)]:
        c.fill_rect("harness", bx, by, bx + 4, by + 2, "M1")
        c.draw_line("harness", bx, by, bx + 3, by, "M4" if lit else "M3")
        if lit:
            c.set_px("harness", bx + 1, by, "M5")
        c.draw_line("harness", bx, by + 3, bx + 4, by + 3, "B0")

    # 3/4 Cantilevered Brushed-Titanium Chest Bio-Acoustic Oscilloscope (x=54..71, y=52..64)
    c.fill_polygon("harness", [(56, 64), (72, 64), (73, 54), (74, 66), (57, 67)], "S0")
    c.fill_polygon("harness", [(56, 66), (74, 66), (73, 68), (58, 68)], "S1")
    c.fill_polygon("harness", [(54, 52), (70, 52), (72, 54), (72, 63), (70, 64), (55, 64), (54, 62)], "M1")
    c.fill_polygon("harness", [(55, 53), (69, 53), (70, 62), (55, 62)], "M2")
    # Precision metallic specular bevels
    c.draw_line("harness", 55, 52, 69, 52, "M4")
    c.draw_line("harness", 56, 52, 62, 52, "M5")
    c.draw_line("harness", 54, 53, 54, 62, "M3")
    c.draw_line("harness", 72, 54, 72, 63, "M0")
    c.draw_line("harness", 55, 64, 71, 64, "M0")
    # Deep recessed muted-teal oscilloscope screen + clean harmonic wave trace
    c.fill_rect("harness", 56, 54, 66, 61, "V0")
    c.fill_rect("harness", 57, 55, 65, 60, "V1")
    c.fill_rect("harness", 57, 56, 64, 59, "V2")
    for wx, wy in [(58, 58), (59, 58), (60, 57), (61, 56), (62, 58), (63, 59), (64, 57)]:
        c.set_px("harness", wx, wy, "V4")
    c.set_px("harness", 61, 56, "V5")
    c.draw_line("harness", 57, 55, 58, 55, "V5")
    # Clean tactile control stack (one dark dial + one crisp ruby emergency pip)
    c.fill_rect("harness", 68, 55, 70, 57, "M0")
    c.draw_line("harness", 68, 55, 69, 55, "M4")
    c.fill_rect("harness", 68, 59, 70, 61, "O6")
    c.set_px("harness", 68, 59, "S5")

    # Contrapposto Angled Dark Weathered Leather Utility Belt (left hip y=71, right hip y=73!)
    c.fill_polygon("harness", [(44, 71), (76, 73), (76, 78), (62, 79), (45, 76)], "B0")
    c.fill_polygon("harness", [(45, 71), (63, 73), (62, 76), (45, 74)], "B1")
    c.draw_polyline("harness", [(45, 71), (55, 72), (62, 73)], "B2")
    c.draw_line("harness", 47, 71, 53, 72, "B3")
    # High-contrast brushed titanium quick-release center buckle (angles subtly with belt!)
    c.fill_rect("harness", 58, 72, 66, 79, "M0")
    c.fill_rect("harness", 59, 73, 65, 78, "M2")
    c.draw_line("harness", 58, 72, 65, 72, "M4")
    c.draw_line("harness", 59, 72, 62, 72, "M5")
    c.draw_line("harness", 58, 72, 58, 78, "M3")
    c.fill_rect("harness", 61, 74, 63, 77, "M1")
    c.fill_rect("harness", 61, 75, 62, 76, "V4")

    # Left-hip dark weathered leather field pouch (tucked cleanly under left hand!)
    c.fill_polygon("harness", [(45, 73), (53, 74), (53, 81), (46, 81), (44, 77)], "B0")
    c.fill_rect("harness", 45, 74, 51, 79, "B1")
    c.draw_line("harness", 45, 74, 51, 74, "B2")
    c.draw_line("harness", 46, 74, 49, 74, "B3")
    c.draw_line("harness", 45, 77, 52, 77, "B0")
    c.fill_rect("harness", 47, 76, 49, 77, "M3")
    c.set_px("harness", 47, 76, "M5")

    # Right-hip Hanging Glass Xenobiology Specimen Canister (x=70..77, y=73..86)
    c.fill_rect("specimen_vial", 70, 73, 77, 75, "M2")
    c.draw_line("specimen_vial", 70, 73, 75, 73, "M4")
    c.draw_line("specimen_vial", 71, 73, 73, 73, "M5")
    c.fill_rect("specimen_vial", 70, 75, 77, 84, "V0")
    c.fill_rect("specimen_vial", 71, 76, 76, 82, "V1")
    # Glowing organic alien moss sample inside translucent glass cylinder
    c.fill_rect("specimen_vial", 72, 79, 75, 82, "O2")
    c.fill_rect("specimen_vial", 72, 78, 74, 80, "O3")
    c.fill_rect("specimen_vial", 72, 78, 73, 79, "O4")
    c.draw_line("specimen_vial", 71, 76, 71, 81, "V4")
    c.draw_line("specimen_vial", 71, 77, 71, 79, "V5")
    c.set_px("specimen_vial", 71, 77, "M5")
    c.fill_rect("specimen_vial", 70, 83, 77, 85, "M1")
    c.draw_line("specimen_vial", 70, 83, 74, 83, "M3")
    c.draw_line("specimen_vial", 70, 85, 77, 85, "M0")

    # ==========================================================================
    # 6. CORRUGATED EVA LIFE-SUPPORT SHOULDER HOSE (Backpack -> Neck Collar)
    # ==========================================================================
    hose_arc = [(41, 35, 1.9), (42, 39, 1.9), (44, 43, 1.8), (47, 45, 1.7)]
    paint_tapered_stroke(c, "shoulder_hose", [(x + 1, y + 1, r) for x, y, r in hose_arc], "B0")
    paint_tapered_stroke(c, "shoulder_hose", hose_arc, "M1")
    paint_tapered_stroke(c, "shoulder_hose", [(x - 0.6, y - 0.5, 1.0) for x, y, r in hose_arc], "M3")
    for hx, hy in [(42, 38), (43, 41), (45, 44)]:
        c.draw_line("shoulder_hose", hx - 1, hy, hx + 1, hy, "M0")
        c.draw_line("shoulder_hose", hx - 1, hy - 1, hx, hy - 1, "M4")

    # ==========================================================================
    # 7. NEAR/LEFT BULKY QUILTED ARM — CONFIDENT EXPLORER POISE (ELBOW-OUT!)
    #    Elbow angled slightly outward-back (x=25..31), forearm curving purposefully
    #    inward toward her left utility pouch -> CRISP TRIANGULAR BREATHING WINDOW!
    # ==========================================================================
    c.fill_polygon(
        "front_arm",
        [(36, 44), (45, 46), (44, 55), (38, 63), (42, 70), (36, 74), (27, 68), (25, 59), (28, 49)],
        "S3",
    )
    def front_arm_folds(x: int, y: int, nx: float, ny: float) -> float:
        # Deep natural inner-elbow compression fold where forearm bends forward-inward!
        if 59 <= y <= 67 and x >= 33:
            return -0.26 * math.exp(-((y - 63.0) ** 2) / 4.2)
        return 0.0

    shade_painterly_suit(
        c, "front_arm", 34.0, 58.5, 9.8, 15.5,
        fold_fn=front_arm_folds,
        bias=0.14,
        allow_s5=True,
        wobble=0.075,
    )
    # Tailored bicep seam + natural bent-elbow crease
    carve_soft_seam(c, "front_arm_details", "front_arm", [(27, 55), (33, 56), (43, 55)], lit_split_x=38, crest_end_x=33)
    carve_soft_seam(c, "front_arm_details", "front_arm", [(27, 64), (33, 65), (39, 63)], lit_split_x=36, crest_end_x=32)
    # Sewn muted-teal Solstice Exo-Survey shoulder patch on sunlit upper bicep
    c.fill_polygon("front_arm_details", [(30, 49), (36, 48), (37, 53), (31, 54)], "V2", mask_layer="front_arm")
    c.draw_line("front_arm_details", 31, 49, 35, 48, "V3", mask_layer="front_arm")
    c.fill_rect("front_arm_details", 32, 50, 33, 51, "O5")
    c.draw_line("front_arm_details", 31, 54, 37, 53, "S1", mask_layer="front_arm")

    # Angled brushed-titanium & teal wrist lock cuff (following inward forearm angle!)
    c.fill_polygon("front_arm_details", [(33, 71), (43, 68), (45, 72), (35, 75)], "M1")
    c.draw_line("front_arm_details", 34, 71, 41, 69, "M4")
    c.draw_line("front_arm_details", 35, 71, 37, 70, "M5")
    c.fill_polygon("front_arm_details", [(35, 72), (42, 70), (43, 72), (36, 74)], "V2")
    c.draw_line("front_arm_details", 36, 72, 39, 71, "V4")
    c.draw_line("front_arm_details", 35, 75, 45, 72, "M0")

    # Sculpted dark weathered-leather left glove resting purposefully near hip pouch!
    # Clear 1px shadow trough separates glove knuckles cleanly from the leather pouch right behind!
    c.fill_polygon(
        "front_arm_details",
        [(36, 74), (44, 72), (46, 76), (44, 81), (39, 82), (35, 78)],
        "B0",
    )
    c.fill_polygon("front_arm_details", [(37, 74), (43, 73), (43, 78), (37, 79)], "B1")
    c.fill_polygon("front_arm_details", [(37, 74), (42, 74), (41, 76), (37, 77)], "B2")
    c.draw_line("front_arm_details", 38, 74, 42, 74, "B3")
    c.draw_line("front_arm_details", 45, 73, 45, 80, "B0")  # clean crease between glove & hip pouch
    c.draw_line("front_arm_details", 40, 79, 44, 78, "B0")
    c.draw_line("front_arm_details", 39, 80, 43, 79, "B1")

    # ==========================================================================
    # 8. PRESSURIZED TITANIUM NECK LOCK COLLAR (shifted +1px right with forward lean!)
    # ==========================================================================
    c.fill_ellipse("collar_ring", 61.2, 44.6, 14.2, 3.8, "M1")
    for y in range(40, 49):
        for x in range(46, 77):
            if c.get_px("collar_ring", x, y) == ".":
                continue
            u = (x - 46.0) / 30.0
            if y <= 41:
                tok = "M0"
            elif y == 42:
                tok = "M4" if u < 0.36 else ("M3" if u < 0.56 else "M1")
            elif y == 43:
                tok = "M5" if (0.14 < u < 0.30) else ("M3" if u < 0.52 else ("M2" if u < 0.72 else "M0"))
            elif y <= 45:
                tok = "M2" if u < 0.46 else ("M1" if u < 0.70 else "M0")
            else:
                tok = "M0" if u > 0.42 else "M1"
            c.set_px("collar_ring", x, y, tok)
    for lx in (53, 67):
        c.fill_rect("collar_ring", lx, 43, lx + 2, 46, "M0")
        c.draw_line("collar_ring", lx, 43, lx + 1, 43, "M4" if lx < 59 else "M2")

    # ==========================================================================
    # 9. SIGNATURE HERO HELMET & DEEP CURVED GLASS VISOR (Focal Anchor!)
    #    Attentive forward-right +1.5px shift as Mara studies the acoustic reading!
    # ==========================================================================
    c.fill_polygon("helmet_rear_pod", [(75, 25), (79, 26), (79, 35), (75, 36)], "M0")
    c.fill_rect("helmet_rear_pod", 76, 27, 78, 33, "M1")
    c.draw_line("helmet_rear_pod", 76, 27, 77, 27, "M2")

    # Sculpted outer orange helmet shell
    c.fill_ellipse("helmet_shell", 61.0, 28.8, 16.5, 15.0, "S3")
    c.fill_polygon(
        "helmet_shell",
        [(52, 15), (65, 14), (75, 19), (78, 28), (77, 37), (71, 43), (61, 44), (51, 41), (46, 33)],
        "S3",
    )
    shade_painterly_suit(
        c, "helmet_shell", 60.5, 27.8, 16.5, 15.0,
        bias=0.10,
        allow_s5=True,
        wobble=0.05,
    )
    # Warm ceramic-ivory dorsal expedition stripe (soft sunlit transition, zero dark outline)
    for y in range(14, 21):
        for x in range(58, 66):
            if c.get_px("helmet_shell", x, y) == ".":
                continue
            if x == 65:
                c.set_px("helmet_shell", x, y, "S2" if y < 18 else "S1")
            elif x == 58:
                c.set_px("helmet_shell", x, y, "S4" if y < 18 else "S2")
            elif y < 17:
                c.set_px("helmet_shell", x, y, "M5" if x < 63 else "O5")
            elif y < 19:
                c.set_px("helmet_shell", x, y, "O5" if x < 63 else "M3")
            else:
                c.set_px("helmet_shell", x, y, "M3" if x < 63 else "M2")

    # Calm brushed-titanium visor bezel frame
    c.fill_ellipse("visor_bezel", 65.2, 30.8, 13.3, 9.8, "M1")
    for y in range(20, 42):
        for x in range(50, 80):
            if c.get_px("visor_bezel", x, y) == ".":
                continue
            nx = (x - 65.2) / 13.3
            ny = (y - 30.8) / 9.8
            if nx < -0.18 and ny < 0.05:
                tok = "M4" if (nx + ny < -0.78) else "M3"
            elif ny < -0.58 and nx < 0.44:
                tok = "M3"
            elif nx > 0.34 or ny > 0.52:
                tok = "M0"
            else:
                tok = "M2" if (nx + ny < 0.16) else "M1"
            c.set_px("visor_bezel", x, y, tok)
    c.draw_polyline("visor_bezel", [(57, 23), (59, 22), (61, 21)], "M5", mask_layer="visor_bezel")
    # Dark rubber pressure gasket
    c.fill_ellipse("visor_bezel", 65.5, 31.0, 11.6, 8.2, "B0")

    # Deep Curved Translucent Dark-Teal Glass Faceplate (Spherical Horizon + Subtle Earth Bounce!)
    c.fill_ellipse("visor_glass", 65.5, 31.0, 10.8, 7.4, "V1")
    for y in range(23, 39):
        for x in range(54, 77):
            if c.get_px("visor_glass", x, y) == ".":
                continue
            nx = (x - 65.5) / 10.8
            ny = (y - 31.0) / 7.4
            r2 = nx * nx + ny * ny

            # Concave inner brow cast shadow
            if ny < -0.56 or (nx < -0.68 and ny < 0.14):
                c.set_px("visor_glass", x, y, "V0")
                continue

            # Smooth spherical planetary sky-to-horizon reflection curve!
            horizon_y = 0.05 - 0.24 * (nx * nx) - 0.10 * nx
            if ny < horizon_y - 0.28:
                tok = "V2" if nx < 0.40 else "V1"
            elif ny < horizon_y + 0.14:
                tok = "V3" if (-0.42 < nx < 0.52) else "V2"
            elif ny < horizon_y + 0.50:
                # Curved dark translucent interior cavity behind glass (no flat horizontal bar!)
                inner_d = (nx * 1.15) ** 2 + ((ny - 0.28) * 1.65) ** 2
                tok = "V0" if inner_d < 0.34 else ("V1" if nx < 0.42 else "V0")
            else:
                tok = "V2" if (-0.28 < nx < 0.56 and r2 > 0.46) else "V0"
            c.set_px("visor_glass", x, y, tok)

    # Razor-Sharp Curved Glass Specular Reflection Slash + Secondary Glint + Ambient Rim Bounce
    paint_tapered_stroke(
        c, "visor_fx",
        [(56.8, 29.6, 1.25), (58.8, 27.1, 1.35), (61.7, 25.8, 1.25), (65.0, 25.4, 0.85)],
        "V4", mask_layer="visor_glass",
    )
    paint_tapered_stroke(
        c, "visor_fx",
        [(57.4, 29.0, 0.85), (59.3, 26.8, 0.95), (62.0, 25.7, 0.85), (64.1, 25.5, 0.5)],
        "V5", mask_layer="visor_glass",
    )
    for px, py in [(59, 27), (60, 26), (61, 26), (62, 25), (59, 28)]:
        c.set_px("visor_fx", px, py, "M5")
    c.fill_rect("visor_fx", 57, 32, 58, 33, "V5")
    c.set_px("visor_fx", 57, 32, "M5")
    # Delicate lower-right ambient bounce arc inside curved glass lip
    paint_tapered_stroke(
        c, "visor_fx",
        [(67.8, 37.0, 0.55), (70.8, 36.6, 0.55), (73.1, 35.4, 0.5)],
        "V3", mask_layer="visor_glass",
    )
    c.draw_line("visor_fx", 70, 37, 72, 36, "V4")

    # Left Acoustic Ear-Transducer Pod (beveled corners + cast-occlusion sliver onto dome!)
    c.draw_polyline("helmet_front_pod", [(51, 26), (52, 30), (52, 35), (49, 37)], "S0", mask_layer="helmet_shell")
    c.fill_polygon("helmet_front_pod", [(45, 25), (50, 24), (51, 35), (47, 37), (44, 34), (44, 27)], "M1")
    c.fill_rect("helmet_front_pod", 45, 26, 49, 30, "M3")
    c.draw_line("helmet_front_pod", 46, 25, 49, 25, "M4")
    c.draw_line("helmet_front_pod", 46, 25, 47, 25, "M5")
    c.fill_rect("helmet_front_pod", 46, 31, 49, 35, "M0")
    c.fill_rect("helmet_front_pod", 46, 32, 48, 33, "V3")
    c.draw_line("helmet_front_pod", 46, 32, 47, 32, "V4")

    # Calm Recessed Chin Rebreather Port (zero robot-teeth striping!)
    c.fill_polygon("helmet_front_pod", [(61, 40), (69, 40), (68, 43), (62, 43)], "M0")
    c.draw_line("helmet_front_pod", 62, 40, 67, 40, "M2")
    c.draw_line("helmet_front_pod", 63, 41, 66, 41, "M1")
    c.draw_line("helmet_front_pod", 62, 40, 64, 40, "M3")

    # ==========================================================================
    # 10. REFERENCE-ALIGNED PAINTERLY EDGE BREAKUP & ACCIDENTAL-ORPHAN POLISH
    #     - Lineless sunlit upper-left crests (warm ochre/ivory directly meets air!)
    #     - Organic irregular shadow anchoring along undersides & deep right recesses!
    # ==========================================================================
    comp = c.composite_indices()
    H, W = comp.shape
    soft_under = {
        "S1": "S0", "S2": "S1",
        "B1": "B0", "B2": "B1",
        "M1": "M0", "M2": "M1",
        "V1": "V0", "V2": "V1",
    }
    for y in range(H):
        for x in range(W):
            v = int(comp[y, x])
            if v == 0:
                continue
            tok = IDX_TO_TOKEN[v]
            below_empty = (y + 1 >= H) or (comp[y + 1, x] == 0)
            right_empty = (x + 1 >= W) or (comp[y, x + 1] == 0)
            if below_empty and tok in soft_under and _macro_painterly_wave(x, y) > -0.65:
                c.set_px("painterly_edges", x, y, soft_under[tok])
            elif right_empty and tok in ("S1", "B1", "M1") and _macro_painterly_wave(x, y) > 0.15:
                c.set_px("painterly_edges", x, y, soft_under[tok])

    # Surgical accidental-orphan cleanup (protects ONLY deliberate specular glints & LEDs!)
    comp2 = c.composite_indices()
    protected = {TOKEN_TO_IDX[t] for t in ("M5", "V5", "O6")}
    for y in range(H):
        for x in range(W):
            v = int(comp2[y, x])
            if v == 0 or v in protected:
                continue
            same4 = 0
            same8 = 0
            neigh: List[int] = []
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    if dx == 0 and dy == 0:
                        continue
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < W and 0 <= ny < H:
                        nv = int(comp2[ny, nx])
                        if nv == v:
                            same8 += 1
                            if abs(dx) + abs(dy) == 1:
                                same4 += 1
                        elif nv != 0 and abs(dx) + abs(dy) == 1:
                            neigh.append(nv)
            # Absorb 4-isolated pixels unless they form an intentional diagonal curve (V4 waveform/dish)
            if same4 == 0 and neigh:
                if IDX_TO_TOKEN[v] == "V4" and same8 >= 1:
                    continue
                c.set_px("polish", x, y, IDX_TO_TOKEN[max(set(neigh), key=neigh.count)])

    return c


def build_side_by_side_comparison(v1_path: Path, v2_path: Path, out_path: Path) -> None:
    """
    Generate crisp nearest-neighbor v1 vs. v2 side-by-side comparison sheet:
      - Row 1: 4x on sunlit reference olive grass (#667A4D)
      - Row 2: 4x on deep shaded forest (#24362A)
      - Row 3: 2x Grayscale | 1x Silhouette | 1x Native (128x128) on grass & forest
    """
    v1 = Image.open(v1_path).convert("RGBA")
    v2 = Image.open(v2_path).convert("RGBA")
    zoom = 4
    S = 128 * zoom  # 512
    pad = 16
    hdr = 28

    def render_on(im: Image.Image, bg: Tuple[int, int, int], scale: int) -> Image.Image:
        base = Image.new("RGBA", im.size, bg + (255,))
        base.alpha_composite(im)
        return base.resize((im.width * scale, im.height * scale), Image.Resampling.NEAREST)

    def render_gray(im: Image.Image, scale: int) -> Image.Image:
        base = Image.new("RGBA", im.size, (124, 124, 124, 255))
        base.alpha_composite(im)
        return base.convert("L").convert("RGBA").resize(
            (im.width * scale, im.height * scale), Image.Resampling.NEAREST
        )

    def render_sil(im: Image.Image, scale: int) -> Image.Image:
        arr = np.array(im)
        out = np.zeros_like(arr)
        out[:, :] = [194, 198, 168, 255]
        out[arr[:, :, 3] > 0] = [27, 20, 32, 255]
        return Image.fromarray(out, "RGBA").resize(
            (im.width * scale, im.height * scale), Image.Resampling.NEAREST
        )

    col_w = S
    total_w = pad * 3 + col_w * 2
    row3_h = 256
    total_h = pad * 5 + hdr * 3 + S * 2 + row3_h
    sheet = Image.new("RGBA", (total_w, total_h), (24, 24, 28, 255))
    draw = ImageDraw.Draw(sheet)

    y = pad
    draw.text((pad, y + 6), "ORIGINAL v1 (4x Nearest - Sunlit Reference Grass #667A4D)", fill=(232, 232, 224, 255))
    draw.text((pad * 2 + col_w, y + 6), "REFINED v2 (4x Nearest - Sunlit Reference Grass #667A4D)", fill=(239, 193, 124, 255))
    y += hdr
    sheet.paste(render_on(v1, (102, 122, 77), zoom), (pad, y))
    sheet.paste(render_on(v2, (102, 122, 77), zoom), (pad * 2 + col_w, y))
    y += S + pad

    draw.text((pad, y + 6), "ORIGINAL v1 (4x Nearest - Deep Shaded Forest #24362A)", fill=(232, 232, 224, 255))
    draw.text((pad * 2 + col_w, y + 6), "REFINED v2 (4x Nearest - Deep Shaded Forest #24362A)", fill=(239, 193, 124, 255))
    y += hdr
    sheet.paste(render_on(v1, (36, 54, 42), zoom), (pad, y))
    sheet.paste(render_on(v2, (36, 54, 42), zoom), (pad * 2 + col_w, y))
    y += S + pad

    draw.text((pad, y + 6), "ORIGINAL v1 - Grayscale (2x) | Silhouette (1x) | Native 1x (128x128)", fill=(232, 232, 224, 255))
    draw.text((pad * 2 + col_w, y + 6), "REFINED v2 - Grayscale (2x) | Silhouette (1x) | Native 1x (128x128)", fill=(239, 193, 124, 255))
    y += hdr
    for idx, im in enumerate((v1, v2)):
        bx = pad if idx == 0 else pad * 2 + col_w
        sheet.paste(render_gray(im, 2), (bx, y))
        sheet.paste(render_sil(im, 1), (bx + 264, y))
        sheet.paste(render_on(im, (102, 122, 77), 1), (bx + 264, y + 128))
        sheet.paste(render_on(im, (36, 54, 42), 1), (bx + 392, y + 128))
        draw.text((bx + 398, y + 12), "1x Native\n(128x128)\nGrass/Forest", fill=(195, 200, 190, 255))

    sheet.save(out_path, format="PNG")


def main() -> None:
    canvas = build_mara_lin_128_v2()
    canvas.save_png(V2_PNG)
    canvas.save_source_json(
        V2_SRC,
        metadata={
            "asset_name": "Dr. Mara Lin - Hero Character Concept Benchmark v2 (Refined 128x128)",
            "version": "v2_final",
            "parent_version": "game/assets/characters/player/mara_lin_concept_128x128.png",
            "target_canvas": "128x128 transparent RGBA",
            "ast_001_note": "Refined concept benchmark; preserves v1 untouched and does NOT overwrite AST-001 (96x384).",
        },
    )
    rep1 = audit_sprite_png(V1_PNG)
    rep2 = audit_sprite_png(V2_PNG)
    print("=== v1 vs v2 (Round 2) Automated QC Comparison ===")
    for k in (
        "dimensions",
        "opaque_pixels",
        "fill_ratio_pct",
        "bbox",
        "bbox_size",
        "unique_colors",
        "off_palette_colors",
        "non_binary_alpha_pixels",
        "orphan_1px_count",
        "pure_black_or_white",
    ):
        print(f"  {k:26s}: v1={rep1[k]}  -->  v2={rep2[k]}")

    comp_path = Path("docs/art-direction/mara_lin_v1_vs_v2_comparison.png")
    build_side_by_side_comparison(V1_PNG, V2_PNG, comp_path)
    print(f"Saved side-by-side comparison -> {comp_path}")


if __name__ == "__main__":
    main()
