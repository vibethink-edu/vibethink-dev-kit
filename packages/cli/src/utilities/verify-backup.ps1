# Script de Verificación de Backup
# Verifica que un backup sea válido antes de restaurar

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupName
)

Write-Host "🔍 VERIFICANDO BACKUP: $BackupName" -ForegroundColor Green

$backupPath = "backups/$BackupName"

# 1. Verificar que el backup existe
if (-not (Test-Path $backupPath)) {
    Write-Host "❌ Backup no encontrado: $backupPath" -ForegroundColor Red
    exit 1
}

# 2. Verificar archivos críticos
$criticalFiles = @(
    "package.json",
    "package-lock.json", 
    "vite.config.ts",
    "tailwind.config.ts",
    "src/App.tsx",
    "backup-metadata.json",
    "checksum.txt",
    "restore.ps1"
)

Write-Host "📋 Verificando archivos críticos..." -ForegroundColor Yellow
$missingFiles = @()

foreach ($file in $criticalFiles) {
    if (Test-Path "$backupPath/$file") {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file" -ForegroundColor Red
        $missingFiles += $file
    }
}

# 3. Verificar checksum
Write-Host "🔐 Verificando integridad..." -ForegroundColor Yellow
if (Test-Path "$backupPath/checksum.txt") {
    $storedChecksum = Get-Content "$backupPath/checksum.txt"
    $currentChecksum = Get-FileHash -Path "$backupPath/backup-metadata.json" -Algorithm SHA256
    if ($storedChecksum -eq $currentChecksum.Hash) {
        Write-Host "  ✅ Checksum válido" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Checksum inválido - Backup corrupto" -ForegroundColor Red
        $missingFiles += "checksum"
    }
} else {
    Write-Host "  ⚠️  No se encontró checksum" -ForegroundColor Yellow
}

# 4. Leer metadatos
Write-Host "📊 Información del backup:" -ForegroundColor Yellow
if (Test-Path "$backupPath/backup-metadata.json") {
    $metadata = Get-Content "$backupPath/backup-metadata.json" | ConvertFrom-Json
    Write-Host "  📅 Fecha: $($metadata.timestamp)" -ForegroundColor Cyan
    Write-Host "  🌿 Git Branch: $($metadata.gitBranch)" -ForegroundColor Cyan
    Write-Host "  🔗 Git Commit: $($metadata.gitCommit.Substring(0,8))" -ForegroundColor Cyan
    Write-Host "  📦 Node: $($metadata.nodeVersion)" -ForegroundColor Cyan
}

# 5. Resultado final
if ($missingFiles.Count -eq 0) {
    Write-Host "🎉 BACKUP VÁLIDO - Listo para restaurar" -ForegroundColor Green
    Write-Host "💡 Para restaurar: .\backups\$BackupName\restore.ps1" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "❌ BACKUP INVÁLIDO - Archivos faltantes:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "  ❌ $file" -ForegroundColor Red
    }
    Write-Host "⚠️  NO RESTAURAR ESTE BACKUP" -ForegroundColor Red
    exit 1
} 