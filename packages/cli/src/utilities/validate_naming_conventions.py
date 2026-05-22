#!/usr/bin/env python3
"""
Script de Validación de Convenciones de Nomenclatura
Analiza archivos del proyecto para verificar cumplimiento de estándares de nomenclatura.
Solo reporta violaciones sin modificar archivos.
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Tuple, Set
from datetime import datetime

class NamingConventionValidator:
    """Validador de convenciones de nomenclatura para el proyecto AI Pair Orchestrator Pro."""
    
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.violations = []
        self.stats = {
            'total_files': 0,
            'valid_files': 0,
            'violations_found': 0,
            'categories': {}
        }
        
        # Patrones de nomenclatura
        self.patterns = {
            'documentation': {
                'pattern': r'^[A-Z][A-Z0-9_]*\.md$',
                'description': 'Documentación: UPPER_SNAKE_CASE.md',
                'examples': ['README.md', 'API_DOCUMENTATION.md', 'SETUP_GUIDE.md']
            },
            'scripts': {
                'pattern': r'^[a-z][a-z0-9_]*\.(py|js|ts|ps1|sh|bat)$',
                'description': 'Scripts: snake_case.extensión',
                'examples': ['validate_naming.py', 'setup_environment.ps1', 'deploy_app.js']
            },
            'source_code': {
                'pattern': r'^[A-Z][a-zA-Z0-9]*\.(tsx?|jsx?|vue|svelte)$',
                'description': 'Código fuente: PascalCase.extensión',
                'examples': ['UserProfile.tsx', 'ApiClient.ts', 'Dashboard.vue']
            },
            'components': {
                'pattern': r'^[A-Z][a-zA-Z0-9]*\.(tsx?|jsx?)$',
                'description': 'Componentes React: PascalCase.tsx',
                'examples': ['UserCard.tsx', 'NavigationBar.tsx', 'DataTable.jsx']
            },
            'hooks': {
                'pattern': r'^use[A-Z][a-zA-Z0-9]*\.(ts|js)$',
                'description': 'Hooks: usePascalCase.extensión',
                'examples': ['useAuth.ts', 'useDataFetching.js', 'useLocalStorage.ts']
            },
            'types': {
                'pattern': r'^[a-z][a-z0-9_]*\.(ts|js)$',
                'description': 'Tipos: snake_case.extensión',
                'examples': ['user_types.ts', 'api_types.js', 'database_schema.ts']
            },
            'services': {
                'pattern': r'^[A-Z][a-zA-Z0-9]*Service\.(ts|js)$',
                'description': 'Servicios: PascalCaseService.extensión',
                'examples': ['AuthService.ts', 'ApiService.js', 'DatabaseService.ts']
            },
            'utils': {
                'pattern': r'^[a-z][a-z0-9_]*\.(ts|js)$',
                'description': 'Utilidades: snake_case.extensión',
                'examples': ['date_utils.ts', 'string_helpers.js', 'validation.ts']
            },
            'config': {
                'pattern': r'^[a-z][a-z0-9_]*\.(json|yaml|yml|toml|env)$',
                'description': 'Configuración: snake_case.extensión',
                'examples': ['package.json', 'tsconfig.json', 'docker_compose.yml']
            }
        }
        
        # Directorios a excluir
        self.exclude_dirs = {
            'node_modules', '.git', '.vscode', '.idea', 'dist', 'build',
            'coverage', '.nyc_output', 'backups', 'postiz-analysis'
        }
        
        # Extensiones a analizar
        self.include_extensions = {
            '.md', '.py', '.js', '.ts', '.tsx', '.jsx', '.vue', '.svelte',
            '.json', '.yaml', '.yml', '.toml', '.env', '.ps1', '.sh', '.bat'
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

    def validate_filename(self, file_path: Path) -> Tuple[bool, str, str]:
        """Valida si un nombre de archivo cumple con las convenciones."""
        filename = file_path.name
        category = self.get_file_category(file_path)
        
        # Casos especiales
        if filename in ['README.md', 'package.json', 'tsconfig.json', 'Dockerfile']:
            return True, category, "Archivo estándar permitido"
        
        # Verificar patrón según categoría
        if category in self.patterns:
            pattern = self.patterns[category]['pattern']
            if re.match(pattern, filename):
                return True, category, "Cumple convención"
            else:
                expected = self.patterns[category]['description']
                return False, category, f"No cumple: {expected}"
        
        return True, category, "Categoría no definida"

    def scan_directory(self) -> None:
        """Escanea el directorio del proyecto en busca de violaciones."""
        print(f"🔍 Escaneando proyecto: {self.project_root}")
        
        for file_path in self.project_root.rglob('*'):
            if file_path.is_file():
                # Verificar exclusiones
                if any(exclude in file_path.parts for exclude in self.exclude_dirs):
                    continue
                
                if file_path.suffix not in self.include_extensions:
                    continue
                
                self.stats['total_files'] += 1
                relative_path = file_path.relative_to(self.project_root)
                
                is_valid, category, message = self.validate_filename(file_path)
                
                if is_valid:
                    self.stats['valid_files'] += 1
                else:
                    self.stats['violations_found'] += 1
                    self.violations.append({
                        'file': str(relative_path),
                        'category': category,
                        'message': message,
                        'expected_pattern': self.patterns.get(category, {}).get('description', 'N/A'),
                        'examples': self.patterns.get(category, {}).get('examples', [])
                    })
                
                # Actualizar estadísticas por categoría
                if category not in self.stats['categories']:
                    self.stats['categories'][category] = {'total': 0, 'valid': 0, 'violations': 0}
                
                self.stats['categories'][category]['total'] += 1
                if is_valid:
                    self.stats['categories'][category]['valid'] += 1
                else:
                    self.stats['categories'][category]['violations'] += 1

    def generate_report(self) -> Dict:
        """Genera un reporte completo de la validación."""
        compliance_rate = (self.stats['valid_files'] / self.stats['total_files'] * 100) if self.stats['total_files'] > 0 else 0
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'project_root': str(self.project_root),
            'summary': {
                'total_files_analyzed': self.stats['total_files'],
                'valid_files': self.stats['valid_files'],
                'violations_found': self.stats['violations_found'],
                'compliance_rate': round(compliance_rate, 2)
            },
            'categories': self.stats['categories'],
            'violations': self.violations,
            'patterns': self.patterns
        }
        
        return report

    def print_summary(self, report: Dict) -> None:
        """Imprime un resumen de la validación."""
        summary = report['summary']
        
        print("\n" + "="*60)
        print("📋 REPORTE DE VALIDACIÓN DE NOMENCLATURA")
        print("="*60)
        print(f"📁 Proyecto: {report['project_root']}")
        print(f"⏰ Fecha: {report['timestamp']}")
        print(f"📊 Archivos analizados: {summary['total_files_analyzed']}")
        print(f"✅ Archivos válidos: {summary['valid_files']}")
        print(f"❌ Violaciones encontradas: {summary['violations_found']}")
        print(f"📈 Tasa de cumplimiento: {summary['compliance_rate']}%")
        
        if summary['violations_found'] > 0:
            print(f"\n🚨 VIOLACIONES ENCONTRADAS:")
            print("-" * 40)
            
            # Agrupar por categoría
            violations_by_category = {}
            for violation in report['violations']:
                cat = violation['category']
                if cat not in violations_by_category:
                    violations_by_category[cat] = []
                violations_by_category[cat].append(violation)
            
            for category, violations in violations_by_category.items():
                print(f"\n📂 {category.upper()}:")
                for violation in violations[:5]:  # Mostrar solo las primeras 5
                    print(f"  ❌ {violation['file']}")
                    print(f"     💡 {violation['message']}")
                    if violation['examples']:
                        print(f"     📝 Ejemplos: {', '.join(violation['examples'])}")
                
                if len(violations) > 5:
                    print(f"     ... y {len(violations) - 5} más")
        else:
            print("\n🎉 ¡Excelente! No se encontraron violaciones de nomenclatura.")

def main():
    """Función principal del script."""
    import sys
    
    # Obtener directorio del proyecto
    if len(sys.argv) > 1:
        project_root = sys.argv[1]
    else:
        project_root = os.getcwd()
    
    # Crear validador
    validator = NamingConventionValidator(project_root)
    
    try:
        # Ejecutar validación
        validator.scan_directory()
        
        # Generar reporte
        report = validator.generate_report()
        
        # Mostrar resumen
        validator.print_summary(report)
        
        # Guardar reporte JSON
        report_file = Path(project_root) / 'naming_convention_report.json'
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Reporte completo guardado en: {report_file}")
        
        # Código de salida
        exit_code = 0 if report['summary']['violations_found'] == 0 else 1
        sys.exit(exit_code)
        
    except Exception as e:
        print(f"❌ Error durante la validación: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 