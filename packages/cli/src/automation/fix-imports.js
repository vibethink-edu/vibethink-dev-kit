#!/usr/bin/env node

/**
 * Script para corregir importaciones incorrectas en el proyecto
 *
 * Este script corrige las rutas de importación que están apuntando a ubicaciones incorrectas
 * después de la reorganización del código.
 *
 * @author AI Pair Platform - Development Team
 * @version 1.0.0
 */

const fs = require("fs");
const path = require("path");

// Mapeo de importaciones incorrectas a correctas
const importMappings = {
  // Hooks
  "@/shared/hooks/useAuth": "@/shared/hooks/hooks/useAuth",
  "@/shared/hooks/useRoleContext": "@/shared/hooks/hooks/useRoleContext",
  "@/shared/hooks/useCookies": "@/shared/hooks/hooks/useCookies",
  "@/shared/hooks/useSuperAdmin": "@/shared/hooks/hooks/useSuperAdmin",
  "@/shared/hooks/usePersonalization": "@/shared/hooks/hooks/usePersonalization",
  "@/shared/hooks/useCompanyLimits": "@/shared/hooks/hooks/useCompanyLimits",
  "@/shared/hooks/useDepartmentalPermissions": "@/shared/hooks/hooks/useDepartmentalPermissions",
  "@/shared/hooks/useDaylightTheme": "@/shared/hooks/hooks/useDaylightTheme",

  // Utils
  "@/shared/utils/constants": "@/shared/utils/utils/constants",
  "@/shared/utils/testSupabaseConnection": "@/shared/utils/utils/testSupabaseConnection",

  // Components
  "@/components/ProtectedRoute": "@/shared/components/auth/ProtectedRoute",
  "@/components/theme-provider": "@/components/theme-provider",

  // Legacy imports
  "@/hooks/useAuth": "@/shared/hooks/hooks/useAuth",
  "@/hooks/useRoleContext": "@/shared/hooks/hooks/useRoleContext",
};

function findFiles(dir, extensions = [".tsx", ".ts", ".js", ".jsx"]) {
  const files = [];

  function traverse(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Excluir directorios específicos
          if (
            !["node_modules", "dist", "build", "archives", "temp", "documentation"].includes(item)
          ) {
            traverse(fullPath);
          }
        } else if (extensions.some((ext) => item.endsWith(ext))) {
          // Excluir archivos de test
          if (!item.includes(".test.") && !item.includes(".spec.")) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // TODO: log `⚠️  Error accediendo a ${currentDir}: ${error.message}`
    }
  }

  traverse(dir);
  return files;
}

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let hasChanges = false;

    // Aplicar cada mapeo de importación
    Object.entries(importMappings).forEach(([oldImport, newImport]) => {
      const importRegex = new RegExp(
        `import\\s+.*from\\s+['"]${oldImport.replace("@/", "")}['"]`,
        "g"
      );
      const newContent = content.replace(importRegex, (match) => {
        return match.replace(oldImport, newImport);
      });

      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
        // TODO: log `✅ Corregida importación en ${filePath}: ${oldImport} → ${newImport}`
      }
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, content, "utf8");
      return true;
    }

    return false;
  } catch (error) {
    // TODO: log `❌ Error procesando ${filePath}:` error.message
    return false;
  }
}

function main() {
  // TODO: log '🔧 Iniciando corrección de importaciones...\n'

  const srcDir = path.join(__dirname, "..", "src");
  const files = findFiles(srcDir);

  let fixedFiles = 0;

  files.forEach((file) => {
    if (fixImportsInFile(file)) {
      fixedFiles++;
    }
  });

  // TODO: log '\n📊 Resumen:'
  // TODO: log `   Total de archivos procesados: ${files.length}`
  // TODO: log `   Archivos corregidos: ${fixedFiles}`
  // TODO: log `   Archivos sin cambios: ${files.length - fixedFiles}`

  if (fixedFiles > 0) {
    // TODO: log '\n✅ Corrección de importaciones completada exitosamente!'
  } else {
    // TODO: log '\nℹ️  No se encontraron importaciones que necesiten corrección.'
  }
}

// Ejecutar el script
main();

module.exports = { fixImportsInFile, importMappings };
