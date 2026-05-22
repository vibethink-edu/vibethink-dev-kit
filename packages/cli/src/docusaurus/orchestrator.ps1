# Script maestro para orquestar todo el proceso de Docusaurus
# VThink 1.0 - Documentacion Multi-sitio

param(
    [string]$Action = "help",
    [switch]$Start = $false,
    [switch]$Stop = $false,
    [switch]$Validate = $false,
    [switch]$Migrate = $false,
    [switch]$Dashboard = $false,
    [switch]$All = $false
)

Write-Host "🚀 VThink 1.0 - Orquestador de Documentacion" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Funciones principales
function Start-AllSites {
    Write-Host "🌐 Iniciando todos los sitios..." -ForegroundColor Yellow
    & ".\dev-tools\docusaurus\start-sites.ps1"
}

function Stop-AllSites {
    Write-Host "🛑 Deteniendo todos los sitios..." -ForegroundColor Red
    Get-Process | Where-Object { 
        $_.ProcessName -eq "node" -and 
        $_.CommandLine -like "*docusaurus*" 
    } | Stop-Process -Force
    Write-Host "✅ Sitios detenidos" -ForegroundColor Green
}

function Test-AllSites {
    Write-Host "🔍 Validando sitios..." -ForegroundColor Yellow
    & ".\dev-tools\docusaurus\validate-sites.ps1"
}

function Migrate-Content {
    Write-Host "📦 Migrando contenido..." -ForegroundColor Yellow
    & ".\dev-tools\migration\migrate-content.ps1"
}

function Generate-Dashboard {
    Write-Host "📊 Generando dashboard..." -ForegroundColor Yellow
    & ".\dev-tools\migration\generate-dashboard.ps1"
}

function Show-Help {
    Write-Host "`n📋 Comandos disponibles:" -ForegroundColor Cyan
    Write-Host "=======================" -ForegroundColor Cyan
    Write-Host "  .\dev-tools\docusaurus\orchestrator.ps1 -Start" -ForegroundColor White
    Write-Host "  .\dev-tools\docusaurus\orchestrator.ps1 -Stop" -ForegroundColor White
    Write-Host "  .\dev-tools\docusaurus\orchestrator.ps1 -Validate" -ForegroundColor White
    Write-Host "  .\dev-tools\docusaurus\orchestrator.ps1 -Migrate" -ForegroundColor White
    Write-Host "  .\dev-tools\docusaurus\orchestrator.ps1 -Dashboard" -ForegroundColor White
    Write-Host "  .\dev-tools\docusaurus\orchestrator.ps1 -All" -ForegroundColor White
    Write-Host "`n🎯 Acceso rapido a sitios:" -ForegroundColor Yellow
    Write-Host "=========================" -ForegroundColor Yellow
    Write-Host "  📚 Usuario: http://localhost:3000" -ForegroundColor Green
    Write-Host "  👨‍💻 Desarrollador: http://localhost:3001" -ForegroundColor Green
    Write-Host "  🔌 API: http://localhost:3002" -ForegroundColor Green
    Write-Host "  📖 Metodologia: http://localhost:3003" -ForegroundColor Green
    Write-Host "  📁 Archivos: http://localhost:3004" -ForegroundColor Green
}

# Lógica principal
switch ($Action) {
    "start" { Start-AllSites }
    "stop" { Stop-AllSites }
    "validate" { Test-AllSites }
    "migrate" { Migrate-Content }
    "dashboard" { Generate-Dashboard }
    "all" { 
        Write-Host "🔄 Ejecutando secuencia completa..." -ForegroundColor Magenta
        Migrate-Content
        Start-Sleep -Seconds 2
        Start-AllSites
        Start-Sleep -Seconds 5
        Test-AllSites
        Generate-Dashboard
        Write-Host "`n🎉 Secuencia completada!" -ForegroundColor Green
    }
    default { Show-Help }
}

# Manejar parámetros de switch
if ($Start) { Start-AllSites }
if ($Stop) { Stop-AllSites }
if ($Validate) { Test-AllSites }
if ($Migrate) { Migrate-Content }
if ($Dashboard) { Generate-Dashboard }
if ($All) { 
    Write-Host "🔄 Ejecutando secuencia completa..." -ForegroundColor Magenta
    Migrate-Content
    Start-Sleep -Seconds 2
    Start-AllSites
    Start-Sleep -Seconds 5
    Test-AllSites
    Generate-Dashboard
    Write-Host "`n🎉 Secuencia completada!" -ForegroundColor Green
}

Write-Host "`n✅ Orquestador completado" -ForegroundColor Green 