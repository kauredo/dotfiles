---
name: logo-concept-sketches
description: Generate logo concepts for a brand through letterform/monogram play and negative-space shape discovery, looping batches until 4 original concepts land. Use when starting logo or brand-mark design, or exploring directions before committing to one concept.
metadata: { "openclaw": { "emoji": "✏️" } }
---

# Logo Concept Sketches

Find marks, don't assemble them. The generator is shape play around the brand's own letters, not a checklist of techniques applied to a word list. Read `references/construction-techniques.md` once you've found something worth building precisely — it's for execution, not ideation.

## Workflow

1. **Letterform seeds.** Pull 3-5 seeds straight from the brand name: its initials/monogram, any word or meaning hiding inside it (UpSpeech → "US", which reads as a monogram and as the word "us" — family, group, together), and the 1-2 letters with the most distinctive shape (an ascender, a bowl, a counter). **Done when:** every seed is grounded in the actual name, not an invented icon for what the brand "represents."

2. **Shape play.** For each seed, sketch fast: overlap it with 2-4 simple primitives (a circle, a bar, the other initial, a shape literally pulled from the product) in many raw arrangements — rotate, nest, mirror, crop. Don't aim at an idea yet. Build first, look second: after each arrangement, scan the whole composition, including every gap and counter, for a form that wasn't drawn on purpose. That found form is the concept, not the primitives that made it. **Done when:** at least 15 raw arrangements exist and you have a running list of every found form spotted in them, however rough.

3. **Loop to 4.** Round 1: turn the 6-10 strongest found-forms from step 2 into clean single-color SVGs (240x240, no polish). Self-critique each against two tests: would this work for any company, or only this one's name (cliche test)? does the found shape read on its own, or only once labeled (aha test)? Keep what passes both. Log every rejected one in a **found-shape ledger** — one line: what it was, why it was cut — so a later round doesn't rebuild it. If fewer than 4 survive, run another round of step 2, seeded away from the ledger's rejects, and repeat. **Done when:** 4 concepts pass both tests, or 4 rounds are spent — report what's short and why if you stop early.

4. **Contact sheet.** Run `node scripts/contact-sheet.mjs <dir-of-svgs> <output.html>` on the 4 finalists (plus any strong runner-up worth showing). Render to PNG: navigate Playwright to a `data:` URL of the HTML (`file://` is blocked), then screenshot. **Done when:** one PNG shows every finalist, each labeled with its letterform seed and the found form.

When a direction is finalized, hand off to the `logo-brand-package` skill for lockups, pattern, mockups, and the style guide.
