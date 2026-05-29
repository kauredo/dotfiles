Process GitHub pull request review comments and address feedback.

## Input

The user provides one or more GitHub PR URLs (e.g., `https://github.com/org/repo/pull/123`).

## Workflow

For each PR URL, execute these steps in order:

### 1. Fetch PR Details

Use `gh` CLI to gather information:

```
gh pr view <number> --repo <owner/repo> --json headRefName,title,body,reviews,comments
gh api repos/<owner>/<repo>/pulls/<number>/comments
gh api repos/<owner>/<repo>/pulls/<number>/reviews
```

Extract:

- **Branch name** and **repo name**
- **All review comments** (inline code comments and general review comments)
- **PR title** to identify the ticket ID (e.g., `EFX-1234`)

### 2. Navigate to Repo and Branch

- Determine the correct local directory from the repo name (check subdirectories of the working directory)
- `cd` into that directory
- Fetch latest and checkout the PR branch
- Pull latest changes

### 3. Evaluate Each Review Comment

For every review comment:

1. **Read the relevant file and surrounding code** to understand context
2. **Assess the comment**: Is the feedback valid? Does it improve correctness, readability, or maintainability?
3. **Decision**:
   - **If the change should be made**: Make the edit. Keep changes minimal and surgical.
   - **If the change should NOT be made**: Note the reason (e.g., "This is intentional because...", "The reviewer may have missed that...", "This would break X..."). Report this to the user for their decision.

### 4. Summarize and Commit

After processing all comments for a PR:

1. **Report to the user**:
   - List of changes made and why
   - List of comments NOT addressed and why
   - Ask the user to confirm before committing

2. **Commit** (after user confirms):
   - Stage only the changed files (use specific filenames, not `git add .`)
   - Commit message format: `TICKET-ID address pr review feedback`
   - Example: `EFX-1234: address pr review feedback`
   - Do NOT mention Claude, Anthropic, Augment, or any AI tool in the commit message
   - Do NOT add Co-Authored-By lines

3. **Push** the branch

### 5. Next PR

Move to the next PR URL and repeat from step 1.

## Important Rules

- **Read before editing** — always read the file and understand context before making changes
- **Minimal changes** — only touch what the review comment asks for
- **No drive-by fixes** — don't "improve" unrelated code
- **Match existing style** — follow the conventions already in the file
- **Explain rejections clearly** — if you skip a comment, give a concrete reason
- **One commit per PR** — batch all changes for a single PR into one commit
- **Never force push** — always use regular `git push`
- **Ask before committing** — always show the user what you plan to commit and get confirmation
