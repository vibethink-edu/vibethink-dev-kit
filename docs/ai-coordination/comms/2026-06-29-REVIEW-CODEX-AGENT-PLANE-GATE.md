# 🔬 REVIEW (Codex architect) — Agent-plane gate (§8.1)

- **Advisor:** Codex architect (external review, requested by Marcelo).
- **Subject:** `CANON-DEVELOPMENT-PROCESS.md §8.1` (agent-plane-by-design).
- **Date:** 2026-06-29.
- **Disposition:** **INCORPORATED** (same commit as the Opus review).
- **Converges with:** `2026-06-29-REVIEW-OPUS-AGENT-PLANE-GATE.md` (independent, same core verdict).

---

## Verdict (Codex)

**HOLD** to seal if it stays a "declarative preflight"; **PASS** if formulated as a
**contract-derived execution / conformance gate**. → Adopted: §8.1 now says *the preflight routes,
the conformance gate enforces.*

## Findings (all incorporated)

1. **Spec-driven preflight alone isn't the strongest enforcement** — validates intent, not existence.
   Strongest = capability registry → generated contract → executable conformance probe → contract
   tests in CI. *(Converges with Opus.)*
2. **read+mutate+signal+discovery is gameable** — blindaje: read returns real fixture-seeded data;
   mutate changes state + verifies effect/idempotency/conflict; signal observed by a real subscriber
   (not a "declared event"); discovery round-trips against live operations; "no agent surface"
   requires human approval + audit. *(Converges with Opus.)*
3. **Bureaucracy risk is raw schema-time triggering** — put it on the **capability boundary**
   (register/change a capability, surface, public action, event, workflow, domain architecture).
   CRUD → default-infer; internal/lab → advisory; tenant-visible/prod → hard block. *(Converges.)*
4. **SOTA nuances the model was missing (NEW — Codex-specific, now added):**
   - **Separate `observe` from `emit`** — emitting signals is a mutation with consequences, not an
     implicit permission of the observe plane.
   - **Workflow / intent recipes** — probably **Arazzo**; the plane is multi-step, not lone endpoints.
   - **Authorization per verb + tenant + actor delegation.**
   - **Version negotiation / deprecation visible to the agent.**
   - **Evidence/provenance as a conformance requirement.**
   - **Negative tests:** unauthorized, replay, stale version, invalid precondition.

## Standards (Codex primary sources)

Strong anchors: **MCP** (discovery/tool surface) · **CloudEvents + AsyncAPI 3.0** (observe) ·
**OpenAPI 3.1 + JSON Schema** (read/mutate) · **Arazzo** (workflows) · **Pact** (executed contract
tests). Reviewed ACI/AXIS/VOIX (consistent with the Opus demotion to exploratory).

## Key naming decision (flagged for Marcelo, adopted)

Seal it as a **contract-derived execution gate**, not "spec-driven preflight." Explicit wording now
in §8.1: **"the preflight routes, the conformance gate enforces."**

---

**VERDICT — devkit-architect:** `INCORPORATED` — observe/emit split, Arazzo workflows, actor
delegation, negative tests, and the execution-gate naming all land in §8.1. Two independent reviews
converged → high confidence. Ready for Marcelo's seal.
