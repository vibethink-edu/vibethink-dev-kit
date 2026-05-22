#!/usr/bin/env node

/**
 * 🚚 Bundui Component Migrator
 * Safely migrates components from bundui-reference to dashboard
 *
 * Run: npm run migrate:from-bundui [component-name]
 */

const fs = require("fs");
const path = require("path");

class BunduiComponentMigrator {
  constructor(componentName) {
    this.componentName = componentName;
    this.referenceRoot = path.join(process.cwd(), "apps/bundui-reference");
    this.dashboardRoot = path.join(process.cwd(), "apps/dashboard");
    this.actions = [];
    this.warnings = [];
    this.errors = [];
  }

  /**
   * Main migration entry point
   */
  async migrate() {
    console.log(`🚚 Bundui Component Migrator\n`);
    console.log("━".repeat(60));
    console.log(`🎯 Migrating: ${this.componentName}\n`);

    if (!this.componentName) {
      console.log("❌ Error: Component name required");
      console.log("Usage: npm run migrate:from-bundui sidebar");
      return;
    }

    await this.analyzeComponent();
    await this.performMigration();
    this.generateReport();
  }

  /**
   * Analyze the component before migration
   */
  async analyzeComponent() {
    console.log("🔍 Analyzing component...");

    // Find component in reference
    const refComponentPath = this.findComponent(this.referenceRoot, this.componentName);
    if (!refComponentPath) {
      this.errors.push(`Component '${this.componentName}' not found in bundui-reference`);
      return;
    }

    // Check if component already exists in dashboard
    const dashComponentPath = this.findComponent(this.dashboardRoot, this.componentName);
    if (dashComponentPath) {
      this.warnings.push(`Component '${this.componentName}' already exists in dashboard`);
      this.warnings.push(`Existing: ${path.relative(this.dashboardRoot, dashComponentPath)}`);
    }

    // Analyze dependencies
    await this.analyzeDependencies(refComponentPath);

    // Analyze imports
    await this.analyzeImports(refComponentPath);

    console.log(`✅ Component found: ${path.relative(this.referenceRoot, refComponentPath)}`);
  }

  /**
   * Perform the actual migration
   */
  async performMigration() {
    console.log("\n🚀 Performing migration...");

    if (this.errors.length > 0) {
      console.log("❌ Cannot migrate due to errors. Fix them first.");
      return;
    }

    const refComponentPath = this.findComponent(this.referenceRoot, this.componentName);
    if (!refComponentPath) return;

    // Determine target path in dashboard
    const targetPath = this.determineTargetPath(refComponentPath);

    // Ensure target directory exists
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      this.actions.push(`Created directory: ${path.relative(this.dashboardRoot, targetDir)}`);
    }

    // Copy component with path fixes
    await this.copyComponentWithFixes(refComponentPath, targetPath);

    // Update imports in the component
    await this.fixComponentImports(targetPath);

    // Copy related files if needed
    await this.copyRelatedFiles(refComponentPath, targetPath);
  }

  /**
   * Find component in directory tree
   */
  findComponent(rootPath, componentName) {
    const searchPaths = [
      path.join(rootPath, "components/ui", `${componentName}.tsx`),
      path.join(rootPath, "components", `${componentName}.tsx`),
      path.join(rootPath, "components/layout", `${componentName}.tsx`),
      path.join(rootPath, "components/theme-customizer", `${componentName}.tsx`),
      path.join(
        rootPath,
        "src/shared/components/bundui-premium/components/ui",
        `${componentName}.tsx`
      ),
      path.join(
        rootPath,
        "src/shared/components/bundui-premium/components/layout",
        `${componentName}.tsx`
      ),
      path.join(
        rootPath,
        "src/shared/components/bundui-premium/components/theme-customizer",
        `${componentName}.tsx`
      ),
    ];

    // Also search recursively
    const recursiveSearch = (dirPath, maxDepth = 3) => {
      if (maxDepth <= 0 || !fs.existsSync(dirPath)) return null;

      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isFile() && (item === `${componentName}.tsx` || item === `${componentName}.ts`)) {
          return fullPath;
        } else if (stat.isDirectory() && !item.startsWith(".") && item !== "node_modules") {
          const found = recursiveSearch(fullPath, maxDepth - 1);
          if (found) return found;
        }
      }
      return null;
    };

    // Try direct paths first
    for (const searchPath of searchPaths) {
      if (fs.existsSync(searchPath)) {
        return searchPath;
      }
    }

    // Try recursive search
    return (
      recursiveSearch(path.join(rootPath, "components")) ||
      recursiveSearch(path.join(rootPath, "src"))
    );
  }

  /**
   * Analyze component dependencies
   */
  async analyzeDependencies(componentPath) {
    const content = fs.readFileSync(componentPath, "utf8");

    // Find npm package imports
    const importMatches = content.match(/import.*from ['"`]([^'"`]+)['"`]/g) || [];
    const npmPackages = importMatches
      .map((imp) => imp.match(/from ['"`]([^'"`]+)['"`]/)[1])
      .filter((pkg) => !pkg.startsWith(".") && !pkg.startsWith("/"))
      .filter((pkg, index, arr) => arr.indexOf(pkg) === index);

    if (npmPackages.length > 0) {
      console.log(`📦 Dependencies found: ${npmPackages.join(", ")}`);

      // Check if dashboard has these dependencies
      const dashPkg = this.readJson(path.join(this.dashboardRoot, "package.json"));
      const missing = npmPackages.filter(
        (pkg) => !dashPkg.dependencies?.[pkg] && !dashPkg.devDependencies?.[pkg]
      );

      if (missing.length > 0) {
        this.warnings.push(`Missing dependencies in dashboard: ${missing.join(", ")}`);
        this.warnings.push(`Run: cd apps/dashboard && npm install ${missing.join(" ")}`);
      }
    }
  }

  /**
   * Analyze component imports
   */
  async analyzeImports(componentPath) {
    const content = fs.readFileSync(componentPath, "utf8");

    // Find relative imports
    const relativeImports = content.match(/import.*from ['"`](\.[^'"`]+)['"`]/g) || [];

    if (relativeImports.length > 0) {
      console.log(`🔗 Relative imports found: ${relativeImports.length}`);
      relativeImports.forEach((imp) => {
        const importPath = imp.match(/from ['"`](\.[^'"`]+)['"`]/)[1];
        console.log(`   ${importPath}`);
      });
    }
  }

  /**
   * Determine target path in dashboard
   */
  determineTargetPath(refComponentPath) {
    const relativePath = path.relative(this.referenceRoot, refComponentPath);

    // Map reference paths to dashboard paths
    if (relativePath.startsWith("components/ui/")) {
      return path.join(
        this.dashboardRoot,
        "src/shared/components/bundui-premium/components/ui",
        path.basename(refComponentPath)
      );
    } else if (relativePath.startsWith("components/layout/")) {
      return path.join(
        this.dashboardRoot,
        "src/shared/components/bundui-premium/components/layout",
        path.basename(refComponentPath)
      );
    } else if (relativePath.startsWith("components/theme-customizer/")) {
      return path.join(
        this.dashboardRoot,
        "src/shared/components/bundui-premium/components/theme-customizer",
        path.basename(refComponentPath)
      );
    } else if (relativePath.startsWith("components/")) {
      return path.join(
        this.dashboardRoot,
        "src/shared/components/bundui-premium/components",
        path.basename(refComponentPath)
      );
    }

    // Default location
    return path.join(
      this.dashboardRoot,
      "src/shared/components/bundui-premium/components",
      path.basename(refComponentPath)
    );
  }

  /**
   * Copy component with path fixes
   */
  async copyComponentWithFixes(sourcePath, targetPath) {
    let content = fs.readFileSync(sourcePath, "utf8");

    // Fix import paths for dashboard structure
    content = this.fixImportPaths(content);

    fs.writeFileSync(targetPath, content);
    this.actions.push(
      `Copied: ${path.basename(sourcePath)} → ${path.relative(this.dashboardRoot, targetPath)}`
    );
  }

  /**
   * Fix import paths for dashboard structure
   */
  fixImportPaths(content) {
    // Common import path fixes
    const fixes = [
      // UI components
      {
        from: /from ['"`]\.\.\/ui\/([^'"`]+)['"`]/g,
        to: 'from "../ui/$1"',
      },
      // Theme customizer
      {
        from: /from ['"`]\.\.\/theme-customizer\/([^'"`]+)['"`]/g,
        to: 'from "../theme-customizer/$1"',
      },
      // Utils
      {
        from: /from ['"`]\.\.\/lib\/utils['"`]/g,
        to: 'from "@/shared/lib/utils"',
      },
      // Hooks
      {
        from: /from ['"`]\.\.\/hooks\/([^'"`]+)['"`]/g,
        to: 'from "@/shared/hooks/$1"',
      },
    ];

    fixes.forEach((fix) => {
      content = content.replace(fix.from, fix.to);
    });

    return content;
  }

  /**
   * Copy related files (CSS, types, etc.)
   */
  async copyRelatedFiles(refComponentPath, targetPath) {
    const componentDir = path.dirname(refComponentPath);
    const componentName = path.basename(refComponentPath, ".tsx");

    // Look for related files
    const relatedPatterns = [
      `${componentName}.module.css`,
      `${componentName}.css`,
      `${componentName}.types.ts`,
      `index.ts`,
    ];

    relatedPatterns.forEach((pattern) => {
      const relatedPath = path.join(componentDir, pattern);
      if (fs.existsSync(relatedPath)) {
        const targetRelatedPath = path.join(path.dirname(targetPath), pattern);
        fs.copyFileSync(relatedPath, targetRelatedPath);
        this.actions.push(`Copied related: ${pattern}`);
      }
    });
  }

  /**
   * Update imports in the migrated component
   */
  async fixComponentImports(componentPath) {
    // This would contain more sophisticated import fixing
    // For now, we rely on the initial path fixes
  }

  /**
   * Generate migration report
   */
  generateReport() {
    console.log("\n" + "━".repeat(60));
    console.log("📊 MIGRATION REPORT");
    console.log("━".repeat(60));

    if (this.errors.length > 0) {
      console.log("\n❌ Errors:");
      this.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log("\n⚠️  Warnings:");
      this.warnings.forEach((warning, i) => {
        console.log(`  ${i + 1}. ${warning}`);
      });
    }

    if (this.actions.length > 0) {
      console.log("\n✅ Actions Completed:");
      this.actions.forEach((action, i) => {
        console.log(`  ${i + 1}. ${action}`);
      });
    }

    console.log("\n💡 Next Steps:");
    console.log("  1. Test the migrated component in dashboard");
    console.log("  2. Update any remaining import paths manually");
    console.log("  3. Run: npm run dev:dashboard to verify");
    console.log("  4. Compare: http://localhost:3001 vs http://localhost:3004");

    console.log("\n" + "━".repeat(60));

    const status = this.errors.length === 0 ? "SUCCESS" : "FAILED";
    console.log(`🎯 MIGRATION STATUS: ${status}`);
    console.log("━".repeat(60));
  }

  /**
   * Utility methods
   */
  readJson(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
      }
    } catch (error) {
      return null;
    }
    return null;
  }
}

// Run migration
if (require.main === module) {
  const componentName = process.argv[2];
  const migrator = new BunduiComponentMigrator(componentName);
  migrator.migrate();
}

module.exports = BunduiComponentMigrator;
