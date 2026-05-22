# ============================================================================
# SYNC FROM KIT - V1.0.0
# ============================================================================
# Sincroniza archivos del kit central a un proyecto existente
# Actualiza reglas y scripts sin sobrescribir configuración del proyecto
# ============================================================================

param(
    [string]$KitPath = "C:\IA Marcelo Labs\_vibethink-dev-kit",
    [switch]$DryRun = $false,
    [switch]$Force = $false,
    [switch]$Verbose = $false
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         🔄 SYNC FROM KIT - Update from central kit        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# PASO 1: Verificar que el kit existe
# ============================================================================

if (-not (Test-Path $KitPath)) {
    Write-Host "❌ ERROR: Kit no encontrado en: $KitPath" -ForegroundColor Red
    Write-Host "   Usa el parámetro -KitPath para especificar otra ubicación" -ForegroundColor Gray
    exit 1
}

Write-Host "📦 Kit encontrado en: $KitPath" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PASO 2: Definir archivos a sincronizar
# ============================================================================

# Archivos que SIEMPRE se sincronizan (reglas universales)
$alwaysSync = @(
    @{ Source = "packages\core\rules\conflicts.json"; Dest = "rules\conflicts.json" },
    @{ Source = "packages\scripts\vibe-doctor.ps1"; Dest = "scripts\vibe-doctor.ps1" },
    @{ Source = "packages\scripts\hooks\pre-install.ps1"; Dest = "scripts\hooks\pre-install.ps1" },
    @{ Source = ".vibethink\STACK_COMPATIBILITY.md"; Dest = "STACK_COMPATIBILITY.md" },
    @{ Source = ".vibethink\DOCS_ROUTING.md"; Dest = "DOCS_ROUTING.md" }
)

# Archivos OPCIONALES (solo si el usuario confirma)
$optionalSync = @(
    @{ Source = "packages\scripts\setup-project.ps1"; Dest = "scripts\setup-project.ps1" },
    @{ Source = ".vibethink\tools\harvest-knowledge.ps1"; Dest = "tools\harvest-knowledge.ps1" },
    @{ Source = ".vibethink\docs\TOOLS_AND_STACK.md"; Dest = "docs\TOOLS_AND_STACK.md" },
    @{ Source = ".vibethink\KNOWLEDGE_INHERITANCE.md"; Dest = "KNOWLEDGE_INHERITANCE.md" },
    @{ Source = ".vibethink\ROADMAP.md"; Dest = "ROADMAP.md" }
)

# Archivos que NUNCA se sobrescriben (específicos del proyecto)
$neverSync = @(
    ".vibethink.config.json",
    "package.json",
    "AGENTS.md",
    ".cursorrules",
    ".env",
    "README.md",
    "LICENSE"
)

# ============================================================================
# PASO 3: Sincronizar archivos obligatorios
# ============================================================================

Write-Host "🔄 Sincronizando archivos obligatorios..." -ForegroundColor Yellow
Write-Host ""

$syncedCount = 0
$skippedCount = 0
$errorCount = 0

foreach ($item in $alwaysSync) {
    if ($item.GetType().Name -eq "String") {
        $sourceRel = $item
        $destRel = $item
    } else {
        $sourceRel = $item.Source
        $destRel = $item.Dest
    }

    $sourcePath = Join-Path $KitPath $sourceRel
    $destPath = ".\$destRel"

    if (-not (Test-Path $sourcePath)) {
        # Fallback para compatibilidad con kits antiguos (estructura plana)
        $flatSource = Join-Path $KitPath $destRel
        if (Test-Path $flatSource) {
            $sourcePath = $flatSource
        } else {
            Write-Host "   ⚠️  No encontrado en kit: $sourceRel (ni en $destRel)" -ForegroundColor Yellow
            $skippedCount++
            continue
        }
    }

    if ($DryRun) {
        Write-Host "   [DRY RUN] Sincronizaría: $destRel (desde $sourceRel)" -ForegroundColor Cyan
        $syncedCount++
    }
    else {
        try {
            # Crear directorio si no existe
            $destDir = Split-Path $destPath -Parent
            if ($destDir -and -not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }

            Copy-Item $sourcePath $destPath -Force
            Write-Host "   ✅ Sincronizado: $destRel" -ForegroundColor Green
            $syncedCount++

            if ($Verbose) {
                $sourceHash = (Get-FileHash $sourcePath).Hash.Substring(0, 8)
                Write-Host "      Hash: $sourceHash" -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "   ❌ Error al sincronizar: $destRel" -ForegroundColor Red
            Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Gray
            $errorCount++
        }
    }
}

Write-Host ""

# ============================================================================
# PASO 4: Preguntar por archivos opcionales
# ============================================================================

if (-not $DryRun -and $optionalSync.Count -gt 0) {
    Write-Host "📋 Archivos opcionales disponibles:" -ForegroundColor Yellow
    Write-Host ""

    foreach ($file in $optionalSync) {
        Write-Host "   - $file" -ForegroundColor Cyan
    }

    Write-Host ""
    $syncOptional = Read-Host "¿Sincronizar archivos opcionales? (S/N)"

    if ($syncOptional -eq "S") {
        Write-Host ""
        Write-Host "🔄 Sincronizando archivos opcionales..." -ForegroundColor Yellow
        Write-Host ""

        foreach ($item in $optionalSync) {
            if ($item.GetType().Name -eq "String") {
                $sourceRel = $item
                $destRel = $item
            } else {
                $sourceRel = $item.Source
                $destRel = $item.Dest
            }

            $sourcePath = Join-Path $KitPath $sourceRel
            $destPath = ".\$destRel"

            if (-not (Test-Path $sourcePath)) {
                # Fallback path checking
                $flatSource = Join-Path $KitPath $destRel
                if (Test-Path $flatSource) {
                    $sourcePath = $flatSource
                } else {
                    Write-Host "   ⚠️  No encontrado en kit: $sourceRel" -ForegroundColor Yellow
                    $skippedCount++
                    continue
                }
            }

            # Verificar si ya existe
            if ((Test-Path $destPath) -and -not $Force) {
                $overwrite = Read-Host "   ⚠️  $destRel ya existe. ¿Sobrescribir? (S/N)"
                if ($overwrite -ne "S") {
                    Write-Host "   ⏭️  Saltado: $destRel" -ForegroundColor Gray
                    $skippedCount++
                    continue
                }
            }

            try {
                $destDir = Split-Path $destPath -Parent
                if ($destDir -and -not (Test-Path $destDir)) {
                    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
                }

                Copy-Item $sourcePath $destPath -Force
                Write-Host "   ✅ Sincronizado: $destRel" -ForegroundColor Green
                $syncedCount++
            }
            catch {
                Write-Host "   ❌ Error al sincronizar: $destRel" -ForegroundColor Red
                $errorCount++
            }
        }
    }
}

Write-Host ""

# ============================================================================
# PASO 5: Advertencias de archivos protegidos
# ============================================================================

Write-Host "🔒 Archivos NUNCA sincronizados (específicos del proyecto):" -ForegroundColor Cyan
Write-Host ""

foreach ($file in $neverSync) {
    if (Test-Path ".\$file") {
        Write-Host "   🛡️  Protegido: $file" -ForegroundColor Gray
    }
}

Write-Host ""

# ============================================================================
# PASO 6: Verificar que todo sigue funcionando
# ============================================================================

if (-not $DryRun -and $syncedCount -gt 0) {
    Write-Host "🔍 Verificando integridad..." -ForegroundColor Yellow
    Write-Host ""

    # Verificar que vibe-doctor funciona
    if (Test-Path ".\scripts\vibe-doctor.ps1") {
        Write-Host "   Ejecutando vibe-doctor para verificar..." -ForegroundColor Gray
        $doctorResult = & ".\scripts\vibe-doctor.ps1" 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ vibe-doctor funciona correctamente" -ForegroundColor Green
        }
        else {
            Write-Host "   ⚠️  vibe-doctor reportó issues (revisa arriba)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""

# ============================================================================
# PASO 7: Resumen
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         📊 RESUMEN DE SINCRONIZACIÓN                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 Modo DRY RUN - No se aplicaron cambios" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "📊 Estadísticas:" -ForegroundColor Yellow
Write-Host "   ✅ Sincronizados: $syncedCount archivo(s)" -ForegroundColor Green
Write-Host "   ⏭️  Saltados: $skippedCount archivo(s)" -ForegroundColor Gray
Write-Host "   ❌ Errores: $errorCount archivo(s)" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Gray" })
Write-Host ""

if ($DryRun) {
    Write-Host "💡 Ejecuta sin -DryRun para aplicar cambios" -ForegroundColor Cyan
}
elseif ($syncedCount -gt 0) {
    Write-Host "✅ Sincronización completada" -ForegroundColor Green
    Write-Host "   El proyecto ahora tiene las últimas reglas del kit central" -ForegroundColor Gray
}
else {
    Write-Host "ℹ️  No se sincronizó ningún archivo" -ForegroundColor Cyan
}

Write-Host ""

# Exit code
if ($errorCount -gt 0) {
    exit 1
}
else {
    exit 0
}
