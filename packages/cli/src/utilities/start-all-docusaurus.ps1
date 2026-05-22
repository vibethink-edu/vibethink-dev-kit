# Script para iniciar todos los sitios Docusaurus
# VThink 1.0 - Multi-sitio Docusaurus

Write-Host "🚀 Iniciando todos los sitios Docusaurus..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Configuración de sitios y puertos
$sites = @(
    @{
        Name = "docusaurus-docs"
        Description = "Documentación de Usuario"
        Port = 3000
        Path = "docusaurus-docs"
    },
    @{
        Name = "docusaurus-dev"
        Description = "Documentación de Desarrollador"
        Port = 3001
        Path = "docusaurus-dev"
    },
    @{
        Name = "docusaurus-api"
        Description = "Documentación de API"
        Port = 3002
        Path = "docusaurus-api"
    },
    @{
        Name = "docusaurus-vthink"
        Description = "Metodología VThink"
        Port = 3003
        Path = "docusaurus-vthink"
    },
    @{
        Name = "docusaurus-archives"
        Description = "Documentación Histórica"
        Port = 3004
        Path = "docusaurus-archives"
    }
)

# Función para verificar si un puerto está disponible
function Test-Port {
    param([int]$Port)
    
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $false  # Puerto ocupado
    }
    catch {
        return $true   # Puerto disponible
    }
}

# Función para iniciar un sitio
function Start-DocusaurusSite {
    param(
        [string]$SiteName,
        [string]$Description,
        [int]$Port,
        [string]$Path
    )
    
    Write-Host "🌐 Iniciando $SiteName en puerto $Port..." -ForegroundColor Yellow
    
    if (!(Test-Path $Path)) {
        Write-Host "❌ El sitio $SiteName no existe en $Path" -ForegroundColor Red
        return
    }
    
    if (!(Test-Port $Port)) {
        Write-Host "⚠️  Puerto $Port está ocupado, intentando puerto $($Port + 1)" -ForegroundColor Yellow
        $Port = $Port + 1
    }
    
    # Cambiar al directorio del sitio
    Push-Location $Path
    
    try {
        # Iniciar el sitio en background
        Start-Process powershell -ArgumentList "-Command", "npm start -- --port $Port" -WindowStyle Minimized
        Write-Host "✅ $SiteName iniciado en http://localhost:$Port" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Error al iniciar $SiteName: $_" -ForegroundColor Red
    }
    
    # Volver al directorio original
    Pop-Location
}

# Función para mostrar información de sitios
function Show-SitesInfo {
    Write-Host "`n📋 Información de Sitios:" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    
    foreach ($site in $sites) {
        $status = if (Test-Port $site.Port) { "⏳" } else { "✅" }
        Write-Host "$status $($site.Name): http://localhost:$($site.Port)" -ForegroundColor White
        Write-Host "   Descripción: $($site.Description)" -ForegroundColor Gray
    }
    
    Write-Host "`n🎯 Acceso rápido:" -ForegroundColor Cyan
    Write-Host "=================" -ForegroundColor Cyan
    Write-Host "📚 Usuario: http://localhost:3000" -ForegroundColor Green
    Write-Host "👨‍💻 Desarrollador: http://localhost:3001" -ForegroundColor Green
    Write-Host "🔌 API: http://localhost:3002" -ForegroundColor Green
    Write-Host "📖 Metodología: http://localhost:3003" -ForegroundColor Green
    Write-Host "📁 Archivos: http://localhost:3004" -ForegroundColor Green
}

# Función para detener todos los sitios
function Stop-AllSites {
    Write-Host "🛑 Deteniendo todos los sitios..." -ForegroundColor Red
    
    # Detener procesos de Node.js que estén ejecutando Docusaurus
    Get-Process | Where-Object { 
        $_.ProcessName -eq "node" -and 
        $_.CommandLine -like "*docusaurus*" 
    } | Stop-Process -Force
    
    Write-Host "✅ Todos los sitios detenidos" -ForegroundColor Green
}

# Función principal
function Main {
    param(
        [switch]$Stop = $false,
        [switch]$Info = $false
    )
    
    if ($Stop) {
        Stop-AllSites
        return
    }
    
    if ($Info) {
        Show-SitesInfo
        return
    }
    
    Write-Host "🚀 Iniciando todos los sitios Docusaurus..." -ForegroundColor Green
    
    # Iniciar cada sitio
    foreach ($site in $sites) {
        Start-DocusaurusSite -SiteName $site.Name -Description $site.Description -Port $site.Port -Path $site.Path
        Start-Sleep -Seconds 2  # Pausa entre sitios
    }
    
    Write-Host "`n🎉 ¡Todos los sitios iniciados!" -ForegroundColor Green
    Show-SitesInfo
    
    Write-Host "`n💡 Comandos útiles:" -ForegroundColor Yellow
    Write-Host "  .\start-all-docusaurus.ps1 -Info    # Ver información de sitios" -ForegroundColor White
    Write-Host "  .\start-all-docusaurus.ps1 -Stop     # Detener todos los sitios" -ForegroundColor White
}

# Ejecutar función principal
Main @PSBoundParameters 