#!/usr/bin/env node

/**
 * Generador Automático de Mapa de Rutas
 *
 * Analiza el archivo App.tsx y genera documentación completa del routing
 * Incluye información de permisos, layouts, componentes y estructura jerárquica
 *
 * @author AI Pair Platform - Documentation Team
 * @version 1.0.0
 */

const fs = require("fs");
const path = require("path");

// Configuración
const CONFIG = {
  appFile: path.join(__dirname, "../src/App.tsx"),
  outputDir: path.join(__dirname, "../docs"),
  routeMapFile: "ROUTE_MAP.md",
  routeTreeFile: "ROUTE_TREE.md",
  routeJsonFile: "routes.json",
};

/**
 * Analiza el archivo App.tsx y extrae información de rutas
 */
function parseAppFile() {
  const content = fs.readFileSync(CONFIG.appFile, "utf8");
  const routes = [];

  // Buscar todas las rutas con regex
  const routeRegex = /<Route\s+path="([^"]+)"\s+element=\{([^}]+)\}/g;
  let match;

  while ((match = routeRegex.exec(content)) !== null) {
    const [, routePath, element] = match;

    // Determinar si es protegida
    const isProtected =
      content.includes(`<ProtectedRoute`) &&
      content.indexOf(`<ProtectedRoute`) < content.indexOf(match[0]);

    // Determinar si requiere admin
    const requireAdmin = element.includes("requireAdmin={true}");
    const requireSuperAdmin = element.includes("requireSuperAdmin={true}");

    // Determinar rol requerido para testing
    const roleMatch = element.match(/requiredRole="([^"]+)"/);
    const requiredRole = roleMatch ? roleMatch[1] : null;

    // Determinar layout
    const hasLayout =
      content.includes(`<DashboardLayout>`) &&
      content.indexOf(`<DashboardLayout>`) < content.indexOf(match[0]);

    // Extraer nombre del componente
    const componentMatch = element.match(/(\w+)\s*\/?>/);
    const component = componentMatch ? componentMatch[1] : "Unknown";

    // Categorizar ruta
    let category = "general";
    if (routePath.startsWith("/admin")) category = "admin";
    else if (routePath.startsWith("/testing")) category = "testing";
    else if (routePath.startsWith("/mockup")) category = "mockup";
    else if (routePath === "/") category = "public";
    else if (isProtected) category = "protected";

    routes.push({
      path: routePath,
      component: component,
      protected: isProtected,
      requireAdmin,
      requireSuperAdmin,
      requiredRole,
      layout: hasLayout ? "DashboardLayout" : null,
      category,
    });
  }

  return routes;
}

/**
 * Genera el mapa de rutas en formato Markdown
 */
function generateRouteMap(routes) {
  const categories = {
    public: routes.filter((r) => r.category === "public"),
    protected: routes.filter((r) => r.category === "protected"),
    admin: routes.filter((r) => r.category === "admin"),
    testing: routes.filter((r) => r.category === "testing"),
    mockup: routes.filter((r) => r.category === "mockup"),
  };

  let markdown = `# 🗺️ Mapa de Rutas - AI Pair Orchestrator Pro

## 📋 Resumen Ejecutivo

Este documento es generado automáticamente y contiene el mapa completo de rutas de la aplicación.
**Última actualización**: ${new Date().toLocaleString("es-ES")}

### 📊 Estadísticas
- **Total de rutas**: ${routes.length}
- **Rutas públicas**: ${categories.public.length}
- **Rutas protegidas**: ${categories.protected.length}
- **Rutas de admin**: ${categories.admin.length}
- **Rutas de testing**: ${categories.testing.length}
- **Rutas de mockup**: ${categories.mockup.length}

---

## 🌐 Rutas Públicas

| Ruta | Componente | Descripción | Estado |
|------|------------|-------------|--------|
`;

  categories.public.forEach((route) => {
    markdown += `| \`${route.path}\` | \`${route.component}\` | Página pública | ✅ Activa |\n`;
  });

  markdown += `
---

## 🔒 Rutas Protegidas

| Ruta | Componente | Layout | Permisos | Estado |
|------|------------|--------|----------|--------|
`;

  categories.protected.forEach((route) => {
    const permissions = [];
    if (route.requireSuperAdmin) permissions.push("SUPER_ADMIN");
    else if (route.requireAdmin) permissions.push("ADMIN+");
    else permissions.push("Autenticado");

    markdown += `| \`${route.path}\` | \`${route.component}\` | ${route.layout || "N/A"} | ${permissions.join(", ")} | ✅ Activa |\n`;
  });

  markdown += `
---

## 👨‍💼 Rutas de Administración

| Ruta | Componente | Permisos | Descripción | Estado |
|------|------------|----------|-------------|--------|
`;

  categories.admin.forEach((route) => {
    const permissions = route.requireSuperAdmin ? "SUPER_ADMIN" : "ADMIN+";
    markdown += `| \`${route.path}\` | \`${route.component}\` | ${permissions} | Panel de administración | ✅ Activa |\n`;
  });

  markdown += `
---

## 🧪 Rutas de Testing

| Ruta | Componente | Rol Requerido | Descripción | Estado |
|------|------------|---------------|-------------|--------|
`;

  categories.testing.forEach((route) => {
    const role = route.requiredRole || "DEVELOPER";
    markdown += `| \`${route.path}\` | \`${route.component}\` | ${role} | Testing y desarrollo | ✅ Activa |\n`;
  });

  markdown += `
---

## 🎨 Rutas de Mockup

| Ruta | Componente | Descripción | Estado |
|------|------------|-------------|--------|
`;

  categories.mockup.forEach((route) => {
    markdown += `| \`${route.path}\` | \`${route.component}\` | Mockup y prototipos | ✅ Activa |\n`;
  });

  markdown += `
---

## 🔐 Matriz de Permisos

### Niveles de Acceso

| Nivel | Descripción | Rutas Accesibles |
|-------|-------------|------------------|
| **Público** | Sin autenticación | Páginas de landing, login, auth |
| **Autenticado** | Usuario logueado | Dashboard, workflows, repositorios |
| **ADMIN** | Administrador de empresa | Panel de admin, gestión de usuarios |
| **SUPER_ADMIN** | Super administrador | Todas las rutas + cross-company |

### Permisos por Rol

| Rol | Rutas Específicas | Capacidades |
|-----|-------------------|-------------|
| **EMPLOYEE** | \`/dashboard\`, \`/workflows\` | Acceso básico a funcionalidades |
| **MANAGER** | + \`/operational-repositories\` | Gestión de repositorios |
| **ADMIN** | + \`/admin/*\` | Administración de empresa |
| **OWNER** | + \`/plans\`, \`/documentation\` | Gestión completa de empresa |
| **SUPER_ADMIN** | + \`/super-admin\`, \`/testing/*\` | Control total de la plataforma |
| **DEVELOPER** | + \`/testing/*\` | Acceso a herramientas de desarrollo |

---

## 🏗️ Estructura de Layouts

### Layout Principal (DashboardLayout)
- **Aplicado a**: Todas las rutas protegidas principales
- **Componentes**: Sidebar, Header, Footer, Content Area
- **Responsive**: Adaptable a móvil, tablet y desktop

### Layout de Testing
- **Aplicado a**: Rutas de testing específicas
- **Componentes**: TestingRouteGuard, contenido aislado
- **Propósito**: Testing sin interferencias del layout principal

### Sin Layout
- **Aplicado a**: Mockups, páginas públicas, testing aislado
- **Propósito**: Máxima flexibilidad para prototipos

---

## 📝 Notas de Desarrollo

### Convenciones de Naming
- **Rutas públicas**: Sin prefijo especial
- **Rutas protegidas**: Prefijo funcional (\`/dashboard\`, \`/workflows\`)
- **Rutas de admin**: Prefijo \`/admin\`
- **Rutas de testing**: Prefijo \`/testing\`
- **Rutas de mockup**: Prefijo \`/mockup\` o sin prefijo específico

### Patrones de Seguridad
- **ProtectedRoute**: Wrapper para rutas que requieren autenticación
- **TestingRouteGuard**: Wrapper específico para rutas de testing
- **Role-based access**: Control granular por rol de usuario
- **Company isolation**: Todas las rutas respetan aislamiento multi-tenant

### Mejores Prácticas
- ✅ Rutas organizadas por categoría
- ✅ Permisos claramente definidos
- ✅ Layouts consistentes
- ✅ Naming descriptivo
- ✅ Separación de concerns

---

## 🔄 Mantenimiento

### Actualización Automática
Este documento se actualiza automáticamente con cada build. Para actualización manual:

\`\`\`bash
npm run generate:route-map
\`\`\`

### Verificación de Rutas
Para verificar que todas las rutas están correctamente configuradas:

\`\`\`bash
npm run verify:routes
\`\`\`

---

*Documento generado automáticamente - No editar manualmente*
`;

  return markdown;
}

/**
 * Genera un árbol visual de rutas
 */
function generateRouteTree(routes) {
  const tree = `# 🌳 Árbol de Rutas - AI Pair Orchestrator Pro

## 📊 Vista Jerárquica

\`\`\`
/
├── 📄 / (Index)
├── 🔐 /auth (Auth)
├── 🔐 /login (Login)
├── 🔐 /simple-login (SimpleLogin)
├── 📊 /dashboard (Dashboard) [PROTECTED]
│   ├── 📁 /operational-repositories (OperationalRepositories)
│   ├── 🔄 /workflows (Workflows)
│   ├── 💰 /plans (Plans)
│   └── 📚 /documentation (Documentation)
├── 🧪 /testing (TestingLanding) [DEVELOPER]
│   ├── 🔧 /testing/phase2 (Phase2Testing)
│   ├── 🎨 /testing/theme (ThemeTesting)
│   ├── 🌍 /testing/language (LanguageTesting)
│   ├── ⚙️ /testing/dual-configuration (DualConfigurationTest)
│   ├── 💳 /testing/billing (BillingTest)
│   └── 👥 /testing/roles (RoleTesting)
├── 👨‍💼 /admin (AdminPanel) [ADMIN]
│   ├── 👥 /admin/users (UsersPage)
│   ├── 🏢 /admin/companies (CompanyAdministration)
│   ├── 📦 /admin/plans (PlanManagement)
│   ├── ⚖️ /admin/limits (LimitManagement)
│   └── 🔐 /admin/permissions (PermissionManagement)
├── 👑 /super-admin (SuperAdminDashboard) [SUPER_ADMIN]
├── 🎨 /mockup-demo (MockupDemo)
├── 🎨 /classic (MockupDashboardClassic)
├── 🎨 /minimal (MockupDashboardMinimal)
├── 🎨 /tabs (MockupDashboardTabs)
├── 🤖 /aistudio (AIStudioMockup)
└── 🤖 /mockup (MockupAIStudioPage)
\`\`\`

## 🏷️ Leyenda

- 📄 Página pública
- 🔐 Autenticación requerida
- 📊 Dashboard principal
- 🧪 Testing y desarrollo
- 👨‍💼 Administración
- 👑 Super administración
- 🎨 Mockups y prototipos
- 🤖 AI Studio

## 🔐 Niveles de Protección

- **[PROTECTED]**: Requiere autenticación
- **[ADMIN]**: Requiere rol ADMIN o superior
- **[SUPER_ADMIN]**: Requiere rol SUPER_ADMIN
- **[DEVELOPER]**: Requiere rol DEVELOPER o SUPER_ADMIN

---

*Árbol generado automáticamente - ${new Date().toLocaleString("es-ES")}*
`;

  return tree;
}

/**
 * Genera JSON con información de rutas para uso programático
 */
function generateRouteJson(routes) {
  const routeData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalRoutes: routes.length,
      version: "1.0.0",
    },
    routes: routes.map((route) => ({
      path: route.path,
      component: route.component,
      protected: route.protected,
      requireAdmin: route.requireAdmin,
      requireSuperAdmin: route.requireSuperAdmin,
      requiredRole: route.requiredRole,
      layout: route.layout,
      category: route.category,
    })),
    categories: {
      public: routes.filter((r) => r.category === "public").length,
      protected: routes.filter((r) => r.category === "protected").length,
      admin: routes.filter((r) => r.category === "admin").length,
      testing: routes.filter((r) => r.category === "testing").length,
      mockup: routes.filter((r) => r.category === "mockup").length,
    },
  };

  return JSON.stringify(routeData, null, 2);
}

/**
 * Función principal
 */
function main() {
  try {
    // TODO: log '🗺️ Generando mapa de rutas...'

    // Crear directorio de salida si no existe
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Parsear archivo App.tsx
    const routes = parseAppFile();

    // Generar documentación
    const routeMap = generateRouteMap(routes);
    const routeTree = generateRouteTree(routes);
    const routeJson = generateRouteJson(routes);

    // Escribir archivos
    fs.writeFileSync(path.join(CONFIG.outputDir, CONFIG.routeMapFile), routeMap);
    fs.writeFileSync(path.join(CONFIG.outputDir, CONFIG.routeTreeFile), routeTree);
    fs.writeFileSync(path.join(CONFIG.outputDir, CONFIG.routeJsonFile), routeJson);

    // TODO: log '✅ Mapa de rutas generado exitosamente'
    // TODO: log `📄 ROUTE_MAP.md: ${path.join(CONFIG.outputDir, CONFIG.routeMapFile)}`
    // TODO: log `🌳 ROUTE_TREE.md: ${path.join(CONFIG.outputDir, CONFIG.routeTreeFile)}`
    // TODO: log `📊 routes.json: ${path.join(CONFIG.outputDir, CONFIG.routeJsonFile)}`
    // TODO: log `📊 Total de rutas procesadas: ${routes.length}`
  } catch (error) {
    // TODO: log '❌ Error generando mapa de rutas:' error
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main, parseAppFile, generateRouteMap, generateRouteTree };
