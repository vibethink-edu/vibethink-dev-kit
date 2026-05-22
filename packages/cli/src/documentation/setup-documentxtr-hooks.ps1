# Script de Configuración de Git Hooks para DocumentXTR (PowerShell)
# 
# Este script configura git hooks que ejecutan DocumentXTR automáticamente
# en eventos específicos del repositorio en sistemas Windows.
#
# @author AI Pair Platform
# @version 1.0.0

param(
    [switch]$Force,
    [switch]$Help
)

# Función para mostrar ayuda
function Show-Help {
    Write-Host "Script de Configuración de Git Hooks para DocumentXTR" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uso:" -ForegroundColor Yellow
    Write-Host "  .\setup-documentxtr-hooks.ps1 [opciones]" -ForegroundColor White
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Yellow
    Write-Host "  -Force    Forzar la configuración sin confirmaciones" -ForegroundColor White
    Write-Host "  -Help     Mostrar esta ayuda" -ForegroundColor White
    Write-Host ""
    Write-Host "Ejemplos:" -ForegroundColor Yellow
    Write-Host "  .\setup-documentxtr-hooks.ps1" -ForegroundColor White
    Write-Host "  .\setup-documentxtr-hooks.ps1 -Force" -ForegroundColor White
    Write-Host ""
    exit 0
}

# Mostrar ayuda si se solicita
if ($Help) {
    Show-Help
}

# Función para imprimir mensajes con colores
function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Función para verificar si estamos en un repositorio git
function Test-GitRepository {
    if (-not (Test-Path ".git")) {
        Write-ColorMessage "❌ Error: No se encontró un repositorio git en el directorio actual" "Red"
        Write-ColorMessage "💡 Asegúrate de estar en el directorio raíz del proyecto" "Yellow"
        exit 1
    }
    Write-ColorMessage "✅ Repositorio git encontrado" "Green"
}

# Función para crear directorio de hooks si no existe
function New-HooksDirectory {
    if (-not (Test-Path ".git\hooks")) {
        Write-ColorMessage "📁 Creando directorio .git\hooks..." "Yellow"
        New-Item -ItemType Directory -Path ".git\hooks" -Force | Out-Null
    }
    Write-ColorMessage "✅ Directorio de hooks verificado" "Green"
}

# Función para crear hook pre-commit
function New-PreCommitHook {
    Write-ColorMessage "🔧 Configurando hook pre-commit..." "Blue"
    
    $preCommitContent = @'
#!/bin/bash

# Git Hook: pre-commit
# Ejecuta DocumentXTR antes de cada commit para validar documentación
#
# @author AI Pair Platform
# @version 1.0.0

set -e

echo "🚀 Ejecutando DocumentXTR en pre-commit..."

# Verificar si DocumentXTR existe
if [ ! -f "scripts/DocumentXTR.js" ]; then
    echo "❌ Error: DocumentXTR no encontrado en scripts/DocumentXTR.js"
    echo "💡 Asegúrate de que el script existe antes de continuar"
    exit 1
fi

# Ejecutar DocumentXTR
if node scripts/DocumentXTR.js; then
    echo "✅ DocumentXTR ejecutado exitosamente"
    echo "📋 Documentación actualizada antes del commit"
else
    echo "❌ Error: DocumentXTR falló"
    echo "💡 Revisa los errores y corrige antes de hacer commit"
    exit 1
fi

echo "🎉 Commit listo para proceder"
'@

    $preCommitContent | Out-File -FilePath ".git\hooks\pre-commit" -Encoding UTF8
    Write-ColorMessage "✅ Hook pre-commit configurado" "Green"
}

# Función para crear hook post-merge
function New-PostMergeHook {
    Write-ColorMessage "🔧 Configurando hook post-merge..." "Blue"
    
    $postMergeContent = @'
#!/bin/bash

# Git Hook: post-merge
# Ejecuta DocumentXTR después de cada merge para actualizar documentación
#
# @author AI Pair Platform
# @version 1.0.0

set -e

echo "🔄 Ejecutando DocumentXTR en post-merge..."

# Verificar si DocumentXTR existe
if [ ! -f "scripts/DocumentXTR.js" ]; then
    echo "❌ Error: DocumentXTR no encontrado en scripts/DocumentXTR.js"
    echo "💡 Asegúrate de que el script existe antes de continuar"
    exit 1
fi

# Ejecutar DocumentXTR
if node scripts/DocumentXTR.js; then
    echo "✅ DocumentXTR ejecutado exitosamente"
    echo "📋 Documentación actualizada después del merge"
else
    echo "❌ Error: DocumentXTR falló"
    echo "💡 Revisa los errores y corrige manualmente"
    exit 1
fi

echo "🎉 Merge completado y documentación actualizada"
'@

    $postMergeContent | Out-File -FilePath ".git\hooks\post-merge" -Encoding UTF8
    Write-ColorMessage "✅ Hook post-merge configurado" "Green"
}

# Función para crear hook post-checkout
function New-PostCheckoutHook {
    Write-ColorMessage "🔧 Configurando hook post-checkout..." "Blue"
    
    $postCheckoutContent = @'
#!/bin/bash

# Git Hook: post-checkout
# Ejecuta DocumentXTR después de cada checkout para sincronizar documentación
#
# @author AI Pair Platform
# @version 1.0.0

set -e

echo "📂 Ejecutando DocumentXTR en post-checkout..."

# Verificar si DocumentXTR existe
if [ ! -f "scripts/DocumentXTR.js" ]; then
    echo "❌ Error: DocumentXTR no encontrado en scripts/DocumentXTR.js"
    echo "💡 Asegúrate de que el script existe antes de continuar"
    exit 1
fi

# Ejecutar DocumentXTR
if node scripts/DocumentXTR.js; then
    echo "✅ DocumentXTR ejecutado exitosamente"
    echo "📋 Documentación sincronizada con la nueva rama"
else
    echo "❌ Error: DocumentXTR falló"
    echo "💡 Revisa los errores y corrige manualmente"
    exit 1
fi

echo "🎉 Checkout completado y documentación sincronizada"
'@

    $postCheckoutContent | Out-File -FilePath ".git\hooks\post-checkout" -Encoding UTF8
    Write-ColorMessage "✅ Hook post-checkout configurado" "Green"
}

# Función para crear hook post-commit
function New-PostCommitHook {
    Write-ColorMessage "🔧 Configurando hook post-commit..." "Blue"
    
    $postCommitContent = @'
#!/bin/bash

# Git Hook: post-commit
# Ejecuta DocumentXTR después de cada commit para generar reporte final
#
# @author AI Pair Platform
# @version 1.0.0

set -e

echo "💾 Ejecutando DocumentXTR en post-commit..."

# Verificar si DocumentXTR existe
if [ ! -f "scripts/DocumentXTR.js" ]; then
    echo "❌ Error: DocumentXTR no encontrado en scripts/DocumentXTR.js"
    echo "💡 Asegúrate de que el script existe antes de continuar"
    exit 1
fi

# Ejecutar DocumentXTR
if node scripts/DocumentXTR.js; then
    echo "✅ DocumentXTR ejecutado exitosamente"
    echo "📊 Reporte final generado después del commit"
else
    echo "❌ Error: DocumentXTR falló"
    echo "💡 Revisa los errores y corrige manualmente"
    exit 1
fi

echo "🎉 Commit completado y reporte final generado"
'@

    $postCommitContent | Out-File -FilePath ".git\hooks\post-commit" -Encoding UTF8
    Write-ColorMessage "✅ Hook post-commit configurado" "Green"
}

# Función para crear hook prepare-commit-msg
function New-PrepareCommitMsgHook {
    Write-ColorMessage "🔧 Configurando hook prepare-commit-msg..." "Blue"
    
    $prepareCommitMsgContent = @'
#!/bin/bash

# Git Hook: prepare-commit-msg
# Prepara el mensaje de commit con información de DocumentXTR
#
# @author AI Pair Platform
# @version 1.0.0

set -e

COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2
SHA1=$3

echo "📝 Preparando mensaje de commit..."

# Agregar información de DocumentXTR al mensaje de commit
if [ -f "docs/xtr-report.json" ]; then
    echo "" >> "$COMMIT_MSG_FILE"
    echo "# DocumentXTR Report" >> "$COMMIT_MSG_FILE"
    echo "# Generated: $(date)" >> "$COMMIT_MSG_FILE"
    echo "# Version: $(node -p "require('./package.json').version" 2>/dev/null || echo 'unknown')" >> "$COMMIT_MSG_FILE"
    echo "" >> "$COMMIT_MSG_FILE"
fi

echo "✅ Mensaje de commit preparado"
'@

    $prepareCommitMsgContent | Out-File -FilePath ".git\hooks\prepare-commit-msg" -Encoding UTF8
    Write-ColorMessage "✅ Hook prepare-commit-msg configurado" "Green"
}

# Función para verificar que DocumentXTR existe
function Test-DocumentXTR {
    if (-not (Test-Path "scripts\DocumentXTR.js")) {
        Write-ColorMessage "❌ Error: DocumentXTR no encontrado en scripts\DocumentXTR.js" "Red"
        Write-ColorMessage "💡 Asegúrate de que el script existe antes de configurar los hooks" "Yellow"
        exit 1
    }
    Write-ColorMessage "✅ DocumentXTR encontrado en scripts\DocumentXTR.js" "Green"
}

# Función para mostrar información de configuración
function Show-ConfigurationInfo {
    Write-ColorMessage "📋 Información de Configuración:" "Blue"
    Write-Host ""
    Write-Host "🔧 Hooks configurados:"
    Write-Host "   - pre-commit: Ejecuta DocumentXTR antes de cada commit"
    Write-Host "   - post-merge: Ejecuta DocumentXTR después de cada merge"
    Write-Host "   - post-checkout: Ejecuta DocumentXTR después de cada checkout"
    Write-Host "   - post-commit: Ejecuta DocumentXTR después de cada commit"
    Write-Host "   - prepare-commit-msg: Prepara mensaje de commit"
    Write-Host ""
    Write-Host "📁 Archivos creados:"
    Write-Host "   - .git\hooks\pre-commit"
    Write-Host "   - .git\hooks\post-merge"
    Write-Host "   - .git\hooks\post-checkout"
    Write-Host "   - .git\hooks\post-commit"
    Write-Host "   - .git\hooks\prepare-commit-msg"
    Write-Host ""
    Write-Host "🚀 DocumentXTR se ejecutará automáticamente en:"
    Write-Host "   - Antes de cada commit (validación)"
    Write-Host "   - Después de cada merge (actualización)"
    Write-Host "   - Después de cada checkout (sincronización)"
    Write-Host "   - Después de cada commit (reporte final)"
    Write-Host ""
    Write-ColorMessage "✅ Configuración completada exitosamente" "Green"
}

# Función para mostrar instrucciones de uso
function Show-UsageInstructions {
    Write-ColorMessage "📖 Instrucciones de Uso:" "Blue"
    Write-Host ""
    Write-Host "1. Los hooks se ejecutarán automáticamente en los eventos git correspondientes"
    Write-Host "2. Si DocumentXTR falla, el commit/merge/checkout será bloqueado"
    Write-Host "3. Para saltar los hooks temporalmente, usa:"
    Write-Host "   git commit --no-verify"
    Write-Host "   git merge --no-verify"
    Write-Host ""
    Write-Host "4. Para deshabilitar un hook específico:"
    Write-Host "   Remove-Item .git\hooks\pre-commit"
    Write-Host ""
    Write-Host "5. Para verificar el estado de los hooks:"
    Write-Host "   Get-ChildItem .git\hooks\"
    Write-Host ""
    Write-ColorMessage "💡 Recuerda: Los hooks mejoran la calidad del código y documentación" "Yellow"
}

# Función para confirmar configuración
function Confirm-Configuration {
    if (-not $Force) {
        Write-ColorMessage "⚠️  ¿Estás seguro de que quieres configurar los git hooks?" "Yellow"
        Write-Host "Esto sobrescribirá cualquier configuración existente de hooks." -ForegroundColor White
        $response = Read-Host "¿Continuar? (y/N)"
        
        if ($response -ne "y" -and $response -ne "Y") {
            Write-ColorMessage "❌ Configuración cancelada" "Red"
            exit 0
        }
    }
}

# Función principal
function Main {
    Write-ColorMessage "🚀 Configurando Git Hooks para DocumentXTR" "Blue"
    Write-Host ""
    
    # Verificaciones iniciales
    Test-GitRepository
    Test-DocumentXTR
    
    # Confirmar configuración
    Confirm-Configuration
    
    # Crear directorio de hooks
    New-HooksDirectory
    
    # Configurar hooks
    New-PreCommitHook
    New-PostMergeHook
    New-PostCheckoutHook
    New-PostCommitHook
    New-PrepareCommitMsgHook
    
    Write-Host ""
    Show-ConfigurationInfo
    Write-Host ""
    Show-UsageInstructions
    Write-Host ""
    Write-ColorMessage "🎉 ¡Configuración completada! DocumentXTR se ejecutará automáticamente" "Green"
}

# Ejecutar función principal
Main 