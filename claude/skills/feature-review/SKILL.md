---
name: feature-review
description: Multi-agent review of an existing feature (no diff needed). Scopes the feature's files, gathers design rationale, fans out 6 specialized reviewers in parallel, vets the findings, and aggregates them. Use when the user names a feature to audit ("review the learning path", "audit notifications") rather than a code change.
disable-model-invocation: true
---

Run a feature-level audit: gather why the feature is shaped the way it is, fan out six specialized reviewers against its files, then vet what they return before reporting any of it.

## When to use
- User names a feature/subsystem and asks for review, audit, or "what's wrong with X"
- No diff exists (or the diff is too small to capture the feature)
- For diff-based review, use `/code-review` instead

## Resolve target

The feature is named in `$ARGUMENTS`. If empty, ask the user which feature to audit and stop.

## Process

### 1. Scope the feature

Discover the files that make up the feature. Run `find` and `grep` for the feature name and obvious related terms across backend and frontend code (controllers, models, services, jobs, pages, components, hooks, lib, types, specs/tests). Build four buckets:

- **Backend core**: controllers, models, services, jobs, concerns owned by the feature
- **Frontend core**: pages, components, hooks, lib/api modules, types
- **Tests**: existing specs/stories for the feature
- **Adjacent**: files that touch the feature but aren't owned by it (note these but don't audit them)

If the codebase spans multiple repos (multi-service workspace), scope across all relevant ones.

### 2. Confirm scope with the user

Show the user the scoped file list (counts per bucket + a few representative paths) and ask: "Audit these N files? Or scope tighter / wider?" Six reviewers running on a wrong scope is expensive, so confirm before fanning out.

If the scope is obviously correct and small (<20 files), skip the confirmation.

### 3. Gather rationale before you fan out

Reviewers reading a feature cold will report deliberate tradeoffs as defects. `/code-review` avoids this by checking findings against the PR conversation and the ticket. A feature audit has none of that, so build the equivalent first.

Invoke the `why` skill on the feature. It queries source control, the issue tracker, docs and chat in parallel and returns a cited read on why the feature is shaped the way it is. Pull out:

- **Known tradeoffs**: things that look wrong and were chosen on purpose, with the reason.
- **Dead constraints**: reasons that were real once and no longer apply. These are findings in their own right; a workaround outliving its cause is worth surfacing.
- **Open threads**: decisions the record shows were deferred rather than made.

Hand the known tradeoffs to every reviewer in step 4 as explicit "do not report these as defects, they were chosen" context. Keep the dead constraints and open threads for yourself; they go in the report directly.

If `why` finds nothing usable (no issue tracker, thin history), say so and continue. Reviewers then run without that filter, and you should expect more already-settled noise in what comes back.

### 4. Fan out reviewers in parallel

Launch the following six specialized reviewer agents in a **single message** with multiple Agent tool calls so they run concurrently:

- `correctness-reviewer`: state-machine bugs, off-by-ones, null paths, race conditions, swallowed errors, wrong API usage
- `security-reviewer`: authz/tenant isolation, IDOR, mass assignment, signed-URL exposure, PII leakage, impersonation handling
- `performance-reviewer`: N+1s, missing eager loads, unbounded queries, missing indices, sync I/O in hot paths, React re-renders, polling
- `architecture-reviewer`: layering violations, leaky abstractions, god-objects, misplaced responsibilities, dead code, duplication
- `test-reviewer`: uncovered code paths, weak/brittle/over-mocked tests, missing regression tests for recent fixes
- `blast-radius`: not a defect lens. Map what outside the feature depends on it: callers, shared tables and scopes, background jobs, webhooks, cached reads, downstream consumers of its events. Report each dependency with the evidence rung that establishes it. This is the lens that tells you what a fix to this feature would cost elsewhere, and none of the other five cover it.

Each prompt MUST be self-contained (agents don't see the conversation). Include:
- **Feature context**: what the feature does, the domain entities, the user roles that touch it, any recent reactive fixes (grep `decisions/` or recent commits for hints)
- **Repo paths**: absolute paths for the repos involved
- **Files in scope**: the exact list from step 1, grouped by repo
- **Lens**: what to look for (use the bullet list above as the starter, customize per feature)
- **Explicit note**: "This is a feature-level audit, NOT a diff review. Read the listed files end-to-end."
- **Output format**: markdown list, max ~10 findings, sorted by severity (critical/high/medium/low), each with `path/to/file:LINE`, one-sentence problem, one-sentence impact, one-sentence fix

### 5. Vet the findings

Reviewers are tuned to surface everything, so some of what comes back is wrong, mis-located, or already settled. This skill previously went straight from fan-out to report, which meant every confident-but-wrong finding reached you. Do not skip this.

Open the cited code yourself for every CRITICAL and HIGH finding, and for any finding whose argument rests on a factual claim ("nothing validates this", "this runs on every request", "the job already handles it"). Excerpts and line numbers in the report come from **your** reads, not the reviewer's.

Tag each surviving finding with how you established it:

1. `asserted`: a reviewer said so and you did not check.
2. `traced`: you read the cited definition or call sites and the claim matches.
3. `ran`: you executed something that exercises the path.
4. `reproduced`: you produced the failure the finding predicts.

CRITICAL and HIGH may not ship on `asserted`. Trace them, or drop them to MEDIUM and soften the wording. Anything contradicted by the known tradeoffs from step 3 gets dropped, with a one-line note in the filtered list.

Drop what fails: a false premise, a suggested fix that isn't equivalent to what it replaces, a finding on a line that doesn't say what the reviewer claims. Record what you dropped in one line at the end of the report so I can overrule you.

### 6. Aggregate

When vetting is done, produce a single aggregated report:

**Cross-lens consensus first.** Any finding flagged by 2+ reviewers goes at the top, these are the highest-signal issues. Call out which lenses flagged each.

**Then severity table.** Critical + High in a table with columns: `# | Lens | Where | Issue`. Each row one line.

**Then Medium worth noting.** Bulleted, terser.

**Skip Low** unless the user specifically asks for completeness.

**Then dead constraints and open threads** from step 3, if `why` surfaced any. A workaround still in place after its reason expired is a real finding no reviewer can see from the code alone.

**End with a "Top N to fix this week" pick**: the 3-5 highest-leverage items, calibrated by severity × ease.

### 7. Don't auto-fix

Do not start fixing findings unless the user explicitly asks. The skill's job is the audit, not the remediation.

## Rules

- All six reviewers run in parallel in one message, never serialize them
- Each reviewer's prompt is self-contained, never reference "the conversation" or "the user said X"
- Don't pad findings, if a reviewer returns 4 real issues and 6 nitpicks, drop the nitpicks in aggregation
- Cite `file:line` and an evidence rung for every finding; ungrounded claims get dropped in step 5, not in aggregation
- If two reviewers contradict each other, surface the disagreement rather than picking a side
