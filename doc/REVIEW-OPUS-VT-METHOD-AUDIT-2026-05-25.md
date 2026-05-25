# REVIEW — Opus VT-Method Exhaustive Methodology Audit (2026-05-25)

**Verdict:** `PASS-WITH-FINDINGS`
**Reviewer:** opus-arq (Claude Opus 4.7 1M) — B≠A review of codex's correction
**Branch audited:** `codex/docs-decision-trigger-enforcement-2026-05-25` (dev-kit, read as-is)
**Canonical task:** `docs/ai-coordination/comms/TASK-VT-METHOD-EXHAUSTIVE-METHODOLOGY-AUDIT-2026-05-25.md` · **Long ref:** `doc/TASK-OPUS-VT-METHOD-EXHAUSTIVE-AUDIT-2026-05-25.md`
**Self-orientation applied:** `git fetch` + `switch` to target branch + `node tools/inbox.mjs opus` + read the **canonical comm** (not just the long-ref). Target layer confirmed: **SUPRA / L1-L2**; ViTo is incident context only, not the primary audit target.
**Method:** read VT-METHOD, CANON-DEVELOPMENT-PROCESS (L1), CANON-DECISION-DISPOSITION, codex's trigger fix (ADR-20260525 + diff), CANON-MULTI-AGENT-ORCHESTRATION, CONTEXT-LAYERING, AGENTS_UNIVERSAL/_METHODOLOGY, REVIEW-CALL-CHECKLIST, ADOPT, INBOX-FEED-ROADMAP, `tools/*.mjs`. Standard applied to every rule: **where read · when forced · what proves it · what check catches failure · who owns the fix.**

---

## 1. Can the branch merge as-is?

**Yes.** codex's correction is **correct and correctly placed**: the decision-capture trigger belongs in SUPRA (cross-product methodology, not a product memory patch), bound into the three right homes (VT-METHOD step 2, DECISION-DISPOSITION golden rule #6, AGENTS_UNIVERSAL). It fixes the originating incident (finding recorded but no ADR until the human asked).

Findings below are **adjacent holes the task asked me to surface** — none is a P0 that blocks merge. Two cheap P1 patches (**F3**, **F9**) are recommended in this same branch before merge; the rest are named follow-ups.

---

## 2. Answers to the 11 audit questions (evidence, not impression)

1. **Where does VT-Method still rely on human memory?** The trigger reduces it, but **enforcement** still relies on memory: the ADR says gates "can **later** detect" (`ADR-20260525…` L53). Until that check exists, a forgotten reflex is caught only by a human — the failure being fixed. → **F1**.
2. **Which "must" rules have no checklist/gate/template/enforcement?** Many (§"Rules without teeth"): NO-BRAIN-NO-WORK, status-message §5.1.A (lint *deferred*), memory-sediment §4, git-safety (~150 lines), the review-call checklist itself. → **F5**.
3. **Which decisions live in >1 normative place and can drift?** Routing front-matter ×4; inheritance/levels model ×4 + two hand-drawn path trees. → **F4**.
4. **Which rules sit in L2/L3 but should be inherited from SUPRA?** The trigger correctly rose to SUPRA. No mis-placed-downward rule. Inverse risk: L2 nearly duplicates L1 (F2). The **target-layer declaration** itself is a SUPRA rule that isn't enforced → **F9**.
5. **Too abstract to execute without asking Marcelo?** "slicing" is named (L1 §2) but **defined nowhere**; ceremony selection is qualitative. → **F2**.
6. **Discipline-only today, should become check later?** The trigger (F1), comm field-lint (roadmap step 3, unbuilt), status-message lint (§5.1.A deferred), security-gate (exists but **not wired** to pre-commit here). → **F1, F6**.
7. **Is the trigger correctly placed in SUPRA, or needs another binding layer?** **Correctly in SUPRA**, bound in 3 homes. Gap: no *check* binding yet; product binding (ViTo `ADR-031` #3) not cross-referenced from SUPRA → drift seam. → **F1**.
8. **Distinguishes finding / ADR / canon / task / research / strategy / impl?** **Yes, well** (L1 §3 hierarchy + §6 findings + DISPOSITION; codex ADR explicitly states *finding ≠ decision-record*). Strength to preserve.
9. **Cross-agent review tasks auditable for an indexer?** Partially — ADRs/reviews in Markdown index well, but review *verdicts* are free-text (not structured). → **F6**.
10. **Missing "stop and classify" triggers?** Covers dep/runtime/CDN/arch/contract/cross-tenant/security-data-auth-privacy/behavior-standard. **Omits "AI-assisted behavior"** (worker/model-driven), which the task lists and ViTo governs (Rule 5.b). → **F3 (cheap)**.
11. **Does every cross-agent governance task declare target = SUPRA L1/L2 / product L3 / both, so the receiver doesn't review the wrong layer?** **No — and it failed in practice this session.** The canonical comm now *does* (Recipient Self-Check L29-39 + "Target layer" L76-82), but: (a) the **long-ref** `doc/TASK-OPUS-…` lacked the Self-Check entirely; (b) the task front-matter has `repo:` but **no `target_layer:`/`ref_branch:` field**; (c) consequence — when relayed through a product-repo chat, the receiving agent (me) began orienting toward ViTo and needed a human correction to switch to SUPRA. The reflex isn't a *required, lintable field* yet. → **F9**.

---

## 3. Findings (ordered by severity)

| ID | Sev | Finding + Evidence (file:section) | Risk (failure class) | Fix | Enforcement | Owner |
|---|---|---|---|---|---|---|
| **F1** | **P1** | **Trigger is discipline-only; the catching check is "later"/undefined.** `ADR-20260525…` L51-54 ("gates can **later** detect…"); DISPOSITION §5 "does NOT require an automatic decision-capture tool". Product side (ViTo `ADR-031` #3) proposes the gate but SUPRA doesn't reference it. | Same incident recurs: agent skips reflex, no machine catches it, a human must. | Turn "later" into a **named proposed check**: `validate:governance` rule = PR adds/expands prod-dep/runtime/render/schema without an ADR ref in the diff → flag (advisory→blocking). Cross-link SUPRA ADR ↔ ViTo ADR-031 #3. | **PROPOSED CHECK** (name + owner, don't build yet — build-on-pain) | both |
| **F2** | **P1** | **`check-agent-context.mjs` — the one end-to-end gate guarding every fork — has no test of its own.** Only `inbox.mjs`/`feed.mjs` self-test. Violates the repo's OWN REVIEW-CALL-CHECKLIST control #4 ("gates must bite — feed a known-bad case"). | The single closed loop could silently stop biting (false GREEN) unnoticed — a broken gate that looks healthy. | Add a negative test: known-bad fixture (oversized root / parallel-constitution / planted secret) **must** make the smoke exit non-zero. | **PROPOSED CHECK** (test for the gate) | SUPRA |
| **F3** | **P1 (cheap)** | **Trigger omits "AI-assisted behavior".** `ADR-20260525…` Trigger list + VT-METHOD §2 + DISPOSITION #6 enumerate dep/runtime/CDN/arch/contract/cross-tenant/security but not worker/model-driven flow (task Q10; ViTo Rule 5.b governs it). | A new AI worker/assistant flow ships without a decision record — same class, fastest-growing surface. | **Add one line** to the trigger in all 3 homes: *"AI-assisted / model-driven behavior (new worker, assistant flow, extraction, model-chosen action)"*. | DISCIPLINE-ONLY (rides on F1's check) | both |
| **F9** | **P1 (cheap)** | **Cross-agent governance tasks don't force a target-layer declaration → receiver can audit the wrong layer.** Evidence: THIS session — task relayed through a product-repo chat without the Self-Check surfaced; receiving agent oriented toward ViTo and needed human correction to switch to SUPRA. Canonical comm front-matter has `repo:` but no `target_layer:`/`ref_branch:`; long-ref `doc/TASK-OPUS-…` lacked the Self-Check entirely. (codex already added the Self-Check + "Target layer" prose in the canonical comm — partial fix.) | Agent reviews/edits the wrong repo or Method layer (L3 product as if SUPRA) → wasted work + drift. The exact failure this very task nearly suffered. | Make `target_layer:` (`SUPRA-L1L2` / `product-L3` / `both`) + `ref_branch:` **REQUIRED** fields of the cross-agent task template; keep the Recipient Self-Check as a mandatory block. | **PROPOSED CHECK** (comm field-lint, roadmap step 3, asserts the fields exist) | SUPRA |
| **F4** | **P2** | **Normative duplication that can drift.** (a) Routing front-matter ×4: orchestration §5, §5.1, INBOX-FEED-ROADMAP L8-14, `inbox.mjs` docblock. (b) Inheritance/levels ×4 + two hand-maintained ASCII path-trees (`AGENTS_UNIVERSAL` L446-460, `AGENTS_METHODOLOGY` L118-131). | Rule and engine drift; a renamed file leaves stale trees; agents follow the wrong copy. | Declare the **code (`inbox.mjs`) the source** for the field set; docs link. One normative path-tree; others reference. | field-lint (step 3) covers (a); (b) = DISCIPLINE-ONLY | SUPRA |
| **F5** | **P2** | **L2 aspirational vs L1.** VT-METHOD 6 steps ≈ 80% of L1; nothing consumes L2; layering ADR says "execution pending"; `CANON-DEVELOPMENT-METHODOLOGY-001` is **cited but does not exist** (phantom); "slicing" undefined. | L2 that only renames L1 adds reading cost without value; phantom = debt; undefined "slicing" forces asking. | L2 carries **only the VibeThink binding** (its pillar table), points to L1 for the 6 steps. **Define "slicing" once** in L1 §2. Create or de-cite the phantom canon. | DISCIPLINE-ONLY | SUPRA |
| **F6** | **P3** | **Rules without teeth + unstructured review output.** NO-BRAIN-NO-WORK, status-message §5.1.A (lint deferred), memory-sediment §4, git-safety, the review-call checklist (control #9 demands "enforcement not authorship" yet the checklist has no gate). Review verdicts are free-text (Q9). | Hard to prove a "must" was honored; review closure not indexable. | Triage: keep judgment rules as discipline (build-on-pain); give teeth to status-message (deferred lint) + review verdict (small `verdict:`/`findings:` front-matter schema → indexable). | mix: PROPOSED CHECK + DISCIPLINE-ONLY | SUPRA |
| **F7** | **P3** | **Sediment in the neutral core.** `AGENTS_UNIVERSAL` Crisis Protocols (~200 lines) nothing references; `AGENTS_METHODOLOGY` cites `validate:*` scripts absent from the Dev-Kit. | Bloat obscures what's operative; agents trust a `validate:*` that isn't here. | Move Crisis Protocols to a referenced appendix; mark `validate:*` as product-bound examples. | DISCIPLINE-ONLY | SUPRA |
| **F8** | **P3** | **SessionStart inbox wiring not built** — the danza's payoff. `ADOPT` step 5 + INBOX-FEED-ROADMAP step 5 both admit it. | Danza under-delivers: agents don't auto-see items; human stays partial bus. | Build step 5 **only if the manual gap hurts** (build-on-pain). | PROPOSED (deferred to pain) | both |

---

## 4. Methodology gap matrix (the 5-question standard)

| Rule / mechanism | where read | when forced | proof artifact | check that catches failure | gap |
|---|---|---|---|---|---|
| Decision-capture trigger | VT-METHOD §2, DISPOSITION #6, AGENTS_UNIVERSAL | "before implementing" (prose) | the ADR/canon written | ❌ none ("later") | **F1** |
| Target-layer declaration on tasks | canonical comm Self-Check + "Target layer" | task authoring (prose, not a field) | the comm front-matter | ❌ no required field / no lint | **F9** |
| Layering smoke §6 | CONTEXT-LAYERING §6 + ADOPT step 4 | "GREEN before proceed" + CI | smoke output | ✅ `check-agent-context.mjs` via CI | gate itself untested (**F2**) |
| Routing front-matter | orchestration §5/§5.1 | on send | the comm front-matter | ⚠️ partial (engine parses; field-lint unbuilt) | **F4** |
| Status-message contract | orchestration §5.1.A | "self-check before sending" | the chat message | ❌ lint deferred | **F6** |
| Findings vs decision-record | L1 §6 + codex ADR | on anomaly vs decision | finding file / ADR | ❌ discipline | ok by design |

**Closed loops today: 1** (layering smoke). Everything else is discipline or deferred.

## 5. Rules without teeth (must-without-check)
NO-BRAIN-NO-WORK · "read AGENTS.md before task" · status-message §5.1.A (lint deferred) · comm routing rules (field-lint unbuilt) · **target-layer declaration (F9)** · cross-repo memory-sediment §4 · review-call checklist (no gate) · "use `comms:send` not hand-written .md" · git-safety (~150 lines) · `work/`-not-root · SessionStart inbox (unbuilt).

## 6. Good patterns to preserve
1. **Layering smoke = the model** — the only rule with all 5 elements, CI-reusable via `workflow_call`, fork doesn't copy the engine. **Replicate this shape for every new gate.**
2. **Engine tested once upstream, fork consumes verbatim** — scales without copy-drift.
3. **Security patterns single-source** (`comms-security-gate` exports → `comms-send` imports).
4. **Shared `normalizeRecipient`** (feed imports from inbox) — anti-drift at code level.
5. **Honesty-in-code** (`check-agent-context` Check 7 self-declares it's a heuristic).
6. **finding ≠ decision-record** (codex ADR) — the spine of the fix.
7. **The Recipient Self-Check in the canonical comm** (new) — exactly the right instinct for F9; make it a required field, not just prose.

## 7. Adoption plan

**Immediate docs patch (this branch, before merge):**
- **F3** — add "AI-assisted / model-driven behavior" to the trigger in the 3 homes (1 line each).
- **F9** — add `target_layer:` + `ref_branch:` as **required** fields to the cross-agent task template; promote the Recipient Self-Check from prose to a required block.
- **F1 seam** — one line in codex's ADR cross-referencing ViTo `ADR-031` #3 as the product binding.

**Follow-up tooling (named, build-on-pain — do NOT build preemptively):**
- `TASK: decision-capture check` (F1) — `validate:governance` dep/runtime/render/schema diff without ADR ref → flag. SUPRA names contract; ViTo implements (ADR-031 #3).
- `TASK: smoke self-test` (F2) — negative fixture for `check-agent-context.mjs`.
- `TASK: comm field-lint` (F4 + F9) — roadmap step 3; assert routing fields **and** `target_layer:` present.

**Product-repo sync points:**
- ViTo `ADR-031` is the product binding of this SUPRA trigger → keep aligned (cross-ref both ways).
- ViTo Rule 5.b (MECHANICAL-WORKER-DISCOVERY) is the product instance of the "AI-assisted behavior" trigger class (F3).

**Cleanup (P2/P3, own small PRs):** F5 (thin L2 + define slicing + phantom canon), F4(b) (single path-tree), F7 (sediment).

---

## 8. Non-scope honored
No product ViTo/XMS fix implemented. Methodology not rewritten. Nothing sealed (Marcelo seals). No heavy tooling added — every check is *proposed* with a justified gap, deferred to a pain signal per build-on-pain. ViTo audited only as incident context / L3 boundary check, not as primary Method. Branch left as found.

## 9. Re-review — commit `57c3bef` (codex closed F3 + F9)

Verified **empirically on the branch**, not by reading alone:

- **F3 ✅** — "AI-assisted / model-driven behavior" present in all 3 homes (VT-METHOD §2, DECISION-DISPOSITION #6, AGENTS_UNIVERSAL).
- **F9 ✅ — and it BITES.** `comms-send` now enforces governance fields for `task`/`review`/`audit`. Known-bad / known-good run:
  - task without `target_layer` → rejected, **exit 2** (`--target-layer is required`, `--ref-branch is required`, `body must include "## Recipient Self-Check"`).
  - invalid `target_layer=WRONG` → rejected (`must be one of: SUPRA-L1L2, product-L3, both`).
  - valid governance task → passes field validation.
  - non-governance `delivery` → **exit 0** (not over-eager).
  - *Beyond the ask:* the Recipient Self-Check is now an **enforced body requirement**, not just prose.
- **Cross-ref ✅** — trigger ADR references ViTo `ADR-031` #3 as the product binding (closes the F1 drift seam).
- `npm run check` PASS (codex) + this empirical gate test.

**Updated verdict: `READY-MERGE`.** The branch may merge as-is; no further patches are needed in it.

**One follow-up joins F2 (NOT blocking):** the new `comms-send` governance validation has **no automated regression test** — same class as F2 (a gate that bites today but isn't guarded against silently regressing). I bit it by hand; it should get a negative-fixture test in the **F2 follow-up**, not in this branch.

---

**END OF REVIEW — re-review verdict `READY-MERGE` (57c3bef closes F3 + F9, verified; F1/F2 + the F9 regression test remain named follow-ups, none blocking)**
