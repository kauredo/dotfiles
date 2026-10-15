---
name: audit
description: Read-only audit of one dimension at a time. Pick drift (state held twice, or states that cannot coexist), errors (swallowed failures), names (vague identifiers), todos (stale markers), docs (outdated text, dead links) or skills (after skills or commands change). Fix plans go to improve; over-engineering goes to code-audit.
---

# Audit

One dimension per run, named by the argument: `drift`, `errors`, `names`, `todos`, `docs` or `skills`. The audit discovers, verifies and reports. It edits nothing unless the user asks afterwards.

## Pick the dimension

No argument, or one that is not in the list: do not guess. Show this menu, ask which (or which subset), and stop until the user answers.

| Dimension | Looks for |
|---|---|
| `drift` | duplicate or stale state, boolean explosion, impossible states, magic strings, enum mismatches across layers, source-of-truth violations |
| `errors` | swallowed errors, empty or broad catches, unhandled async, lost causes, inconsistent strategy |
| `names` | vague names, single-letter variables, boolean naming, casing, abbreviations, one concept under several terms |
| `todos` | stale or low-quality markers, security and bug markers, references to closed issues |
| `docs` | documentation claims that no longer match the code or each other |
| `skills` | agent-skill claims that no longer match sibling skills, the repo, or its conventions |

Several dimensions requested: run them one after another, each with its own discovery, report and stop. Never interleave two in one pass.

## Boundaries

- "Audit the codebase, what should we work on" wants a prioritized cross-category plan. Say the request and this skill do not match, and hand it to `improve`. Prioritized fix plans for audit results go to `improve` too.
- Diff or PR review: `/code-review`.
- Removing a feature or dead code end to end: `unship`. An audit may conclude something should go; it does not remove it.
- Glossary and ADR work (terminology decisions, recording or superseding an ADR): `domain-modeling`.
- Over-engineering and needless abstraction: `code-audit`. This skill does not judge design complexity.
- The four code dimensions (`drift`, `errors`, `names`, `todos`) never audit prose or skills. A request about docs or skills runs `docs` or `skills`.
- A ground truth that does not exist (no ADR directory, no tracker) means that check is skipped, not invented.

## Steps

Load only the selected dimension: [`dimensions/<dim>.md`](dimensions/) and [`references/method.md`](references/method.md). Read both now. Leave the other five dimensions' files alone.

1. **Discover.** Detect the stack, layout and conventions the dimension file lists; assume none of them. Check recently changed files if `git` or an mtime-sorted glob is available, and skip that silently when neither is. Summarize what you found to the user and wait one beat for a correction before auditing, since a misread stack poisons every finding.
2. **Scope.** Code dimensions skip `vendor`, `target`, `build`, `dist`, `.turbo`, `__pycache__`, `node_modules`, generated migrations and codegen output (the generator configs say where it lands). Tests stay in scope but are marked as such and judged less strictly. `docs` and `skills` define their own exclusions.
3. **Scale.**
   - Code dimensions under about 50 source files: search everything yourself in one pass.
   - Larger: one subagent per category, all launched in a single message. Never work the categories serially yourself.
   - `todos`: parallelize categories 1 to 3 only. Category 4 scores quality from the category 1 inventory, so the orchestrator runs it afterwards.
   - `docs`: under about 10 docs in one area, verify yourself. More, or several areas: one subagent per area. In the grey zone, fan out.
   - `skills`: under about 10 skills, do it yourself. Beyond that, one subagent per group (workflow spine, boilerplate sharers, domain and reference skills), in a single message.
4. **Verify.** Every candidate gets checked against the real source before it becomes a finding. An absence claim needs a tool result: a failed grep, a directory listing, a broader glob. A narrow glob that returned nothing proves nothing. Use Grep, Glob and Read. Few findings you are sure of beat a padded list; a suspicion you could not check is labeled unverified, or dropped with a note on what blocked the check.
5. **Report.** Shape, tiers and calibration are in `references/method.md`. Every finding carries `file:line` and concrete evidence.
6. **Close.** Code dimensions end with fix options (in the method file). `docs` and `skills` present the report and stop.

## Fan-out

A subagent knows only its brief. Each brief carries:

- the absolute paths of the dimension file and `references/method.md` (subagents can read them), plus its category or area;
- the stack and conventions from discovery;
- a non-overlapping file set, the same instructions as every sibling, and the rule that nothing gets edited;
- the instruction to search with Grep, Glob and Read, since a subagent may have no Bash;
- the report fields to return findings in.

Subagent output is a *lead*. Reconcile each one against the real `file:line` (in a fix flow, against `git diff` and `git status`) before relaying it. Seen in practice: an agent calls a bug already correct, claims to have skipped a file it edited, or reports a plausible finding it never verified. When two agents disagree, read the source and decide; do not pick the more confident summary.

Merge duplicates: the same fact wrong in several files is one finding listing every file. Note which agent covered which area so coverage can be audited.

## Fixes

Fix only on request, as its own task. Check every edit against the source of truth, not against what a subagent says it did. By default commit once per severity group. Changes to skills are proposals only, delivered as a PR for a person to review, since they alter the agent's own instructions.
