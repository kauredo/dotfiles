// A brand pattern made of the whole mark, drawn mark by mark over an area so no tile edge
// cuts a copy and no seam shows, plus the same repeat as a tileable SVG for the hand-off.
//
//   import { repeat, tile } from "./repeat.mjs";
//   repeat({ mark, ink, W: 350, H: 200, color: "#2A3D5E", scale: 0.36, skip })   // SVG fragment
//   tile({ mark, ink, color, ground })                                           // standalone SVG
//
// mark: path data in a 100 box. ink: its inked box { x, y, w, h }.
// gapX, gapY: space between copies in mark units (default 12 each; 0 lets copies share walls).
// offset: "column" drops alternate columns half a step, "row" shifts alternate rows half a
// step, "none" is a plain grid. color: a fill, or (col, row) => fill for an accent copy.
// skip(x, y, w, h): return true to leave a copy out, to clear whole copies around a logo.
// Copies are never mirrored or turned: a letter beside its mirror or turn spells a pair
// (a d made "dp" and "db"), and blind viewers cut both.
const layout = ({ ink, gapX = 12, gapY = 12 }) => ({ pw: ink.w + gapX, ph: ink.h + gapY });

export function repeat({ mark, ink, W, H, color, scale = 1, gapX, gapY, offset = "column", skip = () => false, x0 = 0, y0 = 0 }) {
  const { pw, ph } = layout({ ink, gapX, gapY });
  const fill = typeof color === "function" ? color : () => color;
  const out = [];
  for (let c = -1; (c - 1) * pw * scale < W; c++)
    for (let r = -1; (r - 1) * ph * scale < H; r++) {
      const odd = (n) => Math.abs(n) % 2 === 1;
      const x = x0 + (c * pw + (offset === "row" && odd(r) ? pw / 2 : 0)) * scale;
      const y = y0 + (r * ph + (offset === "column" && odd(c) ? ph / 2 : 0)) * scale;
      if (skip(x, y, ink.w * scale, ink.h * scale)) continue;
      out.push(`<path transform="translate(${x},${y}) scale(${scale}) translate(${-ink.x},${-ink.y})" d="${mark}" fill="${fill(c, r)}" fill-rule="evenodd"/>`);
    }
  return `<g>${out.join("")}</g>`;
}

/** One period of the repeat as a standalone SVG that tiles edge to edge. */
export function tile({ mark, ink, color, ground, gapX, gapY, offset = "column" }) {
  const { pw, ph } = layout({ ink, gapX, gapY });
  const w = offset === "column" ? 2 * pw : pw, h = offset === "row" ? 2 * ph : ph;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${ground ? `<rect width="${w}" height="${h}" fill="${ground}"/>` : ""}${repeat({ mark, ink, W: w, H: h, color, gapX, gapY, offset })}</svg>`;
}
