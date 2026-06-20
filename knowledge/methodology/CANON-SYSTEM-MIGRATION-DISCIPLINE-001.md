# CANON-SYSTEM-MIGRATION-DISCIPLINE-001 — Moving from a legacy system to a new one is a governed discipline (universal · agent-agnostic)

> **Scope:** every repo that migrates a **legacy system → a new system** (data + schema): a one-time or phased load where records and structure come from a system being retired.
> **Status:** SEALED 2026-06-20 by the Principal Architect ("GO") — fire-test passed (no product, vendor, brand, or framework is named as *the* mechanism; concrete engines appear only as illustration). D-047.
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Family:** data-governance discipline · binds with `CANON-DATA-CHANGE-AUDIT-001.md` (the §6 boundary: a migration apply-ledger is *not* the runtime data-change trail), `CANON-DATA-LEGAL-COMPLIANCE-001.md` (consent/retention of the migrated datum), and `CANON-DB-SECURITY-BASELINE-001.md` (RLS on the new tables a migration creates).

## §1 — Principle

> **A migration from a legacy system to a new one is not an ad-hoc load. Every new element declares its origin, the whole change set is reconciled as-built, and the load is applied under governance — written, verified (positive *and* negative), then applied, with a record.**

The failure this prevents is the silent gap — *"did a field get left unmigrated? was a column backfilled from the wrong rule? did we apply out of dependency order?"* — discovered after cutover, when the legacy system is already gone. The capability is the discipline below; the **mechanism is per-stack** (§7).

## §2 — Bound to a recognized standard (not bespoke)

This canon **formalizes** the established data-migration practice; it invents no house vocabulary (consistent with the kit's "bind to standards, not house terms" posture):

- **expand–contract** (a.k.a. parallel-change) for schema evolution,
- **schema-migration + data-backfill** as distinct, ordered steps,
- **cutover-runbook** discipline (verify before switch, explicit ordering, rollback awareness),
- **ETL data-provenance / lineage** (every derived datum knows its source).

The four primitives (§3–§6) are the operational shape of that standard for a legacy→new move.

## §3 — Primitive 1: provenance tagging — nothing new without a declared origin (gate)

Every **new** schema element (table/column introduced for the new system) declares its **origin class**, one of three:

| Class | Meaning |
|---|---|
| `DERIVED` | comes from a legacy field/rule — carries the **formula / backfill** that produces it. |
| `GREENFIELD` | new data, does not exist in the legacy — captured fresh going forward (with a backfill default where one applies). |
| `SEED` | catalog / standard reference data — **not** a load from the legacy at all. |

> **Gate:** no new schema element is admitted without its origin class. The principle is *nothing without provenance*; **how** the tag is recorded (an inline annotation at definition time, a column in the playbook of §4, a CI check) is L3.

A `DERIVED` element with no formula, or any element with no class, is an incomplete migration — it is exactly the "field left unmigrated" gap surfacing at definition time instead of after cutover.

## §4 — Primitive 2: the as-built MIGRATION-PLAYBOOK (consolidated reconciliation)

**One document per destination system**, **one row per schema change**: *what changed · origin class (§3) · formula/backfill · cutover gotchas*. It is the checklist that **guarantees the total load skips no change**.

- **As-built, not retroactive.** A row is added in the **same change-set (PR)** that makes the schema change — so the playbook is always current, never reconstructed from memory after the fact.
- It is the single place a reviewer (or a fresh agent) confirms the migration is complete and ordered, without re-reading every migration file.

## §5 — Primitive 3: cutover-readiness + dependency order

The apply of any migration follows one flow:

> **`written-not-applied` → `verify (positive + NEGATIVE)` → `apply`**

- **Positive verify:** the change does what it should (the expected rows/columns/constraints exist and hold).
- **Negative verify:** the change does **not** do what it must not (no unintended drop, no orphaned data, no constraint that rejects valid legacy rows). Negative verification is the half most often skipped and the one that catches silent data loss.
- **Explicit dependency order.** Dependencies are declared, not assumed (e.g. *normalize-before-backfill*, *base-tables-before-foreign-keys*). The playbook (§4) orders the batch; **nothing is applied out of order**.

## §6 — Primitive 4: governed apply + record

The apply is itself governed, not a manual one-off:

1. **Hydrate credentials** at apply time — **never** stored in the repo. The credential is an **admin/owner** credential for the migration, **never the application's runtime credential**.
2. **Surgical per-migration applier** — apply **one migration** in a transaction with a **self-test**, not a scan-everything tool. A failed self-test rolls the transaction back.
3. **Apply-record / ledger** — each apply leaves evidence: *what migration · when · who (real attributable identity) · result*.

> **Boundary with `CANON-DATA-CHANGE-AUDIT-001` (so this does not read as a duplicate).** That canon governs the **runtime data-change audit-trail** — who/what/when of changes to *operational* data, ongoing, after the system is live (and its §10.2 explicitly **excludes** a "migration ledger" from that trail). **This** §6 record is the **migration apply-ledger** — evidence that a *schema/data migration step* was applied. Different concern, different artifact: the apply-ledger records the act of migrating; the audit-trail records subsequent operational edits. A repo keeps both.

## §7 — Per-repo binding (L3)

Each consuming repo declares:
- Its concrete **MIGRATION-PLAYBOOK** (location, row format) and **how the origin tag is recorded** (§3–§4).
- The **legacy source system(s)** being migrated from.
- The **ETL/loader engine** that performs the total load and the **formula source** for `DERIVED` elements.
- The **credential hydration** path (§6.1) and the **apply-record / ledger** format (§6.3).
- The **verify** harness for the positive/negative checks (§5).

The source system, the loader, the credentials, and the record format are L3; they never flow into this neutral core.

## §8 — Cross-references

- `CANON-DATA-CHANGE-AUDIT-001` — the §6 boundary (apply-ledger ≠ runtime audit-trail).
- `CANON-DATA-LEGAL-COMPLIANCE-001` — a migrated datum carries the **consent / lawful basis** and **retention** obligations of its data type; a migration does not launder legal status. Migrating PII is a governed data operation, not a free copy.
- `CANON-DB-SECURITY-BASELINE-001` — tables a migration **creates** meet the exposure floor (RLS / tenant scoping) from creation, not "after we finish loading".

## §9 — Inheritance

This kit is the **upstream** of governance. Each repo is a **fork** that inherits this canon and binds its own L3 playbook, loader, credentials, and record format.

## Reference implementation (L3, current)

The first implementer is a consuming product (Campus) migrating from a legacy school system: an as-built `MIGRATION-PLAYBOOK` with one row per schema change (origin class + backfill + cutover gotchas), inline provenance tags on each migration, a documented total-load formula + loader, a cloud-apply runbook (order + verify-then-commit), and real per-migration apply-records. Named here only as the current reference; the canon names no product in its normative body (fire-test).

## Fire-test

This document names no product, vendor, brand, or framework as *the* mechanism. The origin classes, the playbook shape, the verify flow, and the apply-ledger are stack-independent; concrete engines (an ETL tool, a specific applier, a credential store) appear only as illustration, and the reference-implementation product is named only in the dated note above. Those bind at L3.

## Provenance

Lifted agnostic from a consuming product's legacy→new migration (2026-06-20), on the Principal Architect's read that *"this practice, for any other system-to-system move, must be a norm — a dev-kit candidate."* The four primitives (provenance tagging · as-built playbook · cutover-readiness · governed apply+record) are stack-independent, so they rise to the kit rather than living in one product. Sealed the same day.
