---
name: sweep
description: "One bounded quality pass over recently churned files: auto-fix only provably safe cleanups in a single PR, report the rest."
disable-model-invocation: true
---

# Sweep

A boring, bounded pass over recently churned files. Fix what is provably safe, report the rest. Finding nothing is a success.

Optional argument: the churn window (default 14 days). Read the project instruction files (`CLAUDE.md` or similar) for layout and commands, and discover test, lint and typecheck commands from manifests when they are missing. Read each area's own instructions before editing it.

## Bounds

- **One open sweep.** If any open PR has a branch starting `sweep/`, run report-only.
- **Size cap**: about 150 changed lines and 10 files. Overflow is ranked into the report.
- **Auto-fix bar**, provable only:
  - imports, variables or exports made dead (whole-repo search plus typecheck confirm it)
  - doc lines that contradict the code they describe
  - a TODO or FIXME whose work is verifiably done
  - duplicated logic that has an existing canonical helper

  If safety needs an argument instead of a search, it is a finding.
- **Never auto-touch**: schema and migrations, shared contract packages, auth, security and access-policy code, translation key removals (dynamic keys make "unused" unprovable), CI config, infra, decision records (ADRs are append-only: supersede, never edit). Apply the same idea to whatever else this repo treats as load-bearing. Findings there go to the report.
- **Nothing leaves the repo.** No issues filed, no comments elsewhere. The report proposes, I file.
- Headless run with no one to ask: each question becomes a report item.

## Steps

1. **Scope from churn.** List the most-changed files in the window (top ~30) from `git log`, minus lockfiles, migrations, generated paths and files that no longer exist. Record their owning areas.

   Done when the hot-file list (10-30 files) and touched areas are recorded.

2. **Audit hot areas only.** Dispatch fresh-context subagents, one per dimension, each scoped to the hot areas: `audit <dimension>` for `todos`, `errors`, `names`, `drift` and `docs`, plus one simplification and reuse pass over the hottest files. Their checks live in the audits, so restate none of them. Treat each result as evidence and verify it against the real file before acting.

   Done when findings are deduplicated and each carries file:line evidence.

3. **Triage** every finding into exactly one bucket:
   - Auto-fix: meets the bar, fits the cap, sits outside never-touch.
   - Report: ranked by value, with a one-line suggested action.
   - A bug goes to the report pointing at diagnosing-bugs. A removal candidate goes to the report pointing at `unship`. The sweep fixes neither.
   - Over the cap: keep the best, demote the rest to the report.

   Done when every finding is labelled and the auto-fix pile is inside the cap.

4. **Fix and verify.** Branch `sweep/<YYYY-MM-DD>` off the default branch. Make small self-contained `chore` commits in the repo's convention. Run the repo's battery: lint, format check, typecheck, tests (affected ones where possible), doc-drift and key-consistency checks if they exist, and the guards for any registry touched. If a fix breaks any check, revert it and move it to the report. Never debug it until it passes.

   Done when every commit is green.

5. **Deliver.**
   - With fixes: push and open one PR with a `chore:` title naming what was cleaned. The body lists applied fixes grouped by kind with evidence, a Deferred findings section, and the expected risk (low).
   - Report-only (no fixes, cap spent, or an open sweep PR): the report is the final chat output. No empty PRs.

   Done when exactly one PR exists or none does by stated reason, and no deferred finding is dropped.

The report carries: hot files, areas, findings (file:line, kind, evidence), auto-fixes, deferred items (rank, file:line, suggested action), checks run, and the PR or the report-only reason.

## Handoffs

- Review of the sweep PR: `/code-review`.
- Bigger refactors and prioritized plans: `improve`.
- Terminology or decision-record updates: `domain-modeling`.
