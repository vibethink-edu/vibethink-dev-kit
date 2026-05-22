# Quick Backup Script - Para uso diario
# Backup rápido sin verificación exhaustiva

param(
    [string]$BackupName = "quick-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
)

Write-Host "⚡ QUICK BACKUP: $BackupName" -ForegroundColor Green

# Crear directorio
$backupPath = "backups/$BackupName"
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

# Archivos esenciales
$essentialFiles = @(
    "package.json",
    "package-lock.json",
    "vite.config.ts", 
    "tailwind.config.ts",
    "tsconfig.json",
    "src/",
    "public/"
)

# Copiar rápidamente
foreach ($file in $essentialFiles) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination "$backupPath/" -Recurse -Force
    }
}

# Crear metadatos básicos
$metadata = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    type = "quick-backup"
    backupName = $BackupName
}

$metadata | ConvertTo-Json | Out-File "$backupPath/quick-metadata.json"

Write-Host "✅ Quick backup completado: $backupPath" -ForegroundColor Green 