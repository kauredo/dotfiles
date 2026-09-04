---
name: stacked-prs
description: Split work that would be one large PR into a chain of small PRs, each based on the one below it, using the `gh stack` extension. Use whenever a task produces more than one reviewable change, when a plan set has an execution order, or when the user says "stack the PRs", "one by one", or "separate reviewable PRs".
---

# Stacked PRs

One 2,000-line PR gets a rubber stamp. Six 300-line PRs get read. A stack keeps
each PR small and reviewable while the branches still build on each other, so
you never wait for review round one before starting round two.

Reference: <https://gh.io/stacks-overview>

**Default to a stack whenever work splits into more than one reviewable change.**
The alternative — one branch, one giant diff — is the thing this exists to avoid.

## When not to stack

- One self-contained change. A stack of one is a PR.
- Changes with no ordering between them that touch disjoint files. Open them as
  independent PRs off the trunk instead; a stack implies "read these in order".
- The repo uses a merge queue you have not checked works with stacks. `gh stack
  merge` adds the whole stack to the queue; confirm that is what the team wants.

## Prerequisites

`gh stack` is a `gh` extension, not built in:

```bash
gh extension list | grep -q stack || gh extension install github/gh-stack
gh stack --help
```

If the extension will not install, fall back to plain `gh pr create --base
<parent-branch>` per PR and say in each body which PR it stacks on. That gets
the review ergonomics without the tooling.

## The shape

Each branch is based on the previous one, and each PR targets its parent rather
than the trunk. So a PR's diff shows only its own change:

```
main
 └── 01-plans-index        PR #40  base: main
      └── 02-tenant-scope   PR #41  base: 01-plans-index
           └── 03-tests     PR #42  base: 02-tenant-scope
```

## Naming

Prefix each branch with its position, zero-padded: `01-`, `02-`, `03-`. The
prefix survives `git branch` output, `gh stack view` and the PR list, so the
read order is visible without opening anything. After the prefix, use the repo's
normal convention (`fix/`, `feat/`, `test/`) — e.g. `01-fix/tenant-scope`.

Where the work comes from a numbered plan set, **order the stack by execution
order, not by plan number**, and put the plan number in the PR title so the two
stay linkable.

## Workflow

### 1. Plan the split before touching a branch

Write the list down first: one line per PR, in the order a reviewer should read
them. Each entry needs a reason it is its own PR. If you cannot say why two
entries are separate, they are one PR.

The split that reviews best is usually by **reason to change**, not by file.
Tests that pin current behaviour, then the behaviour change that inverts them,
is two PRs even though they touch the same file.

### 2. Create the stack

```bash
git worktree add ../<repo>-stack -b 01-<slug>   # keep the user's checkout clean
cd ../<repo>-stack
gh stack init 01-<slug>                          # trunk defaults to the default branch
```

Then, for each subsequent PR:

```bash
# ...make the changes for this layer, run the checks...
git add <files by name>
git commit -m "fix(api): ..."
gh stack add 02-<slug>        # branches from the current tip
```

`gh stack add -Am "msg" <branch>` stages and commits in one go. Do not use it
here: `-A` stages untracked files indiscriminately, which is exactly the
`git add -A` this user's rules prohibit. Stage by name, commit, then `gh stack
add <branch>` with no flags.

### 3. Verify every layer, not just the top

**Each branch must be green on its own.** A reviewer merging PR 3 gets 1, 2 and
3 together, but CI runs on each branch separately, and a layer that only passes
because of a fix in the layer above is a broken commit in the history.

Run the project's checks after each `git commit` and before the next `gh stack
add`. If a layer cannot be green alone, it belongs merged into its parent.

### 4. Submit

```bash
gh stack submit --auto --open
```

`--auto` skips the interactive editor (which needs a TTY an agent does not
have). `--open` marks them ready for review rather than draft. Then set the real
titles and bodies per PR:

```bash
gh pr edit <n> --title "..." --body-file <path>
```

`--auto` generates titles from commit subjects, which are terse. Write each body
properly; the per-PR body is most of a stack's value.

### 5. Each body says where it sits

Every PR in a stack opens with its position, because a reviewer landing on PR 4
from a notification has no idea what is below it. `gh stack submit` adds its own
navigation block; add a one-line human version too:

```markdown
**Stack position 4 of 7.** Based on #42 (plan 003, characterization tests).
Review #40 → #41 → #42 first — this diff assumes them.
```

Then the usual What & why / Changes / Testing.

### 6. After a review fix on a lower PR

Fix it on the branch that owns it, then cascade:

```bash
git switch 02-<slug>
# ...fix, stage by name, commit...
gh stack sync          # rebases every branch above onto the new tip and force-pushes
```

`gh stack sync` uses `--force-with-lease --atomic`. On a conflict it restores
every branch to its original state and tells you to run `gh stack rebase` to
resolve interactively. Never fix a lower layer's problem in a higher layer; that
is how a stack rots into a single unreviewable blob.

### 7. Merging

```bash
gh stack merge --squash --yes        # everything in the stack, atomically
gh stack merge <pr-number> --squash  # everything up to and including that PR
```

The merge is all-or-nothing: if one PR cannot merge, none do. Merge bottom-up
and only as far as review has actually reached — `gh stack merge` with no
argument takes the whole stack, so pass the PR number when only the lower half
is approved.

Afterwards:

```bash
gh stack sync --prune                # drop local branches for merged PRs
git worktree remove ../<repo>-stack  # once the whole stack has landed
```

## House rules that still apply

- Stage files by name. Never `git add -A` or `git add .`, and never stage `.env`
  or anything holding a credential.
- Conventional commits, matching the repo's existing `git log`.
- Never mention Claude or Anthropic in a commit message, a PR body, or a
  co-author line.
- A pre-commit hook failure gets a new commit, never an amend. In a stack an
  amend on a lower branch orphans every branch above it, so this matters more
  here than usual.
- PR bodies follow `~/.claude/writing-style.md`, tier 2.

## Reporting back

Give the user the stack as a list, bottom first, with each PR's number, title
and one-line scope — plus the single `gh stack merge` line that lands it. A wall
of seven PR URLs with no order is worse than one big PR.
