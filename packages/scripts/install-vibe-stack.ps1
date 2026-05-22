# ============================================================================
# INSTALL VIBE STACK - V1.0.0
# ============================================================================
# Installs Biome, Ruff, Husky, Commitizen, and other VibeCoding tools.
# ============================================================================

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         VIBETHINK DEV KIT - INSTALL VIBE STACK            " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "Node.js is not installed. Please install Node.js to proceed."
  exit 1
}

# Check if Python is installed
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
  Write-Warning "Python is not installed. Ruff (Python linter) might not work correctly if installed via pip, but we will try npm."
}

# Install NPM dependencies
Write-Host "[+] Installing NPM dependencies..." -ForegroundColor Yellow
npm install

# Initialize Husky
Write-Host "[+] Initializing Husky..." -ForegroundColor Yellow
npx husky init

# Create commit-msg hook
Write-Host "[+] Creating commit-msg hook..." -ForegroundColor Yellow
Set-Content .husky/commit-msg 'npx --no -- commitlint --edit "$1"'

# Create pre-commit hook
Write-Host "[+] Creating pre-commit hook..." -ForegroundColor Yellow
Set-Content .husky/pre-commit 'npx lint-staged'

# Install Ruff (Python)
if (Get-Command pip -ErrorAction SilentlyContinue) {
  Write-Host "[+] Installing Ruff via pip (fastest)..." -ForegroundColor Yellow
  pip install ruff
}
else {
  Write-Warning "Pip not found. Skipping global Ruff installation."
}

Write-Host ""
Write-Host "MAXIMUM VIBES DEPLOYED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "   - Biome (JS/TS Linter/Formatter)"
Write-Host "   - Ruff (Python Linter/Formatter)"
Write-Host "   - Husky (Git Hooks)"
Write-Host "   - Commitizen (Commit Standards)"
Write-Host "   - ls-lint (File Naming)"
Write-Host ""
Write-Host "-> Run 'npm run format' to format your code."
Write-Host "-> Run 'npm run check' to lint your code."
