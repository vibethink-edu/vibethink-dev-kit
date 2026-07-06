# CANON-IDENTITY-PROVISIONING-INTEGRITY-001 — Multi-source identity must be provisioned atomically and drift-checked (universal · agent-agnostic)

> **Scope:** every system whose authorization for a principal (a human operator, a service account, an admin) is derived from **two or more identity/role sources that are provisioned separately** — e.g. one store answers "who is this" and another answers "what may they do", or two role stores are consulted by two different guards. Vendor-neutral, product-neutral, engine-neutral, storage-neutral.
> **Status:** DRAFT — pending Principal Architect seal.
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Siblings:** `CANON-CODER-SAFE-IDENTITY-001` (the *executor/bot* identity that pushes code — a different layer: execution provenance, not principal authorization) · `CANON-DB-SECURITY-BASELINE-001` (the Postgres/PostgREST *data-plane* floor — engine-specific; this canon is the **application-layer** principal-authorization complement, engine-agnostic) · `CANON-DATA-CHANGE-AUDIT-001` (governs the audited mutation this canon's provisioning is an instance of).

---

## §1 — Root principle

> **When a principal's authorization is assembled from more than one separately-provisioned source, those sources are a single logical fact split across stores. If they disagree — a principal present/active in one and absent/inactive in another — that is *drift*, and drift on an identity source is a security fault, most dangerously a lockout of a legitimate principal.**

The trap is quiet by construction. Each source is provisioned by its own path, at its own time, often by different code or different operators. Nothing forces them to agree. The system reads GREEN — every store is internally valid — while the *relationship between* the stores is broken. The break only surfaces when a guard that reads source B denies a principal that source A still considers active.

**Two failure directions, both real:**
- **Lockout (fail-safe gone wrong):** a principal active in the source a guard *used to* read is missing from the source a hardened guard *now* reads → a real, active operator is denied (e.g. a `403`). Hardening a route to consult the stricter source, without first reconciling, **locks out a live admin.**
- **Ghost authority (fail-open):** a principal deactivated in one source but still active in another retains access through the guard that reads the stale one.

## §2 — The two requirements

A system in scope (§1) **MUST** satisfy both:

1. **Atomic provisioning.** Creating, elevating, or deactivating a principal writes **all** of its identity/role sources as one governed unit — never one store now and the other "later / by another path". If the writes cannot share a transaction (different stores, different services), they are sequenced behind a single governed operation that **verifies all sides landed** and treats a partial write as a failure to roll back or repair, not a success.
2. **Mandatory drift-check.** A **read-only reconciliation** runs as a gate — before any change that alters which source a guard consults, and on a periodic cadence — that lists every principal present/active in one source but absent/inactive in another, in **both directions**. A non-empty result is a **blocker for the guard-change** (it names the exact principals who would be locked out) and a **finding** for the periodic run.

## §3 — The drift-check pattern (portable shape; tables are L3)

The check is the same everywhere; only the store names bind at L3. For each ordered pair of sources `(A, B)`:

> *the set of principals **active in A** with **no active row in B***

reported for every pair and both orderings. Empty in all directions = the sources agree. Non-empty = named drift, each entry a lockout-or-ghost candidate.

- **Run it before you narrow.** The highest-value moment is *before* a change that makes a guard read a stricter/different source — the check is a **precondition**, run against the real data, that turns a would-be production lockout into a pre-merge list of names to reconcile.
- **Reconcile through §2.1.** The fix for a drift entry is a **governed provisioning** of the missing/ inconsistent side (atomic, audited) — never a quiet manual INSERT that itself becomes the next drift.
- **It is a gate, not a cleanup** (same discipline as any drift closure): a one-time reconciliation without the standing check lets the classes re-open as new principals are provisioned.

## §4 — Weight the lockout direction

Of the two failure directions, **lockout is the one a hardening change actively creates** — tightening a guard is a routine security improvement, and it is exactly the move that denies a real principal if drift exists. Therefore: **any change that makes a guard consult a stricter or additional identity source is gated on a clean drift-check (§2.2) first.** Ghost-authority is caught by the same periodic check but is not *created* by hardening, so it does not gate the hardening change — it is a finding to remediate.

## §5 — Applicability

- **In scope:** ≥2 separately-provisioned identity/role sources feeding authorization for the same principal.
- **N-A (declared, not silent):** a system with a **single** identity/role source has no cross-source drift to check — it marks this piece `N-A(single-identity-source)`. (It still owes single-source integrity to its own store; that is not this canon.)
- Federated/external identity (an upstream IdP plus a local role store) **is** in scope — the IdP and the local store are two sources.

## §6 — L3 binding (what the consuming repo owns)

- The **concrete sources** (the exact tables/stores/claims and which guard reads which).
- The **drift-check wired to them** — the §3 shape bound to real store names, as a runnable check (and, where the change cadence warrants, a **regression gate** so a guard-narrowing PR cannot merge with open drift — the `CANON-AUDIT-PROTOCOL §8.7` known-bad discipline applies to *this* gate too).
- **Where provisioning happens** and how §2.1 atomicity is realized on that stack (shared transaction, or a governed sequence with all-sides verification).
- The **remediation authority** for a drift finding (who may run the governed reconciliation).

## §7 — What this canon does NOT do

- It does **not** define the authorization model itself (roles, scopes, RLS) — that is the consumer's and, for the data plane, `CANON-DB-SECURITY-BASELINE-001`.
- It does **not** mandate a specific store, transaction technology, or IdP.
- It does **not** replace per-source integrity (a single source still owes its own constraints) — it governs the **relationship** between sources.

---

## Provenance

**Prior-art (`CANON-DEVELOPMENT-PROCESS §7` — method canons are SOTA-informed):** this encodes the established identity-governance practice of **account/entitlement reconciliation and drift detection** (the discipline that IGA/identity-governance tooling exists to provide: periodically reconciling entitlements across authoritative sources and flagging divergence), reduced to its agnostic core — *provision all sources as one unit; reconcile them as a standing check; weight the lockout direction*. Named to declare the mapping, not to adopt a tool.

**Surfaced by a consumer field near-incident (ViTo, 2026-07-05):** hardening five admin routes to a governed authorization guard would have `403`'d a **live SUPER admin** — the principal was active in one role source but had no active row in the second source the hardened guard reads. A **read-only drift check caught it before merge**; a governed provisioning reconciled it. Two of three admins were drifted. The consumer's concrete tables, guard, and check are L3; the principle generalizes to every system with multi-source identity (the finding named two sibling systems that also carry identity). Consumer finding: `FINDING-ARCHITECTURE-IDENTITY-DRIFT-DEVKIT-LIFT-2026-07-05`.

**Fire-test:** the normative body (§1–§7) names no vendor, product, engine, agent, or person.

**Status:** DRAFT pending the Principal Architect's seal (Rule #4). On seal: catalog-sync exemption removed and the piece registered as adoptable.
