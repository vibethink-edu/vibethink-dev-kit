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
> declared adoption path — the rest shipped without one, leaving
> consumers to discover them by reading commits or by accident. This file closes
> that gap as a **single, executable list**.

---

## How inheritance works (the mechanism — read first)

> **The full heir's contract is [`INHERITANCE-CONTRACT.md`](INHERITANCE-CONTRACT.md)**
> — one page: mechanism · declare your adoption · never duplicate · **override
> visibly** (the deviation clause) · declared adaptation · no silent deviation.
> This section summarizes only the mechanism; the contract governs.

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
upstream — without it, the copy silently rots. That check is **Piece #31**
(`check-copy-parity`), wired through the same reusable workflow as Piece #2.

---

## How to use this index

> **New to the kit?** Start at the on-ramp **[`USING-THE-KIT.md`](USING-THE-KIT.md)**
> (who you are → your path → a worked example → the daily loop). This index is the
> **reference menu**; the on-ramp is *how to use it*.

1. **Mount** the kit (one-time, dev only) — see the box below.
2. Walk the **pieces** in order. For each: read **Qué**, decide if it applies,
   follow **Cómo**, run **Verificar**.
3. Skip what does not apply (e.g. a repo with one agent does not need the inbox
   yet, but should still declare so explicitly — see the per-piece adoption
   table at the end).
4. End on **"Done when"** — the accepting checklist.

Some pieces (#2, #3, #4) already have a detailed runbook
(`ADOPT-CROSS-AGENT-GOVERNANCE.md`). This index links there rather than
duplicating; everything else gets its adoption instruction here.

---

## Step 0 — the machine (before everything; heir finding A-1/A-6/A-7, Campus 2026-06-12)

The checklist used to assume a ready machine. Real onboardings hit machines with
no Node, no gh, no git identity. Before mounting anything:

1. **Bootstrap the machine** — follow `setup/RUNBOOK-NEW-MACHINE-BOOTSTRAP.md`
   (gh + device-flow with the **org-authorization** gotcha, clone as siblings,
   Node LTS + corepack/pnpm).
2. **Git identity** — `git config user.name / user.email` (first commit fails or
   misattributes without it).
3. **`.gitignore` first** — copy `setup/templates/gitignore.baseline` to the repo
   root BEFORE the first `pnpm install` (prevents staging vendored
   node_modules — it nearly happened).
4. **Confirm the kit's default branch** — `git remote show origin` → use THAT
   ref in your `uses:` workflow lines (this kit's is `master`; an heir shipped
   broken CI assuming `main`).
5. **Declare data gravity** — if the project touches data that must never reach
   GitHub (e.g. minors' data), write WHERE it lives and WHICH machines may run
   the tasks that touch it (README + briefings).

### Vendoring from a sibling repo is TRANSITIVE (heir finding A-3)

When vendoring a package from another family repo (e.g. a UI kit), map its
workspace-dependency closure first (`grep "workspace:" its package.json`,
recursively) and vendor the whole set — the first `pnpm install` fails otherwise
(`ERR_PNPM_WORKSPACE_PKG_NOT_FOUND`, lived). Pattern: one parity config per
upstream (`copy-parity.config.json` for the kit, `vendor-parity.config.json` for
the sibling), each copy declared `adapted` with reason.

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
- **Platform variants are allowed (and may pre-date this engine).** A
  consuming repo MAY use a richer platform-specific hygiene gate alongside
  (or instead of) the `.mjs` engine — for example a PowerShell
  `scripts/git-hygiene.ps1` that additionally inspects open PRs, `[gone]`
  upstream branches, hidden agent worktree directories, or
  `delete_branch_on_merge` flags. Coexistence is fine as long as:
  - the canon §2.2 closeout rule (`PUSHED` / `READY-PR` / `DISCARDED`) is
    declared from the consuming repo's root rules, regardless of which engine
    enforces it;
  - the variant runs **at least at session start** (the floor — same as the
    `.mjs` engine);
  - the variant **never mutates** without the operator's instruction
    (detection-only, same boundary as the `.mjs` engine).
  This is the build-on-pain version of Piece #4: if your platform-specific
  gate is already richer for your context, do not replace it for symmetry.

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

### 10a — Development process (L1, neutral skeleton)

**Layer:** L1 (neutral core).
**Home:** `knowledge/methodology/CANON-DEVELOPMENT-PROCESS.md`.

- **Qué:** the brand-free process skeleton — **governance precedes code**; the
  four pillars (governance · slice + decision gate · spec pipeline · governed
  execution); the document authority hierarchy (`canon > specs > strategy >
  research`); lifecycle artifacts; findings; the SOTA-informed gate (§7) and
  full-ownership (§8). Adoptable by **any** consumer — including a non-house repo
  that already enforces "governance precedes code, rigour proportional to risk"
  through its **own native process** (it binds the L1, it does not need a foreign
  methodology to do so).
- **Cómo:**
  - Doc **by reference** — your `AGENTS.md` points up, never copies.
  - A consumer whose native development flow already satisfies the L1 declares
    this piece `ADOPTED-NATIVE` and **names the native binding** (its own
    lane/gate model). It does not import #10b to adopt #10a.
- **Verificar:** a recent non-trivial change shows the gate verdict (the decision
  to proceed was governed, not implicit) and the authority hierarchy held (no code
  overrode a sealed canon). The native binding that satisfies the L1 is named in
  your `AGENTS.md`.

### 10b — VT-Method (L2, house methodology binding)

**Layer:** L2 (house).
**Home:** `knowledge/methodology/VT-METHOD.md` +
`doc/decisions/ADR-20260524-vt-method-methodology-layering.md`.

- **Qué:** the house instantiation of the #10a skeleton — the concrete
  decision-gate questions (the multi-gate preflight), the `Direct Execution /
  structured spec-kit / interchange-spec` spec pipeline, and ADR registration by
  layer. This is the **L2 binding**: a consumer that is not a house repo is
  **N-A** here — it binds the L1 (#10a) through its own native method instead.
- **Cómo:**
  - Doc **by reference**. Adopt only if your repo is a house repo that uses this
    methodology; otherwise declare `N-A` and point at your #10a native binding.
  - L3 product specifics (your own gate questions, your spec-kit cherry-picks,
    your product vocabulary, your domain model) stay **in your repo's own layer**
    — never flow upward.
- **Verificar:** if adopted — every non-trivial PR cites the slice + the gate
  verdict + the spec weight chosen (briefing vs structured spec); a PR that opens
  with code before a gate is non-compliant. If `N-A` — your #10a native binding is
  declared and the reason for skipping L2 is stated (not a silent skip).

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

> **Honest status (updated 2026-06-11).** These two engines exist in the kit and
> are in real use (`keyword-reminder.mjs` in one consuming repo,
> `sync-agent-skills.mjs` in another). The parity-check the ADR-20260524 §3.1
> mandate requires for runnable-by-copy artifacts **now exists as Piece #31**
> (`tools/check-copy-parity.mjs` + the reusable workflow's `copy-parity` job) —
> the remaining work is per-consumer: each repo declares its copies in a
> `copy-parity.config.json` and passes `parity-config-path` to the workflow.
> Original gap record: `doc/AUDIT-DEVKIT-CLEANUP-2026-06-03.md` finding F4.

### 13 — Naming conventions (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-NAMING-CONVENTIONS-001.md`.

- **Qué:** the 8 universal naming patterns (branches `{author}/{type}-{description}`, Conventional Commits, file naming with date-when-temporal, ADR `ADR-YYYYMMDD-slug`, canon `CANON-{DOMAIN}-{TOPIC}-NNN`, DB tables with timestamp + tenant key, env vars `UPPER_SNAKE_CASE`, package.json scripts `verb:scope`). Includes the universal "never" list (mechanical violations a CI can enforce).
- **Cómo:**
  - **Docs by reference** — your `AGENTS.md` points to the canon; declare per-repo binding (the recognized agent tokens, Conventional Commits scopes valid in this repo, date format, etc.).
  - Optionally wire mechanical enforcement: `commitlint` for Conventional Commits, branch-naming pre-commit hook for `{author}/{type}-{description}`, etc.
- **Verificar:**
  - A recent batch of branches follows `{author}/{type}-{description}` (or repo's declared variant).
  - Recent commits pass `commitlint` (when wired).
  - ADRs in `docs/decisions/` follow `ADR-YYYYMMDD-slug` (or repo's declared variant).

### 14 — Visual bug triage (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-VISUAL-BUG-TRIAGE-001.md`.

- **Qué:** the four-step triage discipline (DIFF FIRST → client-side check → build/runtime hygiene → ONLY THEN touch code) that gates entry to code modification when a visual bug appears after a state change (restore, checkout, deploy, branch switch, session restart). "It looks like a bug" is not evidence; a diff is.
- **Cómo:**
  - Docs by reference — your `AGENTS.md` cites the canon for visual bug discipline.
  - Per-repo binding: which cache directories to clear, which restart command is canonical, which review port the team uses for verification.
- **Verificar:** a recent visual-bug investigation in the comms lane (or PR descriptions) cites the diff-first check before code changes. Reviewers reject "fixes" that skipped Step 1.

### 15 — Testing minimum bar (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-TESTING-MINIMUM-BAR-001.md`.

- **Qué:** the floor — every new function with conditional logic ships with 1 happy-path + 1 failure-mode test in the same change. Scout rule: touch a function → add ≥1 test in the same PR. Pre-GO 60-second check: name the testable unit, the failure mode, and where the test goes. Integration modules ship with a self-test endpoint returning `{passed, failed, total}`.
- **Cómo:**
  - Docs by reference — your `AGENTS.md` cites the canon.
  - Per-repo binding: which directories the rule applies to (typically `services/`, `lib/`, library `src/`); which are exempt (routes, components, types, config); the testing framework + command; the self-test endpoint pattern for integration modules; whether currently advisory or CI-blocking.
- **Verificar:**
  - A recent function with conditional logic in scope has ≥1 happy + ≥1 failure test.
  - Integration modules expose `GET /<service>/selftest` (or equivalent) returning `{passed, failed, total}`.

### 16 — Versioning (state-of-the-art universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-VERSIONING-001.md`.

- **Qué:** the 5-type artifact model — **code packages** (SemVer 2.0 + Changesets), **deployed apps** (CalVer or SemVer with `/healthz` version exposure), **canon docs** (sequential NNN + lifecycle DRAFT→PROPOSED→ACCEPTED→SEALED→AMENDED→SUPERSEDED-BY|DEPRECATED), **ADRs** (immutable filename `ADR-YYYYMMDD-slug` + status transitions PROPOSED→ACCEPTED→SUPERSEDED-BY|DEPRECATED, body immutable after ACCEPTED), **tools/scripts** (SemVer-lite `MAJOR.MINOR`). Universal driver: Conventional Commits with mandatory `!` for breaking changes.
- **Cómo:**
  - Docs by reference — your `AGENTS.md` points to the canon.
  - Per-repo binding declared in a single file (e.g. `.versioning.yaml`) with: packages model + manager, apps model + pattern, canons numbering + approver, ADRs folder + pattern + immutability flag, tools model.
  - **Tools/scripts — enforcement shipped by the kit (so this norm bites for every heir, not just the kit).** Declare a `tools/versions.json` manifest (the kit's own is the worked example) listing every wired runnable (`tools/`+`setup/`: `.mjs`/`.sh`/`.ps1`) at `MAJOR.MINOR`. The kit's `tools/check-tool-versions.mjs` then verifies every runnable is declared (and no stale/malformed entry), and **`devkit-doctor` runs it automatically** — config-driven: a repo with no manifest is skipped (declare `N-A` if it has no custom runnables), one with a manifest is gated. Run from the mount; nothing copied.
  - Optional CI enforcement for the other types: `commitlint`, changeset bot, canon header validation, ADR immutability gate, changelog mandatory, health-endpoint version check. (Canon-doc lifecycle vocabulary is already gated by `catalog-sync` here.)
- **Verificar:**
  - The per-repo binding file exists and declares each artifact type's model.
  - **`devkit-doctor` shows the `tool versions` gate green** (every wired runnable is in `tools/versions.json`) — or the repo has no custom runnables and consciously declares `N-A`.
  - A recent breaking change in a publishable package carries `!` in its commit message.
  - A recent ADR with status change to `SUPERSEDED-BY` has a body diff of zero lines (only status header touched).
  - The deployed app's `/healthz` (or equivalent) returns version + commit hash.

### 17 — Agent ↔ human collaboration model (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-AGENT-COLLABORATION.md`.

- **Qué:** the foundational model for how an agent collaborates with the human
  authority — the repo is the only persistent memory; intuition + technique
  (read the tendency, don't execute literal instructions); behavior-over-name
  severity (a name is naming-debt, not a blocker); the against-canon anti-pattern
  + the four-step proposal preflight + empirical verification before a costly
  technical recommendation; the ten constitutional rules; the recalibration
  protocol; the session-close ritual (lessons + proactive debt declaration);
  real-fixture testing discipline; security-fix scope estimation. Other process
  spines assume this one.
- **Cómo:** doc by reference — your root rules cite it. L3 binding adds: the
  concrete preflight / DEV-MODE / decision-capture / business-model canon paths,
  the named human authority's voice, originating incidents, transition dates, and
  the agent-context file paths referenced abstractly here.
- **Verificar:** a recent correction from the human authority was saved to the
  repo (not only to agent memory); a recent constitutional proposal carries a
  `Preflight against canon` section; the session close carried the proactive
  debt-declaration without the human having to ask.

### 18 — Scope discipline (scope lock, layer boundaries, drift) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-AGENT-SCOPE-DISCIPLINE.md`.

- **Qué:** the Scope Card declared before the first edit; the vertical/horizontal
  layer-boundary rule (a vertical agent never edits horizontal files and vice
  versa — they communicate through tasks); the cross-boundary **Task Protocol**
  and the out-of-scope **Finding Protocol**; the assignment registry; the
  6-point pre-work gate; the mid-session drift check; the no-silent-topic-shift
  rule.
- **Cómo:** doc by reference. L3 binding names the concrete verticals/horizontals
  table (unit → file paths), the role-registry format, the finding-category
  taxonomy, and the coordination-lane path.
- **Verificar:** a recent session opened with a Scope Card; a cross-layer need
  was raised as a TASK (not fixed in place); an out-of-scope discovery was filed
  as a FINDING and the agent kept working its own scope.

### 19 — Skills over roles (composable skills replace specialized roles) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/ai-agents/CANON-SKILLS-OVER-ROLES.md`.

- **Qué:** generalist agents + a composable skill library invoked per task,
  replacing permanent per-domain roles (the carpenter with a toolbox, not 35
  specialists); the skill format (manifest + auxiliaries); two-level authority
  (human + per-task decision positions + generalist execution, zero middle
  management); progressive disclosure + the three invocation modes; the four
  anti-contamination mechanisms; the three-level "when is it a skill?" test;
  inherit-vs-build; the **skill eval loop** (§13 — evidence a skill earns its
  place). Deprecates permanent role registries / greeting ceremony / author
  siglas / "stay in your lane" as identity.
- **Cómo:** doc by reference. L3 binding names the skills-root directory, which
  decision positions exist, where eval sets live, and which gate runs them.
- **Verificar:** new work is scoped by task (skill invoked), not by a permanent
  role identity; a broadly-loaded or production-gating skill carries an eval set
  (its lift was measured, not assumed).

### 20 — Context hygiene (managing the agent's context window) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/ai-agents/CANON-CONTEXT-HYGIENE.md`.

- **Qué:** the agent's context window as a finite resource (more is not better;
  quality degrades silently past a fill threshold) — the green/amber/red/critical
  thresholds + qualitative degradation signals; persistence to the filesystem
  (the "if I cut now" test); in-session hygiene (fresh context per phase,
  selectivity, poisoning → cut-don't-steer); the MCP-context-trap and the
  external-skill-judgment-trap (no imported capability outranks canon); when to
  cut the session. References the orchestration spine for closeout/handoff
  (does not duplicate).
- **Cómo:** doc by reference. L3 binding names the persistence paths (decision
  store, work-log, handoff artifact) and may tune the threshold percentages.
- **Verificar:** a long recent session shows an explicit context-state warning
  from the agent before a major decision; tool-servers were off during a
  dense-reasoning phase; no external "expert" skill was imported onto
  identity-touching work.

### 21 — Pre-production (DEV-MODE) discipline (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-DEV-MODE-DISCIPLINE.md`.

- **Qué:** the tactical body of operating before the first real user with live
  data — DEV-MODE is a **declared** state (not inferred); deletion is the default
  operation; migrations don't preserve seed data; multiple approval is ceremony,
  not governance; governance gates stay active (only the tempo changes); detecting
  over-protection in other agents; ceremony's measurable cost; the
  warranted-ceremony exceptions; the exit-from-DEV-MODE inversion.
- **Cómo:** doc by reference. Parent is Piece #17 §4 (the principle + the
  transition); this is the tactical body it delegates to. L3 binding names the
  concrete gate set, the go-live context, the exception list, and the human
  authority's explicit transition phrase.
- **Verificar:** in a pre-production repo, a recent obsolete-code cleanup was a
  deletion (not a deprecation marker); mechanical fixes proceeded without
  per-step approval; the governance gates still ran.

### 22 — Git hygiene (clean development sessions) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-GIT-HYGIENE.md`.

- **Qué:** the **"No Dirty Starts"** golden rule (dev/build/test start from a
  clean tree); the enforcement patterns (automated preflight, LF normalization,
  agent-context constraints, no forced hook-bypass, clean-floor root-write
  prohibition); the 4-step session workflow; the forbidden-patterns list (zombie
  files, EOL war, scope creep, force-push to default, rebase of published commits,
  mid-flight rebase, commented-out code); recovery; the **all-changes-via-PR**
  governance rule (§7); and the **L3 override clause (§8) that applies to every
  Dev-Kit spine** — the one place the per-spine deviation mechanism is defined.
- **Cómo:** doc by reference. L3 binding names the preflight script path, the dev
  command it gates, the agent-context files, the designated temp dirs, the PR
  tooling, and any `## Overrides` section (the override mechanism every spine
  inherits from §8).
- **Verificar:** a recent dev/build session started clean (`git status
  --porcelain` empty); every change to the default branch went through a PR
  (except the create-only comm lane); no silent `--no-verify`.

### 23 — Branch & worktree lifecycle (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-BRANCH-WORKTREE-LIFECYCLE.md`.

- **Qué:** every branch has a **birth and a death** — the phase model (entry gate
  → create → work → PR → checks → merge → exit gate, + abort path); worktree
  isolation (branches for ~90% of work, worktrees only for parallel/long/
  side-by-side; one task = one unique branch; placement outside the tree;
  readiness ≠ a bare checkout; aggressive cleanup including the **squash-merge
  blindspot**); the read-only default worktree; the spawned-worker lifecycle (the
  parent owns the worker's exit gate).
- **Cómo:** doc by reference. Sits between Piece #22 (git hygiene) and the
  orchestration spine; consumes the branch/worktree naming pattern from Piece #13.
  L3 binding names the VCS commands, the thresholds (branch count, worktree age),
  the worktree root path, the pre-commit hook + allowlist, and the env-parity doc.
- **Verificar:** a recent branch ran the entry gate (clean tree, under threshold)
  and the exit gate (remote + local deleted, back on default); merged-branch
  detection is squash-aware (not `git branch --merged` alone); no worktree left as
  a repo sibling, nested, or naked.

### 24 — Architecture review (the advisor's verdict on the architecture) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/ai-agents/CANON-ARCHITECTURE-REVIEW.md`.

- **Qué:** how a second architect / advisor reviews the architecture itself (not
  a single change) — don't impose a foreign category frame; the two read-only
  modes (strategic / operational); the independence axis (in-field default →
  fresh-context escalation, "the one who builds does not grade"); the inbound
  escalation from the verification-selection gate; the first-reads discipline; the
  classification taxonomy + the **over-engineering lens** and the **hard-drop
  discipline** (a finding must serve correctness / coherence / real-cost or be
  discarded — silence on a non-finding is the correct output); the authority test;
  the output format.
- **Cómo:** doc by reference. Macro counterpart to Piece #9 (the single-
  implementation review controls). L3 binding names the product's anti-frames, the
  governing first-reads, and the over-engineering signal set (from Piece #21).
- **Verificar:** a recent architecture review leads with the verdict shape (mode,
  independence, governing reads, classification per finding); a clean review
  legitimately left lines empty (no padding); each finding cites correctness /
  coherence / real-cost.

### 25 — Audit protocol (artifact truthfulness + finding disposition) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-AUDIT-PROTOCOL.md`.

- **Qué:** how an audit of *artifacts* (canon / features / surfaces) judges and
  how every finding is carried to closure — the root question (**does it lie?**,
  not: is it built?); the five verdict categories (false present-claim / canon
  contradiction / verifiable error / unimplemented-future-design / security risk);
  the application rules (design DDL ≠ lie, roadmap ≠ FAIL, untracked-but-real ≠
  phantom); the **disposition** discipline (every finding gets one of FIXED /
  PARTIAL / OPEN / ACCEPTED_WITH_RISK / WAIVED / OBSOLETE /
  UNVERIFIED_PENDING_REVIEW, self-describing in place, escalate on silence); the
  anti-patterns; front division.
- **Cómo:** doc by reference. Sibling to Piece #24 (review = is the design sound;
  audit = does the artifact lie + did we act on what we found). L3 binding names
  the auditor identities, the front split, and the concrete escalation windows /
  channel.
- **Verificar:** a recent audit delivery carries a `Disposition` section (one row
  per critical finding, with link / owner / date); no finding sits "acknowledged
  but idle"; a change citing a finding updated that finding's disposition.

### 26 — Testing gate (verification type by complexity × stakes) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-TESTING-GATE.md`.

- **Qué:** the 60-second decision that maps a change's **nature × stakes** to the
  verification type(s) required — the selection matrix (unit / canon-contract /
  smoke / CLI / integration self-test / UAT / eval / E2E); the behavioural floor
  ("if you can't verify it, don't ship it"); mutation as an opt-in strength lens
  (never a CI hard-gate); evals for AI/model behaviour (the rubric **is** the
  canon-contract); escalation to a fresh-context advisor for high-complexity
  changes; runs per work-unit, methodology-agnostic; no global coverage %.
- **Cómo:** doc by reference. Selection layer **on top of** Piece #15 (the floor —
  referenced, not rewritten); escalates to Piece #24; routes the E2E row to
  Piece #27. L3 binding maps each type to its tooling and may add matrix rows.
- **Verificar:** a recent work-unit carries a `Verification: <type(s)>` field
  selected by nature × stakes; a high-stakes change carried more than the floor;
  a trivial change did **not** carry the full set.

### 27 — E2E test-user discipline (auth-test safety) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-E2E-TEST-USER-DISCIPLINE.md`.

- **Qué:** E2E tests **NEVER** touch a real account — create an ephemeral user per
  run (`e2e.<slug>.<ts>@<test-domain>`), delete it in teardown; the hard
  prohibitions (no destructive auth action on a real account, no real account as
  subject even read-only, no leftover ephemeral users, no hardcoded real emails in
  test files); elevated-role handling; shared fixtures; the pre-commit/CI gate +
  post-run residue check; incident response.
- **Cómo:** doc by reference. The E2E row of Piece #26 defers here, and Piece #15
  defers E2E here. L3 binding names the auth provider's admin-API equivalents, the
  test domain, the fixtures index, and wires the grep gate into the governance set.
- **Verificar:** auth tests create ephemeral users in setup and delete them in
  teardown; the governance gate blocks a test-file email that lacks the `e2e.`
  prefix and a destructive auth-admin call with no matching create on the same id.

### 28 — Gap report (on-demand status verified against reality) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-GAP-REPORT.md`.

- **Qué:** when the human authority asks "what are the gaps / what's next / where
  are we", deliver a **verified-against-reality** status (not a recap of the plan
  doc) — the mandatory protocol (read plan/requirements → read roadmap → **read
  the real code** → deliver); the delivery format (✅ works / 🔴 UX gaps & bugs /
  🟡 functional gaps / 🔴 infra blockers / logical order); the rules (don't invent,
  code wins over docs, omit empty sections, **diagnosis not execution** — ask
  before acting).
- **Cómo:** doc by reference. The specific shape of the "report results, not
  process" rule (Piece #17 §6). L3 binding records the exact trigger phrases in the
  human's language and the plan/roadmap doc locations.
- **Verificar:** a recent gap report diffed docs against real code (and flagged
  stale docs), used the section format, and ended by proposing the next action
  without starting work off the back of it.

### 29 — Upstream protocol (adopting & tracking external code) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/architecture/CANON-UPSTREAM-PROTOCOL.md`.

- **Qué:** the governance of every adopted / forked / pinned upstream — the
  brownfield principle (an unreviewed upstream is invisible debt); the
  constitutional rule (the 6-step adoption protocol + human decision + ADR before
  code lands); the license-compatibility matrix (strong-copyleft never enters as a
  fork); the **(kind, tier, typology) triple** (upstream taxonomy + risk tiers +
  runtime-location) plus the **provider security-posture lifecycle** (grade
  A/B/C/F, ban triggers, health-check, governed reinstatement); extract-patterns
  as the default policy; the per-fork `UPSTREAM.md` + the single discoverable
  upstream index; drift detection; cadence; the ongoing-update Q1/Q2/Q3; the
  intake/outcome templates.
- **Cómo:** doc by reference. Plugs into Piece #5 — the protocol's output **is** the
  ADR. L3 binding owns the actual fork inventory, the baseline/index path, the
  drift-detection check, the stack-compat checks, the security-grade rubric +
  storage, and product vocabulary overlays.
- **Verificar:** a recent upstream adoption has a matching ADR (intake + outcome
  blocks); the discoverable upstream index lists every tracked upstream with
  kind / cadence / grade; an external provider carries a security grade and
  grade `F` blocks integration work.

### 30 — Production safety (what the shipped artifact must not contain) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-PRODUCTION-SAFETY.md`.

- **Qué:** the production artifact is not the development artifact — **zero**
  development affordances ship (debug/inspector UI, dev shortcuts, config/runtime
  backdoors, dev-only globals, output intercepts); "zero" means **not created**,
  not hidden-behind-a-flag; gated at the **build/host boundary** (tree-shaken out
  or a fail-closed host check), never a runtime toggle a user can flip; a genuine
  production diagnostic is a designed product feature, not left-on debug tooling;
  enforced by an automated fail-closed gate; no exceptions. Mode-independent (true
  in every mode, unlike DEV-MODE tempo).
- **Cómo:** doc by reference. Companion to Piece #21 (DEV-MODE tempo) and Piece #24
  (a real production diagnostic is reviewed there as a feature). L3 binding owns
  the stack exclusion mechanism + the no-op surface shape, the gate tool + scan
  rules + where it runs, the artifact types in scope, and the originating incident.
- **Verificar:** the production bundle contains no debug/inspector surface (not
  created, not hidden); an automated gate fails closed if a dev affordance can
  reach production; any production diagnostic in the artifact is a named, reviewed
  product feature.

### 31 — Copy-parity check (the drift guard for copied runnables)

**Layer:** L1 (neutral).
**Home:** `tools/check-copy-parity.mjs` + `tools/copy-parity.example.json` +
the reusable workflow's `copy-parity` job (`.github/workflows/agent-context.yml`) +
`doc/decisions/ADR-20260524-supra-repo-inheritance-mechanism.md` (the mandate).

- **Qué:** the enforcement of the inheritance mechanism's §3.1 mandate — every
  runnable a consumer carries as a **verbatim copy** is verified **byte-identical
  to the kit source (modulo line endings)** on every PR. An undeclared mismatch
  is DRIFT → red. A deliberate divergence is declared per entry
  (`adapted: { reason, since }`) and reported visibly as ADAPTED — bounded
  adaptations (upstream-protocol canon §6.1) are legitimate, silent rot is not.
  The judging engine always comes from the kit checkout, never from the
  consumer's own (possibly drifted) copy.
- **Cómo:**
  - Declare your copies: drop a `tools/copy-parity.config.json` (start from the
    kit's `copy-parity.example.json`) listing each `local ⇄ upstream` pair, with
    `adapted` + reason where a bounded adaptation exists (its do-not-overwrite
    detail lives in the per-fork `UPSTREAM.md`).
  - Wire CI: pass `parity-config-path` to the reusable workflow you already call
    for Piece #2. No config passed = job skipped (opt out is explicit, not silent).
  - Local run: `node <kit>/tools/check-copy-parity.mjs tools/copy-parity.config.json --upstream-root <kit-path>`.
- **Verificar:**
  - CI shows a green `copy-parity` job on the latest PR.
  - Negative test: patch one local copy by a character → the job goes RED naming
    the pair and printing the diff hint.
  - Every `adapted` entry in the config has a reason and a matching note in the
    per-fork `UPSTREAM.md`.

### 32 — Configuration discipline (code defines behavior, not configuration)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-CONFIGURATION-DISCIPLINE.md`.

- **Qué:** the discipline that no value which can differ between deployments,
  environments, operators, or served groups lives in code — the layered
  resolution order (group/owner store → platform defaults → env → code default
  for non-sensitive invariants only; secrets never fall through to a code
  default), the agent discovery rule (**look where the code looks** — walk the
  resolver before declaring a value missing), and the one-question hardcode test
  for any diff.
- **Cómo:** doc by reference. L3 binding names the concrete stores per layer,
  the admin surfaces that manage them, product value categories, and any
  mechanical enforcement (secret/URL literal scanners).
- **Verificar:** a recent diff with a tunable value resolves it through the
  declared layers (not a literal); an agent asked about a "missing" key walked
  the resolver first; secrets absent → feature fails closed, no invented default.

### 33 — Dev tooling baseline (DEFAULT, non-blocking)

**Layer:** L1 (neutral).
**Home:** `knowledge/ai-agents/AGENTS_UNIVERSAL.md` §Dev Tooling Baseline +
`setup/EXTERNAL-TOOLS.md` (pins + install recipes) +
`doc/decisions/ADR-20260612-rtk-graphify-default-tooling.md`.

- **Qué:** a small set of dev tools the kit recommends **by default** to every
  consuming repo — provisioned as owner standard of care, **never a gate**.
  Mental model: a database index (works without it, just slower; you add it for
  the gain). Today: a **token-economy** wrapper for noisy command output and a
  **code-navigation / knowledge-graph** tool for orientation before blind grep.
  The kit ships the pins + multi-platform install recipes; privacy posture
  travels (graph output git-ignored, tool telemetry off).
- **Cómo:** doc by reference. Provision the tools per `setup/EXTERNAL-TOOLS.md`
  (optional, skippable step — a repo/agent/CI without them works fully). A repo
  MAY override with its own `EXTERNAL-TOOLS` registry; per-repo lifecycle wins,
  declared visibly. **Keep it explicitly non-blocking** — do not let it harden
  into a required gate over time.
- **Verificar:** the tools are provisioned in a dev environment (or the repo
  declared `N-A` consciously); their absence degrades but never fails a build,
  hook, or CI; `graphify-out/` (or equivalent) is git-ignored.

### 34 — State mirror & decision register (governance instruments) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-STATE-MIRROR-AND-DECISION-REGISTER-001.md`
+ `setup/templates/governance-instruments/` (the reusable L3 skeleton).

- **Qué:** the three governance instruments a repo holds across sessions —
  **present-mirror** (the whole state on one page; *mirror wins reality*; "if you
  did not update the mirror, you did not close"), **append-only log** (the
  history / why), and **decision register** (the ledger of **authority approvals**
  with who-proposed / authority / when / what / channel / evidence — distinct from
  the ADR, which is the *why of the design*; the register captures the
  *authorization event*, especially a "go ahead" given through an ephemeral
  channel). Plus the close ritual that synchronizes all three.
- **Cómo:** doc by reference. Concretizes Piece #17 §1 (repo is the only memory)
  and §8 (lesson-canonization), and Piece #20 §3 (which left the concrete
  paths/files an L3 concern). Copy `setup/templates/governance-instruments/`,
  rename to the repo's convention, bind the authority classes / channels /
  timezone / evidence conventions. Does **not** re-derive the ADR or append-only
  log *concept* (Piece #10a §5) nor the audit-finding ledger (Piece #25 §4).
- **Verificar:** the repo's present-mirror was current at last session close; an
  authority approval given this period has a register row with channel + evidence;
  the log was appended to at each substantive step. **Mechanically:** declare the
  instrument paths in `tools/governance.config.json` (see `governance.config.example.json`)
  and `check-governance.mjs` (the `governance gate`, also in `devkit-doctor`) verifies
  each declared instrument exists and is non-empty — a `null` is a conscious N-A.

### 35 — Coder safe identity (low-privilege executor + session isolation) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/ai-agents/CANON-CODER-SAFE-IDENTITY-001.md`.

- **Qué:** the asymmetric identity model that makes "all changes through a reviewed
  PR" real — the executor pushes as a **low-privilege bot** (propose-only: write +
  open PR, no merge / admin / bypass); a **separate owner** reviews and merges; the
  two **never share an active credential in one session**. Per-session identity
  binding (token in the session env, never a file), the **auth gate** (verify your
  OWN session before any push), the three identities (commit author ≠ push actor ≠
  PR author — audit the push actor), worktree↔identity binding, per-session
  permission scoping (scope the relaxation, guard even under bypass), and **PREP**
  (launch setup as a skill, not a role).
- **Cómo:** doc by reference. Adds the identity binding to Piece #23 (§7), the
  identity check to Piece #22's preflight (§5), rides on Piece #32 for the
  per-session credential (§4), feeds Piece #3's handoff via PREP (§9). L3 binds the
  concrete bot account + branch-protection settings, the credential env-var, and the
  forge's auth/audit commands. Pairs with `setup/RUNBOOK-LAUNCH-CODERS.md`.
- **Verificar:** the default branch is protected; the bot account is write-not-admin;
  a recent push's **actor** (not just commit author) was the bot; launch scripts
  expect the token in the env (never contain it).

### 36 — Coder orchestration (run autonomous without stalling, without crossing the gates) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/ai-agents/CANON-CODER-ORCHESTRATION-001.md`
+ `setup/RUNBOOK-LAUNCH-CODERS.md` (the developer-facing how-to).

- **Qué:** how an autonomous executor runs a long session **without stalling on a
  permission prompt** and **without crossing the gates** — the insight that the
  prompt fires on **matchability, not danger** (a command that can't be prefix-
  matched prompts regardless of safety); the **two levers** (the prompt teaches
  matchable commands + the allowlist covers the routine); the **trigger→fix table**
  (each anti-pattern paired with its clean form: `cd &&` → `-C`, `$VAR` → literal,
  status-echo → omit, heredoc/pipe → file, glob-like tokens → commit-from-file…);
  the **gates never allowlisted** (identity / destruction / secrets); the **design
  gate** (boundary work stops to present design; mechanical work runs autonomously);
  and **wave shape** (sequential vs fan-out).
- **Cómo:** doc by reference. Builds on Piece #35 (identity / PREP / permission
  *policy* §8 — referenced, not restated), Piece #3 (the dance + exit states),
  Piece #23 (worktree + `git -C`), Piece #22 (all-via-PR), Piece #34 (the
  instruments the executor reports to). Consolidates the sealed command-hygiene
  findings (F1–F9). L3 binds the concrete allowlist, the prompt, and which spec
  classes are boundary vs mechanical.
- **Verificar:** a recent executor session ran with an allowlist scoped to the
  session (not global, not committed); identity/destruction/secrets stayed
  prompted; a boundary spec presented its design before sensitive code; the
  executor opened a draft PR and did not self-merge.

### 37 — Change-path & decision classes (which path a change takes, whose approval) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-CHANGE-PATH-AND-DECISION-CLASSES-001.md`.

- **Qué:** the two orthogonal questions every change answers before work starts —
  **which path** (process depth): **direct** (trivial + reversible + no contract) /
  **spec-first** (a unit with a contract) / **design-gate** (boundary work —
  identity / access / security / sensitive data — presents its design before the
  sensitive code), with the explicit **cut** (top-down, first match wins); and
  **whose approval** (decision class): **authority-sealed** (boundary / security /
  sensitive-data / spend / public / **canon itself**) / **delegated-with-record**
  (internal, via ADR) / **autonomous** (mechanical within a unit). Plus how
  path × class compose and the contradiction guard.
- **Cómo:** doc by reference. Adds the **decision rule** on top of Piece #10a §4
  (which owns the pipeline layers); generalizes Piece #36 §8's design gate to any
  contributor as one path; routes verification to Piece #26; names the authority
  **classes** Piece #17 says the authority owns; registers approvals via Piece #34
  §6. L3 binds the concrete class list, who the authority is per class, and the
  path-cut thresholds.
- **Verificar:** a recent boundary-touching change took the design-gate path and
  carries an authority-sealed approval (register row); a trivial fix went direct
  with no spec ceremony; the repo's root rules declare its class→authority binding
  and its path cut (no silent default). **Mechanically:** the `decisionClasses` path
  in `tools/governance.config.json` must point at a real, non-empty binding —
  `check-governance.mjs` fails if it is missing (the "no silent default" rule, gated).

### 38 — DB security baseline (exposed Postgres/Supabase security floor) (engine-specific L1)

**Layer:** L1 (neutral) — but **engine-gated**: adoptable only by repos whose data plane is Postgres exposed over PostgREST/Supabase. Non-Postgres repos mark `N-A(non-postgres)`.
**Home:** `knowledge/methodology/CANON-DB-SECURITY-BASELINE-001.md`.

- **Qué:** the closures that must be true before a Postgres schema reachable by
  `anon`/`authenticated` is safe to expose — deny is a thing you *do*, per object,
  and *verify*. SECDEF functions not anon-executable (§2); **revoke from `PUBLIC`,
  not just the roles** — the silent no-op (§3); no `USING(true)` anon write (§4);
  `search_path` pinned (§5); extensions out of `public` (§6); no matviews/buckets
  exposed to anon (§7); the **Supabase advisor as the CI/pre-cutover gate** so the
  warning classes can't regrow (§8); catalog-driven + idempotent + self-testing
  migration discipline (§9); shared-schema fix-ownership boundary (§10).
- **Cómo:** doc by reference; engine-specific (its mechanisms are Postgres + PostgREST
  properties, not generalizable). Companion to Piece #30 (production-safety governs
  the shipped *artifact*; this governs the exposed *database*). Lifted from ViTo's
  W3–W7 advisor convergence — the §3 `PUBLIC`-grant discovery and §9 self-test
  discipline are battle-proven (the self-test caught a silent no-op against cloud).
- **Verificar:** the Supabase Security Advisor is wired as a CI/pre-cutover gate
  (green = 0 security warnings or documented exceptions); a recent DB-security
  migration is catalog-driven, idempotent, and ends in a self-test that rolls back
  on unmet invariant; no SECDEF function in the exposed schema is anon-executable
  except a documented allowlist entry.

### 39 — Human-surface legibility (verdict first, depth on demand) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-HUMAN-SURFACE-LEGIBILITY-001.md`.

- **Qué:** every human-facing surface (CLI output, dashboard/UI health, status report,
  log, API health endpoint, agent→human message) **leads with the decision layer** —
  verdict first, one line per item, the fix for each red, **depth on demand**, no
  silent gaps (what was skipped is stated). The named anti-pattern: **verbose-but-mute**
  — a wall the human must read end-to-end to learn the one thing that matters. The cure
  is inverting the order (verdict on top), not adding a summary at the bottom.
- **Cómo:** doc by reference. Generalizes the **compass** (Piece #3 / `CANON-MULTI-AGENT-
  ORCHESTRATION` §5.1) from agent→human *messages* to **any** surface; sibling to Piece
  #25 (audit = *does it lie?*; this = *can a human read the verdict in one glance?*).
  Reference instances: the compass (messages) + `tools/devkit-doctor.mjs` (CLI). L3
  binds the concrete depth-on-demand mechanism (`--verbose`, a UI toggle), the verdict
  vocabulary, and the styling.
- **Verificar:** a recent human-facing surface (a health view, a CLI, a report) states
  its verdict in the first glance and puts detail behind a flag/toggle; a red names the
  fix, not just "FAILED"; skipped/not-run items are shown, never silently absent.

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
| 10a | Development process (L1) | ADOPTED / ADOPTED-NATIVE / PENDING / N-A | the native binding that satisfies the L1 |
| 10b | VT-Method (L2 binding) | ADOPTED / N-A | house repo? else N-A + name your #10a binding |
| 11 | Port assignment scheme | ADOPTED / PENDING / N-A | ports registry path |
| 12 | Agent-hook engines | ADOPTED / PENDING / N-A | which engines copied |
| 13 | Naming conventions | ADOPTED / PENDING / N-A | branch/commit pattern binding |
| 14 | Visual bug triage | ADOPTED / PENDING / N-A | cache dirs + restart command |
| 15 | Testing minimum bar | ADOPTED / PENDING / N-A | in-scope dirs + framework |
| 16 | Versioning | ADOPTED / PENDING / N-A | `.versioning` binding path |
| 17 | Agent ↔ human collaboration | ADOPTED / PENDING / N-A | L3 binding path |
| 18 | Scope discipline | ADOPTED / PENDING / N-A | verticals/horizontals table |
| 19 | Skills over roles | ADOPTED / ADOPTED-NATIVE / PENDING / N-A | skills-root + eval-set location |
| 20 | Context hygiene | ADOPTED / PENDING / N-A | persistence paths |
| 21 | DEV-MODE discipline | ADOPTED / PENDING / N-A | go-live state + gate set |
| 22 | Git hygiene | ADOPTED / PENDING / N-A | preflight script + PR tooling |
| 23 | Branch & worktree lifecycle | ADOPTED / PENDING / N-A | worktree root + pre-commit hook |
| 24 | Architecture review | ADOPTED / PENDING / N-A | anti-frames + governing first-reads |
| 25 | Audit protocol | ADOPTED / PENDING / N-A | auditor split + escalation windows |
| 26 | Testing gate | ADOPTED / PENDING / N-A | type→tooling map |
| 27 | E2E test-user discipline | ADOPTED / PENDING / N-A | provider admin-API + gate |
| 28 | Gap report | ADOPTED / PENDING / N-A | trigger phrases + doc locations |
| 29 | Upstream protocol | ADOPTED / PENDING / N-A | inventory + discoverable index path |
| 30 | Production safety | ADOPTED / PENDING / N-A | exclusion mechanism + gate |
| 31 | Copy-parity check | ADOPTED / PENDING / N-A(no copies) | parity config path + CI job |
| 32 | Configuration discipline | ADOPTED / PENDING / N-A | stores per layer + enforcement |
| 33 | Dev tooling baseline | ADOPTED / PENDING / N-A | provisioned? + EXTERNAL-TOOLS registry |
| 34 | State mirror & decision register | ADOPTED / PENDING / N-A | mirror/log/register paths + authority classes |
| 35 | Coder safe identity | ADOPTED / PENDING / N-A(no coders) | bot account + branch protection + credential env |
| 36 | Coder orchestration | ADOPTED / PENDING / N-A(no coders) | allowlist + launch prompt + boundary/mechanical classes |
| 37 | Change-path & decision classes | ADOPTED / PENDING / N-A | class→authority binding + path-cut thresholds |
| 38 | DB security baseline (Postgres/Supabase) | ADOPTED / PENDING / N-A(non-postgres) | migrations dir + advisor/lint command + CI gate wiring |
| 39 | Human-surface legibility | ADOPTED / PENDING / N-A | depth-on-demand mechanism + verdict vocabulary per surface |

Statuses:
- **ADOPTED** — in active use; verification has run at least once.
- **ADOPTED-NATIVE** — satisfied by a repo's own equivalent rather than the kit's
  artifact (in active use); name the native binding in the Notes.
- **PENDING** — recognised, not yet wired.
- **N-A** — does not apply to this repo (e.g. a single-agent repo skipping #3, or
  a non-house repo skipping #10b and binding #10a natively).

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
- [ ] Piece #31: if the repo carries ANY copied kit runnable, its copy-parity
      config declares every copy and the CI `copy-parity` job is green (a repo
      with zero copies declares `N-A(no copies)` instead).
- [ ] Your `AGENTS.md` carries the **Per-piece adoption status** table — every
      row declared `ADOPTED`, `PENDING`, or `N-A`. **No silent skips.**
- [ ] The **Inheritance Contract** holds end-to-end: zero copied docs, L3
      bindings point up (none restates a spine), every deviation lives in an
      `## Overrides` entry or an `adapted` declaration — see
      [`INHERITANCE-CONTRACT.md`](INHERITANCE-CONTRACT.md) "Done when".
- [ ] **Step 0 done:** machine bootstrapped (runbook), git identity set,
      `.gitignore` baseline in place, workflow `uses:` pins the kit's REAL
      default branch, **data gravity declared** (or `N-A(no sensitive data)`).
- [ ] **Claims validator wired:** `tools/check-inheritance-claims.mjs` (or a
      native equivalent) runs in CI against the status doc and is green.

---

## Reading order for a fresh agent

If you are an agent landing in a consuming repo and want to understand the
inheritance from scratch, read in this order:

1. **`README.md`** of the kit — the one-paragraph framing **+ "The model in 90
   seconds"** (supra-repo · L1/L2/L3 · inherit by reference vs copy · the seal).
2. **`knowledge/START-HERE.md`** (the 2-minute door).
3. **`setup/USING-THE-KIT.md`** (the adoption on-ramp — *how to actually use it*:
   who you are → your path · fresh clone vs update · a worked example · the daily loop).
4. **`setup/INHERITANCE-CONTRACT.md`** (the heir's contract — how inheritance
   behaves: declare · never duplicate · override visibly).
5. **`setup/ADOPT-DEV-KIT.md`** (this file — what you inherit, piece by piece).
6. **`setup/ADOPT-CROSS-AGENT-GOVERNANCE.md`** (the detail for Pieces #2/#3/#4).
7. The specific canon for whichever piece you are wiring next.

---

## Maintenance

- A new agnostic piece added to the kit (canon, ADR, engine) **must add a
  corresponding section here** in the same PR. Adding a piece without adopting
  it into this index is the failure class this file exists to prevent.
  **Mechanically enforced** since 2026-06-11 by `tools/check-catalog-sync.mjs`
  (the `catalog-sync` CI job): a spine in `knowledge/` with no piece here — and
  no declared exemption with a reason — goes RED. The same gate enforces the
  controlled Status vocabulary on spine headers (new spines conform on arrival;
  sealed headers are not cosmetically rewritten).
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

**Update 2026-06-07 (catalog ↔ spine reconciliation).** A second-consumer
adoption audit surfaced that the index had drifted from the sealed-spine
inventory: ~13 spines had been sealed in the lift sweep **without** adding their
adoption section here — the exact failure class the Maintenance rule forbids.
This update closes the loop: **14 pieces added** (#17–#30 — agent-collaboration,
scope-discipline, skills-over-roles, context-hygiene, dev-mode-discipline,
git-hygiene, branch-worktree-lifecycle, architecture-review, audit-protocol,
testing-gate, e2e-test-user-discipline, gap-report, upstream-protocol,
production-safety; git-hygiene was a 14th uncatalogued spine the audit's list of
13 had folded into Piece #4), each as its own piece after a coverage-check (none
folded — every one is a distinct object its siblings explicitly separate it
from). Piece **#10 split into #10a (L1 `CANON-DEVELOPMENT-PROCESS`, universal) +
#10b (L2 VT-Method, house-only)** per `ADR-20260524-vt-method-methodology-layering`,
so a non-house consumer can adopt the neutral L1 natively without being forced to
mark the whole piece N-A. The per-piece adoption table (previously truncated at
#12) was extended to all pieces, and the `ADOPTED-NATIVE` status added. Existing
piece numbers #1–#16 were preserved (no renumber). Surfaced by the second-consumer
adoption audit; reconciled lift-side.

**Update 2026-06-15 (seal — governance instruments + coder orchestration).** Sealed
by the Principal Architect from a vertical's elevation handoff: **3 pieces added**
(#34 state-mirror-and-decision-register, #35 coder-safe-identity, #36
coder-orchestration), each its own piece after a coverage-check (none folded —
#34 instruments Pieces #17/#20 without re-deriving the ADR of #10a; #35 owns the
identity model the orchestration spine #3 lacked; #36 owns the command-hygiene
craft + design gate, consolidating the sealed command-hygiene findings F1–F9 and
referencing #35's permission *policy* rather than restating it). #35 was authored
in flight (its proposed registration deferred to this seal). The per-piece adoption
table extended to #36; `N-A(no coders)` added for repos that launch no executors.

**Update 2026-06-15 (seal — change-path & decision classes).** Sealed by the
Principal Architect to close the gate-decision gap heirs hit after the governance
seal: **1 piece added** (#37 change-path-and-decision-classes), after a
coverage-check (none folded — it adds the *decision rule* on top of Piece #10a §4's
pipeline layers, generalizes Piece #36 §8's design gate to any contributor as one
path, and names the authority *classes* Piece #17 owns — a consuming repo's L3
decision-class model lifted to agnostic canon so a new heir inherits it). The
per-piece adoption table extended to #37.

**Update 2026-06-15 (seal — DB security baseline, Postgres/Supabase).** Sealed by
the Principal Architect from ViTo's W3–W7 advisor convergence: **1 piece added**
(#38 db-security-baseline), after a coverage-check (none folded — Piece #30
production-safety governs the shipped *artifact*; this owns the exposed
*database*, a distinct surface). Deliberately **engine-specific** (Postgres +
PostgREST/Supabase) at Marcelo's direction — its mechanisms (`PUBLIC` execute
grant, RLS, `search_path`, the anon/authenticated/service_role model, the
Supabase advisor) do not generalize to other engines, so non-Postgres repos mark
it `N-A(non-postgres)` rather than inheriting it verbatim. Carries the
`PUBLIC`-grant silent-no-op discovery (§3) and the self-testing-migration
discipline (§9) as battle-proven rules, and names the **Supabase advisor as the
CI/pre-cutover gate** (§8) so the warning classes cannot regrow. The per-piece
adoption table extended to #38. Companion sharpening in the same seal: a
cross-repo-handoff discovery rule added to `CANON-MULTI-AGENT-ORCHESTRATION` §2 (a
comm left in the sender's own branch is invisible to the recipient; route it to
the recipient repo's lane).

**Update 2026-06-15 (seal — human-surface legibility).** Sealed by the Principal
Architect: **1 piece added** (#39 human-surface-legibility), after a coverage-check
(none folded — it **generalizes** the compass `CANON-MULTI-AGENT-ORCHESTRATION` §5.1
from agent→human *messages* to *any* human-facing surface, and is a sibling of Piece
#25 audit: that asks *does it lie?*, this asks *can a human read the verdict in one
glance?*). Born from a verbose-but-mute health screen; reference instances are the
compass (messages) and `tools/devkit-doctor.mjs` (CLI). The per-piece adoption table
extended to #39, and the compass §5.1 now carries a back-reference to this surface law.

**Update 2026-06-15 (governance gate — making #34/#37 bite).** Pieces #34 and #37 were
canon-as-prose with no mechanical enforcement (the honest gap from the self-audit). Added
**`tools/check-governance.mjs`** + `governance.config.example.json`: a config-driven gate
that verifies declared governance instruments (mirror/log/register) exist and are
non-empty, and that the decision-class binding is declared (the "no silent default" rule
of #37). Deliberately non-bureaucratic — config-driven (paths are L3), `null` = conscious
N-A, no config = the gate does not apply (the doctor skips it). Wired into `devkit-doctor`
(now a gate it runs) and the engine-tests CI job, with `tools/check-governance.test.mjs`.
The kit dogfoods it (`tools/governance.config.json`: CHANGELOG as the log, the
DECISION-REGISTER as register + class binding, present-mirror N-A as a library).
