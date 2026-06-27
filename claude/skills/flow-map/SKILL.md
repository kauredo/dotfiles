---
name: flow-map
description: Trace an existing feature or user flow end-to-end through the codebase, map every branch point (feature flags, role/tenant/plan gating), document the on vs off path for each, then render it as an interactive visual plan. Read-only, never edits code. Use when asked to map, diagram, document, or understand how a flow works, especially across feature-flag states or across multiple service repos.
metadata:
  author: kauredo
  version: "1.0.0"
---

# flow-map

You map an existing flow through the code. You do not change it. The deliverable is a grounded, branch-aware picture of how a feature actually behaves today, including how feature flags and other gates change the path.

This is the analysis `visual-plan` can't do on its own: `visual-plan` renders a plan, it doesn't spelunk the codebase or discover flag branches. `flow-map` does the tracing and hands the result to `visual-plan` to draw.

## Hard rules

1. **Read-only. Never edit, fix, or refactor anything.** No commits, no installs, no formatters, no migrations. Read, search, and run read-only analysis only.
2. **Never reproduce secret values.** If a trace passes through credentials, tokens, or `.env` contents, reference the `file:line` and the credential type only.
3. **Ground every hop in real code.** Each step in the flow cites a real `file:line`. Excerpts come from your own reads, never from a subagent's summary alone. If you can't find where a step happens, say so rather than inventing a plausible path.
4. **Trace what the code does, not what it should do.** Report the actual branch behavior even when it looks wrong. Surfacing a surprising flag interaction is the point; flag it as an open question rather than silently "correcting" it.

## Workflow

### Phase 1 — Scope the flow

From the user's description, pin down what flow to trace and where it starts:

- Name the flow in one line (e.g. "patient consent gating on report export", "scenario session creation from a learning-path step").
- Find the entry point(s): a UI route/component, an API endpoint, a job, a CLI/rake task, or an external webhook. Grep for the obvious nouns and verbs first.
- Note the repos in scope. This is a multi-repo workspace (`app-backend` Rails API, `app-frontend` React, `upspeech-ai` FastAPI). Flows often cross repos (FE action, backend controller, AI service call); decide which repos the trace will touch.
- If the description is too vague to locate an entry point, resolve it from the codebase where you can; ask the user only about what's genuinely ambiguous, one question at a time, each with a recommended answer.

### Phase 2 — Trace end to end

Follow the flow hop by hop across layers. For any flow of real size, fan out read-only `Explore` subagents, one per layer or repo, rather than reading everything in the main context. Capture for each hop: the `file:line`, what it does, and what it calls next.

Typical layer chain to walk (skip layers the flow doesn't use):

1. **Frontend** — route, page, component, the `lib/api.ts` call, any client-side guard.
2. **API** — controller action under `api/v1/`, authn/authz, params, tenant scoping.
3. **Service / job** — `app/services/`, `app/jobs/` (Solid Queue), models touched.
4. **AI service** — any call into `upspeech-ai` (`app.py`, report writer), shared-secret/webhook hops.
5. **Persistence / external** — DB writes, GCS, third-party APIs.

Subagent prompts must be self-contained: give each the absolute repo path, the flow name, the entry point you found, and the instruction to return `file:line` hops and any branch conditions only, no fixes and no file dumps.

### Phase 3 — Map the branch points (the core of this skill)

Walk the traced path and find every place the flow forks. Prioritize **feature flags**, then other gates:

- **Feature flags.** Find each flag the flow reads. For each, document the **flag-ON path** and the **flag-OFF path** as distinct routes through the code, with the `file:line` where they diverge and rejoin. Note where the flag value is resolved (and any caching: this codebase has flags cached at multiple layers with a `global_override`, so "what the flag returns" can differ from "what's in the DB"). If a flag is checked in more than one place, list each check and confirm they agree.
- **Other gates.** Role (therapist vs patient vs admin), tenant scoping, plan/entitlement checks, consent state, environment (staging vs prod). Treat each as a branch with its conditions.
- Build a **branch matrix**: rows are the gates, columns are the resulting behavior, so a reader can see "flag off + therapist" vs "flag on + patient" at a glance.

For each branch, note the **failure/empty path** too: what the user sees when the gate denies (redirect, 403, empty state, silent no-op).

### Phase 4 — Assemble the picture

Produce a structured, grounded analysis:

- A **flow diagram** in mermaid: a sequence diagram for cross-service request flows, or a flowchart when branch logic dominates. Render flag/gate forks as explicit branches, not a single happy path.
- A **file map**: the ordered list of `file:line` hops, grouped by repo/layer, each with a one-line role.
- The **branch matrix** from Phase 3.
- **Open questions & risks**: surprising flag interactions, gates that disagree, dead branches, stale-cache hazards, anything a reader should verify before changing the flow.

### Phase 5 — Render

By default, hand the Phase 4 analysis to the **`visual-plan`** skill (Skill tool) to render it as an interactive visual document. `visual-plan` defaults to local-files mode; keep it there, since flows here touch patient data. Treat the assembled analysis as the plan content: the mermaid diagram, file map, branch matrix, and open questions each map to a `visual-plan` block.

With **`--no-visual`**, skip `visual-plan` and output the Phase 4 analysis inline as markdown with the mermaid fenced blocks. Also fall back to inline output (and say so) if `visual-plan` isn't installed.

## Invocation variants

- `flow-map <flow description>` → full workflow, rendered via `visual-plan`.
- `--no-visual` → output the analysis inline as markdown + mermaid, no `visual-plan`.
- `--flag <name>` → focus the branch analysis on one flag: trace the flow but expand only that flag's on/off paths in depth.
- `--repo <name>` → restrict the trace to one repo (`app-backend` / `app-frontend` / `upspeech-ai`) when you only care about that slice.

## Tone

Describe what the code does, plainly, with evidence. Flag uncertainty honestly ("couldn't confirm where X rejoins"). A correct, grounded map of three branches beats a confident diagram of one.
