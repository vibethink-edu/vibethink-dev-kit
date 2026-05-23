# VibeThink Dev-Kit — cross-agent governance (supra-repo)

[![AGENTS.md](https://img.shields.io/badge/AGENTS-md-blue)](https://agents.md)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![agent-context](https://github.com/vibethink-edu/vibethink-dev-kit/actions/workflows/agent-context.yml/badge.svg)](.github/workflows/agent-context.yml)

The **single control point** for how multiple AI agents (and a human) collaborate
across VibeThink repos. Each consuming repo **inherits** this governance — it does
**not** copy the engine.

> **History note:** this repo previously held a v1 "Dev Kit" (stack-detection CLI,
> product UI packages, generated constitutions). That layer was reaped on 2026-05-23
> to leave a focused governance supra-repo; the old content remains in git history,
> and tools/evaluations live in `vibethink-asset-library`.

---

## What's inside

**Canons (the principles — neutral, vendor-agnostic):**
- [`AGENTS_UNIVERSAL.md`](knowledge/ai-agents/AGENTS_UNIVERSAL.md) — the neutral root authority (level 1).
- [`CANON-CROSS-AGENT-CONTEXT-LAYERING.md`](knowledge/ai-agents/CANON-CROSS-AGENT-CONTEXT-LAYERING.md) — how agents read rules (layering + the smoke test).
- [`CANON-MULTI-AGENT-ORCHESTRATION.md`](knowledge/ai-agents/CANON-MULTI-AGENT-ORCHESTRATION.md) — handoff between agents + the human (inbox/feed, review-call discipline).
- [`CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING.md`](knowledge/architecture/CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING.md) — decisions as first-class, indexable citizens.
- [`REVIEW-CALL-CHECKLIST.md`](knowledge/ai-agents/REVIEW-CALL-CHECKLIST.md) — what an advisor architect validates before a seal.
- [`AGENTS_METHODOLOGY_VIBETHINK.md`](knowledge/ai-agents/AGENTS_METHODOLOGY_VIBETHINK.md) — the org/methodology layer (level 2: concrete ports/stack/tooling).

**Engines (the runtime — pure Node, no deps):**
- [`tools/check-agent-context.mjs`](tools/check-agent-context.mjs) — the layering smoke test.
- [`tools/inbox.mjs`](tools/inbox.mjs) / [`tools/feed.mjs`](tools/feed.mjs) — read-only views over the shared comms channel.
- Per-agent adapters: `CLAUDE.md`, `CODEX.md`, `COPILOT_INSTRUCTIONS.md`, `WINDSURFRULES.md` (pointers to the root).

**Enforcement:**
- [`.github/workflows/agent-context.yml`](.github/workflows/agent-context.yml) — runs the smoke + tests here; reusable (`workflow_call`) so forks gate themselves without copying the engine.

---

## Quick start

**Adopt / validate / activate in your repo** — follow the runbook:
👉 [`setup/ADOPT-CROSS-AGENT-GOVERNANCE.md`](setup/ADOPT-CROSS-AGENT-GOVERNANCE.md)

**Validate this repo locally:**
```bash
npm run validate:agent-context   # = check:agent-context + test:agent-context
# expect: GREEN — cross-agent layering holds  ·  inbox + feed tests pass
```

---

## Structure

```
knowledge/ai-agents/        # the cross-agent canons + adapters + methodology + review checklist
knowledge/architecture/     # CANON-DECISION-DISPOSITION (decisions as graph nodes)
knowledge/PORT_ASSIGNMENT_GLOBAL.md
tools/                      # engines: check-agent-context, inbox, feed (+ configs + tests)
setup/                      # ADOPT runbook + templates
doc/                        # build roadmap, review threads, ADRs
.github/workflows/          # agent-context.yml (the only current workflow)
```

---

## License

MIT — see [LICENSE](LICENSE).
