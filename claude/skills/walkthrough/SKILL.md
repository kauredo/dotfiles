---
name: walkthrough
description: "Walkthrough: one self-contained HTML guide that explains a PR, branch, diff or patch in the order the code runs. Use for \"walk me through this PR\" or \"help me read this change\". Bug hunts go to /code-review; recaps built around diagrams or a file map go to visual-recap."
---

# Walkthrough

Write one HTML file that lets a reader understand a change fast, in execution order. The goal is comprehension. You explain; you do not give a verdict, and you flag only what you trip over while explaining. You never edit code, post comments or approve anything.

## Input

Take the first that applies:

- **PR number or URL**: fetch metadata and diff with `gh` (or the GitHub MCP). A bare number means the repo of the current remote. No checkout needed; save the diff to a patch file.
- **Patch file path**: use it as given.
- **Nothing named**: the current branch against its merge-base with the default branch, plus uncommitted and untracked files.

Find the default branch (`git symbolic-ref refs/remotes/origin/HEAD`), and `git fetch` it first so the base is fresh. Scope to the task's own work. Unrelated dirty edits stay out; where ownership is unclear, write the assumption on the page.

Pick the source:

- **Live git** if the branch is checked out. You get whole-file context around each hunk.
- **Saved patch** when the branch is not checked out or the page must stay reproducible. Generate it with `git -c core.quotepath=off diff`, against one parent (a combined merge diff is out). You see only changed lines, so syntax near hunk edges may be a guess. Say so on the page.

Record which source and which commit or range the page reflects.

Done when the source, the range and any scoping assumption are written down.

## 1. Triage

Before reading any diff body, build a manifest with one line per file: path, status, adds/dels, a few hunk-header contexts (function and class names), a generated or binary tag.

Give each file a starting bucket by path, first match wins: docs, tests, config, deps, generated, else code. Binaries are other. Where the repo has `.gitattributes` markings (`review-*`, `linguist-*`), they override the path guess; with none, keep the path guess. Add the repo's own codegen, snapshot, minified and vendored output to the generated list, taken from its instructions.

Defaults:

- generated and lockfiles: **not covered**, diff never read
- deps and config: collapsed supporting
- tests: attached to the feature they cover
- docs: supporting, or the why when the doc is the decision record

When the change's intent is about a bucket (a dependency bump, a schema regen, a docs-only PR), promote it and say so on the page.

Done when every path has a bucket and you know which diffs get read in full.

## 2. Gather diff and intent

Read the hunks the manifest pointed to. Note the base branch; a change stacked on a non-default base depends on its parent, so say that up front.

Intent comes from the PR body, commit messages (group by final change, since fixups mix concerns), a linked ticket, decision records in the diff, and plan files on the branch. Facts outside those sources are left out or marked "inferred".

Done when you can write one sentence for what the change does and why.

## 3. Trace the flow

Find the entry points (route, handler, exported function, UI surface) and follow the call chain through the changed hunks. Order by execution, never by filename. The usual shape is entry, then resolution or service, then data read or written, then the returned shape.

Independent intents with no shared call chain become separate feature groups, each with its own steps and tests. Group by intent, not directory, and stay at 2 to 5 groups. One flow stays a flat list.

If you cannot trace the change, say so and stop. A file listing posing as an explanation is worse than no guide. A hunk you cannot explain is a gap to investigate or flag for its owner; never paraphrase it.

Done when each flow has 3 to 6 ordered core steps, and each must be an actual link in the call chain.

## 4. Classify

Put every changed file in exactly one bucket:

- **Core path**, in execution order
- **Off the request path**: added but unused by the traced flow (for a future consumer, say)
- **Supporting**: wiring, registration, config, i18n; collapsed
- **Tests**: an assertion checklist of what each pins down
- **Not covered**: skipped on purpose, listed by path
- **The why**: the decision record or open question; it ends the guide

Done when you have checked by hand, against the file list, that no changed file is missing, no listed file is untouched by the diff, none is both explained and skipped, and none sits in two buckets.

## 5. Explain and flag

Each core step gets a plain-language why-it-exists beside its code excerpt.

Flags sit at the step where the issue lives, at three levels:

- **info**: context a reviewer needs, such as a stacked dependency
- **warn**: worth confirming, such as description-versus-code drift or a scope boundary
- **risk**: a likely defect, or a "check this first" blocker

Open the actual file for every flag. A suspicion that clears on inspection gets dropped without mention, because a false flag costs more than a missing one.

A **review-first** marker goes on at most one step, and only when execution order buries the load-bearing step (behind entry wiring, a stacked base or heavy mechanical churn). Give a one-sentence reason and leave the order alone. Use it rarely.

For UI changes, narrate what the user now sees: entry surface, interaction, resulting state, role or permission variants, empty and error states. Inventory the surfaces from the diff; each is covered or deliberately skipped. A base64 screenshot is welcome when the app is cheap to launch.

Done when each step carries a why and you have verified the line behind every flag.

## 6. Write the HTML

Sections, in order:

1. **Hero**: one-line title, a one-paragraph summary, meta chips (author, ticket, stacked base, file count, +adds/-dels, review-first if used), and the source, range and scoping assumption.
2. **Flags summary** (optional): every flag, ordered by severity with the worst first, each linking back to its step.
3. **Flow map**: numbered links to each core step in execution order. Number steps once across the page; in multi-feature guides, label where each feature starts. A small hand-written inline SVG of the flow is welcome where it beats the chips; it must carry weight.
4. **Core path**: per step a heading, the why, inline flags, and curated excerpts with file path and line range above each.
5. **Off the request path**, **Supporting** (collapsed), **Tests**, **Not covered here**, **The why**.

Excerpt rules:

- Show the load-bearing hunks, roughly under 150 lines per file. For a longer file, show a representative slice and state what you skipped.
- Copy exactly from git or the patch, and re-read after writing. Mark added and removed lines. Escape HTML.
- Scan every excerpt for tokens, keys, PEM blocks and credentials, and trim those ranges out. The file will be shared.

File requirements:

- One `.html`: `<!doctype html>`, charset and viewport meta, inline `<style>`, an optional tiny inline `<script>`. No build step, no CDN, no external requests; system font stack, works offline.
- Light and dark through `prefers-color-scheme`, neutral palette, one accent reserved for review-first, warn and risk.
- Phone-width responsive. Code blocks scroll horizontally inside themselves; the page does not.
- Semantic headings and landmarks, readable contrast, severity shown by text label as well as color, collapsible sections with `<details>`.
- Top or sticky nav with anchor links to the steps. Monospace code, with added and removed lines visibly distinct.
- Write to a temp directory, never inside the repo, named with the PR number or branch.

Fix unclear content by rewriting it. Raw diff dumps are out.

Done when the file exists and a read-through finds every excerpt matching the source. Print the path as a clickable `file://` link and open it with the OS opener (`open` on macOS, `xdg-open` on Linux). In a remote session where that link would point at the wrong machine, hand over the file itself.

## Handoffs

A user who wants bugs found or a verdict goes to `/code-review`. For a diagram, file map or API summary, use `visual-recap`.
