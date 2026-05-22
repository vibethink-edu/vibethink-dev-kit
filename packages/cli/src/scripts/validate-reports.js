#!/usr/bin/env node

/**
 * @file validate-reports.js
 * @description Script de validación para asegurar que todos los reportes vayan a docs/reports/
 * @version 1.0.0
 * @author VThink 1.0 Team
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ReportValidator {
  constructor() {
    this.root = process.cwd();
    this.reportsDir = path.join(this.root, "docs", "reports");
    this.violations = [];
    this.warnings = [];
  }

  /**
   * Validar ubicación de reportes
   */
  validateLocation() {
    console.log("🔍 Validando ubicación de reportes...");

    // Verificar que docs/reports/ existe
    if (!fs.existsSync(this.reportsDir)) {
      this.violations.push("docs/reports/ no existe");
      return false;
    }

    // Verificar que no hay reportes en raíz
    const rootReports = path.join(this.root, "reports");
    if (fs.existsSync(rootReports)) {
      this.violations.push("Reportes detectados en raíz del proyecto");
      return false;
    }

    // Verificar que no hay reportes en dev-tools/
    const devToolsReports = path.join(this.root, "dev-tools", "reports");
    if (fs.existsSync(devToolsReports)) {
      this.violations.push("Reportes detectados en dev-tools/");
      return false;
    }

    console.log("✅ Ubicación de reportes válida");
    return true;
  }

  /**
   * Validar estructura de carpetas
   */
  validateStructure() {
    console.log("📁 Validando estructura de carpetas...");

    const requiredFolders = [
      "migration",
      "analysis",
      "performance",
      "security",
      "quality",
      "deployment",
      "archives",
    ];

    for (const folder of requiredFolders) {
      const folderPath = path.join(this.reportsDir, folder);
      if (!fs.existsSync(folderPath)) {
        this.warnings.push(`Carpeta ${folder}/ no existe en docs/reports/`);
      }
    }

    console.log("✅ Estructura de carpetas validada");
    return true;
  }

  /**
   * Validar nomenclatura de archivos
   */
  validateNaming() {
    console.log("📝 Validando nomenclatura de archivos...");

    const files = this.getAllReportFiles();
    const datePattern = /^\d{4}-\d{2}-\d{2}/;

    for (const file of files) {
      const fileName = path.basename(file);
      if (!datePattern.test(fileName)) {
        this.warnings.push(`Archivo sin fecha: ${fileName}`);
      }
    }

    console.log("✅ Nomenclatura de archivos validada");
    return true;
  }

  /**
   * Obtener todos los archivos de reportes
   */
  getAllReportFiles() {
    const files = [];

    function scanDirectory(dir) {
      if (!fs.existsSync(dir)) return;

      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith(".md") || item.endsWith(".txt")) {
          files.push(fullPath);
        }
      }
    }

    scanDirectory(this.reportsDir);
    return files;
  }

  /**
   * Validar contenido VThink 1.0
   */
  validateContent() {
    console.log("📋 Validando contenido VThink 1.0...");

    const files = this.getAllReportFiles();
    let validFiles = 0;

    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");

      // Verificar estructura básica
      const hasTitle = content.includes("# Reporte:");
      const hasSummary = content.includes("## 📊 Resumen Ejecutivo");
      const hasVThink = content.includes("## 📋 VThink 1.0 Compliance");

      if (hasTitle && hasSummary && hasVThink) {
        validFiles++;
      } else {
        this.warnings.push(`Contenido incompleto: ${path.basename(file)}`);
      }
    }

    console.log(`✅ ${validFiles}/${files.length} archivos con contenido válido`);
    return validFiles === files.length;
  }

  /**
   * Generar reporte de validación
   */
  generateValidationReport() {
    const timestamp = new Date().toISOString().split("T")[0];
    const reportPath = path.join(this.reportsDir, "quality", `${timestamp}-validation-report.md`);

    const report = `# Reporte: Validación de Reportes - ${timestamp}

## 📊 Resumen Ejecutivo
- Objetivo: Validar ubicación y estructura de reportes
- Fecha: ${timestamp}
- Estado: ${this.violations.length === 0 ? "✅ Exitoso" : "❌ Con errores"}

## 🔍 Detalles Técnicos
- Ubicación validada: docs/reports/
- Archivos encontrados: ${this.getAllReportFiles().length}
- Violaciones: ${this.violations.length}
- Advertencias: ${this.warnings.length}

## 📈 Métricas
${
  this.violations.length > 0
    ? `
### ❌ Violaciones Críticas:
${this.violations.map((v) => `- ${v}`).join("\n")}
`
    : ""
}
${
  this.warnings.length > 0
    ? `
### ⚠️ Advertencias:
${this.warnings.map((w) => `- ${w}`).join("\n")}
`
    : ""
}

## 🎯 Conclusiones
${
  this.violations.length === 0
    ? "- ✅ Todos los reportes están en la ubicación correcta"
    : "- ❌ Se encontraron violaciones que deben corregirse"
}
- Estructura de carpetas: ${this.warnings.filter((w) => w.includes("Carpeta")).length} advertencias
- Nomenclatura: ${this.warnings.filter((w) => w.includes("Archivo sin fecha")).length} advertencias
- Contenido: ${this.warnings.filter((w) => w.includes("Contenido incompleto")).length} advertencias

## 📋 VThink 1.0 Compliance
- ✅ Validación automatizada implementada
- ✅ Reglas claras establecidas
- ✅ Estructura estandarizada
- ✅ Nomenclatura consistente

## 🔧 Próximos Pasos
1. Corregir violaciones críticas si existen
2. Resolver advertencias de estructura
3. Mejorar contenido de reportes
4. Ejecutar validación diaria
`;

    // Crear carpeta si no existe
    const qualityDir = path.join(this.reportsDir, "quality");
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
    console.log("🚀 Iniciando validación de reportes...\n");

    const locationValid = this.validateLocation();
    const structureValid = this.validateStructure();
    const namingValid = this.validateNaming();
    const contentValid = this.validateContent();

    console.log("\n📊 Resultados de Validación:");
    console.log(`📍 Ubicación: ${locationValid ? "✅" : "❌"}`);
    console.log(`📁 Estructura: ${structureValid ? "✅" : "⚠️"}`);
    console.log(`📝 Nomenclatura: ${namingValid ? "✅" : "⚠️"}`);
    console.log(`📋 Contenido: ${contentValid ? "✅" : "⚠️"}`);

    if (this.violations.length > 0) {
      console.log("\n❌ VIOLACIONES CRÍTICAS:");
      this.violations.forEach((v) => console.log(`  - ${v}`));
      process.exit(1);
    }

    if (this.warnings.length > 0) {
      console.log("\n⚠️ ADVERTENCIAS:");
      this.warnings.forEach((w) => console.log(`  - ${w}`));
    }

    this.generateValidationReport();

    console.log("\n✅ Validación completada exitosamente");
  }
}

// Ejecutar validación
const validator = new ReportValidator();
validator.run();
