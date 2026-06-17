# CANON-OBSERVABILITY-CLOSED-LOOP-001 — Observability as the closed-loop sensor (universal · agent-agnostic)

> **Status:** DRAFT — **INTENTION, not law.** Not approved, not sealed. A working agreement so agents align on the model; it becomes canon only when a reference implementation validates it and the Principal Architect promotes it. **While it is an intention, no agent treats it as sealed law.**
> **Layer:** L1 (neutral) — intended. Sealed form will be vendor/product-neutral.
> **Home:** the dev-kit (supra-repo). On promotion, inherited by every repo as upstream → fork.
> **Family:** **extends `CANON-MULTI-AGENT-ORCHESTRATION.md`** (coordination + human-on-the-loop) · binds with `CANON-RUNTIME-POLICY-ENGINE-001.md` (fail-closed runtime governance) and `CANON-AUDIT-PROTOCOL.md` (a signal/verifier that does not lie).
> **Method note:** this is an **intention of canon, not a spec** — it does not use a spec methodology.

> ⚠️ **STATE: INTENTION / DRAFT.** Agnostic declaration to align agents. **Not approved, not sealed.** It is formalized by being proven in a reference implementation; on validation the Principal Architect promotes it to sealed canon. Until then it is a working agreement, not law.

## §1 — Principle (category)

Every system — platform and verticals — must be able to **see itself** (observability) and **improve itself under human governance** (a self-improvement loop). Observability is the **sensor that fires** the improvement, not decoration. The goal is not to automate away thinking; it is to **accelerate understanding** with a human always in command.

## §2 — Agnostic spine (anti lock-in)

- Instrument with an **open standard** (e.g. OpenTelemetry): instrument **once**, keep the backend **interchangeable**.
- Honest limit: an open standard gives neutrality in **instrumentation/collection**, **not** in backend/storage → choose backends that speak the open protocol and stay replaceable.
- **Forbidden to anchor the design to a vendor.** Concrete products are *possible destinations*, never the decision.

## §3 — The closed loop (signal → action), human-on-the-loop

Canonical cycle: **signal → case/issue → agent analyses → agent proposes (writes) → draft PR → human approval.**

- **Human-on-the-loop is mandatory:** nothing destructive or production-touching runs without a human gate. **Never auto-merge to production** without approval.
- **Verifier ≠ implementer:** the actor that detects/verifies (ideally deterministic) is **not** the one that proposes the fix (which may be an LLM).
- **Explicit translation:** the signal becomes a readable prompt/case **before** it is dispatched to an agent.

## §4 — Budget governance (fail-closed)

- Every loop declares **caps BEFORE running**: max iterations + a token/cost ceiling.
- **Fail-closed:** if spend cannot be measured, the loop **stops**.
- **No-progress halt:** the same failure N times → stop + report BLOCKED.
- **Token count is a floor, not a ceiling** of governance (it measures volume, not value).

## §5 — Least privilege

Non-human actors (agents/bots) run **least-privilege**: only what their step needs, no broad persistent credentials.

## §6 — Layered model (standard vs implementation)

- **The standard** (this canon) is **one, shared** by every system.
- **The implementation** is **per repo/system** — each vertical wires its own loop.
- The **"always-on"** rides on cloud that **already exists** (the forge's CI, serverless) — a new orchestration platform is **not** built until the real pain is felt (anti-rooms).

## §7 — Canon lifecycle (intention → sealed)

1. **INTENTION / DRAFT** (this doc, in the dev-kit) — a working agreement; agents align.
2. **Formalization** — proven in a **reference implementation** (the originating product): P0 forge-native automation → P1 the open-standard (OTel) spine → P2 a governed loop of its own.
3. **Promotion** — validated → the **Principal Architect seals it** in the dev-kit; it stops being an intention; the product-specific reference is **genericized** (the sealed canon names no product).
4. **Inheritance** — the verticals adopt it.

> **Current reference implementation: ViTo** (the originating product), front `observability-closed-loop` (P0→P1→P2). Named here only to scope the DRAFT formalization phase; it is removed when the canon is sealed (fire-test).

## §8 — Approval

Canon approved/promoted **only by the Principal Architect**. Domain architects may draft/amend in their domain if the Principal Architect authorizes; they are not a second approver. While it is an intention, it is not sealed law.

## Provenance

Drafted by a consuming product's architect (ViTo) from a research base (loop-engineering evaluation · observability SOTA · hosted-cost study, 2026-06-17) and handed to the kit as an **intention** via `HANDOFF-DEVKIT-CANON-OBSERVABILITY-CLOSED-LOOP-INTENT-2026-06-17`. It extends the multi-agent orchestration spine with the observability→improvement loop. The DRAFT names an open standard (OpenTelemetry) and the current reference-implementation product (§7) only illustratively / to scope formalization; both are genericized on promotion to sealed canon.

## Fire-test (intended, on seal)

The sealed form will name no product, vendor, brand, or framework. This DRAFT names an open standard only as an example and the reference-implementation product only to scope the formalization phase — both removed/genericized at promotion.
