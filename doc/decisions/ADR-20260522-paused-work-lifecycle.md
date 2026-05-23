# ADR-20260522-paused-work-lifecycle

**Status:** ACCEPTED
**Date:** 2026-05-22
**Decider:** the architect

## Decision

Adopt a **paused-work lifecycle** discipline for work artifacts (worktrees,
branches, stashes). An artifact with **no open PR and no activity for N days** is
classified **paused**, and its owner must either declare it `paused-with-intent`
or release it. Released and owner-absent paused artifacts are reaped during a
periodic **agents-off cleanup window**, never mid-flight while owners are active.

## Why

Recurring accumulation of worktrees / branches / stashes is a **structural gap,
not negligence** by the human or the agents:

- **Active** work has a present owner.
- **Merged** work auto-cleans (merge + delete-branch-on-merge).
- **Paused** work falls into a limbo: the owner's session has ended, no PR exists
  yet, no other agent may touch it (ownership rule), and **no mechanism reaps
  it**. So it accumulates by default — and grows every time work is paused.

The discipline gap is therefore in the **rules** (a missing lifecycle for paused
work), which a tool and a cadence can close — not in the agents (they correctly
avoid touching others' work) nor in the human (cannot hand-track dozens of
artifacts).

## Alternatives rejected

- **"Agents should clean up more"** — rejected: agents correctly do **not** touch
  another owner's artifacts; blaming them doesn't dissolve the ownerless limbo.
- **"The human tracks and cleans"** — rejected: doesn't scale to dozens of
  artifacts; it's a heroic effort that re-degrades, not a discipline.
- **"Status quo / clean reactively when it hurts"** — rejected: that is exactly
  how the backlog forms. No lifecycle ⇒ guaranteed re-accumulation.

## Consequences

Three pieces are now required (each bound per repo):
1. a **paused TTL** convention (the N-days threshold + a `paused-with-intent`
   marker an owner can set);
2. a **mechanism** that flags idle artifacts (a hygiene classifier + an inertia
   TTL), surfacing them as reap candidates;
3. a **periodic agents-off cleanup window** as the safe execution moment.

"Perfect hygiene" becomes *maintainable* rather than a heroic, re-degrading
effort. Per-repo binding declares the TTL value, the classifier tool, and the
cadence.

## Evidence

A hygiene audit found a large worktree backlog dominated by **paused,
owner-absent** work. Git's own safety nets (`worktree remove` without `--force`,
`branch -d` not `-D`) **refused** to clean active/unmerged artifacts —
confirming that reactive cleanup cannot safely reach paused work while agents are
active, and that a dedicated agents-off window is the correct execution moment.
This ADR is also the first ADR in this repo, dogfooding
`CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING`.
