# Ports instrument (recommended) — CANON-PORT-ASSIGNMENT-001

The kit mandates **THAT** an instance declares its ports canonically, **never WHICH**
ports. This template is the recommended way to satisfy that — "no more than that."

## Files

| File | Role |
|---|---|
| `ports.json` (this template) | The **canonical declaration** — the single source of truth for the ports this instance owns. Copy to your repo root, set your numbers. |
| `tools/ports.config.example.json` (in the kit) | The **per-repo binding** — copy to `tools/ports.config.json`; declares whether you deploy, where the declaration lives, and which format. |
| `tools/check-ports.mjs` (in the kit) | The **fail-closed gate** — verifies the declaration exists before a deploy. |

## Adopt in three steps

1. **Copy the declaration.** `ports.json` → your repo root. Rename the system(s), set the
   actual port(s)/range(s) each long-running service binds. No two services share a
   port/range; never rely on a tool's shared default (the classic co-resident collision).
2. **Copy the binding.** `tools/ports.config.example.json` → `tools/ports.config.json`:
   - `deploys: false` if this repo has no runtime (library/docs) → the gate is a conscious N-A.
   - `deploys: true` + `declaration: "ports.json"` + `format: "recommended"` otherwise.
   - Using your own shape instead? Set `format: "custom"` — the gate checks existence only;
     you own the overlap check.
3. **Wire it fail-closed.** Run `node tools/check-ports.mjs` in your **deploy / CI / launch**
   path. Exit 1 = refuse (no canonical declaration, or a shared port in the recommended
   form). Exit 0 = proceed. `devkit-doctor` runs it on the health board too — but the teeth
   are at the deploy gate: **no declaration, no deploy** (§3).

## Why a gate and not just a doc

An invariant that is only written down drifts (the gate-coverage lesson,
`CANON-AUDIT-PROTOCOL` §8.6 — what no gate checks is un-looked-at, not green). The port
discipline is verified mechanically so "we declare our ports" is a fact, not a promise.

## What stays yours

The numbers, the ranges, the file name, and any cross-system band map when several systems
co-reside on one workstation — all L3 (or the house layer above your repo). The kit owns
only the rule: **deterministic, non-overlapping, no shared default, declared before deploy.**
