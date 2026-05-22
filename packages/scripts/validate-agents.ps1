# ============================================================================
# VALIDATE AGENTS.MD - V1.0.0
# ============================================================================
# Valida estructura y claridad de AGENTS.md para consumo Multi-IA
# Detecta contradicciones, ambigüedades, y sugiere mejoras
# ============================================================================

param(
    [switch]$Verbose = $false,
    [switch]$Strict = $false
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         ✅ VALIDATE AGENTS.MD - Multi-IA Validator        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()
$suggestions = @()
$agentsFile = "AGENTS.md"

# ============================================================================
# PASO 1: Verificar que existe AGENTS.md
# ============================================================================

if (-not (Test-Path $agentsFile)) {
    Write-Host "❌ ERROR: AGENTS.md no encontrado" -ForegroundColor Red
    Write-Host "   Ejecuta setup-project.ps1 para crearlo" -ForegroundColor Gray
    exit 1
}

Write-Host "📄 Validando: $agentsFile" -ForegroundColor Yellow
Write-Host ""

# ============================================================================
# PASO 2: Leer contenido
# ============================================================================

try {
    $content = Get-Content $agentsFile -Raw
    $lines = Get-Content $agentsFile
    Write-Host "✅ Archivo leído correctamente" -ForegroundColor Green
}
catch {
    Write-Host "❌ ERROR: No se pudo leer AGENTS.md" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    exit 1
}

# ============================================================================
# PASO 3: Validar estructura básica
# ============================================================================

Write-Host ""
Write-Host "🔍 Validando estructura..." -ForegroundColor Yellow
Write-Host ""

# Verificar que empieza con # título
if ($lines[0] -notmatch '^#\s+') {
    $errors += "Primera línea debe ser un título H1 (ej: # Project Constitution)"
}
else {
    if ($Verbose) {
        Write-Host "   ✅ Título H1 presente" -ForegroundColor Gray
    }
}

# Verificar secciones requeridas
$requiredSections = @(
    "Stack",
    "Rules|Guidelines|Instructions",
    "Restrictions|Constraints|Prohibitions"
)

foreach ($section in $requiredSections) {
    if ($content -notmatch "(?i)##?\s*\**($section)") {
        $warnings += "Sección recomendada faltante: $($section -replace '\|.*', '')"
    }
    else {
        if ($Verbose) {
            Write-Host "   ✅ Sección encontrada: $($section -replace '\|.*', '')" -ForegroundColor Gray
        }
    }
}

# ============================================================================
# PASO 4: Detectar contradicciones
# ============================================================================

Write-Host ""
Write-Host "🔍 Detectando contradicciones..." -ForegroundColor Yellow
Write-Host ""

$contradictions = @()

# Detectar menciones de tecnologías contradictorias
$stackMentions = @{}

# Express
if ($content -match "Express\s+5" -and $content -match "Express\s+4") {
    $contradictions += @{
        tech    = "Express"
        issue   = "Menciona tanto Express 4 como Express 5"
        fix     = "Especificar una sola versión claramente"
    }
}

# State management
$hasZustand = $content -match "Zustand"
$hasRedux = $content -match "Redux"
$hasMobX = $content -match "MobX"

$stateManagers = @($hasZustand, $hasRedux, $hasMobX) | Where-Object { $_ }
if ($stateManagers.Count -gt 1) {
    $contradictions += @{
        tech    = "State Management"
        issue   = "Menciona múltiples state managers (Zustand, Redux, MobX)"
        fix     = "Especificar UNO solo y prohibir los demás explícitamente"
    }
}

# ORM
$hasPrisma = $content -match "Prisma"
$hasDrizzle = $content -match "Drizzle"
$hasSupabaseClient = $content -match "Supabase.*client"

if ($hasPrisma -and $hasSupabaseClient) {
    $contradictions += @{
        tech    = "ORM + Supabase"
        issue   = "Menciona Prisma con Supabase (redundante según conflicts.json)"
        fix     = "Usar Supabase client O Drizzle, no Prisma"
    }
}

if ($contradictions.Count -gt 0) {
    foreach ($contra in $contradictions) {
        $errors += "CONTRADICCIÓN en $($contra.tech): $($contra.issue)"
        $suggestions += "   💡 $($contra.fix)"
    }
}

# ============================================================================
# PASO 5: Detectar ambigüedades
# ============================================================================

Write-Host ""
Write-Host "🔍 Detectando ambigüedades..." -ForegroundColor Yellow
Write-Host ""

# Palabras ambiguas que confunden a IAs
$ambiguousPatterns = @(
    @{ pattern = "(?i)\b(maybe|perhaps|possibly|might)\b"; issue = "Palabras ambiguas (maybe, perhaps, etc.)" },
    @{ pattern = "(?i)\b(prefer|recommended|suggested)\b(?!\s+(stack|approach|solution))"; issue = "Uso de 'prefer/recommended' sin contexto claro" },
    @{ pattern = "(?i)\b(avoid|don't use)\b(?!\s+\w+)"; issue = "'avoid' o 'don't use' sin especificar QUÉ" }
)

foreach ($pattern in $ambiguousPatterns) {
    if ($content -match $pattern.pattern) {
        $warnings += "Ambigüedad detectada: $($pattern.issue)"
    }
}

# Detectar listas sin bullet points
$linesWithCommas = $lines | Where-Object { $_ -match "^\s*\w.*,\s*\w.*,\s*\w" -and $_ -notmatch "^\s*[-*+]" }
if ($linesWithCommas.Count -gt 0) {
    $warnings += "Detectadas listas separadas por comas (líneas: $($linesWithCommas.Count)). Usa bullet points para claridad"
}

# ============================================================================
# PASO 6: Validar claridad de instrucciones
# ============================================================================

Write-Host ""
Write-Host "🔍 Validando claridad de instrucciones..." -ForegroundColor Yellow
Write-Host ""

# Verificar que hay instrucciones imperativas (DO / DON'T)
$hasDo = $content -match "(?i)\b(DO|MUST|ALWAYS|REQUIRED)\b"
$hasDont = $content -match "(?i)\b(DON'T|NEVER|PROHIBITED|FORBIDDEN)\b"

if (-not $hasDo -and -not $hasDont) {
    $warnings += "No se encontraron instrucciones imperativas (DO/DON'T, MUST/NEVER)"
    $suggestions += "   💡 Agrega instrucciones claras: 'DO use X', 'DON'T use Y'"
}

# Verificar que prohibiciones son explícitas
if ($content -match "(?i)do not|don't" -and $content -notmatch "(?i)(NEVER|PROHIBITED)") {
    $suggestions += "   💡 Convierte 'don't' en 'NEVER' o 'PROHIBITED' para mayor claridad"
}

# ============================================================================
# PASO 7: Comparar con .vibethink.config.json
# ============================================================================

if (Test-Path ".vibethink.config.json") {
    Write-Host ""
    Write-Host "🔍 Comparando con .vibethink.config.json..." -ForegroundColor Yellow
    Write-Host ""

    try {
        $config = Get-Content ".vibethink.config.json" | ConvertFrom-Json

        # Verificar que stack en AGENTS.md coincide con config
        if ($config.stack.frontend.framework) {
            $framework = $config.stack.frontend.framework
            if ($content -notmatch $framework) {
                $warnings += "AGENTS.md no menciona framework frontend: $framework (en .vibethink.config.json)"
            }
        }

        if ($config.stack.frontend.stateManagement) {
            $stateMgmt = $config.stack.frontend.stateManagement
            if ($content -notmatch $stateMgmt) {
                $warnings += "AGENTS.md no menciona state management: $stateMgmt (en .vibethink.config.json)"
            }
        }

        if ($config.stack.backend.framework) {
            $backendFw = $config.stack.backend.framework
            if ($content -notmatch $backendFw) {
                $warnings += "AGENTS.md no menciona backend framework: $backendFw (en .vibethink.config.json)"
            }
        }

        if ($Verbose) {
            Write-Host "   ✅ Comparación con config completada" -ForegroundColor Gray
        }
    }
    catch {
        $warnings += "No se pudo parsear .vibethink.config.json para comparación"
    }
}

# ============================================================================
# PASO 8: Validar formato Markdown
# ============================================================================

if ($Strict) {
    Write-Host ""
    Write-Host "🔍 Validando formato Markdown (modo strict)..." -ForegroundColor Yellow
    Write-Host ""

    # Verificar que code blocks están cerrados
    $codeBlockStarts = ($content | Select-String -Pattern "```" -AllMatches).Matches.Count
    if ($codeBlockStarts % 2 -ne 0) {
        $errors += "Code blocks desbalanceados (``` sin cerrar)"
    }

    # Verificar que links tienen formato correcto
    $badLinks = $content | Select-String -Pattern "\[([^\]]+)\]\([^\)]*\s+[^\)]*\)" -AllMatches
    if ($badLinks.Matches.Count -gt 0) {
        $warnings += "Detectados links con espacios en URL (deben usar %20)"
    }
}

# ============================================================================
# PASO 9: Reportar Resultados
# ============================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         📊 RESULTADOS DE VALIDACIÓN                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Errores
if ($errors.Count -gt 0) {
    Write-Host "❌ ERRORES ($($errors.Count)):" -ForegroundColor Red
    Write-Host ""

    foreach ($error in $errors) {
        Write-Host "   🔴 $error" -ForegroundColor Red
    }

    Write-Host ""
}

# Warnings
if ($warnings.Count -gt 0) {
    Write-Host "⚠️  WARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
    Write-Host ""

    foreach ($warning in $warnings) {
        Write-Host "   🟡 $warning" -ForegroundColor Yellow
    }

    Write-Host ""
}

# Sugerencias
if ($suggestions.Count -gt 0) {
    Write-Host "💡 SUGERENCIAS ($($suggestions.Count)):" -ForegroundColor Cyan
    Write-Host ""

    foreach ($suggestion in $suggestions) {
        Write-Host "   $suggestion" -ForegroundColor Cyan
    }

    Write-Host ""
}

# Resumen
if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✅ ¡AGENTS.MD VÁLIDO!" -ForegroundColor Green
    Write-Host "   Estructura clara y sin contradicciones" -ForegroundColor Gray
    Write-Host "   Las IAs podrán leerlo correctamente" -ForegroundColor Gray
    Write-Host ""
}
else {
    Write-Host "📋 Resumen:" -ForegroundColor Cyan
    Write-Host "   Errores: $($errors.Count)" -ForegroundColor $(if ($errors.Count -gt 0) { "Red" } else { "Gray" })
    Write-Host "   Warnings: $($warnings.Count)" -ForegroundColor $(if ($warnings.Count -gt 0) { "Yellow" } else { "Gray" })
    Write-Host "   Sugerencias: $($suggestions.Count)" -ForegroundColor Cyan
    Write-Host ""

    if ($errors.Count -gt 0) {
        Write-Host "💡 Recomendación: Corrige los errores para asegurar comprensión Multi-IA" -ForegroundColor Yellow
    }
}

Write-Host ""

# Exit code
if ($errors.Count -gt 0) {
    exit 1
}
else {
    exit 0
}
