# Global Context

## Personal Knowledge Base

My personal knowledge base (Obsidian vault) lives at `~/Notes/`.

- Read `~/Notes/AGENDA.md` for current priorities, open threads, and recent activity
- The vault follows PARA method: Projects, Areas, Resources, Archive
- Full instructions in `~/Notes/CLAUDE.md`

When I ask about personal projects, tasks, or life organization, check the vault.

---

## Stack Preferences

- **Mailer (personal projects):** AhaSend — free tier, REST API at `api.ahasend.com/v2`. Use this by default when adding email to any personal project.

### Design stack (when building UI / pages / sites)

These tools overlap — compose them, don't pick one at random:

1. **Decide the look** → `ui-ux-pro-max` skill. Pull a style, palette, font pairing, or chart type from its databases before writing component code.
2. **Build it** → `frontend-design` skill / `/frontend-design`. Generates the distinctive, production-grade UI.
3. **Check it** → `design-review` (a11y + visual issues), then `design-polish` (final pass before shipping). `interface-guidelines` for the rules on forms/buttons/nav/animation.

Skip steps for small tweaks. Full chain for a new page or site from scratch.

---

## Coding Guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Bias toward caution over speed — for trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs. Ask first.**

Always use the `AskUserQuestion` tool to get clarity before acting. Default to asking — not guessing. This applies to:
- Ambiguous requirements or unclear scope
- Multiple valid interpretations of a request
- Architecture or design decisions with tradeoffs
- Anything where you're less than confident about the intent

Before implementing:
- State your assumptions explicitly. If uncertain, ask via `AskUserQuestion`.
- If multiple interpretations exist, ask which one — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask via `AskUserQuestion`.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Dead code should be cleaned up — unless it's commented out intentionally or has a comment explaining why it exists.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

### 5. Plan Before Building

**Use plan mode for any non-trivial task (3+ steps or architectural decisions).**

- Enter plan mode to think through approach before writing code.
- If something goes sideways mid-task, STOP and re-plan — don't keep pushing down a broken path.
- Use subagents to keep the main context clean: offload research, exploration, and parallel analysis.
- One focused task per subagent. Don't duplicate work between main context and subagents.

### 6. Git Commits

- When I say `/commit`: stage relevant files, write a concise commit message, and commit. No push unless asked.
- **Never mention Anthropic or Claude** in commit messages or co-author lines.
- Follow the repo's commit convention (`feat:`, `fix:`, `refactor:`, etc.).

@RTK.md
@github-pending-review.md
@writing-style.md
