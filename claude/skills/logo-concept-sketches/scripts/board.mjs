#!/usr/bin/env node
// The user's board: the merged sheet with every cut cell faded and labelled with its reason,
// so numbering stays stable and the user sees what the viewers removed and why.
// Usage: node board.mjs <cells.json> <cuts.json> <out.json>
// cuts.json maps a 1-based cell number to its reason: { "12": "Nike swoosh", "40": "trident turned" }
// Then render: node sheet.mjs <out.json> board.svg && node render.mjs board.svg board.png
import { readFileSync, writeFileSync } from "node:fs";

const [, , cellsPath, cutsPath, outPath] = process.argv;
if (!cellsPath || !cutsPath || !outPath) {
  console.error("Usage: node board.mjs <cells.json> <cuts.json> <out.json>");
  process.exit(1);
}
const cuts = JSON.parse(readFileSync(cutsPath, "utf8"));
const cells = JSON.parse(readFileSync(cellsPath, "utf8")).map((c, i) => {
  const why = cuts[String(i + 1)];
  return why ? { ...c, label: `cut: ${why}`, svg: `<g opacity=".14">${c.svg}</g>` } : c;
});
writeFileSync(outPath, JSON.stringify(cells));
console.log(`${Object.keys(cuts).length} cut, ${cells.length - Object.keys(cuts).length} standing`);
