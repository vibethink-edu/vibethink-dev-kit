# Changelog

## 2026-06-04

### Added

- Added `knowledge/ai-agents/REVIEW-READINESS-PROTOCOL.md` as the inherited
  process for review readiness: test the layer that gives the true signal, attach
  evidence, watch machine gates, avoid duplicate dispatch loops, and leave
  concrete adapters to consuming repos.

### Changed

- Referenced the review-readiness protocol from `AGENTS_UNIVERSAL.md` so
  inheriting repos can bind local launchers, auth bootstrap, evidence tools,
  queue thresholds, and deploy gates without duplicating SUPRA policy.

## 2026-05-25

### Added

- Added canonical `scripts/sync-agent-skills.mjs` in the Dev-Kit with a
  non-destructive `--check` mode for `.agents/skills` -> `.claude/skills` drift.
- Added `tools/comms-send.mjs` and `tools/comms-sync.mjs` as the governed send/sync
  path for inter-agent comms across machines.
- Added `repo` awareness to comms so a recipient can detect wrong-repo context.
- Added `target_layer` and `ref_branch` governance fields for cross-agent
  `task` / `review` / `audit` comms.

### Changed

- Hardened VT-Method decision capture: architecture, contract, behavior,
  AI-assisted / model-driven behavior, dependency, runtime, security/data/auth,
  privacy, and supply-chain changes now trigger an explicit ADR/canon
  classification before implementation.
- Promoted the Recipient Self-Check from a good practice to a required block for
  governance task/review/audit comms.
- Updated `comms-send` to fail closed when governance comms are missing
  `target_layer`, `ref_branch`, or the Recipient Self-Check heading.
- Consolidated `sync-agent-skills` as a Dev-Kit-owned dev-tool; downstream repos
  should inherit it instead of carrying a duplicate copy.

### Verified

- PR #21 merged with review verdict `PASS WITH NOTES`.
- Follow-up issue #23 tracks non-blocking future hardening.
- The inter-agent loop was dogfooded end to end: sync, dispatch, review, issue
  follow-up, merge, and delivery comm.
