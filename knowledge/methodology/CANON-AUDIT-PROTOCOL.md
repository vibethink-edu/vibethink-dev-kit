# CANON-AUDIT-PROTOCOL — How an audit judges and how it is disposed (universal · agent-agnostic)

> **Scope:** every repo that audits its own canon, features, or surfaces for truthfulness and follow-through.
> Vendor-neutral, product-neutral, tool-neutral.
> **Status:** DRAFT — awaiting human-authority seal.
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Sibling (do not duplicate):** `CANON-ARCHITECTURE-REVIEW` — that canon is the *verdict on a system's architecture* (is the design sound, what are the gaps). **This canon is a different object: the audit of *artifacts* (canon, features, surfaces) for *truthfulness*, and the *disposition* that carries every finding to closure.** Review asks "is it sound?"; audit asks "does it lie, and did we act on what we found?"
> **SOTA-informed (`CANON-DEVELOPMENT-PROCESS §7`):** prior-art for the two halves — *claims/documentation auditing* (does the artifact assert a present truth it cannot back?) and *finding-lifecycle / triage disposition* (issue states carried to closure, definition-of-done for findings). Patterns extracted, not a tool adopted.

---

## §1 — The root question: does it LIE? — not: is it built?

> **An audit judges whether an artifact tells the truth, not whether the future it describes is already built.**

Describing architecture that does not yet exist is **a decision to improve, not a failure.** Reverting a sealed canon that describes good-but-unbuilt architecture **destroys the intent** and exposes the repo to reinvention by future agents. The audit's job is to catch **lies** (false claims of a present state, contradictions, verifiable errors, real security vectors) — not to punish vision.

---

## §2 — Five verdict categories

Applies to every audit — canon, feature, or surface.

| # | Category | Question | Verdict | Action |
|---|----------|----------|---------|--------|
| 1 | **False present-claim** | Does it say "X exists / X works now" when that is not true? | **FAIL** | Revert to draft, or amend the claim |
| 2 | **Canon contradiction** | Does it contradict another sealed canon? | **FAIL** | One side yields; the human authority decides which |
| 3 | **Verifiable technical error** | A wrong type, a missing foreign key, a mis-named table — provably wrong | **AMEND** | Fix in place; keep sealed |
| 4 | **Unimplemented future design** | Does it describe architecture not yet built? | **PASS** (findings if any) | Do not touch — improvement decision, not a fault |
| 5 | **Security risk** | Is there a real attack vector in the linked code? | **URGENT FINDING** | Not a canon FAIL — an implementation finding |

---

## §3 — Application rules (what is *not* a lie)

- **Design DDL / schema-as-proposal is not a lie.** A canon that includes a schema definition as a *proposal* is defining architecture; if it is not yet built, it is pending design — not phantom infrastructure. **Exception:** if it explicitly says "implemented / merged / applied," that *is* a present-claim and must be verified.
- **Roadmap ≠ FAIL.** Something listed as pending in a roadmap, described in canon as design, is coherent — not penalized.
- **Untracked-but-real ≠ phantom.** Files that exist on disk but are not yet committed are real; do not declare them missing. Look in the correct location before declaring anything absent (the concrete paths are an L3 concern).
- **Vocabulary drift ≠ FAIL.** One artifact saying "case" where another says "incident" is an **AMEND** (category 3), not a FAIL — unless the term is explicitly forbidden by a sealed canon.
- **Contradiction resolution (category 2):** the newer artifact has temporal precedence but **not automatic correctness**; write a finding with both sides; the human authority decides which yields; **the loser is amended, not deleted.**

---

## §4 — Disposition: no audit is left idle

> **Every audit has a documented destination. If we will act on it, we document that. If we will not, we document that too. Nothing stays "acknowledged but idle."**

The failure this prevents: a finding flagged, then nobody acts, while the defect silently persists. (Real precedent: a finding sat "acknowledged" for two days while the broken path it named kept failing; a human caught it by instinct, not because the system forced it. This canon makes the instinct a rule.)

### §4.1 — Valid dispositions

Every audit delivery carries a `Disposition` section — one row per critical finding:

| Status | Meaning | Requires |
|--------|---------|----------|
| `FIXED` | Closed | link to PR/commit |
| `PARTIAL` | Partially closed | link + what remains |
| `OPEN` | Valid, pending work | owner + target date |
| `ACCEPTED_WITH_RISK` | Risk accepted on purpose | authority approval + review date |
| `WAIVED` | Rejected as a finding | authority approval + reason |
| `OBSOLETE` | The module changed; the finding no longer applies | reason |
| `UNVERIFIED_PENDING_REVIEW` | Triage backlog — valid but not verified yet | target date |

> **`UNVERIFIED_PENDING_REVIEW` is a legitimate disposition.** "I have not verified it; I will by {date}" is a valid answer. What is **not** valid is "I don't know and there is no plan."

### §4.2 — Self-describing, in place

The `Disposition` section is **appended to the same delivery artifact** — never a separate tracker. One read shows the finding and its current state. When a status changes, the row is updated in place with new evidence.

### §4.3 — Cadence (escalate on silence)

| Event | Window | Action |
|-------|--------|--------|
| New delivery | short | initial disposition added (at least `UNVERIFIED_PENDING_REVIEW` + target date) |
| No disposition after a grace window | — | escalate to the human authority |
| An audit request with no delivery in a grace window | — | triage decision (resend / close / waive) |
| `UNVERIFIED_PENDING_REVIEW` reaches its target date unclosed | — | escalate |
| `OPEN` with no progress over a long window | — | escalate |

The concrete window lengths, the escalation channel, and any automation are L3 concerns. Automation is **deferred until the manual triage is shown to be insufficient** — the rule seals first, the system later; if adding the disposition takes longer than a couple of minutes, simplify it (over-engineering boundary).

---

## §5 — Anti-patterns (forbidden)

- An "audit finding" header on an artifact with **no remediation date and no link** to a fix.
- A `TODO: see the audit` comment with no owner and no date.
- Merging a change that cites a finding without updating that finding's disposition.
- Creating an audit delivery with **no** disposition section.
- Closing a finding as `FIXED` with no link to the PR/commit.

---

## §6 — Front division (who audits what)

An audit names its **primary auditor** and an **independent second** (the one who builds does not grade — see `CANON-ARCHITECTURE-REVIEW §3.1`). The concrete auditor identities and the front split (canon / features / surfaces) are an L3 concern. **Overlap rule:** when a feature audit surfaces a canon issue (or vice versa), it is **written to the shared channel, not acted on unilaterally** — the front owner resolves.

---

## §7 — Relationship

- **`CANON-ARCHITECTURE-REVIEW`** — sibling. Review = verdict on architecture; audit = truthfulness of artifacts + disposition of findings. The review's classification taxonomy (gap / drift / contradiction) and this canon's verdict categories are adjacent lenses, not duplicates.
- **The findings discipline** of the development-process canon — every finding raised by an audit follows the same disposition lifecycle (§4).
- **`CANON-DEVELOPMENT-PROCESS §7`** — this canon was authored under the SOTA-informed gate.
