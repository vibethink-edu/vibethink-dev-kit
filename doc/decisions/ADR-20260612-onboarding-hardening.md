# ADR-20260612 — Onboarding hardening (heir findings A-1..A-7 from Campus)

**Status:** PROPOSED (kit changes are supra-repo → Principal Architect merges)
**Origin:** the first full onboarding executed against the checklist (Campus,
2026-06-12) surfaced 7 gaps — ALL with lived evidence, none theoretical.
Finding: `vibethink-campus/docs/ai-coordination/comms/2026-06-12-claude-to-marcelo-onboarding-checklist-gaps.md`.
Marcelo's directive: "que no se quede enterrado en un finding" → escalated to PR.

## Changes

| Finding | Evidence (lived) | Change in this PR |
|---|---|---|
| A-1 machine step 0 missing | server had no Node/pnpm/gh/git-identity | New "Step 0 — the machine" section in `ADOPT-DEV-KIT.md`, pointing at the bootstrap runbook |
| A-2 default-branch trap | heir CI shipped `@main`; kit lives on `master` | Live docs/workflow examples fixed to `@master` + Step 0 rule: "confirm the kit's real default branch" (alternative: kit migrates to `main` — maintainer's call, this PR takes the cheap path) |
| A-3 transitive vendoring | `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND` (ui → utils) | "Vendoring is transitive" subsection + multi-upstream parity pattern |
| A-4 claims validator demanded but not shipped | contract §2 requires it; heirs reinvent or omit | `tools/check-inheritance-claims.mjs` — reference implementation (strict vocabulary, cited files must exist, vague claims rejected) |
| A-5 data gravity undeclared | minors-data subset handled ad-hoc | New "Done when" checkbox: data gravity declared or `N-A(no sensitive data)` |
| A-6 org device-flow gotcha | first login 404 risk | Covered via Step 0 → runbook pointer |
| A-7 no .gitignore baseline | vendored node_modules nearly committed | `setup/templates/gitignore.baseline` + Step 0 rule: gitignore BEFORE first install |

## Notes

- Historical comms/review docs that mention `@main` are left untouched
  (append-only records).
- Catalog piece numbering for the new runnables (claims validator, gitignore
  template) left to the maintainer's wiring pass — same approach as PRs #64/#65.
- Companion PRs from the same heir cycle: #64 (canon + templates + runbook),
  #65 (tenant-contamination gate).

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
