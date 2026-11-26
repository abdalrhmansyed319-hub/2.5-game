import type { PalettePreset, QCReport } from '../types/studio';
import { rgbaToHex } from './pixelBuffer';

function lumAt(buf: Uint8ClampedArray, idx: number): number {
  return (0.2126 * buf[idx] + 0.7152 * buf[idx + 1] + 0.0722 * buf[idx + 2]) / 255;
}

/**
 * Artistic Intelligence & Pixel Quality Inspector (Non-Destructive)
 * -----------------------------------------------------------------
 * Distinguishes actual technical flaws (semi-alpha blur, off-palette leaks,
 * accidental stray pixels, banding runs, micro-noise) from intentional artistic
 * choices (bright specular catchlights, crisp highlights).
 */
export function runPixelQualityAudit(
  composite: Uint8ClampedArray,
  width: number,
  height: number,
  palette: PalettePreset,
  tileW = 16,
  tileH = 16
): QCReport {
  const palSet = new Set(palette.colors.map((c) => c.hex.toUpperCase()));
  const uniqueColors = new Set<string>();
  const intentionalHighlights: Array<{ x: number; y: number; hex: string }> = [];
  const accidentalOrphans: Array<{ x: number; y: number; hex: string }> = [];
  const bandingPixels: Array<{ x: number; y: number }> = [];
  const noisePixels: Array<{ x: number; y: number }> = [];
  const offPaletteCoords: Array<{ x: number; y: number }> = [];
  const semiAlphaCoords: Array<{ x: number; y: number }> = [];

  let opaquePixels = 0;
  let minLum = 1;
  let maxLum = 0;
  let gradSumX = 0;
  let gradSumY = 0;
  let gradMagSum = 0;

  const sameRGB = (i1: number, i2: number) =>
    composite[i1 + 3] > 0 &&
    composite[i2 + 3] > 0 &&
    composite[i1] === composite[i2] &&
    composite[i1 + 1] === composite[i2 + 1] &&
    composite[i1 + 2] === composite[i2 + 2];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const a = composite[idx + 3];
      if (a === 0) continue;
      opaquePixels++;

      if (a < 255) {
        semiAlphaCoords.push({ x, y });
      }

      const hex = rgbaToHex(composite[idx], composite[idx + 1], composite[idx + 2]);
      uniqueColors.add(hex);
      if (palSet.size > 0 && !palSet.has(hex)) {
        offPaletteCoords.push({ x, y });
      }

      const lum = lumAt(composite, idx);
      if (lum < minLum) minLum = lum;
      if (lum > maxLum) maxLum = lum;

      // 4-neighbor and 8-neighbor cluster analysis
      let same4 = 0;
      let same8 = 0;
      let opaqueNeighbors = 0;
      let neighborLumSum = 0;
      const distinctNeighborColors = new Set<string>();

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const nIdx = (ny * width + nx) * 4;
          if (composite[nIdx + 3] === 0) continue;
          opaqueNeighbors++;
          const nLum = lumAt(composite, nIdx);
          neighborLumSum += nLum;
          distinctNeighborColors.add(
            rgbaToHex(composite[nIdx], composite[nIdx + 1], composite[nIdx + 2])
          );
          if (sameRGB(idx, nIdx)) {
            same8++;
            if (Math.abs(dx) + Math.abs(dy) === 1) same4++;
          }
        }
      }

      // Distinguish intentional specular catchlights vs accidental stray orphans!
      if (same8 === 0 && opaqueNeighbors >= 2) {
        const avgNeighborLum = neighborLumSum / opaqueNeighbors;
        const isBrightSpecular = lum >= 0.72 && lum - avgNeighborLum >= 0.16;
        if (isBrightSpecular) {
          intentionalHighlights.push({ x, y, hex });
        } else {
          accidentalOrphans.push({ x, y, hex });
        }
      }

      // Accidental micro-noise hotspot: 4+ distinct colors packed in 3x3 around an isolated pixel
      if (same4 === 0 && distinctNeighborColors.size >= 4 && opaqueNeighbors >= 6) {
        noisePixels.push({ x, y });
      }

      // Light-direction luminance gradient accumulator (interior pixels)
      if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
        const lIdx = (y * width + (x - 1)) * 4;
        const rIdx = (y * width + (x + 1)) * 4;
        const uIdx = ((y - 1) * width + x) * 4;
        const dIdx = ((y + 1) * width + x) * 4;
        if (
          composite[lIdx + 3] > 0 &&
          composite[rIdx + 3] > 0 &&
          composite[uIdx + 3] > 0 &&
          composite[dIdx + 3] > 0
        ) {
          // Point vector TOWARD brighter light source
          const gx = lumAt(composite, lIdx) - lumAt(composite, rIdx);
          const gy = lumAt(composite, uIdx) - lumAt(composite, dIdx);
          const mag = Math.hypot(gx, gy);
          if (mag > 0.08) {
            gradSumX += gx;
            gradSumY += gy;
            gradMagSum += mag;
          }
        }
      }

      // Banding heuristic: 1px-wide parallel hue/value hugging strips along axis transitions
      if (x > 0 && x + 2 < width && y > 0 && y + 1 < height) {
        const right1 = (y * width + x + 1) * 4;
        const down0 = ((y + 1) * width + x) * 4;
        const down1 = ((y + 1) * width + x + 1) * 4;
        const left0 = (y * width + x - 1) * 4;
        const downL = ((y + 1) * width + x - 1) * 4;
        if (
          sameRGB(idx, down0) &&
          !sameRGB(idx, left0) &&
          !sameRGB(idx, right1) &&
          sameRGB(left0, downL) &&
          sameRGB(right1, down1) &&
          Math.abs(lumAt(composite, left0) - lum) > 0.05 &&
          Math.abs(lumAt(composite, right1) - lum) > 0.05 &&
          (lumAt(composite, left0) - lum) * (lum - lumAt(composite, right1)) > 0
        ) {
          bandingPixels.push({ x, y });
        }
      }
    }
  }

  // Tile seam continuity check (wraps across configured tileW x tileH region at 0,0 or full canvas)
  const checkW = Math.min(width, tileW);
  const checkH = Math.min(height, tileH);
  let seamIssuesH = 0;
  let seamIssuesV = 0;
  for (let y = 0; y < checkH; y++) {
    const lIdx = (y * width + 0) * 4;
    const rIdx = (y * width + (checkW - 1)) * 4;
    if (composite[lIdx + 3] > 0 && composite[rIdx + 3] > 0) {
      if (Math.abs(lumAt(composite, lIdx) - lumAt(composite, rIdx)) > 0.22) seamIssuesH++;
    }
  }
  for (let x = 0; x < checkW; x++) {
    const tIdx = (0 * width + x) * 4;
    const bIdx = ((checkH - 1) * width + x) * 4;
    if (composite[tIdx + 3] > 0 && composite[bIdx + 3] > 0) {
      if (Math.abs(lumAt(composite, tIdx) - lumAt(composite, bIdx)) > 0.22) seamIssuesV++;
    }
  }

  const lightMag = Math.hypot(gradSumX, gradSumY);
  const lightConsistencyScore =
    gradMagSum > 0.1 ? Math.min(100, Math.round((lightMag / gradMagSum) * 100)) : 100;
  // Angle where 0°=left, 45°=top-left (VERDANT SIGNAL target is ~35-45° top-left)
  const lightAngleDeg =
    gradMagSum > 0.1 ? Math.round((Math.atan2(gradSumY, gradSumX) * 180) / Math.PI) : null;

  const summaryNotes: QCReport['summaryNotes'] = [];
  if (opaquePixels === 0) {
    summaryNotes.push({
      severity: 'info',
      title: 'Empty Canvas',
      detail: 'Paint on the active layer or load a VERDANT SIGNAL asset to run live craftsmanship checks.',
    });
  } else {
    summaryNotes.push({
      severity: semiAlphaCoords.length === 0 ? 'ok' : 'warn',
      title: semiAlphaCoords.length === 0 ? 'Crisp Binary Transparency' : `${semiAlphaCoords.length} Semi-Transparent Pixels`,
      detail:
        semiAlphaCoords.length === 0
          ? 'Zero semi-alpha blur halos detected; safe for Godot Nearest filtering.'
          : 'Partial-alpha pixels can cause soft edge halos on game sprites unless intentionally used for glass/glow.',
    });

    summaryNotes.push({
      severity: offPaletteCoords.length === 0 ? 'ok' : 'info',
      title:
        offPaletteCoords.length === 0
          ? `Palette Locked (${uniqueColors.size} colors)`
          : `${offPaletteCoords.length} Off-Palette Pixels`,
      detail:
        offPaletteCoords.length === 0
          ? 'Every pixel belongs strictly to the active palette.'
          : 'Some pixels fall outside the active palette. Keep them if intentional, or remap via the Palette Engine.',
    });

    summaryNotes.push({
      severity: accidentalOrphans.length <= 12 ? 'ok' : 'warn',
      title: `${accidentalOrphans.length} Stray Orphans · ${intentionalHighlights.length} Catchlights`,
      detail:
        'Isolated bright specular glints are classified separately as intentional highlights rather than errors.',
    });

    if (bandingPixels.length > 0) {
      summaryNotes.push({
        severity: bandingPixels.length > 24 ? 'warn' : 'info',
        title: `${bandingPixels.length} Potential Banding Points`,
        detail:
          'Parallel 1px value steps detected. Interlock cluster edges or widen calm midtone planes where unintended.',
      });
    }

    if (lightAngleDeg !== null) {
      summaryNotes.push({
        severity: lightConsistencyScore >= 45 ? 'ok' : 'info',
        title: `Dominant Light Vector: ${lightAngleDeg}° (${lightConsistencyScore}% cohesion)`,
        detail: 'VERDANT SIGNAL standard key light originates from upper-left (~35°–45°).',
      });
    }
  }

  return {
    opaquePixels,
    uniqueColors: uniqueColors.size,
    offPalettePixels: offPaletteCoords.length,
    semiAlphaPixels: semiAlphaCoords.length,
    intentionalHighlights,
    accidentalOrphans,
    bandingPixels,
    noisePixels,
    offPaletteCoords,
    semiAlphaCoords,
    lightAngleDeg,
    lightConsistencyScore,
    minLuminance: opaquePixels > 0 ? Math.round(minLum * 100) : 0,
    maxLuminance: opaquePixels > 0 ? Math.round(maxLum * 100) : 0,
    contrastSpread: opaquePixels > 0 ? Math.round((maxLum - minLum) * 100) : 0,
    seamIssuesH,
    seamIssuesV,
    summaryNotes,
  };
}
