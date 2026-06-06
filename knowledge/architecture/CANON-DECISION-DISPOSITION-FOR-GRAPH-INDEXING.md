# CANON — Decision Disposition for Graph Indexing (universal · agent-agnostic)

> **Scope:** every repo that inherits this kit.
> Vendor-neutral, product-neutral, tool-neutral.
> **Status:** SEALED 2026-06-04 by Marcelo (Principal Architect) — Tier C consolidation; approved for supra-repo integration (fire-test
> passed: no product, vendor, tool, or person name appears here).
> **Amended 2026-05-22:** §3.2 / golden rules — inline code markers are
> **advisory-only** (a real indexer does not harvest them); **Markdown/ADR is the
> strong indexable binding**. Corrected on empirical verification, not assumption.
> **§3.8 amendment SEALED 2026-06-05 by Marcelo (agnostic-lift A#17):** added *documentation depth for complex / constitutional decisions* (3-part: formal spec + architectural context + concrete cross-context examples), lifted from ViTo `CANON-COMPLEX-DECISION-DOCUMENTATION-001`.
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Family:** supra-repo discipline, together with **Cross-Repo Artifact
> Isolation** (`CANON-CROSS-AGENT-CONTEXT-LAYERING.md` §4). Same discipline set.

## 1. Principle

> **Technical decisions are first-class citizens of the repository.**

A decision that lives only in a conversation with an agent and is never written
into the repo is lost. Therefore: **every decision that affects architecture, a
contract, or behavior is written into the repo, in a disposition that a
knowledge-graph indexer can extract.**

## 2. Why (this is not bureaucracy)

A repo's indexing layer extracts the *why* that is **written in Markdown / ADRs**
— design rationale in docs and canons — and turns it into graph nodes. (Verified
2026-05-22: a real indexer harvests Markdown/ADR headings, but does **not** harvest
inline code comments as nodes — it indexes the function, not the comment; see §3.2.)
What it cannot index is what was never written. This norm closes that gap
**without adding any tool**: write the decision where the indexer already looks —
in an ADR or canon. Inline markers are advisory for the human reading the code, not
the indexable binding.

## 3. Canonical disposition of a decision

### 3.1 Architecture / contract decision → an ADR in a known folder

Location (declared per repo): `doc/decisions/` or `docs/adr/`.
Filename: `ADR-YYYYMMDD-slug.md`. Minimum structure:

```markdown
# ADR-YYYYMMDD-slug

**Status:** ACCEPTED | SUPERSEDED-BY ADR-xxxx | DEPRECATED
**Date:** YYYY-MM-DD
**Decider:** <the architect, or the domain architect>

## Decision
One clear imperative sentence: what was decided.

## Why
The rationale. Why this option. Explicit, not implicit — the indexer tags it as
extracted only when the reasoning is stated directly.

## Alternatives rejected
- Option A — rejected because <reason>
- Option B — rejected because <reason>

## Consequences
What changes. What becomes easier / harder.

## Evidence
Link to the PR, message, issue, or conversation that originated the decision.
```

### 3.2 Local code decision → an inline marker (advisory) + an ADR if it must be indexed

```
# WHY: <reason this approach was chosen over the obvious alternative>
# DECISION: <the choice + the trade-off> (see ADR-YYYYMMDD-slug)
# HACK: <workaround for an external bug — remove when #NNNN is resolved>
# NOTE: <a non-obvious constraint a future reader must respect>
```

> **Amended 2026-05-22 (empirical verification).** A real knowledge-graph indexer
> was run against real code. It harvests decisions from **Markdown headings / ADRs**
> at full confidence, but does **NOT** harvest **inline code comments** as graph
> nodes (it indexes the function, not the comment). Therefore:
>
> - **The strong, indexable binding is Markdown/ADR** (§3.1 / §3.3). A decision that
>   **must be indexable** is written there.
> - **Inline markers are advisory-only** — valuable for the human reading the code,
>   but not a substitute for an ADR, and **not a strong requirement** of this norm
>   until a dedicated inline-marker extractor exists.
> - If a local decision matters enough to index, write the ADR and let the inline
>   comment **link to it** (`see ADR-xxxx`).

### 3.3 Domain decision → design rationale in the domain doc

Decisions that live in canons / specs are already indexable **if** they use
explicit decision language ("we decided X because Y"), not descriptive language
("X is this way").

### 3.4 Extended ADR template (for SEALED / CONSTITUTIONAL decisions)

For decisions that go beyond architecture/contract into **constitutional** territory (canon updates, policy decisions, decisions that bind future agents), the §3.1 template extends with three additional sections that appear **after `## Consequences` and before `## Evidence`**:

```markdown
## What this decision does NOT change
Negative scope: what stays the same. Prevents the decision from being read as
broader than intended. Required for SEALED decisions; optional otherwise.

## Reactivation conditions
The strict, accumulative conditions under which this decision can be revisited.
Required when the decision is SEALED-with-reactivation-allowed; omit if the
decision is permanent.

## Cross-references
- Related ADRs / canons that this decision interacts with.
- Decisions superseded by this one (if any).
- Decisions that supersede this one (back-link, when applicable).
```

The minimal §3.1 template stays for routine ADRs. The extended template is required for SEALED-track and constitutional decisions because they must remain reviewable and traversable years later.

### 3.5 Status lifecycle of a decision

A decision moves through a small state machine. The `Status:` header field declares the current state:

| State | Meaning | Transitions from |
|-------|---------|------------------|
| `DRAFT` | Being formulated; not yet authoritative | — |
| `CANDIDATE` | Complete and ready for review; under consideration | `DRAFT` |
| `ACCEPTED` | Approved for use; binding but not yet constitutional | `CANDIDATE` |
| `SEALED` | Constitutionally binding; reactivation conditions apply | `ACCEPTED` (by named authority) |
| `SUPERSEDED-BY ADR-xxxx` | Replaced by a newer decision; original retained for historical context | `ACCEPTED` / `SEALED` |
| `DEPRECATED` | No longer in use; not replaced (the decision is simply no longer applicable) | `ACCEPTED` / `SEALED` |
| `REACTIVATED` | Previously SUPERSEDED or DEPRECATED and now active again — rare; requires evidence the reactivation conditions are met | `SUPERSEDED` / `DEPRECATED` |

The consuming repo's L3 binding may add gates for transitioning between states (e.g., who can promote `CANDIDATE` → `SEALED`, what evidence is required, who can REACTIVATE a SUPERSEDED decision).

### 3.6 Activation triggers (when this norm fires automatically)

The norm activates when the work touches:

1. **Technology evaluation** — evaluating an external tool or platform for adoption.
2. **Architectural decision** — choosing between approaches (build vs. buy, native vs. external, sync vs. async, etc.).
3. **Gap analysis** — identifying missing capabilities vs. an external benchmark or industry standard.
4. **Feature design** — significant new feature design where the shape of the system changes.
5. **End of long architectural conversation** — when a long-form conversation (>20 substantive messages) is closing and decisions exist that would otherwise be lost.

This complements §4 Golden Rule 6 (*trigger before implementation*) which activates on dependency / runtime / CDN / font / render-source / contract / cross-tenant changes. §3.6 covers the **conversational / evaluative** half; Golden Rule 6 covers the **implementation** half.

When a trigger fires, the agent **explicitly surfaces** it to the human authority — *"this is a §3.6 trigger; should I write the ADR before continuing?"* — rather than silently proceeding.

### 3.7 Anti-patterns of decision capture

Five universal failure modes:

1. **"I'll document it later."** Never gets documented. **Solution:** capture **during** or **immediately after** the conversation, while context is fresh.
2. **"Just a quick note in chat."** Chat is ephemeral, no discoverability, no versioning. **Solution:** write the ADR in the repo; link to it *from* chat, not the other way.
3. **"Too much effort to document."** Knowledge lost, work repeated. **Solution:** the cost of the protocol is small; the cost of not capturing is large.
4. **"The agent already knows this."** Agent memory is volatile; new sessions and new agents lose it. **Solution:** the repo is the only persistent memory (per `CANON-AGENT-COLLABORATION` §1).
5. **"Documenting after the fact."** Details forgotten, nuance lost, reconstruction incomplete. **Solution:** capture **during** or **immediately after** — not weeks later.

---

### 3.8 Documentation depth for complex / constitutional decisions

The minimal ADR (§3.1) and the extended ADR (§3.4) capture *the decision*. When a decision is **complex**, the capture needs more **depth**. A decision is complex when **any** of these hold: it defines or amends a **capability / subsystem**; it touches **3+ canons or specs**; it requires **independent review before implementation** (the architecture-review gate); it introduces a **pattern reused across contexts**; or it has **survived multiple sessions unresolved**.

For a complex decision, the documentation has **three parts** (one document with sections, or linked documents — but all three must exist):

1. **Formal specification** — the problem statement; the options considered (**≥2**, each with pros / cons / risks); the chosen option with justification; the schema / contract if any; which documents are created / amended / superseded; cross-cutting dependencies. *Tone: technical, auditable.*
2. **Architectural context** — how the decision fits the existing system and what it connects to; its cross-cutting impact (multi-tenant, cost/metering, evidence/audit, and the layers that participate). *Tone: explanatory, system-level.*
3. **Concrete examples** — **≥3** scenarios (**happy path / exception / edge**) across **≥2 different contexts** (proving the decision is not context-specific); each showing the trigger, the actors, the sequence, the outcome, and the audit trail produced. *Tone: plain enough that a non-expert follows it.*

This depth is **what** a complex decision documents; §3.4's extended template is **how** the constitutional sections (does-not-change / reactivation / cross-references) are added. The two compose: a SEALED complex decision uses both. The consuming repo's L3 binding names its concrete complexity thresholds (which subsystems, surfaces, or layers count as triggering) and its example contexts.

---

## 4. Golden rules

1. **Explicit, and in Markdown/ADR.** The indexer extracts only what is stated
   directly — and (verified 2026-05-22) only from Markdown/ADR, not from inline code
   comments. A decision that must be indexable lives in an ADR or canon, not only in
   a code comment; the inline comment complements the human, it does not replace the
   ADR for indexing.
2. **One decision = one canonical place.** Architecture / must-be-indexable → ADR or
   canon; the inline comment links to it. Do not duplicate.
3. **Every decision carries the *why* + the rejected alternatives.** The value to
   a future agent is knowing what **not** to do, and why.
4. **After deciding in conversation, write it before closing.** The conversational
   decision becomes a declared, indexable one in the same flow.
5. **Cross-repo.** This is supra-repo discipline; it applies to every repo that
   inherits this kit.
6. **Trigger before implementation.** When work introduces or expands an
   architecture, contract, behavior standard, AI-assisted / model-driven behavior
   (worker, assistant flow, extraction, or model-chosen action), production
   dependency, runtime framework, CDN/font/render source, or cross-tenant boundary,
   classify the decision before implementing. If it must be remembered by future
   agents, write the ADR/canon first; do not rely on the human to ask for it.

## 5. What this norm does NOT do

- It does **not** require documenting trivial decisions (rename a variable, fix a
  typo). Threshold: *would a future agent benefit from knowing why?* Yes → ADR or
  comment. No → skip.
- It does **not** replace or add an indexer. It is discipline over the indexing
  layer the repo already has.
- It does **not** require an automatic decision-capture tool. Discipline first.
  Only if decisions keep getting lost **despite** this norm is an automatic
  capture layer reconsidered.

## 6. Retrospective reconstruction (the past)

This norm governs **forward** (mandatory from publication). The past is
**partially reconstructible**, inheriting the established "retrospective
reconstruction" pattern: when you start on an area that has history but no
decision record, reconstruct it from available evidence in the same change.

Past decisions fall into three buckets:

| Bucket | Where it lives | Action |
|--------|----------------|--------|
| **Already indexable** | code, docstrings, canons, coordination messages | none — the indexer's next run takes it. Zero reconstruction. |
| **Reconstructible** | git history (commits, PR descriptions), coordination messages — but no ADR | extract to an ADR tagged `[RECONSTRUCTED from <source>]` |
| **Lost** | conversational, no trace in the repo | not recoverable |

Strategy — **never big-bang**:

1. **Index-first.** Run the indexer over existing canons / messages / code
   *before* reconstructing anything — measure how much "why" is already written
   and indexed for free.
2. **Opportunistic (scout).** When you touch an area, reconstruct its decisions
   to ADRs in the same change — same spirit as the testing scout rule.
3. **High-value first.** Major architecture decisions are reconstructed first —
   they are what every new agent needs.
4. **The rest is deferred** — reconstructed when someone needs it.

**Mandatory tag.** Every reconstructed decision carries
`[RECONSTRUCTED from <source>]`, to distinguish direct evidence from retroactive
inference — consistent with the indexer's confidence tagging (extracted vs
inferred).

## 7. Per-repo binding

This neutral canon defines the **discipline**. Each inheriting repo binds it to
its own stack — declared in that repo's own layer, never here:

- which indexer consumes the written decisions,
- the exact inline-marker syntax a dedicated extractor would consume — **if/when
  one exists** (today inline markers are advisory; the indexable binding is the ADR, §3.2),
- the decisions folder path (`doc/decisions/` vs `docs/adr/`).

The discipline is universal; the indexer and its marker dialect are product-level.

## 8. Inheritance

This kit is the **upstream** of governance. Each repo is a **fork** that inherits
this norm and binds it (§7). Anything specific to a product, a vendor, a tool, or
a person stays in that repo's own layer — it never flows into this neutral core.
