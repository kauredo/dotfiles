---
name: dependabot-review
description: Turn open Dependabot alerts and PRs into a verdict per bump, then one dependency-only PR (JS/TS repos).
disable-model-invocation: true
---

# Dependabot review

Goal: each open Dependabot alert or PR gets a verdict, and the approved fixes ship as a single PR that touches dependencies only.

Every verdict cites a command and what it printed. A small-looking version jump proves nothing, so run something.

Expect the reviewer to ask: who reported this upstream, which of our code touches it, how old is the advisory, and does the code that actually runs carry the fix? Have those answers ready.

You gather facts on your own. Decisions belong to the user.

Scope is npm, pnpm and yarn repos in JavaScript or TypeScript. Alerts for pip, Bundler, Go or Docker get listed as out of scope and otherwise ignored.

Related skills: `read-the-source` (a dependency's actual code), `read-the-damn-docs` (current changelog or API docs), `/code-review` (the finished PR), `infra-review` (workflow issues found in the posture sweep).

## Ground rules

- Until the approval gate, the repo is read-only. Phases 1 to 5 write nothing.
- Probes never reach a live external service, in any phase. Point them at local or stubbed targets, and unset any real credentials.
- The PR carries manifests, lockfiles, overrides and patches. If the app code needs a change, put it in the report as a proposal or a separate task.
- Closing a Dependabot PR or dismissing an alert each need a yes that names the exact PR or alert.

## Preflight

Stop with a plain message if any of these fails:

1. `package.json` exists beside an npm, pnpm or yarn lockfile.
2. `gh auth status` passes. Calling `gh api repos/<owner>/<repo>/dependabot/alerts` must give back data. Dismissing alerts later needs write access.
3. The user has okayed the cost. Say how many subagents you plan to launch and that each can burn 100k+ tokens. Skip the question only when the user's instruction files or a message in this session already waive it.

## Repo facts

Get install, lint, typecheck, test, build, dev and pre-push commands from the agent instruction files, along with the default branch, commit style and PR template. If they are silent, infer from package scripts, the lockfile, CI config and git hooks. State where each answer came from.

When a command can't be determined, record a gap, skip that check, and put the gap in the report. Never run a guess, and never report its output.

Per-manager commands live in [`references/package-managers.md`](references/package-managers.md).

## Phase 1: Census

- Get `<owner>/<repo>` out of `git remote get-url origin`.
- Page through the alerts and keep the open ones.
- Count alerts per severity. Then build a table with a row per package: direct or transitive, runtime or dev, vulnerable range, first fixed version.
- Identify the package manager from its lockfile and run its audit. Anything the audit reports that Dependabot missed joins the scope.

Output: totals, the severity counts, the table, and whatever only the audit found.

## Phase 2: PR inventory

Collect open PRs authored by `app/dependabot`. For each, note the bump, CI status and which alerts it resolves. Count a grouped PR once. If a version-update PR resolves no alert, tag it "not security" and return it to the normal flow.

CI on Dependabot PRs has no access to regular secrets, so red runs caused by empty tokens are noise.

Then work out coverage:

- An alert is covered if an open PR fixes it, uncovered otherwise (typically transitive and held back by its parent).
- For uncovered ones, ask the package manager `why` to find the parent. See whether a newer parent release already fixes things before you consider an override.
- Look for coupled bumps: a framework with its plugins, peer ranges, several PRs on one package. Coupled bumps get verified and shipped together.
- Hunt for overrides or resolutions that force a vulnerable version, in every place they can live, workspace files included. A leftover override makes a merged bump do nothing.
- Skim any other open PR touching dependencies. What it adds counts toward reachability.
- In a monorepo, run audit and `why` in every workspace and record which workspaces each alert hits.

Output: each open alert has exactly one route: an open PR, refreshing the lockfile, bumping its parent, an override, or "no fix exists".

## Phase 3: Test surface

List whatever could demonstrate a bump is safe:

- Test projects (unit, browser, Storybook) and any Playwright, Cypress or e2e folders.
- What CI runs on PRs. Often just lint.
- Requirements for building or booting the server: the runtime version (`.nvmrc` or `engines`), a local database, and the variables listed in `.env.example`.
- Local `.env` entries aimed at dead services, such as a deleted bucket or a retired API host, which cause failures unrelated to the bump.

Output: the runnable checks, and the holes a generated suite must fill.

## Phase 4: Verification subagents

Divide the work into units: one open PR (grouped PRs stay whole), one coupled set, or the batch of uncovered transitive fixes. Merge small low-risk units so the total stays below 10.

Start one subagent per unit in parallel, each in a separate git worktree. Its brief contains:

- the unit's packages, current and target versions, and alert numbers
- the test surface, plus runtime, env, database and dead-service notes
- affected workspaces, and the other dependency PRs still open
- the base branch name, for baseline runs
- the full text of [`references/verification-brief.md`](references/verification-brief.md)
- the shell rule: plain programs with plain arguments, never `bash -c`

Subagents use `read-the-source` when they need a dependency's real code.

Once a unit's report and diff are in, delete its worktree and branch, which are scratch.

Output: every unit has an evidence-backed verdict, with changelogs read and required research done. Anything short of that goes back to its subagent.

## Phase 5: Report and gate

Write a single report that opens with the table. No prose precedes it. Layout, verdict labels, decision cards and style are in [`references/user-summary-format.md`](references/user-summary-format.md). Sections, in order:

1. Headline: open alerts today, and the count expected once the plan lands.
2. Verdict table, a row per package or group.
3. No fix available.
4. Coverage gaps.
5. Decisions, a card for each open choice.

Keep technical evidence out of the report. It goes into the PR body, and you show it if asked. Research before you recommend. If one question from the user could flip your pick, the research was incomplete.

### Approval gate

Stop after the report. Do not branch, edit, install, commit, push, open or close a PR, or dismiss an alert.

Ask the user to approve, amend or drop parts of the plan, then wait. They may know things you don't.

- Move to the fix only on an explicit yes, and only for the approved pieces. Dropped items stay untouched. Amended items follow the amendment.
- Approving the plan covers the fix and the PR and nothing more. Closing a Dependabot PR and dismissing an alert each require a separate yes for that specific PR or alert, asked at the moment you offer it.
- If the reply is silent, vague or partial, ask again. Approval is never inferred.

Output: the user has said, in words, what happens to each piece.

## Phase 6: Fix (approved parts only)

Work in this order of preference, and stop at the first method that clears an alert:

1. Create a branch off the current default branch.
2. Raise direct dependencies to the newest fixed release their peer ranges allow.
3. For transitive alerts where the parent's range already admits the fix, refresh the lockfile.
4. Where a refresh can't reach, upgrade the parent.
5. Only as a last resort, add a scoped override that stays inside the current major. Syntax shifts between majors, so check the installed package-manager version first. Monorepo overrides go at the workspace root. Use `why` to confirm every copy picked it up.

A major jump is acceptable when the reachability and breaking-change review show nothing used changes. A clean major beats an override that will rot.

Then verify:

- Install and re-run the audit, looping until only approved leftovers remain.
- Run every check from Phase 3 plus the generated suite in each affected workspace, with the same scrubbed env. Diff failures against the baseline, repair what the branch broke, and report what was already red.
- Confirm the code that really runs (built bundle, bundled or CDN copies) carries the fixed version.
- If a fix causes damage, for example an override that alters module exports, undo that fix alone and list the alert under "No fix available".

Output: only approved leftovers in the audit, checks green or equal to baseline, fixed versions in the running code.

## Phase 7: Pull request

- Commit using the repo's convention, push, and open one PR to the default branch. You write the body, following the repo's template when there is one. Keep it terse and report-like: counts before and after, what changed in a small table, why each leftover remains, the PRs this replaces, and a test plan with some boxes ticked and some not.
- Name the Dependabot PRs this one supersedes. Dependabot closes those itself after merge, and closing one by hand makes it ignore that version. Offer to close only those still open after Dependabot's next run, and only act on a yes.
- For each leftover alert the user approved, offer a dismissal and draft its reason. Every alert needs its own yes.
- Offer useful generated checks as a separate optional task with a paste-ready prompt. The PR stays dependency-only.
- Prove every flow headless first. If a human check is still needed, repair or work around local env problems (or list them in the steps), start the dev server yourself, and write numbered click steps each ending in a pass condition.

Output: PR open, and every close and dismiss offer made.

## Phase 8: Close-out

Send one message in report style:

1. Result: alert count before and after, plus the PR link.
2. Pending decisions: everything still owed, including reminders the user requested mid-run.
3. Unfixable: each leftover, why, and when to look again.
4. Human checks still open.
5. Posture sweep: whether secret scanning and code scanning are on (the repo's `security_and_analysis` field); whether `dependabot.yml` covers the `github-actions` ecosystem; actions pinned to a tag instead of a commit SHA; dependencies a major behind with no advisory.
6. Repo note: if the docs never mention checking advisories during dependency updates, offer a short note, and write it only after a yes.

## Reject or repair

- SAFE issued with the changelog unread.
- A green audit although a bundled or CDN copy keeps running old code. Label it "Fixed on paper", never Safe.
- A recommendation that one user question would reverse.
- A local failure pinned on the bump without a baseline run.
- An override that crosses a major with no reachability check.
- An override where a lockfile refresh would have worked.

## Out of bounds for findings

- Non-security version-update PRs (labeled "not security").
- CI failures from Dependabot's empty tokens.
- Failures that also occur on the base branch.
- Alerts from non-JS ecosystems.
- App code changes a bump demands. Those are proposals only.
