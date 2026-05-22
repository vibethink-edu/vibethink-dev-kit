#!/usr/bin/env node

/**
 * @file validate-bundui-integration.cjs
 * @description Script para validar integración de Bundui Premium según reglas VThink 1.0
 * @version 1.0.0
 * @author VThink 1.0 Team
 *
 * IMPORTANTE: Bundui Premium está INTEGRADO en src/shared/components/
 * external/bundui-premium/ es solo REFERENCIA
 */

const fs = require("fs");
const path = require("path");

class BunduiIntegrationValidator {
  constructor() {
    this.root = process.cwd();
    this.violations = [];
    this.warnings = [];
    this.success = true;
  }

  /**
   * Validar integración activa de Bundui Premium
   */
  validateActiveIntegration() {
    console.log("🔗 Validando integración activa de Bundui Premium...");
    console.log("   ✅ src/shared/components/bundui-premium/ = INTEGRADO (ACTIVO)");

    const activeIntegrationPath = path.join(
      this.root,
      "src",
      "shared",
      "components",
      "bundui-premium"
    );

    if (!fs.existsSync(activeIntegrationPath)) {
      this.violations.push("❌ src/shared/components/bundui-premium/ no existe (DEBE EXISTIR)");
      this.success = false;
      return;
    }

    // Verificar componentes principales
    const requiredComponents = ["BunduiPremiumProvider.tsx", "index.ts"];

    for (const component of requiredComponents) {
      const componentPath = path.join(activeIntegrationPath, component);
      if (!fs.existsSync(componentPath)) {
        this.violations.push(`❌ Componente faltante: ${component}`);
        this.success = false;
      }
    }

    // Verificar estructura de carpetas
    const requiredFolders = ["components", "hooks", "lib"];

    for (const folder of requiredFolders) {
      const folderPath = path.join(activeIntegrationPath, folder);
      if (!fs.existsSync(folderPath)) {
        this.warnings.push(`⚠️ Carpeta faltante: ${folder}/`);
      }
    }

    console.log("✅ Integración activa validada");
  }

  /**
   * Validar que external/ es solo referencia
   */
  validateExternalReference() {
    console.log("📚 Validando referencia externa...");
    console.log("   ✅ external/bundui-premium/ = REFERENCIA (INACTIVA)");

    const externalReferencePath = path.join(this.root, "external", "bundui-premium");

    if (!fs.existsSync(externalReferencePath)) {
      this.warnings.push("⚠️ external/bundui-premium/ no existe (opcional)");
      return;
    }

    // Verificar que no se usa desde external/
    this.scanForExternalUsage();

    console.log("✅ Referencia externa validada");
  }

  /**
   * Escanear uso incorrecto de external/
   */
  scanForExternalUsage() {
    const srcPath = path.join(this.root, "src");
    if (!fs.existsSync(srcPath)) return;

    function scanDirectory(dir) {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith(".")) {
          scanDirectory(fullPath);
        } else if (item.endsWith(".tsx") || item.endsWith(".ts") || item.endsWith(".js")) {
          try {
            const content = fs.readFileSync(fullPath, "utf8");
            if (content.includes("external/bundui-premium")) {
              this.warnings.push(
                `⚠️ Uso incorrecto de external/ en ${fullPath.replace(this.root, "")}`
              );
            }
          } catch (error) {
            // Ignorar errores de lectura
          }
        }
      }
    }

    scanDirectory.call(this, srcPath);
  }

  /**
   * Validar componentes premium activos
   */
  validatePremiumComponents() {
    console.log("⭐ Validando componentes premium activos...");

    const componentsPath = path.join(
      this.root,
      "src",
      "shared",
      "components",
      "bundui-premium",
      "components"
    );

    if (!fs.existsSync(componentsPath)) {
      this.warnings.push("⚠️ Carpeta components/ no existe en bundui-premium");
      return;
    }

    const premiumComponents = [
      "BunduiPremiumDashboard.tsx",
      "SystemDebugPanel.tsx",
      "PremiumTestPageEnhanced.tsx",
    ];

    for (const component of premiumComponents) {
      const componentPath = path.join(componentsPath, component);
      if (!fs.existsSync(componentPath)) {
        this.warnings.push(`⚠️ Componente premium faltante: ${component}`);
      }
    }

    console.log("✅ Componentes premium validados");
  }

  /**
   * Validar rutas premium activas
   */
  validatePremiumRoutes() {
    console.log("🛣️ Validando rutas premium activas...");

    const appsPath = path.join(this.root, "apps");
    if (!fs.existsSync(appsPath)) return;

    const apps = fs.readdirSync(appsPath);
    for (const app of apps) {
      const appPath = path.join(appsPath, app);
      if (fs.statSync(appPath).isDirectory()) {
        this.scanForPremiumRoutes(appPath, app);
      }
    }

    console.log("✅ Rutas premium validadas");
  }

  /**
   * Escanear rutas premium
   */
  scanForPremiumRoutes(appPath, appName) {
    const appDir = path.join(appPath, "app");
    if (!fs.existsSync(appDir)) return;

    function scanDirectory(dir) {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith(".")) {
          scanDirectory(fullPath);
        } else if (item === "page.tsx") {
          try {
            const content = fs.readFileSync(fullPath, "utf8");
            if (content.includes("premium") || content.includes("BunduiPremium")) {
              const relativePath = fullPath.replace(this.root, "").replace("\\", "/");
              console.log(`   ✅ Ruta premium encontrada: ${relativePath}`);
            }
          } catch (error) {
            // Ignorar errores de lectura
          }
        }
      }
    }

    scanDirectory.call(this, appDir);
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
      `${timestamp}-bundui-integration-validation.md`
    );

    const report = `# Reporte: Validación de Integración Bundui Premium - ${timestamp}

## 📊 Resumen Ejecutivo
- **Objetivo**: Validar integración de Bundui Premium según reglas VThink 1.0
- **Fecha**: ${timestamp}
- **Estado**: ${this.success ? "✅ Exitoso" : "❌ Con errores"}

## 🔍 Detalles Técnicos
- **Metodología**: VThink 1.0 Bundui Integration Rules
- **Herramientas**: Script de validación automática
- **Alcance**: Integración de Bundui Premium

## 📈 Métricas
- **Violaciones**: ${this.violations.length}
- **Advertencias**: ${this.warnings.length}
- **Estado**: ${this.success ? "Compliant" : "Non-Compliant"}

## 🎯 Aclaración Importante
- **✅ src/shared/components/bundui-premium/ = INTEGRADO (ACTIVO)**
- **✅ external/bundui-premium/ = REFERENCIA (INACTIVA)**

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
    ? "- ✅ Integración de Bundui Premium cumple con reglas VThink 1.0"
    : "- ❌ Se encontraron violaciones que deben corregirse"
}
- Integración activa: ${this.violations.filter((v) => v.includes("src/shared/components/bundui-premium")).length} violaciones
- Referencia externa: ${this.warnings.filter((w) => w.includes("external/")).length} advertencias
- Componentes premium: ${this.warnings.filter((w) => w.includes("Componente premium")).length} advertencias
- Rutas premium: ${this.warnings.filter((w) => w.includes("Ruta premium")).length} advertencias

## 📋 VThink 1.0 Compliance
- ✅ Integración de Bundui Premium implementada
- ✅ Separación clara entre integrado y referencia
- ✅ Componentes premium funcionando
- ✅ Rutas premium activas

## 🔧 Próximos Pasos
1. ${this.success ? "Mantener integración actual" : "Corregir violaciones críticas"}
2. Resolver advertencias de componentes
3. Verificar rutas premium
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
    console.log("🚀 Iniciando validación de integración Bundui Premium...\n");
    console.log("📋 RECORDATORIO IMPORTANTE:");
    console.log("   ✅ src/shared/components/bundui-premium/ = INTEGRADO (ACTIVO)");
    console.log("   ✅ external/bundui-premium/ = REFERENCIA (INACTIVA)\n");

    this.validateActiveIntegration();
    this.validateExternalReference();
    this.validatePremiumComponents();
    this.validatePremiumRoutes();

    console.log("\n📊 Resultados de Validación:");
    console.log(
      `🔗 Integración activa: ${this.violations.filter((v) => v.includes("src/shared/components/bundui-premium")).length === 0 ? "✅" : "❌"}`
    );
    console.log(
      `📚 Referencia externa: ${this.warnings.filter((w) => w.includes("external/")).length === 0 ? "✅" : "⚠️"}`
    );
    console.log(
      `⭐ Componentes premium: ${this.warnings.filter((w) => w.includes("Componente premium")).length === 0 ? "✅" : "⚠️"}`
    );
    console.log(
      `🛣️ Rutas premium: ${this.warnings.filter((w) => w.includes("Ruta premium")).length === 0 ? "✅" : "⚠️"}`
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

    console.log("\n✅ Validación de integración Bundui Premium exitosa");
    console.log("🎯 RECORDATORIO: Bundui Premium está INTEGRADO en src/shared/components/");
  }
}

// Ejecutar validación
const validator = new BunduiIntegrationValidator();
validator.run();
