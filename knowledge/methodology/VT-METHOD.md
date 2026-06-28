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

**VT-METHOD is knowledge-native:** product-shaping work starts from validated
knowledge, not from isolated feature requests. A feature request is an input; the
accepted product/business/domain baseline is the context from which responsible
specification starts.

VibeThink is the house method, platform, and operating discipline for building
knowledge-native vertical systems with agents. DevKit is its technical and
methodological constitution: it does not carry each vertical's business knowledge,
but it defines how that knowledge is reconstructed, validated, persisted, retrieved,
and made binding before execution.

Identity layers:

- **VibeThink as method:** the way of building software where business knowledge,
  decisions, rules, real cases, and operating memory are part of the system.
- **VibeThink as platform:** DevKit, the work bench layer, Graphify, Engram, the
  orchestrator, and agents provide memory, traceability, governance, and intelligent
  assistance.
- **Relational assistant plane:** the assistant/orchestration layer understands
  people, relationships, conversations, context, signals, assistance, and coordination.
  It accompanies and orchestrates verticals; it does not replace them.
- **Verticals as products:** each vertical knows its own domain while inheriting
  method, governance, memory, agents, and tooling from VibeThink.

For VibeThink repos, the declared **Knowledge Memory Adapter** defaults to Engram
for memory/facts/recall, Graphify for graph relationships/communities/semantic
navigation, and versioned Markdown Knowledge Packs as the auditable source of truth.
Product-shaping work may not start until the agent has retrieved and cited the
Accepted Knowledge Baseline through that declared adapter.

## How VT-Method works — read this first

You have something to build. VT-Method is the path from idea to a verified result,
in seven steps:

1. **Slice it** — cut the work into the smallest piece that ships and stands on its own.
2. **Decision gate** — measure impact and risk: trivial or heavy? That decides how
   much ceremony the work needs (from "just do it" to "full spec"). Present it and
   wait for GO — never self-clear it.
   If the work introduces or expands an architecture, contract, behavior standard,
   AI-assisted / model-driven behavior (worker, assistant flow, extraction, or
   model-chosen action), production dependency, runtime framework, CDN/font/render
   source, or cross-tenant boundary, stop and classify the decision first. If it
   needs an ADR/canon update, write that record before implementation; do not wait
   for the human to request it.
3. **Knowledge baseline** — for product-shaping, complex, AI-assisted/model-driven,
   cross-boundary, or new-domain work, reconstruct or cite the accepted Knowledge
   Baseline before specifying. The baseline must be retrieved and cited through the
   repo's declared Knowledge Memory Adapter. If no accepted baseline exists, run a
   Knowledge Reconstruction Sprint: sweep declared sources, produce a Candidate
   Knowledge Pack, get human/principal validation, and promote it to Accepted
   Knowledge Baseline. Trivial fixes may declare `Knowledge Baseline: N/A`.
4. **Specify** — write the contract at the chosen weight: a short briefing, or a
   full spec. Heavier risk → heavier spec. Never quietly skip a level.
5. **Execute, governed** — the author gives exact orders + a checklist; the builder
   implements and raises blockers; the author verifies against the checklist. If the
   builder is an **autonomous coder**, dispatch it through the coder spine — the launch
   runbook + identity PREP, never improvised — after confirming the launch-surface is
   ready (`CANON-CHANGE-PATH-AND-DECISION-CLASSES-001` §3.1). Each
   work-unit declares its **verification type(s)** up front — the verification gate
   (`CANON-TESTING-GATE`) maps the unit's *nature × stakes* to the type(s) required
   (unit · contract · smoke · CLI · self-test · UAT · eval · e2e). The test travels
   in the **same change** as the code it verifies; TDD is permitted, not mandated.
6. **Leave the trail** — the lifecycle artifacts (requirements, readiness plan,
   append-only log, roadmap, changelog) so the next person understands without asking.
7. **Findings / learning** — see something off outside your scope? Record it as a
   finding — never fix it silently, never lose it. If the work teaches durable
   product/business knowledge, update or supersede the Knowledge Baseline instead of
   leaving the lesson in chat.

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
| **Knowledge baseline** | Knowledge-Native VT-METHOD: complex/product-shaping work retrieves and cites an Accepted Knowledge Baseline through the declared Knowledge Memory Adapter before spec; missing baseline triggers a Knowledge Reconstruction Sprint (`CANON-KNOWLEDGE-NATIVE-VT-METHOD-001`) |
| **Specification pipeline** | **Direct Execution** (default — briefing + V-xx matrix) · **structured spec-kit** (complex discovery) · **interchange-spec** (laboratory) |
| **Governed execution** | author briefing → executor implements → author verifies against the V-xx matrix, over the shared comms channel. Each work-unit carries a `Verification: <type(s)>` field selected by the verification gate (`CANON-TESTING-GATE`) — methodology-agnostic: the field lives in the spec's task list *or* in the briefing's V-xx matrix. The test ships in the same change; depth scales with stakes (no global coverage number) |
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
- the product's Knowledge Packs, accepted business/product/domain baselines, and
  concrete adapter health/freshness checks,
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
