import { openSync, readSync, closeSync } from 'node:fs';

// Intrinsic size of a site image under public/, read from the file header at build time.
// Lets <img> carry width/height so the browser reserves space before the image loads (no layout shift).
// Returns {} for remote images or unreadable files, so it can always be spread into an <img>.
const cache = new Map<string, { width?: number; height?: number }>();
// Resolved from the project root: at build time this module runs from a bundled chunk, not from src/lib.
const PUBLIC = new URL('public/', `file://${process.cwd()}/`);

function readHeader(path: string): Buffer {
  const buf = Buffer.alloc(64 * 1024);
  const fd = openSync(new URL(path, PUBLIC), 'r');
  try {
    const n = readSync(fd, buf, 0, buf.length, 0);
    return buf.subarray(0, n);
  } finally {
    closeSync(fd);
  }
}

function parse(b: Buffer): { width?: number; height?: number } {
  // WebP
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const kind = b.toString('ascii', 12, 16);
    if (kind === 'VP8X') return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
    if (kind === 'VP8 ') return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    if (kind === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
  }
  // PNG
  if (b.readUInt32BE(0) === 0x89504e47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  // JPEG: walk segments to the first SOFn marker
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const marker = b[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
      }
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return {};
}

export function imgSize(src: string | null | undefined): { width?: number; height?: number } {
  if (!src || !src.startsWith('/')) return {};
  const path = src.replace(/[?#].*$/, '').replace(/^\//, '');
  if (cache.has(path)) return cache.get(path)!;
  let size: { width?: number; height?: number } = {};
  try {
    size = parse(readHeader(path));
  } catch {
    size = {};
  }
  cache.set(path, size);
  return size;
}
