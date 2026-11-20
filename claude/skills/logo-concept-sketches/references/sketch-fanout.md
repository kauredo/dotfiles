# Sketch fan-out

Every sketch sheet comes from here: the first one (step 2) and every go-back (step 5). One hand repeats itself. On SINAIA the orchestrator drew an 81-cell first sheet alone, every cell in the same kit (monoline round-cap strokes, a dot for a head) and drawn once; the client called it "pretty terrible" and the viewers read **pictograms**. The next sheet came from five sketch agents and an image pass, each with its own move and its own visual direction, each redrawing its cells by eye, and it read as a designer's **sketchbook**: filled shapes with weight, real letterforms, double readings strangers named unprompted.

## The brief

Write `loop-N/brief.md` once per loop, before any agent starts. Every agent reads it first.

- **The brand** in three lines, and the surfaces the mark lives on (sidebar, app icon, favicon).
- **The temperature** in the user's words, plus one line on what it means for the drawing ("calm, grown-up, precise; warm through restraint, never cute").
- **What the user kept:** the words with the shapes they suggest, and the letterform seeds.
- **The field strangers must guess**, in one phrase ("speech therapy"), as the second reading every sketch is after. Briefs that offered a menu of subjects produced clever marks that strangers placed in outdoor gear, fintech and publishing; the SINAIA brief that named speech as the target, and named the one mark that had hit it, turned out 21 marks all three strangers placed correctly.
- **Why the last sheet failed**, as well as what was cut. "Every cell was the same kit, drawn once" changed what all five agents drew on SINAIA; a list of cut cells alone changes only what they avoid.
- **The ledger:** every arrangement cut so far with the viewers' words, as arrangements to avoid (a Y-branch in any form, not "cell 59"), plus what strangers did read correctly, for calibration.
- **The standard:** a found form, not a decal; holds at 24px; one construction. From loop 2, the concepts still standing.
- **Shell rules**, verbatim: "Run each shell command as one program with plain arguments. Write scripts and files with the Write tool, then run them with one plain command. Give absolute paths instead of `cd dir && ...` chains. Copy with `/bin/cp -f`, delete with `/bin/rm`." Heredocs and `bash -c` stall a subagent on a permission prompt.

## The agents

Five sketch agents, plus the image pass in `image-pass.md` when the user agrees to send the brief to fal. Each is a fresh `general-purpose` subagent with `model: "opus"`, blind to the others, with its own move, its own visual direction and its own seed (`openssl rand -hex 12`). Launch all of them in one message.

The visual direction carries as much weight as the move: it fixes the typefaces and the construction kit, so the five sheets look like five designers.

| Move | Where the second reading lives | Visual direction |
|---|---|---|
| **Negative space** | A gap the shapes already leave: between two letters, inside a counter, where one solid cuts another. Found in the gap view, never carved to order. | Solid fills only. Heavy geometric sans (ArchivoBlack, PoppinsBold, OutfitBold, PlusJakartaBold) and solid masses; gaps knocked out with `subtract()`. |
| **Letter surgery** | A real glyph's outer contour reshaped until the whole letter is also a kept subject; the counter stays a counter. | High-contrast serif and soft display (DMSerifDisplay, FrauncesBlack, FrauncesSuperSoftBold, AbrilFatface) plus one clean sans for comparison. Filled outlines. |
| **The pair** | Two simple shapes whose union, overlap or shared edge is the third reading (a big form and a small one, two arcs that make a wave). | Constructed geometry: true arcs (`ringSegment`), quarter and half circles, one radius throughout, filled masses. Swiss modernist identity marks. |
| **Wordmark first** | The whole name set well, one or two letters altered to carry the idea. Each word cell is followed by its altered letter alone, the future app icon. | Refined typography in five to seven faces, caps and lowercase, altered letters built from glyph `parts` with `shapes.mjs`. |
| **Subjects** | A kept word's essential silhouette, at the point where it also becomes a letter of the name. The reduction ladder (detailed, medium, silhouette, mark) runs in the agent's head; only its strongest step goes on the sheet. Each subject is drawn in the pose people know it by (a swallow in profile, wings raised); seen from the front or above, an animal reads as a person. | Bold organic silhouettes: drawn bezier curves with arcs fitted after, solid fills, one contour, no interior detail. |

On SINAIA the pair and negative space produced the double readings strangers named most (a square split by a wave read as water by all three viewers; a big and a small peak as two mountains). Letter surgery produced the best-drawn letters, and wordmark first found that the seed AIA is another company's wordmark before any refinement was spent on it.

From the second fan-out on, retune the moves to the gap the critics keep naming, and keep the move that produced the best mark so far.

## Agent prompt

```
You are a logo designer sketching first ideas for a brand. Read these first, in full:
- <skill dir>/SKILL.md (background on the method; you are doing only the sketching part)
- <skill dir>/references/construction-techniques.md
- <loop dir>/brief.md: the brand, what was kept, what failed and why. The shell rules at its end are mandatory.

Your move: <move and where its second reading lives, from the table>.
Your visual direction: <the direction, from the table>.
Your seed: <hex>. Let it pick where you start in the word list and which typeface you reach for first.

Work only in <loop dir>/<move>/. Write one generator script there (sketches.mjs) that imports the skill's scripts by absolute path (<skill dir>/scripts/) and writes cells.json: 16 cells, each SVG markup in a 0-100 box, fill #111.

The process that matters:
1. Draw all 16. Render with sheet.mjs and render.mjs, and look at the PNG with the Read tool.
2. Judge each cell as a design director would: does it look like a designer drew it, or like a pictogram? Is the weight balanced, are the gaps as thick as the strokes, does it hold at small size? Redraw every cell at least once, and replace a weak cell with a better idea rather than polishing it. Render and look again. Two full passes minimum; stop when every cell is one you would show a client.
3. Run lookagain.mjs on your cells.json and read every row for readings you did not plan. Replace anything that matches the brief's ledger.

Each cell's "label" names its idea in a few words (blind viewers never see it).

Finish with: the path of your final sheet PNG, your 5 strongest cells by number with one line each on the double reading, and every cell you cut along the way with the reason.
```

Sixteen cells drawn twice beat forty drawn once: the SINAIA agents ran four to thirteen render passes each and replaced most of their first ideas.

## After the fan-out

1. Merge: `node scripts/merge.mjs <loop dir>/merged-cells.json <agent dirs in order>`. It prints each agent's number range; note them in `STATE.md`.
2. Render the merged sheet and look at every cell yourself. A cell that does not render as its agent described goes back to that agent with `SendMessage`.
3. Continue with step 3 of `SKILL.md`.
