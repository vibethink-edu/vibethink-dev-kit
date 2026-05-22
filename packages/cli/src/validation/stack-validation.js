#!/usr/bin/env node

/**
 * Stack Validation Script
 * Valida automáticamente que el documento maestro de Stack esté actualizado
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Colores para output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

class StackValidator {
  constructor() {
    this.masterDocument = "docs/MASTER_STACK_DOCUMENT.md";
    this.ruleDocument = "docs/STACK_UPDATE_MANDATORY_RULE.md";
    this.evaluationFiles = ["docs/evaluations/*.json", "docs/evaluations/*.md"];
    this.adrFiles = "docs/ADR-*.md";
  }

  /**
   * Ejecuta todas las validaciones
   */
  async validate() {
    // TODO: log `${colors.bold}${colors.blue}🔍 Validando Documento Maestro de Stack...${colors.reset}\n`

    const results = {
      masterDocument: this.validateMasterDocument(),
      lastUpdate: this.validateLastUpdate(),
      version: this.validateVersion(),
      coherence: this.validateCoherence(),
      evaluations: this.validateEvaluations(),
      adrs: this.validateADRs(),
      total: 0,
      passed: 0,
      failed: 0,
    };

    // Calcular totales
    Object.keys(results).forEach((key) => {
      if (typeof results[key] === "object" && results[key].passed !== undefined) {
        results.total += results[key].total || 0;
        results.passed += results[key].passed || 0;
        results.failed += results[key].failed || 0;
      }
    });

    this.printResults(results);
    return results.failed === 0;
  }

  /**
   * Valida que el documento maestro existe y es válido
   */
  validateMasterDocument() {
    const result = { total: 1, passed: 0, failed: 0, issues: [] };

    try {
      if (!fs.existsSync(this.masterDocument)) {
        result.failed++;
        result.issues.push("❌ Documento maestro no existe");
        return result;
      }

      const content = fs.readFileSync(this.masterDocument, "utf8");

      // Verificar estructura básica
      const requiredSections = [
        "Documento Maestro del Stack Tecnológico",
        "Resumen Ejecutivo del Stack",
        "Arquitectura General",
        "Stack Tecnológico Completo",
        "Changelog",
      ];

      requiredSections.forEach((section) => {
        if (!content.includes(section)) {
          result.failed++;
          result.issues.push(`❌ Sección faltante: ${section}`);
        }
      });

      if (result.failed === 0) {
        result.passed++;
      }
    } catch (error) {
      result.failed++;
      result.issues.push(`❌ Error leyendo documento: ${error.message}`);
    }

    return result;
  }

  /**
   * Valida que la última actualización sea reciente
   */
  validateLastUpdate() {
    const result = { total: 1, passed: 0, failed: 0, issues: [] };

    try {
      const content = fs.readFileSync(this.masterDocument, "utf8");
      const lastUpdateMatch = content.match(/Última actualización:\s*(\d{1,2}\s+\w+\s+\d{4})/);

      if (!lastUpdateMatch) {
        result.failed++;
        result.issues.push("❌ No se encontró fecha de última actualización");
        return result;
      }

      const lastUpdate = new Date(lastUpdateMatch[1]);
      const now = new Date();
      const daysDiff = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));

      if (daysDiff > 7) {
        result.failed++;
        result.issues.push(`❌ Documento desactualizado por ${daysDiff} días`);
      } else {
        result.passed++;
      }
    } catch (error) {
      result.failed++;
      result.issues.push(`❌ Error validando fecha: ${error.message}`);
    }

    return result;
  }

  /**
   * Valida que la versión esté actualizada
   */
  validateVersion() {
    const result = { total: 1, passed: 0, failed: 0, issues: [] };

    try {
      const content = fs.readFileSync(this.masterDocument, "utf8");
      const versionMatch = content.match(/Versión:\s*(\d+\.\d+\.\d+)/);

      if (!versionMatch) {
        result.failed++;
        result.issues.push("❌ No se encontró versión del documento");
        return result;
      }

      const version = versionMatch[1];
      const versionParts = version.split(".").map(Number);

      if (versionParts.length !== 3) {
        result.failed++;
        result.issues.push("❌ Formato de versión inválido");
      } else {
        result.passed++;
      }
    } catch (error) {
      result.failed++;
      result.issues.push(`❌ Error validando versión: ${error.message}`);
    }

    return result;
  }

  /**
   * Valida coherencia del stack
   */
  validateCoherence() {
    const result = { total: 3, passed: 0, failed: 0, issues: [] };

    try {
      const content = fs.readFileSync(this.masterDocument, "utf8");

      // Verificar que no hay conflictos de licencias
      const licenses = {
        MIT: 0,
        Apache: 0,
        GPL: 0,
        AGPL: 0,
        Propietario: 0,
      };

      const licenseMatches = content.match(/Licencia:\s*([^\n]+)/g);
      if (licenseMatches) {
        licenseMatches.forEach((match) => {
          const license = match.split(":")[1].trim();
          if (license.includes("MIT")) licenses.MIT++;
          else if (license.includes("Apache")) licenses.Apache++;
          else if (license.includes("GPL")) licenses.GPL++;
          else if (license.includes("AGPL")) licenses.AGPL++;
          else if (license.includes("Propietario")) licenses.Propietario++;
        });
      }

      // Verificar que no hay demasiados componentes propietarios
      if (licenses.Propietario > 5) {
        result.failed++;
        result.issues.push("❌ Demasiados componentes propietarios");
      } else {
        result.passed++;
      }

      // Verificar que hay componentes open source
      if (licenses.MIT + licenses.Apache > 0) {
        result.passed++;
      } else {
        result.failed++;
        result.issues.push("❌ No hay suficientes componentes open source");
      }

      // Verificar que no hay conflictos de AGPL
      if (licenses.AGPL > 0) {
        result.failed++;
        result.issues.push("⚠️ Componentes AGPL detectados - requiere validación legal");
      } else {
        result.passed++;
      }
    } catch (error) {
      result.failed++;
      result.issues.push(`❌ Error validando coherencia: ${error.message}`);
    }

    return result;
  }

  /**
   * Valida que las evaluaciones estén actualizadas
   */
  validateEvaluations() {
    const result = { total: 0, passed: 0, failed: 0, issues: [] };

    try {
      // Buscar archivos de evaluación
      const evaluationDir = "docs/evaluations";
      if (fs.existsSync(evaluationDir)) {
        const files = fs.readdirSync(evaluationDir);
        result.total = files.length;

        files.forEach((file) => {
          const filePath = path.join(evaluationDir, file);
          const content = fs.readFileSync(filePath, "utf8");

          // Verificar que tiene timestamp reciente
          const timestampMatch = content.match(/"timestamp":\s*"([^"]+)"/);
          if (timestampMatch) {
            const timestamp = new Date(timestampMatch[1]);
            const now = new Date();
            const daysDiff = Math.floor((now - timestamp) / (1000 * 60 * 60 * 24));

            if (daysDiff > 30) {
              result.failed++;
              result.issues.push(`❌ Evaluación desactualizada: ${file} (${daysDiff} días)`);
            } else {
              result.passed++;
            }
          } else {
            result.failed++;
            result.issues.push(`❌ Evaluación sin timestamp: ${file}`);
          }
        });
      }
    } catch (error) {
      result.failed++;
      result.issues.push(`❌ Error validando evaluaciones: ${error.message}`);
    }

    return result;
  }

  /**
   * Valida que los ADRs estén actualizados
   */
  validateADRs() {
    const result = { total: 0, passed: 0, failed: 0, issues: [] };

    try {
      // Buscar archivos ADR
      const docsDir = "docs";
      if (fs.existsSync(docsDir)) {
        const files = fs.readdirSync(docsDir);
        const adrFiles = files.filter((file) => file.startsWith("ADR-") && file.endsWith(".md"));
        result.total = adrFiles.length;

        adrFiles.forEach((file) => {
          const filePath = path.join(docsDir, file);
          const content = fs.readFileSync(filePath, "utf8");

          // Verificar que tiene fecha reciente
          const dateMatch = content.match(/Fecha:\s*(\d{1,2}\s+\w+\s+\d{4})/);
          if (dateMatch) {
            const date = new Date(dateMatch[1]);
            const now = new Date();
            const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));

            if (daysDiff > 90) {
              result.failed++;
              result.issues.push(`❌ ADR desactualizado: ${file} (${daysDiff} días)`);
            } else {
              result.passed++;
            }
          } else {
            result.failed++;
            result.issues.push(`❌ ADR sin fecha: ${file}`);
          }
        });
      }
    } catch (error) {
      result.failed++;
      result.issues.push(`❌ Error validando ADRs: ${error.message}`);
    }

    return result;
  }

  /**
   * Imprime los resultados de la validación
   */
  printResults(results) {
    // TODO: log `${colors.bold}${colors.blue}📊 Resultados de Validación:${colors.reset}\n`

    // Imprimir resultados por categoría
    Object.keys(results).forEach((key) => {
      if (typeof results[key] === "object" && results[key].total !== undefined) {
        const result = results[key];
        const percentage = result.total > 0 ? Math.round((result.passed / result.total) * 100) : 0;
        const status = result.failed === 0 ? "✅" : "❌";

        // TODO: log `${status} ${key}: ${result.passed}/${result.total} (${percentage}%)`

        if (result.issues && result.issues.length > 0) {
          result.issues.forEach((issue) => {
            // TODO: log `   ${issue}`
          });
        }
      }
    });

    // TODO: log `\n${colors.bold}${colors.blue}📈 Resumen Total:${colors.reset}`
    // TODO: log `✅ Pasadas: ${results.passed}`
    // TODO: log `❌ Fallidas: ${results.failed}`
    // TODO: log `📊 Total: ${results.total}`

    const overallPercentage =
      results.total > 0 ? Math.round((results.passed / results.total) * 100) : 0;
    const overallStatus = results.failed === 0 ? "✅ VALIDACIÓN EXITOSA" : "❌ VALIDACIÓN FALLIDA";

    // TODO: log `\n${colors.bold}${results.failed === 0 ? colors.green : colors.red}${overallStatus} (${overallPercentage}%)${colors.reset}`

    if (results.failed > 0) {
      // TODO: log `\n${colors.yellow}⚠️ Acciones requeridas:${colors.reset}`
      // TODO: log '1. Actualizar documento maestro de stack'
      // TODO: log '2. Revisar evaluaciones desactualizadas'
      // TODO: log '3. Validar ADRs pendientes'
      // TODO: log '4. Ejecutar validación nuevamente'
    }
  }
}

// Ejecutar validación si se llama directamente
if (require.main === module) {
  const validator = new StackValidator();
  validator
    .validate()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      // TODO: log `${colors.red}❌ Error en validación: ${error.message}${colors.reset}`
      process.exit(1);
    });
}

module.exports = StackValidator;
