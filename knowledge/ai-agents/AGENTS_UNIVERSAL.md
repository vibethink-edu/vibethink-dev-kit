# AGENTS Universal (vendor-neutral core)

[![AGENTS.md](https://img.shields.io/badge/AGENTS-UNIVERSAL-blue)](https://agents.md)

> **🚪 First time? Read `knowledge/START-HERE.md` first** (the 2-minute door), then this.
>
> **This file defines the GENERIC rules that ALL repos inherit.**
> Specific projects extend these rules with their own `AGENTS.md`.
>
> **Cross-agent discipline (universal layer):**
> - `CANON-CROSS-AGENT-CONTEXT-LAYERING.md` — layering, strictest-agent budget,
>   anti-contamination, the smoke test (how agents actually load the rules).
> - `CANON-MULTI-AGENT-ORCHESTRATION.md` — agent↔human handoff: self-watched
>   machine gates, per-agent inbox, judgment escalation to the human,
>   feed + interrupt (the human is not the message bus). If you assign a task to
>   another agent, writing a `TASK-*` is not enough: send the handoff over the
>   shared channel with the governed send tool, commit/push, and verify the
>   recipient's inbox.
> - `REVIEW-READINESS-PROTOCOL.md` — the readiness loop before asking for review:
>   test in the layer that gives the true signal, declare it, attach evidence,
>   watch machine gates yourself (never use the human as a relay), and keep the
>   concrete adapters in the consuming repo.
>
> **Decision discipline (universal layer):**
> - `../architecture/CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING.md` — every
>   architecture/contract/behavior decision is written as **Markdown/ADR** (the
>   knowledge-graph-indexable binding). Inline markers are *advisory* for the
>   human reader and link to the ADR; they never replace it for indexing. Before
>   implementing a dependency, runtime, CDN/font/render source, contract,
>   cross-tenant boundary, or AI-assisted / model-driven behavior (worker,
>   assistant flow, extraction, model-chosen action), classify whether it needs
>   an ADR/canon and write that record first. Decisions are first-class citizens
>   of the repo, not ephemera of the conversation.

---

## 🔥 LEVEL 1: CRITICAL (Read Always - Before ANY Task)

### ⚡ Mandatory First Actions

**BEFORE doing ANYTHING in a project that inherits this kit, the AI MUST:**

```bash
# Step 1: Identify Project Structure
list_dir project_root/           # What type of project is this?
list_dir project_root/scripts/   # What operational scripts exist?

# Step 2: Read Essential Files
read_file README.md              # Project overview
read_file AGENTS.md              # Project-specific rules (if exists)
read_file package.json           # Available npm scripts

# Step 3: Identify Operational Scripts
glob_search "*.ps1"              # PowerShell scripts (Windows)
glob_search "*.sh"               # Shell scripts (Unix)

# Step 4: Note Quick Commands
# Document what you found in your response
```

### 🚨 Protocol: "NO BRAIN, NO WORK"

**Before writing code, verify you have access to the project's shared knowledge
base** (the kit / "brain" that holds the standards). If you cannot find it, do
**not** guess standards — **stop and request access**:

> ⚠️ ALERT: I don't have access to the project's knowledge base (the standards "brain").
> ❌ Risk: generating code outside the project standard.
> 🛠️ Fix: add the knowledge base to the workspace, or run the project's mount script.

> The concrete folder names, symlink path, mount script, and IDE steps are
> org-specific — see the **methodology layer (level 2)**.

**Size limit is not an excuse to skip the brain.** Agents may load the root
`AGENTS.md` and inherited generic/SUPRA rulebook intelligently: first read the
repo root `AGENTS.md`, then follow its inherited reference to this file. If this
file is too large to load wholesale, use targeted search/ranges and extract the
sections needed for the task. Do **not** pretend the rulebook is unavailable just
because it is large.

If the inherited rulebook exists but cannot be fully loaded, extract these
sections at minimum before work:

- `Dev Tooling Baseline`
- `NO BRAIN, NO WORK`
- `Duty to Flag`
- inheritance / layering rules
- tool availability and reporting rules

Only stop under **NO BRAIN, NO WORK** when the inherited rulebook truly cannot be
found or accessed. In that case, scream louder than a missing dev tool: do not
continue on local habits.

### 🛡️ Quick Operations Reference

**Every project MUST have operational scripts. Find them FIRST:**

| Pattern | Purpose |
|---------|---------|
| `scripts/start*.ps1` | Start development server |
| `scripts/stop*.ps1` | Stop server/processes |
| `npm run dev:*` | Development via npm |
| `npm run build:*` | Build via npm |

**NEVER use generic commands when project scripts exist.**

### 🚦 Port Assignment

**Ports come from a project-wide registry — never guessed.** Before starting any
server, read the project's port registry and use the assigned block.

**NEVER guess port numbers — check the project's port registry first.**

> The concrete global port map (ranges, reserved demos) is org-specific — see the
> **methodology layer (level 2)**.

### ❌ Never Do (Universal)

```bash
# ❌ NEVER mix incompatible build tools / bundlers in one project
# ❌ NEVER install a framework into a project built on a different one
# ❌ NEVER use floating / caret (^) version ranges — pin exact versions
# ❌ NEVER install dependencies in both root and app folders
# ❌ NEVER guess operational commands - find project scripts first
# ❌ NEVER expose API keys in frontend code
# ❌ NEVER create reports/validations/work files in project root
# ❌ NEVER leave temporary files unorganized
# (concrete version pins & known-bad stack combos: see the methodology layer)
```

### ✅ Always Do (Universal)

```bash
# ✅ ALWAYS read AGENTS.md before starting work
# ✅ ALWAYS identify and use project-specific scripts
# ✅ ALWAYS use exact versions in package.json
# ✅ ALWAYS verify compatibility before suggesting updates
# ✅ ALWAYS ask user before architectural changes
# ✅ ALWAYS commit frequently with descriptive messages
# ✅ ALWAYS create reports/validations in work/ folder structure
# ✅ ALWAYS organize temporary files in work/ subdirectories
# ✅ ALWAYS, on a "refresh / update the kit" request (any phrasing) → run the kit's Refresh trigger (see the on-ramp): upgrade → re-read the change-delta → present a short adoption card + WAIT for GO → on GO, wire + re-run the health board. A short prompt yields a short menu, never a silent mass-change.
# ❌ NEVER create .md files for every analysis - do analysis in response, only create .md for significant reports
```

### 🧰 Dev Tooling Baseline — RTK + Graphify (USE BY DEFAULT · loud fallback · non-blocking)

> **Status: USE BY DEFAULT — provisioned in every dev environment (owner standard of care);
> the kit ships the pins + install recipes (`setup/EXTERNAL-TOOLS.md`). A quality/performance
> enhancement, NEVER a product-correctness dependency. Non-blocking: no CI gate, no merge
> gate, no product build/test failure just because absent. Local/session health MUST still
> surface absence as RED/WARN.**
>
> **Mental model: a database index.** A query runs correctly without the index — just slower;
> you always add it because the gain is worth it. Same here: provision AND use these by default.
> Their absence DEGRADES the experience (more tokens, blind grep); it does NOT fail product
> correctness, but it MUST NOT be silent.

- **Use them by default — expected, not optional.** When provisioned, reach for `rtk` and
  `graphify` as described below instead of going straight to raw/blind commands. The gain
  (tokens, orientation) is why they are the standard of care, not a nicety.
- **Loud fallback, documented — never silent.** If the environment cannot provision them
  (install fails, offline, unsupported platform, stale shell, shell mismatch, CLI not in PATH),
  proceed WITHOUT them only after surfacing a visible local-health RED/WARN and saying so in
  your report/PR — e.g. `rtk/graphify unavailable: <reason>`. The only wrong move is a
  silent skip.
- **Stale session remediation preserves history.** If the binary exists but the live process
  has an old PATH, do not force a restart as the first answer. Hot-patch that session's PATH
  with the exact tool directory, then persist PATH for future launches. Restart is only the
  disposable-session path.
- **RTK** (token economy): wrap noisy/verbose command output (listings, builds, tests, logs,
  `status`, `find`) with `rtk`. Skip already-compact output (e.g. `git log --oneline`).
- **Graphify** (code navigation): use for orientation (hubs, what-defines-what, dead-code,
  "what touches X") BEFORE blind grep. On-demand, no permanent runtime; index the subdir you
  work in (not the whole monorepo); gitignore `graphify-out/`. Graphify ORIENTS — verify
  authoritative dependencies with `git grep`.
- **Still NEVER a product-correctness gate.** "Use by default" is an expectation on agent
  diligence, NOT a CI/merge gate: a repo / agent / CI without them still builds and tests.
  Do NOT let the *use* expectation harden into a product-correctness gate. Do let launchers,
  doctor, and session health scream loudly (RED/WARN) when the tools are missing or invisible.
- **Not in the A/B dev-tooling baseline (use-by-default):** agentmemory. *(**Engram — superseded 2026-06-21 by the Principal Architect:** Engram was previously listed here as "not adopted". That decision was reconsidered and **reverted**: Engram **is adopted**, separately, as a **class-C operator memory tool** — opt-in, per-agent, stateful — see [`setup/EXTERNAL-TOOLS.md`](../../setup/EXTERNAL-TOOLS.md). "Adopted" here means the **use-by-default baseline** (RTK+Graphify); Engram lives at the **operator/lifecycle layer** (§8), is NOT use-by-default A/B dev tooling, NOT a product correctness gate, and NOT a product runtime dependency. A house/L2 methodology may still bind Engram as part of its declared Knowledge Memory Adapter; that is separate from this neutral baseline.)*
- Tool **versions + install lifecycle**: the kit ships the DEFAULT registry at
  `setup/EXTERNAL-TOOLS.md` (pins, recipes, evidence, version-forward). A repo MAY override
  with its own EXTERNAL-TOOLS registry — per-repo lifecycle wins, override declared visibly.
  This layer declares the *use* baseline (use-by-default + documented fallback).

### 🧠 Knowledge Memory Adapter — required for product-shaping VT-METHOD work

For repos using Knowledge-Native VT-METHOD, product-shaping work may not start from
an isolated feature request. The agent must first retrieve and cite the Accepted
Knowledge Baseline through the repo's declared Knowledge Memory Adapter.

Minimum rule:

- If the work is product-shaping, complex, AI-assisted/model-driven, cross-boundary,
  or new-domain, find the repo's Knowledge Pack config/binding.
- Retrieve the accepted pack through the declared adapter.
- Cite the accepted pack id/version/path and the adapter in the spec/briefing.
- If the adapter, index, or inherited pack is missing/stale/unavailable, surface a
  RED/WARN local-health finding and stop product-shaping execution until the baseline
  is reachable or the human/principal authorizes a reconstruction sprint.

The house/L2 default adapter profile may bind Engram for memory/facts/recall,
Graphify for graph relationships/communities/semantic navigation, and versioned
Markdown Knowledge Packs as the auditable source of truth. Engine output helps
retrieval; accepted Markdown is the authority.

### 🗣️ Duty to Flag (CRITICAL — culture law)

**Noticing something and staying silent is the only real fault.** Mistakes are
cheap to fix when flagged in the moment; silent observations become someone
else's incident. Human or agent, when you notice a bug, a doc gap, a gotcha,
a better way, or something already-solved being rebuilt:

1. **SAY it** in the moment — even mid-task, even out of scope.
2. **WRITE it** where it survives (finding in the comms lane, session log,
   spec note — never only in chat: what lives only in a conversation dies
   with it).
3. **FIX it or ROUTE it** to the owner (the elevation filter decides whether
   it rises to the kit or dies locally — but it gets DECIDED, not buried).

Nobody should hit the same stone twice because the first one who saw it kept
quiet. This duty outranks scope, politeness, and "not my task".

**Preventive edge — don't let the human walk into a foreseeable hole.** Flagging is
about what you *notice*; this is about what you *foresee*. When you see a problem
coming — a bug about to ship, a decision about to be made on a wrong premise, a
cheap-to-prevent failure — you do **not** stay silent or wait to be asked: say it
**now**, fix it then-and-there if it's cheap and within your authority, or raise it
**before** the human commits if the call is theirs. **The smaller and cheaper the
fix, the less excusable the silence** — an unflagged, preventable hole is *your*
failure, not the human's. (Constitutional: `CANON-AGENT-COLLABORATION` §6 rule 11.)

### 📁 File Organization Rule (CRITICAL)

**NEVER** create work files / reports / validations at the project root (this is
also the Clean Floor rule — `CANON-GIT-HYGIENE` §2.5).

**ALWAYS use the `work/` structure:**

```
work/
├── validations/     # validation reports and audits
├── reports/         # analysis reports and temporary documentation
└── temp/            # temporary files and drafts
```

**Naming:** `[TYPE]_[DESCRIPTION]_[DATE].md` — types: `VALIDATION_`, `REPORT_`,
`AUDIT_`, `ANALYSIS_`. Full reference: `work/README.md`.

---

## 📋 LEVEL 2: WORKFLOW (Read When Working)

### General Workflow

1. **Analyze**: Read `AGENTS.md`, `DOCS_INDEX.md`, relevant code
2. **Plan**: Create short plan before changes
3. **Implement**: Write clean, documented code
4. **Verify**: `npm run build` + `npm run dev` without errors
5. **Document**: Update `CHANGELOG.md` for significant changes

### Pre-Commit Checklist

Versioning is **driven by the commit itself**, not by a per-commit interrogation:
write [Conventional Commits](https://www.conventionalcommits.org/) (`feat:` /
`fix:` / `docs:` …) and the repo's declared versioning model derives the bump —
see `../methodology/CANON-VERSIONING-001.md`. Update the package's `CHANGELOG.md`
in the same change when the repo's binding requires it. Do **not** ask the user
"shall we bump the version?" on every commit.

### 🛡️ Git Safety (defers to the canon — no local variants)

The authoritative git rules live in **`../methodology/CANON-GIT-HYGIENE.md`**; this
section only surfaces the non-negotiables an agent must never re-derive:

- **NEVER force-push the default branch.** No "only if you're 100% sure" exception
  exists — it is a forbidden pattern (GIT-HYGIENE §4).
- **Everything lands via PR** (or the repo's equivalent review path) — including
  docs, tooling, and "trivial" fixes (GIT-HYGIENE §7). The only exception is the
  repo's governed comm lane.
- **Never auto-`pull` when a push is rejected.** `git fetch` first, inspect the
  divergence (`git log HEAD..@{u}` / `@{u}..HEAD`), then decide deliberately.
  A reflexive `pull` can overwrite local work.
- **Before any sync:** `git status` + know which commits travel in each direction.
- **Work on feature branches;** commit frequently; never leave valuable work
  uncommitted overnight (session closeout exit states — see
  `CANON-MULTI-AGENT-ORCHESTRATION.md` §2.2).
- **Lost work recovery:** `git reflog` + a backup branch *before* any destructive
  restore — see GIT-HYGIENE §5 (and never `reset --hard` / `clean -fd` on state
  you have not inventoried).

### Session Continuity Protocol

#### 🌅 Session start (user greets)

- **FULL agents** (terminal/git): `git status --short` + `git log --oneline -n 3`,
  read the previous session summary if one exists, run the project's command
  center if it has one, then ask what to work on.
- **LITE agents** (no terminal): read the previous session summary if possible,
  declare your limitations, ask the user for the current project state.

#### 🌙 Session end (user says goodbye)

**Always ask:** "push the progress to git before we finish?" — no valuable work
stays uncommitted/unpushed across sessions (closeout exit states,
`CANON-MULTI-AGENT-ORCHESTRATION.md` §2.2).

### Stability Rules

```typescript
// 🟢 SAFE (fix without asking):
// - individual pages, simple syntax errors, isolated features

// 🔴 DANGEROUS (ASK FOR AUTHORIZATION first):
// - dependencies (package manifest, installs)
// - global configuration (tsconfig, lint config)
// - shared code (src/shared/, utils)
// - project architecture
```

---

## 📚 LEVEL 3: REFERENCE (Read When Needed)

### Monorepo Architecture

```
project-root/
├── apps/                     # Applications
│   ├── [app-a]/
│   ├── [app-b]/
│   └── [other-apps]/
├── packages/                # Shared packages
│   ├── ui/                  # UI components
│   └── utils/               # Utilities
├── src/                     # Shared source (if applicable)
├── docs/                    # Documentation
├── scripts/                 # Operational scripts
└── AGENTS.md               # Project rules
```

### Directory Rules

- `/components`: Reusable UI components (functional, typed)
- `/services`: Business logic, API calls (keep UI dumb)
- `/types`: Shared TypeScript interfaces
- `/hooks`: Custom React hooks
- `/docs`: Technical documentation

### Documentation Organization

**Allowed in root:**
- `README.md` - Project introduction
- `AGENTS.md` - AI agent rules
- `CHANGELOG.md` - Version history
- `QUICK_START.md` - Quick start guide

**Everything else → `docs/`**

### Security Rules

- **ALWAYS** scope every data query by its tenant key (multi-tenant isolation).
- **NEVER** query a shared table without a tenant filter.
- **NEVER** expose provider API keys or secrets to the client.
- **NEVER** surface the **value** of a secret in ANY output — chat, docs, commits, PRs, logs, or comms. Refer only to its **name, presence/absence, permissions/scope, and the procedure**; a diagnostic reports `present`/`absent`, never the value.
- **If a tool or file exposes a secret value:** stop, do not re-quote or echo it, treat it as a **security incident** (see the incident table below), **escalate for rotation** — the runbook runs under its owner, never the agent; the agent never rotates or invents a key itself (`REFERENCE-OPERATOR-COMMAND-CATALOG` rule 11) — and record the incident **without** the secret.

> Concrete client/ORM snippets and the tenant-key field name are org/product-specific
> — see the **methodology layer (level 2)** and the product repo.

> The secret-handling **mechanics** live with their owners — the coder deny-list, the comms secret-scan gate, the audit-trail exclusion (`CANON-DATA-CHANGE-AUDIT-001` §10.1), and post-exposure fix scoping (`CANON-AGENT-COLLABORATION` §10). These two rules are the universal floor those instruments inherit; they do not restate them. Concrete secret stores and runbooks are L3.

### Branding / methodology layer

- Org brand, house-methodology terms, concrete stack/ports/tooling, and DB
  examples live in the **methodology layer (level 2)** — not in this neutral core.
- This core stays vendor- and methodology-neutral. **Fire-test:** it must read
  clean of any product name, vendor brand, or methodology name. If one appears, it
  is a leak from level 2/3 — move it down. See `CANON-CROSS-AGENT-CONTEXT-LAYERING.md` §8.

---

## 🔗 Inheritance Model

### How Projects Inherit

```
<the-kit>/                                    ← the supra-repo upstream
├── knowledge/ai-agents/
│   ├── AGENTS_UNIVERSAL.md                   ← THIS FILE (neutral core, level 1)
│   ├── CANON-CROSS-AGENT-CONTEXT-LAYERING.md ← layering canon (companion)
│   ├── <one adapter per agent>               ← per-agent adapters (pointers)
│   └── <methodology layer>                   ← org bindings (level 2)
│
project-specific/                             ← a fork (level 3)
├── AGENTS.md                    ← Inherits + Extends
├── <per-agent adapter files>    ← Inherits + Customizes
└── [project-specific-docs]
```

### AGENTS.md template for projects

A fork's `AGENTS.md` declares its mission, what it inherits from the kit, its
quick-operations table, its stack, and its extra rules. A ready-to-fill template
(with stack/script names) lives in the **methodology layer (level 2)**.

---

## 📋 Validation Commands

**Run the project's validation scripts before and after changes.** Each project
declares the exact script names (a "quick" check before, fuller checks after).

> Concrete command names are org-specific — see the **methodology layer (level 2)**.

---

## 🎯 AI Capability Detection

- **Agents with terminal / tool access → FULL PROTOCOL** (run scripts, git, build).
- **Agents without terminal access → LITE PROTOCOL** (declare limitations; ask the
  user to run commands).

> The mapping of specific agent products to FULL / LITE is org-specific — see the
> **methodology layer (level 2)**.

---

## 🚨 Crisis Protocols (Universal)

When facing a critical situation, run the same 4-beat loop, scaled to the crisis:

1. **Contain first** — stop the bleeding (rollback, isolate, pause the pipeline)
   before analyzing. For a security incident, isolate affected systems and notify
   the security owner **immediately**.
2. **Communicate early** — the stakeholders/owner hear it from you, now, not
   after the fix. Silence during an incident is the failure
   (see *Duty to Flag*).
3. **Fix the root cause** — not just the symptom; verify the problem is actually
   resolved before declaring victory.
4. **Post-mortem + prevent** — document the incident where it survives (comms
   lane / decision record) and change the process so the same stone is not hit
   twice.

| Crisis | The specific twist |
|---|---|
| Production failure | rollback beats debugging in place; verify, then root-cause |
| Priority conflict | the human authority prioritizes (impact · urgency · resources); document the decision |
| Technical disagreement | argue with evidence; the named lead decides; record the why (ADR) |
| Lost context/information | recover from backups/reflog/comms; reconstruct with the team; then improve capture |
| People crisis | redistribute, transfer knowledge, monitor load — the lead decides resourcing |
| Security incident | isolate → contain → eliminate → restore, with the security owner driving |

**Split of responsibilities:** the agent coordinates the technical response,
analyzes, implements, and documents; the human authority makes business,
resourcing, and priority decisions. Escalate judgment calls — do not absorb them.

---

**Last Updated:** 2026-07-01
**Version:** 1.5
**Maintained by:** the dev-kit (supra-repo upstream)
**Changelog:**
- v1.5 (2026-07-01): Maturity-audit cleanup (F-02/F-08). **Git Safety now defers to
  `CANON-GIT-HYGIENE`** — removed the contradictory local variant (a conditional
  default-branch force-push and a direct merge+push-to-main workflow, both forbidden
  by the canon §4/§7). Pre-Commit Checklist defers to `CANON-VERSIONING-001`
  (Conventional Commits drive bumps — no per-commit version interrogation). Crisis
  Protocols compressed to the 4-beat loop + per-crisis table. Spanish house-culture
  sections translated to English (language-neutral core). ~30.5 KB → ~24 KB.
- v1.4 (2026-06-19): Added the kit-refresh trigger to Always-Do — a "refresh/update the
  kit" request maps to the Refresh-trigger recipe (the on-ramp), so the behavior **inherits
  by reference** instead of being pasted per-repo. Kept neutral (abstract: upgrade /
  change-delta / health board — concrete tool names stay in the on-ramp / level 2).
- v1.3 (2026-05-22): Restored level-1 vendor-neutrality (review finding #3) — moved
  concrete kit-access, ports, stack pins, DB example, validation commands, AI
  capability mapping, and the inheritance paths/template to the methodology layer
  (level 2). The neutral core now keeps only agnostic principles + pointers.
- v1.2 (2025-01-XX): Added Universal Crisis Protocols (migrated from historical documentation)
- v1.1 (2025-12-18): Added Git Safety Protocol to prevent work loss from incorrect GitHub synchronization
