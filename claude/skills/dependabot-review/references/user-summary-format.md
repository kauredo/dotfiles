# User summary format

Governs the Phase 5 report and the Phase 8 close-out. Assume the reader has never heard of these packages.

## Layout

Present summaries as a table, one row per package, led by an emoji. Columns: emoji, package, alerts, purpose, verdict, note.

The note is one or two short sentences saying what the package is for and how the verdict affects the product. Leave commands, versions and mechanisms out; they belong in the PR body, shown on request.

## Labels

Translate internal verdicts like this:

- SAFE becomes "Safe".
- SAFE WITH CHANGE becomes "Safe with a change", and the note names the change.
- NEEDS TESTING becomes "Needs testing", and the note names the uncovered path.
- PAPER FIX becomes "Fixed on paper only".
- BREAKS becomes "Breaks", and the note says what.
- NO FIX becomes "No fix exists".

## No fix available

Each alert gets its own entry containing:

- History: when the advisory appeared, the upstream issue, what the maintainer says, any open fix PRs.
- A drafted dismissal reason, chosen from `no_bandwidth`, `tolerable_risk`, `inaccurate`, `not_used`.
- At least one realistic way out (swap the package, drop the parent, patch it, use a fixed fork), each with its risk.

## Coverage gaps

An emoji list, kept short, of everything no check was able to confirm.

## Decision cards

Make a card for each unresolved choice:

1. Facts, in two or three plain sentences, linking upstream.
2. Exposure: the people able to trigger the vulnerable code, and the damage if they do.
3. An options table (Option, What happens, Downside) with the recommended choice in the top row, marked.
