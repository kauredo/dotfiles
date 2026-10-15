# Helm and Kubernetes rules

Levels are defaults. Read the base chart before judging an override: a control missing in the base is a bigger problem than one loosened in a single environment.

## Rules

- **Security context baseline.** `runAsNonRoot`, no privilege escalation, drop ALL capabilities, `RuntimeDefault` seccomp, no host namespaces, `privileged: false`, ServiceAccount token automount off. A regressed privileged setting is P1.
- **Sidecars and init containers.** They inherit nothing. Each carries its own security context and its own resources. P2.
- **Requests and limits.** Every container has both, within the namespace LimitRange and ResourceQuota. Missing is P2.
- **Immutable image tags.** No `latest`, `main` or `stable`, and no dropped tag that falls back to `appVersion`. Digests are preferred. `pullPolicy: IfNotPresent` makes a moving tag worse. `latest` in prod is P1; a moving tag in non-prod is P2.
- **Secrets.** Referenced through `secretRef`, `secretKeyRef` or `existingSecret`, never inline. Connection strings that embed credentials count. Inline secret is P1.
- **Cloud-role annotation.** The ServiceAccount annotation matches the namespace, ServiceAccount and the IaC module's naming. A workload that calls cloud APIs with no annotation falls back to node credentials. A mismatched binding is P2.
- **Ownership and classification metadata.** Present and correct for this workload. A wrong value passes render, so read the values. Wrong is P2, missing P3.
- **ServiceAccount annotations.** Purpose, reviewer and review date are current. Stale is P4.

## Not a finding

- A workload with no cloud calls that carries a blank role annotation.
- `readOnlyRootFilesystem: false` alone, when it is the base chart default and a temp volume is mounted.
- Placeholder values in chart examples.
