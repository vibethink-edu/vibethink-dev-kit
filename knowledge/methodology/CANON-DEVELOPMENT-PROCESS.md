# Development Process — neutral core (L1)

> **Status:** CANON (neutral core).
> **Seal log:** §7 (method canons are SOTA-informed) and §8 (completeness & full ownership of a unit) amendments **seal-confirmed by the Principal Architect 2026-06-05** ("SEAL DALE"). · **§5.1 (examples are first-class artifacts) amendment SEALED 2026-06-06 by the Principal Architect (agnostic-lift A#21)** (lifted from a product-side canon, `CANON-EXAMPLES-FIRST-001`).
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

When a unit is product-shaping, domain-heavy, AI-assisted/model-driven, or otherwise
depends on business/product knowledge, the process includes a **knowledge baseline**
between the decision gate and specification. L2/L3 bindings define how that baseline
is reconstructed, accepted, retrieved, and cited.

## 5. Lifecycle artifacts

Each unit of work carries durable artifacts so its history survives any single
session or agent:

- a **requirements record** (what + why),
- a **deployment / readiness plan**,
- a **decision record (ADR)** — the *why* behind each architecture / contract /
  behaviour decision (context · decision · alternatives · consequences) **and the
  check that enforces it (§3.1)** so the decision cannot silently drift,
- *(the append-only work-journal was **removed** 2026-06-18 per `CANON-DOCUMENTATION-ARTIFACT-STANDARDS-001` §5 — its content folds into the changelog (deltas) + ADRs (decisions) + git history; do not re-introduce a `BITACORA`/`LOG`),*
- a **status roadmap**,
- a **per-unit changelog** (touch a unit → update its changelog in the same change).

Missing artifacts are reconstructed from history rather than left blank. **A decision
is registered as an ADR** (`ADR-YYYYMMDD-slug`); the *why* is the indexable part, and
code links back with inline `# WHY:` / `# DECISION:` markers. By layer: an
agnostic / cross-product decision registers in the supra-repo's decision store, a
product-specific one in that product's store. (Disposition + indexing rules live in
the decision-disposition canon.)

> **Amended 2026-06-16 §5 — SEALED 2026-06-16 by the Principal Architect (delegated merge — "mergealos vos"; PR #134 → `b71c5fa`):** the artifact
> set above now ships as a **heritable instrument** — `setup/templates/feature-docs/` (one
> template per artifact role + a `FINDING` template for §6 + a README *discoverability map*
> that names which canon governs each part, **including the versioning rules**), enforced by
> the `check-feature-docs` gate, which fails a declared unit missing a required artifact and
> is run by `devkit-doctor`. Until now §5/§6 declared the artifacts but shipped no shape and
> no gate, so each consumer documented in a different form and a missing artifact stayed
> invisible until someone went looking. The concrete filenames remain **L3** (the gate is
> config-driven; `null` = conscious N-A); the kit defines the *roles* and the *mechanism*.
> Same closure pattern as the §5 versioning instrument and the governance-instruments —
> *a rule with no shape and no gate is a suggestion.*

### 5.1 — Examples are first-class artifacts

A decision or architecture document without **concrete worked examples** loses its *why* the moment the author moves on. Examples are not decoration buried in a commit — they are a **durable artifact** of the unit, expected in every decision / architecture / canon / specification document.

Each example shows a real scenario: the situation, the challenge or trade-off, the chosen solution, and **why it matters** (what it preserves, what it prevents). Use a small, **consistent set of example contexts** across the repo so a reader builds intuition rather than re-parsing a new world each time. For a *complex* decision, the depth standard in the decision-disposition canon (§3.8 Part 3 — ≥3 scenarios across ≥2 contexts) is the concrete instance of this rule.

The cost of omitting examples is **re-learning**: a future agent reconstructs from scratch the edge cases, trade-offs, and intent an example would have carried forward.

### 5.2 The plan artifact carries security concerns *(SEALED 2026-06-11 by the Principal Architect — "SEAL DALE", agnostic-lift batch G→Z)*

The implementation/deployment plan artifact of a unit includes a **security-concerns section** before it can receive approval to execute: one row per concern (**concern · severity · status · mitigation**), covering at minimum authentication, secrets, injection/user-content handling, data isolation, third-party dependencies and license posture, and sensitive-data flow — plus an **upstream audit** (hardcoded secrets, license violations, vulnerable dependencies, replaced surfaces) when the unit imports or forks external code. Severity drives sequencing: critical concerns resolve before any code lands; high before merge; medium before deploy; low is tracked. A plan without this section is not approvable — the section is where a hardcoded upstream license key or a missing guard is caught **before** it enters the repo.

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
