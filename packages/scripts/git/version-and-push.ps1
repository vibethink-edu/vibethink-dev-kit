# ============================================================================
# VERSION AND PUSH - V1.0.0
# ============================================================================
# Script para versionar, documentar y pushear en un solo comando
# Uso: .\scripts\version-and-push.ps1
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('major', 'minor', 'patch', 'skip')]
    [string]$VersionType,
    
    [Parameter(Mandatory=$false)]
    [string]$Description
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         VERSION AND PUSH - V1.0.0                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "types.ts")) {
    Write-Host "❌ Error: No se encuentra types.ts" -ForegroundColor Red
    Write-Host "   Ejecuta este script desde la raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

# Verificar estado de git
Write-Host "📊 Verificando estado de git..." -ForegroundColor Cyan
$gitStatus = git status --porcelain
if (-not $gitStatus) {
    Write-Host "✅ No hay cambios para commitear" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Tip: Haz cambios primero antes de versionar" -ForegroundColor Gray
    exit 0
}

Write-Host "✅ Cambios detectados:" -ForegroundColor Green
git status --short
Write-Host ""

# Leer versión actual
$currentVersion = (Get-Content types.ts | Select-String "APP_VERSION_NUMBER = '(.+)'").Matches.Groups[1].Value
Write-Host "📌 Versión actual: $currentVersion" -ForegroundColor Cyan
Write-Host ""

# Preguntar tipo de versión si no se especificó
if (-not $VersionType) {
    Write-Host "🎯 ¿Qué tipo de cambio es?" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   1. MAJOR (X.0.0) - Cambios incompatibles, nueva arquitectura" -ForegroundColor White
    Write-Host "   2. MINOR (x.X.0) - Nuevas features, cambios compatibles" -ForegroundColor White
    Write-Host "   3. PATCH (x.x.X) - Bug fixes, mejoras menores, docs" -ForegroundColor White
    Write-Host "   4. SKIP        - No versionar, solo commit y push" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Selecciona (1-4): " -ForegroundColor Yellow -NoNewline
    
    $choice = Read-Host
    
    switch ($choice) {
        "1" { $VersionType = "major" }
        "2" { $VersionType = "minor" }
        "3" { $VersionType = "patch" }
        "4" { $VersionType = "skip" }
        default {
            Write-Host "❌ Opción inválida" -ForegroundColor Red
            exit 1
        }
    }
}

# Calcular nueva versión
if ($VersionType -ne "skip") {
    $versionParts = $currentVersion.Split('.')
    $major = [int]$versionParts[0]
    $minor = [int]$versionParts[1]
    $patch = [int]$versionParts[2]
    
    switch ($VersionType) {
        "major" {
            $major++
            $minor = 0
            $patch = 0
        }
        "minor" {
            $minor++
            $patch = 0
        }
        "patch" {
            $patch++
        }
    }
    
    $newVersion = "$major.$minor.$patch"
    Write-Host ""
    Write-Host "📈 Nueva versión: $currentVersion → $newVersion" -ForegroundColor Green
    Write-Host ""
}

# Preguntar descripción si no se especificó
if (-not $Description) {
    Write-Host "📝 Descripción del cambio (3-5 palabras):" -ForegroundColor Yellow
    Write-Host "   Ejemplo: 'Documentation Consolidation Complete'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Descripción: " -ForegroundColor Yellow -NoNewline
    $Description = Read-Host
    
    if (-not $Description) {
        Write-Host "❌ Descripción requerida" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Actualizar types.ts si versionamos
if ($VersionType -ne "skip") {
    Write-Host ""
    Write-Host "📝 Actualizando types.ts..." -ForegroundColor Cyan
    
    $typesContent = Get-Content types.ts -Raw
    $typesContent = $typesContent -replace "APP_VERSION_NUMBER = '[^']+';", "APP_VERSION_NUMBER = '$newVersion';"
    $typesContent = $typesContent -replace "APP_VERSION_DESCRIPTOR = '[^']+';", "APP_VERSION_DESCRIPTOR = '$Description';"
    Set-Content types.ts -Value $typesContent -NoNewline
    
    Write-Host "   ✅ types.ts actualizado" -ForegroundColor Green
    
    # Actualizar CHANGELOG.md
    Write-Host ""
    Write-Host "📝 Actualizando CHANGELOG.md..." -ForegroundColor Cyan
    
    $date = Get-Date -Format "yyyy-MM-dd"
    $changelogEntry = @"
## [$newVersion] - $date

### Changed
- $Description

"@
    
    $changelogContent = Get-Content CHANGELOG.md -Raw
    # Insertar después de la primera línea de "## ["
    $changelogContent = $changelogContent -replace "(# Changelog\s+.*?\s+)", "`$1`n$changelogEntry"
    Set-Content CHANGELOG.md -Value $changelogContent -NoNewline
    
    Write-Host "   ✅ CHANGELOG.md actualizado" -ForegroundColor Green
}

# Commit
Write-Host ""
Write-Host "📦 Creando commit..." -ForegroundColor Cyan

if ($VersionType -ne "skip") {
    $commitMessage = "chore: v$newVersion - $Description"
} else {
    $commitMessage = "docs: $Description"
}

git add -A
git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Commit creado: $commitMessage" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error al crear commit" -ForegroundColor Red
    exit 1
}

# Push
Write-Host ""
Write-Host "🚀 Pusheando a GitHub..." -ForegroundColor Cyan

git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Pusheado a GitHub" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error al pushear" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✅ TODO COMPLETADO                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

if ($VersionType -ne "skip") {
    Write-Host "📌 Versión: $currentVersion → $newVersion" -ForegroundColor Cyan
}
Write-Host "📝 Descripción: $Description" -ForegroundColor Cyan
Write-Host "💾 Commit: $commitMessage" -ForegroundColor Cyan
Write-Host "🌐 GitHub: Actualizado" -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "💡 Tip: Usa .\scripts\version-and-push.ps1 -VersionType patch -Description 'Fix bug'" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""















