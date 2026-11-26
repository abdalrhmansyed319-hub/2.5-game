import type {
  AnimationFrame,
  BrushShape,
  CustomBrush,
  DitherPattern,
  LayerNode,
  PixelSelection,
  RGBA,
  SymmetryMode,
} from '../types/studio';

export function createEmptyBuffer(width: number, height: number): Uint8ClampedArray {
  return new Uint8ClampedArray(width * height * 4);
}

export function cloneBuffer(buf: Uint8ClampedArray): Uint8ClampedArray {
  return new Uint8ClampedArray(buf);
}

export function hexToRgba(hex: string, alpha = 255): RGBA {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16) || 0,
      g: parseInt(clean[1] + clean[1], 16) || 0,
      b: parseInt(clean[2] + clean[2], 16) || 0,
      a: alpha,
    };
  }
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  const a = clean.length === 8 ? parseInt(clean.slice(6, 8), 16) : alpha;
  return { r, g, b, a };
}

export function rgbaToHex(r: number, g: number, b: number): string {
  const to2 = (v: number) => Math.max(0, Math.min(255, v | 0)).toString(16).padStart(2, '0').toUpperCase();
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

export function getPixel(buf: Uint8ClampedArray, w: number, h: number, x: number, y: number): RGBA {
  if (x < 0 || y < 0 || x >= w || y >= h) return { r: 0, g: 0, b: 0, a: 0 };
  const idx = (y * w + x) * 4;
  return { r: buf[idx], g: buf[idx + 1], b: buf[idx + 2], a: buf[idx + 3] };
}

export function setPixel(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  x: number,
  y: number,
  color: RGBA,
  selection?: PixelSelection | null,
  opacityPct = 100
): void {
  const ix = x | 0;
  const iy = y | 0;
  if (ix < 0 || iy < 0 || ix >= w || iy >= h) return;
  if (selection && selection.mask[iy * w + ix] === 0) return;
  const idx = (iy * w + ix) * 4;

  // Eraser / full overwrite path (preserves crisp binary pixel edges!)
  if (color.a === 0 || opacityPct >= 100) {
    buf[idx] = color.r;
    buf[idx + 1] = color.g;
    buf[idx + 2] = color.b;
    buf[idx + 3] = color.a;
    return;
  }

  // Intentional source-over pixel blend when artist lowers brush opacity
  const sa = (color.a / 255) * (opacityPct / 100);
  const da = buf[idx + 3] / 255;
  const outA = sa + da * (1 - sa);
  if (outA <= 0.001) {
    buf[idx] = 0;
    buf[idx + 1] = 0;
    buf[idx + 2] = 0;
    buf[idx + 3] = 0;
    return;
  }
  buf[idx] = Math.round((color.r * sa + buf[idx] * da * (1 - sa)) / outA);
  buf[idx + 1] = Math.round((color.g * sa + buf[idx + 1] * da * (1 - sa)) / outA);
  buf[idx + 2] = Math.round((color.b * sa + buf[idx + 2] * da * (1 - sa)) / outA);
  buf[idx + 3] = Math.round(outA * 255);
}

export function getSymmetryPoints(
  x: number,
  y: number,
  w: number,
  h: number,
  symmetry: SymmetryMode
): Array<[number, number]> {
  const pts: Array<[number, number]> = [[x, y]];
  if (symmetry === 'none') return pts;
  const mx = w - 1 - x;
  const my = h - 1 - y;

  if (symmetry === 'horizontal' || symmetry === 'both' || symmetry === 'radial4' || symmetry === 'radial8') {
    pts.push([mx, y]);
  }
  if (symmetry === 'vertical' || symmetry === 'both' || symmetry === 'radial4' || symmetry === 'radial8') {
    pts.push([x, my]);
  }
  if (symmetry === 'both' || symmetry === 'radial4' || symmetry === 'radial8') {
    pts.push([mx, my]);
  }
  if (symmetry === 'radial8') {
    const cx = (w - 1) / 2;
    const cy = (h - 1) / 2;
    const dx = x - cx;
    const dy = y - cy;
    const rx1 = Math.round(cx + dy);
    const ry1 = Math.round(cy + dx);
    const rx2 = Math.round(cx - dy);
    const ry2 = Math.round(cy - dx);
    pts.push([rx1, ry1], [w - 1 - rx1, ry1], [rx2, ry2], [w - 1 - rx2, ry2]);
  }
  return pts;
}

const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export function matchDitherPattern(x: number, y: number, pattern: DitherPattern): boolean {
  const mx = ((x % 4) + 4) % 4;
  const my = ((y % 4) + 4) % 4;
  switch (pattern) {
    case 'checker50':
      return ((x + y) & 1) === 0;
    case 'bayer2':
      return (x & 1) === 0 && (y & 1) === 0 ? true : ((x + y) & 1) === 0;
    case 'bayer4':
      return BAYER_4X4[my][mx] < 8;
    case 'sparse25':
      return (x & 1) === 0 && (y & 1) === 0;
    case 'dense75':
      return !((x & 1) === 1 && (y & 1) === 1);
    case 'diagonal':
      return ((x + y) % 3 + 3) % 3 === 0;
  }
}

export function stampBrush(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  cx: number,
  cy: number,
  color: RGBA,
  size: number,
  shape: BrushShape,
  symmetry: SymmetryMode,
  selection?: PixelSelection | null,
  opacityPct = 100,
  dither?: { pattern: DitherPattern; secondary?: RGBA | null } | null,
  customBrush?: CustomBrush | null
): void {
  const symPoints = getSymmetryPoints(cx, cy, w, h, symmetry);
  const s = Math.max(1, Math.round(size));

  for (const [px, py] of symPoints) {
    if (shape === 'custom' && customBrush) {
      const ox = px - Math.floor(customBrush.width / 2);
      const oy = py - Math.floor(customBrush.height / 2);
      for (let by = 0; by < customBrush.height; by++) {
        for (let bx = 0; bx < customBrush.width; bx++) {
          const bIdx = (by * customBrush.width + bx) * 4;
          const ba = customBrush.pixels[bIdx + 3];
          if (ba === 0) continue;
          const tx = ox + bx;
          const ty = oy + by;
          if (dither && !matchDitherPattern(tx, ty, dither.pattern)) {
            if (dither.secondary) setPixel(buf, w, h, tx, ty, dither.secondary, selection, opacityPct);
            continue;
          }
          const cOut: RGBA =
            customBrush.colorMode === 'stamp' && color.a > 0
              ? {
                  r: customBrush.pixels[bIdx],
                  g: customBrush.pixels[bIdx + 1],
                  b: customBrush.pixels[bIdx + 2],
                  a: ba,
                }
              : color;
          setPixel(buf, w, h, tx, ty, cOut, selection, opacityPct);
        }
      }
      continue;
    }

    if (s === 1) {
      if (dither) {
        if (matchDitherPattern(px, py, dither.pattern)) {
          setPixel(buf, w, h, px, py, color, selection, opacityPct);
        } else if (dither.secondary) {
          setPixel(buf, w, h, px, py, dither.secondary, selection, opacityPct);
        }
      } else {
        setPixel(buf, w, h, px, py, color, selection, opacityPct);
      }
      continue;
    }

    const r = (s - 1) / 2;
    const startX = Math.floor(px - r);
    const endX = Math.ceil(px + r);
    const startY = Math.floor(py - r);
    const endY = Math.ceil(py + r);
    const rSq = (s / 2) * (s / 2);

    for (let ty = startY; ty <= endY; ty++) {
      for (let tx = startX; tx <= endX; tx++) {
        const dx = tx - px;
        const dy = ty - py;
        let inside = true;
        if (shape === 'circle') {
          inside = dx * dx + dy * dy <= rSq;
        } else if (shape === 'diamond') {
          inside = Math.abs(dx) + Math.abs(dy) <= r + 0.25;
        } else {
          inside = Math.abs(dx) <= r + 0.1 && Math.abs(dy) <= r + 0.1;
        }
        if (!inside) continue;
        if (dither) {
          if (matchDitherPattern(tx, ty, dither.pattern)) {
            setPixel(buf, w, h, tx, ty, color, selection, opacityPct);
          } else if (dither.secondary) {
            setPixel(buf, w, h, tx, ty, dither.secondary, selection, opacityPct);
          }
        } else {
          setPixel(buf, w, h, tx, ty, color, selection, opacityPct);
        }
      }
    }
  }
}

export function getBresenhamPoints(x0: number, y0: number, x1: number, y1: number): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  let ix0 = Math.round(x0);
  let iy0 = Math.round(y0);
  const ix1 = Math.round(x1);
  const iy1 = Math.round(y1);
  const dx = Math.abs(ix1 - ix0);
  const dy = -Math.abs(iy1 - iy0);
  const sx = ix0 < ix1 ? 1 : -1;
  const sy = iy0 < iy1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    pts.push([ix0, iy0]);
    if (ix0 === ix1 && iy0 === iy1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      ix0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      iy0 += sy;
    }
  }
  return pts;
}

/**
 * Pixel-perfect stroke filter (Aseprite algorithm):
 * Removes redundant L-shaped corner doubles when drawing 1px freehand curves!
 */
export function filterPixelPerfectPath(raw: Array<[number, number]>): Array<[number, number]> {
  if (raw.length < 3) return raw;
  const out: Array<[number, number]> = [];
  let i = 0;
  while (i < raw.length) {
    if (i > 0 && i + 1 < raw.length) {
      const prev = out[out.length - 1];
      const curr = raw[i];
      const next = raw[i + 1];
      const isOrthoPrev = Math.abs(curr[0] - prev[0]) + Math.abs(curr[1] - prev[1]) === 1;
      const isOrthoNext = Math.abs(next[0] - curr[0]) + Math.abs(next[1] - curr[1]) === 1;
      const isDiagSkip = Math.abs(next[0] - prev[0]) === 1 && Math.abs(next[1] - prev[1]) === 1;
      if (isOrthoPrev && isOrthoNext && isDiagSkip) {
        i++;
        continue;
      }
    }
    out.push(raw[i]);
    i++;
  }
  return out;
}

export function drawLineOnBuffer(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: RGBA,
  size: number,
  shape: BrushShape,
  symmetry: SymmetryMode,
  selection?: PixelSelection | null,
  opacityPct = 100,
  spacing = 1,
  dither?: { pattern: DitherPattern; secondary?: RGBA | null } | null,
  customBrush?: CustomBrush | null
): void {
  const pts = getBresenhamPoints(x0, y0, x1, y1);
  const step = Math.max(1, Math.round(spacing));
  for (let i = 0; i < pts.length; i += step) {
    stampBrush(buf, w, h, pts[i][0], pts[i][1], color, size, shape, symmetry, selection, opacityPct, dither, customBrush);
  }
}

export function drawRectOnBuffer(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: RGBA,
  filled: boolean,
  size: number,
  shape: BrushShape,
  symmetry: SymmetryMode,
  selection?: PixelSelection | null,
  opacityPct = 100
): void {
  const minX = Math.min(x0, x1);
  const maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1);
  const maxY = Math.max(y0, y1);
  if (filled) {
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        for (const [sx, sy] of getSymmetryPoints(x, y, w, h, symmetry)) {
          setPixel(buf, w, h, sx, sy, color, selection, opacityPct);
        }
      }
    }
  } else {
    drawLineOnBuffer(buf, w, h, minX, minY, maxX, minY, color, size, shape, symmetry, selection, opacityPct);
    drawLineOnBuffer(buf, w, h, maxX, minY, maxX, maxY, color, size, shape, symmetry, selection, opacityPct);
    drawLineOnBuffer(buf, w, h, maxX, maxY, minX, maxY, color, size, shape, symmetry, selection, opacityPct);
    drawLineOnBuffer(buf, w, h, minX, maxY, minX, minY, color, size, shape, symmetry, selection, opacityPct);
  }
}

export function drawEllipseOnBuffer(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: RGBA,
  filled: boolean,
  size: number,
  shape: BrushShape,
  symmetry: SymmetryMode,
  selection?: PixelSelection | null,
  opacityPct = 100
): void {
  const minX = Math.min(x0, x1);
  const maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1);
  const maxY = Math.max(y0, y1);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const rx = Math.max(0.5, (maxX - minX) / 2);
  const ry = Math.max(0.5, (maxY - minY) / 2);

  if (filled) {
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const nx = (x - cx) / (rx + 0.35);
        const ny = (y - cy) / (ry + 0.35);
        if (nx * nx + ny * ny <= 1.0) {
          for (const [sx, sy] of getSymmetryPoints(x, y, w, h, symmetry)) {
            setPixel(buf, w, h, sx, sy, color, selection, opacityPct);
          }
        }
      }
    }
    return;
  }

  // Crisp integer midpoint ellipse rasterizer
  let a = Math.abs(maxX - minX);
  let b = Math.abs(maxY - minY);
  let b1 = b & 1;
  let dx = 4 * (1 - a) * b * b;
  let dy = 4 * (b1 + 1) * a * a;
  let err = dx + dy + b1 * a * a;
  let lx0 = minX;
  let lx1 = maxX;
  let ly0 = minY + Math.floor((b + 1) / 2);
  let ly1 = ly0 - b1;
  const a8 = 8 * a * a;
  const b8 = 8 * b * b;

  const plot = (px: number, py: number) =>
    stampBrush(buf, w, h, px, py, color, size, shape, symmetry, selection, opacityPct);

  do {
    plot(lx1, ly0);
    plot(lx0, ly0);
    plot(lx0, ly1);
    plot(lx1, ly1);
    const e2 = 2 * err;
    if (e2 <= dy) {
      ly0++;
      ly1--;
      err += dy += a8;
    }
    if (e2 >= dx || 2 * err > dy) {
      lx0++;
      lx1--;
      err += dx += b8;
    }
  } while (lx0 <= lx1);

  while (ly0 - ly1 < b) {
    plot(lx0 - 1, ly0);
    plot(lx1 + 1, ly0++);
    plot(lx0 - 1, ly1);
    plot(lx1 + 1, ly1--);
  }
}

export function floodFillBuffer(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  startX: number,
  startY: number,
  fillColor: RGBA,
  contiguous: boolean,
  selection?: PixelSelection | null,
  opacityPct = 100
): boolean {
  if (startX < 0 || startY < 0 || startX >= w || startY >= h) return false;
  if (selection && selection.mask[startY * w + startX] === 0) return false;

  const target = getPixel(buf, w, h, startX, startY);
  if (
    target.r === fillColor.r &&
    target.g === fillColor.g &&
    target.b === fillColor.b &&
    target.a === fillColor.a &&
    opacityPct === 100
  ) {
    return false;
  }

  const matches = (idx: number) =>
    buf[idx] === target.r &&
    buf[idx + 1] === target.g &&
    buf[idx + 2] === target.b &&
    buf[idx + 3] === target.a;

  if (!contiguous) {
    let changed = false;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (selection && selection.mask[y * w + x] === 0) continue;
        const idx = (y * w + x) * 4;
        if (matches(idx)) {
          setPixel(buf, w, h, x, y, fillColor, selection, opacityPct);
          changed = true;
        }
      }
    }
    return changed;
  }

  const visited = new Uint8Array(w * h);
  const stack: number[] = [startX, startY];
  visited[startY * w + startX] = 1;
  while (stack.length > 0) {
    const cy = stack.pop()!;
    const cx = stack.pop()!;
    setPixel(buf, w, h, cx, cy, fillColor, selection, opacityPct);
    const neighbors = [
      [cx - 1, cy],
      [cx + 1, cy],
      [cx, cy - 1],
      [cx, cy + 1],
    ];
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const flat = ny * w + nx;
      if (visited[flat]) continue;
      if (selection && selection.mask[flat] === 0) continue;
      if (matches(flat * 4)) {
        visited[flat] = 1;
        stack.push(nx, ny);
      }
    }
  }
  return true;
}

export function isLayerEffectivelyVisible(
  layer: LayerNode,
  layersById: Map<string, LayerNode>,
  soloLayerId: string | null
): boolean {
  if (layer.kind === 'group') return false;
  if (soloLayerId) return layer.id === soloLayerId;
  if (!layer.visible) return false;
  let parentId = layer.parentId;
  while (parentId) {
    const parent = layersById.get(parentId);
    if (!parent) break;
    if (!parent.visible) return false;
    parentId = parent.parentId;
  }
  return true;
}

export function getEffectiveLayerOpacity(layer: LayerNode, layersById: Map<string, LayerNode>): number {
  let op = layer.opacity / 100;
  let parentId = layer.parentId;
  while (parentId) {
    const parent = layersById.get(parentId);
    if (!parent) break;
    op *= parent.opacity / 100;
    parentId = parent.parentId;
  }
  return op;
}

/**
 * Composite all visible layers of a frame in bottom-to-top order, respecting
 * layer opacity, group visibility, solo isolation, and clipping masks!
 */
export function compositeFrame(
  width: number,
  height: number,
  layers: LayerNode[],
  frame: AnimationFrame,
  soloLayerId: string | null = null
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(width * height * 4);
  const byId = new Map(layers.map((l) => [l.id, l]));
  let lastBaseBuffer: Uint8ClampedArray | null = null;

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    if (layer.kind === 'group') continue;
    const cel = frame.cels[layer.id];
    const visible = isLayerEffectivelyVisible(layer, byId, soloLayerId);

    if (!layer.clipped) {
      lastBaseBuffer = visible && cel ? cel : null;
    }
    if (!visible || !cel) continue;

    const op = getEffectiveLayerOpacity(layer, byId);
    if (op <= 0) continue;
    const clipBuf = layer.clipped ? lastBaseBuffer : null;

    for (let p = 0; p < out.length; p += 4) {
      let sa = cel[p + 3];
      if (sa === 0) continue;
      if (clipBuf && clipBuf[p + 3] === 0) continue;

      if (op >= 0.999 && sa === 255) {
        out[p] = cel[p];
        out[p + 1] = cel[p + 1];
        out[p + 2] = cel[p + 2];
        out[p + 3] = 255;
        continue;
      }

      const srcA = (sa / 255) * op;
      const dstA = out[p + 3] / 255;
      const outA = srcA + dstA * (1 - srcA);
      if (outA <= 0.001) continue;
      out[p] = Math.round((cel[p] * srcA + out[p] * dstA * (1 - srcA)) / outA);
      out[p + 1] = Math.round((cel[p + 1] * srcA + out[p + 1] * dstA * (1 - srcA)) / outA);
      out[p + 2] = Math.round((cel[p + 2] * srcA + out[p + 2] * dstA * (1 - srcA)) / outA);
      out[p + 3] = Math.round(outA * 255);
    }
  }
  return out;
}
