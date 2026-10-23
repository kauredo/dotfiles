---
name: logo-brand-package
description: Build the hand-off package for a chosen logo mark in Allan Peters' manner: a drawn wordmark, lockups, a pattern made of the mark, mockups and a one-page guide, each piece judged by blind critics. Use once a final logo SVG is chosen.
model: opus
metadata: { "openclaw": { "emoji": "📦" } }
---

# Logo Brand Package

One mark becomes a **system**: every piece is built from the mark's own geometry (its unit, its angle, its ends, its distinctive part), so the package would still say the brand with the logo covered. A package that drops the mark into templates scores like a template.

You judge your own pieces badly, because you know what each is meant to be. Blind critics judge every round, and their verdicts decide what stays. They score craft against the bar and fit against the brand's **temperature** (from the sketch run, or ask the user for it in two or three words), because craft alone drifts toward clever and cold. Read `references/critics.md` before step 6.

## Tools

The sketch skill's scripts in `../logo-concept-sketches/scripts/` (run `node glyphs.mjs --setup` there once): `shapes.mjs` for outlines and booleans, `render.mjs` for every PNG, `ab.mjs` for blind pairs. Here, in `scripts/`:

- `lettering.mjs`: a wordmark from an alphabet of centerlines and filled shapes, stroked with the mark's ends and joins.
- `repeat.mjs`: the whole mark repeated over an area copy by copy, and one period as a tileable SVG.

Write the package as one generator script that writes every SVG and PNG, so one fix rebuilds the set.

## Workflow

1. **Read the mark.** Write these at the top of the generator:
   - **Kind:** a **line mark** (drawn in strokes, like a d in two parallel lines) or a **solid mark** (a filled silhouette, like two houses with a door cut out). Several rules below differ by kind.
   - **1u:** a line mark's stroke. A solid mark's narrowest ink: the shortest distance between two **parallel** edges (two edges meeting at an angle give a false minimum).
   - Its corner angle, its ends (square, round), its ink box, and its **distinctive part**: what makes it this mark and not a category icon (the d-casa double stem, the Casas door that is a third house).
   - **Its letter.** If blind viewers read the mark as a letter (from the sketch run, or ask three now), check it against the name. A letter of the name goes into step 2. A letter the name lacks (Casas reads M; the name has none) will sit before every wordmark as that letter: tell the user before building, and continue only on their word.
   - **Source files:** when the brand already ships a logo, build every lockup from its exact files (paths and transforms) and diff each shipped variant against the others before assuming they differ: one shipped icon was the lockup's mark scaled by 1.4666, and a package that mixed the two drew the mark 47% too big. Check whether a wordmark is a typeface outlined (it was Outfit Bold) before calling it drawn. A shipped mark is not redesigned here: record its weaknesses from a blind pass (the identity and red-flag viewers in the sketch skill) and hand them to the user.
   - **Mark fixes:** a weakness in the mark itself that the sketch run's critics or the user named (a nest that floats, an eye that reads smug) is fixed first and A/B'd against the current mark, fit included; the package builds on the winner. Show the user the fixed mark beside the original before going on.
   - **Palette:** if the source has none, propose a ground, an ink and an accent named after something of the brand (for a Portuguese agency: cal, tinta, telha), with usage ratios (60/30/10) and a tint of the accent. Proceed and say so; the user can swap colours any time.
   **Done when:** all of the above are written, and any letter the name lacks has the user's answer.

2. **Lettering.** Draw the name, don't set it, with `lettering.mjs` and `references/lettering.md`. Then rank it before anything carries it: build the primary lockup with the drawn name and with three or four typefaces whose stroke weight and terminals match the mark (`glyphs.mjs` has ten; download others from Google Fonts), send them shuffled to three critics (`references/critics.md`), and keep the winner. Every other piece shows the lettering, so a wrong one costs every later round.
   **Done when:** one lettering has won the ranking, and you have read the name aloud letter by letter from the PNG.

3. **Lockups and patterns.** Lockups: primary, stacked, icon, wordmark alone, reversed, one-colour; each a standalone SVG reusing the source paths, clear space 2u. If the mark is a letter of the name, the primary lets it **be** that letter (`references/lettering.md`). Then a hero device, a texture and a **second voice** (a device from the mark's geometry that holds content): build the candidates in `references/patterns.md`, rank them with three blind critics, and screen every candidate in every orientation with the red-flag prompt in `references/critics.md`.
   **Done when:** every lockup renders, and a hero device, a texture and a second voice have each won their ranking with no red flag by the cut rule.

4. **Mockups and guide.** Build the pieces in `references/mockups.md`: business card front and back, tote, street sign, avatar, and the one-page guide.
   **Done when:** every piece renders and you have looked at each PNG.

5. **Look before the critics.** In each PNG: text running into text or into its own ground colour, a shape crossing a panel edge, a copy cut in half at a clear zone, the mark beside a word that repeats its letter, a size rule the sample on the same page contradicts. Then the **whole silhouette** of each mockup, mark and object together, against the red-flag list: a handle, post or strap grown from a solid mark read phallic to 3 of 3 critics, and two handle loops made a torii.
   **Done when:** none of those is left.

6. **Rounds until it holds.** Run rounds as `references/critics.md` defines them, carrying every change two critics agree on into the next rebuild.
   **Done when:** three critics score the system 7 or more and no piece lost its last A/B, or four rounds have run, or the critics' agreed gap for two rounds is one the method cannot close (flat vector scenes). Then report each piece's last score, the system and fit scores per round and that gap. The hand-off is the board from the best-scoring round (`references/critics.md`).

7. **Hand off.** One folder: `logo.svg` (`currentColor`), `lockups/`, `lettering/` (the alphabet and the name as outlines), `pattern.svg` (one period), `mockups/`, `style-guide.svg` and `.png`, and one board PNG of the whole package. Logo, lockup and lettering files carry outlines only; mockups and the guide may keep live text in the typeface the guide names. Only `logo.svg` uses `currentColor`; lockups, mockups and the guide carry explicit hex fills, because a bare `currentColor` renders black when the SVG opens on its own.
   **Done when:** the board shows every piece and each file opens on its own.
