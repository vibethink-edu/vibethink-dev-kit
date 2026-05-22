# ============================================================================
# EXTRACT METHODOLOGY - V1.0.0
# ============================================================================
# Extrae metodología del Orchestrator y prepara para comparación
# ============================================================================

param(
    [string]$OrchestratorPath = "C:\IA Marcelo Labs\vibethink-orchestrator-main",
    [string]$OutputPath = "knowledge\methodologies",
    [switch]$Interactive = $true
)

# ============================================================================
# IMPORTANTE: La metodología SOLO está en vibethink-orchestrator-main
# NO buscar en otros proyectos - esta es la única fuente
# ============================================================================

$DEV_KIT = "C:\IA Marcelo Labs\_vibethink-dev-kit"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         📚 EXTRACT METHODOLOGY - V1.0.0                  ║" -ForegroundColor Cyan
Write-Host "║         (Herramienta para extraer metodologías)          ║" -ForegroundColor Gray
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Nota: Los archivos extraídos tendrán prefijo 'METHODOLOGY_' para" -ForegroundColor Yellow
Write-Host "   diferenciarlos de herramientas técnicas." -ForegroundColor Yellow
Write-Host ""

# ============================================================================
# PASO 1: Verificar que el Orchestrator existe
# ============================================================================

if (-not (Test-Path $OrchestratorPath)) {
    Write-Host "❌ ERROR: Orchestrator no encontrado en: $OrchestratorPath" -ForegroundColor Red
    Write-Host "   Usa el parámetro -OrchestratorPath para especificar otra ubicación" -ForegroundColor Gray
    exit 1
}

Write-Host "📁 Orchestrator encontrado: $OrchestratorPath" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PASO 2: Crear estructura de salida
# ============================================================================

$fullOutputPath = Join-Path $DEV_KIT $OutputPath
New-Item -ItemType Directory -Path $fullOutputPath -Force | Out-Null

Write-Host "📂 Estructura creada: $OutputPath" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PASO 3: Buscar archivos de metodología
# ============================================================================

Write-Host "🔍 Buscando archivos de metodología..." -ForegroundColor Yellow
Write-Host ""

$methodologyFiles = @()

# Buscar por nombre
$patterns = @(
    "*METHODOLOGY*.md",
    "*VTHINK*.md",
    "*METODOLOGIA*.md",
    "*METHOD*.md"
)

foreach ($pattern in $patterns) {
    $found = Get-ChildItem -Path $OrchestratorPath -Recurse -Filter $pattern -ErrorAction SilentlyContinue
    foreach ($file in $found) {
        if ($methodologyFiles -notcontains $file) {
            $methodologyFiles += $file
        }
    }
}

# Buscar por contenido
Write-Host "🔍 Buscando en contenido de archivos..." -ForegroundColor Yellow
$contentMatches = Select-String -Path "$OrchestratorPath\*.md" -Pattern "metodología|methodology|VThink|vthink|principle|law" -Recurse -List -ErrorAction SilentlyContinue

foreach ($match in $contentMatches) {
    $file = Get-Item $match.Path
    if ($methodologyFiles -notcontains $file -and $file.Name -notmatch "(node_modules|\.git)") {
        $methodologyFiles += $file
    }
}

# Mostrar resultados
if ($methodologyFiles.Count -eq 0) {
    Write-Host "⚠️  No se encontraron archivos específicos de metodología" -ForegroundColor Yellow
    Write-Host "   Buscando archivos que mencionen metodología..." -ForegroundColor Gray

    if ($contentMatches.Count -gt 0) {
        Write-Host ""
        Write-Host "📄 Archivos que mencionan metodología:" -ForegroundColor Cyan
        foreach ($match in $contentMatches) {
            $file = Get-Item $match.Path
            Write-Host "   - $($file.Name) (línea $($match.LineNumber))" -ForegroundColor Gray
            if ($methodologyFiles -notcontains $file) {
                $methodologyFiles += $file
            }
        }
    }
    else {
        Write-Host "❌ No se encontraron referencias a metodología" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Sugerencia:" -ForegroundColor Yellow
        Write-Host "   1. Revisar manualmente el orchestrator" -ForegroundColor Gray
        Write-Host "   2. Buscar archivos como:" -ForegroundColor Gray
        Write-Host "      - VTHINK_METHODOLOGY_LAW.md" -ForegroundColor Gray
        Write-Host "      - DEMO_MODE_METHODOLOGY.md" -ForegroundColor Gray
        Write-Host "      - WORKFLOW.md" -ForegroundColor Gray
        Write-Host "      - PRINCIPLES.md" -ForegroundColor Gray
        exit 0
    }
}

Write-Host ""
Write-Host "✅ Archivos encontrados: $($methodologyFiles.Count)" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PASO 4: Copiar y organizar archivos
# ============================================================================

Write-Host "📋 Copiando archivos..." -ForegroundColor Yellow
Write-Host ""

$copiedFiles = @()

foreach ($file in $methodologyFiles) {
    # Renombrar con prefijo METHODOLOGY_ para evitar confusión con herramientas
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $extension = [System.IO.Path]::GetExtension($file.Name)

    # Solo agregar prefijo si no lo tiene ya
    if ($baseName -notmatch "^METHODOLOGY_") {
        $newName = "METHODOLOGY_$baseName$extension"
    } else {
        $newName = $file.Name
    }

    $destPath = Join-Path $fullOutputPath $newName

    # Si ya existe, preguntar si sobrescribir
    if (Test-Path $destPath) {
        if ($Interactive) {
            try {
                $overwrite = Read-Host "   ⚠️  $newName ya existe. ¿Sobrescribir? (S/N)"
                if ($overwrite -ne 'S' -and $overwrite -ne 's') {
                    Write-Host "   ⏭️  Omitido: $newName" -ForegroundColor Yellow
                    continue
                }
            } catch {
                # Modo no interactivo: omitir archivo existente
                Write-Host "   ⏭️  Omitido (ya existe): $newName" -ForegroundColor Yellow
                continue
            }
        } else {
            # Modo no interactivo: omitir archivo existente
            Write-Host "   ⏭️  Omitido (ya existe): $newName" -ForegroundColor Yellow
            continue
        }
    }

    Copy-Item $file.FullName $destPath -Force
    $copiedFiles += $file

    # Mostrar info
    $lines = (Get-Content $file.FullName | Measure-Object -Line).Lines
    if ($newName -ne $file.Name) {
        Write-Host "   ✅ $($file.Name) → $newName ($lines líneas)" -ForegroundColor Green
    } else {
        Write-Host "   ✅ $newName ($lines líneas)" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================================================
# PASO 5: Generar análisis inicial
# ============================================================================

Write-Host "📊 Generando análisis inicial..." -ForegroundColor Yellow
Write-Host ""

$analysis = @"
# 📊 Análisis Inicial: Metodología VThink

**Fuente:** vibethink-orchestrator-main
**Fecha extracción:** $(Get-Date -Format "yyyy-MM-dd HH:mm")
**Total archivos:** $($copiedFiles.Count)

---

## Archivos Extraídos

$(foreach ($file in $copiedFiles) {
    $lines = (Get-Content $file.FullName | Measure-Object -Line).Lines
    $size = (Get-Item $file.FullName).Length
"- **[$($file.Name)]($($file.Name))** - $lines líneas, $size bytes"
})

---

## Próximos Pasos

### 1. Revisar Cada Archivo
- [ ] Leer y entender cada metodología
- [ ] Extraer principios clave
- [ ] Identificar reglas y flujos

### 2. Analizar Metodología
- [ ] Crear `VTHINK_ANALYSIS.md` con:
  - Principios clave
  - Flujo de trabajo
  - Reglas críticas
  - Ventajas únicas
  - Limitaciones

### 3. Comparar con Otras Metodologías
- [ ] Investigar metodologías establecidas:
  - Scrum (https://scrumguides.org/)
  - Shape Up (https://basecamp.com/shapeup)
  - Kanban (https://kanban.university/)
  - GitHub Flow (https://guides.github.com/introduction/flow/)
  - Design Sprint (https://www.gv.com/sprint/)

### 4. Crear Comparación
- [ ] Generar `COMPARISON.md` con matriz comparativa
- [ ] Identificar fortalezas y debilidades
- [ ] Generar recomendaciones

---

## Metodologías para Comparar

### Scrum
- **Fuente:** https://scrumguides.org/
- **Aspectos clave:** Sprints, roles (PO, SM, Dev), ceremonias
- **Duración:** 2-4 semanas

### Shape Up
- **Fuente:** https://basecamp.com/shapeup
- **Aspectos clave:** Cycles (6 semanas), betting table, shaping
- **Duración:** 6 semanas

### Kanban
- **Fuente:** https://kanban.university/
- **Aspectos clave:** Visual workflow, WIP limits, continuo
- **Duración:** Continuo

### GitHub Flow
- **Fuente:** https://guides.github.com/introduction/flow/
- **Aspectos clave:** Branch-based, PRs, deployment continuo
- **Duración:** Continuo

---

## Template de Comparación

Usar la siguiente estructura en `COMPARISON.md`:

\`\`\`markdown
| Aspecto | VThink | Scrum | Shape Up | Kanban | GitHub Flow |
|---------|--------|-------|----------|--------|-------------|
| Duración | ? | 2-4 semanas | 6 semanas | Continuo | Continuo |
| Roles | ? | PO, SM, Dev | Shaper, Builder | No roles | No roles |
| Planning | ? | Sprint Planning | Betting Table | Priorización | Issues |
\`\`\`

"@

$analysisPath = Join-Path $fullOutputPath "ANALYSIS_INITIAL.md"
$analysis | Out-File $analysisPath -Encoding UTF8
Write-Host "   ✅ Análisis inicial generado: ANALYSIS_INITIAL.md" -ForegroundColor Green

# ============================================================================
# PASO 6: Generar índice
# ============================================================================

$index = @"
# 📚 Metodologías Extraídas

**Fuente:** vibethink-orchestrator-main
**Fecha extracción:** $(Get-Date -Format "yyyy-MM-dd")
**Total archivos:** $($copiedFiles.Count)

---

## 📁 Archivos

$(foreach ($file in $copiedFiles) {
    $lines = (Get-Content $file.FullName | Measure-Object -Line).Lines
"- [$($file.Name)]($($file.Name)) - $lines líneas"
})

---

## 📋 Estado del Análisis

- [x] Archivos extraídos
- [ ] Análisis de cada metodología
- [ ] Extracción de principios clave
- [ ] Comparación con metodologías establecidas
- [ ] Generación de recomendaciones

---

## 🚀 Próximos Pasos

1. Revisar archivos en esta carpeta
2. Analizar cada metodología (ver `ANALYSIS_INITIAL.md`)
3. Comparar con metodologías establecidas
4. Generar `COMPARISON.md`
5. Crear `RECOMMENDATIONS.md`

---

**Ver:** [ANALYSIS_INITIAL.md](ANALYSIS_INITIAL.md) para guía completa

"@

$indexPath = Join-Path $fullOutputPath "INDEX.md"
$index | Out-File $indexPath -Encoding UTF8
Write-Host "   ✅ Índice generado: INDEX.md" -ForegroundColor Green

Write-Host ""

# ============================================================================
# RESUMEN
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         ✅ METODOLOGÍA EXTRAÍDA                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📁 Archivos copiados: $($copiedFiles.Count)" -ForegroundColor Cyan
Write-Host "📂 Ubicación: $OutputPath" -ForegroundColor Cyan
Write-Host ""

Write-Host "💡 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Revisar archivos en: $OutputPath" -ForegroundColor Gray
Write-Host "   2. Leer ANALYSIS_INITIAL.md para guía completa" -ForegroundColor Gray
Write-Host "   3. Analizar cada metodología manualmente" -ForegroundColor Gray
Write-Host "   4. Comparar con metodologías establecidas" -ForegroundColor Gray
Write-Host "   5. Generar COMPARISON.md y RECOMMENDATIONS.md" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Metodologías sugeridas para comparar:" -ForegroundColor Yellow
Write-Host "   - Scrum (https://scrumguides.org/)" -ForegroundColor Gray
Write-Host "   - Shape Up (https://basecamp.com/shapeup)" -ForegroundColor Gray
Write-Host "   - Kanban (https://kanban.university/)" -ForegroundColor Gray
Write-Host "   - GitHub Flow (https://guides.github.com/introduction/flow/)" -ForegroundColor Gray
Write-Host ""

