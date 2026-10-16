# Design Moves — SVG Construction Patterns

Five combinable moves, from Allan Peters' process. Each entry: what it is, and the concrete SVG technique.

**Negative space** — the gap between two shapes reads as a third, meaningful shape. Build the positive shape first, then cut the counter-shape out of it with a `<mask>` or a path using `fill-rule="evenodd"` with two subpaths (outer + inner, opposite winding). The cut shape must read instantly at thumbnail size — check by imagining the viewBox shrunk to 32px.

**Overlapping geometry** — two or more primitive shapes (circle, triangle, bar) overlap so their intersection forms a new region. Draw each primitive as its own path/shape in the same `<g>`, then either: (a) give the top shape a solid fill matching the background so it "cuts into" the one below, or (b) fill the intersection itself as a third path with a distinct treatment (darker tone, texture). Keep it to 2-3 primitives; past that it stops reading as a mark.

**Visual rhythm** — a small element repeats at a regular interval (rotation, spacing, scale step) to imply motion, sound, or growth. Use a `<g>` with the repeated element duplicated 3-7 times via explicit `transform="rotate(...)"` or `translate(...)` per copy — vary one parameter linearly (angle, spacing, or size) so the repetition has direction, not just tiling.

**Unexpected twist on an expected visual** — take the obvious icon for the brand noun and swap exactly one sub-part for something from a different register (a leaf where a flame would be, a bolt where a wing would be). Draw the expected silhouette first, then replace the single most identifying sub-shape. Changing more than one part loses the twist — the rest must stay recognizable so the swap reads as deliberate.

**Visual flow** — directional elements (an arrow-like taper, a diagonal cluster, size easing) lead the eye through the mark in one direction, often toward a focal point (wordmark, icon). Align 2+ shape edges or centers along one implied line/curve; taper size or spacing along that line rather than keeping every element uniform.

Combine two moves in one concept only when the brief calls for complexity (e.g., negative space + visual rhythm for a brand about repetition). Most concepts should use exactly one move cleanly.
