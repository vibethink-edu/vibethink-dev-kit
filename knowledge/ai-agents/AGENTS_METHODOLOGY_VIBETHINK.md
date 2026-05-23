# AGENTS Methodology — VibeThink (org / methodology layer · LEVEL 2)

> **This is the LEVEL-2 layer** of `CANON-CROSS-AGENT-CONTEXT-LAYERING.md` §8:
> the org's house-methodology, brand, concrete stack, ports, tooling, and DB
> examples. It is **not** vendor-neutral on purpose — that is the whole point of
> separating it from the neutral core.
>
> - **LEVEL 1 (neutral core):** `AGENTS_UNIVERSAL.md` — agnostic principles only.
>   It must read clean of any product name, vendor brand, or methodology name.
> - **LEVEL 2 (this file):** the VibeThink-specific bindings of those principles.
> - **LEVEL 3 (product repo):** a single product's rules, vocabulary, stack.
>
> Everything here was extracted from `AGENTS_UNIVERSAL.md` to keep the neutral core
> passing the §8 fire-test (review finding #3, 2026-05-22). Nothing was lost — the
> neutral core keeps the agnostic principle; this file holds the concrete binding.

---

## 1. Kit access — "NO BRAIN, NO WORK" (concrete)

Neutral principle (level 1): *verify access to the project's knowledge base before
writing code; if absent, stop and request access.* The VibeThink binding:

**You MUST have access to `_vibethink-dev-kit`. Two ways:**
1. **Workspace Mode:** the `_vibethink-dev-kit` folder is visible in the IDE.
2. **Symlink Mode:** a `.vibethink-core/` folder exists at the project root.

**If you find neither — STOP:**

```
⚠️ ALERTA: No tengo acceso al _vibethink-dev-kit (Cerebro del Proyecto).
❌ Riesgo: Generar código fuera de estándar.
🛠️ Solución:
   1. VS Code: agrega la carpeta _vibethink-dev-kit al Workspace.
   2. CLI (Windows): ejecuta ../_vibethink-dev-kit/tools/mount-devkit.ps1
   3. CLI (Linux/Mac): ejecuta ../_vibethink-dev-kit/tools/mount-devkit.sh
```

## 2. Port assignment (global standard)

Neutral principle (level 1): *ports come from a project-wide registry, never
guessed.* The VibeThink global map:

- **3000–3049:** main applications (each project gets a block of 10)
- **3050–3099:** external references / demos (Bundui = 3050, Shadcn = 3051, ReactFlow = 3052)
- **3100+:** testing and temporary development

**Full reference:** `_vibethink-dev-kit/knowledge/PORT_ASSIGNMENT_GLOBAL.md`

## 3. Stack constraints (concrete version pins & known-bad combos)

Neutral principle (level 1): *don't mix incompatible build tools; pin exact
versions.* The VibeThink known-bad combinations:

```bash
# ❌ NEVER install Express 5 (use 4.21.2)
# ❌ NEVER mix Vite + Webpack in the same project
# ❌ NEVER install `next` in a Vite project (or vice versa)
# ❌ NEVER use caret (^) version ranges in dependencies
# ❌ NEVER create .npmrc or .env.example inside apps/
```

The full version-pin / conflict list is the org's stack-compatibility record (kept in
the org/product repo, not in this neutral-adjacent layer).

## 4. Multi-tenant data access (concrete DB example)

Neutral principle (level 1): *scope every query by its tenant key; never query a
shared table without a tenant filter.* The VibeThink/Supabase binding:

```typescript
// ✅ ALWAYS filter by company_id (multi-tenant)
const data = await supabase
  .from('users')
  .select('*')
  .eq('company_id', user.company_id);

// ❌ NEVER query without tenant isolation
const data = await supabase.from('users').select('*');
```

The exact tenant-key field and client/ORM are product-specific — confirm in the
product repo (e.g. `tenant_id` vs `company_id`).

## 5. Validation commands (concrete script names)

Neutral principle (level 1): *run the project's validation scripts before and
after changes.* The VibeThink scripts:

```bash
# BEFORE changes
npm run validate:quick

# AFTER changes
npm run validate:universal
npm run validate:architecture
npm run validate:branding
```

## 6. AI capability mapping (concrete agent products)

Neutral principle (level 1): *agents with terminal/tool access → FULL protocol;
agents without → LITE protocol (declare limitations).* The product mapping:

- **Cursor IDE → FULL** (terminal access)
- **Claude Code → FULL** (terminal access)
- **GPT Web → LITE** (limited access — declare limitations)

## 7. Inheritance — concrete paths & project template

Neutral principle (level 1): *each repo inherits the neutral core + adapters and
extends them in its own layer.* The VibeThink concrete layout:

```
_vibethink-dev-kit/
├── knowledge/ai-agents/
│   ├── AGENTS_UNIVERSAL.md                   ← neutral core (level 1)
│   ├── AGENTS_METHODOLOGY_VIBETHINK.md       ← THIS FILE (level 2)
│   ├── CANON-CROSS-AGENT-CONTEXT-LAYERING.md ← layering canon
│   ├── CODEX.md / CLAUDE.md / ...            ← per-agent adapters (pointers)
│   └── .cursorrules                          ← cursor adapter template
│
project-specific/
├── AGENTS.md                    ← inherits + extends (level 3)
├── .cursorrules                 ← inherits + customizes
└── [project-specific-docs]
```

### Project `AGENTS.md` template (with VibeThink stack)

```markdown
# Project Mission
[Project-specific mission]

# Inherits From
- `_vibethink-dev-kit/knowledge/ai-agents/AGENTS_UNIVERSAL.md`
- `_vibethink-dev-kit/knowledge/ai-agents/CANON-CROSS-AGENT-CONTEXT-LAYERING.md`

# Quick Operations (Project-Specific)
| Action | Command |
|--------|---------|
| Start dev | `.\scripts\start-dashboard.ps1` |
| Stop all | `.\scripts\stop-dashboard.ps1` |
| Build | `npm run build:dashboard` |

# Tech Stack (Project-Specific)
[Stack details]

# Project-Specific Rules
[Additional rules]
```

A ready-to-fill template also lives in `setup/templates/AGENTS.md.template` and a
fully-worked example in `setup/templates/AGENTS_GOLDEN.example.md`.

---

**Maintained by:** the dev-kit (supra-repo upstream).
**Origin:** extracted from `AGENTS_UNIVERSAL.md` on 2026-05-22 (review finding #3)
to restore the level-1 fire-test (no brand/stack/tool/DB names in the neutral core).
