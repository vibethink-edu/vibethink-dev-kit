# ============================================================================
# VibeThink Process Manager Module
# Harvested from: Ovi-Portal (v3.0.2)
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
            Write-Host "   ✅ Port $Port freed." -ForegroundColor Green
        }
        catch {
            Write-Host "   ⚠️  No access to PID $($binding.OwningProcess) for port ${Port}: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "   ✅ Port $Port is free" -ForegroundColor Green
    }
}

function Start-DetachedWindow {
    param(
        [string]$Title,
        [string]$Command,
        [string]$Port,
        [string]$Label,
        [string]$WorkingDirectory
    )

    if (-not $WorkingDirectory) {
        $WorkingDirectory = Get-Location
    }

    $block = @"
Push-Location `"$WorkingDirectory`"
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


function Get-ProjectPorts {
    param(
        [string]$EnvPath = ".env"
    )

    $ports = @{}
    if (Test-Path $EnvPath) {
        $lines = Get-Content $EnvPath
        foreach ($line in $lines) {
            if ($line -match "^(PORT_\w+)=([0-9]+)") {
                $name = $matches[1]
                $value = [int]$matches[2]
                $ports[$name] = $value
                Write-Host "   🔌 Found Config: $name -> $value" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "   ⚠️  No .env file found at $EnvPath" -ForegroundColor Yellow
    }
    return $ports
}

function Stop-NodeProcesses {
    param(
        [string]$FilterString  # e.g., "vite" or "next"
    )

    Write-Host "⏹️  Stopping related Node processes..." -ForegroundColor Yellow

    $nodeProcesses = Get-CimInstance -ClassName Win32_Process -Filter "Name = 'node.exe'"

    if ($FilterString) {
         $nodeProcesses = $nodeProcesses | Where-Object { $_.CommandLine -match $FilterString }
    }

    if ($nodeProcesses) {
        $nodeProcesses | ForEach-Object {
            try {
                Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop
                Write-Host "   ✅ Stopped Node PID: $($_.ProcessId)" -ForegroundColor Green
            }
            catch {
                Write-Host "   ⚠️  Could not stop PID $($_.ProcessId)" -ForegroundColor Gray
            }
        }
    }
    else {
        Write-Host "   ℹ️  No matching Node processes found." -ForegroundColor Gray
    }
}

Export-ModuleMember -Function Ensure-PortFree, Start-DetachedWindow, Stop-NodeProcesses, Get-ProjectPorts
