---
name: retro
description: "Retro: engineering retrospective from git history, with per-person praise, growth areas and trend deltas. Use for \"retro\", \"sprint review\", \"what did we ship\", recent output, contributor activity or velocity over a period, or a shipped summary requested by standup."
---

# Retro

Turn commit history into a report. Read-only on source: no commits, no pushes. The only file written is the snapshot in step 6.

## Window

| Argument | Window |
|---|---|
| none | 7 days |
| `24h`, `14d`, `30d` | that window |
| `compare` | current 7d against the 7d before it |
| `compare <window>` | same, with that length |

A load-time snapshot (shortlog plus commit-type counts) covers the 7d default only. Any other window reruns live and ignores it.

1. State the window length and whether compare is on.

## Gather

2. Fetch the remote quietly first, then run these in parallel. Pipe every log through an aggregating filter (`sort`, `uniq`, `head`, `awk`) so no raw log reaches the context.
   - Default branch from the remote HEAD, falling back to `main`. User name from git config.
   - One **noise filter** (lockfiles, generated files, build output, dependency dirs) applied to every LOC count and to hotspots.
   - Per window: commits per author; insertions and deletions per author; subject lines with author and time; commit timestamps; top 20 hotspot files; file areas per author; PR and issue refs in subjects; conventional-commit type counts; distinct test files touched; active days per author; unique commit dates over the last 90 days; co-author trailers.
   - **Streak**: computed in analysis, not shell. Consecutive calendar days with a commit from any contributor, counted back from the latest date, 90-day lookback.
   - A source that returns nothing is skipped; its section is skipped with it.

   Done when every metric holds data or is marked absent.

3. With `gh` installed and authenticated, pull merged PRs in the window (number, title, author, merge time, reviews, additions, deletions). Use them for themes (PR titles beat commit subjects), time to first review, who reviews whom, and PR size spread. Without `gh`, skip silently.

   Done when enrichment is present or noted unavailable. The report works either way.

4. Load the newest JSON in `.context/retros/` (create the directory if missing). None means first run: say trends start next time. Then give the verdict:
   - Different window size: absolute numbers are not comparable. Warn.
   - Gap over 2x the window: trends may not be continuous. Warn.
   - Same window, adjacent: show deltas.

   When not comparable, show old figures labelled as reference, with no percentage deltas.

   Done when the comparison verdict is stated.

## Report

5. Write the report to the conversation, in markdown. Length follows the data: about 400-600 words for a thin solo week, 1500-2500 for a busy team period. Everything comes from collected data; empty output means the section is skipped.

   One contributor in the window: read [`references/solo.md`](references/solo.md) and use its sections. Otherwise use these, in order:

   1. **Tweetable summary**: one line with period, commits, LOC, contributors, streak.
   2. **Overview** table (period, commits, LOC, contributors, active days, PRs referenced, streak), with a delta column when step 4 allows. Name the excluded noise when it moved the numbers materially.
   3. **What we shipped**: 3-7 themes, each with a title, a 1-2 sentence summary, key contributors, rough LOC. Themes come from PR titles when available. Without conventional commits, infer them from message content and skip the type breakdown.
   4. **Contributions per person**, sorted by commits: key work, commit mix, areas touched, praise, one growth area. One or two commits earn a short section. The running user is "you".
   5. **Collaboration**: co-authoring, review balance and bottlenecks, cross-area work, single-owner areas. Skipped without signal.
   6. **Work patterns**: peak hours, busiest days, clustered against scattered commits. Weekend and late work get noted, not preached about.
   7. **Code quality signals**: churn hotspots, test-change ratio, commit-type balance, with trends when prior data exists.
   8. **Looking ahead**: 2-3 items grounded in the data (keep investing, watch an area, pace sustainability).

   Voice: a sharp, supportive tech lead. Encouraging and candid, specific, anchored in real commits, a little humor. Praise names the commit that earned it. Growth is investment advice with a concrete next step. People are never compared against each other.

   Done when every section is present or deliberately skipped.

6. Write `.context/retros/retro-YYYY-MM-DD.json`:

   ```
   date, window_days, period {start, end},
   summary {total_commits, total_insertions, total_deletions, contributors,
            active_days, prs_referenced, shipping_streak},
   contributors {name: {commits, insertions, deletions}},
   commit_types, test_files_changed, top_hotspots,
   collaboration {co_authored_commits, unique_pairs}
   ```

   Done when the file exists with these fields.

7. Compare mode: gather the same data for the prior window and show a table (`metric | previous | current | delta`), then a short narrative on the biggest gains and regressions. Save only the current window's snapshot.

   Done when the table and narrative are shown.

## Handoffs

- Called by `standup` with a window: return only the shipped section, compact, grouped by area, one line per merged change.
- A hotspot with repeated hotfixes: point to `improve`. A bug-prone area: point to `/code-review` or diagnosing-bugs. Retro reports and does not fix.
- Individual diffs belong to `/code-review`.
