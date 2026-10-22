#!/usr/bin/env node
// SVG to PNG with no system tools, so it runs the same on a laptop and a headless box.
// Usage: node render.mjs <in.svg> <out.png> [--width=1600]
// Library: import { rasterize, svgToPng, encodePng } from "./render.mjs";
// Needs @resvg/resvg-js, installed by `node glyphs.mjs --setup`.
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { homedir } from "node:os";
import { join, basename } from "node:path";

const CACHE = join(homedir(), ".cache", "logo-concept-sketches");

function resvg() {
  for (const base of [import.meta.url, join(CACHE, "package.json")]) {
    try {
      return createRequire(base)("@resvg/resvg-js").Resvg;
    } catch {}
  }
  throw new Error("@resvg/resvg-js not found. Run: node glyphs.mjs --setup");
}

/** Render SVG markup to { width, height, pixels } (RGBA, white background). */
export function rasterize(svg, width) {
  const Resvg = resvg();
  const img = new Resvg(svg, { fitTo: { mode: "width", value: width }, background: "#ffffff", font: { loadSystemFonts: true } }).render();
  return { width: img.width, height: img.height, pixels: img.pixels };
}

/** Render SVG markup straight to PNG bytes. */
export function svgToPng(svg, width) {
  const Resvg = resvg();
  return new Resvg(svg, { fitTo: { mode: "width", value: width }, background: "#ffffff", font: { loadSystemFonts: true } }).render().asPng();
}

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}
/** Encode RGBA pixels as PNG bytes. */
export function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) Buffer.from(rgba.buffer, rgba.byteOffset + y * width * 4, width * 4).copy(raw, y * (width * 4 + 1) + 1);
  const head = Buffer.alloc(13);
  head.writeUInt32BE(width, 0);
  head.writeUInt32BE(height, 4);
  head.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", head), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

if (process.argv[1] && import.meta.url.endsWith(basename(process.argv[1]))) {
  const [inPath, outPath, ...rest] = process.argv.slice(2);
  if (!inPath || !outPath) {
    console.error("Usage: node render.mjs <in.svg> <out.png> [--width=1600]");
    process.exit(1);
  }
  const w = Number((rest.find((a) => a.startsWith("--width=")) || "=1600").split("=")[1]);
  writeFileSync(outPath, svgToPng(readFileSync(inPath, "utf8"), w));
  console.log(`Wrote ${outPath}`);
}
