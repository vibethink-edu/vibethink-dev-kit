# AI Agent Compatibility Matrix — which file each tool reads

> **Status:** reference (compatibility facts; the governing model is
> `CANON-CROSS-AGENT-CONTEXT-LAYERING.md`).
> **What this is.** The verified map of *which rules file each AI coding tool
> actually loads*, so a repo wires ONE root rulebook + one-line adapters
> instead of N parallel rulebooks. How the layering works (root + adapters +
> budgets + the smoke that gates it) lives in the canon — this file only keeps
> the per-tool facts current.

## The matrix

| Tool | File it reads | Confirmed? | Notes |
|---|---|---|---|
| Claude Code | `AGENTS.md` | ✅ | open [agents.md](https://agents.md) standard |
| Claude Code | `CLAUDE.md` | ✅ | vendor adapter (pointer to the root) |
| Codex | `AGENTS.md` | ✅ | loads by session cwd; **byte budget ~32 KiB** — an oversized root truncates silently (the smoke's root-budget check guards this) |
| Codex | `CODEX.md` | ⚠️ unconfirmed | shipped for consistency (pointer) |
| GitHub Copilot | `.github/copilot-instructions.md` | ✅ | GitHub standard (pointer) |
| Windsurf | `.windsurfrules` | ✅ | pointer |
| Cursor | `.cursorrules` | ✅ | must reference the root explicitly (no auto-load of `AGENTS.md`) |
| Gemini-family CLIs | — | ⚠️ | no hierarchical auto-load; the root rule must instruct agents to read subdir rules manually |

**The shape this matrix serves:** ONE root rulebook (`AGENTS.md`, following the
open standard) + per-tool **one-line pointer adapters**. Never N parallel
rulebooks — that is the drift the layering smoke exists to catch.

## Enforcement (gated, not advisory)

The historical caveat "files are suggestions, no real enforcement" is obsolete:
`tools/check-agent-context.mjs` (the layering smoke, reusable via
`.github/workflows/agent-context.yml`) verifies on every PR that:

- the root fits the most restrictive tool's byte budget (no silent truncation),
- every adapter exists, points at the root, and stays within its size cap,
- no parallel rulebook contradicts the root (repo-wide scan),
- neutral core files leak no brand/vendor names.

**Do NOT "maximize compliance" by duplicating critical rules across files** —
that legacy advice is the exact anti-pattern the inheritance contract forbids
(two normative copies drift). One root, pointers, and the gate.

## Platform requirements (validated)

The engines are **pure Node (zero npm dependencies) and cross-platform** —
Linux, macOS, Windows. Evidence: the kit's own CI gates run them on Linux on
every PR, and consuming repos run them daily on Windows (hooks + local runs).
Requirements: **Node 20+** and **git** on PATH. The mount convenience script
ships in both shells (`mount-devkit.sh` / `mount-devkit.ps1`).

## Adding a new tool

1. Find which file the tool actually loads (vendor docs / empirical test).
2. Add a one-line pointer adapter (copy any existing adapter).
3. Register it in your repo's `tools/agent-context.config.json` so the smoke
   verifies it.
4. Add the row here with its confirmation status.

## Known limits (still true)

- Reading ≠ obeying: a rules file instructs; the agent's harness decides how
  strongly. The gates verify the *files*; behavioral compliance is reviewed.
- Each tool prioritizes instructions differently; keep critical rules at the
  top of the root.
- Long roots truncate on the most constrained tools — the byte-budget check is
  the floor, brevity is the discipline.
