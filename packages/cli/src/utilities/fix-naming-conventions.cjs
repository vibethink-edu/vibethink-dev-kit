#!/usr/bin/env node

/**
 * Script Simple de Corrección de Naming Conventions
 *
 * @author Vita Asistente AI de Marcelo
 * @version 1.0.0
 */

const fs = require("fs");
const path = require("path");

// Reemplazos principales
const replacements = [
  { from: "AI Pair Platform", to: "Vita Asistente AI de Marcelo" },
  { from: "AI Pair Orchestrator", to: "VibeThink Orchestrator" },
  { from: "ai-pair-orchestrator", to: "vibethink-orchestrator" },
  { from: "ai_pair_orchestrator", to: "vibethink_orchestrator" },
  { from: "@author AI Pair Platform", to: "@author Vita Asistente AI de Marcelo" },
  { from: "Author: AI Pair Platform", to: "Author: Vita Asistente AI de Marcelo" },
  { from: "Autor: AI Pair Platform", to: "Autor: Vita Asistente AI de Marcelo" },
  { from: "-- Author: AI Pair Platform", to: "-- Author: Vita Asistente AI de Marcelo" },
  { from: "-- Autor: AI Pair Platform", to: "-- Autor: Vita Asistente AI de Marcelo" },
  { from: "name: 'AI Pair Platform'", to: "name: 'Vita Asistente AI de Marcelo'" },
  { from: "company: 'AI Pair Platform'", to: "company: 'Vita Asistente AI de Marcelo'" },
];

// Equipos específicos
const teamReplacements = [
  "Testing Team",
  "Backend Team",
  "Frontend Team",
  "UI Team",
  "Core Team",
  "Security Team",
  "Developer Experience Team",
  "Quality Standards Team",
  "Voice Integration Team",
  "Knotie Integration Team",
];

// Agregar reemplazos de equipos
teamReplacements.forEach((team) => {
  replacements.push({
    from: `@author AI Pair Platform - ${team}`,
    to: `@author Vita Asistente AI de Marcelo - ${team}`,
  });
  replacements.push({
    from: `-- Author: AI Pair Platform - ${team}`,
    to: `-- Author: Vita Asistente AI de Marcelo - ${team}`,
  });
  replacements.push({
    from: `AI Pair Platform - ${team}`,
    to: `Vita Asistente AI de Marcelo - ${team}`,
  });
});

const stats = {
  filesProcessed: 0,
  filesModified: 0,
  replacementsMade: 0,
  errors: [],
};

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const relativePath = path.relative(process.cwd(), filePath);

  const validExtensions = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
    ".md",
    ".txt",
    ".sql",
    ".yml",
    ".yaml",
    ".html",
    ".css",
    ".scss",
  ];
  const excludeDirs = [
    "node_modules",
    ".git",
    "dist",
    "build",
    "coverage",
    "backups",
    "archives",
    "repo_archive",
    "src.old",
  ];

  if (!validExtensions.includes(ext)) return false;

  for (const excludeDir of excludeDirs) {
    if (relativePath.includes(excludeDir)) return false;
  }

  return true;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    let modifiedContent = content;
    let fileModified = false;
    let fileReplacements = 0;

    for (const replacement of replacements) {
      const regex = new RegExp(replacement.from, "g");
      const matches = (modifiedContent.match(regex) || []).length;

      if (matches > 0) {
        modifiedContent = modifiedContent.replace(regex, replacement.to);
        fileReplacements += matches;
        fileModified = true;
      }
    }

    if (fileModified) {
      fs.writeFileSync(filePath, modifiedContent, "utf8");
      stats.filesModified++;
      stats.replacementsMade += fileReplacements;
      console.log(`✅ ${filePath} - ${fileReplacements} reemplazos`);
    }

    stats.filesProcessed++;
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`❌ Error procesando ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile()) {
      if (shouldProcessFile(fullPath)) {
        processFile(fullPath);
      }
    }
  }
}

function main() {
  console.log("🚀 Iniciando corrección de naming conventions...\n");

  const startTime = Date.now();

  try {
    processDirectory(process.cwd());

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n" + "=".repeat(60));
    console.log("📊 ESTADÍSTICAS FINALES");
    console.log("=".repeat(60));
    console.log(`⏱️  Tiempo total: ${duration}s`);
    console.log(`📁 Archivos procesados: ${stats.filesProcessed}`);
    console.log(`✏️  Archivos modificados: ${stats.filesModified}`);
    console.log(`🔄 Reemplazos realizados: ${stats.replacementsMade}`);
    console.log(`❌ Errores: ${stats.errors.length}`);

    if (stats.errors.length > 0) {
      console.log("\n⚠️  Errores encontrados:");
      stats.errors.forEach((error) => {
        console.log(`  - ${error.file}: ${error.error}`);
      });
    } else {
      console.log("\n✅ Corrección completada exitosamente!");
    }
  } catch (error) {
    console.error("💥 Error crítico:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
