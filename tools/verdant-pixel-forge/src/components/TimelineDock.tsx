import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Layers,
  Pause,
  Play,
  Plus,
  Repeat,
  Tag,
  Trash2,
} from 'lucide-react';
import type { AnimationTag, ProjectDocument } from '../types/studio';
import { compositeFrame } from '../engine/pixelBuffer';
import { BufferThumb } from './BufferThumb';

interface TimelineDockProps {
  doc: ProjectDocument;
  isPlaying: boolean;
  loopPlayback: boolean;
  speedMultiplier: number;
  activeTagId: string | null;
  onionSkin: { enabled: boolean; prevOpacity: number; nextOpacity: number };
  onSelectFrame: (index: number) => void;
  onAddFrame: () => void;
  onDuplicateFrame: (index: number) => void;
  onDeleteFrame: (index: number) => void;
  onReorderFrame: (from: number, to: number) => void;
  onSetFrameDuration: (index: number, ms: number) => void;
  onTogglePlay: () => void;
  onToggleLoop: () => void;
  onSpeedChange: (mult: number) => void;
  onOnionSkinChange: (next: { enabled: boolean; prevOpacity: number; nextOpacity: number }) => void;
  onAddTag: (tag: Omit<AnimationTag, 'id'>) => void;
  onDeleteTag: (id: string) => void;
  onSelectTag: (id: string | null) => void;
}

const PRESET_TAGS = ['Idle', 'Walk', 'Run', 'Crouch', 'Scan', 'Interact', 'Damage'];

export const TimelineDock: React.FC<TimelineDockProps> = ({
  doc,
  isPlaying,
  loopPlayback,
  speedMultiplier,
  activeTagId,
  onionSkin,
  onSelectFrame,
  onAddFrame,
  onDuplicateFrame,
  onDeleteFrame,
  onReorderFrame,
  onSetFrameDuration,
  onTogglePlay,
  onToggleLoop,
  onSpeedChange,
  onOnionSkinChange,
  onAddTag,
  onDeleteTag,
  onSelectTag,
}) => {
  const [showTagForm, setShowTagForm] = useState(false);
  const [tagName, setTagName] = useState('Walk');
  const [tagFrom, setTagFrom] = useState(0);
  const [tagTo, setTagTo] = useState(Math.max(0, doc.frames.length - 1));
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const composites = useMemo(
    () => doc.frames.map((frame) => compositeFrame(doc.width, doc.height, doc.layers, frame, null)),
    [doc.width, doc.height, doc.layers, doc.frames]
  );

  // Render live animation preview canvas in timeline corner
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const comp = composites[doc.activeFrameIndex] ?? composites[0];
    if (!comp) return;
    canvas.width = doc.width;
    canvas.height = doc.height;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, doc.width, doc.height);
    ctx.putImageData(new ImageData(new Uint8ClampedArray(comp), doc.width, doc.height), 0, 0);
  }, [composites, doc.activeFrameIndex, doc.width, doc.height]);

  return (
    <section className="timeline-dock" aria-label="Animation Timeline">
      <div className="timeline-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <button
            className={`pill-btn ${isPlaying ? 'warn-active' : ''}`}
            onClick={onTogglePlay}
            title="Play / Pause Animation"
            data-testid="timeline-play-btn"
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            className={`pill-btn ${loopPlayback ? 'active' : ''}`}
            onClick={onToggleLoop}
            title="Loop Animation"
          >
            <Repeat size={11} />
          </button>
          <select
            value={speedMultiplier}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            title="Playback Speed"
            style={{ padding: '2px 5px', fontSize: 11 }}
          >
            <option value={0.25}>0.25×</option>
            <option value={0.5}>0.5×</option>
            <option value={1}>1.0×</option>
            <option value={1.5}>1.5×</option>
            <option value={2}>2.0×</option>
          </select>

          <button className="pill-btn" onClick={onAddFrame} title="Add Blank Frame" data-testid="timeline-add-frame">
            <Plus size={12} /> Frame
          </button>
          <button
            className="pill-btn"
            onClick={() => onDuplicateFrame(doc.activeFrameIndex)}
            title="Duplicate Current Frame"
            data-testid="timeline-dup-frame"
          >
            <Copy size={11} /> Dup
          </button>

          <button
            className={`pill-btn ${onionSkin.enabled ? 'active' : ''}`}
            onClick={() => onOnionSkinChange({ ...onionSkin, enabled: !onionSkin.enabled })}
            title="Toggle Onion Skinning (Prev=Teal, Next=Amber)"
          >
            <Layers size={11} /> Onion Skin
          </button>
          {onionSkin.enabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-muted)' }}>
              <span>Prev</span>
              <input
                type="range"
                min={0.05}
                max={0.75}
                step={0.05}
                value={onionSkin.prevOpacity}
                onChange={(e) => onOnionSkinChange({ ...onionSkin, prevOpacity: Number(e.target.value) })}
                style={{ width: 52 }}
              />
              <span>Next</span>
              <input
                type="range"
                min={0.05}
                max={0.75}
                step={0.05}
                value={onionSkin.nextOpacity}
                onChange={(e) => onOnionSkinChange({ ...onionSkin, nextOpacity: Number(e.target.value) })}
                style={{ width: 52 }}
              />
            </div>
          )}
        </div>

        {/* Animation Tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto' }}>
          <button
            className={`pill-btn ${activeTagId === null ? 'active' : ''}`}
            onClick={() => onSelectTag(null)}
          >
            All ({doc.frames.length})
          </button>
          {doc.tags.map((tag) => (
            <div key={tag.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              <button
                className={`pill-btn ${activeTagId === tag.id ? 'warn-active' : ''}`}
                style={{ borderLeft: `3px solid ${tag.color}` }}
                onClick={() => onSelectTag(activeTagId === tag.id ? null : tag.id)}
              >
                {tag.name} [{tag.from + 1}–{tag.to + 1}]
              </button>
              <button
                style={{ padding: 2, color: 'var(--text-muted)' }}
                title="Delete Tag"
                onClick={() => onDeleteTag(tag.id)}
              >
                ×
              </button>
            </div>
          ))}
          <button className="pill-btn" onClick={() => setShowTagForm((v) => !v)}>
            <Tag size={11} /> +Tag
          </button>
        </div>
      </div>

      {showTagForm && (
        <div style={{ padding: '4px 10px', background: '#1b2029', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <select value={tagName} onChange={(e) => setTagName(e.target.value)} style={{ padding: '2px 6px' }}>
            {PRESET_TAGS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input
            type="text"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            placeholder="Custom tag name"
            style={{ width: 110, padding: '2px 6px' }}
          />
          <span className="opt-label">Frames</span>
          <input
            type="number"
            min={1}
            max={doc.frames.length}
            value={tagFrom + 1}
            onChange={(e) => setTagFrom(Math.max(0, Math.min(doc.frames.length - 1, Number(e.target.value) - 1)))}
            style={{ width: 44 }}
          />
          <span>to</span>
          <input
            type="number"
            min={1}
            max={doc.frames.length}
            value={tagTo + 1}
            onChange={(e) => setTagTo(Math.max(0, Math.min(doc.frames.length - 1, Number(e.target.value) - 1)))}
            style={{ width: 44 }}
          />
          <button
            className="btn-primary"
            style={{ padding: '3px 9px', fontSize: 11 }}
            onClick={() => {
              const from = Math.min(tagFrom, tagTo);
              const to = Math.max(tagFrom, tagTo);
              onAddTag({ name: tagName.trim() || 'Clip', from, to, color: '#649291' });
              setShowTagForm(false);
            }}
          >
            Add Tag
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Live Preview Box */}
        <div
          style={{
            width: 96,
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
            background: '#13171e',
            flexShrink: 0,
            gap: 2,
          }}
        >
          <canvas
            ref={previewCanvasRef}
            className="pixel-canvas"
            style={{
              width: 68,
              height: 68,
              objectFit: 'contain',
              background: '#1e232c',
              border: '1px solid var(--border-strong)',
              borderRadius: 3,
            }}
          />
          <span style={{ fontSize: 9.5, fontFamily: 'var(--font-mono)', color: isPlaying ? '#efc17c' : 'var(--text-muted)' }}>
            {isPlaying ? 'PLAYING' : 'PREVIEW'} {doc.activeFrameIndex + 1}/{doc.frames.length}
          </span>
        </div>

        {/* Scrollable Frames Strip (filters cleanly to active tag when selected!) */}
        <div className="timeline-frames">
          {doc.frames.map((frame, idx) => {
            const activeTag = activeTagId ? doc.tags.find((t) => t.id === activeTagId) : null;
            if (activeTag && (idx < activeTag.from || idx > activeTag.to)) return null;
            const isActive = idx === doc.activeFrameIndex;
            const ownerTag = doc.tags.find((t) => idx >= t.from && idx <= t.to);
            return (
              <div
                key={frame.id}
                className={`frame-card ${isActive ? 'active' : ''}`}
                onClick={() => onSelectFrame(idx)}
                data-frame-index={idx}
                title={ownerTag ? `${ownerTag.name} — Frame ${idx - ownerTag.from + 1}` : `Frame ${idx + 1}`}
              >
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', fontSize: 10 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>#{idx + 1}</span>
                  <div style={{ display: 'flex', gap: 1 }}>
                    <button
                      style={{ padding: 1 }}
                      disabled={idx === 0}
                      title="Move Left"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorderFrame(idx, idx - 1);
                      }}
                    >
                      <ArrowLeft size={10} />
                    </button>
                    <button
                      style={{ padding: 1 }}
                      disabled={idx === doc.frames.length - 1}
                      title="Move Right"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorderFrame(idx, idx + 1);
                      }}
                    >
                      <ArrowRight size={10} />
                    </button>
                    <button
                      style={{ padding: 1, color: 'var(--danger)' }}
                      disabled={doc.frames.length <= 1}
                      title="Delete Frame"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFrame(idx);
                      }}
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>

                <BufferThumb buffer={composites[idx]} width={doc.width} height={doc.height} className="frame-thumb" size={50} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <input
                    type="number"
                    min={20}
                    max={5000}
                    step={20}
                    value={frame.durationMs}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onSetFrameDuration(idx, Math.max(20, Number(e.target.value) || 100))}
                    style={{ width: 52, padding: '1px 3px', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                    title="Frame Duration (ms)"
                  />
                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>ms</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
