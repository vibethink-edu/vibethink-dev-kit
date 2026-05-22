#!/usr/bin/env node

/**
 * Dependency Validator - VibeThink Orchestrator
 * Validates dependency compatibility and security across monorepo
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class DependencyValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.errors = [];
    this.warnings = [];
    this.success = [];
  }

  async validate() {
    console.log("🚀 Iniciando validación de dependencias...\n");

    try {
      await this.checkExactVersions();
      await this.checkRootDependencies();
      await this.checkWorkspaceDependencies();
      await this.checkVersionConflicts();
      await this.checkSecurityVulnerabilities();
      await this.checkPeerDependencies();
      await this.generateReport();

      this.printResults();
      return this.errors.length === 0;
    } catch (error) {
      console.error("❌ Error durante validación:", error.message);
      return false;
    }
  }

  async checkExactVersions() {
    console.log("🎯 Validando versiones exactas (sin ^ o ~)...");

    const packageFiles = [
      path.join(this.projectRoot, "package.json"),
      ...this.getWorkspacePackageFiles(),
    ];

    for (const packageFile of packageFiles) {
      if (!fs.existsSync(packageFile)) continue;

      const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
      const relativePath = path.relative(this.projectRoot, packageFile);

      // Verificar dependencies
      this.checkVersionsInSection(packageJson.dependencies, "dependencies", relativePath);
      this.checkVersionsInSection(packageJson.devDependencies, "devDependencies", relativePath);
      this.checkVersionsInSection(packageJson.peerDependencies, "peerDependencies", relativePath);
    }
  }

  checkVersionsInSection(deps, section, filePath) {
    if (!deps) return;

    // Determinar tipo de app por el path
    const appType = this.getAppType(filePath);

    for (const [name, version] of Object.entries(deps)) {
      const hasCaretOrTilde =
        version.startsWith("^") || version.startsWith("~") || version.includes(" ");

      if (hasCaretOrTilde) {
        if (appType === "core") {
          // Apps core: versiones exactas obligatorias
          this.errors.push(
            `❌ ${filePath} ${section}["${name}"]: "${version}" - Core app DEBE usar versión exacta sin ^ o ~`
          );
        } else if (appType === "marketing") {
          // Apps marketing: caret permitido para patches/minor
          if (version.startsWith("^")) {
            this.success.push(
              `✅ ${filePath} ${section}["${name}"]: ${version} (marketing app - caret permitido)`
            );
          } else {
            this.warnings.push(
              `⚠️ ${filePath} ${section}["${name}"]: "${version}" - Preferir ^ sobre ~ en marketing apps`
            );
          }
        } else if (appType === "reference") {
          // Apps de referencia: mantener versiones originales según reglas documentadas
          this.success.push(
            `✅ ${filePath} ${section}["${name}"]: ${version} (reference app - mantiene versiones originales)`
          );
        }
      } else if (!/^\d+\.\d+\.\d+(-.*)?$/.test(version)) {
        this.warnings.push(
          `⚠️ ${filePath} ${section}["${name}"]: "${version}" - Formato de versión inusual`
        );
      } else {
        this.success.push(`✅ ${filePath} ${section}["${name}"]: ${version}`);
      }
    }
  }

  getAppType(filePath) {
    // Clasificar apps por criticidad
    const coreApps = ["dashboard", "admin", "login", "helpdesk", "main-app"];
    const marketingApps = ["website"];
    const referenceApps = ["bundui-reference"]; // Apps con excepciones documentadas

    const appName = filePath
      .split(/[\\/]/)
      .find(
        (segment) =>
          coreApps.includes(segment) ||
          marketingApps.includes(segment) ||
          referenceApps.includes(segment)
      );

    if (coreApps.includes(appName)) {
      return "core";
    } else if (marketingApps.includes(appName)) {
      return "marketing";
    } else if (referenceApps.includes(appName)) {
      return "reference"; // Apps de referencia usan sus propias versiones originales
    } else {
      // Root package.json y otros: core por defecto
      return "core";
    }
  }

  getWorkspacePackageFiles() {
    const files = [];
    const appsDir = path.join(this.projectRoot, "apps");

    if (fs.existsSync(appsDir)) {
      const apps = fs
        .readdirSync(appsDir)
        .filter((app) => fs.statSync(path.join(appsDir, app)).isDirectory());

      for (const app of apps) {
        const packageFile = path.join(appsDir, app, "package.json");
        if (fs.existsSync(packageFile)) {
          files.push(packageFile);
        }
      }
    }

    return files;
  }

  async checkRootDependencies() {
    console.log("📦 Validando dependencias raíz...");

    const packageJsonPath = path.join(this.projectRoot, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      this.errors.push("❌ package.json no encontrado en raíz");
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    // Verificar dependencias críticas para VibeThink Orchestrator
    // IMPORTANTE: Solo versiones exactas según reglas consolidadas
    const criticalDeps = {
      react: "18.3.1", // React 18.3.1 ES el estándar actual estable
      next: "15.3.4", // Next.js 15.3.4 estable
      typescript: "5.9.2", // TypeScript 5.9.2 última estable
      "@supabase/supabase-js": "2.53.0", // Supabase actualizada
      tailwindcss: "4.1.11", // TailwindCSS v4 usado en el proyecto
    };

    // Excepciones por app específica
    const appExceptions = {
      website: {
        react: ["18.3.1", "19.0.0"], // Website puede usar React 19
        "react-dom": ["18.3.1", "19.0.0"],
      },
    };

    for (const [dep, expectedVersion] of Object.entries(criticalDeps)) {
      const currentVersion = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];

      if (!currentVersion) {
        this.errors.push(`❌ Dependencia crítica faltante: ${dep}`);
      } else if (!this.isVersionCompatible(currentVersion, expectedVersion)) {
        this.warnings.push(`⚠️ Versión de ${dep}: ${currentVersion}, esperada: ${expectedVersion}`);
      } else {
        this.success.push(`✅ ${dep}: ${currentVersion}`);
      }
    }
  }

  async checkWorkspaceDependencies() {
    console.log("🏗️ Validando dependencias de workspaces...");

    const appsDir = path.join(this.projectRoot, "apps");
    if (!fs.existsSync(appsDir)) {
      this.warnings.push("⚠️ Directorio apps/ no encontrado");
      return;
    }

    const apps = fs
      .readdirSync(appsDir)
      .filter((app) => fs.statSync(path.join(appsDir, app)).isDirectory());

    for (const app of apps) {
      const appPackageJson = path.join(appsDir, app, "package.json");

      if (fs.existsSync(appPackageJson)) {
        const appPackage = JSON.parse(fs.readFileSync(appPackageJson, "utf8"));

        // Verificar que usan las mismas versiones que el root para dependencias compartidas
        const sharedDeps = ["react", "next", "typescript", "@supabase/supabase-js"];

        for (const dep of sharedDeps) {
          const appVersion = appPackage.dependencies?.[dep] || appPackage.devDependencies?.[dep];
          if (appVersion) {
            this.warnings.push(`⚠️ ${app} tiene dependencia duplicada: ${dep}@${appVersion}`);
          }
        }

        this.success.push(`✅ Workspace ${app} validado`);
      }
    }
  }

  async checkVersionConflicts() {
    console.log("🔍 Buscando conflictos de versiones...");

    try {
      // Ejecutar npm ls para detectar conflictos
      const lsOutput = execSync("npm ls --depth=0 --json", {
        encoding: "utf8",
        stdio: "pipe",
      });

      const lsData = JSON.parse(lsOutput);

      if (lsData.problems && lsData.problems.length > 0) {
        lsData.problems.forEach((problem) => {
          if (problem.includes("ERESOLVE") || problem.includes("conflict")) {
            this.errors.push(`❌ Conflicto de dependencias: ${problem}`);
          } else {
            this.warnings.push(`⚠️ Problema de dependencia: ${problem}`);
          }
        });
      } else {
        this.success.push("✅ No se detectaron conflictos de versiones");
      }
    } catch (error) {
      // npm ls puede fallar pero aún dar información útil
      if (error.stdout) {
        try {
          const lsData = JSON.parse(error.stdout);
          if (lsData.problems) {
            lsData.problems.forEach((problem) => {
              this.warnings.push(`⚠️ ${problem}`);
            });
          }
        } catch (parseError) {
          this.warnings.push("⚠️ No se pudo verificar conflictos de versiones completamente");
        }
      }
    }
  }

  async checkSecurityVulnerabilities() {
    console.log("🛡️ Verificando vulnerabilidades de seguridad...");

    try {
      const auditOutput = execSync("npm audit --audit-level=moderate --json", {
        encoding: "utf8",
        stdio: "pipe",
      });

      const auditData = JSON.parse(auditOutput);

      if (auditData.metadata.vulnerabilities.total > 0) {
        const { high, critical, moderate } = auditData.metadata.vulnerabilities;

        if (critical > 0) {
          this.errors.push(`❌ ${critical} vulnerabilidades críticas encontradas`);
        }
        if (high > 0) {
          this.errors.push(`❌ ${high} vulnerabilidades altas encontradas`);
        }
        if (moderate > 0) {
          this.warnings.push(`⚠️ ${moderate} vulnerabilidades moderadas encontradas`);
        }
      } else {
        this.success.push("✅ No se encontraron vulnerabilidades de seguridad");
      }
    } catch (error) {
      if (error.status === 0) {
        this.success.push("✅ No se encontraron vulnerabilidades de seguridad");
      } else {
        this.warnings.push("⚠️ No se pudo completar audit de seguridad");
      }
    }
  }

  async checkPeerDependencies() {
    console.log("🔗 Verificando peer dependencies...");

    const packageJsonPath = path.join(this.projectRoot, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    // Verificar peer dependencies críticas para React 19 y Next.js 15
    const expectedPeers = {
      "react-dom": packageJson.dependencies?.["react"],
      "@types/react-dom": packageJson.devDependencies?.["@types/react"],
    };

    Object.entries(expectedPeers).forEach(([peer, expectedVersion]) => {
      const installedVersion =
        packageJson.dependencies?.[peer] || packageJson.devDependencies?.[peer];

      if (!installedVersion && expectedVersion) {
        this.warnings.push(`⚠️ Peer dependency recomendada: ${peer}@${expectedVersion}`);
      } else if (installedVersion) {
        this.success.push(`✅ Peer dependency ${peer}: ${installedVersion}`);
      }
    });
  }

  async generateReport() {
    const reportPath = path.join(this.projectRoot, "docs", "reports", "quality");

    if (!fs.existsSync(reportPath)) {
      fs.mkdirSync(reportPath, { recursive: true });
    }

    const timestamp = new Date().toISOString().split("T")[0];
    const reportFile = path.join(reportPath, `${timestamp}-dependency-validation.md`);

    const report = `# Dependency Validation Report - ${timestamp}

## 📊 Resumen
- ✅ Exitosos: ${this.success.length}
- ⚠️ Advertencias: ${this.warnings.length}  
- ❌ Errores: ${this.errors.length}

## ✅ Validaciones Exitosas
${this.success.map((item) => `- ${item}`).join("\n")}

## ⚠️ Advertencias
${this.warnings.map((item) => `- ${item}`).join("\n")}

## ❌ Errores Críticos
${this.errors.map((item) => `- ${item}`).join("\n")}

## 🎯 Recomendaciones
${
  this.errors.length === 0
    ? "- ✅ Todas las dependencias están en estado óptimo"
    : "- 🔧 Resolver errores críticos antes de deployment\n- 📚 Revisar documentación de dependencias\n- 🔄 Ejecutar npm install para resolver conflictos"
}

---
*Generado automáticamente por VibeThink Orchestrator Dependency Validator*
`;

    fs.writeFileSync(reportFile, report);
    console.log(`📄 Reporte generado: ${reportFile}`);
  }

  isVersionCompatible(current, expected) {
    // Simplificado: verifica si las versiones major coinciden
    const currentMajor = current.match(/\d+/)?.[0];
    const expectedMajor = expected.match(/\d+/)?.[0];
    return currentMajor === expectedMajor;
  }

  printResults() {
    console.log("\n📊 Resultados de Validación:");
    console.log(`✅ Exitosos: ${this.success.length}`);
    console.log(`⚠️ Advertencias: ${this.warnings.length}`);
    console.log(`❌ Errores: ${this.errors.length}`);

    if (this.errors.length === 0) {
      console.log("\n✅ Validación de dependencias exitosa");
    } else {
      console.log("\n❌ Validación falló - revisar errores críticos");
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const validator = new DependencyValidator();
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

module.exports = DependencyValidator;
