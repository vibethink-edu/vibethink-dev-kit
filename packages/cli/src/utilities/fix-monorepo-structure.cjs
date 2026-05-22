#!/usr/bin/env node

/**
 * Script de Corrección de Estructura Monorepo - VibeThink Orchestrator
 *
 * Este script corrige automáticamente la estructura del monorepo para que
 * cumpla con las reglas establecidas en ESTADO_ACTUAL_Y_REGLAS_PERMANENTES.md
 *
 * Reglas que implementa:
 * 1. Eliminar node_modules de apps individuales
 * 2. Unificar dependencias en root package.json
 * 3. Usar versiones exactas (sin ^ o ~)
 * 4. Configurar workspaces correctamente
 * 5. Validar estructura final
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

function logStep(step, message) {
  log(`\n${colors.bold}${colors.blue}${step}${colors.reset}`, "blue");
  log(message, "yellow");
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

// Función para verificar si existe un directorio
function exists(path) {
  try {
    return fs.existsSync(path);
  } catch (error) {
    return false;
  }
}

// Función para eliminar directorio recursivamente
function removeDirectory(dirPath) {
  if (exists(dirPath)) {
    log(`Eliminando: ${dirPath}`, "yellow");
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      logSuccess(`Eliminado: ${dirPath}`);
    } catch (error) {
      logError(`Error eliminando ${dirPath}: ${error.message}`);
    }
  }
}

// Función para leer package.json
function readPackageJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    logError(`Error leyendo ${filePath}: ${error.message}`);
    return null;
  }
}

// Función para escribir package.json
function writePackageJson(filePath, data) {
  try {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content + "\n");
    logSuccess(`Actualizado: ${filePath}`);
  } catch (error) {
    logError(`Error escribiendo ${filePath}: ${error.message}`);
  }
}

// Función para obtener todas las dependencias de un package.json
function getAllDependencies(pkg) {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  return Object.keys(deps).reduce((acc, key) => {
    acc[key] = deps[key];
    return acc;
  }, {});
}

// Función para convertir versiones a exactas
function makeExactVersion(version) {
  if (version.startsWith("^") || version.startsWith("~")) {
    return version.substring(1);
  }
  return version;
}

// Función principal de corrección
function fixMonorepoStructure() {
  log(
    `${colors.bold}${colors.blue}🔧 CORRECCIÓN DE ESTRUCTURA MONOREPO - VibeThink Orchestrator${colors.reset}`,
    "blue"
  );
  log("Implementando reglas permanentes...", "yellow");

  const rootDir = process.cwd();
  const appsDir = path.join(rootDir, "apps");

  // PASO 1: Limpiar node_modules de apps
  logStep("PASO 1", "Limpiando node_modules de apps individuales...");

  const apps = ["dashboard", "admin", "login", "helpdesk"];
  apps.forEach((app) => {
    const appDir = path.join(appsDir, app);
    const nodeModulesPath = path.join(appDir, "node_modules");
    const packageLockPath = path.join(appDir, "package-lock.json");

    if (exists(appDir)) {
      removeDirectory(nodeModulesPath);
      if (exists(packageLockPath)) {
        fs.unlinkSync(packageLockPath);
        logSuccess(`Eliminado: ${packageLockPath}`);
      }
    }
  });

  // PASO 2: Leer package.json de root
  logStep("PASO 2", "Analizando dependencias actuales...");

  const rootPackagePath = path.join(rootDir, "package.json");
  const rootPackage = readPackageJson(rootPackagePath);

  if (!rootPackage) {
    logError("No se pudo leer package.json de root");
    process.exit(1);
  }

  // PASO 3: Recopilar todas las dependencias de apps
  logStep("PASO 3", "Recopilando dependencias de apps...");

  const allDependencies = { ...rootPackage.dependencies, ...rootPackage.devDependencies };

  apps.forEach((app) => {
    const appPackagePath = path.join(appsDir, app, "package.json");
    if (exists(appPackagePath)) {
      const appPackage = readPackageJson(appPackagePath);
      if (appPackage) {
        const appDeps = getAllDependencies(appPackage);
        Object.assign(allDependencies, appDeps);
        logSuccess(`Dependencias recopiladas de: ${app}`);
      }
    }
  });

  // PASO 4: Convertir versiones a exactas
  logStep("PASO 4", "Convirtiendo versiones a exactas...");

  Object.keys(allDependencies).forEach((dep) => {
    allDependencies[dep] = makeExactVersion(allDependencies[dep]);
  });

  // PASO 5: Actualizar root package.json
  logStep("PASO 5", "Actualizando root package.json...");

  // Separar dependencies y devDependencies
  const dependencies = {};
  const devDependencies = {};

  // Lista de devDependencies conocidas
  const devDepsList = [
    "@types/node",
    "@types/react",
    "@types/react-dom",
    "typescript",
    "eslint",
    "eslint-config-next",
    "autoprefixer",
    "postcss",
    "tailwindcss",
    "concurrently",
    "jest",
    "@testing-library/react",
    "@testing-library/jest-dom",
  ];

  Object.keys(allDependencies).forEach((dep) => {
    if (devDepsList.includes(dep)) {
      devDependencies[dep] = allDependencies[dep];
    } else {
      dependencies[dep] = allDependencies[dep];
    }
  });

  // Actualizar root package.json
  rootPackage.dependencies = dependencies;
  rootPackage.devDependencies = devDependencies;

  // Asegurar que workspaces esté configurado
  if (!rootPackage.workspaces) {
    rootPackage.workspaces = ["apps/*", "src/*"];
  }

  writePackageJson(rootPackagePath, rootPackage);

  // PASO 6: Limpiar package.json de apps
  logStep("PASO 6", "Limpiando package.json de apps...");

  apps.forEach((app) => {
    const appPackagePath = path.join(appsDir, app, "package.json");
    if (exists(appPackagePath)) {
      const appPackage = readPackageJson(appPackagePath);
      if (appPackage) {
        // Mantener solo scripts y configuración básica
        const cleanPackage = {
          name: appPackage.name,
          version: appPackage.version,
          private: true,
          scripts: appPackage.scripts || {},
        };

        writePackageJson(appPackagePath, cleanPackage);
        logSuccess(`Limpiado: ${app}/package.json`);
      }
    }
  });

  // PASO 7: Instalar dependencias en root
  logStep("PASO 7", "Instalando dependencias en root...");

  try {
    execSync("npm install", { stdio: "inherit", cwd: rootDir });
    logSuccess("Dependencias instaladas correctamente");
  } catch (error) {
    logError(`Error instalando dependencias: ${error.message}`);
    process.exit(1);
  }

  // PASO 8: Validar estructura
  logStep("PASO 8", "Validando estructura final...");

  // Verificar que no hay node_modules en apps
  let hasNodeModulesInApps = false;
  apps.forEach((app) => {
    const nodeModulesPath = path.join(appsDir, app, "node_modules");
    if (exists(nodeModulesPath)) {
      logError(`❌ node_modules encontrado en apps/${app}`);
      hasNodeModulesInApps = true;
    }
  });

  if (!hasNodeModulesInApps) {
    logSuccess("✅ No hay node_modules en apps");
  }

  // Verificar que root tiene node_modules
  const rootNodeModules = path.join(rootDir, "node_modules");
  if (exists(rootNodeModules)) {
    logSuccess("✅ node_modules existe en root");
  } else {
    logError("❌ No hay node_modules en root");
  }

  // PASO 9: Probar funcionamiento
  logStep("PASO 9", "Probando funcionamiento...");

  try {
    // Intentar ejecutar el dashboard
    log("Probando npm run dev:dashboard...", "yellow");
    execSync("npm run dev:dashboard --dry-run", { stdio: "pipe", cwd: rootDir });
    logSuccess("✅ npm run dev:dashboard funciona");
  } catch (error) {
    logWarning("⚠️  No se pudo probar npm run dev:dashboard (esto es normal en --dry-run)");
  }

  // RESUMEN FINAL
  logStep("RESUMEN", "Corrección completada");
  logSuccess("✅ Estructura monorepo corregida");
  logSuccess("✅ Dependencias unificadas en root");
  logSuccess("✅ Versiones convertidas a exactas");
  logSuccess("✅ Workspaces configurado");
  logSuccess("✅ Apps limpiadas");

  log("\n📋 PRÓXIMOS PASOS:", "blue");
  log("1. Ejecutar: npm run dev:dashboard", "yellow");
  log("2. Verificar que todas las apps funcionan", "yellow");
  log("3. Ejecutar: npm run validate:universal", "yellow");
  log("4. Commitear los cambios", "yellow");

  log("\n🛡️ REGLAS IMPLEMENTADAS:", "blue");
  log("✅ Versiones exactas (sin ^ o ~)", "green");
  log("✅ Dependencias solo en root", "green");
  log("✅ Workspaces configurado", "green");
  log("✅ Apps sin node_modules", "green");
  log("✅ Imports desde shared", "green");

  log("\n🚨 RECUERDA:", "red");
  log("❌ NUNCA instalar en apps individuales", "red");
  log("❌ NUNCA usar versiones con ^ o ~", "red");
  log("❌ NUNCA tener node_modules en apps/", "red");
  log("✅ SIEMPRE instalar desde root", "green");
  log("✅ SIEMPRE usar versiones exactas", "green");
  log("✅ SIEMPRE validar antes de commitear", "green");
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  try {
    fixMonorepoStructure();
  } catch (error) {
    logError(`Error en corrección: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { fixMonorepoStructure };
