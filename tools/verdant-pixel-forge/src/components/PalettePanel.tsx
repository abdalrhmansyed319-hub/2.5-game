import React, { useMemo, useRef, useState } from 'react';
import {
  Download,
  Lock,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Unlock,
  Upload,
} from 'lucide-react';
import type { PalettePreset, ProjectDocument } from '../types/studio';
import {
  analyzePaletteUsage,
  exportPaletteGPL,
  exportPaletteHex,
  generateHueShiftedRamp,
  importPaletteText,
  relativeLuminance,
  wcagContrast,
} from '../engine/paletteEngine';
import { triggerDownload } from '../engine/exportEngine';

interface PalettePanelProps {
  doc: ProjectDocument;
  composite: Uint8ClampedArray;
  primaryColor: string;
  secondaryColor: string;
  onSelectPrimary: (hex: string) => void;
  onSelectSecondary: (hex: string) => void;
  onSwitchPalette: (paletteId: string) => void;
  onTogglePaletteLock: () => void;
  onAddColorToPalette: (hex: string, name?: string, ramp?: string) => void;
  onAddColorsToPalette: (hexes: string[], rampName: string) => void;
  onRemoveColorFromPalette: (colorId: string) => void;
  onCreateCustomPalette: (name: string) => void;
  onImportPalette: (preset: PalettePreset) => void;
  onGlobalReplaceColor: (fromHex: string, toHex: string) => void;
  onNotify: (msg: string) => void;
}

export const PalettePanel: React.FC<PalettePanelProps> = ({
  doc,
  composite,
  primaryColor,
  secondaryColor,
  onSelectPrimary,
  onSelectSecondary,
  onSwitchPalette,
  onTogglePaletteLock,
  onAddColorToPalette,
  onAddColorsToPalette,
  onRemoveColorFromPalette,
  onCreateCustomPalette,
  onImportPalette,
  onGlobalReplaceColor,
  onNotify,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [newPalName, setNewPalName] = useState('');
  const [showCreatePal, setShowCreatePal] = useState(false);
  const [grayscaleSwatches, setGrayscaleSwatches] = useState(false);
  const [replaceTarget, setReplaceTarget] = useState(secondaryColor);

  const activePalette = doc.palettes.find((p) => p.id === doc.activePaletteId) ?? doc.palettes[0];
  const usage = useMemo(() => analyzePaletteUsage(composite, activePalette), [composite, activePalette]);
  const contrastRatio = useMemo(() => wcagContrast(primaryColor, secondaryColor), [primaryColor, secondaryColor]);
  const hueRampPreview = useMemo(() => generateHueShiftedRamp(primaryColor, 5, 28), [primaryColor]);

  // Group swatches by ramp name for studio readability
  const ramps = useMemo(() => {
    const map = new Map<string, typeof activePalette.colors>();
    for (const c of activePalette.colors) {
      const k = c.ramp || 'Custom';
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(c);
    }
    return Array.from(map.entries());
  }, [activePalette]);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = importPaletteText(text, file.name.replace(/\.\w+$/, ''));
    if (!parsed) {
      onNotify('Could not parse palette file (supports .gpl, .hex, .json).');
    } else {
      onImportPalette(parsed);
      onNotify(`Imported palette "${parsed.name}" (${parsed.colors.length} colors).`);
    }
    e.target.value = '';
  };

  return (
    <>
      <div className="section-card">
        <div className="section-header">
          <span>Palette Engine</span>
          <div style={{ display: 'flex', gap: 3 }}>
            <button
              className={`pill-btn ${doc.paletteLocked ? 'warn-active' : ''}`}
              onClick={onTogglePaletteLock}
              title="Lock brush colors strictly to active palette"
            >
              {doc.paletteLocked ? <Lock size={11} /> : <Unlock size={11} />}
              {doc.paletteLocked ? 'Locked' : 'Free'}
            </button>
            <button
              className={`pill-btn ${grayscaleSwatches ? 'active' : ''}`}
              onClick={() => setGrayscaleSwatches((v) => !v)}
              title="Inspect swatch luminance values in grayscale"
            >
              Value
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <select
            style={{ flex: 1 }}
            value={activePalette.id}
            onChange={(e) => onSwitchPalette(e.target.value)}
            aria-label="Active Palette"
          >
            {doc.palettes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.colors.length})
              </option>
            ))}
          </select>
          <button className="pill-btn" title="Create New Custom Palette" onClick={() => setShowCreatePal((v) => !v)}>
            <Plus size={12} />
          </button>
        </div>

        {showCreatePal && (
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              type="text"
              placeholder="Custom palette name…"
              value={newPalName}
              onChange={(e) => setNewPalName(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              className="btn-primary"
              style={{ padding: '4px 8px', fontSize: 11 }}
              onClick={() => {
                const name = newPalName.trim() || `Custom Palette ${doc.palettes.length + 1}`;
                onCreateCustomPalette(name);
                setNewPalName('');
                setShowCreatePal(false);
              }}
            >
              Create
            </button>
          </div>
        )}

        {/* Color Swatches Organized by Ramp */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 230, overflowY: 'auto' }}>
          {ramps.map(([rampName, colors]) => (
            <div key={rampName} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ fontSize: 9.5, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>{rampName}</span>
                <span>{colors.length}</span>
              </div>
              <div className="swatch-grid">
                {colors.map((c) => {
                  const isSel = c.hex.toUpperCase() === primaryColor.toUpperCase();
                  const count = usage.counts[c.hex.toUpperCase()] ?? 0;
                  const lumByte = Math.round(relativeLuminance(c.hex) * 255);
                  const displayColor = grayscaleSwatches ? `rgb(${lumByte},${lumByte},${lumByte})` : c.hex;
                  return (
                    <div
                      key={c.id}
                      className={`swatch-cell ${isSel ? 'selected' : ''}`}
                      style={{ background: displayColor }}
                      title={`${c.name} (${c.hex}) — ${count} px used · Left-click: Primary · Right-click: Secondary`}
                      onClick={() => onSelectPrimary(c.hex.toUpperCase())}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        onSelectSecondary(c.hex.toUpperCase());
                      }}
                    >
                      {c.token && <span className="swatch-token">{c.token}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Add / Remove Swatches */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => onSelectPrimary(e.target.value.toUpperCase())}
            style={{ width: 28, height: 24, border: 'none', background: 'none', cursor: 'pointer' }}
          />
          <input
            type="text"
            value={primaryColor}
            onChange={(e) => {
              if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onSelectPrimary(e.target.value.toUpperCase());
            }}
            style={{ width: 72, fontFamily: 'var(--font-mono)', fontSize: 11 }}
          />
          <button
            className="pill-btn"
            style={{ flex: 1 }}
            onClick={() => onAddColorToPalette(primaryColor, primaryColor, 'Custom')}
          >
            <Plus size={11} /> Add Swatch
          </button>
          <button
            className="pill-btn"
            title="Remove selected color from palette"
            onClick={() => {
              const found = activePalette.colors.find((c) => c.hex.toUpperCase() === primaryColor.toUpperCase());
              if (found) onRemoveColorFromPalette(found.id);
            }}
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* Hue-Shifted Ramp Assistant & Value Contrast */}
      <div className="section-card">
        <div className="section-header">
          <span>Hue-Shifted Ramp Assistant</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: contrastRatio >= 3 ? '#9bc2b6' : '#efc17c' }}>
            P/S {contrastRatio.toFixed(1)}:1
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3 }}>
          {hueRampPreview.map((hx, idx) => (
            <button
              key={idx}
              style={{
                height: 24,
                background: hx,
                border: '1px solid rgba(0,0,0,0.45)',
                borderRadius: 3,
              }}
              title={`Click to pick ${hx} (${idx === 0 ? 'Cool Shadow' : idx === 4 ? 'Warm Highlight' : 'Midtone'})`}
              onClick={() => onSelectPrimary(hx)}
            />
          ))}
        </div>
        <button
          className="pill-btn"
          onClick={() => onAddColorsToPalette(hueRampPreview, `Ramp ${primaryColor}`)}
        >
          <Sparkles size={11} /> Add 5-Step Hue-Shifted Ramp to Palette
        </button>
      </div>

      {/* Global Color Replace & Palette Audit */}
      <div className="section-card">
        <div className="section-header">
          <span>Global Replace &amp; Analysis</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 18, height: 18, borderRadius: 3, background: primaryColor, border: '1px solid #555' }} title={`From ${primaryColor}`} />
          <span>→</span>
          <input
            type="color"
            value={replaceTarget}
            onChange={(e) => setReplaceTarget(e.target.value.toUpperCase())}
            style={{ width: 24, height: 22, border: 'none', background: 'none' }}
          />
          <button
            className="pill-btn"
            style={{ flex: 1 }}
            onClick={() => onGlobalReplaceColor(primaryColor, replaceTarget)}
          >
            <RefreshCw size={11} /> Replace Across Frames
          </button>
        </div>

        <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          <span>Used: {Object.keys(usage.counts).length} colors</span>
          <span>Unused: {usage.unusedHexes.length}</span>
          <span>Off-Palette: {usage.offPaletteHexes.length}</span>
          <span>Duplicates: {usage.duplicateHexes.length}</span>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <input ref={fileRef} type="file" accept=".gpl,.hex,.txt,.json" hidden onChange={handleImportFile} />
          <button className="pill-btn" style={{ flex: 1 }} onClick={() => fileRef.current?.click()}>
            <Upload size={11} /> Import
          </button>
          <button
            className="pill-btn"
            onClick={() =>
              triggerDownload(new Blob([exportPaletteGPL(activePalette)], { type: 'text/plain' }), `${activePalette.id}.gpl`)
            }
          >
            <Download size={11} /> .GPL
          </button>
          <button
            className="pill-btn"
            onClick={() =>
              triggerDownload(new Blob([exportPaletteHex(activePalette)], { type: 'text/plain' }), `${activePalette.id}.hex`)
            }
          >
            <Download size={11} /> .HEX
          </button>
        </div>
      </div>
    </>
  );
};
