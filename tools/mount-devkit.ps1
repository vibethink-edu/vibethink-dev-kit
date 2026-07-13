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

# DEPRECATED per D-066 (CANON-BRANCH-WORKTREE-LIFECYCLE §5.4): a junction to the kit is the
# junction-follow-delete WIPE-RISK pattern — a recursive delete of this repo can follow the link and
# destroy the shared kit (it happened 3x: D-061, D-062, and a consumer mount 2026-07-13). PREFER an
# ISOLATED CLONE the repo references directly (git clone the kit remote), which cannot be
# junction-follow-deleted. This junction mode remains only for legacy convenience.
Write-Warning "mount-devkit (.vibethink-core junction) is DEPRECATED (D-066): a junction to the kit is the junction-follow-delete wipe-risk pattern. Prefer an isolated clone. See CANON-BRANCH-WORKTREE-LIFECYCLE 5.4."

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
