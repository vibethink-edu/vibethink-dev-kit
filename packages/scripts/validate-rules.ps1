# ============================================================================
# VALIDATE RULES - V1.0.0
# ============================================================================
# Valida la estructura y contenido de rules/conflicts.json
# Verifica campos requeridos, tipos de datos, y referencias válidas
# ============================================================================

param(
    [switch]$Verbose = $false
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         ✅ VALIDATE RULES - JSON Validator                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()
$rulesFile = "rules\conflicts.json"

# ============================================================================
# PASO 1: Verificar que existe el archivo
# ============================================================================

if (-not (Test-Path $rulesFile)) {
    Write-Host "❌ ERROR: $rulesFile no encontrado" -ForegroundColor Red
    Write-Host "   Crea el archivo ejecutando setup-project.ps1 o manualmente" -ForegroundColor Gray
    exit 1
}

Write-Host "📄 Validando: $rulesFile" -ForegroundColor Yellow
Write-Host ""

# ============================================================================
# PASO 2: Parsear JSON
# ============================================================================

try {
    $rulesData = Get-Content $rulesFile -Raw | ConvertFrom-Json
    Write-Host "✅ JSON válido" -ForegroundColor Green
}
catch {
    Write-Host "❌ ERROR: JSON inválido" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    exit 1
}

# ============================================================================
# PASO 3: Validar estructura raíz
# ============================================================================

Write-Host ""
Write-Host "🔍 Validando estructura..." -ForegroundColor Yellow
Write-Host ""

# Verificar campos requeridos en raíz
$requiredRootFields = @("version", "lastUpdated", "description", "rules")

foreach ($field in $requiredRootFields) {
    if (-not $rulesData.PSObject.Properties[$field]) {
        $errors += "Campo requerido faltante en raíz: $field"
    }
    else {
        if ($Verbose) {
            Write-Host "   ✅ Campo '$field' presente" -ForegroundColor Gray
        }
    }
}

# Validar version (debe ser semver)
if ($rulesData.version) {
    if ($rulesData.version -notmatch '^\d+\.\d+\.\d+$') {
        $warnings += "Version no sigue formato semver: $($rulesData.version)"
    }
}

# Validar lastUpdated (debe ser fecha YYYY-MM-DD)
if ($rulesData.lastUpdated) {
    if ($rulesData.lastUpdated -notmatch '^\d{4}-\d{2}-\d{2}$') {
        $warnings += "lastUpdated no sigue formato YYYY-MM-DD: $($rulesData.lastUpdated)"
    }
}

# ============================================================================
# PASO 4: Validar cada regla
# ============================================================================

if (-not $rulesData.rules) {
    $errors += "No hay reglas definidas"
}
elseif ($rulesData.rules.Count -eq 0) {
    $warnings += "Array de reglas está vacío"
}
else {
    Write-Host "📋 Validando $($rulesData.rules.Count) regla(s)..." -ForegroundColor Yellow
    Write-Host ""

    $ruleIds = @()

    for ($i = 0; $i -lt $rulesData.rules.Count; $i++) {
        $rule = $rulesData.rules[$i]
        $ruleIndex = $i + 1

        if ($Verbose) {
            Write-Host "   Validando regla #$ruleIndex..." -ForegroundColor Gray
        }

        # Campos requeridos en cada regla
        $requiredRuleFields = @("id", "condition", "severity", "message", "reason")

        foreach ($field in $requiredRuleFields) {
            if (-not $rule.PSObject.Properties[$field]) {
                $errors += "Regla #${ruleIndex}: Campo requerido faltante: $field"
            }
        }

        # Validar id (debe ser único y kebab-case)
        if ($rule.id) {
            if ($ruleIds -contains $rule.id) {
                $errors += "Regla #${ruleIndex}: ID duplicado: $($rule.id)"
            }
            else {
                $ruleIds += $rule.id
            }

            if ($rule.id -notmatch '^[a-z0-9-]+$') {
                $warnings += "Regla #${ruleIndex}: ID no sigue kebab-case: $($rule.id)"
            }
        }

        # Validar severity (debe ser error o warning)
        if ($rule.severity) {
            if ($rule.severity -notin @("error", "warning")) {
                $errors += "Regla #${ruleIndex}: Severity inválida: $($rule.severity) (debe ser 'error' o 'warning')"
            }
        }

        # Validar que message y reason no estén vacíos
        if ($rule.message -and $rule.message.Trim() -eq "") {
            $warnings += "Regla #${ruleIndex}: message está vacío"
        }

        if ($rule.reason -and $rule.reason.Trim() -eq "") {
            $warnings += "Regla #${ruleIndex}: reason está vacío"
        }

        # Validar estructura de fix si existe
        if ($rule.fix) {
            if (-not $rule.fix.description) {
                $errors += "Regla #${ruleIndex}: fix.description requerido si fix existe"
            }

            # Validar que command no tenga caracteres peligrosos
            if ($rule.fix.command) {
                if ($rule.fix.command -match '[;&|]') {
                    $warnings += "Regla #${ruleIndex}: fix.command contiene caracteres potencialmente peligrosos (;, &, |)"
                }
            }

            # Validar que migration apunte a archivo existente si se especifica
            if ($rule.fix.migration) {
                if (-not (Test-Path $rule.fix.migration)) {
                    $warnings += "Regla #${ruleIndex}: fix.migration apunta a archivo inexistente: $($rule.fix.migration)"
                }
            }
        }

        # Validar referencias si existen
        if ($rule.references) {
            foreach ($ref in $rule.references) {
                # Si parece ser una URL, no validar (podría ser externa)
                if ($ref -notmatch '^https?://') {
                    # Si parece ser un path local, verificar que existe
                    if ($ref -match '\.md$') {
                        if (-not (Test-Path $ref)) {
                            $warnings += "Regla #${ruleIndex}: Referencia apunta a archivo inexistente: $ref"
                        }
                    }
                }
            }
        }

        if ($Verbose -and $errors.Count -eq 0) {
            Write-Host "   ✅ Regla #$ruleIndex ($($rule.id)) válida" -ForegroundColor Green
        }
    }
}

Write-Host ""

# ============================================================================
# PASO 5: Reportar Resultados
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         📊 RESULTADOS DE VALIDACIÓN                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Errores
if ($errors.Count -gt 0) {
    Write-Host "❌ ERRORES ($($errors.Count)):" -ForegroundColor Red
    Write-Host ""

    foreach ($error in $errors) {
        Write-Host "   🔴 $error" -ForegroundColor Red
    }

    Write-Host ""
}

# Warnings
if ($warnings.Count -gt 0) {
    Write-Host "⚠️  WARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
    Write-Host ""

    foreach ($warning in $warnings) {
        Write-Host "   🟡 $warning" -ForegroundColor Yellow
    }

    Write-Host ""
}

# Resumen
if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✅ ¡VALIDACIÓN EXITOSA!" -ForegroundColor Green
    Write-Host "   Todas las reglas son válidas" -ForegroundColor Gray
    Write-Host "   Total de reglas: $($rulesData.rules.Count)" -ForegroundColor Gray
    Write-Host ""
}
else {
    Write-Host "📋 Resumen:" -ForegroundColor Cyan
    Write-Host "   Errores: $($errors.Count)" -ForegroundColor $(if ($errors.Count -gt 0) { "Red" } else { "Gray" })
    Write-Host "   Warnings: $($warnings.Count)" -ForegroundColor $(if ($warnings.Count -gt 0) { "Yellow" } else { "Gray" })
    Write-Host "   Reglas validadas: $($rulesData.rules.Count)" -ForegroundColor Cyan
    Write-Host ""
}

# Exit code
if ($errors.Count -gt 0) {
    exit 1
}
else {
    exit 0
}
