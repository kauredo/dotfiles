#!/usr/bin/env node
// Blind A/B pairs for keep-the-winner: a revised variant replaces the one before it
// only if critics pick it without knowing which is which.
// Usage: node ab.mjs <pairs.json> <out-dir>
// pairs.json: [{ "id": "nib", "before": "round2/nib-3.svg", "after": "round3/nib-3.svg", "says": "a pen nib that is a house" }]
// A .svg is a mark in a 100 box, rendered on white. A .png (a finished page or mockup) is used as is.
// Writes <out-dir>/pairN-a.png and pairN-b.png in shuffled order, and <out-dir>.mapping.json beside the folder.
// Show the critic the PNGs and each pair's "says" line; never the mapping.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { svgToPng } from "./render.mjs";

const [, , inPath, out] = process.argv;
if (!inPath || !out) {
  console.error("Usage: node ab.mjs <pairs.json> <out-dir>");
  process.exit(1);
}
mkdirSync(out, { recursive: true });
const tile = (file) => {
  if (file.endsWith(".png")) return readFileSync(file);
  const src = readFileSync(file, "utf8");
  const svg = src.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  // Keep the source's own viewBox: a mark drawn in another box (0 244 750 768) renders blank in a 100 box.
  const vb = (src.match(/<svg[^>]*viewBox="([^"]+)"/) || [, "0 0 100 100"])[1];
  return svgToPng(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="600" height="600" color="#111"><rect width="100" height="100" fill="#fff"/><svg x="8" y="8" width="84" height="84" viewBox="${vb}" fill="currentColor">${svg}</svg></svg>`, 600);
};
// Pair paths resolve against the JSON file, not the working directory.
const at = (p) => resolve(dirname(inPath), p);
const mapping = JSON.parse(readFileSync(inPath, "utf8")).map((p, i) => {
  const flip = Math.random() < 0.5;
  const [a, b] = flip ? [at(p.after), at(p.before)] : [at(p.before), at(p.after)];
  writeFileSync(join(out, `pair${i + 1}-a.png`), tile(a));
  writeFileSync(join(out, `pair${i + 1}-b.png`), tile(b));
  return { pair: i + 1, id: p.id, says: p.says, a: flip ? "after" : "before", b: flip ? "before" : "after" };
});
writeFileSync(`${out.replace(/\/$/, "")}.mapping.json`, JSON.stringify(mapping, null, 2));
console.log(`Wrote ${mapping.length} pairs to ${out}; the mapping is ${out.replace(/\/$/, "")}.mapping.json, outside the folder the critic reads.`);
