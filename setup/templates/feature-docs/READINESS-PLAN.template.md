<!--
  READINESS-PLAN skeleton — instance of CANON-DEVELOPMENT-PROCESS §5 (readiness/deployment plan)
  + §5.2 (the plan carries security concerns BEFORE it can be approved to execute).
  Role: HOW this unit ships, and the security gate it must pass first.
  Copy, rename to your repo's convention, delete these guidance comments.
-->
# Readiness & deployment plan — <unit / feature name>

> **Status:** <draft | approved-to-execute>  ·  **Approver:** <named authority>  ·  **Date:** <YYYY-MM-DD>
> A plan without the §5.2 security-concerns section below is **not approvable**.

## 1. Implementation outline

<The slices, in order. Each slice: one boundary, independently verifiable, shippable on
its own. Note dependencies between slices.>

## 2. Verification strategy

<How each slice is proven: the tests, the checks, the manual verification. "No test =
not done" — name the testable units and the failure mode each test covers.>

## 3. Rollout / deployment

<How it reaches its environment: migrations, flags, sequencing, the version it ships as
(link the CHANGELOG entry + the versioning binding), and the health/version check that
confirms the deploy.>

## 4. Rollback

<How to undo if it goes wrong, and the signal that says "roll back".>

## 5. Security concerns (CANON-DEVELOPMENT-PROCESS §5.2 — required before approval)

> One row per concern. Severity drives sequencing: **critical** resolves before any code
> lands · **high** before merge · **medium** before deploy · **low** is tracked.
> Cover at minimum: authentication, secrets, injection / user-content handling, data
> isolation, third-party dependencies + license posture, sensitive-data flow.

| Concern | Severity | Status | Mitigation |
|---|---|---|---|
| <e.g. auth on the new route> | <critical/high/medium/low> | <open/mitigated> | <how> |

**Upstream audit** (required when this unit imports or forks external code):
- [ ] no hardcoded secrets introduced
- [ ] no license violation (record the license + posture)
- [ ] no known-vulnerable dependency added
- [ ] any replaced/forked surface recorded

## 6. Examples (CANON-DEVELOPMENT-PROCESS §5.1)

<A concrete walked-through deploy + a concrete rollback scenario.>
