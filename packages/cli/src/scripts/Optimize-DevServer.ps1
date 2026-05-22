#Requires -Version 5.1
<#
.SYNOPSIS
    Optimizador de Servidor de Desarrollo VThink 1.0
    
.DESCRIPTION
    Script PowerShell profesional para optimizar el rendimiento del servidor de desarrollo Next.js.
    Incluye limpieza de caches, configuración de memoria, y monitoreo de rendimiento.
    
.PARAMETER Mode
    Modo de optimización: 'Quick', 'Deep', 'Monitor', 'Reset'
    
.PARAMETER Port
    Puerto para el servidor de desarrollo (default: 3001)
    
.PARAMETER Memory
    Tamaño del heap de Node.js en MB (default: 4096)
    
.PARAMETER Verbose
    Mostrar información detallada del proceso
    
.EXAMPLE
    .\Optimize-DevServer.ps1
    Ejecuta optimización rápida estándar
    
.EXAMPLE  
    .\Optimize-DevServer.ps1 -Mode Deep -Verbose
    Ejecuta optimización profunda con logs detallados
    
.EXAMPLE
    .\Optimize-DevServer.ps1 -Mode Monitor
    Solo monitorea el rendimiento actual
    
.NOTES
    Version: 1.0
    Author: VThink Development Team
    Created: 2025-01-01
    
.LINK
    https://github.com/vibethink/orchestrator
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('Quick', 'Deep', 'Monitor', 'Reset')]
    [string]$Mode = 'Quick',
    
    [Parameter(Mandatory=$false)]
    [ValidateRange(3000, 9999)]
    [int]$Port = 3001,
    
    [Parameter(Mandatory=$false)]
    [ValidateRange(1024, 16384)]
    [int]$Memory = 4096,
    
    [Parameter(Mandatory=$false)]
    [switch]$NoStart
)

# =============================================================================
# CONFIGURACIÓN Y VARIABLES GLOBALES
# =============================================================================

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

# Colores para output
$Colors = @{
    Success = 'Green'
    Warning = 'Yellow' 
    Error = 'Red'
    Info = 'Cyan'
    Header = 'Magenta'
}

# Configuración de paths
$ProjectRoot = Split-Path -Parent $PSScriptRoot | Split-Path -Parent
$DashboardPath = Join-Path $ProjectRoot "apps\dashboard"
$CachePaths = @(
    ".next",
    "node_modules\.cache",
    ".turbo",
    "tsconfig.tsbuildinfo"
)

# =============================================================================
# FUNCIONES UTILITARIAS
# =============================================================================

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = 'White',
        [string]$Prefix = ""
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $fullMessage = if ($Prefix) { "[$timestamp] $Prefix $Message" } else { "[$timestamp] $Message" }
    Write-Host $fullMessage -ForegroundColor $Color
}

function Write-Header {
    param([string]$Title)
    
    $border = "=" * 70
    Write-Host ""
    Write-ColorOutput $border -Color $Colors.Header
    Write-ColorOutput " $Title" -Color $Colors.Header
    Write-ColorOutput $border -Color $Colors.Header
    Write-Host ""
}

function Test-NodeProcess {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    return ($nodeProcesses.Count -gt 0)
}

function Stop-NodeProcesses {
    Write-ColorOutput "Terminando procesos Node.js..." -Color $Colors.Warning -Prefix "🔄"
    
    $processes = @("node", "next-server", "npm")
    foreach ($proc in $processes) {
        try {
            $procs = Get-Process -Name $proc -ErrorAction SilentlyContinue
            if ($procs) {
                $procs | Stop-Process -Force -ErrorAction SilentlyContinue
                Write-ColorOutput "✅ Procesos $proc terminados ($($procs.Count) instancias)" -Color $Colors.Success
            }
        }
        catch {
            Write-Verbose "No se encontraron procesos $proc"
        }
    }
    Start-Sleep -Seconds 2
}

function Clear-DevelopmentCaches {
    param([bool]$DeepClean = $false)
    
    Write-ColorOutput "Limpiando caches de desarrollo..." -Color $Colors.Info -Prefix "🧹"
    
    Push-Location $DashboardPath
    
    $cleaned = 0
    $totalSize = 0
    
    foreach ($cachePath in $CachePaths) {
        if (Test-Path $cachePath) {
            try {
                $size = (Get-ChildItem $cachePath -Recurse -Force -ErrorAction SilentlyContinue | 
                        Measure-Object -Property Length -Sum).Sum
                $totalSize += $size
                
                Remove-Item $cachePath -Recurse -Force -ErrorAction SilentlyContinue
                
                if (-not (Test-Path $cachePath)) {
                    $sizeStr = if ($size -gt 1MB) { "{0:N1} MB" -f ($size / 1MB) } else { "{0:N0} KB" -f ($size / 1KB) }
                    Write-ColorOutput "✅ $cachePath limpiado ($sizeStr)" -Color $Colors.Success
                    $cleaned++
                }
            }
            catch {
                Write-ColorOutput "⚠️ No se pudo limpiar $cachePath" -Color $Colors.Warning
            }
        }
    }
    
    # Deep clean adicional
    if ($DeepClean) {
        Write-ColorOutput "Ejecutando limpieza profunda..." -Color $Colors.Info -Prefix "🔍"
        
        # Limpiar npm cache
        & npm cache clean --force 2>$null
        
        # Limpiar temp files
        $tempPaths = @("tmp", "temp", "*.log", "*.temp")
        foreach ($temp in $tempPaths) {
            if (Test-Path $temp) {
                Remove-Item $temp -Recurse -Force -ErrorAction SilentlyContinue
            }
        }
    }
    
    $totalSizeStr = if ($totalSize -gt 1MB) { "{0:N1} MB" -f ($totalSize / 1MB) } else { "{0:N0} KB" -f ($totalSize / 1KB) }
    Write-ColorOutput "📊 Total limpiado: $cleaned directorios, $totalSizeStr liberados" -Color $Colors.Success
    
    Pop-Location
}

function Set-OptimizedEnvironment {
    Write-ColorOutput "Configurando variables de entorno optimizadas..." -Color $Colors.Info -Prefix "⚙️"
    
    # Node.js optimizations
    $env:NODE_OPTIONS = "--max-old-space-size=$Memory --optimize-for-size"
    $env:NEXT_TELEMETRY_DISABLED = "1"
    $env:WATCHPACK_POLLING = "1000"
    $env:NODE_ENV = "development"
    
    # Next.js optimizations
    $env:NEXT_PRIVATE_LOCAL_WEBPACK = "1"
    $env:NEXT_PRIVATE_DEBUG_CACHE = "0"
    
    Write-ColorOutput "✅ Variables configuradas:" -Color $Colors.Success
    Write-ColorOutput "   💾 Memoria: $Memory MB" -Color $Colors.Info
    Write-ColorOutput "   📡 Telemetría: Deshabilitada" -Color $Colors.Info
    Write-ColorOutput "   🔄 Polling: 1000ms" -Color $Colors.Info
}

function Test-ProjectStructure {
    Write-ColorOutput "Verificando estructura del proyecto..." -Color $Colors.Info -Prefix "🔍"
    
    if (-not (Test-Path $DashboardPath)) {
        Write-ColorOutput "❌ No se encuentra el directorio dashboard: $DashboardPath" -Color $Colors.Error
        return $false
    }
    
    $requiredFiles = @(
        "package.json",
        "next.config.js",
        "tsconfig.json"
    )
    
    Push-Location $DashboardPath
    
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            Write-ColorOutput "❌ Archivo requerido no encontrado: $file" -Color $Colors.Error
            Pop-Location
            return $false
        }
    }
    
    Pop-Location
    Write-ColorOutput "✅ Estructura del proyecto verificada" -Color $Colors.Success
    return $true
}

function Start-OptimizedServer {
    Write-ColorOutput "Iniciando servidor optimizado..." -Color $Colors.Info -Prefix "🚀"
    
    Push-Location $DashboardPath
    
    # Verificar que npm esté disponible
    try {
        $npmVersion = & npm --version 2>$null
        Write-ColorOutput "📦 NPM version: $npmVersion" -Color $Colors.Info
    }
    catch {
        Write-ColorOutput "❌ NPM no está disponible" -Color $Colors.Error
        Pop-Location
        return $false
    }
    
    # Mostrar configuración final
    Write-ColorOutput "🎯 Configuración del servidor:" -Color $Colors.Header
    Write-ColorOutput "   🌐 Puerto: $Port" -Color $Colors.Info
    Write-ColorOutput "   💾 Memoria: $Memory MB" -Color $Colors.Info
    Write-ColorOutput "   📁 Directorio: $DashboardPath" -Color $Colors.Info
    Write-ColorOutput "   ⚡ Modo: Turbo habilitado" -Color $Colors.Info
    
    Write-Host ""
    Write-ColorOutput "🎉 ¡Iniciando servidor optimizado! Presiona Ctrl+C para detener." -Color $Colors.Success
    Write-Host ""
    
    # Iniciar servidor
    try {
        & npm run dev:fast
    }
    catch {
        Write-ColorOutput "❌ Error iniciando servidor: $($_.Exception.Message)" -Color $Colors.Error
        Pop-Location
        return $false
    }
    
    Pop-Location
    return $true
}

function Show-PerformanceReport {
    Write-Header "📊 REPORTE DE RENDIMIENTO"
    
    # Información del sistema
    $memory = Get-CimInstance -ClassName Win32_OperatingSystem
    $cpu = Get-CimInstance -ClassName Win32_Processor
    
    Write-ColorOutput "💻 Sistema:" -Color $Colors.Header
    Write-ColorOutput "   OS: $($memory.Caption)" -Color $Colors.Info
    Write-ColorOutput "   CPU: $($cpu.Name)" -Color $Colors.Info
    Write-ColorOutput "   RAM Total: $([math]::Round($memory.TotalVisibleMemorySize / 1MB, 1)) GB" -Color $Colors.Info
    Write-ColorOutput "   RAM Libre: $([math]::Round($memory.FreePhysicalMemory / 1MB, 1)) GB" -Color $Colors.Info
    
    # Información del proyecto
    Push-Location $DashboardPath -ErrorAction SilentlyContinue
    
    if (Test-Path "package.json") {
        $packageInfo = Get-Content "package.json" | ConvertFrom-Json
        Write-ColorOutput "📦 Proyecto:" -Color $Colors.Header
        Write-ColorOutput "   Nombre: $($packageInfo.name)" -Color $Colors.Info
        Write-ColorOutput "   Versión: $($packageInfo.version)" -Color $Colors.Info
    }
    
    # Tamaño de directorios
    $dirSizes = @{}
    $checkDirs = @("node_modules", ".next", "src", "app")
    
    foreach ($dir in $checkDirs) {
        if (Test-Path $dir) {
            try {
                $size = (Get-ChildItem $dir -Recurse -Force -ErrorAction SilentlyContinue | 
                        Measure-Object -Property Length -Sum).Sum
                $dirSizes[$dir] = $size
            }
            catch {
                $dirSizes[$dir] = 0
            }
        }
    }
    
    Write-ColorOutput "📁 Tamaños de directorio:" -Color $Colors.Header
    foreach ($dir in $dirSizes.Keys) {
        $sizeStr = if ($dirSizes[$dir] -gt 1MB) { 
            "{0:N1} MB" -f ($dirSizes[$dir] / 1MB) 
        } else { 
            "{0:N0} KB" -f ($dirSizes[$dir] / 1KB) 
        }
        Write-ColorOutput "   $dir`: $sizeStr" -Color $Colors.Info
    }
    
    # Procesos Node.js activos
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-ColorOutput "🔄 Procesos Node.js activos: $($nodeProcesses.Count)" -Color $Colors.Warning
    } else {
        Write-ColorOutput "✅ No hay procesos Node.js activos" -Color $Colors.Success
    }
    
    Pop-Location -ErrorAction SilentlyContinue
}

# =============================================================================
# FUNCIÓN PRINCIPAL
# =============================================================================

function Invoke-ServerOptimization {
    Write-Header "🚀 OPTIMIZADOR DE SERVIDOR VTHINK 1.0"
    
    Write-ColorOutput "Modo: $Mode | Puerto: $Port | Memoria: $Memory MB" -Color $Colors.Info -Prefix "📋"
    
    # Verificar estructura del proyecto
    if (-not (Test-ProjectStructure)) {
        Write-ColorOutput "❌ Error en la verificación del proyecto. Abortando." -Color $Colors.Error
        exit 1
    }
    
    switch ($Mode) {
        'Monitor' {
            Show-PerformanceReport
            return
        }
        
        'Reset' {
            Write-Header "🔄 RESET COMPLETO DEL PROYECTO"
            Stop-NodeProcesses
            Clear-DevelopmentCaches -DeepClean $true
            
            Write-ColorOutput "🗑️  Eliminando node_modules..." -Color $Colors.Warning
            Push-Location $DashboardPath
            if (Test-Path "node_modules") {
                Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
            }
            
            Write-ColorOutput "📦 Reinstalando dependencias..." -Color $Colors.Info
            & npm install
            Pop-Location
            
            Write-ColorOutput "✅ Reset completo finalizado" -Color $Colors.Success
            return
        }
        
        'Deep' {
            Write-Header "🔍 OPTIMIZACIÓN PROFUNDA"
            Stop-NodeProcesses
            Clear-DevelopmentCaches -DeepClean $true
            Set-OptimizedEnvironment
            Show-PerformanceReport
            
            if (-not $NoStart) {
                Start-OptimizedServer
            }
        }
        
        'Quick' {
            Write-Header "⚡ OPTIMIZACIÓN RÁPIDA"
            Stop-NodeProcesses
            Clear-DevelopmentCaches
            Set-OptimizedEnvironment
            
            if (-not $NoStart) {
                Start-OptimizedServer
            }
        }
    }
    
    Write-ColorOutput "🎉 Optimización completada exitosamente!" -Color $Colors.Success -Prefix "✅"
}

# =============================================================================
# MANEJO DE ERRORES Y EJECUCIÓN
# =============================================================================

trap {
    Write-ColorOutput "❌ Error inesperado: $($_.Exception.Message)" -Color $Colors.Error
    Write-ColorOutput "📍 En línea: $($_.InvocationInfo.ScriptLineNumber)" -Color $Colors.Error
    exit 1
}

# Verificar permisos de administrador para ciertas operaciones
if ($Mode -eq 'Reset' -and -not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-ColorOutput "⚠️  El modo Reset puede requerir permisos de administrador" -Color $Colors.Warning
}

# Ejecutar optimización
try {
    Invoke-ServerOptimization
}
catch {
    Write-ColorOutput "❌ Error durante la optimización: $($_.Exception.Message)" -Color $Colors.Error
    exit 1
}

# =============================================================================
# INFORMACIÓN DE AYUDA FINAL
# =============================================================================

if ($Mode -ne 'Monitor') {
    Write-Host ""
    Write-ColorOutput "💡 Comandos útiles adicionales:" -Color $Colors.Header
    Write-ColorOutput "   .\Optimize-DevServer.ps1 -Mode Monitor    # Ver estado actual" -Color $Colors.Info
    Write-ColorOutput "   .\Optimize-DevServer.ps1 -Mode Deep       # Optimización profunda" -Color $Colors.Info
    Write-ColorOutput "   .\Optimize-DevServer.ps1 -Mode Reset      # Reset completo" -Color $Colors.Info
    Write-ColorOutput "   npm run dev:fast                          # Servidor rápido" -Color $Colors.Info
    Write-ColorOutput "   npm run clean                             # Solo limpiar caches" -Color $Colors.Info
    Write-Host ""
}