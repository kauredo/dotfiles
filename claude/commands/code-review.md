---
description: Multi-agent code review of local changes or a GitHub PR. Fans out to specialized reviewers in parallel and aggregates findings.
argument-hint: "[pr-number | --staged | --branch | --commit <sha>]"
---

You are orchestrating a multi-agent code review. Your job is to assemble the diff + project context, fan out specialized reviewers in parallel, then aggregate their findings into one report.

## Step 1 — Resolve the diff source

Argument: `$ARGUMENTS`

- **No argument** or `--branch` → review current branch vs. its merge-base with the default branch (try `origin/main`, `origin/master`, `origin/develop` in that order; pick the one that exists). Use `git merge-base HEAD <base>` to find the divergence point.
- **`--staged`** → review staged changes only (`git diff --cached`).
- **`--commit <sha>`** → review that single commit (`git show <sha>`).
- **A number** (e.g. `1234`) → review GitHub PR #1234. Use `gh pr diff 1234` for the diff and `gh pr view 1234 --json title,body,baseRefName,headRefName,files` for metadata. If `gh` isn't authenticated, stop and tell the user.

Capture:
- The unified diff (full, no truncation).
- The list of changed files.
- The base and head refs.
- For PRs: title, description, author.

**For PR sources, also fetch the existing PR conversation** so the review doesn't re-litigate things already discussed:

- `gh api repos/<OWNER>/<REPO>/pulls/<N>/comments` — inline review comments (with line anchors; `in_reply_to_id` for threading).
- `gh api repos/<OWNER>/<REPO>/issues/<N>/comments` — top-level PR comments.
- `gh api repos/<OWNER>/<REPO>/pulls/<N>/reviews` — review summaries (`state`: `APPROVED`, `CHANGES_REQUESTED`, `COMMENTED`, `DISMISSED`).

Capture these alongside the diff. They are the conversation the new review needs to fit into — findings already raised, explanations the author already gave, requests already addressed.

If the diff is empty, stop and tell the user there's nothing to review.

## Step 2 — Read project context

Read whichever of these exist, starting from the repo root:

- `CLAUDE.md`, `AGENTS.md` (and any nested ones in changed directories — they may contain stricter rules for that subtree).
- `README.md` (skim only — the CLAUDE/AGENTS files are authoritative).
- Manifest files to identify the stack: `Gemfile`, `package.json`, `go.mod`, `pyproject.toml`, `Cargo.toml`, `pom.xml`.

You don't need to relay this context to reviewers — they'll read the same files. But you do need it to triage which reviewers are relevant.

## Step 3 — Triage which reviewers to run

Inspect the changed file paths and decide which of these subagents to invoke. Default to running all six unless a reviewer is clearly irrelevant.

| Reviewer | Skip when |
|---|---|
| `security-reviewer` | Pure docs/comments/whitespace diff, or test-only changes with no auth/secrets surface |
| `correctness-reviewer` | Pure docs/formatting diff |
| `test-reviewer` | Pure docs/config diff with no production code change |
| `performance-reviewer` | Pure docs, config, or trivial constant changes |
| `architecture-reviewer` | Single-file localized change with no new module/abstraction |
| `style-reviewer` | Never skip — always relevant |

Briefly tell the user which reviewers you're running and why you skipped any.

## Step 4 — Fan out in parallel

Invoke each selected reviewer via the Agent tool **in a single message with multiple tool_use blocks** so they run concurrently. Each reviewer call must include:

1. The full diff (paste it verbatim).
2. The diff source description (e.g. "PR #1234: Fix tenant scoping in agent finder" or "Local branch `efx-1318` vs `origin/develop`").
3. The repo root path so the reviewer can read `CLAUDE.md`, `AGENTS.md`, and surrounding code.
4. **(PR sources only)** A condensed summary of the existing PR conversation from Step 1 — what's been raised, what the author has explained, what's been resolved. Tell the reviewer to skip findings that have already been raised, addressed, or explicitly rejected. Re-raising a settled point wastes the author's time and signals the review wasn't read carefully.
5. A reminder to follow the output format defined in the reviewer's own instructions.

Use `subagent_type` matching the reviewer name (e.g. `security-reviewer`, `correctness-reviewer`, etc.).

## Step 5 — Aggregate

When all reviewers return:

1. **Dedupe** — if two reviewers flagged the same `file:line` with overlapping reasoning, merge into one finding and note which reviewers raised it.
2. **Sort** findings by file path (alphabetical). Within each file, order by severity: CRITICAL → HIGH → MEDIUM → LOW.
3. **Render** the report in three parts: (a) header + triage table listing every finding on one row, (b) per-file sections where each finding is a paste-ready PR comment, (c) a `Reviewers run` footer.

**Cross-file findings.** When a reviewer flags one logical issue spanning multiple files (e.g. the same anti-pattern at `a.js:9` and `b.js:8`), do this:
- **Triage table:** one row for the finding. Its `File:Line` cell lists every location, separated by ` + ` (e.g. `` `a.js:9` + `b.js:8` ``). Counted as one finding in the summary line.
- **Per-file sections:** duplicate the finding once under each affected file's H2. The duplicated body opens with a one-line cross-reference (`*Same pattern at `b.js:8`.*`) and then carries the same explanation and `Suggested fix`. This keeps the file-by-file commenting flow paste-ready — each PR file shows its own block — at the cost of inflating the per-file section count above the table row count.
- **Summary line:** add a `K paste locations` clause whenever K > N findings, e.g. `15 findings · 17 paste locations · 4 high · …`. If K equals N, omit the clause.

Output shape:

```
# Code Review — <diff source>

<one-sentence summary: N findings · K paste locations · X critical · Y high · Z medium · W low>
(omit the "K paste locations" clause when K equals N)

| Sev  | File:Line                         | Title                                      |
|------|-----------------------------------|--------------------------------------------|
| HIGH | `path/to/i18n.js:63`              | ERROR_KEYS shadowed by locale keys         |
| HIGH | `path/to/i18n.js`                 | reinvents existing i18n npm package        |
| MED  | `path/to/app.js:48`               | translating logger.error breaks log search |
| MED  | `path/to/i18n.js:13`              | silent locale-load failure                 |
| LOW  | `a.js:9` + `b.js:8`               | two-step import instead of destructuring   |
| LOW  | `path/to/Dockerfile:26`           | no integrity guard on locales/             |

---

## `path/to/i18n.js`

### HIGH · L63-66 · [architecture]
**ERROR_KEYS shadowed by duplicate locale keys**

These constants are compared via `error.message ===`, so they must remain stable English. The locale files define the same English values under `errors.crm_adaptor.command.too_early` — a future dev will reach for `t()` and silently break the retry contract in non-English locales.

**Suggested fix:** Move `ERROR_KEYS` into `errors.js`. Remove `too_early` and `admin_token_error` from both locale files.

---

### MED · L13-20 · [correctness, security]
**Silent locale-load failure masks startup integrity check**

`loadLocale` catches every error and returns `{}`. If `en.json` is missing, `t()` returns raw key strings across all callers. The `console.warn` also includes `e.message`, which leaks the absolute filesystem path on ENOENT.

**Suggested fix:** For a missing `en`, log via `console.error` or throw at startup. Log `e.code` (e.g. `ENOENT`) instead of `e.message`.

---

## `path/to/app.js`

### MED · L48 · [architecture]
**Translating log/throw paths with no locale plumbing**

Every `t()` call omits the locale argument, so everything resolves to `en` — the fr-CA file is unreachable. Translating `logger.error(...)` lines also breaks Grafana/Loki search and locale-dependent alerting.

**Suggested fix:** Revert `logger.error(i18n.t(...))` to a plain string. Limit `t()` to genuinely user-facing surfaces.

---

## `path/to/a.js`

### LOW · L9 · [style]
**Two-step import instead of destructuring**

*Same pattern at `b.js:8`.*

`const i18n = require(...)` followed by `const ERROR_KEYS = i18n.ERROR_KEYS` is idiom-out-of-place; the `i18n` binding is then only used as a namespace for `ERROR_KEYS`.

**Suggested fix:** Use `const { t, ERROR_KEYS } = require('./common/i18n')`.

---

## `path/to/b.js`

### LOW · L8 · [style]
**Two-step import instead of destructuring**

*Same pattern at `a.js:9`.*

`const i18n = require(...)` followed by `const ERROR_KEYS = i18n.ERROR_KEYS` is idiom-out-of-place; the `i18n` binding is then only used as a namespace for `ERROR_KEYS`.

**Suggested fix:** Use `const { t, ERROR_KEYS } = require('./common/i18n')`.

---

## Reviewers run
- security-reviewer ✓
- correctness-reviewer ✓
- test-reviewer ✓
- performance-reviewer ✓
- architecture-reviewer ✓
- style-reviewer ✓
- <skipped: reason>
```

Formatting rules:
- **Triage table** is a flat list — one row per finding, sorted by severity (CRIT → HIGH → MED → LOW) then file path. Title is one short phrase, no markdown inside cells. Use the severity short names `CRIT`, `HIGH`, `MED`, `LOW`.
- **Per-file H2** uses the full file path in backticks. Sort H2 sections alphabetically by path.
- **Each finding inside a file** is structured as:
  - H3 line: `### <SEV> · <line-spec> · [reviewers]` where `<line-spec>` is `L42`, `L42-58`, or `file` for whole-file findings.
  - Bold title on its own line.
  - 1–3 sentence explanation as a single paragraph (no bullets, no nested headers — it must read as a self-contained comment when copy-pasted into GitHub).
  - `**Suggested fix:** <concrete change>` on its own line.
  - `---` separator between findings within a file.
- **Reviewers inline** use the short name (`security`, `correctness`, `test`, `performance`, `architecture`, `style`) — drop the `-reviewer` suffix. Sort alphabetically; comma-separated inside the brackets.
- **Copy-paste contract:** a reader should be able to select from the bold title line through the `**Suggested fix:**` line and paste it directly as a GitHub PR review comment with no editing needed. Do not reference reviewers, severity, or line numbers in the body prose — they belong in the H3 header.
- **Spacing — strictly enforced:** exactly one blank line between every block in the output. That means: between the summary line and the table; between the table and the first `---`; between `---` and the next H2; between H2 and the first H3; between H3 and the bold title; between the bold title and the paragraph; between the paragraph and the `**Suggested fix:**` line; between the fix line and the trailing `---`; between findings; between the last finding of a file and the next H2. No double blank lines anywhere. No missing blank lines anywhere.
- Use backticks around code identifiers and file paths.

If a reviewer returned no findings, omit them from the per-file sections; the `Reviewers run` footer already shows they ran.

If **no reviewer** found anything, say so plainly: "No issues found across N reviewers." — skip the table and per-file sections entirely.

## Step 6 — Offer the next action

After delivering the report, ask the user what to do next via `AskUserQuestion`. The follow-up depends on the diff source:

- **PR source (numeric argument)** — offer to draft a pending review for posting. If accepted, follow the "From /code-review to a posted pending review" workflow in `~/.claude/github-pending-review.md` (triage → verify → draft → show drafts → wait for approval → `gh api`).
- **Non-PR source (`--staged`, `--commit`, `--branch`, no argument)** — offer to fix the substantive findings locally. If accepted, apply the same triage rules from `~/.claude/github-pending-review.md` to filter nitpicks first, then implement fixes for what's left.

Frame the `AskUserQuestion` for the active source:

- For PRs: "Draft and post as a pending review on the PR" / "Skip — leave the report"
- For non-PR: "Fix the substantive findings locally" / "Skip — leave the report"

Don't act without explicit approval. The user may want the report on its own to decide for themselves.

## Important

- Don't editorialize or add findings of your own — your job is to orchestrate, not review.
- Don't fix anything. Reviewers suggest; the user decides.
- If a reviewer fails or returns garbage, note it in the "Reviewers run" section but proceed with the rest.
- Keep the report tight — no preamble, no "I'll now…" narration in the final output.
