# Backup Bombaproof Script for AI Pair Orchestrator
# Este script crea un backup completo y verificable del proyecto

param(
    [string]$BackupName = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')",
    [switch]$Verify = $false
)

Write-Host "INICIANDO BACKUP BOMBAPROOF: $BackupName" -ForegroundColor Green

# 1. Verificar estado de Git
Write-Host "Verificando estado de Git..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "Hay cambios sin commitear. Creando commit automático..." -ForegroundColor Yellow
    git add .
    git commit -m "AUTO-BACKUP: $BackupName - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

# 2. Crear directorio de backup
$backupPath = "backups/$BackupName"
Write-Host "Creando directorio: $backupPath" -ForegroundColor Yellow
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

# 3. Archivos CRÍTICOS a respaldar
$criticalFiles = @(
    "package.json",
    "package-lock.json",
    "vite.config.ts",
    "tailwind.config.ts",
    "tsconfig.json",
    "index.html",
    ".env*",
    "src/",
    "public/",
    "supabase/",
    "docs/",
    "scripts/",
    "tests/"
)

# 4. Copiar archivos críticos
Write-Host "Copiando archivos críticos..." -ForegroundColor Yellow
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "  Copiando: $file" -ForegroundColor Green
        Copy-Item -Path $file -Destination "$backupPath/" -Recurse -Force
    } else {
        Write-Host "  No encontrado: $file" -ForegroundColor Yellow
    }
}

# 5. Crear archivo de metadatos del backup
$metadata = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    gitCommit = git rev-parse HEAD
    gitBranch = git branch --show-current
    nodeVersion = node --version
    npmVersion = npm --version
    criticalFiles = $criticalFiles
    backupName = $BackupName
}

$metadata | ConvertTo-Json -Depth 10 | Out-File "$backupPath/backup-metadata.json"

# 6. Crear script de restauración
$restoreScript = @"
# Script de Restauración para: $BackupName
# Generado automáticamente el $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

Write-Host "RESTAURANDO BACKUP: $BackupName" -ForegroundColor Green

# 1. Verificar que el backup existe
if (-not (Test-Path "backups/$BackupName")) {
    Write-Host "Backup no encontrado: $BackupName" -ForegroundColor Red
    exit 1
}

# 2. Crear backup del estado actual antes de restaurar
`$currentBackup = "backup-before-restore-`$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "Creando backup del estado actual: `$currentBackup" -ForegroundColor Yellow
& "`$PSScriptRoot/backup-bombaproof.ps1" -BackupName `$currentBackup

# 3. Restaurar archivos
Write-Host "Restaurando archivos..." -ForegroundColor Yellow
Copy-Item -Path "backups/$BackupName/*" -Destination "./" -Recurse -Force

# 4. Reinstalar dependencias
Write-Host "Reinstalando dependencias..." -ForegroundColor Yellow
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
npm install

# 5. Verificar restauración
Write-Host "Verificando restauración..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "package.json restaurado" -ForegroundColor Green
}
if (Test-Path "src/App.tsx") {
    Write-Host "Código fuente restaurado" -ForegroundColor Green
}

Write-Host "RESTAURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "Para verificar: npm run dev" -ForegroundColor Cyan
"@

$restoreScript | Out-File "$backupPath/restore.ps1"

# 7. Verificar integridad del backup
Write-Host "Verificando integridad del backup..." -ForegroundColor Yellow
$verificationFiles = @("package.json", "src/App.tsx", "vite.config.ts")
$allGood = $true

foreach ($file in $verificationFiles) {
    if (Test-Path "$backupPath/$file") {
        Write-Host "  $file" -ForegroundColor Green
    } else {
        Write-Host "  $file" -ForegroundColor Red
        $allGood = $false
    }
}

# 8. Crear checksum para verificación
Write-Host "Generando checksum..." -ForegroundColor Yellow
$checksum = Get-FileHash -Path "$backupPath/backup-metadata.json" -Algorithm SHA256
$checksum.Hash | Out-File "$backupPath/checksum.txt"

# 9. Resultado final
if ($allGood) {
    Write-Host "BACKUP COMPLETADO EXITOSAMENTE" -ForegroundColor Green
    Write-Host "Ubicación: $backupPath" -ForegroundColor Cyan
    Write-Host "Archivos incluidos:" -ForegroundColor Cyan
    Get-ChildItem -Path $backupPath -Recurse | ForEach-Object {
        Write-Host "  $($_.FullName.Replace($backupPath, ''))" -ForegroundColor Gray
    }
    Write-Host "Para restaurar: .\backups\$BackupName\restore.ps1" -ForegroundColor Cyan
} else {
    Write-Host "BACKUP FALLÓ - Revisar errores arriba" -ForegroundColor Red
    exit 1
}

# 10. Limpiar backups antiguos (mantener solo los últimos 5)
Write-Host "Limpiando backups antiguos..." -ForegroundColor Yellow
$backups = Get-ChildItem -Path "backups" -Directory | Sort-Object LastWriteTime -Descending
if ($backups.Count -gt 5) {
    $oldBackups = $backups | Select-Object -Skip 5
    foreach ($oldBackup in $oldBackups) {
        Write-Host "  Eliminando: $($oldBackup.Name)" -ForegroundColor Yellow
        Remove-Item -Path $oldBackup.FullName -Recurse -Force
    }
} 