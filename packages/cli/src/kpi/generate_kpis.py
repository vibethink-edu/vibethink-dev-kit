#!/usr/bin/env python3
"""
Script de Automatización de KPIs para CMMI v3 + XTP + AIPAIR
Autor: Marcelo Escallón
Versión: 1.0
Fecha: 2025-01-22
"""

import json
import yaml
import datetime
import logging
import os
from typing import Dict, List, Any
from dataclasses import dataclass, asdict
from pathlib import Path
import argparse

@dataclass
class KPIConfig:
    """Configuración de KPIs por cliente"""
    client_name: str
    industry: str
    business_model: str
    risk_tolerance: str
    priority_kpis: List[str]
    thresholds: Dict[str, Dict[str, float]]
    review_frequency: Dict[str, List[str]]

class KPIGenerator:
    """Generador automático de KPIs"""
    
    def __init__(self, config_path: str = None):
        self.config_path = Path(config_path) if config_path else Path("config/kpi_config.yaml")
        self.setup_logging()
        self.load_templates()
        self.setup_directories()
    
    def setup_logging(self):
        """Configurar logging"""
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_dir / 'kpi_generation.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def setup_directories(self):
        """Crear directorios necesarios"""
        directories = [
            "reports/kpi",
            "reports/alerts", 
            "data/trends",
            "dashboard",
            "config"
        ]
        
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)
    
    def load_templates(self):
        """Cargar templates de KPIs"""
        self.logger.info("Cargando templates de KPIs...")
        
        # Templates predefinidos por industria
        self.templates = {
            "fintech": {
                "priority_kpis": ["security_compliance", "process_predictability", "code_quality"],
                "thresholds": {
                    "security_compliance": {"green": 95, "yellow": 85, "red": 85},
                    "defect_density": {"green": 0.5, "yellow": 1.0, "red": 1.0},
                    "code_coverage": {"green": 90, "yellow": 80, "red": 80}
                }
            },
            "healthcare": {
                "priority_kpis": ["data_protection", "functional_quality", "process_quality"],
                "thresholds": {
                    "data_protection": {"green": 99, "yellow": 95, "red": 95},
                    "defect_density": {"green": 0.3, "yellow": 0.8, "red": 0.8},
                    "requirements_coverage": {"green": 98, "yellow": 95, "red": 95}
                }
            },
            "ecommerce": {
                "priority_kpis": ["experience_quality", "performance_metrics", "business_value"],
                "thresholds": {
                    "performance_metrics": {"green": 2.0, "yellow": 3.0, "red": 3.0},
                    "user_satisfaction": {"green": 4.5, "yellow": 4.0, "red": 4.0},
                    "conversion_rate": {"green": 3.0, "yellow": 2.0, "red": 2.0}
                }
            },
            "enterprise": {
                "priority_kpis": ["process_predictability", "stakeholder_management", "resource_management"],
                "thresholds": {
                    "schedule_variance": {"green": 10, "yellow": 20, "red": 20},
                    "stakeholder_satisfaction": {"green": 85, "yellow": 75, "red": 75},
                    "team_utilization": {"green": 80, "yellow": 70, "red": 70}
                }
            },
            "startup": {
                "priority_kpis": ["innovation_metrics", "adaptation_speed", "business_value"],
                "thresholds": {
                    "innovation_rate": {"green": 20, "yellow": 10, "red": 10},
                    "cycle_time": {"green": 7, "yellow": 14, "red": 14},
                    "feature_usage": {"green": 60, "yellow": 40, "red": 40}
                }
            }
        }
    
    def generate_sample_data(self, kpi_name: str) -> float:
        """Generar datos de muestra para KPIs"""
        import random
        
        # Simular valores realistas según el KPI
        if "security" in kpi_name or "compliance" in kpi_name:
            return random.uniform(85, 99)
        elif "defect" in kpi_name:
            return random.uniform(0.1, 2.0)
        elif "coverage" in kpi_name:
            return random.uniform(70, 95)
        elif "performance" in kpi_name:
            return random.uniform(1.0, 5.0)
        elif "satisfaction" in kpi_name:
            return random.uniform(3.5, 5.0)
        else:
            return random.uniform(50, 95)
    
    def evaluate_kpi_status(self, value: float, thresholds: Dict[str, float]) -> str:
        """Evaluar estado del KPI basado en umbrales"""
        if value >= thresholds["green"]:
            return "green"
        elif value >= thresholds["yellow"]:
            return "yellow"
        else:
            return "red"
    
    def generate_kpi_report(self, client_config: KPIConfig) -> Dict[str, Any]:
        """Generar reporte de KPIs para un cliente"""
        self.logger.info(f"Generando reporte de KPIs para: {client_config.client_name}")
        
        # Obtener template según industria
        template = self.templates.get(client_config.industry, self.templates["enterprise"])
        
        # Generar KPIs detallados
        detailed_kpis = []
        critical_kpis = []
        trending_up = []
        trending_down = []
        requires_attention = []
        
        for kpi_name in template["priority_kpis"]:
            current_value = self.generate_sample_data(kpi_name)
            thresholds = template["thresholds"].get(kpi_name, {"green": 80, "yellow": 70, "red": 70})
            status = self.evaluate_kpi_status(current_value, thresholds)
            
            kpi_data = {
                "name": kpi_name,
                "current_value": round(current_value, 2),
                "target": thresholds["green"],
                "status": status,
                "thresholds": thresholds,
                "trend": "up" if current_value > thresholds["green"] else "down" if current_value < thresholds["yellow"] else "stable"
            }
            
            detailed_kpis.append(kpi_data)
            
            if kpi_name in client_config.priority_kpis:
                critical_kpis.append(kpi_data)
            
            if kpi_data["trend"] == "up":
                trending_up.append(kpi_data)
            elif kpi_data["trend"] == "down":
                trending_down.append(kpi_data)
            
            if status in ["red", "yellow"]:
                requires_attention.append(kpi_data)
        
        # Calcular estado general
        overall_status = self.calculate_overall_status(critical_kpis)
        
        # Generar recomendaciones
        recommendations = self.generate_recommendations(requires_attention)
        
        report = {
            "client_info": {
                "name": client_config.client_name,
                "industry": client_config.industry,
                "business_model": client_config.business_model,
                "risk_tolerance": client_config.risk_tolerance,
                "generation_date": datetime.datetime.now().isoformat(),
                "version": "1.0"
            },
            "kpi_summary": {
                "overall_status": overall_status,
                "critical_kpis": critical_kpis,
                "trending_up": trending_up,
                "trending_down": trending_down,
                "requires_attention": requires_attention,
                "total_kpis": len(detailed_kpis)
            },
            "detailed_kpis": detailed_kpis,
            "recommendations": recommendations,
            "next_review": self.calculate_next_review(client_config),
            "metadata": {
                "generator": "XTP + CMMI v3 + AIPAIR",
                "template_used": client_config.industry,
                "automation_level": "high"
            }
        }
        
        return report
    
    def calculate_overall_status(self, critical_kpis: List[Dict]) -> str:
        """Calcular estado general basado en KPIs críticos"""
        if not critical_kpis:
            return "unknown"
        
        red_count = sum(1 for kpi in critical_kpis if kpi["status"] == "red")
        yellow_count = sum(1 for kpi in critical_kpis if kpi["status"] == "yellow")
        
        if red_count > 0:
            return "red"
        elif yellow_count > len(critical_kpis) * 0.3:  # Más del 30% en amarillo
            return "yellow"
        else:
            return "green"
    
    def generate_recommendations(self, attention_kpis: List[Dict]) -> List[Dict]:
        """Generar recomendaciones basadas en KPIs que requieren atención"""
        recommendations = []
        
        for kpi in attention_kpis:
            if kpi["status"] == "red":
                recommendations.append({
                    "priority": "high",
                    "kpi": kpi["name"],
                    "description": f"KPI {kpi['name']} está en estado crítico. Revisión inmediata requerida.",
                    "action": f"Implementar plan de mejora para {kpi['name']}"
                })
            elif kpi["status"] == "yellow":
                recommendations.append({
                    "priority": "medium",
                    "kpi": kpi["name"],
                    "description": f"KPI {kpi['name']} requiere monitoreo y mejora.",
                    "action": f"Analizar tendencias de {kpi['name']} y definir acciones preventivas"
                })
        
        return recommendations
    
    def calculate_next_review(self, client_config: KPIConfig) -> str:
        """Calcular fecha de próxima revisión"""
        next_review = datetime.datetime.now() + datetime.timedelta(days=7)
        return next_review.strftime("%Y-%m-%d")
    
    def save_report(self, report: Dict[str, Any], output_path: str):
        """Guardar reporte en formato JSON y Markdown"""
        # Guardar JSON
        json_path = Path(output_path).with_suffix('.json')
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        # Guardar Markdown
        md_path = Path(output_path).with_suffix('.md')
        markdown_content = self.convert_to_markdown(report)
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        self.logger.info(f"Reporte guardado en: {json_path} y {md_path}")
    
    def convert_to_markdown(self, report: Dict[str, Any]) -> str:
        """Convertir reporte a formato Markdown"""
        client_info = report['client_info']
        kpi_summary = report['kpi_summary']
        
        status_emoji = {
            "green": "🟢",
            "yellow": "🟡", 
            "red": "🔴",
            "unknown": "⚪"
        }
        
        md_content = f"""# Reporte de KPIs - {client_info['name']}

## Resumen Ejecutivo
- **Estado General**: {status_emoji.get(kpi_summary['overall_status'], '⚪')} {kpi_summary['overall_status'].upper()}
- **Fecha de Generación**: {client_info['generation_date']}
- **Industria**: {client_info['industry']}
- **Modelo de Negocio**: {client_info['business_model']}
- **Tolerancia al Riesgo**: {client_info['risk_tolerance']}

## KPIs Críticos
"""
        
        for kpi in kpi_summary['critical_kpis']:
            status_icon = status_emoji.get(kpi['status'], '⚪')
            md_content += f"- {status_icon} **{kpi['name']}**: {kpi['current_value']} vs {kpi['target']} - {kpi['status'].upper()}\n"
        
        md_content += f"""
## Tendencias
### 📈 Mejorando ({len(kpi_summary['trending_up'])})
"""
        for trend in kpi_summary['trending_up']:
            md_content += f"- {trend['name']}: {trend['current_value']} (↑)\n"
        
        md_content += f"""
### 📉 Requieren Atención ({len(kpi_summary['requires_attention'])})
"""
        for attention in kpi_summary['requires_attention']:
            status_icon = status_emoji.get(attention['status'], '⚪')
            md_content += f"- {status_icon} {attention['name']}: {attention['current_value']} ({attention['status'].upper()})\n"
        
        md_content += f"""
## Recomendaciones
"""
        for i, rec in enumerate(report['recommendations'], 1):
            priority_icon = "🔴" if rec['priority'] == 'high' else "🟡"
            md_content += f"{i}. {priority_icon} **{rec['kpi']}**: {rec['description']}\n   - *Acción*: {rec['action']}\n\n"
        
        md_content += f"""
## Próxima Revisión
**{report['next_review']}**

---
*Reporte generado automáticamente por el sistema XTP + CMMI v3 + AIPAIR*
*Versión: {report.get('metadata', {}).get('version', '1.0')} | Template: {report.get('metadata', {}).get('template_used', client_info['industry'])}*
"""
        
        return md_content
    
    def generate_all_reports(self):
        """Generar reportes para todos los clientes de ejemplo"""
        self.logger.info("Generando reportes para todos los clientes de ejemplo...")
        
        example_clients = [
            KPIConfig(
                client_name="Banco Digital XYZ",
                industry="fintech",
                business_model="B2C",
                risk_tolerance="bajo",
                priority_kpis=["security_compliance", "defect_density", "code_coverage"],
                thresholds={},
                review_frequency={"daily": ["security_vulnerabilities"], "weekly": ["compliance_audit_score"]}
            ),
            KPIConfig(
                client_name="Hospital San José",
                industry="healthcare", 
                business_model="B2B",
                risk_tolerance="muy_bajo",
                priority_kpis=["data_protection", "defect_density", "requirements_coverage"],
                thresholds={},
                review_frequency={"daily": ["data_breach_incidents"], "weekly": ["defect_density"]}
            ),
            KPIConfig(
                client_name="E-commerce Rápido",
                industry="ecommerce",
                business_model="B2C", 
                risk_tolerance="medio",
                priority_kpis=["performance_metrics", "user_satisfaction", "conversion_rate"],
                thresholds={},
                review_frequency={"hourly": ["performance_metrics"], "daily": ["user_satisfaction"]}
            )
        ]
        
        for client in example_clients:
            report = self.generate_kpi_report(client)
            safe_name = client.client_name.replace(" ", "_").lower()
            output_path = f"reports/kpi/{safe_name}_kpi_report"
            self.save_report(report, output_path)
        
        self.logger.info("Reportes generados exitosamente para todos los clientes")

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description='Generador de KPIs para CMMI v3 + XTP + AIPAIR')
    parser.add_argument('--config', help='Ruta al archivo de configuración')
    parser.add_argument('--client', help='Nombre del cliente específico')
    parser.add_argument('--all', action='store_true', help='Generar reportes para todos los clientes')
    
    args = parser.parse_args()
    
    generator = KPIGenerator(args.config)
    
    if args.all:
        generator.generate_all_reports()
    else:
        # Ejemplo de configuración de cliente
        client_config = KPIConfig(
            client_name=args.client or "Cliente Ejemplo",
            industry="fintech",
            business_model="B2B",
            risk_tolerance="bajo",
            priority_kpis=["security_compliance", "process_quality", "code_quality"],
            thresholds={},
            review_frequency={"daily": ["security_vulnerabilities"], "weekly": ["compliance_audit_score"]}
        )
        
        # Generar reporte
        report = generator.generate_kpi_report(client_config)
        
        # Guardar reporte
        safe_name = client_config.client_name.replace(" ", "_").lower()
        output_path = f"reports/kpi/{safe_name}_kpi_report"
        generator.save_report(report, output_path)

if __name__ == "__main__":
    main() 