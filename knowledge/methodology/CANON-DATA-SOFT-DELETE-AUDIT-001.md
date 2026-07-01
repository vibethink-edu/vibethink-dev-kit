# CANON — Soft-Delete + Audit (universal · agent-agnostic · vendor-neutral)

> **Scope:** every entity in every persistent store, in every inherited repo.
> **Status:** proposed (fire-test: no product, vendor, brand, framework, or methodology name appears here).
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Family:** persistence discipline · binds with `CANON-NAMING-CONVENTIONS-001.md` (DB tables carry `created_at` + `updated_at`).

## 1. Root principle

> **Data is never destroyed; it is marked and retained. Every mutation is attributable.**

Deletion is a **state, not an erasure**. A vanished row is a silent loss of history, provenance, and recoverability —
the same failure mode that naming inconsistency causes for traceability.

## 2. The two obligations (every entity, no exception)

1. **Soft-delete.** Deletion sets a non-destructive deleted state (a `deleted_at` timestamp, or a status flag).
   The row remains, queryable as deleted. **Hard delete is forbidden** except for a legally-mandated erasure
   (e.g. a right-to-be-forgotten request) — and that erasure is itself logged.
2. **Audit trail.** Every create / update / soft-delete records **who** and **when**.
   - Minimum: `created_by`, `created_at`, `updated_by`, `updated_at`, `deleted_by`, `deleted_at`.
   - Stronger (preferred for sensitive or regulated data): an **append-only change log** per row — actor, timestamp, action, source.

## 3. Read semantics

- Default reads **exclude** soft-deleted rows. Deleted rows are reachable only via an explicit "include-deleted" / audit view.
- **Counts, verifies, and migrations must account for soft-deleted rows** — never assume every row is active.

## 4. Migration / import

- When importing from a source that **already carries** a status flag + an audit field, **map them** — do not invent:
  status → soft-delete state; audit entries → create/update actor+time (ideally the full edit history).
- **Never discard non-active rows on import.** They are migrated, marked as deleted.

## 5. Reusability

- Implement **once, generically** (a shared mixin / base / trait / policy), inherited by every entity. **Not re-coded per table.**

## 6. Compliance check (the fire-test for an entity)

An entity is compliant **iff**: (a) a delete leaves the row present and queryable-as-deleted; (b) create/update/delete each
stamp actor + timestamp; (c) default queries hide deleted rows; (d) the mechanism is shared, not per-table.

---

*Provenance: principle long applied across the author's applications; codified as a canon 2026-06-25. The source-system
evidence that motivated codification (a legacy store where every table already carried a status flag + an audit field)
is intentionally omitted here to keep this canon product-neutral.*
