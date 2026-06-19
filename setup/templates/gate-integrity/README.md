# Gate-integrity instrument — CANON-AUDIT-PROTOCOL §8.7

The gate that audits the gates. §8.7 says a gate is not "ready" until **(a)** it is
demonstrated to FAIL on a known-bad input, and **(b)** it is required/blocking. This
instrument enforces the **portable half, (a)**: every gate you ship must have a paired
test that proves it goes RED. A gate whose test only checks the happy path has never
been shown to catch what it exists to catch — it is **false assurance** (a green that
lies, the §8 root failure, produced at install time).

> **Why it matters now:** the consumer of a gate's verdict is increasingly an autonomous
> agent that acts on the green without a human's instinct to override it. A lying gate is
> a corrupted sensor in an automated loop. §8.7 keeps the sensor honest.

## Files

| File | Role |
|---|---|
| `gate-integrity.config.json` (this template) | The **per-repo binding** — copy to `tools/gate-integrity.config.json`; declares where your gates live and how to find their tests. |
| `tools/check-gate-integrity.mjs` (in the kit) | The **gate** — refuses any gate with no test, or a happy-path-only test. It is itself a gate, so it audits itself. |

## Adopt in two steps

1. **Copy the binding.** `gate-integrity.config.json` → `tools/gate-integrity.config.json`.
   Point `auditDir` + `gatePattern` at your own gates (default: `tools/check-*.mjs`).
   Omit the file entirely for a conscious N-A (the board reports the skip, never silent).
2. **Run it.** `node <kit>/tools/check-gate-integrity.mjs tools/gate-integrity.config.json`
   — or just `devkit-doctor`, where it appears as the **gate integrity** line.

## What counts as a "known-bad case"

The paired test must assert, in at least one case, that the gate **fails** — a non-zero
exit, a failing verdict string, a non-empty error collection, or a test labelled as a
negative path. If a genuine negative test is not detected, **normalise it to a
recognised idiom** — never allowlist it (`CANON-AUDIT-PROTOCOL` §8.1).

## The (b) half is yours

This gate cannot read your forge's branch protection — that is per-repo, per-forge L3.
Making each gate **required/blocking** so its red verdict actually stops a merge is your
binding to complete. A proven-but-non-blocking gate is documentation, not enforcement.
