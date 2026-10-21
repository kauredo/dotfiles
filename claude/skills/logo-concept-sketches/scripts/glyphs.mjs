#!/usr/bin/env node
// Real letterforms as SVG path data, taken from actual typeface outlines.
// A drawn "A" from a typeface carries the stress, apex, crossbar height and
// stroke contrast a designer would sketch; a triangle does not. Start every
// letter study from one of these, then cut, merge and swap parts by hand.
//
// Setup, once per machine:
//   node glyphs.mjs --setup        installs opentype.js and downloads the fonts
// Use from a script:
//   import { glyph, fonts } from "./glyphs.mjs";
//   const { d, box } = glyph("DA", "ArchivoBlack", { x: 10, y: 10, h: 80 });
// Or from the shell:
//   node glyphs.mjs "DA" ArchivoBlack     prints the path data, fitted to 100x100
//
// Fonts live in ~/.cache/logo-concept-sketches/fonts, or $LOGO_FONTS_DIR.

import { createRequire } from "node:module";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { join, basename } from "node:path";

const CACHE = join(homedir(), ".cache", "logo-concept-sketches");
const FONT_DIR = process.env.LOGO_FONTS_DIR || join(CACHE, "fonts");

// A deliberately wide spread of letter construction, all Google Fonts (OFL).
// Each one draws the same letter differently, which is the point.
export const FONT_SOURCES = {
  ArchivoBlack: "archivoblack/ArchivoBlack-Regular.ttf", // heavy grotesk
  PoppinsBold: "poppins/Poppins-Bold.ttf", // geometric, circular bowls
  PoppinsLight: "poppins/Poppins-Light.ttf", // geometric, thin
  BebasNeue: "bebasneue/BebasNeue-Regular.ttf", // condensed caps
  Staatliches: "staatliches/Staatliches-Regular.ttf", // squared condensed
  Righteous: "righteous/Righteous-Regular.ttf", // rounded display
  DMSerifDisplay: "dmserifdisplay/DMSerifDisplay-Regular.ttf", // high-contrast serif
  AbrilFatface: "abrilfatface/AbrilFatface-Regular.ttf", // didone, fat
  AlfaSlabOne: "alfaslabone/AlfaSlabOne-Regular.ttf", // slab
  Pacifico: "pacifico/Pacifico-Regular.ttf", // script
};

function setup() {
  mkdirSync(FONT_DIR, { recursive: true });
  execFileSync("npm", ["install", "--silent", "--prefix", CACHE, "opentype.js@1.3.4"], { stdio: "inherit" });
  for (const [name, src] of Object.entries(FONT_SOURCES)) {
    const out = join(FONT_DIR, `${name}.ttf`);
    if (existsSync(out)) continue;
    execFileSync("curl", ["-fsSL", "-o", out, `https://github.com/google/fonts/raw/main/ofl/${src}`]);
  }
  console.log(`Fonts in ${FONT_DIR}: ${fonts().join(", ")}`);
}

function opentype() {
  for (const base of [import.meta.url, join(CACHE, "package.json")]) {
    try {
      return createRequire(base)("opentype.js");
    } catch {}
  }
  throw new Error("opentype.js not found. Run: node glyphs.mjs --setup");
}

const loaded = {};
function load(name) {
  if (!loaded[name]) loaded[name] = opentype().loadSync(join(FONT_DIR, `${name}.ttf`));
  return loaded[name];
}

/** Names of every downloaded font. */
export function fonts() {
  return existsSync(FONT_DIR)
    ? readdirSync(FONT_DIR).filter((f) => f.endsWith(".ttf")).map((f) => basename(f, ".ttf"))
    : [];
}

/**
 * Outline of `text` in `fontName`, scaled so its ink is `h` tall with the top-left
 * of the ink at (x, y). Options: h (default 100), x, y, tracking (em units, may be
 * negative to make letters overlap), w (if set, also fits the width and centres).
 * Returns { d, box: { x, y, w, h } } where box is the inked area after placement.
 */
export function glyph(text, fontName, { x = 0, y = 0, h = 100, w, tracking = 0 } = {}) {
  const font = load(fontName);
  const size = 1000;
  const glyphs = font.stringToGlyphs(text);
  const parts = [];
  let pen = 0;
  for (let i = 0; i < glyphs.length; i++) {
    parts.push(glyphs[i].getPath(pen, 0, size));
    const kern = i < glyphs.length - 1 ? font.getKerningValue(glyphs[i], glyphs[i + 1]) : 0;
    pen += ((glyphs[i].advanceWidth + kern) / font.unitsPerEm) * size + tracking * size;
  }
  const raw = new (opentype().Path)();
  for (const p of parts) raw.extend(p);
  const b = raw.getBoundingBox();
  let s = h / (b.y2 - b.y1);
  if (w && (b.x2 - b.x1) * s > w) s = w / (b.x2 - b.x1);
  const inkW = (b.x2 - b.x1) * s;
  const inkH = (b.y2 - b.y1) * s;
  const ox = (w ? x + (w - inkW) / 2 : x) - b.x1 * s;
  const oy = y - b.y1 * s;
  const cmds = raw.commands.map((c) => {
    const m = { ...c };
    for (const [kx, ky] of [["x", "y"], ["x1", "y1"], ["x2", "y2"]]) {
      if (kx in m) {
        m[kx] = m[kx] * s + ox;
        m[ky] = m[ky] * s + oy;
      }
    }
    return m;
  });
  const out = new (opentype().Path)();
  out.commands = cmds;
  return { d: out.toPathData(2), box: { x: ox + b.x1 * s, y: oy + b.y1 * s, w: inkW, h: inkH }, parts: contours(cmds) };
}

// Every closed contour on its own, largest first. For a single letter, parts[0]
// is the outer silhouette and the rest are counters (the A's triangle, the D's
// bowl). Fill parts[0] alone for a solid letter, then cut your own counter
// shape at a counter's box: that is how a single-part swap is placed exactly.
function contours(cmds) {
  const P = opentype().Path;
  const groups = [];
  for (const c of cmds) {
    if (c.type === "M") groups.push([]);
    groups[groups.length - 1].push(c);
  }
  return groups
    .map((g) => {
      const xs = g.flatMap((c) => ["x", "x1", "x2"].filter((k) => k in c).map((k) => c[k]));
      const ys = g.flatMap((c) => ["y", "y1", "y2"].filter((k) => k in c).map((k) => c[k]));
      const p = new P();
      p.commands = g;
      const box = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
      return { d: p.toPathData(2), box };
    })
    .sort((a, b) => b.box.w * b.box.h - a.box.w * a.box.h);
}

if (process.argv[1] && import.meta.url.endsWith(basename(process.argv[1]))) {
  const [arg, fontName] = process.argv.slice(2);
  if (arg === "--setup") setup();
  else if (arg === "--list" || !arg) console.log(fonts().join("\n") || "No fonts yet. Run --setup.");
  else {
    const g = glyph(arg, fontName || "ArchivoBlack", { x: 0, y: 0, h: 100, w: 100 });
    writeFileSync(1, g.d + "\n");
  }
}
