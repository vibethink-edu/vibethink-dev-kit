# check-project-status.ps1 - Script para verificar estado del proyecto
# Verifica TypeScript, build y servidor de desarrollo

Write-Host "Checking project status..." -ForegroundColor Yellow

# Function to check command
function Test-Command {
    param([string]$Command, [string]$Description)
    
    try {
        Invoke-Expression $Command | Out-Null
        Write-Host "SUCCESS: $Description OK" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "ERROR: $Description FAILED" -ForegroundColor Red
        return $false
    }
}

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found. Make sure you are in the project directory." -ForegroundColor Red
    exit 1
}

Write-Host "Project directory verified" -ForegroundColor Green

# Check TypeScript
Write-Host "`nChecking TypeScript..." -ForegroundColor Cyan
$typescriptOK = Test-Command "npm run type-check" "TypeScript"

# Check build
Write-Host "`nChecking build..." -ForegroundColor Cyan
$buildOK = Test-Command "npm run build" "Build"

# Check dev server
Write-Host "`nChecking development server..." -ForegroundColor Cyan
try {
    $process = Start-Process npm -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden
    Start-Sleep -Seconds 5
    
    if (-not $process.HasExited) {
        Write-Host "SUCCESS: Dev Server OK" -ForegroundColor Green
        $devOK = $true
        # Kill the process
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    } else {
        Write-Host "ERROR: Dev Server FAILED" -ForegroundColor Red
        $devOK = $false
    }
} catch {
    Write-Host "ERROR: Dev Server FAILED" -ForegroundColor Red
    $devOK = $false
}

# Check for running servers
Write-Host "`nChecking for running servers..." -ForegroundColor Cyan
$runningServers = @()

# Check common ports
$ports = @(3000, 3001, 8080, 8081, 5173, 4173, 4000, 5000, 8000)
foreach ($port in $ports) {
    try {
        $connections = netstat -ano | Select-String ":$port\s"
        if ($connections) {
            $runningServers += "Port $port"
        }
    } catch {
        # Ignore errors
    }
}

if ($runningServers.Count -gt 0) {
    Write-Host "WARNING: Running servers found: $($runningServers -join ', ')" -ForegroundColor Yellow
} else {
    Write-Host "SUCCESS: No running servers found" -ForegroundColor Green
}

# Summary
Write-Host "`n=== PROJECT STATUS SUMMARY ===" -ForegroundColor Cyan
Write-Host "TypeScript: $(if ($typescriptOK) { 'SUCCESS OK' } else { 'ERROR FAILED' })" -ForegroundColor $(if ($typescriptOK) { "Green" } else { "Red" })
Write-Host "Build: $(if ($buildOK) { 'SUCCESS OK' } else { 'ERROR FAILED' })" -ForegroundColor $(if ($buildOK) { "Green" } else { "Red" })
Write-Host "Dev Server: $(if ($devOK) { 'SUCCESS OK' } else { 'ERROR FAILED' })" -ForegroundColor $(if ($devOK) { "Green" } else { "Red" })

# Overall status
if ($typescriptOK -and $buildOK -and $devOK) {
    Write-Host "`nPROJECT STATUS: HEALTHY" -ForegroundColor Green
    Write-Host "All systems are working correctly!" -ForegroundColor Green
} else {
    Write-Host "`nPROJECT STATUS: ISSUES DETECTED" -ForegroundColor Yellow
    Write-Host "Some systems have problems. Check the errors above." -ForegroundColor Yellow
}

# Recommendations
Write-Host "`n=== RECOMMENDATIONS ===" -ForegroundColor Cyan

if (-not $typescriptOK) {
    Write-Host "• Fix TypeScript errors before continuing" -ForegroundColor Yellow
}

if (-not $buildOK) {
    Write-Host "• Fix build errors before continuing" -ForegroundColor Yellow
}

if (-not $devOK) {
    Write-Host "• Check if port 8081 is available" -ForegroundColor Yellow
    Write-Host "• Try running: npm run dev:kill" -ForegroundColor Yellow
}

if ($runningServers.Count -gt 0) {
    Write-Host "• Consider running: npm run dev:kill" -ForegroundColor Yellow
}

if ($typescriptOK -and $buildOK -and $devOK) {
    Write-Host "• Ready for development!" -ForegroundColor Green
    Write-Host "• Run: npm run dev:clean" -ForegroundColor Green
}

Write-Host "`nProject status check completed" -ForegroundColor Cyan 