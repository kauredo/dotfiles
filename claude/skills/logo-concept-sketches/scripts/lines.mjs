#!/usr/bin/env node
// Line systems: the parallel-stroke, concentric, woven and radiating construction
// behind most Allan Peters-style marks. Draw a letter or object as one centerline
// path, then dress it with these. Every helper returns SVG markup for a 0 0 100 100
// box, painted in currentColor, transparent between the lines.
//
//   import { lines, weave, rays, hatch, circle } from "./lines.mjs";
//   lines("M20 90L50 14L80 90", { n: 3, w: 3.5, gap: 2.5 })   three parallel strokes
//   weave(underMarkup, "M30 70H70", { width: 14 })             cut a gap where a stroke passes over

let uid = 0;
const id = (p) => `${p}${++uid}`;

/** Full circle as path data (two arcs, so every renderer draws it). */
export const circle = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

/**
 * `n` parallel strokes following centerline `d`, each `w` wide, `gap` apart.
 * cap: "butt" | "round" | "square". The strokes stay parallel through every curve
 * and corner, which is what makes a line system read as drawn, not filled.
 * Total width is n*w + (n-1)*gap; pass it to weave() as the crossing width.
 */
export function lines(d, { n = 3, w = 3, gap = 2.5, cap = "butt", join = "round" } = {}) {
  const m = id("ln");
  const total = n * w + (n - 1) * gap;
  const bands = [];
  let width = total;
  for (let i = 0; i < 2 * n - 1; i++) {
    bands.push(`<path d="${d}" fill="none" stroke="${i % 2 ? "#000" : "#fff"}" stroke-width="${width.toFixed(2)}" stroke-linecap="${cap}" stroke-linejoin="${join}"/>`);
    width -= 2 * (i % 2 ? gap : w);
  }
  return `<mask id="${m}" maskUnits="userSpaceOnUse" x="-50" y="-50" width="200" height="200">${bands.join("")}</mask><rect x="-50" y="-50" width="200" height="200" fill="currentColor" mask="url(#${m})"/>`;
}

/**
 * Weave: cut a clean gap out of `under` (markup) along centerline `overD`, `width`
 * wide, so a later stroke along overD reads as passing over it. Draw the over
 * stroke after this. width = the over stroke's total width + 2 * the gap you want.
 */
export function weave(under, overD, { width = 12, cap = "butt" } = {}) {
  const m = id("wv");
  return `<mask id="${m}" maskUnits="userSpaceOnUse" x="-50" y="-50" width="200" height="200"><rect x="-50" y="-50" width="200" height="200" fill="#fff"/><path d="${overD}" fill="none" stroke="#000" stroke-width="${width}" stroke-linecap="${cap}"/></mask><g mask="url(#${m})">${under}</g>`;
}

/** `count` tapered rays from radius r0 to r1 around (cx, cy), starting at `start` degrees, across `sweep` degrees. */
export function rays(cx, cy, r0, r1, count, { start = 0, sweep = 360, taper = 0.5 } = {}) {
  const step = sweep / (sweep === 360 ? count : count - 1);
  const half = (Math.PI / 180) * (step * 0.5 * taper);
  let d = "";
  for (let i = 0; i < count; i++) {
    const a = ((start + i * step) * Math.PI) / 180;
    const p = (r, t) => `${(cx + r * Math.cos(t)).toFixed(2)} ${(cy + r * Math.sin(t)).toFixed(2)}`;
    d += `M${p(r0, a - half * 0.35)}L${p(r1, a - half)}L${p(r1, a + half)}L${p(r0, a + half * 0.35)}Z`;
  }
  return `<path d="${d}" fill="currentColor"/>`;
}

/** Parallel hatch lines at `angle` degrees, `spacing` apart, `w` thick, clipped to path `clipD`. */
export function hatch(clipD, { angle = 0, spacing = 6, w = 3 } = {}) {
  const c = id("ht");
  let d = "";
  for (let y = -100; y <= 200; y += spacing) d += `M-100 ${y}H200`;
  return `<clipPath id="${c}"><path d="${clipD}"/></clipPath><g clip-path="url(#${c})"><path d="${d}" stroke="currentColor" stroke-width="${w}" transform="rotate(${angle} 50 50)"/></g>`;
}
