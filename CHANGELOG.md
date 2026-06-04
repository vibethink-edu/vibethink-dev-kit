# Changelog

## 2026-06-03

### Added

- `knowledge/methodology/MUTATION-TESTING.md` — mutation testing as a **reference
  practice** (L1-agnostic, opt-in lens; not canon, not a gate). Documents what it is,
  **when to apply** (critical modules only: auth / payments / tenant-isolation /
  secrets / core business logic), when not to, the verified invocation pattern
  (sibling harness, one tool per language — e.g. Stryker for TS), the honest tooling
  status (built, not yet validated against real code), and the deferred promotion
  gate to canonical hosting (proven + demanded by ≥2 repos → build on pain). Does not
  amend any testing policy and adds no required CI gate.

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
