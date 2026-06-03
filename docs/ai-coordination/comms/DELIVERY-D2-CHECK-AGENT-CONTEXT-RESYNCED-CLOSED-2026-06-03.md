---
type: delivery
from: opus
to_agent: any
to: any (FYI to dev-kit maintainers)
repo: vibethink-dev-kit
project: vibethink-dev-kit
target_layer: SUPRA-L1L2
ref_branch: master
status: closed
priority: normal
date: 2026-06-03
re: FINDING-CHECK-AGENT-CONTEXT-HASH-DRIFT-VITO-COPY-2026-06-03.md
tldr: "D2 hash drift CLOSED. ViTo's tools/check-agent-context.mjs re-synced from upstream (ViTo PR #2919). Investigation confirmed: not a local patch — re-sync pending. 30+ days of drift recovered."
action: fyi
reversible: yes
on_no_reply: nothing — closure confirmation only
ref_pr: vibethink-orchestrator-main#2919
ref_doc: docs/ai-coordination/comms/FINDING-CHECK-AGENT-CONTEXT-HASH-DRIFT-VITO-COPY-2026-06-03.md
---

# DELIVERY — D2 hash drift closed (ViTo PR #2919)

## What was found

The finding from earlier today predicted three possibilities:
1. Local patch that should be PR'd upstream
2. Kit evolved, ViTo did not re-sync
3. Line-ending normalization only

**Confirmed: option 2.** ViTo's `tools/check-agent-context.mjs` was 30+ days behind upstream (last sync predates the dev-kit's PR #21 / PR #24 evolution that added Check 6 whole-repo-scan, Check 7 secret-scan tracked-files, Check 8 L1-neutrality fire-test, and `--include-untracked` flag).

## What was done

ViTo PR #2919 (merge `c066a509`):

1. **Copied verbatim** `tools/check-agent-context.mjs` from dev-kit master (`41dc710e`, post-PR #29). MD5 confirmed byte-identical: `e1246186d906228fd9f778e4c5ec4fde`.

2. **Updated `tools/agent-context.config.json`** with `agentFileAllowlist` containing 6 legitimate files that match `agentFilePattern` but are NOT parallel constitutions (the new Check 6 scans whole-repo and surfaced them):
   - `.claude/CLAUDE.md` (Claude Code adapter at harness path)
   - `docs/ai-coordination/CLAUDE.md` + `CODEX.md` (neutral cross-agent layer)
   - `apps/docs/.../CLAUDE.md` + `CODEX.md` (Starlight docs-site copies)
   - `docs/ai-coordination/comms/paperclip-install-audit/sandbox/CLAUDE.md` (historical audit artifact)

3. **Each allowlist entry documented** with `_agentFileAllowlistNote` explaining why it's tracked by intent, not parallel constitution.

## Smoke gate post-resync

GREEN. Check 6 (no-parallel) now scans whole repo and finds all 8 agent-pattern files accounted for (4 declared adapters + 6 allowlisted = 10 minus 2 because 2 of the adapters also matched). Check 7 (secret-scan) scanned 25,133 tracked files, 0 matches. AGENTS.md = 31,675 B (FASE 1 dedup work preserved; 1,093 B margin under Codex 32,768 budget).

## What remains open (TASK #2734 territory)

This PR proves the **manual re-sync works**. It does NOT automate detection of future drift. The CI parity-check (`ADR-20260524-supra-repo-inheritance-mechanism.md` §3.1) is still owned by orchestrator TASK #2734.

Until that's wired, drift will silently accumulate again on the next dev-kit evolution. The right next step for that work: the parity-check CI workflow that diffs each consumer's copy against the dev-kit upstream and fails the build on divergence.

## Companion adoption work in the same session

The D2 close is one of many threads closed today as part of the dev-kit-adoption multi-fase work. Full context: `vibethink-orchestrator-main:docs/features/dev-kit-adoption/ROADMAP.md` + `BITACORA.md`.

— Opus