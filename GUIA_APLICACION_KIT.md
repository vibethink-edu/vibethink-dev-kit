# 🚀 GUÍA: Cómo Aplicar el Kit a Proyectos

**Versión:** 1.0.0
**Fecha:** 2025-12-12
**Escenario:** Kit en `_vibethink-dev-kit` fuera del proyecto

---

## 📁 Estructura Actual

```
C:\IA Marcelo Labs\
├── _vibethink-dev-kit/          ← Kit central (fuera de proyectos)
│   ├── scripts/
│   ├── rules/
│   ├── docs/
│   └── setup/templates/
│
├── mi-proyecto-nuevo/           ← Proyecto nuevo
│   └── (vacío o recién creado)
│
└── mi-proyecto-existente/       ← Proyecto existente
    ├── package.json
    ├── src/
    └── (ya tiene código)
```

---

## 🆕 ESCENARIO 1: Proyecto NUEVO

### **⚠️ IMPORTANTE: Estructura Híbrida Recomendada**

**El kit usa una estructura híbrida para mejor organización:**

- ✅ **AGENTS.md** y **.vibethink.config.json** → **RAÍZ** (estándar para IAs)
- ✅ **Resto del kit** → **`.vibethink/`** (aislado, no contamina el proyecto)

**Razón:** Los agentes de IA buscan `AGENTS.md` en la raíz, pero el kit queda organizado en una carpeta dedicada.

---

### **Opción A: Estructura Híbrida (Recomendada)** ⭐

**Ventajas:**
- ✅ Kit aislado en `.vibethink/` (no mezcla con tu código)
- ✅ AGENTS.md en raíz (estándar OpenAI, agentes lo encuentran fácilmente)
- ✅ Fácil de eliminar (solo borrar `.vibethink/`)
- ✅ Separación clara entre kit y proyecto

**Pasos:**

```powershell
# 1. Crear proyecto nuevo (ejemplo: React + Vite)
cd "C:\IA Marcelo Labs"
npm create vite@latest mi-proyecto-nuevo
cd mi-proyecto-nuevo
npm install

# 2. Copiar kit completo (setup-project.ps1 organizará automáticamente)
Copy-Item "..\_vibethink-dev-kit\*" . -Recurse -Force

# 3. Ejecutar setup (genera estructura híbrida automáticamente)
.\scripts\setup-project.ps1

# 4. Verificar que todo está bien
.\vibethink\scripts\vibe-doctor.ps1
```

**Resultado (Estructura Híbrida):**
```
mi-proyecto-nuevo/
├── package.json                    ← Tu proyecto
├── src/                            ← Tu código
│
├── ✨ AGENTS.md                    ← RAÍZ (generado, estándar IA)
├── ✨ .vibethink.config.json       ← RAÍZ (generado, config accesible)
│
└── 📂 .vibethink/                  ← Kit completo (aislado)
    ├── scripts/
    │   ├── setup-project.ps1
    │   ├── vibe-doctor.ps1
    │   └── ...
    ├── rules/
    │   └── conflicts.json
    ├── docs/
    ├── knowledge/
    │   └── methodologies/          ← Si incluyes metodología
    └── tools/
```

**Nota:** `setup-project.ps1` organiza automáticamente todo en `.vibethink/` y deja `AGENTS.md` y `.vibethink.config.json` en la raíz.

---

### **Opción B: Estructura Mezclada (Legacy - No Recomendada)**

⚠️ **NOTA:** Esta opción mezcla archivos del kit con tu proyecto. Se recomienda usar la Opción A (Híbrida).

**Ventajas:**
- ✅ Solo archivos esenciales
- ✅ Proyecto más limpio
- ✅ Sincronización fácil desde kit central

**Pasos:**

```powershell
# 1. Crear proyecto nuevo
cd "C:\IA Marcelo Labs"
npm create vite@latest mi-proyecto-nuevo
cd mi-proyecto-nuevo
npm install

# 2. Copiar solo archivos esenciales
# Crear estructura básica
New-Item -ItemType Directory -Path "scripts" -Force
New-Item -ItemType Directory -Path "rules" -Force

# Copiar scripts esenciales
Copy-Item "..\_vibethink-dev-kit\scripts\setup-project.ps1" ".\scripts\"
Copy-Item "..\_vibethink-dev-kit\scripts\vibe-doctor.ps1" ".\scripts\"
Copy-Item "..\_vibethink-dev-kit\scripts\validate-*.ps1" ".\scripts\"
Copy-Item "..\_vibethink-dev-kit\scripts\sync-from-kit.ps1" ".\scripts\"
Copy-Item "..\_vibethink-dev-kit\scripts\hooks" ".\scripts\" -Recurse

# Copiar reglas
Copy-Item "..\_vibethink-dev-kit\rules\conflicts.json" ".\rules\"

# Copiar documentación esencial
Copy-Item "..\_vibethink-dev-kit\STACK_COMPATIBILITY.md" .
Copy-Item "..\_vibethink-dev-kit\DOCS_ROUTING.md" .

# 3. Ejecutar setup
.\scripts\setup-project.ps1

# 4. Verificar
.\scripts\vibe-doctor.ps1
```

**Resultado (más limpio):**
```
mi-proyecto-nuevo/
├── package.json
├── src/
├── scripts/              ← Solo scripts esenciales
│   ├── setup-project.ps1
│   ├── vibe-doctor.ps1
│   └── sync-from-kit.ps1
├── rules/
│   └── conflicts.json
├── AGENTS.md             ← Generado
└── .vibethink.config.json ← Generado
```

---

## 🔄 ESCENARIO 2: Proyecto EXISTENTE

### **Opción A: Copiar Kit + Setup (Primera Vez)**

**Para proyectos que NUNCA han usado el kit:**

```powershell
# 1. Ir a tu proyecto existente
cd "C:\IA Marcelo Labs\mi-proyecto-existente"

# 2. Copiar kit (igual que proyecto nuevo)
Copy-Item "..\_vibethink-dev-kit\*" . -Recurse -Force

# 3. Ejecutar setup (detecta stack automáticamente)
.\scripts\setup-project.ps1

# 4. Revisar detección
.\scripts\vibe-doctor.ps1

# 5. Si hay conflictos, revisar y corregir
```

**Qué hace `setup-project.ps1`:**
- ✅ Lee tu `package.json` existente
- ✅ Detecta React, Express, Prisma, etc.
- ✅ Genera `.vibethink.config.json` con tu stack
- ✅ Genera `AGENTS.md` con reglas específicas de tu proyecto

---

### **Opción B: Usar Sync (Ya Tienes el Kit)**

**Para proyectos que YA tienen el kit y quieres actualizar:**

```powershell
# 1. Ir a tu proyecto
cd "C:\IA Marcelo Labs\mi-proyecto-existente"

# 2. Sincronizar desde kit central
.\scripts\sync-from-kit.ps1

# 3. (Opcional) Ver qué cambiará primero
.\scripts\sync-from-kit.ps1 -DryRun
```

**Qué sincroniza:**
- ✅ `rules/conflicts.json` (nuevas reglas)
- ✅ `scripts/vibe-doctor.ps1` (mejoras)
- ✅ `STACK_COMPATIBILITY.md` (actualizaciones)
- ❌ **NO toca** `.vibethink.config.json` (específico del proyecto)
- ❌ **NO toca** `AGENTS.md` (específico del proyecto)

---

## 🎯 MEJOR PRÁCTICA RECOMENDADA

### **Para Proyectos Nuevos: Opción A (Estructura Híbrida con `.vibethink/`)** ⭐

**Razones:**
1. ✅ **Kit aislado** - No mezcla con tu código
2. ✅ **AGENTS.md en raíz** - Estándar OpenAI, agentes lo encuentran fácilmente
3. ✅ **Fácil de eliminar** - Solo borrar `.vibethink/`
4. ✅ **Separación clara** - Sigue estándares industria (como `.github/`, `.vscode/`)
5. ✅ **No contamina proyecto** - Tu estructura queda limpia

### **Para Proyectos Existentes: Primera Vez**

```powershell
# 1. Copiar kit completo
Copy-Item "..\_vibethink-dev-kit\*" . -Recurse -Force

# 2. Setup inicial
.\scripts\setup-project.ps1

# 3. Verificar
.\scripts\vibe-doctor.ps1
```

### **Para Proyectos Existentes: Actualizaciones**

```powershell
# Usar sync para mantener actualizado
.\scripts\sync-from-kit.ps1
```

---

## 📋 COMPARACIÓN DE OPCIONES

| Aspecto | Copiar Todo | Solo Esenciales | Sync (Actualizar) |
|---------|-------------|-----------------|-------------------|
| **Proyecto Nuevo** | ✅ Recomendado | ⚠️ Más trabajo | ❌ No aplica |
| **Proyecto Existente (1ra vez)** | ✅ Recomendado | ⚠️ Más trabajo | ❌ No aplica |
| **Proyecto Existente (actualizar)** | ⚠️ Sobrescribe | ❌ No aplica | ✅ Recomendado |
| **Tamaño** | Grande | Pequeño | Pequeño |
| **Autonomía** | ✅ Total | ⚠️ Parcial | ❌ Depende del kit |
| **Mantenimiento** | ⚠️ Manual | ⚠️ Manual | ✅ Automático |

---

## 🔧 SCRIPT RÁPIDO PARA PROYECTO NUEVO

Crea un script helper para hacerlo más fácil:

```powershell
# setup-new-project.ps1 (crear en _vibethink-dev-kit/)
param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectPath
)

$KitPath = Split-Path -Parent $PSScriptRoot
$ProjectPath = Resolve-Path $ProjectPath

Write-Host "🚀 Aplicando VibeThink Dev Kit a: $ProjectPath" -ForegroundColor Cyan
Write-Host ""

# Copiar kit
Write-Host "📁 Copiando archivos del kit..." -ForegroundColor Yellow
Copy-Item "$KitPath\*" "$ProjectPath\" -Recurse -Force -Exclude ".git","node_modules"

# Ejecutar setup
Write-Host "⚙️  Ejecutando setup..." -ForegroundColor Yellow
Set-Location $ProjectPath
.\scripts\setup-project.ps1

Write-Host ""
Write-Host "✅ ¡Kit aplicado exitosamente!" -ForegroundColor Green
Write-Host "💡 Ejecuta '.\scripts\vibe-doctor.ps1' para verificar" -ForegroundColor Cyan
```

**Uso:**
```powershell
# Desde el kit
.\setup-new-project.ps1 "C:\IA Marcelo Labs\mi-proyecto-nuevo"
```

---

## 💡 RECOMENDACIÓN FINAL

### **Workflow Recomendado:**

**1. Proyecto Nuevo:**
```powershell
cd "C:\IA Marcelo Labs"
npm create vite@latest mi-proyecto
cd mi-proyecto
npm install

# Copiar kit completo
Copy-Item "..\_vibethink-dev-kit\*" . -Recurse -Force

# Setup organiza automáticamente en .vibethink/
.\scripts\setup-project.ps1

# Verificar (usar ruta .vibethink/)
.\vibethink\scripts\vibe-doctor.ps1
```

**2. Proyecto Existente (Primera Vez):**
```powershell
cd "C:\IA Marcelo Labs\mi-proyecto-existente"

# Copiar kit completo
Copy-Item "..\_vibethink-dev-kit\*" . -Recurse -Force

# Setup organiza automáticamente
.\scripts\setup-project.ps1

# Verificar
.\vibethink\scripts\vibe-doctor.ps1
```

**3. Proyecto Existente (Actualizar):**
```powershell
cd "C:\IA Marcelo Labs\mi-proyecto-existente"

# Ver qué cambiará
.\vibethink\scripts\sync-from-kit.ps1 -DryRun

# Aplicar cambios
.\vibethink\scripts\sync-from-kit.ps1
```

---

## 🎯 VENTAJAS DE CADA ENFOQUE

### **Copiar Todo (Recomendado):**
- ✅ Proyecto autónomo
- ✅ Puedes personalizar
- ✅ Fácil de compartir
- ✅ No depende de ubicación del kit

### **Solo Esenciales:**
- ✅ Proyecto más limpio
- ⚠️ Más trabajo inicial
- ⚠️ Puede faltar algo

### **Sync (Actualizar):**
- ✅ Mantiene actualizado automáticamente
- ✅ No sobrescribe configuración del proyecto
- ❌ Requiere que el kit esté accesible

---

## 📚 INCLUIR METODOLOGÍA (Opcional)

Si quieres incluir la **Metodología VThink** en tu proyecto:

### **Opción Rápida: Al Copiar Kit**

```powershell
# 1. Extraer metodología en kit central (solo primera vez)
cd "C:\IA Marcelo Labs\_vibethink-dev-kit"
.\tools\extract-methodology.ps1

# 2. Copiar kit completo (incluye metodología automáticamente)
cd "C:\IA Marcelo Labs\mi-proyecto"
Copy-Item "..\_vibethink-dev-kit\*" . -Recurse -Force

# 3. Setup (metodología queda en .vibethink/knowledge/methodologies/)
.\scripts\setup-project.ps1
```

### **Opción: Agregar a Proyecto Existente**

```powershell
# 1. Asegurar metodología en kit central
cd "C:\IA Marcelo Labs\_vibethink-dev-kit"
.\tools\extract-methodology.ps1

# 2. Copiar solo metodología a tu proyecto
cd "C:\IA Marcelo Labs\mi-proyecto"
New-Item -ItemType Directory -Path ".vibethink\knowledge\methodologies" -Force
Copy-Item "..\_vibethink-dev-kit\knowledge\methodologies\*" ".vibethink\knowledge\methodologies\" -Recurse
```

**⚠️ IMPORTANTE:** Antes de decidir, lee `knowledge/methodologies/VTHINK_VS_OPENSPEC.md` para entender la relación entre VThink y OpenSpec/Spec Kit.

**📖 Guía completa:** Ver `GUIA_IMPORTAR_METODOLOGIA.md` para detalles completos.

---

**Última actualización:** 2025-12-13

