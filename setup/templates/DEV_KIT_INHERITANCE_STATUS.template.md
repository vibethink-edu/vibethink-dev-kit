# Dev-Kit inheritance status — {your repo name}

> **What this is.** This repo's living declaration of how it inherits the
> agnostic governance pieces catalogued by the dev-kit's
> `setup/ADOPT-DEV-KIT.md` (31 pieces: #1–#30 with the #10a/#10b split).
> Update a row when adoption status changes, when the kit publishes a new
> piece, or when a drift is detected and resolved.
>
> **How to use this template:** copy it into your repo (suggested path:
> `docs/DEV_KIT_INHERITANCE_STATUS.md`), replace `{your repo name}`, and flip
> rows as you adopt. Every row must hold one of the strict statuses below —
> `PENDING` and `N-A(reason)` are honest answers; a vague "ADOPTED" with no
> mechanism is not. The contract governs:
> `setup/INHERITANCE-CONTRACT.md` (dev-kit).
>
> **Strict status vocabulary** (a claims validator can enforce it — see the
> reference implementation referenced by contract §2):
> - `WIRED-CI(file:job)` — a CI workflow blocks PRs mechanically.
> - `WIRED-HOOK(file:hook)` — a git/harness hook enforces it.
> - `WIRED-SCRIPT(file)` — an advisory script exists, no PR gate.
> - `DECLARED-ONLY(file)` — adopted by documented discipline, no mechanism yet.
> - `ADOPTED-NATIVE` — satisfied by this repo's own equivalent; **name it** in
>   the Notes column.
> - `PENDING` — recognised, not yet wired.
> - `N-A(reason)` — does not apply; the reason travels with the claim.

## Per-piece adoption table

| # | Piece | Status | Evidence / Notes |
|---|---|---|---|
| 1 | Universal root authority | PENDING | |
| 2 | Cross-agent layering + smoke | PENDING | |
| 3 | Multi-agent orchestration (inbox/feed/compass) | PENDING | |
| 4 | Session closeout + hygiene scan | PENDING | |
| 5 | Decision disposition (ADRs) | PENDING | |
| 6 | Decision capture trigger | PENDING | |
| 7 | Paused work lifecycle | PENDING | |
| 8 | Governed agent task dispatch | PENDING | |
| 9 | Review-call checklist | PENDING | |
| 10a | Development process (L1, neutral skeleton) | PENDING | |
| 10b | House methodology (L2 binding) | PENDING | non-house repos: declare `N-A(not a house repo)` and name your #10a native binding |
| 11 | Port assignment scheme | PENDING | |
| 12 | Agent-hook engines | PENDING | |
| 13 | Naming conventions | PENDING | |
| 14 | Visual bug triage | PENDING | |
| 15 | Testing minimum bar | PENDING | |
| 16 | Versioning | PENDING | |
| 17 | Agent ↔ human collaboration | PENDING | |
| 18 | Scope discipline | PENDING | |
| 19 | Skills over roles | PENDING | |
| 20 | Context hygiene | PENDING | |
| 21 | Pre-production (DEV-MODE) discipline | PENDING | |
| 22 | Git hygiene | PENDING | |
| 23 | Branch & worktree lifecycle | PENDING | |
| 24 | Architecture review | PENDING | |
| 25 | Audit protocol | PENDING | |
| 26 | Testing gate | PENDING | |
| 27 | E2E test-user discipline | PENDING | |
| 28 | Gap report | PENDING | |
| 29 | Upstream protocol | PENDING | |
| 30 | Production safety | PENDING | |
| 31 | Copy-parity check | PENDING | repos with zero copied runnables: declare `N-A(no copies)` |

## Overrides

<!-- Per the inheritance contract §4: one entry per deviation, each naming the
     spine + section overridden, the local replacement rule, the reason, and
     whether it is temporary (with a target close date) or permanent. Each
     override is also sent as a finding to the kit maintainer. Delete this
     comment when you add your first entry; an empty section means "no
     deviations". -->

*(none)*

## Drift findings

<!-- When a drift between this repo and the kit is detected: add a D-NN entry
     here (what drifted, severity, action) and raise it through your
     coordination channel. -->

*(none)*

## Changelog

- **{YYYY-MM-DD}** — initial walk from the template; all pieces `PENDING`.
