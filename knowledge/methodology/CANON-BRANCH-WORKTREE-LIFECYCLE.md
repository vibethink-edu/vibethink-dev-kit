# CANON-BRANCH-WORKTREE-LIFECYCLE — Universal branch & worktree lifecycle mechanics

**Status:** SEALED 2026-06-05 by Marcelo (Principal Architect) — agnostic-lift A#8
**Date:** 2026-06-05
**Scope:** Every repo where one or more contributors — human or agent — create branches or worktrees. Cross-product (agnostic).
**Companion canons:** [`CANON-GIT-HYGIENE`](./CANON-GIT-HYGIENE.md) (session hygiene this spine does not restate) · [`CANON-MULTI-AGENT-ORCHESTRATION`](../ai-agents/CANON-MULTI-AGENT-ORCHESTRATION.md) (coordination + the exit-state vocabulary this spine's exit gate produces) · [`CANON-NAMING-CONVENTIONS-001`](./CANON-NAMING-CONVENTIONS-001.md) (the branch & worktree naming pattern this spine consumes, §3) · [`CANON-CODER-SAFE-IDENTITY-001`](../ai-agents/CANON-CODER-SAFE-IDENTITY-001.md) (binds a low-privilege executor identity to the worktree/worker lifecycle, §7).

---

## §1 — Principle

Every branch has a **birth and a death** — an entry gate and an exit gate. A branch or worktree that lingers without purpose is **invisible technical debt**. Workspace **isolation** is the mechanism (one task does not collide with another); lifecycle **discipline** is the rule (nothing is created without a gate, nothing is left without an exit).

> **A branch with no exit gate, or a worktree with no cleanup, is the failure mode this canon prevents** — the same way an unreviewed upstream or a dirty working floor is the failure mode of the companion canons.

This spine owns the **mechanics** that sit between **session hygiene** (`CANON-GIT-HYGIENE`) and **coordination/handoff** (`CANON-MULTI-AGENT-ORCHESTRATION`): the phase model, naming, worktree isolation, default-worktree read-only, and the spawned-worker lifecycle.

---

## §2 — Relationship to the companion spines (no duplication)

| Concern | Owner | This spine |
|---|---|---|
| Clean working floor, forbidden force-push / rebase-of-published / silent hook-bypass, *all changes via PR* | **`CANON-GIT-HYGIENE`** §2/§4/§7 | does **not** restate them; §8 lists only the *additional* lifecycle anti-patterns |
| Exit-state **vocabulary** (`PUSHED` / `READY-PR` / `DISCARDED`) + handoff completeness | **`CANON-MULTI-AGENT-ORCHESTRATION`** §2.2/§2.3 | the exit gate (§3) **produces** one of those states; it does **not** redefine them. A consuming repo may extend the set at L3 (e.g. `READY-MERGE` / `WIP` / `SUPERSEDED` / `BLOCKED`) |
| Branch & worktree **naming** pattern (`{author}/{type}-{slug}`, `wt-<feature>`) | **`CANON-NAMING-CONVENTIONS-001`** §3 | does **not** redefine it; §4 only points at it and notes *when* in the lifecycle the name is assigned |
| Branch + worktree **mechanics** (phases, isolation, cleanup, read-only default, worker lifecycle) | **this spine** | `CANON-MULTI-AGENT-ORCHESTRATION` §10.3 explicitly defers "the isolation rules" to L3 — this spine is the agnostic middle layer that L3 then binds |

---

## §3 — The branch lifecycle (phase model)

Every branch moves through the same phases. The **gates are mandatory**; the commands are L3 (the consuming repo names its VCS tooling).

```
Entry gate → Create → Work → Open PR → Checks → Merge → Exit gate
                                                          └→ Abort path (for abandoned work)
```

### §3.1 — Entry gate (before creating ANY branch)

| Check | Threshold |
|---|---|
| On the default branch | yes |
| Working tree clean | no uncommitted changes |
| Local branch count under the repo's threshold | below limit (signal of un-closed lifecycles) |
| Stash count zero | no stashes (stashes are invisible debt — §8) |
| No stuck rebase/merge in progress | none |

**If any check fails: fix it first. Do not create the branch.** (The hygiene preflight of `CANON-GIT-HYGIENE` §2.1 is the same gate from the hygiene side.)

### §3.2 — Create → Work → PR → Checks → Merge

- **Create** the branch **before editing any file** — never edit the default branch then stash/branch (§8).
- **Work:** small, frequent, descriptive commits; push **early and often** — do not accumulate local-only work. Hit a problem → fix it **in the same branch**, never a "rescue" branch (§8). Unfixable → take the abort path, then start fresh.
- **Open PR:** the change becomes visible and reviewable. *All changes merge through a PR* (`CANON-GIT-HYGIENE` §7).
- **Checks:** never merge with failing checks; fix → push → re-run.
- **Merge:** squash/merge per the repo's convention; deleting the remote branch on merge is the default.

### §3.3 — Exit gate (immediately after merge — MANDATORY)

| Step | Result |
|---|---|
| Remote branch deleted | confirmed (prune) |
| Local branch deleted | removed |
| Back on the default branch | yes |
| Merged changes pulled | up to date |
| Working tree clean | no uncommitted changes |
| Stash list empty | no stashes |

The exit gate **closes the lifecycle and emits an exit state** (`CANON-MULTI-AGENT-ORCHESTRATION` §2.2). **If any step fails, fix it before anything else.**

### §3.4 — Abort path (abandoned without merge)

Return to the default branch → force-delete the local branch → delete the remote branch if it was pushed → close the PR if one was opened. An aborted branch ends in the `DISCARDED` exit state — never silently left.

---

## §4 — Naming (pointer)

The branch pattern `{author}/{type}-{slug}` and the worktree pattern `wt-<feature>` are **owned by `CANON-NAMING-CONVENTIONS-001` §3** — this spine does not redefine them.

The lifecycle contribution is only **when** the name is assigned and **that it is never bare**: the branch is named at **Create** (§3.2), per NAMING-CONVENTIONS, **before** any file is edited. A bare branch name (`feature-x` with no `{author}/{type}` prefix) is a naming violation (NAMING-CONVENTIONS §8) *and* breaks the ownership signal the exit gate (§3.3) and the spawned-worker lifecycle (§7) depend on.

---

## §5 — Worktree isolation

A worktree is a parallel checkout. The discipline that keeps worktrees from becoming the collision/orphan source they were meant to prevent:

### §5.1 — Five principles

1. **The default (main) worktree is read-only** — see §6.
2. **Branches for ~90% of work.** A plain feature branch in the existing checkout is the default. (Hours-to-days work, normal features, fixes.)
3. **Worktrees only for special cases:** true parallelism (work on B while A runs), long-running work that would otherwise block, or side-by-side comparison of two states.
4. **Aggressive cleanup** (§5.4) — a worktree outlives its task by minutes, not weeks.
5. **No naked worktrees** — a checkout alone is not a ready workspace (§5.3).

### §5.2 — One task = one unique branch (collision-prevention)

- **Each task MUST have its own unique branch.** Before starting, confirm *which* branch this task uses.
- **Verify the branch does not already exist** before creating it.
- **Never reuse an existing branch** without explicit confirmation from the work's owner — silently reusing another contributor's branch is the canonical multi-agent collision.
- **Unique *and* fresh** *(reinforced 2026-06-18 — D-021)*. A worktree directory is keyed to **one** task by a unique id. If a name/dir **collides with a leftover** (a prior task's dir not cleaned per §5.4), **do not reuse the stale directory** — remove it and recreate **fresh from the current base**. A reused stale worktree silently serves **stale inputs** and blocks the worker (lived evidence: a `037b` launch colliding with a leftover `037` dir served old inputs → coder blocked). Uniqueness prevents the collision; freshness prevents the stale-input failure when one slips through.
- **That unique id is the FULL work-item slug — never a truncation** *(amended 2026-06-19 — D-041; the durable cure for the collision class above)*. The worktree's id **is the complete work-item slug / branch**, not a numeric or truncated prefix of it. A number or prefix is **not unique across concurrent fronts** → two different work-items resolve to the **same** isolation path and the second silently runs the wrong front (wrong spec, push to the wrong branch). **Reuse guard:** if the isolation unit already exists **on a different branch / work-item → ABORT** — never silently reuse (broader than the stale-leftover case above: the collision can be a *live other front*, not just an old dir). *(Lived: two fronts both numbered `045`; a launcher keying the worktree on the leading numeric token mapped both to one dir. This is the **2nd of the class** — the 1st (`037b`→`037`) was patched by changing the truncation, but **keeping a truncation as the key let the class survive**. Stop using any truncation as identity.)* **Numbering hygiene (L3)** *(sharpened 2026-06-19 — D-043)*: sequential numbers are **not concurrency-safe**. Re-verifying the "next free id" at dispatch (over **all** id-bearing artifacts: specs + prompts/launch-kit) **narrows but does NOT close** the concurrent-claim race — two parallel architects can both read the same max and both pick the next number. Per the slug-identity rule above, **the number is a non-authoritative label**: its collision is **cosmetic** (the slug-keyed worktrees/branches do **not** collide), not a fatal error. If genuinely-unique numbers are required, **only an atomic claim registry** provides them (L3, optional — the slug already prevents the fatal collision, so a number registry is a *human-legibility* nicety, not a correctness need).

### §5.3 — Placement & readiness

- **Placement:** worktrees live **outside the repo tree** — never as a **sibling** of the repo root, never **nested inside** it (both pollute discovery and risk recursive tooling). The consuming repo names its worktree root convention at L3.
- **Readiness:** a worktree is **operationally valid only when** its environment files, the secrets its governed flows need, and its dependencies have been hydrated to match — so the operator can actually run or validate the target without setup drift. **Do not call a worktree "ready" if it is just a checkout.**

### §5.4 — Cleanup

- **Remove the worktree immediately after merge** (the same moment as the branch exit gate, §3.3).
- **Delete the branch** after its PR merges.
- **Periodic audit** for abandoned worktrees; flag any older than the repo's age threshold for review.
- **Squash-merge blindspot (MANDATORY for any squash-merge repo):** when the merge convention is **squash** (§4), the merged commits are replaced by a **single new-hash commit** on the integration branch. The branch's original commits are therefore **never ancestors** of the integration branch, so `git branch --merged` (and any cleanup tool built on it) reports them as **un-merged forever** — local branches pile up unbounded even though their work shipped. Detection of "already merged" **must be squash-aware**: either (a) **patch-equivalence** — synthesize a commit with the branch's tree on top of its merge-base and test `git cherry <main>` (forge-agnostic, no network), or (b) **consult the forge** by head-ref for a merged PR. Never rely on `git branch --merged` alone as the delete criterion. *(Reference implementation: the session-hygiene scanner's `findSquashMergedBranches`.)*
- **Symlink/junction remove-blindspot (PROPOSED 2026-06-24 — pending Marcelo seal):** when a worktree's dependency dir (e.g. `node_modules`) is a **junction/symlink** to a shared store (a common Windows/monorepo setup), `git worktree remove` can **fail** (dir "locked"/"not empty") or — worse — **follow the reparse point and delete the shared target**. The operator then skips/aborts the remove, or prunes only the **registry** (`git worktree prune`) while the **physical directory survives** → an **unregistered physical orphan** that no `git worktree list`-based scanner can see. Two requirements follow: (a) **unlink the junction first** (`rmdir`/remove the reparse point — never `rm -rf` *through* it, which destroys the link target), then remove the worktree; (b) the **periodic audit (above) MUST also scan the physical worktree-root directory**, not only `git worktree list`, flagging any dir matching the worktree-name pattern with **no registered worktree**. Registry-based detection alone is blind to this class.

---

## §6 — Default-worktree read-only enforcement

The **default (main) worktree is read-only**: it permits only **git sync** and a **create-only communication lane** (the append-only shared mailbox, whose governed tool runs its own gates — consistent with `CANON-GIT-HYGIENE` §7's comm-lane exception). **All other work happens in a feature branch/worktree.**

- Enforced by a **pre-commit hook mechanism** that blocks commits in the default worktree outside the allowed lane.
- An **emergency override** exists but **must document its reason** in the commit (consistent with `CANON-GIT-HYGIENE` §2.4 — no silent bypass).

The hook path, the exact allowlist, and the comms-lane location are **L3 binding**.

---

## §7 — Spawned-worker (subagent / parallel) lifecycle

Worktree isolation does **not** exempt a spawned worker from the lifecycle.

1. **One branch per worker** — two workers never share a branch (race conditions, lost work).
2. **The parent owns the worker's exit gate** — the parent runs §3.3 for every branch/worktree a worker touched; the parent never ends its session with a worker's worktree still active.
3. **The parent tracks every worker branch/worktree** — a worker never creates a branch the parent does not know about (the parent cannot clean up what it cannot see).

This is the workspace-mechanics counterpart to `CANON-MULTI-AGENT-ORCHESTRATION`'s ownership and closeout rules.

---

## §8 — Prohibited patterns (additional to `CANON-GIT-HYGIENE` §4)

`CANON-GIT-HYGIENE` §4 already forbids force-pushing the default branch, rebasing published commits, and silent hook-bypass. This spine adds the **lifecycle-specific** anti-patterns:

| Pattern | Instead |
|---|---|
| Editing files on the default branch | Branch first, edit second |
| Creating "rescue" branches | Fix in the same branch, or abort cleanly |
| Leaving work local-only (no push) | Push early and often |
| Ending a session without the exit gate | Always run §3.3 for every branch touched |
| Accumulating branches past the threshold | Close lifecycles before opening new ones |
| Leaving a rebase/merge mid-flight | Complete or abort immediately (it blocks everyone) |
| Stashing as a workflow | Commit to a branch instead (stashes are invisible) |
| Two workers sharing one branch | One branch per worker, always |
| A parent ending with active worker worktrees | Run the exit gate for every worker worktree |
| A worktree as a repo sibling, nested, or "naked" | Outside the tree + hydrated before use (§5.3) |

---

## §9 — L3 binding (what the consuming repo owns)

- The concrete **VCS commands** (branch / push / PR / merge tooling and flags).
- The **thresholds** — local-branch count (§3.1), worktree age (§5.4).
- The **worktree root path convention** (§5.3) and the **comms-lane path** (§6).
- The **pre-commit hook** path + allowlist (§6) and any **coordination-file** mechanism for announcing protocol changes.
- The **environment-parity** doc the readiness rule (§5.3) points at.
- **Incident records** and **worked examples** (evidence of what went wrong before the discipline existed).

The L3 binding **points at this canon as the spine**; it does not re-write the phase model, the naming shape, or the isolation principles. If it repeats them, it drifts.

---

## §10 — What this canon does NOT do

- It does **NOT** prescribe the VCS tooling or exact commands — the consuming repo picks them (§9).
- It does **NOT** own **session hygiene** (clean floor, force-push/rebase/bypass bans, all-via-PR) — that is `CANON-GIT-HYGIENE`.
- It does **NOT** own the **exit-state vocabulary** or **handoff completeness** — that is `CANON-MULTI-AGENT-ORCHESTRATION` §2.2/§2.3; the exit gate here only *produces* an exit state.
- It does **NOT** define the **naming pattern** for branches/worktrees — that is `CANON-NAMING-CONVENTIONS-001` §3; §4 only consumes it.
- It does **NOT** define the **comms-lane** format — only that a create-only lane is the one write the read-only default worktree permits.

---

## Provenance

Lifted from a **sibling pair** of product-side canons whose agnostic substance was buried under product-specific binding:
- A product-side `CANON-BRANCH-LIFECYCLE-001` (SEALED 2026-03-21) — the phase model, the entry/exit gates, the prohibited patterns, the spawned-worker lifecycle.
- A product-side `CANON-WORKTREE-PROTOCOL-001` (SEALED 2026-02-21) — workspace isolation, one-task-one-unique-branch, placement, readiness, cleanup, the read-only default worktree.

**Coverage-check (agnostic-lift A#8):** `CANON-GIT-HYGIENE` covered session hygiene and PR governance; `CANON-MULTI-AGENT-ORCHESTRATION` covered coordination, exit-state vocabulary, and handoff; `CANON-NAMING-CONVENTIONS-001` §3 already owned the **branch & worktree naming pattern** (so this spine references it, §4, rather than re-lifting it) — but the **branch+worktree lifecycle mechanics** (the layer §10.3 of the orchestration spine explicitly defers to L3) had **no agnostic home**. This spine fills that gap and references the two companions rather than duplicating them. The two product-side canons restructure to thin L3 bindings that point here and keep only product-specific content (concrete paths, package-manager commands, the pre-commit hook implementation, the coordination file, env-parity doc, incident records, worked examples).

**SEALED 2026-06-05 by Marcelo** (Rule #4 — Principal Architect approval given).

**Amendment 2026-06-06 — SEALED by Marcelo:** §5.4 gained the **squash-merge blindspot** rule + the two squash-aware detection strategies (patch-equivalence / forge query; reference impl `findSquashMergedBranches` in the session-hygiene scanner). Additive — no normative substance removed. Surfaced by a consumer's hygiene root-cause diagnosis (`git branch --merged` was blind to 158 of 218 squash-merged local branches; 218→68 swept).

**Amendment 2026-06-24 — PROPOSED (pending Marcelo seal):** §5.4 gains the **symlink/junction remove-blindspot** + a **physical-orphan audit** requirement (the periodic audit must scan the worktree-root *directory*, not only `git worktree list`). Additive — no normative substance removed. Surfaced by a consumer's (ViTo) worktree-sprawl diagnosis: 48 `vito-wt-*` dirs = 16 live + 4 registered orphans (remote branch deleted on merge, worktree never removed) + **28 physical orphans with no registered worktree** — invisible to the registry-based scanner; root cause traced to `node_modules`-as-junction blocking `git worktree remove`, so the registry was pruned while the physical dir survived. The reference scanner (`session-hygiene-scan.mjs`) and any L3 hygiene gate need the physical-dir scan to detect this class. **NOT YET SEALED — drafted by claude (vito-architect) under Marcelo's directive; awaiting Marcelo's Rule #4 seal.**
