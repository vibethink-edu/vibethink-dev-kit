# Script para aplicar migración de billing
# Uso: .\scripts\apply-billing-migration.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$Password
)

Write-Host "🔧 Aplicando migración de billing..." -ForegroundColor Green

try {
    # Aplicar migración con la contraseña proporcionada
    npx supabase db push --password $Password
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migración aplicada exitosamente!" -ForegroundColor Green
        Write-Host "📊 Sistema de billing configurado y listo para usar" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Error al aplicar la migración" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 ¡Proceso completado!" -ForegroundColor Green 