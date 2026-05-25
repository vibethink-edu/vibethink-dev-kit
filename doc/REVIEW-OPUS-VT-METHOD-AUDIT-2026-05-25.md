# REVIEW — Opus VT-Method Exhaustive Methodology Audit (2026-05-25)

**Verdict:** `PASS-WITH-FINDINGS`
**Reviewer:** opus-arq (Claude Opus 4.7 1M) — B≠A review of codex's correction
**Branch audited:** `codex/docs-decision-trigger-enforcement-2026-05-25` (read as-is)
**Task:** `doc/TASK-OPUS-VT-METHOD-EXHAUSTIVE-AUDIT-2026-05-25.md`
**Method:** read VT-METHOD, CANON-DEVELOPMENT-PROCESS (L1), CANON-DECISION-DISPOSITION, the codex trigger fix (ADR-20260525 + diff), CANON-MULTI-AGENT-ORCHESTRATION, CONTEXT-LAYERING, AGENTS_UNIVERSAL/_METHODOLOGY, REVIEW-CALL-CHECKLIST, ADOPT, INBOX-FEED-ROADMAP, `tools/*.mjs`. Standard applied to every rule: **where read · when forced · what proves it · what check catches failure · who owns the fix.**

---

## 1. Can the branch merge as-is?

**Yes.** codex's correction is **correct and correctly placed**: the decision-capture trigger belongs in SUPRA (it is cross-product methodology, not a product memory patch), and it is bound into the three right homes (VT-METHOD step 2, DECISION-DISPOSITION golden rule #6, AGENTS_UNIVERSAL). It directly fixes the originating incident (finding-recorded-but-no-ADR-until-human-asked).

The findings below are **adjacent holes the task asked me to surface** — none is a P0 that blocks this merge. **One P1 (F3) is cheap enough to patch in this same branch** before merge; the rest are named follow-ups.

---

## 2. Answers to the 10 audit questions (evidence, not impression)

1. **Where does VT-Method still rely on human memory?** The trigger now *reduces* this (good), but the **enforcement** still relies on memory: the ADR itself says gates "can **later** detect" (`ADR-20260525…` L53). Until that check exists, an agent that forgets the reflex is caught only by a human — the exact failure being fixed. → **F1**.
2. **Which "must" rules have no checklist/gate/template/enforcement?** Many (see §"Rules without teeth"): NO-BRAIN-NO-WORK, status-message contract §5.1.A (lint *deferred by design*), cross-repo memory-sediment §4, git-safety (~150 lines), the review-call checklist itself. → **F5**.
3. **Which decisions live in >1 normative place and can drift?** Routing front-matter ×4 (orchestration §5, §5.1, INBOX-FEED-ROADMAP, `inbox.mjs` docblock); inheritance/levels model ×4 + two hand-drawn path trees. → **F4**.
4. **Which rules sit in L2/L3 but should be inherited from SUPRA?** The trigger correctly rose to SUPRA. No mis-placed-downward rule found — the layering (L1 neutral / L2 VT bind / L3 product) is sound. (One inverse risk: see F2 — L2 nearly duplicates L1.)
5. **Which rules are too abstract to execute without asking Marcelo?** "slicing" is used everywhere but **defined nowhere** (L1 §2 names it; no operational definition); methodology-choice ceremony is described qualitatively. → **F2**.
6. **Which parts are discipline-only today but should become lint/check/gate later?** The trigger (F1), the comm field-lint (roadmap step 3, not built), the status-message lint (§5.1.A deferred), the security-gate (exists but **not wired** to pre-commit in this repo). → **F1, F6**.
7. **Is the new trigger correctly placed in SUPRA, or does it need another binding layer?** **Correctly in SUPRA.** It is bound in 3 homes. Gap: it has no *check* binding yet, and the product binding (ViTo `ADR-031` #3 proposes the gate) is not cross-referenced from SUPRA → drift risk between the two. → **F1**.
8. **Does it distinguish finding / ADR / canon / task / research / strategy / implementation?** **Yes, well.** L1 §3 hierarchy (canon>spec>strategy>research) + §6 findings + DECISION-DISPOSITION; codex's ADR explicitly states *finding ≠ decision-record* (`ADR-20260525…` "Alternatives rejected: Finding only"). This is a strength to preserve.
9. **Are cross-agent review tasks auditable for a future indexer?** Partially. ADRs/reviews in Markdown are indexable (DECISION-DISPOSITION §2, verified 2026-05-22). But review *verdicts* are free-text (REVIEW-CALL-CHECKLIST output is prose, not structured) → harder to index/track to closure. → **F6**.
10. **Missing "stop and classify" triggers?** The trigger list covers dependency, runtime, CDN/font/render, architecture, contract, cross-tenant, security/data/auth/privacy, behavior-standard. **It omits "AI-assisted behavior"** (worker / model-driven flow) — which the task explicitly lists and which the product repo already governs separately (ViTo `CANON-MECHANICAL-WORKER-DISCOVERY` / Rule 5.b). → **F3 (cheap patch)**.

---

## 3. Findings (ordered by severity)

| ID | Sev | Finding + Evidence (file:section) | Risk (failure class) | Fix | Enforcement | Owner |
|---|---|---|---|---|---|---|
| **F1** | **P1** | **Trigger is discipline-only; the catching check is "later"/undefined.** `ADR-20260525-decision-capture-trigger-enforcement.md` L51-54 ("Governance gates can **later** detect dependency/runtime diffs without an ADR reference"); DECISION-DISPOSITION §5 "does NOT require an automatic decision-capture tool. Discipline first." Product side (ViTo `ADR-031` #3) *proposes* the gate but SUPRA doesn't reference it. | The same incident recurs: an agent skips the reflex, no machine catches it, a human must. Exactly the failure being fixed. | Turn "later" into a **named proposed check** with an owner: a `validate:governance` rule = *PR adds/expands a production dep, runtime, render source, or schema without an ADR reference in the diff → flag (advisory→blocking)*. Cross-link SUPRA ADR ↔ ViTo ADR-031 #3 as the product binding. | **PROPOSED CHECK** (don't build yet — build-on-pain; but name it + owner so it's not "later") | both (SUPRA names the check contract; product implements) |
| **F2** | **P1** | **`check-agent-context.mjs` — the one end-to-end gate that guards every fork — has no test of its own.** Only `inbox.mjs`/`feed.mjs` self-test (32/32, 6/6). This violates the repo's OWN REVIEW-CALL-CHECKLIST control #4 ("gates must bite — feed it a known-bad case"). | The single closed enforcement loop could silently stop biting (false GREEN) and nobody would know — a broken gate that looks healthy is the worst kind. | Add a negative test: a known-bad fixture (oversized root / parallel-constitution / planted secret) **must** make the smoke exit non-zero. | **PROPOSED CHECK** (a test for the gate) | SUPRA |
| **F3** | **P1 (cheap)** | **Trigger omits "AI-assisted behavior".** `ADR-20260525…` "Trigger" list + VT-METHOD step 2 + DECISION-DISPOSITION rule #6 enumerate dep/runtime/CDN/arch/contract/cross-tenant/security — but not worker/model-driven behavior, which the task Q10 lists and the product already governs (ViTo Rule 5.b MECHANICAL-WORKER-DISCOVERY). | A new AI worker/assistant flow ships without a decision record — same class as the originating incident, in the fastest-growing surface. | **Add one line** to the trigger list in all 3 homes: *"AI-assisted / model-driven behavior (new worker, assistant flow, extraction, model-chosen action)"*. | DISCIPLINE-ONLY (rides on F1's future check) | both |
| **F4** | **P2** | **Normative duplication that can drift.** (a) Routing front-matter defined ×4: orchestration §5 table, §5.1 "backing fields", INBOX-FEED-ROADMAP L8-14, `inbox.mjs` docblock L16-32. (b) Inheritance/levels model ×4 + two hand-maintained ASCII path-trees (`AGENTS_UNIVERSAL` L446-460, `AGENTS_METHODOLOGY` L118-131). | Rule and engine drift apart; a renamed file leaves stale trees; agents follow the wrong copy. | Declare the **code (`inbox.mjs`) the source** for the field set; docs link, don't re-list. Keep ONE normative path-tree; others reference it. | the field-lint (roadmap step 3) covers (a) when built; (b) = DISCIPLINE-ONLY | SUPRA |
| **F5** | **P2** | **L2 aspirational vs L1.** VT-METHOD's 6 steps ≈ 80% of L1 CANON-DEVELOPMENT-PROCESS; nothing consumes L2 (no tool/gate); its own layering ADR says "execution pending". `CANON-DEVELOPMENT-METHODOLOGY-001` is cited (layering ADR) but **does not exist** (phantom canon). "slicing" used everywhere, defined nowhere. | An L2 that only renames L1 adds reading cost without operational value; phantom canon = debt; undefined "slicing" forces agents to ask. | Make L2 carry **only the VibeThink binding** (the table at VT-METHOD §"L1 pillars bound"), not a re-narration of the 6 steps; point to L1 for the process. **Define "slicing" once** in L1 §2 (1 paragraph). Create or de-cite the phantom canon. | DISCIPLINE-ONLY | SUPRA |
| **F6** | **P3** | **Rules without teeth + unstructured review output.** NO-BRAIN-NO-WORK, status-message §5.1.A (lint deferred), memory-sediment §4, git-safety (~150 lines), the review-call checklist (control #9 demands "enforcement not authorship" yet the checklist itself has no gate). Review verdicts are free-text (Q9). | Hard to know a "must" was honored; review closure not trackable by a future indexer. | Triage each: *keep as discipline* (build-on-pain — e.g. memory-sediment, learn-before-automate) vs *give teeth* (status-message → the deferred lint; review verdict → a small front-matter `verdict:`/`findings:` schema so it's indexable). | mix: PROPOSED CHECK (status lint, verdict schema) + DISCIPLINE-ONLY (judgment rules) | SUPRA |
| **F7** | **P3** | **Sediment in the neutral core.** `AGENTS_UNIVERSAL` Crisis Protocols (~200 lines, generic 0-5min timings) nothing references; `AGENTS_METHODOLOGY` cites `validate:*` scripts that don't exist in the Dev-Kit. | Bloat obscures what is operative; agents trust a `validate:*` that isn't here. | Move Crisis Protocols to a referenced appendix or product layer; mark `validate:*` as product-bound examples. | DISCIPLINE-ONLY | SUPRA |
| **F8** | **P3** | **SessionStart inbox wiring not built** — the payoff of the whole danza. `ADOPT` step 5 + INBOX-FEED-ROADMAP step 5 both admit it ("Honest status: per-harness SessionStart wiring is the activation step"). | The danza under-delivers: agents don't auto-see their items; the human stays partial bus. | Build step 5 **only if the manual gap hurts** (build-on-pain). If it hurts now, it's the highest-value tooling slice. | PROPOSED (deferred to pain signal) | both |

---

## 4. Methodology gap matrix (the 5-question standard)

| Rule / mechanism | where read | when forced | proof artifact | check that catches failure | gap |
|---|---|---|---|---|---|
| Decision-capture trigger (codex fix) | VT-METHOD §2, DISPOSITION #6, AGENTS_UNIVERSAL | "before implementing" (prose) | the ADR/canon written | ❌ none ("later") | **F1** |
| Layering smoke §6 | CONTEXT-LAYERING §6 + ADOPT step 4 | "GREEN before you proceed" + CI | smoke output | ✅ `check-agent-context.mjs` via CI | gate itself untested (**F2**) |
| Routing front-matter | orchestration §5/§5.1 | on send | the comm front-matter | ⚠️ partial (engine parses; field-lint not built) | **F4** |
| Status-message contract | orchestration §5.1.A | "self-check before sending" | the chat message | ❌ lint deferred | **F6** |
| Findings vs decision-record | L1 §6 + codex ADR | on anomaly vs decision | finding file / ADR | ❌ discipline | ok by design |
| Comms safety (secrets) | `comms-security-gate.mjs` | if agent uses `comms:send` | clean send | ⚠️ not wired to pre-commit here | **F4/F6** |

**Closed loops today: 1** (layering smoke). Everything else is discipline or deferred.

## 5. Rules without teeth (must-without-check)
NO-BRAIN-NO-WORK · "read AGENTS.md before task" · status-message §5.1.A (lint deferred) · comm routing rules (field-lint = roadmap step 3, unbuilt) · cross-repo memory-sediment §4 · review-call checklist (10 controls, no gate) · "use `comms:send` not hand-written .md" · git-safety (~150 lines) · `work/`-not-root file-org · SessionStart inbox (unbuilt).

## 6. Good patterns to preserve
1. **Layering smoke = the model** — the only rule with all 5 elements (where+when+proof+check+owner), CI-reusable via `workflow_call`, fork doesn't copy the engine. **Replicate this shape for every new gate.**
2. **Engine tested once upstream, fork consumes verbatim** (`agent-context.yml` + ADOPT golden rule) — scales without copy-drift.
3. **Security patterns single-source** (`comms-security-gate` exports → `comms-send` imports) — zero drift between what blocks and what warns.
4. **Shared `normalizeRecipient`** (feed imports from inbox) — anti-drift at code level.
5. **Honesty-in-code** (`check-agent-context` Check 7 self-declares it's a heuristic, not a secret scanner) — claim = mechanism.
6. **finding ≠ decision-record distinction** (codex ADR) — keep; it's the spine of the whole fix.

## 7. Adoption plan

**Immediate docs patch (this branch, before merge):**
- **F3** — add "AI-assisted / model-driven behavior" to the trigger list in the 3 homes (1 line each). Cheap, closes a listed gap.
- Add to codex's ADR a one-line cross-reference to ViTo `ADR-031` #3 as the product binding of the future check (closes the F1 drift seam at zero cost).

**Follow-up tooling (named, build-on-pain — do NOT build preemptively):**
- `TASK: decision-capture check` (F1) — `validate:governance` rule: dep/runtime/render/schema diff without ADR ref → flag. SUPRA names contract; ViTo implements (aligns ADR-031 #3).
- `TASK: smoke self-test` (F2) — negative fixture for `check-agent-context.mjs`.
- `TASK: comm field-lint` (F4) — roadmap step 3, already planned.

**Product-repo sync points:**
- ViTo `ADR-031` (capture & enforcement) is the product binding of this SUPRA trigger — they must stay aligned; this review recommends the cross-reference both ways.
- ViTo Rule 5.b (MECHANICAL-WORKER-DISCOVERY) is the product instance of the "AI-assisted behavior" trigger class (F3).

**Cleanup (P2/P3, own small PRs):** F5 (L2 thinning + define slicing + phantom canon), F4(b) (single path-tree), F7 (sediment).

---

## 8. Non-scope honored
No product ViTo/XMS fix implemented here. Methodology not rewritten. Nothing sealed (Marcelo seals). No heavy tooling added — every check is *proposed* with a justified gap, deferred to a pain signal per build-on-pain. Branch left as found.

**END OF REVIEW — `PASS-WITH-FINDINGS` (branch may merge; F3 recommended as same-branch patch; F1/F2 as named follow-ups)**
