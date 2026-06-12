# ADR-20260612 — Tenant-contamination gate (heir finding F-2 from Campus)

**Status:** PROPOSED (kit changes are supra-repo class → Principal Architect
merges)
**Origin:** Inheritance Contract §4. Finding F-2 from the Campus heir, GO by
Marcelo 2026-06-12. Companion to CANON-VERTICAL-BOUNDARY-001 (docs-pack PR).

## Problem

The kit fire-tests the agent-rules neutral core (no vendor names), but nothing
fire-tests PRODUCT code. Real leaks found in the wild on 2026-06-12, all of the
same class — tenant instances living in core:

- 3 school seeds inside `db/migrations/` core (colup forms / route_ops /
  expedientes)
- `packages/vito-core/src/domain/ovitality/` — tenant-named domain code in a
  core package

Each was "temporary" and became permanent. The canon's enforcement clause needs
a mechanism, not discipline.

## Decision

New kit tool `tools/check-tenant-contamination.mjs` (copy+parity piece):
config-driven scan of core paths for tenant slugs; allowlist with mandatory
reason (visible deviation, contract §6); exit 1 on undeclared hits. Example
config in `setup/templates/tenant-contamination.config.example.json`.

Consumers wire it as CI job and/or pre-commit. Suggested first consumer: the
orchestrator (after its cleanup lands, the gate keeps it clean).

## Notes

- Slug list is maintained in the consumer's config (source of truth: its
  `tenants` table; a future enhancement could fetch it live).
- Catalog (`ADOPT-DEV-KIT.md`) entry left to the maintainer's wiring pass.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
