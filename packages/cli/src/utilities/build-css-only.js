/**
 * Build CSS Only Script
 *
 * Script para hacer build solo de CSS sin TypeScript
 *
 * @author AI Pair Platform - Backend Team
 * @version 1.0.0
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function buildCssOnly() {
  // TODO: log '🎨 Building CSS only...\n'
  // TODO: log '='.repeat(60)

  try {
    // Crear un archivo temporal de entrada solo con CSS
    const tempEntryPath = path.join(__dirname, "..", "temp-css-entry.js");
    const cssEntryContent = `
      import './src/index.css';
      // TODO: log 'CSS loaded'
    `;

    fs.writeFileSync(tempEntryPath, cssEntryContent);

    // Crear configuración temporal de Vite
    const tempViteConfigPath = path.join(__dirname, "..", "temp-vite.config.js");
    const viteConfigContent = `
      import { defineConfig } from 'vite';
      
      export default defineConfig({
        build: {
          outDir: 'dist-css',
          rollupOptions: {
            input: '${tempEntryPath.replace(/\\/g, "/")}',
            output: {
              entryFileNames: 'css-entry.js',
              assetFileNames: '[name].[ext]'
            }
          }
        },
        css: {
          postcss: './postcss.config.js'
        }
      });
    `;

    fs.writeFileSync(tempViteConfigPath, viteConfigContent);

    // TODO: log '📁 Created temporary build files'

    // Ejecutar build con configuración temporal
    // TODO: log '🔨 Running CSS build...'
    execSync("npx vite build --config temp-vite.config.js", {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });

    // TODO: log '✅ CSS build completed'

    // Verificar archivos generados
    const distCssPath = path.join(__dirname, "..", "dist-css");
    if (fs.existsSync(distCssPath)) {
      const files = fs.readdirSync(distCssPath);
      // TODO: log '\n📁 Generated files:'
      files.forEach((file) => {
        const filePath = path.join(distCssPath, file);
        const stats = fs.statSync(filePath);
        // TODO: log `   - ${file} (${stats.size} bytes)`

        if (file.endsWith(".css")) {
          const content = fs.readFileSync(filePath, "utf8");
          const hasTailwindClasses =
            content.includes(".bg-red-500") || content.includes(".bg-primary");
          // TODO: log `     Tailwind classes: ${hasTailwindClasses ? '✅ Present' : '❌ Missing'}`

          // Mostrar algunas clases como ejemplo
          const lines = content.split("\n").slice(0, 5);
          // TODO: log '     Sample classes:'
          lines.forEach((line) => {
            if (line.includes(".")) {
              // TODO: log `       ${line.trim()}`
            }
          });
        }
      });
    }

    // Limpiar archivos temporales
    fs.unlinkSync(tempEntryPath);
    fs.unlinkSync(tempViteConfigPath);
    // TODO: log '\n🧹 Cleaned up temporary files'
  } catch (error) {
    // TODO: log '❌ Error during CSS build:' error.message
  }

  // TODO: log '\n' + '='.repeat(60)
  // TODO: log '🎨 CSS BUILD COMPLETED'
  // TODO: log '='.repeat(60)
}

buildCssOnly();
