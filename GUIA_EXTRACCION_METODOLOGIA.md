# 📚 GUÍA: Extracción y Comparación de Metodologías

**Versión:** 1.0.0
**Fecha:** 2025-12-12
**Objetivo:** Extraer metodología del Orchestrator y compararla con metodologías establecidas

---

## 🎯 Objetivo

Extraer la metodología VThink del proyecto `vibethink-orchestrator-main` y compararla con metodologías reconocidas para validar su efectividad y encontrar mejoras.

> **⚠️ IMPORTANTE:** La metodología **SOLO** está en `vibethink-orchestrator-main`.
> **NO** buscar en otros proyectos - esta es la única fuente.

---

## 📁 ESTRUCTURA PROPUESTA

### **1. Extraer Metodología del Orchestrator**

```
C:\IA Marcelo Labs\vibethink-orchestrator-main\
├── VTHINK_METHODOLOGY_LAW.md    ← Metodología principal
├── DEMO_MODE_METHODOLOGY.md     ← Metodología específica
└── (otros archivos de metodología)
```

### **2. Crear Estructura en Dev Kit**

```
_vibethink-dev-kit/
├── knowledge/
│   └── methodologies/           ← NUEVO
│       ├── VTHINK.md           ← Metodología extraída
│       ├── COMPARISON.md       ← Comparación con otras
│       └── ANALYSIS.md         ← Análisis y conclusiones
```

---

## 🔍 PASO 1: Identificar Archivos de Metodología

### **Comando para Buscar:**

```powershell
# Desde el orchestrator
cd "C:\IA Marcelo Labs\vibethink-orchestrator-main"

# Buscar archivos de metodología
Get-ChildItem -Recurse -Filter "*METHODOLOGY*.md"
Get-ChildItem -Recurse -Filter "*VTHINK*.md"
Get-ChildItem -Recurse -Filter "*METODOLOGIA*.md"
Get-ChildItem -Recurse -Filter "*METHOD*.md" | Where-Object { $_.Name -match "law|principle|guide" }

# Buscar en contenido
Select-String -Path *.md -Pattern "metodología|methodology|VThink|vthink" -Recurse
```

**Archivos esperados:**
- `VTHINK_METHODOLOGY_LAW.md`
- `DEMO_MODE_METHODOLOGY.md`
- Posibles: `WORKFLOW.md`, `PROCESS.md`, `PRINCIPLES.md`

---

## 📋 PASO 2: Extraer y Documentar

### **Script de Extracción Automática:**

```powershell
# extract-methodology.ps1 (crear en tools/)
param(
    [string]$OrchestratorPath = "C:\IA Marcelo Labs\vibethink-orchestrator-main",
    [string]$OutputPath = "knowledge\methodologies"
)

# 1. Crear estructura
New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null

# 2. Buscar archivos
$methodologyFiles = @()
$methodologyFiles += Get-ChildItem -Path $OrchestratorPath -Recurse -Filter "*METHODOLOGY*.md" -ErrorAction SilentlyContinue
$methodologyFiles += Get-ChildItem -Path $OrchestratorPath -Recurse -Filter "*VTHINK*.md" -ErrorAction SilentlyContinue

# 3. Copiar y organizar
foreach ($file in $methodologyFiles) {
    $destPath = Join-Path $OutputPath $file.Name
    Copy-Item $file.FullName $destPath -Force
    Write-Host "✅ Copiado: $($file.Name)" -ForegroundColor Green
}

# 4. Generar índice
$index = @"
# 📚 Metodologías Extraídas

**Fuente:** vibethink-orchestrator-main
**Fecha extracción:** $(Get-Date -Format "yyyy-MM-dd")

## Archivos Extraídos

$(foreach ($file in $methodologyFiles) {
"- [$($file.Name)]($($file.Name))"
})

## Próximos Pasos

1. Revisar cada metodología
2. Extraer principios clave
3. Comparar con metodologías establecidas
"@

$index | Out-File "$OutputPath\INDEX.md" -Encoding UTF8
```

---

## 🔍 PASO 3: Analizar Metodología Extraída

### **Template de Análisis:**

```markdown
# 📊 Análisis: VThink Methodology

## Principios Clave
1. [Principio 1]
2. [Principio 2]
3. [Principio 3]

## Flujo de Trabajo
- [Fase 1]
- [Fase 2]
- [Fase 3]

## Reglas Críticas
- [Regla 1]
- [Regla 2]

## Ventajas Únicas
- [Ventaja 1]
- [Ventaja 2]

## Limitaciones Identificadas
- [Limitación 1]
- [Limitación 2]
```

---

## 🆚 PASO 4: Comparar con Metodologías Establecidas

### **Metodologías a Comparar:**

1. **Scrum** (Ágil tradicional)
   - Fuente: https://scrumguides.org/
   - Enfoque: Sprints, roles, ceremonias

2. **Shape Up** (Basecamp)
   - Fuente: https://basecamp.com/shapeup
   - Enfoque: Cycles, bets, appetite

3. **Kanban** (Lean)
   - Fuente: https://kanban.university/
   - Enfoque: Visual workflow, WIP limits

4. **Shape Methodology** (verificar si existe)
   - Similar a Shape Up

5. **GitHub Flow** (Software Development)
   - Fuente: https://guides.github.com/introduction/flow/
   - Enfoque: Branch-based workflow

6. **Design Sprint** (Google Ventures)
   - Fuente: https://www.gv.com/sprint/
   - Enfoque: 5 días, design thinking

---

## 📊 PASO 5: Crear Matriz Comparativa

### **Template de Comparación:**

| Aspecto | VThink | Scrum | Shape Up | Kanban | GitHub Flow |
|---------|--------|-------|----------|--------|-------------|
| **Duración** | ? | 2-4 semanas | 6 semanas | Continuo | Continuo |
| **Roles** | ? | PO, SM, Dev | Shaper, Builder | No roles | No roles |
| **Planning** | ? | Sprint Planning | Betting Table | Priorización | Issues |
| **Delivery** | ? | Sprint Review | Demo | Continuo | PRs |
| **Feedback** | ? | Retrospectiva | Cool-down | Continuo | Code Review |
| **Ventajas** | ? | Estructurado | Innovación | Flexible | Simple |
| **Desventajas** | ? | Rigido | Requiere cultura | Sin estructura | Sin roles |

---

## 🛠️ PASO 6: Script de Comparación

### **Script para Generar Comparación:**

```powershell
# compare-methodologies.ps1
param(
    [string]$VThinkPath = "knowledge\methodologies\VTHINK.md"
)

# Leer metodología VThink
$vthink = Get-Content $VThinkPath -Raw

# Extraer secciones clave
# (Análisis manual primero, luego automatizar)

# Generar comparación
$comparison = @"
# 🔍 Comparación de Metodologías

## VThink vs Metodologías Establecidas

### Aspectos Comparados
1. Duración de ciclos
2. Roles y responsabilidades
3. Planificación
4. Entrega
5. Feedback
6. Ventajas/Desventajas

## Conclusiones

### Fortalezas de VThink
- [Fortaleza 1]
- [Fortaleza 2]

### Debilidades Identificadas
- [Debilidad 1]
- [Debilidad 2]

### Mejoras Recomendadas
- [Mejora 1 basada en Scrum]
- [Mejora 2 basada en Shape Up]
"@

$comparison | Out-File "knowledge\methodologies\COMPARISON.md" -Encoding UTF8
```

---

## 📝 PASO 7: Documentar Resultados

### **Estructura Final:**

```
knowledge/
└── methodologies/
    ├── INDEX.md                    ← Índice de metodologías
    ├── VTHINK.md                   ← Metodología extraída (limpia)
    ├── VTHINK_ANALYSIS.md          ← Análisis detallado
    ├── COMPARISON.md               ← Comparación con otras
    ├── RECOMMENDATIONS.md          ← Mejoras recomendadas
    └── REFERENCES.md               ← Fuentes de metodologías comparadas
```

---

## 🚀 WORKFLOW RECOMENDADO (Simplificado)

### **Opción 1: Automática (Recomendada)**

```powershell
# 1. Ir al dev kit
cd "C:\IA Marcelo Labs\_vibethink-dev-kit"

# 2. Ejecutar script de extracción
.\tools\extract-methodology.ps1

# 3. El script:
#    - Busca archivos de metodología en orchestrator
#    - Los copia a knowledge/methodologies/
#    - Genera INDEX.md y ANALYSIS_INITIAL.md
#    - Te da los próximos pasos

# 4. Revisar archivos extraídos
code knowledge\methodologies

# 5. Analizar cada metodología manualmente
#    - Leer archivos
#    - Extraer principios clave
#    - Documentar en VTHINK_ANALYSIS.md

# 6. Comparar con metodologías establecidas
#    - Investigar Scrum, Shape Up, Kanban, etc.
#    - Usar COMPARISON_TEMPLATE.md
#    - Crear COMPARISON.md

# 7. Generar recomendaciones
#    - Crear RECOMMENDATIONS.md
```

---

### **Opción 2: Manual (Si prefieres control total)**

```powershell
# 1. Ir al dev kit
cd "C:\IA Marcelo Labs\_vibethink-dev-kit"

# 2. Crear estructura
New-Item -ItemType Directory -Path "knowledge\methodologies" -Force

# 3. Buscar archivos en orchestrator
cd "..\vibethink-orchestrator-main"
Get-ChildItem -Recurse -Filter "*METHODOLOGY*.md"
Get-ChildItem -Recurse -Filter "*VTHINK*.md"

# 4. Copiar archivos encontrados manualmente
Copy-Item "VTHINK_METHODOLOGY_LAW.md" "..\_vibethink-dev-kit\knowledge\methodologies\"
Copy-Item "DEMO_MODE_METHODOLOGY.md" "..\_vibethink-dev-kit\knowledge\methodologies\"

# 5. Analizar manualmente
cd "..\_vibethink-dev-kit"
# Leer archivos y extraer principios clave

# 6. Comparar con metodologías establecidas
# (Investigar Scrum, Shape Up, etc.)

# 7. Usar template de comparación
# Copiar COMPARISON_TEMPLATE.md → COMPARISON.md
# Llenar con datos reales

# 8. Generar recomendaciones
# Crear RECOMMENDATIONS.md
```

---

## 📚 METODOLOGÍAS A INVESTIGAR

### **1. Scrum** ⭐⭐⭐
- **Fuente:** https://scrumguides.org/
- **Aspectos a comparar:**
  - Sprints (duración fija)
  - Roles (PO, SM, Dev Team)
  - Ceremonias (Planning, Daily, Review, Retro)
  - Artefactos (Backlog, Sprint Goal, Increment)

### **2. Shape Up** ⭐⭐⭐
- **Fuente:** https://basecamp.com/shapeup
- **Aspectos a comparar:**
  - Cycles (6 semanas)
  - Betting Table (planificación)
  - Appetite (presupuesto de tiempo)
  - Shaping (exploración antes de construir)

### **3. Kanban** ⭐⭐
- **Fuente:** https://kanban.university/
- **Aspectos a comparar:**
  - Visual workflow
  - WIP limits
  - Continuous delivery
  - No sprints

### **4. GitHub Flow** ⭐⭐
- **Fuente:** https://guides.github.com/introduction/flow/
- **Aspectos a comparar:**
  - Branch-based workflow
  - Pull requests
  - Continuous deployment
  - Simple y directo

### **5. Design Sprint** ⭐
- **Fuente:** https://www.gv.com/sprint/
- **Aspectos a comparar:**
  - 5 días
  - Design thinking
  - Prototipado rápido
  - Testing con usuarios

---

## 🔧 SCRIPT COMPLETO (Para Crear)

### **extract-and-analyze-methodology.ps1**

```powershell
# ============================================================================
# EXTRACT AND ANALYZE METHODOLOGY
# ============================================================================

param(
    [string]$OrchestratorPath = "C:\IA Marcelo Labs\vibethink-orchestrator-main",
    [switch]$Compare = $false
)

$kitPath = "C:\IA Marcelo Labs\_vibethink-dev-kit"
$outputPath = Join-Path $kitPath "knowledge\methodologies"

# Crear estructura
New-Item -ItemType Directory -Path $outputPath -Force | Out-Null

Write-Host "🔍 Buscando archivos de metodología..." -ForegroundColor Yellow

# Buscar archivos
$files = @()
$files += Get-ChildItem -Path $OrchestratorPath -Recurse -Filter "*METHODOLOGY*.md" -ErrorAction SilentlyContinue
$files += Get-ChildItem -Path $OrchestratorPath -Recurse -Filter "*VTHINK*.md" -ErrorAction SilentlyContinue
$files += Get-ChildItem -Path $OrchestratorPath -Recurse -Filter "*METODOLOGIA*.md" -ErrorAction SilentlyContinue

if ($files.Count -eq 0) {
    Write-Host "⚠️  No se encontraron archivos de metodología" -ForegroundColor Yellow
    Write-Host "   Buscando en contenido..." -ForegroundColor Gray

    # Buscar en contenido
    $contentMatches = Select-String -Path "$OrchestratorPath\*.md" -Pattern "metodología|methodology" -Recurse -List
    Write-Host "   Archivos que mencionan metodología: $($contentMatches.Count)" -ForegroundColor Cyan
}

# Copiar archivos encontrados
foreach ($file in $files) {
    $destPath = Join-Path $outputPath $file.Name
    Copy-Item $file.FullName $destPath -Force
    Write-Host "✅ Copiado: $($file.Name)" -ForegroundColor Green

    # Analizar contenido
    $content = Get-Content $file.FullName -Raw
    $lines = ($content -split "`n").Count
    Write-Host "   Líneas: $lines" -ForegroundColor Gray
}

# Generar índice
$index = @"
# 📚 Metodologías Extraídas

**Fuente:** vibethink-orchestrator-main
**Fecha extracción:** $(Get-Date -Format "yyyy-MM-dd")
**Total archivos:** $($files.Count)

## Archivos Extraídos

$(foreach ($file in $files) {
"- **[$($file.Name)]($($file.Name))** - $($file.Length) bytes"
})

## Próximos Pasos

1. ✅ Revisar cada metodología
2. ⏳ Extraer principios clave
3. ⏳ Comparar con metodologías establecidas
4. ⏳ Generar recomendaciones

## Metodologías a Comparar

- [ ] Scrum (https://scrumguides.org/)
- [ ] Shape Up (https://basecamp.com/shapeup)
- [ ] Kanban (https://kanban.university/)
- [ ] GitHub Flow (https://guides.github.com/introduction/flow/)
- [ ] Design Sprint (https://www.gv.com/sprint/)
"@

$index | Out-File "$outputPath\INDEX.md" -Encoding UTF8
Write-Host "✅ Índice generado: INDEX.md" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Siguiente paso:" -ForegroundColor Cyan
Write-Host "   1. Revisar archivos en: $outputPath" -ForegroundColor Gray
Write-Host "   2. Analizar cada metodología" -ForegroundColor Gray
Write-Host "   3. Comparar con metodologías establecidas" -ForegroundColor Gray
```

---

## ✅ CHECKLIST DE EXTRACCIÓN

- [ ] Identificar archivos de metodología en orchestrator
- [ ] Copiar archivos a `knowledge/methodologies/`
- [ ] Crear `INDEX.md` con lista de archivos
- [ ] Analizar cada metodología
- [ ] Extraer principios clave
- [ ] Documentar flujo de trabajo
- [ ] Identificar reglas críticas
- [ ] Investigar metodologías establecidas
- [ ] Crear matriz comparativa
- [ ] Generar recomendaciones
- [ ] Documentar conclusiones

---

## 🎯 FORMATO DE COMPARACIÓN

### **Template COMPARISON.md:**

```markdown
# 🔍 Comparación: VThink vs Metodologías Establecidas

## Resumen Ejecutivo

[Resumen breve de hallazgos]

## Principios Clave Comparados

| Principio | VThink | Scrum | Shape Up | Kanban |
|-----------|--------|-------|----------|--------|
| Duración | ? | 2-4 semanas | 6 semanas | Continuo |
| Planning | ? | Sprint Planning | Betting Table | Priorización |

## Análisis Detallado

### VThink
- Principios: [...]
- Flujo: [...]
- Ventajas: [...]
- Limitaciones: [...]

### Scrum
- Principios: [...]
- Flujo: [...]
- Ventajas: [...]
- Limitaciones: [...]

## Recomendaciones

### Fortalezas de VThink a Mantener
1. [...]
2. [...]

### Mejoras de Otras Metodologías
1. De Scrum: [...]
2. De Shape Up: [...]

### Híbrido Recomendado
[Combinar lo mejor de cada una]
```

---

**Última actualización:** 2025-12-12

