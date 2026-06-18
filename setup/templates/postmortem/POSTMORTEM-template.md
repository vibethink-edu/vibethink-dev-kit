<!--
TEMPLATE — Postmortem · standard: Blameless postmortem (Google SRE).
Bound by CANON-DOCUMENTATION-ARTIFACT-STANDARDS-001 §2 (Learn from failure).
BLAMELESS: describe systems and actions, never blame a person. The goal is prevention, not punishment.
-->

# Postmortem — <incident title> — YYYY-MM-DD

- **Status:** draft | final
- **Authors:** <who> · **Severity:** SEV1/2/3
- **Incident window:** <start> → <end> (duration)

## Summary

<2–3 sentences: what happened, the impact, the root cause — readable on its own.>

## Impact

<Who/what was affected, for how long, by how much (users, requests, money, data). Quantify.>

## Timeline (UTC)

| Time | Event |
|---|---|
| <t0> | <trigger / first symptom> |
| <t1> | <detection — how we found out> |
| <t2> | <mitigation steps> |
| <t3> | <resolution> |

## Root cause

<The actual cause (often a chain). Describe the system + the conditions, not the person.>

## Detection

<How was it detected? Did the alert fire? Time-to-detect. Could we have caught it sooner?>

## Resolution

<What stopped the bleeding + what fully resolved it.>

## What went well / what went wrong / where we got lucky

- **Well:** <…>
- **Wrong:** <…>
- **Lucky:** <the thing that could have been worse>

## Action items (the point of the postmortem)

| Action | Type (prevent/detect/mitigate) | Owner | Tracking |
|---|---|---|---|
| <concrete, assigned, tracked action> | prevent | <who> | <issue link> |

## Lessons learned

<Generalizable lesson; candidate for a canon/ADR/runbook update.>
