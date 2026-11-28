export type ToolId =
  | 'pencil'
  | 'eraser'
  | 'line'
  | 'rect'
  | 'ellipse'
  | 'fill'
  | 'picker'
  | 'dither'
  | 'select_rect'
  | 'select_lasso'
  | 'select_wand'
  | 'move';

export type BrushShape = 'square' | 'circle' | 'diamond' | 'custom';

export type DitherPattern =
  | 'bayer2'
  | 'bayer4'
  | 'checker50'
  | 'sparse25'
  | 'dense75'
  | 'diagonal';

export type SymmetryMode = 'none' | 'horizontal' | 'vertical' | 'both' | 'radial4' | 'radial8';

export type CanvasBgMode = 'checker' | 'grass' | 'forest' | 'dark' | 'light';

export type StudioMode = 'sprite' | 'tileset' | 'qc';

export type RightDockTab = 'layers' | 'palette' | 'reference' | 'qc';

export type RotateAlgorithm = 'nearest' | 'rotsprite';

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface CustomBrush {
  width: number;
  height: number;
  /** Non-zero alpha mask (1 = paint, 0 = skip) and optional full RGBA pattern */
  pixels: Uint8ClampedArray;
  colorMode: 'tint' | 'stamp';
}

export interface ToolSettings {
  size: number;
  shape: BrushShape;
  opacity: number; // 1..100 (binary alpha if 100, intentional blend if <100)
  spacing: number; // 1..16 px
  pixelPerfect: boolean;
  filledShape: boolean;
  contiguousFill: boolean;
  ditherPattern: DitherPattern;
  symmetry: SymmetryMode;
  customBrush: CustomBrush | null;
}

export interface LayerNode {
  id: string;
  name: string;
  kind: 'layer' | 'group';
  parentId: string | null;
  visible: boolean;
  locked: boolean;
  opacity: number; // 0..100
  clipped: boolean; // clips to layer immediately below
  collapsed?: boolean; // for groups
}

export interface AnimationFrame {
  id: string;
  durationMs: number;
  /** Map of layerId -> RGBA pixel buffer (width * height * 4) */
  cels: Record<string, Uint8ClampedArray>;
}

export interface AnimationTag {
  id: string;
  name: string;
  from: number; // 0-based inclusive
  to: number;   // 0-based inclusive
  color: string;
}

export interface PaletteColor {
  id: string;
  hex: string;
  name: string;
  token?: string;
  ramp?: string;
}

export interface PalettePreset {
  id: string;
  name: string;
  description: string;
  colors: PaletteColor[];
}

export interface PixelSelection {
  width: number;
  height: number;
  /** 1 = selected, 0 = not selected */
  mask: Uint8Array;
  bounds: { x: number; y: number; w: number; h: number };
}

export interface FloatingSelection {
  x: number;
  y: number;
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  mask: Uint8Array;
}

export interface TileMeta {
  index: number;
  name: string;
  group: string;
  solid: boolean;
  terrain: string;
  notes: string;
}

export interface TilemapCell {
  tileIndex: number; // -1 = empty
  rotation: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
}

export interface TilesetData {
  tileWidth: number;
  tileHeight: number;
  selectedTileIndex: number;
  metadata: Record<number, TileMeta>;
  mapCols: number;
  mapRows: number;
  mapCells: TilemapCell[];
}

export interface ReferenceItem {
  id: string;
  name: string;
  dataUrl: string;
  zoom: number;
  panX: number;
  panY: number;
  notes: string;
}

export interface QCOverlayConfig {
  silhouette: boolean;
  grayscale: boolean;
  orphans: boolean;
  banding: boolean;
  noise: boolean;
  offPalette: boolean;
  semiAlpha: boolean;
  lightVector: boolean;
  tileSeams: boolean;
}

export interface GuideLine {
  id: string;
  orientation: 'vertical' | 'horizontal';
  pos: number;
}

export interface ProjectDocument {
  id: string;
  name: string;
  width: number;
  height: number;
  layers: LayerNode[];
  frames: AnimationFrame[];
  tags: AnimationTag[];
  activeLayerId: string;
  activeFrameIndex: number;
  soloLayerId: string | null;
  palettes: PalettePreset[];
  activePaletteId: string;
  paletteLocked: boolean;
  tileset: TilesetData;
  guides: GuideLine[];
  styleNotes: string;
  references: ReferenceItem[];
  pivot: { x: number; y: number };
  updatedAt: number;
}

export interface QCReport {
  opaquePixels: number;
  uniqueColors: number;
  offPalettePixels: number;
  semiAlphaPixels: number;
  intentionalHighlights: Array<{ x: number; y: number; hex: string }>;
  accidentalOrphans: Array<{ x: number; y: number; hex: string }>;
  bandingPixels: Array<{ x: number; y: number }>;
  noisePixels: Array<{ x: number; y: number }>;
  offPaletteCoords: Array<{ x: number; y: number }>;
  semiAlphaCoords: Array<{ x: number; y: number }>;
  lightAngleDeg: number | null;
  lightConsistencyScore: number; // 0..100
  minLuminance: number;
  maxLuminance: number;
  contrastSpread: number;
  seamIssuesH: number;
  seamIssuesV: number;
  summaryNotes: Array<{ severity: 'ok' | 'info' | 'warn'; title: string; detail: string }>;
}
