#!/usr/bin/env node
// The look-again sheet: every cell four ways, so the gaps can be read as shapes.
//   1. the sketch   2. its negative space   3. the sketch upside down   4. the negative upside down
// In the negative view the enclosed gaps are solid black, the mark is pale grey and
// the open background is white. Small openings are closed first (--close, in px at
// 160px cells), so a gap that is almost sealed, like the space between four birds
// in a ring, still counts as a shape.
// Usage: node lookagain.mjs <cells.json> <out-prefix> [--close=4] [--per-page=36]
// Writes <out-prefix>-1.png, -2.png ... with cells numbered as in cells.json.
import { readFileSync, writeFileSync } from "node:fs";
import { rasterize, encodePng, svgToPng } from "./render.mjs";

const [, , inPath, prefix, ...rest] = process.argv;
if (!inPath || !prefix) {
  console.error("Usage: node lookagain.mjs <cells.json> <out-prefix> [--close=4] [--per-page=36]");
  process.exit(1);
}
const opt = (k, d) => Number((rest.find((a) => a.startsWith(`--${k}=`)) || `=${d}`).split("=")[1]);
const S = 160;
const R = opt("close", 4);
const PER = opt("per-page", 36);
const cells = JSON.parse(readFileSync(inPath, "utf8"));

function morph(mask, r, grow) {
  // Square-ish disc dilation (grow) or erosion over a binary mask.
  const out = new Uint8Array(mask.length);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      let hit = !grow;
      for (let dy = -r; dy <= r && hit !== grow; dy++)
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy > r * r) continue;
          const xx = x + dx, yy = y + dy;
          const v = xx < 0 || yy < 0 || xx >= S || yy >= S ? 0 : mask[yy * S + xx];
          if (grow ? v : !v) { hit = grow; break; }
        }
      out[y * S + x] = hit ? 1 : 0;
    }
  return out;
}

function views(svgInner) {
  const { pixels } = rasterize(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" color="#111">${svgInner}</svg>`, S);
  const ink = new Uint8Array(S * S);
  for (let i = 0; i < S * S; i++) {
    const [r, g, b] = [pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2]];
    ink[i] = 0.3 * r + 0.59 * g + 0.11 * b < 200 ? 1 : 0;
  }
  const closed = R > 0 ? morph(morph(ink, R, true), R, false) : ink;
  const outside = new Uint8Array(S * S);
  const stack = [];
  for (let i = 0; i < S; i++) stack.push(i, (S - 1) * S + i, i * S, i * S + S - 1);
  while (stack.length) {
    const i = stack.pop();
    if (outside[i] || closed[i]) continue;
    outside[i] = 1;
    const x = i % S, y = (i / S) | 0;
    if (x > 0) stack.push(i - 1);
    if (x < S - 1) stack.push(i + 1);
    if (y > 0) stack.push(i - S);
    if (y < S - 1) stack.push(i + S);
  }
  const neg = new Uint8Array(S * S * 4);
  for (let i = 0; i < S * S; i++) {
    const v = ink[i] ? 210 : outside[i] ? 255 : 17;
    neg.set([v, v, v, 255], i * 4);
  }
  const flip = (px) => {
    const o = new Uint8Array(px.length);
    for (let i = 0; i < S * S; i++) o.set(px.subarray((S * S - 1 - i) * 4, (S * S - i) * 4), i * 4);
    return o;
  };
  const orig = new Uint8Array(pixels);
  return [orig, neg, flip(orig), flip(neg)].map((px) => `data:image/png;base64,${encodePng(S, S, px).toString("base64")}`);
}

const cols = 2, rowH = S + 26, colW = 4 * (S + 6) + 24;
for (let p = 0; p * PER < cells.length; p++) {
  const page = cells.slice(p * PER, (p + 1) * PER);
  const parts = page.map((c, k) => {
    const n = p * PER + k + 1;
    const x = 16 + (k % cols) * colW, y = 16 + Math.floor(k / cols) * rowH;
    const imgs = views(c.svg).map((src, j) => `<image x="${x + j * (S + 6)}" y="${y + 18}" width="${S}" height="${S}" href="${src}"/>`).join("");
    const label = `<text x="${x}" y="${y + 13}" font-size="13" font-family="Helvetica, Arial, DejaVu Sans, sans-serif"><tspan font-weight="700">${n}</tspan> ${String(c.label).replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`;
    return label + imgs;
  });
  const W = 32 + cols * colW, H = 32 + Math.ceil(page.length / cols) * rowH;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#fff"/>${parts.join("")}</svg>`;
  writeFileSync(`${prefix}-${p + 1}.png`, svgToPng(svg, W));
  console.log(`Wrote ${prefix}-${p + 1}.png (${page.length} cells)`);
}
