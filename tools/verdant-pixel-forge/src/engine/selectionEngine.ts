import type { FloatingSelection, PixelSelection } from '../types/studio';

export function computeSelectionBounds(
  mask: Uint8Array,
  width: number,
  height: number
): { x: number; y: number; w: number; h: number } | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (mask[y * width + x]) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX || maxY < minY) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

export function createRectSelection(
  width: number,
  height: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): PixelSelection | null {
  const minX = Math.max(0, Math.min(x0, x1));
  const maxX = Math.min(width - 1, Math.max(x0, x1));
  const minY = Math.max(0, Math.min(y0, y1));
  const maxY = Math.min(height - 1, Math.max(y0, y1));
  if (maxX < minX || maxY < minY) return null;
  const mask = new Uint8Array(width * height);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      mask[y * width + x] = 1;
    }
  }
  return {
    width,
    height,
    mask,
    bounds: { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 },
  };
}

export function createLassoSelection(
  width: number,
  height: number,
  polygon: Array<[number, number]>
): PixelSelection | null {
  if (polygon.length < 3) return null;
  const mask = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const py = y + 0.5;
    const intersections: number[] = [];
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      const y1 = yi + 0.5;
      const y2 = yj + 0.5;
      if ((y1 > py) !== (y2 > py)) {
        const ix = xi + ((py - y1) * (xj - xi)) / (y2 - y1);
        intersections.push(ix);
      }
    }
    intersections.sort((a, b) => a - b);
    for (let k = 0; k + 1 < intersections.length; k += 2) {
      const sx = Math.max(0, Math.floor(intersections[k]));
      const ex = Math.min(width - 1, Math.ceil(intersections[k + 1]));
      for (let x = sx; x <= ex; x++) {
        mask[y * width + x] = 1;
      }
    }
  }
  const bounds = computeSelectionBounds(mask, width, height);
  if (!bounds) return null;
  return { width, height, mask, bounds };
}

export function createMagicWandSelection(
  buf: Uint8ClampedArray,
  width: number,
  height: number,
  startX: number,
  startY: number,
  contiguous: boolean
): PixelSelection | null {
  if (startX < 0 || startY < 0 || startX >= width || startY >= height) return null;
  const sIdx = (startY * width + startX) * 4;
  const tr = buf[sIdx];
  const tg = buf[sIdx + 1];
  const tb = buf[sIdx + 2];
  const ta = buf[sIdx + 3];
  const mask = new Uint8Array(width * height);

  const same = (idx: number) =>
    buf[idx] === tr && buf[idx + 1] === tg && buf[idx + 2] === tb && buf[idx + 3] === ta;

  if (!contiguous) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (same((y * width + x) * 4)) mask[y * width + x] = 1;
      }
    }
  } else {
    const stack: number[] = [startX, startY];
    mask[startY * width + startX] = 1;
    while (stack.length > 0) {
      const cy = stack.pop()!;
      const cx = stack.pop()!;
      for (const [nx, ny] of [
        [cx - 1, cy],
        [cx + 1, cy],
        [cx, cy - 1],
        [cx, cy + 1],
      ]) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const flat = ny * width + nx;
        if (mask[flat]) continue;
        if (same(flat * 4)) {
          mask[flat] = 1;
          stack.push(nx, ny);
        }
      }
    }
  }
  const bounds = computeSelectionBounds(mask, width, height);
  if (!bounds) return null;
  return { width, height, mask, bounds };
}

export function extractFloatingSelection(
  buf: Uint8ClampedArray,
  width: number,
  height: number,
  selection: PixelSelection,
  cutFromSource: boolean
): FloatingSelection {
  const { x, y, w, h } = selection.bounds;
  const pixels = new Uint8ClampedArray(w * h * 4);
  const mask = new Uint8Array(w * h);

  for (let ly = 0; ly < h; ly++) {
    for (let lx = 0; lx < w; lx++) {
      const sx = x + lx;
      const sy = y + ly;
      if (sx < 0 || sy < 0 || sx >= width || sy >= height) continue;
      if (!selection.mask[sy * width + sx]) continue;
      mask[ly * w + lx] = 1;
      const srcIdx = (sy * width + sx) * 4;
      const dstIdx = (ly * w + lx) * 4;
      pixels[dstIdx] = buf[srcIdx];
      pixels[dstIdx + 1] = buf[srcIdx + 1];
      pixels[dstIdx + 2] = buf[srcIdx + 2];
      pixels[dstIdx + 3] = buf[srcIdx + 3];
      if (cutFromSource) {
        buf[srcIdx] = 0;
        buf[srcIdx + 1] = 0;
        buf[srcIdx + 2] = 0;
        buf[srcIdx + 3] = 0;
      }
    }
  }
  return { x, y, width: w, height: h, pixels, mask };
}

export function stampFloatingSelection(
  buf: Uint8ClampedArray,
  width: number,
  height: number,
  floating: FloatingSelection
): PixelSelection | null {
  const newMask = new Uint8Array(width * height);
  for (let ly = 0; ly < floating.height; ly++) {
    for (let lx = 0; lx < floating.width; lx++) {
      if (!floating.mask[ly * floating.width + lx]) continue;
      const tx = Math.round(floating.x + lx);
      const ty = Math.round(floating.y + ly);
      if (tx < 0 || ty < 0 || tx >= width || ty >= height) continue;
      const srcIdx = (ly * floating.width + lx) * 4;
      const dstIdx = (ty * width + tx) * 4;
      newMask[ty * width + tx] = 1;
      if (floating.pixels[srcIdx + 3] > 0) {
        buf[dstIdx] = floating.pixels[srcIdx];
        buf[dstIdx + 1] = floating.pixels[srcIdx + 1];
        buf[dstIdx + 2] = floating.pixels[srcIdx + 2];
        buf[dstIdx + 3] = floating.pixels[srcIdx + 3];
      }
    }
  }
  const bounds = computeSelectionBounds(newMask, width, height);
  if (!bounds) return null;
  return { width, height, mask: newMask, bounds };
}

export function clearSelectionPixels(
  buf: Uint8ClampedArray,
  width: number,
  height: number,
  selection: PixelSelection
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!selection.mask[y * width + x]) continue;
      const idx = (y * width + x) * 4;
      buf[idx] = 0;
      buf[idx + 1] = 0;
      buf[idx + 2] = 0;
      buf[idx + 3] = 0;
    }
  }
}
