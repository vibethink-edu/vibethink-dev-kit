#!/usr/bin/env node

/**
 * Script para corregir referencias de VTK v4.6 a VTK 1.0
 * Actualiza sistemáticamente todas las referencias de versión en el proyecto
 */

const fs = require("fs");
const path = require("path");

// Configuración de reemplazos
const replacements = [
  // Referencias principales (insensible a mayúsculas)
  { from: /vtk[ -]?v?4\.6(\.1)?/gi, to: "VTK 1.0" },
  { from: /xtp[ -]?v?4\.6/gi, to: "VTK 1.0" },
  { from: /v4\.6/gi, to: "1.0" },

  // Referencias en imports y paths
  { from: /@\/vtk-v4\.6\//gi, to: "@/vtk-v1.0/" },
  { from: /vtk-v4\.6/gi, to: "vtk-v1.0" },

  // Referencias en comentarios y documentación
  { from: /metodolog[íi]a vtk v4\.6/gi, to: "metodología VTK 1.0" },
  { from: /vtk v4\.6 methodology/gi, to: "VTK 1.0 methodology" },
  { from: /vtk v4\.6 compliant/gi, to: "VTK 1.0 compliant" },
  { from: /vtk v4\.6 standards/gi, to: "VTK 1.0 standards" },

  // Referencias en archivos de configuración
  { from: /xtp-v4\.6-snippets\.json/gi, to: "vtk-1.0-snippets.json" },
  { from: /monorepo_management_v4\.6\.md/gi, to: "MONOREPO_MANAGEMENT_V1.0.md" },

  // Referencias en versiones de scripts
  { from: /analyzer_version: ?['"]xtp v4\.6['"]/gi, to: "analyzer_version: 'VTK 1.0'" },
  { from: /framework_version: ?['"]vtk v4\.6['"]/gi, to: "framework_version: 'VTK 1.0'" },
  { from: /vtk_compliance: ?['"]v4\.6['"]/gi, to: "VTK_compliance: '1.0'" },
  { from: /vtk_version: ?"v4\.6"/gi, to: 'VTK_version: "1.0"' },

  // Referencias en títulos y headers
  { from: /vtk v4\.6 - /gi, to: "VTK 1.0 - " },
  { from: /xtp v4\.6 - /gi, to: "VTK 1.0 - " },

  // Referencias en descripciones
  { from: /siguiendo( la)? metodolog[íi]a vtk v4\.6/gi, to: "siguiendo la metodología VTK 1.0" },

  // Referencias en nombres de archivos (solo en contenido)
  { from: /recap_metodologia_xtp_v4_6\.md/gi, to: "recap_metodologia_vtk_1_0.md" },
  { from: /vtk_v4_6_update_report\.md/gi, to: "VTK_1_0_UPDATE_REPORT.md" },
  { from: /role_update_v4_6\.md/gi, to: "ROLE_UPDATE_V1_0.md" },
  { from: /xtp_v4_6_methodology_completed\.md/gi, to: "VTK_1_0_METHODOLOGY_COMPLETED.md" },
];

// Directorios a procesar
const directories = ["src", "docs", "scripts", "config"];

// Extensiones de archivos a procesar
const fileExtensions = [".ts", ".tsx", ".js", ".jsx", ".md", ".json", ".yml", ".yaml", ".txt"];

// Archivos a excluir
const excludeFiles = ["node_modules", ".git", "dist", "build", "coverage", "backups", "archives"];

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  const shouldProcess =
    fileExtensions.includes(ext) && !excludeFiles.some((exclude) => filePath.includes(exclude));

  if (shouldProcess) {
    console.log(`🔍 Procesando: ${filePath}`);
  }

  return shouldProcess;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    let newContent = content;
    let changes = 0;

    console.log(`📝 Analizando: ${filePath}`);

    // Aplicar todos los reemplazos
    replacements.forEach((replacement) => {
      const matches = newContent.match(replacement.from);
      if (matches) {
        console.log(
          `   🔄 Reemplazando ${replacement.from} → "${replacement.to}" (${matches.length} veces)`
        );
        newContent = newContent.replace(replacement.from, replacement.to);
        changes += matches.length;
      }
    });

    // Si hubo cambios, escribir el archivo
    if (changes > 0) {
      fs.writeFileSync(filePath, newContent, "utf8");
      console.log(`✅ ${filePath} - ${changes} cambios`);
      return changes;
    } else {
      console.log(`⏭️  ${filePath} - Sin cambios`);
    }

    return 0;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return 0;
  }
}

function walkDirectory(dir) {
  let totalChanges = 0;
  let processedFiles = 0;

  try {
    const items = fs.readdirSync(dir);
    console.log(`📂 Explorando directorio: ${dir} (${items.length} items)`);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        totalChanges += walkDirectory(fullPath);
      } else if (shouldProcessFile(fullPath)) {
        const changes = processFile(fullPath);
        totalChanges += changes;
        if (changes > 0) processedFiles++;
      }
    }
  } catch (error) {
    console.error(`❌ Error accediendo a ${dir}:`, error.message);
  }

  return totalChanges;
}

function main() {
  console.log("🚀 Iniciando corrección de referencias VTK v4.6 → VTK 1.0\n");
  console.log(`📋 Configuración:`);
  console.log(`   - Directorios a procesar: ${directories.join(", ")}`);
  console.log(`   - Extensiones: ${fileExtensions.join(", ")}`);
  console.log(`   - Reemplazos configurados: ${replacements.length}\n`);

  let totalChanges = 0;
  const totalFiles = 0;

  directories.forEach((dir) => {
    if (fs.existsSync(dir)) {
      console.log(`📁 Procesando directorio: ${dir}`);
      const changes = walkDirectory(dir);
      totalChanges += changes;
      console.log(`   Cambios en ${dir}: ${changes}\n`);
    } else {
      console.log(`⚠️  Directorio no encontrado: ${dir}\n`);
    }
  });

  console.log("🎯 Resumen de la corrección:");
  console.log(`   Total de cambios realizados: ${totalChanges}`);
  console.log(`   Archivos procesados con cambios: ${totalFiles}`);
  console.log("\n✅ Corrección completada exitosamente!");

  if (totalChanges > 0) {
    console.log("\n📝 Próximos pasos:");
    console.log("   1. Revisar los cambios realizados");
    console.log("   2. Ejecutar pruebas para verificar que todo funciona");
    console.log("   3. Hacer commit de los cambios");
    console.log("   4. Actualizar documentación si es necesario");
  }
}

// Ejecutar el script
if (require.main === module) {
  main();
}

module.exports = { replacements, processFile, walkDirectory };
