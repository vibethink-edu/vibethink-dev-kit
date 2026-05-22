# 📚 GUÍA: Cómo Importar Metodología al Proyecto

**Versión:** 1.0.0
**Fecha:** 2025-12-13
**Escenario:** Usuario quiere incluir metodología VThink en su proyecto

---

## 🎯 ¿QUÉ ES LA METODOLOGÍA?

La **Metodología VThink** es un framework de desarrollo colaborativo humano-IA que incluye:
- ✅ Colaboración simbiótica humano-IA
- ✅ Backlog infinito con priorización dinámica
- ✅ Verificación automática en cada paso
- ✅ FAQs desde el inicio (anticipación total)

**Ubicación en el kit:** `knowledge/methodologies/`

---

## ⚠️ IMPORTANTE: VThink vs OpenSpec/Spec Kit

**Antes de decidir, lee:** `knowledge/methodologies/VTHINK_VS_OPENSPEC.md`

**Resumen rápido:**
- **VThink** = Metodología de desarrollo (procesos)
- **OpenSpec/Spec Kit** = Herramienta técnica (documentación)
- **Recomendación:** Usar VThink como metodología, complementar con Spec Kit si necesitas documentación técnica formal

---

## 📋 OPCIONES PARA IMPORTAR

### **Opción 1: Importar Automáticamente (Al Copiar Kit)** ⭐ (Recomendado)

**Cuándo usar:** Cuando copias el kit por primera vez y quieres incluir metodología

**Pasos:**

```powershell
# 1. Asegurar que metodología existe en kit central
cd "C:\IA Marcelo Labs\_vibethink-dev-kit"
.\tools\extract-methodology.ps1
# (Solo necesario si no lo has hecho antes)

# 2. Copiar kit completo al proyecto (incluye metodología automáticamente)
cd "C:\IA Marcelo Labs\mi-proyecto"
Copy-Item "..\_vibethink-dev-kit\*" . -Recurse -Force

# 3. Setup del proyecto
.\scripts\setup-project.ps1

# 4. Verificar que metodología está incluida
Test-Path ".vibethink\knowledge\methodologies\METHODOLOGY_VTHINK_UNIFIED.md"
```

**Resultado:**
```
mi-proyecto/
├── AGENTS.md
├── .vibethink.config.json
└── .vibethink/
    ├── scripts/
    ├── rules/
    └── knowledge/
        └── methodologies/          ← ✅ Metodología incluida
            ├── METHODOLOGY_VTHINK_UNIFIED.md
            ├── METHODOLOGY_ANALYSIS.md
            ├── METHODOLOGY_COMPARISON.md
            └── INDEX.md
```

---

### **Opción 2: Importar Solo Metodología (Proyecto Ya Tiene Kit)**

**Cuándo usar:** Ya tienes el kit pero sin metodología, y quieres agregarla

**Pasos:**

```powershell
# 1. Asegurar que metodología existe en kit central
cd "C:\IA Marcelo Labs\_vibethink-dev-kit"
.\tools\extract-methodology.ps1
# (Solo necesario si no lo has hecho antes)

# 2. Ir a tu proyecto
cd "C:\IA Marcelo Labs\mi-proyecto"

# 3. Crear directorio si no existe
New-Item -ItemType Directory -Path ".vibethink\knowledge\methodologies" -Force

# 4. Copiar solo metodología
Copy-Item "..\_vibethink-dev-kit\knowledge\methodologies\*" ".vibethink\knowledge\methodologies\" -Recurse

# 5. Verificar
Test-Path ".vibethink\knowledge\methodologies\METHODOLOGY_VTHINK_UNIFIED.md"
```

**Resultado:**
- ✅ Metodología agregada sin afectar el resto del kit
- ✅ Puedes seguir usando `sync-from-kit.ps1` normalmente

---

### **Opción 3: Importar Selectivamente (Solo Documentos Específicos)**

**Cuándo usar:** Solo necesitas ciertos documentos de metodología

**Pasos:**

```powershell
# 1. Ir a tu proyecto
cd "C:\IA Marcelo Labs\mi-proyecto"

# 2. Crear directorio
New-Item -ItemType Directory -Path ".vibethink\knowledge\methodologies" -Force

# 3. Copiar solo documentos específicos
Copy-Item "..\_vibethink-dev-kit\knowledge\methodologies\METHODOLOGY_VTHINK_UNIFIED.md" ".vibethink\knowledge\methodologies\"
Copy-Item "..\_vibethink-dev-kit\knowledge\methodologies\METHODOLOGY_ANALYSIS.md" ".vibethink\knowledge\methodologies\"
Copy-Item "..\_vibethink-dev-kit\knowledge\methodologies\INDEX.md" ".vibethink\knowledge\methodologies\"

# (Opcional) Comparación y otros
# Copy-Item "..\_vibethink-dev-kit\knowledge\methodologies\METHODOLOGY_COMPARISON.md" ".vibethink\knowledge\methodologies\"
```

**Documentos disponibles:**
- `METHODOLOGY_VTHINK_UNIFIED.md` - Documento consolidado completo ⭐
- `METHODOLOGY_ANALYSIS.md` - Análisis detallado
- `METHODOLOGY_COMPARISON.md` - Comparación con otras metodologías
- `VTHINK_VS_OPENSPEC.md` - Análisis VThink vs OpenSpec/Spec Kit
- `INDEX.md` - Índice de archivos
- `RESUMEN_EXTRACCION.md` - Resumen de extracción

---

## 🔧 SCRIPT AUTOMATIZADO

Puedes crear un script helper para facilitar la importación:

```powershell
# import-methodology.ps1 (crear en tu proyecto)
param(
    [switch]$All = $false,  # Importar todo
    [switch]$Unified = $true,  # Importar solo consolidado
    [switch]$Analysis = $false,  # Incluir análisis
    [switch]$Comparison = $false  # Incluir comparación
)

$KitPath = "C:\IA Marcelo Labs\_vibethink-dev-kit"
$MethodologyPath = "$KitPath\knowledge\methodologies"
$ProjectPath = ".vibethink\knowledge\methodologies"

# Verificar que kit existe
if (-not (Test-Path $MethodologyPath)) {
    Write-Host "❌ Metodología no encontrada en kit. Ejecuta primero:" -ForegroundColor Red
    Write-Host "   cd '$KitPath'; .\tools\extract-methodology.ps1" -ForegroundColor Yellow
    exit 1
}

# Crear directorio en proyecto
New-Item -ItemType Directory -Path $ProjectPath -Force | Out-Null

# Copiar según opciones
if ($All) {
    Write-Host "📚 Importando toda la metodología..." -ForegroundColor Cyan
    Copy-Item "$MethodologyPath\*" $ProjectPath -Recurse
} else {
    # Siempre copiar consolidado
    Copy-Item "$MethodologyPath\METHODOLOGY_VTHINK_UNIFIED.md" $ProjectPath

    if ($Analysis) {
        Copy-Item "$MethodologyPath\METHODOLOGY_ANALYSIS.md" $ProjectPath
    }

    if ($Comparison) {
        Copy-Item "$MethodologyPath\METHODOLOGY_COMPARISON.md" $ProjectPath
        Copy-Item "$MethodologyPath\VTHINK_VS_OPENSPEC.md" $ProjectPath
    }

    # Siempre copiar índice
    Copy-Item "$MethodologyPath\INDEX.md" $ProjectPath -ErrorAction SilentlyContinue
}

Write-Host "✅ Metodología importada exitosamente" -ForegroundColor Green
Write-Host "📁 Ubicación: $ProjectPath" -ForegroundColor Cyan
```

**Uso:**
```powershell
# Importar solo consolidado (por defecto)
.\import-methodology.ps1

# Importar todo
.\import-methodology.ps1 -All

# Importar consolidado + análisis + comparación
.\import-methodology.ps1 -Analysis -Comparison
```

---

## ✅ VERIFICAR IMPORTACIÓN

Después de importar, verifica:

```powershell
# 1. Verificar que archivos existen
Test-Path ".vibethink\knowledge\methodologies\METHODOLOGY_VTHINK_UNIFIED.md"

# 2. Listar archivos importados
Get-ChildItem ".vibethink\knowledge\methodologies" | Select-Object Name

# 3. Ver tamaño total
(Get-ChildItem ".vibethink\knowledge\methodologies" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
```

---

## 🎯 USAR METODOLOGÍA EN EL PROYECTO

Una vez importada, puedes:

### **1. Referenciar en AGENTS.md:**

Edita `AGENTS.md` en la raíz de tu proyecto:

```markdown
## Metodología de Desarrollo

Este proyecto sigue la **Metodología VThink**:
- Ver: `.vibethink/knowledge/methodologies/METHODOLOGY_VTHINK_UNIFIED.md`
- Principios: Colaboración humano-IA, FAQs desde inicio, backlog infinito
- Comparación: Ver `.vibethink/knowledge/methodologies/METHODOLOGY_COMPARISON.md`
```

### **2. Aplicar en Desarrollo:**

- ✅ Usar FAQs desde el inicio en historias de usuario
- ✅ Aplicar verificación automática en cada paso
- ✅ Mantener backlog infinito con priorización dinámica
- ✅ Documentar colaboración humano-IA

### **3. Comparar con Otras Metodologías:**

Lee `METHODOLOGY_COMPARISON.md` para comparar VThink con:
- Scrum
- Shape Up
- Kanban
- GitHub Flow

---

## 📊 DECISIÓN: ¿INCLUIR O NO?

### **SÍ incluye metodología si:**
- ✅ Proyecto SaaS/AI/Multi-tenant complejo
- ✅ Desarrollo colaborativo humano-IA
- ✅ Necesitas guía de procesos completa
- ✅ Quieres anticipación total (FAQs)

### **NO incluyas metodología si:**
- ❌ Proyecto simple/small
- ❌ Solo necesitas reglas técnicas (conflicts.json)
- ❌ Ya tienes metodología establecida
- ❌ Quieres mantener proyecto mínimo

---

## 🔄 SINCRONIZAR ACTUALIZACIONES

Si la metodología se actualiza en el kit central:

```powershell
# Opción 1: Re-importar manualmente
.\import-methodology.ps1 -All

# Opción 2: Usar sync (si incluyes metodología)
.\vibethink\scripts\sync-from-kit.ps1
# (Nota: sync-from-kit.ps1 puede necesitar actualización para incluir metodología)
```

---

## 📚 DOCUMENTOS RELACIONADOS

### **Metodología:**
- **Metodología Consolidada:** `knowledge/methodologies/METHODOLOGY_VTHINK_UNIFIED.md`
- **Análisis Detallado:** `knowledge/methodologies/METHODOLOGY_ANALYSIS.md`
- **Resumen de Metodologías:** `knowledge/methodologies/RESUMEN_METODOLOGIAS.md`

### **Comparaciones:**
- **VThink vs OpenSpec (General):** `knowledge/methodologies/VTHINK_VS_OPENSPEC.md`
- **Comparación Completa (VThink vs OpenSpec vs Spec Kit):** `knowledge/methodologies/COMPARISON_VTHINK_OPENSPEC_SPECKIT.md`
- **Comparación Específica con OpenSpec:** `knowledge/methodologies/COMPARISON_VTHINK_OPENSPEC_ESPECIFICA.md`

### **Guías:**
- **Guía de Aplicación Kit:** `GUIA_APLICACION_KIT.md`
- **Extracción de Metodología:** `GUIA_EXTRACCION_METODOLOGIA.md`

---

**Última actualización:** 2025-12-13

