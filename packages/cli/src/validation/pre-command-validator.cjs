#!/usr/bin/env node

/**
 * Pre-Command Validator - VibeThink Orchestrator
 * Se ejecuta ANTES de cada comando para prevenir violaciones
 */

const { validateBeforeOperation } = require("./architecture-guard.cjs");

// Comandos que requieren validación
const COMMANDS_TO_VALIDATE = ["dev", "build", "start", "test", "lint"];

// Obtener el comando actual
const command = process.argv[2] || "";

console.log(`🔒 Pre-Command Validation: ${command}`);

// Validar si es un comando que requiere verificación
if (COMMANDS_TO_VALIDATE.some((cmd) => command.includes(cmd))) {
  console.log("⚠️  Comando crítico detectado - Validando arquitectura...");

  if (!validateBeforeOperation(command)) {
    console.log("\n🚨 VALIDACIÓN FALLIDA");
    console.log("💡 Corrija las violaciones antes de continuar");
    console.log("💡 Comandos útiles:");
    console.log("   npm run validate:architecture");
    console.log("   npm run validate:guard");

    process.exit(1);
  }

  console.log("✅ Validación exitosa - Continuando...\n");
}

// Si no es un comando crítico, solo mostrar info
if (!COMMANDS_TO_VALIDATE.some((cmd) => command.includes(cmd))) {
  console.log("ℹ️  Comando no crítico - Saltando validación");
}
