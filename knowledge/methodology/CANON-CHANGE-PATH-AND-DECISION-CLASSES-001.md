# CANON-CHANGE-PATH-AND-DECISION-CLASSES-001 — Which path a change takes, and whose approval it needs

**Status:** SEALED 2026-06-15 by the Principal Architect — fire-tested on a vertical that ran trivial fixes, contract-bearing features, and boundary work (identity/access/sensitive data) side by side under one authority.
**Date:** 2026-06-15
**Scope:** Every repo where changes of different weight (trivial fixes, contract-bearing units, boundary-class work) flow under a governance authority — human or agent contributors alike. Vendor-neutral, product-neutral, harness-neutral.
**Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
**Companion canons:** [`CANON-DEVELOPMENT-PROCESS`](./CANON-DEVELOPMENT-PROCESS.md) (§3 the document-authority hierarchy + §4 the pipeline layers and "not every unit traverses all layers" — this canon adds the **decision rule** for *which* path, it does not re-derive the layers) · [`CANON-CODER-ORCHESTRATION-001`](../ai-agents/CANON-CODER-ORCHESTRATION-001.md) (§8 the executor design gate boundary-vs-mechanical — this canon places it as one **path** and generalizes it to any contributor) · [`CANON-TESTING-GATE`](./CANON-TESTING-GATE.md) (verification type by complexity × stakes — each path routes here for *how to verify*) · [`CANON-VERSIONING-001`](./CANON-VERSIONING-001.md) (§10.1 the mandatory Versioning Impact verdict before implementation) · [`CANON-AGENT-COLLABORATION`](./CANON-AGENT-COLLABORATION.md) (the named authority approves; this canon names the **classes** that authority owns) · [`CANON-STATE-MIRROR-AND-DECISION-REGISTER-001`](./CANON-STATE-MIRROR-AND-DECISION-REGISTER-001.md) (§6 the decision register — this canon says which classes trigger a register row) · [`CANON-AUDIT-PROTOCOL`](./CANON-AUDIT-PROTOCOL.md) (finding disposition — a separate ledger).

---

## §1 — Principle

Every change answers **two orthogonal questions** before work starts:

1. **What path does it take?** — how much process the change needs: go **direct**, write a **spec** first, or pass a **design gate** before sensitive code.
2. **Whose approval does it need?** — its **decision class**: sealed by the named authority, delegated with a record, or autonomous within a unit.

Conflating the two breaks both ways: trivial work drowns in spec ceremony, or boundary work ships with no authority sight. Keeping them **separate and legible** is what lets an inheriting repo run fast on the small and stay governed on the consequential — **without reinventing the rule.** The default must be written where an heir reads it, not carried in anyone's head.

> The two questions are independent but correlated: boundary-class work tends to pull **both** up (design-gate path **and** authority-sealed class). A typo pulls both down (direct path, autonomous class). The point of separating them is the **middle** — a contract-bearing but non-boundary feature is spec-first (path) yet only delegated (class).

---

## §2 — Relationship to the companion spines (no duplication)

| Concern | Owner | This canon |
|---|---|---|
| The pipeline **layers** (`slice → decision gate → spec → briefing → impl → verify`) + "a trivial change may skip layers" | **`CANON-DEVELOPMENT-PROCESS`** §4 | does **not** re-derive; §3 adds the **decision rule** for which path a change takes |
| The document-authority hierarchy (canon > spec > strategy > research); the named authority approves | **`CANON-DEVELOPMENT-PROCESS`** §3 + **`CANON-AGENT-COLLABORATION`** | does **not** restate; §4 names the **classes** that require the authority |
| The executor **design gate** (boundary stops to present design; mechanical runs autonomous) | **`CANON-CODER-ORCHESTRATION-001`** §8 | does **not** restate; §3 places it as the **design-gate path** and generalizes it beyond executors (humans too) |
| **Verification** type by complexity × stakes | **`CANON-TESTING-GATE`** | does **not** restate; each path **routes** here for how to verify |
| **Versioning Impact** (`VERSIONING: ...`) | **`CANON-VERSIONING-001`** §10.1 | does **not** restate the models; the decision gate must carry the versioning verdict before implementation |
| The **decision register** (authority approvals: who/when/what/channel/evidence) | **`CANON-STATE-MIRROR-AND-DECISION-REGISTER-001`** §6 | does **not** restate; §4 says **which classes** trigger a register row |
| The **ADR** (the *why* of a decision) + decision store | **`CANON-DEVELOPMENT-PROCESS`** §5 | does **not** restate; §4 says a delegated-class change is captured **as** an ADR |

This canon **owns** what had no agnostic home: the **change-path decision rule** (direct / spec-first / design-gate, with the cut between them) and the **decision-class model** (authority-sealed / delegated-with-record / autonomous) — and how the two compose.

---

## §3 — The change-path decision (how much process)

Three paths. Pick by the questions below; when in doubt, **escalate one path up** (cheaper than under-governing).

| Path | When | What it runs |
|---|---|---|
| **Direct** | trivial **and** reversible **and** changes no contract — a typo, a comment, copy, a dependency-free refactor already covered by tests | implement → verify → land. **No spec, no briefing.** (Still on a branch / reviewed PR — `CANON-GIT-HYGIENE`.) |
| **Spec-first** | a unit with a **contract** — a new feature, a schema/API/interface, a behaviour with consequence | the full pipeline: `slice → spec → briefing → implement → verify` (`CANON-DEVELOPMENT-PROCESS` §4) |
| **Design-gate** | **boundary-class** work — identity, access control, security, sensitive-data handling | present **plan / data-model / tasks for approval before writing the sensitive code**, then proceed (the generalization of `CANON-CODER-ORCHESTRATION-001` §8 to any contributor) |

**The cut (run top to bottom; first match wins):**
1. Does it touch a **boundary class** (§4 — identity / access / security / sensitive data)? → **design-gate**.
2. Does it change a **contract** (interface, schema, API, persisted shape, a behaviour others depend on)? → **spec-first**.
3. Otherwise — trivial and reversible? → **direct**.

> A path is about *process depth*, not about *who approves* — that is §4. A spec-first feature can still be a delegated-class change (the coordinator approves the spec); a direct fix to a security surface is a contradiction — security pulls it to design-gate by rule 1.

Each path then **routes to `CANON-TESTING-GATE`** for the verification type its nature × stakes demand.

---

## §3.1 — The third output: who executes, and (for a coder) how it is dispatched

Path (process depth) and class (authority) decide *how much process* and *whose approval*. They do **not** say **who runs the work** — and the gate is incomplete until it does. Name the **executor** as the gate's third output:

- **Human contributor** → the normal contribution flow.
- **Autonomous coder (a bot executor)** → the work is **dispatched through the coder spine, never improvised**: command-hygiene + the design gate (`CANON-CODER-ORCHESTRATION-001`), the per-session identity + the PREP launch surface (`CANON-CODER-SAFE-IDENTITY-001` §9), instantiated by the launch runbook (`RUNBOOK-LAUNCH-CODERS`). Improvising a coder launch loses exactly the guardrails the spine guarantees — the identity gate, the deny-guard that holds even under bypass, and the boundary design gate.

> **This output is not optional tribal knowledge.** A repo that decides "design-gate path, sealed class" but does not route the boundary work to the coder spine (when a coder runs it) drops the very gate that protects the sensitive code. A competent agent may reach the dispatch pattern from its own memory — but *nothing routed it there*, so a repo whose agent lacks that memory either does not use coders or improvises them, ungoverned. The gate names the executor so the routing lives in the canon, not in someone's head.

**Readiness precondition (coder executor).** Before dispatch, the launch-surface must be **ready**. Split it the way `CANON-AUDIT-PROTOCOL` §8.7 splits a gate:

- **Portable half (self-verifiable):** the launch-surface *artifacts* are present — a launch script, the per-session allowlist/deny settings, and a declared bot-token env-var. An agent verifies this itself (a readiness check) and reports "ready / missing X" **without escalating to the human**.
- **Non-portable half (L3 confirmation):** the *live forge state* — the bot account is low-privilege, the default branch is protected — which a portable check cannot read. This is the one piece that stays a human/forge confirmation.

A repo with no ready launch-surface does **not** improvise a coder — it stands the surface up first (`RUNBOOK-LAUNCH-CODERS` §1–§3).

**Present the choice, don't resolve it silently (human-in-the-loop).** When a human authority is in the loop, the gate's outputs are **presented as one short decision card and the agent waits for GO** — it does not silently resolve a genuine choice, nor over-explain it. The card carries, in a few lines:

- the **path** (direct / spec-first / design-gate);
- the **methodology / spec-weight** options the path allows (the concrete set is L3);
- the **executor** options — a human contributor, an autonomous coder, or the current agent directly;
- a **recommendation with its one-line reason**, so the authority picks fast (or overrides).

It is presented **verdict-first** (the recommendation up front, depth on demand) and the agent then waits for the authority's GO (the methodology/class seal of `VT-METHOD` / §4 below). This is the human-facing face of the gate — the same shape as the proposal preflight.

> **This is not extra ceremony — it fires only on a genuine fork.** Trivial, reversible, no-contract work takes the **direct** path (§3) and is simply implemented; **no card.** The card appears precisely when path / methodology / executor present a real choice — which is exactly where a silent resolution would either decide something that was the authority's to decide, or bury a short prompt under detail it never asked for.

---

## §3.2 — The fourth output: Versioning Impact

The gate is incomplete until it says what the change does to versioned artifacts.
Before implementation, the decision card / task-readiness artifact carries a single
line from `CANON-VERSIONING-001` §10.1:

```text
VERSIONING: <canonical verdict> — authority=<binding>; evidence=<paths/surfaces>; required=<artifact-or-reason>
```

This applies even when the verdict is `VERSIONING: N/A` or
`VERSIONING: DECLARED-NO-BUMP`; silence is not a declaration. A repo-local adapter
may compute the verdict from a diff, but it reads the repo's own versioning authority
(`.versioning.yaml` or equivalent). If that authority is missing or contradictory,
the output is `VERSIONING: BLOCKED-CONFLICT` and the work stops until the conflict is
resolved.

The decision gate therefore has four legible outputs: **path**, **class**,
**executor**, and **versioning impact**.

---

## §4 — The decision classes (whose approval)

Independently of the path, every change has a **class** that fixes whose approval it needs:

| Class | What it covers | Approval + record |
|---|---|---|
| **Authority-sealed** | cross-boundary changes, security, sensitive-data (e.g. personal/regulated data), spend/cost, public-facing or irreversible-external actions, **and changes to canon/law itself** | the **named authority** approves explicitly; the approval is logged in the **decision register** (`CANON-STATE-MIRROR-AND-DECISION-REGISTER-001` §6: who/when/what/channel/evidence) |
| **Delegated-with-record** | internal / product-scoped changes within sealed boundaries | a **delegate** (architect / coordinator) approves; the *why* is captured as an **ADR** (`CANON-DEVELOPMENT-PROCESS` §5), and a register row when an authority-class "go" was given through an ephemeral channel |
| **Autonomous** | within-unit mechanical work | no per-step approval; still lands via reviewed PR (the executor **proposes, does not dispose** — `CANON-CODER-ORCHESTRATION-001` §8) |

- **The class is about authority, not difficulty.** A one-line change that flips a security default is authority-sealed; a large mechanical refactor inside a unit is autonomous.
- **Canon/law is always authority-sealed.** A change to a spine (this layer) is sealed by the named authority — never delegated, never direct (it is the inheritance contract of the whole family).
- The **concrete class list and who the authority is per class are L3** (§5). This canon fixes the *shape* (sealed / delegated / autonomous) and that boundary/security/sensitive-data/spend/public/canon are sealed by default.

---

## §5 — How path × class compose (and the legible default)

Path (process depth) and class (authority) are chosen **independently**, then sanity-checked against each other:

- **boundary work** → design-gate path **and** authority-sealed class (both up).
- **contract feature, internal** → spec-first path **and** delegated class (middle).
- **trivial internal fix** → direct path **and** autonomous/delegated class (both down).
- **contradiction guard:** a change that is "direct" but "authority-sealed" means you mis-cut the path — re-run §3 (a sealed concern is rarely trivial-reversible). A change that is "design-gate" but "autonomous" means you mis-cut the class — boundary work is sealed.

> **The default must be legible (anti-pattern: silence).** A repo that never declares *its* class→authority binding and *its* path cut forces every contributor — human or fresh agent — to guess, and guesses drift. Declare both in the repo's root rules (L3); "we didn't write it down" is the failure this canon prevents (consistent with `CANON-DEVELOPMENT-PROCESS` §3 and the "no silent skips" of the adoption index).

---

## §6 — L3 binding (what the consuming repo owns)

- the **concrete decision-class list** and **who the authority is** for each sealed class (the repo names them in its root rules).
- the repo's **path-cut thresholds** — what counts as "trivial/reversible" for direct, what counts as a "contract" for spec-first, and which surfaces are "boundary" for design-gate.
- **where approvals are recorded** — the decision register instance (`CANON-STATE-MIRROR-AND-DECISION-REGISTER-001` §8) and the ADR store.
- any **mechanical enforcement** (a check that a boundary-touching diff carries a design-gate approval; a check that a canon change carries an authority seal).

The L3 binding **points at this canon as the spine** — it instantiates the classes and thresholds; it does not re-write the three paths, the cut, or the class shape. If it repeats them, it drifts.

---

## §7 — What this canon does NOT do

- It does **NOT** re-derive the **pipeline layers** or the authority hierarchy — those are `CANON-DEVELOPMENT-PROCESS` §3/§4.
- It does **NOT** own the executor **command-hygiene** or the design-gate mechanics for executors — that is `CANON-CODER-ORCHESTRATION-001`.
- It does **NOT** select the **verification type** — that is `CANON-TESTING-GATE`.
- It does **NOT** own the **decision register / ADR** mechanics — those are `CANON-STATE-MIRROR-AND-DECISION-REGISTER-001` and `CANON-DEVELOPMENT-PROCESS` §5.
- It does **NOT** name the concrete classes, the authority, or the thresholds — all L3.

---

## Provenance

Forced by a recurring question from inheriting repos: *"does this go direct, spec-first, or gated — and who has to approve it?"* The pieces existed but were **scattered**: `CANON-DEVELOPMENT-PROCESS` §4 gave the pipeline and a one-line "trivial may skip layers" but no decision rule; `CANON-CODER-ORCHESTRATION-001` §8 gave the design gate but framed for executors only; the **decision-class model** (which changes need authority sight) existed only as a consuming repo's L3, so each new heir reinvented it. A new heir therefore could not answer the two questions from the kit alone.

**Coverage-check:** this canon adds the **decision rule** on top of `CANON-DEVELOPMENT-PROCESS` §4 (which owns the layers), generalizes `CANON-CODER-ORCHESTRATION-001` §8's gate to any contributor as one path, routes verification to `CANON-TESTING-GATE`, and names the authority **classes** that `CANON-AGENT-COLLABORATION` says the authority owns — registering them through `CANON-STATE-MIRROR-AND-DECISION-REGISTER-001` §6. It references each rather than duplicating; consuming repos keep only the concrete class list, authority, and thresholds.

**Fire-test:** vendor/product/agent/tool-neutral — names no product, vendor, agent harness, person, or concrete class. PASS.

**SEALED 2026-06-15 by the Principal Architect (merge = seal).**
