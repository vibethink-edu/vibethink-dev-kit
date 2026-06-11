# CANON-CONFIGURATION-DISCIPLINE — Code defines behavior, not configuration (universal · agent-agnostic)

> **Scope:** every repo whose values can differ between deployments, environments, operators, or the product's served groups.
> Vendor-neutral, product-neutral, tool-neutral.
> **Status:** SEALED 2026-06-11 by the Principal Architect ("SEAL DALE" — agnostic-lift batch G→Z). Fire-test passed.
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Siblings:** `CANON-PRODUCTION-SAFETY` (no config/runtime *backdoors* in the shipped artifact — this canon governs where legitimate config *lives*) · `AGENTS_UNIVERSAL` security rules (never expose secrets client-side — this canon generalizes from secrets to every configurable value).

---

## §1 — Root principle

> **If a value can differ between deployments, environments, operators, or served groups, it does not live in the code. Code defines behavior; configuration defines values.**

A hardcoded value that should be configurable is an **architectural bug**, not a temporary shortcut — it is treated with the same urgency as a missing auth guard, because both fail the same way: silently, for someone other than the author.

## §2 — What is never hardcoded

| Category | Why |
|---|---|
| Credentials, API keys, tokens | secrets live in a governed secret store, surfaced through an owner-facing admin surface |
| Service URLs / external endpoints | environment- or deployment-specific |
| User-visible text | belongs to the translation layer |
| Visual identity (colors, branding) | belongs to the theme/token layer |
| Feature availability flags | belongs to the capability/config store |
| Limits, quotas, thresholds | operator-tunable values |
| The active provider among interchangeable ones | a provider *registry* in code is fine; *which one is active* is config |

## §3 — Layered resolution

A configurable value resolves through declared layers, most specific first:

```
1. per-group / per-owner config store   (the served group's own settings)
2. platform defaults                     (global, owner-administered)
3. environment variables                 (infrastructure)
4. code default                          (ONLY non-sensitive, non-varying values)
```

**Secrets never reach layer 4.** If a secret is absent, the feature fails closed — a default is never invented. The consuming repo's L3 binding names its concrete stores per layer.

## §4 — The discovery rule (for agents): look where the code looks

Before declaring that a key, secret, or config value "does not exist", follow the **same resolution path the code uses at runtime**: read the module's resolver first, query the same stores it queries, and only then check local env files. Asking the human for a value without having walked the resolver is the anti-pattern — if the code resolves it from a store, the agent looks in the store.

## §5 — The hardcode test (before commit)

> *"If a different deployment / group / operator needed a different value here, would the **code** have to change?"*

Yes → it is hardcoded; move it to the right layer. This is a one-question gate any author or reviewer can run on any diff.

## §6 — L3 binding (what the consuming repo owns)

- The concrete store names per resolution layer (secret store, config tables, defaults).
- The admin surface(s) through which operators manage each layer.
- The product categories of configurable values (vocabulary, domain examples).
- Any mechanical enforcement (lint/scanner for literal secrets, URL patterns).
- Originating incidents.

The L3 binding points at this canon as the spine; it does not restate the principle or the resolution order.

## §7 — What this canon does NOT do

- It does **NOT** prescribe a specific secret manager, config service, or schema.
- It does **NOT** forbid code constants for genuinely invariant values (math, protocol constants).
- It does **NOT** govern dev-affordance leakage into production artifacts — that is `CANON-PRODUCTION-SAFETY`.

---

## Provenance

Lifted from a product-side canon (`CANON-ZERO-HARDCODE-001`, sealed 2026-04-14) whose agnostic substance — code-defines-behavior, the layered resolution order, the discovery rule for agents, the one-question hardcode test — was bound to product-specific stores and examples. The consuming repo's L3 binding retains the concrete store names, the product value categories, and the originating incident (provider keys found as shared globals without an admin surface). Batch G→Z coverage-check: no existing spine owned configuration discipline (`PRODUCTION-SAFETY` owns artifact posture; root security rules own only the secrets-client-side case).
