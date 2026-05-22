# Script de arranque para VibeThink Orchestrator - PowerShell
# Compatible con Windows y PowerShell

Write-Host "🚀 Iniciando VibeThink Orchestrator..." -ForegroundColor Green

# Verificar si estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js no está instalado o no está en el PATH." -ForegroundColor Red
    exit 1
}

# Verificar si npm está instalado
try {
    $npmVersion = npm --version
    Write-Host "✅ npm detectado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: npm no está instalado o no está en el PATH." -ForegroundColor Red
    exit 1
}

# Verificar si las dependencias están instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al instalar dependencias." -ForegroundColor Red
        exit 1
    }
}

# Verificar puertos disponibles
Write-Host "🔍 Verificando puertos disponibles..." -ForegroundColor Yellow

# Función para verificar si un puerto está en uso
function Test-Port {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet
        return $connection.TcpTestSucceeded
    } catch {
        return $false
    }
}

# Verificar puerto 3000 (Next.js por defecto)
if (Test-Port -Port 3000) {
    Write-Host "⚠️  Puerto 3000 está ocupado. Intentando puerto 3001..." -ForegroundColor Yellow
    $env:PORT = "3001"
} else {
    Write-Host "✅ Puerto 3000 disponible" -ForegroundColor Green
    $env:PORT = "3000"
}

# Verificar puerto 8080 (Vite por defecto)
if (Test-Port -Port 8080) {
    Write-Host "⚠️  Puerto 8080 está ocupado. Intentando puerto 8081..." -ForegroundColor Yellow
    $env:VITE_PORT = "8081"
} else {
    Write-Host "✅ Puerto 8080 disponible" -ForegroundColor Green
    $env:VITE_PORT = "8080"
}

# Iniciar el servidor de desarrollo
Write-Host "🚀 Iniciando servidor de desarrollo..." -ForegroundColor Green

# Intentar iniciar Next.js primero
if (Test-Path "next.config.js" -or Test-Path "next.config.ts") {
    Write-Host "📱 Iniciando Next.js..." -ForegroundColor Cyan
    npm run dev
} elseif (Test-Path "nextjs-migration-temp") {
    Write-Host "📱 Iniciando Next.js desde directorio de migración..." -ForegroundColor Cyan
    Set-Location "nextjs-migration-temp"
    npm run dev
} else {
    Write-Host "📱 Iniciando Vite..." -ForegroundColor Cyan
    npm run dev
}

Write-Host "✅ Servidor iniciado correctamente!" -ForegroundColor Green
Write-Host "🌐 Abre tu navegador en: http://localhost:$env:PORT" -ForegroundColor Cyan 