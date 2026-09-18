---
name: critique-loop
description: "Critique, fix and re-critique a screen across its states until the score stops rising; a plateau escalates to a redesign fan-out."
disable-model-invocation: true
---

# Critique Loop

Run a design critique loop until the score stops rising.

## Resolve target

- If `$ARGUMENTS` names files or components, use those.
- If `$ARGUMENTS` is empty, run `git diff --name-only HEAD` for the files changed this session. With nothing uncommitted, use `git diff --name-only HEAD~1`.
- Keep only UI files: components and pages (`.tsx`, `.jsx`, `.vue`, `.svelte`), styles, view templates (`.html`, `.erb`), and scripts that build the UI in the browser. Tests and configs are out.

With no UI files in the target, say so and stop.

## States

A component that opens, selects or changes with its data is several screens, and the critic judges only the ones it is shown. Before round 1, list the target's **states** at desktop and 390px: each data shape it renders (empty, one, many, too long, past and future), each interaction (open, selected, keyboard focus), and each edge the real data holds. Every round captures the same list, in the same order, under the same file names, so rounds stay comparable.

- Use the repo's capture script when it has one (look under `scripts/` for a name with `capture` or `states`). It seeds the states and screenshots them in one command.
- Seed from the shape of production rows, awkward cases included: a name typed two ways, a missing time, a value the parser half-understands. The page breaks on those, and only seeded data can show the critic one.
- Emulate a real phone at 390px (touch, mobile viewport). Text wraps there in ways a resized desktop window hides.
- Give the critic the list: one line per screenshot saying which state it shows.

## Each round

1. Capture every state on the list, under the same file names as round 1, then run `/critique` on the target with those screenshots and the list.
2. Record two things: the `Critic score: N/10`, and the critic's top objection verbatim. Scores alone cannot separate a fix that never reached the screen from an objection that is structural. The objection text can.
3. Apply the fixes worth applying, leaving subjective preference and anything that would over-engineer.
4. Run the commands the critique recommends (`/harden`, `/bolder`, `/quieter`, `/clarify`, `/colorize`, `/optimize`, `/normalize`) on the files it names.
5. Check for a **half-landed** fix: for each rule the round changed, read the computed style of the element it targets in the browser, and confirm the value is yours. The cascade eats fixes and the screenshot still changes: an `!important` in a library theme, a later rule of the same specificity, a site-wide `:focus-visible` shadow. The computed value names the winner; a screenshot only shows the result.
6. Report the round number, the score, and what changed.

## Stop when

- The score reaches 9. The critic scores every round in `/critique` Step 0 and never sees the target, so a 9 is a real 9.
- Only subjective taste is left.
- A **reversal**: a critic asks to undo what an earlier round's critic asked for (fills, then no fills; codes, then names). Two fresh critics disagreeing is a matter of taste, and another round only picks a side at random. Keep what is shipped and list both asks for the user.
- Four rounds are spent. Report what remains.

## Plateau

Two rounds of fixes that move the score less than a point is a **plateau**. Read it before spending a third round.

Every command this loop reaches for works inside a design direction, and none of them changes the direction. The direction sets the **ceiling**, and the loop walks you to the top of whichever one you are in. Where the plateau sits says which problem you have:

| Flat at | Diagnosis | Next |
|---|---|---|
| 8 and up | At the ceiling, and the ceiling is high | Ship |
| 6 to 7.9 | Direction holds, execution falls short | Re-ask, below |
| Below 6 | Wrong direction | [`REDESIGN-FANOUT.md`](REDESIGN-FANOUT.md) |

### Confirm the round happened

Before reading a flat score as a verdict on the design, diff this round's screenshot against the previous one. An unchanged image means the fix never reached the screen, and the round says nothing about the design. Two ways it happens: a utility class that compiles to nothing, and a screenshot harness serving none of the project's fonts. Fix the render and re-run the round.

### Re-ask

"Name the two changes that would move it up" asks for local repairs and returns local repairs, which is what plateaued. Spawn a fresh critic on the same screenshots and references, still with no code and no history, and ask for a direction instead:

> Rank these. Describe the design direction of the top-ranked one in two sentences: what is it committing to? Describe ours the same way. What would ours have to become to reach an 8, rather than what would you adjust?

Apply the answer as one round and re-score. Still flat means the direction is the problem, so go to [`REDESIGN-FANOUT.md`](REDESIGN-FANOUT.md).

## Rules

- Surgical: a round touches only what the critique flagged.
- "Good enough to ship" beats "theoretically perfect".
- When the same objection survives two fixes, hand it to the user rather than spending a third.

## Finish

When a round changed JavaScript (a new render path, a handler, a popup), the loop also changed behaviour the critic cannot see. Before reporting, run the `correctness-reviewer` agent on the loop's diff and fix what it confirms: edge data the seed skipped, library behaviour, focus and keyboard paths.
