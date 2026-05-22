# ============================================================================
# VALIDATE MULTI-IA - V1.0.0
# ============================================================================
# Valida compatibilidad entre AGENTS.md, .cursorrules y .vibethink.config.json
# Detecta conflictos y sugiere unificación
# ============================================================================

param(
    [switch]$Verbose = $false
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         🔄 VALIDATE MULTI-IA - Compatibility Checker     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()
$info = @()

# Leer archivos
$hasAgents = Test-Path "AGENTS.md"
$hasCursorrules = Test-Path ".cursorrules"
$hasConfig = Test-Path ".vibethink.config.json"

Write-Host "📄 Archivos detectados:" -ForegroundColor Yellow
Write-Host "   AGENTS.md: $(if ($hasAgents) { '✅' } else { '❌' })" -ForegroundColor $(if ($hasAgents) { 'Green' } else { 'Red' })
Write-Host "   .cursorrules: $(if ($hasCursorrules) { '✅' } else { '❌' })" -ForegroundColor $(if ($hasCursorrules) { 'Green' } else { 'Yellow' })
Write-Host "   .vibethink.config.json: $(if ($hasConfig) { '✅' } else { '❌' })" -ForegroundColor $(if ($hasConfig) { 'Green' } else { 'Red' })
Write-Host ""

if (-not $hasAgents) {
    $errors += "AGENTS.md no encontrado (requerido para Multi-IA)"
}

if (-not $hasConfig) {
    $errors += ".vibethink.config.json no encontrado (requerido)"
}

if ($errors.Count -gt 0) {
    Write-Host "❌ Archivos requeridos faltantes" -ForegroundColor Red
    foreach ($err in $errors) { Write-Host "   $err" -ForegroundColor Red }
    exit 1
}

# Leer contenidos
$agentsContent = if ($hasAgents) { Get-Content "AGENTS.md" -Raw } else { "" }
$cursorContent = if ($hasCursorrules) { Get-Content ".cursorrules" -Raw } else { "" }
$config = if ($hasConfig) { Get-Content ".vibethink.config.json" | ConvertFrom-Json } else { $null }

Write-Host "🔍 Validando coherencia..." -ForegroundColor Yellow
Write-Host ""

# Detectar stack en cada archivo
$stack = @{
    config = @{}
    agents = @{}
    cursor = @{}
}

# Stack desde config (fuente de verdad)
if ($config.stack.frontend.framework) {
    $stack.config.framework = $config.stack.frontend.framework.ToLower()
    if ($config.stack.frontend.frameworkVersion) {
        $stack.config.frameworkVersion = $config.stack.frontend.frameworkVersion
    }
}
if ($config.stack.frontend.buildTool) {
    $stack.config.buildTool = $config.stack.frontend.buildTool.ToLower()
    if ($config.stack.frontend.buildToolVersion) {
        $stack.config.buildToolVersion = $config.stack.frontend.buildToolVersion
    }
}
if ($config.stack.frontend.stateManagement) {
    $stack.config.stateManagement = $config.stack.frontend.stateManagement.ToLower()
}
if ($config.stack.backend.framework) {
    $stack.config.backend = $config.stack.backend.framework.ToLower()
    if ($config.stack.backend.frameworkVersion) {
        $stack.config.backendVersion = $config.stack.backend.frameworkVersion
    }
}
if ($config.stack.backend.database.provider) {
    $stack.config.database = $config.stack.backend.database.provider.ToLower()
}
if ($config.stack.backend.database.orm) {
    $stack.config.orm = $config.stack.backend.database.orm.ToLower()
}

# Stack desde AGENTS.md
if ($agentsContent) {
    # Framework
    if ($agentsContent -match "(?i)Framework:\s*React") { $stack.agents.framework = "react" }
    elseif ($agentsContent -match "(?i)Framework:\s*Next\.?js") { $stack.agents.framework = "next.js" }

    # Build Tool
    if ($agentsContent -match "(?i)Build Tool:\s*Vite") { $stack.agents.buildTool = "vite" }
    elseif ($agentsContent -match "(?i)Build Tool:\s*Next\.?js") { $stack.agents.buildTool = "next.js" }

    # State Management
    if ($agentsContent -match "(?i)Zustand") { $stack.agents.stateManagement = "zustand" }
    elseif ($agentsContent -match "(?i)Redux") { $stack.agents.stateManagement = "redux" }

    # Backend
    if ($agentsContent -match "(?i)Express\s+4") {
        $stack.agents.backend = "express"
        $stack.agents.backendVersion = "4"
    }
    elseif ($agentsContent -match "(?i)Express\s+5") {
        $stack.agents.backend = "express"
        $stack.agents.backendVersion = "5"
    }
    elseif ($agentsContent -match "(?i)Framework:\s*Express") {
        $stack.agents.backend = "express"
    }

    # Database
    if ($agentsContent -match "(?i)Provider:\s*Supabase") { $stack.agents.database = "supabase" }

    # ORM
    if ($agentsContent -match "(?i)ORM:\s*Prisma") { $stack.agents.orm = "prisma" }
    elseif ($agentsContent -match "(?i)ORM:\s*Drizzle") { $stack.agents.orm = "drizzle" }
    elseif ($agentsContent -match "(?i)ORM:\s*None") { $stack.agents.orm = "none" }
}

# Stack desde .cursorrules
if ($hasCursorrules -and $cursorContent) {
    # Framework
    if ($cursorContent -match "(?i)React") { $stack.cursor.framework = "react" }
    if ($cursorContent -match "(?i)Next\.?js") { $stack.cursor.framework = "next.js" }

    # Build Tool
    if ($cursorContent -match "(?i)Vite") { $stack.cursor.buildTool = "vite" }

    # State Management
    if ($cursorContent -match "(?i)Zustand") { $stack.cursor.stateManagement = "zustand" }
    if ($cursorContent -match "(?i)Redux") { $stack.cursor.stateManagement = "redux" }

    # Backend
    if ($cursorContent -match "(?i)Express\s+4") {
        $stack.cursor.backend = "express"
        $stack.cursor.backendVersion = "4"
    }
    elseif ($cursorContent -match "(?i)Express\s+5") {
        $stack.cursor.backend = "express"
        $stack.cursor.backendVersion = "5"
    }
    elseif ($cursorContent -match "(?i)Express") {
        $stack.cursor.backend = "express"
    }

    # Database
    if ($cursorContent -match "(?i)Supabase") { $stack.cursor.database = "supabase" }

    # ORM
    if ($cursorContent -match "(?i)Prisma") { $stack.cursor.orm = "prisma" }
    if ($cursorContent -match "(?i)Drizzle") { $stack.cursor.orm = "drizzle" }
}

# Comparar config vs AGENTS.md
if ($hasAgents) {
    # Framework
    if ($stack.config.framework -and $stack.agents.framework) {
        if ($stack.config.framework -ne $stack.agents.framework) {
            $warnings += "Frontend framework difiere: config=$($stack.config.framework) vs AGENTS.md=$($stack.agents.framework)"
        }
    }

    # Build Tool
    if ($stack.config.buildTool -and $stack.agents.buildTool) {
        if ($stack.config.buildTool -ne $stack.agents.buildTool) {
            $warnings += "Build tool difiere: config=$($stack.config.buildTool) vs AGENTS.md=$($stack.agents.buildTool)"
        }
    }

    # State Management
    if ($stack.config.stateManagement -and $stack.agents.stateManagement) {
        if ($stack.config.stateManagement -ne $stack.agents.stateManagement) {
            $warnings += "State management difiere: config=$($stack.config.stateManagement) vs AGENTS.md=$($stack.agents.stateManagement)"
        }
    }

    # Backend
    if ($stack.config.backend -and $stack.agents.backend) {
        if ($stack.config.backend -ne $stack.agents.backend) {
            $warnings += "Backend framework difiere: config=$($stack.config.backend) vs AGENTS.md=$($stack.agents.backend)"
        }
        # Backend version
        if ($stack.config.backendVersion -and $stack.agents.backendVersion) {
            if ($stack.config.backendVersion -notmatch "^$($stack.agents.backendVersion)\.") {
                $warnings += "Backend version difiere: config=$($stack.config.backendVersion) vs AGENTS.md mentions v$($stack.agents.backendVersion)"
            }
        }
    }

    # Database
    if ($stack.config.database -and $stack.agents.database) {
        if ($stack.config.database -ne $stack.agents.database) {
            $warnings += "Database provider difiere: config=$($stack.config.database) vs AGENTS.md=$($stack.agents.database)"
        }
    }

    # ORM
    if ($stack.config.orm -and $stack.agents.orm) {
        if ($stack.config.orm -ne $stack.agents.orm) {
            $warnings += "ORM difiere: config=$($stack.config.orm) vs AGENTS.md=$($stack.agents.orm)"
        }
    }
}

# Comparar config vs .cursorrules
if ($hasCursorrules) {
    # Framework
    if ($stack.config.framework -and $stack.cursor.framework) {
        if ($stack.config.framework -ne $stack.cursor.framework) {
            $warnings += "Frontend framework difiere: config=$($stack.config.framework) vs .cursorrules=$($stack.cursor.framework)"
        }
    }

    # Build Tool
    if ($stack.config.buildTool -and $stack.cursor.buildTool) {
        if ($stack.config.buildTool -ne $stack.cursor.buildTool) {
            $warnings += "Build tool difiere: config=$($stack.config.buildTool) vs .cursorrules=$($stack.cursor.buildTool)"
        }
    }

    # State Management
    if ($stack.config.stateManagement -and $stack.cursor.stateManagement) {
        if ($stack.config.stateManagement -ne $stack.cursor.stateManagement) {
            $warnings += "State management difiere: config=$($stack.config.stateManagement) vs .cursorrules=$($stack.cursor.stateManagement)"
        }
    }

    # Backend
    if ($stack.config.backend -and $stack.cursor.backend) {
        if ($stack.config.backend -ne $stack.cursor.backend) {
            $warnings += "Backend framework difiere: config=$($stack.config.backend) vs .cursorrules=$($stack.cursor.backend)"
        }
        # Backend version
        if ($stack.config.backendVersion -and $stack.cursor.backendVersion) {
            if ($stack.config.backendVersion -notmatch "^$($stack.cursor.backendVersion)\.") {
                $warnings += "Backend version difiere: config=$($stack.config.backendVersion) vs .cursorrules mentions v$($stack.cursor.backendVersion)"
            }
        }
    }

    # Database
    if ($stack.config.database -and $stack.cursor.database) {
        if ($stack.config.database -ne $stack.cursor.database) {
            $warnings += "Database provider difiere: config=$($stack.config.database) vs .cursorrules=$($stack.cursor.database)"
        }
    }

    # ORM
    if ($stack.config.orm -and $stack.cursor.orm) {
        if ($stack.config.orm -ne $stack.cursor.orm) {
            $warnings += "ORM difiere: config=$($stack.config.orm) vs .cursorrules=$($stack.cursor.orm)"
        }
    }
}

# Resumen
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         📊 RESULTADOS                                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Reportar resultados
if ($warnings.Count -gt 0) {
    Write-Host "⚠️  DIFERENCIAS DETECTADAS ($($warnings.Count)):" -ForegroundColor Yellow
    Write-Host ""
    foreach ($w in $warnings) {
        Write-Host "   🟡 $w" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "💡 Solución:" -ForegroundColor Cyan
    Write-Host "   .vibethink.config.json es la FUENTE DE VERDAD" -ForegroundColor Cyan
    Write-Host "   Actualiza AGENTS.md o .cursorrules para que coincidan con config" -ForegroundColor Cyan
    Write-Host "   O ejecuta .\scripts\setup-project.ps1 para regenerar archivos" -ForegroundColor Cyan
}
else {
    Write-Host "✅ ¡ARCHIVOS COHERENTES!" -ForegroundColor Green
    Write-Host "   Todas las IAs leerán la misma configuración" -ForegroundColor Gray
}

Write-Host ""

# Exit code: solo errores (archivos faltantes) retornan 1
# Warnings (diferencias) no bloquean, retornan 0
exit 0
