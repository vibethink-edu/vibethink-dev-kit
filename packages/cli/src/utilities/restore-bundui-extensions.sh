#!/bin/bash

# =============================================================================
# SCRIPT DE RESTAURACIÓN - EXTENSIONES BUNDUI PREMIUM
# =============================================================================
# Propósito: Restaurar extensiones personalizadas después de upgrades de BundUI
# Uso: ./scripts/restore-bundui-extensions.sh [BACKUP_DIR]
# Autor: Equipo VThink 1.0
# =============================================================================

# Verificar si se proporcionó directorio de backup
if [ $# -eq 0 ]; then
    echo "❌ Error: Debes especificar el directorio de backup"
    echo "Uso: $0 <BACKUP_DIR>"
    echo "Ejemplo: $0 bundui-backup/20241201_143022"
    exit 1
fi

BACKUP_DIR="$1"

# Verificar que el directorio de backup existe
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Error: El directorio de backup '$BACKUP_DIR' no existe"
    echo "Directorios disponibles:"
    ls -la bundui-backup/ 2>/dev/null || echo "No hay directorios de backup"
    exit 1
fi

echo "🔄 Iniciando restauración de extensiones BundUI Premium..."
echo "📁 Restaurando desde: $BACKUP_DIR"

# Verificar archivos de backup
echo "📋 Verificando archivos de backup..."

if [ ! -f "$BACKUP_DIR/BunduiLanguageSwitcher.tsx" ]; then
    echo "⚠️  Advertencia: BunduiLanguageSwitcher.tsx no encontrado en backup"
fi

if [ ! -f "$BACKUP_DIR/dropdown-menu.tsx" ]; then
    echo "⚠️  Advertencia: dropdown-menu.tsx no encontrado en backup"
fi

if [ ! -f "$BACKUP_DIR/index.ts" ]; then
    echo "⚠️  Advertencia: index.ts no encontrado en backup"
fi

echo ""

# Restaurar extensiones
echo "📦 Restaurando extensiones personalizadas..."

# Restaurar BunduiLanguageSwitcher
if [ -f "$BACKUP_DIR/BunduiLanguageSwitcher.tsx" ]; then
    cp "$BACKUP_DIR/BunduiLanguageSwitcher.tsx" "bundui/src/components/"
    echo "✅ BunduiLanguageSwitcher.tsx restaurado"
else
    echo "❌ No se pudo restaurar BunduiLanguageSwitcher.tsx"
fi

# Restaurar dropdown-menu
if [ -f "$BACKUP_DIR/dropdown-menu.tsx" ]; then
    # Crear directorio si no existe
    mkdir -p "bundui/src/components/ui/"
    cp "$BACKUP_DIR/dropdown-menu.tsx" "bundui/src/components/ui/"
    echo "✅ dropdown-menu.tsx restaurado"
else
    echo "❌ No se pudo restaurar dropdown-menu.tsx"
fi

# Restaurar index.ts (con precaución)
if [ -f "$BACKUP_DIR/index.ts" ]; then
    echo "⚠️  Restaurando index.ts..."
    echo "💡 Verificar manualmente las exportaciones después de la restauración"
    cp "$BACKUP_DIR/index.ts" "bundui/src/"
    echo "✅ index.ts restaurado"
else
    echo "❌ No se pudo restaurar index.ts"
fi

echo ""

# Verificar restauración
echo "🔍 Verificando restauración..."

if [ -f "bundui/src/components/BunduiLanguageSwitcher.tsx" ]; then
    echo "✅ BunduiLanguageSwitcher.tsx presente"
else
    echo "❌ BunduiLanguageSwitcher.tsx faltante"
fi

if [ -f "bundui/src/components/ui/dropdown-menu.tsx" ]; then
    echo "✅ dropdown-menu.tsx presente"
else
    echo "❌ dropdown-menu.tsx faltante"
fi

if [ -f "bundui/src/index.ts" ]; then
    echo "✅ index.ts presente"
else
    echo "❌ index.ts faltante"
fi

echo ""

# Mostrar diferencias en index.ts si existe
if [ -f "bundui/src/index.ts" ] && [ -f "$BACKUP_DIR/index.ts" ]; then
    echo "📊 Comparando index.ts con backup..."
    echo "Diferencias encontradas:"
    diff -u "$BACKUP_DIR/index.ts" "bundui/src/index.ts" || echo "No hay diferencias significativas"
fi

echo ""

# Instrucciones post-restauración
echo "🎯 Próximos pasos recomendados:"
echo "1. 🔍 Verificar que las extensiones funcionan correctamente"
echo "2. 🧪 Ejecutar tests: npm run bundui:test"
echo "3. 🚀 Probar la aplicación: npm run dev"
echo "4. 📝 Documentar cualquier problema encontrado"
echo "5. 🔄 Si hay conflictos, resolver manualmente"

echo ""
echo "✅ Restauración completada"
echo "💡 Revisa los archivos restaurados y prueba la funcionalidad" 