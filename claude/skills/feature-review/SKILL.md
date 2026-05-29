---
name: feature-review
description: Multi-agent review of an existing feature (no diff needed). Scopes the feature's files, fans out 5 specialized reviewers in parallel, and aggregates findings. Use when the user names a feature to audit ("review the learning path", "audit notifications") rather than a code change.
disable-model-invocation: true
---

Run a feature-level audit by fanning out five specialized reviewers against an existing feature's files.

## When to use
- User names a feature/subsystem and asks for review, audit, or "what's wrong with X"
- No diff exists (or the diff is too small to capture the feature)
- For diff-based review, use `/code-review` instead

## Resolve target

The feature is named in `$ARGUMENTS`. If empty, ask the user which feature to audit and stop.

## Process

### 1. Scope the feature

Discover the files that make up the feature. Run `find` and `grep` for the feature name and obvious related terms across backend and frontend code (controllers, models, services, jobs, pages, components, hooks, lib, types, specs/tests). Build four buckets:

- **Backend core** — controllers, models, services, jobs, concerns owned by the feature
- **Frontend core** — pages, components, hooks, lib/api modules, types
- **Tests** — existing specs/stories for the feature
- **Adjacent** — files that touch the feature but aren't owned by it (note these but don't audit them)

If the codebase spans multiple repos (multi-service workspace), scope across all relevant ones.

### 2. Confirm scope with the user

Show the user the scoped file list (counts per bucket + a few representative paths) and ask: "Audit these N files? Or scope tighter / wider?" Five reviewers running on a wrong scope is expensive — confirm before fanning out.

If the scope is obviously correct and small (<20 files), skip the confirmation.

### 3. Fan out reviewers in parallel

Launch the following five specialized reviewer agents in a **single message** with multiple Agent tool calls so they run concurrently:

- `correctness-reviewer` — state-machine bugs, off-by-ones, null paths, race conditions, swallowed errors, wrong API usage
- `security-reviewer` — authz/tenant isolation, IDOR, mass assignment, signed-URL exposure, PII leakage, impersonation handling
- `performance-reviewer` — N+1s, missing eager loads, unbounded queries, missing indices, sync I/O in hot paths, React re-renders, polling
- `architecture-reviewer` — layering violations, leaky abstractions, god-objects, misplaced responsibilities, dead code, duplication
- `test-reviewer` — uncovered code paths, weak/brittle/over-mocked tests, missing regression tests for recent fixes

Each prompt MUST be self-contained (agents don't see the conversation). Include:
- **Feature context** — what the feature does, the domain entities, the user roles that touch it, any recent reactive fixes (grep `decisions/` or recent commits for hints)
- **Repo paths** — absolute paths for the repos involved
- **Files in scope** — the exact list from step 1, grouped by repo
- **Lens** — what to look for (use the bullet list above as the starter, customize per feature)
- **Explicit note** — "This is a feature-level audit, NOT a diff review. Read the listed files end-to-end."
- **Output format** — markdown list, max ~10 findings, sorted by severity (critical/high/medium/low), each with `path/to/file:LINE`, one-sentence problem, one-sentence impact, one-sentence fix

### 4. Aggregate

When all five return, produce a single aggregated report:

**Cross-lens consensus first.** Any finding flagged by 2+ reviewers goes at the top — these are the highest-signal issues. Call out which lenses flagged each.

**Then severity table.** Critical + High in a table with columns: `# | Lens | Where | Issue`. Each row one line.

**Then Medium worth noting.** Bulleted, terser.

**Skip Low** unless the user specifically asks for completeness.

**End with a "Top N to fix this week" pick** — the 3-5 highest-leverage items, calibrated by severity × ease.

### 5. Don't auto-fix

Do not start fixing findings unless the user explicitly asks. The skill's job is the audit, not the remediation.

## Rules

- All five reviewers run in parallel in one message — never serialize them
- Each reviewer's prompt is self-contained — never reference "the conversation" or "the user said X"
- Don't pad findings — if a reviewer returns 4 real issues and 6 nitpicks, drop the nitpicks in aggregation
- Cite `file:line` for every finding; ungrounded claims get dropped
- If two reviewers contradict each other, surface the disagreement rather than picking a side
