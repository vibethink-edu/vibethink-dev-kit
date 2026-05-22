# backup.ps1 - Script de Backup para Windows PowerShell
# Crear copias de seguridad antes de actualizaciones

Write-Host "💾 Creando backup del estado actual..." -ForegroundColor Yellow

# Función para crear backup
function Create-Backup {
    param([string]$SourcePath, [string]$Description)
    if (Test-Path $SourcePath) {
        $backupPath = "$SourcePath.backup"
        Copy-Item $SourcePath $backupPath -Force
        Write-Host "✅ $Description respaldado en $backupPath" -ForegroundColor Green
        return $true
    } else {
        Write-Host "⚠️  $SourcePath no encontrado (opcional)" -ForegroundColor Yellow
        return $false
    }
}

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ No se encontró package.json. Asegúrate de estar en el directorio del proyecto." -ForegroundColor Red
    exit 1
}

Write-Host "📁 Directorio del proyecto verificado" -ForegroundColor Green

# Crear backups de archivos críticos
$backups = @()

# package.json
if (Create-Backup "package.json" "package.json") {
    $backups += "package.json"
}

# package-lock.json
if (Create-Backup "package-lock.json" "package-lock.json") {
    $backups += "package-lock.json"
}

# tsconfig.json
if (Create-Backup "tsconfig.json" "tsconfig.json") {
    $backups += "tsconfig.json"
}

# tailwind.config.js
if (Create-Backup "tailwind.config.js" "tailwind.config.js") {
    $backups += "tailwind.config.js"
}

# src/index.css
if (Create-Backup "src/index.css" "index.css") {
    $backups += "src/index.css"
}

# Documentar estado actual
$currentState = @{
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    NodeVersion = node --version
    NpmVersion = npm --version
    Dependencies = Get-Content "package.json" | ConvertFrom-Json | Select-Object -ExpandProperty dependencies
    DevDependencies = Get-Content "package.json" | ConvertFrom-Json | Select-Object -ExpandProperty devDependencies
}

$stateFile = "backup-state-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$currentState | ConvertTo-Json -Depth 10 | Out-File $stateFile -Encoding UTF8

Write-Host "📋 Estado actual documentado en $stateFile" -ForegroundColor Green

# Verificar que los backups existen
Write-Host "`n🔍 Verificando backups creados..." -ForegroundColor Yellow
foreach ($backup in $backups) {
    $backupPath = "$backup.backup"
    if (Test-Path $backupPath) {
        $size = (Get-Item $backupPath).Length
        Write-Host "✅ $backupPath ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "❌ $backupPath no encontrado" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Backup completado exitosamente!" -ForegroundColor Green
Write-Host "📝 Archivos respaldados: $($backups.Count)" -ForegroundColor Cyan
Write-Host "📄 Estado documentado: $stateFile" -ForegroundColor Cyan

Write-Host "`n💡 Para restaurar, ejecuta: .\scripts\rollback.ps1" -ForegroundColor Yellow
Write-Host "🚀 Ahora puedes proceder con las actualizaciones de forma segura" -ForegroundColor Green 