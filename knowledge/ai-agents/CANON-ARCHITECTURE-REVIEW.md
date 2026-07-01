# CANON-ARCHITECTURE-REVIEW — How an advisor reviews an architecture (universal · agent-agnostic)

> **Scope:** every repo where a second architect / external advisor / audit agent reviews the system's architecture (not a single change).
> Vendor-neutral, product-neutral, tool-neutral.
> **Status:** SEALED 2026-06-05 by the Principal Architect — Tier A consolidation (autonomous-close authorization). **Amendment 2026-06-05 (authorized): added the over-engineering lens + hard-drop discipline (§5.1), the independence axis in-field/fresh-context (§3.1), and the inbound wiring from the verification-selection gate (§3.2).**
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Siblings (do not duplicate):** `REVIEW-CALL-CHECKLIST` (the controls for reviewing a single *implementation* — recall/precision, correct-by-design) · `REVIEW-READINESS-PROTOCOL` (is the work *ready* to review + handoff states) · `CANON-TESTING-GATE` (the verification-selection gate that escalates here — §3.2) · `CANON-DEV-MODE-DISCIPLINE` (the over-engineering signals the §5.1 lens reads). **This canon covers the third thing: verdicts on the *architecture itself*** — gaps, drift, contradictions, over-engineering, and the lens the reviewer brings.

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

## §3.1 — Independence axis: in-field (default) vs fresh-context (escalation)

§3's two modes (strategic/operational) describe *what* the advisor looks for. This axis is orthogonal: it describes *who* advises and *how independent* they are.

- **In-field review (the light default).** The architect already in the terrain of the work advises on it directly — fast, context-rich, cheap. It is **not** independent: the one who built the work is close to it. Right for the common case, where the cost of an independent context is not yet warranted.
- **Fresh-context review (the escalation).** A separate advisor, in a context that did **not** build the work, reviews it. Independent by construction — *the one who builds does not grade* (the state-of-the-art's core verification finding). Slower and costlier: the advisor must acquire the context the builder already had. Warranted when independence outweighs speed — high stakes, ambiguity, suspected blind spots, or when in-field review keeps clearing work that later fails.

**The rule:** in-field by default; escalate to fresh-context when **independence > speed.** This is not a separate gate — it is the same review, run by someone who did not write the thing.

---

## §3.2 — Inbound: the verification-selection gate escalates here

When a verification-selection gate (`CANON-TESTING-GATE`) meets a high-complexity or ambiguous change, it does not pick a fixed verification set — it escalates the *strategy decision* to a **fresh-context** advisor (§3.1) running this canon. The advisor decides the verification type set; the human authority decides on its findings. This is the tail of the same distribution, **not a fifth gate** — the spine and the gate are two faces of one escalation.

---

## §4 — First-reads discipline

Before issuing a verdict, the advisor reads the documents that govern the area under review (the system's architecture packet, its canon index, the foundational/philosophy canon, the authority map, and the capability-specific canon for the reviewed area). The concrete list is an L3 concern.

**A review that skips the governing reads is incomplete** — its verdict is treated as provisional, not actionable.

---

## §5 — Classification taxonomy

Every finding must be classified by kind (below) **and survive the value filter in §5.1.** A finding that cannot be classified — or that is classified but serves none of the §5.1 values — is **dropped**, not downgraded to an advisory note.

| Classification | Meaning | Required action |
|---|---|---|
| **Confirmed gap** | The architecture wants it; code/docs do not provide it. | Create a task, plan, or implementation PR. |
| **Implementation drift** | Canon is right; code diverges. | File a fix or remediation plan. |
| **Documentation drift** | Code/canon moved forward; older docs are stale. | Update or supersede the docs. |
| **Resolved by canon** | The concern is already answered by governing canon. | Cite the canon; do not reopen. |
| **Confirmed canon contradiction** | Two governing documents conflict. | Propose supersession or a human-authority decision. |
| **Needs human decision** | The system has valid options; only the authority can choose. | Present options and **stop** before changing authority. |

---

## §5.1 — The over-engineering lens and the hard-drop discipline

A reviewer prompted to find gaps will find some even when the work is sound. Chasing every one of them *is* over-engineering — the advisor becomes the ceremony it exists to catch. Two mechanisms prevent that.

**The fourth lens — over-engineering.** Alongside the gaps / drift / contradiction taxonomy (§5) and the strategic-improvement mode (§3), the advisor reviews for **ceremony without purpose**: defensive machinery around things that cannot fail, preservation where deletion is free, multi-step approval for mechanically-equivalent choices, abstraction layers with a single caller, documentation of paths that do not exist yet. (The pre-production discipline canon, `CANON-DEV-MODE-DISCIPLINE`, enumerates the concrete signals.) The litmus: *if a competent agent could resolve it in under 30 minutes by reading the code and applying a clear fix, it is not an architecture finding — it is just work.*

**The hard-drop.** Every finding must serve at least one of:

- **correctness** — the system does the wrong thing;
- **coherence** — the system contradicts its own governing rules;
- **real cost** — a concrete, present cost in money, security, time, or maintainability.

A finding that serves none of these is **discarded — not kept as an advisory note.** The advisory-note escape is removed on purpose: an advisory note is how over-engineering re-enters through the back door. **Silence on a non-finding is the correct output.** An advisor that reports nothing because nothing met the bar has done its job; padding the verdict to look thorough is the failure mode this discipline forbids.

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
Review mode: strategic | operational | both   ·   Independence: in-field | fresh-context
Scope reviewed:
Governing reads completed:
Top findings by severity:
Classification per finding:   (each serves correctness | coherence | real-cost — §5.1)
Canon contradictions:
Implementation drift:
Documentation drift:
Over-engineering / ceremony to remove:
Decisions needed from the human authority:
Recommended next PRs:
```

This keeps the review useful to humans and executable by agents. A clean review legitimately leaves most lines empty — see §5.1: silence on a non-finding is the correct output, not a gap in the report.

---

## §10 — The advisor's job

> The advisor's job is to help the human authority see what the team missed.
> The advisor's job is **not** to make the human authority rebuild the same architecture again under a different name.
