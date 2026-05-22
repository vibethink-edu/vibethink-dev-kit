# dev-clean.ps1 - Script para limpiar servidores e iniciar desarrollo
# Mata todos los servidores y luego ejecuta npm run dev

Write-Host "Starting clean development environment..." -ForegroundColor Cyan

# First, kill all servers
Write-Host "`nStep 1: Killing all development servers..." -ForegroundColor Yellow
& ".\scripts\kill-servers.ps1"

# Wait a moment for processes to fully terminate
Write-Host "`nStep 2: Waiting for processes to terminate..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found. Make sure you are in the project directory." -ForegroundColor Red
    exit 1
}

# Start development server
Write-Host "`nStep 3: Starting development server..." -ForegroundColor Green
Write-Host "Executing: npm run dev" -ForegroundColor Cyan

try {
    npm run dev
} catch {
    Write-Host "ERROR: Failed to start development server: $_" -ForegroundColor Red
    exit 1
} 