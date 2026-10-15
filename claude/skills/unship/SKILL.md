---
name: unship
description: "Unship: remove a feature end to end by tracing its footprint and deleting leaf to root, with the repo's own guards proving completeness. Use for \"unship\", or to drop a feature, endpoint, flag or route, or when an audit or sweep concludes something should go."
---

# Unship

Removal is a graph walk from entry points outward, then deletion from leaf to root. The repo's own guards (typecheck, lint, tests, drift and key checks) prove completeness. A good diff is nearly all deletions.

Watch for two mistakes. Removing too little leaves contracts, strings, routes, tests, seeds or docs behind. Removing too much deletes shared code that the feature only borrowed.

This skill executes a removal decision. It never makes one. Inputs: the feature name, entry points if known (routes, flag keys, symbols, component names, translation key prefixes, contract names), the reason, and any ticket or ADR reference. Layout comes from the project instruction files.

## Steps

1. **Confirm the kill decision.** Restate what goes and why, citing the ticket or ADR. A missing or contested why stops the run and goes back to me. Define "removed": endpoints gone or flag permanently off, data dropped or kept, any deprecation window. I am the approver. Data loss needs my explicit yes before the step that causes it, and is better split into a later step.

   Done when scope and data implications are stated and I agreed.

2. **Map the footprint.** Grep outward from the entry points until nothing new appears. Record each hit as file:line and tag it **owned** (delete) or **shared** (keep the code, remove only this feature's usage). Calling a shared item orphaned takes a whole-repo search showing zero consumers once the feature is gone. Dead code outside the footprint gets a mention and no chase.

   Check every surface and prove empty ones empty:
   - contracts, schemas and registrations
   - backend modules, wiring, event emitters, audit logging
   - data: models, enums, access policies, seeds
   - frontend: hooks, components, route files, route registrations and their conformance guards
   - translation keys, all locales
   - flags: registrations and consumers
   - the feature's own tests (unit, e2e, integration)
   - docs: ADRs, agent instructions, per-area docs, project docs
   - config: env vars and their validation, CI path globs, and any ownership entries that only exist for this feature

   Done when the list covers all nine surfaces with evidence.

3. **Remove leaf to root**, one self-contained green commit per step:
   1. UI components and route files, then route entries and conformance guards
   2. contract procedures and schema registrations, then backend module, wiring, events
   3. flags and their consumers; translation keys in every locale
   4. docs, updated in the same change; the feature's ADR marked superseded, never deleted
   5. schema last

   Tests go in the same commit as the code they cover. A schema drop is a new forward migration, never an edit to old ones. By default the first change leaves the feature dark and removes code, and a follow-up drops schema after a quiet period. A same-change drop needs the step 1 sign-off.

   Evidence the feature is still used (traffic, an unexpected consumer) halts the run and gets reported.

   Done when every owned item is deleted, shared items are clean of this feature's usage, and each step is a green commit.

4. **Prove the removal.**
   - Run the repo's typecheck, lint, format check, tests (including route and key-conformance guards), doc-drift check, translation-key check, and migration checks when schema changed.
   - Search check: grep distinctive symbols, key prefixes, route paths and flag keys. Only migration history and superseded ADRs may still match.
   - Runtime check: start the app (via the `run` skill if present). The removed surface should be gone (404, flag absent) while nearby features keep working.

   Done when every check passes and both the search and runtime evidence are in the report.

5. **Record it.** When the removal is itself an architectural decision, write it with `domain-modeling`, superseding the original ADR. Write the PR or commit summary covering what was removed and why, the footprint, data implications, and a risk note (does it touch data, yes or no).

   Done when the ADR exists if warranted and the summary has all four items.

## Handoffs

- Candidates arrive from `sweep` and `audit <dimension>` findings.
- `/code-review` before merge.
- A broken neighbor or unexpected failure: diagnosing-bugs.
- Larger follow-up cleanup: `improve`.
