# Idea fan-out

One sketcher repeats itself. When the workflow goes back for more ideas, it sends the brief to four idea agents at once, each a fresh `general-purpose` subagent with `model: "opus"`, blind to the others, each given its own **move** and its own seed (`openssl rand -hex 12`). The moves keep them from converging on the same first idea:

1. **Negative space:** the second reading lives in a gap, a counter or the space between two shapes; nothing is drawn on top.
2. **Letter surgery:** real glyphs from `glyphs.mjs`, cut and fused with `shapes.mjs` until a letter is also an object.
3. **Container interlock:** a circle, square or shield that the subject breaks, shares an edge with, or is cut from.
4. **A new subject:** a word from the brand notes nobody has drawn yet, cut words included, taken down its reduction ladder.

From the second fan-out on, retune the moves to the gap the critics keep naming, and keep the move that produced the best mark so far. On Dois Agentes the third loop ran line systems, negative space, the pair (two shapes whose union or gap is the third reading) and the shared edge.

Write the loop brief once to `loop-N/brief.md`: the brand in three lines, the kept words and seeds, the found-shape ledger (every cut idea with its reason, every red flag), the critics' recurring gaps, and the concepts still standing, and any mark that already passed, as the standard every idea is held to. Each agent gets the prompt below and writes only inside its own folder.

## Idea agent prompt

```
You are sketching logo ideas. Read these first:
- <skill dir>/SKILL.md, then <skill dir>/references/construction-techniques.md
- <loop dir>/brief.md: the brand, what was kept, what already failed and why

Your move: <one of the four moves, one line>. Your seed: <hex>. Let the seed pick where you start in the word list and which typefaces you reach for first.

Work in <loop dir>/<agent name>/ only. Write one generator script (sketches.mjs) that imports the skill's scripts by absolute path and writes cells.json: 30 to 40 cells, each SVG markup in a 0-100 box, one ink. Run `node glyphs.mjs --setup` once if glyphs fail to load. Render with sheet.mjs and render.mjs, look at the PNG, and fix every cell that does not render as you meant it. Then run lookagain.mjs on your cells and read every row for readings you did not plan.

Stay away from everything the brief's ledger lists. Nothing phallic, no rotational four-arm shapes, no religious or political symbols.

Finish with: the path of your sheet PNG, the path of your look-again pages, and your 5 strongest cells by number, one line each on the double reading and where it showed up.
```

## After the fan-out

Merge the four `cells.json` files into one sheet (`sheet.mjs`, one section per agent), run `lookagain.mjs` and the blind viewers on it, and go on from step 3 as in the first loop. Concepts still standing from earlier loops join the picks.
