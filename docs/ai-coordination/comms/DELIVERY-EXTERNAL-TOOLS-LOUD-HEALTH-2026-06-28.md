---
date: 2026-06-28
type: DELIVERY
status: CLOSED
from_agent: codex
to_agent: dev-kit
topic: RTK/Graphify external dev tools must scream when unavailable
branch: codex/external-tools-loud-health
---

# Delivery — External dev tools loud local health

## What changed

- Added `tools/external-tools-health.mjs`, a machine-readable health detector for
  the kit default external tools.
- Wired `devkit-doctor` to show an explicit **External Tools** section and include
  `externalTools` in `--json`.
- Wired `devkit-doctor` to show an explicit **Inherited Brain** section and include
  `inheritedBrain` in `--json`.
- Reworked `setup/check-tools.sh` so Bash/WSL-style shells detect Windows `.exe`
  tools (`rtk.exe`, `graphify.exe`) and report **WARN shell mismatch / stale shell**
  instead of the old false **NO instalado**.
- Added detector tests for Windows `.exe` discovery, shell mismatch, package-installed
  but CLI-not-in-PATH, missing-tool remediation, stale/missing Graphify graph, and
  stale Engram memory.
- Updated `AGENTS_UNIVERSAL.md` and `setup/EXTERNAL-TOOLS.md`: product correctness
  remains non-blocking, but local/session health must show RED/WARN visibly.
- Updated `AGENTS_UNIVERSAL.md`, `CANON-CROSS-AGENT-CONTEXT-LAYERING.md`,
  `ADOPT-DEV-KIT.md`, and heir bootstrap templates: size limit is not an excuse to
  skip the inherited generic rulebook; agents must use focused reads/search/ranges.
- Strengthened freshness semantics: stale/missing Graphify graph means "do not read
  it as current; update scoped first"; stale Engram memory means recall is not healthy
  until `engram search`/`engram doctor` plus export/sync are checked.
- Engram was already present upstream as a separate class-C operator-memory tool
  after the 2026-06-21 Principal Architect supersession. This delivery does not add
  Engram to the RTK/Graphify A/B use-by-default detector and does not change Engram
  doctrine.

## Evidence

Before:

- PowerShell resolved both tools:
  - `rtk --version` -> `rtk 0.39.0`
  - `graphify --version` -> `graphify 0.8.39`
- Old Bash verifier said:
  - `graphify máquina:[NO instalado]`
  - `RTK máquina:[NO instalado]`

After:

- `node tools/external-tools-health.mjs --json` in PowerShell reports:
  - RTK CLI available by canonical name.
  - Graphify CLI available by canonical name.
  - Graphify activity is WARN if `graphify-out/graph.json` is missing or stale;
    the session must update scoped before relying on the graph.
  - Engram activity is WARN/RED if memory is missing/stale or the CLI is not in PATH.
- `bash setup/check-tools.sh .` in WSL/Bash reports:
  - `graphify health:[WARN shell mismatch 0.8.39]`
  - `RTK health:[WARN shell mismatch 0.39.0]`
  - exact found `.exe` paths, expected PATH directories, and stale-shell remediation.
- `node tools/devkit-doctor.mjs --json` reports CLI and activity separately. On this
  machine Graphify CLI resolves but has no current graph artifact in this repo, and
  current-upstream Engram is `installed-not-in-path`; both are intended loud
  local-health behavior.
- `node tools/devkit-doctor.mjs --json` includes `inheritedBrain` with the required
  sections findable: Dev Tooling Baseline; NO BRAIN, NO WORK; Duty to Flag;
  inheritance/layering; tool availability/reporting.
- `tools/external-tools-health.mjs` adds `activity` metadata for Graphify graph
  freshness and Engram memory recency.

## Validation

- `node tools/external-tools-health.test.mjs` -> 7/7 passed.
- `node tools/devkit-doctor.test.mjs` -> 6/6 passed.
- `node tools/check-tool-versions.mjs` -> GREEN.
- Full `tools/*.test.mjs` sweep -> all passed except known platform/base residuals
  listed below.
- `node tools/devkit-doctor.mjs --json` -> inherited brain OK; RTK CLI OK;
  Graphify CLI OK but graph artifact missing/stale warning; external tools RED
  because current-upstream Engram is installed but `engram` is not in PATH on this
  machine.
- `bash setup/check-tools.sh .` -> WARN shell mismatch for Bash/WSL, no false missing.
- `bash setup/check-tools.sh --json .` -> machine-readable externalTools block.

Validation caveat:

- `npm run check` could not run because `biome` is not installed in this checkout
  and there is no local `node_modules`/lockfile present.
- Full `devkit-doctor` remains RED on current `origin/master` because of pre-existing
  catalog-coverage gaps for `CANON-COMM-INTERNAL-VS-EXTERNAL-001.md` and
  `CANON-UI-PREFERENCE-PERSISTENCE-001.md`; those are outside this PR's scope.
- `tools/shell-smoke.test.mjs` fails on Windows because the test passes `C:\...`
  paths directly to Bash (`/bin/bash: C:\...: No such file or directory`).
