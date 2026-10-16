# Construction Techniques — Rendering a Found Shape in SVG

Shape play (step 2) finds the idea; these are the concrete ways to build whatever you found, cleanly. Reach for whichever matches what's actually there — never pick a technique first and go looking for a shape to justify it.

**It reads through the gap** — the found form lives in the space between two overlapped shapes, not in either shape itself. Build the two source shapes first, then cut the found form out with a `<mask>` (white = visible, black = the found shape silhouette) or a path using `fill-rule="evenodd"` with opposing winding. The cut must read instantly at thumbnail size — check by imagining the viewBox shrunk to 32px.

**It reads through overlap** — the found form is the intersection itself, where two shapes cross. Draw each source shape as its own path/shape in one `<g>`, then fill the intersection region as a third path with a distinct treatment (a different tone, or the background color cutting through the top shape). Keep it to 2-3 source shapes; past that the intersection stops reading as one thing.

**It reads through repetition** — the found form only appears once an element repeats (a stack, a fan, a ring). Use a `<g>` with the element duplicated 3-7 times via explicit `transform` per copy, varying one parameter linearly (angle, spacing, or size) so the repeat has a direction, not just a tile.

**It reads through a single swap** — the found form is an expected letterform or icon with exactly one sub-part replaced by something from the brand's own vocabulary. Draw the expected shape first, then replace only the one most-identifying sub-part. Swapping more than one part loses the read; the rest has to stay recognizable so the swap looks deliberate rather than broken.

**It reads through alignment** — the found form only resolves once several pieces line up along one implied line or curve. Align 2+ shape edges or centers on that line, and taper size or spacing along it rather than keeping every piece uniform.
