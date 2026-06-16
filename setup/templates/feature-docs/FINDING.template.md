<!--
  FINDING skeleton — instance of CANON-DEVELOPMENT-PROCESS §6 (findings).
  Role: an anomaly, risk, or opportunity OUTSIDE the current unit's scope — recorded,
  never silently fixed and never lost. One file per finding.
  A SECURITY finding escalates to the named authority immediately (§6).
  Copy, rename per your repo's convention, delete these guidance comments.
  Suggested filename: FINDING-<CATEGORY>-<short-slug>.md (CANON-NAMING-CONVENTIONS-001).
-->
# FINDING — <short title>

> **Category:** <SECURITY | DATABASE | ARCHITECTURE | PERFORMANCE | CONFIG-SURFACE | ALTERNATIVE>
> **Severity:** <by real risk, not by label>  ·  **Date:** <YYYY-MM-DD>  ·  **By:** <human or agent>
> **Status:** <open | actioned | dismissed (with reason)>

## What
<The anomaly / risk / opportunity, factually. What is wrong, missing, or possible.>

## Where
<file:line · component · system — the exact location, so the next reader finds it.>

## Why it matters
<The consequence if left as-is. For SECURITY, escalate to the named authority NOW —
do not wait for this file to be noticed.>

## Suggested action
<One of: INVESTIGATE | FIX | CONSULT-EXPERT | TRY-PLAN-B | ESCALATE-TO-ARCHITECT.
If the fix is inside the current authorization, prefer actioning it in the same change
rather than leaving the finding as evidence-only.>

## Disposition
<Filled when resolved: what was decided, by whom, link to the commit/PR/ADR.>
