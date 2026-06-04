# CANON-GIT-HYGIENE — Universal git hygiene for development sessions

**Status:** DRAFT — awaiting Marcelo (Principal Architect) seal
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

## §7 — What this canon does NOT do

- It does **NOT** prescribe the specific scripting language, runner, or shell of the preflight. The consuming repo picks.
- It does **NOT** enforce automatic clean-up. An agent that auto-cleans without confirmation can lose work. *Pause-and-decide* is the discipline.
- It does **NOT** replace `git`'s own safety nets (don't force-push during cleanup, don't blindly `clean -fdx`).

---

## Provenance

This canon was lifted from ViTo `docs/canon/processes/GIT_HYGIENE_PROTOCOL.md` (status ACTIVE) where the principle and workflow were already written agnostic of any specific tool but trapped at L3 by being filed inside a product repo. The ViTo doc refactors to a thin L3 binding (the specific preflight script path, the dev command, the agent-context files) and points at this spine.
