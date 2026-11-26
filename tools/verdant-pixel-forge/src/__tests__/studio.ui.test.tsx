// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from '../App';

// Polyfill jsdom Canvas 2D + ImageData + ResizeObserver + Blob downloads so the real UI runs cleanly!
beforeAll(() => {
  if (typeof globalThis.ImageData === 'undefined') {
    class MockImageData {
      data: Uint8ClampedArray;
      width: number;
      height: number;
      constructor(dataOrW: Uint8ClampedArray | number, w: number, h?: number) {
        if (typeof dataOrW === 'number') {
          this.width = dataOrW;
          this.height = w;
          this.data = new Uint8ClampedArray(dataOrW * w * 4);
        } else {
          this.data = dataOrW;
          this.width = w;
          this.height = h ?? Math.floor(dataOrW.length / (4 * w));
        }
      }
    }
    // @ts-expect-error test polyfill
    globalThis.ImageData = MockImageData;
  }

  class MockResizeObserver {
    cb: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) {
      this.cb = cb;
    }
    observe(target: Element) {
      this.cb(
        [{ target, contentRect: { width: 900, height: 640 } as DOMRectReadOnly } as ResizeObserverEntry],
        this as unknown as ResizeObserver
      );
    }
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

  // Stub fetch for /api/repo-assets
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ assets: [] }),
    text: async () => '{}',
  }) as unknown as typeof fetch;

  // Mock 2D context methods & toBlob on HTMLCanvasElement
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: function () {
      return {
        imageSmoothingEnabled: false,
        setTransform: () => {},
        clearRect: () => {},
        fillRect: () => {},
        strokeRect: () => {},
        beginPath: () => {},
        rect: () => {},
        clip: () => {},
        save: () => {},
        restore: () => {},
        moveTo: () => {},
        lineTo: () => {},
        stroke: () => {},
        arc: () => {},
        fill: () => {},
        setLineDash: () => {},
        drawImage: () => {},
        putImageData: () => {},
        getImageData: (_x: number, _y: number, w: number, h: number) =>
          new ImageData(new Uint8ClampedArray(w * h * 4), w, h),
      };
    },
  });

  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    value: function (cb: (b: Blob) => void) {
      cb(new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], { type: 'image/png' }));
    },
  });

  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
});

afterEach(() => {
  cleanup();
});

describe('VERDANT PIXEL FORGE — All 12 First-Deliverable Interactive UI Workflows', () => {
  it('executes every single first-deliverable operation through the real live UI', async () => {
    const downloads: Array<{ filename: string; blob: Blob }> = [];
    const blobMap = new Map<string, Blob>();
    URL.createObjectURL = vi.fn((blob: Blob) => {
      const id = `blob:mock-${downloads.length}`;
      blobMap.set(id, blob);
      return id;
    });
    URL.revokeObjectURL = vi.fn();

    const origClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      if (this.download) {
        const b = blobMap.get(this.href);
        if (b) downloads.push({ filename: this.download, blob: b });
      }
    };

    try {
      render(<App />);

      // 1. Create a 128x128 canvas through the New Canvas modal
      fireEvent.click(screen.getByTestId('btn-new-canvas'));
      expect(screen.getByTestId('new-canvas-modal')).toBeTruthy();
      fireEvent.click(screen.getByTestId('confirm-new-canvas'));
      expect(screen.getAllByText(/128×128/).length).toBeGreaterThan(0);

      // 2. Draw and erase individual pixels directly on the viewport canvas
      const viewport = screen.getByTestId('pixel-viewport-canvas') as HTMLCanvasElement;
      viewport.getBoundingClientRect = () =>
        ({ left: 0, top: 0, width: 900, height: 640, right: 900, bottom: 640, x: 0, y: 0, toJSON: () => {} });

      // Canvas origin is centered in 900x640 at zoom=4 -> 512x512 -> ox=194, oy=64
      fireEvent.pointerDown(viewport, { clientX: 202, clientY: 72, button: 0, pointerId: 1 });
      fireEvent.pointerMove(viewport, { clientX: 210, clientY: 72, button: 0, pointerId: 1 });
      fireEvent.pointerUp(viewport, { clientX: 210, clientY: 72, button: 0, pointerId: 1 });
      expect(screen.getByText(/OPAQUE: [1-9]\d*px/)).toBeTruthy();

      // Switch to Eraser tool & erase the drawn pixels
      fireEvent.click(screen.getByLabelText('Eraser'));
      fireEvent.pointerDown(viewport, { clientX: 202, clientY: 72, button: 0, pointerId: 1 });
      fireEvent.pointerMove(viewport, { clientX: 210, clientY: 72, button: 0, pointerId: 1 });
      fireEvent.pointerUp(viewport, { clientX: 210, clientY: 72, button: 0, pointerId: 1 });
      expect(screen.getByText('OPAQUE: 0px')).toBeTruthy();

      // Re-draw pixels with Pencil so subsequent operations have visible artwork!
      fireEvent.click(screen.getByLabelText('Pixel Pencil'));
      fireEvent.pointerDown(viewport, { clientX: 220, clientY: 90, button: 0, pointerId: 1 });
      fireEvent.pointerMove(viewport, { clientX: 240, clientY: 110, button: 0, pointerId: 1 });
      fireEvent.pointerUp(viewport, { clientX: 240, clientY: 110, button: 0, pointerId: 1 });
      expect(screen.getByText(/OPAQUE: [1-9]\d*px/)).toBeTruthy();

      // 3. Use a Custom Palette (switch to Palette tab, create custom palette, add swatch)
      fireEvent.click(screen.getByTestId('tab-palette'));
      fireEvent.click(screen.getByTitle('Create New Custom Palette'));
      const palInput = screen.getByPlaceholderText('Custom palette name…');
      fireEvent.change(palInput, { target: { value: 'Oura Night Relic' } });
      fireEvent.click(screen.getByText('Create'));
      expect((screen.getByLabelText('Active Palette') as HTMLSelectElement).selectedOptions[0].textContent).toContain('Oura Night Relic');

      // 4 & 5. Create multiple layers, reorder and hide layers
      fireEvent.click(screen.getByTestId('tab-layers'));
      fireEvent.click(screen.getByTitle('New Pixel Layer'));
      expect(screen.getByText('LAYERS: 3')).toBeTruthy();
      // Hide a layer and reorder it
      const hideBtn = screen.getByLabelText('Toggle visibility Base Silhouette');
      fireEvent.click(hideBtn);
      expect(screen.getByText('OPAQUE: 0px')).toBeTruthy();
      fireEvent.click(hideBtn); // show again
      expect(screen.getByText(/OPAQUE: [1-9]\d*px/)).toBeTruthy();

      // Reorder Base Silhouette up
      const moveUpButtons = screen.getAllByTitle('Move Layer Up');
      fireEvent.click(moveUpButtons[moveUpButtons.length - 1]);

      // 6. Select artwork, rotate 90° CW and flip horizontally
      fireEvent.click(screen.getByLabelText('Rectangle Selection'));
      fireEvent.pointerDown(viewport, { clientX: 212, clientY: 82, button: 0, pointerId: 1 });
      fireEvent.pointerMove(viewport, { clientX: 260, clientY: 130, button: 0, pointerId: 1 });
      fireEvent.pointerUp(viewport, { clientX: 260, clientY: 130, button: 0, pointerId: 1 });

      fireEvent.click(screen.getByTitle('Rotate 90° Clockwise'));
      fireEvent.click(screen.getByTitle('Flip Horizontal (H)'));
      fireEvent.click(screen.getByText('Commit Transform'));

      // 7 & 8. Create multiple animation frames & preview animation playback
      fireEvent.click(screen.getByTestId('timeline-add-frame'));
      fireEvent.click(screen.getByTestId('timeline-dup-frame'));
      expect(screen.getByText('FRAME: 3/3')).toBeTruthy();

      const playBtn = screen.getByTestId('timeline-play-btn');
      fireEvent.click(playBtn);
      expect(playBtn.textContent).toContain('Pause');
      fireEvent.click(playBtn);
      expect(playBtn.textContent).toContain('Play');

      // 9. Switch to Tileset Lab, create & edit independent tile + rotate & flip it!
      fireEvent.click(screen.getByTestId('mode-tileset'));
      expect(screen.getByTestId('tileset-lab-view')).toBeTruthy();
      const tileCanvas = screen.getByTestId('tile-editor-canvas') as HTMLCanvasElement;
      tileCanvas.getBoundingClientRect = () =>
        ({ left: 0, top: 0, width: 288, height: 288, right: 288, bottom: 288, x: 0, y: 0, toJSON: () => {} });
      fireEvent.pointerDown(tileCanvas, { clientX: 20, clientY: 20, button: 0, pointerId: 1 });
      fireEvent.pointerUp(tileCanvas, { clientX: 20, clientY: 20, button: 0, pointerId: 1 });
      fireEvent.click(screen.getByTestId('tile-rotate-cw'));
      fireEvent.click(screen.getByTestId('tile-flip-h'));

      // Return to Sprite Studio
      fireEvent.click(screen.getByTestId('mode-sprite'));

      // 10. Save editable project (.vpf.json)
      fireEvent.click(screen.getByTestId('btn-save-project'));
      const savedVpf = downloads.find((d) => d.filename.endsWith('.vpf.json'));
      expect(savedVpf).toBeTruthy();
      const vpfText = await savedVpf!.blob.text();
      const parsedVpf = JSON.parse(vpfText);
      expect(parsedVpf.format).toBe('verdant_pixel_forge_project_v1');
      expect(parsedVpf.width).toBe(128);
      expect(parsedVpf.layers.length).toBe(3);
      expect(parsedVpf.frames.length).toBe(3);

      // 11 & 12. Open Export Studio -> Export Transparent PNG & Export Godot-Compatible Sprite Sheet
      fireEvent.click(screen.getByTestId('btn-export-studio'));
      expect(screen.getByTestId('export-modal')).toBeTruthy();

      fireEvent.click(screen.getByTestId('export-png-btn'));
      fireEvent.click(screen.getByTestId('export-godot-sheet-btn'));

      // Wait briefly for async canvas.toBlob callbacks
      await new Promise((r) => setTimeout(r, 40));

      expect(downloads.some((d) => d.filename.endsWith('_128x128.png'))).toBe(true);
      expect(downloads.some((d) => d.filename.endsWith('_spritesheet.png'))).toBe(true);
      expect(downloads.some((d) => d.filename.endsWith('_spritesheet.png.import'))).toBe(true);
      expect(downloads.some((d) => d.filename.endsWith('_godot_manifest.json'))).toBe(true);
    } finally {
      HTMLAnchorElement.prototype.click = origClick;
    }
  });
});
