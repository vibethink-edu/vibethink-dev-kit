# DECISION — Portable readiness check for the §3.1 routing decision-card

**From:** Principal Architect (dev-kit owner)
**To:** ViTo (via Marcelo) — re: field observation on `CANON-CHANGE-PATH-AND-DECISION-CLASSES-001` §3.1
**Date:** 2026-06-30
**Status of this note:** DECISION (architectural direction — in the owner's lane). The *instrument* it authorizes and any *one-line canon pointer* are **PROPOSED → sealed only by the named authority.** Nothing here reopens the sealed principle of the canon.

---

## Verdict

**PORTABLE.** ViTo's recommendation is correct and its citations were verified line-by-line (§3.1 line 60, ¶67 line 67, ¶71 line 71, §6 L3 line 123, §7). The failure mode is **agnostic** — every heir inherits §3.1, therefore every heir inherits the adoption gap where the decision-card "depends on human pressure, not a mechanism" (exactly ¶67). The kit provides the **portable half**; each heir keeps the policy (thresholds, teeth) at L3. This matches ¶71's existing mould and stays inside §6/§7 unchanged.

This is the **same architecture** already sealed for findings-active (§6.1), golden-tasks (§8.1 outcome conformance) and the agent-plane gate: *an obligation becomes active by emitting a durable trace + a portable check over it; the policy stays L3.* The spine stays coherent — we are cloning a pattern, not inventing one.

---

## The one design refinement on top of ViTo's framing

A card **shown in chat and waited-on** is ephemeral — a portable check cannot read "did the agent say it." So the portable half does **not** watch the conversation. It works over a **durable trace**:

- The §3.1 card, on a **genuine fork** (non-trivial work), leaves a **routing-decision record** — path + methodology + executor + recommendation + the authority's GO — in the **decision register that already exists** (`CANON-STATE-MIRROR-AND-DECISION-REGISTER-001` §6). **No new store.** The card's fields map to a register row of kind `routing`.
- Trivial/reversible/no-contract work takes the **direct** path (§3) and emits **no card and no row** — the check must not fire there (¶85). The instrument is silent exactly where the canon is silent.

## The portable instrument (what the kit ships)

1. **Neutral trace contract** — the field shape of a `routing` decision-record (path / methodology / executor / recommendation / GO), reusing the register. Agnostic.
2. **Portable readiness/visibility check (self-verifiable)** — a verifier skeleton that, for a change the heir marks non-trivial, asserts a `routing` record exists and reports **"routed / not-routed (card missing)" without escalating to the human** — verbatim the ¶71 shape. This is the ¶67 fix: *something now routes it.* It is the **general sibling** of the coder-launch readiness check ¶71 already defines (that one is the coder-dispatch special case; this one covers any path/methodology/executor fork).

## What stays L3 (unchanged — §6/§7 not touched)

- the **threshold** — what counts as "non-trivial / boundary" for this repo (§6 already owns path-cut thresholds);
- the **class list + authority** (§4/§5, L3 per §7);
- **teeth** — whether the check **warns or blocks**; "any mechanical enforcement" is explicitly L3 (line 123). The kit ships the *skeleton*, the heir sets the bite.

## Non-portable half (L3 / human confirmation — mirrors ¶71)

Whether the human **actually** gave GO (the live authority act) — the check can see a row exists but cannot adjudicate the authority's intent. That single piece stays a human/L3 confirmation, the same way ¶71 keeps "live forge state" out of the portable half.

---

## Authority & next step

- The **direction** (portable) is decided here — owner's lane.
- The **instrument** (trace-contract doc + verifier skeleton) will be drafted **PROPOSED** in the kit; it becomes spine only when the named authority **seals** it.
- Any **one-line pointer** added to §6's L3-binding ("the heir wires the portable routing-card readiness check") is a canon touch = **authority-sealed** (§4: canon is always sealed). Drafted PROPOSED; not self-sealed.

## Meanwhile (no one waits)

ViTo is right to **not stand still**: it honors §3.1 on every non-trivial task now (emits the routing decision-card) without waiting for the instrument. Campus and WorkBench inherit the instrument the moment it's sealed — the pattern is cloned, nothing is reinvented per-repo.
