# Claude — per-agent adapter (pointer)

> **This is an adapter, not a rules copy.** The single source of truth is the
> neutral authority. This file only points to it. Maintaining a second,
> divergent Claude rules tree here is prohibited (see canon §5 — no parallel
> constitution for any single agent).

**Read, in order:**

1. **`AGENTS_UNIVERSAL.md`** — the single authority (all universal rules).
2. **`CANON-CROSS-AGENT-CONTEXT-LAYERING.md`** — layering, context budget,
   anti-contamination, and the `check-agent-context` smoke test.
3. **The project's own `AGENTS.md`** (if present) — project-specific rules that
   extend the authority. The project file wins for project-specific concerns;
   the authority wins for universal ones.

**Loading note:** Claude Code walks up from the working directory and reads
rules files it finds. Keep the authority self-sufficient at its level so a
session scoped to a subdirectory still receives the critical rules.

*No copies below this line.*
