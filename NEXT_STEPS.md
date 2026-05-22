# 🚀 PRÓXIMOS PASOS - vibethink-dev-kit

**Versión:** 1.0.0
**Última actualización:** 2025-12-12
**Estado:** Primer harvest completado (Voice Agent)

---

## 📊 Estado Actual

### ✅ Lo Que Ya Tienes

```
C:\IA Marcelo Labs\_vibethink-dev-kit/
├── README.md                         ✅ Creado
├── knowledge/
│   ├── QUALITY_RULES.md             ✅ Copiado
│   ├── REALISTIC_STRUCTURE.md       ✅ Copiado
│   ├── naming-conventions/          ✅ NAMING_STANDARDS.md
│   ├── best-practices/              ✅ VERSIONING_POLICY.md
│   ├── stack-guides/                📁 Vacío (por poblar)
│   └── daily-learnings/             📁 Vacío (por poblar)
├── scripts/
│   ├── git/                         ✅ 5 scripts
│   │   ├── cleanup-worktrees.ps1
│   │   ├── monitor-cursor-worktrees.ps1
│   │   ├── verify-no-worktree.ps1
│   │   ├── git_update.ps1
│   │   └── version-and-push.ps1
│   ├── server/                      ✅ 2 scripts
│   │   ├── start.ps1
│   │   └── stop.ps1
│   └── validation/                  📁 Vacío
└── tools/
    └── harvest-knowledge.ps1        ✅ Listo y corregido
```

### 📈 Progreso de Harvest

| Proyecto | Estado | Scripts | Knowledge |
|----------|--------|---------|-----------|
| v3-andres-cantor-fdp-voice-agent | ✅ Completado | 7 scripts | ✅ Harvest & Cleaned |
| vibethink-orchestrator-main | ✅ Completado | - | ✅ Security, RLS, App Router |
| VozFood-Agent | ✅ Completado | - | ✅ OpenSpec, N8n Patterns |
| V4-ovi-Portal | ✅ Completado | - | ✅ Helmet SEO, Framer Motion |

---

## 🎯 Plan de Acción (Esta Semana)

### **Día 1: Mañana (15 minutos)**

```powershell
# 1. Ir al dev-kit
cd "C:\IA Marcelo Labs\_vibethink-dev-kit"

# 2. Ejecutar harvest
.\tools\harvest-knowledge.ps1

# 3. Cuando pregunte "Selecciona proyecto":
#    Responder: 8 (VozFood-Agent)

# 4. Copiar scripts genéricos que sean DIFERENTES a Voice Agent

# 5. Documentar:
#    - Naming conventions aprendidas
#    - Best practices de VozFood
#    - Daily learning
```

**Qué buscar en VozFood:**
- ¿Tiene scripts diferentes a Voice Agent?
- ¿Usa naming conventions diferentes?
- ¿Tiene best practices únicas?

---

### **Día 2: Viernes (15 minutos)**

```powershell
# 1. Ir al dev-kit
cd "C:\IA Marcelo Labs\_vibethink-dev-kit"

# 2. Ejecutar harvest
.\tools\harvest-knowledge.ps1

# 3. Seleccionar: 6 (V4-ovi-Portal)

# 4. Extraer conocimiento de PayloadCMS:
#    - ¿Cómo configuraste PayloadCMS?
#    - ¿Qué naming conventions usaste?
#    - ¿Qué best practices de SEO aplicaste?

# 5. Documentar en:
#    - knowledge/stack-guides/payloadcms.md
#    - knowledge/best-practices/seo.md
```

**Qué buscar en Ovi Portal:**
- Scripts de PayloadCMS
- Configuraciones de SEO
- Routing patterns
- Best practices de React Router

---

### **Día 3: Sábado (15 minutos)**

```powershell
# 1. Ir al dev-kit
cd "C:\IA Marcelo Labs\_vibethink-dev-kit"

# 2. Ejecutar harvest
.\tools\harvest-knowledge.ps1

# 3. Seleccionar: 7 (vibethink-orchestrator-main)

# 4. Extraer conocimiento de Next.js + Supabase:
#    - ¿Cómo configuraste Supabase?
#    - ¿Qué patterns de Next.js usaste?
#    - ¿Cómo manejas state (Zustand)?

# 5. Documentar en:
#    - knowledge/stack-guides/nextjs-supabase.md
#    - knowledge/best-practices/state-management.md
```

**Qué buscar en Orchestrator:**
- Scripts de Supabase (migraciones, etc.)
- Patterns de Next.js (SSR, SSG)
- State management (Zustand)
- Form validation (Zod)

---

## 📝 Después del Harvest Completo

### **Paso 1: Consolidar Conocimiento (30 minutos)**

```powershell
cd "C:\IA Marcelo Labs\_vibethink-dev-kit"

# Revisar archivos creados
code knowledge/

# Consolidar duplicados
# Organizar por categorías
# Eliminar información obsoleta
```

**Checklist de consolidación:**
- [x] Revisar naming-conventions/ (NAMING_STANDARDS.md creado)
- [x] Revisar best-practices/versioning (VERSIONING_POLICY.md creado)
- [ ] Crear índice en knowledge/README.md
- [ ] Crear daily-learnings/index.md

---

### **Paso 2: Crear Herramientas Faltantes (1 hora)**

```powershell
# Crear search-knowledge.ps1
code tools/search-knowledge.ps1

# Crear add-learning.ps1
code tools/add-learning.ps1

# Crear generate-index.ps1
code tools/generate-index.ps1
```

**Scripts a crear:**

1. **`search-knowledge.ps1`**
```powershell
# Busca en toda la knowledge base
param([string]$Query)
Get-ChildItem knowledge -Recurse -Filter *.md |
    Select-String -Pattern $Query -Context 2
```

2. **`add-learning.ps1`**
```powershell
# Agrega aprendizaje del día
param([string]$Topic, [string]$Learning)
$date = Get-Date -Format 'yyyy-MM-dd'
$file = "knowledge/daily-learnings/$date.md"
# Agregar contenido...
```

3. **`generate-index.ps1`**
```powershell
# Auto-genera índices
# Escanea knowledge/ y crea README.md con links
```

---

### **Paso 3: Crear Templates (Opcional - 2 horas)**

Si quieres crear templates de proyectos:

```powershell
cd "C:\IA Marcelo Labs\_vibethink-dev-kit"

# Crear template de Voice Agent
mkdir setup/templates/voice-agent-base
# Copiar estructura base de Voice Agent
# Limpiar (remover node_modules, .git, etc.)

# Crear template de PayloadCMS
mkdir setup/templates/payloadcms-portal
# Copiar estructura base de Ovi Portal

# Crear template de Next.js
mkdir setup/templates/nextjs-supabase
# Copiar estructura base de Orchestrator
```

---

## 🔄 Workflow Diario (Después de Setup)

### **Mañana (Inicio de día):**

```powershell
cd "C:\IA Marcelo Labs\_vibethink-dev-kit"

# Buscar algo que necesites
.\tools\search-knowledge.ps1 -Query "naming hooks"

# Ver best practice
code knowledge/best-practices/security.md
```

### **Durante el día:**

```powershell
# Trabajas en tu proyecto
cd "C:\IA Marcelo Labs\mi-proyecto"

# Usas scripts del dev-kit
..\\_vibethink-dev-kit\scripts\git\verify-no-worktree.ps1
..\\_vibethink-dev-kit\scripts\server\start.ps1
```

### **Noche (Fin de día):**

```powershell
cd "C:\IA Marcelo Labs\_vibethink-dev-kit"

# Agregar lo que aprendiste hoy
.\tools\add-learning.ps1 -Topic "React" -Learning "Usar useMemo para cálculos pesados"
```

---

## 📚 Comandos de Referencia Rápida

### **Harvest de Proyecto**
```powershell
cd "C:\IA Marcelo Labs\_vibethink-dev-kit"
.\tools\harvest-knowledge.ps1
```

### **Buscar en Knowledge Base**
```powershell
.\tools\search-knowledge.ps1 -Query "tu búsqueda"
```

### **Agregar Aprendizaje**
```powershell
.\tools\add-learning.ps1 -Topic "Tema" -Learning "Lo que aprendiste"
```

### **Ver Scripts Disponibles**
```powershell
Get-ChildItem scripts -Recurse -Filter *.ps1
```

### **Usar Script de Git**
```powershell
.\scripts\git\verify-no-worktree.ps1
.\scripts\git\cleanup-worktrees.ps1
```

### **Usar Script de Server**
```powershell
.\scripts\server\start.ps1
.\scripts\server\stop.ps1
```

---

## 🎯 Objetivos de la Semana

- [ ] **Lunes:** Harvest de VozFood-Agent
- [ ] **Viernes:** Harvest de V4-ovi-Portal
- [ ] **Sábado:** Harvest de vibethink-orchestrator-main
- [ ] **Domingo:** Consolidar conocimiento
- [ ] **Opcional:** Crear herramientas adicionales
- [ ] **Opcional:** Crear templates
- [ ] **SOLICITUD DE USUARIO:** Documentar uso de "Shadcn Admin Template" (comprado)
  - *Acción:* Ubicar nombre/docs y crear `knowledge/stack-guides/shadcn-admin-template.md`

---

## 📊 Resultado Esperado (Fin de Semana)

```
_vibethink-dev-kit/
├── knowledge/
│   ├── naming-conventions/
│   │   ├── react.md              ✅ Consolidado de 4 proyectos
│   │   ├── typescript.md         ✅ Consolidado de 4 proyectos
│   │   ├── git.md                ✅ De Voice Agent
│   │   └── files.md              ✅ Consolidado
│   │
│   ├── best-practices/
│   │   ├── react.md              ✅ Performance, hooks, state
│   │   ├── security.md           ✅ API keys, CORS, auth
│   │   ├── nextjs.md             ✅ De Orchestrator
│   │   ├── supabase.md           ✅ De Orchestrator
│   │   ├── payloadcms.md         ✅ De Ovi Portal
│   │   └── seo.md                ✅ De Ovi Portal
│   │
│   ├── stack-guides/
│   │   ├── react-vite.md         ✅ De Voice Agent + VozFood
│   │   ├── nextjs-supabase.md    ✅ De Orchestrator
│   │   ├── payloadcms.md         ✅ De Ovi Portal
│   │   ├── voice-apis.md         ✅ AUDIO_PIPELINE + PROVIDER_PATTERNS
│   │   └── shadcn-admin.md       ⏳ PENDIENTE (Info de usuario)
│   │
│   └── daily-learnings/
│       ├── 2025-12-12.md         ✅ Hoy
│       ├── 2025-12-13.md         ✅ Mañana
│       ├── 2025-12-14.md         ✅ Viernes
│       ├── 2025-12-15.md         ✅ Sábado
│       └── index.md              ✅ Índice
│
└── scripts/
    ├── git/                      ✅ Scripts de todos los proyectos
    ├── server/                   ✅ Scripts de todos los proyectos
    ├── validation/               ✅ Scripts de todos los proyectos
    └── deployment/               ✅ Scripts de VozFood/Orchestrator
```
