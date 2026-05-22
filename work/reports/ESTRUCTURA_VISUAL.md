# 📁 Estructura Visual Completa

**Fecha:** 2025-12-12
**Kit:** `_vibethink-dev-kit`
**Estado:** v1.0.0

---

## 🎯 ESTRUCTURA ACTUAL DEL KIT CENTRAL

```
C:\IA Marcelo Labs\_vibethink-dev-kit\
│
├── 📄 README.md                          ← Overview del kit
├── 📄 ROADMAP.md                         ← Roadmap y features
├── 📄 LICENSE                            ← MIT License
├── 📄 CONTRIBUTING.md                    ← Guías de contribución
├── 📄 KNOWLEDGE_INHERITANCE.md           ← 27 fuentes analizadas
├── 📄 NEXT_STEPS.md                      ← Guía de próximos pasos
├── 📄 DOCS_ROUTING.md                    ← Mapa de navegación para IAs
├── 📄 STACK_COMPATIBILITY.md             ← ✅ SE COPIA - Matriz compatibilidad
│
├── 📂 rules\                              ← ✅ SE COPIA
│   └── conflicts.json                     ← 10 reglas de conflictos
│
├── 📂 scripts\                            ← ✅ SE COPIA
│   ├── setup-project.ps1                  ← Genera AGENTS.md y config
│   ├── vibe-doctor.ps1                    ← Health check
│   ├── sync-from-kit.ps1                  ← Sincronizar desde kit central
│   ├── validate-rules.ps1                 ← Validar conflicts.json
│   ├── validate-agents.ps1                ← Validar AGENTS.md
│   ├── validate-multi-ia.ps1              ← Validar coherencia Multi-IA
│   │
│   ├── 📂 hooks\                          ← ✅ SE COPIA
│   │   └── pre-install.ps1                ← Validación antes de npm install
│   │
│   ├── 📂 git\                            ← ✅ SE COPIA (opcional)
│   │   ├── cleanup-worktrees.ps1
│   │   ├── monitor-cursor-worktrees.ps1
│   │   ├── verify-no-worktree.ps1
│   │   ├── git_update.ps1
│   │   └── version-and-push.ps1
│   │
│   ├── 📂 server\                         ← ✅ SE COPIA (opcional)
│   │   ├── start.ps1
│   │   └── stop.ps1
│   │
│   └── 📂 validation\                     ← Vacío (para scripts futuros)
│
├── 📂 knowledge\                          ← ⚠️ OPCIONAL - Solo si incluyes metodología
│   ├── 📂 methodologies\                  ← 📝 NUEVO - Para metodología VThink
│   │   └── COMPARISON_TEMPLATE.md         ← Template para comparar metodologías
│   │
│   ├── 📂 best-practices\                 ← Generalmente NO se copia
│   │   ├── PROJECT_CONFIGURATION.md
│   │   ├── STACK_COMPATIBILITY.md
│   │   └── VERSIONING_POLICY.md
│   │
│   ├── 📂 stack-guides\                   ← Generalmente NO se copia
│   │   ├── CURSOR_SETUP.md
│   │   ├── CURSOR_SHORTCUTS.md
│   │   ├── digitalocean-deployment.md
│   │   ├── shadcn-admin.md
│   │   └── TOOLS_AND_STACK.md
│   │
│   ├── 📂 naming-conventions\             ← Generalmente NO se copia
│   │   └── NAMING_STANDARDS.md
│   │
│   ├── 📂 daily-learnings\                ← Vacío
│   │
│   ├── 📂 features\                       ← Generalmente NO se copia
│   │   └── V1_FEATURE_SET.md
│   │
│   ├── 📂 validations\                    ← Generalmente NO se copia
│   │   ├── EXTERNAL_AI_REVIEWS.md
│   │   ├── REVISION_COMPLETA_FINAL.md
│   │   ├── SETUP_COMPLETE.md
│   │   └── V1.0.0_RELEASE_AUDIT.md
│   │
│   ├── AGENTS_AUDIT.md
│   ├── AGENTS_COMPARISON.md
│   ├── QUALITY_RULES.md
│   └── REALISTIC_STRUCTURE.md
│
├── 📂 docs\                               ← ✅ SE COPIA (guías útiles)
│   ├── MULTI_IA_GUIDE.md                  ← Cómo trabajar con múltiples IAs
│   ├── WHEN_TO_USE.md                     ← Guías de decisión (Prisma vs Supabase, etc.)
│   ├── SYNC_GUIDE.md                      ← Cómo sincronizar desde kit central
│   │
│   └── 📂 validations\                    ← Vacío
│
├── 📂 setup\                              ← ❌ NO SE COPIA (solo para kit)
│   └── 📂 templates\
│       ├── AGENTS.md.template
│       └── .vibethink.config.template.json
│
├── 📂 templates\                          ← ❌ NO SE COPIA (solo ejemplos)
│   ├── README.md
│   ├── AGENTS_TEMPLATE.md
│   └── AGENTS.md.example
│
├── 📂 tools\                              ← ⚠️ OPCIONAL
│   ├── harvest-knowledge.ps1              ← Extraer conocimiento de proyectos
│   └── extract-methodology.ps1            ← Extraer metodología del orchestrator
│
└── 📄 GUIA_APLICACION_KIT.md              ← Guía de cómo aplicar kit
    GUIA_EXTRACCION_METODOLOGIA.md         ← Guía de extracción de metodología
    ESTRUCTURA_KIT_VS_PROYECTO.md          ← Este documento
```

---

## 📦 ESTRUCTURA EN PROYECTO NUEVO (Después de Copiar y Setup)

### **⚠️ IMPORTANTE: Estructura Híbrida**

**Después de ejecutar `setup-project.ps1`, el kit se reorganiza automáticamente:**

- ✅ `AGENTS.md` y `.vibethink.config.json` → **RAÍZ** (estándar para IAs)
- ✅ Resto del kit → **`.vibethink/`** (aislado, no contamina el proyecto)

---

### **Ejemplo: mi-proyecto-react-vite**

```
C:\IA Marcelo Labs\mi-proyecto-react-vite\
│
├── 📄 package.json                        ← Tu proyecto (React + Vite)
├── 📄 vite.config.ts                      ← Config Vite
├── 📄 tsconfig.json                       ← Config TypeScript
├── 📄 README.md                           ← Tu proyecto
│
├── ✨ AGENTS.md                           ← RAÍZ (generado, estándar IA)
├── ✨ .vibethink.config.json              ← RAÍZ (generado, config accesible)
│
├── 📂 src\                                ← Tu código
│   ├── App.tsx
│   ├── main.tsx
│   └── ...
│
├── 📂 public\                             ← Assets estáticos
│
└── 📂 .vibethink\                         ← Kit completo (aislado)
    ├── 📂 scripts\                        ← ✅ Reorganizado aquí
    │   ├── setup-project.ps1
    │   ├── vibe-doctor.ps1
    │   ├── sync-from-kit.ps1
    │   ├── validate-rules.ps1
    │   ├── validate-agents.ps1
    │   ├── validate-multi-ia.ps1
    │   │
    │   ├── 📂 hooks\
    │   │   └── pre-install.ps1
    │   │
    │   ├── 📂 git\                        ← ⚠️ Opcional
    │   │   └── ...
    │   │
    │   └── 📂 server\                     ← ⚠️ Opcional
    │       └── ...
    │
    ├── 📂 rules\                          ← ✅ Reorganizado aquí
    │   └── conflicts.json                 ← Reglas universales
    │
    ├── 📂 knowledge\                      ← ⚠️ OPCIONAL - Solo si incluyes metodología
    │   └── 📂 methodologies\              ← 📝 Metodología VThink (si la extrajiste)
    │       ├── VTHINK.md                  ← Metodología principal
    │       ├── COMPARISON.md              ← Comparación con otras metodologías
    │       ├── RECOMMENDATIONS.md         ← Mejoras recomendadas
    │       ├── INDEX.md                   ← Índice
    │       └── ANALYSIS_INITIAL.md        ← Análisis inicial
    │
    ├── 📂 docs\                           ← ✅ Reorganizado aquí (guías útiles)
    │   ├── MULTI_IA_GUIDE.md
    │   ├── WHEN_TO_USE.md
    │   └── SYNC_GUIDE.md
    │
    ├── 📂 tools\                          ← ⚠️ Opcional
    │   ├── harvest-knowledge.ps1
    │   └── extract-methodology.ps1
    │
    ├── 📄 STACK_COMPATIBILITY.md          ← ✅ Reorganizado aquí
    └── 📄 DOCS_ROUTING.md                 ← ✅ Reorganizado aquí
```

**Nota:** `setup-project.ps1` reorganiza automáticamente todo en `.vibethink/` después de detectar el stack. Solo `AGENTS.md` y `.vibethink.config.json` quedan en la raíz.

---

## 🔍 COMPARACIÓN: Antes vs Después de Copiar

### **ANTES (Kit Central):**
```
_vibethink-dev-kit/
├── setup/templates/          ← Para generar configs
├── templates/                ← Ejemplos
├── knowledge/                ← Conocimiento general
└── tools/                    ← Herramientas de mantenimiento
```

### **DESPUÉS (Proyecto con Kit):**
```
mi-proyecto/
├── ✨ AGENTS.md              ← GENERADO (no existía antes)
├── ✨ .vibethink.config.json ← GENERADO (no existía antes)
│
├── scripts/                  ← ✅ Copiado
├── rules/                    ← ✅ Copiado
├── docs/                     ← ✅ Copiado
│
├── ❌ NO tiene setup/        ← No se copia
├── ❌ NO tiene templates/    ← No se copia
│
└── ⚠️ knowledge/             ← Opcional (solo metodología)
```

---

## 📊 TABLA DE DECISIÓN: ¿Qué Copiar?

| Carpeta/Archivo | Siempre | Opcional | Nunca | Razón |
|----------------|---------|----------|-------|-------|
| `rules/conflicts.json` | ✅ | | | Reglas universales |
| `scripts/setup-project.ps1` | ✅ | | | Genera configs |
| `scripts/vibe-doctor.ps1` | ✅ | | | Health check |
| `scripts/sync-from-kit.ps1` | ✅ | | | Actualizar desde kit |
| `scripts/validate-*.ps1` | ✅ | | | Validadores |
| `scripts/hooks/` | ✅ | | | Prevención conflictos |
| `scripts/git/` | | ⚠️ | | Solo si necesitas |
| `scripts/server/` | | ⚠️ | | Solo si necesitas |
| `knowledge/methodologies/` | | ⚠️ | | **Solo si quieres metodología** |
| `knowledge/` (otros) | | ❌ | | Conocimiento general del kit |
| `docs/` | ✅ | | | Guías útiles |
| `tools/` | | ⚠️ | | Solo si necesitas extraer conocimiento |
| `setup/` | | | ❌ | Solo para kit central |
| `templates/` | | | ❌ | Solo ejemplos |
| `STACK_COMPATIBILITY.md` | ✅ | | | Matriz de compatibilidad |
| `DOCS_ROUTING.md` | ✅ | | | Mapa de navegación |

---

## 🎯 CASOS DE USO

### **Caso 1: Proyecto Simple (Sin Metodología)**

```powershell
# Copiar solo esenciales
Copy-Item "..\_vibethink-dev-kit\scripts" . -Recurse
Copy-Item "..\_vibethink-dev-kit\rules" . -Recurse
Copy-Item "..\_vibethink-dev-kit\docs" . -Recurse
Copy-Item "..\_vibethink-dev-kit\STACK_COMPATIBILITY.md" .
Copy-Item "..\_vibethink-dev-kit\DOCS_ROUTING.md" .
```

**Resultado:**
- ✅ Scripts esenciales
- ✅ Reglas de conflictos
- ✅ Documentación útil
- ❌ Sin metodología
- ✅ Proyecto más limpio

---

### **Caso 2: Proyecto Completo (Con Metodología)**

```powershell
# Copiar todo (incluye metodología si existe)
Copy-Item "..\_vibethink-dev-kit\*" . -Recurse -Force
```

**Resultado:**
- ✅ Todo el kit
- ✅ Metodología (si la extrajiste antes)
- ✅ Tools (harvest, extract)
- ✅ Scripts git y server
- ⚠️ Proyecto más grande

---

### **Caso 3: Proyecto con Metodología (Recomendado)**

```powershell
# 1. Asegurar que metodología existe en kit
cd "..\_vibethink-dev-kit"
.\tools\extract-methodology.ps1

# 2. Copiar kit completo
cd "..\mi-proyecto"
Copy-Item "..\_vibethink-dev-kit\*" . -Recurse -Force

# 3. Setup
.\scripts\setup-project.ps1
```

**Resultado:**
- ✅ Kit completo
- ✅ Metodología VThink incluida
- ✅ Todo integrado
- ✅ Puedes sincronizar actualizaciones

---

## 📏 TAMAÑOS ESTIMADOS

| Estructura | Archivos | Tamaño Aprox |
|------------|----------|--------------|
| **Kit Central** | ~53 archivos | ~2 MB |
| **Solo Esenciales** | ~15 archivos | ~500 KB |
| **Kit + Metodología** | ~60 archivos | ~2.5 MB |
| **Kit Completo** | ~53 archivos | ~2 MB |

---

**Última actualización:** 2025-12-12

