---
description: Whole-repo over-engineering audit. Sweeps the existing codebase (not a diff) for code that didn't need to exist, then hands back a prioritized delete-list.
argument-hint: "[path | --area <dir>]"
---

You are auditing an existing codebase for over-engineering. Unlike `/code-review`, there is no diff — you are looking at code already shipped, asking of each piece: *did this need to exist, and is it more complex than the job requires?* The deliverable is a prioritized **delete-list**, not a bug report.

> **Voice.** The report reads like a senior dev who'd rather delete than defend. Plain, short sentences. No significance-inflation words, no rule-of-three padding, no tidy summary closers. Follow `~/.claude/writing-style.md`.

## Step 1 — Resolve scope

Argument: `$ARGUMENTS`

- **No argument** → audit the whole repo from the root, excluding vendored/generated trees (`node_modules`, `vendor`, `dist`, `build`, `.next`, `target`, lockfiles, migrations, anything in `.gitignore`).
- **A path** (e.g. `src/payments`) → audit only that subtree.
- **`--area <dir>`** → same as a path; explicit form.

A whole repo is too big for one agent. Map it first: list top-level source dirs, get a rough line count per dir (`git ls-files | grep -E '\.(rb|js|ts|tsx|py|go|...)$' | xargs wc -l`, scoped to source), and group the code into 3–8 coherent **areas** (by directory or bounded context). You'll fan reviewers out per area.

## Step 2 — Read project context

Read `CLAUDE.md`, `AGENTS.md` (root and any nested ones), and the manifest (`package.json`, `Gemfile`, `go.mod`, `pyproject.toml`, etc.) to learn the stack, the architecture style, and the project's own simplicity rules. The audit is judged against the *project's* conventions, not your taste — flag deviations from how this codebase already does things, plus genuine over-engineering.

## Step 3 — Fan out per area

For each area from Step 1, invoke **`architecture-reviewer`** and **`style-reviewer`** via the Agent tool, in a single message with multiple tool_use blocks so they run concurrently. (Skip `security`/`correctness`/`performance`/`test` reviewers — this is a complexity sweep, not a bug hunt.) Each call must include:

1. The area's path(s) and the repo root.
2. An explicit instruction that this is a **whole-codebase audit, not a diff** — so "review the existing code in `<area>`; there is no changeset. Apply the YAGNI ladder to everything you see, not just new additions."
3. A reminder to prioritize *removal-class* findings: dead code, single-impl abstractions, speculative flexibility, config with one value, over-parameterized helpers, reinvented stdlib, duplication past the rule of three. **Removal-class only.** If you trip over a performance, correctness, or security bug (slow query, missing index, an injection, a race), it is *not* an over-engineering finding — note it in one line for `/code-review` and move on. Don't let "this is slow" or "this is buggy" leak into the delete-list.
4. The output format from the reviewer's own instructions.

If an area is large, point the reviewer at the area's entry points and let it read outward rather than pasting files.

## Step 4 — Vet (reviewers over-report, more so without a diff)

Without a diff to anchor them, reviewers will surface more false positives — code that *looks* unused but is wired up via metaprogramming, reflection, DI, a router, a config string, or an external caller. Before anything reaches the report, confirm each removal candidate:

- **"This is dead / unused"** → grep for references across the whole repo, including string-based and dynamic dispatch. Check it isn't a public API export, a framework entry point (controller action, CLI command, migration, webhook handler), or referenced from config/tests. Public surface is not dead just because there's no internal caller.
  - **Use `rg`, or quote your globs** (`grep --include='*.ts'`, not `--include=*.ts`) — an unquoted glob gets eaten by the shell and silently returns zero matches, which reads as "confirmed dead" when nothing actually ran. A confidently-wrong delete starts here.
  - **Watch for name collisions.** A bare-identifier grep over-counts when the name is also a common property/variable (e.g. a Convex query `isAuthenticated` vs. an auth-hook's `.isAuthenticated`). Confirm dead claims against the *qualified* call form, not the bare name.
  - **Convex / RPC dispatch is string-based.** Functions are invoked as `api.<module>.<fn>` / `internal.<module>.<fn>` from the frontend, crons, and http routes — never imported by symbol. Grep both the qualified `api.`/`internal.` forms and the bare name, and check `crons.ts` / `http.ts`, before calling any backend function dead.
- **"This abstraction has one implementation"** → confirm there's genuinely no second implementer and no external/plugin consumer that needs the seam.
- **"This reinvents X"** → confirm X (stdlib/dependency) actually covers the behavior, including the edge cases the hand-rolled version handles.

Drop anything you can't confirm. A wrong "delete this" is worse here than in a diff review — the user may act on it and break something live. Record what you dropped under the footer.

## Step 5 — Aggregate into a delete-list

Sort surviving findings by **payoff**: estimated lines removed × confidence, highest first. Render:

```
# Code Audit — <scope>

<summary: M findings · ~N lines removable · across A areas>

| Rank | Lines | File(s)                         | What to delete / simplify          |
|------|-------|---------------------------------|------------------------------------|
| 1    | ~120  | `lib/plugin_registry.rb`        | plugin system with one plugin      |
| 2    | ~60   | `app/services/*_factory.rb`     | factories for 2-field objects      |
| 3    | ~30   | `utils/retry.ts`                | reimplements p-retry (a dependency)|

---

## 1 · `lib/plugin_registry.rb` · ~120 lines

**Plugin system with a single plugin.** <2–4 sentences: what exists, why it's more machinery than the one use case needs, what to collapse it to. Note any caller that has to change.>

**Delete plan:** <concrete steps — inline the one plugin, drop the registry, update the N call sites.>
**Risk:** <low/med/high — what could be wired up dynamically that grep wouldn't show.>

---

## 2 · …
```

Then a footer:

```
## Areas audited
- <area> ✓
- <area> ✓

## Dropped in vetting (omit if nothing dropped)
- <candidate> — kept: reachable via <router/DI/reflection>
```

Formatting: one finding per ranked row; `~lines` is a conservative estimate; sort the detail sections by rank. Each detail block must be self-contained. Backticks around paths and identifiers. No preamble.

If nothing survives vetting, say so plainly: "No over-engineering worth removing found across A areas." — skip the table.

## Step 6 — Offer the next action

After the report, ask via `AskUserQuestion` whether to (a) execute the top-K deletions as a branch of small, individually-revertable commits, or (b) leave the report. Don't touch code without explicit approval — and when approved, do the highest-confidence, lowest-risk items first, running the test suite between commits.

## Important

- This is a **simplification** audit. Don't report bugs, security holes, or missing tests — that's `/code-review`. If you trip over a real bug mid-audit, note it in one line under the footer and move on.
- Never recommend deleting trust-boundary validation, data-loss handling, security, or accessibility code. "Lazy, not negligent."
- Confidence over volume. Ten solid deletions beat fifty maybes.
