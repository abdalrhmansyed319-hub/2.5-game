import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Download,
  Eye,
  EyeOff,
  FlipHorizontal2,
  FlipVertical2,
  FolderPlus,
  Layers,
  Lock,
  Merge,
  Plus,
  RotateCcw,
  RotateCw,
  Scissors,
  Trash2,
  Unlock,
} from 'lucide-react';
import type { LayerNode, ProjectDocument } from '../types/studio';
import { BufferThumb } from './BufferThumb';
import { bufferToCanvas, canvasToPngBlob, triggerDownload } from '../engine/exportEngine';

interface LayersPanelProps {
  doc: ProjectDocument;
  onSelectLayer: (id: string) => void;
  onAddLayer: (kind: 'layer' | 'group') => void;
  onDuplicateLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onRenameLayer: (id: string, name: string) => void;
  onToggleVisible: (id: string) => void;
  onToggleLock: (id: string) => void;
  onToggleClip: (id: string) => void;
  onToggleSolo: (id: string) => void;
  onChangeOpacity: (id: string, opacity: number) => void;
  onReorderLayer: (fromIdx: number, toIdx: number) => void;
  onMergeDown: (id: string) => void;
  onTransformLayer: (id: string, op: 'cw' | 'ccw' | 'flipH' | 'flipV') => void;
  onNotify: (msg: string) => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  doc,
  onSelectLayer,
  onAddLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onRenameLayer,
  onToggleVisible,
  onToggleLock,
  onToggleClip,
  onToggleSolo,
  onChangeOpacity,
  onReorderLayer,
  onMergeDown,
  onTransformLayer,
  onNotify,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const activeFrame = doc.frames[doc.activeFrameIndex] ?? doc.frames[0];
  const activeLayer = doc.layers.find((l) => l.id === doc.activeLayerId) ?? null;

  // Render top-most layer first (Photoshop / Aseprite convention), mapping back to bottom-up array indices
  const displayOrder = [...doc.layers].map((layer, arrayIdx) => ({ layer, arrayIdx })).reverse();

  const handleExportSingleLayer = async (layer: LayerNode) => {
    const cel = activeFrame.cels[layer.id];
    if (!cel) return;
    const canvas = bufferToCanvas(cel, doc.width, doc.height);
    const blob = await canvasToPngBlob(canvas);
    triggerDownload(blob, `${doc.name}_${layer.name.replace(/\s+/g, '_')}.png`);
    onNotify(`Exported layer "${layer.name}" as transparent PNG.`);
  };

  return (
    <>
      <div className="section-card">
        <div className="section-header">
          <span>Layer Stack ({doc.layers.length})</span>
          <div style={{ display: 'flex', gap: 3 }}>
            <button className="pill-btn" title="New Pixel Layer" onClick={() => onAddLayer('layer')}>
              <Plus size={12} /> Layer
            </button>
            <button className="pill-btn" title="New Layer Group" onClick={() => onAddLayer('group')}>
              <FolderPlus size={12} />
            </button>
          </div>
        </div>

        {/* Active Layer Properties */}
        {activeLayer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingBottom: 4, borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="opt-label" style={{ width: 50 }}>Opacity</span>
              <input
                type="range"
                min={0}
                max={100}
                value={activeLayer.opacity}
                onChange={(e) => onChangeOpacity(activeLayer.id, Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', width: 32, textAlign: 'right' }}>
                {activeLayer.opacity}%
              </span>
            </div>

            {activeLayer.kind === 'layer' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                <button
                  className={`pill-btn ${activeLayer.clipped ? 'active' : ''}`}
                  onClick={() => onToggleClip(activeLayer.id)}
                  title="Clip to layer immediately below"
                >
                  <Scissors size={11} /> Clip
                </button>
                <button
                  className={`pill-btn ${doc.soloLayerId === activeLayer.id ? 'warn-active' : ''}`}
                  onClick={() => onToggleSolo(activeLayer.id)}
                  title="Solo isolate this layer"
                >
                  Solo
                </button>
                <button className="pill-btn" onClick={() => onDuplicateLayer(activeLayer.id)} title="Duplicate Layer">
                  <Copy size={11} />
                </button>
                <button className="pill-btn" onClick={() => onMergeDown(activeLayer.id)} title="Merge Down">
                  <Merge size={11} />
                </button>
                <button className="pill-btn" onClick={() => handleExportSingleLayer(activeLayer)} title="Export Layer PNG">
                  <Download size={11} /> PNG
                </button>
              </div>
            )}

            {/* Independent Layer Transforms */}
            {activeLayer.kind === 'layer' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="opt-label">Layer Xform</span>
                <button className="pill-btn" onClick={() => onTransformLayer(activeLayer.id, 'ccw')} title="Rotate Layer 90° CCW">
                  <RotateCcw size={11} />
                </button>
                <button className="pill-btn" onClick={() => onTransformLayer(activeLayer.id, 'cw')} title="Rotate Layer 90° CW">
                  <RotateCw size={11} />
                </button>
                <button className="pill-btn" onClick={() => onTransformLayer(activeLayer.id, 'flipH')} title="Flip Layer Horizontal">
                  <FlipHorizontal2 size={11} />
                </button>
                <button className="pill-btn" onClick={() => onTransformLayer(activeLayer.id, 'flipV')} title="Flip Layer Vertical">
                  <FlipVertical2 size={11} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Layer List (Drag-and-drop + explicit up/down reorder) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 380, overflowY: 'auto' }}>
          {displayOrder.map(({ layer, arrayIdx }) => {
            const isActive = layer.id === doc.activeLayerId;
            const cel = activeFrame.cels[layer.id];
            return (
              <div
                key={layer.id}
                draggable
                onDragStart={() => setDragIdx(arrayIdx)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverIdx(arrayIdx);
                }}
                onDragLeave={() => setOverIdx(null)}
                onDrop={() => {
                  if (dragIdx !== null && dragIdx !== arrayIdx) {
                    onReorderLayer(dragIdx, arrayIdx);
                  }
                  setDragIdx(null);
                  setOverIdx(null);
                }}
                onClick={() => onSelectLayer(layer.id)}
                className={`layer-row ${isActive ? 'active' : ''} ${overIdx === arrayIdx ? 'drag-over' : ''}`}
                data-layer-id={layer.id}
              >
                <button
                  style={{ padding: 2, color: layer.visible ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                  aria-label={`Toggle visibility ${layer.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisible(layer.id);
                  }}
                >
                  {layer.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>

                <button
                  style={{ padding: 2, color: layer.locked ? '#de884a' : 'var(--text-muted)' }}
                  title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLock(layer.id);
                  }}
                >
                  {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                </button>

                {layer.kind === 'group' ? (
                  <div className="layer-thumb" style={{ display: 'grid', placeItems: 'center' }}>
                    <Layers size={13} color="#9bc2b6" />
                  </div>
                ) : cel ? (
                  <BufferThumb buffer={cel} width={doc.width} height={doc.height} className="layer-thumb" size={26} />
                ) : (
                  <div className="layer-thumb" />
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingId === layer.id ? (
                    <input
                      type="text"
                      value={draftName}
                      autoFocus
                      style={{ width: '100%', padding: '1px 4px', fontSize: 11 }}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setDraftName(e.target.value)}
                      onBlur={() => {
                        if (draftName.trim()) onRenameLayer(layer.id, draftName.trim());
                        setEditingId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (draftName.trim()) onRenameLayer(layer.id, draftName.trim());
                          setEditingId(null);
                        }
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: isActive ? 600 : 400,
                        color: layer.visible ? 'var(--text-primary)' : 'var(--text-muted)',
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingId(layer.id);
                        setDraftName(layer.name);
                      }}
                      title="Double-click to rename"
                    >
                      {layer.clipped ? '↳ ' : ''}
                      {layer.name}
                    </div>
                  )}
                  <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {layer.opacity}%{doc.soloLayerId === layer.id ? ' · SOLO' : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 1 }}>
                  <button
                    style={{ padding: 2 }}
                    title="Move Layer Up"
                    disabled={arrayIdx >= doc.layers.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorderLayer(arrayIdx, arrayIdx + 1);
                    }}
                  >
                    <ArrowUp size={11} />
                  </button>
                  <button
                    style={{ padding: 2 }}
                    title="Move Layer Down"
                    disabled={arrayIdx <= 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorderLayer(arrayIdx, arrayIdx - 1);
                    }}
                  >
                    <ArrowDown size={11} />
                  </button>
                  <button
                    style={{ padding: 2, color: 'var(--danger)' }}
                    title="Delete Layer"
                    disabled={doc.layers.length <= 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLayer(layer.id);
                    }}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
