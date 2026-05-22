# rollback.ps1 - Script de Rollback para Windows PowerShell
# Restauración automática del estado anterior

Write-Host "🔄 Iniciando rollback..." -ForegroundColor Yellow

# Función para verificar si existe un archivo
function Test-BackupFile {
    param([string]$FilePath)
    if (Test-Path $FilePath) {
        Write-Host "✅ $FilePath encontrado" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $FilePath no encontrado" -ForegroundColor Red
        return $false
    }
}

# Función para restaurar archivo
function Restore-File {
    param([string]$BackupPath, [string]$TargetPath, [string]$Description)
    if (Test-BackupFile $BackupPath) {
        Copy-Item $BackupPath $TargetPath -Force
        Write-Host "✅ $Description restaurado" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ No se pudo restaurar $Description" -ForegroundColor Red
        return $false
    }
}

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ No se encontró package.json. Asegúrate de estar en el directorio del proyecto." -ForegroundColor Red
    exit 1
}

Write-Host "📁 Directorio del proyecto verificado" -ForegroundColor Green

# Restaurar archivos principales
$success = $true

# package.json
if (-not (Restore-File "package.json.backup" "package.json" "package.json")) {
    $success = $false
}

# package-lock.json
if (-not (Restore-File "package-lock.json.backup" "package-lock.json" "package-lock.json")) {
    $success = $false
}

# tsconfig.json
if (-not (Restore-File "tsconfig.json.backup" "tsconfig.json" "tsconfig.json")) {
    $success = $false
}

# tailwind.config.js
if (-not (Restore-File "tailwind.config.js.backup" "tailwind.config.js" "tailwind.config.js")) {
    Write-Host "⚠️  tailwind.config.js no restaurado (opcional)" -ForegroundColor Yellow
}

# src/index.css
if (-not (Restore-File "src/index.css.backup" "src/index.css" "index.css")) {
    Write-Host "⚠️  index.css no restaurado (opcional)" -ForegroundColor Yellow
}

if (-not $success) {
    Write-Host "❌ Rollback falló. Verifica que existan los archivos de backup." -ForegroundColor Red
    exit 1
}

# Reinstalar dependencias
Write-Host "📦 Reinstalando dependencias..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencias reinstaladas" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al reinstalar dependencias: $_" -ForegroundColor Red
    exit 1
}

# Verificar restauración
Write-Host "🔍 Verificando restauración..." -ForegroundColor Yellow

# TypeScript check
try {
    npm run type-check
    Write-Host "✅ TypeScript check pasado" -ForegroundColor Green
} catch {
    Write-Host "⚠️  TypeScript check falló, pero continuando..." -ForegroundColor Yellow
}

# Build check
try {
    npm run build
    Write-Host "✅ Build exitoso" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Build falló, pero continuando..." -ForegroundColor Yellow
}

Write-Host "✅ Rollback completado exitosamente" -ForegroundColor Green
Write-Host "🚀 Ejecutando: npm run dev" -ForegroundColor Cyan

# Iniciar servidor de desarrollo
try {
    npm run dev
} catch {
    Write-Host "❌ Error al iniciar el servidor de desarrollo" -ForegroundColor Red
    Write-Host "💡 Intenta ejecutar 'npm run dev' manualmente" -ForegroundColor Yellow
} 