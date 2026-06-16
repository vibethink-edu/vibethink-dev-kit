---
type: task
from: devkit-arquitecto
to_agent: workbench-arquitecto
to: workbench-arquitecto
repo: vibethink-dev-kit
target_layer: product-L3
ref_branch: main
status: open
needs: agent
priority: high
date: 2026-06-16
re: Apply devkit-upgrade + declare adoption (WorkBench)
---
> **From:** devkit-arquitecto · **To:** the WorkBench seat (its agent + Marcelo).
> **Act in:** vibethink-workbench (product-L3), in a branch off main. The dev-kit only provides the indications — it does not reach across systems.

## Context
`devkit-upgrade --dry-run` validated clean in WorkBench (the trio works on a real consumer, not just the kit's self-dogfood). Two findings to act on, in WorkBench's own seat.

## Steps (in WorkBench, in a branch off main)

1. **Re-sync the drifted copied runnable** — run the real upgrade:
   `node ../_vibethink-dev-kit/tools/devkit-upgrade.mjs`
   It re-syncs `check-agent-context.mjs` (drifted from upstream) and provisions any MISSING tool. It will NOT touch graphify (present) — present-but-behind is reported, never auto-moved (the pin rule). Review with `git diff`; the only changed file should be the re-synced runnable.

2. **graphify (optional):** present at 0.8.20, which is acceptable (acceptInstalled >= 0.8). To reach the pin: `pip install -U graphifyy==0.8.39`. Not required — a pin move is your call.

3. **Declare adoption (the bigger gap):** `devkit-doctor --adoption` shows "no adoption declared" (gates wired 2/9, no DEV_KIT_INHERITANCE_STATUS.md). Create it from the kit's template (`setup/templates/DEV_KIT_INHERITANCE_STATUS.template.md`), declaring each piece WIRED / DECLARED-ONLY / N-A(reason) / PENDING — no silent gaps. This turns "uses the kit" into "declared heir"; connects to handoff #92.

## Verify
- `devkit-doctor` → gates green
- `devkit-upgrade --dry-run` → copied runnables all in sync
- `check-inheritance-claims <status-doc>` → VALID (once the status doc exists)

## Recipient Self-Check
- **Branch:** work in a branch off main in vibethink-workbench (product-L3) — not in the dev-kit.
- **Repo / layer:** this targets the WorkBench repo (L3 consumer); the dev-kit (upstream) is not modified by any of these steps.
- **Reversible:** the re-sync lands in git (review git diff); the pin bump and the status doc are additive.
- **Authority:** applying is WorkBench's seat decision; the dev-kit advises, it does not act across the boundary.
