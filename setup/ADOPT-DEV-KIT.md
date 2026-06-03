# Adopt the Dev-Kit — the single inheritance index

> **What this is.** The one place a repo (or a fresh agent) opens to answer the
> question *"what does this kit offer me, and how do I adopt each piece?"* — every
> agnostic piece of the kit listed with the same three answers: **what you
> inherit**, **how you adopt it**, **how you verify it is actually in use**.
>
> **What this is *not*.** Not a re-write of any existing runbook. When a piece
> already has detailed adoption guidance (the cross-agent governance runbook), this
> index **points** to it. The index keeps each piece glanceable; depth stays in its
> own home.
>
> **Reason for being.** The kit's whole purpose is that *everything agnostic is
> reusable in any project*. Until now, only the cross-agent governance piece had a
> declared adoption path — the other ten pieces shipped without one, leaving
> consumers to discover them by reading commits or by accident. This file closes
> that gap as a **single, executable list**.

---

## How inheritance works (the mechanism — read first)

From `doc/decisions/ADR-20260524-supra-repo-inheritance-mechanism.md`, by
artifact type:

| Artifact | Mechanism | Why |
|---|---|---|
| **Docs** (canons, methodology, ADRs) | **by reference** — your repo points to the kit path, no copy | docs need no runtime resolution; a pointer keeps a single source of truth |
| **Runnable** (engines / scripts) | **verbatim copy + CI parity check** | the script must run even where the mount is absent; the parity check is its drift guard |
| **Mount** (`.vibethink-core` / workspace folder) | dev/read convenience **only** | a symlink can be missing on a checkout — correctness cannot depend on it |

**Golden rule:** the engine is tested **once, here**. Your repo declares its
**config** and runs the **smoke** against it; it never forks the engine. A copied
runnable must carry the parity check that proves it is byte-identical to the
upstream — without it, the copy silently rots.

---

## How to use this index

1. **Mount** the kit (one-time, dev only) — see the box below.
2. Walk the **12 pieces** in order. For each: read **Qué**, decide if it applies,
   follow **Cómo**, run **Verificar**.
3. Skip what does not apply (e.g. a repo with one agent does not need the inbox
   yet, but should still declare so explicitly — see the per-piece adoption
   table at the end).
4. End on **"Done when"** — the accepting checklist.

Some pieces (#2, #3, #4) already have a detailed runbook
(`ADOPT-CROSS-AGENT-GOVERNANCE.md`). This index links there rather than
duplicating; everything else gets its adoption instruction here.

---

## Mount the kit (local dev only — does **not** travel to CI)

So the tools resolve locally:

```powershell
# Windows
..\_vibethink-dev-kit\tools\mount-devkit.ps1
```
```bash
# Linux / Mac
../_vibethink-dev-kit/tools/mount-devkit.sh
```

Or add `_vibethink-dev-kit` as a workspace folder. **CI does not need this** — the
reusable workflow (Piece #2) fetches the kit's tools itself; copied runnables
(Pieces #3, #4, #8, #12) travel with your repo.

---

## The pieces

Each piece follows the same shape: **Qué se hereda · Cómo se adopta · Cómo se
verifica · Layer**.

### 1 — Universal root authority

**Layer:** L1 (neutral core).
**Home:** `knowledge/ai-agents/AGENTS_UNIVERSAL.md`.

- **Qué:** the agnostic root rules a consuming `AGENTS.md` extends — the "NO BRAIN,
  NO WORK" principle, port-from-registry rule, never-do/always-do lists, git safety
  protocol, level-1 fire-test (no brand/product/methodology name in the neutral
  core).
- **Cómo:** your repo's root rules file (`AGENTS.md`) declares it inherits from
  this file (by reference — a pointer line, never a copy). Your file extends, it
  does not replace.
- **Verificar:** Piece #2's smoke checks that the root rules file stays under the
  most restrictive agent's byte budget; **read** the root file — it should cite
  `AGENTS_UNIVERSAL.md` explicitly and add only repo-specific extensions.

### 2 — Cross-agent context layering + the smoke

**Layer:** L1.
**Home:** `knowledge/ai-agents/CANON-CROSS-AGENT-CONTEXT-LAYERING.md` +
`tools/check-agent-context.mjs` + `.github/workflows/agent-context.yml`.

- **Qué:** the layering canon (root + subdir + per-agent adapters + per-agent
  override), the smoke engine that validates layering, and a reusable CI workflow
  that gates every PR.
- **Cómo:** **follow the detailed runbook** —
  [`setup/ADOPT-CROSS-AGENT-GOVERNANCE.md`](ADOPT-CROSS-AGENT-GOVERNANCE.md)
  Steps 1–4 (mount, declare your `tools/agent-context.config.json`, run the
  smoke locally, wire the CI gate via `workflow_call`).
- **Verificar:**
  - Local: `node <kit>/tools/check-agent-context.mjs tools/agent-context.config.json` → `GREEN — cross-agent layering holds`.
  - CI: a green `agent-context` job on the latest PR/push.

### 3 — Multi-agent orchestration (inbox, feed, compass)

**Layer:** L1.
**Home:** `knowledge/ai-agents/CANON-MULTI-AGENT-ORCHESTRATION.md`
(§2 transitions, §2.1 pull modes, §5 routing schema, §5.1 compass + dual layer,
§5.1.A agent→human status, §5.1.B router message) +
`tools/inbox.mjs` / `tools/feed.mjs` / `tools/inbox.config.json`.

- **Qué:** the protocol that removes the human from the message bus — addressed
  comms in a shared lane, inbox surfacing per agent, feed for ambient visibility,
  the human-actionable "compass" shape, and the dual-layer router message
  (human-decides + paste-able agent block).
- **Cómo:**
  - Docs **by reference** — your `AGENTS.md` points to the canon, never copies it.
  - Engines **by verbatim copy** — copy `tools/inbox.mjs` and `tools/feed.mjs`
    into your repo (e.g. `scripts/inbox.mjs`) and add a `package.json` script
    (e.g. `"inbox": "node scripts/inbox.mjs"`).
  - Config — declare your `tools/inbox.config.json` (lane path, recognised agent
    tokens). See `ADOPT-CROSS-AGENT-GOVERNANCE.md` Step 3.
  - Wire the inbox as a **session-start surface** (each agent's harness — Claude
    Code SessionStart hook, Codex equivalent, etc.).
  - **Authoring discipline (Schema v2):** every comm declares flat front-matter
    (`from`, `to_agent`, `repo`, `target_layer` when governance, `ref_branch`,
    `tldr`, `action`, `reversible`, `on_no_reply`); first line of the file is the
    `---` block (no leading HTML comment).
- **Verificar:**
  - `node scripts/inbox.mjs <agent>` shows your open items.
  - A test comm round-trips: send → recipient inbox surfaces it → close → inbox
    drops it.
  - Schema v2 self-check: pick a recent comm; confirm `to_agent` is a **base
    token** (not `codex-rev`), front-matter is flat (no nested `ref:` map), and
    the file's first non-whitespace line is `---`.

### 4 — Session closeout & hygiene scan

**Layer:** L1.
**Home:** `CANON-MULTI-AGENT-ORCHESTRATION.md` §2.2 +
`tools/session-hygiene-scan.mjs` + `tools/session-hygiene-scan.test.mjs`.

- **Qué:** every branch/worktree touched in a session must end in exactly one
  declared state — `PUSHED` / `READY-PR` / `DISCARDED` — and the scan flags any
  registered worktree with uncommitted or unpushed work older than today
  (detection only, never mutates).
- **Cómo:**
  - Docs **by reference** — your `AGENTS.md` cites §2.2 as the closeout rule.
  - Engine **by verbatim copy** — copy `tools/session-hygiene-scan.mjs` (e.g. to
    `scripts/session-hygiene-scan.mjs`) and expose it as `pnpm session:hygiene`
    + `pnpm session:start` (which chains it with `inbox <agent>`). See
    [`ADOPT-CROSS-AGENT-GOVERNANCE.md`](ADOPT-CROSS-AGENT-GOVERNANCE.md) Step 6.
  - Wire `session:start` to your agent harness if it supports a session-start hook.
- **Verificar:**
  - `pnpm session:hygiene` exits 0 after a clean session; exits 1 on a stale
    worktree (test it: leave a dummy uncommitted change with a back-dated commit
    and confirm it gates).
  - Your closeout signals (§5.1.B router block) name the closing state of each
    touched branch.

### 5 — Decision disposition (ADRs as graph nodes)

**Layer:** L1.
**Home:** `knowledge/architecture/CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING.md`.

- **Qué:** every architecture / contract / behavior decision is written into the
  repo as an **ADR** in a known folder, in the `ADR-YYYYMMDD-slug` form, with
  `Status / Date / Decider / Decision / Why / Alternatives / Consequences /
  Evidence` — the Markdown/ADR is the strong indexable binding; inline code
  markers (`# WHY:`, `# DECISION:`) are advisory and link back.
- **Cómo:**
  - Declare your decisions folder (`doc/decisions/` or `docs/adr/`).
  - Bind any indexer / knowledge-graph tool to that folder.
  - Adopt the template (see the canon §3.1).
  - Read with §6 (retrospective reconstruction): scout-pattern — when you touch
    an area with history but no ADR, reconstruct it tagged
    `[RECONSTRUCTED from <source>]`.
- **Verificar:** for the last N significant architecture changes (deps, runtimes,
  contracts, supply-chain), an ADR exists in your decisions folder. If not, the
  retrospective-reconstruction rule kicks in on next touch.

### 6 — Decision capture trigger (the reflex)

**Layer:** L1.
**Home:** `doc/decisions/ADR-20260525-decision-capture-trigger-enforcement.md`.

- **Qué:** the agent reflex that *stops and classifies* before implementing or
  expanding any of: production dependency, runtime/render framework, CDN / font /
  browser script source, architecture pattern, contract shape, cross-tenant
  behavior, security/data/auth/privacy boundary, AI-assisted / model-driven
  behavior, any standard future agents must remember. If the answer is "yes" →
  write the ADR/canon first.
- **Cómo:**
  - Pointer in your `AGENTS.md` (root rules) — every agent loads it.
  - Optional but recommended: a governance lint (`validate:governance` /
    pre-commit) that flags a dep/runtime/etc. diff without an accompanying ADR
    reference.
- **Verificar:**
  - A recent PR touching a trigger category cites the new/updated ADR.
  - The lint (if added) bites: introduce a dep diff with no ADR → red.

### 7 — Paused work lifecycle

**Layer:** L1.
**Home:** `doc/decisions/ADR-20260522-paused-work-lifecycle.md`.

- **Qué:** the rule that paused work (no open PR, no activity for N days) is
  classified `paused-with-intent` (owner-declared) or **reapable** — and that
  reap happens in a periodic **agents-off cleanup window**, never mid-flight.
- **Cómo:**
  - Bind a TTL value per repo (e.g. N = 7 days).
  - Define the `paused-with-intent` marker (branch description, a `paused.json`
    entry, etc.).
  - Declare your hygiene cadence (e.g. weekly agents-off window).
  - Optionally extend Piece #4's scan to count paused artifacts (worktrees +
    branches without PR + stashes) and surface them.
- **Verificar:** after a cleanup window, paused-without-intent artifacts older
  than N days are gone or PR'd; paused-with-intent artifacts survive with their
  marker.

### 8 — Governed agent-to-agent task dispatch

**Layer:** L1.
**Home:** `doc/decisions/ADR-20260525-governed-agent-task-dispatch.md` +
`tools/comms-send.mjs` + `tools/comms-security-gate.mjs` +
`tools/comms-sync.mjs`.

- **Qué:** every task / review / handoff to another agent goes through the
  governed send path (`comms:send`) — not a local file alone. The recipient
  performs the **Recipient Self-Check** against `repo` / `target_layer` /
  `ref_branch` before acting. Governance comms (`task`, `review`, `audit`)
  carry `target_layer` (`SUPRA-L1L2` / `product-L3` / `both`), `ref_branch`,
  and a `Recipient Self-Check` body block.
- **Cómo:**
  - Engines **by verbatim copy** — copy `comms-send.mjs`,
    `comms-security-gate.mjs`, `comms-sync.mjs` into your repo
    (e.g. `scripts/comms/`).
  - Wire `pnpm comms:send`, `pnpm comms:security`, `pnpm comms:sync` in
    `package.json`.
  - Document the schema in your `AGENTS.md` (by reference to the canon §5).
  - When you author a governance task: include the `Recipient Self-Check` block
    + `target_layer` + `ref_branch`.
- **Verificar:**
  - Every recent `TASK-*` / `REVIEW-*` in your lane has matching dispatched comm
    front-matter (`to_agent` + `repo` + `target_layer` if governance + valid
    `ref_branch`).
  - `comms:send` blocks an outgoing message that contains a secret pattern
    (negative test).

### 9 — Review-call checklist (the advisor's 10 controls)

**Layer:** L1.
**Home:** `knowledge/ai-agents/REVIEW-CALL-CHECKLIST.md`.

- **Qué:** the operational instrument for a second architect (advisor) before a
  seal — 10 controls (reality over fixtures · recall *and* precision · correct
  by design not by luck · gates must bite · boundaries grepped not asserted ·
  internal consistency · claim = mechanism strength · design scales ·
  enforcement not authorship · honest close). Verdict is GO with evidence, or
  BLOCKED with file/line.
- **Cómo:**
  - Pointer from your `AGENTS.md` for reviewers.
  - Declare per-repo binding: which corpus satisfies #1 (reality), which command
    is the negative test for #4, which CI workflow is the enforcement for #9.
- **Verificar:** the most recent review/audit comm cites at least one control
  by number with its evidence — not just "LGTM".

### 10 — Development process (L1) + VT-Method (L2 binding)

**Layer:** L1 + L2.
**Home:** `knowledge/methodology/CANON-DEVELOPMENT-PROCESS.md` (L1, neutral) +
`knowledge/methodology/VT-METHOD.md` (L2, VibeThink binding) +
`doc/decisions/ADR-20260524-vt-method-methodology-layering.md`.

- **Qué:**
  - **L1 — neutral skeleton:** governance precedes code; four pillars
    (governance · slice + decision gate · spec pipeline · governed execution);
    document authority hierarchy (`canon > specs > strategy > research`);
    lifecycle artifacts; findings.
  - **L2 — VibeThink binding (VT-Method):** the **3-Gate Preflight** for the
    decision gate, the `Direct Execution / structured spec-kit / interchange-spec`
    spec pipeline, ADR registration by layer.
- **Cómo:**
  - Both docs **by reference** — your `AGENTS.md` points up, never copies.
  - L3 product specifics (your own gate questions, your spec-kit cherry-picks,
    your product vocabulary, your domain model) stay **in your repo's own layer**
    — never flow upward.
- **Verificar:** every non-trivial PR cites the slice + the gate verdict + the
  spec weight chosen (briefing vs structured spec). A PR that opens with code
  before a gate is non-compliant.

### 11 — Port assignment scheme (L2)

**Layer:** L2 (org).
**Home:** `knowledge/PORT_ASSIGNMENT_GLOBAL.md`.

- **Qué:** the org-wide port **scheme** (ranges + prod-vs-review split rule:
  prod `< 5000`, review `>= 5000`, `prod + 2000`) — not the per-app
  assignments. Each repo registers its apps within these ranges.
- **Cómo:**
  - Declare your repo's port registry (e.g. root `ports.json` with
    `"$schema": "VIBETHINK_PORT_REGISTRY_V2"`).
  - Claim a block within the right range (apps `3000–3049`, references
    `3050–3099`, etc.).
  - Mark canonical ports `sacred: true`.
  - Optionally CI-validate that `package.json` scripts use the registered
    ports.
- **Verificar:** no `package.json` script hardcodes a port outside `ports.json`;
  the smoke (Piece #2) sees a clean root.

### 12 — Agnostic agent-hook engines (optional pattern)

**Layer:** L1.
**Home:** `tools/keyword-reminder.mjs` + `tools/keyword-reminders.example.json` ·
`scripts/sync-agent-skills.mjs`.

- **Qué:** small, generic engines that solve cross-agent ergonomics — and are
  proven by real adoption today, even though they have not been catalogued
  before. They illustrate the **runnable-by-copy** mechanism in action.
  - `keyword-reminder.mjs` — a UserPromptSubmit hook engine: matches user prompt
    keywords against a per-repo rules table (`keyword-reminders.json`) and
    prepends a reminder banner. Topic-agnostic; the rules file is the per-repo
    binding.
  - `sync-agent-skills.mjs` — sync (with a `--check` drift mode) between a
    canonical skills source dir (default `.agents/skills`) and an agent-specific
    target dir (default `.claude/skills`). Used to keep per-agent skill copies
    aligned without forking.
- **Cómo:**
  - **Copy** the engine into your repo (consistent with ADR-20260524 §3.1):
    `scripts/hooks/keyword-reminder.mjs` or `scripts/sync-agent-skills.mjs`.
  - For `keyword-reminder.mjs`: drop a real `keyword-reminders.json` next to it
    (start from the kit's `.example.json` shape) and wire it as a
    UserPromptSubmit hook in your agent harness config
    (e.g. `.claude/settings.json`, `.codex/hooks.json`).
  - For `sync-agent-skills.mjs`: wire `pnpm sync:skills` and
    `pnpm sync:skills --check` (drift mode for CI).
  - Add the **parity check** (§3.1 enforcement of ADR-20260524) — see Piece #2's
    CI shape; a periodic job that diffs your copy vs the kit upstream.
- **Verificar:**
  - `keyword-reminder.mjs`: send a test prompt containing the configured
    keyword; the banner appears as additional context.
  - `sync-agent-skills.mjs --check`: exits 0 when source and target are in sync.

> **Honest status.** These two engines exist in the kit and are in real use
> (`keyword-reminder.mjs` in one consuming repo, `sync-agent-skills.mjs` in
> another), but the parity-check CI step that ADR-20260524 §3.1 requires for
> runnable-by-copy artifacts is **not yet wired** — that gap travels with this
> piece. See `doc/AUDIT-DEVKIT-CLEANUP-2026-06-03.md` finding F4.

---

## Per-piece adoption status — declare in your `AGENTS.md`

A consuming repo states explicitly which pieces it has adopted and which it
has consciously skipped. **Silence is not declaration.** Suggested table to
paste into your repo's `AGENTS.md` under a `## Dev-Kit inheritance` section:

| # | Piece | Status | Notes |
|---|---|---|---|
| 1 | Universal root authority | ADOPTED / N-A | which file references it |
| 2 | Cross-agent layering + smoke | ADOPTED / PENDING / N-A | smoke result + CI run |
| 3 | Multi-agent orchestration | ADOPTED / PENDING / N-A | lane path |
| 4 | Session closeout + hygiene scan | ADOPTED / PENDING / N-A | command name |
| 5 | Decision disposition | ADOPTED / PENDING / N-A | decisions folder path |
| 6 | Decision capture trigger | ADOPTED / PENDING / N-A | governance lint? |
| 7 | Paused work lifecycle | ADOPTED / PENDING / N-A | TTL + cadence |
| 8 | Governed task dispatch | ADOPTED / PENDING / N-A | comms:send wired? |
| 9 | Review-call checklist | ADOPTED / PENDING / N-A | bound corpus |
| 10 | Dev process + VT-Method | ADOPTED / PENDING / N-A | which canon binds it |
| 11 | Port assignment scheme | ADOPTED / PENDING / N-A | ports registry path |
| 12 | Agent-hook engines | ADOPTED / PENDING / N-A | which engines copied |

Statuses:
- **ADOPTED** — in active use; verification has run at least once.
- **PENDING** — recognised, not yet wired.
- **N-A** — does not apply to this repo (e.g. single-agent repo skipping #3).

---

## Done when

A consuming repo can claim full adoption only when:

- [ ] Mount works locally (Step *Mount the kit*).
- [ ] Piece #2 smoke is GREEN locally **and** the CI job runs and passes.
- [ ] Piece #3 inbox surfaces at session start for **at least one** agent.
- [ ] Piece #4 hygiene scan exits 0 after a clean session.
- [ ] Piece #5 decisions folder exists and is bound to your indexer (if any).
- [ ] Piece #8 `comms:send` is wired and a test comm round-trips.
- [ ] Piece #9 reviewers cite controls by number in review messages.
- [ ] Your `AGENTS.md` carries the **Per-piece adoption status** table — every
      row declared `ADOPTED`, `PENDING`, or `N-A`. **No silent skips.**

---

## Reading order for a fresh agent

If you are an agent landing in a consuming repo and want to understand the
inheritance from scratch, read in this order:

1. **`README.md`** of the kit (one-paragraph framing).
2. **`knowledge/START-HERE.md`** (the 2-minute door).
3. **`setup/ADOPT-DEV-KIT.md`** (this file — what you inherit).
4. **`setup/ADOPT-CROSS-AGENT-GOVERNANCE.md`** (the detail for Pieces #2/#3/#4).
5. The specific canon for whichever piece you are wiring next.

---

## Maintenance

- A new agnostic piece added to the kit (canon, ADR, engine) **must add a
  corresponding section here** in the same PR. Adding a piece without adopting
  it into this index is the failure class this file exists to prevent.
- A piece deprecated or removed → strike the section here, point to its
  superseding piece (or to its removal ADR), do not silently delete.
- This file is **L1 neutral** — fire-test: no product or vendor brand names.
  Vendor-specific configuration (e.g. Claude Code `.claude/settings.json`,
  Codex `.codex/hooks.json`) is mentioned only as the **harness shape** a
  consuming repo wires against, not as required vocabulary.

---

**Provenance.** Written 2026-06-03 to close the inheritance-index gap that the
2026-05-25 Gemini/Opus methodology audit raised (findings on missing adoption
runbooks for non-cross-agent pieces) and that the WorkBench second-consumer
moment made concrete (`keyword-reminder.mjs` adopted by one repo,
`sync-agent-skills.mjs` by another, neither documented).
**Companion audit:** `doc/AUDIT-DEVKIT-CLEANUP-2026-06-03.md` — refined cleanup
findings raised by this index work.
