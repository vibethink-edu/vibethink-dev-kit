# CANON-RUNTIME-POLICY-ENGINE-001 — Runtime governance by policy interception (ALLOW / ASK / DENY)

**Status:** PROPOSED 2026-06-16 — drafted by the dev-kit architect from the orchestration prior-art per `ADR-20260616-runtime-policy-engine` (ACCEPTED · `DECISION-REGISTER` D-009). **Seal = the Principal Architect's merge.**
**Date:** 2026-06-16
**Scope:** Every repo running AI agents whose actions (tool calls, model requests) warrant runtime governance **beyond a static permission file**. Vendor-neutral, product-neutral, harness-neutral, model-neutral.
**Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork. The kit names the **contract**; the **engine is L3** (each product builds it on its own pain).
**Companion canons:** [`CANON-CODER-ORCHESTRATION-001`](./CANON-CODER-ORCHESTRATION-001.md) (the **static** harness allow/deny — this canon's runtime sibling; §7's "never allowlisted" floor is **shared**, not restated here) · [`CANON-MULTI-AGENT-ORCHESTRATION`](./CANON-MULTI-AGENT-ORCHESTRATION.md) (§3 the safety boundary — *automate the machine-verifiable, escalate judgment* — the principle this canon mechanizes; §4 the human keeps stop/redirect) · [`CANON-DEVELOPMENT-PROCESS`](../methodology/CANON-DEVELOPMENT-PROCESS.md) (§6 findings — a recurring DENY/ASK is a finding, not a silent friction).

## 1. Root principle

> **Govern an agent at runtime by intercepting each action and returning a verdict — ALLOW, ASK, or DENY — composed across policies, carrying state, failing closed.**

A static permission file (`CANON-CODER-ORCHESTRATION-001` §4) answers *"is this command shape allowed?"* once, statelessly, at the harness. It cannot see **accumulated** context — cost burned, risk built up, which model tier is active, how many calls so far. Runtime governance can: it evaluates each action against the **live session**, so a rule may depend on *what has happened*, not just the command's shape.

## 2. Enforcement points

A policy declares which point(s) it fires on; the engine skips the rest:

- **request** — a user/turn input, before the model runs.
- **pre-model** — the assembled model request (instructions + messages + tool schemas).
- **tool-call** — before a tool/command executes.
- **tool-result** — after a tool returns (gate on what came back).

The names are illustrative; an L3 engine maps them to its harness. The principle is **typed enforcement points**, not ad-hoc scattered hooks.

## 3. The verdict

Every policy returns exactly one of:

- **ALLOW** — proceed. May carry a **replacement payload** the site substitutes for the original content (e.g. a redacted version of the tool arguments or result).
- **ASK** — pause for a human approval (an elicitation). **Approval is stateful**: approve once per threshold; a **denied or timed-out ASK leaves no side effects** (writes withheld).
- **DENY** — block, with a human-readable reason. May **steer** (e.g. "switch to a cheaper tier and retry") rather than hard-stop.

## 4. Composition & precedence

Policies evaluate **in declared order**:

- a **DENY short-circuits** the chain (and applies the writes accumulated by earlier ALLOWs);
- an **ASK accumulates** — its reason is collected and **all writes are withheld** until approval;
- an **ALLOW continues**.

The composed result names the **deciding policy** (for observability and per-policy approval timeouts).

**Stacking (precedence layers):** **session (the user) → agent-spec (the developer) → server/admin**, evaluated in that order — so a user-session policy can DENY-short-circuit before the spec/admin policies run. An L3 binds which layers it exposes.

## 5. Session state

The engine carries per-session state that policies **read and update**: counters, an accumulated **risk score**, cumulative **cost / token usage**, and **labels**. State persists across turns where the L3 stores it. This is what makes a rule **contextual** (a budget, a risk threshold) instead of a flat per-call check.

## 6. Fail-closed

A policy that throws **DENIES by default**. The only exceptions:

- a policy declared **advisory / classifier-only** fails to **ALLOW** (it never blocks by design);
- a declared **approval-gate** policy fails to **ASK** (never silently ALLOW).

A broken guard **never fails open**. Returned verdicts are validated against the policy's declared verdict set; a mismatch takes the same fail-closed path.

## 7. Reusable policy patterns (the menu, not the choices)

Agnostic primitives an L3 may implement (each is a **pattern**; the concrete thresholds/tiers are L3):

- **cost / capability-tier downgrade-gate** — past a hard budget, DENY an expensive tier (forcing a downgrade) and/or ASK at soft thresholds; optionally a per-principal-per-day variant.
- **tier routing** — DENY trivial work on an expensive tier.
- **risk-score escalation** — accumulate points per action (and on sensitive results); ASK/DENY guarded actions past a threshold.
- **working-dir / worktree gate** — gate directory-change / worktree operations against an allowlist.
- **sandbox enforcement** — require/inject a sandbox profile before spawning a sub-process.
- **rate-limit** — cap actions per session or per turn.
- **sensitive-content** — redact or deny secrets / sensitive data in a request or result.

> **Never gate on a vendor model id** — gate on **tier/capability**. A brand-coupled threshold rots and fails the fire-test.

## 8. Relationship to the static allow/deny (`CANON-CODER-ORCHESTRATION-001`)

This canon does **not** replace the static permission file — it is its **runtime, stateful sibling**:

- The **static allowlist / deny** (CODER-ORCHESTRATION §4/§7) is the **harness-level floor**: fast, stateless, prefix-matched. The airtight deny it owns — **identity / destruction / secrets / arbitrary-exec** — is the **shared floor** both layers express.
- The **runtime engine** (this canon) is the layer above: **stateful, composable**, with the **ASK** verdict and the contextual policies a flat list structurally cannot express.

A repo may run either or both. Where both run, the static deny is the **backstop**; the engine is the **membrane**. Neither may dissolve the shared floor (§7 of CODER-ORCHESTRATION).

## 9. Layering — what the kit owns vs the product

- **L1 (this canon):** the **contract** — enforcement points, the verdict set, composition + precedence, fail-closed, the state model, and the pattern menu.
- **L3 (each product):** the **engine implementation** (code), the concrete policies + thresholds, the harness mapping, and the storage of session state.

The kit ships **no runtime**. It names the pattern so a product builds its engine against a **known target** instead of scattered per-route guards and prose rules — and so the same governance reads the same way across products.

## 10. Anti-patterns (the never-do list)

- **Fail-open.** A broken policy that ALLOWs (§6).
- **A flat list pretending to be stateful.** Budget/risk logic in a prefix-match — it cannot see accumulation. Use the engine.
- **Vendor-coupling.** Gating on a model brand id instead of a tier/capability (fire-test).
- **Silent ASK side effects.** Applying writes before the human approves (§3).
- **Dissolving the shared floor.** A runtime engine that lets identity / destruction / secrets / arbitrary-exec through that the static deny (CODER-ORCHESTRATION §7) blocks.

## Fire-test

This document names no product, vendor, brand, model, or framework. (`ALLOW`/`ASK`/`DENY`, "policy", "sandbox", "PII" are generic governance/security nomenclature, not brand markers.) The motivating prior-art (an OSS meta-harness) is cited as **research**, not depended on.

## Provenance

Drafted 2026-06-16 from the orchestration prior-art (`knowledge/research/ORCHESTRATION-PRIOR-ART-2026-05-25.md` — the omnigent entry, source-verified at the upstream's `HEAD 5a8fd16`) per `doc/decisions/ADR-20260616-runtime-policy-engine.md` (ACCEPTED · D-009). **Extract-patterns-not-dependency:** the pattern is reimplemented in our own terms; no external tool is adopted. On seal, register the catalog piece in `setup/ADOPT-DEV-KIT.md` and remove the `catalog-sync` exemption.
