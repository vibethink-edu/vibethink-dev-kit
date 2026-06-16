# ADR-20260616-runtime-policy-engine

**Status:** PROPOSED — pending Principal Architect seal (merge of this PR = ACCEPTED)
**Date:** 2026-06-16
**Decider:** Marcelo (Principal Architect)
**Context source:** `knowledge/research/ORCHESTRATION-PRIOR-ART-2026-05-25.md` (omnigent entry, source-verified at clone `HEAD 5a8fd16`)

## Context

Prior-art research on **omnigent** (Apache-2.0, alpha) surfaced a pattern the dev-kit's
agnostic canon does **not** name: **runtime governance by policy-interception**.

Today the kit covers two adjacent things, but not this one:

- The **principle** behind allow/escalate: `CANON-MULTI-AGENT-ORCHESTRATION` §3 (the safety
  boundary — automate the machine-verifiable, escalate judgment) + §4 (the human keeps
  stop/redirect).
- A **static, harness-level allow/deny**: `CANON-CODER-ORCHESTRATION-001` §4 (prompt + allowlist)
  / §7 (the gates that bite — identity / destruction / secrets / arbitrary-exec NEVER allowlisted)
  + the `setup/templates/coder-permissions/` instrument (a `settings.local.json`: broad-allow Bash
  + airtight deny).

What is **missing** is a *runtime, stateful, composable engine*: interception at typed
enforcement points yielding `ALLOW/ASK/DENY`, composed across N policies with explicit
precedence, carrying session state (counters, risk score, cost), fail-closed. Our deny-list is a
flat prefix-match in a harness file; it has no state, no `ASK`-with-memory, no risk accumulation.

This ADR records the **decision to canonize that pattern as agnostic governance** —
extract-patterns-not-dependency (omnigent is alpha/pre-1.0; we reimplement, we do not adopt it).

## Decision (proposed)

1. **Adopt the runtime policy-engine pattern as an agnostic canon (L1 principle).**
2. **Placement — a NEW spine, `CANON-RUNTIME-POLICY-ENGINE`** (rather than folding it into
   `CANON-CODER-ORCHESTRATION-001`). Rationale: **different altitude.** CODER-ORCHESTRATION governs
   a *human-launched coder's static permission file*; this governs *runtime interception of any
   agent's actions*. The static allowlist of CODER-ORCHESTRATION becomes a sibling/consumer of this
   spine, not its host. (This is the point Marcelo seals by accepting; the alternative — fold-in — is
   recorded below.)
3. **Canonize (L1, the principle):** governance by interception at typed **enforcement points**
   (request / pre-LLM / tool-call / tool-result) → a verdict in `{ALLOW, ASK, DENY}`, composed
   across policies with **explicit precedence** (a DENY short-circuits; an ASK accumulates and
   **withholds side effects until approved**; ALLOW continues), carrying **session state**, and
   **fail-closed** (a broken policy denies, except an advisory/classifier-only policy).
4. **Name a starter set of agnostic policy primitives (L1/L2):** cost / capability-**tier
   downgrade-gate**, **model-tier routing**, **risk-score accumulation + escalation**,
   **working-dir / worktree gate**, **sandbox enforcement**, **rate-limit**; plus **policy
   config-surface via JSON Schema** (a policy self-describes its params for an admin UI).
5. **The concrete engine is L3.** The kit names the *pattern + contracts* (the verdict set, the
   enforcement points, the precedence rule, fail-closed, ASK-withholds-writes). Each product
   (ViTo / WorkBench) builds the actual engine as its L3 implementation. The kit ships no runtime.

## Alternatives considered

- **Fold-in** (amend `CANON-CODER-ORCHESTRATION-001` with a "runtime policy layer" section):
  viable and lower-ceremony, but conflates two altitudes (static coder permission file vs runtime
  interception engine). **Rejected-lean**, but it is a genuine judgment call and is Marcelo's to
  flip on accept.
- **Do nothing** (keep the static allow/deny + prose rules): rejected — leaves the
  runtime-governance gap that a flat harness allowlist structurally cannot cover (no state, no
  ASK-with-memory, no risk accumulation, no model-tier enforcement at runtime).

## Consequences

- A new agnostic spine to maintain (+ a catalog piece in `setup/ADOPT-DEV-KIT.md`, + later an
  instrument/gate if warranted — each its own gate).
- ViTo / WorkBench gain a **named target** to build a real policy engine against, instead of
  scattered per-route guards and prose rules.
- **Vendor scrub required** when drafting the canon: omnigent's defaults name specific model tiers
  in code — the canon names *tiers/capabilities*, never vendor model ids.

## Scope guard (what this ADR does NOT do)

- Does **not** seal any canon (this ADR is PROPOSED; the spine is not yet drafted).
- Does **not** lift omnigent's multi-device / co-attach / cloud-sandbox / runtime-swap — those are
  product/infra concerns outside the dev-kit's markdown+CLI scope.
- Creates **no dependency** on omnigent.

## Next step on ACCEPT

Draft `CANON-RUNTIME-POLICY-ENGINE` (status DRAFT → PROPOSED) + register its catalog piece (with a
seal-pending exemption in `catalog-sync.config.json`, the same way other DRAFT spines are handled)
+ decide which primitives ship in v1. A `DECISION-REGISTER` row is added when this ADR is sealed.
