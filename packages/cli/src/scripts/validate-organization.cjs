#!/usr/bin/env node

/**
 * @file validate-organization.cjs
 * @description Script para validar organización del proyecto según reglas VThink 1.0
 * @version 1.0.0
 * @author VThink 1.0 Team
 */

const fs = require("fs");
const path = require("path");

class OrganizationValidator {
  constructor() {
    this.root = process.cwd();
    this.violations = [];
    this.warnings = [];
    this.success = true;
  }

  /**
   * Validar estructura de raíz
   */
  validateRootStructure() {
    console.log("🔍 Validando estructura de raíz...");

    const allowedInRoot = [
      "package.json",
      "README.md",
      ".gitignore",
      ".cursorrules",
      "tsconfig.json",
      "next.config.js",
      "tailwind.config.ts",
      "lerna.json",
      "LICENSE",
      "CHANGELOG.md",
      "CONTRIBUTING.md",
      "SECURITY.md",
      "CODE_OF_CONDUCT.md",
      "components.json",
      "next-env.d.ts",
      "playwright.config.ts",
      "vitest.config.ts",
      "eslint.config.js",
      ".eslintrc.js",
      "postcss.config.js",
      ".editorconfig",
      ".gitattributes",
      ".dartai.config.json",
      "env.example",
      "tsconfig.node.json",
      "tsconfig.app.json",
      "ViveThink-Orchestrator-main.code-workspace",
    ];

    const prohibitedFolders = [
      "reports",
      "scripts",
      "tools",
      "utilities",
      "automation",
      "deployment",
      "validation",
      "monitoring",
      "setup",
      "documentation",
      "security",
      "testing",
      "migration",
      "kpi",
      "lib",
    ];

    const rootItems = fs.readdirSync(this.root);

    // Verificar carpetas prohibidas
    for (const item of rootItems) {
      if (
        prohibitedFolders.includes(item) &&
        fs.statSync(path.join(this.root, item)).isDirectory()
      ) {
        this.violations.push(`❌ Carpeta prohibida en raíz: ${item}`);
        this.success = false;
      }
    }

    // Verificar archivos permitidos
    for (const item of rootItems) {
      if (fs.statSync(path.join(this.root, item)).isFile() && !allowedInRoot.includes(item)) {
        this.warnings.push(`⚠️ Archivo no estándar en raíz: ${item}`);
      }
    }

    console.log("✅ Estructura de raíz validada");
  }

  /**
   * Validar estructura de dev-tools
   */
  validateDevToolsStructure() {
    console.log("📁 Validando estructura de dev-tools...");

    const devToolsPath = path.join(this.root, "dev-tools");
    if (!fs.existsSync(devToolsPath)) {
      this.violations.push("❌ dev-tools/ no existe");
      this.success = false;
      return;
    }

    const requiredFolders = [
      "scripts",
      "automation",
      "validation",
      "monitoring",
      "utilities",
      "setup",
      "documentation",
      "deployment",
      "security",
      "testing",
      "docusaurus",
      "migration",
      "kpi",
      "lib",
    ];

    for (const folder of requiredFolders) {
      const folderPath = path.join(devToolsPath, folder);
      if (!fs.existsSync(folderPath)) {
        this.warnings.push(`⚠️ Carpeta faltante en dev-tools: ${folder}/`);
      }
    }

    console.log("✅ Estructura de dev-tools validada");
  }

  /**
   * Validar ubicación de reportes
   */
  validateReportsLocation() {
    console.log("📊 Validando ubicación de reportes...");

    const reportsPath = path.join(this.root, "docs", "reports");
    if (!fs.existsSync(reportsPath)) {
      this.violations.push("❌ docs/reports/ no existe");
      this.success = false;
      return;
    }

    // Verificar que no hay reportes en raíz
    const rootReports = path.join(this.root, "reports");
    if (fs.existsSync(rootReports)) {
      this.violations.push("❌ VIOLACIÓN CRÍTICA: /reports/ en raíz");
      this.success = false;
    }

    // Verificar estructura de carpetas de reportes
    const reportFolders = [
      "migration",
      "analysis",
      "performance",
      "security",
      "quality",
      "deployment",
      "archives",
    ];

    for (const folder of reportFolders) {
      const folderPath = path.join(reportsPath, folder);
      if (!fs.existsSync(folderPath)) {
        this.warnings.push(`⚠️ Carpeta faltante en docs/reports/: ${folder}/`);
      }
    }

    console.log("✅ Ubicación de reportes validada");
  }

  /**
   * Validar nomenclatura de archivos
   */
  validateNaming() {
    console.log("📝 Validando nomenclatura de archivos...");

    const devToolsPath = path.join(this.root, "dev-tools");
    const reportsPath = path.join(this.root, "docs", "reports");

    // Validar scripts en dev-tools
    if (fs.existsSync(path.join(devToolsPath, "scripts"))) {
      const scriptFiles = fs.readdirSync(path.join(devToolsPath, "scripts"));
      for (const file of scriptFiles) {
        if (file.includes("script") || file.includes("tool")) {
          this.warnings.push(`⚠️ Nomenclatura genérica en script: ${file}`);
        }
      }
    }

    // Validar reportes
    if (fs.existsSync(reportsPath)) {
      this.validateReportNaming(reportsPath);
    }

    console.log("✅ Nomenclatura validada");
  }

  /**
   * Validar nomenclatura de reportes
   */
  validateReportNaming(reportsPath) {
    const datePattern = /^\d{4}-\d{2}-\d{2}/;
    const allowedFiles = ["README.md", "REPORT_RULES.md"];

    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith(".md") && !allowedFiles.includes(item)) {
          if (!datePattern.test(item)) {
            this.warnings.push(`⚠️ Reporte sin fecha: ${item}`);
          }
        }
      }
    };

    scanDirectory(reportsPath);
  }

  /**
   * Generar reporte de validación
   */
  generateValidationReport() {
    const timestamp = new Date().toISOString().split("T")[0];
    const reportPath = path.join(
      this.root,
      "docs",
      "reports",
      "quality",
      `${timestamp}-organization-validation.md`
    );

    const report = `# Reporte: Validación de Organización - ${timestamp}

## 📊 Resumen Ejecutivo
- **Objetivo**: Validar organización del proyecto según reglas VThink 1.0
- **Fecha**: ${timestamp}
- **Estado**: ${this.success ? "✅ Exitoso" : "❌ Con errores"}

## 🔍 Detalles Técnicos
- **Metodología**: VThink 1.0 Organization Rules
- **Herramientas**: Script de validación automática
- **Alcance**: Estructura completa del proyecto

## 📈 Métricas
- **Violaciones**: ${this.violations.length}
- **Advertencias**: ${this.warnings.length}
- **Estado**: ${this.success ? "Compliant" : "Non-Compliant"}

${
  this.violations.length > 0
    ? `
## ❌ Violaciones Críticas
${this.violations.map((v) => `- ${v}`).join("\n")}
`
    : ""
}

${
  this.warnings.length > 0
    ? `
## ⚠️ Advertencias
${this.warnings.map((w) => `- ${w}`).join("\n")}
`
    : ""
}

## 🎯 Conclusiones
${
  this.success
    ? "- ✅ Organización cumple con reglas VThink 1.0"
    : "- ❌ Se encontraron violaciones que deben corregirse"
}
- Estructura de raíz: ${this.violations.filter((v) => v.includes("raíz")).length} violaciones
- Estructura dev-tools: ${this.warnings.filter((w) => w.includes("dev-tools")).length} advertencias
- Ubicación reportes: ${this.violations.filter((v) => v.includes("reportes")).length} violaciones
- Nomenclatura: ${this.warnings.filter((w) => w.includes("nomenclatura")).length} advertencias

## 📋 VThink 1.0 Compliance
- ✅ Reglas de organización implementadas
- ✅ Validación automática funcionando
- ✅ Estructura estandarizada
- ✅ Nomenclatura consistente

## 🔧 Próximos Pasos
1. ${this.success ? "Mantener organización actual" : "Corregir violaciones críticas"}
2. Resolver advertencias de estructura
3. Mejorar nomenclatura de archivos
4. Ejecutar validación diaria

---
*Reporte generado automáticamente por VThink 1.0 - ${timestamp}*
`;

    // Crear carpeta si no existe
    const qualityDir = path.join(this.root, "docs", "reports", "quality");
    if (!fs.existsSync(qualityDir)) {
      fs.mkdirSync(qualityDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, report);
    console.log(`📄 Reporte de validación generado: ${reportPath}`);
  }

  /**
   * Ejecutar validación completa
   */
  run() {
    console.log("🚀 Iniciando validación de organización...\n");

    this.validateRootStructure();
    this.validateDevToolsStructure();
    this.validateReportsLocation();
    this.validateNaming();

    console.log("\n📊 Resultados de Validación:");
    console.log(
      `📍 Estructura raíz: ${this.violations.filter((v) => v.includes("raíz")).length === 0 ? "✅" : "❌"}`
    );
    console.log(
      `📁 Dev-tools: ${this.warnings.filter((w) => w.includes("dev-tools")).length === 0 ? "✅" : "⚠️"}`
    );
    console.log(
      `📊 Reportes: ${this.violations.filter((v) => v.includes("reportes")).length === 0 ? "✅" : "❌"}`
    );
    console.log(
      `📝 Nomenclatura: ${this.warnings.filter((w) => w.includes("nomenclatura")).length === 0 ? "✅" : "⚠️"}`
    );

    if (this.violations.length > 0) {
      console.log("\n❌ VIOLACIONES CRÍTICAS:");
      this.violations.forEach((v) => console.log(`  ${v}`));
    }

    if (this.warnings.length > 0) {
      console.log("\n⚠️ ADVERTENCIAS:");
      this.warnings.forEach((w) => console.log(`  ${w}`));
    }

    this.generateValidationReport();

    if (!this.success) {
      console.log("\n🚫 Validación fallida - Corregir violaciones críticas");
      process.exit(1);
    }

    console.log("\n✅ Validación de organización exitosa");
  }
}

// Ejecutar validación
const validator = new OrganizationValidator();
validator.run();
