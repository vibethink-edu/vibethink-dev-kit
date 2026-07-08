# CANON-BRANCH-WORKTREE-LIFECYCLE — Universal branch & worktree lifecycle mechanics

**Status:** SEALED 2026-06-05 by the Principal Architect — agnostic-lift A#8
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
- **Physical-orphan blindspot (SEALED 2026-06-29 by the Principal Architect):** a worktree-root directory accumulates **physical dirs that match the worktree name pattern but have NO registered worktree AND no valid `.git`** — invisible to **both** `git worktree list` **and** `git worktree prune` (prune only reclaims *registered* worktrees whose dir vanished; it never touches a stray dir). These arise when a removal/cleanup **fails partway** (Windows file locks on a large `node_modules` mid-delete leave a partial dir with `.git` already gone), or from worktrees of a **prior repo clone**. Requirement: the **periodic audit (above) MUST scan the physical worktree-root directory** — not only `git worktree list`/`prune` — flagging any dir matching the worktree-name pattern with **no registered worktree**, and treating a missing/invalid `.git` as a stray candidate for review. Registry-based detection is structurally blind to this class. *(Mechanism note: an early hypothesis blamed `node_modules`-as-junction blocking removal; direct validation on this consumer **refuted** that — the dirs hold real `node_modules` and lack `.git` entirely — so the audit requirement stands independent of any one root cause.)*

- **Interrupted-create heal — `locked` in a create-time state (Amendment 2026-07-05):** an interrupted `worktree add` (crash, runner timeout, a double-dispatch collision on the same slot) can leave a worktree **registered but `locked`** with an auto-set reason such as `initializing` — a half-created state a later launch neither detects nor recovers, and which can **block a new task keyed to that slot**. Requirement: the **periodic audit (and a launcher's entry check) MUST detect a worktree locked in a create-time state and treat it as a heal candidate** — unlock → remove → recreate **fresh** from the current base (per the freshness rule §5.2/§5.3) — **not** as a live worktree to preserve. Distinct from the physical-orphan class (that is dirs with no registered worktree; this is a *registered* worktree stuck mid-create).

- **Removal must not run under timeout pressure (Amendment 2026-07-05):** on a checkout with a large hydrated dependency tree, `git worktree remove` can take minutes; run inside a **time-boxed session/runner step it is killed partway** → exactly the partial-dir-without-`.git` the physical-orphan blindspot describes. Portable rule: **run worktree removal detached / in the background, never on a step that can time out mid-delete.** This is *prevention* of the orphan class — the complement to the *detection* the physical-orphan audit requires.

- **Quarantine-before-purge — the governed deletion arm (Amendment 2026-07-05):** detection without a governed executor lets orphans accumulate structurally — and a runtime policy floor that (correctly) **denies recursive delete to automated workers** means the arm **cannot** be a blind `rm -rf`. The safe, governed path is **move, not destroy**: relocate a verified orphan to a dated quarantine (`_orphans-quarantine-<date>/`) — **reversible, instant, and permitted by a destruction-denying policy floor precisely because a move is not a delete** — then let a human purge the quarantine days later. Two properties are **required before any move**: (a) **merged-per-item verification** — the item's PR is merged, or its tip is contained in the integration branch (squash-aware, per the blindspot above); anything not verifiable **protects itself** (left in place, flagged, never moved on assumption); (b) a **failed move is a signal, not an error to suppress** — a dir that will not move is holding an open handle (a live session), and the move-failure *correctly protects it*. The ritual — scan → classify (`SAFE`/`ACTIVE`/`AMBIGUOUS`) → **single batch human confirmation** → move — is the governed complement to the per-session exit states (`CANON-MULTI-AGENT-ORCHESTRATION §2.2`): those are the mechanism whose **failure** this harvest reclaims. *(The executor is **L3** — moving directories is OS/consumer-specific and safety-sensitive; this canon prescribes the pattern, the consuming repo binds the script. Reference-implementation shape: the session-hygiene scanner detects; an L3 harvest tool moves.)*

- **Lock-aware removal — release the lock, don't fight it, and never leave the tree loose (Amendment 2026-07-08):** distinct from the timeout rule above (a *slow* remove killed mid-flight), `git worktree remove` can **fail outright** when the tree holds an OS-level file lock — an open dev-server handle, a framework build-output dir, an editor with the tree open, a hydrated dependency store. This is a live-handle condition, not a git fault; fighting it with `--force` retries risks a partial delete (the physical-orphan class). Portable rule: **before the remove, release the known lock-holders** — stop the worktree's own dev servers and close the handles the launch surface opened — then remove; **retry with backoff** on a transient lock. The detached/background remove (per the timeout rule above) is **supervised**: the session or launcher that dispatched it observes its exit and owns the retry and any deferral — a fire-and-forget remove that can fail unobserved recreates the loose tree this rule forbids. If the lock **persists**, do not force it — **attribute the lock first:** if the holder is not the worktree's own launch surface (an unknown or foreign session), do **NOT** move the tree — a persistent foreign lock is a live session and protects the tree (per the quarantine's failed-move rule). Otherwise defer the tree to quarantine, but **unlink its junctions/reparse-points *before* the move** so it enters quarantine **link-inert** (the junction is rarely the open handle, so unlinking usually succeeds even on a locked tree), and the move MUST be an **atomic same-volume rename that fails cleanly** — never a copy-then-delete, which can split a locked tree across two paths. **Terminal safe state, when the remove and the move both fail or the move is forbidden: registered + flagged** — leave the worktree **registered** (never deregister, `--force`, or prune it away; registration is what keeps it audit-visible), mark it (e.g. `git worktree lock` with a dated reason), and the **periodic audit owns its disposition**. *"Never left loose" means never unregistered-and-unflagged — not "moved at any cost".*
- **Junction-safe deletion — a recursive delete MUST NOT escape the object being deleted (Amendment 2026-07-08):** a worktree can contain a **junction / symlink / reparse-point** — most commonly a `node_modules` junction pointing at a **shared** store to save disk. A naive recursive delete (`rm -rf` / `Remove-Item -Recurse`) can **follow that link and destroy the shared target** — turning a cleanup into the deletion of a shared dependency, another checkout, or the **inherited kit mount itself**. This is not hypothetical: two shared trees were destroyed this way in one day (an inherited mount, and a live worktree mid-operation). It is a destruction that **escapes the object being cleaned** — the exact class the policy floor's *destruction* deny exists to stop. Three binding rules:
  - **(1) Default to unlink-first.** Unlink junctions/reparse-points, *then* delete the now-plain tree — the only order safe across delete-tool versions and flags (some recursive deletes follow a directory junction by default). Trusting a tool's link-safety *instead* of unlinking **REQUIRES a host-verified fixture per link type present** in the tree, and that trust is a point-in-time claim, re-verified whenever the tool changes.
  - **(2) One file system — never delete through a mount.** The invariant is not only "don't follow a link": a **bind mount / container volume** inside the tree is not a link and cannot be unlinked, yet a recursive delete destroys it in place. A mounted filesystem inside the tree is **unmounted or excluded, never deleted through** (one-file-system semantics).
  - **(3) The boundary is the deleted object's own directory, whatever its current path — and it binds *every* recursive delete in the cleanup lifecycle:** the remove itself, the L3 `gc`/harvest executor, **and the eventual quarantine purge** (human or automated). A quarantined tree keeps its absolute junctions **live**, so purging it is the same hazard merely deferred — which is why the lock-aware rule above unlinks *before* the move (a tree enters quarantine link-inert). The `gc`/harvest executor that reclaims heavy orphans (branches proven merged, per the quarantine's merged-per-item rule) stays **L3**, but its delete step is bound by all three rules here wherever it runs.

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

**SEALED 2026-06-05 by the Principal Architect** (Rule #4 — Principal Architect approval given).

**Amendment 2026-06-06 — SEALED by the Principal Architect:** §5.4 gained the **squash-merge blindspot** rule + the two squash-aware detection strategies (patch-equivalence / forge query; reference impl `findSquashMergedBranches` in the session-hygiene scanner). Additive — no normative substance removed. Surfaced by a consumer's hygiene root-cause diagnosis (`git branch --merged` was blind to 158 of 218 squash-merged local branches; 218→68 swept).

**Amendment 2026-06-24 — SEALED 2026-06-29 by the Principal Architect:** §5.4 gains a **physical-orphan blindspot** + a **physical-orphan audit** requirement (the periodic audit must scan the worktree-root *directory*, not only `git worktree list`/`prune`). Additive — no normative substance removed. Surfaced by a consumer's worktree-sprawl diagnosis: ~48 worktree dirs (`<product>-wt-*` pattern) = 16 live + 4 registered orphans (remote branch deleted on merge, worktree never removed) + **28 physical dirs with no registered worktree AND no `.git`** — invisible to `git worktree list` and unreclaimed by `git worktree prune`. *(An initial hypothesis blamed `node_modules`-as-junction blocking removal; direct validation **REFUTED** it — `node_modules` is a real dir and the orphans lack `.git` entirely, so the mechanism is a partway-failed removal or prior-clone residue, to be determined. The audit requirement holds regardless of mechanism.)* The reference scanner (`session-hygiene-scan.mjs`) and any L3 hygiene gate need the physical-dir scan to detect this class. **SEALED 2026-06-29 by the Principal Architect (Rule #4 — Principal Architect approval given, "dale").**

**Amendment 2026-07-05 — SEALED by the Principal Architect:** §5.4 gains three additions closing the **creation/deletion asymmetry** (creation is institutionalized — 1 task = 1 branch = 1 worktree via the launch piece; deletion depends on each session ending gracefully and running its cleanup, so sessions that die badly never clean and nothing sweeps after): **(1) interrupted-create heal** — a worktree left `locked` in a create-time state (`initializing`) is a heal candidate (unlock → remove → recreate fresh), not a live worktree; **(2) removal must not run under timeout pressure** — remove detached/in the background so a mid-delete kill stops producing the partial-dir-without-`.git` orphan (prevention, complementing the 2026-06-29 detection); **(3) quarantine-before-purge** — the governed deletion arm is *move, not destroy* (relocate a verified orphan to `_orphans-quarantine-<date>/`, permitted by a destruction-denying policy floor because a move is not a delete; merged-per-item verification required; a failed move correctly protects a live session; scan → classify → single batch human confirm → move). Additive — no normative substance removed. The executor stays **L3** (moving dirs is OS/safety-specific); the reference scanner detects the create-time lock. Surfaced by a consumer's single-day audit: **64 orphan dirs** (same class as the 2026-06-29 diagnosis, more evidence) + 2 `locked: initializing` (one blocking a live slice) + the >2-min Windows `remove` timeout leaving `.git`-less dirs; the quarantine ritual moved 63/64 and the one move-failure was a live session it correctly protected. **SEALED 2026-07-05 by the Principal Architect (Rule #4 — Principal Architect approval given).**

**Amendment 2026-07-08 — DRAFT, pending seal:** §5.4 gains two additions attacking the *remove* itself (prior amendments handled the orphan after it exists — detect, quarantine — and the timeout-kill; this handles the remove that **fails on a lock**, and the delete that **destroys outside its target**): **(1) lock-aware removal** — a `git worktree remove` that fails outright on an OS file lock (open dev-server handle, a framework build-output dir, an editor, a hydrated store) is a live-handle condition: release the known lock-holders first, retry with backoff under a **supervised** (not fire-and-forget) remove; on a **persistent** lock, **attribute it** — a foreign lock is a live session and is **never moved** (D-059 failed-move protection); only the worktree's own leftover lock defers to quarantine, and only **after unlinking its junctions** (link-inert) via an **atomic same-volume rename**; when remove and move both fail, the **terminal safe state is registered + flagged** (never deregistered/`--force`/pruned — the periodic audit owns disposition). **(2) junction-safe deletion** — a recursive delete MUST NOT escape the object being deleted: **unlink-first by default**, **never cross a mount boundary** (one-file-system), and the boundary binds **every** delete in the lifecycle — the remove, the L3 `gc`, **and the eventual quarantine purge** (a quarantined tree keeps its absolute junctions live). Additive — no normative substance removed. The `gc`/harvest executor stays **L3**, but its delete step is bound by all three junction-safe rules wherever it runs. **Validated round 1 (independent adversarial review): REQUEST-CHANGES → 3 MAJOR + 4 MEDIUM + 2 MINOR, all applied** (the categorical "move on persistent lock" and the purge-scope gap were each citeable to destroy a shared tree; record `doc/REVIEW-ADVERSARIAL-WORKTREE-REMOVE-LOCK-JUNCTION-D062-2026-07-08.md`). Surfaced by a consumer finding (36 heavy physical orphans accumulating because `remove` failed on locks). **Two distinct classes, not one:** the 2026-06-29 "to be determined" is now determined **for the orphan class** — a remove that **fails partway on an OS lock** (this finding's own 36-orphan evidence; the 2026-06-29 note's sealed evidence positively **excluded** junction-follow for *that* class, and this does not overturn it); the **junction-follow delete is a second, distinct class** that destroys shared targets *outside* the tree, validated the same day by two real destructions (an inherited kit mount wiped to empty, and a live worktree deleted mid-operation). *(Placeholder — SEAL line added on the Principal Architect's approval.)*
