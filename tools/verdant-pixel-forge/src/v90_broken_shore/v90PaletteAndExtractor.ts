import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface SpriteBitmap {
  w: number;
  h: number;
  rgba: Uint8Array;
}

export interface V90AssetCatalogEntry {
  id: string;
  file: string;
  sourceVpf: string;
  category: 'terrain' | 'spacecraft' | 'geology' | 'flora' | 'fauna' | 'vfx';
  canvasWidth: number;
  canvasHeight: number;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  frameOrder: string;
  pivot: [number, number];
  sortOriginY: number;
  visualHeightPx: number;
  collisionFootprint: string;
  materialRole: string;
  sceneUse: string;
}

export function hexToRgb(hex: string): RGB {
  const c = hex.replace('#', '');
  return {
    r: parseInt(c.slice(0, 2), 16),
    g: parseInt(c.slice(2, 4), 16),
    b: parseInt(c.slice(4, 6), 16),
  };
}

/**
 * V9.0 THE BROKEN SHORE — Unified 68-Color Curated Master Palette
 * Anchored directly on Dr. Mara Lin's exact 31 unmodified colors (#1e0c1c ink,
 * #eff2e5 warm ivory, #e69242/#a44522 Solstice terracotta, #71969c/#485565 visor/titanium,
 * #2a1b31 cool plum shadow) extended cleanly into Alien Ocean, Shoreline Sand,
 * Stratified Basalt, Coastal Flora, Amber Tide-Kelp & Luminous Tide-Blossom ramps.
 */
export const V90_MASTER_HEX: readonly string[] = [
  // 1. Mara Core Ink, Plum Shadows & Aerospace Titanium/Ivory (exact Mara DNA!)
  '#1e0c1c', '#2a1b31', '#331725', '#46202a', '#48434e', '#485565',
  '#5d6c7a', '#777575', '#8f969a', '#a19f93', '#c5ae88', '#d1c7a7',
  '#e3dec8', '#eff2e5',
  // 2. Mara & ICV Meridian Terracotta-Orange Livery + Amber Glows
  '#57252b', '#67272d', '#762c2d', '#8a3524', '#a44522', '#bf5c27',
  '#d67831', '#e69242', '#f2b25f', '#fce09b',
  // 3. Visor Cyan / Hologram Console / Bioluminescent Accents
  '#163042', '#235066', '#3a7c8c', '#71969c', '#58c9c8', '#8cf2ea', '#d0fcf8',
  // 4. Vast Alien Ocean (8 Depth Bands: Abyss -> Sapphire -> Cobalt -> Turquoise -> Jade -> Foam)
  '#101d32', '#172c48', '#1e4260', '#255c78', '#2d768c', '#3c949c',
  '#56b2a6', '#7ec7ad', '#a7d9bc', '#cfece2',
  // 5. Shoreline Sand (Glossy Wet -> Capillary Damp -> Warm Dry Ochre -> Sunlit Shell Ivory)
  '#534438', '#6b533c', '#826446', '#9e7c55', '#ba9666', '#d0af7b',
  '#e0c592', '#eed9ad', '#62767e', '#829aa0',
  // 6. Stratified Basalt Cliffs & Driftwood Timber
  '#242a38', '#343e4e', '#4d5c6c', '#697a88', '#8798a2',
  '#4e3528', '#704c36', '#8d684a', '#ab8b6b',
  // 7. Coastal Vegetation, Salt-Sage, Succulents & Inland Forest Bridge
  '#162922', '#234232', '#335c3e', '#497b49', '#679c52', '#8db95e',
  '#b8d372', '#4c7b72',
];

export const V90_MASTER_PALETTE: RGB[] = V90_MASTER_HEX.map(hexToRgb);

export function nearestV90Color(r: number, g: number, b: number): RGB {
  let best = V90_MASTER_PALETTE[0];
  let bestD = Infinity;
  for (let i = 0; i < V90_MASTER_PALETTE.length; i++) {
    const p = V90_MASTER_PALETTE[i];
    const dr = r - p.r;
    const dg = g - p.g;
    const db = b - p.b;
    // Weighted perceptual distance keeping hue warmth crisp
    const d = dr * dr * 0.30 + dg * dg * 0.59 + db * db * 0.11;
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

export function loadPngRgba(filePath: string): SpriteBitmap {
  const dims = execFileSync('identify', ['-format', '%w %h', filePath], { encoding: 'utf8' })
    .trim()
    .split(/\s+/)
    .map(Number);
  const w = dims[0];
  const h = dims[1];
  const buf = execFileSync('convert', [filePath, '-depth', '8', 'rgba:-'], {
    maxBuffer: w * h * 4 + 65536,
  });
  return { w, h, rgba: new Uint8Array(buf.buffer, buf.byteOffset, w * h * 4) };
}

export function savePngRgba(filePath: string, bmp: SpriteBitmap): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  execFileSync(
    'convert',
    [
      '-size',
      `${bmp.w}x${bmp.h}`,
      '-depth',
      '8',
      'rgba:-',
      '-strip',
      '-define',
      'png:compression-level=9',
      filePath,
    ],
    { input: Buffer.from(bmp.rgba), maxBuffer: bmp.w * bmp.h * 4 + 65536 }
  );
}

/**
 * Save editable Verdant Pixel Forge (.vpf.json) source file for a production sprite!
 * Guarantees zero undocumented/anonymous pixel assets (Phase 7).
 */
export function saveEditableVpfSource(
  vpfPath: string,
  name: string,
  bmp: SpriteBitmap,
  meta: Record<string, unknown>
): void {
  fs.mkdirSync(path.dirname(vpfPath), { recursive: true });
  // Compact run-length indexed pixel storage referencing V90_MASTER_HEX (plus 0 = transparent)
  const palMap = new Map<string, number>();
  const palette: string[] = ['transparent'];
  const runs: Array<[number, number]> = [];
  let curIdx = -1;
  let curLen = 0;

  for (let i = 0; i < bmp.w * bmp.h; i++) {
    const o = i * 4;
    let idx = 0;
    if (bmp.rgba[o + 3] >= 128) {
      const hex =
        '#' +
        bmp.rgba[o].toString(16).padStart(2, '0') +
        bmp.rgba[o + 1].toString(16).padStart(2, '0') +
        bmp.rgba[o + 2].toString(16).padStart(2, '0');
      const existing = palMap.get(hex);
      if (existing !== undefined) {
        idx = existing;
      } else {
        idx = palette.length;
        palette.push(hex);
        palMap.set(hex, idx);
      }
    }
    if (idx === curIdx) {
      curLen++;
    } else {
      if (curLen > 0) runs.push([curIdx, curLen]);
      curIdx = idx;
      curLen = 1;
    }
  }
  if (curLen > 0) runs.push([curIdx, curLen]);

  const doc = {
    format: 'verdant-pixel-forge-v1',
    name,
    width: bmp.w,
    height: bmp.h,
    palette,
    metadata: meta,
    layers: [
      {
        id: 'layer_main',
        name: 'Primary Pixel Art',
        visible: true,
        opacity: 1,
        rlePixels: runs,
      },
    ],
  };
  fs.writeFileSync(vpfPath, JSON.stringify(doc), 'utf8');
}

function isMagentaBg(r: number, g: number, b: number): boolean {
  // Strict bright magenta key detection catching subtle compression fringes around #FF00FF
  if (r > 185 && b > 175 && g < 115 && r - g > 85 && b - g > 75) return true;
  if (r > 140 && b > 135 && g < 72 && Math.abs(r - b) < 42 && r - g > 78) return true;
  return false;
}

interface ComponentBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  pixelCount: number;
  mask: Uint8Array;
}

/**
 * Flood-fills exterior magenta background, splits disconnected foreground sprites
 * into sorted connected components (largest first), and cleanly strips any magenta halo!
 */
export function extractForegroundComponents(rawPath: string): {
  src: SpriteBitmap;
  components: ComponentBox[];
} {
  const src = loadPngRgba(rawPath);
  const { w, h, rgba } = src;
  const n = w * h;
  const bg = new Uint8Array(n);

  // Flood fill background from all 4 borders
  const q = new Int32Array(n);
  let head = 0;
  let tail = 0;
  const tryPushBg = (x: number, y: number): void => {
    const idx = y * w + x;
    if (bg[idx]) return;
    const o = idx * 4;
    if (rgba[o + 3] < 128 || isMagentaBg(rgba[o], rgba[o + 1], rgba[o + 2])) {
      bg[idx] = 1;
      q[tail++] = idx;
    }
  };
  for (let x = 0; x < w; x++) {
    tryPushBg(x, 0);
    tryPushBg(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    tryPushBg(0, y);
    tryPushBg(w - 1, y);
  }
  while (head < tail) {
    const idx = q[head++];
    const x = idx % w;
    const y = (idx - x) / w;
    if (x > 0) tryPushBg(x - 1, y);
    if (x < w - 1) tryPushBg(x + 1, y);
    if (y > 0) tryPushBg(x, y - 1);
    if (y < h - 1) tryPushBg(x, y + 1);
  }

  // Also clear enclosed magenta holes (e.g., inside driftwood knot or struts!)
  for (let i = 0; i < n; i++) {
    if (bg[i]) continue;
    const o = i * 4;
    if (rgba[o + 3] < 128 || isMagentaBg(rgba[o], rgba[o + 1], rgba[o + 2])) {
      bg[i] = 1;
    }
  }

  // Erode 1px magenta-tinted fringe pixels directly adjacent to bg
  const fringe = new Uint8Array(n);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (bg[idx]) continue;
      if (bg[idx - 1] || bg[idx + 1] || bg[idx - w] || bg[idx + w]) {
        const o = idx * 4;
        const r = rgba[o], g = rgba[o + 1], b = rgba[o + 2];
        if (r > g + 32 && b > g + 26) {
          fringe[idx] = 1;
        }
      }
    }
  }
  for (let i = 0; i < n; i++) {
    if (fringe[i]) bg[i] = 1;
  }

  // Connected components labeling on foreground (8-connected with small 3px gap bridge for tiny detached sparks/pebbles)
  const visited = new Uint8Array(n);
  const components: ComponentBox[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const start = y * w + x;
      if (bg[start] || visited[start]) continue;
      const pixels: number[] = [];
      let cHead = 0;
      visited[start] = 1;
      q[0] = start;
      let cTail = 1;
      let minX = x, maxX = x, minY = y, maxY = y;
      while (cHead < cTail) {
        const cur = q[cHead++];
        pixels.push(cur);
        const cx = cur % w;
        const cy = (cur - cx) / w;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;
        for (let dy = -2; dy <= 2; dy++) {
          const ny = cy + dy;
          if (ny < 0 || ny >= h) continue;
          for (let dx = -2; dx <= 2; dx++) {
            const nx = cx + dx;
            if (nx < 0 || nx >= w) continue;
            const ni = ny * w + nx;
            if (!bg[ni] && !visited[ni]) {
              visited[ni] = 1;
              q[cTail++] = ni;
            }
          }
        }
      }
      if (pixels.length < 250) continue;
      const bw = maxX - minX + 1;
      const bh = maxY - minY + 1;
      const mask = new Uint8Array(bw * bh);
      for (const p of pixels) {
        const px = p % w;
        const py = (p - px) / w;
        mask[(py - minY) * bw + (px - minX)] = 1;
      }
      components.push({ minX, minY, maxX, maxY, pixelCount: pixels.length, mask });
    }
  }
  components.sort((a, b) => b.pixelCount - a.pixelCount);
  return { src, components };
}

/**
 * Downscales an extracted component using true crisp pixel-grid mode sampling
 * (zero bilinear blur!), quantizes strictly onto V90_MASTER_PALETTE, removes
 * orphan 1px noise, and enforces crisp #1e0c1c sel-out exterior outlines.
 */
export function bakeCrispPixelSprite(
  src: SpriteBitmap,
  comp: ComponentBox,
  targetMaxW: number,
  targetMaxH: number,
  enforceOutline = true
): SpriteBitmap {
  const bw = comp.maxX - comp.minX + 1;
  const bh = comp.maxY - comp.minY + 1;
  const scale = Math.min(targetMaxW / bw, targetMaxH / bh);
  const outW = Math.max(8, Math.round(bw * scale)) + 2;
  const outH = Math.max(8, Math.round(bh * scale)) + 2;
  const out = new Uint8Array(outW * outH * 4);

  const ink = hexToRgb('#1e0c1c');

  // Majority/crisp median-color sampling per target pixel cell (preserves sharp pixel clusters!)
  for (let ty = 1; ty < outH - 1; ty++) {
    const sy0 = Math.floor(((ty - 1) / (outH - 2)) * bh);
    const sy1 = Math.max(sy0 + 1, Math.floor((ty / (outH - 2)) * bh));
    for (let tx = 1; tx < outW - 1; tx++) {
      const sx0 = Math.floor(((tx - 1) / (outW - 2)) * bw);
      const sx1 = Math.max(sx0 + 1, Math.floor((tx / (outW - 2)) * bw));
      let solid = 0;
      let total = 0;
      let darkCount = 0;
      let sumR = 0, sumG = 0, sumB = 0;
      for (let sy = sy0; sy < Math.min(bh, sy1); sy++) {
        for (let sx = sx0; sx < Math.min(bw, sx1); sx++) {
          total++;
          if (!comp.mask[sy * bw + sx]) continue;
          const o = ((comp.minY + sy) * src.w + (comp.minX + sx)) * 4;
          const r = src.rgba[o], g = src.rgba[o + 1], b = src.rgba[o + 2];
          if (r > g + 42 && b > g + 35) continue; // skip any residual magenta pixel
          solid++;
          if (r < 48 && g < 36 && b < 56) darkCount++;
          sumR += r;
          sumG += g;
          sumB += b;
        }
      }
      if (solid === 0 || solid * 2 < total) continue;
      const oi = (ty * outW + tx) * 4;
      // Preserve intentional dark pixel-art interior linework cleanly!
      if (darkCount * 3 >= solid) {
        out[oi] = ink.r;
        out[oi + 1] = ink.g;
        out[oi + 2] = ink.b;
        out[oi + 3] = 255;
      } else {
        const q = nearestV90Color(sumR / solid, sumG / solid, sumB / solid);
        out[oi] = q.r;
        out[oi + 1] = q.g;
        out[oi + 2] = q.b;
        out[oi + 3] = 255;
      }
    }
  }

  // Strip isolated 1px orphan specks
  const copyAlpha = new Uint8Array(outW * outH);
  for (let i = 0; i < outW * outH; i++) copyAlpha[i] = out[i * 4 + 3];
  for (let y = 1; y < outH - 1; y++) {
    for (let x = 1; x < outW - 1; x++) {
      const i = y * outW + x;
      if (!copyAlpha[i]) continue;
      const nb =
        (copyAlpha[i - 1] ? 1 : 0) +
        (copyAlpha[i + 1] ? 1 : 0) +
        (copyAlpha[i - outW] ? 1 : 0) +
        (copyAlpha[i + outW] ? 1 : 0);
      if (nb === 0) {
        out[i * 4 + 3] = 0;
      }
    }
  }

  // Enforce clean crisp 1px #1e0c1c exterior outline matching Dr. Mara Lin's exact sel-out ink!
  if (enforceOutline) {
    const snap = new Uint8Array(outW * outH);
    for (let i = 0; i < outW * outH; i++) snap[i] = out[i * 4 + 3];
    for (let y = 1; y < outH - 1; y++) {
      for (let x = 1; x < outW - 1; x++) {
        const i = y * outW + x;
        if (!snap[i]) continue;
        const onEdge = !snap[i - 1] || !snap[i + 1] || !snap[i - outW] || !snap[i + outW];
        if (onEdge) {
          const oi = i * 4;
          const lum = out[oi] * 0.3 + out[oi + 1] * 0.59 + out[oi + 2] * 0.11;
          // Only darken edge pixels that aren't bright specular tips or glowing lights
          if (lum < 148) {
            out[oi] = ink.r;
            out[oi + 1] = ink.g;
            out[oi + 2] = ink.b;
          }
        }
      }
    }
  }

  return { w: outW, h: outH, rgba: out };
}

export function flipSpriteHorizontal(bmp: SpriteBitmap): SpriteBitmap {
  const out = new Uint8Array(bmp.w * bmp.h * 4);
  for (let y = 0; y < bmp.h; y++) {
    for (let x = 0; x < bmp.w; x++) {
      const si = (y * bmp.w + (bmp.w - 1 - x)) * 4;
      const di = (y * bmp.w + x) * 4;
      out[di] = bmp.rgba[si];
      out[di + 1] = bmp.rgba[si + 1];
      out[di + 2] = bmp.rgba[si + 2];
      out[di + 3] = bmp.rgba[si + 3];
    }
  }
  return { w: bmp.w, h: bmp.h, rgba: out };
}
