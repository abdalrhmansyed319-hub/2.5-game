/**
 * VERDANT SIGNAL V7.0 — IMMERSIVE WORLD PERSPECTIVE PIXEL-ART ENGINE
 * ==================================================================
 * Builds 100% crisp, native-resolution (480x270 viewport, 640x360 world maps)
 * handcrafted 56-color pixel-art biome grounds, zero-fringe alpha-extracted
 * monumental structures (trunks, roots, reeds, cliffs, foreground canopies),
 * and native 28x40 4-direction playable Dr. Mara Lin sprites.
 *
 * CRITICAL PIXEL-CRAFT RULE:
 *   Chroma-key alpha extraction & magenta de-spill happen AT FULL SOURCE
 *   RESOLUTION *before* alpha-aware pixel downsampling, guaranteeing ZERO
 *   pink/gray halos and razor-sharp 1x pixel-art silhouettes!
 */

import { execFileSync } from 'node:child_process';
import { createEmptyBuffer, getPixel, setPixel } from '../engine/pixelBuffer';
import { V4Canvas, blitV4, hash2v4 } from '../v4_masterpiece/v4Core';
import {
  type RGB,
  blendRgbPx,
  digitizeToCraftedPixelArt,
  hexToRgb,
  loadUnderpaintToGrid,
} from '../v5_soul/v5PixelEngine';

// ============================================================================
// CURATED 56-COLOR BIOME PALETTES (STRICT HUE-SHIFTED VALUE SEPARATION)
// ============================================================================

export const V7_FOREST_PALETTE: string[] = [
  // Sky Sliver, Distant Peaks & Morning God-Rays
  '#f8fff2', '#d4fcf5', '#8ae6e6', '#46c6d4', '#3d98b0', '#548096', '#7294a6',
  '#fff5b8', '#f2da6d', '#d9b54e',
  // Sunlit Chartreuse Clearing -> Deep Forest Emerald Foliage & Shadows
  '#d2e84f', '#9ed138', '#68ad32', '#3d8532', '#23632e', '#14472a', '#0c3024', '#081e1b',
  // Sky-Reflecting Rainwater Puddles
  '#c9f4ff', '#7ed4f5', '#3ea6de', '#2370a6', '#16456e',
  // Colossal Singing Reedwood Furrowed Bark & Sprawling Roots (Warm Cinnamon -> Deep Umber)
  '#d48d4e', '#b36b38', '#8f4d28', '#6b361e', '#4a2318', '#2e1514', '#1a0c10',
  // Winding Root-Lined Forest Trail Earth & Stones
  '#c99f57', '#a67b3f', '#7d5a32', '#59422b', '#7b8c87', '#526361', '#314042',
  // Bioluminescent Cyan Acoustic Slits, Hanging Lichen & Violet Shelf-Fungi
  '#e0ffff', '#8cf7f0', '#38d9d4', '#1ba1a8',
  '#f7d4ff', '#d494eb', '#a360c7', '#6c388c', '#401f59',
  // Golden Sun-Drop Orchids
  '#fff09e', '#ffc947', '#e08d22',
  // Dr. Mara Lin Harmonized Hero Accents
  '#ff8a42', '#d45224', '#8f2918', '#42141a', '#e8f0f5', '#8ba2b5', '#c93438',
];

export const V7_SWAMP_PALETTE: string[] = [
  // Misty Golden-Teal Morning Fog & Distant Mangrove Silhouettes
  '#ebe6be', '#ccd4ad', '#a6bda6', '#7fa197', '#5d8280', '#416366', '#2b474d', '#1c3038',
  // Deep Murky Swamp Water Channels & Sky Glints
  '#94c4bd', '#5e9691', '#386e6e', '#214d52', '#14363d', '#0c242b', '#07161c',
  // Translucent Amber-Mud Shallows & Submerged Roots
  '#c28b42', '#9e6b2e', '#7a4e21', '#593718', '#3d2412', '#26160e',
  // Slick Wet Mud Banks, Pebbles & Rotting Deadwood
  '#968d7a', '#756e5f', '#575248', '#3d3a34', '#262524', '#16171a',
  // Mossy Root Arches, Towering Swamp Reeds & Broad Paddle Leaves
  '#a8c443', '#7ea336', '#56802d', '#376128', '#224724', '#153320', '#0c2119',
  // Submerged Olive-Brown Roots & Lily Pads
  '#8c9e4c', '#637538', '#44542a', '#2c381f',
  // Bioluminescent Cyan Spore Lilies, Hanging Swamp Lichen & Bog Mushrooms
  '#ebffff', '#9efcf4', '#4cebe6', '#1fc2c7', '#138a96', '#0d5a69',
  // Warm Terracotta Bark Accents & Bog Decay
  '#8c5734', '#633c24', '#422618', '#2b1812',
  // Dr. Mara Lin Hero Accents
  '#ff8c42', '#d95422', '#942818', '#45151a', '#e6eff5', '#8ca4b8', '#4b5f73', '#cf3438',
];

export const V7_COAST_PALETTE: string[] = [
  // Golden Morning Sunrise Sky & Distant Sea-Stacks
  '#fffbe0', '#ffeaad', '#ffd285', '#f5b070', '#de9c78', '#b8948e', '#9299a6', '#b8d7db',
  // Deep Sapphire-Indigo Swells -> Luminous Turquoise Shallows
  '#0d3152', '#14476b', '#1c6387', '#2683a1', '#33a3b5', '#4ec4c4', '#7ce0d4', '#b5f2e6',
  // Organic Lacy Sea Foam & Wet Sky Reflections
  '#f5fcf7', '#d8f5eb', '#a9ded9', '#79b8c2',
  // Sunlit Warm Amber Sand -> Wet Mirror Sand -> Deep Cool Cast Shadow
  '#ffe094', '#f2be6b', '#d9994a', '#b87537', '#94562c', '#6e3d24', '#4a291e',
  // Submerged Golden Kelp & Wet Basalt Tidepool Pebbles
  '#c79a2c', '#996f1e', '#694a18', '#334d54', '#22363d', '#142229',
  // Monumental Stratified Coastal Cliff Walls (Warm Sunlit Ochre / Cool Indigo Shadow)
  '#f7b665', '#e08c48', '#bd6433', '#914326', '#662b1f', '#3d191a',
  '#5e6b7d', '#434f61', '#2d3747', '#1c2330', '#111621',
  // Wind-Swept Coastal Alien Scrub & Glowing Turquoise Crystal-Moss
  '#a6bf7a', '#789658', '#4f6e40', '#314a30', '#1e3024',
  '#9efcf5', '#3bd6d4', '#1a969e',
  // Dr. Mara Lin Hero Accents
  '#ff8a42', '#d45224', '#e8f0f5', '#cf3438',
];

// ============================================================================
// ZERO-FRINGE CHROMA-KEY EXTRACTION + ALPHA-AWARE PIXEL-ART DOWNSAMPLING
// ============================================================================

/**
 * Extracts a crisp, transparent handcrafted pixel-art prop from a high-res
 * solid-magenta (#FF00FF) source plate:
 *   1. Reads full-res source RGBA via ImageMagick.
 *   2. Removes magenta background + de-spills 1px border fringe AT FULL RES.
 *   3. Auto-crops tight bounding box (preserving top bleed if `keepTopEdge`).
 *   4. Downsamples onto exact native pixel size using OPAQUE-ONLY area averaging
 *      (ZERO magenta bleeding into edges!).
 *   5. Quantizes opaque pixels strictly onto the 56-color biome palette +
 *      2-pass orphan-pixel cleanup!
 */
export function extractCraftedPropFromMagenta(
  filePath: string,
  targetW: number,
  targetH: number,
  paletteHex: string[],
  opts: {
    flipX?: boolean;
    keepTopEdge?: boolean;
    darkContourHex?: string;
    ditherStrength?: number;
  } = {}
): { pixels: Uint8ClampedArray; width: number; height: number } {
  // Query source dimensions
  const dimStr = execFileSync('identify', ['-format', '%w %h', filePath], { encoding: 'utf8' }).trim();
  const [sw, sh] = dimStr.split(' ').map(Number);
  const rawBuf = execFileSync('convert', [filePath, '-depth', '8', 'rgba:-'], {
    maxBuffer: sw * sh * 4 + 65536,
  });
  const src = new Uint8ClampedArray(rawBuf);

  // Pass 1: Full-res magenta chroma-key removal!
  const mask = new Uint8Array(sw * sh);
  for (let i = 0; i < sw * sh; i++) {
    const r = src[i * 4];
    const g = src[i * 4 + 1];
    const b = src[i * 4 + 2];
    const magentaExcess = Math.min(r, b) - g;
    // Pure & near-pure magenta chroma key (plus pink anti-aliased fringe)
    const isKey =
      (magentaExcess > 42 && r > 125 && b > 125) ||
      (magentaExcess > 75 && r > 95 && b > 95);
    mask[i] = isKey ? 0 : 1;
  }

  // Pass 2: Full-res 1px fringe erosion + de-spill on opaque pixels adjacent to magenta!
  const maskClean = new Uint8Array(mask);
  for (let y = 1; y < sh - 1; y++) {
    for (let x = 1; x < sw - 1; x++) {
      const idx = y * sw + x;
      if (!mask[idx]) continue;
      const touchesBg =
        !mask[idx - 1] || !mask[idx + 1] || !mask[idx - sw] || !mask[idx + sw];
      if (touchesBg) {
        const r = src[idx * 4];
        const g = src[idx * 4 + 1];
        const b = src[idx * 4 + 2];
        const mEx = Math.min(r, b) - g;
        if (mEx > 18) {
          // Drop pink semi-blended fringe pixel cleanly
          maskClean[idx] = 0;
        } else {
          // De-spill any tiny residual magenta tint into clean dark edge
          src[idx * 4] = Math.min(r, Math.max(g + 16, Math.round(r * 0.72)));
          src[idx * 4 + 2] = Math.min(b, Math.max(g + 16, Math.round(b * 0.72)));
        }
      }
    }
  }

  // Pass 3: Tight opaque bounding box (keep top=0 when prop intentionally bleeds off top edge!)
  let minX = sw, maxX = 0, minY = sh, maxY = 0;
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      if (maskClean[y * sw + x]) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (opts.keepTopEdge) minY = 0;
  const cropW = Math.max(1, maxX - minX + 1);
  const cropH = Math.max(1, maxY - minY + 1);

  // Pass 4: Alpha-aware area downsampling (averages ONLY opaque source pixels -> ZERO magenta bleed!)
  const down = createEmptyBuffer(targetW, targetH);
  const scaleX = cropW / targetW;
  const scaleY = cropH / targetH;
  for (let dy = 0; dy < targetH; dy++) {
    const sy0 = minY + Math.floor(dy * scaleY);
    const sy1 = Math.min(sh, minY + Math.max(sy0 - minY + 1, Math.ceil((dy + 1) * scaleY)));
    for (let dx = 0; dx < targetW; dx++) {
      const rx = opts.flipX ? targetW - 1 - dx : dx;
      const sx0 = minX + Math.floor(rx * scaleX);
      const sx1 = Math.min(sw, minX + Math.max(sx0 - minX + 1, Math.ceil((rx + 1) * scaleX)));
      let total = 0, opaque = 0, sr = 0, sg = 0, sb = 0;
      for (let sy = sy0; sy < sy1; sy++) {
        for (let sx = sx0; sx < sx1; sx++) {
          total++;
          const si = sy * sw + sx;
          if (maskClean[si]) {
            opaque++;
            sr += src[si * 4];
            sg += src[si * 4 + 1];
            sb += src[si * 4 + 2];
          }
        }
      }
      // Majority coverage rule gives crisp handcrafted binary alpha silhouette!
      if (total > 0 && opaque / total >= 0.46) {
        const di = (dy * targetW + dx) * 4;
        down[di] = Math.round(sr / opaque);
        down[di + 1] = Math.round(sg / opaque);
        down[di + 2] = Math.round(sb / opaque);
        down[di + 3] = 255;
      }
    }
  }

  // Pass 5: OKLab pixel-cluster quantization strictly on opaque pixels!
  const quant = digitizeToCraftedPixelArt(down, targetW, targetH, paletteHex, {
    ditherThreshold: 0.042,
    ditherStrength: opts.ditherStrength ?? 0.018,
    cleanPasses: 2,
  });

  // Restore exact binary alpha & optionally crisp-seal 1px shadowed silhouette edges
  const darkCol = opts.darkContourHex ? hexToRgb(opts.darkContourHex) : null;
  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const i = (y * targetW + x) * 4;
      if (down[i + 3] < 128) {
        quant.pixels[i] = 0;
        quant.pixels[i + 1] = 0;
        quant.pixels[i + 2] = 0;
        quant.pixels[i + 3] = 0;
      } else {
        quant.pixels[i + 3] = 255;
        // Remove any lingering single stray isolated opaque pixel (1px dust)
        let nOpaque = 0;
        if (x > 0 && down[i - 4 + 3] >= 128) nOpaque++;
        if (x < targetW - 1 && down[i + 4 + 3] >= 128) nOpaque++;
        if (y > 0 && down[i - targetW * 4 + 3] >= 128) nOpaque++;
        if (y < targetH - 1 && down[i + targetW * 4 + 3] >= 128) nOpaque++;
        if (nOpaque <= 1) {
          quant.pixels[i + 3] = 0;
        } else if (darkCol && nOpaque <= 2 && y > 2) {
          // Clean crisp dark contour pixel on silhouette tips
          const lum = quant.pixels[i] * 0.299 + quant.pixels[i + 1] * 0.587 + quant.pixels[i + 2] * 0.114;
          if (lum < 85) {
            quant.pixels[i] = darkCol.r;
            quant.pixels[i + 1] = darkCol.g;
            quant.pixels[i + 2] = darkCol.b;
          }
        }
      }
    }
  }

  return { pixels: quant.pixels, width: targetW, height: targetH };
}

/** Digitize an oblique playable biome ground + horizon plate onto exact 640x360 56-color pixel art */
export function buildBiomeGround(
  filePath: string,
  w: number,
  h: number,
  paletteHex: string[]
): Uint8ClampedArray {
  const raw = loadUnderpaintToGrid(filePath, w, h, 2);
  const dig = digitizeToCraftedPixelArt(raw, w, h, paletteHex, {
    ditherThreshold: 0.044,
    ditherStrength: 0.022,
    cleanPasses: 2,
  });
  return dig.pixels;
}

/**
 * Hand-sculpt a genuinely distinct second colossal Singing Reedwood trunk variant
 * from Variant A (horizontally flipped, subtle warm-bark crevice moss following real
 * bark shading rather than synthetic ovals, extra upper cyan acoustic slit, and
 * glowing golden Sun-Drop Orchids nestled naturally in the root hollow).
 */
export function buildReedwoodVariantB(
  filePath: string,
  w: number,
  h: number,
  paletteHex: string[]
): { pixels: Uint8ClampedArray; width: number; height: number } {
  const base = extractCraftedPropFromMagenta(filePath, w, h, paletteHex, {
    flipX: true,
    keepTopEdge: true,
    darkContourHex: '#1a0c10',
  });
  const px = base.pixels;
  const mossHi = hexToRgb('#9ed138');
  const mossMid = hexToRgb('#68ad32');
  const mossSh = hexToRgb('#23632e');
  const orchHi = hexToRgb('#fff09e');
  const orchMid = hexToRgb('#ffc947');
  const orchSh = hexToRgb('#e08d22');
  const cyanHi = hexToRgb('#e0ffff');
  const cyanMid = hexToRgb('#8cf7f0');
  const cyanDk = hexToRgb('#1ba1a8');

  // Subtle organic moss clinging ONLY inside sunlit upper bark grooves on left shoulder (follows natural bark relief!)
  for (let y = Math.round(h * 0.22); y < Math.round(h * 0.72); y++) {
    for (let x = Math.round(w * 0.25); x < Math.round(w * 0.44); x++) {
      const p = getPixel(px, w, h, x, y);
      if (p.a < 128) continue;
      // Only grow moss on mid-bright warm bark planes near the left contour (never flat ovals!)
      const leftDist = (x - w * 0.25) / (w * 0.19);
      const n = hash2v4(x >> 1, y >> 1, 419);
      const ridge = Math.sin(y * 0.14 + x * 0.22) * 0.5 + 0.5;
      if (p.r > 125 && p.r > p.b + 35 && leftDist < 0.62 && n * 0.55 + ridge * 0.45 > 0.68) {
        const col = p.r > 180 ? mossHi : p.r > 150 ? mossMid : mossSh;
        setPixel(px, w, h, x, y, { ...col, a: 255 });
      }
    }
  }

  // Extra subtle glowing cyan acoustic wind-slit higher up the fluted column!
  const sx = Math.round(w * 0.49), sy = Math.round(h * 0.19);
  for (let dy = -15; dy <= 15; dy++) {
    const hw = Math.max(0, Math.round((1 - Math.abs(dy) / 15) * 2.8));
    for (let dx = -hw; dx <= hw; dx++) {
      const x = sx + dx, y = sy + dy;
      if (getPixel(px, w, h, x, y).a < 128) continue;
      const col = Math.abs(dx) === 0 && Math.abs(dy) < 9 ? cyanHi : Math.abs(dx) <= 1 ? cyanMid : cyanDk;
      setPixel(px, w, h, x, y, { ...col, a: 255 });
    }
  }

  // Delicate glowing golden Sun-Drop Orchids nestled in the shadowed root hollow!
  const orchids: Array<[number, number]> = [
    [Math.round(w * 0.38), Math.round(h * 0.80)],
    [Math.round(w * 0.43), Math.round(h * 0.83)],
    [Math.round(w * 0.59), Math.round(h * 0.79)],
  ];
  for (const [ox, oy] of orchids) {
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const d = Math.hypot(dx, dy);
        if (d < 3.2 && getPixel(px, w, h, ox + dx, oy + dy).a >= 128) {
          blendRgbPx(px, w, h, ox + dx, oy + dy, orchMid, Math.round((1 - d / 3.2) * 125));
        }
      }
    }
    setPixel(px, w, h, ox, oy, { ...orchHi, a: 255 });
    setPixel(px, w, h, ox - 1, oy, { ...orchMid, a: 255 });
    setPixel(px, w, h, ox + 1, oy, { ...orchMid, a: 255 });
    setPixel(px, w, h, ox, oy - 1, { ...orchMid, a: 255 });
    setPixel(px, w, h, ox, oy + 1, { ...orchSh, a: 255 });
  }

  return { pixels: px, width: w, height: h };
}

/**
 * Ground a bottom-cropped stratified coastal cliff monolith organically into amber sand
 * by carving a natural stepped rocky base skirt (ZERO flat horizontal cut edge!).
 */
export function groundBottomCroppedCliff(
  img: { pixels: Uint8ClampedArray; width: number; height: number }
): { pixels: Uint8ClampedArray; width: number; height: number } {
  const { pixels: px, width: w, height: h } = img;
  const darkRock = hexToRgb('#1c2330');
  const warmShadow = hexToRgb('#662b1f');
  for (let x = 0; x < w; x++) {
    // Organic jagged geological base curve along bottom 20px (higher on left/right edges, stepped rock ledges!)
    const u = x / Math.max(1, w - 1);
    const edgeLift = Math.pow(Math.abs(u - 0.52) * 2.0, 2.2) * 14;
    const stepNoise =
      Math.sin(x * 0.13) * 4.5 +
      Math.cos(x * 0.31 + 1.2) * 2.5 +
      (hash2v4(x >> 2, 7, 521) - 0.5) * 4.0;
    const cutY = Math.min(h - 1, Math.round(h - 4 - edgeLift + stepNoise));
    for (let y = cutY; y < h; y++) {
      const i = (y * w + x) * 4;
      px[i] = 0; px[i + 1] = 0; px[i + 2] = 0; px[i + 3] = 0;
    }
    // Crisp dark grounded rock base rim right above cutY
    for (let dy = 1; dy <= 2; dy++) {
      const ry = cutY - dy;
      if (ry >= 0 && ry < h && getPixel(px, w, h, x, ry).a >= 128) {
        const col = x < w * 0.55 ? warmShadow : darkRock;
        setPixel(px, w, h, x, ry, { ...col, a: 255 });
      }
    }
  }
  return img;
}

// ============================================================================
// NATIVE 28x40 4-DIRECTION PLAYABLE DR. MARA LIN (ZERO FRACTIONAL SCALING!)
// ============================================================================
// Sized specifically for V7.0 monumental world scale (~34px standing height =
// 12.6% of 270px viewport height — crisp face/visor/backpack/scarf at 1x while
// making 80–110px-wide, 270px+-tall colossal trees feel genuinely enormous!).

export type MaraDirV7 = 'down' | 'up' | 'right' | 'left';

export interface MaraV7SpriteSet {
  frameW: number;
  frameH: number;
  frames: Record<MaraDirV7, Uint8ClampedArray[]>; // 4 frames per direction (0=idle/contact, 1=stepA, 2=pass, 3=stepB)
  sheetPixels: Uint8ClampedArray; // 4 cols x 4 rows (112 x 160)
  sheetW: number;
  sheetH: number;
}

const M7_COL: Record<string, RGB> = {
  // Terracotta exploration suit ramp
  S0: { r: 42, g: 16, b: 22 },
  S1: { r: 108, g: 34, b: 24 },
  S2: { r: 168, g: 64, b: 30 },
  S3: { r: 224, g: 104, b: 44 },
  S4: { r: 255, g: 166, b: 84 },
  S5: { r: 255, g: 222, b: 148 },
  // Panoramic sunrise-reflecting curved glass visor
  V0: { r: 14, g: 46, b: 68 },
  V1: { r: 28, g: 112, b: 132 },
  V2: { r: 74, g: 204, b: 212 },
  V3: { r: 178, g: 248, b: 242 },
  V4: { r: 255, g: 238, b: 184 },
  // Flowing expedition crimson scarf
  C0: { r: 72, g: 18, b: 30 },
  C1: { r: 148, g: 34, b: 44 },
  C2: { r: 214, g: 62, b: 58 },
  C3: { r: 248, g: 132, b: 84 },
  // Brushed titanium backpack & helmet dorsal stripe
  M0: { r: 44, g: 56, b: 74 },
  M1: { r: 102, g: 122, b: 142 },
  M2: { r: 178, g: 198, b: 214 },
  M3: { r: 238, g: 246, b: 252 },
  // Dark navy harness, knee-pads, boots & red O2 valve
  N0: { r: 22, g: 28, b: 44 },
  N1: { r: 48, g: 60, b: 84 },
  B0: { r: 36, g: 20, b: 18 },
  B1: { r: 92, g: 50, b: 34 },
  B2: { r: 148, g: 86, b: 54 },
  R0: { r: 228, g: 56, b: 60 },
  // Subtle warm human face/eye glow inside visor
  E0: { r: 188, g: 132, b: 104 },
  E1: { r: 244, g: 196, b: 158 },
};

function drawPx(buf: Uint8ClampedArray, w: number, h: number, x: number, y: number, tok: string): void {
  const c = M7_COL[tok];
  if (!c) return;
  setPixel(buf, w, h, Math.round(x), Math.round(y), { ...c, a: 255 });
}

function drawFillRect(
  buf: Uint8ClampedArray, w: number, h: number,
  x0: number, y0: number, rw: number, rh: number, tok: string
): void {
  for (let y = Math.round(y0); y < Math.round(y0 + rh); y++) {
    for (let x = Math.round(x0); x < Math.round(x0 + rw); x++) {
      drawPx(buf, w, h, x, y, tok);
    }
  }
}

function drawEll(
  buf: Uint8ClampedArray, w: number, h: number,
  cx: number, cy: number, rx: number, ry: number, tok: string
): void {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const d = ((x - cx) * (x - cx)) / (rx * rx) + ((y - cy) * (y - cy)) / (ry * ry);
      if (d <= 1.0) drawPx(buf, w, h, x, y, tok);
    }
  }
}

/** Add crisp luminance-keyed 1px silhouette outline around Mara so she ALWAYS pops against dark/bright terrain! */
function addMaraCrispOutline(buf: Uint8ClampedArray, w: number, h: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(buf);
  const dark = M7_COL.S0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      if (getPixel(buf, w, h, x, y).a > 128) continue;
      const touches =
        getPixel(buf, w, h, x - 1, y).a > 128 ||
        getPixel(buf, w, h, x + 1, y).a > 128 ||
        getPixel(buf, w, h, x, y - 1).a > 128 ||
        getPixel(buf, w, h, x, y + 1).a > 128;
      if (touches) {
        setPixel(out, w, h, x, y, { ...dark, a: 255 });
      }
    }
  }
  return out;
}

function drawLinePx(
  buf: Uint8ClampedArray, w: number, h: number,
  x0: number, y0: number, x1: number, y1: number, tok: string
): void {
  const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    drawPx(buf, w, h, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, tok);
  }
}

function buildMaraV7Frame(dir: MaraDirV7, stepIdx: number): Uint8ClampedArray {
  const W = 28, H = 40;
  const buf = createEmptyBuffer(W, H);
  // Subtle organic walk stride offsets (0=neutral/idle, 1=left stride, 2=pass rise, 3=right stride)
  const bob = stepIdx === 2 ? -1 : stepIdx === 0 ? 0 : 1;
  const stride = stepIdx === 1 ? 1 : stepIdx === 3 ? -1 : 0;
  const scarfWave = stepIdx === 1 ? -1 : stepIdx === 3 ? 1 : 0;
  const cx = 14;
  const baseY = 36;

  if (dir === 'up') {
    // ICONIC BACK / INTO-THE-WORLD 3/4-UP VIEW (athletic stance facing forward into monumental biomes!)
    const lFootY = baseY - (stride > 0 ? 2 : 0);
    const rFootY = baseY - (stride < 0 ? 2 : 0);
    // Tapered athletic legs with dark navy knee pads & angled explorer boots!
    // Left leg (sunlit outer edge!)
    drawLinePx(buf, W, H, cx - 3, 25 + bob, cx - 4, lFootY - 2, 'S3');
    drawLinePx(buf, W, H, cx - 2, 25 + bob, cx - 3, lFootY - 2, 'S2');
    drawLinePx(buf, W, H, cx - 1, 25 + bob, cx - 2, lFootY - 2, 'S1');
    drawFillRect(buf, W, H, cx - 4, 30 + bob, 2, 2, 'N1'); // knee pad
    drawFillRect(buf, W, H, cx - 5, lFootY - 2, 3, 2, 'B1');
    drawPx(buf, W, H, cx - 5, lFootY - 2, 'B2');
    drawFillRect(buf, W, H, cx - 5, lFootY, 3, 1, 'B0');
    // Right leg (shaded right side)
    drawLinePx(buf, W, H, cx + 1, 25 + bob, cx + 2, rFootY - 2, 'S2');
    drawLinePx(buf, W, H, cx + 2, 25 + bob, cx + 3, rFootY - 2, 'S1');
    drawLinePx(buf, W, H, cx + 3, 25 + bob, cx + 4, rFootY - 2, 'S1');
    drawFillRect(buf, W, H, cx + 2, 30 + bob, 2, 2, 'N0');
    drawFillRect(buf, W, H, cx + 2, rFootY - 2, 3, 2, 'B0');
    drawPx(buf, W, H, cx + 2, rFootY - 2, 'B1');
    drawFillRect(buf, W, H, cx + 2, rFootY, 3, 1, 'B0');

    // Rounded shoulders & angled natural swinging arms!
    drawLinePx(buf, W, H, cx - 5, 18 + bob, cx - 7, 23 + bob - stride, 'S3');
    drawLinePx(buf, W, H, cx - 4, 18 + bob, cx - 6, 23 + bob - stride, 'S4');
    drawFillRect(buf, W, H, cx - 7, 24 + bob - stride, 2, 2, 'N1');
    drawLinePx(buf, W, H, cx + 5, 18 + bob, cx + 7, 23 + bob + stride, 'S2');
    drawLinePx(buf, W, H, cx + 4, 18 + bob, cx + 6, 23 + bob + stride, 'S1');
    drawFillRect(buf, W, H, cx + 6, 24 + bob + stride, 2, 2, 'N0');

    // Tapered athletic torso & utility hip belt!
    drawEll(buf, W, H, cx, 20 + bob, 5.2, 4.4, 'S2');
    drawEll(buf, W, H, cx - 1.5, 19 + bob, 3.2, 3.2, 'S3');
    drawFillRect(buf, W, H, cx - 4, 24 + bob, 8, 2, 'N0');
    drawPx(buf, W, H, cx - 2, 24 + bob, 'M2');
    drawPx(buf, W, H, cx + 2, 24 + bob, 'B2');

    // Whip antenna curving gracefully off left side of titanium pack
    for (let ay = 2 + bob; ay <= 16 + bob; ay++) {
      const sway = ay < 6 ? scarfWave : 0;
      drawPx(buf, W, H, cx - 5 + sway, ay, ay < 5 ? 'M3' : 'M2');
    }
    drawPx(buf, W, H, cx - 5 + scarfWave, 2 + bob, 'R0');

    // Sculpted brushed titanium life-support pack (chamfered corners, vent grill, red O2 valve!)
    drawFillRect(buf, W, H, cx - 4, 17 + bob, 8, 7, 'M2');
    drawFillRect(buf, W, H, cx - 4, 17 + bob, 3, 6, 'M3');
    drawFillRect(buf, W, H, cx + 2, 18 + bob, 2, 6, 'M1');
    drawFillRect(buf, W, H, cx - 3, 21 + bob, 5, 2, 'M0');
    drawPx(buf, W, H, cx - 3, 18 + bob, 'R0'); // red valve
    drawPx(buf, W, H, cx + 1, 19 + bob, 'V2'); // cyan telemetry LED

    // Flowing curved crimson expedition scarf wrapped around collar & trailing gracefully left!
    drawEll(buf, W, H, cx, 16 + bob, 5.0, 1.8, 'C1');
    drawLinePx(buf, W, H, cx - 4, 15 + bob, cx + 2, 15 + bob, 'C2');
    drawLinePx(buf, W, H, cx - 4, 16 + bob, cx - 9, 18 + bob + scarfWave, 'C2');
    drawLinePx(buf, W, H, cx - 5, 15 + bob, cx - 10, 17 + bob + scarfWave, 'C3');
    drawPx(buf, W, H, cx - 11, 18 + bob + scarfWave, 'C1');

    // Sculpted burnt-terracotta exploration helmet dome + white dorsal stripe + comm pods!
    drawEll(buf, W, H, cx, 10 + bob, 5.4, 5.0, 'S2');
    drawEll(buf, W, H, cx - 1, 9 + bob, 4.1, 3.8, 'S3');
    drawEll(buf, W, H, cx - 2, 8 + bob, 2.4, 2.1, 'S4');
    drawPx(buf, W, H, cx - 2, 7 + bob, 'S5');
    drawFillRect(buf, W, H, cx - 1, 5 + bob, 2, 7, 'M3');
    drawPx(buf, W, H, cx, 12 + bob, 'M2');
    drawFillRect(buf, W, H, cx - 6, 9 + bob, 2, 3, 'M2');
    drawFillRect(buf, W, H, cx + 5, 9 + bob, 2, 3, 'M1');
  } else if (dir === 'down') {
    const lFootY = baseY - (stride > 0 ? 2 : 0);
    const rFootY = baseY - (stride < 0 ? 2 : 0);
    // Tapered legs & explorer boots
    drawLinePx(buf, W, H, cx - 3, 25 + bob, cx - 4, lFootY - 2, 'S3');
    drawLinePx(buf, W, H, cx - 2, 25 + bob, cx - 3, lFootY - 2, 'S2');
    drawFillRect(buf, W, H, cx - 4, 30 + bob, 2, 2, 'N1');
    drawFillRect(buf, W, H, cx - 5, lFootY - 2, 3, 2, 'B1');
    drawPx(buf, W, H, cx - 4, lFootY - 2, 'B2');
    drawFillRect(buf, W, H, cx - 5, lFootY, 3, 1, 'B0');

    drawLinePx(buf, W, H, cx + 2, 25 + bob, cx + 3, rFootY - 2, 'S2');
    drawLinePx(buf, W, H, cx + 3, 25 + bob, cx + 4, rFootY - 2, 'S1');
    drawFillRect(buf, W, H, cx + 2, 30 + bob, 2, 2, 'N0');
    drawFillRect(buf, W, H, cx + 2, rFootY - 2, 3, 2, 'B0');
    drawFillRect(buf, W, H, cx + 2, rFootY, 3, 1, 'B0');

    // Whip antenna behind left shoulder
    for (let ay = 2 + bob; ay <= 14 + bob; ay++) drawPx(buf, W, H, cx - 6, ay, 'M2');
    drawPx(buf, W, H, cx - 6, 2 + bob, 'R0');

    // Natural curved arms
    drawLinePx(buf, W, H, cx - 5, 18 + bob, cx - 7, 23 + bob + stride, 'S4');
    drawLinePx(buf, W, H, cx - 4, 18 + bob, cx - 6, 23 + bob + stride, 'S3');
    drawFillRect(buf, W, H, cx - 7, 24 + bob + stride, 2, 2, 'N1');
    drawLinePx(buf, W, H, cx + 5, 18 + bob, cx + 7, 23 + bob - stride, 'S2');
    drawLinePx(buf, W, H, cx + 4, 18 + bob, cx + 6, 23 + bob - stride, 'S1');
    drawFillRect(buf, W, H, cx + 6, 24 + bob - stride, 2, 2, 'N0');

    // Tapered torso, chest telemetry display & utility belt
    drawEll(buf, W, H, cx, 20 + bob, 5.2, 4.4, 'S3');
    drawEll(buf, W, H, cx + 2, 21 + bob, 2.6, 3.2, 'S2');
    drawFillRect(buf, W, H, cx - 3, 19 + bob, 6, 4, 'N0');
    drawPx(buf, W, H, cx - 2, 21 + bob, 'V2');
    drawPx(buf, W, H, cx - 1, 20 + bob, 'V3');
    drawPx(buf, W, H, cx, 21 + bob, 'V2');
    drawPx(buf, W, H, cx + 1, 20 + bob, 'V2');
    drawFillRect(buf, W, H, cx - 4, 24 + bob, 8, 2, 'N0');
    drawPx(buf, W, H, cx - 1, 24 + bob, 'M3');

    // Curved crimson scarf around collar + flowing tail!
    drawEll(buf, W, H, cx, 16 + bob, 5.0, 1.8, 'C2');
    drawLinePx(buf, W, H, cx - 4, 15 + bob, cx + 2, 15 + bob, 'C3');
    drawLinePx(buf, W, H, cx - 4, 16 + bob, cx - 9, 18 + bob + scarfWave, 'C2');
    drawLinePx(buf, W, H, cx - 5, 15 + bob, cx - 10, 17 + bob + scarfWave, 'C3');

    // Sculpted helmet & sunrise-reflecting curved glass visor!
    drawEll(buf, W, H, cx, 10 + bob, 5.4, 5.0, 'S3');
    drawEll(buf, W, H, cx - 1.5, 8 + bob, 3.3, 2.5, 'S4');
    drawFillRect(buf, W, H, cx - 1, 5 + bob, 2, 2, 'M3');
    drawEll(buf, W, H, cx, 11 + bob, 4.3, 3.2, 'V0');
    drawFillRect(buf, W, H, cx - 3, 9 + bob, 7, 2, 'V2');
    drawFillRect(buf, W, H, cx - 3, 11 + bob, 7, 2, 'E1');
    drawPx(buf, W, H, cx - 2, 11 + bob, 'N0');
    drawPx(buf, W, H, cx + 1, 11 + bob, 'N0');
    drawFillRect(buf, W, H, cx - 3, 13 + bob, 6, 1, 'V1');
    drawFillRect(buf, W, H, cx - 3, 9 + bob, 3, 1, 'V4');
    drawPx(buf, W, H, cx - 3, 10 + bob, 'V3');
  } else {
    // EXPRESSIVE SIDE PROFILE (RIGHT or non-mirrored LEFT — organic forward lean & flowing scarf!)
    const f = dir === 'right' ? 1 : -1;
    const fKneeX = cx - f * (stride * 2);
    const fFootX = cx - f * (stride * 3 + 1);
    const nKneeX = cx + f * (stride * 2);
    const nFootX = cx + f * (stride * 3 + 1);

    // Far leg (bent naturally at knee!)
    drawLinePx(buf, W, H, cx, 25 + bob, fKneeX, 30 + bob, 'S1');
    drawLinePx(buf, W, H, fKneeX, 30 + bob, fFootX, 34 + bob, 'S1');
    drawLinePx(buf, W, H, cx - f, 25 + bob, fKneeX - f, 30 + bob, 'S2');
    drawFillRect(buf, W, H, fFootX - 1, 34 + bob, 4, 2, 'B0');

    // Near leg (bent naturally at knee with navy knee-pad & sunlit boot!)
    drawLinePx(buf, W, H, cx + f, 25 + bob, nKneeX + f, 30 + bob, 'S3');
    drawLinePx(buf, W, H, cx, 25 + bob, nKneeX, 30 + bob, 'S2');
    drawLinePx(buf, W, H, nKneeX + f, 30 + bob, nFootX + f, 34 + bob, 'S3');
    drawLinePx(buf, W, H, nKneeX, 30 + bob, nFootX, 34 + bob, 'S2');
    drawFillRect(buf, W, H, nKneeX, 29 + bob, 2, 2, 'N1');
    drawFillRect(buf, W, H, nFootX - 1, 34 + bob, 4, 2, 'B1');
    drawPx(buf, W, H, nFootX + (f > 0 ? 2 : -1), 34 + bob, 'B2');
    drawFillRect(buf, W, H, nFootX - 1, 36 + bob, 4, 1, 'B0');

    // Brushed titanium backpack + whip antenna tilted slightly with posture!
    const bx = cx - f * 5;
    for (let ay = 2 + bob; ay <= 16 + bob; ay++) {
      const tilt = Math.round(((16 - ay) / 14) * -f);
      drawPx(buf, W, H, bx - f + tilt, ay, ay < 6 ? 'M3' : 'M2');
    }
    drawPx(buf, W, H, bx - f * 2, 2 + bob, 'R0');
    drawFillRect(buf, W, H, bx - 2, 17 + bob, 5, 8, 'M2');
    drawFillRect(buf, W, H, bx - (f > 0 ? 2 : 0), 17 + bob, 2, 7, 'M3');
    drawPx(buf, W, H, bx - f, 20 + bob, 'R0');

    // Tapered athletic torso with slight explorer lean
    drawEll(buf, W, H, cx + f * 0.5, 20 + bob, 3.8, 4.5, 'S3');
    drawEll(buf, W, H, cx - f * 1.2, 21 + bob, 2.2, 3.6, 'S2');
    drawFillRect(buf, W, H, cx - 3, 24 + bob, 7, 2, 'N0');
    drawPx(buf, W, H, cx + f, 24 + bob, 'M2');

    // Flowing curved crimson expedition scarf streaming organically behind her!
    drawEll(buf, W, H, cx, 16 + bob, 3.8, 1.8, 'C2');
    drawLinePx(buf, W, H, cx - f * 2, 15 + bob, cx - f * 8, 16 + bob + scarfWave, 'C2');
    drawLinePx(buf, W, H, cx - f * 3, 16 + bob, cx - f * 11, 18 + bob + scarfWave, 'C3');
    drawLinePx(buf, W, H, cx - f * 7, 17 + bob + scarfWave, cx - f * 12, 19 + bob + scarfWave, 'C1');

    // Expressive angled swinging near arm
    const handX = cx - f * (stride * 2);
    drawLinePx(buf, W, H, cx, 18 + bob, handX, 23 + bob, 'S4');
    drawLinePx(buf, W, H, cx - f, 18 + bob, handX - f, 23 + bob, 'S3');
    drawFillRect(buf, W, H, handX - 1, 24 + bob, 2, 2, 'N1');

    // Sculpted helmet & forward-facing curved sunrise glass visor!
    drawEll(buf, W, H, cx + f, 10 + bob, 5.4, 5.0, 'S3');
    drawEll(buf, W, H, cx, 8 + bob, 3.4, 2.6, 'S4');
    drawPx(buf, W, H, cx - f, 7 + bob, 'S5');
    drawFillRect(buf, W, H, cx - f, 5 + bob, 2, 2, 'M3');
    const vx = cx + f * 3;
    drawEll(buf, W, H, vx, 10 + bob, 3.2, 3.1, 'V0');
    drawFillRect(buf, W, H, vx - 2, 8 + bob, 4, 2, 'V2');
    drawFillRect(buf, W, H, vx - 1, 10 + bob, 3, 2, 'E1');
    drawPx(buf, W, H, vx + f, 10 + bob, 'N0');
    drawFillRect(buf, W, H, vx - 1, 8 + bob, 2, 1, 'V4');
    drawPx(buf, W, H, vx, 9 + bob, 'V3');
    drawFillRect(buf, W, H, cx - f * 2, 9 + bob, 2, 3, 'M2');
  }

  return addMaraCrispOutline(buf, W, H);
}

export function buildPlayableMaraV7Sheet(): MaraV7SpriteSet {
  const frameW = 28, frameH = 40;
  const dirs: MaraDirV7[] = ['down', 'up', 'right', 'left'];
  const frames: Record<MaraDirV7, Uint8ClampedArray[]> = {
    down: [], up: [], right: [], left: [],
  };
  const sheetW = frameW * 4;
  const sheetH = frameH * 4;
  const sheetPixels = createEmptyBuffer(sheetW, sheetH);

  dirs.forEach((d, row) => {
    for (let col = 0; col < 4; col++) {
      const f = buildMaraV7Frame(d, col);
      frames[d].push(f);
      blitV4(sheetPixels, sheetW, sheetH, f, frameW, frameH, col * frameW, row * frameH);
    }
  });

  return { frameW, frameH, frames, sheetPixels, sheetW, sheetH };
}
