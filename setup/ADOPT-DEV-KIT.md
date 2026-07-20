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
| **Mount** (the inherited kit checkout) | an **isolated, link-free clone** (own `.git`), referenced by path — never a `.vibethink-core` junction/symlink (D-066: the junction-follow-delete wipe-risk) | a stale/absent clone is surfaced by `devkit-doctor` (WARN, §8.8), so correctness never silently depends on it |

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

## Step 0 — the machine (before everything; heir finding A-1/A-6/A-7, a consuming product 2026-06-12)

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
  If an agent cannot load the inherited file wholesale, it must use focused
  reads/search/ranges and still extract the critical sections: Dev Tooling
  Baseline; NO BRAIN, NO WORK; Duty to Flag; inheritance/layering; and tool
  availability/reporting. Size limit is not a skip. Missing/inaccessible
  inherited brain is a stop condition.

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
  (human-decides + paste-able agent block). It also defines multi-model routing:
  role, adapter, model, auth mode, capability, gates, evidence, review policy,
  and human approval stay separate before launching subagents on different models.
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
  - **Multi-model routing discipline (§3.2):** if the repo launches subagents on
    multiple model/runtime routes, bind the local adapter using
    `setup/templates/multi-model-routing/`; do not collapse the route to a model
    name.
- **Verificar:**
  - `node scripts/inbox.mjs <agent>` shows your open items.
  - A test comm round-trips: send → recipient inbox surfaces it → close → inbox
    drops it.
  - Schema v2 self-check: pick a recent comm; confirm `to_agent` is a **base
    token** (not `codex-rev`), front-matter is flat (no nested `ref:` map), and
    the file's first non-whitespace line is `---`.
  - A recent multi-model/subagent launch carries the `ROUTE`, `GATES`, `EVIDENCE`,
    and `REVIEW` lines required by §3.2.

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
  - **Lifecycle artifacts (§5) + findings (§6) — enforcement shipped by the kit**
    (so the artifact set bites for every heir, not just by convention). Copy
    `setup/templates/feature-docs/` (requirements · readiness-plan-with-security ·
    roadmap · append-only log · per-unit changelog · finding — plus a README
    *discoverability map* that points at which canon governs each part, including the
    versioning rules), rename to your filenames (L3), and declare them in
    `tools/feature-docs.config.json`. The kit's `tools/check-feature-docs.mjs` then
    verifies every declared unit carries each required artifact (existing + non-empty)
    and the findings location exists; **`devkit-doctor` runs it automatically** —
    config-driven: no config → skipped, declared → gated, `null` = conscious N-A. The
    gate guarantees the artifact is *present* (the precondition for review); a reviewer
    judges its content.
- **Verificar:** a recent non-trivial change shows the gate verdict (the decision
  to proceed was governed, not implicit) and the authority hierarchy held (no code
  overrode a sealed canon). The native binding that satisfies the L1 is named in
  your `AGENTS.md`.
  - **`devkit-doctor` shows the `feature documentation` gate green** (every declared
    unit carries its artifacts) — or the repo consciously declares the section `N-A`.

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

- **Qué:** the 5-type artifact model — **code packages** (SemVer 2.0 + Changesets), **deployed apps** (CalVer or SemVer with `/healthz` version exposure), **canon docs** (sequential NNN + lifecycle DRAFT→PROPOSED→ACCEPTED→SEALED→AMENDED→SUPERSEDED-BY|DEPRECATED), **ADRs** (immutable filename `ADR-YYYYMMDD-slug` + status transitions PROPOSED→ACCEPTED→SUPERSEDED-BY|DEPRECATED, body immutable after ACCEPTED), **tools/scripts** (SemVer-lite `MAJOR.MINOR`). Universal driver: Conventional Commits with mandatory `!` for breaking changes. The decision gate also carries the mandatory pre-implementation `VERSIONING: ...` verdict (§10.1).
- **Cómo:**
  - Docs by reference — your `AGENTS.md` points to the canon.
  - Per-repo binding declared in a single file (e.g. `.versioning.yaml`) with: packages model + manager, apps model + pattern, canons numbering + approver, ADRs folder + pattern + immutability flag, tools model, and `impact_gate` statuses.
  - **Tools/scripts — enforcement shipped by the kit (so this norm bites for every heir, not just the kit).** Declare a `tools/versions.json` manifest (the kit's own is the worked example) listing every wired runnable (`tools/`+`setup/`: `.mjs`/`.sh`/`.ps1`) at `MAJOR.MINOR`. The kit's `tools/check-tool-versions.mjs` then verifies every runnable is declared (and no stale/malformed entry), and **`devkit-doctor` runs it automatically** — config-driven: a repo with no manifest is skipped (declare `N-A` if it has no custom runnables), one with a manifest is gated. Run from the mount; nothing copied.
  - **Versioning Impact — enforcement shipped by the kit.** `tools/check-versioning.mjs` verifies that `tools/versioning.config.json` declares the mandatory `impactGate` vocabulary. The concrete task/PR classifier is L3; the canonical statuses are L1.
  - Optional CI enforcement for the other types: `commitlint`, changeset bot, canon header validation, ADR immutability gate, changelog mandatory, health-endpoint version check. (Canon-doc lifecycle vocabulary is already gated by `catalog-sync` here.)
- **Verificar:**
  - The per-repo binding file exists and declares each artifact type's model.
  - A recent task/PR has exactly one pre-implementation line:
    `VERSIONING: <status> — authority=<binding>; evidence=<paths/surfaces>; required=<artifact-or-reason>`.
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
  - **Boundary — copy-parity is for small, dependency-FREE canonical runnables.** A
    **shared runtime package** (versioned, with its own deps, consumed by ≥2 repos) is
    **not** copy-parity'd — it is published to an org-scoped package registry and consumed
    as a versioned dependency (`ADR-20260619-shared-runtime-package-distribution`). Deps +
    versioned → registry; dep-free small canonical file → copy-parity.
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
  the shipped *artifact*; this governs the exposed *database*). Lifted from a consuming product's
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

### 40 — Runtime policy engine (ALLOW/ASK/DENY interception) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/ai-agents/CANON-RUNTIME-POLICY-ENGINE-001.md`.

- **Qué:** governance by **runtime interception** — a policy engine evaluates each agent
  action at typed **enforcement points** (request / pre-model / tool-call / tool-result)
  and returns **ALLOW / ASK / DENY**, composed across policies (**DENY** short-circuits ·
  **ASK** accumulates + withholds writes until approval · **ALLOW** continues), carrying
  **session state** (counters, risk score, cost), with **stacking precedence**
  (session > agent-spec > server) and **fail-closed** defaults. Names a reusable **pattern
  menu** (cost/tier downgrade-gate, tier routing, risk-score, working-dir, sandbox,
  rate-limit, sensitive-content) + worked examples (§11). The **runtime, stateful sibling**
  of the static allow/deny (Piece #36, coder-orchestration) — shares its airtight floor,
  never dissolves it.
- **Cómo:**
  - Doc **by reference** — your `AGENTS.md` points to the canon.
  - **The engine is L3.** The kit names only the *contract* (enforcement points, the verdict
    set, composition + precedence, fail-closed, the state model, the pattern menu) and the
    worked examples. Each consuming product **builds the engine in code** against the
    contract, **on its own pain** — the kit ships **no runtime**.
  - Gate on **tier/capability, never a vendor model id** (fire-test).
- **Verificar:**
  - In a product that has built an engine: a broken policy **denies** (fail-closed, not
    fail-open); a declined/timed-out ASK leaves **no side effects**; the static-deny floor
    (#36 §7 — identity/destruction/secrets/arbitrary-exec) is never let through by the engine.
  - The canon names the contract with **no product/vendor/model name** (fire-test).

---

### 41 — Port assignment (declare-your-ports-not-which + fail-closed gate) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-PORT-ASSIGNMENT-001.md`.

- **Qué:** the instance declares its ports **canonically** (single source of truth · complete
  for what deploys · collision-free · no shared default); the kit mandates **THAT** you declare,
  **never WHICH**. **No canonical declaration → the deploy is refused** (fail-closed §3). The
  concrete numbers/ranges (and any cross-system band map) are L2/L3, never this neutral core.
- **Cómo:**
  - Doc **by reference** — your `AGENTS.md` points to the canon.
  - **Template (recommended, not mandated):** `setup/templates/ports/` — a `ports.json`
    manifest + README; an instance MAY use a `custom` form that satisfies §2.
  - **Gate:** copy `tools/check-ports.mjs` (+ `tools/ports.config.json`) and wire it
    **fail-closed** into your deploy / CI / launch path — present+valid → proceed, absent →
    refuse. Also runs on `devkit-doctor`.
- **Verificar:**
  - `deploys:true` with no canonical declaration → the gate **refuses** (exit 1); the
    recommended form also rejects two services sharing a port; `deploys:false` → conscious N-A.
  - The canon names no product/vendor/number (fire-test); the numbers live only in the L2/L3 binding.

---

### 42 — Identifier-language gate (the mechanism for §8, surface-complete) (universal L1)

**Layer:** L1 (neutral).
**Home:** `tools/check-identifier-language.mjs` + `setup/templates/identifier-language/`.
**Authority:** `knowledge/methodology/CANON-NAMING-CONVENTIONS-001.md` §8 + `CANON-AUDIT-PROTOCOL` §8.6.

- **Qué:** the **mechanism** for the already-sealed §8 rule (identifiers in one declared
  language) — a **vocabulary-allowlist** gate, not a forbidden-word denylist (freeze-at-N).
  Every identifier token must be a **consciously-admitted** vocabulary entry; a leak in
  another language is a token nobody admitted → it fails. **Surface-complete** (§8.6): scans
  every declared surface — schema DDL · route/URL slugs · feature/dir names — not just one.
  Self-maintaining (grows by reviewed PR `--seed` + diff review).
- **Cómo:**
  - **Engine is agnostic** — copy `tools/check-identifier-language.mjs`; it knows no product,
    language, or layout. Every locale/layout fact is **per-repo binding** in
    `tools/identifier-language.config.json` (declared language · schema dirs · slug surfaces ·
    column types · vocabulary · exceptions). Template + README: `setup/templates/identifier-language/`.
  - **Bootstrap:** `node tools/check-identifier-language.mjs --seed` regenerates `allow` from
    your surfaces — **review the diff** (a non-declared-language token is a leak: RENAME, don't admit).
  - **Wire** it in CI / pre-push; also runs on `devkit-doctor` (skip-when-no-config).
- **Verificar:**
  - An un-admitted token (schema **or** slug surface) → the gate fails (exit 1); a config with
    zero declared surfaces → setup error (no silent-zero, §8.6); `--seed` writes the vocabulary.
  - The engine names no product/vendor/language/layout (fire-test); all of that is the binding.

---

### 43 — Data-change audit (who/what/when, full history, generic trail) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-DATA-CHANGE-AUDIT-001.md`.

- **Qué:** every system must answer **WHO** changed an operational datum, **WHAT** (old → new),
  and **WHEN** — **full history**, not the last touch. Via a **generic change-capture audit-trail**
  (one append-only log + a capture mechanism), **never per-table `updated_by`/`updated_at` columns**
  (level-0: last-touch only, lossy, inconsistent). Row-lifecycle timestamps stay orthogonal (they
  are *not* the trail). Scope = operational tables (business · PII · official · money · consent);
  exclude static config, read-only legacy, high-frequency telemetry. The "who" is a **real
  authenticated identity**; the trail is **governance-only**, never client-facing.
- **Cómo:**
  - Doc **by reference** — your `AGENTS.md` points to the canon.
  - **Mechanism is L3** — the kit mandates the *capability + generic shape*; you build it in your
    stack (trigger + single audit table · event log · CDC · temporal tables). Declare the audited
    table set, the identity source, and who may read the trail.
- **Verificar:**
  - For an audited table: an UPDATE is reconstructable as who/old→new/when from the trail (not just
    the latest row); a shared-service write does not erase the actor; the trail is not reachable from
    a client/tenant surface.
  - The canon names no engine as *the* mechanism (fire-test); concrete engines are illustration only.

---

### 44 — Data-protection legal compliance (retention · consent · cookies · data-subject rights) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-DATA-LEGAL-COMPLIANCE-001.md`.

- **Qué:** every system handling **personal data** must honour its data-protection obligations as a
  governed capability — **retention** by data type (archive past the window, **never** hard-delete),
  **recorded + withdrawable consent / lawful basis**, **consented cookies/tracking**, **data-subject
  rights** (access · rectification · erasure / right-to-be-forgotten · portability · objection), and a
  **declared applicable jurisdiction**. The **mechanics** are universal; the **laws, jurisdictions, and
  numbers are L3** (GDPR / Habeas Data / LGPD / CCPA = illustration only — the canon holds no number).
  Binds with Piece #43: the audit-trail itself is subject to this retention, and a legally-required
  erasure is the one governed exception to "never delete".
- **Cómo:**
  - Doc **by reference** — your `AGENTS.md` points to the canon.
  - **All numbers + laws are your L3 binding:** declare your jurisdiction(s), the retention window per
    data class + archive destination, the consent/withdrawal mechanism, the cookie categories + consent
    surface, and the data-subject-request intake + fulfilment path (incl. erasure reaching the trail).
  - A product-specific consent/capture canon is an **L3 binding** that points here for the agnostic
    mechanics — it does not replace this neutral core.
- **Verificar:**
  - A data-subject erasure can be fulfilled (incl. the audit-trail where legally due); past the
    retention window data is **archived, not destroyed**; non-essential tracking does not run without
    the required consent; each tenant/system has a declared governing jurisdiction.
  - The canon names no law/jurisdiction as *the* law (fire-test); all of that is the L3 binding.

---

### 45 — Documentation-artifact standards (one standard per artifact, bound to SOTA) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-DOCUMENTATION-ARTIFACT-STANDARDS-001.md` + `setup/templates/`.

- **Qué:** one standard per documentation artifact, each **bound to the recognized external standard a
  developer already knows** — don't invent. RFC/RFD · **MADR** (ADR) · PRD · SDD/SpecKit · `now/next/later`
  Roadmap · **Keep a Changelog** · SemVer + Conventional Commits · **Google SRE PRR** · blameless
  Postmortem · SRE Runbook · **Diátaxis** (the meta-taxonomy for `docs/`) · **C4 / arc42**. Supersedes:
  **PRDI → PRR**, **ADR → MADR**; **the work-journal (`BITACORA`/`LOG`) is removed** (folded into
  Changelog + ADR + git — no SOTA, no dev "already knows" it). House-legitimate (no SOTA): Roadmap, UPSTREAM.
- **Cómo:**
  - Doc **by reference** — your `AGENTS.md` points to the canon.
  - **Templates shipped:** `setup/templates/{adr (MADR), rfc, prr, postmortem, runbook, diataxis,
    architecture}` (+ existing changelog/versioning/feature-docs). Copy what you produce; bind the same
    names across consumers.
  - **Re-bind:** unify your divergences (ADR naming → MADR; docs root; decisions home; drop any
    `BITACORA`/`LOG`). Per-repo locations are L3.
- **Verificar:**
  - Each artifact you produce maps to a row in §2 and uses the shipped template / bound standard; no
    `BITACORA`/`LOG` work-journal remains; an ADR follows MADR; a prod ship has a PRR with a rollback section.
  - The canon names no product/vendor/house-format as a standard (fire-test) — only public external standards.

### 46 — Launch your first coder (the dispatch on-ramp) (universal L1)

**Layer:** L1 (neutral).
**Home:** `setup/RUNBOOK-LAUNCH-CODERS.md` + `setup/templates/coder-prompt/` +
`setup/templates/coder-launch-readiness/` + `setup/templates/goal/` +
`knowledge/methodology/CANON-CHANGE-PATH-AND-DECISION-CLASSES-001.md` §3.1.

- **Qué:** the **on-ramp** that turns the coder-dispatch machinery (Pieces #35/#36) from
  tribal knowledge into something a repo can stand up from the index. It closes the two
  facets a consumer hit live: **F1 — no routing** (the decision gate decided methodology
  but nothing routed "if a bot-coder runs this, dispatch via the runbook"; §3.1 is now
  the routing link) and **F2 — no readiness check** (an agent could not self-verify "is
  my launch-surface ready?" so it punted the infra to the human, who became the per-repo
  verifier). It bundles: the **routing** (§3.1, the gate's third output: executor +
  dispatch), the **prompt template** (the previously-implicit CONTEXT/MODEL/PIECES/STEP-0
  IDENTITY/READ-IN-ORDER/HARD-RULES/DESIGN-GATE/DO-NOT structure), and the **readiness
  check** (the portable half of the §8.7 split; the live forge state stays L3).
- **Cómo:**
  - **Read the runbook** `RUNBOOK-LAUNCH-CODERS.md` (§0 mental model → §3 launch anatomy →
    §9 worked example). Stand up the prerequisites (§1): a low-priv bot, a protected
    default branch, a per-session credential.
  - **Copy the prompt template** `setup/templates/coder-prompt/prompt-base.template.txt`
    → your launch dir; make a `prompt-<spec-id>.txt` per boundary spec.
  - **Copy the readiness config** `setup/templates/coder-launch-readiness/` →
    `tools/coder-launch-readiness.config.json`; point it at your launch script,
    per-session settings, and bot-token env-var name. `devkit-doctor` then shows the
    **coder launch readiness** line (skip = conscious N-A for a repo that does not launch
    coders).
  - **Fill the 8-field goal per dispatch** (`setup/templates/goal/GOAL-TEMPLATE.md`) —
    objective/scope/done/borders/vocabulary/reuse/guardrails/mode. Rule #0: fully defined,
    or no dispatch; run its two-axis readiness check (definition + size) before launching.
  - **Route from the gate:** your root rules cite `CHANGE-PATH-…` §3.1 — the decision gate
    names the executor and, for a coder, points at this on-ramp. The live forge state
    (bot is low-priv, branch protected) stays your L3 confirmation (`…SAFE-IDENTITY-001` §3).
    - **Keep the root cite a terse POINTER (lean-root).** When the root rules file is near the
      cross-agent layering byte budget (`CANON-CROSS-AGENT-CONTEXT-LAYERING` §2/§6), a verbose
      cite trips the root-budget smoke. Cite the rule in **one line** and put the detail in the
      launch dir — the root points, it does not carry the dispatch how-to.
- **Verificar:**
  - `node <kit>/tools/check-coder-launch-readiness.mjs tools/coder-launch-readiness.config.json`
    → `GREEN — coder launch-surface READY` (or names the missing artifact).
  - A recent coder dispatch was **routed by the gate** (the decision named the executor),
    used the prompt template, and the agent **self-verified readiness** instead of asking
    the human to check the infra.
  - A recent dispatch carried a **filled 8-field goal** (or the repo declared where its
    filled goals live — the goal→executor wiring is an L3 bind of the goal template).

---

### 47 — System migration discipline (legacy → new: provenance · as-built playbook · cutover · governed apply) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-SYSTEM-MIGRATION-DISCIPLINE-001.md`.

- **Qué:** moving a **legacy system → a new one** (data + schema) is a governed discipline, not an
  ad-hoc load — the operational shape of the recognized standard (expand–contract · schema-migration
  + backfill · cutover-runbook · ETL data-provenance). Four primitives: **(1) provenance tagging** —
  every new schema element declares an origin class `DERIVED` / `GREENFIELD` / `SEED` (gate: *nothing
  without provenance*); **(2) as-built MIGRATION-PLAYBOOK** — one doc per destination, one row per
  schema change (what · origin · formula/backfill · cutover gotchas), updated in the *same* PR;
  **(3) cutover-readiness** — `written → verify (positive + NEGATIVE) → apply` with explicit
  dependency order; **(4) governed apply + record** — hydrated admin cred (never the app runtime cred,
  never in repo) → surgical per-migration applier (tx + self-test) → apply-ledger (what/when/who/result).
- **Cómo:**
  - Doc **by reference** — your `AGENTS.md` points to the canon.
  - **Mechanism is L3** — declare your playbook (location + row format) and how the origin tag is
    recorded, the legacy source system(s), the ETL/loader + formula source for `DERIVED`, the
    credential-hydration path, the apply-ledger format, and the positive/negative verify harness.
  - **Boundary to honour:** the §6 apply-ledger is **not** the runtime data-change trail of
    `CANON-DATA-CHANGE-AUDIT-001` (whose §10.2 excludes migration ledgers) — keep both.
- **Verificar:**
  - No new schema element exists without an origin class; a `DERIVED` element carries its formula.
  - The playbook has a row for each schema change (no silent gap); rows landed in the change's own PR.
  - An apply left a record (what/when/who/result) and was preceded by a negative verify, in order.
  - The canon names no engine as *the* mechanism (fire-test); concrete engines are illustration only.

---

### 48 — UI preference persistence (personal view-state client-side) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-UI-PREFERENCE-PERSISTENCE-001.md`.

- **Qué:** a per-user, cosmetic, disposable UI preference (filter default, panel open/closed,
  view density, last-selected tab, sort direction) is client-side state, not governed
  configuration and not code. The boundary test is simple: if the next person's wrong value
  would need audit/admin/explanation, it is governed configuration; otherwise it is personal
  browser state.
- **Cómo:**
  - Doc **by reference** — your `AGENTS.md` points to the canon.
  - **Mechanism is L3** — declare the concrete client store/helper, namespace or cookie prefix,
    bounded lifetime, post-hydration read pattern, and the catalog of preferences that qualify.
  - Do not restate the principle in product docs; bind the local storage mechanism to the canon.
- **Verificar:**
  - UI preference values are persisted in client-side state (cookie or equivalent), not in the
    governed configuration/settings store.
  - The client reads preferences post-hydration; the server render uses the system default.
  - Preference namespaces are neutral and do not leak a product/vendor brand into sibling systems.
  - Any scanner/lint or code review checks flag personal view-state written to governed config.

---

### 49 — KDD / Knowledge-native VT-METHOD (Accepted Knowledge Baseline before product-shaping specs) (L1/L2 bridge)

**Layer:** L1 pattern + L2 VibeThink binding.
**Home:** `knowledge/methodology/CANON-KNOWLEDGE-NATIVE-VT-METHOD-001.md`,
`knowledge/methodology/VT-METHOD.md`, `setup/templates/knowledge-pack/`,
`setup/templates/knowledge-memory/`, `tools/check-knowledge-pack.mjs`,
`tools/check-knowledge-memory-freshness.mjs`, `tools/kdd-refresh.mjs`.

- **Qué:** Knowledge-Driven Design sits underneath product-shaping work: validated
  knowledge comes before isolated feature requests, specs, and execution. A repo
  reconstructs scattered business/product/domain knowledge into a
  Candidate Knowledge Pack, gets human/principal validation, promotes it to an Accepted
  Knowledge Baseline, then requires future product-shaping specs to retrieve and cite that
  baseline. DevKit defines the neutral pattern and artifacts; VT-METHOD requires a declared
  Knowledge Memory Adapter. In VibeThink repos the default adapter profile is Engram
  (memory/facts/recall) + Graphify (graph/relationships/communities/semantic navigation)
  + versioned Markdown as auditable source of truth.
- **Cómo:**
  - Doc **by reference** — your `AGENTS.md` points to the canon and VT-METHOD binding.
  - Copy `setup/templates/knowledge-pack/` as the starting shape for L3 Knowledge Packs.
  - Copy `setup/templates/knowledge-memory/knowledge-memory.config.json` to
    `tools/knowledge-memory.config.json` and declare the manifest path, accepted source roots,
    adapter, required/optional index artifacts, and refresh commands.
  - Repos that use Git worktrees SHOULD keep `artifactCache.mode: git-common-dir` so a
    verified derived index can be restored across clean worktrees by manifest SHA-256.
    This is a local cache only; versioned Markdown remains the source of truth and a
    missing/corrupt cache never bypasses the freshness gate.
  - Declare `tools/knowledge-pack.config.json` from `tools/knowledge-pack.config.example.json`:
    knowledge root, feature roots, required artifacts, Knowledge Memory Adapter, trigger
    classes, and engine freshness/health checks.
  - After refreshing declared engines, run `node <kit>/tools/kdd-refresh.mjs
    tools/knowledge-memory.config.json` to write the KDD memory manifest.
  - Product knowledge stays in the consuming repo. DevKit carries no vertical-specific
    business content.
  - If the consuming repo discovers a reusable KDD gap, elevate it to DevKit first.
    Local experiments must be labelled local/temporary until DevKit defines the canon,
    template, or gate.
- **Verificar:**
  - `node <kit>/tools/check-knowledge-pack.mjs tools/knowledge-pack.config.json` is GREEN.
  - `node <kit>/tools/check-knowledge-memory-freshness.mjs
    tools/knowledge-memory.config.json` is GREEN, or loudly RED/WARN with exact stale/missing
    memory.
  - Product-shaping/complex/AI-assisted/cross-boundary/new-domain features carry a
    `Knowledge Baseline` section with an accepted pack reference and adapter citation.
  - Packs include required artifacts, local references resolve, accepted packs name a
    validator, and open questions have owner/status.
  - The KDD memory manifest fingerprint matches accepted sources; required Graphify/Engram
    artifacts exist, match the manifest, and are not older than accepted sources when configured.
  - Derived `graphify-out`, `engram-out`, and `.engram` directories are not fingerprinted
    as accepted sources, including when an engine emits one below a Knowledge Pack.
  - If Engram/Graphify are declared by the L3 adapter and stale/unavailable, local/session
    health surfaces RED/WARN; agents do not silently pretend retrieval succeeded.

---

### 50 — Agent-native surface contract (dual doors + delegation + fixtures) (universal reference)

**Layer:** L1 reference (neutral).  
**Home:** `knowledge/methodology/REFERENCE-AGENT-NATIVE-SURFACE-CONTRACT-001.md`.  
**Authority:** `knowledge/methodology/CANON-DEVELOPMENT-PROCESS.md` §8.1 and §8.2.

- **Qué:** the practical implementation shape for dual-surface capabilities:
  one capability registry, one human projection, one programmatic projection,
  a delegated actor handle, a versioned runtime envelope, shared conformance
  fixtures, a tool-provider surface, and an independent human verification
  surface. It does **not** add a new rule; it makes §8.1 buildable.
- **Cómo:**
  - Doc **by reference** — your L3 rules point to the reference when a capability
    is agent-operated or agent-facing.
  - Declare where your capability registry lives and how it projects to GUI and
    API/tool/workflow.
  - Use an opaque, short-lived, server-minted delegated actor handle instead of
    giving an agent raw user or service credentials.
  - Use a schema-validated runtime envelope and import the same fixtures in
    producer and consumer tests.
  - Keep mutation-class work governed: idempotency, provenance, dry-run/propose
    where needed, and typed errors.
- **Verificar:**
  - A recent agent-operated capability has both a GUI smoke and a programmatic
    happy path.
  - Negative tests prove auth-first and scope-first behavior.
  - The producer and consumer parse the same runtime envelope fixture.
  - A mutation-class operation records provenance and can be independently
    verified by the governing human.
  - The reference names no product, vendor, model, framework, or domain.

---

### 51 — Identity provisioning integrity (multi-source → atomic + drift-check) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/methodology/CANON-IDENTITY-PROVISIONING-INTEGRITY-001.md`.

- **Qué:** when a principal's authorization is assembled from **two or more identity/role
  sources provisioned separately**, those sources are one logical fact split across stores.
  If they diverge — a principal present/active in one and absent/inactive in another, or
  carrying a different authority level in each — that is **drift**, a security fault whose
  most dangerous direction is **lockout of a legitimate principal** when a guard is hardened
  to read the stricter source. Requires **(a) atomic provisioning** of all sources and
  **(b) a mandatory read-only drift-check** that gates any change to which source a guard
  consults and runs periodically.
- **Cómo:**
  - Doc **by reference** — your `AGENTS.md` points to the canon.
  - **Mechanism is L3** — declare the concrete sources and which guard reads which; the
    drift-check wired to real store names (per-pair, observational on an intended-complete
    pair, intent-record-bounded only on a declared-sparse direction); the role-equivalence
    mapping between the two vocabularies (or an explicit attribute-incomparable declaration);
    where provisioning happens and how atomicity is realized; the remediation authority.
  - Where the change cadence warrants, wire the drift-check as a **regression gate** so a
    guard-narrowing PR cannot merge with open drift (the `CANON-AUDIT-PROTOCOL §8.7`
    known-bad discipline applies to that gate).
  - A system with a **single** identity/role source marks this `N-A(single-identity-source)`.
- **Verificar:**
  - A change that alters which identity source a guard consults is preceded by a clean
    drift-check over the co-provisioned population; the check is observational on an
    intended-complete pair (it sees a rogue-/legacy-provisioned principal, not only the
    atomically-provisioned ones).
  - Provisioning writes all sources as one governed unit, or a governed sequence that
    verifies all sides landed and treats a partial write as a failure.
  - The canon names no store, engine, IdP, product, or vocabulary (fire-test); concrete
    tables and role enums are L3.

---

### 52 — Executable CLI catalog contract (portable command discovery + gate) (universal reference)

**Layer:** L1 reference (neutral).
**Home:** `knowledge/methodology/REFERENCE-EXECUTABLE-CLI-CATALOG-CONTRACT.md`.
**Template:** `setup/templates/cli-catalog/`.
**Gate:** `tools/check-cli-catalog-contract.mjs`.

- **Qué:** a portable JSON contract for repos that expose executable commands to
  humans, agents, local automation, or orchestration surfaces. The contract makes
  command discovery explicit: stable id, group, script, package-script alias,
  doc path, description, safety label, tags, and default args. It is a discovery
  contract, not an authority to execute.
- **Cómo:**
  - Doc **by reference** — your L3 rules point to the reference when a repo has a
    wrapper, command menu, agent-facing command surface, or generated command export.
  - Copy or reference `setup/templates/cli-catalog/cli-catalog.schema.json`.
  - Declare `tools/cli-catalog-contract.config.json` from the template. Point it at
    either a catalog JSON file or a local export command whose stdout is catalog JSON.
  - Keep every command entry tied to local docs. The safety vocabulary and actual
    command ids are L3.
- **Verificar:**
  - `node <kit>/tools/check-cli-catalog-contract.mjs tools/cli-catalog-contract.config.json`
    is GREEN.
  - If `requireDocPaths` is true, every `docPath` exists in the repo.
  - Duplicate ids, missing required fields, invalid id shape, and non-JSON export
    output go RED.
  - The reference names no product, tenant, provider, package manager, runner, or
    concrete consuming repo.

---

### 53 — UX base (interaction principles, decided once) (universal L1)

**Layer:** L1 (neutral).
**Home:** `knowledge/ui/CANON-UX-BASE-001.md`.

- **Qué:** the interaction decisions a product makes **once** instead of screen by screen —
  when a surface interrupts (inline vs modal), what it may hide, how it announces state, and the
  reuse-before-build rule. It **points at** the mature external body (usability heuristics,
  practical interface craft, accessibility) rather than paraphrasing it, and owns only the house
  rules those sources do not decide: reuse-first · inline over modal for simple edits · show over
  hide · progressive disclosure · loud active state · four declared states (loading/empty/error/
  unauthorized) · user text from the localization system, storage names never surfacing.
  **Explicitly NOT owned:** which component library, where components live, visual identity —
  those are the repo's L3 binding, and a repo with its own component-sourcing doctrine keeps it
  (this canon sits underneath as the interaction layer; the two must not restate each other).
- **Cómo:** cite it from your repo's UI rules (the scoped `AGENTS.md` that governs interface work),
  and declare the L3 side: your component catalog and its order of preference, your replaceable text
  layer, your domain vocabulary (and the storage names that must never reach the interface), plus any
  stricter house rule your product needs. **If your repo already has native UI doctrine, that is not
  a conflict** — declare `ADOPTED-NATIVE` (`INHERITANCE-CONTRACT` §2) and name where the native rules
  live. **Restatement means copying §3's rule text**; naming your concrete components, paths and
  thresholds at L3 is expected.
- **Verificar:**
  - Your UI rules file cites this canon and binds it (or declares `ADOPTED-NATIVE` pointing at the
    native doctrine) — §3's rule text is not copied.
  - **Recent surfaces** show the rules alive — one named example per behaviour is enough, they need
    not be the same screen: an edit of one-or-two fields done inline; a conflict/blocked state visible
    without opening anything; a surface declaring its states (incl. unauthorized, or `N-A(reason)`);
    no user-visible string hardcoded.
  - A new house rule added at L3 names the scar that earned it (§3's entry condition).

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
| 46 | Launch your first coder (dispatch on-ramp) | ADOPTED / PENDING / N-A(no coders) | launch script + readiness config + prompt template + §3.1 routing |
| 48 | UI preference persistence | ADOPTED / PENDING / N-A(no UI prefs) | client preference helper + namespace + hydration pattern |
| 49 | KDD / Knowledge-native VT-METHOD | ADOPTED / PENDING / N-A(no product-shaping work) | knowledge root + Knowledge Memory Adapter + baseline gate + freshness manifest |
| 50 | Agent-native surface contract | ADOPTED / ADOPTED-NATIVE / PENDING / N-A(no agent-operated capabilities) | capability registry + delegated actor handle + envelope fixtures + conformance tests |
| 51 | Identity provisioning integrity | ADOPTED / PENDING / N-A(single-identity-source) | identity sources + drift-check + guard-narrowing gate |
| 52 | Executable CLI catalog contract | ADOPTED / PENDING / N-A(no executable command surface) | catalog export + schema + contract gate + command docs |

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
runbooks for non-cross-agent pieces) and that the second-consumer
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
the Principal Architect from a consuming product's W3–W7 advisor convergence: **1 piece added**
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
