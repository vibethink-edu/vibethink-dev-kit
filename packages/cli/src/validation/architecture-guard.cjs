#!/usr/bin/env node

/**
 * Architecture Guard - VibeThink Orchestrator
 * Previene violaciones de arquitectura ANTES de que ocurran
 */

const fs = require("fs");
const path = require("path");

// Reglas de protección
const PROTECTION_RULES = {
  // 🚨 Archivos que NUNCA deben estar en root
  rootForbidden: [
    ".next",
    "next.config.js",
    "next-env.d.ts",
    "app",
    "pages",
    "src/app",
    "src/pages",
  ],

  // ✅ Estructuras que DEBEN existir
  requiredStructures: ["apps/", "src/shared/", "docs/", "dev-tools/"],

  // 📁 Apps que DEBEN existir
  requiredApps: ["main-app", "dashboard", "admin", "login", "helpdesk"],
};

/**
 * Valida ANTES de cualquier operación
 */
function validateBeforeOperation(operation) {
  console.log(`🔒 Validando ANTES de: ${operation}`);

  const violations = [];

  // Verificar archivos prohibidos en root
  PROTECTION_RULES.rootForbidden.forEach((forbidden) => {
    if (fs.existsSync(forbidden)) {
      violations.push(`❌ PROHIBIDO en root: ${forbidden}`);
    }
  });

  // Verificar estructuras requeridas
  PROTECTION_RULES.requiredStructures.forEach((required) => {
    if (!fs.existsSync(required)) {
      violations.push(`⚠️  FALTANTE: ${required}`);
    }
  });

  // Verificar apps requeridas
  PROTECTION_RULES.requiredApps.forEach((app) => {
    const appPath = `apps/${app}`;
    if (!fs.existsSync(appPath)) {
      violations.push(`⚠️  APP FALTANTE: ${appPath}`);
    }
  });

  if (violations.length > 0) {
    console.log("🚨 VIOLACIONES DETECTADAS:");
    violations.forEach((v) => console.log(`  ${v}`));
    console.log("\n💡 ACCIÓN REQUERIDA: Corregir violaciones antes de continuar");
    return false;
  }

  console.log("✅ Arquitectura válida - Puede continuar");
  return true;
}

/**
 * Valida DESPUÉS de cualquier operación
 */
function validateAfterOperation(operation) {
  console.log(`🔍 Validando DESPUÉS de: ${operation}`);

  const violations = [];

  // Verificar que no se crearon archivos prohibidos
  PROTECTION_RULES.rootForbidden.forEach((forbidden) => {
    if (fs.existsSync(forbidden)) {
      violations.push(`❌ VIOLACIÓN CREADA: ${forbidden} en root`);
    }
  });

  if (violations.length > 0) {
    console.log("🚨 VIOLACIONES NUEVAS:");
    violations.forEach((v) => console.log(`  ${v}`));
    console.log("\n💡 ACCIÓN REQUERIDA: Eliminar archivos prohibidos inmediatamente");
    return false;
  }

  console.log("✅ Sin violaciones nuevas");
  return true;
}

/**
 * Hook para npm scripts
 */
function setupNpmHooks() {
  console.log("🔒 Configurando hooks de protección...");

  // Validar antes de cualquier comando
  const command = process.argv[2] || "unknown";

  if (command.includes("dev") || command.includes("build") || command.includes("start")) {
    if (!validateBeforeOperation(command)) {
      process.exit(1);
    }
  }
}

/**
 * Validación continua (para usar en watch mode)
 */
function startContinuousValidation() {
  console.log("👁️  Iniciando validación continua...");

  // Verificar cada 5 segundos
  setInterval(() => {
    const hasViolations = PROTECTION_RULES.rootForbidden.some((forbidden) =>
      fs.existsSync(forbidden)
    );

    if (hasViolations) {
      console.log("🚨 VIOLACIÓN DETECTADA EN TIEMPO REAL");
      console.log("💡 Ejecute: npm run validate:architecture");
    }
  }, 5000);
}

// Exportar funciones
module.exports = {
  validateBeforeOperation,
  validateAfterOperation,
  setupNpmHooks,
  startContinuousValidation,
  PROTECTION_RULES,
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  setupNpmHooks();
}
