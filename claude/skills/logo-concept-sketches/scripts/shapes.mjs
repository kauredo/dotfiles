// Real shape operations on SVG path data, so a mark ends as ONE outline instead of
// a stack of masks: letter surgery (delete an A's left leg, fuse what is left onto
// a 2's diagonal), strokes expanded to filled outlines, clean knockouts.
//
//   import { outline, unite, subtract, intersect, transform, keep } from "./shapes.mjs";
//   const leg = outline("M63 48L84 92", 12, { cap: "round" });   // stroke to filled outline
//   const mark = subtract(unite(two, leg), circle);              // one path, no masks
//
// Every function takes and returns path data strings. Needs paper and paperjs-offset,
// installed by `node glyphs.mjs --setup`.
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join } from "node:path";

const CACHE = join(homedir(), ".cache", "logo-concept-sketches");
function load(name) {
  for (const base of [import.meta.url, join(CACHE, "package.json")]) {
    try {
      return createRequire(base)(name);
    } catch {}
  }
  throw new Error(`${name} not found. Run: node glyphs.mjs --setup`);
}
const paper = load("paper");
const { PaperOffset } = load("paperjs-offset");
paper.setup(new paper.Size(100, 100));

const item = (d) => new paper.CompoundPath({ pathData: d, insert: false });
const data = (p) => {
  const d = p.pathData;
  p.remove();
  return d;
};

/** Union of any number of shapes. */
export const unite = (...ds) => data(ds.slice(1).reduce((acc, d) => acc.unite(item(d), { insert: false }), item(ds[0])));
/** `a` minus every following shape. */
export const subtract = (a, ...bs) => data(bs.reduce((acc, d) => acc.subtract(item(d), { insert: false }), item(a)));
/** Where `a` and `b` overlap. */
export const intersect = (a, b) => data(item(a).intersect(item(b), { insert: false }));
/** Either but not both: overlaps become holes. */
export const exclude = (a, b) => data(item(a).exclude(item(b), { insert: false }));
/** Keep only the part of `d` inside the box. */
export const keep = (d, x, y, w, h) => intersect(d, `M${x} ${y}H${x + w}V${y + h}H${x}Z`);
/** Remove the part of `d` inside the box. */
export const removeBox = (d, x, y, w, h) => subtract(d, `M${x} ${y}H${x + w}V${y + h}H${x}Z`);

/** A centerline stroked at `width`, as a filled outline. cap: butt|round; join: miter|round|bevel. */
export function outline(d, width, { cap = "round", join = "round" } = {}) {
  const p = item(d);
  // paperjs-offset 1.0.8 leaves a nub on some round caps, so round ends are built
  // as butt ends plus a true circle at each open end.
  const out = data(PaperOffset.offsetStroke(p, width / 2, { cap: "butt", join, insert: false }));
  if (cap !== "round") return out;
  const r = width / 2;
  const ends = p.children
    .filter((c) => !c.closed && c.segments.length > 1)
    .flatMap((c) => [c.firstSegment.point, c.lastSegment.point])
    .map(({ x, y }) => `M${x - r} ${y}A${r} ${r} 0 1 0 ${x + r} ${y}A${r} ${r} 0 1 0 ${x - r} ${y}Z`);
  return ends.length ? unite(out, ...ends) : out;
}

/** Move, turn and scale a shape. rotate and scale pivot on (cx, cy), default the box centre (50, 50). */
export function transform(d, { translate, rotate, scale } = {}) {
  const p = item(d);
  if (scale) p.scale(scale[0], scale[1] ?? scale[0], new paper.Point(scale[2] ?? 50, scale[3] ?? 50));
  if (rotate) p.rotate(rotate[0], new paper.Point(rotate[1] ?? 50, rotate[2] ?? 50));
  if (translate) p.translate(new paper.Point(translate[0], translate[1]));
  return data(p);
}

/** Bounding box of a shape: { x, y, w, h }. */
export function bounds(d) {
  const b = item(d).bounds;
  return { x: b.x, y: b.y, w: b.width, h: b.height };
}
