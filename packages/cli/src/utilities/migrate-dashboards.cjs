#!/usr/bin/env node

/**
 * VTHINK DASHBOARD MIGRATOR - Actualización masiva a componentes optimizados
 * Migra todos los dashboards para usar nuestros componentes de alto rendimiento
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

console.log("🚀 VThink: Migrando dashboards a componentes optimizados...\n");

// ✅ MAPEO DE IMPORTS ANTIGUOS → NUEVOS
const IMPORT_MIGRATIONS = {
  // Shadcn imports → Bundui optimized
  'from "@/components/ui/card"': 'from "@/shared/components/bundui-premium/components/ui/card"',
  'from "@/components/ui/button"': 'from "@/shared/components/bundui-premium/components/ui/button"',
  'from "@/components/ui/badge"': 'from "@/shared/components/bundui-premium/components/ui/badge"',
  'from "@/components/ui/avatar"': 'from "@/shared/components/bundui-premium/components/ui/avatar"',
  'from "@/components/ui/input"': 'from "@/shared/components/bundui-premium/components/ui/input"',
  'from "@/components/ui/select"': 'from "@/shared/components/bundui-premium/components/ui/select"',
  'from "@/components/ui/dialog"': 'from "@/shared/components/bundui-premium/components/ui/dialog"',
  'from "@/components/ui/dropdown-menu"':
    'from "@/shared/components/bundui-premium/components/ui/dropdown-menu"',
  'from "@/components/ui/table"': 'from "@/shared/components/bundui-premium/components/ui/table"',
  'from "@/components/ui/tabs"': 'from "@/shared/components/bundui-premium/components/ui/tabs"',
  'from "@/components/ui/form"': 'from "@/shared/components/bundui-premium/components/ui/form"',
  'from "@/components/ui/label"': 'from "@/shared/components/bundui-premium/components/ui/label"',
  'from "@/components/ui/separator"':
    'from "@/shared/components/bundui-premium/components/ui/separator"',
  'from "@/components/ui/sheet"': 'from "@/shared/components/bundui-premium/components/ui/sheet"',
  'from "@/components/ui/tooltip"':
    'from "@/shared/components/bundui-premium/components/ui/tooltip"',
  'from "@/components/ui/popover"':
    'from "@/shared/components/bundui-premium/components/ui/popover"',
  'from "@/components/ui/command"':
    'from "@/shared/components/bundui-premium/components/ui/command"',
  'from "@/components/ui/calendar"':
    'from "@/shared/components/bundui-premium/components/ui/calendar"',
  'from "@/components/ui/checkbox"':
    'from "@/shared/components/bundui-premium/components/ui/checkbox"',
  'from "@/components/ui/radio-group"':
    'from "@/shared/components/bundui-premium/components/ui/radio-group"',
  'from "@/components/ui/switch"': 'from "@/shared/components/bundui-premium/components/ui/switch"',
  'from "@/components/ui/textarea"':
    'from "@/shared/components/bundui-premium/components/ui/textarea"',
  'from "@/components/ui/progress"':
    'from "@/shared/components/bundui-premium/components/ui/progress"',
  'from "@/components/ui/slider"': 'from "@/shared/components/bundui-premium/components/ui/slider"',
  'from "@/components/ui/toggle"': 'from "@/shared/components/bundui-premium/components/ui/toggle"',
  'from "@/components/ui/scroll-area"':
    'from "@/shared/components/bundui-premium/components/ui/scroll-area"',

  // Layout components
  'from "@/components/layout/sidebar"':
    'from "@/shared/components/bundui-premium/components/layout/sidebar"',
  'from "@/components/layout/header"':
    'from "@/shared/components/bundui-premium/components/layout/header"',
};

// ✅ DASHBOARDS A MIGRAR
const DASHBOARD_PATHS = [
  "apps/dashboard/app/ecommerce-dashboard",
  "apps/dashboard/app/sales-dashboard",
  "apps/dashboard/app/finance-dashboard",
  "apps/dashboard/app/project-management-dashboard",
  // Primero los críticos para rendimiento
];

// ✅ FUNCIÓN DE MIGRACIÓN
function migrateDashboard(dashboardPath) {
  const dashboardName = path.basename(dashboardPath);
  const files = glob.sync(`${dashboardPath}/**/*.{tsx,ts}`);

  let migratedFiles = 0;
  let totalChanges = 0;

  console.log(`🔄 Migrando ${dashboardName}...`);

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf8");
    let fileChanged = false;
    let fileChanges = 0;

    // Apply import migrations
    Object.entries(IMPORT_MIGRATIONS).forEach(([oldImport, newImport]) => {
      if (content.includes(oldImport)) {
        content = content.replace(
          new RegExp(oldImport.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&"), "g"),
          newImport
        );
        fileChanged = true;
        fileChanges++;
      }
    });

    // Fix common chart imports
    if (content.includes('from "@/shared/components/ui/chart"')) {
      content = content.replace(
        "import { Chart }",
        "import { ChartContainer, ChartTooltip, ChartTooltipContent }"
      );
      content = content.replace(/<Chart/g, "<ChartContainer");
      content = content.replace(/<\/Chart>/g, "</ChartContainer>");
      fileChanged = true;
      fileChanges++;
    }

    if (fileChanged) {
      fs.writeFileSync(file, content);
      migratedFiles++;
      totalChanges += fileChanges;
      console.log(`   ✅ ${path.basename(file)} - ${fileChanges} changes`);
    }
  });

  return {
    name: dashboardName,
    files: files.length,
    migratedFiles,
    totalChanges,
  };
}

// ✅ EJECUTAR MIGRACIONES
console.log("📊 EJECUTANDO MIGRACIONES...\n");

const results = [];
let totalFiles = 0;
let totalMigrated = 0;
let totalChanges = 0;

DASHBOARD_PATHS.forEach((dashboardPath) => {
  if (fs.existsSync(dashboardPath)) {
    const result = migrateDashboard(dashboardPath);
    results.push(result);

    totalFiles += result.files;
    totalMigrated += result.migratedFiles;
    totalChanges += result.totalChanges;

    console.log(`   📊 ${result.migratedFiles}/${result.files} files migrated\n`);
  } else {
    console.log(`   ⚠️ Dashboard not found: ${dashboardPath}\n`);
  }
});

// ✅ RESUMEN FINAL
console.log("📊 RESUMEN DE MIGRACIÓN:");
console.log(`🎯 Dashboards migrados: ${results.length}`);
console.log(`📄 Total archivos: ${totalFiles}`);
console.log(`✅ Archivos migrados: ${totalMigrated}`);
console.log(`🔄 Total cambios: ${totalChanges}`);

// ✅ NEXT STEPS
console.log("\n🚀 PRÓXIMOS PASOS:");
console.log("1. Ejecutar validación de herencia nuevamente");
console.log("2. Testear dashboards migrados");
console.log("3. Verificar rendimiento mejorado");

console.log("\n✅ Migración completada - ¡Listos para validación!\n");
