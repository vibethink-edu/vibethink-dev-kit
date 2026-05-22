/**
 * Check CSS Content Script
 *
 * Script para verificar el contenido del CSS generado
 *
 * @author AI Pair Platform - Backend Team
 * @version 1.0.0
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkCssContent() {
  // TODO: log '🔍 Checking CSS content...\n'
  // TODO: log '='.repeat(60)

  // Verificar archivo index.css
  const indexCssPath = path.join(__dirname, "..", "src", "index.css");
  // TODO: log '\n📁 Checking src/index.css:'
  // TODO: log '='.repeat(30)

  if (fs.existsSync(indexCssPath)) {
    const content = fs.readFileSync(indexCssPath, "utf8");
    // TODO: log `✅ File exists (${content.length} characters)`

    // Verificar directivas de Tailwind
    const hasTailwindBase = content.includes("@tailwind base");
    const hasTailwindComponents = content.includes("@tailwind components");
    const hasTailwindUtilities = content.includes("@tailwind utilities");

    // TODO: log `✅ @tailwind base: ${hasTailwindBase ? 'Present' : 'Missing'}`
    // TODO: log `✅ @tailwind components: ${hasTailwindComponents ? 'Present' : 'Missing'}`
    // TODO: log `✅ @tailwind utilities: ${hasTailwindUtilities ? 'Present' : 'Missing'}`

    // Verificar variables CSS
    const hasCssVariables = content.includes("--background");
    // TODO: log `✅ CSS Variables: ${hasCssVariables ? 'Present' : 'Missing'}`

    // Mostrar primeras líneas
    // TODO: log '\n📄 First 10 lines:'
    const lines = content.split("\n").slice(0, 10);
    lines.forEach((line, index) => {
      // TODO: log `${index + 1}: ${line}`
    });
  } else {
    // TODO: log '❌ File does not exist'
  }

  // Verificar si hay archivos CSS generados en dist
  const distPath = path.join(__dirname, "..", "dist");
  // TODO: log '\n📁 Checking dist folder:'
  // TODO: log '='.repeat(30)

  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    const cssFiles = files.filter((file) => file.endsWith(".css"));

    if (cssFiles.length > 0) {
      // TODO: log `✅ Found ${cssFiles.length} CSS files:`
      cssFiles.forEach((file) => {
        const filePath = path.join(distPath, file);
        const stats = fs.statSync(filePath);
        // TODO: log `   - ${file} (${stats.size} bytes)`

        // Verificar contenido del archivo CSS generado
        const content = fs.readFileSync(filePath, "utf8");
        const hasTailwindClasses =
          content.includes(".bg-red-500") || content.includes(".bg-primary");
        // TODO: log `     Tailwind classes: ${hasTailwindClasses ? 'Present' : 'Missing'}`
      });
    } else {
      // TODO: log '❌ No CSS files found in dist'
    }
  } else {
    // TODO: log '❌ Dist folder does not exist'
  }

  // Verificar configuración de Vite
  // TODO: log '\n⚡ Checking Vite configuration:'
  // TODO: log '='.repeat(30)

  const viteConfigPath = path.join(__dirname, "..", "vite.config.ts");
  if (fs.existsSync(viteConfigPath)) {
    const content = fs.readFileSync(viteConfigPath, "utf8");
    const hasCssPlugin = content.includes("css") || content.includes("@vitejs/plugin-react");
    // TODO: log `✅ CSS support: ${hasCssPlugin ? 'Configured' : 'Missing'}`
  } else {
    // TODO: log '❌ Vite config not found'
  }

  // Verificar package.json scripts
  // TODO: log '\n📦 Checking package.json scripts:'
  // TODO: log '='.repeat(30)

  const packageJsonPath = path.join(__dirname, "..", "package.json");
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const scripts = packageJson.scripts || {};

    const hasDevScript = scripts.dev;
    const hasBuildScript = scripts.build;

    // TODO: log `✅ Dev script: ${hasDevScript ? 'Present' : 'Missing'}`
    // TODO: log `✅ Build script: ${hasBuildScript ? 'Present' : 'Missing'}`

    if (hasDevScript) {
      // TODO: log `   Dev command: ${hasDevScript}`
    }
  }

  // Recomendaciones
  // TODO: log '\n💡 Recommendations:'
  // TODO: log '='.repeat(30)
  console.log("1. Clear browser cache and reload");
  console.log("2. Check browser console for CSS errors");
  console.log("3. Verify CSS is being loaded in Network tab");
  console.log("4. Try building the project: npm run build");
  console.log("5. Check if CSS is generated in dist folder");

  // TODO: log '\n🔧 Quick Fix Commands:'
  // TODO: log '='.repeat(30)
  console.log("npm run build");
  console.log("npm run dev -- --force");
  console.log("rm -rf node_modules && npm install");

  // TODO: log '\n' + '='.repeat(60)
  // TODO: log '🔍 CSS CONTENT CHECK COMPLETED'
  // TODO: log '='.repeat(60)
}

checkCssContent();
