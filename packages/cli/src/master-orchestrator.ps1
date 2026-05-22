# Master Orchestrator - VThink 1.0
# Gestion centralizada de todas las herramientas de desarrollo

param(
    [string]$Action = "help",
    [string]$Category = "",
    [string]$Script = "",
    [switch]$List = $false,
    [switch]$Info = $false
)

Write-Host "VThink 1.0 - Master Orchestrator" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Configuracion de categorias
$categories = @{
    "docusaurus" = @{
        Path = "dev-tools/docusaurus/"
        Description = "Gestion de sitios Docusaurus"
        Scripts = @("start-sites.ps1", "validate-sites.ps1", "orchestrator.ps1")
    }
    "monitoring" = @{
        Path = "dev-tools/monitoring/"
        Description = "Monitoreo y health checks"
        Scripts = @("health-check.js", "quality-monitor.js", "database-monitor.ts")
    }
    "testing" = @{
        Path = "dev-tools/testing/"
        Description = "Scripts de testing y validacion"
        Scripts = @("test-auth-system-e2e.js", "test-bundui.js", "setup-test-db.ts")
    }
    "security" = @{
        Path = "dev-tools/security/"
        Description = "Auditoria y validacion de seguridad"
        Scripts = @("security-audit.ts", "check-auth-users.js", "check-hardcoding.js")
    }
    "deployment" = @{
        Path = "dev-tools/deployment/"
        Description = "Despliegue y backups"
        Scripts = @("deploy-production.js", "deploy-staging.js", "backup.ps1")
    }
    "validation" = @{
        Path = "dev-tools/validation/"
        Description = "Validacion de stack y proyectos"
        Scripts = @("stack-validation.js", "validate-vtk-pendientes.js")
    }
    "automation" = @{
        Path = "dev-tools/automation/"
        Description = "Automatizacion y limpieza"
        Scripts = @("version-automation.js", "fix-naming-conventions.js", "pre-commit-validation.js")
    }
    "documentation" = @{
        Path = "dev-tools/documentation/"
        Description = "Generacion y gestion de documentacion"
        Scripts = @("documentation-automation.js", "generate-documentation.js", "DocumentXTR.js")
    }
    "setup" = @{
        Path = "dev-tools/setup/"
        Description = "Configuracion y setup"
        Scripts = @("setup-env.js", "setup-dartai.js", "dart-setup.ts")
    }
    "migration" = @{
        Path = "dev-tools/migration/"
        Description = "Migracion de contenido"
        Scripts = @("migrate-content.ps1", "doc-inventory.js", "generate-dashboard.ps1")
    }
    "utilities" = @{
        Path = "dev-tools/utilities/"
        Description = "Scripts utilitarios diversos"
        Scripts = @("simple-test.js", "quick-start.js", "debug-styles.js")
    }
}

# Funcion para listar categorias
function Show-Categories {
    Write-Host "Categorias disponibles:" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    
    foreach ($cat in $categories.GetEnumerator()) {
        $scriptCount = (Get-ChildItem $cat.Value.Path -File | Measure-Object).Count
        Write-Host "  $($cat.Key): $($cat.Value.Description) ($scriptCount scripts)" -ForegroundColor White
    }
}

# Funcion para listar scripts de una categoria
function Show-Scripts {
    param([string]$CategoryName)
    
    if (!$categories.ContainsKey($CategoryName)) {
        Write-Host "Categoria '$CategoryName' no encontrada" -ForegroundColor Red
        return
    }
    
    $category = $categories[$CategoryName]
    Write-Host "Scripts en $($CategoryName):" -ForegroundColor Yellow
    Write-Host "=============================" -ForegroundColor Yellow
    
    $scripts = Get-ChildItem $category.Path -File | Sort-Object Name
    foreach ($script in $scripts) {
        Write-Host "  • $($script.Name)" -ForegroundColor White
    }
}

# Funcion para ejecutar un script
function Invoke-Script {
    param([string]$CategoryName, [string]$ScriptName)
    
    if (!$categories.ContainsKey($CategoryName)) {
        Write-Host "Categoria '$CategoryName' no encontrada" -ForegroundColor Red
        return
    }
    
    $scriptPath = Join-Path $categories[$CategoryName].Path $ScriptName
    if (!(Test-Path $scriptPath)) {
        Write-Host "Script '$ScriptName' no encontrado en $CategoryName" -ForegroundColor Red
        return
    }
    
    Write-Host "Ejecutando: $CategoryName/$ScriptName" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    
    try {
        & $scriptPath
    }
    catch {
        Write-Host "Error ejecutando script: $_" -ForegroundColor Red
    }
}

# Funcion para mostrar informacion del sistema
function Show-SystemInfo {
    Write-Host "Informacion del Sistema" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    
    $totalScripts = 0
    foreach ($cat in $categories.GetEnumerator()) {
        $scriptCount = (Get-ChildItem $cat.Value.Path -File | Measure-Object).Count
        $totalScripts += $scriptCount
    }
    
    Write-Host "Total de categorias: $($categories.Count)" -ForegroundColor White
    Write-Host "Total de scripts: $totalScripts" -ForegroundColor White
    Write-Host "Estructura: dev-tools/" -ForegroundColor White
    
    # Verificar integridad
    $missingCategories = @()
    foreach ($cat in $categories.GetEnumerator()) {
        if (!(Test-Path $cat.Value.Path)) {
            $missingCategories += $cat.Key
        }
    }
    
    if ($missingCategories.Count -gt 0) {
        Write-Host "Categorias faltantes: $($missingCategories -join ', ')" -ForegroundColor Yellow
    } else {
        Write-Host "Todas las categorias estan presentes" -ForegroundColor Green
    }
}

# Funcion para mostrar ayuda
function Show-Help {
    Write-Host "Comandos disponibles:" -ForegroundColor Cyan
    Write-Host "=======================" -ForegroundColor Cyan
    Write-Host "  .\dev-tools\master-orchestrator.ps1 -List" -ForegroundColor White
    Write-Host "  .\dev-tools\master-orchestrator.ps1 -Info" -ForegroundColor White
    Write-Host "  .\dev-tools\master-orchestrator.ps1 -Category docusaurus -List" -ForegroundColor White
    Write-Host "  .\dev-tools\master-orchestrator.ps1 -Category docusaurus -Script start-sites.ps1" -ForegroundColor White
    Write-Host "Ejemplos:" -ForegroundColor Yellow
    Write-Host "=============" -ForegroundColor Yellow
    Write-Host "  # Listar todas las categorias" -ForegroundColor Gray
    Write-Host "  .\dev-tools\master-orchestrator.ps1 -List" -ForegroundColor White
    Write-Host "  # Listar scripts de docusaurus" -ForegroundColor Gray
    Write-Host "  .\dev-tools\master-orchestrator.ps1 -Category docusaurus -List" -ForegroundColor White
    Write-Host "  # Ejecutar script de docusaurus" -ForegroundColor Gray
    Write-Host "  .\dev-tools\master-orchestrator.ps1 -Category docusaurus -Script start-sites.ps1" -ForegroundColor White
}

# Logica principal
switch ($Action) {
    "list" { 
        if ($Category) {
            Show-Scripts -CategoryName $Category
        } else {
            Show-Categories
        }
    }
    "info" { Show-SystemInfo }
    "run" { 
        if ($Category -and $Script) {
            Invoke-Script -CategoryName $Category -ScriptName $Script
        } else {
            Write-Host "Debes especificar -Category y -Script para ejecutar" -ForegroundColor Red
        }
    }
    default { Show-Help }
}

# Manejar parametros de switch
if ($List) {
    if ($Category) {
        Show-Scripts -CategoryName $Category
    } else {
        Show-Categories
    }
}

if ($Info) {
    Show-SystemInfo
}

Write-Host "Master Orchestrator completado" -ForegroundColor Green 