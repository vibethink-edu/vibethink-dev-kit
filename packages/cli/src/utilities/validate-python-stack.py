#!/usr/bin/env python3

"""
🐍 Python Stack Validation Script
VThink 1.0 - Validación Automática del Stack Python
"""

import sys
import os
import json
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime

@dataclass
class ComponentStatus:
    """Estado de un componente del stack"""
    name: str
    version: str
    installed: bool
    location: Optional[str] = None
    status: str = "❌"
    notes: str = ""

class PythonStackValidator:
    """Validador del stack de Python"""
    
    def __init__(self):
        self.project_root = Path.cwd()
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "components": {},
            "overall_status": "❌",
            "recommendations": []
        }
        
        # Componentes a validar
        self.components = {
            "fastapi": {"required": True, "min_version": "0.100.0"},
            "pydantic": {"required": True, "min_version": "2.0.0"},
            "pydantic-settings": {"required": True, "min_version": "2.0.0"},
            "agno": {"required": True, "min_version": "1.0.0"},
            "langchain": {"required": False, "min_version": "0.1.0"},
            "llama-index": {"required": False, "min_version": "0.9.0"},
            "pydantic-ai": {"required": False, "min_version": "0.1.0"}
        }
    
    def check_pip_installed(self, package: str) -> Tuple[bool, str]:
        """Verifica si un paquete está instalado via pip"""
        try:
            result = subprocess.run(
                [sys.executable, "-m", "pip", "show", package],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                # Extraer versión del output
                for line in result.stdout.split('\n'):
                    if line.startswith('Version:'):
                        version = line.split(':', 1)[1].strip()
                        return True, version
                return True, "unknown"
            else:
                return False, "not_installed"
                
        except Exception as e:
            return False, f"error: {str(e)}"
    
    def check_requirements_file(self, package: str) -> Tuple[bool, str]:
        """Verifica si un paquete está en requirements.txt"""
        requirements_files = [
            "requirements.txt",
            "src.old/backend/requirements.txt",
            "src.old/modules/knotie-checkup/requirements.txt"
        ]
        
        for req_file in requirements_files:
            file_path = self.project_root / req_file
            if file_path.exists():
                try:
                    with open(file_path, 'r') as f:
                        content = f.read()
                        for line in content.split('\n'):
                            if line.strip().startswith(package):
                                # Extraer versión
                                if '==' in line:
                                    version = line.split('==')[1].strip()
                                    return True, version
                                elif '>=' in line:
                                    version = line.split('>=')[1].strip()
                                    return True, version
                                else:
                                    return True, "latest"
                except Exception:
                    continue
        
        return False, "not_found"
    
    def check_python_files(self, package: str) -> List[str]:
        """Busca referencias a un paquete en archivos Python"""
        locations = []
        
        # Buscar en directorios específicos
        search_dirs = [
            "src.old/backend",
            "src.old/modules",
            "src/modules",
            "scripts"
        ]
        
        for search_dir in search_dirs:
            dir_path = self.project_root / search_dir
            if dir_path.exists():
                for py_file in dir_path.rglob("*.py"):
                    try:
                        with open(py_file, 'r', encoding='utf-8') as f:
                            content = f.read()
                            if package.lower() in content.lower():
                                locations.append(str(py_file.relative_to(self.project_root)))
                    except Exception:
                        continue
        
        return locations
    
    def validate_component(self, name: str, config: Dict) -> ComponentStatus:
        """Valida un componente específico"""
        status = ComponentStatus(name=name, version="", installed=False)
        
        # Verificar si está instalado
        installed, version = self.check_pip_installed(name)
        status.installed = installed
        status.version = version
        
        # Verificar si está en requirements.txt
        in_requirements, req_version = self.check_requirements_file(name)
        
        # Buscar en archivos Python
        locations = self.check_python_files(name)
        
        # Determinar estado
        if installed:
            status.status = "✅"
            status.notes = f"Instalado: {version}"
        elif in_requirements:
            status.status = "⚠️"
            status.notes = f"En requirements: {req_version}"
        elif locations:
            status.status = "⚠️"
            status.notes = f"Referenciado en: {', '.join(locations[:2])}"
        else:
            status.status = "❌"
            status.notes = "No encontrado"
        
        # Agregar ubicaciones
        if locations:
            status.location = locations[0] if locations else None
        
        return status
    
    def generate_recommendations(self) -> List[str]:
        """Genera recomendaciones basadas en el estado actual"""
        recommendations = []
        
        # Contar componentes instalados
        installed_count = sum(1 for comp in self.results["components"].values() 
                           if comp.status == "✅")
        total_count = len(self.components)
        
        # Recomendación general
        if installed_count >= 3:
            recommendations.append("✅ Stack principal funcionando (FastAPI + Pydantic + AGNO)")
        else:
            recommendations.append("⚠️ Stack principal incompleto")
        
        # Recomendaciones específicas
        if self.results["components"].get("langchain", {}).get("status") == "❌":
            recommendations.append("💡 Evaluar necesidad de Langchain vs AGNO")
        
        if self.results["components"].get("llama-index", {}).get("status") == "❌":
            recommendations.append("💡 Considerar LlamaIndex para capacidades RAG")
        
        if self.results["components"].get("pydantic-ai", {}).get("status") == "❌":
            recommendations.append("💡 Evaluar PydanticAI para validación avanzada de IA")
        
        return recommendations
    
    def run_validation(self) -> Dict:
        """Ejecuta la validación completa del stack"""
        print("🐍 Validando Stack de Python...")
        print("=" * 50)
        
        # Validar cada componente
        for name, config in self.components.items():
            print(f"🔍 Validando {name}...")
            status = self.validate_component(name, config)
            self.results["components"][name] = {
                "name": status.name,
                "version": status.version,
                "installed": status.installed,
                "location": status.location,
                "status": status.status,
                "notes": status.notes,
                "required": config["required"]
            }
            print(f"   {status.status} {status.notes}")
        
        # Generar recomendaciones
        self.results["recommendations"] = self.generate_recommendations()
        
        # Determinar estado general
        required_components = [name for name, config in self.components.items() 
                             if config["required"]]
        required_installed = sum(1 for name in required_components 
                               if self.results["components"][name]["status"] == "✅")
        
        if required_installed == len(required_components):
            self.results["overall_status"] = "✅"
        elif required_installed >= len(required_components) * 0.8:
            self.results["overall_status"] = "⚠️"
        else:
            self.results["overall_status"] = "❌"
        
        return self.results
    
    def print_summary(self):
        """Imprime un resumen de la validación"""
        print("\n" + "=" * 50)
        print("📊 RESUMEN DE VALIDACIÓN")
        print("=" * 50)
        
        # Estado general
        print(f"Estado General: {self.results['overall_status']}")
        print(f"Timestamp: {self.results['timestamp']}")
        
        # Componentes
        print("\n📋 Componentes:")
        for name, info in self.results["components"].items():
            required_mark = "🔴" if info["required"] else "🟡"
            print(f"   {required_mark} {name}: {info['status']} {info['notes']}")
        
        # Recomendaciones
        print("\n💡 Recomendaciones:")
        for rec in self.results["recommendations"]:
            print(f"   {rec}")
        
        # Estadísticas
        total = len(self.results["components"])
        installed = sum(1 for comp in self.results["components"].values() 
                       if comp["status"] == "✅")
        required = sum(1 for comp in self.results["components"].values() 
                      if comp["required"])
        required_installed = sum(1 for comp in self.results["components"].values() 
                               if comp["required"] and comp["status"] == "✅")
        
        print(f"\n📈 Estadísticas:")
        print(f"   Total: {total} componentes")
        print(f"   Instalados: {installed}/{total}")
        print(f"   Requeridos: {required}")
        print(f"   Requeridos instalados: {required_installed}/{required}")
    
    def save_report(self, filename: str = "python-stack-validation.json"):
        """Guarda el reporte en JSON"""
        report_path = self.project_root / filename
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        print(f"\n📄 Reporte guardado en: {report_path}")

def main():
    """Función principal"""
    validator = PythonStackValidator()
    
    try:
        # Ejecutar validación
        results = validator.run_validation()
        
        # Imprimir resumen
        validator.print_summary()
        
        # Guardar reporte
        validator.save_report()
        
        # Exit code basado en estado general
        if results["overall_status"] == "✅":
            sys.exit(0)
        elif results["overall_status"] == "⚠️":
            sys.exit(1)
        else:
            sys.exit(2)
            
    except Exception as e:
        print(f"❌ Error durante la validación: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 