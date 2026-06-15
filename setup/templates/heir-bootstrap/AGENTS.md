<!-- Heir root rulebook (template). Copy to your repo root as AGENTS.md, fill the <slots>,
     delete these comments. This is the ONE root every agent reads; per-agent files
     (CLAUDE.md, CODEX.md, .cursorrules…) are one-line pointers to it, never copies. -->
# <REPO-NAME> — agent rules

This repo **inherits the dev-kit's universal authority**:
`../_vibethink-dev-kit/knowledge/ai-agents/AGENTS_UNIVERSAL.md` — the rules below
**extend** it, they never replace it. When the two conflict on a universal concern,
the authority wins; for repo-specific concerns, this file wins.

> New here? Read `../_vibethink-dev-kit/knowledge/START-HERE.md` (2-minute door), then
> `../_vibethink-dev-kit/setup/USING-THE-KIT.md` (how to actually use the kit).

## Repo-specific rules

<!-- Put ONLY what is specific to this repo. Do not restate universal rules — they are
     inherited above. Example slots: -->
- **Stack / runtime:** <e.g. Node 20 · pnpm · Next.js — or N-A>
- **What this repo is (and is NOT):** <one or two lines so an agent self-orients>
- **<your one real hard rule>** <the thing an agent must never get wrong here>

## Dev-Kit inheritance

This repo's per-piece adoption status is declared in
[`docs/DEV_KIT_INHERITANCE_STATUS.md`](docs/DEV_KIT_INHERITANCE_STATUS.md) — every
catalogued piece is `ADOPTED` / `PENDING` / `N-A(reason)`. **Silence is not a skip.**

<!-- Per-agent adapters (create the ones you use, each a one-line pointer to THIS file;
     verified map: ../_vibethink-dev-kit/knowledge/ai-agents/AI_AGENT_COMPATIBILITY.md):
       CLAUDE.md → "Read AGENTS.md."   (Claude Code users: also see
       ../_vibethink-dev-kit/setup/CLAUDE-CODE-PERMISSIONS.md for a safe settings.json)
       CODEX.md / .cursorrules / .windsurfrules → same one-liner. -->
