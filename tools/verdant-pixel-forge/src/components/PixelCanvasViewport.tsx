import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  CanvasBgMode,
  FloatingSelection,
  PixelSelection,
  ProjectDocument,
  QCOverlayConfig,
  QCReport,
  ToolId,
  ToolSettings,
} from '../types/studio';
import {
  cloneBuffer,
  compositeFrame,
  drawEllipseOnBuffer,
  drawLineOnBuffer,
  drawRectOnBuffer,
  filterPixelPerfectPath,
  floodFillBuffer,
  getBresenhamPoints,
  getPixel,
  hexToRgba,
  rgbaToHex,
  stampBrush,
} from '../engine/pixelBuffer';
import {
  createLassoSelection,
  createMagicWandSelection,
  createRectSelection,
  extractFloatingSelection,
  stampFloatingSelection,
} from '../engine/selectionEngine';
import { nearestPaletteHex } from '../engine/paletteEngine';

interface PixelCanvasViewportProps {
  doc: ProjectDocument;
  tool: ToolId;
  toolSettings: ToolSettings;
  primaryColor: string;
  secondaryColor: string;
  selection: PixelSelection | null;
  floating: FloatingSelection | null;
  zoom: number;
  pan: { x: number; y: number };
  showPixelGrid: boolean;
  showTileGrid: boolean;
  showPivot: boolean;
  bgMode: CanvasBgMode;
  onionSkin: { enabled: boolean; prevOpacity: number; nextOpacity: number };
  qcOverlays: QCOverlayConfig;
  qcReport: QCReport;
  showNativePreview: boolean;
  onZoomChange: (z: number) => void;
  onPanChange: (p: { x: number; y: number }) => void;
  onHoverPixel: (pos: { x: number; y: number } | null) => void;
  onCommitCelChange: (label: string, layerId: string, nextCel: Uint8ClampedArray) => void;
  onSelectionChange: (sel: PixelSelection | null) => void;
  onFloatingChange: (fl: FloatingSelection | null) => void;
  onPickColor: (hex: string, secondary?: boolean) => void;
  onNotify: (msg: string) => void;
}

export const PixelCanvasViewport: React.FC<PixelCanvasViewportProps> = ({
  doc,
  tool,
  toolSettings,
  primaryColor,
  secondaryColor,
  selection,
  floating,
  zoom,
  pan,
  showPixelGrid,
  showTileGrid,
  showPivot,
  bgMode,
  onionSkin,
  qcOverlays,
  qcReport,
  showNativePreview,
  onZoomChange,
  onPanChange,
  onHoverPixel,
  onCommitCelChange,
  onSelectionChange,
  onFloatingChange,
  onPickColor,
  onNotify,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const native1xRef = useRef<HTMLCanvasElement>(null);
  const native2xRef = useRef<HTMLCanvasElement>(null);

  const [stageSize, setStageSize] = useState({ w: 800, h: 600 });
  const [cursorPx, setCursorPx] = useState<{ x: number; y: number } | null>(null);
  const [spacePanning, setSpacePanning] = useState(false);

  // Interactive stroke refs (kept out of React state during pointermove for 60fps crisp drawing!)
  const workingBufRef = useRef<Uint8ClampedArray | null>(null);
  const strokeBaseRef = useRef<Uint8ClampedArray | null>(null);
  const strokePathRef = useRef<Array<[number, number]>>([]);
  const shapeStartRef = useRef<{ x: number; y: number } | null>(null);
  const shapeEndRef = useRef<{ x: number; y: number } | null>(null);
  const lassoPtsRef = useRef<Array<[number, number]>>([]);
  const moveStartRef = useRef<{
    startPx: { x: number; y: number };
    initialFloating: FloatingSelection | null;
    layerBase: Uint8ClampedArray | null;
  } | null>(null);
  const isDrawingRef = useRef(false);
  const isPanningRef = useRef<{ startX: number; startY: number; origPan: { x: number; y: number } } | null>(null);
  const drawButtonRef = useRef<number>(0);
  const [, setRenderTick] = useState(0);

  const activeFrame = doc.frames[doc.activeFrameIndex] ?? doc.frames[0];
  const activeLayer = doc.layers.find((l) => l.id === doc.activeLayerId) ?? doc.layers[0];
  const activePalette = doc.palettes.find((p) => p.id === doc.activePaletteId) ?? doc.palettes[0];

  // Track viewport size
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setStageSize({ w: Math.max(100, Math.floor(rect.width)), h: Math.max(100, Math.floor(rect.height)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Spacebar pan modifier
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        setSpacePanning(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpacePanning(false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // Compute screen position of canvas origin (0,0)
  const getCanvasOrigin = useCallback(() => {
    const drawW = doc.width * zoom;
    const drawH = doc.height * zoom;
    const ox = Math.floor((stageSize.w - drawW) / 2 + pan.x);
    const oy = Math.floor((stageSize.h - drawH) / 2 + pan.y);
    return { ox, oy, drawW, drawH };
  }, [doc.width, doc.height, zoom, stageSize, pan]);

  const screenToPixel = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const { ox, oy } = getCanvasOrigin();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      return {
        x: Math.floor((sx - ox) / zoom),
        y: Math.floor((sy - oy) / zoom),
      };
    },
    [getCanvasOrigin, zoom]
  );

  // Onion-skin composite buffers
  const onionPrevBuf = useMemo(() => {
    if (!onionSkin.enabled || doc.activeFrameIndex <= 0) return null;
    return compositeFrame(doc.width, doc.height, doc.layers, doc.frames[doc.activeFrameIndex - 1], null);
  }, [onionSkin.enabled, doc.activeFrameIndex, doc.width, doc.height, doc.layers, doc.frames]);

  const onionNextBuf = useMemo(() => {
    if (!onionSkin.enabled || doc.activeFrameIndex >= doc.frames.length - 1) return null;
    return compositeFrame(doc.width, doc.height, doc.layers, doc.frames[doc.activeFrameIndex + 1], null);
  }, [onionSkin.enabled, doc.activeFrameIndex, doc.width, doc.height, doc.layers, doc.frames]);

  // Resolve active painting color (respecting palette lock)
  const resolveColor = useCallback(
    (hex: string) => {
      const finalHex = doc.paletteLocked && activePalette ? nearestPaletteHex(hex, activePalette) : hex;
      return hexToRgba(finalHex, 255);
    },
    [doc.paletteLocked, activePalette]
  );

  // Composite current frame (substituting live working buffer if mid-stroke)
  const getLiveComposite = useCallback((): Uint8ClampedArray => {
    const frameForComp =
      workingBufRef.current && activeLayer
        ? {
            ...activeFrame,
            cels: {
              ...activeFrame.cels,
              [activeLayer.id]: workingBufRef.current,
            },
          }
        : activeFrame;
    const comp = compositeFrame(doc.width, doc.height, doc.layers, frameForComp, doc.soloLayerId);

    // Overlay floating selection live
    if (floating) {
      for (let ly = 0; ly < floating.height; ly++) {
        for (let lx = 0; lx < floating.width; lx++) {
          if (!floating.mask[ly * floating.width + lx]) continue;
          const tx = Math.round(floating.x + lx);
          const ty = Math.round(floating.y + ly);
          if (tx < 0 || ty < 0 || tx >= doc.width || ty >= doc.height) continue;
          const src = (ly * floating.width + lx) * 4;
          if (floating.pixels[src + 3] === 0) continue;
          const dst = (ty * doc.width + tx) * 4;
          comp[dst] = floating.pixels[src];
          comp[dst + 1] = floating.pixels[src + 1];
          comp[dst + 2] = floating.pixels[src + 2];
          comp[dst + 3] = floating.pixels[src + 3];
        }
      }
    }
    return comp;
  }, [activeFrame, activeLayer, doc.width, doc.height, doc.layers, doc.soloLayerId, floating]);

  // Main high-precision Canvas 2D renderer
  const renderViewport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.floor(stageSize.w * dpr);
    const targetH = Math.floor(stageSize.h * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, stageSize.w, stageSize.h);

    const { ox, oy, drawW, drawH } = getCanvasOrigin();

    // 1. Canvas Background Surface
    ctx.save();
    ctx.beginPath();
    ctx.rect(ox, oy, drawW, drawH);
    ctx.clip();

    if (bgMode === 'checker') {
      const cell = Math.max(8, Math.min(16, Math.floor(zoom * 2)));
      for (let y = oy; y < oy + drawH; y += cell) {
        for (let x = ox; x < ox + drawW; x += cell) {
          const even = (Math.floor((x - ox) / cell) + Math.floor((y - oy) / cell)) % 2 === 0;
          ctx.fillStyle = even ? '#262b34' : '#1d2129';
          ctx.fillRect(x, y, cell, cell);
        }
      }
    } else if (bgMode === 'grass') {
      ctx.fillStyle = '#567449';
      ctx.fillRect(ox, oy, drawW, drawH);
    } else if (bgMode === 'forest') {
      ctx.fillStyle = '#192924';
      ctx.fillRect(ox, oy, drawW, drawH);
    } else if (bgMode === 'dark') {
      ctx.fillStyle = '#14171d';
      ctx.fillRect(ox, oy, drawW, drawH);
    } else {
      ctx.fillStyle = '#dce0e6';
      ctx.fillRect(ox, oy, drawW, drawH);
    }

    // Helper to blit an RGBA buffer cleanly at integer pixel scale
    const off = document.createElement('canvas');
    off.width = doc.width;
    off.height = doc.height;
    const offCtx = off.getContext('2d')!;
    offCtx.imageSmoothingEnabled = false;

    const blitTinted = (buf: Uint8ClampedArray, tint: [number, number, number], alpha: number) => {
      const tinted = new Uint8ClampedArray(buf.length);
      for (let i = 0; i < buf.length; i += 4) {
        if (buf[i + 3] === 0) continue;
        tinted[i] = Math.round(buf[i] * 0.45 + tint[0] * 0.55);
        tinted[i + 1] = Math.round(buf[i + 1] * 0.45 + tint[1] * 0.55);
        tinted[i + 2] = Math.round(buf[i + 2] * 0.45 + tint[2] * 0.55);
        tinted[i + 3] = Math.round(buf[i + 3] * alpha);
      }
      offCtx.putImageData(new ImageData(tinted, doc.width, doc.height), 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, ox, oy, drawW, drawH);
    };

    // 2. Onion Skin Previous / Next Frames
    if (onionSkin.enabled) {
      if (onionPrevBuf) blitTinted(onionPrevBuf, [100, 178, 190], onionSkin.prevOpacity);
      if (onionNextBuf) blitTinted(onionNextBuf, [222, 136, 74], onionSkin.nextOpacity);
    }

    // 3. Composite Pixel Art Surface (with optional non-destructive Silhouette / Grayscale QC view!)
    const liveComp = getLiveComposite();
    let displayBuf = liveComp;
    if (qcOverlays.silhouette || qcOverlays.grayscale) {
      displayBuf = new Uint8ClampedArray(liveComp.length);
      for (let i = 0; i < liveComp.length; i += 4) {
        if (liveComp[i + 3] === 0) continue;
        if (qcOverlays.silhouette) {
          displayBuf[i] = 19;
          displayBuf[i + 1] = 22;
          displayBuf[i + 2] = 28;
          displayBuf[i + 3] = 255;
        } else {
          const g = Math.round(0.2126 * liveComp[i] + 0.7152 * liveComp[i + 1] + 0.0722 * liveComp[i + 2]);
          displayBuf[i] = g;
          displayBuf[i + 1] = g;
          displayBuf[i + 2] = g;
          displayBuf[i + 3] = liveComp[i + 3];
        }
      }
    }

    offCtx.putImageData(new ImageData(new Uint8ClampedArray(displayBuf), doc.width, doc.height), 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, ox, oy, drawW, drawH);

    // Update Floating Native 1x & 2x Preview Canvases
    if (showNativePreview) {
      for (const target of [native1xRef.current, native2xRef.current]) {
        if (!target) continue;
        if (target.width !== doc.width || target.height !== doc.height) {
          target.width = doc.width;
          target.height = doc.height;
        }
        const nctx = target.getContext('2d')!;
        nctx.imageSmoothingEnabled = false;
        nctx.clearRect(0, 0, doc.width, doc.height);
        nctx.drawImage(off, 0, 0);
      }
    }

    // 4. Pixel Grid (crisp hairline when zoom >= 4)
    if (showPixelGrid && zoom >= 4) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 1; x < doc.width; x++) {
        const px = Math.floor(ox + x * zoom) + 0.5;
        ctx.moveTo(px, oy);
        ctx.lineTo(px, oy + drawH);
      }
      for (let y = 1; y < doc.height; y++) {
        const py = Math.floor(oy + y * zoom) + 0.5;
        ctx.moveTo(ox, py);
        ctx.lineTo(ox + drawW, py);
      }
      ctx.stroke();
    }

    // 5. Tile Grid
    if (showTileGrid && doc.tileset.tileWidth > 0 && doc.tileset.tileHeight > 0) {
      ctx.strokeStyle = 'rgba(100, 146, 145, 0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = doc.tileset.tileWidth; x < doc.width; x += doc.tileset.tileWidth) {
        const px = Math.floor(ox + x * zoom) + 0.5;
        ctx.moveTo(px, oy);
        ctx.lineTo(px, oy + drawH);
      }
      for (let y = doc.tileset.tileHeight; y < doc.height; y += doc.tileset.tileHeight) {
        const py = Math.floor(oy + y * zoom) + 0.5;
        ctx.moveTo(ox, py);
        ctx.lineTo(ox + drawW, py);
      }
      ctx.stroke();
    }

    // 6. Symmetry Guides
    if (toolSettings.symmetry !== 'none') {
      ctx.strokeStyle = 'rgba(222, 136, 74, 0.72)';
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1;
      const midX = ox + (doc.width / 2) * zoom;
      const midY = oy + (doc.height / 2) * zoom;
      if (
        toolSettings.symmetry === 'horizontal' ||
        toolSettings.symmetry === 'both' ||
        toolSettings.symmetry === 'radial4' ||
        toolSettings.symmetry === 'radial8'
      ) {
        ctx.beginPath();
        ctx.moveTo(midX, oy);
        ctx.lineTo(midX, oy + drawH);
        ctx.stroke();
      }
      if (
        toolSettings.symmetry === 'vertical' ||
        toolSettings.symmetry === 'both' ||
        toolSettings.symmetry === 'radial4' ||
        toolSettings.symmetry === 'radial8'
      ) {
        ctx.beginPath();
        ctx.moveTo(ox, midY);
        ctx.lineTo(ox + drawW, midY);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // 7. User Guides
    if (doc.guides.length > 0) {
      ctx.strokeStyle = 'rgba(155, 194, 182, 0.75)';
      ctx.lineWidth = 1;
      for (const g of doc.guides) {
        ctx.beginPath();
        if (g.orientation === 'vertical') {
          const gx = ox + g.pos * zoom + 0.5;
          ctx.moveTo(gx, oy);
          ctx.lineTo(gx, oy + drawH);
        } else {
          const gy = oy + g.pos * zoom + 0.5;
          ctx.moveTo(ox, gy);
          ctx.lineTo(ox + drawW, gy);
        }
        ctx.stroke();
      }
    }

    // 8. Artistic Intelligence / QC Visual Overlays (Read-Only Diagnostic Markers)
    const drawMarker = (x: number, y: number, stroke: string, fill: string) => {
      ctx.fillStyle = fill;
      ctx.fillRect(ox + x * zoom, oy + y * zoom, zoom, zoom);
      if (zoom >= 3) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1;
        ctx.strokeRect(ox + x * zoom + 0.5, oy + y * zoom + 0.5, zoom - 1, zoom - 1);
      }
    };

    if (qcOverlays.orphans) {
      for (const pt of qcReport.accidentalOrphans) drawMarker(pt.x, pt.y, '#ff4d94', 'rgba(255,77,148,0.42)');
      for (const pt of qcReport.intentionalHighlights) drawMarker(pt.x, pt.y, '#4ce2ff', 'rgba(76,226,255,0.34)');
    }
    if (qcOverlays.banding) {
      for (const pt of qcReport.bandingPixels) drawMarker(pt.x, pt.y, '#f3b74b', 'rgba(243,183,75,0.38)');
    }
    if (qcOverlays.noise) {
      for (const pt of qcReport.noisePixels) drawMarker(pt.x, pt.y, '#ff7744', 'rgba(255,119,68,0.4)');
    }
    if (qcOverlays.offPalette) {
      for (const pt of qcReport.offPaletteCoords) drawMarker(pt.x, pt.y, '#ff3344', 'rgba(255,51,68,0.42)');
    }
    if (qcOverlays.semiAlpha) {
      for (const pt of qcReport.semiAlphaCoords) drawMarker(pt.x, pt.y, '#b66dff', 'rgba(182,109,255,0.45)');
    }
    if (qcOverlays.tileSeams) {
      ctx.strokeStyle = '#de884a';
      ctx.lineWidth = 2;
      ctx.strokeRect(ox + 1, oy + 1, Math.min(doc.width, doc.tileset.tileWidth) * zoom - 2, Math.min(doc.height, doc.tileset.tileHeight) * zoom - 2);
    }
    if (qcOverlays.lightVector && qcReport.lightAngleDeg !== null) {
      const cx = ox + drawW * 0.16;
      const cy = oy + drawH * 0.16;
      const rad = (qcReport.lightAngleDeg * Math.PI) / 180;
      const len = Math.min(drawW, drawH) * 0.18;
      ctx.strokeStyle = '#efc17c';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(rad) * len, cy + Math.sin(rad) * len);
      ctx.stroke();
      ctx.fillStyle = '#efc17c';
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // 9. Crisp Outer Canvas Border
    ctx.strokeStyle = '#475368';
    ctx.lineWidth = 1;
    ctx.strokeRect(ox - 0.5, oy - 0.5, drawW + 1, drawH + 1);

    // 10. Godot Pivot / Origin Crosshair
    if (showPivot) {
      const px = ox + (doc.pivot.x + 0.5) * zoom;
      const py = oy + (doc.pivot.y + 0.5) * zoom;
      ctx.strokeStyle = '#64f0c8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px - 8, py);
      ctx.lineTo(px + 8, py);
      ctx.moveTo(px, py - 8);
      ctx.lineTo(px, py + 8);
      ctx.stroke();
    }

    // 11. Active Selection / Floating Selection Outline
    const drawSelBox = (bx: number, by: number, bw: number, bh: number, color: string) => {
      ctx.save();
      ctx.strokeStyle = '#0f1216';
      ctx.lineWidth = 2;
      ctx.strokeRect(ox + bx * zoom, oy + by * zoom, bw * zoom, bh * zoom);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.25;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(ox + bx * zoom, oy + by * zoom, bw * zoom, bh * zoom);
      ctx.restore();
    };

    if (floating) {
      drawSelBox(floating.x, floating.y, floating.width, floating.height, '#efc17c');
    } else if (selection) {
      drawSelBox(selection.bounds.x, selection.bounds.y, selection.bounds.w, selection.bounds.h, '#9bc2b6');
    }

    // Live Marquee / Lasso drag preview
    if (isDrawingRef.current && tool === 'select_rect' && shapeStartRef.current && shapeEndRef.current) {
      const x0 = Math.min(shapeStartRef.current.x, shapeEndRef.current.x);
      const y0 = Math.min(shapeStartRef.current.y, shapeEndRef.current.y);
      const w = Math.abs(shapeEndRef.current.x - shapeStartRef.current.x) + 1;
      const h = Math.abs(shapeEndRef.current.y - shapeStartRef.current.y) + 1;
      drawSelBox(x0, y0, w, h, '#ffffff');
    }
    if (isDrawingRef.current && tool === 'select_lasso' && lassoPtsRef.current.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#efc17c';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      lassoPtsRef.current.forEach(([lx, ly], i) => {
        const sx = ox + (lx + 0.5) * zoom;
        const sy = oy + (ly + 0.5) * zoom;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.stroke();
      ctx.restore();
    }

    // 12. Crisp Brush Reticle
    if (cursorPx && cursorPx.x >= 0 && cursorPx.y >= 0 && cursorPx.x < doc.width && cursorPx.y < doc.height) {
      const isBrushTool = tool === 'pencil' || tool === 'eraser' || tool === 'dither';
      const bs = isBrushTool ? toolSettings.size : 1;
      const half = Math.floor((bs - 1) / 2);
      const rx = ox + (cursorPx.x - half) * zoom;
      const ry = oy + (cursorPx.y - half) * zoom;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 1;
      ctx.strokeRect(rx + 0.5, ry + 0.5, bs * zoom - 1, bs * zoom - 1);
    }
  }, [
    stageSize,
    getCanvasOrigin,
    bgMode,
    doc,
    zoom,
    onionSkin,
    onionPrevBuf,
    onionNextBuf,
    getLiveComposite,
    qcOverlays,
    qcReport,
    showNativePreview,
    showPixelGrid,
    showTileGrid,
    toolSettings,
    showPivot,
    floating,
    selection,
    tool,
    cursorPx,
  ]);

  useEffect(() => {
    renderViewport();
  }, [renderViewport]);

  // Helper to commit any active floating selection before drawing with another tool
  const anchorFloatingIfNeeded = useCallback(() => {
    if (!floating || !activeLayer || activeLayer.kind === 'group') return;
    const base = cloneBuffer(activeFrame.cels[activeLayer.id] ?? new Uint8ClampedArray(doc.width * doc.height * 4));
    const nextSel = stampFloatingSelection(base, doc.width, doc.height, floating);
    onCommitCelChange('Commit Transformed Selection', activeLayer.id, base);
    onFloatingChange(null);
    onSelectionChange(nextSel);
  }, [floating, activeLayer, activeFrame, doc.width, doc.height, onCommitCelChange, onFloatingChange, onSelectionChange]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);

    // Middle-click or Spacebar pan
    if (e.button === 1 || spacePanning) {
      isPanningRef.current = { startX: e.clientX, startY: e.clientY, origPan: { ...pan } };
      return;
    }

    const pt = screenToPixel(e.clientX, e.clientY);
    drawButtonRef.current = e.button;
    const isRight = e.button === 2;

    // Alt-click or Picker tool samples visible composite pixel color
    if (tool === 'picker' || e.altKey) {
      const comp = getLiveComposite();
      const px = getPixel(comp, doc.width, doc.height, pt.x, pt.y);
      if (px.a > 0) {
        onPickColor(rgbaToHex(px.r, px.g, px.b), isRight);
      }
      return;
    }

    if (!activeLayer || activeLayer.kind === 'group') {
      onNotify('Select a drawable pixel layer (not a folder group).');
      return;
    }
    if (activeLayer.locked) {
      onNotify(`Layer "${activeLayer.name}" is locked.`);
      return;
    }

    // Selection tools
    if (tool === 'select_rect') {
      anchorFloatingIfNeeded();
      isDrawingRef.current = true;
      shapeStartRef.current = pt;
      shapeEndRef.current = pt;
      renderViewport();
      return;
    }
    if (tool === 'select_lasso') {
      anchorFloatingIfNeeded();
      isDrawingRef.current = true;
      lassoPtsRef.current = [[pt.x, pt.y]];
      renderViewport();
      return;
    }
    if (tool === 'select_wand') {
      anchorFloatingIfNeeded();
      const cel = activeFrame.cels[activeLayer.id];
      if (!cel) return;
      const sel = createMagicWandSelection(cel, doc.width, doc.height, pt.x, pt.y, toolSettings.contiguousFill);
      onSelectionChange(sel);
      return;
    }

    // Move tool: either moves floating selection, lifts current selection, or shifts whole active layer!
    if (tool === 'move') {
      isDrawingRef.current = true;
      if (floating) {
        moveStartRef.current = { startPx: pt, initialFloating: { ...floating }, layerBase: null };
      } else if (selection) {
        const cel = cloneBuffer(activeFrame.cels[activeLayer.id]);
        const lifted = extractFloatingSelection(cel, doc.width, doc.height, selection, true);
        onCommitCelChange('Lift Selection', activeLayer.id, cel);
        onFloatingChange(lifted);
        moveStartRef.current = { startPx: pt, initialFloating: { ...lifted }, layerBase: null };
      } else {
        const cel = cloneBuffer(activeFrame.cels[activeLayer.id]);
        workingBufRef.current = cloneBuffer(cel);
        moveStartRef.current = { startPx: pt, initialFloating: null, layerBase: cel };
      }
      return;
    }

    // Anchor any pending floating transform before painting
    anchorFloatingIfNeeded();

    const baseCel = cloneBuffer(activeFrame.cels[activeLayer.id] ?? new Uint8ClampedArray(doc.width * doc.height * 4));
    const paintColor =
      tool === 'eraser'
        ? { r: 0, g: 0, b: 0, a: 0 }
        : resolveColor(isRight ? secondaryColor : primaryColor);
    const altColor = resolveColor(isRight ? primaryColor : secondaryColor);

    if (tool === 'fill') {
      const changed = floodFillBuffer(
        baseCel,
        doc.width,
        doc.height,
        pt.x,
        pt.y,
        paintColor,
        toolSettings.contiguousFill,
        selection,
        toolSettings.opacity
      );
      if (changed) {
        onCommitCelChange('Bucket Fill', activeLayer.id, baseCel);
      }
      return;
    }

    isDrawingRef.current = true;
    strokeBaseRef.current = cloneBuffer(baseCel);
    workingBufRef.current = baseCel;
    shapeStartRef.current = pt;
    shapeEndRef.current = pt;
    strokePathRef.current = [[pt.x, pt.y]];

    if (tool === 'pencil' || tool === 'eraser' || tool === 'dither') {
      stampBrush(
        workingBufRef.current,
        doc.width,
        doc.height,
        pt.x,
        pt.y,
        paintColor,
        toolSettings.size,
        toolSettings.shape,
        toolSettings.symmetry,
        selection,
        tool === 'eraser' ? 100 : toolSettings.opacity,
        tool === 'dither' ? { pattern: toolSettings.ditherPattern, secondary: isRight ? null : altColor } : null,
        toolSettings.customBrush
      );
      renderViewport();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanningRef.current) {
      const dx = e.clientX - isPanningRef.current.startX;
      const dy = e.clientY - isPanningRef.current.startY;
      onPanChange({ x: isPanningRef.current.origPan.x + dx, y: isPanningRef.current.origPan.y + dy });
      return;
    }

    const pt = screenToPixel(e.clientX, e.clientY);
    setCursorPx(pt);
    onHoverPixel(pt.x >= 0 && pt.y >= 0 && pt.x < doc.width && pt.y < doc.height ? pt : null);

    if (!isDrawingRef.current) return;

    if (tool === 'select_rect') {
      shapeEndRef.current = pt;
      renderViewport();
      return;
    }
    if (tool === 'select_lasso') {
      const last = lassoPtsRef.current[lassoPtsRef.current.length - 1];
      if (!last || last[0] !== pt.x || last[1] !== pt.y) {
        lassoPtsRef.current.push([pt.x, pt.y]);
        renderViewport();
      }
      return;
    }
    if (tool === 'move' && moveStartRef.current) {
      const dx = pt.x - moveStartRef.current.startPx.x;
      const dy = pt.y - moveStartRef.current.startPx.y;
      if (moveStartRef.current.initialFloating) {
        onFloatingChange({
          ...moveStartRef.current.initialFloating,
          x: moveStartRef.current.initialFloating.x + dx,
          y: moveStartRef.current.initialFloating.y + dy,
        });
      } else if (moveStartRef.current.layerBase) {
        const src = moveStartRef.current.layerBase;
        const next = new Uint8ClampedArray(doc.width * doc.height * 4);
        for (let y = 0; y < doc.height; y++) {
          const ty = y + dy;
          if (ty < 0 || ty >= doc.height) continue;
          for (let x = 0; x < doc.width; x++) {
            const tx = x + dx;
            if (tx < 0 || tx >= doc.width) continue;
            const s = (y * doc.width + x) * 4;
            const d = (ty * doc.width + tx) * 4;
            next[d] = src[s];
            next[d + 1] = src[s + 1];
            next[d + 2] = src[s + 2];
            next[d + 3] = src[s + 3];
          }
        }
        workingBufRef.current = next;
        renderViewport();
      }
      return;
    }

    if (!workingBufRef.current || !strokeBaseRef.current) return;
    const isRight = drawButtonRef.current === 2;
    const paintColor =
      tool === 'eraser'
        ? { r: 0, g: 0, b: 0, a: 0 }
        : resolveColor(isRight ? secondaryColor : primaryColor);
    const altColor = resolveColor(isRight ? primaryColor : secondaryColor);

    if (tool === 'pencil' || tool === 'eraser' || tool === 'dither') {
      const prev = strokePathRef.current[strokePathRef.current.length - 1];
      if (prev && prev[0] === pt.x && prev[1] === pt.y) return;

      if (toolSettings.pixelPerfect && toolSettings.size === 1 && tool === 'pencil') {
        const seg = prev ? getBresenhamPoints(prev[0], prev[1], pt.x, pt.y).slice(1) : [[pt.x, pt.y] as [number, number]];
        strokePathRef.current.push(...seg);
        const filtered = filterPixelPerfectPath(strokePathRef.current);
        const rebuilt = cloneBuffer(strokeBaseRef.current);
        for (const [fx, fy] of filtered) {
          stampBrush(
            rebuilt,
            doc.width,
            doc.height,
            fx,
            fy,
            paintColor,
            1,
            toolSettings.shape,
            toolSettings.symmetry,
            selection,
            toolSettings.opacity,
            null,
            toolSettings.customBrush
          );
        }
        workingBufRef.current = rebuilt;
      } else {
        strokePathRef.current.push([pt.x, pt.y]);
        drawLineOnBuffer(
          workingBufRef.current,
          doc.width,
          doc.height,
          prev ? prev[0] : pt.x,
          prev ? prev[1] : pt.y,
          pt.x,
          pt.y,
          paintColor,
          toolSettings.size,
          toolSettings.shape,
          toolSettings.symmetry,
          selection,
          tool === 'eraser' ? 100 : toolSettings.opacity,
          toolSettings.spacing,
          tool === 'dither' ? { pattern: toolSettings.ditherPattern, secondary: isRight ? null : altColor } : null,
          toolSettings.customBrush
        );
      }
      renderViewport();
      return;
    }

    if ((tool === 'line' || tool === 'rect' || tool === 'ellipse') && shapeStartRef.current) {
      shapeEndRef.current = pt;
      const preview = cloneBuffer(strokeBaseRef.current);
      const s = shapeStartRef.current;
      if (tool === 'line') {
        drawLineOnBuffer(
          preview,
          doc.width,
          doc.height,
          s.x,
          s.y,
          pt.x,
          pt.y,
          paintColor,
          toolSettings.size,
          toolSettings.shape,
          toolSettings.symmetry,
          selection,
          toolSettings.opacity
        );
      } else if (tool === 'rect') {
        drawRectOnBuffer(
          preview,
          doc.width,
          doc.height,
          s.x,
          s.y,
          pt.x,
          pt.y,
          paintColor,
          toolSettings.filledShape,
          toolSettings.size,
          toolSettings.shape,
          toolSettings.symmetry,
          selection,
          toolSettings.opacity
        );
      } else {
        drawEllipseOnBuffer(
          preview,
          doc.width,
          doc.height,
          s.x,
          s.y,
          pt.x,
          pt.y,
          paintColor,
          toolSettings.filledShape,
          toolSettings.size,
          toolSettings.shape,
          toolSettings.symmetry,
          selection,
          toolSettings.opacity
        );
      }
      workingBufRef.current = preview;
      renderViewport();
    }
  };

  const handlePointerUp = () => {
    if (isPanningRef.current) {
      isPanningRef.current = null;
      return;
    }
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (tool === 'select_rect' && shapeStartRef.current && shapeEndRef.current) {
      const sel = createRectSelection(
        doc.width,
        doc.height,
        shapeStartRef.current.x,
        shapeStartRef.current.y,
        shapeEndRef.current.x,
        shapeEndRef.current.y
      );
      onSelectionChange(sel);
      shapeStartRef.current = null;
      shapeEndRef.current = null;
      setRenderTick((t) => t + 1);
      return;
    }

    if (tool === 'select_lasso') {
      const sel = createLassoSelection(doc.width, doc.height, lassoPtsRef.current);
      onSelectionChange(sel);
      lassoPtsRef.current = [];
      setRenderTick((t) => t + 1);
      return;
    }

    if (tool === 'move') {
      if (moveStartRef.current?.layerBase && workingBufRef.current && activeLayer) {
        onCommitCelChange('Move Layer', activeLayer.id, workingBufRef.current);
      }
      moveStartRef.current = null;
      workingBufRef.current = null;
      setRenderTick((t) => t + 1);
      return;
    }

    if (workingBufRef.current && activeLayer) {
      const toolLabelMap: Record<string, string> = {
        pencil: 'Pencil Stroke',
        eraser: 'Erase Pixels',
        dither: 'Dither Brush',
        line: 'Draw Line',
        rect: 'Draw Rectangle',
        ellipse: 'Draw Ellipse',
      };
      onCommitCelChange(toolLabelMap[tool] || 'Paint', activeLayer.id, workingBufRef.current);
    }
    workingBufRef.current = null;
    strokeBaseRef.current = null;
    shapeStartRef.current = null;
    shapeEndRef.current = null;
    strokePathRef.current = [];
    setRenderTick((t) => t + 1);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2;
    const nextZoom = Math.max(1, Math.min(40, Number((zoom * factor).toFixed(2))));
    onZoomChange(nextZoom);
  };

  return (
    <div ref={stageRef} className="canvas-stage" style={{ cursor: spacePanning ? 'grab' : tool === 'move' ? 'move' : 'crosshair' }}>
      <div className="canvas-hud-top">
        <span className="hud-chip">
          {doc.width}×{doc.height}px
        </span>
        <span className="hud-chip">{Math.round(zoom * 100)}% ({zoom.toFixed(1)}×)</span>
        {activeLayer && <span className="hud-chip">Layer: {activeLayer.name}</span>}
        {doc.soloLayerId && <span className="hud-chip" style={{ borderColor: '#de884a', color: '#efc17c' }}>SOLO ACTIVE</span>}
        {floating && <span className="hud-chip" style={{ borderColor: '#de884a', color: '#efc17c' }}>FLOATING SELECTION (Enter to Commit)</span>}
      </div>

      {showNativePreview && (
        <div className="native-preview-float">
          <div className="native-preview-title">
            <span>NATIVE READABILITY</span>
            <span>1× / 2×</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                background: bgMode === 'grass' ? '#567449' : bgMode === 'forest' ? '#192924' : '#1f232b',
                border: '1px solid #3a4557',
                padding: 3,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <canvas
                ref={native1xRef}
                className="pixel-canvas"
                style={{ width: Math.min(128, doc.width), height: Math.min(128, doc.height) }}
              />
            </div>
            {doc.width <= 96 && (
              <div
                style={{
                  background: bgMode === 'grass' ? '#567449' : bgMode === 'forest' ? '#192924' : '#1f232b',
                  border: '1px solid #3a4557',
                  padding: 3,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <canvas
                  ref={native2xRef}
                  className="pixel-canvas"
                  style={{ width: doc.width * 2, height: doc.height * 2 }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        data-testid="pixel-viewport-canvas"
        style={{ width: '100%', height: '100%', display: 'block' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          setCursorPx(null);
          onHoverPixel(null);
        }}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
};
