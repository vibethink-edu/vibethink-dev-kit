# 🤖 Script de Inicialización VibeThink para PowerShell
# Autor: Marcelo Escallón
# Fecha: 2025-01-22
# Versión: 1.0

param(
    [string]$Objective = "",
    [string]$PendingTasks = "",
    [string]$UrgentIssues = ""
)

# Función para obtener la fecha actual
function Get-CurrentDate {
    return Get-Date -Format "dd/MM/yyyy"
}

# Función para obtener la hora actual
function Get-CurrentTime {
    return Get-Date -Format "HH:mm"
}

# Función para generar el comando de inicialización
function New-VibeThinkInitCommand {
    param(
        [string]$Objective,
        [string]$PendingTasks,
        [string]$UrgentIssues
    )
    
    $currentDate = Get-CurrentDate
    $currentTime = Get-CurrentTime
    
    $initCommand = @"
INIT_VIBETHINK_SESSION

## 👤 Identificación de Usuario
- **Nombre:** Marcelo Escallón
- **Rol:** CEO/CTO
- **Email:** marcelo@vibethink.co
- **Empresa:** VibeThink Orchestrator

## 📅 Contexto Temporal
- **Fecha:** $currentDate
- **Hora:** $currentTime
- **Zona Horaria:** UTC-5
- **Ubicación:** Bogotá, Colombia

## 📊 Estado del Proyecto
- **Objetivo Principal:** $Objective
- **Tareas Pendientes:** $PendingTasks
- **Problemas Urgentes:** $UrgentIssues

## ⚙️ Contexto Técnico
- **Entorno:** Local/Dev
- **Herramientas:** Cursor IDE, Supabase, React, TypeScript
- **Dispositivo:** PC Windows
- **Sistema Operativo:** Windows 10/11
"@
    
    return $initCommand
}

# Función para mostrar ayuda
function Show-Help {
    Write-Host @"
🤖 Script de Inicialización VibeThink
====================================

Uso:
    .\init-vibethink-session.ps1 [parámetros]

Parámetros:
    -Objective      Objetivo principal de la sesión
    -PendingTasks   Tareas pendientes (separadas por comas)
    -UrgentIssues   Problemas urgentes (separados por comas)

Ejemplos:
    .\init-vibethink-session.ps1 -Objective "Desarrollo de nueva funcionalidad"
    .\init-vibethink-session.ps1 -Objective "Revisión de código" -PendingTasks "Test unitarios, Documentación"
    .\init-vibethink-session.ps1 -Objective "Debugging" -UrgentIssues "Error en producción"

Comandos rápidos:
    .\init-vibethink-session.ps1 -Objective "Desarrollo"
    .\init-vibethink-session.ps1 -Objective "Testing"
    .\init-vibethink-session.ps1 -Objective "Documentación"
"@ -ForegroundColor Cyan
}

# Función principal
function Start-VibeThinkSession {
    param(
        [string]$Objective,
        [string]$PendingTasks,
        [string]$UrgentIssues
    )
    
    Write-Host "🤖 Inicializando sesión VibeThink..." -ForegroundColor Green
    Write-Host "📅 Fecha: $(Get-CurrentDate)" -ForegroundColor Yellow
    Write-Host "⏰ Hora: $(Get-CurrentTime)" -ForegroundColor Yellow
    Write-Host ""
    
    # Generar comando de inicialización
    $initCommand = New-VibeThinkInitCommand -Objective $Objective -PendingTasks $PendingTasks -UrgentIssues $UrgentIssues
    
    # Mostrar el comando
    Write-Host "📋 Comando de inicialización generado:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host $initCommand -ForegroundColor White
    Write-Host ""
    
    # Preguntar si copiar al portapapeles
    $copyToClipboard = Read-Host "¿Copiar al portapapeles? (S/N)"
    
    if ($copyToClipboard -eq "S" -or $copyToClipboard -eq "s" -or $copyToClipboard -eq "Y" -or $copyToClipboard -eq "y") {
        $initCommand | Set-Clipboard
        Write-Host "✅ Comando copiado al portapapeles" -ForegroundColor Green
        Write-Host "📋 Ahora puedes pegarlo en el chat de Cursor IDE" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "🎯 Próximos pasos:" -ForegroundColor Green
    Write-Host "1. Pega el comando en el chat de Cursor IDE" -ForegroundColor White
    Write-Host "2. VibeThink ejecutará el protocolo de inicialización" -ForegroundColor White
    Write-Host "3. Confirma la información si es necesario" -ForegroundColor White
    Write-Host "4. ¡Listo para trabajar!" -ForegroundColor White
}

# Función para crear alias
function New-VibeThinkAlias {
    Write-Host "🔧 Creando alias para VibeThink..." -ForegroundColor Yellow
    
    $aliasScript = @"
# Alias para VibeThink
function vibethink {
    param([string]`$Objective = "")
    & "$PSScriptRoot\init-vibethink-session.ps1" -Objective `$Objective
}

# Exportar función
Export-ModuleMember -Function vibethink
"@
    
    $aliasPath = "$env:USERPROFILE\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1"
    
    # Crear directorio si no existe
    $profileDir = Split-Path $aliasPath -Parent
    if (!(Test-Path $profileDir)) {
        New-Item -ItemType Directory -Path $profileDir -Force
    }
    
    # Añadir alias al perfil
    if (!(Test-Path $aliasPath)) {
        New-Item -ItemType File -Path $aliasPath -Force
    }
    
    Add-Content -Path $aliasPath -Value $aliasScript
    
    Write-Host "✅ Alias creado exitosamente" -ForegroundColor Green
    Write-Host "🔄 Reinicia PowerShell para usar el comando 'vibethink'" -ForegroundColor Yellow
}

# Función para mostrar estado del sistema
function Show-SystemStatus {
    Write-Host "🔍 Estado del Sistema VibeThink" -ForegroundColor Cyan
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Verificar si existe el perfil de PowerShell
    $profilePath = "$env:USERPROFILE\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1"
    if (Test-Path $profilePath) {
        Write-Host "✅ Perfil de PowerShell configurado" -ForegroundColor Green
    } else {
        Write-Host "❌ Perfil de PowerShell no encontrado" -ForegroundColor Red
    }
    
    # Verificar si existe el directorio de Cursor
    $cursorPath = "$env:USERPROFILE\.cursor"
    if (Test-Path $cursorPath) {
        Write-Host "✅ Directorio de Cursor IDE encontrado" -ForegroundColor Green
    } else {
        Write-Host "❌ Directorio de Cursor IDE no encontrado" -ForegroundColor Red
    }
    
    # Verificar snippets
    $snippetsPath = "$env:USERPROFILE\.cursor\snippets\vibethink-init.code-snippets"
    if (Test-Path $snippetsPath) {
        Write-Host "✅ Snippets de VibeThink configurados" -ForegroundColor Green
    } else {
        Write-Host "❌ Snippets de VibeThink no encontrados" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "📊 Información del Sistema:" -ForegroundColor Yellow
    Write-Host "   Sistema Operativo: $($env:OS)" -ForegroundColor White
    Write-Host "   Usuario: $($env:USERNAME)" -ForegroundColor White
    Write-Host "   PowerShell Versión: $($PSVersionTable.PSVersion)" -ForegroundColor White
    Write-Host "   Fecha Actual: $(Get-CurrentDate)" -ForegroundColor White
    Write-Host "   Hora Actual: $(Get-CurrentTime)" -ForegroundColor White
}

# Procesar parámetros
if ($args[0] -eq "--help" -or $args[0] -eq "-h") {
    Show-Help
    exit
}

if ($args[0] -eq "--alias") {
    New-VibeThinkAlias
    exit
}

if ($args[0] -eq "--status") {
    Show-SystemStatus
    exit
}

# Ejecutar inicialización
Start-VibeThinkSession -Objective $Objective -PendingTasks $PendingTasks -UrgentIssues $UrgentIssues 