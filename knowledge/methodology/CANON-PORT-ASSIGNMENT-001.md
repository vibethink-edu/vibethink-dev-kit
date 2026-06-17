# CANON — Port Assignment (universal · agent-agnostic)

> **Scope:** every repo that runs or deploys one or more long-running services (an app, an API, a database, a preview server, a worker) on a host where a port can collide.
> **Status:** SEALED 2026-06-17 by the Principal Architect ("sella") — fire-test passed (no product, vendor, brand, framework, methodology name, or concrete port number appears here). PR #145 · D-013.
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Family:** operational readiness discipline · binds with `CANON-CONFIGURATION-DISCIPLINE.md` (single source of truth for config) and `REVIEW-READINESS-PROTOCOL.md` (a reachable port is a review precondition).

## 1. Root principle

> **The instance declares its ports canonically; the kit mandates THAT you declare them, never WHICH ports. No canonical declaration → the deploy is refused.**

A port is a shared, finite resource on a host. When two co-resident services bind the same port — or when a service relies on a tool's *default* port that another tool also defaults to — the failure is silent and confusing: the wrong surface answers, a preview shows another system, a database connection lands somewhere unexpected. The cure is not a number the kit picks for you (the kit cannot know your topology); it is the **discipline that every instance has a single, canonical declaration of the ports it owns**, and that nothing deploys without it.

The kit is agnostic about the numbers. It is **not** agnostic about the requirement.

## 2. What "canonical declaration" means

An instance's port declaration is:

1. **Single source of truth.** One declared artifact (a manifest, a config, a registry) names every long-running service the instance owns and the port (or range) it binds. Not scattered across `.env` files, READMEs, and memory.
2. **Complete for what deploys.** Every service that binds a port at deploy/run time appears in it. A port bound but not declared is the gap this canon exists to close.
3. **Collision-free on its host.** No two declared services share a port; nothing depends on a tool's shared default (the classic trap: two tools that both default to the same port, co-resident).
4. **Discoverable.** An agent or human can find it without guessing — its location is the per-repo binding (§5).

The kit does **not** prescribe the numbers, the ranges, the file format, or the file name. Those are the instance's (§5).

## 3. Fail-closed: no declaration, no deploy

> **An agent (or pipeline) that is about to deploy or start services MUST verify the canonical declaration exists first. If it does not, the deploy is refused — not defaulted.**

This is the teeth. A missing declaration is not a warning to step over; it is a stop. The instance wires the check (§4 ships a reference gate) into its deploy/CI/launch path as a **fail-closed** gate: present and valid → proceed; absent → refuse. Defaulting to "some port" when the declaration is missing is the exact silent-collision failure this canon prevents.

## 4. Recommended form (a recommendation, not a mandate)

The kit ships a **recommended** shape for the declaration and a **reference gate** so an instance can adopt the discipline in minutes:

- **Template:** `setup/templates/ports/` — a `ports.json` manifest (systems/services → port or range) plus the "no shared default, no overlap" rule, copyable into the instance.
- **Gate:** `tools/check-ports.mjs` — config-driven, skip-when-no-config, fail-closed when the instance declares it deploys but carries no declaration. Wired into `devkit-doctor`.

An instance MAY use its own form (a different file, a different schema, an env registry) **as long as it satisfies §2 and is enforced fail-closed (§3)**. The recommended form is the cheap default, "no more than that" — adopt it or declare an equivalent.

## 5. Per-repo binding

Each consuming repo declares (typically in `tools/ports.config.json` + the declaration artifact itself):

- **Whether it deploys** services at all (a markdown-only or library repo with no runtime declares `deploys: false` — a conscious N-A; the gate does not apply).
- **The location** of its canonical port declaration (e.g. `ports.json` at the repo root).
- **The actual numbers / ranges** — the ports each of its services binds. *This is the instance's content; it never rises to this neutral core.*
- **Cross-system coordination**, when several systems co-reside on one workstation: the instance (or the house layer above it) owns the non-overlapping band allocation. The kit owns only the rule "deterministic, non-overlapping, no shared default" — not the bands.

## 6. Inheritance

This kit is the **upstream** of governance. Each repo is a **fork** that inherits this canon. The numbers, ranges, file names, and any house-level cross-system port map stay in that repo's (or the house's) own layer; they never flow into this neutral core.

## Fire-test

This document names no product, vendor, brand, framework, language, or methodology. It names no concrete port number. Those bind at L2/L3.

## Provenance

Distilled from a multi-system development ecosystem's recurring port-collision incidents (a preview server of one system answering as another because both inherited the same tool default on a shared workstation). The agnostic substance — *declare your ports in one canonical source; the supra mandates the declaration, not the numbers; refuse to deploy without it* — had been written but trapped inside a house-specific document that mixed the rule with the concrete port map. This spine separates the rule (here, L1) from the map (the house binding, L2/L3).
