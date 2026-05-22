# ============================================================================
# GIT UPDATE - V2.27.1
# ============================================================================
# Complete Git workflow: Add, Commit, and Push to GitHub
# With full worktree protection
# ============================================================================

param(
    [string]$Message = "",
    [switch]$NoPush
)

# ============================================================================
# CONFIGURATION - ABSOLUTE PATH (NO WORKTREE)
# ============================================================================
$PROJECT_PATH = "C:\IA Marcelo Labs\v3-andres-cantor-fdp-voice-agent"

# ============================================================================
# PATH VERIFICATION (ANTI-WORKTREE)
# ============================================================================
function Test-CorrectPath {
    $currentPath = Get-Location
    if ($currentPath.Path -match "worktrees") {
        Write-Host ""
        Write-Host "❌ ERROR: You are in a worktree!" -ForegroundColor Red
        Write-Host "   Current path: $($currentPath.Path)" -ForegroundColor Yellow
        Write-Host "   Correct path: $PROJECT_PATH" -ForegroundColor Green
        Write-Host ""
        Write-Host "   Run first: cd `"$PROJECT_PATH`"" -ForegroundColor Cyan
        Write-Host ""
        exit 1
    }
    
    if (-not (Test-Path $PROJECT_PATH)) {
        Write-Host ""
        Write-Host "❌ ERROR: Project does not exist at: $PROJECT_PATH" -ForegroundColor Red
        Write-Host ""
        exit 1
    }
    
    # Change to correct directory
    Set-Location $PROJECT_PATH
}

# ============================================================================
# READ VERSION FROM types.ts
# ============================================================================
function Get-AppVersion {
    $typesPath = Join-Path $PROJECT_PATH "types.ts"
    
    if (-not (Test-Path $typesPath)) {
        Write-Host "⚠️  WARNING: types.ts not found" -ForegroundColor Yellow
        return @{ Version = "unknown"; Descriptor = "" }
    }
    
    $typesContent = Get-Content $typesPath -Raw
    
    $version = "unknown"
    $descriptor = ""
    
    if ($typesContent -match "APP_VERSION_NUMBER\s*=\s*'([^']+)'") {
        $version = $matches[1]
    }
    
    if ($typesContent -match "APP_VERSION_DESCRIPTOR\s*=\s*'([^']+)'") {
        $descriptor = $matches[1]
    }
    
    return @{
        Version = $version
        Descriptor = $descriptor
    }
}

# ============================================================================
# VERIFY GIT STATUS
# ============================================================================
function Test-GitStatus {
    $status = git status --porcelain
    
    if ([string]::IsNullOrWhiteSpace($status)) {
        Write-Host ""
        Write-Host "ℹ️  No changes to commit" -ForegroundColor Gray
        Write-Host ""
        return $false
    }
    
    return $true
}

# ============================================================================
# VERIFY NO WORKTREES EXIST
# ============================================================================
function Test-NoWorktrees {
    Write-Host "🔍 Verifying no worktrees exist..." -ForegroundColor Cyan
    
    # Check Cursor worktrees directory
    $cursorWorktreesPath = "C:\Users\marce\.cursor\worktrees"
    if (Test-Path $cursorWorktreesPath) {
        Write-Host ""
        Write-Host "❌ ERROR: Cursor worktrees directory still exists!" -ForegroundColor Red
        Write-Host "   Path: $cursorWorktreesPath" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   Run cleanup first:" -ForegroundColor Cyan
        Write-Host "   .\scripts\cleanup_worktrees.ps1" -ForegroundColor Cyan
        Write-Host ""
        return $false
    }
    
    # Check Git worktrees
    $worktreeList = git worktree list 2>&1
    if ($worktreeList -match "worktrees") {
        Write-Host ""
        Write-Host "❌ ERROR: Git still has worktrees registered!" -ForegroundColor Red
        Write-Host $worktreeList -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   Run cleanup first:" -ForegroundColor Cyan
        Write-Host "   .\scripts\cleanup_worktrees.ps1" -ForegroundColor Cyan
        Write-Host ""
        return $false
    }
    
    Write-Host "   ✅ No worktrees found" -ForegroundColor Green
    return $true
}

# ============================================================================
# MAIN SCRIPT
# ============================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              GIT UPDATE - V2.27.1                          ║" -ForegroundColor Cyan
Write-Host "║         (Add + Commit + Push to GitHub)                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Verify we're not in a worktree
Test-CorrectPath

# 2. Verify no worktrees exist
if (-not (Test-NoWorktrees)) {
    exit 1
}

# 3. Verify there are changes
if (-not (Test-GitStatus)) {
    exit 0
}

# 4. Read version
$appInfo = Get-AppVersion
Write-Host "📋 Current version: $($appInfo.Version)" -ForegroundColor Cyan
Write-Host "📝 Descriptor: $($appInfo.Descriptor)" -ForegroundColor Cyan
Write-Host ""

# 5. Build commit message
if ([string]::IsNullOrEmpty($Message)) {
    $commitMsg = "v$($appInfo.Version): $($appInfo.Descriptor)"
} else {
    $commitMsg = "v$($appInfo.Version): $Message"
}

# 6. Show modified files
Write-Host "📂 Modified files:" -ForegroundColor Yellow
git status --short
Write-Host ""

# 7. Add changes
Write-Host "📦 Adding changes..." -ForegroundColor Cyan
git add -A

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error adding changes" -ForegroundColor Red
    exit 1
}

# 8. Commit
Write-Host "💾 Commit: $commitMsg" -ForegroundColor Green
git commit -m $commitMsg

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error committing" -ForegroundColor Red
    exit 1
}

# 9. Push (if not specified -NoPush)
if (-not $NoPush) {
    Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
    git push
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error pushing to GitHub" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Tip: Check your internet connection and repository permissions" -ForegroundColor Gray
        Write-Host ""
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ Commit and Push completed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✅ Commit completed (no push)" -ForegroundColor Green
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "💡 Tip: To view commit history, run:" -ForegroundColor Gray
Write-Host "   git log --oneline -10" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""


