---
description: End-to-end feature pipeline: plan (improve) → implement → code-review → apply → polish → PR with screenshots. Runs unattended by default; `--gated` puts the approval gates back.
argument-hint: "<task description> [--gated] [--no-pr] [--ui|--no-ui] [--local] [--base <branch>]"
---

You are driving a task from idea to opened PR. Run the pipeline below in order. By default the run is **unattended**: approve the plan yourself, apply every vetted substantive review fix, and open the PR without stopping. Pass `--gated` to get the three approval gates (plan, review-fix selection, PR) back. Keep your own narration minimal — the user wants the work done and the artifacts, not a play-by-play.

> **Voice — applies to the PR body and any GitHub text.** Write like a developer talking to a teammate: plain, short sentences, no significance-inflation words ("crucial", "robust", "comprehensive"), no rule-of-three padding, no tidy summary closers, no em-dash drama. Follow `~/.claude/writing-style.md`. If a draft sounds like AI, rewrite it.

## Step 0 — Parse args and set the mode

`$ARGUMENTS` holds the task description plus any flags. Strip the flags; what remains is the task.

Flags (default behavior is **unattended**: every gate open, every vetted substantive review fix applied, PR created. It still stops on a real failure or genuine ambiguity.):
- `--gated` / `--ask` — restore ALL three approval gates: plan, review-fix selection, PR title + body. Nothing lands without the user saying yes.
- `--full-approve` / `-y` / `--fix-all` — accepted but no-ops, since that is now the default. Don't complain about them, just run.
- `--no-pr` — stop after polish; commit but don't open a PR.
- `--ui` / `--no-ui` — force or skip the screenshot phase, overriding auto-detection.
- `--recap` — after the PR is opened, generate an interactive visual recap of it via the `visual-recap` skill (local-files mode). Off by default.
- `--local` — implement in the current working directory instead of an isolated worktree. **Worktree is the default** — `/ship` does the work in a fresh git worktree so your current checkout stays untouched. Pass `--local` only when you want to work in place.
- `--base <branch>` — base branch for the PR (default: the repo's default branch).
- `--plan <path>` — pin the plan file this run executes, when auto-detection would guess wrong. See Step 6b.
- `--no-plan` — this run answers to no plan file, so skip the Step 6b bookkeeping entirely.
- `--grill` — force the Step 0.5 question round even when the task looks clear.
- `--no-grill` — skip it even when the task looks underspecified, and plan on stated assumptions instead.

State the resolved mode in one line (e.g. "Unattended · worktree · UI auto-detect · base `develop`") and proceed. If the task description is empty, ask for it.

## Step 0.5 — Size the task, then pick the entry point

`/ship` is meant to be the one command for a piece of work, including a brand new idea. It gets there by starting the chain at the right link rather than by treating every task as ready to build. Do this before Step 1, in your head, in a few seconds.

Three shapes:

**1. Buildable now.** The task names what should change and what "done" looks like is checkable. Most tasks. Go straight to Step 1.

**2. Underspecified, but it still fits one session.** You would have to invent requirements to proceed, and different reasonable guesses produce different work. Call the Skill tool for `grilling` and put the open questions to the user in one round, then go to Step 1 with the answers. This is the default for a genuinely new idea, and it is what makes `/ship <new idea>` work end to end. `--no-grill` trades this for plan-on-stated-assumptions; `--grill` forces it.

**3. Foggy, and bigger than one session.** Several decisions are unmade *and* depend on each other, or the work obviously spans many PRs before anything is shippable. **Stop and hand back**, with the exact line to run: `/wayfinder <the idea>`.

Shape 3 is a real stop, for two reasons that both hold. `wayfinder` sets `disable-model-invocation: true`, so `/ship` cannot call it even if it wanted to, and that setting is deliberate. And wayfinder exists for work too big for one agent session, which is precisely the work one `/ship` run cannot hold. Cutting a shape-3 task down to something ship can finish silently discards the decisions nobody made yet.

Signals for shape 3, in rough order of reliability: the user's own framing (*rework*, *rethink*, *from scratch*, *how should we*), more than one unmade architectural decision in the same task, or a change that has to land across several repos before any of it is usable. One unmade decision on its own is shape 2: ask it and move on.

Say which shape you picked in the mode line. If it is shape 3, that sentence and the `/wayfinder` line are the whole output.

## Step 1 — Plan (via the `improve` skill)

Invoke the **`improve`** skill (Skill tool) with the task as its input to produce a scoped, self-contained implementation plan. `improve` is read-only — it surveys and plans, it doesn't edit.

**If the task names an existing plan file, read that file yourself before invoking `improve`, and read it whole.** A status cell in an index is a summary someone wrote at one moment; the plan body is where the executor notes live, and the two drift. Verify the plan's remaining work still exists in the code before building it: check for the artifacts it says it will create. A plan that turns out to be finished is a STOP, not a rebuild, and the index row that said otherwise is then the thing to fix (Step 6b). Also pass `improve` any wayfinder map the task names, per "Composing with wayfinder" below.

**Gate (only with `--gated`):** show the plan as a short numbered list (steps + the verify check for each) and ask the user to approve, adjust, or cancel via `AskUserQuestion`. Don't touch code until approved. Without `--gated`, state the plan in a few lines and start building.

## Step 2 — Implement

1. **Branch + worktree.** Pick a feature branch name (`feat/<short-slug>` from the task, or the JIRA ticket if the task names one). **By default, create it in a fresh git worktree** (see the `git-worktrees` skill) — e.g. `git worktree add ../<repo>-<slug> -b <branch>` — and do all implementation there so the user's current checkout stays untouched. Note the worktree path; every later step (review, tests, screenshots, PR) runs from it. With `--local`, skip the worktree and create the branch in place; never implement directly on `main`/`master`/`develop`. Leave the feature worktree in place when the run ends (the branch isn't merged yet) — report its path in the summary and offer to remove it (`git worktree remove <path>`) once the PR merges.
2. **Build it.** Execute the approved plan. Offload research/exploration to `Explore` and `Plan` subagents to keep your context clean; keep one focused task per subagent. Follow the user's coding rules from `~/.claude/CLAUDE.md` (simplicity-first, surgical changes, no speculative features).
3. **Frontend work.** When a step builds or changes UI, use the **`frontend-design:frontend-design`** skill for the component/page work, and consult `ui-ux-pro-max` for style/palette/font decisions before writing component code (per the user's design stack).
4. **Verify as you go.** After each meaningful chunk, run the project's checks — tests, typecheck, lint/format (detect from `package.json` scripts, `Gemfile`, etc.). Treat the task's success criteria as the goal: changed behavior should have a test that passes. **Gate:** no green suite, no Step 3. A red or skipped suite is not a reason to keep going and mention it later; fix it, or stop and report what is failing. The same gate applies at Step 3 to Step 4: unapplied CRIT or HIGH findings block polish.

## Step 3 — Code review + apply

Run the full multi-agent review on the diff (the `/code-review` workflow, inlined here):

1. Assemble the diff (`git diff <base>...HEAD`) and read project context (`CLAUDE.md`, `AGENTS.md`, manifests).
2. Fan out the reviewer subagents **in parallel, in one message**: `security-reviewer`, `correctness-reviewer`, `test-reviewer`, `performance-reviewer`, `architecture-reviewer`, `style-reviewer`. Skip a reviewer only when clearly irrelevant to the diff.
3. **Vet** the findings — open the cited code and confirm each CRIT/HIGH and any finding resting on a factual claim before trusting it. Drop the ones whose premise doesn't hold. (Reviewers over-report.)
4. Aggregate into the severity table + per-file format.

**Default:** apply every vetted substantive finding (all CRIT/HIGH, plus substantive MED), skipping pure nits unless they're trivial, and say in one line what you applied. **Gate (only with `--gated`):** present the vetted findings and ask which to apply via `AskUserQuestion` (default selection: all CRIT/HIGH + substantive MED, nits optional).

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
5. **Gate (only with `--gated`):** show the drafted title + body and confirm before creating via `AskUserQuestion`. Without it, go straight to creating the PR.
6. Create the PR: `gh pr create` against `--base` (or the default branch) with that body. **Never mention Claude or Anthropic** in the PR text. Then open it (`gh pr view --web`) and show the screenshots inline in the chat summary.
7. **Visual recap (only with `--recap`).** Invoke the `visual-recap` skill on the just-opened PR to produce an interactive recap (diagrams, file map, annotated diff). It defaults to **local-files mode** — never publish to a hosted shareable link, since these diffs can touch patient-data code. Skip silently if the skill isn't installed. Without `--recap`, don't run it.

## Step 6b — Record it in `plans/`

Skip with `--no-plan`, or when the repo has no `plans/` directory and no equivalent plan index.

A plan whose status row still says TODO after it shipped costs someone a wasted run: they pick a finished plan off the index, build against it, and find the work already in the tree. Closing that loop is part of shipping, not paperwork after it.

1. **Find the plan.** Use `--plan` if given. Otherwise match the task against `plans/` by number and by title. If nothing matches, say so in one line and skip the rest of this step. Do not invent a plan file.
2. **Update its status row** in the plan index (`plans/README.md` or equivalent) to record this PR: the repo, the PR link, and what the PR actually contains. Keep it evidence-first in the index's existing house style, and **name the plan, never just its number**, because the reader does not know plans by number.
3. **Update the plan file itself** where it carries executor notes or a stage list, marking the stage this run delivered. Where the plan turned out to be wrong about the codebase, record the correction next to the claim rather than deleting it. That note is worth more than the original text.
4. **Add a promotion-checklist row** when the plan ships onto a staging branch with a prod-side action attached (a data migration to run, a flag to flip, a constant to pin). The index's own instructions say to keep that list current; this is where it gets kept.
5. **Open the plan update as its own PR** when `plans/` lives in a different repo from the code, which is the normal case in a multi-repo workspace. One PR per repo touched, so a code PR and a plan PR is two PRs, both reported in the summary.

## Step 7 — Summary

Close with a tight recap: branch, worktree path (and the `git worktree remove` one-liner for after merge), PR URL, the plan row you updated (Step 6b), what the review caught and what you applied, test status, and (for UI) the screenshots. No preamble, no filler.

## Step 8 — After the merge

Not part of the unattended run: `/ship` opens PRs and never merges them, so this step fires later, when the merge actually happens. Run it when the user merges in this session (the common case, "ok merge it" right after the PR), or when `/ship` is pointed at a PR that is already merged.

1. **Move the status row from in-review to merged**, recording the squash sha and the branch it landed on. A row that names a PR but not its sha cannot be checked later against the tree.
2. **Say whether it reached production.** On a staging-first repo, merging to the staging branch is not shipping to users. Write which of the two happened, so nobody reads "MERGED" as "live".
3. **Tick or add the promotion-checklist row** from Step 6b item 4, with the command that has to run and the environment it runs against.
4. **Record what the merge taught you**, if anything: a defect found on the way, a claim in the plan that did not survive contact with the code, an ordering constraint between repos. This is the part that stops the next executor repeating the run.
5. **Remove the feature worktree** (`git worktree remove <path>`) once its branch is merged.

## Composing with wayfinder

`wayfinder` and `/ship` sit at opposite ends of one pipeline and never overlap:

**wayfinder decides what to do** (a map of decision tickets under `.scratch/<effort>/`), **`improve` specifies how to do it here** (a self-contained plan in `plans/`), **`/ship` builds and opens the PR.** Step 1 already calls `improve`, and `improve` already globs `.scratch/*/map.md`, so a run inherits the map without being told about it. The rules below are the parts that need saying out loud.

- **`/ship` cannot invoke wayfinder, by design.** It is the one skill in this chain that sets `disable-model-invocation: true`, so it is user-invoked only. Everything else here (`grilling`, `prototype`, `research`, `domain-modeling`, `improve`) is model-invocable, which is why Step 0.5 can escalate a vague task to `grilling` on its own but has to hand a foggy one back to you.
- **Most new work never needs a map.** Wayfinder's own charting step says so: if breadth-first questioning surfaces no fog, and the journey fits one session, there is no map to draw. That is Step 0.5 shape 2, and `/ship` handles it start to finish.
- **Never resolve a wayfinder ticket with `/ship`.** Wayfinder is plan-don't-do, one ticket per session, and most of its ticket types are HITL: the human answers for themselves. An unattended executor resolving a grilling ticket has answered its own question, which is the exact failure that skill warns about. If the task names a ticket rather than a plan, stop and point at `/wayfinder`.
- **Pass the map through.** When the task names an effort or a map, hand `improve` the map path along with the task, so **Decisions so far** binds the plan instead of being rediscovered.
- **Fog is a STOP condition.** If building needs an answer sitting in the map's **Not yet specified**, do not pick one. Stop, name the open ticket, and hand back. Guessing there silently overwrites a decision the human has not made.
- **Out of scope is out of scope.** Work the map ruled out does not re-enter through a plan, a review finding, or a polish pass.
- **Refer to maps and tickets by name**, never a bare id, in the PR body and in the summary. Same rule the plan index gets in Step 6b, for the same reason.
- **The map and `plans/` are separate artifacts.** Step 6b writes to `plans/`. It does not close tickets, edit `map.md`, or touch Decisions-so-far; only a wayfinder session does that.

## Important

- **Unattended is the default.** `--gated` puts the three approval gates back. Skipping the gates is not license to guess: on genuine ambiguity, or a call the user would clearly want to make, still stop and ask.
- **Verify a plan before building it.** An index row is a claim about the code, not the code. Check the artifacts exist before executing a plan, and treat a finished plan as a STOP.
- **Stop on red.** A failing suite or a genuine ambiguity halts the pipeline and surfaces to the user; don't push through it.
- Reuse the existing skills/agents (`improve`, `polish-loop`, `frontend-design`, the reviewer subagents) rather than reimplementing their logic here.
- This is one command; if the user only wants part of the flow, point them at the underlying skill (`/improve`, `/code-review`, `/polish-loop`) instead of running the whole thing.
