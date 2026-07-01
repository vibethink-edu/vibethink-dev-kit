# AUDIT — DevKit maturity review (adversarial, external-auditor role)

**From:** Fable (DevKit maturity reviewer — adversarial, read-only)
**To:** the chief architect + dev-kit maintainer
**Date:** 2026-07-01
**Scope reviewed:** AGENTS_UNIVERSAL, VT-METHOD, CANON-VERSIONING-001, CANON-CHANGE-PATH §3.1, CANON-GIT-HYGIENE, REFERENCE-ROUTING-CARD-READINESS, REFERENCE-OPERATOR-COMMAND-CATALOG, EXTERNAL-TOOLS, USING-THE-KIT, devkit-doctor/upgrade, check-knowledge-pack, check-knowledge-memory-freshness, CI workflow, recent comms.
**Bias declared:** several recent pieces (routing-card, operator catalog, §2.6–2.8, 3 freshness dimensions) were authored by this same context in earlier sessions. Compensated by targeting them adversarially; a fully independent pass should come from a fresh session.

## Executive verdict

- **MATURITY: Strong** (not Production-ready)
- **Top systemic risk:** law↔machine gap **in the kit itself** — the kit legislates enforcement it does not fully self-apply: its own L1-neutrality gate runs **unconfigured** (160 "Marcelo" occurrences across 62 L1 files passed GREEN), 7 of 28 co-located tests are never run by CI, and the versioning-impact gate exists only as an open PR (#195).
- **Top strength:** the one-law → one-instrument → one-test → one-adoption-route pattern (verdict-first doctor, 3-dimension upgrade, consumer fire-tests) + high doctrinal coherence across recent canons.
- **Recommendation: APPROVE WITH FIXES.**

## Findings (12)

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| F-01 | HIGH | L1-neutrality gate unconfigured in the kit itself → 160 personal-name occurrences in 62 files passed GREEN; de-personalization sweep pending (was lost with the wiped checkout, uncommitted) | EXECUTED: `check-agent-context` output "8 l1-neutrality: no brandExclusionPatterns / neutralL1Files declared"; grep count VERIFIED |
| F-02 | HIGH | AGENTS_UNIVERSAL contradicts CANON-GIT-HYGIENE: teaches conditional `git push origin main --force` (line 342) and direct merge+push to main (372-375) vs §4 "force-push forbidden" + §7 "everything via PR" | file:line VERIFIED |
| F-03 | MEDIUM | 7 of 28 test files never run in CI (incl. `check-gate-integrity.test`, `session-hygiene-scan.test`, `check-agent-context.test`) | EXECUTED: diff tools/*.test.mjs vs workflow |
| F-04 | MEDIUM | `kdd-refresh.mjs` (the manifest WRITER) is the only tool with no co-located test | EXECUTED inventory |
| F-05 | MEDIUM | CANON-VERSIONING Status "approved" is not a state in its own §7.2 lifecycle; no seal marker | line 4 VERIFIED |
| F-06 | MEDIUM | Versioning-impact / BLOCKED-CONFLICT exists only as open PR #195 (since 2026-06-28) — operative expectation runs ahead of law | VERIFIED (PR open; content NOT VERIFIED) |
| F-07 | MEDIUM | Example-vs-catalog authority confusion observed in the field: an agent synced against the 11-trigger Espanso example instead of the REFERENCE §4 catalog | field event VERIFIED 2026-07-01 |
| F-08 | MEDIUM | AGENTS_UNIVERSAL legacy weight: per-commit "ask about version" contradicts CANON-VERSIONING §3; Spanish house-culture sections + hour-by-hour crisis boilerplate inside the neutral L1 core | file:lines VERIFIED |
| F-09 | LOW | Residual "(PROPOSED…)" header at ROUTING-CARD §4 (line 73) inside a SEALED doc | VERIFIED (self-caught) |
| F-10 | LOW | The kit repo itself has no root `AGENTS.md` (asymmetric with what it mandates; START-HERE mitigates) | EXECUTED inventory |
| F-11 | LOW | Physical mount fragility: the canonical sibling checkout was found wiped 2026-07-01 (root cause unconfirmed; recovered by re-clone, zero loss — everything was pushed). Doctor lacks an explicit mount-integrity check | VERIFIED event; doctor behavior INFERENCE |
| F-12 | INFO | Tool installer covers win32(ps1)/unix(sh); macOS execution NOT VERIFIED |

## Contradictions
1. force-push conditional (AGENTS_UNIVERSAL:342) vs forbidden (GIT-HYGIENE §4) — worst.
2. direct-push-to-main workflow vs everything-via-PR (§7).
3. ask-version-per-commit vs Conventional-Commits-drive-bumps (VERSIONING §3).
4. "approved" status vs its own §7.2 vocabulary.
5. "(PROPOSED)" residue inside SEALED routing-card.
6. Espanso example perceived as baseline vs catalog §4 authority.

## Quick wins
CI glob-run all `tools/*.test.mjs` · configure l1-neutrality (incl. person names) in the kit itself · re-apply de-personalization sweep · VERSIONING status normalize + seal · "do not sync against this demo" line in the example · drop the PROPOSED residue · test for kdd-refresh.

## Strategic next steps (3 PRs)
- **PR-1 "the kit obeys its own law":** CI glob + neutrality config + de-person sweep + residue. Closes the systemic risk.
- **PR-2 "AGENTS_UNIVERSAL v1.5":** excise contradictory Git-Safety → pointer to GIT-HYGIENE; versioning → pointer; Spanish/crisis sections down to L2. Authority seal.
- **PR-3 "decide #195":** adversarial review of the versioning-impact gate → seal or close. No limbo.

## Keep / do not over-engineer
devkit-doctor (verdict-first, skip-never-silent) · check-knowledge-pack's honest structural-only scope · USING-THE-KIT on-ramp · the recent family (routing-card / 3-dimensions / operator catalog / §2.6-2.8) — let Campus/WB fire-test before touching again · the copy-parity `adapted` model.
