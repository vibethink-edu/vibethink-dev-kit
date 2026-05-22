#!/bin/bash

# Script de Configuración de Git Hooks para DocumentXTR
# 
# Este script configura git hooks que ejecutan DocumentXTR automáticamente
# en eventos específicos del repositorio.
#
# @author AI Pair Platform
# @version 1.0.0

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Función para verificar si estamos en un repositorio git
check_git_repo() {
    if [ ! -d ".git" ]; then
        print_message $RED "❌ Error: No se encontró un repositorio git en el directorio actual"
        print_message $YELLOW "💡 Asegúrate de estar en el directorio raíz del proyecto"
        exit 1
    fi
    print_message $GREEN "✅ Repositorio git encontrado"
}

# Función para crear directorio de hooks si no existe
create_hooks_directory() {
    if [ ! -d ".git/hooks" ]; then
        print_message $YELLOW "📁 Creando directorio .git/hooks..."
        mkdir -p .git/hooks
    fi
    print_message $GREEN "✅ Directorio de hooks verificado"
}

# Función para crear hook pre-commit
create_pre_commit_hook() {
    print_message $BLUE "🔧 Configurando hook pre-commit..."
    
    cat > .git/hooks/pre-commit << 'EOF'
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
EOF

    chmod +x .git/hooks/pre-commit
    print_message $GREEN "✅ Hook pre-commit configurado"
}

# Función para crear hook post-merge
create_post_merge_hook() {
    print_message $BLUE "🔧 Configurando hook post-merge..."
    
    cat > .git/hooks/post-merge << 'EOF'
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
EOF

    chmod +x .git/hooks/post-merge
    print_message $GREEN "✅ Hook post-merge configurado"
}

# Función para crear hook post-checkout
create_post_checkout_hook() {
    print_message $BLUE "🔧 Configurando hook post-checkout..."
    
    cat > .git/hooks/post-checkout << 'EOF'
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
EOF

    chmod +x .git/hooks/post-checkout
    print_message $GREEN "✅ Hook post-checkout configurado"
}

# Función para crear hook post-commit
create_post_commit_hook() {
    print_message $BLUE "🔧 Configurando hook post-commit..."
    
    cat > .git/hooks/post-commit << 'EOF'
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
EOF

    chmod +x .git/hooks/post-commit
    print_message $GREEN "✅ Hook post-commit configurado"
}

# Función para crear hook prepare-commit-msg
create_prepare_commit_msg_hook() {
    print_message $BLUE "🔧 Configurando hook prepare-commit-msg..."
    
    cat > .git/hooks/prepare-commit-msg << 'EOF'
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
EOF

    chmod +x .git/hooks/prepare-commit-msg
    print_message $GREEN "✅ Hook prepare-commit-msg configurado"
}

# Función para verificar que DocumentXTR existe
verify_documentxtr() {
    if [ ! -f "scripts/DocumentXTR.js" ]; then
        print_message $RED "❌ Error: DocumentXTR no encontrado en scripts/DocumentXTR.js"
        print_message $YELLOW "💡 Asegúrate de que el script existe antes de configurar los hooks"
        exit 1
    fi
    print_message $GREEN "✅ DocumentXTR encontrado en scripts/DocumentXTR.js"
}

# Función para mostrar información de configuración
show_configuration_info() {
    print_message $BLUE "📋 Información de Configuración:"
    echo ""
    echo "🔧 Hooks configurados:"
    echo "   - pre-commit: Ejecuta DocumentXTR antes de cada commit"
    echo "   - post-merge: Ejecuta DocumentXTR después de cada merge"
    echo "   - post-checkout: Ejecuta DocumentXTR después de cada checkout"
    echo "   - post-commit: Ejecuta DocumentXTR después de cada commit"
    echo "   - prepare-commit-msg: Prepara mensaje de commit"
    echo ""
    echo "📁 Archivos creados:"
    echo "   - .git/hooks/pre-commit"
    echo "   - .git/hooks/post-merge"
    echo "   - .git/hooks/post-checkout"
    echo "   - .git/hooks/post-commit"
    echo "   - .git/hooks/prepare-commit-msg"
    echo ""
    echo "🚀 DocumentXTR se ejecutará automáticamente en:"
    echo "   - Antes de cada commit (validación)"
    echo "   - Después de cada merge (actualización)"
    echo "   - Después de cada checkout (sincronización)"
    echo "   - Después de cada commit (reporte final)"
    echo ""
    print_message $GREEN "✅ Configuración completada exitosamente"
}

# Función para mostrar instrucciones de uso
show_usage_instructions() {
    print_message $BLUE "📖 Instrucciones de Uso:"
    echo ""
    echo "1. Los hooks se ejecutarán automáticamente en los eventos git correspondientes"
    echo "2. Si DocumentXTR falla, el commit/merge/checkout será bloqueado"
    echo "3. Para saltar los hooks temporalmente, usa:"
    echo "   git commit --no-verify"
    echo "   git merge --no-verify"
    echo ""
    echo "4. Para deshabilitar un hook específico:"
    echo "   chmod -x .git/hooks/pre-commit"
    echo ""
    echo "5. Para verificar el estado de los hooks:"
    echo "   ls -la .git/hooks/"
    echo ""
    print_message $YELLOW "💡 Recuerda: Los hooks mejoran la calidad del código y documentación"
}

# Función principal
main() {
    print_message $BLUE "🚀 Configurando Git Hooks para DocumentXTR"
    echo ""
    
    # Verificaciones iniciales
    check_git_repo
    verify_documentxtr
    create_hooks_directory
    
    # Configurar hooks
    create_pre_commit_hook
    create_post_merge_hook
    create_post_checkout_hook
    create_post_commit_hook
    create_prepare_commit_msg_hook
    
    echo ""
    show_configuration_info
    echo ""
    show_usage_instructions
    echo ""
    print_message $GREEN "🎉 ¡Configuración completada! DocumentXTR se ejecutará automáticamente"
}

# Ejecutar función principal
main "$@" 