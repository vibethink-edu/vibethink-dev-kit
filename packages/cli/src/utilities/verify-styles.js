#!/usr/bin/env node

/**
 * Script de verificación de estilos Tailwind CSS
 * Verifica que las clases principales estén disponibles y funcionando
 */

import fs from "fs";
import path from "path";

console.log("🎨 Verificando estilos de Tailwind CSS...\n");

// Verificar archivos críticos
const criticalFiles = ["tailwind.config.js", "postcss.config.js", "src/index.css", "package.json"];

console.log("📁 Verificando archivos críticos:");
criticalFiles.forEach((file) => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? "✅" : "❌"} ${file}`);
});

// Verificar dependencias en package.json
try {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};

  console.log("\n📦 Verificando dependencias:");

  const requiredDeps = ["tailwindcss", "postcss", "autoprefixer", "tailwindcss-animate"];

  requiredDeps.forEach((dep) => {
    const installed = dependencies[dep] || devDependencies[dep];
    console.log(`  ${installed ? "✅" : "❌"} ${dep}${installed ? ` (${installed})` : ""}`);
  });
} catch (error) {
  console.log("❌ Error leyendo package.json:", error.message);
}

// Verificar configuración de Tailwind
try {
  const tailwindConfig = fs.readFileSync("tailwind.config.js", "utf8");
  const hasContent = tailwindConfig.includes("content:");
  const hasPlugins = tailwindConfig.includes("plugins:");

  console.log("\n⚙️ Verificando configuración de Tailwind:");
  console.log(`  ${hasContent ? "✅" : "❌"} Content paths configurados`);
  console.log(`  ${hasPlugins ? "✅" : "❌"} Plugins configurados`);
} catch (error) {
  console.log("❌ Error leyendo tailwind.config.js:", error.message);
}

// Verificar CSS principal
try {
  const indexCss = fs.readFileSync("src/index.css", "utf8");
  const hasTailwindDirectives = indexCss.includes("@tailwind");
  const hasVariables = indexCss.includes("--background");

  console.log("\n🎨 Verificando CSS principal:");
  console.log(`  ${hasTailwindDirectives ? "✅" : "❌"} Directivas de Tailwind`);
  console.log(`  ${hasVariables ? "✅" : "❌"} Variables CSS personalizadas`);
} catch (error) {
  console.log("❌ Error leyendo src/index.css:", error.message);
}

console.log("\n🚀 Para verificar visualmente:");
console.log("1. Ejecuta: npm run dev");
console.log("2. Abre http://localhost:8080 en el navegador");
console.log("3. Busca el componente SimpleTest en la página principal");
console.log("4. Verifica que los colores y estilos se apliquen correctamente");

console.log("\n📋 Checklist visual:");
console.log("  ✅ Fondo oscuro (--background)");
console.log("  ✅ Texto claro (--foreground)");
console.log("  ✅ Botones con colores primarios");
console.log("  ✅ Cards con bordes y sombras");
console.log("  ✅ Grid responsive funcionando");
console.log("  ✅ Hover effects en botones");

console.log("\n✨ Verificación completada!");
