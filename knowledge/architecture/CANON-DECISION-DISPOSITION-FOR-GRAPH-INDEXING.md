# CANON — Decision Disposition for Graph Indexing (universal · agent-agnostic)

> **Scope:** every repo that inherits this kit.
> Vendor-neutral, product-neutral, tool-neutral.
> **Status:** approved by the architect for supra-repo integration (fire-test
> passed: no product, vendor, tool, or person name appears here).
> **Amended 2026-05-22:** §3.2 / golden rules — inline code markers are
> **advisory-only** (a real indexer does not harvest them); **Markdown/ADR is the
> strong indexable binding**. Corrected on empirical verification, not assumption.
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
