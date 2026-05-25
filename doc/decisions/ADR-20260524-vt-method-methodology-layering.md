# ADR-20260524-vt-method-methodology-layering

**Status:** ACCEPTED — execution pending (a future focused session)
**Date:** 2026-05-24
**Decider:** Marcelo (Principal Architect)

## Decision

The development **methodology** (slice → decision gate → spec-methodology
selection → lifecycle artifacts: PRD/PRDI/CHANGELOG/ROADMAP/BITÁCORA → findings)
is promoted to the supra-repo (dev-kit) **by layer**:

- **L1 — neutral core (dev-kit):** the bare process *skeleton* as agnostic
  principle, **with no name** (passes the §8 fire-test: no brand, product, or
  methodology name).
- **L2 — house methodology (dev-kit, branded on purpose):** named
  **"VibeThink Method (VT-Method)"** — the VibeThink instantiation of the L1
  skeleton (the concrete gate questions, the SpecKit/OpenSpec/Direct-Execution
  choices, the artifact shapes).
- **L3 — product (stays in its product repo):** everything particular to one
  product (for ViTo: amistad/Heartbeat/XMS, the SI categories, SpecKit-ViTo
  cherry-picks, tenant bindings). **L3 never moves to the dev-kit.**

**Naming:** `VT` = **VibeThink** (the org), **not** ViTo (a product) — because
L2 is the house layer shared by all VibeThink products. Define once as
"VibeThink Method (VT-Method)", then use "VT-Method".

**Mechanism:** a **split/extract, not a cross-repo file move** — the same pattern
already used for `AGENTS_UNIVERSAL.md` (review finding #3, 2026-05-22). The generic
essence is *authored fresh and scrubbed* in the dev-kit; the product docs are
*trimmed to their binding + a pointer upward*. For **docs**, the consuming repo
reads by **reference/pointer** (no copy, no runtime) — so this is independent of
the unresolved mount-vs-copy inheritance question (orchestrator TASK #2734, which
concerns runnable artifacts).

## Why

- The methodology today lives entirely in the ViTo product repo, scattered across
  ~6 canon files; the **process is generic** and should be inheritable by every
  repo / every agent via the shared spine ("the process is not the core").
- The term **"VtHINK" is overloaded** — it means (1) the historical product name,
  (2) a React architecture pattern, and (3) a specification methodology. A single
  unambiguous name removes the confusion.
- Putting L1 in the neutral core + L2 (VT-Method) in the house layer keeps the
  spine brand-free while giving the methodology a clear name where branding is
  allowed.

## Alternatives rejected

- **Keep everything in ViTo, just rename + dedup** — rejected: does not make the
  process inheritable by other repos/agents (the stated goal).
- **Physically move files cross-repo (`git mv`)** — rejected: separate repos don't
  share history (a move loses it anyway), it breaks ~20+ AGENTS.md references, and
  it would entangle with the unresolved mount-vs-copy mechanism (#2734).
- **Add "VT-Method" as a new name alongside VtHINK / Canon-First** — rejected:
  that *worsens* the overload. VT-Method must **replace** "VtHINK" (alias) and
  absorb "Canon-First Development" as the same thing. The React pattern keeps its
  own separate name.

## Consequences

Execution (a future focused session) must produce, and is **accepted only when**:

1. **Fire-test** — L1 greps clean of any brand / product / methodology name.
2. **Single-source** — each concept has exactly **one** normative home (L1
   principle · L2 binding · L3 product) with pointers, never two normative copies.
   (Note: most current "duplication" is *deliberate layering*, which is healthy;
   the real debts are the three below.)
3. **Inherit-test** — a fresh agent in any repo can reach VT-Method via the spine.

Three known debts to resolve during execution:
- **Seal the unifier** — `CANON-DEVELOPMENT-METHODOLOGY-001` is still DRAFT.
- **Define slicing** — used operationally everywhere, defined nowhere.
- **Retire "VtHINK"** — alias → VT-Method; separate the React pattern.

Until executed, the methodology remains where it is; this ADR records the agreed
structure, name, and mechanism so execution starts resolved.

## Evidence

A two-repo methodology map (2026-05-24) confirmed the process lives only in ViTo,
that apparent duplication is mostly intentional layering, and that the dev-kit
already practices L1/L2/L3 separation (`AGENTS_UNIVERSAL.md` L1 +
`AGENTS_METHODOLOGY_VIBETHINK.md` L2). This ADR extends that proven pattern from
agent/environment bindings to the development process itself.
