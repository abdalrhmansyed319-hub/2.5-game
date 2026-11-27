import React, { useEffect, useRef, useState } from 'react';
import { Download, FolderOpen, X } from 'lucide-react';
import type { ProjectDocument, RotateAlgorithm } from '../types/studio';
import type { Anchor9 } from '../engine/transformEngine';
import {
  buildGodotImportSidecar,
  buildGodotManifestJSON,
  bufferToCanvas,
  canvasToPngBlob,
  exportAnimatedGifDownload,
  exportAsVerdantSourceJSON,
  renderSpriteSheetCanvas,
  serializeVpfProject,
  triggerDownload,
  type SpriteSheetOptions,
} from '../engine/exportEngine';
import { compositeFrame } from '../engine/pixelBuffer';
import { scaleBufferNearest } from '../engine/transformEngine';

// ==============================================================================
// NEW CANVAS MODAL
// ==============================================================================
export const NewCanvasModal: React.FC<{
  onClose: () => void;
  onCreate: (name: string, width: number, height: number, tileSize: number) => void;
}> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('Verdant_Hero_128');
  const [width, setWidth] = useState(128);
  const [height, setHeight] = useState(128);
  const [tileSize, setTileSize] = useState(16);

  const presets = [
    { label: '16×16 Tile', w: 16, h: 16, t: 16 },
    { label: '16×24 Legacy Char', w: 16, h: 24, t: 16 },
    { label: '32×32 Icon / Prop', w: 32, h: 32, t: 16 },
    { label: '32×48 Char (Compact)', w: 32, h: 48, t: 16 },
    { label: '48×64 Char (Study)', w: 48, h: 64, t: 16 },
    { label: '64×80 Char (Hero)', w: 64, h: 80, t: 16 },
    { label: '64×64 Sprite', w: 64, h: 64, t: 16 },
    { label: '128×128 Concept', w: 128, h: 128, t: 16 },
    { label: '256×256 Tileset', w: 256, h: 256, t: 32 },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()} data-testid="new-canvas-modal">
        <div className="modal-header">
          <span>New Pixel Art Canvas</span>
          <button onClick={onClose}><X size={15} /></button>
        </div>
        <div className="modal-body">
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="opt-label">Project Name</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span className="opt-label">VERDANT SIGNAL Studio Presets</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
              {presets.map((p) => (
                <button
                  key={p.label}
                  className={`pill-btn ${width === p.w && height === p.h ? 'warn-active' : ''}`}
                  style={{ padding: '7px 6px' }}
                  onClick={() => {
                    setWidth(p.w);
                    setHeight(p.h);
                    setTileSize(p.t);
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span className="opt-label">Width (px)</span>
              <input
                type="number"
                min={8}
                max={512}
                value={width}
                onChange={(e) => setWidth(Math.max(8, Math.min(512, Number(e.target.value) || 128)))}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span className="opt-label">Height (px)</span>
              <input
                type="number"
                min={8}
                max={512}
                value={height}
                onChange={(e) => setHeight(Math.max(8, Math.min(512, Number(e.target.value) || 128)))}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span className="opt-label">Tile Grid (px)</span>
              <input
                type="number"
                min={4}
                max={128}
                value={tileSize}
                onChange={(e) => setTileSize(Math.max(4, Math.min(128, Number(e.target.value) || 16)))}
              />
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            data-testid="confirm-new-canvas"
            onClick={() => {
              onCreate(name.trim() || `Canvas_${width}x${height}`, width, height, tileSize);
              onClose();
            }}
          >
            Create {width}×{height} Canvas
          </button>
        </div>
      </div>
    </div>
  );
};

// ==============================================================================
// TRANSFORM / RESIZE / SCALE / PIVOT MODAL
// ==============================================================================
export const TransformModal: React.FC<{
  doc: ProjectDocument;
  hasSelection: boolean;
  onClose: () => void;
  onFreeRotate: (angleDeg: number, algorithm: RotateAlgorithm) => void;
  onScaleNearest: (scalePct: number) => void;
  onResizeCanvas: (newW: number, newH: number, anchor: Anchor9) => void;
  onSetPivot: (x: number, y: number) => void;
}> = ({ doc, hasSelection, onClose, onFreeRotate, onScaleNearest, onResizeCanvas, onSetPivot }) => {
  const [angle, setAngle] = useState(15);
  const [algo, setAlgo] = useState<RotateAlgorithm>('rotsprite');
  const [scalePct, setScalePct] = useState(100);
  const [resizeW, setResizeW] = useState(doc.width);
  const [resizeH, setResizeH] = useState(doc.height);
  const [anchor, setAnchor] = useState<Anchor9>('mc');
  const [pivX, setPivX] = useState(doc.pivot.x);
  const [pivY, setPivY] = useState(doc.pivot.y);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>Pixel-Exact Transforms &amp; Canvas Geometry</span>
          <button onClick={onClose}><X size={15} /></button>
        </div>
        <div className="modal-body">
          {/* Free Rotation */}
          <div className="section-card">
            <div className="section-header">
              <span>Free Rotation ({hasSelection ? 'Selected Region' : 'Active Layer'})</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{angle}°</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="range"
                min={-180}
                max={180}
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <select value={algo} onChange={(e) => setAlgo(e.target.value as RotateAlgorithm)}>
                <option value="rotsprite">RotSprite (Pixel-Aware EPX)</option>
                <option value="nearest">Pure Nearest-Neighbor</option>
              </select>
              <button
                className="btn-primary"
                onClick={() => {
                  onFreeRotate(angle, algo);
                  onClose();
                }}
              >
                Apply
              </button>
            </div>
          </div>

          {/* Nearest-Neighbor Scale */}
          <div className="section-card">
            <div className="section-header">
              <span>Nearest-Neighbor Scale ({hasSelection ? 'Selection' : 'Whole Project'})</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{scalePct}%</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="number"
                min={25}
                max={400}
                step={25}
                value={scalePct}
                onChange={(e) => setScalePct(Math.max(25, Math.min(400, Number(e.target.value) || 100)))}
                style={{ width: 70 }}
              />
              <button className="pill-btn" onClick={() => setScalePct(50)}>50%</button>
              <button className="pill-btn" onClick={() => setScalePct(200)}>200%</button>
              <button
                className="btn-secondary"
                style={{ marginLeft: 'auto' }}
                onClick={() => {
                  onScaleNearest(scalePct);
                  onClose();
                }}
              >
                Scale Crisp
              </button>
            </div>
          </div>

          {/* Resize Canvas with 9-Point Anchor */}
          <div className="section-card">
            <div className="section-header">
              <span>Resize Canvas Bounds (No Scaling)</span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className="opt-label">Width</span>
                <input type="number" min={8} max={512} value={resizeW} onChange={(e) => setResizeW(Number(e.target.value) || doc.width)} style={{ width: 70 }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className="opt-label">Height</span>
                <input type="number" min={8} max={512} value={resizeH} onChange={(e) => setResizeH(Number(e.target.value) || doc.height)} style={{ width: 70 }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                <span className="opt-label">Anchor</span>
                <select value={anchor} onChange={(e) => setAnchor(e.target.value as Anchor9)}>
                  <option value="tl">Top-Left</option>
                  <option value="tc">Top-Center</option>
                  <option value="tr">Top-Right</option>
                  <option value="ml">Middle-Left</option>
                  <option value="mc">Center</option>
                  <option value="mr">Middle-Right</option>
                  <option value="bl">Bottom-Left</option>
                  <option value="bc">Bottom-Center (Character Feet)</option>
                  <option value="br">Bottom-Right</option>
                </select>
              </label>
              <button
                className="btn-secondary"
                style={{ marginTop: 14 }}
                onClick={() => {
                  onResizeCanvas(resizeW, resizeH, anchor);
                  onClose();
                }}
              >
                Resize
              </button>
            </div>
          </div>

          {/* Godot Pivot / Origin Point */}
          <div className="section-card">
            <div className="section-header">
              <span>Godot Origin / Pivot Anchor (px)</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="opt-label">X</span>
              <input type="number" value={pivX} onChange={(e) => setPivX(Number(e.target.value) || 0)} style={{ width: 64 }} />
              <span className="opt-label">Y</span>
              <input type="number" value={pivY} onChange={(e) => setPivY(Number(e.target.value) || 0)} style={{ width: 64 }} />
              <button
                className="pill-btn"
                onClick={() => {
                  setPivX(Math.floor(doc.width / 2));
                  setPivY(doc.height - 1);
                }}
              >
                Bottom-Center
              </button>
              <button
                className="btn-secondary"
                style={{ marginLeft: 'auto' }}
                onClick={() => {
                  onSetPivot(pivX, pivY);
                  onClose();
                }}
              >
                Set Pivot
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==============================================================================
// EXPORT & GODOT PIPELINE MODAL
// ==============================================================================
export const ExportModal: React.FC<{
  doc: ProjectDocument;
  onClose: () => void;
  onNotify: (msg: string) => void;
}> = ({ doc, onClose, onNotify }) => {
  const [pngScale, setPngScale] = useState(1);
  const [sheetOpts, setSheetOpts] = useState<SpriteSheetOptions>(() => ({
    layout: doc.tags.length > 1 ? 'tag_rows' : 'horizontal',
    columns: doc.tags.length > 1 ? Math.max(6, ...doc.tags.map((t) => t.to - t.from + 1)) : Math.max(1, Math.min(4, doc.frames.length)),
    spacing: 0,
    margin: 0,
  }));
  const previewRef = useRef<HTMLCanvasElement>(null);

  const safeName = doc.name.replace(/[^a-zA-Z0-9_-]/g, '_');

  useEffect(() => {
    const c = previewRef.current;
    if (!c) return;
    const { canvas } = renderSpriteSheetCanvas(doc, sheetOpts);
    c.width = canvas.width;
    c.height = canvas.height;
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(canvas, 0, 0);
  }, [doc, sheetOpts]);

  const handleExportTransparentPNG = async () => {
    const comp = compositeFrame(doc.width, doc.height, doc.layers, doc.frames[doc.activeFrameIndex] ?? doc.frames[0], null);
    const scaled =
      pngScale === 1
        ? { width: doc.width, height: doc.height, pixels: comp }
        : scaleBufferNearest(comp, doc.width, doc.height, doc.width * pngScale, doc.height * pngScale);
    const canvas = bufferToCanvas(scaled.pixels, scaled.width, scaled.height);
    const blob = await canvasToPngBlob(canvas);
    triggerDownload(blob, `${safeName}_${scaled.width}x${scaled.height}.png`);
    onNotify(`Exported crisp transparent RGBA PNG (${scaled.width}×${scaled.height}).`);
  };

  const handleExportGodotSpriteSheet = async () => {
    const { canvas, frameRects, cols, rows } = renderSpriteSheetCanvas(doc, sheetOpts);
    const sheetFile = `${safeName}_spritesheet.png`;
    const pngBlob = await canvasToPngBlob(canvas);
    triggerDownload(pngBlob, sheetFile);

    const importText = buildGodotImportSidecar(sheetFile);
    triggerDownload(new Blob([importText], { type: 'text/plain' }), `${sheetFile}.import`);

    const manifestText = buildGodotManifestJSON(doc, sheetFile, sheetOpts, frameRects, cols, rows);
    triggerDownload(new Blob([manifestText], { type: 'application/json' }), `${safeName}_godot_manifest.json`);

    onNotify(`Exported Godot sprite sheet (${canvas.width}×${canvas.height}), .import sidecar, and manifest JSON.`);
  };

  const handleExportAllFrames = async () => {
    for (let i = 0; i < doc.frames.length; i++) {
      const comp = compositeFrame(doc.width, doc.height, doc.layers, doc.frames[i], null);
      const blob = await canvasToPngBlob(bufferToCanvas(comp, doc.width, doc.height));
      triggerDownload(blob, `${safeName}_frame_${String(i + 1).padStart(2, '0')}.png`);
    }
    onNotify(`Exported ${doc.frames.length} individual frame PNGs.`);
  };

  const handleExportGif = async () => {
    await exportAnimatedGifDownload(doc, `${safeName}_animation.gif`);
    onNotify(`Exported animated GIF89a (${doc.frames.length} frames).`);
  };

  const handleExportProjectVPF = () => {
    const json = serializeVpfProject(doc);
    triggerDownload(new Blob([json], { type: 'application/json' }), `${safeName}.vpf.json`);
    onNotify(`Saved editable layered project "${safeName}.vpf.json".`);
  };

  const handleExportVerdantSource = () => {
    const json = exportAsVerdantSourceJSON(doc);
    triggerDownload(new Blob([json], { type: 'application/json' }), `${safeName}.source.json`);
    onNotify(`Exported VERDANT SIGNAL indexed layered source "${safeName}.source.json".`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" style={{ width: 600 }} onClick={(e) => e.stopPropagation()} data-testid="export-modal">
        <div className="modal-header">
          <span>Export &amp; Godot 4 Production Pipeline</span>
          <button onClick={onClose}><X size={15} /></button>
        </div>
        <div className="modal-body">
          {/* Transparent PNG */}
          <div className="section-card">
            <div className="section-header">
              <span>1. Transparent RGBA PNG (Active Frame)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="opt-label">Scale</span>
              <select value={pngScale} onChange={(e) => setPngScale(Number(e.target.value))}>
                <option value={1}>1× Native ({doc.width}×{doc.height})</option>
                <option value={2}>2× Crisp ({doc.width * 2}×{doc.height * 2})</option>
                <option value={4}>4× Crisp ({doc.width * 4}×{doc.height * 4})</option>
                <option value={8}>8× Crisp ({doc.width * 8}×{doc.height * 8})</option>
              </select>
              <button className="btn-primary" style={{ marginLeft: 'auto' }} onClick={handleExportTransparentPNG} data-testid="export-png-btn">
                <Download size={13} /> Export Transparent PNG
              </button>
            </div>
          </div>

          {/* Godot Sprite Sheet */}
          <div className="section-card">
            <div className="section-header">
              <span>2. Godot-Compatible Sprite Sheet ({doc.frames.length} Frames)</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className="opt-label">Layout</span>
                <select
                  value={sheetOpts.layout}
                  onChange={(e) => setSheetOpts({ ...sheetOpts, layout: e.target.value as SpriteSheetOptions['layout'] })}
                >
                  <option value="tag_rows">Row per Animation Tag (Godot H×V)</option>
                  <option value="horizontal">Horizontal Strip</option>
                  <option value="vertical">Vertical Strip</option>
                  <option value="grid">Custom Grid</option>
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className="opt-label">Columns</span>
                <input
                  type="number"
                  min={1}
                  max={64}
                  disabled={sheetOpts.layout !== 'grid' && sheetOpts.layout !== 'tag_rows'}
                  value={sheetOpts.columns}
                  onChange={(e) => setSheetOpts({ ...sheetOpts, columns: Math.max(1, Number(e.target.value) || 1) })}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className="opt-label">Spacing (px)</span>
                <input
                  type="number"
                  min={0}
                  max={32}
                  value={sheetOpts.spacing}
                  onChange={(e) => setSheetOpts({ ...sheetOpts, spacing: Math.max(0, Number(e.target.value) || 0) })}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className="opt-label">Margin (px)</span>
                <input
                  type="number"
                  min={0}
                  max={32}
                  value={sheetOpts.margin}
                  onChange={(e) => setSheetOpts({ ...sheetOpts, margin: Math.max(0, Number(e.target.value) || 0) })}
                />
              </label>
            </div>

            <div style={{ background: '#12161d', border: '1px solid var(--border-subtle)', padding: 6, overflow: 'auto', maxHeight: 130, display: 'flex', justifyContent: 'center' }}>
              <canvas ref={previewRef} className="pixel-canvas" style={{ maxHeight: 112, width: 'auto' }} />
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={handleExportGodotSpriteSheet} data-testid="export-godot-sheet-btn">
                <Download size={13} /> Export Godot Sheet + .import + Manifest
              </button>
              <button className="btn-secondary" onClick={handleExportGif} data-testid="export-gif-btn">
                <Download size={13} /> Animated GIF
              </button>
              <button className="btn-secondary" onClick={handleExportAllFrames}>
                Individual Frames
              </button>
            </div>
          </div>

          {/* Editable Project Formats */}
          <div className="section-card">
            <div className="section-header">
              <span>3. Editable Layered Source Formats</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={handleExportProjectVPF} data-testid="export-vpf-btn">
                Save Full Project (.vpf.json)
              </button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={handleExportVerdantSource}>
                Export VERDANT Indexed Source (.source.json)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==============================================================================
// REPOSITORY ASSET LOADER MODAL (READ-ONLY ACCESS TO VERDANT SIGNAL ASSETS)
// ==============================================================================
export const RepoAssetsModal: React.FC<{
  onClose: () => void;
  onLoadRepoSource: (id: string, label: string) => Promise<void>;
}> = ({ onClose, onLoadRepoSource }) => {
  const [assets, setAssets] = useState<Array<{ id: string; label: string; category: string; format: string; dimensions: string }>>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/repo-assets')
      .then((r) => (r.ok ? r.json() : { assets: [] }))
      .then((d) => setAssets((d.assets ?? []).filter((a: { format: string }) => a.format === 'source_json' || a.format === 'vpf_json')))
      .catch(() => {});
  }, []);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()} data-testid="repo-assets-modal">
        <div className="modal-header">
          <span>Open VERDANT SIGNAL Layered Repository Asset (Read-Only Copy)</span>
          <button onClick={onClose}><X size={15} /></button>
        </div>
        <div className="modal-body">
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            Opens an editable copy inside VERDANT PIXEL FORGE with all original indexed layers intact. Approved repository files on disk are never overwritten.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {assets.map((a) => (
              <button
                key={a.id}
                className="btn-secondary"
                style={{ justifyContent: 'space-between', padding: '8px 10px' }}
                disabled={loadingId !== null}
                onClick={async () => {
                  setLoadingId(a.id);
                  await onLoadRepoSource(a.id, a.label);
                  setLoadingId(null);
                  onClose();
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FolderOpen size={13} color="#de884a" /> {a.label}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-muted)' }}>
                  {loadingId === a.id ? 'Loading…' : a.dimensions}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
