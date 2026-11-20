---
name: logo-concept-sketches
description: Generate logo concepts for a brand through high-volume shape play combining brand-word imagery and letterform/negative-space discovery, with the user cutting the word list and picking from the sketch sheet, ending in 3 refined concepts. Use when starting logo or brand-mark design, or exploring directions before committing to one concept.
model: opus
metadata: { "openclaw": { "emoji": "✏️" } }
---

# Logo Concept Sketches

Allan Peters' funnel: a wide brand-notes list, the client cuts it, many rough sketches from what survived, a hard look at those sketches, the client picks, refinement, three concepts. The user is the client at both cuts, so the first loop stops twice and waits for them.

The funnel is a **loop**, not a line. Most ideas fail in refinement; when they do, the workflow goes back for more ideas, carrying everything it learned, until three concepts pass or the loop budget runs out.

A logo idea is a **found form**: one **silhouette** that reads two ways. Two gabled houses that form an M, whose shared door is a third little house; a P whose whole outline is a wine jug, the bowl its handle and the stem its body. The second reading lives in the outer silhouette, or in a gap the shapes already leave between them (the house between the M's gables, the FedEx arrow). Its opposite is a **decal**: an object carved into a letter's counter, or an icon set inside a circle or tile. A decal reads in half a second, the letter stays a frame around a picture, and on ProTasca the critics named it in every round while the client picked the one mark whose whole outline was the object. Found forms come from **looking again**: sketching fast, letting parts land wrong, then studying the sketches inverted, upside down and through their gaps until something reads that nobody drew on purpose.

You are the worst judge of what a sketch shows, because you know what it is meant to be. Blind subagents read every sheet: **viewers** say what they see and screen for red flags, **critics** score against the bar. Their prompts and rules are in `references/blind-viewers.md`; read it before step 3.

You are also one hand, and one hand repeats itself. A sheet drawn by the orchestrator alone comes out in one kit and reads as **pictograms**; on SINAIA the client threw out all 81 cells. Every sketch sheet comes from the **sketch fan-out** in `references/sketch-fanout.md`: five sketch agents, each with its own move and visual direction, each redrawing its cells by eye before handing back. You write the brief, merge, look, and run the viewers.

The bar rewards cleverness, so critics alone drift away from what the brand should feel like: on one run they scored a face-with-teeth highest and pulled a cute chick, one winning A/B at a time, into a smug letter. The brand's **temperature** (the feel it must have, in two or three words: cute and warm, sober, playful) anchors the other side. Critics score fit to it beside the bar, and the user judges it by eye on the standing board every round.

Craft and fit still miss **identity**: whether a stranger told nothing about the field guesses what the mark is for. On a 14-mark rescore the order by craft barely predicted the order by the wider rubric (rank correlation 0.22), the marks critics rated highest drew guesses like "freelance platform" and "parking sign", and none of the 14 cleared the finalist bar. `references/rubric.md` holds the rubric (identity viewers, four scores, two gates, the finalist bar); read it before step 4.

## Tools

All in `scripts/`. Run `node glyphs.mjs --setup` once per machine; it installs the npm dependencies and the fonts.

- `glyphs.mjs`: outlines of any text in every downloaded typeface (`node glyphs.mjs --list`), plus each contour (`parts[0]` the silhouette, the rest counters). Every letter starts here.
- `shapes.mjs`: union, subtract, intersect, transform, and `outline()` to turn a stroke into a filled outline. Letter surgery happens here, and every refined mark ends as one outline a designer can open.
- `lines.mjs`: parallel-line systems, weaves, rays and hatching, to dress a centerline. `letterforms.mjs`: `ringSegment` for true arcs.
- `construct.mjs`: the circles and lines a mark is built on, saved beside it as `<name>.construction.svg`.
- `mutate.mjs`: seeded variants of a sketch built from parts (nudged, turned, scaled, mirrored, overlaps cut out of each other).
- `sheet.mjs`: the numbered sheet as one SVG. `lookagain.mjs`: every cell four ways (as drawn, its enclosed gaps in black, both upside down). `--blind` on either prints numbers only, for viewers and critics.
- `merge.mjs`: the sketch agents' sheets as one, a section per agent. `board.mjs`: the user's board, cut cells faded with their reasons, numbering unchanged. `collect-images.mjs`: an image pass's downloads gathered into cells.
- `ab.mjs`: shuffled blind before/after pairs. `present.mjs`: the finalist board. `render.mjs`: SVG to PNG with no system tools.

Write each round as one generator script (a `.mjs` emitting `cells.json`, each cell SVG markup in a 0-100 box), so one fix re-renders the whole sheet. Read `references/construction-techniques.md` before the first sketch: it holds the build techniques, what the critics keep catching, and the readings certain shapes always bring.

Where the Artifact tool offers the Design type, keep the job on one design canvas: each sheet a board, and from step 4 one board per idea family, revised in place each round, plus a board of what stands. Without it, send the PNGs.

## Workflow

1. **Brand notes, then the first cut.** Read what the brand is (README, site, the user's words), and find out whether it belongs to a parent brand. A sub-brand's mark has to sit beside the parent's: find the parent's logo (its site, an old site's `images/` folder, brand assets), name what could carry over (a typeface, a line, a colour), and put both in the notes and the brief. On SINAIA the user had to point out, after two loops, that it is a SpeechCare sub-brand. In the same message as the cut, ask whether the mark should **say what the brand does** (a found form strangers can place) or be an **abstract glyph** beside a wordmark: on SINAIA three loops chased "strangers guess speech", reached 21 marks that did, and the user turned them down as creepy faces in favour of an unrelated glyph. Write 70-100 words, objects and concepts tied to it, grouped (product, people, place, values, objects), each with the one or two shapes it looks like. Add 3-5 letterform seeds from the name itself: initials, monograms, words hiding inside it ("Dois Agentes" → DA, "da"), the letters with the most distinctive shape. Number everything, save the list, and send it to the user, asking them to keep 10-15 words plus the seeds they like, and to name the brand's temperature. Write the temperature at the top of the list. In the same message, ask whether the image pass may send the brief to fal (`references/image-pass.md`). Wait for the answer, then write `loop-1/brief.md` as `references/sketch-fanout.md` lays out.
   **Done when:** the user has replied with their cut, the temperature and the image-pass answer, and the brief is on disk.

2. **Sketch fan-out.** Run `references/sketch-fanout.md`: the five sketch agents in one message, plus the image pass if the user agreed, then merge their sheets with `merge.mjs`.
   **Done when:** every agent has handed back a sheet it redrew at least once, the image pass's collected count per model equals what it generated, the merged sheet is rendered, and every cell in it renders as its agent described in the PNG you looked at.

3. **Look again, then the second cut.**
   - Run `lookagain.mjs` on the merged sheet. For each cell, name what the gaps and the upside-down views show, checking against the **whole** brand-notes list, cut words included. A discarded word that turns up in a gap comes back.
   - Send the same pages, `--blind`, to three viewers, with the identity question added ("if this were the logo of an app or company, what would it do?"). Add the readings they share to yours; cut red flags and lookalikes by the rule; score identity per cell (hits out of 3, `references/rubric.md`). On SINAIA the identity column was what separated the field: refinement had one mark that strangers placed in speech, and the loop whose brief named that target produced 21.
   - Build the user's board with `board.mjs`, and log every cut and every shared reading in the found-shape ledger.
   - Send the board and the image pass's full contact sheet (`imagegen/all.png`), and ask the user to pick 5-8 by number from either, with your own picks and, for each, what the viewers read in it. The user's eye catches marks the 20-keeper cut dropped. From the second loop on, pick yourself from the viewers' readings unless the user asked to keep cutting.
   **Done when:** every look-again row has been read by you and by the viewers, every cut is on the board with its reason, and the picks are made.

4. **Refine to 3.** Each round:
   - In the first round, build each pick from parts and run `mutate()` on it, 10-25 variants each (the accidents a pencil makes), then `lookagain.mjs` on them. A find that two viewers name joins its pick's family; on SINAIA the mutations of a rough IA turned up a striding figure nobody had drawn.
   - Build each pick as a family of 3-6 variants: typeface, weight, proportion, line count, weave. Construct every variant (declare its circles and lines with `construct.mjs`, take curves from them, assemble one outline with `shapes.mjs`). Construction serves the drawing: fit arcs to the shape that reads; a version rebuilt stiffly from circles lost its blind A/B every time. Every variant passes the balance check in `references/construction-techniques.md` before it goes on a sheet.
   - With more than four picks, split them across refine agents by kind (letters, creatures, objects), three or four families each, each given this step, the readings list and the current winners.
   - Run `lookagain.mjs` on the round sheet; finds keep arriving while refining.
   - Score the merged sheet with three critics, with the brand's current mark (if it has one) and any concept that already passed on it unlabelled as the **anchors**. From the second round, a revised variant replaces its predecessor only if it wins the blind A/B on both scores: a gain on the bar that costs fit is a loss.
   - Send the user one board of the standing concepts (`present.mjs`), with each concept's first sketch beside its current version. A concept the user calls off-temperature leaves, whatever it scored.
   - Judge each concept: it belongs only to this name and stays clear of the bar designer's own marks (cliché test; a keyhole in a letter echoes Peters' keyhole G), and two of three viewers name its double reading unprompted (aha test). Then run the identity viewers and the gates in `references/rubric.md` on the standing concepts.
   - Carry every change two critics agree on into the next round. Log every cut variant and why in the **found-shape ledger**: one file that every agent in the next loop reads first.
   **Done when:** three concepts pass: both tests, the finalist bar in `references/rubric.md`, a critics' median of 7 or at least the anchor's median on the same sheet, and the user has seen them on the latest board (go to step 6). Go to step 5 instead when the best median has not risen for two rounds, or when two of three critics name the same gap a refinement cannot close (two pictures overlaid instead of one shape).

5. **Go back.** Write the next loop's brief and run the sketch fan-out again, its moves retuned to the critics' gap (`references/sketch-fanout.md`), then continue from step 3 with the merged sheet. Concepts that passed stay standing, and the brief shows them as the standard. Budget: four loops in total. A cut idea never returns unless a viewer finds it again in a new form.
   **Done when:** the fan-out's sheet is merged and step 3 has run on it.

6. **Present 3.** Save each concept as its own one-outline SVG (viewBox 0 0 100 100, `currentColor`) with its construction file, run `present.mjs` and render the board: large on light, large on dark, on its construction, and at 96, 48 and 24px. Run the red-flag viewers and the identity viewers once more on the final marks.
   **Done when:** one PNG shows the 3 concepts in every condition, each with one line on its found form, its last median, what strangers guessed it is for and any lookalike they named, and the last viewer pass raised no red flag. If the budget ran out first, present the three best with their medians and the critics' agreed gap for each.

When a direction is chosen, hand off to `logo-brand-package`.
