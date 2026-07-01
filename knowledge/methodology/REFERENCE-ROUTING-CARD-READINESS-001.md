# REFERENCE-ROUTING-CARD-READINESS-001 — Portable readiness check for the change-path routing card

**Status:** **PROPOSED** — drafted by the Principal Architect. It becomes spine only when the named authority **seals** it. Until then it is a reviewable draft; no heir wires it yet.
**Date:** 2026-06-30
**Scope:** Every repo that inherits `CANON-CHANGE-PATH-AND-DECISION-CLASSES-001` §3.1 (the routing decision-card). Vendor-neutral, product-neutral, harness-neutral.
**Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
**Spine:** this is the **portable instrument** the L3 binding of `CANON-CHANGE-PATH-AND-DECISION-CLASSES-001` §6 anticipates ("any mechanical enforcement" is L3). It ships the **portable half**; it does **not** move thresholds, the class list, or the warn-vs-block teeth off L3. The canon principle is not reopened.

---

## §0 — Why this exists (the adoption gap)

`CANON-CHANGE-PATH-AND-DECISION-CLASSES-001` §3.1 makes the **executor** the gate's third output and presents path / methodology / executor as **one short decision card** the authority approves. ¶67 predicts the failure mode precisely: *"a competent agent may reach the dispatch pattern from its own memory — but nothing routed it there,"* so a repo whose agent lacks that memory improvises or skips it. In the field this shows up as **work advancing with no card emitted, only surfaced when a human asks "why wasn't this routed?"** — the card depended on **human pressure, not a mechanism.**

The fix is the same shape §3.1 ¶71 already uses for the coder launch-surface: split the concern into a **portable half** an agent self-verifies (reports "ready / missing X" without escalating) and a **non-portable half** that stays an L3/human confirmation. This reference is the **general sibling** of ¶71 — ¶71 covers the coder-dispatch special case; this covers **any** path / methodology / executor fork.

---

## §1 — The trace contract (reuse the register, invent no new store)

A card shown in conversation and waited-on is **ephemeral** — a portable check cannot read it. So the card, on a **genuine fork**, must leave a **durable trace**. The durable home already exists: the **decision register** (`CANON-STATE-MIRROR-AND-DECISION-REGISTER-001` §6). No new store.

On non-trivial work the card writes one **`routing` decision-record** with this neutral field shape:

| Field | Meaning |
|---|---|
| `kind` | `"routing"` — distinguishes it from other register rows |
| `path` | `direct` \| `spec-first` \| `design-gate` (§3) |
| `methodology` | the spec-weight / methodology chosen (concrete set is L3) |
| `executor` | `human` \| `autonomous-coder` \| `current-agent` (§3.1) |
| `recommendation` | the one-line recommendation the card led with |
| `authority_go` | the authority's GO (present \| absent) + channel/evidence pointer |
| `ref` | pointer to the unit of work (branch / change-set / task id) |

**Silence where the canon is silent (¶85):** trivial + reversible + no-contract work takes the **direct** path and emits **no card and no row**. The trace contract and the check below both treat that as `N/A`, never as a violation.

---

## §2 — The portable readiness/visibility check

A self-verifiable check with **exactly the ¶71 contract** — it reports, it does not escalate:

**Input:** a unit of work + the heir's non-trivial predicate (L3) + read access to the register.

**Output (one of):**
- `N/A` — the work is trivial/reversible/no-contract (direct path); no card expected. **Not a finding.**
- `ROUTED` — a `routing` record exists for this unit and is well-formed (all fields present; `path`/`executor` in range).
- `NOT-ROUTED (card missing)` — the work is non-trivial but **no** `routing` record exists, or the record is malformed. This is the visible, mechanical signal that replaces human pressure.

**Rules of the portable half:**
1. It **self-reports without escalating to the human** (¶71) — surfacing "not-routed" is the mechanism; the human is not the detector.
2. It is **read-only** over the register — it observes, it does not write the card. (The agent writes the card per §3.1; the check verifies the trace.)
3. It **never fires on the direct path** — `N/A` is silent.
4. It is **advisory by default** — see §3 on teeth.

---

## §3 — Portable vs L3 (the split — §6/§7 unchanged)

**Portable (this reference ships it, once, for all heirs):**
- the `routing` trace **field contract** (§1);
- the **check contract + reference skeleton** (§2, §4): inputs, the three outputs, the no-escalate rule.

**L3 (each heir owns — `CANON-CHANGE-PATH-AND-DECISION-CLASSES-001` §6/§7, unchanged):**
- the **non-trivial predicate** — what counts as "non-trivial / boundary / contract" for this repo (§6 already owns path-cut thresholds);
- the **class list and who the authority is** (§4/§5, L3 per §7);
- the **teeth** — whether `NOT-ROUTED` **warns** (report only) or **blocks** (fails a gate). "Any mechanical enforcement" is explicitly L3 (canon §6). The kit ships the skeleton; the heir sets the bite.

**Non-portable half (L3 / human confirmation — mirrors ¶71's "live forge state"):** whether the human **actually** gave GO. The check can see `authority_go` is *recorded*; it cannot adjudicate the authority's intent. That one piece stays a human/L3 confirmation.

---

## §4 — Reference skeleton (PROPOSED — reference only, not a shipped tool yet)

Neutral pseudocode. An heir adapts `isNonTrivial()` and `readRegister()` to its L3 instances; the kit does not presume either.

```
// readiness: does non-trivial work carry a routing decision-card trace?
function routingCardReadiness(unit, cfg) {
  if (!cfg.isNonTrivial(unit)) return { status: "N/A" };          // §1 ¶85 — direct path, silent

  const row = cfg.readRegister(unit.ref)                           // §1 — reuse the decision register
                 .find(r => r.kind === "routing");

  if (!row) return { status: "NOT-ROUTED", reason: "card missing" };

  const ok = row.path && inRange(row.path, ["direct","spec-first","design-gate"])
          && row.executor && inRange(row.executor, ["human","autonomous-coder","current-agent"])
          && row.recommendation != null;

  return ok
    ? { status: "ROUTED", row }
    : { status: "NOT-ROUTED", reason: "record malformed", row };
}
// The check REPORTS this. Whether NOT-ROUTED warns or blocks is L3 (§3). It never escalates to the human by itself (¶71).
```

---

## §5 — Fire-test protocol (before the family inherits)

The first consuming repo validates the portable half against a **real register** before the rest of the family wires it:

1. Run a **non-trivial** unit that emits a card → assert `ROUTED` with a well-formed row.
2. Run a **trivial/direct** unit → assert `N/A` (silent; no false positive).
3. Run a **non-trivial** unit with the card **suppressed** → assert `NOT-ROUTED (card missing)` — the mechanism catches the ¶67 gap **without** a human asking.
4. Confirm the check **never escalated to the human** in any of the three (report-only).

Pass = the check reports all three cleanly against the heir's real register instance.

---

## §6 — PROPOSED canon pointer (for the named authority to seal — NOT applied here)

This reference does **not** edit the sealed canon. The following one-line addition to `CANON-CHANGE-PATH-AND-DECISION-CLASSES-001` §6 (L3 binding) is offered **PROPOSED**, to be sealed only by the named authority:

> *(§6, add to the L3 bullets)* — the heir **wires the portable routing-card readiness check** (`REFERENCE-ROUTING-CARD-READINESS-001`) over its decision-register instance, and declares its **non-trivial predicate** and whether `NOT-ROUTED` **warns or blocks**.

Sealing that line makes the instrument part of the inheritance contract. Until sealed, heirs may fire-test but do not treat it as required.

---

## Provenance

Forced by a field observation from an inheriting repo (2026-06-30): non-trivial work advanced with **no §3.1 card emitted**, surfaced only when the human asked why — the ¶67 failure mode verbatim. The canon principle was complete; what was missing was the **portable mechanism** that makes card-emission active instead of pressure-dependent. This reference clones ¶71's portable-half/readiness mould onto a durable trace (the existing decision register), keeping thresholds and teeth on L3. Same active-mechanism + durable-trace architecture as the findings and outcome-conformance instruments already in the spine.

**Fire-test:** vendor/product/agent/tool/person-neutral — names no product, vendor, agent harness, person, or concrete class. PASS.

**PROPOSED 2026-06-30 by the Principal Architect — awaiting seal by the named authority.**
