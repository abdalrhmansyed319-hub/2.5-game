/**
 * Pure TypeScript GIF89a Animated Sprite Encoder (LZW + Transparency + Per-Frame Delay)
 * Produces real, lossless indexed animated GIF binaries for crisp pixel art!
 */

function writeU16LE(out: number[], val: number): void {
  out.push(val & 0xff, (val >> 8) & 0xff);
}

function lzwEncode(indices: Uint8Array, minCodeSize: number): number[] {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;

  let dict = new Map<number, number>();
  const resetDict = () => {
    dict = new Map();
    codeSize = minCodeSize + 1;
    nextCode = eoiCode + 1;
  };

  const bytes: number[] = [];
  let bitBuf = 0;
  let bitCount = 0;

  const emit = (code: number) => {
    bitBuf |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      bytes.push(bitBuf & 0xff);
      bitBuf >>= 8;
      bitCount -= 8;
    }
  };

  emit(clearCode);
  if (indices.length === 0) {
    emit(eoiCode);
  } else {
    let prefix = indices[0];
    for (let i = 1; i < indices.length; i++) {
      const k = indices[i];
      const key = (prefix << 8) | k;
      const found = dict.get(key);
      if (found !== undefined) {
        prefix = found;
      } else {
        emit(prefix);
        if (nextCode < 4096) {
          dict.set(key, nextCode++);
          if (nextCode > 1 << codeSize && codeSize < 12) {
            codeSize++;
          }
        } else {
          emit(clearCode);
          resetDict();
        }
        prefix = k;
      }
    }
    emit(prefix);
    emit(eoiCode);
  }

  if (bitCount > 0) bytes.push(bitBuf & 0xff);

  // Split into GIF sub-blocks (max 255 bytes each)
  const blocks: number[] = [];
  for (let i = 0; i < bytes.length; i += 255) {
    const chunkLen = Math.min(255, bytes.length - i);
    blocks.push(chunkLen);
    for (let j = 0; j < chunkLen; j++) {
      blocks.push(bytes[i + j]);
    }
  }
  blocks.push(0); // block terminator
  return blocks;
}

export function encodeAnimatedGIF(
  width: number,
  height: number,
  frames: Array<{ pixels: Uint8ClampedArray; durationMs: number }>
): Uint8Array {
  // Build unified palette (index 0 reserved for transparency; up to 255 solid colors)
  const colorToIdx = new Map<number, number>();
  const palette: Array<[number, number, number]> = [[0, 0, 0]]; // idx 0 = transparent

  const findOrAddColor = (r: number, g: number, b: number): number => {
    const key = (r << 16) | (g << 8) | b;
    const existing = colorToIdx.get(key);
    if (existing !== undefined) return existing;
    if (palette.length < 256) {
      const idx = palette.length;
      palette.push([r, g, b]);
      colorToIdx.set(key, idx);
      return idx;
    }
    // Fallback nearest color when > 255 unique colors
    let bestIdx = 1;
    let bestD = Infinity;
    for (let i = 1; i < palette.length; i++) {
      const [pr, pg, pb] = palette[i];
      const d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
      if (d < bestD) {
        bestD = d;
        bestIdx = i;
      }
    }
    return bestIdx;
  };

  const indexedFrames = frames.map((f) => {
    const idxBuf = new Uint8Array(width * height);
    for (let p = 0; p < width * height; p++) {
      const o = p * 4;
      if (f.pixels[o + 3] < 128) {
        idxBuf[p] = 0;
      } else {
        idxBuf[p] = findOrAddColor(f.pixels[o], f.pixels[o + 1], f.pixels[o + 2]);
      }
    }
    return { indices: idxBuf, delayCs: Math.max(2, Math.round(f.durationMs / 10)) };
  });

  // Color table size must be a power of 2 >= 4
  let tableBits = 2;
  while (1 << tableBits < palette.length && tableBits < 8) tableBits++;
  const tableSize = 1 << tableBits;
  const minCodeSize = Math.max(2, tableBits);

  const out: number[] = [];
  // Header: GIF89a
  for (const ch of 'GIF89a') out.push(ch.charCodeAt(0));
  // Logical Screen Descriptor
  writeU16LE(out, width);
  writeU16LE(out, height);
  out.push(0x80 | 0x70 | (tableBits - 1)); // Global Color Table flag + 8-bit color res + size
  out.push(0); // bg color index
  out.push(0); // pixel aspect ratio

  // Global Color Table
  for (let i = 0; i < tableSize; i++) {
    const [r, g, b] = palette[i] ?? [0, 0, 0];
    out.push(r, g, b);
  }

  // NETSCAPE2.0 infinite looping extension
  out.push(0x21, 0xff, 0x0b);
  for (const ch of 'NETSCAPE2.0') out.push(ch.charCodeAt(0));
  out.push(0x03, 0x01, 0x00, 0x00, 0x00);

  // Frame blocks
  for (const frame of indexedFrames) {
    // Graphic Control Extension (disposal=2 restore bg, transparent index=0)
    out.push(0x21, 0xf9, 0x04, 0x09);
    writeU16LE(out, frame.delayCs);
    out.push(0x00, 0x00);

    // Image Descriptor
    out.push(0x2c);
    writeU16LE(out, 0);
    writeU16LE(out, 0);
    writeU16LE(out, width);
    writeU16LE(out, height);
    out.push(0x00); // no local color table

    // Image Data
    out.push(minCodeSize);
    const lzw = lzwEncode(frame.indices, minCodeSize);
    for (let i = 0; i < lzw.length; i++) out.push(lzw[i]);
  }

  out.push(0x3b); // GIF trailer
  return new Uint8Array(out);
}
