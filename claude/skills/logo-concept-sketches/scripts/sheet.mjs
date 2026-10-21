#!/usr/bin/env node
// Lays sketch cells out as one numbered SVG sheet, grouped by section.
// Usage: node sheet.mjs <cells.json> <out.svg> [--cols=8] [--cell=160]
// cells.json: [{ "section": "Monograms", "label": "DA shared stem", "flag": true,
//               "svg": "<path d='...'/>" }, ...]
// Each cell's svg is inner markup drawn in a 0 0 100 100 box. A flagged cell
// (a found form worth building) gets a red number. Render the result with
// `rsvg-convert out.svg -o out.png`, or open it in Playwright and screenshot.
import { readFileSync, writeFileSync } from "node:fs";

const [, , inPath, outPath, ...rest] = process.argv;
if (!inPath || !outPath) {
  console.error("Usage: node sheet.mjs <cells.json> <out.svg> [--cols=8] [--cell=160]");
  process.exit(1);
}
const opt = (k, d) => Number((rest.find((a) => a.startsWith(`--${k}=`)) || `=${d}`).split("=")[1]);
const cols = opt("cols", 8);
const cell = opt("cell", 160);
const gap = 12;
const pad = 24;
const labelH = 26;
const cells = JSON.parse(readFileSync(inPath, "utf8"));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

let y = pad;
let n = 0;
const out = [];
const sections = [...new Set(cells.map((c) => c.section))];
for (const section of sections) {
  out.push(`<text x="${pad}" y="${y + 20}" font-size="20" font-weight="700">${esc(section)}</text>`);
  y += 36;
  const group = cells.filter((c) => c.section === section);
  group.forEach((c, i) => {
    n += 1;
    const cx = pad + (i % cols) * (cell + gap);
    const cy = y + Math.floor(i / cols) * (cell + labelH + gap);
    const art = cell - 24;
    out.push(
      `<g transform="translate(${cx} ${cy})">`,
      `<rect width="${cell}" height="${cell + labelH}" rx="6" fill="#fff" stroke="${c.flag ? "#d22" : "#ddd"}" stroke-width="${c.flag ? 2 : 1}"/>`,
      `<svg x="12" y="12" width="${art}" height="${art}" viewBox="0 0 100 100" overflow="hidden">${c.svg}</svg>`,
      `<text x="8" y="${cell + 16}" font-size="11" fill="${c.flag ? "#d22" : "#555"}"><tspan font-weight="700">${n}</tspan> ${esc(c.label).slice(0, 26)}</text>`,
      `</g>`,
    );
  });
  y += Math.ceil(group.length / cols) * (cell + labelH + gap) + 12;
}
const width = pad * 2 + cols * cell + (cols - 1) * gap;
writeFileSync(
  outPath,
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${y + pad}" font-family="Helvetica, Arial, sans-serif">` +
    `<rect width="100%" height="100%" fill="#f4f4f2"/>${out.join("")}</svg>`,
);
console.log(`Wrote ${n} cells to ${outPath}`);
