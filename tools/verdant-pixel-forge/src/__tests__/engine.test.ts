import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  compositeFrame,
  createEmptyBuffer,
  drawEllipseOnBuffer,
  drawLineOnBuffer,
  drawRectOnBuffer,
  filterPixelPerfectPath,
  floodFillBuffer,
  getPixel,
  hexToRgba,
  setPixel,
  stampBrush,
} from '../engine/pixelBuffer';
import {
  createRectSelection,
  extractFloatingSelection,
  stampFloatingSelection,
} from '../engine/selectionEngine';
import {
  extractTile,
  flipBufferHorizontal,
  freeRotateBuffer,
  rotateBuffer90CW,
  scaleBufferNearest,
  transformSingleTile,
  writeTile,
} from '../engine/transformEngine';
import {
  VERDANT_MASTER_PALETTE,
  exportPaletteGPL,
  generateHueShiftedRamp,
  importPaletteText,
  replaceColorAcrossFrames,
} from '../engine/paletteEngine';
import { runAnimationContinuityAudit, runPixelQualityAudit } from '../engine/qcEngine';
import { encodeAnimatedGIF } from '../engine/gifEncoder';
import { encodeRGBA8PNG } from '../engine/pngEncoder';
import {
  buildGodotImportSidecar,
  buildGodotManifestJSON,
  createBlankProject,
  deserializeProjectJSON,
  encodeSpriteSheetPNG,
  exportAsVerdantSourceJSON,
  renderSpriteSheetBuffer,
  serializeVpfProject,
} from '../engine/exportEngine';
import { buildAst001VpfProject } from '../production/ast001MaraAuthoring';

describe('VERDANT PIXEL FORGE — Core Pixel Engine & File Formats', () => {
  it('draws & erases crisp pixels on 128x128 with zero semi-alpha blur', () => {
    const buf = createEmptyBuffer(128, 128);
    const orange = hexToRgba('#DE884A', 255);
    setPixel(buf, 128, 128, 10, 12, orange);
    expect(getPixel(buf, 128, 128, 10, 12)).toEqual(orange);

    // Erase individual pixel
    setPixel(buf, 128, 128, 10, 12, { r: 0, g: 0, b: 0, a: 0 });
    expect(getPixel(buf, 128, 128, 10, 12).a).toBe(0);

    // Draw line, rect, ellipse, flood fill, symmetry
    drawLineOnBuffer(buf, 128, 128, 4, 4, 20, 12, orange, 1, 'square', 'horizontal');
    drawRectOnBuffer(buf, 128, 128, 30, 30, 42, 42, hexToRgba('#649291'), false, 1, 'square', 'none');
    floodFillBuffer(buf, 128, 128, 35, 35, hexToRgba('#C25B32'), true);
    drawEllipseOnBuffer(buf, 128, 128, 50, 50, 70, 68, hexToRgba('#EFC17C'), true, 1, 'square', 'none');
    stampBrush(buf, 128, 128, 80, 80, hexToRgba('#567449'), 3, 'circle', 'none', null, 100, { pattern: 'checker50' });

    // Confirm EVERY pixel has strictly binary alpha (0 or 255)
    for (let i = 3; i < buf.length; i += 4) {
      expect(buf[i] === 0 || buf[i] === 255).toBe(true);
    }

    // Confirm pixel-perfect filter removes redundant L-corners
    const raw: Array<[number, number]> = [[0, 0], [1, 0], [1, 1], [2, 1]];
    expect(filterPixelPerfectPath(raw)).toEqual([[0, 0], [1, 1], [2, 1]]);
  });

  it('supports layer visibility, reordering, clipping masks, and solo compositing', () => {
    const doc = createBlankProject('LayerTest', 16, 16, 8);
    const l1 = doc.layers[0];
    const l2 = doc.layers[1];
    setPixel(doc.frames[0].cels[l1.id], 16, 16, 2, 2, hexToRgba('#C25B32'));
    setPixel(doc.frames[0].cels[l2.id], 16, 16, 2, 2, hexToRgba('#649291'));
    setPixel(doc.frames[0].cels[l2.id], 16, 16, 5, 5, hexToRgba('#649291'));

    // Normal composite: l2 above l1
    let comp = compositeFrame(16, 16, doc.layers, doc.frames[0], null);
    expect(getPixel(comp, 16, 16, 2, 2)).toEqual(hexToRgba('#649291'));
    expect(getPixel(comp, 16, 16, 5, 5)).toEqual(hexToRgba('#649291'));

    // Clipping mask: l2 pixel at (5,5) is clipped out because l1 at (5,5) is empty!
    l2.clipped = true;
    comp = compositeFrame(16, 16, doc.layers, doc.frames[0], null);
    expect(getPixel(comp, 16, 16, 2, 2)).toEqual(hexToRgba('#649291'));
    expect(getPixel(comp, 16, 16, 5, 5).a).toBe(0);

    // Hide upper layer: reveals l1
    l2.visible = false;
    comp = compositeFrame(16, 16, doc.layers, doc.frames[0], null);
    expect(getPixel(comp, 16, 16, 2, 2)).toEqual(hexToRgba('#C25B32'));

    // Reorder l1 above l2 (both visible, unclipped)
    l2.visible = true;
    l2.clipped = false;
    comp = compositeFrame(16, 16, [l2, l1], doc.frames[0], null);
    expect(getPixel(comp, 16, 16, 2, 2)).toEqual(hexToRgba('#C25B32'));
  });

  it('rotates and flips selected artwork cleanly with zero blur (90° CW, Flip H, RotSprite)', () => {
    const buf = createEmptyBuffer(16, 16);
    setPixel(buf, 16, 16, 2, 2, hexToRgba('#DE884A'));
    setPixel(buf, 16, 16, 5, 2, hexToRgba('#649291'));

    const sel = createRectSelection(16, 16, 2, 2, 5, 5)!;
    const lifted = extractFloatingSelection(buf, 16, 16, sel, true);
    expect(getPixel(buf, 16, 16, 2, 2).a).toBe(0);

    const flipped = flipBufferHorizontal(lifted.pixels, lifted.width, lifted.height, lifted.mask);
    const rotated = rotateBuffer90CW(flipped.pixels, flipped.width, flipped.height, flipped.mask);
    stampFloatingSelection(buf, 16, 16, {
      x: 2,
      y: 2,
      width: rotated.width,
      height: rotated.height,
      pixels: rotated.pixels,
      mask: rotated.mask!,
    });

    // After flip H on 4x4: (0,0)->(3,0) orange, (3,0)->(0,0) teal.
    // After 90° CW: (3,0)->(3,3) orange at (5,5), (0,0)->(3,0) teal at (5,2).
    expect(getPixel(buf, 16, 16, 5, 5)).toEqual(hexToRgba('#DE884A'));
    expect(getPixel(buf, 16, 16, 5, 2)).toEqual(hexToRgba('#649291'));

    // RotSprite free rotate preserves crisp binary alpha
    const rotFree = freeRotateBuffer(buf, 16, 16, 22, 'rotsprite', true);
    for (let i = 3; i < rotFree.pixels.length; i += 4) {
      expect(rotFree.pixels[i] === 0 || rotFree.pixels[i] === 255).toBe(true);
    }

    // Nearest-neighbor scale doubles cleanly
    const scaled = scaleBufferNearest(buf, 16, 16, 32, 32);
    expect(scaled.width).toBe(32);
    expect(getPixel(scaled.pixels, 32, 32, 10, 10)).toEqual(hexToRgba('#DE884A'));
  });

  it('edits and transforms independent tiles without affecting adjacent tiles', () => {
    const sheet = createEmptyBuffer(32, 32);
    // Tile 0 (0..15, 0..15): paint top-left corner orange
    const tile0 = createEmptyBuffer(16, 16);
    setPixel(tile0, 16, 16, 1, 1, hexToRgba('#DE884A'));
    writeTile(sheet, 32, 32, 0, 16, 16, tile0);

    // Tile 1 (16..31, 0..15): paint top-left corner teal
    const tile1 = createEmptyBuffer(16, 16);
    setPixel(tile1, 16, 16, 0, 0, hexToRgba('#649291'));
    writeTile(sheet, 32, 32, 1, 16, 16, tile1);

    // Transform ONLY Tile 0: Rotate 90° CW -> (1,1) moves to (14,1)
    const afterRot = transformSingleTile(sheet, 32, 32, 0, 16, 16, 'cw');
    const t0After = extractTile(afterRot, 32, 32, 0, 16, 16);
    const t1After = extractTile(afterRot, 32, 32, 1, 16, 16);
    expect(getPixel(t0After, 16, 16, 14, 1)).toEqual(hexToRgba('#DE884A'));
    expect(getPixel(t0After, 16, 16, 1, 1).a).toBe(0);
    // Tile 1 MUST be completely untouched!
    expect(getPixel(t1After, 16, 16, 0, 0)).toEqual(hexToRgba('#649291'));

    // Flip ONLY Tile 0 Horizontally -> (14,1) returns to (1,1)
    const afterFlip = transformSingleTile(afterRot, 32, 32, 0, 16, 16, 'flipH');
    const t0Flip = extractTile(afterFlip, 32, 32, 0, 16, 16);
    expect(getPixel(t0Flip, 16, 16, 1, 1)).toEqual(hexToRgba('#DE884A'));
  });

  it('handles palette engine, hue-shifted ramps, GPL roundtrip, and global color replace', () => {
    expect(VERDANT_MASTER_PALETTE.colors.length).toBe(30);
    const ramp = generateHueShiftedRamp('#C25B32', 5, 28);
    expect(ramp.length).toBe(5);
    expect(ramp[0]).not.toBe(ramp[4]);

    const gpl = exportPaletteGPL(VERDANT_MASTER_PALETTE);
    const reimported = importPaletteText(gpl, 'Test');
    expect(reimported).not.toBeNull();
    expect(reimported!.colors.length).toBe(30);
    expect(reimported!.colors[0].hex).toBe('#231622');

    const doc = createBlankProject('ReplaceTest', 8, 8, 8);
    setPixel(doc.frames[0].cels[doc.layers[0].id], 8, 8, 3, 3, hexToRgba('#C25B32'));
    const { frames, replacedPixels } = replaceColorAcrossFrames(doc.frames, '#C25B32', '#649291');
    expect(replacedPixels).toBe(1);
    expect(getPixel(frames[0].cels[doc.layers[0].id], 8, 8, 3, 3)).toEqual(hexToRgba('#649291'));
  });

  it('encodes real multi-frame animated GIF89a binaries', () => {
    const f1 = createEmptyBuffer(16, 16);
    const f2 = createEmptyBuffer(16, 16);
    drawRectOnBuffer(f1, 16, 16, 2, 2, 6, 6, hexToRgba('#DE884A'), true, 1, 'square', 'none');
    drawRectOnBuffer(f2, 16, 16, 6, 6, 10, 10, hexToRgba('#649291'), true, 1, 'square', 'none');

    const gif = encodeAnimatedGIF(16, 16, [
      { pixels: f1, durationMs: 120 },
      { pixels: f2, durationMs: 120 },
    ]);
    const header = String.fromCharCode(...gif.slice(0, 6));
    expect(header).toBe('GIF89a');
    expect(gif[gif.length - 1]).toBe(0x3b);
    expect(gif.length).toBeGreaterThan(60);
  });

  it('roundtrips editable .vpf.json project AND opens real Dr. Mara Lin v2 (23 layers, 4544 opaque px)', () => {
    const doc = createBlankProject('Roundtrip_128', 128, 128, 16);
    setPixel(doc.frames[0].cels[doc.layers[0].id], 128, 128, 64, 64, hexToRgba('#DE884A'));
    const serialized = serializeVpfProject(doc);
    const reopened = deserializeProjectJSON(serialized);
    expect(reopened.width).toBe(128);
    expect(reopened.height).toBe(128);
    expect(reopened.layers.length).toBe(2);
    expect(getPixel(reopened.frames[0].cels[reopened.layers[0].id], 128, 128, 64, 64)).toEqual(hexToRgba('#DE884A'));

    // Load the REAL Dr. Mara Lin v2 128x128 23-layer .source.json directly from repo!
    const maraPath = path.resolve(
      __dirname,
      '../../../../game/assets/characters/player/mara_lin_concept_128x128_v2.source.json'
    );
    const rawMara = fs.readFileSync(maraPath, 'utf-8');
    const maraDoc = deserializeProjectJSON(rawMara, 'Mara_v2');
    expect(maraDoc.width).toBe(128);
    expect(maraDoc.height).toBe(128);
    expect(maraDoc.layers.length).toBe(23);

    const comp = compositeFrame(128, 128, maraDoc.layers, maraDoc.frames[0], null);
    const qc = runPixelQualityAudit(comp, 128, 128, VERDANT_MASTER_PALETTE, 16, 16);
    expect(qc.opaquePixels).toBe(4544);
    expect(qc.uniqueColors).toBe(27);
    expect(qc.offPalettePixels).toBe(0);
    expect(qc.semiAlphaPixels).toBe(0);

    // Confirm .source.json export & Godot manifest + .import sidecar format
    const exportedSrc = JSON.parse(exportAsVerdantSourceJSON(maraDoc));
    expect(exportedSrc.format).toBe('verdant_signal_indexed_pixel_source_v1');
    expect(exportedSrc.layer_order.length).toBe(23);

    const godotImport = buildGodotImportSidecar('mara_sheet.png');
    expect(godotImport).toContain('mipmaps/generate=false');
    expect(godotImport).toContain('compress/mode=0');

    const manifest = JSON.parse(
      buildGodotManifestJSON(
        maraDoc,
        'mara_sheet.png',
        { layout: 'horizontal', columns: 1, spacing: 0, margin: 0 },
        [{ frame: 0, x: 0, y: 0, w: 128, h: 128, durationMs: 140 }],
        1,
        1
      )
    );
    expect(manifest.godot_compatibility.texture_filter).toBe('TEXTURE_FILTER_NEAREST');
    expect(manifest.godot_compatibility.binary_alpha_verified).toBe(true);
  });

  it('exports AST-001 via tag_rows Godot 6x16 layout (96x384 RGBA8 PNG), passes continuity audit, and reloads saved .vpf.json', () => {
    const doc = buildAst001VpfProject();
    expect(doc.width).toBe(16);
    expect(doc.height).toBe(24);
    expect(doc.layers.length).toBe(8);
    expect(doc.frames.length).toBe(64);
    expect(doc.tags.length).toBe(16);
    expect(doc.pivot).toEqual({ x: 8, y: 22 });

    // 1. Export via VERDANT PIXEL FORGE tag_rows Godot sheet engine
    const sheet = renderSpriteSheetBuffer(doc, {
      layout: 'tag_rows',
      columns: 6,
      spacing: 0,
      margin: 0,
    });
    expect(sheet.width).toBe(96);
    expect(sheet.height).toBe(384);
    expect(sheet.cols).toBe(6);
    expect(sheet.rows).toBe(16);
    expect(sheet.frameRects.length).toBe(64);

    // 2. Verify all 32 unused cells are strictly transparent RGBA(0,0,0,0)
    const occupied = new Set(sheet.frameRects.map((m) => `${m.x},${m.y}`));
    expect(occupied.size).toBe(64);
    let unusedCells = 0;
    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 6; c++) {
        const key = `${c * 16},${r * 24}`;
        if (occupied.has(key)) continue;
        unusedCells++;
        for (let y = r * 24; y < (r + 1) * 24; y++) {
          for (let x = c * 16; x < (c + 1) * 16; x++) {
            const idx = (y * 96 + x) * 4;
            expect(sheet.pixels[idx + 3]).toBe(0);
          }
        }
      }
    }
    expect(unusedCells).toBe(32);

    // 3. Verify lossless RGBA8 PNG encoder header + IHDR dimensions
    const png = encodeSpriteSheetPNG(doc, { layout: 'tag_rows', columns: 6, spacing: 0, margin: 0 });
    const rawPng = encodeRGBA8PNG(sheet.pixels, sheet.width, sheet.height);
    expect(png.pngBytes.length).toBe(rawPng.length);
    expect(Array.from(png.pngBytes.slice(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    const dv = new DataView(png.pngBytes.buffer, png.pngBytes.byteOffset, png.pngBytes.byteLength);
    expect(dv.getUint32(16)).toBe(96);
    expect(dv.getUint32(20)).toBe(384);
    expect(png.pngBytes[24]).toBe(8); // 8-bit depth
    expect(png.pngBytes[25]).toBe(6); // RGBA8

    // 4. Verify multi-frame animation continuity & anti-mirroring QC
    const continuity = runAnimationContinuityAudit(doc);
    expect(continuity.allBinaryAlpha).toBe(true);
    expect(continuity.totalOffPalettePixels).toBe(0);
    expect(continuity.tagAudits.length).toBe(16);
    expect(continuity.tagAudits.every((t) => t.groundedAtPivotY)).toBe(true);
    expect(continuity.mirrorPairsDetected.length).toBe(4);
    expect(continuity.mirrorPairsDetected.every((m) => m.mirrorMatchPct < 35)).toBe(true);

    // 5. Verify saved candidate .vpf.json on disk reloads identically into Pixel Forge
    const vpfPath = path.resolve(
      __dirname,
      '../../../../game/assets/characters/player/candidates/ast001_char_mara_lin_candidate.vpf.json'
    );
    const reopened = deserializeProjectJSON(fs.readFileSync(vpfPath, 'utf-8'));
    expect(reopened.width).toBe(16);
    expect(reopened.height).toBe(24);
    expect(reopened.layers.length).toBe(8);
    expect(reopened.frames.length).toBe(64);
    expect(reopened.tags.length).toBe(16);

    // 6. Verify Godot manifest computes exact Sprite2D.offset = (0, -10)
    const manifest = JSON.parse(
      buildGodotManifestJSON(
        reopened,
        'ast001_char_mara_lin_sheet.png',
        { layout: 'tag_rows', columns: 6, spacing: 0, margin: 0 },
        sheet.frameRects,
        sheet.cols,
        sheet.rows
      )
    );
    expect(manifest.godot_compatibility.hframes).toBe(6);
    expect(manifest.godot_compatibility.vframes).toBe(16);
    expect(manifest.godot_compatibility.sprite2d_offset).toEqual({ x: 0, y: -10 });
    expect(manifest.sheet_layout.populated_cells).toBe(64);
    expect(manifest.sheet_layout.transparent_cells).toBe(32);
  });
});
