#!/usr/bin/env node

/**
 * Documentation Dashboard - Dashboard de métricas de documentación
 * Uso: node scripts/doc-dashboard.js
 */

const fs = require("fs");
const path = require("path");

class DocumentationDashboard {
  constructor() {
    this.dashboardData = {
      timestamp: new Date().toISOString(),
      sites: {},
      metrics: {},
      alerts: [],
    };
  }

  async generateDashboard() {
    console.log("📊 Generando dashboard de documentación...\n");

    // Escanear todos los Docusaurus sites
    this.scanDocusaurusSites();

    // Calcular métricas generales
    this.calculateMetrics();

    // Verificar alertas
    this.checkAlerts();

    // Mostrar dashboard
    this.displayDashboard();

    // Guardar dashboard
    this.saveDashboard();
  }

  scanDocusaurusSites() {
    const sitesDir = path.join(__dirname, "../");
    const sites = ["docusaurus-docs", "docusaurus-dev", "docusaurus-api", "docusaurus-vthink"];

    for (const site of sites) {
      const sitePath = path.join(sitesDir, site);

      if (fs.existsSync(sitePath)) {
        this.dashboardData.sites[site] = this.analyzeSite(sitePath, site);
      } else {
        this.dashboardData.sites[site] = {
          status: "NOT_CREATED",
          files: 0,
          size: 0,
          lastUpdated: null,
        };
      }
    }
  }

  analyzeSite(sitePath, siteName) {
    const docsPath = path.join(sitePath, "docs");
    const files = [];
    const totalSize = 0;
    const lastUpdated = null;

    if (fs.existsSync(docsPath)) {
      this.scanDirectory(docsPath, files, totalSize, lastUpdated);
    }

    return {
      status: "ACTIVE",
      files: files.length,
      size: totalSize,
      lastUpdated: lastUpdated,
      categories: this.categorizeFiles(files),
    };
  }

  scanDirectory(dirPath, files, totalSize, lastUpdated) {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        this.scanDirectory(fullPath, files, totalSize, lastUpdated);
      } else if (item.endsWith(".md")) {
        files.push({
          name: item,
          path: fullPath,
          size: stats.size,
          lastModified: stats.mtime,
        });

        totalSize += stats.size;
        if (!lastUpdated || stats.mtime > lastUpdated) {
          lastUpdated = stats.mtime;
        }
      }
    }
  }

  categorizeFiles(files) {
    const categories = {
      architecture: 0,
      roadmap: 0,
      guides: 0,
      api: 0,
      testing: 0,
      deployment: 0,
      other: 0,
    };

    for (const file of files) {
      const path = file.path.toLowerCase();

      if (path.includes("architecture")) categories.architecture++;
      else if (path.includes("roadmap")) categories.roadmap++;
      else if (path.includes("guide")) categories.guides++;
      else if (path.includes("api")) categories.api++;
      else if (path.includes("test")) categories.testing++;
      else if (path.includes("deploy")) categories.deployment++;
      else categories.other++;
    }

    return categories;
  }

  calculateMetrics() {
    const sites = this.dashboardData.sites;
    let totalFiles = 0;
    let totalSize = 0;
    let activeSites = 0;

    for (const [siteName, site] of Object.entries(sites)) {
      if (site.status === "ACTIVE") {
        totalFiles += site.files;
        totalSize += site.size;
        activeSites++;
      }
    }

    this.dashboardData.metrics = {
      totalSites: Object.keys(sites).length,
      activeSites,
      totalFiles,
      totalSize: this.formatBytes(totalSize),
      averageFilesPerSite: Math.round(totalFiles / activeSites) || 0,
      coverage: Math.round((activeSites / Object.keys(sites).length) * 100),
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  checkAlerts() {
    const alerts = [];

    // Verificar sitios no creados
    for (const [siteName, site] of Object.entries(this.dashboardData.sites)) {
      if (site.status === "NOT_CREATED") {
        alerts.push({
          type: "WARNING",
          message: `Sitio ${siteName} no creado`,
          priority: "MEDIUM",
        });
      }
    }

    // Verificar sitios con pocos archivos
    for (const [siteName, site] of Object.entries(this.dashboardData.sites)) {
      if (site.status === "ACTIVE" && site.files < 5) {
        alerts.push({
          type: "INFO",
          message: `Sitio ${siteName} tiene pocos archivos (${site.files})`,
          priority: "LOW",
        });
      }
    }

    // Verificar archivos no actualizados
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    for (const [siteName, site] of Object.entries(this.dashboardData.sites)) {
      if (site.status === "ACTIVE" && site.lastUpdated && site.lastUpdated < oneWeekAgo) {
        alerts.push({
          type: "WARNING",
          message: `Sitio ${siteName} no actualizado desde ${site.lastUpdated.toLocaleDateString()}`,
          priority: "MEDIUM",
        });
      }
    }

    this.dashboardData.alerts = alerts;
  }

  displayDashboard() {
    console.log("📊 DASHBOARD DE DOCUMENTACIÓN\n");

    // Métricas generales
    const metrics = this.dashboardData.metrics;
    console.log("📈 MÉTRICAS GENERALES:");
    console.log(`   Sitios totales: ${metrics.totalSites}`);
    console.log(`   Sitios activos: ${metrics.activeSites} (${metrics.coverage}%)`);
    console.log(`   Archivos totales: ${metrics.totalFiles}`);
    console.log(`   Tamaño total: ${metrics.totalSize}`);
    console.log(`   Promedio por sitio: ${metrics.averageFilesPerSite} archivos\n`);

    // Estado por sitio
    console.log("🏗️ ESTADO POR SITIO:");
    for (const [siteName, site] of Object.entries(this.dashboardData.sites)) {
      const status = site.status === "ACTIVE" ? "✅" : "❌";
      const lastUpdate = site.lastUpdated ? site.lastUpdated.toLocaleDateString() : "N/A";

      console.log(`   ${status} ${siteName}:`);
      console.log(`     Archivos: ${site.files}`);
      console.log(`     Última actualización: ${lastUpdate}`);

      if (site.categories) {
        console.log(
          `     Categorías: ${Object.entries(site.categories)
            .filter(([_, count]) => count > 0)
            .map(([cat, count]) => `${cat}(${count})`)
            .join(", ")}`
        );
      }
      console.log("");
    }

    // Alertas
    if (this.dashboardData.alerts.length > 0) {
      console.log("⚠️ ALERTAS:");
      for (const alert of this.dashboardData.alerts) {
        const emoji = alert.type === "WARNING" ? "⚠️" : "ℹ️";
        console.log(`   ${emoji} ${alert.message} (${alert.priority})`);
      }
      console.log("");
    }

    // Progreso visual
    const progressBar = this.generateProgressBar(metrics.coverage);
    console.log("📊 PROGRESO GENERAL:");
    console.log(`   [${progressBar}] ${metrics.coverage}% completado\n`);
  }

  generateProgressBar(percentage) {
    const width = 30;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;

    return "█".repeat(filled) + "░".repeat(empty);
  }

  saveDashboard() {
    const dashboardPath = path.join(__dirname, "../docs/dashboard-data.json");
    const reportPath = path.join(__dirname, "../docs/dashboard-report.md");

    // Guardar JSON
    fs.writeFileSync(dashboardPath, JSON.stringify(this.dashboardData, null, 2));
    console.log(`📄 Dashboard guardado en: ${dashboardPath}`);

    // Generar reporte markdown
    this.generateReport(reportPath);
    console.log(`📄 Reporte guardado en: ${reportPath}`);
  }

  generateReport(reportPath) {
    const metrics = this.dashboardData.metrics;
    const sites = this.dashboardData.sites;
    const alerts = this.dashboardData.alerts;

    const report = `# 📊 Reporte de Dashboard de Documentación

## 📈 Métricas Generales

- **Sitios totales:** ${metrics.totalSites}
- **Sitios activos:** ${metrics.activeSites} (${metrics.coverage}%)
- **Archivos totales:** ${metrics.totalFiles}
- **Tamaño total:** ${metrics.totalSize}
- **Promedio por sitio:** ${metrics.averageFilesPerSite} archivos

## 🏗️ Estado por Sitio

${Object.entries(sites)
  .map(
    ([siteName, site]) => `
### ${siteName}
- **Estado:** ${site.status}
- **Archivos:** ${site.files}
- **Última actualización:** ${site.lastUpdated ? site.lastUpdated.toLocaleDateString() : "N/A"}
${
  site.categories
    ? `- **Categorías:** ${Object.entries(site.categories)
        .filter(([_, count]) => count > 0)
        .map(([cat, count]) => `${cat}(${count})`)
        .join(", ")}`
    : ""
}
`
  )
  .join("")}

## ⚠️ Alertas

${alerts.length > 0 ? alerts.map((alert) => `- **${alert.type}:** ${alert.message} (${alert.priority})`).join("\n") : "No hay alertas activas"}

---

**🔄 Generado automáticamente el ${new Date().toLocaleDateString()}**
`;

    fs.writeFileSync(reportPath, report);
  }
}

// Función principal
function main() {
  const dashboard = new DocumentationDashboard();
  dashboard.generateDashboard();
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { DocumentationDashboard };
