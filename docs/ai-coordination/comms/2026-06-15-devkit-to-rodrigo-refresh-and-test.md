---
from: devkit-arquitecto
to: Rodrigo (external developer · macOS · first non-Windows heir)
type: onboarding / refresh + test
repo: <Rodrigo's own project repos>
ref_doc: setup/templates/heir-bootstrap/ · setup/USING-THE-KIT.md §1.5 · README "Platform compatibility"
status: OPEN — awaiting Rodrigo's first `devkit-doctor` green on macOS
tldr: Rodrigo is testing the dev-kit on his own repos on a Mac (the kit's first non-Windows consumer). Refresh the mounted kit, run the doctor, report. His first green doubles as the macOS validation (README compatibility 🟡 → ✅).
---

# Refresh + test — for Rodrigo (macOS, first Mac heir)

## Why a refresh first
The kit changed a lot today. Because canon inherits **by reference**, refreshing the
mounted kit is almost free — pull it and your rules are current; you re-sync nothing.

```bash
git -C ../_vibethink-dev-kit fetch origin && git -C ../_vibethink-dev-kit merge --ff-only origin/master
```

That brings, among others:
- the **macOS fix** — `check-tools.sh` now probes `python3` (not just `py`/`python`), so
  graphify detection works on a Mac;
- the **heir-bootstrap** bundle (`setup/templates/heir-bootstrap/`);
- the **`devkit-doctor`** 5-gate health board + the SUPRA map + the compatibility table.

## Test (≈10 min)
1. **Fresh start?** Copy `setup/templates/heir-bootstrap/` into your repo, fill the
   `<slots>`, and paste `FIRST-PROMPT.md` into your first agent session.
2. **Health board** (verdict first, one screen):
   ```bash
   node ../_vibethink-dev-kit/tools/devkit-doctor.mjs
   ```
3. **Per-piece update** (if you'd cloned earlier): follow `setup/USING-THE-KIT.md §1.5`
   — copy-parity tells you what (if anything) to re-copy; nothing else moves.

## The favor (and why it matters)
Your run is the kit's **first exercise on macOS** (it's been validated on Linux + Windows
only). So:
- If `devkit-doctor` comes back **GREEN**, tell me — we flip macOS from **🟡 expected** to
  **✅ validated** in the README, with your run as the evidence.
- If anything behaves oddly (a bash script, a path, a `python3`, a CRLF/LF thing), **note
  it** and send it back. It's not noise — every rule in this kit was born from a real bump,
  not theory. A kit-finding from you is exactly how the kit earns its third platform.

## Notes
- If you use Claude Code: `setup/CLAUDE-CODE-PERMISSIONS.md` has some `PowerShell(...)`
  examples — **ignore those** (Windows), use the `Bash(...)` entries.
- Adopt catalog pieces **only when you feel the pain they solve** — never for symmetry.
  `N-A(reason)` is a complete status; silence is not.

— routed via Marcelo (Rodrigo is external; no repo lane). Reply path: a kit-finding to the
dev-kit's comms lane, or straight to Marcelo.
