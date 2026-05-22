# 📁 Estructura: Kit Central vs Proyecto con Kit

**Versión:** 1.0.0
**Fecha:** 2025-12-12
**Objetivo:** Entender cómo queda la estructura cuando se copia el kit a un proyecto

---

## 🎯 ESTRUCTURA DEL KIT CENTRAL

```
C:\IA Marcelo Labs\_vibethink-dev-kit/
├── 📄 README.md                    ← Overview del kit
├── 📄 ROADMAP.md                   ← Roadmap del kit
├── 📄 AGENTS.md                    ← Template/ejemplo (NO se copia)
├── 📄 LICENSE                      ← Licencia del kit
├── 📄 CONTRIBUTING.md              ← Guías de contribución
├── 📄 KNOWLEDGE_INHERITANCE.md     ← Fuentes analizadas
│
├── 📂 rules/
│   └── conflicts.json              ← ✅ SE COPIA (reglas universales)
│
├── 📂 scripts/
│   ├── setup-project.ps1           ← ✅ SE COPIA (genera configs)
│   ├── vibe-doctor.ps1             ← ✅ SE COPIA (health check)
│   ├── sync-from-kit.ps1           ← ✅ SE COPIA (actualizar desde kit)
│   ├── validate-*.ps1              ← ✅ SE COPIA (validadores)
│   ├── hooks/
│   │   └── pre-install.ps1         ← ✅ SE COPIA (validación deps)
│   ├── git/                        ← ✅ SE COPIA (scripts git)
│   └── server/                     ← ✅ SE COPIA (scripts servidor)
│
├── 📂 knowledge/                   ← ⚠️ OPCIONAL (conocimiento general)
│   ├── methodologies/              ← 📝 INCLUIR si quieres metodología
│   │   ├── VTHINK.md
│   │   ├── COMPARISON.md
│   │   └── RECOMMENDATIONS.md
│   ├── best-practices/             ← ⚠️ Generalmente NO se copia
│   ├── stack-guides/               ← ⚠️ Generalmente NO se copia
│   └── naming-conventions/         ← ⚠️ Generalmente NO se copia
│
├── 📂 docs/                        ← ⚠️ OPCIONAL (guías generales)
│   ├── MULTI_IA_GUIDE.md           ← ✅ ÚTIL para proyectos
│   ├── WHEN_TO_USE.md              ← ✅ ÚTIL para proyectos
│   └── SYNC_GUIDE.md               ← ✅ ÚTIL si usas sync
│
├── 📂 setup/
│   └── templates/                  ← ❌ NO se copia (solo para kit)
│       ├── AGENTS.md.template
│       └── .vibethink.config.template.json
│
├── 📂 templates/                   ← ❌ NO se copia (solo ejemplos)
│   └── README.md
│
├── 📂 tools/                       ← ⚠️ OPCIONAL (herramientas de mantenimiento)
│   ├── harvest-knowledge.ps1       ← ⚠️ Solo si quieres extraer conocimiento
│   └── extract-methodology.ps1     ← ⚠️ Solo si quieres extraer metodología
│
└── 📄 STACK_COMPATIBILITY.md       ← ✅ SE COPIA (matriz de compatibilidad)
    DOCS_ROUTING.md                 ← ✅ SE COPIA (mapa de navegación)
```

---

## 📦 ESTRUCTURA EN PROYECTO NUEVO (Después de Copiar)

### **Opción 1: Copiar TODO el Kit (Recomendada)**

```
mi-proyecto-nuevo/
├── 📄 package.json                 ← Tu proyecto
├── 📄 README.md                    ← ✅ Copiado del kit (puedes sobrescribir)
├── 📄 LICENSE                      ← ✅ Copiado del kit
├── 📄 CONTRIBUTING.md              ← ✅ Copiado del kit
│
├── 📄 AGENTS.md                    ← ✨ GENERADO por setup-project.ps1
├── 📄 .vibethink.config.json       ← ✨ GENERADO por setup-project.ps1
│
├── 📂 src/                         ← Tu código
│   └── ...
│
├── 📂 scripts/                     ← ✅ Copiado del kit
│   ├── setup-project.ps1
│   ├── vibe-doctor.ps1
│   ├── sync-from-kit.ps1
│   ├── validate-*.ps1
│   ├── hooks/
│   │   └── pre-install.ps1
│   ├── git/
│   └── server/
│
├── 📂 rules/                       ← ✅ Copiado del kit
│   └── conflicts.json
│
├── 📂 knowledge/                   ← ✅ Copiado del kit (si existe)
│   ├── methodologies/              ← ✅ Incluido si extrajiste metodología
│   │   ├── VTHINK.md
│   │   ├── COMPARISON.md
│   │   └── RECOMMENDATIONS.md
│   ├── best-practices/
│   ├── stack-guides/
│   └── naming-conventions/
│
├── 📂 docs/                        ← ✅ Copiado del kit
│   ├── MULTI_IA_GUIDE.md
│   ├── WHEN_TO_USE.md
│   └── SYNC_GUIDE.md
│
├── 📂 tools/                       ← ✅ Copiado del kit (opcional)
│   ├── harvest-knowledge.ps1
│   └── extract-methodology.ps1
│
├── 📄 STACK_COMPATIBILITY.md       ← ✅ Copiado del kit
└── 📄 DOCS_ROUTING.md              ← ✅ Copiado del kit
```

---

### **Opción 2: Solo Archivos Esenciales (Más Limpia)**

```
mi-proyecto-nuevo/
├── 📄 package.json                 ← Tu proyecto
├── 📄 README.md                    ← Tu README
│
├── 📄 AGENTS.md                    ← ✨ GENERADO por setup-project.ps1
├── 📄 .vibethink.config.json       ← ✨ GENERADO por setup-project.ps1
│
├── 📂 src/                         ← Tu código
│   └── ...
│
├── 📂 scripts/                     ← ✅ Solo esenciales
│   ├── setup-project.ps1
│   ├── vibe-doctor.ps1
│   ├── sync-from-kit.ps1
│   ├── validate-rules.ps1
│   ├── validate-agents.ps1
│   ├── validate-multi-ia.ps1
│   └── hooks/
│       └── pre-install.ps1
│
├── 📂 rules/                       ← ✅ Solo esenciales
│   └── conflicts.json
│
├── 📂 knowledge/                   ← ⚠️ OPCIONAL - Solo si incluyes metodología
│   └── methodologies/
│       ├── VTHINK.md
│       ├── COMPARISON.md
│       └── RECOMMENDATIONS.md
│
├── 📂 docs/                        ← ✅ Solo guías útiles
│   ├── MULTI_IA_GUIDE.md
│   └── WHEN_TO_USE.md
│
├── 📄 STACK_COMPATIBILITY.md       ← ✅ Útil para referencia
└── 📄 DOCS_ROUTING.md              ← ✅ Útil para IAs
```

---

## 🔍 QUÉ SE COPIA Y QUÉ NO

### ✅ **Siempre se Copia (Esenciales):**

| Archivo/Carpeta | Razón |
|----------------|-------|
| `rules/conflicts.json` | Reglas universales de conflictos |
| `scripts/setup-project.ps1` | Genera configs del proyecto |
| `scripts/vibe-doctor.ps1` | Health check |
| `scripts/validate-*.ps1` | Validadores |
| `scripts/hooks/pre-install.ps1` | Prevención de conflictos |
| `STACK_COMPATIBILITY.md` | Matriz de compatibilidad |
| `DOCS_ROUTING.md` | Mapa de navegación para IAs |

---

### ⚠️ **Opcional (Útil pero no crítico):**

| Archivo/Carpeta | Cuándo Copiar |
|----------------|---------------|
| `knowledge/methodologies/` | ✅ **SI quieres incluir metodología VThink** |
| `docs/MULTI_IA_GUIDE.md` | ✅ SI trabajas con múltiples IAs |
| `docs/WHEN_TO_USE.md` | ✅ SI necesitas guías de decisión |
| `tools/harvest-knowledge.ps1` | ⚠️ Solo si quieres extraer conocimiento |
| `scripts/git/` | ⚠️ Solo si necesitas scripts git |
| `scripts/server/` | ⚠️ Solo si necesitas scripts servidor |

---

### ❌ **NUNCA se Copia (Solo del Kit Central):**

| Archivo/Carpeta | Razón |
|----------------|-------|
| `setup/templates/` | Solo para generar configs en kit |
| `templates/` | Solo ejemplos |
| `KNOWLEDGE_INHERITANCE.md` | Específico del kit central |
| `.git/` | Git del kit (no del proyecto) |

---

### ✨ **Se GENERA (No se Copia):**

| Archivo | Generado Por |
|---------|--------------|
| `AGENTS.md` | `setup-project.ps1` (basado en stack detectado) |
| `.vibethink.config.json` | `setup-project.ps1` (basado en package.json) |

---

## 📚 INCLUYENDO METODOLOGÍA

Si quieres incluir la metodología VThink en tu proyecto:

### **Paso 1: Extraer Metodología del Orchestrator**

```powershell
# Desde el kit central
cd "C:\IA Marcelo Labs\_vibethink-dev-kit"
.\tools\extract-methodology.ps1
```

Esto crea:
```
_vibethink-dev-kit/knowledge/methodologies/
├── VTHINK.md
├── COMPARISON.md
├── RECOMMENDATIONS.md
└── INDEX.md
```

---

### **Paso 2: Copiar Kit + Metodología al Proyecto**

```powershell
# Opción A: Si ya incluiste metodología en el kit
cd "C:\IA Marcelo Labs\mi-proyecto-nuevo"
Copy-Item "..\_vibethink-dev-kit\*" . -Recurse -Force
# ✅ La metodología se copia automáticamente en knowledge/methodologies/

# Opción B: Si quieres solo metodología (más limpio)
cd "C:\IA Marcelo Labs\mi-proyecto-nuevo"
New-Item -ItemType Directory -Path "knowledge\methodologies" -Force
Copy-Item "..\_vibethink-dev-kit\knowledge\methodologies\*" ".\knowledge\methodologies\" -Recurse
```

---

### **Estructura Final con Metodología:**

```
mi-proyecto-nuevo/
├── 📄 package.json
├── 📄 AGENTS.md                    ← ✨ GENERADO
├── 📄 .vibethink.config.json       ← ✨ GENERADO
│
├── 📂 scripts/                     ← ✅ Kit esencial
├── 📂 rules/                       ← ✅ Reglas universales
│
├── 📂 knowledge/                   ← ✅ Metodología incluida
│   └── methodologies/
│       ├── VTHINK.md               ← ✅ Metodología principal
│       ├── COMPARISON.md           ← ✅ Comparación con otras
│       ├── RECOMMENDATIONS.md      ← ✅ Mejoras recomendadas
│       └── INDEX.md                ← ✅ Índice
│
└── 📄 STACK_COMPATIBILITY.md
```

---

## 🎯 RECOMENDACIÓN PARA INCLUIR METODOLOGÍA

### **Enfoque Recomendado:**

**1. Extraer metodología al kit central:**
```powershell
cd "_vibethink-dev-kit"
.\tools\extract-methodology.ps1
```

**2. Copiar kit completo al proyecto (incluye metodología):**
```powershell
cd "mi-proyecto-nuevo"
Copy-Item "..\_vibethink-dev-kit\*" . -Recurse -Force
```

**3. Setup del proyecto:**
```powershell
.\scripts\setup-project.ps1
```

**Resultado:**
- ✅ Tienes el kit completo
- ✅ Tienes la metodología VThink
- ✅ Todo está integrado
- ✅ Puedes sincronizar actualizaciones con `sync-from-kit.ps1`

---

## 📊 COMPARACIÓN: Con vs Sin Metodología

| Aspecto | Sin Metodología | Con Metodología |
|---------|----------------|-----------------|
| **Tamaño** | ~50 archivos | ~55 archivos |
| **Estructura** | Solo kit técnico | Kit + metodología |
| **knowledge/** | Vacío o no existe | `methodologies/` con docs |
| **Referencias en AGENTS.md** | Solo stack/tech | Stack + metodología de trabajo |
| **Ventaja** | Más ligero | Guía completa de trabajo |

---

## 🚀 WORKFLOW COMPLETO (Con Metodología)

```powershell
# 1. Extraer metodología (una vez en el kit central)
cd "C:\IA Marcelo Labs\_vibethink-dev-kit"
.\tools\extract-methodology.ps1

# 2. Crear proyecto nuevo
cd "C:\IA Marcelo Labs"
npm create vite@latest mi-proyecto-con-metodologia
cd mi-proyecto-con-metodologia
npm install

# 3. Copiar kit (incluye metodología)
Copy-Item "..\_vibethink-dev-kit\*" . -Recurse -Force

# 4. Setup (genera AGENTS.md y config)
.\scripts\setup-project.ps1

# 5. Verificar estructura
Get-ChildItem -Recurse | Select-Object FullName

# 6. Verificar metodología incluida
Test-Path "knowledge\methodologies\VTHINK.md"
```

---

**Última actualización:** 2025-12-12


