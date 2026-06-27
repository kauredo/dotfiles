---
description: End-to-end feature pipeline — plan (improve) → implement → code-review → apply → polish → PR with screenshots. Gated by default; flags skip the gates.
argument-hint: "<task description> [--full-approve] [--fix-all] [--no-pr] [--ui|--no-ui] [--local] [--base <branch>]"
---

You are driving a task from idea to opened PR. Run the pipeline below in order. By default you **stop at three gates** (plan, review-fix selection, PR) and wait for the user; flags below open those gates automatically. Keep your own narration minimal — the user wants the work done and the artifacts, not a play-by-play.

> **Voice — applies to the PR body and any GitHub text.** Write like a developer talking to a teammate: plain, short sentences, no significance-inflation words ("crucial", "robust", "comprehensive"), no rule-of-three padding, no tidy summary closers, no em-dash drama. Follow `~/.claude/writing-style.md`. If a draft sounds like AI, rewrite it.

## Step 0 — Parse args and set the mode

`$ARGUMENTS` holds the task description plus any flags. Strip the flags; what remains is the task.

Flags (default behavior is **gated**):
- `--full-approve` / `-y` — skip ALL gates. Approve the plan, apply all substantive review fixes, create + open the PR without stopping. (Still stops on a real failure or genuine ambiguity.)
- `--fix-all` — skip only the review-fix selection gate; apply every vetted substantive finding. Other gates remain.
- `--no-pr` — stop after polish; commit but don't open a PR.
- `--ui` / `--no-ui` — force or skip the screenshot phase, overriding auto-detection.
- `--recap` — after the PR is opened, generate an interactive visual recap of it via the `visual-recap` skill (local-files mode). Off by default.
- `--local` — implement in the current working directory instead of an isolated worktree. **Worktree is the default** — `/ship` does the work in a fresh git worktree so your current checkout stays untouched. Pass `--local` only when you want to work in place.
- `--base <branch>` — base branch for the PR (default: the repo's default branch).

State the resolved mode in one line (e.g. "Gated run · worktree · UI auto-detect · base `develop`") and proceed. If the task description is empty, ask for it.

## Step 1 — Plan (via the `improve` skill)

Invoke the **`improve`** skill (Skill tool) with the task as its input to produce a scoped, self-contained implementation plan. `improve` is read-only — it surveys and plans, it doesn't edit.

**Gate (unless `--full-approve`):** show the plan as a short numbered list (steps + the verify check for each) and ask the user to approve, adjust, or cancel via `AskUserQuestion`. Don't touch code until approved.

## Step 2 — Implement

1. **Branch + worktree.** Pick a feature branch name (`feat/<short-slug>` from the task, or the JIRA ticket if the task names one). **By default, create it in a fresh git worktree** (see the `git-worktrees` skill) — e.g. `git worktree add ../<repo>-<slug> -b <branch>` — and do all implementation there so the user's current checkout stays untouched. Note the worktree path; every later step (review, tests, screenshots, PR) runs from it. With `--local`, skip the worktree and create the branch in place; never implement directly on `main`/`master`/`develop`. Leave the feature worktree in place when the run ends (the branch isn't merged yet) — report its path in the summary and offer to remove it (`git worktree remove <path>`) once the PR merges.
2. **Build it.** Execute the approved plan. Offload research/exploration to `Explore` and `Plan` subagents to keep your context clean; keep one focused task per subagent. Follow the user's coding rules from `~/.claude/CLAUDE.md` (simplicity-first, surgical changes, no speculative features).
3. **Frontend work.** When a step builds or changes UI, use the **`frontend-design:frontend-design`** skill for the component/page work, and consult `ui-ux-pro-max` for style/palette/font decisions before writing component code (per the user's design stack).
4. **Verify as you go.** After each meaningful chunk, run the project's checks — tests, typecheck, lint/format (detect from `package.json` scripts, `Gemfile`, etc.). Treat the task's success criteria as the goal: changed behavior should have a test that passes. Don't move to review with a red suite — fix or report.

## Step 3 — Code review + apply

Run the full multi-agent review on the diff (the `/code-review` workflow, inlined here):

1. Assemble the diff (`git diff <base>...HEAD`) and read project context (`CLAUDE.md`, `AGENTS.md`, manifests).
2. Fan out the reviewer subagents **in parallel, in one message**: `security-reviewer`, `correctness-reviewer`, `test-reviewer`, `performance-reviewer`, `architecture-reviewer`, `style-reviewer`. Skip a reviewer only when clearly irrelevant to the diff.
3. **Vet** the findings — open the cited code and confirm each CRIT/HIGH and any finding resting on a factual claim before trusting it. Drop the ones whose premise doesn't hold. (Reviewers over-report.)
4. Aggregate into the severity table + per-file format.

**Gate (unless `--fix-all` or `--full-approve`):** present the vetted findings and ask which to apply via `AskUserQuestion` (default selection: all CRIT/HIGH + substantive MED; nits optional). With `--fix-all`/`--full-approve`, apply all substantive findings (skip pure nits unless trivial).

Apply the chosen fixes, then re-run the project checks to confirm still-green.

## Step 4 — Polish

Invoke the **`polish-loop`** skill (audit → fix → critique-loop until clean). Let it run to a clean pass. Re-run checks once more if it touched code.

## Step 5 — UI detection + screenshots

Decide whether this is frontend work: `--ui` forces yes, `--no-ui` forces no; otherwise auto-detect — does the diff touch components/pages/styles/templates (`.tsx`, `.jsx`, `.vue`, `.svelte`, `.css`, view templates, Storybook)? If no UI, skip to Step 6.

If UI:
1. Launch the app (use the `run` skill or the project's dev script). Wait for it to be ready.
2. With the **chrome-devtools** MCP, navigate to each affected route/page, set a sensible viewport, and `take_screenshot` — capture the before/after-relevant screens (and a mobile width if the change is responsive). Save them to a temp dir.
3. They get published to the `pr-assets` branch in Step 6. Stop the dev server when done.

If the app is a native/mobile target instead, use the appropriate tool (XcodeBuildMCP screenshot) or note that screenshots need a manual capture.

## Step 6 — PR + open

Unless `--no-pr`:

1. Commit anything uncommitted with a concise conventional-commit message (`feat:`/`fix:`/`refactor:`…). **Never mention Claude or Anthropic** in commits or PR text.
2. Push the branch.
3. **Publish screenshots to the `pr-assets` branch** (only if Step 5 captured any). This is how UpSpeech PRs embed images — they live on a dedicated orphan branch, so they get permanent GitHub-hosted URLs without polluting the feature-branch diff:
   - Derive `<owner>/<repo>` from `gh repo view --json nameWithOwner -q .nameWithOwner`.
   - Use a throwaway worktree so the working tree is untouched: `git worktree add --detach /tmp/<repo>-pr-assets`. Inside it, check out the branch if it exists (`git fetch origin pr-assets` then `git switch pr-assets`), else create it orphan (`git switch --orphan pr-assets` then `git rm -rf .` to empty the tree).
   - Copy the screenshots into a per-PR subfolder named for the branch slug: `<branch-slug>/<screen>-<viewport>.png` (e.g. `feat-roi-calc/dashboard-desktop.png`).
   - `git add` them, commit (`chore: pr-assets for <branch>`), `git push origin pr-assets`, then `git worktree remove /tmp/<repo>-pr-assets`.
   - The raw URL for each is `https://github.com/<owner>/<repo>/blob/pr-assets/<branch-slug>/<file>.png?raw=true`. Embed each as a click-to-zoom self-link `[![alt](<url>)](<url>)`; lay before/after or responsive shots in a `| Desktop | Mobile |` markdown table.
4. Draft the PR body in the user's plain voice, with the screenshot URLs from step 3 embedded:
   - **What & why** — 2–4 sentences.
   - **Changes** — short bullets of the substantive changes.
   - **Review** — one line: findings applied / how many vetted-and-dropped.
   - **Testing** — what you ran and that it's green.
   - **Screenshots** — the embedded `pr-assets` images (omit the section for backend-only work).
5. **Gate (unless `--full-approve`):** show the drafted title + body and confirm before creating via `AskUserQuestion`.
6. Create the PR: `gh pr create` against `--base` (or the default branch) with that body. **Never mention Claude or Anthropic** in the PR text. Then open it (`gh pr view --web`) and show the screenshots inline in the chat summary.
7. **Visual recap (only with `--recap`).** Invoke the `visual-recap` skill on the just-opened PR to produce an interactive recap (diagrams, file map, annotated diff). It defaults to **local-files mode** — never publish to a hosted shareable link, since these diffs can touch patient-data code. Skip silently if the skill isn't installed. Without `--recap`, don't run it.

## Step 7 — Summary

Close with a tight recap: branch, worktree path (and the `git worktree remove` one-liner for after merge), PR URL, what the review caught and what you applied, test status, and (for UI) the screenshots. No preamble, no filler.

## Important

- **Gates are the default.** Only `--full-approve`/`-y` removes them all. When unsure at any gate, stop and ask — don't assume.
- **Stop on red.** A failing suite or a genuine ambiguity halts the pipeline and surfaces to the user; don't push through it.
- Reuse the existing skills/agents (`improve`, `polish-loop`, `frontend-design`, the reviewer subagents) rather than reimplementing their logic here.
- This is one command; if the user only wants part of the flow, point them at the underlying skill (`/improve`, `/code-review`, `/polish-loop`) instead of running the whole thing.
