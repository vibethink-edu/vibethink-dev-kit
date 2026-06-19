# Coder-launch-readiness instrument — CANON-CHANGE-PATH-AND-DECISION-CLASSES-001 §3.1

The self-verifiable readiness check that closes **F2**: an agent that decides "dispatch
a coder" must be able to confirm **"is my repo's launch-surface ready?"** itself —
instead of punting the infrastructure to the human, who then becomes the per-repo
verifier.

> **Why it matters:** without this, every coder dispatch ends with the agent saying
> "I didn't verify the launch-surface, that's another lane" and handing the decision
> back. The human becomes the readiness checker for every repo. This gate moves that
> check into the agent's hands.

## The §8.7 split (portable vs L3) — be honest about the boundary

| Half | Who | This gate |
|---|---|---|
| **Portable** — the launch-surface *artifacts* are present (launch script, per-session settings, bot-token env-var declared, optional prompt dir) | a portable gate **can** read it | ✅ checks it |
| **Non-portable** — the live *forge state* (bot account is low-priv, default branch protected) | per-repo, per-forge | ❌ stays your **L3 confirmation** (the GREEN verdict says so) |

So the agent self-checks the portable half and only needs the human for the one
genuinely-forge piece — not the whole infra.

## Files

| File | Role |
|---|---|
| `coder-launch-readiness.config.json` (this template) | **per-repo binding** — copy to `tools/coder-launch-readiness.config.json`; point the paths at your launch surface. |
| `tools/check-coder-launch-readiness.mjs` (in the kit) | the **gate** — RED if any declared artifact is missing/empty. |

## Adopt in two steps

1. **Copy the binding.** `coder-launch-readiness.config.json` → `tools/coder-launch-readiness.config.json`.
   Set `launchScript`, `sessionSettings`, `botTokenEnvVar` (the NAME, not the value), and
   optionally `promptDir`. Omit the file entirely for a conscious N-A (a repo that does
   not launch coders — the board reports the skip, never silent).
2. **Run it.** `node <kit>/tools/check-coder-launch-readiness.mjs tools/coder-launch-readiness.config.json`
   — or just `devkit-doctor`, where it appears as the **coder launch readiness** line.

## Where this sits

Part of the coder-dispatch instrument set: the routing link lives in
`CANON-CHANGE-PATH-AND-DECISION-CLASSES-001` §3.1, the how-to in
`RUNBOOK-LAUNCH-CODERS`, the prompt artifact in `setup/templates/coder-prompt/`, and the
on-ramp is the "Launch your first coder" piece in `ADOPT-DEV-KIT.md`.
