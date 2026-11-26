import React from 'react';
import {
  Copy,
  Crop,
  FlipHorizontal2,
  FlipVertical2,
  Grid,
  Maximize2,
  RotateCcw,
  RotateCw,
  Scissors,
  SlidersHorizontal,
  Sparkles,
  Stamp,
} from 'lucide-react';
import type {
  BrushShape,
  CanvasBgMode,
  DitherPattern,
  SymmetryMode,
  ToolId,
  ToolSettings,
} from '../types/studio';

interface ToolOptionsBarProps {
  tool: ToolId;
  settings: ToolSettings;
  hasSelection: boolean;
  hasFloating: boolean;
  showPixelGrid: boolean;
  showTileGrid: boolean;
  showPivot: boolean;
  showNativePreview: boolean;
  bgMode: CanvasBgMode;
  onUpdateSettings: (patch: Partial<ToolSettings>) => void;
  onTogglePixelGrid: () => void;
  onToggleTileGrid: () => void;
  onTogglePivot: () => void;
  onToggleNativePreview: () => void;
  onBgModeChange: (m: CanvasBgMode) => void;
  onRotate90: (dir: 'cw' | 'ccw') => void;
  onFlip: (axis: 'h' | 'v') => void;
  onOpenFreeTransform: () => void;
  onCropToSelection: () => void;
  onCopySelection: () => void;
  onPasteSelection: () => void;
  onCaptureCustomBrush: () => void;
  onCommitFloating: () => void;
  onFitZoom: () => void;
}

export const ToolOptionsBar: React.FC<ToolOptionsBarProps> = ({
  tool,
  settings,
  hasSelection,
  hasFloating,
  showPixelGrid,
  showTileGrid,
  showPivot,
  showNativePreview,
  bgMode,
  onUpdateSettings,
  onTogglePixelGrid,
  onToggleTileGrid,
  onTogglePivot,
  onToggleNativePreview,
  onBgModeChange,
  onRotate90,
  onFlip,
  onOpenFreeTransform,
  onCropToSelection,
  onCopySelection,
  onPasteSelection,
  onCaptureCustomBrush,
  onCommitFloating,
  onFitZoom,
}) => {
  return (
    <div className="options-bar">
      {/* Brush Controls */}
      <div className="opt-group">
        <span className="opt-label">Size</span>
        <input
          type="number"
          min={1}
          max={32}
          value={settings.size}
          onChange={(e) => onUpdateSettings({ size: Math.max(1, Math.min(32, Number(e.target.value) || 1)) })}
          style={{ width: 44 }}
        />
        <select
          value={settings.shape}
          onChange={(e) => onUpdateSettings({ shape: e.target.value as BrushShape })}
          title="Brush Tip Shape"
        >
          <option value="square">Square</option>
          <option value="circle">Circle</option>
          <option value="diamond">Diamond</option>
          {settings.customBrush && <option value="custom">Custom Brush ({settings.customBrush.width}×{settings.customBrush.height})</option>}
        </select>
        <span className="opt-label">Op</span>
        <input
          type="number"
          min={10}
          max={100}
          step={10}
          value={settings.opacity}
          onChange={(e) => onUpdateSettings({ opacity: Math.max(10, Math.min(100, Number(e.target.value) || 100)) })}
          style={{ width: 46 }}
          title="Brush Opacity (100% keeps crisp binary alpha)"
        />
        <span className="opt-label">Step</span>
        <input
          type="number"
          min={1}
          max={16}
          value={settings.spacing}
          onChange={(e) => onUpdateSettings({ spacing: Math.max(1, Math.min(16, Number(e.target.value) || 1)) })}
          style={{ width: 38 }}
          title="Brush Stamp Spacing (px)"
        />
      </div>

      {/* Tool-specific toggles */}
      <div className="opt-group">
        {tool === 'pencil' && (
          <button
            className={`pill-btn ${settings.pixelPerfect ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ pixelPerfect: !settings.pixelPerfect })}
            title="Removes L-shaped double corners on 1px strokes"
          >
            <Sparkles size={12} /> Pixel-Perfect
          </button>
        )}
        {(tool === 'rect' || tool === 'ellipse') && (
          <button
            className={`pill-btn ${settings.filledShape ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ filledShape: !settings.filledShape })}
          >
            {settings.filledShape ? 'Filled' : 'Outline'}
          </button>
        )}
        {(tool === 'fill' || tool === 'select_wand') && (
          <button
            className={`pill-btn ${settings.contiguousFill ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ contiguousFill: !settings.contiguousFill })}
          >
            {settings.contiguousFill ? 'Contiguous' : 'All Matching'}
          </button>
        )}
        {tool === 'dither' && (
          <select
            value={settings.ditherPattern}
            onChange={(e) => onUpdateSettings({ ditherPattern: e.target.value as DitherPattern })}
            title="Dithering Pattern"
          >
            <option value="checker50">50% Checker</option>
            <option value="bayer2">Bayer 2×2</option>
            <option value="bayer4">Bayer 4×4</option>
            <option value="sparse25">25% Sparse</option>
            <option value="dense75">75% Dense</option>
            <option value="diagonal">Diagonal Hatch</option>
          </select>
        )}

        <span className="opt-label">Sym</span>
        <select
          value={settings.symmetry}
          onChange={(e) => onUpdateSettings({ symmetry: e.target.value as SymmetryMode })}
          title="Live Mirror / Radial Symmetry"
        >
          <option value="none">Off</option>
          <option value="horizontal">Mirror H</option>
          <option value="vertical">Mirror V</option>
          <option value="both">Quad (H+V)</option>
          <option value="radial4">Radial 4×</option>
          <option value="radial8">Radial 8×</option>
        </select>
      </div>

      {/* Crisp Pixel Transformations */}
      <div className="opt-group">
        <span className="opt-label">{hasSelection || hasFloating ? 'Selection' : 'Layer'}</span>
        <button className="pill-btn" onClick={() => onRotate90('ccw')} title="Rotate 90° Counter-Clockwise">
          <RotateCcw size={12} /> 90°
        </button>
        <button className="pill-btn" onClick={() => onRotate90('cw')} title="Rotate 90° Clockwise">
          <RotateCw size={12} /> 90°
        </button>
        <button className="pill-btn" onClick={() => onFlip('h')} title="Flip Horizontal (H)">
          <FlipHorizontal2 size={12} /> Flip H
        </button>
        <button className="pill-btn" onClick={() => onFlip('v')} title="Flip Vertical">
          <FlipVertical2 size={12} /> Flip V
        </button>
        <button className="pill-btn" onClick={onOpenFreeTransform} title="Free Rotate (RotSprite/Nearest), Scale & Canvas Resize">
          <SlidersHorizontal size={12} /> Transform…
        </button>
        {hasFloating && (
          <button className="pill-btn warn-active" onClick={onCommitFloating}>
            Commit Transform
          </button>
        )}
        {hasSelection && (
          <>
            <button className="pill-btn" onClick={onCopySelection} title="Copy Selection (Ctrl+C)">
              <Copy size={12} />
            </button>
            <button className="pill-btn" onClick={onCaptureCustomBrush} title="Capture Selection as Custom Brush">
              <Stamp size={12} /> Brush
            </button>
            <button className="pill-btn" onClick={onCropToSelection} title="Crop Canvas to Selection">
              <Crop size={12} /> Crop
            </button>
          </>
        )}
        <button className="pill-btn" onClick={onPasteSelection} title="Paste Floating Selection (Ctrl+V)">
          <Scissors size={12} /> Paste
        </button>
      </div>

      {/* Viewport Guides & Background */}
      <div className="opt-group">
        <button className={`pill-btn ${showPixelGrid ? 'active' : ''}`} onClick={onTogglePixelGrid} title="Toggle Pixel Grid">
          <Grid size={12} /> Px Grid
        </button>
        <button className={`pill-btn ${showTileGrid ? 'active' : ''}`} onClick={onToggleTileGrid} title="Toggle Tile Grid">
          Tile Grid
        </button>
        <button className={`pill-btn ${showPivot ? 'active' : ''}`} onClick={onTogglePivot} title="Toggle Godot Origin Pivot">
          Pivot
        </button>
        <button className={`pill-btn ${showNativePreview ? 'active' : ''}`} onClick={onToggleNativePreview} title="Toggle 1x Native Readability Preview">
          1× View
        </button>
        <select
          value={bgMode}
          onChange={(e) => onBgModeChange(e.target.value as CanvasBgMode)}
          title="Canvas Backdrop"
        >
          <option value="checker">Checkerboard</option>
          <option value="grass">Oura Meadow</option>
          <option value="forest">Forest Dark</option>
          <option value="dark">Studio Dark</option>
          <option value="light">Studio Light</option>
        </select>
        <button className="pill-btn" onClick={onFitZoom} title="Fit Canvas to Viewport">
          <Maximize2 size={12} /> Fit
        </button>
      </div>
    </div>
  );
};
