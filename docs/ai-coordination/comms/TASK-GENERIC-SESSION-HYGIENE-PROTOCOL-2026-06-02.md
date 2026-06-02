---
type: task
from: codex
to_agent: opus
to: opus
repo: vibethink-dev-kit
target_layer: SUPRA-L1L2
ref_branch: master
status: open
needs: agent
priority: high
date: 2026-06-02
re: Generic session hygiene protocol
summary: "Promote PUSHED/READY-PR/DISCARDED closeout + session-start git hygiene scan into DevKit as reusable protocol."
---
# TASK - Generic Session Hygiene Protocol

## Recipient Self-Check

Before implementing anything, verify you are in the correct target:

- Target repo: `vibethink-dev-kit`
- Target path: `C:/IA Marcelo Labs/_vibethink-dev-kit`
- Target layer: `SUPRA-L1L2`
- Starting ref: `master` unless Marcelo has assigned a newer DevKit branch

If this task is picked up from a product-repo chat, switch to the DevKit repo first. Do not implement this as a WorkBench-specific rule; WorkBench is only the incident that exposed the generic gap.

## Mission

Promote the fragile-WIP prevention rule into DevKit as a reusable cross-repo session hygiene protocol.

The rule is generic:

- Every branch/worktree must end a session in exactly one intentional state: `PUSHED`, `READY-PR`, or `DISCARDED`.
- Agents/operators must not leave uncommitted WIP older than the current session.
- Session start should run a minimal, non-mutating hygiene scan that flags registered git worktrees with uncommitted or unpushed work older than today.
- The scan is early detection, not a new automation system.

## Trigger / Background

WorkBench found a real hygiene failure: an Opus lane had source WIP preserved only locally for too long, mixed with junk files. The rescue was preserved separately, but the failure class is not WorkBench-specific. DevKit already has comms/inbox hygiene patterns and `comms-sync` warnings for local-only comms/unpushed work; this needs to become a general session protocol that product repos can inherit.

## Scope

Implement the smallest DevKit-native correction:

- Add/adjust the generic agent/session canon so session closeout requires one of `PUSHED`, `READY-PR`, or `DISCARDED`.
- Add/adjust the adoption/session-start guidance so consuming repos can wire a minimal non-mutating git hygiene scan.
- Reuse existing DevKit patterns where possible (`comms-sync`, inbox/session-start guidance, context layering/adoption docs).
- If adding a script, keep it generic, dependency-light, and repo-agnostic. It should inspect git worktrees and flag stale uncommitted/unpushed work; it should not mutate state.
- Make clear that product repos may expose this through repo-local commands such as `pnpm session:start`, but the policy is inherited from DevKit.

## Non-Scope

- Do not add cron jobs, file watchers, daemons, or a new orchestration subsystem.
- Do not make this a WorkBench-only policy.
- Do not rename product identities or touch WorkBench Paperclip compatibility names.
- Do not clean or reset existing WIP in any product repo.

## Acceptance

This task is complete when:

1. DevKit contains the generic closeout rule with the three allowed session-ending states.
2. DevKit documents the session-start scan expectation and how consuming repos should adopt it.
3. Any tooling added is non-mutating and flags stale uncommitted/unpushed work older than today.
4. The change is validated with DevKit's existing checks.
5. The delivery notes explicitly say how WorkBench should consume the generic rule without claiming the rule is WorkBench-specific.
