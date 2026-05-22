#!/usr/bin/env node

/**
 * Script para probar las páginas de Bundui UI
 * VibeThink Orchestrator - VThink 1.0
 */

const { execSync } = require("child_process");
const fs = require("fs");

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

// Función para verificar archivos
const checkFiles = () => {
  log(colors.blue, "🔍 Verificando archivos de Bundui...");

  const files = [
    "app/ui/bundui/pages/BunduiDemoPage.tsx",
    "app/ui/bundui/pages/BunduiLoginPage.tsx",
    "app/ui/bundui/pages/BunduiDashboardPage.tsx",
    "app/ui/bundui/pages/BunduiTestPage.tsx",
    "app/bundui-demo/page.tsx",
    "app/bundui-login/page.tsx",
    "app/bundui-dashboard/page.tsx",
    "app/bundui-test/page.tsx",
  ];

  let allExist = true;

  files.forEach((file) => {
    if (fs.existsSync(file)) {
      log(colors.green, `✅ ${file}`);
    } else {
      log(colors.red, `❌ ${file} - NO EXISTE`);
      allExist = false;
    }
  });

  return allExist;
};

// Función para mostrar URLs
const showUrls = () => {
  log(colors.bold + colors.blue, "\n🌐 URLs de Demo Bundui:");
  log(colors.blue, "=".repeat(50));

  const urls = [
    { name: "Demo Principal", url: "http://localhost:3000/bundui-demo" },
    { name: "Login Page", url: "http://localhost:3000/bundui-login" },
    { name: "Dashboard", url: "http://localhost:3000/bundui-dashboard" },
    { name: "Test Componentes", url: "http://localhost:3000/bundui-test" },
  ];

  urls.forEach(({ name, url }) => {
    log(colors.green, `📱 ${name}: ${url}`);
  });
};

// Función para verificar servidor
const checkServer = () => {
  log(colors.blue, "\n🔍 Verificando servidor...");

  try {
    // Usar PowerShell para verificar
    const result = execSync(
      "powershell -Command \"try { $response = Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 5; $response.StatusCode } catch { 'Server not running' }\"",
      {
        encoding: "utf8",
        stdio: "pipe",
      }
    );

    if (result.trim() === "200") {
      log(colors.green, "✅ Servidor funcionando en http://localhost:3000");
      return true;
    } else {
      log(colors.yellow, "⚠️ Servidor no responde, iniciando...");
      return false;
    }
  } catch (error) {
    log(colors.red, "❌ Error verificando servidor");
    return false;
  }
};

// Función principal
const testBunduiPages = () => {
  log(colors.bold + colors.blue, "\n🎨 TEST BUNDUI PAGES - VibeThink Orchestrator");
  log(colors.blue, "=".repeat(60));

  // Verificar archivos
  const filesExist = checkFiles();

  if (!filesExist) {
    log(colors.red, "\n❌ Algunos archivos no existen");
    log(colors.red, "❌ Ejecuta: npm run bundui:setup");
    process.exit(1);
  }

  // Verificar servidor
  const serverRunning = checkServer();

  if (!serverRunning) {
    log(colors.yellow, "\n🚀 Iniciando servidor de desarrollo...");
    try {
      execSync("npm run dev", {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    } catch (error) {
      log(colors.red, "❌ Error iniciando servidor");
      return;
    }
  }

  // Mostrar URLs
  showUrls();

  log(colors.bold + colors.green, "\n✅ Bundui UI Demo lista para probar!");
  log(colors.blue, "\n📋 Instrucciones:");
  log(colors.yellow, "1. Abre tu navegador");
  log(colors.yellow, "2. Ve a http://localhost:3000/bundui-demo");
  log(colors.yellow, "3. Prueba las diferentes páginas");
  log(colors.yellow, "4. Cambia entre temas");
  log(colors.yellow, "5. Prueba el formulario de login");

  log(colors.blue, "\n🎯 Características a probar:");
  log(colors.green, "• Cambio de temas dinámico");
  log(colors.green, "• Validación de formularios");
  log(colors.green, "• Componentes responsivos");
  log(colors.green, "• Dashboard con métricas");
  log(colors.green, "• Actividad reciente");

  log(colors.bold + colors.blue, "\n🎨 ¡Disfruta la demo de Bundui UI!");
};

// Ejecutar test
testBunduiPages();
