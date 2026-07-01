# CANON-GIT-HYGIENE — Universal git hygiene for development sessions

**Status:** SEALED 2026-06-04 by Marcelo (Principal Architect) — Tier C consolidation
**Date:** 2026-05-25
**Scope:** Every repo where humans and/or agents run development sessions (servers, builds, tests).

---

## §1 — The Golden Rule

> **"No Dirty Starts."**

Development servers, builds, and tests **MUST** start from a clean git state (`git status --porcelain` returns empty).

**Why:** to prevent accidental inclusion of artifacts, to ensure reproducible builds, and to avoid "phantom file" tracking that wastes hours later. A dirty start is a debug session waiting to happen.

---

## §2 — Enforcement mechanism patterns

The consuming repo binds these patterns to its own tooling (§6).

### 2.1 Automated preflight

A script that runs **before** the dev/build/test command and refuses to proceed if the working tree is dirty. The canonical check is `git status --porcelain` returning empty. The script's language (`pwsh`, `bash`, `fish`, `node`, equivalent) is L3.

### 2.2 System configuration: LF normalization

A `.gitattributes` file (or equivalent) that normalizes line endings to **LF** for collaborative repos (e.g. `* text=auto eol=lf`), eliminating OS-specific diff noise (the "EOL war"). On Windows-mixed teams this is non-negotiable.

### 2.3 Agent-context constraints

The consuming repo's agent-context file(s) — whatever the local mix is (`.cursorrules`, `AGENTS.md`, `CLAUDE.md`, `.windsurfrules`, `GEMINI.md`, equivalent) — explicitly **forbid** agents from:
- modifying files unrelated to the declared task,
- leaving temporary scripts, debug dumps, or build artifacts uncommitted.

### 2.4 No forced hook bypass

`--no-verify` (and equivalents like `--no-gpg-sign`, skipping hook plumbing, disabling commit-msg hooks) **MUST NOT** be used to silence a failing hook. Hooks exist to keep secrets, syntax errors, and policy violations out of history. If a hook fails, fix the root cause; do not silence it.

**The only legitimate exceptions:**
- Pushing a comm to the shared lane when the worktree carries unrelated dirty state the comm tool cannot itself govern (the comm send tool already ran the security gate twice; only the dirty-worktree hygiene check is being bypassed).
- An explicit, documented exception declared in the L3 binding's override clause (§6) — never silent.

Any other use of `--no-verify` is a forbidden pattern (§4).

### 2.5 Clean Floor — root write prohibition

Scripts, tools, and agents **MUST NOT** write temporary files to the repository root. The root is for configuration and entry points only; clutter at root hides real issues and routinely leaks into commits.

- ❌ Forbidden: `node build.js > build.log` (writes `build.log` at root).
- ✅ Allowed: `node build.js > ./logs/build.log` (or any designated dir).
- ✅ Allowed: write to `./tmp/`, `./logs/`, `./.cache/` (gitignored by default in the consuming repo's L3 binding).

The consuming repo's L3 binding names the designated temp directories.

### 2.6 Actionable close-out (every hygiene report/gate ends with a next step)

Every hygiene mechanism — a preflight gate, a session scan, a freshness nudge — **MUST** close its output with an **actionable recommendation**, not just a diagnosis. The recommendation carries three things:

- the **next step** — the concrete command or action to take;
- whether it **blocks or only warns** — a gate that bites vs an advisory;
- the **disposition** — proceed / clean / separate scope / hand off / run health / pause.

A report that only states "the tree is dirty" forces the reader to rediscover the remedy every time; one that says "not clean → run *<the repo's scope-split command>*, then *<its pre-commit command>*" is self-completing. **The specific commands are L3** (§6): the kit ships the requirement and a slot; the consuming repo injects its own command names. Same shape as the readiness checks elsewhere in the spine — *report + recommend*, never a bare flag.

### 2.7 Hook layering: L1-generic vs L3-example

Commit/checkout hooks fall in two classes, and a binding **MUST NOT** present an L3 hook as if it were universal:

- **L1-generic** (inheritable as-is): commit-message linting (conventional-commit shape), the dirty-start preflight (§2.1), LF normalization (§2.2), the no-root-write floor (§2.5).
- **L3-example** (product-specific — shown as examples, NOT universal): agent-context validation config, i18n / hardcoded-string scans, product schema checks, framework-specific gates. These are legitimate and encouraged **as the consuming repo's own binding**, but the kit documents them as *examples of an L3 hook*, not part of the universal set.

The L3 binding (§6) declares which hooks it runs and labels each **L1-generic** or **L3-local**.

### 2.8 Operator-tool freshness: nudge, don't auto-rebuild

Operator tools that maintain a derived index (code graph, search index, knowledge index) go stale and need refreshing — but the refresh **MUST NOT** be an **expensive, silent, automatic rebuild** triggered by a routine git event (e.g. a full-repo graph rebuild on every `post-checkout`). The recommended pattern is a **SessionStart nudge**: non-blocking, exit 0, that reports "index N days stale / tool missing" and **recommends the concrete scoped command** (§2.6), leaving the rebuild to the operator. If a repo does wire an automatic refresh, it **MUST** (a) be scoped/incremental, not a full rebuild, and (b) emit an explicit message stating it is running, its expected cost, and how to disable it. Silent expensive background work on checkout burns CPU and confuses.

---

## §3 — Agent workflow (4 steps, every session)

Regardless of which agent or runtime:

1. **Check status.** Before writing ANY code, run `git status`. If dirty, decide: *is this mine to continue, or do I pause and clean first?*
2. **Isolate.** Create a feature branch (or commit to the one already declared for this task). Don't append unrelated changes to another agent's branch.
3. **Clean up as you go.** Delete debugging scripts (`*.js`, `*.ps1`, `*.txt`, scratch files, profile dumps) created during the session, *before* declaring the work done.
4. **Verify before handover.** Run `git status` again. The only modified files should be the ones the task required. If something else is dirty, explain it or clean it.

---

## §4 — Forbidden patterns (anti-patterns)

- **Zombie files.** Committing files that are in `.gitignore`. Fix: `git rm --cached <path>`.
- **EOL war.** Committing CRLF line endings into a collaborative repo (overrides `.gitattributes` normalization). Fix: `git add --renormalize .`.
- **Scope creep.** Modifying styling, formatting, or unrelated logic in files outside the current task's scope. This is silent drift that compounds across sessions and is the single most common source of merge conflicts on cross-agent work.
- **Force-push to the default branch.** Destructive to shared history; rewrites the timeline every other contributor depends on. Forbidden without explicit, documented exception.
- **Rebase of published commits.** Once a commit is pushed and visible to other contributors / CI, rebasing it breaks every downstream branch and pipeline that built on it.
- **Overnight rebase / merge / cherry-pick in progress.** An intermediate git state (rebase or merge in progress) left across sessions blocks everyone who pulls the repo and is itself a §1 "dirty start" violation. Finish or abort before stepping away.
- **Committing commented-out code.** Use version control to recover deleted code; commented-out blocks are debt that rots and confuses future readers.
- **Silent `--no-verify`.** Bypassing hooks without declaring the reason (§2.4) is forbidden; the dirty-worktree exception is allowed *only* through the comm-send tool, never by hand.
- **Writing at root.** Scripts/agents emitting `*.log`, `*.txt`, debug files at the repo root (§2.5). Use `./tmp/`, `./logs/`, or the consuming repo's designated dirs.

---

## §5 — Recovery

If you find the working tree dirty when you didn't expect it:

```bash
# 1. Stash to come back later
git stash --include-untracked

# 2. Or discard if the dirt isn't yours
git restore .
git clean -fd
```

`git clean -fd` is **destructive** — only run it if you're sure none of the untracked files are work you want to keep. When in doubt, stash first.

---

## §6 — L3 binding (what the consuming repo owns)

The consuming repo's L3 binding declares the **concrete tooling**:
- the **script path** of the automated preflight (e.g., `scripts/git-preflight.ps1`),
- the **development command** that the preflight gates (e.g., `pnpm dev`, `cargo run`, `make dev`),
- the **agent-context file(s)** where the agent constraints live (`.cursorrules`, `AGENTS.md`, `CLAUDE.md`, `.windsurfrules`, etc. — pick the ones the consuming repo actually uses),
- any **repo-specific addenda** (additional anti-patterns the team has seen — e.g. "do not commit `.next/cache`", "do not commit local Excalidraw snapshots").

The L3 binding does **NOT** re-write the golden rule, the workflow, or the anti-patterns. If it does, it drifts from this spine.

---

## §7 — Governance: all changes via PR

For any consuming repo with two or more contributors — human or agent — **every change merged to the default branch MUST go through a Pull Request** (or its equivalent: merge request, change set, code review with sign-off). This explicitly includes:

- documentation changes,
- developer-tooling changes,
- "trivial" fixes,
- agent-generated automations.

> **Perceived lack of impact is NOT a valid excuse to bypass this rule.**

**Rationale.** Uniform process prevents "death by a thousand cuts" — small unreviewed changes that, taken together, drift the system beyond what any one reviewer could spot in isolation. PR review is the cheapest place to catch architectural drift; it costs minutes there, days to reverse later.

**Exception:** the **comm lane** of the consuming repo (the shared mailbox for cross-agent communication) is **create-only** and may be pushed directly to the default branch by the governed comm-send tool, because the artifact is append-only by design and the tool runs its own gates. Every other path goes through PR.

The consuming repo's L3 binding documents its specific PR tooling (GitHub PR, GitLab MR, Phabricator diff, equivalent) and any local addenda (required reviewers, CI gates, label conventions).

---

## §8 — L3 binding override clause (PROMOTED → the Inheritance Contract)

> **Moved 2026-06-11 (authorized by the Principal Architect).** This clause was
> defined here first because git-hygiene was the most foundational spine — but
> it always applied to **every** spine, so an heir asking *"may I override X?"*
> had to find it buried in a git-hygiene section. It now lives where an heir
> looks: **`setup/INHERITANCE-CONTRACT.md` §4** (override visibly: `## Overrides`
> section with spine+section · replacement · reason · temporality; every
> override is a finding to the maintainer; silent deviation is drift).
>
> The mechanism is **unchanged** — only its home moved. Deviations from *this*
> canon follow the contract like deviations from any other spine.

---

## §9 — What this canon does NOT do

- It does **NOT** prescribe the specific scripting language, runner, or shell of the preflight. The consuming repo picks.
- It does **NOT** enforce automatic clean-up. An agent that auto-cleans without confirmation can lose work. *Pause-and-decide* is the discipline.
- It does **NOT** replace `git`'s own safety nets (don't force-push during cleanup, don't blindly `clean -fdx`).

---

## Provenance

This canon was lifted from a product-side `docs/canon/processes/GIT_HYGIENE_PROTOCOL.md` (status ACTIVE) where the principle and workflow were already written agnostic of any specific tool but trapped at L3 by being filed inside a product repo. The product-side doc refactors to a thin L3 binding (the specific preflight script path, the dev command, the agent-context files) and points at this spine.

**Amendment 2026-05-25 (Cluster C-4 reconciliation):** §2.4 (No forced hook bypass), §2.5 (Clean Floor / root write prohibition), four new entries in §4 anti-patterns (force-push to main, rebase published commits, overnight rebase, commented-out code, silent `--no-verify`, root write), §7 (All changes via PR governance rule), and §8 (L3 binding override clause — applies to every Dev-Kit spine canon) were lifted from a product-side `CANON-REPO-HYGIENE-001.md` (status ACTIVE) where they had been trapped at L3 despite being agnostic. The product-side `CANON-REPO-HYGIENE-001.md` was consolidated into `processes/GIT_HYGIENE_PROTOCOL.md` (the existing L3 binding) and superseded — the two duplicate product-side hygiene canons collapsed into one L3 binding pointing at this spine.

The **§8 override clause** is the meta-mechanism for handling exceptions across all spine canons — defined here once because git-hygiene is the most foundational, but applicable to every L3 binding.

**Amendment 2026-07-01 — sealed by the named authority:** §2.6 (actionable close-out — every hygiene report/gate ends with next-step + blocks-or-warns + disposition; the concrete commands are L3), §2.7 (hook layering — L1-generic vs L3-example; a binding must not present an L3 hook as universal), §2.8 (operator-tool freshness — a SessionStart nudge over an expensive silent auto-rebuild on routine git events). Triggered by a consumer's field review of the inherited hygiene hooks. Two companion code findings landed in `tools/session-hygiene-scan.mjs` the same day (`cb59112`): precise "no mutation" wording (the squash probe creates a temporary dangling object via `commit-tree`), and a new `local-only` WARN state for a no-upstream branch whose commits have not travelled.

**Amendment 2026-06-11 — authorized by the Principal Architect:** §8's content was **promoted** to `setup/INHERITANCE-CONTRACT.md` §4 (the heir's one-page contract: mechanism · declare · never-duplicate · override-visibly · declared-adaptation · no-silent-deviation). §8 here is now a pointer; the mechanism is unchanged. Rationale: the clause always applied to every spine, and discoverability beats historical placement — an heir looks for deviation rules in the inheritance contract, not inside the git-hygiene spine.
