---
name: standup
description: "Short ranked brief of what needs you on the repo today: your PRs, bot PRs, shipped work, ticket movement. Read-only. Args: a window like 3d or 1w, or queue."
disable-model-invocation: true
---

# Standup

A ranked brief of what needs me today. Signal over completeness. Strictly read-only: no comments, pushes, labels, merges or edits.

The queue here is solo: my own open PRs, PRs from bots and dependency updaters awaiting a decision, and reviews requested from automated reviewers.

## Window

- No argument: since the last working day, about 24h. On Monday, back to Friday morning.
- `3d`, `1w`: that window.
- `queue`: run steps 1, 2 and 5 for the PR queue only.

## Steps

1. Resolve my GitHub login, the repo from the origin remote (read it, never guess), and the since-timestamp. Use `gh`, or GitHub MCP tools when present.

   Done when login, repo and since are stated.

2. Gather with cheap searches first. Fetch detail only for likely top-ranked items.
   - My queue: open PRs where review is requested of me, I am assigned, or I started reviewing.
   - My own open PRs.
   - Repo-wide attention: every open PR that is not a draft and has had activity after the window began. Flag the ones near a staleness cutoff the repo defines (read its config and docs), carrying a specially treated label, or newly opened.
   - Detail for top candidates only: CI state, reviews (approved, changes requested), mergeable or conflicted. The session is never told about these transitions, so reading is the only way to see them.
   - Optional fan-out: hand each candidate PR to its own cheap subagent, which reports number, title, author, ci, reviews, mergeable, age. Synthesis stays with me.

   Done when each candidate PR has a compact state record. A source that is unavailable gets a one-line note and the brief continues.

3. Shipped: run `retro` with the matching window (24h default) and fold its shipped section in as one short section. Do not rebuild it here.

   Done when the section is filled or noted unavailable.

4. Tickets: only when an issue tracker is reachable (repo docs may name it). List the issues that moved during the window: into review, blocked, or done. With no tracker, omit the section entirely. This is movement only, with no burn estimates or plan status.

5. Rank and present. Lead with the single most important item.

   - **Needs you now**: ready review requests (green CI, no unresolved change requests); PRs blocked on my decision; my own PRs that are red or conflicted.
   - **On your radar**: review requests not ready (CI running or red, draft, unresolved threads); PRs nearing staleness; threads mentioning me. When the repo has other reviewers, PRs that already have two or more approvals go here too.
   - **Shipped since window**, **Repo pulse** (open count, drafts, red CI, notable new PRs, specially labelled PRs), **Tickets** if any, then **Suggested focus**.

   Each item gives the PR number, author, one-line reason it needs me, and a suggested action. Name the concrete blocker ("#212 red on the lint job"), never "some PRs have failing CI". Rank hard: if everything is top priority, nothing is.

   Done when every section is capped with a "+N more" count and the brief ends on a one-sentence suggested focus.

## Handoffs

- Code judgment on a PR: `/code-review`.
- Red CI diagnosis: diagnosing-bugs.
- Backlog ideas: `improve`.
- Roadmap and delivery health are out of scope.
