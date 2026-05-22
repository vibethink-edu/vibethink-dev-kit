# Start-VThinkDashboard.ps1
# Script robusto para iniciar el dashboard de VThink

param(
    [int]$Port = 3001,
    [switch]$Clean = $false,
    [switch]$Install = $false
)

$ErrorActionPreference = "Continue"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   VThink Dashboard Launcher v1.0" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Función para matar procesos en un puerto
function Stop-ProcessOnPort {
    param([int]$Port)
    
    $connections = netstat -ano | findstr ":$Port"
    foreach ($line in $connections) {
        if ($line -match '\s+(\d+)$') {
            $pid = $matches[1]
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "[✓] Puerto $Port liberado (PID: $pid)" -ForegroundColor Green
            } catch {
                # Ignorar errores si el proceso ya no existe
            }
        }
    }
}

# Navegar al directorio del dashboard
$dashboardPath = Join-Path $PSScriptRoot "apps\dashboard"
Set-Location $dashboardPath

# Limpiar si se solicita
if ($Clean) {
    Write-Host "[*] Limpiando instalación anterior..." -ForegroundColor Yellow
    Remove-Item -Path "node_modules", ".next", "pnpm-lock.yaml", "package-lock.json", "yarn.lock" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "[✓] Limpieza completada" -ForegroundColor Green
}

# Verificar gestor de paquetes
$packageManager = "pnpm"
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "[!] pnpm no encontrado, instalando..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Instalar dependencias si no existen o si se fuerza
if ($Install -or -not (Test-Path "node_modules")) {
    Write-Host "[*] Instalando dependencias con $packageManager..." -ForegroundColor Yellow
    & $packageManager install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[X] Error instalando dependencias" -ForegroundColor Red
        exit 1
    }
    Write-Host "[✓] Dependencias instaladas" -ForegroundColor Green
}

# Liberar puerto
Write-Host "[*] Verificando puerto $Port..." -ForegroundColor Yellow
Stop-ProcessOnPort -Port $Port

# Configurar variables de entorno
$env:PORT = $Port
$env:BROWSER = "none"
$env:NEXT_TELEMETRY_DISABLED = "1"

# Iniciar servidor
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "   Dashboard disponible en:" -ForegroundColor White
Write-Host "   → http://localhost:$Port" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

# Ejecutar Next.js
npx next dev -p $Port