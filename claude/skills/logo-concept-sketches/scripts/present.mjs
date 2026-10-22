#!/usr/bin/env node
// Finalist board: each mark large on light, large on dark, on its construction
// (when <name>.construction.svg exists, from construct.mjs), then at 96, 48 and 24px.
// Usage: node present.mjs <dir-of-finalist-svgs> <out.svg>
// Each finalist SVG uses viewBox 0 0 100 100 and paints with currentColor, so the
// dark tile recolours it. A mark that falls apart at 24px is not a logo yet.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";

const [, , dir, outPath] = process.argv;
if (!dir || !outPath) {
  console.error("Usage: node present.mjs <dir-of-finalist-svgs> <out.svg>");
  process.exit(1);
}
const inner = (svg) => svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
const files = readdirSync(dir).filter((f) => f.endsWith(".svg") && !f.endsWith(".construction.svg") && f !== basename(outPath)).sort();
const rows = files.map((file, i) => {
  const art = inner(readFileSync(join(dir, file), "utf8"));
  const guidePath = join(dir, file.replace(/\.svg$/, ".construction.svg"));
  const guides = existsSync(guidePath) ? inner(readFileSync(guidePath, "utf8")) : "";
  const y = 44 + i * 300;
  const mark = (x, yy, s, color, extra = "") => `<svg x="${x}" y="${yy}" width="${s}" height="${s}" viewBox="0 0 100 100" color="${color}"><g fill="currentColor">${art}</g>${extra}</svg>`;
  let x = guides ? 840 : 580;
  const small = [96, 48, 24].map((s) => {
    const el = mark(x, y + 120 - s / 2, s, "#111");
    x += s + 30;
    return el;
  });
  return [
    `<text x="40" y="${y - 12}" font-size="18" font-weight="700">${basename(file, ".svg").replace(/[-_]/g, " ")}</text>`,
    mark(40, y, 240, "#111"),
    `<rect x="300" y="${y}" width="240" height="240" rx="12" fill="#1c1c1c"/>`,
    mark(330, y + 30, 180, "#f4efe6"),
    guides ? `<rect x="560" y="${y}" width="240" height="240" rx="12" fill="#fff"/>` + mark(560, y, 240, "#d9d6cf", guides) : "",
    ...small,
  ].join("");
});
const W = files.some((f) => existsSync(join(dir, f.replace(/\.svg$/, ".construction.svg")))) ? 1160 : 900;
writeFileSync(
  outPath,
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${44 + files.length * 300}" font-family="Helvetica, Arial, sans-serif"><rect width="100%" height="100%" fill="#f4f4f2"/>${rows.join("")}</svg>`,
);
console.log(`Wrote ${files.length} finalists to ${outPath}`);
