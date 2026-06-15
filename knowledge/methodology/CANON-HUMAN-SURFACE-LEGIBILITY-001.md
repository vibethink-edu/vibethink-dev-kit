# CANON-HUMAN-SURFACE-LEGIBILITY-001 — Every human-facing surface leads with the decision layer

**Status:** SEALED 2026-06-15 by the Principal Architect — fire-tested on a verbose-but-mute health screen and the one-screen `devkit-doctor` that fixed the same shape.
**Date:** 2026-06-15
**Scope:** Every repo that shows a human a surface to read — CLI output, a dashboard or UI health view, a status report, a log, an API health endpoint, an agent's message. Vendor-neutral, product-neutral, tool-neutral.
**Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
**Companion canons:** [`CANON-MULTI-AGENT-ORCHESTRATION`](../ai-agents/CANON-MULTI-AGENT-ORCHESTRATION.md) (§5.1 — the "compass": outcome-first / plain-language-first / detail-on-demand for an **agent→human message**; this canon generalizes that same shape to **any** surface, and §5.1 is its message-instance) · [`CANON-CONTEXT-HYGIENE`](../ai-agents/CANON-CONTEXT-HYGIENE.md) (depth-on-demand mirrors the don't-dump discipline) · [`CANON-AUDIT-PROTOCOL`](./CANON-AUDIT-PROTOCOL.md) (a sibling: that asks *does it lie?*; this asks *can a human read the verdict in one glance?* — a mute surface is not lying, it is failing legibility).

---

## §1 — Principle

**A human-facing surface leads with the decision layer.** The verdict / outcome comes
first, in plain language; the detail waits to be pulled. A surface that is **verbose
but does not state the verdict is a defect — not thoroughness.**

The human's scarcest resource is attention. A surface that makes them *read everything
to find "am I OK, and what do I do?"* has failed, however complete its content. Volume
is not transparency; **transparency is the verdict plus a path to the detail.**

> **The test:** can a reader get the verdict and the 2-3 actionable items **in one
> glance**, without scrolling or parsing? If not, the surface is mute — fix the shape,
> not the reader.

---

## §2 — Relationship to the companion spines (no duplication)

| Concern | Owner | This canon |
|---|---|---|
| The **agent→human message** shape (outcome-first, plain-language-first, decision-layer-then-depth, never close open-ended) | **`CANON-MULTI-AGENT-ORCHESTRATION`** §5.1 (the compass) | does **not** restate; §5.1 is the **message-instance** of this canon — this generalizes the same shape to *any* surface |
| Don't dump; persist/expose selectively; context is not free | **`CANON-CONTEXT-HYGIENE`** | does **not** restate; "detail on demand" (§3) is the surface-side of that discipline |
| Does the artifact **lie**? (truthfulness + finding disposition) | **`CANON-AUDIT-PROTOCOL`** | sibling, different object: that judges *truth*; this judges *legibility* — a surface can be truthful **and** mute |

This canon **owns** what had no agnostic home: the rule that **all** human surfaces (not
just agent messages) lead with the decision layer, the **verbose-but-mute anti-pattern**,
and the one-glance test.

---

## §3 — The shape (what "leads with the decision layer" means)

A legible surface, in order:

1. **Verdict first.** One line: are we OK, and if not, *how many* things need action.
   (`✅ GREEN — 7/7 pass` · `❌ RED — 5/7 pass, 2 to fix`.)
2. **One line per item.** Status marker + the single most important fact — not the raw
   record.
3. **The fix, for each red.** Actionable next step, not just `FAILED`. A red that does
   not say what to do is half a defect report.
4. **Detail on demand.** Verbosity lives behind a flag / toggle / drill-in
   (`--verbose`, expand, "show raw") — **never** the default view.
5. **No silent gaps.** What was skipped, not-run, or not-applicable is **stated**
   (`skipped: X (no config)`), never simply absent — absence reads as "fine" and lies
   by omission (ties to `CANON-AUDIT-PROTOCOL`).

---

## §4 — The anti-pattern: verbose-but-mute

A surface that emits a **wall** the human must read end-to-end to learn the one thing
that matters. It *feels* thorough and is actually the failure this canon exists to
prevent. Neutral examples:

- a **health view** that lists every individual check with no overall verdict;
- a **log / CI output** that is "green by the absence of a red line" — you confirm
  success by *not finding* failure;
- a **dashboard** of dozens of metrics with no "so what" / no lead indicator;
- a **report** whose conclusion is on page 9.

The cure is never "add a summary at the bottom" — it is **invert the order**: verdict at
the top, depth underneath, on demand.

---

## §5 — Where it applies

CLI tool output · dashboards and UI health/status views · status reports and summaries ·
structured logs a human reads · API health/diagnostic endpoints · agent→human messages
(via the compass, `CANON-MULTI-AGENT-ORCHESTRATION` §5.1). If a human is meant to read it
and decide something from it, this canon applies.

> **Reference instances:** the **compass** (§5.1) for messages; **`tools/devkit-doctor.mjs`**
> for a CLI — it collapses N verbose gate engines into one screen (verdict, one line per
> gate, the fix per red, `--verbose`/`--json` for the depth). Mirror its *shape*, not its code.

---

## §6 — L3 binding (what the consuming repo / surface owns)

- the concrete **"depth on demand" mechanism** per surface (a `--verbose` flag, a UI
  toggle, an expandable row, a `?detail=full` query);
- the **verdict vocabulary** (GREEN/RED, OK/ATTENTION, pass/fail counts) and what counts
  as a "red" for that surface;
- the **styling / layout** (this canon governs the *order and the one-glance test*, not
  fonts or colors).

The L3 binding **points at this canon as the spine**; it does not re-derive the shape or
the anti-pattern. If a surface ships verbose-without-a-verdict, it drifts.

---

## §7 — What this canon does NOT do

- It does **NOT** restate the **agent-message** mechanics (the relay block, never-close-
  open-ended, the status fields) — that is `CANON-MULTI-AGENT-ORCHESTRATION` §5.1.
- It does **NOT** judge **truthfulness** — that is `CANON-AUDIT-PROTOCOL` ("does it lie?").
- It does **NOT** prescribe visual design, framework, or tooling — all L3.
- It does **NOT** mean "less information" — the depth stays; it just stops being the
  *first* thing the human sees.

---

## Provenance

Born from a concrete bump (Rule: build on real pain): a vertical's **health screen was
verbose but mute** — the operator could not tell, at a glance, whether things were OK or
what to do, despite the screen being "complete". The same failure shape was fixed in the
dev-kit by `tools/devkit-doctor.mjs` (N verbose gate engines → one verdict-first screen,
detail on demand). Generalizing both: the compass (`CANON-MULTI-AGENT-ORCHESTRATION`
§5.1) had already sealed this shape for *agent messages* — but nothing said it applied to
*every* human surface. This canon lifts it from "message etiquette" to a **surface
legibility law**, with the verbose-but-mute anti-pattern named so it can be called out.

**Fire-test:** vendor/product/agent/tool-neutral — names no product, vendor, agent
harness, or framework (the one named file is a kit-internal reference instance, not a
dependency). PASS.

**SEALED 2026-06-15 by the Principal Architect (merge = seal).**
