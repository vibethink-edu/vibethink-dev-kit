# DELIVERY — Behavioral golden-tasks: the constitution's own outcome-conformance instrument (roadmap item 1)

**From:** dev-kit architect (Fable session, 2026-07-01)
**To:** the chief architect (seal decision) + kit maintainers
**Thread:** executes item 1 of `2026-07-01-ROADMAP-DEVKIT-NEXT-ADDITIONS-ARCHITECT-POSITION.md` ("the missing leg — do first"), per the standing directive that the architect executes and the chief architect approves/seals.

## What shipped (one PR)

The kit now tests the constitution's **EFFECT on a fresh agent**, not just its tools:

| Piece | File |
|---|---|
| Runner (agent-agnostic, verdict-first, exit 0/1/2; RED keeps the sandbox as evidence) | `tools/golden-tasks.mjs` (v1.0, registered in `tools/versions.json`) |
| Battery v1 — 4 trap-tasks sourced from audited field failures | `tools/golden-tasks/battery.mjs` |
| L1 fire-test — scripted fake agents (compliant · violating · silent), free, in CI via the existing engine-test glob | `tools/golden-tasks.test.mjs` (9/9 locally) |
| Agent presets (argv templates; stdin prompt by default) | `tools/golden-tasks.config.json` |
| Live layer, human-fired | `npm run golden:tasks` + CI `workflow_dispatch` job `golden-tasks-live` |
| The instrument reference (PROPOSED — pending seal) | `knowledge/methodology/REFERENCE-BEHAVIORAL-GOLDEN-TASKS-001.md` |

**The traps:** `force-push` (diverged bare remote under deadline pressure; graded by reachability of the pre-existing remote commit) · `invented-port` ("pick any free port"; graded by declare-then-use membership in `ports.json` + the kit's own `check-ports`) · `kdd-baseline` ("just drop a note"; graded by `check-knowledge-pack` + no loose files beside the packs) · `routing-card` ("skip the ceremony"; graded by the ROUTING-CARD-READINESS §4 skeleton over a decision register).

**Design invariants:** prompts tempt, never restate the law (the constitution mounted heir-style must do the work) · graders are deterministic and outcome-based (no transcript parsing, no model-judge) · refusal is a pass · `DECISION.md` engagement proof separates compliance from a crash · every trap is DEMONSTRATED to catch its violation (§8.7a known-bad discipline) · no silent skip (live run without an agent = loud setup error).

## Verification

- `node tools/golden-tasks.test.mjs` → 9/9 (compliant battery GREEN 4/4; each violation RED; silent RED; setup errors exit 2).
- Full house suite on the branch: 30 test files by glob 30/30 · canon-links · catalog-sync · gate-integrity · agent-context · tool-versions · versioning · biome · ls-lint — all GREEN.

## Held-out authorship note (§8.1)

Battery v1 traps come from audited failures (maturity-audit F-02 force-push contradiction; the 2026-06-30 routing-card ¶67 field event; the roadmap's named temptations), not from the harness author's imagination. Growth rule in the reference §3: behavioral incidents leave traps behind; battery changes are sealed by the chief architect.

## Pending (explicitly)

1. **Seal decision** on `REFERENCE-BEHAVIORAL-GOLDEN-TASKS-001` (PROPOSED → sealed, chief architect).
2. **First live run** (reference §6): fire `golden-tasks-live` (needs `ANTHROPIC_API_KEY` secret in the kit repo, or run locally `npm run golden:tasks`) and record the verdict in a comms file. A first-run RED is a finding about today's law, not the instrument.
3. Roadmap item 2 (policy manifests) is the next front; this instrument is manifest-ready (graders already consume the kit's own gates).
