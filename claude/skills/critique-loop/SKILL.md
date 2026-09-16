---
name: critique-loop
description: "Iterate /critique: critique, fix, re-critique until the score stops rising. Triages a plateau and escalates to a bounded redesign fan-out when refinement has hit its ceiling. Use when polishing a screen, or when a critique score has stalled."
disable-model-invocation: true
---

# Critique Loop

Run a design critique loop until the score stops rising.

## Resolve target

- If `$ARGUMENTS` names files or components, use those.
- If `$ARGUMENTS` is empty, run `git diff --name-only HEAD` for the files changed this session. With nothing uncommitted, use `git diff --name-only HEAD~1`.
- Keep only UI files (`.tsx`, `.jsx`, `.css`, `.html`). Tests, configs and scripts are out.

With no UI files in the target, say so and stop.

## Each round

1. Run `/critique` on the target.
2. Record two things: the `Critic score: N/10`, and the critic's top objection verbatim. Scores alone cannot separate a fix that never reached the screen from an objection that is structural. The objection text can.
3. Apply the fixes worth applying, leaving subjective preference and anything that would over-engineer.
4. Run the commands the critique recommends (`/harden`, `/bolder`, `/quieter`, `/clarify`, `/colorize`, `/optimize`, `/normalize`) on the files it names.
5. Report the round number, the score, and what changed.

## Stop when

- The score reaches 9. The critic scores every round in `/critique` Step 0 and never sees the target, so a 9 is a real 9.
- Only subjective taste is left.
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
