# ADR-20260524-supra-repo-inheritance-mechanism

**Status:** ACCEPTED (dev-kit recommendation) — runtime/CI validation owned by orchestrator TASK #2734
**Date:** 2026-05-24
**Decider:** Marcelo (Principal Architect)

## Decision

How a consuming repo inherits the dev-kit (supra-repo) — **by artifact type, hybrid**:

| Artifact | Mechanism | Why |
|----------|-----------|-----|
| **Docs** (canon, methodology, ADRs) | **by reference** — the repo points to the dev-kit path; no copy, no sync | docs need no runtime resolution; a pointer avoids duplication (single-source) |
| **Runnable** (engine `inbox.mjs`/`feed.mjs`, scripts) | **verbatim copy + re-sync** | must resolve at runtime on any machine, independent of whether a mount is present (precedent PR #2690/#2710) |
| **Mount** (`.vibethink-core` symlink) | dev/read convenience only — **not** the durable mechanism | a symlink is convenient but not guaranteed present, so it cannot be the guarantee |

**Durability (the §3.1 enforcement check):** a copy without a drift guard silently
rots. So the verbatim-copy decision **names its check** — a **CI step that verifies
each repo's copied runnable is byte-identical to the dev-kit source** (modulo line
endings). Copy + parity-check = durable inheritance.

## Why

- **Docs by reference, not copy:** copying docs re-creates the duplication problem
  (two normative copies that drift) — exactly what the VT-Method move removed. A
  pointer keeps one source of truth.
- **Runnable by copy:** an agent's hook/script must run even where the dev-kit mount
  is absent; depending on the mount at runtime is fragile. The copy travels with the
  repo and always resolves.
- **Mount is not the guarantee:** it's great for live reading/development, but it can
  be missing on a given machine/checkout, so it can't be what correctness depends on.
- **A copy needs a guard:** without a parity check the copy drifts from upstream
  silently → the decision is only safe because it names the check that catches drift
  (§3.1 — learn/decide, then name the enforcement).

## Alternatives rejected

- **All-mount (symlink everything):** runtime breaks where the mount is absent; makes
  correctness depend on a fragile precondition.
- **All-copy (including docs):** duplicates docs → drift + the dup problem just cleaned
  up in the VT-Method move.
- **Copy without a CI parity check:** the copy rots silently; no drift signal.

## Consequences

- Each consuming repo declares which dev-kit runnables it copies, and carries a CI
  step asserting parity with the dev-kit source.
- Docs are referenced (pointer), never copied.
- **Orchestrator TASK #2734** owns validating the CI/cross-agent execution of the
  parity check; this ADR is the dev-kit's recommended mechanism it validates against.

## Evidence

This session: ViTo's methodology keystone inherits VT-Method **by reference** (the
keystone points to the dev-kit; PR #2782) and it worked cleanly. The inbox engine was
inherited **by verbatim copy** earlier (PR #2690/#2710); a content diff this session
showed the only delta was CRLF/LF — i.e. a parity check is feasible and would have
confirmed identity. The two mechanisms already coexist in practice; this ADR names
the rule and the missing guard (the CI parity check).
