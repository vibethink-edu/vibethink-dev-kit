#!/usr/bin/env node

/**
 * Script de Validación de Integración Knotie-AI
 * Verifica que todos los componentes y servicios estén correctamente implementados
 *
 * @author AI Pair Platform - Integration Team
 * @version 1.0.0
 */

const fs = require("fs");
const path = require("path");

// Configuración de validación
const VALIDATION_CONFIG = {
  requiredFiles: [
    "src/components/universal-assistant/KnotieAgentOrchestrator.tsx",
    "src/components/universal-assistant/SnippetDashboard.tsx",
    "src/services/knotie/KnotieOrchestrationService.ts",
    "src/hooks/useKnotieIntegration.ts",
    "src/pages/admin/KnotieIntegrationPage.tsx",
    "src/routes/adminRoutes.tsx",
    "docs/integrations/KNOTIE_AI_INTEGRATION_BLUEPRINT.md",
    "docs/integrations/KNOTIE_IMPLEMENTATION_LOG.md",
  ],
  requiredPatterns: [
    /interface.*KnotieAgent/gi,
    /interface.*KnotieSnippet/gi,
    /class.*KnotieOrchestrationService/gi,
    /useKnotieIntegration/gi,
    /KnotieIntegrationPage/gi,
    /knotie-integration/gi,
  ],
  forbiddenPatterns: [/console\.log/gi, /TODO:/gi, /FIXME:/gi, /any\s*:/gi],
  requiredExports: [
    "KnotieAgentOrchestrator",
    "SnippetDashboard",
    "KnotieOrchestrationService",
    "useKnotieIntegration",
    "KnotieIntegrationPage",
  ],
};

// Colores para output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

// Función para log con colores
function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Función para verificar si un archivo existe
function fileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

// Función para leer contenido de archivo
function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(process.cwd(), filePath), "utf8");
  } catch (error) {
    return null;
  }
}

// Función para verificar patrones en archivo
function checkPatterns(content, patterns, type) {
  const results = [];

  patterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (type === "required" && !matches) {
      results.push(`❌ Patrón requerido no encontrado: ${pattern}`);
    } else if (type === "forbidden" && matches) {
      results.push(`⚠️  Patrón prohibido encontrado: ${pattern} (${matches.length} ocurrencias)`);
    }
  });

  return results;
}

// Función para verificar exports
function checkExports(content, exports) {
  const results = [];

  exports.forEach((exportName) => {
    const exportPattern = new RegExp(`export.*${exportName}|${exportName}.*export`, "gi");
    if (!content.match(exportPattern)) {
      results.push(`❌ Export requerido no encontrado: ${exportName}`);
    }
  });

  return results;
}

// Función principal de validación
function validateKnotieIntegration() {
  log("🔍 Iniciando validación de integración Knotie-AI...", "blue");
  log("", "reset");

  let totalErrors = 0;
  let totalWarnings = 0;
  let totalFiles = 0;

  // Validar archivos requeridos
  log("📁 Verificando archivos requeridos...", "blue");
  VALIDATION_CONFIG.requiredFiles.forEach((filePath) => {
    totalFiles++;
    if (fileExists(filePath)) {
      log(`✅ ${filePath}`, "green");

      // Verificar contenido del archivo
      const content = readFile(filePath);
      if (content) {
        // Verificar patrones requeridos
        const requiredErrors = checkPatterns(
          content,
          VALIDATION_CONFIG.requiredPatterns,
          "required"
        );
        requiredErrors.forEach((error) => {
          log(`   ${error}`, "red");
          totalErrors++;
        });

        // Verificar patrones prohibidos
        const forbiddenWarnings = checkPatterns(
          content,
          VALIDATION_CONFIG.forbiddenPatterns,
          "forbidden"
        );
        forbiddenWarnings.forEach((warning) => {
          log(`   ${warning}`, "yellow");
          totalWarnings++;
        });

        // Verificar exports
        const exportErrors = checkExports(content, VALIDATION_CONFIG.requiredExports);
        exportErrors.forEach((error) => {
          log(`   ${error}`, "red");
          totalErrors++;
        });
      }
    } else {
      log(`❌ ${filePath} - ARCHIVO NO ENCONTRADO`, "red");
      totalErrors++;
    }
  });

  log("", "reset");

  // Validar estructura de directorios
  log("📂 Verificando estructura de directorios...", "blue");
  const requiredDirs = [
    "src/components/universal-assistant",
    "src/services/knotie",
    "src/hooks",
    "src/pages/admin",
    "src/routes",
    "docs/integrations",
  ];

  requiredDirs.forEach((dir) => {
    if (fileExists(dir)) {
      log(`✅ ${dir}/`, "green");
    } else {
      log(`❌ ${dir}/ - DIRECTORIO NO ENCONTRADO`, "red");
      totalErrors++;
    }
  });

  log("", "reset");

  // Validar configuración de rutas
  log("🛣️  Verificando configuración de rutas...", "blue");
  const routesContent = readFile("src/routes/adminRoutes.tsx");
  if (routesContent) {
    if (routesContent.includes("knotie-integration")) {
      log("✅ Ruta /admin/knotie-integration configurada", "green");
    } else {
      log("❌ Ruta /admin/knotie-integration no encontrada", "red");
      totalErrors++;
    }

    if (routesContent.includes("KnotieIntegrationPage")) {
      log("✅ Import de KnotieIntegrationPage encontrado", "green");
    } else {
      log("❌ Import de KnotieIntegrationPage no encontrado", "red");
      totalErrors++;
    }
  }

  log("", "reset");

  // Validar navegación
  log("🧭 Verificando navegación...", "blue");
  const sidebarContent = readFile("src/components/layout/SidebarNav.tsx");
  if (sidebarContent) {
    if (sidebarContent.includes("Knotie-AI")) {
      log("✅ Enlace Knotie-AI en navegación", "green");
    } else {
      log("❌ Enlace Knotie-AI no encontrado en navegación", "red");
      totalErrors++;
    }

    if (sidebarContent.includes("Bot")) {
      log("✅ Icono Bot importado", "green");
    } else {
      log("❌ Icono Bot no encontrado", "red");
      totalErrors++;
    }
  }

  log("", "reset");

  // Validar documentación
  log("📚 Verificando documentación...", "blue");
  const blueprintContent = readFile("docs/integrations/KNOTIE_AI_INTEGRATION_BLUEPRINT.md");
  const logContent = readFile("docs/integrations/KNOTIE_IMPLEMENTATION_LOG.md");

  if (blueprintContent) {
    log("✅ Blueprint de integración encontrado", "green");
  } else {
    log("❌ Blueprint de integración no encontrado", "red");
    totalErrors++;
  }

  if (logContent) {
    log("✅ Log de implementación encontrado", "green");
  } else {
    log("❌ Log de implementación no encontrado", "red");
    totalErrors++;
  }

  log("", "reset");

  // Resumen final
  log("📊 RESUMEN DE VALIDACIÓN", "bold");
  log("=".repeat(50), "blue");
  log(`📁 Archivos verificados: ${totalFiles}`, "blue");
  log(`❌ Errores encontrados: ${totalErrors}`, totalErrors > 0 ? "red" : "green");
  log(`⚠️  Advertencias encontradas: ${totalWarnings}`, totalWarnings > 0 ? "yellow" : "green");
  log("", "reset");

  if (totalErrors === 0) {
    log("🎉 ¡Validación completada exitosamente!", "green");
    log("✅ La integración con Knotie-AI está lista para deployment", "green");
    return true;
  } else {
    log("❌ Se encontraron errores que deben ser corregidos", "red");
    log("🔧 Revisa los errores arriba y corrige antes del deployment", "yellow");
    return false;
  }
}

// Función para generar reporte
function generateReport() {
  log("📋 Generando reporte de validación...", "blue");

  const report = {
    timestamp: new Date().toISOString(),
    validation: {
      files: VALIDATION_CONFIG.requiredFiles.map((file) => ({
        path: file,
        exists: fileExists(file),
        size: fileExists(file) ? fs.statSync(path.join(process.cwd(), file)).size : 0,
      })),
      patterns: VALIDATION_CONFIG.requiredPatterns,
      exports: VALIDATION_CONFIG.requiredExports,
    },
    summary: {
      totalFiles: VALIDATION_CONFIG.requiredFiles.length,
      existingFiles: VALIDATION_CONFIG.requiredFiles.filter((file) => fileExists(file)).length,
      missingFiles: VALIDATION_CONFIG.requiredFiles.filter((file) => !fileExists(file)).length,
    },
  };

  const reportPath = path.join(process.cwd(), "knotie-validation-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  log(`📄 Reporte generado: ${reportPath}`, "green");
}

// Ejecutar validación
if (require.main === module) {
  const success = validateKnotieIntegration();

  if (process.argv.includes("--report")) {
    generateReport();
  }

  process.exit(success ? 0 : 1);
}

module.exports = {
  validateKnotieIntegration,
  generateReport,
};
