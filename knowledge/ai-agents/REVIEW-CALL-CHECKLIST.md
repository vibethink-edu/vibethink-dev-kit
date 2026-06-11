# Review-Call Checklist — what an advisor architect validates (universal · agent-agnostic)

> **Scope:** every repo that inherits this kit. Vendor-neutral, product-neutral,
> tool-neutral.
> **Status:** process protocol (operational instrument), not canon-sealed — same
> tier as `REVIEW-READINESS-PROTOCOL.md`; it grows as new failure modes are found.
> **Home:** the dev-kit (supra-repo) — a single governance control point. Inherited
> by every repo as upstream → fork, so any repo adopts it verbatim.
> **Sibling:** `CANON-MULTI-AGENT-ORCHESTRATION.md` §6 (red-gate discipline) states
> the principle; this is the living, operational instrument that grows as new
> failure modes are found.

## What a "review call" is

When work is handed to a second architect (the **advisor**) for review before it is
sealed, the advisor's job is **not** to re-read the author's summary and agree. It
is to **validate what the author can prove, not what the author asserts** — against
real data, with negative cases, distinguishing *"passes today"* from *"correct by
design"*.

The advisor returns one of two verdicts, each with evidence:

- **GO** — every applicable control below was checked, with the evidence the advisor
  actually ran (not the author's claim).
- **BLOCKED** — at least one control failed; the advisor names the specific control,
  the file/line, and the reproduction. Never an unread green.

## The controls

| # | Control | What the advisor proves (not assumes) |
|---|---------|----------------------------------------|
| 1 | **Reality over fixtures** | The change is exercised against the **real corpus / production data**, not only synthetic fixtures. A passing test suite is not evidence the thing works on real input. → Run it against the real data; show the output/counts. |
| 2 | **Recall *and* precision** | An improved metric proves the change finds *more* (recall). The advisor also checks it finds *only* what it should — no false positives, no mis-routing (precision). → Audit **both directions** on real data. |
| 3 | **Correct by design, not by luck** | Passing on today's data ≠ correct. The advisor probes adversarial / edge inputs that today's data happens not to contain. → A test for the failure current data would never trigger. |
| 4 | **Gates must bite (negative test)** | A green gate is meaningless until shown to go **red** on bad input. → Feed it a known-bad case; show the RED *and* the precise failure it names. |
| 5 | **Boundaries grepped, not asserted** | Anything claiming neutrality, isolation, a size budget, or "no X" is verified **mechanically**, not on the author's word. → Show the fire-test / grep / size-check output. |
| 6 | **Internal consistency** | A doc / contract does not contradict its own amendments, and every dependent that cites it is updated in lockstep. → Cross-check the doc **plus** everything that references it. |
| 7 | **Claim = mechanism strength** | The stated guarantee equals what the mechanism actually does. No overselling ("secure", "complete", "no secrets") beyond the real scope. → Name the mechanism's real reach. |
| 8 | **Design scales** | The approach holds across N repos / cases **without copy-drift** or per-instance maintenance. → Show the inheritance / DRY path, not just the one-off that works. |
| 9 | **Enforcement, not authorship** | The norm **bites automatically** (CI / hook) — otherwise it is "written but not biting". → Point to the automated gate that runs without a human triggering it. |
| 10 | **Honest close** | *Done / not-done / backlog-vs-blocker* declared explicitly; residual risk is on the table, not hidden. → The author's own close statement lists what is **not** covered. |

## The throughline

> The advisor validates what can be **proven against reality**, with **negative
> cases**, distinguishing **"passes today" from "correct by design"**. That is what
> catches the false-greens a green test suite hides.

## Per-repo binding

The discipline is universal; the concrete corpus, tools, and gates are per-repo.
A repo declares: which real data control #1 runs against, which command is the
negative test for #4, and which CI workflow satisfies #9. The controls never change.

## Provenance

Distilled from this kit's **first empirical second-architect review** (2026-05-22),
which found real false-greens behind a green test suite. The worked example —
the findings, the per-control fixes, and the re-verification — is preserved in:

- `doc/REVIEW-FINDINGS-2026-05-22.md` (the advisor's findings)
- `doc/REVIEW-RESPONSE-2026-05-22.md` (the per-control resolution + evidence)

New failure modes append a row here; the canon principle (§6) stays stable.
