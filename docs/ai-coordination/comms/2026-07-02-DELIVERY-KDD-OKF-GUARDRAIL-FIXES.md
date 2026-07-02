# DELIVERY - KDD/OKF guardrail fixes after adversarial review

**From:** Codex dev-kit session, 2026-07-02
**To:** Marcelo / future DevKit reviewer
**Status:** delivery evidence. Not canon. Does not promote OKF to template support.

## Verdict

Applied the actionable guardrail fixes from
`2026-07-02-REVIEW-ADVERSARIAL-KDD-OKF-HARDENED-GUARDRAIL-OPUS.md`.

The work remains a guardrail, not an adoption. F-3 is intentionally not resolved here
because it requires Marcelo's canon authority: decide whether `lapsed` and
`stale-by-pivot` are persisted `status:` values or computed conditions.

## Fixes Applied

### F-1 - basename-global source exclusions

Fixed.

`sourceExclusions` now matches exact repo-relative paths only. It no longer matches
basenames such as `index.md` or `log.md`. The dangerous defaults were removed from:

- `tools/knowledge-memory.config.example.json`
- `setup/templates/knowledge-memory/knowledge-memory.config.json`

The template README now warns that generated OKF surfaces may be excluded only by exact
repo-relative generated file path, never by basename.

### F-5 - known-bad coverage gaps

Fixed.

Added:

- slash-absolute link rejection from a normal concept file, not only `index.md`;
- regression test proving `sourceExclusions: ["index.md"]` no longer hides changes to an
  accepted pack's `index.md`;
- path-scoped generated surface exclusion tests.

## Still Pending

### F-3 - `lapsed` / `stale-by-pivot`

Pending Marcelo decision.

Question: are `lapsed` and `stale-by-pivot` persisted `status:` enum values, or computed
conditions over an `accepted` pack?

This delivery does not amend canon and does not change the structural gate for those
states.
