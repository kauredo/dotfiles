// A wordmark drawn from the mark's own rules instead of typeset: each letter is a few
// centerlines stroked at one width with the mark's ends and joins, so the name shares the
// mark's stroke, terminals and corner angle.
//
//   import { placed } from "./lettering.mjs";
//   const w = placed("dois agentes", ALPHABET, 0, 0, 88);   // { d, w, stroke }
//
// An alphabet maps each character to { w, d: [centerline, ...], fill: [path, ...] } in stroke
// units (stroke = 1), y down. d holds centerlines to stroke; fill holds filled shapes (a dot
// drawn as a little house, say), unioned as they are. The default grid puts the ascender top
// at 0 and the baseline at 14; pass { grid } when the letters use another height. A
// centerline 0.5 in from an edge puts the stroke's outer edge on it. Write only the letters
// the name uses. references/lettering.md has a worked alphabet.
const S = new URL("../../logo-concept-sketches/scripts/", import.meta.url).pathname;
const { outline, unite, transform, bounds } = await import(`${S}shapes.mjs`);

/** The text as one outline in stroke units, plus its advance width. gap: space between letters. */
export function word(text, alphabet, { gap = 1.75, cap = "butt", join = "miter" } = {}) {
  let x = 0;
  const pieces = [];
  for (const ch of text) {
    const g = alphabet[ch];
    if (!g) throw new Error(`No letter "${ch}" in the alphabet`);
    for (const d of g.d ?? []) pieces.push(transform(outline(d, 1, { cap, join }), { translate: [x, 0] }));
    for (const d of g.fill ?? []) pieces.push(transform(d, { translate: [x, 0] }));
    x += g.w + gap;
  }
  return { d: unite(...pieces), w: x - gap };
}

/** The text placed so ascender top to baseline is `h`, with that top-left at (x, y). */
export function placed(text, alphabet, x, y, h, { grid = 14, ...opts } = {}) {
  const { d, w } = word(text, alphabet, opts);
  const s = h / grid;
  return { d: transform(d, { scale: [s, s, 0, 0], translate: [x, y] }), w: w * s, stroke: s, box: bounds(d) };
}
