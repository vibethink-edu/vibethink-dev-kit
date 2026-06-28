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
  but CLI-not-in-PATH, and missing-tool remediation.
- Updated `AGENTS_UNIVERSAL.md` and `setup/EXTERNAL-TOOLS.md`: product correctness
  remains non-blocking, but local/session health must show RED/WARN visibly.
- Updated `AGENTS_UNIVERSAL.md`, `CANON-CROSS-AGENT-CONTEXT-LAYERING.md`,
  `ADOPT-DEV-KIT.md`, and heir bootstrap templates: size limit is not an excuse to
  skip the inherited generic rulebook; agents must use focused reads/search/ranges.
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
  - `status: OK`
  - `graphify available 0.8.39`
  - `rtk available 0.39.0`
- `bash setup/check-tools.sh .` in WSL/Bash reports:
  - `graphify health:[WARN shell mismatch 0.8.39]`
  - `RTK health:[WARN shell mismatch 0.39.0]`
  - exact found `.exe` paths, expected PATH directories, and stale-shell remediation.
- `node tools/devkit-doctor.mjs --json` reports RTK and Graphify available by canonical
  name in PowerShell. On this machine it also reports current-upstream Engram as
  `installed-not-in-path`, which is the intended loud local-health behavior for a
  lock-registered operator tool.
- `node tools/devkit-doctor.mjs --json` includes `inheritedBrain` with the required
  sections findable: Dev Tooling Baseline; NO BRAIN, NO WORK; Duty to Flag;
  inheritance/layering; tool availability/reporting.

## Validation

- `node tools/external-tools-health.test.mjs` -> 4/4 passed.
- `node tools/devkit-doctor.test.mjs` -> 6/6 passed.
- `node tools/check-tool-versions.mjs` -> GREEN.
- Full `tools/*.test.mjs` sweep -> all passed.
- `node tools/devkit-doctor.mjs --json` -> inherited brain OK; RTK/Graphify OK;
  external tools RED because current-upstream Engram is installed but `engram` is not
  in PATH on this machine.
- `bash setup/check-tools.sh .` -> WARN shell mismatch for Bash/WSL, no false missing.
- `bash setup/check-tools.sh --json .` -> machine-readable externalTools block.

Validation caveat:

- `npm run check` could not run because `biome` is not installed in this checkout
  and there is no local `node_modules`/lockfile present.
- Full `devkit-doctor` remains RED on current `origin/master` because of pre-existing
  catalog-coverage gaps for `CANON-COMM-INTERNAL-VS-EXTERNAL-001.md` and
  `CANON-UI-PREFERENCE-PERSISTENCE-001.md`; those are outside this PR's scope.
