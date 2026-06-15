# Heir bootstrap — zero to declared heir in ~10 minutes

> **What this is.** A copy-and-go bundle for a repo adopting the dev-kit. The on-ramp
> ([`../../USING-THE-KIT.md`](../../USING-THE-KIT.md)) tells you *what* to do; this gives
> you the *files* to do it. Copy this folder's contents into your repo root, fill the
> `<slots>`, run the doctor. That's it.

## Do this (in order)

1. **Mount the kit** as a sibling of your repo (one-time, per machine):
   ```bash
   git clone <kit-url> ../_vibethink-dev-kit
   ```
2. **Copy this folder's contents into your repo root** (it mirrors the target layout):
   ```
   AGENTS.md                         → your root rulebook (inherits the kit)
   tools/agent-context.config.json   → the layering-smoke config
   tools/copy-parity.config.json     → the drift guard (starts at "no copies")
   .github/workflows/agent-context.yml → wires the smoke in CI (reusable workflow)
   FIRST-PROMPT.md                   → paste into your first agent session
   ```
   Plus your **status doc**: copy
   [`../DEV_KIT_INHERITANCE_STATUS.template.md`](../DEV_KIT_INHERITANCE_STATUS.template.md)
   to `docs/DEV_KIT_INHERITANCE_STATUS.md`.
3. **Fill the `<slots>`** — search the copied files for `<` and replace (your repo name,
   which agents you use, your one real repo-specific rule). Each slot has a comment.
4. **Run the doctor** — one screen, verdict first:
   ```bash
   node ../_vibethink-dev-kit/tools/devkit-doctor.mjs
   ```
   Green (or honest skips) = you're a declared heir. A red names exactly what to fix.

## Then
- Walk the catalog ([`../../ADOPT-DEV-KIT.md`](../../ADOPT-DEV-KIT.md)) and adopt further
  pieces **only when you feel the pain they solve** — never for symmetry. Flip rows in
  your status doc as you go; `N-A(reason)` is a complete answer, silence is not.
- See the whole picture: [`../../../knowledge/SUPRA-MAP.md`](../../../knowledge/SUPRA-MAP.md).

> **The rule of inheritance:** docs are inherited **by reference** (you point at the kit,
> never copy a canon); only **runnables** are copied (and the copy-parity gate guards
> them). Full contract: [`../../INHERITANCE-CONTRACT.md`](../../INHERITANCE-CONTRACT.md).
