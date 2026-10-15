# todos

Markers nobody will act on, and markers somebody should have acted on already.

## Discover

- Comment syntaxes in use: `//`, `#`, `<!-- -->`, `/* */`, `--`, docstrings, Ruby block comments, Rust doc comments.
- Issue tracker and key format: see whether CLAUDE.md or AGENTS.md names them. If not, infer from the references already in markers and from project config (`.github/`, Linear config, Jira URLs).
- Ownership convention: `TODO(author)` usage, CODEOWNERS, `git log` contributors.
- Project-specific markers (SAFETY, WARNING, PERF, COMPAT): sample for them.

Summarize.

## Markers and default priority

| Marker | Default |
|---|---|
| BUG | critical |
| FIXME, HACK, XXX | high |
| TODO, OPTIMIZE, REVIEW, DEPRECATED | medium |
| REFACTOR | low |
| NOTE | info; excluded from the default search as documentation noise, unless the user asks |

## Categories

Run 1 to 3 in parallel at scale. Category 4 runs after them, in the orchestrator, because it consumes the category 1 inventory.

1. **Marker inventory and age**
   - Find every marker and extract author, issue ref and date (`TODO(user)`, `TODO PROJ-1`, `TODO #1`, `TODO (2024-01-15)`).
   - Age comes from `git blame` per line, or the file's last commit date. Without git, skip age; the audit stays valid. Commit messages mentioning TODO or FIXME are an optional extra source.
   - Age bands and score boost: 0 to 30 days fresh (0), 31 to 90 recent (0.5), 91 to 180 aging (1), 180 to 365 old (1.5), over 365 stale (2).
   - Inventory record: `file:line`, type, full text, author, age in days, issue ref, band. Sort oldest first.
2. **Security and bug markers**
   - A marker mentioning any of these is critical: password, credential, token, secret, auth, session, OAuth, JWT, encrypt, hash, TLS, injection, XSS, CSRF, CORS, sanitize, permission, vulnerability, rate limit, hardcoded key.
   - Bug keywords make it critical or high: bug, crash, exception, race, deadlock, corrupt, leak, overflow, infinite loop, null, broken, fails, wrong, data loss, regression, flaky.
   - Context decides some words. `validate` is security only beside sanitization or injection; `escape` only for HTML or injection; bare `error` is too broad to count.
   - Weight by location. Higher: auth, payments, persistence, external API endpoints, shared libraries, core middleware. Lower: tests, docs, storybook, dev tooling, examples. Skip generated and vendored code.
3. **Issue tracker integration**
   - Reference forms: `KEY-123` (Linear, Jira, YouTrack), `#123` and `GH-123` (GitHub, GitLab), `sc-123`/`ch-123` (Shortcut), `AB#123` (Azure DevOps), tracker URLs.
   - Guard against `#123` false positives: count it only inside code comments, only beside a marker, never in md, css, sh or yaml, and only in a plausible number range.
   - With tracker tools available, check status. A referenced issue that is Done, Cancelled or Closed makes the marker critical and stale.
   - Without them, list the IDs for the user to check, and still flag references older than about a year as likely stale.
   - Orphaned: an ID that does not exist (typo), a long-completed issue, an issue moved between teams.
4. **Quality and context** (after 1 to 3)
   - Score 0 to 100: explanation of more than 5 words +40; an explicit owner in the marker text itself +20 (the blame author does not count); an issue ref +20; a concrete action verb +10; not vague +10. Under 50 is flagged, under 30 is a deletion candidate.
   - Low quality: under 3 words after the marker (high); vague actions (fix this, clean up, improve, handle this, look into, maybe, later, soon, eventually); a bare refactor or optimize with no specifics.
   - A missing owner is a finding only when the project already uses an owner convention.
   - Dead-code markers: inside commented-out code, in never-called functions, behind always-false conditions, in orphaned files (practical test: is the file imported anywhere).
   - Duplicates: the same TODO text in several files is one untracked task.

## Priority signals

| Signal | Effect |
|---|---|
| Security keyword | critical |
| Bug keyword | critical or high |
| References a closed issue | critical |
| Over 365 days old | +2 |
| In auth or security code | +3 |
| In a shared library | +2 |
| Score under 30 | deletion candidate |
| In tests or docs | -1 |

## Tiers

Map once, everywhere: Critical is P1 (Resolve Now), High is P2 (Plan Soon), Medium is P3 (Backlog), Low and deletion candidates are P4 (Consider Deleting).

## Report extras

- `Overview`: total markers, average age, oldest with its location, counts by type, share of high versus low quality.
- `Issue Tracker`: referenced count, stale or closed count, orphaned count.
- Tier tables with columns `Location | Type | Age | Description | Action`.
- `Statistics`: a debt index from 0 to 100 (lower is better) and a breakdown by top-level module.

## Fix options

Extras, each only on request:

- create tracker issues from the top markers (only if a tracker tool is available);
- delete stale markers (closed-issue refs, or older than about 2 years), with confirmation;
- add context to low-quality markers;
- export the report as markdown.

Auto-fixable: remove markers citing closed issues, remove markers in dead code, add an issue ref where an open issue clearly matches.
Human decision: resolve, update or delete a stale marker; whether a low-quality one is real work; priority for new issues.
