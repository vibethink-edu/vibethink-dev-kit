# 🔬 REVIEW (Opus advisor) — Agent-plane gate (§8.1)

- **Advisor:** Claude Opus (external review, requested by Marcelo).
- **Subject:** `CANON-DEVELOPMENT-PROCESS.md §8.1` (Dual-surface parity / agent-plane-by-design).
- **Date:** 2026-06-29.
- **Disposition:** **INCORPORATED** into §8.1 + `REFERENCE-AGENT-PLANE-STANDARDS-MAPPING.md` (same commit).
- **Status of §8.1:** PROPOSED → awaiting Marcelo's seal (now reflects this review).

---

## Verdict (Opus)

The idea (agent-plane-by-design, dual-surface parity) is **sound and ahead**. The gate as drafted
(spec-driven preflight over a **declaration**) was the **weak link**: it enforces intent, is
gameable, and risks ceremony.

## The four findings (all incorporated)

1. **Spec-driven preflight is the weakest of the "robust" options** — it checks what you *declare*,
   not what you *build*. **Fix:** declaration → **derivation** (generate the plane from the same
   contract/registry as the GUI; single-source → 2 projections; can't stub without breaking the
   human surface) **+ execution** (conformance probe / consumer-driven contract test exercises each
   verb live). *Declaration alone = theatre.*
2. **"Declare read+mutate+signal+discovery" is highly gameable** (read→`{}`, no-op mutate, signal
   that never fires). **Fix:** gate checks **execution per verb** + test-quality meta-check (happy +
   failure) + parity assertion (each GUI mutation has its agent mutation from the same registry).
3. **Schema-time trigger risks bureaucracy / false positives** → reflexive "no agent surface"
   rubber-stamp. **Fix:** trigger at the **capability boundary** (not raw schema), **default-infer**
   (derive for CRUD; block only on inference-fail/override), **risk-tier**, **net-value self-test**.
   **The "no agent surface" escape is the top gaming vector** → human/architect-approved, logged,
   audited, and **more expensive than complying**.
4. **Model gaps vs SOTA** (all added to §8.1): authz **per verb + per tenant**; **idempotency +
   concurrency** on mutate; **propose/dry-run**; **typed error contract**; **provenance/audit**;
   **rate/quota/metering**; read = **cursor/pagination/streaming**; **deprecation/sunset signalling**;
   **semantic discovery** (preconditions/side-effects/examples), not just structural.

## Standards-mapping challenge (incorporated into the reference)

- **Strong / load-bearing:** **MCP** (resources=read, tools=mutate, discovery) · **CloudEvents /
  AsyncAPI** (signal/observe) · **OpenAPI** (read/mutate contract + the derivation source). These
  three cover the 3 verbs + discovery cleanly.
- **Over-reached (demoted to exploratory):** **ACI/SWE-agent** (a CLI/text ACI for *code* agents, not
  a generic data-plane — a stretch); **VOIX / AXIS** (emerging, single-paper — the rate-limited
  auto-verification over-reached here). Cited as direction, not canon.

## Note on method

This is exactly why the review ran: our automated adversarial verification was rate-limited twice, so
an independent advisor pass was the right safety net. Findings 1–4 are accepted as the architect's
own position now, not merely relayed.

---

**VERDICT — devkit-architect:** `INCORPORATED` — §8.1 moved declaration → derivation+execution;
model completed; standards mapping corrected. Ready for Marcelo's seal.
