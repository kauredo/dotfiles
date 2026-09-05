---
description: Full QA pipeline: audit, fix, then critique-loop until clean. Use when finishing work before commit.
---

Run the full quality pipeline on changed files. This is an autonomous pipeline, execute every phase yourself without pausing for user input between steps.

## Resolve target

- If `$ARGUMENTS` specifies files or components, use those
- If `$ARGUMENTS` is empty, run `git diff --name-only HEAD` to get files changed in this session (unstaged + staged). If nothing is uncommitted, use `git diff --name-only HEAD~1` to get the last commit's changes
- Include ALL changed files for the audit phase (code, scripts, configs, not just UI)
- For the critique phase, filter to UI-relevant files only (`.tsx`, `.jsx`, `.css`, `.html`)

If no changed files are found at all, tell the user and stop.

## Phase 1: Audit

1. Run `/audit` on all target files
2. Read the audit report carefully
3. **Immediately apply all fixes yourself**: edit the actual files. Skip anything that's subjective preference or over-engineering
4. If the audit recommends running specific commands (e.g. `/harden`, `/optimize`, `/normalize`), run those on the relevant files
5. Run linters/type-check to verify fixes don't break anything
6. Report briefly: what you fixed, what you skipped and why

**Gate.** Lint and type-check must be green before Phase 2 starts. If they are red, fix them and re-run. If you cannot get them green, stop and say what is failing. Do not open Phase 2 on a red tree, and do not report the pipeline finished while any check is red: a clean-sounding summary over a failing build is worse than no summary. No green tree, no Phase 2.

Once green, proceed directly to Phase 2, do NOT wait for user input.

## Phase 2: Critique Loop (UI files only)

Skip this phase if no UI files (`.tsx`, `.jsx`, `.css`, `.html`) were changed, and go straight to the summary below.

Invoke the `critique-loop` skill on those files. It owns the round loop, the critic-score convergence check, and the stop conditions (round cap included), don't restate them here.

Once it finishes, run linters/type-check to verify nothing broke. If they're red, fix and re-run before reporting.

## Rules

- **Act, don't just report.** Every finding should result in either a file edit or an explicit "skipped because X" note. Never produce a report and stop without applying fixes.
- Be surgical: only touch what audits and critiques flag
- Don't gold-plate, "good enough to ship" beats "theoretically perfect"
- Track progress: tell the user which phase you're on; `critique-loop` reports its own round progress
- Run type-check and lint after Phase 1's fixes, and again once the critique loop completes
- At the end, give a brief summary: phases completed, rounds run, what was found, what was fixed, what's left (if anything)
