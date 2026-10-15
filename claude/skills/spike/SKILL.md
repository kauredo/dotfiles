---
name: spike
description: "Spike: answer a feasibility question (\"can X work?\", \"spike this\") with the cheapest evidence in an isolated worktree, ending in a keep/kill memo, never a merge. Whether a state model feels right goes to prototype; what it should look like goes to build-ui."
---

# Spike

One feasibility question, answered with the least work that produces evidence, inside a worktree. The output is a memo. Spike code never gets merged. A spike that kills the idea counts as a win; if every spike survives, nobody is exploring.

Normal production rules make exploration expensive. Left on a feature branch with tests around it, prototype code tends to become production code. The throwaway worktree and the no-merge rule prevent that.

## Route first

- A question ("can X work?", "would this hold up?"): spike it.
- Whether a state model or logic feels right: use `prototype`.
- What something should look like: use `build-ui`.
- No question at all: it is a feature request. Send it to the repo's planning workflow.

Check CLAUDE.md or AGENTS.md in the repo for layout and commands. If neither exists, find them yourself. For a spike that only touches UI, work in a sandbox app already in the repo when there is one, not in a shipped app.

## Relaxed inside the worktree

Skip these: commit message conventions (WIP commits are fine, no PR will exist), tests, i18n, docs sync, decision records, and the surgical-change and simplicity rules. Hardcode values, stub, copy-paste, fake data. Drop whatever doesn't move the answer.

## Still enforced

- Nothing destructive: no dropped schemas, no deleted data, no force-push to a shared branch.
- Real credentials and production data stay out. So do side effects that leave the machine: emails, writes to third parties, outbound webhooks.
- Commit only on the spike branch: not on the default branch, not on a feature branch that already exists. No PR comes out of it.

## 1. Frame

State the question in one sentence, plus the decision the answer unblocks. Settle the budget with the user, as a number of approaches or an amount of exploration; default to one approach in one session. Write down the kill criteria, meaning the outcome that counts as no.

Before any code, write all four (question, decision, budget, kill criteria) into `SPIKE.md` at the worktree root. This step ends when the file has them.

## 2. Isolate

Find the default branch. Branch off it into a new `spike/<slug>`, in a worktree made with the worktree tool or `git worktree add`. This step ends when you are inside `spike/<slug>` and `SPIKE.md` is the only new file.

## 3. Build the cheapest answer

Every edit serves the question. Build the thinnest end-to-end slice that yields evidence: a route renders, a query returns, a figure gets measured.

- Keep a running log in `SPIKE.md` of numbers, errors, screenshots and abandoned paths. An abandoned path tells you something.
- The worktree will be deleted, so copy each screenshot the memo cites to a stable local path and cite that path.
- Stop as soon as you know the answer. Skip polish.
- Running out of budget is also an answer, usually "costlier than expected", which usually means kill.

This step ends when the evidence answers the question or the budget is gone.

## 4. Keep or kill

Turn `SPIKE.md` into a memo that stands alone: question, budget used, what was tried, the answer and its evidence, **KEEP** or **KILL**, and what you learned. For a keep, add a rough production estimate and the risks.

- **Kill** is the default. Put the memo in the final report, and in the tracker ticket if there is one. If the no reflects a lasting architectural decision, first record an ADR via `domain-modeling`, with the memo as source material. After that, tear down the worktree and the branch.
- **Keep**: pass the memo to the repo's planning workflow and put it in whichever context file that workflow reads (a glossary or plan file). The branch can stay around as a reference. Production work starts from the findings. Don't merge the spike code or tidy it into a PR; if kept spike code ships, the spike failed.

This step ends once the memo is delivered and you have either removed the worktree or handed off to planning. No verdict, no finish.

## Final report

Question, verdict, summary of evidence, learnings, next step, and where any kept branch or copied screenshots live.

## One question per spike

New question, new spike. If the spike turns into "this works, just ship it", stop and move to planning.
