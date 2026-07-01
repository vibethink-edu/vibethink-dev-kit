# PROPOSED — CANON-GIT-HYGIENE amendment: actionable close-out + hook layering + tool freshness

**From:** Principal Architect (dev-kit owner)
**To:** the named authority (chief architect) — for seal
**Date:** 2026-07-01
**Status:** **PROPOSED** — drafted, NOT applied. The canon file is untouched until sealed. Triggered by a Campus field review of the dev-kit hygiene hooks.

Two code findings from the same review were already executed (dev-kit `master` `cb59112`): #1 precise "no mutation" wording + #2 `local-only` branch detection in `session-hygiene-scan.mjs`. The findings below are canon/doc-level, so they wait for the seal.

The insertable text is **L1-neutral** (no product/command names — those stay L3). Add three subsections to `CANON-GIT-HYGIENE` §2.

---

## §2.6 — Actionable close-out (every hygiene report/gate ends with a next step)

Every hygiene mechanism — a preflight gate, a session scan, a freshness nudge — **MUST** close its output with an **actionable recommendation**, not just a diagnosis. The recommendation carries three things:

- the **next step** — the concrete command or action to take;
- whether it **blocks or only warns** — a gate that bites vs an advisory;
- the **disposition** — proceed / clean / separate scope / hand off / run health / pause.

A report that only states "the tree is dirty" forces the reader to rediscover the remedy every time; one that says "not clean → run *<the repo's scope-split command>*, then *<its pre-commit command>*" is self-completing. **The specific commands are L3** (§6): the kit ships the requirement and a slot; the consuming repo injects its own command names. Same shape as the readiness checks elsewhere in the spine — *report + recommend*, never a bare flag.

## §2.7 — Hook layering: L1-generic vs L3-example

Commit/checkout hooks fall in two classes, and a binding **MUST NOT** present an L3 hook as if it were universal:

- **L1-generic** (inheritable as-is): commit-message linting (conventional-commit shape), the dirty-start preflight (§2.1), LF normalization (§2.2), the no-root-write floor (§2.5).
- **L3-example** (product-specific — shown as examples, NOT universal): agent-context validation config, i18n / hardcoded-string scans, product schema checks, framework-specific gates. These are legitimate and encouraged **as the consuming repo's own binding**, but the kit documents them as *examples of an L3 hook*, not part of the universal set.

The L3 binding (§6) declares which hooks it runs and labels each **L1-generic** or **L3-local**.

## §2.8 — Operator-tool freshness: nudge, don't auto-rebuild

Operator tools that maintain a derived index (code graph, search index, knowledge index) go stale and need refreshing — but the refresh **MUST NOT** be an **expensive, silent, automatic rebuild** triggered by a routine git event (e.g. a full-repo graph rebuild on every `post-checkout`). The recommended pattern is a **SessionStart nudge**: non-blocking, exit 0, that reports "index N days stale / tool missing" and **recommends the concrete scoped command** (§2.6), leaving the rebuild to the operator. If a repo does wire an automatic refresh, it **MUST** (a) be scoped/incremental, not a full rebuild, and (b) emit an explicit message stating it is running, its expected cost, and how to disable it. Silent expensive background work on checkout burns CPU and confuses.

---

## Amendment-log entry (to add on seal)

> **Amendment 2026-07-01 (PROPOSED → sealed by the named authority):** §2.6 (actionable close-out — every hygiene report/gate ends with next-step + blocks-or-warns + disposition; commands are L3), §2.7 (hook layering — L1-generic vs L3-example; a binding must not sell an L3 hook as universal), §2.8 (operator-tool freshness — SessionStart nudge over expensive silent auto-rebuild). Triggered by a Campus field review of the inherited hygiene hooks. Two companion code findings (precise no-mutation wording; local-only branch detection) landed in `tools/session-hygiene-scan.mjs` (`cb59112`).

## Findings disposition (for the record)

| # | Finding | Disposition |
|---|---|---|
| 1 | "never mutates" imprecise (commit-tree) | **DONE** (`cb59112`) — wording fixed; approach kept. |
| 2 | local-only branch under-detected as clean | **DONE** (`cb59112`) — new `local-only` WARN kind + test. |
| 3 | preflight should suggest next command | **PROPOSED** §2.6 — principle L1, command L3 (slot). |
| 4 | document L1-generic vs L3-example hooks | **PROPOSED** §2.7. |
| 5 | graphify post-commit incremental — keep | **ACCEPTED** (no change; validated). |
| 6 | graphify post-checkout may be expensive | **PROPOSED** §2.8 (nudge, not auto-rebuild). |
| 7 | promote staleness/tools-health as nudge pattern | **PROPOSED** §2.8 (pattern promoted). |

**On seal:** apply §2.6–§2.8 + the amendment-log entry to `CANON-GIT-HYGIENE`. Until then, heirs may adopt the two shipped code fixes; the canon principle is not yet binding.
