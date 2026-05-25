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

## The L1 pillars, VibeThink-bound

| L1 pillar | VT-Method binding |
|-----------|-------------------|
| **Governance** | tiered canon (`SEALED → CANON → DRAFT`) under a single Canon Index; one named approver (the Principal Architect) |
| **Decision gate** | the **3-Gate Preflight**: structural-impact questions (SI count) + author clarity + a security-surface modifier → methodology choice |
| **Specification pipeline** | **Direct Execution** (default — briefing + V-xx matrix) · **structured spec-kit** (complex discovery) · **interchange-spec** (laboratory) |
| **Governed execution** | author briefing → executor implements → author verifies against the V-xx matrix, over the shared comms channel |
| **Lifecycle artifacts** | PRD · deployment/readiness plan · append-only log · roadmap · **per-package** changelog |
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
