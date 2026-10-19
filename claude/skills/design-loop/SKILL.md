---
name: design-loop
description: "Design screens on a Claude Design canvas and keep critiquing, comparing and redesigning them with blind critics until they are great."
disable-model-invocation: true
---

# Design loop

Design one or more screens as artboards on a Claude Design canvas, then loop: snapshot, render, have three blind critics score them, triage their findings against the ledger, apply, and keep each change only if it wins a blind A/B against the version before it. Escalate to a side-by-side or a redesign fan-out whenever fixing stops winning. The canvas is the deliverable. The user watches it change round by round and steers from it.

This is [`critique-loop`](../critique-loop/SKILL.md) moved onto a canvas. Its contested-element and fan-out guides apply here with the canvas adaptations below. They are not restated.

## 1. Ground before drawing

Done when you hold, for every screen in scope, the real data it can show, the real copy, the tokens, and the rules that bind it.

- Dispatch an `Explore` agent per product surface: which files render the screen today, every section top to bottom with its data fields and copy (resolved from the locale files), the primary actions, the feature flags, the data the API has but the screen does not show, and realistic fixture values. Ask for the design tokens with hex values.
- Read the project's design standard and its recorded decisions (`decisions/`, a design-system doc, the audience rules). Each one enters the ledger as **settled**.
- Find what ships today: existing screenshots (a `pr-assets` branch, `.pr-assets/`, mock folders) for each platform in scope. The user's reaction to "today versus redesigned" is the most useful steer you will get.
- Ask the user only for what they alone hold: which existing piece they want kept, which audience matters most.

## 2. Open the canvas

`Artifact` with `action: "quickstart"`, `intent: "design"`, then publish with the returned `type_url` and a title. The create result carries the type's file rules. Follow them; these are the ones that bite in a loop:

- Work in one scratchpad folder, `<root>/project/…`. Write `canvas.json` first with every board you are about to add, then each `.dc.html`, publishing as you go so the user sees boards appear.
- One `page` per audience (or per platform, or per piece for a set of small artefacts), `expand: "fill"` for web screens at `w: 1280`, a fixed `390` wide frame for phone screens. Titles name the variant and its idea ("Patient E · the recording field").
- **Re-read `project/canvas.json` before every index change.** The user edits the canvas (deletes a page, moves a board) and the version moves under you. Keep their changes.
- Keep option names stable. A board called "Caregiver D" stays Caregiver D; a new idea is a new board, not a rename.
- Draw from the real source: copy hex values, copy strings, redraw characters from their source geometry. Mark missing facts as placeholders.
- Uploaded assets are referenced as `/_blob/<id>`, which a local render cannot resolve. Keep an `assets.json` mapping each id to its local file and pass it to `render.py --assets`.

## 3. Variants first

Before any loop, give the user 3 genuinely different variants per screen, each committed to an idea you can name, and say each one's tradeoff in the reply, not on the board. Let the user pick or remix.

Diverge the way `build-ui` Phase 2 does: one agent per variant, spawned in parallel in a single message, each blind to the others and seeded with its own `openssl rand -hex 24` string or an outside-reference brief. Each gets step 1's grounding and runs `frontend-design` for its aesthetic calls. The project's identity is frozen, per the [constraint contract](../critique-loop/REDESIGN-FANOUT.md): every variant uses its fonts, palette, icons and components, and the seed steers only composition. `ui-ux-pro-max` supplies palette or type only when the project has none yet, or the user asked for a new identity. **Different audiences get different structures**: two audiences sharing one hero component is the first thing a critic and a user both notice.

Done when the user has picked the direction per screen. Their picks become the loop's targets and enter the ledger as settled.

## 4. The ledger

One file, `<work>/LEDGER.md`, the loop's memory. Fresh critics remember nothing, so without it each round re-argues the last one and the loop oscillates. Three lists:

- **Settled**: a decision and who settled it, with its reason: the user ("drop the totem", "keep the tram yellow"), a blind ranking (winner, score, why it won), a project decision from step 1, or a fact you verified ("Lisbon's tram 28 has one central wheel set"). Every critic receives this list. Only the user or a new blind ranking unsettles an entry.
- **Rejected**: every replaced shape, with the element and the reason it lost. Every critic receives this list too.
- **Applied**: each finding you acted on, the round, and the change it made. Triage reads it to catch reversals.

## 5. Round

Each round, for the target boards, at desktop and 390:

1. **Snapshot.** Before touching a board, copy it to `<Name>.rN.dc.html` and add the copy to its page in a history row. Snapshots are frozen: every edit goes into the live board, so any earlier version can be shown, compared or restored.
2. **Render.** `python3 ~/.claude/skills/design-loop/render.py --src <root>/project --out <work>/round-N --web A,B --phone C,D --prev <work>/round-(N-1) --assets <work>/assets.json`. Same board list, same sizes, same file names every round. `UNCHANGED` means a fix never reached the screen: fix the render, not the design. `Read` two or three images yourself before sending them on; a broken render ranks as a bad design.
3. **Critique.** Fill the round prompt from [`CRITIC.md`](CRITIC.md) once and reuse it verbatim; each round only the ledger lists grow. Hand it plus `round-N/` to **three** fresh critics in one message. The round's score is their median. A finding is **consensus** when two or more critics raise it.
4. **Triage** each consensus finding, in this order, and stop at the first that matches:
   - **Settled**: it contradicts a settled entry → drop it as a premise. If it names a reason the entry never weighed, put both shapes into a blind side-by-side (§6) instead.
   - **Reversal**: it undoes a change in the applied list → blind side-by-side, never a direct apply.
   - **Fact**: it rests on a claim about the world (how an object is built, what a word means, a date, a regulation) → verify it against a reference first. A wrong claim is dropped; a verified one enters settled.
   - **Finish**: it is about mock fidelity no design choice can fix (curve smoothness, print-safe stroke weight, rendering artefacts) → add it to `<work>/PRODUCTION.md` for when the winners are built for real.
   - Otherwise → apply.

   Findings only one critic raised are **minority**: record them, act on none.
5. **Record** in your reply: `Score: median N/10 (a, b, c)`, the top consensus objection verbatim, and a table of **every** consensus finding with its triage outcome. Hand to the user anything that is their call (a recorded decision, a clinical or product call).
   - **Something the user asked to keep is a candidate, never a wall.** When critics keep attacking it, mock alternatives beside it and rank them blind with the kept piece among them. The user wants the comparison, not a refusal.
   - **Split an objection from the element's job.** "The navy card looks like an ad" objects to its decoration, not to its job of anchoring the screen. A fix that drops the job along with the decoration loses what the user valued; the candidates must keep the job and lose only what was objected to.
6. **Apply** with the file-edit tools on the live `.dc.html` files, surgically, and add each change to the applied list. Keep the data consistent across every screen: the same patient's numbers, counts and story must agree on the home, the list and the phone. Critics do the arithmetic.
7. **Keep the winner.** Render the changed boards and send each beside its snapshot to one blind ranking critic (CRITIC.md, under neutral shuffled names). A board that loses is restored from its snapshot and its change goes to the rejected list; a board that wins makes its change settled. The live set only ever moves forward.
8. **Publish** the changed boards and the history row, and tell the user in plain terms what changed on the canvas.

## 6. Escalate when fixing stalls

Progress is the A/B record, not the absolute score: a round that wins no A/B made no progress, whatever the median says.

- **Reversal, churn or a settled challenge** (one element has worn two or more shapes, or a finding reopens a settled entry with a new reason): go side by side. Follow [`CONTESTED-ELEMENT.md`](../critique-loop/CONTESTED-ELEMENT.md). On a canvas the candidates are standalone HTML pages with only that element swapped, rendered with headless Chrome, never built in an app. Always include the incumbent, the last rejected shape, one new shape, and a text-only version.
- **Plateau** (two rounds in a row with no A/B wins): below a median of 6, or still flat after one direction re-ask, fan out per [`REDESIGN-FANOUT.md`](../critique-loop/REDESIGN-FANOUT.md). On a canvas: write one brief file (the element or screen, what it must say, the frozen brand list, the settled and rejected lists, an output path) and spawn the premise agents in parallel, each given only the brief, a base page and its premise. Render every candidate and the incumbent, `Read` them to catch broken renders, rename to neutral shuffled names with the mapping saved aside, and send one blind ranking critic.
- Between 6 and 8, first run the direction re-ask from `CRITIC.md` and apply its answer as one round.

Render each candidate inside the screen it belongs to, at both sizes, using the phone board for the phone shot: a desktop page squeezed to 390 shows its stacked navigation, not the candidate.

The ranking winner goes back onto the canvas as a board and into settled, the losers into rejected. Within a point of each other, the user picks, given the ranking and the reasons.

## 7. Stop

Done when the median is 9 and the last round left every consensus finding triaged. Short of that, stop when only taste or user calls remain, after two plateaued rounds that a fan-out did not break, or after 8 rounds, and report what is left and why.

Before reporting, run one blind ranking per element across its snapshots: the newest version is not always the best. Put the winners together on a **Final** page. A Final page made of image boards is a copy: re-render every winner and swap its image in before telling the user the loop is done, then open that page yourself and check each board shows the latest version. An existing Final page the user already knows gets updated in place, its previous state kept as a frozen copy.

When the loop moves onto built stories, capture each one after its play function has finished, then blur the focused element before the screenshot: a play function that clicked a link leaves a focus ring, and the critic reads it as a second outlined button. Render each component at the width the page will give it (a story decorator with the column's max width); a card stretched to 1280 gets critiqued for empty space it will never have.

Whole-set scores on canvas mocks flatten around 6 to 7 even while blind rankings give single elements an 8: a critic marks a hand-drawn mock down for fidelity no fix can supply, which is why finish findings go to `PRODUCTION.md`. When the A/B record goes flat through a re-ask and a fan-out, stop iterating the mock and recommend building the winners for real (stories, a scratch route, or print-ready artwork) with `PRODUCTION.md` as their first checklist. Every second round, and at every stop, give the user the canvas link, the score trend, the A/B record, and the open calls they must make, each with the critics' reasoning.

When a design is picked to ship, its boards are the spec: open the build with `build-ui` or the project's equivalent and link the canvas.
