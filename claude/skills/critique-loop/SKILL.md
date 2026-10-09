---
name: critique-loop
description: "Critique, fix and re-critique a screen across its states until every finding is resolved; a plateau escalates to a redesign fan-out, and two critics contradicting each other escalate to a blind ranking."
disable-model-invocation: true
---

# Critique Loop

Run a design critique loop until every finding is resolved.

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

1. Capture every state on the list into `round-N/`, under the same file names every round, then run `/impeccable critique` on the target with those screenshots and the list. Add two questions to the critique prompt:

   > For each graphic element, name the established UI pattern its shape quotes, and say whether that pattern's conventional meaning matches what this element is for.

   > These shapes have already been tried and rejected, with the reason each was rejected: `<the rejection ledger>`. Propose something that is none of them.

   The first question catches a misread quote in round 1 rather than one round per quote: a filled track quotes percent-complete, seven slots quote a weekday tracker, and a critic shown one shape names only the quote in front of it. The second is what stops critics handing each other's rejects back. Both lines are empty on round 1 except the pattern question; the ledger fills as the loop runs.
2. Record three things: the `Critic score: N/10`, the critic's top objection verbatim, and **every finding with what you did about it** (applied, dropped as a premise, or handed on). Scores alone cannot separate a fix that never reached the screen from an objection that is structural, and a per-finding record is what shows the central element getting worse while unrelated repairs lift the number.
3. Open the code behind each finding before you change anything, then apply the ones worth applying, leaving subjective preference and anything that would over-engineer. The critic judges a screenshot and has never seen the implementation, so any finding about how something is built is a **premise**, not a fact: "these two states differ only in hue" is false where the icons are already distinct glyphs. A premise that does not hold gets written down and dropped, because changing working code to satisfy one is worse than leaving it alone.
4. Run the commands the critique recommends (`/impeccable harden`, `bolder`, `quieter`, `distill`, `clarify`, `colorize`, `typeset`, `layout`, `animate`, `optimize`, `polish`) on the files it names. A finding about something that moves under the hand (a drag, a swipe, a sheet, a spring) goes to the `apple-design` skill instead of `animate`.
5. Check for a **half-landed** fix: for each rule the round changed, read the computed style of the element it targets in the browser, and confirm the value is yours. The cascade eats fixes and the screenshot still changes: an `!important` in a library theme, a later rule of the same specificity, a site-wide `:focus-visible` shadow. The computed value names the winner; a screenshot only shows the result.
6. Add every shape the round replaced to the **rejection ledger**: the element, the shape, and the reason the critic gave. It is one list, carried into every later critique prompt, and it is what keeps round 3 from proposing what round 1 threw out.
7. Report the round number, the score, and what changed.
8. Post the **round comment** on the PR: the round number, the score, the top objection, the per-finding record from step 2, and every screenshot in `round-N/`, each captioned with its state. Publish the images the way the repo publishes PR screenshots (its `AGENTS.md` says how); on a private repo that is a URL the reviewer's own session can load. Before the PR exists, the `round-N/` folders wait, and the step that opens the PR posts one round comment per round, in order. Done when the PR shows every round, so a reviewer can watch the screen change and see why.

## Stop when

- **Every finding from the last round is resolved** and the score reaches 9. Two gates, because they fail apart: a round that repairs three small things and breaks the central element scores higher and is further from done. The per-finding record from step 2 is the check.
- Only subjective taste is left.
- Four rounds are spent. Report what remains.

A **reversal** does not stop the loop, it redirects it: a critic asks to undo what an earlier round's critic asked for (fills, then no fills; codes, then names). Two shapes, each rejected in favour of the other, is a question sequential rounds cannot answer, because each critic sees one shape and no history. Go to [`CONTESTED-ELEMENT.md`](CONTESTED-ELEMENT.md), which builds the candidates and ranks them side by side, then come back here with the winner.

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
- When the same objection survives two fixes, hand it to the user rather than spending a third. An objection that flips rather than survives is a reversal, and goes to [`CONTESTED-ELEMENT.md`](CONTESTED-ELEMENT.md) instead.
- A finding that needs a call outside design (a clinical threshold, a pricing tier, a legal line) goes to the user with the critic's reasoning. Picking the number yourself to close the finding ships an invented fact.

## Finish

Check the PR carries a round comment for every round, the last one included.

When a round changed JavaScript (a new render path, a handler, a popup), the loop also changed behaviour the critic cannot see. Before reporting, run the `correctness-reviewer` agent on the loop's diff and fix what it confirms: edge data the seed skipped, library behaviour, focus and keyboard paths.
