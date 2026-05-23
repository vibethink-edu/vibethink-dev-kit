# 📚 DOCS ROUTING MAP

**Versión:** 1.0.0
**Última actualización:** 2025-12-12
**Inspirado por:** Claude Code Development Kit v2 (Peter Krueck)

---

## 🎯 Propósito

Este documento es el **mapa de navegación** para que la IA sepa qué documentos leer según el tipo de tarea.

**Concepto heredado de:** Claude Code Development Kit - Sistema de 3 niveles de documentación

---

## 🗺️ Routing por Tipo de Tarea

### **🎨 Frontend Development**

**Documentos a leer:**
1. `.vibethink.config.json` → `stack.frontend`
2. `AGENTS.md` → Sección "Frontend Guidelines"
3. `knowledge/best-practices/STACK_COMPATIBILITY.md` → Sección del framework actual

**Ejemplo:**
```bash
# Si trabajas en componente React
1. Leer .vibethink.config.json (verificar que usa React)
2. Leer AGENTS.md > Frontend Guidelines
3. Leer knowledge/best-practices/STACK_COMPATIBILITY.md > React + Vite
```

---

### **🔧 Backend Development**

**Documentos a leer:**
1. `.vibethink.config.json` → `stack.backend`
2. `AGENTS.md` → Sección "Backend Guidelines"
3. `knowledge/best-practices/SECURITY_HEADERS.md` → Mandatory Headers
4. `knowledge/stack-guides/SUPABASE_CONNECTION.md` → RLS Validation
5. `knowledge/stack-guides/NEXTJS_STRUCTURE_TEMPLATE.md` → App Router Layout

**Ejemplo:**
```bash
# Si trabajas en API endpoint
1. Leer .vibethink.config.json (verificar Express version)
2. Leer AGENTS.md > Backend Guidelines
3. Leer STACK_COMPATIBILITY.md > Express
```

---

### **📦 Dependency Management**

**Documentos a leer:**
1. `.vibethink.config.json` → `compatibility.prohibited`
2. `.vibethink.config.json` → `compatibility.conflicts`
3. `knowledge/best-practices/STACK_COMPATIBILITY.md` → Sección completa
4. `knowledge/best-practices/PROJECT_CONFIGURATION.md` → Ejemplos de conflictos

**Ejemplo:**
```bash
# ANTES de instalar CUALQUIER paquete
1. Leer .vibethink.config.json > compatibility.prohibited
2. Verificar si está en la lista
3. Leer .vibethink.config.json > compatibility.conflicts
4. Buscar conflictos conocidos
5. Si hay duda, leer STACK_COMPATIBILITY.md
```

---

### **🎨 UI/UX Development**

**Documentos a leer:**
1. `.vibethink.config.json` → `stack.frontend.styling`
2. `AGENTS.md` → Sección "Design Mode" (si aplica)
3. `knowledge/stack-guides/CURSOR_SHORTCUTS.md` → Design Mode prompt

**Ejemplo:**
```bash
# Si trabajas en diseño UI
1. Leer .vibethink.config.json (verificar Tailwind/Shadcn)
2. Si es experimento, leer AGENTS.md > Design Mode
3. Usar Design Mode prompt de CURSOR_SHORTCUTS.md
```

---

### **🗄️ Database & ORM**

**Documentos a leer:**
1. `.vibethink.config.json` → `stack.backend.database`
2. `knowledge/best-practices/STACK_COMPATIBILITY.md` → Sección "ORM & Admin Panels"
3. `knowledge/stack-guides/TOOLS_AND_STACK.md` → Alternativas de ORM

**Ejemplo:**
```bash
# Si trabajas con base de datos
1. Leer .vibethink.config.json > stack.backend.database.orm
2. Si es Prisma, verificar conflictos con Refine
3. Leer STACK_COMPATIBILITY.md > ORM section
```

---

### **🚀 Deployment & DevOps**

**Documentos a leer:**
1. `AGENTS.md` → Sección "Deployment"
2. `knowledge/stack-guides/TOOLS_AND_STACK.md` → Sección "Infraestructura"
3. Proyecto-específico: `DEVELOPER-GUIDE.md` (si existe)

---

### **🎙️ Voice & Realtime AI**

**Documentos a leer:**
1. `knowledge/voice-architecture/AUDIO_PIPELINE_STANDARDS.md` → AudioContext & Buffering
2. `knowledge/voice-architecture/LATENCY_OPTIMIZATION.md` → Prosodic analysis & VAD
3. `knowledge/voice-architecture/PROVIDER_INTEGRATION_PATTERNS.md` → Backend Proxy & Security
4. `knowledge/stack-guides/ULTRAVOX_INTEGRATION.md` → Ultravox specific guide

**Ejemplo:**
```bash
# Antes de tocar WebSockets o AudioContext
1. Leer AUDIO_PIPELINE_STANDARDS.md
2. Leer LATENCY_OPTIMIZATION.md
```



---

### **🏷️ Naming & Versioning**

**Documentos a leer:**
1. `knowledge/naming-conventions/NAMING_STANDARDS.md` → Guía de nombres (Scripts, Git, Components)
2. `knowledge/best-practices/VERSIONING_POLICY.md` → Política de versiones y monorepo
3. `knowledge/ai-agents/AGENTS_UNIVERSAL.md` → Reglas generales (núcleo neutral, nivel 1)
   · ejemplo completo: `setup/templates/AGENTS_GOLDEN.example.md`

**Ejemplo:**
```bash
# Antes de crear rama o commit
1. Leer NAMING_STANDARDS.md > Git Naming Conventions
2. Leer VERSIONING_POLICY.md > Versioning Workflow
```


---

### **🧪 Testing**

**Documentos a leer:**
1. `AGENTS.md` → Sección "Testing Guidelines"
2. `knowledge/stack-guides/TOOLS_AND_STACK.md` → Sección "Testing & QA"
3. `.vibethink.config.json` → Verificar stack de testing

---

## 🤖 Auto-Loading Protocol

**CRITICAL: AI must execute BEFORE every task:**

### **Step 1: Load Project Configuration**
```bash
# Leer configuración del proyecto
cat .vibethink.config.json

# Verificar stack actual
jq '.stack' .vibethink.config.json
```

### **Step 2: Verify Compatibility**
```bash
# Verificar dependencias prohibidas
jq '.compatibility.prohibited' .vibethink.config.json

# Verificar conflictos conocidos
jq '.compatibility.conflicts' .vibethink.config.json
```

### **Step 3: Load Relevant Documentation**
```bash
# Basado en el tipo de tarea, leer:
# - Frontend → AGENTS.md > Frontend + STACK_COMPATIBILITY.md
# - Backend → AGENTS.md > Backend + STACK_COMPATIBILITY.md
# - Dependencies → .vibethink.config.json + STACK_COMPATIBILITY.md
```

### **Step 4: Validate Before Action**
```bash
# Si vas a instalar paquete:
1. Verificar en compatibility.prohibited
2. Buscar en compatibility.conflicts
3. Si hay conflicto → Sugerir alternativa
4. Si no estás seguro → Preguntar al usuario
```

**If AI skips these steps → STOP and restart task.**

---

## 📋 Decision Tree

```
┌─────────────────────────────────────┐
│ AI recibe tarea                     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ ¿Qué tipo de tarea?                 │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┬───────────┬──────────┐
       │               │           │          │
       ▼               ▼           ▼          ▼
   Frontend        Backend    Dependencies  UI/UX
       │               │           │          │
       ▼               ▼           ▼          ▼
 Read Frontend   Read Backend  Read Config  Read Design
 Guidelines      Guidelines    + Conflicts  Mode Rules
       │               │           │          │
       └───────┬───────┴───────────┴──────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Verificar compatibilidad            │
│ - Prohibited packages               │
│ - Known conflicts                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ ¿Hay conflicto?                     │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
       SÍ            NO
        │             │
        ▼             ▼
  Sugerir        Proceder
  Alternativa    con tarea
```

---

## 🔍 Quick Reference

| Tarea | Documentos Clave | Orden de Lectura |
|-------|------------------|------------------|
| **Frontend** | config.json, AGENTS.md, STACK_COMPATIBILITY.md | 1→2→3 |
| **Backend** | config.json, AGENTS.md, STACK_COMPATIBILITY.md | 1→2→3 |
| **Dependencies** | config.json, STACK_COMPATIBILITY.md, PROJECT_CONFIGURATION.md | 1→2→3 |
| **Naming/Git** | NAMING_STANDARDS.md, VERSIONING_POLICY.md | 1→2 |
| **UI/UX** | config.json, AGENTS.md (Design Mode), CURSOR_SHORTCUTS.md | 1→2→3 |

| **Database** | config.json, STACK_COMPATIBILITY.md, TOOLS_AND_STACK.md | 1→2→3 |
| **Voice AI** | AUDIO_PIPELINE_STANDARDS.md, LATENCY_OPTIMIZATION.md | 1→2 |
| **Testing** | AGENTS.md, TOOLS_AND_STACK.md | 1→2 |


---

## 📚 Document Hierarchy

```
Level 1: Project Configuration
├── .vibethink.config.json       ← ALWAYS read first
└── AGENTS.md                     ← Project constitution

Level 2: Compatibility & Standards
├── knowledge/best-practices/STACK_COMPATIBILITY.md        ← Conflicts and warnings
└── knowledge/best-practices/PROJECT_CONFIGURATION.md      ← Setup and examples

Level 3: Tools & References

├── knowledge/stack-guides/TOOLS_AND_STACK.md       ← Tool catalog
├── knowledge/stack-guides/CURSOR_SETUP.md          ← Editor setup
├── knowledge/stack-guides/CURSOR_SHORTCUTS.md      ← Shortcuts and workflows
└── Audit Logs (in knowledge/validations/)
    ├── V1.0.0_RELEASE_AUDIT.md   ← Release certification
    └── EXTERNAL_AI_REVIEWS.md    ← Historical feedback
```

---

## 🎯 Examples

### **Example 1: Installing a Package**

```bash
# Task: Install Refine.dev

# Step 1: Read config
cat .vibethink.config.json

# Step 2: Check ORM
jq '.stack.backend.database.orm' .vibethink.config.json
# Output: "prisma"

# Step 3: Check conflicts
jq '.compatibility.conflicts[] | select(.package1 == "prisma" or .package2 == "prisma")' .vibethink.config.json
# Output: Conflict found - Prisma vs Refine

# Step 4: Suggest alternative
AI: "Detecto que usas Prisma. Prisma es incompatible con Refine."
AI: "Solución: Usar Drizzle ORM en lugar de Prisma"
AI: "¿Quieres que:"
AI: "  A) Migre de Prisma a Drizzle + instale Refine"
AI: "  B) Use Prisma sin Refine"
```

---

### **Example 2: Frontend Component**

```bash
# Task: Create React component

# Step 1: Read config
cat .vibethink.config.json

# Step 2: Verify framework
jq '.stack.frontend.framework' .vibethink.config.json
# Output: "react"

# Step 3: Read guidelines
# Read AGENTS.md > Frontend Guidelines
# - Functional components only
# - TypeScript interfaces
# - One component per file

# Step 4: Create component following guidelines
```

---

## 🔄 Maintenance

**Cuándo actualizar este documento:**

1. **Nuevo tipo de tarea:** Agregar sección de routing
2. **Nueva documentación:** Actualizar hierarchy
3. **Cambio en estructura:** Actualizar decision tree

---

## 📖 References

- **Inspirado por:** [Claude Code Development Kit](https://github.com/peterkrueck/Claude-Code-Development-Kit)
- **Concepto:** 3-tier documentation system
- **Versión analizada:** v2 (Diciembre 2024)
- **Autor original:** Peter Krueck

---

**Última actualización:** 2025-12-12 15:51
**Versión:** 1.0.0
**Próxima revisión:** 2025-01-12 (revisar Claude Code Kit para nuevas features)
