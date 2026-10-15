---
name: infra-review
description: "Infra diff review for judgment calls CI can't make: IAM, Terraform/OpenTofu, Helm/Kubernetes, Docker, GitHub Actions. Use for infra, Terraform, Helm, Docker or workflow changes. Generic correctness goes to /code-review."
---

# Infra review

Review an infrastructure diff for what a pipeline cannot judge. The repo's own conventions come first, generic best practice second.

Pick one reviewer per goal: generic bugs and security in arbitrary code go to `/code-review`, and the two never run over the same diff. Provider or tool behavior in doubt goes to `read-the-damn-docs`. An upstream module's implementation goes to `read-the-source`. Dependency bumps go to `dependabot-review`.

Inputs: the current branch (default) or a PR number or URL. `--base <ref>` is the diff base, used verbatim for stacked branches. `--fix` and `--comment` pick an output mode.

## 1. Establish the target

- Branch: `git diff --merge-base <base>` plus uncommitted work (`git diff HEAD`, `git status`). Review both. The base is the default branch unless `--base` says otherwise; ask when unsure.
- PR: fetch the diff through GitHub tooling.
- Changed files only. Skip generated paths: `.terraform/`, generated clients, lockfiles.
- Ignore preloaded diff info that describes a different branch than the target.

Done when you hold the list of changed files and the base used.

## 2. Learn the repo's conventions

Read the CI workflows and list what they already gate. Read the existing modules, charts, Dockerfiles and workflows for tag sources, IAM modules, pinning style, the security-context baseline, role-binding naming, and how the repo splits credential mechanisms.

Done when you can state which gates exist and which conventions apply.

## 3. Map paths to rule sets

Load only the reference files the diff touches.

| Changed path | Read |
|---|---|
| IAM policy, role, trust, IRSA, Pod Identity (also any `*.tf` that defines one) | [`references/iam.md`](references/iam.md) |
| `*.tf`, `*.tofu`, `*.tfvars`, backend config | [`references/terraform.md`](references/terraform.md) |
| Helm charts, values files, per-environment overrides | [`references/kubernetes.md`](references/kubernetes.md) |
| Dockerfile, `.dockerignore`, compose files | [`references/docker.md`](references/docker.md) |
| `.github/workflows/**`, `action.yml` | [`references/ci.md`](references/ci.md) |

Done when every changed file maps to a loaded rule set.

## 4. Review the changed hunks

A small diff: walk it directly. A large or multi-area diff: one subagent per rule set, in parallel. Each gets the changed files for its area, its reference file, the conventions from step 2, and the finding format below. Give each the shell rule: plain programs with plain arguments, never `bash -c`.

Verify each claim in the real files with Grep and Read before flagging it: the tag source exists, the trust is scoped, the base image is pinned. The hunk alone is not evidence.

Skip anything in "Not a finding" below, the reference file's own list, and any documented deliberate deviation or pattern the repo follows consistently.

Done when every finding cites evidence from a file.

## 5. Prioritize

| Level | Meaning |
|---|---|
| P1 | Blocker. Merge opens a hole or breaks production. |
| P2 | High. Fix before merge unless the author explains. |
| P3 | Medium. Fix soon. |
| P4 | Nit, such as docs drift. |

Each reference file lists the default level per rule. Severity moves with context; the files note where.

## 6. Report

Title with the branch or PR number. Then, in order:

1. Scope reviewed: areas, file count, hunk count.
2. Counts for P1 to P4.
3. One section per level, each finding in this format:
   - `path:line`
   - rule id and short name
   - the problem and its failure mode
   - a one-line fix in the repo's idiom
   - the source of the rule when adapted from outside
4. Looks good: conventions the diff already follows.

A clean diff gets a plain statement that it is clean. Invent no nits. Never recommend removing a security control, resource limit or input validation to make something leaner.

Done when every finding has all five fields.

## 7. Offer output options

Three choices, in this order:

1. Report only (default). Nothing is written.
2. `--fix` applies only safe mechanical changes: scoping an action, adding a tag, pinning a base image. Keep each edit small, check it with `git diff`, and leave judgment calls to the author.
3. `--comment` leaves inline PR comments. Word each as a question that carries a concrete fix, flag real blockers, and keep the count low.

Options 2 and 3 touch nothing outside the diff under review.

## Not a finding

- Anything `fmt`, `validate`, chart lint, template render, secret scanning, dependency audit or image CVE scanning already gates.
- Obvious placeholder ARNs, CIDRs and secrets in fixtures and examples.
- A documented deliberate deviation from convention.
- Untouched infra. Auditing it is scope creep.

Area-specific exemptions live in each reference file.
