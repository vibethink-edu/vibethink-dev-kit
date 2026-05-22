# Backup simple pre-reorganización VThink 1.0

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupName = "pre-reorganization-backup-$Timestamp"
$BackupPath = "backups/$BackupName"

Write-Host "🚀 Iniciando backup pre-reorganización..." -ForegroundColor Green

# Crear directorio de backup
if (!(Test-Path "backups")) {
    New-Item -ItemType Directory -Path "backups" -Force
}

New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null

# Lista de directorios críticos
$CriticalDirs = @("app", "src", "components", "hooks", "lib", "bundui", "apps", "docs", "tests", "scripts", "supabase")

# Copiar directorios críticos
foreach ($dir in $CriticalDirs) {
    if (Test-Path $dir) {
        Write-Host "📦 Copiando: $dir" -ForegroundColor Cyan
        Copy-Item -Path $dir -Destination "$BackupPath/$dir" -Recurse -Force
        Write-Host "✅ Copiado: $dir" -ForegroundColor Green
    }
}

# Copiar archivos de configuración
$ConfigFiles = @("package.json", "tsconfig.json", "next.config.js", "tailwind.config.ts", "vite.config.ts", "vitest.config.ts", "lerna.json", ".eslintrc.js", ".editorconfig", ".cursorrules")

foreach ($file in $ConfigFiles) {
    if (Test-Path $file) {
        Write-Host "📄 Copiando: $file" -ForegroundColor Cyan
        Copy-Item -Path $file -Destination "$BackupPath/$file" -Force
        Write-Host "✅ Copiado: $file" -ForegroundColor Green
    }
}

# Crear metadata
$Metadata = @{
    timestamp = $Timestamp
    date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    description = "Backup pre-reorganización VThink 1.0"
}

$Metadata | ConvertTo-Json | Out-File -FilePath "$BackupPath/backup-metadata.json" -Encoding UTF8

Write-Host "`n🎉 BACKUP COMPLETADO" -ForegroundColor Green
Write-Host "📁 Ubicación: $BackupPath" -ForegroundColor Yellow
Write-Host "✅ Listo para reorganización" -ForegroundColor Green 