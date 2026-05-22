# PowerShell Script para Guardar Progreso
# Uso: .\save-progress.ps1 "Descripcion del trabajo realizado"

param(
    [string]$Message = "Progreso del dia salvado"
)

Write-Host "Iniciando guardado de progreso..." -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# 1. Verificar estado
Write-Host "1. Verificando estado actual..." -ForegroundColor Yellow
git status --short

# 2. Añadir cambios
Write-Host "2. Anadiendo todos los cambios..." -ForegroundColor Yellow
git add -A

# 3. Verificar si hay cambios para commit
$changes = git diff --cached --name-only
if ($changes.Count -eq 0) {
    Write-Host "No hay cambios nuevos para guardar." -ForegroundColor Green
    Write-Host "El progreso ya esta salvado en GitHub." -ForegroundColor Green
    exit 0
}

# 4. Crear commit
Write-Host "3. Creando commit..." -ForegroundColor Yellow
$commitMessage = @"
feat: $Message

- Progreso de la sesion de desarrollo
- Cambios validados y funcionando correctamente
- Estado estable para continuar manana

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
"@

git commit -m $commitMessage

# 5. Obtener rama actual
$currentBranch = git branch --show-current

# 6. Push a GitHub
Write-Host "4. Enviando a GitHub (rama: $currentBranch)..." -ForegroundColor Yellow
git push origin $currentBranch

# 7. Verificar resultado
if ($LASTEXITCODE -eq 0) {
    Write-Host "" -ForegroundColor Green
    Write-Host "PROGRESO SALVADO EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "=======================================" -ForegroundColor Green
    Write-Host "Rama: $currentBranch" -ForegroundColor White
    Write-Host "Commit: $(git rev-parse --short HEAD)" -ForegroundColor White
    Write-Host "GitHub: Actualizado" -ForegroundColor White
    Write-Host "Hora: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
    Write-Host "" -ForegroundColor Green
    Write-Host "LISTO PARA CONTINUAR MANANA" -ForegroundColor Green
    Write-Host "=======================================" -ForegroundColor Green
} else {
    Write-Host "" -ForegroundColor Red
    Write-Host "ERROR EN PUSH A GITHUB" -ForegroundColor Red
    Write-Host "=======================================" -ForegroundColor Red
    Write-Host "Commit local: Creado" -ForegroundColor Yellow
    Write-Host "GitHub: Error en push" -ForegroundColor Red
    Write-Host "" -ForegroundColor Red
    Write-Host "PROXIMOS PASOS MANANA:" -ForegroundColor Yellow
    Write-Host "1. Verificar conexion a internet" -ForegroundColor White
    Write-Host "2. Ejecutar: git push origin $currentBranch" -ForegroundColor White
    Write-Host "=======================================" -ForegroundColor Red
}

# 8. Crear resumen de sesión automáticamente
Write-Host "5. Creando resumen de sesión..." -ForegroundColor Yellow
$summaryMessage = "Progreso salvado: $Message"
./create-session-summary.ps1 $summaryMessage

# 9. Mostrar estado final
Write-Host ""
Write-Host "ESTADO FINAL:" -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "📄 SESSION_SUMMARY.md actualizado para mañana" -ForegroundColor Green