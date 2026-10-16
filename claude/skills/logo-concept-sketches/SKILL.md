---
name: logo-concept-sketches
description: Generate a divergent batch of logo concept sketches as SVG using Allan Peters' brand-noun-to-design-move method. Use when starting logo or brand-mark design, or exploring directions before committing to one concept.
metadata: { "openclaw": { "emoji": "✏️" } }
---

# Logo Concept Sketches

Produce many fast, disposable SVG concepts before any gets refined. Read `references/design-moves.md` once per project; it holds the SVG construction patterns for step 2.

## Workflow

1. **Brand nouns.** Brainstorm 40-70 words/objects/shapes tied to the brand (industry, name, values, literal products). Write them as a flat list, no sketching yet. Ask the user to cut anything off-limits (competitor's territory, overused clichés for their category) before moving on. **Done when:** a shortlist of 10-15 "keeper" nouns is confirmed with the user, or the user explicitly delegates the cut to you.

2. **Combine with design moves.** Pair each keeper noun with one or two of the five moves in `references/design-moves.md` (negative space, overlapping geometry, visual rhythm, unexpected twist, visual flow). Favor combinations over a noun alone — "bird" is a cliché, "bird + talk bubble via negative space" is a concept. Generate one SVG per concept: 240x240 viewBox, single `currentColor` fill (or two flat colors max), no gradients, no photorealism, no polish. These are sketches. **Done when:** at least 8 distinct concept SVGs exist, covering at least 3 different moves, no duplicate noun+move pair.

3. **Contact sheet.** Run `node scripts/contact-sheet.mjs <dir-of-svgs> <output.html>` to lay every concept into one gridded, numbered sheet. Render it to PNG: navigate Playwright to the `file://` path of the HTML, then take a screenshot. **Done when:** one PNG contact sheet exists showing every concept with its number and one-line rationale underneath.

4. **Iterate on picks.** Get the user's picks (or an explicit "pick for me"). For each picked direction, repeat step 2 at higher fidelity: 2-3 refined variants per pick, same construction discipline. **Done when:** every pick has its refined variants, and the user has either chosen a direction to finalize or asked for another divergent round.

When a direction is finalized, hand off to the `logo-brand-package` skill for lockups, pattern, mockups, and the style guide.
