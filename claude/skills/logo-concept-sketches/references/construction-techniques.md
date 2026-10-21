# Construction Techniques — Rendering a Found Shape in SVG

Shape play (step 2) finds the idea; these are the concrete ways to build whatever you found, with real craft. Reach for whichever matches what's actually there — never pick a technique first and go looking for a shape to justify it. Letters come from `scripts/glyphs.mjs` outlines; hand-build only shapes no typeface has.

**It reads through the gap** — the found form lives in the space between two overlapped shapes, not in either shape itself. Build the two source shapes first (real letterform paths, not approximations), then cut the found form out with a `<mask>` (white = visible, black = the found shape silhouette) or a path using `fill-rule="evenodd"` with opposing winding. The cut must read instantly at thumbnail size — check by imagining the viewBox shrunk to 32px, and verify the mask actually renders before calling the concept done; an invisible cut is a failed concept, not a subtle one.

**It reads through overlap** — the found form is the intersection itself, where two shapes cross. Draw each source shape as its own path in one `<g>`, then fill the intersection region as a third path with a distinct treatment (a different tone, or the background color cutting through the top shape). Keep it to 2-3 source shapes; past that the intersection stops reading as one thing.

**It reads through repetition** — the found form only appears once an element repeats (a stack, a fan, a ring). Use a `<g>` with the element duplicated 3-7 times via explicit `transform` per copy, varying one parameter linearly (angle, spacing, or size) so the repeat has a direction, not just a tile.

**It reads through a single swap** — the found form is an expected letterform with exactly one sub-part replaced by something from the brand's own vocabulary. Fill the glyph's silhouette (`parts[0]`), then cut the new sub-part at the old one's box (`parts[1].box` is the first counter): replace only the one most-identifying sub-part. Swapping more than one part loses the read.

**It reads through alignment** — the found form only resolves once several pieces line up along one implied line or curve. Align 2+ shape edges or centers on that line, and taper size or spacing along it rather than keeping every piece uniform.

## Quality bar

A letter in a final concept is a typeface glyph, or a hand construction with the same discipline: circular arcs with a true centre and radius (`ringSegment` in `letterforms.mjs`), one stroke weight carried through the mark, bezier spines with real control points.

Knock out with a `<mask>` or `fill-rule="evenodd"`, so the cut is empty space on any background. Paint with `currentColor` so the same file works on light and dark. One accent colour is allowed from round 2 on, when it is what makes a hidden form legible (the 2 inside an A).
