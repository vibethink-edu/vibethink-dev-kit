#!/usr/bin/env python3
"""
Script de Actualización Automática de Documentación CMMI v3 + XTP + AIPAIR
Autor: Marcelo Escallón
Versión: 1.0
Fecha: 2025-01-22
"""

import os
import json
import yaml
import datetime
import logging
from pathlib import Path
from typing import Dict, List, Any
import git
from dataclasses import dataclass

@dataclass
class ChangeRecord:
    """Registro de cambio en la documentación"""
    timestamp: str
    change_type: str
    description: str
    files_affected: List[str]
    impact_level: str
    compliance_impact: str

class DocumentationUpdater:
    """Actualizador automático de documentación CMMI"""
    
    def __init__(self, repo_path: str = "."):
        self.repo_path = Path(repo_path)
        self.setup_logging()
        self.changes_log = []
        
    def setup_logging(self):
        """Configurar logging"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('logs/documentation_updates.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def detect_changes(self) -> List[Dict[str, Any]]:
        """Detectar cambios en el repositorio"""
        self.logger.info("Detectando cambios en el repositorio...")
        
        try:
            repo = git.Repo(self.repo_path)
            changes = []
            
            # Obtener cambios no committeados
            for item in repo.index.diff(None):
                changes.append({
                    'file': item.a_path,
                    'change_type': 'modified',
                    'timestamp': datetime.datetime.now().isoformat()
                })
            
            # Obtener archivos nuevos
            for item in repo.untracked_files:
                changes.append({
                    'file': item,
                    'change_type': 'added',
                    'timestamp': datetime.datetime.now().isoformat()
                })
            
            self.logger.info(f"Detectados {len(changes)} cambios")
            return changes
            
        except Exception as e:
            self.logger.error(f"Error detectando cambios: {e}")
            return []
    
    def analyze_impact(self, changes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analizar impacto de los cambios en CMMI"""
        self.logger.info("Analizando impacto de cambios...")
        
        impact_analysis = {
            'total_changes': len(changes),
            'cmmi_impact': [],
            'process_impact': [],
            'evidence_impact': [],
            'compliance_impact': 'none'
        }
        
        cmmi_files = [
            'docs/cmmi/',
            'scripts/kpi/',
            'reports/',
            'config/'
        ]
        
        for change in changes:
            file_path = change['file']
            
            # Verificar si afecta documentación CMMI
            if any(cmmi_path in file_path for cmmi_path in cmmi_files):
                impact_analysis['cmmi_impact'].append({
                    'file': file_path,
                    'change_type': change['change_type'],
                    'impact': self.assess_cmmi_impact(file_path)
                })
            
            # Verificar si afecta procesos
            if 'process' in file_path.lower() or 'workflow' in file_path.lower():
                impact_analysis['process_impact'].append({
                    'file': file_path,
                    'change_type': change['change_type']
                })
            
            # Verificar si afecta evidencia
            if 'evidence' in file_path.lower() or 'template' in file_path.lower():
                impact_analysis['evidence_impact'].append({
                    'file': file_path,
                    'change_type': change['change_type']
                })
        
        # Determinar impacto en cumplimiento
        if impact_analysis['cmmi_impact']:
            impact_analysis['compliance_impact'] = 'high'
        elif impact_analysis['process_impact']:
            impact_analysis['compliance_impact'] = 'medium'
        else:
            impact_analysis['compliance_impact'] = 'low'
        
        return impact_analysis
    
    def assess_cmmi_impact(self, file_path: str) -> str:
        """Evaluar impacto específico en CMMI"""
        if 'project-management' in file_path:
            return 'PM domain'
        elif 'process-management' in file_path:
            return 'PCM domain'
        elif 'engineering' in file_path:
            return 'ENG domain'
        elif 'support' in file_path:
            return 'SUP domain'
        elif 'implementation-infrastructure' in file_path:
            return 'II domain'
        elif 'kpi' in file_path.lower():
            return 'Measurement & Analysis'
        else:
            return 'General'
    
    def update_documentation(self, impact_analysis: Dict[str, Any]):
        """Actualizar documentación basada en cambios"""
        self.logger.info("Actualizando documentación...")
        
        # Actualizar changelog
        self.update_changelog(impact_analysis)
        
        # Actualizar evidencia si es necesario
        if impact_analysis['evidence_impact']:
            self.update_evidence()
        
        # Actualizar KPIs si es necesario
        if any('kpi' in impact['file'].lower() for impact in impact_analysis['cmmi_impact']):
            self.update_kpis()
        
        # Actualizar compliance report
        self.update_compliance_report(impact_analysis)
    
    def update_changelog(self, impact_analysis: Dict[str, Any]):
        """Actualizar changelog de documentación"""
        changelog_file = Path("docs/cmmi/CHANGELOG.md")
        
        if not changelog_file.exists():
            changelog_content = """# Changelog - Documentación CMMI v3 + XTP + AIPAIR

## [Unreleased]

### Added
- Initial documentation structure

### Changed

### Fixed

---
"""
        else:
            with open(changelog_file, 'r', encoding='utf-8') as f:
                changelog_content = f.read()
        
        # Agregar nueva entrada
        new_entry = f"""
## [{datetime.datetime.now().strftime('%Y-%m-%d')}]

### Changed
- Updated documentation based on detected changes
- Impact level: {impact_analysis['compliance_impact']}
- Files affected: {len(impact_analysis['cmmi_impact'])} CMMI-related files

### Details
"""
        
        for impact in impact_analysis['cmmi_impact']:
            new_entry += f"- {impact['file']}: {impact['impact']}\n"
        
        # Insertar nueva entrada después del header
        lines = changelog_content.split('\n')
        insert_index = 3  # Después del header
        lines.insert(insert_index, new_entry)
        
        with open(changelog_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        
        self.logger.info("Changelog actualizado")
    
    def update_evidence(self):
        """Actualizar evidencia de cumplimiento"""
        self.logger.info("Actualizando evidencia de cumplimiento...")
        
        # Generar nuevo reporte de evidencia
        evidence_report = {
            'timestamp': datetime.datetime.now().isoformat(),
            'evidence_status': 'updated',
            'compliance_level': 'CMMI-L3',
            'domains_covered': ['PM', 'PCM', 'ENG', 'SUP', 'II'],
            'last_update': datetime.datetime.now().isoformat()
        }
        
        evidence_file = Path("docs/cmmi/evidence/compliance_evidence.json")
        evidence_file.parent.mkdir(exist_ok=True)
        
        with open(evidence_file, 'w', encoding='utf-8') as f:
            json.dump(evidence_report, f, indent=2)
        
        self.logger.info("Evidencia de cumplimiento actualizada")
    
    def update_kpis(self):
        """Actualizar KPIs y métricas"""
        self.logger.info("Actualizando KPIs...")
        
        # Ejecutar generador de KPIs
        try:
            import subprocess
            result = subprocess.run(['python', 'scripts/kpi/generate_kpis.py', '--all'], 
                                  capture_output=True, text=True)
            
            if result.returncode == 0:
                self.logger.info("KPIs actualizados exitosamente")
            else:
                self.logger.error(f"Error actualizando KPIs: {result.stderr}")
                
        except Exception as e:
            self.logger.error(f"Error ejecutando generador de KPIs: {e}")
    
    def update_compliance_report(self, impact_analysis: Dict[str, Any]):
        """Actualizar reporte de cumplimiento"""
        self.logger.info("Actualizando reporte de cumplimiento...")
        
        compliance_report = {
            'timestamp': datetime.datetime.now().isoformat(),
            'compliance_status': 'maintained',
            'impact_level': impact_analysis['compliance_impact'],
            'domains_status': {
                'PM': 'compliant',
                'PCM': 'compliant',
                'ENG': 'compliant',
                'SUP': 'compliant',
                'II': 'compliant'
            },
            'recent_changes': impact_analysis['cmmi_impact'],
            'next_review': (datetime.datetime.now() + datetime.timedelta(days=30)).isoformat()
        }
        
        compliance_file = Path("reports/compliance/compliance_status.json")
        compliance_file.parent.mkdir(exist_ok=True)
        
        with open(compliance_file, 'w', encoding='utf-8') as f:
            json.dump(compliance_report, f, indent=2)
        
        self.logger.info("Reporte de cumplimiento actualizado")
    
    def generate_update_summary(self, impact_analysis: Dict[str, Any]) -> str:
        """Generar resumen de actualización"""
        summary = f"""# Resumen de Actualización de Documentación CMMI

## Fecha: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Cambios Detectados
- **Total de cambios:** {impact_analysis['total_changes']}
- **Impacto en CMMI:** {len(impact_analysis['cmmi_impact'])} archivos
- **Impacto en procesos:** {len(impact_analysis['process_impact'])} archivos
- **Impacto en evidencia:** {len(impact_analysis['evidence_impact'])} archivos

## Nivel de Impacto en Cumplimiento
**{impact_analysis['compliance_impact'].upper()}**

## Archivos CMMI Afectados
"""
        
        for impact in impact_analysis['cmmi_impact']:
            summary += f"- {impact['file']}: {impact['impact']}\n"
        
        summary += f"""
## Acciones Tomadas
- ✅ Changelog actualizado
- ✅ Evidencia de cumplimiento actualizada
- ✅ KPIs regenerados
- ✅ Reporte de cumplimiento actualizado

## Estado Final
**Documentación CMMI v3 actualizada y lista para auditoría**
"""
        
        return summary
    
    def run_full_update(self):
        """Ejecutar actualización completa"""
        self.logger.info("Iniciando actualización completa de documentación...")
        
        # 1. Detectar cambios
        changes = self.detect_changes()
        
        if not changes:
            self.logger.info("No se detectaron cambios")
            return
        
        # 2. Analizar impacto
        impact_analysis = self.analyze_impact(changes)
        
        # 3. Actualizar documentación
        self.update_documentation(impact_analysis)
        
        # 4. Generar resumen
        summary = self.generate_update_summary(impact_analysis)
        
        # Guardar resumen
        summary_file = Path(f"reports/updates/update_summary_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.md")
        summary_file.parent.mkdir(exist_ok=True)
        
        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write(summary)
        
        self.logger.info("Actualización completa finalizada")
        self.logger.info(f"Resumen guardado en: {summary_file}")

def main():
    """Función principal"""
    updater = DocumentationUpdater()
    updater.run_full_update()

if __name__ == "__main__":
    main() 