#!/usr/bin/env python3

"""
🚀 Python Development Optimizer
VThink 1.0 - Desarrollo Local Optimizado con FastAPI + Pydantic + AGNO
"""

import os
import sys
import subprocess
import asyncio
import uvicorn
from pathlib import Path
from typing import Dict, List, Optional
import json
from datetime import datetime

class PythonDevOptimizer:
    """Optimizador de desarrollo local para Python"""
    
    def __init__(self):
        self.project_root = Path.cwd()
        self.config = {
            "fastapi_port": 8000,
            "dev_port": 8080,
            "host": "localhost",
            "reload": True,
            "workers": 1,
            "log_level": "info"
        }
        
        # Colores para output
        self.colors = {
            "green": "\033[32m",
            "red": "\033[31m",
            "yellow": "\033[33m",
            "blue": "\033[34m",
            "cyan": "\033[36m",
            "reset": "\033[0m",
            "bold": "\033[1m"
        }
    
    def log(self, message: str, color: str = "reset"):
        """Log con colores"""
        print(f"{self.colors[color]}{message}{self.colors['reset']}")
    
    def check_python_environment(self) -> Dict:
        """Verifica el entorno de Python"""
        self.log("🔍 Verificando entorno de Python...", "cyan")
        
        results = {
            "python_version": sys.version,
            "pip_installed": False,
            "virtual_env": False,
            "dependencies": {}
        }
        
        # Verificar pip
        try:
            import pip
            results["pip_installed"] = True
            self.log("✅ pip instalado", "green")
        except ImportError:
            self.log("❌ pip no encontrado", "red")
        
        # Verificar entorno virtual
        if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
            results["virtual_env"] = True
            self.log("✅ Entorno virtual activo", "green")
        else:
            self.log("⚠️  No hay entorno virtual activo", "yellow")
        
        # Verificar dependencias principales
        dependencies = ["fastapi", "pydantic", "agno", "uvicorn"]
        for dep in dependencies:
            try:
                module = __import__(dep)
                version = getattr(module, '__version__', 'unknown')
                results["dependencies"][dep] = version
                self.log(f"✅ {dep}: {version}", "green")
            except ImportError:
                results["dependencies"][dep] = None
                self.log(f"❌ {dep}: No instalado", "red")
        
        return results
    
    def install_dependencies(self) -> bool:
        """Instala dependencias faltantes"""
        self.log("📦 Instalando dependencias...", "cyan")
        
        try:
            # Instalar desde requirements.txt
            if (self.project_root / "requirements.txt").exists():
                subprocess.run([
                    sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
                ], check=True)
                self.log("✅ Dependencias instaladas desde requirements.txt", "green")
                return True
            else:
                self.log("⚠️  requirements.txt no encontrado", "yellow")
                return False
        except subprocess.CalledProcessError as e:
            self.log(f"❌ Error instalando dependencias: {e}", "red")
            return False
    
    def setup_development_environment(self):
        """Configura el entorno de desarrollo"""
        self.log("🛠️  Configurando entorno de desarrollo...", "cyan")
        
        # Crear directorios necesarios
        dirs_to_create = [
            "logs",
            "temp",
            "cache",
            "backups"
        ]
        
        for dir_name in dirs_to_create:
            dir_path = self.project_root / dir_name
            dir_path.mkdir(exist_ok=True)
            self.log(f"✅ Directorio creado: {dir_name}", "green")
        
        # Crear archivo de configuración de desarrollo
        dev_config = {
            "development": {
                "debug": True,
                "reload": True,
                "host": "0.0.0.0",
                "port": 8000
            },
            "logging": {
                "level": "DEBUG",
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            },
            "database": {
                "url": "sqlite:///./dev.db"
            }
        }
        
        config_path = self.project_root / "dev-config.json"
        with open(config_path, 'w') as f:
            json.dump(dev_config, f, indent=2)
        
        self.log("✅ Configuración de desarrollo creada", "green")
    
    def start_fastapi_server(self, app_path: str = "src.old.backend.main:app"):
        """Inicia el servidor FastAPI"""
        self.log("🚀 Iniciando servidor FastAPI...", "cyan")
        
        try:
            uvicorn.run(
                app_path,
                host=self.config["host"],
                port=self.config["fastapi_port"],
                reload=self.config["reload"],
                log_level=self.config["log_level"]
            )
        except Exception as e:
            self.log(f"❌ Error iniciando servidor: {e}", "red")
            return False
        
        return True
    
    def run_tests(self) -> bool:
        """Ejecuta tests del proyecto"""
        self.log("🧪 Ejecutando tests...", "cyan")
        
        try:
            # Buscar tests en el proyecto
            test_dirs = ["tests", "src.old/backend/tests", "src.old/modules"]
            
            for test_dir in test_dirs:
                test_path = self.project_root / test_dir
                if test_path.exists():
                    subprocess.run([
                        sys.executable, "-m", "pytest", str(test_path), "-v"
                    ], check=True)
                    self.log(f"✅ Tests ejecutados en {test_dir}", "green")
                    return True
            
            self.log("⚠️  No se encontraron tests", "yellow")
            return False
            
        except subprocess.CalledProcessError as e:
            self.log(f"❌ Error ejecutando tests: {e}", "red")
            return False
    
    def check_code_quality(self) -> bool:
        """Verifica la calidad del código"""
        self.log("🔍 Verificando calidad del código...", "cyan")
        
        try:
            # Verificar con flake8
            subprocess.run([
                sys.executable, "-m", "flake8", "src.old/backend", "--max-line-length=100"
            ], check=True)
            self.log("✅ Flake8 passed", "green")
            
            # Verificar con black
            subprocess.run([
                sys.executable, "-m", "black", "--check", "src.old/backend"
            ], check=True)
            self.log("✅ Black formatting OK", "green")
            
            return True
            
        except subprocess.CalledProcessError as e:
            self.log(f"⚠️  Problemas de calidad de código: {e}", "yellow")
            return False
    
    def create_dev_scripts(self):
        """Crea scripts de desarrollo útiles"""
        self.log("📝 Creando scripts de desarrollo...", "cyan")
        
        scripts = {
            "dev-start.py": '''#!/usr/bin/env python3
"""Script de inicio rápido para desarrollo"""
import uvicorn
import sys
from pathlib import Path

if __name__ == "__main__":
    uvicorn.run(
        "src.old.backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
''',
            "test-runner.py": '''#!/usr/bin/env python3
"""Script para ejecutar tests"""
import subprocess
import sys

def run_tests():
    subprocess.run([sys.executable, "-m", "pytest", "tests", "-v"])

if __name__ == "__main__":
    run_tests()
''',
            "quality-check.py": '''#!/usr/bin/env python3
"""Script para verificar calidad de código"""
import subprocess
import sys

def check_quality():
    subprocess.run([sys.executable, "-m", "flake8", "src.old/backend"])
    subprocess.run([sys.executable, "-m", "black", "--check", "src.old/backend"])

if __name__ == "__main__":
    check_quality()
'''
        }
        
        for filename, content in scripts.items():
            script_path = self.project_root / filename
            with open(script_path, 'w') as f:
                f.write(content)
            
            # Hacer ejecutable en Unix
            if os.name != 'nt':  # No Windows
                os.chmod(script_path, 0o755)
            
            self.log(f"✅ Script creado: {filename}", "green")
    
    def show_development_info(self):
        """Muestra información de desarrollo"""
        self.log("📊 Información de Desarrollo", "bold")
        self.log("=" * 50, "cyan")
        
        info = {
            "FastAPI URL": f"http://{self.config['host']}:{self.config['fastapi_port']}",
            "Docs URL": f"http://{self.config['host']}:{self.config['fastapi_port']}/docs",
            "Health Check": f"http://{self.config['host']}:{self.config['fastapi_port']}/health",
            "Project Root": str(self.project_root),
            "Python Version": sys.version.split()[0],
            "Development Mode": "Active" if self.config["reload"] else "Inactive"
        }
        
        for key, value in info.items():
            self.log(f"{key}: {value}", "blue")
        
        self.log("\n💡 Comandos útiles:", "bold")
        self.log("   python dev-start.py          # Iniciar servidor", "cyan")
        self.log("   python test-runner.py        # Ejecutar tests", "cyan")
        self.log("   python quality-check.py      # Verificar calidad", "cyan")
        self.log("   python -m pytest tests -v   # Tests detallados", "cyan")
        self.log("   python -m uvicorn src.old.backend.main:app --reload  # Servidor manual", "cyan")
    
    def run_optimization(self):
        """Ejecuta la optimización completa"""
        self.log("🚀 Iniciando optimización de desarrollo Python", "bold")
        self.log("=" * 60, "cyan")
        
        try:
            # 1. Verificar entorno
            env_info = self.check_python_environment()
            
            # 2. Instalar dependencias si es necesario
            missing_deps = [k for k, v in env_info["dependencies"].items() if v is None]
            if missing_deps:
                self.log(f"⚠️  Dependencias faltantes: {missing_deps}", "yellow")
                if self.install_dependencies():
                    self.log("✅ Dependencias instaladas", "green")
                else:
                    self.log("❌ Error instalando dependencias", "red")
                    return False
            
            # 3. Configurar entorno
            self.setup_development_environment()
            
            # 4. Crear scripts
            self.create_dev_scripts()
            
            # 5. Verificar calidad
            self.check_code_quality()
            
            # 6. Mostrar información
            self.show_development_info()
            
            self.log("\n🎉 Optimización completada exitosamente!", "bold")
            self.log("El entorno de desarrollo está listo para usar.", "green")
            
            return True
            
        except Exception as e:
            self.log(f"❌ Error durante la optimización: {e}", "red")
            return False

def main():
    """Función principal"""
    optimizer = PythonDevOptimizer()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "start":
            optimizer.start_fastapi_server()
        elif command == "test":
            optimizer.run_tests()
        elif command == "quality":
            optimizer.check_code_quality()
        elif command == "setup":
            optimizer.setup_development_environment()
        else:
            optimizer.log(f"❌ Comando desconocido: {command}", "red")
            return 1
    else:
        optimizer.run_optimization()
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 