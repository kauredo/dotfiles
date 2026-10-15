# IAM and workload identity rules

Levels are defaults. Trace a caller-supplied resource list to its module output before judging it.

## Rules

- **Wildcards.** `*` in an Allow action or resource is P1. Highest risk is policy data passed through a module verbatim from the caller. Broad but not wildcard is P2.
- **PassRole.** Scope `iam:PassRole` to role ARNs and add an `iam:PassedToService` condition. Unscoped is P1.
- **Escalation actions.** Policy create, attach, put and version actions, and assume-role-policy updates. P1 on `*`, P2 when ARN-scoped.
- **OIDC web-identity trust.** Pin `:sub` to one namespace and ServiceAccount, and set `:aud` to `sts.amazonaws.com`. A trust without `sub` or `aud` is P1.
- **Pod Identity trust.** Principal `pods.eks.amazonaws.com`, with `aws:SourceArn` for the cluster and `aws:SourceAccount`. The statement allows both `sts:AssumeRole` and `sts:TagSession`. Gaps in the conditions are P1.
- **Region lock.** `aws:RequestedRegion` restricts the role. Global services (Route53, CloudFront, IAM and similar) are exempt, and the exemption needs a comment naming the service. A disabled lock on a non-global service is P2.
- **TLS deny.** Every workload policy carries a deny statement on `aws:SecureTransport` false. Missing on a new workload policy is P1 for roles that handle data, P2 otherwise.
- **ECR.** Pull-only actions, repository ARNs, and the auth token action registry-wide.
- **KMS.** Key ARNs. No `kms:*` on `*`.
- **Static keys.** `aws_iam_access_key`, IAM users for workloads, and secret keys in env or values are P1.
- **`ForAllValues:`.** Needs a companion `Null` check, or an empty request value passes vacuously. P2.
- **Mechanism consistency.** IRSA versus Pod Identity should follow the repo's split, app workloads one way and system add-ons the other. This is consistency only, P3.

## Not a finding

- A wildcard resource on actions that support no resource-level scoping, such as list-hosted-zones or the ECR auth token.
- Region lock off for a documented global service.
- A resources list left empty because the caller supplies it from a module output. Trace that first.
- Roles built through the repo's IRSA or Pod Identity modules. The module guarantees trust, region lock and TLS deny, so review only the allow statements.
