# Terraform and OpenTofu rules

Levels are defaults. Add the IAM reference when the diff defines a role or policy.

## Rules

- **Public ingress.** Open ingress to application or data ports needs an inline justification. Unexplained is P2. A public bucket or registry is P1.
- **Shared state.** Remote state is encrypted with a KMS key and uses the native lockfile, not DynamoDB. No local backend for shared infra. Unencrypted or unlocked shared state is P1.
- **Secrets.** `sensitive = true` hides output only; state still holds the plaintext. Pull secrets from the secret manager or SSM at apply. A committed secret is P1.
- **Destroys.** Any destroy or forced replacement that hits data-bearing resources (the state bucket, databases, KMS keys, EIPs) needs a note in the PR; without one, P2. Run a `plan -destroy` preview first.
- **`for_each` over `count`.** Distinct items use `for_each`, because renumbering with `count` destroys resources. P2.
- **Tags.** Tags come from one shared source and cover service, project, environment, owner, managed-by, cost centre and data classification. P3 if any are missing, P2 if data classification is wrong.
- **Versions.** A `versions.tf` per module, provider constraints, and a committed `.terraform.lock.hcl`. Provider bumps get their own PR. Missing versions or lockfile P3; a provider bump mixed into another change P4.
- **Security groups.** Separate rule resources over inline blocks. P3.
- **Variables.** Give every variable a description and a type. A typed object beats `map(any)`. No description or type: P3. `map(any)`: P4.
- **Names.** Role-descriptive. `this` or `main` is fine only on a singleton, P4 otherwise.
- **Apply discipline.** The plan was reviewed before apply.

## Not a finding

- `count` used as a 0 or 1 toggle.
- `this` or `main` on a true singleton.
- Egress to anywhere.
- Anything `fmt` or `validate` already catches.
