# AUDIT — Dev-Kit cleanup candidates · 2026-06-03

**Author:** Opus (claude).
**Verdict:** PASS-WITH-FINDINGS. The kit is internally consistent; **one
confirmed dead artifact** (a v1 leftover), one **inheritance-index gap**
(closed in the same PR by `setup/ADOPT-DEV-KIT.md`), and three **soft hygiene
candidates** for follow-up decisions.
**Companion:** `setup/ADOPT-DEV-KIT.md` — the meta-runbook this audit
informs.

---

## Methodology

- Full file inventory of `knowledge/`, `setup/`, `tools/`, `scripts/`, `doc/`,
  `.github/workflows/`.
- Cross-reference grep: every `.mjs` / `.ps1` / `.sh` against `package.json`
  scripts, against `README.md` and every `setup/`/`knowledge/` doc.
- **Consumer verification** in the two real consuming repos
  (`vibethink-orchestrator-main`, `vibethink-workbench`) for any tool whose
  use in the Dev-Kit was ambiguous.
- Each finding declares: **type · evidence · recommendation · owner · risk if
  deferred**.

---

## Findings

### F1 — Confirmed orphan: `tools/validate-vibethink-project.ps1`

**Type:** dead artifact.
**Evidence:**

- Grep across the entire Dev-Kit: no doc, runbook, README, workflow, or
  `package.json` script references it.
- The script body validates `.env.example` for `STACK_TYPE`,
  `STACK_ORCHESTRATION_MODE`, `GITHUB_REPO_URL`, `STACK_DOCS_METHODOLOGY` and
  checks `.agents/MANIFEST.md` — **all artifacts from the v1 "Dev Kit"
  (stack-detection CLI / generated constitutions) layer** that the kit's own
  `README.md` declares was **reaped on 2026-05-23**.
- Grep across both consumer repos: zero references.

**Recommendation:** delete. It is a v1 carryover that the 2026-05-23 reap
missed.
**Owner:** Marcelo (one-line GO).
**Risk if deferred:** misleads a future agent into thinking the kit ships a
project-validator — they may try to use it, hit dead artifacts (`STACK_TYPE`,
`.agents/MANIFEST.md`), and lose time. Low-severity but high-confusion.
**Cost to action:** ~5 min in this PR or any future cleanup PR.

### F2 — Inheritance-index gap (closed in this PR)

**Type:** structural gap.
**Evidence:**

- Until this PR, `setup/` contained **one** runbook
  (`ADOPT-CROSS-AGENT-GOVERNANCE.md`) — covering 3 of the kit's 12 agnostic
  pieces (cross-agent layering, inbox/feed, review-call checklist; plus a
  Step 6 added 2026-06-02 for the session-hygiene scan).
- The remaining 8+ pieces (canons, ADRs, runnable-by-copy engines) shipped
  with **no declared adoption path** — discoverable only by reading commits,
  the README, or by accident.
- Real evidence of the gap surfacing in practice:
  - `tools/keyword-reminder.mjs` is in active use in
    `vibethink-orchestrator-main` (copied to `scripts/hooks/`, wired in
    `.codex/hooks.json` and `.claude/settings.json`) — adopted by reading code,
    not a runbook.
  - `scripts/sync-agent-skills.mjs` is in active use in
    `vibethink-workbench` (copied to `scripts/sync-agent-skills.mjs`) —
    same pattern, same lack of catalog.
- 2026-05-25 audit (Gemini/Opus dual review) already raised this in different
  words (mount script ambiguity F4, runbook scope F3) but the audit was
  closed without a meta-runbook follow-up.

**Recommendation:** ✅ **closed in this PR** by `setup/ADOPT-DEV-KIT.md` —
the single inheritance index that catalogues all 12 pieces with the same
`Qué · Cómo · Verificar` shape and a `Per-piece adoption status` table for
consuming repos to declare.
**Owner:** Opus (this PR) + Marcelo (seal).
**Status:** done; verified the meta-runbook passes the L1 fire-test (no
product/vendor brand names except as harness shape).

### F3 — Documentation gap: agent-hook engines have no canonical adoption path

**Type:** documentation debt (specific instance of F2 that survives separately).
**Evidence:**

- `tools/keyword-reminder.mjs` — used by ViTo (real consumer), engine is
  topic-agnostic, has an `.example.json` companion → it is **deliberately
  designed** to be inherited by copy + per-repo config. But the kit's
  `README.md` does not list it, `setup/` does not mention it, no canon
  describes the UserPromptSubmit-hook pattern it implements.
- `scripts/sync-agent-skills.mjs` — same shape: used by WorkBench, no
  documentation outside three delivery comms (which are status artifacts, not
  reference docs).
- A new agent landing in the Dev-Kit cannot discover these engines without
  reading the directory listings.

**Recommendation:** ✅ partially closed in this PR — Piece #12 of
`setup/ADOPT-DEV-KIT.md` documents both engines with adoption guidance. **Open
follow-up:** consider a short canon entry per engine (in the same vein as
`PORT_ASSIGNMENT_GLOBAL.md` is a small focused canon) only **if a third
consumer emerges that needs the deeper protocol** (build-on-pain) — for now
the index entry is enough.
**Owner:** Opus (index entry done) + future maintainer (canon decision).
**Status:** partially done.

### F4 — Missing parity check for runnable-by-copy artifacts

**Type:** enforcement gap — referenced in ADR-20260524 §3.1 but **not yet
implemented**.
**Evidence:**

- `ADR-20260524-supra-repo-inheritance-mechanism` says: *"a copy without a
  drift guard silently rots. So the verbatim-copy decision names its check —
  a CI step that verifies each repo's copied runnable is byte-identical to
  the dev-kit source (modulo line endings)."*
- Today's reality:
  - ViTo has its copy of `keyword-reminder.mjs` (not parity-checked).
  - WorkBench has its copy of `sync-agent-skills.mjs` (not parity-checked).
  - Both consumers have inbox/feed/comms-send engines copied (not
    parity-checked).
- The ADR explicitly hands ownership of the parity-check implementation to
  **orchestrator TASK #2734**, which (per ViTo's lane) is still open.

**Recommendation:** out of scope for this docs-only PR. **Carry forward** as
the named follow-up: when TASK #2734 lands, document the parity-check shape
in `setup/ADOPT-CROSS-AGENT-GOVERNANCE.md` Step 4 (CI) as the **inherited
gate**, so a fresh consumer wires it from day 1 instead of from N-th day.
**Owner:** TASK #2734 (orchestrator) → Marcelo (canon binding).
**Risk if deferred:** copied runnables drift silently (CRLF/LF was caught
manually in 2026-05-25; the next drift may be content, not line endings).

### F5 — Open follow-up from 2026-05-25 Gemini audit: VT-Method ↔ L1 process duplication

**Type:** known duplication (re-flag, not a new finding).
**Evidence:**

- `knowledge/methodology/VT-METHOD.md` §43–55 contains the restaurant analogy
  + 6-step definition that overlap with
  `knowledge/methodology/CANON-DEVELOPMENT-PROCESS.md`.
- The 2026-05-25 Gemini audit raised this as its F3 ("move the restaurant
  analogy + 6-step duplication from VT-METHOD to L1").
- Status: still open. Codex's commit `57c3bef` closed audit F3+F9 around the
  decision-capture trigger, but the VT-Method duplication finding remained.

**Recommendation:** small follow-up PR — extract the 6-step definition + the
restaurant analogy to `CANON-DEVELOPMENT-PROCESS.md` as `## Example: the
6-step skeleton, told as a restaurant`, and replace the duplicated sections
in `VT-METHOD.md` with a one-line pointer. Cost: ~20 min.
**Owner:** Marcelo (one-line GO; any agent can execute).
**Risk if deferred:** low — duplication is stable and the layering ADR
already accepts it as "deliberate layering". This is a single-source-of-truth
hygiene improvement, not a correctness fix.

### F6 — Soft hygiene: review/task artifacts accumulating in `doc/` root

**Type:** organisational hygiene.
**Evidence:**

- `doc/` root contains both **stable reference artifacts** (the `INBOX-FEED-
  ROADMAP.md`) and **dated process artifacts**
  (`REVIEW-FINDINGS-2026-05-22.md`, `REVIEW-RESPONSE-2026-05-22.md`,
  `REVIEW-GEMINI-DEVKIT-AGNOSTICISM-ADOPTION-2026-05-25.md`,
  `REVIEW-OPUS-VT-METHOD-AUDIT-2026-05-25.md`,
  `TASK-OPUS-VT-METHOD-EXHAUSTIVE-AUDIT-2026-05-25.md`).
- The review artifacts are referenced from
  `REVIEW-CALL-CHECKLIST.md` as the worked example — they are **provenance,
  not noise** — so they are not orphans.

**Recommendation:** *no immediate action* — moving them to `doc/archive/`
would break the `REVIEW-CALL-CHECKLIST.md` provenance pointer. **Soft
follow-up:** as the count grows beyond ~10 dated artifacts, introduce
`doc/archive/YYYY-MM-DD-*` and update the canonical references in lockstep
(scout rule).
**Owner:** Maintainer (when threshold hits).
**Risk if deferred:** zero today; aesthetic only.

### F7 — Soft UX: `keyword-reminder.mjs` engine path discovery

**Type:** UX smell, not a bug.
**Evidence:**

- The engine looks for `keyword-reminders.json` next to itself (line 34); the
  shipped fixture is `keyword-reminders.example.json`.
- On a fresh adoption, the engine silently exits 0 (rules array unparseable)
  until the consumer creates the real `.json`. This is **deliberate** — the
  example is a template, not a default — but a fresh agent might not realise
  the engine is wired correctly.

**Recommendation:** add a one-line stderr diagnostic when the JSON is absent
(`[keyword-reminder] no keyword-reminders.json next to engine — exiting 0 (no
rules)`). Tiny diagnostic improves first-adopter UX without changing
behavior.
**Owner:** Any agent — 5-line patch.
**Risk if deferred:** zero correctness; minor first-adopter friction.

### F8 — Meta-finding: "FINDING-as-evidence vs FINDING-as-trigger" inside the kit itself

**Type:** governance pattern (meta).
**Evidence:**

- F4 above is a 9-day-old finding (`ADR-20260524 §3.1` enforcement check)
  still unimplemented.
- F5 above is an 8-day-old finding (Gemini audit F3) still unimplemented.
- F3 above describes 7+ days of agnostic engines in production use without
  catalog documentation.
- This is the same anti-pattern Marcelo named in another repo: the kit is
  good at **detecting** findings, less good at **converting findings into
  action**.

**Recommendation:** no canon change. **Behavioral instruction** for the
maintainer (this audit included): when a finding's *suggested action* falls
within standing authorization (docs-only, no canon amendment, no consumer
breakage), **execute it in the same PR** that raises the finding. F2 (the
meta-runbook gap) was raised and closed in this PR — consistent with this
rule.
**Owner:** any agent maintaining the kit.
**Risk if deferred:** the finding backlog grows; small debts accumulate into a
sweep cleanup.

---

## What this PR does vs. what it does not

**This PR (docs-only):**

- ✅ Adds `setup/ADOPT-DEV-KIT.md` — the meta-runbook closing F2.
- ✅ Adds this audit doc — provenance + follow-up list.
- ✅ Documents the agent-hook engines in Piece #12 of the meta-runbook —
  partial close of F3.
- ✅ Adds no code, no canon amendment, no deletion.

**This PR explicitly defers (separate decisions):**

- 🔴 **F1** — `tools/validate-vibethink-project.ps1` deletion (needs Marcelo's
  one-line GO; trivial to action in any follow-up PR).
- 🟡 **F4** — parity-check implementation (waits on TASK #2734).
- 🟡 **F5** — VT-Method ↔ L1 deduplication (one-line GO + a small follow-up
  PR).
- 🟢 **F6 / F7** — soft hygiene; on-demand only.

---

## Verification this audit ran

- File inventory: `Glob ** in C:/tmp/vito-wt-devkit-adopt-meta` (full repo
  walk).
- Cross-reference greps: `keyword-reminder`, `validate-vibethink-project`,
  `sync-agent-skills`, `STACK_TYPE`, `STACK_ORCHESTRATION_MODE` against the
  Dev-Kit, the orchestrator, and WorkBench.
- Canon reads: `AGENTS_UNIVERSAL.md`, `AGENTS_METHODOLOGY_VIBETHINK.md`,
  `CANON-CROSS-AGENT-CONTEXT-LAYERING.md`, `CANON-MULTI-AGENT-ORCHESTRATION.md`,
  `CANON-DEVELOPMENT-PROCESS.md`, `VT-METHOD.md`,
  `CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING.md`, `REVIEW-CALL-CHECKLIST.md`,
  `PORT_ASSIGNMENT_GLOBAL.md`.
- ADR reads: all 5 in `doc/decisions/`.
- Tool reads: `check-agent-context.mjs`, `keyword-reminder.mjs`,
  `keyword-reminders.example.json`, `sync-agent-skills.mjs`,
  `validate-vibethink-project.ps1`, `session-hygiene-scan.mjs`.

**Smoke gate verified:** `npm run validate:agent-context` GREEN before
proposing PR (see PR description).

---

## Closing note

The Dev-Kit is **internally coherent and architecturally sound**. The findings
above are not corrections to the model; they are the natural debts of a kit
that grew piece-by-piece without a central index. This PR closes the most
expensive of those debts (F2) and surfaces the rest as named, owned
follow-ups.
