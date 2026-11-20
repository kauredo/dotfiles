#!/usr/bin/env node
// Gathers an image-model pass into sheet cells. The fal MCP server saves every result to its
// download folder (~/Downloads unless DOWNLOAD_PATH is set) as fal_*.jpg whatever the real
// format: Recraft sends WebP, or SVG in its vector styles. This moves the files matching
// --match (every fal_* name, from every model) into <outDir>/raw, names each copy by its real type, converts WebP to PNG with
// macOS sips (resvg cannot draw WebP), and writes <outDir>/all-cells.json, one cell per image.
// Usage: node collect-images.mjs <outDir> --match=2026-11-19 [--from=~/Downloads]
// Then pick: write <outDir>/cells.json with only the keepers, each with a label naming its idea.
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync, copyFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const [, , outDir, ...rest] = process.argv;
const opt = (k) => (rest.find((a) => a.startsWith(`--${k}=`)) || "").split("=")[1];
const match = opt("match");
const from = (opt("from") || process.env.DOWNLOAD_PATH || join(homedir(), "Downloads")).replace(/^~/, homedir());
if (!outDir || !match) {
  console.error("Usage: node collect-images.mjs <outDir> --match=<text in the filename, e.g. a date> [--from=dir]");
  process.exit(1);
}
const raw = join(outDir, "raw");
mkdirSync(raw, { recursive: true });
for (const f of readdirSync(from).filter((f) => f.startsWith("fal_") && f.includes(match))) renameSync(join(from, f), join(raw, f));

function kind(buf) {
  if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "webp";
  if (buf[0] === 0x89 && buf.subarray(1, 4).toString() === "PNG") return "png";
  if (buf[0] === 0xff && buf[1] === 0xd8) return "jpg";
  if (buf.subarray(0, 2000).toString().includes("<svg")) return "svg";
  return null;
}
const MIME = { png: "image/png", jpg: "image/jpeg", svg: "image/svg+xml" };
const cells = [];
readdirSync(raw)
  .filter((f) => f.startsWith("fal_"))
  .sort()
  .forEach((f, i) => {
    const buf = readFileSync(join(raw, f));
    let ext = kind(buf);
    if (!ext) return;
    // Names vary by tool: fal_fal_ai_recraft_v3_text_to_image_<time>.jpg, fal_ideogram_v3_<time>_<n>.jpg
    const model = f.match(/^fal_(?:fal_ai_)?([a-z]+)/)?.[1] || "model";
    const base = join(outDir, `${String(i + 1).padStart(2, "0")}-${model}`);
    if (ext === "webp") {
      execFileSync("sips", ["-s", "format", "png", "-Z", "400", join(raw, f), "--out", `${base}.png`], { stdio: "ignore" });
      ext = "png";
    } else copyFileSync(join(raw, f), `${base}.${ext}`);
    const data = readFileSync(`${base}.${ext}`).toString("base64");
    cells.push({
      section: "image model",
      label: `${String(i + 1).padStart(2, "0")} ${model}`,
      svg: `<image href="data:${MIME[ext]};base64,${data}" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid meet"/>`,
    });
  });
writeFileSync(join(outDir, "all-cells.json"), JSON.stringify(cells));
const perModel = {};
for (const c of cells) {
  const m = c.label.split(" ")[1];
  perModel[m] = (perModel[m] || 0) + 1;
}
console.log(`${cells.length} images collected into ${outDir}/all-cells.json`);
console.log(`Per model: ${Object.entries(perModel).map(([m, n]) => `${m} ${n}`).join(", ")}. These must equal what the pass generated.`);
