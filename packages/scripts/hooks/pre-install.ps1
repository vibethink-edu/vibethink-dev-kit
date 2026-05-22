# ============================================================================
# PRE-INSTALL HOOK - V1.0.0
# ============================================================================
# Valida dependencias ANTES de npm install
# Previene instalación de paquetes incompatibles
# Inspirado por: Claude Code Development Kit - Security Scanner Hook
# ============================================================================

param(
    [Parameter(Mandatory = $true)]
    [string]$Package,
    
    [switch]$Force = $false
)

Write-Host ""
Write-Host "🔍 Validando: $Package" -ForegroundColor Yellow
Write-Host ""

# ============================================================================
# PASO 1: Verificar que existe .vibethink.config.json
# ============================================================================

if (-not (Test-Path ".vibethink.config.json")) {
    Write-Host "⚠️  WARNING: .vibethink.config.json no encontrado" -ForegroundColor Yellow
    Write-Host "   Ejecuta: .\scripts\setup-project.ps1" -ForegroundColor Gray
    Write-Host ""
    
    if (-not $Force) {
        $continue = Read-Host "¿Continuar sin validación? (S/N)"
        if ($continue -ne "S") {
            exit 1
        }
    }
    
    exit 0
}

# ============================================================================
# PASO 2: Leer configuración
# ============================================================================

try {
    $config = Get-Content ".vibethink.config.json" | ConvertFrom-Json
}
catch {
    Write-Host "❌ ERROR: No se pudo leer .vibethink.config.json" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Gray
    exit 1
}

# ============================================================================
# PASO 3: Verificar si está en prohibited
# ============================================================================

$packageName = $Package -replace '@.*$', ''  # Remover versión

if ($config.compatibility.prohibited -contains $packageName) {
    Write-Host "❌ ERROR: $packageName está PROHIBIDO en este proyecto" -ForegroundColor Red
    Write-Host ""
    Write-Host "📚 Razón: Ver STACK_COMPATIBILITY.md" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Alternativas:" -ForegroundColor Cyan
    
    # Sugerir alternativas basadas en el paquete
    switch ($packageName) {
        "express@5" {
            Write-Host "   - express@^4.21.2 (recomendado)" -ForegroundColor Green
        }
        "next" {
            if ($config.stack.frontend.buildTool -eq "vite") {
                Write-Host "   - Mantener Vite (ya tienes build tool)" -ForegroundColor Green
            }
        }
        "vite" {
            if ($config.stack.frontend.framework -eq "next.js") {
                Write-Host "   - Next.js ya tiene su propio bundler" -ForegroundColor Green
            }
        }
        "prisma" {
            Write-Host "   - drizzle-orm (compatible con Refine)" -ForegroundColor Green
        }
        default {
            Write-Host "   - Ver STACK_COMPATIBILITY.md para alternativas" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    exit 1
}

# ============================================================================
# PASO 4: Verificar conflictos conocidos
# ============================================================================

$conflictFound = $false

foreach ($conflict in $config.compatibility.conflicts) {
    $isPackage1 = $packageName -eq $conflict.package1
    $isPackage2 = $packageName -eq $conflict.package2
    
    if ($isPackage1 -or $isPackage2) {
        $conflictFound = $true
        
        Write-Host "⚠️  CONFLICTO DETECTADO" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   Paquete: $packageName" -ForegroundColor Cyan
        Write-Host "   Conflicto con: $($conflict.package1) vs $($conflict.package2)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "   Razón:" -ForegroundColor Yellow
        Write-Host "   $($conflict.reason)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "   Solución:" -ForegroundColor Green
        Write-Host "   $($conflict.solution)" -ForegroundColor Gray
        Write-Host ""
        
        if (-not $Force) {
            $confirm = Read-Host "¿Continuar de todas formas? (S/N)"
            if ($confirm -ne "S") {
                Write-Host ""
                Write-Host "❌ Instalación cancelada" -ForegroundColor Red
                Write-Host ""
                exit 1
            }
        }
    }
}

# ============================================================================
# PASO 5: Verificar compatibilidad con stack actual
# ============================================================================

# Verificar si el paquete es compatible con el framework actual
$framework = $config.stack.frontend.framework

if ($framework -eq "next.js") {
    $nextjsIncompatible = @("vite", "react-router-dom", "express")
    if ($nextjsIncompatible -contains $packageName) {
        Write-Host "⚠️  WARNING: $packageName puede ser incompatible con Next.js" -ForegroundColor Yellow
        Write-Host "   Next.js tiene su propio sistema para esto" -ForegroundColor Gray
        Write-Host ""
        
        if (-not $Force) {
            $confirm = Read-Host "¿Continuar de todas formas? (S/N)"
            if ($confirm -ne "S") {
                exit 1
            }
        }
    }
}

if ($framework -eq "react" -and $config.stack.frontend.buildTool -eq "vite") {
    $viteIncompatible = @("next", "webpack", "react-scripts")
    if ($viteIncompatible -contains $packageName) {
        Write-Host "⚠️  WARNING: $packageName es incompatible con Vite" -ForegroundColor Yellow
        Write-Host "   Ya tienes Vite como build tool" -ForegroundColor Gray
        Write-Host ""
        
        if (-not $Force) {
            $confirm = Read-Host "¿Continuar de todas formas? (S/N)"
            if ($confirm -ne "S") {
                exit 1
            }
        }
    }
}

# ============================================================================
# PASO 6: Todo OK
# ============================================================================

if (-not $conflictFound) {
    Write-Host "✅ $packageName es compatible con tu stack" -ForegroundColor Green
    Write-Host ""
}
else {
    Write-Host "⚠️  Instalando con warnings (usuario confirmó)" -ForegroundColor Yellow
    Write-Host ""
}

exit 0
