#!/usr/bin/env node

/**
 * Architecture Validator - VibeThink Orchestrator
 * Valida que la estructura del proyecto siga ARCHITECTURE_RULES.md
 */

const fs = require("fs");
const path = require("path");

// Reglas de arquitectura según ARCHITECTURE_RULES.md
const ARCHITECTURE_RULES = {
  // ✅ Estructuras PERMITIDAS
  allowed: [
    "apps/main-app/",
    "apps/admin/",
    "apps/login/",
    "apps/helpdesk/",
    "src/shared/",
    "src/lib/",
    "src/integrations/",
    "src/modules/",
    "docs/",
    "dev-tools/",
  ],

  // ❌ Estructuras PROHIBIDAS
  prohibited: ["src/app/", "src/apps/", "apps/shared/", "apps/lib/"],

  // 🚨 Archivos PROHIBIDOS en root
  rootProhibited: [".next/", "next.config.js", "next-env.d.ts", "app/", "pages/"],
};

function checkArchitecture() {
  console.log("🏗️  Validando Arquitectura - VibeThink Orchestrator\n");

  let hasErrors = false;
  const errors = [];
  const warnings = [];

  // Verificar estructuras prohibidas
  console.log("🔍 Verificando estructuras prohibidas...");

  ARCHITECTURE_RULES.prohibited.forEach((prohibitedPath) => {
    if (fs.existsSync(prohibitedPath)) {
      errors.push(`❌ PROHIBIDO: ${prohibitedPath} existe`);
      hasErrors = true;
    }
  });

  // Verificar archivos prohibidos en root
  console.log("🔍 Verificando archivos prohibidos en root...");

  ARCHITECTURE_RULES.rootProhibited.forEach((prohibitedFile) => {
    if (fs.existsSync(prohibitedFile)) {
      errors.push(`❌ PROHIBIDO en root: ${prohibitedFile} existe`);
      hasErrors = true;
    }
  });

  // Verificar estructuras requeridas
  console.log("🔍 Verificando estructuras requeridas...");

  const requiredStructures = ["apps/", "src/shared/", "docs/", "dev-tools/"];

  requiredStructures.forEach((requiredPath) => {
    if (!fs.existsSync(requiredPath)) {
      warnings.push(`⚠️  RECOMENDADO: ${requiredPath} no existe`);
    }
  });

  // Verificar apps independientes
  console.log("🔍 Verificando aplicaciones independientes...");

  const expectedApps = ["main-app", "admin", "login", "helpdesk"];
  expectedApps.forEach((appName) => {
    const appPath = `apps/${appName}/`;
    if (!fs.existsSync(appPath)) {
      warnings.push(`⚠️  RECOMENDADO: ${appPath} no existe`);
    } else {
      // Verificar que tenga estructura de Next.js
      const hasAppDir = fs.existsSync(path.join(appPath, "app/"));
      const hasPackageJson = fs.existsSync(path.join(appPath, "package.json"));

      if (!hasAppDir && !hasPackageJson) {
        warnings.push(`⚠️  INCOMPLETO: ${appPath} no tiene estructura de app`);
      }
    }
  });

  // Mostrar resultados
  console.log("\n📊 RESULTADOS DE VALIDACIÓN:\n");

  if (errors.length > 0) {
    console.log("🚨 ERRORES CRÍTICOS:");
    errors.forEach((error) => console.log(`  ${error}`));
    console.log("");
  }

  if (warnings.length > 0) {
    console.log("⚠️  ADVERTENCIAS:");
    warnings.forEach((warning) => console.log(`  ${warning}`));
    console.log("");
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log("✅ Arquitectura válida - Cumple con ARCHITECTURE_RULES.md");
  } else if (errors.length === 0) {
    console.log("✅ Arquitectura válida con advertencias menores");
  } else {
    console.log("❌ Arquitectura inválida - Violaciones críticas encontradas");
  }

  // Mostrar estructura actual
  console.log("\n📁 ESTRUCTURA ACTUAL:");
  showCurrentStructure();

  return !hasErrors;
}

function showCurrentStructure() {
  const rootItems = fs
    .readdirSync(".")
    .filter((item) => !item.startsWith(".") && item !== "node_modules")
    .sort();

  console.log("Root:");
  rootItems.forEach((item) => {
    const stats = fs.statSync(item);
    const icon = stats.isDirectory() ? "📁" : "📄";
    console.log(`  ${icon} ${item}/`);
  });

  // Mostrar apps si existe
  if (fs.existsSync("apps/")) {
    const apps = fs.readdirSync("apps/");
    console.log("\nApps:");
    apps.forEach((app) => {
      console.log(`  📱 ${app}/`);
    });
  }

  // Mostrar src si existe
  if (fs.existsSync("src/")) {
    const srcItems = fs.readdirSync("src/");
    console.log("\nSrc:");
    srcItems.forEach((item) => {
      console.log(`  📦 ${item}/`);
    });
  }
}

// Ejecutar validación
if (require.main === module) {
  const isValid = checkArchitecture();
  process.exit(isValid ? 0 : 1);
}

module.exports = { checkArchitecture, ARCHITECTURE_RULES };
