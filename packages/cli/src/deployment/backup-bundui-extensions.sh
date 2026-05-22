#!/bin/bash

# =============================================================================
# SCRIPT DE BACKUP - EXTENSIONES BUNDUI PREMIUM
# =============================================================================
# Propósito: Backup de extensiones personalizadas antes de upgrades de BundUI
# Uso: ./scripts/backup-bundui-extensions.sh
# Autor: Equipo VThink 1.0
# =============================================================================

echo "🔄 Iniciando backup de extensiones BundUI Premium..."

# Crear directorio de backup con timestamp
BACKUP_DIR="bundui-backup/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Creando backup en: $BACKUP_DIR"

# Backup de nuestras extensiones
echo "📦 Backup de extensiones personalizadas..."

# Componentes principales
if [ -f "bundui/src/components/BunduiLanguageSwitcher.tsx" ]; then
    cp "bundui/src/components/BunduiLanguageSwitcher.tsx" "$BACKUP_DIR/"
    echo "✅ BunduiLanguageSwitcher.tsx"
else
    echo "⚠️  BunduiLanguageSwitcher.tsx no encontrado"
fi

# Componentes UI
if [ -f "bundui/src/components/ui/dropdown-menu.tsx" ]; then
    cp "bundui/src/components/ui/dropdown-menu.tsx" "$BACKUP_DIR/"
    echo "✅ dropdown-menu.tsx"
else
    echo "⚠️  dropdown-menu.tsx no encontrado"
fi

# Archivo index.ts modificado
if [ -f "bundui/src/index.ts" ]; then
    cp "bundui/src/index.ts" "$BACKUP_DIR/"
    echo "✅ index.ts"
else
    echo "⚠️  index.ts no encontrado"
fi

# Backup de package.json para versiones
if [ -f "bundui/package.json" ]; then
    cp "bundui/package.json" "$BACKUP_DIR/"
    echo "✅ package.json"
fi

# Crear archivo de metadatos del backup
cat > "$BACKUP_DIR/backup-info.md" << EOF
# Backup de Extensiones BundUI Premium

**Fecha:** $(date)
**Versión:** $(git rev-parse --short HEAD 2>/dev/null || echo "N/A")
**Motivo:** Backup antes de upgrade de BundUI Premium

## Archivos Incluidos:
- BunduiLanguageSwitcher.tsx
- dropdown-menu.tsx  
- index.ts
- package.json

## Instrucciones de Restauración:
1. Ejecutar: ./scripts/restore-bundui-extensions.sh
2. Verificar compatibilidad
3. Probar funcionalidad

## Notas:
- Este backup contiene extensiones personalizadas
- NO sobrescribir durante upgrades de BundUI Premium
- Restaurar después del upgrade si es necesario
EOF

echo "📝 Backup info creado: $BACKUP_DIR/backup-info.md"

# Listar archivos del backup
echo ""
echo "📋 Archivos en el backup:"
ls -la "$BACKUP_DIR/"

echo ""
echo "✅ Backup completado exitosamente en: $BACKUP_DIR"
echo "💡 Para restaurar: ./scripts/restore-bundui-extensions.sh $BACKUP_DIR" 