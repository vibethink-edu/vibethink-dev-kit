# ============================================================================
# VERIFY NO WORKTREE - V1.1.0
# ============================================================================
# Script rápido para verificar que solo existe el worktree principal (main)
# Útil antes de operaciones críticas como deploy o merge
# Identifica la plataforma de cada worktree (Cursor, Claude Code, etc.)
# ============================================================================

$PROJECT_PATH = "C:\IA Marcelo Labs\v3-andres-cantor-fdp-voice-agent"

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
Write-Host "║         VERIFY NO WORKTREE - V1.1.0                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Cambiar al directorio del proyecto
Set-Location $PROJECT_PATH

# Listar worktrees
$worktrees = git worktree list
$worktreeCount = ($worktrees | Measure-Object -Line).Lines

Write-Host "📋 Worktrees detectados: $worktreeCount" -ForegroundColor Yellow
Write-Host ""

if ($worktreeCount -eq 1) {
    # Solo main existe
    Write-Host "✅ ESTADO IDEAL: Solo el worktree principal (main)" -ForegroundColor Green
    Write-Host ""
    
    foreach ($line in $worktrees) {
        if ($line -match '^(.+?)\s+(\w+)\s+\[(.+)\]') {
            $path = $matches[1].Trim()
            $commit = $matches[2]
            $branch = $matches[3]
            $platform = Get-WorktreePlatform -Path $path
            
            Write-Host "   $($platform.Icon) $branch" -ForegroundColor $platform.Color -NoNewline
            Write-Host " [$($platform.Name)]" -ForegroundColor Gray
            Write-Host "      Path: $path" -ForegroundColor DarkGray
        }
    }
    
    Write-Host ""
    Write-Host "✅ Verificación exitosa - Listo para operaciones críticas" -ForegroundColor Green
    Write-Host ""
    exit 0
}
else {
    # Hay worktrees adicionales
    Write-Host "⚠️  ADVERTENCIA: Se detectaron worktrees adicionales" -ForegroundColor Yellow
    Write-Host ""
    
    $cursorWorktrees = 0
    $claudeWorktrees = 0
    $otherWorktrees = 0
    
    foreach ($line in $worktrees) {
        if ($line -match '^(.+?)\s+(\w+)\s+\[(.+)\]') {
            $path = $matches[1].Trim()
            $commit = $matches[2]
            $branch = $matches[3]
            $platform = Get-WorktreePlatform -Path $path
            
            # Contar por plataforma
            if ($platform.Name -eq "Cursor IDE") { $cursorWorktrees++ }
            elseif ($platform.Name -eq "Claude Code") { $claudeWorktrees++ }
            elseif ($platform.Name -ne "Main Repository") { $otherWorktrees++ }
            
            # Mostrar con color según seguridad
            $statusIcon = if ($platform.Safe) { "✅" } else { "⚠️ " }
            Write-Host "   $statusIcon $($platform.Icon) $branch" -ForegroundColor $platform.Color -NoNewline
            Write-Host " [$($platform.Name)]" -ForegroundColor Gray
            Write-Host "      Path: $path" -ForegroundColor DarkGray
            
            if (-not $platform.Safe) {
                Write-Host "      ⚠️  Worktree temporal - Recomendado eliminar" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host ""
    Write-Host "📊 Resumen por plataforma:" -ForegroundColor Cyan
    if ($cursorWorktrees -gt 0) {
        Write-Host "   🔵 Cursor IDE: $cursorWorktrees worktree(s) - ⚠️  Temporales" -ForegroundColor Yellow
    }
    if ($claudeWorktrees -gt 0) {
        Write-Host "   🟣 Claude Code: $claudeWorktrees worktree(s) - ✅ Normales" -ForegroundColor Green
    }
    if ($otherWorktrees -gt 0) {
        Write-Host "   🔷 Otros: $otherWorktrees worktree(s)" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "❌ Verificación fallida - Limpia los worktrees antes de continuar" -ForegroundColor Red
    Write-Host ""
    
    if ($cursorWorktrees -gt 0) {
        Write-Host "💡 Cursor worktrees detectados:" -ForegroundColor Cyan
        Write-Host "   Ejecuta: .\scripts\monitor-cursor-worktrees.ps1" -ForegroundColor Cyan
    }
    
    Write-Host "💡 Para limpiar todos los worktrees obsoletos:" -ForegroundColor Cyan
    Write-Host "   Ejecuta: .\scripts\cleanup-worktrees.ps1 -AutoClean" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}
