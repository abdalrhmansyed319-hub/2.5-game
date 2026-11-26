import React from 'react';
import { AlertTriangle, CheckCircle2, Eye, Info, ShieldCheck } from 'lucide-react';
import type { QCOverlayConfig, QCReport } from '../types/studio';

interface QCPanelProps {
  overlays: QCOverlayConfig;
  report: QCReport;
  onToggleOverlay: (key: keyof QCOverlayConfig) => void;
  onResetOverlays: () => void;
}

const OVERLAY_ITEMS: Array<{ key: keyof QCOverlayConfig; label: string; badgeColor: string; hint: string }> = [
  { key: 'silhouette', label: 'Silhouette Readability', badgeColor: '#e6ebf2', hint: 'Fills sprite solid dark to verify clear silhouette form.' },
  { key: 'grayscale', label: 'Grayscale Value Check', badgeColor: '#9aa5b6', hint: 'Checks light/mid/shadow hierarchy without hue distraction.' },
  { key: 'orphans', label: 'Orphans vs Catchlights', badgeColor: '#ff4d94', hint: 'Pink = likely stray orphan; Cyan = bright specular highlight.' },
  { key: 'banding', label: 'Banding Watch', badgeColor: '#f3b74b', hint: 'Flags parallel 1px stepped value hugging.' },
  { key: 'noise', label: 'Micro-Noise Hotspots', badgeColor: '#ff7744', hint: 'Highlights 3×3 high-entropy pixel clutter.' },
  { key: 'offPalette', label: 'Off-Palette Pixels', badgeColor: '#ff3344', hint: 'Marks pixels outside the currently active palette.' },
  { key: 'semiAlpha', label: 'Semi-Transparent Alpha', badgeColor: '#b66dff', hint: 'Detects accidental blur / non-binary alpha pixels.' },
  { key: 'lightVector', label: 'Dominant Light Vector', badgeColor: '#efc17c', hint: 'Estimates global luminance flow direction.' },
  { key: 'tileSeams', label: 'Tile Seam Boundary', badgeColor: '#649291', hint: 'Highlights edge wrap contrast across configured tile bounds.' },
];

export const QCPanel: React.FC<QCPanelProps> = ({
  overlays,
  report,
  onToggleOverlay,
  onResetOverlays,
}) => {
  return (
    <>
      <div className="section-card">
        <div className="section-header">
          <span>Artistic Intelligence (Read-Only)</span>
          <button className="pill-btn" onClick={onResetOverlays}>Clear All</button>
        </div>
        <div style={{ fontSize: 10.5, color: 'var(--text-muted)', lineHeight: 1.4 }}>
          <ShieldCheck size={12} style={{ verticalAlign: 'middle', marginRight: 4, color: '#9bc2b6' }} />
          Visual overlays never modify your artwork automatically. Intentional catchlights are separated from technical errors.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {OVERLAY_ITEMS.map((item) => {
            const active = overlays[item.key];
            return (
              <button
                key={item.key}
                className={`pill-btn ${active ? 'active' : ''}`}
                style={{ justifyContent: 'space-between', padding: '5px 8px' }}
                title={item.hint}
                onClick={() => onToggleOverlay(item.key)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: item.badgeColor }} />
                  {item.label}
                </span>
                <Eye size={12} style={{ opacity: active ? 1 : 0.35 }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Numeric Metrics */}
      <div className="section-card">
        <div className="section-header">
          <span>Craftsmanship Telemetry</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 10.5 }}>
          <div>Opaque: <b>{report.opaquePixels}</b></div>
          <div>Colors: <b>{report.uniqueColors}</b></div>
          <div>Stray Orphans: <b style={{ color: report.accidentalOrphans.length > 12 ? '#ff7788' : '#9bc2b6' }}>{report.accidentalOrphans.length}</b></div>
          <div>Catchlights: <b style={{ color: '#4ce2ff' }}>{report.intentionalHighlights.length}</b></div>
          <div>Banding: <b>{report.bandingPixels.length}</b></div>
          <div>Semi-Alpha: <b style={{ color: report.semiAlphaPixels > 0 ? '#b66dff' : '#9bc2b6' }}>{report.semiAlphaPixels}</b></div>
          <div>Value Range: <b>{report.minLuminance}–{report.maxLuminance}%</b></div>
          <div>Tile Seams: <b>H:{report.seamIssuesH} V:{report.seamIssuesV}</b></div>
        </div>
      </div>

      {/* Clear Human-Readable Notes */}
      <div className="section-card">
        <div className="section-header">
          <span>Diagnostic Insights</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {report.summaryNotes.map((note, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-subtle)',
                borderLeft: `3px solid ${note.severity === 'ok' ? '#7b9056' : note.severity === 'warn' ? '#de884a' : '#649291'}`,
                borderRadius: 3,
                padding: '6px 8px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600, fontSize: 11 }}>
                {note.severity === 'ok' ? (
                  <CheckCircle2 size={12} color="#7b9056" />
                ) : note.severity === 'warn' ? (
                  <AlertTriangle size={12} color="#de884a" />
                ) : (
                  <Info size={12} color="#649291" />
                )}
                {note.title}
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', lineHeight: 1.35 }}>{note.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
