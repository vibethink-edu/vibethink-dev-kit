#!/usr/bin/env node

/**
 * Shared Component Validator - VibeThink Orchestrator
 * Validates shared components integrity and usage across monorepo
 */

const fs = require("fs");
const path = require("path");

class SharedComponentValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.errors = [];
    this.warnings = [];
    this.success = [];
    this.sharedPath = path.join(this.projectRoot, "src", "shared");
    this.appsPath = path.join(this.projectRoot, "apps");
  }

  async validate() {
    console.log("🚀 Iniciando validación de componentes compartidos...\n");

    try {
      await this.checkSharedStructure();
      await this.checkComponentExports();
      await this.checkImportPatterns();
      await this.checkTypeDefinitions();
      await this.checkBunduiComponents();
      await this.checkCrossAppUsage();
      await this.generateReport();

      this.printResults();
      return this.errors.length === 0;
    } catch (error) {
      console.error("❌ Error durante validación:", error.message);
      return false;
    }
  }

  async checkSharedStructure() {
    console.log("🏗️ Validando estructura de src/shared...");

    if (!fs.existsSync(this.sharedPath)) {
      this.errors.push("❌ Directorio src/shared no encontrado");
      return;
    }

    const expectedDirs = ["components", "hooks", "utils", "types", "services", "lib"];

    for (const dir of expectedDirs) {
      const dirPath = path.join(this.sharedPath, dir);
      if (fs.existsSync(dirPath)) {
        this.success.push(`✅ Directorio ${dir}/ presente`);
      } else {
        this.warnings.push(`⚠️ Directorio ${dir}/ no encontrado en shared`);
      }
    }

    // Verificar estructura de components
    const componentsPath = path.join(this.sharedPath, "components");
    if (fs.existsSync(componentsPath)) {
      const expectedComponentDirs = ["ui", "bundui-premium", "dashboard"];

      for (const dir of expectedComponentDirs) {
        const dirPath = path.join(componentsPath, dir);
        if (fs.existsSync(dirPath)) {
          this.success.push(`✅ Directorio components/${dir}/ presente`);
        } else {
          this.warnings.push(`⚠️ Directorio components/${dir}/ no encontrado`);
        }
      }
    }
  }

  async checkComponentExports() {
    console.log("📦 Validando exports de componentes...");

    const componentsPath = path.join(this.sharedPath, "components");
    if (!fs.existsSync(componentsPath)) return;

    await this.checkExportsInDirectory(componentsPath, "components");

    // Verificar index files principales
    const mainIndexPath = path.join(this.sharedPath, "components", "index.ts");
    const bunduiIndexPath = path.join(this.sharedPath, "components", "bundui-premium", "index.ts");

    if (fs.existsSync(mainIndexPath)) {
      this.success.push("✅ components/index.ts presente");
    } else {
      this.warnings.push("⚠️ components/index.ts faltante - crear para mejor DX");
    }

    if (fs.existsSync(bunduiIndexPath)) {
      this.success.push("✅ bundui-premium/index.ts presente");
    } else {
      this.warnings.push("⚠️ bundui-premium/index.ts faltante");
    }
  }

  async checkExportsInDirectory(dirPath, relativePath) {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        await this.checkExportsInDirectory(itemPath, `${relativePath}/${item}`);
      } else if (item.endsWith(".tsx") || item.endsWith(".ts")) {
        const content = fs.readFileSync(itemPath, "utf8");

        // Verificar que hay exports
        if (
          content.includes("export default") ||
          content.includes("export const") ||
          content.includes("export function")
        ) {
          this.success.push(`✅ ${relativePath}/${item} tiene exports válidos`);
        } else {
          this.warnings.push(`⚠️ ${relativePath}/${item} sin exports detectados`);
        }

        // Verificar imports problemáticos
        if (content.includes("import") && content.includes("../../../")) {
          this.warnings.push(`⚠️ ${relativePath}/${item} usa imports relativos profundos`);
        }

        // Verificar uso de "use client" en componentes
        if (
          item.endsWith(".tsx") &&
          !content.includes('"use client"') &&
          !content.includes("'use client'")
        ) {
          if (
            content.includes("useState") ||
            content.includes("useEffect") ||
            content.includes("onClick")
          ) {
            this.warnings.push(`⚠️ ${relativePath}/${item} posiblemente necesita "use client"`);
          }
        }
      }
    }
  }

  async checkImportPatterns() {
    console.log("🔗 Validando patrones de importación...");

    if (!fs.existsSync(this.appsPath)) {
      this.warnings.push("⚠️ Directorio apps/ no encontrado");
      return;
    }

    const apps = fs
      .readdirSync(this.appsPath)
      .filter((app) => fs.statSync(path.join(this.appsPath, app)).isDirectory());

    for (const app of apps) {
      await this.checkAppImports(app);
    }
  }

  async checkAppImports(appName) {
    const appPath = path.join(this.appsPath, appName);
    const appFiles = this.getAllTsxFiles(appPath);

    let correctImports = 0;
    let incorrectImports = 0;

    for (const filePath of appFiles) {
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n");

      for (const line of lines) {
        if (line.trim().startsWith("import") && line.includes("shared")) {
          if (line.includes("@/shared/")) {
            correctImports++;
          } else if (line.includes("../") && line.includes("shared")) {
            incorrectImports++;
            const relativePath = path.relative(this.projectRoot, filePath);
            this.warnings.push(`⚠️ ${relativePath}: import relativo detectado - ${line.trim()}`);
          }
        }
      }
    }

    if (correctImports > 0) {
      this.success.push(`✅ ${appName}: ${correctImports} imports correctos con @/shared/`);
    }

    if (incorrectImports === 0 && correctImports > 0) {
      this.success.push(`✅ ${appName}: Todos los imports usan path aliases`);
    }
  }

  async checkTypeDefinitions() {
    console.log("📝 Validando definiciones de tipos...");

    const typesPath = path.join(this.sharedPath, "types");
    if (!fs.existsSync(typesPath)) {
      this.warnings.push("⚠️ Directorio src/shared/types no encontrado");
      return;
    }

    const typeFiles = fs
      .readdirSync(typesPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".d.ts"));

    if (typeFiles.length === 0) {
      this.warnings.push("⚠️ No se encontraron archivos de tipos en shared/types");
      return;
    }

    for (const file of typeFiles) {
      const filePath = path.join(typesPath, file);
      const content = fs.readFileSync(filePath, "utf8");

      if (content.includes("export interface") || content.includes("export type")) {
        this.success.push(`✅ ${file} contiene exports de tipos`);
      } else {
        this.warnings.push(`⚠️ ${file} sin exports de tipos detectados`);
      }
    }

    // Verificar tipos de Supabase
    const supabaseTypesPath = path.join(
      this.projectRoot,
      "src",
      "integrations",
      "supabase",
      "types.ts"
    );
    if (fs.existsSync(supabaseTypesPath)) {
      this.success.push("✅ Tipos de Supabase encontrados");
    } else {
      this.warnings.push("⚠️ Tipos de Supabase no encontrados - ejecutar supabase gen types");
    }
  }

  async checkBunduiComponents() {
    console.log("🎨 Validando componentes Bundui...");

    const bunduiPath = path.join(this.sharedPath, "components", "bundui-premium");
    if (!fs.existsSync(bunduiPath)) {
      this.warnings.push("⚠️ Directorio bundui-premium no encontrado");
      return;
    }

    const expectedBunduiDirs = ["components", "hooks", "lib"];

    for (const dir of expectedBunduiDirs) {
      const dirPath = path.join(bunduiPath, dir);
      if (fs.existsSync(dirPath)) {
        this.success.push(`✅ bundui-premium/${dir}/ presente`);
      } else {
        this.warnings.push(`⚠️ bundui-premium/${dir}/ no encontrado`);
      }
    }

    // Verificar componentes UI críticos
    const uiPath = path.join(bunduiPath, "components", "ui");
    if (fs.existsSync(uiPath)) {
      const criticalComponents = ["sidebar.tsx", "chart.tsx", "tooltip.tsx"];

      for (const component of criticalComponents) {
        const componentPath = path.join(uiPath, component);
        if (fs.existsSync(componentPath)) {
          this.success.push(`✅ Componente crítico ${component} presente`);
        } else {
          this.warnings.push(`⚠️ Componente crítico ${component} faltante`);
        }
      }
    }
  }

  async checkCrossAppUsage() {
    console.log("🔄 Verificando uso cross-app de componentes...");

    if (!fs.existsSync(this.appsPath)) return;

    const apps = fs
      .readdirSync(this.appsPath)
      .filter((app) => fs.statSync(path.join(this.appsPath, app)).isDirectory());

    const componentUsage = new Map();

    for (const app of apps) {
      const appFiles = this.getAllTsxFiles(path.join(this.appsPath, app));

      for (const filePath of appFiles) {
        const content = fs.readFileSync(filePath, "utf8");
        const imports = content.match(/import.*from ['"]@\/shared\/components\/.*['"]/g) || [];

        for (const importLine of imports) {
          const componentMatch = importLine.match(/from ['"](@\/shared\/components\/.*)['"]/);
          if (componentMatch) {
            const componentPath = componentMatch[1];
            if (!componentUsage.has(componentPath)) {
              componentUsage.set(componentPath, new Set());
            }
            componentUsage.get(componentPath).add(app);
          }
        }
      }
    }

    // Reportar uso de componentes
    for (const [component, apps] of componentUsage.entries()) {
      const appList = Array.from(apps);
      if (appList.length > 1) {
        this.success.push(`✅ ${component} usado en múltiples apps: ${appList.join(", ")}`);
      } else {
        this.warnings.push(
          `⚠️ ${component} solo usado en: ${appList[0]} - considerar si debe ser shared`
        );
      }
    }

    if (componentUsage.size === 0) {
      this.warnings.push("⚠️ No se detectó uso de componentes compartidos en apps");
    }
  }

  getAllTsxFiles(dirPath) {
    const files = [];

    if (!fs.existsSync(dirPath)) return files;

    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory() && !item.startsWith(".") && item !== "node_modules") {
        files.push(...this.getAllTsxFiles(itemPath));
      } else if (item.endsWith(".tsx") || item.endsWith(".ts")) {
        files.push(itemPath);
      }
    }

    return files;
  }

  async generateReport() {
    const reportPath = path.join(this.projectRoot, "docs", "reports", "quality");

    if (!fs.existsSync(reportPath)) {
      fs.mkdirSync(reportPath, { recursive: true });
    }

    const timestamp = new Date().toISOString().split("T")[0];
    const reportFile = path.join(reportPath, `${timestamp}-shared-components-validation.md`);

    const report = `# Shared Components Validation Report - ${timestamp}

## 📊 Resumen
- ✅ Validaciones exitosas: ${this.success.length}
- ⚠️ Advertencias: ${this.warnings.length}  
- ❌ Errores críticos: ${this.errors.length}

## ✅ Validaciones Exitosas
${this.success.map((item) => `- ${item}`).join("\n")}

## ⚠️ Advertencias
${this.warnings.map((item) => `- ${item}`).join("\n")}

## ❌ Errores Críticos
${this.errors.map((item) => `- ${item}`).join("\n")}

## 🎯 Recomendaciones VibeThink Orchestrator

### Estructura Óptima
\`\`\`
src/shared/
├── components/
│   ├── ui/                    # Componentes base
│   ├── bundui-premium/        # Componentes Bundui mejorados
│   ├── dashboard/             # Componentes específicos dashboard
│   └── index.ts              # Exports centralizados
├── hooks/                     # Custom hooks compartidos
├── utils/                     # Utilidades compartidas
├── types/                     # Definiciones de tipos
├── services/                  # Servicios compartidos
└── lib/                       # Librerías y configuraciones
\`\`\`

### Patrones de Import Recomendados
\`\`\`typescript
// ✅ CORRECTO: Usar path aliases
import { Component } from '@/shared/components/ui/component';
import { useCustomHook } from '@/shared/hooks/useCustomHook';

// ❌ INCORRECTO: Imports relativos
import { Component } from '../../../shared/components/ui/component';
\`\`\`

### Mejores Prácticas
- Usar "use client" en componentes que requieren interactividad
- Mantener exports centralizados en index.ts
- Tipos compartidos en src/shared/types/
- Componentes reutilizables solo en shared/

---
*Generado automáticamente por VibeThink Orchestrator Shared Component Validator*
`;

    fs.writeFileSync(reportFile, report);
    console.log(`📄 Reporte generado: ${reportFile}`);
  }

  printResults() {
    console.log("\n📊 Resultados de Validación:");
    console.log(`✅ Validaciones exitosas: ${this.success.length}`);
    console.log(`⚠️ Advertencias: ${this.warnings.length}`);
    console.log(`❌ Errores críticos: ${this.errors.length}`);

    if (this.errors.length === 0) {
      console.log("\n✅ Componentes compartidos validados exitosamente");
    } else {
      console.log("\n❌ Se encontraron problemas críticos en componentes compartidos");
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const validator = new SharedComponentValidator();
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

module.exports = SharedComponentValidator;
