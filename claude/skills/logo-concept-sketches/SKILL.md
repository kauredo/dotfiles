---
name: logo-concept-sketches
description: Generate logo concepts for a brand through high-volume letterform and negative-space shape play, looping batches until 4 original concepts land. Use when starting logo or brand-mark design, or exploring directions before committing to one concept.
metadata: { "openclaw": { "emoji": "✏️" } }
---

# Logo Concept Sketches

Find marks, don't assemble them — and find a lot of them before judging any. The generator is real letterform geometry pushed through fast, high-volume shape play, not a checklist applied to a word list. Read `references/construction-techniques.md` once you've found something worth building precisely. Use `scripts/letterforms.mjs` for every letter shape — it emits accurate circular/bezier letterform paths; never approximate a letter with a crude primitive (a rounded rect is not a "U").

## Workflow

1. **Letterform seeds.** Pull 3-5 seeds straight from the brand name: its initials/monogram, any word or meaning hiding inside it (UpSpeech → "US" — a monogram and the word "us," family/together), and the 1-2 letters with the most distinctive shape (an ascender, a bowl, a counter). **Done when:** every seed is grounded in the actual name, not an invented icon for what the brand "represents."

2. **Sketch sheet — volume first.** This is the brand-notes-dump of this process, done in shapes instead of words: produce 60-100 small, fast thumbnail arrangements on one sketch sheet, each overlapping a seed's real letterform (from `scripts/letterforms.mjs`, never a hand-drawn approximation) with 1-3 simple primitives — rotate, nest, mirror, crop, vary scale and overlap amount. Thumbnails are small and quick, not individually precious; the point is covering the combinatorial space fast enough to get past the obvious first dozen. While generating, keep a running line per thumbnail of anything that reads as a found form — a shape that wasn't drawn on purpose, especially one sitting in a gap or counter. **Done when:** the sheet holds at least 60 thumbnails and every one with a found form is flagged in the running list.

3. **Loop to 4.** Round 1: take the strongest 6-10 flagged found-forms and build each as one full, intricate final SVG — accurate curves from `scripts/letterforms.mjs`, correct proportions, real construction detail. A final mark built from boxes and single strokes has failed this step regardless of concept; rebuild it with real letterform geometry before judging it. Self-critique each against two tests: would this work for any company, or only this one's name (cliche test)? does the found shape read on its own, or only once labeled (aha test)? Keep what passes both. Log every rejected one in a **found-shape ledger** — one line: what it was, why it was cut — so a later round doesn't rebuild it. If fewer than 4 survive, pull more flagged thumbnails from the sheet (or run another sketch-sheet round seeded away from the ledger's rejects) and repeat. **Done when:** 4 concepts pass both tests, or 4 rounds are spent — report what's short and why if you stop early.

4. **Contact sheet.** Run `node scripts/contact-sheet.mjs <dir-of-svgs> <output.html>` on the 4 finalists (plus any strong runner-up worth showing). Render to PNG: navigate Playwright to a `data:` URL of the HTML (`file://` is blocked), then screenshot. **Done when:** one PNG shows every finalist, each labeled with its letterform seed and the found form.

When a direction is finalized, hand off to the `logo-brand-package` skill for lockups, pattern, mockups, and the style guide.
