# CANON-DATA-SOFT-DELETE-001 — Deleting operational data is a state, not an erasure (universal · agent-agnostic)

> **Scope:** **operational** data in a repo or tenant running in **production mode** — the same
> operational-vs-excluded judgment `CANON-DATA-CHANGE-AUDIT-001` §4 already makes — that canon
> decides which entities are operational; this one does not restate the list.
> **Out of scope:** pre-production repos. `CANON-DEV-MODE-DISCIPLINE` §2-§3 makes deletion the
> default there, deliberately, and that canon governs.
> **Status:** proposed — **seal-within-PR**: on the Principal Architect's GO this line is stamped
> `SEALED <date>` before merge; if no seal is given, the canon does not merge and its catalog piece
> is withdrawn with it (the precedent set by D-071).
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Family:** data-governance discipline. Binds with `CANON-DATA-CHANGE-AUDIT-001` (who/what/when of
> a change), `CANON-DATA-LEGAL-COMPLIANCE-001` (retention, lawful basis, erasure) and
> `CANON-SYSTEM-MIGRATION-DISCIPLINE-001` (what may be carried across a migration).

## §1 — Principle

> **Deleting an operational record marks it; it does not destroy it.**

A vanished record is a silent loss of history, provenance and recoverability. Deletion is a **state the
record carries**, reachable and reversible, not an absence to be inferred.

## §2 — What this canon owns, and what it does not

This canon owns exactly one thing: **that the deleted state exists and how reads treat it.** The
neighbours it would otherwise duplicate own the rest, and this canon does not restate them:

| Question | Owner |
|---|---|
| *Who changed this, and when?* | `CANON-DATA-CHANGE-AUDIT-001` — including its §2 ruling that **per-table `*_by` columns are not an audit-trail**. A repo satisfies the audit obligation through that canon's mechanism, never by adding columns here. |
| *When must data be truly erased, and on whose authority?* | `CANON-DATA-LEGAL-COMPLIANCE-001`. Hard delete happens **only** through that canon's governed paths — an erasure request (§5), **withdrawal of consent** where it triggers §5 (§3), or a legal obligation that requires deletion (§2 — whose default when the active window expires is to **archive, not delete**). Logged as that canon requires. |
| *What may be carried across a migration?* | `CANON-SYSTEM-MIGRATION-DISCIPLINE-001` §4/§8. |

The deleted state itself belongs to the **record-lifecycle class** — the same class as
`created_at` / `updated_at`, which the audit canon's orthogonality clause (§2) preserves. Adding it
is not building an audit-trail out of columns; naming it as one would be.

## §3 — The obligation

1. **A delete sets a deleted state.** The record remains, queryable as deleted. The concrete shape
   is the store's own (a timestamp, a status, a tombstone) — the invariant is *retained and
   marked*, not a column name.
2. **Default reads exclude deleted records.** They are reachable through an explicit, **governed** include-deleted path — who may read deleted
   records is a deliberate decision, not a side effect.
3. **Counts, verifications and migrations account for deleted records** — never assume every record
   is active.
4. **The mechanism is shared, not re-coded per entity.** One place to fix, one place to audit.

## §4 — Migration

Non-active records are **migrated and marked deleted, not discarded** — unless the record has no
lawful basis to be retained (`CANON-DATA-LEGAL-COMPLIANCE-001` §2) or the migration playbook
declares it a non-record (test, corrupt, duplicate — `CANON-SYSTEM-MIGRATION-DISCIPLINE-001` §4).
A migration does not launder legal status.

## §5 — Operational notes (not normative — correctness traps this shape creates)

- **Uniqueness for the returning subject.** A deleted record still occupies its uniqueness
  constraint. When the same subject is created again, it collides with its own deleted record. The
  remedies are store-dependent (e.g. a filtered unique index where the store offers one, a
  uniqueness key that incorporates the deleted marker, or reviving the record); what matters is that
  the repo picks one and names it (§6). Two implementers who decide differently produce
  incompatible data models.
- **Views that bypass row-level policy.** A materialized or pre-computed view built before the
  active filter will serve deleted records. The exclusion is a property of every read path, not of
  one query.
- **Parent/child.** Marking a parent deleted leaves children pointing at a deleted record. Whether
  they cascade, block or dangle is an **L3 decision** — this canon requires only that the repo makes
  it deliberately.

## §6 — Per-repo binding (L3)

The repo declares: the concrete field/mechanism; the entity set (reusing the operational-vs-excluded
judgment of `CANON-DATA-CHANGE-AUDIT-001` §4/§10.2 rather than inventing a second list); the two §5
decisions — **uniqueness for a returning subject** and **parent/child semantics** — each named, not
left to whoever implements next; and — where entities predate this canon — the **retrofit
schedule**. A legacy entity without the mechanism is a declared debt with a date, not a silent
violation. A store whose records are append-only or event-sourced satisfies the principle by
construction and declares `ADOPTED-NATIVE`, naming where the deleted state lives.

## §7 — Inheritance

Inherited by every consuming repo as upstream → fork. A consumer may bind it to its own storage
vocabulary; a consumer that restates §2's ownership table has drifted.

---

*Provenance: principle long applied across the author's systems, codified 2026-06-25 as
`CANON-DATA-SOFT-DELETE-AUDIT-001` and rejected at review — it legislated the audit territory of a
sealed neighbour (contradicting its §2 ruling), covered pre-production where another sealed canon
makes deletion the default, and left the unique-index trap unnamed. Re-drafted 2026-07-20 to own the
deleted state alone. The source-system evidence that motivated codification (a legacy store whose
tables already carried a status flag) is recorded here rather than omitted: a canon without its scar
cannot be judged.*
