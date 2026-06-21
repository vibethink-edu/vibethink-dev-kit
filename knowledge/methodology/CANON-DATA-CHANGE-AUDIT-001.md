# CANON-DATA-CHANGE-AUDIT-001 — Every system can answer who/what/when of a data change (universal · agent-agnostic)

> **Scope:** every repo that stores mutable operational data (business records, PII, official records, money, consent).
> **Status:** SEALED 2026-06-18 by the Principal Architect ("Sellá") — fire-test passed (no product, vendor, brand, or framework is named as *the* mechanism; concrete engines appear only as illustration). D-016.
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Family:** data-governance discipline · sibling of `CANON-DB-SECURITY-BASELINE-001.md` (exposure floor) · binds with `CANON-STATE-MIRROR-AND-DECISION-REGISTER-001.md` (that register audits *authority decisions*; this canon audits *data changes*).

## §1 — Principle

> **Every system must be able to answer, for any operational datum: WHO changed it, WHAT changed (old value → new value), and WHEN — with the COMPLETE history, not only the last touch.**

A system that cannot reconstruct the history of a change is blind exactly when it matters: a disputed record, a leaked PII edit, a money/consent change, an incident post-mortem. The capability is non-negotiable; the mechanism is per-stack (§3, §7).

## §2 — The level-0 trap (per-table columns) vs the audit-trail

- **Level 0 (rejected as the audit mechanism):** per-table audit columns — `updated_by`, and leaning on `updated_at` to "know who changed what". They store only the **last touch**, lose field-level before/after, lose the full history, and are filled inconsistently (every writer must remember). A per-table column **is not** a change-audit-trail.
- **The audit-trail (required capability):** a **generic change-capture** mechanism that records every INSERT / UPDATE / DELETE on the audited tables as `{ table, op, row id, old, new, who (authenticated identity), when }` — uniform, field-level, complete history, in **one** place, not re-implemented per table.

> **Orthogonality (so this does not read as a contradiction):** row-lifecycle timestamps (`created_at` / `updated_at`) are a **different concern** and remain wherever a repo mandates them — they answer *"when was this row created / last touched"*, not *"who changed what, across its whole history"*. This canon does **not** remove them; it forbids **mistaking them for the audit-trail** and forbids **building the audit-trail out of per-table columns**.

## §3 — The recommended mechanism (strong recommendation, stack-neutral)

Capture changes **generically**, once, rather than per table:

- In a **trigger-capable relational store**: one generic trigger + a single append-only audit table that records the change row (old/new as structured values) and the authenticated identity. *(e.g. in Postgres/Supabase, a `SECURITY DEFINER` trigger capturing `auth.uid()` writing to an `audit.record_version` table — the `supa_audit` shape — enabled per audited table by a helper.)*
- In an **event-sourced** system: the event log already is the trail.
- Elsewhere: the stack's equivalent — change-data-capture (CDC), temporal/system-versioned tables, or an application-level change-log.

The kit mandates **the capability and the generic shape**; the concrete engine is the repo's (§7). Naming a specific tool here is illustration, never the requirement.

## §4 — Scope (what is audited, what is not)

- **Audited:** **operational** tables — business data, PII, official/regulated records, money, consent.
- **Excluded** (auditing them is cost without value): static catalogs / configuration, read-only legacy dumps, and **high-frequency telemetry** (GPS pings, per-second events) — that data **is already a log**; auditing each event is expensive and redundant.

The exact table set is per-repo binding (§7); the **operational-vs-excluded** judgment is universal.

## §5 — The "who" is a real authenticated identity

The recorded actor is the **real authenticated identity** behind the change — never a generic shared service account that erases attribution. If a privileged/automated path writes, it carries (or impersonates under governance) a real, attributable identity. Anonymous or shared-service writes to audited tables defeat the canon.

## §6 — The trail is private

The audit-trail is **governance/admin-only**. It is **never exposed to client/tenant-facing surfaces** (it contains before/after values and actor identities across tenants). Read access is an explicit, privileged, governed path.

## §7 — Per-repo binding (L3)

Each consuming repo declares:
- The **mechanism** in its stack (trigger + audit table · event log · CDC · temporal tables).
- The **set of audited tables** (operational scope, §4) and how new tables opt in.
- The **identity source** for the "who" (§5).
- Where the trail lives and who may read it (§6).

The mechanism, the table list, and the identity wiring are L3; they never flow into this neutral core.

## §8 — Inheritance

This kit is the **upstream** of governance. Each repo is a **fork** that inherits this canon and binds its own L3 mechanism.

## §9 — Retention of the trail *(amendment SEALED 2026-06-18 by the Principal Architect — "amend con la cláusula de retención"; D-017)*

The audit-trail is append-only, but **not infinitely hot**, and **not** hard-deleted on a whim:

- **Partition + a hot window + archive.** The trail is partitioned (e.g. monthly) and kept **hot** for an active window; past it, partitions are **archived to cold storage**, never hard-deleted. *(Recommended technical default, illustrative: monthly partition + ~24 months hot → cold archive. The default is the kit's; the binding number is not.)*
- **The window is a legal requirement, not a technical preference.** How long the trail must be retained is set by `CANON-DATA-LEGAL-COMPLIANCE-001` §2 (retention by data type / jurisdiction) — an **L3 number**, not the kit's. Do not guess the window; bind it to the legal requirement.
- **Archive ≠ delete.** The spirit is preservation: the history survives, it just moves to cheaper storage. **True deletion of trail rows happens only when a legal obligation requires it** — most commonly a data-subject erasure that legally extends to audit copies (`CANON-DATA-LEGAL-COMPLIANCE-001` §5) — as a **governed, logged exception**, never routine cleanup.
- **The scheduler is L3.** Whether partition/archive runs via a DB scheduler, an external cron, or a job runner is the repo's binding; the **partition + legal-window + archive-not-delete** discipline is universal.

## §10 — What to audit / what not, and why *(amendment SEALED 2026-06-18 by the Principal Architect — two product-architect triage handoffs; D-020)*

§4 states the principle (audit operational data). This is the **triage matrix** every implementer needs — because *"audit who/what/when"* leaves open *"which tables?"*, and re-classifying by hand is unsafe: in a real triage an auto-classifier-by-name put a `*_api_keys` table into "audit". The directive carries the **classes + the why**; the **concrete table names are L3** (each repo writes its own explicit, reviewed list — never auto-include).

### §10.1 — Secrets / sensitive tables are NEVER captured old/new (SECURITY — the critical item)

> **The generic old/new-capturing trigger MUST NOT run on a secret store or sensitive-value table.** Capturing `old_value → new_value` would **replicate the secret inside the audit log** — even though the log is private, duplicating a secret **outside its store** breaks the minimal-secret-surface principle.

For such tables, one of two **governed** options:
- **(a) Exclude** from the generic trail — a secret's change is governed by its own control (e.g. a `reason_code` / `ticket_ref` on the mutation path) rather than a value-capturing audit.
- **(b) Metadata-only** — capture who / when / which table / which operation, **without** `old`/`new` values (a variant trigger that does not read the values).

The old/new trigger is for **operational** tables, **never** a secret store. *(The metadata-only helper, if offered, is an L3 infrastructure choice of the implementer's shared audit infra.)*

### §10.2 — The triage matrix

**AUDIT** — operational / PII / official / financial / consent tables: the business data whose who/what/when matters.

**DO NOT audit** (class → why):

| Class | Why not |
|---|---|
| secrets / keys / tokens | the old/new trigger would replicate the secret in the log — **security** (§10.1; the critical item) |
| connections carrying credentials | may embed tokens → treat as a secret until confirmed metadata-only |
| logs / queues / events / metering / telemetry | the data **already is** an append-only log; auditing it duplicates + costs (high frequency) |
| catalogs / static config | not operational data that mutates; their "history" is the repo/seed versioning |
| jobs / derived / media / caches | recomputable output, not a source of truth |
| backups / migration ledger / system | snapshots / system, not editable operational data |

Each repo turns these **classes** into an explicit, reviewed table list (L3); the classes + the why are universal. A new table is opted in **consciously**, never auto-included by name.

## Reference implementation (L3, current)

The first implementer is a consuming product: a Postgres/Supabase `audit` schema with a single `audit.record_version` table, a generic `SECURITY DEFINER` trigger capturing the authenticated identity, and a helper to enable tracking per table — applied across its operational tables on the shared database, so a sibling product can plug its own tables into the same infrastructure. Named here only as the current reference; the canon names no product in its normative body (fire-test).

## Fire-test

This document names no product, vendor, brand, or framework as *the* mechanism. Concrete engines (a specific trigger style, CDC, temporal tables) appear only as illustration; the reference-implementation product is named only in the dated note above. Those bind at L3.

## Provenance

Lifted agnostic from a consuming product's data-change-audit directive (2026-06-18): the capability "who/what/when, full history, via a generic audit-trail — not per-table columns" is stack-independent, so it rises to the kit rather than living in one product. Sealed the same day.
