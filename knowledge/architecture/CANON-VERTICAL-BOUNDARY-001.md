# CANON-VERTICAL-BOUNDARY-001 — When a business is a tenant vs. a vertical

> **Status:** DRAFT (pending Principal Architect seal)
> **Layer:** L2 (house — VibeThink platform governance)
> **Source:** Constitución de Verticales, authored 2026-06-12 in the first
> vertical's repo (`vibethink-campus/docs/architecture/CONSTITUCION_VERTICALES.md`
> — keep as the extended reference with worked census). This canon is the
> normative distillation.

## The thesis

Every business has two halves. The **relational half** (people, bonds,
conversation, pulse, scheduling, communication) is ALWAYS served by the
platform core (ViTo). The **operational half** (domain records with hard rules
where mistakes cost) SOMETIMES earns a vertical application.

The platform promise this canon protects: *a new tenant of any industry runs on
the core without tripping over another domain's vocabulary.*

## The 5-gate test (a vertical is EARNED, never decreed)

A business needs a vertical OUTSIDE the core only if its operation fires **2+
gates strongly**:

| Gate | Question |
|---|---|
| G1 — Typed truth | Does it need tables with hard constraints (uniqueness, FKs, state machines) that config/JSONB cannot guarantee? |
| G2 — Domain regulation | Is there a legal framework of the DOMAIN demanding structure and audit? |
| G3 — Consequential computation | Are there domain calculations whose errors have real consequences? |
| G4 — Own lifecycle | Does the domain have a versionable cycle of its own (school year, treatment protocol, release pipeline)? |
| G5 — Telemetry/volume | Does it generate operational data of a different profile (time series, GPS, high volume)? **Nuance:** if a generic engine already covers it (e.g. Route Ops), G5 alone does not open a vertical. |

**Score:** 0 gates → pure core tenant. Marginal 1–2 → tenant + light extension
(forms, document types, settings — data, never schema). 2+ strong → vertical.

## Core duties (anti-contamination)

1. **No tenant names and no industry domain logic in core packages.** The test
   is mechanical: grepping tenant slugs over core paths returns zero. (Same
   principle as the agent-rules fire-test, applied to product code.)
2. Engines speak through **terminology/config layers**; instances (seeds,
   forms, prompts, vocabularies) live in per-tenant seeds or the vertical's
   repo — never in core migrations or core packages.
3. The `tenants.vertical` column is an **identity label, not architecture** —
   it never implies a vertical app exists.

## Vertical duties

1. Own repo (`vibethink-<vertical>`), inheriting the dev-kit.
2. **One-way dependency:** vertical depends on core; core NEVER depends on a
   vertical — not one import, not one string.
3. Integration by contract only: durable signals (vertical emits), read-API
   (core/Twin consults, never mutates), shared data plane with row-level
   tenancy. One authority per entity.
4. The vertical is generic within ITS domain (its tenant #1 is never hardcoded)
   — it replicates downward the same discipline the core gives it upward.
5. Communication is never the vertical's: it decides when/what; the core
   delivers (the vertical never touches providers).

## Graduation (the cheap upgrade)

A business may START as a core tenant and graduate to a vertical when gates
ignite. Graduation never migrates the relational half — Relations/Heartbeat/
comms history stays in the core; only the operational app is born and plugged
in via the standard contracts. **This only works while the core stays clean** —
every gate that leaks into core breaks graduation for everyone.

## Enforcement

Periodic leak audit (slug grep over core) + CI gate (see the tenant-
contamination tool, companion PR) + amendments only by ADR sealed by the
Principal Architect. When speed and cleanliness conflict, **cleanliness wins**:
every "temporary" leak observed in the wild became permanent until someone
paid for it.
