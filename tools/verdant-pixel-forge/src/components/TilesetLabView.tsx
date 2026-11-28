import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Copy,
  Download,
  Eraser,
  FlipHorizontal2,
  FlipVertical2,
  PaintBucket,
  Pencil,
  Pipette,
  RotateCcw,
  RotateCw,
  Trash2,
} from 'lucide-react';
import type { ProjectDocument, TileMeta, TilemapCell } from '../types/studio';
import { cloneBuffer, floodFillBuffer, getPixel, hexToRgba, rgbaToHex, setPixel } from '../engine/pixelBuffer';
import { extractTile, flipBufferHorizontal, flipBufferVertical, rotateLayerInPlace, transformSingleTile, writeTile } from '../engine/transformEngine';
import { bufferToCanvas, canvasToPngBlob, triggerDownload } from '../engine/exportEngine';

interface TilesetLabViewProps {
  doc: ProjectDocument;
  primaryColor: string;
  onPickColor: (hex: string) => void;
  onUpdateTilesetConfig: (patch: Partial<ProjectDocument['tileset']>) => void;
  onUpdateTileMeta: (tileIndex: number, meta: TileMeta) => void;
  onCommitCelChange: (label: string, layerId: string, nextCel: Uint8ClampedArray) => void;
  onNotify: (msg: string) => void;
}

export const TilesetLabView: React.FC<TilesetLabViewProps> = ({
  doc,
  primaryColor,
  onPickColor,
  onUpdateTilesetConfig,
  onUpdateTileMeta,
  onCommitCelChange,
  onNotify,
}) => {
  const [tileTool, setTileTool] = useState<'pencil' | 'eraser' | 'fill' | 'picker'>('pencil');
  const [brushRot, setBrushRot] = useState<0 | 90 | 180 | 270>(0);
  const [brushFlipH, setBrushFlipH] = useState(false);
  const [brushFlipV, setBrushFlipV] = useState(false);
  const [showSeamless3x3, setShowSeamless3x3] = useState(true);

  const editorCanvasRef = useRef<HTMLCanvasElement>(null);
  const seamlessCanvasRef = useRef<HTMLCanvasElement>(null);
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);
  const isPaintingTileRef = useRef(false);
  const workingTileRef = useRef<Uint8ClampedArray | null>(null);
  const isPaintingMapRef = useRef(false);

  const activeFrame = doc.frames[doc.activeFrameIndex] ?? doc.frames[0];
  const activeLayer = doc.layers.find((l) => l.id === doc.activeLayerId && l.kind === 'layer') ?? doc.layers.find((l) => l.kind === 'layer')!;
  const activeCel = activeFrame.cels[activeLayer.id] ?? new Uint8ClampedArray(doc.width * doc.height * 4);

  const tw = Math.max(4, Math.min(doc.width, doc.tileset.tileWidth));
  const th = Math.max(4, Math.min(doc.height, doc.tileset.tileHeight));
  const cols = Math.max(1, Math.floor(doc.width / tw));
  const rows = Math.max(1, Math.floor(doc.height / th));
  const totalTiles = cols * rows;
  const selIndex = Math.max(0, Math.min(totalTiles - 1, doc.tileset.selectedTileIndex));

  const currentTileBuf = useMemo(
    () => extractTile(activeCel, doc.width, doc.height, selIndex, tw, th),
    [activeCel, doc.width, doc.height, selIndex, tw, th]
  );

  const currentMeta: TileMeta = doc.tileset.metadata[selIndex] ?? {
    index: selIndex,
    name: `Tile_${String(selIndex).padStart(2, '0')}`,
    group: 'Terrain',
    solid: true,
    terrain: 'Oura Grass',
    notes: '',
  };

  // Render Focused Single-Tile Editor & 3x3 Seamless Wrap Inspector
  const renderTileEditor = (tileBuf: Uint8ClampedArray) => {
    const ed = editorCanvasRef.current;
    if (ed) {
      const scale = Math.max(6, Math.floor(288 / Math.max(tw, th)));
      ed.width = tw * scale;
      ed.height = th * scale;
      const ctx = ed.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      // Checkerboard
      for (let y = 0; y < th; y++) {
        for (let x = 0; x < tw; x++) {
          ctx.fillStyle = (x + y) % 2 === 0 ? '#272c36' : '#1d222a';
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
      const off = bufferToCanvas(tileBuf, tw, th);
      ctx.drawImage(off, 0, 0, ed.width, ed.height);
      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      for (let x = 1; x < tw; x++) {
        ctx.beginPath();
        ctx.moveTo(x * scale + 0.5, 0);
        ctx.lineTo(x * scale + 0.5, ed.height);
        ctx.stroke();
      }
      for (let y = 1; y < th; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * scale + 0.5);
        ctx.lineTo(ed.width, y * scale + 0.5);
        ctx.stroke();
      }
    }

    const seam = seamlessCanvasRef.current;
    if (seam && showSeamless3x3) {
      const scale = Math.max(2, Math.floor(168 / (Math.max(tw, th) * 3)));
      seam.width = tw * 3 * scale;
      seam.height = th * 3 * scale;
      const sctx = seam.getContext('2d')!;
      sctx.imageSmoothingEnabled = false;
      sctx.fillStyle = '#181c23';
      sctx.fillRect(0, 0, seam.width, seam.height);
      const off = bufferToCanvas(tileBuf, tw, th);
      for (let ry = 0; ry < 3; ry++) {
        for (let rx = 0; rx < 3; rx++) {
          sctx.drawImage(off, rx * tw * scale, ry * th * scale, tw * scale, th * scale);
        }
      }
      // Highlight center tile boundary
      sctx.strokeStyle = 'rgba(222, 136, 74, 0.7)';
      sctx.lineWidth = 1;
      sctx.strokeRect(tw * scale + 0.5, th * scale + 0.5, tw * scale - 1, th * scale - 1);
    }
  };

  useEffect(() => {
    renderTileEditor(currentTileBuf);
  });

  // Render Live Interactive Tilemap Painter
  useEffect(() => {
    const mc = mapCanvasRef.current;
    if (!mc) return;
    const cellPx = Math.max(16, Math.floor(280 / doc.tileset.mapCols));
    mc.width = doc.tileset.mapCols * cellPx;
    mc.height = doc.tileset.mapRows * cellPx;
    const ctx = mc.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#141820';
    ctx.fillRect(0, 0, mc.width, mc.height);

    for (let r = 0; r < doc.tileset.mapRows; r++) {
      for (let c = 0; c < doc.tileset.mapCols; c++) {
        const cell = doc.tileset.mapCells[r * doc.tileset.mapCols + c];
        if (cell && cell.tileIndex >= 0 && cell.tileIndex < totalTiles) {
          let buf = extractTile(activeCel, doc.width, doc.height, cell.tileIndex, tw, th);
          if (cell.flipH) buf = flipBufferHorizontal(buf, tw, th).pixels;
          if (cell.flipV) buf = flipBufferVertical(buf, tw, th).pixels;
          const steps = (cell.rotation / 90) % 4;
          for (let s = 0; s < steps; s++) buf = rotateLayerInPlace(buf, tw, th, 'cw');
          const off = bufferToCanvas(buf, tw, th);
          ctx.drawImage(off, c * cellPx, r * cellPx, cellPx, cellPx);
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.strokeRect(c * cellPx + 0.5, r * cellPx + 0.5, cellPx, cellPx);
      }
    }
  }, [activeCel, doc.width, doc.height, doc.tileset, tw, th, totalTiles]);

  // Paint on focused tile editor
  const applyTilePixel = (clientX: number, clientY: number, isInitial: boolean) => {
    const canvas = editorCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((clientX - rect.left) / rect.width) * tw);
    const y = Math.floor(((clientY - rect.top) / rect.height) * th);
    if (x < 0 || y < 0 || x >= tw || y >= th) return;

    const tileBuf = workingTileRef.current ?? cloneBuffer(currentTileBuf);
    if (tileTool === 'picker') {
      const px = getPixel(tileBuf, tw, th, x, y);
      if (px.a > 0) onPickColor(rgbaToHex(px.r, px.g, px.b));
      return;
    }
    if (tileTool === 'fill' && isInitial) {
      floodFillBuffer(tileBuf, tw, th, x, y, hexToRgba(primaryColor, 255), true);
      const nextCel = cloneBuffer(activeCel);
      writeTile(nextCel, doc.width, doc.height, selIndex, tw, th, tileBuf);
      onCommitCelChange(`Fill Tile #${selIndex}`, activeLayer.id, nextCel);
      return;
    }

    const col = tileTool === 'eraser' ? { r: 0, g: 0, b: 0, a: 0 } : hexToRgba(primaryColor, 255);
    setPixel(tileBuf, tw, th, x, y, col);
    workingTileRef.current = tileBuf;
    renderTileEditor(tileBuf);
  };

  const commitTileStroke = () => {
    if (!workingTileRef.current) return;
    const nextCel = cloneBuffer(activeCel);
    writeTile(nextCel, doc.width, doc.height, selIndex, tw, th, workingTileRef.current);
    onCommitCelChange(`Edit Tile #${selIndex}`, activeLayer.id, nextCel);
    workingTileRef.current = null;
  };

  const handleTileTransform = (op: 'cw' | 'ccw' | 'flipH' | 'flipV') => {
    const nextCel = transformSingleTile(activeCel, doc.width, doc.height, selIndex, tw, th, op);
    onCommitCelChange(`Transform Tile #${selIndex} (${op})`, activeLayer.id, nextCel);
    onNotify(`Transformed Tile #${selIndex} (${op.toUpperCase()}).`);
  };

  const handleDuplicateTileToNext = () => {
    const targetIdx = (selIndex + 1) % totalTiles;
    const nextCel = cloneBuffer(activeCel);
    writeTile(nextCel, doc.width, doc.height, targetIdx, tw, th, currentTileBuf);
    onCommitCelChange(`Duplicate Tile #${selIndex} -> #${targetIdx}`, activeLayer.id, nextCel);
    onUpdateTilesetConfig({ selectedTileIndex: targetIdx });
    onNotify(`Duplicated Tile #${selIndex} into slot #${targetIdx}.`);
  };

  const handleClearTile = () => {
    const nextCel = cloneBuffer(activeCel);
    writeTile(nextCel, doc.width, doc.height, selIndex, tw, th, new Uint8ClampedArray(tw * th * 4));
    onCommitCelChange(`Clear Tile #${selIndex}`, activeLayer.id, nextCel);
  };

  const paintMapAt = (clientX: number, clientY: number, erase: boolean) => {
    const mc = mapCanvasRef.current;
    if (!mc) return;
    const rect = mc.getBoundingClientRect();
    const col = Math.floor(((clientX - rect.left) / rect.width) * doc.tileset.mapCols);
    const row = Math.floor(((clientY - rect.top) / rect.height) * doc.tileset.mapRows);
    if (col < 0 || row < 0 || col >= doc.tileset.mapCols || row >= doc.tileset.mapRows) return;
    const idx = row * doc.tileset.mapCols + col;
    const nextCells = doc.tileset.mapCells.slice();
    nextCells[idx] = erase
      ? { tileIndex: -1, rotation: 0, flipH: false, flipV: false }
      : { tileIndex: selIndex, rotation: brushRot, flipH: brushFlipH, flipV: brushFlipV };
    onUpdateTilesetConfig({ mapCells: nextCells });
  };

  const handleExportTileset = async () => {
    const canvas = bufferToCanvas(activeCel, doc.width, doc.height);
    const blob = await canvasToPngBlob(canvas);
    triggerDownload(blob, `${doc.name}_tileset_${tw}x${th}.png`);
    const metaJson = JSON.stringify(
      {
        schema: 'verdant_pixel_forge_tileset_v1',
        tileset_image: `${doc.name}_tileset_${tw}x${th}.png`,
        canvas_width: doc.width,
        canvas_height: doc.height,
        tile_width: tw,
        tile_height: th,
        columns: cols,
        rows,
        tiles: doc.tileset.metadata,
      },
      null,
      2
    );
    triggerDownload(new Blob([metaJson], { type: 'application/json' }), `${doc.name}_tileset_metadata.json`);
    onNotify('Exported Tileset PNG + Godot tile metadata JSON.');
  };

  return (
    <div className="tileset-lab-layout" data-testid="tileset-lab-view">
      {/* Column 1: Auto-Grid Tile Sheet Selector */}
      <div className="tileset-col">
        <div className="section-header" style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
          <span>Tileset Atlas ({cols}×{rows} = {totalTiles})</span>
          <button className="pill-btn" onClick={handleExportTileset} title="Export Tileset PNG + Metadata">
            <Download size={11} /> Export
          </button>
        </div>

        <div style={{ padding: 8, display: 'flex', gap: 6, alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
          <span className="opt-label">Tile Size</span>
          <select
            value={`${tw}x${th}`}
            onChange={(e) => {
              const [nw, nh] = e.target.value.split('x').map(Number);
              onUpdateTilesetConfig({ tileWidth: nw, tileHeight: nh, selectedTileIndex: 0 });
            }}
          >
            <option value="8x8">8×8</option>
            <option value="16x16">16×16</option>
            <option value="24x24">24×24</option>
            <option value="32x32">32×32</option>
            <option value="64x64">64×64</option>
          </select>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Layer: {activeLayer.name}
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 6)}, 1fr)`, gap: 4 }}>
            {Array.from({ length: totalTiles }, (_, idx) => {
              const buf = extractTile(activeCel, doc.width, doc.height, idx, tw, th);
              const isSel = idx === selIndex;
              return (
                <TileSlotPreview
                  key={idx}
                  index={idx}
                  buffer={buf}
                  tw={tw}
                  th={th}
                  selected={isSel}
                  onSelect={() => onUpdateTilesetConfig({ selectedTileIndex: idx })}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Column 2: Focused Independent Tile Editor + Transforms + Seamless 3x3 Inspector */}
      <div className="tileset-col" style={{ background: 'var(--bg-void)', padding: 12, gap: 10, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>
            Independent Tile Editor — <span style={{ color: '#efc17c' }}>#{selIndex} ({currentMeta.name})</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className={`pill-btn ${tileTool === 'pencil' ? 'active' : ''}`} onClick={() => setTileTool('pencil')}>
              <Pencil size={12} /> Pencil
            </button>
            <button className={`pill-btn ${tileTool === 'eraser' ? 'active' : ''}`} onClick={() => setTileTool('eraser')}>
              <Eraser size={12} /> Erase
            </button>
            <button className={`pill-btn ${tileTool === 'fill' ? 'active' : ''}`} onClick={() => setTileTool('fill')}>
              <PaintBucket size={12} /> Fill
            </button>
            <button className={`pill-btn ${tileTool === 'picker' ? 'active' : ''}`} onClick={() => setTileTool('picker')}>
              <Pipette size={12} /> Pick
            </button>
          </div>
        </div>

        {/* Independent Tile Transforms */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
          <span className="opt-label">Tile Transform</span>
          <button className="pill-btn" onClick={() => handleTileTransform('ccw')} data-testid="tile-rotate-ccw">
            <RotateCcw size={12} /> Rotate 90° CCW
          </button>
          <button className="pill-btn" onClick={() => handleTileTransform('cw')} data-testid="tile-rotate-cw">
            <RotateCw size={12} /> Rotate 90° CW
          </button>
          <button className="pill-btn" onClick={() => handleTileTransform('flipH')} data-testid="tile-flip-h">
            <FlipHorizontal2 size={12} /> Flip H
          </button>
          <button className="pill-btn" onClick={() => handleTileTransform('flipV')} data-testid="tile-flip-v">
            <FlipVertical2 size={12} /> Flip V
          </button>
          <button className="pill-btn" onClick={handleDuplicateTileToNext}>
            <Copy size={12} /> Duplicate Next
          </button>
          <button className="pill-btn" style={{ color: 'var(--danger)' }} onClick={handleClearTile}>
            <Trash2 size={12} /> Clear
          </button>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Main Tile Canvas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="opt-label">Tile Canvas ({tw}×{th}px) — Paint Color: {primaryColor}</span>
            <canvas
              ref={editorCanvasRef}
              data-testid="tile-editor-canvas"
              className="pixel-canvas"
              style={{ border: '1px solid var(--border-strong)', cursor: 'crosshair', maxWidth: 300 }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                isPaintingTileRef.current = true;
                workingTileRef.current = cloneBuffer(currentTileBuf);
                applyTilePixel(e.clientX, e.clientY, true);
              }}
              onPointerMove={(e) => {
                if (isPaintingTileRef.current) applyTilePixel(e.clientX, e.clientY, false);
              }}
              onPointerUp={() => {
                isPaintingTileRef.current = false;
                commitTileStroke();
              }}
            />
          </div>

          {/* 3x3 Seamless Tiling Inspector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="opt-label">3×3 Seamless Edge Check</span>
              <button className={`pill-btn ${showSeamless3x3 ? 'active' : ''}`} onClick={() => setShowSeamless3x3((v) => !v)}>
                {showSeamless3x3 ? 'On' : 'Off'}
              </button>
            </div>
            {showSeamless3x3 && (
              <canvas
                ref={seamlessCanvasRef}
                className="pixel-canvas"
                style={{ border: '1px solid var(--border-strong)', background: '#161a21' }}
              />
            )}
          </div>
        </div>

        {/* Tile Metadata & Grouping */}
        <div className="section-card">
          <div className="section-header">
            <span>Tile #{selIndex} Metadata &amp; Godot Autotile Group</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="opt-label">Name</span>
              <input
                type="text"
                value={currentMeta.name}
                onChange={(e) => onUpdateTileMeta(selIndex, { ...currentMeta, name: e.target.value })}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="opt-label">Group</span>
              <input
                type="text"
                value={currentMeta.group}
                onChange={(e) => onUpdateTileMeta(selIndex, { ...currentMeta, group: e.target.value })}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="opt-label">Terrain / Biome Tag</span>
              <input
                type="text"
                value={currentMeta.terrain}
                onChange={(e) => onUpdateTileMeta(selIndex, { ...currentMeta, terrain: e.target.value })}
              />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14 }}>
              <input
                type="checkbox"
                checked={currentMeta.solid}
                onChange={(e) => onUpdateTileMeta(selIndex, { ...currentMeta, solid: e.target.checked })}
              />
              <span>Solid Physics Collision</span>
            </label>
          </div>
        </div>
      </div>

      {/* Column 3: Interactive Live Tilemap Preview Painter */}
      <div className="tileset-col" style={{ padding: 10, gap: 8 }}>
        <div className="section-header">
          <span>Interactive Tilemap Painter</span>
          <button
            className="pill-btn"
            onClick={() =>
              onUpdateTilesetConfig({
                mapCells: doc.tileset.mapCells.map((): TilemapCell => ({
                  tileIndex: -1,
                  rotation: 0,
                  flipH: false,
                  flipV: false,
                })),
              })
            }
          >
            Clear Map
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
          <span className="opt-label">Stamp Xform</span>
          <button
            className="pill-btn"
            onClick={() => setBrushRot((((brushRot + 90) % 360) as 0 | 90 | 180 | 270))}
          >
            <RotateCw size={11} /> {brushRot}°
          </button>
          <button className={`pill-btn ${brushFlipH ? 'active' : ''}`} onClick={() => setBrushFlipH((v) => !v)}>
            Flip H
          </button>
          <button className={`pill-btn ${brushFlipV ? 'active' : ''}`} onClick={() => setBrushFlipV((v) => !v)}>
            Flip V
          </button>
          <button
            className="pill-btn"
            onClick={() =>
              onUpdateTilesetConfig({
                mapCells: doc.tileset.mapCells.map((): TilemapCell => ({
                  tileIndex: selIndex,
                  rotation: brushRot,
                  flipH: brushFlipH,
                  flipV: brushFlipV,
                })),
              })
            }
          >
            Fill All
          </button>
        </div>

        <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
          Left-click paints Tile #{selIndex}. Right-click erases cell. Verify terrain adjacency &amp; transitions live.
        </div>

        <canvas
          ref={mapCanvasRef}
          className="pixel-canvas"
          style={{ border: '1px solid var(--border-strong)', width: '100%', cursor: 'crosshair' }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            isPaintingMapRef.current = true;
            paintMapAt(e.clientX, e.clientY, e.button === 2);
          }}
          onPointerMove={(e) => {
            if (isPaintingMapRef.current) paintMapAt(e.clientX, e.clientY, e.buttons === 2);
          }}
          onPointerUp={() => {
            isPaintingMapRef.current = false;
          }}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
};

const TileSlotPreview: React.FC<{
  index: number;
  buffer: Uint8ClampedArray;
  tw: number;
  th: number;
  selected: boolean;
  onSelect: () => void;
}> = ({ index, buffer, tw, th, selected, onSelect }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.width = tw;
    c.height = th;
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, tw, th);
    ctx.putImageData(new ImageData(new Uint8ClampedArray(buffer), tw, th), 0, 0);
  }, [buffer, tw, th]);

  return (
    <button
      onClick={onSelect}
      data-tile-index={index}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 3,
        background: selected ? 'rgba(222, 136, 74, 0.22)' : 'var(--bg-surface)',
        border: `1px solid ${selected ? '#de884a' : 'var(--border-subtle)'}`,
        borderRadius: 3,
      }}
      title={`Select Tile #${index}`}
    >
      <canvas
        ref={ref}
        className="pixel-canvas"
        style={{ width: 34, height: 34, background: '#1c2028', borderRadius: 2 }}
      />
      <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{index}</span>
    </button>
  );
};
