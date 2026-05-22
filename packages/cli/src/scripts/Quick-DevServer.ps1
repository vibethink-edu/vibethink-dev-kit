#Requires -Version 5.1
<#
.SYNOPSIS
    Optimizador Rapido de Servidor VThink 1.0
    
.DESCRIPTION
    Script simplificado para optimizar rapidamente el servidor de desarrollo.
    
.EXAMPLE
    .\Quick-DevServer.ps1
    Inicia el servidor optimizado
#>

[CmdletBinding()]
param()

# Colores para output
function Write-ColorOutput {
    param([string]$Message, [string]$Color = 'White', [string]$Prefix = "")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $fullMessage = if ($Prefix) { "[$timestamp] $Prefix $Message" } else { "[$timestamp] $Message" }
    Write-Host $fullMessage -ForegroundColor $Color
}

function Write-Header {
    param([string]$Title)
    $border = "=" * 50
    Write-Host ""
    Write-Host $border -ForegroundColor Magenta
    Write-Host " $Title" -ForegroundColor Magenta
    Write-Host $border -ForegroundColor Magenta
    Write-Host ""
}

Write-Header "OPTIMIZADOR RAPIDO VTHINK"

# 1. Terminar procesos Node.js
Write-ColorOutput "Terminando procesos Node.js..." -Color Yellow -Prefix "STOP"
try {
    $nodeProcs = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcs) {
        $nodeProcs | Stop-Process -Force -ErrorAction SilentlyContinue
        Write-ColorOutput "Procesos Node.js terminados ($($nodeProcs.Count) instancias)" -Color Green
    } else {
        Write-ColorOutput "No hay procesos Node.js activos" -Color Green
    }
} catch {
    Write-ColorOutput "Error terminando procesos: $($_.Exception.Message)" -Color Red
}

# 2. Limpiar caches
Write-ColorOutput "Limpiando caches..." -Color Cyan -Prefix "CLEAN"

$projectRoot = "C:\IA Marcelo Labs\vibethink-orchestrator-main"
$dashboardPath = "$projectRoot\apps\dashboard"

Push-Location $dashboardPath

$cacheDirs = @(".next", "node_modules\.cache", ".turbo")
$totalCleaned = 0

foreach ($cacheDir in $cacheDirs) {
    if (Test-Path $cacheDir) {
        try {
            $size = (Get-ChildItem $cacheDir -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
            Remove-Item $cacheDir -Recurse -Force -ErrorAction SilentlyContinue
            if (-not (Test-Path $cacheDir)) {
                $sizeStr = if ($size -gt 1MB) { "{0:N1} MB" -f ($size / 1MB) } else { "{0:N0} KB" -f ($size / 1KB) }
                Write-ColorOutput "$cacheDir limpiado ($sizeStr)" -Color Green
                $totalCleaned++
            }
        } catch {
            Write-ColorOutput "No se pudo limpiar $cacheDir" -Color Yellow
        }
    }
}

Write-ColorOutput "Limpieza completada: $totalCleaned directorios" -Color Green

# 3. Configurar variables de entorno
Write-ColorOutput "Configurando entorno optimizado..." -Color Cyan -Prefix "CONFIG"

$env:NODE_OPTIONS = "--max-old-space-size=4096 --optimize-for-size"
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:WATCHPACK_POLLING = "1000"

Write-ColorOutput "Variables configuradas:" -Color Green
Write-ColorOutput "   Memoria: 4096 MB" -Color White
Write-ColorOutput "   Telemetria: Deshabilitada" -Color White
Write-ColorOutput "   Polling: 1000ms" -Color White

# 4. Mostrar informacion del sistema
Write-ColorOutput "Informacion del sistema:" -Color Cyan -Prefix "INFO"
try {
    $nodeVersion = & node --version 2>$null
    $npmVersion = & npm --version 2>$null
    Write-ColorOutput "Node.js: $nodeVersion" -Color White
    Write-ColorOutput "NPM: $npmVersion" -Color White
} catch {
    Write-ColorOutput "Error obteniendo versiones" -Color Yellow
}

# 5. Iniciar servidor optimizado
Write-Header "INICIANDO SERVIDOR OPTIMIZADO"

Write-ColorOutput "Configuracion del servidor:" -Color Magenta
Write-ColorOutput "   Puerto: 3001" -Color White
Write-ColorOutput "   Memoria: 4096 MB" -Color White
Write-ColorOutput "   Directorio: $dashboardPath" -Color White
Write-ColorOutput "   Modo: Turbo habilitado" -Color White

Write-Host ""
Write-ColorOutput "Iniciando servidor optimizado! Presiona Ctrl+C para detener." -Color Green -Prefix "START"
Write-Host ""

# Iniciar el servidor
try {
    if (Test-Path "package.json") {
        $packageContent = Get-Content "package.json" | ConvertFrom-Json
        if ($packageContent.scripts."dev:fast") {
            & npm run dev:fast
        } else {
            Write-ColorOutput "Script dev:fast no encontrado, usando dev standard..." -Color Yellow
            & npm run dev
        }
    } else {
        Write-ColorOutput "package.json no encontrado en $dashboardPath" -Color Red
        Pop-Location
        exit 1
    }
} catch {
    Write-ColorOutput "Error iniciando servidor: $($_.Exception.Message)" -Color Red
    Pop-Location
    exit 1
}

Pop-Location