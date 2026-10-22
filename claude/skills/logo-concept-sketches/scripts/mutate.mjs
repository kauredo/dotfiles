// Accidents on purpose. A designer's fast scribbles land shapes slightly wrong, and
// the wrongness is where found forms come from. mutate() does that to a sketch built
// from parts: each variant nudges, turns, scales or mirrors the parts at random
// (seeded, so a variant can be rebuilt), and some variants cut overlapping parts out
// of each other, which leaves new shapes in the overlap.
//
//   import { mutate } from "./mutate.mjs";
//   const variants = mutate([birdMarkup, ringMarkup], { count: 24, seed: 7 });
//   variants.forEach((v) => add("Mutations", v.label, v.svg));
//
// Parts are SVG markup in the 0 0 100 100 box, painted in currentColor.

let uid = 0;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Options: count (24), seed (1), shift (max px, 14), turn (max degrees, 30),
 * scale ([min, max], [0.8, 1.25]), mirror (chance, 0.2), xor (chance a variant
 * cuts its parts out of each other, 0.4). Returns [{ label, svg }].
 */
export function mutate(parts, { count = 24, seed = 1, shift = 14, turn = 30, scale = [0.8, 1.25], mirror = 0.2, xor = 0.4 } = {}) {
  const r = rng(seed);
  const pick = (lo, hi) => lo + r() * (hi - lo);
  const out = [];
  for (let v = 0; v < count; v++) {
    const moves = [];
    const placed = parts.map((p, i) => {
      if (i > 0 && r() < 0.15) return p; // sometimes leave a part alone
      const dx = pick(-shift, shift), dy = pick(-shift, shift), a = pick(-turn, turn), s = pick(scale[0], scale[1]);
      const m = r() < mirror ? -1 : 1;
      moves.push(`${i}:${dx.toFixed(0)},${dy.toFixed(0)} ${a.toFixed(0)}° ×${s.toFixed(2)}${m < 0 ? " mirrored" : ""}`);
      return `<g transform="translate(${(50 + dx).toFixed(2)} ${(50 + dy).toFixed(2)}) rotate(${a.toFixed(1)}) scale(${(m * s).toFixed(3)} ${s.toFixed(3)}) translate(-50 -50)">${p}</g>`;
    });
    const cutting = placed.length > 1 && r() < xor;
    let svg;
    if (cutting) {
      // Each part loses whatever any other part covers: the overlaps become holes.
      svg = placed
        .map((p, i) => {
          const id = `mx${++uid}`;
          const others = placed.filter((_, j) => j !== i).join("");
          return `<mask id="${id}" maskUnits="userSpaceOnUse" x="-50" y="-50" width="200" height="200"><rect x="-50" y="-50" width="200" height="200" fill="#fff"/><g color="#000" fill="#000" stroke="#000">${others}</g></mask><g mask="url(#${id})">${p}</g>`;
        })
        .join("");
    } else svg = placed.join("");
    out.push({ label: `seed ${seed}.${v + 1}${cutting ? " cut" : ""}`, svg, moves });
  }
  return out;
}
