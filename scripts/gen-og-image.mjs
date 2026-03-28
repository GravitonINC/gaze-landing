/**
 * Generates public/og-image.png — a 1200×630 branded OG card
 * for Gaze Protocol matching the "Ember Gallery" aesthetic.
 *
 * Pure Node.js (no external deps): uses built-in zlib + Buffer.
 * Run: node scripts/gen-og-image.mjs
 */

import { deflateSync } from 'zlib';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'og-image.png');

const W = 1200;
const H = 630;

// ── CRC32 table ──────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf, offset = 0, len = buf.length - offset) {
  let c = 0xffffffff;
  for (let i = offset; i < offset + len; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const out = Buffer.alloc(4 + 4 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  typeBuf.copy(out, 4);
  data.copy(out, 8);
  const crc = crc32(out, 4, 4 + data.length);
  out.writeUInt32BE(crc, 8 + data.length);
  return out;
}

// ── Pixel helpers ─────────────────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ── Draw the image ─────────────────────────────────────────────────────────────
// RGBA buffer
const pixels = new Uint8Array(W * H * 4);

// Brand colours
const BG   = [10,  10,  11]; // #0a0a0b
const SURF = [17,  17,  19]; // #111113
const EMBER = [232, 98, 42]; // #e8622a

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 4;
  pixels[i]     = r;
  pixels[i + 1] = g;
  pixels[i + 2] = b;
  pixels[i + 3] = a;
}

function getPixel(x, y) {
  const i = (y * W + x) * 4;
  return [pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]];
}

function blendPixel(x, y, r, g, b, a) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const [br, bg, bb, ba] = getPixel(x, y);
  const t = a / 255;
  const nt = 1 - t;
  setPixel(x, y,
    Math.round(r * t + br * nt),
    Math.round(g * t + bg * nt),
    Math.round(b * t + bb * nt),
    255
  );
}

// 1. Base background
for (let i = 0; i < W * H * 4; i += 4) {
  pixels[i]   = BG[0];
  pixels[i+1] = BG[1];
  pixels[i+2] = BG[2];
  pixels[i+3] = 255;
}

// 2. Subtle surface gradient (top brighter, left panel)
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const grad = (1 - y / H) * 0.04;
    const lr   = x < 480 ? (1 - x / 480) * 0.025 : 0;
    const boost = grad + lr;
    const r = clamp(Math.round(BG[0] + boost * 255), 0, 255);
    const g = clamp(Math.round(BG[1] + boost * 255), 0, 255);
    const b = clamp(Math.round(BG[2] + boost * 255), 0, 255);
    setPixel(x, y, r, g, b);
  }
}

// 3. Left-side ember radial glow  (centred at ~x=300, y=H/2)
const GX = 300, GY = H / 2;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const dx = x - GX, dy = y - GY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const t = clamp(1 - dist / 520, 0, 1);
    const glow = t * t * t * 0.55;   // cubic falloff, max 55% mix
    if (glow < 0.001) continue;
    const [pr, pg, pb] = getPixel(x, y);
    setPixel(x, y,
      clamp(Math.round(lerp(pr, EMBER[0], glow)), 0, 255),
      clamp(Math.round(lerp(pg, EMBER[1], glow)), 0, 255),
      clamp(Math.round(lerp(pb, EMBER[2], glow)), 0, 255),
    );
  }
}

// 4. Vertical separator line at x=540 (subtle glow border)
for (let y = 40; y < H - 40; y++) {
  const alpha = Math.round(clamp(30 + Math.sin(y * 0.02) * 8, 20, 40));
  for (let dx = -1; dx <= 1; dx++) {
    blendPixel(540 + dx, y, 255, 255, 255, dx === 0 ? alpha : Math.round(alpha * 0.3));
  }
}

// 5. Right side — soft ember accent spot (top-right)
const RGX = 960, RGY = 100;
for (let y = 0; y < H; y++) {
  for (let x = 540; x < W; x++) {
    const dx = x - RGX, dy = y - RGY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const t = clamp(1 - dist / 320, 0, 1);
    const glow = t * t * 0.18;
    if (glow < 0.001) continue;
    const [pr, pg, pb] = getPixel(x, y);
    setPixel(x, y,
      clamp(Math.round(lerp(pr, EMBER[0], glow)), 0, 255),
      clamp(Math.round(lerp(pg, EMBER[1], glow)), 0, 255),
      clamp(Math.round(lerp(pb, EMBER[2], glow)), 0, 255),
    );
  }
}

// 6. Draw ember dot (favicon-style) in the left panel
//    Outer glow
function drawCircle(cx, cy, radius, r, g, b, maxAlpha) {
  const r2 = Math.ceil(radius);
  for (let dy = -r2; dy <= r2; dy++) {
    for (let dx = -r2; dx <= r2; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) continue;
      const t = clamp(1 - dist / radius, 0, 1);
      blendPixel(cx + dx, cy + dy, r, g, b, Math.round(t * t * maxAlpha));
    }
  }
}

const DOT_X = 232, DOT_Y = H / 2;
drawCircle(DOT_X, DOT_Y, 90,  EMBER[0], EMBER[1], EMBER[2], 25);  // outer haze
drawCircle(DOT_X, DOT_Y, 50,  EMBER[0], EMBER[1], EMBER[2], 60);  // glow ring
drawCircle(DOT_X, DOT_Y, 22,  EMBER[0], EMBER[1], EMBER[2], 230); // solid core
drawCircle(DOT_X, DOT_Y, 10,  245, 180, 80, 200);                  // bright centre

// 7. Horizontal rule below the left panel title area
function hline(y, x0, x1, r, g, b, alpha) {
  for (let x = x0; x <= x1; x++) blendPixel(x, y, r, g, b, alpha);
}
hline(Math.round(H/2 - 80), 120, 440, 255, 255, 255, 18);
hline(Math.round(H/2 + 80), 120, 440, 255, 255, 255, 14);

// 8. Subtle scanline texture (every 2px, very faint)
for (let y = 0; y < H; y += 2) {
  for (let x = 0; x < W; x++) {
    const [pr, pg, pb] = getPixel(x, y);
    setPixel(x, y,
      Math.max(0, pr - 2),
      Math.max(0, pg - 2),
      Math.max(0, pb - 2),
    );
  }
}

// 9. Border vignette (subtle)
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const nx = x / W, ny = y / H;
    const edge = Math.max(0,
      Math.max(
        1 - nx * 8, nx * 8 - 7,
        1 - ny * 8, ny * 8 - 7
      )
    );
    if (edge < 0.001) continue;
    const dark = edge * 0.6;
    const [pr, pg, pb] = getPixel(x, y);
    setPixel(x, y,
      clamp(Math.round(pr * (1 - dark)), 0, 255),
      clamp(Math.round(pg * (1 - dark)), 0, 255),
      clamp(Math.round(pb * (1 - dark)), 0, 255),
    );
  }
}

// ── PNG encode ────────────────────────────────────────────────────────────────
// Convert RGBA → raw scanlines with filter byte 0
const scanlines = Buffer.alloc(H * (1 + W * 3));
let si = 0;
for (let y = 0; y < H; y++) {
  scanlines[si++] = 0; // filter type None
  for (let x = 0; x < W; x++) {
    const pi = (y * W + x) * 4;
    scanlines[si++] = pixels[pi];     // R
    scanlines[si++] = pixels[pi + 1]; // G
    scanlines[si++] = pixels[pi + 2]; // B
    // no alpha channel — colour type 2 (RGB)
  }
}

const compressed = deflateSync(scanlines, { level: 6 });

const IHDR_data = Buffer.alloc(13);
IHDR_data.writeUInt32BE(W, 0);
IHDR_data.writeUInt32BE(H, 4);
IHDR_data[8] = 8;  // bit depth
IHDR_data[9] = 2;  // colour type: RGB
IHDR_data[10] = 0; // compression
IHDR_data[11] = 0; // filter
IHDR_data[12] = 0; // interlace

const sig  = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const IHDR = chunk('IHDR', IHDR_data);
const IDAT = chunk('IDAT', compressed);
const IEND = chunk('IEND', Buffer.alloc(0));

const png = Buffer.concat([sig, IHDR, IDAT, IEND]);
writeFileSync(OUT, png);

console.log(`✓ Written ${png.length} bytes → ${OUT}`);
