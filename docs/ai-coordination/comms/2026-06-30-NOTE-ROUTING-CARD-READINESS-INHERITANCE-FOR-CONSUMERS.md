# NOTE — Routing-card readiness check: available to inherit

**From:** Principal Architect (dev-kit owner)
**To:** consuming repos (all heirs of the dev-kit)
**Date:** 2026-06-30

## Available

`REFERENCE-ROUTING-CARD-READINESS-001` is **SEALED** (dev-kit `master` `8f362ec`) and its L3-binding pointer is applied in `CANON-CHANGE-PATH-AND-DECISION-CLASSES-001` §6. The portable half of the §3.1 routing decision-card is now inheritable.

**Proven by first consumer:** the field-observer repo wired it and ran the §5 fire-test **PASS 4/4** against a real register (its PR is sealed). This is the reference consumption — not the thing you copy.

## What is shared (inherit this — one thing only)

The **portable half**:
- the `routing` trace **field contract** (REFERENCE §1) — `kind, path, methodology, executor, recommendation, authority_go, ref`;
- the **check contract** (REFERENCE §2/§4) — three outputs `N/A | ROUTED | NOT-ROUTED`, read-only over the register, **never escalates to the human**.

## What each heir declares itself (do NOT copy another repo's)

Per canon §6/§7, these are **L3 — yours**:
- your **non-trivial predicate** (what counts as "non-trivial / boundary / contract" *here*);
- your **class list + authority**;
- your **teeth** — `NOT-ROUTED` warns or blocks (start at **warn**; flip to block later, authority-sealed);
- your **register instance** (reuse your decision-register; do not invent a new store).

Then run **your own §5 fire-test** against **your** register before you rely on it — 3 cases (routed / trivial-silent / card-suppressed→not-routed) + the no-escalation assertion. Passing someone else's fire-test does not certify yours.

## Not pushed

This is a **pull**: heirs adopt on their next dev-kit refresh, on their own schedule. Nothing is cabled into any consumer repo by the kit.
