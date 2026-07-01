# CANON-TESTING-GATE — Selecting the verification type by complexity × stakes (universal · agent-agnostic)

> **Scope:** every repo that produces changes needing verification — human- or agent-authored.
> Vendor-neutral, product-neutral, tool-neutral.
> **Status:** SEALED 2026-06-05 by the Principal Architect — agnostic-lift seal sweep ("SEAL DALE"). Fire-test passed. (Independent of a product-side vitest-80% decision, which this gate does not impose — "no %-global-coverage".)
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Siblings:** `CANON-TESTING-MINIMUM-BAR` (the floor + the unit row — referenced, not rewritten) · `CANON-ARCHITECTURE-REVIEW` (the independent advisor the Gate escalates to) · the mutation-testing lens companion (when adopted).

---

## §1 — Root principle

> **Tests are never optional. The question is never "test or not" — it is "which type, how deep, for these stakes." The Testing Gate is the 60-second decision that answers it: it maps a change's *nature × stakes* to the verification type(s) required.**

This dissolves the false rivalry between "unit testing" and "contract testing" and "UAT": they are not competing doctrines — they are **types the Gate selects between**. The same change might need a unit test (cheap floor), a contract test (does it honour what the canon/spec promised), a smoke (does it load), or a UAT (does the human flow work) — depending on what it touches and what is at risk.

This is where the state of the art converges: verification depth is **calibrated to risk** (low-trust for complex/unfamiliar work, lighter for trivial/familiar) — not a fixed threshold applied uniformly.

---

## §2 — The two questions (60 seconds, before GO)

1. **What does the change touch?** — pure logic · canon/spec-governed behaviour · external-data integration · CLI/script · UI surface · AI/model-driven behaviour · end-to-end flow.
2. **What are the stakes?** — internal/mechanical (low) vs. money / security / canon / demo / tenant-facing (high).

The answers select the cell(s) in §3. If the two questions cannot be answered, the design is not ready (same discipline as the pre-GO check in `CANON-TESTING-MINIMUM-BAR`).

---

## §3 — The selection matrix

| Change nature | Low stakes (internal / mechanical) | High stakes (money / security / canon / demo / tenant-facing) |
|---|---|---|
| **Pure logic** (functions w/ conditional logic) | Unit: ≥1 happy + ≥1 failure | Unit + **mutation lens** (§6) |
| **Canon/spec-governed behaviour** | Canon-contract test | Contract + Unit (+ mutation lens if critical) |
| **External-data integration** | Integration self-test (smoke) | Self-test `passed === total` + Contract |
| **CLI / script** | CLI smoke (runs, exit 0) | CLI smoke + output-shape assertions |
| **UI surface** | Smoke (loads, no 500, correct shell) | Smoke + **UAT** (authenticated human flow) |
| **AI / model-driven behaviour** | **Eval** (§7) | Eval + Canon-contract |
| **End-to-end flow** | E2E smoke | Full UAT + E2E (ephemeral users — see `CANON-E2E-TEST-USER-DISCIPLINE`) |

The matrix is the **default routing**; the consuming repo's L3 binding may add rows/types and maps each type to its tooling. Depth scales with stakes — **the trivial path does not carry the full set** (over-testing is the same ceremony anti-pattern as under-testing is a hazard).

---

## §4 — The test types (one line each)

- **Unit** — exercises a function's logic; ≥1 happy + ≥1 failure. The cheap floor (`CANON-TESTING-MINIMUM-BAR`).
- **Canon-contract** — verifies what the canon / sealed spec / governance rule *promises*, not the implementation detail. Integration-real, not mock-heavy. The source-of-truth layer.
- **Smoke** — does it load / render / run without crashing; the minimum existence check.
- **CLI** — the command runs, exits 0, and (high-stakes) produces the expected output shape.
- **Integration self-test** — a live endpoint a data-integration module exposes; `passed === total` before any demo.
- **UAT** — an authenticated human (or human-faithful) end-to-end flow.
- **Eval** — scores **non-deterministic** (AI/model) behaviour against a rubric; lightweight end-to-end, a small prompt set grown from real failures (§7).
- **E2E** — automated end-to-end with ephemeral users (never real accounts).

---

## §5 — The floor (behavioural, not by file type)

> **No change that alters behaviour merges with zero verification.** *"If you can't verify it, don't ship it."*

**Exempt** (non-behavioural — no check required): typo, comment, log line, rename, formatting, pure move-without-change, and the file classes the minimum-bar already exempts (config, types, generated). The floor triggers on **behaviour**, not on touching a file — this keeps the floor from ceremonializing trivia (the over-engineering it would otherwise become).

---

## §6 — Mutation as a strength lens (not a mandatory cell)

Mutation testing answers *"do the tests actually catch bugs?"* — it mutates the code and expects tests to fail; surviving mutants expose gaps. The 2026 framing: **test strength, not test volume.**

- It is an **opt-in lens**, applied at the dev's judgement on the tests of critical code — **never a CI hard-gate, never per-file** (consistent with the mutation-testing companion canon).
- **Exception — the top-stakes row** (auth / payments / tenant-isolation): the lens is **recommended; if skipped, state why** (one line in the work-unit's verification field — §9). A documented-skip, not a hard-gate. This honours "higher stakes → more rigour" without turning the lens into a gate.

Mutation is **orthogonal** to the matrix types — it operates *on the tests*, not as a peer of unit/smoke/UAT.

---

## §7 — Evals for AI / model-driven behaviour

For AI behaviour, deterministic equality does not apply (the output varies). The required type is an **eval**: run the behaviour, score the result **against a rubric**.

> **The rubric is not invented — for governed AI behaviour, the rubric *is* the canon-contract.** What the behaviour promises (per the governing canon/spec) is exactly what the eval scores. For ungoverned AI behaviour (no contract), the eval uses an ad-hoc rubric declared in the work-unit. This reuses the contract machinery (§4) and avoids fabricated criteria.

> **Knowledge precondition (coherence seam — the eval is not the only gate on AI work).** AI-assisted /
> model-driven work also cannot be **specified** until its Accepted Knowledge Baseline exists
> (`CANON-KNOWLEDGE-NATIVE-VT-METHOD-001 §2 — When This Triggers` lists "AI-assisted/model-driven" as a
> trigger). The two gates compose and fire at different times: the **baseline gates the spec** (can this
> be specified at all?), the **eval gates verification** (does the behaviour score against its rubric?).
> The Testing Gate names the eval; it does not replace the baseline — both apply to AI work.

---

## §8 — Escalation to an independent advisor

When the change is **high-complexity or ambiguous**, the Gate's output is not a fixed cell — it is *"escalate the verification strategy to an independent advisor."* This is the tail of the same distribution, **not a separate gate**. The advisor runs `CANON-ARCHITECTURE-REVIEW` in a **fresh context** (the one who builds does not grade — the state of the art's core verification finding). The advisor decides the type set; the human authority decides on its findings.

---

## §9 — Where the Gate runs (methodology-agnostic, per work-unit)

The Gate is **not tied to one development methodology.** It runs **per work-unit**, wherever the unit lives:

- In a spec-driven flow: a `Verification: <type(s)>` field on each task.
- In direct execution: the same field in the briefing's verification matrix (V-01..V-xx).

The test travels in the **same change** as the code it verifies — **TDD is not mandated** (consistent with `CANON-TESTING-MINIMUM-BAR`: the test ships with the change, not necessarily before it).

---

## §10 — What this canon does NOT do

- It does **not** impose a global coverage percentage. Strength and appropriateness, not a number.
- It does **not** rewrite `CANON-TESTING-MINIMUM-BAR` — that canon remains the **floor** (the unit row + the never-zero discipline); the Gate is the **selection layer on top**.
- It does **not** replace the type-specific canons (e2e discipline, integration self-test shape, etc.) — it **routes to** them.
