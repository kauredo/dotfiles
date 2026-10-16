#!/usr/bin/env node
// Usage: node contact-sheet.mjs <dir-of-svgs> <output.html> [--cols=4]
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";

const [, , dir, outPath, ...rest] = process.argv;
if (!dir || !outPath) {
  console.error("Usage: node contact-sheet.mjs <dir-of-svgs> <output.html> [--cols=N]");
  process.exit(1);
}
const colsArg = rest.find((a) => a.startsWith("--cols="));
const cols = colsArg ? parseInt(colsArg.split("=")[1], 10) : 4;

const files = readdirSync(dir)
  .filter((f) => f.toLowerCase().endsWith(".svg"))
  .sort();

if (files.length === 0) {
  console.error(`No .svg files found in ${dir}`);
  process.exit(1);
}

const cells = files
  .map((file, i) => {
    const svg = readFileSync(join(dir, file), "utf8");
    const label = basename(file, ".svg").replace(/[-_]/g, " ");
    return `
    <figure class="cell">
      <div class="art">${svg}</div>
      <figcaption>${String(i + 1).padStart(2, "0")} · ${label}</figcaption>
    </figure>`;
  })
  .join("\n");

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<style>
  body { margin: 0; background: #fafafa; font-family: -apple-system, system-ui, sans-serif; }
  .sheet { display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 24px; padding: 32px; }
  .cell { background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; text-align: center; }
  .art { width: 100%; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; color: #111; }
  .art svg { width: 70%; height: 70%; }
  figcaption { margin-top: 8px; font-size: 12px; color: #555; }
</style></head>
<body><div class="sheet">${cells}</div></body></html>`;

writeFileSync(outPath, html);
console.log(`Wrote ${files.length} concepts to ${outPath}`);
