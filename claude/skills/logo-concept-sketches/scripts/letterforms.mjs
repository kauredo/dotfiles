#!/usr/bin/env node
// Accurate geometric letterform paths built from real circular-arc and bezier
// construction (the way a geometric sans is actually drawn), not boxes.
// Import these functions; never hand-approximate a letter with a rect/ellipse.
//
// Coordinate convention: SVG space, y increases downward. Angles are degrees,
// measured clockwise from the positive x-axis (0 = right, 90 = down, 180 = left,
// 270 = up) — matches how the arcs below sweep visually.

export function pt(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

/** Filled ring segment (constant-width circular arc band) between two angles. */
export function ringSegment(cx, cy, r, sw, startDeg, endDeg) {
  const large = endDeg - startDeg > 180 ? 1 : 0;
  const [ox1, oy1] = pt(cx, cy, r, startDeg);
  const [ox2, oy2] = pt(cx, cy, r, endDeg);
  const [ix2, iy2] = pt(cx, cy, r - sw, endDeg);
  const [ix1, iy1] = pt(cx, cy, r - sw, startDeg);
  return [
    `M ${ox1} ${oy1}`,
    `A ${r} ${r} 0 ${large} 1 ${ox2} ${oy2}`,
    `L ${ix2} ${iy2}`,
    `A ${r - sw} ${r - sw} 0 ${large} 0 ${ix1} ${iy1}`,
    "Z",
  ].join(" ");
}

/** Geometric "U": two stems plus a true circular-arc bowl, no approximated curve. */
export function letterU(cx, topY, bowlCenterY, r, sw) {
  const leftOuter = cx - r;
  const rightOuter = cx + r;
  const leftInner = cx - r + sw;
  const rightInner = cx + r - sw;
  const leftStem = `M ${leftOuter} ${topY} L ${leftOuter} ${bowlCenterY} L ${leftInner} ${bowlCenterY} L ${leftInner} ${topY} Z`;
  const rightStem = `M ${rightInner} ${topY} L ${rightInner} ${bowlCenterY} L ${rightOuter} ${bowlCenterY} L ${rightOuter} ${topY} Z`;
  const bowl = ringSegment(cx, bowlCenterY, r, sw, 0, 180);
  return { leftStem, rightStem, bowl, combined: [leftStem, rightStem, bowl].join(" ") };
}

/** Geometric "P": stem plus a circular-arc bowl in the upper portion. */
export function letterP(stemX, topY, bottomY, sw, bowlR) {
  const stem = `M ${stemX} ${topY} L ${stemX + sw} ${topY} L ${stemX + sw} ${bottomY} L ${stemX} ${bottomY} Z`;
  const bowlCx = stemX + sw / 2;
  const bowlCy = topY + bowlR;
  const bowl = ringSegment(bowlCx, bowlCy, bowlR, sw, -100, 110);
  return { stem, bowl, combined: [stem, bowl].join(" ") };
}

/** Geometric "S" spine: two cubic-bezier arcs, meant to be stroked, not filled. */
export function letterS(cx, topY, bottomY, halfWidth) {
  const midY = (topY + bottomY) / 2;
  return [
    `M ${cx + halfWidth} ${topY}`,
    `C ${cx - halfWidth * 1.3} ${topY}, ${cx - halfWidth * 1.3} ${midY}, ${cx} ${midY}`,
    `C ${cx + halfWidth * 1.3} ${midY}, ${cx + halfWidth * 1.3} ${bottomY}, ${cx - halfWidth} ${bottomY}`,
  ].join(" ");
}
