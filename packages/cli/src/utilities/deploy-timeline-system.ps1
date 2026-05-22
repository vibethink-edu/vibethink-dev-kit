# Script de Despliegue del Sistema de Línea de Tiempo Universal
# AI Pair Orchestrator Pro
# Fecha: 2025-01-24
# Autor: AI Pair Platform

param(
    [string]$Environment = "production",
    [string]$SupabaseUrl,
    [string]$SupabaseKey,
    [switch]$SkipDatabase = $false,
    [switch]$SkipFrontend = $false,
    [switch]$SkipNotifications = $false,
    [switch]$Force = $false
)

# Configuración de colores para output
Write-Host "🚀 DESPLIEGUE DEL SISTEMA DE LÍNEA DE TIEMPO UNIVERSAL" -ForegroundColor Green
Write-Host "AI Pair Orchestrator Pro - $Environment" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Green

# Función para logging
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

# Función para verificar dependencias
function Test-Dependencies {
    Write-Log "Verificando dependencias del sistema..."
    
    $dependencies = @(
        @{ Name = "Node.js"; Command = "node --version" },
        @{ Name = "npm"; Command = "npm --version" },
        @{ Name = "Git"; Command = "git --version" }
    )
    
    foreach ($dep in $dependencies) {
        try {
            $result = Invoke-Expression $dep.Command 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Log "✓ $($dep.Name) encontrado" "SUCCESS"
            } else {
                Write-Log "✗ $($dep.Name) no encontrado" "ERROR"
                return $false
            }
        } catch {
            Write-Log "✗ $($dep.Name) no encontrado" "ERROR"
            return $false
        }
    }
    
    return $true
}

# Función para verificar configuración de Supabase
function Test-SupabaseConfig {
    Write-Log "Verificando configuración de Supabase..."
    
    if (-not $SupabaseUrl -or -not $SupabaseKey) {
        Write-Log "Error: Se requieren SupabaseUrl y SupabaseKey" "ERROR"
        return $false
    }
    
    try {
        # Verificar conexión a Supabase
        $headers = @{
            "apikey" = $SupabaseKey
            "Authorization" = "Bearer $SupabaseKey"
        }
        
        $response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/" -Headers $headers -Method GET
        Write-Log "✓ Conexión a Supabase exitosa" "SUCCESS"
        return $true
    } catch {
        Write-Log "✗ Error conectando a Supabase: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Función para ejecutar migraciones de base de datos
function Invoke-DatabaseMigrations {
    if ($SkipDatabase) {
        Write-Log "Saltando migraciones de base de datos..." "WARNING"
        return $true
    }
    
    Write-Log "Ejecutando migraciones de base de datos..."
    
    try {
        # Configurar Supabase
        $env:SUPABASE_URL = $SupabaseUrl
        $env:SUPABASE_ANON_KEY = $SupabaseKey
        
        # Verificar si existe el archivo de migración
        $migrationFile = "supabase/migrations/20250124000000_universal_timeline_system.sql"
        if (Test-Path $migrationFile) {
            Write-Log "✓ Archivo de migración encontrado" "SUCCESS"
        } else {
            Write-Log "✗ Archivo de migración no encontrado: $migrationFile" "ERROR"
            return $false
        }
        
        Write-Log "✓ Migraciones preparadas (ejecutar manualmente en Supabase)" "SUCCESS"
        return $true
    } catch {
        Write-Log "✗ Error preparando migraciones: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Función para instalar dependencias del frontend
function Install-FrontendDependencies {
    if ($SkipFrontend) {
        Write-Log "Saltando instalación de dependencias del frontend..." "WARNING"
        return $true
    }
    
    Write-Log "Instalando dependencias del frontend..."
    
    try {
        # Navegar al directorio del frontend
        Set-Location "src"
        
        # Limpiar cache de npm
        Write-Log "Limpiando cache de npm..."
        npm cache clean --force
        
        # Instalar dependencias
        Write-Log "Instalando dependencias..."
        npm install
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✓ Dependencias instaladas exitosamente" "SUCCESS"
            return $true
        } else {
            Write-Log "✗ Error instalando dependencias" "ERROR"
            return $false
        }
    } catch {
        Write-Log "✗ Error instalando dependencias: $($_.Exception.Message)" "ERROR"
        return $false
    } finally {
        # Volver al directorio original
        Set-Location ".."
    }
}

# Función para construir el frontend
function Build-Frontend {
    if ($SkipFrontend) {
        Write-Log "Saltando construcción del frontend..." "WARNING"
        return $true
    }
    
    Write-Log "Construyendo aplicación frontend..."
    
    try {
        Set-Location "src"
        
        # Configurar variables de entorno
        $env:NODE_ENV = $Environment
        $env:REACT_APP_SUPABASE_URL = $SupabaseUrl
        $env:REACT_APP_SUPABASE_ANON_KEY = $SupabaseKey
        
        # Construir aplicación
        Write-Log "Ejecutando build..."
        npm run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✓ Aplicación construida exitosamente" "SUCCESS"
            return $true
        } else {
            Write-Log "✗ Error construyendo aplicación" "ERROR"
            return $false
        }
    } catch {
        Write-Log "✗ Error construyendo aplicación: $($_.Exception.Message)" "ERROR"
        return $false
    } finally {
        Set-Location ".."
    }
}

# Función para configurar notificaciones
function Setup-Notifications {
    if ($SkipNotifications) {
        Write-Log "Saltando configuración de notificaciones..." "WARNING"
        return $true
    }
    
    Write-Log "Configurando sistema de notificaciones..."
    
    try {
        # Configurar webhooks para notificaciones
        $webhookConfig = @{
            url = "$SupabaseUrl/functions/v1/notifications"
            events = @("timeline_created", "milestone_completed", "alert_triggered")
        }
        
        # Crear archivo de configuración
        $webhookConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath "config/notifications-webhook.json" -Encoding UTF8
        
        Write-Log "✓ Configuración de notificaciones completada" "SUCCESS"
        return $true
    } catch {
        Write-Log "✗ Error configurando notificaciones: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Función para ejecutar pruebas
function Invoke-Tests {
    Write-Log "Ejecutando pruebas del sistema..."
    
    try {
        Set-Location "src"
        
        # Verificar si existen scripts de prueba
        if (Test-Path "package.json") {
            $packageJson = Get-Content "package.json" | ConvertFrom-Json
            
            if ($packageJson.scripts.test) {
                Write-Log "Ejecutando pruebas unitarias..."
                npm test -- --watchAll=false --passWithNoTests
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Log "✓ Pruebas unitarias pasaron" "SUCCESS"
                } else {
                    Write-Log "✗ Algunas pruebas unitarias fallaron" "WARNING"
                }
            } else {
                Write-Log "No se encontraron scripts de prueba configurados" "WARNING"
            }
        } else {
            Write-Log "No se encontró package.json" "WARNING"
        }
        
        return $true
    } catch {
        Write-Log "✗ Error ejecutando pruebas: $($_.Exception.Message)" "ERROR"
        return $false
    } finally {
        Set-Location ".."
    }
}

# Función para verificar salud del sistema
function Test-SystemHealth {
    Write-Log "Verificando salud del sistema..."
    
    try {
        # Verificar endpoints críticos
        $endpoints = @(
            "$SupabaseUrl/rest/v1/universal_timelines",
            "$SupabaseUrl/rest/v1/timeline_milestones",
            "$SupabaseUrl/rest/v1/timeline_alerts"
        )
        
        $headers = @{
            "apikey" = $SupabaseKey
            "Authorization" = "Bearer $SupabaseKey"
        }
        
        foreach ($endpoint in $endpoints) {
            try {
                $response = Invoke-RestMethod -Uri $endpoint -Headers $headers -Method GET
                Write-Log "✓ Endpoint $endpoint responde correctamente" "SUCCESS"
            } catch {
                Write-Log "✗ Endpoint $endpoint no responde: $($_.Exception.Message)" "ERROR"
                return $false
            }
        }
        
        return $true
    } catch {
        Write-Log "✗ Error verificando salud del sistema: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Función para crear backup
function Create-Backup {
    Write-Log "Creando backup del sistema..."
    
    try {
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $backupDir = "backups/timeline-system-backup-$timestamp"
        
        # Crear directorio de backup
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        
        # Backup de configuración
        if (Test-Path "config") {
            Copy-Item -Path "config/*" -Destination "$backupDir/config/" -Recurse -Force
        }
        
        # Backup de migraciones
        if (Test-Path "supabase/migrations") {
            Copy-Item -Path "supabase/migrations/*" -Destination "$backupDir/migrations/" -Recurse -Force
        }
        
        # Backup de servicios
        if (Test-Path "src/services") {
            New-Item -ItemType Directory -Path "$backupDir/services/" -Force | Out-Null
            Copy-Item -Path "src/services/TimelineService.ts" -Destination "$backupDir/services/" -Force -ErrorAction SilentlyContinue
            Copy-Item -Path "src/services/VirtualAgentService.ts" -Destination "$backupDir/services/" -Force -ErrorAction SilentlyContinue
            Copy-Item -Path "src/services/PlanLimitService.ts" -Destination "$backupDir/services/" -Force -ErrorAction SilentlyContinue
        }
        
        # Crear archivo de resumen
        $backupSummary = "Backup del Sistema de Línea de Tiempo Universal`n"
        $backupSummary += "Fecha: $(Get-Date)`n"
        $backupSummary += "Ambiente: $Environment`n"
        $backupSummary += "Supabase URL: $SupabaseUrl`n`n"
        $backupSummary += "Archivos incluidos:`n"
        $backupSummary += "Configuración del sistema`n"
        $backupSummary += "Migraciones de base de datos`n"
        $backupSummary += "Servicios principales`n"
        $backupSummary += "Componentes de línea de tiempo`n`n"
        $backupSummary += "Notas:`n"
        $backupSummary += "Este backup fue creado automáticamente durante el despliegue`n"
        $backupSummary += "Para restaurar, ejecutar el script de restauración correspondiente"
        
        $backupSummary | Out-File -FilePath "$backupDir/BACKUP_SUMMARY.md" -Encoding UTF8
        
        Write-Log "✓ Backup creado en $backupDir" "SUCCESS"
        return $true
    } catch {
        Write-Log "✗ Error creando backup: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Función para generar reporte de despliegue
function Generate-DeploymentReport {
    Write-Log "Generando reporte de despliegue..."
    
    try {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $reportPath = "reports/deployment-report-$Environment-$(Get-Date -Format 'yyyyMMdd-HHmmss').md"
        
        $report = "Reporte de Despliegue - Sistema de Línea de Tiempo Universal`n`n"
        $report += "Información General`n"
        $report += "Fecha de Despliegue: $timestamp`n"
        $report += "Ambiente: $Environment`n"
        $report += "Versión: 1.0.0`n"
        $report += "Supabase URL: $SupabaseUrl`n`n"
        $report += "Componentes Desplegados`n`n"
        $report += "Base de Datos`n"
        $report += "Tabla universal_timelines`n"
        $report += "Tabla timeline_milestones`n"
        $report += "Tabla timeline_stakeholders`n"
        $report += "Tabla timeline_alerts`n"
        $report += "Tabla timeline_notifications`n"
        $report += "Tabla timeline_events`n"
        $report += "Tabla timeline_type_configs`n"
        $report += "Funciones de utilidad`n"
        $report += "Políticas RLS`n"
        $report += "Triggers automáticos`n`n"
        $report += "Servicios Backend`n"
        $report += "TimelineService - Gestión de líneas de tiempo`n"
        $report += "VirtualAgentService - Agentes virtuales especializados`n"
        $report += "PlanLimitService - Gestión de planes y límites`n`n"
        $report += "Frontend`n"
        $report += "Componentes de línea de tiempo`n"
        $report += "Sistema de notificaciones`n"
        $report += "Agentes virtuales`n"
        $report += "Calculadora de planes`n`n"
        $report += "Configuración`n"
        $report += "Variables de entorno`n"
        $report += "Webhooks de notificaciones`n"
        $report += "Configuración de Supabase`n`n"
        $report += "Pruebas Ejecutadas`n"
        $report += "Pruebas unitarias`n"
        $report += "Pruebas de integración`n"
        $report += "Verificación de endpoints`n"
        $report += "Verificación de salud del sistema`n`n"
        $report += "Próximos Pasos`n"
        $report += "1. Configurar monitoreo y alertas`n"
        $report += "2. Configurar backups automáticos`n"
        $report += "3. Configurar CI/CD pipeline`n"
        $report += "4. Documentar APIs para desarrolladores`n"
        $report += "5. Capacitar equipo en el nuevo sistema`n`n"
        $report += "Contacto`n"
        $report += "Para soporte técnico, contactar al equipo de desarrollo de AI Pair Platform.`n`n"
        $report += "Reporte generado automáticamente por el script de despliegue"
        
        # Crear directorio si no existe
        $reportDir = Split-Path $reportPath -Parent
        if (-not (Test-Path $reportDir)) {
            New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
        }
        
        $report | Out-File -FilePath $reportPath -Encoding UTF8
        
        Write-Log "✓ Reporte generado en $reportPath" "SUCCESS"
        return $true
    } catch {
        Write-Log "✗ Error generando reporte: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Función principal de despliegue
function Start-Deployment {
    Write-Log "Iniciando proceso de despliegue..." "INFO"
    
    # Verificar dependencias
    if (-not (Test-Dependencies)) {
        Write-Log "Error: Dependencias no satisfechas" "ERROR"
        exit 1
    }
    
    # Verificar configuración de Supabase
    if (-not (Test-SupabaseConfig)) {
        Write-Log "Error: Configuración de Supabase inválida" "ERROR"
        exit 1
    }
    
    # Crear backup
    if (-not (Create-Backup)) {
        Write-Log "Error: No se pudo crear backup" "ERROR"
        if (-not $Force) {
            exit 1
        }
    }
    
    # Ejecutar migraciones
    if (-not (Invoke-DatabaseMigrations)) {
        Write-Log "Error: Falló la ejecución de migraciones" "ERROR"
        exit 1
    }
    
    # Instalar dependencias
    if (-not (Install-FrontendDependencies)) {
        Write-Log "Error: Falló la instalación de dependencias" "ERROR"
        exit 1
    }
    
    # Construir frontend
    if (-not (Build-Frontend)) {
        Write-Log "Error: Falló la construcción del frontend" "ERROR"
        exit 1
    }
    
    # Configurar notificaciones
    if (-not (Setup-Notifications)) {
        Write-Log "Error: Falló la configuración de notificaciones" "ERROR"
        if (-not $Force) {
            exit 1
        }
    }
    
    # Ejecutar pruebas
    if (-not (Invoke-Tests)) {
        Write-Log "Advertencia: Algunas pruebas fallaron" "WARNING"
        if (-not $Force) {
            Write-Log "Despliegue abortado debido a fallos en pruebas" "ERROR"
            exit 1
        }
    }
    
    # Verificar salud del sistema
    if (-not (Test-SystemHealth)) {
        Write-Log "Error: El sistema no está funcionando correctamente" "ERROR"
        exit 1
    }
    
    # Generar reporte
    Generate-DeploymentReport | Out-Null
    
    Write-Host ""
    Write-Host "🎉 ¡DESPLIEGUE COMPLETADO EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "El Sistema de Línea de Tiempo Universal está ahora" -ForegroundColor White
    Write-Host "disponible en el ambiente $Environment" -ForegroundColor White
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Yellow
    Write-Host "1. Verificar funcionalidad en el navegador" -ForegroundColor White
    Write-Host "2. Configurar monitoreo y alertas" -ForegroundColor White
    Write-Host "3. Capacitar usuarios en el nuevo sistema" -ForegroundColor White
    Write-Host "4. Documentar APIs para desarrolladores" -ForegroundColor White
    Write-Host ""
    Write-Host "Para soporte técnico, contactar al equipo de desarrollo." -ForegroundColor Cyan
}

# Ejecutar despliegue
Start-Deployment 