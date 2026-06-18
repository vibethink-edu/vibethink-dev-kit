<!--
TEMPLATE — Runbook · standard: SRE runbook (operational procedures).
Bound by CANON-DOCUMENTATION-ARTIFACT-STANDARDS-001 §2 (Operate). A runbook is for the person on call
at 3am: explicit, copy-pasteable, no tribal knowledge assumed.
-->

# Runbook — <service / system name>

- **Owner:** <team/person> · **Last verified:** YYYY-MM-DD
- **Escalation:** <who/where to escalate if this runbook does not resolve it>

## Purpose

<What this service does, in 2 sentences — enough context to act.>

## Access / prerequisites

<What you need before you can operate it: credentials, VPN, tools, dashboards (links).>

## Common operations

| Task | How |
|---|---|
| <start / stop / restart> | `<exact command>` |
| <check health> | `<exact command / URL>` (healthy = <what you should see>) |
| <view logs> | `<where / command>` |

## Alerts → response

| Alert | Likely cause | First response |
|---|---|---|
| <alert name> | <cause> | <the exact first steps> |

## Recovery procedures

### <Failure scenario A>
1. <step> — verify with `<command>`
2. <step>
3. **Verify recovered:** <the check that proves it's healthy again>

## Escalation

<When to stop and escalate; to whom; what info to bring (the timeline + what you tried).>
