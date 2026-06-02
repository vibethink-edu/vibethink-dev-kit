# Adopt the cross-agent governance — setup / onboarding runbook

> **What this is:** the single, followable procedure for a repo to **adopt**,
> **validate**, and **activate** the kit's cross-agent governance. The governance
> lives **once** in this supra-repo (single control point); a consuming repo
> **inherits** it — it does **not** copy the engine.
>
> **What you inherit (3 pieces, all from the kit):**
> 1. **Layering + smoke** — `tools/check-agent-context.mjs` validates your rule
>    layering (`CANON-CROSS-AGENT-CONTEXT-LAYERING.md`).
> 2. **Orchestration + inbox/feed** — `tools/inbox.mjs` / `tools/feed.mjs` route the
>    shared comms channel (`CANON-MULTI-AGENT-ORCHESTRATION.md`).
> 3. **Review-call checklist** — what an advisor validates before a seal
>    (`REVIEW-CALL-CHECKLIST.md`).
>
> **Golden rule:** the engine is tested **once, here**. Your repo declares its
> **config** and runs the **smoke** against it; it never forks the engine.

---

## Two cases

- **A — A new repo adopts** the governance from scratch → do steps 1→5.
- **B — An existing repo validates / activates** it → run the smoke first (step 4)
  to see where you stand, fix what's red, then activate (step 5). Steps 2–3 only if
  the configs don't exist yet.

The steps are the same; B just starts by measuring.

---

## Step 1 — Mount the kit (local dev)

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
reusable workflow (step 4) fetches the kit's tools itself.

## Step 2 — Declare your layering config

Create `tools/agent-context.config.json` in your repo (start from the kit's own as a
template). Set it to **your** repo's reality:

```jsonc
{
  "rootRulesFile": "AGENTS.md",          // your repo's root authority
  "agentBudgets": {                       // the strictest agent caps the root size
    "codex": 32768, "copilot": 32768, "windsurf": 32768, "gemini": 32768, "claude": 1000000
  },
  "adapters": [                           // one pointer file per agent (NOT copies)
    { "agent": "claude", "file": ".claude/CLAUDE.md" },
    { "agent": "codex",  "file": "AGENTS.md" }
  ],
  "maxAdapterBytes": 6144,
  "agentFileAllowlist": [],               // pattern-matching files that are NOT constitutions
  "requiredAnchorsInRoot": [],            // critical anchors that must live in the root
  "secretPatterns": [ /* inherit the kit's */ ]
}
```

This file is **what the smoke validates**. Declare honestly; the smoke will check it.

## Step 3 — Declare your comms config

Create `tools/inbox.config.json`:

```json
{
  "lanePath": "docs/ai-coordination/comms",
  "agents": ["claude", "codex", "gemini", "copilot", "windsurf", "cursor"]
}
```

`lanePath` = where your shared comm files live. `agents` = the tokens the router
recognizes in a prose `to:`. (Engines fall back to these defaults if the file is
absent.)

## Step 4 — Validate (run the smoke) + add the CI gate

**Local — must be GREEN before you proceed** (*"a repo is not multi-agent until this
passes"*):

```bash
node <mounted-kit>/tools/check-agent-context.mjs tools/agent-context.config.json
# fix every ✗ until: GREEN — cross-agent layering holds
```

**CI — make it bite** (so the green stays green without a human). Add
`.github/workflows/agent-context.yml` that **calls the kit's reusable workflow**
(no engine copy):

```yaml
name: agent-context
on: [push, pull_request]
jobs:
  agent-context:
    uses: vibethink-edu/vibethink-dev-kit/.github/workflows/agent-context.yml@main
    with:
      config-path: tools/agent-context.config.json
```

## Step 5 — Activate (inbox at session start)

Wire each agent's harness so its inbox surfaces automatically at session start:

```bash
node <kit>/tools/inbox.mjs <agent> --lane docs/ai-coordination/comms
# e.g. SessionStart hook per agent → the agent arrives knowing its open items
```

> **Honest status:** the engines + the `--lane` flag are ready; the per-harness
> `SessionStart` wiring is the activation step and depends on each agent's harness.
> See `doc/INBOX-FEED-ROADMAP.md` step 5 for the wiring pattern.

## Step 6 — Session-start hygiene scan (early detection of stale WIP)

The closeout protocol (`CANON-MULTI-AGENT-ORCHESTRATION.md` §2.2) requires every
branch / worktree touched in a session to end in one of `PUSHED` / `READY-PR` /
`DISCARDED`. **The scan is the detection side:** at session start, a
non-mutating sweep flags any registered worktree with uncommitted **or** unpushed
work older than today — so the operator notices fragile WIP before it ages
further.

```bash
node <kit>/tools/session-hygiene-scan.mjs
# exit 0 = all worktrees in a declared state; exit 1 = stale WIP reported (no mutation)
```

Expose it locally as `pnpm session:start` (or your equivalent), running it
alongside the inbox pull (Step 5). The scan **never mutates** — it reports.
The operator decides what to rescue, push, or discard.

> **Honest scope:** this is early detection, not a cron job. A daemon /
> watcher / live monitor is **deferred until the manual scan is shown to be
> insufficient** (build-on-pain). One scan per session start is the floor.

---

## Done when

- [ ] **Step 4 smoke is GREEN** locally **and** the CI job runs and passes.
- [ ] `tools/agent-context.config.json` + `tools/inbox.config.json` reflect your repo.
- [ ] CI calls the kit's reusable workflow (you did **not** copy the engine).
- [ ] (Activate) at least one agent surfaces its inbox at session start.
- [ ] Reviewers use the inherited `REVIEW-CALL-CHECKLIST.md` before any seal.
- [ ] (Hygiene) `session-hygiene-scan.mjs` runs at session start and reports cleanly (exit 0); operators address any flagged worktrees before working (§2.2 closeout).

## Where it all lives (single control point)

| Piece | In the kit (source) | In your repo (yours) |
|-------|---------------------|----------------------|
| Smoke engine | `tools/check-agent-context.mjs` | — (inherited) |
| inbox / feed engines | `tools/inbox.mjs`, `tools/feed.mjs` | — (inherited) |
| Reusable CI | `.github/workflows/agent-context.yml` (`workflow_call`) | a ~5-line caller |
| Layering config | (template) | `tools/agent-context.config.json` |
| Comms config | (template) | `tools/inbox.config.json` |
| Review checklist | `REVIEW-CALL-CHECKLIST.md` | — (inherited) |
| Session hygiene scan | `tools/session-hygiene-scan.mjs` | — (inherited; expose as `pnpm session:start`) |

**Canon:** `CANON-CROSS-AGENT-CONTEXT-LAYERING.md` (§6 smoke, §7 inheritance) ·
`CANON-MULTI-AGENT-ORCHESTRATION.md` (§2.1 pull modes, §2.2 session closeout, §3.1 learn-before-automate,
§5 routing, §5.1 human-actionable shape + §5.1.A status / §5.1.B router message,
§7 review-call, §8 inheritance).
