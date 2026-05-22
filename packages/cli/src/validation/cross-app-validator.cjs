#!/usr/bin/env node

/**
 * Cross-App Validator - VibeThink Orchestrator
 * Validates compatibility and integration between monorepo apps
 */

const fs = require("fs");
const path = require("path");

class CrossAppValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.errors = [];
    this.warnings = [];
    this.success = [];
    this.appsPath = path.join(this.projectRoot, "apps");
  }

  async validate() {
    console.log("🚀 Iniciando validación cross-app...\n");

    try {
      await this.checkAppsStructure();
      await this.checkSharedDependencies();
      await this.checkPortConflicts();
      await this.checkRouteConflicts();
      await this.checkEnvironmentCompatibility();
      await this.checkAuthIntegration();
      await this.generateReport();

      this.printResults();
      return this.errors.length === 0;
    } catch (error) {
      console.error("❌ Error durante validación:", error.message);
      return false;
    }
  }

  async checkAppsStructure() {
    console.log("🏗️ Validando estructura de apps...");

    if (!fs.existsSync(this.appsPath)) {
      this.errors.push("❌ Directorio apps/ no encontrado");
      return;
    }

    const apps = fs
      .readdirSync(this.appsPath)
      .filter((app) => fs.statSync(path.join(this.appsPath, app)).isDirectory());

    if (apps.length === 0) {
      this.warnings.push("⚠️ No se encontraron apps en el monorepo");
      return;
    }

    for (const app of apps) {
      const appPath = path.join(this.appsPath, app);
      const packageJsonPath = path.join(appPath, "package.json");

      if (fs.existsSync(packageJsonPath)) {
        this.success.push(`✅ App ${app} tiene package.json`);
        await this.validateAppStructure(app, appPath);
      } else {
        this.warnings.push(`⚠️ App ${app} sin package.json`);
      }
    }
  }

  async validateAppStructure(appName, appPath) {
    const expectedFiles = ["package.json", "next.config.js", "tsconfig.json"];

    for (const file of expectedFiles) {
      const filePath = path.join(appPath, file);
      if (fs.existsSync(filePath)) {
        this.success.push(`✅ ${appName}: ${file} presente`);
      } else {
        this.warnings.push(`⚠️ ${appName}: ${file} faltante`);
      }
    }

    // Verificar estructura de directorio app/
    const appDirPath = path.join(appPath, "app");
    if (fs.existsSync(appDirPath)) {
      this.success.push(`✅ ${appName}: Estructura app/ presente`);
    } else {
      this.warnings.push(`⚠️ ${appName}: Directorio app/ no encontrado`);
    }
  }

  async checkSharedDependencies() {
    console.log("📦 Verificando dependencias compartidas...");

    const apps = this.getApps();
    const dependencyMatrix = new Map();

    for (const app of apps) {
      const packageJsonPath = path.join(this.appsPath, app, "package.json");

      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        for (const [dep, version] of Object.entries(allDeps)) {
          if (!dependencyMatrix.has(dep)) {
            dependencyMatrix.set(dep, new Map());
          }
          dependencyMatrix.get(dep).set(app, version);
        }
      }
    }

    // Verificar inconsistencias en versiones
    for (const [dep, appVersions] of dependencyMatrix.entries()) {
      const versions = Array.from(new Set(appVersions.values()));

      if (versions.length > 1) {
        const appsWithVersions = Array.from(appVersions.entries())
          .map(([app, version]) => `${app}@${version}`)
          .join(", ");
        this.warnings.push(`⚠️ Versiones inconsistentes de ${dep}: ${appsWithVersions}`);
      } else if (appVersions.size > 1) {
        this.success.push(`✅ ${dep}: versión consistente en todas las apps`);
      }
    }
  }

  async checkPortConflicts() {
    console.log("🔌 Verificando conflictos de puertos...");

    const apps = this.getApps();
    const portMap = new Map();
    const defaultPorts = {
      "main-app": 3000,
      dashboard: 3001,
      admin: 3002,
      login: 3003,
      helpdesk: 3004,
    };

    for (const app of apps) {
      const packageJsonPath = path.join(this.appsPath, app, "package.json");

      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

        // Buscar puerto en scripts
        const devScript = packageJson.scripts?.dev || "";
        const portMatch = devScript.match(/--port\s+(\d+)/) || devScript.match(/-p\s+(\d+)/);

        if (portMatch) {
          const port = Number.parseInt(portMatch[1]);
          if (portMap.has(port)) {
            this.errors.push(`❌ Conflicto de puerto ${port}: ${app} y ${portMap.get(port)}`);
          } else {
            portMap.set(port, app);
            this.success.push(`✅ ${app}: puerto ${port} configurado`);
          }
        } else if (defaultPorts[app]) {
          const defaultPort = defaultPorts[app];
          this.warnings.push(
            `⚠️ ${app}: usando puerto por defecto ${defaultPort} - considerar configuración explícita`
          );
        } else {
          this.warnings.push(`⚠️ ${app}: puerto no configurado explícitamente`);
        }
      }
    }
  }

  async checkRouteConflicts() {
    console.log("🛣️ Verificando conflictos de rutas...");

    const apps = this.getApps();
    const routeMap = new Map();

    for (const app of apps) {
      const appDirPath = path.join(this.appsPath, app, "app");

      if (fs.existsSync(appDirPath)) {
        const routes = this.extractRoutes(appDirPath);

        for (const route of routes) {
          if (routeMap.has(route)) {
            this.warnings.push(`⚠️ Ruta duplicada '${route}': ${app} y ${routeMap.get(route)}`);
          } else {
            routeMap.set(route, app);
          }
        }

        this.success.push(`✅ ${app}: ${routes.length} rutas analizadas`);
      }
    }
  }

  extractRoutes(appDirPath) {
    const routes = [];

    const scanDirectory = (dirPath, basePath = "") => {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          const routePath = basePath + "/" + item;
          scanDirectory(itemPath, routePath);
        } else if (item === "page.tsx" || item === "page.ts") {
          routes.push(basePath || "/");
        }
      }
    };

    try {
      scanDirectory(appDirPath);
    } catch (error) {
      // Directorio no accesible
    }

    return routes;
  }

  async checkEnvironmentCompatibility() {
    console.log("🌍 Verificando compatibilidad de entornos...");

    const apps = this.getApps();
    const envRequirements = new Map();

    for (const app of apps) {
      const envExamplePath = path.join(this.appsPath, app, ".env.example");
      const envLocalPath = path.join(this.appsPath, app, ".env.local");

      if (fs.existsSync(envExamplePath)) {
        const envContent = fs.readFileSync(envExamplePath, "utf8");
        const envVars = envContent.match(/^[A-Z_]+=.*$/gm) || [];

        for (const envVar of envVars) {
          const [key] = envVar.split("=");
          if (!envRequirements.has(key)) {
            envRequirements.set(key, new Set());
          }
          envRequirements.get(key).add(app);
        }

        this.success.push(`✅ ${app}: .env.example encontrado`);
      } else {
        this.warnings.push(`⚠️ ${app}: .env.example no encontrado`);
      }

      if (fs.existsSync(envLocalPath)) {
        this.warnings.push(`⚠️ ${app}: .env.local presente - verificar que no se commite`);
      }
    }

    // Verificar variables compartidas
    const sharedVars = Array.from(envRequirements.entries()).filter(([key, apps]) => apps.size > 1);

    for (const [key, apps] of sharedVars) {
      this.success.push(`✅ Variable compartida ${key} en: ${Array.from(apps).join(", ")}`);
    }
  }

  async checkAuthIntegration() {
    console.log("🔐 Verificando integración de autenticación...");

    const apps = this.getApps();
    let authSetupCount = 0;

    for (const app of apps) {
      const appPath = path.join(this.appsPath, app);
      const hasAuthConfig = this.checkAuthConfig(appPath);

      if (hasAuthConfig) {
        authSetupCount++;
        this.success.push(`✅ ${app}: configuración de auth encontrada`);
      } else {
        this.warnings.push(`⚠️ ${app}: configuración de auth no detectada`);
      }
    }

    if (authSetupCount > 0) {
      this.success.push(`✅ ${authSetupCount} apps con configuración de autenticación`);
    }
  }

  checkAuthConfig(appPath) {
    const authPaths = [
      "middleware.ts",
      "middleware.js",
      "app/auth",
      "lib/auth.ts",
      "utils/auth.ts",
    ];

    return authPaths.some((authPath) => fs.existsSync(path.join(appPath, authPath)));
  }

  getApps() {
    if (!fs.existsSync(this.appsPath)) return [];

    return fs
      .readdirSync(this.appsPath)
      .filter((app) => fs.statSync(path.join(this.appsPath, app)).isDirectory());
  }

  async generateReport() {
    const reportPath = path.join(this.projectRoot, "docs", "reports", "quality");

    if (!fs.existsSync(reportPath)) {
      fs.mkdirSync(reportPath, { recursive: true });
    }

    const timestamp = new Date().toISOString().split("T")[0];
    const reportFile = path.join(reportPath, `${timestamp}-cross-app-validation.md`);

    const apps = this.getApps();

    const report = `# Cross-App Validation Report - ${timestamp}

## 📊 Resumen
- 🏗️ Apps analizadas: ${apps.length}
- ✅ Validaciones exitosas: ${this.success.length}
- ⚠️ Advertencias: ${this.warnings.length}  
- ❌ Errores críticos: ${this.errors.length}

## 🏗️ Apps en el Monorepo
${apps.map((app) => `- ${app}`).join("\n")}

## ✅ Validaciones Exitosas
${this.success.map((item) => `- ${item}`).join("\n")}

## ⚠️ Advertencias
${this.warnings.map((item) => `- ${item}`).join("\n")}

## ❌ Errores Críticos
${this.errors.map((item) => `- ${item}`).join("\n")}

## 🎯 Recomendaciones Cross-App

### Estructura Recomendada
\`\`\`
apps/
├── main-app/          # App principal (puerto 3000)
├── dashboard/         # Dashboard (puerto 3001)
├── admin/             # Panel admin (puerto 3002)
├── login/             # Auth app (puerto 3003)
└── helpdesk/          # Support (puerto 3004)
\`\`\`

### Configuración de Puertos
\`\`\`json
{
  "scripts": {
    "dev": "next dev --port 3001"
  }
}
\`\`\`

### Variables de Entorno Compartidas
- Crear .env.example en cada app
- Usar mismo formato para variables compartidas
- Documentar diferencias específicas por app

---
*Generado automáticamente por VibeThink Orchestrator Cross-App Validator*
`;

    fs.writeFileSync(reportFile, report);
    console.log(`📄 Reporte generado: ${reportFile}`);
  }

  printResults() {
    console.log("\n📊 Resultados de Validación Cross-App:");
    console.log(`✅ Validaciones exitosas: ${this.success.length}`);
    console.log(`⚠️ Advertencias: ${this.warnings.length}`);
    console.log(`❌ Errores críticos: ${this.errors.length}`);

    if (this.errors.length === 0) {
      console.log("\n✅ Compatibilidad cross-app validada exitosamente");
    } else {
      console.log("\n❌ Se encontraron problemas críticos de compatibilidad");
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const validator = new CrossAppValidator();
  validator
    .validate()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Error fatal:", error);
      process.exit(1);
    });
}

module.exports = CrossAppValidator;
