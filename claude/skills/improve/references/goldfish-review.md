# Goldfish review

A **goldfish** is a reviewer with no memory of how the plan was written. It gets the plan file, the original task text, and the repo, and nothing from this session. What it trips over is what the executor will trip over, because the executor has the same blank memory. The idea comes from Google's Elephant-Goldfish Model; this is the single-reviewer version.

One goldfish per plan. A second one runs only after a `revise` verdict, and never a third.

## Dispatch

Spawn one read-only subagent (in Claude Code: the `Plan` type, which has no edit tools). Paste the brief below with the three slots filled. Fill `<task text>` with the request exactly as the user wrote it, not your restatement of it, and put nothing else from this session into the brief: no rationale, no rejected options, no summary of the plan.

```text
You are reviewing an implementation plan cold. You have not seen how it was written, and that is the point: the person who executes it will not have either.

Plan: <absolute path to the plan file>
Task it must deliver, verbatim: <task text>
Repo: <absolute repo root>

Read the plan whole. You may read any file in the repo and run read-only commands (search, git log, type-check in check mode). Edit nothing. Run every shell command as a program with plain arguments, never quoted into bash -c, sh -c or eval.

Work in this order and return the four sections in this order.

1. Paraphrase. In 3-6 sentences of your own words: what the plan will change, and how the plan says the code works today. Write it before you judge anything. A section you cannot paraphrase is a blocker; name it.

2. Fit to the task. Check the plan against the task text, never against the plan's own framing of the task. Name every requirement in the task that no step delivers, and every step that serves no requirement in the task.

3. Simpler or already built. For each new helper, module, abstraction, config option or dependency the plan adds, search the repo for an existing one that does the job, and name it with its path. Flag anything built for a requirement the task does not state.

4. Claims about the code. Check every file, function, command and behaviour the plan says exists now, and every "Current state" excerpt against the live file. A claim the code contradicts is a blocker. Files the plan marks as created are not findings. Then list every decision the plan leaves to the executor: a signature, an error-handling choice, a data shape, a library pick. Each one is a finding.

For each finding give: severity (blocker, major or nit), where in the plan, and what you saw in the repo, with file:line.

End with exactly one verdict line: approve, approve-with-fixes, or revise.
```

The goldfish is done when it has written the paraphrase and checked every path the plan cites. A reply missing either part goes back to it once, with the missing part named.

## Triage

You wrote the plan, so you hold the reasons the goldfish lacks. Use them on each finding.

1. **Compare the paraphrase to the task.** Where it differs, the plan said something you did not mean. Fix the wording in the plan, even when the goldfish reported no finding there.
2. **Sort every finding** into exactly one bin:
   - **Fix**: the finding holds. Edit the plan.
   - **Contest**: the finding rests on a misreading. Cite evidence the goldfish could have read: a file and symbol, or a line already in the plan. If the goldfish misread a line, that line is unclear, so make it clearer as well.
   - **Ask**: the finding exposes a one-way door (`~/.claude/one-way-doors.md`). Ask the user, unattended runs included.
3. **Converge.** `approve` and `approve-with-fixes` end the review once the fixes are in. After `revise`, apply the fixes and send a fresh goldfish the same brief. If that second goldfish still finds a blocker, stop and report it. Nits from either round go in only when they are a one-line edit.
4. **Record it.** Append `## Plan review` to the plan with one line per contested finding and its evidence. Skip the fixed findings, which are visible in the plan itself.
