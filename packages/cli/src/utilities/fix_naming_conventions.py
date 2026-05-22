#!/usr/bin/env python3
"""
Script de Corrección de Convenciones de Nomenclatura
Corrige automáticamente violaciones de nomenclatura de forma segura.
Incluye modo dry-run y confirmación manual para cambios.
"""

import os
import re
import json
import shutil
from pathlib import Path
from typing import Dict, List, Tuple, Set
from datetime import datetime

class NamingConventionFixer:
    """Corrector de convenciones de nomenclatura para el proyecto AI Pair Orchestrator Pro."""
    
    def __init__(self, project_root: str, dry_run: bool = True):
        self.project_root = Path(project_root)
        self.dry_run = dry_run
        self.changes = []
        self.backup_dir = None
        
        # Patrones de corrección
        self.correction_patterns = {
            'documentation': {
                'pattern': r'^([a-z][a-z0-9-]*|[A-Z][A-Z0-9-]*|[A-Z][a-zA-Z0-9]*)\.md$',
                'replacement': lambda m: m.group(1).upper().replace('-', '_') + '.md',
                'description': 'Convertir a UPPER_SNAKE_CASE.md'
            },
            'scripts': {
                'pattern': r'^([A-Z][a-zA-Z0-9]*|[a-z][a-z0-9-]*)\.(py|js|ts|ps1|sh|bat)$',
                'replacement': lambda m: m.group(1).lower().replace('-', '_') + '.' + m.group(2),
                'description': 'Convertir a snake_case.extensión'
            },
            'source_code': {
                'pattern': r'^([a-z][a-z0-9-]*|[a-z][a-z0-9_]*)\.(tsx?|jsx?|vue|svelte)$',
                'replacement': lambda m: m.group(1).replace('-', '').replace('_', '').title() + '.' + m.group(2),
                'description': 'Convertir a PascalCase.extensión'
            },
            'components': {
                'pattern': r'^([a-z][a-z0-9-]*|[a-z][a-z0-9_]*)\.(tsx?|jsx?)$',
                'replacement': lambda m: m.group(1).replace('-', '').replace('_', '').title() + '.' + m.group(2),
                'description': 'Convertir a PascalCase.tsx'
            },
            'hooks': {
                'pattern': r'^([a-z][a-z0-9-]*|[a-z][a-z0-9_]*)\.(ts|js)$',
                'replacement': lambda m: 'use' + m.group(1).replace('-', '').replace('_', '').title() + '.' + m.group(2),
                'description': 'Convertir a usePascalCase.extensión'
            },
            'types': {
                'pattern': r'^([A-Z][a-zA-Z0-9]*|[a-z][a-z0-9-]*)\.(ts|js)$',
                'replacement': lambda m: m.group(1).lower().replace('-', '_') + '.' + m.group(2),
                'description': 'Convertir a snake_case.extensión'
            },
            'services': {
                'pattern': r'^([a-z][a-z0-9-]*|[a-z][a-z0-9_]*)\.(ts|js)$',
                'replacement': lambda m: m.group(1).replace('-', '').replace('_', '').title() + 'Service.' + m.group(2),
                'description': 'Convertir a PascalCaseService.extensión'
            },
            'utils': {
                'pattern': r'^([A-Z][a-zA-Z0-9]*|[a-z][a-z0-9-]*)\.(ts|js)$',
                'replacement': lambda m: m.group(1).lower().replace('-', '_') + '.' + m.group(2),
                'description': 'Convertir a snake_case.extensión'
            },
            'config': {
                'pattern': r'^([A-Z][A-Z0-9-]*|[A-Z][a-zA-Z0-9]*)\.(json|yaml|yml|toml|env)$',
                'replacement': lambda m: m.group(1).lower().replace('-', '_') + '.' + m.group(2),
                'description': 'Convertir a snake_case.extensión'
            }
        }
        
        # Archivos que NO deben ser renombrados
        self.exclude_files = {
            'README.md', 'package.json', 'tsconfig.json', 'Dockerfile',
            'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
            '.gitignore', '.env', '.env.example', '.env.local',
            'vite.config.ts', 'vite.config.js', 'webpack.config.js',
            'jest.config.js', 'jest.config.ts', 'cypress.config.js',
            'tailwind.config.js', 'tailwind.config.ts', 'postcss.config.js',
            'eslint.config.js', '.eslintrc.js', '.eslintrc.json',
            'prettier.config.js', 'prettier.config.ts',
            'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json',
            'playwright.config.ts', 'playwright.config.js',
            'next.config.js', 'next.config.ts',
            'nuxt.config.js', 'nuxt.config.ts',
            'angular.json', 'angular-cli.json',
            'vue.config.js', 'vue.config.ts',
            'rollup.config.js', 'rollup.config.ts',
            'parcel.config.js', 'parcel.config.ts'
        }
        
        # Directorios a excluir
        self.exclude_dirs = {
            'node_modules', '.git', '.vscode', '.idea', 'dist', 'build',
            'coverage', '.nyc_output', 'backups', 'postiz-analysis'
        }

    def get_file_category(self, file_path: Path) -> str:
        """Determina la categoría de un archivo basado en su ubicación y extensión."""
        relative_path = file_path.relative_to(self.project_root)
        path_parts = relative_path.parts
        
        # Categorías basadas en directorio
        if 'docs' in path_parts:
            return 'documentation'
        elif 'scripts' in path_parts:
            return 'scripts'
        elif 'src/components' in str(relative_path):
            return 'components'
        elif 'src/hooks' in str(relative_path):
            return 'hooks'
        elif 'src/types' in str(relative_path):
            return 'types'
        elif 'src/services' in str(relative_path):
            return 'services'
        elif 'src/utils' in str(relative_path):
            return 'utils'
        elif 'src' in path_parts:
            return 'source_code'
        elif any(ext in file_path.suffix for ext in ['.json', '.yaml', '.yml', '.toml', '.env']):
            return 'config'
        
        # Fallback basado en extensión
        if file_path.suffix == '.md':
            return 'documentation'
        elif file_path.suffix in ['.py', '.ps1', '.sh', '.bat']:
            return 'scripts'
        elif file_path.suffix in ['.ts', '.js', '.tsx', '.jsx']:
            return 'source_code'
        
        return 'other'

    def should_rename_file(self, file_path: Path) -> bool:
        """Determina si un archivo debe ser renombrado."""
        filename = file_path.name
        
        # Verificar exclusiones
        if filename in self.exclude_files:
            return False
        
        if any(exclude in file_path.parts for exclude in self.exclude_dirs):
            return False
        
        return True

    def generate_new_name(self, file_path: Path) -> str:
        """Genera el nuevo nombre para un archivo."""
        filename = file_path.name
        category = self.get_file_category(file_path)
        
        if category not in self.correction_patterns:
            return filename
        
        pattern_info = self.correction_patterns[category]
        match = re.match(pattern_info['pattern'], filename)
        
        if match:
            try:
                new_name = pattern_info['replacement'](match)
                return new_name
            except Exception as e:
                print(f"⚠️ Error generando nuevo nombre para {filename}: {e}")
                return filename
        
        return filename

    def create_backup(self) -> None:
        """Crea un backup del proyecto antes de hacer cambios."""
        if self.dry_run:
            return
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        self.backup_dir = self.project_root / f'backup_naming_fix_{timestamp}'
        
        print(f"📦 Creando backup en: {self.backup_dir}")
        
        # Copiar archivos críticos
        critical_files = [
            'package.json', 'tsconfig.json', 'README.md', 'CHANGELOG.md'
        ]
        
        for file_name in critical_files:
            file_path = self.project_root / file_name
            if file_path.exists():
                backup_path = self.backup_dir / file_name
                backup_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(file_path, backup_path)

    def scan_and_fix(self) -> None:
        """Escanea y corrige violaciones de nomenclatura."""
        print(f"🔍 Escaneando proyecto: {self.project_root}")
        print(f"🔧 Modo: {'DRY RUN' if self.dry_run else 'EJECUCIÓN REAL'}")
        
        for file_path in self.project_root.rglob('*'):
            if not file_path.is_file():
                continue
            
            if not self.should_rename_file(file_path):
                continue
            
            current_name = file_path.name
            new_name = self.generate_new_name(file_path)
            
            if current_name != new_name:
                relative_path = file_path.relative_to(self.project_root)
                new_path = file_path.parent / new_name
                
                change = {
                    'file': str(relative_path),
                    'current_name': current_name,
                    'new_name': new_name,
                    'category': self.get_file_category(file_path),
                    'description': self.correction_patterns.get(
                        self.get_file_category(file_path), {}
                    ).get('description', 'Sin descripción')
                }
                
                self.changes.append(change)
                
                if not self.dry_run:
                    try:
                        # Verificar que el archivo destino no existe
                        if new_path.exists():
                            print(f"⚠️ El archivo {new_path} ya existe, saltando {file_path}")
                            continue
                        
                        # Renombrar archivo
                        file_path.rename(new_path)
                        print(f"✅ Renombrado: {current_name} → {new_name}")
                        
                    except Exception as e:
                        print(f"❌ Error renombrando {file_path}: {e}")

    def print_summary(self) -> None:
        """Imprime un resumen de los cambios."""
        print("\n" + "="*60)
        print("📋 RESUMEN DE CORRECCIÓN DE NOMENCLATURA")
        print("="*60)
        print(f"📁 Proyecto: {self.project_root}")
        print(f"⏰ Fecha: {datetime.now().isoformat()}")
        print(f"🔧 Modo: {'DRY RUN' if self.dry_run else 'EJECUCIÓN REAL'}")
        print(f"📊 Archivos a cambiar: {len(self.changes)}")
        
        if self.changes:
            print(f"\n📝 CAMBIOS PROPUESTOS:")
            print("-" * 40)
            
            # Agrupar por categoría
            changes_by_category = {}
            for change in self.changes:
                cat = change['category']
                if cat not in changes_by_category:
                    changes_by_category[cat] = []
                changes_by_category[cat].append(change)
            
            for category, changes in changes_by_category.items():
                print(f"\n📂 {category.upper()}:")
                for change in changes[:10]:  # Mostrar solo las primeras 10
                    print(f"  🔄 {change['current_name']} → {change['new_name']}")
                    print(f"     💡 {change['description']}")
                
                if len(changes) > 10:
                    print(f"     ... y {len(changes) - 10} más")
        else:
            print("\n🎉 ¡No se encontraron archivos que necesiten corrección!")

    def save_report(self) -> None:
        """Guarda un reporte de los cambios."""
        report = {
            'timestamp': datetime.now().isoformat(),
            'project_root': str(self.project_root),
            'dry_run': self.dry_run,
            'total_changes': len(self.changes),
            'changes': self.changes,
            'backup_dir': str(self.backup_dir) if self.backup_dir else None
        }
        
        report_file = self.project_root / f'naming_fix_report_{"dry_run" if self.dry_run else "executed"}.json'
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Reporte guardado en: {report_file}")

def main():
    """Función principal del script."""
    import sys
    import argparse
    
    parser = argparse.ArgumentParser(description='Corrector de convenciones de nomenclatura')
    parser.add_argument('--project-root', default=os.getcwd(), help='Directorio raíz del proyecto')
    parser.add_argument('--execute', action='store_true', help='Ejecutar cambios reales (por defecto es dry-run)')
    parser.add_argument('--confirm', action='store_true', help='Confirmar cambios sin preguntar')
    
    args = parser.parse_args()
    
    # Crear corrector
    fixer = NamingConventionFixer(args.project_root, dry_run=not args.execute)
    
    try:
        # Ejecutar corrección
        fixer.scan_and_fix()
        
        # Mostrar resumen
        fixer.print_summary()
        
        # Si hay cambios y no es dry-run, preguntar confirmación
        if fixer.changes and not fixer.dry_run and not args.confirm:
            print(f"\n⚠️ ¿Deseas proceder con {len(fixer.changes)} cambios? (y/N): ", end='')
            response = input().strip().lower()
            
            if response not in ['y', 'yes', 'sí', 'si']:
                print("❌ Operación cancelada por el usuario.")
                sys.exit(0)
            
            # Crear backup y ejecutar cambios
            fixer.create_backup()
            fixer.dry_run = False
            fixer.scan_and_fix()
        
        # Guardar reporte
        fixer.save_report()
        
        print(f"\n✅ {'Simulación' if fixer.dry_run else 'Corrección'} completada exitosamente.")
        
    except Exception as e:
        print(f"❌ Error durante la corrección: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 