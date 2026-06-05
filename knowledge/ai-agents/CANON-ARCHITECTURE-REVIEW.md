# CANON-ARCHITECTURE-REVIEW — How an advisor reviews an architecture (universal · agent-agnostic)

> **Scope:** every repo where a second architect / external advisor / audit agent reviews the system's architecture (not a single change).
> Vendor-neutral, product-neutral, tool-neutral.
> **Status:** SEALED 2026-06-05 by Marcelo (Principal Architect) — Tier A consolidation (autonomous-close authorization).
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Siblings (do not duplicate):** `REVIEW-CALL-CHECKLIST` (the controls for reviewing a single *implementation* — recall/precision, correct-by-design) · `REVIEW-READINESS-PROTOCOL` (is the work *ready* to review + handoff states). **This canon covers the third thing: verdicts on the *architecture itself*** — gaps, drift, contradictions, and the lens the reviewer brings.

---

## §1 — Purpose

This canon defines how an advisor reviews an architecture. The goal is **not** to shield the system from criticism — it is to make criticism **accurate**.

An advisor may find real gaps, but must not misread the system as a disconnected group of modules, nor force it into a default external product frame it does not belong to.

---

## §2 — Do not impose a foreign category frame

An advisor must not default to reviewing the system through the lens of whatever category it superficially resembles (a CRM, a helpdesk, a channel inbox, an automation tool, an agent command-center, a copied product). Such systems may be useful **references**; they do **not** define this system's authority model, vocabulary, or success criteria.

The concrete list of frames that are wrong *for a given product* is an L3 concern (the consuming repo names its own anti-frames). The universal rule: **review the system on its own category's terms, not the reviewer's default category.**

---

## §3 — Two review modes (both read-only)

An advisor operates in either or both modes. **Neither mode mutates anything** — the advisor produces judgment, not changes.

- **Strategic review** — improve the architecture. Read canon, protocols, and design decisions; proactively propose hardening, simplification, missing edge cases, protocol gaps. Output: improvement proposals.
- **Operational review** — detect violations. Inspect the real state against governing rules (scope breaches, missing controls, drift between code and sealed canon, ghost work). Output: compliance findings directed to the human authority.

The human authority decides on every finding. The advisor never reverts, blocks unilaterally, or modifies — it reports and recommends.

---

## §4 — First-reads discipline

Before issuing a verdict, the advisor reads the documents that govern the area under review (the system's architecture packet, its canon index, the foundational/philosophy canon, the authority map, and the capability-specific canon for the reviewed area). The concrete list is an L3 concern.

**A review that skips the governing reads is incomplete** — its verdict is treated as provisional, not actionable.

---

## §5 — Classification taxonomy

Every finding must be classified. A finding without a classification is an **advisory note, not an actionable architecture finding.**

| Classification | Meaning | Required action |
|---|---|---|
| **Confirmed gap** | The architecture wants it; code/docs do not provide it. | Create a task, plan, or implementation PR. |
| **Implementation drift** | Canon is right; code diverges. | File a fix or remediation plan. |
| **Documentation drift** | Code/canon moved forward; older docs are stale. | Update or supersede the docs. |
| **Resolved by canon** | The concern is already answered by governing canon. | Cite the canon; do not reopen. |
| **Confirmed canon contradiction** | Two governing documents conflict. | Propose supersession or a human-authority decision. |
| **Needs human decision** | The system has valid options; only the authority can choose. | Present options and **stop** before changing authority. |

---

## §6 — The authority test

Before calling something duplicated, missing, or misplaced, the advisor answers:

1. What *kind* of thing is it — a capability, a layer, a projection, a surface, a responsibility model, an artifact domain?
2. Which document owns its source of truth?
3. Is the issue a **source-of-truth violation** or a **missing projection** (the truth exists but isn't surfaced where expected)?
4. Is it **code drift**, **documentation drift**, or a **real architectural gap**?
5. Does the proposed fix **preserve the authority map**, or quietly create a second source of truth?

---

## §7 — Canon versus runtime

Canon and runtime do not always mature at the same time. A concept may be **approved in canon while implementation is partial** — that is **not automatically a contradiction.**

```
✅  Canon says X. Runtime implements Y. → therefore: implementation drift / confirmed gap / documentation drift.
❌  Runtime does not fully implement X. → therefore: "the architecture has no north."
```

Partial runtime is drift to be closed, not evidence that the architecture is rudderless.

---

## §8 — Approval boundary

The human authority is the **sole final approver** of canon. Domain architects may draft or amend canon **in their own domain when the authority authorizes it** — this does not create a second approval path. **Advisors provide judgment; they do not approve canon.**

---

## §9 — Output format

An architecture review leads with:

```
Verdict:
Scope reviewed:
Governing reads completed:
Top findings by severity:
Classification per finding:
Canon contradictions:
Implementation drift:
Documentation drift:
Decisions needed from the human authority:
Recommended next PRs:
```

This keeps the review useful to humans and executable by agents.

---

## §10 — The advisor's job

> The advisor's job is to help the human authority see what the team missed.
> The advisor's job is **not** to make the human authority rebuild the same architecture again under a different name.
