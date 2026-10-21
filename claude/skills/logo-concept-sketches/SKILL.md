---
name: logo-concept-sketches
description: Generate logo concepts for a brand through high-volume shape play combining brand-word imagery and letterform/negative-space discovery, looping batches until 4 original concepts land. Use when starting logo or brand-mark design, or exploring directions before committing to one concept.
model: opus
metadata: { "openclaw": { "emoji": "✏️" } }
---

# Logo Concept Sketches

Find marks, don't assemble them, and find a lot of them before judging any. Two seed pools feed one sketch sheet: what the brand's words look like, and what its own letters look like.

Letters come from real type. `scripts/glyphs.mjs` returns the outline of any text in ten typefaces, from heavy grotesk to didone to script, plus each contour on its own (`parts[0]` the silhouette, the rest counters). A sketched A starts as an A someone drew well, then gets cut, merged or swapped. Run `node scripts/glyphs.mjs --setup` once per machine. Hand-built geometry is for icons and for monoline constructions no typeface has (`scripts/letterforms.mjs` has `ringSegment` for true arcs). Read `references/construction-techniques.md` before building anything in step 2's combine pass.

Write the sketches as one generator script per run (a `.mjs` that imports `glyph`, emits `cells.json`), so a fix to one construction re-renders the whole sheet.

## Workflow

1. **Two seed pools.**
   - **Brand words:** read what the brand is (its README, site, the user's words), then brainstorm 70-100 words, objects and concepts tied to it: industry, product, literal nouns, values, place. Note the one or two shapes each word looks like.
   - **Letterform seeds:** pull 3-5 from the name itself: initials and monograms, numerals or words hiding inside it ("Dois Agentes" → 2A, DA, "da"), and the letters with the most distinctive shape.
   **Done when:** the word list has range (70+, grounded in this brand), and every letterform seed comes from the actual name.

2. **Sketch sheet: letterforms, icons, combine.** 60-100 cells in three labeled sections, built with `scripts/sheet.mjs` (each cell is SVG markup in a 0-100 box):
   - **Letterforms (~25):** each seed across the typefaces, then turned, mirrored, overlapped, nested, reversed out of a disc, letters sharing a stroke.
   - **Icons (~20):** each brand-word shape drawn once as a bold, confident icon, filled silhouettes or strokes no thinner than ~8% of the box.
   - **Combine (~20):** cross the pools with the construction techniques. Place every cut and swap from the glyph's own geometry (`parts[i].box`), so a keyhole lands in the A's counter in every typeface.
   Render with `rsvg-convert sheet.svg -o sheet.png`; where that is missing, navigate Playwright to a `data:image/svg+xml` URL of the file and screenshot (`file://` is blocked on some hosts). Look at the PNG yourself, fix every broken cell, then show the sheet to the user, flags included. They may pick from it directly.
   **Done when:** 60+ cells across the three sections, every cell renders as intended in the PNG you looked at, found forms are flagged, and the user has seen the sheet.

3. **Loop to 4.** Take the strongest 6-10 flagged cells and build each in 3-5 variants (typeface, weight, cut size, accent) on a round sheet. Judge each against two tests: does it belong only to this name and these words (cliché test), and does the found shape read before anyone labels it (aha test)? Keep a **found-shape ledger**, one line per cut concept with why, so later rounds skip it. Fewer than 4 survivors: pull more flagged cells, or run another sheet seeded away from the ledger.
   **Done when:** 4 concepts pass both tests, or 4 rounds are spent and you report what's short and why.

4. **Finalist board.** Save each finalist as its own SVG (viewBox 0 0 100 100, painted with `currentColor`, knockouts done with masks), then run `node scripts/present.mjs <finalists-dir> board.svg` and render it. The board shows each mark large on light, large on dark, and at 96, 48 and 24px. Fix any mark that breaks on dark or blurs at 24px.
   **Done when:** one PNG shows all 4 finalists in every condition, each with a one-line reason it exists: its seed and its found form.

When a direction is chosen, hand off to `logo-brand-package`.
