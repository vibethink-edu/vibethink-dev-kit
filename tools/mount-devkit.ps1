param()
$ErrorActionPreference = "Stop"

# Locate Dev-Kit
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DevKitPath = Split-Path -Parent $ScriptDir
$CurrentDir = Get-Location
$TargetLink = Join-Path $CurrentDir ".vibethink-core"

Write-Host "VibeThink Context Mounter"
Write-Host "Source: $DevKitPath"
Write-Host "Target: $CurrentDir"

# Create Junction
if (Test-Path $TargetLink) {
  Write-Host "Link exists."
}
else {
  cmd /c mklink /J "$TargetLink" "$DevKitPath"
  Write-Host "Link created."
}

# Update .gitignore
$GitIgnorePath = Join-Path $CurrentDir ".gitignore"
$Rule = ".vibethink-core"

if (-not (Test-Path $GitIgnorePath)) {
  Set-Content -Path $GitIgnorePath -Value "$Rule"
  Write-Host "Created .gitignore"
}
else {
  $Content = Get-Content $GitIgnorePath
  $Found = $false
  foreach ($line in $Content) {
    if ($line.Trim() -eq $Rule) { $Found = $true }
  }

  if (-not $Found) {
    Add-Content -Path $GitIgnorePath -Value "$Rule"
    Write-Host "Updated .gitignore"
  }
  else {
    Write-Host ".gitignore already has rule"
  }
}

Write-Host "Done."
