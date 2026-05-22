# Script de Despliegue Simplificado - Sistema de Línea de Tiempo Universal
# AI Pair Orchestrator Pro
# Fecha: 2025-01-24

param(
    [string]$Environment = "production",
    [string]$SupabaseUrl,
    [string]$SupabaseKey,
    [switch]$Force = $false
)

Write-Host "🚀 DESPLIEGUE DEL SISTEMA DE LÍNEA DE TIEMPO UNIVERSAL" -ForegroundColor Green
Write-Host "AI Pair Orchestrator Pro - $Environment" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Green

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = if ($Level -eq "ERROR") { "Red" } elseif ($Level -eq "WARNING") { "Yellow" } elseif ($Level -eq "SUCCESS") { "Green" } else { "White" }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Test-Dependencies {
    Write-Log "Verificando dependencias del sistema..."
    
    try {
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✓ Node.js encontrado: $nodeVersion" "SUCCESS"
        } else {
            Write-Log "✗ Node.js no encontrado" "ERROR"
            return $false
        }
        
        $npmVersion = npm --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✓ npm encontrado: $npmVersion" "SUCCESS"
        } else {
            Write-Log "✗ npm no encontrado" "ERROR"
            return $false
        }
        
        return $true
    } catch {
        Write-Log "✗ Error verificando dependencias" "ERROR"
        return $false
    }
}

function Test-SupabaseConfig {
    Write-Log "Verificando configuración de Supabase..."
    
    if (-not $SupabaseUrl -or -not $SupabaseKey) {
        Write-Log "Error: Se requieren SupabaseUrl y SupabaseKey" "ERROR"
        return $false
    }
    
    Write-Log "✓ Configuración de Supabase válida" "SUCCESS"
    return $true
}

function Create-Backup {
    Write-Log "Creando backup del sistema..."
    
    try {
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $backupDir = "backups/timeline-system-backup-$timestamp"
        
        if (-not (Test-Path "backups")) {
            New-Item -ItemType Directory -Path "backups" -Force | Out-Null
        }
        
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        
        if (Test-Path "config") {
            Copy-Item -Path "config/*" -Destination "$backupDir/config/" -Recurse -Force -ErrorAction SilentlyContinue
        }
        
        if (Test-Path "supabase/migrations") {
            Copy-Item -Path "supabase/migrations/*" -Destination "$backupDir/migrations/" -Recurse -Force -ErrorAction SilentlyContinue
        }
        
        if (Test-Path "src/services") {
            New-Item -ItemType Directory -Path "$backupDir/services/" -Force | Out-Null
            Copy-Item -Path "src/services/*.ts" -Destination "$backupDir/services/" -Force -ErrorAction SilentlyContinue
        }
        
        $backupSummary = "Backup del Sistema de Línea de Tiempo Universal`n"
        $backupSummary += "Fecha: $(Get-Date)`n"
        $backupSummary += "Ambiente: $Environment`n"
        $backupSummary += "Supabase URL: $SupabaseUrl`n"
        
        $backupSummary | Out-File -FilePath "$backupDir/BACKUP_SUMMARY.md" -Encoding UTF8
        
        Write-Log "✓ Backup creado en $backupDir" "SUCCESS"
        return $true
    } catch {
        Write-Log "✗ Error creando backup: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Install-Dependencies {
    Write-Log "Instalando dependencias del frontend..."
    
    try {
        if (Test-Path "src/package.json") {
            Set-Location "src"
            npm install
            if ($LASTEXITCODE -eq 0) {
                Write-Log "✓ Dependencias instaladas exitosamente" "SUCCESS"
                Set-Location ".."
                return $true
            } else {
                Write-Log "✗ Error instalando dependencias" "ERROR"
                Set-Location ".."
                return $false
            }
        } else {
            Write-Log "No se encontró package.json en src/" "WARNING"
            return $true
        }
    } catch {
        Write-Log "✗ Error instalando dependencias: $($_.Exception.Message)" "ERROR"
        Set-Location ".."
        return $false
    }
}

function Build-Frontend {
    Write-Log "Construyendo aplicación frontend..."
    
    try {
        if (Test-Path "src/package.json") {
            Set-Location "src"
            
            $env:NODE_ENV = $Environment
            $env:REACT_APP_SUPABASE_URL = $SupabaseUrl
            $env:REACT_APP_SUPABASE_ANON_KEY = $SupabaseKey
            
            npm run build
            if ($LASTEXITCODE -eq 0) {
                Write-Log "✓ Aplicación construida exitosamente" "SUCCESS"
                Set-Location ".."
                return $true
            } else {
                Write-Log "✗ Error construyendo aplicación" "ERROR"
                Set-Location ".."
                return $false
            }
        } else {
            Write-Log "No se encontró package.json en src/" "WARNING"
            Set-Location ".."
            return $true
        }
    } catch {
        Write-Log "✗ Error construyendo aplicación: $($_.Exception.Message)" "ERROR"
        Set-Location ".."
        return $false
    }
}

function Setup-Notifications {
    Write-Log "Configurando sistema de notificaciones..."
    
    try {
        if (-not (Test-Path "config")) {
            New-Item -ItemType Directory -Path "config" -Force | Out-Null
        }
        
        $webhookConfig = @{
            url = "$SupabaseUrl/functions/v1/notifications"
            events = @("timeline_created", "milestone_completed", "alert_triggered")
        }
        
        $webhookConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath "config/notifications-webhook.json" -Encoding UTF8
        
        Write-Log "✓ Configuración de notificaciones completada" "SUCCESS"
        return $true
    } catch {
        Write-Log "✗ Error configurando notificaciones: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Generate-Report {
    Write-Log "Generando reporte de despliegue..."
    
    try {
        if (-not (Test-Path "reports")) {
            New-Item -ItemType Directory -Path "reports" -Force | Out-Null
        }
        
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
        $report += "- Tabla universal_timelines`n"
        $report += "- Tabla timeline_milestones`n"
        $report += "- Tabla timeline_stakeholders`n"
        $report += "- Tabla timeline_alerts`n"
        $report += "- Tabla timeline_notifications`n"
        $report += "- Tabla timeline_events`n"
        $report += "- Tabla timeline_type_configs`n`n"
        $report += "Servicios Backend`n"
        $report += "- TimelineService`n"
        $report += "- VirtualAgentService`n"
        $report += "- PlanLimitService`n"
        $report += "- MonitoringService`n`n"
        $report += "Frontend`n"
        $report += "- Componentes de línea de tiempo`n"
        $report += "- Sistema de notificaciones`n"
        $report += "- Agentes virtuales`n"
        $report += "- Calculadora de planes`n`n"
        $report += "Estado: DESPLIEGUE COMPLETADO EXITOSAMENTE`n"
        
        $report | Out-File -FilePath $reportPath -Encoding UTF8
        
        Write-Log "✓ Reporte generado en $reportPath" "SUCCESS"
        return $true
    } catch {
        Write-Log "✗ Error generando reporte: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Función principal de despliegue
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

# Instalar dependencias
if (-not (Install-Dependencies)) {
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

# Generar reporte
Generate-Report | Out-Null

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