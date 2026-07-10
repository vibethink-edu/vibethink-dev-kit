# REVIEW-ADVERSARIAL — CANON-AGENT-COLLABORATION §2.4 "Review Harvest" (D-064, kit PR #250)

**Reviewer:** Fable (devkit-rev — independent architect-validator; did not author the amendment)
**Round:** light adversarial (collaboration principle, not a deletion/security flow), per `CANON-AUDIT-PROTOCOL §9`
**Object:** kit PR #250, branch `claude/canon-review-harvest-cadence` — new `CANON-AGENT-COLLABORATION §2.4` (DRAFT), header amendment note, D-064 register row, SUPRA-MAP edge.
**Date:** 2026-07-10

---

## VERDICT: REQUEST-CHANGES (1 MAJOR · 1 MEDIUM · 2 MINOR)

The generalization claim is genuine (not duplication), the home is correct, §2.3-coherence holds, and the §2.4 body passes the fire-test. But the mirror safeguard — the one clause whose failure has governance consequence — is internally contradicted by the harvest procedure it is supposed to bound, and the down-pointer makes a factual claim that is false today. Apply MAJOR-1 (both edits) + MEDIUM-1 to flip to APPROVE; MINORs at the builder's discretion. A diff check suffices if applied verbatim (no full re-round needed — light round).

All line references are to `knowledge/methodology/CANON-AGENT-COLLABORATION.md` at `claude/canon-review-harvest-cadence` unless a `master` file is named.

---

## V1 — Duplication vs generalization: NOT duplication (net-new confirmed) · 1 MINOR

- `CANON-CODER-ORCHESTRATION-001 §8` (master :110-121) is the **gate arm only**, scoped to the coder lane: an *executor* stops-and-presents to the *coordinator* before boundary-class code. It says nothing about batching the human's review feedback.
- `§9` (master :125-131) is **dependency-driven wave shape** (depend → sequential; independent → fan-out). The "human per-wave review cost" lives in **§9.1 criterion (6)** (master :139), not §9 proper — and it is a wave-membership criterion, not a cadence rule.
- `CANON-MULTI-AGENT-ORCHESTRATION §3.3` (master :387-420) is **tier routing** (spend the high tier on judgment, dispatch closed contracts). Silent on how often the human is interrupted.
- `AGENT-COLLABORATION §2.3` (:45-55) is **single-instruction completeness**, not session cadence.

None of the four names the general cadence-follows-work-type rule; none contains the 5-step harvest procedure (:64) or the mirror safeguard (:66). §2.4 is net-new as the named general principle. The builder's "~60% dispersed, not named" claim is accurate.

- **MINOR-1** — the down-pointer (:68) attributes "batch independent units so the human's per-wave review cost is acceptable" to **§9**; that clause is §9.1(6). Fix: cite "`§9/§9.1`".
- *Observation (optional):* §2.1's own table row — "Execute the whole block until the next **real** decision point" (:39) — is the in-canon seed of §2.4. A one-clause cross-cite would strengthen internal lineage.

## V2 — Home: CORRECT, but one false factual claim · 1 MEDIUM

- `AGENT-COLLABORATION` scope (:5) = AI-agent ↔ **human authority**. `MULTI-AGENT-ORCHESTRATION` scope (master :3) = more than one agent (agent↔agent handoff; the human appears as a judgment-gate router, master :27). §2.4 regulates the **human's** interruption/review cadence — squarely human↔agent. The harvest requires no second agent; nothing in it is orchestration mechanics. Placement adjacent to §2.3, which it explicitly generalizes, is structurally right. The home correction is sound and complete — the batch/harvest is the human's review loop, not wave dispatch (which stays in CODER-ORCH §9).
- **MEDIUM-1** — the down-pointer asserts "**they reference up**, this does not restate them" (:68). **False today:** CODER-ORCH §8 references MULTI-AGENT §2 (master :119), not this section; §9/§9.1 and MULTI-AGENT §3.3 contain no upward reference to §2.4 (they predate it, and PR #250 does not amend them). A reader following the claim to those canons finds nothing. Fix (exact): replace "they reference up, this does not restate them" with "**the reference direction is instance→principle — this section does not restate them; the scoped instances gain their up-pointer at their next own amendment, not here**" — or simply delete "they reference up".

## V3 — Mirror safeguard: INSUFFICIENT AS WRITTEN — internal contradiction licenses the exact failure it exists to block · 1 MAJOR + 1 MINOR

- The gate arm (:61) defines gate work as "**decisions**, approvals, governance, irreversible or outward-facing actions" — "decisions" **unqualified**. Yet the same quote block licenses "grouping questions and asking only for **what genuinely needs a decision**" (:61), and harvest step (4) says the agent "surfaces the grouped questions **once**, only for items that **need a human decision**" (:64). So an item "needing a human decision" is simultaneously (a) gate work → interactive, one at a time, never batched (:61, :66) and (b) the designated content of the batched, surfaced-once question group (:61, :64).
- Both exploit directions are live: an agent can classify a governance approval as "a grouped question" and bury it in a 12-item pile the human rubber-stamps (**the dangerous direction — a decision slips past the human**, precisely what the safeguard claims to prevent); or ping-pong every trivial tie-break as "a decision → gate", defeating the harvest. "When unsure, treat as a gate" (:66) does not repair this: under the current text the agent is *not* unsure — step (4) affirmatively instructs that decision-needing questions group.
- **MAJOR-1** — fix with two edits (exact wording):
  1. Quote block (:61): "...grouping questions and asking only for what genuinely needs a decision" → "...grouping **delegation-scoped questions** (reversible tie-breaks inside the delegated work) and asking only for those".
  2. Mirror-safeguard bullet (:66), append: "**The step-(4) question group may contain only delegation-scoped choices — reversible tie-breaks inside work already delegated, undoable within the same reviewable unit. An item whose answer changes scope, authority, spend, permissions, or anything irreversible or outward-facing exits the harvest and presents alone, as a gate.**"
- **MINOR-2** (optional hardening) — classification is agent-self-judged with no watcher named. One clause suffices, matching the family pattern (MULTI-AGENT §3.3 closes by naming its watchers, master :418-420): "**A gate discovered mis-batched in review is a §7.2 recalibration signal.**"

## V4 — Coherence with §2.3 and one-at-a-time governance: COHERENT (post-V3-fix)

- No §2.3 contradiction: §2.3 forbids fragmenting **one whole instruction** into incremental rounds (:51); §2.4 forbids fragmenting the **session's execution flow**, and self-identifies as "the §2.3 fragmentation failure at the *session* scale" (:65). Same anti-ping-pong direction at two scales — they compose.
- The gate arm **reinforces** present-and-wait one-at-a-time governance: it matches §5.3's one-proposal preflight (:174-181) and CODER-ORCH §9.1's "present it as a decision... proceed on GO" (master :141). The only incoherence found anywhere is the internal one filed as MAJOR-1 (V3) — which, uncorrected, would be the contradiction with the one-at-a-time law.

## V5 — Fire-test (§2.4 body only): PASS

- :57-68 name no product, vendor, model, or person. Canon cross-references only. (The vendor list at :5 is pre-existing grandfathered Scope text — outside this round's remit per the mandate.)

---

## Conditions to APPROVE

Apply **MAJOR-1** (both edits, verbatim or equivalent) + **MEDIUM-1**. MINOR-1/MINOR-2 at builder's discretion. Seal remains Marcelo's alone.
