---
name: critique-loop
description: Run /critique iteratively — critique, fix, re-critique — until no meaningful issues remain
disable-model-invocation: true
---

Run a design critique loop. Repeat until satisfied.

## Resolve target

- If `$ARGUMENTS` specifies files or components, use those
- If `$ARGUMENTS` is empty, run `git diff --name-only HEAD` to get files changed in this session (unstaged + staged). If nothing is uncommitted, use `git diff --name-only HEAD~1` to get the last commit's changes
- Filter to only UI-relevant files (`.tsx`, `.jsx`, `.css`, `.html`) — skip tests, configs, scripts, and non-UI code

If no UI files are found, tell the user and stop.

## Process

### Each round
1. Run `/critique` on the target files
2. Review the findings
3. Apply all fixes that make sense (skip suggestions that are subjective preference or would over-engineer things)
4. If the critique recommends specific commands (e.g. `/harden`, `/bolder`, `/quieter`, `/clarify`, `/colorize`, `/optimize`, `/normalize`), run those commands on the relevant files
5. Briefly note what you fixed and which commands you ran

### Stop when
- No new critical or high-priority issues surface
- Remaining suggestions are purely subjective taste, not real problems
- Applying more changes would risk over-polishing or breaking what already works

### Rules
- Be surgical — each round should only touch what the critique flagged
- Don't gold-plate — "good enough to ship" beats "theoretically perfect"
- Track rounds — report which round you're on and what changed
- If the same issue keeps resurfacing after a fix, flag it to the user instead of looping forever
- Max 4 rounds — if still finding critical issues after 4, stop and report what's left
