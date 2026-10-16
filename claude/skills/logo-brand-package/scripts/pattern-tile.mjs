#!/usr/bin/env node
// Usage: node pattern-tile.mjs <motif.svg> <output.svg> [--rows=4] [--cols=4] [--rotate=0] [--scale=1] [--tile=120]
import { readFileSync, writeFileSync } from "node:fs";

const [, , motifPath, outPath, ...rest] = process.argv;
if (!motifPath || !outPath) {
  console.error(
    "Usage: node pattern-tile.mjs <motif.svg> <output.svg> [--rows=N] [--cols=N] [--rotate=deg] [--scale=x] [--tile=px]"
  );
  process.exit(1);
}
const opt = (name, def) => {
  const arg = rest.find((a) => a.startsWith(`--${name}=`));
  return arg ? parseFloat(arg.split("=")[1]) : def;
};
const rows = opt("rows", 4);
const cols = opt("cols", 4);
const rotate = opt("rotate", 0);
const scale = opt("scale", 1);
const tile = opt("tile", 120);

const motifRaw = readFileSync(motifPath, "utf8");
// Strip the outer <svg ...> wrapper, keep inner content, so it can be re-embedded per cell.
const inner = motifRaw.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");

const cells = [];
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const cx = c * tile + tile / 2;
    const cy = r * tile + tile / 2;
    cells.push(
      `<g transform="translate(${cx},${cy}) rotate(${rotate}) scale(${scale}) translate(${-tile / 2},${-tile / 2})">${inner}</g>`
    );
  }
}

const width = cols * tile;
const height = rows * tile;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
${cells.join("\n")}
</svg>`;

writeFileSync(outPath, svg);
console.log(`Wrote ${rows}x${cols} tile (${width}x${height}) to ${outPath}`);
