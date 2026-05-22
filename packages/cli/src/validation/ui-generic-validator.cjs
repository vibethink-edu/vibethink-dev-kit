#!/usr/bin/env node

/**
 * UI Generic Principles Validator - VibeThink Orchestrator
 * Valida que los componentes sigan los principios de UI genérico
 */

const fs = require("fs");
const path = require("path");

class UIGenericValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.errors = [];
    this.warnings = [];
    this.success = [];
    this.specificPatterns = [];
    this.genericPatterns = [];
  }

  async validate() {
    console.log("🎨 UI GENERIC PRINCIPLES VALIDATOR");
    console.log("====================================\n");

    await this.scanComponents();
    await this.validatePatterns();
    await this.checkDocumentation();
    await this.generateReport();

    return this.errors.length === 0;
  }

  async scanComponents() {
    console.log("🔍 Escaneando componentes...");

    const componentDirs = [
      "src/shared/components",
      "apps/dashboard/src/components",
      "apps/admin/src/components",
    ];

    for (const dir of componentDirs) {
      if (fs.existsSync(dir)) {
        await this.scanDirectory(dir);
      }
    }
  }

  async scanDirectory(dirPath) {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);

      if (file.isDirectory()) {
        await this.scanDirectory(fullPath);
      } else if (file.name.endsWith(".tsx") || file.name.endsWith(".ts")) {
        await this.analyzeComponent(fullPath);
      }
    }
  }

  async analyzeComponent(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    const fileName = path.basename(filePath);

    // Buscar patrones específicos (❌)
    const specificPatterns = [
      /interface\s+\w+CardProps/,
      /interface\s+\w+LayoutProps/,
      /interface\s+\w+DataProps/,
      /export\s+const\s+\w+Card\s*=/,
      /export\s+const\s+\w+Layout\s*=/,
      /export\s+const\s+\w+Data\s*=/,
      /use\w+Data\s*=/,
      /use\w+State\s*=/,
      /format\w+\s*=/,
      /validate\w+\s*=/,
      /generate\w+Mocks\s*=/,
      /RevenueCard/,
      /SalesCard/,
      /UsersCard/,
      /ActivityCard/,
      /RevenueLayout/,
      /SalesLayout/,
      /UsersLayout/,
      /ActivityLayout/,
    ];

    // Buscar patrones genéricos (✅)
    const genericPatterns = [
      /interface\s+Generic\w+Props/,
      /interface\s+\w+Props/,
      /export\s+const\s+\w+Card\s*=/,
      /export\s+const\s+\w+Layout\s*=/,
      /export\s+const\s+\w+Data\s*=/,
      /use\w+Data\s*=/,
      /use\w+State\s*=/,
      /format\w+\s*=/,
      /validate\w+\s*=/,
      /generate\w+Mocks\s*=/,
      /MetricCard/,
      /DataCard/,
      /GenericCard/,
      /DashboardLayout/,
      /GenericLayout/,
      /MetricData/,
      /GenericData/,
    ];

    // Verificar patrones específicos
    for (const pattern of specificPatterns) {
      if (pattern.test(content)) {
        this.specificPatterns.push({
          file: fileName,
          path: filePath,
          pattern: pattern.source,
        });
      }
    }

    // Verificar patrones genéricos
    for (const pattern of genericPatterns) {
      if (pattern.test(content)) {
        this.genericPatterns.push({
          file: fileName,
          path: filePath,
          pattern: pattern.source,
        });
      }
    }
  }

  async validatePatterns() {
    console.log("🔍 Validando patrones...");

    // Verificar componentes específicos
    if (this.specificPatterns.length > 0) {
      this.warnings.push({
        type: "SPECIFIC_COMPONENTS",
        message: `Se encontraron ${this.specificPatterns.length} componentes específicos que deberían ser genéricos`,
        details: this.specificPatterns.slice(0, 5), // Mostrar solo los primeros 5
      });
    }

    // Verificar componentes genéricos
    if (this.genericPatterns.length > 0) {
      this.success.push({
        type: "GENERIC_COMPONENTS",
        message: `Se encontraron ${this.genericPatterns.length} componentes genéricos`,
        details: this.genericPatterns.slice(0, 5),
      });
    }

    // Verificar documentación
    const docsPath = "docs/development/UI_GENERIC_PRINCIPLES.md";
    if (fs.existsSync(docsPath)) {
      this.success.push({
        type: "DOCUMENTATION",
        message: "Documentación de principios UI genérico encontrada",
        details: [{ file: "UI_GENERIC_PRINCIPLES.md" }],
      });
    } else {
      this.errors.push({
        type: "MISSING_DOCUMENTATION",
        message: "Falta documentación de principios UI genérico",
        details: [{ file: "UI_GENERIC_PRINCIPLES.md" }],
      });
    }
  }

  async checkDocumentation() {
    console.log("📚 Verificando documentación...");

    // Verificar que exista la documentación
    const docsPath = "docs/development/UI_GENERIC_PRINCIPLES.md";
    if (!fs.existsSync(docsPath)) {
      this.errors.push({
        type: "MISSING_DOCUMENTATION",
        message: "Documentación de principios UI genérico no encontrada",
        details: [{ file: "UI_GENERIC_PRINCIPLES.md" }],
      });
      return;
    }

    const content = fs.readFileSync(docsPath, "utf8");

    // Verificar secciones importantes
    const requiredSections = [
      "PRINCIPIOS FUNDAMENTALES",
      "ARQUITECTURA GENÉRICA",
      "PATRONES DE REUTILIZACIÓN",
      "SISTEMA DE TEMAS GENÉRICO",
      "PATRONES MOBILE GENÉRICOS",
      "UTILIDADES GENÉRICAS",
      "PATRONES DE DATOS GENÉRICOS",
      "TESTING GENÉRICO",
      "DOCUMENTACIÓN GENÉRICA",
      "IMPLEMENTACIÓN PRÁCTICA",
    ];

    for (const section of requiredSections) {
      if (!content.includes(section)) {
        this.warnings.push({
          type: "INCOMPLETE_DOCUMENTATION",
          message: `Sección faltante en documentación: ${section}`,
          details: [{ section }],
        });
      }
    }
  }

  async generateReport() {
    console.log("📊 Generando reporte...");

    console.log("\n📋 REPORTE DE VALIDACIÓN UI GENÉRICO");
    console.log("=====================================\n");

    // Éxitos
    if (this.success.length > 0) {
      console.log("✅ ÉXITOS:");
      for (const success of this.success) {
        console.log(`  • ${success.message}`);
        if (success.details) {
          success.details.forEach((detail) => {
            console.log(`    - ${detail.file || detail.section}`);
          });
        }
      }
      console.log("");
    }

    // Advertencias
    if (this.warnings.length > 0) {
      console.log("⚠️ ADVERTENCIAS:");
      for (const warning of this.warnings) {
        console.log(`  • ${warning.message}`);
        if (warning.details) {
          warning.details.forEach((detail) => {
            console.log(`    - ${detail.file || detail.section || detail.pattern}`);
          });
        }
      }
      console.log("");
    }

    // Errores
    if (this.errors.length > 0) {
      console.log("❌ ERRORES:");
      for (const error of this.errors) {
        console.log(`  • ${error.message}`);
        if (error.details) {
          error.details.forEach((detail) => {
            console.log(`    - ${detail.file || detail.section}`);
          });
        }
      }
      console.log("");
    }

    // Estadísticas
    console.log("📈 ESTADÍSTICAS:");
    console.log(`  • Componentes genéricos: ${this.genericPatterns.length}`);
    console.log(`  • Componentes específicos: ${this.specificPatterns.length}`);
    console.log(`  • Éxitos: ${this.success.length}`);
    console.log(`  • Advertencias: ${this.warnings.length}`);
    console.log(`  • Errores: ${this.errors.length}`);

    // Recomendaciones
    if (this.specificPatterns.length > 0) {
      console.log("\n💡 RECOMENDACIONES:");
      console.log("  • Refactorizar componentes específicos a genéricos");
      console.log("  • Usar interfaces genéricas en lugar de específicas");
      console.log("  • Implementar hooks genéricos para lógica reutilizable");
      console.log("  • Crear utilidades genéricas para formateo y validación");
    }

    // Resultado final
    const hasErrors = this.errors.length > 0;
    const hasWarnings = this.warnings.length > 0;

    if (hasErrors) {
      console.log("\n❌ VALIDACIÓN FALLIDA - Hay errores críticos");
      return false;
    } else if (hasWarnings) {
      console.log("\n⚠️ VALIDACIÓN CON ADVERTENCIAS - Revisar recomendaciones");
      return true;
    } else {
      console.log("\n✅ VALIDACIÓN EXITOSA - Todos los principios cumplidos");
      return true;
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const validator = new UIGenericValidator();
  validator.validate().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = UIGenericValidator;
