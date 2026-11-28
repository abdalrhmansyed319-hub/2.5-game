import type { RotateAlgorithm } from '../types/studio';

export interface BufferDimensions {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  mask?: Uint8Array;
}

export function flipBufferHorizontal(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  mask?: Uint8Array
): BufferDimensions {
  const out = new Uint8ClampedArray(w * h * 4);
  const outMask = mask ? new Uint8Array(w * h) : undefined;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = w - 1 - x;
      const src = (y * w + x) * 4;
      const dst = (y * w + nx) * 4;
      out[dst] = buf[src];
      out[dst + 1] = buf[src + 1];
      out[dst + 2] = buf[src + 2];
      out[dst + 3] = buf[src + 3];
      if (outMask && mask) outMask[y * w + nx] = mask[y * w + x];
    }
  }
  return { width: w, height: h, pixels: out, mask: outMask };
}

export function flipBufferVertical(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  mask?: Uint8Array
): BufferDimensions {
  const out = new Uint8ClampedArray(w * h * 4);
  const outMask = mask ? new Uint8Array(w * h) : undefined;
  for (let y = 0; y < h; y++) {
    const ny = h - 1 - y;
    for (let x = 0; x < w; x++) {
      const src = (y * w + x) * 4;
      const dst = (ny * w + x) * 4;
      out[dst] = buf[src];
      out[dst + 1] = buf[src + 1];
      out[dst + 2] = buf[src + 2];
      out[dst + 3] = buf[src + 3];
      if (outMask && mask) outMask[ny * w + x] = mask[y * w + x];
    }
  }
  return { width: w, height: h, pixels: out, mask: outMask };
}

export function rotateBuffer90CW(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  mask?: Uint8Array
): BufferDimensions {
  const nw = h;
  const nh = w;
  const out = new Uint8ClampedArray(nw * nh * 4);
  const outMask = mask ? new Uint8Array(nw * nh) : undefined;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = h - 1 - y;
      const ny = x;
      const src = (y * w + x) * 4;
      const dst = (ny * nw + nx) * 4;
      out[dst] = buf[src];
      out[dst + 1] = buf[src + 1];
      out[dst + 2] = buf[src + 2];
      out[dst + 3] = buf[src + 3];
      if (outMask && mask) outMask[ny * nw + nx] = mask[y * w + x];
    }
  }
  return { width: nw, height: nh, pixels: out, mask: outMask };
}

export function rotateBuffer90CCW(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  mask?: Uint8Array
): BufferDimensions {
  const nw = h;
  const nh = w;
  const out = new Uint8ClampedArray(nw * nh * 4);
  const outMask = mask ? new Uint8Array(nw * nh) : undefined;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = y;
      const ny = w - 1 - x;
      const src = (y * w + x) * 4;
      const dst = (ny * nw + nx) * 4;
      out[dst] = buf[src];
      out[dst + 1] = buf[src + 1];
      out[dst + 2] = buf[src + 2];
      out[dst + 3] = buf[src + 3];
      if (outMask && mask) outMask[ny * nw + nx] = mask[y * w + x];
    }
  }
  return { width: nw, height: nh, pixels: out, mask: outMask };
}

/**
 * Scale2x (EPX) pixel-art-aware upscaler used internally by RotSprite rotation
 * to keep crisp pixel clusters cleaner than naive nearest-neighbor free rotation!
 */
function scale2xEPX(buf: Uint8ClampedArray, w: number, h: number): BufferDimensions {
  const nw = w * 2;
  const nh = h * 2;
  const out = new Uint8ClampedArray(nw * nh * 4);

  const eq = (a: number, b: number) =>
    buf[a] === buf[b] && buf[a + 1] === buf[b + 1] && buf[a + 2] === buf[b + 2] && buf[a + 3] === buf[b + 3];
  const copy = (src: number, dst: number) => {
    out[dst] = buf[src];
    out[dst + 1] = buf[src + 1];
    out[dst + 2] = buf[src + 2];
    out[dst + 3] = buf[src + 3];
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4;
      const a = (Math.max(0, y - 1) * w + x) * 4;
      const b = (y * w + Math.min(w - 1, x + 1)) * 4;
      const c = (y * w + Math.max(0, x - 1)) * 4;
      const d = (Math.min(h - 1, y + 1) * w + x) * 4;

      const d1 = (y * 2 * nw + x * 2) * 4;
      const d2 = (y * 2 * nw + x * 2 + 1) * 4;
      const d3 = ((y * 2 + 1) * nw + x * 2) * 4;
      const d4 = ((y * 2 + 1) * nw + x * 2 + 1) * 4;

      if (!eq(c, b) && !eq(a, d)) {
        copy(eq(c, a) ? c : p, d1);
        copy(eq(a, b) ? b : p, d2);
        copy(eq(c, d) ? c : p, d3);
        copy(eq(d, b) ? b : p, d4);
      } else {
        copy(p, d1);
        copy(p, d2);
        copy(p, d3);
        copy(p, d4);
      }
    }
  }
  return { width: nw, height: nh, pixels: out };
}

/**
 * Pixel-exact free rotation supporting both Nearest-Neighbor and RotSprite
 * (4x EPX upsample -> nearest rotate -> integer downsample) — ZERO blurry alpha!
 */
export function freeRotateBuffer(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  angleDeg: number,
  algorithm: RotateAlgorithm = 'rotsprite',
  keepBounds = true
): BufferDimensions {
  const normAngle = ((angleDeg % 360) + 360) % 360;
  if (Math.abs(normAngle) < 0.01) {
    return { width: w, height: h, pixels: new Uint8ClampedArray(buf) };
  }
  if (Math.abs(normAngle - 90) < 0.01 && !keepBounds) return rotateBuffer90CW(buf, w, h);
  if (Math.abs(normAngle - 270) < 0.01 && !keepBounds) return rotateBuffer90CCW(buf, w, h);

  const rad = (normAngle * Math.PI) / 180;
  const cos = Math.cos(-rad);
  const sin = Math.sin(-rad);

  let srcBuf = buf;
  let sw = w;
  let sh = h;
  let factor = 1;

  if (algorithm === 'rotsprite' && w <= 256 && h <= 256) {
    const up1 = scale2xEPX(buf, w, h);
    const up2 = scale2xEPX(up1.pixels, up1.width, up1.height);
    srcBuf = up2.pixels;
    sw = up2.width;
    sh = up2.height;
    factor = 4;
  }

  const outW = keepBounds ? w : Math.max(1, Math.ceil(Math.abs(w * Math.cos(rad)) + Math.abs(h * Math.sin(rad))));
  const outH = keepBounds ? h : Math.max(1, Math.ceil(Math.abs(w * Math.sin(rad)) + Math.abs(h * Math.cos(rad))));
  const out = new Uint8ClampedArray(outW * outH * 4);
  const outMask = new Uint8Array(outW * outH);

  const cxOut = (outW - 1) / 2;
  const cyOut = (outH - 1) / 2;
  const cxSrc = (sw - 1) / 2;
  const cySrc = (sh - 1) / 2;

  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      const dx = (x - cxOut) * factor;
      const dy = (y - cyOut) * factor;
      const sx = Math.round(dx * cos - dy * sin + cxSrc);
      const sy = Math.round(dx * sin + dy * cos + cySrc);
      if (sx < 0 || sy < 0 || sx >= sw || sy >= sh) continue;
      const sIdx = (sy * sw + sx) * 4;
      const dIdx = (y * outW + x) * 4;
      out[dIdx] = srcBuf[sIdx];
      out[dIdx + 1] = srcBuf[sIdx + 1];
      out[dIdx + 2] = srcBuf[sIdx + 2];
      out[dIdx + 3] = srcBuf[sIdx + 3];
      if (srcBuf[sIdx + 3] > 0) outMask[y * outW + x] = 1;
    }
  }
  return { width: outW, height: outH, pixels: out, mask: outMask };
}

export function scaleBufferNearest(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  newW: number,
  newH: number
): BufferDimensions {
  const tw = Math.max(1, Math.round(newW));
  const th = Math.max(1, Math.round(newH));
  const out = new Uint8ClampedArray(tw * th * 4);
  const outMask = new Uint8Array(tw * th);
  for (let y = 0; y < th; y++) {
    const sy = Math.min(h - 1, Math.floor((y * h) / th));
    for (let x = 0; x < tw; x++) {
      const sx = Math.min(w - 1, Math.floor((x * w) / tw));
      const src = (sy * w + sx) * 4;
      const dst = (y * tw + x) * 4;
      out[dst] = buf[src];
      out[dst + 1] = buf[src + 1];
      out[dst + 2] = buf[src + 2];
      out[dst + 3] = buf[src + 3];
      if (buf[src + 3] > 0) outMask[y * tw + x] = 1;
    }
  }
  return { width: tw, height: th, pixels: out, mask: outMask };
}

export function cropBuffer(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): BufferDimensions {
  const out = new Uint8ClampedArray(rw * rh * 4);
  for (let y = 0; y < rh; y++) {
    const sy = ry + y;
    if (sy < 0 || sy >= h) continue;
    for (let x = 0; x < rw; x++) {
      const sx = rx + x;
      if (sx < 0 || sx >= w) continue;
      const src = (sy * w + sx) * 4;
      const dst = (y * rw + x) * 4;
      out[dst] = buf[src];
      out[dst + 1] = buf[src + 1];
      out[dst + 2] = buf[src + 2];
      out[dst + 3] = buf[src + 3];
    }
  }
  return { width: rw, height: rh, pixels: out };
}

export type Anchor9 = 'tl' | 'tc' | 'tr' | 'ml' | 'mc' | 'mr' | 'bl' | 'bc' | 'br';

export function resizeCanvasBuffer(
  buf: Uint8ClampedArray,
  oldW: number,
  oldH: number,
  newW: number,
  newH: number,
  anchor: Anchor9 = 'mc'
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(newW * newH * 4);
  const dx =
    anchor.endsWith('l') ? 0 : anchor.endsWith('r') ? newW - oldW : Math.floor((newW - oldW) / 2);
  const dy =
    anchor.startsWith('t') ? 0 : anchor.startsWith('b') ? newH - oldH : Math.floor((newH - oldH) / 2);

  for (let y = 0; y < oldH; y++) {
    const ty = y + dy;
    if (ty < 0 || ty >= newH) continue;
    for (let x = 0; x < oldW; x++) {
      const tx = x + dx;
      if (tx < 0 || tx >= newW) continue;
      const src = (y * oldW + x) * 4;
      const dst = (ty * newW + tx) * 4;
      out[dst] = buf[src];
      out[dst + 1] = buf[src + 1];
      out[dst + 2] = buf[src + 2];
      out[dst + 3] = buf[src + 3];
    }
  }
  return out;
}

/** Rotate a square/arbitrary layer in-place centered inside its canvas bounds (or exact swap for square!) */
export function rotateLayerInPlace(
  buf: Uint8ClampedArray,
  w: number,
  h: number,
  dir: 'cw' | 'ccw'
): Uint8ClampedArray {
  const rot = dir === 'cw' ? rotateBuffer90CW(buf, w, h) : rotateBuffer90CCW(buf, w, h);
  if (rot.width === w && rot.height === h) return rot.pixels;
  return resizeCanvasBuffer(rot.pixels, rot.width, rot.height, w, h, 'mc');
}

/**
 * Independent Tile Transformations directly on a tileset cel!
 */
export function extractTile(
  buf: Uint8ClampedArray,
  canvasW: number,
  canvasH: number,
  tileIndex: number,
  tileW: number,
  tileH: number
): Uint8ClampedArray {
  const cols = Math.max(1, Math.floor(canvasW / tileW));
  const tx = (tileIndex % cols) * tileW;
  const ty = Math.floor(tileIndex / cols) * tileH;
  return cropBuffer(buf, canvasW, canvasH, tx, ty, tileW, tileH).pixels;
}

export function writeTile(
  buf: Uint8ClampedArray,
  canvasW: number,
  canvasH: number,
  tileIndex: number,
  tileW: number,
  tileH: number,
  tilePixels: Uint8ClampedArray
): void {
  const cols = Math.max(1, Math.floor(canvasW / tileW));
  const ox = (tileIndex % cols) * tileW;
  const oy = Math.floor(tileIndex / cols) * tileH;
  for (let y = 0; y < tileH; y++) {
    const ty = oy + y;
    if (ty < 0 || ty >= canvasH) continue;
    for (let x = 0; x < tileW; x++) {
      const tx = ox + x;
      if (tx < 0 || tx >= canvasW) continue;
      const src = (y * tileW + x) * 4;
      const dst = (ty * canvasW + tx) * 4;
      buf[dst] = tilePixels[src];
      buf[dst + 1] = tilePixels[src + 1];
      buf[dst + 2] = tilePixels[src + 2];
      buf[dst + 3] = tilePixels[src + 3];
    }
  }
}

export function transformSingleTile(
  buf: Uint8ClampedArray,
  canvasW: number,
  canvasH: number,
  tileIndex: number,
  tileW: number,
  tileH: number,
  op: 'cw' | 'ccw' | 'flipH' | 'flipV'
): Uint8ClampedArray {
  const next = new Uint8ClampedArray(buf);
  const tile = extractTile(next, canvasW, canvasH, tileIndex, tileW, tileH);
  let res: Uint8ClampedArray;
  if (op === 'flipH') res = flipBufferHorizontal(tile, tileW, tileH).pixels;
  else if (op === 'flipV') res = flipBufferVertical(tile, tileW, tileH).pixels;
  else res = rotateLayerInPlace(tile, tileW, tileH, op);
  writeTile(next, canvasW, canvasH, tileIndex, tileW, tileH, res);
  return next;
}
