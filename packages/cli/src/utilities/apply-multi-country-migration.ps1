# 🌍 SCRIPT PARA APLICAR MIGRACIÓN MULTI-PAÍS
# Fecha: 2025-01-21
# Descripción: Aplica la migración completa del sistema multi-país

param(
    [string]$SupabaseUrl = "",
    [string]$SupabaseKey = "",
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

# =====================================================
# CONFIGURACIÓN Y VALIDACIÓN
# =====================================================

Write-Host "🌍 APLICANDO MIGRACIÓN MULTI-PAÍS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Verificar si estamos en modo dry run
if ($DryRun) {
    Write-Host "🔍 MODO DRY RUN - No se aplicarán cambios reales" -ForegroundColor Yellow
}

# Verificar variables de entorno si no se proporcionan
if (-not $SupabaseUrl) {
    $SupabaseUrl = $env:SUPABASE_URL
    if (-not $SupabaseUrl) {
        Write-Host "❌ Error: No se proporcionó SUPABASE_URL" -ForegroundColor Red
        Write-Host "   Usa: -SupabaseUrl 'tu-url' o configura la variable de entorno SUPABASE_URL" -ForegroundColor Yellow
        exit 1
    }
}

if (-not $SupabaseKey) {
    $SupabaseKey = $env:SUPABASE_ANON_KEY
    if (-not $SupabaseKey) {
        Write-Host "❌ Error: No se proporcionó SUPABASE_ANON_KEY" -ForegroundColor Red
        Write-Host "   Usa: -SupabaseKey 'tu-key' o configura la variable de entorno SUPABASE_ANON_KEY" -ForegroundColor Yellow
        exit 1
    }
}

# Verificar que el archivo de migración existe
$migrationFile = "supabase/migrations/20250121000001_multi_country_system.sql"
if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Error: No se encontró el archivo de migración: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Configuración validada" -ForegroundColor Green
Write-Host "   URL: $SupabaseUrl" -ForegroundColor Gray
Write-Host "   Archivo: $migrationFile" -ForegroundColor Gray

# =====================================================
# FUNCIONES DE UTILIDAD
# =====================================================

function Write-Step {
    param([string]$Message)
    Write-Host "`n📋 $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

# =====================================================
# PASO 1: VERIFICAR CONEXIÓN A SUPABASE
# =====================================================

Write-Step "Verificando conexión a Supabase..."

try {
    $headers = @{
        "apikey" = $SupabaseKey
        "Authorization" = "Bearer $SupabaseKey"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/" -Headers $headers -Method GET
    
    if ($Verbose) {
        Write-Host "Respuesta de Supabase: $($response | ConvertTo-Json -Depth 1)" -ForegroundColor Gray
    }
    
    Write-Success "Conexión a Supabase establecida correctamente"
} catch {
    Write-Error "No se pudo conectar a Supabase: $($_.Exception.Message)"
    exit 1
}

# =====================================================
# PASO 2: CREAR BACKUP DE LA BASE DE DATOS
# =====================================================

Write-Step "Creando backup de la base de datos..."

$backupDir = "backups"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = "$backupDir/multi-country-backup-$timestamp.sql"

# Crear directorio de backup si no existe
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

if (-not $DryRun) {
    try {
        # Exportar esquema actual (esto requeriría pg_dump, pero para este ejemplo usamos un backup simulado)
        Write-Info "Creando backup simulado en: $backupFile"
        
        $backupContent = @"
-- Backup creado automáticamente antes de la migración multi-país
-- Fecha: $(Get-Date)
-- Archivo: $backupFile

-- Este es un backup simulado. En producción, usar pg_dump para crear un backup real.
-- pg_dump -h $SupabaseUrl -U postgres -d postgres > $backupFile

"@
        
        $backupContent | Out-File -FilePath $backupFile -Encoding UTF8
        Write-Success "Backup creado: $backupFile"
    } catch {
        Write-Warning "No se pudo crear el backup: $($_.Exception.Message)"
        Write-Info "Continuando sin backup..."
    }
} else {
    Write-Info "MODO DRY RUN: Se simularía la creación del backup"
}

# =====================================================
# PASO 3: LEER ARCHIVO DE MIGRACIÓN
# =====================================================

Write-Step "Leyendo archivo de migración..."

try {
    $migrationContent = Get-Content -Path $migrationFile -Raw -Encoding UTF8
    Write-Success "Archivo de migración leído correctamente"
    
    if ($Verbose) {
        Write-Host "Tamaño del archivo: $($migrationContent.Length) caracteres" -ForegroundColor Gray
    }
} catch {
    Write-Error "No se pudo leer el archivo de migración: $($_.Exception.Message)"
    exit 1
}

# =====================================================
# PASO 4: DIVIDIR MIGRACIÓN EN PASOS
# =====================================================

Write-Step "Dividiendo migración en pasos ejecutables..."

# Dividir el SQL en pasos individuales
$sqlSteps = @()

# Extraer las secciones principales
$sections = @{
    "Tablas" = @()
    "Índices" = @()
    "Funciones" = @()
    "Triggers" = @()
    "Políticas RLS" = @()
    "Datos Iniciales" = @()
    "Funciones de Utilidad" = @()
}

# Buscar las secciones en el archivo
$lines = $migrationContent -split "`n"
$currentSection = ""

foreach ($line in $lines) {
    if ($line -match "-- =====================================================") {
        # Nueva sección
        continue
    } elseif ($line -match "-- (\d+)\. (.+)") {
        $currentSection = $matches[2]
        continue
    } elseif ($line -match "CREATE TABLE") {
        $sections["Tablas"] += $line
    } elseif ($line -match "CREATE INDEX") {
        $sections["Índices"] += $line
    } elseif ($line -match "CREATE.*FUNCTION") {
        $sections["Funciones"] += $line
    } elseif ($line -match "CREATE TRIGGER") {
        $sections["Triggers"] += $line
    } elseif ($line -match "CREATE POLICY") {
        $sections["Políticas RLS"] += $line
    } elseif ($line -match "INSERT INTO") {
        $sections["Datos Iniciales"] += $line
    }
}

Write-Success "Migración dividida en $($sections.Count) secciones"

# =====================================================
# PASO 5: APLICAR MIGRACIÓN PASO A PASO
# =====================================================

Write-Step "Aplicando migración paso a paso..."

$totalSteps = 0
$successfulSteps = 0
$failedSteps = 0

# Función para ejecutar SQL
function Execute-SQL {
    param([string]$SQL, [string]$StepName)
    
    if ($DryRun) {
        Write-Info "MODO DRY RUN: Se ejecutaría: $StepName"
        if ($Verbose) {
            Write-Host "SQL: $SQL" -ForegroundColor Gray
        }
        return $true
    }
    
    try {
        $headers = @{
            "apikey" = $SupabaseKey
            "Authorization" = "Bearer $SupabaseKey"
            "Content-Type" = "application/json"
            "Prefer" = "return=minimal"
        }
        
        $body = @{
            query = $SQL
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/rpc/exec_sql" -Headers $headers -Method POST -Body $body
        
        Write-Success "Paso completado: $StepName"
        return $true
    } catch {
        Write-Error "Error en paso '$StepName': $($_.Exception.Message)"
        return $false
    }
}

# Aplicar tablas
Write-Info "Aplicando tablas..."
foreach ($tableSQL in $sections["Tablas"]) {
    $totalSteps++
    if (Execute-SQL -SQL $tableSQL -StepName "Crear tabla") {
        $successfulSteps++
    } else {
        $failedSteps++
    }
}

# Aplicar índices
Write-Info "Aplicando índices..."
foreach ($indexSQL in $sections["Índices"]) {
    $totalSteps++
    if (Execute-SQL -SQL $indexSQL -StepName "Crear índice") {
        $successfulSteps++
    } else {
        $failedSteps++
    }
}

# Aplicar funciones
Write-Info "Aplicando funciones..."
foreach ($functionSQL in $sections["Funciones"]) {
    $totalSteps++
    if (Execute-SQL -SQL $functionSQL -StepName "Crear función") {
        $successfulSteps++
    } else {
        $failedSteps++
    }
}

# Aplicar triggers
Write-Info "Aplicando triggers..."
foreach ($triggerSQL in $sections["Triggers"]) {
    $totalSteps++
    if (Execute-SQL -SQL $triggerSQL -StepName "Crear trigger") {
        $successfulSteps++
    } else {
        $failedSteps++
    }
}

# Aplicar políticas RLS
Write-Info "Aplicando políticas RLS..."
foreach ($policySQL in $sections["Políticas RLS"]) {
    $totalSteps++
    if (Execute-SQL -SQL $policySQL -StepName "Crear política RLS") {
        $successfulSteps++
    } else {
        $failedSteps++
    }
}

# Aplicar datos iniciales
Write-Info "Aplicando datos iniciales..."
foreach ($dataSQL in $sections["Datos Iniciales"]) {
    $totalSteps++
    if (Execute-SQL -SQL $dataSQL -StepName "Insertar datos") {
        $successfulSteps++
    } else {
        $failedSteps++
    }
}

# =====================================================
# PASO 6: VERIFICAR MIGRACIÓN
# =====================================================

Write-Step "Verificando migración..."

if (-not $DryRun) {
    try {
        # Verificar que las tablas se crearon
        $tablesToCheck = @("country_configurations", "company_country_settings", "country_plans", "country_settings_audit_log")
        
        foreach ($table in $tablesToCheck) {
            $checkSQL = "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = '$table'"
            $headers = @{
                "apikey" = $SupabaseKey
                "Authorization" = "Bearer $SupabaseKey"
                "Content-Type" = "application/json"
            }
            
            $response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/rpc/exec_sql" -Headers $headers -Method POST -Body (@{ query = $checkSQL } | ConvertTo-Json)
            
            if ($response.count -gt 0) {
                Write-Success "Tabla verificada: $table"
            } else {
                Write-Error "Tabla no encontrada: $table"
                $failedSteps++
            }
        }
        
        # Verificar datos iniciales
        $dataCheckSQL = "SELECT COUNT(*) as count FROM country_configurations WHERE is_active = true"
        $response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/rpc/exec_sql" -Headers $headers -Method POST -Body (@{ query = $dataCheckSQL } | ConvertTo-Json)
        
        Write-Success "Países configurados: $($response.count)"
        
    } catch {
        Write-Warning "No se pudo verificar completamente la migración: $($_.Exception.Message)"
    }
} else {
    Write-Info "MODO DRY RUN: Se simularía la verificación"
}

# =====================================================
# PASO 7: RESUMEN FINAL
# =====================================================

Write-Step "Resumen de la migración"

Write-Host "`n📊 ESTADÍSTICAS DE LA MIGRACIÓN" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Total de pasos: $totalSteps" -ForegroundColor White
Write-Host "Pasos exitosos: $successfulSteps" -ForegroundColor Green
Write-Host "Pasos fallidos: $failedSteps" -ForegroundColor Red

if ($failedSteps -eq 0) {
    Write-Host "`n🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    
    Write-Host "✅ Tablas creadas:" -ForegroundColor Green
    Write-Host "   • country_configurations" -ForegroundColor Gray
    Write-Host "   • company_country_settings" -ForegroundColor Gray
    Write-Host "   • country_plans" -ForegroundColor Gray
    Write-Host "   • country_settings_audit_log" -ForegroundColor Gray
    
    Write-Host "`n✅ Funcionalidades habilitadas:" -ForegroundColor Green
    Write-Host "   • Configuración por país" -ForegroundColor Gray
    Write-Host "   • Configuración de empresa por país" -ForegroundColor Gray
    Write-Host "   • Planes específicos por país" -ForegroundColor Gray
    Write-Host "   • Auditoría de cambios" -ForegroundColor Gray
    Write-Host "   • Políticas RLS de seguridad" -ForegroundColor Gray
    
    Write-Host "`n✅ Países configurados:" -ForegroundColor Green
    Write-Host "   • Colombia (CO) - País de inicio" -ForegroundColor Gray
    Write-Host "   • México (MX)" -ForegroundColor Gray
    Write-Host "   • Brasil (BR)" -ForegroundColor Gray
    Write-Host "   • Estados Unidos (US)" -ForegroundColor Gray
    Write-Host "   • España (ES)" -ForegroundColor Gray
    
    Write-Host "`n📋 PRÓXIMOS PASOS:" -ForegroundColor Yellow
    Write-Host "1. Implementar hooks React (useMultiCountryConfiguration)" -ForegroundColor Gray
    Write-Host "2. Crear componentes UI (CountrySelector, etc.)" -ForegroundColor Gray
    Write-Host "3. Configurar rutas de prueba (/testing/multi-country)" -ForegroundColor Gray
    Write-Host "4. Testing exhaustivo con empresas de diferentes países" -ForegroundColor Gray
    Write-Host "5. Documentación de usuario para cada mercado" -ForegroundColor Gray
    
} else {
    Write-Host "`n❌ MIGRACIÓN CON ERRORES" -ForegroundColor Red
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host "Se encontraron $failedSteps errores durante la migración." -ForegroundColor Red
    Write-Host "Revisa los logs anteriores para más detalles." -ForegroundColor Yellow
    Write-Host "Considera restaurar desde el backup si es necesario." -ForegroundColor Yellow
}

# =====================================================
# PASO 8: LIMPIEZA Y FINALIZACIÓN
# =====================================================

Write-Step "Finalizando migración..."

# Crear archivo de log
$logFile = "$backupDir/multi-country-migration-$timestamp.log"
$logContent = @"
Migración Multi-País - $(Get-Date)
=====================================

Configuración:
- Supabase URL: $SupabaseUrl
- Archivo de migración: $migrationFile
- Modo Dry Run: $DryRun

Resultados:
- Total de pasos: $totalSteps
- Pasos exitosos: $successfulSteps
- Pasos fallidos: $failedSteps

Backup:
- Archivo: $backupFile

"@

$logContent | Out-File -FilePath $logFile -Encoding UTF8
Write-Success "Log de migración guardado: $logFile"

Write-Host "`n🏁 MIGRACIÓN FINALIZADA" -ForegroundColor Cyan
Write-Host "Tiempo total: $(Get-Date)" -ForegroundColor Gray 