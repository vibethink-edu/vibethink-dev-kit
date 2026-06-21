# AGENTS Universal (vendor-neutral core)

[![AGENTS.md](https://img.shields.io/badge/AGENTS-UNIVERSAL-blue)](https://agents.md)

> **🚪 ¿Primera vez? Leé `knowledge/START-HERE.md` primero** (la puerta de 2 minutos), después esto.
>
> **Este archivo define las reglas GENÉRICAS que TODOS los repos heredan.**
> Los proyectos específicos extienden estas reglas con su propio `AGENTS.md`.
>
> **Disciplina cross-agent (capa universal):**
> - `CANON-CROSS-AGENT-CONTEXT-LAYERING.md` — layering, presupuesto por agente más
>   restrictivo, anti-contaminación, smoke test (cómo leen las reglas los agentes).
> - `CANON-MULTI-AGENT-ORCHESTRATION.md` — handoff entre agentes y el humano: gates
>   de máquina auto-vigilados, inbox por agente, escalación de juicio al humano,
>   feed + interrupt (el humano no es el bus de mensajes). Si asignás una tarea a
>   otro agente, no basta escribir un `TASK-*`: enviá el handoff por el shared
>   channel con `comms:send`, commit/push, y verificá el inbox del destinatario.
> - `REVIEW-READINESS-PROTOCOL.md` — ciclo de readiness antes de pedir review:
>   probá en la capa que da la señal verdadera, declarala, adjuntá evidencia,
>   vigilá gates de máquina sin usar al humano como relay, y dejá los adaptadores
>   concretos en el repo consumidor.
>
> **Disciplina de decisiones (capa universal):**
> - `../architecture/CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING.md` — toda
>   decisión de arquitectura/contrato/comportamiento se escribe en **Markdown/ADR**
>   (el binding indexable por un knowledge-graph). Los markers inline son
>   *advisory* para el lector humano y enlazan al ADR; no lo reemplazan para
>   indexación. Antes de implementar una dependencia, runtime, CDN/font/render
>   source, contrato, boundary cross-tenant, o comportamiento AI-assisted /
>   model-driven (worker, assistant flow, extracción, acción elegida por modelo),
>   clasificá si requiere ADR/canon y escribilo primero. Las decisiones son
>   ciudadanos de primera clase del repo, no efímeras de la conversación.

---

## 🔥 LEVEL 1: CRITICAL (Read Always - Before ANY Task)

### ⚡ Mandatory First Actions

**BEFORE doing ANYTHING in a project that inherits this kit, the AI MUST:**

```bash
# Step 1: Identify Project Structure
list_dir project_root/           # What type of project is this?
list_dir project_root/scripts/   # What operational scripts exist?

# Step 2: Read Essential Files
read_file README.md              # Project overview
read_file AGENTS.md              # Project-specific rules (if exists)
read_file package.json           # Available npm scripts

# Step 3: Identify Operational Scripts
glob_search "*.ps1"              # PowerShell scripts (Windows)
glob_search "*.sh"               # Shell scripts (Unix)

# Step 4: Note Quick Commands
# Document what you found in your response
```

### 🚨 Protocol: "NO BRAIN, NO WORK"

**Before writing code, verify you have access to the project's shared knowledge
base** (the kit / "brain" that holds the standards). If you cannot find it, do
**not** guess standards — **stop and request access**:

> ⚠️ ALERT: I don't have access to the project's knowledge base (the standards "brain").
> ❌ Risk: generating code outside the project standard.
> 🛠️ Fix: add the knowledge base to the workspace, or run the project's mount script.

> The concrete folder names, symlink path, mount script, and IDE steps are
> org-specific — see the **methodology layer (level 2)**.

### 🛡️ Quick Operations Reference

**Every project MUST have operational scripts. Find them FIRST:**

| Pattern | Purpose |
|---------|---------|
| `scripts/start*.ps1` | Start development server |
| `scripts/stop*.ps1` | Stop server/processes |
| `npm run dev:*` | Development via npm |
| `npm run build:*` | Build via npm |

**NEVER use generic commands when project scripts exist.**

### 🚦 Port Assignment

**Ports come from a project-wide registry — never guessed.** Before starting any
server, read the project's port registry and use the assigned block.

**NEVER guess port numbers — check the project's port registry first.**

> The concrete global port map (ranges, reserved demos) is org-specific — see the
> **methodology layer (level 2)**.

### ❌ Never Do (Universal)

```bash
# ❌ NEVER mix incompatible build tools / bundlers in one project
# ❌ NEVER install a framework into a project built on a different one
# ❌ NEVER use floating / caret (^) version ranges — pin exact versions
# ❌ NEVER install dependencies in both root and app folders
# ❌ NEVER guess operational commands - find project scripts first
# ❌ NEVER expose API keys in frontend code
# ❌ NEVER create reports/validations/work files in project root
# ❌ NEVER leave temporary files unorganized
# (concrete version pins & known-bad stack combos: see the methodology layer)
```

### ✅ Always Do (Universal)

```bash
# ✅ ALWAYS read AGENTS.md before starting work
# ✅ ALWAYS identify and use project-specific scripts
# ✅ ALWAYS use exact versions in package.json
# ✅ ALWAYS verify compatibility before suggesting updates
# ✅ ALWAYS ask user before architectural changes
# ✅ ALWAYS commit frequently with descriptive messages
# ✅ ALWAYS create reports/validations in work/ folder structure
# ✅ ALWAYS organize temporary files in work/ subdirectories
# ✅ ALWAYS, on a "refresh / update the kit" request (any phrasing) → run the kit's Refresh trigger (see the on-ramp): upgrade → re-read the change-delta → present a short adoption card + WAIT for GO → on GO, wire + re-run the health board. A short prompt yields a short menu, never a silent mass-change.
# ❌ NEVER create .md files for every analysis - do analysis in response, only create .md for significant reports
```

### 🧰 Dev Tooling Baseline — RTK + Graphify (USE BY DEFAULT · graceful fallback · non-blocking)

> **Status: USE BY DEFAULT — provisioned in every dev environment (owner standard of care);
> the kit ships the pins + install recipes (`setup/EXTERNAL-TOOLS.md`). A quality/performance
> enhancement, NEVER a correctness dependency. Non-blocking: no CI gate, no merge gate, no
> error if absent.**
>
> **Mental model: a database index.** A query runs correctly without the index — just slower;
> you always add it because the gain is worth it. Same here: provision AND use these by default.
> Their absence DEGRADES the experience (more tokens, blind grep); it does NOT fail anything.

- **Use them by default — expected, not optional.** When provisioned, reach for `rtk` and
  `graphify` as described below instead of going straight to raw/blind commands. The gain
  (tokens, orientation) is why they are the standard of care, not a nicety.
- **Graceful fallback, documented — never silent.** If the environment cannot provision them
  (install fails, offline, unsupported platform), proceed WITHOUT them AND say so in your
  report/PR — e.g. `rtk/graphify unavailable: <reason>`. The only wrong move is a silent skip.
- **RTK** (token economy): wrap noisy/verbose command output (listings, builds, tests, logs,
  `status`, `find`) with `rtk`. Skip already-compact output (e.g. `git log --oneline`).
- **Graphify** (code navigation): use for orientation (hubs, what-defines-what, dead-code,
  "what touches X") BEFORE blind grep. On-demand, no permanent runtime; index the subdir you
  work in (not the whole monorepo); gitignore `graphify-out/`. Graphify ORIENTS — verify
  authoritative dependencies with `git grep`.
- **Still NEVER a correctness gate.** "Use by default" is an expectation on agent diligence,
  NOT a CI/merge gate: a repo / agent / CI without them still works fully and passes. Do NOT
  let the *use* expectation harden into a *correctness* gate — the documented fallback is
  always a valid path.
- **Not in the A/B dev-tooling baseline (use-by-default):** agentmemory. *(**Engram — superseded 2026-06-21 by Marcelo:** Engram was previously listed here as "not adopted". That decision was reconsidered and **reverted**: Engram **is adopted**, separately, as a **class-C operator memory tool** — opt-in, per-agent, stateful — see [`setup/EXTERNAL-TOOLS.md`](../../setup/EXTERNAL-TOOLS.md). "Adopted" here means the **use-by-default baseline** (RTK+Graphify); Engram lives at the **operator/lifecycle layer** (§8), is NOT use-by-default, NOT a correctness gate, and NOT a product dependency.)*
- Tool **versions + install lifecycle**: the kit ships the DEFAULT registry at
  `setup/EXTERNAL-TOOLS.md` (pins, recipes, evidence, version-forward). A repo MAY override
  with its own EXTERNAL-TOOLS registry — per-repo lifecycle wins, override declared visibly.
  This layer declares the *use* baseline (use-by-default + documented fallback).

### 🗣️ Duty to Flag (CRITICAL — culture law)

**Noticing something and staying silent is the only real fault.** Mistakes are
cheap to fix when flagged in the moment; silent observations become someone
else's incident. Human or agent, when you notice a bug, a doc gap, a gotcha,
a better way, or something already-solved being rebuilt:

1. **SAY it** in the moment — even mid-task, even out of scope.
2. **WRITE it** where it survives (finding in the comms lane, session log,
   spec note — never only in chat: what lives only in a conversation dies
   with it).
3. **FIX it or ROUTE it** to the owner (the elevation filter decides whether
   it rises to the kit or dies locally — but it gets DECIDED, not buried).

Nobody should hit the same stone twice because the first one who saw it kept
quiet. This duty outranks scope, politeness, and "not my task".

**Preventive edge — don't let the human walk into a foreseeable hole.** Flagging is
about what you *notice*; this is about what you *foresee*. When you see a problem
coming — a bug about to ship, a decision about to be made on a wrong premise, a
cheap-to-prevent failure — you do **not** stay silent or wait to be asked: say it
**now**, fix it then-and-there if it's cheap and within your authority, or raise it
**before** the human commits if the call is theirs. **The smaller and cheaper the
fix, the less excusable the silence** — an unflagged, preventable hole is *your*
failure, not the human's. (Constitutional: `CANON-AGENT-COLLABORATION` §6 rule 11.)

### 📁 File Organization Rule (CRITICAL)

**REGLA FUNDAMENTAL:** ❌ **NUNCA** crear archivos de trabajo/reportes/validaciones en la raíz del proyecto.

**SIEMPRE usar estructura `work/`:**

```
work/
├── validations/     # Reportes de validación y auditorías
├── reports/         # Reportes de análisis y documentación temporal
└── temp/            # Archivos temporales y borradores
```

**Convenciones de nombres:**
- Formato: `[TIPO]_[DESCRIPCION]_[FECHA].md`
- Tipos: `VALIDACION_`, `REPORTE_`, `AUDITORIA_`, `ANALISIS_`
- Ejemplo: `VALIDACION_DEV_KIT_2025-01-XX.md`

**Referencia completa:** `work/README.md`

---

## 📋 LEVEL 2: WORKFLOW (Read When Working)

### General Workflow

1. **Analyze**: Read `AGENTS.md`, `DOCS_INDEX.md`, relevant code
2. **Plan**: Create short plan before changes
3. **Implement**: Write clean, documented code
4. **Verify**: `npm run build` + `npm run dev` without errors
5. **Document**: Update `CHANGELOG.md` for significant changes

### Pre-Commit Checklist

**ANTES de `git commit`, PREGUNTAR al usuario:**

```
¿Actualizamos la versión antes de hacer commit?

Cambios realizados:
- [Lista breve de cambios]

Opciones:
- Sí: Actualizar versión + CHANGELOG
- No: Commit sin versión (solo para cambios menores/docs)
```

### 🛡️ Git Safety Protocol (Prevención de Pérdida de Trabajo)

**CRÍTICO:** Este protocolo previene la pérdida de trabajo local por sincronización incorrecta con GitHub.

#### ⚠️ Problema Común: Push vs Pull Confusión

**Escenario peligroso:**
- Usuario quiere **enviar** cambios a GitHub (`git push`)
- Por error se **traen** cambios de GitHub (`git pull`)
- Resultado: Trabajo local sobrescrito por cambios remotos

#### ✅ Protocolo de Seguridad Git

**ANTES de cualquier operación de sincronización:**

```bash
# 1. SIEMPRE verificar estado local primero
git status                    # Ver cambios pendientes
git log --oneline -5          # Ver últimos commits locales
git branch                    # Ver rama actual

# 2. Si quieres ENVIAR a GitHub (push):
git log origin/main..HEAD --oneline  # Ver commits locales que GitHub no tiene
# Si hay commits, puedes hacer push
git push origin main

# 3. Si GitHub rechaza el push:
# ❌ NO hacer git pull automáticamente
# ✅ Verificar qué hay en GitHub primero:
git fetch origin             # Traer info SIN fusionar
git log HEAD..origin/main --oneline  # Ver qué commits tiene GitHub
# Decidir: ¿realmente necesitas esos cambios remotos?
```

#### 🚨 Reglas de Oro para Push/Pull

**Para ENVIAR cambios (push):**
```bash
# ✅ CORRECTO: Verificar antes de push
git status
git log --oneline -3
git push origin nombre-rama

# ❌ INCORRECTO: Hacer pull antes de push sin verificar
git pull origin main  # ¡PELIGRO! Puede sobrescribir trabajo local
```

**Si GitHub rechaza el push:**
```bash
# Mensaje típico:
# ! [rejected] main -> main (non-fast-forward)
# error: failed to push some refs to 'origin'

# ❌ NO hacer esto automáticamente:
git pull origin main  # Puede sobrescribir tu trabajo

# ✅ Hacer esto primero:
git fetch origin                    # Traer info sin fusionar
git log HEAD..origin/main --oneline # Ver qué hay en GitHub
# Decidir si realmente necesitas esos cambios

# Si tu versión local es la correcta:
git push origin main --force  # Solo si estás 100% seguro
```

#### 🔍 Verificación Pre-Sincronización

**SIEMPRE ejecutar antes de push/pull:**

```bash
# 1. Estado del repositorio
git status --short

# 2. Commits locales vs remotos
git fetch origin  # Actualizar info remota SIN fusionar
git log --oneline --graph --all -10  # Ver divergencias

# 3. Verificar divergencias
git log origin/main..HEAD --oneline   # Commits locales que GitHub no tiene
git log HEAD..origin/main --oneline   # Commits en GitHub que tú no tienes
```

#### 🎯 Workflow Seguro Recomendado

```bash
# Día a día (trabajo local):
git checkout -b feat/mi-feature      # Trabajar en rama de feature
# ... hacer cambios ...
git add -A
git commit -m "feat: descripción"
git push origin feat/mi-feature      # Push de rama de feature (seguro)

# Cuando quieres subir a main:
git checkout main
git merge feat/mi-feature            # Merge local primero
git push origin main                 # Push solo después de verificar
```

#### 🚫 Comandos Peligrosos (Usar con Precaución)

```bash
# ⚠️ PELIGROSO - Puede sobrescribir trabajo local:
git pull origin main                 # Trae y fusiona automáticamente
git reset --hard origin/main        # Descarta TODO trabajo local

# ✅ SEGURO - Verifica antes:
git fetch origin                     # Solo trae info, no fusiona
git diff origin/main                 # Ver diferencias
git merge origin/main                # Fusionar solo si quieres
```

#### 📋 Checklist Pre-Push

**ANTES de hacer `git push`:**

- [ ] `git status` - Verificar que no hay cambios sin commit
- [ ] `git log --oneline -5` - Verificar últimos commits locales
- [ ] `git fetch origin` - Actualizar info remota
- [ ] `git log origin/main..HEAD --oneline` - Ver commits que vas a enviar
- [ ] `git log HEAD..origin/main --oneline` - Ver si hay cambios remotos que no tienes
- [ ] Si hay divergencias, decidir si necesitas los cambios remotos

#### 🔄 Recuperación de Trabajo Perdido

**Si accidentalmente se sobrescribió trabajo local:**

```bash
# 1. Ver historial de cambios (reflog)
git reflog -20

# 2. Identificar commit con tu trabajo
git log --oneline --all -20

# 3. Restaurar desde rama o commit específico
git reset --hard commit-hash        # Restaurar a commit específico
# O
git reset --hard nombre-rama        # Restaurar a estado de rama

# 4. Crear backup antes de restaurar
git branch backup-antes-restaurar-$(date +%Y%m%d)
```

#### 💡 Mejores Prácticas

1. **Trabajar siempre en ramas de feature** - Nunca directamente en `main`
2. **Commit frecuente** - No dejar trabajo sin commitear
3. **Verificar antes de sincronizar** - Siempre `git fetch` antes de `git pull`
4. **Backup antes de operaciones peligrosas** - Crear rama de backup
5. **No hacer pull automático** - Siempre verificar qué se va a traer

### Session Continuity Protocol

#### 🌅 Al Iniciar Sesión (Saludo del Usuario)

Diferenciar por capacidad del agente:

```bash
# FULL — agentes con herramientas completas (terminal/git):
git status --short               # Estado del repositorio
git log --oneline -n 3          # Últimos commits
# Leer el resumen de sesión anterior si existe (p.ej. SESSION_SUMMARY.md)
# Correr el "command center" del proyecto si tiene uno
# Preguntar: "¿En qué quieres que trabajemos hoy?"

# LITE — agentes con capacidades limitadas (sin terminal):
# 1. Intentar leer el resumen de sesión anterior si es posible
# 2. Declarar las limitaciones ("no tengo acceso a terminal")
# 3. Preguntar al usuario por el estado actual del proyecto
# 4. Preguntar: "¿En qué quieres que trabajemos hoy?"
```

#### 🌙 Al Terminar Sesión (Despedida del Usuario)

```bash
# SIEMPRE preguntar:
"¿Quieres que haga push del progreso a git antes de terminar?"

# Si responde SÍ:
git add -A && git commit -m "session: descripción" && git push
```

### Stability Rules

```typescript
// 🟢 SEGURO (OK para arreglar sin preguntar):
// - Páginas individuales
// - Errores de sintaxis simples
// - Features aisladas

// 🔴 PELIGROSO (PEDIR AUTORIZACIÓN):
// - Dependencias (package.json, npm install)
// - Configuración global (tsconfig, eslint)
// - Código compartido (src/shared/, utils)
// - Arquitectura del proyecto
```

---

## 📚 LEVEL 3: REFERENCE (Read When Needed)

### Monorepo Architecture

```
project-root/
├── apps/                     # Applications
│   ├── [app-a]/
│   ├── [app-b]/
│   └── [other-apps]/
├── packages/                # Shared packages
│   ├── ui/                  # UI components
│   └── utils/               # Utilities
├── src/                     # Shared source (if applicable)
├── docs/                    # Documentation
├── scripts/                 # Operational scripts
└── AGENTS.md               # Project rules
```

### Directory Rules

- `/components`: Reusable UI components (functional, typed)
- `/services`: Business logic, API calls (keep UI dumb)
- `/types`: Shared TypeScript interfaces
- `/hooks`: Custom React hooks
- `/docs`: Technical documentation

### Documentation Organization

**Allowed in root:**
- `README.md` - Project introduction
- `AGENTS.md` - AI agent rules
- `CHANGELOG.md` - Version history
- `QUICK_START.md` - Quick start guide

**Everything else → `docs/`**

### Security Rules

- **ALWAYS** scope every data query by its tenant key (multi-tenant isolation).
- **NEVER** query a shared table without a tenant filter.
- **NEVER** expose provider API keys or secrets to the client.

> Concrete client/ORM snippets and the tenant-key field name are org/product-specific
> — see the **methodology layer (level 2)** and the product repo.

### Branding / methodology layer

- Org brand, house-methodology terms, concrete stack/ports/tooling, and DB
  examples live in the **methodology layer (level 2)** — not in this neutral core.
- This core stays vendor- and methodology-neutral. **Fire-test:** it must read
  clean of any product name, vendor brand, or methodology name. If one appears, it
  is a leak from level 2/3 — move it down. See `CANON-CROSS-AGENT-CONTEXT-LAYERING.md` §8.

---

## 🔗 Inheritance Model

### How Projects Inherit

```
<the-kit>/                                    ← the supra-repo upstream
├── knowledge/ai-agents/
│   ├── AGENTS_UNIVERSAL.md                   ← THIS FILE (neutral core, level 1)
│   ├── CANON-CROSS-AGENT-CONTEXT-LAYERING.md ← layering canon (companion)
│   ├── <one adapter per agent>               ← per-agent adapters (pointers)
│   └── <methodology layer>                   ← org bindings (level 2)
│
project-specific/                             ← a fork (level 3)
├── AGENTS.md                    ← Inherits + Extends
├── <per-agent adapter files>    ← Inherits + Customizes
└── [project-specific-docs]
```

### AGENTS.md template for projects

A fork's `AGENTS.md` declares its mission, what it inherits from the kit, its
quick-operations table, its stack, and its extra rules. A ready-to-fill template
(with stack/script names) lives in the **methodology layer (level 2)**.

---

## 📋 Validation Commands

**Run the project's validation scripts before and after changes.** Each project
declares the exact script names (a "quick" check before, fuller checks after).

> Concrete command names are org-specific — see the **methodology layer (level 2)**.

---

## 🎯 AI Capability Detection

- **Agents with terminal / tool access → FULL PROTOCOL** (run scripts, git, build).
- **Agents without terminal access → LITE PROTOCOL** (declare limitations; ask the
  user to run commands).

> The mapping of specific agent products to FULL / LITE is org-specific — see the
> **methodology layer (level 2)**.

---

## 🚨 Crisis Protocols (Universal)

**CRITICAL:** These protocols apply to ALL projects that inherit this kit and should be followed when facing critical situations.

### **Protocol 1: Critical Production Failure**

#### **Immediate (0-5 minutes)**
- Activate emergency mode
- Notify team in emergency channel
- Assess impact and scope of the problem

#### **Short-term (5-30 minutes)**
- Execute rollback if necessary
- Implement temporary fix if possible
- Communicate status to stakeholders

#### **Medium-term (30 minutes - 2 hours)**
- Root cause analysis
- Implement permanent solution
- Verify problem is resolved

#### **Post-crisis (2-24 hours)**
- Document complete incident
- Conduct post-mortem with team
- Update processes to prevent recurrence

**Responsibilities:**
- **AI Agent:** Technical coordination, analysis, solution implementation
- **Team:** Support, testing, communication
- **Stakeholders:** Status information, business decisions

---

### **Protocol 2: Priority Conflict**

#### **Immediate (0-30 minutes)**
- Convene quick meeting with stakeholders
- Evaluate impact of each priority
- Document arguments for each position

#### **Resolution (30 minutes - 2 hours)**
- Prioritize based on:
  - User impact
  - Business urgency
  - Available resources
  - Strategic alignment
- Document decision and justification

#### **Communication (2-4 hours)**
- Communicate decision to team
- Adjust timelines and resources
- Update project documentation

**Responsibilities:**
- **AI Agent:** Facilitation, technical analysis, documentation
- **Stakeholders:** Final decision, business prioritization
- **Team:** Work adjustment, capacity communication

---

### **Protocol 3: Strong Technical Disagreement**

#### **Analysis (0-2 hours)**
- Document arguments for each position
- Evaluate technical pros and cons
- Consider impact on architecture and maintenance

#### **Consultation (2-4 hours)**
- Consult external experts if necessary
- Review industry best practices
- Evaluate similar cases in other projects

#### **Decision (4-6 hours)**
- Decide based on evidence and objectives
- Document decision and reasons
- Communicate to team

#### **Implementation (6-24 hours)**
- Implement decision
- Monitor results
- Adjust if necessary

**Responsibilities:**
- **AI Agent:** Technical analysis, expert consultation, documentation
- **Team:** Option evaluation, testing
- **Technical Lead:** Final decision

---

### **Protocol 4: Loss of Information or Context**

#### **Evaluation (0-1 hour)**
- Identify lost information
- Assess project impact
- Determine recovery urgency

#### **Recovery (1-4 hours)**
- Recover backups if available
- Reconstruct context with team help
- Consult stakeholders for business information

#### **Documentation (4-8 hours)**
- Document complete incident
- Update missing documentation
- Implement preventive measures

#### **Prevention (8-24 hours)**
- Review backup processes
- Improve documentation
- Establish additional controls

**Responsibilities:**
- **AI Agent:** Recovery coordination, documentation
- **Team:** Context reconstruction, validation
- **Stakeholders:** Business information, validation

---

### **Protocol 5: Human Resources Crisis**

#### **Evaluation (0-2 hours)**
- Assess project impact
- Identify affected critical tasks
- Determine replacement needs

#### **Redistribution (2-4 hours)**
- Redistribute tasks and responsibilities
- Identify knowledge gaps
- Establish contingency plan

#### **Onboarding (4-24 hours)**
- Activate rapid onboarding plan if necessary
- Transfer critical knowledge
- Establish mentorship and support

#### **Monitoring (24-72 hours)**
- Monitor team progress
- Adjust distribution if necessary
- Evaluate need for additional resources

**Responsibilities:**
- **AI Agent:** Coordination, knowledge transfer
- **Team:** Support, work redistribution
- **Project Lead:** Resource decisions, communication

---

### **Protocol 6: Security Crisis**

#### **Immediate (0-15 minutes)**
- Activate security protocol
- Isolate affected systems
- Notify security team

#### **Containment (15-60 minutes)**
- Assess incident scope
- Implement containment measures
- Communicate to critical stakeholders

#### **Elimination (1-4 hours)**
- Eliminate threat
- Restore secure systems
- Verify threat is neutralized

#### **Recovery (4-24 hours)**
- Restore full services
- Monitor for suspicious activity
- Document complete incident

**Responsibilities:**
- **AI Agent:** Technical coordination, fix implementation
- **Security Team:** Analysis, containment
- **Project Lead:** Communication, business decisions

---

### **General Crisis Protocol**

#### **1. Activation**
- Identify crisis type
- Activate corresponding protocol
- Notify relevant stakeholders

#### **2. Coordination**
- Designate coordination responsible
- Establish communication channel
- Define update frequency

#### **3. Execution**
- Follow specific protocol
- Document actions taken
- Maintain constant communication

#### **4. Resolution**
- Confirm crisis is resolved
- Document lessons learned
- Update protocols if necessary

#### **5. Post-crisis**
- Conduct post-mortem analysis
- Implement preventive improvements
- Communicate results to team

---

**Last Updated:** 2026-06-19
**Version:** 1.4
**Maintained by:** the dev-kit (supra-repo upstream)
**Changelog:**
- v1.4 (2026-06-19): Added the kit-refresh trigger to Always-Do — a "refresh/update the
  kit" request maps to the Refresh-trigger recipe (the on-ramp), so the behavior **inherits
  by reference** instead of being pasted per-repo. Kept neutral (abstract: upgrade /
  change-delta / health board — concrete tool names stay in the on-ramp / level 2).
- v1.3 (2026-05-22): Restored level-1 vendor-neutrality (review finding #3) — moved
  concrete kit-access, ports, stack pins, DB example, validation commands, AI
  capability mapping, and the inheritance paths/template to the methodology layer
  (level 2). The neutral core now keeps only agnostic principles + pointers.
- v1.2 (2025-01-XX): Added Universal Crisis Protocols (migrated from historical documentation)
- v1.1 (2025-12-18): Added Git Safety Protocol to prevent work loss from incorrect GitHub synchronization
