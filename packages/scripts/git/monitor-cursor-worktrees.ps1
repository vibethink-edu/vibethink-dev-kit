# ============================================================================
# MONITOR CURSOR WORKTREES - V3.0.1
# ============================================================================
# Script para detectar y eliminar worktrees de Cursor automáticamente
# Mantiene los worktrees de Claude Code intactos
# ============================================================================

$CURSOR_WORKTREES = "C:\Users\marce\.cursor\worktrees"
$CLAUDE_WORKTREES = "C:\Users\marce\.claude-worktrees"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         CURSOR WORKTREES MONITOR - V3.0.1                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar worktrees de Cursor
if (Test-Path $CURSOR_WORKTREES) {
    Write-Host "⚠️  Worktrees de Cursor detectados!" -ForegroundColor Yellow
    Write-Host "   Path: $CURSOR_WORKTREES" -ForegroundColor Gray
    Write-Host ""
    
    $items = Get-ChildItem $CURSOR_WORKTREES -Recurse -Force
    Write-Host "   Items encontrados: $($items.Count)" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "   ¿Deseas eliminarlos? (S/N): " -ForegroundColor Yellow -NoNewline
    $response = Read-Host
    
    if ($response -eq "S" -or $response -eq "s") {
        Remove-Item $CURSOR_WORKTREES -Recurse -Force
        Write-Host "   ✅ Worktrees de Cursor eliminados" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  Worktrees de Cursor mantenidos" -ForegroundColor Gray
    }
} else {
    Write-Host "✅ No hay worktrees de Cursor" -ForegroundColor Green
}

Write-Host ""

# Verificar worktrees de Claude Code (solo informativo)
if (Test-Path $CLAUDE_WORKTREES) {
    Write-Host "ℹ️  Worktrees de Claude Code detectados (esto es normal)" -ForegroundColor Cyan
    Write-Host "   Path: $CLAUDE_WORKTREES" -ForegroundColor Gray
    
    $claudeWorktrees = git worktree list | Select-String "claude-worktrees"
    if ($claudeWorktrees) {
        Write-Host "   Worktrees activos:" -ForegroundColor Gray
        $claudeWorktrees | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    }
} else {
    Write-Host "ℹ️  No hay worktrees de Claude Code" -ForegroundColor Gray
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "💡 Tip: Ejecuta este script semanalmente para mantener limpio" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""















