# CANON-DATA-JURISDICTION-RESOLUTION-001 — Jurisdiction resolves by operating location, not by account (universal · agent-agnostic)

> **Scope:** every repo whose account (tenant) can span more than one legal jurisdiction, and whose operating units must each satisfy obligations that differ by territory.
> Vendor-neutral, product-neutral, domain-neutral, tool-neutral.
> **Status:** SEALED 2026-07-21 by the Principal Architect (chat: "sella") — D-075. Adopted as a **rewrite** of a consumer proposal (kit PR #273) after two independent architecture-advisor rounds; the proposal's restatements of `CANON-CONFIGURATION-DISCIPLINE`, its two citations of canons absent from this kit, and its conflict with sealed `CANON-DATA-LEGAL-COMPLIANCE-001` §6 were resolved before seal. Fire-test passed (l1-neutrality gate GREEN — no territory, oversight body, product or vendor named).
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Family:** data-governance discipline. This canon owns **only** (a) which jurisdiction governs an operating unit and (b) how that binding is versioned in time. It does not restate its neighbours — see §7.

---

## §1 — Principle

> **The law that governs an operating unit is set by where that unit operates, not by where its parent account is registered.**

The **account/tenant** is the data boundary and the commercial relationship, and it may span jurisdictions. The **operating unit** — or the legal entity that groups such units — is what fixes the applicable jurisdiction.

## §2 — Resolution: inherit upward, override at the lowest level

> `effective_jurisdiction(unit) = coalesce(unit's own jurisdiction, account's default jurisdiction)`

The most specific declared level wins; absent levels inherit upward. The account carries a **default** jurisdiction (the single-jurisdiction case, which is the common one); a unit **overrides** it only where it differs. This is the same most-specific-wins shape as `CANON-CONFIGURATION-DISCIPLINE` §3, applied along the **operating-location axis** rather than the deployment axis; that canon owns the general rule and it is not restated here.

**Landing (declare one):** a repo whose operating units cannot span jurisdictions declares `N-A(single-jurisdiction)` — the account-level declaration of `CANON-DATA-LEGAL-COMPLIANCE-001` §6 already satisfies it **where that canon applies** (a repo with no personal data carries no §6 declaration to lean on, and simply declares its single jurisdiction here). A repo that already resolves a law-bearing attribute below the account by another mechanism declares `ADOPTED-NATIVE`.

## §3 — A jurisdiction is a versioned policy bundle, not a label

A jurisdiction resolves to a **bundle of rules held as data**: obligations toward oversight bodies (which artifact, to whom, at what cadence, in which format and channel), domain operating rules (thresholds, limits, required conditions), the structure of operating periods and non-working days, the classification schemes the domain reports in, and the formats of legal and statutory identifiers. The bundle is hierarchical (territory → sub-territory → local authority); the depth a repo needs is L3.

That such policy lives as **data rather than code branches** — and that the application therefore *looks the answer up* instead of branching — is already governed by `CANON-CONFIGURATION-DISCIPLINE` §1 and §5 and is not restated. This canon adds only the **key**: the lookup key is the effective jurisdiction of the operating unit (§2). Changing a unit's jurisdiction resolves a different bundle and therefore different behaviour, with no code change.

## §4 — Validity and immutability

Bundles are **versioned with an explicit validity window** (effective-from, optionally effective-to). A normative change ships as a **new version bearing its own start date**; the system switches on that date — never earlier, never retroactively.

Anything **already emitted** is **pinned to the bundle version in force when it was produced** and is never rewritten when the norm later changes. Re-deriving a historical output under today's rules produces a document that was never valid.

`CANON-VERSIONING-001` governs the versioning of **artifacts** (packages, apps, canons, decision records, tools). This section governs **effective-dated runtime policy data**, which that canon does not cover; the two do not overlap.

## §5 — Reference data is not legal jurisdiction

A catalogue of territories used as a **data value** (a person's nationality, a mailing country) is a different thing from the **legal jurisdiction** that governs an operating unit. They are kept as separate concerns and never collapsed into one field.

## §6 — Anti-patterns

- Binding jurisdiction at the account level as the **only** level **when operating units span jurisdictions** (a repo whose units cannot span them is not in violation — see the §2 landing).
- Rewriting already-emitted output when a norm changes (violates §4).
- Collapsing the territory data-catalogue and the legal jurisdiction into one field (violates §5).

*Branching on jurisdiction in code, and hardcoding per-territory obligations, are already forbidden by `CANON-CONFIGURATION-DISCIPLINE` §1/§5. They are not restated as anti-patterns here.*

## §7 — Ownership (what this canon does NOT do)

| Concern | Owner |
|---|---|
| Which jurisdiction an **account** declares, and every personal-data obligation (retention, consent, tracking, data-subject rights) | `CANON-DATA-LEGAL-COMPLIANCE-001` (§6 and §2–§5) |
| Values live in config, resolve through declared layers, never branch in code | `CANON-CONFIGURATION-DISCIPLINE` §1/§3/§5 |
| Versioning of **artifacts** (packages, apps, canons, ADRs, tools) | `CANON-VERSIONING-001` |
| Who changed what, when — the audit trail | `CANON-DATA-CHANGE-AUDIT-001` |
| The deleted state of an operational record | `CANON-DATA-SOFT-DELETE-001` |
| Carrying rules across a system migration | `CANON-SYSTEM-MIGRATION-DISCIPLINE-001` |

This canon does **NOT** prescribe a storage shape, a bundle format, an engine, or a hierarchy depth. It holds **no territory, no oversight body, and no number**.

## §8 — L3 binding (what the consuming repo owns)

- The concrete **name and shape** of the resolution level (the column, table, or entity that carries a unit's jurisdiction).
- The **bundle engine and storage**, and the hierarchy depth it needs.
- The **real obligation matrices** per jurisdiction: the concrete oversight bodies, statutory and tax identifier formats, classification schemes, and calendars of each territory.
- The **retrofit schedule** where units predate adoption — a legacy unit without a declared jurisdiction is a dated debt, not a silent violation.
- Originating incidents.

The L3 binding points at this canon as the spine; it does not restate the resolution rule or the validity model. Concrete tables, contracts, product names and territories are **L3 and never enter this canon**.

---

## Provenance

Proposed by a consumer-side agent (`REQUEST-CANON-JURISDICTION-RESOLUTION-2026-07-21`, kit PR #273) from **one consumer, one decision, dated 2026-07-21**: a multi-jurisdiction account whose operating units answered to different oversight bodies, where binding the obligations at the account level would have been compliant with the letter of the account-level declaration and wrong in practice. Recorded as single-consumer evidence per the honesty pattern of D-071 — the scar is real pain, not speculation, and the consumer's concrete decision, tables and per-territory matrices stay in that repo.

**Coverage check performed before adoption** (the D-071 lesson — a shallow prior-art check is how a canon silently restates its neighbours): `CANON-DATA-LEGAL-COMPLIANCE-001` §6 stops at the account-level declaration and does not resolve below it, and its scope is personal-data protection rather than operational-regulatory obligations generally — so this canon **extends** it along one axis rather than contradicting it, and §6 gains a one-line pointer instead of a rewrite. `CANON-CONFIGURATION-DISCIPLINE` already owns policy-as-data, layered resolution and the no-branching rule — pointed at, not restated. `CANON-VERSIONING-001` versions artifacts, not effective-dated runtime data. `CANON-RUNTIME-POLICY-ENGINE-001` was checked for "policy as data" adjacency: different domain (agent-runtime policy), no collision. `CANON-VERTICAL-BOUNDARY-001` was cited by the proposal but is itself a DRAFT pending seal and is therefore not claimed as a composition anchor.

The original proposal additionally cited `CANON-TENANT-AGNOSTICISM-001` and `CANON-FEATURE-MATURITY-GATING-001`; **neither exists in this kit** (the former is a consumer-side canon, as D-071 already recorded). Both citations were removed rather than carried forward.
