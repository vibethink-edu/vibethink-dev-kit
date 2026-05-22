#!/usr/bin/env node

/**
 * Script para limpiar console.logs de archivos de producción
 * Mantiene los logs en archivos de testing y desarrollo
 */

const fs = require("fs");
const path = require("path");

// Directorios a excluir (testing, desarrollo)
const EXCLUDE_DIRS = [
  "tests",
  "test",
  "node_modules",
  "dist",
  "build",
  "coverage",
  "docs",
  "scripts",
  "backups",
  "reports",
];

// Archivos a excluir
const EXCLUDE_FILES = [
  "testSupabaseConnection.ts", // Mantener para debugging
  "setup",
  "teardown",
  "mock",
  "fixture",
];

// Patrones de console a buscar
const CONSOLE_PATTERNS = [
  /console\.log\(/g,
  /console\.error\(/g,
  /console\.warn\(/g,
  /console\.info\(/g,
  /console\.debug\(/g,
];

// Patrones de console a mantener (con comentarios específicos)
const KEEP_PATTERNS = [
  /console\.log\(.*\/\/\s*KEEP/g,
  /console\.error\(.*\/\/\s*KEEP/g,
  /console\.warn\(.*\/\/\s*KEEP/g,
];

function shouldExcludeFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);

  // Verificar directorios excluidos
  for (const excludeDir of EXCLUDE_DIRS) {
    if (relativePath.includes(excludeDir)) {
      return true;
    }
  }

  // Verificar archivos excluidos
  const fileName = path.basename(filePath);
  for (const excludeFile of EXCLUDE_FILES) {
    if (fileName.includes(excludeFile)) {
      return true;
    }
  }

  return false;
}

function shouldKeepConsole(line) {
  for (const pattern of KEEP_PATTERNS) {
    if (pattern.test(line)) {
      return true;
    }
  }
  return false;
}

function cleanConsoleLogs(content) {
  const lines = content.split("\n");
  const cleanedLines = [];
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let shouldRemove = false;

    // Verificar si la línea contiene console.log
    for (const pattern of CONSOLE_PATTERNS) {
      if (pattern.test(line) && !shouldKeepConsole(line)) {
        shouldRemove = true;
        break;
      }
    }

    if (shouldRemove) {
      // Comentar la línea en lugar de eliminarla
      if (!line.trim().startsWith("//")) {
        cleanedLines.push(`// ${line}`);
        modified = true;
      } else {
        cleanedLines.push(line);
      }
    } else {
      cleanedLines.push(line);
    }
  }

  return {
    content: cleanedLines.join("\n"),
    modified,
  };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const { content: cleanedContent, modified } = cleanConsoleLogs(content);

    if (modified) {
      fs.writeFileSync(filePath, cleanedContent);
      // TODO: log `✅ Limpiado: ${filePath}`
      return true;
    }

    return false;
  } catch (error) {
    // TODO: log `❌ Error procesando ${filePath}:` error.message
    return false;
  }
}

function walkDirectory(dir) {
  const files = [];

  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!shouldExcludeFile(fullPath)) {
          files.push(...walkDirectory(fullPath));
        }
      } else if (stat.isFile()) {
        if (
          !shouldExcludeFile(fullPath) &&
          (fullPath.endsWith(".ts") ||
            fullPath.endsWith(".tsx") ||
            fullPath.endsWith(".js") ||
            fullPath.endsWith(".jsx"))
        ) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    // TODO: log `❌ Error leyendo directorio ${dir}:` error.message
  }

  return files;
}

function main() {
  // TODO: log '🧹 Iniciando limpieza de console.logs...'

  const srcDir = path.join(process.cwd(), "src");
  const files = walkDirectory(srcDir);

  // TODO: log `📁 Encontrados ${files.length} archivos para procesar`

  let cleanedCount = 0;

  for (const file of files) {
    if (processFile(file)) {
      cleanedCount++;
    }
  }

  // TODO: log `\n🎉 Limpieza completada:`
  // TODO: log `   - Archivos procesados: ${files.length}`
  // TODO: log `   - Archivos limpiados: ${cleanedCount}`
  // TODO: log `   - Console.logs comentados en lugar de eliminados`
  // TODO: log `   - Archivos de testing y desarrollo preservados`
}

if (require.main === module) {
  main();
}

module.exports = {
  cleanConsoleLogs,
  shouldExcludeFile,
  processFile,
};
