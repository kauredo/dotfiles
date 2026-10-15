# skills

Skills that teach a process the project has dropped. Every run of a stale skill steers the agent wrong, and a subagent holding only that skill has nothing to correct it. Test each claim against the sibling skills, the repo, ADRs and conventions. Do not edit any skill while auditing.

## Run the script first

```
node <audit-skill-dir>/scripts/check-skill-references.mjs <skills-dir>
```

It owns dead slash-command refs, bad subcommand refs and missing namespaced package scripts (`pnpm a:b`). Report its output as given and do not re-litigate those. It reads `package.json` from the working directory and skips script checks when there is none. This dimension covers the semantic drift no regex catches.

## Phase 1: map the surface

- Locate the skills directory (`skills/`, `.claude/skills/` or similar) and read each `<name>/SKILL.md`, its reference files, and any index or overview doc next to them.
- Find the orchestrator and its stages. It and the overview doc both retell what each stage does, so those retellings drift first. A flat collection has no orchestrator and so no spine; do not make one up.
- Note repeated boilerplate (shared stack or layout blocks). One repo change drifts every copy, so audit the copies together.
- Locate ground truth: repo agent instructions, contributing guide, ADR directory, the actual tree, the package manifest, each sibling SKILL.md.
- Summarize: skill count, spine, boilerplate sharers.

Skill dimension exclusions: vendored skills (a `VENDORED.md` marks them) are not audited.

## Checks

1. **Stage-behavior drift.** For each behavioral claim about a stage (progress file kept, artifact folder deleted, reports-only versus fixes, PR-only versus writes to the tracker, commits per phase), open that stage's own SKILL.md and confirm. A mismatch is High. Also compare the artifact filenames a stage writes with the ones the orchestrator names: a rename silently breaks the handoff.
2. **Architecture drift.** A layout or stack block that recurs gets checked once, against the actual tree and workspace globs, and the verdict applies to all copies. Compare each app's declared stack with its manifest. Paths or commands hardcoded for one host repo are a finding on their own: a portable skill gets them from repo instructions or discovery. A single layout change stales every copy, so write one finding per skill that names the shared root cause.
3. **Convention and ADR drift.** Compare guidance with ADRs, repo instructions and contributing conventions (i18n, enum casing, commit rules, label casing). A cited ADR must exist and still say that.
4. **Broken non-code refs.** Concrete repo-relative paths exist. Artifact filenames in the workflow are still used by the producing skill. A path with `<placeholder>` segments is a template: verify only its fixed prefix.
5. **Trigger overlap.** If two descriptions both match one phrase and neither defers, they collide. Add a short "for X use the other skill" to each description; deferring only in the body is weaker but acceptable. Any pointer such as "hands off to" or "complements" must name a skill that exists and does what is claimed. The script owns dead slash tokens.
6. **Missing boundary.** Only skills that act are checked: they edit files, run multi-step processes, make decisions or delete. Lookup and reference skills are exempt. Read the whole body, not only the description, for what the skill declines or passes to a sibling: reports-only, propose-only, red-flag lists. The fix adds a boundary; never recommend deleting a line.
7. **Sediment.** Run the no-op test: would the line change what the model does by default? "Be thorough" and "think carefully" would not, so report them as removable. A rule that appears twice gets a canonical home, and the copy is flagged. Err on keeping a line that looks generic but states a real, non-obvious project rule.

## Not a finding

- Illustrative snippets and e.g. fragments.
- A documented, deliberate simplification (a marked shortcut note).
- Accurate but narrower prose.
- Identical boilerplate repeated across skills for self-containment, unless it is wrong.
- Style preferences.

## Severity

Grade by what the agent loading the skill would get wrong.

- High (the agent runs the wrong process): a stage credited with behavior it has lost, such as the wrong handoff, artifact or gate; advice that conflicts with a live ADR or repo convention; a stack or architecture claim attached to the wrong package or app; a workflow-critical artifact that no longer exists; an instruction to consult an ADR that is missing.
- Medium: a wrong detail in shared boilerplate; a wrong but recoverable artifact filename or path; a pointer to a renamed skill; a citation of a superseded or renumbered ADR. Overlap and missing boundary run Low to Medium: Medium when the two overlapping skills differ in whether they write, or when the unbounded action is consequential and hard to reverse with no stop condition.
- Low: a no-op line; overlap with no real ambiguity; a cosmetic issue or typo.

Conventions and workflow-spine handoffs bias up. Report shape is in `references/method.md`, ending with the one-line bottom line.
