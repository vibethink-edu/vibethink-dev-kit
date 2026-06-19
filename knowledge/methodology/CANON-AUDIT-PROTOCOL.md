# CANON-AUDIT-PROTOCOL — How an audit judges and how it is disposed (universal · agent-agnostic)

> **Scope:** every repo that audits its own canon, features, or surfaces for truthfulness and follow-through.
> Vendor-neutral, product-neutral, tool-neutral.
> **Status:** SEALED 2026-06-05 by Marcelo (Principal Architect) — agnostic-lift seal sweep ("SEAL DALE"). Fire-test passed. **§8 (Verifier integrity) added + SEALED 2026-06-13 by Marcelo.**
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

---

## §8 — Verifier integrity: an automated gate must not lie either

> *(Amendment §8 — **SEALED 2026-06-13 by Marcelo** (Principal Architect), "dale". Drafted from a security-sweep precedent; §8.5.)*

> **§1 asks whether an *artifact* lies. This section extends the same question to the *verifier* itself.** An automated gate (linter, health check, scanner, CI rule) can read **GREEN while the very defect it exists to catch silently persists.** A green gate that is wrong is worse than no gate — it manufactures false confidence.

### §8.1 — Classify by the observed condition, never by a hand-maintained allowlist

A verifier must judge by the **real condition** (is this object exposed? owned by us or by a dependency? does it carry the risky property?), not by a list of exceptions. **Hand-maintained allowlists/exemptions are debt that drifts toward false-green:** the world changes, the list does not, and the items that most need flagging are exactly the ones a stale exemption hides.

- Prefer a *derived predicate* ("granted to the public role", "member of a dependency", "has the elevated attribute") over an enumerated exception set.
- If an exemption is unavoidable, it must be **narrow, dated, and justified in place** — and re-derived, not trusted indefinitely.

### §8.2 — Mirror the external source of truth

When an authoritative external check exists (a provider's security advisor, an official linter, a platform scanner), the home-grown verifier must **faithfully reproduce it**. Divergence between your verifier and the external authority is a **bug in your verifier**, not noise to ignore. The external check is a **first-class QA layer**, not optional.

### §8.3 — Severity by real risk, not a binary

Findings are graded by real exposure/impact, not flattened. The opposite of an exposure (a "deny-all" that blocks everyone) is **not** a leak; a best-practice gap is **not** a vulnerability. Marking safe-by-design states as critical produces a permanent red that trains everyone to ignore the gate ("cry wolf"); marking real leaks as low hides them. Reserve the top severity for the genuinely exploitable.

### §8.4 — Cadence must be self-triggered, not memory-dependent

A periodic verifier that relies on someone remembering to run it will lapse. It needs a trigger that does not depend on human memory — a **staleness check at session/CI start** ("last run was N days ago") is enough. The rule seals first; richer automation is an L3 concern (over-engineering boundary).

### §8.5 — Precedent

A health verifier guarded by two hand-maintained allowlists read **GREEN** while a control-plane object was world-writable through the data API. The allowlists hid exactly the most critical objects; a third narrow filter (elevated-privilege only) hid a large class of best-practice gaps and reported "0". The defect was caught by the **provider's external advisor**, not the project's own ritual — which had also lapsed (no run in ~2 months). Fix: every check rewritten to classify by observed exposure (§8.1), aligned to the external advisor (§8.2), graded by real risk (§8.3), and put on a self-triggered cadence (§8.4). The L3 incarnation lives in the consuming repo's DB-health canon.

### §8.6 — Declare the coverage surface: what is not scanned is un-looked-at, not green *(SEALED 2026-06-17 by the Principal Architect — "go"; from a consumer's identifier-language gate finding · PR #144 · D-012)*

§8.1 names false-green by a stale **exemption** — the gate looked, but an allowlist told it to ignore what it saw. This section names the sibling failure mode: false-green by **un-scanned surface** — the gate never looked at the place the defect lives, and its silence reads as a pass.

> **A gate declares the surface it covers. What it does not cover is not green — it is un-looked-at.** A green verdict means only "no defect in the surface I scanned"; it asserts nothing about surfaces outside that scan. Treating an un-scanned surface as clean manufactures the same false confidence as a stale allowlist (§8.1) — by omission instead of exemption.

- **A gate's coverage surface is explicit, not implied.** The gate (or its binding) states which inputs / paths / object-classes it scans, so a reader can tell a true "clean" from "never looked there."
- **When a defect class can appear on more than one surface, the gate is surface-complete or it declares the gap.** A gate that checks one surface of a multi-surface rule — and reports GREEN — is asserting a clean it did not verify. Either it covers every declared surface of the rule, or it names the un-covered surfaces as out of scope. Silence is not coverage.
- **A passing partial gate is a worse signal than a missing gate.** A missing gate invites a check; a green partial gate closes the question falsely (the §8 root reason).

This is the unifying lens behind several sibling failure modes the kit already names: a toolchain that never executed (`CANON-TESTING-MINIMUM-BAR-001` §6.1, *silent false green*); an integration self-test alive against the dev seed and dead against the deployed environment (`CANON-TESTING-MINIMUM-BAR-001` §6.2, *env-portable*); a naming gate green on the schema while another identifier surface drifts unscanned (`CANON-NAMING-CONVENTIONS-001` §8, *surface-complete*); a CI green on an isolated unit while the build of its real consumer — the layer that actually ships — is un-scanned (`CANON-TESTING-MINIMUM-BAR-001` §6.3, *exercise the consumer*). Each is a coverage gap that read as a pass. The concrete surfaces a given gate must cover are per-repo binding; the **declare-your-surface, partial-is-not-green** rule is universal.

### §8.7 — A gate is not "ready" until it fails on a known-bad input and blocks *(SEALED 2026-06-18 by the Principal Architect — "GO"; from a consumer's gate-merged-broken finding · D-027)*

§8.6 asks *what surface* a gate scans. This section asks a prior question: *does the gate actually work, and does it actually stop anything?* A gate can be added in good faith and be **inert in two ways** — it never goes red when it should, or it goes red but nothing is blocked — and in both cases it reads as protection while protecting nothing.

> **A gate is not "ready" until (a) it is demonstrated to FAIL on a known-bad input, and (b) it is required/blocking. An unproven gate or a non-blocking gate is false assurance — the §8 root failure (a verifier that lies), produced at install time instead of at runtime.**

- **(a) Prove it fails (falsifiability).** A gate never seen to go red on the exact defect it exists to catch has not been shown to catch it. Ship it with a **known-bad fixture** (a negative test) that the gate must reject; if the fixture passes, the gate is mis-wired. *(Prior art: "test the test" / mutation-style verification — a check you cannot make fail is not a check.)*
- **(b) Make it block (required).** A gate whose red verdict does not stop the merge is documentation, not enforcement. A defense-relevant gate is a **required/blocking status check**; an advisory-only gate must be labeled advisory so its green is never mistaken for a guarantee.
- **The gate is itself a unit that ships — so it is itself subject to the coverage rules.** A gate merged without (a)+(b) is the same false-green it was built to prevent, one level up (`CANON-TESTING-MINIMUM-BAR-001` §6.3 applies to the gate too).

**Precedent.** A consumer added a gate to stop a broken-merge pattern; the gate **merged broken** — a `typecheck` vs `type-check` typo so it never ran the real step — **and did not block** a PR because it was not marked required. The pattern it existed to catch slipped through anyway: a gate neither proven-to-fail nor blocking. The L3 incarnation (the wired CI job + its required flag) lives in the consuming repo.

**Instrument (policy without mechanism is illusion).** The kit ships `tools/check-gate-integrity.mjs` (template `setup/templates/gate-integrity/`) — *the gate that audits the gates* — enforcing the portable half **(a)**: every declared gate must ship a paired test with a known-bad case proving it goes RED; a gate with no test, or a happy-path-only test, is refused. It is itself a gate, so it audits itself; the kit dogfoods it. The non-portable half **(b)** — required/blocking — is per-repo, per-forge branch protection and is the consumer's L3 binding, not something a portable gate can read.
