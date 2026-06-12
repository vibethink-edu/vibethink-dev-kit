# ADR-20260612 — Heir findings from Campus (docs pack: F-1, F-3, F-4)

**Status:** PROPOSED (kit changes are supra-repo class → Principal Architect
merges)
**Origin:** Inheritance Contract §4 — heir findings flow upstream. Finding file:
`vibethink-campus/docs/ai-coordination/comms/2026-06-12-claude-to-marcelo-devkit-improvements.md`.
Marcelo gave GO 2026-06-12.

## What this adds

| Finding | Artifact | Why it belongs in the kit |
|---|---|---|
| F-1 | `knowledge/architecture/CANON-VERTICAL-BOUNDARY-001.md` | Tenant-vs-vertical is platform law (5-gate test, graduation rule, anti-contamination duties), authored in the first vertical's repo but governing ALL of them. Normative distillation; the worked census stays in the vertical repo as extended reference |
| F-3 | `setup/templates/HANDOFF-ARQUITECTO.template.md` + `BRIEFING-EJECUTOR.template.md` | The two-role session-prompt pattern (delegated architect vs mechanical executor with V-xx matrix) proved out in Campus Fase 1 and is product-agnostic |
| F-4 | `setup/RUNBOOK-NEW-MACHINE-BOOTSTRAP.md` | Zero-to-governed-session recipe, fire-tested on Windows Server (incl. the org-authorization gotcha in device-flow) |

## Notes

- Catalog (`ADOPT-DEV-KIT.md`) entries for these pieces are left to the
  maintainer's wiring pass (catalog-sync formatting honored there).
- Companion PR: the tenant-contamination gate tool (F-2) — separate branch so
  it can be reviewed/merged independently.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
