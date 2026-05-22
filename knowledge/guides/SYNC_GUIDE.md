# 🔄 SYNC GUIDE - Mantener Proyectos Actualizados

**Versión:** 1.0.0
**Última actualización:** 2025-12-12
**Script:** `scripts/sync-from-kit.ps1`

---

## 🎯 Propósito

Cuando actualizas el **kit central** con nuevas reglas o mejoras, este script sincroniza esos cambios a tus proyectos existentes **sin sobrescribir** la configuración específica de cada proyecto.

---

## 🚀 Quick Start

### **Sincronización Básica**

```powershell
# En tu proyecto (ej: Voice Agent)
cd "C:\path\to\v3-andres-cantor-fdp-voice-agent"

# Sincronizar desde el kit central
.\scripts\sync-from-kit.ps1
```

**¿Qué hace?**
- ✅ Actualiza `rules/conflicts.json` (nuevas reglas)
- ✅ Actualiza `scripts/vibe-doctor.ps1` (mejoras)
- ✅ Actualiza documentación de compatibilidad
- ❌ **NO toca** `.vibethink.config.json` (específico del proyecto)
- ❌ **NO toca** `package.json`, `AGENTS.md`, etc.

---

## 📋 Modo de Uso

### **1. Dry Run (Previsualizar cambios)**

```powershell
.\scripts\sync-from-kit.ps1 -DryRun
```

**Output:**
```
🔄 Sincronizando archivos obligatorios...

   [DRY RUN] Sincronizaría: rules\conflicts.json
   [DRY RUN] Sincronizaría: scripts\vibe-doctor.ps1
   [DRY RUN] Sincronizaría: scripts\hooks\pre-install.ps1
   [DRY RUN] Sincronizaría: STACK_COMPATIBILITY.md

📊 Estadísticas:
   ✅ Sincronizados: 4 archivo(s)
```

**Beneficio:** Ves qué se actualizaría **sin aplicar cambios**.

---

### **2. Sincronización Real**

```powershell
.\scripts\sync-from-kit.ps1
```

**Output:**
```
🔄 Sincronizando archivos obligatorios...

   ✅ Sincronizado: rules\conflicts.json
   ✅ Sincronizado: scripts\vibe-doctor.ps1
   ✅ Sincronizado: scripts\hooks\pre-install.ps1
   ✅ Sincronizado: STACK_COMPATIBILITY.md

📋 Archivos opcionales disponibles:
   - scripts\setup-project.ps1
   - tools\harvest-knowledge.ps1
   - TOOLS_AND_STACK.md

¿Sincronizar archivos opcionales? (S/N)
```

---

### **3. Ruta Personalizada del Kit**

```powershell
.\scripts\sync-from-kit.ps1 -KitPath "D:\otro-path\_vibethink-dev-kit"
```

**Útil si:** Moviste el kit central a otra ubicación.

---

### **4. Forzar Sobrescritura**

```powershell
.\scripts\sync-from-kit.ps1 -Force
```

**Qué hace:** Sobrescribe archivos opcionales sin preguntar.

**⚠️ Cuidado:** Solo usa `-Force` si estás seguro.

---

### **5. Modo Verbose**

```powershell
.\scripts\sync-from-kit.ps1 -Verbose
```

**Output adicional:**
```
   ✅ Sincronizado: rules\conflicts.json
      Hash: a3f8c9d2
```

**Útil para:** Debugging, verificar que el archivo es correcto.

---

## 📂 Archivos que se Sincronizan

### **Obligatorios (Siempre se actualizan):**

| Archivo | Razón |
|---------|-------|
| `rules/conflicts.json` | Reglas universales de conflictos |
| `scripts/vibe-doctor.ps1` | Mejoras en detección de stack |
| `scripts/hooks/pre-install.ps1` | Hook de validación |
| `STACK_COMPATIBILITY.md` | Matriz de compatibilidad actualizada |
| `DOCS_ROUTING.md` | Mapa de navegación |

**Justificación:** Estos archivos contienen **conocimiento acumulado** que beneficia a todos los proyectos.

---

### **Opcionales (Te pregunta antes):**

| Archivo | Cuándo sincronizar |
|---------|-------------------|
| `scripts/setup-project.ps1` | Si mejoraste el wizard de setup |
| `tools/harvest-knowledge.ps1` | Si agregaste funcionalidad |
| `TOOLS_AND_STACK.md` | Si agregaste nuevas herramientas |
| `KNOWLEDGE_INHERITANCE.md` | Si analizaste nuevas fuentes |
| `ROADMAP.md` | Si quieres actualizar el roadmap del proyecto |

**Justificación:** Estos pueden tener customizaciones por proyecto.

---

### **NUNCA Sincronizados (Protegidos):**

| Archivo | Razón |
|---------|-------|
| `.vibethink.config.json` | Específico del stack del proyecto |
| `package.json` | Dependencias del proyecto |
| `AGENTS.md` | Constitución específica del proyecto |
| `.cursorrules` | Reglas específicas de Cursor |
| `.env` | Variables de entorno |
| `README.md` | Documentación del proyecto |
| `LICENSE` | Licencia del proyecto |

**Justificación:** Estos son **únicos por proyecto** y no deben sobrescribirse.

---

## 🔄 Workflow Recomendado

### **Escenario 1: Agregaste un Nuevo Conflicto**

```powershell
# 1. En el kit central
cd "C:\IA Marcelo Labs\_vibethink-dev-kit"

# Editar rules/conflicts.json
code rules\conflicts.json

# Agregar nueva regla (ej: Remix + Vite)
# {
#   "id": "remix-vite-conflict",
#   "condition": "remix && vite",
#   "severity": "warning",
#   ...
# }

# 2. Commit en el kit
git add rules\conflicts.json
git commit -m "feat: add Remix + Vite conflict rule"

# 3. Sincronizar a tus 4 proyectos
cd "C:\path\to\proyecto1"
.\scripts\sync-from-kit.ps1

cd "C:\path\to\proyecto2"
.\scripts\sync-from-kit.ps1

# Etc...
```

---

### **Escenario 2: Mejoraste vibe-doctor**

```powershell
# 1. En el kit central
cd "C:\IA Marcelo Labs\_vibethink-dev-kit"

# Editar vibe-doctor.ps1
code scripts\vibe-doctor.ps1

# Agregar nueva detección o fix

# 2. Commit
git add scripts\vibe-doctor.ps1
git commit -m "feat: vibe-doctor detecta pnpm workspaces"

# 3. Sincronizar a todos los proyectos
# (mismo proceso del escenario 1)
```

---

### **Escenario 3: Analizaste una Nueva Fuente (Proyecto/Experto)**

```powershell
# 1. Actualizar KNOWLEDGE_INHERITANCE.md
code KNOWLEDGE_INHERITANCE.md

# Agregar nuevo proyecto analizado

# 2. Decidir si sincronizar a proyectos
# (Probablemente NO, esto es del kit central)
```

---

## 🛡️ Verificación Post-Sync

El script automáticamente ejecuta `vibe-doctor` después de sincronizar para verificar que todo sigue funcionando.

**Si algo falla:**
```
⚠️  vibe-doctor reportó issues
```

**Acción:** Revisar output de vibe-doctor y corregir.

---

## 💡 Casos de Uso

### **Caso 1: Working across 4 projects**

```powershell
# Descubres un conflicto en Voice Agent
# Lo agregas al kit central
# Sincronizas a los otros 3 proyectos
# Ahora todos tienen la protección
```

**Beneficio:** **Learn once, protect everywhere.**

---

### **Caso 2: Monthly maintenance**

```powershell
# Cada mes, revisas fuentes externas (ROADMAP.md:262-276)
# Actualizas TOOLS_AND_STACK.md con nuevas herramientas
# Sincronizas a proyectos activos

# Dry run primero
.\scripts\sync-from-kit.ps1 -DryRun

# Luego sincronizar
.\scripts\sync-from-kit.ps1
```

---

### **Caso 3: New team member**

```powershell
# Nuevo miembro clona proyecto
# Kit está desactualizado (clone viejo)
# Ejecuta sync para obtener últimas reglas

.\scripts\sync-from-kit.ps1
```

**Beneficio:** Onboarding con mejores prácticas actuales.

---

## 🚨 Troubleshooting

### **Error: "Kit no encontrado"**

```
❌ ERROR: Kit no encontrado en: C:\IA Marcelo Labs\_vibethink-dev-kit
```

**Solución:**
```powershell
.\scripts\sync-from-kit.ps1 -KitPath "ruta\correcta\_vibethink-dev-kit"
```

---

### **Error: "vibe-doctor reportó issues"**

**Causa:** Algo se rompió después del sync.

**Solución:**
1. Revisar output de vibe-doctor
2. Verificar que `.vibethink.config.json` no se sobrescribió (no debería)
3. Si hay conflicto nuevo, revisar `rules/conflicts.json`

---

### **Archivo no se sincronizó**

```
⚠️  No encontrado en kit: SOME_FILE.md
```

**Causa:** Archivo no existe en kit central o ruta incorrecta.

**Solución:** Verificar que el archivo existe en `$KitPath`.

---

## 📊 Comparación: Manual vs Script

| Aspecto | Manual (Copy-Item) | sync-from-kit.ps1 |
|---------|-------------------|-------------------|
| **Tiempo** | ~5 min por proyecto | ~1 min por proyecto |
| **Seguridad** | Riesgo de sobrescribir | Protege archivos críticos |
| **Selectividad** | Manual | Automática (obligatorios/opcionales) |
| **Verificación** | Manual | Auto-ejecuta vibe-doctor |
| **Dry Run** | No disponible | Sí (`-DryRun`) |

---

## 🎯 Best Practices

### ✅ DO:
1. **Usa -DryRun primero** para ver qué cambiará
2. **Sincroniza después de actualizar reglas** en kit central
3. **Commit el kit central** antes de sincronizar (trazabilidad)
4. **Verifica con vibe-doctor** después del sync

### ❌ DON'T:
1. **No uses -Force** sin saber qué sobrescribirás
2. **No edites archivos sincronizados en proyectos** (edítalos en kit central)
3. **No sincronices si hay cambios sin commit** (perderías trabajo)

---

## 🔮 Futuro (v2.0)

**Planned enhancements:**
- [ ] Sync bidireccional (proyecto → kit si detecta mejora)
- [ ] Sync selectivo por archivo (`-Only rules/conflicts.json`)
- [ ] Backup automático antes de sync
- [ ] Diff visual de cambios
- [ ] Integration con git (auto-commit después de sync)

---

## 📚 Referencias

- **Script:** `scripts/sync-from-kit.ps1`
- **ROADMAP:** `ROADMAP.md` - v2.1 features
- **PROJECT_CONFIGURATION:** `PROJECT_CONFIGURATION.md` - Setup system

---

**Última actualización:** 2025-12-12
**Versión script:** 1.0.0
**Mantenido por:** VibeThink Team
