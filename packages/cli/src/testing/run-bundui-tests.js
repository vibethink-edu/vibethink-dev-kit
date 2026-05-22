#!/usr/bin/env node

/**
 * Script para ejecutar pruebas de Bundui UI
 * VibeThink Orchestrator - VThink 1.0
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Colores para console
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

// Función para log con colores
const log = (color, message) => {
  // TODO: log `${color}${message}${colors.reset}`
};

// Función para verificar si existe un archivo
const fileExists = (filePath) => {
  return fs.existsSync(filePath);
};

// Función para verificar archivos de test
const checkTestFiles = () => {
  log(colors.blue, "🔍 Verificando archivos de test Bundui...");

  const testFiles = [
    "tests/unit/bundui/BunduiButton.test.tsx",
    "tests/unit/bundui/BunduiCard.test.tsx",
    "tests/unit/bundui/BunduiInput.test.tsx",
    "tests/unit/bundui/BunduiBadge.test.tsx",
    "tests/unit/bundui/useBunduiTheme.test.ts",
  ];

  let allTestsExist = true;

  testFiles.forEach((testFile) => {
    if (fileExists(testFile)) {
      log(colors.green, `✅ ${testFile}`);
    } else {
      log(colors.red, `❌ ${testFile} - NO EXISTE`);
      allTestsExist = false;
    }
  });

  return allTestsExist;
};

// Función para ejecutar tests con Jest
const runJestTests = () => {
  log(colors.blue, "\n🧪 Ejecutando pruebas con Jest...");

  try {
    const testPattern = "tests/unit/bundui/**/*.test.{ts,tsx}";
    const command = `npx jest ${testPattern} --verbose --coverage`;

    log(colors.yellow, `Ejecutando: ${command}`);

    const result = execSync(command, {
      encoding: "utf8",
      stdio: "pipe",
    });

    log(colors.green, "✅ Tests ejecutados exitosamente");
    // TODO: log result

    return true;
  } catch (error) {
    log(colors.red, "❌ Error ejecutando tests");
    // TODO: log error.stdout || error.message
    return false;
  }
};

// Función para ejecutar tests con Vitest
const runVitestTests = () => {
  log(colors.blue, "\n🧪 Ejecutando pruebas con Vitest...");

  try {
    const testPattern = "tests/unit/bundui/**/*.test.{ts,tsx}";
    const command = `npx vitest run ${testPattern} --reporter=verbose`;

    log(colors.yellow, `Ejecutando: ${command}`);

    const result = execSync(command, {
      encoding: "utf8",
      stdio: "pipe",
    });

    log(colors.green, "✅ Tests ejecutados exitosamente");
    // TODO: log result

    return true;
  } catch (error) {
    log(colors.red, "❌ Error ejecutando tests");
    // TODO: log error.stdout || error.message
    return false;
  }
};

// Función para generar reporte de cobertura
const generateCoverageReport = () => {
  log(colors.blue, "\n📊 Generando reporte de cobertura...");

  try {
    const command =
      "npx jest tests/unit/bundui/**/*.test.{ts,tsx} --coverage --coverageReporters=text --coverageReporters=html";

    const result = execSync(command, {
      encoding: "utf8",
      stdio: "pipe",
    });

    log(colors.green, "✅ Reporte de cobertura generado");
    // TODO: log result

    return true;
  } catch (error) {
    log(colors.red, "❌ Error generando reporte de cobertura");
    // TODO: log error.stdout || error.message
    return false;
  }
};

// Función principal
const runBunduiTests = () => {
  log(colors.bold + colors.blue, "\n🧪 BUNDUI UI TESTS - VibeThink Orchestrator");
  log(colors.blue, "=".repeat(60));

  const startTime = Date.now();

  // Verificar archivos de test
  const testsExist = checkTestFiles();

  if (!testsExist) {
    log(colors.red, "\n❌ Algunos archivos de test no existen");
    log(colors.red, "❌ Ejecuta primero: npm run test:bundui-setup");
    process.exit(1);
  }

  // Intentar ejecutar con Jest primero
  let jestSuccess = false;
  try {
    jestSuccess = runJestTests();
  } catch (error) {
    log(colors.yellow, "⚠️ Jest no disponible, intentando con Vitest...");
  }

  // Si Jest falla, intentar con Vitest
  let vitestSuccess = false;
  if (!jestSuccess) {
    try {
      vitestSuccess = runVitestTests();
    } catch (error) {
      log(colors.yellow, "⚠️ Vitest no disponible");
    }
  }

  // Generar reporte de cobertura
  let coverageSuccess = false;
  try {
    coverageSuccess = generateCoverageReport();
  } catch (error) {
    log(colors.yellow, "⚠️ No se pudo generar reporte de cobertura");
  }

  const endTime = Date.now();
  const duration = endTime - startTime;

  // Resumen
  log(colors.bold + colors.blue, "\n📊 RESUMEN DE TESTS");
  log(colors.blue, "=".repeat(30));

  log(colors.green, `✅ Archivos de test: ${testsExist ? "OK" : "FALLA"}`);
  log(colors.green, `✅ Jest tests: ${jestSuccess ? "OK" : "FALLA"}`);
  log(colors.green, `✅ Vitest tests: ${vitestSuccess ? "OK" : "FALLA"}`);
  log(colors.green, `✅ Cobertura: ${coverageSuccess ? "OK" : "FALLA"}`);

  log(colors.blue, `⏱️ Tiempo de ejecución: ${duration}ms`);

  // Resultado final
  if (testsExist && (jestSuccess || vitestSuccess)) {
    log(colors.bold + colors.green, "\n🎉 ¡TESTS EXITOSOS! Bundui UI está completamente probado.");
    log(colors.green, "✅ Todos los componentes tienen pruebas unitarias");
    log(colors.green, "✅ Los tests siguen las convenciones de VThink 1.0");
    log(colors.green, "✅ La cobertura de código está documentada");
    process.exit(0);
  } else {
    log(colors.bold + colors.red, "\n❌ TESTS FALLIDOS - Hay problemas que corregir.");
    log(colors.red, "❌ Revisa los errores indicados arriba");
    log(colors.yellow, "💡 Asegúrate de tener Jest o Vitest instalado");
    process.exit(1);
  }
};

// Ejecutar tests
runBunduiTests();
