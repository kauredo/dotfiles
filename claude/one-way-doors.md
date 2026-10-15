# One-way doors

A change is a one-way door when undoing it after it ships is slow, expensive, or impossible. A revert of the commit does not bring the old state back. Two-way changes (a UI tweak, a pure function, a flag-gated read path) need no special care. One-way changes get named in the PR and the review, with the rollback story written down.

## Standing categories

- **Persisted data and schema.** Dropping or retyping a column, backfills, changing what a field means. Reverting the code leaves the migrated rows behind.
- **Auth and permissions.** Widening a role, changing token lifetimes, moving a check. A user who got access during the window keeps what they saw.
- **Outbound side effects.** Emails, payments, webhooks, writes to third-party systems. A sent email or a charge cannot be recalled.
- **Public contracts.** API response shapes, URLs, event payloads, CLI flags. Once a client depends on one, renaming it breaks them.
- **Infrastructure and DNS.** Changing a domain, a region, a queue name, a bucket. Propagation and cached records outlive the revert.
- **Deletions.** Removing rows, files, accounts, or backups with no copy elsewhere.

## Blast radius

Blast radius is what breaks, and for whom, if this change is wrong. Name the people or systems (all users, one tenant, an internal job) and how fast you would notice.

## How to flag one

Say which category it falls in, what the failure looks like, and how you would undo it (or that you cannot). A one-way change with no rollback plan is a finding, not a note.
