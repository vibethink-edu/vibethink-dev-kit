# Development Process — neutral core (L1)

> **Status:** CANON (neutral core).
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **What this is:** the agnostic *skeleton* of how a unit of work goes from idea to
> verified implementation. It carries **no brand, product, or methodology name**
> (passes the §8 fire-test). **L2** binds it to a house methodology; **L3** (a
> product repo) instantiates it with concrete questions, tools, and vocabulary.
> **Siblings:** `CANON-MULTI-AGENT-ORCHESTRATION.md` (how agents hand work between
> each other and the human) · `CANON-CROSS-AGENT-CONTEXT-LAYERING.md` (how agents
> read the layered rules). This canon is *how work is governed from idea to done*.

## 1. Root principle

> **Governance precedes code.**

Before a unit of work is specified or built, the rules, boundaries, and contracts
that govern it are established and captured. No implementation without a governing
source; no decision without capture.

## 2. The four pillars

1. **Governance** — the constitutional layer: durable architectural truths,
   capability contracts, and sealed decisions. Tiered: **sealed** (immutable) →
   **firm** (amend with evidence) → **draft** (not for build). A single named
   authority approves; there is no alternative approver.
2. **Decision gate** — before each *unit of work* (a **slice** — the smallest
   change that ships and stands on its own), a gate measures structural impact and
   author clarity, then selects how much specification ceremony the work warrants.
   The gate is **presented and waits for an explicit GO** — never self-cleared. A
   security modifier raises the bar when sensitive surfaces are touched.
3. **Specification pipeline** — the chosen ceremony produces the contract: a
   **structured spec** for complex or uncertain work, or a lighter **briefing +
   verification matrix** when the author already has full clarity. Match ceremony
   to risk; **never silently downgrade**.
4. **Governed execution** — the author issues exact orders (referencing the spec,
   the governing sources, and a verification checklist); the executor implements
   against them and raises blockers through the shared channel; the author verifies
   the result against the checklist.

## 3. Document authority hierarchy

Four tiers, most binding first:

- **Canon (law)** — what is and is not allowed. The single named authority approves.
- **Specs (contract)** — what will be built, per unit. Bound by canon.
- **Strategy (direction)** — where the work wants to go. Informs canon.
- **Research (intelligence)** — what exists out there. Informs strategy and canon.

Rules: **canon overrides everything**; **specs are bound by canon**; **research
never becomes canon by accumulation or age** — it is evaluated, validated, and
formalized through the governance process. The pipeline is
`research → strategy → canon draft → approved canon`; steps may be skipped when the
authority has clarity, but a research artifact never changes tier.

## 4. How the layers compose

```
research (optional) → strategy (optional) → canon (required) → decision gate
(required) → specification (required) → briefing → implementation → verification
```

Not every unit traverses all layers: a trivial change may go
`gate → briefing → implementation → verification`. Research and strategy enter only
when new intelligence or new direction is needed.

## 5. Lifecycle artifacts

Each unit of work carries durable artifacts so its history survives any single
session or agent:

- a **requirements record** (what + why),
- a **deployment / readiness plan**,
- a **decision record (ADR)** — the *why* behind each architecture / contract /
  behaviour decision (context · decision · alternatives · consequences) **and the
  check that enforces it (§3.1)** so the decision cannot silently drift,
- an **append-only log** of decisions over time,
- a **status roadmap**,
- a **per-unit changelog** (touch a unit → update its changelog in the same change).

Missing artifacts are reconstructed from history rather than left blank. **A decision
is registered as an ADR** (`ADR-YYYYMMDD-slug`); the *why* is the indexable part, and
code links back with inline `# WHY:` / `# DECISION:` markers. By layer: an
agnostic / cross-product decision registers in the supra-repo's decision store, a
product-specific one in that product's store. (Disposition + indexing rules live in
the decision-disposition canon.)

## 6. Findings

An anomaly, risk, or opportunity **outside the current scope** is recorded as a
typed **finding** (category · location · why · suggested action) — never silently
fixed and never lost. Security findings escalate to the named authority immediately.

## Fire-test

This document names no product, vendor, brand, or methodology. Those bind at L2/L3.
