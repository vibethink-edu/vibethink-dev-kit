# Codex — per-agent adapter (pointer)

> **This is an adapter, not a rules copy.** The single source of truth is the
> neutral authority. This file only points to it. Maintaining a second,
> divergent Codex rules tree here is prohibited (see canon §5 — no parallel
> constitution for any single agent).

**Read, in order:**

1. **`AGENTS_UNIVERSAL.md`** — the single authority (all universal rules).
2. **`CANON-CROSS-AGENT-CONTEXT-LAYERING.md`** — layering, context budget,
   anti-contamination, and the `check-agent-context` smoke test.
3. **The project's own `AGENTS.md`** (if present) — project-specific rules that
   extend the authority.

**Loading note (the reason the budget rule exists):** Codex loads `AGENTS.md`
by the *session* working directory and silently truncates the doc beyond its
`project_doc_max_bytes` limit (32 KiB default). The authority is kept under
that budget so nothing is dropped; if a repo's root rules file must grow,
either layer detail into subdirectories or raise the limit with a tracked
`.codex/config.toml` override — never let the root grow past the budget
unchecked.

*No copies below this line.*
