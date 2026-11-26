import React from 'react';
import {
  ArrowLeftRight,
  BoxSelect,
  Circle,
  Eraser,
  Grid2x2,
  Lasso,
  Minus,
  Move,
  PaintBucket,
  Pencil,
  Pipette,
  Square,
  Wand2,
} from 'lucide-react';
import type { ToolId } from '../types/studio';

interface LeftToolRailProps {
  tool: ToolId;
  primaryColor: string;
  secondaryColor: string;
  onSelectTool: (t: ToolId) => void;
  onSwapColors: () => void;
  onPrimaryColorChange: (hex: string) => void;
  onSecondaryColorChange: (hex: string) => void;
}

const TOOLS: Array<{ id: ToolId; label: string; key: string; icon: React.ReactNode }> = [
  { id: 'pencil', label: 'Pixel Pencil', key: 'B', icon: <Pencil size={16} /> },
  { id: 'eraser', label: 'Eraser', key: 'E', icon: <Eraser size={16} /> },
  { id: 'dither', label: 'Dither Brush', key: 'D', icon: <Grid2x2 size={16} /> },
  { id: 'fill', label: 'Bucket Fill', key: 'G', icon: <PaintBucket size={16} /> },
  { id: 'line', label: 'Pixel Line', key: 'L', icon: <Minus size={16} /> },
  { id: 'rect', label: 'Rectangle', key: 'U', icon: <Square size={16} /> },
  { id: 'ellipse', label: 'Ellipse', key: 'O', icon: <Circle size={16} /> },
  { id: 'picker', label: 'Color Picker (Alt)', key: 'I', icon: <Pipette size={16} /> },
];

const SELECT_TOOLS: Array<{ id: ToolId; label: string; key: string; icon: React.ReactNode }> = [
  { id: 'select_rect', label: 'Rectangle Selection', key: 'M', icon: <BoxSelect size={16} /> },
  { id: 'select_lasso', label: 'Freehand Selection', key: 'K', icon: <Lasso size={16} /> },
  { id: 'select_wand', label: 'Color Wand Selection', key: 'W', icon: <Wand2 size={16} /> },
  { id: 'move', label: 'Move Selection / Layer', key: 'V', icon: <Move size={16} /> },
];

export const LeftToolRail: React.FC<LeftToolRailProps> = ({
  tool,
  primaryColor,
  secondaryColor,
  onSelectTool,
  onSwapColors,
  onPrimaryColorChange,
  onSecondaryColorChange,
}) => {
  return (
    <aside className="tool-rail" aria-label="Drawing Tools">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          className={`tool-btn ${tool === t.id ? 'active' : ''}`}
          title={`${t.label} (${t.key})`}
          aria-label={t.label}
          data-tool={t.id}
          onClick={() => onSelectTool(t.id)}
        >
          {t.icon}
        </button>
      ))}

      <div className="tool-divider" />

      {SELECT_TOOLS.map((t) => (
        <button
          key={t.id}
          className={`tool-btn ${tool === t.id ? 'active' : ''}`}
          title={`${t.label} (${t.key})`}
          aria-label={t.label}
          data-tool={t.id}
          onClick={() => onSelectTool(t.id)}
        >
          {t.icon}
        </button>
      ))}

      <div className="tool-divider" />

      <div className="color-well" title="Primary & Secondary Colors (X to swap)">
        <label
          className="swatch-primary"
          style={{ background: primaryColor }}
          title={`Primary: ${primaryColor}`}
        >
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => onPrimaryColorChange(e.target.value.toUpperCase())}
            style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
          />
        </label>
        <label
          className="swatch-secondary"
          style={{ background: secondaryColor }}
          title={`Secondary: ${secondaryColor}`}
        >
          <input
            type="color"
            value={secondaryColor}
            onChange={(e) => onSecondaryColorChange(e.target.value.toUpperCase())}
            style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
          />
        </label>
      </div>

      <button
        className="tool-btn"
        style={{ height: 22 }}
        title="Swap Primary / Secondary (X)"
        onClick={onSwapColors}
      >
        <ArrowLeftRight size={13} />
      </button>
    </aside>
  );
};
