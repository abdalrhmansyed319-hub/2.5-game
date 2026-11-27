/**
 * VERDANT PIXEL FORGE — Native Painterly Sculpting & Layer Helpers
 * -----------------------------------------------------------------
 * Pure TypeScript pixel-buffer sculpting operations built strictly on top of
 * VERDANT PIXEL FORGE's `pixelBuffer.ts` and `paletteEngine.ts`.
 *
 * Enforces every VERDANT SIGNAL Painterly Style Guide law:
 *   - Strict 30-color Master Palette (zero off-palette RGB)
 *   - Strict binary alpha (0 or 255 — zero anti-alias blur halos)
 *   - Locked top-left (~45°) key light with warm sunlit highlights & cool plum/teal shadows
 *   - 4-material contrast discipline (quilted orange cloth, weathered dark leather/rubber,
 *     high-contrast brushed titanium, deep curved translucent dark-teal glass)
 */
import type { LayerNode, ProjectDocument, RGBA } from '../types/studio';
import { createEmptyBuffer, getPixel, hexToRgba, setPixel } from '../engine/pixelBuffer';
import { DEFAULT_PALETTES, VERDANT_MASTER_PALETTE } from '../engine/paletteEngine';

export const PAL: Record<string, RGBA> = Object.fromEntries(
  VERDANT_MASTER_PALETTE.colors.map((c) => [c.token!, hexToRgba(c.hex, 255)])
);

export const TRANSPARENT: RGBA = { r: 0, g: 0, b: 0, a: 0 };

export const FEASIBILITY_LAYERS: LayerNode[] = [
  { id: 'l01_antenna_cables', name: '01 Antenna & Cables', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l02_backpack_chassis', name: '02 Backpack Chassis', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l03_oxygen_cylinder', name: '03 Oxygen Cylinder', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l04_back_arm_shadow', name: '04 Far Arm & Shadow', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l05_legs_fabric_panels', name: '05 Legs & Suit Panels', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l06_kneepads_heavy_boots', name: '06 Kneepads & Heavy Boots', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l07_suit_torso_arms', name: '07 Suit Torso & Left Arm', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l08_harness_belt_pouches', name: '08 Harness, Belt & Pouches', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l09_moss_specimen_vial', name: '09 Moss Specimen Vial', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l10_chest_telemetry_rig', name: '10 Chest Telemetry Rig', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l11_helmet_shell_collar', name: '11 Helmet Shell & Collar', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l12_curved_glass_visor', name: '12 Curved Glass Visor', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
  { id: 'l13_handheld_scanner', name: '13 Handheld Field Scanner', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
];

export class VpfSculptCanvas {
  readonly width: number;
  readonly height: number;
  readonly cels: Record<string, Uint8ClampedArray> = {};

  constructor(width: number, height: number, layers: LayerNode[] = FEASIBILITY_LAYERS) {
    this.width = width;
    this.height = height;
    for (const l of layers) {
      this.cels[l.id] = createEmptyBuffer(width, height);
    }
  }

  buf(layerId: string): Uint8ClampedArray {
    const b = this.cels[layerId];
    if (!b) throw new Error(`Unknown VPF layer: ${layerId}`);
    return b;
  }

  isOpaque(layerId: string, x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false;
    return this.buf(layerId)[(y * this.width + x) * 4 + 3] > 0;
  }

  px(layerId: string, x: number, y: number, tok: string, maskLayer?: string): void {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    if (maskLayer && !this.isOpaque(maskLayer, ix, iy)) return;
    if (tok === '.' || tok === '') {
      setPixel(this.buf(layerId), this.width, this.height, ix, iy, TRANSPARENT);
      return;
    }
    const col = PAL[tok];
    if (!col) throw new Error(`Unknown palette token: ${tok}`);
    setPixel(this.buf(layerId), this.width, this.height, ix, iy, col);
  }

  row(layerId: string, x0: number, y: number, tokens: string[], maskLayer?: string): void {
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (!t || t === '.') continue;
      this.px(layerId, x0 + i, y, t, maskLayer);
    }
  }

  erase(layerId: string, x: number, y: number): void {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    setPixel(this.buf(layerId), this.width, this.height, ix, iy, TRANSPARENT);
  }

  fillRect(
    layerId: string,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    tok: string,
    maskLayer?: string
  ): void {
    const lx0 = Math.max(0, Math.floor(Math.min(x0, x1)));
    const lx1 = Math.min(this.width - 1, Math.floor(Math.max(x0, x1)));
    const ly0 = Math.max(0, Math.floor(Math.min(y0, y1)));
    const ly1 = Math.min(this.height - 1, Math.floor(Math.max(y0, y1)));
    for (let y = ly0; y <= ly1; y++) {
      for (let x = lx0; x <= lx1; x++) {
        this.px(layerId, x, y, tok, maskLayer);
      }
    }
  }

  fillEllipse(
    layerId: string,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    tok: string,
    maskLayer?: string,
    angleRad = 0
  ): void {
    const bound = Math.max(rx, ry) + 2;
    const x0 = Math.max(0, Math.floor(cx - bound));
    const x1 = Math.min(this.width - 1, Math.ceil(cx + bound));
    const y0 = Math.max(0, Math.floor(cy - bound));
    const y1 = Math.min(this.height - 1, Math.ceil(cy + bound));
    const cosA = Math.cos(-angleRad);
    const sinA = Math.sin(-angleRad);
    const invRx = 1 / Math.max(rx, 0.25);
    const invRy = 1 / Math.max(ry, 0.25);

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        const ux = (dx * cosA - dy * sinA) * invRx;
        const uy = (dx * sinA + dy * cosA) * invRy;
        if (ux * ux + uy * uy <= 1.0) {
          this.px(layerId, x, y, tok, maskLayer);
        }
      }
    }
  }

  fillCapsule(
    layerId: string,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    r0: number,
    r1: number,
    tok: string,
    maskLayer?: string
  ): void {
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(1, Math.ceil(dist * 3.5));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      const r = r0 + (r1 - r0) * t;
      if (r <= 0.65) {
        this.px(layerId, x, y, tok, maskLayer);
      } else {
        this.fillEllipse(layerId, x, y, r, r, tok, maskLayer);
      }
    }
  }

  fillPoly(
    layerId: string,
    pts: Array<[number, number]>,
    tok: string,
    maskLayer?: string
  ): void {
    if (pts.length < 3) return;
    let minX = this.width;
    let maxX = 0;
    let minY = this.height;
    let maxY = 0;
    for (const [px, py] of pts) {
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }
    const x0 = Math.max(0, Math.floor(minX));
    const x1 = Math.min(this.width - 1, Math.ceil(maxX));
    const y0 = Math.max(0, Math.floor(minY));
    const y1 = Math.min(this.height - 1, Math.ceil(maxY));

    for (let y = y0; y <= y1; y++) {
      const sy = y + 0.5;
      for (let x = x0; x <= x1; x++) {
        const sx = x + 0.5;
        let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const [xi, yi] = pts[i];
          const [xj, yj] = pts[j];
          const intersect =
            yi > sy !== yj > sy && sx < ((xj - xi) * (sy - yi)) / (yj - yi + 1e-9) + xi;
          if (intersect) inside = !inside;
        }
        if (inside) this.px(layerId, x, y, tok, maskLayer);
      }
    }
  }

  /** Crisp 1px integer line (Bresenham) — zero anti-aliasing */
  line(
    layerId: string,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    tok: string,
    maskLayer?: string
  ): void {
    let ix0 = Math.round(x0);
    let iy0 = Math.round(y0);
    const ix1 = Math.round(x1);
    const iy1 = Math.round(y1);
    const dx = Math.abs(ix1 - ix0);
    const dy = Math.abs(iy1 - iy0);
    const sx = ix0 < ix1 ? 1 : -1;
    const sy = iy0 < iy1 ? 1 : -1;
    let err = dx - dy;
    while (true) {
      this.px(layerId, ix0, iy0, tok, maskLayer);
      if (ix0 === ix1 && iy0 === iy1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        ix0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        iy0 += sy;
      }
    }
  }

  /**
   * Painterly orange survival-suit fabric directional shading (locked top-left 45° key light).
   * Preserves crisp clusters & lineless sunlit top-left crests + deep plum-aubergine lower-right folds.
   */
  shadeSuitRegion(
    layerId: string,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    opts?: {
      xMin?: number;
      xMax?: number;
      yMin?: number;
      yMax?: number;
      bias?: number;
      allowS5?: boolean;
      foldFn?: (x: number, y: number, nx: number, ny: number) => number;
    }
  ): void {
    const x0 = Math.max(0, opts?.xMin ?? Math.floor(cx - rx - 4));
    const x1 = Math.min(this.width - 1, opts?.xMax ?? Math.ceil(cx + rx + 4));
    const y0 = Math.max(0, opts?.yMin ?? Math.floor(cy - ry - 4));
    const y1 = Math.min(this.height - 1, opts?.yMax ?? Math.ceil(cy + ry + 4));
    const bias = opts?.bias ?? 0;
    const allowS5 = opts?.allowS5 ?? false;
    const foldFn = opts?.foldFn;

    for (let y = y0; y <= y1; y++) {
      const ny = (y + 0.5 - cy) / Math.max(ry, 1);
      for (let x = x0; x <= x1; x++) {
        if (!this.isOpaque(layerId, x, y)) continue;
        const nx = (x + 0.5 - cx) / Math.max(rx, 1);
        const nz = Math.sqrt(Math.max(0.08, 1.0 - Math.min(0.92, nx * nx * 0.62 + ny * ny * 0.56)));
        let dot = -0.66 * nx - 0.56 * ny + 0.48 * nz + bias;
        if (foldFn) dot += foldFn(x, y, nx, ny);
        // Subtle deterministic 2x2 macro-cluster interlocking (keeps fabric painterly, zero salt-and-pepper)
        const bx = x >> 1;
        const by = y >> 1;
        dot += (Math.sin(bx * 1.47 + by * 2.13) * 0.55 + Math.cos(bx * 0.83 - by * 1.59) * 0.45) * 0.05;

        let tok = 'S3';
        if (dot < -0.22) tok = 'S0';
        else if (dot < 0.06) tok = 'S1';
        else if (dot < 0.34) tok = 'S2';
        else if (dot < 0.64) tok = 'S3';
        else if (dot < 0.88 || !allowS5) tok = 'S4';
        else tok = 'S5';
        this.px(layerId, x, y, tok);
      }
    }
  }

  /**
   * Compressed dark weathered leather & rubber shading (B0/B1 core + crisp selective B2/B3 edge wear)
   * ensuring clean value separation from burnt-orange fabric in both color & grayscale.
   */
  shadeLeatherRegion(
    layerId: string,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    opts?: {
      xMin?: number;
      xMax?: number;
      yMin?: number;
      yMax?: number;
      bias?: number;
      allowB4?: boolean;
    }
  ): void {
    const x0 = Math.max(0, opts?.xMin ?? Math.floor(cx - rx - 3));
    const x1 = Math.min(this.width - 1, opts?.xMax ?? Math.ceil(cx + rx + 3));
    const y0 = Math.max(0, opts?.yMin ?? Math.floor(cy - ry - 3));
    const y1 = Math.min(this.height - 1, opts?.yMax ?? Math.ceil(cy + ry + 3));
    const bias = opts?.bias ?? 0;
    const allowB4 = opts?.allowB4 ?? false;

    for (let y = y0; y <= y1; y++) {
      const ny = (y + 0.5 - cy) / Math.max(ry, 1);
      for (let x = x0; x <= x1; x++) {
        if (!this.isOpaque(layerId, x, y)) continue;
        const nx = (x + 0.5 - cx) / Math.max(rx, 1);
        const nz = Math.sqrt(Math.max(0.08, 1.0 - Math.min(0.92, nx * nx * 0.65 + ny * ny * 0.65)));
        const dot = -0.68 * nx - 0.54 * ny + 0.44 * nz + bias;

        let tok = 'B1';
        if (dot < -0.10) tok = 'B0';
        else if (dot < 0.34) tok = 'B1';
        else if (dot < 0.64) tok = 'B2';
        else if (dot < 0.88 || !allowB4) tok = 'B3';
        else tok = 'B4';
        this.px(layerId, x, y, tok);
      }
    }
  }

  /**
   * High-contrast precision brushed titanium shading (sharp M0/M1 -> M3/M4/M5 jumps).
   */
  shadeMetalRegion(
    layerId: string,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    opts?: {
      xMin?: number;
      xMax?: number;
      yMin?: number;
      yMax?: number;
      bias?: number;
      cylindricalX?: boolean;
      allowM5?: boolean;
    }
  ): void {
    const x0 = Math.max(0, opts?.xMin ?? Math.floor(cx - rx - 3));
    const x1 = Math.min(this.width - 1, opts?.xMax ?? Math.ceil(cx + rx + 3));
    const y0 = Math.max(0, opts?.yMin ?? Math.floor(cy - ry - 3));
    const y1 = Math.min(this.height - 1, opts?.yMax ?? Math.ceil(cy + ry + 3));
    const bias = opts?.bias ?? 0;
    const cyl = opts?.cylindricalX ?? false;
    const allowM5 = opts?.allowM5 ?? true;

    for (let y = y0; y <= y1; y++) {
      const ny = (y + 0.5 - cy) / Math.max(ry, 1);
      for (let x = x0; x <= x1; x++) {
        if (!this.isOpaque(layerId, x, y)) continue;
        const nx = (x + 0.5 - cx) / Math.max(rx, 1);
        let dot: number;
        if (cyl) {
          // Sharp vertical metallic highlight bar shifted left + deep reflection band on right
          const spec = Math.exp(-Math.pow((nx + 0.38) / 0.34, 2));
          const bounce = Math.exp(-Math.pow((nx - 0.65) / 0.30, 2)) * 0.28;
          dot = spec * 1.12 - ny * 0.16 + bounce - 0.16 + bias;
        } else {
          const nz = Math.sqrt(Math.max(0.08, 1.0 - Math.min(0.92, nx * nx * 0.6 + ny * ny * 0.6)));
          dot = -0.68 * nx - 0.56 * ny + 0.45 * nz + bias;
        }

        let tok = 'M2';
        if (dot < -0.15) tok = 'M0';
        else if (dot < 0.14) tok = 'M1';
        else if (dot < 0.46) tok = 'M2';
        else if (dot < 0.72) tok = 'M3';
        else if (dot < 0.90 || !allowM5) tok = 'M4';
        else tok = 'M5';
        this.px(layerId, x, y, tok);
      }
    }
  }

  /**
   * Sculpted sel-out underside & right-side edge grounding (NEVER a uniform marker outline).
   * Darkens ONLY lower/right exterior boundary pixels of the specified layer.
   */
  applySculptedShadowEdge(
    layerId: string,
    shadowTok: string,
    opts?: { rightEdge?: boolean; bottomEdge?: boolean }
  ): void {
    const doRight = opts?.rightEdge ?? true;
    const doBottom = opts?.bottomEdge ?? true;
    const mark: Array<[number, number]> = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (!this.isOpaque(layerId, x, y)) continue;
        const emptyR = doRight && !this.isOpaque(layerId, x + 1, y);
        const emptyB = doBottom && !this.isOpaque(layerId, x, y + 1);
        const hasTL = this.isOpaque(layerId, x - 1, y) || this.isOpaque(layerId, x, y - 1);
        if ((emptyR || emptyB) && hasTL) {
          mark.push([x, y]);
        }
      }
    }
    for (const [x, y] of mark) {
      this.px(layerId, x, y, shadowTok);
    }
  }

  /**
   * Casts crisp directional shadow from an upper layer onto a target layer (offset dx, dy).
   */
  castShadow(
    casterLayerId: string,
    receiverLayerId: string,
    dx: number,
    dy: number,
    shadowTok: string
  ): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (!this.isOpaque(casterLayerId, x, y)) continue;
        const tx = x + dx;
        const ty = y + dy;
        if (this.isOpaque(receiverLayerId, tx, ty) && !this.isOpaque(casterLayerId, tx, ty)) {
          this.px(receiverLayerId, tx, ty, shadowTok);
        }
      }
    }
  }

  toProjectDocument(opts: {
    id: string;
    name: string;
    pivot: { x: number; y: number };
    styleNotes: string;
    layers?: LayerNode[];
  }): ProjectDocument {
    const layers = (opts.layers ?? FEASIBILITY_LAYERS).map((l) => ({ ...l }));
    return {
      id: opts.id,
      name: opts.name,
      width: this.width,
      height: this.height,
      layers,
      frames: [
        {
          id: 'f_proto_0',
          durationMs: 140,
          cels: this.cels,
        },
      ],
      tags: [
        {
          id: 'tag_design_prototype',
          name: 'design_prototype',
          from: 0,
          to: 0,
          color: '#DE884A',
        },
      ],
      activeLayerId: 'l12_curved_glass_visor',
      activeFrameIndex: 0,
      soloLayerId: null,
      palettes: DEFAULT_PALETTES,
      activePaletteId: VERDANT_MASTER_PALETTE.id,
      paletteLocked: true,
      tileset: {
        tileWidth: 16,
        tileHeight: 16,
        selectedTileIndex: 0,
        metadata: {},
        mapCols: 4,
        mapRows: 4,
        mapCells: Array.from({ length: 16 }, () => ({ tileIndex: -1, rotation: 0, flipH: false, flipV: false })),
      },
      guides: [{ id: 'g_ground', orientation: 'horizontal', pos: opts.pivot.y }],
      styleNotes: opts.styleNotes,
      references: [],
      pivot: opts.pivot,
      updatedAt: Date.now(),
    };
  }
}

/** Nearest-neighbor integer upscaler for review previews */
export function scaleNearestRGBA(
  src: Uint8ClampedArray,
  w: number,
  h: number,
  scale: number
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(w * scale * h * scale * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const si = (y * w + x) * 4;
      const r = src[si];
      const g = src[si + 1];
      const b = src[si + 2];
      const a = src[si + 3];
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const di = ((y * scale + sy) * (w * scale) + (x * scale + sx)) * 4;
          out[di] = r;
          out[di + 1] = g;
          out[di + 2] = b;
          out[di + 3] = a;
        }
      }
    }
  }
  return out;
}

/** Alpha-over blit (binary alpha safe) onto an RGBA preview canvas */
export function blitOver(
  dst: Uint8ClampedArray,
  dw: number,
  dh: number,
  src: Uint8ClampedArray,
  sw: number,
  sh: number,
  ox: number,
  oy: number
): void {
  for (let y = 0; y < sh; y++) {
    const dy = oy + y;
    if (dy < 0 || dy >= dh) continue;
    for (let x = 0; x < sw; x++) {
      const dx = ox + x;
      if (dx < 0 || dx >= dw) continue;
      const p = getPixel(src, sw, sh, x, y);
      if (p.a === 0) continue;
      setPixel(dst, dw, dh, dx, dy, p);
    }
  }
}

export function fillPreviewRect(
  dst: Uint8ClampedArray,
  dw: number,
  dh: number,
  x0: number,
  y0: number,
  w: number,
  h: number,
  col: RGBA
): void {
  for (let y = Math.max(0, y0); y < Math.min(dh, y0 + h); y++) {
    for (let x = Math.max(0, x0); x < Math.min(dw, x0 + w); x++) {
      setPixel(dst, dw, dh, x, y, col);
    }
  }
}

export function strokePreviewRect(
  dst: Uint8ClampedArray,
  dw: number,
  dh: number,
  x0: number,
  y0: number,
  w: number,
  h: number,
  col: RGBA
): void {
  for (let x = x0; x < x0 + w; x++) {
    if (x >= 0 && x < dw) {
      if (y0 >= 0 && y0 < dh) setPixel(dst, dw, dh, x, y0, col);
      if (y0 + h - 1 >= 0 && y0 + h - 1 < dh) setPixel(dst, dw, dh, x, y0 + h - 1, col);
    }
  }
  for (let y = y0; y < y0 + h; y++) {
    if (y >= 0 && y < dh) {
      if (x0 >= 0 && x0 < dw) setPixel(dst, dw, dh, x0, y, col);
      if (x0 + w - 1 >= 0 && x0 + w - 1 < dw) setPixel(dst, dw, dh, x0 + w - 1, y, col);
    }
  }
}
