# FIRST-PROMPT — paste into your first agent session in the new heir repo

> Copy the block below into a fresh agent session **in your repo** (with the kit cloned
> as a sibling at `../_vibethink-dev-kit`). It makes the agent self-orient under the kit
> and finish the bootstrap. Replace `<REPO-NAME>` first.

---

```
You are working in <REPO-NAME>, a repo that just adopted the VibeThink dev-kit (a
supra-repo of engineering governance, cloned as a sibling at ../_vibethink-dev-kit).

Read, in order, before doing anything:
1. ../_vibethink-dev-kit/knowledge/START-HERE.md        (the 2-minute door)
2. ../_vibethink-dev-kit/README.md  →  "The model in 90 seconds"
3. ../_vibethink-dev-kit/setup/USING-THE-KIT.md         (how to actually use it)
4. ./AGENTS.md                                          (this repo's root rules)

Then follow ./AGENTS.md to the inherited generic rulebook. Size limit is not an
excuse to skip it: if it is too large to read wholesale, use targeted search/ranges
and extract at minimum Dev Tooling Baseline; NO BRAIN, NO WORK; Duty to Flag;
inheritance/layering; and tool availability/reporting. If the inherited rulebook
cannot be found or accessed at all, stop loudly per NO BRAIN, NO WORK.

Then do the bootstrap, reporting verdict-first (don't dump):
- Confirm the layering smoke passes:
  node ../_vibethink-dev-kit/tools/check-agent-context.mjs tools/agent-context.config.json
- Run the health board and tell me, in one screen, where we stand:
  node ../_vibethink-dev-kit/tools/devkit-doctor.mjs
- For every RED, name the exact fix. For every gate skipped, say why (no silent gaps).
- Fill docs/DEV_KIT_INHERITANCE_STATUS.md honestly: mark each piece ADOPTED / PENDING /
  N-A(reason). Adopt a piece only if this repo feels the pain it solves — never for
  symmetry. Silence is not a valid status.

Hard rules you now operate under (inherited — do not restate, just obey):
- The repo is the only persistent memory: anything that must survive goes to the repo,
  never only to chat.
- Docs inherit by REFERENCE (never copy a canon); only runnables are copied + parity-gated.
- Don't let me walk into a foreseeable, cheap-to-prevent hole — say it now, fix it if
  cheap, or raise it before I commit (CANON-AGENT-COLLABORATION §6 rule 11).
- Lead every message with the decision layer (verdict first, detail on demand).

End with: what's green, what's pending, and the single next decision you need from me.
```

---

> After this, you're a declared heir. Walk the catalog at your own pace; the doctor is
> your one-command "am I still governed?" check.
