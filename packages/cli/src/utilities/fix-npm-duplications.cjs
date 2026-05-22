#!/usr/bin/env node

/**
 * Fix NPM Duplications - VibeThink Orchestrator
 * Script para limpiar automáticamente duplicaciones de dependencias
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Colores para output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

const log = {
  title: (msg) => console.log(`${colors.cyan}${colors.bold}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}📋 ${msg}${colors.reset}`),
};

// Dependencias que DEBEN estar solo en raíz
const rootOnlyDeps = [
  "next",
  "typescript",
  "eslint",
  "eslint-config-next",
  "@types/node",
  "@types/react",
  "@types/react-dom",
  "postcss",
  "tailwindcss",
  "prettier",
  "clsx",
  "tailwind-merge",
  "class-variance-authority",
  "zod",
];

// Dependencias que main-app NO debe tener (react lo mantenemos en raíz)
const mainAppRemove = ["react", "react-dom", ...rootOnlyDeps];

// Dependencias que website puede mantener
const websiteExceptions = [
  "react", // React 19
  "react-dom", // React-DOM 19
];

async function fixDuplications() {
  log.title("\n🔧 FIX NPM DUPLICATIONS - VibeThink Orchestrator");
  log.title("================================================\n");

  let hasErrors = false;

  try {
    // 1. Limpiar main-app
    log.title("\n📦 LIMPIANDO MAIN-APP...");
    await cleanMainApp();

    // 2. Limpiar website (preservando React 19)
    log.title("\n📦 LIMPIANDO WEBSITE...");
    await cleanWebsite();

    // 3. Reinstalar desde raíz
    log.title("\n📦 REINSTALANDO DEPENDENCIAS DESDE RAÍZ...");
    await reinstallRoot();

    // 4. Validar resultado
    log.title("\n🔍 VALIDANDO RESULTADO...");
    await validateResult();
  } catch (error) {
    log.error(`Error durante limpieza: ${error.message}`);
    hasErrors = true;
  }

  if (!hasErrors) {
    log.success("\n✅ LIMPIEZA COMPLETADA EXITOSAMENTE");
    log.info('Ejecuta "npm run validate:npm-install" para verificar');
  } else {
    log.error("\n❌ LIMPIEZA COMPLETADA CON ERRORES");
    log.info("Revisa los mensajes anteriores");
  }
}

async function cleanMainApp() {
  const mainAppPath = path.join(process.cwd(), "apps", "main-app");

  if (!fs.existsSync(mainAppPath)) {
    log.warning("apps/main-app no encontrado");
    return;
  }

  log.info("Removiendo dependencias duplicadas de main-app...");

  process.chdir(mainAppPath);

  for (const dep of mainAppRemove) {
    try {
      log.info(`  Removiendo ${dep}...`);
      execSync(`npm uninstall ${dep}`, { stdio: "pipe" });
      log.success(`  ${dep} removido`);
    } catch (error) {
      // Si no existe, no es problema
      log.info(`  ${dep} no estaba instalado`);
    }
  }

  process.chdir("../..");
  log.success("main-app limpiado");
}

async function cleanWebsite() {
  const websitePath = path.join(process.cwd(), "apps", "website");

  if (!fs.existsSync(websitePath)) {
    log.warning("apps/website no encontrado");
    return;
  }

  log.info("Removiendo dependencias duplicadas de website (preservando React 19)...");

  // Leer package.json para preservar versiones de React
  const packageJsonPath = path.join(websitePath, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  // Guardar versiones de React 19 para restaurar
  const reactVersion = packageJson.dependencies?.react || "^19";
  const reactDomVersion = packageJson.dependencies?.["react-dom"] || "^19";

  process.chdir(websitePath);

  // Remover todas las duplicadas EXCEPTO React
  const websiteRemove = rootOnlyDeps.filter((dep) => !websiteExceptions.includes(dep));

  for (const dep of websiteRemove) {
    try {
      log.info(`  Removiendo ${dep}...`);
      execSync(`npm uninstall ${dep}`, { stdio: "pipe" });
      log.success(`  ${dep} removido`);
    } catch (error) {
      log.info(`  ${dep} no estaba instalado`);
    }
  }

  // Asegurar que React 19 se mantiene
  log.info("  Verificando React 19...");
  if (!packageJson.dependencies?.react?.includes("19")) {
    log.info("  Reinstalando React 19...");
    execSync(`npm install react@${reactVersion} react-dom@${reactDomVersion}`, { stdio: "pipe" });
    log.success("  React 19 preservado");
  }

  process.chdir("../..");
  log.success("website limpiado (React 19 preservado)");
}

async function reinstallRoot() {
  log.info("Ejecutando npm install desde raíz...");

  try {
    execSync("npm install", { stdio: "inherit" });
    log.success("Dependencias reinstaladas desde raíz");
  } catch (error) {
    log.error("Error al reinstalar dependencias");
    throw error;
  }
}

async function validateResult() {
  log.info("Ejecutando validación...");

  try {
    const result = execSync("npm run validate:npm-install", {
      encoding: "utf8",
      stdio: "pipe",
    });

    if (result.includes("FAILED")) {
      log.warning("Aún hay algunos problemas por resolver");
      console.log(result);
    } else if (result.includes("PASSED")) {
      log.success("Validación exitosa - No hay duplicaciones");
    }
  } catch (error) {
    // El comando puede fallar si hay errores, pero queremos ver el output
    if (error.stdout) {
      console.log(error.stdout);
    }
  }
}

// Función de ayuda para ejecutar comandos de forma segura
function safeExec(command, options = {}) {
  try {
    return execSync(command, { encoding: "utf8", ...options });
  } catch (error) {
    if (options.ignoreError) {
      return error.stdout || "";
    }
    throw error;
  }
}

// Ejecutar
if (require.main === module) {
  fixDuplications().catch((error) => {
    log.error(`Error fatal: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { fixDuplications };
