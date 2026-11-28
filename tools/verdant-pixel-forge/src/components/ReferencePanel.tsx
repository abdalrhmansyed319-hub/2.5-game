import React, { useEffect, useRef, useState } from 'react';
import { Columns2, FolderOpen, Pipette, Trash2, Upload, ZoomIn, ZoomOut } from 'lucide-react';
import type { ProjectDocument, ReferenceItem } from '../types/studio';
import { rgbaToHex } from '../engine/pixelBuffer';
import { BufferThumb } from './BufferThumb';

interface ReferencePanelProps {
  doc: ProjectDocument;
  composite: Uint8ClampedArray;
  onAddReference: (ref: ReferenceItem) => void;
  onRemoveReference: (id: string) => void;
  onUpdateStyleNotes: (notes: string) => void;
  onPickColor: (hex: string) => void;
  onNotify: (msg: string) => void;
}

export const ReferencePanel: React.FC<ReferencePanelProps> = ({
  doc,
  composite,
  onAddReference,
  onRemoveReference,
  onUpdateStyleNotes,
  onPickColor,
  onNotify,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const imgCanvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedRefId, setSelectedRefId] = useState<string | null>(doc.references[0]?.id ?? null);
  const [refZoom, setRefZoom] = useState(1);
  const [compareMode, setCompareMode] = useState(false);
  const [repoRefs, setRepoRefs] = useState<Array<{ id: string; label: string; category: string }>>([]);

  useEffect(() => {
    fetch('/api/repo-assets')
      .then((r) => (r.ok ? r.json() : { assets: [] }))
      .then((data) => {
        const refs = (data.assets ?? []).filter((a: { category: string }) => a.category === 'reference');
        setRepoRefs(refs);
      })
      .catch(() => {});
  }, []);

  const activeRef = doc.references.find((r) => r.id === selectedRefId) ?? doc.references[0] ?? null;

  // Draw active reference onto an offscreen/display canvas so artists can pixel-sample colors directly!
  useEffect(() => {
    const canvas = imgCanvasRef.current;
    if (!canvas || !activeRef) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0);
    };
    img.src = activeRef.dataUrl;
  }, [activeRef]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const item: ReferenceItem = {
        id: `ref_${Date.now()}`,
        name: file.name,
        dataUrl: String(reader.result),
        zoom: 1,
        panX: 0,
        panY: 0,
        notes: '',
      };
      onAddReference(item);
      setSelectedRefId(item.id);
      onNotify(`Loaded reference "${file.name}". Click image to sample colors.`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleLoadRepoRef = async (id: string, label: string) => {
    try {
      const res = await fetch(`/api/repo-assets/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = () => {
        const item: ReferenceItem = {
          id: `ref_${Date.now()}`,
          name: label,
          dataUrl: String(reader.result),
          zoom: 1,
          panX: 0,
          panY: 0,
          notes: '',
        };
        onAddReference(item);
        setSelectedRefId(item.id);
        onNotify(`Loaded studio reference: ${label}`);
      };
      reader.readAsDataURL(blob);
    } catch {
      onNotify('Failed to load repository reference image.');
    }
  };

  const handleSampleRefColor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = imgCanvasRef.current;
    if (!canvas || canvas.width === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);
    const ctx = canvas.getContext('2d')!;
    const px = ctx.getImageData(Math.max(0, Math.min(canvas.width - 1, x)), Math.max(0, Math.min(canvas.height - 1, y)), 1, 1).data;
    const hx = rgbaToHex(px[0], px[1], px[2]);
    onPickColor(hx);
    onNotify(`Sampled ${hx} from reference.`);
  };

  return (
    <>
      <div className="section-card">
        <div className="section-header">
          <span>Reference Board</span>
          <div style={{ display: 'flex', gap: 3 }}>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleUpload} />
            <button className="pill-btn" onClick={() => fileRef.current?.click()}>
              <Upload size={11} /> Load
            </button>
            <button
              className={`pill-btn ${compareMode ? 'active' : ''}`}
              onClick={() => setCompareMode((v) => !v)}
              title="Side-by-side artwork comparison"
            >
              <Columns2 size={11} /> Compare
            </button>
          </div>
        </div>

        {/* Quick Repo References */}
        {repoRefs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span className="opt-label">VERDANT SIGNAL Studio Refs</span>
            {repoRefs.map((r) => (
              <button
                key={r.id}
                className="pill-btn"
                style={{ justifyContent: 'flex-start', textAlign: 'left', overflow: 'hidden' }}
                onClick={() => handleLoadRepoRef(r.id, r.label)}
              >
                <FolderOpen size={11} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Active Reference Selector & Zoom */}
        {doc.references.length > 0 && (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <select
              style={{ flex: 1 }}
              value={activeRef?.id ?? ''}
              onChange={(e) => setSelectedRefId(e.target.value)}
            >
              {doc.references.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <button className="pill-btn" onClick={() => setRefZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}>
              <ZoomOut size={11} />
            </button>
            <button className="pill-btn" onClick={() => setRefZoom((z) => Math.min(4, Number((z + 0.25).toFixed(2))))}>
              <ZoomIn size={11} />
            </button>
            {activeRef && (
              <button className="pill-btn" onClick={() => onRemoveReference(activeRef.id)} title="Remove Reference">
                <Trash2 size={11} />
              </button>
            )}
          </div>
        )}

        {/* Reference Viewport (Click to Sample Color) */}
        {activeRef ? (
          <div
            style={{
              background: '#111419',
              border: '1px solid var(--border-subtle)',
              borderRadius: 4,
              overflow: 'auto',
              maxHeight: 220,
              padding: 4,
              display: 'flex',
              gap: 6,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <canvas
              ref={imgCanvasRef}
              onClick={handleSampleRefColor}
              title="Click any pixel to sample color into Primary swatch"
              style={{
                width: `${Math.round(refZoom * 100)}%`,
                maxWidth: compareMode ? '48%' : 'none',
                height: 'auto',
                cursor: 'crosshair',
                imageRendering: 'pixelated',
              }}
            />
            {compareMode && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>LIVE CANVAS</span>
                <BufferThumb buffer={composite} width={doc.width} height={doc.height} size={110} />
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: 14, textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)', borderRadius: 4 }}>
            <Pipette size={16} style={{ marginBottom: 4, opacity: 0.6 }} />
            <div>Load a reference above to inspect side-by-side and sample colors directly.</div>
          </div>
        )}
      </div>

      {/* Style Guide & Art Direction Notes */}
      <div className="section-card">
        <div className="section-header">
          <span>Art Direction &amp; Style Notes</span>
        </div>
        <textarea
          rows={6}
          value={doc.styleNotes}
          onChange={(e) => onUpdateStyleNotes(e.target.value)}
          style={{ width: '100%', resize: 'vertical', lineHeight: 1.45, fontSize: 11 }}
          placeholder="Document lighting direction, material contrast rules, silhouette notes…"
        />
      </div>
    </>
  );
};
