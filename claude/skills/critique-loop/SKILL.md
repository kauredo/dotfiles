---
name: critique-loop
description: "Critique a UI screen across its states, fix, re-critique until clean. Use for a critique-fix loop, a score plateau (redesign fan-out), or critics contradicting each other (blind ranking)."
---

# Critique Loop

Run a design critique loop until every finding is resolved. Each change is kept only if it beats the version before it in a blind comparison, so the screen only moves forward.

## Resolve target

- If `$ARGUMENTS` names files or components, use those.
- If `$ARGUMENTS` is empty, run `git diff --name-only HEAD` for the files changed this session. With nothing uncommitted, use `git diff --name-only HEAD~1`.
- Keep only UI files: components and pages (`.tsx`, `.jsx`, `.vue`, `.svelte`), styles, view templates (`.html`, `.erb`), and scripts that build the UI in the browser. Tests and configs are out.

With no UI files in the target, say so and stop.

## States

A component that opens, selects or changes with its data is several screens, and the critic judges only the ones it is shown. Before round 1, list the target's **states** at desktop and 390px. Every round captures the same list, in the same order, under the same file names, so rounds stay comparable.

Build the list from the code first, then the data:

1. **Every branch in the changed render code.** Read each conditional that decides what renders: a feature flag, a role, a permission, an ownership check (authored or not, own or shared), a length or count. Each combination that changes the visible result is a state. A menu built from `[...optional, always]` is two states, because it holds one item whenever the optional part is empty.
2. **Each data shape it renders**: empty, one, many, too long, past and future, and each edge the real data holds.
3. **Each interaction**: open, selected, hovered, keyboard focus.

- Use the repo's capture script when it has one (look under `scripts/` for a name with `capture` or `states`). It seeds the states and screenshots them in one command.
- Seed from the shape of production rows, awkward cases included: a name typed two ways, a missing time, a value the parser half-understands. The page breaks on those, and only seeded data can show the critic one.
- Emulate a real phone at 390px (touch, mobile viewport). Text wraps there in ways a resized desktop window hides.
- Give the critic the list: one line per screenshot saying which state it shows.
- Add a **crop** of every row or control group the diff changed, at 2x, beside the full screenshot. A 4px drift is invisible at page scale and obvious at row scale.

## The ledger

One file, `<work>/LEDGER.md`, the loop's memory. Each critic is fresh and remembers nothing, so without the ledger every round re-argues the last one and the loop oscillates. Three lists:

- **Settled**: a decision, who settled it, and why. The user ("keep the navy card"), a blind ranking (winner, score, the reason it won), a recorded project decision, or a fact you verified. Every critic receives this list. Only the user or a new blind ranking unsettles an entry.
- **Rejected**: every replaced shape, with the element and the reason it lost. Every critic receives this list too.
- **Applied**: each finding you acted on, the round, and the change it made. Triage reads it to catch reversals.

Seed settled before round 1 with the project's design decisions and anything the user asked to keep.

## Each round

1. **Save the baseline.** Write the current diff of the target files to `<work>/round-N.base.patch`, so this round's change can be undone exactly.
2. **Capture** every state on the list into `round-N/`, under the same file names every round.
3. **Critique** with `/impeccable critique` on the target with those screenshots and the list, run three times, each in its own fresh subagent, with the same prompt. The round's score is their median. A finding is **consensus** when two or more critics raise it; findings only one critic raised are **minority**, recorded and not acted on. Add four things to the critique prompt:

   > For each graphic element, name the established UI pattern its shape quotes, and say whether that pattern's conventional meaning matches what this element is for.

   > These decisions are settled, each with who settled it and why: `<the settled list>`. Treat them as fixed. Argue against one only with a reason not already listed beside it, and say which entry and which new reason.

   > These shapes have already been tried and rejected, with the reason each was rejected: `<the rejected list>`. Propose something that is none of them.

   > List any claim you made about how something is built or about the real world, so it can be checked.

   The pattern question catches a misread quote in round 1 rather than one round per quote: a filled track quotes percent-complete, seven slots quote a weekday tracker, and a critic shown one shape names only the quote in front of it. The two lists are what stop critics handing each other's rejects back and reopening settled calls. On round 1 the rejected list is empty.
4. **Triage** each consensus finding, in this order, stopping at the first that matches:
   - **Settled**: it contradicts a settled entry → drop it. If it names a reason the entry never weighed, send both shapes to [`CONTESTED-ELEMENT.md`](CONTESTED-ELEMENT.md) instead.
   - **Reversal**: it undoes a change in the applied list → [`CONTESTED-ELEMENT.md`](CONTESTED-ELEMENT.md), never a direct apply.
   - **Premise**: it rests on a claim the critic cannot see. About the code ("these two states differ only in hue"), open the code; about the world (how an object works, what a term means, a date), check a reference. A premise that does not hold is written down and dropped, because changing working code to satisfy one is worse than leaving it alone. A verified fact enters settled.
   - **Taste or over-engineering**: subjective preference, or a fix bigger than the problem → record and leave.
   - Otherwise → apply.
5. **Record** three things: the score as `median N/10 (a, b, c)`, the top consensus objection verbatim, and **every consensus finding with its triage outcome**. Scores alone cannot separate a fix that never reached the screen from an objection that is structural, and a per-finding record is what shows the central element getting worse while unrelated repairs lift the number.
6. **Apply** the findings that passed triage, and add each to the applied list. Run the commands the critique recommends (`/impeccable harden`, `bolder`, `quieter`, `distill`, `clarify`, `colorize`, `typeset`, `layout`, `animate`, `optimize`, `polish`) on the files it names. A finding about something that moves under the hand (a drag, a swipe, a sheet, a spring) goes to the `apple-design` skill instead of `animate`.
7. **Measure alignment** in the browser, every round, because a critic reading pixels misses a few of them. For each changed row, read `getBoundingClientRect()` of each direct child's visible content (the icon or the text, not its padded hit box) and compare vertical centres against the row's primary element, the title or the label. Anything more than 1px off goes into the round's findings record, whatever the critic said. The usual cause is `items-start` with a 44px button or a `pt-*` nudge beside a shorter text row; centre the pieces in a box the primary row's height. Done when every changed row is measured in every state on the list.
8. Check for a **half-landed** fix: for each rule the round changed, read the computed style of the element it targets in the browser, and confirm the value is yours. The cascade eats fixes and the screenshot still changes: an `!important` in a library theme, a later rule of the same specificity, a site-wide `:focus-visible` shadow. The computed value names the winner; a screenshot only shows the result.
9. **Keep the winner.** Capture the changed states again and send each beside its `round-N/` version to one fresh critic under neutral shuffled names, asking which is better and by how much (a gap under half a point is a tie). A state that loses or ties is restored by reverse-applying this round's change for it (the diff against `round-N.base.patch`), and its change goes to the rejected list; a state that wins makes its change settled. The screen only ever moves forward.
10. Report the round number, the median score, the A/B record (wins, ties, losses), and what changed.
11. Post the **round comment** on the PR: the round number, the score, the top objection, the per-finding record from step 5, the A/B record, and every screenshot in `round-N/`, each captioned with its state. Publish the images the way the repo publishes PR screenshots (its `AGENTS.md` says how); on a private repo that is a URL the reviewer's own session can load. Before the PR exists, the `round-N/` folders wait, and the step that opens the PR posts one round comment per round, in order. Done when the PR shows every round, so a reviewer can watch the screen change and see why.

## Stop when

- **Every consensus finding from the last round is triaged** and the median reaches 8 (the Plateau table's ship line). Two gates, because they fail apart: a round that repairs three small things and breaks the central element scores higher and is further from done. The per-finding record from step 5 is the check.
- Only subjective taste is left.
- Four rounds are spent. Report what remains.

## Plateau

Progress is the A/B record: a round that wins no comparison moved nothing, whatever the median did. Two rounds in a row with no A/B wins is a **plateau**. Read it before spending a third round.

Every command this loop reaches for works inside a design direction, and none of them changes the direction. The direction sets the **ceiling**, and the loop walks you to the top of whichever one you are in. Where the plateau sits says which problem you have:

| Median flat at | Diagnosis | Next |
|---|---|---|
| 8 and up | At the ceiling, and the ceiling is high | Ship |
| 6 to 7.9 | Direction holds, execution falls short | Re-ask, below |
| Below 6 | Wrong direction | [`REDESIGN-FANOUT.md`](REDESIGN-FANOUT.md) |

### Confirm the round happened

Before reading a flat score as a verdict on the design, diff this round's screenshot against the previous one. An unchanged image means the fix never reached the screen, and the round says nothing about the design. Two ways it happens: a utility class that compiles to nothing, and a screenshot harness serving none of the project's fonts. Fix the render and re-run the round.

### Re-ask

"Name the two changes that would move it up" asks for local repairs and returns local repairs, which is what plateaued. Spawn a fresh critic on the same screenshots and references, still with no code and no history beyond the settled list, and ask for a direction instead:

> Rank these. Describe the design direction of the top-ranked one in two sentences: what is it committing to? Describe ours the same way. What would ours have to become to reach an 8, rather than what would you adjust? These decisions are settled: `<the settled list>`.

The answer is one critic's direction: triage it against the ledger like any finding, apply what passes as one round, and re-score. Still flat means the direction is the problem, so go to [`REDESIGN-FANOUT.md`](REDESIGN-FANOUT.md).

## Rules

- Surgical: a round touches only what the critique flagged.
- "Good enough to ship" beats "theoretically perfect".
- When the same objection survives two fixes, hand it to the user rather than spending a third.
- A finding that needs a call outside design (a clinical threshold, a pricing tier, a legal line) goes to the user with the critic's reasoning. Picking the number yourself to close the finding ships an invented fact.

## Finish

Check the PR carries a round comment for every round, the last one included.

When a round changed JavaScript (a new render path, a handler, a popup), the loop also changed behaviour the critic cannot see. Before reporting, run the `correctness-reviewer` agent on the loop's diff and fix what it confirms: edge data the seed skipped, library behaviour, focus and keyboard paths.
