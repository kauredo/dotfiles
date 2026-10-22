---
name: logo-concept-sketches
description: Generate logo concepts for a brand through high-volume shape play combining brand-word imagery and letterform/negative-space discovery, with the user cutting the word list and picking from the sketch sheet, ending in 3 refined concepts. Use when starting logo or brand-mark design, or exploring directions before committing to one concept.
model: opus
metadata: { "openclaw": { "emoji": "✏️" } }
---

# Logo Concept Sketches

Allan Peters' funnel: a wide brand-notes list, the client cuts it, many rough sketches from what survived, a hard look at those sketches, the client picks, refinement, three concepts. The user is the client at both cuts, so the workflow stops twice and waits for them.

A logo idea is a **found form**: one shape that reads two ways (a "da" that is also a key, an A that is also a pen nib). A container with an icon inside is two shapes, not a found form. Found forms come from **looking again**: sketching fast, letting parts land wrong, then studying the sketches inverted, upside down and through their gaps until something reads that nobody drew on purpose.

## Tools

All in `scripts/`. Run `node glyphs.mjs --setup` once per machine; it installs the two npm dependencies and the fonts.

- `glyphs.mjs`: outlines of any text in ten typefaces, plus each contour (`parts[0]` the silhouette, the rest counters). Every letter starts here.
- `letterforms.mjs`: `ringSegment` for true arcs in drawn monoline letters no typeface has.
- `lines.mjs`: parallel-line systems, weaves, rays and hatching, to dress a centerline.
- `mutate.mjs`: seeded variants of a sketch built from parts (nudged, turned, scaled, mirrored, overlaps cut out of each other).
- `sheet.mjs`: the numbered sketch sheet as one SVG. `present.mjs`: the finalist board.
- `lookagain.mjs`: every cell four ways: as drawn, its enclosed negative space in black, both upside down.
- `render.mjs`: SVG to PNG with no system tools (`node render.mjs in.svg out.png`).

Write each round as one generator script (a `.mjs` emitting `cells.json`, each cell SVG markup in a 0-100 box), so one fix re-renders the whole sheet. Read `references/construction-techniques.md` before the first combine pass.

## Workflow

1. **Brand notes, then the first cut.** Read what the brand is (README, site, the user's words). Write 70-100 words, objects and concepts tied to it, grouped (product, people, place, values, objects), each with the one or two shapes it looks like. Add 3-5 letterform seeds from the name itself: initials and monograms, numerals or words hiding inside it ("Dois Agentes" → 2A, DA, "da"), the letters with the most distinctive shape. Number everything, save the list, and send it to the user, asking them to keep 10-15 words plus the seeds they like. Wait for the answer.
   **Done when:** the user has replied with their cut.

2. **Rough sketches.** Sketch only from what the user kept: 50-80 cells in three sections. Rough is fine; legible is required.
   - **Letterforms:** each kept seed across the typefaces, turned, mirrored, overlapped, nested, reversed out of a disc, letters sharing a stroke.
   - **Words:** each kept word as a bold icon, filled or with strokes no thinner than ~8% of the box.
   - **Combine:** kept words crossed with each other and with the seeds (word + word, word + letter). Place every cut and swap from the glyph's own geometry (`parts[i].box`).
   Render the sheet and look at the PNG; fix every cell that does not render as intended.
   **Done when:** every cell renders as intended in the PNG you looked at.

3. **Look again, then the second cut.**
   - Build every promising sketch from parts and run `mutate()` on it, 10-25 variants each: the accidents a pencil makes.
   - Run `lookagain.mjs` on the sketch sheet and on the mutations. Read every row: for each cell, name what the black gaps and the upside-down views look like, checking against the **whole** brand-notes list, cut words included. A discarded word that shows up in a gap comes back.
   - Sketch each find as its own small family on a finds sheet: where it came from, the view it showed up in, a cleaned-up version.
   Send the sketch sheet and the finds sheet, and ask the user to pick 5-8 by number, with your own picks and one line on each. Wait for the answer.
   **Done when:** every look-again row has been read, every find is on the finds sheet, and the user has picked.

4. **Refine to 3.** Build each pick as a family of 3-6 variants, the way one letter gets fifteen sketches: typeface, weight, line count, weave, container, accent. Run `lookagain.mjs` on each round sheet too; finds keep arriving while refining. Judge each variant against two tests: does it belong only to this name and these words (cliché test), and does the found form read before anyone labels it (aha test)? Keep a **found-shape ledger**, one line per cut variant with why, so later rounds skip it. Refine the survivors until three stand: one stroke system each, clean at 24px.
   **Done when:** 3 concepts pass both tests, or 4 rounds are spent and you report what's short and why.

5. **Present 3.** Save each concept as its own SVG (viewBox 0 0 100 100, painted with `currentColor`, knockouts done with masks), run `present.mjs` and render the board: each mark large on light, large on dark, and at 96, 48 and 24px. Fix any mark that breaks on dark or blurs at 24px.
   **Done when:** one PNG shows the 3 concepts in every condition, each with one line on its found form and where it was found.

When a direction is chosen, hand off to `logo-brand-package`.
