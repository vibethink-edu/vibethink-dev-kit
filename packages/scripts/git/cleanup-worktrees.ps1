# ============================================================================
# CLEANUP WORKTREES - V4.1.0
# ============================================================================
# Script para limpiar worktrees automáticamente y prevenir acumulación
# Limpia worktrees obsoletos y mantiene solo los necesarios
# Identifica la plataforma de cada worktree (Cursor, Claude Code, etc.)
# ============================================================================

param(
    [switch]$AutoClean,
    [switch]$ListOnly
)

$PROJECT_PATH = "C:\IA Marcelo Labs\v3-andres-cantor-fdp-voice-agent"
$MAX_WORKTREES = 3  # Máximo de worktrees permitidos (incluyendo main)

# Función para identificar la plataforma del worktree
function Get-WorktreePlatform {
    param([string]$Path)
    
    if ($Path -match "\.cursor[\\/]worktrees") {
        return @{
            Name  = "Cursor IDE"
            Icon  = "🔵"
            Color = "Blue"
            Safe  = $false
        }
    }
    elseif ($Path -match "\.claude-worktrees") {
        return @{
            Name  = "Claude Code"
            Icon  = "🟣"
            Color = "Magenta"
            Safe  = $true
        }
    }
    elseif ($Path -match "\.codex[\\/]worktrees") {
        return @{
            Name  = "GitHub Codex"
            Icon  = "🟢"
            Color = "Green"
            Safe  = $true
        }
    }
    elseif ($Path -match "\.vscode[\\/]worktrees") {
        return @{
            Name  = "VS Code"
            Icon  = "🔷"
            Color = "Cyan"
            Safe  = $true
        }
    }
    elseif ($Path -match "\.antigravity[\\/]worktrees") {
        return @{
            Name  = "AntiGravity"
            Icon  = "🟡"
            Color = "Yellow"
            Safe  = $true
        }
    }
    else {
        return @{
            Name  = "Main Repository"
            Icon  = "⚪"
            Color = "White"
            Safe  = $true
        }
    }
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         CLEANUP WORKTREES - V4.1.0                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Cambiar al directorio del proyecto
Set-Location $PROJECT_PATH

# Listar todos los worktrees
Write-Host "📋 Worktrees actuales:" -ForegroundColor Yellow
Write-Host ""
$worktrees = git worktree list

foreach ($line in $worktrees) {
    if ($line -match '^(.+?)\s+(\w+)\s+\[(.+)\]') {
        $path = $matches[1].Trim()
        $commit = $matches[2]
        $branch = $matches[3]
        $platform = Get-WorktreePlatform -Path $path
        
        Write-Host "   $($platform.Icon) $branch" -ForegroundColor $platform.Color -NoNewline
        Write-Host " [$($platform.Name)]" -ForegroundColor Gray
    }
}

Write-Host ""

# Contar worktrees
$worktreeCount = ($worktrees | Measure-Object -Line).Lines
Write-Host "   Total: $worktreeCount worktree(s)" -ForegroundColor Cyan

if ($worktreeCount -le 1) {
    Write-Host "   ✅ Solo el worktree principal (main) - Estado ideal" -ForegroundColor Green
    Write-Host ""
    exit 0
}

if ($worktreeCount -gt $MAX_WORKTREES) {
    Write-Host "   ⚠️  Excediste el límite de $MAX_WORKTREES worktrees" -ForegroundColor Yellow
    Write-Host ""
}

# Analizar worktrees
Write-Host "🔍 Analizando worktrees..." -ForegroundColor Yellow
Write-Host ""

$worktreesToRemove = @()
$worktreesToKeep = @()

foreach ($line in $worktrees) {
    if ($line -match '\[main\]') {
        Write-Host "   ✅ MANTENER: main (worktree principal)" -ForegroundColor Green
        $worktreesToKeep += $line
        continue
    }
    
    # Extraer path y branch del worktree
    if ($line -match '^(.+?)\s+(\w+)\s+\[(.+)\]') {
        $worktreePath = $matches[1].Trim()
        $commit = $matches[2]
        $branch = $matches[3]
        $platform = Get-WorktreePlatform -Path $worktreePath
        
        # Verificar si la rama está mergeada en main
        $merged = git branch --merged main | Select-String -Pattern $branch
        
        if ($merged) {
            Write-Host "   🗑️  ELIMINAR: $($platform.Icon) $branch" -ForegroundColor Red -NoNewline
            Write-Host " [$($platform.Name)] (ya mergeado en main)" -ForegroundColor Gray
            $worktreesToRemove += @{
                Path     = $worktreePath
                Branch   = $branch
                Platform = $platform.Name
                Reason   = "Merged in main"
            }
        }
        else {
            # Verificar si tiene commits únicos
            $uniqueCommits = git log main..$branch --oneline
            if (-not $uniqueCommits) {
                Write-Host "   🗑️  ELIMINAR: $($platform.Icon) $branch" -ForegroundColor Red -NoNewline
                Write-Host " [$($platform.Name)] (sin commits únicos)" -ForegroundColor Gray
                $worktreesToRemove += @{
                    Path     = $worktreePath
                    Branch   = $branch
                    Platform = $platform.Name
                    Reason   = "No unique commits"
                }
            }
            else {
                Write-Host "   ⚠️  REVISAR: $($platform.Icon) $branch" -ForegroundColor Yellow -NoNewline
                Write-Host " [$($platform.Name)] (tiene commits únicos)" -ForegroundColor Gray
                $worktreesToKeep += $line
            }
        }
    }
}

Write-Host ""

if ($ListOnly) {
    Write-Host "📊 Resumen (solo lectura):" -ForegroundColor Cyan
    Write-Host "   Worktrees a mantener: $($worktreesToKeep.Count)" -ForegroundColor Green
    Write-Host "   Worktrees a eliminar: $($worktreesToRemove.Count)" -ForegroundColor Red
    Write-Host ""
    exit 0
}

# Eliminar worktrees
if ($worktreesToRemove.Count -gt 0) {
    Write-Host "🗑️  Worktrees a eliminar: $($worktreesToRemove.Count)" -ForegroundColor Yellow
    Write-Host ""
    
    if (-not $AutoClean) {
        Write-Host "   ¿Deseas eliminarlos automáticamente? (S/N): " -ForegroundColor Yellow -NoNewline
        $response = Read-Host
    }
    else {
        $response = "S"
    }
    
    if ($response -eq "S" -or $response -eq "s") {
        foreach ($wt in $worktreesToRemove) {
            Write-Host "   Eliminando: $($wt.Branch) [$($wt.Platform)]..." -ForegroundColor Gray -NoNewline
            try {
                git worktree remove $wt.Path --force 2>&1 | Out-Null
                Write-Host " ✅" -ForegroundColor Green
            }
            catch {
                # Si falla con git worktree remove, intentar eliminar manualmente
                Write-Host " ⚠️  (intentando limpieza manual...)" -ForegroundColor Yellow -NoNewline
                Remove-Item $wt.Path -Recurse -Force -ErrorAction SilentlyContinue
                git worktree prune
                Write-Host " ✅" -ForegroundColor Green
            }
        }
        
        Write-Host ""
        Write-Host "✅ Limpieza completada" -ForegroundColor Green
    }
    else {
        Write-Host "   ℹ️  Limpieza cancelada" -ForegroundColor Gray
    }
}
else {
    Write-Host "✅ No hay worktrees obsoletos para eliminar" -ForegroundColor Green
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "💡 Tip: Ejecuta este script semanalmente o usa -AutoClean" -ForegroundColor Gray
Write-Host "   Ejemplo: .\scripts\cleanup-worktrees.ps1 -AutoClean" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""



