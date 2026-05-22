# ============================================================================
# STOP SERVERS - V3.0.2 (Seguro - Solo cierra ventanas del proyecto)
# ============================================================================
# Stop all Voice Agent servers AND close ONLY the windows opened by start.ps1
# Uses PID tracking for maximum safety
# ============================================================================

Set-StrictMode -Version Latest

$PROJECT_PATH = "C:\IA Marcelo Labs\v3-andres-cantor-fdp-voice-agent"
$PID_STORE_FILE = Join-Path $PROJECT_PATH "scripts\.voice-agent-pids.json"
$currentPID = $PID

Write-Host ""
Write-Host "Stopping Voice Agent servers..." -ForegroundColor Yellow
Write-Host ""

# ============================================================================
# 1. Read PIDs from start.ps1 tracking file (METODO SEGURO)
# ============================================================================
$trackedPids = @{
    proxyPid = $null
    frontendPid = $null
}

if (Test-Path $PID_STORE_FILE) {
    try {
        $stored = Get-Content $PID_STORE_FILE -Raw | ConvertFrom-Json
        $trackedPids.proxyPid = $stored.proxyPid
        $trackedPids.frontendPid = $stored.frontendPid
        Write-Host "   Found tracked PIDs:" -ForegroundColor Cyan
        Write-Host "      Proxy: $($trackedPids.proxyPid)" -ForegroundColor Gray
        Write-Host "      Frontend: $($trackedPids.frontendPid)" -ForegroundColor Gray
    } catch {
        Write-Host "   WARNING: Could not read PID file: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   INFO: No PID tracking file found (servers may not be running)" -ForegroundColor Gray
}

# ============================================================================
# 2. Stop Node.js processes related to the project (SEGURO)
# ============================================================================
Write-Host ""
Write-Host "Stopping Node.js processes..." -ForegroundColor Yellow

$nodeProcesses = Get-CimInstance -ClassName Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue
$stoppedCount = 0

if ($nodeProcesses) {
    foreach ($nodeProc in $nodeProcesses) {
        $cmdLine = $nodeProc.CommandLine
        $procId = $nodeProc.ProcessId
        
        # Solo cerrar procesos relacionados con el proyecto
        if ($cmdLine -match "server/api-gateway\.js" -or 
            $cmdLine -match "npm run dev" -or 
            $cmdLine -match "vite") {
            
            Write-Host "   Stopping Node PID: $procId" -ForegroundColor Red
            try {
                Stop-Process -Id $procId -Force -ErrorAction Stop
                $stoppedCount++
            } catch {
                Write-Host "   WARNING: Could not stop PID $procId : $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
    }
    
    if ($stoppedCount -gt 0) {
        Write-Host "   SUCCESS: Stopped $stoppedCount Node process(es)" -ForegroundColor Green
        Start-Sleep -Seconds 1
    } else {
        Write-Host "   INFO: No Voice Agent Node processes found" -ForegroundColor Gray
    }
} else {
    Write-Host "   INFO: No Node processes running" -ForegroundColor Gray
}

# ============================================================================
# 3. Close PowerShell windows by tracked PIDs (METODO MAS SEGURO)
# ============================================================================
Write-Host ""
Write-Host "Closing PowerShell windows (safe method)..." -ForegroundColor Yellow

$closedCount = 0
$targetPids = @()

# Agregar PIDs rastreados si existen
if ($trackedPids.proxyPid) { $targetPids += $trackedPids.proxyPid }
if ($trackedPids.frontendPid) { $targetPids += $trackedPids.frontendPid }

# Cerrar ventanas por PID exacto (MAXIMA SEGURIDAD)
foreach ($targetPid in $targetPids) {
    try {
        $psProc = Get-Process -Id $targetPid -ErrorAction Stop
        if ($psProc.ProcessName -eq "powershell") {
            $title = $psProc.MainWindowTitle
            Write-Host "   Closing tracked window: $title (PID: $targetPid)" -ForegroundColor Cyan
            Stop-Process -Id $targetPid -Force -ErrorAction Stop
            $closedCount++
        }
    } catch {
        # El proceso ya no existe o no es accesible
        Write-Host "   INFO: PID $targetPid not found (may already be closed)" -ForegroundColor Gray
    }
}

# Fallback: Buscar por titulo SOLO si no encontramos PIDs rastreados
if ($closedCount -eq 0 -and $targetPids.Count -eq 0) {
    Write-Host "   Fallback: Searching by window title..." -ForegroundColor Yellow
    
    $allPowershell = Get-Process powershell -ErrorAction SilentlyContinue
    
    if ($allPowershell) {
        foreach ($ps in $allPowershell) {
            # Skip current process
            if ($ps.Id -eq $currentPID) { continue }
            
            # Solo cerrar ventanas con GUI visible
            if ($ps.MainWindowHandle -eq 0) { continue }
            
            $title = $ps.MainWindowTitle
            
            # Match EXACT titles from start.ps1 (mas restrictivo)
            if ($title -match "^Voice Agent - API Gateway.*Port 3001" -or 
                $title -match "^Voice Agent - Frontend.*Port 3000") {
                
                Write-Host "   Closing: $title (PID: $($ps.Id))" -ForegroundColor Cyan
                try {
                    Stop-Process -Id $ps.Id -Force -ErrorAction Stop
                    $closedCount++
                } catch {
                    Write-Host "   WARNING: Could not close PID $($ps.Id): $($_.Exception.Message)" -ForegroundColor Yellow
                }
            }
        }
    }
}

if ($closedCount -gt 0) {
    Write-Host "   SUCCESS: Closed $closedCount Voice Agent window(s)" -ForegroundColor Green
} else {
    Write-Host "   INFO: No Voice Agent windows found (may already be closed)" -ForegroundColor Gray
}

# Limpiar archivo de PIDs
if (Test-Path $PID_STORE_FILE) {
    try {
        Remove-Item $PID_STORE_FILE -Force -ErrorAction Stop
        Write-Host "   Cleaned PID tracking file" -ForegroundColor Gray
    } catch {
        # Ignorar errores de limpieza
    }
}

# ============================================================================
# 4. Verify ports are free
# ============================================================================
Write-Host ""
Write-Host "Verifying ports are free..." -ForegroundColor Yellow

$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($port3001) {
    Write-Host "   WARNING: Port 3001 still in use by PID $($port3001.OwningProcess), force killing..." -ForegroundColor Yellow
    try {
        Stop-Process -Id $port3001.OwningProcess -Force -ErrorAction Stop
        Write-Host "   SUCCESS: Port 3001 freed" -ForegroundColor Green
    } catch {
        Write-Host "   WARNING: Could not free port 3001: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   SUCCESS: Port 3001 is free" -ForegroundColor Green
}

if ($port3000) {
    Write-Host "   WARNING: Port 3000 still in use by PID $($port3000.OwningProcess), force killing..." -ForegroundColor Yellow
    try {
        Stop-Process -Id $port3000.OwningProcess -Force -ErrorAction Stop
        Write-Host "   SUCCESS: Port 3000 freed" -ForegroundColor Green
    } catch {
        Write-Host "   WARNING: Could not free port 3000: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   SUCCESS: Port 3000 is free" -ForegroundColor Green
}

# ============================================================================
# FINAL MESSAGE
# ============================================================================
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "              ALL SERVICES STOPPED" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start again: .\scripts\start.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "Safety features:" -ForegroundColor Green
Write-Host "   - Only closed tracked PowerShell windows (by PID)" -ForegroundColor White
Write-Host "   - Only stopped Voice Agent Node.js processes" -ForegroundColor White
Write-Host "   - Your IDE terminals and other windows are safe" -ForegroundColor White
Write-Host ""
