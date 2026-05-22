#!/usr/bin/env node

/**
 * 🎯 VThink 1.0 - Verificador de Rutas de Dashboard
 *
 * Script para verificar que todas las rutas del DashboardNavigator
 * estén correctamente configuradas y funcionen.
 */

const fs = require("fs");
const path = require("path");

// Colores para console
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️ ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}🎯 ${msg}${colors.reset}\n`),
};

// Rutas que deben existir según el DashboardNavigator
const expectedRoutes = [
  // Production Dashboards
  { path: "/admin/dashboard-default", component: "DefaultDashboard", category: "Production" },
  { path: "/admin/dashboard-ecommerce", component: "EcommerceDashboard", category: "Production" },
  { path: "/admin/dashboard-analytics", component: "AnalyticsDashboard", category: "Production" },
  { path: "/admin/dashboard-crm", component: "CRMDashboard", category: "Production" },
  { path: "/admin/dashboard-finance", component: "FinanceDashboard", category: "Production" },
  { path: "/admin/dashboard-marketing", component: "MarketingDashboard", category: "Production" },
  { path: "/admin/company-dashboard", component: "CompanyDashboard", category: "Production" },
  { path: "/admin/super-admin", component: "SuperAdminDashboard", category: "Production" },

  // Testing & Premium
  { path: "/admin/premium-test", component: "BunduiPremiumDashboard", category: "Premium" },
  {
    path: "/admin/premium-test-enhanced",
    component: "PremiumTestPageEnhanced",
    category: "Premium",
  },
  { path: "/admin/premium-dashboard", component: "BunduiPremiumDashboard", category: "Premium" },

  // Development Tools
  { path: "/admin/test", component: "TestDashboard", category: "Development" },
  { path: "/admin/basic-test", component: "BasicTest", category: "Development" },
  { path: "/admin/test-explorer", component: "TestBunduiExplorer", category: "Development" },
  { path: "/admin/explorer", component: "EmergencyTest", category: "Development" },
  { path: "/admin/navigator", component: "DashboardNavigator", category: "Development" },
  { path: "/admin/dashboards", component: "DashboardVariationsPage", category: "Development" },
];

function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function checkComponentExists(componentName) {
  const componentPath = path.join(
    __dirname,
    "..",
    "src",
    "apps",
    "admin",
    "components",
    `${componentName}.tsx`
  );
  return {
    exists: checkFileExists(componentPath),
    path: componentPath,
  };
}

function checkRouteInAdminRouter(routePath) {
  const adminRouterPath = path.join(__dirname, "..", "src", "apps", "admin", "AdminRouter.tsx");

  if (!checkFileExists(adminRouterPath)) {
    return { found: false, reason: "AdminRouter.tsx no encontrado" };
  }

  try {
    const content = fs.readFileSync(adminRouterPath, "utf8");

    // Buscar la ruta en el contenido
    const routePattern = new RegExp(`path="([^"]*${routePath.replace("/admin", "")}[^"]*)"`, "g");
    const matches = content.match(routePattern);

    return {
      found: matches && matches.length > 0,
      matches: matches || [],
      reason: matches ? "Ruta encontrada" : "Ruta no encontrada en AdminRouter",
    };
  } catch (error) {
    return { found: false, reason: `Error leyendo AdminRouter: ${error.message}` };
  }
}

async function verifyDashboardRoutes() {
  log.header("VERIFICACIÓN DE RUTAS DEL DASHBOARD NAVIGATOR");

  const totalRoutes = expectedRoutes.length;
  let validRoutes = 0;
  let validComponents = 0;
  let routesInRouter = 0;

  const results = {
    production: { total: 0, valid: 0, invalid: [] },
    premium: { total: 0, valid: 0, invalid: [] },
    development: { total: 0, valid: 0, invalid: [] },
  };

  console.log(`📋 Verificando ${totalRoutes} rutas...\n`);

  for (const route of expectedRoutes) {
    const category = route.category.toLowerCase();
    results[category].total++;

    console.log(`\n🔍 Verificando: ${route.path}`);
    console.log(`   📁 Componente: ${route.component}`);
    console.log(`   🏷️ Categoría: ${route.category}`);

    // 1. Verificar que el componente existe
    const componentCheck = checkComponentExists(route.component);
    if (componentCheck.exists) {
      log.success(`   Componente existe: ${componentCheck.path}`);
      validComponents++;
    } else {
      log.error(`   Componente NO existe: ${componentCheck.path}`);
      results[category].invalid.push(`${route.path} - Componente faltante`);
      continue;
    }

    // 2. Verificar que la ruta está en AdminRouter
    const routeCheck = checkRouteInAdminRouter(route.path);
    if (routeCheck.found) {
      log.success(`   Ruta configurada en AdminRouter`);
      routesInRouter++;
    } else {
      log.error(`   Ruta NO configurada en AdminRouter: ${routeCheck.reason}`);
      results[category].invalid.push(`${route.path} - Ruta no configurada`);
      continue;
    }

    // Si llegamos aquí, la ruta es válida
    validRoutes++;
    results[category].valid++;
    log.success(`   ✅ Ruta completamente válida`);
  }

  // Resumen por categoría
  log.header("RESUMEN POR CATEGORÍA");

  Object.keys(results).forEach((category) => {
    const data = results[category];
    const percentage = data.total > 0 ? Math.round((data.valid / data.total) * 100) : 0;

    console.log(`\n📊 ${category.toUpperCase()}:`);
    console.log(`   Total: ${data.total}`);
    console.log(`   Válidas: ${data.valid}`);
    console.log(`   Porcentaje: ${percentage}%`);

    if (data.invalid.length > 0) {
      console.log(`   ❌ Problemas:`);
      data.invalid.forEach((issue) => console.log(`      - ${issue}`));
    }
  });

  // Resumen final
  log.header("RESUMEN FINAL");

  const routePercentage = Math.round((validRoutes / totalRoutes) * 100);
  const componentPercentage = Math.round((validComponents / totalRoutes) * 100);
  const routerPercentage = Math.round((routesInRouter / totalRoutes) * 100);

  console.log(`📊 Estadísticas Generales:`);
  console.log(
    `   🎯 Rutas totalmente válidas: ${validRoutes}/${totalRoutes} (${routePercentage}%)`
  );
  console.log(
    `   📁 Componentes existentes: ${validComponents}/${totalRoutes} (${componentPercentage}%)`
  );
  console.log(
    `   🔗 Rutas en AdminRouter: ${routesInRouter}/${totalRoutes} (${routerPercentage}%)`
  );

  if (validRoutes === totalRoutes) {
    log.success(`\n🎉 ¡PERFECTO! Todas las rutas están configuradas correctamente.`);
    console.log(`\n🚀 URLs de prueba disponibles:`);
    expectedRoutes.forEach((route) => {
      console.log(`   http://localhost:8080${route.path}`);
    });
  } else {
    log.warning(`\n⚠️ Hay ${totalRoutes - validRoutes} rutas con problemas que necesitan atención.`);
  }

  return {
    success: validRoutes === totalRoutes,
    validRoutes,
    totalRoutes,
    validComponents,
    routesInRouter,
    results,
  };
}

// Ejecutar verificación
if (require.main === module) {
  verifyDashboardRoutes()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      log.error(`Error en verificación: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { verifyDashboardRoutes, expectedRoutes };
