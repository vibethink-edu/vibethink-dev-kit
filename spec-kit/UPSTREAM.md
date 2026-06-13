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
| **last-sync** | content baseline **v0.8.1** (2026-04-26). **v0.10.2 reviewed 2026-06-13** (ADR-20260613) — outcome: **approach A (conservative cherry-pick)**. See "v0.10.2 review" below. |
| **next-review** | next github/spec-kit release after v0.10.2 |

## What is in scope here (agnostic only)

- `spec-kit/templates/` — artifact templates with **zero** product/brand/canon references:
  `checklist-template`, `constitution-template`, `plan-template`, `tasks-template`,
  and `spec-template` (**neutral base** — a consumer composes its governance-contract
  addendum on top; composition, not fork).
  - `agent-file-template` — present, but **consumer-authored** (upstream ships it only
    under `presets/self-test/`, not core) → pending reclassification to consumer-local
    (review A).
- `spec-kit/scripts/powershell/` — PowerShell scaffolding scripts:
  `check-prerequisites`, `create-new-feature`, `setup-plan`.
  - `update-agent-context` — present, but **deprecated upstream** (moved to
    `extensions/agent-context/` at v0.9.0, slated for removal at v0.12.0) → frozen,
    pending consumer-side reclassification (review A).

## What is intentionally NOT here (stays in the consumer — L2/L3)

These carry product-specific adaptation and must not be lifted into the neutral kit:

- **Command bodies** (`specify`, `tasks`, `analyze`, `implement`) — their canon routing
  is interwoven with the consumer's governance; they remain consumer-local.
- **Command-set policy** and its guardrail (which subset of upstream commands a product
  retains) — a product decision, enforced in the consumer.
- **`spec-template`'s governance-contract block** — stays consumer-local as a separate
  addendum (the neutral base lives here now; composition replaces the fork).
- **`common.ps1`** and any other marker-bearing script — neutral baseline still **PENDING**
  (entangled with the deferred v0.10.x refactor; see review).
- **Reconciliation changelog** — the consumer's operational memory of adopt/adapt/defer.

## v0.10.2 review — 2026-06-13 (approach A: conservative)

Reviewed the real upstream diff `v0.8.1 → v0.10.2` (clone of github/spec-kit). The bulk
of the v0.10.x churn is **one systematic refactor**, not isolated fixes — adopting it
would change how the methodology is invoked, a shift a hardcoded-command consumer has
deliberately deferred (along with presets / workflow-engine / extensions). Decision:
**adopt nothing structural; defer the refactor with documented reasons** (the agnostic
Windows/PowerShell wins already landed pre-v0.8.1).

| Upstream v0.10.x change | Disposition | Reason |
|---|---|---|
| Command-name abstraction (`__SPECKIT_COMMAND_*__` placeholders + `Format-SpecKitCommand`) | **DEFER** | a consumer that hardcodes its retained commands + PS1 paths can't adopt without the preset system |
| **git opt-in** (v0.10.0) — removes mandatory branch validation in `check-prerequisites.ps1` | **DEFER** | a git-assumed consumer with strict branch governance is weakened by opt-in |
| `agent-context` → extension (v0.9.0), removed at v0.12.0 | **DEFER + plan removal** | don't restore as core; freeze the local copy, migrate before v0.12.0 |
| `spec-template` neutral base | **ADOPT (as composition)** | base lands here; the consumer's governance-contract block becomes a separate addendum → kills the merge tax |
| `setup-tasks.ps1` (new) | **IGNORE** | a consumer's retained `tasks` flow doesn't use it |
| `constitution-template` | n/a — already byte-identical to v0.10.2 | — |

Bounded divergences this review **adds** to the consumer do-not-overwrite list: the two
DEFER decisions above (hardcoded-command model; git-assumed model).

## Pending (consumer-side PR, coordinated)

- [ ] Wire the **spec-template composition** in the consumer (`specify` loads the neutral
      base + appends the local governance-contract addendum); declare it clean parity.
- [ ] Reclassify `agent-file-template` (→ consumer-local) and freeze/deprecate
      `update-agent-context` (→ out of agnostic tracking).
- [ ] Resolve `common.ps1`'s neutral baseline (or declare it `adapted`).
- [ ] **Downstream ripple:** a consumer that vendors `spec-template` from another consumer
      receives a different shape once composition lands — resolve its source/shape in the
      same wave.

---

*Created 2026-06-13 (ADR-20260613); v0.10.2 review appended 2026-06-13 (approach A,
approved by the product's principal architect). Agnostic core lifted from the
upstream-tracking SpecKit fork; product-specific layers retained in their consuming repos.*
