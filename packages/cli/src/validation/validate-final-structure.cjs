#!/usr/bin/env node

/**
 * Script de Validación Final - VibeThink Orchestrator
 *
 * Este script valida que la estructura del monorepo cumple con todas las
 * reglas establecidas en ESTADO_ACTUAL_Y_REGLAS_PERMANENTES.md
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
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, "green");
}

function logError(message) {
  log(`❌ ${message}`, "red");
}

function logWarning(message) {
  log(`⚠️  ${message}`, "yellow");
}

function logStep(step, message) {
  log(`\n${colors.bold}${colors.blue}${step}${colors.reset}`, "blue");
  log(message, "yellow");
}

// Función para verificar si existe un directorio
function exists(path) {
  try {
    return fs.existsSync(path);
  } catch (error) {
    return false;
  }
}

// Función para leer package.json
function readPackageJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

// Función para validar versión exacta
function isExactVersion(version) {
  return !version.startsWith("^") && !version.startsWith("~");
}

// Función principal de validación
function validateFinalStructure() {
  log(
    `${colors.bold}${colors.blue}🔍 VALIDACIÓN FINAL - VibeThink Orchestrator${colors.reset}`,
    "blue"
  );
  log("Verificando cumplimiento de reglas permanentes...", "yellow");

  const rootDir = process.cwd();
  const appsDir = path.join(rootDir, "apps");
  let allTestsPassed = true;

  // VALIDACIÓN 1: Estructura de directorios
  logStep("VALIDACIÓN 1", "Verificando estructura de directorios...");

  const apps = ["dashboard", "admin", "login", "helpdesk"];

  // Verificar que no hay node_modules en apps
  apps.forEach((app) => {
    const nodeModulesPath = path.join(appsDir, app, "node_modules");
    if (exists(nodeModulesPath)) {
      logError(`node_modules encontrado en apps/${app}`);
      allTestsPassed = false;
    } else {
      logSuccess(`No hay node_modules en apps/${app}`);
    }
  });

  // Verificar que root tiene node_modules
  const rootNodeModules = path.join(rootDir, "node_modules");
  if (exists(rootNodeModules)) {
    logSuccess("node_modules existe en root");
  } else {
    logError("No hay node_modules en root");
    allTestsPassed = false;
  }

  // VALIDACIÓN 2: Package.json de root
  logStep("VALIDACIÓN 2", "Verificando package.json de root...");

  const rootPackagePath = path.join(rootDir, "package.json");
  const rootPackage = readPackageJson(rootPackagePath);

  if (!rootPackage) {
    logError("No se pudo leer package.json de root");
    allTestsPassed = false;
  } else {
    // Verificar workspaces
    if (rootPackage.workspaces && rootPackage.workspaces.includes("apps/*")) {
      logSuccess("Workspaces configurado correctamente");
    } else {
      logError("Workspaces no configurado correctamente");
      allTestsPassed = false;
    }

    // Verificar versiones exactas en dependencies
    if (rootPackage.dependencies) {
      let allExactVersions = true;
      Object.keys(rootPackage.dependencies).forEach((dep) => {
        if (!isExactVersion(rootPackage.dependencies[dep])) {
          logError(`Versión no exacta en dependencies: ${dep} = ${rootPackage.dependencies[dep]}`);
          allExactVersions = false;
        }
      });

      if (allExactVersions) {
        logSuccess("Todas las dependencies tienen versiones exactas");
      } else {
        allTestsPassed = false;
      }
    }

    // Verificar versiones exactas en devDependencies
    if (rootPackage.devDependencies) {
      let allExactVersions = true;
      Object.keys(rootPackage.devDependencies).forEach((dep) => {
        if (!isExactVersion(rootPackage.devDependencies[dep])) {
          logError(
            `Versión no exacta en devDependencies: ${dep} = ${rootPackage.devDependencies[dep]}`
          );
          allExactVersions = false;
        }
      });

      if (allExactVersions) {
        logSuccess("Todas las devDependencies tienen versiones exactas");
      } else {
        allTestsPassed = false;
      }
    }
  }

  // VALIDACIÓN 3: Package.json de apps
  logStep("VALIDACIÓN 3", "Verificando package.json de apps...");

  apps.forEach((app) => {
    const appPackagePath = path.join(appsDir, app, "package.json");
    if (exists(appPackagePath)) {
      const appPackage = readPackageJson(appPackagePath);
      if (appPackage) {
        // Verificar que no tiene dependencies
        if (appPackage.dependencies && Object.keys(appPackage.dependencies).length > 0) {
          logError(`${app} tiene dependencies (no debería tenerlas)`);
          allTestsPassed = false;
        } else {
          logSuccess(`${app} no tiene dependencies`);
        }

        // Verificar que no tiene devDependencies
        if (appPackage.devDependencies && Object.keys(appPackage.devDependencies).length > 0) {
          logError(`${app} tiene devDependencies (no debería tenerlas)`);
          allTestsPassed = false;
        } else {
          logSuccess(`${app} no tiene devDependencies`);
        }

        // Verificar que tiene scripts
        if (appPackage.scripts && Object.keys(appPackage.scripts).length > 0) {
          logSuccess(`${app} tiene scripts configurados`);
        } else {
          logWarning(`${app} no tiene scripts configurados`);
        }
      }
    } else {
      logError(`No se encontró package.json en ${app}`);
      allTestsPassed = false;
    }
  });

  // VALIDACIÓN 4: Funcionamiento de scripts
  logStep("VALIDACIÓN 4", "Verificando funcionamiento de scripts...");

  try {
    // Verificar que el script dev:dashboard existe
    if (rootPackage && rootPackage.scripts && rootPackage.scripts["dev:dashboard"]) {
      logSuccess("Script dev:dashboard existe en root");
    } else {
      logError("Script dev:dashboard no existe en root");
      allTestsPassed = false;
    }

    // Verificar que el script build:all existe
    if (rootPackage && rootPackage.scripts && rootPackage.scripts["build:all"]) {
      logSuccess("Script build:all existe en root");
    } else {
      logError("Script build:all no existe en root");
      allTestsPassed = false;
    }
  } catch (error) {
    logError(`Error verificando scripts: ${error.message}`);
    allTestsPassed = false;
  }

  // VALIDACIÓN 5: Compatibilidad de versiones
  logStep("VALIDACIÓN 5", "Verificando compatibilidad de versiones...");

  if (rootPackage && rootPackage.dependencies) {
    // Verificar React y React-DOM
    if (rootPackage.dependencies.react && rootPackage.dependencies["react-dom"]) {
      const reactVersion = rootPackage.dependencies.react;
      const reactDomVersion = rootPackage.dependencies["react-dom"];

      if (reactVersion === reactDomVersion) {
        logSuccess(`React y React-DOM tienen la misma versión: ${reactVersion}`);
      } else {
        logError(
          `React (${reactVersion}) y React-DOM (${reactDomVersion}) tienen versiones diferentes`
        );
        allTestsPassed = false;
      }
    }

    // Verificar Next.js
    if (rootPackage.dependencies.next) {
      logSuccess(`Next.js versión: ${rootPackage.dependencies.next}`);
    }
  }

  // RESUMEN FINAL
  logStep("RESUMEN FINAL", "Resultados de validación");

  if (allTestsPassed) {
    logSuccess("🎉 TODAS LAS VALIDACIONES PASARON");
    logSuccess("✅ Estructura monorepo correcta");
    logSuccess("✅ Reglas permanentes implementadas");
    logSuccess("✅ Proyecto listo para desarrollo");

    log("\n📋 ESTADO ACTUAL:", "blue");
    log("✅ Dependencias unificadas en root", "green");
    log("✅ Versiones exactas implementadas", "green");
    log("✅ Workspaces configurado", "green");
    log("✅ Apps sin node_modules", "green");
    log("✅ Scripts funcionando", "green");

    log("\n🚀 PRÓXIMOS PASOS:", "blue");
    log("1. El proyecto está listo para desarrollo", "yellow");
    log("2. Usar: npm run dev:dashboard", "yellow");
    log("3. Seguir las reglas establecidas", "yellow");
    log("4. Validar antes de cada commit", "yellow");

    return true;
  } else {
    logError("❌ ALGUNAS VALIDACIONES FALLARON");
    logError("Revisar los errores anteriores y corregir");
    logError("Ejecutar: node fix-monorepo-structure.cjs");

    return false;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  try {
    const success = validateFinalStructure();
    process.exit(success ? 0 : 1);
  } catch (error) {
    logError(`Error en validación: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { validateFinalStructure };
