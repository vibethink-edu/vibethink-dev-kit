# UPSTREAM.md — spec-kit (agnostic core)

> Per-fork upstream record (CANON-UPSTREAM-PROTOCOL §6.1). This directory holds the
> **brand-neutral** agnostic core of the [Spec Kit](https://github.com/github/spec-kit)
> methodology — templates and scripts only. Product-specific adaptations (command
> bodies, canon routing, command-set policy, reconciliation history) are **not** here:
> they live in each consuming repo's own `UPSTREAM.md` do-not-overwrite list
> (ADR-20260524 layering: L3 never moves to the kit).

## Identity

| Field (§6.1) | Value |
|---|---|
| **Upstream** | https://github.com/github/spec-kit |
| **License** | MIT |
| **Kind (§4)** | fork-adapted — the kit hosts the agnostic baseline; consumers copy it (parity-checked) and adapt locally |
| **Location in kit** | `spec-kit/templates/` + `spec-kit/scripts/` |
| **Cadence (§6.4)** | at-release |
| **last-sync** | baseline inherited from the upstream-tracking SpecKit fork at its **last-sync v0.8.1** (2026-04-26). A direct re-sync of this kit copy against current upstream is **PENDING** — see below. |
| **next-review** | next github/spec-kit release |

## What is in scope here (agnostic only)

- `spec-kit/templates/` — artifact templates with **zero** product/brand/canon references:
  `agent-file-template`, `checklist-template`, `constitution-template`,
  `plan-template`, `tasks-template`.
- `spec-kit/scripts/powershell/` — PowerShell scaffolding scripts:
  `check-prerequisites`, `create-new-feature`, `setup-plan`, `update-agent-context`.

## What is intentionally NOT here (stays in the consumer — L2/L3)

These carry product-specific adaptation and must not be lifted into the neutral kit:

- **Command bodies** (`specify`, `tasks`, `analyze`, `implement`) — their canon routing
  is interwoven with the consumer's governance; they remain consumer-local.
- **Command-set policy** and its guardrail (which subset of upstream commands a product
  retains) — a product decision, enforced in the consumer.
- **`spec-template.md`** and any script carrying product markers — the consumer keeps its
  adapted copy; the neutral upstream baseline of these is **PENDING** the re-sync below.
- **Reconciliation changelog** — the consumer's operational memory of adopt/adapt/defer.

## Pending

- [ ] Re-sync `spec-kit/templates/` + `spec-kit/scripts/` against current upstream
      (v0.8.1 → latest) in a dedicated PR (one-upstream-per-PR, §11/§12), recording the
      neutral agnostic baseline for `spec-template` and any marker-bearing script.

---

*Created 2026-06-13 (ADR-20260613). Agnostic core lifted from the upstream-tracking
SpecKit fork; product-specific layers retained in their consuming repos.*
