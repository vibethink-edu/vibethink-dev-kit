#!/usr/bin/env node

/**
 * VTHINK DASHBOARD INHERITANCE VALIDATOR
 * Verifica que todos los dashboards usen consistentemente nuestros componentes optimizados
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

console.log("🎯 VThink: Validando herencia de componentes en dashboards...\n");

// ✅ COMPONENTES OBLIGATORIOS que deben usar todos los dashboards
const REQUIRED_COMPONENTS = {
  DashboardLayout: "@/shared/components/bundui-premium/components/layout/DashboardLayout",
  Card: "@/shared/components/bundui-premium/components/ui/card",
  Button: "@/shared/components/bundui-premium/components/ui/button",
  Badge: "@/shared/components/bundui-premium/components/ui/badge",
  Avatar: "@/shared/components/bundui-premium/components/ui/avatar",
  Table: "@/shared/components/bundui-premium/components/ui/table",
};

// ✅ DASHBOARDS A VALIDAR
const DASHBOARD_PATHS = [
  "apps/dashboard/app/ai-chat-dashboard",
  "apps/dashboard/app/calendar-dashboard",
  "apps/dashboard/app/crypto-dashboard",
  "apps/dashboard/app/ecommerce-dashboard",
  "apps/dashboard/app/file-manager-dashboard",
  "apps/dashboard/app/finance-dashboard",
  "apps/dashboard/app/kanban-dashboard",
  "apps/dashboard/app/mail-dashboard",
  "apps/dashboard/app/notes-dashboard",
  "apps/dashboard/app/pos-system-dashboard",
  "apps/dashboard/app/project-management-dashboard",
  "apps/dashboard/app/sales-dashboard",
  "apps/dashboard/app/tasks-dashboard",
  "apps/dashboard/app/website-analytics-dashboard",
];

// ✅ FUNCIÓN DE VALIDACIÓN
function validateDashboard(dashboardPath) {
  const dashboardName = path.basename(dashboardPath);
  const files = glob.sync(`${dashboardPath}/**/*.{tsx,ts}`);

  if (files.length === 0) {
    return {
      name: dashboardName,
      status: "⚠️ NO FILES",
      components: {},
      score: 0,
      issues: ["No files found"],
    };
  }

  const componentUsage = {};
  const issues = [];
  let totalFiles = 0;
  let filesUsingComponents = 0;

  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");
    totalFiles++;

    let usesComponents = false;

    // Check each required component
    Object.entries(REQUIRED_COMPONENTS).forEach(([component, correctPath]) => {
      const hasCorrectImport = content.includes(`from "${correctPath}"`);
      const hasIncorrectImport = content.includes(
        `from "@/components/ui/${component.toLowerCase()}"`
      );

      if (hasCorrectImport) {
        componentUsage[component] = (componentUsage[component] || 0) + 1;
        usesComponents = true;
      } else if (hasIncorrectImport) {
        issues.push(`${path.basename(file)}: Using old import path for ${component}`);
      }
    });

    if (usesComponents) {
      filesUsingComponents++;
    }
  });

  // Calculate score
  const componentScore =
    Object.keys(componentUsage).length / Object.keys(REQUIRED_COMPONENTS).length;
  const usageScore = filesUsingComponents / Math.max(totalFiles, 1);
  const finalScore = (componentScore + usageScore) / 2;

  return {
    name: dashboardName,
    status: finalScore > 0.7 ? "✅ EXCELLENT" : finalScore > 0.4 ? "⚠️ NEEDS WORK" : "❌ CRITICAL",
    components: componentUsage,
    score: Math.round(finalScore * 100),
    issues: issues,
    files: totalFiles,
    filesWithComponents: filesUsingComponents,
  };
}

// ✅ EJECUTAR VALIDACIONES
console.log("📊 VALIDANDO DASHBOARDS...\n");

const results = [];
DASHBOARD_PATHS.forEach((dashboardPath) => {
  if (fs.existsSync(dashboardPath)) {
    const result = validateDashboard(dashboardPath);
    results.push(result);

    console.log(`${result.status} ${result.name}`);
    console.log(
      `   Score: ${result.score}% | Files: ${result.files} | Using Components: ${result.filesWithComponents}`
    );

    if (Object.keys(result.components).length > 0) {
      console.log(`   Components: ${Object.keys(result.components).join(", ")}`);
    }

    if (result.issues.length > 0 && result.issues.length <= 3) {
      result.issues.forEach((issue) => console.log(`   ⚠️ ${issue}`));
    } else if (result.issues.length > 3) {
      console.log(`   ⚠️ ${result.issues.length} issues found`);
    }

    console.log("");
  }
});

// ✅ RESUMEN GENERAL
const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
const excellentCount = results.filter((r) => r.score > 70).length;
const criticalCount = results.filter((r) => r.score < 40).length;

console.log("📊 RESUMEN GENERAL:");
console.log(`🎯 Score Promedio: ${Math.round(avgScore)}%`);
console.log(`✅ Excelentes: ${excellentCount}/${results.length}`);
console.log(`❌ Críticos: ${criticalCount}/${results.length}`);
console.log(`📱 Total Dashboards: ${results.length}`);

// ✅ RECOMENDACIONES
console.log("\n💡 RECOMENDACIONES:");
if (avgScore >= 80) {
  console.log("🚀 ¡EXCELENTE! Los dashboards tienen excelente herencia de componentes");
} else if (avgScore >= 60) {
  console.log("⚡ BUENO - Algunos dashboards necesitan actualización de imports");
} else {
  console.log("🔧 CRÍTICO - Muchos dashboards necesitan migración a componentes optimizados");
}

// ✅ GO/NO-GO DECISION
console.log("\n🎯 DECISIÓN FINAL:");
if (avgScore >= 70 && criticalCount === 0) {
  console.log("✅ GO - Los dashboards están listos para validación completa");
} else {
  console.log("⚠️ NO-GO - Se requiere optimización adicional antes de validación final");
}

console.log("\\n🚀 Validación completada\\n");
