---
name: logo-concept-sketches
description: Generate logo concepts for a brand through high-volume shape play combining brand-word imagery and letterform/negative-space discovery, with the user cutting the word list and picking from the sketch sheet, ending in 3 refined concepts. Use when starting logo or brand-mark design, or exploring directions before committing to one concept.
model: opus
metadata: { "openclaw": { "emoji": "✏️" } }
---

# Logo Concept Sketches

Allan Peters' funnel: a wide brand-notes list, the client cuts it, many rough sketches from what survived, the client picks, refinement, three concepts. The user is the client at both cuts, so the workflow stops twice and waits for them. Find marks, don't assemble them: two seed pools feed the sketches, what the brand's words look like and what its own letters look like.

Letters come from real type. `scripts/glyphs.mjs` returns the outline of any text in ten typefaces, from heavy grotesk to didone to script, plus each contour on its own (`parts[0]` the silhouette, the rest counters). A sketched A starts as an A someone drew well, then gets cut, merged or swapped. Run `node scripts/glyphs.mjs --setup` once per machine. Hand-built geometry is for icons and for drawn monoline letters no typeface has (`scripts/letterforms.mjs` has `ringSegment` for true arcs). `scripts/lines.mjs` dresses any centerline as a parallel-line system, a weave, rays or hatching: the detail that separates a mark from an icon. Read `references/construction-techniques.md` before step 2's combine pass.

Write the sketches as one generator script per run (a `.mjs` that imports `glyph`, emits `cells.json`), so a fix to one construction re-renders the whole sheet.

## Workflow

1. **Brand notes, then the first cut.** Read what the brand is (README, site, the user's words). Write 70-100 words, objects and concepts tied to it, grouped (product, people, place, values, objects), each with the one or two shapes it looks like. Add 3-5 letterform seeds from the name itself: initials and monograms, numerals or words hiding inside it ("Dois Agentes" → 2A, DA, "da"), the letters with the most distinctive shape. Number everything and send it to the user, asking them to keep 10-15 words plus the seeds they like. Wait for the answer.
   **Done when:** the user has replied with their cut.

2. **Rough sketches, then the second cut.** Sketch only from what the user kept: 50-80 cells on one sheet built with `scripts/sheet.mjs` (each cell is SVG markup in a 0-100 box), in three sections. Rough is fine; legible is required.
   - **Letterforms:** each kept seed across the typefaces, turned, mirrored, overlapped, nested, reversed out of a disc, letters sharing a stroke.
   - **Words:** each kept word as a bold icon, filled or with strokes no thinner than ~8% of the box.
   - **Combine:** kept words crossed with each other and with the seeds through the construction techniques (word + word, word + letter). Place every cut and swap from the glyph's own geometry (`parts[i].box`), so a keyhole lands in the A's counter in every typeface.
   Render with `rsvg-convert sheet.svg -o sheet.png`; where that is missing, navigate Playwright to a `data:image/svg+xml` URL of the file and screenshot (`file://` is blocked on some hosts). Look at the PNG, fix every broken cell, flag the found forms, then send the sheet and ask the user to pick 5-8 by number, with your own picks and one line on each. Wait for the answer.
   **Done when:** every cell renders as intended in the PNG you looked at, and the user has picked.

3. **Refine to 3.** Build each pick as a family of 3-6 variants on a round sheet, the way one letter gets fifteen sketches: typeface, weight, line count, weave, container, accent. Judge each against two tests: does it belong only to this name and these words (cliché test), and does the found shape read before anyone labels it (aha test)? Keep a **found-shape ledger**, one line per cut variant with why, so later rounds skip it. Refine the survivors again until three stand: one stroke system each, clean at 24px.
   **Done when:** 3 concepts pass both tests, or 4 rounds are spent and you report what's short and why.

4. **Present 3.** Save each concept as its own SVG (viewBox 0 0 100 100, painted with `currentColor`, knockouts done with masks), run `node scripts/present.mjs <dir> board.svg` and render it. The board shows each mark large on light, large on dark, and at 96, 48 and 24px. Fix any mark that breaks on dark or blurs at 24px.
   **Done when:** one PNG shows the 3 concepts in every condition, each with one line on its seed and its found form.

When a direction is chosen, hand off to `logo-brand-package`.
