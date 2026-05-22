# Script de validacion de root limpio
# VThink 1.0 - Validacion de estructura del repositorio

param(
    [switch]$Fix = $false,
    [switch]$Report = $false,
    [switch]$Strict = $false
)

Write-Host "Validando limpieza del root..." -ForegroundColor Green

# Archivos permitidos en el root
$allowedFiles = @(
    # Configuracion del proyecto
    "package.json", "package-lock.json", "lerna.json",
    "tsconfig.json", "tsconfig.app.json", "tsconfig.node.json",
    "next.config.js", "tailwind.config.ts", "postcss.config.js",
    "eslint.config.js", ".eslintrc.js", ".editorconfig",
    "vitest.config.ts", "vitest.e2e.config.ts", "playwright.config.ts",
    
    # Configuracion de git y CI/CD
    ".gitignore", ".gitattributes", ".github/",
    ".husky/", ".vscode/", ".cursor/",
    
    # Documentacion principal
    "README.md", "CHANGELOG.md", "CODE_OF_CONDUCT.md",
    "CONTRIBUTING.md", "LICENSE", "SECURITY.md",
    
    # Configuracion de entorno
    "env.example", "next-env.d.ts",
    
    # Configuracion de herramientas
    ".cursorrules", ".dartai.config.json",
    "components.json", "ViveThink-Orchestrator-main.code-workspace",
    
    # Directorios principales
    "src/", "apps/", "bundui/", "external/",
    "docs/", "tests/", "public/", "reports/",
    "projects/", "dev-portal/", "dev-tools/",
    "docusaurus-docs/", "docusaurus-dev/", "docusaurus-api/",
    "docusaurus-vthink/", "docusaurus-archives/",
    "supabase/", "traefik/", "node_modules/",
    ".git/", ".next/"
)

# Extensiones prohibidas en el root
$prohibitedExtensions = @(
    ".js", ".ts", ".ps1", ".cjs", ".sh", ".py", ".sql",
    ".log", ".tmp", ".temp", ".bak", ".backup"
)

# Archivos temporales prohibidos
$prohibitedPatterns = @(
    "*test*", "*temp*", "*tmp*", "*backup*", "*log*",
    "*debug*", "*dev*", "*script*", "*util*"
)

$issues = @()
$warnings = @()

# Funcion para verificar archivos en el root
function Test-RootFiles {
    Write-Host "Verificando archivos en el root..." -ForegroundColor Yellow
    
    $rootFiles = Get-ChildItem -Path "." -File | Where-Object { 
        $_.Name -notin $allowedFiles -and 
        $_.Name -notlike ".*" -and 
        $_.Name -notlike "*.md" -and
        $_.Name -notlike "*.json" -and
        $_.Name -notlike "*.js" -and
        $_.Name -notlike "*.ts" -and
        $_.Name -notlike "*.config.*"
    }
    
    foreach ($file in $rootFiles) {
        $issues += "Archivo no permitido en root: $($file.Name)"
    }
}

# Funcion para verificar extensiones prohibidas
function Test-ProhibitedExtensions {
    Write-Host "Verificando extensiones prohibidas..." -ForegroundColor Yellow
    
    foreach ($ext in $prohibitedExtensions) {
        $files = Get-ChildItem -Path "." -File -Filter "*$ext" | Where-Object {
            $_.Name -notin $allowedFiles
        }
        
        foreach ($file in $files) {
            $issues += "Extension prohibida en root: $($file.Name)"
        }
    }
}

# Funcion para verificar patrones prohibidos
function Test-ProhibitedPatterns {
    Write-Host "Verificando patrones prohibidos..." -ForegroundColor Yellow
    
    foreach ($pattern in $prohibitedPatterns) {
        $files = Get-ChildItem -Path "." -File -Filter "*$pattern*" | Where-Object {
            $_.Name -notin $allowedFiles
        }
        
        foreach ($file in $files) {
            $warnings += "Patron sospechoso en root: $($file.Name)"
        }
    }
}

# Funcion para verificar estructura de directorios
function Test-DirectoryStructure {
    Write-Host "Verificando estructura de directorios..." -ForegroundColor Yellow
    
    $expectedDirs = @(
        "src", "apps", "docs", "tests", "public", "reports",
        "dev-tools", "docusaurus-docs", "docusaurus-dev",
        "docusaurus-api", "docusaurus-vthink", "docusaurus-archives"
    )
    
    foreach ($dir in $expectedDirs) {
        if (!(Test-Path $dir)) {
            $warnings += "Directorio esperado no encontrado: $dir"
        }
    }
    
    # Verificar que no hay scripts sueltos
    $scriptDirs = Get-ChildItem -Path "." -Directory | Where-Object {
        $_.Name -like "*script*" -or $_.Name -like "*util*" -or $_.Name -like "*tool*"
    }
    
    foreach ($dir in $scriptDirs) {
        if ($dir.Name -ne "dev-tools") {
            $issues += "Directorio de scripts no debe estar en root: $($dir.Name)"
        }
    }
}

# Funcion para generar reporte
function Show-Report {
    Write-Host "Reporte de Validacion del Root" -ForegroundColor Cyan
    Write-Host "===============================" -ForegroundColor Cyan
    
    if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
        Write-Host "Root completamente limpio!" -ForegroundColor Green
        return $true
    }
    
    if ($issues.Count -gt 0) {
        Write-Host "Problemas encontrados:" -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host "  • $issue" -ForegroundColor Red
        }
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "Advertencias:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  • $warning" -ForegroundColor Yellow
        }
    }
    
    Write-Host "Recomendaciones:" -ForegroundColor Cyan
    Write-Host "  • Mover scripts a dev-tools/ apropiado" -ForegroundColor White
    Write-Host "  • Usar .gitignore para archivos temporales" -ForegroundColor White
    Write-Host "  • Documentar archivos permitidos en root" -ForegroundColor White
    
    return $false
}

# Funcion para mover archivos automaticamente
function Move-ProhibitedFiles {
    Write-Host "Moviendo archivos prohibidos..." -ForegroundColor Yellow
    
    $movedCount = 0
    
    # Mover scripts JS/TS
    $jsFiles = Get-ChildItem -Path "." -File -Filter "*.js" | Where-Object {
        $_.Name -notin $allowedFiles
    }
    foreach ($file in $jsFiles) {
        $targetPath = "dev-tools/utilities/$($file.Name)"
        Move-Item $file.FullName $targetPath -Force
        Write-Host "  Movido: $($file.Name) a dev-tools/utilities/" -ForegroundColor Green
        $movedCount++
    }
    
    # Mover scripts PS1
    $ps1Files = Get-ChildItem -Path "." -File -Filter "*.ps1" | Where-Object {
        $_.Name -notin $allowedFiles
    }
    foreach ($file in $ps1Files) {
        $targetPath = "dev-tools/utilities/$($file.Name)"
        Move-Item $file.FullName $targetPath -Force
        Write-Host "  Movido: $($file.Name) a dev-tools/utilities/" -ForegroundColor Green
        $movedCount++
    }
    
    # Mover otros archivos
    $otherFiles = Get-ChildItem -Path "." -File | Where-Object {
        $_.Name -notin $allowedFiles -and
        $_.Name -notlike ".*" -and
        $_.Name -notlike "*.md" -and
        $_.Name -notlike "*.json" -and
        $_.Name -notlike "*.config.*"
    }
    foreach ($file in $otherFiles) {
        $targetPath = "dev-tools/utilities/$($file.Name)"
        Move-Item $file.FullName $targetPath -Force
        Write-Host "  Movido: $($file.Name) a dev-tools/utilities/" -ForegroundColor Green
        $movedCount++
    }
    
    if ($movedCount -gt 0) {
        Write-Host "$movedCount archivos movidos a dev-tools/utilities/" -ForegroundColor Green
    } else {
        Write-Host "No se encontraron archivos para mover" -ForegroundColor Green
    }
}

# Ejecutar validaciones
Test-RootFiles
Test-ProhibitedExtensions
Test-ProhibitedPatterns
Test-DirectoryStructure

# Mostrar reporte
$isClean = Show-Report

# Mover archivos si se solicita
if ($Fix -and $issues.Count -gt 0) {
    Move-ProhibitedFiles
    Write-Host "Ejecutando validacion post-fix..." -ForegroundColor Yellow
    $issues.Clear()
    $warnings.Clear()
    Test-RootFiles
    Test-ProhibitedExtensions
    Test-ProhibitedPatterns
    Test-DirectoryStructure
    Show-Report
}

# Salir con codigo de error si hay problemas
if ($Strict -and $issues.Count -gt 0) {
    Write-Host "Validacion fallida en modo estricto" -ForegroundColor Red
    exit 1
}

Write-Host "Validacion completada" -ForegroundColor Green 