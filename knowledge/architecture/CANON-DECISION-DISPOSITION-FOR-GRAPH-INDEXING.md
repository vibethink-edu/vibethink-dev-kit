# CANON — Decision Disposition for Graph Indexing (universal · agent-agnostic)

> **Scope:** every repo that inherits this kit.
> Vendor-neutral, product-neutral, tool-neutral.
> **Status:** approved by the architect for supra-repo integration (fire-test
> passed: no product, vendor, tool, or person name appears here).
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

A repo's indexing layer extracts the *why* that is **written** — inline decision
comments, docstrings, and design rationale in docs — and turns it into graph
nodes. What it cannot index is what was never written. This norm closes that gap
**without adding any tool**: write the decision where the indexer already looks.

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

### 3.2 Local code decision → an inline marker the indexer extracts

```
# WHY: <reason this approach was chosen over the obvious alternative>
# DECISION: <the choice + the trade-off> (see ADR-YYYYMMDD-slug)
# HACK: <workaround for an external bug — remove when #NNNN is resolved>
# NOTE: <a non-obvious constraint a future reader must respect>
```

If the local decision has an ADR, the comment **links to it** (`see ADR-xxxx`) so
the indexer connects the nodes.

### 3.3 Domain decision → design rationale in the domain doc

Decisions that live in canons / specs are already indexable **if** they use
explicit decision language ("we decided X because Y"), not descriptive language
("X is this way").

## 4. Golden rules

1. **Explicit, not implicit.** The indexer extracts only what is stated directly.
   "We decided to use X because Y" indexes better than "the system uses X".
2. **One decision = one canonical place.** Architecture → ADR. Local → comment.
   Do not duplicate; link.
3. **Every decision carries the *why* + the rejected alternatives.** The value to
   a future agent is knowing what **not** to do, and why.
4. **After deciding in conversation, write it before closing.** The conversational
   decision becomes a declared, indexable one in the same flow.
5. **Cross-repo.** This is supra-repo discipline; it applies to every repo that
   inherits this kit.

## 5. What this norm does NOT do

- It does **not** require documenting trivial decisions (rename a variable, fix a
  typo). Threshold: *would a future agent benefit from knowing why?* Yes → ADR or
  comment. No → skip.
- It does **not** replace or add an indexer. It is discipline over the indexing
  layer the repo already has.
- It does **not** require an automatic decision-capture tool. Discipline first.
  Only if decisions keep getting lost **despite** this norm is an automatic
  capture layer reconsidered.

## 6. Per-repo binding

This neutral canon defines the **discipline**. Each inheriting repo binds it to
its own stack — declared in that repo's own layer, never here:

- which indexer consumes the written decisions,
- the exact inline-marker syntax that indexer extracts,
- the decisions folder path (`doc/decisions/` vs `docs/adr/`).

The discipline is universal; the indexer and its marker dialect are product-level.

## 7. Inheritance

This kit is the **upstream** of governance. Each repo is a **fork** that inherits
this norm and binds it (§6). Anything specific to a product, a vendor, a tool, or
a person stays in that repo's own layer — it never flows into this neutral core.
