# ADR-20260619-shared-runtime-package-distribution

**Status:** ACCEPTED (dev-kit recommendation) — concrete registry/scope/token are L3 (the consuming ecosystem binds them)
**Date:** 2026-06-19
**Decider:** Marcelo (Principal Architect)

## Context

The kit already says how the *kit's own* artifacts travel to a consumer
(`ADR-20260524`: docs **by reference**, small runnables **by verbatim copy + parity**,
mount for dev). It does **not** cover a different axis: a **first-party runtime package,
versioned and with its own dependencies, shared by ≥2 repos of the ecosystem** (one repo
owns/publishes it, others consume it). Copy-parity is explicitly **not** for this — it is
for small, dependency-free canonical runnables. Distributing a dependency-bearing package
by copy re-creates the drift and transitive-dependency problems that versioned
distribution exists to solve.

## Decision

A **shared runtime package** — first-party code, **versioned**, **with dependencies**,
consumed by **≥2 repos** — is **published to an org-scoped package registry and consumed as
a versioned dependency**, never copied into each consumer.

**Mechanism (agnostic):**

1. **Publish** to an **org-scoped package registry** (the org owns the namespace).
2. **Scope** the package under the org scope: `@<scope>/<name>`.
3. **Consume** via the package manager's **scoped-registry config** — point the scope at the
   registry (e.g. an `.npmrc`-style `@<scope>:registry=<url>`) — plus **token auth** (a
   registry token read from the **environment**, never committed).
4. **Version** it (SemVer + `CANON-VERSIONING-001`); consumers **pin/range a version**, they
   do not vendor source.

**The cut — which mechanism for which artifact:**

| Artifact | Mechanism |
|---|---|
| **shared runtime package** — versioned, has deps, ≥2 consumers | **org-scoped package registry** (this ADR) |
| **small canonical runnable** — no deps, must run even without a mount | **verbatim copy + parity** (`ADR-20260524` §3.1 / copy-parity) |
| **docs / canon / ADR** | **by reference** (`ADR-20260524`) |

Rule of thumb: **deps + versioned → registry · dep-free small canonical file → copy · docs → reference.** Do not copy a dependency-bearing package; do not publish a one-file doc.

## Why

- **No drift / no transitive breakage:** a versioned dependency resolves its own deps; a
  copied package silently rots and drags a hidden dependency closure into each consumer.
- **Single owner, many consumers:** one repo owns the package; consumers pin a version and
  upgrade deliberately — the relationship is a *dependency*, not duplication.
- **Accelerates:** consumers `install` instead of vendoring + re-resolving; upgrades are a
  version bump, not a manual re-copy.

## What is L3 (the consuming ecosystem binds, NOT this ADR)

- the **concrete registry** (which provider hosts the org-scoped registry);
- the **org scope** string (`@<scope>`);
- the **auth token** env-var name and how it is provisioned per environment/CI;
- the **config file** (`.npmrc` or the package manager's equivalent);
- the **package inventory** (which packages are shared this way).

This ADR fixes the **pattern** (org-scoped registry + scoped config + env token + versioned),
**not** the vendor.

> **L3 worked-example (one consumer, for reference — not normative):** the ViTo ecosystem
> sealed its binding as GitHub Packages under the `vibethink-edu` org, scope `@vibethink`,
> auth via `GITHUB_TOKEN`, an `.npmrc` line `@vibethink:registry=...`, first package
> `@vibethink/rich-editor` (owner: ViTo).

## Alternatives considered

- **Copy-parity the package** — rejected: copy-parity is for small dependency-free canonical
  runnables; a dependency-bearing package copied this way rots and drags its dep closure.
- **Git submodule / subtree** — rejected: heavier, no version semantics for consumers, and
  re-introduces source-vendoring instead of a clean versioned dependency.

## Consequences

- Consuming repos need the scoped-registry config + a token in their environment/CI.
- A shared package is now a **versioned dependency** with an owner — it follows
  `CANON-VERSIONING-001` (SemVer) and the upstream/change discipline of its owner repo.

**Fire-test:** the Decision + Why + L3 body name no vendor, registry, org, scope, or package
— those live only in the labeled L3 worked-example. PASS.
