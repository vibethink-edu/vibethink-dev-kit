# ============================================================================
# START SERVERS - V3.0.2
# ============================================================================
# Starts BOTH API Gateway proxy and frontend in separate PowerShell windows
# ============================================================================

Set-StrictMode -Version Latest

$PROJECT_PATH = "C:\IA Marcelo Labs\v3-andres-cantor-fdp-voice-agent"
$PROXY_PORT = 3001
$FRONTEND_PORT = 3000
$PID_STORE_FILE = Join-Path $PROJECT_PATH "scripts\.voice-agent-pids.json"

function Write-Section($title) {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║         $title" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Ensure-CorrectDirectory {
    $currentPath = Get-Location
    if ($currentPath.Path -match "worktrees") {
        Write-Host "❌ ERROR: You are in a worktree!" -ForegroundColor Red
        Write-Host "   Current: $($currentPath.Path)" -ForegroundColor Yellow
        Write-Host "   Correct: $PROJECT_PATH" -ForegroundColor Green
        Write-Host ""
        Write-Host "   Fix: cd `"$PROJECT_PATH`"" -ForegroundColor Cyan
        Write-Host ""
        exit 1
    }

    if (-not (Test-Path $PROJECT_PATH)) {
        Write-Host "❌ ERROR: Project not found at: $PROJECT_PATH" -ForegroundColor Red
        Write-Host ""
        exit 1
    }

    Set-Location $PROJECT_PATH
    Write-Host "✅ Correct directory: $PROJECT_PATH" -ForegroundColor Green
}

function Stop-ProjectNodeProcesses {
    Write-Host "⏹️  Stopping previous servers..." -ForegroundColor Yellow
    $nodeProcesses = Get-CimInstance -ClassName Win32_Process -Filter "Name = 'node.exe'" | Where-Object {
        $_.CommandLine -match "server/api-gateway\.js" -or $_.CommandLine -match "npm run dev" -or $_.CommandLine -match "vite"
    }

    if ($nodeProcesses) {
        $nodeProcesses | ForEach-Object {
            try {
                Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop
                Write-Host "   ✅ Stopped Node PID: $($_.ProcessId)" -ForegroundColor Green
            } catch {
                Write-Host "   ⚠️  No access to PID $($_.ProcessId): $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
        Start-Sleep -Seconds 2
    } else {
        Write-Host "   ℹ️  No Voice Agent node processes detected" -ForegroundColor Gray
    }
}

Write-Section "START SERVERS - V3.0.2"
Ensure-CorrectDirectory
Stop-ProjectNodeProcesses

# ============================================================================
# VERIFY PORTS ARE FREE
# ============================================================================
function Ensure-PortFree {
    param(
        [int]$Port
    )

    $binding = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue

    if ($binding) {
        try {
            Write-Host "   ⚠️  Port $Port already in use by PID $($binding.OwningProcess). Killing..." -ForegroundColor Yellow
            Stop-Process -Id $binding.OwningProcess -Force -ErrorAction Stop
            Start-Sleep -Seconds 1
        } catch {
            Write-Host "   ⚠️  No access to PID $($binding.OwningProcess) for port ${Port}: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ✅ Port $Port is free" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🔍 Verifying ports..." -ForegroundColor Yellow
Ensure-PortFree -Port $PROXY_PORT
Ensure-PortFree -Port $FRONTEND_PORT

# ============================================================================
# WINDOW LAUNCH HELPERS
# ============================================================================
function Start-VoiceAgentWindow {
    param(
        [string]$Title,
        [string]$Command,
        [string]$Port,
        [string]$Label
    )

    $block = @"
Push-Location `"$PROJECT_PATH`"
`$Host.UI.RawUI.WindowTitle = '$Title (Port $Port)'
Write-Host '🚀 $Label...' -ForegroundColor Cyan
Write-Host ''
$Command
Write-Host ''
Write-Host 'Press any key to close...' -ForegroundColor Gray
`$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
"@
    $safeLabel = ($Label -replace '[^\w\d]', '-')
    $tempScript = Join-Path $env:TEMP "start-$safeLabel-$(Get-Random).ps1"
    Set-Content -Path $tempScript -Value $block -Encoding UTF8
    return Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$tempScript`"" -WindowStyle Normal -PassThru
}

Write-Host ""
Write-Host "🚀 Starting Proxy..." -ForegroundColor Yellow
$proxyProcess = Start-VoiceAgentWindow -Title "Voice Agent - API Gateway v3.0.2" -Command "node server/api-gateway.js" -Port $PROXY_PORT -Label "API Gateway v3.0.2"
Write-Host "   ✅ Proxy window opened (PID: $($proxyProcess.Id))" -ForegroundColor Green
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "🚀 Starting Frontend..." -ForegroundColor Yellow
$frontendProcess = Start-VoiceAgentWindow -Title "Voice Agent - Frontend" -Command "npm run dev" -Port $FRONTEND_PORT -Label "Frontend"
Write-Host "   ✅ Frontend window opened (PID: $($frontendProcess.Id))" -ForegroundColor Green

function Persist-WindowPids {
    $payload = @{
        proxyPid = $proxyProcess.Id
        frontendPid = $frontendProcess.Id
        timestamp = (Get-Date).ToString("o")
    }
    $payload | ConvertTo-Json -Depth 3 | Set-Content -Path $PID_STORE_FILE -Encoding UTF8
}

Persist-WindowPids

# ============================================================================
# VERIFY SERVICES
# ============================================================================
Write-Host ""
Write-Host "🔍 Verifying services..." -ForegroundColor Cyan
Write-Host "   ⏳ Waiting for services to start..." -ForegroundColor Yellow

$maxAttempts = 20
$proxyOk = $false
$frontendOk = $false

for ($i = 1; $i -le $maxAttempts; $i++) {
    Start-Sleep -Seconds 1
    
    if (-not $proxyOk) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$PROXY_PORT/health" -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop
            $proxyOk = $true
            Write-Host "   ✅ Proxy: http://localhost:$PROXY_PORT" -ForegroundColor Green
        } catch {
            # Keep trying
        }
    }
    
    if (-not $frontendOk) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$FRONTEND_PORT" -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop
            $frontendOk = $true
            Write-Host "   ✅ Frontend: http://localhost:$FRONTEND_PORT" -ForegroundColor Green
        } catch {
            # Keep trying
        }
    }
    
    if ($proxyOk -and $frontendOk) {
        break
    }
}

# ============================================================================
# FINAL MESSAGE
# ============================================================================
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan

if ($proxyOk -and $frontendOk) {
    Write-Host "║              ✅ ALL SERVICES RUNNING                       ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🌐 Open your browser at:" -ForegroundColor Cyan
    Write-Host "   http://localhost:$FRONTEND_PORT" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Verify:" -ForegroundColor Yellow
    Write-Host "   1. Footer shows: V3.0.2 (API Gateway & Security Overhaul)" -ForegroundColor White
    Write-Host "   2. API Gateway health: http://localhost:$PROXY_PORT/health" -ForegroundColor White
    Write-Host "   3. Test all 7 voice options" -ForegroundColor White
    Write-Host "   4. No audio cuts (ElevenLabs/Cartesia)" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "║           ⚠️  SERVICES NOT RESPONDING YET                  ║" -ForegroundColor Yellow
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    if (-not $proxyOk) {
        Write-Host "   ⚠️  Proxy (port $PROXY_PORT) not responding yet" -ForegroundColor Yellow
    }
    if (-not $frontendOk) {
        Write-Host "   ⚠️  Frontend (port $FRONTEND_PORT) not responding yet" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "   Check the PowerShell windows for errors." -ForegroundColor Gray
    Write-Host "   Services may still be starting..." -ForegroundColor Gray
    Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "💡 To stop servers: .\scripts\stop.ps1" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""


