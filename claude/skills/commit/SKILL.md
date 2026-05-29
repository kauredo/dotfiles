---
name: commit
description: Stage relevant files and create a git commit with a conventional commit message
disable-model-invocation: true
allowed-tools: Bash(git *)
---

Create a git commit. Follow these steps exactly:

1. Run in parallel:
   - `git status` (never use `-uall`)
   - `git diff` (staged + unstaged)
   - `git log --oneline -5` (for commit style reference)

2. Analyze the changes and draft a commit message:
   - Use conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, etc.)
   - Focus on the "why", not the "what"
   - 1-2 sentences max
   - Never mention Anthropic or Claude in the message or co-author lines
   - Do not commit files that likely contain secrets (`.env`, credentials, etc.)

3. Stage relevant files by name (not `git add -A` or `git add .`) and commit using a HEREDOC:
   ```
   git commit -m "$(cat <<'EOF'
   type: commit message here
   EOF
   )"
   ```

4. Run `git status` to verify success.

5. If a pre-commit hook fails, fix the issue and create a NEW commit (never amend).

Do NOT push unless explicitly asked. If `$ARGUMENTS` contains `-m` followed by a message, use that as the commit message instead of drafting one.
