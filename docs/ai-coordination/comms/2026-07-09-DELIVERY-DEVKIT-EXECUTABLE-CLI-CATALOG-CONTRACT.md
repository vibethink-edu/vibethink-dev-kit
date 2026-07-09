# DELIVERY — dev-kit executable CLI catalog contract (2026-07-09)

**Verdict:** READY-PR.

## What changed

- Added `REFERENCE-EXECUTABLE-CLI-CATALOG-CONTRACT` as the neutral contract for executable command discovery.
- Added `setup/templates/cli-catalog/` with schema and config example.
- Added `check-cli-catalog-contract.mjs` plus known-bad tests.
- Registered adoptable piece #52 in `setup/ADOPT-DEV-KIT.md`.
- Wired the gate into `devkit-doctor` as skip-when-no-config.
- Added the new reference to neutral L1 fire-test coverage.
- Registered D-063 in `doc/decisions/DECISION-REGISTER.md`.

## Boundary

This does not copy any consumer command list into the kit. The kit owns only the portable shape and validation. Consuming repos own actual command ids, scripts, package-manager aliases, safety vocabulary, and command docs.

## Validation

- `node tools/check-cli-catalog-contract.test.mjs` — PASS, 7/7.
- `node tools/devkit-doctor.mjs` — PASS, 9/9 gates; external-tools WARN only for missing local Graphify artifact.
- `npm run validate:agent-context` — PASS.
- `node tools/check-canon-links.mjs knowledge` — PASS.
- `node tools/check-catalog-sync.mjs tools/catalog-sync.config.json` — PASS.
- `node tools/check-tool-versions.mjs tools/versions.json` — PASS.
- `node tools/check-gate-integrity.mjs tools/gate-integrity.config.json` — PASS.
- `npx --yes @biomejs/biome@1.9.4 check <new cli-catalog files>` — PASS.
- `git diff --check` — PASS.

## Known note

Full `npx --yes @biomejs/biome@1.9.4 check .` is RED on pre-existing format/lint debt outside this change. The new files pass scoped Biome.
