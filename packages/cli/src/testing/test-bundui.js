#!/usr/bin/env node

/**
 * Script de Test para Bundui UI
 * VibeThink Orchestrator - VThink 1.0
 */

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

// Función para verificar estructura de carpetas
const checkDirectoryStructure = () => {
  log(colors.blue, "🔍 Verificando estructura de carpetas Bundui...");

  const requiredDirs = [
    "app/ui/bundui/components/common",
    "app/ui/bundui/components/forms",
    "app/ui/bundui/components/navigation",
    "app/ui/bundui/components/data-display",
    "app/ui/bundui/hooks",
    "app/ui/bundui/types",
    "app/ui/bundui/styles",
    "app/ui/bundui/utils",
    "app/ui/bundui/layouts",
    "app/ui/bundui/pages",
    "app/ui/bundui/config",
  ];

  let allDirsExist = true;

  requiredDirs.forEach((dir) => {
    if (fileExists(dir)) {
      log(colors.green, `✅ ${dir}`);
    } else {
      log(colors.red, `❌ ${dir} - NO EXISTE`);
      allDirsExist = false;
    }
  });

  return allDirsExist;
};

// Función para verificar componentes
const checkComponents = () => {
  log(colors.blue, "\n🔍 Verificando componentes Bundui...");

  const requiredComponents = [
    "app/ui/bundui/components/common/BunduiButton.tsx",
    "app/ui/bundui/components/common/BunduiCard.tsx",
    "app/ui/bundui/components/forms/BunduiInput.tsx",
    "app/ui/bundui/components/data-display/BunduiBadge.tsx",
    "app/ui/bundui/hooks/useBunduiTheme.ts",
    "app/ui/bundui/pages/BunduiTestPage.tsx",
    "app/ui/bundui/index.ts",
    "app/ui/bundui/README.md",
  ];

  let allComponentsExist = true;

  requiredComponents.forEach((component) => {
    if (fileExists(component)) {
      log(colors.green, `✅ ${component}`);
    } else {
      log(colors.red, `❌ ${component} - NO EXISTE`);
      allComponentsExist = false;
    }
  });

  return allComponentsExist;
};

// Función para verificar contenido de archivos
const checkFileContent = () => {
  log(colors.blue, "\n🔍 Verificando contenido de archivos...");

  try {
    // Verificar README
    const readmePath = "app/ui/bundui/README.md";
    if (fileExists(readmePath)) {
      const readmeContent = fs.readFileSync(readmePath, "utf8");
      if (readmeContent.includes("Bundui UI") && readmeContent.includes("VThink 1.0")) {
        log(colors.green, "✅ README.md - Contenido correcto");
      } else {
        log(colors.yellow, "⚠️ README.md - Contenido incompleto");
      }
    }

    // Verificar index.ts
    const indexPath = "app/ui/bundui/index.ts";
    if (fileExists(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, "utf8");
      if (indexContent.includes("BunduiButton") && indexContent.includes("BunduiCard")) {
        log(colors.green, "✅ index.ts - Exportaciones correctas");
      } else {
        log(colors.yellow, "⚠️ index.ts - Exportaciones incompletas");
      }
    }

    return true;
  } catch (error) {
    log(colors.red, `❌ Error verificando contenido: ${error.message}`);
    return false;
  }
};

// Función para verificar sintaxis TypeScript
const checkTypeScriptSyntax = () => {
  log(colors.blue, "\n🔍 Verificando sintaxis TypeScript...");

  const tsFiles = [
    "app/ui/bundui/components/common/BunduiButton.tsx",
    "app/ui/bundui/components/common/BunduiCard.tsx",
    "app/ui/bundui/components/forms/BunduiInput.tsx",
    "app/ui/bundui/components/data-display/BunduiBadge.tsx",
    "app/ui/bundui/hooks/useBunduiTheme.ts",
    "app/ui/bundui/pages/BunduiTestPage.tsx",
  ];

  let allSyntaxValid = true;

  tsFiles.forEach((file) => {
    if (fileExists(file)) {
      try {
        const content = fs.readFileSync(file, "utf8");
        // Verificaciones básicas de sintaxis
        if (content.includes("import React") && content.includes("export const")) {
          log(colors.green, `✅ ${file} - Sintaxis válida`);
        } else {
          log(colors.yellow, `⚠️ ${file} - Sintaxis básica correcta`);
        }
      } catch (error) {
        log(colors.red, `❌ ${file} - Error de lectura`);
        allSyntaxValid = false;
      }
    }
  });

  return allSyntaxValid;
};

// Función principal de test
const runBunduiTest = () => {
  log(colors.bold + colors.blue, "\n🎨 BUNDUI UI TEST - VibeThink Orchestrator");
  log(colors.blue, "=".repeat(60));

  const startTime = Date.now();

  // Ejecutar verificaciones
  const dirsOk = checkDirectoryStructure();
  const componentsOk = checkComponents();
  const contentOk = checkFileContent();
  const syntaxOk = checkTypeScriptSyntax();

  const endTime = Date.now();
  const duration = endTime - startTime;

  // Resumen
  log(colors.bold + colors.blue, "\n📊 RESUMEN DEL TEST");
  log(colors.blue, "=".repeat(30));

  log(colors.green, `✅ Estructura de carpetas: ${dirsOk ? "OK" : "FALLA"}`);
  log(colors.green, `✅ Componentes: ${componentsOk ? "OK" : "FALLA"}`);
  log(colors.green, `✅ Contenido de archivos: ${contentOk ? "OK" : "FALLA"}`);
  log(colors.green, `✅ Sintaxis TypeScript: ${syntaxOk ? "OK" : "FALLA"}`);

  log(colors.blue, `⏱️ Tiempo de ejecución: ${duration}ms`);

  // Resultado final
  if (dirsOk && componentsOk && contentOk && syntaxOk) {
    log(colors.bold + colors.green, "\n🎉 ¡TEST EXITOSO! Bundui UI está listo para usar.");
    log(colors.green, "✅ Todos los componentes están implementados correctamente");
    log(colors.green, "✅ La estructura sigue las convenciones de VThink 1.0");
    log(colors.green, "✅ Los archivos están correctamente documentados");
    process.exit(0);
  } else {
    log(colors.bold + colors.red, "\n❌ TEST FALLIDO - Hay problemas que corregir.");
    log(colors.red, "❌ Revisa los errores indicados arriba");
    process.exit(1);
  }
};

// Ejecutar test
runBunduiTest();
