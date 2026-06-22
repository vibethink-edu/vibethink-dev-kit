#!/usr/bin/env pwsh
<#
  install-external-tools.ps1 — provision the kit's DEFAULT operator tools (ADR-20260612).

  Reads pins from setup/external-tools.lock.json (single source of truth).
  Idempotent: skips anything already installed. NON-BLOCKING: never throws,
  always exits 0 — DEFAULT != gate ("absence degrades, never blocks").

  Usage (Windows):  pwsh setup/install-external-tools.ps1
                    pwsh setup/install-external-tools.ps1 -WhatIf   # dry run

  Pairs with scripts/check-tools.sh (the "verify" half).
#>
[CmdletBinding(SupportsShouldProcess)]
param()

$ErrorActionPreference = 'Continue'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$summary = @()

function Expand-Tilde([string]$p) { $p -replace '^~', $HOME }

try {
  $lock = Get-Content (Join-Path $here 'external-tools.lock.json') -Raw | ConvertFrom-Json
} catch {
  Write-Host "✗ no pude leer external-tools.lock.json — aborto sin romper nada." -ForegroundColor Yellow
  exit 0
}

Write-Host "`n  Provisioning kit default tools (idempotent · non-blocking)`n" -ForegroundColor Cyan

foreach ($t in $lock.tools) {
  try {
    # ── graphify (pip) ───────────────────────────────────────────────
    if ($t.kind -eq 'pip') {
      $shown = (& py -m pip show $t.package 2>$null) -join "`n"
      if (-not $shown) { $shown = (& python -m pip show $t.package 2>$null) -join "`n" }
      if ($shown -match 'Version:\s*(\S+)') {
        $v = $Matches[1]
        $note = if ($v -ne $t.pin) { " (pin=$($t.pin) · drift, version-forward por PR)" } else { "" }
        $summary += "✓ $($t.name): ya instalado ($v) — skip$note"
      } else {
        if ($PSCmdlet.ShouldProcess("$($t.package)==$($t.pin)", "pip install --user")) {
          Write-Host "  → instalando $($t.name) $($t.pin)..."
          & py -m pip install --user "$($t.package)==$($t.pin)" 2>&1 | Out-Host
          if ($LASTEXITCODE -eq 0) { $summary += "✓ $($t.name): instalado $($t.pin)" }
          else { $summary += "⚠ $($t.name): pip falló (¿Python ausente?) — degrada, no bloquea" }
        } else { $summary += "· $($t.name): se instalaría $($t.pin) (dry-run)" }
      }

      # gotcha "instalado ≠ disponible": el paquete puede estar presente pero su CLI
      # no resolver por nombre si el Scripts\ del --user site no está en PATH.
      if ($t.cli -and -not $WhatIfPreference) {
        if (-not (Get-Command $t.cli -ErrorAction SilentlyContinue)) {
          $ub = (& py -m site --user-base 2>$null); if (-not $ub) { $ub = (& python -m site --user-base 2>$null) }
          $scripts = if ($ub) { Join-Path $ub 'Scripts' } else { $null }
          if ($scripts -and (Test-Path $scripts)) { $env:PATH = "$scripts;$env:PATH" }  # sesión + hijos
          if (Get-Command $t.cli -ErrorAction SilentlyContinue) {
            $summary += "✓ $($t.name): CLI ahora resuelve (antepuse $scripts al PATH de ESTA sesión)"
            $summary += "  ↳ persistir: agregá '$scripts' al PATH de usuario; un shell ya abierto NO lo toma (stale) — abrí uno nuevo"
          } else {
            $summary += "⚠ $($t.name): paquete instalado pero el CLI '$($t.cli)' NO resuelve por nombre (gotcha 'instalado ≠ disponible')"
            if ($scripts) { $summary += "  ↳ agregá '$scripts' al PATH y abrí un shell NUEVO" }
          }
        }
      }
    }

    # ── rtk (github release) ─────────────────────────────────────────
    elseif ($t.kind -eq 'github-release') {
      $found = $null
      if (Get-Command $t.cli -ErrorAction SilentlyContinue) { $found = "PATH" }
      if (-not $found) {
        foreach ($d in $t.knownDirs) {
          $hit = Get-ChildItem -Path (Expand-Tilde $d) -Recurse -Filter "$($t.cli)*" -ErrorAction SilentlyContinue | Select-Object -First 1
          if ($hit) { $found = $hit.DirectoryName; break }
        }
      }
      if ($found) {
        $summary += "✓ $($t.name): ya instalado (en $found) — skip"
      } else {
        $asset = $t.assets.'windows-x64'
        if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
          $summary += "⚠ $($t.name): falta 'gh' para descargar el release — degrada, no bloquea (ver EXTERNAL-TOOLS.md)"
        } elseif ($PSCmdlet.ShouldProcess("$($t.tag) ($asset)", "gh release download")) {
          $target = Expand-Tilde $t.installDir
          Write-Host "  → instalando $($t.name) $($t.pin) en $target..."
          New-Item -ItemType Directory -Force -Path $target | Out-Null
          & gh release download $t.tag -R $t.repo -p $asset -D $target --clobber 2>&1 | Out-Host
          if ($LASTEXITCODE -eq 0) {
            Expand-Archive -LiteralPath (Join-Path $target $asset) -DestinationPath $target -Force
            if ($t.telemetryConfig) {
              $tcfg = Expand-Tilde $t.telemetryConfig
              New-Item -ItemType Directory -Force -Path (Split-Path $tcfg) | Out-Null
              if (-not (Test-Path $tcfg)) { "telemetry = false" | Out-File -Encoding utf8 $tcfg }
            }
            $extra = if ($t.stateful) { " · STATEFUL: respaldá la BD con 'engram export' (ver engram-weekly-review.sh)" } else { "" }
            $summary += "✓ $($t.name): instalado $($t.pin)$extra"
          } else { $summary += "⚠ $($t.name): descarga falló — degrada, no bloquea" }
        } else { $summary += "· $($t.name): se instalaría $($t.pin) (dry-run)" }
      }
    }
  } catch {
    $summary += "⚠ $($t.name): error no fatal ($($_.Exception.Message)) — degrada, no bloquea"
  }
}

Write-Host "`n  Resumen:" -ForegroundColor Cyan
$summary | ForEach-Object { Write-Host "    $_" }
Write-Host "`n  Verificá con: bash setup/check-tools.sh <repo>`n"
exit 0
