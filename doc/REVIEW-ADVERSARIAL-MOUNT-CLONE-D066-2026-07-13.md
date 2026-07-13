# Adversarial validation record — D-066 (mount = isolated clone, never junction)

- **Artifact:** amendment to SEALED `CANON-BRANCH-WORKTREE-LIFECYCLE §5.4` + `devkit-doctor` `mount-integrity` check + `mount-devkit.{ps1,sh}` deprecation (kit PR #257, branch `claude/mount-clone-not-junction`).
- **Builder:** dev-kit seat (Claude Code, Opus 4.8).
- **Validator:** independent `devkit-rev` on **Fable 5** — empirical (executed reproductions, not reasoning).
- **Round 1 commit:** `093d52d`. Date: 2026-07-13. Filed per `CANON-AUDIT-PROTOCOL §9`.

## Round 1 — `VERDICT: REQUEST-CHANGES` (the rule sound + spine-worthy; the mechanization was proven theater)

Fable **executed** the refutations (real `mklink /J` junctions + the branch's real doctor; the kit's own gates; code cited by line). Findings + dispositions:

### MAJOR (all fixed + re-proven by execution)
- **M1 — mount-integrity was dead code emitting an affirmative FALSE GREEN.** Node realpath-resolves `import.meta.url`, so invoked *through* a junction `KIT_ROOT` is already the real path → `lstatSync(KIT_ROOT).isSymbolicLink()` is **always false**; running the branch doctor through a real junction returned `status:"ok"` — certifying the wipe-risk mount as an isolated clone. **FIX:** classify the *invoked* path (`process.argv[1]`) via `realpathSync ≠ resolve`, plus a consumer `.vibethink-core` link check. **PROVEN:** re-ran through a real junction → `status:"warn"`; via the real path → `ok`.
- **M2 — "Fire-test PASS" was FALSE, caught by the kit's own gate.** "e.g. `../vibethink-dev-kit`" in the rule BODY → `check-agent-context` RED (l1-neutrality, product name). **FIX:** neutralized the example. **PROVEN:** `check-agent-context` GREEN; zero product names in the rule body.
- **M3 — canon vs code + inverted the sealed §8.8.** Rule said "empty/non-git → RED/block", but `inheritedBrain` is `blocking:false` (empty mount → exit 0), and §8.8 (same D-061 incident) classifies an emptied mount as ABSENT-class → WARN, never hard-block. **FIX:** rule + check now say **WARN** (non-blocking health-board classification, §8.8 absent-class), and the canon describes what the doctor actually does.
- **M4 — the test proved nothing; the "impossible" fixture is constructible.** Delete the detection → the happy-path test still passes. **FIX:** added a real link fixture (junction on Windows / symlink on POSIX) asserting WARN — deleting the detection now makes it warn→ok and FAIL. **PROVEN:** doctor test 8/8, the fixture WARNs.

### MEDIUM (fixed)
- **MD1 — drift claim unmechanized + overstated ("runs anyway").** FIX: canon now states the trade honestly (rare catastrophic wipe → ordinary non-destructive staleness, healed by the next pull; residual staleness is the consumer's to manage, a freshness signal is a separate concern).
- **MD2 — "wiped 3×" conflated classes.** FIX: reframed to **one confirmed junction-follow-delete** (D-062, near-loss of the canonical kit — enough alone); the two mount-empty events are the related class a clone does not prevent but whose damage it stops from *escaping* + fast re-clone recovery.
- **MD3 — deprecation + setup docs incomplete.** FIX: `mount-devkit.sh` (symlink) also gets the D-066 warning + version bump; `INHERITANCE-CONTRACT` and `ADOPT-DEV-KIT` mount rows amended from "symlink convenience" to "isolated link-free clone".
- **MD4 — "isolated clone" underspecified.** FIX: rule now says **link-free + own `.git`**, and notes a shared sibling clone qualifies but with a wider blast radius (per-consumer clone preferable).

### MINOR (fixed)
- **MN1** worktree false "clone" message → the message now distinguishes `.git` dir (clone) vs file (worktree/gitlink). **MN2** `catch → ok` fail-open → now `catch → warn` (indeterminate is not assumed-safe). **MN3** mount-integrity outside gate-integrity — noted; now covered by the link fixture test.

### Clean surfaces (Fable, round 1)
No collision with D-062's delete-side rules (genuine prevention+mitigation complement); deprecation breaks no flow; version bumps correct; register format consistent; spine-worthy (not gold-plating). *Live bonus: the policy floor blocked Fable's own `rm -rf` of its fixtures — D-062 working during its own review.*

**Disposition:** all round-1 findings applied + re-proven by execution. Re-check (Fable) pending before seal.
