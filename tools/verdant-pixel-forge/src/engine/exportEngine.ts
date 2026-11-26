import type { AnimationFrame, LayerNode, PalettePreset, ProjectDocument } from '../types/studio';
import { compositeFrame, createEmptyBuffer, hexToRgba, rgbaToHex } from './pixelBuffer';
import { DEFAULT_PALETTES, VERDANT_MASTER_PALETTE } from './paletteEngine';
import { encodeAnimatedGIF } from './gifEncoder';
import { runPixelQualityAudit } from './qcEngine';

export interface SpriteSheetOptions {
  layout: 'horizontal' | 'vertical' | 'grid';
  columns: number;
  spacing: number;
  margin: number;
}

export function bufferToCanvas(buf: Uint8ClampedArray, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.putImageData(new ImageData(new Uint8ClampedArray(buf), width, height), 0, 0);
  return canvas;
}

export async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to encode PNG'));
    }, 'image/png');
  });
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function renderSpriteSheetCanvas(
  doc: ProjectDocument,
  opts: SpriteSheetOptions
): {
  canvas: HTMLCanvasElement;
  frameRects: Array<{ frame: number; x: number; y: number; w: number; h: number; durationMs: number }>;
  cols: number;
  rows: number;
} {
  const count = doc.frames.length;
  const cols =
    opts.layout === 'horizontal'
      ? count
      : opts.layout === 'vertical'
        ? 1
        : Math.max(1, Math.min(count, opts.columns));
  const rows = Math.max(1, Math.ceil(count / cols));
  const sheetW = opts.margin * 2 + cols * doc.width + Math.max(0, cols - 1) * opts.spacing;
  const sheetH = opts.margin * 2 + rows * doc.height + Math.max(0, rows - 1) * opts.spacing;

  const canvas = document.createElement('canvas');
  canvas.width = sheetW;
  canvas.height = sheetH;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const frameRects: Array<{ frame: number; x: number; y: number; w: number; h: number; durationMs: number }> = [];

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = opts.margin + col * (doc.width + opts.spacing);
    const y = opts.margin + row * (doc.height + opts.spacing);
    const comp = compositeFrame(doc.width, doc.height, doc.layers, doc.frames[i], null);
    const frameCanvas = bufferToCanvas(comp, doc.width, doc.height);
    ctx.drawImage(frameCanvas, x, y);
    frameRects.push({ frame: i, x, y, w: doc.width, h: doc.height, durationMs: doc.frames[i].durationMs });
  }
  return { canvas, frameRects, cols, rows };
}

export function buildGodotImportSidecar(pngFileName: string): string {
  return `[remap]

importer="texture"
type="CompressedTexture2D"
path="res://.godot/imported/${pngFileName}-vpf.ctex"
metadata={
"vram_texture": false
}

[deps]

source_file="res://assets/exports/${pngFileName}"

[params]

compress/mode=0
compress/high_quality=false
compress/lossy_quality=0.7
compress/hdr_compression=1
compress/normal_map=0
compress/channel_pack=0
mipmaps/generate=false
mipmaps/limit=-1
roughness/mode=0
roughness/src_normal=""
process/fix_alpha_border=false
process/premult_alpha=false
process/normal_map_invert_y=false
process/hdr_as_srgb=false
process/hdr_clamp_exposure=false
process/size_limit=0
detect_3d/compress_to=0
`;
}

export function buildGodotManifestJSON(
  doc: ProjectDocument,
  sheetFileName: string,
  opts: SpriteSheetOptions,
  frameRects: Array<{ frame: number; x: number; y: number; w: number; h: number; durationMs: number }>,
  cols: number,
  rows: number
): string {
  const palette = doc.palettes.find((p) => p.id === doc.activePaletteId) ?? VERDANT_MASTER_PALETTE;
  const activeComp = compositeFrame(
    doc.width,
    doc.height,
    doc.layers,
    doc.frames[doc.activeFrameIndex] ?? doc.frames[0],
    null
  );
  const qc = runPixelQualityAudit(activeComp, doc.width, doc.height, palette, doc.tileset.tileWidth, doc.tileset.tileHeight);
  const manifest = {
    schema: 'verdant_pixel_forge_godot_manifest_v1',
    generator: 'VERDANT PIXEL FORGE',
    godot_compatibility: {
      target_version: '4.7.2',
      texture_filter: 'TEXTURE_FILTER_NEAREST',
      mipmaps: false,
      binary_alpha_verified: qc.semiAlphaPixels === 0,
    },
    asset_name: doc.name,
    sprite_sheet_file: sheetFileName,
    frame_dimensions: { width: doc.width, height: doc.height },
    sheet_layout: { mode: opts.layout, columns: cols, rows, spacing: opts.spacing, margin: opts.margin },
    pivot: doc.pivot,
    animations: doc.tags.map((tag) => ({
      name: tag.name,
      from_frame: tag.from,
      to_frame: tag.to,
      frames: frameRects.slice(tag.from, tag.to + 1),
    })),
    frames: frameRects,
    tileset: {
      tile_width: doc.tileset.tileWidth,
      tile_height: doc.tileset.tileHeight,
      tile_metadata: doc.tileset.metadata,
    },
    quality_audit: {
      unique_colors: qc.uniqueColors,
      off_palette_pixels: qc.offPalettePixels,
      semi_alpha_pixels: qc.semiAlphaPixels,
      accidental_orphans: qc.accidentalOrphans.length,
      intentional_highlights: qc.intentionalHighlights.length,
      dominant_light_angle_deg: qc.lightAngleDeg,
    },
  };
  return JSON.stringify(manifest, null, 2);
}

export async function exportAnimatedGifDownload(doc: ProjectDocument, filename: string): Promise<void> {
  const frames = doc.frames.map((frame) => ({
    pixels: compositeFrame(doc.width, doc.height, doc.layers, frame, null),
    durationMs: frame.durationMs,
  }));
  const bytes = encodeAnimatedGIF(doc.width, doc.height, frames);
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'image/gif' });
  triggerDownload(blob, filename);
}

// ==============================================================================
// PROJECT PERSISTENCE (.vpf.json + VERDANT SIGNAL .source.json + IndexedDB)
// ==============================================================================

function uint8ToBase64(bytes: Uint8ClampedArray): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToUint8(b64: string): Uint8ClampedArray {
  const binary = atob(b64);
  const out = new Uint8ClampedArray(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

export function serializeVpfProject(doc: ProjectDocument): string {
  const payload = {
    format: 'verdant_pixel_forge_project_v1',
    ...doc,
    frames: doc.frames.map((f) => ({
      id: f.id,
      durationMs: f.durationMs,
      cels: Object.fromEntries(
        Object.entries(f.cels).map(([layerId, buf]) => [layerId, uint8ToBase64(buf)])
      ),
    })),
  };
  return JSON.stringify(payload);
}

export function deserializeProjectJSON(rawText: string, fallbackName = 'Imported Project'): ProjectDocument {
  const parsed = JSON.parse(rawText);

  // Native support for VERDANT SIGNAL layered .source.json files (e.g. Mara Lin v1/v2 & Practices A-E!)
  if (parsed.format === 'verdant_signal_indexed_pixel_source_v1') {
    const w: number = parsed.width;
    const h: number = parsed.height;
    const paletteMap: Record<string, string> = parsed.palette ?? {};
    const layerOrder: string[] = parsed.layer_order ?? Object.keys(parsed.layers ?? {});
    const layers: LayerNode[] = [];
    const cels: Record<string, Uint8ClampedArray> = {};

    for (let idx = 0; idx < layerOrder.length; idx++) {
      const layerName = layerOrder[idx];
      const layerId = `layer_${idx}_${layerName.replace(/[^a-zA-Z0-9_]/g, '_')}`;
      layers.push({
        id: layerId,
        name: layerName,
        kind: 'layer',
        parentId: null,
        visible: true,
        locked: false,
        opacity: 100,
        clipped: false,
      });
      const buf = createEmptyBuffer(w, h);
      const rows: string[] = parsed.layers?.[layerName] ?? [];
      for (let y = 0; y < Math.min(h, rows.length); y++) {
        const tokens = rows[y].trim().split(/\s+/);
        for (let x = 0; x < Math.min(w, tokens.length); x++) {
          const tok = tokens[x];
          if (!tok || tok === '.') continue;
          const hex = paletteMap[tok];
          if (!hex) continue;
          const rgba = hexToRgba(hex, 255);
          const off = (y * w + x) * 4;
          buf[off] = rgba.r;
          buf[off + 1] = rgba.g;
          buf[off + 2] = rgba.b;
          buf[off + 3] = 255;
        }
      }
      cels[layerId] = buf;
    }

    if (layers.length === 0) {
      layers.push({
        id: 'layer_0',
        name: 'Layer 1',
        kind: 'layer',
        parentId: null,
        visible: true,
        locked: false,
        opacity: 100,
        clipped: false,
      });
      cels['layer_0'] = createEmptyBuffer(w, h);
    }

    const activeLayerId = layers[layers.length - 1].id;
    const tileW = w >= 128 ? 16 : 16;
    return {
      id: `proj_${Date.now()}`,
      name: parsed.metadata?.asset_name || fallbackName,
      width: w,
      height: h,
      layers,
      frames: [{ id: 'frame_0', durationMs: 140, cels }],
      tags: [{ id: 'tag_idle', name: 'Idle', from: 0, to: 0, color: '#DE884A' }],
      activeLayerId,
      activeFrameIndex: 0,
      soloLayerId: null,
      palettes: DEFAULT_PALETTES,
      activePaletteId: VERDANT_MASTER_PALETTE.id,
      paletteLocked: false,
      tileset: {
        tileWidth: tileW,
        tileHeight: tileW,
        selectedTileIndex: 0,
        metadata: {},
        mapCols: 10,
        mapRows: 8,
        mapCells: Array.from({ length: 80 }, () => ({ tileIndex: -1, rotation: 0, flipH: false, flipV: false })),
      },
      guides: [],
      styleNotes:
        parsed.metadata?.ast_001_note ||
        'VERDANT SIGNAL painterly pixel art: warm upper-left light, cool plum shadow masses, intentional interlocking clusters.',
      references: [],
      pivot: { x: Math.floor(w / 2), y: Math.max(0, h - 10) },
      updatedAt: Date.now(),
    };
  }

  // Native VERDANT PIXEL FORGE .vpf.json project format
  if (parsed.format === 'verdant_pixel_forge_project_v1') {
    const frames: AnimationFrame[] = (parsed.frames ?? []).map(
      (f: { id: string; durationMs: number; cels: Record<string, string> }) => ({
        id: f.id,
        durationMs: f.durationMs || 120,
        cels: Object.fromEntries(
          Object.entries(f.cels ?? {}).map(([lid, b64]) => [lid, base64ToUint8(b64)])
        ),
      })
    );
    return {
      ...parsed,
      frames,
      palettes: parsed.palettes?.length ? parsed.palettes : DEFAULT_PALETTES,
      activePaletteId: parsed.activePaletteId || VERDANT_MASTER_PALETTE.id,
      pivot: parsed.pivot || { x: Math.floor(parsed.width / 2), y: parsed.height - 1 },
      updatedAt: Date.now(),
    } as ProjectDocument;
  }

  throw new Error('Unrecognized project JSON format (expected .vpf.json or .source.json).');
}

export function exportAsVerdantSourceJSON(doc: ProjectDocument): string {
  const activeFrame = doc.frames[doc.activeFrameIndex] ?? doc.frames[0];
  const palette = doc.palettes.find((p) => p.id === doc.activePaletteId) ?? VERDANT_MASTER_PALETTE;
  const hexToToken: Record<string, string> = {};
  const paletteOut: Record<string, string> = {};
  let nextCustom = 0;

  for (const c of palette.colors) {
    const tok = c.token || `C${nextCustom++}`;
    hexToToken[c.hex.toUpperCase()] = tok;
    paletteOut[tok] = c.hex.toUpperCase();
  }

  const layersOut: Record<string, string[]> = {};
  const layerOrder: string[] = [];

  for (const layer of doc.layers) {
    if (layer.kind === 'group') continue;
    const buf = activeFrame.cels[layer.id];
    if (!buf) continue;
    layerOrder.push(layer.name);
    const rows: string[] = [];
    for (let y = 0; y < doc.height; y++) {
      const toks: string[] = [];
      for (let x = 0; x < doc.width; x++) {
        const idx = (y * doc.width + x) * 4;
        if (buf[idx + 3] < 128) {
          toks.push('.');
        } else {
          const hx = rgbaToHex(buf[idx], buf[idx + 1], buf[idx + 2]);
          if (!hexToToken[hx]) {
            const tok = `X${nextCustom++}`;
            hexToToken[hx] = tok;
            paletteOut[tok] = hx;
          }
          toks.push(hexToToken[hx]);
        }
      }
      rows.push(toks.join(' '));
    }
    layersOut[layer.name] = rows;
  }

  return JSON.stringify(
    {
      format: 'verdant_signal_indexed_pixel_source_v1',
      width: doc.width,
      height: doc.height,
      metadata: {
        asset_name: doc.name,
        exported_by: 'VERDANT PIXEL FORGE',
        frame_index: doc.activeFrameIndex,
        exported_at: new Date().toISOString(),
      },
      palette: paletteOut,
      layer_order: layerOrder,
      layers: layersOut,
    },
    null,
    2
  );
}

// ==============================================================================
// INDEXEDDB AUTOSAVE & RECOVERY (Crash-Safe Storage)
// ==============================================================================
const DB_NAME = 'verdant_pixel_forge_autosave';
const STORE_NAME = 'projects';
const AUTOSAVE_KEY = 'latest_session';

function openAutosaveDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveAutosaveSession(doc: ProjectDocument): Promise<void> {
  try {
    const db = await openAutosaveDB();
    const serialized = serializeVpfProject(doc);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put({ savedAt: Date.now(), name: doc.name, data: serialized }, AUTOSAVE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Non-fatal in private browsing
  }
}

export async function loadAutosaveSession(): Promise<{ savedAt: number; name: string; doc: ProjectDocument } | null> {
  try {
    const db = await openAutosaveDB();
    const rec = await new Promise<{ savedAt: number; name: string; data: string } | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(AUTOSAVE_KEY);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    db.close();
    if (!rec?.data) return null;
    return { savedAt: rec.savedAt, name: rec.name, doc: deserializeProjectJSON(rec.data, rec.name) };
  } catch {
    return null;
  }
}

export function createBlankProject(
  name = 'Untitled_128x128',
  width = 128,
  height = 128,
  tileSize = 16
): ProjectDocument {
  const baseId = 'layer_base';
  const detailId = 'layer_details';
  return {
    id: `proj_${Date.now()}`,
    name,
    width,
    height,
    layers: [
      { id: baseId, name: 'Base Silhouette', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
      { id: detailId, name: 'Shading & Details', kind: 'layer', parentId: null, visible: true, locked: false, opacity: 100, clipped: false },
    ],
    frames: [
      {
        id: 'frame_0',
        durationMs: 140,
        cels: {
          [baseId]: createEmptyBuffer(width, height),
          [detailId]: createEmptyBuffer(width, height),
        },
      },
    ],
    tags: [{ id: 'tag_idle', name: 'Idle', from: 0, to: 0, color: '#DE884A' }],
    activeLayerId: baseId,
    activeFrameIndex: 0,
    soloLayerId: null,
    palettes: DEFAULT_PALETTES,
    activePaletteId: VERDANT_MASTER_PALETTE.id,
    paletteLocked: false,
    tileset: {
      tileWidth: tileSize,
      tileHeight: tileSize,
      selectedTileIndex: 0,
      metadata: {},
      mapCols: 10,
      mapRows: 8,
      mapCells: Array.from({ length: 80 }, () => ({ tileIndex: -1, rotation: 0, flipH: false, flipV: false })),
    },
    guides: [],
    styleNotes:
      'VERDANT SIGNAL Direction: Earthy low-chroma palette, warm upper-left light (~38°), cool plum-brown shadow masses, intentional interlocking clusters, crisp native pixels.',
    references: [],
    pivot: { x: Math.floor(width / 2), y: Math.max(0, height - 10) },
    updatedAt: Date.now(),
  };
}

export async function importPngFileAsProject(file: File): Promise<ProjectDocument> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Failed to load PNG'));
      el.src = url;
    });
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, w, h).data;
    const doc = createBlankProject(file.name.replace(/\.png$/i, ''), w, h, w % 16 === 0 ? 16 : 8);
    doc.frames[0].cels[doc.layers[0].id] = new Uint8ClampedArray(data);
    return doc;
  } finally {
    URL.revokeObjectURL(url);
  }
}
