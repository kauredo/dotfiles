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

2. **Sketch sheet — volume first, both pools together.** Produce 60-100 small, fast thumbnails on one sheet. Each one overlaps something from the word pool (a brand-word shape) with something from the letterform pool (a real letter from `scripts/letterforms.mjs`) or with a simple primitive — rotate, nest, mirror, crop, vary scale and overlap amount. A thumbnail that only ever draws from one pool is leaving half the method unused; most of the sheet should cross the two. Thumbnails are small and quick, not individually precious. While generating, keep a running line per thumbnail of anything that reads as a found form — a shape that wasn't drawn on purpose, especially one sitting in a gap or counter. Render the full sheet to PNG (navigate Playwright to a `data:` URL of an HTML page holding the SVG grid, `file://` is blocked, then screenshot) and show it to the user before narrowing anything in step 3 — they may want to pick or flag favorites from the full sheet themselves rather than have the next round pre-select for them. **Done when:** the sheet holds at least 60 thumbnails, both pools are represented throughout (not segregated into two halves of the sheet), every thumbnail with a found form is flagged in the running list, and the rendered sheet has been shown to the user.

3. **Loop to 4.** Round 1: take the strongest 6-10 flagged found-forms and build each as one full, intricate final SVG — accurate curves from `scripts/letterforms.mjs` for any letter content, correct proportions, real construction detail. A final mark built from boxes and single strokes standing in for a letter has failed this step regardless of concept; rebuild it with real letterform geometry before judging it. Self-critique each against two tests: would this work for any company, or only this one's name and words (cliche test)? does the found shape read on its own, or only once labeled (aha test)? Keep what passes both. Log every rejected one in a **found-shape ledger** — one line: what it was, why it was cut — so a later round doesn't rebuild it. If fewer than 4 survive, pull more flagged thumbnails from the sheet (or run another sketch-sheet round seeded away from the ledger's rejects) and repeat. **Done when:** 4 concepts pass both tests, or 4 rounds are spent — report what's short and why if you stop early.

4. **Contact sheet.** Run `node scripts/contact-sheet.mjs <dir-of-svgs> <output.html>` on the 4 finalists (plus any strong runner-up worth showing). Render to PNG: navigate Playwright to a `data:` URL of the HTML (`file://` is blocked), then screenshot. **Done when:** one PNG shows every finalist, each labeled with its seed(s) and the found form.

When a direction is finalized, hand off to the `logo-brand-package` skill for lockups, pattern, mockups, and the style guide.
