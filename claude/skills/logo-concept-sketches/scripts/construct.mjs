// The construction a mark is built on: the circles and lines every curve and edge
// comes from, drawn as thin guides. Declare it while building the mark, not after:
// a curve with no circle behind it is a curve nobody constructed.
//
//   import { construction } from "./construct.mjs";
//   const guides = construction({ circles: [[50, 30, 21]], lines: [[18, 92, 63, 48]], points: [[63, 48]] });
//   writeFileSync("mark.construction.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${guides}</svg>`);
//
// present.mjs shows <name>.construction.svg over a pale copy of <name>.svg.

const C = "#e5484d";
export function construction({ circles = [], lines = [], points = [], grid = 0 } = {}) {
  const parts = [];
  if (grid) {
    let d = "";
    for (let v = grid; v < 100; v += grid) d += `M${v} 0V100M0 ${v}H100`;
    parts.push(`<path d="${d}" stroke="${C}" stroke-opacity=".18" stroke-width=".25" fill="none"/>`);
  }
  for (const [cx, cy, r] of circles) parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" stroke="${C}" stroke-width=".4" fill="none"/>`);
  for (const [x1, y1, x2, y2] of lines) parts.push(`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${C}" stroke-width=".4" stroke-dasharray="1.6 1.2" fill="none"/>`);
  for (const [x, y] of points) parts.push(`<circle cx="${x}" cy="${y}" r="1" fill="${C}"/>`);
  return parts.join("");
}
