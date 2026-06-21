# CANON-DATA-LEGAL-COMPLIANCE-001 — Data-protection legal compliance (universal · agent-agnostic)

> **Status:** SEALED 2026-06-18 by the Principal Architect ("sella") — D-018. Seals the agnostic *mechanics* of data-protection compliance; the concrete laws, jurisdictions, and retention **numbers are L3 by design** (each repo binds them — the canon never holds a number). The consent-canon separation review is done (relay sent to the consumer architect); per-repo legal numbers are an L3/legal-research concern, not a seal blocker. Fire-test passed (no specific law named as *the* law; regimes appear only as illustration).
> **Scope:** every repo that stores or processes **personal data**.
> **Home:** the dev-kit (supra-repo). On promotion, inherited by every repo as upstream → fork.
> **Family:** data-governance discipline · binds with `CANON-DATA-CHANGE-AUDIT-001.md` (the audit-trail is itself subject to §2 retention) · sibling of `CANON-DB-SECURITY-BASELINE-001.md`. A consumer's product-specific consent/capture canon (e.g. a friendship/capture model) is its **L3 binding**, not a replacement for this neutral core.

## §1 — Principle

> **Every system that handles personal data must be able to honour its data-protection obligations — retention limits, lawful consent, cookie/tracking rules, and data-subject rights — as a governed capability. The *mechanics* are universal; the specific *laws, jurisdictions, and numbers* are per-repo/per-jurisdiction binding (L3).**

The obligations exist under every modern data-protection regime — *e.g.* GDPR (EU), Habeas Data / Ley 1581 (CO), LGPD (BR), CCPA/CPRA (CA), and their peers. The kit governs the **shape every system must satisfy**; which regime applies, and the exact windows, bind at L3.

## §2 — Retention by data type

- Each class of personal data has a **retention window** — how long it is kept — **set by the legal requirement** for that data type and jurisdiction (the number is L3, not the kit's).
- Past the active window, data is **archived (cold), not hard-deleted** — preserve history; archive ≠ delete. True deletion happens **only** when a legal obligation *requires* it (§5 erasure), as a governed, logged exception.
- A system declares, per data class: the window, the archive destination, and the legal basis for the number.

## §3 — Consent and lawful basis

- For data that requires it, the **lawful basis** (consent, contract, legitimate interest, legal obligation…) is **recorded** — who/what/when, the scope consented to, and that it is **withdrawable**.
- Withdrawal is honoured downstream (it constrains processing + may trigger §5).
- A consumer's *capture philosophy* (how/why it gathers data, its product vocabulary) is **L3** and stays in that product's canon; the agnostic mechanic here is only **"record the lawful basis, make it withdrawable, honour withdrawal."**

## §4 — Cookies / tracking

- Client-side tracking (cookies, pixels, fingerprinting, analytics) is **categorized** (strictly-necessary vs optional) and **consented where the jurisdiction requires it** before non-essential tracking runs.
- The specific banner, categories, and jurisdiction rules are L3; the mechanic — *no non-essential tracking without the required consent* — is universal.

## §5 — Data-subject rights

Every system can fulfil a **data-subject request** over the personal data it holds:
- **access** (what we hold), **rectification** (correct it), **erasure / right-to-be-forgotten** (delete where legally due), **portability** (export), and **objection/restriction** of processing.
- Erasure extends to copies and, where legally required, to the **audit-trail** (`CANON-DATA-CHANGE-AUDIT-001` §9) — a governed, logged exception to "never delete".
- The request intake + fulfilment mechanism is L3; the **capability** is universal.

## §6 — Applicable jurisdiction

Each tenant/system **declares its governing jurisdiction(s)**; that declaration is what binds the concrete laws, windows, and DSR timelines (L3). A multi-tenant system may carry different jurisdictions per tenant.

## §7 — Per-repo binding (L3)

Each consuming repo declares:
- The **applicable law(s) / jurisdiction(s)** (§6).
- The **retention windows** per data class + archive destinations (§2).
- The **consent / lawful-basis** record mechanism + withdrawal handling (§3).
- The **cookie/tracking** categories + consent surface (§4).
- The **data-subject-request** intake + fulfilment path, incl. erasure reaching the audit-trail (§5).

The laws, numbers, jurisdictions, and mechanisms are L3; they never flow into this neutral core.

## §8 — Inheritance

This kit is the **upstream** of governance. Each repo is a **fork** that inherits this canon and binds its own L3 laws + numbers + mechanisms.

## Post-seal follow-ups (L3, not seal blockers)

1. **Consent-canon separation (relay sent).** The review is done: a consumer's product consent canon (a product-side `CANON-DATA-CAPTURE-CONSENT-001`) mixes agnostic legal mechanics with its product philosophy. On its next re-seal it refactors to **point here** for the agnostic mechanics — data-subject rights + jurisdiction-bound timelines, portability, transparency/consent-for-new-processing, and the erasure-vs-retention tension — keeping only its L3 numbers + bindings (the capture *philosophy* stays L3). That refactor is the consumer architect's, under the Principal Architect.
2. **Jurisdiction + retention numbers are L3 by design.** Each repo binds its regime + windows (e.g. minors' data retention under the applicable law) via legal research; the canon never holds the number. Not a seal blocker — it is the steady state.

## Fire-test

The sealed form names no specific law/jurisdiction as *the* law — those appear only as illustration (GDPR / Habeas Data / LGPD / CCPA), and bind at L3. The agnostic mechanics (retention-by-type, recorded-withdrawable-consent, consented-tracking, data-subject-rights, declared-jurisdiction) are the only normative content.

## Provenance

Opened 2026-06-18 from a consumer finding (`FINDING-LEGAL-COMPLIANCE-DOMAIN-UNGOVERNED`): the agnostic legal-compliance mechanics were ungoverned (the dev-kit had no canon; the consumer's consent canon is product-specific and correctly stays L3). The concrete trigger was `CANON-DATA-CHANGE-AUDIT-001` needing a retention window whose number is a legal requirement — which lives in this domain.
