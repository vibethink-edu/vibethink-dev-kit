# AGENTS Universal (vendor-neutral core)

[![AGENTS.md](https://img.shields.io/badge/AGENTS-UNIVERSAL-blue)](https://agents.md)

> **Este archivo define las reglas GENÉRICAS que TODOS los repos heredan.**
> Los proyectos específicos extienden estas reglas con su propio `AGENTS.md`.
>
> **Disciplina cross-agent (capa universal):** ver `CANON-CROSS-AGENT-CONTEXT-LAYERING.md`
> — layering, presupuesto por agente más restrictivo, anti-contaminación, smoke test.

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

**ANTES** de escribir código, verifica acceso a `_vibethink-dev-kit`:

1. **Workspace Mode:** Ves la carpeta `_vibethink-dev-kit` en el IDE
2. **Symlink Mode:** Ves `.vibethink-core/` en la raíz

**SI NO ENCUENTRAS NINGUNO:**
```
⚠️ ALERTA: No tengo acceso al _vibethink-dev-kit (Cerebro del Proyecto).
❌ Riesgo: Generar código fuera de estándar.
🛠️ Solución: Agregar _vibethink-dev-kit al Workspace o ejecutar mount-devkit.ps1
```

### 🛡️ Quick Operations Reference

**Every project MUST have operational scripts. Find them FIRST:**

| Pattern | Purpose |
|---------|---------|
| `scripts/start*.ps1` | Start development server |
| `scripts/stop*.ps1` | Stop server/processes |
| `npm run dev:*` | Development via npm |
| `npm run build:*` | Build via npm |

**NEVER use generic commands when project scripts exist.**

### 🚦 Port Assignment (Global Standard)

**Puertos fijos globales para todos los proyectos del kit:**

- **3000-3049:** Aplicaciones principales (cada proyecto tiene bloque de 10)
- **3050-3099:** Referencias y demos externas (Bundui=3050, Shadcn=3051, ReactFlow=3052)
- **3100+:** Testing y desarrollo temporal

**Referencia completa:** `_vibethink-dev-kit/knowledge/PORT_ASSIGNMENT_GLOBAL.md`

**NEVER guess port numbers - check global assignment first.**

### ❌ Never Do (Universal)

```bash
# ❌ NEVER install Express 5 (use 4.21.2)
# ❌ NEVER mix Vite + Webpack in same project
# ❌ NEVER install `next` in Vite project (or vice versa)
# ❌ NEVER use caret versions (^) in dependencies
# ❌ NEVER install dependencies in both root and app folders
# ❌ NEVER create .npmrc or .env.example in apps/
# ❌ NEVER guess operational commands - find project scripts first
# ❌ NEVER expose API keys in frontend code
# ❌ NEVER create reports/validations/work files in project root
# ❌ NEVER leave temporary files unorganized
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
# ❌ NEVER create .md files for every analysis - do analysis in response, only create .md for significant reports
```

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
│   ├── dashboard/
│   ├── admin/
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

```typescript
// ✅ ALWAYS filter by company_id (multi-tenant)
const data = await supabase
  .from('users')
  .select('*')
  .eq('company_id', user.company_id);

// ❌ NEVER query without tenant isolation
const data = await supabase.from('users').select('*');
```

### Branding / methodology layer

- Org brand and house-methodology terms live in the **methodology layer (level 2)**, not in
  this neutral core.
- This core stays vendor- and methodology-neutral. See `CANON-CROSS-AGENT-CONTEXT-LAYERING.md` §8.

---

## 🔗 Inheritance Model

### How Projects Inherit

```
_vibethink-dev-kit/
├── knowledge/ai-agents/
│   ├── AGENTS_UNIVERSAL.md                  ← THIS FILE (single authority)
│   ├── CANON-CROSS-AGENT-CONTEXT-LAYERING.md ← layering canon (companion)
│   ├── CODEX.md / CLAUDE.md / ...           ← per-agent adapters (pointers)
│   └── .cursorrules                         ← Template cursorrules
│
project-specific/
├── AGENTS.md                    ← Inherits + Extends
├── .cursorrules                 ← Inherits + Customizes
└── [project-specific-docs]
```

### AGENTS.md Template for Projects

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

---

## 📋 Validation Commands

```bash
# BEFORE changes
npm run validate:quick

# AFTER changes
npm run validate:universal
npm run validate:architecture
npm run validate:branding
```

---

## 🎯 AI Capability Detection

**Cursor IDE → FULL PROTOCOL** (terminal access)
**Claude Code → FULL PROTOCOL** (terminal access)
**GPT Web → LITE PROTOCOL** (limited access - declare limitations)

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

**Last Updated:** 2025-01-XX
**Version:** 1.2
**Maintained by:** VibeThink Dev-Kit
**Changelog:**
- v1.2 (2025-01-XX): Added Universal Crisis Protocols (migrated from VITA historical documentation)
- v1.1 (2025-12-18): Added Git Safety Protocol to prevent work loss from incorrect GitHub synchronization

