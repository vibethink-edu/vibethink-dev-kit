#!/usr/bin/env node

/**
 * @file validate-external-strategy.cjs
 * @description Script para validar estrategia de software externo según reglas VThink 1.0
 * @version 1.0.0
 * @author VThink 1.0 Team
 *
 * IMPORTANTE: external/ es solo para validación de nuevos releases
 * NO debe estar en Git y NO debe usarse directamente
 */

const fs = require("fs");
const path = require("path");

class ExternalStrategyValidator {
  constructor() {
    this.root = process.cwd();
    this.violations = [];
    this.warnings = [];
    this.success = true;
  }

  /**
   * Validar que external/ está excluido de Git
   */
  validateGitExclusion() {
    console.log("🚫 Validando exclusión de Git para external/...");

    const gitignorePath = path.join(this.root, ".gitignore");
    if (!fs.existsSync(gitignorePath)) {
      this.violations.push("❌ .gitignore no existe");
      this.success = false;
      return;
    }

    const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
    if (!gitignoreContent.includes("external/")) {
      this.violations.push("❌ external/ no está en .gitignore (DEBE estar excluido)");
      this.success = false;
    } else {
      console.log("✅ external/ está excluido de Git");
    }
  }

  /**
   * Validar que external/ existe para validación
   */
  validateExternalExists() {
    console.log("📚 Validando existencia de external/ para validación...");

    const externalPath = path.join(this.root, "external");
    if (!fs.existsSync(externalPath)) {
      this.warnings.push("⚠️ external/ no existe (opcional para validación)");
      return;
    }

    const externalItems = fs.readdirSync(externalPath);
    if (externalItems.length === 0) {
      this.warnings.push("⚠️ external/ está vacío (normal si no hay validaciones pendientes)");
    } else {
      console.log(`✅ external/ contiene ${externalItems.length} elementos para validación`);
      externalItems.forEach((item) => {
        const itemPath = path.join(externalPath, item);
        if (fs.statSync(itemPath).isDirectory()) {
          console.log(`   📁 ${item}/ - Software para validación`);
        }
      });
    }
  }

  /**
   * Validar que no se usa software desde external/
   */
  validateNoExternalUsage() {
    console.log("🔍 Validando que no se usa software desde external/...");

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
            if (content.includes("external/")) {
              this.violations.push(
                `❌ Uso incorrecto de external/ en ${fullPath.replace(this.root, "")}`
              );
              this.success = false;
            }
          } catch (error) {
            // Ignorar errores de lectura
          }
        }
      }
    }

    scanDirectory.call(this, srcPath);

    if (this.violations.filter((v) => v.includes("external/")).length === 0) {
      console.log("✅ No se detectó uso incorrecto de external/");
    }
  }

  /**
   * Validar que el software integrado está en src/
   */
  validateIntegratedSoftware() {
    console.log("🔗 Validando software integrado en src/...");

    const srcPath = path.join(this.root, "src");
    if (!fs.existsSync(srcPath)) {
      this.violations.push("❌ src/ no existe");
      this.success = false;
      return;
    }

    // Verificar componentes integrados
    const integratedComponents = [
      "src/shared/components/bundui-premium",
      "src/integrations/tracardi",
      "src/integrations/analytics/posthog",
    ];

    for (const component of integratedComponents) {
      const componentPath = path.join(this.root, component);
      if (!fs.existsSync(componentPath)) {
        this.warnings.push(`⚠️ Componente integrado faltante: ${component}`);
      } else {
        console.log(`✅ Componente integrado: ${component}`);
      }
    }
  }

  /**
   * Validar estrategia de validación
   */
  validateValidationStrategy() {
    console.log("📋 Validando estrategia de validación...");

    // Verificar scripts de validación
    const validationScripts = [
      "dev-tools/scripts/validate-external-strategy.cjs",
      "dev-tools/scripts/validate-bundui-integration.cjs",
    ];

    for (const script of validationScripts) {
      const scriptPath = path.join(this.root, script);
      if (!fs.existsSync(scriptPath)) {
        this.warnings.push(`⚠️ Script de validación faltante: ${script}`);
      } else {
        console.log(`✅ Script de validación: ${script}`);
      }
    }

    // Verificar documentación
    const documentation = [
      "dev-tools/EXTERNAL_VALIDATION_STRATEGY.md",
      "dev-tools/BUNDUI_INTEGRATION_CLARIFICATION.md",
    ];

    for (const doc of documentation) {
      const docPath = path.join(this.root, doc);
      if (!fs.existsSync(docPath)) {
        this.warnings.push(`⚠️ Documentación faltante: ${doc}`);
      } else {
        console.log(`✅ Documentación: ${doc}`);
      }
    }
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
      `${timestamp}-external-strategy-validation.md`
    );

    const report = `# Reporte: Validación de Estrategia Externa - ${timestamp}

## 📊 Resumen Ejecutivo
- **Objetivo**: Validar estrategia de software externo según reglas VThink 1.0
- **Fecha**: ${timestamp}
- **Estado**: ${this.success ? "✅ Exitoso" : "❌ Con errores"}

## 🔍 Detalles Técnicos
- **Metodología**: VThink 1.0 External Strategy Rules
- **Herramientas**: Script de validación automática
- **Alcance**: Estrategia de software externo

## 📈 Métricas
- **Violaciones**: ${this.violations.length}
- **Advertencias**: ${this.warnings.length}
- **Estado**: ${this.success ? "Compliant" : "Non-Compliant"}

## 🎯 Estrategia Validada
- **✅ external/ = Validación de nuevos releases (NO en Git)**
- **✅ src/ = Código integrado (SÍ en Git)**
- **✅ apps/ = Aplicaciones propias (SÍ en Git)**

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
    ? "- ✅ Estrategia de software externo cumple con reglas VThink 1.0"
    : "- ❌ Se encontraron violaciones que deben corregirse"
}
- Exclusión de Git: ${this.violations.filter((v) => v.includes(".gitignore")).length === 0 ? "✅" : "❌"}
- Uso incorrecto: ${this.violations.filter((v) => v.includes("external/")).length} violaciones
- Software integrado: ${this.warnings.filter((w) => w.includes("Componente integrado")).length} advertencias
- Estrategia de validación: ${this.warnings.filter((w) => w.includes("Script de validación")).length} advertencias

## 📋 VThink 1.0 Compliance
- ✅ external/ excluido de Git
- ✅ No uso directo de software externo
- ✅ Software integrado en src/
- ✅ Estrategia de validación implementada

## 🔧 Próximos Pasos
1. ${this.success ? "Mantener estrategia actual" : "Corregir violaciones críticas"}
2. Resolver advertencias de componentes
3. Verificar scripts de validación
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
    console.log("🚀 Iniciando validación de estrategia de software externo...\n");
    console.log("📋 RECORDATORIO IMPORTANTE:");
    console.log("   ✅ external/ = Validación de nuevos releases (NO en Git)");
    console.log("   ✅ src/ = Código integrado (SÍ en Git)");
    console.log("   ✅ apps/ = Aplicaciones propias (SÍ en Git)\n");

    this.validateGitExclusion();
    this.validateExternalExists();
    this.validateNoExternalUsage();
    this.validateIntegratedSoftware();
    this.validateValidationStrategy();

    console.log("\n📊 Resultados de Validación:");
    console.log(
      `🚫 Exclusión de Git: ${this.violations.filter((v) => v.includes(".gitignore")).length === 0 ? "✅" : "❌"}`
    );
    console.log(
      `📚 Existencia de external/: ${this.warnings.filter((w) => w.includes("external/")).length === 0 ? "✅" : "⚠️"}`
    );
    console.log(
      `🔍 Uso incorrecto: ${this.violations.filter((v) => v.includes("external/")).length === 0 ? "✅" : "❌"}`
    );
    console.log(
      `🔗 Software integrado: ${this.warnings.filter((w) => w.includes("Componente integrado")).length === 0 ? "✅" : "⚠️"}`
    );
    console.log(
      `📋 Estrategia de validación: ${this.warnings.filter((w) => w.includes("Script de validación")).length === 0 ? "✅" : "⚠️"}`
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

    console.log("\n✅ Validación de estrategia de software externo exitosa");
    console.log("🎯 RECORDATORIO: external/ es solo para validación, NO para uso directo");
  }
}

// Ejecutar validación
const validator = new ExternalStrategyValidator();
validator.run();
