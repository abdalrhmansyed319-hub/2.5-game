import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Download,
  FilePlus2,
  FolderOpen,
  Grid3x3,
  Maximize,
  Minimize,
  Paintbrush2,
  Redo2,
  RotateCcw,
  Save,
  Sparkles,
  Undo2,
  Upload,
} from 'lucide-react';
import type {
  AnimationFrame,
  AnimationTag,
  CanvasBgMode,
  FloatingSelection,
  LayerNode,
  PalettePreset,
  PixelSelection,
  ProjectDocument,
  QCOverlayConfig,
  ReferenceItem,
  RightDockTab,
  RotateAlgorithm,
  StudioMode,
  TileMeta,
  ToolId,
  ToolSettings,
} from './types/studio';
import {
  cloneBuffer,
  compositeFrame,
  createEmptyBuffer,
} from './engine/pixelBuffer';
import {
  clearSelectionPixels,
  extractFloatingSelection,
  stampFloatingSelection,
} from './engine/selectionEngine';
import {
  cropBuffer,
  flipBufferHorizontal,
  flipBufferVertical,
  freeRotateBuffer,
  resizeCanvasBuffer,
  rotateBuffer90CCW,
  rotateBuffer90CW,
  rotateLayerInPlace,
  scaleBufferNearest,
  type Anchor9,
} from './engine/transformEngine';
import { replaceColorAcrossFrames } from './engine/paletteEngine';
import { runPixelQualityAudit } from './engine/qcEngine';
import {
  createBlankProject,
  deserializeProjectJSON,
  importPngFileAsProject,
  loadAutosaveSession,
  saveAutosaveSession,
  serializeVpfProject,
  triggerDownload,
} from './engine/exportEngine';
import { HistoryManager } from './engine/historyEngine';
import { LeftToolRail } from './components/LeftToolRail';
import { ToolOptionsBar } from './components/ToolOptionsBar';
import { PixelCanvasViewport } from './components/PixelCanvasViewport';
import { LayersPanel } from './components/LayersPanel';
import { PalettePanel } from './components/PalettePanel';
import { ReferencePanel } from './components/ReferencePanel';
import { QCPanel } from './components/QCPanel';
import { TimelineDock } from './components/TimelineDock';
import { TilesetLabView } from './components/TilesetLabView';
import { ExportModal, NewCanvasModal, RepoAssetsModal, TransformModal } from './components/Modals';

const INITIAL_QC_OVERLAYS: QCOverlayConfig = {
  silhouette: false,
  grayscale: false,
  orphans: false,
  banding: false,
  noise: false,
  offPalette: false,
  semiAlpha: false,
  lightVector: false,
  tileSeams: false,
};

export const App: React.FC = () => {
  const [doc, setDoc] = useState<ProjectDocument>(() => createBlankProject('Verdant_Hero_128', 128, 128, 16));
  const historyRef = useRef(new HistoryManager(60));
  const [, setHistoryVersion] = useState(0);

  // Studio UI State
  const [studioMode, setStudioMode] = useState<StudioMode>('sprite');
  const [rightTab, setRightTab] = useState<RightDockTab>('layers');
  const [rightDockWidth, setRightDockWidth] = useState(310);
  const [fullscreenCanvas, setFullscreenCanvas] = useState(false);
  const [tool, setTool] = useState<ToolId>('pencil');
  const [primaryColor, setPrimaryColor] = useState('#DE884A'); // Sunlit Amber
  const [secondaryColor, setSecondaryColor] = useState('#231622'); // Crevice Plum
  const [toolSettings, setToolSettings] = useState<ToolSettings>({
    size: 1,
    shape: 'square',
    opacity: 100,
    spacing: 1,
    pixelPerfect: true,
    filledShape: false,
    contiguousFill: true,
    ditherPattern: 'checker50',
    symmetry: 'none',
    customBrush: null,
  });

  // Viewport & Guides
  const [zoom, setZoom] = useState(4);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoverPx, setHoverPx] = useState<{ x: number; y: number } | null>(null);
  const [showPixelGrid, setShowPixelGrid] = useState(true);
  const [showTileGrid, setShowTileGrid] = useState(false);
  const [showPivot, setShowPivot] = useState(false);
  const [showNativePreview, setShowNativePreview] = useState(true);
  const [bgMode, setBgMode] = useState<CanvasBgMode>('checker');

  // Selection & Clipboard
  const [selection, setSelection] = useState<PixelSelection | null>(null);
  const [floating, setFloating] = useState<FloatingSelection | null>(null);
  const clipboardRef = useRef<FloatingSelection | null>(null);

  // Animation Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopPlayback, setLoopPlayback] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const [onionSkin, setOnionSkin] = useState({ enabled: false, prevOpacity: 0.35, nextOpacity: 0.25 });

  // QC Overlays
  const [qcOverlays, setQcOverlays] = useState<QCOverlayConfig>(INITIAL_QC_OVERLAYS);

  // Modals & Notifications
  const [showNewModal, setShowNewModal] = useState(false);
  const [showTransformModal, setShowTransformModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [recoverySession, setRecoverySession] = useState<{ savedAt: number; name: string; doc: ProjectDocument } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileOpenRef = useRef<HTMLInputElement>(null);

  const notify = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  // Check for IndexedDB autosave recovery on mount
  useEffect(() => {
    loadAutosaveSession().then((session) => {
      if (session && session.doc) {
        setRecoverySession(session);
      }
    });
  }, []);

  // Debounced IndexedDB autosave whenever document changes
  useEffect(() => {
    const timer = setTimeout(() => {
      saveAutosaveSession(doc);
    }, 2200);
    return () => clearTimeout(timer);
  }, [doc]);

  // Central Undoable Mutation Wrapper
  const mutateDoc = useCallback((label: string, updater: (prev: ProjectDocument) => ProjectDocument) => {
    setDoc((prev) => {
      historyRef.current.push(label, prev);
      setHistoryVersion((v) => v + 1);
      return { ...updater(prev), updatedAt: Date.now() };
    });
  }, []);

  const handleUndo = useCallback(() => {
    setDoc((curr) => {
      const res = historyRef.current.undo(curr);
      if (!res) return curr;
      setFloating(null);
      setHistoryVersion((v) => v + 1);
      notify(`Undo: ${res.label}`);
      return res.doc;
    });
  }, [notify]);

  const handleRedo = useCallback(() => {
    setDoc((curr) => {
      const res = historyRef.current.redo(curr);
      if (!res) return curr;
      setFloating(null);
      setHistoryVersion((v) => v + 1);
      notify(`Redo: ${res.label}`);
      return res.doc;
    });
  }, [notify]);

  // Active Frame Composite & Live QC Audit
  const activeFrame = doc.frames[doc.activeFrameIndex] ?? doc.frames[0];
  const activePalette = doc.palettes.find((p) => p.id === doc.activePaletteId) ?? doc.palettes[0];
  const activeComposite = useMemo(
    () => compositeFrame(doc.width, doc.height, doc.layers, activeFrame, doc.soloLayerId),
    [doc.width, doc.height, doc.layers, activeFrame, doc.soloLayerId]
  );

  const qcReport = useMemo(
    () =>
      runPixelQualityAudit(
        activeComposite,
        doc.width,
        doc.height,
        activePalette,
        doc.tileset.tileWidth,
        doc.tileset.tileHeight
      ),
    [activeComposite, doc.width, doc.height, activePalette, doc.tileset.tileWidth, doc.tileset.tileHeight]
  );

  // Animation Playback Loop
  useEffect(() => {
    if (!isPlaying || doc.frames.length <= 1) return;
    const tag = activeTagId ? doc.tags.find((t) => t.id === activeTagId) : null;
    const minIdx = tag ? Math.max(0, tag.from) : 0;
    const maxIdx = tag ? Math.min(doc.frames.length - 1, tag.to) : doc.frames.length - 1;
    const currentDelay = Math.max(25, Math.round((activeFrame?.durationMs ?? 120) / speedMultiplier));

    const timer = setTimeout(() => {
      setDoc((prev) => {
        const nextIdx = prev.activeFrameIndex + 1;
        if (nextIdx > maxIdx) {
          if (loopPlayback) {
            return { ...prev, activeFrameIndex: minIdx };
          }
          setIsPlaying(false);
          return prev;
        }
        return { ...prev, activeFrameIndex: Math.max(minIdx, nextIdx) };
      });
    }, currentDelay);

    return () => clearTimeout(timer);
  }, [isPlaying, doc.frames.length, doc.activeFrameIndex, doc.tags, activeTagId, activeFrame?.durationMs, speedMultiplier, loopPlayback]);

  // Commit Single Cel Change
  const handleCommitCelChange = useCallback(
    (label: string, layerId: string, nextCel: Uint8ClampedArray) => {
      mutateDoc(label, (prev) => {
        const nextFrames = prev.frames.map((f, idx) =>
          idx === prev.activeFrameIndex ? { ...f, cels: { ...f.cels, [layerId]: cloneBuffer(nextCel) } } : f
        );
        return { ...prev, frames: nextFrames };
      });
    },
    [mutateDoc]
  );

  // Commit Floating Selection back into Active Layer
  const commitFloating = useCallback(() => {
    if (!floating) return;
    const layer = doc.layers.find((l) => l.id === doc.activeLayerId && l.kind === 'layer');
    if (!layer) return;
    const base = cloneBuffer(activeFrame.cels[layer.id] ?? createEmptyBuffer(doc.width, doc.height));
    const nextSel = stampFloatingSelection(base, doc.width, doc.height, floating);
    handleCommitCelChange('Commit Selection Transform', layer.id, base);
    setFloating(null);
    setSelection(nextSel);
    notify('Committed transformed selection.');
  }, [floating, doc.layers, doc.activeLayerId, activeFrame, doc.width, doc.height, handleCommitCelChange, notify]);

  // Ensure Selection is Lifted to Floating before Transforming
  const ensureFloatingForSelection = useCallback((): FloatingSelection | null => {
    if (floating) return floating;
    if (!selection) return null;
    const layer = doc.layers.find((l) => l.id === doc.activeLayerId && l.kind === 'layer');
    if (!layer) return null;
    const base = cloneBuffer(activeFrame.cels[layer.id] ?? createEmptyBuffer(doc.width, doc.height));
    const lifted = extractFloatingSelection(base, doc.width, doc.height, selection, true);
    handleCommitCelChange('Lift Selection for Transform', layer.id, base);
    return lifted;
  }, [floating, selection, doc.layers, doc.activeLayerId, activeFrame, doc.width, doc.height, handleCommitCelChange]);

  // Selection OR Active Layer Rotate 90° CW/CCW & Flip H/V
  const handleRotate90 = useCallback(
    (dir: 'cw' | 'ccw') => {
      if (floating || selection) {
        const fl = ensureFloatingForSelection();
        if (!fl) return;
        const res =
          dir === 'cw'
            ? rotateBuffer90CW(fl.pixels, fl.width, fl.height, fl.mask)
            : rotateBuffer90CCW(fl.pixels, fl.width, fl.height, fl.mask);
        const cx = fl.x + fl.width / 2;
        const cy = fl.y + fl.height / 2;
        setFloating({
          x: Math.round(cx - res.width / 2),
          y: Math.round(cy - res.height / 2),
          width: res.width,
          height: res.height,
          pixels: res.pixels,
          mask: res.mask ?? new Uint8Array(res.width * res.height).fill(1),
        });
        notify(`Rotated selected artwork 90° ${dir.toUpperCase()} (press Enter or draw to commit).`);
        return;
      }

      const layer = doc.layers.find((l) => l.id === doc.activeLayerId && l.kind === 'layer');
      if (!layer || layer.locked) return;
      const cel = activeFrame.cels[layer.id];
      if (!cel) return;
      const rotated = rotateLayerInPlace(cel, doc.width, doc.height, dir);
      handleCommitCelChange(`Rotate Layer 90° ${dir.toUpperCase()}`, layer.id, rotated);
      notify(`Rotated layer "${layer.name}" 90° ${dir.toUpperCase()}.`);
    },
    [floating, selection, ensureFloatingForSelection, doc.layers, doc.activeLayerId, activeFrame, doc.width, doc.height, handleCommitCelChange, notify]
  );

  const handleFlip = useCallback(
    (axis: 'h' | 'v') => {
      if (floating || selection) {
        const fl = ensureFloatingForSelection();
        if (!fl) return;
        const res =
          axis === 'h'
            ? flipBufferHorizontal(fl.pixels, fl.width, fl.height, fl.mask)
            : flipBufferVertical(fl.pixels, fl.width, fl.height, fl.mask);
        setFloating({
          ...fl,
          pixels: res.pixels,
          mask: res.mask ?? fl.mask,
        });
        notify(`Flipped selected artwork ${axis === 'h' ? 'Horizontally' : 'Vertically'}.`);
        return;
      }

      const layer = doc.layers.find((l) => l.id === doc.activeLayerId && l.kind === 'layer');
      if (!layer || layer.locked) return;
      const cel = activeFrame.cels[layer.id];
      if (!cel) return;
      const flipped =
        axis === 'h'
          ? flipBufferHorizontal(cel, doc.width, doc.height).pixels
          : flipBufferVertical(cel, doc.width, doc.height).pixels;
      handleCommitCelChange(`Flip Layer ${axis.toUpperCase()}`, layer.id, flipped);
      notify(`Flipped layer "${layer.name}" ${axis === 'h' ? 'Horizontally' : 'Vertically'}.`);
    },
    [floating, selection, ensureFloatingForSelection, doc.layers, doc.activeLayerId, activeFrame, doc.width, doc.height, handleCommitCelChange, notify]
  );

  const handleFreeRotate = useCallback(
    (angleDeg: number, algorithm: RotateAlgorithm) => {
      if (floating || selection) {
        const fl = ensureFloatingForSelection();
        if (!fl) return;
        const res = freeRotateBuffer(fl.pixels, fl.width, fl.height, angleDeg, algorithm, false);
        const cx = fl.x + fl.width / 2;
        const cy = fl.y + fl.height / 2;
        setFloating({
          x: Math.round(cx - res.width / 2),
          y: Math.round(cy - res.height / 2),
          width: res.width,
          height: res.height,
          pixels: res.pixels,
          mask: res.mask ?? new Uint8Array(res.width * res.height).fill(1),
        });
        notify(`Free-rotated selection ${angleDeg}° (${algorithm}).`);
        return;
      }

      const layer = doc.layers.find((l) => l.id === doc.activeLayerId && l.kind === 'layer');
      if (!layer || layer.locked) return;
      const cel = activeFrame.cels[layer.id];
      if (!cel) return;
      const res = freeRotateBuffer(cel, doc.width, doc.height, angleDeg, algorithm, true);
      handleCommitCelChange(`Free Rotate ${angleDeg}°`, layer.id, res.pixels);
      notify(`Free-rotated layer "${layer.name}" ${angleDeg}° (${algorithm}).`);
    },
    [floating, selection, ensureFloatingForSelection, doc.layers, doc.activeLayerId, activeFrame, doc.width, doc.height, handleCommitCelChange, notify]
  );

  const handleScaleNearest = useCallback(
    (scalePct: number) => {
      const factor = scalePct / 100;
      if (floating || selection) {
        const fl = ensureFloatingForSelection();
        if (!fl) return;
        const nw = Math.max(1, Math.round(fl.width * factor));
        const nh = Math.max(1, Math.round(fl.height * factor));
        const res = scaleBufferNearest(fl.pixels, fl.width, fl.height, nw, nh);
        setFloating({
          x: fl.x,
          y: fl.y,
          width: res.width,
          height: res.height,
          pixels: res.pixels,
          mask: res.mask ?? new Uint8Array(res.width * res.height).fill(1),
        });
        notify(`Scaled selection to ${scalePct}% (Nearest-Neighbor).`);
        return;
      }

      const nw = Math.max(8, Math.min(512, Math.round(doc.width * factor)));
      const nh = Math.max(8, Math.min(512, Math.round(doc.height * factor)));
      mutateDoc(`Scale Canvas ${scalePct}%`, (prev) => ({
        ...prev,
        width: nw,
        height: nh,
        pivot: { x: Math.round(prev.pivot.x * factor), y: Math.round(prev.pivot.y * factor) },
        frames: prev.frames.map((f) => ({
          ...f,
          cels: Object.fromEntries(
            Object.entries(f.cels).map(([lid, buf]) => [
              lid,
              scaleBufferNearest(buf, prev.width, prev.height, nw, nh).pixels,
            ])
          ),
        })),
      }));
      setSelection(null);
      setFloating(null);
      notify(`Scaled canvas to ${nw}×${nh} (Nearest-Neighbor).`);
    },
    [floating, selection, ensureFloatingForSelection, doc.width, doc.height, mutateDoc, notify]
  );

  const handleResizeCanvas = useCallback(
    (newW: number, newH: number, anchor: Anchor9) => {
      const nw = Math.max(8, Math.min(512, newW));
      const nh = Math.max(8, Math.min(512, newH));
      mutateDoc(`Resize Canvas ${nw}×${nh}`, (prev) => ({
        ...prev,
        width: nw,
        height: nh,
        frames: prev.frames.map((f) => ({
          ...f,
          cels: Object.fromEntries(
            Object.entries(f.cels).map(([lid, buf]) => [
              lid,
              resizeCanvasBuffer(buf, prev.width, prev.height, nw, nh, anchor),
            ])
          ),
        })),
      }));
      setSelection(null);
      setFloating(null);
      notify(`Resized canvas bounds to ${nw}×${nh}.`);
    },
    [mutateDoc, notify]
  );

  const handleCropToSelection = useCallback(() => {
    if (!selection) return;
    const { x, y, w, h } = selection.bounds;
    mutateDoc('Crop to Selection', (prev) => ({
      ...prev,
      width: w,
      height: h,
      pivot: { x: Math.max(0, Math.min(w - 1, prev.pivot.x - x)), y: Math.max(0, Math.min(h - 1, prev.pivot.y - y)) },
      frames: prev.frames.map((f) => ({
        ...f,
        cels: Object.fromEntries(
          Object.entries(f.cels).map(([lid, buf]) => [lid, cropBuffer(buf, prev.width, prev.height, x, y, w, h).pixels])
        ),
      })),
    }));
    setSelection(null);
    setFloating(null);
    notify(`Cropped canvas to ${w}×${h}.`);
  }, [selection, mutateDoc, notify]);

  const handleCopySelection = useCallback(() => {
    if (floating) {
      clipboardRef.current = {
        ...floating,
        pixels: cloneBuffer(floating.pixels),
        mask: new Uint8Array(floating.mask),
      };
      notify(`Copied ${floating.width}×${floating.height} selection.`);
      return;
    }
    if (!selection) return;
    const layer = doc.layers.find((l) => l.id === doc.activeLayerId && l.kind === 'layer');
    if (!layer) return;
    const cel = activeFrame.cels[layer.id];
    if (!cel) return;
    clipboardRef.current = extractFloatingSelection(cel, doc.width, doc.height, selection, false);
    notify(`Copied ${selection.bounds.w}×${selection.bounds.h} pixels.`);
  }, [floating, selection, doc.layers, doc.activeLayerId, activeFrame, doc.width, doc.height, notify]);

  const handlePasteSelection = useCallback(() => {
    const clip = clipboardRef.current;
    if (!clip) {
      notify('Clipboard is empty. Select an area and press Ctrl+C first.');
      return;
    }
    setFloating({
      ...clip,
      x: Math.min(doc.width - 1, clip.x + 4),
      y: Math.min(doc.height - 1, clip.y + 4),
      pixels: cloneBuffer(clip.pixels),
      mask: new Uint8Array(clip.mask),
    });
    setTool('move');
    notify('Pasted floating selection (drag to place, Enter to commit).');
  }, [doc.width, doc.height, notify]);

  const handleCaptureCustomBrush = useCallback(() => {
    if (!selection) return;
    const layer = doc.layers.find((l) => l.id === doc.activeLayerId && l.kind === 'layer');
    if (!layer) return;
    const cel = activeFrame.cels[layer.id];
    if (!cel) return;
    const extracted = extractFloatingSelection(cel, doc.width, doc.height, selection, false);
    setToolSettings((s) => ({
      ...s,
      shape: 'custom',
      customBrush: {
        width: extracted.width,
        height: extracted.height,
        pixels: extracted.pixels,
        colorMode: 'stamp',
      },
    }));
    setTool('pencil');
    notify(`Captured ${extracted.width}×${extracted.height} custom pixel brush!`);
  }, [selection, doc.layers, doc.activeLayerId, activeFrame, doc.width, doc.height, notify]);

  // ============================================================================
  // LAYER OPERATIONS
  // ============================================================================
  const handleAddLayer = (kind: 'layer' | 'group') => {
    const id = `${kind}_${Date.now()}`;
    const num = doc.layers.length + 1;
    const node: LayerNode = {
      id,
      name: kind === 'group' ? `Group ${num}` : `Layer ${num}`,
      kind,
      parentId: null,
      visible: true,
      locked: false,
      opacity: 100,
      clipped: false,
    };
    mutateDoc(`Add ${node.name}`, (prev) => ({
      ...prev,
      layers: [...prev.layers, node],
      activeLayerId: id,
      frames:
        kind === 'layer'
          ? prev.frames.map((f) => ({
              ...f,
              cels: { ...f.cels, [id]: createEmptyBuffer(prev.width, prev.height) },
            }))
          : prev.frames,
    }));
  };

  const handleDuplicateLayer = (layerId: string) => {
    const src = doc.layers.find((l) => l.id === layerId);
    if (!src) return;
    const newId = `layer_${Date.now()}`;
    const copy: LayerNode = { ...src, id: newId, name: `${src.name} Copy` };
    mutateDoc(`Duplicate ${src.name}`, (prev) => {
      const idx = prev.layers.findIndex((l) => l.id === layerId);
      const nextLayers = [...prev.layers];
      nextLayers.splice(idx + 1, 0, copy);
      return {
        ...prev,
        layers: nextLayers,
        activeLayerId: newId,
        frames: prev.frames.map((f) => ({
          ...f,
          cels:
            src.kind === 'layer'
              ? {
                  ...f.cels,
                  [newId]: cloneBuffer(f.cels[layerId] ?? createEmptyBuffer(prev.width, prev.height)),
                }
              : f.cels,
        })),
      };
    });
  };

  const handleDeleteLayer = (layerId: string) => {
    if (doc.layers.length <= 1) return;
    mutateDoc('Delete Layer', (prev) => {
      const nextLayers = prev.layers.filter((l) => l.id !== layerId);
      const nextActive = prev.activeLayerId === layerId ? nextLayers[nextLayers.length - 1].id : prev.activeLayerId;
      return {
        ...prev,
        layers: nextLayers,
        activeLayerId: nextActive,
        soloLayerId: prev.soloLayerId === layerId ? null : prev.soloLayerId,
        frames: prev.frames.map((f) => {
          const nextCels = { ...f.cels };
          delete nextCels[layerId];
          return { ...f, cels: nextCels };
        }),
      };
    });
  };

  const handleReorderLayer = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= doc.layers.length || toIdx >= doc.layers.length) return;
    mutateDoc('Reorder Layers', (prev) => {
      const arr = [...prev.layers];
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return { ...prev, layers: arr };
    });
  };

  const handleMergeDown = (layerId: string) => {
    const idx = doc.layers.findIndex((l) => l.id === layerId);
    if (idx <= 0) {
      notify('No layer below to merge into.');
      return;
    }
    const upper = doc.layers[idx];
    const lower = doc.layers[idx - 1];
    if (upper.kind !== 'layer' || lower.kind !== 'layer') return;
    mutateDoc(`Merge ${upper.name} Down`, (prev) => ({
      ...prev,
      layers: prev.layers.filter((l) => l.id !== layerId),
      activeLayerId: lower.id,
      frames: prev.frames.map((f) => {
        const merged = compositeFrame(prev.width, prev.height, [lower, upper], f, null);
        const nextCels = { ...f.cels, [lower.id]: merged };
        delete nextCels[layerId];
        return { ...f, cels: nextCels };
      }),
    }));
    notify(`Merged "${upper.name}" into "${lower.name}".`);
  };

  const handleTransformSpecificLayer = (layerId: string, op: 'cw' | 'ccw' | 'flipH' | 'flipV') => {
    const layer = doc.layers.find((l) => l.id === layerId);
    if (!layer || layer.locked || layer.kind !== 'layer') return;
    const cel = activeFrame.cels[layerId];
    if (!cel) return;
    let next: Uint8ClampedArray;
    if (op === 'flipH') next = flipBufferHorizontal(cel, doc.width, doc.height).pixels;
    else if (op === 'flipV') next = flipBufferVertical(cel, doc.width, doc.height).pixels;
    else next = rotateLayerInPlace(cel, doc.width, doc.height, op);
    handleCommitCelChange(`Layer ${layer.name} (${op})`, layerId, next);
    notify(`Transformed layer "${layer.name}" (${op.toUpperCase()}).`);
  };

  // ============================================================================
  // ANIMATION FRAME OPERATIONS
  // ============================================================================
  const handleAddFrame = () => {
    const newId = `frame_${Date.now()}`;
    mutateDoc('Add Frame', (prev) => {
      const cels: Record<string, Uint8ClampedArray> = {};
      for (const l of prev.layers) {
        if (l.kind === 'layer') cels[l.id] = createEmptyBuffer(prev.width, prev.height);
      }
      const nextFrames: AnimationFrame[] = [...prev.frames];
      nextFrames.splice(prev.activeFrameIndex + 1, 0, { id: newId, durationMs: 140, cels });
      return { ...prev, frames: nextFrames, activeFrameIndex: prev.activeFrameIndex + 1 };
    });
  };

  const handleDuplicateFrame = (index: number) => {
    const src = doc.frames[index];
    if (!src) return;
    const newId = `frame_${Date.now()}`;
    mutateDoc('Duplicate Frame', (prev) => {
      const clonedCels: Record<string, Uint8ClampedArray> = {};
      for (const [lid, buf] of Object.entries(src.cels)) clonedCels[lid] = cloneBuffer(buf);
      const nextFrames = [...prev.frames];
      nextFrames.splice(index + 1, 0, { id: newId, durationMs: src.durationMs, cels: clonedCels });
      return { ...prev, frames: nextFrames, activeFrameIndex: index + 1 };
    });
  };

  const handleDeleteFrame = (index: number) => {
    if (doc.frames.length <= 1) return;
    mutateDoc('Delete Frame', (prev) => {
      const nextFrames = prev.frames.filter((_, i) => i !== index);
      return {
        ...prev,
        frames: nextFrames,
        activeFrameIndex: Math.min(prev.activeFrameIndex, nextFrames.length - 1),
      };
    });
  };

  const handleReorderFrame = (from: number, to: number) => {
    if (to < 0 || to >= doc.frames.length || from === to) return;
    mutateDoc('Reorder Frames', (prev) => {
      const nextFrames = [...prev.frames];
      const [moved] = nextFrames.splice(from, 1);
      nextFrames.splice(to, 0, moved);
      return { ...prev, frames: nextFrames, activeFrameIndex: to };
    });
  };

  // ============================================================================
  // PROJECT OPEN / SAVE / REPO ASSET LOADING
  // ============================================================================
  const handleSaveProjectFile = useCallback(() => {
    const json = serializeVpfProject(doc);
    const safeName = doc.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    triggerDownload(new Blob([json], { type: 'application/json' }), `${safeName}.vpf.json`);
    notify(`Saved editable project "${safeName}.vpf.json".`);
  }, [doc, notify]);

  const handleOpenLocalFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      let loaded: ProjectDocument;
      if (file.name.toLowerCase().endsWith('.png')) {
        loaded = await importPngFileAsProject(file);
      } else {
        const text = await file.text();
        loaded = deserializeProjectJSON(text, file.name.replace(/\.(vpf|source)?\.json$/i, ''));
      }
      historyRef.current.clear();
      setDoc(loaded);
      setSelection(null);
      setFloating(null);
      setZoom(loaded.width <= 64 ? 7 : loaded.width <= 128 ? 4 : 2);
      setPan({ x: 0, y: 0 });
      setIsPlaying(false);
      notify(`Opened "${loaded.name}" (${loaded.width}×${loaded.height}, ${loaded.layers.length} layers, ${loaded.frames.length} frames).`);
    } catch (err) {
      notify(`Open failed: ${err instanceof Error ? err.message : 'Invalid file'}`);
    }
    e.target.value = '';
  };

  const handleLoadRepoSource = async (assetId: string, label: string) => {
    try {
      const res = await fetch(`/api/repo-assets/${encodeURIComponent(assetId)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const loaded = deserializeProjectJSON(text, label);
      historyRef.current.clear();
      setDoc(loaded);
      setSelection(null);
      setFloating(null);
      setZoom(loaded.width <= 24 ? 16 : loaded.width <= 64 ? 8 : loaded.width <= 128 ? 4 : 2);
      setPan({ x: 0, y: 0 });
      setIsPlaying(false);
      notify(`Loaded repository asset "${loaded.name}" (${loaded.layers.length} editable layers).`);
    } catch (err) {
      notify(`Failed to load repo asset: ${err instanceof Error ? err.message : 'error'}`);
    }
  };

  // ============================================================================
  // GLOBAL STUDIO KEYBOARD SHORTCUTS
  // ============================================================================
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (mod && key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if ((mod && key === 'z' && e.shiftKey) || (mod && key === 'y')) {
        e.preventDefault();
        handleRedo();
        return;
      }
      if (mod && key === 's') {
        e.preventDefault();
        handleSaveProjectFile();
        return;
      }
      if (mod && key === 'c') {
        e.preventDefault();
        handleCopySelection();
        return;
      }
      if (mod && key === 'v') {
        e.preventDefault();
        handlePasteSelection();
        return;
      }
      if (key === 'enter' && floating) {
        e.preventDefault();
        commitFloating();
        return;
      }
      if (key === 'escape') {
        if (floating) commitFloating();
        setSelection(null);
        return;
      }
      if ((key === 'delete' || key === 'backspace') && (selection || floating)) {
        e.preventDefault();
        if (floating) {
          setFloating(null);
        } else if (selection) {
          const layer = doc.layers.find((l) => l.id === doc.activeLayerId && l.kind === 'layer');
          if (layer && !layer.locked) {
            const cel = cloneBuffer(activeFrame.cels[layer.id]);
            clearSelectionPixels(cel, doc.width, doc.height, selection);
            handleCommitCelChange('Clear Selection', layer.id, cel);
          }
        }
        return;
      }

      if (mod) return;

      const toolMap: Record<string, ToolId> = {
        b: 'pencil',
        e: 'eraser',
        d: 'dither',
        g: 'fill',
        l: 'line',
        u: 'rect',
        o: 'ellipse',
        i: 'picker',
        m: 'select_rect',
        k: 'select_lasso',
        w: 'select_wand',
        v: 'move',
      };
      if (toolMap[key]) {
        setTool(toolMap[key]);
        return;
      }
      if (key === 'x') {
        setPrimaryColor(secondaryColor);
        setSecondaryColor(primaryColor);
      } else if (key === 'h') {
        handleFlip('h');
      } else if (key === '[') {
        setToolSettings((s) => ({ ...s, size: Math.max(1, s.size - 1) }));
      } else if (key === ']') {
        setToolSettings((s) => ({ ...s, size: Math.min(32, s.size + 1) }));
      } else if (key === 'f') {
        setFullscreenCanvas((v) => !v);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    handleUndo,
    handleRedo,
    handleSaveProjectFile,
    handleCopySelection,
    handlePasteSelection,
    floating,
    commitFloating,
    selection,
    doc.layers,
    doc.activeLayerId,
    activeFrame,
    doc.width,
    doc.height,
    handleCommitCelChange,
    primaryColor,
    secondaryColor,
    handleFlip,
  ]);

  // Adjustable Right Dock Resizer
  const startDockResize = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startW = rightDockWidth;
    const move = (ev: MouseEvent) => {
      setRightDockWidth(Math.max(250, Math.min(480, startW + (startX - ev.clientX))));
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const histStats = historyRef.current.getStats();

  return (
    <div className="studio-shell">
      {/* TOP STUDIO MENU BAR */}
      <header className="top-bar">
        <div className="brand-cluster">
          <div className="brand-mark">VF</div>
          <div>
            <div className="brand-title">VERDANT PIXEL FORGE</div>
            <div className="brand-sub">{doc.name} · {doc.width}×{doc.height}</div>
          </div>

          <div className="menu-strip" style={{ marginLeft: 8 }}>
            <button className="menu-btn" onClick={() => setShowNewModal(true)} data-testid="btn-new-canvas">
              <FilePlus2 size={13} /> New
            </button>
            <input ref={fileOpenRef} type="file" accept=".json,.png" hidden onChange={handleOpenLocalFile} data-testid="file-open-input" />
            <button className="menu-btn" onClick={() => fileOpenRef.current?.click()} data-testid="btn-open-file">
              <Upload size={13} /> Open
            </button>
            <button className="menu-btn" onClick={() => setShowRepoModal(true)} data-testid="btn-repo-assets">
              <FolderOpen size={13} /> Studio Assets
            </button>
            <button className="menu-btn" onClick={handleSaveProjectFile} data-testid="btn-save-project" title="Save editable .vpf.json (Ctrl+S)">
              <Save size={13} /> Save
            </button>
            <button className="menu-btn accent" onClick={() => setShowExportModal(true)} data-testid="btn-export-studio">
              <Download size={13} /> Export / Godot
            </button>
          </div>
        </div>

        {/* Workspace Mode Switcher */}
        <div className="mode-tabs" role="tablist">
          <button
            className={`mode-tab ${studioMode === 'sprite' ? 'active' : ''}`}
            onClick={() => setStudioMode('sprite')}
            data-testid="mode-sprite"
          >
            <Paintbrush2 size={12} /> Sprite Studio
          </button>
          <button
            className={`mode-tab ${studioMode === 'tileset' ? 'active' : ''}`}
            onClick={() => setStudioMode('tileset')}
            data-testid="mode-tileset"
          >
            <Grid3x3 size={12} /> Tileset Lab
          </button>
          <button
            className={`mode-tab ${rightTab === 'qc' && studioMode === 'sprite' ? 'active' : ''}`}
            onClick={() => {
              setStudioMode('sprite');
              setRightTab('qc');
            }}
            data-testid="mode-qc"
          >
            <Sparkles size={12} /> Quality Inspector
          </button>
        </div>

        {/* Right Quick Controls */}
        <div className="menu-strip">
          <button
            className="menu-btn"
            disabled={!historyRef.current.canUndo()}
            onClick={handleUndo}
            title="Undo (Ctrl+Z)"
            data-testid="btn-undo"
          >
            <Undo2 size={13} />
          </button>
          <button
            className="menu-btn"
            disabled={!historyRef.current.canRedo()}
            onClick={handleRedo}
            title="Redo (Ctrl+Shift+Z)"
            data-testid="btn-redo"
          >
            <Redo2 size={13} />
          </button>
          <button
            className="menu-btn"
            onClick={() => setFullscreenCanvas((v) => !v)}
            title="Toggle Fullscreen Drawing Mode (F)"
          >
            {fullscreenCanvas ? <Minimize size={13} /> : <Maximize size={13} />}
          </button>
        </div>
      </header>

      {/* Autosave Recovery Banner */}
      {recoverySession && (
        <div
          style={{
            background: '#222b36',
            borderBottom: '1px solid #de884a',
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11.5,
          }}
        >
          <span>
            <RotateCcw size={12} style={{ verticalAlign: 'middle', marginRight: 6, color: '#de884a' }} />
            Autosaved session found: <b>{recoverySession.name}</b> ({new Date(recoverySession.savedAt).toLocaleTimeString()})
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="btn-primary"
              style={{ padding: '2px 9px', fontSize: 11 }}
              onClick={() => {
                setDoc(recoverySession.doc);
                setRecoverySession(null);
                notify(`Restored autosaved session "${recoverySession.name}".`);
              }}
            >
              Restore Session
            </button>
            <button className="btn-secondary" style={{ padding: '2px 9px', fontSize: 11 }} onClick={() => setRecoverySession(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* TOOL OPTIONS BAR (Sprite Mode) */}
      {studioMode === 'sprite' && (
        <ToolOptionsBar
          tool={tool}
          settings={toolSettings}
          hasSelection={selection !== null}
          hasFloating={floating !== null}
          showPixelGrid={showPixelGrid}
          showTileGrid={showTileGrid}
          showPivot={showPivot}
          showNativePreview={showNativePreview}
          bgMode={bgMode}
          onUpdateSettings={(patch) => setToolSettings((s) => ({ ...s, ...patch }))}
          onTogglePixelGrid={() => setShowPixelGrid((v) => !v)}
          onToggleTileGrid={() => setShowTileGrid((v) => !v)}
          onTogglePivot={() => setShowPivot((v) => !v)}
          onToggleNativePreview={() => setShowNativePreview((v) => !v)}
          onBgModeChange={setBgMode}
          onRotate90={handleRotate90}
          onFlip={handleFlip}
          onOpenFreeTransform={() => setShowTransformModal(true)}
          onCropToSelection={handleCropToSelection}
          onCopySelection={handleCopySelection}
          onPasteSelection={handlePasteSelection}
          onCaptureCustomBrush={handleCaptureCustomBrush}
          onCommitFloating={commitFloating}
          onFitZoom={() => {
            setZoom(doc.width <= 32 ? 12 : doc.width <= 64 ? 7 : doc.width <= 128 ? 4 : 2);
            setPan({ x: 0, y: 0 });
          }}
        />
      )}

      {/* MAIN STUDIO WORKSPACE */}
      <div className="workspace-body">
        {studioMode === 'tileset' ? (
          <TilesetLabView
            doc={doc}
            primaryColor={primaryColor}
            onPickColor={setPrimaryColor}
            onUpdateTilesetConfig={(patch) =>
              setDoc((prev) => ({ ...prev, tileset: { ...prev.tileset, ...patch } }))
            }
            onUpdateTileMeta={(tileIndex, meta: TileMeta) =>
              setDoc((prev) => ({
                ...prev,
                tileset: {
                  ...prev.tileset,
                  metadata: { ...prev.tileset.metadata, [tileIndex]: meta },
                },
              }))
            }
            onCommitCelChange={handleCommitCelChange}
            onNotify={notify}
          />
        ) : (
          <>
            {/* Left Tool Rail */}
            <LeftToolRail
              tool={tool}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              onSelectTool={setTool}
              onSwapColors={() => {
                setPrimaryColor(secondaryColor);
                setSecondaryColor(primaryColor);
              }}
              onPrimaryColorChange={setPrimaryColor}
              onSecondaryColorChange={setSecondaryColor}
            />

            {/* Center Canvas + Timeline */}
            <div className="viewport-column">
              <PixelCanvasViewport
                doc={doc}
                tool={tool}
                toolSettings={toolSettings}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                selection={selection}
                floating={floating}
                zoom={zoom}
                pan={pan}
                showPixelGrid={showPixelGrid}
                showTileGrid={showTileGrid}
                showPivot={showPivot}
                bgMode={bgMode}
                onionSkin={onionSkin}
                qcOverlays={qcOverlays}
                qcReport={qcReport}
                showNativePreview={showNativePreview}
                onZoomChange={setZoom}
                onPanChange={setPan}
                onHoverPixel={setHoverPx}
                onCommitCelChange={handleCommitCelChange}
                onSelectionChange={setSelection}
                onFloatingChange={setFloating}
                onPickColor={(hx, sec) => (sec ? setSecondaryColor(hx) : setPrimaryColor(hx))}
                onNotify={notify}
              />

              {!fullscreenCanvas && (
                <TimelineDock
                  doc={doc}
                  isPlaying={isPlaying}
                  loopPlayback={loopPlayback}
                  speedMultiplier={speedMultiplier}
                  activeTagId={activeTagId}
                  onionSkin={onionSkin}
                  onSelectFrame={(idx) => setDoc((prev) => ({ ...prev, activeFrameIndex: idx }))}
                  onAddFrame={handleAddFrame}
                  onDuplicateFrame={handleDuplicateFrame}
                  onDeleteFrame={handleDeleteFrame}
                  onReorderFrame={handleReorderFrame}
                  onSetFrameDuration={(idx, ms) =>
                    setDoc((prev) => ({
                      ...prev,
                      frames: prev.frames.map((f, i) => (i === idx ? { ...f, durationMs: ms } : f)),
                    }))
                  }
                  onTogglePlay={() => setIsPlaying((v) => !v)}
                  onToggleLoop={() => setLoopPlayback((v) => !v)}
                  onSpeedChange={setSpeedMultiplier}
                  onOnionSkinChange={setOnionSkin}
                  onAddTag={(tag: Omit<AnimationTag, 'id'>) =>
                    mutateDoc(`Add Tag ${tag.name}`, (prev) => ({
                      ...prev,
                      tags: [...prev.tags, { ...tag, id: `tag_${Date.now()}` }],
                    }))
                  }
                  onDeleteTag={(id) => {
                    if (activeTagId === id) setActiveTagId(null);
                    mutateDoc('Delete Tag', (prev) => ({ ...prev, tags: prev.tags.filter((t) => t.id !== id) }));
                  }}
                  onSelectTag={(id) => {
                    setActiveTagId(id);
                    const found = doc.tags.find((t) => t.id === id);
                    if (found) setDoc((prev) => ({ ...prev, activeFrameIndex: found.from }));
                  }}
                />
              )}
            </div>

            {/* Adjustable Right Studio Dock */}
            {!fullscreenCanvas && (
              <aside className="right-dock" style={{ width: rightDockWidth }}>
                <div className="dock-resizer" onMouseDown={startDockResize} title="Drag to resize dock" />
                <div className="dock-tabs">
                  <button
                    className={`dock-tab ${rightTab === 'layers' ? 'active' : ''}`}
                    onClick={() => setRightTab('layers')}
                    data-testid="tab-layers"
                  >
                    Layers
                  </button>
                  <button
                    className={`dock-tab ${rightTab === 'palette' ? 'active' : ''}`}
                    onClick={() => setRightTab('palette')}
                    data-testid="tab-palette"
                  >
                    Palette
                  </button>
                  <button
                    className={`dock-tab ${rightTab === 'reference' ? 'active' : ''}`}
                    onClick={() => setRightTab('reference')}
                    data-testid="tab-reference"
                  >
                    Ref
                  </button>
                  <button
                    className={`dock-tab ${rightTab === 'qc' ? 'active' : ''}`}
                    onClick={() => setRightTab('qc')}
                    data-testid="tab-qc"
                  >
                    QC
                  </button>
                </div>

                <div className="dock-content">
                  {rightTab === 'layers' && (
                    <LayersPanel
                      doc={doc}
                      onSelectLayer={(id) => setDoc((prev) => ({ ...prev, activeLayerId: id }))}
                      onAddLayer={handleAddLayer}
                      onDuplicateLayer={handleDuplicateLayer}
                      onDeleteLayer={handleDeleteLayer}
                      onRenameLayer={(id, name) =>
                        mutateDoc('Rename Layer', (prev) => ({
                          ...prev,
                          layers: prev.layers.map((l) => (l.id === id ? { ...l, name } : l)),
                        }))
                      }
                      onToggleVisible={(id) =>
                        mutateDoc('Toggle Layer Visibility', (prev) => ({
                          ...prev,
                          layers: prev.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
                        }))
                      }
                      onToggleLock={(id) =>
                        setDoc((prev) => ({
                          ...prev,
                          layers: prev.layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)),
                        }))
                      }
                      onToggleClip={(id) =>
                        mutateDoc('Toggle Clipping Mask', (prev) => ({
                          ...prev,
                          layers: prev.layers.map((l) => (l.id === id ? { ...l, clipped: !l.clipped } : l)),
                        }))
                      }
                      onToggleSolo={(id) =>
                        setDoc((prev) => ({
                          ...prev,
                          soloLayerId: prev.soloLayerId === id ? null : id,
                        }))
                      }
                      onChangeOpacity={(id, opacity) =>
                        setDoc((prev) => ({
                          ...prev,
                          layers: prev.layers.map((l) => (l.id === id ? { ...l, opacity } : l)),
                        }))
                      }
                      onReorderLayer={handleReorderLayer}
                      onMergeDown={handleMergeDown}
                      onTransformLayer={handleTransformSpecificLayer}
                      onNotify={notify}
                    />
                  )}

                  {rightTab === 'palette' && (
                    <PalettePanel
                      doc={doc}
                      composite={activeComposite}
                      primaryColor={primaryColor}
                      secondaryColor={secondaryColor}
                      onSelectPrimary={setPrimaryColor}
                      onSelectSecondary={setSecondaryColor}
                      onSwitchPalette={(paletteId) => setDoc((prev) => ({ ...prev, activePaletteId: paletteId }))}
                      onTogglePaletteLock={() => setDoc((prev) => ({ ...prev, paletteLocked: !prev.paletteLocked }))}
                      onAddColorToPalette={(hex, name, ramp) =>
                        mutateDoc('Add Palette Swatch', (prev) => ({
                          ...prev,
                          palettes: prev.palettes.map((p) =>
                            p.id === prev.activePaletteId
                              ? {
                                  ...p,
                                  colors: [
                                    ...p.colors,
                                    { id: `sw_${Date.now()}`, hex: hex.toUpperCase(), name: name || hex, ramp: ramp || 'Custom' },
                                  ],
                                }
                              : p
                          ),
                        }))
                      }
                      onAddColorsToPalette={(hexes, rampName) =>
                        mutateDoc('Add Hue-Shifted Ramp', (prev) => ({
                          ...prev,
                          palettes: prev.palettes.map((p) =>
                            p.id === prev.activePaletteId
                              ? {
                                  ...p,
                                  colors: [
                                    ...p.colors,
                                    ...hexes.map((hx, idx) => ({
                                      id: `ramp_${Date.now()}_${idx}`,
                                      hex: hx.toUpperCase(),
                                      name: `${rampName} #${idx + 1}`,
                                      ramp: rampName,
                                    })),
                                  ],
                                }
                              : p
                          ),
                        }))
                      }
                      onRemoveColorFromPalette={(colorId) =>
                        mutateDoc('Remove Palette Swatch', (prev) => ({
                          ...prev,
                          palettes: prev.palettes.map((p) =>
                            p.id === prev.activePaletteId
                              ? { ...p, colors: p.colors.filter((c) => c.id !== colorId) }
                              : p
                          ),
                        }))
                      }
                      onCreateCustomPalette={(name) => {
                        const newPal: PalettePreset = {
                          id: `custom_${Date.now()}`,
                          name,
                          description: 'Artist custom studio palette',
                          colors: [
                            { id: 'c0', hex: '#231622', name: 'Deep Shadow', ramp: 'Custom' },
                            { id: 'c1', hex: '#DE884A', name: 'Primary Tone', ramp: 'Custom' },
                            { id: 'c2', hex: '#649291', name: 'Accent Teal', ramp: 'Custom' },
                            { id: 'c3', hex: '#F2EED0', name: 'Peak Highlight', ramp: 'Custom' },
                          ],
                        };
                        mutateDoc(`Create Palette ${name}`, (prev) => ({
                          ...prev,
                          palettes: [...prev.palettes, newPal],
                          activePaletteId: newPal.id,
                        }));
                        notify(`Created custom palette "${name}".`);
                      }}
                      onImportPalette={(preset) =>
                        mutateDoc(`Import Palette ${preset.name}`, (prev) => ({
                          ...prev,
                          palettes: [...prev.palettes, preset],
                          activePaletteId: preset.id,
                        }))
                      }
                      onGlobalReplaceColor={(fromHex, toHex) => {
                        const { frames, replacedPixels } = replaceColorAcrossFrames(doc.frames, fromHex, toHex);
                        if (replacedPixels === 0) {
                          notify(`No pixels matching ${fromHex} found.`);
                          return;
                        }
                        mutateDoc(`Replace ${fromHex} -> ${toHex}`, (prev) => ({ ...prev, frames }));
                        notify(`Replaced ${replacedPixels} pixels across all layers & frames.`);
                      }}
                      onNotify={notify}
                    />
                  )}

                  {rightTab === 'reference' && (
                    <ReferencePanel
                      doc={doc}
                      composite={activeComposite}
                      onAddReference={(ref: ReferenceItem) =>
                        setDoc((prev) => ({ ...prev, references: [...prev.references, ref] }))
                      }
                      onRemoveReference={(id) =>
                        setDoc((prev) => ({ ...prev, references: prev.references.filter((r) => r.id !== id) }))
                      }
                      onUpdateStyleNotes={(styleNotes) => setDoc((prev) => ({ ...prev, styleNotes }))}
                      onPickColor={setPrimaryColor}
                      onNotify={notify}
                    />
                  )}

                  {rightTab === 'qc' && (
                    <QCPanel
                      overlays={qcOverlays}
                      report={qcReport}
                      onToggleOverlay={(key) => setQcOverlays((o) => ({ ...o, [key]: !o[key] }))}
                      onResetOverlays={() => setQcOverlays(INITIAL_QC_OVERLAYS)}
                    />
                  )}
                </div>
              </aside>
            )}
          </>
        )}
      </div>

      {/* STUDIO STATUS BAR */}
      <footer className="status-bar">
        <div style={{ display: 'flex', gap: 14 }}>
          <span>POS: {hoverPx ? `${hoverPx.x}, ${hoverPx.y}` : '—'}</span>
          <span>TOOL: {tool.toUpperCase()}</span>
          <span>PRIMARY: {primaryColor}</span>
          <span>FRAME: {doc.activeFrameIndex + 1}/{doc.frames.length}</span>
          <span>LAYERS: {doc.layers.length}</span>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <span>OPAQUE: {qcReport.opaquePixels}px</span>
          <span>COLORS: {qcReport.uniqueColors}</span>
          <span>HISTORY: {histStats.undoCount} undo / {histStats.redoCount} redo</span>
          <span style={{ color: '#9bc2b6' }}>NEAREST-NEIGHBOR PIXEL LOCKED</span>
        </div>
      </footer>

      {/* MODALS */}
      {showNewModal && (
        <NewCanvasModal
          onClose={() => setShowNewModal(false)}
          onCreate={(name, width, height, tileSize) => {
            historyRef.current.clear();
            const fresh = createBlankProject(name, width, height, tileSize);
            setDoc(fresh);
            setSelection(null);
            setFloating(null);
            setIsPlaying(false);
            setZoom(width <= 32 ? 12 : width <= 64 ? 7 : width <= 128 ? 4 : 2);
            setPan({ x: 0, y: 0 });
            notify(`Created new ${width}×${height} canvas "${name}".`);
          }}
        />
      )}

      {showTransformModal && (
        <TransformModal
          doc={doc}
          hasSelection={selection !== null || floating !== null}
          onClose={() => setShowTransformModal(false)}
          onFreeRotate={handleFreeRotate}
          onScaleNearest={handleScaleNearest}
          onResizeCanvas={handleResizeCanvas}
          onSetPivot={(x, y) => {
            setDoc((prev) => ({ ...prev, pivot: { x, y } }));
            setShowPivot(true);
            notify(`Set Godot origin pivot to (${x}, ${y}).`);
          }}
        />
      )}

      {showExportModal && (
        <ExportModal
          doc={doc}
          onClose={() => setShowExportModal(false)}
          onNotify={notify}
        />
      )}

      {showRepoModal && (
        <RepoAssetsModal
          onClose={() => setShowRepoModal(false)}
          onLoadRepoSource={handleLoadRepoSource}
        />
      )}

      {toast && <div className="studio-toast" role="status">{toast}</div>}
    </div>
  );
};

export default App;
