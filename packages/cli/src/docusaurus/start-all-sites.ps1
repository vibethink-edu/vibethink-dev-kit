# Script maestro para iniciar todos los sitios Docusaurus
# VThink 1.0 - Multi-sitio Docusaurus

Write-Host "🚀 VThink 1.0 - Iniciando todos los sitios Docusaurus" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green

# Configuración de sitios
$sites = @(
    @{
        Name = "docusaurus-docs"
        Description = "📚 Documentación de Usuario"
        Port = 3000
        URL = "http://localhost:3000"
    },
    @{
        Name = "docusaurus-dev"
        Description = "👨‍💻 Documentación de Desarrollador"
        Port = 3001
        URL = "http://localhost:3001"
    },
    @{
        Name = "docusaurus-api"
        Description = "🔌 Documentación de API"
        Port = 3002
        URL = "http://localhost:3002"
    },
    @{
        Name = "docusaurus-vthink"
        Description = "📖 Metodología VThink"
        Port = 3003
        URL = "http://localhost:3003"
    },
    @{
        Name = "docusaurus-archives"
        Description = "📁 Documentación Histórica"
        Port = 3004
        URL = "http://localhost:3004"
    }
)

# Función para verificar si un sitio existe
function Test-SiteExists {
    param([string]$SiteName)
    return Test-Path $SiteName
}

# Función para iniciar un sitio
function Start-Site {
    param(
        [string]$SiteName,
        [string]$Description,
        [int]$Port,
        [string]$URL
    )
    
    if (!(Test-SiteExists $SiteName)) {
        Write-Host "❌ $SiteName no existe" -ForegroundColor Red
        return $false
    }
    
    Write-Host "$Description en puerto $Port..." -ForegroundColor Yellow
    
    try {
        # Cambiar al directorio del sitio
        Push-Location $SiteName
        
        # Iniciar el sitio en background
        Start-Process powershell -ArgumentList "-Command", "npm start -- --port $Port" -WindowStyle Minimized
        
        # Volver al directorio original
        Pop-Location
        
        Write-Host "✅ $SiteName iniciado en $URL" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Error al iniciar $SiteName: $_" -ForegroundColor Red
        return $false
    }
}

# Función para mostrar resumen
function Show-Summary {
    Write-Host "`n🎉 Resumen de Sitios:" -ForegroundColor Cyan
    Write-Host "====================" -ForegroundColor Cyan
    
    foreach ($site in $sites) {
        $status = if (Test-SiteExists $site.Name) { "✅" } else { "❌" }
        Write-Host "$status $($site.Description)" -ForegroundColor White
        Write-Host "   URL: $($site.URL)" -ForegroundColor Gray
    }
    
    Write-Host "`n🌐 Acceso rápido:" -ForegroundColor Yellow
    Write-Host "=================" -ForegroundColor Yellow
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
        [switch]$Summary = $false
    )
    
    if ($Stop) {
        Stop-AllSites
        return
    }
    
    if ($Summary) {
        Show-Summary
        return
    }
    
    Write-Host "🚀 Iniciando todos los sitios Docusaurus..." -ForegroundColor Green
    
    $successCount = 0
    $totalCount = $sites.Count
    
    # Iniciar cada sitio
    foreach ($site in $sites) {
        if (Start-Site -SiteName $site.Name -Description $site.Description -Port $site.Port -URL $site.URL) {
            $successCount++
        }
        Start-Sleep -Seconds 3  # Pausa entre sitios
    }
    
    Write-Host "`n📊 Resultado: $successCount/$totalCount sitios iniciados" -ForegroundColor Cyan
    
    if ($successCount -eq $totalCount) {
        Write-Host "🎉 ¡Todos los sitios iniciados exitosamente!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Algunos sitios no se pudieron iniciar" -ForegroundColor Yellow
    }
    
    Show-Summary
    
    Write-Host "`n💡 Comandos útiles:" -ForegroundColor Yellow
    Write-Host "  .\dev-tools\docusaurus\start-all-sites.ps1 -Summary  # Ver información" -ForegroundColor White
    Write-Host "  .\dev-tools\docusaurus\start-all-sites.ps1 -Stop      # Detener todos" -ForegroundColor White
}

# Ejecutar función principal
Main @PSBoundParameters 