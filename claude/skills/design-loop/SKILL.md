---
name: design-loop
description: "Design screens on a Claude Design canvas and keep critiquing, comparing and redesigning them with blind critics until they are great."
disable-model-invocation: true
---

# Design loop

Design one or more screens as artboards on a Claude Design canvas, then loop: render, have a blind critic score them, apply, and escalate to side-by-side comparison or a redesign fan-out whenever fixing stops moving the score. The canvas is the deliverable. The user watches it change round by round and steers from it.

This is [`critique-loop`](../critique-loop/SKILL.md) moved onto a canvas. Its contested-element and fan-out guides apply here with the canvas adaptations below. They are not restated.

## 1. Ground before drawing

Done when you hold, for every screen in scope, the real data it can show, the real copy, the tokens, and the rules that bind it.

- Dispatch an `Explore` agent per product surface: which files render the screen today, every section top to bottom with its data fields and copy (resolved from the locale files), the primary actions, the feature flags, the data the API has but the screen does not show, and realistic fixture values. Ask for the design tokens with hex values.
- Read the project's design standard and its recorded decisions (`decisions/`, a design-system doc, the audience rules). A decision the critics later contradict is the user's call, never yours.
- Find what ships today: existing screenshots (a `pr-assets` branch, `.pr-assets/`, mock folders) for each platform in scope. The user's reaction to "today versus redesigned" is the most useful steer you will get.
- Ask the user only for what they alone hold: which existing piece they want kept, which audience matters most.

## 2. Open the canvas

`Artifact` with `action: "quickstart"`, `intent: "design"`, then publish with the returned `type_url` and a title. The create result carries the type's file rules. Follow them; these are the ones that bite in a loop:

- Work in one scratchpad folder, `<root>/project/…`. Write `canvas.json` first with every board you are about to add, then each `.dc.html`, publishing as you go so the user sees boards appear.
- One `page` per audience (or per platform), `expand: "fill"` for web screens at `w: 1280`, a fixed `390` wide frame for phone screens. Titles name the variant and its idea ("Patient E · the recording field").
- **Re-read `project/canvas.json` before every index change.** The user edits the canvas (deletes a page, moves a board) and the version moves under you. Keep their changes.
- Keep option names stable. A board called "Caregiver D" stays Caregiver D; a new idea is a new board, not a rename.
- Draw from the real source: copy hex values, copy strings, redraw characters from their source geometry. Mark missing facts as placeholders.

## 3. Variants first

Before any loop, give the user 3 genuinely different variants per screen, each committed to an idea you can name, and say each one's tradeoff in the reply, not on the board. Let the user pick or remix. **Different audiences get different structures**: two audiences sharing one hero component is the first thing a critic and a user both notice.

Done when the user has picked the direction per screen. Their picks become the loop's targets.

## 4. Round

Each round, for the target boards, at desktop and 390:

1. **Render.** `python3 ~/.claude/skills/design-loop/render.py --src <root>/project --out <work>/round-N --web A,B --phone C,D --prev <work>/round-(N-1)`. Same board list, same sizes, same file names every round. `UNCHANGED` means a fix never reached the screen: fix the render, not the design. `Read` two or three images yourself before sending them on; a broken render ranks as a bad design.
2. **Critique.** Save the round prompt from [`CRITIC.md`](CRITIC.md) once, filled in, and hand it plus `round-N/` to a fresh critic. Reuse it verbatim; append only the rejection ledger.
3. **Record** in your reply: `Critic score: N/10`, the top objection verbatim, and a table of **every** finding with what you did: applied, dropped as a premise (the critic misread a capture, or contradicts the project's standard or a blind ranking's winner), or handed to the user (a recorded decision, a clinical or product call). Two fixes that miss the same objection: hand it on.
   - **Something the user asked to keep is a candidate, never a wall.** When critics keep attacking it, mock alternatives beside it and rank them blind with the kept piece among them. The user wants the comparison, not a refusal.
   - **Split an objection from the element's job.** "The navy card looks like an ad" objects to its decoration, not to its job of anchoring the screen. A fix that drops the job along with the decoration loses what the user valued; the candidates must keep the job and lose only what was objected to.
4. **Apply** with the file-edit tools on the `.dc.html` files, surgically. Keep the data consistent across every screen: the same patient's numbers, counts and story must agree on the home, the list and the phone. Critics do the arithmetic.
5. **Ledger.** Add every replaced shape: screen, element, shape, the critic's reason.
6. **Publish** the changed boards and tell the user in plain terms what changed on the canvas.

## 5. Escalate when fixing stalls

- **Reversal or a churning element** (one element has worn two or more shapes and each was rejected): go side by side. Follow [`CONTESTED-ELEMENT.md`](../critique-loop/CONTESTED-ELEMENT.md). On a canvas the candidates are standalone HTML pages with only that element swapped, rendered with headless Chrome, never built in an app. Always include the incumbent, the last rejected shape, one new shape, and a text-only version.
- **Plateau** (two rounds moving under a point): below 6, or still flat after one direction re-ask, fan out per [`REDESIGN-FANOUT.md`](../critique-loop/REDESIGN-FANOUT.md). On a canvas: write one brief file (the element or screen, what it must say, the frozen brand list, the forbidden shapes from the ledger, an output path) and spawn the premise agents in parallel, each given only the brief, a base page and its premise. Render every candidate and the incumbent, `Read` them to catch broken renders, rename to neutral shuffled names with the mapping saved aside, and send one blind ranking critic.
- Between 6 and 8, first run the direction re-ask from `CRITIC.md` and apply its answer as one round.

Render each candidate inside the screen it belongs to, at both sizes, using the phone board for the phone shot: a desktop page squeezed to 390 shows its stacked navigation, not the candidate.

The ranking winner goes back onto the canvas as a board, the losers into the ledger. Within a point of each other, the user picks, given the ranking and the reasons. A later round's critic, seeing one shape alone, will often argue for a loser again: a blind ranking outranks a single critic, so that finding is dropped as a premise unless it names a reading the ranking never saw.

## 6. Stop

Done when the last round left every finding applied, dropped as a stated premise, or handed to the user, and the score is 9. Short of that, stop when only taste or user calls remain, or after 8 rounds, and report what is left and why.

When the loop moves onto built stories, capture each one after its play function has finished, then blur the focused element before the screenshot: a play function that clicked a link leaves a focus ring, and the critic reads it as a second outlined button. Render each component at the width the page will give it (a story decorator with the column's max width); a card stretched to 1280 gets critiqued for empty space it will never have.

Whole-screen scores on canvas mocks flatten around 6 to 7 even while blind rankings give single elements an 8: a critic marks a hand-drawn mock down for fidelity no fix can supply. When the score holds flat through a re-ask and a fan-out, stop iterating the mock and recommend building the winners as real screens (stories or a scratch route) and running `critique-loop` there. Every second round, and at every stop, give the user the canvas link, the score trend, and the open calls they must make, each with the critic's reasoning.

When a design is picked to ship, its boards are the spec: open the build with `build-ui` or the project's equivalent and link the canvas.
