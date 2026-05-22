#!/usr/bin/env node

/**
 * 🔍 Bundui Implementation Comparator
 * Compares bundui-reference (official) vs dashboard (our implementation)
 *
 * Run: npm run compare:bundui-dashboard
 */

const fs = require("fs");
const path = require("path");

class BunduiComparator {
  constructor() {
    this.referenceRoot = path.join(process.cwd(), "apps/bundui-reference");
    this.dashboardRoot = path.join(process.cwd(), "apps/dashboard");
    this.differences = [];
    this.similarities = [];
    this.suggestions = [];
  }

  /**
   * Main comparison entry point
   */
  async compare() {
    console.log("🔍 Bundui Implementation Comparator\n");
    console.log("━".repeat(60));

    this.comparePackageJson();
    this.compareComponentStructure();
    this.compareTailwindConfig();
    this.compareThemeSystem();
    this.compareSidebarImplementations();

    this.generateReport();
  }

  /**
   * Compare package.json dependencies
   */
  comparePackageJson() {
    console.log("\n📦 Comparing dependencies...");

    const refPkg = this.readJson(path.join(this.referenceRoot, "package.json"));
    const dashPkg = this.readJson(path.join(this.dashboardRoot, "package.json"));

    if (!refPkg || !dashPkg) {
      this.differences.push({
        type: "MISSING_PACKAGE_JSON",
        severity: "ERROR",
        message: "Missing package.json in one of the applications",
      });
      return;
    }

    // Compare key dependencies
    const keyDeps = [
      "next",
      "react",
      "react-dom",
      "tailwindcss",
      "@radix-ui/react-accordion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-sidebar",
      "lucide-react",
      "recharts",
      "class-variance-authority",
    ];

    keyDeps.forEach((dep) => {
      const refVersion = refPkg.dependencies?.[dep] || refPkg.devDependencies?.[dep];
      const dashVersion = dashPkg.dependencies?.[dep] || dashPkg.devDependencies?.[dep];

      if (refVersion && dashVersion) {
        if (refVersion === dashVersion) {
          this.similarities.push({
            type: "DEPENDENCY_MATCH",
            dependency: dep,
            version: refVersion,
          });
        } else {
          this.differences.push({
            type: "VERSION_MISMATCH",
            severity: "WARNING",
            dependency: dep,
            reference: refVersion,
            dashboard: dashVersion,
            message: `Version mismatch for ${dep}: reference=${refVersion}, dashboard=${dashVersion}`,
          });
        }
      } else if (refVersion && !dashVersion) {
        this.differences.push({
          type: "MISSING_DEPENDENCY",
          severity: "ERROR",
          dependency: dep,
          version: refVersion,
          message: `Dashboard missing dependency: ${dep}@${refVersion}`,
        });
      } else if (!refVersion && dashVersion) {
        this.differences.push({
          type: "EXTRA_DEPENDENCY",
          severity: "INFO",
          dependency: dep,
          version: dashVersion,
          message: `Dashboard has extra dependency: ${dep}@${dashVersion}`,
        });
      }
    });
  }

  /**
   * Compare component structure
   */
  compareComponentStructure() {
    console.log("\n🏗️  Comparing component structure...");

    // Compare UI components
    const refUiPath = path.join(this.referenceRoot, "components/ui");
    const dashUiPath = path.join(
      this.dashboardRoot,
      "src/shared/components/bundui-premium/components/ui"
    );

    const refUiComponents = this.getComponentList(refUiPath);
    const dashUiComponents = this.getComponentList(dashUiPath);

    // Find missing components
    const missingInDash = refUiComponents.filter((comp) => !dashUiComponents.includes(comp));
    const extraInDash = dashUiComponents.filter((comp) => !refUiComponents.includes(comp));

    missingInDash.forEach((comp) => {
      this.differences.push({
        type: "MISSING_COMPONENT",
        severity: "ERROR",
        component: comp,
        message: `Dashboard missing UI component: ${comp}`,
      });
    });

    extraInDash.forEach((comp) => {
      this.differences.push({
        type: "EXTRA_COMPONENT",
        severity: "INFO",
        component: comp,
        message: `Dashboard has extra UI component: ${comp}`,
      });
    });

    // Common components
    const commonComponents = refUiComponents.filter((comp) => dashUiComponents.includes(comp));
    commonComponents.forEach((comp) => {
      this.similarities.push({
        type: "COMPONENT_MATCH",
        component: comp,
      });
    });
  }

  /**
   * Compare Tailwind configurations
   */
  compareTailwindConfig() {
    console.log("\n🎨 Comparing Tailwind configurations...");

    const refTailwind = this.readFile(path.join(this.referenceRoot, "tailwind.config.ts"));
    const dashTailwind = this.readFile(path.join(this.dashboardRoot, "tailwind.config.ts"));

    if (!refTailwind || !dashTailwind) {
      this.differences.push({
        type: "MISSING_TAILWIND_CONFIG",
        severity: "ERROR",
        message: "Missing Tailwind config in one of the applications",
      });
      return;
    }

    // Compare theme configuration patterns
    const refHasTheme = refTailwind.includes("extend:") && refTailwind.includes("colors:");
    const dashHasTheme = dashTailwind.includes("extend:") && dashTailwind.includes("colors:");

    if (refHasTheme && !dashHasTheme) {
      this.differences.push({
        type: "MISSING_THEME_CONFIG",
        severity: "WARNING",
        message: "Dashboard missing theme configuration in Tailwind",
      });
    }

    // Check for CSS variables usage
    const refUsesCssVars = refTailwind.includes("hsl(var(--");
    const dashUsesCssVars = dashTailwind.includes("hsl(var(--");

    if (refUsesCssVars && !dashUsesCssVars) {
      this.differences.push({
        type: "MISSING_CSS_VARIABLES",
        severity: "ERROR",
        message: "Dashboard not using CSS variables for theming like reference",
      });

      this.suggestions.push({
        type: "IMPLEMENT_CSS_VARIABLES",
        priority: "HIGH",
        action: "Implement CSS variables for theming",
        details: "Use hsl(var(--primary)) pattern like bundui-reference",
      });
    }
  }

  /**
   * Compare theme system implementations
   */
  compareThemeSystem() {
    console.log("\n🌙 Comparing theme systems...");

    // Check theme customizer
    const refThemeCustomizer = path.join(this.referenceRoot, "components/theme-customizer");
    const dashThemeCustomizer = path.join(
      this.dashboardRoot,
      "src/shared/components/bundui-premium/components/theme-customizer"
    );

    const refHasThemeCustomizer = fs.existsSync(refThemeCustomizer);
    const dashHasThemeCustomizer = fs.existsSync(dashThemeCustomizer);

    if (refHasThemeCustomizer && !dashHasThemeCustomizer) {
      this.differences.push({
        type: "MISSING_THEME_CUSTOMIZER",
        severity: "ERROR",
        message: "Dashboard missing theme customizer system",
      });

      this.suggestions.push({
        type: "IMPLEMENT_THEME_CUSTOMIZER",
        priority: "HIGH",
        action: "Copy theme customizer from bundui-reference",
        path: "components/theme-customizer → src/shared/components/bundui-premium/components/theme-customizer",
      });
    } else if (refHasThemeCustomizer && dashHasThemeCustomizer) {
      this.similarities.push({
        type: "THEME_SYSTEM_MATCH",
        message: "Both have theme customizer systems",
      });
    }
  }

  /**
   * Compare sidebar implementations
   */
  compareSidebarImplementations() {
    console.log("\n📂 Comparing sidebar implementations...");

    const refSidebar = this.findFiles(path.join(this.referenceRoot, "components"), "sidebar");
    const dashSidebar = this.findFiles(path.join(this.dashboardRoot, "src"), "sidebar");

    if (refSidebar.length > 0 && dashSidebar.length > 0) {
      // Compare sidebar structure
      const refSidebarContent = this.readFile(refSidebar[0]);
      const dashSidebarContent = this.readFile(dashSidebar[0]);

      if (refSidebarContent && dashSidebarContent) {
        // Check for key patterns
        const refUsesRadix = refSidebarContent.includes("@radix-ui/react-sidebar");
        const dashUsesRadix = dashSidebarContent.includes("@radix-ui/react-sidebar");

        if (refUsesRadix && !dashUsesRadix) {
          this.differences.push({
            type: "SIDEBAR_LIBRARY_MISMATCH",
            severity: "WARNING",
            message:
              "Reference uses @radix-ui/react-sidebar, dashboard might use different implementation",
          });
        }

        // Check for responsive patterns
        const refHasResponsive =
          refSidebarContent.includes("md:") || refSidebarContent.includes("lg:");
        const dashHasResponsive =
          dashSidebarContent.includes("md:") || dashSidebarContent.includes("lg:");

        if (refHasResponsive && !dashHasResponsive) {
          this.differences.push({
            type: "MISSING_RESPONSIVE_SIDEBAR",
            severity: "WARNING",
            message: "Dashboard sidebar might be missing responsive design patterns",
          });
        }
      }
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log("\n" + "━".repeat(60));
    console.log("📊 COMPARISON REPORT");
    console.log("━".repeat(60));

    // Summary
    console.log("\n📈 Summary:");
    console.log(`  Similarities: ${this.similarities.length}`);
    console.log(`  Differences: ${this.differences.length}`);
    console.log(`  Suggestions: ${this.suggestions.length}`);

    // Critical differences
    const errors = this.differences.filter((d) => d.severity === "ERROR");
    const warnings = this.differences.filter((d) => d.severity === "WARNING");

    if (errors.length > 0) {
      console.log("\n❌ Critical Issues:");
      errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error.message}`);
        if (error.dependency) {
          console.log(`     Dependency: ${error.dependency}`);
          if (error.reference) console.log(`     Reference: ${error.reference}`);
          if (error.dashboard) console.log(`     Dashboard: ${error.dashboard}`);
        }
      });
    }

    if (warnings.length > 0) {
      console.log("\n⚠️  Warnings:");
      warnings.forEach((warning, i) => {
        console.log(`  ${i + 1}. ${warning.message}`);
      });
    }

    // High priority suggestions
    const highPriority = this.suggestions.filter((s) => s.priority === "HIGH");
    if (highPriority.length > 0) {
      console.log("\n🚀 High Priority Actions:");
      highPriority.forEach((suggestion, i) => {
        console.log(`  ${i + 1}. ${suggestion.action}`);
        if (suggestion.details) console.log(`     Details: ${suggestion.details}`);
        if (suggestion.path) console.log(`     Path: ${suggestion.path}`);
      });
    }

    // Quick commands
    console.log("\n💡 Quick Actions:");
    console.log("  View reference: http://localhost:3004");
    console.log("  View dashboard: http://localhost:3001");
    console.log("  Migrate component: npm run migrate:from-bundui [component-name]");

    console.log("\n" + "━".repeat(60));

    const status =
      errors.length === 0 ? (warnings.length === 0 ? "EXCELLENT" : "GOOD") : "NEEDS_ATTENTION";

    console.log(`🎯 COMPATIBILITY STATUS: ${status}`);
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

  readFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, "utf8");
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  getComponentList(dirPath) {
    if (!fs.existsSync(dirPath)) return [];

    return fs
      .readdirSync(dirPath)
      .filter((file) => file.endsWith(".tsx") || file.endsWith(".ts"))
      .map((file) => path.basename(file, path.extname(file)));
  }

  findFiles(dirPath, namePattern) {
    const results = [];

    if (!fs.existsSync(dirPath)) return results;

    const scanDir = (currentPath) => {
      const items = fs.readdirSync(currentPath);

      items.forEach((item) => {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith(".") && item !== "node_modules") {
          scanDir(fullPath);
        } else if (stat.isFile() && item.toLowerCase().includes(namePattern.toLowerCase())) {
          results.push(fullPath);
        }
      });
    };

    scanDir(dirPath);
    return results;
  }
}

// Run comparison
if (require.main === module) {
  const comparator = new BunduiComparator();
  comparator.compare();
}

module.exports = BunduiComparator;
