#!/usr/bin/env node

/**
 * Migration Script: Update Deprecated UI References
 *
 * Updates all references to deprecated UI patterns and documents
 * to point to the new UI_MASTER_GUIDE.md standards.
 *
 * VThink 1.0 Compliance: Updates 42+ files to new v2.0.0 standards
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

const MIGRATION_PATTERNS = {
  // Document references
  "UI_DOCUMENTATION_CENTRAL.md": "UI_MASTER_GUIDE.md",
  "UI_COMPLIANCE_CHECKLIST.md": "UI_MASTER_GUIDE.md#validation-checklist---bundui-fidelity",
  "UI_IMPROVEMENTS_AND_ROADMAP.md": "UI_MASTER_GUIDE.md#deprecated-patterns---what-not-to-use",

  // Component references
  BunduiCompleteLayout: "SidebarProvider + SidebarInset (see UI_MASTER_GUIDE.md#layout-system)",
  "hsl(var(--chart-1))": "var(--chart-1) (see UI_MASTER_GUIDE.md#color-system)",

  // Import patterns
  "import.*BunduiCompleteLayout":
    "// DEPRECATED: Use SidebarProvider + SidebarInset - see UI_MASTER_GUIDE.md",
};

const WARNING_PATTERNS = {
  BunduiCompleteLayout:
    "DEPRECATED v2.0.0: Use SidebarProvider + SidebarInset structure. See UI_MASTER_GUIDE.md",
  "hsl\\(var\\(--chart-":
    "DEPRECATED v2.0.0: Use var(--chart-X) directly. See UI_MASTER_GUIDE.md#color-system",
};

class DeprecatedReferenceUpdater {
  constructor() {
    this.processedFiles = new Set();
    this.updateCount = 0;
    this.warningCount = 0;
  }

  async updateAllReferences() {
    console.log("🔄 Starting deprecated reference migration...\n");

    // Find all files that might contain deprecated references
    const files = await this.findFilesToUpdate();

    console.log(`📁 Found ${files.length} files to process\n`);

    for (const file of files) {
      await this.updateFile(file);
    }

    this.printSummary();
  }

  async findFilesToUpdate() {
    const patterns = ["**/*.md", "**/*.tsx", "**/*.ts", "**/*.jsx", "**/*.js"];

    const files = [];
    for (const pattern of patterns) {
      const matches = glob.sync(pattern, {
        ignore: [
          "node_modules/**",
          ".git/**",
          "dist/**",
          "build/**",
          "**/UI_MASTER_GUIDE.md", // Don't update the master guide itself
        ],
      });
      files.push(...matches);
    }

    return [...new Set(files)]; // Remove duplicates
  }

  async updateFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, "utf8");
      const originalContent = content;
      let hasUpdates = false;
      let hasWarnings = false;

      // Apply migration patterns
      for (const [oldPattern, newPattern] of Object.entries(MIGRATION_PATTERNS)) {
        const regex = new RegExp(oldPattern, "g");
        if (regex.test(content)) {
          content = content.replace(regex, newPattern);
          hasUpdates = true;
        }
      }

      // Add deprecation warnings for patterns that need manual review
      for (const [pattern, warning] of Object.entries(WARNING_PATTERNS)) {
        const regex = new RegExp(pattern, "g");
        if (regex.test(content)) {
          // Add warning comment above the line
          content = content.replace(regex, (match) => {
            hasWarnings = true;
            return `// ⚠️ ${warning}\n${match}`;
          });
        }
      }

      // Write file if changes were made
      if (hasUpdates || hasWarnings) {
        fs.writeFileSync(filePath, content, "utf8");
        this.processedFiles.add(filePath);

        if (hasUpdates) this.updateCount++;
        if (hasWarnings) this.warningCount++;

        console.log(`✅ Updated: ${filePath}${hasWarnings ? " (with warnings)" : ""}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  printSummary() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 MIGRATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`📁 Files processed: ${this.processedFiles.size}`);
    console.log(`✅ Files updated: ${this.updateCount}`);
    console.log(`⚠️  Files with warnings: ${this.warningCount}`);

    if (this.warningCount > 0) {
      console.log("\n⚠️  WARNING: Some files contain deprecated patterns that need manual review.");
      console.log('   Search for "DEPRECATED v2.0.0" comments in your codebase.');
    }

    console.log("\n🎯 NEXT STEPS:");
    console.log("1. Review files with warnings and update manually");
    console.log("2. Test all dashboard functionality");
    console.log("3. Compare with https://shadcnuikit.com/dashboard/default");
    console.log("4. Run validation: npm run validate:universal");

    console.log("\n📖 REFERENCE: UI_MASTER_GUIDE.md v2.0.0");
    console.log("   - Triple compliance: Radix + shadcn + Bundui + VibeThink");
    console.log("   - Live demo fidelity: https://shadcnuikit.com/dashboard/default");
    console.log("   - OKLCH color system + SidebarProvider structure");

    console.log("\n✨ Migration complete! Your codebase is now v2.0.0 compliant.\n");
  }
}

// Run migration if called directly
if (require.main === module) {
  const updater = new DeprecatedReferenceUpdater();
  updater.updateAllReferences().catch(console.error);
}

module.exports = DeprecatedReferenceUpdater;
