#!/usr/bin/env node

/**
 * Documentación Inventory - Tracking completo de migración
 * Uso: node scripts/doc-inventory.js
 */

const fs = require("fs");
const path = require("path");

// Configuración de Docusaurus sites
const DOCUSAURUS_SITES = {
  "docusaurus-docs": {
    url: "docs.vibethink.ai",
    purpose: "Documentación de usuario",
    priority: "HIGH",
  },
  "docusaurus-dev": {
    url: "dev.vibethink.ai",
    purpose: "Documentación de desarrollo",
    priority: "CRITICAL",
  },
  "docusaurus-api": {
    url: "api.vibethink.ai",
    purpose: "Documentación de API",
    priority: "HIGH",
  },
  "docusaurus-vthink": {
    url: "vthink.vibethink.ai",
    purpose: "Metodología VThink",
    priority: "MEDIUM",
  },
};

// Mapeo de archivos originales a Docusaurus destinations
const MIGRATION_MAPPING = {
  // Documentación general
  "README.md": {
    destination: "docusaurus-docs",
    path: "docs/intro.md",
    status: "MIGRATED",
    priority: "CRITICAL",
  },
  "CONTRIBUTING.md": {
    destination: "docusaurus-docs",
    path: "docs/contributing.md",
    status: "MIGRATED",
    priority: "HIGH",
  },
  "CHANGELOG.md": {
    destination: "docusaurus-docs",
    path: "docs/changelog.md",
    status: "PENDING",
    priority: "MEDIUM",
  },
  "SECURITY.md": {
    destination: "docusaurus-docs",
    path: "docs/security.md",
    status: "PENDING",
    priority: "HIGH",
  },

  // Documentación de desarrollo
  "ARCHITECTURE.md": {
    destination: "docusaurus-dev",
    path: "docs/architecture/overview.md",
    status: "IN_MIGRATION",
    priority: "CRITICAL",
  },
  "DEPLOYMENT.md": {
    destination: "docusaurus-dev",
    path: "docs/deployment/overview.md",
    status: "PENDING",
    priority: "HIGH",
  },
  "TESTING.md": {
    destination: "docusaurus-dev",
    path: "docs/testing/strategy.md",
    status: "PENDING",
    priority: "HIGH",
  },

  // Documentación de API
  "API_DOCS.md": {
    destination: "docusaurus-api",
    path: "docs/overview.md",
    status: "PENDING",
    priority: "CRITICAL",
  },
  "SWAGGER_DOCUMENTATION.md": {
    destination: "docusaurus-api",
    path: "docs/swagger.md",
    status: "PENDING",
    priority: "HIGH",
  },

  // Documentación de metodología
  "VIBE_CODING_METHODOLOGY.md": {
    destination: "docusaurus-vthink",
    path: "docs/methodology/overview.md",
    status: "PENDING",
    priority: "MEDIUM",
  },
  "VTHINK_FRAMEWORK.md": {
    destination: "docusaurus-vthink",
    path: "docs/framework/overview.md",
    status: "PENDING",
    priority: "MEDIUM",
  },
};

class DocumentationInventory {
  constructor() {
    this.inventory = {
      external: [],
      docusaurus: {},
      metrics: {
        totalFiles: 0,
        migrated: 0,
        inProgress: 0,
        pending: 0,
        coverage: 0,
      },
    };
  }

  async generateInventory() {
    console.log("📋 Generando inventario de documentación...\n");

    // Escanear archivos originales
    this.scanOriginalFiles();

    // Escanear Docusaurus sites
    this.scanDocusaurusSites();

    // Calcular métricas
    this.calculateMetrics();

    // Mostrar resultados
    this.displayResults();

    // Guardar inventario
    this.saveInventory();
  }

  scanOriginalFiles() {
    console.log("🔍 Escaneando archivos originales...");

    const rootDir = path.join(__dirname, "../../");
    const files = fs.readdirSync(rootDir);

    for (const file of files) {
      if (file.endsWith(".md") && MIGRATION_MAPPING[file]) {
        const mapping = MIGRATION_MAPPING[file];
        const filePath = path.join(rootDir, file);

        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          const content = fs.readFileSync(filePath, "utf8");

          this.inventory.external.push({
            file,
            path: filePath,
            size: stats.size,
            lines: content.split("\n").length,
            status: mapping.status,
            destination: mapping.destination,
            docusaurusPath: mapping.path,
            priority: mapping.priority,
            lastModified: stats.mtime,
            wordCount: content.split(/\s+/).length,
          });
        }
      }
    }

    console.log(`   ✅ Encontrados ${this.inventory.external.length} archivos para migrar`);
  }

  scanDocusaurusSites() {
    console.log("🏗️ Escaneando Docusaurus sites...");

    for (const [siteName, config] of Object.entries(DOCUSAURUS_SITES)) {
      const sitePath = path.join(__dirname, "../", siteName);

      if (fs.existsSync(sitePath)) {
        this.inventory.docusaurus[siteName] = {
          config,
          files: this.scanDocusaurusSite(sitePath),
          status: "ACTIVE",
        };
      } else {
        this.inventory.docusaurus[siteName] = {
          config,
          files: [],
          status: "NOT_CREATED",
        };
      }
    }
  }

  scanDocusaurusSite(sitePath) {
    const docsPath = path.join(sitePath, "docs");
    const files = [];

    if (fs.existsSync(docsPath)) {
      this.scanDirectory(docsPath, files, "");
    }

    return files;
  }

  scanDirectory(dirPath, files, relativePath) {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativeItemPath = path.join(relativePath, item);

      if (fs.statSync(fullPath).isDirectory()) {
        this.scanDirectory(fullPath, files, relativeItemPath);
      } else if (item.endsWith(".md")) {
        const stats = fs.statSync(fullPath);
        files.push({
          file: item,
          path: relativeItemPath,
          size: stats.size,
          lastModified: stats.mtime,
        });
      }
    }
  }

  calculateMetrics() {
    const external = this.inventory.external;

    this.inventory.metrics = {
      totalFiles: external.length,
      migrated: external.filter((f) => f.status === "MIGRATED").length,
      inProgress: external.filter((f) => f.status === "IN_MIGRATION").length,
      pending: external.filter((f) => f.status === "PENDING").length,
      coverage: Math.round(
        (external.filter((f) => f.status === "MIGRATED").length / external.length) * 100
      ),
    };
  }

  displayResults() {
    console.log("\n📊 RESULTADOS DEL INVENTARIO:\n");

    // Métricas generales
    const metrics = this.inventory.metrics;
    console.log("📈 MÉTRICAS GENERALES:");
    console.log(`   Total de archivos: ${metrics.totalFiles}`);
    console.log(`   Migrados: ${metrics.migrated} (${metrics.coverage}%)`);
    console.log(`   En progreso: ${metrics.inProgress}`);
    console.log(`   Pendientes: ${metrics.pending}\n`);

    // Estado por Docusaurus
    console.log("🏗️ ESTADO POR DOCUSAURUS:");
    for (const [siteName, site] of Object.entries(this.inventory.docusaurus)) {
      const config = site.config;
      const files = site.files.length;
      const status = site.status;

      console.log(`   ${siteName}:`);
      console.log(`     URL: ${config.url}`);
      console.log(`     Propósito: ${config.purpose}`);
      console.log(`     Estado: ${status}`);
      console.log(`     Archivos: ${files}\n`);
    }

    // Archivos pendientes por prioridad
    console.log("📋 ARCHIVOS PENDIENTES POR PRIORIDAD:");
    const pendingByPriority = {};

    for (const file of this.inventory.external) {
      if (file.status !== "MIGRATED") {
        if (!pendingByPriority[file.priority]) {
          pendingByPriority[file.priority] = [];
        }
        pendingByPriority[file.priority].push(file);
      }
    }

    for (const [priority, files] of Object.entries(pendingByPriority)) {
      console.log(`   ${priority}:`);
      for (const file of files) {
        console.log(`     - ${file.file} → ${file.destination}/${file.docusaurusPath}`);
      }
      console.log("");
    }
  }

  saveInventory() {
    const inventoryPath = path.join(__dirname, "../docs/migration-inventory.json");
    const reportPath = path.join(__dirname, "../docs/migration-report.md");

    // Guardar JSON
    fs.writeFileSync(inventoryPath, JSON.stringify(this.inventory, null, 2));
    console.log(`📄 Inventario guardado en: ${inventoryPath}`);

    // Generar reporte markdown
    this.generateReport(reportPath);
    console.log(`📄 Reporte guardado en: ${reportPath}`);
  }

  generateReport(reportPath) {
    const report = `# 📋 Reporte de Inventario de Documentación

## 📊 Métricas Generales

- **Total de archivos:** ${this.inventory.metrics.totalFiles}
- **Migrados:** ${this.inventory.metrics.migrated} (${this.inventory.metrics.coverage}%)
- **En progreso:** ${this.inventory.metrics.inProgress}
- **Pendientes:** ${this.inventory.metrics.pending}

## 🏗️ Estado por Docusaurus

${Object.entries(this.inventory.docusaurus)
  .map(
    ([site, data]) => `
### ${site}
- **URL:** ${data.config.url}
- **Propósito:** ${data.config.purpose}
- **Estado:** ${data.status}
- **Archivos:** ${data.files.length}
`
  )
  .join("")}

## 📋 Archivos Pendientes

${this.inventory.external
  .filter((f) => f.status !== "MIGRATED")
  .map((f) => `- [ ] **${f.file}** → ${f.destination}/${f.docusaurusPath} (${f.priority})`)
  .join("\n")}

---

**🔄 Generado automáticamente el ${new Date().toLocaleDateString()}**
`;

    fs.writeFileSync(reportPath, report);
  }
}

// Función principal
function main() {
  const inventory = new DocumentationInventory();
  inventory.generateInventory();
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { DocumentationInventory };
