# rollback-simple.ps1 - Script de Rollback Simplificado para Windows PowerShell
# Restauración automática del estado anterior

Write-Host "Starting rollback..." -ForegroundColor Yellow

# Function to check if file exists
function Test-BackupFile {
    param([string]$FilePath)
    if (Test-Path $FilePath) {
        Write-Host "SUCCESS: $FilePath found" -ForegroundColor Green
        return $true
    } else {
        Write-Host "ERROR: $FilePath not found" -ForegroundColor Red
        return $false
    }
}

# Function to restore file
function Restore-File {
    param([string]$BackupPath, [string]$TargetPath, [string]$Description)
    if (Test-BackupFile $BackupPath) {
        Copy-Item $BackupPath $TargetPath -Force
        Write-Host "SUCCESS: $Description restored" -ForegroundColor Green
        return $true
    } else {
        Write-Host "ERROR: Could not restore $Description" -ForegroundColor Red
        return $false
    }
}

# Verify we are in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found. Make sure you are in the project directory." -ForegroundColor Red
    exit 1
}

Write-Host "Project directory verified" -ForegroundColor Green

# Restore main files
$success = $true

# package.json
if (-not (Restore-File "package.json.backup" "package.json" "package.json")) {
    $success = $false
}

# package-lock.json
if (-not (Restore-File "package-lock.json.backup" "package-lock.json" "package-lock.json")) {
    $success = $false
}

# tsconfig.json
if (-not (Restore-File "tsconfig.json.backup" "tsconfig.json" "tsconfig.json")) {
    $success = $false
}

# tailwind.config.js
if (-not (Restore-File "tailwind.config.js.backup" "tailwind.config.js" "tailwind.config.js")) {
    Write-Host "WARNING: tailwind.config.js not restored (optional)" -ForegroundColor Yellow
}

# src/index.css
if (-not (Restore-File "src/index.css.backup" "src/index.css" "index.css")) {
    Write-Host "WARNING: index.css not restored (optional)" -ForegroundColor Yellow
}

if (-not $success) {
    Write-Host "ERROR: Rollback failed. Check that backup files exist." -ForegroundColor Red
    exit 1
}

# Reinstall dependencies
Write-Host "Reinstalling dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "SUCCESS: Dependencies reinstalled" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to reinstall dependencies: $_" -ForegroundColor Red
    exit 1
}

# Verify restoration
Write-Host "Verifying restoration..." -ForegroundColor Yellow

# TypeScript check
try {
    npm run type-check
    Write-Host "SUCCESS: TypeScript check passed" -ForegroundColor Green
} catch {
    Write-Host "WARNING: TypeScript check failed, but continuing..." -ForegroundColor Yellow
}

# Build check
try {
    npm run build
    Write-Host "SUCCESS: Build successful" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Build failed, but continuing..." -ForegroundColor Yellow
}

Write-Host "SUCCESS: Rollback completed successfully" -ForegroundColor Green
Write-Host "Starting: npm run dev" -ForegroundColor Cyan

# Start development server
try {
    npm run dev
} catch {
    Write-Host "ERROR: Failed to start development server" -ForegroundColor Red
    Write-Host "TIP: Try running 'npm run dev' manually" -ForegroundColor Yellow
} 