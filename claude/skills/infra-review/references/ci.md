# CI workflow rules (GitHub Actions)

Levels are defaults. Match the repo's precedent on pinning style.

## Rules

- **Pinned actions.** Third-party actions use a 40-character commit SHA with a version comment. First-party `actions/*` and `github/*` at a major tag are accepted. Unpinned third-party is P2.
- **Least-privilege `permissions:`.** Default to `contents: read`; a single job elevates a single scope. Missing or loose is P2.
- **Privileged triggers.** `pull_request_target` and `workflow_run` must not check out or run PR head code while secrets are available. Metadata-only use is fine. If PR code must run, isolate it in a job with no secrets. Prefer `pull_request`. Untrusted PR code under a privileged trigger is P1.
- **Script injection.** Never put `${{ }}` of an attacker-controlled field (PR title, PR body, head ref, issue title, comment body) inside `run:`. Pass it through `env:` and quote it in the shell. P1.
- **Secrets.** Only through the `secrets` context, never literal. A literal is P1. Static cloud access keys are P1.
- **Pinned toolchains.** Release-critical jobs pin tool versions, and the runner image where reproducibility matters. Floating versions in a release job are P3.

## Not a finding

- Trusted GitHub-controlled values inside `${{ }}`.
- `ubuntu-latest` in ordinary CI jobs.
- First-party action major tags.
- A job that declares exactly the broad scope it needs.
