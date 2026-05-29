---
description: Full QA pipeline — audit, fix, then critique-loop until clean. Use when finishing work before commit.
---

Run the full quality pipeline on changed files. This is an autonomous pipeline — execute every phase yourself without pausing for user input between steps.

## Resolve target

- If `$ARGUMENTS` specifies files or components, use those
- If `$ARGUMENTS` is empty, run `git diff --name-only HEAD` to get files changed in this session (unstaged + staged). If nothing is uncommitted, use `git diff --name-only HEAD~1` to get the last commit's changes
- Include ALL changed files for the audit phase (code, scripts, configs — not just UI)
- For the critique phase, filter to UI-relevant files only (`.tsx`, `.jsx`, `.css`, `.html`)

If no changed files are found at all, tell the user and stop.

## Phase 1: Audit

1. Run `/audit` on all target files
2. Read the audit report carefully
3. **Immediately apply all fixes yourself** — edit the actual files. Skip anything that's subjective preference or over-engineering
4. If the audit recommends running specific commands (e.g. `/harden`, `/optimize`, `/normalize`), run those on the relevant files
5. Run linters/type-check to verify fixes don't break anything
6. Report briefly: what you fixed, what you skipped and why

Then proceed directly to Phase 2 — do NOT wait for user input.

## Phase 2: Critique Loop (UI files only)

Skip this phase if no UI files (`.tsx`, `.jsx`, `.css`, `.html`) were changed.

Execute this loop autonomously — do NOT pause between rounds:

```
for round = 1 to 4:
  1. Run `/critique` on the UI files
  2. Read the critique report
  3. Apply all actionable fixes yourself — edit the files directly
  4. If the critique recommends specific commands, run them
  5. Run linters/type-check to verify
  6. Check: are there any new critical/high issues that weren't in the previous round?
     - YES → continue to next round
     - NO → stop the loop
```

### Stop the critique loop when
- No new critical or high-priority issues compared to the previous round
- Remaining suggestions are subjective taste, not real problems
- Further changes would risk over-polishing or breaking what works
- Round 4 completes (hard max)

## Rules

- **Act, don't just report.** Every finding should result in either a file edit or an explicit "skipped because X" note. Never produce a report and stop without applying fixes.
- Be surgical — only touch what audits and critiques flag
- Don't gold-plate — "good enough to ship" beats "theoretically perfect"
- Track progress — tell the user which phase/round you're on (e.g. "Phase 2, Critique Round 2")
- If the same issue keeps resurfacing across rounds, flag it to the user instead of looping
- Run type-check and lint after each round of fixes
- At the end, give a brief summary: phases completed, rounds run, what was found, what was fixed, what's left (if anything)
