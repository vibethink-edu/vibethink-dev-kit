# ADR-20260525-governed-agent-task-dispatch

**Status:** ACCEPTED
**Date:** 2026-05-25
**Decider:** Marcelo

## Decision

Any task, review request, handoff, or audit assigned to another agent must be sent
through the governed shared-channel send path. Creating a local task file,
roadmap entry, or note is not enough.

## Why

The orchestration canon already states that the human is not the message bus and
that agent-to-agent work moves through the shared channel. In practice, an agent
can still write a task file and forget to route it through the inbox. That creates
the same failure mode: the work exists in a repo but has not been delivered to the
agent that must act on it.

The dispatch rule must be explicit and loaded by every agent because the failure
is procedural, not technical. The command existed; the agent simply did not use
it until corrected.

## Rule

When assigning work to another agent:

1. Write any long-form task/reference document if useful.
2. Send the actionable handoff through the shared channel using the governed send
   command provided by the repo, e.g. `node tools/comms-send.mjs ...`.
3. Verify the recipient inbox can see it, e.g. `node tools/inbox.mjs <agent>`.
4. Commit and push the dispatch artifact.

If the send tool is unavailable, manually create the shared-channel comm with
valid front matter, commit it, push it, and verify inbox routing. Do not stop at a
local doc.

When receiving work from an inbox item, the recipient agent must self-check the
target before acting:

1. Read `repo`, `target_layer`, `ref_branch`, `ref_doc`, `ref_pr`, and any
   explicit path in the comm body.
2. Compare those fields to the current working directory, branch, and methodology
   layer.
3. If they do not match, switch to the target repo/branch/layer before acting, or
   report that the target is inaccessible.
4. Never perform the task in the repo where the comm was merely noticed unless
   that repo is the target.

Governance `task`, `review`, and `audit` comms must include `target_layer:`
(`SUPRA-L1L2`, `product-L3`, or `both`), `ref_branch:`, and a body section titled
`Recipient Self-Check` that repeats the repo, branch, layer, and primary paths in
plain language for the recipient.

## Alternatives rejected

- **Local task file only** - indexable, but not delivered to the recipient inbox.
- **Ask the human to relay it** - makes the human the message bus.
- **Rely on memory to run comms-send** - failed in the originating session.

## Consequences

- Any future agent can identify whether a task was actually dispatched by looking
  for the shared-channel comm.
- Any receiving agent can identify the correct repo/branch without relying on the
  human to redirect it.
- Long-form task docs remain allowed, but they are references, not dispatch.
- The recipient's inbox becomes the source of truth for open assigned work.
- Tooling can later lint for `TASK-*` docs that have no matching comms dispatch.

## Evidence

- Originating incident: on 2026-05-25, a task for Opus to audit VT-Method was
  first written as `doc/TASK-OPUS-VT-METHOD-EXHAUSTIVE-AUDIT-2026-05-25.md`
  but not initially sent through `tools/comms-send.mjs`.
