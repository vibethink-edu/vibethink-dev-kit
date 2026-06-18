<!--
TEMPLATE — Production Readiness Review · standard: Google SRE PRR.
Bound by CANON-DOCUMENTATION-ARTIFACT-STANDARDS-001 §2 (Ship to prod). SUPERSEDES the house "PRDI"
(Plan de Revisión, Despliegue e Implementación) — a PRDI is a PRR; align to: state → gap → plan →
validation → ROLLBACK (the rollback section is what a house PRDI usually misses).
-->

# PRR — <service / release name> — YYYY-MM-DD

- **Service / release:** <what is shipping>
- **Owner:** <who> · **Reviewer:** <who signs off>
- **Verdict:** READY | NOT-READY | READY-WITH-CONDITIONS

## 1. State (what is shipping)

<Scope of this release: what changes reach production.>

## 2. Gap analysis

| Gap | Severity | Resolution before ship |
|---|---|---|
| <gap> | high/med/low | <how it's closed, or accepted with reason> |

## 3. Plan (deploy)

<Deploy steps, order, who runs them, the exact commands/gates.>

## 4. Validation (how we know it's healthy)

- **Pre-deploy:** build green, tests green, the gate(s) that must pass.
- **Post-deploy:** the smoke check / health endpoint / metric that proves success.
- **Monitoring & alerting:** what watches it; the alert that fires if it degrades.
- **Capacity & dependencies:** load expectations; upstream/downstream services it relies on.

## 5. Rollback (REQUIRED)

- **Trigger:** the condition under which we roll back.
- **Procedure:** the exact steps to revert (and how long it takes).
- **Data:** is rollback safe for data? (migrations reversible? forward-only?)
- **Verification:** how we confirm the rollback restored health.

## Sign-off

- [ ] Owner · [ ] Reviewer · [ ] Rollback rehearsed or reasoned-safe
