# =============================================================================
# SCRIPT DE BACKUP PRE-REORGANIZACIÓN - VTHINK 1.0
# =============================================================================

param(
    [string]$BackupPath = "backups"
)

# Configuración
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupName = "pre-reorganization-backup-$Timestamp"
$FullBackupPath = Join-Path $BackupPath $BackupName

Write-Host "🚀 Iniciando backup pre-reorganización..." -ForegroundColor Green
Write-Host "📁 Backup path: $FullBackupPath" -ForegroundColor Yellow

# Crear directorio de backup si no existe
if (!(Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath -Force
    Write-Host "✅ Creado directorio de backup: $BackupPath" -ForegroundColor Green
}

# Crear directorio específico para este backup
New-Item -ItemType Directory -Path $FullBackupPath -Force | Out-Null

# Lista de directorios y archivos críticos a respaldar
$CriticalPaths = @(
    "app",
    "src",
    "components",
    "hooks",
    "lib",
    "bundui",
    "apps",
    "docs",
    "tests",
    "scripts",
    "supabase",
    "package.json",
    "tsconfig.json",
    "next.config.js",
    "tailwind.config.ts",
    "vite.config.ts",
    "vitest.config.ts",
    "lerna.json"
)

# Función para copiar directorio con progreso
function Copy-DirectoryWithProgress {
    param(
        [string]$Source,
        [string]$Destination
    )
    
    if (Test-Path $Source) {
        Write-Host "📦 Copiando: $Source" -ForegroundColor Cyan
        try {
            Copy-Item -Path $Source -Destination $Destination -Recurse -Force
            Write-Host "✅ Copiado exitosamente: $Source" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Error copiando $Source : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    else {
        Write-Host "⚠️  No encontrado: $Source" -ForegroundColor Yellow
    }
}

# Función para copiar archivo con progreso
function Copy-FileWithProgress {
    param(
        [string]$Source,
        [string]$Destination
    )
    
    if (Test-Path $Source) {
        Write-Host "📄 Copiando: $Source" -ForegroundColor Cyan
        try {
            Copy-Item -Path $Source -Destination $Destination -Force
            Write-Host "✅ Copiado exitosamente: $Source" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Error copiando $Source : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    else {
        Write-Host "⚠️  No encontrado: $Source" -ForegroundColor Yellow
    }
}

# Crear archivo de metadata del backup
$BackupMetadata = @{
    timestamp = $Timestamp
    date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    description = "Backup pre-reorganización VThink 1.0"
    version = "1.0.0"
    criticalPaths = $CriticalPaths
}

$BackupMetadata | ConvertTo-Json -Depth 10 | Out-File -FilePath "$FullBackupPath/backup-metadata.json" -Encoding UTF8

Write-Host "🔄 Iniciando copia de archivos críticos..." -ForegroundColor Green

# Copiar directorios críticos
foreach ($path in $CriticalPaths) {
    if (Test-Path $path) {
        if ((Get-Item $path) -is [System.IO.DirectoryInfo]) {
            Copy-DirectoryWithProgress -Source $path -Destination "$FullBackupPath/$path"
        }
        else {
            Copy-FileWithProgress -Source $path -Destination "$FullBackupPath/$path"
        }
    }
}

# Copiar archivos de configuración adicionales
$ConfigFiles = @(
    ".eslintrc.js",
    ".editorconfig",
    ".cursorrules",
    "postcss.config.js",
    "eslint.config.js"
)

foreach ($file in $ConfigFiles) {
    Copy-FileWithProgress -Source $file -Destination "$FullBackupPath/$file"
}

# Crear archivo de resumen
$Summary = @"
# BACKUP PRE-REORGANIZACIÓN - VTHINK 1.0

## Información del Backup
- **Fecha**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- **Timestamp**: $Timestamp
- **Descripción**: Backup completo antes de reorganización del monorepo

## Archivos y Directorios Respaldados
$($CriticalPaths -join "`n")

## Notas Importantes
- Este backup contiene el estado completo del proyecto antes de la reorganización
- Para restaurar, copiar los archivos de vuelta a la raíz del proyecto
- Validar builds después de cualquier restauración

## Comandos de Restauración
```powershell
# Restaurar desde backup
Copy-Item -Path "backups/$BackupName/*" -Destination "." -Recurse -Force

# Validar restauración
npm install
npm run build
```
"@

$Summary | Out-File -FilePath "$FullBackupPath/BACKUP_SUMMARY.md" -Encoding UTF8

# Validación final
$BackupSize = (Get-ChildItem -Path $FullBackupPath -Recurse | Measure-Object -Property Length -Sum).Sum
$BackupSizeMB = [math]::Round($BackupSize / 1MB, 2)

Write-Host "`n🎉 BACKUP COMPLETADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "📁 Ubicación: $FullBackupPath" -ForegroundColor Yellow
Write-Host "📊 Tamaño: $BackupSizeMB MB" -ForegroundColor Yellow
Write-Host "📝 Resumen: $FullBackupPath/BACKUP_SUMMARY.md" -ForegroundColor Yellow

Write-Host "`n✅ El proyecto está listo para reorganización" -ForegroundColor Green
Write-Host "🔄 Puedes proceder con confianza - backup completo creado" -ForegroundColor Cyan 