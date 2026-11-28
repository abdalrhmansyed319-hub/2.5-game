import type { ProjectDocument } from '../types/studio';

export interface HistoryEntry {
  label: string;
  doc: ProjectDocument;
}

export function cloneProjectDocument(doc: ProjectDocument): ProjectDocument {
  return {
    ...doc,
    layers: doc.layers.map((l) => ({ ...l })),
    frames: doc.frames.map((f) => ({
      id: f.id,
      durationMs: f.durationMs,
      cels: Object.fromEntries(
        Object.entries(f.cels).map(([k, buf]) => [k, new Uint8ClampedArray(buf)])
      ),
    })),
    tags: doc.tags.map((t) => ({ ...t })),
    palettes: doc.palettes.map((p) => ({
      ...p,
      colors: p.colors.map((c) => ({ ...c })),
    })),
    tileset: {
      ...doc.tileset,
      metadata: Object.fromEntries(
        Object.entries(doc.tileset.metadata).map(([k, v]) => [k, { ...v }])
      ),
      mapCells: doc.tileset.mapCells.map((c) => ({ ...c })),
    },
    guides: doc.guides.map((g) => ({ ...g })),
    references: doc.references.map((r) => ({ ...r })),
    pivot: { ...doc.pivot },
  };
}

export class HistoryManager {
  private past: HistoryEntry[] = [];
  private future: HistoryEntry[] = [];
  private maxDepth: number;

  constructor(maxDepth = 60) {
    this.maxDepth = maxDepth;
  }

  push(label: string, snapshotBeforeChange: ProjectDocument): void {
    this.past.push({ label, doc: cloneProjectDocument(snapshotBeforeChange) });
    if (this.past.length > this.maxDepth) {
      this.past.shift();
    }
    this.future = [];
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  undo(current: ProjectDocument): { doc: ProjectDocument; label: string } | null {
    const prev = this.past.pop();
    if (!prev) return null;
    this.future.push({ label: prev.label, doc: cloneProjectDocument(current) });
    return { doc: cloneProjectDocument(prev.doc), label: prev.label };
  }

  redo(current: ProjectDocument): { doc: ProjectDocument; label: string } | null {
    const next = this.future.pop();
    if (!next) return null;
    this.past.push({ label: next.label, doc: cloneProjectDocument(current) });
    return { doc: cloneProjectDocument(next.doc), label: next.label };
  }

  clear(): void {
    this.past = [];
    this.future = [];
  }

  getStats(): { undoCount: number; redoCount: number; lastAction: string | null } {
    return {
      undoCount: this.past.length,
      redoCount: this.future.length,
      lastAction: this.past.length > 0 ? this.past[this.past.length - 1].label : null,
    };
  }
}
