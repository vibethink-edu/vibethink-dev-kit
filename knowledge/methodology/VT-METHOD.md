# VibeThink Method (VT-Method) — house methodology (L2)

> **Status:** CANON (house layer — branded on purpose).
> **Home:** the dev-kit (supra-repo). The VibeThink binding of the L1
> `CANON-DEVELOPMENT-PROCESS.md`.
> **Naming:** **VT = VibeThink** (the organization), **not** any single product.
> VT-Method **supersedes the name "VtHINK"** (alias → VT-Method) and **"Canon-First
> Development"** (the same methodology, now named VT-Method). The React architecture
> pattern that once shared the "VtHINK" name is a **separate concern**, not part of
> VT-Method.

VibeThink Method is governance-driven: *canon comes first* — no code without a
governing source, no spec without canon alignment, no decision without capture. It
is the L1 process skeleton instantiated the VibeThink way.

## How VT-Method works — read this first

You have something to build. VT-Method is the path from idea to a verified result,
in six steps:

1. **Slice it** — cut the work into the smallest piece that ships and stands on its own.
2. **Decision gate** — measure impact and risk: trivial or heavy? That decides how
   much ceremony the work needs (from "just do it" to "full spec"). Present it and
   wait for GO — never self-clear it.
   If the work introduces or expands an architecture, contract, behavior standard,
   production dependency, runtime framework, CDN/font/render source, or cross-tenant
   boundary, stop and classify the decision first. If it needs an ADR/canon update,
   write that record before implementation; do not wait for the human to request it.
3. **Specify** — write the contract at the chosen weight: a short briefing, or a
   full spec. Heavier risk → heavier spec. Never quietly skip a level.
4. **Execute, governed** — the author gives exact orders + a checklist; the builder
   implements and raises blockers; the author verifies against the checklist.
5. **Leave the trail** — the lifecycle artifacts (requirements, readiness plan,
   append-only log, roadmap, changelog) so the next person understands without asking.
6. **Findings** — see something off outside your scope? Record it as a finding —
   never fix it silently, never lose it.

> **Golden rule:** governance first — canon beats everything, and nothing is built
> without passing the gate.

### The same thing, as a restaurant

- **Research** — visiting other restaurants to study menus and trends. Intelligence, not rules.
- **Strategy** — "we'll open a French bistro for the lunch crowd." Direction.
- **Canon** — the health code, the fire marshal, the permits. Non-negotiable.
- **Decision gate** — "repaint a wall (just do it)" vs. "redo the kitchen with new gas lines (blueprints + inspections)."
- **Specification** — the blueprints: precise, measurable.
- **Briefing** — the work order, with a checklist.
- **Implementation** — the contractor builds and flags blockers.
- **Verification** — the inspector checks the build against the blueprints.

The key insight: the research never became the health code — it *informed* it.

## The L1 pillars, VibeThink-bound

| L1 pillar | VT-Method binding |
|-----------|-------------------|
| **Governance** | tiered canon (`SEALED → CANON → DRAFT`) under a single Canon Index; one named approver (the Principal Architect) |
| **Decision gate** | the **3-Gate Preflight**: structural-impact questions (SI count) + author clarity + a security-surface modifier → methodology choice |
| **Specification pipeline** | **Direct Execution** (default — briefing + V-xx matrix) · **structured spec-kit** (complex discovery) · **interchange-spec** (laboratory) |
| **Governed execution** | author briefing → executor implements → author verifies against the V-xx matrix, over the shared comms channel |
| **Lifecycle artifacts** | PRD · deployment/readiness plan · **decision record (ADR)** · append-only log · roadmap · **per-package** changelog |
| **Decision registration** | ADRs register by layer: agnostic/cross-product → dev-kit `doc/decisions/` (graph-indexed per `CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING`); product-specific → the product's decision store (e.g. a capture-protocol canon + inline `DM-xxx`). Each ADR names its enforcement check (§3.1). |
| **Findings** | typed finding files in the shared channel (category · location · why · action); security findings escalate immediately |

## Document authority hierarchy (VibeThink)

`Canon > Specs > Strategy > Research`, with the research-to-canon pipeline
(`research → strategy → canon draft → approved canon`). Steps may be skipped when
the approver has clarity; research never changes tier.

## What stays at L3 (product repos — NOT here)

The concrete instantiation lives in each product repo and never rises to L1/L2:

- the exact decision-gate questions and their impact categories,
- the specific spec-kit command set and external-tool cherry-picks,
- the product's own canon set and named-approver identity,
- durable front-memory mechanics and product comms specifics,
- **any product vocabulary and domain model** (a product's business concepts stay
  entirely in that product's repo).

## Provenance

Extracted from a product repo's methodology (the "Canon-First Development" canon and
its pillar authorities) per `doc/decisions/ADR-20260524-vt-method-methodology-layering.md`,
applying the split: the generic essence rose to **L1**
(`CANON-DEVELOPMENT-PROCESS.md`), the VibeThink binding lives here at **L2**, and the
product-specific detail stays at **L3**. The detailed pillar authorities
(decision-gate questions, spec-methodology definitions, lifecycle-artifact specs,
the findings protocol) remain in the product repo as L3 detail and point up to this
L2 frame.

## Acceptance (this move is complete only when)

1. **Fire-test** — L1 greps clean of any brand / product / methodology name.
2. **Single-source** — each concept has exactly one normative home (L1 principle ·
   L2 binding · L3 product) with pointers, never two normative copies.
3. **Inherit-test** — a fresh agent in any repo reaches VT-Method via the spine.
