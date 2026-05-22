#!/usr/bin/env node

/**
 * Script de Ejecución del Monitoreo de Upgrades - VThink 1.0
 * Fecha: 05/07/2025
 *
 * Este script ejecuta el monitoreo de dependencias y genera alertas
 * que pueden ser consumidas por el Dev Portal.
 */

const UpgradeMonitor = require("./upgrade-monitor.cjs");
const fs = require("fs");
const path = require("path");

// Configuración para el Dev Portal
const DEV_PORTAL_CONFIG = {
  outputPath: path.join(process.cwd(), "src", "apps", "dev-portal", "data"),
  alertThreshold: {
    critical: 0, // Cualquier vulnerabilidad crítica
    high: 3, // 3 o más actualizaciones de alta prioridad
    medium: 5, // 5 o más actualizaciones de prioridad media
  },
};

/**
 * Clase para generar alertas del Dev Portal
 */
class DevPortalAlertGenerator {
  constructor() {
    this.alerts = [];
  }

  /**
   * Genera alertas basadas en el reporte de upgrades
   */
  generateAlerts(report) {
    this.alerts = [];

    // Alertas de seguridad crítica
    if (report.criticalUpdates.length > 0) {
      this.alerts.push({
        id: "security-critical",
        type: "error",
        title: "Vulnerabilidades de Seguridad Críticas",
        message: `Se encontraron ${report.criticalUpdates.length} vulnerabilidades críticas que requieren atención inmediata.`,
        priority: "immediate",
        actions: [
          {
            label: "Ver Detalles",
            action: "navigate_to_security_tab",
          },
          {
            label: "Ejecutar Fixes",
            action: "run_security_fixes",
          },
        ],
      });
    }

    // Alertas de actualizaciones de alta prioridad
    if (report.highPriorityUpdates.length >= DEV_PORTAL_CONFIG.alertThreshold.high) {
      this.alerts.push({
        id: "high-priority-updates",
        type: "warning",
        title: "Actualizaciones de Alta Prioridad",
        message: `Hay ${report.highPriorityUpdates.length} actualizaciones de alta prioridad pendientes.`,
        priority: "high",
        actions: [
          {
            label: "Ver Recomendaciones",
            action: "navigate_to_recommendations_tab",
          },
          {
            label: "Programar Updates",
            action: "schedule_updates",
          },
        ],
      });
    }

    // Alertas de dependencias desactualizadas
    if (report.summary.totalOutdated >= DEV_PORTAL_CONFIG.alertThreshold.medium) {
      this.alerts.push({
        id: "outdated-dependencies",
        type: "info",
        title: "Dependencias Desactualizadas",
        message: `Hay ${report.summary.totalOutdated} dependencias desactualizadas en el proyecto.`,
        priority: "medium",
        actions: [
          {
            label: "Ver Dependencias",
            action: "navigate_to_dependencies_tab",
          },
          {
            label: "Actualizar Todo",
            action: "update_all_dependencies",
          },
        ],
      });
    }

    return this.alerts;
  }

  /**
   * Guarda las alertas en formato JSON para el Dev Portal
   */
  saveAlerts(alerts) {
    const alertPath = path.join(DEV_PORTAL_CONFIG.outputPath, "alerts.json");
    const alertDir = path.dirname(alertPath);

    if (!fs.existsSync(alertDir)) {
      fs.mkdirSync(alertDir, { recursive: true });
    }

    const alertData = {
      timestamp: new Date().toISOString(),
      alerts: alerts,
      summary: {
        total: alerts.length,
        critical: alerts.filter((a) => a.priority === "immediate").length,
        high: alerts.filter((a) => a.priority === "high").length,
        medium: alerts.filter((a) => a.priority === "medium").length,
      },
    };

    fs.writeFileSync(alertPath, JSON.stringify(alertData, null, 2));
    console.log(`📊 Alertas guardadas en: ${alertPath}`);
  }

  /**
   * Genera un resumen ejecutivo
   */
  generateExecutiveSummary(report) {
    const summary = {
      timestamp: new Date().toISOString(),
      project: "VibeThink-Orchestrator",
      version: "VThink 1.0",
      status: this.determineOverallStatus(report),
      metrics: {
        totalDependencies:
          report.summary.totalOutdated +
          report.outdatedPackages.filter((d) => d.status === "stable").length,
        outdatedDependencies: report.summary.totalOutdated,
        securityIssues: report.summary.totalSecurityIssues,
        criticalUpdates: report.criticalUpdates.length,
        highPriorityUpdates: report.highPriorityUpdates.length,
      },
      recommendations: this.generateTopRecommendations(report),
      nextActions: this.generateNextActions(report),
    };

    const summaryPath = path.join(DEV_PORTAL_CONFIG.outputPath, "executive-summary.json");
    const summaryDir = path.dirname(summaryPath);

    if (!fs.existsSync(summaryDir)) {
      fs.mkdirSync(summaryDir, { recursive: true });
    }

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`📋 Resumen ejecutivo guardado en: ${summaryPath}`);

    return summary;
  }

  /**
   * Determina el estado general del proyecto
   */
  determineOverallStatus(report) {
    if (report.criticalUpdates.length > 0) {
      return "critical";
    } else if (report.highPriorityUpdates.length >= 3) {
      return "warning";
    } else if (report.summary.totalOutdated >= 5) {
      return "attention";
    } else {
      return "healthy";
    }
  }

  /**
   * Genera las principales recomendaciones
   */
  generateTopRecommendations(report) {
    const recommendations = [];

    // Priorizar actualizaciones de seguridad
    report.criticalUpdates.forEach((update) => {
      recommendations.push({
        priority: "immediate",
        action: update.action,
        description: update.description,
        impact: "security",
      });
    });

    // Agregar actualizaciones de alta prioridad
    report.highPriorityUpdates.slice(0, 3).forEach((update) => {
      recommendations.push({
        priority: "high",
        action: update.action,
        description: update.description,
        impact: "performance",
      });
    });

    return recommendations;
  }

  /**
   * Genera las próximas acciones recomendadas
   */
  generateNextActions(report) {
    const actions = [];

    if (report.criticalUpdates.length > 0) {
      actions.push({
        action: "Ejecutar actualizaciones de seguridad críticas",
        timeline: "inmediato",
        responsible: "equipo de desarrollo",
      });
    }

    if (report.highPriorityUpdates.length > 0) {
      actions.push({
        action: "Planificar actualizaciones de alta prioridad",
        timeline: "esta semana",
        responsible: "equipo de desarrollo",
      });
    }

    if (report.summary.totalOutdated > 10) {
      actions.push({
        action: "Revisar y actualizar dependencias menores",
        timeline: "próximas 2 semanas",
        responsible: "equipo de desarrollo",
      });
    }

    return actions;
  }
}

/**
 * Función principal para ejecutar el monitoreo completo
 */
async function runUpgradeMonitoring() {
  console.log("🚀 Iniciando monitoreo de upgrades para Dev Portal - VThink 1.0");
  console.log("Fecha:", new Date().toLocaleDateString("es-ES"));
  console.log("=".repeat(60));

  try {
    // Ejecutar el monitoreo
    const monitor = new UpgradeMonitor();
    await monitor.run();

    // Generar alertas para el Dev Portal
    const alertGenerator = new DevPortalAlertGenerator();
    const report = monitor.generateReport();

    const alerts = alertGenerator.generateAlerts(report);
    alertGenerator.saveAlerts(alerts);

    const summary = alertGenerator.generateExecutiveSummary(report);

    // Mostrar resumen final
    console.log("\n📊 RESUMEN FINAL PARA DEV PORTAL");
    console.log("=".repeat(40));
    console.log(`Estado del proyecto: ${summary.status.toUpperCase()}`);
    console.log(`Alertas generadas: ${alerts.length}`);
    console.log(`Actualizaciones críticas: ${summary.metrics.criticalUpdates}`);
    console.log(`Actualizaciones de alta prioridad: ${summary.metrics.highPriorityUpdates}`);

    if (summary.nextActions.length > 0) {
      console.log("\n📋 Próximas acciones:");
      summary.nextActions.forEach((action, index) => {
        console.log(`  ${index + 1}. ${action.action} (${action.timeline})`);
      });
    }

    console.log("\n✅ Monitoreo completado. Datos disponibles en el Dev Portal.");

    // Salir con código de error si hay actualizaciones críticas
    if (summary.metrics.criticalUpdates > 0) {
      console.log("\n❌ Se encontraron actualizaciones críticas que requieren atención inmediata.");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error durante el monitoreo:", error.message);
    process.exit(1);
  }
}

// Ejecutar si el script se llama directamente
if (require.main === module) {
  runUpgradeMonitoring();
}

module.exports = {
  runUpgradeMonitoring,
  DevPortalAlertGenerator,
};
