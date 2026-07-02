# DELIVERY - KDD/OKF dormancy review protocol

**Date:** 2026-07-02  
**Scope:** close the KDD/OKF thread without losing the idea or prematurely adopting it.

## Verdict

OKF template adoption is documented as **DORMANT**, not rejected and not adopted.

The useful guardrails remain alive. The template does not get an `okfCompatibility`
surface. The next review now has named states, evidence thresholds, wake triggers,
and drop triggers.

## What changed

- Added a reusable **dead / alive / family** review protocol to `doc/DEFERRED-INSTRUMENTS.md`.
- Registered **KDD exchange profile / OKF-compatible frontmatter** as a dormant deferred instrument.
- Added a neutral Knowledge Pack README paragraph: descriptive frontmatter is allowed for
  navigation, but authority remains only in `PACK-METADATA.md`.

## Protocol in plain terms

- **Dead / dropped:** the idea is harmful, superseded, or never gets real demand.
- **Dormant:** keep the evidence and a wake-up trigger; do not ship the template surface.
- **Alive as guardrail:** keep tests/rules that protect KDD even if OKF never graduates.
- **Family candidate:** a real consumer need fires and behavior improves against the baseline.
- **Adopted family:** normal authority path: decision record, docs, templates/tooling, tests.

## Wake-up trigger for this case

Reopen only when a real consumer needs one of these:

1. A Knowledge Reconstruction Sprint imports an external OKF bundle and needs repeatable kit support.
2. An external consumer asks for a KDD Knowledge Pack as a portable bundle.
3. Two independent repos need the same KDD exchange surface and a behavior test beats the plain pack.

## Non-goals

- No OKF branding added to the Knowledge Pack template.
- No generated `index.md` added to packs.
- No canon amendment in this PR.
- No claim that frontmatter status can confer KDD authority.
