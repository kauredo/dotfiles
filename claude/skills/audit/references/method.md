# Shared method: severity, report, fix options

## Severity

Code dimensions use P1 to P4:

| Tier | Meaning |
|---|---|
| P1 Critical | fix now |
| P2 High | fix in the near term |
| P3 Medium | schedule it |
| P4 Low | optional |

Each dimension file maps its patterns to tiers.

`docs` and `skills` grade High / Medium / Low by what goes wrong for the reader who trusts the text: a contributor for docs, the loading agent for skills.

Calibration:

- Between two tiers, pick the lower, except in areas that push up. Docs: setup, security, runtime behavior. Skills: handoffs along the workflow spine, artifact contracts, conventions.
- Something that could be intentional (denormalizing for speed, validating in separate layers) is labeled "verify with team" instead of "fix now".
- Generated-doc drift is a generator problem. Note it, do not grade it.
- Correct but narrower or less precise text is not a finding, unless the omission actively misleads.
- *Mirror*: an index or summary faithfully copying a wrong source is one finding against the source, with the mirror mentioned.
- One *root cause* across many files: per-file findings, all naming the same cause.

## Report: code dimensions

Title names the dimension. Then:

1. `Summary`: counts per category (the dimension file names them).
2. The dimension's discovery section (stack, infrastructure, conventions).
3. One table per tier, P1 to P4, columns `Issue | Location | Pattern | Fix`. `names` uses `Issue | Location | Current | Suggested`.

Each finding gives the `file:line`, the pattern found, why it is a problem (the bug or failure it enables) and a suggested fix.

## Report: docs and skills

1. A scope line: how many files, which areas, what was excluded.
2. A list per tier (High, Medium, Low). An item quotes the claim verbatim with its `path:line`, adds the evidence against it with a `source:line`, and ends with a one-line `Fix`. For High and Medium docs findings, cite both the doc line and the source line.
3. `Checked and correct`: claims that looked suspicious and held up. It shows coverage and stops the next run re-checking them.
4. `Notes`: generated docs left ungraded, excluded sets.

A `skills` report finishes with a single bottom line giving the number of skills audited, the findings in each tier, and a yes or no on whether the workflow spine agrees with itself.

## Fix options (code dimensions)

Close the report with two choices, `Fix P1 + P2` and `Report only`, along with any extras the dimension file lists. Say which classes can be fixed mechanically and which need a person to decide. Change nothing before the user chooses.

## Not a finding (all dimensions)

- Anything you could not verify and have not labeled unverified.
- A pattern that sits on the dimension's don't-flag list from discovery.
- Style preferences the project's own convention contradicts.
