/**
 * Pure TypeScript Lossless RGBA8 PNG Encoder (Works identically in Browser & Node)
 * Guarantees bit-exact pixel fidelity with zero browser color-profile or alpha-premultiplication drift!
 */

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[n] = c >>> 0;
}

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function adler32(bytes: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (let i = 0; i < bytes.length; i++) {
    a = (a + bytes[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function writeU32BE(buf: Uint8Array, offset: number, val: number): void {
  buf[offset] = (val >>> 24) & 0xff;
  buf[offset + 1] = (val >>> 16) & 0xff;
  buf[offset + 2] = (val >>> 8) & 0xff;
  buf[offset + 3] = val & 0xff;
}

function makeChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  writeU32BE(out, 0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  const crc = crc32(out.subarray(4, 8 + data.length));
  writeU32BE(out, 8 + data.length, crc);
  return out;
}

/**
 * Zlib stored-blocks stream (RFC 1950 + RFC 1951 BTYPE=00) — 100% lossless, zero dependencies,
 * deterministic across every browser and Node runtime.
 */
function zlibStore(raw: Uint8Array): Uint8Array {
  const maxBlock = 65535;
  const numBlocks = Math.max(1, Math.ceil(raw.length / maxBlock));
  const out = new Uint8Array(2 + raw.length + numBlocks * 5 + 4);
  let p = 0;
  // Zlib header (CM=8 deflate, CINFO=7, FCHECK valid -> 0x78 0x01)
  out[p++] = 0x78;
  out[p++] = 0x01;

  for (let off = 0, idx = 0; idx < numBlocks; idx++, off += maxBlock) {
    const len = Math.min(maxBlock, raw.length - off);
    const isFinal = idx === numBlocks - 1 ? 1 : 0;
    out[p++] = isFinal; // BFINAL | BTYPE=00 (stored)
    out[p++] = len & 0xff;
    out[p++] = (len >>> 8) & 0xff;
    const nlen = (~len) & 0xffff;
    out[p++] = nlen & 0xff;
    out[p++] = (nlen >>> 8) & 0xff;
    if (len > 0) {
      out.set(raw.subarray(off, off + len), p);
      p += len;
    }
  }
  const adler = adler32(raw);
  writeU32BE(out, p, adler);
  return out;
}

export function encodeRGBA8PNG(rgba: Uint8ClampedArray, width: number, height: number): Uint8Array {
  if (rgba.length !== width * height * 4) {
    throw new Error(`Invalid RGBA buffer length ${rgba.length} for ${width}x${height}`);
  }

  // Raw PNG scanlines: 1 filter byte (0 = None) + width * 4 RGBA bytes per row
  const stride = width * 4;
  const raw = new Uint8Array(height * (1 + stride));
  for (let y = 0; y < height; y++) {
    const rowOut = y * (1 + stride);
    raw[rowOut] = 0;
    raw.set(rgba.subarray(y * stride, (y + 1) * stride), rowOut + 1);
  }

  const ihdr = new Uint8Array(13);
  writeU32BE(ihdr, 0, width);
  writeU32BE(ihdr, 4, height);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0; // Deflate compression
  ihdr[11] = 0; // Adaptive filter
  ihdr[12] = 0; // No interlace

  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const cIHDR = makeChunk('IHDR', ihdr);
  const cIDAT = makeChunk('IDAT', zlibStore(raw));
  const cIEND = makeChunk('IEND', new Uint8Array(0));

  const out = new Uint8Array(sig.length + cIHDR.length + cIDAT.length + cIEND.length);
  let pos = 0;
  out.set(sig, pos); pos += sig.length;
  out.set(cIHDR, pos); pos += cIHDR.length;
  out.set(cIDAT, pos); pos += cIDAT.length;
  out.set(cIEND, pos);
  return out;
}
