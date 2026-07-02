# DELIVERY - KDD baseline health vs lifecycle status

**From:** Codex dev-kit session, 2026-07-02
**To:** Marcelo / future DevKit reviewer
**Status:** sealed clarification by Marcelo direction: option B.

## Decision

`lapsed` and `stale-by-pivot` are computed baseline-health conditions over an
`accepted` pack. They are not persisted `status:` lifecycle values.

## Meaning

Persisted lifecycle:

```text
raw-input | candidate | accepted | superseded | rejected
```

Computed health:

```text
accepted + elapsed revalidation window -> lapsed
accepted + unreconciled declared business pivot -> stale-by-pivot
```

In plain terms: `accepted` says what the pack is. `lapsed` and `stale-by-pivot`
say whether that accepted pack is currently safe to use.

## Changes

- Clarified `CANON-KNOWLEDGE-NATIVE-VT-METHOD-001` §4 and §8.2.
- Updated `PACK-METADATA.template.md` to include `raw-input`, `revalidation_due`,
  and `pivot_pending`.
- Added a test proving `status: lapsed` and `status: stale-by-pivot` are invalid.
- Registered authority decision D-056.

## Not Changed

- No OKF adoption.
- No template support graduation.
- No implementation of `kdd status`; this only clarifies its future contract.
