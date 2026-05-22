#!/usr/bin/env node

/**
 * Quick Validator - VibeThink Orchestrator
 * AI-agnostic quick validator for VibeThink Orchestrator - rapid validation for any AI assistant
 */

const fs = require("fs");

// Reglas críticas
const CRITICAL_RULES = {
  // Archivos prohibidos en root
  rootForbidden: [".next", "next.config.js", "next-env.d.ts", "app", "pages"],

  // Estructuras requeridas
  requiredStructures: ["apps/", "src/shared/", "docs/", "dev-tools/"],

  // Apps requeridas
  requiredApps: ["main-app", "dashboard", "admin", "login", "helpdesk"],
};

function quickValidate() {
  console.log("⚡ QUICK VALIDATION - VibeThink Orchestrator\n");

  let hasErrors = false;
  const errors = [];
  const warnings = [];

  // 1. Verificar archivos prohibidos en root
  console.log("🔍 Verificando archivos prohibidos en root...");
  CRITICAL_RULES.rootForbidden.forEach((forbidden) => {
    if (fs.existsSync(forbidden)) {
      errors.push(`❌ PROHIBIDO en root: ${forbidden}`);
      hasErrors = true;
    }
  });

  // 2. Verificar estructuras requeridas
  console.log("🔍 Verificando estructuras requeridas...");
  CRITICAL_RULES.requiredStructures.forEach((required) => {
    if (!fs.existsSync(required)) {
      warnings.push(`⚠️  FALTANTE: ${required}`);
    }
  });

  // 3. Verificar apps requeridas
  console.log("🔍 Verificando apps requeridas...");
  CRITICAL_RULES.requiredApps.forEach((app) => {
    const appPath = `apps/${app}`;
    if (!fs.existsSync(appPath)) {
      warnings.push(`⚠️  APP FALTANTE: ${appPath}`);
    }
  });

  // Mostrar resultados
  console.log("\n📊 RESULTADOS:");

  if (errors.length > 0) {
    console.log("\n🚨 ERRORES CRÍTICOS:");
    errors.forEach((error) => console.log(`  ${error}`));
    console.log("\n💡 ACCIÓN REQUERIDA:");
    console.log("  - Eliminar archivos prohibidos del root");
    console.log("  - Ejecutar: npm run validate:architecture");
  }

  if (warnings.length > 0) {
    console.log("\n⚠️  ADVERTENCIAS:");
    warnings.forEach((warning) => console.log(`  ${warning}`));
    console.log("\n💡 ACCIÓN RECOMENDADA:");
    console.log("  - Crear estructuras faltantes");
    console.log("  - Ejecutar: npm run validate:guard");
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log("\n✅ VALIDACIÓN EXITOSA");
    console.log("  - Arquitectura válida");
    console.log("  - Sin violaciones críticas");
    console.log("  - Puede continuar con cambios");
  } else if (errors.length === 0) {
    console.log("\n✅ VALIDACIÓN CON ADVERTENCIAS");
    console.log("  - Arquitectura válida");
    console.log("  - Revisar advertencias");
  } else {
    console.log("\n❌ VALIDACIÓN FALLIDA");
    console.log("  - Corregir errores críticos");
    console.log("  - No continuar hasta corregir");
  }

  return !hasErrors;
}

// Comandos de ayuda
function showHelp() {
  console.log("⚡ QUICK VALIDATOR - COMANDOS DE AYUDA\n");
  console.log("📋 ANTES de cualquier cambio:");
  console.log("  npm run validate:quick");
  console.log("  npm run validate:architecture");
  console.log("");
  console.log("📋 DESPUÉS de cualquier cambio:");
  console.log("  npm run validate:universal");
  console.log("");
  console.log("📋 Si hay problemas:");
  console.log("  npm run validate:guard");
  console.log("");
  console.log("📚 LEER SIEMPRE:");
  console.log("  QUICK_REFERENCE_RULES.md");
  console.log("  ARCHITECTURE_RULES.md");
}

// Ejecutar validación
if (require.main === module) {
  const command = process.argv[2];

  if (command === "help" || command === "--help" || command === "-h") {
    showHelp();
  } else {
    const isValid = quickValidate();
    process.exit(isValid ? 0 : 1);
  }
}

module.exports = { quickValidate, CRITICAL_RULES };
