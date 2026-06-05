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
2. **Slice, then gate.** Work is first cut into **slices** — a slice is the smallest
   change that *ships and stands on its own*: one boundary, one owner, independently
   verifiable, delivering value by itself. (Too big hides risk inside one gate; too
   small fragments the trail. The slice is the unit the gate, the spec, and the
   artifacts all attach to.) Then, before each slice, a **decision gate** measures
   structural impact and author clarity and selects how much specification ceremony
   the work warrants — **presented and waiting for an explicit GO**, never
   self-cleared. A security modifier raises the bar when sensitive surfaces are touched.
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
research (optional) → strategy (optional) → canon (required) → slice (required) →
decision gate (required) → specification (required) → briefing → implementation →
verification
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

## 7. Method and engineering canons are state-of-the-art-informed

**Scope:** this section governs **method and engineering canons** — those about *how
work is done* (verification, review, orchestration, scoping, gating, the process
itself). It does **not** govern product or domain canons (what the product *is*).
It strengthens the `research → canon` pipeline of §3: for this class of canon,
research is **not optional**.

### 7.1 — The principle

A method/engineering canon is not sealed on internal conviction alone. Before it
seals, its author checks how the leading practitioners of that discipline solve the
same problem, and **inherits the pattern, not the implementation** — the idea adapted
into the repo's own terms, never a copied dependency nor a cargo-culted ceremony.
(Same extract-pattern discipline as the upstream-adoption canon; different *object* —
there it is external *code*, here it is external *practice*.)

### 7.2 — The seal gate (trigger-based)

Before a method/engineering canon moves from draft to sealed:

1. **Prior-art check** — survey how **≥2 independent leading sources** approach the
   problem; record what was found.
2. **Extract, don't depend** — state which pattern is adopted and how it was adapted;
   reject what does not fit (a *documented rejection* is a valid outcome).
3. **Watchlist entry** — register the sources so their future evolution can be
   re-checked.

A method/engineering canon sealed without this gate is **incomplete** — its seal is
provisional until the prior-art is recorded.

### 7.3 — The re-evaluation loop (hybrid cadence)

The state of the art moves; a once-correct method canon drifts from it silently. Two
cadences keep it honest:

- **Trigger-based (primary)** — the seal gate (§7.2) fires on every new/amended
  method canon; and a relevant external publication already on the watchlist is
  itself a trigger to re-open the affected canon.
- **Periodic sweep (light)** — on a fixed low-frequency cadence (e.g. quarterly,
  aligned with the upstream/tooling reconciliation), a lightweight pass over the
  watchlist asks *"did any source move enough to matter?"* The sweep produces
  **findings, not mandatory rewrites**.

The named authority **owns** the loop and may delegate the sweep; what is not
optional is that the loop *exists* and is recorded.

### 7.4 — Boundary (not "chase every new framework")

Prior-art **informs**; it does not rule. The authority may seal against the apparent
state of the art **with a recorded reason**. The discipline is *don't seal a method
canon without having looked* — never *always copy the leaders*. (This mirrors the
over-engineering lens of the architecture-review canon: looking is mandatory,
importing ceremony is not.)

---

## 8. Completeness and full ownership of a unit

A slice (§2) is **done only when every dimension it requires is complete** — not
when its primary artifact merely compiles. Which dimensions apply scales with the
unit (type safety, data/schema, implementation, localization, documentation, and
deployability are the usual ones; each repo enumerates its own set in its L3
binding), but the discipline is universal:

1. **One owner, end to end.** Whoever takes a unit owns *all* of its dimensions.
   There is no "someone else will localize / document / migrate it later": a
   dimension deferred to a follow-up is a dimension that silently never ships.
2. **No handoff of a missing dimension.** A unit is not handed off, declared done,
   or merged with a known-incomplete dimension. Half a unit is zero value to the
   consumer, not half value.
3. **A commit certifies the whole.** A commit is not "my file works"; it asserts
   *the system works after this change*. The committer answers for the full vertical
   the change touches, not only the line edited.
4. **Completeness scales, but never to zero.** A trivial change carries fewer
   dimensions, but no real change carries none — if it touches user-facing text it
   carries localization; if it touches a shared unit it carries that unit's
   changelog; if it makes an architectural decision it carries an ADR (§5).

Enforcement is **cultural, not mechanical**: peer review, the named authority's
review, and the session-close ritual (`CANON-AGENT-COLLABORATION` §8) check
completeness — no automated gate can enumerate every dimension for every repo. The
artifacts of §5 are the durable record that the dimensions were in fact carried.

---

## Fire-test

This document names no product, vendor, brand, or methodology. Those bind at L2/L3.
