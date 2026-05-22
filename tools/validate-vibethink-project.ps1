param (
  [Parameter(Mandatory = $true)]
  [string]$ProjectPath
)

$ErrorActionPreference = "Stop"
$score = 100
$issues = @()

Write-Host " "
Write-Host "[AUDIT] Checking project: $ProjectPath" -ForegroundColor Cyan

# 1. Check Identity (.env.example)
$envPath = Join-Path $ProjectPath ".env.example"
if (Test-Path $envPath) {
  Write-Host "[OK] .env.example found" -ForegroundColor Green
  $content = Get-Content $envPath

  $requiredVars = @("STACK_TYPE", "STACK_ORCHESTRATION_MODE", "GITHUB_REPO_URL", "STACK_DOCS_METHODOLOGY")
  foreach ($var in $requiredVars) {
    $found = $false
    foreach ($line in $content) {
      if ($line -match "$var=") {
        $found = $true
        break
      }
    }

    if ($found) {
      Write-Host "  [OK] $var defined" -ForegroundColor Green
    }
    else {
      Write-Host "  [FAIL] $var MISSING" -ForegroundColor Red
      $issues += "Missing variable $var in .env.example"
      $score -= 10
    }
  }
}
else {
  Write-Host "[FAIL] .env.example NOT found" -ForegroundColor Red
  $issues += "Missing .env.example file"
  $score -= 20
}

# 2. Check Agent Manifest
$manifestPath = Join-Path $ProjectPath ".agents\MANIFEST.md"
if (Test-Path $manifestPath) {
  Write-Host "[OK] .agents/MANIFEST.md found" -ForegroundColor Green
}
else {
  Write-Host "[FAIL] .agents/MANIFEST.md NOT found" -ForegroundColor Red
  $issues += "Missing Agent MANIFEST"
  $score -= 20
}

# 3. Check Protocol Clean Root (Simulated)
$rootFiles = Get-ChildItem -Path $ProjectPath -File | Select-Object -ExpandProperty Name
$forbiddenPatterns = @("*.ts", "*.js", "*.py", "*.go")
$foundCode = $false
foreach ($file in $rootFiles) {
  foreach ($pattern in $forbiddenPatterns) {
    if ($file -like $pattern) {
      if ($file -ne "commitlint.config.js" -and $file -ne "postcss.config.js" -and $file -ne "tailwind.config.js" -and $file -ne "next.config.js" -and $file -ne "vite.config.ts") {
        $foundCode = $true
        $issues += "Code in root: $file"
      }
    }
  }
}

if ($foundCode) {
  Write-Host "[FAIL] Source code detected in root (Clean Root Violation)" -ForegroundColor Red
  $score -= 15
}
else {
  Write-Host "[OK] Root Clean" -ForegroundColor Green
}

# Report
Write-Host "----------------------------------------"
if ($score -ge 80) {
  Write-Host "FINAL STATUS: APPROVED ($score/100)" -ForegroundColor Green
}
else {
  Write-Host "FINAL STATUS: REJECTED ($score/100)" -ForegroundColor Red
}
Write-Host "----------------------------------------"

if ($issues.Count -gt 0) {
  Write-Host "Issues found:" -ForegroundColor Yellow
  foreach ($issue in $issues) {
    Write-Host " - $issue"
  }
}
