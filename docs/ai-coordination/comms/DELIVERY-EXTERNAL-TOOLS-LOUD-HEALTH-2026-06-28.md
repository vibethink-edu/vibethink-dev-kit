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
  the kit default external tools (`rtk`, `graphify`).
- Wired `devkit-doctor` to show an explicit **External Tools** section and include
  `externalTools` in `--json`.
- Reworked `setup/check-tools.sh` so Bash/WSL-style shells detect Windows `.exe`
  tools (`rtk.exe`, `graphify.exe`) and report **WARN shell mismatch / stale shell**
  instead of the old false **NO instalado**.
- Added detector tests for Windows `.exe` discovery, shell mismatch, package-installed
  but CLI-not-in-PATH, and missing-tool remediation.
- Updated `AGENTS_UNIVERSAL.md` and `setup/EXTERNAL-TOOLS.md`: product correctness
  remains non-blocking, but local/session health must show RED/WARN visibly.
- Engram remains explicitly **not adopted** by the dev-kit baseline. Consumer-local
  use stays separate unless Marcelo gives a separate GO.

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
- `node tools/devkit-doctor.mjs` reports `external tools OK` as a visible section.

## Validation

- `node tools/external-tools-health.test.mjs` -> 4/4 passed.
- `node tools/devkit-doctor.test.mjs` -> 6/6 passed.
- `node tools/check-tool-versions.mjs` -> GREEN.
- Full `tools/*.test.mjs` sweep -> all passed.
- `node tools/devkit-doctor.mjs` -> GREEN, external tools OK.
- `bash setup/check-tools.sh .` -> WARN shell mismatch for Bash/WSL, no false missing.
- `bash setup/check-tools.sh --json .` -> machine-readable externalTools block.

Validation caveat:

- `npm run check` could not run because `biome` is not installed in this checkout
  and there is no local `node_modules`/lockfile present.
