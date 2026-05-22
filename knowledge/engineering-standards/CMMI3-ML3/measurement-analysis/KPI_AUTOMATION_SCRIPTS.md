# Scripts de Automatización de KPIs - CMMI v3 + XTP + VibeThink

## Resumen Ejecutivo

Este documento proporciona **scripts de automatización** para la generación, actualización y monitoreo de KPIs, integrados con la metodología XTP + CMMI v3 + VibeThink.

---

## 1. Script Principal de Generación de KPIs

### 1.1 Script Python - Generador de KPIs
```python
#!/usr/bin/env python3
"""
Script de Automatización de KPIs para CMMI v3 + XTP + VibeThink
Autor: Marcelo Escallón
Versión: 1.0
"""

import json
import yaml
import datetime
import logging
from typing import Dict, List, Any
from dataclasses import dataclass
from pathlib import Path

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
    
    def __init__(self, config_path: str):
        self.config_path = Path(config_path)
        self.setup_logging()
        self.load_templates()
    
    def setup_logging(self):
        """Configurar logging"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('kpi_generation.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def load_templates(self):
        """Cargar templates de KPIs"""
        templates_path = Path("docs/cmmi/measurement-analysis/KPI_CLIENT_TEMPLATES.md")
        self.logger.info(f"Cargando templates desde: {templates_path}")
        
        # Aquí se cargarían los templates desde el archivo
        self.templates = {
            "fintech": self.load_fintech_template(),
            "healthcare": self.load_healthcare_template(),
            "ecommerce": self.load_ecommerce_template(),
            "enterprise": self.load_enterprise_template(),
            "startup": self.load_startup_template(),
            "consulting": self.load_consulting_template(),
            "government": self.load_government_template(),
            "mobile": self.load_mobile_template()
        }
    
    def generate_kpi_report(self, client_config: KPIConfig) -> Dict[str, Any]:
        """Generar reporte de KPIs para un cliente"""
        self.logger.info(f"Generando reporte de KPIs para: {client_config.client_name}")
        
        report = {
            "client_info": {
                "name": client_config.client_name,
                "industry": client_config.industry,
                "business_model": client_config.business_model,
                "risk_tolerance": client_config.risk_tolerance,
                "generation_date": datetime.datetime.now().isoformat()
            },
            "kpi_summary": self.generate_kpi_summary(client_config),
            "detailed_kpis": self.generate_detailed_kpis(client_config),
            "trends": self.analyze_trends(client_config),
            "recommendations": self.generate_recommendations(client_config),
            "next_review": self.calculate_next_review(client_config)
        }
        
        return report
    
    def generate_kpi_summary(self, config: KPIConfig) -> Dict[str, Any]:
        """Generar resumen ejecutivo de KPIs"""
        return {
            "overall_status": self.calculate_overall_status(config),
            "critical_kpis": self.get_critical_kpis(config),
            "trending_up": self.get_trending_kpis(config, "up"),
            "trending_down": self.get_trending_kpis(config, "down"),
            "requires_attention": self.get_attention_kpis(config)
        }
    
    def calculate_overall_status(self, config: KPIConfig) -> str:
        """Calcular estado general basado en KPIs críticos"""
        # Lógica para calcular estado general (Verde/Amarillo/Rojo)
        return "Verde"  # Placeholder
    
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
        md_content = f"""# Reporte de KPIs - {report['client_info']['name']}

## Resumen Ejecutivo
- **Estado General**: {report['kpi_summary']['overall_status']}
- **Fecha de Generación**: {report['client_info']['generation_date']}
- **Industria**: {report['client_info']['industry']}

## KPIs Críticos
"""
        
        for kpi in report['kpi_summary']['critical_kpis']:
            md_content += f"- **{kpi['name']}**: {kpi['value']} vs {kpi['target']} - {kpi['status']}\n"
        
        md_content += f"""
## Tendencias
### Mejorando
"""
        for trend in report['kpi_summary']['trending_up']:
            md_content += f"- {trend['name']}: {trend['trend']}\n"
        
        md_content += f"""
### Requieren Atención
"""
        for attention in report['kpi_summary']['requires_attention']:
            md_content += f"- {attention['name']}: {attention['issue']}\n"
        
        md_content += f"""
## Recomendaciones
"""
        for rec in report['recommendations']:
            md_content += f"1. {rec['description']}\n"
        
        md_content += f"""
## Próxima Revisión
{report['next_review']}

---
*Reporte generado automáticamente por el sistema XTP + CMMI v3 + VibeThink*
"""
        
        return md_content

def main():
    """Función principal"""
    generator = KPIGenerator("config/kpi_config.yaml")
    
    # Ejemplo de configuración de cliente
    client_config = KPIConfig(
        client_name="Cliente Ejemplo",
        industry="fintech",
        business_model="B2B",
        risk_tolerance="bajo",
        priority_kpis=["security_compliance", "process_quality", "code_quality"],
        thresholds={
            "green": {"security_score": 95, "quality_score": 90},
            "yellow": {"security_score": 85, "quality_score": 80},
            "red": {"security_score": 85, "quality_score": 80}
        },
        review_frequency={
            "daily": ["security_vulnerabilities"],
            "weekly": ["compliance_audit_score"],
            "monthly": ["process_compliance"]
        }
    )
    
    # Generar reporte
    report = generator.generate_kpi_report(client_config)
    
    # Guardar reporte
    generator.save_report(report, "reports/kpi_report_example")

if __name__ == "__main__":
    main()
```

---

## 2. Script de Monitoreo en Tiempo Real

### 2.1 Script Node.js - Monitor de KPIs
```javascript
/**
 * Monitor de KPIs en Tiempo Real - CMMI v3 + XTP + VibeThink
 * Autor: Marcelo Escallón
 * Versión: 1.0
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class KPIMonitor {
    constructor(configPath) {
        this.configPath = configPath;
        this.config = this.loadConfig();
        this.alerts = [];
        this.setupLogging();
    }

    loadConfig() {
        try {
            const configFile = fs.readFileSync(this.configPath, 'utf8');
            return yaml.load(configFile);
        } catch (error) {
            console.error('Error cargando configuración:', error);
            return {};
        }
    }

    setupLogging() {
        this.logger = {
            info: (msg) => console.log(`[INFO] ${new Date().toISOString()}: ${msg}`),
            warn: (msg) => console.log(`[WARN] ${new Date().toISOString()}: ${msg}`),
            error: (msg) => console.log(`[ERROR] ${new Date().toISOString()}: ${msg}`)
        };
    }

    async monitorKPIs() {
        this.logger.info('Iniciando monitoreo de KPIs...');
        
        for (const client of this.config.clients) {
            await this.monitorClientKPIs(client);
        }
        
        this.processAlerts();
    }

    async monitorClientKPIs(client) {
        this.logger.info(`Monitoreando KPIs para: ${client.name}`);
        
        for (const kpi of client.kpis) {
            const currentValue = await this.getCurrentKPIValue(kpi);
            const status = this.evaluateKPIStatus(kpi, currentValue);
            
            if (status !== 'green') {
                this.createAlert(client, kpi, currentValue, status);
            }
            
            this.updateKPITrend(client, kpi, currentValue);
        }
    }

    async getCurrentKPIValue(kpi) {
        // Simulación de obtención de valor actual
        // En implementación real, esto conectaría con sistemas de monitoreo
        return Math.random() * 100;
    }

    evaluateKPIStatus(kpi, value) {
        const thresholds = kpi.thresholds;
        
        if (value >= thresholds.green) return 'green';
        if (value >= thresholds.yellow) return 'yellow';
        return 'red';
    }

    createAlert(client, kpi, value, status) {
        const alert = {
            timestamp: new Date().toISOString(),
            client: client.name,
            kpi: kpi.name,
            currentValue: value,
            status: status,
            threshold: kpi.thresholds[status],
            message: `KPI ${kpi.name} está en estado ${status} (${value} vs ${kpi.thresholds[status]})`
        };
        
        this.alerts.push(alert);
        this.logger.warn(alert.message);
    }

    updateKPITrend(client, kpi, value) {
        const trendFile = path.join('data', 'trends', `${client.name}_${kpi.name}.json`);
        
        let trends = [];
        if (fs.existsSync(trendFile)) {
            trends = JSON.parse(fs.readFileSync(trendFile, 'utf8'));
        }
        
        trends.push({
            timestamp: new Date().toISOString(),
            value: value
        });
        
        // Mantener solo los últimos 30 días
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        trends = trends.filter(trend => 
            new Date(trend.timestamp) > thirtyDaysAgo
        );
        
        fs.writeFileSync(trendFile, JSON.stringify(trends, null, 2));
    }

    processAlerts() {
        if (this.alerts.length === 0) {
            this.logger.info('No hay alertas activas');
            return;
        }
        
        this.logger.info(`Procesando ${this.alerts.length} alertas...`);
        
        // Agrupar alertas por cliente
        const alertsByClient = {};
        this.alerts.forEach(alert => {
            if (!alertsByClient[alert.client]) {
                alertsByClient[alert.client] = [];
            }
            alertsByClient[alert.client].push(alert);
        });
        
        // Generar reportes de alertas
        for (const [client, alerts] of Object.entries(alertsByClient)) {
            this.generateAlertReport(client, alerts);
        }
        
        // Enviar notificaciones si está configurado
        this.sendNotifications();
    }

    generateAlertReport(client, alerts) {
        const report = {
            client: client,
            timestamp: new Date().toISOString(),
            totalAlerts: alerts.length,
            alerts: alerts,
            summary: {
                red: alerts.filter(a => a.status === 'red').length,
                yellow: alerts.filter(a => a.status === 'yellow').length
            }
        };
        
        const reportPath = path.join('reports', 'alerts', `${client}_${new Date().toISOString().split('T')[0]}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        this.logger.info(`Reporte de alertas generado: ${reportPath}`);
    }

    sendNotifications() {
        // Implementar envío de notificaciones (email, Slack, etc.)
        this.logger.info('Enviando notificaciones...');
    }
}

// Configuración de ejemplo
const configExample = {
    clients: [
        {
            name: "Cliente Fintech",
            industry: "fintech",
            kpis: [
                {
                    name: "security_compliance",
                    thresholds: { green: 95, yellow: 85, red: 85 },
                    monitoring_frequency: "hourly"
                },
                {
                    name: "defect_density",
                    thresholds: { green: 0.5, yellow: 1.0, red: 1.0 },
                    monitoring_frequency: "daily"
                }
            ]
        }
    ]
};

// Ejecutar monitor
const monitor = new KPIMonitor('config/kpi_monitor_config.yaml');
monitor.monitorKPIs();
```

---

## 3. Script de Integración CI/CD

### 3.1 GitHub Actions - Automatización de KPIs
```yaml
# .github/workflows/kpi-automation.yml
name: KPI Automation - CMMI v3 + XTP + VibeThink

on:
  schedule:
    # Ejecutar diariamente a las 6:00 AM UTC
    - cron: '0 6 * * *'
  workflow_dispatch:
    # Permitir ejecución manual
  push:
    branches: [main]
    paths:
      - 'docs/cmmi/measurement-analysis/**'
      - 'scripts/kpi/**'

jobs:
  generate-kpis:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
        
    - name: Install dependencies
      run: |
        pip install pyyaml jinja2
        
    - name: Generate KPI Reports
      run: |
        python scripts/kpi/generate_kpis.py
        
    - name: Upload KPI Reports
      uses: actions/upload-artifact@v3
      with:
        name: kpi-reports
        path: reports/kpi/
        
    - name: Commit KPI Reports
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add reports/kpi/
        git commit -m "Update KPI reports - $(date)" || exit 0
        git push
        
  monitor-kpis:
    runs-on: ubuntu-latest
    needs: generate-kpis
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        npm install js-yaml
        
    - name: Run KPI Monitor
      run: |
        node scripts/kpi/monitor_kpis.js
        
    - name: Check for alerts
      id: check-alerts
      run: |
        if [ -f "reports/alerts/active_alerts.json" ]; then
          echo "alerts=true" >> $GITHUB_OUTPUT
        else
          echo "alerts=false" >> $GITHUB_OUTPUT
        fi
        
    - name: Send Slack notification
      if: steps.check-alerts.outputs.alerts == 'true'
      uses: 8398a7/action-slack@v3
      with:
        status: failure
        text: "⚠️ KPI Alerts detected! Check the latest reports."
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        
  update-dashboard:
    runs-on: ubuntu-latest
    needs: [generate-kpis, monitor-kpis]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Update KPI Dashboard
      run: |
        python scripts/kpi/update_dashboard.py
        
    - name: Deploy Dashboard
      run: |
        # Deploy updated dashboard to hosting service
        echo "Dashboard updated successfully"
```

---

## 4. Script de Dashboard y Visualización

### 4.1 Script Python - Generador de Dashboard
```python
#!/usr/bin/env python3
"""
Generador de Dashboard de KPIs - CMMI v3 + XTP + VibeThink
"""

import json
import datetime
from pathlib import Path
from typing import Dict, List, Any

class KPIDashboardGenerator:
    """Generador de dashboard HTML para KPIs"""
    
    def __init__(self, data_path: str):
        self.data_path = Path(data_path)
        self.reports = self.load_reports()
        
    def load_reports(self) -> List[Dict[str, Any]]:
        """Cargar reportes de KPIs"""
        reports = []
        for report_file in self.data_path.glob("*.json"):
            with open(report_file, 'r', encoding='utf-8') as f:
                reports.append(json.load(f))
        return reports
        
    def generate_dashboard_html(self) -> str:
        """Generar HTML del dashboard"""
        html_content = """
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard de KPIs - CMMI v3 + XTP + VibeThink</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
        .status-green { color: #28a745; }
        .status-yellow { color: #ffc107; }
        .status-red { color: #dc3545; }
        .chart-container { height: 300px; }
    </style>
</head>
<body>
    <h1>Dashboard de KPIs - CMMI v3 + XTP + VibeThink</h1>
    <p>Última actualización: """ + datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") + """</p>
    
    <div class="dashboard">
"""
        
        # Generar tarjetas de resumen
        for report in self.reports:
            html_content += self.generate_client_card(report)
        
        html_content += """
    </div>
    
    <script>
        // Configuración de gráficos
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };
        
        // Aquí se agregarían los gráficos específicos
        console.log('Dashboard cargado correctamente');
    </script>
</body>
</html>
"""
        
        return html_content
    
    def generate_client_card(self, report: Dict[str, Any]) -> str:
        """Generar tarjeta de cliente"""
        client_info = report.get('client_info', {})
        kpi_summary = report.get('kpi_summary', {})
        
        status_class = f"status-{kpi_summary.get('overall_status', 'unknown').lower()}"
        
        card_html = f"""
        <div class="card">
            <h3>{client_info.get('name', 'Cliente')}</h3>
            <p><strong>Industria:</strong> {client_info.get('industry', 'N/A')}</p>
            <p><strong>Estado:</strong> <span class="{status_class}">{kpi_summary.get('overall_status', 'N/A')}</span></p>
            <p><strong>KPIs Críticos:</strong> {len(kpi_summary.get('critical_kpis', []))}</p>
            <p><strong>Requieren Atención:</strong> {len(kpi_summary.get('requires_attention', []))}</p>
        </div>
"""
        
        return card_html
    
    def save_dashboard(self, output_path: str):
        """Guardar dashboard HTML"""
        html_content = self.generate_dashboard_html()
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"Dashboard guardado en: {output_path}")

def main():
    """Función principal"""
    generator = KPIDashboardGenerator("reports/kpi")
    generator.save_dashboard("dashboard/kpi_dashboard.html")

if __name__ == "__main__":
    main()
```

---

## 5. Instrucciones de Uso

### 5.1 Configuración Inicial
```bash
# 1. Instalar dependencias
pip install pyyaml jinja2
npm install js-yaml

# 2. Crear estructura de directorios
mkdir -p config data/trends reports/kpi reports/alerts dashboard

# 3. Configurar archivos de configuración
cp config/kpi_config.example.yaml config/kpi_config.yaml
cp config/kpi_monitor_config.example.yaml config/kpi_monitor_config.yaml

# 4. Ejecutar generador de KPIs
python scripts/kpi/generate_kpis.py

# 5. Ejecutar monitor
node scripts/kpi/monitor_kpis.js

# 6. Generar dashboard
python scripts/kpi/generate_dashboard.py
```

### 5.2 Automatización con Cron
```bash
# Agregar al crontab para ejecución automática
# Generar KPIs diariamente a las 6:00 AM
0 6 * * * /usr/bin/python3 /path/to/scripts/kpi/generate_kpis.py

# Monitorear KPIs cada hora
0 * * * * /usr/bin/node /path/to/scripts/kpi/monitor_kpis.js

# Actualizar dashboard cada 4 horas
0 */4 * * * /usr/bin/python3 /path/to/scripts/kpi/generate_dashboard.py
```

---

## 6. Conclusión

Estos scripts proporcionan una **automatización completa** para:

1. **Generación automática** de reportes de KPIs
2. **Monitoreo en tiempo real** con alertas
3. **Integración con CI/CD** para actualizaciones automáticas
4. **Dashboard visual** para seguimiento
5. **Trazabilidad total** en cumplimiento CMMI v3

**La automatización asegura que los KPIs se mantengan actualizados y relevantes, facilitando el cumplimiento y la mejora continua.**

---

*Documento generado como parte de la metodología XTP + CMMI v3 + VibeThink*
*Versión: 1.0 | Fecha: 2025-01-22 | Autor: Marcelo Escallón* 