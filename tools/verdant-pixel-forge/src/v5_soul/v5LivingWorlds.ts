/**
 * VERDANT SIGNAL V5.0 — THE OCEAN & THE LIVING WORLD (480x270 TRUE PIXEL ART + 12-FRAME ANIMATION)
 * =================================================================================================
 * Transforms master painterly underpaintings into strictly quantized, 56-color curated pixel art
 * (edge-preserving graphic planes, subtle sky-only 2x2 pixel dither, 2-pass orphan-pixel cleanup),
 * then authors genuine 12-frame handcrafted pixel-art animations directly on the native 480x270
 * pixel grid — complete with our V5.0 Soulful Dr. Mara Lin inhabiting both worlds!
 */

import { createEmptyBuffer, getPixel, setPixel } from '../engine/pixelBuffer';
import { blitV4, hash2v4 } from '../v4_masterpiece/v4Core';
import {
  AMBER_COAST_V5_PALETTE,
  SINGING_CANOPY_V5_PALETTE,
  blendRgbPx,
  digitizeToCraftedPixelArt,
  hexToRgb,
  loadUnderpaintToGrid,
  serializeBuffersToVpf,
  type RGB,
} from './v5PixelEngine';
import { buildMaraV5, type MaraV5Pose } from './v5MaraSoul';
import { MARA_V5_EMOTIONS_10F, MARA_V5_IDLE_6F } from './v5MaraAnimations';

/** Clean integer/crisp-pixel sprite scaler with optional horizontal flip (for exact world perspective placement!) */
function scaleAndFlipSprite(
  src: Uint8ClampedArray,
  sw: number,
  sh: number,
  dw: number,
  dh: number,
  flipX: boolean
): Uint8ClampedArray {
  const out = createEmptyBuffer(dw, dh);
  for (let y = 0; y < dh; y++) {
    const sy = Math.min(sh - 1, Math.floor((y * sh) / dh));
    for (let x = 0; x < dw; x++) {
      const sxRaw = Math.min(sw - 1, Math.floor((x * sw) / dw));
      const sx = flipX ? sw - 1 - sxRaw : sxRaw;
      const si = (sy * sw + sx) * 4;
      const di = (y * dw + x) * 4;
      out[di] = src[si];
      out[di + 1] = src[si + 1];
      out[di + 2] = src[si + 2];
      out[di + 3] = src[si + 3];
    }
  }
  return out;
}

/** Paint Mara's subtle ground cast shadow + wet mirror reflection cleanly beneath her feet */
function paintWorldMaraShadowAndReflection(
  fxLayer: Uint8ClampedArray,
  w: number,
  h: number,
  maraBuf: Uint8ClampedArray,
  mw: number,
  mh: number,
  px: number,
  py: number,
  shadowDirX: number,
  shadowRgb: RGB,
  wetReflection: boolean
): void {
  const footY = py + Math.round(mh * 0.91);
  // Long soft directional morning ground shadow cast across golden sand / mossy grass!
  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      const a = maraBuf[(y * mw + x) * 4 + 3];
      if (a < 180) continue;
      const distUp = mh * 0.91 - y;
      if (distUp < 0) continue;
      const sx = Math.round(px + x + distUp * shadowDirX);
      const sy = Math.round(footY + distUp * 0.14);
      blendRgbPx(fxLayer, w, h, sx, sy, shadowRgb, 92);
    }
  }
  // Optional glossy wet-sand inverted mirror reflection rippling gently beneath her boots!
  if (wetReflection) {
    for (let y = 0; y < Math.round(mh * 0.52); y++) {
      const sySrc = Math.round(mh * 0.90) - y;
      if (sySrc < 0 || sySrc >= mh) continue;
      const dy = footY + Math.round(y * 0.45);
      const waveOff = Math.round(Math.sin(y * 0.65) * 1.1);
      for (let x = 0; x < mw; x++) {
        const i = (sySrc * mw + x) * 4;
        if (maraBuf[i + 3] < 180) continue;
        blendRgbPx(
          fxLayer, w, h,
          px + x + waveOff, dy,
          { r: maraBuf[i], g: maraBuf[i + 1], b: maraBuf[i + 2] },
          Math.max(12, Math.round(62 * (1 - y / (mh * 0.52))))
        );
      }
    }
  }
}

// ============================================================================
// B. THE OCEAN — AMBER COAST ALIEN MORNING MASTERPIECE (480x270, 12 LIVING FRAMES!)
// ============================================================================
export function buildOceanMasterpieceV5(underpaintPath: string): {
  basePixels: Uint8ClampedArray;
  frames: Uint8ClampedArray[];
  vpfJson: string;
  width: number;
  height: number;
} {
  const W = 480;
  const H = 270;
  const raw = loadUnderpaintToGrid(underpaintPath, W, H, 2);
  const digitized = digitizeToCraftedPixelArt(raw, W, H, AMBER_COAST_V5_PALETTE, {
    ditherThreshold: 0.044,
    ditherStrength: 0.024,
    cleanPasses: 2,
  });

  const colCream = hexToRgb('#fff9e0');
  const colGold = hexToRgb('#ffe9ad');
  const colFoam = hexToRgb('#edfbf4');
  const colMint = hexToRgb('#b8f0dc');
  const colAqua = hexToRgb('#7be0c8');
  const colSkyRef = hexToRgb('#bce8e0');
  const colShadow = hexToRgb('#4d2c24');

  // Pre-build 6 soulful breathing Mara frames at 100% NATIVE 40x60 world resolution (zero fractional scaling!)
  const maraOceanFrames = MARA_V5_IDLE_6F.map((pose) => {
    const p: MaraV5Pose = {
      ...pose,
      mood: 'wonder',
      visorBounce: 'sunrise',
      headPitch: pose.headPitch - 0.06, // peaceful gaze out across the alien sunrise sea!
    };
    const built = buildMaraV5('40x60', p).canvas.composite();
    return scaleAndFlipSprite(built, 40, 60, 40, 60, true); // 1:1 native pixel flip facing LEFT toward sunrise ocean!
  });

  const FRAME_COUNT = 12;
  const frames: Uint8ClampedArray[] = [];
  let frame0FxLayer = createEmptyBuffer(W, H);
  let frame0MaraLayer = createEmptyBuffer(W, H);

  for (let f = 0; f < FRAME_COUNT; f++) {
    const t = f / FRAME_COUNT;
    const ph = t * Math.PI * 2;
    const frame = new Uint8ClampedArray(digitized.pixels);
    const fxLayer = createEmptyBuffer(W, H);
    const maraLayer = createEmptyBuffer(W, H);

    // 1. LIVING HORIZONTAL WATER SHIMMER & LIQUID-GOLD SUNRISE SPARKLES ON DEEP SWELLS!
    // Gently shift subtle 1px wave rows in deep/mid ocean + pulse bright sunrise pixel sparkles!
    for (let y = 84; y <= 178; y++) {
      const rowPhase = Math.sin(ph + y * 0.42);
      const shiftX = rowPhase > 0.55 ? 1 : rowPhase < -0.55 ? -1 : 0;
      if (shiftX !== 0) {
        // Strictly restrict subtle horizontal ripple shimmer to open water (left of cliffs/beach)!
        const maxWaterX = y < 126 ? 210 : y < 156 ? 268 : 240;
        for (let x = 2; x < maxWaterX; x++) {
          const orig = getPixel(digitized.pixels, W, H, x, y);
          // Only ripple water hues (blue/teal/gold sun-glint — never rock or cliffs!)
          if (orig.b >= orig.r - 12 || (orig.r > 230 && orig.g > 205)) {
            const shifted = getPixel(digitized.pixels, W, H, x + shiftX, y);
            if (shifted.b >= shifted.r - 12 || (shifted.r > 230 && shifted.g > 205)) {
              setPixel(frame, W, H, x, y, shifted);
            }
          }
        }
      }
    }

    // Crisp hand-placed rhythmic golden sunrise water sparkles along the liquid-gold reflection path!
    for (let i = 0; i < 42; i++) {
      const sy = Math.round(86 + hash2v4(i, 13, 307) * 96);
      const pathCenter = 104 + (sy - 86) * 0.24;
      const spread = 18 + (sy - 86) * 0.34;
      const sx = Math.round(pathCenter + (hash2v4(i, 29, 313) - 0.5) * spread * 2);
      const blink = Math.sin(ph + i * 1.37);
      if (blink > 0.38) {
        const bright = blink > 0.78;
        const len = bright ? 3 : 2;
        for (let k = 0; k < len; k++) {
          blendRgbPx(fxLayer, W, H, sx + k, sy, bright ? colCream : colGold, bright ? 245 : 185);
        }
      }
    }

    // 2. LIVING CURLING TRANSPARENT WAVE FOAM & RECEDING LACY SURF ON MIRROR WET SAND!
    // Organic pulsing foam sparkles dancing along the primary curling turquoise wave & shore edge!
    const waveSurge = Math.sin(ph) * 2.4;
    for (let i = 0; i < 48; i++) {
      const u = i / 47;
      // Primary curling crest arc (x=118..272, y=194..132)
      const cx = Math.round(118 + u * 154 + Math.sin(u * Math.PI) * 14 + waveSurge * 0.6);
      const cy = Math.round(196 - u * 62 - Math.sin(u * Math.PI) * 12);
      const pulse = Math.sin(ph + u * Math.PI * 4 + hash2v4(i, 7, 521) * 4);
      if (pulse > 0.15) {
        blendRgbPx(fxLayer, W, H, cx, cy, pulse > 0.65 ? colFoam : colMint, Math.round(150 + pulse * 100));
        if (pulse > 0.72) blendRgbPx(fxLayer, W, H, cx + 1, cy - 1, colFoam, 210);
      }
    }
    // Delicate receding shoreline lace & wet-sand sky-blue reflection sheen pulsing along cove curve!
    for (let i = 0; i < 44; i++) {
      const u = i / 43;
      const sx = Math.round(234 + Math.sin(u * Math.PI) * 136 - u * 12 + waveSurge * 1.1);
      const sy = Math.round(244 - u * 106);
      const pulse = Math.sin(ph - u * 3.8);
      if (pulse > 0.05) {
        blendRgbPx(fxLayer, W, H, sx, sy, colFoam, Math.round(145 + pulse * 95));
        blendRgbPx(fxLayer, W, H, sx - 2, sy + 1, colMint, Math.round(95 + pulse * 70));
      } else {
        // Receding glossy wet sand reflecting pale turquoise sky!
        blendRgbPx(fxLayer, W, H, sx + 3, sy, colSkyRef, Math.round((-pulse) * 95));
      }
    }

    // 3. CRYSTAL BASALT TIDEPOOL RIPPLES (bottom-left x=35..128, y=214..252) & SWAYING SHALLOWS GLINTS!
    for (let i = 0; i < 16; i++) {
      const rx = Math.round(42 + hash2v4(i, 41, 709) * 82);
      const ry = Math.round(216 + hash2v4(i, 53, 719) * 32);
      const p = Math.sin(ph + i * 1.1);
      if (p > 0.35) {
        blendRgbPx(fxLayer, W, H, rx, ry, colAqua, 180);
        blendRgbPx(fxLayer, W, H, rx + 1, ry, colMint, 145);
      }
    }

    // 4. SOARING COASTAL MORNING SEABIRDS GLIDING PEACEFULLY ACROSS THE SKY!
    const birds: Array<[number, number, number]> = [
      [152 + t * 26, 44 - Math.sin(ph) * 2, 0],
      [174 + t * 22, 54 + Math.cos(ph) * 1.5, 2.1],
      [196 + t * 18, 38 - Math.sin(ph + 1) * 1.5, 4.2],
    ];
    for (const [bx, by, boff] of birds) {
      const flap = Math.sin(ph * 2 + boff) > 0 ? -1 : 1;
      blendRgbPx(fxLayer, W, H, bx - 2, by + flap, colCream, 235);
      blendRgbPx(fxLayer, W, H, bx - 1, by, colGold, 240);
      blendRgbPx(fxLayer, W, H, bx, by, colCream, 255);
      blendRgbPx(fxLayer, W, H, bx + 1, by, colGold, 240);
      blendRgbPx(fxLayer, W, H, bx + 2, by + flap, colCream, 235);
    }

    // 5. V5.0 SOULFUL DR. MARA LIN (100% NATIVE 40x60 PIXEL ART!) STANDING PEACEFULLY AT THE MORNING SHORE!
    const maraIdx = Math.floor((f / FRAME_COUNT) * maraOceanFrames.length) % maraOceanFrames.length;
    const maraSpr = maraOceanFrames[maraIdx];
    const mx = 312;
    const my = 171;
    paintWorldMaraShadowAndReflection(fxLayer, W, H, maraSpr, 40, 60, mx, my, 0.55, colShadow, true);
    blitV4(maraLayer, W, H, maraSpr, 40, 60, mx, my);

    // Composite FX & Hero onto Frame
    blitV4(frame, W, H, fxLayer, W, H, 0, 0);
    blitV4(frame, W, H, maraLayer, W, H, 0, 0);
    frames.push(frame);

    if (f === 0) {
      frame0FxLayer = fxLayer;
      frame0MaraLayer = maraLayer;
    }
  }

  const vpfJson = serializeBuffersToVpf({
    id: 'v5_amber_coast_ocean_masterpiece_480x270',
    name: 'V5.0 SOUL — The Ocean: Amber Coast Alien Morning (480x270)',
    width: W,
    height: H,
    paletteHex: AMBER_COAST_V5_PALETTE,
    layers: [
      { id: 'l01_ocean_painted_pixels', name: '01 Hand-Quantized 56-Color Amber Coast Master Pixel Art', pixels: digitized.pixels },
      { id: 'l02_living_water_fx', name: '02 Animated Sunrise Sparkles, Surf Foam, Wet Sheen & Seabirds', pixels: frame0FxLayer },
      { id: 'l03_mara_shore', name: '03 Soulful Dr. Mara Lin Watching the Morning Tide', pixels: frame0MaraLayer },
    ],
    pivot: { x: 240, y: 135 },
    tileSize: 32,
    styleNotes: 'Art Direction V5.0 Soul of Pixel Art — 56-color curated pixel-art Amber Coast morning vista with 12-frame living water sparkles, curling foam, wet-sand reflection & breathing Dr. Mara Lin.',
  });

  return { basePixels: frames[0], frames, vpfJson, width: W, height: H };
}

// ============================================================================
// C. THE LIVING WORLD — SINGING CANOPY ALIEN FOREST SANCTUARY (480x270, 12 LIVING FRAMES!)
// ============================================================================
export function buildForestMasterpieceV5(underpaintPath: string): {
  basePixels: Uint8ClampedArray;
  frames: Uint8ClampedArray[];
  vpfJson: string;
  width: number;
  height: number;
} {
  const W = 480;
  const H = 270;
  const raw = loadUnderpaintToGrid(underpaintPath, W, H, 2);
  const digitized = digitizeToCraftedPixelArt(raw, W, H, SINGING_CANOPY_V5_PALETTE, {
    ditherThreshold: 0.044,
    ditherStrength: 0.022,
    cleanPasses: 2,
  });

  const colCyanHi = hexToRgb('#75fff2');
  const colCyanMid = hexToRgb('#33d6d4');
  const colGoldHi = hexToRgb('#fffbe0');
  const colGoldMid = hexToRgb('#ffdf66');
  const colVioletHi = hexToRgb('#ffd6ff');
  const colVioletMid = hexToRgb('#eb96f0');
  const colWaterSpark = hexToRgb('#dffef8');
  const colForestSh = hexToRgb('#112920');

  // Pre-build 6 gently breathing Curious/Fascinated Dr. Mara Lin frames kneeling by the glowing Sun-Drop Orchids!
  const curiousBase = MARA_V5_EMOTIONS_10F[4]; // CURIOSITY pose with warm golden visor bounce!
  const maraForestFrames = Array.from({ length: 6 }, (_, i) => {
    const ph = (i / 6) * Math.PI * 2;
    const breath = Math.sin(ph) * 0.45;
    const p: MaraV5Pose = {
      ...curiousBase,
      floatingOrchid: false, // the REAL glowing alien Sun-Drop Orchids are right in front of her in the world!!
      chestExpand: breath,
      headDy: curiousBase.headDy - breath * 0.6,
      nearShoulder: curiousBase.nearShoulder + Math.sin(ph) * 2.5,
      scarfCtrl: [
        [-2, 2, 2.1],
        [-7 + Math.sin(ph) * 1.2, 6, 1.9],
        [-12 + Math.sin(ph + 0.8) * 1.8, 11, 1.5],
        [-15 + Math.sin(ph + 1.5) * 2.2, 16, 0.8],
      ],
    };
    const built = buildMaraV5('40x60', p).canvas.composite();
    return scaleAndFlipSprite(built, 40, 60, 40, 60, true); // 100% native 40x60 1:1 flip facing LEFT toward the golden orchids!
  });

  const FRAME_COUNT = 12;
  const frames: Uint8ClampedArray[] = [];
  let frame0FxLayer = createEmptyBuffer(W, H);
  let frame0MaraLayer = createEmptyBuffer(W, H);

  for (let f = 0; f < FRAME_COUNT; f++) {
    const t = f / FRAME_COUNT;
    const ph = t * Math.PI * 2;
    const frame = new Uint8ClampedArray(digitized.pixels);
    const fxLayer = createEmptyBuffer(W, H);
    const maraLayer = createEmptyBuffer(W, H);

    // 1. SHIMMERING CRYSTAL WOODLAND SPRING POOL REFLECTIONS & EXPANDING WATER RIPPLES!
    for (let y = 198; y <= 230; y++) {
      const sh = Math.sin(ph + y * 0.65) > 0.52 ? 1 : Math.sin(ph + y * 0.65) < -0.52 ? -1 : 0;
      if (sh !== 0) {
        for (let x = 188; x <= 386; x++) {
          const orig = getPixel(digitized.pixels, W, H, x, y);
          if (orig.b > orig.r + 18 && orig.g > 110) {
            const shifted = getPixel(digitized.pixels, W, H, x + sh, y);
            if (shifted.b > shifted.r + 12) setPixel(frame, W, H, x, y, shifted);
          }
        }
      }
    }
    // Delicate concentric water-drop ripples expanding beneath the mossy root arch!
    for (const [rcx, rcy, phaseOff] of [[248, 212, 0], [312, 218, 0.5]]) {
      const rt = (t + phaseOff) % 1;
      const rx = 3 + rt * 18;
      const ry = 1.2 + rt * 4.2;
      const alpha = Math.round((1 - rt) * 190);
      for (let a = 0; a < Math.PI * 2; a += 0.22) {
        blendRgbPx(fxLayer, W, H, rcx + Math.cos(a) * rx, rcy + Math.sin(a) * ry, colWaterSpark, alpha);
      }
    }

    // 2. BREATHING TURQUOISE ACOUSTIC RESONANCE PULSES UP THE FLUTED SINGING REEDWOOD WIND-SLITS!
    const slits: Array<[number, number, number]> = [
      [83, 78, 34],   // colossal left Reedwood slit
      [178, 92, 34],  // midground left Reedwood slit
      [290, 140, 20], // distant sanctuary Reedwood slit
      [394, 98, 34],  // colossal right Reedwood slit
    ];
    for (let sIdx = 0; sIdx < slits.length; sIdx++) {
      const [sx, sy0, len] = slits[sIdx];
      const waveY = sy0 + len - (((t + sIdx * 0.27) % 1) * len);
      for (let dy = -5; dy <= 5; dy++) {
        const a = Math.round((1 - Math.abs(dy) / 5.5) * 185);
        blendRgbPx(fxLayer, W, H, sx, waveY + dy, Math.abs(dy) < 2 ? colCyanHi : colCyanMid, a);
      }
    }

    // 3. SOFTLY BREATHING BIOLUMINESCENT GOLDEN SUN-DROP ORCHIDS & VIOLET SHELF-FUNGI!
    const orchidGlow = 0.55 + 0.45 * Math.sin(ph);
    for (const [ox, oy, rad] of [[182, 186, 12], [198, 198, 9], [210, 200, 8]]) {
      for (let dy = -rad; dy <= rad; dy++) {
        for (let dx = -rad; dx <= rad; dx++) {
          const d = Math.hypot(dx, dy) / rad;
          if (d < 1.0) {
            blendRgbPx(fxLayer, W, H, ox + dx, oy + dy, d < 0.35 ? colGoldHi : colGoldMid, Math.round((1 - d) * 68 * orchidGlow));
          }
        }
      }
    }
    const fungiGlow = 0.55 + 0.45 * Math.sin(ph + 1.8);
    for (const [fx, fy] of [[78, 184], [104, 194], [134, 206]]) {
      for (let dy = -6; dy <= 6; dy++) {
        for (let dx = -9; dx <= 9; dx++) {
          const d = Math.hypot(dx / 9, dy / 6);
          if (d < 1.0) {
            blendRgbPx(fxLayer, W, H, fx + dx, fy + dy, d < 0.4 ? colVioletHi : colVioletMid, Math.round((1 - d) * 55 * fungiGlow));
          }
        }
      }
    }

    // 4. HANGING CYAN SPORE TENDRILS SWAYING GENTLY + RISING LUMINOUS GOLDEN POLLEN & CYAN SPORES!
    for (let i = 0; i < 34; i++) {
      const bx = 55 + hash2v4(i, 17, 907) * 370;
      const by0 = 36 + hash2v4(i, 31, 919) * 195;
      // Seamless cyclic upward floating drift!
      const drift = (t + hash2v4(i, 59, 929)) % 1;
      const px = bx + Math.sin(ph + i * 1.4) * 3.5;
      const py = by0 - drift * 22;
      const fade = Math.sin(drift * Math.PI); // fades cleanly in & out with zero loop seam!
      const isCyan = i % 3 === 0;
      blendRgbPx(fxLayer, W, H, px, py, isCyan ? colCyanMid : colGoldMid, Math.round(fade * 115));
      blendRgbPx(fxLayer, W, H, px, py, isCyan ? colCyanHi : colGoldHi, Math.round(fade * 245));
    }

    // 5. V5.0 SOULFUL DR. MARA LIN (100% NATIVE 40x60 PIXEL ART!) KNEELING IN QUIET WONDER BESIDE THE GOLDEN ORCHIDS!
    const maraIdx = Math.floor((f / FRAME_COUNT) * maraForestFrames.length) % maraForestFrames.length;
    const maraSpr = maraForestFrames[maraIdx];
    const mx = 204;
    const my = 183;
    paintWorldMaraShadowAndReflection(fxLayer, W, H, maraSpr, 40, 60, mx, my, -0.25, colForestSh, false);
    blitV4(maraLayer, W, H, maraSpr, 40, 60, mx, my);

    blitV4(frame, W, H, fxLayer, W, H, 0, 0);
    blitV4(frame, W, H, maraLayer, W, H, 0, 0);
    frames.push(frame);

    if (f === 0) {
      frame0FxLayer = fxLayer;
      frame0MaraLayer = maraLayer;
    }
  }

  const vpfJson = serializeBuffersToVpf({
    id: 'v5_singing_canopy_living_world_480x270',
    name: 'V5.0 SOUL — The Living World: Singing Canopy Sanctuary (480x270)',
    width: W,
    height: H,
    paletteHex: SINGING_CANOPY_V5_PALETTE,
    layers: [
      { id: 'l01_forest_painted_pixels', name: '01 Hand-Quantized 56-Color Singing Canopy Pixel Art', pixels: digitized.pixels },
      { id: 'l02_living_sanctuary_fx', name: '02 Animated Pool Ripples, Breathing Bioluminescence & Spores', pixels: frame0FxLayer },
      { id: 'l03_mara_wonder', name: '03 Soulful Dr. Mara Lin Kneeling in Quiet Wonder', pixels: frame0MaraLayer },
    ],
    pivot: { x: 240, y: 135 },
    tileSize: 32,
    styleNotes: 'Art Direction V5.0 Soul of Pixel Art — 56-color curated pixel-art alien cathedral forest sanctuary with 12-frame living spring reflections, pulsing reedwood wind-slits, glowing flora & curious Dr. Mara Lin.',
  });

  return { basePixels: frames[0], frames, vpfJson, width: W, height: H };
}
