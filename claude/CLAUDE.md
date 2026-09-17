# Global Context

## Personal Knowledge Base

Personal projects, tasks, or life organization: check my Obsidian vault at `~/Notes/`, starting with `AGENDA.md` for current priorities and open threads. The vault's own `CLAUDE.md` has the full instructions.

---

## Stack Preferences

- **Mailer (personal projects):** AhaSend, free tier, REST API at `api.ahasend.com/v2`. Use this by default when adding email to any personal project.

### Design stack (when building UI / pages / sites)

Which door:

| Situation | Entry point |
|---|---|
| New project, or a full redesign | `build-ui`, all four steps, direction hunt included |
| New feature with UI | `/ship`, which invokes `build-ui` at its implement step |
| Reworking a page whose identity is already settled | `build-ui` from step 2, skip the direction hunt |
| Small tweak (spacing, one color, one component) | Just do it, then `/critique` if it is user-facing |
| "Does this look AI-generated?" | `/critique` alone. It screenshots and asks an outside subagent |

Full detail lives in the `build-ui` skill.

---

## Coding Guidelines

### 1. Before Acting

Pick the gate that matches the task:

- **Ambiguous intent** (unclear scope, several valid readings, or a tradeoff that is mine to decide): ask with `AskUserQuestion`, stating your assumptions in the question.
- **Clear intent, but 3+ steps or an architectural decision**: enter plan mode.
- **Everything else**: state a brief plan inline, each step paired with its check, then act.

If a simpler approach exists, say so, and push back when warranted. If something goes sideways mid-task, stop and re-plan.

### 2. Simplicity and Surgical Changes

Write the minimum code the request needs, in the style of the surrounding code. If it could be 50 lines instead of 200, write the 50. Handle only errors that can actually happen.

Every changed line traces directly to the request. Clean up the orphans your own change created (imports, variables, functions it left unused), and mention any other dead code instead of removing it.

### 3. Goal-Driven Execution

Turn each task into a verifiable goal, then loop until it passes:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

### 4. Read the Real Docs

Third-party API, library, framework, CLI, cloud service, or SDK behavior: invoke `builder-skills:read-the-damn-docs` before answering or integrating from memory.

### 5. Git Commits

- When I say `/commit`: stage relevant files, write a concise commit message, and commit. No push unless asked.
- **Never mention Anthropic or Claude** in commit messages or co-author lines.
- Follow the repo's commit convention (`feat:`, `fix:`, `refactor:`, etc.). Read `git log --oneline -5` first if the convention isn't obvious.
- Stage files **by name**. Never `git add -A` or `git add .`, and never stage anything that could hold secrets (`.env`, credentials, keys).
- If a pre-commit hook fails, fix it and make a NEW commit. Never amend.
- The message body is prose I will read, so `writing-style.md` applies to it. The conventional-commit format is the only part that is exempt.

### 6. Fable-Tier Security Phrasing

If you are a Claude Fable or Mythos-tier model (`claude-fable-*`) and are writing up security findings or delegating security review, read `~/.claude/fable-security-phrasing.md` first.

@RTK.md
@writing-style.md

<!-- github-pending-review.md is not imported here, /code-review loads it on demand by path when posting a pending PR review. -->
