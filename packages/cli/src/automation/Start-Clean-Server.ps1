# Start-Clean-Server.ps1
# Mata todos los procesos Node.js y inicia servidor limpio para VibeThink Dashboard
# Autor: VibeThink Team
# Fecha: 2025-08-11

param(
    [Parameter(Mandatory=$false)]
    [string]$App = "dashboard",
    
    [Parameter(Mandatory=$false)]
    [int]$Port = 3001,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# Colores para output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Magenta = "`e[35m"
$Cyan = "`e[36m"
$White = "`e[37m"
$Reset = "`e[0m"

Write-Host "${Cyan}🚀 VIBETHINK CLEAN SERVER STARTER${Reset}" -ForegroundColor Cyan
Write-Host "${Cyan}====================================${Reset}" -ForegroundColor Cyan
Write-Host "${Blue}📋 App: ${White}$App${Reset}"
Write-Host "${Blue}🌐 Puerto: ${White}$Port${Reset}"
Write-Host "${Blue}⚡ Modo: ${White}$(if($Force){'Force Kill'}else{'Gentle Kill'})${Reset}"
Write-Host ""

# Función para mostrar procesos Node.js
function Show-NodeProcesses {
    Write-Host "${Yellow}📊 Procesos Node.js activos:${Reset}"
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $nodeProcesses | ForEach-Object {
            $memoryMB = [math]::Round($_.WorkingSet / 1MB, 2)
            Write-Host "${White}  🔸 PID: $($_.Id) | Memoria: ${memoryMB}MB${Reset}"
        }
        Write-Host "${Yellow}  Total procesos: $($nodeProcesses.Count)${Reset}"
    } else {
        Write-Host "${Green}  ✅ No hay procesos Node.js activos${Reset}"
    }
    Write-Host ""
}

# Función para matar procesos en puerto específico
function Kill-ProcessOnPort {
    param([int]$PortNumber)
    
    Write-Host "${Blue}🔍 Buscando procesos en puerto $PortNumber...${Reset}"
    
    try {
        $connections = netstat -ano | Select-String ":$PortNumber "
        if ($connections) {
            $connections | ForEach-Object {
                if ($_ -match '\s+(\d+)$') {
                    $pid = $matches[1]
                    Write-Host "${Yellow}⚡ Matando proceso PID $pid en puerto $PortNumber...${Reset}"
                    taskkill /PID $pid /F 2>$null
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "${Green}  ✅ Proceso $pid eliminado exitosamente${Reset}"
                    }
                }
            }
        } else {
            Write-Host "${Green}  ✅ Puerto $PortNumber libre${Reset}"
        }
    } catch {
        Write-Host "${Red}  ❌ Error verificando puerto: $($_.Exception.Message)${Reset}"
    }
}

# Función para matar todos los procesos Node.js
function Kill-AllNodeProcesses {
    param([bool]$ForceKill = $false)
    
    Write-Host "${Red}💀 Eliminando procesos Node.js...${Reset}"
    
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if (-not $nodeProcesses) {
        Write-Host "${Green}  ✅ No hay procesos Node.js para eliminar${Reset}"
        return
    }
    
    $killCount = 0
    
    foreach ($process in $nodeProcesses) {
        try {
            if ($ForceKill) {
                # Force kill
                taskkill /PID $process.Id /F 2>$null
            } else {
                # Gentle kill first
                $process.CloseMainWindow() | Out-Null
                Start-Sleep -Milliseconds 500
                if (-not $process.HasExited) {
                    taskkill /PID $process.Id /F 2>$null
                }
            }
            
            if ($LASTEXITCODE -eq 0 -or -not (Get-Process -Id $process.Id -ErrorAction SilentlyContinue)) {
                Write-Host "${Green}  ✅ Node.js PID $($process.Id) eliminado${Reset}"
                $killCount++
            }
        } catch {
            Write-Host "${Red}  ❌ Error eliminando PID $($process.Id): $($_.Exception.Message)${Reset}"
        }
    }
    
    Write-Host "${Green}🎯 $killCount procesos Node.js eliminados${Reset}"
    Start-Sleep -Seconds 1
}

# Función para limpiar puertos comunes
function Clear-CommonPorts {
    Write-Host "${Blue}🧹 Limpiando puertos comunes...${Reset}"
    
    $ports = @(3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010, 3011, 3012, 5000, 5173, 4000, 8000, 8080)
    
    foreach ($port in $ports) {
        Kill-ProcessOnPort -PortNumber $port
    }
    Write-Host ""
}

# Función para iniciar servidor
function Start-Server {
    param([string]$AppName, [int]$ServerPort)
    
    Write-Host "${Green}🚀 Iniciando servidor $AppName en puerto $ServerPort...${Reset}"
    Write-Host ""
    
    # Verificar que el directorio existe
    $appPath = "apps\$AppName"
    if (-not (Test-Path $appPath)) {
        Write-Host "${Red}❌ Error: Directorio $appPath no encontrado${Reset}"
        exit 1
    }
    
    # Cambiar al directorio de la app
    Set-Location $appPath
    
    # Iniciar el servidor
    try {
        if ($AppName -eq "dashboard") {
            Write-Host "${Blue}📱 Iniciando Dashboard de VibeThink...${Reset}"
            npx next@15.3.4 dev -p $ServerPort
        } else {
            Write-Host "${Blue}📱 Iniciando $AppName...${Reset}"
            npm run dev -- --port $ServerPort
        }
    } catch {
        Write-Host "${Red}❌ Error iniciando servidor: $($_.Exception.Message)${Reset}"
        Set-Location ..\..
        exit 1
    }
}

# MAIN EXECUTION
Write-Host "${Magenta}🔍 Diagnóstico inicial...${Reset}"
Show-NodeProcesses

# Limpiar procesos
Write-Host "${Red}🧹 FASE 1: Limpieza de procesos${Reset}"
Kill-AllNodeProcesses -ForceKill $Force

# Limpiar puertos
Write-Host "${Blue}🧹 FASE 2: Limpieza de puertos${Reset}"
Clear-CommonPorts

# Verificar limpieza
Write-Host "${Green}✅ FASE 3: Verificación post-limpieza${Reset}"
Show-NodeProcesses

# Esperar un momento para estabilización
Write-Host "${Yellow}⏳ Esperando estabilización del sistema...${Reset}"
Start-Sleep -Seconds 2

# Iniciar servidor limpio
Write-Host "${Green}🚀 FASE 4: Iniciando servidor limpio${Reset}"
Start-Server -AppName $App -ServerPort $Port

# Reset location on exit
Set-Location ..\..