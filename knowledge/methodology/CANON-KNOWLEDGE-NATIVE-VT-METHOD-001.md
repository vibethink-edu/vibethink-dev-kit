# CANON-KNOWLEDGE-NATIVE-VT-METHOD-001 — Knowledge-Driven Design beneath product work

> **Scope:** every repo where agents specify or execute product-shaping work from business,
> product, regulatory, operational, vocabulary, scenario, or decision knowledge.
> Neutral core with a VibeThink L2 binding. The core does not depend blindly on a
> specific engine; VT-METHOD requires a declared Knowledge Memory Adapter.
> **Status:** PROPOSED 2026-06-28 for Principal Architect review. Binding when sealed/merged.
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream -> fork.
> **Companions:** `CANON-DEVELOPMENT-PROCESS.md` (governance precedes code),
> `VT-METHOD.md` (house L2 flow), `CANON-CONTEXT-HYGIENE.md` (context is selected
> and externalized, not hoarded in the prompt), `CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING.md`
> (decisions are durable Markdown/ADR), `CANON-DOCUMENTATION-ARTIFACT-STANDARDS-001.md`
> (artifact standards), and `CANON-VERSIONING-001.md` (versioned artifacts).

---

## 1. Root Principle

> **VT-METHOD is knowledge-native: product-shaping work starts from validated
> knowledge, not from isolated feature requests.**

> **Knowledge-Driven Design (KDD) sits underneath the rest of the product method.**

> **VibeThink is not AI-first. VibeThink is knowledge-native and friendship-native.**

> A complex or product-shaping feature cannot be specified until the agent names the
> accepted knowledge baseline it is designing from.

Feature specs answer "what will be built." A Knowledge Pack answers "what must be
understood before a responsible feature spec can exist." Product knowledge does not
become accepted because it appeared in chat, memory, embeddings, a graph, or code. It
becomes accepted when it is reconstructed into a versioned pack, validated by the
repo authority, and cited by future work.

Product-shaping work may not start until the agent has retrieved and cited the
Accepted Knowledge Baseline through the declared knowledge memory adapter.

For VibeThink, the default adapter profile is:

- **Engram** for memory, facts, and cross-session recall.
- **Graphify** for graph relationships, communities, and semantic navigation.
- **Versioned Markdown** as the auditable source of truth.

Engine output is retrieval evidence. The accepted Markdown Knowledge Pack remains
the authority.

## 1.0. KDD Layer

KDD is the substrate below feature specification, agent execution, product decisions,
and implementation planning. It means the project first reconstructs and validates what
is known, then uses that accepted knowledge to shape what should be built.

Order of authority:

```text
validated knowledge -> decision gate -> specification -> governed execution -> learning back into knowledge
```

DevKit owns the reusable KDD pattern: canon, artifact roles, templates, gates, adapter
contract, and adoption path. Product repos consume it as L3 bindings. A consumer may be
the first place that exposes a missing generic rule, but it is not the canonical home for
that rule. Generic gaps are elevated to DevKit first, then consumed back down by
orchestrators, work bench systems, verticals, and future projects.

KDD does not replace governance. It feeds governance with accepted product/business/domain
understanding so the decision gate and spec are not operating from isolated feature text.

## 1.1. VibeThink Identity

VibeThink is the methodological, technical, and operational home for building
vertical systems with agents. It is not only one product and not only one company.

- **VibeThink as method:** business knowledge, decisions, rules, real cases, and
  operating memory are part of the system, not external documentation.
- **VibeThink as platform:** the development kit, work bench layer, graph engine,
  memory engine, orchestrator, and agents provide memory, traceability, governance,
  and intelligent assistance.
- **The relational assistant plane:** the assistant/orchestration layer understands
  people, relationships, conversations, context, signals, assistance, and coordination.
  It accompanies and orchestrates verticals; it does not replace them.
- **Verticals as products:** each vertical knows its own domain, while inheriting
  method, governance, memory, agents, and tooling from the house platform.
- **DevKit as technical/methodological constitution:** DevKit does not contain each
  vertical's business knowledge, but it defines how a VibeThink project reconstructs,
  validates, persists, and is forced to use that knowledge.

North-star statement:

> VibeThink builds knowledge-native operating systems for real organizations:
> software where validated business knowledge, agent memory, human decisions and
> governed execution are part of the same loop.

House identity statement:

> Knowledge-native governs what agents must know. Friendship-native governs how agents
> relate, remember, ask, and act.

Friendship-native means agents behave as trusted long-term companions: they maintain
continuity, remember responsibly, respect boundaries, ask before acting, and help people
coordinate around real work.

Layer guard: this canon does not move product-specific relationship models, assistant
protocols, runtime surfaces, or vocabulary into DevKit. Those semantics stay in their
product layer unless the Principal Architect explicitly seals a house-level abstraction.

## 2. When This Triggers

The Knowledge Baseline step is required before specification when the work is any of:

- product-shaping: changes product identity, user promise, workflows, or domain behavior;
- complex: crosses multiple modules, roles, user journeys, data flows, or policy surfaces;
- AI-assisted/model-driven: an assistant, worker, extraction, routing, or model-chosen action;
- cross-boundary: touches permissions, roles, regulated/sensitive data, money, external actors,
  or irreversible operational consequences;
- new-domain: a repo, vertical, workflow, or domain area where accepted knowledge is missing.

Trivial fixes, copy edits, mechanical refactors, and isolated implementation repairs do not
require a Knowledge Pack. If they touch a product-shaping surface, they cite the existing
baseline or explicitly say why the baseline is not relevant.

## 3. Knowledge Reconstruction Sprint

A Knowledge Reconstruction Sprint is the governed way to turn scattered project knowledge
into a baseline a fresh agent can consume.

1. **Sweep declared sources.** Read the whole project area and the repo-declared sources:
   docs, specs, ADRs, canons, comms, findings, code comments with decision links, test
   fixtures, examples, runbooks, support notes, and any L3-declared external sources.
2. **Reconstruct knowledge.** Extract business context, product context, operating rules,
   vocabulary, worked scenarios, anti-examples, decision links, sources, and open questions.
3. **Write a Candidate Knowledge Pack.** The output is a versioned filesystem artifact,
   not a chat summary.
4. **Ask for validation.** The principal/human authority validates, corrects, rejects, or
   marks open questions.
5. **Promote to Accepted Knowledge Baseline.** Accepted packs become the required read/cite
   source for future product-shaping work in that scope.
6. **Feed learning back.** New findings, decisions, examples, and rejected assumptions either
   amend/supersede the pack or stay as open questions with owner/status.

## 4. Knowledge Lifecycle States

| State | Meaning | Allowed use |
|---|---|---|
| `raw-input` | Chat, notes, docs, code, research, support traces, or other unreviewed material | Evidence only; never source of truth |
| `candidate` | Reconstructed pack awaiting validation | Can guide review, but cannot govern product-shaping specs alone |
| `accepted` | Validated by the repo authority for a scope/version | Required baseline for product-shaping work in that scope |
| `superseded` | Replaced by a newer accepted pack | Historical evidence; cite the replacement |
| `rejected` | Reviewed and not accepted | Must not be used as baseline; keep reason |

An accepted pack is not canon. It binds product understanding for a scope. If it creates
law, architecture, or policy, the relevant decision/canon/spec artifact is still required.

## 5. Knowledge Pack Roles

The kit defines roles; L3 repos bind concrete paths and filenames. The reference template
uses:

- `PACK-METADATA.md` — id, version, scope, status, validator, freshness, supersession.
- `BUSINESS-CONTEXT.md` — business problem, actors, why the domain matters.
- `PRODUCT-CONTEXT.md` — product identity, north star, user promise, non-goals.
- `DOMAIN-VOCABULARY.md` — domain terms, translations, aliases, forbidden names.
- `OPERATING-RULES.md` — laws, policies, permissions, invariants, non-negotiables.
- `DECISION-LINKS.md` — ADR/canon/spec links and why they apply.
- `WORKED-SCENARIOS.md` — concrete happy, exception, edge, and longitudinal scenarios.
- `ANTI-EXAMPLES.md` — tempting wrong implementations and why they violate intent.
- `OPEN-QUESTIONS.md` — unresolved questions with owner and status.
- `SOURCES.md` — provenance: docs, PRs, comms, research, interviews, traces.

## 6. Promotion and Authority

The promotion path is:

```text
raw input -> candidate pack -> human/principal validation -> accepted baseline
```

Validation records at minimum: validator, date, scope, status, version, and open questions.
If the validator changes the knowledge, the pack is amended before acceptance. If the pack
is stale, it is superseded or marked candidate again; agents do not silently rely on stale
product knowledge.

## 7. Feature Binding

A product-shaping feature/spec/briefing carries a `Knowledge Baseline` section before it
is approved for implementation. The section names:

- accepted pack id/version/path;
- declared knowledge memory adapter used to retrieve it;
- why it applies to this feature;
- any open questions that block or constrain the work;
- any scenario or anti-example the implementation must preserve or avoid.

A complex feature with no baseline is incomplete. A baseline link to a candidate pack is
allowed only when the work is explicitly a knowledge-reconstruction task, not a feature
implementation.

## 8. Engine Boundary and Memory Adapter

DevKit defines the method and artifacts. Its L1 core does not depend on any one retrieval
or memory engine.

- A graph engine may index packs and reveal relationships.
- A memory/recall engine may retrieve facts across sessions.
- Search, embeddings, vector stores, and notes may help reconstruction.

VT-METHOD adds one operational requirement: the repo declares a **Knowledge Memory
Adapter** before product-shaping work starts. The adapter says how an agent retrieves
accepted baselines, how freshness is checked, and which engines are active. A repo may
bind a markdown-only adapter, a graph adapter, a memory adapter, or a composite adapter,
but it may not leave the retrieval path implicit.

None of those engines is the source of truth. The accepted Knowledge Pack is the source
of truth for product understanding. Engine output that contradicts an accepted pack is
a finding or an amendment candidate, not an override. If the declared adapter is stale
or unavailable, the local/session health surface must go RED/WARN; agents do not proceed
as if retrieval had succeeded.

## 9. L3 Binding

Each consuming repo declares:

- knowledge root and pack path convention;
- feature/spec roots that must cite baselines;
- required pack artifacts;
- Knowledge Memory Adapter name/profile, active engines, freshness checks, and fallback;
- metadata/status vocabulary if adapted;
- what feature classes trigger the baseline gate;
- optional engines and their health/freshness checks;
- validator/approver role;
- freshness/supersession cadence.

The L3 binding points to this canon. It does not copy business/product content into the
dev-kit.

If an L3 repo discovers a reusable gap in this method, the path is:

```text
finding/handoff to DevKit -> DevKit canon/template/gate amendment -> L3 adoption
```

The L3 repo may carry a temporary local implementation while the gap is under review,
but it must label it as local/temporary and must not present it as the reusable canon.

## 10. Gate

`check-knowledge-pack.mjs` is a structural gate. It verifies the preconditions for review:

- declared pack directories exist;
- required artifacts exist and are non-empty;
- a Knowledge Memory Adapter is declared for VT-METHOD use;
- Markdown references resolve locally when they are file references;
- open questions include owner and status;
- feature docs marked as complex/product-shaping/AI-assisted/cross-boundary declare a
  `Knowledge Baseline` section with a resolvable baseline reference and adapter citation.

It does **not** judge semantic quality, correctness, or completeness of the business
knowledge. Humans/principals review that.

## 11. Anti-Patterns

- Chat-only product knowledge.
- Feature spec first, product understanding later.
- "The model remembers" as authority.
- Raw embeddings/graph/memory treated as source of truth without an accepted pack.
- Dumping the whole repo into context instead of selecting the accepted baseline.
- Requiring packs for trivial fixes.
- Product-specific knowledge lifted into the dev-kit.
- Consumer-local KDD canon that should have been elevated to DevKit first.
- Open questions with no owner/status.

## 12. Prior-Art Check

This method inherits the pattern, not an implementation, from knowledge-driven design and
context-engineering practice:

- knowledge should be captured as reusable design intent, not rediscovered per project;
- context must be written, selected, compressed, and isolated rather than stuffed into a
  prompt wholesale;
- agent software projects need durable, versioned project context that can be validated.

The dev-kit adaptation is deliberately lightweight: a pack, a validator, a baseline
reference, and a structural gate.

## Fire-Test

This canon names no vertical product, school, domain, or model as required. The L1 core
does not require a specific graph or memory engine. The VibeThink L2 profile declares
Engram + Graphify + Markdown as its default Knowledge Memory Adapter, while preserving
Markdown Knowledge Packs as the auditable source of truth.

## Provenance

Raised by a VibeThink method handoff on 2026-06-28: agents were correctly producing
feature specs while missing scattered business/product knowledge that existed across
chats, specs, decisions, findings, and code. Marcelo authorized a Knowledge-Native
VT-METHOD path and then sharpened it as KDD beneath everything else: reconstruct first,
validate the pack, then specify; define the reusable rule in DevKit before any consumer
turns it into local canon.
