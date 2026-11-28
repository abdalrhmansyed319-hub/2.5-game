/**
 * VERDANT SIGNAL V4.0 — AMBER COAST & LIVING OCEAN MASTERPIECE + NATIVE TERRAIN STUDY
 * ====================================================================================
 * Pass-2 Masterpiece Overhaul:
 *   - True painterly multi-depth ocean (deep sapphire -> marine blue -> rich turquoise ->
 *     crystalline translucent aqua shallows) with natural broken horizontal wind-chop,
 *     organic wave ripples, and a warm golden sun-glint sparkle column (ZERO zebra bands!)
 *   - Crystal-clear sunlit shallows revealing submerged golden sandbars, dark smooth stones,
 *     swaying kelp shadows, tiny shells, and subtle broken mint caustic glints (ZERO spiderweb!)
 *   - Naturally broken curling surf crests & delicate lacy receding foam ribbons
 *   - Glossy mirror-wet sand reflecting coastal turquoise sky + wind-rippled golden dunes,
 *     driftwood, pebbles & tiny bleached shells
 *   - Jagged wet basalt coastal rock headland with natural broken ocean splash (seaward only!)
 *     cradling a crystal-clear tidepool full of submerged pebbles & crimson-gold anemones
 *   - Dramatic 3/4-perspective stepped sandstone headland cliffs with overhanging moss lips,
 *     warm sedimentary strata, vertical fissures, fallen base boulders & cast shadows!
 */

import { V4Canvas, hash2v4, smoothNoiseV4 } from './v4Core';

const CLIFF_RAMP = ['K0', 'K1', 'K2', 'K3', 'K4', 'K5'];

/** Paint organic Amber Tide-Kelp fronds swaying in surf or coastal breeze */
export function paintV4TideKelp(
  c: V4Canvas,
  layer: string,
  bx: number,
  by: number,
  scale = 1.0,
  phase = 0
): void {
  const sway = Math.sin(phase * Math.PI * 2) * 2.2 * scale;
  const fronds: Array<[number, number, number]> = [
    [-6 * scale + sway * 0.6, -15 * scale, 0.72],
    [sway, -24 * scale, 1.0],
    [6 * scale + sway * 0.7, -14 * scale, 0.75],
  ];
  // Grounded wet dark root shadow
  c.fillEllipse(layer, bx, by + 1, 4.5 * scale, 1.8 * scale, 'D0');
  for (const [dx, dy, thick] of fronds) {
    c.paintTaperedSpline(
      layer,
      [
        [bx, by, 2.0 * scale * thick],
        [bx + dx * 0.48, by + dy * 0.56, 1.5 * scale * thick],
        [bx + dx, by + dy, 0.75 * scale * thick],
      ],
      'F2'
    );
    // Sunlit top-left edge highlight + luminous amber air-bladders
    c.line(layer, bx - 1, by - 1, bx + dx - 1, by + dy, 'F3');
    c.fillEllipse(layer, bx + dx, by + dy, 1.7 * scale * thick, 1.5 * scale * thick, 'F4');
    c.fillEllipse(layer, bx + dx * 0.58 - 1, by + dy * 0.62, 1.3 * scale * thick, 1.2 * scale * thick, 'F3');
  }
}

/** Paint crystalline turquoise Mirror Glasswort succulent cluster */
export function paintV4Glasswort(c: V4Canvas, layer: string, bx: number, by: number, scale = 1.0): void {
  c.fillEllipse(layer, bx, by + 1, 5.5 * scale, 2.0 * scale, 'D0');
  const spikes: Array<[number, number, number]> = [
    [-5.5 * scale, -11 * scale, 2.1 * scale],
    [-1.5 * scale, -17 * scale, 2.5 * scale],
    [2.8 * scale, -15 * scale, 2.3 * scale],
    [6.0 * scale, -10 * scale, 1.9 * scale],
  ];
  for (const [dx, dy, w] of spikes) {
    const x = bx + dx;
    c.fillPoly(layer, [[x - w, by], [x + w, by], [x + w * 0.35, by + dy], [x - w * 0.35, by + dy]], 'L0');
    c.fillPoly(layer, [[x - w * 0.65, by - 1], [x + w * 0.15, by - 1], [x, by + dy], [x - w * 0.35, by + dy + 2]], 'L2');
    c.line(layer, x - w * 0.45, by - 2, x - 0.5, by + dy + 1, 'L3');
    c.px(layer, x, by + dy, 'W9');
  }
}

/** Paint a natural weathered coastal boulder with strict elliptical mask (zero rectangle bleed!) */
function paintCoastalRock(
  c: V4Canvas,
  layer: string,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  mossTop = false,
  inWater = false
): void {
  if (inWater) {
    // Deep water shadow + delicate broken whitewater ripple around seaward rim
    c.fillEllipse(layer, cx + 1.5, cy + 2.5, rx + 2.5, ry + 1.8, 'W1');
    for (let a = 0; a < Math.PI * 2; a += 0.24) {
      const fx = cx + Math.cos(a) * (rx + 2.4);
      const fy = cy + Math.sin(a) * (ry + 1.7);
      if (Math.cos(a) < 0.25 && hash2v4(Math.round(fx), Math.round(fy), 71) > 0.25) {
        c.px(layer, fx, fy, Math.cos(a) < -0.3 ? 'W9' : 'W7');
      }
    }
  } else {
    c.fillEllipse(layer, cx + 2.5, cy + 2.5, rx * 1.05, ry * 0.85, 'D0');
  }
  c.fillEllipse(layer, cx, cy, rx, ry, 'K2');
  c.shadeMaskedRegion(layer, cx, cy, rx, ry, CLIFF_RAMP, {
    material: 'cloth',
    bias: 0.08,
    clipEllipse: true,
    foldFn: (_x, y) => Math.sin((y - cy) * 0.85) * 0.12, // stratified rock bands
  });
  // Crisp quartz top-left highlight fleck
  c.line(layer, cx - rx * 0.55, cy - ry * 0.45, cx + rx * 0.15, cy - ry * 0.55, 'K5', 255, layer);
  if (mossTop) {
    c.fillEllipse(layer, cx - rx * 0.1, cy - ry * 0.42, rx * 0.68, ry * 0.40, 'G5');
    c.fillEllipse(layer, cx - rx * 0.22, cy - ry * 0.50, rx * 0.42, ry * 0.22, 'G7');
  }
}

// ============================================================================
// DELIVERABLE 6 — SIGNATURE 640x360 AMBER COAST & LIVING OCEAN MASTERPIECE
// ============================================================================
export function buildAmberCoastMasterpiece(phase = 0): {
  canvas: V4Canvas;
  vpfJson: string;
  width: number;
  height: number;
} {
  const W = 640;
  const H = 360;
  const c = new V4Canvas(W, H, [
    { id: 'l01_ocean_sand_base', name: '01 Multi-Depth Living Ocean, Seabed & Sunlit Beach' },
    { id: 'l02_surf_and_sheen', name: '02 Curling Foam Lace, Sun-Glint & Mirror Wet Sand' },
    { id: 'l03_cliffs_tidepool', name: '03 Stepped 3/4 Sandstone Cliffs & Basalt Tidepool' },
    { id: 'l04_coastal_life', name: '04 Tide-Kelp, Glasswort, Driftwood, Rocks & Seabirds' },
  ]);

  const phRad = phase * Math.PI * 2;
  const tideAdvance = Math.sin(phRad) * 6.5;

  // Curve helper: organic curving golden cove shoreline x(y)
  const getShoreX = (y: number): number => {
    const ny = y / H;
    const coveBay = Math.sin(ny * Math.PI * 1.12 - 0.15) * 94;
    const headlandPinch = Math.sin(ny * Math.PI * 3.1 + 0.5) * 16;
    const organic = (smoothNoiseV4(1.3, y * 0.014, 32, 32, 113) - 0.5) * 26;
    return 250 + coveBay + headlandPinch + organic;
  };

  // Curve helper: upper-eastern 3/4 sandstone headland rim y-profile / x-profile!
  // Creates a dramatic sweeping coastal cliff edge framing the north & east beach!
  const getCliffRimX = (y: number): number => {
    const ny = y / H;
    // Sweeps in generously across upper beach & opens cleanly on the lower-right cove!
    const sweep = 368 + Math.sin(ny * Math.PI * 1.25 - 0.35) * 86 + Math.sin(ny * Math.PI * 3.6) * 20;
    const crag = (smoothNoiseV4(2.1, y * 0.022, 32, 32, 277) - 0.5) * 24;
    return sweep + crag;
  };

  // -------------------------------------------------------------------------
  // PASS 1: LIVING MULTI-DEPTH OCEAN + VISIBLE SEABED + GOLDEN BEACH + CLIFF TOP
  // -------------------------------------------------------------------------
  for (let y = 0; y < H; y++) {
    const shoreBase = getShoreX(y);
    const waveSurge = Math.sin(y * 0.036 - phRad) * 5.0 + tideAdvance;
    const wetEdge = shoreBase + waveSurge;

    for (let x = 0; x < W; x++) {
      const nMacro = smoothNoiseV4(x * 0.009, y * 0.009, 64, 64, 17);
      const nMid = smoothNoiseV4(x * 0.028, y * 0.028, 96, 96, 83);
      const nFine = smoothNoiseV4(x * 0.095, y * 0.095, 128, 128, 197);

      // Elongated horizontal painterly ocean chop! (Breaks up any vertical banding completely!)
      const chopA = smoothNoiseV4((x + phase * 18) * 0.024, y * 0.095, 96, 96, 307);
      const chopB = smoothNoiseV4((x - phase * 12) * 0.055, y * 0.145, 128, 128, 619);

      const distSea = wetEdge - x; // > 0 in ocean, < 0 on beach

      if (distSea > 0) {
        // =====================================================================
        // BREATHTAKING PAINTERLY LIVING OCEAN (Zero zebra bands, zero spiderweb!)
        // =====================================================================
        const effDepth = distSea + (nMacro - 0.5) * 34 + (chopA - 0.5) * 22;

        // 1. Rich Atmospheric Multi-Depth Water Gradient (Sapphire -> Marine -> Turquoise -> Aqua -> Crystal Mint)
        let tok: string;
        if (effDepth > 255) tok = chopA > 0.62 ? 'W1' : 'W0';
        else if (effDepth > 188) tok = chopA > 0.66 ? 'W2' : chopA < 0.34 ? 'W0' : 'W1';
        else if (effDepth > 122) tok = chopA > 0.65 ? 'W3' : chopA < 0.32 ? 'W1' : 'W2';
        else if (effDepth > 64) tok = chopA > 0.64 ? 'W4' : chopA < 0.30 ? 'W2' : 'W3';
        else if (effDepth > 28) tok = chopA > 0.62 ? 'W5' : chopA < 0.28 ? 'W3' : 'W4';
        else tok = chopA > 0.58 ? 'W6' : 'W5';

        // 2. Painterly Horizontal Wave-Trough Shadows & Shimmering Wind-Crest Glints!
        // Creates unmistakable handcrafted studio-grade pixel-art ocean texture!
        const rippleWave = Math.sin(x * 0.055 + y * 0.018 + nMid * 4.5 - phRad);
        if (effDepth > 48) {
          if (chopB > 0.74 && rippleWave > 0.22) {
            tok = effDepth > 195 ? 'W2' : effDepth > 120 ? 'W3' : effDepth > 75 ? 'W4' : 'W5';
          } else if (chopB < 0.24 && rippleWave < -0.30) {
            tok = effDepth > 190 ? 'W0' : effDepth > 110 ? 'W1' : 'W2';
          }
        }

        // 3. Diagonal Golden Morning Sun-Glint Sparkle Path dancing across offshore swells!
        const sunPathDist = Math.abs((x - 108) + (y - 120) * 0.28);
        if (sunPathDist < 68 && effDepth > 55) {
          const sunProb = (1 - sunPathDist / 68) * chopB;
          if (sunProb > 0.72 && nFine > 0.56) {
            c.px('l02_surf_and_sheen', x, y, sunProb > 0.80 ? 'W9' : 'W8', 225);
          } else if (sunProb > 0.64 && nFine > 0.62) {
            c.px('l02_surf_and_sheen', x, y, 'W7', 165);
          }
        }

        // 4. TRANSPARENT CRYSTAL SHALLOWS REVEALING SUBMERGED GOLDEN SANDBARS, PEBBLES, KELP & DELICATE CAUSTICS!
        if (distSea < 52) {
          const shallowT = 1 - distSea / 52; // 1 right at shore, 0 at 52px out
          // Submerged warm golden seabed sandbar glowing softly through crystal-clear shallows!
          if (shallowT > 0.58 && nMid > 0.42) {
            tok = shallowT > 0.78 ? 'W6' : 'W5';
            if (shallowT > 0.80 && nMid > 0.54) {
              // Warm amber seabed showing right beneath 3 inches of clear water!
              c.px('l01_ocean_sand_base', x, y, 'D3');
              c.blendPx('l02_surf_and_sheen', x, y, 'W6', 120);
              continue;
            }
          }
          // Subtle dark sunken seabed pebbles & swaying dark-teal kelp shadows visible underwater!
          if (shallowT > 0.18 && shallowT < 0.82 && nFine > 0.76 && nMid < 0.42) {
            tok = 'WS';
          }
          // Delicate broken organic caustic glints (soft curved light shimmer — NEVER a solid spiderweb!)
          const caustArc = Math.sin(x * 0.22 + nMid * 6.2 + phRad) * Math.sin(y * 0.20 + nMid * 5.5 - phRad);
          if (caustArc > 0.70 && nFine > 0.42 && distSea > 6) {
            c.blendPx('l02_surf_and_sheen', x, y, caustArc > 0.83 ? 'W8' : 'W7', Math.round(shallowT * 155 + 45));
          }
        }

        // 5. TWO NATURAL BREAKING OCEAN SWELLS & BROKEN LACY RECEDING SEA-FOAM!
        // Primary shoreline surf lip (breaks naturally into organic frothy pockets & lacy trails!)
        const foamBreakNoise = smoothNoiseV4(x * 0.08, (y + phase * 10) * 0.08, 128, 128, 709);
        const foamLace = smoothNoiseV4(x * 0.16, y * 0.16, 128, 128, 829);

        if (distSea < 4.5 + (foamBreakNoise - 0.5) * 4.5) {
          // Crisp curling ivory shoreline foam lip with scattered natural holes!
          if (foamLace > 0.26 || distSea < 1.8) {
            c.px('l02_surf_and_sheen', x, y, distSea < 2.2 ? 'W9' : 'W8');
          }
        } else if (distSea < 17) {
          // Delicate receding foam lace trails & frothy sea-spray specks floating behind the lip!
          const laceProb = (1 - (distSea - 4) / 13) * foamBreakNoise;
          if (laceProb > 0.52 && foamLace > 0.50) {
            c.px('l02_surf_and_sheen', x, y, laceProb > 0.68 ? 'W8' : 'W7', 210);
          }
        }

        // Secondary curling offshore breaker crest (~38-58 px offshore, organically tapering into natural coastal segments!)
        const breakerDist = 42 + Math.sin(y * 0.025 + 0.8) * 14 + (nMid - 0.5) * 12 + Math.sin(phRad) * 4;
        const bDelta = distSea - breakerDist;
        const breakerStrength = smoothNoiseV4(1.9, y * 0.022, 32, 32, 503);
        const taper = Math.max(0, Math.min(1, (breakerStrength - 0.30) / 0.24));
        if (taper > 0.05) {
          const halfCrest = 2.6 * taper;
          const troughW = 4.8 * taper;
          if (bDelta > -halfCrest && bDelta < halfCrest) {
            const crest = Math.abs(bDelta) < 1.3 * taper && foamLace > 0.28;
            if (crest || foamBreakNoise > 0.48 - taper * 0.12) {
              c.px('l02_surf_and_sheen', x, y, crest ? 'W9' : 'W8');
            }
          } else if (bDelta >= halfCrest && bDelta < halfCrest + 6.0 * taper && foamLace > 0.52) {
            c.px('l02_surf_and_sheen', x, y, 'W7', Math.round(175 * taper));
          } else if (bDelta >= -halfCrest - troughW && bDelta <= -halfCrest && chopA < 0.78) {
            tok = 'W2';
          }
        }

        // Subtle third distant offshore whitecap glint (~115-150px out)
        const outerDist = 128 + Math.sin(y * 0.019 + 2.2) * 18 + Math.cos(phRad) * 5;
        if (Math.abs(distSea - outerDist) < 2.2 && breakerStrength > 0.52 && chopB > 0.55) {
          c.px('l02_surf_and_sheen', x, y, 'W7', 190);
        }

        c.px('l01_ocean_sand_base', x, y, tok);
      } else {
        // =====================================================================
        // GLOSSY MIRROR-WET SAND + WIND-RIPPLED SUNLIT GOLDEN BEACH!
        // =====================================================================
        const beachDist = -distSea;
        const windRipple = Math.sin(x * 0.14 + y * 0.08 + nMid * 4.0);

        let tok: string;
        if (beachDist < 12 + (nMid - 0.5) * 6) {
          // Dark glossy wet sand right beneath receding foam
          tok = beachDist < 4.5 ? 'D0' : 'D1';
          // Shimmering turquoise sky reflection mirror-sheen across flat wet beach!
          if (beachDist > 2 && beachDist < 10 && chopB > 0.56 && windRipple > 0.15) {
            c.blendPx('l02_surf_and_sheen', x, y, 'W6', 98);
          }
        } else if (beachDist < 28 + (nMid - 0.5) * 10) {
          // Damp transitioning amber tide-line
          tok = windRipple > 0.35 ? 'D3' : 'D2';
          // Occasional tiny glistening shell or wet pebble along the wrack line!
          if (hash2v4(x, y, 701) > 0.992) tok = 'W9';
          else if (hash2v4(x, y, 709) > 0.989) tok = 'K1';
        } else {
          // Warm sunlit golden coastal sand with organic wind-blown dune highlights (ZERO flat contour rings!)
          const dune = nMacro * 0.55 + nMid * 0.35 + windRipple * 0.12;
          if (dune > 0.64) tok = nFine > 0.62 ? 'D5' : 'D4';
          else if (dune > 0.44) tok = nFine > 0.65 ? 'D4' : 'D3';
          else tok = nFine > 0.68 ? 'D3' : 'D2';
          // Micro quartz sand sparkle & tiny weathered pebbles
          if (hash2v4(x, y, 739) > 0.994) tok = 'D5';
          else if (hash2v4(x, y, 743) > 0.993) tok = 'D1';
        }
        c.px('l01_ocean_sand_base', x, y, tok);
      }
    }
  }

  // -------------------------------------------------------------------------
  // PASS 2: DRAMATIC 3/4-VIEW STEPPED SANDSTONE HEADLAND CLIFFS & GRASSY PLATEAU!
  // ONE continuous sweeping organic headland rim — zero rectangular seams!
  // -------------------------------------------------------------------------
  for (let y = 0; y < H; y++) {
    const eastRimX = getCliffRimX(y);
    for (let x = Math.max(0, Math.floor(eastRimX)); x < W; x++) {
      const nMacro = smoothNoiseV4(x * 0.011, y * 0.011, 64, 64, 521);
      const nMid = smoothNoiseV4(x * 0.032, y * 0.032, 96, 96, 613);
      const nFine = smoothNoiseV4(x * 0.09, y * 0.09, 128, 128, 761);
      const distEdge = x - eastRimX;
      const sun = nMacro * 0.60 + nMid * 0.40;
      let tok: string;
      if (distEdge < 3.5) {
        tok = nFine > 0.44 ? 'G7' : 'G6'; // sunlit overhanging grassy cliff-lip!
      } else if (distEdge < 7.0) {
        tok = nFine > 0.50 ? 'G6' : 'G5';
      } else {
        if (sun > 0.65) tok = nFine > 0.56 ? 'G6' : 'G5';
        else if (sun > 0.44) tok = nFine > 0.56 ? 'G5' : 'G4';
        else if (sun > 0.28) tok = nFine > 0.54 ? 'G3' : 'G2';
        else tok = 'G1';
      }
      c.px('l03_cliffs_tidepool', x, y, tok);
    }
  }

  // Sculpt the tall 3/4-perspective VERTICAL SANDSTONE CLIFF FACE directly below the overhanging grass rim!
  for (let y = 0; y < H; y++) {
    const eastRimX = getCliffRimX(y);
    const faceThick = 24 + Math.sin(y * 0.045) * 5;
    for (let x = Math.floor(eastRimX - faceThick - 8); x <= Math.ceil(eastRimX + 2); x++) {
      if (x < 0 || x >= W) continue;
      if (c.has('l03_cliffs_tidepool', x, y)) continue; // already plateau grass above!

      // Check how far directly left/below the overhanging grassy edge this cliff pixel sits!
      const dx = eastRimX - x;
      const crack = smoothNoiseV4(x * 0.14, y * 0.03, 64, 64, 419);
      const strata = Math.sin(dx * 0.58 + smoothNoiseV4(x * 0.04, y * 0.04, 48, 48, 421) * 3.8);

      if (dx > 0 && dx <= faceThick) {
        let tok: string;
        if (dx < 3.0) {
          // Deep crisp undercut shadow directly under the overhanging grass turf!
          tok = 'K0';
        } else if (dx > faceThick - 2.5) {
          // Dark weathered base crevice where cliff meets golden sand
          tok = 'K0';
        } else if (crack > 0.78) {
          // Dramatic dark vertical geological erosion fissure!
          tok = 'K0';
        } else {
          // Sunlit stepped coastal sandstone strata: sunlit top-left ochre ledges + rust shadow undercuts!
          const lit = strata > 0.35 ? 1 : strata < -0.35 ? -1 : 0;
          const depthShade = dx / faceThick;
          if (lit > 0) tok = depthShade < 0.45 ? 'K5' : 'K4';
          else if (lit < 0) tok = depthShade > 0.55 ? 'K1' : 'K2';
          else tok = depthShade < 0.5 ? 'K3' : 'K2';
        }
        c.px('l03_cliffs_tidepool', x, y, tok);
      } else if (dx > faceThick && dx <= faceThick + 9) {
        // Soft natural ground cast-shadow falling onto the sunlit golden beach!
        c.blendPx('l02_surf_and_sheen', x, y, 'D0', Math.round((1 - (dx - faceThick) / 9) * 115));
      }
    }
  }

  // -------------------------------------------------------------------------
  // PASS 3: NATURAL JAGGED WET BASALT ROCK SHELF & CRYSTAL TIDEPOOL (BOTTOM-LEFT!)
  // ZERO cartoon white halo ring! Fractured multi-ledge wet coastal basalt with broken surf
  // ONLY on its ocean-facing west/north edge + clear miniature rocky tidepool!
  // -------------------------------------------------------------------------
  const tpx = 96;
  const tpy = 292;
  for (let y = 216; y < H; y++) {
    for (let x = 0; x < 214; x++) {
      const dx = (x - tpx) / 96;
      const dy = (y - tpy) / 56;
      const ang = Math.atan2(dy, dx);
      // Jagged authentic coastal rock-shelf outline!
      const jag =
        Math.sin(ang * 5 + 0.4) * 0.14 +
        Math.sin(ang * 9 - 1.1) * 0.08 +
        (smoothNoiseV4(x * 0.045, y * 0.045, 64, 64, 601) - 0.5) * 0.22;
      const r = Math.hypot(dx, dy) + jag;

      if (r < 0.96) {
        const poolR = Math.hypot((x - (tpx + 4)) / 42, (y - (tpy + 2)) / 22) + jag * 0.45;
        if (poolR < 0.86) {
          // CRYSTAL-CLEAR ROCKY TIDEPOOL revealing sunken pebbles, bright turquoise depths & delicate caustics!
          const pFine = smoothNoiseV4(x * 0.14, y * 0.14, 64, 64, 809);
          const caust = Math.sin(x * 0.26 + phRad) * Math.sin(y * 0.28 - phRad);
          let tok = poolR > 0.68 ? 'W3' : poolR > 0.36 ? 'W5' : 'W6';
          if (poolR > 0.76) tok = 'W1'; // recessed dark basalt pool undercut rim!
          if (caust > 0.66 && poolR < 0.72) tok = 'W8';
          if (pFine > 0.77 && poolR > 0.25 && poolR < 0.70) tok = 'WS'; // tiny submerged dark pebbles
          c.px('l03_cliffs_tidepool', x, y, tok);
        } else {
          // FRACTURED MULTI-LEDGE WET DARK BASALT COASTAL ROCK SHELVES!
          const ledge = Math.sin(y * 0.26 + smoothNoiseV4(x * 0.05, y * 0.05, 48, 48, 607) * 4.2);
          const nTop = -dx * 0.55 - dy * 0.65; // upper-left morning sun!
          let tok: string;
          if (r > 0.88) tok = 'K0'; // dark wet tidal rock base
          else if (ledge > 0.42 && nTop > -0.1) tok = nTop > 0.35 ? 'K4' : 'K3';
          else if (ledge < -0.35) tok = 'K0';
          else tok = nTop > 0.2 ? 'K2' : 'K1';
          c.px('l03_cliffs_tidepool', x, y, tok);
        }
      } else if (r < 1.07 && dx < 0.42) {
        // NATURAL BROKEN LACY SURF SPLASH strictly on the ocean-facing western/northern rock rim!
        const splash = smoothNoiseV4(x * 0.14, (y + phase * 10) * 0.14, 96, 96, 877);
        if (splash > 0.42) {
          c.px('l02_surf_and_sheen', x, y, splash > 0.64 ? 'W9' : 'W7', 220);
        }
      }
    }
  }
  // Tiny vibrant crimson-gold sea anemones & sunlit shells nestled inside the clear basalt tidepool!
  for (const [ax, ay, tok] of [[84, 290, 'S5'], [114, 296, 'F3'], [98, 282, 'S6'], [104, 302, 'W9']] as const) {
    c.px('l04_coastal_life', ax, ay, tok);
    c.px('l04_coastal_life', ax + 1, ay, tok === 'W9' ? 'D5' : 'F4');
  }

  // -------------------------------------------------------------------------
  // PASS 4: COASTAL SEA-STACKS, FALLEN CLIFF BOULDERS, DRIFTWOOD, FLORA & SEABIRDS!
  // -------------------------------------------------------------------------
  // Moss-crowned offshore sea-stacks breaking the swell cleanly!
  paintCoastalRock(c, 'l04_coastal_life', 196, 102, 22, 13, true, true);
  paintCoastalRock(c, 'l04_coastal_life', 224, 118, 12, 7.5, false, true);
  paintCoastalRock(c, 'l04_coastal_life', 268, 250, 11, 7, false, true);

  // Fallen coastal sandstone boulders nestled organically along the cliff base!
  paintCoastalRock(c, 'l04_coastal_life', 384, 96, 12, 7, true, false);
  paintCoastalRock(c, 'l04_coastal_life', 428, 242, 14, 8, false, false);
  paintCoastalRock(c, 'l04_coastal_life', 416, 252, 7, 4.5, false, false);

  // Sun-bleached coastal driftwood log half-buried in lower southern beach sand!
  c.paintTaperedSpline('l04_coastal_life', [[264, 330, 3.0], [292, 322, 2.5], [316, 316, 1.8]], 'T4');
  c.line('l04_coastal_life', 265, 329, 314, 315, 'T6');
  c.line('l04_coastal_life', 266, 333, 314, 319, 'D0'); // crisp beach shadow under log

  // Vibrant Rimlands coastal flora: Amber Tide-Kelp & Mirror Glasswort!
  paintV4TideKelp(c, 'l04_coastal_life', 56, 286, 1.15, phase);
  paintV4TideKelp(c, 'l04_coastal_life', 148, 288, 1.05, phase + 0.35);
  paintV4TideKelp(c, 'l04_coastal_life', 302, 278, 1.0, phase + 0.65);
  paintV4Glasswort(c, 'l04_coastal_life', 118, 326, 1.15);
  paintV4Glasswort(c, 'l04_coastal_life', 358, 152, 0.95);
  paintV4Glasswort(c, 'l04_coastal_life', 364, 266, 0.95);

  // Lush coastal meadow grass tufts & tiny golden wildflowers across the upper-right headland!
  for (let i = 0; i < 85; i++) {
    const gx = Math.round(415 + hash2v4(i, 13, 919) * 218);
    const gy = Math.round(10 + hash2v4(i, 29, 929) * 340);
    if (!c.has('l03_cliffs_tidepool', gx, gy)) continue;
    if (gx < getCliffRimX(gy) + 6) continue;
    const bright = hash2v4(i, 53, 937) > 0.45;
    c.px('l04_coastal_life', gx, gy + 1, 'G1');
    c.line('l04_coastal_life', gx, gy, gx - 2, gy - 3, bright ? 'G7' : 'G5');
    c.line('l04_coastal_life', gx + 1, gy, gx + 2, gy - 2, bright ? 'G6' : 'G4');
    if (i % 7 === 0) c.px('l04_coastal_life', gx - 1, gy - 3, i % 14 === 0 ? 'F4' : 'P3');
  }

  // Graceful white coastal seabirds soaring over the cove!
  for (const [bx, by] of [[162 + phase * 14, 58 - phase * 4], [186 + phase * 10, 74 - phase * 2], [134 + phase * 12, 82]]) {
    const flap = Math.round(Math.sin(phRad + bx * 0.1));
    c.line('l04_coastal_life', bx - 4, by + flap, bx, by, 'W9');
    c.line('l04_coastal_life', bx, by, bx + 4, by + flap, 'W9');
    c.px('l04_coastal_life', bx, by + 1, 'W6');
  }

  const vpfJson = c.serializeVpf({
    id: 'v4_amber_coast_living_ocean_640x360',
    name: 'V4.0 MASTERPIECE — Amber Coast & Living Ocean (640x360)',
    pivot: { x: 320, y: 180 },
    tileSize: 32,
    styleNotes: 'Pass-2 V4.0 Masterpiece: painterly wind-chopped multi-depth ocean, translucent sunlit seabed, broken curling foam lace, mirror-wet sand, 3/4 sandstone cliffs & fractured wet basalt tidepool.',
  });
  return { canvas: c, vpfJson, width: W, height: H };
}

// ============================================================================
// DELIVERABLE 7 — NATIVE 32x32 vs 48x48 GODOT TERRAIN SET MODULE COMPARISON
// ============================================================================
export function buildV4TerrainTileStudy(tilePx: 32 | 48): {
  canvas: V4Canvas;
  vpfJson: string;
  width: number;
  height: number;
} {
  const cols = 5;
  const rows = 3;
  const W = cols * tilePx;
  const H = rows * tilePx;
  const c = new V4Canvas(W, H, [
    { id: 'l01_terrain', name: `01 Native ${tilePx}x${tilePx} Seamless Biome Terrain` },
    { id: 'l02_surface_detail', name: `02 Native ${tilePx}x${tilePx} Surf, Cliffs, Moss Roots & Flora` },
  ]);

  const sc = tilePx / 32;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const nMacro = smoothNoiseV4(x * 0.032 / sc, y * 0.032 / sc, 48, 48, 101);
      const nFine = smoothNoiseV4(x * 0.11 / sc, y * 0.11 / sc, 96, 96, 211);
      const chop = smoothNoiseV4(x * 0.05 / sc, y * 0.15 / sc, 96, 96, 307);

      const waveOff = Math.sin((y / H) * Math.PI * 2.0) * 0.045;
      const shoreU = 0.27 + waveOff;
      const cliffEdgeU = 0.50 + Math.sin((y / H) * Math.PI * 2.0 + 0.9) * 0.028;
      const grassTopU = 0.62 + Math.sin((y / H) * Math.PI * 2.0 + 0.9) * 0.028;

      if (u < shoreU) {
        // Multi-depth living ocean -> sunlit transparent shallows -> broken curling foam!
        const d = (shoreU - u) / shoreU;
        let tok: string;
        if (d < 0.11) tok = nFine > 0.30 ? 'W9' : 'W8';
        else if (d < 0.25 && nFine > 0.60) tok = 'W8'; // receding lacy foam flecks!
        else if (d < 0.48) {
          const caust = Math.sin(x * 0.28 / sc + nMacro * 5) * Math.sin(y * 0.26 / sc);
          tok = caust > 0.65 ? 'W7' : nFine > 0.72 ? 'WS' : 'W5';
        } else if (d < 0.74) tok = chop > 0.62 ? 'W4' : 'W3';
        else tok = chop > 0.64 ? 'W3' : chop < 0.34 ? 'W1' : 'W2';
        c.px('l01_terrain', x, y, tok);
      } else if (u < cliffEdgeU) {
        // Reflective mirror wet sand -> warm wind-rippled sunlit golden beach!
        const sd = (u - shoreU) / (cliffEdgeU - shoreU);
        const ripple = Math.sin(x * 0.18 / sc + y * 0.08 / sc + nMacro * 3.5);
        let tok: string;
        if (sd < 0.20) {
          tok = sd < 0.08 ? 'D0' : 'D1';
          if (sd > 0.06 && chop > 0.60) c.blendPx('l02_surface_detail', x, y, 'W6', 95);
        } else if (sd < 0.44) tok = ripple > 0.25 ? 'D3' : 'D2';
        else if (sd < 0.88) tok = ripple > 0.3 ? 'D5' : 'D4';
        else tok = 'D1'; // cast cliff shadow onto sand!
        if (hash2v4(x, y, 71) > 0.988) tok = 'D5';
        c.px('l01_terrain', x, y, tok);
      } else if (u < grassTopU) {
        // Stepped weathered coastal sandstone cliff with horizontal sunlit strata & dark fissures!
        const cd = (u - cliffEdgeU) / (grassTopU - cliffEdgeU);
        const strata = Math.sin(cd * 16 + nMacro * 3.0);
        const crack = smoothNoiseV4(x * 0.16 / sc, y * 0.04 / sc, 48, 48, 419);
        let tok: string;
        if (cd < 0.11 || cd > 0.89 || crack > 0.80) tok = 'K0';
        else if (strata > 0.35) tok = cd > 0.5 ? 'K5' : 'K4';
        else if (strata < -0.35) tok = 'K1';
        else tok = 'K2';
        c.px('l01_terrain', x, y, tok);
      } else {
        // Lush sunlit Singing Canopy alien moss meadow with sunlit cliff-rim grass overhang!
        const gd = (u - grassTopU) / (1 - grassTopU);
        const sun = nMacro * 0.65 + nFine * 0.35;
        let tok: string;
        if (gd < 0.08) tok = 'G7'; // sunlit overhanging grass rim!
        else if (sun > 0.62) tok = 'G6';
        else if (sun > 0.44) tok = 'G5';
        else if (sun > 0.28) tok = 'G4';
        else tok = 'G2';
        c.px('l01_terrain', x, y, tok);
      }
    }
  }

  // Authentic ecological forest micro-detail on the moss plateau: gnarled mossy root-stump + curved roots + wildflowers!
  const rx = Math.round(W * 0.82);
  const ry = Math.round(H * 0.46);
  // Dark ground shadow under gnarled root mound
  c.fillEllipse('l02_surface_detail', rx + 2 * sc, ry + 5 * sc, 14 * sc, 6 * sc, 'G0');
  // Branching organic curved roots gripping the emerald moss!
  c.paintTaperedSpline('l02_surface_detail', [[rx - 2 * sc, ry, 3.8 * sc], [rx - 10 * sc, ry + 7 * sc, 2.2 * sc], [rx - 18 * sc, ry + 11 * sc, 0.9 * sc]], 'T3');
  c.paintTaperedSpline('l02_surface_detail', [[rx + 2 * sc, ry, 3.8 * sc], [rx + 10 * sc, ry + 6 * sc, 2.2 * sc], [rx + 17 * sc, ry + 10 * sc, 0.9 * sc]], 'T2');
  c.paintTaperedSpline('l02_surface_detail', [[rx, ry - 2 * sc, 4.4 * sc], [rx - 2 * sc, ry - 9 * sc, 3.6 * sc]], 'T3');
  c.fillEllipse('l02_surface_detail', rx - 2 * sc, ry - 9 * sc, 3.5 * sc, 2.0 * sc, 'T5'); // sunlit hollow reed stump rim!
  c.fillEllipse('l02_surface_detail', rx - 2 * sc, ry - 9 * sc, 2.0 * sc, 1.0 * sc, 'T0');
  // Velvety sunlit moss pad & miniature wild orchids!
  c.fillEllipse('l02_surface_detail', rx - 7 * sc, ry + 4 * sc, 4.5 * sc, 2.2 * sc, 'G6');
  paintCoastalRock(c, 'l02_surface_detail', W * 0.72, H * 0.74, 5.5 * sc, 3.6 * sc, true, false);

  for (let i = 0; i < 24; i++) {
    const gx = Math.round(W * 0.65 + hash2v4(i, 17, 733) * W * 0.32);
    const gy = Math.round(4 + hash2v4(i, 37, 739) * (H - 8));
    c.px('l02_surface_detail', gx, gy + 1, 'G1');
    c.line('l02_surface_detail', gx, gy, gx - 1.5 * sc, gy - 2.5 * sc, i % 2 === 0 ? 'G7' : 'G6');
    c.line('l02_surface_detail', gx + 1, gy, gx + 1.5 * sc, gy - 2 * sc, 'G5');
    if (i % 5 === 0) c.px('l02_surface_detail', gx - 1, gy - 2.5 * sc, i % 10 === 0 ? 'F4' : 'P3');
  }

  const vpfJson = c.serializeVpf({
    id: `v4_terrain_native_${tilePx}x${tilePx}`,
    name: `V4.0 TERRAIN STUDY — Native ${tilePx}x${tilePx} Godot Terrain Set`,
    pivot: { x: Math.round(W / 2), y: Math.round(H / 2) },
    tileSize: tilePx,
    styleNotes: `Pass-2 native ${tilePx}x${tilePx} Godot Terrain Set showcase: broken surf, visible seabed, mirror wet sand, 3/4 sandstone cliff strata & gnarled mossy root-stump.`,
  });
  return { canvas: c, vpfJson, width: W, height: H };
}
