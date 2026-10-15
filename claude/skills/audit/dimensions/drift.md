# drift

State that says two things, or the same thing twice. Code only; skip prose.

## Discover

Languages and frameworks (frontend, backend), ORM or DB layer, data-fetch and cache libraries, codegen pipelines. Module boundaries (monorepo or single repo, shared versus app code). State locations: where UI state lives, where types are defined (generated or handwritten), where the DB schema lives, what codegen is meant to own. Ask the user to confirm the generated-versus-handwritten split and the chosen source of truth.

## Categories

One subagent each at scale.

1. **Boolean explosion and impossible states**
   - Several `is*`/`has*` flags in one type or component; three or more boolean props on a state object.
   - Contradictory combinations: loading and error, open and closed, valid and has-errors.
   - A bag of optionals (`loading?`, `data?`, `error?`) where a discriminated union belongs.
   - Auth contexts with independent authenticated, loading and user fields.
   - Reducers that flip several booleans instead of moving one status value.
   - DTOs with pairs like active/deleted.
   - Recommend a status enum or discriminated union with an exhaustive switch (never-check, `satisfies`).
2. **Magic strings and status mismatches**
   - Literals compared or assigned for status, role, type (pending, active, draft, published, cancelled).
   - The overlooked ones: HTTP methods, event names, queue and topic names, cache-key prefixes, permission strings.
   - A string `switch` with no exhaustiveness check.
   - DB enum versus code enum: different value counts, case styles with no mapping, spelling variants (cancelled/canceled), generated types diverging from handwritten ones.
   - Raw SQL with hardcoded statuses; migrations that add enum values the code ignores; Django or SQLAlchemy `choices` versus constants; Go `iota` versus DB values.
3. **Duplicated and derived state**
   - Fetched or cached data copied into local state or a global store; one endpoint under different cache keys.
   - `selected*`/`current*`/`active*` copies of list items instead of an id plus a lookup.
   - Stored counts, totals or formatted values derivable from the source.
   - Sync effects whose only job is setting other state: React effect-sets-state, Vue watch-sets-ref, Svelte effect-sets-state. The right construct is memo, computed, or Svelte `$derived`/reactive declarations (those are correct already).
   - Angular subjects duplicating HTTP data; store slices that transform other slices.
   - Backend: a cache nothing invalidates, a denormalized field no trigger updates, a setting read from env in one place and the DB in another.
4. **State machine opportunities**
   - Wizards on a numeric index with no guards; submit, auth, document, payment and onboarding lifecycles.
   - Transitions guarded by scattered ifs; one handler calling several setters that ought to change together.
   - A status field holding 4+ values with neither a reducer nor a machine.
   - Missing async guards: submit while submitting, logout during login, mutation while pending.
   - Backend: direct status assignment, `UPDATE` with no `WHERE` on the previous status, no CHECK or trigger, endpoints accepting any target status.
   - Look for an existing FSM library (XState, Robot, transitions, python-statemachine, looplab/fsm, aasm, statesman). Partial adoption is drift.
5. **Single-source-of-truth violations**
   - Codegen bypass: handwritten types duplicating generated ones, manual fetch or axios around a generated client, `as` casts papering over a shape mismatch, duplicate validation schemas.
   - Validation, role checks, limits or flags duplicated across frontend and backend.
   - The same interface in several files; ORM types redeclared as DTOs; enum values hardcoded repeatedly.
   - Config drift: env versus code values, scattered URLs, duplicated timeouts and retries, `.env*` files with different key sets, compose, app and CI env that disagree.
   - Cross-layer: optimistic update without rollback, `setQueryData` without invalidation, stale closures, localStorage used as state, client auth token out of sync.
   - Monorepos: the same type or constant in several packages.

## Tiers

- P1: bugs happening now (impossible state reached, data corruption).
- P2: likely bugs (missing machine with races, no cache invalidation).
- P3: debt (magic strings, stored derived state, sync effects).
- P4: minor duplication or naming.

## Report extras

Add a `Tech Stack` section covering the stack, module boundaries and where state lives. Count in the summary: impossible states, magic strings, duplicated state, missing state machines, and truth-source violations.

## Fix options

Extras: fix P1 only, fix all auto-fixable, generate a refactor plan (hand to `improve`).

- Auto-fixable: magic string to enum or const, simple boolean pair to union, obvious derived state to computed, duplicate type to one export, sync effect to memo.
- Human decision: transition design, which layer owns the data, complex unions, cache strategy.
