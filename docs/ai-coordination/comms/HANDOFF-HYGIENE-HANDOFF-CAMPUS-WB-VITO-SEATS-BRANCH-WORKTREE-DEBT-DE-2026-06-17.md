---
type: handoff
from: claude
to_agent: human
to: human
repo: vibethink-dev-kit
status: open
needs: human
priority: normal
date: 2026-06-17
re: hygiene handoff — Campus/WB/ViTo seats (branch+worktree debt; dev-kit clean)
---
# Hygiene handoff — the 3 product seats (Campus · WorkBench · ViTo)

The dev-kit (supra) is clean: 0 debris, 6/6 green. A scan of the **consumer repos** surfaced
accumulated branch/worktree debt. Per the ownership law (`CANON-BRANCH-WORKTREE-LIFECYCLE`
§ owner-only / ViTo Rule #16), the dev-kit seat does **not** clean other carriles — each
seat owns its cleanup. Below: per-repo metrics + the recommended action. **Owner-aware:**
never blind-delete — classify first (merged → delete · active worktree → keep · ambiguous → ask).

## Scan (2026-06-17)

| Repo | Remote branches (no main/master/gh-pages) | Open PRs | Worktrees in `C:/tmp` | Stashes |
|---|---|---|---|---|
| **Campus** | 5 | 1 | **15** | 0 |
| **WorkBench** | 25 | (check) | 8 | 0 |
| **ViTo** | **25** | (check) | **42** ⚠️ | 0 |

The worktree counts are the loud signal — **ViTo's 42** and Campus's 15 are almost
certainly mostly stale (abandoned coder sessions in `C:/tmp`).

## Per-seat action (each seat runs its own hygiene gate)

### → ViTo seat (the priority — 42 worktrees + 25 branches)
1. `pwsh scripts/git-hygiene.ps1` — get the classified table (ACTIVE / SAFE / AMBIGUOUS).
2. **Prune stale worktrees:** for each `C:/tmp/vito-wt-*` with no active work → `git worktree remove`. 42 is far past healthy.
3. **Branches without an open PR:** classify — merged (squash) → delete local+remote; unmerged-unique → keep or PR; ambiguous → ask Marcelo.
4. `delete_branch_on_merge` ON (so future merges self-clean).

### → WorkBench seat (25 branches + 8 worktrees)
1. Run WB's hygiene scan (`pnpm hygiene:worktrees` / `session:hygiene`).
2. Same drill: prune stale `C:/tmp` worktrees; delete merged remote branches; keep/flag the rest.
3. Note: WB PR #337 (composer, 2026-06-02) is an old open PR — triage it.

### → Campus seat (5 branches + 15 worktrees + 1 open PR)
1. `tools/session-hygiene-scan.mjs` (already wired at SessionStart/End).
2. Prune the 15 `C:/tmp/vito-wt-campus-*` worktrees that are stale.
3. Campus PR #34 (cloudrun, 2026-06-15) is open — decide merge or close.

## Method (the safe sweep, for any seat)
- Local branch whose **remote is gone** = merged+cleaned → safe `git branch -D`.
- Remote branch **with a merged PR** → safe `git push origin --delete`.
- Remote branch **with no PR** → do NOT assume; check content-vs-main (a renamed/superseded dup → delete; unique work → PR or flag).
- Worktree with **no active/uncommitted work** → `git worktree remove`; otherwise leave + declare its state.
- **Another agent's branch/worktree** (e.g. `codex/*`) → never touch; flag to its owner.
