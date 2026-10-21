---
name: logo-concept-sketches
description: Generate logo concepts for a brand through high-volume shape play combining brand-word imagery and letterform/negative-space discovery, looping batches until 4 original concepts land. Use when starting logo or brand-mark design, or exploring directions before committing to one concept.
metadata: { "openclaw": { "emoji": "✏️" } }
---

# Logo Concept Sketches

Find marks, don't assemble them — and find a lot of them before judging any. Two seed pools feed the same sketch sheet: what the brand's words literally look like, and what its own letters literally look like. Read `references/construction-techniques.md` once you've found something worth building precisely. Use `scripts/letterforms.mjs` for every letter shape — it emits accurate circular/bezier letterform paths; never approximate a letter with a crude primitive (a rounded rect is not a "U").

## Workflow

1. **Two seed pools.**
   - **Brand words:** brainstorm 70-100 words, objects, and concepts tied to the brand — industry, product, literal nouns, values. This is the volume dump; don't filter for quality yet, just range. For each, note the one or two simple shapes that word actually looks like (a waveform, a speech bubble, a heart, a staircase).
   - **Letterform seeds:** pull 3-5 straight from the name itself: its initials/monogram, any word or meaning hiding inside it (UpSpeech → "US" — a monogram and the word "us," family/together), and the 1-2 letters with the most distinctive shape (an ascender, a bowl, a counter).
   **Done when:** the word list has real range (70+, grounded in the brand, not generic), and every letterform seed is grounded in the actual name.

2. **Sketch sheet — monogram studies, then icon studies, then combine.** Produce 60-100 small thumbnails in three passes, in this order, on one sheet with labeled sections:
   - **Monogram studies (~20-25):** the letterform seeds alone — single letters and the combined monogram — in real variety: different weights, in/out of circle, square, and hex badges, interlocked, stacked, nested, mirrored, reversed. Every shape is a *solid filled glyph* (true counters cut with `fill-rule="evenodd"`, true circles via two 180° arcs — a single arc command spanning a full 360° is degenerate and renders blank or wrong in several engines, split it) — never a thin single-width stroke standing in for a letter.
   - **Icon studies (~15-20):** the word-pool shapes alone, each drawn once as a confident, bold, standalone icon (filled silhouette or a stroke no thinner than ~12% of the shape's own size) — a badge/crest/coin treatment where it fits. This is the pass that should look like Allan Peters' daily-logo sketches: simple, bold, instantly legible at thumbnail size, not a line diagram.
   - **Combine (~15-20):** cross the two pools using the construction techniques (gap, overlap, single-swap, alignment, repetition) — same bold weight standard as the first two passes, no dropping back to thin strokes once pools are crossed.
   Render the full sheet to PNG (navigate Playwright to a `data:` URL of an HTML page holding the SVG grid, `file://` is blocked, then screenshot) and show it to the user before narrowing anything in step 3 — they may want to pick or flag favorites from the full sheet themselves rather than have the next round pre-select for them. **Done when:** the sheet holds at least 60 thumbnails across all three passes, every shape is bold/filled rather than thin-stroked, every thumbnail with a found form is flagged in a running list, and the rendered sheet has been shown to the user.

3. **Loop to 4.** Round 1: take the strongest 6-10 flagged found-forms and build each as one full, intricate final SVG — accurate curves from `scripts/letterforms.mjs` for any letter content, correct proportions, real construction detail. A final mark built from boxes and single strokes standing in for a letter has failed this step regardless of concept; rebuild it with real letterform geometry before judging it. Self-critique each against two tests: would this work for any company, or only this one's name and words (cliche test)? does the found shape read on its own, or only once labeled (aha test)? Keep what passes both. Log every rejected one in a **found-shape ledger** — one line: what it was, why it was cut — so a later round doesn't rebuild it. If fewer than 4 survive, pull more flagged thumbnails from the sheet (or run another sketch-sheet round seeded away from the ledger's rejects) and repeat. **Done when:** 4 concepts pass both tests, or 4 rounds are spent — report what's short and why if you stop early.

4. **Contact sheet.** Run `node scripts/contact-sheet.mjs <dir-of-svgs> <output.html>` on the 4 finalists (plus any strong runner-up worth showing). Render to PNG: navigate Playwright to a `data:` URL of the HTML (`file://` is blocked), then screenshot. **Done when:** one PNG shows every finalist, each labeled with its seed(s) and the found form.

When a direction is finalized, hand off to the `logo-brand-package` skill for lockups, pattern, mockups, and the style guide.
