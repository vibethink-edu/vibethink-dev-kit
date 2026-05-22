# 🤖 MULTI-IA GUIDE - Trabajo en Equipo entre IAs

**Versión:** 1.0.0
**Última actualización:** 2025-12-12
**Propósito:** Asegurar que múltiples IAs trabajen juntas sin contradicciones

---

## 🎯 El Problema Real

### **Escenario típico sin este kit:**

```
Lunes 9am - Cursor AI:
Tú: "Agrega autenticación"
Cursor: *crea auth con Express + JWT*
✅ Funciona

Martes 2pm - Claude Code:
Tú: "Mejora el backend"
Claude: *ve Express, sugiere actualizar a v5*
Claude: *actualiza a Express 5*
💥 Auth se rompe (Express 5 incompatible)

Miércoles 10am - GitHub Copilot:
Tú: "Agrega state management"
Copilot: *instala Redux porque no sabe que ya usas Zustand*
💥 Conflicto de state managers

Jueves - Tú:
😫 "¿Por qué cada IA rompe lo que hizo la otra?"
```

### **Con este kit:**

```
Todas las IAs leen AGENTS.md + .vibethink.config.json

Lunes - Cursor AI:
✅ Ve: "Express 4.x only" → Usa Express 4
✅ Ve: "Zustand preferred" → Configura Zustand

Martes - Claude Code:
✅ Lee AGENTS.md → "Express 4.x only"
✅ No sugiere Express 5
✅ Mantiene stack coherente

Miércoles - Copilot:
✅ Lee .vibethink.config.json
✅ Ve "stateManagement: zustand"
✅ No instala Redux

Jueves - Tú:
🎉 "¡Todo funciona! Las IAs trabajan en equipo"
```

---

## 📋 Archivos Clave para Multi-IA

### **1. AGENTS.md** (OpenAI Standard)
```markdown
# Project Constitution

**Stack:**
- Frontend: React + Vite
- State: Zustand (DO NOT use Redux)
- Backend: Express 4.x (DO NOT upgrade to 5.x)
- Database: Supabase
- ORM: None (use Supabase client directly)

**Rules:**
- All IAs MUST check .vibethink.config.json before suggesting changes
- Run `vibe-doctor.ps1` before installing new packages
- Never mix state managers (Zustand vs Redux)
```

**Quién lo lee:**
- ✅ Claude (Anthropic)
- ✅ ChatGPT (OpenAI)
- ✅ GitHub Copilot
- ✅ Cursor AI (también lee .cursorrules)

---

### **2. .cursorrules** (Cursor Specific)
```markdown
## Stack Constraints
- Express: Only 4.x, NEVER 5.x
- State: Zustand only, NO Redux
- Database: Supabase + client (no Prisma)

## Before Installing Packages
Run: `.\scripts\vibe-doctor.ps1` to validate compatibility

## Code Style
- TypeScript strict mode
- Functional components only
```

**Quién lo lee:**
- ✅ Cursor AI (primary)
- ⚠️ Otras IAs pueden ignorarlo

---

### **3. .vibethink.config.json** (Universal)
```json
{
  "stack": {
    "frontend": {
      "framework": "react",
      "buildTool": "vite",
      "stateManagement": "zustand"
    },
    "backend": {
      "runtime": "node",
      "framework": "express",
      "version": "4.21.2"
    },
    "database": {
      "provider": "supabase",
      "orm": "none"
    }
  }
}
```

**Quién lo lee:**
- ✅ TODAS las IAs (si las instruyes)
- ✅ vibe-doctor.ps1 (automático)
- ✅ Scripts del kit

---

## 🔄 Flujo de Trabajo Multi-IA

### **Paso 1: Setup inicial**
```powershell
# Ejecutas UNA VEZ
.\scripts\setup-project.ps1

# Esto crea:
✅ AGENTS.md (instrucciones para IAs)
✅ .vibethink.config.json (stack detectado)
✅ .cursorrules (si usas Cursor)
```

### **Paso 2: Cada IA lee automáticamente**

**Cuando trabajas con Cursor:**
```
Tú: "Agrega feature X"
Cursor:
  1. Lee .cursorrules
  2. Lee AGENTS.md
  3. Lee .vibethink.config.json
  4. Sugiere solución coherente con el stack
```

**Cuando trabajas con Claude:**
```
Tú: "Mejora feature Y"
Claude:
  1. Lee AGENTS.md
  2. Lee .vibethink.config.json
  3. Valida con vibe-doctor (si se lo pides)
  4. Mantiene coherencia
```

### **Paso 3: Validación cruzada**
```powershell
# Después de que cualquier IA hizo cambios
.\scripts\vibe-doctor.ps1

# Output:
✅ Stack coherente: React + Vite + Zustand
✅ Express 4.21.2 (no hay Express 5)
✅ No hay conflictos de state (solo Zustand)
```

---

## 🚨 Problemas Comunes y Soluciones

### **Problema 1: IA no lee AGENTS.md**

**Síntoma:**
```
Claude: "Voy a instalar Redux para state management"
(Cuando AGENTS.md dice "USE ZUSTAND ONLY")
```

**Solución:**
```
Tú: "Antes de hacer nada, lee AGENTS.md y .vibethink.config.json"
Claude: "Ah, veo que usan Zustand. Voy a usar eso."
```

**Mejor práctica:**
Empieza SIEMPRE con: *"Lee AGENTS.md primero"*

---

### **Problema 2: .cursorrules vs AGENTS.md contradictorios**

**Síntoma:**
```
.cursorrules: "Use Redux for state"
AGENTS.md: "Use Zustand for state"

Cursor usa Redux
Claude usa Zustand
💥 Conflicto
```

**Solución:**
```powershell
# Ejecuta el checker
.\scripts\validate-multi-ia.ps1

# Output:
❌ CONFLICTO detectado:
   .cursorrules línea 12: "Use Redux"
   AGENTS.md línea 8: "Use Zustand"

💡 Solución: Unificar a Zustand (según .vibethink.config.json)
```

---

### **Problema 3: IA antigua con conocimiento obsoleto**

**Síntoma:**
```
ChatGPT (knowledge cutoff 2023):
"Express 5 es la última versión estable"

(Falso - Express 5 tiene issues en producción)
```

**Solución:**
```
Tú: "Lee rules/conflicts.json antes de sugerir"
ChatGPT: "Veo que Express 5 está prohibido. Usaré 4.21.2"
```

---

## ✅ Checklist de Compatibilidad Multi-IA

### **Para un proyecto nuevo:**
- [ ] Ejecutar `setup-project.ps1`
- [ ] Verificar que AGENTS.md está creado
- [ ] Verificar que .vibethink.config.json existe
- [ ] Si usas Cursor: verificar .cursorrules
- [ ] Ejecutar `validate-multi-ia.ps1`
- [ ] Corregir cualquier conflicto detectado

### **Para un proyecto existente:**
- [ ] Ejecutar `setup-project.ps1` (detecta stack)
- [ ] Revisar AGENTS.md generado
- [ ] Ejecutar `validate-agents.ps1` (valida estructura)
- [ ] Ejecutar `validate-multi-ia.ps1` (detecta conflictos)
- [ ] Unificar reglas si hay contradicciones

---

## 🔧 Scripts de Validación

### **validate-agents.ps1**
```powershell
.\scripts\validate-agents.ps1

# Valida:
✅ Estructura de AGENTS.md correcta
✅ Instrucciones claras y sin ambigüedades
✅ Stack declarado coincide con .vibethink.config.json
✅ No hay contradicciones internas
```

### **validate-multi-ia.ps1**
```powershell
.\scripts\validate-multi-ia.ps1

# Compara:
✅ AGENTS.md vs .cursorrules
✅ AGENTS.md vs .vibethink.config.json
✅ Detecta conflictos entre archivos
✅ Sugiere unificación
```

### **transpile-rules.ps1**
```powershell
# Cursor → AGENTS.md
.\scripts\transpile-rules.ps1 -From cursorrules -To agents

# AGENTS.md → Cursor
.\scripts\transpile-rules.ps1 -From agents -To cursorrules
```

---

## 📊 Matriz de Compatibilidad por IA

| IA | Lee AGENTS.md | Lee .cursorrules | Lee .vibethink.config.json | Auto-valida |
|----|---------------|------------------|---------------------------|-------------|
| **Cursor AI** | ✅ Sí | ✅ Sí (primary) | ⚠️ Si se le pide | ❌ No |
| **Claude (Anthropic)** | ✅ Sí | ⚠️ Puede leerlo | ✅ Sí | ⚠️ Si se le pide |
| **ChatGPT (OpenAI)** | ✅ Sí | ❌ No | ⚠️ Si se le pide | ❌ No |
| **GitHub Copilot** | ⚠️ Parcial | ⚠️ Parcial | ❌ No | ❌ No |
| **VS Code Copilot** | ⚠️ Parcial | ❌ No | ❌ No | ❌ No |

**Leyenda:**
- ✅ Sí: Lee automáticamente
- ⚠️ Parcial: Lee si se le indica explícitamente
- ❌ No: No lo lee

---

## 🎯 Best Practices

### **1. Single Source of Truth**
```
.vibethink.config.json = FUENTE DE VERDAD
   ↓
AGENTS.md (deriva de config)
   ↓
.cursorrules (deriva de AGENTS.md)
```

**Workflow:**
1. Ejecuta `setup-project.ps1` (genera config)
2. Revisa AGENTS.md (generado del config)
3. Si usas Cursor, genera .cursorrules desde AGENTS.md
4. Valida todo con `validate-multi-ia.ps1`

---

### **2. Prompt Inicial para IAs**

**SIEMPRE empieza con:**
```
"Antes de sugerir cualquier cosa:
1. Lee AGENTS.md
2. Lee .vibethink.config.json
3. Lee rules/conflicts.json
4. Si tienes dudas, ejecuta vibe-doctor.ps1"
```

**Esto evita 90% de conflictos.**

---

### **3. Validación después de cambios**

```powershell
# Después de que CUALQUIER IA hizo cambios
.\scripts\vibe-doctor.ps1

# Si hay warnings/errors
.\scripts\validate-multi-ia.ps1

# Si cambió AGENTS.md o .cursorrules
.\scripts\validate-agents.ps1
```

---

## 🚀 Casos de Uso Reales

### **Caso 1: Equipo con 3 IAs diferentes**

**Setup:**
- Dev 1 usa Cursor
- Dev 2 usa Claude Code
- Dev 3 usa ChatGPT + Copilot

**Sin el kit:**
```
Dev 1 (Cursor): Agrega Redux
Dev 2 (Claude): Agrega Zustand
Dev 3 (ChatGPT): Sugiere MobX
💥 3 state managers diferentes
```

**Con el kit:**
```
setup-project.ps1 detecta: "Ya hay Zustand"
AGENTS.md dice: "State: Zustand only"

Dev 1 (Cursor): Lee .cursorrules → Usa Zustand
Dev 2 (Claude): Lee AGENTS.md → Usa Zustand
Dev 3 (ChatGPT): Tú dices "Lee AGENTS.md" → Usa Zustand
✅ Stack coherente
```

---

### **Caso 2: Migración entre IAs**

**Escenario:**
```
Mes 1-3: Proyecto con Cursor (tiene .cursorrules)
Mes 4: Cambias a Claude Code (no lee .cursorrules)
```

**Solución:**
```powershell
# Transpila reglas de Cursor a AGENTS.md
.\scripts\transpile-rules.ps1 -From cursorrules -To agents

# Ahora Claude puede leer AGENTS.md
# Mismo conocimiento, diferente formato
```

---

### **Caso 3: Onboarding de nueva IA**

**Nueva IA en el equipo:**
```
Tú: "Hola nueva IA, vas a trabajar en este proyecto"

Nueva IA: "OK, ¿qué debo saber?"

Tú: "Lee estos archivos en orden:
1. AGENTS.md (reglas del proyecto)
2. .vibethink.config.json (stack actual)
3. rules/conflicts.json (qué NO hacer)
4. docs/WHEN_TO_USE.md (guías de decisión)"

Nueva IA: "Entendido. Stack: React+Vite+Zustand+Express4+Supabase"

✅ Onboarding en 30 segundos
```

---

## 📚 Referencias

- **AGENTS.md Spec:** https://github.com/openai/agents
- **Cursor Rules:** https://docs.cursor.com/context/rules
- **Claude Code SDK:** https://github.com/anthropics/claude-code
- **PROJECT_CONFIGURATION.md:** Setup system
- **WHEN_TO_USE.md:** Decision guides

---

## 🔮 Roadmap v1.1

**Planned features:**
- [ ] Auto-sync entre AGENTS.md ↔ .cursorrules
- [ ] Validación en tiempo real (git hook)
- [ ] Dashboard web para visualizar conflictos
- [ ] AI-to-AI communication protocol
- [ ] Test suite para verificar comprensión
- [ ] LLM-based ambiguity detector

---

**Última actualización:** 2025-12-12
**Versión:** 1.0.0
**Mantenido por:** VibeThink Team

**¿Dudas?** Ejecuta `vibe-doctor.ps1 -Verbose` para ver qué leen las IAs.
