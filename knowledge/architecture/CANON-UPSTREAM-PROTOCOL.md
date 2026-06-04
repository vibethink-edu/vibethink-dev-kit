# CANON-UPSTREAM-PROTOCOL — Universal protocol for adopting and tracking upstream code

**Status:** DRAFT — awaiting Marcelo (Principal Architect) seal
**Date:** 2026-05-25
**Scope:** Every repo that adopts, forks, or pins external code. Cross-product (agnostic).
**Companion canons:** [`CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING`](./CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING.md) (the decision-capture spine this canon plugs into).

---

## §1 — Principle (and the brownfield framing)

Every repo with code is **brownfield** the moment it has code. The moment you build on something external — a fork, a pinned dep, a CLI tool, a design system, an AI SDK, an LLM provider — you have an **upstream**. Two facts follow:

> **An unreviewed upstream is invisible technical debt. An upstream reviewed and rejected on purpose is an architectural decision.**

Both states are acceptable; the third — *"we have it, but nobody ever looked"* — is the failure mode this canon prevents.

Brownfield matters because greenfield-style thinking ("we just pick the best lib") ignores the existing surface the lib touches: existing styles, existing types, existing licenses, existing version pins. Adopting an upstream in a brownfield context is **always** a multi-surface decision.

---

## §2 — Constitutional rule

Before **adopting**, **installing**, **forking**, or **integrating** any substantial third-party dependency, the agent **MUST**:

1. Run the 6-step Adoption Protocol (§3).
2. Obtain an explicit decision from the human authority of the consuming repo.
3. Write the decision as an **ADR** (per the decision-capture canon — trigger-before-implementation rule) **before code lands**.

**Applies to:** form engines, CMS engines, editors, AI SDKs, LLM providers, payment processors, UI libraries with their own CSS, component frameworks, build tools, databases, cloud services, design-system kits, observability stacks, image/video processors, schedulers, queues.

**Does NOT apply to:** small utilities without their own CSS or restrictive license (date-style, common-collections, schema-validators, uuid, etc.). Use common sense; if in doubt, run the protocol.

---

## §3 — The 6-step Adoption Protocol

### Step 1 — STOP (breathe)

No install. No code. No `pnpm add` / `pip install` / `cargo add` / equivalent. **Declare the intent to evaluate** out loud and pause.

### Step 2 — STUDY THE FULL ECOSYSTEM

Not just the package that looks useful. The whole project's surface.

| What to investigate | Why |
|---|---|
| All repos in the project/org (not only the one that seems handy) | Some pieces may be commercial-only, copyleft, or carry toxic transitive deps |
| Exact license of each component (permissive, copyleft, commercial proprietary) | A commercial or copyleft license can contaminate the whole consuming repo |
| Pricing if commercial (tiers, per-seat, perpetual vs subscription) | The human decides if the cost is acceptable |
| Maintenance state (last release date, open issues, sole-maintainer risk, governance) | An unmaintained upstream is debt with no exit |
| Public security history (CVEs, response time) | Carrying an upstream means carrying its security posture |

### Step 3 — LICENSE & COMPATIBILITY

Verify the license is compatible with the consuming repo's license and with **every transitive dependency** relevant to distribution. Document the verdict.

### Step 4 — PRICING & COST

Document one-time + recurring costs. If commercial, note when the cost recurs (per dev, per seat, per year) and which tier matches actual usage. A "free tier" with a hard ceiling counts as commercial.

### Step 5 — ALTERNATIVES (at least 3, including the "do nothing" option)

- An **OSS alternative** with comparable maturity.
- A **pattern-extraction** alternative — build it ourselves, taking the idea/design but not the code (this is the **default policy**, §5).
- A **defer / do nothing** alternative — explicit choice not to act now.

### Step 6 — DECISION

Human authority of the consuming repo decides one of: `ADOPT` / `FORK` / `EXTRACT-PATTERN` / `REJECT` / `DEFER`. The decision is captured as an **ADR** with alternatives, license verdict, cost, and the why.

**No code lands before the ADR is written.** A code commit referencing an upstream without a matching ADR is a finding (§9).

---

## §4 — Taxonomy of upstream types

Every upstream falls into one of these categories. The handling pattern differs by type; the consuming repo's L3 binding declares which instances live in which category.

| Type | What it is | Pattern | Where it lives |
|---|---|---|---|
| **Fork-adapted** | Source copied/adapted; we modify and sync periodically | Per-package `UPSTREAM.md` (§6.1) + cadence | Inside the consuming repo at the package's root |
| **Pinned dep** | Used as-is at a pinned version; we don't modify | Lockfile + central baseline doc (§6.2) | Lockfile + a per-repo baseline doc |
| **Runtime / framework** | The platform the consuming repo builds on (render lib, routing layer, build tool) | Baseline + ADR on every major bump | Baseline + ADR archive |
| **Design-system kit** | UI components, often with their own CSS / tokens | Per-kit doc + token-alignment rule | Inside the consuming repo, scoped to the UI package |
| **AI / model provider** | Vendor-locked-in unless explicitly abstracted | Per-provider doc + an abstraction layer between the provider and the rest of the code | Inside the consuming repo, scoped to the AI/inference layer |
| **CLI / personal tool** | Operator-personal across products; not part of any product repo | Operator-personal bitácora **outside** any product repo (§8) | The operator's personal storage |

This taxonomy is **the routing-by-type rule**: each type's home is declared once and not negotiated per instance.

---

## §5 — Default policy: extract patterns, not dependencies

When evaluating any new upstream above the small-utility threshold, the **default** is:

> Read the source. Take the **idea, design, or shape**. Implement it ourselves.

Only adopt as a dependency when **all** of the following hold:
- the surface is large enough that re-implementing is genuinely wasteful,
- the upstream's maintenance is robust (active org, multiple maintainers, fast security response),
- the license is clean for our use,
- the decision is captured as an ADR.

This avoids: vendor lock-in, bug inheritance, license bleed, and "we adopted X two years ago and now we can't move."

This default is overridable by an ADR. The default is not a ban — it is the burden of proof shifting onto the *adopt* side.

---

## §6 — Mechanism patterns

The consuming repo binds these patterns to its own paths and files (§7).

### 6.1 Per-fork artifact: `UPSTREAM.md`

Every forked package has an `UPSTREAM.md` at its root with:
- upstream URL,
- license,
- snapshot date or upstream commit,
- the local-vs-upstream diff summary (what we changed and why),
- the assigned **cadence** (§6.4),
- the next-review date.

This is the per-fork accountability artifact. Without it, the fork is unreviewable.

### 6.2 Baseline-versions document

A single document per consuming repo listing every pinned major dependency with: name, version, source URL, license, last-reviewed date, drift flags. Updated when versions bump or new pins land.

### 6.3 Drift detection

A periodic check that compares the baseline doc against the lockfile and flags drift: silent version bumps, two versions of the same lib across packages, sole-maintainer abandonment, license changes upstream. The mechanism (script, CI gate, manual review) is the consuming repo's choice; the **existence** of the check is mandatory.

### 6.4 Cadence framework

Every upstream is assigned exactly one of:
- **Monthly** — high-velocity upstreams that ship often.
- **At-release** — version-tag upstreams; we sync at upstream's release events.
- **As-needed** — slow-moving or utility upstreams; sync when something we need lands.

The cadence is declared once in the inventory and is the contract: missing a cadence cycle is itself a finding.

---

## §7 — L3 binding (what the consuming repo owns)

This canon is the spine. The consuming repo's L3 binding **adds** the product-specific content the spine cannot know:

- The actual **inventory of forks** (which upstreams, where in the repo, license, cadence).
- The actual **baseline doc path** (concrete file location for the dependency baseline).
- The actual **drift-detection check** (script path or CI gate name).
- **Stack-specific compatibility checks** (e.g., "compat with the chosen render lib version", "compat with the chosen build tool") — these only make sense inside a specific product's stack.
- **Product-specific overlays** (e.g., reject upstreams that violate the product's vocabulary or governance posture — a domain-specific blacklist).
- **Originating incidents** as evidence (the time we adopted X badly and what we learned).

The L3 binding **points at this canon as the spine**; it does NOT re-write the principle, the 6-step protocol, or the taxonomy. If the L3 binding repeats those, it drifts.

---

## §8 — Operator-personal bitácora (separate axis)

A separate axis from L1/L2/L3: the **operator's personal cross-product tooling**. CLIs and tools the human operator uses across multiple products (code indexers, code-graph tools, version managers, profile managers) live in a **bitácora outside any product repo**.

This is operator-personal hygiene, not product governance. The same operator may track 10 personal CLIs across 5 products without any of them being a product upstream. Keep this axis separate to avoid polluting product L3 bindings with operator-personal noise.

---

## §9 — Linkage to decision-capture

Adopting, forking, or pinning a new upstream is a **decision-capture trigger** (see the decision-capture canon — trigger-before-implementation rule). The 6-step protocol's output is the ADR that fulfills that trigger.

The reverse is also true: if a future agent sees an upstream in the inventory **without a matching ADR**, that is a finding to surface. The upstream may have been adopted before this protocol existed; the consuming repo should backfill the ADR retroactively (marked `[RECONSTRUCTED]`).

---

## §10 — What this canon does NOT do

- It does **NOT** prescribe specific tools (commit hooks, dependency scanners, drift CI). The consuming repo picks its tooling.
- It does **NOT** prescribe specific licenses to accept or reject. The consuming repo's authority decides license posture.
- It does **NOT** replace the decision-capture canon — it sits on top of it for the upstream-adoption case.
- It does **NOT** define the "small utility" threshold quantitatively. Use common sense; if in doubt, run the protocol — the cost of running it is lower than the cost of an undocumented adoption.
- It does **NOT** govern the operator-personal axis (§8); that lives outside any product repo by design.

---

## Provenance

This canon was lifted from two product-side (ViTo) canons that had the agnostic substance buried inside product-specific binding:
- ViTo `CANON-UPSTREAM-GOVERNANCE-001` (SEALED 2026-04-08) — the principle, the inventory pattern, the cadence framework.
- ViTo `CANON-THIRD-PARTY-ADOPTION-PROTOCOL-001` (DRAFT) — the 6-step protocol, the constitutional rule, originating from the SurveyJS adoption incident (2026-04-14).

The product-specific content (the actual inventory, baseline file path, stack checks, incident records, vocabulary overlay) **remains at L3** in the consuming repo and binds to this spine. Once this canon is sealed, the two ViTo canons restructure to point at this spine and keep only their L3 content.
