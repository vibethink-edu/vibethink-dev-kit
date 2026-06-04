# Changelog

## 2026-06-03

### Added

- `CANON-MULTI-AGENT-ORCHESTRATION.md` §2.3 — **Producer-side routing**: the
  producer half of the inbox loop. Actionable knowledge a consumer must act on is
  delivered only when it lands where that consumer reads (channel / canon / ops of
  the consumer's repo), never a personal notebook, chat, or memory namespace.
  Carries the routing test ("who has to ACT on this, and will they find it where I
  put it?") and is named as the explicit mirror of §2.1 (consumer pull). Corollary
  of `CANON-CROSS-AGENT-CONTEXT-LAYERING.md` §4.
- `START-HERE.md` — the dance now states the producer-routing test and points to
  §2.1 (consumer) / §2.3 (producer).

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
