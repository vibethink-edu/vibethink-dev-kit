#!/usr/bin/env node

/**
 * Duplication Checker - VibeThink Orchestrator
 * AI-agnostic validator for VibeThink Orchestrator - checks for code duplication before creating new features
 */

const fs = require("fs");
const path = require("path");

class DuplicationChecker {
  constructor() {
    this.projectRoot = process.cwd();
    this.errors = [];
    this.warnings = [];
    this.success = [];
    this.existingFeatures = new Set();
  }

  async validate() {
    console.log("🔍 UNIVERSAL AI DUPLICATION CHECKER");
    console.log("=====================================\n");

    try {
      await this.scanExistingFeatures();
      await this.checkPackageJsonScripts();
      await this.checkValidationScripts();
      await this.checkDocumentation();
      await this.checkAutomationScripts();
      await this.generateReport();

      this.printResults();
      return this.errors.length === 0;
    } catch (error) {
      console.error("❌ Error durante validación:", error.message);
      return false;
    }
  }

  async scanExistingFeatures() {
    console.log("📋 Escaneando características existentes...");

    // Escanear scripts de validación
    const validationPath = path.join(this.projectRoot, "dev-tools/validation");
    if (fs.existsSync(validationPath)) {
      const files = fs.readdirSync(validationPath);
      files.forEach((file) => {
        if (file.endsWith(".cjs") || file.endsWith(".js")) {
          const feature = file.replace(/\.(cjs|js)$/, "").replace(/[-_]/g, " ");
          this.existingFeatures.add(feature);
          this.success.push(`✅ Validador existente: ${file}`);
        }
      });
    }

    // Escanear scripts de automatización
    const automationPath = path.join(this.projectRoot, "dev-tools/automation");
    if (fs.existsSync(automationPath)) {
      const files = fs.readdirSync(automationPath);
      files.forEach((file) => {
        if (file.endsWith(".js")) {
          const feature = file.replace(/\.js$/, "").replace(/[-_]/g, " ");
          this.existingFeatures.add(feature);
          this.success.push(`✅ Automatización existente: ${file}`);
        }
      });
    }

    // Escanear documentación
    const docsPath = path.join(this.projectRoot, "docs");
    if (fs.existsSync(docsPath)) {
      this.scanDocumentation(docsPath);
    }
  }

  scanDocumentation(dirPath, depth = 0) {
    if (depth > 3) return; // Limitar profundidad

    const items = fs.readdirSync(dirPath);
    items.forEach((item) => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        this.scanDocumentation(fullPath, depth + 1);
      } else if (item.endsWith(".md")) {
        const feature = item.replace(/\.md$/, "").replace(/[-_]/g, " ");
        this.existingFeatures.add(feature);
        this.success.push(`✅ Documentación existente: ${item}`);
      }
    });
  }

  async checkPackageJsonScripts() {
    console.log("📦 Verificando scripts npm existentes...");

    const packageJsonPath = path.join(this.projectRoot, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      const scripts = packageJson.scripts || {};

      Object.keys(scripts).forEach((script) => {
        this.existingFeatures.add(script);
        this.success.push(`✅ Script npm existente: ${script}`);
      });
    }

    // Verificar scripts en apps
    const appsPath = path.join(this.projectRoot, "apps");
    if (fs.existsSync(appsPath)) {
      const apps = fs.readdirSync(appsPath);
      apps.forEach((app) => {
        const appPackagePath = path.join(appsPath, app, "package.json");
        if (fs.existsSync(appPackagePath)) {
          try {
            const appPackage = JSON.parse(fs.readFileSync(appPackagePath, "utf8"));
            const appScripts = appPackage.scripts || {};
            Object.keys(appScripts).forEach((script) => {
              this.existingFeatures.add(`${app}:${script}`);
              this.success.push(`✅ Script ${app}: ${script}`);
            });
          } catch (error) {
            this.warnings.push(`⚠️ Error leyendo ${app}/package.json`);
          }
        }
      });
    }
  }

  async checkValidationScripts() {
    console.log("🔍 Verificando validadores específicos...");

    const validationScripts = [
      "cross-app-validator.cjs",
      "shared-component-validator.cjs",
      "security-validator.cjs",
      "performance-validator.cjs",
      "dependency-validator.cjs",
    ];

    validationScripts.forEach((script) => {
      const scriptPath = path.join(this.projectRoot, "dev-tools/validation", script);
      if (fs.existsSync(scriptPath)) {
        this.success.push(`✅ Validador específico: ${script}`);
      } else {
        this.warnings.push(`⚠️ Validador faltante: ${script}`);
      }
    });
  }

  async checkDocumentation() {
    console.log("📚 Verificando documentación existente...");

    const criticalDocs = [
      "CLAUDE.md",
      "docs/methodologies/VThink-1.0/05_BEST_PRACTICES/AI_INTEGRATION_STANDARDS.md",
      "docs/ai-coordination/AI_COORDINATION_PROTOCOL.md",
    ];

    criticalDocs.forEach((doc) => {
      const docPath = path.join(this.projectRoot, doc);
      if (fs.existsSync(docPath)) {
        this.success.push(`✅ Documentación crítica: ${doc}`);
      } else {
        this.warnings.push(`⚠️ Documentación faltante: ${doc}`);
      }
    });
  }

  async checkAutomationScripts() {
    console.log("🤖 Verificando automatización existente...");

    const automationPath = path.join(this.projectRoot, "dev-tools/automation");
    if (fs.existsSync(automationPath)) {
      const files = fs.readdirSync(automationPath);
      const jsFiles = files.filter((file) => file.endsWith(".js"));

      if (jsFiles.length > 0) {
        this.success.push(`✅ ${jsFiles.length} scripts de automatización existentes`);
      } else {
        this.warnings.push(`⚠️ No se encontraron scripts de automatización`);
      }
    }
  }

  checkForDuplication(newFeature) {
    const normalizedFeature = newFeature.toLowerCase().replace(/[-_\s]/g, " ");

    for (const existing of this.existingFeatures) {
      const normalizedExisting = existing.toLowerCase().replace(/[-_\s]/g, " ");

      // Verificar similitud
      if (this.calculateSimilarity(normalizedFeature, normalizedExisting) > 0.7) {
        return {
          isDuplicate: true,
          existingFeature: existing,
          similarity: this.calculateSimilarity(normalizedFeature, normalizedExisting),
        };
      }
    }

    return { isDuplicate: false };
  }

  calculateSimilarity(str1, str2) {
    const words1 = str1.split(" ");
    const words2 = str2.split(" ");
    const commonWords = words1.filter((word) => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  async generateReport() {
    console.log("\n📊 REPORTE DE DUPLICACIÓN");
    console.log("==========================");

    if (this.existingFeatures.size > 0) {
      console.log(`\n✅ Características existentes encontradas: ${this.existingFeatures.size}`);
      console.log("📋 Lista de características existentes:");
      Array.from(this.existingFeatures)
        .sort()
        .forEach((feature) => {
          console.log(`   • ${feature}`);
        });
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️ Advertencias: ${this.warnings.length}`);
      this.warnings.forEach((warning) => console.log(`   ${warning}`));
    }

    if (this.errors.length > 0) {
      console.log(`\n❌ Errores: ${this.errors.length}`);
      this.errors.forEach((error) => console.log(`   ${error}`));
    }
  }

  printResults() {
    console.log("\n🎯 RESULTADO FINAL");
    console.log("==================");

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log("✅ DUPLICATION CHECK: PASSED");
      console.log("✅ No se encontraron duplicaciones críticas");
      console.log("✅ Sistema existente documentado correctamente");
    } else if (this.errors.length === 0) {
      console.log("⚠️ DUPLICATION CHECK: WARNING");
      console.log("⚠️ Se encontraron advertencias menores");
    } else {
      console.log("❌ DUPLICATION CHECK: FAILED");
      console.log("❌ Se encontraron errores críticos");
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const checker = new DuplicationChecker();
  checker.validate().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = DuplicationChecker;
